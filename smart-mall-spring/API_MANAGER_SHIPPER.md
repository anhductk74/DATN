# API Manager Quản Lý Shipper

Base URL: `http://localhost:8080/api/managers`

## Authentication
Tất cả API yêu cầu JWT token trong header:
```
Authorization: Bearer <token>
```
User phải có role **MANAGER**

---

## 1. Đăng ký Shipper mới

**Endpoint:** `POST /api/managers/shippers/register`

**Content-Type:** `multipart/form-data`

**Description:** Manager đăng ký shipper mới cho công ty của mình. Hệ thống tự động validate manager chỉ được tạo shipper cho công ty mình quản lý.

### Request

**Form Data:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dataInfo | JSON String | Yes | Thông tin shipper (xem cấu trúc bên dưới) |
| idCardFrontImage | File | No | Ảnh mặt trước CCCD/CMND |
| idCardBackImage | File | No | Ảnh mặt sau CCCD/CMND |
| driverLicenseImage | File | No | Ảnh giấy phép lái xe |

**dataInfo JSON Structure:**
```json
{
  "email": "shipper01@example.com",
  "password": "Password123!",
  "fullName": "Nguyễn Văn Shipper",
  "phoneNumber": "0912345678",
  "gender": "MALE",
  "dateOfBirth": "1995-05-15",
  "street": "123 Đường ABC",
  "commune": "Phường Bến Thành",
  "district": "Quận 1",
  "city": "Hồ Chí Minh",
  "shippingCompanyId": "550e8400-e29b-41d4-a716-446655440000",
  "idCardNumber": "079095001234",
  "driverLicenseNumber": "79B1-123456",
  "vehicleType": "MOTORBIKE",
  "licensePlate": "59A1-12345",
  "vehicleBrand": "Honda",
  "vehicleColor": "Đỏ",
  "operationalCommune": "Phường Bến Thành",
  "operationalDistrict": "Quận 1",
  "operationalCity": "Hồ Chí Minh",
  "maxDeliveryRadius": 10.0
}
```

### Response

**Success (201 Created):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "userId": "770e8400-e29b-41d4-a716-446655440002",
  "username": "shipper01@example.com",
  "fullName": "Nguyễn Văn Shipper",
  "phoneNumber": "0912345678",
  "gender": "MALE",
  "dateOfBirth": "1995-05-15",
  "address": "123 Đường ABC, Phường Bến Thành, Quận 1, Hồ Chí Minh",
  "status": "ACTIVE",
  "idCardNumber": "079095001234",
  "idCardFrontImage": "https://res.cloudinary.com/.../id_front.jpg",
  "idCardBackImage": "https://res.cloudinary.com/.../id_back.jpg",
  "driverLicenseNumber": "79B1-123456",
  "driverLicenseImage": "https://res.cloudinary.com/.../license.jpg",
  "vehicleType": "MOTORBIKE",
  "licensePlate": "59A1-12345",
  "vehicleBrand": "Honda",
  "vehicleColor": "Đỏ",
  "operationalCommune": "Phường Bến Thành",
  "operationalDistrict": "Quận 1",
  "operationalCity": "Hồ Chí Minh",
  "maxDeliveryRadius": 10.0,
  "shippingCompanyId": "550e8400-e29b-41d4-a716-446655440000",
  "shippingCompanyName": "Giao Hàng Nhanh"
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Invalid request",
  "message": "Email đã được sử dụng: shipper01@example.com"
}
```

```json
{
  "error": "Invalid request",
  "message": "Manager chỉ có thể tạo shipper cho công ty của mình"
}
```

### cURL Example
```bash
curl -X POST http://localhost:8080/api/managers/shippers/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F 'dataInfo={
    "email": "shipper01@example.com",
    "password": "Password123!",
    "fullName": "Nguyễn Văn Shipper",
    "phoneNumber": "0912345678",
    "gender": "MALE",
    "dateOfBirth": "1995-05-15",
    "street": "123 Đường ABC",
    "commune": "Phường Bến Thành",
    "district": "Quận 1",
    "city": "Hồ Chí Minh",
    "shippingCompanyId": "550e8400-e29b-41d4-a716-446655440000",
    "idCardNumber": "079095001234",
    "driverLicenseNumber": "79B1-123456",
    "vehicleType": "MOTORBIKE",
    "licensePlate": "59A1-12345",
    "vehicleBrand": "Honda",
    "vehicleColor": "Đỏ",
    "operationalCommune": "Phường Bến Thành",
    "operationalDistrict": "Quận 1",
    "operationalCity": "Hồ Chí Minh",
    "maxDeliveryRadius": 10.0
  }' \
  -F "idCardFrontImage=@/path/to/id_front.jpg" \
  -F "idCardBackImage=@/path/to/id_back.jpg" \
  -F "driverLicenseImage=@/path/to/license.jpg"
```

---

## 2. Lấy danh sách Shipper

**Endpoint:** `GET /api/managers/shippers`

**Description:** Lấy danh sách shipper của công ty mà manager đang quản lý. Hỗ trợ tìm kiếm, lọc và phân trang.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| search | String | No | - | Tìm kiếm theo tên, email, số điện thoại |
| status | String | No | - | Lọc theo trạng thái: ACTIVE, BUSY, INACTIVE, ON_LEAVE, SUSPENDED |
| region | String | No | - | Lọc theo khu vực hoạt động |
| page | Integer | No | 0 | Số trang (bắt đầu từ 0) |
| size | Integer | No | 10 | Số bản ghi trên mỗi trang |

### Response

**Success (200 OK):**
```json
{
  "content": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "fullName": "Nguyễn Văn Shipper",
      "phoneNumber": "0912345678",
      "status": "ACTIVE",
      "vehicleType": "MOTORBIKE",
      "licensePlate": "59A1-12345",
      "operationalDistrict": "Quận 1",
      "operationalCity": "Hồ Chí Minh",
      "shippingCompanyName": "Giao Hàng Nhanh"
    }
  ],
  "totalElements": 15,
  "totalPages": 2,
  "currentPage": 0,
  "pageSize": 10
}
```

### cURL Example
```bash
curl -X GET "http://localhost:8080/api/managers/shippers?search=Nguyễn&status=ACTIVE&page=0&size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 3. Lấy chi tiết Shipper

**Endpoint:** `GET /api/managers/shippers/{id}`

**Description:** Lấy thông tin chi tiết của 1 shipper. Manager chỉ xem được shipper thuộc công ty mình.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | ID của shipper |

### Response

**Success (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "userId": "770e8400-e29b-41d4-a716-446655440002",
  "username": "shipper01@example.com",
  "fullName": "Nguyễn Văn Shipper",
  "phoneNumber": "0912345678",
  "avatar": "https://res.cloudinary.com/.../avatar.jpg",
  "gender": "MALE",
  "dateOfBirth": "1995-05-15",
  "address": "123 Đường ABC, Phường Bến Thành, Quận 1, Hồ Chí Minh",
  "status": "ACTIVE",
  "currentLatitude": 10.7769,
  "currentLongitude": 106.7009,
  "idCardNumber": "079095001234",
  "idCardFrontImage": "https://res.cloudinary.com/.../id_front.jpg",
  "idCardBackImage": "https://res.cloudinary.com/.../id_back.jpg",
  "driverLicenseNumber": "79B1-123456",
  "driverLicenseImage": "https://res.cloudinary.com/.../license.jpg",
  "vehicleType": "MOTORBIKE",
  "licensePlate": "59A1-12345",
  "vehicleBrand": "Honda",
  "vehicleColor": "Đỏ",
  "operationalCommune": "Phường Bến Thành",
  "operationalDistrict": "Quận 1",
  "operationalCity": "Hồ Chí Minh",
  "maxDeliveryRadius": 10.0,
  "shippingCompanyId": "550e8400-e29b-41d4-a716-446655440000",
  "shippingCompanyName": "Giao Hàng Nhanh"
}
```

**Error (404 Not Found):**
```json
{
  "error": "Not found",
  "message": "Không tìm thấy shipper với ID: 660e8400-e29b-41d4-a716-446655440001"
}
```

**Error (403 Forbidden):**
```json
{
  "error": "Forbidden",
  "message": "Manager chỉ có thể quản lý shipper của công ty mình"
}
```

### cURL Example
```bash
curl -X GET http://localhost:8080/api/managers/shippers/660e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 4. Cập nhật Shipper

**Endpoint:** `PUT /api/managers/shippers/{id}`

**Content-Type:** `application/json`

**Description:** Cập nhật thông tin shipper. Manager chỉ cập nhật được shipper thuộc công ty mình.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | ID của shipper |

### Request Body
```json
{
  "status": "ACTIVE",
  "vehicleType": "MOTORBIKE",
  "licensePlate": "59A1-54321",
  "vehicleBrand": "Yamaha",
  "vehicleColor": "Xanh",
  "operationalCommune": "Phường Bến Nghé",
  "operationalDistrict": "Quận 1",
  "operationalCity": "Hồ Chí Minh",
  "maxDeliveryRadius": 15.0
}
```

### Response

**Success (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "fullName": "Nguyễn Văn Shipper",
  "phoneNumber": "0912345678",
  "status": "ACTIVE",
  "vehicleType": "MOTORBIKE",
  "licensePlate": "59A1-54321",
  "vehicleBrand": "Yamaha",
  "vehicleColor": "Xanh",
  "operationalDistrict": "Quận 1",
  "maxDeliveryRadius": 15.0,
  "shippingCompanyName": "Giao Hàng Nhanh"
}
```

### cURL Example
```bash
curl -X PUT http://localhost:8080/api/managers/shippers/660e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ACTIVE",
    "vehicleType": "MOTORBIKE",
    "licensePlate": "59A1-54321",
    "vehicleBrand": "Yamaha",
    "vehicleColor": "Xanh",
    "maxDeliveryRadius": 15.0
  }'
```

---

## 5. Xóa Shipper

**Endpoint:** `DELETE /api/managers/shippers/{id}`

**Description:** Xóa shipper khỏi hệ thống. Manager chỉ xóa được shipper thuộc công ty mình.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | ID của shipper |

### Response

**Success (204 No Content):**
```
(Empty body)
```

**Error (404 Not Found):**
```json
{
  "error": "Not found",
  "message": "Không tìm thấy shipper với ID: 660e8400-e29b-41d4-a716-446655440001"
}
```

**Error (403 Forbidden):**
```json
{
  "error": "Forbidden",
  "message": "Manager chỉ có thể quản lý shipper của công ty mình"
}
```

### cURL Example
```bash
curl -X DELETE http://localhost:8080/api/managers/shippers/660e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 6. Thống kê Shipper

**Endpoint:** `GET /api/managers/shippers/statistics`

**Description:** Lấy thống kê tổng quan về shipper của công ty.

### Response

**Success (200 OK):**
```json
{
  "total": 25,
  "active": 18,
  "busy": 5,
  "inactive": 1,
  "onLeave": 1,
  "suspended": 0
}
```

### cURL Example
```bash
curl -X GET http://localhost:8080/api/managers/shippers/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 7. Thống kê giao hàng của Shipper

**Endpoint:** `GET /api/managers/shippers/{id}/delivery-statistics`

**Description:** Lấy thống kê hiệu suất giao hàng của 1 shipper.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | ID của shipper |

### Response

**Success (200 OK):**
```json
{
  "totalDeliveries": 150,
  "successfulDeliveries": 142,
  "failedDeliveries": 8,
  "successRate": 94.67
}
```

### cURL Example
```bash
curl -X GET http://localhost:8080/api/managers/shippers/660e8400-e29b-41d4-a716-446655440001/delivery-statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Enums & Constants

### ShipperStatus
- `ACTIVE` - Hoạt động
- `BUSY` - Đang bận
- `INACTIVE` - Không hoạt động
- `ON_LEAVE` - Nghỉ phép
- `SUSPENDED` - Bị đình chỉ

### Gender
- `MALE` - Nam
- `FEMALE` - Nữ
- `OTHER` - Khác

### VehicleType (ví dụ)
- `MOTORBIKE` - Xe máy
- `CAR` - Ô tô
- `BICYCLE` - Xe đạp
- `TRUCK` - Xe tải

---

## Lưu ý bảo mật

1. **JWT Token:** Tất cả request đều cần JWT token hợp lệ
2. **Role:** User phải có role `MANAGER`
3. **Company Validation:** Manager chỉ quản lý shipper thuộc công ty mình
4. **Auto-validation:** Hệ thống tự động kiểm tra quyền truy cập
5. **Operational Region:** Khu vực hoạt động của shipper phải cùng quận/huyện với công ty

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (Delete success) |
| 400 | Bad Request (Validation error) |
| 401 | Unauthorized (Missing/Invalid token) |
| 403 | Forbidden (No permission) |
| 404 | Not Found |
| 500 | Internal Server Error |
