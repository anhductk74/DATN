'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Drawer, 
  Form, 
  DatePicker, 
  Modal,
  Typography,
  Row,
  Col,
  Statistic,
  message,
  Spin,
  Checkbox
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  FilterOutlined,
  ExportOutlined,
  CarOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { 
  shipmentOrderService, 
  ShipmentOrderResponseDto, 
  ShipmentOrderRequestDto,
  ShipmentStatus, 
  ShipmentFilters,
  PaginatedResponse,
  ghtkService
} from '@/services';
import { orderApiService } from '@/services/OrderApiService';
import { shopService } from '@/services/ShopService';

const { Title } = Typography;
const { RangePicker } = DatePicker;

// Helper function to format number with dot separator
const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function ShipmentOrderPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<ShipmentStatus | undefined>();
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [createDrawerVisible, setCreateDrawerVisible] = useState<boolean>(false);
  const [ghtkModalVisible, setGhtkModalVisible] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<ShipmentOrderResponseDto | null>(null);
  const [selectedShipmentForGhtk, setSelectedShipmentForGhtk] = useState<ShipmentOrderResponseDto | null>(null);
  const [shopPhone, setShopPhone] = useState<string>('');
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  
  // State for real data
  const [shipments, setShipments] = useState<ShipmentOrderResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<Record<ShipmentStatus, number> | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Fetch shipments data from API
  const fetchShipments = async (filters?: ShipmentFilters) => {
    try {
      setLoading(true);
      const response: PaginatedResponse<ShipmentOrderResponseDto> = await shipmentOrderService.getAll({
        ...filters,
        page: pagination.current - 1, // API uses 0-based indexing
        size: pagination.pageSize
      });
      
      // Ensure response data is valid
      if (response && response.data) {
        setShipments(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.totalItems || 0
        }));
      } else {
        setShipments([]);
        setPagination(prev => ({
          ...prev,
          total: 0
        }));
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      message.error('Không thể tải danh sách vận đơn');
      // Reset data on error
      setShipments([]);
      setPagination(prev => ({
        ...prev,
        total: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const stats = await shipmentOrderService.getStatusStatistics();
      if (stats) {
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Set default statistics on error
      setStatistics({
        [ShipmentStatus.PENDING]: 0,
        [ShipmentStatus.PICKING_UP]: 0,
        [ShipmentStatus.IN_TRANSIT]: 0,
        [ShipmentStatus.DELIVERED]: 0,
        [ShipmentStatus.RETURNING]: 0,
        [ShipmentStatus.RETURNED]: 0,
        [ShipmentStatus.CANCELLED]: 0,
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchShipments();
    fetchStatistics();
  }, []);

  // Reload data when filters change
  const handleFiltersChange = () => {
    const filters: ShipmentFilters = {
      search: searchText || undefined,
      status: selectedStatus || undefined,
    };
    fetchShipments(filters);
  };

  // Handle search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleFiltersChange();
    }, 500); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [searchText, selectedStatus]);

  // Handle pagination change
  const handleTableChange = (newPagination: any) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
    
    const filters: ShipmentFilters = {
      search: searchText || undefined,
      status: selectedStatus || undefined,
      page: newPagination.current - 1,
      size: newPagination.pageSize
    };
    fetchShipments(filters);
  };

  const getStatusColor = (status: ShipmentStatus | string): string => {
    const normalizedStatus = status?.toString().toUpperCase();
    
    const colors: Record<string, string> = {
      'PENDING': 'orange',
      'PICKING_UP': 'blue',
      'IN_TRANSIT': 'purple',
      'DELIVERED': 'green',
      'RETURNING': 'volcano',
      'RETURNED': 'red',
      'CANCELLED': 'default',
      'REGISTERED': 'cyan', // Đã đăng ký GHTK
      '2': 'blue', // GHTK: Đang lấy hàng
      '3': 'purple', // GHTK: Đang vận chuyển
      '5': 'green', // GHTK: Đã giao
      '6': 'default' // GHTK: Đã hủy
    };
    
    return colors[normalizedStatus] || 'default';
  };

  const getStatusText = (status: ShipmentStatus | string): string => {
    // Normalize status string
    const normalizedStatus = status?.toString().toUpperCase();
    
    const texts: Record<string, string> = {
      'PENDING': 'Chờ xử lý',
      'PICKING_UP': 'Đang lấy hàng',
      'IN_TRANSIT': 'Đang vận chuyển',
      'DELIVERED': 'Đã giao',
      'RETURNING': 'Đang hoàn trả',
      'RETURNED': 'Đã hoàn trả',
      'CANCELLED': 'Đã hủy',
      'REGISTERED': 'Đã đăng ký', // Thêm trường hợp này
      '2': 'Đang lấy hàng', // GHTK status_id = 2
      '3': 'Đang vận chuyển',
      '5': 'Đã giao',
      '6': 'Đã hủy'
    };
    
    return texts[normalizedStatus] || normalizedStatus || 'Không xác định';
  };

  const columns: ColumnsType<ShipmentOrderResponseDto> = [
    {
      title: 'Mã vận đơn',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text: string) => <span className="font-mono text-blue-600">{text.slice(-8)}</span>
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
      width: 130,
      render: (text: string) => text ? <span className="font-mono">{text.slice(-8)}</span> : 'N/A'
    },
    {
      title: 'Kho hàng',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 120,
    },
    {
      title: 'Shipper',
      dataIndex: 'shipperName',
      key: 'shipperName',
      width: 120,
      render: (shipper: string) => shipper || <span className="text-gray-400">Chưa phân công</span>
    },
    {
      title: 'Tuyến đường',
      key: 'route',
      width: 220,
      render: (_: any, record: ShipmentOrderResponseDto) => (
        <div className="text-sm">
          <div className="truncate" title={record.pickupAddress}>{record.pickupAddress}</div>
          <div className="text-gray-400">→</div>
          <div className="truncate" title={record.deliveryAddress}>{record.deliveryAddress}</div>
        </div>
      )
    },
    {
      title: 'COD',
      dataIndex: 'codAmount',
      key: 'codAmount',
      width: 120,
      render: (amount: number | null | undefined) => 
        amount != null && amount > 0 ? `₫${formatNumber(amount)}` : '-'
    },
    {
      title: 'Phí vận chuyển',
      dataIndex: 'shippingFee',
      key: 'shippingFee',
      width: 110,
      render: (fee: number | null | undefined) => 
        fee != null ? `₫${formatNumber(fee)}` : '₫0'
    },
    {
      title: 'Trọng lượng',
      dataIndex: 'weight',
      key: 'weight',
      width: 90,
      render: (weight: number | null | undefined) => 
        weight != null ? `${formatNumber(weight)}g` : '0g'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: ShipmentStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Dự kiến giao',
      dataIndex: 'estimatedDelivery',
      key: 'estimatedDelivery',
      width: 140,
      render: (date: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('vi-VN');
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 160,
      fixed: 'right' as const,
      render: (_: any, record: ShipmentOrderResponseDto) => (
        <Space>
          <Button 
            type="text" 
            size="small"
            style={{ color: '#1890ff' }}
            onClick={() => router.push(`/shipments/shipment-order/${record.id}`)}
          >
            Chi tiết
          </Button>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => {
              setSelectedRecord(record);
              setDrawerVisible(true);
              form.setFieldsValue(record);
            }}
          />
          {(!record.trackingCode || record.trackingCode === 'N/A') && (
            <Button 
              type="text" 
              size="small"
              style={{ color: '#1890ff' }}
              onClick={() => handleOpenGhtkModal(record)}
              loading={loading}
            >
              GHTK
            </Button>
          )}
        </Space>
      )
    }
  ];

  // Handle form submission for updating shipment
  const handleFormSubmit = async (values: any) => {
    try {
      if (selectedRecord) {
        await shipmentOrderService.updateStatus(selectedRecord.id, values.status);
        message.success('Cập nhật vận đơn thành công');
        setDrawerVisible(false);
        handleFiltersChange(); // Refresh data
        fetchStatistics(); // Refresh statistics
      }
    } catch (error) {
      console.error('Error updating shipment:', error);
      message.error('Không thể cập nhật vận đơn');
    }
  };

  // Handle create shipment form submission
  const handleCreateSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Create shipment order request
      const shipmentRequest: ShipmentOrderRequestDto = {
        orderId: values.orderId,
        shipperId: values.shipperId || '',
        warehouseId: values.warehouseId,
        pickupAddress: values.pickupAddress,
        deliveryAddress: values.deliveryAddress,
        codAmount: values.codAmount || 0,
        shippingFee: values.shippingFee,
        status: ShipmentStatus.PENDING,
        estimatedDelivery: values.estimatedDelivery,
        weight: values.weight
      };

      // Create shipment order
      await shipmentOrderService.createShipment(shipmentRequest);
      message.success('Tạo vận đơn thành công');

      setCreateDrawerVisible(false);
      createForm.resetFields();
      handleFiltersChange(); // Refresh data
      fetchStatistics(); // Refresh statistics
      
    } catch (error) {
      console.error('Error creating shipment:', error);
      message.error('Không thể tạo vận đơn');
    } finally {
      setLoading(false);
    }
  };

  // Open GHTK modal to show order details before registration
  const handleOpenGhtkModal = async (record: ShipmentOrderResponseDto) => {
    setSelectedShipmentForGhtk(record);
    setShopPhone(''); // Reset phone
    
    // Fetch shop phone
    if (record.orderCode) {
      try {
        const order = await orderApiService.getOrderById(record.orderCode);
        if (order && order.shopId) {
          const shop = await shopService.getShopById(order.shopId);
          setShopPhone(shop.data.numberPhone || '');
        }
      } catch (error) {
        console.error('Error fetching shop phone:', error);
      }
    }
    
    setGhtkModalVisible(true);
  };

  // Submit GHTK registration
  const handleGhtkSubmit = async () => {
    if (!selectedShipmentForGhtk) return;
    
    try {
      setLoading(true);
      
      // Chỉ cần gửi shipmentOrderId, backend sẽ xử lý tất cả
      const ghtkOrder = await ghtkService.registerOrderFromShipment(selectedShipmentForGhtk.id);
      
      console.log('GHTK Response:', ghtkOrder);
      
      // Hiển thị message thành công
      message.success(`Đăng ký GHTK thành công! Mã vận đơn: ${ghtkOrder.label}`);
      
      // Đóng modal và reset state
      setGhtkModalVisible(false);
      setSelectedShipmentForGhtk(null);
      setShopPhone('');
      
      // Refresh data để cập nhật trạng thái
      await handleFiltersChange();
      await fetchStatistics();
      
    } catch (error: any) {
      console.error('Error registering with GHTK:', error);
      
      let errorMessage = 'Không thể đăng ký GHTK';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Shipment Order - Quản lý vận đơn</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateDrawerVisible(true)}
        >
          Tạo vận đơn mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng vận đơn"
              value={pagination.total}
              prefix={<CarOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
         <Col span={6}>
          <Card>
            <Statistic
              title="Chờ xử lý"
              value={statistics?.[ShipmentStatus.PENDING] || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              loading={!statistics}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang vận chuyển"
              value={statistics?.[ShipmentStatus.IN_TRANSIT] || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
              loading={!statistics}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã giao thành công"
              value={statistics?.[ShipmentStatus.DELIVERED] || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
              loading={!statistics}
            />
          </Card>
        </Col>
       
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Space className="w-full justify-between flex">
          <Space>
            <Input
              placeholder="Tìm kiếm mã vận đơn, đơn hàng, người nhận..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              style={{ width: 150 }}
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
              placeholder="Tất cả trạng thái"
            >
              <Select.Option value={ShipmentStatus.PENDING}>Chờ xử lý</Select.Option>
              <Select.Option value={ShipmentStatus.PICKING_UP}>Đang lấy hàng</Select.Option>
              <Select.Option value={ShipmentStatus.IN_TRANSIT}>Đang vận chuyển</Select.Option>
              <Select.Option value={ShipmentStatus.DELIVERED}>Đã giao</Select.Option>
              <Select.Option value={ShipmentStatus.RETURNING}>Đang hoàn trả</Select.Option>
              <Select.Option value={ShipmentStatus.RETURNED}>Đã hoàn trả</Select.Option>
              <Select.Option value={ShipmentStatus.CANCELLED}>Đã hủy</Select.Option>
            </Select>
            <RangePicker placeholder={['Từ ngày', 'Đến ngày']} />
          </Space>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => {
                fetchShipments();
                fetchStatistics();
              }}
              loading={loading}
            >
              Tải lại
            </Button>
            <Button icon={<FilterOutlined />}>Lọc nâng cao</Button>
            <Button icon={<ExportOutlined />}>Xuất Excel</Button>
          </Space>
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={shipments}
            rowKey="id"
            scroll={{ x: 1500 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} của ${total} vận đơn`,
              onChange: handleTableChange,
              onShowSizeChange: handleTableChange
            }}
          />
        </Spin>
      </Card>

      {/* Create Shipment Drawer */}
      <Drawer
        title="Tạo vận đơn mới"
        placement="right"
        onClose={() => {
          setCreateDrawerVisible(false);
          createForm.resetFields();
        }}
        open={createDrawerVisible}
        width={700}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Mã đơn hàng" 
                name="orderId"
                rules={[{ required: true, message: 'Vui lòng nhập mã đơn hàng' }]}
              >
                <Input placeholder="Nhập mã đơn hàng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Kho hàng" 
                name="warehouseId"
                rules={[{ required: true, message: 'Vui lòng chọn kho hàng' }]}
              >
                <Select placeholder="Chọn kho hàng">
                  <Select.Option value="warehouse-1">Kho HCM</Select.Option>
                  <Select.Option value="warehouse-2">Kho Hà Nội</Select.Option>
                  <Select.Option value="warehouse-3">Kho Đà Nẵng</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Shipper" 
                name="shipperId"
              >
                <Select placeholder="Chọn shipper (tùy chọn)" allowClear>
                  <Select.Option value="shipper-1">Nguyễn Văn A</Select.Option>
                  <Select.Option value="shipper-2">Trần Văn B</Select.Option>
                  <Select.Option value="shipper-3">Lê Văn C</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Trọng lượng (g)" 
                name="weight"
                rules={[
                  { required: true, message: 'Vui lòng nhập trọng lượng' },
                  { type: 'number', min: 0.1, max: 20, message: 'Trọng lượng từ 0.1kg đến 20kg' }
                ]}
              >
                <Input type="number" step="0.1" placeholder="Nhập trọng lượng" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label="Địa chỉ lấy hàng" 
            name="pickupAddress"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ lấy hàng' }]}
          >
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ lấy hàng đầy đủ" />
          </Form.Item>

          <Form.Item 
            label="Địa chỉ giao hàng" 
            name="deliveryAddress"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng' }]}
          >
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ giao hàng đầy đủ" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                label="COD (VNĐ)" 
                name="codAmount"
              >
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                label="Phí vận chuyển (VNĐ)" 
                name="shippingFee"
                rules={[
                  { required: true, message: 'Vui lòng nhập phí vận chuyển' },
                  { type: 'number', min: 0, message: 'Phí vận chuyển phải >= 0' }
                ]}
              >
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                label="Dự kiến giao" 
                name="estimatedDelivery"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian dự kiến giao' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }}
                  placeholder="Chọn thời gian"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex gap-2 pt-4 border-t">
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo vận đơn
            </Button>
            <Button onClick={() => {
              setCreateDrawerVisible(false);
              createForm.resetFields();
            }}>
              Hủy
            </Button>
          </div>
        </Form>
      </Drawer>

      {/* Edit Drawer */}
      <Drawer
        title="Cập nhật vận đơn"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item 
            label="Trạng thái" 
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Select.Option value={ShipmentStatus.PENDING}>Chờ xử lý</Select.Option>
              <Select.Option value={ShipmentStatus.PICKING_UP}>Đang lấy hàng</Select.Option>
              <Select.Option value={ShipmentStatus.IN_TRANSIT}>Đang vận chuyển</Select.Option>
              <Select.Option value={ShipmentStatus.DELIVERED}>Đã giao</Select.Option>
              <Select.Option value={ShipmentStatus.RETURNING}>Đang hoàn trả</Select.Option>
              <Select.Option value={ShipmentStatus.RETURNED}>Đã hoàn trả</Select.Option>
              <Select.Option value={ShipmentStatus.CANCELLED}>Đã hủy</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ghi chú">
            <Input.TextArea rows={4} placeholder="Ghi chú về việc cập nhật trạng thái..." />
          </Form.Item>

          <div className="flex gap-2 pt-4">
            <Button type="primary" htmlType="submit" loading={loading}>
              Cập nhật
            </Button>
            <Button onClick={() => setDrawerVisible(false)}>
              Hủy
            </Button>
          </div>
        </Form>
      </Drawer>

      {/* GHTK Registration Modal - Chỉ hiển thị thông tin xác nhận */}
      <Modal
        title="Xác nhận đăng ký vận đơn GHTK"
        open={ghtkModalVisible}
        onCancel={() => {
          setGhtkModalVisible(false);
          setSelectedShipmentForGhtk(null);
        }}
        onOk={handleGhtkSubmit}
        confirmLoading={loading}
        width={900}
        okText="Xác nhận đăng ký GHTK"
        cancelText="Hủy"
      >
        {selectedShipmentForGhtk && (
          <div className="space-y-4">
            <Typography.Paragraph type="secondary">
              Vui lòng kiểm tra thông tin vận đơn trước khi đăng ký với GHTK
            </Typography.Paragraph>

            <Card title="Thông tin lấy hàng" size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <p><strong>Kho hàng:</strong> {selectedShipmentForGhtk.warehouseName}</p>
                </Col>
                <Col span={12}>
                  <p><strong>SĐT người gửi:</strong> {shopPhone || 'Đang tải...'}</p>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <p><strong>Địa chỉ:</strong> {selectedShipmentForGhtk.pickupAddress}</p>
                </Col>
              </Row>
            </Card>

            <Card title="Thông tin giao hàng" size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <p><strong>Người nhận:</strong> {selectedShipmentForGhtk.recipientName}</p>
                  <p><strong>SĐT:</strong> {selectedShipmentForGhtk.recipientPhone}</p>
                </Col>
                <Col span={12}>
                  <p><strong>Địa chỉ:</strong> {selectedShipmentForGhtk.deliveryAddress}</p>
                </Col>
              </Row>
            </Card>

            <Card title="Thông tin đơn hàng" size="small">
              <Row gutter={16}>
                <Col span={8}>
                  <p><strong>Mã vận đơn:</strong> {selectedShipmentForGhtk.id}</p>
                  <p><strong>Trọng lượng:</strong> {selectedShipmentForGhtk.weight}g</p>
                </Col>
                <Col span={8}>
                  <p><strong>COD:</strong> {selectedShipmentForGhtk.codAmount > 0 
                    ? `₫${selectedShipmentForGhtk.codAmount.toLocaleString()}` 
                    : 'Không có COD'}</p>
                  <p><strong>Phí vận chuyển:</strong> ₫{selectedShipmentForGhtk.shippingFee.toLocaleString()}</p>
                </Col>
                <Col span={8}>
                  <p><strong>Dự kiến giao:</strong> {selectedShipmentForGhtk.estimatedDelivery 
                    ? new Date(selectedShipmentForGhtk.estimatedDelivery).toLocaleDateString('vi-VN')
                    : 'N/A'}</p>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
