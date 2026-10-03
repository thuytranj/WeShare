import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsDateString,
  Length,
  Matches,
} from 'class-validator';
import { UserGender } from '../entities/user-profile.entity';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Display / Full Name',
    example: 'Alex Morgan',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Unique username handle (3-30 chars, alphanumeric + _.-)',
    example: 'alex_morgan',
    minLength: 3,
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9_.-]{3,30}$/, {
    message:
      'Username must be between 3 and 30 characters and can only contain letters, numbers, underscores, periods, and hyphens.',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'Short biography description',
    example: 'Passionate software engineer building communities on WeShare.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;

  @ApiPropertyOptional({
    description: 'Geographic location / city',
    example: 'San Francisco, CA',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  location?: string;

  @ApiPropertyOptional({
    description: 'Personal or portfolio website URL',
    example: 'https://alexmorgan.dev',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'Website must be a valid HTTP or HTTPS URL' })
  @Length(0, 255)
  website?: string;

  @ApiPropertyOptional({
    description: 'Date of birth in ISO format (YYYY-MM-DD)',
    example: '1995-06-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'dateOfBirth must be a valid ISO date string (YYYY-MM-DD)' })
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Gender identity',
    enum: UserGender,
    example: UserGender.PREFER_NOT_TO_SAY,
  })
  @IsOptional()
  @IsEnum(UserGender, {
    message: 'gender must be one of: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY',
  })
  gender?: UserGender;
}
