# WeShare — Project Documentation Suite

Chào mừng bạn đến với bộ tài liệu đặc tả kỹ thuật và sản phẩm của **WeShare** — Mạng xã hội thu nhỏ hiệu năng cao, mở rộng và sẵn sàng cho môi trường Production.

---

## 📚 Mục lục tài liệu (Documentation Index)

1. [**01. Đặc tả sản phẩm (Product Requirement Document - PRD)**](01-product-spec.md)
   - Tầm nhìn sản phẩm, User Personas, Core Value.
   - Chi tiết các chức năng: Auth (Email OTP, OAuth2, Password Reset), Profile, Friendship & Follow, Posts & Rich Media, Comments & Reactions, Newsfeed, Communities (Groups), Real-time Chat 1:1 & Group, Notifications.
   - Các business rules, edge cases và cơ chế bảo mật/chống spam.

2. [**02. Đặc tả kiến trúc kỹ thuật (System Architecture Specification)**](02-architecture-spec.md)
   - Kiến trúc **Modular Monolith** kết hợp Phân tách Tiến trình (**Process Segregation**: `weshare-api` vs `weshare-worker`).
   - Cơ chế bất đồng bộ (Event-Driven) với **RabbitMQ** (Exchanges, Queues, DLX).
   - Cơ chế bộ nhớ đệm & Real-time scaling với **Redis** & **Socket.io Redis Adapter**.
   - Pipeline upload media trực tiếp lên **Supabase Storage** (Presigned URL) & dọn dẹp file mồ côi.
   - Chiến lược Soft Delete kết hợp **Chunked Deletion** dọn rác định kỳ lúc 02:00 AM.
   - Cấu hình Reverse Proxy, Rate limiting & Load balancing với **Nginx**.
   - Chuẩn tổ chức thư mục tách biệt `backend/` và `frontend/`.

3. [**03. Thiết kế Cơ sở dữ liệu & TypeORM Schema (Database Schema & ERD)**](03-database-schema.md)
   - Sơ đồ quan hệ thực thể (ERD).
   - Thiết kế chi tiết các bảng, trường dữ liệu, khóa chính/ngoại, chỉ mục (Index) tối ưu truy vấn.
   - Chiến lược migrations và quản lý kết nối TypeORM trên PostgreSQL.

4. [**04. Đặc tả API & WebSocket Contracts (API Specification)**](04-api-spec.md)
   - Chuẩn RESTful API, phân trang (Cursor-based & Offset-based pagination), xử lý lỗi chuẩn RFC 7807.
   - Danh sách endpoints theo từng module nghiệp vụ.
   - Bảng sự kiện Socket.io (Client Emit & Server Broadcast) cho Chat và Notifications.

5. [**05. Cẩm nang phối hợp cùng AI Agent (Antigravity Senior Dev Playbook)**](05-antigravity-dev-playbook.md)
   - Quy trình làm việc thực chiến chuẩn Senior Developer với Antigravity.
   - Cách kích hoạt và phối hợp Subagents (`be-specialist`, `fe-specialist`, `qa-verifier`).
   - Tận dụng Skills (`modern-web-guidance`, `chrome-devtools`, `a11y-debugging`) và MCP Tools (`StitchMCP`).
   - Lộ trình Sprint triển khai (Sprint 1 đến Sprint 6).

---

## 🏗️ Cấu trúc thư mục Codebase cấp cao (High-level Directory Structure)

```
WeShare/
├── docs/                        # Tài liệu đặc tả kỹ thuật và sản phẩm
├── backend/                     # NestJS Modular Monolith API, TypeORM, Socket.io
│   ├── src/
│   │   ├── main.ts              # API entrypoint (HTTP REST + Socket.io)
│   │   ├── worker.ts            # Worker entrypoint (RabbitMQ consumers + Scheduled cron jobs)
│   │   ├── common/              # Decorators, Filters, Guards, Interceptors, Pipes
│   │   ├── config/              # Configuration service & validation (Joi/Zod)
│   │   ├── database/            # TypeORM config, migrations, data-source
│   │   ├── integrations/        # Resend (Email), Supabase (Storage S3)
│   │   ├── queue/               # RabbitMQ publisher & consumer setup
│   │   ├── jobs/                # Scheduled periodic data purge jobs
│   │   └── modules/             # Bounded contexts (Auth, Users, Posts, Chat, Admin...)
│   ├── test/                    # Unit, Integration & E2E tests
│   ├── Dockerfile
│   └── package.json
├── frontend/                    # React + Vite + Tailwind CSS Client
│   ├── src/
│   │   ├── assets/              # Static images, svg
│   │   ├── components/          # Reusable UI components (ui/ & shared/)
│   │   ├── features/            # Feature-based components & hooks
│   │   ├── hooks/               # Custom react hooks
│   │   ├── layouts/             # Main layout, Auth layout, Chat layout
│   │   ├── routes/              # React Router v6 configuration
│   │   ├── services/            # Axios instance, API clients, Socket client
│   │   ├── stores/              # Zustand state management
│   │   └── types/               # TypeScript interfaces & types
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── package.json
├── docker-compose.yml           # Local orchestration (Postgres, Redis, RabbitMQ, Nginx, Apps)
├── docker-compose.prod.yml      # Production stack
├── nginx/                       # Nginx reverse proxy configuration
│   ├── nginx.conf
│   └── conf.d/
└── .gitignore
```
