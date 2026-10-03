import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, Check, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { OtpInput } from '../../components/ui/OtpInput';
import { useTranslation } from '../../stores/i18n.store';
import { useForgotPassword, useResetPassword } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../services/api.client';

export const ForgotPasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const forgotPasswordMutation = useForgotPassword();
  const resetPasswordMutation = useResetPassword();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Security meter checks
  const checks = useMemo(() => {
    return {
      length: newPassword.length >= 8,
      number: /\d/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
    };
  }, [newPassword]);

  // Compute password score 0 to 4
  const strengthScore = useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (checks.length) score += 1;
    if (checks.number) score += 1;
    if (checks.special) score += 1;
    return score;
  }, [newPassword, checks]);

  const strengthLabel = useMemo(() => {
    if (strengthScore <= 1) return { text: t('strengthWeak'), color: 'text-rose-500', barColor: 'bg-rose-500' };
    if (strengthScore === 2) return { text: t('strengthFair'), color: 'text-amber-500', barColor: 'bg-amber-500' };
    if (strengthScore === 3) return { text: t('strengthGood'), color: 'text-pastel-lavender', barColor: 'bg-pastel-lavender' };
    return { text: t('strengthStrong'), color: 'text-emerald-500', barColor: 'bg-emerald-500' };
  }, [strengthScore, t]);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Step 1: Send OTP to Email
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setStep(2);
        },
        onError: (err) => {
          setErrorMsg(getApiErrorMessage(err, 'Failed to request password reset code.'));
        },
      },
    );
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6 || !checks.length || !passwordsMatch) return;
    setErrorMsg(null);

    resetPasswordMutation.mutate(
      { email, otp, newPassword },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        },
        onError: (err) => {
          setErrorMsg(getApiErrorMessage(err, 'Invalid or expired OTP. Please try again.'));
        },
      },
    );
  };

  return (
    <Card className="max-w-[480px] w-full mx-auto">
      {/* Header */}
      <div className="text-center space-y-1.5 mb-7">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-800 dark:text-slate-100">
          {t('resetTitle')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {step === 1 ? t('resetSubtitle') : `${t('verifyAccountSubtitle')} ${email}`}
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isSuccess ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center animate-bounce">
            <CheckCircle2 size={36} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {t('passwordResetSuccess')}
            </h3>
          </div>
        </div>
      ) : step === 1 ? (
        /* Step 1: Request Code */
        <form onSubmit={handleRequestOtp} className="space-y-5">
          <Input
            label={t('labelEmail')}
            type="email"
            placeholder={t('placeholderEmail')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={18} />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={forgotPasswordMutation.isPending}
            rightIcon={<ArrowRight size={18} />}
            className="mt-3"
          >
            {t('btnCreateAccount')}
          </Button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-pastel-lavender dark:text-slate-400 dark:hover:text-pastel-lavender transition-colors"
            >
              <ArrowLeft size={14} />
              {t('backToSignIn')}
            </Link>
          </div>
        </form>
      ) : (
        /* Step 2: Enter OTP & Set New Password */
        <form onSubmit={handleResetPassword} className="space-y-5">
          {/* OTP Code */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block text-center">
              {t('verifyAccountTitle')} (6 digits)
            </label>
            <OtpInput
              length={6}
              value={otp}
              onChange={(val) => setOtp(val)}
              disabled={resetPasswordMutation.isPending}
            />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Input
              label={t('labelNewPassword')}
              type={showNewPassword ? 'text' : 'password'}
              placeholder={t('placeholderPassword')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              leftIcon={<Lock size={18} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              required
            />

            {/* 4-segment security meter */}
            {newPassword.length > 0 && (
              <div className="space-y-2 pt-1 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{t('passwordStrength')}</span>
                  <span className={`font-semibold ${strengthLabel.color}`}>{strengthLabel.text}</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                  {[1, 2, 3, 4].map((seg) => (
                    <div
                      key={seg}
                      className={`h-full rounded-full transition-all duration-300 ${
                        strengthScore >= seg
                          ? strengthLabel.barColor
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  ))}
                </div>

                {/* Requirement checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className={`flex items-center gap-1 ${checks.length ? 'text-emerald-500 font-medium' : ''}`}>
                    {checks.length ? <Check size={12} /> : <X size={12} className="opacity-40" />}
                    <span>{t('reqLength')}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${checks.number ? 'text-emerald-500 font-medium' : ''}`}>
                    {checks.number ? <Check size={12} /> : <X size={12} className="opacity-40" />}
                    <span>{t('reqNumber')}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${checks.special ? 'text-emerald-500 font-medium' : ''}`}>
                    {checks.special ? <Check size={12} /> : <X size={12} className="opacity-40" />}
                    <span>{t('reqSpecial')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <Input
            label={t('labelConfirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder={t('placeholderPassword')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock size={18} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            error={
              confirmPassword && !passwordsMatch
                ? 'Passwords do not match'
                : undefined
            }
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={otp.length < 6 || strengthScore < 2 || !passwordsMatch}
            isLoading={resetPasswordMutation.isPending}
            className="mt-3"
          >
            {t('btnResetAndUpdate')}
          </Button>

          {/* Back to Step 1 */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrorMsg(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-pastel-lavender dark:text-slate-400 dark:hover:text-pastel-lavender transition-colors"
            >
              <ArrowLeft size={14} />
              {t('linkEditEmail')}
            </button>
          </div>
        </form>
      )}
    </Card>
  );
};
