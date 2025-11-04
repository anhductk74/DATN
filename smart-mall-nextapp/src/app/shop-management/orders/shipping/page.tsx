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
  QRCode,
  Tooltip
} from "antd";
import { 
  SearchOutlined, 
  ExportOutlined, 
  EyeOutlined,
  TruckOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  PhoneOutlined
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import { orderApiService, OrderStatus, PaymentMethod, type OrderResponseDto } from "@/services/OrderApiService";
import { shopService, type Shop } from "@/services/ShopService";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { getCloudinaryUrl } from "@/config/config";

const { Search } = Input;
const { RangePicker } = DatePicker;

interface ShippingInfo {
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  currentLocation: string;
  status: 'in_transit' | 'out_for_delivery' | 'delayed';
}

export default function ShippingOrdersPage() {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const [searchText, setSearchText] = useState('');
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null);
  const [shippingInfo, setShippingInfo] = useState<{ [key: string]: ShippingInfo }>({});
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
      loadShippingOrders();
    }
  }, [currentShopId]);

  // Load orders when pagination changes
  useEffect(() => {
    if (currentShopId && pagination.current > 1) {
      loadShippingOrders();
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

  const loadShippingOrders = async () => {
    if (!currentShopId) {
      return;
    }
    setLoading(true);
    try {
      // Get SHIPPING status orders
      const response = await orderApiService.getOrdersByShopWithFilters(
        currentShopId,
        OrderStatus.SHIPPING,
        pagination.current - 1, // API uses 0-based indexing
        pagination.pageSize
      );
        
      const shippingOrders = response.content || [];
      setOrders(shippingOrders);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements || 0
      }));

      // Generate mock shipping info for each order
      const mockShippingInfo: { [key: string]: ShippingInfo } = {};
      shippingOrders.forEach((order, index) => {
        mockShippingInfo[order.id] = {
          trackingNumber: `VN${Date.now().toString().slice(-9)}${index.toString().padStart(2, '0')}`,
          carrier: ['Giao Hàng Nhanh', 'Vietnam Post', 'Viettel Post'][index % 3],
          estimatedDelivery: new Date(Date.now() + (1 + Math.floor(Math.random() * 3)) * 24 * 60 * 60 * 1000).toISOString(),
          currentLocation: [
            'Distribution Center - District 1',
            'Out for Delivery - Phu Nhuan',
            'Sorting Facility - Tan Binh',
            'Local Hub - District 7'
          ][index % 4],
          status: ['in_transit', 'out_for_delivery', 'in_transit'][index % 3] as 'in_transit' | 'out_for_delivery' | 'delayed'
        };
      });
      setShippingInfo(mockShippingInfo);
      
      // Orders loaded successfully - no need to show message for normal operation
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load shipping orders from server';
      message.error(errorMessage);
      
      // Clear orders on failure
      setOrders([]);
      setShippingInfo({});
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

  const handleMarkAsDelivered = async (orderId: string) => {
    setProcessing(orderId);
    try {
      // Call API to update order status to DELIVERED
      await orderApiService.updateOrderStatus({
        orderId,
        status: OrderStatus.DELIVERED
      });

      // Remove order from shipping list
      setOrders(prev => prev.filter(order => order.id !== orderId));
      setPagination(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));

      // Remove shipping info
      setShippingInfo(prev => {
        const newInfo = { ...prev };
        delete newInfo[orderId];
        return newInfo;
      });

      message.success('Order marked as delivered successfully');
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update order status';
      message.error(errorMessage);
    } finally {
      setProcessing(null);
    }
  };

  const getShippingStatusColor = (status: string) => {
    const colors = {
      'in_transit': 'blue',
      'out_for_delivery': 'orange',
      'delayed': 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getShippingStatusText = (status: string) => {
    const texts = {
      'in_transit': 'In Transit',
      'out_for_delivery': 'Out for Delivery',
      'delayed': 'Delayed'
    };
    return texts[status as keyof typeof texts] || 'Unknown';
  };

  const copyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    message.success('Tracking number copied to clipboard');
  };

  const orderStats = [
    {
      title: 'Shipping Orders',
      value: orders.length,
      color: '#1890ff',
      icon: <TruckOutlined style={{ fontSize: '24px' }} />
    },
    {
      title: 'In Transit',
      value: Object.values(shippingInfo).filter(info => info.status === 'in_transit').length,
      color: '#52c41a',
      icon: <EnvironmentOutlined style={{ fontSize: '24px' }} />
    },
    {
      title: 'Out for Delivery',
      value: Object.values(shippingInfo).filter(info => info.status === 'out_for_delivery').length,
      color: '#fa8c16',
      icon: <TruckOutlined style={{ fontSize: '24px' }} />
    },
    {
      title: 'Avg Delivery Time',
      value: '2.1 days',
      color: '#722ed1',
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
          <div className="text-xs text-gray-500 flex items-center">
            <PhoneOutlined className="mr-1" />
            {record.shippingAddress?.phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Tracking Info',
      dataIndex: 'id',
      key: 'tracking',
      render: (orderId) => {
        const tracking = shippingInfo[orderId];
        return tracking ? (
          <div>
            <div className="flex items-center">
              <span className="font-mono text-sm">{tracking.trackingNumber}</span>
              <Button 
                type="text" 
                size="small" 
                icon={<CopyOutlined />}
                onClick={() => copyTrackingNumber(tracking.trackingNumber)}
              />
            </div>
            <div className="text-xs text-gray-500">{tracking.carrier}</div>
          </div>
        ) : (
          <span className="text-gray-400">No tracking</span>
        );
      },
    },
    {
      title: 'Shipping Status',
      dataIndex: 'id',
      key: 'shippingStatus',
      render: (orderId) => {
        const tracking = shippingInfo[orderId];
        return tracking ? (
          <div>
            <Badge 
              color={getShippingStatusColor(tracking.status)}
              text={getShippingStatusText(tracking.status)}
            />
            <div className="text-xs text-gray-500 mt-1">
              {tracking.currentLocation}
            </div>
          </div>
        ) : (
          <Badge color="gray" text="Unknown" />
        );
      },
    },
    {
      title: 'Delivery Estimate',
      dataIndex: 'id',
      key: 'delivery',
      render: (orderId) => {
        const tracking = shippingInfo[orderId];
        if (!tracking) return <span className="text-gray-400">N/A</span>;
        
        const deliveryDate = new Date(tracking.estimatedDelivery);
        const today = new Date();
        const diffDays = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <div>
            <div className="font-medium">
              {deliveryDate.toLocaleDateString('vi-VN')}
            </div>
            <div className={`text-xs ${diffDays <= 1 ? 'text-orange-500' : 'text-gray-500'}`}>
              {diffDays === 0 ? 'Today' : 
               diffDays === 1 ? 'Tomorrow' : 
               `${diffDays} days`}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Amount',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (amount) => (
        <div className="font-medium text-green-600">
          {formatCurrency(amount)}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
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
          <Button 
            type="primary"
            size="small"
            loading={processing === record.id}
            onClick={() => handleMarkAsDelivered(record.id)}
          >
            Mark Delivered
          </Button>
        </Space>
      ),
    },
  ];

  const filteredOrders = orders.filter(order => {
    const searchTerm = searchText.toLowerCase();
    return order.id.toLowerCase().includes(searchTerm) ||
           order.userName.toLowerCase().includes(searchTerm) ||
           (shippingInfo[order.id]?.trackingNumber?.toLowerCase().includes(searchTerm)) ||
           (order.items?.some(item => 
             item.productName.toLowerCase().includes(searchTerm)
           ));
  });

  if (loadingShop) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-lg">Loading shop data...</div>
          <div className="text-gray-500">Please wait while we load your shop information</div>
        </div>
      </div>
    );
  }

  if (!currentShop) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-lg text-red-600">No Shop Found</div>
          <div className="text-gray-500">You need to create a shop first to manage orders</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shipping Orders</h1>
        <p className="text-gray-600">Orders currently in transit to customers</p>
      </div>

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
              placeholder="Search by order, customer, or tracking number..."
              allowClear
              style={{ width: 350 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
            <RangePicker placeholder={['Shipping From', 'Shipping To']} />
          </div>
          
          <div className="flex gap-2">
            <Button icon={<ExportOutlined />}>
              Export Shipping Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card 
        title={`Shipping Orders (${filteredOrders.length})`}
        extra={
          <Button 
            type="primary" 
            onClick={() => message.info('Bulk tracking updates coming soon')}
          >
            Update Tracking
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
              `${range[0]}-${range[1]} of ${total} shipping orders`,
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
        title={`Shipping Order - #${selectedOrder?.id.slice(-8)}`}
        open={orderDetailVisible}
        onCancel={() => setOrderDetailVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setOrderDetailVisible(false)}>
            Close
          </Button>,
          <Button 
            key="delivered" 
            type="primary"
            loading={processing === selectedOrder?.id}
            onClick={() => {
              if (selectedOrder) {
                handleMarkAsDelivered(selectedOrder.id);
                setOrderDetailVisible(false);
              }
            }}
          >
            Mark as Delivered
          </Button>
        ]}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Tracking Information */}
            {shippingInfo[selectedOrder.id] && (
              <Card title="Tracking Information" size="small">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className="text-center">
                      <QRCode 
                        value={shippingInfo[selectedOrder.id].trackingNumber} 
                        size={120}
                      />
                      <div className="mt-2 font-mono text-sm">
                        {shippingInfo[selectedOrder.id].trackingNumber}
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Carrier">
                        {shippingInfo[selectedOrder.id].carrier}
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                        <Badge 
                          color={getShippingStatusColor(shippingInfo[selectedOrder.id].status)}
                          text={getShippingStatusText(shippingInfo[selectedOrder.id].status)}
                        />
                      </Descriptions.Item>
                      <Descriptions.Item label="Current Location">
                        {shippingInfo[selectedOrder.id].currentLocation}
                      </Descriptions.Item>
                      <Descriptions.Item label="Estimated Delivery">
                        {new Date(shippingInfo[selectedOrder.id].estimatedDelivery).toLocaleDateString('vi-VN')}
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Delivery Timeline */}
            <Card title="Delivery Timeline" size="small">
              <Timeline
                items={[
                  {
                    color: 'green',
                    children: (
                      <div>
                        <div className="font-medium">Package Shipped</div>
                        <div className="text-sm text-gray-500">
                          {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    ),
                  },
                  {
                    color: shippingInfo[selectedOrder.id]?.status === 'in_transit' ? 'blue' : 'green',
                    children: (
                      <div>
                        <div className="font-medium">In Transit</div>
                        <div className="text-sm text-gray-500">
                          {shippingInfo[selectedOrder.id]?.currentLocation || 'Processing...'}
                        </div>
                      </div>
                    ),
                  },
                  {
                    color: shippingInfo[selectedOrder.id]?.status === 'out_for_delivery' ? 'orange' : 'gray',
                    children: (
                      <div>
                        <div className="font-medium">Out for Delivery</div>
                        <div className="text-sm text-gray-500">
                          {shippingInfo[selectedOrder.id]?.status === 'out_for_delivery' ? 'In progress...' : 'Pending'}
                        </div>
                      </div>
                    ),
                  },
                  {
                    color: 'gray',
                    children: (
                      <div>
                        <div className="font-medium">Delivered</div>
                        <div className="text-sm text-gray-500">
                          Est. {shippingInfo[selectedOrder.id] ? 
                            new Date(shippingInfo[selectedOrder.id].estimatedDelivery).toLocaleDateString('vi-VN') : 
                            'N/A'
                          }
                        </div>
                      </div>
                    ),
                  }
                ]}
              />
            </Card>

            <Divider />

            {/* Shipping Address */}
            <div>
              <h4 className="text-lg font-medium mb-3">Shipping Address</h4>
              {selectedOrder.shippingAddress && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium">{selectedOrder.shippingAddress.fullName}</div>
                  <div className="text-gray-600">{selectedOrder.shippingAddress.phone}</div>
                  <div className="text-gray-600 mt-1">
                    {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.ward}, {' '}
                    {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.province}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div>
              <h4 className="text-lg font-medium mb-3">Shipping Items</h4>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <img
                      src={getCloudinaryUrl(item.productImage)}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="flex-1">
                      <h5 className="font-medium">{item.productName}</h5>
                      <p className="text-sm text-gray-500">SKU: {item.variant?.sku || 'N/A'}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">Quantity: {item.quantity}</span>
                        <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}