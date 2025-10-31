"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  Alert,
  Spin
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
import productService, { Product, ProductVariant } from "@/services/ProductService";
import shopService from "@/services/ShopService";
import categoryService, { Category } from "@/services/CategoryService";

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
  categoryName?: string;
  brand?: string;
}

export default function InventoryPage() {
  const { data: session } = useSession();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form] = Form.useForm();

  // Fetch shop ID first
  useEffect(() => {
    if (session?.user?.id) {
      fetchShopId();
    }
  }, [session]);

  const fetchShopId = async () => {
    if (!session?.user?.id) {
      message.warning('Please login to view inventory');
      setLoading(false);
      return;
    }

    try {
      const response = await shopService.getShopsByOwner(session.user.id);
      const shops = response.data;
      
      if (shops && shops.length > 0) {
        setShopId(shops[0].id);
      } else {
        message.warning('No shop found for this account. Please create a shop first.');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error fetching shop:', error);
      message.error(error.response?.data?.message || 'Failed to load shop information');
      setLoading(false);
    }
  };

  // Fetch inventory when shopId is available
  useEffect(() => {
    if (shopId) {
      fetchInventory();
    }
  }, [shopId]);

  const fetchInventory = async () => {
    if (!shopId) return;

    setLoading(true);
    try {
      // Fetch products and categories in parallel
      const [products, categoriesData] = await Promise.all([
        productService.getProductsByShop(shopId),
        categoryService.getAllCategories()
      ]);
      
      setCategories(categoriesData);
      
      // Create category lookup map for better performance
      const categoryMap = new Map(
        categoriesData.map(cat => [cat.id, cat.name])
      );
      
      console.log('Category map:', Object.fromEntries(categoryMap));
      
      // Convert products to inventory items
      const inventoryItems: InventoryItem[] = [];
      
      products.forEach((product: Product) => {
        // Get category name from map
        const categoryName = categoryMap.get(product.categoryId || product.category?.id || '');
        
        console.log(`Product: ${product.name}, CategoryId: ${product.categoryId}, Category Name: ${categoryName}`);
        
        product.variants?.forEach((variant: ProductVariant) => {
          // Calculate status based on stock
          let status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' = 'IN_STOCK';
          const reorderPoint = 20; // Default reorder point
          const maxStock = 100; // Default max stock
          
          if (variant.stock === 0) {
            status = 'OUT_OF_STOCK';
          } else if (variant.stock <= reorderPoint) {
            status = 'LOW_STOCK';
          } else if (variant.stock > maxStock) {
            status = 'OVERSTOCK';
          }

          const averageSalesPerDay = 2.5; // Mock value - should come from analytics
          const daysUntilStockout = variant.stock > 0 
            ? Math.floor(variant.stock / averageSalesPerDay) 
            : 0;

          inventoryItems.push({
            id: variant.id || `${product.id}-${variant.sku}`,
            productId: product.id || '',
            productName: product.name,
            variantSku: variant.sku,
            currentStock: variant.stock,
            reservedStock: 0, // Mock value - should come from orders
            availableStock: variant.stock,
            reorderPoint,
            maxStock,
            location: "Main Warehouse", // Mock value
            lastRestocked: product.updatedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
            averageSalesPerDay,
            daysUntilStockout,
            status,
            cost: variant.price * 0.7, // Mock cost (70% of retail)
            retailPrice: variant.price,
            categoryName: categoryName,
            brand: product.brand
          });
        });
      });

      setInventory(inventoryItems);
    } catch (error: any) {
      console.error('Error fetching inventory:', error);
      message.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

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

  const handleModalSubmit = async (values: any) => {
    if (!editingItem) return;

    try {
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

      // Update local state
      setInventory(inventory.map(item => 
        item.id === editingItem.id ? updatedItem : item
      ));

      message.success('Stock updated successfully');
      
      // Close modal and reset form
      setIsModalVisible(false);
      setEditingItem(null);
      form.resetFields();
    } catch (error: any) {
      console.error('Error updating stock:', error);
      message.error('Failed to update stock');
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading inventory..." />
      </div>
    );
  }

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
          setEditingItem(null);
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
            <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="font-semibold text-lg">{editingItem.productName}</div>
              <div className="text-sm text-gray-600">SKU: {editingItem.variantSku}</div>
              {editingItem.categoryName && (
                <div className="text-sm text-gray-600">Category: <span className="font-medium">{editingItem.categoryName}</span></div>
              )}
              {editingItem.brand && (
                <div className="text-sm text-gray-600">Brand: <span className="font-medium">{editingItem.brand}</span></div>
              )}
              <div className="text-sm text-blue-600">Current Price: ${editingItem.retailPrice.toLocaleString()}</div>
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