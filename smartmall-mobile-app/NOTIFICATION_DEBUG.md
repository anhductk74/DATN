# 🔍 Notification Debug Checklist

## 1. Kiểm tra AsyncStorage

Mở React Native Debugger hoặc sử dụng console:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Kiểm tra token
AsyncStorage.getItem('token').then(token => {
  console.log('🔑 Token:', token ? token.substring(0, 50) + '...' : 'NOT FOUND');
});

// Kiểm tra userInfo
AsyncStorage.getItem('userInfo').then(userInfo => {
  if (userInfo) {
    const user = JSON.parse(userInfo);
    console.log('👤 User ID:', user.id);
    console.log('👤 Username:', user.username);
  } else {
    console.log('❌ UserInfo NOT FOUND');
  }
});
```

## 2. Console Logs Expected

Khi app khởi động và user đã login, bạn sẽ thấy:

```
📦 Loading user info from AsyncStorage...
📦 UserInfo exists: true
📦 Token exists: true
👤 User ID: 8dad2009-aa75-455f-91ef-fcfbf830a0bf
🔑 Token (first 20 chars): eyJhbGciOiJIUzI1NiIs...
🔑 Setting new token: eyJhbGciOiJIUzI1NiIs...
🔌 Connecting to WebSocket... 8dad2009-aa75-455f-91ef-fcfbf830a0bf
🔌 Connecting to WebSocket with token: eyJhbGciOiJIUzI1NiIs...
🔌 STOMP: Web Socket Opened...
✅ WebSocket connected
🔌 Connection status: true
📡 Fetching notifications with token: eyJhbGciOiJIUzI1NiIs...
📬 Notifications response: { success: true, data: {...} }
📊 Unread count response: { count: 5 }
```

## 3. Nếu không thấy logs

### A. Token không tồn tại
```
⚠️ Missing userInfo or token in AsyncStorage
```
**Fix:** Login lại để lưu token

### B. Token hết hạn
```
❌ Error fetching notifications: Request failed with status code 401
```
**Fix:** Login lại để refresh token

### C. WebSocket không kết nối
```
❌ STOMP error: {...}
```
**Fix:** 
- Kiểm tra backend đang chạy
- Kiểm tra URL: `http://localhost:8080/ws/notifications`
- Kiểm tra CORS settings

## 4. Test Manual với Postman

### Get Notifications
```
GET http://localhost:8080/api/v1/notifications?page=0&size=20
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Unread Count
```
GET http://localhost:8080/api/v1/notifications/unread/count
Authorization: Bearer YOUR_TOKEN_HERE
```

Response expected:
```json
{
  "count": 5
}
```
hoặc
```json
{
  "data": {
    "count": 5
  }
}
```

## 5. Force Re-login

Nếu vẫn không hoạt động:

1. Clear AsyncStorage:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.clear().then(() => {
  console.log('✅ AsyncStorage cleared');
});
```

2. Restart app
3. Login lại
4. Xem console logs

## 6. Backend Checks

### Verify Token is Valid
```bash
# Decode JWT token (online: jwt.io)
# Check expiration time
```

### Check Backend Logs
```bash
# Tìm logs khi WebSocket connect
# Tìm logs khi call API notifications
```

### Test Backend WebSocket Endpoint
```bash
# Use test-notification.html
# Hoặc sử dụng WebSocket client
```

## 7. Network Debugging

### React Native Debugger
1. Bật network inspection
2. Xem các requests đến:
   - `GET /api/v1/notifications`
   - `GET /api/v1/notifications/unread/count`
3. Kiểm tra headers có `Authorization: Bearer ...` không

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Token invalid/expired | Login lại |
| 403 Forbidden | User không có quyền | Kiểm tra roles |
| 404 Not Found | API endpoint sai | Kiểm tra URL |
| Network Error | Backend không chạy | Start backend |
| WebSocket Error | CORS hoặc security | Check backend config |

## 8. Verify Environment Variables

Check `.env` file:
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

In ra trong code:
```javascript
console.log('🌍 API Base URL:', process.env.EXPO_PUBLIC_API_BASE_URL);
```

## 9. Test Notification Flow

1. **Login** → Token saved to AsyncStorage
2. **App loads NotificationContext** → Reads token from AsyncStorage
3. **Connect WebSocket** → Uses token in URL params
4. **Fetch initial notifications** → Uses token in headers
5. **Receive real-time notification** → Via WebSocket
6. **Click notification bell** → Fetch latest notifications

## 10. Quick Fix Commands

```bash
# Restart Metro bundler
pnpm start --reset-cache

# Clear cache and restart
pnpm start -- --clear

# Reinstall node_modules
rm -rf node_modules
pnpm install
```

---

**Next Steps:**
1. Run app
2. Check console logs
3. Note which step fails
4. Apply corresponding fix
