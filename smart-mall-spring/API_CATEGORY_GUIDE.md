# Category API Documentation

## Tổng quan

API Category cung cấp các chức năng quản lý danh mục sản phẩm với cấu trúc phân cấp (hierarchical). Mỗi category có thể có category cha và các category con.

**Base URL:** `/api/categories`

## Cấu trúc dữ liệu

### CreateCategoryDto (Request body cho tạo category)
```json
{
  "name": "string",           // Tên category (bắt buộc)
  "description": "string",    // Mô tả category
  "parentId": "uuid"         // ID của category cha (null nếu là root category)
}
```

### UpdateCategoryDto (Request body cho cập nhật category)
```json
{
  "name": "string",           // Tên category
  "description": "string",    // Mô tả category
  "parentId": "uuid"         // ID của category cha
}
```

### CategoryResponseDto (Response data)
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "parent": {                 // Category cha (null nếu là root)
    "id": "uuid",
    "name": "string",
    "description": "string",
    "parent": null,
    "subCategories": [],
    "createdAt": "datetime",
    "updatedAt": "datetime"
  },
  "subCategories": [          // Danh sách category con
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      // ... other fields
    }
  ],
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## API Endpoints

### 1. Tạo Category mới

**POST** `/api/categories`

**Request Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "parentId": null
}
```

**Response Success:**
```json
{
  "status": 200,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "parent": null,
    "subCategories": [],
    "createdAt": "2025-10-07T10:30:00",
    "updatedAt": "2025-10-07T10:30:00"
  },
  "message": "Create Category Success!"
}
```

**Response Error:**
```json
{
  "status": 400,
  "data": null,
  "message": "Failed to create category: Category name already exists"
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "parentId": null
  }'
```

### 2. Lấy tất cả Root Categories (có cấu trúc phân cấp)

**GET** `/api/categories/root`

**Response:**
```json
{
  "status": 200,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "parent": null,
      "subCategories": [
        {
          "id": "987fcdeb-51d2-43a8-b456-426614174111",
          "name": "Smartphones",
          "description": "Mobile phones and accessories",
          "parent": {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "name": "Electronics"
          },
          "subCategories": [],
          "createdAt": "2025-10-07T10:35:00",
          "updatedAt": "2025-10-07T10:35:00"
        }
      ],
      "createdAt": "2025-10-07T10:30:00",
      "updatedAt": "2025-10-07T10:30:00"
    }
  ],
  "message": "Get Root Categories Success!"
}
```

**Curl Example:**
```bash
curl -X GET http://localhost:8080/api/categories/root
```

### 3. Lấy tất cả Categories (danh sách phẳng)

**GET** `/api/categories/all`

**Response:**
```json
{
  "status": 200,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "parent": null,
      "subCategories": [],
      "createdAt": "2025-10-07T10:30:00",
      "updatedAt": "2025-10-07T10:30:00"
    },
    {
      "id": "987fcdeb-51d2-43a8-b456-426614174111",
      "name": "Smartphones",
      "description": "Mobile phones and accessories",
      "parent": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Electronics"
      },
      "subCategories": [],
      "createdAt": "2025-10-07T10:35:00",
      "updatedAt": "2025-10-07T10:35:00"
    }
  ],
  "message": "Get All Categories Success!"
}
```

**Curl Example:**
```bash
curl -X GET http://localhost:8080/api/categories/all
```

### 4. Lấy Category theo ID

**GET** `/api/categories/{id}`

**Path Parameters:**
- `id` (UUID): ID của category cần lấy

**Response Success:**
```json
{
  "status": 200,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "parent": null,
    "subCategories": [
      {
        "id": "987fcdeb-51d2-43a8-b456-426614174111",
        "name": "Smartphones",
        "description": "Mobile phones and accessories"
      }
    ],
    "createdAt": "2025-10-07T10:30:00",
    "updatedAt": "2025-10-07T10:30:00"
  },
  "message": "Get Category Success!"
}
```

**Response Error:**
```json
{
  "status": 400,
  "data": null,
  "message": "Failed to get category: Category not found with id: 123e4567-e89b-12d3-a456-426614174000"
}
```

**Curl Example:**
```bash
curl -X GET http://localhost:8080/api/categories/123e4567-e89b-12d3-a456-426614174000
```

### 5. Lấy danh sách Category con theo Parent ID

**GET** `/api/categories/{parentId}/subcategories`

**Path Parameters:**
- `parentId` (UUID): ID của category cha

**Response:**
```json
{
  "status": 200,
  "data": [
    {
      "id": "987fcdeb-51d2-43a8-b456-426614174111",
      "name": "Smartphones",
      "description": "Mobile phones and accessories",
      "parent": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Electronics"
      },
      "subCategories": [],
      "createdAt": "2025-10-07T10:35:00",
      "updatedAt": "2025-10-07T10:35:00"
    },
    {
      "id": "456e7890-e89b-12d3-a456-426614174222",
      "name": "Laptops",
      "description": "Portable computers",
      "parent": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Electronics"
      },
      "subCategories": [],
      "createdAt": "2025-10-07T10:40:00",
      "updatedAt": "2025-10-07T10:40:00"
    }
  ],
  "message": "Get Subcategories Success!"
}
```

**Curl Example:**
```bash
curl -X GET http://localhost:8080/api/categories/123e4567-e89b-12d3-a456-426614174000/subcategories
```

### 6. Cập nhật Category

**PUT** `/api/categories/{id}`

**Path Parameters:**
- `id` (UUID): ID của category cần cập nhật

**Request Body:**
```json
{
  "name": "Consumer Electronics",
  "description": "Consumer electronic devices and accessories",
  "parentId": null
}
```

**Response Success:**
```json
{
  "status": 200,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Consumer Electronics",
    "description": "Consumer electronic devices and accessories",
    "parent": null,
    "subCategories": [
      {
        "id": "987fcdeb-51d2-43a8-b456-426614174111",
        "name": "Smartphones"
      }
    ],
    "createdAt": "2025-10-07T10:30:00",
    "updatedAt": "2025-10-07T11:00:00"
  },
  "message": "Update Category Success!"
}
```

**Response Error:**
```json
{
  "status": 400,
  "data": null,
  "message": "Failed to update category: Category not found"
}
```

**Curl Example:**
```bash
curl -X PUT http://localhost:8080/api/categories/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Consumer Electronics",
    "description": "Consumer electronic devices and accessories",
    "parentId": null
  }'
```

### 7. Xóa Category

**DELETE** `/api/categories/{id}`

**Path Parameters:**
- `id` (UUID): ID của category cần xóa

**Response Success:**
```json
{
  "status": 200,
  "data": "Category deleted successfully",
  "message": "Delete Category Success!"
}
```

**Response Error:**
```json
{
  "status": 400,
  "data": null,
  "message": "Failed to delete category: Cannot delete category with subcategories"
}
```

**Curl Example:**
```bash
curl -X DELETE http://localhost:8080/api/categories/123e4567-e89b-12d3-a456-426614174000
```

### 8. Tìm kiếm Category theo tên

**GET** `/api/categories/search?name={searchTerm}`

**Query Parameters:**
- `name` (string): Từ khóa tìm kiếm

**Response:**
```json
{
  "status": 200,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "parent": null,
      "subCategories": [],
      "createdAt": "2025-10-07T10:30:00",
      "updatedAt": "2025-10-07T10:30:00"
    }
  ],
  "message": "Search Categories Success!"
}
```

**Curl Example:**
```bash
curl -X GET "http://localhost:8080/api/categories/search?name=Electronics"
```

## Lưu ý quan trọng

### 1. Cấu trúc phân cấp
- Category có thể có category cha (parentId)
- Category không có parentId được coi là root category
- Một category có thể có nhiều category con

### 2. Quy tắc xóa
- Không thể xóa category có category con
- Cần xóa tất cả category con trước khi xóa category cha

### 3. UUID Format
- Tất cả ID đều sử dụng định dạng UUID
- Ví dụ: `123e4567-e89b-12d3-a456-426614174000`

### 4. Error Handling
- Tất cả lỗi đều trả về status 400
- Message chứa thông tin chi tiết về lỗi
- Data sẽ là null khi có lỗi

### 5. Response Format
- Tất cả response đều có cấu trúc: `{status, data, message}`
- Status 200: Thành công
- Status 400: Lỗi

## Ví dụ tạo cấu trúc phân cấp

### Bước 1: Tạo root category
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices",
    "parentId": null
  }'
```

### Bước 2: Tạo subcategory
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smartphones",
    "description": "Mobile phones",
    "parentId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

### Bước 3: Tạo sub-subcategory
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone",
    "description": "Apple smartphones",
    "parentId": "987fcdeb-51d2-43a8-b456-426614174111"
  }'
```

Kết quả sẽ có cấu trúc:
```
Electronics
└── Smartphones
    └── iPhone
```