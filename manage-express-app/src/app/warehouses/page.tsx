'use client';

import { useState, useEffect } from 'react';
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
  Modal,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Tabs,
  List,
  message,
  Spin
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  EyeOutlined,
  HomeOutlined,
  InboxOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import warehouseApiService, {
  WarehouseResponseDto,
  WarehouseStatus,
  WarehouseInventoryItem,
  WarehouseRequestDto
} from '@/services/WarehouseApiService';
import ShippingCompanyService, { ShippingCompanyListDto } from '@/services/ShippingCompanyService';
import { locationService, Province, District, Ward } from '@/services/LocationService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Danh sách khu vực Việt Nam
const VIETNAM_REGIONS = [
  { label: '--- MIỀN BẮC ---', value: '', disabled: true },
  { label: 'Hà Nội', value: 'Hà Nội' },
  { label: 'Hải Phòng', value: 'Hải Phòng' },
  { label: 'Quảng Ninh', value: 'Quảng Ninh' },
  { label: 'Bắc Ninh', value: 'Bắc Ninh' },
  { label: 'Hải Dương', value: 'Hải Dương' },
  { label: 'Hưng Yên', value: 'Hưng Yên' },
  { label: 'Thái Bình', value: 'Thái Bình' },
  { label: 'Nam Định', value: 'Nam Định' },
  { label: 'Ninh Bình', value: 'Ninh Bình' },
  { label: 'Vĩnh Phúc', value: 'Vĩnh Phúc' },
  { label: 'Bắc Giang', value: 'Bắc Giang' },
  { label: 'Phú Thọ', value: 'Phú Thọ' },
  { label: 'Lạng Sơn', value: 'Lạng Sơn' },
  { label: 'Cao Bằng', value: 'Cao Bằng' },
  { label: 'Lào Cai', value: 'Lào Cai' },
  { label: 'Yên Bái', value: 'Yên Bái' },
  { label: 'Điện Biên', value: 'Điện Biên' },
  { label: 'Lai Châu', value: 'Lai Châu' },
  { label: 'Sơn La', value: 'Sơn La' },
  { label: 'Hòa Bình', value: 'Hòa Bình' },
  { label: 'Hà Giang', value: 'Hà Giang' },
  { label: 'Tuyên Quang', value: 'Tuyên Quang' },
  { label: 'Thái Nguyên', value: 'Thái Nguyên' },
  { label: '--- MIỀN TRUNG ---', value: '', disabled: true },
  { label: 'Thanh Hóa', value: 'Thanh Hóa' },
  { label: 'Nghệ An', value: 'Nghệ An' },
  { label: 'Hà Tĩnh', value: 'Hà Tĩnh' },
  { label: 'Quảng Bình', value: 'Quảng Bình' },
  { label: 'Quảng Trị', value: 'Quảng Trị' },
  { label: 'Thừa Thiên Huế', value: 'Thừa Thiên Huế' },
  { label: 'Đà Nẵng', value: 'Đà Nẵng' },
  { label: 'Quảng Nam', value: 'Quảng Nam' },
  { label: 'Quảng Ngãi', value: 'Quảng Ngãi' },
  { label: 'Bình Định', value: 'Bình Định' },
  { label: 'Phú Yên', value: 'Phú Yên' },
  { label: 'Khánh Hòa', value: 'Khánh Hòa' },
  { label: 'Ninh Thuận', value: 'Ninh Thuận' },
  { label: 'Bình Thuận', value: 'Bình Thuận' },
  { label: 'Kon Tum', value: 'Kon Tum' },
  { label: 'Gia Lai', value: 'Gia Lai' },
  { label: 'Đắk Lắk', value: 'Đắk Lắk' },
  { label: 'Đắk Nông', value: 'Đắk Nông' },
  { label: 'Lâm Đồng', value: 'Lâm Đồng' },
  { label: '--- MIỀN NAM ---', value: '', disabled: true },
  { label: 'Hồ Chí Minh', value: 'Hồ Chí Minh' },
  { label: 'Đồng Nai', value: 'Đồng Nai' },
  { label: 'Bình Dương', value: 'Bình Dương' },
  { label: 'Bà Rịa - Vũng Tàu', value: 'Bà Rịa - Vũng Tàu' },
  { label: 'Long An', value: 'Long An' },
  { label: 'Tiền Giang', value: 'Tiền Giang' },
  { label: 'Bến Tre', value: 'Bến Tre' },
  { label: 'Trà Vinh', value: 'Trà Vinh' },
  { label: 'Vĩnh Long', value: 'Vĩnh Long' },
  { label: 'Đồng Tháp', value: 'Đồng Tháp' },
  { label: 'An Giang', value: 'An Giang' },
  { label: 'Kiên Giang', value: 'Kiên Giang' },
  { label: 'Cần Thơ', value: 'Cần Thơ' },
  { label: 'Hậu Giang', value: 'Hậu Giang' },
  { label: 'Sóc Trăng', value: 'Sóc Trăng' },
  { label: 'Bạc Liêu', value: 'Bạc Liêu' },
  { label: 'Cà Mau', value: 'Cà Mau' },
  { label: 'Tây Ninh', value: 'Tây Ninh' },
  { label: 'Bình Phước', value: 'Bình Phước' },
];

export default function WarehousesPage() {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<WarehouseResponseDto | null>(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<WarehouseResponseDto[]>([]);
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompanyListDto[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    maintenance: 0,
    full: 0,
    temporarilyClosed: 0,
    totalCapacity: 0,
    totalCurrentStock: 0
  });
  const [inventoryItems, setInventoryItems] = useState<Record<string, WarehouseInventoryItem[]>>({});

  // Fetch warehouses
  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const data = await warehouseApiService.getAllWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      message.error('Không thể tải danh sách kho');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const stats = await warehouseApiService.getWarehouseStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Fetch inventory for a warehouse
  const fetchInventory = async (warehouseId: string) => {
    try {
      const items = await warehouseApiService.getWarehouseInventory(warehouseId);
      setInventoryItems(prev => ({
        ...prev,
        [warehouseId]: items
      }));
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  // Fetch shipping companies
  const fetchShippingCompanies = async () => {
    try {
      console.log('Fetching shipping companies...');
      const companies = await ShippingCompanyService.getActiveCompanies();
      console.log('Shipping companies loaded:', companies);
      setShippingCompanies(companies);
    } catch (error) {
      console.error('Error fetching shipping companies:', error);
      message.error('Không thể tải danh sách công ty vận chuyển');
    }
  };

  // Fetch provinces
  const fetchProvinces = async () => {
    try {
      const data = await locationService.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      message.error('Không thể tải danh sách tỉnh/thành phố');
    }
  };

  // Fetch districts when province changes
  const handleProvinceChange = async (provinceCode: string) => {
    try {
      const data = await locationService.getDistricts(provinceCode);
      setDistricts(data);
      setWards([]); // Reset wards
      createForm.setFieldsValue({ district: undefined, ward: undefined });
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  // Fetch wards when district changes
  const handleDistrictChange = async (districtCode: string) => {
    try {
      const data = await locationService.getWards(districtCode);
      setWards(data);
      createForm.setFieldsValue({ ward: undefined });
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchStatistics();
    fetchShippingCompanies();
    fetchProvinces();
  }, []);

  const handleViewDetails = async (record: WarehouseResponseDto) => {
    setSelectedRecord(record);
    setModalVisible(true);
    // Fetch inventory when viewing details
    if (!inventoryItems[record.id]) {
      await fetchInventory(record.id);
    }
  };

  const handleEdit = (record: WarehouseResponseDto) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
    
    // Parse địa chỉ để tách ra các phần (nếu có)
    // VD: "456 Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP.HCM"
    const addressParts = record.address.split(', ');
    const detailAddress = addressParts.length > 0 ? addressParts[0] : record.address;
    
    form.setFieldsValue({
      name: record.name,
      address: detailAddress, // Chỉ lấy phần địa chỉ chi tiết (số nhà, đường)
      region: record.region,
      province: record.province,
      district: record.district,
      ward: record.ward,
      managerName: record.managerName,
      phone: record.phone,
      status: record.status,
      capacity: record.capacity,
      currentStock: record.currentStock
    });
  };

  const handleUpdate = async (values: any) => {
    if (!selectedRecord) return;

    try {
      // Gộp địa chỉ đầy đủ khi cập nhật
      const fullAddress = [
        values.address,
        values.ward,
        values.district,
        values.province
      ].filter(Boolean).join(', ');

      const updateDto: WarehouseRequestDto = {
        shippingCompanyId: selectedRecord.shippingCompanyId,
        name: values.name,
        address: fullAddress, // Địa chỉ đầy đủ
        region: values.region,
        province: values.province,
        district: values.district,
        ward: values.ward,
        managerName: values.managerName,
        phone: values.phone,
        status: values.status,
        capacity: values.capacity,
      };

      await warehouseApiService.updateWarehouse(selectedRecord.id, updateDto);
      message.success('Cập nhật kho thành công');
      setDrawerVisible(false);
      fetchWarehouses();
      fetchStatistics();
    } catch (error) {
      console.error('Error updating warehouse:', error);
      message.error('Không thể cập nhật kho');
    }
  };

  const handleCreate = async (values: any) => {
    try {
      // Gộp địa chỉ đầy đủ: "Số nhà, Phường, Quận, Tỉnh"
      const fullAddress = [
        values.address, // Địa chỉ chi tiết (số nhà, tên đường)
        values.ward,    // Phường/Xã
        values.district, // Quận/Huyện
        values.province  // Tỉnh/TP
      ].filter(Boolean).join(', ');

      const createDto: WarehouseRequestDto = {
        shippingCompanyId: values.shippingCompanyId,
        name: values.name,
        address: fullAddress, // Địa chỉ đầy đủ
        region: values.region,
        province: values.province,
        district: values.district,
        ward: values.ward,
        managerName: values.managerName,
        phone: values.phone,
        status: values.status || WarehouseStatus.ACTIVE,
        capacity: values.capacity,
      };

      await warehouseApiService.createWarehouse(createDto);
      message.success('Tạo kho mới thành công');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchWarehouses();
      fetchStatistics();
    } catch (error) {
      console.error('Error creating warehouse:', error);
      message.error('Không thể tạo kho mới');
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'active': 'green',
      'inactive': 'red',
      'maintenance': 'orange'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string): string => {
    const texts: Record<string, string> = {
      'active': 'Hoạt động',
      'inactive': 'Không hoạt động',
      'maintenance': 'Bảo trì'
    };
    return texts[status] || status;
  };

  const getCapacityStatus = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return { color: 'red', text: 'Gần đầy' };
    if (percentage >= 70) return { color: 'orange', text: 'Khá đầy' };
    return { color: 'green', text: 'Bình thường' };
  };

  const columns: ColumnsType<WarehouseResponseDto> = [
    {
      title: 'Mã kho',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text: string) => <span className="font-mono text-blue-600">{text.substring(0, 8)}...</span>
    },
    {
      title: 'Thông tin kho',
      key: 'info',
      width: 250,
      render: (_: any, record: WarehouseResponseDto) => (
        <div>
          <div className="font-medium text-lg">{record.name}</div>
          <div className="text-sm text-gray-600">{record.address}</div>
          <div className="text-xs text-gray-500">
            Quản lý: {record.managerName} | {record.phone}
          </div>
        </div>
      )
    },
    {
      title: 'Sức chứa',
      key: 'capacity',
      width: 200,
      render: (_: any, record: WarehouseResponseDto) => {
        if (!record.capacity && !record.currentStock) {
          return (
            <div className="text-center">
              <Text type="secondary" italic>Chưa cập nhật</Text>
            </div>
          );
        }
        
        // Nếu chỉ có capacity hoặc currentStock
        if (!record.capacity || !record.currentStock) {
          return (
            <div>
              <Text type="secondary">
                {record.currentStock ? `Hiện: ${record.currentStock.toLocaleString()}` : ''}
                {record.capacity ? `Tối đa: ${record.capacity.toLocaleString()}` : ''}
              </Text>
            </div>
          );
        }
        
        // Có đủ cả 2
        const percentage = (record.currentStock / record.capacity) * 100;
        const status = getCapacityStatus(record.currentStock, record.capacity);
        
        return (
          <div>
            <div className="mb-1">
              <span className="font-medium">{record.currentStock.toLocaleString()}</span>
              <span className="text-gray-500"> / {record.capacity.toLocaleString()}</span>
            </div>
            <Progress 
              percent={percentage} 
              strokeColor={status.color}
              size="small"
            />
            <div className="text-xs mt-1" style={{ color: status.color }}>
              {status.text}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: WarehouseStatus) => (
        <Tag color={warehouseApiService.getStatusColor(status)}>
          {warehouseApiService.formatStatus(status)}
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
      title: 'Công ty',
      dataIndex: 'shippingCompanyName',
      key: 'shippingCompanyName',
      width: 180,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: WarehouseResponseDto) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewDetails(record)}
          />
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

  const itemColumns: ColumnsType<WarehouseInventoryItem> = [
    {
      title: 'Mã SP',
      dataIndex: 'productId',
      key: 'productId',
      width: 120,
      render: (text: string) => <span className="font-mono">{text.substring(0, 8)}...</span>
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      width: 100,
      render: (_: any, record: WarehouseInventoryItem) => (
        <span>{record.quantity} {record.unit}</span>
      )
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      width: 100,
    },
    {
      title: 'Cập nhật cuối',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 150,
    }
  ];

  const filteredData = warehouses.filter(item => {
    const matchesSearch = !searchText || 
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.id.toLowerCase().includes(searchText.toLowerCase()) ||
      item.managerName.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Quản lý Kho</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Thêm kho mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số kho"
              value={statistics.total}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Kho hoạt động"
              value={statistics.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng sức chứa"
              value={statistics.totalCapacity}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang sử dụng"
              value={statistics.totalCurrentStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Space className="w-full justify-between flex">
          <Space>
            <Input
              placeholder="Tìm kiếm tên kho, mã kho, quản lý..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              style={{ width: 200 }}
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value={WarehouseStatus.ACTIVE}>Hoạt động</Select.Option>
              <Select.Option value={WarehouseStatus.INACTIVE}>Không hoạt động</Select.Option>
              <Select.Option value={WarehouseStatus.MAINTENANCE}>Bảo trì</Select.Option>
              <Select.Option value={WarehouseStatus.FULL}>Đầy</Select.Option>
              <Select.Option value={WarehouseStatus.TEMPORARILY_CLOSED}>Tạm đóng</Select.Option>
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
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} của ${total} kho`
            }}
          />
        </Spin>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết ${selectedRecord?.name}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1000}
      >
        {selectedRecord && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin chung" key="1">
              <Row gutter={16} className="mb-4">
                <Col span={12}>
                  <Card title="Thông tin kho" size="small">
                    <div className="space-y-2">
                      <p><strong>Mã kho:</strong> {selectedRecord.id}</p>
                      <p><strong>Tên:</strong> {selectedRecord.name}</p>
                      <p><strong>Địa chỉ:</strong> {selectedRecord.address}</p>
                      <p><strong>Khu vực:</strong> {selectedRecord.region}</p>
                      <p><strong>Trạng thái:</strong> 
                        <Tag color={warehouseApiService.getStatusColor(selectedRecord.status)} className="ml-2">
                          {warehouseApiService.formatStatus(selectedRecord.status)}
                        </Tag>
                      </p>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Thông tin quản lý" size="small">
                    <div className="space-y-2">
                      <p><strong>Quản lý:</strong> {selectedRecord.managerName}</p>
                      <p><strong>Điện thoại:</strong> {selectedRecord.phone}</p>
                      <p><strong>Công ty:</strong> {selectedRecord.shippingCompanyName}</p>
                      {selectedRecord.capacity && (
                        <p><strong>Sức chứa:</strong> {selectedRecord.capacity.toLocaleString()}</p>
                      )}
                     
                        <p><strong>Đang sử dụng:</strong>  {selectedRecord.currentStock && (selectedRecord.currentStock.toLocaleString())}</p>
                     
                    </div>
                  </Card>
                </Col>
              </Row>
              
              {selectedRecord.capacity && selectedRecord.currentStock && (
                <Card title="Tình trạng sức chứa" size="small">
                  {(() => {
                    const percentage = (selectedRecord.currentStock / selectedRecord.capacity) * 100;
                    const status = getCapacityStatus(selectedRecord.currentStock, selectedRecord.capacity);
                    
                    return (
                      <div>
                        <Progress 
                          percent={percentage} 
                          strokeColor={status.color}
                          format={() => `${percentage.toFixed(1)}%`}
                        />
                        <p className="mt-2" style={{ color: status.color }}>
                          {status.text} - Còn trống: {(selectedRecord.capacity - selectedRecord.currentStock).toLocaleString()} đơn vị
                        </p>
                      </div>
                    );
                  })()}
                </Card>
              )}
            </TabPane>

            <TabPane tab="Danh sách hàng hóa" key="2">
              {inventoryItems[selectedRecord.id] ? (
                <Table
                  columns={itemColumns}
                  dataSource={inventoryItems[selectedRecord.id]}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              ) : (
                <div className="text-center py-8">
                  <Spin tip="Đang tải danh sách hàng hóa..." />
                </div>
              )}
            </TabPane>

            <TabPane tab="Lịch sử hoạt động" key="3">
              <List
                size="small"
                dataSource={[
                  { time: '2025-11-09 16:30', action: 'Nhập kho 50 sản phẩm IT006', user: 'Admin' },
                  { time: '2025-11-09 14:20', action: 'Xuất kho 20 sản phẩm IT002', user: 'Staff A' },
                  { time: '2025-11-09 10:30', action: 'Kiểm kê kho', user: 'Manager' },
                  { time: '2025-11-08 18:45', action: 'Cập nhật vị trí hàng hóa', user: 'Staff B' }
                ]}
                renderItem={(item: any) => (
                  <List.Item>
                    <div className="w-full flex justify-between">
                      <div>
                        <span className="font-medium">{item.action}</span>
                        <span className="text-sm text-gray-500 ml-2">bởi {item.user}</span>
                      </div>
                      <span className="text-sm text-gray-400">{item.time}</span>
                    </div>
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        title="Thêm kho mới"
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
            label="Tên kho" 
            name="name" 
            rules={[{ required: true, message: 'Vui lòng nhập tên kho' }]}
          >
            <Input placeholder="VD: Kho Miền Bắc 1" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Tỉnh/Thành phố" 
                name="province" 
                rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
              >
                <Select 
                  placeholder="Chọn tỉnh/thành phố"
                  showSearch
                  filterOption={(input, option) =>
                    ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    const selectedProvince = provinces.find(p => p.name === value);
                    if (selectedProvince) {
                      handleProvinceChange(selectedProvince.code);
                      // Auto-fill region based on province
                      createForm.setFieldsValue({ region: selectedProvince.name });
                    }
                  }}
                  options={provinces.map(p => ({
                    label: p.name,
                    value: p.name
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Quận/Huyện" 
                name="district" 
                rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
              >
                <Select 
                  placeholder="Chọn quận/huyện"
                  showSearch
                  disabled={districts.length === 0}
                  filterOption={(input, option) =>
                    ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    const selectedDistrict = districts.find(d => d.name === value);
                    if (selectedDistrict) {
                      handleDistrictChange(selectedDistrict.code);
                    }
                  }}
                  options={districts.map(d => ({
                    label: d.name,
                    value: d.name
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Phường/Xã" 
                name="ward" 
                rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
              >
                <Select 
                  placeholder="Chọn phường/xã"
                  showSearch
                  disabled={wards.length === 0}
                  filterOption={(input, option) =>
                    ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={wards.map(w => ({
                    label: w.name,
                    value: w.name
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Khu vực" 
                name="region" 
                rules={[{ required: true, message: 'Khu vực được tự động điền' }]}
              >
                <Select 
                  placeholder="Tự động điền theo tỉnh"
                  disabled
                  options={VIETNAM_REGIONS}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                label="Địa chỉ chi tiết" 
                name="address" 
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
              >
                <Input.TextArea rows={2} placeholder="Số nhà, tên đường, ngõ/hẻm..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Tên quản lý" 
                name="managerName" 
                rules={[{ required: true, message: 'Vui lòng nhập tên quản lý' }]}
              >
                <Input placeholder="VD: Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Số điện thoại" 
                name="phone" 
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                ]}
              >
                <Input placeholder="VD: 0912345678" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Sức chứa (tùy chọn)" name="capacity">
                <Input type="number" placeholder="VD: 10000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Trạng thái" 
                name="status" 
                initialValue={WarehouseStatus.ACTIVE}
              >
                <Select>
                  <Select.Option value={WarehouseStatus.ACTIVE}>Hoạt động</Select.Option>
                  <Select.Option value={WarehouseStatus.INACTIVE}>Không hoạt động</Select.Option>
                  <Select.Option value={WarehouseStatus.MAINTENANCE}>Bảo trì</Select.Option>
                </Select>
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
              Tạo kho
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Drawer */}
      <Drawer
        title="Cập nhật thông tin kho"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item label="Tên kho" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên kho' }]}>
            <Input />
          </Form.Item>
          
          <Form.Item label="Địa chỉ" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Khu vực" name="region" rules={[{ required: true }]}>
            <Select 
              placeholder="Chọn tỉnh/thành phố"
              showSearch
              filterOption={(input, option) =>
                ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={VIETNAM_REGIONS}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Tỉnh/TP" name="province" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Quận/Huyện" name="district" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Phường/Xã" name="ward" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Quản lý" name="managerName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Sức chứa" name="capacity">
                <Input type="number" placeholder="Để trống nếu chưa có" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Đang sử dụng" name="currentStock">
                <Input type="number" placeholder="Để trống nếu chưa có" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={WarehouseStatus.ACTIVE}>Hoạt động</Select.Option>
              <Select.Option value={WarehouseStatus.INACTIVE}>Không hoạt động</Select.Option>
              <Select.Option value={WarehouseStatus.MAINTENANCE}>Bảo trì</Select.Option>
              <Select.Option value={WarehouseStatus.FULL}>Đầy</Select.Option>
              <Select.Option value={WarehouseStatus.TEMPORARILY_CLOSED}>Tạm đóng</Select.Option>
            </Select>
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