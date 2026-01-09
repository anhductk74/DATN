import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Spin, 
  Alert, 
  List, 
  Avatar,
  Tag,
  Space,
  Progress,
  DatePicker,
  Button
} from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  ShopOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ShoppingOutlined,
  StarOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { useDashboardOverview, useTopShops, useRecentActivities } from '../../hooks/useDashboard';
import { getCloudinaryUrl } from '../../config/config';
import type { DateRangeParams } from '../../services/dashboard.service';
import './Dashboard.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRangeParams>();
  const [selectedDates, setSelectedDates] = useState<[Dayjs, Dayjs] | null>(null);

  const { data: overview, isLoading, error, refetch: refetchOverview } = useDashboardOverview(dateRange, false);
  const { data: topShops, isLoading: shopsLoading, refetch: refetchShops } = useTopShops(5, dateRange);
  const { data: activities, isLoading: activitiesLoading } = useRecentActivities(10);

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      const validDates: [Dayjs, Dayjs] = [dates[0], dates[1]];
      setSelectedDates(validDates);
      const params: DateRangeParams = {
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      };
      setDateRange(params);
    } else {
      setSelectedDates(null);
      setDateRange(undefined);
    }
  };

  const handleRefresh = () => {
    refetchOverview();
    refetchShops();
  };

  const presetRanges = {
    'Today': [dayjs().startOf('day'), dayjs().endOf('day')] as [Dayjs, Dayjs],
    'This Week': [dayjs().startOf('week'), dayjs().endOf('week')] as [Dayjs, Dayjs],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')] as [Dayjs, Dayjs],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] as [Dayjs, Dayjs],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()] as [Dayjs, Dayjs],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()] as [Dayjs, Dayjs],
  };

  if (error) {
    return (
      <div className="dashboard-page">
        <Alert
          message="Error Loading Data"
          description="Unable to load dashboard data. Please try again later."
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (isLoading || !overview) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Loading data..." />
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const getActivityIcon = (type: string) => {
    const iconMap: { [key: string]: { icon: React.ReactNode; color: string; bg: string } } = {
      'SHOP_REGISTERED': { 
        icon: <ShopOutlined />, 
        color: '#1890ff',
        bg: '#e6f7ff'
      },
      'ORDER_CREATED': { 
        icon: <ShoppingOutlined />, 
        color: '#52c41a',
        bg: '#f6ffed'
      },
      'REVIEW': { 
        icon: <StarOutlined />, 
        color: '#faad14',
        bg: '#fffbe6'
      },
      'REPORT': { 
        icon: <FileTextOutlined />, 
        color: '#ff4d4f',
        bg: '#fff1f0'
      },
      'DISPUTE': { 
        icon: <ExclamationCircleOutlined />, 
        color: '#f5222d',
        bg: '#fff1f0'
      },
    };
    
    return iconMap[type] || { 
      icon: <FileTextOutlined />, 
      color: '#8c8c8c',
      bg: '#f5f5f5'
    };
  };

  return (
    <div className="dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Dashboard Overview</Title>
        <Space size="middle">
          <RangePicker
            value={selectedDates}
            onChange={handleDateChange}
            format="YYYY-MM-DD"
            presets={Object.entries(presetRanges).map(([label, value]) => ({
              label,
              value,
            }))}
            allowClear
            placeholder={['Start Date', 'End Date']}
            suffixIcon={<CalendarOutlined />}
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            type="default"
          >
            Refresh
          </Button>
        </Space>
      </div>
      
      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Monthly Revenue"
              value={overview.revenue.thisMonth}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color={overview.revenue.percentChangeFromLastMonth >= 0 ? 'success' : 'error'}>
                {overview.revenue.percentChangeFromLastMonth >= 0 ? (
                  <ArrowUpOutlined />
                ) : (
                  <ArrowDownOutlined />
                )}
                {' '}{Math.abs(overview.revenue.percentChangeFromLastMonth).toFixed(1)}%
              </Tag>
              <Text type="secondary" style={{ fontSize: '12px' }}>vs last month</Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Shops"
              value={overview.shops.active}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
              formatter={(value) => formatNumber(Number(value))}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                +{overview.shops.newToday} new today
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={overview.users.active}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
              formatter={(value) => formatNumber(Number(value))}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                +{overview.users.newToday} new today
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={overview.orders.completionRate}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="%"
              precision={1}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {overview.orders.pending} pending
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Revenue Details */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Today's Revenue"
              value={overview.revenue.today}
              valueStyle={{ fontSize: '16px' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Weekly Revenue"
              value={overview.revenue.thisWeek}
              valueStyle={{ fontSize: '16px' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Total Commission"
              value={overview.revenue.totalCommission}
              valueStyle={{ fontSize: '16px', color: '#fa8c16' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions Required */}
      {(overview.actionsRequired.pendingShops > 0 || 
        overview.actionsRequired.pendingProducts > 0 ||
        overview.actionsRequired.pendingWithdrawals > 0) && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card 
              title={
                <Space>
                  <WarningOutlined style={{ color: '#faad14' }} />
                  <span>Actions Required</span>
                </Space>
              }
              size="small"
            >
              <Space size="large" wrap>
                {overview.actionsRequired.pendingShops > 0 && (
                  <Tag color="orange" icon={<ClockCircleOutlined />}>
                    {overview.actionsRequired.pendingShops} pending shops
                  </Tag>
                )}
                {overview.actionsRequired.pendingProducts > 0 && (
                  <Tag color="orange" icon={<ClockCircleOutlined />}>
                    {overview.actionsRequired.pendingProducts} pending products
                  </Tag>
                )}
                {overview.actionsRequired.pendingWithdrawals > 0 && (
                  <Tag color="orange" icon={<ClockCircleOutlined />}>
                    {overview.actionsRequired.pendingWithdrawals} withdrawal requests
                  </Tag>
                )}
                {overview.orders.returnRequests > 0 && (
                  <Tag color="red" icon={<WarningOutlined />}>
                    {overview.orders.returnRequests} return requests
                  </Tag>
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* Top Shops and Recent Activities */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Top Shops" bordered={false} loading={shopsLoading} style={{ height: '100%' }}>
            <div style={{ height: '400px', overflowY: 'auto', overflowX: 'hidden' }}>
              <List
                itemLayout="horizontal"
                dataSource={topShops}
                renderItem={(shop, index) => (
                  <List.Item style={{ padding: '16px 8px' }}>
                    <List.Item.Meta
                      avatar={
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <Avatar 
                            src={getCloudinaryUrl(shop.shopAvatar)} 
                            size={56}
                            style={{ 
                              backgroundColor: '#1890ff',
                              border: '2px solid #fff',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}
                          >
                            {shop.shopName.charAt(0).toUpperCase()}
                          </Avatar>
                          <div
                            style={{
                              position: 'absolute',
                              bottom: -4,
                              right: -4,
                              backgroundColor: index < 3 ? '#ffd700' : '#1890ff',
                              color: '#fff',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              border: '2px solid #fff',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                            }}
                          >
                            {index + 1}
                          </div>
                        </div>
                      }
                      title={
                        <div style={{ marginBottom: 4 }}>
                          <Space align="center" size={8}>
                            <Text strong style={{ fontSize: '14px', color: '#262626' }}>
                              {shop.shopName}
                            </Text>
                            <Tag 
                              color="gold" 
                              style={{ 
                                margin: 0,
                                fontSize: '12px',
                                padding: '2px 8px',
                                borderRadius: '4px'
                              }}
                            >
                              ⭐ {shop.rating.toFixed(1)}
                            </Tag>
                          </Space>
                        </div>
                      }
                      description={
                        <div style={{ marginTop: 4 }}>
                          <div style={{ marginBottom: 4 }}>
                            <Text 
                              strong 
                              style={{ 
                                fontSize: '14px', 
                                color: '#52c41a',
                                fontWeight: 600
                              }}
                            >
                              {formatCurrency(shop.revenue)}
                            </Text>
                          </div>
                          <Space size={4} split={<span style={{ color: '#d9d9d9' }}>•</span>}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {formatNumber(shop.orderCount)} orders
                            </Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {formatNumber(shop.reviewCount)} reviews
                            </Text>
                          </Space>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Recent Activities" bordered={false} loading={activitiesLoading} style={{ height: '100%' }}>
            <div style={{ height: '400px', overflowY: 'auto', overflowX: 'hidden' }}>
              <List
                itemLayout="horizontal"
                dataSource={activities}
                renderItem={(activity) => {
                  const activityStyle = getActivityIcon(activity.type);
                  return (
                    <List.Item style={{ padding: '12px 8px' }}>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            style={{ 
                              backgroundColor: activityStyle.bg,
                              color: activityStyle.color,
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            size={40}
                          >
                            {activityStyle.icon}
                          </Avatar>
                        }
                        title={
                          <Space>
                            <Text strong style={{ fontSize: '13px' }}>{activity.title}</Text>
                            <Tag 
                              color="blue" 
                              style={{ 
                                fontSize: '11px',
                                padding: '0 6px',
                                lineHeight: '20px'
                              }}
                            >
                              {activity.type.replace('_', ' ')}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {activity.description}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              {new Date(activity.timestamp).toLocaleString('vi-VN')}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Order Statistics */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Order Statistics" bordered={false}>
            {/* Summary Cards */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card size="small" type="inner">
                  <Statistic
                    title="Total Orders"
                    value={overview.orders.total}
                    valueStyle={{ color: '#1890ff', fontSize: '28px' }}
                    formatter={(value) => formatNumber(Number(value))}
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    All time orders
                  </Text>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" type="inner">
                  <Statistic
                    title="Completion Rate"
                    value={overview.orders.completionRate}
                    valueStyle={{ color: '#52c41a', fontSize: '28px' }}
                    suffix="%"
                    precision={1}
                  />
                  <Progress 
                    percent={Number(overview.orders.completionRate.toFixed(1))}
                    size="small"
                    strokeColor="#52c41a"
                    showInfo={false}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" type="inner">
                  <Statistic
                    title="Return Requests"
                    value={overview.orders.returnRequests}
                    valueStyle={{ color: '#fa8c16', fontSize: '28px' }}
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {((overview.orders.returnRequests / overview.orders.total) * 100).toFixed(2)}% of total
                  </Text>
                </Card>
              </Col>
            </Row>
            
            {/* Detailed Status Breakdown */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={12} sm={6}>
                <Card size="small" bordered={false} style={{ backgroundColor: '#f0f5ff' }}>
                  <Statistic
                    title="Pending"
                    value={overview.orders.pending}
                    valueStyle={{ fontSize: '24px', color: '#1890ff' }}
                    formatter={(value) => formatNumber(Number(value))}
                  />
                  <Progress 
                    percent={Number(((overview.orders.pending / overview.orders.total) * 100).toFixed(1))}
                    size="small"
                    strokeColor="#1890ff"
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" bordered={false} style={{ backgroundColor: '#fff7e6' }}>
                  <Statistic
                    title="Processing"
                    value={overview.orders.processing}
                    valueStyle={{ fontSize: '24px', color: '#fa8c16' }}
                    formatter={(value) => formatNumber(Number(value))}
                  />
                  <Progress 
                    percent={Number(((overview.orders.processing / overview.orders.total) * 100).toFixed(1))}
                    size="small"
                    strokeColor="#fa8c16"
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" bordered={false} style={{ backgroundColor: '#f6ffed' }}>
                  <Statistic
                    title="Completed"
                    value={overview.orders.completed}
                    valueStyle={{ fontSize: '24px', color: '#52c41a' }}
                    formatter={(value) => formatNumber(Number(value))}
                  />
                  <Progress 
                    percent={Number(((overview.orders.completed / overview.orders.total) * 100).toFixed(1))}
                    size="small"
                    strokeColor="#52c41a"
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" bordered={false} style={{ backgroundColor: '#fff1f0' }}>
                  <Statistic
                    title="Cancelled"
                    value={overview.orders.cancelled}
                    valueStyle={{ fontSize: '24px', color: '#ff4d4f' }}
                    formatter={(value) => formatNumber(Number(value))}
                  />
                  <Progress 
                    percent={Number(((overview.orders.cancelled / overview.orders.total) * 100).toFixed(1))}
                    size="small"
                    strokeColor="#ff4d4f"
                  />
                </Card>
              </Col>
            </Row>

            {/* Quick Stats */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={12} sm={6}>
                <Card size="small" bordered={false}>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                    Success Rate
                  </Text>
                  <Text strong style={{ fontSize: '20px', color: '#52c41a' }}>
                    {((overview.orders.completed / (overview.orders.completed + overview.orders.cancelled)) * 100).toFixed(1)}%
                  </Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" bordered={false}>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                    Active Orders
                  </Text>
                  <Text strong style={{ fontSize: '20px', color: '#1890ff' }}>
                    {formatNumber(overview.orders.pending + overview.orders.processing)}
                  </Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" bordered={false}>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                    Avg. Completion
                  </Text>
                  <Text strong style={{ fontSize: '20px', color: '#722ed1' }}>
                    {overview.orders.completionRate.toFixed(1)}%
                  </Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" bordered={false}>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                    Cancellation Rate
                  </Text>
                  <Text strong style={{ fontSize: '20px', color: '#ff4d4f' }}>
                    {((overview.orders.cancelled / overview.orders.total) * 100).toFixed(1)}%
                  </Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
