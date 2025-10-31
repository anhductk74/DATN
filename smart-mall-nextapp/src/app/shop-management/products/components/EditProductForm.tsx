"use client";

import { useState, useEffect } from "react";
import { 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Button, 
  Upload, 
  Card, 
  Row, 
  Col, 
  Divider, 
  Space,
  Table,
  Modal,
  message,
  Image,
  Spin
} from "antd";
import { 
  PlusOutlined, 
  UploadOutlined, 
  DeleteOutlined,
  MinusCircleOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { getCloudinaryUrl } from "@/config/config";
import { useSession } from "next-auth/react";
import type { UploadFile } from 'antd/es/upload/interface';
import type { Product, UpdateProductData, ProductVariant, ProductAttribute } from "@/services/ProductService";
import categoryService from "@/services/CategoryService";
import type { Category } from "@/services/CategoryService";

const { TextArea } = Input;
const { Option } = Select;

interface EditProductFormProps {
  visible: boolean;
  product: Product | null;
  onCancel: () => void;
  onSubmit: (productId: string, data: UpdateProductData, images?: File[]) => void;
  loading?: boolean;
}

export default function EditProductForm({ visible, product, onCancel, onSubmit, loading = false }: EditProductFormProps) {
  const { data: session } = useSession();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [removedVariantIds, setRemovedVariantIds] = useState<string[]>([]);
  const [isVariantModalVisible, setIsVariantModalVisible] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [variantForm] = Form.useForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [categoryForm] = Form.useForm();
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const categoriesData = await categoryService.getAllCategories();
      setCategories(categoriesData);
      console.log('Categories loaded:', categoriesData.length);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      message.error('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleCreateCategory = async (values: any) => {
    setCategorySubmitting(true);
    try {
      await categoryService.createCategory({
        name: values.name,
        description: values.description,
        parentId: values.parentId || null
      });
      message.success('Category created successfully!');
      setIsCategoryModalVisible(false);
      categoryForm.resetFields();
      // Refresh categories list
      await fetchCategories();
    } catch (error: any) {
      console.error('Error creating category:', error);
      message.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setCategorySubmitting(false);
    }
  };

  useEffect(() => {
    if (product && visible && !categoriesLoading) {
      // Get categoryId from either categoryId field or nested category object
      const categoryId = product.categoryId || product.category?.id;
      
      console.log('Edit Product - CategoryId:', categoryId, 'Product:', product.name);
      console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name })));
      
      // Populate form with product data
      form.setFieldsValue({
        name: product.name,
        brand: product.brand,
        categoryId: categoryId,
        shopId: product.shopId,
        description: product.description,
        status: product.status
      });

      // Set variants
      setVariants([...product.variants]);
      setRemovedVariantIds([]);

      // Set existing images as file list for preview
      const existingImages: UploadFile[] = product.images?.map((url, index) => ({
        uid: `existing-${index}`,
        name: `image-${index + 1}`,
        status: 'done',
        url: getCloudinaryUrl(url),
        originFileObj: undefined
      })) || [];
      
      setFileList(existingImages);
    }
  }, [product, visible, form, categoriesLoading, categories]);

  const handleFinish = (values: any) => {
    if (variants.length === 0) {
      message.error('Please add at least one product variant');
      return;
    }

    const updateData: UpdateProductData = {
      ...values,
      variants: variants,
      removedVariantIds: removedVariantIds
    };

    // Only get new uploaded files (not existing ones)
    const newImages = fileList
      .filter(file => file.originFileObj)
      .map(file => file.originFileObj as File);

    if (product?.id) {
      onSubmit(product.id, updateData, newImages.length > 0 ? newImages : undefined);
    }
    
    handleReset();
  };

  const handleReset = () => {
    form.resetFields();
    variantForm.resetFields();
    setFileList([]);
    setVariants([]);
    setRemovedVariantIds([]);
    setIsVariantModalVisible(false);
    setEditingVariantIndex(null);
  };

  const handleAddVariant = () => {
    setEditingVariantIndex(null);
    setIsVariantModalVisible(true);
    variantForm.resetFields();
  };

  const handleEditVariant = (index: number) => {
    setEditingVariantIndex(index);
    setIsVariantModalVisible(true);
    variantForm.setFieldsValue(variants[index]);
  };

  // Auto-generate SKU from attributes
  const generateSKU = (attributes: ProductAttribute[]) => {
    if (!attributes || attributes.length === 0) {
      return '';
    }
    
    const attrValues = attributes
      .map(attr => attr.attributeValue?.toUpperCase().replace(/\s/g, '-'))
      .filter(Boolean)
      .join('-');
    
    return attrValues;
  };

  // Watch for attribute changes to update SKU
  const handleAttributeChange = () => {
    const attributes = variantForm.getFieldValue('attributes') || [];
    const validAttributes = attributes.filter((attr: any) => attr?.attributeName && attr?.attributeValue);
    
    if (validAttributes.length > 0) {
      const generatedSKU = generateSKU(validAttributes);
      variantForm.setFieldsValue({ sku: generatedSKU });
    }
  };

  const handleVariantSubmit = (values: any) => {
    const variantData = {
      ...values,
      attributes: values.attributes || []
    };

    if (editingVariantIndex !== null) {
      // Edit existing variant
      const newVariants = [...variants];
      newVariants[editingVariantIndex] = {
        ...newVariants[editingVariantIndex],
        ...variantData
      };
      setVariants(newVariants);
    } else {
      // Add new variant (without id for new variants)
      setVariants([...variants, variantData as ProductVariant]);
    }

    setIsVariantModalVisible(false);
    setEditingVariantIndex(null);
    variantForm.resetFields();
  };

  const handleDeleteVariant = (index: number) => {
    const variantToRemove = variants[index];
    
    // If variant has an ID (existing variant), add to removed list
    if (variantToRemove.id) {
      setRemovedVariantIds([...removedVariantIds, variantToRemove.id]);
    }
    
    // Remove from variants array
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const variantColumns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Weight (g)',
      dataIndex: 'weight',
      key: 'weight',
    },
    {
      title: 'Attributes',
      dataIndex: 'attributes',
      key: 'attributes',
      render: (attributes: ProductAttribute[]) => (
        <div>
          {attributes?.map((attr, index) => (
            <span key={index} className="inline-block bg-gray-100 text-xs px-2 py-1 rounded mr-1 mb-1">
              {attr.attributeName}: {attr.attributeValue}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (variant: ProductVariant) => (
        <span className={variant.id ? 'text-blue-600' : 'text-green-600'}>
          {variant.id ? 'Existing' : 'New'}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, __: any, index: number) => (
        <Space>
          <Button size="small" onClick={() => handleEditVariant(index)}>
            Edit
          </Button>
          <Button size="small" danger onClick={() => handleDeleteVariant(index)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const uploadProps = {
    fileList,
    onChange: ({ fileList: newFileList }: { fileList: UploadFile[] }) => setFileList(newFileList),
    beforeUpload: () => false, // Prevent auto upload
    listType: 'picture-card' as const,
    multiple: true,
  };

  if (!product) return null;

  return (
    <>
      <Modal
        title={`Edit Product: ${product.name}`}
        open={visible}
        onCancel={() => {
          handleReset();
          onCancel();
        }}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => {
            handleReset();
            onCancel();
          }}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()} loading={loading}>
            Update Product
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          {/* Basic Information */}
          <Card title="Basic Information" size="small" className="mb-4">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Product Name"
                  rules={[{ required: true, message: 'Please enter product name' }]}
                >
                  <Input placeholder="Enter product name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="brand"
                  label="Brand"
                  rules={[{ required: true, message: 'Please enter brand' }]}
                >
                  <Input placeholder="Enter brand name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="categoryId"
                  label="Category"
                  rules={[{ required: true, message: 'Please select category' }]}
                >
                  <Select 
                    placeholder="Select category" 
                    loading={categoriesLoading}
                    showSearch
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <div style={{ padding: '8px' }}>
                          <Button
                            type="link"
                            icon={<PlusOutlined />}
                            onClick={() => setIsCategoryModalVisible(true)}
                            style={{ width: '100%' }}
                          >
                            Add New Category
                          </Button>
                        </div>
                      </>
                    )}
                  >
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="shopId"
                  label="Shop"
                  hidden
                >
                  <Input disabled />
                </Form.Item>
                <div className="text-sm text-gray-500 mt-2">
                  Shop: {product?.shop?.name || 'N/A'}
                </div>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea rows={4} placeholder="Enter product description" />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select>
                <Option value="ACTIVE">Active</Option>
                <Option value="INACTIVE">Inactive</Option>
                <Option value="OUT_OF_STOCK">Out of Stock</Option>
              </Select>
            </Form.Item>
          </Card>

          {/* Product Images */}
          <Card title="Product Images" size="small" className="mb-4">
            <Upload {...uploadProps}>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
            <div className="text-sm text-gray-500 mt-2">
              Existing images will be kept unless removed. New uploads will be added to the product.
            </div>
          </Card>

          {/* Product Variants */}
          <Card 
            title="Product Variants" 
            size="small"
            extra={
              <Button type="primary" size="small" onClick={handleAddVariant}>
                Add Variant
              </Button>
            }
          >
            {variants.length > 0 ? (
              <Table
                dataSource={variants}
                columns={variantColumns}
                pagination={false}
                size="small"
                rowKey={(record, index) => record.id || `new-${index}`}
              />
            ) : (
              <div className="text-center text-gray-500 py-4">
                No variants. Click "Add Variant" to create variants.
              </div>
            )}
            
            {removedVariantIds.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <div className="text-sm text-red-600">
                  <strong>Variants to be removed:</strong> {removedVariantIds.length} variant(s) will be deleted when you save.
                </div>
              </div>
            )}
          </Card>
        </Form>
      </Modal>

      {/* Variant Modal */}
      <Modal
        title={editingVariantIndex !== null ? "Edit Variant" : "Add Variant"}
        open={isVariantModalVisible}
        onCancel={() => {
          setIsVariantModalVisible(false);
          setEditingVariantIndex(null);
          variantForm.resetFields();
        }}
        onOk={() => variantForm.submit()}
      >
        <Form
          form={variantForm}
          layout="vertical"
          onFinish={handleVariantSubmit}
        >
          <Form.Item
            name="sku"
            label="SKU"
            rules={[{ required: true, message: 'Please enter SKU' }]}
            extra="SKU will be auto-generated from attributes below"
          >
            <Input 
              placeholder="Will be auto-generated from attributes" 
              disabled
              style={{ cursor: 'default', backgroundColor: '#f5f5f5' }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Price ($)"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="stock"
                label="Stock Quantity"
                rules={[{ required: true, message: 'Please enter stock' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="weight" label="Weight (grams)">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="0"
            />
          </Form.Item>

          <Divider>Product Attributes</Divider>

          <Form.List name="attributes">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={16} align="middle">
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'attributeName']}
                        rules={[{ required: true, message: 'Missing attribute name' }]}
                      >
                        <Input 
                          placeholder="Attribute name (e.g., Color)" 
                          onChange={handleAttributeChange}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'attributeValue']}
                        rules={[{ required: true, message: 'Missing attribute value' }]}
                      >
                        <Input 
                          placeholder="Attribute value (e.g., Red)" 
                          onChange={handleAttributeChange}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <MinusCircleOutlined 
                        onClick={() => {
                          remove(name);
                          handleAttributeChange();
                        }}
                      />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Attribute
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        title="Add New Category"
        open={isCategoryModalVisible}
        onCancel={() => {
          setIsCategoryModalVisible(false);
          categoryForm.resetFields();
        }}
        onOk={() => categoryForm.submit()}
        confirmLoading={categorySubmitting}
        okText="Create"
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleCreateCategory}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter category description (optional)" />
          </Form.Item>

          <Form.Item
            name="parentId"
            label="Parent Category"
          >
            <Select placeholder="Select parent category (optional)" allowClear>
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}