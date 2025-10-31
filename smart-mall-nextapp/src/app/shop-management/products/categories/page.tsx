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
  Spin
} from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  AppstoreOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import categoryService from "@/services/CategoryService";
import type { Category, CreateCategoryData, UpdateCategoryData } from "@/services/CategoryService";

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
  const activeCategories = categories.length; // API doesn't have status
  const totalProducts = 0; // Would need separate API call
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
    form.resetFields();
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsModalVisible(true);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      parentId: category.parent?.id || null
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
      if (editingCategory) {
        // Update existing category
        const updateData: UpdateCategoryData = {
          name: values.name,
          description: values.description,
          parentId: values.parentId || null
        };
        await categoryService.updateCategory(editingCategory.id, updateData);
        message.success('Category updated successfully');
      } else {
        // Add new category
        const createData: CreateCategoryData = {
          name: values.name,
          description: values.description,
          parentId: values.parentId || null
        };
        await categoryService.createCategory(createData);
        message.success('Category created successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
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
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Category) => (
        <div className="flex items-center">
          <AppstoreOutlined className="mr-2 text-blue-500" />
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-gray-500">{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Parent Category',
      key: 'parentCategory',
      render: (_: any, record: Category) => getParentCategoryName(record),
    },
    {
      title: 'Subcategories',
      key: 'subcategories',
      render: (_: any, record: Category) => (
        <Tag color={record.subCategories && record.subCategories.length > 0 ? 'blue' : 'default'}>
          {record.subCategories?.length || 0} subcategories
        </Tag>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Actions',
      key: 'actions',
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
              title="Total Products"
              value={totalProducts}
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
        </Form>
      </Modal>
      </Spin>
    </div>
  );
}