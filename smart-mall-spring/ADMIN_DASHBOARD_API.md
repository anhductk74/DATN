# Admin Dashboard API Documentation

## Overview
API endpoints cho admin dashboard với đầy đủ thống kê và phân tích hệ thống. Tất cả endpoints yêu cầu quyền **ADMIN**.

**Base URL:** `/api/v1/admin/dashboard`

**Authentication:** Bearer Token (JWT) với role ADMIN

---

## Endpoints

### 1. Get Dashboard Overview
Lấy tổng quan hoàn chỉnh về hệ thống

**Endpoint:** `GET /api/v1/admin/dashboard/overview`

**Query Parameters:**
- `startDate` (optional): Ngày bắt đầu (format: yyyy-MM-dd). Mặc định: ngày 1 của tháng hiện tại
- `endDate` (optional): Ngày kết thúc (format: yyyy-MM-dd). Mặc định: hôm nay

**Example Request:**
```
GET /api/v1/admin/dashboard/overview
GET /api/v1/admin/dashboard/overview?startDate=2026-01-01&endDate=2026-01-31
```

**Response:**
```json
{
  "revenue": {
    "today": 5420000.0,
    "thisWeek": 28900000.0,
    "thisMonth": 125000000.0,
    "totalCommission": 6250000.0,
    "percentChangeFromLastMonth": 15.5
  },
  "shops": {
    "total": 245,
    "active": 189,
    "pending": 12,
    "inactive": 44,
    "newToday": 3
  },
  "users": {
    "total": 5420,
    "active": 4890,
    "newToday": 23,
    "newThisWeek": 156,
    "withOrders": 3240
  },
  "orders": {
    "total": 12450,
    "pending": 34,
    "processing": 89,
    "completed": 11890,
    "cancelled": 437,
    "returnRequests": 12,
    "completionRate": 95.5
  },
  "actionsRequired": {
    "pendingShops": 12,
    "pendingProducts": 45,
    "disputes": 3,
    "pendingWithdrawals": 8,
    "reportedItems": 5
  }
}
```

**Description:**
- `revenue.today`: Doanh thu hôm nay
- `revenue.thisWeek`: Doanh thu tuần này
- `revenue.thisMonth`: Doanh thu tháng này
- `revenue.totalCommission`: Tổng hoa hồng (5% doanh thu)
- `revenue.percentChangeFromLastMonth`: % thay đổi so với tháng trước
- `shops.active`: Shop đang hoạt động
- `shops.pending`: Shop chờ duyệt
- `users.withOrders`: Số user đã từng đặt hàng
- `orders.completionRate`: Tỷ lệ đơn hoàn thành (%)
- `actionsRequired`: Các tác vụ cần xử lý

---

### 2. Get Revenue Chart
Lấy dữ liệu biểu đồ doanh thu theo ngày

**Endpoint:** `GET /api/v1/admin/dashboard/revenue-chart`

**Query Parameters:**
- `days` (optional): Số ngày hiển thị (mặc định: 7, tối đa: 90). Bị bỏ qua nếu `startDate` được cung cấp
- `startDate` (optional): Ngày bắt đầu (format: yyyy-MM-dd). Nếu cung cấp, tham số `days` sẽ bị bỏ qua
- `endDate` (optional): Ngày kết thúc (format: yyyy-MM-dd). Mặc định: hôm nay

**Example Request:**
```
GET /api/v1/admin/dashboard/revenue-chart?days=30
GET /api/v1/admin/dashboard/revenue-chart?startDate=2026-01-01&endDate=2026-01-15
```

**Response:**
```json
{
  "dataPoints": [
    {
      "date": "2026-01-01",
      "label": "Jan 01",
      "revenue": 4500000.0,
      "orderCount": 125
    },
    {
      "date": "2026-01-02",
      "label": "Jan 02",
      "revenue": 5200000.0,
      "orderCount": 143
    }
  ],
  "totalRevenue": 125000000.0,
  "averagePerDay": 4166666.67,
  "percentChange": 12.5
}
```

**Description:**
- `label`: Nhãn hiển thị (EEE format cho ≤7 ngày, MMM dd cho >7 ngày)
- `revenue`: Doanh thu ngày đó (chỉ tính đơn DELIVERED)
- `orderCount`: Số đơn hàng ngày đó
- `totalRevenue`: Tổng doanh thu cả kỳ
- `averagePerDay`: Doanh thu trung bình/ngày
- `percentChange`: % thay đổi so với kỳ trước

---

### 3. Get Top Shops
Lấy danh sách shop có doanh thu cao nhất

**Endpoint:** `GET /api/v1/admin/dashboard/top-shops`

**Query Parameters:**
- `limit` (optional): Số lượng shop (mặc định: 10)
- `startDate` (optional): Ngày bắt đầu (format: yyyy-MM-dd). Mặc định: ngày 1 của tháng hiện tại
- `endDate` (optional): Ngày kết thúc (format: yyyy-MM-dd). Mặc định: hôm nay

**Example Request:**
```
GET /api/v1/admin/dashboard/top-shops?limit=5
GET /api/v1/admin/dashboard/top-shops?limit=10&startDate=2026-01-01&endDate=2026-01-31
```

**Response:**
```json
[
  {
    "shopId": "550e8400-e29b-41d4-a716-446655440000",
    "shopName": "Fashion Store VN",
    "shopAvatar": "https://cloudinary.com/avatar1.jpg",
    "revenue": 45000000.0,
    "orderCount": 342,
    "rating": 4.8,
    "reviewCount": 256
  }
]
```

**Description:**
- Sắp xếp theo doanh thu trong khoảng thời gian đã chọn (DELIVERED orders)
- `rating`: Đánh giá trung bình
- `reviewCount`: Tổng số đánh giá
- Mặc định: Tính theo tháng hiện tại nếu không truyền startDate/endDate

---

### 4. Get Recent Activities
Lấy hoạt động gần đây trong hệ thống

**Endpoint:** `GET /api/v1/admin/dashboard/recent-activities`

**Query Parameters:**
- `limit` (optional): Số lượng hoạt động (mặc định: 20)

**Example Request:**
```
GET /api/v1/admin/dashboard/recent-activities?limit=10
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "SHOP_REGISTERED",
    "title": "Shop mới đăng ký",
    "description": "Fashion Store VN đã đăng ký",
    "icon": "🏪",
    "timestamp": "2026-01-09T10:30:00",
    "referenceId": "550e8400-e29b-41d4-a716-446655440000",
    "referenceType": "SHOP"
  },
  {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "type": "ORDER_CREATED",
    "title": "Đơn hàng mới",
    "description": "Đơn hàng #550e8400",
    "icon": "📦",
    "timestamp": "2026-01-09T10:25:00",
    "referenceId": "650e8400-e29b-41d4-a716-446655440001",
    "referenceType": "ORDER"
  },
  {
    "id": "750e8400-e29b-41d4-a716-446655440002",
    "type": "REVIEW",
    "title": "Đánh giá mới",
    "description": "5 sao - Sản phẩm rất tốt",
    "icon": "⭐",
    "timestamp": "2026-01-09T10:20:00",
    "referenceId": "750e8400-e29b-41d4-a716-446655440002",
    "referenceType": "REVIEW"
  }
]
```

**Activity Types:**
- `SHOP_REGISTERED`: Shop mới đăng ký
- `ORDER_CREATED`: Đơn hàng mới
- `REVIEW`: Đánh giá mới
- `REPORT`: Báo cáo
- `DISPUTE`: Tranh chấp

**Description:**
- Sắp xếp theo thời gian mới nhất
- `referenceId`: ID của đối tượng liên quan
- `referenceType`: Loại đối tượng (SHOP, ORDER, REVIEW, etc.)

---

### 5. Get System Health
Lấy thông tin sức khỏe hệ thống

**Endpoint:** `GET /api/v1/admin/dashboard/system-health`

**Response:**
```json
{
  "status": "healthy",
  "activeUsers": 4890,
  "webSocketConnections": 234,
  "databaseSize": 2048,
  "avgResponseTime": 45.5,
  "errorCount24h": 3,
  "uptime": 99.9
}
```

**Status Values:**
- `healthy`: Hệ thống hoạt động tốt
- `warning`: Cảnh báo (cần chú ý)
- `critical`: Nghiêm trọng (cần xử lý ngay)

**Description:**
- `activeUsers`: Số user đang active
- `webSocketConnections`: Số kết nối WebSocket
- `databaseSize`: Kích thước database (MB)
- `avgResponseTime`: Thời gian phản hồi trung bình (ms)
- `errorCount24h`: Số lỗi trong 24h
- `uptime`: Thời gian hoạt động (%)

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Admin role required"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An error occurred while processing your request"
}
```

---

## Frontend Integration Examples

### React Example

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1/admin/dashboard';

// Get JWT token from storage
const getAuthHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  }
});

// Fetch dashboard overview
export const getDashboardOverview = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/overview`,
    getAuthHeaders()
  );
  return response.data;
};

// Fetch revenue chart
export const getRevenueChart = async (days = 7) => {
  const response = await axios.get(
    `${API_BASE_URL}/revenue-chart?days=${days}`,
    getAuthHeaders()
  );
  return response.data;
};

// Fetch top shops
export const getTopShops = async (limit = 10) => {
  const response = await axios.get(
    `${API_BASE_URL}/top-shops?limit=${limit}`,
    getAuthHeaders()
  );
  return response.data;
};

// Fetch recent activities
export const getRecentActivities = async (limit = 20) => {
  const response = await axios.get(
    `${API_BASE_URL}/recent-activities?limit=${limit}`,
    getAuthHeaders()
  );
  return response.data;
};

// Fetch system health
export const getSystemHealth = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/system-health`,
    getAuthHeaders()
  );
  return response.data;
};
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';
import { getDashboardOverview } from './api';

export const useDashboardOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getDashboardOverview();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
};
```

### Vue 3 Composition API Example

```typescript
import { ref, onMounted } from 'vue';
import axios from 'axios';

export function useDashboard() {
  const overview = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const API_BASE = 'http://localhost:8080/api/v1/admin/dashboard';
  
  const getAuthHeaders = () => ({
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    }
  });

  const fetchOverview = async () => {
    try {
      loading.value = true;
      const response = await axios.get(
        `${API_BASE}/overview`,
        getAuthHeaders()
      );
      overview.value = response.data;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const fetchRevenueChart = async (days = 7) => {
    const response = await axios.get(
      `${API_BASE}/revenue-chart?days=${days}`,
      getAuthHeaders()
    );
    return response.data;
  };

  onMounted(() => {
    fetchOverview();
    // Auto refresh every 30 seconds
    setInterval(fetchOverview, 30000);
  });

  return {
    overview,
    loading,
    error,
    fetchOverview,
    fetchRevenueChart
  };
}
```

### Chart.js Integration Example

```typescript
import { Line } from 'react-chartjs-2';
import { getRevenueChart } from './api';

export const RevenueChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getRevenueChart(30);
      
      setChartData({
        labels: data.dataPoints.map(d => d.label),
        datasets: [
          {
            label: 'Doanh thu (VNĐ)',
            data: data.dataPoints.map(d => d.revenue),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4
          }
        ]
      });
    };

    fetchData();
  }, []);

  if (!chartData) return <div>Loading...</div>;

  return (
    <Line
      data={chartData}
      options={{
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'Biểu đồ doanh thu 30 ngày'
          }
        }
      }}
    />
  );
};
```

---

## Real-time Updates

Để cập nhật real-time, kết hợp với WebSocket notifications:

```typescript
// Subscribe to admin notifications
stompClient.subscribe('/user/admin/queue/notifications', (message) => {
  const notification = JSON.parse(message.body);
  
  // Refresh dashboard when certain events occur
  if (['NEW_ORDER', 'NEW_SHOP', 'NEW_REVIEW'].includes(notification.type)) {
    fetchDashboardOverview();
  }
});
```

---

## Notes

1. **Authentication**: Tất cả endpoints yêu cầu JWT token với role ADMIN
2. **Rate Limiting**: Recommend poll interval ≥ 30 seconds cho overview
3. **Caching**: Frontend nên cache data và refresh định kỳ
4. **Error Handling**: Luôn xử lý các trường hợp token expired, network error
5. **Performance**: Các query đã được optimize với indexes
6. **Real-time**: Kết hợp WebSocket để cập nhật real-time

---

## Database Indexes

Để đảm bảo performance, các index sau đã được thêm:

```sql
-- Orders
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_shop_id ON orders(shop_id);

-- Shops
CREATE INDEX idx_shops_status ON shops(status);
CREATE INDEX idx_shops_created_at ON shops(created_at);

-- Users
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Reviews
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
```

---

## Support

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ team backend.
