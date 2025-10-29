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
  Rate,
  Divider,
  Descriptions,
  Avatar,
  Tooltip,
  Progress,
  Alert
} from "antd";
import { 
  SearchOutlined, 
  ExportOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  StarOutlined,
  GiftOutlined,
  TrophyOutlined,
  HeartOutlined,
  UserOutlined
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import { orderApiService, OrderStatus, PaymentMethod, type OrderResponseDto } from "@/services/OrderApiService";
import { shopService, type Shop } from "@/services/ShopService";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { getCloudinaryUrl } from "@/config/config";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface Review {
  id: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

interface DeliveryInfo {
  deliveredAt: string;
  deliveryMethod: string;
  receivedBy: string;
  signature?: string;
  photos?: string[];
  review?: Review;
}

export default function DeliveredOrdersPage() {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const [searchText, setSearchText] = useState('');
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<{ [key: string]: DeliveryInfo }>({});
  const [orderDetailVisible, setOrderDetailVisible] = useState(false);
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
      loadDeliveredOrders();
    }
  }, [currentShopId]);

  // Load orders when pagination changes
  useEffect(() => {
    if (currentShopId && pagination.current > 1) {
      loadDeliveredOrders();
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
        message.success(`Loaded shop: ${shop.name}`);
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

  const loadDeliveredOrders = async () => {
    if (!currentShopId) {
      return;
    }
    setLoading(true);
    try {
      // Get DELIVERED status orders
      const response = await orderApiService.getOrdersByShopWithFilters(
        currentShopId,
        OrderStatus.DELIVERED,
        pagination.current - 1, // API uses 0-based indexing
        pagination.pageSize
      );
        
      const deliveredOrders = response.content || [];
      setOrders(deliveredOrders);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements || 0
      }));

      // Generate mock delivery info for each order (since we don't have real delivery tracking yet)
      const mockDeliveryInfo: { [key: string]: DeliveryInfo } = {};
      deliveredOrders.forEach((order, index) => {
        const deliveredAt = new Date(order.createdAt);
        mockDeliveryInfo[order.id] = {
          deliveredAt: deliveredAt.toISOString(),
          deliveryMethod: ['Standard Delivery', 'Express Delivery', 'Same-day Delivery'][index % 3],
          receivedBy: order.shippingAddress?.fullName || order.userName,
          review: Math.random() > 0.3 ? { // 70% chance of having a review
            id: `review_${order.id}`,
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            comment: [
              'Excellent product quality! Fast shipping and great packaging. Highly recommended!',
              'Good product overall. Delivery was quick but packaging could be better.',
              'Amazing service! The product exactly matched the description. Will order again!',
              'Fast delivery and good quality. Very satisfied with this purchase.',
              'Great seller! Product was well-packaged and arrived on time.'
            ][index % 5],
            createdAt: new Date(deliveredAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString()
          } : undefined
        };
      });
      setDeliveryInfo(mockDeliveryInfo);
      
      // Show appropriate message based on results
      if (deliveredOrders.length > 0) {
        message.success(`Loaded ${deliveredOrders.length} delivered orders`);
      } else {
        message.info('No delivered orders found for your shop');
      }
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load delivered orders from server';
      message.error(errorMessage);
      
      // Clear orders on failure
      setOrders([]);
      setDeliveryInfo({});
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

  const getDaysSinceDelivery = (deliveredAt: string): number => {
    return Math.floor((new Date().getTime() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24));
  };

  const getAverageRating = (): number => {
    const reviews = Object.values(deliveryInfo).map(info => info.review).filter(Boolean) as Review[];
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  };

  const getTotalReviews = (): number => {
    return Object.values(deliveryInfo).filter(info => info.review).length;
  };

  const handleReturnRequest = async (orderId: string) => {
    try {
      // For now, just show a message since return request API might not be implemented yet
      message.info('Return request feature will be available soon. Customer can contact support for returns.');
      
      // Future implementation:
      // await orderApiService.updateOrderStatus({
      //   orderId,
      //   status: OrderStatus.RETURN_REQUESTED
      // });
      
      // Remove from delivered list and update state
      // setOrders(prev => prev.filter(order => order.id !== orderId));
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to process return request';
      message.error(errorMessage);
    }
  };

  const orderStats = [
    {
      title: 'Delivered Orders',
      value: orders.length,
      color: '#52c41a',
      icon: <CheckCircleOutlined style={{ fontSize: '24px' }} />
    },
    {
      title: 'Customer Reviews',
      value: getTotalReviews(),
      color: '#fa8c16',
      icon: <StarOutlined style={{ fontSize: '24px' }} />
    },
    {
      title: 'Average Rating',
      value: getAverageRating().toFixed(1),
      color: '#1890ff',
      icon: <TrophyOutlined style={{ fontSize: '24px' }} />
    },
    {
      title: 'Satisfaction Rate',
      value: '95%',
      color: '#722ed1',
      icon: <HeartOutlined style={{ fontSize: '24px' }} />
    }
  ];

  const columns: ColumnsType<OrderResponseDto> = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text) => <span className="font-mono font-medium text-green-600">#{text.slice(-8)}</span>,
    },
    {
      title: 'Customer',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <div className="flex items-center">
          {/* <Avatar size="small" icon={<UserOutlined />} className="mr-2" /> */}
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">{record.shippingAddress?.phone}</div>
          </div>
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
      title: 'Delivered Date',
      dataIndex: 'id',
      key: 'deliveredDate',
      render: (orderId) => {
        const delivery = deliveryInfo[orderId];
        if (!delivery) return <span className="text-gray-400">N/A</span>;
        
        const daysSince = getDaysSinceDelivery(delivery.deliveredAt);
        return (
          <div>
            <div className="font-medium">
              {new Date(delivery.deliveredAt).toLocaleDateString('vi-VN')}
            </div>
            <div className="text-xs text-gray-500">
              {daysSince === 0 ? 'Today' : 
               daysSince === 1 ? 'Yesterday' : 
               `${daysSince} days ago`}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Review',
      dataIndex: 'id',
      key: 'review',
      render: (orderId) => {
        const delivery = deliveryInfo[orderId];
        const review = delivery?.review;
        
        return review ? (
          <div className="flex items-center">
            <Rate disabled defaultValue={review.rating} style={{ fontSize: '14px' }} />
            <span className="ml-2 text-sm text-gray-600">({review.rating})</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">No review</span>
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
      render: (_, record) => {
        const delivery = deliveryInfo[record.id];
        const daysSince = delivery ? getDaysSinceDelivery(delivery.deliveredAt) : 0;
        const canReturn = daysSince <= 7; // Allow returns within 7 days
        
        return (
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
            {canReturn && (
              <Tooltip title="Process Return Request">
                <Button 
                  type="link" 
                  size="small"
                  danger
                  onClick={() => handleReturnRequest(record.id)}
                >
                  Return
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  const filteredOrders = orders.filter(order => {
    const searchTerm = searchText.toLowerCase();
    return order.id.toLowerCase().includes(searchTerm) ||
           order.userName.toLowerCase().includes(searchTerm) ||
           (order.items && order.items.some(item => 
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
        <h1 className="text-2xl font-bold text-gray-900">Delivered Orders</h1>
        <p className="text-gray-600">Successfully completed orders and customer feedback</p>
      </div>

      {/* Success Alert */}
      <Alert
        message="Great Job! 🎉"
        description="Your delivery rate is excellent. Keep up the good work!"
        type="success"
        showIcon
        className="mb-4"
      />

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

      {/* Customer Satisfaction Overview */}
      <Card title="Customer Satisfaction" className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">
                {getAverageRating().toFixed(1)}
              </div>
              <Rate disabled defaultValue={getAverageRating()} allowHalf />
              <div className="text-gray-500 mt-2">Based on {getTotalReviews()} reviews</div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const reviews = Object.values(deliveryInfo)
                  .map(info => info.review)
                  .filter(Boolean) as Review[];
                const starCount = reviews.filter(r => r.rating === star).length;
                const percentage = reviews.length > 0 ? (starCount / reviews.length) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center">
                    <span className="w-8 text-sm">{star}⭐</span>
                    <Progress 
                      percent={percentage} 
                      size="small" 
                      className="flex-1 mx-3"
                      strokeColor="#fadb14"
                    />
                    <span className="w-8 text-sm text-gray-500">{starCount}</span>
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Search
              placeholder="Search delivered orders..."
              allowClear
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
            <RangePicker placeholder={['Delivered From', 'Delivered To']} />
          </div>
          
          <div className="flex gap-2">
            <Button icon={<GiftOutlined />}>
              Send Thank You
            </Button>
            <Button icon={<ExportOutlined />}>
              Export Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card 
        title={`Delivered Orders (${filteredOrders.length})`}
        extra={
          <Button 
            type="primary" 
            icon={<StarOutlined />}
            onClick={() => message.info('Review management coming soon')}
          >
            Manage Reviews
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
              `${range[0]}-${range[1]} of ${total} delivered orders`,
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
        title={`Delivered Order - #${selectedOrder?.id.slice(-8)}`}
        open={orderDetailVisible}
        onCancel={() => setOrderDetailVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setOrderDetailVisible(false)}>
            Close
          </Button>,
          ...(selectedOrder && deliveryInfo[selectedOrder.id] && 
              getDaysSinceDelivery(deliveryInfo[selectedOrder.id].deliveredAt) <= 7 ? [
            <Button 
              key="return" 
              type="default"
              danger
              onClick={() => {
                if (selectedOrder) {
                  handleReturnRequest(selectedOrder.id);
                  setOrderDetailVisible(false);
                }
              }}
            >
              Process Return Request
            </Button>
          ] : [])
        ]}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Delivery Success Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleOutlined className="text-green-500 text-2xl mr-3" />
                <div>
                  <div className="font-medium text-green-800">Order Successfully Delivered!</div>
                  <div className="text-sm text-green-600">
                    Delivered on {deliveryInfo[selectedOrder.id] ? 
                      new Date(deliveryInfo[selectedOrder.id].deliveredAt).toLocaleDateString('vi-VN') : 
                      'N/A'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            {deliveryInfo[selectedOrder.id] && (
              <Card title="Delivery Details" size="small">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Delivered At">
                    {new Date(deliveryInfo[selectedOrder.id].deliveredAt).toLocaleString('vi-VN')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Delivery Method">
                    {deliveryInfo[selectedOrder.id].deliveryMethod}
                  </Descriptions.Item>
                  <Descriptions.Item label="Received By">
                    {deliveryInfo[selectedOrder.id].receivedBy}
                  </Descriptions.Item>
                  <Descriptions.Item label="Days Since Delivery">
                    {getDaysSinceDelivery(deliveryInfo[selectedOrder.id].deliveredAt)} days ago
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Customer Review */}
            {deliveryInfo[selectedOrder.id]?.review && (
              <Card title="Customer Review" size="small">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Rate 
                      disabled 
                      defaultValue={deliveryInfo[selectedOrder.id].review!.rating} 
                      className="mr-3"
                    />
                    <span className="font-medium">
                      {deliveryInfo[selectedOrder.id].review!.rating}/5 stars
                    </span>
                    <span className="text-gray-500 ml-2 text-sm">
                      {new Date(deliveryInfo[selectedOrder.id].review!.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-700">
                      "{deliveryInfo[selectedOrder.id].review!.comment}"
                    </div>
                  </div>
                  
                  {deliveryInfo[selectedOrder.id].review!.images && (
                    <div>
                      <div className="font-medium mb-2">Review Images:</div>
                      <div className="flex gap-2">
                        {deliveryInfo[selectedOrder.id].review!.images!.map((img, index) => (
                          <img 
                            key={index}
                            src={img} 
                            alt={`Review ${index + 1}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            <Divider />

            {/* Delivery Address */}
            <div>
              <h4 className="text-lg font-medium mb-3">Delivery Address</h4>
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

            {/* Delivered Items */}
            <div>
              <h4 className="text-lg font-medium mb-3">Delivered Items</h4>
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
                    <div className="text-green-500">
                      <CheckCircleOutlined className="text-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <Card title="Order Summary" size="small">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span>{formatCurrency(selectedOrder.shippingFee || 0)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <Divider style={{ margin: '8px 0' }} />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Paid:</span>
                  <span className="text-green-600">{formatCurrency(selectedOrder.finalAmount)}</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}