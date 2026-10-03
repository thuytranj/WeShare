import { apiClient } from './api.client';
import {
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  ResendOtpRequest,
  LoginRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthSuccessResponse,
  AuthTokens,
  UserSession,
  AuthSession,
} from '../types';

export const authService = {
  /**
   * POST /api/v1/auth/register
   * Register a new user and dispatch email OTP
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const res = await apiClient.post<RegisterResponse>('/auth/register', data);
    return res.data;
  },

  /**
   * POST /api/v1/auth/verify-otp
   * Verify 6-digit email OTP and activate account, returning token pair and user profile
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<AuthSuccessResponse> {
    const res = await apiClient.post<AuthSuccessResponse>('/auth/verify-otp', data);
    return res.data;
  },

  /**
   * POST /api/v1/auth/resend-otp
   * Resend email OTP with 60-second cooldown
   */
  async resendOtp(data: ResendOtpRequest): Promise<{ message: string; email: string }> {
    const res = await apiClient.post<{ message: string; email: string }>('/auth/resend-otp', data);
    return res.data;
  },

  /**
   * POST /api/v1/auth/login
   * Sign in with local credentials (email & password)
   */
  async login(data: LoginRequest): Promise<AuthSuccessResponse> {
    const res = await apiClient.post<AuthSuccessResponse>('/auth/login', data);
    return res.data;
  },

  /**
   * POST /api/v1/auth/refresh
   * Exchange refresh token for rotated token pair
   */
  async refresh(data: RefreshTokenRequest): Promise<AuthTokens> {
    const res = await apiClient.post<AuthTokens>('/auth/refresh', data);
    return res.data;
  },

  /**
   * POST /api/v1/auth/logout
   * Invalidate session tokens in Redis & revoke refresh token
   */
  async logout(refreshToken?: string): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>('/auth/logout', {
      refreshToken,
    });
    return res.data;
  },

  /**
   * POST /api/v1/auth/forgot-password
   * Request password reset OTP via registered email
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string; email: string }> {
    const res = await apiClient.post<{ message: string; email: string }>('/auth/forgot-password', data);
    return res.data;
  },

  /**
   * POST /api/v1/auth/reset-password
   * Set new password with verified OTP
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>('/auth/reset-password', data);
    return res.data;
  },

  /**
   * GET /api/v1/auth/me
   * Retrieve current authenticated user profile
   */
  async getMe(): Promise<UserSession> {
    const res = await apiClient.get<UserSession>('/auth/me');
    return res.data;
  },

  /**
   * GET /api/v1/auth/sessions
   * List active login sessions / devices
   */
  async getSessions(): Promise<AuthSession[]> {
    const res = await apiClient.get<AuthSession[]>('/auth/sessions');
    return res.data;
  },

  /**
   * DELETE /api/v1/auth/sessions/:id
   * Terminate a specific session
   */
  async deleteSession(sessionId: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/auth/sessions/${sessionId}`);
    return res.data;
  },

  /**
   * DELETE /api/v1/auth/sessions/other
   * Terminate all other sessions
   */
  async deleteOtherSessions(): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>('/auth/sessions/other');
    return res.data;
  },

  /**
   * OAuth initiation helper URLs
   */
  getGoogleOAuthUrl(): string {
    const baseUrl = apiClient.defaults.baseURL || 'http://localhost:3000/api/v1';
    return `${baseUrl}/auth/google`;
  },

  getGithubOAuthUrl(): string {
    const baseUrl = apiClient.defaults.baseURL || 'http://localhost:3000/api/v1';
    return `${baseUrl}/auth/github`;
  },
};
