import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findByOAuth(provider: 'google' | 'github', providerId: string): Promise<User | null> {
    if (provider === 'google') {
      return this.userRepository.findOne({ where: { googleId: providerId } });
    }
    return this.userRepository.findOne({ where: { githubId: providerId } });
  }

  async createLocalUser(params: {
    email: string;
    passwordHash: string;
    fullName: string;
  }): Promise<User> {
    const user = this.userRepository.create({
      email: params.email.toLowerCase(),
      passwordHash: params.passwordHash,
      fullName: params.fullName,
      status: UserStatus.PENDING,
      role: UserRole.USER,
      isEmailVerified: false,
    });
    return this.userRepository.save(user);
  }

  async createOrUpdateOAuthUser(params: {
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    provider: 'google' | 'github';
    providerId: string;
  }): Promise<User> {
    let user = await this.findByEmail(params.email);

    if (user) {
      // Link OAuth account if not already linked
      let updated = false;
      if (params.provider === 'google' && !user.googleId) {
        user.googleId = params.providerId;
        updated = true;
      } else if (params.provider === 'github' && !user.githubId) {
        user.githubId = params.providerId;
        updated = true;
      }

      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        user.status = UserStatus.ACTIVE;
        updated = true;
      }

      if (!user.avatarUrl && params.avatarUrl) {
        user.avatarUrl = params.avatarUrl;
        updated = true;
      }

      if (updated) {
        user = await this.userRepository.save(user);
      }
      return user;
    }

    // New user via OAuth
    const newUser = this.userRepository.create({
      email: params.email.toLowerCase(),
      fullName: params.fullName,
      avatarUrl: params.avatarUrl,
      status: UserStatus.ACTIVE,
      role: UserRole.USER,
      isEmailVerified: true,
      googleId: params.provider === 'google' ? params.providerId : null,
      githubId: params.provider === 'github' ? params.providerId : null,
    });

    return this.userRepository.save(newUser);
  }

  async activateUser(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    user.isEmailVerified = true;
    user.status = UserStatus.ACTIVE;
    return this.userRepository.save(user);
  }
}
