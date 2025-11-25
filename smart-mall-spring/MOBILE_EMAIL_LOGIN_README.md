# Mobile Username Login API Documentation

Chức năng đăng nhập bằng username (email format) cho mobile app React Native.

## Cấu hình Email

**QUAN TRỌNG:** Mật khẩu trong file này (`datn123@`) KHÔNG phải App Password hợp lệ!

Bạn phải tạo App Password từ Google. Xem hướng dẫn chi tiết trong file `EMAIL_SETUP_GUIDE.md`

### Cấu hình nhanh:

```properties
spring.mail.username=smartmallapp123@gmail.com
spring.mail.password=YOUR-16-DIGIT-APP-PASSWORD-HERE
```

**Để tạo App Password:**
1. Truy cập https://myaccount.google.com/security
2. Bật xác thực 2 bước (2FA)
3. Tạo App Password tại https://myaccount.google.com/apppasswords
4. Copy mã 16 ký tự (bỏ dấu cách) và dán vào `spring.mail.password`

Xem chi tiết trong file: **EMAIL_SETUP_GUIDE.md**

## API Endpoints

### 1. Gửi mã xác thực (Step 1)

**Endpoint**: `POST /api/auth/mobile/send-login-code`

**Request Body**:
```json
{
  "username": "user@example.com"
}
```

**Response thành công** (200 OK):
```json
{
  "success": true,
  "message": "Verification code sent to your email",
  "data": null
}
```

**Response lỗi** (400 Bad Request):
- Username không tồn tại:
```json
{
  "success": false,
  "message": "Username does not exist",
  "data": null
}
```

- Tài khoản chưa được kích hoạt:
```json
{
  "success": false,
  "message": "Account is not active",
  "data": null
}
```

### 2. Xác thực mã và đăng nhập (Step 2)

**Endpoint**: `POST /api/auth/mobile/verify-login-code`

**Request Body**:
```json
{
  "username": "user@example.com",
  "code": "123456"
}
```

**Response thành công** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "userInfo": {
      "id": "uuid-here",
      "username": "user@example.com",
      "fullName": "John Doe",
      "phoneNumber": "0123456789",
      "avatar": "https://...",
      "isActive": 1,
      "roles": ["USER"]
    }
  }
}
```

**Response lỗi** (400 Bad Request):
- Mã xác thực không đúng:
```json
{
  "success": false,
  "message": "Invalid verification code",
  "data": null
}
```

- Mã xác thực đã hết hạn (sau 5 phút):
```json
{
  "success": false,
  "message": "Verification code has expired. Please request a new code.",
  "data": null
}
```

## Flow đăng nhập

```
Mobile App                    Backend Server                     Email Server
    |                              |                                   |
    |---(1) POST /send-login-code->|                                   |
    |    {username}                |                                   |
    |                              |---(2) Generate 6-digit code       |
    |                              |---(3) Save code to DB             |
    |                              |---(4) Send email----------------->|
    |<--(5) Success response-------|                                   |
    |                              |                                   |
    |                              |                   (User checks email)
    |                              |                                   |
    |---(6) POST /verify-login---->|                                   |
    |    {username, code}          |                                   |
    |                              |---(7) Verify code                 |
    |                              |---(8) Generate JWT tokens         |
    |<--(9) Return tokens----------|                                   |
    |                              |                                   |
```

## Đặc điểm

1. **Bảo mật**: 
   - Mã xác thực chỉ có hiệu lực trong 5 phút
   - Mã xác thực bị xóa sau khi sử dụng thành công
   - Mã có 6 chữ số ngẫu nhiên (100000-999999)

2. **Validation**:
   - Username phải đúng định dạng email
   - Username phải tồn tại trong database
   - Tài khoản phải được kích hoạt (isActive = 1)

3. **Chỉ dành cho Mobile App**: 
   - Chức năng này được thiết kế riêng cho mobile app React Native
   - Web app có thể tiếp tục sử dụng endpoint `/api/auth/login` với username/password

## Migration Database

Chạy file SQL migration để thêm các cột cần thiết:

```bash
mysql -u root -p smart_mall_db < sql/migration/add_login_code_to_users.sql
```

Hoặc nếu sử dụng `spring.jpa.hibernate.ddl-auto=update`, các cột sẽ được tự động tạo khi chạy ứng dụng.

## Testing

### Sử dụng cURL:

```bash
# Step 1: Gửi mã xác thực
curl -X POST http://localhost:8080/api/auth/mobile/send-login-code \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com"}'

# Step 2: Xác thực mã (thay 123456 bằng mã nhận được từ email)
curl -X POST http://localhost:8080/api/auth/mobile/verify-login-code \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","code":"123456"}'
```

### Sử dụng Postman:

1. Import các endpoint vào Postman
2. Gọi endpoint `send-login-code` với username
3. Kiểm tra email để lấy mã xác thực
4. Gọi endpoint `verify-login-code` với username và mã xác thực
5. Sử dụng accessToken nhận được cho các request tiếp theo

## Troubleshooting

### Lỗi: "Failed to send verification code. Please try again."

**Nguyên nhân:**
- Chưa cấu hình email đúng
- Sử dụng mật khẩu thông thường thay vì App Password
- Chưa bật 2FA cho Gmail

**Giải pháp:**
1. Xem logs chi tiết trong console để biết lỗi cụ thể
2. Làm theo hướng dẫn trong `EMAIL_SETUP_GUIDE.md`
3. Kiểm tra lại App Password

### Kiểm tra logs:
Khi gặp lỗi gửi email, check console logs:
```
ERROR - Failed to send login code email to: user@example.com. Error: Authentication failed
```

## Lưu ý

- Đảm bảo cấu hình email đúng trước khi sử dụng
- Mã xác thực sẽ được gửi đến email của user
- Mỗi mã chỉ có hiệu lực trong 5 phút
- Mã chỉ có thể sử dụng một lần
- Nếu mã hết hạn hoặc sai, user cần yêu cầu mã mới
