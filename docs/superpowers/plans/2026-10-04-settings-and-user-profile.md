# Settings & User Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Settings Hub and User Profile Settings UI in React matching the Stitch Neumorphic Soft UI design prototypes, fully wired to the backend Users & Profile REST API endpoints from `docs/04-api-spec.md`.

**Architecture:** Feature-based React structure under `frontend/src/features/settings`. Server state managed via TanStack Query v5 hooks (`useCurrentUserProfile`, `useUpdateProfile`, `useUploadAvatar`, `useUploadCover`, `useCheckUsernameAvailability`) backed by `frontend/src/services/user.service.ts`. UI components dynamically support Light/Dark theme switching (`useThemeStore`) and English/Vietnamese localization (`useI18nStore`), with optimistic updates and seamless avatar/cover image uploading via S3 presigned URLs.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, TanStack Query v5, Zustand, Axios.

**Spec:** `docs/04-api-spec.md` (Section 2.2: Users & Profile) and Stitch screens (`bb2b014bf5e04c0b9945e8be14709b9d`, `fe36973119334ac8bea7f5710f72a8a3`, `bf8d0b75567b443e96f6b5be324f6d0f`, `ad3cf8f46fc44e8fbaaf397521b3e508`).

## Global Constraints

- API Base prefix: `/api/v1` with Bearer token authentication from `localStorage`
- Profile Settings MUST exclude the "Mindful Presence State" section
- Profile Statistics MUST display Followers and Following (replacing Mindful Allies / Moments)
- Support Light Mode (Pastel Neumorphic Soft UI) and Dark Mode (Luminous Tactile Charcoal)
- Clean TypeScript types matching backend DTOs with 0 build or lint errors (`npm run build`)

## Review Focus

1. **Avatar/Cover upload lifecycle**: Request presigned URL -> direct binary PUT to S3 -> PUT `/users/me/avatar` or `/users/me/cover` -> invalidate queries and update Zustand user state.
2. **Username uniqueness check**: Debounced verification against `GET /api/v1/users/check-username?username=...` with visual feedback (`✓ Available` or conflict warning).
3. **Form state synchronization**: Form loads current user data on fetch, dirty state detection, and reset/cancel handling.
4. **Theme and language reactivity**: Clicking Light/Dark cards or EN/VI options in Settings Hub immediately updates application styles and localized text.
5. **Responsive navigation**: Clicking "Edit Profile →" from Settings Hub transitions smoothly to Profile Settings and back.

---

### Task 1: TypeScript Interfaces & Types

**Files:**
- Create: `frontend/src/types/user.types.ts`
- Modify: `frontend/src/types/index.ts`

**Interfaces:**
- Produces: `UserProfile`, `UpdateProfilePayload`, `CheckUsernameResponse`, `PresignedUrlResponse`, `UpdateAvatarDto`, `UpdateCoverDto`

- [ ] **Step 1: Create `frontend/src/types/user.types.ts`**
  Define `UserProfile` interface with `id`, `email`, `fullName`, `username`, `bio`, `avatarUrl`, `coverUrl`, `location`, `website`, `dateOfBirth`, `gender`, `role`, `status`, `isEmailVerified`, `createdAt`, `updatedAt`, `followersCount`, `followingCount`.
  Define DTO types: `UpdateProfilePayload`, `CheckUsernameResponse`, `PresignedUrlRequest`, `PresignedUrlResponse`.

- [ ] **Step 2: Re-export in `frontend/src/types/index.ts`**
  Export all types from `./user.types`.

- [ ] **Step 3: Verification**
  Run `cd frontend && npm run build` to verify no type collisions.

---

### Task 2: User API Service & S3 Upload Helper

**Files:**
- Create: `frontend/src/services/user.service.ts`
- Modify: `frontend/src/services/index.ts`

**Interfaces:**
- Consumes: `apiClient` from `frontend/src/services/api.client.ts`
- Produces: `userService` object with `getMe`, `updateProfile`, `checkUsername`, `getAvatarPresignedUrl`, `uploadToPresignedUrl`, `updateAvatar`, `removeAvatar`, `getCoverPresignedUrl`, `updateCover`, `removeCover`, `getPublicProfile`.

- [ ] **Step 1: Create `frontend/src/services/user.service.ts`**
  Implement methods:
  - `getMe()`: `GET /users/me`
  - `updateProfile(data: UpdateProfilePayload)`: `PATCH /users/me`
  - `checkUsername(username: string)`: `GET /users/check-username?username=${username}`
  - `getAvatarPresignedUrl(mimeType, fileSize)`: `POST /users/me/avatar/presigned-url`
  - `uploadToPresignedUrl(uploadUrl, file, mimeType)`: Axios binary PUT with `Content-Type: mimeType`
  - `updateAvatar(avatarUrl: string)`: `PUT /users/me/avatar`
  - `removeAvatar()`: `DELETE /users/me/avatar`
  - `getCoverPresignedUrl(mimeType, fileSize)`: `POST /users/me/cover/presigned-url`
  - `updateCover(coverUrl: string)`: `PUT /users/me/cover`
  - `removeCover()`: `DELETE /users/me/cover`
  - `getPublicProfile(idOrUsername)`: `GET /users/${idOrUsername}`

- [ ] **Step 2: Export in `frontend/src/services/index.ts`**
  Export `userService` from `./user.service`.

- [ ] **Step 3: Verification**
  Run `cd frontend && npm run build`.

---

### Task 3: TanStack Query Custom Hooks (`useUser.ts`)

**Files:**
- Create: `frontend/src/hooks/useUser.ts`
- Modify: `frontend/src/hooks/index.ts`

**Interfaces:**
- Consumes: `userService`, `useAuthStore`
- Produces: `useCurrentUserProfile`, `useUpdateProfile`, `useUploadAvatar`, `useUploadCover`, `useCheckUsernameAvailability`

- [ ] **Step 1: Create `frontend/src/hooks/useUser.ts`**
  - Implement `userKeys` query factory.
  - Implement `useCurrentUserProfile()`: wraps `userService.getMe()`, updates `useAuthStore.getState().setUser` on success.
  - Implement `useUpdateProfile()`: wraps `userService.updateProfile()`, invalidates `userKeys.me()`, updates `useAuthStore`.
  - Implement `useUploadAvatar()`: handles presigned URL request -> S3 upload -> `userService.updateAvatar()` -> invalidate queries.
  - Implement `useUploadCover()`: handles presigned URL request -> S3 upload -> `userService.updateCover()` -> invalidate queries.
  - Implement `useCheckUsernameAvailability()`: hook to query username status with debounce.

- [ ] **Step 2: Export in `frontend/src/hooks/index.ts`**

- [ ] **Step 3: Verification**
  Run `cd frontend && npm run build`.

---

### Task 4: Translations for Settings & Profile (`i18n.store.ts`)

**Files:**
- Modify: `frontend/src/stores/i18n.store.ts`

**Interfaces:**
- Produces: New translation keys for Settings Hub, Appearance, Language, Profile fields, Followers/Following, Save Changes, Cancel.

- [ ] **Step 1: Add translation strings in both English (`en`) and Vietnamese (`vi`)**
  Keys:
  - `settingsTitle`, `settingsSubtitle`
  - `settingsTabEditProfile`, `settingsTabSecurity`, `settingsTabPrivacy`, `settingsTabNotifications`, `settingsTabAppearance`
  - `profileOverviewTitle`, `btnEditProfile`, `statFollowers`, `statFollowing`
  - `appearanceTitle`, `appearanceSubtitle`, `themeLightMode`, `themeLightDesc`, `themeDarkMode`, `themeDarkDesc`
  - `languageTitle`, `languageSubtitle`, `langEnglish`, `langEnglishDesc`, `langVietnamese`, `langVietnameseDesc`
  - `profileHeaderTitle`, `profileHeaderSubtitle`, `btnChangeCover`, `btnUpdatePhoto`
  - `fieldDisplayName`, `fieldUsername`, `fieldPronouns`, `fieldLocation`, `fieldWebsite`, `fieldBio`
  - `badgeAvailable`, `badgeTaken`, `charCounter`
  - `btnSaveChanges`, `btnCancel`, `savingChanges`, `profileSaveSuccess`, `profileSaveError`
  - `syncNotice`

- [ ] **Step 2: Verification**
  Run `cd frontend && npm run build`.

---

### Task 5: Settings Hub Component (`SettingsHub.tsx`)

**Files:**
- Create: `frontend/src/features/settings/SettingsHub.tsx`

**Interfaces:**
- Consumes: `useCurrentUserProfile`, `useThemeStore`, `useTranslation`, Lucide icons
- Produces: `SettingsHub` React component matching Stitch screens `bb2b014bf5e04c0b9945e8be14709b9d` & `fe36973119334ac8bea7f5710f72a8a3`.

- [ ] **Step 1: Implement `SettingsHub.tsx`**
  - Section 1: Profile Overview Card with avatar, full name, username, verified badge, `1.4k Followers • 520 Following`, and "Edit Profile →" action button.
  - Section 2: Appearance Theme Card with Light Mode card (Sun icon, mini preview, radio) and Dark Mode card (Moon icon, mini preview, radio), wired to `setTheme('light' | 'dark')`.
  - Section 3: Language Card with English (US) card and Tiếng Việt card, wired to `setLocale('en' | 'vi')`.
  - Ambient real-time sync notification bar at bottom.

---

### Task 6: Profile Settings Component (`ProfileSettings.tsx`)

**Files:**
- Create: `frontend/src/features/settings/ProfileSettings.tsx`

**Interfaces:**
- Consumes: `useCurrentUserProfile`, `useUpdateProfile`, `useUploadAvatar`, `useUploadCover`, `useCheckUsernameAvailability`, `useTranslation`
- Produces: `ProfileSettings` React component matching Stitch screens `bf8d0b75567b443e96f6b5be324f6d0f` & `ad3cf8f46fc44e8fbaaf397521b3e508`.

- [ ] **Step 1: Implement `ProfileSettings.tsx`**
  - Header with breadcrumb / back to settings button and horizontal tab bar.
  - Cover Banner with file input for "Change Cover" triggering presigned upload.
  - Avatar Row with 104px circular portrait, file input for "Update Photo" triggering presigned upload, name, `@username`, and `1.4k Followers • 520 Following` stats capsule.
  - Form Fields:
    - Display Name (`fullName`)
    - Username (`username`) with live debounced validation & `✓ Available` pill
    - Pronouns dropdown (`they/them`, `she/her`, `he/him`, etc.)
    - Location (`location`)
    - Website (`website`) with link preview
    - Bio textarea (`bio`) with character counter
    - **NO Mindful Presence State** (completely omitted).
  - Footer with "Cancel" and "Save Changes" mutation triggers, success toast alert.

---

### Task 7: Settings View Coordinator & Router Integration

**Files:**
- Create: `frontend/src/features/settings/SettingsView.tsx`
- Create: `frontend/src/features/settings/index.ts`
- Modify: `frontend/src/features/index.ts`
- Modify: `frontend/src/routes/AppRoutes.tsx`

- [ ] **Step 1: Create `SettingsView.tsx`**
  - Manages switching between Settings Hub and Profile Settings view based on active tab or URL route.
  - Renders `SettingsHub` on overview and `ProfileSettings` on edit profile.

- [ ] **Step 2: Export from `frontend/src/features/settings/index.ts` and `frontend/src/features/index.ts`**

- [ ] **Step 3: Update `AppRoutes.tsx`**
  - Route `/settings` and `/settings/profile` to render `SettingsView` within `AppLayout`.

- [ ] **Step 4: Verification and Build**
  - Run `cd frontend && npm run build` to confirm clean compilation.
