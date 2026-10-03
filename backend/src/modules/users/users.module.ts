import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserProfile } from './entities';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { StorageModule } from '../../integrations/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
    StorageModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
