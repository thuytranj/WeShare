import { create } from 'zustand';
import { UserSession, AuthSuccessResponse } from '../types';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../services/api.client';

const USER_STORAGE_KEY = 'weshare_user';

interface AuthState {
  user: UserSession | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  setAuth: (data: AuthSuccessResponse) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setUser: (user: UserSession) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false,

  setAuth: (data: AuthSuccessResponse) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

    set({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken || null,
      isAuthenticated: true,
      isInitialized: true,
    });
  },

  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    set((state) => ({
      accessToken,
      refreshToken: refreshToken || state.refreshToken,
      isAuthenticated: true,
    }));
  },

  setUser: (user: UserSession) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },

  initAuth: () => {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const userStr = localStorage.getItem(USER_STORAGE_KEY);
      const user = userStr ? (JSON.parse(userStr) as UserSession) : null;

      if (accessToken && user) {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isInitialized: true,
        });
      } else {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    } catch {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  },
}));
