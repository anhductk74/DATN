import { Card, Row, Col, Statistic, Typography } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import './Dashboard.css';

const { Title } = Typography;

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <Title level={2}>Dashboard Overview</Title>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={1234}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={567}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={93120}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#cf1322' }}
              suffix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Stores"
              value={45}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Recent Orders" bordered={false}>
            <p>Order list coming soon...</p>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Top Products" bordered={false}>
            <p>Product list coming soon...</p>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Sales Analytics" bordered={false}>
            <p>Charts and analytics coming soon...</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
