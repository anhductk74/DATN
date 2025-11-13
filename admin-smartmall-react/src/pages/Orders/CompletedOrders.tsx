import { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Typography,
  Tooltip,
  Modal,
  Descriptions,
  Timeline,
  Popover,
  Image,
} from 'antd';
import type { TableProps, TablePaginationConfig } from 'antd';
import {
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  CarOutlined,
  HomeOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { useOrders } from '../../hooks/useOrders';
import type { Order, OrderStatus } from '../../types/order.types';
import { getCloudinaryUrl, DEFAULT_PRODUCT_IMAGE } from '../../config/config';
import '../Orders/Orders.css';

const { Title } = Typography;

// Order status configuration
const ORDER_STATUS_CONFIG: Record<OrderStatus, { color: string; icon: React.ReactNode; label: string }> = {
  PENDING: { color: 'gold', icon: <ClockCircleOutlined />, label: 'Pending' },
  CONFIRMED: { color: 'cyan', icon: <CheckCircleOutlined />, label: 'Confirmed' },
  PACKED: { color: 'blue', icon: <ShoppingOutlined />, label: 'Packed' },
  SHIPPING: { color: 'processing', icon: <CarOutlined />, label: 'Shipping' },
  DELIVERED: { color: 'success', icon: <HomeOutlined />, label: 'Delivered' },
  CANCELLED: { color: 'error', icon: <CloseCircleOutlined />, label: 'Cancelled' },
  RETURN_REQUESTED: { color: 'warning', icon: <RollbackOutlined />, label: 'Return Requested' },
  RETURNED: { color: 'default', icon: <RollbackOutlined />, label: 'Returned' },
};

// Payment method configuration
const PAYMENT_METHOD_CONFIG = {
  COD: { color: 'gold', label: 'Cash on Delivery' },
  CREDIT_CARD: { color: 'blue', label: 'Credit Card' },
  E_WALLET: { color: 'purple', label: 'E-Wallet' },
};

export default function CompletedOrders() {
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch delivered orders only
  const { data: ordersData, isLoading, refetch } = useOrders(page, pageSize, 'DELIVERED');

  // Client-side filtering from cached data
  const allOrders = ordersData?.content || [];
  
  const filteredOrders = searchText
    ? allOrders.filter((order) => 
        order.userName.toLowerCase().includes(searchText.toLowerCase()) ||
        order.shopName.toLowerCase().includes(searchText.toLowerCase()) ||
        order.id.toLowerCase().includes(searchText.toLowerCase())
      )
    : allOrders;

  const orders = filteredOrders;
  const loading = isLoading;
  
  const pagination = {
    current: (ordersData?.number || 0) + 1,
    pageSize: ordersData?.size || 20,
    total: ordersData?.totalElements || 0,
    showTotal: (total: number) => `Total ${total} completed orders`,
  };

  const handleTableChange: TableProps<Order>['onChange'] = (newPagination: TablePaginationConfig) => {
    const newPage = (newPagination.current || 1) - 1;
    const newSize = newPagination.pageSize || 20;
    setPage(newPage);
    setPageSize(newSize);
  };

  const handleRefresh = () => {
    setSearchText('');
    setPage(0);
    refetch();
  };

  const handleViewDetails = (record: Order) => {
    setSelectedOrder(record);
    setIsDetailModalOpen(true);
  };

  // Render order items popover
  const renderItemsPopover = (items: Order['items']) => (
    <div className="order-items-popover">
      {items.map((item) => (
        <div key={item.id} className="order-item">
          <Image
            src={item.productImage ? getCloudinaryUrl(item.productImage) : DEFAULT_PRODUCT_IMAGE}
            alt={item.productName}
            width={50}
            height={50}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback={DEFAULT_PRODUCT_IMAGE}
          />
          <div className="order-item-info">
            <div className="order-item-name">{item.productName}</div>
            <div className="order-item-variant">
              {item.variant.color} - {item.variant.size}
            </div>
            <div>Qty: {item.quantity}</div>
          </div>
          <div className="order-item-price">
            <div>{item.price.toLocaleString('vi-VN')}₫</div>
            <div style={{ fontWeight: 600 }}>
              {item.subtotal.toLocaleString('vi-VN')}₫
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const columns: TableProps<Order>['columns'] = [
    {
      title: 'No.',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_: unknown, __: Order, index: number) => (
        <span style={{ fontWeight: 500 }}>
          {(page * pageSize) + index + 1}
        </span>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'userName',
      key: 'userName',
      width: 150,
      render: (name: string) => (
        <span style={{ fontWeight: 500 }}>{name}</span>
      ),
    },
    {
      title: 'Shop',
      dataIndex: 'shopName',
      key: 'shopName',
      width: 180,
      render: (shopName: string, record: Order) => (
        <Space>
          {record.shopAvatar && (
            <Image
              src={getCloudinaryUrl(record.shopAvatar)}
              alt={shopName}
              width={32}
              height={32}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
              fallback={DEFAULT_PRODUCT_IMAGE}
              preview={false}
            />
          )}
          <span>{shopName}</span>
        </Space>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      width: 80,
      align: 'center',
      render: (items: Order['items']) => (
        <Popover content={renderItemsPopover(items)} title="Order Items" trigger="hover">
          <Tag color="blue" style={{ cursor: 'pointer' }}>
            {items.length} item{items.length > 1 ? 's' : ''}
          </Tag>
        </Popover>
      ),
    },
    {
      title: 'Final Amount',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      width: 130,
      align: 'right',
      render: (amount: number) => (
        <span className="order-amount">
          {amount.toLocaleString('vi-VN')}₫
        </span>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120,
      render: (method: string) => {
        const config = PAYMENT_METHOD_CONFIG[method as keyof typeof PAYMENT_METHOD_CONFIG];
        return (
          <Tag color={config?.color || 'default'}>
            {config?.label || method}
          </Tag>
        );
      },
    },
    {
      title: 'Completed At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => (
        <span>{new Date(date).toLocaleString('vi-VN')}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record: Order) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="orders-page">
      <div className="orders-header">
        <Title level={2}>Completed Orders</Title>
      </div>

      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div className="orders-filters">
            <Space wrap>
              <Input
                placeholder="Search completed orders..."
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

          <Table<Order>
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
          />
        </Space>
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={`Completed Order - ${selectedOrder?.id.slice(0, 8)}...`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedOrder && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Order ID" span={2}>
                <code>{selectedOrder.id}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedOrder.userName}
              </Descriptions.Item>
              <Descriptions.Item label="Shop">
                {selectedOrder.shopName}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag 
                  color={ORDER_STATUS_CONFIG[selectedOrder.status].color}
                  icon={ORDER_STATUS_CONFIG[selectedOrder.status].icon}
                >
                  {ORDER_STATUS_CONFIG[selectedOrder.status].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                <Tag color={PAYMENT_METHOD_CONFIG[selectedOrder.paymentMethod].color}>
                  {PAYMENT_METHOD_CONFIG[selectedOrder.paymentMethod].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                {selectedOrder.totalAmount.toLocaleString('vi-VN')}₫
              </Descriptions.Item>
              <Descriptions.Item label="Shipping Fee">
                {selectedOrder.shippingFee.toLocaleString('vi-VN')}₫
              </Descriptions.Item>
              <Descriptions.Item label="Discount">
                -{selectedOrder.discountAmount.toLocaleString('vi-VN')}₫
              </Descriptions.Item>
              <Descriptions.Item label="Final Amount">
                <span className="order-amount">
                  {selectedOrder.finalAmount.toLocaleString('vi-VN')}₫
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Created At" span={2}>
                {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>

            {/* Order Items */}
            <div>
              <Title level={5}>Order Items</Title>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="order-item" style={{ padding: '12px', background: '#fafafa', marginBottom: 8, borderRadius: 4 }}>
                  <Space align="start">
                    <Image
                      src={item.productImage ? getCloudinaryUrl(item.productImage) : DEFAULT_PRODUCT_IMAGE}
                      alt={item.productName}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                      fallback={DEFAULT_PRODUCT_IMAGE}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.productName}</div>
                      <div style={{ color: '#666', fontSize: 13 }}>
                        Variant: {item.variant.color} - {item.variant.size}
                      </div>
                      <div style={{ color: '#666', fontSize: 13 }}>SKU: {item.variant.sku}</div>
                      <div style={{ marginTop: 8 }}>
                        <Space>
                          <span>Quantity: {item.quantity}</span>
                          <span>×</span>
                          <span>{item.price.toLocaleString('vi-VN')}₫</span>
                          <span>=</span>
                          <span style={{ fontWeight: 600, color: '#1890ff' }}>
                            {item.subtotal.toLocaleString('vi-VN')}₫
                          </span>
                        </Space>
                      </div>
                    </div>
                  </Space>
                </div>
              ))}
            </div>

            {/* Vouchers */}
            {selectedOrder.vouchers && selectedOrder.vouchers.length > 0 && (
              <div>
                <Title level={5}>Applied Vouchers</Title>
                {selectedOrder.vouchers.map((voucher) => (
                  <Tag key={voucher.id} color="green" style={{ marginBottom: 8 }}>
                    {voucher.voucherCode}: -{voucher.discountAmount.toLocaleString('vi-VN')}₫
                  </Tag>
                ))}
              </div>
            )}

            {/* Status History */}
            <div>
              <Title level={5}>Order Timeline</Title>
              <Timeline
                items={selectedOrder.statusHistories.map((history) => ({
                  color: ORDER_STATUS_CONFIG[history.toStatus]?.color || 'blue',
                  children: (
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {ORDER_STATUS_CONFIG[history.toStatus]?.label || history.toStatus}
                      </div>
                      {history.note && (
                        <div style={{ fontSize: 12, color: '#666' }}>{history.note}</div>
                      )}
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        {new Date(history.changedAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  ),
                }))}
              />
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
}
