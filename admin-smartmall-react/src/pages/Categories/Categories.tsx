import { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Image,
  Typography,
  Tooltip,
  App,
  Popconfirm,
  Modal,
  Form,
  Upload,
} from 'antd';
import type { TableProps, TablePaginationConfig, UploadFile } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UploadOutlined,
  SaveOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useSoftDeleteCategory,
} from '../../hooks/useCategories';
import type { Category } from '../../types/category.types';
import { getCloudinaryUrl, DEFAULT_PRODUCT_IMAGE } from '../../config/config';
import './Categories.css';

const { Title } = Typography;
const { TextArea } = Input;

export default function Categories() {
  const { message } = App.useApp();
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [form] = Form.useForm();

  // Fetch all categories with React Query (with cache)
  const { data: categoriesData, isLoading, refetch } = useCategories(page, pageSize);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const softDeleteMutation = useSoftDeleteCategory();

  // Client-side filtering from cached data
  const allCategories = Array.isArray(categoriesData?.data) 
    ? categoriesData.data 
    : categoriesData?.data?.categories || [];
  
  const filteredCategories = searchText
    ? allCategories.filter((category) => 
        category.name.toLowerCase().includes(searchText.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchText.toLowerCase())
      )
    : allCategories;

  const categories = filteredCategories;
  const loading = isLoading;
  
  const pagination = {
    current: Array.isArray(categoriesData?.data) 
      ? 1 
      : (categoriesData?.data?.currentPage || 0) + 1,
    pageSize: Array.isArray(categoriesData?.data) 
      ? categoriesData.data.length 
      : categoriesData?.data?.pageSize || 20,
    total: Array.isArray(categoriesData?.data) 
      ? categoriesData.data.length 
      : categoriesData?.data?.totalItems || 0,
  };

  const handleTableChange: TableProps<Category>['onChange'] = (newPagination: TablePaginationConfig) => {
    const newPage = (newPagination.current || 1) - 1;
    const newSize = newPagination.pageSize || 20;
    setPage(newPage);
    setPageSize(newSize);
  };

  const handleDelete = async (id: string) => {
    try {
      await softDeleteMutation.mutateAsync(id);
      message.success('Category deleted successfully');
    } catch (error) {
      message.error('Failed to delete category');
      console.error('Error deleting category:', error);
    }
  };

  const handleRefresh = () => {
    setSearchText('');
    setPage(0);
    refetch();
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleEditCategory = (record: Category) => {
    setEditingCategory(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
    });
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
    setFileList([]);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setIsSaving(true);
      const formData = new FormData();
      
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory.id, formData });
        message.success('Category updated successfully');
      } else {
        await createMutation.mutateAsync(formData);
        message.success('Category created successfully');
      }

      setIsModalOpen(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error('Error saving category:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        message.error(axiosError.response?.data?.message || 'Failed to save category');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const columns: TableProps<Category>['columns'] = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image: string) => {
        const imageUrl = image ? getCloudinaryUrl(image) : DEFAULT_PRODUCT_IMAGE;
        return (
          <Image
            width={60}
            height={60}
            src={imageUrl}
            alt="Category"
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback={DEFAULT_PRODUCT_IMAGE}
            preview={{
              src: imageUrl,
            }}
          />
        );
      },
    },
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => (
        <span style={{ fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span style={{ color: '#666' }}>{text || 'N/A'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Products',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 100,
      render: (count: number) => (
        <Tag color="blue">{count || 0}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => (
        <span>{new Date(date).toLocaleDateString('vi-VN')}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record: Category) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditCategory(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete category"
              description="Are you sure you want to delete this category?"
              onConfirm={() => handleDelete(record.id)}
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
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="categories-page">
      <div className="categories-header">
        <Title level={2}>Categories Management</Title>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleAddCategory}>
          Add Category
        </Button>
      </div>

      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div className="categories-filters">
            <Space wrap>
              <Input
                placeholder="Search categories (instant filter)..."
                allowClear
                size="large"
                style={{ width: 350 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined style={{ color: '#999' }} />}
              />
              <Button
                icon={<ReloadOutlined />}
                size="large"
                onClick={handleRefresh}
              >
                Refresh
              </Button>
            </Space>
          </div>

          <Table<Category>
            columns={columns}
            dataSource={categories}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} categories`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
          />
        </Space>
      </Card>

      <Modal
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        confirmLoading={isSaving}
        footer={[
          <Button key="cancel" onClick={handleModalCancel} disabled={isSaving}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSaving}
            onClick={handleModalOk}
            icon={<SaveOutlined />}
          >
            {editingCategory ? 'Update' : 'Create'}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="Category Name"
            name="name"
            rules={[
              { required: true, message: 'Please input category name!' },
              { min: 2, message: 'Category name must be at least 2 characters!' },
            ]}
          >
            <Input placeholder="Enter category name" size="large" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea
              placeholder="Enter category description"
              rows={4}
              size="large"
            />
          </Form.Item>

          <Form.Item label="Category Image">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: newFileList }) => setFileList(newFileList.slice(-1))}
              maxCount={1}
            >
              {fileList.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
