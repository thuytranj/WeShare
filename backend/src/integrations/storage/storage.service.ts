import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface PresignedUploadResult {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
  expiresIn: number;
}

export interface GeneratePresignedUploadOptions {
  fileKey: string;
  mimeType: string;
  fileSize?: number;
  expiresIn?: number;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly supabaseUrl?: string;
  private readonly endpoint?: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME', 'weshare-media');
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    this.endpoint = this.configService.get<string>('S3_ENDPOINT');

    const region = this.configService.get<string>('S3_REGION', 'global');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID', 'test-access-key');
    const secretAccessKey = this.configService.get<string>(
      'S3_SECRET_ACCESS_KEY',
      'test-secret-key',
    );

    this.s3Client = new S3Client({
      region,
      endpoint: this.endpoint || undefined,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  getPublicUrl(fileKey: string): string {
    if (this.supabaseUrl) {
      const baseUrl = this.supabaseUrl.replace(/\/+$/, '');
      return `${baseUrl}/storage/v1/object/public/${this.bucketName}/${fileKey}`;
    }

    if (this.endpoint) {
      const baseUrl = this.endpoint.replace(/\/+$/, '');
      return `${baseUrl}/${this.bucketName}/${fileKey}`;
    }

    return `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`;
  }

  extractKeyFromUrl(url: string): string | null {
    if (!url) return null;
    try {
      const publicPrefix = `/storage/v1/object/public/${this.bucketName}/`;
      const idx = url.indexOf(publicPrefix);
      if (idx !== -1) {
        return url.substring(idx + publicPrefix.length);
      }

      const bucketPrefix = `/${this.bucketName}/`;
      const bIdx = url.indexOf(bucketPrefix);
      if (bIdx !== -1) {
        return url.substring(bIdx + bucketPrefix.length);
      }

      const parsed = new URL(url);
      return parsed.pathname.replace(/^\/+/, '');
    } catch {
      return null;
    }
  }

  async generatePresignedUploadUrl(
    options: GeneratePresignedUploadOptions,
  ): Promise<PresignedUploadResult> {
    const { fileKey, mimeType, expiresIn = 900 } = options;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });

    const publicUrl = this.getPublicUrl(fileKey);

    return {
      uploadUrl,
      fileKey,
      publicUrl,
      expiresIn,
    };
  }

  async deleteObject(fileKey: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      await this.s3Client.send(command);
      this.logger.log(`Deleted storage object: ${fileKey}`);
      return true;
    } catch (error: any) {
      this.logger.warn(`Failed to delete storage object ${fileKey}: ${error.message}`);
      return false;
    }
  }
}
