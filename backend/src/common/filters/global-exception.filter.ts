import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException, ErrorDetail } from '../exceptions/app.exception';
import { ErrorCode } from '../exceptions/error-code.enum';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let errors: ErrorDetail[] = [];

    if (exception instanceof AppException) {
      statusCode = exception.getStatus();
      errorCode = exception.errorCode;
      message = exception.message;
      errors = exception.errors || [];
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const respObj = exceptionResponse as Record<string, any>;
        if (respObj.errorCode && typeof respObj.errorCode === 'string') {
          errorCode = respObj.errorCode as ErrorCode;
        } else {
          errorCode = this.mapStatusToErrorCode(statusCode);
        }

        if (Array.isArray(respObj.message)) {
          message = 'Validation failed';
          errors = respObj.message.map((msg: any) => {
            if (typeof msg === 'string') {
              return { message: msg };
            }
            return msg;
          });
        } else if (typeof respObj.message === 'string') {
          message = respObj.message;
        }

        if (Array.isArray(respObj.errors)) {
          errors = respObj.errors;
        }
      }

      if (errorCode === ErrorCode.INTERNAL_SERVER_ERROR) {
        errorCode = this.mapStatusToErrorCode(statusCode);
      }
    } else {
      // Unhandled runtime error
      this.logger.error(
        `Unhandled Exception on ${request.method} ${request.url}: ${(exception as Error)?.message || exception}`,
        (exception as Error)?.stack,
      );
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
    }

    response.status(statusCode).json({
      statusCode,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      errors: errors.length > 0 ? errors : undefined,
    });
  }

  private mapStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.TOO_MANY_REQUESTS;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }
}
