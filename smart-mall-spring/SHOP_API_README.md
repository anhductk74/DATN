# Shop API với Owner Management - Mẫu JSON cho Postman

## 🏪 **SHOP APIs**

### 1. **Create Shop** - `POST /api/shop/create`
**Content-Type:** `multipart/form-data`

**Form-data:**
```
Key: shopData (Text)
Value: {
  "name": "Tech Store",
  "description": "Cửa hàng công nghệ hàng đầu",
  "phoneNumber": "0901234567",
  "ownerId": "550e8400-e29b-41d4-a716-446655440003",
  "address": {
    "street": "123 Nguyễn Văn Linh",
    "commune": "Phường 1",
    "district": "Quận 7",
    "city": "Hồ Chí Minh"
  }
}

Key: image (File)
Value: [Chọn file ảnh avatar shop]
```

### 2. **Get Shop by ID** - `GET /api/shop/{id}`
**URL:** `http://localhost:8080/api/shop/550e8400-e29b-41d4-a716-446655440000`

### 3. **Get All Shops** - `GET /api/shop/all`
**URL:** `http://localhost:8080/api/shop/all`

### 4. **Get Shops by Owner ID** - `GET /api/shop/owner/{ownerId}` ⭐ **MỚI**
**URL:** `http://localhost:8080/api/shop/owner/550e8400-e29b-41d4-a716-446655440003`

### 5. **Search Shops by Name** - `GET /api/shop/search?name={name}` ⭐ **MỚI**
**URL:** `http://localhost:8080/api/shop/search?name=tech`

### 6. **Search Shops by Owner and Name** - `GET /api/shop/owner/{ownerId}/search?name={name}` ⭐ **MỚI**
**URL:** `http://localhost:8080/api/shop/owner/550e8400-e29b-41d4-a716-446655440003/search?name=store`

### 7. **Get Shop Count by Owner** - `GET /api/shop/owner/{ownerId}/count` ⭐ **MỚI**
**URL:** `http://localhost:8080/api/shop/owner/550e8400-e29b-41d4-a716-446655440003/count`

### 8. **Update Shop** - `PUT /api/shop/{id}`
**Content-Type:** `multipart/form-data`

**Form-data:**
```
Key: shopData (Text)
Value: {
  "name": "Tech Store Updated",
  "description": "Cửa hàng công nghệ cập nhật",
  "phoneNumber": "0901234568",
  "ownerId": "550e8400-e29b-41d4-a716-446655440004",
  "address": {
    "street": "456 Lê Văn Việt",
    "commune": "Phường 2",
    "district": "Quận 9",
    "city": "Hồ Chí Minh"
  }
}

Key: image (File) [Optional]
Value: [Chọn file ảnh mới nếu muốn thay đổi]
```

### 9. **Delete Shop** - `DELETE /api/shop/{id}`
**URL:** `http://localhost:8080/api/shop/550e8400-e29b-41d4-a716-446655440000`

---

## 🔄 **Response Examples**

### ✅ **Success Response - Get Shop:**
```json
{
  "status": 200,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Store",
    "description": "Cửa hàng công nghệ hàng đầu",
    "numberPhone": "0901234567",
    "avatar": "/demo/image/upload/v1234567890/image/abc123.jpg",
    "ownerId": "550e8400-e29b-41d4-a716-446655440003",
    "ownerName": "john_doe",
    "address": {
      "street": "123 Nguyễn Văn Linh",
      "commune": "Phường 1",
      "district": "Quận 7",
      "city": "Hồ Chí Minh"
    }
  },
  "message": "Get Shop Success!"
}
```

### ✅ **Success Response - Shop List by Owner:**
```json
{
  "status": 200,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Tech Store",
      "description": "Cửa hàng công nghệ",
      "numberPhone": "0901234567",
      "avatar": "/demo/image/upload/v1234567890/image/abc123.jpg",
      "ownerId": "550e8400-e29b-41d4-a716-446655440003",
      "ownerName": "john_doe",
      "address": {
        "street": "123 Nguyễn Văn Linh",
        "commune": "Phường 1",
        "district": "Quận 7",
        "city": "Hồ Chí Minh"
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Electronics Hub",
      "description": "Trung tâm điện tử",
      "numberPhone": "0901234568",
      "ownerId": "550e8400-e29b-41d4-a716-446655440003",
      "ownerName": "john_doe",
      "address": {
        "street": "456 Trần Hưng Đạo",
        "commune": "Phường 3",
        "district": "Quận 1",
        "city": "Hồ Chí Minh"
      }
    }
  ],
  "message": "Get Shops by Owner Success!"
}
```

### ✅ **Success Response - Shop Count:**
```json
{
  "status": 200,
  "data": 3,
  "message": "Get Shop Count by Owner Success!"
}
```

---

## 📋 **Test Flow Recommendations:**

### **Complete Shop Testing Flow:**
1. **Setup Data:**
   - Create User first (để lấy User ID làm ownerId)
   - Note the User ID returned

2. **Create Shop:**
   - Sử dụng User ID từ bước 1 làm ownerId
   - Upload avatar image

3. **Owner Management:**
   - Get shops by owner ID → Kiểm tra chỉ shops của owner đó
   - Search shops by name → Test tìm kiếm chung
   - Search shops by owner and name → Test tìm kiếm trong shops của owner
   - Get shop count by owner → Kiểm tra số lượng

4. **Update Shop:**
   - Test update thông tin shop
   - Test chuyển quyền sở hữu (thay đổi ownerId)

5. **Cleanup:**
   - Delete shops
   - Verify deletion

### **Environment Variables for Postman:**
```
base_url = http://localhost:8080
shop_id = 550e8400-e29b-41d4-a716-446655440000
owner_id = 550e8400-e29b-41d4-a716-446655440003
```

---

## 🎯 **Key Features Mới:**

### 🔥 **Owner Management:**
- ✅ **Owner Assignment**: Gán shop cho user cụ thể
- ✅ **Owner Transfer**: Chuyển quyền sở hữu shop
- ✅ **Owner Filtering**: Lấy danh sách shop theo owner

### 🔍 **Advanced Search:**
- ✅ **Search by Name**: Tìm kiếm shop theo tên
- ✅ **Search by Owner**: Tìm kiếm shop của owner cụ thể
- ✅ **Combined Search**: Tìm kiếm shop theo owner và tên

### 📊 **Analytics:**
- ✅ **Shop Count**: Đếm số shop của từng owner
- ✅ **Owner Info**: Hiển thị thông tin owner trong response

### 🔐 **Business Logic:**
- **Multi-tenant**: Một user có thể sở hữu nhiều shop
- **Ownership**: Quản lý quyền sở hữu shop
- **Search & Filter**: Tìm kiếm linh hoạt theo nhiều tiêu chí

---

## 🚀 **Use Cases thực tế:**

### **Scenario 1: Marketplace Owner**
```
User "john_doe" có 3 shops:
- Tech Store (Electronics)
- Fashion Hub (Clothing) 
- Book Corner (Books)

API: GET /api/shop/owner/{john_doe_id}
→ Trả về cả 3 shops của john_doe
```

### **Scenario 2: Search within Owner's Shops**
```
john_doe muốn tìm shop có chữ "tech" trong shops của mình:
API: GET /api/shop/owner/{john_doe_id}/search?name=tech
→ Chỉ trả về "Tech Store"
```

### **Scenario 3: Transfer Ownership**
```
john_doe muốn chuyển "Tech Store" cho "jane_doe":
API: PUT /api/shop/{tech_store_id}
Body: { "ownerId": "jane_doe_id" }
→ Shop được chuyển quyền sở hữu
```

Shop API bây giờ đã hỗ trợ đầy đủ Owner Management! 🎯