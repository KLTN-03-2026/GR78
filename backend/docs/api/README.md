# Tài liệu API — Service Matching Backend

> **Phiên bản:** v1 | **Base URL:** `http://localhost:3000/api/v1` (dev) · `https://your-domain.com/api/v1` (prod)
>
> Tài liệu này dành cho **đội Frontend**. Đọc từ đầu đến cuối trước khi bắt đầu tích hợp.

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Vai trò người dùng](#2-vai-trò-người-dùng)
3. [Xác thực (Authentication)](#3-xác-thực-authentication)
4. [FE cần chuẩn bị gì](#4-fe-cần-chuẩn-bị-gì)
5. [Dịch vụ bên thứ ba](#5-dịch-vụ-bên-thứ-ba)
6. [WebSocket — Realtime](#6-websocket--realtime)
7. [Quy ước chung](#7-quy-ước-chung)
8. [API công khai (Public)](#8-api-công-khai-public)
9. [API yêu cầu đăng nhập (bất kỳ role)](#9-api-yêu-cầu-đăng-nhập-bất-kỳ-role)
10. [API dành cho Khách hàng (CUSTOMER)](#10-api-dành-cho-khách-hàng-customer)
11. [API dành cho Thợ (PROVIDER)](#11-api-dành-cho-thợ-provider)
12. [API dành cho Admin](#12-api-dành-cho-admin)
13. [Luồng nghiệp vụ chính](#13-luồng-nghiệp-vụ-chính)

---

## 1. Tổng quan kiến trúc

| Thành phần | Công nghệ |
|---|---|
| Backend framework | NestJS (TypeScript) |
| Cơ sở dữ liệu | PostgreSQL (TypeORM) |
| Cache | Redis |
| Lưu trữ file | Supabase Storage |
| Email | Resend |
| Thanh toán | Stripe |
| Realtime | Socket.IO (WebSocket) |

---

## 2. Vai trò người dùng

Hệ thống có **3 vai trò** (`role`):

| Vai trò | Giá trị | Mô tả |
|---|---|---|
| Khách hàng | `CUSTOMER` | Đăng bài tìm thợ, tạo đơn hàng, viết đánh giá |
| Thợ | `PROVIDER` | Xem bài đăng, gửi báo giá, nhận đơn hàng, đăng ký gói subscription |
| Quản trị viên | `ADMIN` | Quản lý gói subscription, thanh toán, mã giảm giá |

Vai trò được gán khi đăng ký và **không thể thay đổi** sau đó.

---

## 3. Xác thực (Authentication)

### 3.1. Web (browser / SPA)

Sử dụng **Access Token + Refresh Token qua httpOnly Cookie**.

| Token | Nơi lưu | Thời hạn |
|---|---|---|
| Access Token | `Authorization: Bearer <token>` header | 60 phút |
| Refresh Token | httpOnly cookie `refresh_token` | 7 ngày |

**Quy trình:**
1. Đăng nhập → nhận `accessToken` trong body response, `refreshToken` được backend tự động set vào cookie.
2. Gắn `Authorization: Bearer <accessToken>` vào mọi request cần auth.
3. Khi access token hết hạn → gọi `POST /auth/refresh` (không cần body, cookie tự được gửi kèm).
4. Logout → gọi `POST /auth/logout` để backend xóa cookie và revoke token.

### 3.2. Mobile (React Native / app)

Sử dụng **Access Token + Refresh Token trong body**, kèm header `X-Device-ID`.

| Header | Bắt buộc | Mô tả |
|---|---|---|
| `Authorization: Bearer <token>` | Có | Access token |
| `X-Device-ID` | Có | UUID duy nhất của thiết bị (tạo 1 lần, lưu vào local storage) |

**Quy trình:**
1. Sinh 1 UUID làm `deviceId` và lưu vĩnh viễn vào local storage.
2. Đăng nhập → gửi `POST /auth/login-mobile` với `X-Device-ID` header → nhận cả 2 token trong response body.
3. Lưu `refreshToken` vào SecureStorage (Keychain / Keystore).
4. Gắn access token vào header mọi request.
5. Khi hết hạn → gọi `POST /auth/refresh-mobile` với body `{ refreshToken }` + `X-Device-ID`.

---

## 4. FE cần chuẩn bị gì

### 4.1. Biến môi trường cần thiết

```env
# Backend URL
VITE_API_URL=http://localhost:3000/api/v1        # dev
VITE_API_URL=https://your-domain.com/api/v1     # prod

# WebSocket
VITE_WS_URL=http://localhost:3000               # dev

# Stripe (public key — chỉ cần public key ở FE)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### 4.2. Thư viện gợi ý cần cài

```bash
# HTTP client
npm install axios

# WebSocket (realtime chat + notification)
npm install socket.io-client

# Stripe (nếu dùng Stripe Elements trên FE)
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 4.3. Cấu hình Axios

```typescript
// api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // bắt buộc để cookie refresh token hoạt động (web)
});

// Tự động gắn access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tự động refresh khi 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await api.post('/auth/refresh'); // cookie tự động gửi
      return api.request(err.config);
    }
    return Promise.reject(err);
  }
);
```

### 4.4. Upload file

Tất cả các API có upload file đều dùng `multipart/form-data`. Ví dụ:

```typescript
const formData = new FormData();
formData.append('title', 'Sửa điện');
formData.append('files', file); // file từ <input type="file">

await api.post('/posts', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## 5. Dịch vụ bên thứ ba

### 5.1. Stripe — Thanh toán gói Subscription

Thợ đăng ký gói subscription qua luồng **Stripe PaymentIntent**:

1. FE gọi `POST /subscription/subscribe` → nhận `clientSecret` và `paymentIntentId`.
2. FE dùng Stripe.js để hiển thị form thanh toán và xác nhận PaymentIntent.
3. Stripe tự động gọi webhook `/subscription/stripe/webhook` → backend kích hoạt subscription.

**FE cần:**
- `STRIPE_PUBLISHABLE_KEY` (public key, không phải secret key).
- Cài `@stripe/stripe-js`.

```typescript
import { loadStripe } from '@stripe/stripe-js';
const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Sau khi nhận clientSecret từ backend
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: cardElement }
});
```

**Lưu ý:** Không cần `STRIPE_SECRET_KEY` ở FE. Secret key chỉ dùng ở backend.

### 5.2. Resend — Email

Backend tự gửi email cho các sự kiện sau:
- Gửi OTP xác thực email sau đăng ký.
- Gửi link reset mật khẩu.
- Thông báo đặt lại mật khẩu thành công.

**FE không cần làm gì thêm.** Backend tự xử lý.

### 5.3. Supabase Storage — Lưu file

Backend tự xử lý upload lên Supabase. FE chỉ cần gửi file qua `multipart/form-data`. Kết quả trả về là URL public của file đã lưu.

### 5.4. AI Moderation (Ollama/Qwen)

Backend tự chạy AI kiểm duyệt nội dung bài đăng (tình dục, bạo lực, thù hận). **FE không cần cấu hình gì.**

---

## 6. WebSocket — Realtime

### 6.1. Kết nối

```typescript
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_WS_URL, {
  auth: { token: accessToken },
  transports: ['websocket'],
});
```

### 6.2. Sự kiện Chat

| Sự kiện | Hướng | Mô tả |
|---|---|---|
| `message` | Server → Client | Tin nhắn mới trong conversation |
| `messages_read` | Server → Client | Đánh dấu đã đọc |
| `conversation_closed` | Server → Client | Conversation bị đóng |

### 6.3. Sự kiện Notification

| Sự kiện | Hướng | Mô tả |
|---|---|---|
| `notification` | Server → Client | Thông báo mới (badge, popup) |
| `notification_read` | Server → Client | Thông báo đã đọc |
| `notification_all_read` | Server → Client | Tất cả đã đọc |

**Gợi ý:** Khi nhận sự kiện notification → cập nhật số badge bằng cách gọi lại `GET /notifications/unread-count` hoặc lấy giá trị từ payload event.

---

## 7. Quy ước chung

### 7.1. Format response

**Thành công:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Lỗi:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 7.2. Phân trang

Hệ thống có **2 loại phân trang**:

**Offset-based** (dùng cho danh sách cố định như notifications, orders):
```
GET /notifications?page=1&limit=20
```

**Cursor-based** (dùng cho feed vô hạn như posts, saved-posts):
```
GET /posts/feed?limit=20               # lần đầu
GET /posts/feed?limit=20&cursor=xxx    # lần tiếp (cursor lấy từ response)
```

Response cursor-based:
```json
{
  "items": [...],
  "nextCursor": "2024-01-01T00:00:00.000Z",
  "hasMore": true
}
```

### 7.3. Rate Limit

Một số endpoint có rate limit:

| Endpoint | Giới hạn |
|---|---|
| `POST /auth/register` | 5 lần / phút / IP |
| `POST /auth/login` | 10 lần / phút / IP |
| `POST /auth/forgot-password` | 3 lần / 15 phút / IP |
| `POST /auth/forgot-password-otp` | 3 lần / 15 phút / IP |
| `POST /auth/verify-email` | 10 lần / 15 phút / IP |
| Các endpoint còn lại | 1000 lần / 15 phút / IP |

Khi bị rate limit → HTTP `429 Too Many Requests`.

---

## 8. API công khai (Public)

> Không cần đăng nhập. Gọi trực tiếp không cần token.

---

### 8.1. Auth — Đăng ký & Đăng nhập

#### `POST /auth/register` — Đăng ký tài khoản

Tạo tài khoản mới. Sau khi đăng ký thành công, backend gửi OTP 6 số về email để kích hoạt tài khoản.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!",
  "displayName": "Nguyễn Văn A",
  "role": "CUSTOMER"
}
```

`role` nhận một trong hai giá trị: `"CUSTOMER"` hoặc `"PROVIDER"`.

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": { "id": "uuid", "email": "user@example.com" }
}
```

**Khi nào dùng:** Màn hình đăng ký. Sau khi thành công, chuyển người dùng sang màn hình nhập OTP xác thực.

---

#### `POST /auth/verify-email` — Xác thực email bằng OTP

**Request body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200):** `{ "success": true, "message": "Email verified successfully." }`

**Lỗi phổ biến:** `400` — OTP sai hoặc hết hạn.

---

#### `POST /auth/resend-verification` — Gửi lại OTP xác thực

Có cooldown 60 giây giữa các lần gửi.

**Request body:**
```json
{ "email": "user@example.com" }
```

---

#### `POST /auth/forgot-password` — Quên mật khẩu (gửi link email)

Gửi link reset password về email. Luôn trả `200 OK` dù email tồn tại hay không (bảo mật chống user enumeration).

**Request body:**
```json
{ "email": "user@example.com" }
```

---

#### `POST /auth/forgot-password-otp` — Quên mật khẩu (gửi OTP)

Gửi mã OTP 6 số về email để đặt lại mật khẩu.

**Request body:**
```json
{ "email": "user@example.com" }
```

---

#### `POST /auth/reset-password` — Đặt lại mật khẩu (qua link email)

Dùng `token` nhận được trong link email.

**Request body:**
```json
{
  "token": "token-from-email-link",
  "newPassword": "NewStrongPass123!"
}
```

---

#### `POST /auth/reset-password-otp` — Đặt lại mật khẩu (qua OTP)

**Request body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewStrongPass123!"
}
```

---

#### `POST /auth/login` — Đăng nhập (Web)

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "Nguyễn Văn A",
      "role": "CUSTOMER",
      "isEmailVerified": true
    }
  }
}
```

Refresh token được set vào httpOnly cookie tự động — **FE không xử lý cookie thủ công**.

**Lỗi phổ biến:**
- `401` — Sai email hoặc mật khẩu.
- `403` — Email chưa được xác thực.

---

#### `POST /auth/refresh` — Làm mới Access Token (Web)

Không cần body, không cần header thủ công. Cookie refresh token tự động gửi kèm (đảm bảo Axios có `withCredentials: true`).

**Response (200):** `{ "data": { "accessToken": "new-token" } }`

---

#### `POST /auth/logout` — Đăng xuất (Web)

Không cần body. Backend xóa cookie và revoke refresh token.

---

#### `POST /auth/logout-all` — Đăng xuất tất cả thiết bị

**Request body:**
```json
{ "refreshToken": "your-refresh-token" }
```

---

#### `POST /auth/login-mobile` — Đăng nhập (Mobile)

**Header bắt buộc:** `X-Device-ID: <device-uuid>`

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Trả về cả `accessToken` và `refreshToken` trong body response (không dùng cookie).

---

#### `POST /auth/refresh-mobile` — Làm mới Access Token (Mobile)

**Header bắt buộc:** `X-Device-ID: <device-uuid>`

**Request body:**
```json
{ "refreshToken": "your-refresh-token" }
```

---

#### `POST /auth/logout-mobile` — Đăng xuất (Mobile)

**Header bắt buộc:** `X-Device-ID: <device-uuid>`

**Request body:**
```json
{ "refreshToken": "your-refresh-token" }
```

---

#### `POST /auth/logout-device` — Đăng xuất một thiết bị cụ thể (Mobile)

Revoke toàn bộ token của thiết bị đó.

**Header bắt buộc:** `X-Device-ID: <device-uuid>`

**Request body:**
```json
{ "refreshToken": "your-refresh-token" }
```

---

### 8.2. Profile — Hồ sơ công khai

#### `GET /profile/user/:id` — Xem hồ sơ công khai của người dùng

Trả về thông tin công khai giới hạn (avatar, tên, nghề, tỉnh, v.v.). Không trả về email hoặc số điện thoại.

**Params:** `id` — UUID của người dùng.

**Khi nào dùng:** Trang hồ sơ thợ, thẻ thông tin trong kết quả tìm kiếm.

---

#### `GET /profile/search` — Tìm kiếm người dùng theo tên

**Query params:**
```
?searchTerm=Nguyễn&limit=20&offset=0
```

---

### 8.3. Posts — Bài đăng công khai

#### `GET /posts/feed` — Feed bài đăng đang mở

Danh sách bài đăng tìm thợ của khách hàng, sắp xếp mới nhất trước. Cursor-based pagination.

**Query params:**
```
?limit=20
?limit=20&cursor=<nextCursor>   # cursor lấy từ field nextCursor của response trước
```

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Cần sửa điện tại nhà",
      "description": "Bóng đèn bị chập...",
      "budget": 500000,
      "province": "Hà Nội",
      "status": "OPEN",
      "imageUrls": ["https://..."],
      "createdAt": "2024-01-01T00:00:00Z",
      "customer": { "id": "uuid", "displayName": "Nguyễn Văn A" }
    }
  ],
  "nextCursor": "2024-01-01T00:00:00.000Z",
  "hasMore": true
}
```

**Khi nào dùng:** Trang chủ của thợ — danh sách việc làm gần đây.

---

#### `GET /posts/:id` — Xem chi tiết bài đăng

**Params:** `id` — UUID của bài đăng.

---

### 8.4. Search — Tìm kiếm

Tất cả API tìm kiếm đều công khai, không cần đăng nhập.

#### `GET /search` — Tìm kiếm toàn cục (bài đăng + thợ cùng lúc)

Dùng cho thanh tìm kiếm trên header hoặc trang chủ.

**Query params:**
```
?q=sửa điện
&province=Hà Nội         # tùy chọn
&type=all                 # "all" | "posts" | "providers"
&limit=10
```

**Response:**
```json
{
  "posts": [...],
  "providers": [...]
}
```

---

#### `GET /search/posts` — Tìm kiếm bài đăng

**Query params:**
```
?title=sửa điện
&province=Hà Nội
&tradeSlugs=dien-dan-dung,nuoc     # slug nghề (lấy từ GET /search/trades)
&budgetMin=100000
&budgetMax=1000000
&sortBy=createdAt                   # hoặc "budget"
&order=DESC                         # hoặc "ASC"
&page=1&limit=20
```

---

#### `GET /search/providers` — Tìm kiếm thợ

**Query params:**
```
?displayName=Trần
&province=Hà Nội
&tradeSlugs=dien-dan-dung
&page=1&limit=20
```

**Response:** Kèm danh sách nghề và số năm kinh nghiệm của từng thợ.

---

#### `GET /search/by-province` — Lọc theo tỉnh/thành

Trả về cả bài đăng lẫn thợ tại một tỉnh trong cùng một request. Dùng cho trang "Dịch vụ theo khu vực".

**Query params:**
```
?province=Hà Nội&limit=20
```

---

#### `GET /search/provinces` — Danh sách 34 tỉnh/thành

Dùng cho dropdown hoặc autocomplete chọn tỉnh/thành.

**Query params:**
```
?q=Đà               # filter (tùy chọn, hỗ trợ không dấu)
```

**Response:**
```json
{
  "provinces": ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", ...]
}
```

---

#### `GET /search/trades` — Danh mục nghề nghiệp

Trả về danh sách ngành nghề. Dùng `slug` từ response này cho các API tìm kiếm và tạo bài đăng.

**Query params:**
```
?q=dien               # tìm theo tên (hỗ trợ không dấu)
&category=Điện - Nước  # lọc theo nhóm nghề
```

**Response:**
```json
{
  "trades": [
    {
      "id": "uuid",
      "name": "Điện dân dụng",
      "slug": "dien-dan-dung",
      "category": "Điện - Nước"
    }
  ]
}
```

---

### 8.5. Subscription Plans — Xem gói cước (công khai)

#### `GET /subscription/plans` — Danh sách gói đăng ký

Không cần đăng nhập. Dùng để hiển thị trang giới thiệu giá.

**Query params:**
```
?billingCycle=MONTHLY   # hoặc "ANNUAL"
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Gói Thợ Chuyên Nghiệp",
    "price": "299000",
    "billingCycle": "MONTHLY",
    "features": ["Báo giá không giới hạn", "Hồ sơ nổi bật"],
    "isActive": true
  }
]
```

---

### 8.6. Certifications — Chứng chỉ nghề (công khai)

#### `GET /certifications/provider/:providerId` — Chứng chỉ đã xác minh của thợ

Chỉ trả về chứng chỉ ở trạng thái `verified`. Dùng để hiển thị badge xác minh trên trang hồ sơ thợ.

**Params:** `providerId` — UUID của thợ.

---

## 9. API yêu cầu đăng nhập (bất kỳ role)

> Yêu cầu `Authorization: Bearer <accessToken>`. Áp dụng cho CUSTOMER, PROVIDER và ADMIN.

---

### 9.1. Profile — Hồ sơ cá nhân

#### `GET /profile/me` — Lấy hồ sơ của mình

Trả về đầy đủ thông tin cá nhân bao gồm cả email, số điện thoại.

---

#### `PATCH /profile/me` — Cập nhật hồ sơ

Cập nhật các thông tin cơ bản. Không dùng endpoint này để đổi tên hiển thị hoặc email/số điện thoại (có endpoint riêng).

**Request body (tất cả tùy chọn):**
```json
{
  "bio": "Thợ điện 10 năm kinh nghiệm tại Hà Nội",
  "province": "Hà Nội",
  "tradeIds": ["uuid-trade-1", "uuid-trade-2"],
  "yearsOfExperience": 10
}
```

---

#### `PUT /profile/contact` — Cập nhật email hoặc số điện thoại

**Request body:**
```json
{
  "email": "newemail@example.com",
  "phone": "+84987654321"
}
```

**Lỗi phổ biến:** `409` — Email hoặc số điện thoại đã thuộc về tài khoản khác.

---

#### `PUT /profile/display-name` — Đổi tên hiển thị

Giới hạn **1 lần mỗi 30 ngày**.

**Request body:**
```json
{ "displayName": "Nguyễn Văn B" }
```

**Lỗi phổ biến:** `403` — Chưa đủ 30 ngày. Response kèm field `daysUntilCanChange`.

---

#### `PATCH /profile/avatar` — Cập nhật ảnh đại diện

**Content-Type:** `multipart/form-data`

**Form field:** `file` — file ảnh (tối đa 2MB).

---

#### `DELETE /profile/me` — Xóa tài khoản

Xóa mềm (soft delete). Tài khoản có thể khôi phục trong 30 ngày.

---

### 9.2. Chat

Chat hoạt động qua cả **REST API** (load lịch sử) và **WebSocket** (nhận real-time). Tất cả endpoint chat đều yêu cầu đăng nhập, không giới hạn role.

#### `GET /chat/conversations` — Danh sách cuộc hội thoại

**Query params:**
```
?page=1&limit=20
```

**Response:** Kèm tin nhắn cuối và số tin chưa đọc của từng conversation.

---

#### `GET /chat/unread-count` — Tổng tin nhắn chưa đọc

Dùng để hiển thị badge icon chat trên header.

**Response:** `{ "count": 5 }`

---

#### `GET /chat/search` — Tìm kiếm tin nhắn

**Query params:**
```
?keyword=sửa điện
&conversationId=uuid      # tùy chọn — tìm trong 1 conversation cụ thể
```

---

#### `GET /chat/conversations/:id` — Chi tiết cuộc hội thoại

**Lỗi:** `403` — Người dùng không phải thành viên của conversation.

---

#### `POST /chat/conversations/direct` — Tạo conversation riêng với thợ

Tạo cuộc trò chuyện trực tiếp không qua bài đăng (ví dụ: khách muốn hỏi thợ trực tiếp).

**Request body:**
```json
{ "providerId": "uuid-of-provider" }
```

---

#### `POST /chat/conversations/:id/messages` — Gửi tin nhắn

**Request body:**
```json
{
  "content": "Bạn có thể sửa điện vào thứ 7 không?",
  "type": "TEXT"
}
```

`type` nhận một trong: `"TEXT"` | `"IMAGE"` | `"SYSTEM"`.

---

#### `GET /chat/conversations/:id/messages` — Lấy tin nhắn trong conversation

**Query params:**
```
?limit=50
&before=<message-uuid>   # cursor — lấy tin nhắn cũ hơn tin này (scroll lên trên)
```

---

#### `POST /chat/conversations/:id/read` — Đánh dấu tất cả tin đã đọc

Gọi khi người dùng mở conversation. Xóa badge unread cho conversation đó.

---

#### `POST /chat/conversations/:id/close` — Đóng cuộc hội thoại

Sau khi đóng, không thể gửi tin nhắn mới.

---

#### `DELETE /chat/conversations/:id` — Xóa cuộc hội thoại

**Response:** HTTP 204 (no content).

---

### 9.3. Notifications — Thông báo

#### `GET /notifications` — Danh sách thông báo

**Query params:**
```
?page=1&limit=20&unreadOnly=true
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "QUOTE_RECEIVED",
      "title": "Nhận báo giá mới",
      "message": "Thợ Trần Văn B đã gửi báo giá cho bài đăng của bạn",
      "isRead": false,
      "actionUrl": "/quotes/uuid",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10,
  "unreadCount": 3
}
```

`actionUrl` là đường dẫn tương đối mà FE nên điều hướng tới khi người dùng click vào thông báo.

---

#### `GET /notifications/unread-count` — Số thông báo chưa đọc

Dùng để hiển thị badge icon thông báo trên header.

**Response:** `{ "count": 3 }`

---

#### `POST /notifications/mark-all-read` — Đánh dấu tất cả đã đọc

---

#### `POST /notifications/:id/read` — Đánh dấu một thông báo đã đọc

---

#### `DELETE /notifications/read` — Xóa tất cả thông báo đã đọc

---

#### `DELETE /notifications/:id` — Xóa một thông báo

---

### 9.4. Posts — Bài đăng của tôi

#### `GET /posts/my/posts` — Lấy tất cả bài đăng của tôi

Áp dụng cho mọi role. Thợ gọi API này sẽ nhận danh sách rỗng vì không tạo bài đăng.

**Query params:**
```
?limit=20&cursor=<nextCursor>
```

---

### 9.5. Orders — Đơn hàng (xem chung)

#### `GET /orders` — Danh sách đơn hàng của tôi

Tự động lọc theo role: khách hàng thấy đơn mình tạo, thợ thấy đơn mình nhận.

**Query params:**
```
?status=IN_PROGRESS   # PENDING | IN_PROGRESS | COMPLETED | CANCELLED
```

---

#### `GET /orders/stats` — Thống kê đơn hàng

Số đơn theo từng trạng thái.

**Response:**
```json
{
  "PENDING": 2,
  "IN_PROGRESS": 1,
  "COMPLETED": 10,
  "CANCELLED": 3
}
```

---

#### `GET /orders/:id` — Chi tiết đơn hàng

---

#### `GET /orders/number/:orderNumber` — Tìm đơn theo mã số

Mã số là chuỗi dạng `ORD-XXXXXXXX`.

---

#### `POST /orders/:id/cancel` — Hủy đơn hàng

Cả khách hàng và thợ đều có thể hủy. **Không thể hủy sau 10 phút kể từ khi đơn chuyển sang `IN_PROGRESS`.**

**Request body:**
```json
{ "reason": "Tôi có việc bận đột xuất" }
```

**Lỗi phổ biến:** `400` — Đã quá 10 phút không thể hủy.

---

### 9.6. Reviews — Đánh giá (xem)

#### `GET /reviews/provider/:providerId` — Xem đánh giá của một thợ

**Query params:**
```
?page=1&limit=10
```

**Response:**
```json
{
  "reviews": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Thợ làm rất tốt!",
      "providerReply": "Cảm ơn bạn!",
      "customer": { "displayName": "Khách A" },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 15,
  "averageRating": 4.8
}
```

---

#### `GET /reviews/order/:orderId` — Xem đánh giá của một đơn hàng

Cả khách hàng lẫn thợ trong đơn đều có thể xem.

---

#### `GET /reviews/my` — Xem đánh giá của tôi

Xem các đánh giá mình đã viết (dành cho khách hàng).

---

## 10. API dành cho Khách hàng (CUSTOMER)

> Yêu cầu `Authorization: Bearer <token>` và tài khoản có `role = CUSTOMER`.

---

### 10.1. Posts — Quản lý bài đăng

#### `POST /posts` — Tạo bài đăng tìm thợ

**Content-Type:** `multipart/form-data`

**Form fields:**

| Field | Bắt buộc | Mô tả |
|---|---|---|
| `title` | Có | Tiêu đề bài đăng |
| `description` | Có | Mô tả chi tiết |
| `budget` | Có | Ngân sách (VNĐ) |
| `province` | Có | Tỉnh/thành (từ danh sách 34 tỉnh) |
| `tradeIds` | Không | JSON string array của UUID nghề |
| `files` | Không | Tối đa 10 ảnh |

**Khi nào dùng:** Màn hình tạo bài đăng. Sau khi tạo, nội dung được AI kiểm duyệt tự động. Nếu vi phạm thì bài bị từ chối.

---

#### `PATCH /posts/:id` — Chỉnh sửa bài đăng

Chỉ sửa được khi bài đang ở trạng thái `OPEN`.

**Request body (tất cả tùy chọn):**
```json
{
  "title": "Cần sửa điện khẩn cấp",
  "description": "...",
  "budget": 600000
}
```

**Lỗi phổ biến:** `403` — Bài đã đóng không thể sửa.

---

#### `DELETE /posts/:id` — Xóa bài đăng

Xóa mềm (soft delete).

---

#### `PATCH /posts/:id/close` — Đóng bài đăng

Dùng khi đã tìm được thợ hoặc không còn nhu cầu. Bài bị đóng không thể sửa hoặc nhận báo giá mới.

**Lỗi phổ biến:** `403` — Bài đã đóng rồi.

---

### 10.2. Quotes — Xử lý báo giá nhận được

#### `GET /quotes/post/:postId` — Xem tất cả báo giá của bài đăng

**Khi nào dùng:** Trang "Báo giá đã nhận" của một bài đăng cụ thể.

---

#### `GET /quotes/custom-request/:customRequestId` — Xem báo giá của yêu cầu riêng

---

#### `GET /quotes/:id` — Xem chi tiết một báo giá

---

#### `GET /quotes/:id/with-revisions` — Xem lịch sử chỉnh sửa giá

Dùng trong màn hình chat để hiển thị timeline chào giá — thợ đã đề xuất giá bao nhiêu lần, mỗi lần bao nhiêu.

---

#### `POST /quotes/:id/accept-for-chat` — Chấp nhận báo giá để mở chat

**Quan trọng:** Không tạo đơn hàng ngay. Chỉ mở conversation để thương lượng thêm.

**Khi nào dùng:** Khi khách muốn hỏi thêm thông tin trước khi chốt đơn.

---

#### `POST /quotes/:id/request-order` — Yêu cầu tạo đơn hàng

Dùng sau khi đã chat và đồng ý giá. Thợ sẽ nhận thông báo cần xác nhận.

**Luồng tiếp theo:** Thợ gọi `POST /orders/confirm-from-quote/:quoteId`.

---

#### `POST /quotes/:id/reject` — Từ chối báo giá

**Request body:**
```json
{ "reason": "Giá quá cao so với ngân sách của tôi" }
```

---

### 10.3. Custom Requests — Yêu cầu riêng gửi cho thợ

#### `POST /custom-requests` — Gửi yêu cầu riêng tới thợ cụ thể

Thay vì đăng bài công khai, khách hàng nhắm thẳng vào một thợ cụ thể.

**Request body:**
```json
{
  "providerId": "uuid-of-provider",
  "title": "Sửa điện phòng ngủ",
  "description": "Bóng đèn bị chập mạch...",
  "budget": 500000,
  "province": "Hà Nội",
  "tradeId": "uuid-trade"
}
```

---

#### `GET /custom-requests/my/sent` — Danh sách yêu cầu đã gửi

**Query params:**
```
?status=PENDING&page=1&limit=20
```

**Trạng thái yêu cầu:** `PENDING` | `ACCEPTED` | `REJECTED`

---

#### `GET /custom-requests/:id` — Chi tiết yêu cầu riêng

---

#### `GET /custom-requests/:id/quote` — Xem báo giá thợ gửi kèm khi chấp nhận

Sau khi thợ chấp nhận, khách xem báo giá tại đây rồi tiếp tục luồng quote như bình thường.

---

#### `DELETE /custom-requests/:id` — Xóa yêu cầu (chỉ khi PENDING)

**Lỗi phổ biến:** `400` — Yêu cầu đã được thợ phản hồi, không thể xóa.

---

### 10.4. Orders — Tạo và xác nhận đơn hàng

#### `POST /orders/accept-quote-direct/:quoteId` — Chấp nhận báo giá và tạo đơn ngay

Bỏ qua bước chat thương lượng. Đơn được tạo ở trạng thái `PENDING`, thợ phải xác nhận.

**Params:** `quoteId` — UUID của báo giá.

**Khi nào dùng:** Khi khách đồng ý giá ngay mà không cần hỏi thêm.

**Lỗi phổ biến:** `400` — Báo giá không ở trạng thái PENDING hoặc đã có đơn rồi.

---

#### `POST /orders/:id/customer-complete` — Xác nhận hoàn thành (phía khách)

Gọi sau khi thợ đã báo hoàn thành. Đơn chuyển sang `COMPLETED`.

**Khi nào dùng:** Sau khi `provider-complete` được gọi và khách xác nhận đã bàn giao xong.

---

### 10.5. Reviews — Viết đánh giá

#### `POST /reviews` — Viết đánh giá cho thợ

Chỉ được viết sau khi đơn hàng ở trạng thái `COMPLETED`. Mỗi đơn chỉ được đánh giá **1 lần duy nhất**.

**Request body:**
```json
{
  "orderId": "uuid-of-order",
  "rating": 5,
  "comment": "Thợ làm rất nhanh, sạch sẽ và chuyên nghiệp!"
}
```

`rating` từ 1 đến 5.

**Lỗi phổ biến:**
- `400` — Đơn chưa hoàn thành.
- `409` — Đã đánh giá đơn này rồi.

---

## 11. API dành cho Thợ (PROVIDER)

> Yêu cầu `Authorization: Bearer <token>` và tài khoản có `role = PROVIDER`.

---

### 11.1. Quotes — Gửi và quản lý báo giá

#### `POST /quotes` — Gửi báo giá cho bài đăng

**Request body:**
```json
{
  "postId": "uuid-of-post",
  "price": 450000,
  "description": "Tôi sẽ kiểm tra toàn bộ hệ thống điện và thay bóng",
  "terms": "Bao gồm vật tư, bảo hành 3 tháng",
  "estimatedDuration": "2-3 giờ",
  "imageUrls": []
}
```

**Lỗi phổ biến:** `409` — Đã gửi báo giá cho bài đăng này rồi.

---

#### `PATCH /quotes/:id` — Sửa báo giá (chỉ khi còn PENDING)

Chỉ sửa được trước khi khách phản hồi.

---

#### `POST /quotes/:id/revise` — Chào giá lại trong chat

Dùng trong quá trình thương lượng để đề xuất giá mới.

**Request body:**
```json
{
  "price": 400000,
  "description": "Giảm giá vì công việc đơn giản hơn"
}
```

---

#### `POST /quotes/:id/cancel` — Hủy báo giá

**Request body:**
```json
{ "reason": "Tôi không còn nhận việc khu vực này" }
```

---

#### `DELETE /quotes/:id` — Xóa báo giá (soft delete)

---

#### `GET /quotes/my-quotes` — Danh sách báo giá đã gửi

**Query params:**
```
?status=PENDING
```

**Trạng thái quote:**

| Trạng thái | Ý nghĩa |
|---|---|
| `PENDING` | Chờ khách phản hồi |
| `ACCEPTED_FOR_CHAT` | Khách chấp nhận để vào chat |
| `REVISING` | Đang thương lượng trong chat |
| `ORDER_REQUESTED` | Khách yêu cầu tạo đơn |
| `REJECTED` | Khách từ chối |
| `CANCELLED` | Thợ hủy |

---

### 11.2. Custom Requests — Yêu cầu riêng nhận được

#### `GET /custom-requests/my/received` — Danh sách yêu cầu riêng đã nhận

**Query params:**
```
?status=PENDING&page=1&limit=20
```

---

#### `POST /custom-requests/:id/accept` — Chấp nhận yêu cầu và gửi báo giá

Chấp nhận yêu cầu của khách và đồng thời tạo một báo giá. Giá không được vượt quá 150% ngân sách.

**Request body:**
```json
{
  "price": 450000,
  "description": "Tôi có thể làm việc này",
  "terms": "Bao gồm vật tư",
  "estimatedDuration": "1-2 giờ"
}
```

---

#### `POST /custom-requests/:id/reject` — Từ chối yêu cầu riêng

**Request body:**
```json
{ "reason": "Tôi không làm khu vực này" }
```

---

### 11.3. Orders — Nhận và xử lý đơn hàng

#### `GET /orders/awaiting-my-confirmation` — Đơn đang chờ thợ xác nhận

Danh sách đơn `PENDING` cần xác nhận hoặc từ chối. Sắp xếp theo thứ tự cũ nhất trước.

**Query params:**
```
?page=1&limit=10
```

---

#### `POST /orders/confirm-from-quote/:quoteId` — Xác nhận đơn hàng

Xử lý 2 luồng tự động:
- Đơn đang `PENDING` (từ direct acceptance): chuyển sang `IN_PROGRESS`.
- Quote đang `ORDER_REQUESTED` (từ chat): tạo đơn mới ở `IN_PROGRESS`.

**Params:** `quoteId` — UUID của báo giá.

---

#### `POST /orders/:id/provider-decline` — Từ chối đơn PENDING

**Request body:**
```json
{ "reason": "Tôi không thể nhận thêm việc tuần này" }
```

---

#### `POST /orders/:id/provider-complete` — Báo hoàn thành công việc

Thợ thông báo đã xong việc. Khách cần xác nhận lại bằng `customer-complete`.

---

### 11.4. Reviews — Phản hồi đánh giá

#### `POST /reviews/:id/reply` — Phản hồi đánh giá của khách

Chỉ phản hồi **1 lần duy nhất**, không thể sửa sau khi đã gửi.

**Params:** `id` — UUID của review.

**Request body:**
```json
{ "reply": "Cảm ơn bạn! Rất vui được phục vụ." }
```

---

### 11.5. Certifications — Chứng chỉ nghề

#### `POST /certifications` — Upload chứng chỉ PDF

Mỗi thợ tối đa 10 chứng chỉ. Chứng chỉ mới ở trạng thái `pending` chờ admin xét duyệt.

**Content-Type:** `multipart/form-data`

**Form fields:**

| Field | Bắt buộc | Mô tả |
|---|---|---|
| `file` | Có | File PDF (tối đa 10MB) |
| `name` | Có | Tên chứng chỉ |
| `issuingOrganization` | Có | Tổ chức cấp |
| `issueDate` | Có | Ngày cấp (YYYY-MM-DD) |
| `expiryDate` | Không | Ngày hết hạn (YYYY-MM-DD) |

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Chứng chỉ điện dân dụng",
  "status": "pending",
  "fileUrl": "https://...",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

#### `GET /certifications/my` — Xem chứng chỉ của mình

Trả về tất cả chứng chỉ kèm trạng thái (`pending` / `verified` / `rejected`).

---

#### `DELETE /certifications/:id` — Xóa chứng chỉ

Xóa vĩnh viễn cả record lẫn file PDF.

---

### 11.6. Saved Posts — Bài đăng đã lưu

Thợ có thể bookmark bài đăng để xem lại sau.

#### `POST /saved-posts` — Lưu bài đăng

**Request body:**
```json
{ "postId": "uuid-of-post" }
```

**Lỗi phổ biến:** `409` — Đã lưu bài này rồi.

---

#### `GET /saved-posts` — Danh sách bài đã lưu

**Query params:**
```
?limit=20&cursor=<nextCursor>
```

---

#### `GET /saved-posts/count` — Số bài đã lưu

**Response:** `{ "count": 15 }`

---

#### `GET /saved-posts/check/:postId` — Kiểm tra đã lưu chưa

Dùng để hiển thị icon bookmark (đã lưu / chưa lưu) trên card bài đăng.

**Response:** `{ "postId": "uuid", "isSaved": true }`

---

#### `DELETE /saved-posts/:postId` — Bỏ lưu bài đăng

---

### 11.7. Subscription — Gói đăng ký

> Subscription cho phép thợ gửi báo giá không giới hạn và có hồ sơ nổi bật trong kết quả tìm kiếm.

#### `POST /subscription/discounts/validate` — Kiểm tra mã giảm giá

Nên gọi trước khi đặt đơn để hiển thị preview giá cuối.

**Request body:**
```json
{
  "code": "PROMO2024",
  "billingCycle": "MONTHLY"
}
```

**Response:**
```json
{
  "isValid": true,
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "finalPrice": 239200,
  "savings": 59800
}
```

---

#### `GET /subscription/my` — Xem gói đang đăng ký

Trả về thông tin subscription hiện tại kèm plan details.

---

#### `GET /subscription/my/status` — Kiểm tra trạng thái gói nhanh

Dùng để kiểm tra xem thợ có đang được phép gửi báo giá không (subscription còn hạn).

**Response:**
```json
{
  "isActive": true,
  "daysUntilExpiry": 15,
  "message": "Gói của bạn còn hiệu lực 15 ngày"
}
```

---

#### `POST /subscription/subscribe` — Đăng ký gói

**Request body:**
```json
{
  "planId": "uuid-of-plan",
  "billingCycle": "MONTHLY",
  "discountCode": "PROMO2024"
}
```

`discountCode` là tùy chọn.

**Response:** Trả về `clientSecret` để FE xác nhận thanh toán qua Stripe.js.

**Lỗi phổ biến:** `409` — Đã có subscription đang hoạt động hoặc payment đang chờ.

**Luồng thanh toán (xem thêm mục 5.1):**
1. FE gọi API này → nhận `clientSecret`.
2. FE dùng Stripe.js xác nhận thanh toán.
3. Stripe webhook → backend kích hoạt subscription.

---

#### `PATCH /subscription/cancel` — Hủy gói

Vẫn được dùng đến hết kỳ hiện tại (không mất ngay).

**Request body:**
```json
{ "reason": "Tôi tạm dừng nhận việc" }
```

---

#### `GET /subscription/my/payments` — Lịch sử thanh toán

**Query params:**
```
?page=1&limit=20
```

---

#### `DELETE /subscription/my/payments/pending` — Hủy thanh toán đang chờ

Dùng khi muốn đổi gói hoặc thử thanh toán lại bằng thẻ khác.

---

## 12. API dành cho Admin

> Yêu cầu `Authorization: Bearer <token>` và tài khoản có `role = ADMIN`.
>
> **Base path:** `/admin/subscription`

---

### 12.1. Quản lý gói Subscription (Plans)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/admin/subscription/plans` | Xem tất cả gói (kể cả inactive) |
| `GET` | `/admin/subscription/plans/:id` | Chi tiết một gói |
| `POST` | `/admin/subscription/plans` | Tạo gói mới |
| `PATCH` | `/admin/subscription/plans/:id` | Cập nhật gói |
| `DELETE` | `/admin/subscription/plans/:id` | Vô hiệu hóa gói (inactive, không xóa vĩnh viễn) |

**Tạo gói (POST body):**
```json
{
  "name": "Gói Thợ Chuyên Nghiệp",
  "price": 299000,
  "billingCycle": "MONTHLY",
  "features": ["Báo giá không giới hạn", "Hồ sơ nổi bật", "Hỗ trợ ưu tiên"],
  "isActive": true
}
```

---

### 12.2. Quản lý mã giảm giá (Discounts)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/admin/subscription/discounts` | Danh sách tất cả mã giảm giá |
| `GET` | `/admin/subscription/discounts/:id` | Chi tiết mã |
| `POST` | `/admin/subscription/discounts` | Tạo mã mới |
| `PATCH` | `/admin/subscription/discounts/:id` | Cập nhật mã |
| `DELETE` | `/admin/subscription/discounts/:id` | Xóa vĩnh viễn mã |

**Tạo mã giảm giá (POST body):**
```json
{
  "code": "SUMMER2024",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "billingCycle": "MONTHLY",
  "maxUses": 100,
  "expiresAt": "2024-09-01T00:00:00Z",
  "isActive": true
}
```

`discountType` nhận: `"PERCENTAGE"` (giảm theo %) hoặc `"FIXED_AMOUNT"` (giảm cố định VNĐ).

`billingCycle` là tùy chọn — nếu không truyền thì mã áp dụng cho cả MONTHLY và ANNUAL.

---

### 12.3. Quản lý Subscriptions của thợ

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/admin/subscription/subscriptions` | Danh sách tất cả subscriptions |
| `PATCH` | `/admin/subscription/subscriptions/:id` | Cập nhật thủ công (trạng thái, auto-renew) |

**Query params cho danh sách:**
```
?status=ACTIVE&page=1&limit=20
```

---

### 12.4. Quản lý thanh toán (Payments)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/admin/subscription/payments` | Danh sách tất cả thanh toán |
| `GET` | `/admin/subscription/payments/:id` | Chi tiết một thanh toán |
| `PATCH` | `/admin/subscription/payments/:id/confirm` | Xác nhận thanh toán → kích hoạt subscription |
| `PATCH` | `/admin/subscription/payments/:id/refund` | Hoàn tiền → hủy subscription |

**Xác nhận thanh toán:**
```json
{ "notes": "Đã nhận chuyển khoản ngân hàng - Ref: 12345" }
```

**Hoàn tiền:**
```json
{ "notes": "Khách yêu cầu hoàn tiền trong 7 ngày đầu" }
```

---

### 12.5. Stripe Webhook (Chỉ dành cho Stripe gọi vào)

#### `POST /subscription/stripe/webhook`

**Không gọi endpoint này thủ công.** Stripe tự gọi để thông báo các sự kiện:
- `payment_intent.succeeded` → backend kích hoạt subscription.
- `payment_intent.payment_failed` → đánh dấu thanh toán thất bại.
- `payment_intent.canceled` → hủy thanh toán.

**Test local với Stripe CLI:**
```bash
stripe listen --forward-to localhost:3000/api/v1/subscription/stripe/webhook
```

---

## 13. Luồng nghiệp vụ chính

### Luồng A: Khách đăng bài → Thợ báo giá → Thương lượng → Chốt đơn

```
[Khách] POST /posts                                Tạo bài đăng tìm thợ
[Thợ]   GET /posts/feed                            Xem feed bài đăng
[Thợ]   POST /quotes                               Gửi báo giá
[Khách] GET /notifications                         Nhận thông báo có báo giá mới
[Khách] GET /quotes/post/:postId                   Xem tất cả báo giá
[Khách] POST /quotes/:id/accept-for-chat           Chấp nhận để vào chat (chưa tạo đơn)
        ── Chat qua WebSocket / REST ──
[Thợ]   POST /quotes/:id/revise                    Đề xuất giá mới (tùy chọn)
[Khách] POST /quotes/:id/request-order             Yêu cầu đặt đơn
[Thợ]   POST /orders/confirm-from-quote/:quoteId  Xác nhận → đơn IN_PROGRESS
        ── Tiến hành công việc ──
[Thợ]   POST /orders/:id/provider-complete         Báo xong việc
[Khách] POST /orders/:id/customer-complete         Xác nhận → đơn COMPLETED
[Khách] POST /reviews                              Viết đánh giá (1-5 sao)
[Thợ]   POST /reviews/:reviewId/reply              Phản hồi đánh giá (tùy chọn)
```

---

### Luồng B: Khách chấp nhận báo giá trực tiếp (không qua chat)

```
[Khách] POST /orders/accept-quote-direct/:quoteId  Tạo đơn PENDING (bỏ qua chat)
[Thợ]   GET /orders/awaiting-my-confirmation       Xem đơn chờ xác nhận
        ┌─ Thợ đồng ý:
[Thợ]   POST /orders/confirm-from-quote/:quoteId  Đơn → IN_PROGRESS
        └─ Thợ từ chối:
[Thợ]   POST /orders/:id/provider-decline          Đơn bị hủy, khách nhận thông báo
```

---

### Luồng C: Khách gửi yêu cầu riêng cho thợ

```
[Khách] POST /custom-requests                      Gửi yêu cầu trực tiếp tới thợ
[Thợ]   GET /notifications                         Nhận thông báo
[Thợ]   GET /custom-requests/my/received           Xem yêu cầu nhận được
        ┌─ Thợ đồng ý:
[Thợ]   POST /custom-requests/:id/accept           Chấp nhận + tạo báo giá
[Khách] GET /custom-requests/:id/quote             Xem báo giá → tiếp tục như Luồng A
        └─ Thợ từ chối:
[Thợ]   POST /custom-requests/:id/reject           Từ chối, khách nhận thông báo
```

---

### Luồng D: Thợ đăng ký gói Subscription

```
[Thợ]   GET /subscription/plans                    Xem các gói và giá
[Thợ]   POST /subscription/discounts/validate      Kiểm tra mã giảm giá (nếu có)
[Thợ]   POST /subscription/subscribe               Tạo PaymentIntent → nhận clientSecret
[FE]    stripe.confirmCardPayment(clientSecret)    Xác nhận thanh toán qua Stripe.js
[Stripe]POST /subscription/stripe/webhook          Stripe tự gọi → kích hoạt subscription
[Thợ]   GET /subscription/my/status               Kiểm tra subscription đã active chưa
```

---

### Luồng E: Thợ upload và xác minh chứng chỉ

```
[Thợ]   POST /certifications                       Upload PDF → trạng thái "pending"
[Admin] PATCH /admin/subscription/...             Admin xét duyệt (ngoài hệ thống hiện tại)
[Khách] GET /certifications/provider/:id           Xem chứng chỉ "verified" trên hồ sơ thợ
```

---

## Ghi chú kỹ thuật quan trọng

| Vấn đề | Cách xử lý |
|---|---|
| **UUIDs** | Tất cả ID đều là UUID v4. Validate format trước khi gửi. |
| **Timestamps** | ISO 8601 UTC: `2024-01-01T00:00:00.000Z`. |
| **Giá tiền** | Có thể trả về dạng `string` hoặc `number`. Luôn `parseFloat()` trước khi tính toán. |
| **CORS** | Backend cho phép các origin được cấu hình. Liên hệ backend team để thêm domain mới. |
| **Swagger** | Tài liệu interactive tại `http://localhost:3000/api/docs` (chỉ trong dev). |
| **Lỗi 400** | Kiểm tra field `message` trong response — thường chứa thông tin validation cụ thể. |
| **Lỗi 401** | Access token hết hạn → gọi refresh. |
| **Lỗi 403** | Đúng token nhưng không đủ quyền (sai role hoặc không phải chủ resource). |
