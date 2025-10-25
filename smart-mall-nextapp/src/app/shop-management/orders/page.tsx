"use client";

import { useState } from "react";
import { Card, Table, Tag, Button, Space, Input, Select, DatePicker, Row, Col, Statistic } from "antd";
import { SearchOutlined, FilterOutlined, ExportOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface OrderData {
  key: string;
  orderId: string;
  customer: string;
  customerEmail: string;
  product: string;
  quantity: number;
  amount: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  paymentMethod: string;
}

export default function OrderManagement() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Mock order data
  const orders: OrderData[] = [
    {
      key: '1',
      orderId: 'ORD001',
      customer: 'John Doe',
      customerEmail: 'john@example.com',
      product: 'iPhone 14 Pro',
      quantity: 1,
      amount: '$999.00',
      status: 'delivered',
      date: '2024-03-15',
      paymentMethod: 'Credit Card',
    },
    {
      key: '2',
      orderId: 'ORD002',
      customer: 'Jane Smith',
      customerEmail: 'jane@example.com',
      product: 'Samsung Galaxy S23',
      quantity: 2,
      amount: '$1,598.00',
      status: 'shipped',
      date: '2024-03-14',
      paymentMethod: 'PayPal',
    },
    {
      key: '3',
      orderId: 'ORD003',
      customer: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      product: 'MacBook Air M2',
      quantity: 1,
      amount: '$1,299.00',
      status: 'processing',
      date: '2024-03-13',
      paymentMethod: 'Bank Transfer',
    },
    {
      key: '4',
      orderId: 'ORD004',
      customer: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      product: 'iPad Pro',
      quantity: 1,
      amount: '$899.00',
      status: 'pending',
      date: '2024-03-12',
      paymentMethod: 'Credit Card',
    },
    {
      key: '5',
      orderId: 'ORD005',
      customer: 'Tom Brown',
      customerEmail: 'tom@example.com',
      product: 'AirPods Pro',
      quantity: 3,
      amount: '$747.00',
      status: 'cancelled',
      date: '2024-03-11',
      paymentMethod: 'Credit Card',
    },
  ];

  const statusColors: { [key: string]: string } = {
    pending: 'gold',
    processing: 'blue',
    shipped: 'orange',
    delivered: 'green',
    cancelled: 'red',
  };

  const orderStats = [
    {
      title: 'Total Orders',
      value: orders.length,
      color: '#1890ff',
    },
    {
      title: 'Pending Orders',
      value: orders.filter(order => order.status === 'pending').length,
      color: '#faad14',
    },
    {
      title: 'Processing',
      value: orders.filter(order => order.status === 'processing').length,
      color: '#13c2c2',
    },
    {
      title: 'Shipped',
      value: orders.filter(order => order.status === 'shipped').length,
      color: '#fa8c16',
    },
  ];

  const columns: ColumnsType<OrderData> = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text) => <span className="font-mono font-medium">{text}</span>,
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.customerEmail}</div>
        </div>
      ),
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            title="View Details"
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small"
            title="Edit Order"
          />
        </Space>
      ),
    },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchText.toLowerCase()) ||
      order.product.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        {orderStats.map((stat, index) => (
          <Col xs={12} sm={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                valueStyle={{ color: stat.color, fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters and Actions */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Search
              placeholder="Search orders, customers, or products"
              allowClear
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="processing">Processing</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
            <RangePicker placeholder={['Start Date', 'End Date']} />
          </div>
          
          <div className="flex gap-2">
            <Button icon={<FilterOutlined />}>
              More Filters
            </Button>
            <Button icon={<ExportOutlined />}>
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card 
        title={`Orders (${filteredOrders.length})`}
        extra={
          <Button type="primary">
            Create Order
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredOrders}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} orders`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
}