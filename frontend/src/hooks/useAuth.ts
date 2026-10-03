import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import {
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../types';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      setAuth(response);
      queryClient.setQueryData(['currentUser'], response.user);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
  });
};

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
    onSuccess: (response) => {
      setAuth(response);
      queryClient.setQueryData(['currentUser'], response.user);
    },
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: (data: ResendOtpRequest) => authService.resendOtp(data),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authService.forgotPassword(data),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { refreshToken, logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      try {
        if (refreshToken) {
          await authService.logout(refreshToken);
        }
      } catch (err) {
        // Continue with local cleanup even if server-side logout errors
        console.warn('Server logout error:', err);
      }
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });
};

export const useCurrentUser = () => {
  const { accessToken, setUser } = useAuthStore();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const user = await authService.getMe();
      setUser(user);
      return user;
    },
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};
