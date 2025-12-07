# API MANAGER MANAGEMENT

## 1. LẤY DANH SÁCH MANAGERS

### Endpoint
```
GET /api/managers?search=&page=0&size=10
```

### Headers
```json
{
  "Authorization": "Bearer {token}"
}
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| search | String | No | - | Tìm kiếm theo tên, email, SĐT, tên công ty, mã công ty |
| page | Integer | No | 0 | Số trang (bắt đầu từ 0) |
| size | Integer | No | 10 | Số items mỗi trang |

### Request Examples

**Lấy tất cả managers:**
```
GET /api/managers?page=0&size=10
```

**Tìm kiếm theo tên:**
```
GET /api/managers?search=Nguyễn&page=0&size=10
```

**Tìm kiếm theo công ty:**
```
GET /api/managers?search=Viettel&page=0&size=10
```

### Response (200 OK)

```json
{
  "data": [
    {
      "managerId": "abc12345-e89b-12d3-a456-426614174000",
      "userId": "789e4567-e89b-12d3-a456-426614174000",
      "username": "manager01@viettelpost.com",
      "fullName": "Nguyễn Văn Manager",
      "phoneNumber": "0901234567",
      "avatar": null,
      "isActive": 1,
      "companyId": "550e8400-e29b-41d4-a716-446655440000",
      "companyName": "Viettel Post",
      "companyCode": "VTP",
      "companyContactEmail": "contact@viettelpost.com",
      "companyContactPhone": "1900545411",
      "companyStreet": "100 Đường Lê Thánh Tôn",
      "companyCommune": "Phường Bến Nghé",
      "companyDistrict": "Quận 1",
      "companyCity": "Hồ Chí Minh",
      "companyFullAddress": "100 Đường Lê Thánh Tôn, Phường Bến Nghé, Quận 1, Hồ Chí Minh",
      "createdAt": "2025-12-05T10:30:00",
      "updatedAt": "2025-12-05T10:30:00"
    }
  ],
  "currentPage": 0,
  "totalItems": 1,
  "totalPages": 1
}
```

---

## 2. LẤY THÔNG TIN MANAGER THEO ID

### Endpoint
```
GET /api/managers/{id}
```

### Headers
```json
{
  "Authorization": "Bearer {token}"
}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Manager ID |

### Request Example
```
GET /api/managers/abc12345-e89b-12d3-a456-426614174000
```

### Response (200 OK)

```json
{
  "managerId": "abc12345-e89b-12d3-a456-426614174000",
  "userId": "789e4567-e89b-12d3-a456-426614174000",
  "username": "manager01@viettelpost.com",
  "fullName": "Nguyễn Văn Manager",
  "phoneNumber": "0901234567",
  "avatar": "https://cloudinary.com/images/avatar.jpg",
  "isActive": 1,
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "companyName": "Viettel Post",
  "companyCode": "VTP",
  "companyContactEmail": "contact@viettelpost.com",
  "companyContactPhone": "1900545411",
  "companyStreet": "100 Đường Lê Thánh Tôn",
  "companyCommune": "Phường Bến Nghé",
  "companyDistrict": "Quận 1",
  "companyCity": "Hồ Chí Minh",
  "companyFullAddress": "100 Đường Lê Thánh Tôn, Phường Bến Nghé, Quận 1, Hồ Chí Minh",
  "createdAt": "2025-12-05T10:30:00",
  "updatedAt": "2025-12-05T10:30:00"
}
```

---

## 3. LẤY MANAGER THEO USER ID

### Endpoint
```
GET /api/managers/user/{userId}
```

### Headers
```json
{
  "Authorization": "Bearer {token}"
}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | UUID | Yes | User ID |

### Request Example
```
GET /api/managers/user/789e4567-e89b-12d3-a456-426614174000
```

### Response (200 OK)

```json
{
  "managerId": "abc12345-e89b-12d3-a456-426614174000",
  "userId": "789e4567-e89b-12d3-a456-426614174000",
  "username": "manager01@viettelpost.com",
  "fullName": "Nguyễn Văn Manager",
  "phoneNumber": "0901234567",
  "avatar": null,
  "isActive": 1,
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "companyName": "Viettel Post",
  "companyCode": "VTP",
  "companyContactEmail": "contact@viettelpost.com",
  "companyContactPhone": "1900545411",
  "companyStreet": "100 Đường Lê Thánh Tôn",
  "companyCommune": "Phường Bến Nghé",
  "companyDistrict": "Quận 1",
  "companyCity": "Hồ Chí Minh",
  "companyFullAddress": "100 Đường Lê Thánh Tôn, Phường Bến Nghé, Quận 1, Hồ Chí Minh",
  "createdAt": "2025-12-05T10:30:00",
  "updatedAt": "2025-12-05T10:30:00"
}
```

**Use Case:** Dùng để lấy thông tin Manager sau khi login (từ userId trong JWT token)

---

## 4. XÓA MANAGER

### Endpoint
```
DELETE /api/managers/{id}
```

### Headers
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Lưu ý:** Chỉ ADMIN mới có quyền xóa Manager

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Manager ID |

### Request Example
```
DELETE /api/managers/abc12345-e89b-12d3-a456-426614174000
```

### Response (204 No Content)

Không có body response.

---

## ERROR RESPONSES

### 404 Not Found - Manager không tồn tại

```json
{
  "timestamp": "2025-12-05T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Không tìm thấy manager với ID: abc12345-e89b-12d3-a456-426614174000",
  "path": "/api/managers/abc12345-e89b-12d3-a456-426614174000"
}
```

### 404 Not Found - User ID không phải Manager

```json
{
  "timestamp": "2025-12-05T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Không tìm thấy manager với User ID: 789e4567-e89b-12d3-a456-426614174000",
  "path": "/api/managers/user/789e4567-e89b-12d3-a456-426614174000"
}
```

### 401 Unauthorized

```json
{
  "timestamp": "2025-12-05T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/managers"
}
```

---

## RESPONSE FIELDS

| Field | Type | Description |
|-------|------|-------------|
| managerId | UUID | ID của Manager entity |
| userId | UUID | ID của User account |
| username | String | Email đăng nhập |
| fullName | String | Tên đầy đủ |
| phoneNumber | String | Số điện thoại |
| avatar | String | URL ảnh đại diện |
| isActive | Integer | Trạng thái active (1 = active, 0 = inactive) |
| companyId | UUID | ID của công ty vận chuyển |
| companyName | String | Tên công ty |
| companyCode | String | Mã công ty (unique) |
| companyContactEmail | String | Email liên hệ công ty |
| companyContactPhone | String | SĐT liên hệ công ty |
| companyStreet | String | Địa chỉ đường trụ sở |
| companyCommune | String | Phường/xã trụ sở |
| companyDistrict | String | Quận/huyện trụ sở |
| companyCity | String | Thành phố |
| companyFullAddress | String | Địa chỉ đầy đủ (ghép từ street, commune, district, city) |
| createdAt | DateTime | Thời gian tạo |
| updatedAt | DateTime | Thời gian cập nhật cuối |

---

## USE CASES

### 1. Admin xem danh sách tất cả Managers

```bash
GET /api/managers?page=0&size=20
Authorization: Bearer {admin_token}
```

**Kết quả:** Danh sách tất cả managers với thông tin công ty

### 2. Tìm kiếm Manager theo tên công ty

```bash
GET /api/managers?search=Viettel
Authorization: Bearer {admin_token}
```

**Kết quả:** Chỉ các managers thuộc công ty có chứa "Viettel"

### 3. Manager xem thông tin của chính mình

```bash
# Sau khi login, lấy userId từ JWT token
GET /api/managers/user/789e4567-e89b-12d3-a456-426614174000
Authorization: Bearer {manager_token}
```

**Kết quả:** Thông tin manager + công ty của mình

### 4. Admin xóa Manager

```bash
DELETE /api/managers/abc12345-e89b-12d3-a456-426614174000
Authorization: Bearer {admin_token}
```

**Lưu ý:** Xóa Manager sẽ:
- Không xóa User (có thể assign role khác)
- Không xóa ShippingCompany (có thể assign manager khác)
- Chỉ xóa Manager entity (liên kết User ↔ Company)

---

## WORKFLOW: TỪ ĐĂNG KÝ ĐẾN QUẢN LÝ

### 1. Admin đăng ký Manager

```bash
POST /api/auth/register-manager
Authorization: Bearer {admin_token}

Body:
{
  "email": "manager.hcm@vtp.com",
  "password": "Vtp@123",
  "fullName": "Trần Văn HCM",
  "phoneNumber": "0909111222",
  "companyName": "Viettel Post HCM",
  "companyCode": "VTP-HCM",
  "companyStreet": "100 Lê Thánh Tôn",
  "companyCommune": "Phường Bến Nghé",
  "companyDistrict": "Quận 1",
  "companyCity": "Hồ Chí Minh"
}
```

**Response:** managerId, userId, companyId, tokens

### 2. Admin xem danh sách Managers

```bash
GET /api/managers?page=0&size=10
Authorization: Bearer {admin_token}
```

**Response:** Danh sách managers với thông tin công ty

### 3. Manager login và xem thông tin của mình

```bash
# Login
POST /api/auth/login
{
  "username": "manager.hcm@vtp.com",
  "password": "Vtp@123"
}

# Lấy thông tin (từ userId trong token)
GET /api/managers/user/{userId}
Authorization: Bearer {manager_token}
```

### 4. Manager tạo Shipper cho công ty

```bash
POST /api/logistics/shippers/register
Authorization: Bearer {manager_token}

Body:
{
  "shippingCompanyId": "{companyId từ step 3}",
  "operationalDistrict": "Quận 1",  # Phải khớp với company district
  ...
}
```

---

## NOTES

### Search functionality

Tìm kiếm theo:
- ✅ Tên Manager (fullName)
- ✅ Email Manager (username)
- ✅ Số điện thoại Manager
- ✅ Tên công ty (companyName)
- ✅ Mã công ty (companyCode)

### Pagination

- Default: page=0, size=10
- Sắp xếp: Mới nhất trước (createdAt DESC)
- Response bao gồm: currentPage, totalItems, totalPages

### Authorization

- GET endpoints: Cần authentication
- DELETE endpoint: Cần ADMIN role (nên thêm @PreAuthorize)

### Future enhancements

- [ ] Thêm filter theo companyId
- [ ] Thêm filter theo isActive
- [ ] Thêm endpoint update Manager info
- [ ] Thêm endpoint deactivate Manager
- [ ] Thêm @PreAuthorize cho DELETE endpoint
