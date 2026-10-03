export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: 'USER' | 'ADMIN' | 'MODERATOR' | string;
  isEmailVerified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthSuccessResponse extends AuthTokens {
  user: UserSession;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AuthSession {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  lastActiveAt?: string;
  isCurrent?: boolean;
}

export interface ApiErrorResponse {
  statusCode: number;
  errorCode?: string;
  message: string;
  errors?: Array<{
    field?: string;
    issue?: string;
    message?: string;
  }>;
  timestamp?: string;
  path?: string;
}
