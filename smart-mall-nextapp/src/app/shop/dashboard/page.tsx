"use client";

import { Card, Row, Col, Statistic, Table, Tag, Progress, Button, Avatar, List } from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  StarFilled,
} from "@ant-design/icons";

export default function ShopDashboard() {
  // Mock data
  const stats = [
    {
      title: "Total Revenue",
      value: 125000,
      prefix: "$",
      precision: 0,
      trend: "up",
      change: 12.5,
      icon: <DollarOutlined className="text-green-500" />,
      color: "#52c41a",
    },
    {
      title: "Total Orders",
      value: 1256,
      trend: "up",
      change: 8.2,
      icon: <ShoppingOutlined className="text-blue-500" />,
      color: "#1890ff",
    },
    {
      title: "Total Customers",
      value: 892,
      trend: "up",
      change: 15.3,
      icon: <UserOutlined className="text-purple-500" />,
      color: "#722ed1",
    },
    {
      title: "Shop Views",
      value: 12450,
      trend: "down",
      change: -2.1,
      icon: <EyeOutlined className="text-orange-500" />,
      color: "#fa8c16",
    },
  ];

  const recentOrders = [
    {
      key: '1',
      orderId: 'ORD001',
      customer: 'John Doe',
      product: 'iPhone 14 Pro',
      amount: '$999',
      status: 'completed',
      date: '2024-03-15',
    },
    {
      key: '2',
      orderId: 'ORD002',
      customer: 'Jane Smith',
      product: 'Samsung Galaxy S23',
      amount: '$799',
      status: 'processing',
      date: '2024-03-14',
    },
    {
      key: '3',
      orderId: 'ORD003',
      customer: 'Mike Johnson',
      product: 'MacBook Air M2',
      amount: '$1299',
      status: 'shipped',
      date: '2024-03-13',
    },
    {
      key: '4',
      orderId: 'ORD004',
      customer: 'Sarah Wilson',
      product: 'iPad Pro',
      amount: '$899',
      status: 'pending',
      date: '2024-03-12',
    },
  ];

  const topProducts = [
    { name: 'iPhone 14 Pro', sales: 156, revenue: '$155,400' },
    { name: 'Samsung Galaxy S23', sales: 142, revenue: '$113,358' },
    { name: 'MacBook Air M2', sales: 98, revenue: '$127,302' },
    { name: 'iPad Pro', sales: 89, revenue: '$79,911' },
    { name: 'AirPods Pro', sales: 234, revenue: '$58,266' },
  ];

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: { [key: string]: string } = {
          completed: 'green',
          processing: 'blue',
          shipped: 'orange',
          pending: 'gold',
          cancelled: 'red',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
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
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUpOutlined className="text-green-500 mr-1" />
                    ) : (
                      <ArrowDownOutlined className="text-red-500 mr-1" />
                    )}
                    <span 
                      className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}
                    >
                      {Math.abs(stat.change)}%
                    </span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                  </div>
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
            extra={<Button type="primary" size="small">View All Orders</Button>}
          >
            <Table 
              dataSource={recentOrders}
              columns={orderColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="Top Products" 
            extra={<Button size="small">View All</Button>}
          >
            <List
              itemLayout="horizontal"
              dataSource={topProducts}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar className="bg-blue-500">#{index + 1}</Avatar>}
                    title={item.name}
                    description={`${item.sales} sales • ${item.revenue}`}
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
              <div className="text-4xl font-bold text-orange-500 mb-2">4.8</div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarFilled key={star} className="text-orange-400 text-lg" />
                ))}
              </div>
              <div className="text-gray-500">Based on 1,234 reviews</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Order Fulfillment">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>On Time Delivery</span>
                  <span>95%</span>
                </div>
                <Progress percent={95} strokeColor="#52c41a" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Order Accuracy</span>
                  <span>98%</span>
                </div>
                <Progress percent={98} strokeColor="#1890ff" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Response Time</span>
                  <span>87%</span>
                </div>
                <Progress percent={87} strokeColor="#faad14" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Quick Actions">
            <div className="space-y-2">
              <Button block type="primary" className="bg-blue-500">
                Add New Product
              </Button>
              <Button block>
                Process Orders
              </Button>
              <Button block>
                Update Inventory
              </Button>
              <Button block>
                View Analytics
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}