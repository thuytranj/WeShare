export type UserGender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  location?: string | null;
  website?: string | null;
  dateOfBirth?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | string | null;
  role: string;
  status: string;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  followersCount?: number;
  followingCount?: number;
}

export interface UpdateProfilePayload {
  fullName?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface CheckUsernameResponse {
  username: string;
  available: boolean;
}

export interface PresignedUrlRequest {
  mimeType: string;
  fileSize: number;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
  expiresIn: number;
}

export interface UpdateAvatarDto {
  avatarUrl: string;
}

export interface UpdateCoverDto {
  coverUrl: string;
}

export interface PublicUserProfile {
  id: string;
  username: string;
  fullName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  location?: string | null;
  website?: string | null;
  createdAt?: string;
  followersCount?: number;
  followingCount?: number;
}
