import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, HttpStatus, ValidationError } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AppException, ErrorCode } from './common/exceptions';

function formatValidationErrors(errors: ValidationError[]): { field: string; message: string }[] {
  const result: { field: string; message: string }[] = [];
  for (const error of errors) {
    if (error.constraints) {
      for (const key of Object.keys(error.constraints)) {
        result.push({
          field: error.property,
          message: error.constraints[key],
        });
      }
    }
    if (error.children && error.children.length > 0) {
      const childErrors = formatValidationErrors(error.children);
      for (const child of childErrors) {
        result.push({
          field: `${error.property}.${child.field}`,
          message: child.message,
        });
      }
    }
  }
  return result;
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global Validation Pipe with structured exception factory
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = formatValidationErrors(validationErrors);
        return new AppException(
          ErrorCode.VALIDATION_ERROR,
          'Validation failed',
          HttpStatus.BAD_REQUEST,
          errors,
        );
      },
    }),
  );

  // CORS Configuration
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('WeShare REST API')
    .setDescription('WeShare High-Performance Social Network API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 WeShare API Server is running on: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
