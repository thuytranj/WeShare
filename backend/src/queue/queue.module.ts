import { Global, Module } from '@nestjs/common';
import { RabbitMqProducer } from './rabbitmq-producer.service';
import { EmailConsumer } from './consumers/email.consumer';
import { ResendModule } from '../integrations/resend/resend.module';

@Global()
@Module({
  imports: [ResendModule],
  providers: [RabbitMqProducer, EmailConsumer],
  exports: [RabbitMqProducer, EmailConsumer, ResendModule],
})
export class QueueModule {}
