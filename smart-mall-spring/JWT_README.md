# Smart Mall JWT Authentication System

Hệ thống xác thực JWT chuẩn với kiến trúc phân tầng rõ ràng.

## Quick Start

### 1. Khởi động ứng dụng
```bash
./gradlew bootRun
```

### 2. Các tài khoản mặc định
- **Admin**: `admin` / `admin`

### 3. Test API đăng ký
```bash
# Đăng ký USER
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password123",
    "fullName": "User Name",
    "phoneNumber": "0123456789"
  }'

# Đăng ký MANAGER
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "manager@example.com",
    "password": "password123",
    "fullName": "Manager Name",
    "phoneNumber": "0987654321",
    "role": "MANAGER"
  }'

# Đăng ký SHIPPER
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "shipper@example.com",
    "password": "password123",
    "fullName": "Shipper Name",
    "phoneNumber": "0111222333",
    "role": "SHIPPER"
  }'
```

### 4. Test API đăng nhập
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password123"
  }'
```

## Kiến trúc

### 1. **Controller Layer**
- `AuthController`: Xử lý các API endpoint liên quan đến authentication
- `UserController`: Xử lý các API endpoint cần xác thực
- Chỉ nhận và trả về DTOs, không tương tác trực tiếp với Entities

### 2. **Service Layer**
- `JwtService`: Xử lý tạo, xác thực và parse JWT tokens
- `AuthService`: Xử lý logic đăng nhập, đăng ký, refresh token
- `CustomUserDetailsService`: Load user details cho Spring Security
- Tương tác với Repository và Entities

### 3. **Repository Layer**
- `UserRepository`: Truy vấn database cho User entity

### 4. **Entity Layer**
- `User`: Entity người dùng
- `UserProfile`: Profile chi tiết của user
- `Role`: Vai trò của user

### 5. **DTO Layer**
- `LoginRequestDto`: Request đăng nhập
- `RegisterRequestDto`: Request đăng ký
- `AuthResponseDto`: Response authentication
- `UserInfoDto`: Thông tin user
- `RefreshTokenRequestDto`: Request refresh token

### 6. **DTO Validation Rules**

**RegisterRequestDto:**
- `username`: Required, must be valid email format (trừ "admin")
- `password`: Required
- `fullName`: Required
- `phoneNumber`: Optional
- `role`: Optional (USER, MANAGER, SHIPPER). Default: USER nếu không truyền

**LoginRequestDto:**
- `username`: Required
- `password`: Required

**RefreshTokenRequestDto:**
- `refreshToken`: Required

**GoogleLoginRequestDto:**
- `idToken`: Required

## API Endpoints

### Authentication Endpoints

#### 1. Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
    "username": "admin",
    "password": "admin"
}
```

**Response:**
```json
{
    "status": 200,
    "message": "Login successful",
    "data": {
        "accessToken": "eyJhb...",
        "refreshToken": "eyJhb...",
        "tokenType": "Bearer",
        "expiresIn": 86400,
        "userInfo": {
            "id": "uuid",
            "username": "admin",
            "fullName": "System Administrator",
            "phoneNumber": "0123456789",
            "isActive": 1,
            "roles": ["ADMIN", "USER"]
        }
    }
}
```

#### 2. Đăng nhập với Google
```http
POST /api/auth/google-login
Content-Type: application/json

{
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkYzAyN..."
}
```

**Response:**
```json
{
    "status": 200,
    "message": "Google login successful",
    "data": {
        "accessToken": "eyJhb...",
        "refreshToken": "eyJhb...",
        "tokenType": "Bearer",
        "expiresIn": 86400,
        "userInfo": {
            "id": "uuid",
            "username": "user@gmail.com",
            "fullName": "Google User",
            "phoneNumber": null,
            "isActive": 1,
            "roles": ["USER"]
        }
    }
}
```

#### 3. Đăng ký
```http
POST /api/auth/register
Content-Type: application/json

{
    "username": "newuser@example.com",
    "password": "password123",
    "fullName": "New User",
    "phoneNumber": "0123456789",
    "role": "USER"
}
```

**Roles hợp lệ:**
- `USER` (mặc định nếu không truyền role)
- `MANAGER` 
- `SHIPPER`

**Response:**
```json
{
    "status": 200,
    "message": "Register successful",
    "data": {
        "accessToken": "eyJhb...",
        "refreshToken": "eyJhb...",
        "tokenType": "Bearer",
        "expiresIn": 86400,
        "userInfo": {
            "id": "uuid",
            "username": "newuser@example.com",
            "fullName": "New User",
            "phoneNumber": "0123456789",
            "avatar": null,
            "isActive": 1,
            "roles": ["USER"]
        }
    }
}
```

**Ví dụ đăng ký các role khác:**

**Đăng ký MANAGER:**
```http
POST /api/auth/register
Content-Type: application/json

{
    "username": "manager@example.com",
    "password": "manager123",
    "fullName": "Manager Name",
    "phoneNumber": "0123456789",
    "role": "MANAGER"
}
```

**Đăng ký SHIPPER:**
```http
POST /api/auth/register
Content-Type: application/json

{
    "username": "shipper@example.com",
    "password": "shipper123",
    "fullName": "Shipper Name",
    "phoneNumber": "0987654321",
    "role": "SHIPPER"
}
```

#### 4. Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
    "refreshToken": "eyJhb..."
}
```

#### 5. Đăng xuất
```http
POST /api/auth/logout
```

### Protected Endpoints

#### 1. Lấy thông tin user hiện tại
```http
GET /api/user/profile
Authorization: Bearer <access_token>
```

#### 2. Admin only endpoint
```http
GET /api/user/admin
Authorization: Bearer <access_token>
```

## Cấu hình JWT

### Application Properties
```properties
# JWT Configuration
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration=86400000
jwt.refresh-token.expiration=604800000

# Google OAuth2 Configuration
google.oauth2.client-id=YOUR_GOOGLE_CLIENT_ID
```

### Google OAuth2 Setup
1. Tạo project trong [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google+ API
3. Tạo OAuth 2.0 Client ID credentials
4. Thay thế `YOUR_GOOGLE_CLIENT_ID` với Client ID thực tế
5. Cấu hình Authorized JavaScript origins (ví dụ: `http://localhost:3000`)
6. Frontend sử dụng Google Sign-In JavaScript library để lấy ID token

### JWT Token Structure
- **Access Token**: Hết hạn sau 24 giờ
- **Refresh Token**: Hết hạn sau 7 ngày
- **Algorithm**: HS256
- **Claims**: Subject (username), issued at, expiration

## Security Configuration

### Endpoints không cần xác thực:
- `/api/auth/**`: Tất cả authentication endpoints
- `/api/public/**`: Public endpoints

### Endpoints cần xác thực:
- Tất cả các endpoints khác cần JWT token hợp lệ

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BINARY(16) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    resetpasswordcode VARCHAR(255),
    resetpasswordcodecreationtime DATETIME,
    is_active INT DEFAULT 0,
    created_at DATETIME,
    updated_at DATETIME
);
```

### User Profiles Table
```sql
CREATE TABLE user_profiles (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) UNIQUE,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    avatar VARCHAR(500),
    number_phone VARCHAR(20),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Roles Table
```sql
CREATE TABLE roles (
    id BINARY(16) PRIMARY KEY,
    code VARCHAR(50),
    name VARCHAR(100) UNIQUE,
    created_at DATETIME,
    updated_at DATETIME
);
```

**Roles mặc định được tạo tự động:**
- `ADMIN`: Quản trị viên hệ thống
- `USER`: Người dùng thông thường (mặc định khi đăng ký)
- `MANAGER`: Quản lý cửa hàng/sản phẩm
- `SHIPPER`: Người giao hàng

### User Roles Table
```sql
CREATE TABLE user_roles (
    user_id BINARY(16),
    role_id BINARY(16),
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

## Cách sử dụng

### 1. Frontend Integration
```javascript
// Lưu token sau khi đăng nhập
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('refreshToken', response.data.refreshToken);

// Thêm token vào header cho các request
const token = localStorage.getItem('accessToken');
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Xử lý refresh token khi access token hết hạn
axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            const refreshToken = localStorage.getItem('refreshToken');
            try {
                const response = await axios.post('/api/auth/refresh-token', {
                    refreshToken: refreshToken
                });
                localStorage.setItem('accessToken', response.data.accessToken);
                return axios.request(error.config);
            } catch (refreshError) {
                // Redirect to login
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
```

### 2. Postman Testing
1. Đăng nhập để lấy token
2. Copy `accessToken` từ response
3. Thêm vào Authorization header: `Bearer <accessToken>`
4. Test các protected endpoints

## Error Handling

Tất cả lỗi được xử lý bởi `GlobalExceptionHandler` và trả về format chuẩn:

```json
{
    "status": 400,
    "message": "Error message",
    "data": null
}
```

### Các lỗi thường gặp khi đăng ký:

**1. Username không đúng định dạng email:**
```json
{
    "status": 400,
    "message": "Username must be a valid email format",
    "data": null
}
```

**2. Username đã tồn tại:**
```json
{
    "status": 400,
    "message": "Username already exists",
    "data": null
}
```

**3. Role không hợp lệ:**
```json
{
    "status": 400,
    "message": "Invalid role. Allowed roles: USER, MANAGER, SHIPPER",
    "data": null
}
```

**4. Role không tồn tại trong database:**
```json
{
    "status": 400,
    "message": "MANAGER role not found",
    "data": null
}
```
*Lưu ý: Nếu gặp lỗi này, cần khởi động lại ứng dụng để DataInitializer tạo các role.*

**5. Validation errors:**
```json
{
    "status": 400,
    "message": "Username is required",
    "data": null
}
```

## Security Features

1. **Password Encoding**: BCrypt
2. **JWT Signing**: HMAC SHA-256
3. **CORS**: Configured for all origins
4. **Session Management**: Stateless
5. **Method Security**: Role-based access control
6. **Authentication Filter**: JWT token validation

## Build và Run

```bash
# Build project
./gradlew clean build

# Run application
./gradlew bootRun
```

Application sẽ chạy trên port 8080: http://localhost:8080