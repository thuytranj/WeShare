import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  AtSign,
  Camera,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Globe,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import {
  useCurrentUserProfile,
  useUpdateProfile,
  useUploadAvatar,
  useUploadCover,
  useCheckUsernameAvailability,
} from '../../hooks/useUser';
import { useTranslation } from '../../stores/i18n.store';

export interface ProfileSettingsProps {
  onBack?: () => void;
}

const PRONOUN_OPTIONS = [
  { value: '', label: 'Select pronouns' },
  { value: 'they/them', label: 'they/them' },
  { value: 'she/her', label: 'she/her' },
  { value: 'he/him', label: 'he/him' },
  { value: 'prefer-not-to-say', label: 'prefer-not-to-say' },
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
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [gender, setGender] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  // Hidden file input refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Synchronize local form state with profile when loaded
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? '');
      setUsername(profile.username ?? '');
      setBio(profile.bio ?? '');
      setLocation(profile.location ?? '');
      setWebsite(profile.website ?? '');
      setGender(profile.gender ?? '');
    }
  }, [profile]);

  useEffect(() => {
    setAvatarError(false);
  }, [profile?.avatarUrl]);

  // Live debounced username check
  const isUsernameChanged = profile ? username.trim() !== profile.username : false;
  const shouldCheckUsername = isUsernameChanged && username.trim().length >= 3;
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

  const tabs = [
    { id: 'overview', label: t('settingsTitle') },
    { id: 'profile', label: t('settingsTabEditProfile') },
    { id: 'appearance', label: t('settingsTabAppearance') },
    { id: 'security', label: t('settingsTabSecurity') },
    { id: 'privacy', label: t('settingsTabPrivacy') },
    { id: 'notifications', label: t('settingsTabNotifications') },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === 'overview') {
      handleBack();
    } else if (tabId === 'profile') {
      // already on profile
    } else {
      handleBack();
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
      setBio(profile.bio ?? '');
      setLocation(profile.location ?? '');
      setWebsite(profile.website ?? '');
      setGender(profile.gender ?? '');
    }
    updateProfileMutation.reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (shouldCheckUsername && checkData?.available === false) {
      return;
    }
    try {
      await updateProfileMutation.mutateAsync({
        fullName: fullName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim(),
        gender: gender || undefined,
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

  const isKnownPronoun = PRONOUN_OPTIONS.some((opt) => opt.value === gender);
  const isSubmitDisabled =
    updateProfileMutation.isPending ||
    (shouldCheckUsername && checkData?.available === false) ||
    isCheckingUsername;

  if (isLoading && !profile) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-8 animate-pulse">
        {/* Skeleton Header */}
        <div className="space-y-4">
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700/60 rounded" />
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700/60 rounded" />
          <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700/40 rounded" />
          <div className="flex gap-2 border-b border-slate-200/70 dark:border-white/5 pb-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 w-24 bg-slate-200 dark:bg-slate-700/40 rounded-xl" />
            ))}
          </div>
        </div>
        {/* Skeleton Card */}
        <div className="bg-white/80 dark:bg-[#1E232B] rounded-2xl md:rounded-[28px] p-6 md:p-8 space-y-8">
          <div className="h-44 md:h-52 rounded-2xl bg-slate-200 dark:bg-slate-700/60" />
          <div className="flex gap-6 -mt-14 px-2">
            <div className="w-[104px] h-[104px] rounded-full bg-slate-300 dark:bg-slate-600" />
            <div className="space-y-2 pt-14">
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700/60 rounded" />
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700/40 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700/30 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header & Breadcrumbs */}
      <header className="space-y-4">
        {/* Breadcrumb Navigation with Back Button */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
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
            <span className="text-[#7C3AED] dark:text-[#A78BFA] font-semibold">
              {t('settingsTabEditProfile')}
            </span>
          </nav>

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#7C3AED] dark:text-slate-400 dark:hover:text-[#A78BFA] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Settings</span>
          </button>
        </div>

        {/* Title, Subtitle & Live Status Capsule */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B] dark:text-white tracking-tight">
              {t('settingsTitle')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal">
              {t('profileHeaderSubtitle')}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span>Profile Live &amp; Synced</span>
          </div>
        </div>

        {/* Horizontal Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/70 dark:border-white/5">
          {tabs.map((tab) => {
            const isActive = tab.id === 'profile';
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#7C3AED] text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)] dark:bg-[#A78BFA] dark:text-[#10131C]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Profile Settings Panel Card */}
      <section className="bg-white/80 dark:bg-[#1E232B] border border-slate-200/80 dark:border-white/5 shadow-sm backdrop-blur-md rounded-2xl md:rounded-[28px] p-6 md:p-8 space-y-8 relative overflow-hidden transition-all duration-300">
        {/* Cover Banner & Avatar Row */}
        <div className="space-y-4">
          {/* Cover Banner Container */}
          <div className="relative w-full h-44 md:h-52 rounded-2xl md:rounded-3xl overflow-hidden shadow-inner flex items-end justify-end p-4 border border-slate-200/60 dark:border-white/5 bg-gradient-to-r from-[#e0d7ff] via-[#fed7aa] to-[#bfdbfe] dark:from-[#2a1d45] dark:via-[#3b2d54] dark:to-[#1e293b]">
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

            {/* Change Cover Button */}
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
              className="relative z-10 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-[#1E232B]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-[#282F3A] transition-all cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-[#7C3AED] dark:text-[#A78BFA]" />
              <span>{t('btnChangeCover')}</span>
            </button>
          </div>

          {/* Avatar Row */}
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 px-2 -mt-14 md:-mt-16 relative z-20">
            {/* Left: 104px Circular Portrait + Identity Details */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
              {/* 104px Avatar with Camera badge */}
              <div className="relative group shrink-0">
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  aria-label="Upload profile avatar"
                />
                <div className="w-[104px] h-[104px] rounded-full p-1 bg-white dark:bg-[#1E232B] shadow-md border-2 border-white dark:border-[#1E232B]">
                  <div className="w-full h-full rounded-full bg-slate-100 dark:bg-[#222736] overflow-hidden flex items-center justify-center">
                    {profile?.avatarUrl && !avatarError ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName || 'User'}
                        onError={() => setAvatarError(true)}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500/15 to-purple-500/25 flex items-center justify-center font-bold text-2xl text-[#7C3AED] dark:text-[#A78BFA]">
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
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#7C3AED] dark:bg-[#A78BFA] text-white dark:text-[#10131C] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
                >
                  {uploadAvatarMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Name & Handle */}
              <div className="mb-1 space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-1.5">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {profile?.fullName || fullName || 'User'}
                  </h2>
                  {profile?.isEmailVerified && (
                    <CheckCircle
                      className="w-4 h-4 text-blue-500 dark:text-blue-400 fill-blue-500/20 shrink-0"
                      aria-label="Verified user"
                    />
                  )}
                </div>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  @{profile?.username || username || 'username'}
                </p>
              </div>
            </div>

            {/* Right: Social Stats Capsule (Followers • Following only) */}
            <div className="rounded-2xl px-6 py-3 flex items-center gap-6 self-center md:self-end mb-1 bg-white/70 dark:bg-[#12141C] border border-slate-200/80 dark:border-white/5 shadow-sm">
              <div className="text-center">
                <span className="block text-base md:text-lg font-bold text-[#7C3AED] dark:text-[#A78BFA]">
                  {formatMetricCount(profile?.followersCount ?? 1400, '1.4k')}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {t('statFollowers')}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />
              <div className="text-center">
                <span className="block text-base md:text-lg font-bold text-[#7C3AED] dark:text-[#A78BFA]">
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
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between gap-3 text-sm font-medium text-rose-700 dark:text-rose-300"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
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
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between gap-3 text-sm font-medium text-rose-700 dark:text-rose-300"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
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
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 text-sm font-medium text-emerald-700 dark:text-emerald-300 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
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
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between gap-3 text-sm font-medium text-rose-700 dark:text-rose-300 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
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

        {/* Profile Form Section (Directly from inputs to Bio; NO Mindful Presence State) */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Field 1: Display Name */}
            <div className="space-y-2">
              <label
                htmlFor="profile-fullName"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
              >
                {t('fieldDisplayName')}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="profile-fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  maxLength={100}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#EFF3F9] dark:bg-[#12141C] text-sm text-slate-800 dark:text-white font-medium border border-transparent dark:border-[#222634] shadow-[inset_2px_2px_5px_#D1D9E6,inset_-2px_-2px_5px_#FFFFFF] dark:shadow-[inset_3px_3px_7px_#0A0D14,inset_-2px_-2px_6px_rgba(255,255,255,0.03)] focus:border-[#7C3AED] dark:focus:border-[#A78BFA] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] dark:focus:ring-[#A78BFA] transition-all"
                />
              </div>
            </div>

            {/* Field 2: Username with Live Debounced Availability Badge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="profile-username"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
                >
                  {t('fieldUsername')}
                </label>
                {/* Availability Badge */}
                {shouldCheckUsername ? (
                  isCheckingUsername || isDebouncing ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <RefreshCw className="w-3 h-3 animate-spin text-[#7C3AED] dark:text-[#A78BFA]" />
                      <span>Checking...</span>
                    </span>
                  ) : checkData?.available === true ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{t('badgeAvailable')}</span>
                    </span>
                  ) : checkData?.available === false ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
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
                <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <AtSign className="w-4 h-4" />
                </span>
                <input
                  id="profile-username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))
                  }
                  placeholder="username"
                  maxLength={30}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#EFF3F9] dark:bg-[#12141C] text-sm text-slate-800 dark:text-white font-medium border border-transparent dark:border-[#222634] shadow-[inset_2px_2px_5px_#D1D9E6,inset_-2px_-2px_5px_#FFFFFF] dark:shadow-[inset_3px_3px_7px_#0A0D14,inset_-2px_-2px_6px_rgba(255,255,255,0.03)] focus:border-[#7C3AED] dark:focus:border-[#A78BFA] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] dark:focus:ring-[#A78BFA] transition-all"
                />
              </div>
            </div>

            {/* Field 3: Pronouns / Gender Dropdown */}
            <div className="space-y-2">
              <label
                htmlFor="profile-gender"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
              >
                {t('fieldPronouns')}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <Sparkles className="w-4 h-4" />
                </span>
                <select
                  id="profile-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#EFF3F9] dark:bg-[#12141C] text-sm text-slate-800 dark:text-white font-medium border border-transparent dark:border-[#222634] shadow-[inset_2px_2px_5px_#D1D9E6,inset_-2px_-2px_5px_#FFFFFF] dark:shadow-[inset_3px_3px_7px_#0A0D14,inset_-2px_-2px_6px_rgba(255,255,255,0.03)] focus:border-[#7C3AED] dark:focus:border-[#A78BFA] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] dark:focus:ring-[#A78BFA] transition-all appearance-none cursor-pointer"
                >
                  {PRONOUN_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  {gender && !isKnownPronoun && (
                    <option value={gender}>{gender}</option>
                  )}
                </select>
                <span className="absolute right-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <ChevronDown className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Field 4: Location */}
            <div className="space-y-2">
              <label
                htmlFor="profile-location"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
              >
                {t('fieldLocation')}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <MapPin className="w-4 h-4" />
                </span>
                <input
                  id="profile-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                  maxLength={100}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#EFF3F9] dark:bg-[#12141C] text-sm text-slate-800 dark:text-white font-medium border border-transparent dark:border-[#222634] shadow-[inset_2px_2px_5px_#D1D9E6,inset_-2px_-2px_5px_#FFFFFF] dark:shadow-[inset_3px_3px_7px_#0A0D14,inset_-2px_-2px_6px_rgba(255,255,255,0.03)] focus:border-[#7C3AED] dark:focus:border-[#A78BFA] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] dark:focus:ring-[#A78BFA] transition-all"
                />
              </div>
            </div>

            {/* Field 5: Website / Portfolio */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="profile-website"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
                >
                  {t('fieldWebsite')}
                </label>
                {website.trim() && (
                  <a
                    href={formattedWebsiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7C3AED] dark:text-[#A78BFA] hover:underline"
                  >
                    <span>Preview</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <Globe className="w-4 h-4" />
                </span>
                <input
                  id="profile-website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  maxLength={200}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#EFF3F9] dark:bg-[#12141C] text-sm text-slate-800 dark:text-white font-medium border border-transparent dark:border-[#222634] shadow-[inset_2px_2px_5px_#D1D9E6,inset_-2px_-2px_5px_#FFFFFF] dark:shadow-[inset_3px_3px_7px_#0A0D14,inset_-2px_-2px_6px_rgba(255,255,255,0.03)] focus:border-[#7C3AED] dark:focus:border-[#A78BFA] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] dark:focus:ring-[#A78BFA] transition-all"
                />
              </div>
            </div>

            {/* Field 6: Bio / About Me with Character Counter (NO Mindful Presence) */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="profile-bio"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
                >
                  {t('fieldBio')}
                </label>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-[#7C3AED] dark:text-[#A78BFA]">
                    {Math.max(0, 240 - bio.length)}
                  </span>{' '}
                  {t('charCounter')}
                </span>
              </div>
              <div className="relative">
                <textarea
                  id="profile-bio"
                  rows={3}
                  maxLength={240}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a brief bio or personal philosophy..."
                  className="w-full p-4 rounded-2xl bg-[#EFF3F9] dark:bg-[#12141C] text-sm text-slate-800 dark:text-white font-medium border border-transparent dark:border-[#222634] shadow-[inset_2px_2px_5px_#D1D9E6,inset_-2px_-2px_5px_#FFFFFF] dark:shadow-[inset_3px_3px_7px_#0A0D14,inset_-2px_-2px_6px_rgba(255,255,255,0.03)] focus:border-[#7C3AED] dark:focus:border-[#A78BFA] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] dark:focus:ring-[#A78BFA] transition-all resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Card Bottom Divider */}
          <div className="h-px w-full bg-slate-200/80 dark:bg-white/10 my-6" />

          {/* Actions Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            {/* Real-time synchronization note */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Changes synchronize immediately across your account.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={updateProfileMutation.isPending}
                className="px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
              >
                {t('btnCancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="px-7 py-2.5 rounded-full text-xs md:text-sm font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#A78BFA] dark:hover:bg-[#BCA4FF] dark:text-[#10131C] shadow-[0_4px_16px_rgba(124,58,237,0.35)] dark:shadow-[0_4px_16px_rgba(167,139,250,0.35)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('savingChanges')}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{t('btnSaveChanges')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ProfileSettings;
