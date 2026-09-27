import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrapWorker() {
  const logger = new Logger('WorkerBootstrap');
  logger.log('Starting WeShare Background Worker (RabbitMQ consumers & Scheduled cron jobs)...');

  const app = await NestFactory.createApplicationContext(AppModule);

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  logger.log('WeShare Background Worker is running in standalone mode.');

  // Keep event loop active until process receives termination signal
  await new Promise<void>((resolve) => {
    const keepAliveTimer = setInterval(() => {}, 1000 * 60 * 60);
    const shutdown = () => {
      clearInterval(keepAliveTimer);
      resolve();
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  });

  await app.close();
}

bootstrapWorker();
