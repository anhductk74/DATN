# Product API Documentation

## Tổng quan

API Product cung cấp các chức năng quản lý sản phẩm với nhiều biến thể (variants) và hình ảnh. Hỗ trợ tính năng update linh động cho phép cập nhật chỉ dữ liệu, chỉ hình ảnh, hoặc cả hai.

**Base URL:** `/api/products`

## Cấu trúc dữ liệu

### CreateProductDto (Request body cho tạo product)
```json
{
  "categoryId": "uuid",
  "shopId": "uuid", 
  "name": "string",
  "description": "string",
  "brand": "string",
  "status": "ACTIVE|INACTIVE|OUT_OF_STOCK",
  "variants": [
    {
      "sku": "string",
      "price": 0.0,
      "stock": 0,
      "weight": 0.0,
      "dimensions": "string",
      "attributes": [
        {
          "attributeName": "string",
          "attributeValue": "string"
        }
      ]
    }
  ]
}
```

### UpdateProductDto (Request body cho cập nhật product)
```json
{
  "categoryId": "uuid",
  "name": "string",
  "description": "string", 
  "brand": "string",
  "status": "ACTIVE|INACTIVE|OUT_OF_STOCK",
  "variants": [
    {
      "id": "uuid",  // Có ID = update, không có ID = tạo mới
      "sku": "string",
      "price": 0.0,
      "stock": 0,
      "weight": 0.0,
      "dimensions": "string",
      "attributes": [
        {
          "attributeName": "string",
          "attributeValue": "string"
        }
      ]
    }
  ]
}
```

### ProductResponseDto (Response data)
```json
{
  "id": "uuid",
  "category": {
    "id": "uuid",
    "name": "string",
    "description": "string"
  },
  "shop": {
    "id": "uuid", 
    "name": "string",
    "description": "string",
    "numberPhone": "string",
    "avatar": "string"
  },
  "name": "string",
  "description": "string",
  "brand": "string",
  "images": ["url1", "url2"],
  "status": "ACTIVE|INACTIVE|OUT_OF_STOCK",
  "variants": [
    {
      "id": "uuid",
      "sku": "string", 
      "price": 0.0,
      "stock": 0,
      "weight": 0.0,
      "dimensions": "string",
      "attributes": [
        {
          "id": "uuid",
          "attributeName": "string",
          "attributeValue": "string"
        }
      ],
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "averageRating": 4.5,
  "reviewCount": 10
}
```

## API Endpoints

### 1. Tạo Product với hình ảnh

**POST** `/api/products/create`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `productData` (string): JSON string của CreateProductDto
- `images` (file[]): Danh sách file hình ảnh (optional)

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/products/create \
  -F 'productData={"name":"iPhone 15","description":"Latest iPhone","brand":"Apple","categoryId":"123e4567-e89b-12d3-a456-426614174000","shopId":"987fcdeb-51d2-43a8-b456-426614174111","status":"ACTIVE","variants":[{"sku":"IPHONE15-128GB","price":999.99,"stock":50,"weight":0.174,"dimensions":"147.6×71.6×7.8mm","attributes":[{"attributeName":"Storage","attributeValue":"128GB"},{"attributeName":"Color","attributeValue":"Black"}]}]}' \
  -F 'images=@image1.jpg' \
  -F 'images=@image2.jpg'
```

**Response Success:**
```json
{
  "status": 200,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "iPhone 15",
    "description": "Latest iPhone",
    "brand": "Apple",
    "images": ["https://cloudinary.com/image1.jpg", "https://cloudinary.com/image2.jpg"],
    "status": "ACTIVE",
    "variants": [
      {
        "id": "variant-uuid",
        "sku": "IPHONE15-128GB",
        "price": 999.99,
        "stock": 50,
        "attributes": [
          {"attributeName": "Storage", "attributeValue": "128GB"},
          {"attributeName": "Color", "attributeValue": "Black"}
        ]
      }
    ],
    "createdAt": "2025-10-07T10:30:00",
    "updatedAt": "2025-10-07T10:30:00"
  },
  "message": "Create Product Success!"
}
```

### 2. Tạo Product đơn giản (không có hình ảnh)

**POST** `/api/products/create-simple`

**Request Body:**
```json
{
  "name": "Samsung Galaxy S24",
  "description": "Latest Samsung phone",
  "brand": "Samsung",
  "categoryId": "123e4567-e89b-12d3-a456-426614174000",
  "shopId": "987fcdeb-51d2-43a8-b456-426614174111",
  "status": "ACTIVE",
  "variants": [
    {
      "sku": "GALAXY-S24-256GB",
      "price": 899.99,
      "stock": 30,
      "attributes": [
        {"attributeName": "Storage", "attributeValue": "256GB"},
        {"attributeName": "Color", "attributeValue": "White"}
      ]
    }
  ]
}
```

### 3. Lấy Product theo ID

**GET** `/api/products/{id}`

**Response:**
```json
{
  "status": 200,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "iPhone 15",
    "description": "Latest iPhone",
    "brand": "Apple",
    "images": ["https://cloudinary.com/image1.jpg"],
    "status": "ACTIVE",
    "category": {
      "id": "cat-uuid",
      "name": "Smartphones"
    },
    "shop": {
      "id": "shop-uuid",
      "name": "Apple Store"
    },
    "variants": [...],
    "averageRating": 4.5,
    "reviewCount": 10
  },
  "message": "Get Product Success!"
}
```

### 4. Lấy tất cả Products

**GET** `/api/products/all`

### 5. Lấy Products theo Category

**GET** `/api/products/category/{categoryId}`

### 6. Lấy Products theo Shop

**GET** `/api/products/shop/{shopId}`

### 7. Lấy Products theo Status

**GET** `/api/products/status/{status}`

**Possible status values:** `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`

### 8. Tìm kiếm Products theo tên

**GET** `/api/products/search?name={searchTerm}`

### 9. Tìm kiếm nâng cao

**GET** `/api/products/advanced-search`

**Query Parameters:**
- `name` (optional): Tên sản phẩm
- `brand` (optional): Thương hiệu
- `categoryId` (optional): ID danh mục
- `shopId` (optional): ID cửa hàng  
- `status` (optional): Trạng thái

**Example:**
```bash
curl "http://localhost:8080/api/products/advanced-search?name=iPhone&brand=Apple&status=ACTIVE"
```

## Update Product APIs (Linh động)

### 10. Update Product (Linh động - có thể update data, images, hoặc cả hai)

**PUT** `/api/products/{id}`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `productData` (string, optional): JSON string của UpdateProductDto
- `images` (file[], optional): Danh sách file hình ảnh mới

**Lưu ý:** Ít nhất một trong hai tham số `productData` hoặc `images` phải được cung cấp.

#### Case 1: Update chỉ dữ liệu product
```bash
curl -X PUT http://localhost:8080/api/products/123e4567-e89b-12d3-a456-426614174000 \
  -F 'productData={"name":"iPhone 15 Pro","description":"Updated description","brand":"Apple","status":"ACTIVE"}'
```

#### Case 2: Update chỉ hình ảnh
```bash
curl -X PUT http://localhost:8080/api/products/123e4567-e89b-12d3-a456-426614174000 \
  -F 'images=@new_image1.jpg' \
  -F 'images=@new_image2.jpg'
```

#### Case 3: Update cả dữ liệu và hình ảnh
```bash
curl -X PUT http://localhost:8080/api/products/123e4567-e89b-12d3-a456-426614174000 \
  -F 'productData={"name":"iPhone 15 Pro Max","description":"Latest and greatest","status":"ACTIVE"}' \
  -F 'images=@image1.jpg' \
  -F 'images=@image2.jpg'
```

### 11. Update Product đơn giản (chỉ dữ liệu JSON)

**PUT** `/api/products/simple/{id}`

**Request Body:**
```json
{
  "name": "iPhone 15 Pro",
  "description": "Updated description",
  "brand": "Apple",
  "status": "ACTIVE",
  "categoryId": "new-category-uuid"
}
```

### 12. Update chỉ hình ảnh Product

**PUT** `/api/products/{id}/images`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `images` (file[], required): Danh sách file hình ảnh mới

```bash
curl -X PUT http://localhost:8080/api/products/123e4567-e89b-12d3-a456-426614174000/images \
  -F 'images=@new_image1.jpg' \
  -F 'images=@new_image2.jpg'
```

### 13. Xóa Product

**DELETE** `/api/products/{id}`

**Response:**
```json
{
  "status": 200,
  "data": "Product deleted successfully",
  "message": "Delete Product Success!"
}
```

### 14. Lấy số lượng Products theo Shop

**GET** `/api/products/count/shop/{shopId}`

### 15. Lấy số lượng Products theo Category

**GET** `/api/products/count/category/{categoryId}`

## Lưu ý quan trọng

### 1. Upload hình ảnh
- Hình ảnh được upload lên Cloudinary
- Hỗ trợ multiple files
- Khi update, hình ảnh cũ sẽ được thay thế hoàn toàn

### 2. Product Variants
- Mỗi product phải có ít nhất 1 variant
- SKU phải unique trong toàn hệ thống
- Khi update variants:
  - Có `id`: Update variant hiện có
  - Không có `id`: Tạo variant mới

### 3. Status Values
- `ACTIVE`: Sản phẩm đang hoạt động
- `INACTIVE`: Sản phẩm không hoạt động  
- `OUT_OF_STOCK`: Hết hàng

### 4. Update linh động
- **PUT** `/api/products/{id}`: Có thể update data, images, hoặc cả hai
- **PUT** `/api/products/simple/{id}`: Chỉ update data (JSON body)
- **PUT** `/api/products/{id}/images`: Chỉ update images

### 5. Validation
- Product name, variants là bắt buộc khi tạo
- SKU phải unique
- CategoryId và ShopId phải tồn tại
- Khi update bằng multipart form, ít nhất productData hoặc images phải có

### 6. Error Handling
- Status 400: Lỗi validation hoặc business logic
- Status 200: Thành công
- Message chứa thông tin chi tiết về lỗi

## Ví dụ sử dụng Update linh động

### Scenario 1: Chỉ muốn thay đổi tên và mô tả
```bash
curl -X PUT http://localhost:8080/api/products/123e4567-e89b-12d3-a456-426614174000 \
  -F 'productData={"name":"New Product Name","description":"New description"}'
```

### Scenario 2: Chỉ muốn thay đổi hình ảnh
```bash
curl -X PUT http://localhost:8080/api/products/123e4567-e89b-12d3-a456-426614174000 \
  -F 'images=@new_photo1.jpg' \
  -F 'images=@new_photo2.jpg'
```

### Scenario 3: Thay đổi tất cả thông tin
```bash
curl -X PUT http://localhost:8080/api/products/123e4567-e89b-12d3-a456-426614174000 \
  -F 'productData={"name":"Complete Update","description":"All new info","status":"ACTIVE"}' \
  -F 'images=@photo1.jpg' \
  -F 'images=@photo2.jpg'
```

### Scenario 4: Update với JSON đơn giản (không cần images)
```bash
curl -X PUT http://localhost:8080/api/products/simple/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{"name":"Simple Update","status":"INACTIVE"}'
```

## Xử lý Variants khi Update

### Cách thức hoạt động của Update Variants:

1. **Update variant hiện có**: Cung cấp `id` của variant
2. **Tạo variant mới**: Không cung cấp `id` (hoặc `id: null`)
3. **Xóa variant**: Không đưa variant đó vào danh sách update

### Ví dụ Update từ 2 variants xuống 1 variant:

**Giả sử product hiện tại có 2 variants:**
```json
{
  "variants": [
    {
      "id": "variant-1-uuid",
      "sku": "IPHONE15-128GB-BLACK",
      "price": 999.99,
      "stock": 50,
      "attributes": [
        {"attributeName": "Storage", "attributeValue": "128GB"},
        {"attributeName": "Color", "attributeValue": "Black"}
      ]
    },
    {
      "id": "variant-2-uuid", 
      "sku": "IPHONE15-128GB-WHITE",
      "price": 999.99,
      "stock": 30,
      "attributes": [
        {"attributeName": "Storage", "attributeValue": "128GB"},
        {"attributeName": "Color", "attributeValue": "White"}
      ]
    }
  ]
}
```

**Để giữ lại chỉ variant đen (xóa variant trắng):**

#### Method 1: Sử dụng multipart form
```bash
curl -X PUT http://localhost:8080/api/products/123e4567-e89b-12d3-a456-426614174000 \
  -F 'productData={
    "variants": [
      {
        "id": "variant-1-uuid",
        "sku": "IPHONE15-128GB-BLACK",
        "price": 899.99,
        "stock": 60,
        "attributes": [
          {"attributeName": "Storage", "attributeValue": "128GB"},
          {"attributeName": "Color", "attributeValue": "Black"}
        ]
      }
    ]
  }'
```

#### Method 2: Sử dụng JSON endpoint
```bash
curl -X PUT http://localhost:8080/api/products/simple/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "variants": [
      {
        "id": "variant-1-uuid",
        "sku": "IPHONE15-128GB-BLACK", 
        "price": 899.99,
        "stock": 60,
        "attributes": [
          {"attributeName": "Storage", "attributeValue": "128GB"},
          {"attributeName": "Color", "attributeValue": "Black"}
        ]
      }
    ]
  }'
```

**Kết quả:** Variant trắng (`variant-2-uuid`) sẽ bị xóa hoàn toàn khỏi database, chỉ còn lại variant đen được cập nhật.

### Các trường hợp khác:

#### Thay thế hoàn toàn tất cả variants:
```json
{
  "variants": [
    {
      "sku": "IPHONE15-256GB-BLUE",
      "price": 1099.99,
      "stock": 25,
      "attributes": [
        {"attributeName": "Storage", "attributeValue": "256GB"},
        {"attributeName": "Color", "attributeValue": "Blue"}
      ]
    }
  ]
}
```
**Kết quả:** Tất cả variants cũ bị xóa, tạo variant mới với thông tin trên.

#### Thêm variant mới (từ 1 lên 2):
```json
{
  "variants": [
    {
      "id": "variant-1-uuid",
      "sku": "IPHONE15-128GB-BLACK",
      "price": 899.99,
      "stock": 60
    },
    {
      "sku": "IPHONE15-256GB-BLACK",
      "price": 1099.99,
      "stock": 40,
      "attributes": [
        {"attributeName": "Storage", "attributeValue": "256GB"},
        {"attributeName": "Color", "attributeValue": "Black"}
      ]
    }
  ]
}
```
**Kết quả:** Variant cũ được update, variant mới được tạo.

### Quy tắc quan trọng:

1. **Product phải có ít nhất 1 variant** - Không thể xóa hết variants
2. **SKU phải unique** - Không được trùng với variants khác trong hệ thống
3. **Xóa cascade** - Khi xóa variant, tất cả attributes của variant đó cũng bị xóa
4. **ID để phân biệt** - Có ID = update, không có ID = tạo mới, không có trong list = xóa

### Error cases:

#### Lỗi khi cố gắng xóa hết variants:
```bash
# Request này sẽ bị lỗi
curl -X PUT http://localhost:8080/api/products/simple/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{"variants": []}'
```

**Response:**
```json
{
  "status": 400,
  "data": null,
  "message": "Failed to update product: Product must have at least one variant"
}
```

#### Lỗi SKU trùng:
```json
{
  "status": 400,
  "data": null,
  "message": "Failed to update product: SKU already exists: EXISTING-SKU"
}
```