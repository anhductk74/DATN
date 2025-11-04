'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Layout, Menu, Card, Row, Col, Button, Avatar, Dropdown, Typography } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  CarOutlined,
  ShopOutlined,
  BarChartOutlined,
  TeamOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState('1');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const menuItems: MenuProps['items'] = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '2',
      icon: <ShopOutlined />,
      label: 'Stores',
    },
    {
      key: '3',
      icon: <ShoppingOutlined />,
      label: 'Orders',
    },
    {
      key: '4',
      icon: <CarOutlined />,
      label: 'Deliveries',
    },
    {
      key: '5',
      icon: <UserOutlined />,
      label: 'Customers',
    },
    {
      key: '6',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Header */}
      <Header
        style={{
          background: '#fff',
          padding: '0 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Title level={4} style={{ margin: 0, fontWeight: 600, color: '#262626' }}>
          Express Management
        </Title>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#1890ff' }}
            />
            <Text strong>{session.user.fullName || session.user.username}</Text>
          </div>
        </Dropdown>
      </Header>

      <Layout style={{ background: '#fff' }}>
        {/* Sidebar */}
        <Sider
          width={240}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
          }}
          breakpoint="lg"
          collapsedWidth="0"
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onSelect={({ key }) => setSelectedKey(key)}
            style={{ 
              height: '100%', 
              borderRight: 0,
              background: '#fff',
              paddingTop: '16px'
            }}
          />
        </Sider>

        {/* Main Content */}
        <Content style={{ padding: '24px', background: '#fff', minHeight: 'calc(100vh - 64px)' }}>
          {/* Container Card - Tất cả content nằm trong 1 card lớn */}
          <Card 
            bordered={false}
            style={{ 
              background: '#fff',
              border: '1px solid #f0f0f0',
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            {/* Page Header */}
            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
              <Title level={3} style={{ margin: 0, marginBottom: '4px', fontWeight: 600 }}>Dashboard Overview</Title>
              <Text type="secondary">Monitor your express delivery operations</Text>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12} lg={6}>
                <div style={{ 
                  textAlign: 'center',
                  padding: '20px',
                  background: '#fafafa',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <ShoppingOutlined style={{ color: '#1890ff', fontSize: '32px' }} />
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 600, color: '#262626', marginBottom: '4px' }}>
                    1,234
                  </div>
                  <Text type="secondary" style={{ fontSize: '14px' }}>Total Orders</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <div style={{ 
                  textAlign: 'center',
                  padding: '20px',
                  background: '#fafafa',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <CarOutlined style={{ color: '#52c41a', fontSize: '32px' }} />
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 600, color: '#262626', marginBottom: '4px' }}>
                    87
                  </div>
                  <Text type="secondary" style={{ fontSize: '14px' }}>Active Deliveries</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <div style={{ 
                  textAlign: 'center',
                  padding: '20px',
                  background: '#fafafa',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <ShopOutlined style={{ color: '#faad14', fontSize: '32px' }} />
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 600, color: '#262626', marginBottom: '4px' }}>
                    45
                  </div>
                  <Text type="secondary" style={{ fontSize: '14px' }}>Total Stores</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <div style={{ 
                  textAlign: 'center',
                  padding: '20px',
                  background: '#fafafa',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <TeamOutlined style={{ color: '#eb2f96', fontSize: '32px' }} />
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 600, color: '#262626', marginBottom: '4px' }}>
                    5,678
                  </div>
                  <Text type="secondary" style={{ fontSize: '14px' }}>Total Customers</Text>
                </div>
              </Col>
            </Row>

            {/* Recent Orders & Quick Actions */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <div style={{ 
                  padding: '20px',
                  background: '#fafafa',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}>
                  <Title level={5} style={{ margin: 0, marginBottom: '16px' }}>Recent Orders</Title>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '16px',
                      background: '#fff',
                      borderRadius: '6px',
                      border: '1px solid #f0f0f0'
                    }}>
                      <div>
                        <Text strong style={{ display: 'block', fontSize: '15px' }}>Order #12345</Text>
                        <Text type="secondary" style={{ fontSize: '13px' }}>Customer: John Doe</Text>
                      </div>
                      <Button type="primary" size="small" style={{ borderRadius: '4px' }}>
                        View Details
                      </Button>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '16px',
                      background: '#fff',
                      borderRadius: '6px',
                      border: '1px solid #f0f0f0'
                    }}>
                      <div>
                        <Text strong style={{ display: 'block', fontSize: '15px' }}>Order #12344</Text>
                        <Text type="secondary" style={{ fontSize: '13px' }}>Customer: Jane Smith</Text>
                      </div>
                      <Button type="primary" size="small" style={{ borderRadius: '4px' }}>
                        View Details
                      </Button>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '16px',
                      background: '#fff',
                      borderRadius: '6px',
                      border: '1px solid #f0f0f0'
                    }}>
                      <div>
                        <Text strong style={{ display: 'block', fontSize: '15px' }}>Order #12343</Text>
                        <Text type="secondary" style={{ fontSize: '13px' }}>Customer: Bob Wilson</Text>
                      </div>
                      <Button type="primary" size="small" style={{ borderRadius: '4px' }}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} lg={8}>
                <div style={{ 
                  padding: '20px',
                  background: '#fafafa',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}>
                  <Title level={5} style={{ margin: 0, marginBottom: '16px' }}>Quick Actions</Title>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Button 
                      type="default" 
                      block 
                      icon={<PlusOutlined />}
                      size="large"
                      style={{ 
                        borderRadius: '6px', 
                        textAlign: 'left',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      New Order
                    </Button>
                    <Button 
                      type="default" 
                      block 
                      icon={<CarOutlined />}
                      size="large"
                      style={{ 
                        borderRadius: '6px', 
                        textAlign: 'left',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      Assign Delivery
                    </Button>
                    <Button 
                      type="default" 
                      block 
                      icon={<ShopOutlined />}
                      size="large"
                      style={{ 
                        borderRadius: '6px', 
                        textAlign: 'left',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      Add Store
                    </Button>
                    <Button 
                      type="default" 
                      block 
                      icon={<BarChartOutlined />}
                      size="large"
                      style={{ 
                        borderRadius: '6px', 
                        textAlign: 'left',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      View Reports
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}
