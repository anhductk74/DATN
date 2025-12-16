'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Tabs,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Table,
  Spin,
  Button,
  App,
  Avatar,
  Space
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  CarOutlined,
  CheckCircleOutlined,
  StopOutlined,
  DollarOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { shipperApiService, ShipperResponseDto } from '@/services/ShipperApiService';
import ShipmentOrderService, { ShipmentOrderResponseDto, ShipmentStatus } from '@/services/ShipmentOrderService';
import shipperTransactionApiService, { ShipperTransactionResponseDto, TransactionType } from '@/services/ShipperTransactionApiService';

// Removed deprecated TabPane import

export default function ShipperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const shipperId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [shipper, setShipper] = useState<ShipperResponseDto | null>(null);
  const [orders, setOrders] = useState<ShipmentOrderResponseDto[]>([]);
  const [transactions, setTransactions] = useState<ShipperTransactionResponseDto[]>([]);
  const [deliveryStats, setDeliveryStats] = useState({
    totalDeliveries: 0,
    successfulDeliveries: 0,
    failedDeliveries: 0,
    successRate: 0
  });
  const [revenueSummary, setRevenueSummary] = useState({
    totalCollected: 0,
    totalBonus: 0,
    totalPaid: 0,
    netIncome: 0,
    codBalance: 0
  });

  useEffect(() => {
    if (shipperId) {
      fetchShipperDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipperId]);

  // Refetch when window gains focus (e.g., coming back from list page)
  useEffect(() => {
    const handleFocus = () => {
      if (shipperId) {
        fetchShipperDetails();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipperId]);

  const fetchShipperDetails = async () => {
    setLoading(true);
    try {
      // Fetch shipper info
      const shipperData = await shipperApiService.getShipperById(shipperId);
      setShipper(shipperData);

      // Fetch delivery stats
      try {
        const stats = await shipperApiService.getShipperDeliveryStats(shipperId);
        setDeliveryStats(stats);
      } catch (error) {
        console.error('Error fetching delivery stats:', error);
        // Keep default values if API fails
      }

      // Fetch all orders - using the correct endpoint
      try {
        const ordersData = await ShipmentOrderService.getAllOrdersOfShipper(shipperId);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
        message.warning('Không thể tải danh sách đơn hàng');
      }

      // Fetch transactions
      try {
        const transactionsData = await shipperTransactionApiService.getTransactionsByShipper(shipperId);
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        message.warning('Không thể tải lịch sử giao dịch');
      }

      // Fetch revenue summary
      try {
        const revenue = await shipperTransactionApiService.getRevenueSummary(shipperId);
        setRevenueSummary(revenue);
      } catch (error) {
        console.error('Error fetching revenue summary:', error);
        message.warning('Không thể tải thông tin doanh thu');
      }
    } catch (error) {
      console.error('Error fetching shipper details:', error);
      message.error('Không thể tải thông tin shipper');
    } finally {
      setLoading(false);
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type?.toLowerCase()) {
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
      case 'bicycle':
      case 'xe đạp':
        return '🚲';
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

  const formatStatus = (status: ShipmentStatus): string => {
    const statusMap: Record<ShipmentStatus, string> = {
      [ShipmentStatus.PENDING]: 'Chờ xử lý',
      [ShipmentStatus.PICKING_UP]: 'Đang lấy hàng',
      [ShipmentStatus.IN_TRANSIT]: 'Đang vận chuyển',
      [ShipmentStatus.DELIVERED]: 'Đã giao hàng',
      [ShipmentStatus.RETURNING]: 'Đang hoàn trả',
      [ShipmentStatus.RETURNED]: 'Đã hoàn trả',
      [ShipmentStatus.CANCELLED]: 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: ShipmentStatus): string => {
    const colorMap: Record<ShipmentStatus, string> = {
      [ShipmentStatus.PENDING]: 'blue',
      [ShipmentStatus.PICKING_UP]: 'cyan',
      [ShipmentStatus.IN_TRANSIT]: 'orange',
      [ShipmentStatus.DELIVERED]: 'green',
      [ShipmentStatus.RETURNING]: 'volcano',
      [ShipmentStatus.RETURNED]: 'red',
      [ShipmentStatus.CANCELLED]: 'default',
    };
    return colorMap[status] || 'default';
  };

  const formatTransactionType = (type: TransactionType): string => {
    const typeMap: Record<TransactionType, string> = {
      [TransactionType.DELIVERY_FEE]: 'Phí giao hàng',
      [TransactionType.COD_COLLECTION]: 'Thu COD',
      [TransactionType.BONUS]: 'Thưởng',
      [TransactionType.PENALTY]: 'Phạt',
      [TransactionType.FUEL_ALLOWANCE]: 'Phụ cấp xăng',
      [TransactionType.OVERTIME]: 'Tăng ca',
      [TransactionType.DEDUCTION]: 'Khấu trừ',
    };
    return typeMap[type] || type;
  };

  const getTransactionColor = (type: TransactionType): string => {
    if ([TransactionType.DELIVERY_FEE, TransactionType.BONUS, TransactionType.FUEL_ALLOWANCE, TransactionType.OVERTIME].includes(type)) {
      return 'green';
    }
    if ([TransactionType.PENALTY, TransactionType.DEDUCTION].includes(type)) {
      return 'red';
    }
    return 'blue';
  };

  const orderColumns: ColumnsType<ShipmentOrderResponseDto> = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderCode',
      key: 'orderCode',
      width: 120,
      render: (text: string) => <span className="font-mono text-blue-600">{text}</span>
    },
    {
      title: 'Tracking Code',
      dataIndex: 'trackingCode',
      key: 'trackingCode',
      width: 150,
    },
    {
      title: 'Địa chỉ giao',
      dataIndex: 'deliveryAddress',
      key: 'deliveryAddress',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Người nhận',
      key: 'recipient',
      width: 150,
      render: (_: any, record: ShipmentOrderResponseDto) => (
        <div>
          <div>{record.recipientName}</div>
          <div className="text-xs text-gray-500">{record.recipientPhone}</div>
        </div>
      )
    },
    {
      title: 'COD',
      dataIndex: 'codAmount',
      key: 'codAmount',
      width: 120,
      render: (amount: number) => (
        <span className="font-medium">{amount.toLocaleString('vi-VN')} ₫</span>
      )
    },
    {
      title: 'Phí ship',
      dataIndex: 'shippingFee',
      key: 'shippingFee',
      width: 100,
      render: (fee: number) => (
        <span>{fee.toLocaleString('vi-VN')} ₫</span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: ShipmentStatus) => (
        <Tag color={getStatusColor(status)}>
          {formatStatus(status)}
        </Tag>
      )
    },
    {
      title: 'Dự kiến giao',
      dataIndex: 'estimatedDelivery',
      key: 'estimatedDelivery',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    }
  ];

  const transactionColumns: ColumnsType<ShipperTransactionResponseDto> = [
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 150,
      render: (type: TransactionType) => (
        <Tag color={getTransactionColor(type)}>
          {formatTransactionType(type)}
        </Tag>
      )
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'shipmentOrderCode',
      key: 'shipmentOrderCode',
      width: 120,
      render: (text: string) => <span className="font-mono text-blue-600">{text}</span>
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number, record: ShipperTransactionResponseDto) => {
        const isIncome = [TransactionType.DELIVERY_FEE, TransactionType.BONUS, TransactionType.FUEL_ALLOWANCE, TransactionType.OVERTIME].includes(record.transactionType);
        return (
          <span className={`font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
            {isIncome ? '+' : '-'}{amount.toLocaleString('vi-VN')} ₫
          </span>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải thông tin shipper..." />
      </div>
    );
  }

  if (!shipper) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-10">
            <p className="text-gray-500">Không tìm thấy thông tin shipper</p>
            <Button type="primary" onClick={() => router.push('/shippers')} className="mt-4">
              Quay lại danh sách
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push('/shippers')}
          className="mb-4"
        >
          Quay lại
        </Button>
        <Card>
          <div className="flex items-start gap-4">
            <Avatar size={80} icon={<UserOutlined />} />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{shipper.fullName}</h2>
              <Space size={[0, 8]} wrap>
                <Tag color={shipperApiService.getStatusColor(shipper.status)}>
                  {shipperApiService.formatStatus(shipper.status)}
                </Tag>
                <span className="text-gray-600">
                  {getVehicleIcon(shipper.vehicleType)} {getVehicleText(shipper.vehicleType)} - {shipper.licensePlate}
                </span>
              </Space>
              <div className="mt-2 text-gray-600">
                <div>🧑 {shipper.username}</div>
                <div>📞 {shipper.phoneNumber}</div>
                <div>🏢 {shipper.shippingCompanyName}</div>
                {shipper.operationalCommune && shipper.operationalDistrict && shipper.operationalCity ? (
                  <div>📍 {shipper.operationalCommune}, {shipper.operationalDistrict}, {shipper.operationalCity}</div>
                ) : (
                  <div>📍 {shipper.region}</div>
                )}
                {shipper.maxDeliveryRadius && (
                  <div className="text-blue-600">🎯 Bán kính: {shipper.maxDeliveryRadius}km</div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs 
          defaultActiveKey="overview"
          items={[
            {
              key: 'overview',
              label: 'Tổng quan',
              children: (
                <>
            <Row gutter={16} className="mb-6">
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Tổng đơn hàng"
                    value={deliveryStats.totalDeliveries}
                    prefix={<ShoppingOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Giao thành công"
                    value={deliveryStats.successfulDeliveries}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Thất bại"
                    value={deliveryStats.failedDeliveries}
                    prefix={<StopOutlined />}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Tỷ lệ thành công"
                    value={deliveryStats.successRate.toFixed(1)}
                    suffix="%"
                    valueStyle={{ 
                      color: deliveryStats.successRate >= 90 ? '#52c41a' : 
                             deliveryStats.successRate >= 70 ? '#faad14' : '#cf1322' 
                    }}
                  />
                </Card>
              </Col>
            </Row>

            <Card title="Thông tin chi tiết" className="mb-4">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Shipper ID">{shipper.id}</Descriptions.Item>
                <Descriptions.Item label="Username">{shipper.username}</Descriptions.Item>
                <Descriptions.Item label="Họ và tên">{shipper.fullName}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{shipper.phoneNumber}</Descriptions.Item>
                <Descriptions.Item label="Công ty vận chuyển">{shipper.shippingCompanyName}</Descriptions.Item>
                <Descriptions.Item label="Loại phương tiện">
                  {getVehicleIcon(shipper.vehicleType)} {getVehicleText(shipper.vehicleType)}
                </Descriptions.Item>
                <Descriptions.Item label="Biển số xe">{shipper.licensePlate}</Descriptions.Item>
                {shipper.vehicleBrand && (
                  <Descriptions.Item label="Hãng xe">{shipper.vehicleBrand}</Descriptions.Item>
                )}
                {shipper.vehicleColor && (
                  <Descriptions.Item label="Màu xe">{shipper.vehicleColor}</Descriptions.Item>
                )}
                <Descriptions.Item label="Khu vực hoạt động" span={2}>
                  {shipper.operationalCommune && shipper.operationalDistrict && shipper.operationalCity ? (
                    <div>
                      <div className="font-medium text-blue-600">
                        {shipper.operationalCommune}, {shipper.operationalDistrict}, {shipper.operationalCity}
                      </div>
                      {shipper.maxDeliveryRadius && (
                        <div className="text-gray-500 text-sm mt-1">
                          📍 Bán kính giao hàng tối đa: {shipper.maxDeliveryRadius} km
                        </div>
                      )}
                    </div>
                  ) : (
                    <span>{shipper.region || 'Chưa cập nhật'}</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={shipperApiService.getStatusColor(shipper.status)}>
                    {shipperApiService.formatStatus(shipper.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Vị trí" span={2}>
                  {shipper.latitude && shipper.longitude ? (
                    `📍 ${shipper.latitude.toFixed(6)}, ${shipper.longitude.toFixed(6)}`
                  ) : (
                    <span className="text-gray-400">Chưa cập nhật</span>
                  )}
                </Descriptions.Item>
                {shipper.createdAt && (
                  <Descriptions.Item label="Ngày tạo" span={2}>
                    {new Date(shipper.createdAt).toLocaleString('vi-VN')}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
                </>
              )
            },
            {
              key: 'orders',
              label: `Danh sách đơn (${orders.length})`,
              children: (
            <Table
              columns={orderColumns}
              dataSource={orders}
              rowKey="id"
              scroll={{ x: 1200 }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} đơn hàng`
              }}
            />
              )
            },
            {
              key: 'revenue',
              label: 'Doanh thu',
              children: (
                <>
            <Row gutter={16} className="mb-6" justify="space-between">
              <Col flex="1">
                <Card size="small">
                  <Statistic
                    title="Tiền COD thu từ khách"
                    value={revenueSummary.totalCollected}
                    prefix={<DollarOutlined />}
                    suffix="₫"
                    valueStyle={{ color: '#3f8600', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col flex="1">
                <Card size="small">
                  <Statistic
                    title="Tiền thưởng được hưởng"
                    value={revenueSummary.totalBonus}
                    prefix={<DollarOutlined />}
                    suffix="₫"
                    valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col flex="1">
                <Card size="small">
                  <Statistic
                    title="Tiền đã nộp công ty"
                    value={revenueSummary.totalPaid}
                    prefix={<DollarOutlined />}
                    suffix="₫"
                    valueStyle={{ color: '#cf1322', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col flex="1">
                <Card size="small">
                  <Statistic
                    title="Thu nhập thực nhận"
                    value={revenueSummary.netIncome}
                    prefix={<DollarOutlined />}
                    suffix="₫"
                    valueStyle={{ 
                      color: revenueSummary.netIncome >= 0 ? '#3f8600' : '#cf1322',
                      fontSize: '18px'
                    }}
                  />
                </Card>
              </Col>
              <Col flex="1">
                <Card size="small">
                  <Statistic
                    title="COD còn giữ chưa nộp"
                    value={revenueSummary.codBalance}
                    prefix={<DollarOutlined />}
                    suffix="₫"
                    valueStyle={{ color: '#fa8c16', fontSize: '18px' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card title={`Lịch sử giao dịch (${transactions.length})`}>
              <Table
                columns={transactionColumns}
                dataSource={transactions}
                rowKey="id"
                scroll={{ x: 800 }}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} của ${total} giao dịch`
                }}
              />
            </Card>
                </>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
}
