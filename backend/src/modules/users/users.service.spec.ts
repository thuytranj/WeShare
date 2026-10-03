import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersService } from './users.service';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { UserProfile, UserGender } from './entities/user-profile.entity';
import { StorageService } from '../../integrations/storage/storage.service';
import { RabbitMqProducer } from '../../queue/rabbitmq-producer.service';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/exceptions/error-code.enum';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: any;
  let userProfileRepo: any;
  let dataSource: any;
  let storageService: any;
  let rabbitProducer: any;

  const mockProfile: UserProfile = {
    userId: 'user-uuid-1',
    username: 'alex_m',
    bio: 'Software engineer',
    avatarUrl: 'https://example.com/avatar.jpg',
    coverUrl: 'https://example.com/cover.jpg',
    location: 'Hanoi',
    website: 'https://alex.dev',
    dateOfBirth: '1996-01-01',
    gender: UserGender.MALE,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: null as any,
  };

  const mockUser: User = {
    id: 'user-uuid-1',
    email: 'alex@example.com',
    fullName: 'Alex Morgan',
    status: UserStatus.ACTIVE,
    role: UserRole.USER,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: mockProfile,
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((u) => Promise.resolve(u)),
      create: jest.fn().mockImplementation((u) => u),
    };

    userProfileRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((p) => Promise.resolve(p)),
      create: jest.fn().mockImplementation((p) => p),
    };

    const mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {
        save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
        create: jest.fn().mockImplementation((_, entity) => entity),
        findOne: jest.fn(),
      },
    };

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    storageService = {
      generatePresignedUploadUrl: jest.fn().mockResolvedValue({
        uploadUrl: 'https://s3.example.com/upload',
        fileKey: 'avatars/uuid.jpg',
        publicUrl: 'https://public.example.com/avatars/uuid.jpg',
        expiresIn: 900,
      }),
      deleteObject: jest.fn().mockResolvedValue(true),
      extractKeyFromUrl: jest.fn().mockReturnValue('avatars/old.jpg'),
    };

    rabbitProducer = {
      publish: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepo,
        },
        {
          provide: getRepositoryToken(UserProfile),
          useValue: userProfileRepo,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: StorageService,
          useValue: storageService,
        },
        {
          provide: RabbitMqProducer,
          useValue: rabbitProducer,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return combined user and profile information', async () => {
      userRepo.findOne.mockResolvedValue({ ...mockUser, profile: mockProfile });

      const result = await service.getProfile('user-uuid-1');

      expect(result).toHaveProperty('id', 'user-uuid-1');
      expect(result).toHaveProperty('email', 'alex@example.com');
      expect(result).toHaveProperty('username', 'alex_m');
      expect(result).toHaveProperty('fullName', 'Alex Morgan');
      expect(result).toHaveProperty('bio', 'Software engineer');
    });

    it('should throw USER_NOT_FOUND when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.getProfile('non-existent')).rejects.toThrow(AppException);
      await expect(service.getProfile('non-existent')).rejects.toMatchObject({
        errorCode: ErrorCode.USER_NOT_FOUND,
      });
    });
  });

  describe('updateProfile', () => {
    it('should update profile and publish event to RabbitMQ', async () => {
      const qr = dataSource.createQueryRunner();
      qr.manager.findOne.mockImplementation((entity: any) => {
        if (entity === User) return Promise.resolve({ ...mockUser, profile: { ...mockProfile } });
        if (entity === UserProfile) return null; // no username conflict
        return null;
      });

      const result = await service.updateProfile('user-uuid-1', {
        bio: 'Updated bio',
        location: 'Danang',
      });

      expect(result.bio).toBe('Updated bio');
      expect(rabbitProducer.publish).toHaveBeenCalledWith(
        'weshare.topic',
        'user.profile.updated',
        expect.objectContaining({ userId: 'user-uuid-1' }),
      );
    });

    it('should throw USERNAME_ALREADY_EXISTS when username is taken by another user', async () => {
      const qr = dataSource.createQueryRunner();
      qr.manager.findOne.mockImplementation((entity: any) => {
        if (entity === User) return Promise.resolve({ ...mockUser, profile: { ...mockProfile } });
        if (entity === UserProfile) {
          return Promise.resolve({ userId: 'other-user-uuid', username: 'taken_handle' });
        }
        return null;
      });

      await expect(
        service.updateProfile('user-uuid-1', { username: 'taken_handle' }),
      ).rejects.toMatchObject({
        errorCode: ErrorCode.USERNAME_ALREADY_EXISTS,
      });
    });
  });

  describe('getPublicProfile', () => {
    it('should return public profile by username without sensitive fields', async () => {
      userProfileRepo.findOne.mockResolvedValue({
        ...mockProfile,
        user: { fullName: 'Alex Morgan' },
      });

      const result = await service.getPublicProfile('alex_m');

      expect(result.username).toBe('alex_m');
      expect(result.fullName).toBe('Alex Morgan');
      expect(result).not.toHaveProperty('email');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw USER_NOT_FOUND when profile is not found', async () => {
      userProfileRepo.findOne.mockResolvedValue(null);

      await expect(service.getPublicProfile('nobody')).rejects.toMatchObject({
        errorCode: ErrorCode.USER_NOT_FOUND,
      });
    });
  });

  describe('checkUsernameAvailability', () => {
    it('should return available = true when handle is not taken', async () => {
      userProfileRepo.findOne.mockResolvedValue(null);

      const result = await service.checkUsernameAvailability('new_handle');
      expect(result.available).toBe(true);
      expect(result.username).toBe('new_handle');
    });

    it('should return available = false when handle is already taken', async () => {
      userProfileRepo.findOne.mockResolvedValue(mockProfile);

      const result = await service.checkUsernameAvailability('alex_m');
      expect(result.available).toBe(false);
    });
  });

  describe('media operations', () => {
    it('should generate avatar presigned url', async () => {
      const result = await service.generateAvatarPresignedUrl('user-uuid-1', {
        mimeType: 'image/png',
      });
      expect(storageService.generatePresignedUploadUrl).toHaveBeenCalled();
      expect(result).toHaveProperty('uploadUrl');
    });

    it('should update avatar and cleanup old file', async () => {
      userRepo.findOne.mockResolvedValue({ ...mockUser, profile: { ...mockProfile } });

      await service.updateAvatar(
        'user-uuid-1',
        'https://example.com/new-avatar.jpg',
      );

      expect(storageService.deleteObject).toHaveBeenCalledWith('avatars/old.jpg');
      expect(rabbitProducer.publish).toHaveBeenCalledWith(
        'weshare.topic',
        'user.profile.updated',
        expect.anything(),
      );
    });

    it('should remove avatar and cleanup old file', async () => {
      userRepo.findOne.mockResolvedValue({ ...mockUser, profile: { ...mockProfile } });

      await service.removeAvatar('user-uuid-1');

      expect(storageService.deleteObject).toHaveBeenCalledWith('avatars/old.jpg');
      expect(rabbitProducer.publish).toHaveBeenCalled();
    });
  });
});
