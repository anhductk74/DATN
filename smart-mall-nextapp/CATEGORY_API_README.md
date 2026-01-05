# Category API Documentation

## Tổng quan
API quản lý danh mục sản phẩm với cấu trúc phân cấp (parent-child), hỗ trợ đầy đủ CRUD operations, pagination, search, validation và **upload ảnh trực tiếp**.

## Các tính năng chính
- ✅ Validation đầy đủ với Jakarta Bean Validation
- ✅ Custom exceptions với error handling rõ ràng
- ✅ Logging chi tiết với SLF4J
- ✅ Transaction management
- ✅ Kiểm tra circular reference trong parent-child
- ✅ Tối ưu query với indexing
- ✅ Case-insensitive search
- ✅ **Upload ảnh trực tiếp qua multipart/form-data**
- ✅ **Tích hợp Cloudinary cho image storage**
- ✅ **Tự động xóa ảnh cũ khi update**

## Base URL
```
http://localhost:8080/api/categories
```

## 📑 Mục lục

1. [Tạo Category (JSON)](#1-tạo-category-mới-json)
2. [Tạo Category với Upload Ảnh (Multipart)](#2-tạo-category-với-upload-ảnh-multipart)
3. [Lấy Root Categories](#3-lấy-tất-cả-root-categories)
4. [Lấy Root Categories Có Phân Trang](#4-lấy-root-categories-có-phân-trang)
5. [Lấy Tất Cả Categories](#5-lấy-tất-cả-categories-flat)
6. [Lấy Categories Có Phân Trang](#6-lấy-tất-cả-categories-có-phân-trang)
7. [Lấy Category Theo ID](#7-lấy-category-theo-id)
8. [Lấy Subcategories](#8-lấy-subcategories-theo-parent-id)
9. [Lấy Subcategories Có Phân Trang](#9-lấy-subcategories-có-phân-trang)
10. [Cập Nhật Category (JSON)](#10-cập-nhật-category-json)
11. [Cập Nhật Category với Upload Ảnh (Multipart)](#11-cập-nhật-category-với-upload-ảnh-multipart)
12. [Xóa Category](#12-xóa-category)
13. [Tìm Kiếm Categories](#13-tìm-kiếm-categories)
14. [Tìm Kiếm Categories Có Phân Trang](#14-tìm-kiếm-categories-có-phân-trang)

---

## Endpoints

### 1. Tạo Category Mới (JSON)
**POST** `/api/categories`  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "image": "https://example.com/images/electronics.jpg",
  "parentId": null,
  "status": "ACTIVE"
}
```

**Validation Rules:**
- `name`: Required, 2-100 characters
- `description`: Optional, max 500 characters
- `image`: Optional, max 500 characters (URL)
- `parentId`: Optional, UUID của parent category
- `status`: Optional, ACTIVE or INACTIVE (default: ACTIVE)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "image": "https://example.com/images/electronics.jpg",
    "status": "ACTIVE",
    "parent": null,
    "subCategories": null,
    "productCount": 0,
    "createdAt": "2026-01-05T10:30:00",
    "updatedAt": "2026-01-05T10:30:00"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Duplicate category name
- `404 Not Found`: Parent category not found

---

### 2. Tạo Category với Upload Ảnh (Multipart)
**POST** `/api/categories/upload`  
**Content-Type:** `multipart/form-data`

**Description:** Tạo category mới với khả năng upload ảnh trực tiếp thay vì cung cấp URL.

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ Yes | Tên category (2-100 ký tự) |
| description | string | ❌ No | Mô tả (max 500 ký tự) |
| image | file | ❌ No | File ảnh (JPG, PNG, GIF, max 10MB) |
| parentId | UUID | ❌ No | ID của parent category |
| status | string | ❌ No | ACTIVE hoặc INACTIVE (default: ACTIVE) |

**Example với cURL:**
```bash
curl -X POST http://localhost:8080/api/categories/upload \
  -F "name=Electronics" \
  -F "description=Electronic devices and accessories" \
  -F "image=@./electronics.jpg" \
  -F "status=ACTIVE"
```

**Example với PowerShell:**
```powershell
$form = @{
    name = "Electronics"
    description = "Electronic devices and accessories"
    image = Get-Item -Path ".\electronics.jpg"
    status = "ACTIVE"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/categories/upload" `
    -Method POST -Form $form
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Category created successfully with image",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "image": "/dadr6xuhc/image/upload/v1704441600/categories/abc123.jpg",
    "status": "ACTIVE",
    "parent": null,
    "subCategories": null,
    "productCount": 0,
    "createdAt": "2026-01-05T10:30:00",
    "updatedAt": "2026-01-05T10:30:00"
  }
}
```

**Image Upload Notes:**
- ✅ Ảnh được upload lên Cloudinary tự động
- ✅ Image URL được lưu trong database
- ✅ Supported formats: JPG, JPEG, PNG, GIF, WebP
- ✅ Max file size: 10MB (configurable)
- ✅ Images stored in Cloudinary folder: `categories`

**Error Responses:**
- `400 Bad Request`: Validation errors, invalid file format
- `409 Conflict`: Duplicate category name
- `404 Not Found`: Parent category not found
- `500 Internal Server Error`: Cloudinary upload failed

---

### 3. Lấy Tất Cả Root Categories
**GET** `/api/categories/root`

**Description:** Lấy tất cả categories gốc (không có parent) kèm theo subcategories

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Root categories retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Electronics",
      "description": "Electronic devices",
      "image": "/dadr6xuhc/image/upload/v1704441600/categories/electronics.jpg",
      "status": "ACTIVE",
      "parent": null,
      "subCategories": [
        {
          "id": "234e5678-e89b-12d3-a456-426614174001",
          "name": "Smartphones",
          "description": "Mobile phones",
          "image": "/dadr6xuhc/image/upload/v1704441600/categories/phones.jpg",
          "status": "ACTIVE",
          "parent": {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "name": "Electronics"
          },
          "productCount": 150,
          "createdAt": "2026-01-05T10:30:00",
          "updatedAt": "2026-01-05T10:30:00"
        }
      ],
      "productCount": 350,
      "createdAt": "2026-01-05T10:30:00",
      "updatedAt": "2026-01-05T10:30:00"
    }
  ]
}
```

---

### 4. Lấy Root Categories Có Phân Trang
**GET** `/api/categories/root/paged?page=0&size=20`

**Query Parameters:**
- `page`: Page number (default: 0)
- `size`: Page size (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Root categories retrieved successfully",
  "data": {
    "categories": [...],
    "currentPage": 0,
    "totalPages": 5,
    "totalItems": 95,
    "pageSize": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

### 5. Lấy Tất Cả Categories (Flat)
**GET** `/api/categories/all`

**Description:** Lấy tất cả categories dưới dạng danh sách phẳng

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [...]
}
```

---

### 6. Lấy Tất Cả Categories Có Phân Trang
**GET** `/api/categories?page=0&size=20`

**Query Parameters:**
- `page`: Page number (default: 0)
- `size`: Page size (default: 20)

**Response:** Tương tự endpoint #3

---

### 7. Lấy Category Theo ID
**GET** `/api/categories/{id}`

**Path Parameters:**
- `id`: UUID của category

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Electronics",
    "description": "Electronic devices",
    "image": "/dadr6xuhc/image/upload/v1704441600/categories/electronics.jpg",
    "status": "ACTIVE",
    "parent": null,
    "subCategories": [...],
    "productCount": 350,
    "createdAt": "2026-01-05T10:30:00",
    "updatedAt": "2026-01-05T10:30:00"
  }
}
```

**Error Response:**
- `404 Not Found`: Category not found

---

### 8. Lấy Subcategories Theo Parent ID
**GET** `/api/categories/{parentId}/subcategories`

**Path Parameters:**
- `parentId`: UUID của parent category

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subcategories retrieved successfully",
  "data": [...]
}
```

---

### 9. Lấy Subcategories Có Phân Trang
**GET** `/api/categories/{parentId}/subcategories/paged?page=0&size=20`

**Path Parameters:**
- `parentId`: UUID của parent category

**Query Parameters:**
- `page`: Page number (default: 0)
- `size`: Page size (default: 20)

**Response:** Tương tự endpoint #3

---

### 10. Cập Nhật Category (JSON)
**PUT** `/api/categories/{id}`  
**Content-Type:** `application/json`

**Path Parameters:**
- `id`: UUID của category cần update

**Request Body:**
```json
{
  "name": "Electronics Updated",
  "description": "Updated description",
  "image": "https://example.com/new-image.jpg",
  "parentId": "another-uuid",
  "status": "INACTIVE"
}
```

**Note:** Tất cả fields đều optional. Chỉ cần gửi fields muốn update.

**Validation Rules:**
- `name`: 2-100 characters nếu có
- `description`: max 500 characters
- `image`: max 500 characters
- Không cho phép tạo circular reference

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {...}
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors, circular reference
- `404 Not Found`: Category not found
- `409 Conflict`: Duplicate name

---

### 11. Cập Nhật Category với Upload Ảnh (Multipart)
**PUT** `/api/categories/{id}/upload`  
**Content-Type:** `multipart/form-data`

**Description:** Cập nhật category với khả năng upload ảnh mới. Ảnh cũ sẽ tự động bị xóa khỏi Cloudinary.

**Path Parameters:**
- `id`: UUID của category cần update

**Form Fields (Tất cả Optional):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ❌ No | Tên mới (2-100 ký tự) |
| description | string | ❌ No | Mô tả mới |
| image | file | ❌ No | File ảnh mới (JPG, PNG, GIF, max 10MB) |
| parentId | UUID | ❌ No | Parent category mới |
| status | string | ❌ No | ACTIVE hoặc INACTIVE |

**Example với cURL (Update name và image):**
```bash
curl -X PUT http://localhost:8080/api/categories/{id}/upload \
  -F "name=Electronics Updated" \
  -F "image=@./new-electronics.jpg"
```

**Example với PowerShell:**
```powershell
$categoryId = "123e4567-e89b-12d3-a456-426614174000"
$form = @{
    name = "Electronics Updated"
    description = "Updated description"
    image = Get-Item -Path ".\new-image.jpg"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/categories/$categoryId/upload" `
    -Method PUT -Form $form
```

**Example chỉ update name (không đổi ảnh):**
```bash
curl -X PUT http://localhost:8080/api/categories/{id}/upload \
  -F "name=New Name Only"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category updated successfully with new image",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Electronics Updated",
    "description": "Updated description",
    "image": "/dadr6xuhc/image/upload/v1704445200/categories/new123.jpg",
    "status": "ACTIVE",
    "parent": null,
    "subCategories": [...],
    "productCount": 350,
    "createdAt": "2026-01-05T10:30:00",
    "updatedAt": "2026-01-05T11:00:00"
  }
}
```

**Image Update Notes:**
- ✅ Khi upload ảnh mới, ảnh cũ tự động bị xóa khỏi Cloudinary
- ✅ Nếu không gửi field `image`, ảnh cũ giữ nguyên
- ✅ Có thể update chỉ fields khác mà không đổi ảnh
- ✅ Validation và error handling giống endpoint tạo mới

**Error Responses:**
- `400 Bad Request`: Validation errors, circular reference
- `404 Not Found`: Category not found
- `409 Conflict`: Duplicate name
- `500 Internal Server Error`: Cloudinary upload/delete failed

---

### 12. Xóa Category
**DELETE** `/api/categories/{id}`

**Path Parameters:**
- `id`: UUID của category cần xóa

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": null
}
```

**Error Responses:**
- `400 Bad Request`: Category có subcategories hoặc products
- `404 Not Found`: Category not found

**Business Rules:**
- Không thể xóa category có subcategories
- Không thể xóa category có products
- Phải xóa subcategories và reassign products trước

---

### 13. Tìm Kiếm Categories
**GET** `/api/categories/search?name=phone`

**Query Parameters:**
- `name`: Tên category cần tìm (case-insensitive, partial match)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Categories found successfully",
  "data": [...]
}
```

---

### 14. Tìm Kiếm Categories Có Phân Trang
**GET** `/api/categories/search/paged?name=phone&page=0&size=20`

**Query Parameters:**
- `name`: Tên category cần tìm
- `page`: Page number (default: 0)
- `size`: Page size (default: 20)

**Response:** Tương tự endpoint #3

---

## Error Response Format

Tất cả errors đều follow format:

```json
{
  "status": 400,
  "errors": [
    "name: Category name is required",
    "name: Category name must be between 2 and 100 characters"
  ],
  "reasonPhrase": "Bad Request"
}
```

## Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation errors, invalid operations, invalid file format |
| 404 | Not Found - Category not found, parent category not found |
| 409 | Conflict - Duplicate category name |
| 500 | Internal Server Error - Cloudinary upload/delete failed |

## Business Logic

### Category Hierarchy
- Categories có thể có parent (tạo cấu trúc tree)
- Một category có thể có nhiều subcategories
- Không cho phép circular reference
- Root categories có `parentId = null`

### Validation Rules
1. **Name uniqueness**: Tên category phải unique trong cùng parent level
   - Root categories: tên phải unique toàn bộ
   - Subcategories: tên phải unique trong cùng parent

2. **Circular Reference**: Không cho phép category A → B → C → A

3. **Delete Protection**:
   - Không xóa được category có subcategories
   - Không xóa được category có products

4. **Image Upload**:
   - Supported formats: JPG, JPEG, PNG, GIF, WebP
   - Max file size: 10MB (configurable in application.properties)
   - Images stored in Cloudinary folder: `categories`
   - Old images automatically deleted when updating

### Performance Optimization
- Database indexing trên `name`, `status`, `parent_id`
- Transaction management cho data consistency
- Case-insensitive search với LOWER()
- Lazy loading cho relationships
- Cloudinary CDN cho image delivery
- Automatic image cleanup để tiết kiệm storage

## Image Management

### Cloudinary Configuration
```properties
# In .env file
CLOUDINARY_CLOUD_NAME=dadr6xuhc
CLOUDINARY_API_KEY=516137396383438
CLOUDINARY_API_SECRET=2wghxYEvUjydCZNn3x2KGq4nJhk
CLOUDINARY_API_URL=https://res.cloudinary.com
```

### Image URL Format
```
/dadr6xuhc/image/upload/v1704441600/categories/abc123.jpg
```

### Image Lifecycle
1. **Upload**: Client gửi file → Backend upload lên Cloudinary → URL saved to DB
2. **Update**: Client gửi file mới → Backend upload mới → Xóa file cũ → Update DB
3. **Delete**: Khi xóa category → Backend xóa file từ Cloudinary → Xóa record từ DB

## Examples

### Example 1: Tạo Category với Upload Ảnh (Recommended)

```bash
# Upload ảnh trực tiếp khi tạo category
curl -X POST http://localhost:8080/api/categories/upload \
  -F "name=Electronics" \
  -F "description=All electronic devices" \
  -F "image=@./electronics.jpg" \
  -F "status=ACTIVE"
```

### Example 2: Tạo Category Hierarchy với Ảnh

```bash
# 1. Tạo root category với ảnh
curl -X POST http://localhost:8080/api/categories/upload \
  -F "name=Electronics" \
  -F "description=All electronic devices" \
  -F "image=@./electronics.jpg"

# Response: { "data": { "id": "root-id", ... } }

# 2. Tạo subcategory với ảnh
curl -X POST http://localhost:8080/api/categories/upload \
  -F "name=Smartphones" \
  -F "description=Mobile phones" \
  -F "image=@./phones.jpg" \
  -F "parentId=root-id"
```

### Example 3: Tạo Category với JSON (Legacy)

```bash
# 1. Tạo root category
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "description": "All electronic devices"
  }'

# Response: { "data": { "id": "root-id", ... } }

# 2. Tạo subcategory
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smartphones",
    "description": "Mobile phones",
    "parentId": "root-id"
  }'
```

### Example 4: Update Category với Ảnh Mới

```bash
# Update và thay đổi ảnh
curl -X PUT http://localhost:8080/api/categories/{id}/upload \
  -F "name=Electronics Updated" \
  -F "image=@./new-image.jpg"
```

### Example 5: Update Category và Move sang Parent Khác

```bash
# JSON endpoint - move category
curl -X PUT http://localhost:8080/api/categories/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "parentId": "new-parent-id"
  }'

# Multipart endpoint - move và update ảnh
curl -X PUT http://localhost:8080/api/categories/{id}/upload \
  -F "parentId=new-parent-id" \
  -F "image=@./new-image.jpg"
```

### Example 6: Search và Filter

```bash
# Search case-insensitive
curl "http://localhost:8080/api/categories/search?name=phone"

# Get với pagination
curl "http://localhost:8080/api/categories?page=0&size=10"

# Get root categories
curl "http://localhost:8080/api/categories/root"
```

## PowerShell Examples

### Tạo Category với Upload Ảnh

```powershell
$form = @{
    name = "Electronics"
    description = "Electronic devices"
    image = Get-Item -Path ".\electronics.jpg"
    status = "ACTIVE"
}

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/categories/upload" `
    -Method POST -Form $form

Write-Host "Created category with ID: $($response.data.id)"
```

### Update Category với Ảnh Mới

```powershell
$categoryId = "123e4567-e89b-12d3-a456-426614174000"
$form = @{
    name = "Electronics Updated"
    image = Get-Item -Path ".\new-image.jpg"
}

$response = Invoke-RestMethod `
    -Uri "http://localhost:8080/api/categories/$categoryId/upload" `
    -Method PUT -Form $form

Write-Host "Updated successfully. New image: $($response.data.image)"
```

### Search Categories

```powershell
$searchTerm = "phone"
$response = Invoke-RestMethod `
    -Uri "http://localhost:8080/api/categories/search?name=$searchTerm" `
    -Method GET

Write-Host "Found $($response.data.Count) categories"
$response.data | Format-Table -Property id, name, status
```

## Database Schema

```sql
CREATE TABLE categories (
    id BINARY(16) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    image VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    parent_id BINARY(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category_name (name),
    INDEX idx_category_status (status),
    INDEX idx_category_parent (parent_id),
    
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);
```

## Migration Script

Chạy migration để thêm cột image (nếu chưa có):
```sql
ALTER TABLE categories ADD COLUMN image VARCHAR(500) AFTER description;
```

## Testing

### Automated Test Script

Chạy PowerShell script để test tất cả multipart endpoints:
```powershell
.\test-category-multipart.ps1
```

Script sẽ test:
1. ✅ Create category với upload ảnh
2. ✅ Update category với ảnh mới
3. ✅ Get category và verify image URL
4. ✅ Update chỉ name (không đổi ảnh)
5. ✅ Delete category

### Manual Testing với Postman

Import collection với các endpoint sau:

#### JSON Endpoints (Original)
1. **POST** `/api/categories` - Create with JSON
2. **GET** `/api/categories/root` - Get root categories
3. **GET** `/api/categories/{id}` - Get by ID
4. **PUT** `/api/categories/{id}` - Update with JSON
5. **DELETE** `/api/categories/{id}` - Delete
6. **GET** `/api/categories/search` - Search

#### Multipart Endpoints (New)
7. **POST** `/api/categories/upload` - Create with image upload
8. **PUT** `/api/categories/{id}/upload` - Update with image upload

### Postman Setup cho Multipart

**POST /api/categories/upload:**
1. Method: POST
2. URL: `http://localhost:8080/api/categories/upload`
3. Body → form-data:
   - `name` (text): "Electronics"
   - `description` (text): "Electronic devices"
   - `image` (file): Select file
   - `status` (text): "ACTIVE"

**PUT /api/categories/{id}/upload:**
1. Method: PUT
2. URL: `http://localhost:8080/api/categories/{{categoryId}}/upload`
3. Body → form-data:
   - `name` (text): "Updated Name"
   - `image` (file): Select new file

### Testing với cURL

```bash
# Test create với ảnh
curl -X POST http://localhost:8080/api/categories/upload \
  -F "name=Test Category" \
  -F "image=@./test-image.jpg"

# Test update với ảnh mới
curl -X PUT http://localhost:8080/api/categories/{id}/upload \
  -F "image=@./new-image.jpg"

# Test get để verify
curl http://localhost:8080/api/categories/{id}
```

## API Comparison: JSON vs Multipart

| Feature | JSON Endpoint | Multipart Endpoint |
|---------|---------------|-------------------|
| **Content-Type** | application/json | multipart/form-data |
| **Image Handling** | Provide URL string | Upload file directly |
| **Request Size** | Small (JSON only) | Larger (includes file) |
| **Use Case** | Image already hosted | Upload new image |
| **Performance** | Faster (no upload) | Slower (upload time) |
| **Complexity** | Simple JSON | Form-data encoding |
| **Recommended** | When URL available | ✅ For new images |

## Best Practices

### When to Use JSON Endpoints
- ✅ Image đã được upload trước (có URL)
- ✅ Integrating với external image services
- ✅ Bulk operations với pre-uploaded images
- ✅ Mobile apps với separate image upload flow

### When to Use Multipart Endpoints
- ✅ **Direct upload từ user** (Recommended)
- ✅ Admin panel với file picker
- ✅ Single-step category creation
- ✅ Quick prototyping và testing

### Image Optimization Tips
1. **Compress images** trước khi upload (khuyến nghị < 1MB)
2. **Use proper formats**: JPG cho photos, PNG cho logos
3. **Resize images** to reasonable dimensions (khuyến nghị 800x800px)
4. **Monitor Cloudinary usage** để tránh vượt quota

### Security Considerations
- ✅ File type validation (implemented)
- ✅ File size limits (10MB default)
- ✅ Secure Cloudinary credentials (stored in .env)
- ⚠️ Consider adding virus scanning cho production
- ⚠️ Consider rate limiting để prevent abuse

## Troubleshooting

### Issue: Upload fails với 400 Bad Request
**Solution:**
- Verify file size < 10MB
- Check file format (JPG, PNG, GIF, WebP)
- Ensure `name` field is provided và valid
- Check Postman/cURL content-type header

### Issue: 500 Internal Server Error during upload
**Solution:**
- Verify Cloudinary credentials in .env file
- Check Cloudinary dashboard quota
- Review application logs for detailed error
- Test Cloudinary connection với simple upload

### Issue: Old image không bị xóa
**Solution:**
- Check logs for delete operation errors
- Verify Cloudinary API permissions
- Ensure image URL format đúng (có public_id)
- Manual cleanup qua Cloudinary dashboard nếu cần

### Issue: Image URL không display trong frontend
**Solution:**
- Prepend Cloudinary base URL: `https://res.cloudinary.com`
- Full URL format: `https://res.cloudinary.com/dadr6xuhc/image/upload/v123/categories/abc.jpg`
- Or configure frontend to auto-prepend base URL

## Related Documentation

- [CATEGORY_API_MULTIPART.md](CATEGORY_API_MULTIPART.md) - Chi tiết về multipart endpoints
- [CATEGORY_API_MULTIPART_SUMMARY.md](CATEGORY_API_MULTIPART_SUMMARY.md) - Implementation summary
- [test-category-multipart.ps1](test-category-multipart.ps1) - Automated test script

---

**Version:** 3.0 (Added Multipart Upload Support)  
**Last Updated:** 2026-01-05  
**Maintained by:** Smart Mall Team
