import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RotateCw,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { OtpInput } from '../../components/ui/OtpInput';
import { useTranslation } from '../../stores/i18n.store';
import { useRegister, useVerifyOtp, useResendOtp } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../services/api.client';

export const RegisterForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const registerMutation = useRegister();
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  // Form State
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [otpValue, setOtpValue] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // OTP Countdown timer (60s)
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleStepOneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;
    setErrorMsg(null);

    registerMutation.mutate(
      { email, password, fullName },
      {
        onSuccess: () => {
          setStep(2);
          setCountdown(60);
          setOtpValue('');
          setErrorMsg(null);
        },
        onError: (err) => {
          setErrorMsg(getApiErrorMessage(err, 'Failed to register account.'));
        },
      },
    );
  };

  const handleResendOtp = () => {
    if (countdown > 0 || resendOtpMutation.isPending) return;
    setErrorMsg(null);

    resendOtpMutation.mutate(
      { email },
      {
        onSuccess: (res) => {
          setCountdown(60);
          setResendNotice(res.message || t('codeResentNotice'));
          setTimeout(() => setResendNotice(null), 4000);
        },
        onError: (err) => {
          setErrorMsg(getApiErrorMessage(err, 'Failed to resend code.'));
        },
      },
    );
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length < 6) return;
    setErrorMsg(null);

    verifyOtpMutation.mutate(
      { email, otp: otpValue },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => {
            navigate('/');
          }, 1500);
        },
        onError: (err) => {
          setErrorMsg(getApiErrorMessage(err, 'Invalid or expired OTP. Please try again.'));
        },
      },
    );
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="max-w-[480px] w-full mx-auto">
      {/* Multi-step progress indicator */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step >= 1
                ? 'bg-gradient-to-tr from-pastel-violet to-pastel-lavender text-white shadow-neu-glow-pastel'
                : 'neu-inset text-slate-400'
            }`}
          >
            1
          </div>
          <span
            className={`text-xs font-semibold ${
              step === 1 ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'
            }`}
          >
            {t('stepAccountDetails')}
          </span>
        </div>

        <div className="h-[2px] flex-1 mx-3 bg-slate-200 dark:bg-slate-800 relative rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r from-pastel-violet to-pastel-lavender transition-all duration-500 ${
              step === 2 ? 'w-full' : 'w-0'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step === 2
                ? 'bg-gradient-to-tr from-pastel-violet to-pastel-lavender text-white shadow-neu-glow-pastel'
                : 'neu-inset text-slate-400'
            }`}
          >
            2
          </div>
          <span
            className={`text-xs font-semibold ${
              step === 2 ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'
            }`}
          >
            {t('stepVerification')}
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Account Details */}
      {step === 1 && (
        <>
          <div className="text-center space-y-1.5 mb-7">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-800 dark:text-slate-100">
              {t('registerTitle')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('registerSubtitle')}
            </p>
          </div>

          <form onSubmit={handleStepOneSubmit} className="space-y-4">
            <Input
              label={t('labelFullName')}
              type="text"
              placeholder={t('placeholderFullName')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User size={18} />}
              required
            />

            <Input
              label={t('labelEmail')}
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

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                  className="mt-0.5 w-4 h-4 rounded text-pastel-lavender focus:ring-pastel-lavender/30 border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer"
                />
                <span>
                  {t('acceptTerms')}{' '}
                  <span className="font-semibold text-pastel-lavender hover:underline">
                    {t('footerTerms')}
                  </span>{' '}
                  &amp;{' '}
                  <span className="font-semibold text-pastel-lavender hover:underline">
                    {t('footerPrivacy')}
                  </span>
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={registerMutation.isPending}
              rightIcon={<ArrowRight size={18} />}
              className="mt-3"
            >
              {t('btnCreateAccount')}
            </Button>
          </form>

          {/* Switch to Sign In */}
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-7">
            <span>{t('alreadyHaveAccount')} </span>
            <Link
              to="/login"
              className="font-semibold text-pastel-lavender hover:underline ml-1"
            >
              {t('signInLink')}
            </Link>
          </div>
        </>
      )}

      {/* Step 2: 6-digit OTP Verification */}
      {step === 2 && (
        <>
          <div className="text-center space-y-2 mb-6">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-800 dark:text-slate-100">
              {t('verifyAccountTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('verifyAccountSubtitle')}{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {email || 'alex.morgan@weshare.com'}
              </span>
            </p>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrorMsg(null);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-pastel-lavender hover:underline mt-1"
            >
              <ArrowLeft size={14} />
              {t('linkEditEmail')}
            </button>
          </div>

          {resendNotice && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center font-medium animate-fadeIn">
              {resendNotice}
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {t('verifyAccountTitle')} Successful!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Welcome to WeShare. Redirecting you to your mindful feed...
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* 6-digit Debossed OTP input */}
              <div className="py-2">
                <OtpInput
                  length={6}
                  value={otpValue}
                  onChange={(val) => setOtpValue(val)}
                  disabled={verifyOtpMutation.isPending}
                />
              </div>

              {/* Countdown & Resend Option */}
              <div className="flex flex-col sm:flex-row items-center justify-between text-xs gap-2 pt-1 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span>{t('otpCountdownText')}</span>
                  <span className="font-mono font-bold text-pastel-lavender">
                    {formatTimer(countdown)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || resendOtpMutation.isPending}
                  className={`inline-flex items-center gap-1 font-semibold transition-all ${
                    countdown > 0 || resendOtpMutation.isPending
                      ? 'text-slate-400 cursor-not-allowed opacity-60'
                      : 'text-pastel-lavender hover:underline cursor-pointer'
                  }`}
                >
                  <RotateCw
                    size={13}
                    className={
                      resendOtpMutation.isPending || countdown === 0 ? 'animate-spin-slow' : ''
                    }
                  />
                  {t('btnResendOtp')}
                </button>
              </div>

              {/* Verify CTA */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={otpValue.length < 6}
                isLoading={verifyOtpMutation.isPending}
                rightIcon={<ArrowRight size={18} />}
              >
                {t('btnVerifyAndContinue')}
              </Button>

              {/* Sign In fallback */}
              <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
                <span>{t('alreadyHaveAccount')} </span>
                <Link
                  to="/login"
                  className="font-semibold text-pastel-lavender hover:underline ml-1"
                >
                  {t('signInLink')}
                </Link>
              </div>
            </form>
          )}
        </>
      )}
    </Card>
  );
};
