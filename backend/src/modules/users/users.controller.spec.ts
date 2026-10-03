import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole, UserStatus } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: any;

  const mockProfileResponse = {
    id: 'user-uuid-1',
    email: 'alex@example.com',
    fullName: 'Alex Morgan',
    username: 'alex_m',
    bio: 'Software engineer',
    avatarUrl: 'https://example.com/avatar.jpg',
    coverUrl: 'https://example.com/cover.jpg',
    location: 'Hanoi',
    website: 'https://alex.dev',
    dateOfBirth: '1996-01-01',
    gender: null,
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      getProfile: jest.fn().mockResolvedValue(mockProfileResponse),
      updateProfile: jest.fn().mockResolvedValue({
        ...mockProfileResponse,
        bio: 'Updated bio',
      }),
      checkUsernameAvailability: jest.fn().mockResolvedValue({
        username: 'alex_m',
        available: true,
      }),
      getPublicProfile: jest.fn().mockResolvedValue({
        id: 'user-uuid-1',
        username: 'alex_m',
        fullName: 'Alex Morgan',
        bio: 'Software engineer',
        avatarUrl: 'https://example.com/avatar.jpg',
        coverUrl: 'https://example.com/cover.jpg',
        location: 'Hanoi',
        website: 'https://alex.dev',
        createdAt: new Date(),
      }),
      generateAvatarPresignedUrl: jest.fn().mockResolvedValue({
        uploadUrl: 'https://s3.example.com/upload',
        fileKey: 'avatars/uuid.jpg',
        publicUrl: 'https://example.com/avatar.jpg',
        expiresIn: 900,
      }),
      updateAvatar: jest.fn().mockResolvedValue(mockProfileResponse),
      removeAvatar: jest.fn().mockResolvedValue({
        ...mockProfileResponse,
        avatarUrl: null,
      }),
      generateCoverPresignedUrl: jest.fn().mockResolvedValue({
        uploadUrl: 'https://s3.example.com/upload',
        fileKey: 'covers/uuid.jpg',
        publicUrl: 'https://example.com/cover.jpg',
        expiresIn: 900,
      }),
      updateCover: jest.fn().mockResolvedValue(mockProfileResponse),
      removeCover: jest.fn().mockResolvedValue({
        ...mockProfileResponse,
        coverUrl: null,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return authenticated user profile on getProfile', async () => {
    const res = await controller.getProfile('user-uuid-1');
    expect(usersService.getProfile).toHaveBeenCalledWith('user-uuid-1');
    expect(res).toEqual(mockProfileResponse);
  });

  it('should update profile on updateProfile', async () => {
    const dto = { bio: 'Updated bio' };
    const res = await controller.updateProfile('user-uuid-1', dto);
    expect(usersService.updateProfile).toHaveBeenCalledWith('user-uuid-1', dto);
    expect(res.bio).toBe('Updated bio');
  });

  it('should check username availability', async () => {
    const res = await controller.checkUsername({ username: 'alex_m' });
    expect(usersService.checkUsernameAvailability).toHaveBeenCalledWith('alex_m');
    expect(res.available).toBe(true);
  });

  it('should get public profile by identifier', async () => {
    const res = await controller.getPublicProfile('alex_m');
    expect(usersService.getPublicProfile).toHaveBeenCalledWith('alex_m');
    expect(res.username).toBe('alex_m');
  });

  it('should generate avatar presigned url', async () => {
    const dto = { mimeType: 'image/jpeg' };
    const res = await controller.generateAvatarPresignedUrl('user-uuid-1', dto);
    expect(usersService.generateAvatarPresignedUrl).toHaveBeenCalledWith('user-uuid-1', dto);
    expect(res).toHaveProperty('uploadUrl');
  });

  it('should update avatar', async () => {
    const res = await controller.updateAvatar('user-uuid-1', {
      avatarUrl: 'https://example.com/new.jpg',
    });
    expect(usersService.updateAvatar).toHaveBeenCalledWith(
      'user-uuid-1',
      'https://example.com/new.jpg',
    );
    expect(res).toBeDefined();
  });

  it('should remove avatar', async () => {
    const res = await controller.removeAvatar('user-uuid-1');
    expect(usersService.removeAvatar).toHaveBeenCalledWith('user-uuid-1');
    expect(res.avatarUrl).toBeNull();
  });

  it('should generate cover presigned url', async () => {
    const dto = { mimeType: 'image/png' };
    const res = await controller.generateCoverPresignedUrl('user-uuid-1', dto);
    expect(usersService.generateCoverPresignedUrl).toHaveBeenCalledWith('user-uuid-1', dto);
    expect(res).toHaveProperty('uploadUrl');
  });

  it('should update cover', async () => {
    const res = await controller.updateCover('user-uuid-1', {
      coverUrl: 'https://example.com/new-cover.jpg',
    });
    expect(usersService.updateCover).toHaveBeenCalledWith(
      'user-uuid-1',
      'https://example.com/new-cover.jpg',
    );
    expect(res).toBeDefined();
  });

  it('should remove cover', async () => {
    const res = await controller.removeCover('user-uuid-1');
    expect(usersService.removeCover).toHaveBeenCalledWith('user-uuid-1');
    expect(res.coverUrl).toBeNull();
  });
});
