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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router';
import {
  useManagers,
  useDeleteManager,
  useToggleManagerStatus,
} from '../../hooks/useManagers';
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
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);

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
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
          <Button
            type="link"
            size="small"
            icon={record.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
            onClick={() => handleToggleStatus(record.managerId)}
            danger={!!record.isActive}
          >
            {record.isActive ? 'Deactivate' : 'Activate'}
          </Button>
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
            >
              Delete
            </Button>
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
    </div>
  );
}

export default Managers;
