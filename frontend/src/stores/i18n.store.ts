import { create } from 'zustand';

export type Locale = 'en' | 'vi';

const translations = {
  en: {
    // Brand
    brandName: 'WeShare',
    brandTagline: 'Mindful Social Network',

    // Navigation
    navFeed: 'Feed',
    navExplore: 'Explore',
    navNotifications: 'Notifications',
    navMessages: 'Messages',
    navBookmarks: 'Bookmarks',
    navProfile: 'Profile',
    navSettings: 'Settings',
    navCreatePost: 'Create Post',
    navSearchPlaceholder: 'Search on WeShare...',

    // Feed
    tabForYou: 'For You',
    tabFollowing: 'Following',
    composerPlaceholder: 'Share what is on your mind, Alex...',
    btnPublish: 'Publish',
    chipPhotoVideo: 'Photo / Video',
    chipMood: 'Mood',
    chipTagFriends: 'Tag Friends',
    storyAdd: 'Add Story',
    countLikes: 'likes',
    countComments: 'comments',
    countShares: 'shares',
    actionLike: 'Like',
    actionComment: 'Comment',
    actionShare: 'Share',
    actionBookmark: 'Bookmark',
    widgetSuggestedFriends: 'Suggested Friends',
    widgetSeeAll: 'See All',
    widgetFollow: 'Follow',
    widgetFollowing: 'Following',
    widgetTrending: 'Trending Topics',
    footerCopyright: '© 2025 WeShare Inc. Crafted with serene tactile harmony.',
    footerPrivacy: 'Privacy Policy',
    footerTerms: 'Terms of Service',

    // Auth - Login
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Enter your credentials to access your account',
    labelEmailOrUsername: 'Email or Username',
    placeholderEmail: 'alex.morgan@weshare.com',
    labelPassword: 'Password',
    placeholderPassword: '••••••••••••',
    rememberMe30Days: 'Remember me for 30 days',
    forgotPasswordLink: 'Forgot Password?',
    btnSignIn: 'Sign In',
    orContinueWith: 'or continue with',
    dontHaveAccount: "Don't have an account?",
    signUpLink: 'Create an account',

    // Auth - Register & OTP
    registerTitle: 'Create Account',
    registerSubtitle: 'Join our mindful social network today',
    stepAccountDetails: 'Account Details',
    stepVerification: 'Email Verification',
    labelFullName: 'Full Name',
    placeholderFullName: 'Alex Morgan',
    labelEmail: 'Email Address',
    btnCreateAccount: 'Continue to Verification',
    acceptTerms: 'I agree to the',
    verifyAccountTitle: 'Verify Your Account',
    verifyAccountSubtitle: 'We sent a 6-digit confirmation code to',
    linkEditEmail: 'Edit Email',
    otpCountdownText: 'Resend code in',
    btnResendOtp: 'Resend Code',
    btnVerifyAndContinue: 'Verify & Continue',
    codeResentNotice: 'A new verification code has been sent!',
    alreadyHaveAccount: 'Already have an account?',
    signInLink: 'Sign In',

    // Auth - Reset Password
    resetTitle: 'Reset Password',
    resetSubtitle: "Forgot your password? No worries, choose a new secure password below.",
    labelNewPassword: 'New Password',
    labelConfirmPassword: 'Confirm New Password',
    passwordStrength: 'Password Strength',
    strengthWeak: 'Weak',
    strengthFair: 'Fair',
    strengthGood: 'Good',
    strengthStrong: 'Strong',
    reqLength: 'At least 8 characters',
    reqNumber: 'At least 1 number',
    reqSpecial: 'At least 1 special character',
    btnResetAndUpdate: 'Reset & Update Password',
    backToSignIn: 'Back to Sign In',
    passwordResetSuccess: 'Password updated successfully! Redirecting to login...',

    // Settings & Profile
    settingsTitle: 'Settings',
    settingsSubtitle: 'Manage your preferences, account settings, and customize your experience.',
    settingsTabEditProfile: 'Edit Profile',
    settingsTabSecurity: 'Security & Access',
    settingsTabPrivacy: 'Privacy & Data',
    settingsTabNotifications: 'Notifications',
    settingsTabAppearance: 'Appearance',

    profileOverviewTitle: 'Profile Overview',
    btnEditProfile: 'Edit Profile',
    statFollowers: 'Followers',
    statFollowing: 'Following',

    appearanceTitle: 'Appearance',
    appearanceSubtitle: 'Customize the look and feel of your workspace.',
    themeLightMode: 'Light Mode',
    themeLightDesc: 'Clean, soft pastel neumorphic tones',
    themeDarkMode: 'Dark Mode',
    themeDarkDesc: 'Deep, tactile charcoal with high contrast',

    languageTitle: 'Language & Region',
    languageSubtitle: 'Select your preferred language for the interface.',
    langEnglish: 'English (US)',
    langEnglishDesc: 'Standard English interface',
    langVietnamese: 'Tiếng Việt',
    langVietnameseDesc: 'Giao diện Tiếng Việt hoàn chỉnh',

    profileHeaderTitle: 'Profile Details',
    profileHeaderSubtitle: 'Update your personal details, public bio, and social presence.',
    btnChangeCover: 'Change Cover',
    btnUpdatePhoto: 'Update Photo',

    fieldDisplayName: 'Display Name',
    fieldUsername: 'Username',
    fieldGender: 'Gender',
    fieldDateOfBirth: 'Date of Birth',
    genderFemale: 'Female',
    genderMale: 'Male',
    genderOther: 'Non-binary / Other',
    genderPreferNotToSay: 'Prefer not to say',
    genderSelectPlaceholder: 'Select gender',
    fieldLocation: 'Location',
    fieldWebsite: 'Website',
    fieldWebsitePortfolio: 'Website / Portfolio',
    previewLink: 'Preview',
    fieldBio: 'Bio',
    fieldBioAboutMe: 'Bio / About Me',
    profileSyncGuarantee: 'Changes synchronize immediately across your account.',
    profileLiveSynced: 'Profile Live & Synced',
    backToSettings: 'Back to Settings',

    badgeAvailable: 'Available',
    badgeTaken: 'Already taken',
    charCounter: 'characters remaining',

    btnSaveChanges: 'Save Changes',
    btnCancel: 'Cancel',
    savingChanges: 'Saving changes...',
    profileSaveSuccess: 'Profile updated successfully!',
    profileSaveError: 'Failed to update profile. Please try again.',

    syncNotice: 'Real-time sync active • Preferences update instantly across sessions',
  },
  vi: {
    // Brand
    brandName: 'WeShare',
    brandTagline: 'Mạng Xã Hội Kết Nối & Chia Sẻ',

    // Navigation
    navFeed: 'Bảng tin',
    navExplore: 'Khám phá',
    navNotifications: 'Thông báo',
    navMessages: 'Tin nhắn',
    navBookmarks: 'Dấu trang',
    navProfile: 'Cá nhân',
    navSettings: 'Cài đặt',
    navCreatePost: 'Đăng bài',
    navSearchPlaceholder: 'Tìm kiếm trên WeShare...',

    // Feed
    tabForYou: 'Dành cho bạn',
    tabFollowing: 'Đang theo dõi',
    composerPlaceholder: 'Chia sẻ suy nghĩ của bạn, Nam ơi...',
    btnPublish: 'Đăng bài',
    chipPhotoVideo: 'Ảnh / Video',
    chipMood: 'Cảm xúc',
    chipTagFriends: 'Gắn thẻ bạn bè',
    storyAdd: 'Tạo tin',
    countLikes: 'lượt thích',
    countComments: 'bình luận',
    countShares: 'chia sẻ',
    actionLike: 'Thích',
    actionComment: 'Bình luận',
    actionShare: 'Chia sẻ',
    actionBookmark: 'Lưu',
    widgetSuggestedFriends: 'Gợi ý kết bạn',
    widgetSeeAll: 'Xem tất cả',
    widgetFollow: 'Theo dõi',
    widgetFollowing: 'Đang theo dõi',
    widgetTrending: 'Chủ đề thịnh hành',
    footerCopyright: '© 2025 WeShare Inc. Kết nối & chia sẻ an toàn.',
    footerPrivacy: 'Quyền riêng tư',
    footerTerms: 'Điều khoản dịch vụ',

    // Auth - Login
    loginTitle: 'Chào Mừng Trở Lại',
    loginSubtitle: 'Đăng nhập để kết nối với không gian WeShare của bạn',
    labelEmailOrUsername: 'Email hoặc Tên đăng nhập',
    placeholderEmail: 'alex.morgan@weshare.com',
    labelPassword: 'Mật khẩu',
    placeholderPassword: '••••••••••••',
    rememberMe30Days: 'Ghi nhớ đăng nhập 30 ngày',
    forgotPasswordLink: 'Quên mật khẩu?',
    btnSignIn: 'Đăng Nhập',
    orContinueWith: 'hoặc tiếp tục với',
    dontHaveAccount: 'Chưa có tài khoản?',
    signUpLink: 'Đăng ký ngay',

    // Auth - Register & OTP
    registerTitle: 'Tạo Tài Khoản Mới',
    registerSubtitle: 'Tham gia mạng xã hội hiện đại ngay hôm nay',
    stepAccountDetails: 'Thông tin tài khoản',
    stepVerification: 'Xác thực Email',
    labelFullName: 'Họ và tên',
    placeholderFullName: 'Nguyễn Văn A',
    labelEmail: 'Địa chỉ Email',
    btnCreateAccount: 'Tiếp tục xác thực',
    acceptTerms: 'Tôi đồng ý với',
    verifyAccountTitle: 'Xác Thực Tài Khoản',
    verifyAccountSubtitle: 'Mã xác nhận 6 số đã được gửi tới',
    linkEditEmail: 'Đổi Email',
    otpCountdownText: 'Gửi lại mã sau',
    btnResendOtp: 'Gửi lại mã',
    btnVerifyAndContinue: 'Xác Nhận & Tiếp Tục',
    codeResentNotice: 'Mã xác thực mới đã được gửi tới hòm thư của bạn!',
    alreadyHaveAccount: 'Đã có tài khoản?',
    signInLink: 'Đăng nhập',

    // Auth - Reset Password
    resetTitle: 'Đặt Lại Mật Khẩu',
    resetSubtitle: 'Nhập thông tin bên dưới để tạo mật khẩu bảo mật mới cho tài khoản của bạn.',
    labelNewPassword: 'Mật khẩu mới',
    labelConfirmPassword: 'Xác nhận mật khẩu mới',
    passwordStrength: 'Độ mạnh mật khẩu',
    strengthWeak: 'Yếu',
    strengthFair: 'Trung bình',
    strengthGood: 'Khá',
    strengthStrong: 'Mạnh',
    reqLength: 'Tối thiểu 8 ký tự',
    reqNumber: 'Ít nhất 1 chữ số',
    reqSpecial: 'Ít nhất 1 ký tự đặc biệt',
    btnResetAndUpdate: 'Đặt Lại Mật Khẩu',
    backToSignIn: 'Quay lại Đăng nhập',
    passwordResetSuccess: 'Đã cập nhật mật khẩu thành công! Đang chuyển về trang đăng nhập...',

    // Settings & Profile
    settingsTitle: 'Cài đặt',
    settingsSubtitle: 'Quản lý tùy chọn, thiết lập tài khoản và cá nhân hóa trải nghiệm của bạn.',
    settingsTabEditProfile: 'Chỉnh sửa hồ sơ',
    settingsTabSecurity: 'Bảo mật & Truy cập',
    settingsTabPrivacy: 'Quyền riêng tư & Dữ liệu',
    settingsTabNotifications: 'Thông báo',
    settingsTabAppearance: 'Giao diện',

    profileOverviewTitle: 'Tổng quan hồ sơ',
    btnEditProfile: 'Chỉnh sửa hồ sơ',
    statFollowers: 'Người theo dõi',
    statFollowing: 'Đang theo dõi',

    appearanceTitle: 'Giao diện',
    appearanceSubtitle: 'Tùy chỉnh giao diện không gian làm việc của bạn.',
    themeLightMode: 'Chế độ Sáng',
    themeLightDesc: 'Tông màu pastel nhẹ nhàng, êm dịu',
    themeDarkMode: 'Chế độ Tối',
    themeDarkDesc: 'Tông màu than trầm ấm, độ tương phản cao',

    languageTitle: 'Ngôn ngữ & Khu vực',
    languageSubtitle: 'Chọn ngôn ngữ hiển thị cho giao diện.',
    langEnglish: 'Tiếng Anh (US)',
    langEnglishDesc: 'Giao diện tiếng Anh chuẩn',
    langVietnamese: 'Tiếng Việt',
    langVietnameseDesc: 'Giao diện tiếng Việt hoàn chỉnh',

    profileHeaderTitle: 'Thông tin hồ sơ',
    profileHeaderSubtitle: 'Cập nhật thông tin cá nhân, tiểu sử công khai và trang cá nhân.',
    btnChangeCover: 'Đổi ảnh bìa',
    btnUpdatePhoto: 'Cập nhật ảnh',

    fieldDisplayName: 'Tên hiển thị',
    fieldUsername: 'Tên người dùng',
    fieldGender: 'Giới tính',
    fieldDateOfBirth: 'Ngày sinh',
    genderFemale: 'Nữ',
    genderMale: 'Nam',
    genderOther: 'Phi nhị giới / Khác',
    genderPreferNotToSay: 'Không muốn tiết lộ',
    genderSelectPlaceholder: 'Chọn giới tính',
    fieldLocation: 'Địa điểm',
    fieldWebsite: 'Website',
    fieldWebsitePortfolio: 'Website / Portfolio',
    previewLink: 'Xem trước',
    fieldBio: 'Tiểu sử',
    fieldBioAboutMe: 'Tiểu sử / Giới thiệu',
    profileSyncGuarantee: 'Thay đổi được đồng bộ hóa ngay lập tức trên tài khoản của bạn.',
    profileLiveSynced: 'Hồ sơ đã đồng bộ',
    backToSettings: 'Quay lại Cài đặt',

    badgeAvailable: 'Khả dụng',
    badgeTaken: 'Đã có người dùng',
    charCounter: 'ký tự còn lại',

    btnSaveChanges: 'Lưu thay đổi',
    btnCancel: 'Hủy',
    savingChanges: 'Đang lưu thay đổi...',
    profileSaveSuccess: 'Đã cập nhật hồ sơ thành công!',
    profileSaveError: 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.',

    syncNotice: 'Đồng bộ hóa thời gian thực • Tùy chọn được áp dụng ngay lập tức trên các phiên',
  },
};

export type TranslationKey = keyof typeof translations.en;

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const STORAGE_KEY = 'weshare-locale';

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (saved === 'en' || saved === 'vi') return saved;
  return 'en'; // default English
}

export const useI18nStore = create<I18nState>((set, get) => ({
  locale: getInitialLocale(),

  setLocale: (locale: Locale) => {
    localStorage.setItem(STORAGE_KEY, locale);
    set({ locale });
  },

  t: (key: TranslationKey): string => {
    const { locale } = get();
    return translations[locale][key] || translations.en[key] || String(key);
  },
}));

export function useTranslation() {
  const locale = useI18nStore((state) => state.locale);
  const setLocale = useI18nStore((state) => state.setLocale);
  const t = useI18nStore((state) => state.t);
  return { locale, setLocale, t };
}
