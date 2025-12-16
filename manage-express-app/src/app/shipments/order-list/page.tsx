'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Modal,
  Typography,
  Row,
  Col,
  Statistic,
  Spin,
  Tooltip,
  Form,
  Select,
  App
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  SearchOutlined, 
  CarOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { orderApiService, OrderResponseDto, OrderStatus } from '@/services/OrderApiService';
import { ShipmentOrderService, ShipmentOrderRequestDto, ShipmentStatus } from '@/services/ShipmentOrderService';
import { ShippingCompanyService, ShippingCompanyListDto, ShipperResponseDto, WarehouseResponseDto } from '@/services/ShippingCompanyService';
import { shopService, Shop } from '@/services';

const { Title } = Typography;
const { confirm } = Modal;
const { Option } = Select;

export default function OrderListPage() {
  const { message } = App.useApp();
  const { data: session } = useSession();
  const [searchText, setSearchText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [createShipmentModalVisible, setCreateShipmentModalVisible] = useState<boolean>(false);
  const [selectedOrderForShipment, setSelectedOrderForShipment] = useState<OrderResponseDto | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Shipping company related states
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompanyListDto[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseResponseDto[]>([]);
  const [shippers, setShippers] = useState<ShipperResponseDto[]>([]);
  const [loadingCompanyData, setLoadingCompanyData] = useState<boolean>(false);



  // Fetch shipping companies
  const fetchShippingCompanies = async () => {
    try {
      const companies = await ShippingCompanyService.getActiveCompanies();
      setShippingCompanies(companies);
    } catch (error) {
      console.error('Error fetching shipping companies:', error);
      message.error('Unable to load shipping companies');
    }
  };

  // Fetch warehouses and shippers for selected company
  const fetchCompanyDetails = async (companyId: string) => {
    try {
      setLoadingCompanyData(true);
      const companyDetails = await ShippingCompanyService.getById(companyId);
      
      setWarehouses(companyDetails.warehouses || []);
      setShippers(companyDetails.shippers || []);
      
      // Reset selected warehouse and shipper when company changes
      form.setFieldsValue({
        warehouseId: undefined,
        shipperId: undefined
      });
    } catch (error) {
      console.error('Error fetching company details:', error);
      message.error('Unable to load company details');
      setWarehouses([]);
      setShippers([]);
    } finally {
      setLoadingCompanyData(false);
    }
  };

  // Handle company selection change
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    fetchCompanyDetails(companyId);
  };


  // Fetch orders data ready for shipment
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Get company city from session
      const companyCity = session?.user?.company?.city;
      
      // Get orders ready for shipment (SHIPPING status)
      const allOrders = await orderApiService.getOrdersReadyForShipment();
      
      // Filter out orders that already have shipment
      const ordersWithoutShipment = [];
      for (const order of allOrders) {
        const hasShipment = await ShipmentOrderService.checkOrderHasShipment(order.id);
        if (!hasShipment) {
          ordersWithoutShipment.push(order);
        }
      }
      
      let filteredOrders = ordersWithoutShipment;
      
      // Filter by shop city - only show orders from shops in the same city/province as company
      if (companyCity) {
        filteredOrders = filteredOrders.filter(order => {
          const shopCity = order.addressShop?.city;
          if (!shopCity) return false;
          
          // Normalize city/province names for comparison
          // Remove prefixes: "Thành phố", "Tỉnh", "TP.", "TP"
          const normalizeCity = (city: string) => {
            return city
              .replace(/^(Thành phố|Tỉnh|TP\.|TP)\s+/gi, '')
              .trim()
              .toLowerCase();
          };
          
          const normalizedShopCity = normalizeCity(shopCity);
          const normalizedCompanyCity = normalizeCity(companyCity);
          
          return normalizedShopCity === normalizedCompanyCity;
        });
      }
      
      // Apply search filter
      if (searchText) {
        filteredOrders = filteredOrders.filter(order => 
          order.id.toLowerCase().includes(searchText.toLowerCase()) ||
          order.userName.toLowerCase().includes(searchText.toLowerCase()) ||
          order.shopName.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      
      // Apply pagination manually (since API doesn't support it for this endpoint)
      const startIndex = (pagination.current - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
      
      setOrders(paginatedOrders);
      setPagination(prev => ({
        ...prev,
        total: filteredOrders.length
      }));
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Unable to load order list');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Reset to first page when searching
      setPagination(prev => ({ ...prev, current: 1 }));
      fetchOrders();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING: return 'orange';
      case OrderStatus.CONFIRMED: return 'blue';
      case OrderStatus.PACKED: return 'cyan';
      case OrderStatus.SHIPPING: return 'purple';
      case OrderStatus.DELIVERED: return 'green';
      case OrderStatus.CANCELLED: return 'red';
      case OrderStatus.RETURN_REQUESTED: return 'gold';
      case OrderStatus.RETURNED: return 'magenta';
      default: return 'default';
    }
  };

  const getStatusText = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING: return 'Pending';
      case OrderStatus.CONFIRMED: return 'Confirmed';
      case OrderStatus.PACKED: return 'Packed';
      case OrderStatus.SHIPPING: return 'Shipping';
      case OrderStatus.DELIVERED: return 'Delivered';
      case OrderStatus.CANCELLED: return 'Cancelled';
      case OrderStatus.RETURN_REQUESTED: return 'Return Requested';
      case OrderStatus.RETURNED: return 'Returned';
      default: return status;
    }
  };

  const handleCreateShipment = (order: OrderResponseDto) => {
    setSelectedOrderForShipment(order);
    setCreateShipmentModalVisible(true);
    setSelectedCompanyId(null);
    setWarehouses([]);
    setShippers([]);
    
    // Calculate default estimated delivery (3 days from now)
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + 3);
    const formattedDate = estimatedDate.toISOString().slice(0, 10); // Format: YYYY-MM-DD
    
    // Calculate total weight from all order items (convert kg to grams)
    const totalWeight = order.items.reduce((sum, item) => {
      const variantWeight = item.variant?.weight || 0; // weight in kg
      return sum + (variantWeight * item.quantity * 1000); // convert to grams
    }, 0);
    
    form.resetFields();
    form.setFieldsValue({
      estimatedDelivery: formattedDate,
      weight: Math.round(totalWeight) || 1000 // Round to nearest gram, default 1000g if 0
    });
    
    fetchShippingCompanies(); // Load shipping companies when opening modal
  };

  const handleSubmitShipment = async (values: any) => {
    if (!selectedOrderForShipment) return;

    try {
      setLoading(true);
      
      // Fetch shop details to get pickup address
      const shopResponse = await shopService.getShopById(selectedOrderForShipment.shopId);
      const shop = shopResponse.data;
      
      // Build pickup address - ưu tiên addressShop từ order, fallback về shop address
      let pickupAddress = '';
      if (selectedOrderForShipment.addressShop) {
        pickupAddress = `${selectedOrderForShipment.addressShop.addressLine1}, ${selectedOrderForShipment.addressShop.addressLine2}, ${selectedOrderForShipment.addressShop.city}`;
      } else if (shop.address) {
        pickupAddress = `${shop.address.street}, ${shop.address.commune}, ${shop.address.district}, ${shop.address.city}`;
      }
      
      // Build delivery address - ưu tiên addressUser, fallback về address
      const customerAddr = selectedOrderForShipment.addressUser || selectedOrderForShipment.address;
      const deliveryAddress = customerAddr ? 
        `${customerAddr.addressLine1}, ${customerAddr.addressLine2}, ${customerAddr.city}` : '';
      
      // Convert date to ISO format with time (backend expects datetime)
      const estimatedDeliveryDate = new Date(values.estimatedDelivery);
      estimatedDeliveryDate.setHours(18, 0, 0, 0); // Set to 6 PM
      const estimatedDeliveryISO = estimatedDeliveryDate.toISOString();
      
      const shipmentData: ShipmentOrderRequestDto = {
        orderId: selectedOrderForShipment.id,
        shipperId: values.shipperId,
        warehouseId: values.warehouseId,
        pickupAddress: pickupAddress,
        deliveryAddress: deliveryAddress,
        codAmount: selectedOrderForShipment.finalAmount,
        shippingFee: selectedOrderForShipment.shippingFee,
        status: ShipmentStatus.PENDING,
        estimatedDelivery: estimatedDeliveryISO,
        weight: values.weight
      };

      console.log('Sending shipment data:', shipmentData);
      
      await ShipmentOrderService.createShipment(shipmentData);
      
      message.success('Shipment created successfully');
      setCreateShipmentModalVisible(false);
      fetchOrders(); // Refresh the list
      
    } catch (error: any) {
      console.error('Error creating shipment:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Unable to create shipment';
      
      message.error(`Failed to create shipment: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<OrderResponseDto> = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text: string) => <span className="font-mono text-blue-600">{text.slice(-8)}</span>
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 180,
      render: (_, record) => {
        const customerAddr = record.addressUser || record.address;
        return (
          <div>
            <div className="font-medium">{record.userName}</div>
            <div className="text-gray-500 text-sm">{customerAddr?.phoneNumber || 'N/A'}</div>
          </div>
        );
      }
    },
    {
      title: 'Shop',
      dataIndex: 'shopName',
      key: 'shopName',
      width: 150,
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="truncate">{text}</div>
        </Tooltip>
      )
    },
    {
      title: 'Shop Address',
      key: 'shopAddress',
      width: 220,
      render: (_, record) => {
        const addr = record.addressShop;
        const fullAddress = addr ? `${addr.addressLine1}, ${addr.addressLine2}, ${addr.city}` : 'N/A';
        return (
          <Tooltip title={fullAddress}>
            <div className="truncate">{fullAddress}</div>
          </Tooltip>
        );
      }
    },
    {
      title: 'Customer Address',
      key: 'customerAddress',
      width: 250,
      render: (_, record) => {
        // Ưu tiên addressUser, fallback về address để tương thích ngược
        const addr = record.addressUser || record.address;
        const fullAddress = addr ? `${addr.addressLine1}, ${addr.addressLine2}, ${addr.city}` : 'N/A';
        return (
          <Tooltip title={fullAddress}>
            <div className="truncate">{fullAddress}</div>
          </Tooltip>
        );
      }
    },
    {
      title: 'Total Amount',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      width: 120,
      render: (amount: number) => (
        <span className="font-medium text-green-600">
          ₫{amount.toLocaleString()}
        </span>
      )
    },
    {
      title: 'Shipping Fee',
      dataIndex: 'shippingFee',
      key: 'shippingFee',
      width: 100,
      render: (fee: number) => `₫${fee.toLocaleString()}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: OrderStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => new Date(date).toLocaleDateString('en-US')
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => {
              setSelectedOrder(record);
              setDetailModalVisible(true);
            }}
          />
          {record.status === OrderStatus.CONFIRMED && (
            <Button 
              type="text" 
              icon={<PlusOutlined />} 
              size="small"
              onClick={() => handleCreateShipment(record)}
              style={{ color: '#1890ff' }}
            >
              Create Shipment
            </Button>
          )}
        </Space>
      )
    }
  ];

  const shippingCount = orders.filter(o => o.status === OrderStatus.CONFIRMED).length;
  const packedCount = orders.filter(o => o.status === OrderStatus.PACKED).length;

  return (
    <App>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Order List - Ready for Shipment</Title>
        </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Orders"
              value={orders.length}
              prefix={<CarOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Shipping Orders"
              value={shippingCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Packed Orders"
              value={packedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#13c2c2' }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Space>
          <Input
            placeholder="Search by Order ID, Customer name, Shop name..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            scroll={{ x: 1300 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} orders`,
              onChange: (page, size) => {
                setPagination(prev => ({
                  ...prev,
                  current: page,
                  pageSize: size || prev.pageSize
                }));
              },
            }}
          />
        </Spin>
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={`Order Details - ${selectedOrder?.id.slice(-8)}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="Customer Information">
                  <p><strong>Name:</strong> {selectedOrder.userName}</p>
                  <p><strong>Phone:</strong> {selectedOrder.address?.phoneNumber || 'N/A'}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Order Information">
                  <p><strong>ID:</strong> {selectedOrder.id.slice(-8)}</p>
                  <p><strong>Status:</strong> 
                    <Tag color={getStatusColor(selectedOrder.status)} className="ml-2">
                      {getStatusText(selectedOrder.status)}
                    </Tag>
                  </p>
                  <p><strong>Created At:</strong> {new Date(selectedOrder.createdAt).toLocaleString('en-US')}</p>
                </Card>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="Shop Information">
                  <p><strong>Shop:</strong> {selectedOrder.shopName}</p>
                  {selectedOrder.addressShop && (
                    <div className="mt-2">
                      <p><strong>Shop Address:</strong></p>
                      <p>{selectedOrder.addressShop.addressLine1}</p>
                      <p>{selectedOrder.addressShop.addressLine2}</p>
                      <p>{selectedOrder.addressShop.city}, {selectedOrder.addressShop.country}</p>
                      <p><strong>Phone:</strong> {selectedOrder.addressShop.phoneNumber}</p>
                    </div>
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Customer Shipping Address">
                  {(() => {
                    const customerAddr = selectedOrder.addressUser || selectedOrder.address;
                    return customerAddr ? (
                      <div>
                        <p><strong>To:</strong> {customerAddr.fullName}</p>
                        <p>{customerAddr.addressLine1}</p>
                        <p>{customerAddr.addressLine2}</p>
                        <p>{customerAddr.city}, {customerAddr.country}</p>
                        <p><strong>Phone:</strong> {customerAddr.phoneNumber}</p>
                      </div>
                    ) : (
                      <p>No shipping address</p>
                    );
                  })()}
                </Card>
              </Col>
            </Row>

            <Card size="small" title="Products">
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{item.productName} x {item.quantity}</span>
                    <span className="font-medium">₫{item.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span><strong>Total Amount:</strong></span>
                  <span className="font-medium">₫{selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span><strong>Shipping Fee:</strong></span>
                  <span>₫{selectedOrder.shippingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span><strong>Discount:</strong></span>
                  <span>-₫{selectedOrder.discountAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t">
                  <span><strong>Final Amount:</strong></span>
                  <span className="text-lg font-bold text-green-600">
                    ₫{selectedOrder.finalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>

      {/* Create Shipment Modal */}
      <Modal
        title="Create Shipment Order"
        open={createShipmentModalVisible}
        onCancel={() => setCreateShipmentModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitShipment}
        >
          {/* Shipping Company Selection */}
          <Form.Item
            name="shippingCompanyId"
            label="Shipping Company"
            rules={[{ required: true, message: 'Please select a shipping company' }]}
          >
            <Select
              placeholder="Select shipping company"
              onChange={handleCompanyChange}
              loading={loading}
              showSearch
              optionFilterProp="children"
            >
              {shippingCompanies.map(company => (
                <Option key={company.id} value={company.id}>
                  {company.name} ({company.code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="warehouseId"
                label="Warehouse"
                rules={[{ required: true, message: 'Please select a warehouse' }]}
              >
                <Select
                  placeholder="Select warehouse"
                  loading={loadingCompanyData}
                  disabled={!selectedCompanyId}
                  showSearch
                  optionFilterProp="children"
                >
                  {warehouses.map(warehouse => (
                    <Option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} - {warehouse.region}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="shipperId"
                label="Shipper"
                rules={[{ required: true, message: 'Please select a shipper' }]}
              >
                <Select
                  placeholder="Select shipper"
                  loading={loadingCompanyData}
                  disabled={!selectedCompanyId}
                  showSearch
                  optionFilterProp="children"
                >
                  {shippers.map(shipper => (
                    <Option key={shipper.id} value={shipper.id}>
                      {shipper.fullName} ({shipper.region || 'N/A'})
                  
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="estimatedDelivery"
                label="Estimated Delivery Date"
                rules={[{ required: true, message: 'Please select estimated delivery date' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="weight"
                label="Package Weight (grams)"
                rules={[{ required: true, message: 'Please enter weight' }]}
              >
                <Input type="number" step="1" placeholder="1000" disabled />
              </Form.Item>
            </Col>
          </Row>

          {selectedOrderForShipment && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h4 className="font-semibold mb-2">Order Summary</h4>
              <div className="space-y-1">
                <p><strong>Order ID:</strong> {selectedOrderForShipment.id.slice(-8)}</p>
                <p><strong>Customer:</strong> {selectedOrderForShipment.userName}</p>
                <p><strong>Phone:</strong> {(() => {
                  const customerAddr = selectedOrderForShipment.addressUser || selectedOrderForShipment.address;
                  return customerAddr?.phoneNumber || 'N/A';
                })()}</p>
                <p><strong>Pickup Address:</strong> {(() => {
                  if (selectedOrderForShipment.addressShop) {
                    return `${selectedOrderForShipment.addressShop.addressLine1}, ${selectedOrderForShipment.addressShop.addressLine2}, ${selectedOrderForShipment.addressShop.city}`;
                  }
                  return 'Will use shop default address';
                })()}</p>
                <p><strong>Delivery Address:</strong> {(() => {
                  const customerAddr = selectedOrderForShipment.addressUser || selectedOrderForShipment.address;
                  return customerAddr ? 
                    `${customerAddr.addressLine1}, ${customerAddr.addressLine2}, ${customerAddr.city}` : 'N/A';
                })()}</p>
                <p><strong>COD Amount:</strong> ₫{selectedOrderForShipment.finalAmount.toLocaleString()}</p>
                <p><strong>Shipping Fee:</strong> ₫{selectedOrderForShipment.shippingFee.toLocaleString()}</p>
              </div>
            </div>
          )}
        </Form>
      </Modal>
      </div>
    </App>
  );
}
