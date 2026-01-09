# Admin Dashboard - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- ✅ Application running on `http://localhost:8080`
- ✅ Admin JWT token
- ✅ Role: `ADMIN`

---

## 📋 Available Endpoints

### Base URL
```
http://localhost:8080/api/v1/admin/dashboard
```

### 1. Dashboard Overview
**GET** `/overview`

```javascript
fetch('http://localhost:8080/api/v1/admin/dashboard/overview', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

**Response Example:**
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

---

### 2. Revenue Chart
**GET** `/revenue-chart?days=7`

```javascript
// Last 7 days
fetch('http://localhost:8080/api/v1/admin/dashboard/revenue-chart?days=7', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})

// Last 30 days
fetch('http://localhost:8080/api/v1/admin/dashboard/revenue-chart?days=30', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
```

---

### 3. Top Shops
**GET** `/top-shops?limit=10`

```javascript
// Top 10 shops
fetch('http://localhost:8080/api/v1/admin/dashboard/top-shops?limit=10', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})

// Top 5 shops
fetch('http://localhost:8080/api/v1/admin/dashboard/top-shops?limit=5', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
```

---

### 4. Recent Activities
**GET** `/recent-activities?limit=20`

```javascript
fetch('http://localhost:8080/api/v1/admin/dashboard/recent-activities?limit=20', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
```

---

### 5. System Health
**GET** `/system-health`

```javascript
fetch('http://localhost:8080/api/v1/admin/dashboard/system-health', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
```

---

## 🎨 React Component Example

```tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(
          'http://localhost:8080/api/v1/admin/dashboard/overview',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOverview(response.data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      {/* Revenue Card */}
      <div className="card">
        <h3>Doanh thu tháng này</h3>
        <h1>{overview.revenue.thisMonth.toLocaleString()} VNĐ</h1>
        <p className={overview.revenue.percentChangeFromLastMonth > 0 ? 'positive' : 'negative'}>
          {overview.revenue.percentChangeFromLastMonth > 0 ? '↑' : '↓'} 
          {Math.abs(overview.revenue.percentChangeFromLastMonth).toFixed(1)}%
        </p>
      </div>

      {/* Shops Card */}
      <div className="card">
        <h3>Shops đang hoạt động</h3>
        <h1>{overview.shops.active}</h1>
        <p>{overview.shops.newToday} shop mới hôm nay</p>
      </div>

      {/* Users Card */}
      <div className="card">
        <h3>Người dùng</h3>
        <h1>{overview.users.active.toLocaleString()}</h1>
        <p>{overview.users.newToday} user mới hôm nay</p>
      </div>

      {/* Orders Card */}
      <div className="card">
        <h3>Tỷ lệ hoàn thành</h3>
        <h1>{overview.orders.completionRate.toFixed(1)}%</h1>
        <p>{overview.orders.pending} đơn chờ xử lý</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
```

---

## 📊 Chart.js Example

```tsx
import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';

const RevenueChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        'http://localhost:8080/api/v1/admin/dashboard/revenue-chart?days=7',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();

      setChartData({
        labels: data.dataPoints.map(d => d.label),
        datasets: [{
          label: 'Doanh thu (VNĐ)',
          data: data.dataPoints.map(d => d.revenue),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4
        }]
      });
    };

    fetchChartData();
  }, []);

  if (!chartData) return <div>Loading chart...</div>;

  return (
    <Line
      data={chartData}
      options={{
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'Biểu đồ doanh thu 7 ngày'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => value.toLocaleString() + ' VNĐ'
            }
          }
        }
      }}
    />
  );
};
```

---

## 🔄 Auto Refresh Pattern

```tsx
// Hook for auto-refreshing data
const useAutoRefresh = (fetchFn, interval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const result = await fetchFn();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetch();
    const timer = setInterval(fetch, interval);
    return () => clearInterval(timer);
  }, [fetchFn, interval]);

  return { data, loading, error };
};

// Usage
const Dashboard = () => {
  const { data: overview, loading, error } = useAutoRefresh(
    () => axios.get('/api/v1/admin/dashboard/overview').then(res => res.data),
    30000 // refresh every 30 seconds
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <DashboardView data={overview} />;
};
```

---

## 🌐 WebSocket Integration

Kết hợp với notification system để update real-time:

```tsx
useEffect(() => {
  // Subscribe to admin notifications
  stompClient.subscribe('/user/admin/queue/notifications', (message) => {
    const notification = JSON.parse(message.body);
    
    // Refresh dashboard when certain events occur
    if (['NEW_ORDER', 'NEW_SHOP', 'NEW_REVIEW'].includes(notification.type)) {
      fetchDashboard();
    }
  });
}, []);
```

---

## 🛠️ Axios Instance Setup

```javascript
// api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
});

// Add auth token to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dashboard API
export const dashboardAPI = {
  getOverview: () => API.get('/admin/dashboard/overview'),
  getRevenueChart: (days = 7) => API.get(`/admin/dashboard/revenue-chart?days=${days}`),
  getTopShops: (limit = 10) => API.get(`/admin/dashboard/top-shops?limit=${limit}`),
  getRecentActivities: (limit = 20) => API.get(`/admin/dashboard/recent-activities?limit=${limit}`),
  getSystemHealth: () => API.get('/admin/dashboard/system-health'),
};
```

---

## ⚠️ Error Handling

```tsx
const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardAPI.getOverview();
        setData(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          // Token expired - redirect to login
          window.location.href = '/login';
        } else if (err.response?.status === 403) {
          // Not admin - show error
          setError('Bạn không có quyền truy cập');
        } else {
          // Other error
          setError('Không thể tải dữ liệu dashboard');
        }
      }
    };

    fetchData();
  }, []);

  if (error) return <ErrorAlert message={error} />;
  return <DashboardView data={data} />;
};
```

---

## 📱 Mobile Responsive Example

```css
.dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

@media (max-width: 1200px) {
  .dashboard {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
}
```

---

## 🎯 Tips

1. **Refresh Interval**: 30 seconds là khoảng thời gian hợp lý
2. **Error Handling**: Luôn xử lý token expiry và network errors
3. **Loading States**: Hiển thị skeleton hoặc spinner khi loading
4. **Caching**: Cache data trong 30 seconds để giảm API calls
5. **Real-time**: Kết hợp WebSocket cho updates critical
6. **Performance**: Lazy load charts và heavy components

---

## 📚 Full Documentation

Xem chi tiết tại: [ADMIN_DASHBOARD_API.md](ADMIN_DASHBOARD_API.md)

---

*Happy Coding! 🚀*
