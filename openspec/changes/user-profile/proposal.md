## Why

Currently, the WeShare platform has authentication in place, but lacks backend infrastructure for users to manage their personal profiles and public identities. Users cannot customize their avatar, set a cover photo, specify a biography, claim a unique username handle, or update basic demographic information (location, website, date of birth, gender). 

To ensure strict bounded-context isolation between authentication credentials and social public data, prevent accidental data leaks, and optimize database buffer cache performance, WeShare separates user identities into two dedicated tables: `users` (authentication & account state) and `user_profiles` (social identity & personal profile data in a 1:1 relation).

## What Changes

- **Dedicated `user_profiles` Table & 1:1 Entity Relation**:
  - Create `user_profiles` table with `user_id` (PK & FK referencing `users.id` with CASCADE deletion).
  - Profile columns: `username` (unique, lowercase indexed handle), `bio`, `avatar_url`, `cover_url`, `location`, `website`, `date_of_birth`, `gender`, `created_at`, `updated_at`.
  - Establish TypeORM 1:1 bidirectional relation (`User` <-> `UserProfile`).
  - Automatically initialize a `UserProfile` record upon user registration or OAuth first-time login.
- **Personal Profile Retrieval**:
  - `GET /api/v1/users/me`: Return complete authenticated profile combining account info (`email`, `status`, `role`) with personal profile details.
  - `GET /api/v1/users/:idOrUsername`: Return public profile view querying `user_profiles` directly, guaranteed free from private credentials and auth tokens.
- **Profile Management & Updates**:
  - `PATCH /api/v1/users/me`: Partial update of profile fields (`fullName`, `username`, `bio`, `location`, `website`, `dateOfBirth`, `gender`) with validation and unique username enforcement.
- **Media Upload & Storage (Supabase S3 Compatible)**:
  - Create a reusable `StorageModule` and `StorageService` using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.
  - `POST /api/v1/users/me/avatar/presigned-url`: Generate secure presigned PUT URL for avatar upload with MIME and size constraints.
  - `PUT /api/v1/users/me/avatar` & `DELETE /api/v1/users/me/avatar`: Manage avatar URL and clean up old assets from storage.
  - `POST /api/v1/users/me/cover/presigned-url`: Generate secure presigned PUT URL for cover photo upload.
  - `PUT /api/v1/users/me/cover` & `DELETE /api/v1/users/me/cover`: Manage cover banner URL and clean up old assets.
- **Real-Time & Search Event Publishing**:
  - Publish `user.profile.updated` event to RabbitMQ `weshare.topic` exchange when a profile or avatar changes to keep search indexes and cached feed payloads in sync.

## Capabilities

### New Capabilities
- `user-profile-management`: Core `user_profiles` 1:1 entity architecture, personal information management, private profile retrieval (`/me`), public profile view (`/:idOrUsername`), and profile updates with username uniqueness checks.
- `profile-media-upload`: Secure S3/Supabase storage presigned upload generation for avatars and cover photos, file validation (MIME types, size limits), media deletion, and profile media URL updates.

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing. Leave empty if no requirement changes. -->

## Impact

- **Backend Code**:
  - Create `UserProfile` entity (`backend/src/modules/users/entities/user-profile.entity.ts`).
  - Update `User` entity (`backend/src/modules/users/entities/user.entity.ts`) with `@OneToOne` relation.
  - Create TypeORM migration creating `user_profiles` table, foreign keys, unique index on `LOWER(username)`, and backfilling profiles for existing users.
  - Update `UsersService` to manage `user_profiles` table, handle automatic profile creation on user registration, and support handle lookup.
  - Create `UsersController` (`backend/src/modules/users/users.controller.ts`) with Swagger documentation and DTOs.
  - Create `StorageModule` (`backend/src/integrations/storage/`) providing S3 presigned URL generation and asset deletion via Supabase Storage.
- **APIs**:
  - New endpoints under `/api/v1/users`: `GET /me`, `PATCH /me`, `GET /:idOrUsername`, `GET /check-username`, `POST /me/avatar/presigned-url`, `PUT /me/avatar`, `DELETE /me/avatar`, `POST /me/cover/presigned-url`, `PUT /me/cover`, `DELETE /me/cover`.
- **Infrastructure & Dependencies**:
  - Uses existing `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` dependencies already in `package.json`.
  - Interacts with Supabase Storage bucket `weshare-media` via S3-compatible credentials in `.env`.
  - Publishes `user.profile.updated` to RabbitMQ exchange `weshare.topic`.
