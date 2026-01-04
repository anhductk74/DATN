# WebSocket Service - Manager App

## 📦 Cài đặt

```bash
npm install react-hot-toast @stomp/stompjs sockjs-client
npm install -D @types/sockjs-client
```

## 🚀 Setup

### 1. Thêm ToastProvider vào layout

```tsx
// app/layout.tsx hoặc _app.tsx
import { ToastProvider } from '@/components/providers/ToastProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
```

### 2. Thêm WebSocketProvider vào app (sau khi user đăng nhập)

```tsx
// app/(dashboard)/layout.tsx
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';

export default function DashboardLayout({ children }) {
  return (
    <WebSocketProvider enabled={true}>
      {children}
    </WebSocketProvider>
  );
}
```

## 📡 Sử dụng

### Option 1: Tự động connect với hook

```tsx
'use client';

import { useWebSocket } from '@/hooks/useWebSocket';

export default function MyPage() {
  // Tự động connect khi component mount
  const { isConnected, disconnect, reconnect } = useWebSocket((message) => {
    console.log('Received:', message);
    
    // Custom logic dựa trên type
    switch (message.type) {
      case 'SHIPMENT_STATUS_UPDATE':
        // Refresh shipment list
        break;
      case 'SUB_STATUS_UPDATE':
        // Refresh sub-shipment
        break;
    }
  });

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={reconnect}>Reconnect</button>
    </div>
  );
}
```

### Option 2: Chỉ lắng nghe (không auto-connect)

```tsx
import { useWebSocketListener } from '@/hooks/useWebSocket';

export default function MyComponent() {
  useWebSocketListener((message) => {
    // Handle message
  });

  return <div>...</div>;
}
```

### Option 3: Sử dụng trực tiếp service

```tsx
import { webSocketService } from '@/services';

// Connect
webSocketService.connect();

// Listen
const removeListener = webSocketService.addListener((message) => {
  console.log(message);
});

// Cleanup
removeListener();
webSocketService.disconnect();
```

## 📨 Message Types

### SHIPMENT_STATUS_UPDATE
```typescript
{
  type: 'SHIPMENT_STATUS_UPDATE',
  shipmentOrderId: 'xxx',
  status: 'DELIVERED',
  message: 'Shipment has been delivered',
  timestamp: '2025-12-27T...'
}
```

### SUB_STATUS_UPDATE
```typescript
{
  type: 'SUB_STATUS_UPDATE',
  subShipmentId: 'xxx',
  shipmentOrderId: 'xxx',
  shipperId: 'xxx',
  status: 'IN_TRANSIT',
  message: 'Package is on the way',
  timestamp: '2025-12-27T...'
}
```

### STATUS_UPDATE
```typescript
{
  type: 'STATUS_UPDATE',
  entityId: 'xxx',
  entityType: 'SHIPMENT' | 'SUB_SHIPMENT' | 'ORDER',
  status: 'COMPLETED',
  message: 'Order completed',
  timestamp: '2025-12-27T...'
}
```

## 🎨 Notifications

Toast notifications sẽ tự động hiển thị ở góc dưới phải màn hình:

- **SHIPMENT_STATUS_UPDATE**: Green toast với icon 📦
- **SUB_STATUS_UPDATE**: Blue toast với icon 🚚
- **STATUS_UPDATE**: Default toast với icon tùy entityType

## ⚙️ Configuration

### Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### Custom Toast Options

Chỉnh sửa trong `ToastProvider.tsx`:

```tsx
toastOptions={{
  duration: 5000, // 5 seconds
  position: 'bottom-right',
  // ... other options
}}
```

## 🔧 Backend Topics

Service tự động subscribe vào:
- `/topic/subshipment-status` - Shipment và Sub-shipment updates
- `/topic/status-updates` - General status updates

## 🐛 Debugging

Enable debug logs:

```tsx
// WebSocketService.ts
debug: (str) => {
  console.log('🔍 STOMP Debug:', str);
}
```

## 🔒 Authentication

Token được tự động lấy từ `localStorage`:
- `accessToken`
- `token`

Đảm bảo đã lưu token sau khi login.

## 📝 Notes

- WebSocket tự động reconnect tối đa 5 lần khi bị disconnect
- Delay giữa các reconnect attempts tăng dần (3s, 6s, 9s, 12s, 15s)
- Toast notifications tự động tắt sau 5 giây
- Service dùng SockJS để tương thích với Spring Boot backend
