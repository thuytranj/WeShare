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

| Phương thức | Endpoint | Yêu cầu Auth | Mô tả |
|---|---|:---:|---|
| `GET` | `/api/v1/users/me` | Có | Lấy thông tin tài khoản & profile của chính mình |
| `PATCH` | `/api/v1/users/me/profile` | Có | Cập nhật avatar, cover, bio, settings |
| `GET` | `/api/v1/users/:username` | Tùy chọn | Xem hồ sơ công khai của một user |

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
