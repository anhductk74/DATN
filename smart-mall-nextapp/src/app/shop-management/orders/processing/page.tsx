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
  Steps,
  Timeline,
  Progress,
  Descriptions,
  Image
} from "antd";
import { 
  SearchOutlined, 
  ExportOutlined, 
  EyeOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined
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
const { Step } = Steps;

export default function ProcessingOrdersPage() {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const { message } = useAntdApp();
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
      loadProcessingOrders();
    }
  }, [currentShopId]);

  // Load orders when pagination changes
  useEffect(() => {
    if (currentShopId && pagination.current > 1) {
      loadProcessingOrders();
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

  const loadProcessingOrders = async () => {
    if (!currentShopId) {
      return;
    }
    setLoading(true);
    try {
      // Get both CONFIRMED and PACKED orders (processing orders)
      const [confirmedResponse, packedResponse] = await Promise.all([
        orderApiService.getOrdersByShopWithFilters(
          currentShopId,
          OrderStatus.CONFIRMED,
          0, // Always get from first page for combining
          50 // Get more to combine
        ),
        orderApiService.getOrdersByShopWithFilters(
          currentShopId,
          OrderStatus.PACKED,
          0, // Always get from first page for combining
          50 // Get more to combine
        )
      ]);
        
      // Combine orders from both statuses
      const allOrders = [
        ...(confirmedResponse.content || []),
        ...(packedResponse.content || [])
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Apply pagination to combined results
      const startIndex = (pagination.current - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginatedOrders = allOrders.slice(startIndex, endIndex);

      setOrders(paginatedOrders);
      setPagination(prev => ({
        ...prev,
        total: allOrders.length
      }));
      
      // Orders loaded successfully - no need to show message for normal operation
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load processing orders from server';
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

  const getProcessingStage = (status: OrderStatus) => {
    const stages: Record<OrderStatus, { step: number; text: string; progress: number }> = {
      [OrderStatus.PENDING]: { step: 0, text: 'Pending', progress: 10 },
      [OrderStatus.CONFIRMED]: { step: 1, text: 'Confirmed', progress: 25 },
      [OrderStatus.PACKED]: { step: 2, text: 'Packed', progress: 75 },
      [OrderStatus.SHIPPING]: { step: 3, text: 'Ready to Ship', progress: 100 },
      [OrderStatus.DELIVERED]: { step: 4, text: 'Delivered', progress: 100 },
      [OrderStatus.CANCELLED]: { step: 0, text: 'Cancelled', progress: 0 },
      [OrderStatus.RETURN_REQUESTED]: { step: 0, text: 'Return Requested', progress: 0 },
      [OrderStatus.RETURNED]: { step: 0, text: 'Returned', progress: 0 },
    };
    return stages[status] || { step: 0, text: 'Processing', progress: 0 };
  };

  const handleMoveToNextStage = async (orderId: string, currentStatus: OrderStatus) => {
    setProcessing(orderId);
    try {
      let newStatus: OrderStatus;
      let successMessage: string;
      
      if (currentStatus === OrderStatus.CONFIRMED) {
        newStatus = OrderStatus.PACKED;
        successMessage = 'Order status updated - Items are now being packed';
      } else if (currentStatus === OrderStatus.PACKED) {
        newStatus = OrderStatus.SHIPPING;
        successMessage = 'Order status updated - Ready for shipping';
      } else {
        return;
      }

      // Call API to update order status
      await orderApiService.updateOrderStatus({
        orderId,
        status: newStatus
      });

      // Update order status in state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      message.success(successMessage);
      
      // If moved to shipping, remove from processing list after delay
      if (newStatus === OrderStatus.SHIPPING) {
        setTimeout(() => {
          setOrders(prev => prev.filter(order => order.id !== orderId));
          setPagination(prev => ({
            ...prev,
            total: Math.max(0, prev.total - 1)
          }));
        }, 1500); // Give user time to see the success message
      }
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update order status';
      message.error(errorMessage);
    } finally {
      setProcessing(null);
    }
  };

  const orderStats = [
    {
      title: 'Processing Orders',
      value: orders.length,
      color: '#1890ff',
      icon: <PlayCircleOutlined style={{ fontSize: '24px' }} />
    },
    {
      title: 'Confirmed',
      value: orders.filter(order => order.status === OrderStatus.CONFIRMED).length,
      color: '#52c41a',
      icon: <CheckCircleOutlined style={{ fontSize: '24px' }} />
    },
    {
      title: 'Packed',
      value: orders.filter(order => order.status === OrderStatus.PACKED).length,
      color: '#722ed1',
      icon: <InboxOutlined style={{ fontSize: '24px' }} />
    },
    {
      title: 'Avg Processing Time',
      value: '2.5h',
      color: '#fa8c16',
      icon: <ClockCircleOutlined style={{ fontSize: '24px' }} />
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => {
        const stage = getProcessingStage(status);
        return (
          <div className="space-y-2">
            <Badge 
              color={status === OrderStatus.CONFIRMED ? 'blue' : 'purple'}
              text={status === OrderStatus.CONFIRMED ? 'Confirmed' : 'Packed'}
            />
            <Progress 
              percent={stage.progress} 
              size="small" 
              strokeColor={status === OrderStatus.CONFIRMED ? '#1890ff' : '#722ed1'}
              showInfo={false}
            />
          </div>
        );
      },
    },
    {
      title: 'Processing Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        const hours = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
        const minutes = Math.floor(((new Date().getTime() - new Date(date).getTime()) % (1000 * 60 * 60)) / (1000 * 60));
        return (
          <div className="text-sm">
            <div>{hours}h {minutes}m</div>
            <div className="text-gray-500 text-xs">in processing</div>
          </div>
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
            size="small"
            loading={processing === record.id}
            onClick={() => handleMoveToNextStage(record.id, record.status)}
          >
            {record.status === OrderStatus.CONFIRMED ? 'Start Packing' : 'Start Shipping'}
          </Button>
        </Space>
      ),
    },
  ];

  const filteredOrders = orders.filter(order => {
    // Only show orders that are actually in processing (CONFIRMED or PACKED)
    const isProcessing = order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.PACKED;
    
    const matchesSearch = order.id.toLowerCase().includes(searchText.toLowerCase()) ||
           order.userName.toLowerCase().includes(searchText.toLowerCase()) ||
           (order.items && order.items.some(item => 
             item.productName.toLowerCase().includes(searchText.toLowerCase())
           ));
    
    return isProcessing && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Processing Orders</h1>
        <p className="text-gray-600">Orders being prepared and packed for shipment</p>
      </div>

      {/* Processing Overview */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-4">Processing Pipeline</h3>
          <Steps current={-1} className="mb-6">
            <Step title="Order Confirmed" description="Payment verified, preparing items" icon={<CheckCircleOutlined />} />
            <Step title="Packing Items" description="Items being packaged" icon={<InboxOutlined />} />
            <Step title="Ready to Ship" description="Packed and ready for pickup" icon={<PlayCircleOutlined />} />
          </Steps>
        </div>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        {orderStats.map((stat, index) => (
          <Col xs={12} sm={6} key={index}>
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
              placeholder="Search processing orders..."
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
              Export Processing
            </Button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card 
        title={`Processing Orders (${filteredOrders.length})`}
        extra={
          <Button 
            type="primary" 
            onClick={() => message.info('Bulk processing actions coming soon')}
          >
            Bulk Actions
          </Button>
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
              `${range[0]}-${range[1]} of ${total} processing orders`,
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
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={`Processing Order - #${selectedOrder?.id.slice(-8)}`}
        open={orderDetailVisible}
        onCancel={() => setOrderDetailVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setOrderDetailVisible(false)}>
            Close
          </Button>,
          <Button 
            key="next" 
            type="primary"
            icon={selectedOrder?.status === OrderStatus.CONFIRMED ? <InboxOutlined /> : <PlayCircleOutlined />}
            onClick={() => {
              handleMoveToNextStage(selectedOrder!.id, selectedOrder!.status);
              setOrderDetailVisible(false);
            }}
          >
            {selectedOrder?.status === OrderStatus.CONFIRMED ? 'Start Packing' : 'Start Shipping'}
          </Button>
        ]}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Processing Pipeline */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h4 className="text-lg font-medium mb-4 text-center">Processing Pipeline</h4>
              <Steps
                current={selectedOrder.status === OrderStatus.CONFIRMED ? 0 : 
                        selectedOrder.status === OrderStatus.PACKED ? 1 : 2}
                items={[
                  {
                    title: 'Order Confirmed',
                    description: 'Payment verified',
                    icon: <CheckCircleOutlined />,
                  },
                  {
                    title: 'Packing Items',
                    description: selectedOrder.status === OrderStatus.PACKED ? 'Items packed ✓' : 'In progress...',
                    icon: <InboxOutlined />,
                  },
                  {
                    title: 'Ready for Shipping',
                    description: 'Awaiting pickup',
                    icon: <PlayCircleOutlined />,
                  }
                ]}
              />
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Processing Progress</span>
                  <span className="text-sm font-bold text-blue-600">
                    {getProcessingStage(selectedOrder.status).progress}%
                  </span>
                </div>
                <Progress 
                  percent={getProcessingStage(selectedOrder.status).progress} 
                  strokeColor={{
                    '0%': '#108ee9',
                    '50%': '#87d068',
                    '100%': '#52c41a',
                  }}
                  trailColor="#f0f0f0"
                  strokeWidth={8}
                />
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
              <Descriptions.Item label="Current Status">
                <Badge 
                  color={selectedOrder.status === OrderStatus.CONFIRMED ? 'blue' : 'purple'}
                  text={selectedOrder.status === OrderStatus.CONFIRMED ? 'Confirmed' : 'Packed'}
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
              <h4 className="text-lg font-medium mb-3">Items to Process</h4>
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {formatCurrency(item.subtotal)}
                          </span>
                          <Badge 
                            color={selectedOrder.status === OrderStatus.PACKED ? 'green' : 'processing'}
                            text={selectedOrder.status === OrderStatus.PACKED ? 'Packed ✓' : 'Processing'}
                          />
                        </div>
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

            {/* Processing Timeline */}
            <div>
              <h4 className="text-lg font-medium mb-3">Processing Timeline</h4>
              <Timeline
                items={[
                  {
                    color: 'green',
                    dot: <CheckCircleOutlined className="text-green-500" />,
                    children: (
                      <div>
                        <div className="font-medium">Order Confirmed</div>
                        <div className="text-sm text-gray-500">
                          {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                        </div>
                        <div className="text-sm text-green-600">Payment verified and order confirmed</div>
                      </div>
                    ),
                  },
                  {
                    color: selectedOrder.status === OrderStatus.PACKED ? 'green' : 'blue',
                    dot: selectedOrder.status === OrderStatus.PACKED ? 
                         <CheckCircleOutlined className="text-green-500" /> : 
                         <ClockCircleOutlined className="text-blue-500" />,
                    children: (
                      <div>
                        <div className="font-medium">
                          {selectedOrder.status === OrderStatus.PACKED ? 'Items Packed ✓' : 'Packing Items...'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedOrder.status === OrderStatus.PACKED ? 'Completed' : 'In Progress'}
                        </div>
                        <div className={`text-sm ${selectedOrder.status === OrderStatus.PACKED ? 'text-green-600' : 'text-blue-600'}`}>
                          {selectedOrder.status === OrderStatus.PACKED ? 
                           'All items have been packed and ready for shipping' : 
                           'Items are being packed by warehouse staff'}
                        </div>
                      </div>
                    ),
                  },
                  {
                    color: 'gray',
                    dot: <PlayCircleOutlined className="text-gray-400" />,
                    children: (
                      <div>
                        <div className="font-medium text-gray-500">Ready for Shipping</div>
                        <div className="text-sm text-gray-400">Pending</div>
                        <div className="text-sm text-gray-400">
                          Awaiting carrier pickup
                        </div>
                      </div>
                    ),
                  }
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}