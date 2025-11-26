# API Product Examples - Smart Mall

Tài liệu này cung cấp các ví dụ API sản phẩm để test và sử dụng trong mobile app.

## 1. Lấy danh sách sản phẩm (có phân trang)

**Endpoint**: `GET /api/products`

**Query Parameters**:
- `page`: Số trang (default: 0)
- `size`: Số sản phẩm mỗi trang (default: 20)
- `sort`: Sắp xếp (ví dụ: `price,asc` hoặc `createdAt,desc`)
- `categoryId`: Lọc theo category (optional)
- `shopId`: Lọc theo shop (optional)
- `keyword`: Tìm kiếm theo tên sản phẩm (optional)
- `minPrice`: Giá tối thiểu (optional)
- `maxPrice`: Giá tối đa (optional)

**Request Example**:
```
GET /api/products?page=0&size=10&sort=price,asc&categoryId=category-uuid
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "content": [
      {
        "id": "product-uuid-1",
        "name": "iPhone 15 Pro Max 256GB",
        "description": "Điện thoại iPhone 15 Pro Max mới nhất với chip A17 Pro",
        "price": 29990000,
        "originalPrice": 34990000,
        "stock": 50,
        "sold": 123,
        "categoryId": "category-uuid-1",
        "categoryName": "Điện thoại",
        "shopId": "shop-uuid-1",
        "shopName": "Apple Store Official",
        "images": [
          "https://res.cloudinary.com/smartmall/image/upload/v1/products/iphone15-1.jpg",
          "https://res.cloudinary.com/smartmall/image/upload/v1/products/iphone15-2.jpg"
        ],
        "rating": 4.8,
        "reviewCount": 45,
        "status": "ACTIVE",
        "createdAt": "2024-11-20T10:30:00",
        "updatedAt": "2024-11-24T15:45:00"
      },
      {
        "id": "product-uuid-2",
        "name": "Samsung Galaxy S24 Ultra 512GB",
        "description": "Flagship Samsung với S Pen và camera 200MP",
        "price": 27990000,
        "originalPrice": 31990000,
        "stock": 30,
        "sold": 87,
        "categoryId": "category-uuid-1",
        "categoryName": "Điện thoại",
        "shopId": "shop-uuid-2",
        "shopName": "Samsung Official Store",
        "images": [
          "https://res.cloudinary.com/smartmall/image/upload/v1/products/s24ultra-1.jpg"
        ],
        "rating": 4.7,
        "reviewCount": 32,
        "status": "ACTIVE",
        "createdAt": "2024-11-18T09:20:00",
        "updatedAt": "2024-11-23T11:30:00"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10,
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      },
      "offset": 0,
      "paged": true,
      "unpaged": false
    },
    "totalPages": 5,
    "totalElements": 48,
    "last": false,
    "first": true,
    "number": 0,
    "numberOfElements": 10,
    "size": 10,
    "empty": false
  }
}
```

---

## 2. Lấy chi tiết sản phẩm

**Endpoint**: `GET /api/products/{productId}`

**Path Parameters**:
- `productId`: UUID của sản phẩm

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Product details retrieved successfully",
  "data": {
    "id": "product-uuid-1",
    "name": "iPhone 15 Pro Max 256GB",
    "description": "Điện thoại iPhone 15 Pro Max mới nhất với chip A17 Pro, màn hình Super Retina XDR 6.7 inch, camera chính 48MP, zoom quang học 5x, khung Titan bền bỉ.",
    "price": 29990000,
    "originalPrice": 34990000,
    "discount": 14,
    "stock": 50,
    "sold": 123,
    "categoryId": "category-uuid-1",
    "categoryName": "Điện thoại",
    "shopId": "shop-uuid-1",
    "shopName": "Apple Store Official",
    "shopAvatar": "https://res.cloudinary.com/smartmall/image/upload/v1/shops/apple-logo.jpg",
    "images": [
      "https://res.cloudinary.com/smartmall/image/upload/v1/products/iphone15-1.jpg",
      "https://res.cloudinary.com/smartmall/image/upload/v1/products/iphone15-2.jpg",
      "https://res.cloudinary.com/smartmall/image/upload/v1/products/iphone15-3.jpg",
      "https://res.cloudinary.com/smartmall/image/upload/v1/products/iphone15-4.jpg"
    ],
    "specifications": {
      "Màn hình": "6.7 inch, Super Retina XDR, 2796 x 1290 pixels",
      "Chip": "Apple A17 Pro",
      "RAM": "8GB",
      "Bộ nhớ": "256GB",
      "Camera sau": "48MP + 12MP + 12MP",
      "Camera trước": "12MP",
      "Pin": "4422mAh, sạc nhanh 20W",
      "Hệ điều hành": "iOS 17"
    },
    "rating": 4.8,
    "reviewCount": 45,
    "reviews": [
      {
        "id": "review-uuid-1",
        "userId": "user-uuid-1",
        "userName": "Nguyễn Văn A",
        "userAvatar": "https://res.cloudinary.com/smartmall/image/upload/v1/avatars/user1.jpg",
        "rating": 5,
        "comment": "Sản phẩm rất tốt, giao hàng nhanh. Máy chính hãng, đóng gói cẩn thận.",
        "images": [
          "https://res.cloudinary.com/smartmall/image/upload/v1/reviews/review1-1.jpg"
        ],
        "createdAt": "2024-11-22T14:30:00",
        "likes": 12,
        "reply": {
          "shopName": "Apple Store Official",
          "content": "Cảm ơn bạn đã tin tưởng shop!",
          "createdAt": "2024-11-22T16:00:00"
        }
      },
      {
        "id": "review-uuid-2",
        "userId": "user-uuid-2",
        "userName": "Trần Thị B",
        "userAvatar": null,
        "rating": 4,
        "comment": "Máy đẹp, pin trâu. Tuy nhiên hơi nặng.",
        "images": [],
        "createdAt": "2024-11-20T10:15:00",
        "likes": 5,
        "reply": null
      }
    ],
    "variants": [
      {
        "id": "variant-uuid-1",
        "name": "Màu sắc",
        "options": ["Titan Tự Nhiên", "Titan Xanh", "Titan Trắng", "Titan Đen"]
      },
      {
        "id": "variant-uuid-2",
        "name": "Dung lượng",
        "options": ["256GB", "512GB", "1TB"]
      }
    ],
    "status": "ACTIVE",
    "viewCount": 1250,
    "createdAt": "2024-11-20T10:30:00",
    "updatedAt": "2024-11-24T15:45:00"
  }
}
```

**Response Error (404 Not Found)**:
```json
{
  "success": false,
  "message": "Product not found",
  "data": null
}
```

---

## 3. Tìm kiếm sản phẩm

**Endpoint**: `GET /api/products/search`

**Query Parameters**:
- `keyword`: Từ khóa tìm kiếm (required)
- `page`: Số trang (default: 0)
- `size`: Số sản phẩm mỗi trang (default: 20)

**Request Example**:
```
GET /api/products/search?keyword=iphone&page=0&size=10
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Search results",
  "data": {
    "content": [
      {
        "id": "product-uuid-1",
        "name": "iPhone 15 Pro Max 256GB",
        "price": 29990000,
        "originalPrice": 34990000,
        "images": ["https://res.cloudinary.com/smartmall/image/upload/v1/products/iphone15-1.jpg"],
        "rating": 4.8,
        "sold": 123,
        "shopName": "Apple Store Official"
      }
    ],
    "totalElements": 15,
    "totalPages": 2
  }
}
```

---

## 4. Lấy sản phẩm theo category

**Endpoint**: `GET /api/products/category/{categoryId}`

**Path Parameters**:
- `categoryId`: UUID của category

**Query Parameters**:
- `page`: Số trang (default: 0)
- `size`: Số sản phẩm mỗi trang (default: 20)
- `sort`: Sắp xếp (optional)

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Products by category retrieved successfully",
  "data": {
    "categoryName": "Điện thoại",
    "products": {
      "content": [
        {
          "id": "product-uuid-1",
          "name": "iPhone 15 Pro Max 256GB",
          "price": 29990000,
          "images": ["https://res.cloudinary.com/smartmall/image/upload/v1/products/iphone15-1.jpg"],
          "rating": 4.8,
          "sold": 123
        }
      ],
      "totalElements": 48,
      "totalPages": 5
    }
  }
}
```

---

## 5. Lấy sản phẩm theo shop

**Endpoint**: `GET /api/products/shop/{shopId}`

**Path Parameters**:
- `shopId`: UUID của shop

**Query Parameters**:
- `page`: Số trang
- `size`: Số sản phẩm mỗi trang

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Shop products retrieved successfully",
  "data": {
    "shopId": "shop-uuid-1",
    "shopName": "Apple Store Official",
    "shopAvatar": "https://res.cloudinary.com/smartmall/image/upload/v1/shops/apple-logo.jpg",
    "products": {
      "content": [
        {
          "id": "product-uuid-1",
          "name": "iPhone 15 Pro Max 256GB",
          "price": 29990000,
          "stock": 50,
          "sold": 123,
          "rating": 4.8
        }
      ],
      "totalElements": 25
    }
  }
}
```

---

## 6. Lấy sản phẩm liên quan

**Endpoint**: `GET /api/products/{productId}/related`

**Path Parameters**:
- `productId`: UUID của sản phẩm

**Query Parameters**:
- `limit`: Số lượng sản phẩm (default: 10)

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Related products retrieved successfully",
  "data": [
    {
      "id": "product-uuid-3",
      "name": "iPhone 15 Pro 128GB",
      "price": 25990000,
      "originalPrice": 28990000,
      "images": ["https://res.cloudinary.com/smartmall/image/upload/v1/products/iphone15pro-1.jpg"],
      "rating": 4.7,
      "sold": 98
    },
    {
      "id": "product-uuid-4",
      "name": "iPhone 14 Pro Max 256GB",
      "price": 24990000,
      "originalPrice": 29990000,
      "images": ["https://res.cloudinary.com/smartmall/image/upload/v1/products/iphone14-1.jpg"],
      "rating": 4.6,
      "sold": 156
    }
  ]
}
```

---

## 7. Thêm đánh giá sản phẩm (Requires Auth)

**Endpoint**: `POST /api/products/{productId}/reviews`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Path Parameters**:
- `productId`: UUID của sản phẩm

**Request Body**:
```json
{
  "rating": 5,
  "comment": "Sản phẩm rất tốt, đóng gói cẩn thận",
  "orderId": "order-uuid-1",
  "images": [
    "https://res.cloudinary.com/smartmall/image/upload/v1/reviews/img1.jpg",
    "https://res.cloudinary.com/smartmall/image/upload/v1/reviews/img2.jpg"
  ]
}
```

**Response Success (201 Created)**:
```json
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    "id": "review-uuid-3",
    "userId": "user-uuid-1",
    "userName": "Nguyễn Văn A",
    "rating": 5,
    "comment": "Sản phẩm rất tốt, đóng gói cẩn thận",
    "images": [
      "https://res.cloudinary.com/smartmall/image/upload/v1/reviews/img1.jpg",
      "https://res.cloudinary.com/smartmall/image/upload/v1/reviews/img2.jpg"
    ],
    "createdAt": "2024-11-25T10:30:00",
    "likes": 0
  }
}
```

**Response Error (400 Bad Request)**:
```json
{
  "success": false,
  "message": "You can only review products you have purchased",
  "data": null
}
```

---

## 8. Lấy sản phẩm đang giảm giá

**Endpoint**: `GET /api/products/on-sale`

**Query Parameters**:
- `page`: Số trang
- `size`: Số sản phẩm mỗi trang
- `minDiscount`: % giảm giá tối thiểu (optional)

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Products on sale retrieved successfully",
  "data": {
    "content": [
      {
        "id": "product-uuid-1",
        "name": "iPhone 15 Pro Max 256GB",
        "price": 29990000,
        "originalPrice": 34990000,
        "discount": 14,
        "images": ["https://res.cloudinary.com/smartmall/image/upload/v1/products/iphone15-1.jpg"],
        "rating": 4.8,
        "sold": 123,
        "shopName": "Apple Store Official"
      }
    ],
    "totalElements": 32
  }
}
```

---

## 9. Lấy sản phẩm bán chạy

**Endpoint**: `GET /api/products/best-sellers`

**Query Parameters**:
- `limit`: Số lượng sản phẩm (default: 10)
- `categoryId`: Lọc theo category (optional)

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Best seller products retrieved successfully",
  "data": [
    {
      "id": "product-uuid-5",
      "name": "AirPods Pro Gen 2",
      "price": 5990000,
      "images": ["https://res.cloudinary.com/smartmall/image/upload/v1/products/airpods-1.jpg"],
      "rating": 4.9,
      "sold": 1520,
      "shopName": "Apple Store Official"
    },
    {
      "id": "product-uuid-6",
      "name": "Samsung Galaxy Buds2 Pro",
      "price": 3990000,
      "images": ["https://res.cloudinary.com/smartmall/image/upload/v1/products/buds2-1.jpg"],
      "rating": 4.7,
      "sold": 1340,
      "shopName": "Samsung Official Store"
    }
  ]
}
```

---

## 10. Lấy sản phẩm mới nhất

**Endpoint**: `GET /api/products/new-arrivals`

**Query Parameters**:
- `limit`: Số lượng sản phẩm (default: 10)

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "New arrival products retrieved successfully",
  "data": [
    {
      "id": "product-uuid-7",
      "name": "MacBook Pro M3 14 inch",
      "price": 42990000,
      "images": ["https://res.cloudinary.com/smartmall/image/upload/v1/products/macbook-1.jpg"],
      "rating": 5.0,
      "sold": 15,
      "shopName": "Apple Store Official",
      "createdAt": "2024-11-24T08:00:00"
    }
  ]
}
```

---

## 11. Tạo sản phẩm mới (Manager/Admin Only)

**Endpoint**: `POST /api/products`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "iPhone 15 Pro Max 256GB",
  "description": "Điện thoại iPhone 15 Pro Max mới nhất với chip A17 Pro",
  "price": 29990000,
  "originalPrice": 34990000,
  "stock": 50,
  "categoryId": "category-uuid-1",
  "shopId": "shop-uuid-1",
  "images": [
    "https://res.cloudinary.com/smartmall/image/upload/v1/products/iphone15-1.jpg",
    "https://res.cloudinary.com/smartmall/image/upload/v1/products/iphone15-2.jpg"
  ],
  "specifications": {
    "Màn hình": "6.7 inch",
    "Chip": "Apple A17 Pro",
    "RAM": "8GB",
    "Bộ nhớ": "256GB"
  }
}
```

**Response Success (201 Created)**:
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "product-uuid-new",
    "name": "iPhone 15 Pro Max 256GB",
    "price": 29990000,
    "status": "PENDING",
    "createdAt": "2024-11-25T10:30:00"
  }
}
```

---

## 12. Cập nhật sản phẩm (Manager/Admin Only)

**Endpoint**: `PUT /api/products/{productId}`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "iPhone 15 Pro Max 512GB",
  "price": 34990000,
  "stock": 30
}
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "product-uuid-1",
    "name": "iPhone 15 Pro Max 512GB",
    "price": 34990000,
    "stock": 30,
    "updatedAt": "2024-11-25T11:00:00"
  }
}
```

---

## 13. Xóa sản phẩm (Manager/Admin Only)

**Endpoint**: `DELETE /api/products/{productId}`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": null
}
```

---

## Testing với cURL

### 1. Lấy danh sách sản phẩm
```bash
curl -X GET "http://localhost:8080/api/products?page=0&size=10"
```

### 2. Tìm kiếm sản phẩm
```bash
curl -X GET "http://localhost:8080/api/products/search?keyword=iphone"
```

### 3. Chi tiết sản phẩm
```bash
curl -X GET "http://localhost:8080/api/products/product-uuid-1"
```

### 4. Thêm review
```bash
curl -X POST http://localhost:8080/api/products/product-uuid-1/reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Sản phẩm tuyệt vời!",
    "orderId": "order-uuid-1"
  }'
```

### 5. Tạo sản phẩm mới
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro Max 256GB",
    "price": 29990000,
    "categoryId": "category-uuid-1",
    "shopId": "shop-uuid-1"
  }'
```

---

## React Native Example

### Lấy danh sách sản phẩm
```javascript
const fetchProducts = async (page = 0, size = 20) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/products?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const data = await response.json();
    if (data.success) {
      setProducts(data.data.content);
      setTotalPages(data.data.totalPages);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};
```

### Tìm kiếm sản phẩm
```javascript
const searchProducts = async (keyword) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/products/search?keyword=${encodeURIComponent(keyword)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const data = await response.json();
    if (data.success) {
      setSearchResults(data.data.content);
    }
  } catch (error) {
    console.error('Error searching products:', error);
  }
};
```

### Lấy chi tiết sản phẩm
```javascript
const fetchProductDetail = async (productId) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/products/${productId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const data = await response.json();
    if (data.success) {
      setProductDetail(data.data);
    } else {
      Alert.alert('Error', data.message);
    }
  } catch (error) {
    console.error('Error fetching product detail:', error);
  }
};
```

### Thêm review
```javascript
const addReview = async (productId, rating, comment, orderId, images = []) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch(
      `http://localhost:8080/api/products/${productId}/reviews`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating,
          comment,
          orderId,
          images
        })
      }
    );
    
    const data = await response.json();
    if (data.success) {
      Alert.alert('Success', 'Review added successfully');
      navigation.goBack();
    } else {
      Alert.alert('Error', data.message);
    }
  } catch (error) {
    console.error('Error adding review:', error);
  }
};
```

---

## Validation Rules

### Product
- `name`: Bắt buộc, 3-200 ký tự
- `description`: Bắt buộc, tối thiểu 10 ký tự
- `price`: Bắt buộc, > 0
- `stock`: Bắt buộc, >= 0
- `categoryId`: Bắt buộc, phải tồn tại
- `shopId`: Bắt buộc, phải tồn tại
- `images`: Tối thiểu 1 ảnh, tối đa 10 ảnh

### Review
- `rating`: Bắt buộc, từ 1-5
- `comment`: Optional, tối đa 500 ký tự
- `orderId`: Bắt buộc, phải là đơn hàng đã hoàn thành
- `images`: Optional, tối đa 5 ảnh

---

## Product Status

| Status | Mô tả |
|--------|-------|
| PENDING | Chờ duyệt |
| ACTIVE | Đang bán |
| INACTIVE | Tạm ngưng |
| OUT_OF_STOCK | Hết hàng |
| DELETED | Đã xóa |

---

## Sort Options

- `price,asc`: Giá tăng dần
- `price,desc`: Giá giảm dần
- `sold,desc`: Bán chạy nhất
- `createdAt,desc`: Mới nhất
- `rating,desc`: Đánh giá cao nhất
- `name,asc`: Tên A-Z
- `name,desc`: Tên Z-A

---

## Notes

1. **Pagination**: Mặc định page=0, size=20
2. **Images**: Upload ảnh lên Cloudinary trước khi tạo/cập nhật sản phẩm
3. **Review**: Chỉ review được sản phẩm đã mua và đơn hàng đã hoàn thành
4. **Stock**: Tự động giảm khi có đơn hàng, tăng khi đơn bị hủy
5. **Rating**: Tính trung bình từ tất cả reviews
6. **Search**: Tìm theo tên, mô tả sản phẩm
7. **Related Products**: Dựa trên cùng category hoặc shop
