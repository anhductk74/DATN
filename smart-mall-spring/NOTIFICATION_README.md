# 🔔 Notification System Quick Start

## ✅ Đã Hoàn Thành

### Backend Implementation
- ✅ WebSocket configuration với STOMP protocol
- ✅ Notification Entity & Repository
- ✅ NotificationService (async sending)
- ✅ NotificationController (REST API)
- ✅ Integration với OrderService
- ✅ 20+ notification types hỗ trợ

### Tự động gửi thông báo khi:
1. **User đặt hàng** → Gửi cho user "Đặt hàng thành công"
2. **User đặt hàng** → Gửi cho shop "Có đơn hàng mới"
3. **Shop cập nhật trạng thái** → Gửi cho user theo từng trạng thái:
   - `CONFIRMED` → "Đơn hàng đã xác nhận"
   - `SHIPPING` → "Đơn hàng đang giao"
   - `DELIVERED` → "Đơn hàng đã giao"
   - `CANCELLED` → "Đơn hàng đã hủy"
   - `COMPLETED` → "Đơn hàng hoàn thành"

---

## 🚀 Testing

### 1. Chạy Backend
```bash
./gradlew bootRun
```

### 2. Test WebSocket (Browser Console)
```javascript
const socket = new SockJS('http://localhost:8080/ws/notifications');
const client = Stomp.over(socket);

client.connect({}, () => {
  console.log('✅ Connected');
  
  // Thay YOUR_USER_ID bằng UUID thật của user
  const userId = 'YOUR_USER_ID';
  
  client.subscribe(`/user/${userId}/queue/notifications`, (message) => {
    console.log('📩 Notification:', JSON.parse(message.body));
  });
});
```

### 3. Tạo đơn hàng test
```bash
POST http://localhost:8080/api/orders
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "userId": "user-uuid",
  "shopId": "shop-uuid",
  "shippingAddressId": "address-uuid",
  "paymentMethod": "COD",
  "items": [...]
}
```

→ Ngay sau khi đặt hàng, bạn sẽ nhận được notification qua WebSocket!

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | Lấy tất cả notifications |
| GET | `/api/v1/notifications/unread` | Lấy notifications chưa đọc |
| GET | `/api/v1/notifications/unread/count` | Đếm notifications chưa đọc |
| PUT | `/api/v1/notifications/{id}/read` | Đánh dấu đã đọc |
| PUT | `/api/v1/notifications/read-all` | Đánh dấu tất cả đã đọc |
| DELETE | `/api/v1/notifications/{id}` | Xóa notification |
| DELETE | `/api/v1/notifications/all` | Xóa tất cả |

---

## 🎯 WebSocket Connection

**Endpoint:** `ws://localhost:8080/ws/notifications`

**Subscribe to:** `/user/{userId}/queue/notifications`

---

## 📚 Chi Tiết

Xem file **[NOTIFICATION_INTEGRATION_GUIDE.md](./NOTIFICATION_INTEGRATION_GUIDE.md)** để biết:
- Hướng dẫn tích hợp frontend đầy đủ
- React/Vue/React Native examples
- UI best practices
- Error handling
- Troubleshooting

---

## 🔧 Mở Rộng

Để thêm notification type mới:

1. **Thêm vào NotificationType.java:**
```java
PRODUCT_APPROVED("Sản phẩm được duyệt", "Sản phẩm của bạn đã được phê duyệt")
```

2. **Gửi notification trong Service:**
```java
notificationService.createAndSendNotification(
    NotificationRequestDto.builder()
        .userId(userId)
        .type(NotificationType.PRODUCT_APPROVED)
        .title(NotificationType.PRODUCT_APPROVED.getTitle())
        .message("Custom message")
        .referenceId(productId)
        .referenceType("PRODUCT")
        .build()
);
```

---

## 📝 Database Migration

Chạy migration để tạo bảng `notifications`:

```sql
CREATE TABLE notifications (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    reference_id BINARY(16),
    reference_type VARCHAR(50),
    metadata TEXT,
    image_url VARCHAR(500),
    deep_link VARCHAR(500),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_created_at (created_at)
);
```

---

**Happy Coding! 🚀**
