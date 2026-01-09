# 🔔 WebSocket Notification System - Frontend Integration Guide

## 📋 Tổng quan

Hệ thống thông báo real-time sử dụng **WebSocket** với **STOMP protocol** để gửi thông báo tức thì cho người dùng. Hệ thống hỗ trợ:

- ✅ Thông báo đơn hàng (order notifications)
- ✅ Thông báo cho shop (shop notifications)  
- ✅ Thông báo từ admin (system notifications)
- ✅ Lưu trữ notification history trong database
- ✅ Đánh dấu đã đọc/chưa đọc
- ✅ REST API để quản lý notifications

---

## 🔗 WebSocket Connection

### **Endpoint**
```
ws://your-domain.com/ws/notifications
```

### **Protocols**
- **Native WebSocket**: `/ws/notifications`
- **SockJS Fallback**: `/ws/notifications` (tự động fallback cho browsers không hỗ trợ WebSocket)

---

## 🚀 Quick Start

### **1. Web App (JavaScript/TypeScript)**

#### Cài đặt dependencies:
```bash
npm install sockjs-client @stomp/stompjs
```

#### Kết nối WebSocket:
```typescript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class NotificationService {
  private stompClient: Client | null = null;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  connect(onMessageReceived: (notification: any) => void) {
    const socket = new SockJS('http://localhost:8080/ws/notifications');
    
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log('✅ WebSocket Connected');
        
        // Subscribe to user-specific notifications
        this.stompClient?.subscribe(
          `/user/${this.userId}/queue/notifications`,
          (message) => {
            const notification = JSON.parse(message.body);
            onMessageReceived(notification);
          }
        );
      },
      
      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame);
      },
      
      onWebSocketClose: () => {
        console.log('🔌 WebSocket Disconnected');
      }
    });

    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log('👋 Disconnected from WebSocket');
    }
  }
}

// Usage
const userId = 'your-user-uuid';
const notificationService = new NotificationService(userId);

notificationService.connect((notification) => {
  console.log('🔔 New notification:', notification);
  
  // Show toast/banner
  showToast(notification.title, notification.message);
  
  // Update notification badge
  updateNotificationBadge();
});
```

---

### **2. React Integration**

#### Custom Hook: `useNotifications.ts`
```typescript
import { useEffect, useState, useCallback, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  status: 'UNREAD' | 'READ';
  referenceId?: string;
  referenceType?: string;
  imageUrl?: string;
  deepLink?: string;
  createdAt: string;
}

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);

  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
    
    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.imageUrl || '/logo.png',
      });
    }
  }, []);

  const connect = useCallback(() => {
    if (!userId) return;

    const socket = new SockJS('http://localhost:8080/ws/notifications');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      
      onConnect: () => {
        console.log('✅ Connected to notification service');
        setIsConnected(true);
        
        client.subscribe(
          `/user/${userId}/queue/notifications`,
          (message) => {
            const notification = JSON.parse(message.body);
            handleNewNotification(notification);
          }
        );
      },
      
      onStompError: (error) => {
        console.error('❌ WebSocket Error:', error);
        setIsConnected(false);
      },
      
      onWebSocketClose: () => {
        console.log('🔌 WebSocket Closed');
        setIsConnected(false);
      }
    });

    client.activate();
    stompClientRef.current = client;
  }, [userId, handleNewNotification]);

  const disconnect = useCallback(() => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    // Request browser notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    notifications,
    unreadCount,
    isConnected,
    connect,
    disconnect,
  };
};
```

#### Component Usage:
```tsx
import React from 'react';
import { useNotifications } from './hooks/useNotifications';
import { useAuth } from './hooks/useAuth'; // Your auth hook

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, isConnected } = useNotifications(user?.id);

  return (
    <div className="notification-bell">
      <button className="relative">
        <BellIcon className={isConnected ? 'text-blue-500' : 'text-gray-400'} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationBell;
```

---

### **3. Next.js Integration**

#### **App Router (Next.js 13+)**

##### Client Component Hook: `hooks/useNotifications.ts`
```typescript
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  status: 'UNREAD' | 'READ';
  referenceId?: string;
  referenceType?: string;
  imageUrl?: string;
  deepLink?: string;
  createdAt: string;
}

export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);

  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
    
    // Show browser notification
    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.imageUrl || '/logo.png',
      });
    }
  }, []);

  const connect = useCallback(() => {
    if (!userId || typeof window === 'undefined') return;

    const socket = new SockJS('http://localhost:8080/ws/notifications');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      
      onConnect: () => {
        console.log('✅ Connected to notification service');
        setIsConnected(true);
        
        client.subscribe(
          `/user/${userId}/queue/notifications`,
          (message) => {
            const notification = JSON.parse(message.body);
            handleNewNotification(notification);
          }
        );
      },
      
      onStompError: (error) => {
        console.error('❌ WebSocket Error:', error);
        setIsConnected(false);
      },
      
      onWebSocketClose: () => {
        console.log('🔌 WebSocket Closed');
        setIsConnected(false);
      }
    });

    client.activate();
    stompClientRef.current = client;
  }, [userId, handleNewNotification]);

  const disconnect = useCallback(() => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Request browser notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    notifications,
    unreadCount,
    isConnected,
    connect,
    disconnect,
  };
};
```

##### Context Provider: `providers/NotificationProvider.tsx`
```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ 
  children: React.ReactNode;
  userId?: string;
}> = ({ children, userId }) => {
  const { notifications, unreadCount, isConnected } = useNotifications(userId);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  };

  const markAllAsRead = async () => {
    await fetch('/api/notifications/read-all', {
      method: 'PUT',
    });
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      isConnected,
      markAsRead,
      markAllAsRead 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};
```

##### Root Layout: `app/layout.tsx`
```typescript
import { NotificationProvider } from '@/providers/NotificationProvider';
import { auth } from '@/lib/auth'; // Your auth function

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  return (
    <html lang="en">
      <body>
        <NotificationProvider userId={session?.user?.id}>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
```

##### Client Component: `components/NotificationBell.tsx`
```typescript
'use client';

import { useNotificationContext } from '@/providers/NotificationProvider';
import { Bell } from 'lucide-react';

export const NotificationBell = () => {
  const { unreadCount, isConnected } = useNotificationContext();

  return (
    <button className="relative">
      <Bell className={isConnected ? 'text-blue-500' : 'text-gray-400'} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};
```

##### API Route: `app/api/notifications/[id]/read/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.cookies.get('token')?.value;
  
  const response = await fetch(
    `http://localhost:8080/api/v1/notifications/${params.id}/read`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  return NextResponse.json(await response.json());
}
```

---

#### **Pages Router (Next.js 12 or below)**

##### Component: `components/NotificationBell.tsx`
```typescript
import { useNotifications } from '@/hooks/useNotifications';
import { useSession } from 'next-auth/react';

export const NotificationBell = () => {
  const { data: session } = useSession();
  const { unreadCount, isConnected } = useNotifications(session?.user?.id);

  return (
    <button className="relative">
      <span className={isConnected ? 'text-blue-500' : 'text-gray-400'}>🔔</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs">
          {unreadCount}
        </span>
      )}
    </button>
  );
};
```

##### Page: `pages/_app.tsx`
```typescript
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { NotificationProvider } from '@/providers/NotificationProvider';

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <NotificationProvider>
        <Component {...pageProps} />
      </NotificationProvider>
    </SessionProvider>
  );
}
```

---

#### **Next.js Best Practices**

##### 1. **Environment Variables** (`.env.local`)
```bash
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws/notifications
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

##### 2. **TypeScript Config for WebSocket**
```json
// tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "types": ["sockjs-client"]
  }
}
```

##### 3. **Dynamic Import (Optional)**
```typescript
'use client';

import dynamic from 'next/dynamic';

const NotificationBell = dynamic(
  () => import('@/components/NotificationBell'),
  { ssr: false }
);

export default NotificationBell;
```

##### 4. **Error Boundary**
```typescript
'use client';

import { Component, ReactNode } from 'react';

export class NotificationErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Notification Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return <div>Notifications unavailable</div>;
    }

    return this.props.children;
  }
}
```

---

#### **Server-Side Rendering Considerations**

**❌ Don't:**
```typescript
// This will cause errors during SSR
const socket = new SockJS('...');  // ❌ window is undefined
```

**✅ Do:**
```typescript
useEffect(() => {
  if (typeof window === 'undefined') return;  // ✅ Check for browser
  
  const socket = new SockJS('...');
  // ... rest of code
}, []);
```

---

### **4. Vue.js Integration**

#### Composable: `useNotifications.ts`
```typescript
import { ref, onMounted, onUnmounted } from 'vue';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export const useNotifications = (userId: string) => {
  const notifications = ref([]);
  const unreadCount = ref(0);
  const isConnected = ref(false);
  let stompClient: Client | null = null;

  const connect = () => {
    const socket = new SockJS('http://localhost:8080/ws/notifications');
    
    stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      
      onConnect: () => {
        console.log('✅ Connected');
        isConnected.value = true;
        
        stompClient?.subscribe(
          `/user/${userId}/queue/notifications`,
          (message) => {
            const notification = JSON.parse(message.body);
            notifications.value.unshift(notification);
            unreadCount.value++;
          }
        );
      },
      
      onStompError: (error) => {
        console.error('❌ Error:', error);
        isConnected.value = false;
      }
    });

    stompClient.activate();
  };

  const disconnect = () => {
    stompClient?.deactivate();
  };

  onMounted(() => {
    connect();
  });

  onUnmounted(() => {
    disconnect();
  });

  return {
    notifications,
    unreadCount,
    isConnected,
  };
};
```

---

### **4. React Native (Mobile)**

```typescript
import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import PushNotification from 'react-native-push-notification';

export const useNotifications = (userId: string) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socket = new SockJS('http://your-api.com/ws/notifications');
    const client = new Client({
      webSocketFactory: () => socket,
      
      onConnect: () => {
        client.subscribe(
          `/user/${userId}/queue/notifications`,
          (message) => {
            const notification = JSON.parse(message.body);
            
            // Show local push notification
            PushNotification.localNotification({
              title: notification.title,
              message: notification.message,
              userInfo: { orderId: notification.referenceId },
            });
            
            setUnreadCount((prev) => prev + 1);
          }
        );
      }
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [userId]);

  return { unreadCount };
};
```

---

## 📡 REST API Endpoints

### **1. Lấy danh sách thông báo**
```http
GET /api/v1/notifications?page=0&size=20
Authorization: Bearer {token}
```

**Response:**
```json
{
  "content": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "ORDER_CREATED",
      "title": "Đơn hàng mới",
      "message": "Đơn hàng #12345678 của bạn đã được tạo thành công. Tổng tiền: 250,000 đ",
      "status": "UNREAD",
      "referenceId": "order-uuid",
      "referenceType": "ORDER",
      "deepLink": "/orders/order-uuid",
      "imageUrl": null,
      "createdAt": "2026-01-08T10:30:00",
      "updatedAt": "2026-01-08T10:30:00"
    }
  ],
  "totalElements": 45,
  "totalPages": 3,
  "size": 20,
  "number": 0
}
```

---

### **2. Lấy thông báo chưa đọc**
```http
GET /api/v1/notifications/unread?page=0&size=20
Authorization: Bearer {token}
```

**Response:** Same structure as endpoint #1

---

### **3. Đếm số thông báo chưa đọc**
```http
GET /api/v1/notifications/unread/count
Authorization: Bearer {token}
```

**Response:**
```json
{
  "count": 12
}
```

---

### **4. Đánh dấu đã đọc**
```http
PUT /api/v1/notifications/{notificationId}/read
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "type": "ORDER_CREATED",
  "title": "Đơn hàng mới",
  "message": "Đơn hàng của bạn đã được tạo",
  "status": "READ",
  "referenceId": "order-uuid",
  "referenceType": "ORDER",
  "deepLink": "/orders/order-uuid",
  "imageUrl": null,
  "createdAt": "2026-01-08T10:30:00",
  "updatedAt": "2026-01-08T10:30:00"
}
```

---

### **5. Đánh dấu tất cả đã đọc**
```http
PUT /api/v1/notifications/read-all
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "updatedCount": 12,
  "message": "All notifications marked as read"
}
```

---

### **6. Xóa thông báo**
```http
DELETE /api/v1/notifications/{notificationId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Notification deleted successfully"
}
```

---

### **7. Xóa tất cả thông báo**
```http
DELETE /api/v1/notifications/all
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "All notifications deleted successfully"
}
```

---

## 🎯 Notification Types

| Type | Title | Use Case |
|------|-------|----------|
| `ORDER_CREATED` | Đơn hàng mới | Người mua tạo đơn / Shop nhận đơn |
| `ORDER_CONFIRMED` | Đơn hàng đã xác nhận | Shop xác nhận đơn hàng |
| `ORDER_SHIPPED` | Đơn hàng đang giao | Đơn hàng đang vận chuyển |
| `ORDER_DELIVERED` | Đơn hàng đã giao | Đơn hàng giao thành công |
| `ORDER_CANCELLED` | Đơn hàng đã hủy | Đơn hàng bị hủy |
| `ORDER_COMPLETED` | Đơn hàng hoàn thành | Hoàn thành giao dịch |
| `PAYMENT_SUCCESS` | Thanh toán thành công | Thanh toán thành công |
| `PAYMENT_FAILED` | Thanh toán thất bại | Thanh toán thất bại |
| `VOUCHER_RECEIVED` | Voucher mới | Nhận voucher mới |
| `SYSTEM_ANNOUNCEMENT` | Thông báo hệ thống | Thông báo từ admin |

---

## 🎨 UI Best Practices

### **1. Toast Notification**
```tsx
// Using react-hot-toast
import toast from 'react-hot-toast';

const handleNotification = (notification) => {
  toast.custom((t) => (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start">
        <img src={notification.imageUrl || '/default-icon.png'} className="w-10 h-10 rounded" />
        <div className="ml-3 flex-1">
          <h3 className="font-semibold text-sm">{notification.title}</h3>
          <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
        </div>
        <button onClick={() => toast.dismiss(t.id)}>×</button>
      </div>
    </div>
  ));
};
```

---

### **2. Notification Badge**
```tsx
<button className="relative">
  <BellIcon />
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  )}
</button>
```

---

### **3. Notification Panel**
```tsx
<div className="notification-panel max-h-96 overflow-y-auto">
  {notifications.map((notif) => (
    <div 
      key={notif.id}
      className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
        notif.status === 'UNREAD' ? 'bg-blue-50' : ''
      }`}
      onClick={() => handleNotificationClick(notif)}
    >
      <div className="flex items-start">
        {notif.imageUrl && (
          <img src={notif.imageUrl} className="w-10 h-10 rounded mr-3" />
        )}
        <div className="flex-1">
          <h4 className="font-medium text-sm">{notif.title}</h4>
          <p className="text-gray-600 text-xs mt-1">{notif.message}</p>
          <span className="text-gray-400 text-xs">{formatTime(notif.createdAt)}</span>
        </div>
        {notif.status === 'UNREAD' && (
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </div>
    </div>
  ))}
</div>
```

---

## 🔒 Authentication

WebSocket kết nối cần **JWT token** để authenticate. Có 2 cách:

### **Option 1: Query Parameter (Recommended)**
```typescript
const socket = new SockJS(`http://localhost:8080/ws/notifications?token=${jwtToken}`);
```

### **Option 2: STOMP Headers**
```typescript
stompClient.connect(
  { Authorization: `Bearer ${jwtToken}` },
  onConnectCallback
);
```

---

## ⚠️ Error Handling

```typescript
const stompClient = new Client({
  onStompError: (frame) => {
    console.error('STOMP Error:', frame.headers['message']);
    
    // Handle authentication errors
    if (frame.headers['message'].includes('Unauthorized')) {
      // Redirect to login
      window.location.href = '/login';
    }
  },
  
  onWebSocketClose: (event) => {
    console.log('WebSocket closed:', event.code, event.reason);
    
    // Auto reconnect after 3 seconds
    setTimeout(() => {
      stompClient.activate();
    }, 3000);
  }
});
```

---

## 🧪 Testing

### **Test WebSocket Connection (Browser Console)**
```javascript
const socket = new SockJS('http://localhost:8080/ws/notifications');
const client = Stomp.over(socket);

client.connect({}, () => {
  console.log('✅ Connected');
  
  const userId = 'your-user-uuid';
  client.subscribe(`/user/${userId}/queue/notifications`, (message) => {
    console.log('📩 Received:', JSON.parse(message.body));
  });
});
```

---

## 📊 Performance Tips

1. **Lazy Load Notifications**: Chỉ load khi mở notification panel
2. **Debounce API Calls**: Tránh gọi API quá nhiều
3. **Cache Notifications**: Lưu cache trong localStorage/IndexedDB
4. **Pagination**: Load notifications theo trang
5. **Unsubscribe**: Disconnect WebSocket khi user logout

---

## 🎉 Example: Complete Implementation

```typescript
// NotificationProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { NotificationService } from './services/NotificationService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationService = new NotificationService();

  useEffect(() => {
    if (!user?.id) return;

    // Fetch initial notifications
    fetchNotifications();

    // Connect WebSocket
    notificationService.connect(user.id, (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      notificationService.disconnect();
    };
  }, [user]);

  const fetchNotifications = async () => {
    const response = await fetch('/api/v1/notifications?page=0&size=20', {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    const data = await response.json();
    setNotifications(data.content);
    
    const countResponse = await fetch('/api/v1/notifications/unread/count', {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    const countData = await countResponse.json();
    setUnreadCount(countData.count);
  };

  const markAsRead = async (id: string) => {
    await fetch(`/api/v1/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user.token}` }
    });
    
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'READ' } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await fetch('/api/v1/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user.token}` }
    });
    
    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'READ' })));
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Connection refused | Kiểm tra backend có đang chạy? |
| CORS error | Cấu hình CORS trong WebSocketConfig |
| Not receiving notifications | Kiểm tra userId có đúng không? |
| Notifications duplicate | Đảm bảo chỉ connect 1 lần |
| Memory leak | Cleanup connection trong useEffect |

---

## 📞 Support

Nếu gặp vấn đề, liên hệ:
- Backend API: `http://localhost:8080`
- WebSocket endpoint: `ws://localhost:8080/ws/notifications`

---

**Happy Coding! 🚀**
