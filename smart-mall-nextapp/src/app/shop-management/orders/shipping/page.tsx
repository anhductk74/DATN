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
  Steps,
  Tooltip,
  Image
} from "antd";
import { 
  SearchOutlined, 
  ExportOutlined, 
  EyeOutlined,
  TruckOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  PhoneOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import { orderApiService, OrderStatus, PaymentMethod, type OrderResponseDto } from "@/services/OrderApiService";
import { shopService, type Shop } from "@/services/ShopService";
import { ShipmentOrderService, ShipmentStatus, type ShipmentOrderResponseDto } from "@/services/ShipmentOrderService";
import { subShipmentOrderService, type SubShipmentOrderResponseDto } from "@/services/SubShipmentOrderService";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { getCloudinaryUrl } from "@/config/config";
import { useAntdApp } from "@/hooks/useAntdApp";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Step } = Steps;

export default function ShippingOrdersPage() {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const { message } = useAntdApp();
  const [searchText, setSearchText] = useState('');
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null);
  const [shipmentOrders, setShipmentOrders] = useState<Map<string, ShipmentOrderResponseDto>>(new Map());
  const [subShipments, setSubShipments] = useState<Map<string, SubShipmentOrderResponseDto[]>>(new Map());
  const [orderDetailVisible, setOrderDetailVisible] = useState(false);
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
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

      // Load shipment info for each order
      await loadShipmentInfo(shippingOrders);
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load shipping orders from server';
      message.error(errorMessage);
      
      // Clear orders on failure
      setOrders([]);
      setShipmentOrders(new Map());
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const loadShipmentInfo = async (orders: OrderResponseDto[]) => {
    const shipmentMap = new Map<string, ShipmentOrderResponseDto>();
    
    for (const order of orders) {
      try {
        const shipment = await ShipmentOrderService.getByOrderId(order.id);
        if (shipment) {
          shipmentMap.set(order.id, shipment);
        }
      } catch (error) {
        // Không có shipment cho order này, bỏ qua
      }
    }
    
    setShipmentOrders(shipmentMap);
  };

  const loadSubShipmentsForOrder = async (shipmentId: string) => {
    try {
      const subShipmentList = await subShipmentOrderService.getByShipmentOrder(shipmentId);
      setSubShipments(prev => new Map(prev).set(shipmentId, subShipmentList));
    } catch (error) {
      console.error('Failed to load sub-shipments:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getShipmentStatusColor = (status: ShipmentStatus) => {
    const colors = {
      [ShipmentStatus.PENDING]: 'default',
      [ShipmentStatus.REGISTERED]: 'blue',
      [ShipmentStatus.PICKING_UP]: 'cyan',
      [ShipmentStatus.IN_TRANSIT]: 'orange',
      [ShipmentStatus.DELIVERED]: 'green',
      [ShipmentStatus.RETURNING]: 'red',
      [ShipmentStatus.RETURNED]: 'volcano',
      [ShipmentStatus.CANCELLED]: 'red'
    };
    return colors[status] || 'default';
  };

  const copyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    message.success('Tracking number copied to clipboard');
  };

  const handleViewDetails = async (order: OrderResponseDto) => {
    setSelectedOrder(order);
    setOrderDetailVisible(true);
    
    // Load sub-shipments if shipment exists
    const shipment = shipmentOrders.get(order.id);
    if (shipment && shipment.id) {
      setLoadingDetail(true);
      await loadSubShipmentsForOrder(shipment.id);
      setLoadingDetail(false);
    }
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
      value: Array.from(shipmentOrders.values()).filter(s => s.status === ShipmentStatus.IN_TRANSIT).length,
      color: '#fa8c16',
      icon: <EnvironmentOutlined style={{ fontSize: '24px' }} />
    },
    {
      title: 'Picking Up',
      value: Array.from(shipmentOrders.values()).filter(s => s.status === ShipmentStatus.PICKING_UP).length,
      color: '#52c41a',
      icon: <TruckOutlined style={{ fontSize: '24px' }} />
    },
    {
      title: 'Total Shipments',
      value: shipmentOrders.size,
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
        const shipment = shipmentOrders.get(orderId);
        return shipment ? (
          <div>
            <div className="flex items-center">
              <span className="font-mono text-sm">{shipment.trackingCode}</span>
              <Button 
                type="text" 
                size="small" 
                icon={<CopyOutlined />}
                onClick={() => copyTrackingNumber(shipment.trackingCode)}
              />
            </div>
            <div className="text-xs text-gray-500">{shipment.shipperName}</div>
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
        const shipment = shipmentOrders.get(orderId);
        return shipment ? (
          <div>
            <Badge 
              color={getShipmentStatusColor(shipment.status)}
              text={shipment.status}
            />
            <div className="text-xs text-gray-500 mt-1">
              {shipment.warehouseName}
            </div>
          </div>
        ) : (
          <Badge color="gray" text="No shipment" />
        );
      },
    },
    {
      title: 'Delivery Estimate',
      dataIndex: 'id',
      key: 'delivery',
      render: (orderId) => {
        const shipment = shipmentOrders.get(orderId);
        if (!shipment || !shipment.estimatedDelivery) return <span className="text-gray-400">N/A</span>;
        
        const deliveryDate = new Date(shipment.estimatedDelivery);
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
      width: 100,
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewDetails(record)}
          />
        </Tooltip>
      ),
    },
  ];

  const filteredOrders = orders.filter(order => {
    const searchTerm = searchText.toLowerCase();
    const shipment = shipmentOrders.get(order.id);
    return order.id.toLowerCase().includes(searchTerm) ||
           order.userName.toLowerCase().includes(searchTerm) ||
           shipment?.trackingCode?.toLowerCase().includes(searchTerm) ||
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
        width={1000}
        footer={[
          <Button key="close" onClick={() => setOrderDetailVisible(false)}>
            Close
          </Button>
        ]}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Shipment Information */}
            {(() => {
              const shipment = shipmentOrders.get(selectedOrder.id);
              if (shipment) {
                return (
                  <Card title="Shipment Information" size="small">
                    <Descriptions column={2} bordered size="small">
                      <Descriptions.Item label="Tracking Code" span={2}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600">{shipment.trackingCode}</span>
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<CopyOutlined />}
                            onClick={() => copyTrackingNumber(shipment.trackingCode)}
                          />
                        </div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Shipper" span={1}>
                        {shipment.shipperName}
                      </Descriptions.Item>
                      <Descriptions.Item label="Warehouse" span={1}>
                        {shipment.warehouseName}
                      </Descriptions.Item>
                      <Descriptions.Item label="Status" span={1}>
                        <Badge 
                          color={getShipmentStatusColor(shipment.status)}
                          text={shipment.status}
                        />
                      </Descriptions.Item>
                      <Descriptions.Item label="Estimated Delivery" span={1}>
                        {shipment.estimatedDelivery ? 
                          new Date(shipment.estimatedDelivery).toLocaleString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'
                        }
                      </Descriptions.Item>
                      <Descriptions.Item label="COD Amount" span={1}>
                        <span className="font-medium text-green-600">
                          {formatCurrency(shipment.codAmount)}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Shipping Fee" span={1}>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(shipment.shippingFee)}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Weight" span={2}>
                        {shipment.weight} kg
                      </Descriptions.Item>
                      <Descriptions.Item label="Pickup Address" span={2}>
                        {shipment.pickupAddress}
                      </Descriptions.Item>
                      <Descriptions.Item label="Delivery Address" span={2}>
                        {shipment.deliveryAddress}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                );
              }
              return (
                <Card title="Shipment Information" size="small">
                  <div className="text-center text-gray-500 py-4">
                    No shipment information available
                  </div>
                </Card>
              );
            })()}

            {/* Sub-Shipment Route Timeline */}
            {(() => {
              const shipment = shipmentOrders.get(selectedOrder.id);
              const subShipmentList = shipment ? subShipments.get(shipment.id) : null;
              
              if (subShipmentList && subShipmentList.length > 0) {
                // Sort by sequence
                const sortedSubShipments = [...subShipmentList].sort((a, b) => a.sequence - b.sequence);
                
                return (
                  <Card title="Shipment Route (Các Chặng Vận Chuyển)" size="small" loading={loadingDetail}>
                    <Steps
                      direction="vertical"
                      current={sortedSubShipments.findIndex(s => 
                        [ShipmentStatus.IN_TRANSIT, ShipmentStatus.PICKING_UP].includes(s.status)
                      )}
                      items={sortedSubShipments.map((sub) => ({
                        title: (
                          <div>
                            <span className="font-medium">Chặng {sub.sequence}: </span>
                            <span>{sub.fromWarehouseName} → {sub.toWarehouseName}</span>
                          </div>
                        ),
                        description: (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Tag color={getShipmentStatusColor(sub.status)}>
                                {sub.status}
                              </Tag>
                              <span className="text-gray-500 text-sm">Shipper: {sub.shipperName}</span>
                            </div>
                            {sub.startTime && (
                              <div className="text-xs text-gray-500">
                                Bắt đầu: {new Date(sub.startTime).toLocaleString('vi-VN')}
                              </div>
                            )}
                            {sub.endTime && (
                              <div className="text-xs text-gray-500">
                                Kết thúc: {new Date(sub.endTime).toLocaleString('vi-VN')}
                              </div>
                            )}
                          </div>
                        ),
                        status: sub.status === ShipmentStatus.DELIVERED ? 'finish' :
                                sub.status === ShipmentStatus.IN_TRANSIT ? 'process' :
                                sub.status === ShipmentStatus.CANCELLED ? 'error' : 'wait',
                        icon: sub.status === ShipmentStatus.DELIVERED ? <CheckCircleOutlined /> :
                              sub.status === ShipmentStatus.IN_TRANSIT ? <TruckOutlined /> :
                              <EnvironmentOutlined />
                      }))}
                    />
                  </Card>
                );
              }
              
              return null;
            })()}

            <Divider />

            {/* Order Information */}
            <Descriptions bordered column={2} size="small" title="Order Information">
              <Descriptions.Item label="Order ID" span={1}>
                <span className="font-mono">{selectedOrder.id}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Customer" span={1}>
                {selectedOrder.userName}
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={1}>
                <Tag color="blue">Shipping</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method" span={1}>
                <Tag color={selectedOrder.paymentMethod === PaymentMethod.COD ? 'orange' : 
                           selectedOrder.paymentMethod === PaymentMethod.CREDIT_CARD ? 'blue' : 'green'}>
                  {selectedOrder.paymentMethod === PaymentMethod.COD ? 'Cash on Delivery' :
                   selectedOrder.paymentMethod === PaymentMethod.CREDIT_CARD ? 'Credit Card' : 'E-Wallet'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Order Date" span={1}>
                {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Shop" span={1}>
                {selectedOrder.shopName}
              </Descriptions.Item>
            </Descriptions>

            {/* Shipping Address */}
            <div>
              <h4 className="text-lg font-medium mb-3">Shipping Address</h4>
              {selectedOrder.shippingAddress && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="font-medium text-lg">{selectedOrder.shippingAddress.fullName}</div>
                  <div className="text-gray-600 flex items-center gap-2 mt-1">
                    <PhoneOutlined />
                    {selectedOrder.shippingAddress.phone}
                  </div>
                  <div className="text-gray-600 mt-2">
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
                  <div key={index} className="flex items-start space-x-4 p-3 border rounded-lg">
                    <Image
                      width={64}
                      height={64}
                      src={getCloudinaryUrl(item.productImage)}
                      alt={item.productName}
                      className="rounded"
                      fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='%23666'%3ENo Image%3C/text%3E%3C/svg%3E"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium">{item.productName}</h5>
                      <p className="text-sm text-gray-500">
                        SKU: {item.variant?.sku || 'N/A'}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">Quantity: {item.quantity}</span>
                        <span className="font-medium">{formatCurrency(item.subtotal)}</span>
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