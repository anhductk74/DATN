# API Login cho Shipper

## Tổng quan

Khi shipper đăng nhập qua API `/api/auth/login`, response sẽ trả về **đầy đủ thông tin shipper** cần thiết cho app để hoạt động.

## Endpoint

```
POST /api/auth/login
```

## Request Body

```json
{
  "username": "shipper@example.com",
  "password": "password123"
}
```

## Response Structure

```json
{
  "status": "SUCCESS",
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "userInfo": {
      // Thông tin user cơ bản
      "id": "uuid-user-id",
      "username": "shipper@example.com",
      "fullName": "Nguyễn Văn A",
      "phoneNumber": "0123456789",
      "avatar": "https://cloudinary.com/avatar.jpg",
      "gender": "MALE",
      "dateOfBirth": "1990-01-01",
      "isActive": 1,
      "roles": ["SHIPPER"],
      
      // ⭐ Thông tin shipper (CHỈ có khi user có role SHIPPER)
      "shipper": {
        "shipperId": "uuid-shipper-id",
        "status": "ACTIVE",  // ACTIVE, INACTIVE, SUSPENDED, BUSY
        
        // Thông tin phương tiện
        "vehicleType": "MOTORBIKE",
        "licensePlate": "29A-12345",
        "vehicleBrand": "Honda",
        "vehicleColor": "Đỏ",
        
        // Vị trí hiện tại
        "currentLatitude": 10.762622,
        "currentLongitude": 106.660172,
        "maxDeliveryRadius": 10.0,
        
        // Khu vực hoạt động
        "operationalCommune": "Phường Bến Nghé",
        "operationalDistrict": "Quận 1",
        "operationalCity": "TP. Hồ Chí Minh",
        "operationalRegionFull": "Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        
        // Công ty vận chuyển
        "shippingCompanyId": "uuid-company-id",
        "shippingCompanyName": "GHTK"
      },
      
      // Thông tin company (CHỈ có khi user có role MANAGER)
      "company": null
    }
  }
}
```

## Các trường thông tin Shipper

### 1. Thông tin cơ bản
- `shipperId`: UUID duy nhất của shipper
- `status`: Trạng thái hiện tại (ACTIVE, INACTIVE, SUSPENDED, BUSY)

### 2. Thông tin phương tiện
- `vehicleType`: Loại phương tiện (MOTORBIKE, CAR, TRUCK, BICYCLE)
- `licensePlate`: Biển số xe
- `vehicleBrand`: Hãng xe
- `vehicleColor`: Màu xe

### 3. Vị trí & bán kính giao hàng
- `currentLatitude`: Vĩ độ hiện tại
- `currentLongitude`: Kinh độ hiện tại
- `maxDeliveryRadius`: Bán kính giao hàng tối đa (km)

### 4. Khu vực hoạt động
- `operationalCommune`: Phường/xã
- `operationalDistrict`: Quận/huyện
- `operationalCity`: Tỉnh/thành phố
- `operationalRegionFull`: Địa chỉ đầy đủ khu vực hoạt động

### 5. Công ty vận chuyển
- `shippingCompanyId`: UUID công ty
- `shippingCompanyName`: Tên công ty (GHTK, GHN, Ninja Van...)

## Luồng sử dụng sau khi Login

1. **Lưu tokens**: 
   - `accessToken`: Dùng cho mọi API request (header: `Authorization: Bearer {token}`)
   - `refreshToken`: Dùng để làm mới accessToken khi hết hạn

2. **Hiển thị thông tin shipper**:
   - Tên, avatar, số điện thoại từ `userInfo`
   - Trạng thái từ `shipper.status`
   - Thông tin xe từ `shipper.vehicleType`, `licensePlate`...

3. **Xác định khu vực hoạt động**:
   - Hiển thị khu vực: `shipper.operationalRegionFull`
   - Bán kính: `shipper.maxDeliveryRadius` km

4. **Tracking vị trí**:
   - Load vị trí hiện tại từ `shipper.currentLatitude/currentLongitude`
   - Update vị trí realtime qua API update location

5. **Quản lý đơn hàng**:
   - Dùng `shipperId` để fetch danh sách đơn hàng
   - Filter theo khu vực hoạt động

## Ví dụ Response thực tế

```json
{
  "status": "SUCCESS",
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.dQw4w9WgXcQ",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "userInfo": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "username": "shipper123@gmail.com",
      "fullName": "Nguyễn Văn Shipper",
      "phoneNumber": "0901234567",
      "avatar": "https://res.cloudinary.com/demo/image/upload/shipper-avatar.jpg",
      "gender": "MALE",
      "dateOfBirth": "1995-05-15",
      "isActive": 1,
      "roles": ["SHIPPER"],
      "shipper": {
        "shipperId": "258cb90e-c75c-4f6d-938a-732c2d48ac64",
        "status": "ACTIVE",
        "vehicleType": "MOTORBIKE",
        "licensePlate": "59H1-23456",
        "vehicleBrand": "Honda Winner X",
        "vehicleColor": "Đen",
        "currentLatitude": 10.762622,
        "currentLongitude": 106.660172,
        "maxDeliveryRadius": 15.0,
        "operationalCommune": "Phường 1",
        "operationalDistrict": "Quận Gò Vấp",
        "operationalCity": "TP. Hồ Chí Minh",
        "operationalRegionFull": "Phường 1, Quận Gò Vấp, TP. Hồ Chí Minh",
        "shippingCompanyId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "shippingCompanyName": "GHTK"
      },
      "company": null
    }
  }
}
```

## Lưu ý quan trọng

1. **Field `shipper` chỉ xuất hiện khi**:
   - User có role `SHIPPER`
   - Shipper đã được đăng ký trong hệ thống

2. **Field `company` chỉ xuất hiện khi**:
   - User có role `MANAGER`
   - Manager thuộc một Shipping Company

3. **Status của shipper**:
   - `ACTIVE`: Đang hoạt động, nhận đơn được
   - `INACTIVE`: Tạm ngừng, không nhận đơn
   - `SUSPENDED`: Bị tạm khóa do vi phạm
   - `BUSY`: Đang bận giao đơn khác

4. **Token security**:
   - `accessToken` hết hạn sau 24h (86400s)
   - `refreshToken` dùng để renew accessToken
   - Luôn lưu token an toàn (SecureStorage/Keychain)

## Error Cases

### 1. Username/Password sai
```json
{
  "status": "ERROR",
  "message": "Invalid username or password",
  "data": null
}
```

### 2. Account bị vô hiệu hóa
```json
{
  "status": "ERROR",
  "message": "Account is not active",
  "data": null
}
```

### 3. User không phải shipper
Response vẫn thành công nhưng `shipper` field sẽ là `null`:
```json
{
  ...
  "userInfo": {
    ...
    "roles": ["USER"],
    "shipper": null,
    "company": null
  }
}
```
