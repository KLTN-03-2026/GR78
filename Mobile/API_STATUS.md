# Trạng thái API trong Project

## ✅ Các API đang hoạt động bình thường

### Authentication APIs (AuthRepository)
- ✅ `login()` - Đăng nhập mobile
- ✅ `logoutDevice()` - Đăng xuất thiết bị
- ✅ `refresh()` - Refresh token
- ✅ `register()` - Đăng ký tài khoản mới

**Tất cả đều sử dụng đúng OpenAPI client với interceptor tự động gắn token**

### Posts APIs (PostRepository)
- ✅ `getAllPost()` - Lấy danh sách bài viết công khai (feed)
- ✅ `getMyPosts()` - Lấy danh sách bài viết của tôi
- ✅ `createNewPost()` - Tạo bài viết mới (đã fix lỗi DateTime UTC)
- ✅ `updatePost()` - Cập nhật bài viết
- ✅ `deletePost()` - Xóa bài viết
- ✅ `getaPost()` - Lấy chi tiết bài viết theo ID
- ✅ `closePost()` - Đóng bài viết

**Tất cả đều sử dụng đúng OpenAPI client với interceptor tự động gắn token**

## 🔧 Cấu hình hiện tại

### Dio Interceptor
- ✅ Tự động gắn `Authorization: Bearer <token>` vào mọi request
- ✅ Tự động refresh token khi nhận 401
- ✅ Tự động thêm `ngrok-skip-browser-warning` header

### OpenAPI Client
- ✅ Sử dụng chung Dio instance với interceptor
- ✅ Bearer token được cập nhật tự động sau khi login
- ✅ Tất cả API endpoints đều đi qua interceptor

## 📝 Lưu ý

1. **DateTime phải là UTC**: Khi tạo bài viết, `desiredTime` phải được chuyển sang UTC trước khi gửi
2. **Token tự động**: Token được tự động gắn vào mọi request, không cần thêm thủ công
3. **Error handling**: Tất cả API đều có error handling đầy đủ với thông báo lỗi rõ ràng

## 🗑️ File không sử dụng

- `lib/features/home/services/post_service.dart` - File cũ, không được sử dụng (chỉ có comment trong code)

