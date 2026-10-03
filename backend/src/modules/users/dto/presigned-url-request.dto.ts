import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_COVER_SIZE = 10 * 1024 * 1024; // 10MB

export class PresignedAvatarUrlRequestDto {
  @ApiProperty({
    description: 'Image MIME type',
    example: 'image/jpeg',
    enum: ALLOWED_IMAGE_MIME_TYPES,
  })
  @IsNotEmpty()
  @IsIn(ALLOWED_IMAGE_MIME_TYPES, {
    message: 'Unsupported media type. Allowed types are image/jpeg, image/png, image/webp.',
  })
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes (max 5MB)',
    example: 1048576,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'File size must be greater than 0 bytes' })
  @Max(MAX_AVATAR_SIZE, {
    message: 'File size limit exceeded. Avatar must not exceed 5MB.',
  })
  fileSize?: number;
}

export class PresignedCoverUrlRequestDto {
  @ApiProperty({
    description: 'Image MIME type',
    example: 'image/jpeg',
    enum: ALLOWED_IMAGE_MIME_TYPES,
  })
  @IsNotEmpty()
  @IsIn(ALLOWED_IMAGE_MIME_TYPES, {
    message: 'Unsupported media type. Allowed types are image/jpeg, image/png, image/webp.',
  })
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes (max 10MB)',
    example: 2097152,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'File size must be greater than 0 bytes' })
  @Max(MAX_COVER_SIZE, {
    message: 'File size limit exceeded. Cover photo must not exceed 10MB.',
  })
  fileSize?: number;
}

export class PresignedUrlResponseDto {
  @ApiProperty({
    description: 'Short-lived presigned upload URL for direct S3 PUT',
    example: 'https://bucket.s3.amazonaws.com/...',
  })
  uploadUrl: string;

  @ApiProperty({
    description: 'Designated S3 storage key',
    example: 'avatars/user-id/123e4567-e89b-12d3-a456-426614174000.jpg',
  })
  fileKey: string;

  @ApiProperty({
    description: 'Resulting permanent public URL of the uploaded asset',
    example: 'https://example.supabase.co/storage/v1/object/public/weshare-media/avatars/...',
  })
  publicUrl: string;

  @ApiProperty({
    description: 'Duration in seconds until the upload URL expires',
    example: 900,
  })
  expiresIn: number;
}
