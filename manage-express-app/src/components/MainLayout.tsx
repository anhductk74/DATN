'use client';

import { useState, ReactNode } from 'react';
import { Layout, Typography, Avatar, Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShopOutlined
} from '@ant-design/icons';
import Sidebar from './Sidebar';

// Import page components
import DashboardPage from '@/app/dashboard/page';
import ShipmentsPage from '@/app/shipments/page';
import OrderListPage from '@/app/shipments/order-list/page';
import ShipmentOrderPage from '@/app/shipments/shipment-order/page';
import ShippersPage from '@/app/shippers/page';
import WarehousesPage from '@/app/warehouses/page';
import FinancePage from '@/app/finance/page';
import ReportsPage from '@/app/reports/page';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface MainLayoutProps {
  children?: ReactNode;
  activeMenu?: string;
}

interface PageProps {
  onNavigate?: (path: string) => void;
}

export default function MainLayout({ children, activeMenu = 'dashboard' }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(activeMenu);
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleMenuSelect = (menuKey: string) => {
    setCurrentPage(menuKey);
    
    // Navigate to the selected page
    const routeMap: Record<string, string> = {
      'dashboard': '/dashboard',
      'shipments': '/shipments',
      'shipments/order-list': '/shipments/order-list',
      'shipments/shipment-order': '/shipments/shipment-order',
      'shippers': '/shippers',
      'warehouses': '/warehouses',
      'finance': '/finance',
      'reports': '/reports',
    };
    
    if (routeMap[menuKey]) {
      router.push(routeMap[menuKey]);
    }
  };

  const renderContent = () => {
    // If children are provided, render them instead of switching pages
    if (children) {
      return children;
    }
    
    const pageProps = { onNavigate: handleMenuSelect };
    
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'shipments':
        return <ShipmentsPage {...pageProps} />;
      case 'shipments/order-list':
        return <OrderListPage />;
      case 'shipments/shipment-order':
        return <ShipmentOrderPage />;
      case 'shippers':
        return <ShippersPage />;
      case 'warehouses':
        return <WarehousesPage />;
      case 'finance':
        return <FinancePage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <DashboardPage />;
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => router.push('/profile'),
    },
    {
      key: 'company',
      icon: <ShopOutlined />,
      label: 'Thông tin công ty',
      onClick: () => router.push('/company'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar 
        collapsed={collapsed}
        onCollapse={setCollapsed}
        onMenuSelect={handleMenuSelect}
        activeMenu={currentPage}
        user={session?.user ? {
          name: session.user.fullName || session.user.username || 'User',
          email: session.user.email || '',
          company: session.user.company ? {
            companyName: session.user.company.companyName,
            companyCode: session.user.company.companyCode,
            district: session.user.company.district,
            city: session.user.company.city
          } : undefined
        } : undefined}
      />
      
      {/* Main Content Layout */}
      <Layout 
        style={{ 
          marginLeft: collapsed ? 80 : 280,
          transition: 'margin-left 0.2s'
        }}
      >
        {/* Header */}
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            position: 'fixed',
            top: 0,
            right: 0,
            left: collapsed ? 80 : 280,
            zIndex: 1000,
            transition: 'left 0.2s',
            height: '64px',
            lineHeight: '64px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Title 
              level={4} 
              style={{ 
                margin: 0, 
                fontWeight: 600, 
                color: '#262626',
                lineHeight: 1,
                fontSize: '18px'
              }}
            >
              Express Management
            </Title>
            
            {session?.user?.company && (
              <>
                <div style={{ 
                  height: '32px', 
                  width: '1px', 
                  backgroundColor: '#d9d9d9' 
                }} />
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  <Text style={{ 
                    fontSize: '14px', 
                    fontWeight: 600,
                    color: '#1890ff',
                    lineHeight: 1.2
                  }}>
                    {session.user.company.companyName}
                  </Text>
                  <Text style={{ 
                    fontSize: '12px', 
                    color: '#8c8c8c',
                    lineHeight: 1.2
                  }}>
                    {session.user.company.district}, {session.user.company.city}
                  </Text>
                </div>
              </>
            )}
          </div>
          
          {/* User Menu */}
          <Dropdown 
            menu={{ items: userMenuItems }} 
            placement="bottomRight"
            trigger={['click']}
          >
            <div 
              style={{ 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                minHeight: '48px'
              }}
              className="hover:bg-gray-50"
            >
              <Avatar 
                icon={<UserOutlined />} 
                style={{ backgroundColor: '#1890ff' }}
                size={40}
              />
              <div 
                style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  lineHeight: 1.2
                }}
              >
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 600,
                  color: '#262626',
                  marginBottom: '2px'
                }}>
                  {session?.user?.fullName || session?.user?.username || 'MANAGER EXPRESS'}
                </div>
                {session?.user?.company ? (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#1890ff',
                    fontWeight: 500,
                    marginBottom: '2px'
                  }}>
                    {session.user.company.companyCode}
                  </div>
                ) : null}
                <div style={{ 
                  fontSize: '12px', 
                  color: '#8c8c8c'
                }}>
                  {session?.user?.email || 'manager@example.com'}
                </div>
              </div>
            </div>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content
          style={{
            marginTop: 64, // Height of fixed header
            background: '#f5f5f5',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}