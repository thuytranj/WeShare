## ADDED Requirements

### Requirement: Brute-Force Rate Limiting
The system SHALL protect sensitive authentication routes against brute-force attacks by integrating `@nestjs/throttler` backed by Redis storage.

#### Scenario: Exceeding login attempt threshold
- **WHEN** more than 5 login attempts from the same IP/identifier occur within a 60-second window
- **THEN** the system SHALL reject subsequent attempts with HTTP 429 Too Many Requests and error code `TOO_MANY_REQUESTS`.

#### Scenario: Exceeding OTP verification attempts
- **WHEN** more than 5 OTP verification requests from the same IP/identifier occur within a 60-second window
- **THEN** the system SHALL reject subsequent requests with HTTP 429 Too Many Requests and error code `TOO_MANY_REQUESTS`.

### Requirement: Standardized Exception Response Architecture
The system SHALL intercept all thrown HTTP exceptions and uncaught server errors via a global exception filter (`AllExceptionsFilter` / `HttpExceptionFilter`), formatting the response into a consistent, machine-readable JSON structure containing `statusCode`, `errorCode`, `message`, `timestamp`, `path`, and `errors`.

#### Scenario: Formatting domain or HTTP exceptions
- **WHEN** an endpoint throws an `HttpException` (e.g., `UnauthorizedException`, `NotFoundException`, `ConflictException`)
- **THEN** the global filter SHALL catch it and respond with the appropriate HTTP status code and a JSON body containing:
  - `statusCode`: HTTP status number
  - `errorCode`: specific error code string (e.g., `INVALID_CREDENTIALS`, `NOT_FOUND`)
  - `message`: human-readable summary
  - `timestamp`: ISO-8601 string
  - `path`: request URL path
  - `errors`: optional array of specific error objects

#### Scenario: Formatting unhandled internal server errors
- **WHEN** an unexpected runtime exception is thrown during request handling
- **THEN** the global filter SHALL log the error with stack trace internally, and return HTTP 500 Internal Server Error with `errorCode: "INTERNAL_SERVER_ERROR"` and generic message "An unexpected error occurred", without leaking internal implementation details or stack traces to the client.

### Requirement: Structured Validation Error Formatting
The system SHALL configure the global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`, and a custom exception factory that maps class-validator errors into clean, structured `{ field, message }` items in the `errors` array of the standardized exception envelope.

#### Scenario: Request body validation failure
- **WHEN** a client sends a payload missing required fields or containing invalid data types to an endpoint
- **THEN** the system SHALL return HTTP 400 Bad Request with `errorCode: "VALIDATION_ERROR"`, `message: "Validation failed"`, and an `errors` array enumerating each failing field and validation rule.
