import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomBytes, randomUUID } from 'crypto';
import { User, UserStatus, UserRole } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import {
  UpdateProfileDto,
  UserProfileResponseDto,
  PublicProfileResponseDto,
  CheckUsernameResponseDto,
  PresignedAvatarUrlRequestDto,
  PresignedCoverUrlRequestDto,
  PresignedUrlResponseDto,
} from './dto';
import { StorageService } from '../../integrations/storage/storage.service';
import { RabbitMqProducer } from '../../queue/rabbitmq-producer.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/exceptions/error-code.enum';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
    private readonly rabbitProducer: RabbitMqProducer,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['profile'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
  }

  async findByOAuth(provider: 'google' | 'github', providerId: string): Promise<User | null> {
    const where = provider === 'google' ? { googleId: providerId } : { githubId: providerId };
    return this.userRepository.findOne({
      where,
      relations: ['profile'],
    });
  }

  private async generateUniqueUsername(baseSeed: string): Promise<string> {
    let clean = baseSeed
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, '')
      .substring(0, 20);

    if (clean.length < 3) {
      clean = 'user';
    }

    let candidate = clean;
    let attempts = 0;

    while (attempts < 10) {
      const existing = await this.userProfileRepository.findOne({
        where: { username: candidate },
      });
      if (!existing) {
        return candidate;
      }
      const suffix = randomBytes(2).toString('hex');
      candidate = `${clean.substring(0, 24)}_${suffix}`;
      attempts++;
    }

    return `user_${randomBytes(4).toString('hex')}`;
  }

  async createLocalUser(params: {
    email: string;
    passwordHash: string;
    fullName: string;
  }): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(User, {
        email: params.email.toLowerCase(),
        passwordHash: params.passwordHash,
        fullName: params.fullName,
        status: UserStatus.PENDING,
        role: UserRole.USER,
        isEmailVerified: false,
      });

      const savedUser = await queryRunner.manager.save(user);

      const usernameSeed = params.email.split('@')[0] || params.fullName;
      const uniqueUsername = await this.generateUniqueUsername(usernameSeed);

      const profile = queryRunner.manager.create(UserProfile, {
        userId: savedUser.id,
        username: uniqueUsername,
        avatarUrl: null,
      });

      const savedProfile = await queryRunner.manager.save(profile);
      savedUser.profile = savedProfile;

      await queryRunner.commitTransaction();
      return savedUser;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
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

      // Ensure profile exists for existing OAuth user
      if (!user.profile) {
        const usernameSeed = params.email.split('@')[0] || params.fullName;
        const uniqueUsername = await this.generateUniqueUsername(usernameSeed);
        const profile = this.userProfileRepository.create({
          userId: user.id,
          username: uniqueUsername,
          avatarUrl: params.avatarUrl || user.avatarUrl || null,
        });
        user.profile = await this.userProfileRepository.save(profile);
      } else if (!user.profile.avatarUrl && params.avatarUrl) {
        user.profile.avatarUrl = params.avatarUrl;
        user.profile = await this.userProfileRepository.save(user.profile);
      }

      return user;
    }

    // New OAuth user
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newUser = queryRunner.manager.create(User, {
        email: params.email.toLowerCase(),
        fullName: params.fullName,
        avatarUrl: params.avatarUrl,
        status: UserStatus.ACTIVE,
        role: UserRole.USER,
        isEmailVerified: true,
        googleId: params.provider === 'google' ? params.providerId : null,
        githubId: params.provider === 'github' ? params.providerId : null,
      });

      const savedUser = await queryRunner.manager.save(newUser);

      const usernameSeed = params.email.split('@')[0] || params.fullName;
      const uniqueUsername = await this.generateUniqueUsername(usernameSeed);

      const profile = queryRunner.manager.create(UserProfile, {
        userId: savedUser.id,
        username: uniqueUsername,
        avatarUrl: params.avatarUrl || null,
      });

      savedUser.profile = await queryRunner.manager.save(profile);

      await queryRunner.commitTransaction();
      return savedUser;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async activateUser(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, `User with ID ${userId} not found`, HttpStatus.NOT_FOUND);
    }

    user.isEmailVerified = true;
    user.status = UserStatus.ACTIVE;
    return this.userRepository.save(user);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, `User with ID ${userId} not found`, HttpStatus.NOT_FOUND);
    }

    user.passwordHash = passwordHash;
    return this.userRepository.save(user);
  }

  // ==========================================
  // PROFILE MANAGEMENT
  // ==========================================

  private async ensureUserProfile(user: User): Promise<UserProfile> {
    if (user.profile) {
      return user.profile;
    }

    let profile = await this.userProfileRepository.findOne({
      where: { userId: user.id },
    });

    if (!profile) {
      const usernameSeed = user.email.split('@')[0] || user.fullName;
      const uniqueUsername = await this.generateUniqueUsername(usernameSeed);
      profile = this.userProfileRepository.create({
        userId: user.id,
        username: uniqueUsername,
        avatarUrl: user.avatarUrl || null,
      });
      profile = await this.userProfileRepository.save(profile);
    }

    user.profile = profile;
    return profile;
  }

  async getProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
    }

    const profile = await this.ensureUserProfile(user);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      username: profile.username,
      bio: profile.bio || null,
      avatarUrl: profile.avatarUrl || null,
      coverUrl: profile.coverUrl || null,
      location: profile.location || null,
      website: profile.website || null,
      dateOfBirth: profile.dateOfBirth || null,
      gender: profile.gender || null,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: profile.updatedAt || user.updatedAt,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfileResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: ['profile'],
      });

      if (!user) {
        throw new AppException(ErrorCode.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
      }

      let profile = user.profile;
      if (!profile) {
        profile = await queryRunner.manager.findOne(UserProfile, {
          where: { userId: user.id },
        });
      }

      if (!profile) {
        const usernameSeed = user.email.split('@')[0] || user.fullName;
        const uniqueUsername = await this.generateUniqueUsername(usernameSeed);
        profile = queryRunner.manager.create(UserProfile, {
          userId: user.id,
          username: uniqueUsername,
          avatarUrl: user.avatarUrl || null,
        });
        profile = await queryRunner.manager.save(profile);
      }

      if (dto.username) {
        const targetUsername = dto.username.toLowerCase();
        if (profile.username !== targetUsername) {
          const conflict = await queryRunner.manager.findOne(UserProfile, {
            where: { username: targetUsername },
          });
          if (conflict && conflict.userId !== userId) {
            throw new AppException(
              ErrorCode.USERNAME_ALREADY_EXISTS,
              `Username "${dto.username}" is already taken.`,
              HttpStatus.CONFLICT,
            );
          }
          profile.username = targetUsername;
        }
      }

      if (dto.fullName !== undefined) {
        user.fullName = dto.fullName.trim();
        await queryRunner.manager.save(user);
      }

      if (dto.bio !== undefined) profile.bio = dto.bio ? dto.bio.trim() : null;
      if (dto.location !== undefined) profile.location = dto.location ? dto.location.trim() : null;
      if (dto.website !== undefined) profile.website = dto.website ? dto.website.trim() : null;
      if (dto.dateOfBirth !== undefined) profile.dateOfBirth = dto.dateOfBirth || null;
      if (dto.gender !== undefined) profile.gender = dto.gender || null;

      const savedProfile = await queryRunner.manager.save(profile);
      user.profile = savedProfile;

      await queryRunner.commitTransaction();

      // Publish event to RabbitMQ
      await this.rabbitProducer.publish('weshare.topic', 'user.profile.updated', {
        userId: user.id,
        username: savedProfile.username,
        fullName: user.fullName,
        avatarUrl: savedProfile.avatarUrl,
        updatedAt: savedProfile.updatedAt,
      });

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: savedProfile.username,
        bio: savedProfile.bio || null,
        avatarUrl: savedProfile.avatarUrl || null,
        coverUrl: savedProfile.coverUrl || null,
        location: savedProfile.location || null,
        website: savedProfile.website || null,
        dateOfBirth: savedProfile.dateOfBirth || null,
        gender: savedProfile.gender || null,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: savedProfile.updatedAt,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getPublicProfile(idOrUsername: string): Promise<PublicProfileResponseDto> {
    const isUuid = UUID_REGEX.test(idOrUsername);

    let profile: UserProfile | null = null;

    if (isUuid) {
      profile = await this.userProfileRepository.findOne({
        where: [{ userId: idOrUsername }, { username: idOrUsername.toLowerCase() }],
        relations: ['user'],
      });
    } else {
      profile = await this.userProfileRepository.findOne({
        where: { username: idOrUsername.toLowerCase() },
        relations: ['user'],
      });
    }

    if (!profile) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 'User profile not found', HttpStatus.NOT_FOUND);
    }

    return {
      id: profile.userId,
      username: profile.username,
      fullName: profile.user?.fullName || '',
      bio: profile.bio || null,
      avatarUrl: profile.avatarUrl || null,
      coverUrl: profile.coverUrl || null,
      location: profile.location || null,
      website: profile.website || null,
      createdAt: profile.createdAt,
    };
  }

  async checkUsernameAvailability(username: string): Promise<CheckUsernameResponseDto> {
    const cleanUsername = username.toLowerCase();
    const existing = await this.userProfileRepository.findOne({
      where: { username: cleanUsername },
    });

    return {
      username: cleanUsername,
      available: !existing,
    };
  }

  // ==========================================
  // MEDIA MANAGEMENT (AVATAR & COVER)
  // ==========================================

  async generateAvatarPresignedUrl(
    userId: string,
    dto: PresignedAvatarUrlRequestDto,
  ): Promise<PresignedUrlResponseDto> {
    const ext = dto.mimeType.split('/')[1] === 'jpeg' ? 'jpg' : dto.mimeType.split('/')[1] || 'jpg';
    const fileKey = `avatars/${userId}/${randomUUID()}.${ext}`;

    return this.storageService.generatePresignedUploadUrl({
      fileKey,
      mimeType: dto.mimeType,
      fileSize: dto.fileSize,
      expiresIn: 900,
    });
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
    }

    const profile = await this.ensureUserProfile(user);
    const oldAvatarUrl = profile.avatarUrl;

    profile.avatarUrl = avatarUrl;
    user.avatarUrl = avatarUrl;

    await this.userProfileRepository.save(profile);
    await this.userRepository.save(user);

    if (oldAvatarUrl && oldAvatarUrl !== avatarUrl) {
      const oldKey = this.storageService.extractKeyFromUrl(oldAvatarUrl);
      if (oldKey) {
        await this.storageService.deleteObject(oldKey);
      }
    }

    await this.rabbitProducer.publish('weshare.topic', 'user.profile.updated', {
      userId: user.id,
      username: profile.username,
      fullName: user.fullName,
      avatarUrl: profile.avatarUrl,
      updatedAt: profile.updatedAt,
    });

    return this.getProfile(userId);
  }

  async removeAvatar(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
    }

    const profile = await this.ensureUserProfile(user);
    const oldAvatarUrl = profile.avatarUrl;

    profile.avatarUrl = null;
    user.avatarUrl = null;

    await this.userProfileRepository.save(profile);
    await this.userRepository.save(user);

    if (oldAvatarUrl) {
      const oldKey = this.storageService.extractKeyFromUrl(oldAvatarUrl);
      if (oldKey) {
        await this.storageService.deleteObject(oldKey);
      }
    }

    await this.rabbitProducer.publish('weshare.topic', 'user.profile.updated', {
      userId: user.id,
      username: profile.username,
      fullName: user.fullName,
      avatarUrl: null,
      updatedAt: profile.updatedAt,
    });

    return this.getProfile(userId);
  }

  async generateCoverPresignedUrl(
    userId: string,
    dto: PresignedCoverUrlRequestDto,
  ): Promise<PresignedUrlResponseDto> {
    const ext = dto.mimeType.split('/')[1] === 'jpeg' ? 'jpg' : dto.mimeType.split('/')[1] || 'jpg';
    const fileKey = `covers/${userId}/${randomUUID()}.${ext}`;

    return this.storageService.generatePresignedUploadUrl({
      fileKey,
      mimeType: dto.mimeType,
      fileSize: dto.fileSize,
      expiresIn: 900,
    });
  }

  async updateCover(userId: string, coverUrl: string): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
    }

    const profile = await this.ensureUserProfile(user);
    const oldCoverUrl = profile.coverUrl;

    profile.coverUrl = coverUrl;
    await this.userProfileRepository.save(profile);

    if (oldCoverUrl && oldCoverUrl !== coverUrl) {
      const oldKey = this.storageService.extractKeyFromUrl(oldCoverUrl);
      if (oldKey) {
        await this.storageService.deleteObject(oldKey);
      }
    }

    await this.rabbitProducer.publish('weshare.topic', 'user.profile.updated', {
      userId: user.id,
      username: profile.username,
      fullName: user.fullName,
      avatarUrl: profile.avatarUrl,
      updatedAt: profile.updatedAt,
    });

    return this.getProfile(userId);
  }

  async removeCover(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
    }

    const profile = await this.ensureUserProfile(user);
    const oldCoverUrl = profile.coverUrl;

    profile.coverUrl = null;
    await this.userProfileRepository.save(profile);

    if (oldCoverUrl) {
      const oldKey = this.storageService.extractKeyFromUrl(oldCoverUrl);
      if (oldKey) {
        await this.storageService.deleteObject(oldKey);
      }
    }

    await this.rabbitProducer.publish('weshare.topic', 'user.profile.updated', {
      userId: user.id,
      username: profile.username,
      fullName: user.fullName,
      avatarUrl: profile.avatarUrl,
      updatedAt: profile.updatedAt,
    });

    return this.getProfile(userId);
  }
}
