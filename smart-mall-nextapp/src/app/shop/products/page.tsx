"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./styles.css";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Space,
  Tag,
  Image,
  Popconfirm,
  Card,
  Statistic,
  Row,
  Col,
  InputNumber,
  App
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  ShopOutlined,
  ProductOutlined,
  DollarOutlined,
  StockOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  FolderOutlined
} from "@ant-design/icons";
import { productService, categoryService, Product, ProductVariant, Category } from "@/services";
import { CLOUDINARY_API_URL } from "@/config/config";

const { TextArea } = Input;
const { Option } = Select;

export default function ShopProductsPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId');
  const shopName = searchParams.get('shopName');

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [removedVariantIds, setRemovedVariantIds] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to fetch categories");
      // Fallback to mock categories
      const mockCategories: Category[] = [
        {
          id: "cat1",
          name: "Electronics",
          description: "Electronic devices and accessories",
          parent: null,
          subCategories: [],
          createdAt: "2024-01-01T00:00:00",
          updatedAt: "2024-01-01T00:00:00"
        },
        {
          id: "cat2",
          name: "Fashion",
          description: "Clothing and accessories",
          parent: null,
          subCategories: [],
          createdAt: "2024-01-01T00:00:00",
          updatedAt: "2024-01-01T00:00:00"
        },
        {
          id: "cat3",
          name: "Home & Garden",
          description: "Home improvement and garden supplies",
          parent: null,
          subCategories: [],
          createdAt: "2024-01-01T00:00:00",
          updatedAt: "2024-01-01T00:00:00"
        }
      ];
      setCategories(mockCategories);
    } finally {
      setCategoriesLoading(false);
    }
  }, [message]);

  const fetchProducts = useCallback(async () => {
    if (!shopId) return;
    
    setLoading(true);
    try {
      const data = await productService.getProductsByShop(shopId);
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Failed to fetch products");
      // Fallback to mock data for demo
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "iPhone 15 Pro Max",
          description: "Điện thoại iPhone 15 Pro Max 256GB",
          brand: "Apple",
          images: ["/api/placeholder/200/200"],
          status: "ACTIVE",
          categoryId: "cat1",
          shopId: shopId,
          createdAt: "2024-01-15T10:30:00",
          updatedAt: "2024-01-15T10:30:00",
          averageRating: 4.8,
          reviewCount: 125,
          variants: [
            {
              id: "var1",
              sku: "IPHONE15PM-256GB-TN",
              price: 29990000,
              stock: 50,
              weight: 0.221,
              dimensions: "159.9 x 76.7 x 8.25 mm",
              attributes: [
                { id: "attr1", attributeName: "Storage", attributeValue: "256GB" },
                { id: "attr2", attributeName: "Color", attributeValue: "Titan Natural" }
              ]
            }
          ]
        }
      ];
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  }, [shopId, message]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (shopId) {
      fetchProducts();
    }
  }, [shopId, fetchProducts]);

  // Filter products based on search term and status
  useEffect(() => {
    let filtered = [...(products || [])];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product?.variants && Array.isArray(product.variants) && product.variants.some(variant => 
          variant?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(product => product?.status === statusFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, statusFilter]);

  const handleAdd = () => {
    setEditingProduct(null);
    setRemovedVariantIds([]); // Reset removed variants
    form.resetFields();
    // Set default values for new product
    form.setFieldsValue({
      status: "ACTIVE",
      variants: [
        {
          attributes: [
            { attributeName: "Color", attributeValue: "" },
            { attributeName: "Size", attributeValue: "" }
          ]
        }
      ]
    });
    setIsModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setRemovedVariantIds([]); // Reset removed variants for new edit session
    
    // Convert existing images to fileList format for display
    const existingImages = product.images?.map((url, index) => {
      // Ensure proper URL format for display
      const fullUrl = url.startsWith('http') ? url : `${CLOUDINARY_API_URL}${url}`;
      return {
        uid: `existing-${index}`,
        name: `image-${index}`,
        status: 'done' as const,
        url: fullUrl,
        thumbUrl: fullUrl
      };
    }) || [];

    form.setFieldsValue({
      name: product.name,
      description: product.description,
      brand: product.brand,
      status: product.status,
      categoryId: product.category?.id,
      images: existingImages,
      variants: product.variants.map(variant => ({
        id: variant.id, // Include id for update
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        weight: variant.weight,
        dimensions: variant.dimensions,
        attributes: variant.attributes.map(attr => ({
          attributeName: attr.attributeName,
          attributeValue: attr.attributeValue
        }))
      }))
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (productId: string) => {
    try {
      await productService.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      message.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      message.error("Failed to delete product");
    }
  };

  interface FormValues {
    name: string;
    description: string;
    brand: string;
    status: string;
    categoryId: string;
    images?: { uid: string; name: string; status?: string; originFileObj?: File }[]; // Upload fileList
    variants: {
      id?: string;
      sku: string;
      price: number;
      stock: number;
      weight?: number;
      dimensions?: string;
      attributes: {
        attributeName: string;
        attributeValue: string;
      }[];
    }[];
  }

  const handleSubmit = async (values: FormValues) => {
    if (!shopId) return;
    
    try {
      setLoading(true);
      
      // Validate categoryId
      if (!values.categoryId) {
        message.error("Please select a category for the product");
        return;
      }

      const productData = {
        name: values.name,
        description: values.description,
        brand: values.brand,
        status: values.status as "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK",
        categoryId: values.categoryId,
        shopId: shopId,
        variants: values.variants?.map(variant => {
          // Nếu có id thì là update variant, không có id thì là tạo mới
          return editingProduct ? {
            ...variant,
            id: variant.id || undefined // Giữ id nếu có (update), bỏ nếu không có (create)
          } : variant;
        }) || [],
        // Include removed variant IDs for update operation
        ...(editingProduct && removedVariantIds.length > 0 && {
          removedVariantIds: removedVariantIds
        })
      };

      // Extract image files from fileList
      const imageFiles = values.images?.map(file => file.originFileObj).filter(Boolean) as File[] || [];

      // Debug log
      console.log('Product data to be sent:', productData);
      console.log('Removed variant IDs:', removedVariantIds);

      if (editingProduct && editingProduct.id) {
        // Update product - sử dụng unified API PUT /api/products/{id}
        // Nếu có images thì gửi cả data và images, không thì chỉ gửi data
        await productService.updateProduct(
          editingProduct.id, 
          productData, 
          imageFiles.length > 0 ? imageFiles : undefined
        );
        message.success("Product updated successfully");
      } else {
        // Create product - có thể tạo với hoặc không có images
        if (imageFiles.length > 0) {
          await productService.createProduct(productData, imageFiles);
        } else {
          await productService.createProductSimple(productData);
        }
        message.success("Product created successfully");
      }
      
      setIsModalVisible(false);
      setRemovedVariantIds([]); // Reset after successful save
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      message.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (values: { name: string; description?: string; parentId?: string }) => {
    try {
      await categoryService.createCategory(values);
      message.success("Category created successfully");
      categoryForm.resetFields();
      await fetchCategories(); // Refresh categories list
    } catch (error) {
      console.error("Error creating category:", error);
      message.error("Failed to create category");
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "images",
      key: "images",
      width: 80,
      render: (images: string[]) => (
        images && Array.isArray(images) && images.length > 0 ? (
          <Image
            width={60}
            height={60}
            src={`${CLOUDINARY_API_URL}${images[0]}`}
            alt="Product"
            className="rounded-lg object-cover"
          />
        ) : (
          <div className="w-15 h-15 bg-gray-200 rounded-lg flex items-center justify-center">
            <ProductOutlined className="text-gray-400" />
          </div>
        )
      )
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Product) => (
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">{record.brand}</div>
          <div className="text-xs text-blue-600 flex items-center mt-1">
            <FolderOutlined className="mr-1" />
            {categories.find(cat => cat.id === record.categoryId)?.name || "Uncategorized"}
          </div>
        </div>
      )
    },
    {
      title: "SKU",
      dataIndex: "variants",
      key: "sku",
      render: (variants: ProductVariant[]) => (
        <span className="font-mono text-sm">{variants[0]?.sku || "N/A"}</span>
      )
    },
    {
      title: "Price",
      dataIndex: "variants",
      key: "price",
      render: (variants: ProductVariant[]) => (
        <span className="font-semibold text-green-600">
          {variants[0]?.price?.toLocaleString("vi-VN")} VND
        </span>
      )
    },
    {
      title: "Stock",
      dataIndex: "variants",
      key: "stock",
      render: (variants: ProductVariant[]) => {
        const stock = variants[0]?.stock || 0;
        return (
          <Tag color={stock > 10 ? "green" : stock > 0 ? "orange" : "red"}>
            {stock} items
          </Tag>
        );
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "red";
        if (status === "ACTIVE") color = "green";
        else if (status === "OUT_OF_STOCK") color = "orange";
        
        return (
          <Tag color={color}>
            {status === "OUT_OF_STOCK" ? "Out of Stock" : status}
          </Tag>
        );
      }
    },
    {
      title: "Rating",
      key: "rating",
      render: (record: Product) => (
        <div className="text-center">
          <div className="font-semibold">{record.averageRating?.toFixed(1) || "N/A"}</div>
          <div className="text-xs text-gray-500">({record.reviewCount || 0} reviews)</div>
        </div>
      )
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (record: Product) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => router.push(`/product/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => record.id && handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Statistics calculations
  const totalProducts = products?.length || 0;
  const activeProducts = products?.filter(p => p?.status === "ACTIVE")?.length || 0;
  const totalStock = products?.reduce((sum, p) => sum + (p?.variants?.[0]?.stock || 0), 0) || 0;
  const averagePrice = products?.length > 0 
    ? (products?.reduce((sum, p) => sum + (p?.variants?.[0]?.price || 0), 0) || 0) / products.length 
    : 0;

  if (!shopId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="text-center shadow-2xl border-0 rounded-3xl p-8 max-w-md">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShopOutlined className="text-4xl text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Shop Selected</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Please select a shop to manage products. You need to have an active shop to continue.
          </p>
          <Button 
            type="primary" 
            size="large"
            onClick={() => router.push('/shop')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Go to My Shop
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                <ShopOutlined className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {shopName || "Shop"} - Product Management
                </h1>
                <p className="text-blue-100 flex items-center">
                  <ProductOutlined className="mr-2" />
                  Manage your shop&apos;s products inventory with ease
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                type="default"
                size="large"
                onClick={() => router.push('/shop')}
                className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20"
              >
                Back to Shop
              </Button>
              <Button
                type="default"
                size="large"
                icon={<SettingOutlined />}
                onClick={() => setIsCategoryModalVisible(true)}
                className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20"
              >
                Manage Categories
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                className="bg-white text-blue-600 hover:bg-blue-50 border-0 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Add New Product
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <Row gutter={[24, 24]} className="mb-8 -mt-8 relative z-10">
          <Col xs={24} sm={12} md={6}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <Statistic
                    title={<span className="text-blue-800 font-semibold">Total Products</span>}
                    value={totalProducts}
                    valueStyle={{ color: "#1e40af", fontSize: "2rem", fontWeight: "700" }}
                  />
                </div>
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <ProductOutlined className="text-white text-2xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <Statistic
                    title={<span className="text-green-800 font-semibold">Active Products</span>}
                    value={activeProducts}
                    valueStyle={{ color: "#166534", fontSize: "2rem", fontWeight: "700" }}
                  />
                </div>
                <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center">
                  <EyeOutlined className="text-white text-2xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <Statistic
                    title={<span className="text-orange-800 font-semibold">Total Stock</span>}
                    value={totalStock}
                    valueStyle={{ color: "#9a3412", fontSize: "2rem", fontWeight: "700" }}
                  />
                </div>
                <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center">
                  <StockOutlined className="text-white text-2xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <Statistic
                    title={<span className="text-purple-800 font-semibold">Avg Price</span>}
                    value={averagePrice}
                    precision={0}
                    suffix={<span className="text-sm">VND</span>}
                    valueStyle={{ color: "#581c87", fontSize: "1.8rem", fontWeight: "700" }}
                  />
                </div>
                <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center">
                  <DollarOutlined className="text-white text-2xl" />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Products Table */}
        <Card 
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ProductOutlined className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Products List</h3>
                  <p className="text-sm text-gray-500">Manage all your products from here</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Input.Search
                  placeholder="Search products..."
                  style={{ width: 250 }}
                  allowClear
                  className="rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onSearch={(value) => setSearchTerm(value)}
                />
                <Select
                  placeholder="Filter by status"
                  style={{ width: 150 }}
                  allowClear
                  className="rounded-lg"
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                >
                  <Option value="ACTIVE">Active</Option>
                  <Option value="INACTIVE">Inactive</Option>
                  <Option value="OUT_OF_STOCK">Out of Stock</Option>
                </Select>
              </div>
            </div>
          } 
          className="shadow-lg border-0 rounded-2xl overflow-hidden"
          styles={{ body: { padding: 0 } }}
        >
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} products`,
              className: "px-6 pb-4"
            }}
            scroll={{ x: 1000 }}
            className="custom-table"
            rowClassName="hover:bg-gray-50 transition-colors"
            locale={{
              emptyText: (
                <div className="py-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ProductOutlined className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter 
                      ? "Try adjusting your search or filter criteria"
                      : "Start by adding your first product to this shop"
                    }
                  </p>
                  {!searchTerm && !statusFilter && (
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={handleAdd}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add Your First Product
                    </Button>
                  )}
                </div>
              )
            }}
          />
        </Card>
      </div>

      {/* Add/Edit Product Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ProductOutlined className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <p className="text-sm text-gray-500">
                {editingProduct ? "Update product information" : "Create a new product for your shop"}
              </p>
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setRemovedVariantIds([]); // Reset when closing modal
        }}
        footer={null}
        width={1000}
        className="product-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-6"
          initialValues={{
            status: "ACTIVE",
            variants: [
              {
                attributes: [
                  { attributeName: "Color", attributeValue: "" },
                  { attributeName: "Size", attributeValue: "" }
                ]
              }
            ]
          }}
        >
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
              Basic Information
            </h4>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Product Name"
                  rules={[{ required: true, message: "Please enter product name" }]}
                >
                  <Input 
                    placeholder="e.g. iPhone 15 Pro Max" 
                    className="h-12"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="brand"
                  label="Brand"
                  rules={[{ required: true, message: "Please enter brand" }]}
                >
                  <Input 
                    placeholder="e.g. Apple, Samsung, Sony" 
                    className="h-12"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <TextArea 
                rows={4} 
                placeholder="Describe your product features, specifications, and benefits..."
                className="resize-none"
              />
            </Form.Item>

            <Row gutter={16}>  
              <Col span={12}>
                {editingProduct && editingProduct.category && (
                  <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-600 font-medium mb-1">Current Category:</div>
                    <div className="flex items-center text-sm text-blue-800">
                      <FolderOutlined className="mr-2" />
                      {editingProduct.category.name}
                      {editingProduct.category.description && (
                        <span className="text-blue-600 ml-2">- {editingProduct.category.description}</span>
                      )}
                    </div>
                  </div>
                )}
                <Form.Item
                  name="categoryId"
                  label={
                    <div className="flex items-center justify-between">
                      <span>Category</span>
                      <Button 
                        type="link" 
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => setIsCategoryModalVisible(true)}
                        className="text-blue-600 p-0 h-auto"
                      >
                        Manage Categories
                      </Button>
                    </div>
                  }
                  rules={[{ required: true, message: "Please select category" }]}
                >
                  <Select 
                    placeholder="Select product category" 
                    className="h-12"
                    loading={categoriesLoading}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                    }
                    notFoundContent={categoriesLoading ? "Loading..." : "No categories found"}
                  >
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>
                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center">
                            <FolderOutlined className="text-gray-400 mr-2" />
                            <div className="flex flex-row items-center">
                              <div className="font-medium">{category.name}</div>
                              {category.parent && (
                                <div className="text-xs text-gray-500 pl-2">
                                   {category.parent.name}
                                </div>
                              )}
                            </div>
                          </div>
                          {category.description && (
                            <span className="text-xs text-gray-500 ml-2 max-w-xs truncate">
                              {category.description}
                            </span>
                          )}
                        </div>
                      </Option>
                    ))}
                    {(!categories || categories.length === 0) && !categoriesLoading && (
                      <Option disabled value="_no_categories">
                        <div className="text-center py-4">
                          <FolderOutlined className="text-gray-300 text-2xl mb-2" />
                          <div className="text-gray-500">No categories available</div>
                          <Button 
                            type="link" 
                            size="small"
                            onClick={() => setIsCategoryModalVisible(true)}
                            className="text-blue-600 p-0"
                          >
                            Create your first category
                          </Button>
                        </div>
                      </Option>
                    )}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: "Please select status" }]}
                >
                  <Select placeholder="Select status" className="h-12">
                    <Option value="ACTIVE">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Active
                      </div>
                    </Option>
                    <Option value="INACTIVE">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        Inactive
                      </div>
                    </Option>
                    <Option value="OUT_OF_STOCK">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                        Out of Stock
                      </div>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Product Images */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-1 h-6 bg-green-600 rounded-full mr-3"></div>
              Product Images
            </h4>
            <Form.Item name="images" label="" valuePropName="fileList" getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}>
              <Upload
                action="/api/upload"
                listType="picture-card"
                multiple
                maxCount={8}
                accept="image/*"
                className="upload-list-inline"
                beforeUpload={() => false} // Prevent auto upload
              >
                <div className="flex flex-col items-center p-4">
                  <UploadOutlined className="text-2xl text-gray-400 mb-2" />
                  <div className="text-sm text-gray-600">Upload Images</div>
                  <div className="text-xs text-gray-400 mt-1">Max 8 images</div>
                </div>
              </Upload>
            </Form.Item>
          </div>

          {/* Product Variants */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <Form.List name="variants">
              {(fields, { add, remove }) => (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
                      Product Variants
                    </h4>
                    <div className="text-sm font-normal text-gray-600 bg-purple-100 px-3 py-1 rounded-full">
                      {fields.length} variant{fields.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="bg-white rounded-lg border border-gray-200 p-6 mb-4 relative">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-md font-medium text-gray-800 flex items-center">
                          <div className="w-1 h-5 bg-blue-500 rounded-full mr-3"></div>
                          Variant #{key + 1}
                        </h5>
                        <Popconfirm
                          title="Remove Variant"
                          description={`Are you sure you want to remove Variant #${key + 1}? This action cannot be undone.`}
                          onConfirm={() => {
                            // Track removed variant ID if it exists (for existing variants)
                            const variantId = form.getFieldValue(['variants', name, 'id']);
                            if (variantId) {
                              setRemovedVariantIds(prev => [...prev, variantId]);
                            }
                            
                            remove(name);
                            message.success(`Variant #${key + 1} removed successfully`);
                          }}
                          okText="Yes, Remove"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                          disabled={fields.length <= 1}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            disabled={fields.length <= 1}
                            className={`border-red-200 hover:border-red-400 ${
                              fields.length <= 1 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-red-50'
                            }`}
                            title={fields.length <= 1 ? "At least one variant is required" : "Remove this variant"}
                          >
                            Remove
                          </Button>
                        </Popconfirm>
                      </div>

                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'sku']}
                            label="SKU (Stock Keeping Unit)"
                            rules={[{ required: true, message: 'Please enter SKU' }]}
                          >
                            <Input placeholder="e.g. IPHONE15PM-256GB-TN" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'price']}
                            label="Price (VND)"
                            rules={[{ required: true, message: 'Please enter price' }]}
                          >
                            <InputNumber
                              className="w-full"
                              min={0}
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              placeholder="29,990,000"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'stock']}
                            label="Stock Quantity"
                            rules={[{ required: true, message: 'Please enter stock' }]}
                          >
                            <InputNumber className="w-full" min={0} placeholder="50" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'weight']}
                            label="Weight (kg)"
                          >
                            <InputNumber 
                              className="w-full" 
                              min={0} 
                              step={0.001}
                              placeholder="0.221" 
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'dimensions']}
                            label="Dimensions"
                          >
                            <Input placeholder="159.9 x 76.7 x 8.25 mm" />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Attributes */}
                      <div className="mt-4">
                        <h6 className="text-sm font-medium text-gray-700 mb-3">Product Attributes</h6>
                        <Form.List name={[name, 'attributes']}>
                          {(attrFields, { add: addAttr, remove: removeAttr }) => (
                            <>
                              {attrFields.map(({ key: attrKey, name: attrName, ...attrRestField }) => (
                                <Row key={attrKey} gutter={[16, 8]} className="mb-2">
                                  <Col span={10}>
                                    <Form.Item
                                      {...attrRestField}
                                      name={[attrName, 'attributeName']}
                                      rules={[{ required: true, message: 'Attribute name required' }]}
                                    >
                                      <Select placeholder="Attribute Name">
                                        <Option value="Color">Color</Option>
                                        <Option value="Size">Size</Option>
                                        <Option value="Storage">Storage</Option>
                                        <Option value="Material">Material</Option>
                                        <Option value="Memory">Memory</Option>
                                        <Option value="Screen Size">Screen Size</Option>
                                      </Select>
                                    </Form.Item>
                                  </Col>
                                  <Col span={10}>
                                    <Form.Item
                                      {...attrRestField}
                                      name={[attrName, 'attributeValue']}
                                      rules={[{ required: true, message: 'Attribute value required' }]}
                                    >
                                      <Input placeholder="Attribute Value" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={4}>
                                    <Button
                                      type="text"
                                      danger
                                      icon={<MinusCircleOutlined />}
                                      onClick={() => removeAttr(attrName)}
                                      className="w-full"
                                    />
                                  </Col>
                                </Row>
                              ))}
                              <Button
                                type="dashed"
                                onClick={() => addAttr()}
                                icon={<PlusCircleOutlined />}
                                className="w-full mt-2"
                              >
                                Add Attribute
                              </Button>
                            </>
                          )}
                        </Form.List>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    className="w-full h-12 text-blue-600 border-blue-300 hover:border-blue-500"
                  >
                    Add New Variant
                  </Button>
                  
                  {fields.length === 0 && (
                    <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300 mt-4">
                      <div className="text-gray-500 mb-2">No variants yet</div>
                      <div className="text-sm text-gray-400">
                        Add at least one variant to define product options like size, color, or model
                      </div>
                    </div>
                  )}
                </>
              )}
            </Form.List>
          </div>

          {/* Removed Variants Warning */}
          {removedVariantIds.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div>
                  <div className="text-sm font-medium text-yellow-800">
                    {removedVariantIds.length} variant{removedVariantIds.length !== 1 ? 's' : ''} will be permanently removed
                  </div>
                  <div className="text-xs text-yellow-600 mt-1">
                    These changes will be applied when you save the product
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button 
              size="large" 
              onClick={() => setIsModalVisible(false)}
              className="px-8"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              size="large"
              htmlType="submit" 
              loading={loading}
              className="px-8 bg-blue-600 hover:bg-blue-700"
            >
              {editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Category Management Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FolderOutlined className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Manage Categories</h3>
              <p className="text-sm text-gray-500">Create and organize product categories</p>
            </div>
          </div>
        }
        open={isCategoryModalVisible}
        onCancel={() => setIsCategoryModalVisible(false)}
        footer={null}
        width={800}
        className="category-modal"
      >
        <div className="space-y-6">
          {/* Create New Category Form */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-1 h-6 bg-green-600 rounded-full mr-3"></div>
              Create New Category
            </h4>
            
            <Form
              form={categoryForm}
              layout="vertical"
              onFinish={handleCreateCategory}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Category Name"
                    rules={[{ required: true, message: "Please enter category name" }]}
                  >
                    <Input placeholder="e.g. Electronics, Fashion, Books" className="h-12" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="parentId"
                    label="Parent Category (Optional)"
                  >
                    <Select placeholder="Select parent category" className="h-12" allowClear>
                      {categories.map(category => (
                        <Option key={category.id} value={category.id}>
                          {category.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Description (Optional)"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Describe what products belong to this category..."
                  className="resize-none"
                />
              </Form.Item>

              <div className="flex justify-end space-x-3">
                <Button htmlType="submit" type="primary" icon={<PlusOutlined />}>
                  Create Category
                </Button>
              </div>
            </Form>
          </div>

          {/* Existing Categories List */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
              Existing Categories ({categories?.length || 0})
            </h4>
            
            {categoriesLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading categories...</p>
              </div>
            ) : (!categories || categories.length === 0) ? (
              <div className="text-center py-8">
                <FolderOutlined className="text-4xl text-gray-400 mb-4" />
                <h5 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h5>
                <p className="text-gray-600 mb-4">Create your first category to organize products</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {categories.map(category => (
                  <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 mb-1">
                          {category.name}
                        </h5>
                        {category.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {category.description}
                          </p>
                        )}
                        <div className="flex items-center text-xs text-gray-500">
                          <FolderOutlined className="mr-1" />
                          {category.parent ? `Parent: ${category.parent.name}` : 'Root Category'}
                        </div>
                        {category.subCategories && category.subCategories.length > 0 && (
                          <div className="text-xs text-blue-600 mt-1">
                            {category.subCategories.length} subcategories
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          className="text-blue-600 hover:bg-blue-50"
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          className="text-red-600 hover:bg-red-50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}