'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  Progress,
  message,
  Alert
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined,
  InboxOutlined
} from '@ant-design/icons';
import warehouseApiService, {
  WarehouseResponseDto,
  WarehouseStatus,
  WarehouseInventoryItem,
  WarehouseRequestDto
} from '@/services/WarehouseApiService';
import { locationService, Province, District, Ward } from '@/services/LocationService';

const { Title, Text } = Typography;

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
  const { data: session } = useSession();
  const [searchText, setSearchText] = useState<string>('');
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<WarehouseResponseDto | null>(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<WarehouseResponseDto[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseResponseDto | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [inventoryItems, setInventoryItems] = useState<WarehouseInventoryItem[]>([]);

  // Fetch warehouses by company
  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const companyId = session?.user?.company?.companyId;
      if (!companyId) {
        message.error('Không tìm thấy thông tin công ty');
        return;
      }
      const data = await warehouseApiService.getWarehousesByCompany(companyId);
      setWarehouses(data);
      
      // Auto-select first warehouse if available
      if (data.length > 0 && !selectedWarehouse) {
        setSelectedWarehouse(data[0]);
        await fetchInventory(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      message.error('Không thể tải danh sách kho');
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory for a warehouse
  const fetchInventory = async (warehouseId: string) => {
    try {
      const items = await warehouseApiService.getWarehouseInventory(warehouseId);
      setInventoryItems(items);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventoryItems([]);
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
    if (session?.user?.company?.companyId) {
      fetchWarehouses();
      fetchProvinces();
    }
  }, [session]);

  const handleSelectWarehouse = async (warehouse: WarehouseResponseDto) => {
    setSelectedWarehouse(warehouse);
    await fetchInventory(warehouse.id);
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
      // Update selected warehouse if it's the one being edited
      if (selectedWarehouse?.id === selectedRecord.id) {
        setSelectedWarehouse({ ...selectedWarehouse, ...updateDto });
      }
    } catch (error) {
      console.error('Error updating warehouse:', error);
      message.error('Không thể cập nhật kho');
    }
  };

  const handleCreate = async (values: any) => {
    try {
      const companyId = session?.user?.company?.companyId;
      if (!companyId) {
        message.error('Không tìm thấy thông tin công ty');
        return;
      }

      // Gộp địa chỉ đầy đủ: "Số nhà, Phường, Quận, Tỉnh"
      const fullAddress = [
        values.address, // Địa chỉ chi tiết (số nhà, tên đường)
        values.ward,    // Phường/Xã
        values.district, // Quận/Huyện
        values.province  // Tỉnh/TP
      ].filter(Boolean).join(', ');

      const createDto: WarehouseRequestDto = {
        shippingCompanyId: companyId,
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
    
    return matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>Quản lý Kho - {session?.user?.company?.companyName}</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Thêm kho mới
          </Button>
        </Space>
      </div>

      {selectedWarehouse ? (
        <>
          {/* Warehouse Information Card */}
          <Card 
            title="Thông tin kho" 
            extra={
              <Button 
                type="text" 
                icon={<EditOutlined />}
                onClick={() => handleEdit(selectedWarehouse)}
              >
                Chỉnh sửa
              </Button>
            }
            className="mb-4"
          >
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <div>
                  <Text type="secondary">Tên kho:</Text>
                  <div className="font-medium text-lg">{selectedWarehouse.name}</div>
                </div>
              </Col>
              <Col span={6}>
                <div>
                  <Text type="secondary">Khu vực:</Text>
                  <div className="font-medium">{selectedWarehouse.region}</div>
                </div>
              </Col>
              <Col span={6}>
                <div>
                  <Text type="secondary">Quản lý:</Text>
                  <div className="font-medium">{selectedWarehouse.managerName}</div>
                </div>
              </Col>
              <Col span={6}>
                <div>
                  <Text type="secondary">Trạng thái:</Text>
                  <div>
                    <Tag color={warehouseApiService.getStatusColor(selectedWarehouse.status)}>
                      {warehouseApiService.formatStatus(selectedWarehouse.status)}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary">Địa chỉ:</Text>
                  <div>{selectedWarehouse.address}</div>
                </div>
              </Col>
              <Col span={6}>
                <div>
                  <Text type="secondary">Số điện thoại:</Text>
                  <div className="font-medium">{selectedWarehouse.phone}</div>
                </div>
              </Col>
              <Col span={5}>
                <div>
                  <Text type="secondary">Sức chứa kho:</Text>
                  {selectedWarehouse.capacity !== undefined ? (
                    <div>
                      <div className="font-medium text-blue-600">
                        {selectedWarehouse.currentStock?.toLocaleString() || 0} / {selectedWarehouse.capacity.toLocaleString()} sản phẩm
                      </div>
                      <div className="text-xs text-green-600 mb-1">
                        Còn trống: {(selectedWarehouse.capacity - (selectedWarehouse.currentStock || 0)).toLocaleString()}
                      </div>
                      <Progress 
                        percent={Math.round(((selectedWarehouse.currentStock || 0) / selectedWarehouse.capacity) * 100)} 
                        strokeColor={
                          ((selectedWarehouse.currentStock || 0) / selectedWarehouse.capacity) >= 0.9 ? '#ff4d4f' :
                          ((selectedWarehouse.currentStock || 0) / selectedWarehouse.capacity) >= 0.7 ? '#faad14' : '#52c41a'
                        }
                        size="small"
                        status="active"
                      />
                    </div>
                  ) : (
                    <div className="text-gray-400">Chưa cập nhật</div>
                  )}
                </div>
              </Col>
            </Row>
          </Card>

          {/* Inventory Items Table */}
          <Card title="Danh sách sản phẩm trong kho">
            <Table
              columns={itemColumns}
              dataSource={inventoryItems}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} sản phẩm`
              }}
              scroll={{ x: 800 }}
            />
          </Card>
        </>
      ) : (
        <Card>
          <div className="text-center py-12">
            <InboxOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
            <div className="mt-4 text-gray-500">
              {warehouses.length === 0 
                ? 'Chưa có kho nào. Hãy tạo kho mới.' 
                : 'Chọn một kho để xem chi tiết'}
            </div>
          </div>
        </Card>
      )}

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
          {session?.user?.company && (
            <Alert
              message="Công ty"
              description={`${session.user.company.companyName} (${session.user.company.companyCode})`}
              type="info"
              showIcon
              className="mb-4"
            />
          )}

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