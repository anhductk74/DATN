import { useState } from 'react';
import {
  Table,
  Input,
  Card,
  Typography,
  Space,
  Tag,
  Modal,
  Descriptions,
  Avatar,
  Badge,
  Button,
  Popconfirm,
  Form,
  message,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router';
import {
  useManagers,
  useDeleteManager,
  useToggleManagerStatus,
} from '../../hooks/useManagers';
import { shippingCompanyService } from '../../services/shippingCompany.service';
import type { Manager } from '../../types/manager.types';
import { getCloudinaryUrl } from '../../config/config';
import './Managers.css';

const { Title } = Typography;

function Managers() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading, refetch } = useManagers(
    page,
    pageSize,
    search
  );

  const deleteManager = useDeleteManager();
  const toggleStatus = useToggleManagerStatus();

  const handleViewDetails = (manager: Manager) => {
    setSelectedManager(manager);
    setDetailModalVisible(true);
  };

  const handleOpenUpdate = (manager: Manager) => {
    setSelectedManager(manager);
    form.setFieldsValue({
      companyName: manager.companyName,
      companyCode: manager.companyCode,
      companyContactEmail: manager.companyContactEmail,
      companyContactPhone: manager.companyContactPhone,
      companyStreet: manager.companyStreet,
      companyCommune: manager.companyCommune,
      companyDistrict: manager.companyDistrict,
      companyCity: manager.companyCity,
    });
    setUpdateModalVisible(true);
  };

  const handleUpdate = async (values: any) => {
    if (!selectedManager) return;
    
    try {
      await shippingCompanyService.update(selectedManager.companyId, {
        name: values.companyName,
        code: values.companyCode,
        contactEmail: values.companyContactEmail,
        contactPhone: values.companyContactPhone,
        street: values.companyStreet,
        commune: values.companyCommune,
        district: values.companyDistrict,
        city: values.companyCity,
      });
      
      message.success('Shipping company updated successfully');
      setUpdateModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update shipping company');
      console.error('Update error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteManager.mutateAsync(id);
    refetch();
  };

  const handleToggleStatus = async (id: string) => {
    await toggleStatus.mutateAsync(id);
    refetch();
  };

  const columns: ColumnsType<Manager> = [
    {
      title: 'No.',
      key: 'index',
      width: 70,
      render: (_: unknown, __: Manager, index: number) => page * pageSize + index + 1,
    },
    {
      title: 'Manager',
      key: 'manager',
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          <Badge dot={!!record.isActive} color={record.isActive ? 'green' : 'red'}>
            <Avatar
              size={48}
              src={
                record.avatar
                  ? getCloudinaryUrl(record.avatar)
                  : undefined
              }
              icon={!record.avatar && <UserOutlined />}
            />
          </Badge>
          <div>
            <div style={{ fontWeight: 500 }}>{record.fullName || 'N/A'}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {record.username}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 140,
      render: (phone: string | null) => (
        <Space>
          <PhoneOutlined style={{ color: '#1890ff' }} />
          {phone || 'N/A'}
        </Space>
      ),
    },
    {
      title: 'Company',
      key: 'company',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <ShopOutlined style={{ color: '#52c41a' }} />
            <span style={{ fontWeight: 500 }}>
              {record.companyName}
            </span>
          </Space>
          {record.companyCode && (
            <Tag color="blue" style={{ fontSize: '11px' }}>
              {record.companyCode}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'District',
      key: 'district',
      width: 150,
      render: (_, record) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#faad14' }} />
          {record.companyDistrict}
        </Space>
      ),
    },
    {
      title: 'City',
      key: 'city',
      width: 150,
      render: (_, record) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#722ed1' }} />
          {record.companyCity}
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Tag
          icon={
            record.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />
          }
          color={record.isActive ? 'success' : 'error'}
        >
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenUpdate(record)}
          />
          <Button
            type="link"
            size="small"
            icon={record.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
            onClick={() => handleToggleStatus(record.managerId)}
            danger={!!record.isActive}
          />
          <Popconfirm
            title="Delete Manager"
            description="Are you sure you want to delete this manager? This action cannot be undone."
            onConfirm={() => handleDelete(record.managerId)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              size="small"
              icon={<DeleteOutlined />}
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="managers-container">
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div className="managers-header">
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Managers Management
              </Title>
              <p style={{ margin: '8px 0 0', color: '#999' }}>
                Manage shipping company managers and their information
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate('/dashboard/managers/register')}
            >
              Register Manager
            </Button>
          </div>

          {/* Filters */}
          <Space size="middle" wrap>
            <Input
              placeholder="Search by name, email, phone, company..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              style={{ width: 400 }}
              allowClear
            />
          </Space>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={data?.data || []}
            rowKey="managerId"
            loading={isLoading}
            scroll={{ x: 1200 }}
            pagination={{
              current: page + 1,
              pageSize: pageSize,
              total: data?.totalItems || 0,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} managers`,
              onChange: (newPage, newPageSize) => {
                setPage(newPage - 1);
                setPageSize(newPageSize);
              },
            }}
          />
        </Space>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            Manager Details
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedManager && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Manager Info */}
            <div style={{ textAlign: 'center' }}>
              <Badge
                dot={!!selectedManager.isActive}
                color={selectedManager.isActive ? 'green' : 'red'}
              >
                <Avatar
                  size={100}
                  src={
                    selectedManager.avatar
                      ? getCloudinaryUrl(selectedManager.avatar)
                      : undefined
                  }
                  icon={!selectedManager.avatar && <UserOutlined />}
                />
              </Badge>
              <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>
                {selectedManager.fullName || 'N/A'}
              </Title>
              <Tag
                icon={
                  selectedManager.isActive ? (
                    <CheckCircleOutlined />
                  ) : (
                    <CloseCircleOutlined />
                  )
                }
                color={selectedManager.isActive ? 'success' : 'error'}
              >
                {selectedManager.isActive ? 'Active' : 'Inactive'}
              </Tag>
            </div>

            <Descriptions bordered column={1}>
              <Descriptions.Item
                label={
                  <Space>
                    <MailOutlined />
                    Email
                  </Space>
                }
              >
                {selectedManager.username}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <PhoneOutlined />
                    Phone
                  </Space>
                }
              >
                {selectedManager.phoneNumber || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            {/* Company Info */}
            <Descriptions title="Shipping Company" bordered column={1}>
              <Descriptions.Item
                label={
                  <Space>
                    <ShopOutlined />
                    Company Name
                  </Space>
                }
              >
                {selectedManager.companyName}
              </Descriptions.Item>
              {selectedManager.companyCode && (
                <Descriptions.Item label="Company Code">
                  <Tag color="blue">{selectedManager.companyCode}</Tag>
                </Descriptions.Item>
              )}
              {selectedManager.companyContactEmail && (
                <Descriptions.Item
                  label={
                    <Space>
                      <MailOutlined />
                      Contact Email
                    </Space>
                  }
                >
                  {selectedManager.companyContactEmail}
                </Descriptions.Item>
              )}
              {selectedManager.companyContactPhone && (
                <Descriptions.Item
                  label={
                    <Space>
                      <PhoneOutlined />
                      Contact Phone
                    </Space>
                  }
                >
                  {selectedManager.companyContactPhone}
                </Descriptions.Item>
              )}
              <Descriptions.Item
                label={
                  <Space>
                    <EnvironmentOutlined />
                    Headquarters Address
                  </Space>
                }
              >
                {selectedManager.companyFullAddress}
              </Descriptions.Item>
              <Descriptions.Item label="District (Operational Area)">
                <Tag color="orange">
                  {selectedManager.companyDistrict}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Space>
        )}
      </Modal>

      {/* Update Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            Update Shipping Company
          </Space>
        }
        open={updateModalVisible}
        onCancel={() => {
          setUpdateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
        okText="Update"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Typography.Title level={5}>Company Information</Typography.Title>
          
          <Form.Item
            label="Company Name"
            name="companyName"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input placeholder="Enter company name" />
          </Form.Item>

          <Form.Item
            label="Company Code"
            name="companyCode"
          >
            <Input placeholder="Enter company code (optional)" />
          </Form.Item>

          <Form.Item
            label="Company Contact Email"
            name="companyContactEmail"
            rules={[
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter company contact email (optional)" />
          </Form.Item>

          <Form.Item
            label="Company Contact Phone"
            name="companyContactPhone"
            rules={[
              { pattern: /^[0-9]{10,11}$/, message: 'Phone number must be 10-11 digits' },
            ]}
          >
            <Input placeholder="Enter company contact phone (optional)" />
          </Form.Item>

          <Typography.Title level={5} style={{ marginTop: 24 }}>Company Address</Typography.Title>

          <Form.Item
            label="Street"
            name="companyStreet"
            rules={[{ required: true, message: 'Please enter street address' }]}
          >
            <Input placeholder="Enter street address" />
          </Form.Item>

          <Form.Item
            label="Commune/Ward"
            name="companyCommune"
            rules={[{ required: true, message: 'Please enter commune/ward' }]}
          >
            <Input placeholder="Enter commune or ward" />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              label="District"
              name="companyDistrict"
              rules={[{ required: true, message: 'Please enter district' }]}
              style={{ width: 300 }}
            >
              <Input placeholder="Enter district" />
            </Form.Item>

            <Form.Item
              label="City/Province"
              name="companyCity"
              rules={[{ required: true, message: 'Please enter city' }]}
              style={{ width: 300 }}
            >
              <Input placeholder="Enter city or province" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}

export default Managers;
