# Service Marketplace — Database Schema (MVP)

---

## Nhóm 1: User & Authentication

### 1. `users`

Quản lý người dùng hệ thống (Admin, Customer, Provider).

| Attribute | Data Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `uuid` | PK, Not Null | Khóa chính |
| `email` | `varchar(255)` | Unique (partial), Nullable | Email đăng nhập |
| `phone` | `varchar(20)` | Unique (partial), Nullable | Số điện thoại |
| `password_hash` | `varchar(255)` | Nullable | Mật khẩu đã hash |
| `role` | `enum` | Not Null, Default: `customer` | `admin`, `customer`, `provider` |
| `is_verified` | `boolean` | Default: false | Trạng thái xác thực |
| `is_active` | `boolean` | Default: true | Trạng thái tài khoản |
| `last_login_at` | `timestamp` | Nullable | Lần đăng nhập cuối |
| `failed_login_attempts` | `int` | Default: 0 | Số lần đăng nhập sai |
| `account_locked_until` | `timestamp` | Nullable | Thời gian khóa |
| `created_at` | `timestamp` | | |
| `updated_at` | `timestamp` | | |
| `deleted_at` | `timestamp` | Nullable | Soft delete |

---

### 2. `profiles`

Thông tin hồ sơ người dùng (1-1 với users).

| Attribute | Data Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `uuid` | PK, Not Null | Khóa chính |
| `user_id` | `uuid` | FK → `users.id`, Unique | Liên kết user |
| `full_name` | `varchar(255)` | Nullable | Họ tên |
| `display_name` | `varchar(100)` | Nullable | Tên hiển thị |
| `avatar_url` | `varchar(500)` | Nullable | Ảnh đại diện |
| `bio` | `text` | Nullable | Giới thiệu |
| `address` | `varchar(255)` | Nullable | Địa chỉ |
| `birthday` | `date` | Nullable | Ngày sinh |
| `gender` | `varchar(10)` | Nullable | Giới tính |
| `display_name_history` | `jsonb` | Nullable | Lịch sử đổi tên |
| `metadata` | `jsonb` | Nullable | Thông tin thêm |
| `created_at` | `timestamp` | | |
| `updated_at` | `timestamp` | | |

---

### 3. `refresh_tokens`

Quản lý refresh token (multi-device).

| Attribute | Data Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `uuid` | PK, Not Null | Khóa chính |
| `user_id` | `uuid` | FK → `users.id` | Người dùng |
| `token_hash` | `varchar(500)` | Unique, Not Null | Hash token |
| `device_id` | `varchar(255)` | Nullable | Thiết bị |
| `expires_at` | `timestamp` | Not Null | Hết hạn |
| `is_revoked` | `boolean` | Default: false | Thu hồi |
| `created_at` | `timestamp` | | |

---

## Nhóm 2: Post & Quote

### 4. `post_customer`

Bài đăng yêu cầu dịch vụ của khách.

| Attribute | Data Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `uuid` | PK, Not Null | Khóa chính |
| `title` | `varchar(255)` | Not Null | Tiêu đề |
| `description` | `text` | Not Null | Mô tả |
| `image_urls` | `text[]` | Nullable | Ảnh |
| `location` | `varchar(255)` | Nullable | Địa điểm |
| `desired_time` | `timestamp` | Nullable | Thời gian mong muốn |
| `budget` | `decimal(10,2)` | Nullable | Ngân sách |
| `status` | `enum` | Default: `open` | Trạng thái |
| `customer_id` | `uuid` | FK → `users.id` | Người đăng |
| `created_at` | `timestamp` | | |
| `updated_at` | `timestamp` | | |
| `deleted_at` | `timestamp` | Nullable | Soft delete |

---

### 5. `quotes`

Báo giá từ provider.

| Attribute | Data Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `uuid` | PK | |
| `post_id` | `uuid` | FK → `post_customer.id` | Bài đăng |
| `provider_id` | `uuid` | FK → `users.id` | Thợ |
| `price` | `decimal(12,2)` | Not Null | Giá |
| `description` | `text` | Not Null | Mô tả |
| `terms` | `text` | Nullable | Điều khoản |
| `estimated_duration` | `int` | Nullable | Thời gian |
| `image_urls` | `text[]` | Nullable | Ảnh |
| `status` | `enum` | Default: `pending` | Trạng thái |
| `revision_count` | `int` | Default: 1 | Số lần chỉnh sửa |
| `created_at` | `timestamp` | | |
| `updated_at` | `timestamp` | | |
| `deleted_at` | `timestamp` | Nullable | |

---

### 6. `quote_revisions`

Lịch sử chỉnh sửa báo giá.

| Attribute | Data Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `uuid` | PK | |
| `quote_id` | `uuid` | FK → `quotes.id` | Báo giá |
| `price` | `decimal(12,2)` | Not Null | Giá |
| `description` | `text` | Not Null | Nội dung |
| `revision_number` | `int` | Not Null | Lần sửa |
| `changed_by` | `uuid` | Not Null | Người sửa |
| `created_at` | `timestamp` | | |

---

## Nhóm 3: Messaging

### 7. `conversations`

Cuộc trò chuyện giữa customer và provider.

| Attribute | Data Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `uuid` | PK | |
| `customer_id` | `uuid` | FK → `users.id` | Khách |
| `provider_id` | `uuid` | FK → `users.id` | Thợ |
| `quote_id` | `uuid` | FK → `quotes.id`, Nullable | Báo giá |
| `type` | `enum` | | `quote_based`, `direct_request` |
| `is_active` | `boolean` | Default: true | Trạng thái |
| `last_message_at` | `timestamp` | Nullable | |
| `created_at` | `timestamp` | | |
| `updated_at` | `timestamp` | | |

---

### 8. `messages`

Tin nhắn trong hệ thống chat.

| Attribute | Data Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `uuid` | PK | |
| `conversation_id` | `uuid` | FK → `conversations.id` | Hội thoại |
| `sender_id` | `uuid` | FK → `users.id` | Người gửi |
| `type` | `enum` | Default: `text` | |
| `content` | `text` | Nullable | Nội dung |
| `file_urls` | `text[]` | Nullable | File |
| `is_read` | `boolean` | Default: false | Đã đọc |
| `created_at` | `timestamp` | | |
| `updated_at` | `timestamp` | | |

---

## Nhóm 4: Order

### 9. `orders`

Đơn hàng giữa customer và provider.

| Attribute | Data Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `uuid` | PK | |
| `order_number` | `varchar(255)` | Unique | Mã đơn |
| `customer_id` | `uuid` | FK → `users.id` | Khách |
| `provider_id` | `uuid` | FK → `users.id` | Thợ |
| `quote_id` | `uuid` | FK → `quotes.id`, Nullable | Báo giá |
| `price` | `decimal(12,2)` | | |
| `total_amount` | `decimal(12,2)` | | Tổng tiền |
| `status` | `enum` | Default: `pending` | |
| `payment_status` | `enum` | Default: `pending` | |
| `payment_method` | `enum` | Nullable | |
| `created_at` | `timestamp` | | |
| `updated_at` | `timestamp` | | |

---

## Nhóm 5: Notification & Moderation

### 10. `notifications`

Thông báo cho user.

| Attribute | Data Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `uuid` | PK | |
| `user_id` | `uuid` | FK → `users.id` | Người nhận |
| `type` | `enum` | | |
| `title` | `varchar(255)` | | |
| `message` | `text` | | |
| `metadata` | `jsonb` | Nullable | |
| `is_read` | `boolean` | Default: false | |
| `created_at` | `timestamp` | | |

---

### 11. `moderation_logs`

Log kiểm duyệt nội dung.

| Attribute | Data Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `uuid` | PK | |
| `user_id` | `uuid` | | |
| `entity_type` | `varchar(50)` | | |
| `entity_id` | `uuid` | Nullable | |
| `status` | `enum` | | |
| `is_allowed` | `boolean` | | |
| `confidence` | `decimal(3,2)` | | |
| `created_at` | `timestamp` | | |

---

## Nhóm 6: Trade

### 12. `trades`

Danh mục nghề.

| Attribute | Data Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `uuid` | PK | |
| `name` | `varchar(100)` | Unique | |
| `slug` | `varchar(100)` | Unique | |
| `is_active` | `boolean` | Default: true | |
| `created_at` | `timestamp` | | |

---

### 13. `provider_trades`

Liên kết provider với nghề.

| Attribute | Data Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | `uuid` | PK | |
| `provider_id` | `uuid` | FK → `users.id` | |
| `trade_id` | `uuid` | FK → `trades.id` | |
| `years_experience` | `smallint` | Nullable | |
| `created_at` | `timestamp` | | |

---

## Tổng kết quan hệ
```
users (1) ──→ (1) profiles
users (1) ──→ (N) refresh_tokens
users (1) ──→ (N) post_customer
post_customer (1) ──→ (N) quotes
quotes (1) ──→ (N) quote_revisions
quotes (1) ──→ (1) conversations
conversations (1) ──→ (N) messages
users (1) ──→ (N) orders
users (1) ──→ (N) notifications
users (1) ──→ (N) moderation_logs
users (1) ──→ (N) provider_trades
trades (1) ──→ (N) provider_trades
```