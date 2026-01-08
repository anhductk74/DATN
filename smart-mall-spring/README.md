# Smart Mall Spring Backend

## Setup Instructions

### 1. Environment Variables Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Then update the values in `.env` with your actual credentials:

```env
# Database Configuration
SPRING_DATASOURCE_URL=jdbc:mysql://152.42.244.64:3307/smart_mall_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_minimum_256_bits

# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration (Gmail SMTP)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password

# VNPay Configuration
VNPAY_KEY=your_vnpay_hash_secret

# GHTK API Configuration
GHTK_API_TOKEN=your_ghtk_api_token
```

### 2. Build and Run

**Build without tests:**
```bash
./gradlew build -x test
```

**Run application:**
```bash
./gradlew bootRun
```

The application will start on `http://localhost:8080`

### 3. API Documentation

- Swagger UI: `http://localhost:8080/docs`
- API Docs: `http://localhost:8080/api-docs`
- **📄 [Product API Documentation](docs/API_PRODUCT.md)** - Chi tiết đầy đủ về Product API
- **📄 [Cart API Documentation](docs/API_CART.md)** - Chi tiết đầy đủ về Cart API

### Public Endpoints (No Authentication Required)

Các endpoint sau có thể truy cập mà không cần Bearer token:

- **Products:** `GET /api/products/**`
- **Categories:** `GET /api/categories/**`
- **Reviews:** `GET /api/reviews/**`

Người dùng chưa đăng nhập có thể:
- Xem danh sách sản phẩm, categories, reviews
- Xem chi tiết sản phẩm với thông tin discount
- Tìm kiếm sản phẩm
- Xem thống kê reviews

## Important Notes

- ⚠️ **Never commit `.env` file** - It contains sensitive credentials
- ✅ `.env.example` is safe to commit as a template
- Configure email: Use Gmail App Password (not regular password)
- JWT Secret must be at least 256 bits long

## Tech Stack

- Java 21
- Spring Boot 3.5.6
- MySQL
- JWT Authentication
- VNPay Payment Gateway
- GHTK Shipping Integration
