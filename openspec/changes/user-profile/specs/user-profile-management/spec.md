## ADDED Requirements

### Requirement: Automatic User Profile Creation
The system SHALL automatically initialize a corresponding `user_profiles` record whenever a new user is created through local registration or OAuth login within an atomic database transaction.

#### Scenario: Profile initialization on local registration
- **WHEN** a user registers successfully via `POST /api/v1/auth/register`
- **THEN** the system SHALL create a record in `users` and a linked record in `user_profiles` with a default unique `username` handle within the same transaction.

#### Scenario: Profile initialization on OAuth registration
- **WHEN** a new user signs in for the first time via Google or GitHub OAuth
- **THEN** the system SHALL create the `users` record and initialize the `user_profiles` record with the OAuth user's avatar and a unique default username.

### Requirement: Retrieve Authenticated User Profile
The system SHALL provide an authenticated endpoint `GET /api/v1/users/me` that returns the combined account and profile data of the currently logged-in user.

#### Scenario: Successfully retrieve own profile
- **WHEN** an authenticated user with a valid JWT requests `GET /api/v1/users/me`
- **THEN** the system SHALL return HTTP 200 OK with the composite profile object containing `id`, `email`, `username`, `fullName`, `avatarUrl`, `coverUrl`, `bio`, `location`, `website`, `dateOfBirth`, `gender`, `role`, `status`, `isEmailVerified`, and timestamps.

#### Scenario: Unauthorized profile retrieval
- **WHEN** an unauthenticated client or a client with an expired/invalid token requests `GET /api/v1/users/me`
- **THEN** the system SHALL return HTTP 401 Unauthorized.

### Requirement: Update Personal Profile
The system SHALL provide an authenticated endpoint `PATCH /api/v1/users/me` allowing users to update their personal information (`fullName`, `username`, `bio`, `location`, `website`, `dateOfBirth`, and `gender`). The system SHALL persist profile fields to `user_profiles` and name to `users` atomically.

#### Scenario: Successfully update profile information
- **WHEN** an authenticated user submits valid profile updates to `PATCH /api/v1/users/me`
- **THEN** the system SHALL update `user_profiles` (and `users.full_name` if provided), publish a `user.profile.updated` event to RabbitMQ, and return HTTP 200 OK with the updated composite profile.

#### Scenario: Updating username to an already taken handle
- **WHEN** an authenticated user attempts to change their `username` to one already claimed by another user in `user_profiles`
- **THEN** the system SHALL reject the request with HTTP 409 Conflict and error code `USERNAME_ALREADY_EXISTS`.

#### Scenario: Submitting invalid profile data
- **WHEN** a user submits an invalid website URL (not a valid HTTP/HTTPS URL) or a bio exceeding 500 characters
- **THEN** the system SHALL reject the request with HTTP 400 Bad Request containing validation error details.

### Requirement: Retrieve Public User Profile
The system SHALL provide a public endpoint `GET /api/v1/users/:idOrUsername` that allows clients to look up a user by either their UUID or their unique `username`. The response MUST query from `user_profiles` and MUST guarantee zero exposure of private credentials, email, or OAuth IDs.

#### Scenario: Successfully retrieve public profile by username
- **WHEN** a client requests `GET /api/v1/users/:username` with an existing handle
- **THEN** the system SHALL return HTTP 200 OK with public fields (`id`, `username`, `fullName`, `avatarUrl`, `coverUrl`, `bio`, `location`, `website`, `createdAt`) and exclude sensitive fields (`email`, `passwordHash`, `googleId`, `githubId`, `role`, `status`).

#### Scenario: Successfully retrieve public profile by UUID
- **WHEN** a client requests `GET /api/v1/users/:id` with a valid existing user UUID
- **THEN** the system SHALL return HTTP 200 OK with the public profile payload.

#### Scenario: Non-existent user lookup
- **WHEN** a client requests a profile for a username or ID that does not exist in `user_profiles`
- **THEN** the system SHALL return HTTP 404 Not Found with error code `USER_NOT_FOUND`.

### Requirement: Check Username Availability
The system SHALL provide an endpoint `GET /api/v1/users/check-username?username=<handle>` that allows clients to check whether a specific username handle is available before saving.

#### Scenario: Checking an available username
- **WHEN** a client queries an unassigned username in `user_profiles` satisfying format rules `^[a-zA-Z0-9_.-]{3,30}$`
- **THEN** the system SHALL return HTTP 200 OK with `{ available: true, username: "<handle>" }`.

#### Scenario: Checking a taken username
- **WHEN** a client queries a username handle that already exists in `user_profiles`
- **THEN** the system SHALL return HTTP 200 OK with `{ available: false, username: "<handle>" }`.

#### Scenario: Checking an invalid username format
- **WHEN** a client queries a username shorter than 3 characters or containing prohibited characters
- **THEN** the system SHALL return HTTP 400 Bad Request with validation errors.
