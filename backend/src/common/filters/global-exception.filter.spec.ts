import { HttpStatus, HttpException, NotFoundException } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { AppException, ErrorCode } from '../exceptions';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: any;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockRequest = {
      method: 'POST',
      url: '/api/v1/auth/login',
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };
  });

  it('should handle custom AppException with specific error code and errors array', () => {
    const appException = new AppException(
      ErrorCode.INVALID_CREDENTIALS,
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
      [{ field: 'email', message: 'User not found' }],
    );

    filter.catch(appException, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.UNAUTHORIZED,
      errorCode: ErrorCode.INVALID_CREDENTIALS,
      message: 'Invalid email or password',
      timestamp: expect.any(String),
      path: '/api/v1/auth/login',
      errors: [{ field: 'email', message: 'User not found' }],
    });
  });

  it('should map standard HttpException to appropriate ErrorCode', () => {
    const notFoundException = new NotFoundException('Resource not found');

    filter.catch(notFoundException, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      errorCode: ErrorCode.NOT_FOUND,
      message: 'Resource not found',
      timestamp: expect.any(String),
      path: '/api/v1/auth/login',
      errors: undefined,
    });
  });

  it('should format validation errors array from NestJS ValidationPipe', () => {
    const validationHttpException = new HttpException(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['email must be an email', 'password must be longer than 8 characters'],
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(validationHttpException, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: ErrorCode.BAD_REQUEST,
      message: 'Validation failed',
      timestamp: expect.any(String),
      path: '/api/v1/auth/login',
      errors: [
        { message: 'email must be an email' },
        { message: 'password must be longer than 8 characters' },
      ],
    });
  });

  it('should handle unknown runtime error safely as 500 INTERNAL_SERVER_ERROR without leaking internals', () => {
    const genericError = new Error('Database connection crashed unexpectedly');

    filter.catch(genericError, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      timestamp: expect.any(String),
      path: '/api/v1/auth/login',
      errors: undefined,
    });
  });
});
