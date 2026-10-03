## ADDED Requirements

### Requirement: Request Presigned Upload URL for Avatar
The system SHALL provide an authenticated endpoint `POST /api/v1/users/me/avatar/presigned-url` allowing users to obtain a short-lived presigned PUT URL to upload an avatar directly to the Supabase S3-compatible storage bucket.

#### Scenario: Successfully generate avatar presigned upload URL
- **WHEN** an authenticated user submits a request with a valid image MIME type (`image/jpeg`, `image/png`, `image/webp`) and file size <= 5MB
- **THEN** the system SHALL return HTTP 200 OK containing the presigned `uploadUrl`, the designated S3 `fileKey` (prefixed under `avatars/<userId>/`), the resulting `publicUrl`, and an `expiresIn` duration (e.g. 900 seconds).

#### Scenario: Requesting upload with unsupported MIME type
- **WHEN** a user requests an upload URL with a non-image MIME type (e.g. `application/pdf`, `video/mp4`)
- **THEN** the system SHALL reject the request with HTTP 400 Bad Request and error code `UNSUPPORTED_MEDIA_TYPE`.

#### Scenario: Requesting upload exceeding size limit
- **WHEN** a user requests an avatar upload with declared size exceeding 5,242,880 bytes (5MB)
- **THEN** the system SHALL reject the request with HTTP 400 Bad Request and error code `FILE_SIZE_LIMIT_EXCEEDED`.

### Requirement: Request Presigned Upload URL for Cover Photo
The system SHALL provide an authenticated endpoint `POST /api/v1/users/me/cover/presigned-url` allowing users to obtain a short-lived presigned PUT URL to upload a cover banner image directly to storage.

#### Scenario: Successfully generate cover presigned upload URL
- **WHEN** an authenticated user submits a request with a valid image MIME type and file size <= 10MB
- **THEN** the system SHALL return HTTP 200 OK containing `uploadUrl`, designated S3 `fileKey` (prefixed under `covers/<userId>/`), `publicUrl`, and `expiresIn`.

#### Scenario: Requesting cover upload exceeding 10MB limit
- **WHEN** a user requests a cover upload with declared size exceeding 10,485,760 bytes (10MB)
- **THEN** the system SHALL reject the request with HTTP 400 Bad Request and error code `FILE_SIZE_LIMIT_EXCEEDED`.

### Requirement: Update Profile Avatar URL
The system SHALL provide an authenticated endpoint `PUT /api/v1/users/me/avatar` to update the user's `avatarUrl` in `user_profiles` after a client successfully completes direct upload to storage.

#### Scenario: Successfully update avatar URL
- **WHEN** an authenticated user submits a valid public URL pointing to the uploaded avatar in the platform's media bucket
- **THEN** the system SHALL update `avatarUrl` on the `user_profiles` entity, trigger async cleanup for the old avatar file if present, publish `user.profile.updated` event to RabbitMQ, and return HTTP 200 OK with the updated user profile.

#### Scenario: Submitting invalid avatar URL
- **WHEN** a user submits an invalid or external URL not matching the authorized storage domain
- **THEN** the system SHALL reject the request with HTTP 400 Bad Request and error code `INVALID_MEDIA_URL`.

### Requirement: Remove Profile Avatar
The system SHALL provide an authenticated endpoint `DELETE /api/v1/users/me/avatar` allowing users to remove their profile avatar and revert to default.

#### Scenario: Successfully remove avatar
- **WHEN** an authenticated user issues a request to `DELETE /api/v1/users/me/avatar`
- **THEN** the system SHALL set `avatarUrl` to `null` in `user_profiles`, trigger deletion of the existing avatar asset from storage, publish `user.profile.updated` event to RabbitMQ, and return HTTP 200 OK.

### Requirement: Update Profile Cover Photo URL
The system SHALL provide an authenticated endpoint `PUT /api/v1/users/me/cover` to update the user's `coverUrl` in `user_profiles` after completing direct upload.

#### Scenario: Successfully update cover photo URL
- **WHEN** an authenticated user submits a valid public URL pointing to the uploaded cover photo
- **THEN** the system SHALL update `coverUrl` on the `user_profiles` entity, trigger async cleanup for the old cover image if present, publish `user.profile.updated` event to RabbitMQ, and return HTTP 200 OK with the updated user profile.

### Requirement: Remove Profile Cover Photo
The system SHALL provide an authenticated endpoint `DELETE /api/v1/users/me/cover` allowing users to remove their cover banner.

#### Scenario: Successfully remove cover photo
- **WHEN** an authenticated user issues a request to `DELETE /api/v1/users/me/cover`
- **THEN** the system SHALL set `coverUrl` to `null` in `user_profiles`, trigger deletion of the existing cover asset from storage, publish `user.profile.updated` event to RabbitMQ, and return HTTP 200 OK.
