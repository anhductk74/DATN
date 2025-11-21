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
  message,
  Badge,
  Timeline,
  Divider,
  Descriptions,
  Alert,
  Select,
  Progress,
  Tooltip
} from "antd";
import { 
  SearchOutlined, 
  ExportOutlined, 
  EyeOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  FundOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import { orderApiService, OrderStatus, PaymentMethod, type OrderResponseDto } from "@/services/OrderApiService";
import { shopService, type Shop } from "@/services/ShopService";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { getCloudinaryUrl } from "@/config/config";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface CancellationInfo {
  reason: string;
  cancelledBy: 'customer' | 'shop' | 'system';
  cancelledAt: string;
  refundStatus: 'pending' | 'processing' | 'completed' | 'failed';
  refundAmount: number;
  refundMethod: string;
  notes?: string;
}

const cancellationReasons = [
  'Customer requested cancellation',
  'Out of stock',
  'Payment failed',
  'Shipping address invalid',
  'Product defect discovered',
  'Duplicate order',
  'System error',
  'Fraud suspected',
  'Other'
];

export default function CancelledOrdersPage() {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const [searchText, setSearchText] = useState('');
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null);
  const [cancellationInfo, setCancellationInfo] = useState<{ [key: string]: CancellationInfo }>({});
  const [orderDetailVisible, setOrderDetailVisible] = useState(false);
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [refundFilter, setRefundFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);
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

  // Load orders when shop or filters change
  useEffect(() => {
    if (currentShopId) {
      loadCancelledOrders();
    }
  }, [currentShopId, dateRange]);

  // Load orders when pagination changes
  useEffect(() => {
    if (currentShopId && pagination.current > 1) {
      loadCancelledOrders();
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

  const loadCancelledOrders = async () => {
    if (!currentShopId) {
      return;
    }
    setLoading(true);
    try {
      const response = await orderApiService.getOrdersByShopWithFilters(
        currentShopId,
        OrderStatus.CANCELLED, // Only get cancelled orders
        pagination.current - 1, // Backend uses 0-based pagination
        pagination.pageSize
      );
        
      setOrders(response.content || []);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements || 0
      }));
      
      // Orders loaded successfully - no need to show message for normal operation
      
      // Generate mock cancellation info for existing orders
      // In real implementation, this would come from the backend
      const mockCancellationInfo: { [key: string]: CancellationInfo } = {};
      response.content?.forEach(order => {
        mockCancellationInfo[order.id] = {
          reason: 'Customer requested cancellation',
          cancelledBy: 'customer',
          cancelledAt: order.createdAt,
          refundStatus: order.paymentMethod === PaymentMethod.COD ? 'completed' : 'processing',
          refundAmount: order.paymentMethod === PaymentMethod.COD ? 0 : order.finalAmount,
          refundMethod: order.paymentMethod === PaymentMethod.COD ? 'N/A - COD Order' : 'Credit Card Reversal',
          notes: 'Order cancelled as requested'
        };
      });
      setCancellationInfo(mockCancellationInfo);
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load cancelled orders from server';
      message.error(errorMessage);
      
      // Clear orders on failure
      setOrders([]);
      setPagination(prev => ({ ...prev, total: 0 }));
      setCancellationInfo({});
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

  const getRefundStatusColor = (status: string) => {
    const colors = {
      'pending': 'orange',
      'processing': 'blue',
      'completed': 'green',
      'failed': 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getCancelledByColor = (cancelledBy: string) => {
    const colors = {
      'customer': 'blue',
      'shop': 'purple',
      'system': 'red'
    };
    return colors[cancelledBy as keyof typeof colors] || 'default';
  };

  const getCancellationStats = () => {
    const totalCancelled = orders.length;
    const customerCancelled = Object.values(cancellationInfo).filter(info => info.cancelledBy === 'customer').length;
    const shopCancelled = Object.values(cancellationInfo).filter(info => info.cancelledBy === 'shop').length;
    const totalRefundAmount = Object.values(cancellationInfo).reduce((sum, info) => sum + info.refundAmount, 0);
    
    return { totalCancelled, customerCancelled, shopCancelled, totalRefundAmount };
  };



  const stats = getCancellationStats();

  const orderStats = [
    {
      title: 'Cancelled Orders',
      value: stats.totalCancelled,
      color: '#f5222d',
      icon: <StopOutlined style={{ fontSize: '24px' }} />
    },
    {
      title: 'Customer Cancelled',
      value: stats.customerCancelled,
      color: '#1890ff',
      icon: <ExclamationCircleOutlined style={{ fontSize: '24px' }} />
    },
    {
      title: 'Shop Cancelled',
      value: stats.shopCancelled,
      color: '#722ed1',
      icon: <CloseCircleOutlined style={{ fontSize: '24px' }} />
    },
    {
      title: 'Refund Amount',
      value: formatCurrency(stats.totalRefundAmount),
      color: '#fa8c16',
      icon: <DollarOutlined style={{ fontSize: '24px' }} />
    }
  ];

  const columns: ColumnsType<OrderResponseDto> = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text) => <span className="font-mono font-medium text-red-600">#{text.slice(-8)}</span>,
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
      title: 'Cancellation Reason',
      dataIndex: 'id',
      key: 'reason',
      render: (orderId) => {
        const info = cancellationInfo[orderId];
        return info ? (
          <div>
            <div className="text-sm">{info.reason}</div>
            <Badge 
              color={getCancelledByColor(info.cancelledBy)}
              text={`By ${info.cancelledBy}`}
              className="mt-1"
            />
          </div>
        ) : (
          <span className="text-gray-400">No info</span>
        );
      },
    },
    {
      title: 'Cancelled Date',
      dataIndex: 'id',
      key: 'cancelledDate',
      render: (orderId) => {
        const info = cancellationInfo[orderId];
        if (!info) return <span className="text-gray-400">N/A</span>;
        
        const cancelledDate = new Date(info.cancelledAt);
        const hoursAgo = Math.floor((new Date().getTime() - cancelledDate.getTime()) / (1000 * 60 * 60));
        
        return (
          <div>
            <div className="font-medium">
              {cancelledDate.toLocaleDateString('vi-VN')}
            </div>
            <div className="text-xs text-gray-500">
              {hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo/24)}d ago`}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Refund Status',
      dataIndex: 'id',
      key: 'refundStatus',
      render: (orderId) => {
        const info = cancellationInfo[orderId];
        return info ? (
          <div>
            <Badge 
              color={getRefundStatusColor(info.refundStatus)}
              text={info.refundStatus.charAt(0).toUpperCase() + info.refundStatus.slice(1)}
            />
            {info.refundAmount > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {formatCurrency(info.refundAmount)}
              </div>
            )}
          </div>
        ) : (
          <Badge color="gray" text="Unknown" />
        );
      },
    },
    {
      title: 'Order Amount',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (amount) => (
        <div className="font-medium text-red-600">
          {formatCurrency(amount)}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => {
                setSelectedOrder(record);
                setOrderDetailVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchText.toLowerCase()) ||
                         order.userName.toLowerCase().includes(searchText.toLowerCase());
    
    const info = cancellationInfo[order.id];
    const matchesReason = reasonFilter === 'all' || (info && info.reason === reasonFilter);
    const matchesRefund = refundFilter === 'all' || (info && info.refundStatus === refundFilter);
    
    // Date range filtering
    let matchesDate = true;
    if (dateRange[0] && dateRange[1] && info) {
      const cancelledDate = new Date(info.cancelledAt);
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
      matchesDate = cancelledDate >= startDate && cancelledDate <= endDate;
    }
    
    return matchesSearch && matchesReason && matchesRefund && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cancelled Orders</h1>
        <p className="text-gray-600">Orders that have been cancelled and refund management</p>
      </div>

      {/* Alert for high cancellation rate */}
      {stats.totalCancelled > 5 && (
        <Alert
          message="High Cancellation Rate Alert"
          description="Consider reviewing your order fulfillment process to reduce cancellations."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          className="mb-4"
        />
      )}

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

      {/* Cancellation Analysis */}
      <Card title="Cancellation Analysis" className="mb-4">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={14}>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium">Customer Cancelled:</span>
                </div>
                <div className="flex items-center gap-3 min-w-[120px]">
                  <Progress 
                    percent={stats.totalCancelled > 0 ? (stats.customerCancelled / stats.totalCancelled) * 100 : 0} 
                    size="small" 
                    className="flex-1"
                    strokeColor="#1890ff"
                    showInfo={false}
                  />
                  <span className="text-sm font-bold text-blue-600 w-8 text-right">{stats.customerCancelled}</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="font-medium">Shop Cancelled:</span>
                </div>
                <div className="flex items-center gap-3 min-w-[120px]">
                  <Progress 
                    percent={stats.totalCancelled > 0 ? (stats.shopCancelled / stats.totalCancelled) * 100 : 0} 
                    size="small" 
                    className="flex-1"
                    strokeColor="#722ed1"
                    showInfo={false}
                  />
                  <span className="text-sm font-bold text-purple-600 w-8 text-right">{stats.shopCancelled}</span>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={10}>
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-red-50 border-4 border-red-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {stats.totalCancelled > 0 ? ((stats.totalCancelled / (stats.totalCancelled + 20)) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="font-medium text-gray-700">Cancellation Rate</div>
                <div className="text-xs text-gray-500 mt-1">
                  Based on last 100 orders
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <Card>

        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Search
              placeholder="Search cancelled orders..."
              allowClear
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              size="large"
            />
            <Select
              placeholder="Filter by reason"
              style={{ width: 200 }}
              value={reasonFilter}
              onChange={setReasonFilter}
              size="large"
            >
              <Option value="all">All Reasons</Option>
              {cancellationReasons.map(reason => (
                <Option key={reason} value={reason}>{reason}</Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by refund status"
              style={{ width: 150 }}
              value={refundFilter}
              onChange={setRefundFilter}
              size="large"
            >
              <Option value="all">All Refunds</Option>
              <Option value="pending">Pending</Option>
              <Option value="processing">Processing</Option>
              <Option value="completed">Completed</Option>
              <Option value="failed">Failed</Option>
            </Select>
            <RangePicker 
              placeholder={['Cancelled From', 'Cancelled To']} 
              onChange={(dates, dateStrings) => {
                setDateRange([dateStrings[0] || null, dateStrings[1] || null]);
              }}
              format="YYYY-MM-DD"
              allowClear
              size="large"
            />
          </div>
          
          <div className="flex gap-2">
            <Button icon={<FundOutlined />}>
              Process Refunds
            </Button>
            <Button icon={<BarChartOutlined />}>
              Analysis Report
            </Button>
            <Button icon={<ExportOutlined />}>
              Export Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card 
        title={`Cancelled Orders (${filteredOrders.length})`}
        extra={
          <Button 
            type="primary" 
            danger
            onClick={() => message.info('Bulk refund processing coming soon')}
          >
            Bulk Refund
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
              `${range[0]}-${range[1]} of ${total} cancelled orders`,
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
        title={`Cancelled Order - #${selectedOrder?.id.slice(-8)}`}
        open={orderDetailVisible}
        onCancel={() => setOrderDetailVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setOrderDetailVisible(false)}>
            Close
          </Button>
        ]}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Cancellation Alert */}
            <Alert
              message="This order has been cancelled"
              description={`Cancelled ${cancellationInfo[selectedOrder.id] ? 
                new Date(cancellationInfo[selectedOrder.id].cancelledAt).toLocaleString('vi-VN') : 'N/A'
              }`}
              type="error"
              showIcon
              icon={<StopOutlined />}
            />

            {/* Cancellation Information */}
            {cancellationInfo[selectedOrder.id] && (
              <Card title="Cancellation Details" size="small">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Reason">
                    {cancellationInfo[selectedOrder.id].reason}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cancelled By">
                    <Badge 
                      color={getCancelledByColor(cancellationInfo[selectedOrder.id].cancelledBy)}
                      text={cancellationInfo[selectedOrder.id].cancelledBy.charAt(0).toUpperCase() + 
                            cancellationInfo[selectedOrder.id].cancelledBy.slice(1)}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Cancellation Date">
                    {new Date(cancellationInfo[selectedOrder.id].cancelledAt).toLocaleString('vi-VN')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Refund Status">
                    <Badge 
                      color={getRefundStatusColor(cancellationInfo[selectedOrder.id].refundStatus)}
                      text={cancellationInfo[selectedOrder.id].refundStatus.charAt(0).toUpperCase() + 
                            cancellationInfo[selectedOrder.id].refundStatus.slice(1)}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Refund Amount">
                    <span className="font-medium text-orange-600">
                      {formatCurrency(cancellationInfo[selectedOrder.id].refundAmount)}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Refund Method">
                    {cancellationInfo[selectedOrder.id].refundMethod}
                  </Descriptions.Item>
                </Descriptions>
                
                {cancellationInfo[selectedOrder.id].notes && (
                  <div className="mt-4">
                    <div className="font-medium mb-2">Additional Notes:</div>
                    <div className="bg-gray-50 p-3 rounded text-gray-700">
                      {cancellationInfo[selectedOrder.id].notes}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Cancellation Timeline */}
            <Card title="Order Timeline" size="small">
              <Timeline
                items={[
                  {
                    color: 'green',
                    children: (
                      <div>
                        <div className="font-medium">Order Placed</div>
                        <div className="text-sm text-gray-500">
                          {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    ),
                  },
                  {
                    color: 'red',
                    children: (
                      <div>
                        <div className="font-medium">Order Cancelled</div>
                        <div className="text-sm text-gray-500">
                          {cancellationInfo[selectedOrder.id] ? 
                            new Date(cancellationInfo[selectedOrder.id].cancelledAt).toLocaleString('vi-VN') : 
                            'N/A'
                          }
                        </div>
                        <div className="text-sm text-red-600">
                          Reason: {cancellationInfo[selectedOrder.id]?.reason || 'N/A'}
                        </div>
                      </div>
                    ),
                  },
                  ...(cancellationInfo[selectedOrder.id]?.refundAmount > 0 ? [{
                    color: cancellationInfo[selectedOrder.id].refundStatus === 'completed' ? 'green' : 'blue',
                    children: (
                      <div>
                        <div className="font-medium">Refund {cancellationInfo[selectedOrder.id].refundStatus}</div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(cancellationInfo[selectedOrder.id].refundAmount)}
                        </div>
                      </div>
                    ),
                  }] : [])
                ]}
              />
            </Card>

            <Divider />

            {/* Cancelled Items */}
            <div>
              <h4 className="text-lg font-medium mb-3">Cancelled Items</h4>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg opacity-75">
                    <img
                      src={getCloudinaryUrl(item.productImage)}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded grayscale"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="flex-1">
                      <h5 className="font-medium line-through text-gray-500">{item.productName}</h5>
                      <p className="text-sm text-gray-400">SKU: {item.variant?.sku || 'N/A'}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">Quantity: {item.quantity}</span>
                        <span className="font-medium text-gray-500 line-through">{formatCurrency(item.subtotal)}</span>
                      </div>
                    </div>
                    <div className="text-red-500">
                      <StopOutlined className="text-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Refund Summary */}
            <Card title="Financial Summary" size="small">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-500">
                  <span>Original Order Total:</span>
                  <span className="line-through">{formatCurrency(selectedOrder.finalAmount)}</span>
                </div>
                {cancellationInfo[selectedOrder.id]?.refundAmount > 0 && (
                  <>
                    <div className="flex justify-between text-orange-600">
                      <span>Refund Amount:</span>
                      <span>{formatCurrency(cancellationInfo[selectedOrder.id].refundAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Refund Method:</span>
                      <span>{cancellationInfo[selectedOrder.id].refundMethod}</span>
                    </div>
                  </>
                )}
                <Divider style={{ margin: '8px 0' }} />
                <div className="flex justify-between font-bold text-lg text-red-600">
                  <span>Net Loss:</span>
                  <span>{formatCurrency(selectedOrder.finalAmount)}</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}