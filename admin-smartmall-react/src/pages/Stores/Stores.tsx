import { useState } from 'react';
import {
  Table,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Tag,
  Modal,
  Descriptions,
  Avatar,
  message,
  Popconfirm,
  Image,
} from 'antd';
import {
  SearchOutlined,
  ShopOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useShops, useDeleteShop } from '../../hooks/useShops';
import type { Shop } from '../../types/shop.types';
import { getCloudinaryUrl } from '../../config/config';
import './Stores.css';

const { Title } = Typography;

function Stores() {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const { data: shopsData, isLoading } = useShops(currentPage, pageSize, 'viewCount,desc');
  const deleteShopMutation = useDeleteShop();

  // Filter shops based on search
  const filteredShops = shopsData?.content.filter((shop) =>
    shop.name.toLowerCase().includes(searchText.toLowerCase()) ||
    shop.ownerName.toLowerCase().includes(searchText.toLowerCase()) ||
    shop.numberPhone.includes(searchText)
  );

  // Handle view shop details
  const handleViewShop = (shop: Shop) => {
    setSelectedShop(shop);
    setDetailModalVisible(true);
  };

  // Handle delete shop
  const handleDelete = async (id: string) => {
    try {
      await deleteShopMutation.mutateAsync(id);
      message.success('Shop deleted successfully!');
    } catch {
      message.error('Failed to delete shop');
    }
  };

  const columns: ColumnsType<Shop> = [
    {
      title: 'No.',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_: unknown, __: Shop, index: number) => (
        <span style={{ fontWeight: 500 }}>
          {currentPage * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: 'Shop',
      key: 'shop',
      width: 300,
      render: (_, shop: Shop) => (
        <Space>
          <Avatar 
            size={48} 
            src={getCloudinaryUrl(shop.avatar)}
            icon={<ShopOutlined />}
            style={{ 
              backgroundColor: shop.avatar ? 'transparent' : '#1890ff',
              flexShrink: 0 
            }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{shop.name}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              <PhoneOutlined /> {shop.numberPhone}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'ownerName',
      key: 'ownerName',
      width: 150,
      render: (ownerName: string) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          {ownerName}
        </Space>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      width: 200,
      render: (_, shop: Shop) => (
        <div style={{ fontSize: '13px' }}>
          <EnvironmentOutlined style={{ marginRight: 4, color: '#52c41a' }} />
          {shop.address.district}, {shop.address.province}
        </div>
      ),
    },
    {
      title: 'Views',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
      align: 'center',
      sorter: (a: Shop, b: Shop) => a.viewCount - b.viewCount,
      render: (viewCount: number) => (
        <Tag color="blue" style={{ fontWeight: 500 }}>
          <EyeOutlined /> {viewCount.toLocaleString()}
        </Tag>
      ),
    },
    {
      title: 'CCCD',
      dataIndex: 'cccd',
      key: 'cccd',
      width: 140,
      render: (cccd: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          <IdcardOutlined style={{ marginRight: 4 }} />
          {cccd}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, shop: Shop) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewShop(shop)}
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            style={{ color: '#faad14' }}
          />
          <Popconfirm
            title="Delete Shop"
            description="Are you sure you want to delete this shop?"
            onConfirm={() => handleDelete(shop.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              size="small"
              icon={<DeleteOutlined />}
              danger
              loading={deleteShopMutation.isPending}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="stores-container">
      <Card>
        <div className="stores-header">
          <Title level={2}>
            <ShopOutlined /> Store Management
          </Title>
          <div className="stores-actions">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search shops, owner, phone..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 350 }}
              allowClear
            />
            <Button type="primary" icon={<ShopOutlined />}>
              Add New Shop
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredShops}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage + 1,
            pageSize,
            total: shopsData?.totalElements || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} shops`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (page, size) => {
              setCurrentPage(page - 1);
              setPageSize(size);
            },
          }}
        />
      </Card>

      {/* Shop Detail Modal */}
      <Modal
        title={
          <Space>
            <ShopOutlined style={{ color: '#1890ff' }} />
            Shop Details
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />}>
            Edit Shop
          </Button>,
        ]}
        width={700}
      >
        {selectedShop && (
          <div className="shop-detail-content">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              {selectedShop.avatar ? (
                <Image
                  src={getCloudinaryUrl(selectedShop.avatar)}
                  alt={selectedShop.name}
                  style={{ borderRadius: 8, maxWidth: 200 }}
                  preview
                />
              ) : (
                <Avatar 
                  size={120} 
                  icon={<ShopOutlined />}
                  style={{ backgroundColor: '#1890ff' }}
                />
              )}
            </div>            <Descriptions bordered column={1}>
              <Descriptions.Item label="Shop Name">
                <strong>{selectedShop.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Owner">
                <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                {selectedShop.ownerName}
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                {selectedShop.numberPhone}
              </Descriptions.Item>
              <Descriptions.Item label="CCCD">
                <IdcardOutlined style={{ marginRight: 8 }} />
                <span style={{ fontFamily: 'monospace' }}>
                  {selectedShop.cccd}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedShop.description || 'No description provided'}
              </Descriptions.Item>
              <Descriptions.Item label="View Count">
                <Tag color="blue" style={{ fontSize: 14 }}>
                  <EyeOutlined /> {selectedShop.viewCount.toLocaleString()} views
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                <EnvironmentOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                <div>
                  {selectedShop.address.street}, {selectedShop.address.ward}
                  <br />
                  {selectedShop.address.district}, {selectedShop.address.province}
                  <br />
                  {selectedShop.address.country}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Stores;
