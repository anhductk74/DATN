# 🔔 Notification System - React Native Mobile App

## ✅ Đã Triển Khai

### 1. **NotificationService** (`src/services/notificationService.ts`)
- WebSocket connection với SockJS + STOMP
- Tự động reconnect khi mất kết nối
- REST API methods:
  - `getNotifications()` - Lấy danh sách thông báo
  - `getUnreadNotifications()` - Lấy thông báo chưa đọc
  - `getUnreadCount()` - Đếm số thông báo chưa đọc
  - `markAsRead(id)` - Đánh dấu đã đọc
  - `markAllAsRead()` - Đánh dấu tất cả đã đọc
  - `deleteNotification(id)` - Xóa thông báo
  - `deleteAllNotifications()` - Xóa tất cả

### 2. **NotificationContext** (`src/contexts/NotificationContext.tsx`)
- Global state management cho notifications
- Auto-connect WebSocket khi user login
- Real-time notification updates
- Custom hook: `useNotifications()`

### 3. **NotificationBell Component** (`src/components/NotificationBell.tsx`)
- Icon chuông với badge hiển thị số thông báo chưa đọc
- Modal hiển thị danh sách thông báo
- Swipe to delete (trong modal)
- Mark as read khi click
- Clear all notifications
- Responsive design

### 4. **Integration** (`src/navigation/AppNavigator.tsx`)
- Wrapped app với `NotificationProvider`
- Thêm `NotificationBell` vào header của:
  - MainTabs
  - Wishlist
  - OrderDetail
  - (Có thể thêm vào các screens khác)

---

## 🚀 Cách Sử Dụng

### 1. Cài đặt dependencies:
```bash
pnpm install
# hoặc
npm install
```

### 2. Cấu hình Environment Variables:
Trong file `.env` hoặc `app.json`, thêm:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 3. Chạy app:
```bash
pnpm start
# hoặc
npm start
```

---

## 📱 Tính Năng

### ✅ Real-time Notifications
- Tự động nhận thông báo qua WebSocket
- Hiển thị badge số lượng chưa đọc
- Âm thanh/진동 (có thể thêm)

### ✅ Notification Management
- Xem danh sách thông báo
- Đánh dấu đã đọc/chưa đọc
- Xóa từng thông báo
- Xóa tất cả thông báo
- Đọc tất cả thông báo

### ✅ UI/UX
- Modal notification list
- Pull to refresh
- Swipe to delete
- Unread indicator
- Connection status indicator (orange dot khi mất kết nối)

---

## 🔧 Customize

### Thêm NotificationBell vào screen khác:
```tsx
<Stack.Screen
  name="YourScreen"
  component={YourScreenComponent}
  options={{
    title: 'Your Title',
    headerShown: true,
    headerRight: () => <NotificationBell />,
  }}
/>
```

### Sử dụng useNotifications hook:
```tsx
import { useNotifications } from '../contexts/NotificationContext';

function YourComponent() {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Your logic here
}
```

### Handle Deep Links:
Trong `NotificationBell.tsx`, thêm navigation logic:
```tsx
const handleNotificationPress = async (notification: Notification) => {
  // Mark as read
  if (notification.status === 'UNREAD') {
    await markAsRead(notification.id);
  }

  // Navigate based on deepLink
  if (notification.deepLink) {
    const route = notification.deepLink.split('/')[1]; // e.g., "/orders/xxx" -> "orders"
    
    if (route === 'orders') {
      navigation.navigate('OrderDetail', { 
        orderId: notification.referenceId 
      });
    }
    // Add more routes as needed
  }
};
```

---

## 🎯 Notification Types

Backend hỗ trợ các loại notification sau:

| Type | Title | Description |
|------|-------|-------------|
| ORDER_CREATED | Đơn hàng mới | Đơn hàng được tạo |
| ORDER_CONFIRMED | Đơn hàng đã xác nhận | Shop xác nhận đơn |
| ORDER_SHIPPED | Đơn hàng đang giao | Đang vận chuyển |
| ORDER_DELIVERED | Đơn hàng đã giao | Giao hàng thành công |
| ORDER_CANCELLED | Đơn hàng đã hủy | Đơn hàng bị hủy |
| PAYMENT_SUCCESS | Thanh toán thành công | Thanh toán OK |
| PAYMENT_FAILED | Thanh toán thất bại | Thanh toán lỗi |

---

## 🐛 Troubleshooting

### WebSocket không kết nối:
1. Kiểm tra `EXPO_PUBLIC_API_BASE_URL` đã đúng chưa
2. Kiểm tra backend đang chạy
3. Kiểm tra CORS settings trong backend

### Không nhận notifications:
1. Kiểm tra user đã login chưa
2. Kiểm tra `userId` có đúng không
3. Kiểm tra token có hợp lệ không
4. Xem console logs để debug

### Badge không cập nhật:
1. Kiểm tra WebSocket connection status
2. Force refresh: pull down trong notification modal

---

## 📝 TODO (Tùy chọn)

- [ ] Push notifications (Expo Notifications)
- [ ] Local notifications
- [ ] Notification sounds
- [ ] Vibration on new notification
- [ ] Notification preferences
- [ ] Group notifications by type
- [ ] Search notifications

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Console logs trong terminal
2. Network tab trong React Native Debugger
3. Backend logs

---

**Happy Coding! 🚀**
