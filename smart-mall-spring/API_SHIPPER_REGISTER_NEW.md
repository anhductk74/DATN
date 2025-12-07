# API REGISTER SHIPPER - HƯỚNG DẪN TEST (CẤU TRÚC MỚI)

## 🎯 OVERVIEW
API mới tách biệt **dataInfo (JSON)** và **dataImage (files)** để dễ dàng xử lý ở frontend.

---

## 📋 ENDPOINT

```
POST http://localhost:8080/api/logistics/shippers/register
Content-Type: multipart/form-data
Authorization: Bearer YOUR_MANAGER_TOKEN
```

---

## 📦 REQUEST FORMAT

### FormData gồm 4 parts:

1. **dataInfo** (type: Text, value: JSON string)
2. **idCardFrontImage** (type: File, optional)
3. **idCardBackImage** (type: File, optional)
4. **driverLicenseImage** (type: File, optional)

---

## 🔥 QUICK TEST GUIDE (POSTMAN)

### Bước 1: Login Manager để lấy token

```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "manager01@vtp.com",
  "password": "Manager@123"
}
```

**Lấy `accessToken` từ response**

---

### Bước 2: Get Shipping Company ID

```
GET http://localhost:8080/api/logistics/shipping-companies
Authorization: Bearer YOUR_TOKEN
```

**Lấy `id` từ response (ví dụ: `550e8400-e29b-41d4-a716-446655440000`)**

---

### Bước 3: Register Shipper

**Postman Setup:**

1. **Method**: POST
2. **URL**: `http://localhost:8080/api/logistics/shippers/register`
3. **Headers**:
   ```
   Authorization: Bearer YOUR_MANAGER_TOKEN_HERE
   ```
   ⚠️ **KHÔNG set Content-Type** (Postman tự động set khi dùng form-data)

4. **Body tab**: Chọn `form-data`

5. **Add FormData fields**:

| KEY | TYPE | VALUE |
|-----|------|-------|
| dataInfo | Text | (Xem JSON bên dưới) |
| idCardFrontImage | File | (Chọn file ảnh) |
| idCardBackImage | File | (Chọn file ảnh) |
| driverLicenseImage | File | (Chọn file ảnh) |

---

### 📄 dataInfo JSON Value

**Copy JSON này vào field `dataInfo`:**

```json
{
  "email": "shipper01@vtp.com",
  "password": "Shipper@123",
  "fullName": "Nguyễn Văn Shipper",
  "phoneNumber": "0901234567",
  "gender": "MALE",
  "dateOfBirth": "1995-05-15",
  "street": "123 Đường Lê Lợi",
  "commune": "Phường Bến Nghé",
  "district": "Quận 1",
  "city": "Hồ Chí Minh",
  "shippingCompanyId": "YOUR_COMPANY_ID_HERE",
  "idCardNumber": "079095001234",
  "driverLicenseNumber": "B2-079095001234",
  "vehicleType": "Xe máy",
  "licensePlate": "59A-12345",
  "vehicleBrand": "Honda",
  "vehicleColor": "Đỏ",
  "operationalCommune": "Phường Bến Thành",
  "operationalDistrict": "Quận 1",
  "operationalCity": "Hồ Chí Minh",
  "maxDeliveryRadius": 15.0
}
```

⚠️ **CHÚ Ý**: Thay `YOUR_COMPANY_ID_HERE` bằng UUID thực từ bước 2!

---

### 🖼️ Upload Files

**Chọn file cho 3 trường:**
- `idCardFrontImage`: Click dropdown → chọn `File` → Select Files → chọn ảnh mặt trước CCCD
- `idCardBackImage`: Click dropdown → chọn `File` → Select Files → chọn ảnh mặt sau CCCD  
- `driverLicenseImage`: Click dropdown → chọn `File` → Select Files → chọn ảnh bằng lái

**Screenshot Postman:**
```
┌─────────────────────────────────────────────────────────┐
│ POST ▼ http://localhost:8080/api/logistics/shippers... │
├─────────────────────────────────────────────────────────┤
│ Headers (1) │ Body ● │ Pre-request │ Tests │ Settings  │
├─────────────────────────────────────────────────────────┤
│ ● form-data  ○ x-www-form-urlencoded  ○ raw  ○ binary │
├──────────────────────┬──────┬───────────────────────────┤
│ KEY                  │ TYPE │ VALUE                     │
├──────────────────────┼──────┼───────────────────────────┤
│ dataInfo             │ Text │ {"email":"shipper01..."}  │
│ idCardFrontImage     │ File │ id-front.jpg              │
│ idCardBackImage      │ File │ id-back.jpg               │
│ driverLicenseImage   │ File │ license.jpg               │
└──────────────────────┴──────┴───────────────────────────┘
```

6. **Click Send**

---

## ✅ EXPECTED RESPONSE (201 Created)

```json
{
  "id": "uuid-generated",
  "fullName": "Nguyễn Văn Shipper",
  "phoneNumber": "0901234567",
  "avatar": null,
  "gender": "MALE",
  "dateOfBirth": "1995-05-15",
  "status": "ACTIVE",
  "currentLatitude": null,
  "currentLongitude": null,
  "vehicleType": "Xe máy",
  "licensePlate": "59A-12345",
  "vehicleBrand": "Honda",
  "vehicleColor": "Đỏ",
  "operationalCommune": "Phường Bến Thành",
  "operationalDistrict": "Quận 1",
  "operationalCity": "Hồ Chí Minh",
  "operationalRegionFull": "Phường Bến Thành, Quận 1, Hồ Chí Minh",
  "maxDeliveryRadius": 15.0,
  "idCardNumber": "079095001234",
  "idCardFrontImage": "https://res.cloudinary.com/.../shippers/id_cards/...",
  "idCardBackImage": "https://res.cloudinary.com/.../shippers/id_cards/...",
  "driverLicenseNumber": "B2-079095001234",
  "driverLicenseImage": "https://res.cloudinary.com/.../shippers/driver_licenses/...",
  "shippingCompanyId": "uuid-of-company",
  "shippingCompanyName": "Viettel Post",
  "userId": "uuid-of-user",
  "username": "shipper01@vtp.com",
  "address": "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, Hồ Chí Minh"
}
```

---

## 🧪 TEST CASES

### Test 1: Minimum Required Fields (No Images)

```json
{
  "email": "shipper-test1@vtp.com",
  "password": "Test@123",
  "fullName": "Test Shipper 1",
  "phoneNumber": "0909999888",
  "street": "123 Test Street",
  "commune": "Phường Test",
  "district": "Quận 1",
  "city": "Hồ Chí Minh",
  "shippingCompanyId": "YOUR_COMPANY_ID",
  "operationalCommune": "Phường Test",
  "operationalDistrict": "Quận 1",
  "operationalCity": "Hồ Chí Minh"
}
```

**Expected**: 201 Created, images = null

---

### Test 2: Full Information with All Images

Use the complete JSON above + upload all 3 images

**Expected**: 201 Created, all image URLs from Cloudinary

---

### Test 3: Email Already Exists

Use same email as Test 1

**Expected**: 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "Email đã được sử dụng: shipper-test1@vtp.com"
}
```

---

### Test 4: Invalid District (Not matching company)

```json
{
  ...
  "operationalDistrict": "Quận 2"  // Khác với district của công ty
}
```

**Expected**: 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "Khu vực hoạt động của shipper phải thuộc Quận 1..."
}
```

---

## 🔍 FIELD VALIDATION

### Required Fields:
- ✅ email (valid email format)
- ✅ password
- ✅ fullName
- ✅ phoneNumber
- ✅ street
- ✅ commune
- ✅ district
- ✅ city
- ✅ shippingCompanyId (valid UUID)
- ✅ operationalCommune
- ✅ operationalDistrict
- ✅ operationalCity

### Optional Fields:
- gender (MALE/FEMALE/OTHER)
- dateOfBirth
- idCardNumber
- driverLicenseNumber
- vehicleType
- licensePlate
- vehicleBrand
- vehicleColor
- maxDeliveryRadius
- idCardFrontImage (file)
- idCardBackImage (file)
- driverLicenseImage (file)

---

## 🚨 COMMON ERRORS & SOLUTIONS

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Token invalid/expired | Login lại để lấy token mới |
| 400 "Email đã được sử dụng" | Email trùng | Đổi email khác |
| 400 "Không tìm thấy công ty" | shippingCompanyId sai | Kiểm tra lại UUID công ty |
| 400 "Manager chỉ có thể tạo..." | Manager tạo cho công ty khác | Dùng companyId của manager |
| 400 "Khu vực hoạt động..." | District không khớp | operationalDistrict phải = company district |
| 400 "Invalid request" | JSON sai format | Kiểm tra JSON syntax trong dataInfo |
| 413 Payload Too Large | File ảnh quá lớn | Giảm kích thước ảnh < 5MB |

---

## 💡 SO SÁNH CẤU TRÚC CŨ VS MỚI

### ❌ CẤU TRÚC CŨ (FormData thuần):
```
fullName=Nguyễn Văn A&phoneNumber=0909...&idCardFrontImage=[FILE]
```
**Vấn đề**: Frontend phải encode từng field, khó maintain

### ✅ CẤU TRÚC MỚI (dataInfo JSON + dataImage):
```
dataInfo={"fullName":"Nguyễn Văn A","phoneNumber":"0909..."}&idCardFrontImage=[FILE]
```
**Ưu điểm**: 
- Frontend chỉ cần JSON.stringify() object
- Type-safe với TypeScript
- Dễ validate ở client
- Rõ ràng giữa data và file

---

## 🎓 FRONTEND EXAMPLE (JavaScript)

```javascript
// Prepare data
const shipperInfo = {
  email: "shipper@example.com",
  password: "Pass@123",
  fullName: "Nguyễn Văn A",
  phoneNumber: "0909123456",
  street: "123 Test",
  commune: "Phường Test",
  district: "Quận 1",
  city: "HCM",
  shippingCompanyId: companyId,
  operationalCommune: "Phường Test",
  operationalDistrict: "Quận 1",
  operationalCity: "HCM"
};

// Create FormData
const formData = new FormData();
formData.append('dataInfo', JSON.stringify(shipperInfo));

// Add files if selected
if (idCardFrontFile) {
  formData.append('idCardFrontImage', idCardFrontFile);
}
if (idCardBackFile) {
  formData.append('idCardBackImage', idCardBackFile);
}
if (driverLicenseFile) {
  formData.append('driverLicenseImage', driverLicenseFile);
}

// Send request
const response = await fetch('/api/logistics/shippers/register', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // NO Content-Type header - browser sets it automatically
  },
  body: formData
});

const result = await response.json();
```

---

## 📝 NOTES

1. **dataInfo phải là JSON string hợp lệ**
   - Frontend: `JSON.stringify(object)`
   - Backend: Parse thành `ShipperInfoDto`

2. **Files là optional**
   - Có thể register shipper mà không upload ảnh
   - Upload sau qua API update

3. **shippingCompanyId phải là UUID format**
   - Không phải string bình thường
   - Lấy từ API shipping companies

4. **operationalDistrict phải khớp với company headquarters district**
   - Validation logic: shipper chỉ hoạt động trong khu vực công ty

5. **Image upload to Cloudinary**
   - Folder: `shippers/id_cards/` cho CCCD
   - Folder: `shippers/driver_licenses/` cho bằng lái
   - URL trả về trong response

---

✅ **API ĐÃ SẴN SÀNG TEST!**
