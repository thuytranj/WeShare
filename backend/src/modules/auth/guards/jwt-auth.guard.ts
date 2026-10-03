import {
  Injectable,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '../../../common/exceptions/error-code.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new AppException(
          ErrorCode.TOKEN_EXPIRED,
          'Access token has expired. Please refresh your session.',
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw (
        err ||
        new AppException(
          ErrorCode.UNAUTHORIZED,
          'Unauthorized access. Please provide a valid Bearer token.',
          HttpStatus.UNAUTHORIZED,
        )
      );
    }
    return user;
  }
}
