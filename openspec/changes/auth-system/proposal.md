## Why

WeShare currently lacks an authentication and authorization system, preventing users from creating accounts, signing in, and securing their profile and social data. To build a secure, robust social network platform, the system must provide:
1. Self-service registration with email OTP verification to prevent fake/spam accounts.
2. Multiple authentication strategies: standard email/password authentication and social OAuth2 logins (Google, GitHub).
3. Secure session management via short-lived JWT access tokens and rotatable refresh tokens.
4. Protection against automated credential-stuffing and brute-force attacks via Redis-backed rate limiting.
5. Predictable and standardized API exception responses across the entire backend to provide clear error diagnostics for client applications.

## What Changes

- **User & Auth Data Models**: Implement `User` entity with credentials, email verification status, and OAuth provider linkages; implement secure persistence for refresh tokens and verification OTPs.
- **Email OTP Verification Flow**: Generate cryptographically secure numeric OTPs, publish email delivery jobs via RabbitMQ topic `weshare.topic` (`email.otp.send`), and enforce expiry (e.g., 5-10 minutes) and maximum attempt limits.
- **Multi-Strategy Authentication**: Implement Passport strategies for Local (email/password with bcrypt hashing), Google OAuth2, and GitHub OAuth2.
- **JWT Token Management**: Issue short-lived Access Tokens (e.g., 15m) and long-lived Refresh Tokens (e.g., 7d) with automatic rotation upon refresh, session blacklisting on logout, and a global `JwtAuthGuard` with `@Public()` decorator bypass.
- **Brute-Force & Rate Limiting**: Configure `@nestjs/throttler` with Redis storage to throttle login and OTP verification endpoints, mitigating brute-force attacks.
- **Standardized Exception Architecture**: Create a global `HttpExceptionFilter` / `AllExceptionsFilter` standardizing error payloads (`statusCode`, `message`, `errorCode`, `timestamp`, `path`, `errors`), with support for `class-validator` bad request details.

## Capabilities

### New Capabilities
- `auth-identity`: User registration, Email OTP generation & verification for account activation, local password authentication (bcrypt), and social OAuth2 integration (Google & GitHub).
- `auth-token-management`: Issuance and validation of JWT Access Tokens and Refresh Tokens, refresh token rotation with reuse detection, revocation/logout, and route protection via `JwtAuthGuard`.
- `auth-security`: Brute-force and rate-limiting protection on authentication endpoints using Redis Throttler, along with a unified, structured exception response architecture.

### Modified Capabilities
<!-- None: this is a greenfield authentication system -->

## Impact

- **Backend Architecture**:
  - Adds `src/modules/auth/` and `src/modules/users/` modules.
  - Updates `src/app.module.ts` to import `TypeOrmModule`, `ThrottlerModule`, `AuthModule`, and `UsersModule`.
  - Updates `src/main.ts` to register the global `HttpExceptionFilter` and `JwtAuthGuard`.
  - Integrates RabbitMQ producer in `AuthService` to emit `email.otp.send` events.
  - Configures environment variables for JWT secrets, OAuth client IDs/secrets, Redis URL, and Resend/Email settings.
- **Database**:
  - Creates TypeORM migrations for `users` and `refresh_tokens` tables.
- **Client Impact**:
  - Consistent error responses with explicit `errorCode` and validation details across all `/api/v1/auth/*` endpoints.
