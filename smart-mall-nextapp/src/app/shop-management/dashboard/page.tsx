"use client";

import { Card, Row, Col, Statistic, Table, Tag, Progress, Button, Avatar, List, Spin } from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import dashboardService, { type DashboardStats, type TopProduct, type PerformanceMetrics } from "@/services/DashboardService";
import shopService from "@/services/ShopService";
import type { Order } from "@/services/OrderService";

export default function ShopDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  // Fetch shop ID first
  useEffect(() => {
    const fetchShopId = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await shopService.getShopsByOwner(session.user.id);
        if (response.data && response.data.length > 0) {
          setShopId(response.data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch shop:', error);
      }
    };

    fetchShopId();
  }, [session?.user?.id]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!shopId) return;

      setLoading(true);
      try {
        const [statsData, ordersData, productsData, metricsData] = await Promise.all([
          dashboardService.getShopStats(shopId),
          dashboardService.getRecentOrders(shopId, 4),
          dashboardService.getTopProducts(shopId, 5),
          dashboardService.getPerformanceMetrics(shopId),
        ]);

        setStats(statsData);
        setRecentOrders(ordersData);
        setTopProducts(productsData);
        setMetrics(metricsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [shopId]);

  // Create stats cards data
  const statsCards = stats ? [
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      prefix: "$",
      precision: 0,
      trend: stats.revenueChange >= 0 ? "up" : "down",
      change: Math.abs(stats.revenueChange),
      icon: <DollarOutlined className="text-green-500" />,
      color: "#52c41a",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      trend: stats.ordersChange >= 0 ? "up" : "down",
      change: Math.abs(stats.ordersChange),
      icon: <ShoppingOutlined className="text-blue-500" />,
      color: "#1890ff",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      trend: stats.customersChange >= 0 ? "up" : "down",
      change: Math.abs(stats.customersChange),
      icon: <UserOutlined className="text-purple-500" />,
      color: "#722ed1",
    },
    {
      title: "Shop Views",
      value: stats.shopViews,
      trend: stats.viewsChange >= 0 ? "up" : "down",
      change: Math.abs(stats.viewsChange),
      icon: <EyeOutlined className="text-orange-500" />,
      color: "#fa8c16",
    },
  ] : [];


  const formatOrderStatus = (status: string) => {
    const statusMap: { [key: string]: { text: string; color: string } } = {
      PENDING: { text: 'Pending', color: 'gold' },
      CONFIRMED: { text: 'Confirmed', color: 'blue' },
      PACKED: { text: 'Packed', color: 'cyan' },
      SHIPPING: { text: 'Shipping', color: 'orange' },
      DELIVERED: { text: 'Delivered', color: 'green' },
      COMPLETED: { text: 'Completed', color: 'green' },
      CANCELLED: { text: 'Cancelled', color: 'red' },
      PAID: { text: 'Paid', color: 'blue' },
    };
    return statusMap[status] || { text: status, color: 'default' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id.substring(0, 8) + '...',
    },
    {
      title: 'Customer',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => items?.length || 0,
    },
    {
      title: 'Amount',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (amount: number, record: Order) => formatCurrency(amount || record.totalAmount),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const { text, color } = formatOrderStatus(status);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    precision={stat.precision}
                    valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
                  />
                  {stat.change > 0 && (
                    <div className="flex items-center mt-2">
                      {stat.trend === 'up' ? (
                        <ArrowUpOutlined className="text-green-500 mr-1" />
                      ) : (
                        <ArrowDownOutlined className="text-red-500 mr-1" />
                      )}
                      <span 
                        className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}
                      >
                        {stat.change}%
                      </span>
                      <span className="text-gray-500 ml-1">vs last month</span>
                    </div>
                  )}
                </div>
                <div className="text-4xl">
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Orders and Top Products */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title="Recent Orders" 
            extra={<Button type="primary" size="small" href="/shop-management/orders">View All Orders</Button>}
          >
            <Table 
              dataSource={recentOrders}
              columns={orderColumns}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="Top Products" 
            extra={<Button size="small" href="/shop-management/products">View All</Button>}
          >
            <List
              itemLayout="horizontal"
              dataSource={topProducts}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar className="bg-blue-500">#{index + 1}</Avatar>}
                    title={item.name}
                    description={`${item.sales} sales • ${formatCurrency(item.revenue)}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Shop Rating">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">
                {metrics?.rating.toFixed(1) || 'N/A'}
              </div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarFilled 
                    key={star} 
                    className={star <= (metrics?.rating || 0) ? "text-orange-400 text-lg" : "text-gray-300 text-lg"} 
                  />
                ))}
              </div>
              <div className="text-gray-500">
                Based on {metrics?.reviewCount || 0} reviews
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Order Fulfillment">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>On Time Delivery</span>
                  <span>{metrics?.onTimeDeliveryRate.toFixed(0) || 0}%</span>
                </div>
                <Progress percent={metrics?.onTimeDeliveryRate || 0} strokeColor="#52c41a" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Order Accuracy</span>
                  <span>{metrics?.orderAccuracyRate.toFixed(0) || 0}%</span>
                </div>
                <Progress percent={metrics?.orderAccuracyRate || 0} strokeColor="#1890ff" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Response Time</span>
                  <span>{metrics?.responseTimeRate.toFixed(0) || 0}%</span>
                </div>
                <Progress percent={metrics?.responseTimeRate || 0} strokeColor="#faad14" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Quick Actions">
            <div className="space-y-2">
              <Button block type="primary" className="bg-blue-500" href="/shop-management/products">
                Add New Product
              </Button>
              <Button block href="/shop-management/orders">
                Process Orders
              </Button>
              <Button block href="/shop-management/products">
                Update Inventory
              </Button>
              <Button block href="/shop-management/dashboard">
                View Analytics
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}