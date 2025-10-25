"use client";

import { useState } from "react";
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Modal, 
  Form, 
  message,
  Select,
  Tag,
  Row,
  Col,
  Statistic,
  InputNumber,
  Progress,
  Alert
} from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  WarningOutlined,
  SearchOutlined,
  InboxOutlined,
  TruckOutlined,
  ShoppingOutlined
} from "@ant-design/icons";

const { Option } = Select;

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  variantSku: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  maxStock: number;
  location: string;
  lastRestocked: string;
  averageSalesPerDay: number;
  daysUntilStockout: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';
  cost: number;
  retailPrice: number;
}

// Mock data
const mockInventory: InventoryItem[] = [
  {
    id: "inv1",
    productId: "prod1",
    productName: "iPhone 15 Pro",
    variantSku: "IP15P-256-BLU",
    currentStock: 45,
    reservedStock: 5,
    availableStock: 40,
    reorderPoint: 20,
    maxStock: 100,
    location: "Warehouse A - Section 1",
    lastRestocked: "2024-01-15",
    averageSalesPerDay: 3.2,
    daysUntilStockout: 14,
    status: "IN_STOCK",
    cost: 800,
    retailPrice: 1099
  },
  {
    id: "inv2",
    productId: "prod2",
    productName: "Samsung Galaxy S24",
    variantSku: "SGS24-128-WHT",
    currentStock: 12,
    reservedStock: 2,
    availableStock: 10,
    reorderPoint: 15,
    maxStock: 80,
    location: "Warehouse A - Section 2",
    lastRestocked: "2024-01-10",
    averageSalesPerDay: 2.1,
    daysUntilStockout: 6,
    status: "LOW_STOCK",
    cost: 650,
    retailPrice: 899
  },
  {
    id: "inv3",
    productId: "prod3",
    productName: "MacBook Pro 14",
    variantSku: "MBP14-512-SLV",
    currentStock: 0,
    reservedStock: 0,
    availableStock: 0,
    reorderPoint: 5,
    maxStock: 30,
    location: "Warehouse B - Section 1",
    lastRestocked: "2024-01-05",
    averageSalesPerDay: 1.5,
    daysUntilStockout: 0,
    status: "OUT_OF_STOCK",
    cost: 1800,
    retailPrice: 2399
  },
  {
    id: "inv4",
    productId: "prod4",
    productName: "AirPods Pro",
    variantSku: "APP-WHT",
    currentStock: 150,
    reservedStock: 10,
    availableStock: 140,
    reorderPoint: 30,
    maxStock: 120,
    location: "Warehouse A - Section 3",
    lastRestocked: "2024-01-20",
    averageSalesPerDay: 5.2,
    daysUntilStockout: 29,
    status: "OVERSTOCK",
    cost: 180,
    retailPrice: 249
  }
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form] = Form.useForm();

  // Statistics
  const totalItems = inventory.length;
  const inStockItems = inventory.filter(item => item.status === 'IN_STOCK').length;
  const lowStockItems = inventory.filter(item => item.status === 'LOW_STOCK').length;
  const outOfStockItems = inventory.filter(item => item.status === 'OUT_OF_STOCK').length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.variantSku.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdjustStock = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalVisible(true);
    form.setFieldsValue({
      currentStock: item.currentStock,
      reorderPoint: item.reorderPoint,
      maxStock: item.maxStock,
      location: item.location
    });
  };

  const handleModalSubmit = (values: any) => {
    if (editingItem) {
      const updatedItem = {
        ...editingItem,
        ...values,
        availableStock: values.currentStock - editingItem.reservedStock,
        lastRestocked: new Date().toISOString().split('T')[0]
      };

      // Update status based on stock levels
      if (updatedItem.currentStock === 0) {
        updatedItem.status = 'OUT_OF_STOCK';
      } else if (updatedItem.currentStock <= updatedItem.reorderPoint) {
        updatedItem.status = 'LOW_STOCK';
      } else if (updatedItem.currentStock > updatedItem.maxStock) {
        updatedItem.status = 'OVERSTOCK';
      } else {
        updatedItem.status = 'IN_STOCK';
      }

      setInventory(inventory.map(item => 
        item.id === editingItem.id ? updatedItem : item
      ));
      message.success('Stock updated successfully');
    }
    
    setIsModalVisible(false);
    form.resetFields();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_STOCK': return 'green';
      case 'LOW_STOCK': return 'orange';
      case 'OUT_OF_STOCK': return 'red';
      case 'OVERSTOCK': return 'blue';
      default: return 'default';
    }
  };

  const getStockProgress = (item: InventoryItem) => {
    const percentage = (item.currentStock / item.maxStock) * 100;
    let status: "success" | "normal" | "exception" = "normal";
    
    if (item.status === 'OUT_OF_STOCK') status = "exception";
    else if (item.status === 'LOW_STOCK') status = "exception";
    else if (item.status === 'IN_STOCK') status = "success";
    
    return { percentage: Math.min(percentage, 100), status };
  };

  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (record: InventoryItem) => (
        <div>
          <div className="font-medium">{record.productName}</div>
          <div className="text-sm text-gray-500">{record.variantSku}</div>
        </div>
      ),
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (stock: number, record: InventoryItem) => (
        <div>
          <div className="font-medium">{stock} units</div>
          <Progress 
            {...getStockProgress(record)}
            size="small" 
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: 'Available',
      dataIndex: 'availableStock',
      key: 'availableStock',
      render: (available: number, record: InventoryItem) => (
        <div>
          <div>{available} available</div>
          <div className="text-sm text-gray-500">{record.reservedStock} reserved</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: InventoryItem) => (
        <div>
          <Tag color={getStatusColor(status)}>
            {status.replace('_', ' ')}
          </Tag>
          {record.daysUntilStockout > 0 && record.daysUntilStockout <= 7 && (
            <div className="text-xs text-orange-600 mt-1">
              <WarningOutlined /> {record.daysUntilStockout} days left
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Value',
      key: 'value',
      render: (record: InventoryItem) => (
        <div>
          <div>${(record.currentStock * record.cost).toLocaleString()}</div>
          <div className="text-sm text-gray-500">
            Cost: ${record.cost} | Retail: ${record.retailPrice}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: InventoryItem) => (
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleAdjustStock(record)}
          >
            Adjust
          </Button>
        </Space>
      ),
    },
  ];

  // Get alerts for low stock items
  const lowStockAlerts = inventory.filter(item => 
    item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK'
  );

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {lowStockAlerts.length > 0 && (
        <Alert
          message={`${lowStockAlerts.length} items need attention`}
          description={`${outOfStockItems} out of stock, ${lowStockItems} low stock`}
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={() => setStatusFilter('LOW_STOCK')}>
              View All
            </Button>
          }
        />
      )}

      {/* Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Items"
              value={totalItems}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="In Stock"
              value={inStockItems}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Need Reorder"
              value={lowStockItems + outOfStockItems}
              valueStyle={{ color: '#cf1322' }}
              prefix={<TruckOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Value"
              value={totalValue}
              precision={0}
              prefix="$"
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search products or SKU..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              placeholder="Filter by status"
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="IN_STOCK">In Stock</Option>
              <Option value="LOW_STOCK">Low Stock</Option>
              <Option value="OUT_OF_STOCK">Out of Stock</Option>
              <Option value="OVERSTOCK">Overstock</Option>
            </Select>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
          >
            Import Stock
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredInventory}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>

      {/* Stock Adjustment Modal */}
      <Modal
        title="Adjust Stock"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalSubmit}
        >
          {editingItem && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="font-medium">{editingItem.productName}</div>
              <div className="text-sm text-gray-500">{editingItem.variantSku}</div>
            </div>
          )}

          <Form.Item
            name="currentStock"
            label="Current Stock"
            rules={[{ required: true, message: 'Please enter current stock' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Enter current stock quantity"
            />
          </Form.Item>

          <Form.Item
            name="reorderPoint"
            label="Reorder Point"
            rules={[{ required: true, message: 'Please enter reorder point' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Minimum stock level before reordering"
            />
          </Form.Item>

          <Form.Item
            name="maxStock"
            label="Maximum Stock"
            rules={[{ required: true, message: 'Please enter maximum stock' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Maximum stock capacity"
            />
          </Form.Item>

          <Form.Item
            name="location"
            label="Storage Location"
            rules={[{ required: true, message: 'Please enter storage location' }]}
          >
            <Input placeholder="Warehouse location" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}