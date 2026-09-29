## 1. Foundation & Database Setup

- [x] 1.1 Create `User` entity with TypeORM Data Mapper in `backend/src/modules/users/entities/user.entity.ts` with UUIDv4, email, passwordHash, fullName, avatarUrl, status, isEmailVerified, googleId, githubId, and audit columns.
- [x] 1.2 Create `RefreshToken` entity in `backend/src/modules/auth/entities/refresh-token.entity.ts` with UUIDv4, userId, tokenHash, familyId, isRevoked, expiresAt, and audit columns.
- [x] 1.3 Create TypeORM migration for `users` and `refresh_tokens` tables in `backend/src/database/migrations/`.
- [x] 1.4 Configure `TypeOrmModule.forRootAsync` in `backend/src/app.module.ts` using `SnakeNamingStrategy` and entity auto-discovery.

## 2. Common Security & Exception Handling

- [x] 2.1 Define custom `AppException` class and `ErrorCode` enum in `backend/src/common/exceptions/`.
- [x] 2.2 Implement `GlobalExceptionFilter` in `backend/src/common/filters/global-exception.filter.ts` standardizing HTTP errors into `{ statusCode, errorCode, message, timestamp, path, errors }`.
- [x] 2.3 Implement custom validation exception factory for `ValidationPipe` in `backend/src/main.ts` returning structured field validation errors.
- [x] 2.4 Configure `@nestjs/throttler` with Redis storage in `backend/src/app.module.ts` and set up endpoint throttle guards.
- [x] 2.5 Implement `@Public()` and `@CurrentUser()` custom decorators in `backend/src/common/decorators/`.

## 3. Asynchronous Email Queue & OTP Lifecycle

- [x] 3.1 Implement Redis client service for storing and verifying OTPs (`auth:otp:<email>`) with TTL (600s) and attempt tracking.
- [x] 3.2 Implement RabbitMQ producer service in `backend/src/queue/` emitting `email.otp.send` events to exchange `weshare.topic`.
- [x] 3.3 Implement OTP generation, storage, resend cooldown (60s), and verification methods in `AuthService`.

## 4. Identity & Authentication Endpoints

- [x] 4.1 Create DTOs with `class-validator` for registration (`RegisterDto`), login (`LoginDto`), verify OTP (`VerifyOtpDto`), and resend OTP (`ResendOtpDto`).
- [x] 4.2 Implement user creation, lookup, and password verification in `UsersService`.
- [x] 4.3 Implement `POST /api/v1/auth/register` endpoint with email OTP dispatch.
- [x] 4.4 Implement `POST /api/v1/auth/verify-otp` endpoint for account activation and initial token issuance.
- [x] 4.5 Implement `POST /api/v1/auth/resend-otp` endpoint with rate-limiting and cooldown enforcement.
- [x] 4.6 Implement `POST /api/v1/auth/login` endpoint with password verification and brute-force throttling.

## 5. OAuth2 Integration (Google & GitHub)

- [x] 5.1 Implement `GoogleStrategy` using `passport-google-oauth20` in `backend/src/modules/auth/strategies/google.strategy.ts`.
- [x] 5.2 Implement `GithubStrategy` using `passport-github2` in `backend/src/modules/auth/strategies/github.strategy.ts`.
- [x] 5.3 Implement OAuth callback handling in `AuthService` to resolve or create verified user and link provider ID.
- [x] 5.4 Add `GET /api/v1/auth/google`, `/callback` and `GET /api/v1/auth/github`, `/callback` routes to `AuthController`.

## 6. JWT Token Management & Route Protection

- [x] 6.1 Implement `JwtStrategy` using `passport-jwt` validating bearer tokens and verifying Redis blacklist.
- [x] 6.2 Implement `JwtAuthGuard` and register it as global `APP_GUARD` in `AppModule`.
- [x] 6.3 Implement Token pair generator (Access Token 15m, Refresh Token 7d) and SHA-256 persistence in `AuthService`.
- [x] 6.4 Implement `POST /api/v1/auth/refresh` endpoint supporting Refresh Token Rotation and token reuse anomaly detection.
- [x] 6.5 Implement `POST /api/v1/auth/logout` endpoint invalidating refresh token and blacklisting access token in Redis.

## 7. Verification & Testing

- [x] 7.1 Write unit tests for `AuthService` (register, OTP verification, login, refresh rotation, brute-force protection).
- [x] 7.2 Write unit tests for `GlobalExceptionFilter` verifying response envelopes and validation error mapping.
- [x] 7.3 Run `npm run build` and `npm run test` in `backend/` to verify type checking and test suite execution.
