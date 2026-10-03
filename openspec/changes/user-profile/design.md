## Context

WeShare is built as a Modular Monolith backend powered by NestJS, TypeORM, PostgreSQL 16, Redis 7, RabbitMQ 3, and Supabase Storage. The authentication system currently supports registration, email OTP verification, password reset, and OAuth (Google and GitHub).

While user entities currently hold authentication credentials (`id`, `email`, `passwordHash`, `status`, `role`, `isEmailVerified`, `googleId`, `githubId`), the application lacks a dedicated profile bounded context. To adhere to strict domain segregation, protect sensitive credentials from accidental leakage, and optimize high-throughput auth operations, the platform adopts a two-table architecture: `users` (Authentication & Security Context) and `user_profiles` (Social Identity & Public Profile Context).

## Goals / Non-Goals

**Goals:**
- Create a dedicated `user_profiles` table linked 1:1 with `users` via `user_id` as primary key and foreign key (with `ON DELETE CASCADE`).
- Store social profile fields in `user_profiles`: `username` (unique slug), `bio`, `avatar_url`, `cover_url`, `location`, `website`, `date_of_birth`, and `gender`.
- Ensure automatic initialization of `user_profiles` upon local user registration and OAuth first-time login.
- Build a dedicated `UsersController` exposing:
  - `GET /api/v1/users/me`: Authenticated endpoint returning unified account info and profile data.
  - `PATCH /api/v1/users/me`: Update profile fields (`fullName`, `username`, `bio`, `location`, `website`, `dateOfBirth`, `gender`).
  - `GET /api/v1/users/:idOrUsername`: Public profile lookup querying `user_profiles` directly, physically isolated from auth credentials.
  - `GET /api/v1/users/check-username`: Fast availability check for handle availability.
- Implement an enterprise-grade `StorageModule` integrating with Supabase Storage via S3-compatible API (`@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`):
  - Presigned upload URL generation for avatar and cover media with MIME-type and size validation.
  - Safe deletion of old media when replacing or removing profile pictures.
- Emit `user.profile.updated` event to RabbitMQ `weshare.topic` exchange for downstream consumers (feed caches, search indexer).
- Provide automated TypeORM database migration with backward-compatible data backfill for existing users.

**Non-Goals:**
- Client-side image cropping and visual manipulation (handled by frontend before upload).
- User relationship / friendship / follow graphs (handled in subsequent `interactions` or `follows` modules).
- Full-text search over profiles (handled by Meilisearch consumer in search sync queue).

## Decisions

### 1. Two-Table Bounded Context Architecture (`users` and `user_profiles`)
- **Decision**: Separate authentication data from social profile data into two distinct tables with a 1:1 relation.
  ```
  ┌─────────────────────────┐               ┌─────────────────────────┐
  │          users          │ 1           1 │      user_profiles      │
  ├─────────────────────────┤               ├─────────────────────────┤
  │ id (UUID, PK)           │◄──────────────┤ user_id (UUID, PK, FK)  │
  │ email (unique)          │               │ username (varchar, UQ)  │
  │ password_hash           │               │ bio (text)              │
  │ full_name               │               │ avatar_url (text)       │
  │ is_email_verified       │               │ cover_url (text)        │
  │ role, status            │               │ location (varchar 100)  │
  │ google_id, github_id    │               │ website (varchar 255)   │
  │ created_at, updated_at  │               │ date_of_birth (date)    │
  │ deleted_at              │               │ gender (enum)           │
  └─────────────────────────┘               │ created_at, updated_at  │
                                            └─────────────────────────┘
  ```
- **Rationale**:
  1. **Zero-Leakage Security Isolation**: Public profile endpoints (`GET /api/v1/users/:idOrUsername`) query `user_profiles` directly. Sensitive fields like `password_hash`, `google_id`, `github_id`, and `email` are stored in a different physical table, eliminating any chance of accidental exposure via loose ORM queries.
  2. **PostgreSQL Buffer Cache & Index Efficiency**: High-frequency auth requests (JWT validation on every protected route) only query `users` by `id`. The `users` table remains compact (few columns, small row size), fitting snugly into RAM buffer pages.
  3. **Reduced MVCC Dead Tuples & Row Locks**: Updates to user profile fields (bio, avatar, website) only create dead tuples in `user_profiles`. The `users` table and its indexes on `email` and `id` remain untouched and unfragmented.
  4. **Domain-Driven Design (DDD)**: Separates the **Identity & Access Management (IAM)** bounded context from the **Social Profile & Community** bounded context.
- **Alternatives Considered**: A single `users` table was evaluated. While it simplifies sign-up slightly, it couples sensitive auth credentials with mutable public profile fields and risks security leaks on public endpoints.

### 2. Automatic Profile Initialization Lifecycle
- **Decision**: When creating a user (`createLocalUser` or `createOrUpdateOAuthUser`), create the corresponding `UserProfile` record within the same database transaction.
- **Rationale**: Guarantees referential integrity so that every active user has an associated profile record. Default `username` is derived from the email prefix + unique hash (e.g., `user_a1b2c3d4`), which users can customize immediately.

### 3. Client-Side Direct Upload via S3 Presigned URLs vs Backend Proxy
- **Decision**: Generate short-lived presigned PUT URLs via Supabase Storage S3-compatible API for direct client uploads.
- **Rationale**: Directly proxying multi-megabyte media files through the NestJS HTTP server wastes server bandwidth, spikes Node.js event loop memory, and harms API throughput. Presigned URLs delegate binary transfer to Supabase/S3 while the API enforces access control, naming conventions, and file size/type constraints.
- **Alternatives Considered**: Direct multipart/form-data upload to NestJS with Multer. Rejected due to memory overhead and unnecessary horizontal scaling bottlenecks on the API gateway.

### 4. Reusable Storage Integration Architecture
- **Decision**: Encapsulate S3 operations in `backend/src/integrations/storage/` as a shared `StorageModule` and `StorageService`.
- **Rationale**: Follows existing architectural patterns (such as `src/integrations/resend/`). Centralizes S3 credentials, bucket configuration, key prefixing (`avatars/<userId>/...`, `covers/<userId>/...`), and presigned URL signing. This module can be reused across future modules (posts, attachments, chat).

### 5. Username Handle Policy
- **Decision**: Usernames must be 3-30 characters, alphanumeric with underscores, periods, and hyphens (`^[a-zA-Z0-9_.-]{3,30}$`), stored in lowercase, indexed with a unique constraint on `LOWER(username)`.
- **Rationale**: Standard handle format matching modern social networks. 

### 6. Asynchronous Event Broadcasting
- **Decision**: Publish `user.profile.updated` to RabbitMQ `weshare.topic` after successful profile updates.
- **Rationale**: Keeps the HTTP request fast while allowing background workers to invalidate Redis caches and trigger Meilisearch re-indexing without synchronous coupling.

## Risks / Trade-offs

- **[Risk] Transaction Failure during Registration**: User created but profile creation fails.
  - **Mitigation**: Wrap user creation and initial profile creation inside a single TypeORM transaction or `QueryRunner`.
- **[Risk] Unused S3 Objects**: Clients generate presigned upload URLs but fail to complete the upload or never save the profile.
  - **Mitigation**: Presigned URLs expire after 15 minutes. Future background worker can run a scheduled cleanup of unreferenced storage keys.
- **[Risk] Username Race Condition**: Two concurrent requests attempting to claim the same username.
  - **Mitigation**: Database-level unique index on `LOWER(username)` in `user_profiles`. Service catches PostgreSQL error code `23505` and returns HTTP 409 `USERNAME_ALREADY_EXISTS`.

## Migration Plan

1. Create a TypeORM migration `CreateUserProfilesTable`:
   - Create enum `users_gender_enum`: `'MALE'`, `'FEMALE'`, `'OTHER'`, `'PREFER_NOT_TO_SAY'`.
   - Create table `user_profiles`:
     - `user_id` uuid NOT NULL PRIMARY KEY (FOREIGN KEY REFERENCES `users(id)` ON DELETE CASCADE),
     - `username` varchar(30) NOT NULL,
     - `bio` text,
     - `avatar_url` text,
     - `cover_url` text,
     - `location` varchar(100),
     - `website` varchar(255),
     - `date_of_birth` date,
     - `gender` users_gender_enum,
     - `created_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
     - `updated_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
   - Create unique index `IDX_user_profiles_username` on `user_profiles (LOWER(username))`.
   - Backfill existing users into `user_profiles`:
     ```sql
     INSERT INTO user_profiles (user_id, username, avatar_url, created_at, updated_at)
     SELECT id, 'user_' || SUBSTRING(id::text, 1, 8), avatar_url, now(), now()
     FROM users
     ON CONFLICT (user_id) DO NOTHING;
     ```
2. Rollback strategy: Drop table `user_profiles`, drop enum `users_gender_enum`.
