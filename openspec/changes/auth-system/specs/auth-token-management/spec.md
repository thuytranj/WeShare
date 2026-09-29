## ADDED Requirements

### Requirement: JWT Token Pair Issuance
The system SHALL issue a dual-token pair upon successful authentication: a short-lived signed JWT Access Token (15 minutes lifespan) containing the user's ID, email, and roles, and an opaque or signed Refresh Token (7 days lifespan) persisted with cryptographic hash in the database.

#### Scenario: Issuing token pair on authentication
- **WHEN** authentication (credentials login, OAuth, or OTP verification) completes successfully
- **THEN** the system SHALL generate an Access Token (15-minute TTL) and a Refresh Token (7-day TTL), persist the hashed refresh token with family ID, and return both in the response body.

### Requirement: Refresh Token Rotation
The system SHALL provide an endpoint `POST /api/v1/auth/refresh` allowing authenticated clients to exchange a valid refresh token for a newly issued access token and a newly rotated refresh token. The submitted refresh token SHALL be invalidated upon issuance of the replacement token.

#### Scenario: Successful token refresh and rotation
- **WHEN** a client sends a valid, unrevoked refresh token to `POST /api/v1/auth/refresh`
- **THEN** the system SHALL revoke the submitted refresh token, issue a new access token and a new refresh token sharing the same family ID, persist the new record, and return HTTP 200 OK with the new token pair.

### Requirement: Refresh Token Reuse Detection
The system SHALL detect if an already-revoked refresh token is re-submitted to `POST /api/v1/auth/refresh`. Upon detecting reuse, the system SHALL immediately invalidate all refresh tokens belonging to the compromised token family to prevent unauthorized session hijacking.

#### Scenario: Revoked token reuse triggers family revocation
- **WHEN** a client submits a refresh token that has already been marked as revoked or replaced
- **THEN** the system SHALL revoke all active refresh tokens associated with that token family, reject the request with HTTP 401 Unauthorized, and return error code `TOKEN_REUSE_DETECTED`.

### Requirement: User Logout and Token Blacklisting
The system SHALL provide an endpoint `POST /api/v1/auth/logout` that revokes the active refresh token and blacklists the current JWT access token identifier in Redis until its natural expiration.

#### Scenario: Successful user logout
- **WHEN** an authenticated user calls `POST /api/v1/auth/logout` with Bearer access token and refresh token
- **THEN** the system SHALL mark the refresh token as revoked, add the access token JTI to the Redis blacklist with TTL equal to its remaining lifespan, and return HTTP 200 OK with message "Logout successful".

#### Scenario: Request with blacklisted access token
- **WHEN** a client sends an HTTP request using an access token that has been blacklisted in Redis
- **THEN** the system SHALL reject the request with HTTP 401 Unauthorized and error code `TOKEN_REVOKED`.

### Requirement: Global JWT Route Guarding
The system SHALL protect all API routes by default using `JwtAuthGuard`. Endpoints that do not require authentication SHALL be explicitly annotated with the custom `@Public()` decorator.

#### Scenario: Protected endpoint accessed without token
- **WHEN** an unauthenticated client requests an endpoint without a Bearer token
- **THEN** the system SHALL reject the request with HTTP 401 Unauthorized and error code `UNAUTHORIZED`.

#### Scenario: Public endpoint accessed without token
- **WHEN** an unauthenticated client requests an endpoint decorated with `@Public()` (e.g., `POST /api/v1/auth/login`)
- **THEN** the system SHALL permit the request to proceed without requiring a JWT Bearer header.
