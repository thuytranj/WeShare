import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ResendOtpDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user and dispatch email OTP' })
  @ApiResponse({ status: 201, description: 'Registration initiated, OTP sent' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 6-digit email OTP and activate account' })
  @ApiResponse({ status: 200, description: 'Account activated, returns JWT token pair' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 429, description: 'Max attempts exceeded' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @Throttle({ auth: { limit: 3, ttl: 300000 } })
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email OTP with cooldown throttling' })
  @ApiResponse({ status: 200, description: 'Fresh OTP dispatched' })
  @ApiResponse({ status: 429, description: 'Cooldown period active' })
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto);
  }

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Email not verified or suspended' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange refresh token for a rotated token pair' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid, expired, or reused token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out and invalidate session tokens' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  async logout(
    @CurrentUser('id') userId: string,
    @CurrentUser('jti') jti: string,
    @Body() body?: { refreshToken?: string },
  ) {
    return this.authService.logout(userId, jti, body?.refreshToken);
  }

  @Public()
  @Throttle({ auth: { limit: 3, ttl: 300000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset OTP via email' })
  @ApiResponse({ status: 200, description: 'Reset OTP dispatched' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with OTP verification' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Get(['google', 'oauth/google'])
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth2 authentication flow' })
  async googleAuth() {
    // Handled by Passport Google strategy
  }

  @Public()
  @Get(['google/callback', 'oauth/google/callback'])
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth2 callback' })
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const authResult = await this.authService.handleOAuthLogin(req.user);
    const frontendUrl = this.configService.get<string>('CORS_ORIGIN', 'http://localhost:5173');

    if (req.headers.accept?.includes('application/json')) {
      return res.json(authResult);
    }

    const redirectUrl = new URL('/auth/callback', frontendUrl);
    redirectUrl.searchParams.set('accessToken', authResult.accessToken);
    redirectUrl.searchParams.set('refreshToken', authResult.refreshToken);
    return res.redirect(redirectUrl.toString());
  }

  @Public()
  @Get(['github', 'oauth/github'])
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Initiate GitHub OAuth2 authentication flow' })
  async githubAuth() {
    // Handled by Passport GitHub strategy
  }

  @Public()
  @Get(['github/callback', 'oauth/github/callback'])
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth2 callback' })
  async githubAuthCallback(@Req() req: any, @Res() res: Response) {
    const authResult = await this.authService.handleOAuthLogin(req.user);
    const frontendUrl = this.configService.get<string>('CORS_ORIGIN', 'http://localhost:5173');

    if (req.headers.accept?.includes('application/json')) {
      return res.json(authResult);
    }

    const redirectUrl = new URL('/auth/callback', frontendUrl);
    redirectUrl.searchParams.set('accessToken', authResult.accessToken);
    redirectUrl.searchParams.set('refreshToken', authResult.refreshToken);
    return res.redirect(redirectUrl.toString());
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user session profile' })
  @ApiResponse({ status: 200, description: 'Current authenticated user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }
}
