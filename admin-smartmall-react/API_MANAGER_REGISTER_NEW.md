# API ĐĂNG KÝ MANAGER MỚI (ADMIN ONLY)

## ENDPOINT MỚI: `/api/auth/register-manager`

### Đặc điểm
- ✅ Endpoint chuyên biệt cho việc đăng ký Manager
- ✅ Tự động tạo: User (MANAGER) → ShippingCompany → Manager entity
- ✅ Validation địa chỉ công ty đầy đủ (street, commune, district, city)
- ✅ Trả về JWT token để Manager login ngay
- ✅ Đồng bộ với flow đăng ký Shipper

---

## ĐĂNG KÝ MANAGER

### Endpoint
```
POST /api/auth/register-manager
```

### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {admin_token}"
}
```

**Lưu ý:**
- **Chỉ ADMIN mới có quyền đăng ký Manager**
- Tự động tạo User với role MANAGER
- Tự động tạo ShippingCompany với địa chỉ trụ sở đầy đủ
- Tự động tạo Manager entity liên kết User ↔ ShippingCompany
- Trả về JWT token để Manager có thể đăng nhập ngay

### Request Body

```json
{
  "email": "manager01@viettelpost.com",
  "password": "Manager@123",
  "fullName": "Nguyễn Văn Manager",
  "phoneNumber": "0901234567",
  "companyName": "Viettel Post",
  "companyCode": "VTP",
  "companyContactEmail": "contact@viettelpost.com",
  "companyContactPhone": "1900545411",
  "companyStreet": "100 Đường Lê Thánh Tôn",
  "companyCommune": "Phường Bến Nghé",
  "companyDistrict": "Quận 1",
  "companyCity": "Hồ Chí Minh"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| email | String | Email đăng nhập (unique) |
| password | String | Mật khẩu (sẽ được mã hóa) |
| fullName | String | Tên đầy đủ của Manager |
| phoneNumber | String | Số điện thoại Manager |
| companyName | String | Tên công ty vận chuyển |
| companyStreet | String | Địa chỉ đường (trụ sở công ty) |
| companyCommune | String | Phường/xã trụ sở |
| companyDistrict | String | **Quận/huyện** (quan trọng cho validation shipper) |
| companyCity | String | Thành phố |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| companyCode | String | Mã công ty (unique nếu có) |
| companyContactEmail | String | Email liên hệ công ty |
| companyContactPhone | String | SĐT liên hệ công ty |

### Response (200 OK)

```json
{
  "status": "success",
  "message": "Manager registered successfully",
  "data": {
    "userId": "789e4567-e89b-12d3-a456-426614174000",
    "username": "manager01@viettelpost.com",
    "fullName": "Nguyễn Văn Manager",
    "phoneNumber": "0901234567",
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
    "managerId": "abc12345-e89b-12d3-a456-426614174000",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## DATABASE STRUCTURE SAU KHI ĐĂNG KÝ

```
┌─────────────────────────────────────────────────────────────┐
│                    1. User (MANAGER role)                    │
├─────────────────────────────────────────────────────────────┤
│ id: 789e4567-e89b-12d3-a456-426614174000                    │
│ username: manager01@viettelpost.com                         │
│ password: [encrypted]                                       │
│ roles: [MANAGER]                                            │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ├──> UserProfile
                    │    ├── full_name: Nguyễn Văn Manager
                    │    └── phone_number: 0901234567
                    │
                    └──> Manager (id: abc12345...)
                         └── shipping_company_id ──────┐
                                                        │
┌───────────────────────────────────────────────────────┴─────┐
│                    ShippingCompany                          │
├─────────────────────────────────────────────────────────────┤
│ id: 550e8400-e29b-41d4-a716-446655440000                    │
│ name: Viettel Post                                          │
│ code: VTP                                                   │
│ headquarters_address_id ──┐                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │     Address     │
                    ├─────────────────┤
                    │ street: 100 ...  │
                    │ commune: Bến Nghé│
                    │ district: Quận 1 │ ◄── Quan trọng!
                    │ city: Hồ Chí Minh│
                    └─────────────────┘
```

---

## WORKFLOW: ADMIN → MANAGER → SHIPPER

### Bước 1: Admin đăng ký Manager

```bash
POST /api/auth/register-manager
Authorization: Bearer {admin_token}

Body:
{
  "email": "manager01@viettelpost.com",
  ...
  "companyDistrict": "Quận 1"  # Lưu ý district này!
}
```

**Kết quả:**
- ✅ User (MANAGER) created
- ✅ ShippingCompany created (district = "Quận 1")
- ✅ Manager entity created
- ✅ JWT tokens returned

### Bước 2: Manager đăng ký Shipper

```bash
POST /api/logistics/shippers/register
Authorization: Bearer {manager_token}

Body:
{
  ...
  "shippingCompanyId": "550e8400-...",  # Phải là công ty của manager
  "operationalDistrict": "Quận 1"      # Phải cùng district với công ty!
}
```

**Validation:**
1. `shippingCompanyId` khớp với công ty của manager ✅
2. `operationalDistrict` == company district ("Quận 1") ✅

**Nếu sai:**
```json
{
  "status": "error",
  "message": "Khu vực hoạt động của shipper phải thuộc Quận 1"
}
```

### Bước 3: Manager quản lý Shippers

```bash
GET /api/logistics/shippers
Authorization: Bearer {manager_token}
```

**Kết quả:**
- Chỉ xem shippers có `shipping_company_id = 550e8400-...`
- Admin xem tất cả

---

## ERROR RESPONSES

### 401 Unauthorized - Chưa đăng nhập

```json
{
  "status": "error",
  "message": "Bạn cần đăng nhập để đăng ký tài khoản Manager",
  "data": null
}
```

### 403 Forbidden - Không phải ADMIN

```json
{
  "status": "error",
  "message": "Chỉ ADMIN mới có quyền đăng ký tài khoản Manager",
  "data": null
}
```

### 400 Bad Request - Email đã tồn tại

```json
{
  "status": "error",
  "message": "Email đã được sử dụng: manager01@viettelpost.com",
  "data": null
}
```

### 400 Bad Request - Mã công ty đã tồn tại

```json
{
  "status": "error",
  "message": "Mã công ty đã tồn tại: VTP",
  "data": null
}
```

---

## SO SÁNH VỚI ENDPOINT CŨ

| Aspect | `/api/auth/register` (old) | `/api/auth/register-manager` (new) |
|--------|---------------------------|-----------------------------------|
| Purpose | Generic registration | Manager-specific registration |
| Request | RegisterRequestDto (generic) | ManagerRegisterDto (specific) |
| Response | AuthResponseDto | ManagerRegisterResponseDto |
| Returns | userId, tokens | userId, companyId, managerId, tokens |
| Validation | Basic role check | Strict ADMIN check + company validation |
| Clarity | ⚠️ Mixed with user registration | ✅ Clear purpose |
| Alignment | ❌ Not aligned with shipper flow | ✅ Aligned with `/shippers/register` |

---

## TESTING SCENARIOS

### Test 1: Admin đăng ký Manager thành công

```bash
# Login as ADMIN
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}

# Đăng ký Manager
POST /api/auth/register-manager
Authorization: Bearer {admin_token}
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

# Expected: 200 OK with companyId, managerId, tokens
```

### Test 2: Non-admin cố đăng ký Manager

```bash
# Login as USER
POST /api/auth/login
{
  "username": "user@example.com",
  "password": "user123"
}

# Cố đăng ký Manager
POST /api/auth/register-manager
Authorization: Bearer {user_token}
{...}

# Expected: 403 Forbidden
# "Chỉ ADMIN mới có quyền đăng ký tài khoản Manager"
```

### Test 3: Email duplicate

```bash
POST /api/auth/register-manager
Authorization: Bearer {admin_token}
{
  "email": "manager.hcm@vtp.com",  # Email đã tồn tại
  ...
}

# Expected: 400 Bad Request
# "Email đã được sử dụng: manager.hcm@vtp.com"
```

### Test 4: Manager tạo shipper sai district

```bash
# Manager với company district = "Quận 1"
POST /api/logistics/shippers/register
Authorization: Bearer {manager_token}
{
  ...
  "operationalDistrict": "Quận 3"  # SAI! Phải là "Quận 1"
}

# Expected: 400 Bad Request
# "Khu vực hoạt động của shipper phải thuộc Quận 1"
```

---

## NOTES

### Tại sao cần endpoint riêng?

1. **Separation of Concerns**: Đăng ký Manager khác với đăng ký User thường
2. **Validation tốt hơn**: Bắt buộc company info, strict ADMIN check
3. **Response rõ ràng**: Trả về companyId, managerId (không chỉ userId)
4. **Đồng bộ**: Cùng pattern với `/api/logistics/shippers/register`
5. **Maintainability**: Dễ maintain và extend logic riêng cho Manager

### Flow hoàn chỉnh

```
ADMIN
  │
  ├──> POST /api/auth/register-manager
  │    ├── Create User (MANAGER)
  │    ├── Create ShippingCompany (district = "Quận X")
  │    └── Create Manager entity
  │
  └──> Response: userId, companyId, managerId, tokens

MANAGER (auto-login)
  │
  ├──> POST /api/logistics/shippers/register
  │    ├── Validate: shippingCompanyId matches
  │    ├── Validate: operationalDistrict == "Quận X"
  │    └── Create Shipper
  │
  └──> GET /api/logistics/shippers
       └── Filter by shipping_company_id
```

### Địa chỉ công ty quan trọng

- `companyDistrict` là **key field** cho validation
- Shipper chỉ hoạt động trong cùng district với công ty
- Admin có thể override (không có validation)
- Manager bị ràng buộc nghiêm ngặt
