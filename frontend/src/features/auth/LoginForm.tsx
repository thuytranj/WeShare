import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../stores/i18n.store';
import { useLogin } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import { getApiErrorMessage } from '../../services/api.client';

export const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate('/');
        },
        onError: (err) => {
          setErrorMsg(getApiErrorMessage(err, 'Failed to sign in. Please check your credentials.'));
        },
      },
    );
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    if (provider === 'google') {
      window.location.href = authService.getGoogleOAuthUrl();
    } else {
      window.location.href = authService.getGithubOAuthUrl();
    }
  };

  return (
    <Card className="max-w-[460px] w-full mx-auto">
      {/* Header */}
      <div className="text-center space-y-1.5 mb-8">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-800 dark:text-slate-100">
          {t('loginTitle')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('loginSubtitle')}
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label={t('labelEmailOrUsername')}
          type="email"
          placeholder={t('placeholderEmail')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail size={18} />}
          required
        />

        <Input
          label={t('labelPassword')}
          type={showPassword ? 'text' : 'password'}
          placeholder={t('placeholderPassword')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={18} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          required
        />

        {/* Options Row */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-pastel-lavender focus:ring-pastel-lavender/30 border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer"
            />
            <span>{t('rememberMe30Days')}</span>
          </label>

          <Link
            to="/forgot-password"
            className="font-semibold text-pastel-lavender hover:underline transition-all"
          >
            {t('forgotPasswordLink')}
          </Link>
        </div>

        {/* Submit CTA */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={loginMutation.isPending}
          rightIcon={<ArrowRight size={18} />}
          className="mt-2"
        >
          {t('btnSignIn')}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200/60 dark:border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-surface-dark px-3 text-slate-400 dark:text-slate-500 font-medium">
            {t('orContinueWith')}
          </span>
        </div>
      </div>

      {/* Social Logins */}
      <div className="flex items-center justify-center gap-4">
        {/* Google */}
        <button
          type="button"
          onClick={() => handleOAuthLogin('google')}
          aria-label="Continue with Google"
          className="w-12 h-12 rounded-full neu-btn flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-transform active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        </button>

        {/* GitHub */}
        <button
          type="button"
          onClick={() => handleOAuthLogin('github')}
          aria-label="Continue with GitHub"
          className="w-12 h-12 rounded-full neu-btn flex items-center justify-center text-slate-800 dark:text-slate-100 transition-transform active:scale-95"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </button>
      </div>

      {/* Switch to Register */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
        <span>{t('dontHaveAccount')} </span>
        <Link
          to="/register"
          className="font-semibold text-pastel-lavender hover:underline ml-1"
        >
          {t('signUpLink')}
        </Link>
      </div>
    </Card>
  );
};
