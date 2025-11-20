# Quick Start Guide - Smart Mall Mobile App

## 🚀 Chạy ứng dụng

### 1. Khởi động Backend (Spring Boot)

```bash
cd smart-mall-spring
./gradlew bootRun
```

Backend sẽ chạy tại: `http://localhost:8080`

### 2. Cấu hình API URL

#### Cho Android Emulator:
File đã được cấu hình sẵn `10.0.2.2:8080` (trỏ đến localhost của máy host)

#### Cho iOS Simulator:
Mở `src/config/config.ts` và đổi thành:
```typescript
BASE_URL: 'http://localhost:8080/api'
```

#### Cho thiết bị thật:
1. Tìm IP máy tính:
   - Windows: `ipconfig` → tìm IPv4 Address
   - Mac/Linux: `ifconfig` → tìm inet

2. Cập nhật `src/config/config.ts`:
```typescript
BASE_URL: 'http://YOUR_IP:8080/api' // VD: http://192.168.1.5:8080/api
```

### 3. Chạy Mobile App

```bash
cd smartmall-mobile-app
npm start
```

Sau đó chọn:
- `a` - Run on Android
- `i` - Run on iOS
- `w` - Run on Web

## 📱 Tính năng đã hoàn thành

### ✅ Authentication
- Login với username/password
- Register tài khoản mới
- Google OAuth (cần config Client ID)
- Auto-redirect dựa trên auth state
- Persistent login state

### ✅ Home Screen
- **Search**: Tìm kiếm sản phẩm theo tên
- **Categories**: Hiển thị danh mục sản phẩm
- **Featured Products**: Sản phẩm nổi bật (top rating)
- **All Products**: Danh sách tất cả sản phẩm
- **Pull to Refresh**: Kéo xuống để reload
- **Product Card**: Hiển thị tên, giá, brand, rating, stock

### ✅ Profile Screen
- Hiển thị thông tin user
- Logout button
- Menu items (placeholder)

### ✅ UI Components
- `ProductCard` - Reusable product card component
- `Loading` - Loading spinner với message
- `EmptyState` - Empty state placeholder

## 🔧 Cấu trúc API

App đang fetch data từ các endpoints:

### Products
- `GET /api/products/all` - Lấy tất cả sản phẩm
- `GET /api/products/{id}` - Chi tiết sản phẩm
- `GET /api/products/search?name={name}` - Tìm kiếm

### Categories
- `GET /api/categories` - Lấy tất cả danh mục
- `GET /api/categories/active` - Danh mục đang hoạt động

### Cart (Cần login)
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart/add` - Thêm vào giỏ
- `PUT /api/cart/update` - Cập nhật số lượng
- `DELETE /api/cart/remove/{id}` - Xóa item

### Orders (Cần login)
- `GET /api/orders/user/{userId}` - Lấy đơn hàng
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders/{id}` - Chi tiết đơn hàng

## 🧪 Test Flow

### 1. Test Login
1. Mở app → Hiển thị Login screen
2. Nhập username/password
3. Click Login → Chuyển đến Home screen
4. Check Profile → Hiển thị user info

### 2. Test Home Screen
1. Pull to refresh → Reload products
2. Check categories list → Scroll horizontal
3. Check featured products → Top rated products
4. Scroll down → Xem all products grid
5. Search "áo" → Hiển thị kết quả tìm kiếm

### 3. Test Logout
1. Vào Profile tab
2. Click Logout
3. → Redirect về Login screen

## 📊 Dữ liệu mẫu cần có trong Backend

Để Home screen hiển thị đúng, backend cần có:

### Products
```sql
-- Ít nhất 5-10 products với:
- name, description, brand
- images[] (ít nhất 1 ảnh)
- variants[] (ít nhất 1 variant với price, stock)
- categoryId
- status = 'ACTIVE'
```

### Categories
```sql
-- Ít nhất 3-5 categories với:
- name, description
- isActive = true
```

### Users
```sql
-- Test account:
username: test
password: 123456
fullName: Test User
phoneNumber: 0123456789
```

## 🐛 Troubleshooting

### Lỗi kết nối API:
1. Check backend đang chạy: `http://localhost:8080/api/products/all`
2. Check API_CONFIG trong `src/config/config.ts`
3. Check firewall/antivirus

### Không hiển thị ảnh sản phẩm:
- Images cần là full URL: `http://domain.com/image.jpg`
- Hoặc dùng placeholder: `https://via.placeholder.com/200`

### Token expired:
- Logout và login lại
- Check JWT expiration time trong backend

## 🎨 Customization

### Thay đổi màu chủ đạo:
File: `src/screens/HomeScreen.tsx`
```typescript
// Tìm #6366f1 và thay bằng màu mới
color: '#6366f1' → color: '#YOUR_COLOR'
```

### Thay đổi layout:
```typescript
// Grid: 2 columns
const PRODUCT_WIDTH = (width - 48) / 2;

// Grid: 3 columns  
const PRODUCT_WIDTH = (width - 64) / 3;
```

## 📝 Next Steps

Theo thứ tự ưu tiên:

1. ✅ Home Screen - **DONE**
2. 🚧 Product Detail Screen
3. 🚧 Cart Screen
4. 🚧 Checkout Screen
5. 🚧 Orders Screen

---

**Happy Coding!** 🚀
