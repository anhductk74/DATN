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
  Button,
  Select,
  Image,
} from 'antd';
import {
  SearchOutlined,
  ShopOutlined,
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useShops } from '../../hooks/useShops';
import type { Shop } from '../../types/shop.types';
import { getCloudinaryUrl } from '../../config/config';
import '../Stores/Stores.css';

const { Title } = Typography;
const { Option } = Select;

function TopShops() {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<string>('viewCount,desc');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const { data: shopsData, isLoading } = useShops(currentPage, pageSize, sortBy);

  // Filter shops based on search
  const filteredShops = shopsData?.content.filter((shop) =>
    shop.name.toLowerCase().includes(searchText.toLowerCase()) ||
    shop.ownerName.toLowerCase().includes(searchText.toLowerCase())
  );

  // Only show shops with views > 0
  const topShops = filteredShops?.filter((shop) => shop.viewCount > 0);

  // Handle view shop details
  const handleViewShop = (shop: Shop) => {
    setSelectedShop(shop);
    setDetailModalVisible(true);
  };

  const columns: ColumnsType<Shop> = [
    {
      title: 'Rank',
      key: 'index',
      width: 80,
      align: 'center',
      render: (_: unknown, __: Shop, index: number) => {
        const rank = currentPage * pageSize + index + 1;
        let color = '#999';
        if (rank === 1) color = '#FFD700'; // Gold
        else if (rank === 2) color = '#C0C0C0'; // Silver
        else if (rank === 3) color = '#CD7F32'; // Bronze

        return (
          <span style={{ fontWeight: 600, fontSize: '16px', color }}>
            #{rank}
          </span>
        );
      },
    },
    {
      title: 'Shop',
      key: 'shop',
      width: 300,
      render: (_, shop: Shop) => (
        <Space>
          <Avatar 
            size={56} 
            src={getCloudinaryUrl(shop.avatar)}
            icon={<ShopOutlined />}
            style={{ 
              backgroundColor: shop.avatar ? 'transparent' : '#1890ff',
              flexShrink: 0 
            }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px' }}>{shop.name}</div>
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
      title: 'Total Views',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 150,
      align: 'center',
      sorter: (a: Shop, b: Shop) => a.viewCount - b.viewCount,
      render: (viewCount: number) => (
        <Tag color="magenta" style={{ fontWeight: 600, fontSize: '14px', padding: '4px 12px' }}>
          <EyeOutlined /> {viewCount.toLocaleString()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, shop: Shop) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewShop(shop)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="stores-container">
      <Card>
        <div className="stores-header">
          <Title level={2}>
            <SortAscendingOutlined /> Top Performing Shops
          </Title>
          <div className="stores-actions">
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: 200 }}
            >
              <Option value="viewCount,desc">Most Viewed</Option>
              <Option value="viewCount,asc">Least Viewed</Option>
              <Option value="name,asc">Name A-Z</Option>
              <Option value="name,desc">Name Z-A</Option>
            </Select>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search shops..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={topShops}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1100 }}
          pagination={{
            current: currentPage + 1,
            pageSize,
            total: topShops?.length || 0,
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
              <Descriptions.Item label="Description">
                {selectedShop.description || 'No description provided'}
              </Descriptions.Item>
              <Descriptions.Item label="View Count">
                <Tag color="magenta" style={{ fontSize: 16, padding: '4px 12px' }}>
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

export default TopShops;
