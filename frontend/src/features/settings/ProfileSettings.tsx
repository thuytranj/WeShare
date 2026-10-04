import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  AtSign,
  Camera,
  Check,
  CheckCircle2,
  ExternalLink,
  Globe,
  MapPin,
  RefreshCw,
  ShieldCheck,
  User,
} from 'lucide-react';
import {
  useCurrentUserProfile,
  useUpdateProfile,
  useUploadAvatar,
  useUploadCover,
  useCheckUsernameAvailability,
} from '../../hooks/useUser';
import {
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  DatePicker,
} from '../../components/ui';
import { useTranslation } from '../../stores/i18n.store';
import { UserGender } from '../../types';

export interface ProfileSettingsProps {
  onBack?: () => void;
}

const GENDER_OPTIONS: Array<{
  value: UserGender;
  labelKey: 'genderFemale' | 'genderMale' | 'genderOther' | 'genderPreferNotToSay';
}> = [
  { value: 'FEMALE', labelKey: 'genderFemale' },
  { value: 'MALE', labelKey: 'genderMale' },
  { value: 'OTHER', labelKey: 'genderOther' },
  { value: 'PREFER_NOT_TO_SAY', labelKey: 'genderPreferNotToSay' },
];

function formatMetricCount(count: number | undefined | null, defaultFallback: string): string {
  if (count === undefined || count === null) {
    return defaultFallback;
  }
  if (count >= 1000) {
    const inK = count / 1000;
    return `${inK % 1 === 0 ? inK.toFixed(0) : inK.toFixed(1)}k`;
  }
  return count.toString();
}

function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U';
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useCurrentUserProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const uploadCoverMutation = useUploadCover();
  const { t } = useTranslation();

  // Local form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<UserGender | string>('PREFER_NOT_TO_SAY');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  // Hidden file input refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Synchronize local form state with profile when loaded
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? '');
      setUsername(profile.username ?? '');
      setGender((profile.gender as UserGender) || 'PREFER_NOT_TO_SAY');
      setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '');
      setLocation(profile.location ?? '');
      setWebsite(profile.website ?? '');
      setBio(profile.bio ?? '');
    }
  }, [profile]);

  useEffect(() => {
    setAvatarError(false);
  }, [profile?.avatarUrl]);

  // Live debounced username check
  const isUsernameChanged = profile ? username.trim() !== profile.username : false;
  const shouldCheckUsername = isUsernameChanged && username.trim().length >= 3;
  const isUsernameInvalid = isUsernameChanged && username.trim().length < 3;
  const usernameToCheck = shouldCheckUsername ? username.trim() : '';

  const {
    data: checkData,
    isLoading: isCheckingUsername,
    isDebouncing,
  } = useCheckUsernameAvailability(usernameToCheck);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/settings');
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadCoverMutation.mutateAsync(file);
    } catch {
      // Error handled by uploadCoverMutation.isError
    } finally {
      if (coverInputRef.current) {
        coverInputRef.current.value = '';
      }
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatarMutation.mutateAsync(file);
    } catch {
      // Error handled by uploadAvatarMutation.isError
    } finally {
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFullName(profile.fullName ?? '');
      setUsername(profile.username ?? '');
      setGender((profile.gender as UserGender) || 'PREFER_NOT_TO_SAY');
      setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '');
      setLocation(profile.location ?? '');
      setWebsite(profile.website ?? '');
      setBio(profile.bio ?? '');
    }
    updateProfileMutation.reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      isUsernameInvalid ||
      (shouldCheckUsername &&
        (checkData?.available === false || isCheckingUsername || isDebouncing))
    ) {
      return;
    }

    const trimmedWebsite = website.trim();
    const normalizedWebsite = trimmedWebsite
      ? trimmedWebsite.startsWith('http://') || trimmedWebsite.startsWith('https://')
        ? trimmedWebsite
        : `https://${trimmedWebsite}`
      : undefined;

    try {
      await updateProfileMutation.mutateAsync({
        fullName: fullName.trim() || undefined,
        username: username.trim(),
        gender: (gender as UserGender) || undefined,
        dateOfBirth: dateOfBirth ? dateOfBirth : undefined,
        location: location.trim(),
        website: normalizedWebsite,
        bio: bio.trim(),
      });
    } catch {
      // Error handled by updateProfileMutation.isError
    }
  };

  const formattedWebsiteUrl = website.trim()
    ? website.startsWith('http://') || website.startsWith('https://')
      ? website
      : `https://${website}`
    : '#';

  const isSubmitDisabled =
    updateProfileMutation.isPending ||
    isUsernameInvalid ||
    (shouldCheckUsername &&
      (checkData?.available === false || isCheckingUsername || isDebouncing));

  if (isLoading && !profile) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-8 animate-pulse">
        {/* Skeleton Header */}
        <div className="space-y-4">
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700/60 rounded" />
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700/60 rounded" />
          <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700/40 rounded" />
        </div>
        {/* Skeleton Card */}
        <div className="bg-[#EFF3F9] dark:bg-[#1E232B] rounded-2xl md:rounded-[28px] p-6 md:p-8 space-y-8 shadow-[-8px_-8px_16px_#FFFFFF,8px_8px_16px_#D1D9E6] dark:shadow-none">
          <div className="h-44 md:h-52 rounded-2xl bg-slate-200 dark:bg-slate-700/60" />
          <div className="flex gap-6 -mt-14 px-2">
            <div className="w-[104px] h-[104px] rounded-full bg-slate-300 dark:bg-slate-600" />
            <div className="space-y-2 pt-14">
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700/60 rounded" />
              <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-700/40 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700/30 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Header Breadcrumb / Meta Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          {/* Breadcrumb Navigation with Back Button */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Home
            </button>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <button
              type="button"
              onClick={handleBack}
              className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              {t('settingsTitle')}
            </button>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <span className="text-[#8B70DF] dark:text-[#A78BFA] font-semibold">
              {t('settingsTabEditProfile')}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('settingsTitle')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 font-normal">
            {t('profileHeaderSubtitle')}
          </p>
        </div>

        {/* Header Right Actions: Quick Status Badge & Back to Settings */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-[#7C3AED] dark:text-slate-300 dark:hover:text-[#A78BFA] bg-[#EFF3F9] dark:bg-[#1E232B] shadow-[-3px_-3px_8px_#FFFFFF,3px_3px_8px_#D1D9E6] dark:shadow-none transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('backToSettings')}</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF3F9] dark:bg-[#1E232B] shadow-[-3px_-3px_8px_#FFFFFF,3px_3px_8px_#D1D9E6] dark:shadow-none border border-transparent dark:border-white/5 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              {t('profileLiveSynced')}
            </span>
          </div>
        </div>
      </header>

      {/* Main 'Edit Profile' Panel Card (Light Neumorphic Soft UI) */}
      <div className="rounded-[28px] overflow-hidden p-6 md:p-8 space-y-8 bg-[#EFF3F9] dark:bg-[#1E232B] shadow-[-8px_-8px_16px_#FFFFFF,8px_8px_16px_#D1D9E6] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.02),6px_6px_16px_rgba(0,0,0,0.6)] border border-transparent dark:border-white/5 transition-all">
        {/* Cover Banner & Avatar Block */}
        <div className="space-y-4">
          {/* Cover Banner Container */}
          <div className="relative w-full h-44 md:h-52 rounded-2xl overflow-hidden bg-gradient-to-r from-[#e0d7ff] via-[#fed7aa] to-[#bfdbfe] dark:from-[#2a1d45] dark:via-[#3b2d54] dark:to-[#1e293b] shadow-inner flex items-end justify-end p-4">
            {/* Real Cover Image if present */}
            {profile?.coverUrl && (
              <img
                src={profile.coverUrl}
                alt="Profile cover banner"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* Decorative subtle ambient ripples when gradient is active */}
            {!profile?.coverUrl && (
              <>
                <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-white/20 blur-xl pointer-events-none" />
                <div className="absolute right-1/4 top-4 w-32 h-32 rounded-full bg-purple-300/30 blur-2xl pointer-events-none" />
              </>
            )}

            {/* Loading overlay during cover upload */}
            {uploadCoverMutation.isPending && (
              <div className="absolute inset-0 z-20 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center text-white text-xs font-medium gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#A78BFA]" />
                <span>Uploading cover image...</span>
              </div>
            )}

            {/* Change Cover Extruded Tactile Button */}
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverChange}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              aria-label="Upload profile cover banner"
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadCoverMutation.isPending}
              className="relative z-10 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-[#EFF3F9] dark:bg-[#1E232B] shadow-[-4px_-4px_10px_#FFFFFF,4px_4px_10px_#D1D9E6] dark:shadow-none hover:shadow-[-6px_-6px_12px_#FFFFFF,6px_6px_12px_#C8D2E0] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5 text-[#8B70DF] dark:text-[#A78BFA]" />
              <span>{t('btnChangeCover')}</span>
            </button>
          </div>

          {/* Avatar & Identity Row */}
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 px-2 -mt-14 md:-mt-16 relative z-20">
            {/* Left: Avatar + Details */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
              {/* 104px Avatar with Upload Badge */}
              <div className="relative group shrink-0">
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  aria-label="Upload profile avatar"
                />
                <div className="w-[90px] h-[90px] rounded-full p-1 bg-[#EFF3F9] dark:bg-[#1E232B] shadow-[-6px_-6px_14px_#FFFFFF,6px_6px_14px_#D1D9E6] dark:shadow-none">
                  <div className="w-full h-full rounded-full bg-slate-100 dark:bg-[#222736] overflow-hidden flex items-center justify-center">
                    {profile?.avatarUrl && !avatarError ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName || 'User'}
                        onError={() => setAvatarError(true)}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500/15 to-purple-500/25 flex items-center justify-center font-bold text-2xl text-[#8B70DF] dark:text-[#A78BFA]">
                        {getInitials(profile?.fullName)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Camera upload badge button */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadAvatarMutation.isPending}
                  title={t('btnUpdatePhoto')}
                  aria-label={t('btnUpdatePhoto')}
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#8B70DF] dark:bg-[#A78BFA] text-white dark:text-[#10131C] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
                >
                  {uploadAvatarMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Name & Verified Handle */}
              <div className="mb-1 space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-1.5">
                  <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {profile?.fullName || fullName || 'User'}
                  </h2>
                  {profile?.isEmailVerified && (
                    <span
                      className="w-4 h-4 rounded-full bg-[#8B70DF] text-white flex items-center justify-center shadow-sm shrink-0"
                      title="Verified User"
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  @{profile?.username || username || 'username'}
                </p>
              </div>
            </div>

            {/* Right: Mandatory Stats Capsule (Followers & Following only) */}
            <div className="rounded-2xl px-5 py-2.5 flex items-center gap-5 self-center md:self-end mb-1 bg-[#EFF3F9] dark:bg-[#12141C] shadow-[-4px_-4px_10px_#FFFFFF,4px_4px_10px_#D8E0ED] dark:shadow-none border border-transparent dark:border-white/5">
              <div className="text-center">
                <span className="block text-base md:text-lg font-bold text-[#6448b5] dark:text-[#A78BFA]">
                  {formatMetricCount(profile?.followersCount ?? 1400, '1.4k')}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {t('statFollowers')}
                </span>
              </div>
              {/* Vertical Divider */}
              <div className="w-px h-6 bg-[#D1D9E6] shadow-[1px_0_0_#FFFFFF] dark:bg-white/10 dark:shadow-none" />
              <div className="text-center">
                <span className="block text-base md:text-lg font-bold text-[#6448b5] dark:text-[#A78BFA]">
                  {formatMetricCount(profile?.followingCount ?? 520, '520')}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {t('statFollowing')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Media Upload Alerts */}
        {uploadCoverMutation.isError && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between gap-3 text-xs md:text-sm font-medium text-rose-700 dark:text-rose-300"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>
                {uploadCoverMutation.error instanceof Error
                  ? uploadCoverMutation.error.message
                  : 'Failed to upload cover banner'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => uploadCoverMutation.reset()}
              className="text-xs text-rose-700 dark:text-rose-300 hover:opacity-80 p-1 cursor-pointer"
              aria-label="Dismiss error message"
            >
              ✕
            </button>
          </div>
        )}

        {uploadAvatarMutation.isError && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between gap-3 text-xs md:text-sm font-medium text-rose-700 dark:text-rose-300"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>
                {uploadAvatarMutation.error instanceof Error
                  ? uploadAvatarMutation.error.message
                  : 'Failed to upload avatar photo'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => uploadAvatarMutation.reset()}
              className="text-xs text-rose-700 dark:text-rose-300 hover:opacity-80 p-1 cursor-pointer"
              aria-label="Dismiss error message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success Alert Banner */}
        {updateProfileMutation.isSuccess && (
          <div
            role="status"
            className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 text-xs md:text-sm font-medium text-emerald-700 dark:text-emerald-300 transition-all"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t('profileSaveSuccess')}</span>
            </div>
            <button
              type="button"
              onClick={() => updateProfileMutation.reset()}
              className="text-xs text-emerald-700 dark:text-emerald-300 hover:opacity-80 p-1 cursor-pointer"
              aria-label="Dismiss success message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Alert Banner */}
        {updateProfileMutation.isError && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between gap-3 text-xs md:text-sm font-medium text-rose-700 dark:text-rose-300 transition-all"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>
                {updateProfileMutation.error instanceof Error
                  ? updateProfileMutation.error.message
                  : t('profileSaveError')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => updateProfileMutation.reset()}
              className="text-xs text-rose-700 dark:text-rose-300 hover:opacity-80 p-1 cursor-pointer"
              aria-label="Dismiss error message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Profile Form Section (Directly from inputs to Bio; NO Mindful Presence) */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Row 1: Field 1 - Display Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="displayName"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
              >
                {t('fieldDisplayName')}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
                  <User className="w-4 h-4" />
                </span>
                <Input
                  id="displayName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  maxLength={100}
                  className="pl-10 pr-4 py-2.5 md:py-3 text-xs md:text-sm font-medium"
                />
              </div>
            </div>

            {/* Row 1: Field 2 - Username Handle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="username"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
                >
                  {t('fieldUsername')}
                </label>
                {/* Live Availability Badge */}
                {isUsernameInvalid ? (
                  <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-100/70 dark:bg-rose-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Min 3 chars</span>
                  </span>
                ) : shouldCheckUsername ? (
                  isCheckingUsername || isDebouncing ? (
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin text-[#8B70DF]" />
                      <span>Checking...</span>
                    </span>
                  ) : checkData?.available === true ? (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{t('badgeAvailable')}</span>
                    </span>
                  ) : checkData?.available === false ? (
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-100/70 dark:bg-rose-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{t('badgeTaken')}</span>
                    </span>
                  ) : null
                ) : (
                  profile?.username && (
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      Current
                    </span>
                  )
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
                  <AtSign className="w-4 h-4" />
                </span>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))
                  }
                  placeholder="alexmorgan"
                  maxLength={30}
                  className="pl-10 pr-4 py-2.5 md:py-3 text-xs md:text-sm font-medium"
                />
              </div>
            </div>

            {/* Row 2: Field 3 - Gender */}
            <div className="space-y-1.5">
              <label
                htmlFor="gender"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
              >
                {t('fieldGender')}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="8" r="5" />
                    <path d="M12 13v8M9 18h6" />
                  </svg>
                </span>
                <Select
                  value={gender as string}
                  onValueChange={(val) => setGender((val || 'PREFER_NOT_TO_SAY') as UserGender)}
                >
                  <SelectTrigger
                    id="gender"
                    className="w-full pl-10 pr-4 h-10 py-2.5 text-xs md:text-sm font-medium"
                  >
                    <SelectValue placeholder={t('fieldGender')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                        >
                          {t(option.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Field 4 - Date of Birth */}
            <div className="space-y-1.5">
              <label
                htmlFor="dob"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
              >
                {t('fieldDateOfBirth')}
              </label>
              <div className="relative">
                <DatePicker
                  id="dob"
                  value={dateOfBirth}
                  onChange={(dateStr) => setDateOfBirth(dateStr)}
                  placeholder={t('fieldDateOfBirth')}
                  captionLayout="dropdown"
                  fromYear={1920}
                  toYear={new Date().getFullYear()}
                  disabledDates={(date) => date > new Date()}
                />
              </div>
            </div>

            {/* Row 3: Field 5 - Location */}
            <div className="space-y-1.5">
              <label
                htmlFor="location"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
              >
                {t('fieldLocation')}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
                  <MapPin className="w-4 h-4" />
                </span>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                  maxLength={100}
                  className="pl-10 pr-4 py-2.5 md:py-3 text-xs md:text-sm font-medium"
                />
              </div>
            </div>

            {/* Row 3: Field 6 - Website / Portfolio */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="website"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
                >
                  {t('fieldWebsitePortfolio')}
                </label>
                {website.trim() && (
                  <a
                    href={formattedWebsiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-[#8B70DF] dark:text-[#A78BFA] hover:underline flex items-center gap-1"
                  >
                    <span>{t('previewLink')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
                  <Globe className="w-4 h-4" />
                </span>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://alexmorgan.design"
                  maxLength={255}
                  className="pl-10 pr-4 py-2.5 md:py-3 text-xs md:text-sm font-medium"
                />
              </div>
            </div>

            {/* Row 4: Field 7 - Bio / About Me (Full Width, NO Mindful Presence) */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="bio"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
                >
                  {t('fieldBioAboutMe')}
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {bio.length} / 300
                </span>
              </div>
              <div className="relative">
                <textarea
                  id="bio"
                  rows={3}
                  maxLength={300}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Product architect & systems thinker. Crafting calm, intentional human software. ☕🌱"
                  className="w-full p-3.5 rounded-2xl bg-[#EFF3F9] dark:bg-[#12141C] text-xs md:text-sm text-slate-800 dark:text-white font-medium border-none shadow-[inset_3px_3px_6px_#D1D9E6,inset_-3px_-3px_6px_#FFFFFF] dark:shadow-[inset_3px_3px_6px_#0A0D14,inset_-2px_-2px_6px_rgba(255,255,255,0.02)] focus:ring-2 focus:ring-[#8B70DF]/40 focus:outline-none transition-all resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Card Bottom Divider Well */}
          <div className="h-px w-full bg-[#D1D9E6] shadow-[0_1px_0_#FFFFFF] dark:bg-white/10 dark:shadow-none my-6" />

          {/* Actions Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            {/* Privacy auto-sync guarantee note with shield */}
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] md:text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t('profileSyncGuarantee')}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={updateProfileMutation.isPending}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 bg-[#EFF3F9] dark:bg-[#252A36] shadow-[-4px_-4px_10px_#FFFFFF,4px_4px_10px_#D1D9E6] dark:shadow-none hover:shadow-[-6px_-6px_12px_#FFFFFF,6px_6px_12px_#C8D2E0] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {t('btnCancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#8B70DF] to-[#7C3AED] shadow-[0_8px_20px_rgba(139,112,223,0.35),-4px_-4px_10px_#FFFFFF] dark:shadow-[0_8px_20px_rgba(139,112,223,0.35)] hover:shadow-[0_10px_24px_rgba(139,112,223,0.45),-4px_-4px_12px_#FFFFFF] active:scale-98 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('savingChanges')}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{t('btnSaveChanges')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
