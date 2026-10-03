import { Injectable, HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';
import { RedisService } from '../../../common/redis/redis.service';
import { RabbitMqProducer } from '../../../queue/rabbitmq-producer.service';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '../../../common/exceptions/error-code.enum';

interface OtpData {
  codeHash: string;
  attempts: number;
}

@Injectable()
export class OtpService {
  private readonly OTP_TTL_SECONDS = 600; // 10 minutes
  private readonly COOLDOWN_SECONDS = 60; // 60 seconds
  private readonly MAX_ATTEMPTS = 5;

  constructor(
    private readonly redisService: RedisService,
    private readonly rabbitProducer: RabbitMqProducer,
  ) {}

  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  async sendOtp(email: string, fullName: string): Promise<void> {
    const cooldownKey = `auth:otp:cooldown:${email.toLowerCase()}`;
    const inCooldown = await this.redisService.get(cooldownKey);
    if (inCooldown) {
      throw new AppException(
        ErrorCode.OTP_RESEND_COOLDOWN,
        'Please wait before requesting a new OTP.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const codeHash = this.hashOtp(otp);

    const otpKey = `auth:otp:${email.toLowerCase()}`;
    const payload: OtpData = {
      codeHash,
      attempts: 0,
    };

    await this.redisService.set(otpKey, JSON.stringify(payload), this.OTP_TTL_SECONDS);
    await this.redisService.set(cooldownKey, '1', this.COOLDOWN_SECONDS);

    // Emit async email event
    await this.rabbitProducer.publish('weshare.topic', 'email.otp.send', {
      email,
      fullName,
      otp,
      expiresInMinutes: 10,
    });
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const otpKey = `auth:otp:${email.toLowerCase()}`;
    const rawData = await this.redisService.get(otpKey);

    if (!rawData) {
      throw new AppException(
        ErrorCode.INVALID_OR_EXPIRED_OTP,
        'Invalid or expired OTP. Please request a new one.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const data: OtpData = JSON.parse(rawData);

    if (data.attempts >= this.MAX_ATTEMPTS) {
      await this.redisService.del(otpKey);
      throw new AppException(
        ErrorCode.OTP_MAX_ATTEMPTS_EXCEEDED,
        'Maximum verification attempts exceeded. Please request a new OTP.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const providedHash = this.hashOtp(otp);
    if (data.codeHash !== providedHash) {
      data.attempts += 1;
      if (data.attempts >= this.MAX_ATTEMPTS) {
        await this.redisService.del(otpKey);
        throw new AppException(
          ErrorCode.OTP_MAX_ATTEMPTS_EXCEEDED,
          'Maximum verification attempts exceeded. Please request a new OTP.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      } else {
        const remainingTtl = await this.redisService.ttl(otpKey);
        await this.redisService.set(
          otpKey,
          JSON.stringify(data),
          remainingTtl > 0 ? remainingTtl : this.OTP_TTL_SECONDS,
        );
      }

      throw new AppException(
        ErrorCode.INVALID_OR_EXPIRED_OTP,
        'Invalid or expired OTP.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // OTP is valid - clean up
    await this.redisService.del(otpKey);
    const cooldownKey = `auth:otp:cooldown:${email.toLowerCase()}`;
    await this.redisService.del(cooldownKey);

    return true;
  }
}
