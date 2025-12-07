# SmartMall Shipper Mobile App - Login Module

## 📱 Tính năng đã triển khai

### ✅ Form Login hoàn chỉnh với:
- **UI đẹp mắt**: Thiết kế hiện đại với gradient màu xanh
- **Validation**: Kiểm tra email/số điện thoại và mật khẩu
- **Security**: Ẩn/hiện mật khẩu, lưu token an toàn
- **Error Handling**: Xử lý lỗi chi tiết và thông báo người dùng
- **Loading State**: Hiển thị loading khi đang đăng nhập
- **Shipper Verification**: Kiểm tra user có phải shipper không
- **Status Check**: Kiểm tra trạng thái shipper (SUSPENDED không cho đăng nhập)

## 🏗️ Cấu trúc dự án

```
src/
├── types/
│   └── auth.types.ts          # Type definitions cho authentication
├── services/
│   ├── api.service.ts         # Service gọi API login
│   └── storage.service.ts     # Service lưu trữ token & user info
└── screens/
    └── LoginScreen.tsx        # Màn hình đăng nhập
```

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình API URL

Mở file `src/services/api.service.ts` và thay đổi URL:

```typescript
const API_BASE_URL = 'https://your-api-domain.com'; // Thay bằng URL thực tế
```

### 3. Chạy ứng dụng

```bash
# Chạy trên Android
npm run android

# Chạy trên iOS
npm run ios

# Chạy trên web
npm run web
```

## 📦 Dependencies đã thêm

- `@react-native-async-storage/async-storage`: Lưu trữ token và thông tin user

## 🔐 Luồng đăng nhập

1. **Nhập thông tin**: User nhập email/số điện thoại và mật khẩu
2. **Validation**: Kiểm tra form hợp lệ
3. **Call API**: Gửi request đến `/api/auth/login`
4. **Kiểm tra response**:
   - ✅ SUCCESS: Kiểm tra user có phải shipper
   - ✅ Kiểm tra trạng thái shipper (không cho SUSPENDED đăng nhập)
   - ❌ ERROR: Hiển thị thông báo lỗi
5. **Lưu dữ liệu**:
   - Access Token
   - Refresh Token
   - User Info (bao gồm thông tin shipper)
6. **Chuyển màn hình**: Navigate đến Home Screen

## 📝 API Integration

### Request
```typescript
POST /api/auth/login
{
  "username": "shipper@example.com",
  "password": "password123"
}
```

### Response
```typescript
{
  "status": "SUCCESS",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "userInfo": {
      "id": "...",
      "fullName": "Nguyễn Văn A",
      "shipper": {
        "shipperId": "...",
        "status": "ACTIVE",
        "vehicleType": "MOTORBIKE",
        ...
      }
    }
  }
}
```

## 🎨 UI Features

- **Logo Container**: Icon 🚚 với shadow đẹp mắt
- **Input Fields**: 
  - Email/Phone với icon 👤
  - Password với icon 🔒 và nút show/hide
- **Button States**: Disabled khi đang loading
- **Responsive**: Keyboard avoiding view cho iOS/Android
- **Colors**: Blue theme (#4A90E2)

## 🔒 Security Features

1. **Secure Storage**: Sử dụng AsyncStorage để lưu token
2. **Password Hide**: Mặc định ẩn mật khẩu
3. **Validation**: Kiểm tra input trước khi gửi
4. **Role Check**: Chỉ cho phép shipper đăng nhập
5. **Status Check**: Không cho tài khoản SUSPENDED đăng nhập

## 📋 Dữ liệu được lưu sau khi đăng nhập

```typescript
// Tokens
@smartmall_access_token: "eyJhbGci..."
@smartmall_refresh_token: "eyJhbGci..."

// User Info (bao gồm shipper info)
@smartmall_user_info: {
  id: "...",
  fullName: "Nguyễn Văn A",
  shipper: {
    shipperId: "...",
    status: "ACTIVE",
    vehicleType: "MOTORBIKE",
    licensePlate: "59H1-23456",
    currentLatitude: 10.762622,
    currentLongitude: 106.660172,
    maxDeliveryRadius: 15.0,
    operationalRegionFull: "Phường 1, Quận Gò Vấp, TP. HCM",
    shippingCompanyName: "GHTK"
  }
}
```

## 🔄 Next Steps (TODO)

1. **Navigation**: Thêm React Navigation để chuyển màn hình sau khi đăng nhập
2. **Home Screen**: Tạo màn hình chính hiển thị đơn hàng
3. **Profile Screen**: Hiển thị thông tin shipper
4. **Token Refresh**: Implement auto refresh token khi hết hạn
5. **Forgot Password**: Thêm chức năng quên mật khẩu
6. **Persistent Login**: Tự động đăng nhập nếu còn token hợp lệ

## 🐛 Error Cases đã xử lý

| Case | Thông báo |
|------|-----------|
| Username rỗng | "Vui lòng nhập email hoặc số điện thoại" |
| Password rỗng | "Vui lòng nhập mật khẩu" |
| Password < 6 ký tự | "Mật khẩu phải có ít nhất 6 ký tự" |
| User không phải shipper | "Tài khoản này không phải là tài khoản shipper" |
| Account bị khóa | "Tài khoản của bạn đã bị tạm khóa" |
| Network error | "Đã xảy ra lỗi. Vui lòng thử lại" |
| Invalid credentials | Hiển thị message từ API |

## 📱 Test Account (Demo)

```
Username: shipper123@gmail.com
Password: password123
```

## 🎯 Key Points

- ✅ Type-safe với TypeScript
- ✅ Clean code structure
- ✅ Error handling đầy đủ
- ✅ UI/UX thân thiện
- ✅ Secure token storage
- ✅ Shipper verification
- ✅ Status checking
- ✅ Responsive design

---

**Developed by:** SmartMall Team  
**Version:** 1.0.0  
**Last Updated:** December 2024
