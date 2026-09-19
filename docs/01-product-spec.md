# 01. Đặc tả Sản phẩm (Product Requirement Document - PRD)

---

## 1. Tầm nhìn Sản phẩm & Đối tượng Mục tiêu

### 1.1. Tầm nhìn (Vision)
**WeShare** là một mạng xã hội thu nhỏ thế hệ mới (Mini Social Network), lấy sự kết nối chân thực, quyền riêng tư minh bạch và tương tác thời gian thực (real-time) làm trọng tâm. WeShare mang lại trải nghiệm tối giản, không rác thuật toán, tốc độ phản hồi tức thì và tôn trọng tối đa quyền riêng tư của người dùng.

### 1.2. Đối tượng Người dùng (Personas)
1. **User cá nhân (Socializer)**: Có nhu cầu kết nối bạn bè, gia đình, chia sẻ hình ảnh/video đời sống hàng ngày, chat trực tiếp 1:1 và tham gia các nhóm thảo luận.
2. **Creator / Key Opinion Consumer**: Chia sẻ kiến thức, bài viết, hình ảnh/video công khai, tương tác qua bài viết và theo dõi lượng người theo dõi (followers).
3. **Community Moderator (Admin nhóm)**: Tổ chức và điều hành các cộng đồng theo chủ đề (sở thích, học tập, công việc), kiểm duyệt bài viết và thành viên.

---

## 2. Đặc tả Chi tiết Tính năng (Feature Specifications)

### 2.1. Module Xác thực & Bảo mật (Authentication & Security)

#### A. Đăng ký & Xác thực Email OTP (Register with Email OTP)
- **Luồng hoạt động (User Flow)**:
  1. Người dùng nhập: `email`, `username`, `password`, `fullName`.
  2. Hệ thống kiểm tra trùng lặp `email` hoặc `username`.
  3. Nếu hợp lệ, hệ thống tạo mã OTP ngẫu nhiên 6 chữ số (ví dụ: `849201`), mã hóa và lưu trữ tạm vào Redis với TTL là 5 phút (`otp:register:{email}`).
  4. Backend đẩy một job vào RabbitMQ (`email.queue`) để gửi email kích hoạt qua **Resend**.
  5. Tài khoản được tạo ở trạng thái `isVerified = false`, `status = 'PENDING_VERIFICATION'`.
  6. Người dùng nhập mã OTP trên giao diện:
     - Nếu OTP khớp và còn hạn: Cập nhật `isVerified = true`, `status = 'ACTIVE'`, xóa OTP khỏi Redis, tự động đăng nhập và cấp cặp JWT tokens (Access Token + Refresh Token).
     - Nếu OTP sai: Báo lỗi và giới hạn tối đa 5 lần thử sai.
- **Quy tắc & Giới hạn (Business Rules)**:
  - Nút "Gửi lại mã OTP" (Resend OTP) chỉ được kích hoạt sau 60 giây (Client countdown + Redis rate limit).
  - Mật khẩu: Tối thiểu 8 ký tự, ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt.

#### B. Đăng nhập (Local Login & OAuth2)
- **Local Login**:
  - Input: `email` hoặc `username` + `password`.
  - Kiểm tra mật khẩu (băm bằng bcrypt với salt rounds = 12).
  - Kiểm tra tài khoản đã verify email chưa. Nếu chưa $\rightarrow$ redirect sang màn hình xác thực OTP.
  - Brute-force protection: Nhập sai 5 lần liên tiếp trong 15 phút $\rightarrow$ khóa đăng nhập tạm thời 15 phút trên Redis.
  - Thành công: Trả về `accessToken` (thời hạn 15 phút) và `refreshToken` (thời hạn 7 ngày). Refresh token được lưu vào HttpOnly Cookie và hash lưu trong database/Redis để có thể thu hồi khi cần.
- **Social OAuth2 (Google & GitHub)**:
  - Người dùng bấm "Tiếp tục với Google / GitHub".
  - Chuyển hướng đến màn hình xác thực của Provider.
  - Sau khi callback thành công:
    - Nếu email đã tồn tại: Liên kết Provider ID vào bảng `user_identities` và đăng nhập.
    - Nếu chưa tồn tại: Tạo mới tài khoản với `isVerified = true` (vì email từ Google/GitHub đã được verify), sinh `username` duy nhất dựa trên tên/email và hoàn tất đăng nhập.

#### C. Quên mật khẩu & Đổi mật khẩu mới (Forgot & Reset Password)
- **Luồng hoạt động**:
  1. Người dùng nhập email yêu cầu reset mật khẩu.
  2. Hệ thống kiểm tra email tồn tại (nếu không tồn tại vẫn trả về thông báo chung để tránh enumeration attack).
  3. Gửi mã OTP 6 số qua email (Resend) với TTL 10 phút.
  4. Xác thực OTP thành công $\rightarrow$ Cấp một `resetPasswordToken` dùng một lần (One-Time Token, TTL 10 phút).
  5. Người dùng gửi `resetPasswordToken` kèm `newPassword` $\rightarrow$ Cập nhật mật khẩu mới, vô hiệu hóa toàn bộ Refresh Token của các thiết bị hiện tại (force logout).

---

### 2.2. Module Hồ sơ Người dùng (User Profile)

- **Thông tin hồ sơ cơ bản**:
  - `avatarUrl`: Ảnh đại diện (hình tròn, tỉ lệ 1:1).
  - `coverUrl`: Ảnh bìa trang cá nhân (tỉ lệ 16:9 hoặc 3:1).
  - `bio`: Giới thiệu ngắn gọn (tối đa 250 ký tự).
  - `location`, `websiteUrl`, `dateOfBirth`, `gender` (`MALE`, `FEMALE`, `OTHER`, `SECRET`).
- **Cài đặt quyền riêng tư hồ sơ (Privacy Settings)**:
  - `friendListVisibility`: `PUBLIC`, `FRIENDS_ONLY`, `ONLY_ME`.
  - `whoCanSendFriendRequests`: `EVERYONE`, `FRIENDS_OF_FRIENDS`.
  - `whoCanMessageMe`: `EVERYONE`, `FRIENDS_ONLY`.

---

### 2.3. Module Quan hệ Bạn bè, Follow & Chặn (Social Graph)

#### A. Kết bạn (Friendship - Mối quan hệ 2 chiều)
- Trạng thái yêu cầu:
  - `PENDING`: Đang chờ phản hồi.
  - `ACCEPTED`: Đã là bạn bè.
  - `REJECTED`: Đã từ chối (có thể gửi lại sau khoảng thời gian cooldown 24h).
- Logic nghiệp vụ:
  - Khi A và B trở thành Bạn bè: Hệ thống tự động thiết lập trạng thái **Mutual Follow** (A follow B và B follow A).
  - Hủy kết bạn (`UNFRIEND`): Xóa quan hệ bạn bè, nhưng giữ tùy chọn có tiếp tục Follow bài viết public hay không.
- Gợi ý kết bạn (Friend Suggestions):
  - Thuật toán Heuristic bậc 1: Tìm những người có số bạn chung cao nhất (Mutual Friends Count $\ge 1$) mà chưa kết bạn và chưa bị chặn.
  - Sắp xếp giảm dần theo số lượng bạn chung.

#### B. Theo dõi (Follow / Unfollow - Mối quan hệ 1 chiều)
- User A có thể Follow User B mà không cần B đồng ý.
- Tất cả bài đăng ở chế độ `PUBLIC` của B sẽ hiển thị trên Feed của A.
- A có thể Unfollow B bất kỳ lúc nào mà không ảnh hưởng đến quan hệ bạn bè nếu họ là bạn.

#### C. Chặn người dùng (Block User)
- Khi A chặn B:
  - Tự động xóa quan hệ Bạn bè (`UNFRIEND`) và xóa quan hệ `FOLLOW` cả 2 chiều.
  - A và B không thể tìm thấy profile của nhau, không xem được bài đăng/bình luận của nhau.
  - Không thể gửi tin nhắn chat cho nhau (phòng chat 1:1 bị vô hiệu hóa).
  - B không nhận được bất kỳ thông báo nào về việc bị chặn.

---

### 2.4. Module Bài đăng & Đa phương tiện (Posts & Rich Media)

#### A. Đăng bài viết (Post Creation)
- **Nội dung bài đăng**:
  - Văn bản: Tối đa 5.000 ký tự. Hỗ trợ tự động nhận diện URL, hashtag (`#trend`), mention (`@username`).
  - Đa phương tiện đính kèm:
    - Ảnh: Hỗ trợ JPG, PNG, WEBP, GIF (tối đa 10 ảnh/post, kích thước tối đa 10MB/ảnh).
    - Video: Hỗ trợ MP4, MOV (tối đa 1 video/post, độ dài tối đa 5 phút, dung lượng tối đa 100MB).
- **Quyền riêng tư của bài viết (Post Privacy)**:
  - `PUBLIC`: Tất cả mọi người trên mạng xã hội đều xem được.
  - `FRIENDS`: Chỉ bạn bè 2 chiều mới xem được.
  - `PRIVATE`: Chỉ tác giả mới xem được.
  - `GROUP`: Chỉ thành viên trong nhóm cụ thể mới xem được.

#### B. Cơ chế tải tệp lên Supabase Storage (Presigned Upload Pipeline)
- Tránh làm tắc nghẽn backend NestJS bằng việc upload trực tiếp lên Storage:
  1. Client gửi request `POST /api/v1/media/presigned-url` kèm metadata (filename, mimeType, size).
  2. Backend kiểm tra hạn mức, tạo URL upload có chữ ký xác thực (Presigned S3 URL) từ Supabase Storage có hạn 10 phút.
  3. Client dùng phương thức `PUT` đẩy file trực tiếp từ trình duyệt lên Supabase.
  4. Sau khi upload thành công, Client gửi request `POST /api/v1/posts` kèm `mediaKeys` vừa upload.
  5. Backend lưu thông tin bài viết và bắn sự kiện qua RabbitMQ để tạo thumbnail ảnh/video ngầm nếu cần.

---

### 2.5. Module Tương tác Xã hội (Interactions: Comments, Reactions, Shares)

#### A. Bình luận & Trả lời bình luận (Comments & Replies)
- **Cấu trúc 2 cấp (2-level hierarchy)**:
  - Level 1: Root Comment (bình luận trực tiếp vào bài viết).
  - Level 2: Reply Comment (trả lời một Root Comment). Nếu trả lời một reply con, hệ thống vẫn gắn vào `rootCommentId` và mention tên người được reply (`@User`) để giữ giao diện phẳng gọn gàng, tránh bị lồng vô tận trên thiết bị di động.
- Hỗ trợ đính kèm 1 ảnh trong comment.

#### B. Cảm xúc đa dạng (Multi-Reactions)
- Các loại cảm xúc: `LIKE` (Thích), `LOVE` (Yêu thích), `CARE` (Thương thương), `HAHA` (Haha), `WOW` (Ngạc nhiên), `SAD` (Buồn), `ANGRY` (Phẫn nộ).
- Có thể react cho cả **Bài viết (Post)** và **Bình luận (Comment)**.
- Người dùng có thể đổi cảm xúc hoặc thu hồi cảm xúc đã thả.
- Tối ưu bộ đếm: Đếm tổng reaction và danh sách 3 cảm xúc phổ biến nhất được cache tại Redis và cập nhật bất đồng bộ.

#### C. Chia sẻ bài viết (Share / Repost)
- Cho phép chia sẻ bài viết của người khác về trang cá nhân của mình.
- Bài viết gốc phải ở chế độ `PUBLIC`. Nếu bài viết gốc ở chế độ `FRIENDS`, bài share chỉ hiển thị cho bạn chung của cả hai hoặc bị hạn chế.
- Cho phép người share viết thêm cảm nghĩ cá nhân (caption) và tự chọn chế độ riêng tư cho bài share (`PUBLIC`, `FRIENDS`, `PRIVATE`).

#### D. Lưu trữ Bài viết (Saved Posts & Collections)
- **Lưu dấu bài viết (Bookmark)**: Bất kỳ bài viết nào người dùng có quyền xem (Public, Friends, Group) đều có thể bấm nút **"Lưu bài viết"**.
- **Phân loại theo Bộ sưu tập (Collections)**:
  - Cho phép người dùng tạo các thư mục bộ sưu tập (ví dụ: *"Kiến thức Lập trình"*, *"Địa điểm ăn uống"*, *"Ý tưởng hay"*). Mặc định nếu không chọn sẽ lưu vào mục *"Tất cả bài viết đã lưu"*.
- **Quyền riêng tư tuyệt đối**: Danh sách bài viết đã lưu là hoàn toàn **riêng tư (Private)**, chỉ chính chủ tài khoản mới xem được. Tác giả bài viết không biết ai đã lưu bài của mình.
- **Xử lý khi bài gốc bị xóa**: Nếu bài viết gốc bị xóa mềm (chuyển vào thùng rác) hoặc bị xóa vĩnh viễn, bài viết trong danh sách đã lưu sẽ hiển thị trạng thái *"Nội dung này hiện không khả dụng"*.

#### E. Ghim Bài viết Lên Đầu (Pin Post)
- **Ghim trên Trang Cá nhân (Profile Pin)**:
  - Mỗi người dùng được phép ghim tối đa **1 bài viết** tiêu biểu nhất lên đầu dòng thời gian trang cá nhân của mình (bài giới thiệu bản thân, thành tựu, bài viết tâm đắc).
  - Khi ghim bài viết mới, bài viết cũ sẽ tự động được bỏ ghim.
- **Ghim trong Nhóm (Group Pin)**:
  - Chỉ `ADMIN` hoặc `MODERATOR` của nhóm mới có quyền ghim bài viết trong nhóm.
  - Cho phép ghim tối đa **3 bài viết** quan trọng (Nội quy nhóm, Thông báo khẩn, Thảo luận nổi bật) lên đầu bảng tin của nhóm.
- **Thứ tự hiển thị**: Các bài viết được ghim (`isPinned = true`) luôn được ưu tiên hiển thị ở vị trí trên cùng, kèm theo biểu tượng chiếc ghim 📌 trước khi đến các bài viết sắp xếp theo thời gian mới nhất.

---

### 2.6. Module Bảng tin (Newsfeed Engine)

- **Nguồn bài viết trên Newsfeed**:
  - Bài đăng của Bạn bè (chế độ `PUBLIC` và `FRIENDS`).
  - Bài đăng của Người đang theo dõi (chế độ `PUBLIC`).
  - Bài đăng nổi bật trong các Nhóm mà người dùng đã tham gia.
- **Mô hình xử lý Feed (Hybrid Fan-out)**:
  - Vì quy mô mạng xã hội vừa và nhỏ, áp dụng **Fan-out on Read với Redis Cache**:
    - Khi người dùng load feed, backend lấy danh sách IDs của bạn bè + người follow.
    - Truy vấn các bài viết mới nhất được sắp xếp theo `created_at DESC` có phân trang con trỏ (Cursor-based Pagination).
    - Cache danh sách post IDs của feed vào Redis per-user với thời gian sống 10 phút.
    - Khi có bạn bè đăng bài mới, hệ thống bắn sự kiện Socket để hiện thông báo badge *"Có bài viết mới"*.

---

### 2.7. Module Cộng đồng & Nhóm (Communities / Groups)

#### A. Phân loại Nhóm (Group Privacy)
- `PUBLIC`: Mọi người đều có thể tìm thấy nhóm, xem danh sách thành viên và các bài đăng thảo luận.
- `PRIVATE`: Chỉ thành viên trong nhóm mới xem được bài đăng và danh sách thành viên. Cần được mời hoặc được Admin duyệt mới có thể vào.

#### B. Phân quyền trong Nhóm (Role-Based Access Control - RBAC)
1. **Chủ nhóm (Owner / Admin)**:
   - Thay đổi thông tin nhóm (Tên, Ảnh bìa, Mô tả, Quy tắc nhóm, Quyền riêng tư).
   - Thăng/hạ cấp Quản trị viên (Moderator).
   - Duyệt hoặc từ chối yêu cầu gia nhập nhóm.
   - Xóa bài viết, cấm hoặc kích thành viên ra khỏi nhóm.
2. **Quản trị viên (Moderator)**:
   - Duyệt thành viên mới.
   - Duyệt bài viết (nếu nhóm bật chế độ *Post Moderation*).
   - Xóa các bài viết, bình luận vi phạm quy tắc.
3. **Thành viên (Member)**:
   - Đăng bài thảo luận, bình luận, thả cảm xúc.
   - Mời bạn bè tham gia nhóm.

---

### 2.8. Module Trò chuyện Thời gian thực (Real-time Chat 1:1 & Group Chat)

#### A. Trò chuyện 1:1 (Direct Message)
- Nhắn tin tức thì qua WebSocket (Socket.io).
- Trạng thái tin nhắn: `SENDING` $\rightarrow$ `SENT` $\rightarrow$ `DELIVERED` $\rightarrow$ `SEEN`.
- Tính năng phụ trợ:
  - Hiển thị người đối diện đang gõ (`isTyping`).
  - Hiển thị trạng thái Online / Thời gian hoạt động gần nhất (Last Seen) dựa trên Redis Presence.
  - Gửi ảnh, video, file đính kèm.

#### B. Trò chuyện Nhóm (Group Chat)
- Tạo nhóm chat từ 3 thành viên trở lên.
- Tùy chỉnh: Đổi tên nhóm chat, đổi ảnh đại diện nhóm chat, đổi màu chủ đề (theme/color).
- Quản lý thành viên: Thêm bạn bè vào đoạn chat, xem danh sách thành viên, rời khỏi nhóm chat.
- Tin nhắn hệ thống (System Messages): *"A đã thêm B vào nhóm"*, *"A đã đổi tên nhóm thành X"*.

---

### 2.9. Module Thông báo Thông minh (Smart Notifications)

#### A. Các loại sự kiện gửi thông báo (Notification Triggers)
- `FRIEND_REQUEST_RECEIVED`: Nhận được lời mời kết bạn.
- `FRIEND_REQUEST_ACCEPTED`: Lời mời kết bạn được chấp nhận.
- `POST_REACTION`: Có người thả cảm xúc vào bài viết của bạn.
- `POST_COMMENT`: Có người bình luận vào bài viết của bạn.
- `COMMENT_REPLY`: Có người trả lời bình luận của bạn.
- `USER_MENTIONED`: Được nhắc tên (@mention) trong bài viết hoặc bình luận.
- `GROUP_INVITATION`: Được mời vào nhóm.
- `GROUP_POST_APPROVED`: Bài viết trong nhóm đã được duyệt.

#### B. Gom cụm thông báo thông minh (Notification Aggregation)
- Thay vì gửi 50 thông báo riêng rẽ khi 50 người bấm Like, hệ thống gộp lại theo mẫu:
  - 1 người: *"Nguyễn Văn A đã thích bài viết của bạn."*
  - 2 người: *"Nguyễn Văn A và Trần Thị B đã thích bài viết của bạn."*
  - $\ge 3$ người: *"Nguyễn Văn A và 15 người khác đã thích bài viết của bạn."*
- Thông báo được đẩy tức thì qua WebSocket tới client đang online và lưu vào cơ sở dữ liệu để xem lại lịch sử.

---

### 2.10. Module Quản trị Nền tảng (Platform Admin & Moderation)

Vai trò `role = 'ADMIN'` trong bảng `users` đại diện cho **Quản trị viên toàn hệ thống WeShare** (khác biệt hoàn toàn với Admin của một Nhóm cụ thể). Admin nắm quyền giám sát, vận hành, bảo vệ an toàn cho nền tảng và người dùng:

#### A. Quản lý Người dùng (User Management)
- **Tra cứu & Quản lý Danh tính**: Tìm kiếm người dùng theo Email, Username, Tên, Trạng thái (`ACTIVE`, `PENDING_VERIFICATION`, `SUSPENDED`, `DEACTIVATED`).
- **Xử lý Vi phạm (Account Moderation)**:
  - **Khóa tài khoản tạm thời (Suspend)**: 24 giờ, 7 ngày hoặc 30 ngày kèm theo lý do vi phạm.
  - **Cấm vĩnh viễn (Permanent Ban)**: Vô hiệu hóa tài khoản, thu hồi toàn bộ phiên đăng nhập (JWT & Refresh Token).
  - **Mở khóa tài khoản (Unban / Reactivate)** khi người dùng khiếu nại thành công.
- **Hỗ trợ Kỹ thuật & Xác thực Thủ công**: Kích hoạt tài khoản (`isVerified = true`) nếu người dùng gặp sự cố không nhận được email OTP từ nhà mạng.
- **Phân quyền Quản trị (Admin Role Management)**: Cấp quyền hoặc thu hồi quyền Admin cho người dùng khác.

#### B. Kiểm duyệt Nội dung & Hàng đợi Báo cáo (Content Moderation & Report Queue)
- **Hàng đợi Báo cáo (Report Queue)**: Tiếp nhận các báo cáo từ người dùng về:
  - Bài viết (Post), Bình luận (Comment), Nhóm (Group), Người dùng (User).
  - Phân loại lý do: `SPAM`, `HATE_SPEECH`, `HARASSMENT`, `NUDITY_PORN`, `VIOLENCE`, `COPYRIGHT`, `OTHER`.
- **Hành động Xử lý của Admin (Moderator Actions)**:
  - `DISMISS`: Bỏ qua báo cáo nếu nội dung hợp lệ.
  - `TAKE_DOWN`: Gỡ bỏ / Xóa vĩnh viễn bài viết hoặc bình luận vi phạm.
  - `WARN_USER`: Gửi thông báo cảnh cáo chính thức từ hệ thống tới người vi phạm.
  - `RESTRICT_USER`: Hạn chế quyền đăng bài/bình luận của user trong một khoảng thời gian nhất định mà không cần khóa toàn bộ tài khoản.

#### C. Quản lý Nhóm & Cộng đồng Toàn sàn (Platform Group Oversight)
- Giám sát toàn bộ các nhóm trên hệ thống (kể cả nhóm `PRIVATE` khi có nhiều báo cáo vi phạm pháp luật/chính sách).
- Giải tán nhóm vi phạm chính sách cộng đồng.
- Chỉ định Admin mới cho nhóm nếu Admin/Owner cũ bị khóa tài khoản hoặc xóa tài khoản.

#### D. Bảng điều khiển & Đo lường Tăng trưởng (Admin Dashboard & Analytics)
- **Chỉ số Tăng trưởng (Growth Metrics)**:
  - DAU (Daily Active Users), MAU (Monthly Active Users).
  - Tỉ lệ đăng ký mới (New User Registrations), tỉ lệ hoàn tất kích hoạt OTP.
- **Chỉ số Tương tác (Engagement Metrics)**:
  - Tổng số bài viết mới, bình luận, lượt reaction phát sinh theo ngày/tuần.
  - Biểu đồ lưu lượng Socket.io connections đang hoạt động đồng thời (Concurrent Active Sockets).
- **Giám sát Tài nguyên & Hạ tầng (Infrastructure Health)**:
  - Thống kê email gửi qua Resend (Số lượng gửi, tỉ lệ thành công, bounce rate).
  - Dung lượng lưu trữ đã sử dụng trên Supabase Storage.
  - Số lượng tin nhắn chờ trong RabbitMQ queues.

#### E. Thông báo Toàn hệ thống & Cấu hình Nền tảng (System Broadcast & Config)
- **System Broadcast**: Gửi thông báo đại trà tới toàn bộ người dùng WeShare (thông báo cập nhật tính năng, lịch bảo trì hệ thống).
- **Bật/Tắt chế độ Bảo trì (Maintenance Mode)**: Cho phép chỉ có tài khoản Admin mới truy cập được ứng dụng khi đang nâng cấp hệ thống.

#### F. Nhật ký Hoạt động Quản trị (Admin Audit Logs)
- Mọi thao tác nhạy cảm của Admin (Khóa user, Xóa bài của người khác, Đổi role, Duyệt report) đều bắt buộc phải ghi lại lịch sử audit:
  - `adminId`: Ai thực hiện.
  - `action`: Hành động gì (`BAN_USER`, `DELETE_POST`, `RESOLVE_REPORT`).
  - `targetType` & `targetId`: Đối tượng bị tác động.
  - `reason`: Lý do xử lý.
  - `ipAddress`: Địa chỉ IP và thời gian thực hiện.

---

## 3. Yêu cầu Phi chức năng (Non-Functional Requirements)

1. **Hiệu năng (Performance)**:
   - Thời gian phản hồi API (p95 latency) $\le 150\text{ms}$ cho các truy vấn thông thường.
   - Thời gian nhận tin nhắn chat / thông báo realtime $\le 100\text{ms}$.
   - Tối ưu phân trang với Cursor Pagination cho Feed và Chat để tránh chậm khi offset lớn.
2. **Tính sẵn sàng & Khả năng mở rộng (Scalability & High Availability)**:
   - Kiến trúc Modular Monolith cho phép dễ dàng phân tách thành microservices độc lập trong tương lai nếu một module (như Chat hoặc Feed) có lượng tải đột biến.
   - Socket.io sử dụng Redis Pub/Sub adapter cho phép chạy nhiều container backend sau Nginx Load Balancer mà không làm đứt liên lạc.
3. **Bảo mật (Security)**:
   - Mã hóa mật khẩu với Bcrypt (Salt rounds = 12).
   - Truyền tải an toàn qua HTTPS và WSS (TLS 1.3).
   - Bảo vệ chống CSRF, XSS (Sanitize HTML), CORS chỉ định domain frontend.
   - Rate limiting trên Nginx và NestJS Guards chống DDOS và Brute-force attacks.
