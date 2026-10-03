import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateAvatarDto {
  @ApiProperty({
    description: 'Public URL of the uploaded avatar image',
    example:
      'https://example.supabase.co/storage/v1/object/public/weshare-media/avatars/user-id/avatar.jpg',
  })
  @IsNotEmpty({ message: 'avatarUrl is required' })
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'avatarUrl must be a valid URL' })
  avatarUrl: string;
}

export class UpdateCoverDto {
  @ApiProperty({
    description: 'Public URL of the uploaded cover photo',
    example:
      'https://example.supabase.co/storage/v1/object/public/weshare-media/covers/user-id/cover.jpg',
  })
  @IsNotEmpty({ message: 'coverUrl is required' })
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'coverUrl must be a valid URL' })
  coverUrl: string;
}
