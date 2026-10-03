import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../entities/user.entity';
import { UserGender } from '../entities/user-profile.entity';

export class UserProfileResponseDto {
  @ApiProperty({ description: 'User unique UUID identifier', example: 'a3ffb1c0-c841-6b9f-c6f9-07b743300000' })
  id: string;

  @ApiProperty({ description: 'User registered email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Full legal / display name', example: 'Alex Morgan' })
  fullName: string;

  @ApiProperty({ description: 'Unique social handle', example: 'alex_morgan' })
  username: string;

  @ApiPropertyOptional({ description: 'Biography description', example: 'Web developer & community builder', nullable: true })
  bio?: string | null;

  @ApiPropertyOptional({ description: 'Avatar image URL', example: 'https://storage.../avatar.jpg', nullable: true })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ description: 'Cover banner image URL', example: 'https://storage.../cover.jpg', nullable: true })
  coverUrl?: string | null;

  @ApiPropertyOptional({ description: 'Location / City', example: 'San Francisco, CA', nullable: true })
  location?: string | null;

  @ApiPropertyOptional({ description: 'Website URL', example: 'https://alex.dev', nullable: true })
  website?: string | null;

  @ApiPropertyOptional({ description: 'Date of birth (YYYY-MM-DD)', example: '1995-06-15', nullable: true })
  dateOfBirth?: string | Date | null;

  @ApiPropertyOptional({ description: 'Gender identity', enum: UserGender, nullable: true })
  gender?: UserGender | null;

  @ApiProperty({ description: 'Account role', enum: UserRole, example: UserRole.USER })
  role: UserRole;

  @ApiProperty({ description: 'Account status', enum: UserStatus, example: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty({ description: 'Whether email has been verified via OTP', example: true })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Account registration timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Profile last update timestamp' })
  updatedAt: Date;
}

export class PublicProfileResponseDto {
  @ApiProperty({ description: 'User unique UUID identifier', example: 'a3ffb1c0-c841-6b9f-c6f9-07b743300000' })
  id: string;

  @ApiProperty({ description: 'Unique social handle', example: 'alex_morgan' })
  username: string;

  @ApiProperty({ description: 'Display name', example: 'Alex Morgan' })
  fullName: string;

  @ApiPropertyOptional({ description: 'Biography description', example: 'Web developer & community builder', nullable: true })
  bio?: string | null;

  @ApiPropertyOptional({ description: 'Avatar image URL', example: 'https://storage.../avatar.jpg', nullable: true })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ description: 'Cover banner image URL', example: 'https://storage.../cover.jpg', nullable: true })
  coverUrl?: string | null;

  @ApiPropertyOptional({ description: 'Location / City', example: 'San Francisco, CA', nullable: true })
  location?: string | null;

  @ApiPropertyOptional({ description: 'Website URL', example: 'https://alex.dev', nullable: true })
  website?: string | null;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;
}
