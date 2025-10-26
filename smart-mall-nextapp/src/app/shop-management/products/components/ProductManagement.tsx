"use client";

import { useState, useEffect, useRef } from "react";
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
  Switch,
  Popconfirm,
  Spin
} from "antd";
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  UploadOutlined,
  StarFilled,
  ExclamationCircleOutlined,
  UndoOutlined
} from "@ant-design/icons";
import { getCloudinaryUrl } from "@/config/config";
import { useSession } from "next-auth/react";
import { useAntdApp } from "@/hooks/useAntdApp";
import type { ColumnsType } from 'antd/es/table';
import type { Product, ProductVariant, ProductAttribute, CreateProductData, UpdateProductData } from "@/services/ProductService";
import productService from "@/services/ProductService";
import categoryService from "@/services/CategoryService";
import shopService from "@/services/ShopService";
import type { Category } from "@/services/CategoryService";
import AddProductForm, { AddProductFormRef } from "./AddProductForm";
import EditProductForm from "./EditProductForm";

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

export default function ProductManagement() {
  const { data: session } = useSession();
  const { message } = useAntdApp();
  const addFormRef = useRef<AddProductFormRef>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'deleted'>('active'); // Tab mode
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);

  // Fetch shop ID first, then products/categories
  useEffect(() => {
    if (session?.user?.id) {
      fetchShopId();
    }
  }, [session]);

  const fetchShopId = async () => {
    if (!session?.user?.id) {
      message.warning('Please login to view your products');
      return;
    }

    try {
      // Get shop by owner ID (user ID)
      const response = await shopService.getShopsByOwner(session.user.id);
      const shops = response.data;
      
      if (shops && shops.length > 0) {
        // Assume user has one shop, take the first one
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

  // Fetch products when shopId is available or viewMode changes
  useEffect(() => {
    if (shopId) {
      fetchData();
    }
  }, [shopId, viewMode]);

  const fetchData = async () => {
    if (!shopId) {
      return;
    }

    setLoading(true);
    try {
      // Fetch products based on view mode
      let productsData: Product[];
      if (viewMode === 'deleted') {
        productsData = await productService.getDeletedProducts();
        // Filter by shop
        productsData = productsData.filter(p => p.shopId === shopId);
      } else if (viewMode === 'all') {
        productsData = await productService.getAllProductsIncludingDeleted();
        // Filter by shop
        productsData = productsData.filter(p => p.shopId === shopId);
      } else {
        // Active products only (default behavior)
        productsData = await productService.getProductsByShop(shopId);
      }

      const categoriesData = await categoryService.getAllCategories();
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      message.error(error.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData: CreateProductData, images: File[]) => {
    setSubmitting(true);
    try {
      const newProduct = await productService.createProduct(productData, images);
      message.success('Product created successfully!');
      // Close modal and reset form after success
      setIsAddModalVisible(false);
      addFormRef.current?.resetForm();
      // Refresh products list
      await fetchData();
    } catch (error: any) {
      console.error('Error creating product:', error);
      message.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = async (productId: string, updateData: UpdateProductData, images?: File[]) => {
    setSubmitting(true);
    try {
      await productService.updateProduct(productId, updateData, images);
      message.success('Product updated successfully!');
      setIsEditModalVisible(false);
      setSelectedProduct(null);
      // Refresh products list
      await fetchData();
    } catch (error: any) {
      console.error('Error updating product:', error);
      message.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      if (viewMode === 'deleted') {
        // Hard delete (permanent)
        await productService.deleteProduct(productId);
        message.success('Product permanently deleted!');
      } else {
        // Soft delete
        await productService.softDeleteProduct(productId);
        message.success('Product moved to trash!');
      }
      // Refresh products list
      await fetchData();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      message.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleRestoreProduct = async (productId: string) => {
    try {
      await productService.restoreProduct(productId);
      message.success('Product restored successfully!');
      // Refresh products list
      await fetchData();
    } catch (error: any) {
      console.error('Error restoring product:', error);
      message.error(error.response?.data?.message || 'Failed to restore product');
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      const duplicateData: CreateProductData = {
        name: `${product.name} (Copy)`,
        description: product.description,
        brand: product.brand,
        categoryId: product.categoryId,
        shopId: product.shopId,
        status: 'INACTIVE', // Set as inactive for review
        variants: (product.variants || []).map(v => ({
          sku: `${v.sku}-COPY`,
          price: v.price,
          stock: 0, // Reset stock for duplicate
          weight: v.weight,
          dimensions: v.dimensions,
          attributes: (v.attributes || []).map(a => ({
            attributeName: a.attributeName,
            attributeValue: a.attributeValue
          }))
        }))
      };
      
      await productService.createProduct(duplicateData);
      message.success('Product duplicated successfully!');
      await fetchData();
    } catch (error: any) {
      console.error('Error duplicating product:', error);
      message.error(error.response?.data?.message || 'Failed to duplicate product');
    }
  };

  // Calculate statistics based on view mode
  const productStats = [
    {
      title: 'Total Products',
      value: viewMode === 'active' ? products.length : products.filter(p => !p.isDeleted).length,
      color: '#1890ff',
    },
    {
      title: 'Active Products',
      value: products.filter(p => p.status === 'ACTIVE' && !p.isDeleted).length,
      color: '#52c41a',
    },
    {
      title: 'Out of Stock',
      value: products.filter(p => p.status === 'OUT_OF_STOCK' && !p.isDeleted).length,
      color: '#f5222d',
    },
    {
      title: viewMode === 'deleted' ? 'Deleted Products' : 'Total Variants',
      value: viewMode === 'deleted' 
        ? products.filter(p => p.isDeleted).length
        : products.reduce((sum, product) => sum + (product.variants?.length || 0), 0),
      color: viewMode === 'deleted' ? '#ff4d4f' : '#722ed1',
    },
  ];

  const statusColors: { [key: string]: string } = {
    ACTIVE: 'green',
    INACTIVE: 'orange',
    OUT_OF_STOCK: 'red',
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase()) ||
      (product.variants || []).some(v => v.sku.toLowerCase().includes(searchText.toLowerCase()));
    
    // Handle both categoryId and nested category.id
    const productCategoryId = product.categoryId || product.category?.id;
    const matchesCategory = categoryFilter === 'all' || productCategoryId === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getTotalStock = (product: Product): number => {
    return (product.variants || []).reduce((sum, variant) => sum + variant.stock, 0);
  };

  const getMinPrice = (product: Product): number => {
    if (!product.variants || product.variants.length === 0) return 0;
    return Math.min(...product.variants.map(v => v.price));
  };

  const getMaxPrice = (product: Product): number => {
    if (!product.variants || product.variants.length === 0) return 0;
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
            src={getCloudinaryUrl(record.images?.[0] || "/api/placeholder/60/60")}
            alt={record.name}
            className="rounded-md object-cover"
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG8W+nBz+zLgEP6YaBWFuBpUVgZ0U1QmYrUcCAhIzEToiYzkg4zASbWCk5z8hw8z/n6urq6e7qf877e+pMNZd3/fTp+/7O/X37dM/oN8/oNQonAhV4wQGACJQgGHLPCJTgGT2oABGgAiJQgWH3SAnA7hGBChABKiACFaBtJAJEgAgQASJABCgAbaOxe6QEsHu8fACPn/7jc+sOEfjBn37+u3V3iGD3iAAREIEKEAEiQASIABEgAkSACEABKABto7F7pASweyJABKjAzXarCAYfLcTO4ntaFLKGjh//5ve7vr64iogAESACREAEiAARIAJEgAgQASJABIgAEaCYtI3G7pESgN3j5QN4+PhPN+8OEfxh53VEBChmy5fV2dSmZdGnZkdtP0iJwtfLQ9dCqtm/0623ZrznxbU73PdpydWwbV3ox9LaJ/d8+Z2bGCzk1jVkzcdsSMaXZTSVaXbUl2U0nar9wOYrmx///OZdZITxpxY+v/tzOdB1X1dRu0DayUmz3V9upSY3xb892u15EzXZmkLOLAtVZe8e2ddyi9av57etfSUGLa/L8+dK63uo8sZP75cCNgGATouCoT+bxoCXW6HaAOQNKG8yscfK5wPuhh9LlBBXlOp6lcJaFUas4nj5eNooKo1VoE0qtzM6Y6ShV9fd4CW13XDVZ8HQ1fdKMpfMTSjotlhpwhvxrTAXzJSJzslEaa/s8TW+f+1mfZ4yKjBNXJNznW7F0HnuGj1SDJsj1WmekdquHd1r9+uag2ZWxONWCJo89pqyrF5u2yd/enPzfTXQNczzcdMvv94VMa8ZOL2VKOifgkwC8gBszJdPa8Kq0izzlhnUhOz9lr0SCJvCfLHchGaM2qDSNIvX9DrWSWdzVfBp49nP0mwyh2Y8s6VaqB2tLDLRCjHNYeezK7SO5wi6jlbO2lRq5aUtssarv+02Zt47YaxAqxU6Dw29lutrwdEAz2eubPsqSm9VgtI+p2lsi8WIoqxpTKm+0NIBjdLdMhBaAgAAIABJREFU/o5Lwgxk"
            style={{ opacity: record.isDeleted ? 0.5 : 1 }}
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900 mb-1">
              {record.name}
              {record.isDeleted && (
                <Tag color="red" className="ml-2">DELETED</Tag>
              )}
            </div>
            <div className="text-sm text-gray-500 mb-1">{record.brand}</div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <StarFilled className="text-yellow-400 text-xs" />
                <span className="text-xs">{record.averageRating}</span>
                <span className="text-xs text-gray-400">({record.reviewCount})</span>
              </div>
              <Badge count={record.variants?.length || 0} showZero color="blue" />
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
      width: 200,
      render: (_, record) => {
        const isDeleted = record.isDeleted;
        
        return (
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
            
            {!isDeleted && (
              <>
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
                    onClick={() => handleDuplicateProduct(record)}
                  />
                </Tooltip>
              </>
            )}
            
            {isDeleted ? (
              <>
                <Tooltip title="Restore Product">
                  <Popconfirm
                    title="Restore Product"
                    description="Do you want to restore this product?"
                    onConfirm={() => handleRestoreProduct(record.id!)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button 
                      type="text" 
                      icon={<UndoOutlined />}
                      size="small"
                      style={{ color: '#52c41a' }}
                    />
                  </Popconfirm>
                </Tooltip>
                <Tooltip title="Delete Permanently">
                  <Popconfirm
                    title="Permanently Delete Product"
                    description="Are you sure? This action CANNOT be undone!"
                    onConfirm={() => handleDeleteProduct(record.id!)}
                    okText="Yes, Delete Forever"
                    cancelText="Cancel"
                    icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                  >
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />} 
                      size="small"
                      danger
                    />
                  </Popconfirm>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Move to Trash">
                <Popconfirm
                  title="Move to Trash"
                  description="Move this product to trash? You can restore it later."
                  onConfirm={() => handleDeleteProduct(record.id!)}
                  okText="Yes"
                  cancelText="No"
                  icon={<ExclamationCircleOutlined style={{ color: 'orange' }} />}
                >
                  <Button 
                    type="text" 
                    icon={<DeleteOutlined />} 
                    size="small"
                    danger
                  />
                </Popconfirm>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

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
                  src={getCloudinaryUrl(image)}
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
                  <div><strong>Variants:</strong> {selectedProduct.variants?.length || 0}</div>
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
              dataSource={selectedProduct.variants || []}
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
                      {(attributes || []).map((attr, index) => (
                        <Tag key={attr.id || index}>
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
      <Spin spinning={loading} tip="Loading products...">
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
          {/* View Mode Tabs */}
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
              {viewMode !== 'deleted' && (
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
              )}
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
            loading={loading}
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
      </Spin>

      {/* Product Detail Modal */}
      {renderProductDetailModal()}

      {/* Add Product Form */}
      <AddProductForm
        ref={addFormRef}
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSubmit={handleAddProduct}
        loading={submitting}
        shopId={shopId || undefined}
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
        loading={submitting}
      />
    </div>
  );
}