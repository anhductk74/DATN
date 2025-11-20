'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Descriptions,
  Tag,
  Tabs,
  Timeline,
  Table,
  Spin,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Divider,
  Drawer,
  Form,
  Select,
  InputNumber,
  App
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CarOutlined,
  ShopOutlined,
  PhoneOutlined,
  HomeOutlined,
  DollarOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  InboxOutlined,
  PlusOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import shipmentOrderService, {
  ShipmentOrderResponseDto,
  ShipmentStatus
} from '@/services/ShipmentOrderService';
import ShipmentLogService, {
  ShipmentLogResponseDto
} from '@/services/ShipmentLogService';
import { subShipmentOrderService, SubShipmentOrderResponseDto, SubShipmentOrderRequestDto } from '@/services/SubShipmentOrderService';
import warehouseApiService, { WarehouseResponseDto } from '@/services/WarehouseApiService';
import shipperApiService, { ShipperResponseDto } from '@/services/ShipperApiService';
import { orderApiService } from '@/services/OrderApiService';
import { shopService } from '@/services/ShopService';

const { Title, Text } = Typography;

// Helper function to format number with dot separator
const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function ShipmentOrderDetailPage() {
  const { message } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const shipmentId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState<ShipmentOrderResponseDto | null>(null);
  const [logs, setLogs] = useState<ShipmentLogResponseDto[]>([]);
  const [subShipments, setSubShipments] = useState<SubShipmentOrderResponseDto[]>([]);
  const [subShipmentDrawerVisible, setSubShipmentDrawerVisible] = useState(false);
  const [warehouses, setWarehouses] = useState<WarehouseResponseDto[]>([]);
  const [shippers, setShippers] = useState<ShipperResponseDto[]>([]);
  const [shopAddressAsWarehouse, setShopAddressAsWarehouse] = useState<{id: string, name: string, address: string} | null>(null);
  const [userAddressAsWarehouse, setUserAddressAsWarehouse] = useState<{id: string, name: string, address: string} | null>(null);
  const [subShipmentForm] = Form.useForm();

  // Fetch shipment detail
  const fetchShipmentDetail = async () => {
    try {
      setLoading(true);
      const data = await shipmentOrderService.getById(shipmentId);
      setShipment(data);
    } catch (error) {
      console.error('Error fetching shipment detail:', error);
      message.error('Không thể tải thông tin vận đơn');
    } finally {
      setLoading(false);
    }
  };

  // Fetch shipment logs
  const fetchShipmentLogs = async () => {
    try {
      const logsData = await ShipmentLogService.getLogsByShipmentOrder(shipmentId);
      // Sắp xếp theo thời gian tạo - mới nhất lên đầu
      const sortedLogs = logsData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLogs(sortedLogs);
    } catch (error) {
      console.error('Error fetching shipment logs:', error);
      message.error('Không thể tải lịch sử vận chuyển');
    }
  };

  // Fetch sub-shipments
  const fetchSubShipments = async () => {
    try {
      const subShipmentsData = await subShipmentOrderService.getByShipmentOrder(shipmentId);
      // Sắp xếp theo sequence giảm dần (3-2-1)
      const sortedSubShipments = subShipmentsData.sort((a, b) => b.sequence - a.sequence);
      setSubShipments(sortedSubShipments);
    } catch (error) {
      console.error('Error fetching sub-shipments:', error);
      message.error('Không thể tải các chặng vận chuyển');
    }
  };

  // Fetch warehouses
  const fetchWarehouses = async () => {
    try {
      const warehousesData = await warehouseApiService.getAllWarehouses();
      setWarehouses(warehousesData);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      message.error('Không thể tải danh sách kho');
    }
  };

  // Fetch shippers
  const fetchShippers = async () => {
    try {
      const shippersData = await shipperApiService.getAllShippers();
      setShippers(shippersData.data || []);
    } catch (error) {
      console.error('Error fetching shippers:', error);
      message.error('Không thể tải danh sách shipper');
    }
  };

  // Fetch shop address to use as warehouse for sequence 1
  const fetchShopAddress = async () => {
    try {
      // 1. Get shipment order detail
      const shipmentDetail = await shipmentOrderService.getById(shipmentId);
      
      if (!shipmentDetail.orderCode) {
        console.log('No order code found in shipment');
        return;
      }

      // 2. Get order detail by order code
      const orderDetail = await orderApiService.getOrderById(shipmentDetail.orderCode);
      
      if (!orderDetail.shopId) {
        console.log('No shop ID found in order');
        return;
      }

      // 3. Get shop detail by shop ID
      const shopDetail = await shopService.getShopById(orderDetail.shopId);
      
      if (shopDetail.data && shopDetail.data.address) {
        const shop = shopDetail.data;
        const fullAddress = `${shop.address.street}, ${shop.address.commune}, ${shop.address.district}, ${shop.address.city}`;
        
        setShopAddressAsWarehouse({
          id: `shop-${shop.id}`,
          name: shop.name,
          address: fullAddress
        });
      }
    } catch (error) {
      console.error('Error fetching shop address:', error);
      // Không hiển thị message error vì đây là optional feature
    }
  };

  // Fetch user address from shipment detail for sequence 3
  const fetchUserAddress = async () => {
    try {
      const shipmentDetail = await shipmentOrderService.getById(shipmentId);
      
      if (shipmentDetail.recipientName && shipmentDetail.deliveryAddress) {
        setUserAddressAsWarehouse({
          id: `user-${shipmentId}`,
          name: shipmentDetail.recipientName,
          address: shipmentDetail.deliveryAddress
        });
      }
    } catch (error) {
      console.error('Error fetching user address:', error);
    }
  };

  // Handle create sub-shipment
  const handleCreateSubShipment = async (values: any) => {
    try {
      setLoading(true);
      
      // Tạo startTime là thời gian hiện tại
      const startTime = new Date().toISOString();
      
      // Tạo endTime là ngày hôm sau (24 giờ sau)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);
      const endTime = endDate.toISOString();
      
      const requestDto: SubShipmentOrderRequestDto = {
        shipmentOrderId: shipmentId,
        fromWarehouseId: values.fromWarehouseId,
        toWarehouseId: values.toWarehouseId,
        shipperId: values.shipperId,
        status: values.status,
        sequence: values.sequence,
        startTime: startTime,
        endTime: endTime
      };

      // Tạo sub-shipment
      const createdSubShipment = await subShipmentOrderService.create(requestDto);
      
      // Tạo log tương ứng cho sub-shipment này
      const fromWarehouseName = warehouses.find(w => w.id === values.fromWarehouseId)?.name || 
                                 (shopAddressAsWarehouse && shopAddressAsWarehouse.id === values.fromWarehouseId ? shopAddressAsWarehouse.name : 'Kho gửi');
      
      // Nếu sequence = 3 và toWarehouseId null hoặc là user address, hiển thị địa chỉ người nhận
      let toWarehouseName = '';
      if (values.sequence === 3 && (!values.toWarehouseId || (userAddressAsWarehouse && userAddressAsWarehouse.id === values.toWarehouseId))) {
        toWarehouseName = userAddressAsWarehouse?.name || 'Người nhận';
      } else {
        toWarehouseName = warehouses.find(w => w.id === values.toWarehouseId)?.name || 'Kho nhận';
      }
      
      await ShipmentLogService.createLog({
        shipmentOrderId: shipmentId,
        subShipmentOrderId: createdSubShipment.id, // Gửi ID của sub-shipment vừa tạo
        status: values.status,
        location: `${fromWarehouseName} → ${toWarehouseName}`,
        note: `Tạo chặng ${values.sequence}: ${fromWarehouseName} → ${toWarehouseName}`
      });
      
      message.success('Tạo chặng vận chuyển thành công');
      
      setSubShipmentDrawerVisible(false);
      subShipmentForm.resetFields();
      
      // Refresh sub-shipments list and logs
      await fetchSubShipments();
      await fetchShipmentLogs();
      
    } catch (error) {
      console.error('Error creating sub-shipment:', error);
      message.error('Không thể tạo chặng vận chuyển');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shipmentId) {
      fetchShipmentDetail();
      fetchShipmentLogs();
      fetchSubShipments();
      fetchWarehouses();
      fetchShippers();
      fetchShopAddress();
      fetchUserAddress();
    }
  }, [shipmentId]);

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
    
    return texts[normalizedStatus] || normalizedStatus || 'Khởi tạo';
  };

  const getStatusIcon = (status: ShipmentStatus | string) => {
    const normalizedStatus = status?.toString().toUpperCase();
    
    const icons: Record<string, React.ReactNode> = {
      'PENDING': <ClockCircleOutlined />,
      'REGISTERED': <CheckCircleOutlined />,
      'PICKING_UP': <CarOutlined />,
      'IN_TRANSIT': <CarOutlined />,
      'DELIVERED': <CheckCircleOutlined />,
      'RETURNING': <CarOutlined />,
      'RETURNED': <HomeOutlined />,
      'CANCELLED': <ClockCircleOutlined />
    };
    
    return icons[normalizedStatus] || <ClockCircleOutlined />;
  };

  // Columns for sub-shipments table
  const subShipmentColumns: ColumnsType<SubShipmentOrderResponseDto> = [
    {
      title: 'Thứ tự',
      dataIndex: 'sequence',
      key: 'sequence',
      width: 80,
      render: (seq: number) => <Tag color="blue">#{seq}</Tag>
    },
    {
      title: 'Từ kho',
      dataIndex: 'fromWarehouseName',
      key: 'fromWarehouseName',
      width: 200,
      render: (text: string, record: SubShipmentOrderResponseDto) => {
        // Nếu fromWarehouseName null và có shopAddressAsWarehouse, hiển thị địa chỉ shop
        if (!text && shopAddressAsWarehouse) {
          return (
            <Space>
              <ShopOutlined style={{ color: '#1890ff' }} />
              <div>
                <div><Text strong>{shopAddressAsWarehouse.name} (Shop)</Text></div>
                <div><Text type="secondary" style={{ fontSize: '12px' }}>{shopAddressAsWarehouse.address}</Text></div>
              </div>
            </Space>
          );
        }
        return (
          <Space>
            <ShopOutlined />
            {text || <Text type="secondary">Chưa xác định</Text>}
          </Space>
        );
      }
    },
    {
      title: 'Đến kho',
      dataIndex: 'toWarehouseName',
      key: 'toWarehouseName',
      width: 200,
      render: (text: string, record: SubShipmentOrderResponseDto) => {
        // Nếu toWarehouseName null và sequence = 3, hiển thị địa chỉ người nhận
        if (!text && record.sequence === 3 && userAddressAsWarehouse) {
          return (
            <Space>
              <HomeOutlined style={{ color: '#52c41a' }} />
              <div>
                <div><Text strong>{userAddressAsWarehouse.name} (Người nhận)</Text></div>
                <div><Text type="secondary" style={{ fontSize: '12px' }}>{userAddressAsWarehouse.address}</Text></div>
              </div>
            </Space>
          );
        }
        return (
          <Space>
            <ShopOutlined />
            {text || <Text type="secondary">Chưa xác định</Text>}
          </Space>
        );
      }
    },
    {
      title: 'Shipper',
      dataIndex: 'shipperName',
      key: 'shipperName',
      width: 150,
      render: (text: string) => text || <span className="text-gray-400">Chưa phân công</span>
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
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 160,
      render: (date: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('vi-VN');
      }
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 160,
      render: (date: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('vi-VN');
      }
    }
  ];

  // Tab items
  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <ShopOutlined /> Thông tin chung
        </span>
      ),
      children: shipment && (
        <div className="space-y-4">
          <Row gutter={[16, 16]}>
            {/* Shipment Information */}
            <Col xs={24} lg={12}>
              <Card 
                title={<><ShopOutlined /> Thông tin vận đơn</>} 
                size="small"
                style={{ height: '100%' }}
              >
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Mã vận đơn">
                    <Text strong copyable>
                      {shipment.id}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã đơn hàng">
                    <Text copyable={!!shipment.orderCode}>
                      {shipment.orderCode || <Text type="secondary">N/A</Text>}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kho hàng">
                    <Space>
                      <ShopOutlined />
                      {shipment.warehouseName}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Shipper">
                    <Space>
                      <CarOutlined />
                      {shipment.shipperName || <Text type="secondary">Chưa phân công</Text>}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={getStatusColor(shipment.status)}>
                      {getStatusIcon(shipment.status)} {getStatusText(shipment.status)}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Pickup Information */}
            <Col xs={24} lg={12}>
              <Card 
                title={<><EnvironmentOutlined /> Thông tin lấy hàng</>} 
                size="small"
                style={{ height: '100%' }}
              >
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Địa chỉ lấy hàng">
                    {shipment.pickupAddress}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Delivery Information */}
            <Col xs={24} lg={12}>
              <Card 
                title={<><HomeOutlined /> Thông tin giao hàng</>} 
                size="small"
                style={{ height: '100%' }}
              >
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Người nhận">
                    {shipment.recipientName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    <Space>
                      <PhoneOutlined />
                      <Text copyable>{shipment.recipientPhone}</Text>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ giao hàng">
                    {shipment.deliveryAddress}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Delivery Dates */}
            <Col xs={24} lg={12}>
              <Card 
                title={<><CalendarOutlined /> Thông tin thời gian</>} 
                size="small"
                style={{ height: '100%' }}
              >
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Dự kiến giao hàng">
                    {shipment.estimatedDelivery
                      ? new Date(shipment.estimatedDelivery).toLocaleString('vi-VN')
                      : <Text type="secondary">Chưa xác định</Text>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian giao hàng">
                    {shipment.deliveredAt
                      ? new Date(shipment.deliveredAt).toLocaleString('vi-VN')
                      : <Text type="secondary">Chưa giao</Text>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian hoàn trả">
                    {shipment.returnedAt
                      ? new Date(shipment.returnedAt).toLocaleString('vi-VN')
                      : <Text type="secondary">Không có</Text>}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: '2',
      label: (
        <span>
          <FieldTimeOutlined /> Lịch sử vận chuyển
        </span>
      ),
      children: (
        <div style={{ padding: '24px' }}>
          {logs.length > 0 ? (
            <div>
              {/* Summary Stats */}
              <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={8}>
                  <Card size="small" style={{ textAlign: 'center', borderRadius: '8px' }}>
                    <Statistic
                      title="Tổng số lần cập nhật"
                      value={logs.length}
                      prefix={<FieldTimeOutlined />}
                      valueStyle={{ fontSize: '20px' }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ textAlign: 'center', borderRadius: '8px' }}>
                    <Statistic
                      title="Cập nhật gần nhất"
                      value={logs[0]?.createdAt 
                        ? new Date(logs[0].createdAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ textAlign: 'center', borderRadius: '8px' }}>
                    <Statistic
                      title="Trạng thái hiện tại"
                      value={getStatusText(logs[0]?.status)}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Compact Timeline */}
              <Card 
                styles={{ body: { padding: '24px' } }}
                style={{ 
                  borderRadius: '8px'
                }}
              >
                <div style={{ position: 'relative' }}>
                  {logs.map((log, index) => (
                    <div 
                      key={index}
                      style={{ 
                        display: 'flex',
                        marginBottom: index < logs.length - 1 ? '16px' : '0',
                        position: 'relative'
                      }}
                    >
                      {/* Timeline connector */}
                      {index < logs.length - 1 && (
                        <div style={{
                          position: 'absolute',
                          left: '19px',
                          top: '40px',
                          bottom: '-16px',
                          width: '2px',
                          background: '#e8e8e8'
                        }} />
                      )}

                      {/* Icon */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#fff',
                        border: index === 0 ? '3px solid #1890ff' : '2px solid #d9d9d9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        color: index === 0 ? '#1890ff' : '#595959',
                        flexShrink: 0,
                        zIndex: 1,
                        position: 'relative'
                      }}>
                        {getStatusIcon(log.status)}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, marginLeft: '16px' }}>
                        <Card
                          size="small"
                          style={{
                            border: index === 0 ? '1px solid #1890ff' : '1px solid #f0f0f0',
                            borderRadius: '8px',
                            background: '#ffffff'
                          }}
                        >
                          {/* Time and Status Row */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '8px',
                            flexWrap: 'wrap',
                            gap: '8px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Tag 
                                color={getStatusColor(log.status)}
                                style={{ 
                                  fontSize: '13px',
                                  padding: '2px 10px',
                                  margin: 0,
                                  fontWeight: 500
                                }}
                              >
                                {getStatusText(log.status)}
                              </Tag>
                              {index === 0 && (
                                <Tag style={{ margin: 0, fontSize: '12px', background: '#f0f0f0', border: '1px solid #d9d9d9', color: '#595959' }}>
                                  Mới nhất
                                </Tag>
                              )}
                            </div>
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              <ClockCircleOutlined style={{ marginRight: '4px' }} />
                              {log.createdAt
                                ? new Date(log.createdAt).toLocaleString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })
                                : '-'}
                            </Text>
                          </div>

                          {/* Location */}
                          {log.location && (
                            <div style={{ 
                              marginBottom: '6px',
                              padding: '6px 10px',
                              background: '#fafafa',
                              borderRadius: '4px',
                              borderLeft: '3px solid #d9d9d9'
                            }}>
                              <Space size={6}>
                                <EnvironmentOutlined style={{ fontSize: '14px' }} />
                                {log.location === 'Khách' || log.location.includes('Khách') ? (
                                  <div>
                                    <div>
                                      <Text strong style={{ fontSize: '13px' }}>
                                        {userAddressAsWarehouse?.name || shipment?.recipientName || 'Người nhận'} (Khách hàng)
                                      </Text>
                                    </div>
                                    <div>
                                      <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {userAddressAsWarehouse?.address || shipment?.deliveryAddress || 'Địa chỉ giao hàng'}
                                      </Text>
                                    </div>
                                  </div>
                                ) : (
                                  <Text strong style={{ fontSize: '13px' }}>{log.location}</Text>
                                )}
                              </Space>
                            </div>
                          )}

                          {/* Note */}
                          {log.note && (
                            <div style={{ 
                              marginBottom: log.message && log.message !== log.note ? '6px' : '0',
                              padding: '6px 10px',
                              background: '#fafafa',
                              borderRadius: '4px',
                              borderLeft: '3px solid #d9d9d9'
                            }}>
                              <Text style={{ fontSize: '13px' }}>{log.note}</Text>
                            </div>
                          )}

                          {/* Additional Message */}
                          {log.message && log.message !== log.note && (
                            <div style={{ 
                              padding: '6px 10px',
                              background: '#fafafa',
                              borderRadius: '4px'
                            }}>
                              <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
                                {log.message}
                              </Text>
                            </div>
                          )}
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <Card style={{ borderRadius: '8px' }}>
              <div className="text-center py-12">
                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  background: '#fafafa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ClockCircleOutlined style={{ fontSize: '40px', color: '#d9d9d9' }} />
                </div>
                <Title level={4} type="secondary">
                  Chưa có lịch sử vận chuyển
                </Title>
                <Text type="secondary">
                  Lịch sử vận chuyển sẽ được cập nhật khi có thay đổi trạng thái
                </Text>
              </div>
            </Card>
          )}
        </div>
      )
    },
    {
      key: '3',
      label: (
        <span>
          <CarOutlined /> Các chặng vận chuyển
        </span>
      ),
      children: (
        <div style={{ padding: '24px' }}>
          {/* Header with Add Button */}
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={5} style={{ margin: 0 }}>
              Danh sách các chặng vận chuyển
            </Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              disabled={subShipments.some(s => s.sequence === 3)}
              onClick={() => {
                setSubShipmentDrawerVisible(true);
                // Tìm sequence tiếp theo chưa được sử dụng (ưu tiên từ 1 đến 3)
                const existingSequences = subShipments.map(s => s.sequence).sort((a, b) => a - b);
                let nextSequence = 1;
                for (let i = 1; i <= 3; i++) {
                  if (!existingSequences.includes(i)) {
                    nextSequence = i;
                    break;
                  }
                }
                
                // Set default values
                const defaultValues: any = {
                  sequence: nextSequence,
                  status: ShipmentStatus.PENDING
                };
                
                // Nếu là chặng 1 và có shop address, set làm kho gửi
                if (nextSequence === 1 && shopAddressAsWarehouse) {
                  defaultValues.fromWarehouseId = shopAddressAsWarehouse.id;
                }
                
                // Sequence 3 không auto-set toWarehouse (có thể để null)
                
                subShipmentForm.setFieldsValue(defaultValues);
              }}
            >
              {subShipments.some(s => s.sequence === 3) ? 'Đã hoàn thành tất cả chặng' : 'Thêm chặng vận chuyển'}
            </Button>
          </div>

          {/* Table */}
          {subShipments.length > 0 ? (
            <Table
              columns={subShipmentColumns}
              dataSource={subShipments}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1000 }}
              bordered
            />
          ) : (
            <Card>
              <div className="text-center py-12">
                <CarOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <div>
                  <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                    Chưa có chặng vận chuyển nào
                  </Text>
                  <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '16px' }}>
                    Vận đơn chưa được phân chia thành các chặng vận chuyển
                  </Text>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    disabled={subShipments.some(s => s.sequence === 3)}
                    onClick={() => {
                      setSubShipmentDrawerVisible(true);
                      
                      const defaultValues: any = {
                        sequence: 1, // Luôn bắt đầu từ chặng 1
                        status: ShipmentStatus.PENDING
                      };
                      
                      // Nếu có shop address, set làm kho gửi cho chặng 1
                      if (shopAddressAsWarehouse) {
                        defaultValues.fromWarehouseId = shopAddressAsWarehouse.id;
                      }
                      
                      subShipmentForm.setFieldsValue(defaultValues);
                    }}
                  >
                    Tạo chặng vận chuyển đầu tiên
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '400px', padding: '24px' }}>
        <Spin size="large" spinning={true}>
          <div style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>Đang tải thông tin vận đơn...</span>
          </div>
        </Spin>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div className="text-center py-8">
            <Text type="secondary">Không tìm thấy thông tin vận đơn</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <App>
      <div style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
        {/* Header with Back Button */}
        <div style={{ marginBottom: '24px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/shipments/shipment-order')}
            style={{ marginBottom: '16px' }}
            size="large"
          >
            Quay lại danh sách
          </Button>
        <Card style={{ borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <Title level={3} style={{ margin: 0, marginBottom: '8px' }}>
                Chi tiết vận đơn
              </Title>
              <Space direction="vertical" size={4}>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Mã vận đơn: <Text strong copyable>{shipment.id}</Text>
                </Text>
                {shipment.orderCode && (
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    Mã đơn hàng: <Text strong copyable>{shipment.orderCode}</Text>
                  </Text>
                )}
              </Space>
            </div>
            <Tag 
              color={getStatusColor(shipment.status)} 
              style={{ 
                fontSize: '16px', 
                padding: '10px 20px', 
                margin: 0,
                borderRadius: '6px',
                fontWeight: 500
              }}
            >
              {getStatusIcon(shipment.status)} {getStatusText(shipment.status)}
            </Tag>
          </div>
        </Card>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: '8px' }}>
            <Statistic
              title="Tiền COD"
              value={shipment.codAmount}
              prefix={<DollarOutlined />}
              suffix="₫"
              precision={0}
              formatter={(value) => formatNumber(value as number)}
              valueStyle={{ color: '#3f8600', fontSize: '24px', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: '8px' }}>
            <Statistic
              title="Phí vận chuyển"
              value={shipment.shippingFee}
              prefix={<CarOutlined />}
              suffix="₫"
              precision={0}
              formatter={(value) => formatNumber(value as number)}
              valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: '8px' }}>
            <Statistic
              title="Trọng lượng"
              value={shipment.weight}
              prefix={<InboxOutlined />}
              suffix="g"
              formatter={(value) => formatNumber(value as number)}
              valueStyle={{ fontSize: '24px', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: '8px' }}>
            <Statistic
              title="Tổng tiền"
              value={shipment.codAmount + shipment.shippingFee}
              prefix={<DollarOutlined />}
              suffix="₫"
              precision={0}
              formatter={(value) => formatNumber(value as number)}
              valueStyle={{ color: '#cf1322', fontSize: '24px', fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card style={{ borderRadius: '8px' }}>
        <Tabs 
          defaultActiveKey="1" 
          items={tabItems}
          size="large"
        />
      </Card>

      {/* Hidden Form to connect useForm immediately */}
      <Form form={subShipmentForm} style={{ display: 'none' }} />

      {/* Create Sub-Shipment Drawer */}
      <Drawer
        title="Thêm chặng vận chuyển"
        placement="right"
        onClose={() => {
          setSubShipmentDrawerVisible(false);
          subShipmentForm.resetFields();
        }}
        open={subShipmentDrawerVisible}
        width={600}
      >
        <Form 
          form={subShipmentForm} 
          layout="vertical" 
          onFinish={handleCreateSubShipment}
        >
          <Form.Item 
            label="Thứ tự chặng" 
            name="sequence"
            rules={[
              { required: true, message: 'Vui lòng nhập thứ tự chặng' },
              { type: 'number', min: 1, message: 'Thứ tự phải >= 1' }
            ]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="Nhập thứ tự chặng (1, 2, 3...)"
              min={1}
              onChange={(value: number | null) => {
                // Auto-set addresses based on sequence
                if (value === 1 && shopAddressAsWarehouse) {
                  subShipmentForm.setFieldsValue({ 
                    fromWarehouseId: shopAddressAsWarehouse.id 
                  });
                }
                // Sequence 3 không auto-set, có thể để null
              }}
            />
          </Form.Item>

          <Form.Item 
            label="Kho gửi (Điểm bắt đầu)" 
            name="fromWarehouseId"
            rules={[{ required: true, message: 'Vui lòng chọn kho gửi' }]}
            tooltip={subShipmentForm.getFieldValue('sequence') === 1 && shopAddressAsWarehouse ? 'Chặng 1 mặc định là địa chỉ shop' : undefined}
          >
            <Select 
              placeholder="Chọn kho gửi"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children).toLowerCase().includes(input.toLowerCase())
              }
            >
              {/* Hiển thị shop address nếu là chặng 1 */}
              {subShipmentForm.getFieldValue('sequence') === 1 && shopAddressAsWarehouse && (
                <Select.Option key={shopAddressAsWarehouse.id} value={shopAddressAsWarehouse.id}>
                  🏪 {shopAddressAsWarehouse.name} (Shop) - {shopAddressAsWarehouse.address}
                </Select.Option>
              )}
              {warehouses.map(warehouse => (
                <Select.Option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} - {warehouse.address}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            label="Kho nhận (Điểm đến)" 
            name="toWarehouseId"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const sequence = getFieldValue('sequence');
                  // Sequence 3 không bắt buộc (giao hàng cho người mua)
                  if (sequence === 3) {
                    return Promise.resolve();
                  }
                  // Các sequence khác bắt buộc chọn warehouse
                  if (!value) {
                    return Promise.reject(new Error('Vui lòng chọn kho nhận'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            tooltip={subShipmentForm.getFieldValue('sequence') === 3 ? 'Chặng 3 có thể để trống (giao hàng cho người mua)' : undefined}
          >
            <Select 
              placeholder={subShipmentForm.getFieldValue('sequence') === 3 ? "Để trống nếu giao hàng cho người mua" : "Chọn kho nhận"}
              showSearch
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children).toLowerCase().includes(input.toLowerCase())
              }
            >
              {warehouses.map(warehouse => (
                <Select.Option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} - {warehouse.address}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            label="Shipper phụ trách" 
            name="shipperId"
            rules={[{ required: true, message: 'Vui lòng chọn shipper' }]}
          >
            <Select 
              placeholder="Chọn shipper"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children).toLowerCase().includes(input.toLowerCase())
              }
            >
              {shippers.map(shipper => (
                <Select.Option key={shipper.id} value={shipper.id}>
                  {shipper.fullName} - {shipper.phoneNumber} ({shipper.vehicleType}) - {shipper.region}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            label="Trạng thái" 
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value={ShipmentStatus.PENDING}>Chờ xử lý</Select.Option>
              <Select.Option value={ShipmentStatus.PICKING_UP}>Đang lấy hàng</Select.Option>
              <Select.Option value={ShipmentStatus.IN_TRANSIT}>Đang vận chuyển</Select.Option>
              <Select.Option value={ShipmentStatus.DELIVERED}>Đã giao</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex gap-2 pt-4 border-t">
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo chặng vận chuyển
            </Button>
            <Button onClick={() => {
              setSubShipmentDrawerVisible(false);
              subShipmentForm.resetFields();
            }}>
              Hủy
            </Button>
          </div>
        </Form>
      </Drawer>
      </div>
    </App>
  );
}
