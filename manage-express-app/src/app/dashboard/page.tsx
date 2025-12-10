'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Card, 
  Button, 
  DatePicker, 
  Space, 
  Alert, 
  Spin,
  Select,
  Progress,
  Typography,
  Divider
} from 'antd';
import { 
  ShoppingOutlined, 
  CarOutlined, 
  DollarOutlined, 
  TeamOutlined,
  RiseOutlined,
  ReloadOutlined,
  TrophyOutlined,
  LineChartOutlined,
  BankOutlined,
  FireOutlined,
  ThunderboltOutlined,
  StarOutlined,
  CrownOutlined,
  GiftOutlined
} from '@ant-design/icons';
import { 
  dashboardService, 
  DashboardResponseDto, 
  DashboardSummaryDto,
  DashboardChartPointDto,
  TopShipperDto
} from '@/services';
import { useAntdApp } from '@/hooks/useAntdApp';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// ==================== COMPONENT DEFINITIONS ====================

// Summary Section Component
const SummarySection = ({ summary }: { summary: DashboardSummaryDto }) => {
  const summaryStats = dashboardService.getSummaryStats(summary);

  const metrics = [
    {
      title: 'Tổng đơn hàng',
      value: summary.totalShipmentOrders,
      icon: ShoppingOutlined,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      formatter: (v: number) => dashboardService.formatNumber(v)
    },
    {
      title: 'Shipper hoạt động',
      value: summary.totalShippers,
      icon: TeamOutlined,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      formatter: (v: number) => dashboardService.formatNumber(v)
    },
    {
      title: 'Tổng COD thu',
      value: summary.totalCodCollected,
      icon: DollarOutlined,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      textColor: 'text-green-600',
      formatter: (v: number) => dashboardService.formatCurrency(v)
    },
    {
      title: 'COD chưa nộp',
      value: summary.totalCodRemaining,
      icon: CarOutlined,
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      textColor: 'text-red-600',
      formatter: (v: number) => dashboardService.formatCurrency(v)
    },
    {
      title: 'COD đã nộp',
      value: summary.totalCodDeposited,
      icon: BankOutlined,
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      textColor: 'text-indigo-600',
      formatter: (v: number) => dashboardService.formatCurrency(v)
    },
    {
      title: 'Tổng thưởng',
      value: summary.totalBonus,
      icon: GiftOutlined,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
      formatter: (v: number) => dashboardService.formatCurrency(v)
    },
    {
      title: 'Phí vận chuyển',
      value: summary.totalShippingFee,
      icon: RiseOutlined,
      color: 'bg-gradient-to-r from-teal-500 to-teal-600',
      textColor: 'text-teal-600',
      formatter: (v: number) => dashboardService.formatCurrency(v)
    },
    {
      title: 'Giá trị TB/đơn',
      value: summaryStats.averageOrderValue,
      icon: LineChartOutlined,
      color: 'bg-gradient-to-r from-pink-500 to-pink-600',
      textColor: 'text-pink-600',
      formatter: (v: number) => dashboardService.formatCurrency(v)
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <Card key={index} className="shadow-sm hover:shadow-md transition-all duration-200 border-0 rounded-lg overflow-hidden">
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${metric.color}`}>
                  <IconComponent className="text-white text-base" />
                </div>
                <div className="text-right">
                  <Text className="text-gray-500 text-xs block mb-1">{metric.title}</Text>
                  <Text className={`text-lg font-bold ${metric.textColor}`}>
                    {metric.formatter(metric.value)}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// COD Performance Section
const CodPerformanceSection = ({ summary }: { summary: DashboardSummaryDto }) => {
  const summaryStats = dashboardService.getSummaryStats(summary);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
      <Card className="shadow-sm rounded-lg border-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Title level={5} className="m-0 flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <DollarOutlined className="text-green-600 text-sm" />
              </div>
              <span className="text-sm">Tỷ lệ thu COD</span>
            </Title>
            <Text className="text-lg font-bold text-green-600">
              {dashboardService.formatPercentage(summaryStats.collectionRate)}
            </Text>
          </div>
          <Progress 
            percent={summaryStats.collectionRate} 
            strokeColor="#10b981"
            size="default"
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>Đã nộp: {dashboardService.formatCurrency(summary.totalCodDeposited)}</span>
            <span>Còn lại: {dashboardService.formatCurrency(summary.totalCodRemaining)}</span>
          </div>
        </div>
      </Card>

      <Card className="shadow-sm rounded-lg border-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Title level={5} className="m-0 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <ThunderboltOutlined className="text-blue-600 text-sm" />
              </div>
              <span className="text-sm">Hiệu suất hoạt động</span>
            </Title>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1 text-xs">
                <Text>COD đã thu</Text>
                <Text className="font-semibold text-blue-600">
                  {dashboardService.formatCurrency(summary.totalCodCollected)}
                </Text>
              </div>
              <Progress percent={100} size="small" strokeColor="#3b82f6" />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-xs">
                <Text>COD đã nộp</Text>
                <Text className="font-semibold text-green-600">
                  {dashboardService.formatCurrency(summary.totalCodDeposited)}
                </Text>
              </div>
              <Progress percent={summaryStats.collectionRate} size="small" strokeColor="#10b981" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Chart Section Component
const ChartSection = ({ chartData }: { chartData: DashboardChartPointDto[] }) => {
  return (
    <Card className="shadow-sm rounded-lg border-0 mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Title level={5} className="m-0 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <LineChartOutlined className="text-blue-600 text-sm" />
            </div>
            <span className="text-sm">Biểu đồ COD theo ngày</span>
          </Title>
        </div>
        
        <div className="grid gap-2">
          {chartData.map((point, index) => {
            const maxValue = Math.max(...chartData.map(p => Math.max(p.codCollected, p.codDeposited, p.balance)));
            const collectedWidth = (point.codCollected / maxValue) * 100;
            const depositedWidth = (point.codDeposited / maxValue) * 100;
            const balanceWidth = (point.balance / maxValue) * 100;

            return (
              <div key={point.date} className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Text className="font-medium text-xs">{dashboardService.formatChartDate(point.date)}</Text>
                  <div className="flex gap-2 text-xs">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {dashboardService.formatCurrency(point.codCollected)}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {dashboardService.formatCurrency(point.codDeposited)}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      {dashboardService.formatCurrency(point.balance)}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex gap-1 h-1.5">
                    <div className="bg-green-500 rounded-full" style={{ width: `${collectedWidth}%` }}></div>
                  </div>
                  <div className="flex gap-1 h-1.5">
                    <div className="bg-blue-500 rounded-full" style={{ width: `${depositedWidth}%` }}></div>
                  </div>
                  <div className="flex gap-1 h-1.5">
                    <div className="bg-purple-500 rounded-full" style={{ width: `${balanceWidth}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

// Top Shippers Component
const TopShippersSection = ({ topShippers }: { topShippers: TopShipperDto[] }) => {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <CrownOutlined className="text-yellow-500 text-lg" />;
      case 1: return <StarOutlined className="text-gray-400 text-lg" />;
      case 2: return <FireOutlined className="text-orange-500 text-lg" />;
      default: return <TeamOutlined className="text-gray-500 text-lg" />;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
      case 1: return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 2: return 'bg-gradient-to-r from-orange-400 to-orange-500';
      default: return 'bg-gradient-to-r from-blue-400 to-blue-500';
    }
  };

  return (
    <Card className="shadow-sm rounded-lg border-0 mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Title level={5} className="m-0 flex items-center gap-2">
            <div className="p-1.5 bg-yellow-100 rounded-lg">
              <TrophyOutlined className="text-yellow-600 text-sm" />
            </div>
            <span className="text-sm">Top Shipper</span>
          </Title>
        </div>
        
        <div className="grid gap-2">
          {topShippers.map((shipper, index) => (
            <div key={shipper.shipperName} className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-all duration-200">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full ${getRankColor(index)} flex items-center justify-center text-white text-xs font-bold`}>
                  #{index + 1}
                </div>
                <div className="flex items-center gap-1">
                  {getRankIcon(index)}
                  <Text className="font-semibold text-sm">{shipper.shipperName}</Text>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600">
                  <span className="font-semibold text-green-600">{dashboardService.formatCurrency(shipper.totalCod)}</span>
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-semibold text-blue-600">{dashboardService.formatCurrency(shipper.totalBalance)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// COD Overview Component
const CodOverviewSection = ({ summary }: { summary: DashboardSummaryDto }) => {
  return (
    <Card className="shadow-sm rounded-lg border-0">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Title level={5} className="m-0 flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <DollarOutlined className="text-green-600 text-sm" />
            </div>
            <span className="text-sm">Thu COD</span>
          </Title>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <Text>Tổng thu COD</Text>
            </div>
            <Text className="font-bold text-green-600 text-lg">
              {dashboardService.formatCurrency(summary.totalCodCollected)}
            </Text>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <Text className="text-xs">Đã nộp</Text>
            </div>
            <Text className="font-bold text-blue-600 text-sm">
              {dashboardService.formatCurrency(summary.totalCodDeposited)}
            </Text>
          </div>
          
          <Divider className="my-2" />
          
          <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <Text className="font-semibold text-xs">Còn lại</Text>
            </div>
            <Text className="font-bold text-red-600 text-base">
              {dashboardService.formatCurrency(summary.totalCodRemaining)}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Operational Stats Component
const OperationalStatsSection = ({ summary }: { summary: DashboardSummaryDto }) => {
  const summaryStats = dashboardService.getSummaryStats(summary);

  return (
    <Card className="shadow-sm rounded-lg border-0">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Title level={5} className="m-0 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <RiseOutlined className="text-blue-600 text-sm" />
            </div>
            <span className="text-sm">Hoạt động</span>
          </Title>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TeamOutlined className="text-purple-600 text-xs" />
              <Text className="text-xs">Shipper</Text>
            </div>
            <Text className="font-bold text-purple-600 text-sm">
              {dashboardService.formatNumber(summary.totalShippers)}
            </Text>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-indigo-50 rounded-lg">
            <div className="flex items-center gap-2">
              <ShoppingOutlined className="text-indigo-600 text-xs" />
              <Text className="text-xs">Đơn hàng</Text>
            </div>
            <Text className="font-bold text-indigo-600 text-sm">
              {dashboardService.formatNumber(summary.totalShipmentOrders)}
            </Text>
          </div>
          
          <Divider className="my-2" />
          
          <div className="flex justify-between items-center p-2 bg-teal-50 rounded-lg">
            <div className="flex items-center gap-2">
              <LineChartOutlined className="text-teal-600 text-xs" />
              <Text className="font-semibold text-xs">TB/đơn</Text>
            </div>
            <Text className="font-bold text-teal-600 text-base">
              {dashboardService.formatCurrency(summaryStats.averageOrderValue)}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ==================== MAIN COMPONENT ====================

export default function DashboardPage() {
  const { data: session } = useSession();
  const { message } = useAntdApp();
  
  // State management
  const [loading, setLoading] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<DashboardResponseDto | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<[string, string] | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('today');

  // Initialize with today's data
  useEffect(() => {
    if (session?.user?.company?.companyId) {
      fetchDashboardData();
    }
  }, [session]);

  // Fetch dashboard data
  const fetchDashboardData = async (fromDate?: string, toDate?: string) => {
    try {
      const companyId = session?.user?.company?.companyId;
      if (!companyId) {
        message.error('Không tìm thấy thông tin công ty');
        return;
      }

      setLoading(true);
      let data: DashboardResponseDto;
      
      if (fromDate && toDate) {
        data = await dashboardService.getDashboard(fromDate, toDate, companyId);
      } else {
        data = await dashboardService.getTodayDashboard(companyId);
      }
      
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Handle date range change
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      const startDate = dates[0].format('YYYY-MM-DD');
      const endDate = dates[1].format('YYYY-MM-DD');
      setSelectedDateRange([startDate, endDate]);
      fetchDashboardData(startDate, endDate);
      setSelectedPeriod('custom');
    } else {
      setSelectedDateRange(null);
      fetchDashboardData();
      setSelectedPeriod('today');
    }
  };

  // Handle quick period selection
  const handlePeriodChange = async (period: string) => {
    try {
      const companyId = session?.user?.company?.companyId;
      if (!companyId) {
        message.error('Không tìm thấy thông tin công ty');
        return;
      }

      setLoading(true);
      setSelectedPeriod(period);
      let data: DashboardResponseDto;
      
      switch (period) {
        case 'today':
          data = await dashboardService.getTodayDashboard(companyId);
          setSelectedDateRange(null);
          break;
        case 'week':
          data = await dashboardService.getWeeklyDashboard(companyId);
          const weekRange = dashboardService.getWeekDateRange();
          setSelectedDateRange([weekRange.start, weekRange.end]);
          break;
        case 'month':
          data = await dashboardService.getCurrentMonthDashboard(companyId);
          const monthRange = dashboardService.getMonthDateRange();
          setSelectedDateRange([monthRange.start, monthRange.end]);
          break;
        default:
          data = await dashboardService.getTodayDashboard(companyId);
      }
      
      setDashboardData(data);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      if (selectedDateRange) {
        await fetchDashboardData(selectedDateRange[0], selectedDateRange[1]);
      } else {
        await fetchDashboardData();
      }
      message.success('Dữ liệu đã được cập nhật');
    } catch (error) {
      message.error('Không thể cập nhật dữ liệu');
    } finally {
      setRefreshing(false);
    }
  };

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  const { summary, chart, topShippers } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-6 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <Title level={3} className="m-0 text-gray-900">
                🚚 Logistics Dashboard - {session?.user?.company?.companyName}
              </Title>
              <Text className="text-gray-600 text-xs mt-0.5">
                Tổng quan hệ thống vận chuyển và COD
              </Text>
            </div>
            
            <Space size="middle" className="flex-wrap">
              <Select 
                value={selectedPeriod} 
                onChange={handlePeriodChange}
                style={{ width: 140 }}
                className="rounded-lg"
              >
                <Option value="today">📅 Hôm nay</Option>
                <Option value="week">📈 7 ngày</Option>
                <Option value="month">📊 Tháng này</Option>
              </Select>
              
              <RangePicker
                value={selectedDateRange ? [dayjs(selectedDateRange[0]), dayjs(selectedDateRange[1])] : null}
                onChange={handleDateRangeChange}
                format="YYYY-MM-DD"
                className="rounded-lg"
              />
              
              <Button 
                type="primary"
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                loading={refreshing}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 border-0"
              >
                Làm mới
              </Button>
            </Space>
          </div>
          
          {selectedDateRange && (
            <Alert
              message={`📊 Dữ liệu từ ${dashboardService.formatDate(selectedDateRange[0])} đến ${dashboardService.formatDate(selectedDateRange[1])}`}
              type="info"
              showIcon
              className="mt-2 rounded-lg text-xs"
            />
          )}
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-8xl mx-auto px-8 py-4">
        <Spin spinning={loading}>
          {/* Section 1: Summary Metrics Grid */}
          <SummarySection summary={summary} />
          
          {/* Section 2: COD Performance */}
          <CodPerformanceSection summary={summary} />
          
          {/* Section 3: Charts and Top Shippers */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mb-4">
            <div className="xl:col-span-2">
              <ChartSection chartData={chart} />
            </div>
            <div className="xl:col-span-1">
              <TopShippersSection topShippers={topShippers} />
            </div>
          </div>
          
          {/* Section 4: Footer Details - COD Overview, Bonus & Fees, Operational Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <CodOverviewSection summary={summary} />
            
            <Card className="shadow-sm rounded-lg border-0">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Title level={5} className="m-0 flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                      <GiftOutlined className="text-orange-600 text-sm" />
                    </div>
                    <span className="text-sm">Thưởng & Phí</span>
                  </Title>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrophyOutlined className="text-orange-600 text-xs" />
                      <Text className="text-xs">Thưởng</Text>
                    </div>
                    <Text className="font-bold text-orange-600 text-sm">
                      {dashboardService.formatCurrency(summary.totalBonus)}
                    </Text>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-teal-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <RiseOutlined className="text-teal-600 text-xs" />
                      <Text className="text-xs">Phí VC</Text>
                    </div>
                    <Text className="font-bold text-teal-600 text-sm">
                      {dashboardService.formatCurrency(summary.totalShippingFee)}
                    </Text>
                  </div>
                  
                  <Divider className="my-2" />
                  
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <LineChartOutlined className="text-purple-600 text-xs" />
                      <Text className="font-semibold text-xs">Tỷ lệ</Text>
                    </div>
                    <Text className="font-bold text-purple-600 text-base">
                      {dashboardService.formatPercentage(dashboardService.getSummaryStats(summary).bonusRate)}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
            
            <OperationalStatsSection summary={summary} />
          </div>
        </Spin>
      </div>
    </div>
  );
}