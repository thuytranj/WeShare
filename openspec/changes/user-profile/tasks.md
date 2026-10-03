## 1. Database Schema & Entity Updates

- [x] 1.1 Create `UserProfile` entity (`backend/src/modules/users/entities/user-profile.entity.ts`) with `userId` (PK/FK to `users.id`), `username` (unique, lowercase), `bio`, `avatarUrl`, `coverUrl`, `location`, `website`, `dateOfBirth`, and `gender` (with `Gender` enum).
- [x] 1.2 Update `User` entity (`backend/src/modules/users/entities/user.entity.ts`) to declare 1:1 relation `@OneToOne(() => UserProfile, (profile) => profile.user)`.
- [x] 1.3 Create TypeORM migration creating `user_profiles` table with foreign key constraint (`ON DELETE CASCADE`), unique index `IDX_user_profiles_username` on `LOWER(username)`, and backfilling profiles for existing users.
- [x] 1.4 Add error codes for user profile operations (`USERNAME_ALREADY_EXISTS`, `USER_NOT_FOUND`, `UNSUPPORTED_MEDIA_TYPE`, `FILE_SIZE_LIMIT_EXCEEDED`, `INVALID_MEDIA_URL`) in `backend/src/common/exceptions/error-code.enum.ts`.

## 2. Storage Integration (Supabase S3 Presigned URLs)

- [x] 2.1 Implement `StorageService` in `backend/src/integrations/storage/storage.service.ts` using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` for presigned PUT URL generation and object deletion.
- [x] 2.2 Create `StorageModule` in `backend/src/integrations/storage/storage.module.ts` and register it in `backend/src/integrations/index.ts`.
- [x] 2.3 Create DTOs for presigned URL requests (`backend/src/modules/users/dto/presigned-url-request.dto.ts`) with MIME type and size validation.

## 3. Profile DTOs and Data Transfer Layer

- [x] 3.1 Create `UpdateProfileDto` in `backend/src/modules/users/dto/update-profile.dto.ts` with validation decorators for `fullName`, `username`, `bio`, `location`, `website`, `dateOfBirth`, and `gender`.
- [x] 3.2 Create `UpdateMediaDto` in `backend/src/modules/users/dto/update-media.dto.ts` for updating avatar and cover URLs.
- [x] 3.3 Create `UserProfileResponseDto` for authenticated user `/me` response and `PublicProfileResponseDto` for sanitized public profile responses in `backend/src/modules/users/dto/profile-response.dto.ts`.
- [x] 3.4 Create `CheckUsernameDto` and response DTO for handle availability check in `backend/src/modules/users/dto/check-username.dto.ts`.

## 4. Users Service Implementation

- [x] 4.1 Update `UsersService` to inject both `UserRepository` and `UserProfileRepository`, registering `UserProfile` in `TypeOrmModule.forFeature([User, UserProfile])`.
- [x] 4.2 Update user creation methods (`createLocalUser` and `createOrUpdateOAuthUser`) to automatically initialize a `UserProfile` record within an atomic transaction.
- [x] 4.3 Implement `getProfile(userId: string)` in `UsersService` to retrieve combined account and profile data with timestamps and status.
- [x] 4.4 Implement `updateProfile(userId: string, dto: UpdateProfileDto)` with unique username verification, updating `user_profiles` (and `users.fullName` if provided) inside a transaction, and publishing `user.profile.updated` to RabbitMQ.
- [x] 4.5 Implement `getPublicProfile(idOrUsername: string)` querying `UserProfile` and joining `user.fullName` by either UUID or handle, throwing `USER_NOT_FOUND` if not found, with zero leakage of private credentials.
- [x] 4.6 Implement `checkUsernameAvailability(username: string)` querying `UserProfile` availability.
- [x] 4.7 Implement `generateAvatarPresignedUrl`, `updateAvatar`, and `removeAvatar` on `UserProfile` with previous asset cleanup from storage.
- [x] 4.8 Implement `generateCoverPresignedUrl`, `updateCover`, and `removeCover` on `UserProfile` with previous asset cleanup from storage.

## 5. Users Controller & Module Wiring

- [x] 5.1 Create `UsersController` in `backend/src/modules/users/users.controller.ts` with Swagger documentation and `@UseGuards(JwtAuthGuard)`.
- [x] 5.2 Implement `GET /api/v1/users/me` returning authenticated composite profile.
- [x] 5.3 Implement `PATCH /api/v1/users/me` updating personal information.
- [x] 5.4 Implement `GET /api/v1/users/check-username` with `@Public()` decorator for availability checks.
- [x] 5.5 Implement `GET /api/v1/users/:idOrUsername` with `@Public()` decorator for public profile lookup.
- [x] 5.6 Implement avatar endpoints: `POST /api/v1/users/me/avatar/presigned-url`, `PUT /api/v1/users/me/avatar`, and `DELETE /api/v1/users/me/avatar`.
- [x] 5.7 Implement cover endpoints: `POST /api/v1/users/me/cover/presigned-url`, `PUT /api/v1/users/me/cover`, and `DELETE /api/v1/users/me/cover`.
- [x] 5.8 Register `UsersController` and `StorageModule` in `backend/src/modules/users/users.module.ts`.

## 6. Testing & Verification

- [x] 6.1 Write unit tests for `UsersService` covering profile retrieval, update, username conflicts, and media operations with 1:1 `UserProfile` entity (`backend/src/modules/users/users.service.spec.ts`).
- [x] 6.2 Write unit tests for `UsersController` covering endpoint routing, authorization guards, and responses (`backend/src/modules/users/users.controller.spec.ts`).
- [x] 6.3 Write unit tests for `StorageService` covering presigned URL generation and asset deletion (`backend/src/integrations/storage/storage.service.spec.ts`).
- [x] 6.4 Run `npm run build` and `npm run test` in backend to verify build integrity and passing test suites.
