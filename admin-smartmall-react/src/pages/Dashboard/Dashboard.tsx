import { Layout, Card, Row, Col, Statistic, Typography, Button, App } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ShopOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/auth.service';
import './Dashboard.css';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function Dashboard() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearAuth();
      message.success('Logged out successfully');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      clearAuth();
      navigate('/', { replace: true });
    }
  };

  return (
    <Layout className="dashboard-layout">
      <Header className="dashboard-header">
        <div className="header-content">
          <Title level={3} style={{ margin: 0, color: 'white' }}>
            Smart Mall Admin
          </Title>
          <div className="header-user">
            <span style={{ marginRight: 16, color: 'white' }}>
              Welcome, {user?.fullName || user?.username}
            </span>
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </Header>

      <Content className="dashboard-content">
        <div className="content-wrapper">
          <Title level={2}>Dashboard</Title>
          
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
            <Col xs={24}>
              <Card title="User Information">
                <p><strong>ID:</strong> {user?.id}</p>
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Full Name:</strong> {user?.fullName}</p>
                <p><strong>Phone Number:</strong> {user?.phoneNumber || 'N/A'}</p>
                <p><strong>Roles:</strong> {user?.roles.join(', ')}</p>
                <p><strong>Status:</strong> {user?.isActive ? 'Active' : 'Inactive'}</p>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
}
