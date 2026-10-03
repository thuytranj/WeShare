# 04. Đặc tả API & Hợp đồng WebSocket (API Specification)

---

## 1. Chuẩn Thiết kế RESTful API

### 1.1. Base URL & Versioning
- Mọi endpoint API đều có tiền tố phiên bản: `/api/v1`
- Định dạng dữ liệu trao đổi: `application/json; charset=utf-8`

### 1.2. Xác thực & Phân quyền (Authentication Headers)
- Các endpoint yêu cầu đăng nhập phải gửi header:
  ```http
  Authorization: Bearer <jwt_access_token>
  ```
- Cookie HttpOnly chứa `refreshToken` cho endpoint làm mới token.

### 1.3. Cấu trúc Response Chuẩn

#### A. Thành công (Success Response)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thao tác thành công",
  "data": { ... },
  "meta": {
    "cursor": "018e6a71-4a92-7efc-a81d-e0bc1e921820",
    "hasNextPage": true,
    "totalCount": 142
  },
  "timestamp": "2026-09-19T16:00:00.000Z"
}
```

#### B. Thất bại (Error Response - Chuẩn RFC 7807)
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Email đã tồn tại trên hệ thống",
  "errors": [
    {
      "field": "email",
      "issue": "Email must be a valid email address"
    }
  ],
  "timestamp": "2026-09-19T16:00:00.000Z"
}
```

---

## 2. Bảng Danh mục REST API (Endpoints Matrix)

### 2.1. Module Xác thực (Auth)

| Phương thức | Endpoint | Yêu cầu Auth | Mô tả |
|---|---|:---:|---|
| `POST` | `/api/v1/auth/register` | Không | Đăng ký tài khoản, gửi OTP kích hoạt |
| `POST` | `/api/v1/auth/verify-otp` | Không | Xác thực OTP 6 số để kích hoạt tài khoản |
| `POST` | `/api/v1/auth/resend-otp` | Không | Gửi lại OTP (giới hạn 60s/lần) |
| `POST` | `/api/v1/auth/login` | Không | Đăng nhập Local (trả về Access & Refresh Token) |
| `POST` | `/api/v1/auth/refresh` | Không | Dùng Refresh Token để cấp lại Access Token mới |
| `POST` | `/api/v1/auth/logout` | Có | Đăng xuất, vô hiệu hóa Refresh Token trong Redis |
| `POST` | `/api/v1/auth/forgot-password`| Không | Gửi mã OTP xác thực quên mật khẩu |
| `POST` | `/api/v1/auth/reset-password` | Không | Đổi mật khẩu mới kèm mã reset token |
| `GET` | `/api/v1/auth/oauth/google` | Không | Bắt đầu quy trình OAuth Google |
| `GET` | `/api/v1/auth/oauth/github` | Không | Bắt đầu quy trình OAuth GitHub |
| `GET` | `/api/v1/auth/sessions` | Có | Xem danh sách các thiết bị/phiên đang đăng nhập |
| `DELETE` | `/api/v1/auth/sessions/:id` | Có | Đăng xuất khỏi một thiết bị cụ thể |
| `DELETE` | `/api/v1/auth/sessions/other` | Có | Đăng xuất khỏi tất cả các thiết bị khác |

### 2.2. Module Người dùng & Hồ sơ (Users & Profile)

#### A. Danh mục Endpoints

| Phương thức | Endpoint | Yêu cầu Auth | Mô tả |
|---|---|:---:|---|
| `GET` | `/api/v1/users/me` | Có | Lấy thông tin tài khoản & profile đầy đủ của chính mình |
| `PATCH` | `/api/v1/users/me` | Có | Cập nhật thông tin cá nhân (họ tên, username, bio, location, website, dob, gender) |
| `GET` | `/api/v1/users/check-username` | Không | Kiểm tra tính khả dụng của username handle (`?username=...`) |
| `GET` | `/api/v1/users/:idOrUsername` | Không | Xem hồ sơ công khai theo UUID hoặc username handle |
| `POST` | `/api/v1/users/me/avatar/presigned-url` | Có | Lấy presigned URL upload ảnh đại diện (avatar) trực tiếp lên Supabase S3 |
| `PUT` | `/api/v1/users/me/avatar` | Có | Cập nhật avatar URL và tự động xóa file avatar cũ trên S3 |
| `DELETE` | `/api/v1/users/me/avatar` | Có | Xóa avatar về mặc định và dọn dẹp file trên S3 |
| `POST` | `/api/v1/users/me/cover/presigned-url` | Có | Lấy presigned URL upload ảnh bìa (cover) trực tiếp lên Supabase S3 |
| `PUT` | `/api/v1/users/me/cover` | Có | Cập nhật cover URL và tự động xóa ảnh bìa cũ trên S3 |
| `DELETE` | `/api/v1/users/me/cover` | Có | Xóa ảnh bìa và dọn dẹp file trên S3 |

#### B. Đặc tả Chi tiết Request & Response

##### 1. `GET /api/v1/users/me`
- **Mô tả**: Trả về dữ liệu tài khoản và profile cá nhân đầy đủ của user đang đăng nhập.
- **Headers**: `Authorization: Bearer <jwt_access_token>`
- **Response `200 OK`**:
  ```json
  {
    "id": "a3ffb1c0-c841-6b9f-c6f9-07b743300000",
    "email": "user@example.com",
    "fullName": "Alex Morgan",
    "username": "alex_morgan",
    "bio": "Web developer & community builder",
    "avatarUrl": "https://example.supabase.co/storage/v1/object/public/weshare-media/avatars/uuid.jpg",
    "coverUrl": "https://example.supabase.co/storage/v1/object/public/weshare-media/covers/uuid.jpg",
    "location": "Hà Nội, Việt Nam",
    "website": "https://alex.dev",
    "dateOfBirth": "1996-01-15",
    "gender": "PREFER_NOT_TO_SAY",
    "role": "USER",
    "status": "ACTIVE",
    "isEmailVerified": true,
    "createdAt": "2026-09-20T10:00:00.000Z",
    "updatedAt": "2026-09-21T12:00:00.000Z"
  }
  ```

##### 2. `PATCH /api/v1/users/me`
- **Mô tả**: Cập nhật thông tin profile. Nếu đổi username, hệ thống kiểm tra tính duy nhất trên `user_profiles (LOWER(username))`. Phát sự kiện `user.profile.updated` qua RabbitMQ.
- **Headers**: `Authorization: Bearer <jwt_access_token>`
- **Request Body**:
  ```json
  {
    "fullName": "Alex Morgan",
    "username": "alex_m",
    "bio": "Passionate software engineer building WeShare communities.",
    "location": "Hà Nội",
    "website": "https://alex.dev",
    "dateOfBirth": "1996-01-15",
    "gender": "MALE"
  }
  ```
- **Validation Rules**:
  - `fullName`: string, độ dài 1-100 ký tự (tùy chọn)
  - `username`: string, độ dài 3-30 ký tự, regex `^[a-zA-Z0-9_.-]{3,30}$` (tùy chọn, lưu chữ thường)
  - `bio`: string, tối đa 500 ký tự (tùy chọn)
  - `location`: string, tối đa 100 ký tự (tùy chọn)
  - `website`: string, chuẩn URL HTTP/HTTPS, tối đa 255 ký tự (tùy chọn)
  - `dateOfBirth`: string chuẩn ISO date `YYYY-MM-DD` (tùy chọn)
  - `gender`: enum `MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY` (tùy chọn)
- **Response `200 OK`**: Trả về dữ liệu profile cập nhật (như `GET /me`).
- **Mã lỗi thường gặp**:
  - `400 Bad Request`: `VALIDATION_ERROR` (dữ liệu không đúng định dạng)
  - `409 Conflict`: `USERNAME_ALREADY_EXISTS` (username đã có người dùng khác sử dụng)

##### 3. `GET /api/v1/users/check-username?username=<handle>`
- **Mô tả**: Kiểm tra nhanh username handle đã được đăng ký hay chưa.
- **Yêu cầu Auth**: Không (Public)
- **Query Params**: `username` (bắt buộc, 3-30 ký tự)
- **Response `200 OK`**:
  ```json
  {
    "username": "alex_m",
    "available": true
  }
  ```

##### 4. `GET /api/v1/users/:idOrUsername`
- **Mô tả**: Lấy thông tin hồ sơ công khai của người dùng bằng UUID hoặc username handle. Truy vấn trực tiếp từ bảng `user_profiles`, loại bỏ hoàn toàn các thông tin nhạy cảm (`email`, `passwordHash`, `googleId`, `githubId`, `role`, `status`).
- **Yêu cầu Auth**: Không (Public)
- **Response `200 OK`**:
  ```json
  {
    "id": "a3ffb1c0-c841-6b9f-c6f9-07b743300000",
    "username": "alex_m",
    "fullName": "Alex Morgan",
    "bio": "Web developer & community builder",
    "avatarUrl": "https://example.supabase.co/storage/v1/object/public/weshare-media/avatars/uuid.jpg",
    "coverUrl": "https://example.supabase.co/storage/v1/object/public/weshare-media/covers/uuid.jpg",
    "location": "Hà Nội, Việt Nam",
    "website": "https://alex.dev",
    "createdAt": "2026-09-20T10:00:00.000Z"
  }
  ```
- **Lỗi `404 Not Found`**: `USER_NOT_FOUND` (không tìm thấy người dùng)

##### 5. Quy trình Upload Avatar & Cover qua S3 Presigned URL
1. **Xin Presigned URL**:
   - `POST /api/v1/users/me/avatar/presigned-url` hoặc `POST /api/v1/users/me/cover/presigned-url`
   - Request Body:
     ```json
     {
       "mimeType": "image/jpeg",
       "fileSize": 2048000
     }
     ```
     *(Ràng buộc: MIME `image/jpeg`, `image/png`, `image/webp`. Kích thước avatar $\le$ 5MB, cover $\le$ 10MB)*
   - Response `200 OK`:
     ```json
     {
       "uploadUrl": "https://<project-ref>.supabase.co/storage/v1/s3/weshare-media/avatars/user-id/uuid.jpg?X-Amz-Algorithm=...",
       "fileKey": "avatars/user-id/uuid.jpg",
       "publicUrl": "https://<project-ref>.supabase.co/storage/v1/object/public/weshare-media/avatars/user-id/uuid.jpg",
       "expiresIn": 900
     }
     ```
2. **Client Upload trực tiếp**: Client gọi HTTP `PUT <uploadUrl>` kèm binary file và header `Content-Type: image/jpeg` trực tiếp lên Supabase S3.
3. **Cập nhật URL & Dọn dẹp**:
   - Client gọi `PUT /api/v1/users/me/avatar` (hoặc `PUT /api/v1/users/me/cover`) kèm `{ "avatarUrl": "<publicUrl>" }` hoặc `{ "coverUrl": "<publicUrl>" }`.
   - Backend lưu URL mới vào `user_profiles`, tự động xóa file cũ trên Storage và phát sự kiện `user.profile.updated` qua RabbitMQ.
4. **Xóa Avatar / Cover**:
   - Gọi `DELETE /api/v1/users/me/avatar` hoặc `DELETE /api/v1/users/me/cover`.
   - Backend set trường về `null`, xóa file cũ trên Storage và phát sự kiện `user.profile.updated`.


### 2.3. Module Media (Supabase Presigned URL)

| Phương thức | Endpoint | Yêu cầu Auth | Mô tả |
|---|---|:---:|---|
| `POST` | `/api/v1/media/presigned-url` | Có | Cấp Signed URL để client upload trực tiếp lên Supabase Storage |

### 2.4. Module Quan hệ Xã hội (Relationships)

| Phương thức | Endpoint | Yêu cầu Auth | Mô tả |
|---|---|:---:|---|
| `POST` | `/api/v1/relationships/friends/request/:userId` | Có | Gửi lời mời kết bạn |
| `PATCH` | `/api/v1/relationships/friends/respond/:requestId` | Có | Chấp nhận hoặc từ chối lời mời (`ACCEPT` / `REJECT`) |
| `DELETE` | `/api/v1/relationships/friends/:friendId` | Có | Hủy kết bạn (Unfriend) |
| `GET` | `/api/v1/relationships/friends/suggestions` | Có | Lấy danh sách gợi ý kết bạn (bạn chung) |
| `POST` | `/api/v1/relationships/follow/:userId` | Có | Theo dõi một người dùng |
| `DELETE` | `/api/v1/relationships/unfollow/:userId` | Có | Hủy theo dõi một người dùng |
| `POST` | `/api/v1/relationships/block/:userId` | Có | Chặn người dùng |
| `DELETE` | `/api/v1/relationships/unblock/:userId` | Có | Bỏ chặn người dùng |

### 2.5. Module Bài viết & Tương tác (Posts & Interactions)

| Phương thức | Endpoint | Yêu cầu Auth | Mô tả |
|---|---|:---:|---|
| `POST` | `/api/v1/posts` | Có | Tạo bài đăng mới (text, media, privacy) |
| `GET` | `/api/v1/posts/:postId` | Tùy chọn | Xem chi tiết bài viết |
| `PATCH` | `/api/v1/posts/:postId` | Có | Cập nhật nội dung/chế độ riêng tư bài viết |
| `DELETE` | `/api/v1/posts/:postId` | Có | Xóa bài viết (Soft delete) |
| `GET` | `/api/v1/feeds/timeline` | Có | Lấy bảng tin Newsfeed của người dùng (Cursor pagination) |
| `POST` | `/api/v1/posts/:postId/reactions` | Có | Thả cảm xúc (`LIKE`, `LOVE`, `CARE`...) |
| `DELETE` | `/api/v1/posts/:postId/reactions` | Có | Thu hồi cảm xúc đã thả |
| `GET` | `/api/v1/posts/:postId/comments` | Tùy chọn | Lấy danh sách bình luận (2 cấp) |
| `POST` | `/api/v1/posts/:postId/comments` | Có | Thêm bình luận hoặc trả lời bình luận |
| `POST` | `/api/v1/posts/:postId/share` | Có | Chia sẻ bài viết về trang cá nhân |
| `PATCH` | `/api/v1/posts/:postId/pin` | Có | Ghim / Bỏ ghim bài viết lên đầu trang Profile hoặc Group |
| `POST` | `/api/v1/posts/:postId/save` | Có | Lưu bài viết vào bộ sưu tập cá nhân (Bookmark) |
| `DELETE` | `/api/v1/posts/:postId/save` | Có | Hủy lưu / Bỏ bookmark bài viết |
| `GET` | `/api/v1/users/me/saved-posts` | Có | Lấy danh sách các bài viết đã lưu của tôi |
| `GET` | `/api/v1/users/me/saved-collections`| Có | Lấy danh sách tên các thư mục bộ sưu tập đã tạo |

### 2.6. Module Nhóm & Cộng đồng (Groups)

| Phương thức | Endpoint | Yêu cầu Auth | Mô tả |
|---|---|:---:|---|
| `POST` | `/api/v1/groups` | Có | Tạo nhóm mới |
| `GET` | `/api/v1/groups/:groupId` | Tùy chọn | Xem thông tin nhóm |
| `POST` | `/api/v1/groups/:groupId/join` | Có | Xin vào nhóm (Public vào ngay, Private chờ duyệt) |
| `GET` | `/api/v1/groups/:groupId/posts` | Tùy chọn | Xem bài viết trong nhóm |
| `PATCH` | `/api/v1/groups/:groupId/members/:userId`| Có | Thăng/hạ cấp hoặc duyệt thành viên |

### 2.7. Module Tin nhắn (Chat)

| Phương thức | Endpoint | Yêu cầu Auth | Mô tả |
|---|---|:---:|---|
| `GET` | `/api/v1/chat/conversations` | Có | Lấy danh sách cuộc trò chuyện gần nhất |
| `POST` | `/api/v1/chat/conversations/direct` | Có | Khởi tạo hoặc tìm cuộc trò chuyện 1:1 |
| `POST` | `/api/v1/chat/conversations/group` | Có | Tạo cuộc trò chuyện nhóm mới |
| `GET` | `/api/v1/chat/conversations/:id/messages` | Có | Lấy lịch sử tin nhắn (Cursor-based) |

### 2.8. Module Thông báo (Notifications)

| Phương thức | Endpoint | Yêu cầu Auth | Mô tả |
|---|---|:---:|---|
| `GET` | `/api/v1/notifications` | Có | Lấy danh sách thông báo |
| `PATCH` | `/api/v1/notifications/:id/read` | Có | Đánh dấu một thông báo đã đọc |
| `PATCH` | `/api/v1/notifications/read-all` | Có | Đánh dấu tất cả thông báo đã đọc |

### 2.9. Module Tìm kiếm & Khám phá (Search & Discovery — Meilisearch)

| Phương thức | Endpoint | Yêu cầu Auth | Mô tả |
|---|---|:---:|---|
| `GET` | `/api/v1/search` | Tùy chọn | Tìm kiếm tổng hợp (Users, Posts, Groups) có typo-tolerance |
| `GET` | `/api/v1/search/users` | Tùy chọn | Tìm kiếm người dùng với auto-complete |
| `GET` | `/api/v1/search/posts` | Tùy chọn | Tìm kiếm bài viết theo từ khóa nội dung |
| `GET` | `/api/v1/search/hashtags/:tag` | Tùy chọn | Lấy bài viết theo hashtag cụ thể |

### 2.10. Module Báo cáo & Quản trị Nền tảng (Reports & Platform Admin)

#### A. Dành cho Người dùng Báo cáo (User Reporting)
| Phương thức | Endpoint | Yêu cầu Auth | Mô tả |
|---|---|:---:|---|
| `POST` | `/api/v1/reports` | Có | Gửi báo cáo vi phạm bài viết, bình luận, người dùng hoặc nhóm |

#### B. Dành cho Admin Quản trị (Admin Protected - `@Roles('ADMIN')`)
| Phương thức | Endpoint | Yêu cầu Auth | Mô tả |
|---|---|:---:|---|
| `GET` | `/api/v1/admin/users` | Admin | Tìm kiếm, lọc danh sách toàn bộ người dùng |
| `PATCH` | `/api/v1/admin/users/:userId/status` | Admin | Khóa tạm thời, mở khóa, cấm vĩnh viễn tài khoản kèm lý do |
| `PATCH` | `/api/v1/admin/users/:userId/verify-manually`| Admin | Kích hoạt xác minh tài khoản thủ công |
| `PATCH` | `/api/v1/admin/users/:userId/role` | Admin | Thăng cấp hoặc hạ cấp quyền Admin |
| `GET` | `/api/v1/admin/reports` | Admin | Xem danh sách hàng đợi báo cáo vi phạm (filter theo trạng thái, loại) |
| `PATCH` | `/api/v1/admin/reports/:id/resolve` | Admin | Xử lý báo cáo (`RESOLVE` gỡ bài, `DISMISS` bỏ qua) |
| `DELETE` | `/api/v1/admin/posts/:postId` | Admin | Buộc xóa bài viết vi phạm toàn sàn (Ghi nhật ký Audit) |
| `DELETE` | `/api/v1/admin/groups/:groupId` | Admin | Giải tán nhóm vi phạm điều khoản (Ghi nhật ký Audit) |
| `GET` | `/api/v1/admin/analytics/overview` | Admin | Lấy chỉ số Dashboard (DAU, MAU, bài viết mới, active sockets) |
| `POST` | `/api/v1/admin/system/broadcast` | Admin | Gửi thông báo thông điệp toàn hệ thống |
| `GET` | `/api/v1/admin/audit-logs` | Admin | Xem lịch sử các hành động của Admin |

---

## 3. Hợp đồng Thời gian thực WebSocket (Socket.io Contracts)

### 3.1. Kết nối & Xác thực
Client kết nối tới WebSocket với JWT:
```javascript
const socket = io('https://weshare.io', {
  path: '/socket.io',
  auth: {
    token: `Bearer ${accessToken}`
  }
});
```

### 3.2. Bảng Sự kiện (Events Matrix)

#### A. Trò chuyện (Chat Events)

| Tên Sự kiện | Chiều | Payload | Mô tả |
|---|:---:|---|---|
| `chat:join_room` | Client $\rightarrow$ Server | `{ "conversationId": "uuid" }` | Tham gia vào phòng chat |
| `chat:leave_room` | Client $\rightarrow$ Server | `{ "conversationId": "uuid" }` | Rời khỏi phòng chat |
| `chat:send_message` | Client $\rightarrow$ Server | `{ "conversationId": "uuid", "content": "hello", "mediaUrls": [] }` | Gửi tin nhắn mới |
| `chat:new_message` | Server $\rightarrow$ Client | `{ "message": { ... }, "conversationId": "uuid" }` | Phát tin nhắn mới tới thành viên trong phòng |
| `chat:typing` | Client $\rightarrow$ Server | `{ "conversationId": "uuid", "isTyping": true }` | Báo trạng thái đang gõ |
| `chat:typing_status` | Server $\rightarrow$ Client | `{ "conversationId": "uuid", "userId": "uuid", "isTyping": true }` | Phát trạng thái gõ tới người khác |
| `chat:seen` | Client $\rightarrow$ Server | `{ "conversationId": "uuid", "lastReadMessageId": "uuid" }` | Báo đã đọc tin nhắn |
| `chat:seen_update` | Server $\rightarrow$ Client | `{ "conversationId": "uuid", "userId": "uuid", "lastReadMessageId": "uuid" }` | Đồng bộ trạng thái đã đọc |

#### B. Trạng thái Trực tuyến (Presence Events)

| Tên Sự kiện | Chiều | Payload | Mô tả |
|---|:---:|---|---|
| `presence:heartbeat` | Client $\rightarrow$ Server | `{}` | Gửi định kỳ mỗi 30 giây để duy trì trạng thái Online |
| `presence:status_change`| Server $\rightarrow$ Client | `{ "userId": "uuid", "status": "ONLINE" \| "OFFLINE", "lastSeen": "..." }` | Báo trạng thái hoạt động của bạn bè |

#### C. Thông báo (Notification Events)

| Tên Sự kiện | Chiều | Payload | Mô tả |
|---|:---:|---|---|
| `notification:new` | Server $\rightarrow$ Client | `{ "notification": { "id": "...", "type": "POST_REACTION", "content": "..." } }` | Đẩy thông báo tức thì lên màn hình chuông |
| `notification:badge_update` | Server $\rightarrow$ Client | `{ "unreadCount": 5 }` | Cập nhật số lượng thông báo chưa đọc trên badge |
