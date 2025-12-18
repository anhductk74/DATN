# ❤️ API Wishlist - Hướng Dẫn Sử Dụng

## 📋 Mục Lục
1. [Tổng Quan](#1-tổng-quan)
2. [Thêm Sản Phẩm Vào Wishlist](#2-thêm-sản-phẩm-vào-wishlist)
3. [Lấy Danh Sách Wishlist](#3-lấy-danh-sách-wishlist)
4. [Xóa Sản Phẩm Khỏi Wishlist](#4-xóa-sản-phẩm-khỏi-wishlist)
5. [Xóa Tất Cả Wishlist](#5-xóa-tất-cả-wishlist)
6. [Kiểm Tra Sản Phẩm Trong Wishlist](#6-kiểm-tra-sản-phẩm-trong-wishlist)
7. [Đếm Số Lượng Wishlist](#7-đếm-số-lượng-wishlist)
8. [Cập Nhật Ghi Chú](#8-cập-nhật-ghi-chú)
9. [Cấu Trúc Dữ Liệu](#9-cấu-trúc-dữ-liệu)
10. [Code Mẫu](#10-code-mẫu)

---

## 1. Tổng Quan

API Wishlist cho phép người dùng:
- ❤️ Thêm sản phẩm yêu thích vào danh sách
- 📋 Xem danh sách sản phẩm yêu thích
- 🗑️ Xóa sản phẩm khỏi danh sách
- ✅ Kiểm tra sản phẩm có trong wishlist không
- 📝 Thêm ghi chú cho từng sản phẩm

### 🔐 Xác Thực
**Tất cả API yêu cầu JWT Token**

```
Authorization: Bearer {your_jwt_token}
```

---

## 2. Thêm Sản Phẩm Vào Wishlist

### Endpoint
```
POST /api/wishlist
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "productId": "123e4567-e89b-12d3-a456-426614174000",
  "note": "Mua khi có giảm giá"
}
```

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `productId` | UUID | Có | ID của sản phẩm |
| `note` | string | Không | Ghi chú về sản phẩm |

### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Product added to wishlist successfully",
  "data": {
    "wishlistId": "789e0123-e89b-12d3-a456-426614174000",
    "product": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "iPhone 15 Pro Max",
      "description": "Điện thoại cao cấp",
      "brand": "Apple",
      "images": ["url1.jpg", "url2.jpg"],
      "status": "ACTIVE",
      "categoryId": "...",
      "categoryName": "Điện thoại",
      "shopId": "...",
      "shopName": "Apple Store"
    },
    "note": "Mua khi có giảm giá",
    "addedAt": "2024-12-16T10:30:00"
  }
}
```

### Response Error (400 Bad Request)

**Sản phẩm đã có trong wishlist:**
```json
{
  "success": false,
  "message": "Failed to add to wishlist: Product already in wishlist",
  "data": null
}
```

**Sản phẩm không tồn tại:**
```json
{
  "success": false,
  "message": "Failed to add to wishlist: Product not found",
  "data": null
}
```

### Ví dụ Request

**JavaScript (Fetch):**
```javascript
const addToWishlist = async (productId, note = '') => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8080/api/wishlist', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      productId,
      note
    })
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message);
  }
  
  return data.data;
};

// Sử dụng
addToWishlist('123e4567-e89b-12d3-a456-426614174000', 'Mua khi giảm giá')
  .then(result => console.log('Added to wishlist:', result))
  .catch(error => console.error('Error:', error));
```

**Axios:**
```javascript
const addToWishlist = async (productId, note = '') => {
  const token = localStorage.getItem('token');
  
  const response = await axios.post(
    'http://localhost:8080/api/wishlist',
    { productId, note },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.data;
};
```

---

## 3. Lấy Danh Sách Wishlist

### 3.1. Lấy Tất Cả (Không Phân Trang)

#### Endpoint
```
GET /api/wishlist
```

#### Headers
```
Authorization: Bearer {token}
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Get wishlist successfully",
  "data": [
    {
      "wishlistId": "789e0123-e89b-12d3-a456-426614174000",
      "product": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "iPhone 15 Pro Max",
        "description": "Điện thoại cao cấp",
        "brand": "Apple",
        "images": ["url1.jpg"],
        "status": "ACTIVE",
        "categoryId": "...",
        "categoryName": "Điện thoại",
        "shopId": "...",
        "shopName": "Apple Store"
      },
      "note": "Mua khi có giảm giá",
      "addedAt": "2024-12-16T10:30:00"
    },
    {
      "wishlistId": "890e1234-e89b-12d3-a456-426614174000",
      "product": {
        "id": "234e5678-e89b-12d3-a456-426614174000",
        "name": "Samsung Galaxy S24",
        "description": "Điện thoại Android cao cấp",
        "brand": "Samsung",
        "images": ["url2.jpg"],
        "status": "ACTIVE",
        "categoryId": "...",
        "categoryName": "Điện thoại",
        "shopId": "...",
        "shopName": "Samsung Store"
      },
      "note": null,
      "addedAt": "2024-12-15T14:20:00"
    }
  ]
}
```

#### Ví dụ Request

```javascript
const getWishlist = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8080/api/wishlist', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.data;
};

// Sử dụng
getWishlist()
  .then(items => console.log('Wishlist items:', items))
  .catch(error => console.error('Error:', error));
```

### 3.2. Lấy Với Phân Trang

#### Endpoint
```
GET /api/wishlist/paged
```

#### Query Parameters

| Tham số | Kiểu | Mặc định | Mô tả |
|---------|------|----------|-------|
| `page` | int | 0 | Số trang (bắt đầu từ 0) |
| `size` | int | 20 | Số lượng items mỗi trang |

#### Ví dụ Request

```bash
GET http://localhost:8080/api/wishlist/paged?page=0&size=10
```

#### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Get wishlist successfully",
  "data": {
    "items": [
      {
        "wishlistId": "789e0123-e89b-12d3-a456-426614174000",
        "product": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "iPhone 15 Pro Max",
          "description": "Điện thoại cao cấp",
          "brand": "Apple",
          "images": ["url1.jpg"],
          "status": "ACTIVE",
          "categoryId": "...",
          "categoryName": "Điện thoại"
        },
        "note": "Mua khi có giảm giá",
        "addedAt": "2024-12-16T10:30:00"
      }
    ],
    "currentPage": 0,
    "totalPages": 3,
    "totalItems": 25,
    "pageSize": 10,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

#### Code Mẫu

```javascript
const getWishlistPaged = async (page = 0, size = 20) => {
  const token = localStorage.getItem('token');
  
  const response = await axios.get('http://localhost:8080/api/wishlist/paged', {
    params: { page, size },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Sử dụng
getWishlistPaged(0, 10)
  .then(result => {
    console.log('Items:', result.items);
    console.log('Total:', result.totalItems);
    console.log('Has next:', result.hasNext);
  });
```

---

## 4. Xóa Sản Phẩm Khỏi Wishlist

### Endpoint
```
DELETE /api/wishlist/{productId}
```

### Path Parameters

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `productId` | UUID | ID của sản phẩm cần xóa |

### Headers
```
Authorization: Bearer {token}
```

### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Product removed from wishlist successfully",
  "data": "Product has been removed from your wishlist"
}
```

### Response Error (400 Bad Request)

```json
{
  "success": false,
  "message": "Failed to remove from wishlist: Wishlist item not found",
  "data": null
}
```

### Ví dụ Request

```javascript
const removeFromWishlist = async (productId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:8080/api/wishlist/${productId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message);
  }
  
  return data.data;
};

// Sử dụng
removeFromWishlist('123e4567-e89b-12d3-a456-426614174000')
  .then(result => console.log('Removed:', result))
  .catch(error => console.error('Error:', error));
```

---

## 5. Xóa Tất Cả Wishlist

### Endpoint
```
DELETE /api/wishlist
```

### Headers
```
Authorization: Bearer {token}
```

### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Wishlist cleared successfully",
  "data": "All items have been removed from your wishlist"
}
```

### Ví dụ Request

```javascript
const clearWishlist = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8080/api/wishlist', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.data;
};

// Sử dụng với xác nhận
if (confirm('Bạn có chắc muốn xóa tất cả wishlist?')) {
  clearWishlist()
    .then(result => console.log('Cleared:', result))
    .catch(error => console.error('Error:', error));
}
```

---

## 6. Kiểm Tra Sản Phẩm Trong Wishlist

### Endpoint
```
GET /api/wishlist/check/{productId}
```

### Path Parameters

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `productId` | UUID | ID của sản phẩm cần kiểm tra |

### Headers
```
Authorization: Bearer {token}
```

### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Check wishlist successfully",
  "data": {
    "inWishlist": true
  }
}
```

### Ví dụ Request

```javascript
const checkInWishlist = async (productId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:8080/api/wishlist/check/${productId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  return data.data.inWishlist;
};

// Sử dụng
checkInWishlist('123e4567-e89b-12d3-a456-426614174000')
  .then(isInWishlist => {
    console.log('In wishlist:', isInWishlist);
    // Update UI accordingly
    if (isInWishlist) {
      button.classList.add('active');
      button.textContent = '❤️ In Wishlist';
    } else {
      button.classList.remove('active');
      button.textContent = '🤍 Add to Wishlist';
    }
  });
```

---

## 7. Đếm Số Lượng Wishlist

### Endpoint
```
GET /api/wishlist/count
```

### Headers
```
Authorization: Bearer {token}
```

### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Get wishlist count successfully",
  "data": {
    "count": 15
  }
}
```

### Ví dụ Request

```javascript
const getWishlistCount = async () => {
  const token = localStorage.getItem('token');
  
  const response = await axios.get('http://localhost:8080/api/wishlist/count', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data.data.count;
};

// Sử dụng để hiển thị badge
getWishlistCount()
  .then(count => {
    const badge = document.getElementById('wishlist-badge');
    badge.textContent = count;
    badge.style.display = count > 0 ? 'block' : 'none';
  });
```

---

## 8. Cập Nhật Ghi Chú

### Endpoint
```
PUT /api/wishlist/{productId}/note
```

### Path Parameters

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `productId` | UUID | ID của sản phẩm |

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "note": "Mua trong đợt Black Friday"
}
```

### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Note updated successfully",
  "data": {
    "wishlistId": "789e0123-e89b-12d3-a456-426614174000",
    "product": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "iPhone 15 Pro Max",
      "brand": "Apple"
    },
    "note": "Mua trong đợt Black Friday",
    "addedAt": "2024-12-16T10:30:00"
  }
}
```

### Ví dụ Request

```javascript
const updateWishlistNote = async (productId, note) => {
  const token = localStorage.getItem('token');
  
  const response = await axios.put(
    `http://localhost:8080/api/wishlist/${productId}/note`,
    { note },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.data;
};

// Sử dụng
updateWishlistNote(
  '123e4567-e89b-12d3-a456-426614174000',
  'Mua trong đợt Black Friday'
)
  .then(result => console.log('Updated:', result))
  .catch(error => console.error('Error:', error));
```

---

## 9. Cấu Trúc Dữ Liệu

### WishlistItemDto

```typescript
interface WishlistItemDto {
  wishlistId: string;      // UUID
  product: ProductResponseDto;
  note: string | null;     // Ghi chú của user
  addedAt: string;         // Thời gian thêm vào wishlist
}
```

### ProductResponseDto (trong Wishlist)

```typescript
interface ProductResponseDto {
  id: string;              // UUID
  name: string;
  description: string;
  brand: string;
  images: string[];        // Array of image URLs
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  isDeleted: boolean;
  categoryId: string | null;
  categoryName: string | null;
  shopId: string | null;
  shopName: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### PagedWishlistResponseDto

```typescript
interface PagedWishlistResponseDto {
  items: WishlistItemDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```

### AddToWishlistDto

```typescript
interface AddToWishlistDto {
  productId: string;       // UUID
  note?: string;           // Optional note
}
```

---

## 10. Code Mẫu

### Complete Wishlist Service (TypeScript)

```typescript
import axios, { AxiosInstance } from 'axios';

interface WishlistItemDto {
  wishlistId: string;
  product: any;
  note: string | null;
  addedAt: string;
}

interface PagedWishlistResponseDto {
  items: WishlistItemDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

class WishlistService {
  private api: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:8080') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Auto add token to headers
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Thêm sản phẩm vào wishlist
   */
  async addToWishlist(productId: string, note?: string): Promise<WishlistItemDto> {
    const response = await this.api.post('/api/wishlist', {
      productId,
      note
    });
    return response.data.data;
  }

  /**
   * Lấy tất cả wishlist (không phân trang)
   */
  async getWishlist(): Promise<WishlistItemDto[]> {
    const response = await this.api.get('/api/wishlist');
    return response.data.data;
  }

  /**
   * Lấy wishlist với phân trang
   */
  async getWishlistPaged(page: number = 0, size: number = 20): Promise<PagedWishlistResponseDto> {
    const response = await this.api.get('/api/wishlist/paged', {
      params: { page, size }
    });
    return response.data.data;
  }

  /**
   * Xóa sản phẩm khỏi wishlist
   */
  async removeFromWishlist(productId: string): Promise<string> {
    const response = await this.api.delete(`/api/wishlist/${productId}`);
    return response.data.data;
  }

  /**
   * Xóa tất cả wishlist
   */
  async clearWishlist(): Promise<string> {
    const response = await this.api.delete('/api/wishlist');
    return response.data.data;
  }

  /**
   * Kiểm tra sản phẩm có trong wishlist không
   */
  async checkInWishlist(productId: string): Promise<boolean> {
    const response = await this.api.get(`/api/wishlist/check/${productId}`);
    return response.data.data.inWishlist;
  }

  /**
   * Đếm số lượng wishlist items
   */
  async getWishlistCount(): Promise<number> {
    const response = await this.api.get('/api/wishlist/count');
    return response.data.data.count;
  }

  /**
   * Cập nhật ghi chú
   */
  async updateNote(productId: string, note: string): Promise<WishlistItemDto> {
    const response = await this.api.put(`/api/wishlist/${productId}/note`, {
      note
    });
    return response.data.data;
  }
}

// Export singleton instance
export const wishlistService = new WishlistService();

export default WishlistService;
```

### React Hook - useWishlist

```typescript
import { useState, useEffect, useCallback } from 'react';
import { wishlistService } from './WishlistService';

interface UseWishlistReturn {
  items: WishlistItemDto[];
  count: number;
  loading: boolean;
  addToWishlist: (productId: string, note?: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  checkInWishlist: (productId: string) => Promise<boolean>;
  updateNote: (productId: string, note: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

export const useWishlist = (): UseWishlistReturn => {
  const [items, setItems] = useState<WishlistItemDto[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const [wishlistItems, wishlistCount] = await Promise.all([
        wishlistService.getWishlist(),
        wishlistService.getWishlistCount()
      ]);
      setItems(wishlistItems);
      setCount(wishlistCount);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshWishlist();
    }
  }, [refreshWishlist]);

  const addToWishlist = async (productId: string, note?: string) => {
    try {
      await wishlistService.addToWishlist(productId, note);
      await refreshWishlist();
    } catch (error) {
      throw error;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      await refreshWishlist();
    } catch (error) {
      throw error;
    }
  };

  const clearWishlist = async () => {
    try {
      await wishlistService.clearWishlist();
      setItems([]);
      setCount(0);
    } catch (error) {
      throw error;
    }
  };

  const checkInWishlist = async (productId: string) => {
    try {
      return await wishlistService.checkInWishlist(productId);
    } catch (error) {
      console.error('Failed to check wishlist:', error);
      return false;
    }
  };

  const updateNote = async (productId: string, note: string) => {
    try {
      await wishlistService.updateNote(productId, note);
      await refreshWishlist();
    } catch (error) {
      throw error;
    }
  };

  return {
    items,
    count,
    loading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    checkInWishlist,
    updateNote,
    refreshWishlist
  };
};
```

### React Component - WishlistButton

```typescript
import React, { useState, useEffect } from 'react';
import { wishlistService } from './WishlistService';

interface WishlistButtonProps {
  productId: string;
  onToggle?: (inWishlist: boolean) => void;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  productId, 
  onToggle 
}) => {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWishlist();
  }, [productId]);

  const checkWishlist = async () => {
    try {
      const isInWishlist = await wishlistService.checkInWishlist(productId);
      setInWishlist(isInWishlist);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (inWishlist) {
        await wishlistService.removeFromWishlist(productId);
        setInWishlist(false);
        onToggle?.(false);
      } else {
        await wishlistService.addToWishlist(productId);
        setInWishlist(true);
        onToggle?.(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
    >
      {loading ? '...' : inWishlist ? '❤️' : '🤍'}
      {inWishlist ? ' In Wishlist' : ' Add to Wishlist'}
    </button>
  );
};
```

### React Component - WishlistPage

```typescript
import React from 'react';
import { useWishlist } from './useWishlist';

export const WishlistPage: React.FC = () => {
  const {
    items,
    count,
    loading,
    removeFromWishlist,
    clearWishlist,
    updateNote
  } = useWishlist();

  const handleRemove = async (productId: string) => {
    if (confirm('Remove this item from wishlist?')) {
      try {
        await removeFromWishlist(productId);
      } catch (error) {
        alert('Failed to remove item');
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('Remove all items from wishlist?')) {
      try {
        await clearWishlist();
      } catch (error) {
        alert('Failed to clear wishlist');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="empty-wishlist">
        <h2>Your Wishlist is Empty</h2>
        <p>Start adding products you love!</p>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>My Wishlist ({count})</h1>
        <button onClick={handleClearAll} className="clear-all-btn">
          Clear All
        </button>
      </div>

      <div className="wishlist-items">
        {items.map((item) => (
          <div key={item.wishlistId} className="wishlist-item">
            <img 
              src={item.product.images[0]} 
              alt={item.product.name}
              className="product-image"
            />
            
            <div className="product-info">
              <h3>{item.product.name}</h3>
              <p className="brand">{item.product.brand}</p>
              <p className="shop">{item.product.shopName}</p>
              
              {item.note && (
                <p className="note">📝 {item.note}</p>
              )}
              
              <p className="added-date">
                Added: {new Date(item.addedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="actions">
              <button 
                onClick={() => handleRemove(item.product.id)}
                className="remove-btn"
              >
                🗑️ Remove
              </button>
              
              <button className="add-to-cart-btn">
                🛒 Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🎯 Use Cases Thực Tế

### 1. Nút Thêm/Xóa Wishlist Trên Product Card
```javascript
// Khi click vào icon trái tim
const handleWishlistToggle = async (productId) => {
  const isInWishlist = await wishlistService.checkInWishlist(productId);
  
  if (isInWishlist) {
    await wishlistService.removeFromWishlist(productId);
  } else {
    await wishlistService.addToWishlist(productId);
  }
  
  // Update UI
  updateWishlistIcon(productId, !isInWishlist);
};
```

### 2. Badge Hiển Thị Số Lượng Wishlist
```javascript
// Update badge number in header
const updateWishlistBadge = async () => {
  const count = await wishlistService.getWishlistCount();
  document.getElementById('wishlist-badge').textContent = count;
};

// Gọi sau khi add/remove
await wishlistService.addToWishlist(productId);
await updateWishlistBadge();
```

### 3. Trang Wishlist Với Phân Trang
```javascript
const loadWishlistPage = async (page = 0) => {
  const result = await wishlistService.getWishlistPaged(page, 12);
  
  renderWishlistItems(result.items);
  renderPagination(result);
};
```

### 4. Thêm Ghi Chú Khi Thêm Vào Wishlist
```javascript
const addWithNote = async (productId) => {
  const note = prompt('Add a note for this product (optional):');
  await wishlistService.addToWishlist(productId, note);
};
```

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Authentication
- Tất cả API yêu cầu JWT token hợp lệ
- Token phải có role USER hoặc ADMIN

### 2. Unique Constraint
- Một user chỉ có thể thêm một product vào wishlist một lần
- Nếu thêm lại sẽ báo lỗi "Product already in wishlist"

### 3. Soft Delete
- Sản phẩm đã xóa mềm vẫn có thể tồn tại trong wishlist
- Frontend nên kiểm tra `product.isDeleted` để ẩn/hiển thị

### 4. Performance
- Sử dụng pagination cho danh sách dài
- Cache wishlist count để giảm API calls

### 5. Error Handling
```javascript
try {
  await wishlistService.addToWishlist(productId);
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.response?.data?.message.includes('already in wishlist')) {
    alert('Product is already in your wishlist');
  } else {
    alert('Failed to add to wishlist');
  }
}
```

---

## 📝 Postman Collection

```json
{
  "info": {
    "name": "Wishlist APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Add to Wishlist",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"productId\": \"{{productId}}\",\n  \"note\": \"Mua khi có sale\"\n}"
        },
        "url": "{{baseUrl}}/api/wishlist"
      }
    },
    {
      "name": "Get Wishlist",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{baseUrl}}/api/wishlist"
      }
    },
    {
      "name": "Get Wishlist Paged",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/wishlist/paged?page=0&size=10",
          "query": [
            {"key": "page", "value": "0"},
            {"key": "size", "value": "10"}
          ]
        }
      }
    },
    {
      "name": "Remove from Wishlist",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{baseUrl}}/api/wishlist/{{productId}}"
      }
    },
    {
      "name": "Clear Wishlist",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{baseUrl}}/api/wishlist"
      }
    },
    {
      "name": "Check in Wishlist",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{baseUrl}}/api/wishlist/check/{{productId}}"
      }
    },
    {
      "name": "Get Wishlist Count",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{baseUrl}}/api/wishlist/count"
      }
    },
    {
      "name": "Update Note",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"note\": \"Mua trong đợt Black Friday\"\n}"
        },
        "url": "{{baseUrl}}/api/wishlist/{{productId}}/note"
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080"
    },
    {
      "key": "token",
      "value": "your_jwt_token_here"
    },
    {
      "key": "productId",
      "value": "123e4567-e89b-12d3-a456-426614174000"
    }
  ]
}
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE wishlists (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    product_id UUID NOT NULL REFERENCES products(id),
    note VARCHAR(500),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Indexes for better performance
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);
CREATE INDEX idx_wishlists_created_at ON wishlists(created_at DESC);
```

---

**Tài liệu được tạo bởi: Smart Mall Spring Boot Team**  
**Ngày cập nhật: 16/12/2025**
