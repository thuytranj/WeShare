## ADDED Requirements

### Requirement: User Registration
The system SHALL provide an endpoint `POST /api/v1/auth/register` allowing prospective users to register with an email address, password, and full name. The password SHALL be securely hashed using bcrypt prior to database storage. Upon registration, the account SHALL have status `PENDING` and `isEmailVerified = false`.

#### Scenario: Successful user registration
- **WHEN** a client submits a valid email, name, and strong password to `POST /api/v1/auth/register`
- **THEN** the system SHALL create a user record in `PENDING` status, generate a 6-digit numeric OTP in Redis, publish an `email.otp.send` event to RabbitMQ, and return HTTP 201 Created with message "Registration successful. Please verify your email with the OTP sent."

#### Scenario: Registration with duplicate email
- **WHEN** a client submits a registration request with an email already registered in the system
- **THEN** the system SHALL reject the request with HTTP 409 Conflict and error code `EMAIL_ALREADY_EXISTS`.

#### Scenario: Registration with weak password
- **WHEN** a client submits a registration request with a password with fewer than 8 characters or missing required complexity
- **THEN** the system SHALL reject the request with HTTP 400 Bad Request and validation error details.

### Requirement: Email OTP Verification and Activation
The system SHALL provide an endpoint `POST /api/v1/auth/verify-otp` allowing users to activate their account by providing their registered email and the 6-digit OTP received via email.

#### Scenario: Successful account activation via valid OTP
- **WHEN** a user submits the correct 6-digit OTP for their email to `POST /api/v1/auth/verify-otp` before the 10-minute expiration
- **THEN** the system SHALL mark the user's `isEmailVerified` as true, update account status to `ACTIVE`, delete the OTP record from Redis, and return HTTP 200 OK along with an initial JWT token pair (access token and refresh token).

#### Scenario: Verification with expired or invalid OTP
- **WHEN** a user submits an incorrect OTP or an OTP after its 10-minute validity window
- **THEN** the system SHALL reject the request with HTTP 400 Bad Request, increment the failed attempt counter, and return error code `INVALID_OR_EXPIRED_OTP`.

#### Scenario: Verification exceeding maximum failed attempts
- **WHEN** a user enters an incorrect OTP 5 times consecutively
- **THEN** the system SHALL invalidate the current OTP in Redis and return HTTP 429 Too Many Requests with error code `OTP_MAX_ATTEMPTS_EXCEEDED`, requiring a new OTP to be requested.

### Requirement: Resend Email OTP
The system SHALL provide an endpoint `POST /api/v1/auth/resend-otp` allowing unverified users to request a fresh OTP.

#### Scenario: Successful OTP resend after cooldown period
- **WHEN** an unverified user requests a new OTP after the 60-second cooldown has elapsed
- **THEN** the system SHALL generate a new 6-digit OTP in Redis, publish an `email.otp.send` event to RabbitMQ, and return HTTP 200 OK.

#### Scenario: Resend OTP during cooldown window
- **WHEN** a user requests a new OTP before the 60-second cooldown period has elapsed
- **THEN** the system SHALL reject the request with HTTP 429 Too Many Requests and error code `OTP_RESEND_COOLDOWN`.

#### Scenario: Resend OTP for already verified account
- **WHEN** an already verified user requests an OTP resend
- **THEN** the system SHALL return HTTP 400 Bad Request with error code `ACCOUNT_ALREADY_VERIFIED`.

### Requirement: Local Password Authentication
The system SHALL provide an endpoint `POST /api/v1/auth/login` allowing users to authenticate using their registered email and password.

#### Scenario: Successful credentials login
- **WHEN** a user submits valid email and password credentials for an `ACTIVE` and verified account
- **THEN** the system SHALL return HTTP 200 OK containing user profile summary, an Access Token, and a Refresh Token.

#### Scenario: Login with incorrect credentials
- **WHEN** a user submits an incorrect email or password
- **THEN** the system SHALL reject the request with HTTP 401 Unauthorized and error code `INVALID_CREDENTIALS`.

#### Scenario: Login with unverified email
- **WHEN** a user submits valid credentials for an account where `isEmailVerified = false`
- **THEN** the system SHALL reject the request with HTTP 403 Forbidden and error code `EMAIL_NOT_VERIFIED`.

### Requirement: Google OAuth2 Authentication
The system SHALL provide endpoints `GET /api/v1/auth/google` and `GET /api/v1/auth/google/callback` to authenticate users via Google OAuth2.

#### Scenario: Successful Google authentication for new user
- **WHEN** a user completes Google consent and the callback is invoked with a valid Google profile
- **THEN** the system SHALL provision a new `User` record with `isEmailVerified = true`, `googleId` linked, and redirect or return HTTP 200 OK with the JWT token pair.

#### Scenario: Successful Google authentication for existing user
- **WHEN** a user authenticates with Google whose email matches an existing verified account
- **THEN** the system SHALL link `googleId` to the existing user record if not already linked, and return HTTP 200 OK with the JWT token pair.

### Requirement: GitHub OAuth2 Authentication
The system SHALL provide endpoints `GET /api/v1/auth/github` and `GET /api/v1/auth/github/callback` to authenticate users via GitHub OAuth2.

#### Scenario: Successful GitHub authentication
- **WHEN** a user completes GitHub authorization and the callback is invoked with a valid GitHub profile and verified primary email
- **THEN** the system SHALL provision or match the user record, link `githubId`, and return HTTP 200 OK with the JWT token pair.
