# 🔍 API Tìm Kiếm Sản Phẩm Bằng Hình Ảnh

## 📌 Mô tả
API sử dụng Gemini AI để phân tích hình ảnh và tìm kiếm các sản phẩm tương tự trong cơ sở dữ liệu dựa trên:
- Loại sản phẩm
- Thương hiệu
- Màu sắc
- Danh mục
- Đặc điểm và phong cách

---

## 🔗 Endpoint
```
POST /ai_search_by_image
```

---

## 📥 Request

### Headers
```
Content-Type: multipart/form-data
```

### Body Parameters (form-data)

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `search_image` | File | ✅ Yes | Ảnh sản phẩm cần tìm (JPG, PNG) |
| `max_results` | Integer | ❌ No | Số lượng kết quả tối đa (mặc định: 10) |
| `category_filter` | String | ❌ No | Lọc theo danh mục cụ thể |

---

## 📤 Response

### Success Response (200 OK)
```json
{
  "success": true,
  "search_analysis": {
    "product_type": "điện thoại",
    "category": "Electronics",
    "brand": "Samsung",
    "color": "đen",
    "key_features": [
      "màn hình lớn",
      "camera chất lượng cao",
      "thiết kế hiện đại"
    ],
    "style": "modern",
    "material": "kim loại và kính",
    "price_range": "premium",
    "search_keywords": [
      "smartphone",
      "android",
      "flagship"
    ]
  },
  "total_matches": 5,
  "products": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Samsung Galaxy S23 Ultra",
      "image": "https://res.cloudinary.com/image/upload/product123.jpg",
      "minPrice": 25000000,
      "maxPrice": 30000000,
      "brand": "Samsung",
      "rating": 4.8,
      "reviewCount": 1250,
      "shopName": "Mobile World",
      "category": "Electronics",
      "link": "http://localhost:3000/product/550e8400-e29b-41d4-a716-446655440000",
      "matchScore": 85,
      "matchReasons": [
        "Cùng thương hiệu: Samsung",
        "Cùng danh mục: Electronics",
        "Màu sắc: đen",
        "Khớp 3 từ khóa"
      ]
    }
  ],
  "timestamp": "2025-12-13T10:30:45.123456"
}
```

### Error Response (400/500)
```json
{
  "error": "Missing search_image file"
}
```

---

## 💡 Ví dụ sử dụng

### 1️⃣ cURL
```bash
curl -X POST http://localhost:5001/ai_search_by_image \
  -F "search_image=@/path/to/product.jpg" \
  -F "max_results=5" \
  -F "category_filter=Electronics"
```

### 2️⃣ Python (requests)
```python
import requests

url = "http://localhost:5001/ai_search_by_image"

# Mở file ảnh
with open("product_image.jpg", "rb") as image_file:
    files = {
        'search_image': image_file
    }
    data = {
        'max_results': 10,
        'category_filter': 'Electronics'
    }
    
    response = requests.post(url, files=files, data=data)
    result = response.json()
    
    if result['success']:
        print(f"Phân tích: {result['search_analysis']}")
        print(f"Tìm thấy {result['total_matches']} sản phẩm:")
        
        for product in result['products']:
            print(f"- {product['name']} (Điểm: {product['matchScore']})")
            print(f"  Lý do: {', '.join(product['matchReasons'])}")
```

### 3️⃣ JavaScript (Fetch API)
```javascript
const formData = new FormData();
const fileInput = document.querySelector('#imageInput');

formData.append('search_image', fileInput.files[0]);
formData.append('max_results', 10);
formData.append('category_filter', 'Electronics');

fetch('http://localhost:5001/ai_search_by_image', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Phân tích:', data.search_analysis);
    console.log('Sản phẩm tìm thấy:', data.products);
    
    data.products.forEach(product => {
      console.log(`${product.name} - Điểm khớp: ${product.matchScore}`);
      console.log('Lý do:', product.matchReasons);
    });
  }
})
.catch(error => console.error('Lỗi:', error));
```

### 4️⃣ React Example
```jsx
import { useState } from 'react';

function ImageSearch() {
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('search_image', file);
    formData.append('max_results', 10);

    try {
      const response = await fetch('http://localhost:5001/ai_search_by_image', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Tìm kiếm sản phẩm bằng hình ảnh</h2>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload}
        disabled={loading}
      />
      
      {loading && <p>Đang phân tích ảnh...</p>}
      
      {searchResults?.success && (
        <div>
          <h3>Phân tích ảnh:</h3>
          <p>Loại: {searchResults.search_analysis.product_type}</p>
          <p>Thương hiệu: {searchResults.search_analysis.brand}</p>
          <p>Màu sắc: {searchResults.search_analysis.color}</p>
          
          <h3>Sản phẩm tương tự ({searchResults.total_matches}):</h3>
          {searchResults.products.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.name} />
              <h4>{product.name}</h4>
              <p>Điểm khớp: {product.matchScore}/100</p>
              <p>Giá: {product.minPrice.toLocaleString()} - {product.maxPrice.toLocaleString()} VNĐ</p>
              <p>Lý do: {product.matchReasons.join(', ')}</p>
              <a href={product.link}>Xem chi tiết</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageSearch;
```

---

## 🎯 Cách hoạt động

### Bước 1: Phân tích hình ảnh
API sử dụng **Gemini 2.0 Flash** để phân tích ảnh và trích xuất:
- Loại sản phẩm (điện thoại, laptop, giày...)
- Danh mục (Electronics, Fashion, Beauty...)
- Thương hiệu (nếu nhận diện được)
- Màu sắc chính
- Đặc điểm nổi bật
- Phong cách (modern, classic, sporty...)
- Chất liệu
- Mức giá ước tính
- Từ khóa tìm kiếm

### Bước 2: Tính điểm khớp
Mỗi sản phẩm được chấm điểm dựa trên:

| Tiêu chí | Điểm |
|----------|------|
| Cùng danh mục | +30 |
| Cùng thương hiệu | +25 |
| Cùng loại sản phẩm | +20 |
| Cùng màu sắc | +15 |
| Cùng phong cách | +10 |
| Mỗi từ khóa khớp | +5 |

### Bước 3: Sắp xếp kết quả
Sản phẩm được sắp xếp theo điểm khớp từ cao xuống thấp và trả về số lượng theo `max_results`.

---

## 📊 Ví dụ kết quả thực tế

### Input: Ảnh điện thoại Samsung màu đen

**Phân tích AI:**
```json
{
  "product_type": "điện thoại thông minh",
  "category": "Electronics",
  "brand": "Samsung",
  "color": "đen",
  "key_features": ["màn hình lớn", "camera chất lượng"],
  "style": "modern",
  "price_range": "premium"
}
```

**Top 3 sản phẩm tìm được:**
1. **Samsung Galaxy S23 Ultra** - Điểm: 85
   - Lý do: Cùng thương hiệu + Cùng danh mục + Màu sắc khớp
   
2. **Samsung Galaxy S22** - Điểm: 75
   - Lý do: Cùng thương hiệu + Cùng danh mục
   
3. **iPhone 15 Pro Max** - Điểm: 45
   - Lý do: Cùng danh mục + Loại sản phẩm tương tự

---

## ⚠️ Lưu ý

1. **Kích thước ảnh**: Nên tối ưu ảnh < 5MB để xử lý nhanh hơn
2. **Định dạng**: Hỗ trợ JPG, PNG, WEBP
3. **Chất lượng**: Ảnh rõ nét, góc chụp tốt cho kết quả chính xác hơn
4. **Timeout**: API có timeout 20s cho Gemini analysis
5. **Cache**: Dữ liệu sản phẩm được cache 15 phút

---

## 🔧 Tùy chỉnh

### Điều chỉnh thuật toán chấm điểm
Sửa trong hàm `ai_search_by_image()`:

```python
# Check category match
if analysis_result.get('category'):
    category_keywords = analysis_result['category'].lower()
    if category_keywords in product_category:
        score += 30  # ← Thay đổi điểm số ở đây
```

### Thêm filter mới
Thêm tham số trong request và logic filter:

```python
# Get optional parameters
price_min = request.form.get('price_min', None)
price_max = request.form.get('price_max', None)

# Apply price filter
if price_min and safe_float(info.get('min_price')) < float(price_min):
    continue
```

---

## 🚀 Performance Tips

1. **Tối ưu database query**: Index các cột `category_name`, `brand`, `name`
2. **Resize ảnh trước khi upload**: Giảm kích thước để tăng tốc
3. **Cache kết quả**: Lưu cache kết quả phân tích cho ảnh tương tự
4. **Batch processing**: Xử lý nhiều ảnh cùng lúc

---

## 📞 Hỗ trợ

- Email: support@smartmall.com
- Docs: https://docs.smartmall.com/api/search-by-image
- GitHub: https://github.com/smartmall/api-gemini
