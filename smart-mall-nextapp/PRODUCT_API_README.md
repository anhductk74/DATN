# Product API CRUD - Mẫu JSON cho Postman

## 🛍️ **PRODUCT APIs với Variants**

### 1. **Create Product with Images** - `POST /api/products/create`
**Content-Type:** `multipart/form-data`

**Form-data:**
```
Key: productData (Text)
Value: {
  "categoryId": "550e8400-e29b-41d4-a716-446655440001",
  "shopId": "550e8400-e29b-41d4-a716-446655440002",
  "name": "iPhone 15 Pro Max",
  "description": "Điện thoại iPhone 15 Pro Max - Titan Tự Nhiên",
  "brand": "Apple",
  "status": "ACTIVE",
  "variants": [
    {
      "sku": "IPHONE15PM-256GB-TN",
      "price": 29990000,
      "stock": 50,
      "weight": 0.221,
      "dimensions": "159.9 x 76.7 x 8.25 mm",
      "attributes": [
        {
          "attributeName": "Storage",
          "attributeValue": "256GB"
        },
        {
          "attributeName": "Color",
          "attributeValue": "Titan Tự Nhiên"
        }
      ]
    },
    {
      "sku": "IPHONE15PM-512GB-TN",
      "price": 34990000,
      "stock": 30,
      "weight": 0.221,
      "dimensions": "159.9 x 76.7 x 8.25 mm",
      "attributes": [
        {
          "attributeName": "Storage",
          "attributeValue": "512GB"
        },
        {
          "attributeName": "Color",
          "attributeValue": "Titan Tự Nhiên"
        }
      ]
    }
  ]
}

Key: images (File) [Multiple files]
Value: [Chọn nhiều file ảnh sản phẩm]
```

### 2. **Create Product Simple** - `POST /api/products/create-simple`
**Content-Type:** `application/json`

```json
{
  "categoryId": "550e8400-e29b-41d4-a716-446655440001",
  "shopId": "550e8400-e29b-41d4-a716-446655440002",
  "name": "Samsung Galaxy S24 Ultra",
  "description": "Điện thoại Samsung Galaxy S24 Ultra",
  "brand": "Samsung",
  "status": "ACTIVE",
  "variants": [
    {
      "sku": "SGS24U-256GB-BLACK",
      "price": 26990000,
      "stock": 40,
      "weight": 0.232,
      "dimensions": "162.3 x 79.0 x 8.6 mm",
      "attributes": [
        {
          "attributeName": "Storage",
          "attributeValue": "256GB"
        },
        {
          "attributeName": "Color",
          "attributeValue": "Phantom Black"
        }
      ]
    },
    {
      "sku": "SGS24U-512GB-BLACK",
      "price": 30990000,
      "stock": 25,
      "weight": 0.232,
      "dimensions": "162.3 x 79.0 x 8.6 mm",
      "attributes": [
        {
          "attributeName": "Storage",
          "attributeValue": "512GB"
        },
        {
          "attributeName": "Color",
          "attributeValue": "Phantom Black"
        }
      ]
    }
  ]
}
```

### 3. **Get Product by ID** - `GET /api/products/{id}`
**URL:** `http://localhost:8080/api/products/550e8400-e29b-41d4-a716-446655440000`

### 4. **Get All Products** - `GET /api/products/all`
**URL:** `http://localhost:8080/api/products/all`

### 5. **Get Products by Category** - `GET /api/products/category/{categoryId}`
**URL:** `http://localhost:8080/api/products/category/550e8400-e29b-41d4-a716-446655440001`

### 6. **Get Products by Shop** - `GET /api/products/shop/{shopId}`
**URL:** `http://localhost:8080/api/products/shop/550e8400-e29b-41d4-a716-446655440002`

### 7. **Get Products by Status** - `GET /api/products/status/{status}`
**URL:** `http://localhost:8080/api/products/status/ACTIVE`
**URL:** `http://localhost:8080/api/products/status/INACTIVE`

### 8. **Search Products by Name** - `GET /api/products/search?name={name}`
**URL:** `http://localhost:8080/api/products/search?name=iPhone`

### 9. **Advanced Search** - `GET /api/products/advanced-search`
**URL với parameters:**
```
http://localhost:8080/api/products/advanced-search?name=iPhone&brand=Apple&categoryId=550e8400-e29b-41d4-a716-446655440001&shopId=550e8400-e29b-41d4-a716-446655440002&status=ACTIVE
```

**Có thể sử dụng từng parameter riêng lẻ:**
- `?name=phone`
- `?brand=Samsung`
- `?categoryId=550e8400-e29b-41d4-a716-446655440001`
- `?status=ACTIVE`

### 10. **Update Product with Images** - `PUT /api/products/{id}`
**Content-Type:** `multipart/form-data`

**Form-data:**
```
Key: productData (Text)
Value: {
  "name": "iPhone 15 Pro Max Updated",
  "description": "Điện thoại iPhone cập nhật mới",
  "brand": "Apple",
  "categoryId": "550e8400-e29b-41d4-a716-446655440001",
  "status": "ACTIVE",
  "variants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "sku": "IPHONE15PM-256GB-TN-V2",
      "price": 28990000,
      "stock": 60,
      "attributes": [
        {
          "attributeName": "Storage",
          "attributeValue": "256GB"
        },
        {
          "attributeName": "Color", 
          "attributeValue": "Titan Tự Nhiên"
        }
      ]
    }
  ]
}

Key: images (File) [Multiple files] [Optional]
Value: [Chọn ảnh mới nếu muốn thay đổi]
```

### 11. **Update Product Simple** - `PUT /api/products/update-simple/{id}`
**Content-Type:** `application/json`

```json
{
  "name": "Samsung Galaxy S24 Ultra Updated",
  "description": "Điện thoại Samsung cập nhật",
  "brand": "Samsung",
  "categoryId": "550e8400-e29b-41d4-a716-446655440001",
  "status": "ACTIVE",
  "variants": [
    {
      "sku": "SGS24U-1TB-WHITE",
      "price": 35990000,
      "stock": 15,
      "weight": 0.232,
      "dimensions": "162.3 x 79.0 x 8.6 mm",
      "attributes": [
        {
          "attributeName": "Storage",
          "attributeValue": "1TB"
        },
        {
          "attributeName": "Color",
          "attributeValue": "Phantom White"
        }
      ]
    }
  ]
}
```

### 12. **Delete Product** - `DELETE /api/products/{id}`
**URL:** `http://localhost:8080/api/products/550e8400-e29b-41d4-a716-446655440000`

### 13. **Get Product Count by Shop** - `GET /api/products/count/shop/{shopId}`
**URL:** `http://localhost:8080/api/products/count/shop/550e8400-e29b-41d4-a716-446655440002`

### 14. **Get Product Count by Category** - `GET /api/products/count/category/{categoryId}`
**URL:** `http://localhost:8080/api/products/count/category/550e8400-e29b-41d4-a716-446655440001`

---

## 🔄 **Response Examples**

### ✅ **Success Response - Get Product:**
```json
{
  "status": 200,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Smartphones",
      "description": "Điện thoại thông minh"
    },
    "shop": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Tech Store",
      "description": "Cửa hàng công nghệ",
      "numberPhone": "0901234567"
    },
    "name": "iPhone 15 Pro Max",
    "description": "Điện thoại iPhone 15 Pro Max 256GB",
    "brand": "Apple",
    "images": [
      "/demo/image/upload/v1234567890/products/abc123.jpg",
      "/demo/image/upload/v1234567890/products/def456.jpg"
    ],
    "status": "ACTIVE",
    "variants": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "sku": "IPHONE15PM-256GB-TN",
        "price": 29990000,
        "stock": 50,
        "weight": 0.221,
        "dimensions": "159.9 x 76.7 x 8.25 mm",
        "attributes": [
          {
            "id": "550e8400-e29b-41d4-a716-446655440020",
            "attributeName": "Storage",
            "attributeValue": "256GB"
          },
          {
            "id": "550e8400-e29b-41d4-a716-446655440021",
            "attributeName": "Color",
            "attributeValue": "Titan Tự Nhiên"
          }
        ],
        "createdAt": "2024-01-15T10:30:00",
        "updatedAt": "2024-01-15T10:30:00"
      }
    ],
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00",
    "averageRating": 4.5,
    "reviewCount": 10
  },
  "message": "Get Product Success!"
}
```

### ✅ **Success Response - Product List:**
```json
{
  "status": 200,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "iPhone 15 Pro Max",
      "brand": "Apple",
      "status": "ACTIVE",
      "averageRating": 4.5,
      "reviewCount": 10
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Samsung Galaxy S24",
      "brand": "Samsung", 
      "status": "ACTIVE",
      "averageRating": 4.2,
      "reviewCount": 8
    }
  ],
  "message": "Get All Products Success!"
}
```

### ✅ **Success Response - Count:**
```json
{
  "status": 200,
  "data": 15,
  "message": "Get Product Count Success!"
}
```

---

## 📋 **Test Flow Recommendations:**

### **Complete Product Testing Flow:**
1. **Setup Data:**
   - Create Category first (use Category API)
   - Create Shop first (use Shop API) 
   - Note the IDs returned

2. **Create Product:**
   - Use the Category ID and Shop ID from step 1
   - Test both with images and without images

3. **Read Operations:**
   - Get product by ID
   - Get all products
   - Get products by category/shop/status
   - Test search functions

4. **Update Product:**
   - Test update with new images
   - Test simple update without images

5. **Analytics:**
   - Get product counts by shop/category

6. **Cleanup:**
   - Delete products
   - Verify deletion

### **Environment Variables for Postman:**
```
base_url = http://localhost:8080
product_id = 550e8400-e29b-41d4-a716-446655440000
category_id = 550e8400-e29b-41d4-a716-446655440001
shop_id = 550e8400-e29b-41d4-a716-446655440002
```

---

## 🎯 **Key Features:**
- ✅ **Multiple image upload** với Cloudinary
- ✅ **Advanced search** với nhiều tiêu chí
- ✅ **Category & Shop relationship**
- ✅ **Product status management** (ACTIVE/INACTIVE)
- ✅ **Analytics** (product count, ratings)
- ✅ **Flexible API** (với và không có image upload)

Copy các JSON này vào Postman để test Product API!