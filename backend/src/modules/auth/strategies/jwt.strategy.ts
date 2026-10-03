import { Injectable, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../../common/redis/redis.service';
import { UsersService } from '../../users/users.service';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '../../../common/exceptions/error-code.enum';
import { UserStatus } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'weshare-jwt-super-secret-key-change-in-production',
      ),
    });
  }

  async validate(payload: JwtPayload) {
    // Check if token JTI is blacklisted in Redis
    if (payload.jti) {
      const isBlacklisted = await this.redisService.get(`blacklist:token:${payload.jti}`);
      if (isBlacklisted) {
        throw new AppException(
          ErrorCode.TOKEN_REVOKED,
          'This session token has been revoked.',
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new AppException(
        ErrorCode.UNAUTHORIZED,
        'User associated with this token does not exist.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppException(
        ErrorCode.ACCOUNT_NOT_ACTIVE,
        'Account has been suspended.',
        HttpStatus.FORBIDDEN,
      );
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      jti: payload.jti,
    };
  }
}
