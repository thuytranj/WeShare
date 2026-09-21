import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
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
