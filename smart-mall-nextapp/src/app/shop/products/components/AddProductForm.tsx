"use client";

import { useState } from "react";
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
  message
} from "antd";
import { 
  PlusOutlined, 
  UploadOutlined, 
  DeleteOutlined,
  MinusCircleOutlined
} from "@ant-design/icons";
import type { UploadFile } from 'antd/es/upload/interface';
import type { CreateProductData, ProductVariant, ProductAttribute } from "@/services/productService";

const { TextArea } = Input;
const { Option } = Select;

interface AddProductFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: CreateProductData, images: File[]) => void;
  loading?: boolean;
  showAsModal?: boolean; // New prop to control modal behavior
}

export default function AddProductForm({ visible, onCancel, onSubmit, loading = false, showAsModal = true }: AddProductFormProps) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [variants, setVariants] = useState<Omit<ProductVariant, 'id'>[]>([]);
  const [isVariantModalVisible, setIsVariantModalVisible] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [variantForm] = Form.useForm();

  // Mock categories and shops - in real app, these would come from API
  const categories = [
    { id: "cat1", name: "Smartphones" },
    { id: "cat2", name: "Laptops" },
    { id: "cat3", name: "Audio" },
    { id: "cat4", name: "Accessories" }
  ];

  const shops = [
    { id: "shop1", name: "TechWorld Electronics" },
    { id: "shop2", name: "Digital Store" }
  ];

  const handleFinish = (values: any) => {
    if (variants.length === 0) {
      message.error('Please add at least one product variant');
      return;
    }

    const productData: CreateProductData = {
      ...values,
      variants: variants
    };

    const images = fileList.map(file => file.originFileObj as File).filter(Boolean);
    
    console.log('Product Data:', productData);
    console.log('Images:', images);
    
    onSubmit(productData, images);
    handleReset();
  };

  const handleReset = () => {
    form.resetFields();
    variantForm.resetFields();
    setFileList([]);
    setVariants([]);
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

  const handleVariantSubmit = (values: any) => {
    const variantData = {
      ...values,
      attributes: values.attributes || []
    };

    if (editingVariantIndex !== null) {
      // Edit existing variant
      const newVariants = [...variants];
      newVariants[editingVariantIndex] = variantData;
      setVariants(newVariants);
    } else {
      // Add new variant
      setVariants([...variants, variantData]);
    }

    setIsVariantModalVisible(false);
    setEditingVariantIndex(null);
    variantForm.resetFields();
  };

  const handleDeleteVariant = (index: number) => {
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
      render: (price: number) => `$${price}`,
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

  const formContent = (
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
              <Select placeholder="Select category">
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
              rules={[{ required: true, message: 'Please select shop' }]}
            >
              <Select placeholder="Select shop">
                {shops.map(shop => (
                  <Option key={shop.id} value={shop.id}>
                    {shop.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
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
          initialValue="ACTIVE"
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
          Recommended: Upload multiple high-quality images showing different angles
        </div>
      </Card>

      {/* Product Variants */}
      <Card 
        title="Product Variants" 
        size="small"
        className={showAsModal ? "" : "mb-6"}
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
            rowKey={(record, index) => index?.toString() || '0'}
          />
        ) : (
          <div className="text-center text-gray-500 py-4">
            No variants added yet. Click "Add Variant" to create your first variant.
          </div>
        )}
      </Card>

      {/* Form Actions for non-modal usage */}
      {!showAsModal && (
        <div className="flex justify-end gap-4">
          <Button size="large" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            size="large" 
            htmlType="submit"
            loading={loading}
          >
            Create Product
          </Button>
        </div>
      )}
    </Form>
  );

  if (!showAsModal) {
    return (
      <div className="space-y-6">
        {formContent}
        
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
            >
              <Input placeholder="Enter SKU" />
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

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="weight" label="Weight (grams)">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="0"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dimensions" label="Dimensions">
                  <Input placeholder="L x W x H (cm)" />
                </Form.Item>
              </Col>
            </Row>

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
                          <Input placeholder="Attribute name (e.g., Color)" />
                        </Form.Item>
                      </Col>
                      <Col span={10}>
                        <Form.Item
                          {...restField}
                          name={[name, 'attributeValue']}
                          rules={[{ required: true, message: 'Missing attribute value' }]}
                        >
                          <Input placeholder="Attribute value (e.g., Red)" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <MinusCircleOutlined onClick={() => remove(name)} />
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
      </div>
    );
  }

  return (
    <>
      <Modal
        title="Add New Product"
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
            Create Product
          </Button>
        ]}
      >
        {formContent}
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
          >
            <Input placeholder="Enter SKU" />
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="weight" label="Weight (grams)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dimensions" label="Dimensions">
                <Input placeholder="L x W x H (cm)" />
              </Form.Item>
            </Col>
          </Row>

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
                        <Input placeholder="Attribute name (e.g., Color)" />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'attributeValue']}
                        rules={[{ required: true, message: 'Missing attribute value' }]}
                      >
                        <Input placeholder="Attribute value (e.g., Red)" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <MinusCircleOutlined onClick={() => remove(name)} />
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
    </>
  );
}