# Product & Category API Documentation

## Base URLs
```
Products: http://localhost:8080/api/products
Categories: http://localhost:8080/api/categories
```

---

## 📋 Table of Contents

### Product API
1. [Create Product](#create-product)
2. [Get Product](#get-product)
3. [Get All Products](#get-all-products)
4. [Search & Filter Products](#search--filter)
5. [Update Product](#update-product)
6. [Delete Product](#delete-product)
7. [Product Statistics](#product-statistics)

### Category API
8. [Create Category](#create-category)
9. [Get Category](#get-category)
10. [Update Category](#update-category)
11. [Delete Category](#delete-category)
12. [Search Categories](#search-categories)

---

## Create Product

### 1. Create Product with Images
**Endpoint:** `POST /api/products/create`  
**Content-Type:** `multipart/form-data`

**Request:**
```javascript
// Form Data
productData: {
  "name": "iPhone 15 Pro Max",
  "description": "Flagship smartphone from Apple with A17 Pro chip",
  "brand": "Apple",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "shopId": "550e8400-e29b-41d4-a716-446655440001",
  "status": "ACTIVE",
  "variants": [
    {
      "sku": "IPHONE15PM-256-BLACK",
      "price": 29990000,
      "stock": 50,
      "weight": 221,
      "dimensions": "159.9 x 76.7 x 8.25 mm",
      "attributes": [
        {
          "attributeName": "Color",
          "attributeValue": "Natural Titanium"
        },
        {
          "attributeName": "Storage",
          "attributeValue": "256GB"
        }
      ]
    }
  ]
}
images: [file1.jpg, file2.jpg, file3.jpg] // Max 5 images
```

**Response:**
```json
{
  "success": true,
  "message": "Create Product Success!",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "iPhone 15 Pro Max",
    "description": "Flagship smartphone from Apple with A17 Pro chip",
    "brand": "Apple",
    "images": [
      "https://res.cloudinary.com/xxx/products/img1.jpg",
      "https://res.cloudinary.com/xxx/products/img2.jpg"
    ],
    "status": "ACTIVE",
    "isDeleted": false,
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Smartphones",
      "description": "Mobile phones and accessories"
    },
    "shop": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Apple Store Vietnam",
      "description": "Official Apple products",
      "numberPhone": "0901234567",
      "avatar": "https://res.cloudinary.com/xxx/avatar.jpg"
    },
    "variants": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "sku": "IPHONE15PM-256-BLACK",
        "price": 29990000,
        "stock": 50,
        "weight": 221,
        "dimensions": "159.9 x 76.7 x 8.25 mm",
        "productName": "iPhone 15 Pro Max",
        "productBrand": "Apple",
        "attributes": [
          {
            "id": "880e8400-e29b-41d4-a716-446655440000",
            "attributeName": "Color",
            "attributeValue": "Natural Titanium"
          },
          {
            "id": "880e8400-e29b-41d4-a716-446655440001",
            "attributeName": "Storage",
            "attributeValue": "256GB"
          }
        ],
        "createdAt": "2025-11-11T10:30:00",
        "updatedAt": "2025-11-11T10:30:00"
      }
    ],
    "averageRating": null,
    "reviewCount": 0,
    "createdAt": "2025-11-11T10:30:00",
    "updatedAt": "2025-11-11T10:30:00"
  }
}
```

---

### 2. Create Product without Images
**Endpoint:** `POST /api/products/create-simple`  
**Content-Type:** `application/json`

**Request:**
```json
{
  "name": "Samsung Galaxy S24 Ultra",
  "description": "Premium Android smartphone with S Pen",
  "brand": "Samsung",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "shopId": "550e8400-e29b-41d4-a716-446655440002",
  "status": "ACTIVE",
  "variants": [
    {
      "sku": "GALAXY-S24U-512-GRAY",
      "price": 27990000,
      "stock": 30,
      "weight": 232,
      "dimensions": "162.3 x 79.0 x 8.6 mm",
      "attributes": [
        {
          "attributeName": "Color",
          "attributeValue": "Titanium Gray"
        },
        {
          "attributeName": "Storage",
          "attributeValue": "512GB"
        }
      ]
    }
  ]
}
```

**Response:** (Same structure as above)

---

## Get Product

### 3. Get Product by ID
**Endpoint:** `GET /api/products/{id}`

**Request:**
```
GET /api/products/660e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "message": "Get Product Success!",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "iPhone 15 Pro Max",
    "description": "Flagship smartphone from Apple with A17 Pro chip",
    "brand": "Apple",
    "images": ["url1", "url2"],
    "status": "ACTIVE",
    "category": {...},
    "shop": {...},
    "variants": [...],
    "averageRating": 4.5,
    "reviewCount": 123,
    "createdAt": "2025-11-11T10:30:00",
    "updatedAt": "2025-11-11T10:30:00"
  }
}
```

**Note:** This endpoint automatically increments shop view count.

---

### 4. Get Product by ID (Including Deleted)
**Endpoint:** `GET /api/products/{id}/including-deleted`

**Request:**
```
GET /api/products/660e8400-e29b-41d4-a716-446655440000/including-deleted
```

**Response:** (Same as Get Product by ID)

---

## Get All Products

### 5. Get All Products (No Pagination)
**Endpoint:** `GET /api/products/all`

**Request:**
```
GET /api/products/all
```

**Response:**
```json
{
  "success": true,
  "message": "Get All Products Success!",
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "iPhone 15 Pro Max",
      ...
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Samsung Galaxy S24 Ultra",
      ...
    }
  ]
}
```

---

### 6. Get All Products with Pagination ⭐ (Recommended)
**Endpoint:** `GET /api/products`

**Query Parameters:**
- `page` (optional, default: 0) - Page number (0-indexed)
- `size` (optional, default: 20) - Items per page

**Request:**
```
GET /api/products?page=0&size=20
GET /api/products?page=1&size=20
GET /api/products  // Uses defaults: page=0, size=20
```

**Response:**
```json
{
  "success": true,
  "message": "Get Products Success!",
  "data": {
    "products": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "name": "iPhone 15 Pro Max",
        "description": "...",
        "brand": "Apple",
        "status": "ACTIVE",
        ...
      },
      // ... 19 more products (total 20)
    ],
    "currentPage": 0,
    "totalPages": 5,
    "totalItems": 95,
    "pageSize": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Note:** Only shows ACTIVE products (not deleted).

---

### 7. Get All Products Including Deleted
**Endpoint:** `GET /api/products/all/including-deleted`

**Request:**
```
GET /api/products/all/including-deleted
```

**Response:**
```json
{
  "success": true,
  "message": "Get All Products Including Deleted Success!",
  "data": [...]
}
```

---

### 8. Get All Deleted Products
**Endpoint:** `GET /api/products/deleted`

**Request:**
```
GET /api/products/deleted
```

**Response:**
```json
{
  "success": true,
  "message": "Get All Deleted Products Success!",
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440099",
      "name": "Old Product",
      "isDeleted": true,
      ...
    }
  ]
}
```

---

## Search & Filter

### 9. Get Products by Category
**Endpoint:** `GET /api/products/category/{categoryId}`

**Request:**
```
GET /api/products/category/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "message": "Get Products by Category Success!",
  "data": [...]
}
```

---

### 10. Get Products by Category with Pagination ⭐
**Endpoint:** `GET /api/products/category/{categoryId}/paged`

**Query Parameters:**
- `page` (optional, default: 0)
- `size` (optional, default: 20)

**Request:**
```
GET /api/products/category/550e8400-e29b-41d4-a716-446655440000/paged?page=0&size=20
```

**Response:**
```json
{
  "success": true,
  "message": "Get Products by Category Success!",
  "data": {
    "products": [...],
    "currentPage": 0,
    "totalPages": 3,
    "totalItems": 45,
    "pageSize": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Note:** Only shows ACTIVE products in the category.

---

### 11. Get Products by Shop
**Endpoint:** `GET /api/products/shop/{shopId}`

**Request:**
```
GET /api/products/shop/550e8400-e29b-41d4-a716-446655440001
```

**Response:**
```json
{
  "success": true,
  "message": "Get Products by Shop Success!",
  "data": [...]
}
```

---

### 12. Get Products by Shop with Pagination ⭐
**Endpoint:** `GET /api/products/shop/{shopId}/paged`

**Query Parameters:**
- `page` (optional, default: 0)
- `size` (optional, default: 20)

**Request:**
```
GET /api/products/shop/550e8400-e29b-41d4-a716-446655440001/paged?page=0&size=20
```

**Response:**
```json
{
  "success": true,
  "message": "Get Products by Shop Success!",
  "data": {
    "products": [...],
    "currentPage": 0,
    "totalPages": 2,
    "totalItems": 35,
    "pageSize": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Note:** Only shows ACTIVE products from the shop.

---

### 13. Get Products by Status
**Endpoint:** `GET /api/products/status/{status}`

**Status Values:** `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`

**Request:**
```
GET /api/products/status/ACTIVE
GET /api/products/status/INACTIVE
```

**Response:**
```json
{
  "success": true,
  "message": "Get Products by Status Success!",
  "data": [...]
}
```

---

### 14. Get Products by Status with Pagination ⭐
**Endpoint:** `GET /api/products/status/{status}/paged`

**Query Parameters:**
- `page` (optional, default: 0)
- `size` (optional, default: 20)

**Request:**
```
GET /api/products/status/ACTIVE/paged?page=0&size=20
```

**Response:**
```json
{
  "success": true,
  "message": "Get Products by Status Success!",
  "data": {
    "products": [...],
    "currentPage": 0,
    "totalPages": 4,
    "totalItems": 78,
    "pageSize": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

### 15. Search Products by Name
**Endpoint:** `GET /api/products/search`

**Query Parameters:**
- `name` (required) - Search keyword

**Request:**
```
GET /api/products/search?name=iPhone
GET /api/products/search?name=Samsung
```

**Response:**
```json
{
  "success": true,
  "message": "Search Products Success!",
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "iPhone 15 Pro Max",
      ...
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440005",
      "name": "iPhone 14",
      ...
    }
  ]
}
```

---

### 16. Search Products by Name with Pagination ⭐
**Endpoint:** `GET /api/products/search/paged`

**Query Parameters:**
- `name` (required) - Search keyword
- `page` (optional, default: 0)
- `size` (optional, default: 20)

**Request:**
```
GET /api/products/search/paged?name=iPhone&page=0&size=20
```

**Response:**
```json
{
  "success": true,
  "message": "Search Products Success!",
  "data": {
    "products": [...],
    "currentPage": 0,
    "totalPages": 2,
    "totalItems": 25,
    "pageSize": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Note:** Only shows ACTIVE products matching the search term.

---

### 17. Advanced Search
**Endpoint:** `GET /api/products/advanced-search`

**Query Parameters (All Optional):**
- `name` - Product name (partial match)
- `brand` - Brand name (exact match)
- `categoryId` - Category UUID
- `shopId` - Shop UUID
- `status` - Product status (ACTIVE, INACTIVE, OUT_OF_STOCK)

**Request:**
```
GET /api/products/advanced-search?name=Phone&brand=Apple
GET /api/products/advanced-search?categoryId=550e8400-e29b-41d4-a716-446655440000&status=ACTIVE
GET /api/products/advanced-search?shopId=550e8400-e29b-41d4-a716-446655440001&name=Samsung
```

**Response:**
```json
{
  "success": true,
  "message": "Advanced Search Success!",
  "data": [...]
}
```

---

### 18. Advanced Search with Pagination ⭐
**Endpoint:** `GET /api/products/advanced-search/paged`

**Query Parameters:**
- `name` (optional) - Product name
- `brand` (optional) - Brand name
- `categoryId` (optional) - Category UUID
- `shopId` (optional) - Shop UUID
- `status` (optional) - Product status
- `page` (optional, default: 0)
- `size` (optional, default: 20)

**Request:**
```
GET /api/products/advanced-search/paged?name=Phone&brand=Apple&page=0&size=20
GET /api/products/advanced-search/paged?categoryId=550e8400-e29b-41d4-a716-446655440000&page=1&size=20
```

**Response:**
```json
{
  "success": true,
  "message": "Advanced Search Success!",
  "data": {
    "products": [...],
    "currentPage": 0,
    "totalPages": 3,
    "totalItems": 52,
    "pageSize": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Note:** 
- If `status` is NOT specified, only ACTIVE products are returned
- If `status` IS specified, products with that status are returned

---

## Update Product

### 19. Update Product (Flexible)
**Endpoint:** `PUT /api/products/{id}`  
**Content-Type:** `multipart/form-data`

**Request:**
```javascript
// Option 1: Update data only
productData: {
  "name": "iPhone 15 Pro Max - Updated",
  "price": 28990000,
  "status": "ACTIVE"
}

// Option 2: Update images only
images: [newImage1.jpg, newImage2.jpg]

// Option 3: Update both
productData: {...}
images: [...]
```

**Response:**
```json
{
  "success": true,
  "message": "Update Product Success!",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "iPhone 15 Pro Max - Updated",
    ...
  }
}
```

---

### 20. Update Product Simple (JSON)
**Endpoint:** `PUT /api/products/simple/{id}`  
**Content-Type:** `application/json`

**Request:**
```json
{
  "name": "iPhone 15 Pro Max - Special Edition",
  "description": "Updated description",
  "brand": "Apple",
  "status": "ACTIVE",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "variants": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "sku": "IPHONE15PM-256-BLACK",
      "price": 27990000,
      "stock": 45
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Update Product Success!",
  "data": {...}
}
```

---

### 21. Update Product Images Only
**Endpoint:** `PUT /api/products/{id}/images`  
**Content-Type:** `multipart/form-data`

**Request:**
```javascript
images: [image1.jpg, image2.jpg, image3.jpg]
```

**Response:**
```json
{
  "success": true,
  "message": "Update Product Images Success!",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "images": [
      "https://res.cloudinary.com/xxx/products/new-img1.jpg",
      "https://res.cloudinary.com/xxx/products/new-img2.jpg"
    ],
    ...
  }
}
```

---

## Delete Product

### 22. Soft Delete Product
**Endpoint:** `DELETE /api/products/{id}/soft`

**Request:**
```
DELETE /api/products/660e8400-e29b-41d4-a716-446655440000/soft
```

**Response:**
```json
{
  "success": true,
  "message": "Soft Delete Product Success!",
  "data": "Product has been soft deleted"
}
```

**Note:** Product is marked as deleted but not removed from database. Status changed to INACTIVE.

---

### 23. Restore Deleted Product
**Endpoint:** `PUT /api/products/{id}/restore`

**Request:**
```
PUT /api/products/660e8400-e29b-41d4-a716-446655440000/restore
```

**Response:**
```json
{
  "success": true,
  "message": "Restore Product Success!",
  "data": "Product has been restored"
}
```

**Note:** Product is restored and status changed back to ACTIVE.

---

### 24. Hard Delete Product (Permanent)
**Endpoint:** `DELETE /api/products/{id}`

**Request:**
```
DELETE /api/products/660e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "message": "Delete Product Success!",
  "data": "Product deleted successfully"
}
```

**Note:** 
- Product is permanently removed from database
- Cannot delete if product variants are in orders or carts

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to delete product: Cannot delete product: Product variant XXX has been ordered",
  "data": null
}
```

---

## Product Statistics

### 25. Get Product Count by Shop
**Endpoint:** `GET /api/products/count/shop/{shopId}`

**Request:**
```
GET /api/products/count/shop/550e8400-e29b-41d4-a716-446655440001
```

**Response:**
```json
{
  "success": true,
  "message": "Get Product Count Success!",
  "data": 45
}
```

---

### 26. Get Product Count by Category
**Endpoint:** `GET /api/products/count/category/{categoryId}`

**Request:**
```
GET /api/products/count/category/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "message": "Get Product Count Success!",
  "data": 123
}
```

---

## Error Responses

### Common Error Format
```json
{
  "success": false,
  "message": "Error message here",
  "data": null
}
```

### Example Errors

**Product Not Found:**
```json
{
  "success": false,
  "message": "Failed to get product: Product not found with id: xxx",
  "data": null
}
```

**Product Deleted:**
```json
{
  "success": false,
  "message": "Failed to get product: Product has been deleted",
  "data": null
}
```

**Validation Error:**
```json
{
  "success": false,
  "message": "Failed to create product: Product must have at least one variant",
  "data": null
}
```

**Category Not Found:**
```json
{
  "success": false,
  "message": "Failed to create product: Category not found",
  "data": null
}
```

**Shop Not Found:**
```json
{
  "success": false,
  "message": "Failed to create product: Shop not found",
  "data": null
}
```

---

## Status Enum Values

```
ACTIVE          - Product is available for sale
INACTIVE        - Product is not available for sale
OUT_OF_STOCK    - Product is temporarily out of stock
```

---

## Pagination Best Practices

### ⭐ Recommended Endpoints for Production:
- `GET /api/products` - Main product listing
- `GET /api/products/category/{categoryId}/paged` - Category products
- `GET /api/products/shop/{shopId}/paged` - Shop products
- `GET /api/products/search/paged` - Search products
- `GET /api/products/advanced-search/paged` - Advanced search

### Page Navigation Examples:

**First Page:**
```
GET /api/products?page=0&size=20
```

**Next Page:**
```
GET /api/products?page=1&size=20
```

**Custom Page Size:**
```
GET /api/products?page=0&size=50  // 50 items per page
GET /api/products?page=0&size=10  // 10 items per page
```

**Response Pagination Info:**
```json
{
  "currentPage": 0,      // Current page (0-indexed)
  "totalPages": 5,       // Total number of pages
  "totalItems": 95,      // Total number of items
  "pageSize": 20,        // Items per page
  "hasNext": true,       // Has next page?
  "hasPrevious": false   // Has previous page?
}
```

---

## Notes

1. **Pagination Default:** All paginated endpoints default to 20 items per page
2. **Active Products Only:** Paginated endpoints only show ACTIVE products (unless using status filter)
3. **Soft Delete:** Products are soft deleted by default and can be restored
4. **Shop View Count:** Viewing product details automatically increments shop view count
5. **Image Upload:** Maximum 5 images per product
6. **Variants Required:** Every product must have at least one variant
7. **SKU Unique:** Each variant must have a unique SKU
8. **Search Case Insensitive:** Product name search is case-insensitive
9. **Product Count in Categories:** Each category response includes `productCount` showing the number of products in that category
10. **Category Status:** Each category has a `status` field with values `ACTIVE` or `INACTIVE`. Default is `ACTIVE`
11. **Update Category Status:** You can change category status using the update endpoint with `{"status": "INACTIVE"}` or `{"status": "ACTIVE"}`

---

## Testing with cURL

### Get All Products (Paginated)
```bash
curl -X GET "http://localhost:8080/api/products?page=0&size=20"
```

### Search Products
```bash
curl -X GET "http://localhost:8080/api/products/search/paged?name=iPhone&page=0&size=20"
```

### Create Product
```bash
curl -X POST "http://localhost:8080/api/products/create-simple" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test Description",
    "brand": "Test Brand",
    "categoryId": "550e8400-e29b-41d4-a716-446655440000",
    "shopId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "ACTIVE",
    "variants": [{
      "sku": "TEST-001",
      "price": 100000,
      "stock": 10,
      "weight": 100,
      "dimensions": "10x10x10"
    }]
  }'
```

### Update Product
```bash
curl -X PUT "http://localhost:8080/api/products/simple/660e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product Name",
    "status": "ACTIVE"
  }'
```

### Delete Product (Soft)
```bash
curl -X DELETE "http://localhost:8080/api/products/660e8400-e29b-41d4-a716-446655440000/soft"
```

---

## Postman Collection

Import this into Postman for easy testing:

```json
{
  "info": {
    "name": "Smart Mall - Product API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Products (Paginated)",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/products?page=0&size=20",
          "host": ["{{baseUrl}}"],
          "path": ["api", "products"],
          "query": [
            {"key": "page", "value": "0"},
            {"key": "size", "value": "20"}
          ]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080"
    }
  ]
}
```

---

# CATEGORY API

## Create Category

### 27. Create Category
**Endpoint:** `POST /api/categories`  
**Content-Type:** `application/json`

**Request:**
```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "parentId": null,
  "status": "ACTIVE"
}
```

**Note:** `status` is optional. Valid values: `ACTIVE`, `INACTIVE`. Default: `ACTIVE`

**Request (Subcategory):**
```json
{
  "name": "Smartphones",
  "description": "Mobile phones and accessories",
  "parentId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Create Category Success!",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "status": "ACTIVE",
    "parent": null,
    "subCategories": null,
    "productCount": 0,
    "createdAt": "2025-11-11T10:30:00",
    "updatedAt": "2025-11-11T10:30:00"
  }
}
```

---

## Get Category

### 28. Get Category by ID
**Endpoint:** `GET /api/categories/{id}`

**Request:**
```
GET /api/categories/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "message": "Get Category Success!",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "status": "ACTIVE",
    "parent": null,
    "productCount": 145,
    "subCategories": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Smartphones",
        "description": "Mobile phones and accessories",
        "status": "ACTIVE",
        "parent": null,
        "subCategories": null,
        "productCount": 87,
        "createdAt": "2025-11-11T10:35:00",
        "updatedAt": "2025-11-11T10:35:00"
      }
    ],
    "createdAt": "2025-11-11T10:30:00",
    "updatedAt": "2025-11-11T10:30:00"
  }
}
```

---

### 29. Get All Root Categories (Hierarchical)
**Endpoint:** `GET /api/categories/root`

**Request:**
```
GET /api/categories/root
```

**Response:**
```json
{
  "success": true,
  "message": "Get Root Categories Success!",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "parent": null,
      "productCount": 145,
      "subCategories": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "name": "Smartphones",
          "description": "Mobile phones",
          "productCount": 87
        }
      ]
    }
  ]
}
```

---

### 30. Get All Root Categories with Pagination ⭐
**Endpoint:** `GET /api/categories/root/paged`

**Query Parameters:**
- `page` (optional, default: 0)
- `size` (optional, default: 20)

**Request:**
```
GET /api/categories/root/paged?page=0&size=20
```

**Response:**
```json
{
  "success": true,
  "message": "Get Root Categories Success!",
  "data": {
    "categories": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Electronics",
        "description": "Electronic devices",
        "status": "ACTIVE",
        "parent": null,
        "productCount": 145,
        "subCategories": [...]
      }
    ],
    "currentPage": 0,
    "totalPages": 1,
    "totalItems": 5,
    "pageSize": 20,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

### 31. Get All Categories (Flat List)
**Endpoint:** `GET /api/categories/all`

**Request:**
```
GET /api/categories/all
```

**Response:**
```json
{
  "success": true,
  "message": "Get All Categories Success!",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Electronics",
      "status": "ACTIVE",
      "parent": null,
      "productCount": 145
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Smartphones",
      "status": "ACTIVE",
      "parent": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Electronics",
        "status": "ACTIVE",
        "productCount": 145
      },
      "productCount": 87
    }
  ]
}
```

---

### 32. Get All Categories with Pagination ⭐
**Endpoint:** `GET /api/categories`

**Query Parameters:**
- `page` (optional, default: 0)
- `size` (optional, default: 20)

**Request:**
```
GET /api/categories?page=0&size=20
```

**Response:**
```json
{
  "success": true,
  "message": "Get All Categories Success!",
  "data": {
    "categories": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Electronics",
        "description": "Electronic devices",
        "status": "ACTIVE",
        "parent": null,
        "productCount": 145
      }
    ],
    "currentPage": 0,
    "totalPages": 2,
    "totalItems": 25,
    "pageSize": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

### 33. Get Subcategories by Parent ID
**Endpoint:** `GET /api/categories/{parentId}/subcategories`

**Request:**
```
GET /api/categories/550e8400-e29b-41d4-a716-446655440000/subcategories
```

**Response:**
```json
{
  "success": true,
  "message": "Get Subcategories Success!",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Smartphones",
      "description": "Mobile phones",
      "status": "ACTIVE",
      "productCount": 87
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Laptops",
      "description": "Portable computers",
      "status": "ACTIVE",
      "productCount": 45
    }
  ]
}
```

---

### 34. Get Subcategories with Pagination ⭐
**Endpoint:** `GET /api/categories/{parentId}/subcategories/paged`

**Query Parameters:**
- `page` (optional, default: 0)
- `size` (optional, default: 20)

**Request:**
```
GET /api/categories/550e8400-e29b-41d4-a716-446655440000/subcategories/paged?page=0&size=20
```

**Response:**
```json
{
  "success": true,
  "message": "Get Subcategories Success!",
  "data": {
    "categories": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Smartphones",
        "description": "Mobile phones",
        "productCount": 87
      }
    ],
    "currentPage": 0,
    "totalPages": 1,
    "totalItems": 3,
    "pageSize": 20,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

## Update Category

### 35. Update Category
**Endpoint:** `PUT /api/categories/{id}`  
**Content-Type:** `application/json`

**Request:**
```json
{
  "name": "Electronics & Gadgets",
  "description": "Updated description for electronics",
  "parentId": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Update Category Success!",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Electronics & Gadgets",
    "description": "Updated description for electronics",
    "status": "INACTIVE",
    "parent": null,
    "productCount": 145,
    "createdAt": "2025-11-11T10:30:00",
    "updatedAt": "2025-11-11T11:00:00"
  }
}
```

---

## Delete Category

### 36. Delete Category
**Endpoint:** `DELETE /api/categories/{id}`

**Request:**
```
DELETE /api/categories/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "success": true,
  "message": "Delete Category Success!",
  "data": "Category deleted successfully"
}
```

**Note:** Cannot delete a category that has subcategories. Delete subcategories first.

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to delete category: Cannot delete category that has subcategories. Delete subcategories first.",
  "data": null
}
```

---

## Search Categories

### 37. Search Categories by Name
**Endpoint:** `GET /api/categories/search`

**Query Parameters:**
- `name` (required) - Search keyword

**Request:**
```
GET /api/categories/search?name=phone
```

**Response:**
```json
{
  "success": true,
  "message": "Search Categories Success!",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Smartphones",
      "description": "Mobile phones and accessories",
      "status": "ACTIVE",
      "productCount": 87
    }
  ]
}
```

---

### 38. Search Categories with Pagination ⭐
**Endpoint:** `GET /api/categories/search/paged`

**Query Parameters:**
- `name` (required) - Search keyword
- `page` (optional, default: 0)
- `size` (optional, default: 20)

**Request:**
```
GET /api/categories/search/paged?name=phone&page=0&size=20
```

**Response:**
```json
{
  "success": true,
  "message": "Search Categories Success!",
  "data": {
    "categories": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Smartphones",
        "description": "Mobile phones",
        "status": "ACTIVE",
        "productCount": 87
      }
    ],
    "currentPage": 0,
    "totalPages": 1,
    "totalItems": 2,
    "pageSize": 20,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

## Category Error Responses

### Category Not Found
```json
{
  "success": false,
  "message": "Failed to get category: Category not found with id: xxx",
  "data": null
}
```

### Duplicate Category Name
```json
{
  "success": false,
  "message": "Failed to create category: Category name already exists in this parent category",
  "data": null
}
```

### Parent Category Not Found
```json
{
  "success": false,
  "message": "Failed to create category: Parent category not found",
  "data": null
}
```

### Cannot Be Own Parent
```json
{
  "success": false,
  "message": "Failed to update category: Category cannot be its own parent",
  "data": null
}
```

---

## Category Best Practices

### ⭐ Recommended Endpoints:
- `GET /api/categories` - All categories (paginated)
- `GET /api/categories/root/paged` - Root categories with subcategories
- `GET /api/categories/{parentId}/subcategories/paged` - Subcategories
- `GET /api/categories/search/paged` - Search categories

### Category Hierarchy Example:
```
Electronics (Root)
├── Smartphones
│   ├── Android Phones
│   └── iPhones
├── Laptops
│   ├── Gaming Laptops
│   └── Business Laptops
└── Tablets
```

---

## Testing with cURL - Categories

### Get All Categories (Paginated)
```bash
curl -X GET "http://localhost:8080/api/categories?page=0&size=20"
```

### Create Category
```bash
curl -X POST "http://localhost:8080/api/categories" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "parentId": null
  }'
```

### Create Subcategory
```bash
curl -X POST "http://localhost:8080/api/categories" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smartphones",
    "description": "Mobile phones",
    "parentId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Update Category
```bash
curl -X PUT "http://localhost:8080/api/categories/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics & Gadgets",
    "description": "Updated description"
  }'
```

### Delete Category
```bash
curl -X DELETE "http://localhost:8080/api/categories/550e8400-e29b-41d4-a716-446655440000"
```

### Search Categories
```bash
curl -X GET "http://localhost:8080/api/categories/search/paged?name=phone&page=0&size=20"
```

---

**Last Updated:** November 11, 2025  
**API Version:** 1.0  
**Base URLs:**
- Products: `http://localhost:8080/api/products`
- Categories: `http://localhost:8080/api/categories`
