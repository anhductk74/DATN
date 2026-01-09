'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Typography,
  Row,
  Col,
  Statistic,
  Spin,
  Progress,
  Tag,
  App
} from 'antd';
import { 
  CarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RightOutlined,
  ShoppingOutlined,
  DollarCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  TruckOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { 
  shipmentOrderService, 
  ShipmentStatus,
  orderApiService,
  OrderStatus,
  ghtkService
} from '@/services';

const { Title, Text, Paragraph } = Typography;

interface ShipmentsOverviewPageProps {
  onNavigate?: (path: string) => void;
}

export default function ShipmentsOverviewPage({ onNavigate }: ShipmentsOverviewPageProps) {
  const { message } = App.useApp();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  
  // Shipment statistics
  const [shipmentStats, setShipmentStats] = useState<Record<ShipmentStatus, number> | null>(null);
  const [codStats, setCodStats] = useState({
    totalCod: 0,
    deliveredCod: 0,
    pendingCod: 0
  });
  


  // GHTK statistics
  const [ghtkStats, setGhtkStats] = useState({
    totalOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    totalFee: 0,
    totalCod: 0
  });

  // Fetch all statistics
  const fetchAllStatistics = async () => {
    try {
      setLoading(true);
      
      // Fetch shipment statistics
      const [shipmentStatusStats, shipmentCodStats] = await Promise.all([
        shipmentOrderService.getStatusStatistics(),
        shipmentOrderService.getCodStatistics()
      ]);
      
      setShipmentStats(shipmentStatusStats);
      setCodStats(shipmentCodStats);

      // Fetch GHTK statistics
      try {
        const ghtkStatistics = await ghtkService.getOrderStatistics();
        setGhtkStats(ghtkStatistics);
      } catch (ghtkError) {
        console.log('GHTK statistics not available:', ghtkError);
      }
      

      
    } catch (error) {
      console.error('Error fetching statistics:', error);
      message.error('Không thể tải thống kê');
      
      // Set default values
      setShipmentStats({
        [ShipmentStatus.PENDING]: 0,
        [ShipmentStatus.PICKING_UP]: 0,
        [ShipmentStatus.IN_TRANSIT]: 0,
        [ShipmentStatus.DELIVERED]: 0,
        [ShipmentStatus.RETURNING]: 0,
        [ShipmentStatus.RETURNED]: 0,
        [ShipmentStatus.CANCELLED]: 0,
      });
      setCodStats({
        totalCod: 0,
        deliveredCod: 0,
        pendingCod: 0
      });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStatistics();
  }, []);

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path.replace('/', ''));
    } else {
      router.push(path);
    }
  };

  const handleRefresh = () => {
    fetchAllStatistics();
    message.success('Đã cập nhật dữ liệu');
  };

  // Calculate percentages
  const totalShipments = Object.values(shipmentStats || {}).reduce((sum, count) => sum + count, 0);
  const deliveredRate = totalShipments > 0 ? ((shipmentStats?.[ShipmentStatus.DELIVERED] || 0) / totalShipments * 100) : 0;
  const codCollectionRate = codStats.totalCod > 0 ? (codStats.deliveredCod / codStats.totalCod * 100) : 0;

  return (
    <App>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={2}>Quản lý vận đơn - Tổng quan</Title>
            <Paragraph type="secondary">
              Theo dõi và quản lý toàn bộ quy trình vận chuyển từ đơn hàng đến giao hàng
            </Paragraph>
          </div>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        {/* Quick Navigation Cards */}
        <Row gutter={16} className="mb-6">
          <Col span={24}>
            <Card 
              hoverable 
              className="cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 border-l-green-500"
              onClick={() => handleNavigation('/shipments/shipment-order')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <ShoppingOutlined className="text-2xl text-green-600" />
                  </div>
                  <div>
                    <Title level={4} className="mb-1">Shipment Order</Title>
                    <Text type="secondary">Quản lý vận đơn giao hàng</Text>
                    <div className="mt-2">
                      <Tag color="blue">{shipmentStats?.[ShipmentStatus.IN_TRANSIT] || 0} đang vận chuyển</Tag>
                      <Tag color="green">{shipmentStats?.[ShipmentStatus.DELIVERED] || 0} đã giao</Tag>
                    </div>
                  </div>
                </div>
                <RightOutlined className="text-gray-400" />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Key Performance Indicators */}
        <Row gutter={16} className="mb-6">
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng vận đơn"
                value={totalShipments}
                prefix={<CarOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div className="flex flex-col">
                <Text type="secondary" className="mb-2">Tỷ lệ giao thành công</Text>
                <div className="flex items-center">
                  <Progress 
                    percent={Math.round(deliveredRate)} 
                    size="small" 
                    className="flex-1 mr-2"
                    strokeColor="#52c41a"
                  />
                  <Text strong>{Math.round(deliveredRate)}%</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="COD thu được"
                value={codStats.deliveredCod}
                prefix={<DollarCircleOutlined />}
                formatter={(value) => `₫${Number(value).toLocaleString()}`}
                valueStyle={{ color: '#3f8600' }}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        {/* Shipment Status Overview */}
        <Card title="Trạng thái vận đơn" className="mb-6">
          <Row gutter={16}>
            <Col span={4}>
              <Statistic
                title="Chờ xử lý"
                value={shipmentStats?.[ShipmentStatus.PENDING] || 0}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
                loading={loading}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="Đang lấy hàng"
                value={shipmentStats?.[ShipmentStatus.PICKING_UP] || 0}
                valueStyle={{ color: '#13c2c2' }}
                prefix={<TruckOutlined />}
                loading={loading}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="Đang vận chuyển"
                value={shipmentStats?.[ShipmentStatus.IN_TRANSIT] || 0}
                valueStyle={{ color: '#1890ff' }}
                prefix={<CarOutlined />}
                loading={loading}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="Đã giao"
                value={shipmentStats?.[ShipmentStatus.DELIVERED] || 0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
                loading={loading}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="Đang hoàn trả"
                value={shipmentStats?.[ShipmentStatus.RETURNING] || 0}
                valueStyle={{ color: '#fa541c' }}
                prefix={<ExclamationCircleOutlined />}
                loading={loading}
              />
            </Col>
            <Col span={4}>
              <Statistic
                title="Đã hủy"
                value={shipmentStats?.[ShipmentStatus.CANCELLED] || 0}
                valueStyle={{ color: '#8c8c8c' }}
                loading={loading}
              />
            </Col>
          </Row>
        </Card>

        {/* Financial Overview */}
        <Row gutter={16} className="mb-6">
          <Col span={12}>
            <Card title="Thống kê COD" loading={loading}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Tổng COD"
                    value={codStats.totalCod}
                    formatter={(value) => `₫${Number(value).toLocaleString()}`}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Đã thu"
                    value={codStats.deliveredCod}
                    formatter={(value) => `₫${Number(value).toLocaleString()}`}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Chưa thu"
                    value={codStats.pendingCod}
                    formatter={(value) => `₫${Number(value).toLocaleString()}`}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
              </Row>
              <div className="mt-4">
                <Text type="secondary">Tỷ lệ thu COD: </Text>
                <Progress 
                  percent={Math.round(codCollectionRate)} 
                  strokeColor="#52c41a"
                  format={percent => `${percent}%`}
                />
              </div>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="Thống kê GHTK" loading={loading}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Tổng đơn GHTK"
                    value={ghtkStats.totalOrders}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Đã giao (GHTK)"
                    value={ghtkStats.deliveredOrders}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>
              <Row gutter={16} className="mt-4">
                <Col span={12}>
                  <Statistic
                    title="Phí vận chuyển"
                    value={ghtkStats.totalFee}
                    formatter={(value) => `₫${Number(value).toLocaleString()}`}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="COD (GHTK)"
                    value={ghtkStats.totalCod}
                    formatter={(value) => `₫${Number(value).toLocaleString()}`}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Card title="Thao tác nhanh">
          <Row gutter={16}>
            <Col span={8}>
              <Button 
                type="primary"
                block 
                size="large"
                icon={<ShoppingOutlined />}
                onClick={() => handleNavigation('/shipments/shipment-order')}
              >
                Tạo vận đơn mới
              </Button>
            </Col>
            <Col span={8}>
              <Button 
                block 
                size="large"
                icon={<TruckOutlined />}
                onClick={() => handleNavigation('/shipments/ghtk-management')}
              >
                Quản lý GHTK
              </Button>
            </Col>
            <Col span={8}>
              <Button 
                block 
                size="large"
                icon={<CarOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                Đồng bộ dữ liệu
              </Button>
            </Col>
          </Row>
        </Card>
      </div>
    </App>
  );
}
