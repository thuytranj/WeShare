import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://signed-url.example.com/upload'),
}));

jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...actual,
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({}),
    })),
  };
});

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const config: Record<string, string> = {
                S3_BUCKET_NAME: 'weshare-media',
                SUPABASE_URL: 'https://test-project.supabase.co',
                S3_ENDPOINT: 'https://test-project.supabase.co/storage/v1/s3',
                S3_REGION: 'global',
                S3_ACCESS_KEY_ID: 'test-key',
                S3_SECRET_ACCESS_KEY: 'test-secret',
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePresignedUploadUrl', () => {
    it('should generate a valid presigned upload URL and publicUrl', async () => {
      const result = await service.generatePresignedUploadUrl({
        fileKey: 'avatars/user-123/uuid.jpg',
        mimeType: 'image/jpeg',
      });

      expect(result).toHaveProperty('uploadUrl', 'https://signed-url.example.com/upload');
      expect(result).toHaveProperty('fileKey', 'avatars/user-123/uuid.jpg');
      expect(result).toHaveProperty(
        'publicUrl',
        'https://test-project.supabase.co/storage/v1/object/public/weshare-media/avatars/user-123/uuid.jpg',
      );
      expect(result).toHaveProperty('expiresIn', 900);
    });
  });

  describe('extractKeyFromUrl', () => {
    it('should extract S3 key from Supabase public URL', () => {
      const url =
        'https://test-project.supabase.co/storage/v1/object/public/weshare-media/avatars/user-123/photo.jpg';
      const key = service.extractKeyFromUrl(url);
      expect(key).toBe('avatars/user-123/photo.jpg');
    });

    it('should extract S3 key from bucket-prefixed URL', () => {
      const url = 'https://s3.example.com/weshare-media/covers/user-123/cover.png';
      const key = service.extractKeyFromUrl(url);
      expect(key).toBe('covers/user-123/cover.png');
    });

    it('should return null for empty or invalid url', () => {
      expect(service.extractKeyFromUrl('')).toBeNull();
    });
  });

  describe('deleteObject', () => {
    it('should delete object without throwing error', async () => {
      const success = await service.deleteObject('avatars/user-123/old.jpg');
      expect(success).toBe(true);
    });
  });
});
