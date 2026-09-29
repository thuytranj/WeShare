import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { MailerService, SendOtpEmailOptions } from '../../integrations/resend/mailer.service';

@Injectable()
export class EmailConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailConsumer.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private isConnecting = false;

  private readonly QUEUE_NAME = 'email.send.queue';
  private readonly EXCHANGE_NAME = 'weshare.topic';
  private readonly DLX_EXCHANGE = 'weshare.dlx';
  private readonly DLQ_NAME = 'weshare.dead_letter_queue';

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async onModuleInit() {
    await this.connectAndConsume();
  }

  private async connectAndConsume(): Promise<void> {
    if (this.isConnecting || this.channel) {
      return;
    }
    this.isConnecting = true;

    const rabbitUrl =
      this.configService.get<string>('RABBITMQ_URL') ||
      this.configService.get<string>('RABBITMQ_URI') ||
      'amqp://weshare:weshare_secret@localhost:5672';

    try {
      this.connection = await amqp.connect(rabbitUrl);
      this.channel = await this.connection.createChannel();

      // Ensure fair dispatch: 1 unacked message at a time per consumer
      await this.channel.prefetch(1);

      // 1. Declare Dead Letter Exchange & Queue
      await this.channel.assertExchange(this.DLX_EXCHANGE, 'direct', { durable: true });
      await this.channel.assertQueue(this.DLQ_NAME, { durable: true });
      await this.channel.bindQueue(this.DLQ_NAME, this.DLX_EXCHANGE, 'dlx.email');

      // 2. Declare Topic Exchange
      await this.channel.assertExchange(this.EXCHANGE_NAME, 'topic', { durable: true });

      // 3. Declare Email Queue with DLX configuration
      await this.channel.assertQueue(this.QUEUE_NAME, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': this.DLX_EXCHANGE,
          'x-dead-letter-routing-key': 'dlx.email',
        },
      });

      // 4. Bind queue to topic exchange for all email events (use # to match multi-word keys like email.otp.send)
      await this.channel.bindQueue(this.QUEUE_NAME, this.EXCHANGE_NAME, 'email.#');

      this.connection.on('error', (err: any) => {
        this.logger.error(`RabbitMQ Consumer error: ${err.message}`);
        this.channel = null;
        this.connection = null;
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ Consumer connection closed. Reconnecting in 5s...');
        this.channel = null;
        this.connection = null;
        setTimeout(() => this.connectAndConsume(), 5000);
      });

      // 5. Start consuming messages
      await this.channel.consume(
        this.QUEUE_NAME,
        async (msg) => {
          if (!msg) return;

          const routingKey = msg.fields.routingKey;
          try {
            const content = JSON.parse(msg.content.toString());
            this.logger.log(`📥 Received message [${routingKey}] for ${content.email}`);

            if (routingKey === 'email.otp.send') {
              const otpOptions: SendOtpEmailOptions = {
                to: content.email,
                fullName: content.fullName,
                otp: content.otp,
                expiresInMinutes: content.expiresInMinutes || 10,
              };

              await this.mailerService.sendOtpEmail(otpOptions);
            } else {
              this.logger.warn(`Unhandled email routing key: ${routingKey}`);
            }

            // Acknowledge message on completion
            this.channel?.ack(msg);
          } catch (error: any) {
            this.logger.error(
              `Error processing queue message [${routingKey}]: ${error.message}`,
              error.stack,
            );
            // Negative acknowledge without requeue (sends to Dead Letter Exchange)
            this.channel?.nack(msg, false, false);
          }
        },
        { noAck: false },
      );

      this.logger.log(`🐇 EmailConsumer is listening on queue "${this.QUEUE_NAME}" (routing: email.*)`);
    } catch (err: any) {
      this.logger.warn(`Could not start EmailConsumer: ${err.message}. Retrying in 5s...`);
      setTimeout(() => this.connectAndConsume(), 5000);
    } finally {
      this.isConnecting = false;
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
      this.logger.error(`Error shutting down EmailConsumer: ${err.message}`);
    }
  }
}
