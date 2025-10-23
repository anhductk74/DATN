"use client";

import { useState } from "react";
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  Row, 
  Col, 
  Statistic, 
  Image,
  Tag,
  Tooltip
} from "antd";
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;

interface ProductData {
  key: string;
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  image: string;
  sku: string;
  sales: number;
  rating: number;
  createdDate: string;
}

export default function ProductManagement() {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock product data
  const products: ProductData[] = [
    {
      key: '1',
      id: 'P001',
      name: 'iPhone 14 Pro',
      category: 'Electronics',
      price: 999,
      stock: 45,
      status: 'active',
      image: '/api/placeholder/100/100',
      sku: 'IPH14PRO-128',
      sales: 156,
      rating: 4.8,
      createdDate: '2024-01-15',
    },
    {
      key: '2',
      id: 'P002',
      name: 'Samsung Galaxy S23',
      category: 'Electronics',
      price: 799,
      stock: 32,
      status: 'active',
      image: '/api/placeholder/100/100',
      sku: 'SAM-S23-256',
      sales: 142,
      rating: 4.6,
      createdDate: '2024-02-01',
    },
    {
      key: '3',
      id: 'P003',
      name: 'MacBook Air M2',
      category: 'Electronics',
      price: 1299,
      stock: 0,
      status: 'out_of_stock',
      image: '/api/placeholder/100/100',
      sku: 'MBA-M2-512',
      sales: 98,
      rating: 4.9,
      createdDate: '2024-01-20',
    },
    {
      key: '4',
      id: 'P004',
      name: 'iPad Pro',
      category: 'Electronics',
      price: 899,
      stock: 28,
      status: 'active',
      image: '/api/placeholder/100/100',
      sku: 'IPD-PRO-256',
      sales: 89,
      rating: 4.7,
      createdDate: '2024-02-10',
    },
    {
      key: '5',
      id: 'P005',
      name: 'AirPods Pro',
      category: 'Accessories',
      price: 249,
      stock: 67,
      status: 'inactive',
      image: '/api/placeholder/100/100',
      sku: 'APP-2ND-GEN',
      sales: 234,
      rating: 4.5,
      createdDate: '2024-01-05',
    },
  ];

  const categories = ['Electronics', 'Accessories', 'Clothing', 'Home', 'Sports'];

  const statusColors: { [key: string]: string } = {
    active: 'green',
    inactive: 'orange',
    out_of_stock: 'red',
  };

  const productStats = [
    {
      title: 'Total Products',
      value: products.length,
      color: '#1890ff',
    },
    {
      title: 'Active Products',
      value: products.filter(p => p.status === 'active').length,
      color: '#52c41a',
    },
    {
      title: 'Out of Stock',
      value: products.filter(p => p.status === 'out_of_stock').length,
      color: '#f5222d',
    },
    {
      title: 'Low Stock (<10)',
      value: products.filter(p => p.stock < 10 && p.stock > 0).length,
      color: '#faad14',
    },
  ];

  const columns: ColumnsType<ProductData> = [
    {
      title: 'Product',
      key: 'product',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-xs text-gray-500">IMG</span>
          </div>
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-xs text-gray-500">SKU: {record.sku}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => `$${price.toFixed(2)}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      render: (stock: number) => (
        <span 
          className={
            stock === 0 ? 'text-red-500 font-medium' :
            stock < 10 ? 'text-orange-500 font-medium' :
            'text-green-600 font-medium'
          }
        >
          {stock}
        </span>
      ),
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={statusColors[status]}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      width: 80,
      sorter: (a, b) => a.sales - b.sales,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      render: (rating: number) => (
        <div className="flex items-center gap-1">
          <span>⭐</span>
          <span>{rating}</span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: () => (
        <Space size="small">
          <Tooltip title="View Product">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit Product">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
            />
          </Tooltip>
          <Tooltip title="Duplicate Product">
            <Button 
              type="text" 
              icon={<CopyOutlined />} 
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete Product">
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              size="small"
              danger
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchText.toLowerCase()) ||
      product.category.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        {productStats.map((stat, index) => (
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
              placeholder="Search products, SKU, or category"
              allowClear
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="Category"
              style={{ width: 150 }}
              value={categoryFilter}
              onChange={setCategoryFilter}
            >
              <Option value="all">All Categories</Option>
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
            <Select
              placeholder="Status"
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="out_of_stock">Out of Stock</Option>
            </Select>
          </div>
          
          <Button type="primary" icon={<PlusOutlined />}>
            Add Product
          </Button>
        </div>
      </Card>

      {/* Products Table */}
      <Card 
        title={`Products (${filteredProducts.length})`}
        extra={
          <Space>
            <span className="text-sm text-gray-500">Bulk Actions:</span>
            <Button size="small">Delete Selected</Button>
            <Button size="small">Export Selected</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredProducts}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} products`,
          }}
          scroll={{ x: 1200 }}
          rowSelection={{
            type: 'checkbox',
            onChange: (selectedRowKeys, selectedRows) => {
              console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            },
          }}
        />
      </Card>
    </div>
  );
}