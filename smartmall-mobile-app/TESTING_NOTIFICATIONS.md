# 🧪 Testing Notification System

## 🚀 Quick Start

### 1. Start Backend
```bash
# Đảm bảo backend đang chạy tại http://localhost:8080
./gradlew bootRun
```

### 2. Start React Native App
```bash
cd d:\DATN\smartmall-mobile-app
pnpm start
```

### 3. Login to App
- Đăng nhập với tài khoản test
- App sẽ tự động connect WebSocket

---

## 📱 Test Scenarios

### ✅ Scenario 1: Test WebSocket Connection
1. Mở app và login
2. Xem console logs, tìm: `✅ WebSocket connected`
3. Nhìn vào icon chuông ở header:
   - Không có chấm cam = Connected ✅
   - Có chấm cam = Disconnected ⚠️

### ✅ Scenario 2: Nhận Real-time Notification
1. Đăng nhập trên app
2. Tạo đơn hàng mới (từ app hoặc Postman):
```bash
POST http://localhost:8080/api/orders
Content-Type: application/json
Authorization: Bearer {YOUR_TOKEN}

{
  "userId": "your-user-id",
  "shopId": "shop-id",
  "shippingAddressId": "address-id",
  "paymentMethod": "COD",
  "items": [...]
}
```
3. Ngay lập tức, notification sẽ xuất hiện:
   - Badge number tăng lên
   - Console log: `📩 Received notification`

### ✅ Scenario 3: Xem Danh Sách Notifications
1. Click vào icon chuông
2. Modal hiển thị danh sách notifications
3. Pull to refresh để tải lại

### ✅ Scenario 4: Đánh Dấu Đã Đọc
1. Mở modal notifications
2. Click vào một notification chưa đọc (màu xanh nhạt)
3. Notification chuyển sang trạng thái đã đọc (màu trắng)
4. Badge number giảm xuống

### ✅ Scenario 5: Xóa Notification
1. Mở modal notifications
2. Click vào icon X bên phải notification
3. Confirm xóa
4. Notification biến mất

### ✅ Scenario 6: Đọc Tất Cả
1. Mở modal notifications
2. Click "Đọc tất cả" ở header
3. Tất cả notifications chuyển sang đã đọc
4. Badge về 0

### ✅ Scenario 7: Xóa Tất Cả
1. Mở modal notifications
2. Click icon thùng rác ở header
3. Confirm xóa
4. Tất cả notifications biến mất

---

## 🔍 Debug Commands

### Kiểm tra WebSocket Endpoint
```bash
# Test WebSocket connection
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  http://localhost:8080/ws/notifications
```

### Test REST API
```bash
# Get all notifications
curl -H "Authorization: Bearer {TOKEN}" \
  http://localhost:8080/api/v1/notifications

# Get unread count
curl -H "Authorization: Bearer {TOKEN}" \
  http://localhost:8080/api/v1/notifications/unread/count

# Mark as read
curl -X PUT -H "Authorization: Bearer {TOKEN}" \
  http://localhost:8080/api/v1/notifications/{NOTIF_ID}/read

# Mark all as read
curl -X PUT -H "Authorization: Bearer {TOKEN}" \
  http://localhost:8080/api/v1/notifications/read-all
```

---

## 🐛 Common Issues

### Issue 1: Badge không hiển thị
**Nguyên nhân:** WebSocket chưa connected
**Fix:**
1. Kiểm tra backend đang chạy
2. Kiểm tra `EXPO_PUBLIC_API_BASE_URL` trong `.env`
3. Restart app

### Issue 2: Không nhận notification mới
**Nguyên nhân:** userId không đúng hoặc token hết hạn
**Fix:**
1. Logout và login lại
2. Kiểm tra AsyncStorage có lưu đúng userId không:
```javascript
AsyncStorage.getItem('userInfo').then(console.log);
```

### Issue 3: WebSocket disconnected liên tục
**Nguyên nhân:** Network issue hoặc backend restart
**Fix:**
- Service sẽ tự động reconnect sau 5 giây
- Nếu không, restart app

---

## 📊 Expected Console Logs

### Khi app khởi động:
```
🔌 Connecting to WebSocket... {userId}
🔌 STOMP: Connected to server
✅ WebSocket connected
```

### Khi nhận notification:
```
🔌 STOMP: <<< MESSAGE
destination:/user/{userId}/queue/notifications
📩 New notification: { id: '...', title: '...', ... }
📩 Received notification: { ... }
```

### Khi mất kết nối:
```
🔌 WebSocket connection closed
⚠️ Attempting reconnect in 5s...
```

---

## 🎯 Manual Test Notification

### Sử dụng Backend Admin API:
```bash
POST http://localhost:8080/api/v1/notifications/admin/create
Content-Type: application/json
Authorization: Bearer {ADMIN_TOKEN}

{
  "userId": "user-uuid",
  "type": "SYSTEM_ANNOUNCEMENT",
  "title": "Test Notification",
  "message": "This is a test notification from admin",
  "imageUrl": null,
  "deepLink": null
}
```

---

## 📝 Checklist

- [ ] WebSocket connects successfully after login
- [ ] Badge shows correct unread count
- [ ] New notifications appear in real-time
- [ ] Clicking notification marks it as read
- [ ] Badge decreases when marking as read
- [ ] "Mark all as read" works
- [ ] Delete notification works
- [ ] Clear all notifications works
- [ ] Pull to refresh works
- [ ] Connection status indicator works
- [ ] Notifications persist after app restart (if backend stores them)

---

**Happy Testing! 🎉**
