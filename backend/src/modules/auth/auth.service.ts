import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { User, UserStatus } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { OtpService } from './services/otp.service';
import { RedisService } from '../../common/redis/redis.service';
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ResendOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/exceptions/error-code.enum';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthSuccessResponse extends TokenResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    role: string;
  };
}

@Injectable()
export class AuthService {
  private readonly REFRESH_TOKEN_TTL_DAYS = 7;
  private readonly ACCESS_TOKEN_TTL_SECONDS = 900; // 15 minutes

  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(dto: RegisterDto): Promise<{ message: string; email: string }> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        throw new AppException(
          ErrorCode.EMAIL_ALREADY_EXISTS,
          'An account with this email address already exists.',
          HttpStatus.CONFLICT,
        );
      }
      // Unverified account: update credentials and resend OTP
      existingUser.passwordHash = await bcrypt.hash(dto.password, 10);
      existingUser.fullName = dto.fullName;
      await this.otpService.sendOtp(dto.email, dto.fullName);
      return {
        message: 'Registration pending. A new OTP has been dispatched to your email.',
        email: dto.email,
      };
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.usersService.createLocalUser({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
    });

    await this.otpService.sendOtp(dto.email, dto.fullName);

    return {
      message: 'Registration successful. Please verify your email with the OTP sent.',
      email: dto.email,
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<AuthSuccessResponse> {
    await this.otpService.verifyOtp(dto.email, dto.otp);

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User record not found for this email.',
        HttpStatus.NOT_FOUND,
      );
    }

    const activatedUser = await this.usersService.activateUser(user.id);
    const tokens = await this.generateTokens(activatedUser);

    return {
      ...tokens,
      user: {
        id: activatedUser.id,
        email: activatedUser.email,
        fullName: activatedUser.fullName,
        avatarUrl: activatedUser.avatarUrl,
        role: activatedUser.role,
      },
    };
  }

  async resendOtp(dto: ResendOtpDto): Promise<{ message: string; email: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User record not found for this email.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.isEmailVerified) {
      throw new AppException(
        ErrorCode.ACCOUNT_ALREADY_VERIFIED,
        'This account email is already verified.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.otpService.sendOtp(dto.email, user.fullName);

    return {
      message: 'A fresh verification OTP has been dispatched to your email.',
      email: dto.email,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; email: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (user) {
      await this.otpService.sendOtp(dto.email, user.fullName);
    }

    return {
      message: 'If this email is registered, a password reset code has been dispatched.',
      email: dto.email,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    await this.otpService.verifyOtp(dto.email, dto.otp);

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User record not found for this email.',
        HttpStatus.NOT_FOUND,
      );
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePassword(user.id, passwordHash);

    // Revoke all existing refresh tokens for security
    await this.refreshTokenRepository.update(
      { userId: user.id },
      { isRevoked: true },
    );

    return {
      message: 'Password has been successfully updated. You may now sign in with your new credentials.',
    };
  }

  async login(dto: LoginDto): Promise<AuthSuccessResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new AppException(
        ErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppException(
        ErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.isEmailVerified) {
      throw new AppException(
        ErrorCode.EMAIL_NOT_VERIFIED,
        'Email address is not verified. Please verify your email first.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppException(
        ErrorCode.ACCOUNT_NOT_ACTIVE,
        'This account has been suspended.',
        HttpStatus.FORBIDDEN,
      );
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    };
  }

  async handleOAuthLogin(params: {
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    provider: 'google' | 'github';
    providerId: string;
  }): Promise<AuthSuccessResponse> {
    const user = await this.usersService.createOrUpdateOAuthUser(params);

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppException(
        ErrorCode.ACCOUNT_NOT_ACTIVE,
        'This account has been suspended.',
        HttpStatus.FORBIDDEN,
      );
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    };
  }

  async generateTokens(user: User, existingFamilyId?: string): Promise<TokenResponse> {
    const jti = crypto.randomUUID();
    const familyId = existingFamilyId || crypto.randomUUID();

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        jti,
      },
      {
        expiresIn: `${this.ACCESS_TOKEN_TTL_SECONDS}s`,
      },
    );

    const refreshTokenPlain = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(refreshTokenPlain);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_TTL_DAYS);

    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      familyId,
      isRevoked: false,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken: refreshTokenPlain,
      tokenType: 'Bearer',
      expiresIn: this.ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  async refreshTokens(refreshTokenStr: string): Promise<TokenResponse> {
    const tokenHash = this.hashToken(refreshTokenStr);

    const storedToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
    });

    if (!storedToken) {
      throw new AppException(
        ErrorCode.TOKEN_INVALID,
        'Invalid or unrecognized refresh token.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Refresh Token Reuse Anomaly Detection
    if (storedToken.isRevoked) {
      await this.refreshTokenRepository.update(
        { familyId: storedToken.familyId },
        { isRevoked: true },
      );

      throw new AppException(
        ErrorCode.TOKEN_REUSE_DETECTED,
        'Compromised refresh token reuse detected. All active sessions in this family have been terminated.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (new Date() > storedToken.expiresAt) {
      throw new AppException(
        ErrorCode.TOKEN_EXPIRED,
        'Refresh token has expired. Please sign in again.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Revoke old token
    storedToken.isRevoked = true;
    await this.refreshTokenRepository.save(storedToken);

    // Issue new pair with same family ID
    const user = await this.usersService.findById(storedToken.userId);
    if (!user) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'User associated with refresh token not found.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.generateTokens(user, storedToken.familyId);
  }

  async logout(userId: string, jti?: string, refreshTokenStr?: string): Promise<{ message: string }> {
    if (refreshTokenStr) {
      const tokenHash = this.hashToken(refreshTokenStr);
      await this.refreshTokenRepository.update({ tokenHash }, { isRevoked: true });
    }

    if (jti) {
      // Blacklist token in Redis for its remaining lifespan (max 15 mins)
      await this.redisService.set(`blacklist:token:${jti}`, '1', this.ACCESS_TOKEN_TTL_SECONDS);
    }

    return { message: 'Logout successful.' };
  }
}
