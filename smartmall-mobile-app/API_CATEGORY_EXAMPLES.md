# API Category Examples - Smart Mall

Tài liệu này cung cấp các ví dụ API danh mục sản phẩm để test và sử dụng trong mobile app.

## 1. Lấy tất cả danh mục

**Endpoint**: `GET /api/categories`

**Query Parameters**:
- `status`: Lọc theo trạng thái (ACTIVE, INACTIVE) - optional

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": "category-uuid-1",
      "name": "Điện thoại",
      "description": "Điện thoại thông minh các hãng",
      "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/phone-icon.png",
      "image": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/phone-banner.jpg",
      "parentId": null,
      "level": 0,
      "order": 1,
      "productCount": 1250,
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:00:00",
      "updatedAt": "2024-11-20T15:30:00"
    },
    {
      "id": "category-uuid-2",
      "name": "Laptop",
      "description": "Máy tính xách tay, gaming, văn phòng",
      "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/laptop-icon.png",
      "image": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/laptop-banner.jpg",
      "parentId": null,
      "level": 0,
      "order": 2,
      "productCount": 850,
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:05:00",
      "updatedAt": "2024-11-20T15:30:00"
    },
    {
      "id": "category-uuid-3",
      "name": "Phụ kiện",
      "description": "Phụ kiện công nghệ",
      "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/accessory-icon.png",
      "image": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/accessory-banner.jpg",
      "parentId": null,
      "level": 0,
      "order": 3,
      "productCount": 3200,
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:10:00",
      "updatedAt": "2024-11-20T15:30:00"
    }
  ]
}
```

---

## 2. Lấy danh mục theo cấp bậc (Tree Structure)

**Endpoint**: `GET /api/categories/tree`

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Category tree retrieved successfully",
  "data": [
    {
      "id": "category-uuid-1",
      "name": "Điện thoại",
      "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/phone-icon.png",
      "level": 0,
      "productCount": 1250,
      "status": "ACTIVE",
      "children": [
        {
          "id": "category-uuid-1-1",
          "name": "iPhone",
          "parentId": "category-uuid-1",
          "level": 1,
          "productCount": 450,
          "status": "ACTIVE",
          "children": [
            {
              "id": "category-uuid-1-1-1",
              "name": "iPhone 15 Series",
              "parentId": "category-uuid-1-1",
              "level": 2,
              "productCount": 120,
              "status": "ACTIVE",
              "children": []
            },
            {
              "id": "category-uuid-1-1-2",
              "name": "iPhone 14 Series",
              "parentId": "category-uuid-1-1",
              "level": 2,
              "productCount": 180,
              "status": "ACTIVE",
              "children": []
            }
          ]
        },
        {
          "id": "category-uuid-1-2",
          "name": "Samsung",
          "parentId": "category-uuid-1",
          "level": 1,
          "productCount": 380,
          "status": "ACTIVE",
          "children": [
            {
              "id": "category-uuid-1-2-1",
              "name": "Galaxy S Series",
              "parentId": "category-uuid-1-2",
              "level": 2,
              "productCount": 150,
              "status": "ACTIVE",
              "children": []
            },
            {
              "id": "category-uuid-1-2-2",
              "name": "Galaxy Z Series",
              "parentId": "category-uuid-1-2",
              "level": 2,
              "productCount": 95,
              "status": "ACTIVE",
              "children": []
            }
          ]
        },
        {
          "id": "category-uuid-1-3",
          "name": "Xiaomi",
          "parentId": "category-uuid-1",
          "level": 1,
          "productCount": 280,
          "status": "ACTIVE",
          "children": []
        }
      ]
    },
    {
      "id": "category-uuid-2",
      "name": "Laptop",
      "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/laptop-icon.png",
      "level": 0,
      "productCount": 850,
      "status": "ACTIVE",
      "children": [
        {
          "id": "category-uuid-2-1",
          "name": "Laptop Gaming",
          "parentId": "category-uuid-2",
          "level": 1,
          "productCount": 320,
          "status": "ACTIVE",
          "children": []
        },
        {
          "id": "category-uuid-2-2",
          "name": "Laptop Văn Phòng",
          "parentId": "category-uuid-2",
          "level": 1,
          "productCount": 280,
          "status": "ACTIVE",
          "children": []
        },
        {
          "id": "category-uuid-2-3",
          "name": "MacBook",
          "parentId": "category-uuid-2",
          "level": 1,
          "productCount": 250,
          "status": "ACTIVE",
          "children": []
        }
      ]
    }
  ]
}
```

---

## 3. Lấy chi tiết danh mục

**Endpoint**: `GET /api/categories/{categoryId}`

**Path Parameters**:
- `categoryId`: UUID của category

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Category details retrieved successfully",
  "data": {
    "id": "category-uuid-1",
    "name": "Điện thoại",
    "description": "Điện thoại thông minh các hãng: iPhone, Samsung, Xiaomi, Oppo, Vivo,...",
    "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/phone-icon.png",
    "image": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/phone-banner.jpg",
    "parentId": null,
    "parent": null,
    "level": 0,
    "order": 1,
    "productCount": 1250,
    "status": "ACTIVE",
    "children": [
      {
        "id": "category-uuid-1-1",
        "name": "iPhone",
        "productCount": 450
      },
      {
        "id": "category-uuid-1-2",
        "name": "Samsung",
        "productCount": 380
      },
      {
        "id": "category-uuid-1-3",
        "name": "Xiaomi",
        "productCount": 280
      }
    ],
    "createdAt": "2024-01-15T10:00:00",
    "updatedAt": "2024-11-20T15:30:00"
  }
}
```

**Response Error (404 Not Found)**:
```json
{
  "success": false,
  "message": "Category not found",
  "data": null
}
```

---

## 4. Lấy danh mục cha (Parent Categories)

**Endpoint**: `GET /api/categories/parents`

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Parent categories retrieved successfully",
  "data": [
    {
      "id": "category-uuid-1",
      "name": "Điện thoại",
      "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/phone-icon.png",
      "productCount": 1250,
      "childrenCount": 3
    },
    {
      "id": "category-uuid-2",
      "name": "Laptop",
      "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/laptop-icon.png",
      "productCount": 850,
      "childrenCount": 3
    },
    {
      "id": "category-uuid-3",
      "name": "Phụ kiện",
      "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/accessory-icon.png",
      "productCount": 3200,
      "childrenCount": 5
    }
  ]
}
```

---

## 5. Lấy danh mục con (Children Categories)

**Endpoint**: `GET /api/categories/{categoryId}/children`

**Path Parameters**:
- `categoryId`: UUID của category cha

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Children categories retrieved successfully",
  "data": {
    "parentId": "category-uuid-1",
    "parentName": "Điện thoại",
    "children": [
      {
        "id": "category-uuid-1-1",
        "name": "iPhone",
        "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/iphone-icon.png",
        "productCount": 450,
        "status": "ACTIVE"
      },
      {
        "id": "category-uuid-1-2",
        "name": "Samsung",
        "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/samsung-icon.png",
        "productCount": 380,
        "status": "ACTIVE"
      },
      {
        "id": "category-uuid-1-3",
        "name": "Xiaomi",
        "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/xiaomi-icon.png",
        "productCount": 280,
        "status": "ACTIVE"
      }
    ]
  }
}
```

---

## 6. Lấy danh mục phổ biến (Popular Categories)

**Endpoint**: `GET /api/categories/popular`

**Query Parameters**:
- `limit`: Số lượng danh mục (default: 10)

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Popular categories retrieved successfully",
  "data": [
    {
      "id": "category-uuid-3",
      "name": "Phụ kiện",
      "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/accessory-icon.png",
      "productCount": 3200,
      "viewCount": 125000
    },
    {
      "id": "category-uuid-1",
      "name": "Điện thoại",
      "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/phone-icon.png",
      "productCount": 1250,
      "viewCount": 98000
    },
    {
      "id": "category-uuid-2",
      "name": "Laptop",
      "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/laptop-icon.png",
      "productCount": 850,
      "viewCount": 75000
    }
  ]
}
```

---

## 7. Tìm kiếm danh mục

**Endpoint**: `GET /api/categories/search`

**Query Parameters**:
- `keyword`: Từ khóa tìm kiếm (required)

**Request Example**:
```
GET /api/categories/search?keyword=phone
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Search results",
  "data": [
    {
      "id": "category-uuid-1",
      "name": "Điện thoại",
      "description": "Điện thoại thông minh các hãng",
      "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/phone-icon.png",
      "productCount": 1250,
      "level": 0
    },
    {
      "id": "category-uuid-1-1",
      "name": "iPhone",
      "description": "Điện thoại iPhone chính hãng",
      "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/iphone-icon.png",
      "productCount": 450,
      "level": 1,
      "parentName": "Điện thoại"
    }
  ]
}
```

---

## 8. Tạo danh mục mới (Admin Only)

**Endpoint**: `POST /api/categories`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Tablet",
  "description": "Máy tính bảng các loại",
  "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/tablet-icon.png",
  "image": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/tablet-banner.jpg",
  "parentId": null,
  "order": 4,
  "status": "ACTIVE"
}
```

**Response Success (201 Created)**:
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "category-uuid-new",
    "name": "Tablet",
    "description": "Máy tính bảng các loại",
    "icon": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/tablet-icon.png",
    "image": "https://res.cloudinary.com/smartmall/image/upload/v1/categories/tablet-banner.jpg",
    "parentId": null,
    "level": 0,
    "order": 4,
    "productCount": 0,
    "status": "ACTIVE",
    "createdAt": "2024-11-25T10:30:00"
  }
}
```

**Response Error (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Category name already exists",
  "data": null
}
```

---

## 9. Cập nhật danh mục (Admin Only)

**Endpoint**: `PUT /api/categories/{categoryId}`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Path Parameters**:
- `categoryId`: UUID của category

**Request Body**:
```json
{
  "name": "Điện thoại & Tablet",
  "description": "Điện thoại thông minh và máy tính bảng",
  "order": 1,
  "status": "ACTIVE"
}
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": "category-uuid-1",
    "name": "Điện thoại & Tablet",
    "description": "Điện thoại thông minh và máy tính bảng",
    "order": 1,
    "status": "ACTIVE",
    "updatedAt": "2024-11-25T11:00:00"
  }
}
```

---

## 10. Xóa danh mục (Admin Only)

**Endpoint**: `DELETE /api/categories/{categoryId}`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters**:
- `categoryId`: UUID của category

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": null
}
```

**Response Error (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Cannot delete category with existing products",
  "data": {
    "productCount": 1250
  }
}
```

---

## 11. Thay đổi trạng thái danh mục (Admin Only)

**Endpoint**: `PATCH /api/categories/{categoryId}/status`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "status": "INACTIVE"
}
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Category status updated successfully",
  "data": {
    "id": "category-uuid-1",
    "name": "Điện thoại",
    "status": "INACTIVE",
    "updatedAt": "2024-11-25T11:30:00"
  }
}
```

---

## 12. Sắp xếp lại danh mục (Admin Only)

**Endpoint**: `PUT /api/categories/reorder`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "categories": [
    {
      "id": "category-uuid-3",
      "order": 1
    },
    {
      "id": "category-uuid-1",
      "order": 2
    },
    {
      "id": "category-uuid-2",
      "order": 3
    }
  ]
}
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Categories reordered successfully",
  "data": null
}
```

---

## Testing với cURL

### 1. Lấy tất cả danh mục
```bash
curl -X GET "http://localhost:8080/api/categories"
```

### 2. Lấy cấu trúc cây danh mục
```bash
curl -X GET "http://localhost:8080/api/categories/tree"
```

### 3. Lấy chi tiết danh mục
```bash
curl -X GET "http://localhost:8080/api/categories/category-uuid-1"
```

### 4. Lấy danh mục con
```bash
curl -X GET "http://localhost:8080/api/categories/category-uuid-1/children"
```

### 5. Tìm kiếm danh mục
```bash
curl -X GET "http://localhost:8080/api/categories/search?keyword=phone"
```

### 6. Tạo danh mục mới
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tablet",
    "description": "Máy tính bảng",
    "status": "ACTIVE"
  }'
```

### 7. Cập nhật danh mục
```bash
curl -X PUT http://localhost:8080/api/categories/category-uuid-1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Điện thoại & Tablet",
    "status": "ACTIVE"
  }'
```

### 8. Xóa danh mục
```bash
curl -X DELETE http://localhost:8080/api/categories/category-uuid-1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## React Native Example

### Lấy tất cả danh mục
```javascript
const fetchCategories = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      setCategories(data.data);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};
```

### Lấy cấu trúc cây danh mục
```javascript
const fetchCategoryTree = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/categories/tree', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      setCategoryTree(data.data);
    }
  } catch (error) {
    console.error('Error fetching category tree:', error);
  }
};
```

### Lấy danh mục con
```javascript
const fetchChildCategories = async (parentId) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/categories/${parentId}/children`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const data = await response.json();
    if (data.success) {
      setChildCategories(data.data.children);
    }
  } catch (error) {
    console.error('Error fetching child categories:', error);
  }
};
```

### Component hiển thị danh mục
```javascript
const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => navigation.navigate('Products', { categoryId: item.id })}
    >
      <Image source={{ uri: item.icon }} style={styles.categoryIcon} />
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.productCount}>{item.productCount} sản phẩm</Text>
    </TouchableOpacity>
  );
  
  return (
    <FlatList
      data={categories}
      renderItem={renderCategory}
      keyExtractor={(item) => item.id}
      numColumns={3}
    />
  );
};
```

---

## Validation Rules

### Category
- `name`: Bắt buộc, 2-100 ký tự, unique
- `description`: Optional, tối đa 500 ký tự
- `icon`: Optional, URL hợp lệ
- `image`: Optional, URL hợp lệ
- `parentId`: Optional, phải tồn tại nếu có
- `order`: Optional, số nguyên >= 0
- `status`: ACTIVE hoặc INACTIVE

---

## Category Status

| Status | Mô tả |
|--------|-------|
| ACTIVE | Đang hoạt động |
| INACTIVE | Tạm ngưng |

---

## Category Levels

| Level | Mô tả | Ví dụ |
|-------|-------|-------|
| 0 | Danh mục gốc | Điện thoại, Laptop |
| 1 | Danh mục con cấp 1 | iPhone, Samsung |
| 2 | Danh mục con cấp 2 | iPhone 15 Series |
| 3 | Danh mục con cấp 3 | iPhone 15 Pro Max |

---

## Notes

1. **Tree Structure**: API hỗ trợ cấu trúc cây tối đa 4 cấp
2. **Product Count**: Tự động tính số sản phẩm trong danh mục
3. **Cascading**: Khi xóa danh mục cha, cần xử lý danh mục con
4. **Icons**: Khuyến nghị sử dụng icon SVG hoặc PNG 128x128px
5. **Banner**: Khuyến nghị kích thước 1200x400px
6. **Ordering**: Số thứ tự để sắp xếp hiển thị danh mục
7. **Popular**: Dựa trên số lượt xem và số sản phẩm
8. **Search**: Tìm kiếm theo tên và mô tả danh mục
9. **Status Change**: Khi INACTIVE, sản phẩm trong danh mục vẫn tồn tại nhưng không hiển thị
10. **Parent Validation**: Không thể set parent là chính nó hoặc con của nó
