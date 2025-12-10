'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Card, 
  Button, 
  Select, 
  Space, 
  DatePicker,
  Typography,
  Row,
  Col,
  Statistic,
  Table,
  Progress,
  Divider,
  Spin,
  App
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  BarChartOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  DownloadOutlined,
  PrinterOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import ShipmentReportService, { ShipmentReportSummary } from '@/services/ShipmentReportService';
import ShipmentOrderService, { DashboardStatistics } from '@/services/ShipmentOrderService';
import type { Dayjs } from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface ReportData {
  key: string;
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const { message } = App.useApp();
  const [reportType, setReportType] = useState<string>('overview');
  const [dateRange, setDateRange] = useState<string>('this_week');
  const [loading, setLoading] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  
  // Real data from API
  const [currentSummary, setCurrentSummary] = useState<ShipmentReportSummary | null>(null);
  const [previousSummary, setPreviousSummary] = useState<ShipmentReportSummary | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStatistics | null>(null);

  useEffect(() => {
    if (session?.user?.company?.companyId) {
      fetchReportData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, reportType, session]);

  const getDateRangeFromSelection = (): { start: string; end: string } => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);

    switch (dateRange) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'this_week':
        const dayOfWeek = now.getDay();
        start = new Date(now.setDate(now.getDate() - dayOfWeek));
        start.setHours(0, 0, 0, 0);
        end = new Date();
        break;
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'this_quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'custom':
        if (customDateRange && customDateRange[0] && customDateRange[1]) {
          start = customDateRange[0].toDate();
          end = customDateRange[1].toDate();
        } else {
          start = new Date(now.setDate(now.getDate() - 7));
          end = new Date();
        }
        break;
      default:
        start = new Date(now.setDate(now.getDate() - 7));
        end = new Date();
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const getPreviousPeriodDates = (current: { start: string; end: string }) => {
    const startDate = new Date(current.start);
    const endDate = new Date(current.end);
    const duration = endDate.getTime() - startDate.getTime();
    
    const prevEnd = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    const prevStart = new Date(prevEnd.getTime() - duration);

    return {
      start: prevStart.toISOString().split('T')[0],
      end: prevEnd.toISOString().split('T')[0]
    };
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const companyId = session?.user?.company?.companyId;
      if (!companyId) {
        message.error('Không tìm thấy thông tin công ty');
        setLoading(false);
        return;
      }

      const currentDates = getDateRangeFromSelection();
      const previousDates = getPreviousPeriodDates(currentDates);

      // Get current period summary for company
      const currentSum = await ShipmentReportService.getReportSummary(
        currentDates.start,
        currentDates.end,
        companyId
      );
      setCurrentSummary(currentSum);

      // Get previous period summary for comparison
      const previousSum = await ShipmentReportService.getReportSummary(
        previousDates.start,
        previousDates.end,
        companyId
      );
      setPreviousSummary(previousSum);

      // Fetch dashboard statistics based on selected date range
      try {
        const dashStats = await ShipmentOrderService.getDashboardStatistics(
          currentDates.start + 'T00:00:00',
          currentDates.end + 'T23:59:59'
        );
        setDashboardStats(dashStats);
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        setDashboardStats(null);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      message.error('Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const handleExportExcel = async () => {
    try {
      const dates = getDateRangeFromSelection();
      const blob = await ShipmentReportService.exportReportsToExcel(dates.start, dates.end);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bao-cao-${dates.start}-${dates.end}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('Xuất báo cáo Excel thành công');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      message.error('Không thể xuất báo cáo Excel');
    }
  };

  const handleGenerateReport = async () => {
    const companyId = session?.user?.company?.companyId;
    if (!companyId) {
      message.error('Không tìm thấy thông tin công ty');
      return;
    }

    const dates = getDateRangeFromSelection();
    try {
      await ShipmentReportService.generateReportForDate(companyId, dates.end);
      message.success('Tạo báo cáo thành công');
      fetchReportData();
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Không thể tạo báo cáo');
    }
  };

  // Overview data from real reports
  const overviewData: ReportData[] = currentSummary ? [
    {
      key: '1',
      metric: 'Tổng đơn hàng',
      current: currentSummary.totalOrdersSum,
      previous: previousSummary?.totalOrdersSum || 0,
      change: calculateChange(currentSummary.totalOrdersSum, previousSummary?.totalOrdersSum || 0),
      trend: calculateChange(currentSummary.totalOrdersSum, previousSummary?.totalOrdersSum || 0) > 0 ? 'up' : 'down',
      unit: 'đơn'
    },
    {
      key: '2', 
      metric: 'Đơn giao thành công',
      current: currentSummary.totalDeliveredSum,
      previous: previousSummary?.totalDeliveredSum || 0,
      change: calculateChange(currentSummary.totalDeliveredSum, previousSummary?.totalDeliveredSum || 0),
      trend: calculateChange(currentSummary.totalDeliveredSum, previousSummary?.totalDeliveredSum || 0) > 0 ? 'up' : 'down',
      unit: 'đơn'
    },
    {
      key: '3',
      metric: 'Tỷ lệ thành công',
      current: currentSummary.avgSuccessRate,
      previous: previousSummary?.avgSuccessRate || 0,
      change: currentSummary.avgSuccessRate - (previousSummary?.avgSuccessRate || 0),
      trend: (currentSummary.avgSuccessRate - (previousSummary?.avgSuccessRate || 0)) > 0 ? 'up' : 'down',
      unit: '%'
    },
    {
      key: '4',
      metric: 'Doanh thu COD',
      current: currentSummary.totalCodSum,
      previous: previousSummary?.totalCodSum || 0,
      change: calculateChange(currentSummary.totalCodSum, previousSummary?.totalCodSum || 0),
      trend: calculateChange(currentSummary.totalCodSum, previousSummary?.totalCodSum || 0) > 0 ? 'up' : 'down',
      unit: 'VND'
    },
    {
      key: '5',
      metric: 'Phí vận chuyển',
      current: currentSummary.totalShippingFeeSum,
      previous: previousSummary?.totalShippingFeeSum || 0,
      change: calculateChange(currentSummary.totalShippingFeeSum, previousSummary?.totalShippingFeeSum || 0),
      trend: calculateChange(currentSummary.totalShippingFeeSum, previousSummary?.totalShippingFeeSum || 0) > 0 ? 'up' : 'down',
      unit: 'VND'
    },
    {
      key: '6',
      metric: 'Tổng báo cáo',
      current: currentSummary.totalReports,
      previous: previousSummary?.totalReports || 0,
      change: calculateChange(currentSummary.totalReports, previousSummary?.totalReports || 0),
      trend: calculateChange(currentSummary.totalReports, previousSummary?.totalReports || 0) > 0 ? 'up' : 'down',
      unit: 'báo cáo'
    }
  ] : [];

  // Mock data for different report types
  interface ShipperPerformanceData {
    key: string;
    shipper: string;
    totalOrders: number;
    successfulOrders: number;
    successRate: number;
    avgDeliveryTime: number;
    rating: number;
  }

  const shipperPerformanceData: ShipperPerformanceData[] = [
    {
      key: '1',
      shipper: 'Nguyen Van A',
      totalOrders: 89,
      successfulOrders: 85,
      successRate: 95.5,
      avgDeliveryTime: 2.3,
      rating: 4.8
    },
    {
      key: '2',
      shipper: 'Tran Van B', 
      totalOrders: 76,
      successfulOrders: 71,
      successRate: 93.4,
      avgDeliveryTime: 2.6,
      rating: 4.6
    },
    {
      key: '3',
      shipper: 'Le Thi C',
      totalOrders: 68,
      successfulOrders: 67,
      successRate: 98.5,
      avgDeliveryTime: 1.9,
      rating: 4.9
    }
  ];

  interface WarehouseData {
    key: string;
    warehouse: string;
    totalIn: number;
    totalOut: number;
    currentStock: number;
    utilizationRate: number;
  }

  const warehouseData: WarehouseData[] = [
    {
      key: '1',
      warehouse: 'Kho Ha Noi Hub',
      totalIn: 2500,
      totalOut: 2350,
      currentStock: 7500,
      utilizationRate: 75.0
    },
    {
      key: '2',
      warehouse: 'Kho HCM Hub',
      totalIn: 3200,
      totalOut: 3000, 
      currentStock: 12000,
      utilizationRate: 80.0
    }
  ];

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
  };

  const formatNumber = (value: number): string => {
    return value.toLocaleString();
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <RiseOutlined className="text-green-500" /> : 
      <FallOutlined className="text-red-500" />;
  };

  const getTrendColor = (change: number): string => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const overviewColumns: ColumnsType<ReportData> = [
    {
      title: 'Chỉ số',
      dataIndex: 'metric',
      key: 'metric',
      width: 200,
    },
    {
      title: 'Kỳ hiện tại',
      dataIndex: 'current',
      key: 'current',
      width: 150,
      render: (value: number, record: ReportData) => {
        if (record.unit === 'VND') return formatCurrency(value || 0);
        if (record.unit === '%') return `${(value || 0).toFixed(2)}%`;
        return `${formatNumber(value || 0)} ${record.unit}`;
      }
    },
    {
      title: 'Kỳ trước',
      dataIndex: 'previous',
      key: 'previous',
      width: 150,
      render: (value: number, record: ReportData) => {
        if (record.unit === 'VND') return formatCurrency(value || 0);
        if (record.unit === '%') return `${(value || 0).toFixed(2)}%`;
        return `${formatNumber(value || 0)} ${record.unit}`;
      }
    },
    {
      title: 'Thay đổi',
      key: 'change',
      width: 120,
      render: (_: unknown, record: ReportData) => (
        <div className={`flex items-center ${getTrendColor(record.change)}`}>
          {getTrendIcon(record.trend)}
          <span className="ml-1">{Math.abs(record.change || 0).toFixed(1)}%</span>
        </div>
      )
    }
  ];

  const shipperColumns: ColumnsType<ShipperPerformanceData> = [
    {
      title: 'Shipper',
      dataIndex: 'shipper',
      key: 'shipper',
    },
    {
      title: 'Tổng đơn',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
    },
    {
      title: 'Đơn thành công',
      dataIndex: 'successfulOrders',
      key: 'successfulOrders',
    },
    {
      title: 'Tỷ lệ thành công',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate: number) => (
        <div>
          <span>{rate}%</span>
          <Progress percent={rate} showInfo={false} size="small" className="mt-1" />
        </div>
      )
    },
    {
      title: 'Thời gian giao TB',
      dataIndex: 'avgDeliveryTime',
      key: 'avgDeliveryTime',
      render: (time: number) => `${time} ngày`
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => `${rating}/5.0`
    }
  ];

  const warehouseColumns: ColumnsType<WarehouseData> = [
    {
      title: 'Kho',
      dataIndex: 'warehouse',
      key: 'warehouse',
    },
    {
      title: 'Nhập kho',
      dataIndex: 'totalIn',
      key: 'totalIn',
      render: (value: number) => formatNumber(value)
    },
    {
      title: 'Xuất kho',
      dataIndex: 'totalOut',
      key: 'totalOut', 
      render: (value: number) => formatNumber(value)
    },
    {
      title: 'Tồn kho hiện tại',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (value: number) => formatNumber(value)
    },
    {
      title: 'Tỷ lệ sử dụng',
      dataIndex: 'utilizationRate',
      key: 'utilizationRate',
      render: (rate: number) => (
        <div>
          <span>{rate}%</span>
          <Progress percent={rate} showInfo={false} size="small" className="mt-1" />
        </div>
      )
    }
  ];

  const renderReportContent = () => {
    return (
      <div>
        <Title level={4}>Báo cáo tổng quan</Title>
        <Table 
          columns={overviewColumns}
          dataSource={overviewData}
          pagination={false}
          size="middle"
        />
      </div>
    );
  };

  return (
    <Spin spinning={loading} tip="Đang tải dữ liệu...">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Báo cáo & Thống kê - {session?.user?.company?.companyName}</Title>
        <Space>
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>In báo cáo</Button>
          <Button icon={<FileExcelOutlined />} type="primary" onClick={handleExportExcel}>
            Xuất Excel
          </Button>
          <Button icon={<FilePdfOutlined />} disabled>Xuất PDF</Button>
        </Space>
      </div>

      {/* Quick Stats Overview */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng (tuần này)"
              value={currentSummary?.totalOrdersSum || 0}
              prefix={<BarChartOutlined />}
              suffix={
                <span className={calculateChange(currentSummary?.totalOrdersSum || 0, previousSummary?.totalOrdersSum || 0) >= 0 ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                  {calculateChange(currentSummary?.totalOrdersSum || 0, previousSummary?.totalOrdersSum || 0) >= 0 ? '+' : ''}
                  {calculateChange(currentSummary?.totalOrdersSum || 0, previousSummary?.totalOrdersSum || 0).toFixed(1)}% ↗
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Doanh thu COD"
              value={currentSummary?.totalCodSum || 0}
              formatter={(value) => formatCurrency(Number(value))}
              suffix={
                <span className={calculateChange(currentSummary?.totalCodSum || 0, previousSummary?.totalCodSum || 0) >= 0 ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                  {calculateChange(currentSummary?.totalCodSum || 0, previousSummary?.totalCodSum || 0) >= 0 ? '+' : ''}
                  {calculateChange(currentSummary?.totalCodSum || 0, previousSummary?.totalCodSum || 0).toFixed(1)}% ↗
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tỷ lệ giao thành công"
              value={currentSummary?.avgSuccessRate || 0}
              suffix={
                <span>
                  % <span className={((currentSummary?.avgSuccessRate || 0) - (previousSummary?.avgSuccessRate || 0)) >= 0 ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                    {((currentSummary?.avgSuccessRate || 0) - (previousSummary?.avgSuccessRate || 0)) >= 0 ? '+' : ''}
                    {((currentSummary?.avgSuccessRate || 0) - (previousSummary?.avgSuccessRate || 0)).toFixed(1)}% ↗
                  </span>
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Shipper hoạt động"
              value={dashboardStats?.activeShippers || 0}
              suffix={
                <span className="text-blue-600 text-sm">
                  {dashboardStats?.totalDeliveredOrders || 0} đơn giao
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Report Filters */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col>
            <span className="font-medium">Thời gian:</span>
          </Col>
          <Col>
            <Select
              value={dateRange}
              onChange={setDateRange}
              style={{ width: 150 }}
            >
              <Select.Option value="today">Hôm nay</Select.Option>
              <Select.Option value="this_week">Tuần này</Select.Option>
              <Select.Option value="this_month">Tháng này</Select.Option>
              <Select.Option value="this_quarter">Quý này</Select.Option>
              <Select.Option value="custom">Tùy chỉnh</Select.Option>
            </Select>
          </Col>
          <Col>
            <RangePicker 
              value={customDateRange}
              onChange={(dates) => {
                setCustomDateRange(dates);
                if (dates) {
                  setDateRange('custom');
                }
              }}
              disabled={dateRange !== 'custom'}
              allowEmpty={[true, true]}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleGenerateReport}>
              Tạo báo cáo
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Report Content */}
      <Card>
        {renderReportContent()}
        
        <Divider />
        
        {/* Export Options */}
      
      </Card>
    </div>
    </Spin>
  );
}