"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Modal, 
  Form, 
  message,
  Popconfirm,
  Select,
  Tag,
  Row,
  Col,
  Statistic,
  Spin,
  Upload,
  Image as AntImage
} from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  AppstoreOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  PictureOutlined
} from "@ant-design/icons";
import categoryService from "@/services/CategoryService";
import type { Category, CreateCategoryData, UpdateCategoryData } from "@/services/CategoryService";
import { getCloudinaryUrl } from "@/config/config";

const { TextArea } = Input;
const { Option } = Select;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoriesData = await categoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      message.error(error.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.status === 'ACTIVE').length;
  const inactiveCategories = categories.filter(cat => cat.status === 'INACTIVE').length;
  const parentCategories = categories.filter(cat => !cat.parent).length;

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchText.toLowerCase()) ||
    category.description.toLowerCase().includes(searchText.toLowerCase())
  );

  // Get parent category name
  const getParentCategoryName = (category: Category) => {
    return category.parent ? category.parent.name : '-';
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalVisible(true);
    setImageFile(null);
    setPreviewImage('');
    form.resetFields();
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsModalVisible(true);
    setImageFile(null);
    setPreviewImage(category.image ? getCloudinaryUrl(category.image) : '');
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      parentId: category.parent?.id || null,
      status: category.status || 'ACTIVE'
    });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    const hasChildren = categoryToDelete?.subCategories && categoryToDelete.subCategories.length > 0;
    
    if (hasChildren) {
      message.error('Cannot delete category with subcategories. Please delete subcategories first.');
      return;
    }

    try {
      await categoryService.deleteCategory(categoryId);
      message.success('Category deleted successfully');
      await fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      message.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleModalSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('name', values.name);
      if (values.description) formData.append('description', values.description);
      if (values.parentId) formData.append('parentId', values.parentId);
      if (values.status) formData.append('status', values.status);
      if (imageFile) formData.append('image', imageFile);

      if (editingCategory) {
        // Update existing category
        if (imageFile) {
          // Use multipart endpoint if image changed
          await categoryService.updateCategoryWithUpload(editingCategory.id, formData);
        } else {
          // Use JSON endpoint if no image change
          const updateData: UpdateCategoryData = {
            name: values.name,
            description: values.description,
            parentId: values.parentId || null,
            status: values.status
          };
          await categoryService.updateCategory(editingCategory.id, updateData);
        }
        message.success('Category updated successfully');
      } else {
        // Add new category with upload endpoint
        await categoryService.createCategoryWithUpload(formData);
        message.success('Category created successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      setImageFile(null);
      setPreviewImage('');
      await fetchCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      message.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      align: 'center' as const,
      render: (image: string) => (
        image ? (
          <AntImage
            src={getCloudinaryUrl(image)}
            alt="Category"
            width={60}
            height={60}
            className="object-cover rounded"
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          />
        ) : (
          <div className="w-[60px] h-[60px] bg-gray-100 rounded flex items-center justify-center mx-auto">
            <PictureOutlined className="text-gray-400 text-xl" />
          </div>
        )
      ),
    },
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      width: '35%',
      render: (name: string, record: Category) => (
        <div className="flex items-start">
          <AppstoreOutlined className="mr-3 text-blue-500 text-lg mt-1" />
          <div className="flex-1">
            <div className="font-semibold text-base mb-1">{name}</div>
            <div className="text-sm text-gray-500 line-clamp-2">{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center' as const,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'} className="px-3 py-1">
          {status || 'ACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Parent Category',
      key: 'parentCategory',
      width: 180,
      render: (_: any, record: Category) => (
        <span className="text-gray-700">{getParentCategoryName(record)}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: any, record: Category) => (
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditCategory(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDeleteCategory(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              size="small" 
              danger 
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Spin spinning={loading} tip="Loading categories...">
        {/* Statistics */}
        <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Categories"
              value={totalCategories}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Categories"
              value={activeCategories}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Parent Categories"
              value={parentCategories}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Inactive Categories"
              value={inactiveCategories}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search categories..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddCategory}
          >
            Add Category
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} categories`,
          }}
        />
      </Card>

      {/* Add/Edit Category Modal */}
      <Modal
        title={editingCategory ? "Edit Category" : "Add New Category"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalSubmit}
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
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={3} placeholder="Enter category description" />
          </Form.Item>

          <Form.Item
            name="parentId"
            label="Parent Category"
          >
            <Select placeholder="Select parent category (optional)" allowClear>
              {categories
                .filter(cat => !cat.parent && cat.id !== editingCategory?.id)
                .map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            initialValue="ACTIVE"
          >
            <Select>
              <Option value="ACTIVE">Active</Option>
              <Option value="INACTIVE">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Category Image"
          >
            {previewImage && (
              <div className="mb-2">
                <AntImage
                  src={previewImage}
                  alt="Preview"
                  width={100}
                  height={100}
                  className="object-cover rounded"
                />
              </div>
            )}
            <Upload
              accept="image/*"
              maxCount={1}
              beforeUpload={(file) => {
                // Validate file size (max 10MB)
                const isLt10M = file.size / 1024 / 1024 < 10;
                if (!isLt10M) {
                  message.error('Image must be smaller than 10MB!');
                  return false;
                }
                
                // Validate file type
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('You can only upload image files!');
                  return false;
                }

                // Set file and preview
                setImageFile(file);
                const reader = new FileReader();
                reader.onload = (e) => setPreviewImage(e.target?.result as string);
                reader.readAsDataURL(file);
                
                return false; // Prevent auto upload
              }}
              onRemove={() => {
                setImageFile(null);
                setPreviewImage(editingCategory?.image ? getCloudinaryUrl(editingCategory.image) : '');
              }}
            >
              <Button icon={<UploadOutlined />}>
                {editingCategory ? 'Change Image' : 'Upload Image'}
              </Button>
            </Upload>
            <div className="text-sm text-gray-500 mt-1">
              Supported formats: JPG, PNG, GIF, WebP (Max 10MB)
            </div>
          </Form.Item>
        </Form>
      </Modal>
      </Spin>
    </div>
  );
}