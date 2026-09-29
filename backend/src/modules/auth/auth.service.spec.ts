import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { OtpService } from './services/otp.service';
import { RedisService } from '../../common/redis/redis.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { AppException, ErrorCode } from '../../common/exceptions';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let otpService: jest.Mocked<OtpService>;
  let jwtService: jest.Mocked<JwtService>;
  let redisService: jest.Mocked<RedisService>;
  let refreshTokenRepository: any;

  const mockUser: User = {
    id: 'user-uuid-1234',
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedpasswordstringforuser',
    fullName: 'Test User',
    status: UserStatus.ACTIVE,
    role: UserRole.USER,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      createLocalUser: jest.fn(),
      createOrUpdateOAuthUser: jest.fn(),
      activateUser: jest.fn(),
    };

    const mockOtpService = {
      sendOtp: jest.fn(),
      verifyOtp: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-access-token-jwt'),
    };

    const mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const mockRefreshTokenRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: 'token-uuid-1', ...entity })),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: getRepositoryToken(RefreshToken), useValue: mockRefreshTokenRepo },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    otpService = module.get(OtpService);
    jwtService = module.get(JwtService);
    redisService = module.get(RedisService);
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
  });

  describe('register', () => {
    it('should successfully register a new user and dispatch email OTP', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.createLocalUser.mockResolvedValue({ ...mockUser, isEmailVerified: false });
      otpService.sendOtp.mockResolvedValue(undefined);

      const result = await service.register({
        email: 'new@example.com',
        password: 'Password123!',
        fullName: 'New User',
      });

      expect(usersService.createLocalUser).toHaveBeenCalled();
      expect(otpService.sendOtp).toHaveBeenCalledWith('new@example.com', 'New User');
      expect(result.message).toContain('Registration successful');
    });

    it('should throw EMAIL_ALREADY_EXISTS when email is already registered and verified', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: mockUser.email,
          password: 'Password123!',
          fullName: 'Test User',
        }),
      ).rejects.toThrow(AppException);

      try {
        await service.register({
          email: mockUser.email,
          password: 'Password123!',
          fullName: 'Test User',
        });
      } catch (err: any) {
        expect(err.errorCode).toBe(ErrorCode.EMAIL_ALREADY_EXISTS);
        expect(err.getStatus()).toBe(HttpStatus.CONFLICT);
      }
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP, activate user, and return JWT tokens', async () => {
      otpService.verifyOtp.mockResolvedValue(true);
      usersService.findByEmail.mockResolvedValue({ ...mockUser, isEmailVerified: false });
      usersService.activateUser.mockResolvedValue({ ...mockUser, isEmailVerified: true });

      const result = await service.verifyOtp({
        email: mockUser.email,
        otp: '123456',
      });

      expect(otpService.verifyOtp).toHaveBeenCalledWith(mockUser.email, '123456');
      expect(usersService.activateUser).toHaveBeenCalledWith(mockUser.id);
      expect(result.accessToken).toBe('mock-access-token-jwt');
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
    });
  });

  describe('login', () => {
    it('should authenticate user with valid credentials and return tokens', async () => {
      const plainPassword = 'CorrectPassword123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const user = { ...mockUser, passwordHash: hashedPassword };

      usersService.findByEmail.mockResolvedValue(user);

      const result = await service.login({
        email: mockUser.email,
        password: plainPassword,
      });

      expect(result.accessToken).toBe('mock-access-token-jwt');
      expect(result.user.id).toBe(user.id);
    });

    it('should throw INVALID_CREDENTIALS for incorrect password', async () => {
      const user = { ...mockUser, passwordHash: await bcrypt.hash('CorrectPass', 10) };
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.login({
          email: mockUser.email,
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(AppException);
    });

    it('should throw EMAIL_NOT_VERIFIED when user email is not yet verified', async () => {
      const plainPassword = 'CorrectPassword123!';
      const user = {
        ...mockUser,
        isEmailVerified: false,
        passwordHash: await bcrypt.hash(plainPassword, 10),
      };
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.login({
          email: mockUser.email,
          password: plainPassword,
        }),
      ).rejects.toThrow(AppException);
    });
  });

  describe('refreshTokens and reuse detection', () => {
    it('should rotate refresh token and issue new token pair', async () => {
      const mockTokenRecord: RefreshToken = {
        id: 'token-uuid',
        userId: mockUser.id,
        tokenHash: 'somehash',
        familyId: 'family-uuid',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      refreshTokenRepository.findOne.mockResolvedValue(mockTokenRecord);
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.refreshTokens('plain-refresh-token');

      expect(mockTokenRecord.isRevoked).toBe(true);
      expect(refreshTokenRepository.save).toHaveBeenCalledWith(mockTokenRecord);
      expect(result.accessToken).toBe('mock-access-token-jwt');
    });

    it('should detect token reuse and revoke entire family', async () => {
      const compromisedToken: RefreshToken = {
        id: 'token-uuid',
        userId: mockUser.id,
        tokenHash: 'compromised-hash',
        familyId: 'family-compromised-uuid',
        isRevoked: true, // ALREADY REVOKED!
        expiresAt: new Date(Date.now() + 1000000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      refreshTokenRepository.findOne.mockResolvedValue(compromisedToken);

      await expect(service.refreshTokens('already-used-token')).rejects.toThrow(AppException);
      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { familyId: 'family-compromised-uuid' },
        { isRevoked: true },
      );
    });
  });

  describe('logout', () => {
    it('should revoke refresh token in database and blacklist access token JTI in Redis', async () => {
      const result = await service.logout(mockUser.id, 'jti-1234', 'refresh-token-val');

      expect(refreshTokenRepository.update).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalledWith(
        'blacklist:token:jti-1234',
        '1',
        expect.any(Number),
      );
      expect(result.message).toBe('Logout successful.');
    });
  });
});
