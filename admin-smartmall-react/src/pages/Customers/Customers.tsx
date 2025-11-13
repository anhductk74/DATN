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
  Select,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  QuestionOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useUsers } from '../../hooks/useUsers';
import type { User } from '../../types/user.types';
import { getCloudinaryUrl } from '../../config/config';
import './Customers.css';

const { Title } = Typography;
const { Option } = Select;

// Gender icon helper
const getGenderIcon = (gender: string | null) => {
  if (gender === 'MALE') return <ManOutlined style={{ color: '#1890ff' }} />;
  if (gender === 'FEMALE') return <WomanOutlined style={{ color: '#eb2f96' }} />;
  return <QuestionOutlined style={{ color: '#999' }} />;
};

// Gender label helper
const getGenderLabel = (gender: string | null) => {
  if (gender === 'MALE') return 'Male';
  if (gender === 'FEMALE') return 'Female';
  if (gender === 'OTHER') return 'Other';
  return 'N/A';
};

function Customers() {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<string>('username,asc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const { data: usersData, isLoading } = useUsers('USER', currentPage, pageSize, sortBy);

  // Filter users based on search
  const filteredUsers = usersData?.content.filter((user) =>
    user.username.toLowerCase().includes(searchText.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.phoneNumber?.includes(searchText)
  );

  // Handle view user details
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setDetailModalVisible(true);
  };

  const columns: ColumnsType<User> = [
    {
      title: 'No.',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_: unknown, __: User, index: number) => (
        <span style={{ fontWeight: 500 }}>
          {currentPage * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: 'User',
      key: 'user',
      width: 280,
      render: (_, user: User) => (
        <Space>
          <Badge dot={user.isActive} color="green" offset={[-5, 40]}>
            <Avatar
              size={48}
              src={getCloudinaryUrl(user.avatar || '')}
              icon={<UserOutlined />}
              style={{
                backgroundColor: user.avatar ? 'transparent' : '#1890ff',
                flexShrink: 0,
              }}
            />
          </Badge>
          <div>
            <div style={{ fontWeight: 500 }}>{user.username}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {user.fullName || 'No name provided'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 130,
      render: (phoneNumber: string | null) => (
        phoneNumber ? (
          <span>
            <PhoneOutlined style={{ marginRight: 4, color: '#52c41a' }} />
            {phoneNumber}
          </span>
        ) : (
          <span style={{ color: '#999' }}>N/A</span>
        )
      ),
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
      align: 'center',
      render: (gender: string | null) => (
        <Space>
          {getGenderIcon(gender)}
          <span>{getGenderLabel(gender)}</span>
        </Space>
      ),
    },
    {
      title: 'Birth Date',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      width: 120,
      render: (dateOfBirth: string | null) => (
        dateOfBirth ? (
          <span>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {new Date(dateOfBirth).toLocaleDateString('en-GB')}
          </span>
        ) : (
          <span style={{ color: '#999' }}>N/A</span>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, user: User) => (
        <Space size="small">
          <EyeOutlined
            style={{ fontSize: 16, color: '#1890ff', cursor: 'pointer' }}
            onClick={() => handleViewUser(user)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="customers-container">
      <Card>
        <div className="customers-header">
          <Title level={2}>
            <UserOutlined /> Customer Management
          </Title>
          <div className="customers-actions">
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: 180 }}
            >
              <Option value="username,asc">Username A-Z</Option>
              <Option value="username,desc">Username Z-A</Option>
              <Option value="isActive,desc">Active First</Option>
              <Option value="isActive,asc">Inactive First</Option>
            </Select>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search username, name, phone..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 350 }}
              allowClear
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1100 }}
          pagination={{
            current: currentPage + 1,
            pageSize,
            total: usersData?.totalElements || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} customers`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (page, size) => {
              setCurrentPage(page - 1);
              setPageSize(size);
            },
          }}
        />
      </Card>

      {/* User Detail Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: '#1890ff' }} />
            Customer Details
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <div className="user-detail-content">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Badge dot={selectedUser.isActive} color="green" offset={[-10, 110]}>
                {selectedUser.avatar ? (
                  <Avatar
                    size={100}
                    src={getCloudinaryUrl(selectedUser.avatar)}
                    icon={<UserOutlined />}
                  />
                ) : (
                  <Avatar
                    size={100}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#1890ff' }}
                  />
                )}
              </Badge>
              <div style={{ marginTop: 12 }}>
                <Tag color={selectedUser.isActive ? 'green' : 'red'}>
                  {selectedUser.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </div>
            </div>

            <Descriptions bordered column={1}>
              <Descriptions.Item label="Username">
                <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <strong>{selectedUser.username}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Full Name">
                {selectedUser.fullName || <span style={{ color: '#999' }}>Not provided</span>}
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                {selectedUser.phoneNumber ? (
                  <>
                    <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                    {selectedUser.phoneNumber}
                  </>
                ) : (
                  <span style={{ color: '#999' }}>Not provided</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {getGenderIcon(selectedUser.gender)}
                <span style={{ marginLeft: 8 }}>{getGenderLabel(selectedUser.gender)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {selectedUser.dateOfBirth ? (
                  <>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    {new Date(selectedUser.dateOfBirth).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </>
                ) : (
                  <span style={{ color: '#999' }}>Not provided</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="User ID">
                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                  {selectedUser.id}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Roles">
                {selectedUser.roles.map((role) => (
                  <Tag key={role} color="blue">
                    {role}
                  </Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Customers;
