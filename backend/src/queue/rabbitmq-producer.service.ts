import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMqProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqProducer.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private isConnecting = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect(): Promise<void> {
    if (this.isConnecting || this.channel) {
      return;
    }
    this.isConnecting = true;

    const rabbitUrl = this.configService.get<string>(
      'RABBITMQ_URL',
      'amqp://guest:guest@localhost:5672',
    );

    try {
      this.connection = await amqp.connect(rabbitUrl);
      this.channel = await this.connection.createChannel();

      // Assert default exchange
      await this.channel.assertExchange('weshare.topic', 'topic', { durable: true });

      this.connection.on('error', (err: any) => {
        this.logger.error(`RabbitMQ connection error: ${err.message}`);
        this.channel = null;
        this.connection = null;
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed. Reconnecting in 5s...');
        this.channel = null;
        this.connection = null;
        setTimeout(() => this.connect(), 5000);
      });

      this.logger.log('Connected to RabbitMQ broker and asserted topic exchange weshare.topic');
    } catch (err: any) {
      this.logger.warn(`Could not connect to RabbitMQ: ${err.message}. Messages will fail or retry.`);
    } finally {
      this.isConnecting = false;
    }
  }

  async publish(exchange: string, routingKey: string, message: Record<string, any>): Promise<boolean> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      if (!this.channel) {
        this.logger.warn(
          `RabbitMQ channel unavailable. Skipping publish to ${exchange}:${routingKey} for payload: ${JSON.stringify(
            message,
          )}`,
        );
        return false;
      }

      const content = Buffer.from(JSON.stringify(message));
      return this.channel.publish(exchange, routingKey, content, {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to publish message to ${exchange}:${routingKey}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (err: any) {
      this.logger.error(`Error closing RabbitMQ connection: ${err.message}`);
    }
  }
}
