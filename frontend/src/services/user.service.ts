import axios from 'axios';
import { apiClient } from './api.client';
import {
  UserProfile,
  UpdateProfilePayload,
  CheckUsernameResponse,
  PresignedUrlResponse,
} from '../types';

export const userService = {
  /**
   * GET /api/v1/users/me
   * Retrieve current authenticated user profile
   */
  async getMe(): Promise<UserProfile> {
    const res = await apiClient.get<UserProfile>('/users/me');
    return res.data;
  },

  /**
   * PATCH /api/v1/users/me
   * Update personal profile information
   */
  async updateProfile(data: UpdateProfilePayload): Promise<UserProfile> {
    const res = await apiClient.patch<UserProfile>('/users/me', data);
    return res.data;
  },

  /**
   * GET /api/v1/users/check-username?username=:username
   * Check if username handle is available
   */
  async checkUsername(username: string): Promise<CheckUsernameResponse> {
    const res = await apiClient.get<CheckUsernameResponse>(
      `/users/check-username?username=${encodeURIComponent(username)}`,
    );
    return res.data;
  },

  /**
   * POST /api/v1/users/me/avatar/presigned-url
   * Generate S3 presigned upload URL for profile avatar
   */
  async getAvatarPresignedUrl(
    mimeType: string,
    fileSize: number,
  ): Promise<PresignedUrlResponse> {
    const res = await apiClient.post<PresignedUrlResponse>(
      '/users/me/avatar/presigned-url',
      { mimeType, fileSize },
    );
    return res.data;
  },

  /**
   * Upload binary file directly to S3 / Supabase presigned URL
   * Uses raw axios without Bearer auth header or API base URL
   */
  async uploadToPresignedUrl(
    uploadUrl: string,
    file: File | Blob,
    mimeType: string,
  ): Promise<void> {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': mimeType,
      },
    });
  },

  /**
   * PUT /api/v1/users/me/avatar
   * Update profile avatar URL after upload
   */
  async updateAvatar(avatarUrl: string): Promise<UserProfile> {
    const res = await apiClient.put<UserProfile>('/users/me/avatar', {
      avatarUrl,
    });
    return res.data;
  },

  /**
   * DELETE /api/v1/users/me/avatar
   * Remove profile avatar image
   */
  async removeAvatar(): Promise<UserProfile> {
    const res = await apiClient.delete<UserProfile>('/users/me/avatar');
    return res.data;
  },

  /**
   * POST /api/v1/users/me/cover/presigned-url
   * Generate S3 presigned upload URL for cover photo
   */
  async getCoverPresignedUrl(
    mimeType: string,
    fileSize: number,
  ): Promise<PresignedUrlResponse> {
    const res = await apiClient.post<PresignedUrlResponse>(
      '/users/me/cover/presigned-url',
      { mimeType, fileSize },
    );
    return res.data;
  },

  /**
   * PUT /api/v1/users/me/cover
   * Update cover photo URL after upload
   */
  async updateCover(coverUrl: string): Promise<UserProfile> {
    const res = await apiClient.put<UserProfile>('/users/me/cover', {
      coverUrl,
    });
    return res.data;
  },

  /**
   * DELETE /api/v1/users/me/cover
   * Remove cover photo
   */
  async removeCover(): Promise<UserProfile> {
    const res = await apiClient.delete<UserProfile>('/users/me/cover');
    return res.data;
  },

  /**
   * GET /api/v1/users/:idOrUsername
   * Get public profile by user UUID or username handle
   */
  async getPublicProfile(idOrUsername: string): Promise<UserProfile> {
    const res = await apiClient.get<UserProfile>(
      `/users/${encodeURIComponent(idOrUsername)}`,
    );
    return res.data;
  },
};
