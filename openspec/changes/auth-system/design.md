## Context

WeShare requires a production-grade authentication and authorization system. As a modern social network platform, WeShare must handle high concurrency, protect against credential stuffing/brute-force attacks, and integrate cleanly with third-party identity providers (Google, GitHub) while supporting standard email/password authentication.

The architecture follows the WeShare Modular Monolith guidelines:
- Domain modules: `src/modules/auth/` and `src/modules/users/`.
- TypeORM Data Mapper with PostgreSQL 16 (UUIDv4 primary keys, snake_case schema, explicit migrations).
- Redis 7 for distributed rate-limiting and temporary OTP state.
- RabbitMQ 3 (`weshare.topic` exchange) for asynchronous email notifications (`email.otp.send`).
- Standardized global exception filter and response envelope across all HTTP endpoints.

## Goals / Non-Goals

**Goals:**
- Provide secure user registration with password hashing via bcrypt (salt rounds 10).
- Issue 6-digit numeric Email OTP stored in Redis with 10-minute TTL and max-attempt threshold (max 5 failed attempts per code).
- Dispatch OTP emails asynchronously via RabbitMQ topic `weshare.topic` with routing key `email.otp.send`.
- Verify OTP and activate user accounts (`isEmailVerified = true`, `status = ACTIVE`).
- Provide Local credentials login (email + password) and OAuth2 social logins (Google and GitHub) via Passport strategies.
- Manage JWT sessions using dual tokens: short-lived Access Token (15 min) and long-lived Refresh Token (7 days).
- Implement Refresh Token Rotation with automatic reuse detection (invalidating session families upon reuse anomaly).
- Provide a logout endpoint that revokes the active refresh token and blacklists the access token in Redis until its expiration.
- Protect sensitive authentication endpoints against brute-force attacks using `@nestjs/throttler` with Redis storage.
- Establish a global exception filter (`AllExceptionsFilter` / `HttpExceptionFilter`) standardizing error payloads with uniform `statusCode`, `errorCode`, `message`, `timestamp`, `path`, and validation `errors`.

**Non-Goals:**
- Time-based One-Time Password (TOTP) / Authenticator apps or SMS OTP (deferred to 2FA enhancement).
- Self-service password reset / forgot password flow (will be handled as an immediate follow-up change).
- Social profile sync (importing friends/followers from Google/GitHub).
- UI component implementation (scoped strictly to backend API).

## Decisions

### 1. Module Structure and Boundaries
- `src/modules/users/`: Manages user data model (`User` entity), repository, user lookups, and profile state.
- `src/modules/auth/`: Encapsulates authentication controllers, Passport strategies (Local, Jwt, Google, GitHub), OTP lifecycle, token generation, refresh rotation, and session invalidation.
- *Rationale*: Keeps user profile management decoupled from credential verification and session tokens, adhering to Modular Monolith Bounded Contexts.

### 2. OTP Lifecycle in Redis vs PostgreSQL
- OTPs are stored exclusively in Redis using key pattern:
  - `auth:otp:<email>` -> `{ codeHash, attempts, expiresAt }` (TTL: 600s).
  - `auth:otp:resend:<email>` -> cooldown lock (TTL: 60s).
- *Rationale*: OTPs are short-lived, transient secrets. Storing them in Redis eliminates unneeded database writes, automatic TTL expiration avoids cron purge scripts, and Redis atomic operations (`INCR`, `SETNX`) prevent race conditions.

### 3. Asynchronous OTP Email Dispatch via RabbitMQ
- Upon registration or resend request, `AuthService` publishes an event to RabbitMQ:
  - Exchange: `weshare.topic`
  - Routing Key: `email.otp.send`
  - Payload: `{ email: string, otp: string, fullName: string, expiresAt: string }`
- *Rationale*: Eliminates third-party email provider latency (Resend / SMTP) from the user registration HTTP response time, keeping API latency sub-50ms.

### 4. JWT Dual-Token Lifecycle & Rotation Strategy
- **Access Token**: Contains `{ sub: userId, email: string, role: string }`, signed with `JWT_SECRET`, expires in 15 minutes.
- **Refresh Token**: Cryptographically random 64-byte hex string (or signed JWT), stored in PostgreSQL `refresh_tokens` entity:
  - Fields: `id` (UUID), `userId`, `tokenHash` (SHA-256), `familyId` (UUID), `isRevoked` (boolean), `expiresAt` (Date).
- **Rotation & Reuse Detection**:
  - When `/auth/refresh` is called with a valid token, the token is marked revoked and a new refresh token with the same `familyId` is issued.
  - If a revoked token is presented, the system flags a token reuse incident, revokes all tokens sharing that `familyId`, and rejects the request.
- **Logout**: Revokes the refresh token record and writes the access token's `jti` to Redis blacklist with TTL matching the access token's remaining lifespan.

### 5. Global Guard Architecture with `@Public()` Metadata
- A global `JwtAuthGuard` is registered via `APP_GUARD` in `AppModule`.
- Routes are protected by default; public routes (`/auth/register`, `/auth/verify-otp`, `/auth/login`, `/auth/refresh`, `/auth/google`, `/auth/github`) are decorated with `@Public()`.
- *Rationale*: Prevents developer oversight where a newly created sensitive endpoint is accidentally left unauthenticated.

### 6. Brute-Force Rate Limiting Strategy
- Configure `@nestjs/throttler` with Redis storage (`ThrottlerStorageRedisService`).
- Endpoint limits:
  - `POST /api/v1/auth/login`: 5 requests per 60 seconds per IP/email.
  - `POST /api/v1/auth/verify-otp`: 5 requests per 60 seconds per IP/email.
  - `POST /api/v1/auth/resend-otp`: 3 requests per 300 seconds per IP/email.
  - `POST /api/v1/auth/register`: 5 requests per 60 seconds per IP.
- *Rationale*: Mitigates credential-stuffing and OTP-guessing attacks distributed across automated bots.

### 7. Unified Global Exception Response Envelope
- Implement `GlobalExceptionFilter` registered in `main.ts` catching `HttpException` and standard errors.
- Unified response structure:
  ```json
  {
    "statusCode": 400,
    "errorCode": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "timestamp": "2026-09-27T15:36:00.000Z",
    "path": "/api/v1/auth/login",
    "errors": []
  }
  ```
- Validation errors from `ValidationPipe` are transformed into structured `{ field, message }` arrays under `errors`.

## Risks / Trade-offs

- **[Risk: OAuth Email Conflict]** → A user signs up with Email/Password, then attempts "Login with Google" using the same email address.
  - *Mitigation*: If the email is already verified, link the `googleId` to the existing `User` record upon successful OAuth validation. If the existing account email is not yet verified, require the user to verify email first or link manually.
- **[Risk: Redis Outage]** → If Redis is unavailable, rate-limiting or OTP verification could fail.
  - *Mitigation*: Configure Redis with connection retry and health check alerts. If Redis fails, throw `ServiceUnavailableException` with `errorCode: SERVICE_UNAVAILABLE` rather than allowing unthrottled operations.
- **[Risk: Refresh Token Database Bloat]** → Continuous token rotation creates multiple records per user over time.
  - *Mitigation*: Implement a scheduled daily cron job on `weshare-worker` to purge expired or revoked refresh tokens older than 30 days in batches of 1,000 rows.

## Migration Plan

1. Generate and run TypeORM migration creating `users` and `refresh_tokens` tables.
2. Ensure Redis and RabbitMQ services are running and accessible via environment variables.
3. Deploy backend API with `AuthModule` and `UsersModule`.
4. Deploy worker service with `email.otp.send` consumer.
