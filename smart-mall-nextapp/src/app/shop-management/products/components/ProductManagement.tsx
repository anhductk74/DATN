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
  Tooltip,
  Modal,
  Form,
  InputNumber,
  Upload,
  Divider,
  Tabs,
  Badge,
  Switch
} from "antd";
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  UploadOutlined,
  StarFilled
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import type { Product, ProductVariant, ProductAttribute, CreateProductData, UpdateProductData } from "@/services/ProductService";
import AddProductForm from "./AddProductForm";
import EditProductForm from "./EditProductForm";

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

export default function ProductManagement() {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const handleAddProduct = (productData: CreateProductData, images: File[]) => {
    console.log('Creating product:', productData, images);
    // Here you would call the productService.createProduct(productData, images)
    // For now, just close the modal and show success message
    setIsAddModalVisible(false);
    // You could add the new product to mockProducts for demo purposes
  };

  const handleEditProduct = (productId: string, updateData: UpdateProductData, images?: File[]) => {
    console.log('Updating product:', productId, updateData, images);
    // Here you would call the productService.updateProduct(productId, updateData, images)
    // For now, just close the modal and show success message
    setIsEditModalVisible(false);
    setSelectedProduct(null);
    // You could update the product in mockProducts for demo purposes
  };

  // Mock data based on Product interface from productService
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "iPhone 14 Pro Max",
      description: "Latest iPhone with A16 Bionic chip, advanced camera system, and Dynamic Island.",
      brand: "Apple",
      images: [
        "/api/placeholder/400/300",
        "/api/placeholder/400/300",
        "/api/placeholder/400/300"
      ],
      status: "ACTIVE",
      categoryId: "cat1",
      shopId: "shop1",
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-03-15T00:00:00Z",
      averageRating: 4.8,
      reviewCount: 256,
      category: {
        id: "cat1",
        name: "Smartphones",
        description: "Mobile phones and accessories"
      },
      shop: {
        id: "shop1",
        name: "TechWorld Electronics",
        description: "Premium electronics store",
        numberPhone: "+1234567890",
        avatar: "/api/placeholder/100/100",
        ownerId: "owner1",
        ownerName: "John Doe"
      },
      variants: [
        {
          id: "var1",
          sku: "IPH14PM-128-BLK",
          price: 1099,
          stock: 25,
          weight: 240,
          dimensions: "160.7 x 77.6 x 7.85 mm",
          attributes: [
            { id: "attr1", attributeName: "Storage", attributeValue: "128GB" },
            { id: "attr2", attributeName: "Color", attributeValue: "Black" }
          ]
        },
        {
          id: "var2",
          sku: "IPH14PM-256-BLU",
          price: 1199,
          stock: 18,
          weight: 240,
          dimensions: "160.7 x 77.6 x 7.85 mm",
          attributes: [
            { id: "attr3", attributeName: "Storage", attributeValue: "256GB" },
            { id: "attr4", attributeName: "Color", attributeValue: "Blue" }
          ]
        }
      ]
    },
    {
      id: "2",
      name: "Samsung Galaxy S23 Ultra",
      description: "Premium Android smartphone with S Pen, advanced cameras, and powerful performance.",
      brand: "Samsung",
      images: ["/api/placeholder/400/300"],
      status: "ACTIVE",
      categoryId: "cat1",
      shopId: "shop1",
      createdAt: "2024-02-01T00:00:00Z",
      updatedAt: "2024-03-10T00:00:00Z",
      averageRating: 4.6,
      reviewCount: 189,
      category: {
        id: "cat1",
        name: "Smartphones",
        description: "Mobile phones and accessories"
      },
      shop: {
        id: "shop1",
        name: "TechWorld Electronics",
        description: "Premium electronics store",
        numberPhone: "+1234567890"
      },
      variants: [
        {
          id: "var3",
          sku: "SAM-S23U-512-GRN",
          price: 1299,
          stock: 12,
          weight: 234,
          attributes: [
            { id: "attr5", attributeName: "Storage", attributeValue: "512GB" },
            { id: "attr6", attributeName: "Color", attributeValue: "Green" }
          ]
        }
      ]
    },
    {
      id: "3",
      name: "MacBook Air M2",
      description: "Supercharged by M2 chip. Incredibly portable design with exceptional performance.",
      brand: "Apple",
      images: ["/api/placeholder/400/300"],
      status: "OUT_OF_STOCK",
      categoryId: "cat2",
      shopId: "shop1",
      createdAt: "2024-01-20T00:00:00Z",
      updatedAt: "2024-03-05T00:00:00Z",
      averageRating: 4.9,
      reviewCount: 98,
      category: {
        id: "cat2",
        name: "Laptops",
        description: "Portable computers"
      },
      shop: {
        id: "shop1",
        name: "TechWorld Electronics",
        description: "Premium electronics store",
        numberPhone: "+1234567890"
      },
      variants: [
        {
          id: "var4",
          sku: "MBA-M2-256-SLV",
          price: 1299,
          stock: 0,
          weight: 1240,
          attributes: [
            { id: "attr7", attributeName: "Storage", attributeValue: "256GB" },
            { id: "attr8", attributeName: "Color", attributeValue: "Silver" },
            { id: "attr9", attributeName: "RAM", attributeValue: "8GB" }
          ]
        }
      ]
    },
    {
      id: "4",
      name: "AirPods Pro (2nd Gen)",
      description: "Active Noise Cancellation, Spatial Audio, and adaptive transparency.",
      brand: "Apple",
      images: ["/api/placeholder/400/300"],
      status: "INACTIVE",
      categoryId: "cat3",
      shopId: "shop1",
      createdAt: "2024-01-05T00:00:00Z",
      updatedAt: "2024-02-28T00:00:00Z",
      averageRating: 4.5,
      reviewCount: 324,
      category: {
        id: "cat3",
        name: "Audio",
        description: "Headphones and speakers"
      },
      shop: {
        id: "shop1",
        name: "TechWorld Electronics",
        description: "Premium electronics store",
        numberPhone: "+1234567890"
      },
      variants: [
        {
          id: "var5",
          sku: "APP-2GEN-WHT",
          price: 249,
          stock: 45,
          weight: 56,
          attributes: [
            { id: "attr10", attributeName: "Color", attributeValue: "White" },
            { id: "attr11", attributeName: "Connectivity", attributeValue: "Lightning" }
          ]
        }
      ]
    }
  ];

  const categories = [
    { id: "cat1", name: "Smartphones" },
    { id: "cat2", name: "Laptops" },
    { id: "cat3", name: "Audio" },
    { id: "cat4", name: "Accessories" }
  ];

  const statusColors: { [key: string]: string } = {
    ACTIVE: 'green',
    INACTIVE: 'orange',
    OUT_OF_STOCK: 'red',
  };

  const productStats = [
    {
      title: 'Total Products',
      value: mockProducts.length,
      color: '#1890ff',
    },
    {
      title: 'Active Products',
      value: mockProducts.filter(p => p.status === 'ACTIVE').length,
      color: '#52c41a',
    },
    {
      title: 'Out of Stock',
      value: mockProducts.filter(p => p.status === 'OUT_OF_STOCK').length,
      color: '#f5222d',
    },
    {
      title: 'Total Variants',
      value: mockProducts.reduce((sum, product) => sum + product.variants.length, 0),
      color: '#722ed1',
    },
  ];

  const getTotalStock = (product: Product): number => {
    return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  };

  const getMinPrice = (product: Product): number => {
    return Math.min(...product.variants.map(v => v.price));
  };

  const getMaxPrice = (product: Product): number => {
    return Math.max(...product.variants.map(v => v.price));
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'Product',
      key: 'product',
      width: 300,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Image
            width={60}
            height={60}
            src={record.images?.[0] || "/api/placeholder/60/60"}
            alt={record.name}
            className="rounded-md object-cover"
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG8W+nBz+zLgEP6YaBWFuBpUVgZ0U1QmYrUcCAhIzEToiYzkg4zASbWCk5z8hw8z/n6urq6e7qf877e+pMNZd3/fTp+/7O/X37dM/oN8/oNQonAhV4wQGACJQgGHLPCJTgGT2oABGgAiJQgWH3SAnA7hGBChABKiACFaBtJAJEgAgQASJABCgAbaOxe6QEsHu8fACPn/7jc+sOEfjBn37+u3V3iGD3iAAREIEKEAEiQASIABEgAkSACEABKABto7F7pASweyJABKjAzXarCAYfLcTO4ntaFLKGjh//5ve7vr64iogAESACREAEiAARIAJEgAgQASJABIgAEaCYtI3G7pESgN3j5QN4+PhPN+8OEfxh53VEBChmy5fV2dSmZdGnZkdtP0iJwtfLQ9dCqtm/0623ZrznxbU73PdpydWwbV3ox9LaJ/d8+Z2bGCzk1jVkzcdsSMaXZTSVaXbUl2U0nar9wOYrmx///OZdZITxpxY+v/tzOdB1X1dRu0DayUmz3V9upSY3xb892u15EzXZmkLOLAtVZe8e2ddyi9av57etfSUGLa/L8+dK63uo8sZP75cCNgGATouCoT+bxoCXW6HaAOQNKG8yscfK5wPuhh9LlBBXlOp6lcJaFUas4nj5eNooKo1VoE0qtzM6Y6ShV9fd4CW13XDVZ8HQ1fdKMpfMTSjotlhpwhvxrTAXzJSJzslEaa/s8TW+f+1mfZ4yKjBNXJNznW7F0HnuGj1SDJsj1WmekdquHd1r9+uag2ZWxONWCJo89pqyrF5u2yd/enPzfTXQNczzcdMvv94VMa8ZOL2VKOifgkwC8gBszJdPa8Kq0izzlhnUhOz9lr0SCJvCfLHchGaM2qDSNIvX9DrWSWdzVfBp49nP0mwyh2Y8s6VaqB2tLDLRCjHNYeezK7SO5wi6jlbO2lRq5aUtssarv+02Zt47YaxAqxU6Dw29lutrwdEAz2eubPsqSm9VgtI+p2lsi8WIoqxpTKm+0NIBjdLdMhBaAgAAIABJREFU/o5Lwgxk"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900 mb-1">{record.name}</div>
            <div className="text-sm text-gray-500 mb-1">{record.brand}</div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <StarFilled className="text-yellow-400 text-xs" />
                <span className="text-xs">{record.averageRating}</span>
                <span className="text-xs text-gray-400">({record.reviewCount})</span>
              </div>
              <Badge count={record.variants.length} showZero color="blue" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => category?.name || 'N/A'
    },
    {
      title: 'Price Range',
      key: 'priceRange',
      width: 140,
      render: (_, record) => {
        const minPrice = getMinPrice(record);
        const maxPrice = getMaxPrice(record);
        return (
          <div>
            {minPrice === maxPrice ? (
              <span className="font-medium">${minPrice}</span>
            ) : (
              <span className="font-medium">${minPrice} - ${maxPrice}</span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Total Stock',
      key: 'totalStock',
      width: 100,
      render: (_, record) => {
        const totalStock = getTotalStock(record);
        return (
          <span 
            className={
              totalStock === 0 ? 'text-red-500 font-medium' :
              totalStock < 10 ? 'text-orange-500 font-medium' :
              'text-green-600 font-medium'
            }
          >
            {totalStock}
          </span>
        );
      },
      sorter: (a, b) => getTotalStock(a) - getTotalStock(b),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={statusColors[status]}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => {
                setSelectedProduct(record);
                setIsDetailModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Product">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => {
                setSelectedProduct(record);
                setIsEditModalVisible(true);
              }}
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

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase()) ||
      product.variants.some(v => v.sku.toLowerCase().includes(searchText.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const renderProductDetailModal = () => (
    <Modal
      title="Product Details"
      open={isDetailModalVisible}
      onCancel={() => setIsDetailModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
          Close
        </Button>,
        <Button key="edit" type="primary" onClick={() => {
          setIsDetailModalVisible(false);
          setIsEditModalVisible(true);
        }}>
          Edit Product
        </Button>
      ]}
      width={800}
    >
      {selectedProduct && (
        <div className="space-y-6">
          {/* Product Images */}
          <div>
            <h4 className="font-medium mb-3">Product Images</h4>
            <div className="flex gap-2">
              {selectedProduct.images?.map((image, index) => (
                <Image
                  key={index}
                  width={100}
                  height={100}
                  src={image}
                  alt={`${selectedProduct.name} ${index + 1}`}
                  className="rounded-md object-cover"
                />
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <Row gutter={16}>
            <Col span={12}>
              <div>
                <h4 className="font-medium mb-2">Basic Information</h4>
                <div className="space-y-2">
                  <div><strong>Name:</strong> {selectedProduct.name}</div>
                  <div><strong>Brand:</strong> {selectedProduct.brand}</div>
                  <div><strong>Category:</strong> {selectedProduct.category?.name}</div>
                  <div><strong>Status:</strong> 
                    <Tag color={statusColors[selectedProduct.status]} className="ml-2">
                      {selectedProduct.status.replace('_', ' ')}
                    </Tag>
                  </div>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <h4 className="font-medium mb-2">Statistics</h4>
                <div className="space-y-2">
                  <div><strong>Rating:</strong> 
                    <span className="ml-2 flex items-center gap-1">
                      <StarFilled className="text-yellow-400" />
                      {selectedProduct.averageRating} ({selectedProduct.reviewCount} reviews)
                    </span>
                  </div>
                  <div><strong>Total Stock:</strong> {getTotalStock(selectedProduct)}</div>
                  <div><strong>Variants:</strong> {selectedProduct.variants.length}</div>
                  <div><strong>Created:</strong> {new Date(selectedProduct.createdAt!).toLocaleDateString()}</div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Description */}
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <div className="text-gray-600">{selectedProduct.description}</div>
          </div>

          {/* Variants */}
          <div>
            <h4 className="font-medium mb-3">Product Variants</h4>
            <Table
              dataSource={selectedProduct.variants}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'SKU',
                  dataIndex: 'sku',
                  key: 'sku',
                },
                {
                  title: 'Price',
                  dataIndex: 'price',
                  key: 'price',
                  render: (price) => `$${price}`,
                },
                {
                  title: 'Stock',
                  dataIndex: 'stock',
                  key: 'stock',
                },
                {
                  title: 'Attributes',
                  dataIndex: 'attributes',
                  key: 'attributes',
                  render: (attributes: ProductAttribute[]) => (
                    <div className="space-x-1">
                      {attributes.map((attr) => (
                        <Tag key={attr.id}>
                          {attr.attributeName}: {attr.attributeValue}
                        </Tag>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      )}
    </Modal>
  );

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
              placeholder="Search products, SKU, brand..."
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
                <Option key={category.id} value={category.id}>{category.name}</Option>
              ))}
            </Select>
            <Select
              placeholder="Status"
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">All Status</Option>
              <Option value="ACTIVE">Active</Option>
              <Option value="INACTIVE">Inactive</Option>
              <Option value="OUT_OF_STOCK">Out of Stock</Option>
            </Select>
          </div>
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsAddModalVisible(true)}
          >
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
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} products`,
          }}
          scroll={{ x: 1400 }}
          rowSelection={{
            type: 'checkbox',
            onChange: (selectedRowKeys, selectedRows) => {
              console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            },
          }}
        />
      </Card>

      {/* Product Detail Modal */}
      {renderProductDetailModal()}

      {/* Add Product Form */}
      <AddProductForm
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSubmit={handleAddProduct}
      />

      {/* Edit Product Form */}
      <EditProductForm
        visible={isEditModalVisible}
        product={selectedProduct}
        onCancel={() => {
          setIsEditModalVisible(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleEditProduct}
      />
    </div>
  );
}