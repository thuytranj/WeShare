import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-code.enum';

export interface ErrorDetail {
  field?: string;
  message: string;
}

export class AppException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly errors?: ErrorDetail[];

  constructor(
    errorCode: ErrorCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    errors?: ErrorDetail[],
  ) {
    super(
      {
        statusCode,
        errorCode,
        message,
        errors,
      },
      statusCode,
    );
    this.errorCode = errorCode;
    this.errors = errors;
  }
}
