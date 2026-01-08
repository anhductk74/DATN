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
  Image,
  Form,
  Select,
  InputNumber,
  Tooltip
} from "antd";
import { 
  SearchOutlined, 
  ExportOutlined, 
  EyeOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  PrinterOutlined,
  TruckOutlined
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import { orderApiService, OrderStatus, PaymentMethod, type OrderResponseDto } from "@/services/OrderApiService";
import { shopService, type Shop } from "@/services/ShopService";
import ShipmentOrderService, { ShipmentOrderRequestDto, ShipmentStatus, type ShipmentOrderResponseDto } from "@/services/ShipmentOrderService";
import ShippingCompanyService, { ShippingCompanyListDto, WarehouseResponseDto } from "@/services/ShippingCompanyService";
import GhtkService from "@/services/GhtkService";
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
  const [shipmentOrders, setShipmentOrders] = useState<Map<string, ShipmentOrderResponseDto>>(new Map());
  const [printingLabel, setPrintingLabel] = useState<string | null>(null);
  
  // Shipment creation states
  const [createShipmentModalVisible, setCreateShipmentModalVisible] = useState(false);
  const [selectedOrderForShipment, setSelectedOrderForShipment] = useState<OrderResponseDto | null>(null);
  const [shipmentForm] = Form.useForm();
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompanyListDto[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseResponseDto[]>([]);
  const [loadingCompanyData, setLoadingCompanyData] = useState(false);
  const [creatingShipment, setCreatingShipment] = useState(false);

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

  const checkShipmentOrders = async (orders: OrderResponseDto[]) => {
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
      
      // Kiểm tra shipment orders cho các đơn hàng đã load
      await checkShipmentOrders(paginatedOrders);
      
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
      [OrderStatus.CONFIRMED]: { step: 1, text: 'Confirmed', progress: 50 },
      [OrderStatus.PACKED]: { step: 2, text: 'Packed', progress: 100 },
      [OrderStatus.SHIPPING]: { step: 2, text: 'Packed', progress: 100 },
      [OrderStatus.DELIVERED]: { step: 2, text: 'Delivered', progress: 100 },
      [OrderStatus.CANCELLED]: { step: 0, text: 'Cancelled', progress: 0 },
      [OrderStatus.RETURN_REQUESTED]: { step: 0, text: 'Return Requested', progress: 0 },
      [OrderStatus.RETURNED]: { step: 0, text: 'Returned', progress: 0 },
    };
    return stages[status] || { step: 0, text: 'Processing', progress: 0 };
  };

  // ============ SHIPMENT FUNCTIONS ============

  const fetchShippingCompanies = async () => {
    try {
      const companies = await ShippingCompanyService.getActiveCompanies();
      setShippingCompanies(companies);
    } catch (error) {
      message.error('Unable to load shipping companies');
    }
  };

  const fetchCompanyDetails = async (companyId: string) => {
    try {
      setLoadingCompanyData(true);
      const companyDetails = await ShippingCompanyService.getById(companyId);
      
      setWarehouses(companyDetails.warehouses || []);
      
      shipmentForm.setFieldsValue({
        warehouseId: undefined
      });
    } catch (error) {
      message.error('Unable to load company details');
      setWarehouses([]);
    } finally {
      setLoadingCompanyData(false);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    fetchCompanyDetails(companyId);
  };

  const handleCreateShipment = (order: OrderResponseDto) => {
    setSelectedOrderForShipment(order);
    setCreateShipmentModalVisible(true);
    setSelectedCompanyId(null);
    setWarehouses([]);
    
    // Calculate default estimated delivery (3 days from now)
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + 3);
    const formattedDate = estimatedDate.toISOString().slice(0, 10);
    
    // Use default weight
    const defaultWeight = 1000; // 1kg in grams
    
    shipmentForm.resetFields();
    shipmentForm.setFieldsValue({
      estimatedDelivery: formattedDate,
      weight: defaultWeight
    });
    
    fetchShippingCompanies();
  };

  const handleSubmitShipment = async (values: any) => {
    if (!selectedOrderForShipment || !currentShop) return;

    try {
      setCreatingShipment(true);
      
      // Build pickup address from shop
      const pickupAddress = currentShop.address 
        ? `${currentShop.address.street}, ${currentShop.address.commune}, ${currentShop.address.district}, ${currentShop.address.city}`
        : '';
      
      // Build delivery address from order
      const shippingAddr = selectedOrderForShipment.shippingAddress;
      const deliveryAddress = shippingAddr 
        ? `${shippingAddr.address}, ${shippingAddr.ward}, ${shippingAddr.district}, ${shippingAddr.province}` 
        : '';
      
      // Convert date to ISO format
      const estimatedDeliveryDate = new Date(values.estimatedDelivery);
      estimatedDeliveryDate.setHours(18, 0, 0, 0);
      const estimatedDeliveryISO = estimatedDeliveryDate.toISOString();
      
      const shipmentData: ShipmentOrderRequestDto = {
        orderId: selectedOrderForShipment.id,
        warehouseId: values.warehouseId,
        pickupAddress,
        deliveryAddress,
        codAmount: selectedOrderForShipment.finalAmount,
        shippingFee: selectedOrderForShipment.shippingFee,
        status: ShipmentStatus.PENDING,
        estimatedDelivery: estimatedDeliveryISO,
        weight: values.weight
      };

      // Step 1: Create shipment order
      const createdShipment = await ShipmentOrderService.createShipment(shipmentData);
      
      message.success('Shipment created successfully');

      // Step 2: Auto register with GHTK
      try {
        message.loading({ content: 'Registering with GHTK...', key: 'ghtk', duration: 0 });
        
        const ghtkResponse = await GhtkService.registerOrderFromShipment(createdShipment.id);
        
        message.success({ 
          content: `GHTK registered successfully! Tracking code: ${ghtkResponse.label}`, 
          key: 'ghtk',
          duration: 5 
        });
        
      } catch (ghtkError: any) {
        message.warning({ 
          content: `Shipment created but GHTK registration failed: ${ghtkError.message || 'Unknown error'}. You can register manually later.`, 
          key: 'ghtk',
          duration: 8 
        });
      }
      
      setCreateShipmentModalVisible(false);
      
      // Refresh shipment info
      await checkShipmentOrders([selectedOrderForShipment]);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Unable to create shipment';
      message.error(`Failed to create shipment: ${errorMessage}`);
    } finally {
      setCreatingShipment(false);
    }
  };

  const handlePrintLabel = async (orderId: string) => {
    const shipment = shipmentOrders.get(orderId);
    if (!shipment || !shipment.trackingCode) {
      message.error('Không tìm thấy mã vận đơn GHTK');
      return;
    }

    setPrintingLabel(orderId);
    try {
      const labelBlob = await GhtkService.printLabel(shipment.trackingCode);
      
      // Tạo URL từ blob và tải xuống
      const url = window.URL.createObjectURL(labelBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `label-${shipment.trackingCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('Đã tải nhãn vận đơn thành công');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể in nhãn vận đơn';
      message.error(errorMessage);
    } finally {
      setPrintingLabel(null);
    }
  };

  const handleMoveToNextStage = async (orderId: string, currentStatus: OrderStatus) => {
    setProcessing(orderId);
    try {
      let newStatus: OrderStatus;
      let successMessage: string;
      
      if (currentStatus === OrderStatus.CONFIRMED) {
        newStatus = OrderStatus.PACKED;
        successMessage = 'Order packed successfully. Shipping will be handled automatically.';
      } else {
        // No more manual transitions after PACKED
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
      width: 220,
      render: (_, record) => {
        const shipment = shipmentOrders.get(record.id);
        const hasShipment = !!shipment;
        const hasTrackingCode = shipment?.trackingCode;
        
        return (
          <Space size="small" wrap>
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
            {/* Show Create Shipment for CONFIRMED orders without shipment */}
            {record.status === OrderStatus.CONFIRMED && !hasShipment && (
              <Tooltip title="Create shipment and register with GHTK">
                <Button 
                  type="primary"
                  icon={<TruckOutlined />}
                  size="small"
                  onClick={() => handleCreateShipment(record)}
                >
                  Create Shipment
                </Button>
              </Tooltip>
            )}
            {/* Show Start Packing for CONFIRMED orders with shipment */}
            {record.status === OrderStatus.CONFIRMED && hasShipment && (
              <Button 
                type="primary"
                size="small"
                loading={processing === record.id}
                onClick={() => handleMoveToNextStage(record.id, record.status)}
              >
                Start Packing
              </Button>
            )}
            {/* Show Print Label for PACKED orders with tracking code */}
            {record.status === OrderStatus.PACKED && hasTrackingCode && (
              <Button 
                type="default"
                size="small"
                icon={<PrinterOutlined />}
                loading={printingLabel === record.id}
                onClick={() => handlePrintLabel(record.id)}
              >
                In nhãn
              </Button>
            )}
          </Space>
        );
      },
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
            <Step title="Packing Items" description="Items being packaged, shipping handled automatically" icon={<InboxOutlined />} />
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
           
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card 
        title={`Processing Orders (${filteredOrders.length})`}
     
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
        footer={(() => {
          const shipment = selectedOrder ? shipmentOrders.get(selectedOrder.id) : null;
          const hasShipment = !!shipment;
          const hasTrackingCode = shipment?.trackingCode;
          
          return [
            <Button key="close" onClick={() => setOrderDetailVisible(false)}>
              Close
            </Button>,
            // Show Create Shipment button for CONFIRMED orders without shipment
            selectedOrder?.status === OrderStatus.CONFIRMED && !hasShipment && (
              <Button 
                key="create-shipment"
                type="primary"
                icon={<TruckOutlined />}
                onClick={() => {
                  setOrderDetailVisible(false);
                  handleCreateShipment(selectedOrder);
                }}
              >
                Create Shipment
              </Button>
            ),
            // Show Print Label button for PACKED orders with tracking code
            selectedOrder?.status === OrderStatus.PACKED && hasTrackingCode && (
              <Button 
                key="print"
                icon={<PrinterOutlined />}
                loading={printingLabel === selectedOrder?.id}
                onClick={() => {
                  if (selectedOrder) {
                    handlePrintLabel(selectedOrder.id);
                  }
                }}
              >
                In nhãn
              </Button>
            ),
            // Show Start Packing button for CONFIRMED orders with shipment
            selectedOrder?.status === OrderStatus.CONFIRMED && hasShipment && (
              <Button 
                key="next" 
                type="primary"
                icon={<InboxOutlined />}
                onClick={() => {
                  handleMoveToNextStage(selectedOrder!.id, selectedOrder!.status);
                  setOrderDetailVisible(false);
                }}
              >
                Start Packing
              </Button>
            )
          ];
        })()}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Shipment Information */}
            {(() => {
              const shipment = shipmentOrders.get(selectedOrder.id);
              if (shipment && shipment.trackingCode) {
                return (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-md font-medium text-blue-900 mb-2">
                          Thông tin vận đơn GHTK
                        </h4>
                        <p className="text-sm text-blue-800">
                          <strong>Mã vận đơn:</strong> <span className="font-mono">{shipment.trackingCode}</span>
                        </p>
                        <p className="text-sm text-blue-800">
                          <strong>Trạng thái:</strong> <Tag color="blue">{ShipmentOrderService.formatStatus(shipment.status)}</Tag>
                        </p>
                      </div>
                      {(shipment.status === ShipmentStatus.REGISTERED || shipment.status === ShipmentStatus.PENDING) && (
                        <Button 
                          type="primary"
                          icon={<PrinterOutlined />}
                          loading={printingLabel === selectedOrder.id}
                          onClick={() => handlePrintLabel(selectedOrder.id)}
                        >
                          In nhãn
                        </Button>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Processing Pipeline */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="text-lg font-medium mb-4 text-center">Processing Pipeline</h4>
              <Steps
                current={selectedOrder.status === OrderStatus.CONFIRMED ? 0 : 1}
                items={[
                  {
                    title: 'Order Confirmed',
                    description: 'Payment verified',
                    icon: <CheckCircleOutlined />,
                  },
                  {
                    title: 'Packing Items',
                    description: selectedOrder.status === OrderStatus.PACKED ? 'Items packed ✓ - Auto shipping' : 'In progress...',
                    icon: <InboxOutlined />,
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
                          {selectedOrder.status === OrderStatus.PACKED ? 'Completed - Auto shipping' : 'In Progress'}
                        </div>
                        <div className={`text-sm ${selectedOrder.status === OrderStatus.PACKED ? 'text-green-600' : 'text-blue-600'}`}>
                          {selectedOrder.status === OrderStatus.PACKED ? 
                           'All items have been packed. Shipping will be handled automatically by the system.' : 
                           'Items are being packed by warehouse staff'}
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

      {/* Create Shipment Modal */}
      <Modal
        title="Create Shipment Order"
        open={createShipmentModalVisible}
        onCancel={() => setCreateShipmentModalVisible(false)}
        onOk={() => shipmentForm.submit()}
        confirmLoading={creatingShipment}
        width={700}
      >
        {selectedOrderForShipment && (
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium mb-2">Order Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Order ID:</span>
                  <span className="ml-2 font-mono font-medium">#{selectedOrderForShipment.id.slice(-8)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Customer:</span>
                  <span className="ml-2 font-medium">{selectedOrderForShipment.userName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="ml-2 font-medium text-green-600">{formatCurrency(selectedOrderForShipment.finalAmount)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Shipping Fee:</span>
                  <span className="ml-2 font-medium">{formatCurrency(selectedOrderForShipment.shippingFee)}</span>
                </div>
              </div>
            </div>

            {/* Shipment Form */}
            <Form
              form={shipmentForm}
              layout="vertical"
              onFinish={handleSubmitShipment}
            >
              {/* Shipping Company */}
              <Form.Item
                label="Shipping Company"
                name="shippingCompanyId"
                rules={[{ required: true, message: 'Please select shipping company' }]}
              >
                <Select
                  placeholder="Select shipping company"
                  onChange={handleCompanyChange}
                  loading={shippingCompanies.length === 0}
                >
                  {shippingCompanies.map(company => (
                    <Select.Option key={company.id} value={company.id}>
                      <div className="flex items-center justify-between">
                        <span>{company.name}</span>
                        <Tag color="blue" className="text-xs">{company.code}</Tag>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Warehouse */}
              <Form.Item
                label="Destination Warehouse"
                name="warehouseId"
                rules={[{ required: true, message: 'Please select warehouse' }]}
              >
                <Select
                  placeholder="Select warehouse"
                  disabled={!selectedCompanyId || loadingCompanyData}
                  loading={loadingCompanyData}
                  optionLabelProp="label"
                >
                  {warehouses.map(warehouse => (
                    <Select.Option 
                      key={warehouse.id} 
                      value={warehouse.id}
                      label={warehouse.name}
                    >
                      <div className="py-1">
                        <div className="font-medium truncate">{warehouse.name}</div>
                        <div className="text-xs text-gray-500 truncate">{warehouse.address}</div>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Estimated Delivery */}
              <Form.Item
                label="Estimated Delivery Date"
                name="estimatedDelivery"
                rules={[{ required: true, message: 'Please select estimated delivery date' }]}
              >
                <Input type="date" />
              </Form.Item>

              {/* Package Weight */}
              <Form.Item
                label="Package Weight (grams)"
                name="weight"
                rules={[
                  { required: true, message: 'Please enter package weight' },
                  { type: 'number', min: 1, message: 'Weight must be at least 1 gram' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Default weight: 1000g"
                  min={1}
                  step={100}
                  disabled
                />
              </Form.Item>

              {/* Addresses Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Pickup Address (Shop):</div>
                  <div className="text-sm text-gray-600">
                    {currentShop?.address 
                      ? `${currentShop.address.street}, ${currentShop.address.commune}, ${currentShop.address.district}, ${currentShop.address.city}`
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Delivery Address (Customer):</div>
                  <div className="text-sm text-gray-600">
                    {selectedOrderForShipment.shippingAddress ? (
                      <>
                        <div className="font-medium">{selectedOrderForShipment.shippingAddress.fullName}</div>
                        <div>{selectedOrderForShipment.shippingAddress.phone}</div>
                        <div>
                          {selectedOrderForShipment.shippingAddress.address}, {selectedOrderForShipment.shippingAddress.ward},{' '}
                          {selectedOrderForShipment.shippingAddress.district}, {selectedOrderForShipment.shippingAddress.province}
                        </div>
                      </>
                    ) : 'N/A'}
                  </div>
                </div>
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}