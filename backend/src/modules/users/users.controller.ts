import {
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  UpdateProfileDto,
  UpdateAvatarDto,
  UpdateCoverDto,
  UserProfileResponseDto,
  PublicProfileResponseDto,
  CheckUsernameQueryDto,
  CheckUsernameResponseDto,
  PresignedAvatarUrlRequestDto,
  PresignedCoverUrlRequestDto,
  PresignedUrlResponseDto,
} from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Authenticated user profile', type: UserProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser('id') userId: string): Promise<UserProfileResponseDto> {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update personal profile information' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: UserProfileResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Username already taken' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateProfile(userId, dto);
  }

  @Public()
  @Get('check-username')
  @ApiOperation({ summary: 'Check if username handle is available' })
  @ApiResponse({ status: 200, description: 'Username availability status', type: CheckUsernameResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid username format' })
  async checkUsername(
    @Query() query: CheckUsernameQueryDto,
  ): Promise<CheckUsernameResponseDto> {
    return this.usersService.checkUsernameAvailability(query.username);
  }

  @Post('me/avatar/presigned-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate S3 presigned upload URL for profile avatar' })
  @ApiResponse({ status: 200, description: 'Presigned upload URL generated', type: PresignedUrlResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid MIME type or size exceeded' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateAvatarPresignedUrl(
    @CurrentUser('id') userId: string,
    @Body() dto: PresignedAvatarUrlRequestDto,
  ): Promise<PresignedUrlResponseDto> {
    return this.usersService.generateAvatarPresignedUrl(userId, dto);
  }

  @Put('me/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update profile avatar URL after upload' })
  @ApiResponse({ status: 200, description: 'Avatar updated successfully', type: UserProfileResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid avatar URL' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateAvatar(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAvatarDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateAvatar(userId, dto.avatarUrl);
  }

  @Delete('me/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove profile avatar image' })
  @ApiResponse({ status: 200, description: 'Avatar removed successfully', type: UserProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeAvatar(@CurrentUser('id') userId: string): Promise<UserProfileResponseDto> {
    return this.usersService.removeAvatar(userId);
  }

  @Post('me/cover/presigned-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate S3 presigned upload URL for cover photo' })
  @ApiResponse({ status: 200, description: 'Presigned upload URL generated', type: PresignedUrlResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid MIME type or size exceeded' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateCoverPresignedUrl(
    @CurrentUser('id') userId: string,
    @Body() dto: PresignedCoverUrlRequestDto,
  ): Promise<PresignedUrlResponseDto> {
    return this.usersService.generateCoverPresignedUrl(userId, dto);
  }

  @Put('me/cover')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update cover photo URL after upload' })
  @ApiResponse({ status: 200, description: 'Cover updated successfully', type: UserProfileResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid cover URL' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateCover(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCoverDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateCover(userId, dto.coverUrl);
  }

  @Delete('me/cover')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove cover photo' })
  @ApiResponse({ status: 200, description: 'Cover removed successfully', type: UserProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeCover(@CurrentUser('id') userId: string): Promise<UserProfileResponseDto> {
    return this.usersService.removeCover(userId);
  }

  @Public()
  @Get(':idOrUsername')
  @ApiOperation({ summary: 'Get public profile by user UUID or username handle' })
  @ApiResponse({ status: 200, description: 'Public profile data', type: PublicProfileResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getPublicProfile(
    @Param('idOrUsername') idOrUsername: string,
  ): Promise<PublicProfileResponseDto> {
    return this.usersService.getPublicProfile(idOrUsername);
  }
}
