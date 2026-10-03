import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { authService } from '../../services/auth.service';

export const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      useAuthStore.getState().setTokens(accessToken, refreshToken);

      authService
        .getMe()
        .then((user) => {
          setAuth({
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: 900,
            user,
          });
          navigate('/', { replace: true });
        })
        .catch(() => {
          // If getMe fails, we still have tokens; redirect to feed
          navigate('/', { replace: true });
        });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FC] dark:bg-[#10131C] px-4">
      <div className="p-8 rounded-3xl neu-card text-center space-y-4 max-w-sm w-full">
        <div className="w-12 h-12 rounded-full border-4 border-pastel-lavender border-t-transparent animate-spin mx-auto" />
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
          Authenticating with WeShare...
        </h2>
        <p className="text-xs text-slate-400">
          Please wait while we complete your secure sign in.
        </p>
      </div>
    </div>
  );
};
