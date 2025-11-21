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
  Avatar,
  Drawer, 
  Form, 
  Modal,
  Typography,
  Row,
  Col,
  Statistic,
  App,
  Spin
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  UserOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import shipperApiService, { 
  ShipperResponseDto, 
  ShipperStatus, 
  ShipperRequestDto 
} from '@/services/ShipperApiService';
import ShippingCompanyService, { ShippingCompanyListDto } from '@/services/ShippingCompanyService';
import { userService, UserListDto } from '@/services/UserService';

const { Title, Text } = Typography;

export default function ShippersPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<ShipperResponseDto | null>(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [shippers, setShippers] = useState<ShipperResponseDto[]>([]);
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompanyListDto[]>([]);
  const [users, setUsers] = useState<UserListDto[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    busy: 0,
    inactive: 0,
    onLeave: 0,
    suspended: 0
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [deliveryStats, setDeliveryStats] = useState<Record<string, {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    successRate: number;
  }>>({});

  // Fetch shippers data
  const fetchShippers = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const filters = {
        search: searchText || undefined,
        status: selectedStatus !== 'all' ? (selectedStatus as ShipperStatus) : undefined,
        page: page - 1, // Backend uses 0-based index
        size: pageSize
      };

      const response = await shipperApiService.getAllShippers(filters);
      setShippers(response.data);
      setPagination({
        current: response.currentPage + 1, // Convert to 1-based for Ant Design
        pageSize: pageSize,
        total: response.totalItems
      });
      
      // Fetch delivery stats for all loaded shippers
      if (response.data && response.data.length > 0) {
        fetchAllDeliveryStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching shippers:', error);
      message.error('Không thể tải danh sách shipper');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const stats = await shipperApiService.getShipperStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Fetch shipping companies
  const fetchShippingCompanies = async () => {
    try {
      const companies = await ShippingCompanyService.getActiveCompanies();
      setShippingCompanies(companies);
    } catch (error) {
      console.error('Error fetching shipping companies:', error);
      message.error('Không thể tải danh sách công ty vận chuyển');
    }
  };

  // Fetch users with role SHIPPER and domain @ghtk.vn
  const fetchUsers = async () => {
    try {
      // Call API with both role and domain parameters
      // Backend will filter users with SHIPPER role AND @ghtk.vn domain
      // AND exclude users who already exist in Shipper table
      const users = await userService.getUsersByRoleAndDomain('SHIPPER', '@ghtk.vn');
      
      setUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Không thể tải danh sách người dùng');
    }
  };

  // Fetch delivery stats for a shipper
  const fetchDeliveryStats = async (shipperId: string) => {
    try {
      const stats = await shipperApiService.getShipperDeliveryStats(shipperId);
      setDeliveryStats(prev => ({
        ...prev,
        [shipperId]: stats
      }));
    } catch (error) {
      console.error('Error fetching delivery stats:', error);
    }
  };

  // Fetch delivery stats for all shippers
  const fetchAllDeliveryStats = async (shipperList: ShipperResponseDto[]) => {
   
    try {
      const statsPromises = shipperList.map(shipper => 
        shipperApiService.getShipperDeliveryStats(shipper.id)
          .then(stats => {
            
            return { shipperId: shipper.id, stats };
          })
          .catch(error => {
            console.error(`Error fetching stats for shipper ${shipper.id}:`, error);
            return { 
              shipperId: shipper.id, 
              stats: { totalDeliveries: 0, successfulDeliveries: 0, failedDeliveries: 0, successRate: 0 }
            };
          })
      );
      
      const allStats = await Promise.all(statsPromises);
      const statsMap = allStats.reduce((acc, { shipperId, stats }) => {
        acc[shipperId] = stats;
        return acc;
      }, {} as Record<string, any>);
      
      
      setDeliveryStats(statsMap);
    } catch (error) {
      console.error('Error fetching all delivery stats:', error);
    }
  };

  useEffect(() => {
    fetchShippers();
    fetchStatistics();
    fetchShippingCompanies();
    fetchUsers();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchShippers(1, pagination.pageSize);
    }, 500); // Debounce search

    return () => clearTimeout(delaySearch);
  }, [searchText, selectedStatus]);

  const handleTableChange = (newPagination: any) => {
    fetchShippers(newPagination.current, newPagination.pageSize);
  };

  const handleViewDetails = async (record: ShipperResponseDto) => {
    router.push(`/shippers/${record.id}`);
  };

  const handleEdit = (record: ShipperResponseDto) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
    form.setFieldsValue({
      fullName: record.fullName,
      phoneNumber: record.phoneNumber,
      email: record.email,
      status: record.status,
      vehicleType: record.vehicleType,
      licensePlate: record.licensePlate,
      region: record.region
    });
  };

  const handleUpdate = async (values: any) => {
    if (!selectedRecord) return;

    try {
      const updateDto: ShipperRequestDto = {
        userId: selectedRecord.userId,
        shippingCompanyId: selectedRecord.shippingCompanyId,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        email: values.email,
        status: values.status,
        vehicleType: values.vehicleType,
        licensePlate: values.licensePlate,
        region: values.region,
        latitude: selectedRecord.latitude,
        longitude: selectedRecord.longitude
      };

      await shipperApiService.updateShipper(selectedRecord.id, updateDto);
      message.success('Cập nhật thông tin shipper thành công');
      setDrawerVisible(false);
      fetchShippers(pagination.current, pagination.pageSize);
      fetchStatistics();
    } catch (error) {
      console.error('Error updating shipper:', error);
      message.error('Không thể cập nhật thông tin shipper');
    }
  };

  const handleCreate = async (values: any) => {
    try {
      const createDto: ShipperRequestDto = {
        userId: values.userId,
        shippingCompanyId: values.shippingCompanyId,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        email: values.email,
        status: values.status || ShipperStatus.ACTIVE,
        vehicleType: values.vehicleType,
        licensePlate: values.licensePlate,
        region: values.region,
        latitude: values.latitude,
        longitude: values.longitude
      };

      await shipperApiService.createShipper(createDto);
      message.success('Thêm shipper mới thành công');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchShippers(pagination.current, pagination.pageSize);
      fetchStatistics();
      fetchUsers(); // Refresh user list to exclude newly created shipper
    } catch (error) {
      console.error('Error creating shipper:', error);
      message.error('Không thể tạo shipper mới');
    }
  };

  const getVehicleIcon = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'motorbike': 
      case 'xe máy': 
        return '🏍️';
      case 'car': 
      case 'ô tô':
      case 'oto':
        return '🚗';
      case 'truck': 
      case 'xe tải':
      case 'xetai':
        return '🚚';
      default: 
        return '🚚';
    }
  };

  const getVehicleText = (type: string): string => {
    const texts: Record<string, string> = {
      'motorbike': 'Xe máy',
      'car': 'Ô tô',
      'truck': 'Xe tải',
      'bicycle': 'Xe đạp'
    };
    return texts[type?.toLowerCase()] || type;
  };

  const columns: ColumnsType<ShipperResponseDto> = [
    {
      title: 'Shipper ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text: string) => <span className="font-mono text-blue-600">{text.substring(0, 8)}...</span>
    },
    {
      title: 'Thông tin',
      key: 'info',
      width: 220,
      render: (_: any, record: ShipperResponseDto) => (
        <div className="flex items-center space-x-3 gap-1">
          <Avatar size="large" icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{record.fullName}</div>
            <div className="text-sm text-gray-500">{record.phoneNumber}</div>
            <div className="text-xs text-gray-400">{record.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Phương tiện',
      key: 'vehicle',
      width: 150,
      render: (_: any, record: ShipperResponseDto) => (
        <div>
          <div className="flex items-center space-x-2">
            <span>{getVehicleIcon(record.vehicleType)}</span>
            <span>{getVehicleText(record.vehicleType)}</span>
          </div>
          <div className="text-sm text-gray-500">{record.licensePlate}</div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: ShipperStatus) => (
        <Tag color={shipperApiService.getStatusColor(status)}>
          {shipperApiService.formatStatus(status)}
        </Tag>
      )
    },
    {
      title: 'Khu vực',
      dataIndex: 'region',
      key: 'region',
      width: 150,
    },
        {
      title: 'Thống kê',
      key: 'stats',
      width: 120,
      render: (_: any, record: ShipperResponseDto) => {
        const stats = deliveryStats[record.id] || {
          totalDeliveries: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
          successRate: 0
        };
        
    
        
        return (
          <div>
            <div className="text-sm">
              <span className="font-medium">{stats.totalDeliveries}</span> đơn
            </div>
            <div className="text-sm text-green-600">
              {stats.successRate.toFixed(1)}% thành công
            </div>
          </div>
        );
      }
    },
    {
      title: 'Công ty vận chuyển',
      dataIndex: 'shippingCompanyName',
      key: 'shippingCompanyName',
      width: 180,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: ShipperResponseDto) => (
        <Space>
          <Button 
            type="text" 
            size="small"
            style={{ color: '#1890ff' }}
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          />
        </Space>
      )
    }
  ];

  const filteredData = shippers;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Quản lý Shipper</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Thêm Shipper mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={12} className="mb-6">
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Tổng Shipper"
              value={statistics.total}
              prefix={<UserOutlined />}
              valueStyle={{ fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Đang hoạt động"
              value={statistics.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Đang bận"
              value={statistics.busy}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Không hoạt động"
              value={statistics.inactive}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#cf1322', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Đang nghỉ phép"
              value={statistics.onLeave}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Tạm khóa"
              value={statistics.suspended}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Space className="w-full justify-between flex">
          <Space>
            <Input
              placeholder="Tìm kiếm tên, ID, số điện thoại..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              style={{ width: 180 }}
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value={ShipperStatus.ACTIVE}>Sẵn sàng</Select.Option>
              <Select.Option value={ShipperStatus.BUSY}>Đang giao hàng</Select.Option>
              <Select.Option value={ShipperStatus.INACTIVE}>Không hoạt động</Select.Option>
              <Select.Option value={ShipperStatus.ON_LEAVE}>Nghỉ phép</Select.Option>
              <Select.Option value={ShipperStatus.SUSPENDED}>Tạm ngưng</Select.Option>
            </Select>
          </Space>
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            scroll={{ x: 1400 }}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} của ${total} shipper`
            }}
            onChange={handleTableChange}
          />
        </Spin>
      </Card>

      {/* Create Modal */}
      <Modal
        title="Thêm Shipper mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item 
            label="Người dùng" 
            name="userId" 
            rules={[{ required: true, message: 'Vui lòng chọn người dùng' }]}
          >
            <Select 
              placeholder="Chọn người dùng (Role: SHIPPER, Domain: @ghtk.vn)"
              showSearch
              loading={users.length === 0}
              notFoundContent={users.length === 0 ? "Đang tải..." : "Không có dữ liệu"}
              filterOption={(input, option) =>
                ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={users.map(user => ({
                label: `${user.fullName} (${user.username})`,
                value: user.id
              }))}
            />
          </Form.Item>

          <Form.Item 
            label="Công ty vận chuyển" 
            name="shippingCompanyId" 
            rules={[{ required: true, message: 'Vui lòng chọn công ty vận chuyển' }]}
          >
            <Select 
              placeholder="Chọn công ty vận chuyển"
              showSearch
              loading={shippingCompanies.length === 0}
              notFoundContent={shippingCompanies.length === 0 ? "Đang tải..." : "Không có dữ liệu"}
              filterOption={(input, option) =>
                ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={shippingCompanies.map(company => ({
                label: `${company.name} (${company.code})`,
                value: company.id
              }))}
            />
          </Form.Item>

          <Form.Item 
            label="Tên đầy đủ" 
            name="fullName" 
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Số điện thoại" 
                name="phoneNumber" 
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                ]}
              >
                <Input placeholder="VD: 0912345678" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Email" 
                name="email" 
                rules={[
                  { required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }
                ]}
              >
                <Input placeholder="VD: shipper@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Loại phương tiện" 
                name="vehicleType" 
                rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}
              >
                <Select placeholder="Chọn loại phương tiện">
                  <Select.Option value="motorbike">🏍️ Xe máy</Select.Option>
                  <Select.Option value="car">🚗 Ô tô</Select.Option>
                  <Select.Option value="truck">🚚 Xe tải</Select.Option>
                  <Select.Option value="bicycle">🚲 Xe đạp</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Biển số xe" 
                name="licensePlate" 
                rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}
              >
                <Input placeholder="VD: 29A-12345" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Khu vực" 
                name="region" 
                rules={[{ required: true, message: 'Vui lòng nhập khu vực' }]}
              >
                <Input placeholder="VD: Hà Nội, TP.HCM" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Trạng thái" 
                name="status" 
                initialValue={ShipperStatus.ACTIVE}
              >
                <Select>
                  <Select.Option value={ShipperStatus.ACTIVE}>Sẵn sàng</Select.Option>
                  <Select.Option value={ShipperStatus.INACTIVE}>Không hoạt động</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Vĩ độ (tùy chọn)" name="latitude">
                <Input type="number" step="0.000001" placeholder="VD: 21.028511" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Kinh độ (tùy chọn)" name="longitude">
                <Input type="number" step="0.000001" placeholder="VD: 105.804817" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex gap-2 pt-4 justify-end">
            <Button onClick={() => {
              setCreateModalVisible(false);
              createForm.resetFields();
            }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Thêm Shipper
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Drawer */}
      <Drawer
        title="Cập nhật thông tin Shipper"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item label="Tên đầy đủ" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>
          
          <Form.Item label="Số điện thoại" name="phoneNumber" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={ShipperStatus.ACTIVE}>Sẵn sàng</Select.Option>
              <Select.Option value={ShipperStatus.BUSY}>Đang giao hàng</Select.Option>
              <Select.Option value={ShipperStatus.INACTIVE}>Không hoạt động</Select.Option>
              <Select.Option value={ShipperStatus.ON_LEAVE}>Nghỉ phép</Select.Option>
              <Select.Option value={ShipperStatus.SUSPENDED}>Tạm ngưng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Loại phương tiện" name="vehicleType" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: motorbike, car, truck" />
          </Form.Item>

          <Form.Item label="Biển số xe" name="licensePlate" rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Khu vực" name="region" rules={[{ required: true, message: 'Vui lòng nhập khu vực' }]}>
            <Input placeholder="Ví dụ: Hà Nội, TP.HCM" />
          </Form.Item>

          <div className="flex gap-2 pt-4">
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
            <Button onClick={() => setDrawerVisible(false)}>
              Hủy
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}