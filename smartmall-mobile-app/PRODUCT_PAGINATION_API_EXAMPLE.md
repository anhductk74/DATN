# 📦 API Product với Phân Trang - Hướng Dẫn Sử Dụng

## 📋 Mục Lục
1. [API Lấy Tất Cả Sản Phẩm](#1-api-lấy-tất-cả-sản-phẩm)
2. [API Lọc Theo Category](#2-api-lọc-theo-category)
3. [API Lọc Theo Shop](#3-api-lọc-theo-shop)
4. [API Lọc Theo Status](#4-api-lọc-theo-status)
5. [API Tìm Kiếm Theo Tên](#5-api-tìm-kiếm-theo-tên)
6. [API Tìm Kiếm Nâng Cao](#6-api-tìm-kiếm-nâng-cao)
7. [Cấu Trúc Response](#7-cấu-trúc-response)

---

## 1. API Lấy Tất Cả Sản Phẩm

### Endpoint
```
GET /api/products
```

### Query Parameters
| Tham số | Kiểu | Mặc định | Mô tả |
|---------|------|----------|-------|
| `page` | int | 0 | Số trang (bắt đầu từ 0) |
| `size` | int | 20 | Số lượng sản phẩm mỗi trang |

### Ví dụ Request

**Lấy trang đầu tiên (20 sản phẩm):**
```bash
GET http://localhost:8080/api/products
```

**Lấy trang thứ 2 với 10 sản phẩm:**
```bash
GET http://localhost:8080/api/products?page=1&size=10
```

**Lấy trang thứ 3 với 50 sản phẩm:**
```bash
GET http://localhost:8080/api/products?page=2&size=50
```

### Ví dụ Response
```json
{
  "success": true,
  "message": "Get Products Success!",
  "data": {
    "products": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "iPhone 15 Pro Max",
        "description": "Điện thoại cao cấp",
        "brand": "Apple",
        "images": ["url1.jpg", "url2.jpg"],
        "status": "ACTIVE",
        "categoryId": "...",
        "shopId": "...",
        "createdAt": "2024-01-15T10:30:00",
        "updatedAt": "2024-01-15T10:30:00"
      }
    ],
    "currentPage": 0,
    "totalPages": 5,
    "totalItems": 100,
    "pageSize": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## 2. API Lọc Theo Category

### Endpoint
```
GET /api/products/category/{categoryId}/paged
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `categoryId` | UUID | ID của danh mục |

### Query Parameters
| Tham số | Kiểu | Mặc định | Mô tả |
|---------|------|----------|-------|
| `page` | int | 0 | Số trang |
| `size` | int | 20 | Số lượng sản phẩm mỗi trang |

### Ví dụ Request

**Lấy sản phẩm của category điện thoại:**
```bash
GET http://localhost:8080/api/products/category/123e4567-e89b-12d3-a456-426614174000/paged?page=0&size=20
```

---

## 3. API Lọc Theo Shop

### Endpoint
```
GET /api/products/shop/{shopId}/paged
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `shopId` | UUID | ID của cửa hàng |

### Query Parameters
| Tham số | Kiểu | Mặc định | Mô tả |
|---------|------|----------|-------|
| `page` | int | 0 | Số trang |
| `size` | int | 20 | Số lượng sản phẩm mỗi trang |

### Ví dụ Request

**Lấy sản phẩm của shop ABC:**
```bash
GET http://localhost:8080/api/products/shop/456e7890-e89b-12d3-a456-426614174000/paged?page=0&size=20
```

**Lấy trang thứ 3 với 15 sản phẩm:**
```bash
GET http://localhost:8080/api/products/shop/456e7890-e89b-12d3-a456-426614174000/paged?page=2&size=15
```

---

## 4. API Lọc Theo Status

### Endpoint
```
GET /api/products/status/{status}/paged
```

### Path Parameters
| Tham số | Kiểu | Giá trị hợp lệ | Mô tả |
|---------|------|----------------|-------|
| `status` | enum | ACTIVE, INACTIVE, PENDING | Trạng thái sản phẩm |

### Query Parameters
| Tham số | Kiểu | Mặc định | Mô tả |
|---------|------|----------|-------|
| `page` | int | 0 | Số trang |
| `size` | int | 20 | Số lượng sản phẩm mỗi trang |

### Ví dụ Request

**Lấy sản phẩm đang ACTIVE:**
```bash
GET http://localhost:8080/api/products/status/ACTIVE/paged?page=0&size=20
```

**Lấy sản phẩm INACTIVE:**
```bash
GET http://localhost:8080/api/products/status/INACTIVE/paged?page=0&size=10
```

---

## 5. API Tìm Kiếm Theo Tên

### Endpoint
```
GET /api/products/search/paged
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `name` | string | Có | Từ khóa tìm kiếm |
| `page` | int | Không | Số trang (mặc định: 0) |
| `size` | int | Không | Số lượng sản phẩm (mặc định: 20) |

### Ví dụ Request

**Tìm kiếm "iPhone":**
```bash
GET http://localhost:8080/api/products/search/paged?name=iPhone&page=0&size=20
```

**Tìm kiếm "Samsung Galaxy":**
```bash
GET http://localhost:8080/api/products/search/paged?name=Samsung%20Galaxy&page=0&size=15
```

---

## 6. API Tìm Kiếm Nâng Cao

### Endpoint
```
GET /api/products/advanced-search/paged
```

### Query Parameters (Tất cả đều optional)
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `name` | string | Tìm kiếm theo tên sản phẩm |
| `brand` | string | Lọc theo thương hiệu |
| `categoryId` | UUID | Lọc theo danh mục |
| `shopId` | UUID | Lọc theo cửa hàng |
| `status` | enum | Lọc theo trạng thái (ACTIVE, INACTIVE, PENDING) |
| `page` | int | Số trang (mặc định: 0) |
| `size` | int | Số lượng sản phẩm (mặc định: 20) |

### Ví dụ Request

**Tìm kiếm đa điều kiện 1:**
```bash
GET http://localhost:8080/api/products/advanced-search/paged?name=iPhone&brand=Apple&status=ACTIVE&page=0&size=20
```

**Tìm kiếm đa điều kiện 2:**
```bash
GET http://localhost:8080/api/products/advanced-search/paged?categoryId=123e4567-e89b-12d3-a456-426614174000&status=ACTIVE&page=0&size=10
```

**Tìm kiếm theo shop và brand:**
```bash
GET http://localhost:8080/api/products/advanced-search/paged?shopId=456e7890-e89b-12d3-a456-426614174000&brand=Samsung&page=0&size=15
```

**Tìm kiếm chỉ có tên:**
```bash
GET http://localhost:8080/api/products/advanced-search/paged?name=Laptop&page=0&size=20
```

---

## 7. Cấu Trúc Response

### PagedProductResponseDto

```json
{
  "success": true,
  "message": "Get Products Success!",
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Tên sản phẩm",
        "description": "Mô tả sản phẩm",
        "brand": "Thương hiệu",
        "images": ["url1", "url2"],
        "status": "ACTIVE",
        "isDeleted": false,
        "categoryId": "uuid",
        "shopId": "uuid",
        "createdAt": "2024-01-15T10:30:00",
        "updatedAt": "2024-01-15T10:30:00"
      }
    ],
    "currentPage": 0,        // Trang hiện tại
    "totalPages": 5,         // Tổng số trang
    "totalItems": 100,       // Tổng số sản phẩm
    "pageSize": 20,          // Số lượng sản phẩm mỗi trang
    "hasNext": true,         // Có trang tiếp theo không
    "hasPrevious": false     // Có trang trước không
  }
}
```

### Các Trường Trong Response

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `products` | Array | Danh sách sản phẩm trong trang hiện tại |
| `currentPage` | int | Số trang hiện tại (bắt đầu từ 0) |
| `totalPages` | int | Tổng số trang |
| `totalItems` | long | Tổng số sản phẩm |
| `pageSize` | int | Số lượng sản phẩm trên mỗi trang |
| `hasNext` | boolean | `true` nếu còn trang tiếp theo |
| `hasPrevious` | boolean | `true` nếu có trang trước đó |

---

## 📝 Lưu Ý Quan Trọng

### 1. Số Trang (Page Number)
- **Bắt đầu từ 0**, không phải 1
- Trang đầu tiên: `page=0`
- Trang thứ hai: `page=1`
- Trang thứ ba: `page=2`

### 2. Kích Thước Trang (Page Size)
- Mặc định: **20 sản phẩm/trang**
- Có thể tùy chỉnh: 10, 15, 20, 30, 50, 100...
- Nên giới hạn tối đa để tránh tải quá nhiều dữ liệu

### 3. Sắp Xếp (Sorting)
- Tất cả API pagination sắp xếp theo **createdAt** giảm dần (mới nhất trước)
- Sản phẩm mới nhất sẽ xuất hiện đầu tiên

### 4. Lọc ACTIVE
- Các API pagination (trừ status) **chỉ trả về sản phẩm ACTIVE**
- Sản phẩm đã xóa mềm (`isDeleted = true`) không được trả về

---

## 🔧 Code Mẫu Sử Dụng API

### JavaScript/Fetch API

```javascript
// Lấy trang đầu tiên
async function getProducts(page = 0, size = 20) {
  const response = await fetch(
    `http://localhost:8080/api/products?page=${page}&size=${size}`
  );
  const data = await response.json();
  
  console.log('Sản phẩm:', data.data.products);
  console.log('Trang hiện tại:', data.data.currentPage);
  console.log('Tổng số trang:', data.data.totalPages);
  console.log('Tổng sản phẩm:', data.data.totalItems);
  console.log('Có trang tiếp theo:', data.data.hasNext);
  
  return data;
}

// Tìm kiếm nâng cao
async function advancedSearch(filters) {
  const params = new URLSearchParams();
  
  if (filters.name) params.append('name', filters.name);
  if (filters.brand) params.append('brand', filters.brand);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.shopId) params.append('shopId', filters.shopId);
  if (filters.status) params.append('status', filters.status);
  params.append('page', filters.page || 0);
  params.append('size', filters.size || 20);
  
  const response = await fetch(
    `http://localhost:8080/api/products/advanced-search/paged?${params}`
  );
  return await response.json();
}

// Sử dụng
advancedSearch({
  name: 'iPhone',
  brand: 'Apple',
  status: 'ACTIVE',
  page: 0,
  size: 10
});
```

### Axios

```javascript
import axios from 'axios';

// Lấy sản phẩm với pagination
const getProducts = async (page = 0, size = 20) => {
  try {
    const response = await axios.get('http://localhost:8080/api/products', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Tìm kiếm theo category
const getProductsByCategory = async (categoryId, page = 0, size = 20) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/products/category/${categoryId}/paged`,
      { params: { page, size } }
    );
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

function useProductPagination(initialPage = 0, initialSize = 20) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false
  });
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (page, size) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/products', {
        params: { page, size }
      });
      
      const data = response.data.data;
      setProducts(data.products);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalItems: data.totalItems,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(initialPage, initialSize);
  }, [initialPage, initialSize]);

  const goToPage = (page) => fetchProducts(page, initialSize);
  const nextPage = () => pagination.hasNext && goToPage(pagination.currentPage + 1);
  const prevPage = () => pagination.hasPrevious && goToPage(pagination.currentPage - 1);

  return {
    products,
    pagination,
    loading,
    goToPage,
    nextPage,
    prevPage
  };
}

// Sử dụng trong component
function ProductList() {
  const { products, pagination, loading, nextPage, prevPage } = useProductPagination(0, 20);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
      
      <button onClick={prevPage} disabled={!pagination.hasPrevious}>
        Previous
      </button>
      <span>Page {pagination.currentPage + 1} of {pagination.totalPages}</span>
      <button onClick={nextPage} disabled={!pagination.hasNext}>
        Next
      </button>
    </div>
  );
}
```

---

## 🎯 Use Cases Thực Tế

### 1. Trang chủ - Hiển thị sản phẩm mới nhất
```bash
GET /api/products?page=0&size=20
```

### 2. Danh mục điện thoại - Trang 1
```bash
GET /api/products/category/{phone-category-id}/paged?page=0&size=30
```

### 3. Sản phẩm của shop ABC - Trang 2
```bash
GET /api/products/shop/{shop-id}/paged?page=1&size=20
```

### 4. Tìm kiếm "iPhone 15" thuộc Apple
```bash
GET /api/products/advanced-search/paged?name=iPhone%2015&brand=Apple&page=0&size=10
```

### 5. Lọc sản phẩm ACTIVE trong category Laptop
```bash
GET /api/products/advanced-search/paged?categoryId={laptop-category-id}&status=ACTIVE&page=0&size=25
```

---

## ✅ Kiểm Tra API

### Postman Collection

Bạn có thể import collection sau vào Postman:

```json
{
  "info": {
    "name": "Product Pagination APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Products Paged",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:8080/api/products?page=0&size=20",
          "query": [
            {"key": "page", "value": "0"},
            {"key": "size", "value": "20"}
          ]
        }
      }
    },
    {
      "name": "Search Products Paged",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:8080/api/products/search/paged?name=iPhone&page=0&size=10",
          "query": [
            {"key": "name", "value": "iPhone"},
            {"key": "page", "value": "0"},
            {"key": "size", "value": "10"}
          ]
        }
      }
    },
    {
      "name": "Advanced Search Paged",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:8080/api/products/advanced-search/paged?name=iPhone&brand=Apple&status=ACTIVE&page=0&size=15",
          "query": [
            {"key": "name", "value": "iPhone"},
            {"key": "brand", "value": "Apple"},
            {"key": "status", "value": "ACTIVE"},
            {"key": "page", "value": "0"},
            {"key": "size", "value": "15"}
          ]
        }
      }
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **Page bắt đầu từ 1 thay vì 0**
   - ❌ Sai: `page=1` cho trang đầu
   - ✅ Đúng: `page=0` cho trang đầu

2. **Không có dữ liệu trả về**
   - Kiểm tra `status=ACTIVE` của sản phẩm
   - Kiểm tra `isDeleted=false`

3. **Tổng số trang sai**
   - Tổng trang = `Math.ceil(totalItems / pageSize)`

4. **URL encoding cho tìm kiếm**
   - Sử dụng `%20` cho khoảng trắng
   - Ví dụ: `Samsung Galaxy` → `Samsung%20Galaxy`

---

**Tài liệu được tạo bởi: Smart Mall Spring Boot Team**
**Ngày cập nhật: 16/12/2025**
