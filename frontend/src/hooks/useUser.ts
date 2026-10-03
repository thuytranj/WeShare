import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { useAuthStore } from '../stores/auth.store';
import {
  UserProfile,
  UpdateProfilePayload,
} from '../types';

export const userKeys = {
  all: ['users'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  profile: (idOrUsername: string) => [...userKeys.all, 'profile', idOrUsername] as const,
  checkUsername: (username: string) => [...userKeys.all, 'check-username', username] as const,
};

/**
 * Synchronize UserProfile data with Zustand useAuthStore UserSession
 */
const syncAuthUser = (user: UserProfile) => {
  useAuthStore.getState().setUser({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  });
};

/**
 * Fetch personal profile for current authenticated user
 */
export const useCurrentUserProfile = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      const profile = await userService.getMe();
      syncAuthUser(profile);
      return profile;
    },
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Update personal profile fields
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => userService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(userKeys.me(), updatedProfile);
      syncAuthUser(updatedProfile);
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

/**
 * Upload and update avatar via S3 / Supabase presigned URL
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const mimeType = file.type || 'image/jpeg';
      const presigned = await userService.getAvatarPresignedUrl(mimeType, file.size);
      await userService.uploadToPresignedUrl(presigned.uploadUrl, file, mimeType);
      return await userService.updateAvatar(presigned.publicUrl);
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(userKeys.me(), updatedProfile);
      syncAuthUser(updatedProfile);
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

/**
 * Remove avatar image
 */
export const useRemoveAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userService.removeAvatar(),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(userKeys.me(), updatedProfile);
      syncAuthUser(updatedProfile);
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

/**
 * Upload and update cover image via S3 / Supabase presigned URL
 */
export const useUploadCover = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const mimeType = file.type || 'image/jpeg';
      const presigned = await userService.getCoverPresignedUrl(mimeType, file.size);
      await userService.uploadToPresignedUrl(presigned.uploadUrl, file, mimeType);
      return await userService.updateCover(presigned.publicUrl);
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(userKeys.me(), updatedProfile);
      syncAuthUser(updatedProfile);
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

/**
 * Remove cover photo
 */
export const useRemoveCover = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userService.removeCover(),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(userKeys.me(), updatedProfile);
      syncAuthUser(updatedProfile);
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

/**
 * Check if username handle is available
 */
export const useCheckUsernameAvailability = (username: string) => {
  return useQuery({
    queryKey: userKeys.checkUsername(username),
    queryFn: () => userService.checkUsername(username),
    enabled: Boolean(username && username.trim().length >= 3),
    staleTime: 1000 * 30, // 30 seconds
    retry: false,
  });
};

/**
 * Fetch public profile by user UUID or username handle
 */
export const usePublicProfile = (idOrUsername: string) => {
  return useQuery({
    queryKey: userKeys.profile(idOrUsername),
    queryFn: () => userService.getPublicProfile(idOrUsername),
    enabled: Boolean(idOrUsername && idOrUsername.trim().length > 0),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
