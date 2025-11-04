"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Input, 
  Select, 
  DatePicker, 
  Row, 
  Col, 
  Statistic, 
  Modal, 
  Descriptions, 
  Image,
  Badge,
  Dropdown,
  MenuProps
} from "antd";
import { 
  SearchOutlined, 
  FilterOutlined, 
  ExportOutlined, 
  EyeOutlined, 
  MoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  CloseCircleOutlined,
  UndoOutlined,
  InboxOutlined
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import { orderApiService, OrderStatus, PaymentMethod, type OrderResponseDto, type UpdateOrderStatusDto } from "@/services/OrderApiService";
import { shopService, type Shop } from "@/services/ShopService";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useAntdApp } from "@/hooks/useAntdApp";
import { getCloudinaryUrl } from "@/config/config";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function AllOrdersPage() {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const { message } = useAntdApp();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null);
  const [orderDetailVisible, setOrderDetailVisible] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [loadingShop, setLoadingShop] = useState(true);

  // Status configuration with colors and icons
  const statusConfig = {
    [OrderStatus.PENDING]: { 
      color: 'gold', 
      icon: <ClockCircleOutlined />, 
      text: 'Pending',
      nextStatuses: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED]
    },
    [OrderStatus.CONFIRMED]: { 
      color: 'blue', 
      icon: <CheckCircleOutlined />, 
      text: 'Confirmed',
      nextStatuses: [OrderStatus.PACKED, OrderStatus.CANCELLED]
    },
    [OrderStatus.PACKED]: { 
      color: 'purple', 
      icon: <InboxOutlined />, 
      text: 'Packed',
      nextStatuses: [OrderStatus.SHIPPING]
    },
    [OrderStatus.SHIPPING]: { 
      color: 'orange', 
      icon: <TruckOutlined />, 
      text: 'Shipping',
      nextStatuses: [OrderStatus.DELIVERED]
    },
    [OrderStatus.DELIVERED]: { 
      color: 'green', 
      icon: <CheckCircleOutlined />, 
      text: 'Delivered',
      nextStatuses: [OrderStatus.RETURN_REQUESTED]
    },
    [OrderStatus.CANCELLED]: { 
      color: 'red', 
      icon: <CloseCircleOutlined />, 
      text: 'Cancelled',
      nextStatuses: []
    },
    [OrderStatus.RETURN_REQUESTED]: { 
      color: 'volcano', 
      icon: <UndoOutlined />, 
      text: 'Return Requested',
      nextStatuses: [OrderStatus.RETURNED]
    },
    [OrderStatus.RETURNED]: { 
      color: 'default', 
      icon: <UndoOutlined />, 
      text: 'Returned',
      nextStatuses: []
    }
  };

  const paymentMethodConfig = {
    [PaymentMethod.COD]: { text: 'Cash on Delivery', color: 'orange' },
    [PaymentMethod.CREDIT_CARD]: { text: 'Credit Card', color: 'blue' },
    [PaymentMethod.E_WALLET]: { text: 'E-Wallet', color: 'green' }
  };

  // Load shop data when user changes
  useEffect(() => {
    loadShopData();
  }, [user?.id, userProfile?.id]);

  // Load orders when shop or filters change
  useEffect(() => {
    if (currentShopId) {
      loadOrders();
    }
  }, [currentShopId, statusFilter]);

  // Separate useEffect for pagination changes
  useEffect(() => {
    if (currentShopId && pagination.current > 1) {
      loadOrders();
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
        
        // Load orders immediately after setting shop
        await loadOrdersWithShopId(shop.id);
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

  const loadOrdersWithShopId = async (shopId: string) => {
    setLoading(true);
    try {
      const filterStatus = statusFilter === 'All' ? undefined : statusFilter as OrderStatus;
      
      const response = await orderApiService.getOrdersByShopWithFilters(
        shopId,
        filterStatus,
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
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load orders from server';
      message.error(errorMessage);
      
      // Clear orders on failure
      setOrders([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!currentShopId) {
      return;
    }
    
    await loadOrdersWithShopId(currentShopId);
  };



  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId);
    try {
      await orderApiService.updateOrderStatus({ orderId, status: newStatus });
      message.success(`Order status updated to ${statusConfig[newStatus].text} successfully`);
      
      // Update local state immediately for better UX
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      // Refresh data from server
      await loadOrders();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update order status. Please try again.';
      message.error(errorMessage);
    } finally {
      setUpdating(null);
    }
  };

  // Generate status action menu
  const getStatusActions = (order: OrderResponseDto): MenuProps => {
    const currentConfig = statusConfig[order.status];
    const menuItems = currentConfig.nextStatuses.map(status => ({
      key: status,
      label: statusConfig[status].text,
      icon: statusConfig[status].icon,
      onClick: () => handleUpdateStatus(order.id, status)
    }));

    return { items: menuItems };
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const orderStats = [
    {
      title: 'Total Orders',
      value: orders.length,
      color: '#1890ff',
    },
    {
      title: 'Pending Orders',
      value: orders.filter(order => order.status === OrderStatus.PENDING).length,
      color: '#faad14',
    },
    {
      title: 'Processing',
      value: orders.filter(order => order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.PACKED).length,
      color: '#13c2c2',
    },
    {
      title: 'Shipping',
      value: orders.filter(order => order.status === OrderStatus.SHIPPING).length,
      color: '#fa8c16',
    },
    {
      title: 'Delivered',
      value: orders.filter(order => order.status === OrderStatus.DELIVERED).length,
      color: '#52c41a',
    },
    {
      title: 'Cancelled',
      value: orders.filter(order => order.status === OrderStatus.CANCELLED).length,
      color: '#f5222d',
    },
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
          <div className="text-xs text-gray-500">{record.shippingAddress?.phone}</div>
          {record.payment && (
            <div className="text-xs text-blue-500">
              Payment ID: {record.payment.id?.slice(-6)}
            </div>
          )}
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
          <div className="font-medium">{formatCurrency(amount)}</div>
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
      render: (status: OrderStatus, record) => {
        const config = statusConfig[status];
        return (
          <span className="flex items-center gap-2">
            <Badge color={config.color} />
            {config.icon}
            <span>{config.text}</span>
          </span>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: PaymentMethod) => {
        const config = paymentMethodConfig[method];
        return <Tag color={config.color}>{config.text}</Tag>;
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
          <Dropdown 
            menu={getStatusActions(record)}
            trigger={['click']}
            disabled={updating === record.id}
          >
            <Button 
              type="text" 
              icon={<MoreOutlined />} 
              size="small"
              title="Update Status"
              loading={updating === record.id}
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchText.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchText.toLowerCase()) ||
      (order.items && order.items.some(item => 
        item.productName.toLowerCase().includes(searchText.toLowerCase())
      ));
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
        <p className="text-gray-600">Manage all your orders from one place</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        {orderStats.map((stat, index) => (
          <Col xs={12} sm={8} md={6} lg={4} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                valueStyle={{ color: stat.color, fontSize: '20px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters and Actions */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
         <div className="flex flex-col sm:flex-row gap-4">
  <Search
    placeholder="Search orders, customers, or products"
    allowClear
    style={{ width: 300 }}
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    prefix={<SearchOutlined />}
    size="large" // 👈 thêm dòng này
  />
  <Select
    placeholder="Filter by Status"
    style={{ width: 150 }}
    value={statusFilter}
    onChange={setStatusFilter}
    size="large" // 👈 thêm dòng này
  >
    <Option value="All">All Status</Option>
    <Option value={OrderStatus.PENDING}>Pending</Option>
    <Option value={OrderStatus.CONFIRMED}>Confirmed</Option>
    <Option value={OrderStatus.PACKED}>Packed</Option>
    <Option value={OrderStatus.SHIPPING}>Shipping</Option>
    <Option value={OrderStatus.DELIVERED}>Delivered</Option>
    <Option value={OrderStatus.CANCELLED}>Cancelled</Option>
  </Select>
  <RangePicker placeholder={['Start Date', 'End Date']} size="large" /> {/* 👈 thêm dòng này */}
</div>
          
          <div className="flex gap-2">
            <Button 
              icon={<FilterOutlined />}
              onClick={() => message.info('Advanced filters coming soon')}
            >
              More Filters
            </Button>
            <Button 
              icon={<ExportOutlined />}
              onClick={() => message.info('Export functionality coming soon')}
            >
              Export
            </Button>
            {/* <Button 
              loading={loading}
              onClick={loadOrders}
            >
              Refresh
            </Button> */}
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card 
        title={`All Orders (${filteredOrders.length})`}
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
              `${range[0]}-${range[1]} of ${total} orders`,
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
        title={`Order Details - #${selectedOrder?.id.slice(-8)}`}
        open={orderDetailVisible}
        onCancel={() => setOrderDetailVisible(false)}
        width={800}
        footer={null}
      >
        {selectedOrder && (
          <div className="space-y-4">
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
                  color={statusConfig[selectedOrder.status].color}
                  text={statusConfig[selectedOrder.status].text}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                <Tag color={paymentMethodConfig[selectedOrder.paymentMethod].color}>
                  {paymentMethodConfig[selectedOrder.paymentMethod].text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Shop">
                {selectedOrder.shopName}
              </Descriptions.Item>
              {selectedOrder.payment && (
                <>
                  <Descriptions.Item label="Payment Status">
                    <Tag color={selectedOrder.payment.status === 'SUCCESS' ? 'green' : 'orange'}>
                      {selectedOrder.payment.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Transaction ID">
                    <span className="font-mono text-sm">
                      {selectedOrder.payment.transactionId || 'N/A'}
                    </span>
                  </Descriptions.Item>
                </>
              )}
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
              <h4 className="text-lg font-medium mb-3">Order Items</h4>
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

            {/* Status History */}
            {selectedOrder.statusHistories && selectedOrder.statusHistories.length > 0 && (
              <div>
                <h4 className="text-lg font-medium mb-3">Status History</h4>
                <div className="space-y-3">
                  {selectedOrder.statusHistories
                    .sort((a: any, b: any) => new Date(b.changedAt || b.createdAt).getTime() - new Date(a.changedAt || a.createdAt).getTime())
                    .map((history: any, index) => {
                      const status = history.toStatus || history.status;
                      const fromStatus = history.fromStatus;
                      const timestamp = history.changedAt || history.createdAt;
                      const note = history.note || history.notes;
                      
                      return (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            {statusConfig[status as OrderStatus]?.icon || <ClockCircleOutlined />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  color={statusConfig[status as OrderStatus]?.color || 'default'}
                                  text={statusConfig[status as OrderStatus]?.text || status}
                                />
                                {fromStatus && (
                                  <span className="text-xs text-gray-500">
                                    from {statusConfig[fromStatus as OrderStatus]?.text || fromStatus}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(timestamp).toLocaleString('vi-VN')}
                              </span>
                            </div>
                            {note && (
                              <div className="text-sm text-gray-600 mt-1">{note}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              {statusConfig[selectedOrder.status].nextStatuses.map(nextStatus => (
                <Button
                  key={nextStatus}
                  type={nextStatus === OrderStatus.CONFIRMED ? 'primary' : 'default'}
                  icon={statusConfig[nextStatus].icon}
                  loading={updating === selectedOrder.id}
                  onClick={() => {
                    handleUpdateStatus(selectedOrder.id, nextStatus);
                    setOrderDetailVisible(false);
                  }}
                >
                  {statusConfig[nextStatus].text}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}