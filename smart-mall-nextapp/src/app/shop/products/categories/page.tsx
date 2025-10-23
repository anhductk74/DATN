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
  Popconfirm,
  Select,
  Tag,
  Row,
  Col,
  Statistic
} from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  AppstoreOutlined
} from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  productCount: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockCategories: Category[] = [
  {
    id: "cat1",
    name: "Electronics",
    description: "Electronic devices and gadgets",
    status: "ACTIVE",
    productCount: 145,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  {
    id: "cat2",
    name: "Smartphones",
    description: "Mobile phones and accessories",
    parentId: "cat1",
    status: "ACTIVE",
    productCount: 89,
    createdAt: "2024-01-16",
    updatedAt: "2024-01-16"
  },
  {
    id: "cat3",
    name: "Laptops",
    description: "Portable computers and accessories",
    parentId: "cat1",
    status: "ACTIVE",
    productCount: 56,
    createdAt: "2024-01-17",
    updatedAt: "2024-01-17"
  },
  {
    id: "cat4",
    name: "Fashion",
    description: "Clothing and fashion accessories",
    status: "ACTIVE",
    productCount: 234,
    createdAt: "2024-01-18",
    updatedAt: "2024-01-18"
  },
  {
    id: "cat5",
    name: "Men's Clothing",
    description: "Clothing for men",
    parentId: "cat4",
    status: "ACTIVE",
    productCount: 112,
    createdAt: "2024-01-19",
    updatedAt: "2024-01-19"
  },
  {
    id: "cat6",
    name: "Home & Garden",
    description: "Home improvement and garden items",
    status: "INACTIVE",
    productCount: 67,
    createdAt: "2024-01-20",
    updatedAt: "2024-01-20"
  }
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  // Statistics
  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.status === 'ACTIVE').length;
  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);
  const parentCategories = categories.filter(cat => !cat.parentId).length;

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchText.toLowerCase()) ||
    category.description.toLowerCase().includes(searchText.toLowerCase())
  );

  // Get parent category name
  const getParentCategoryName = (parentId?: string) => {
    if (!parentId) return '-';
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : '-';
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsModalVisible(true);
    form.setFieldsValue(category);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    const hasChildren = categories.some(cat => cat.parentId === categoryId);
    
    if (hasChildren) {
      message.error('Cannot delete category with subcategories. Please delete subcategories first.');
      return;
    }

    if (categoryToDelete && categoryToDelete.productCount > 0) {
      message.error('Cannot delete category with products. Please move or delete products first.');
      return;
    }

    setCategories(categories.filter(cat => cat.id !== categoryId));
    message.success('Category deleted successfully');
  };

  const handleModalSubmit = (values: any) => {
    if (editingCategory) {
      // Update existing category
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...values, updatedAt: new Date().toISOString().split('T')[0] }
          : cat
      ));
      message.success('Category updated successfully');
    } else {
      // Add new category
      const newCategory: Category = {
        id: `cat${Date.now()}`,
        ...values,
        productCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setCategories([...categories, newCategory]);
      message.success('Category created successfully');
    }
    
    setIsModalVisible(false);
    form.resetFields();
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
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId: string) => getParentCategoryName(parentId),
    },
    {
      title: 'Products',
      dataIndex: 'productCount',
      key: 'productCount',
      render: (count: number) => (
        <Tag color={count > 0 ? 'green' : 'default'}>
          {count} products
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status}
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
                .filter(cat => !cat.parentId && cat.id !== editingCategory?.id)
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
            rules={[{ required: true, message: 'Please select status' }]}
            initialValue="ACTIVE"
          >
            <Select>
              <Option value="ACTIVE">Active</Option>
              <Option value="INACTIVE">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}