"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Input, 
  DatePicker, 
  Row, 
  Col, 
  Statistic, 
  Modal, 
  Badge,
  Alert,
  Descriptions,
  Image
} from "antd";
import { 
  SearchOutlined, 
  ExportOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import { orderApiService, OrderStatus, PaymentMethod, type OrderResponseDto } from "@/services/OrderApiService";
import { shopService, type Shop } from "@/services/ShopService";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { getCloudinaryUrl } from "@/config/config";
import { useAntdApp } from "@/hooks/useAntdApp";

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function PendingOrdersPage() {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const { message, modal } = useAntdApp();
  const [searchText, setSearchText] = useState('');
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null);
  const [orderDetailVisible, setOrderDetailVisible] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Load shop data when user changes
  useEffect(() => {
    loadShopData();
  }, [user?.id, userProfile?.id]);

  // Load orders when shop changes
  useEffect(() => {
    if (currentShopId) {
      loadPendingOrders();
    }
  }, [currentShopId]);

  // Load orders when pagination changes
  useEffect(() => {
    if (currentShopId && pagination.current > 1) {
      loadPendingOrders();
    }
  }, [pagination.current, pagination.pageSize]);

  const loadShopData = async () => {
    if (!user?.id && !userProfile?.id) {
      setLoadingShop(false);
      return;
    }

    setLoadingShop(true);
    try {
      const userId = user?.id || userProfile?.id;
      if (!userId) {
        message.error('User not found. Please login again.');
        setLoadingShop(false);
        return;
      }

      const response = await shopService.getShopsByOwner(userId);
      
      if (response.data && response.data.length > 0) {
        const shop = response.data[0]; // Get first shop of the user
        setCurrentShop(shop);
        setCurrentShopId(shop.id);
      } else {
        message.warning('No shop found for this user. Please create a shop first.');
        setCurrentShop(null);
        setCurrentShopId(null);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load shop data';
      message.error(`${errorMessage}. Please try again.`);
      setCurrentShop(null);
      setCurrentShopId(null);
    } finally {
      setLoadingShop(false);
    }
  };

  const loadPendingOrders = async () => {
    if (!currentShopId) {
      return;
    }
    setLoading(true);
    try {
      const response = await orderApiService.getOrdersByShopWithFilters(
        currentShopId,
        OrderStatus.PENDING, // Only get pending orders
        pagination.current - 1, // Backend uses 0-based pagination
        pagination.pageSize
      );
        
      setOrders(response.content || []);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements || 0
      }));
      
      // Orders loaded successfully - no need to show message for normal operation
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load pending orders from server';
      message.error(errorMessage);
      
      // Clear orders on failure
      setOrders([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getOrderAge = (createdAt: string): string => {
    const now = new Date();
    const orderDate = new Date(createdAt);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ago`;
    }
    return `${diffMinutes}m ago`;
  };

  const handleConfirmOrder = (orderId: string) => {
    modal.confirm({
      title: 'Confirm Order',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to confirm this order? This action cannot be undone.',
      okText: 'Confirm',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk() {
        processOrder(orderId, 'confirm');
      },
    });
  };

  const handleCancelOrder = (orderId: string) => {
    modal.confirm({
      title: 'Cancel Order',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to cancel this order?',
      okText: 'Cancel Order',
      okType: 'danger',
      cancelText: 'Keep Order',
      onOk() {
        processOrder(orderId, 'cancel');
      },
    });
  };

  const processOrder = async (orderId: string, action: 'confirm' | 'cancel') => {
    setProcessing(orderId);
    try {
      const newStatus = action === 'confirm' ? OrderStatus.CONFIRMED : OrderStatus.CANCELLED;
      
      // Call API to update order status
      await orderApiService.updateOrderStatus({
        orderId,
        status: newStatus
      });
      
      if (action === 'confirm') {
        message.success('Order confirmed successfully');
      } else {
        message.success('Order cancelled successfully');
      }
      
      // Remove from pending list since status changed
      setOrders(prev => prev.filter(order => order.id !== orderId));
      
      // Update pagination total count
      setPagination(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || `Failed to ${action} order`;
      message.error(errorMessage);
    } finally {
      setProcessing(null);
    }
  };

  const orderStats = [
    {
      title: 'Pending Orders',
      value: orders.length,
      color: '#faad14',
      icon: <ClockCircleOutlined style={{ fontSize: '24px' }} />
    },
    {
      title: 'Urgent Orders',
      value: orders.filter(order => {
        const orderAge = new Date().getTime() - new Date(order.createdAt).getTime();
        const hours = orderAge / (1000 * 60 * 60);
        return hours > 1;
      }).length,
      color: '#ff4d4f',
      icon: <ExclamationCircleOutlined style={{ fontSize: '24px' }} />
    },
    {
      title: 'Total Value',
      value: formatCurrency(orders.reduce((sum, order) => sum + order.finalAmount, 0)),
      color: '#52c41a',
      icon: <span style={{ fontSize: '24px' }}>💰</span>
    }
  ];

  const columns: ColumnsType<OrderResponseDto> = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text) => <span className="font-mono font-medium text-blue-600">#{text.slice(-8)}</span>,
    },
    {
      title: 'Customer',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.paymentMethod}</div>
        </div>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => (
        <div>
          <div className="font-medium">{items?.length || 0} item(s)</div>
          {items && items.length > 0 && (
            <div className="text-xs text-gray-500">
              {items[0].productName}
              {items.length > 1 && ` +${items.length - 1} more`}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Voucher',
      key: 'voucher',
      render: (_, record) => (
        <div>
          {record.discountAmount > 0 && (
            <div className="text-xs text-green-600">
              Discount: -{formatCurrency(record.discountAmount)}
            </div>
          )}
          {record.vouchers && record.vouchers.length > 0 && (
            <div className="text-xs text-orange-600">
              {record.vouchers.length} voucher(s)
            </div>
          )}
          {record.discountAmount === 0 && (!record.vouchers || record.vouchers.length === 0) && (
            <div className="text-xs text-gray-400">No discount</div>
          )}
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (amount, record) => (
        <div>
          <div className="font-medium text-green-600">
            {formatCurrency(amount)}
          </div>
          <div className="text-xs text-blue-600">
            Shipping: {formatCurrency(record.shippingFee)}
          </div>
        </div>
      ),
    },
    {
      title: 'Order Age',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        const age = getOrderAge(date);
        const hours = (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60);
        return (
          <Badge 
            color={hours > 1 ? 'red' : 'orange'}
            text={age}
          />
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            title="View Details"
            onClick={() => {
              setSelectedOrder(record);
              setOrderDetailVisible(true);
            }}
          />
          <Button 
            type="primary"
            icon={<CheckCircleOutlined />} 
            size="small"
            loading={processing === record.id}
            onClick={() => handleConfirmOrder(record.id)}
          >
            Confirm
          </Button>
          <Button 
            danger
            icon={<CloseCircleOutlined />} 
            size="small"
            loading={processing === record.id}
            onClick={() => handleCancelOrder(record.id)}
          >
            Cancel
          </Button>
        </Space>
      ),
    },
  ];

  const filteredOrders = orders.filter(order => {
    return order.id.toLowerCase().includes(searchText.toLowerCase()) ||
           order.userName.toLowerCase().includes(searchText.toLowerCase()) ||
           (order.items && order.items.some(item => 
             item.productName.toLowerCase().includes(searchText.toLowerCase())
           ));
  });

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending Orders</h1>
        <p className="text-gray-600">Orders waiting for confirmation</p>
      </div>

      {/* Alert for urgent orders */}
      {(typeof orderStats[1].value === 'number' && orderStats[1].value > 0) && (
        <Alert
          message={`${orderStats[1].value} orders have been pending for more than 1 hour`}
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary">
              Review Now
            </Button>
          }
          closable
        />
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        {orderStats.map((stat, index) => (
          <Col xs={8} sm={8} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                valueStyle={{ color: stat.color, fontSize: '20px', fontWeight: 'bold' }}
                prefix={stat.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Search
              placeholder="Search pending orders..."
              allowClear
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              size="large"
            />
            <RangePicker 
              placeholder={['Start Date', 'End Date']} 
              size="large"
            />
          </div>
          
          <div className="flex gap-2">
            <Button icon={<ExportOutlined />}>
              Export Pending
            </Button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card 
        title={`Pending Orders (${filteredOrders.length})`}
        extra={
          <div className="flex gap-2">
            <Button 
              type="primary" 
              onClick={() => {
                if (filteredOrders.length === 0) {
                  message.warning('No pending orders to confirm');
                  return;
                }
                modal.confirm({
                  title: `Confirm ${filteredOrders.length} Orders`,
                  icon: <ExclamationCircleOutlined />,
                  content: `Are you sure you want to confirm all ${filteredOrders.length} pending orders?`,
                  okText: 'Confirm All',
                  okType: 'primary',
                  cancelText: 'Cancel',
                  onOk() {
                    message.info('Bulk confirmation will be implemented soon');
                    // TODO: Implement bulk confirmation
                  },
                });
              }}
              disabled={loading || filteredOrders.length === 0}
            >
              Confirm All ({filteredOrders.length})
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredOrders}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} pending orders`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize || prev.pageSize
              }));
            },
            onShowSizeChange: (current, size) => {
              setPagination(prev => ({
                ...prev,
                current: 1,
                pageSize: size
              }));
            }
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={`Pending Order - #${selectedOrder?.id.slice(-8)}`}
        open={orderDetailVisible}
        onCancel={() => setOrderDetailVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setOrderDetailVisible(false)}>
            Close
          </Button>,
          <Button 
            key="reject" 
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => {
              handleCancelOrder(selectedOrder!.id);
              setOrderDetailVisible(false);
            }}
          >
            Cancel Order
          </Button>,
          <Button 
            key="confirm" 
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => {
              handleConfirmOrder(selectedOrder!.id);
              setOrderDetailVisible(false);
            }}
          >
            Confirm Order
          </Button>
        ]}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <ClockCircleOutlined className="text-yellow-600" />
                <span className="font-medium">Order Age: {getOrderAge(selectedOrder.createdAt)}</span>
              </div>
            </div>

            {/* Order Information */}
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Order ID">
                <span className="font-mono">{selectedOrder.id}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedOrder.userName}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge 
                  color="gold"
                  text="Pending"
                />
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                <Tag color={selectedOrder.paymentMethod === PaymentMethod.COD ? 'orange' : 
                           selectedOrder.paymentMethod === PaymentMethod.CREDIT_CARD ? 'blue' : 'green'}>
                  {selectedOrder.paymentMethod === PaymentMethod.COD ? 'Cash on Delivery' :
                   selectedOrder.paymentMethod === PaymentMethod.CREDIT_CARD ? 'Credit Card' : 'E-Wallet'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Shop">
                {selectedOrder.shopName}
              </Descriptions.Item>
            </Descriptions>

            {/* Applied Vouchers */}
            {selectedOrder.vouchers && selectedOrder.vouchers.length > 0 && (
              <div>
                <h4 className="text-lg font-medium mb-3">Applied Vouchers</h4>
                <div className="space-y-2">
                  {selectedOrder.vouchers.map((voucher, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Tag color="orange" className="font-mono">
                          {voucher.voucherCode}
                        </Tag>
                        {voucher.voucherCode && (
                          <span className="text-sm text-gray-700">{voucher.voucherCode}</span>
                        )}
                      </div>
                      <span className="font-medium text-green-600">
                        -{formatCurrency(voucher.discountAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping Address */}
            {selectedOrder.shippingAddress && (
              <div>
                <h4 className="text-lg font-medium mb-3">Shipping Address</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium">{selectedOrder.shippingAddress.fullName}</div>
                  <div className="text-gray-600">{selectedOrder.shippingAddress.phone}</div>
                  <div className="text-gray-600 mt-1">
                    {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.ward}, {' '}
                    {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.province}
                  </div>
                  {selectedOrder.shippingAddress.isDefault && (
                    <Tag color="blue" className="mt-2 text-xs">Default Address</Tag>
                  )}
                </div>
              </div>
            )}
            
            {/* Order Items */}
            <div>
              <h4 className="text-lg font-medium mb-3">Items to Confirm</h4>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-3 border rounded-lg">
                    <Image
                      width={60}
                      height={60}
                      src={getCloudinaryUrl(item.productImage)}
                      alt={item.productName}
                      className="rounded"
                      fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='%23666'%3ENo Image%3C/text%3E%3C/svg%3E"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium">{item.productName}</h5>
                      <p className="text-sm text-gray-500">
                        SKU: {item.variant?.sku || 'N/A'}
                      </p>
                      {item.variant?.salePrice && item.variant.salePrice < item.variant.price && (
                        <div className="text-sm">
                          <span className="line-through text-gray-400">
                            {formatCurrency(item.variant.price)}
                          </span>
                          <span className="text-red-600 ml-2">
                            {formatCurrency(item.variant.salePrice)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">
                          {formatCurrency(item.price)} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h4 className="text-lg font-medium mb-3">Order Summary</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span>{formatCurrency(selectedOrder.shippingFee)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Final Amount:</span>
                  <span className="text-green-600">{formatCurrency(selectedOrder.finalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}