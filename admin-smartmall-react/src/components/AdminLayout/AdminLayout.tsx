import { useState } from 'react';
import { Layout, Menu, Button, Typography, Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShopOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  GiftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  BellOutlined,
  CarOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '../../stores/authStore';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Get initial open keys based on current route
  const getInitialOpenKeys = () => {
    const path = location.pathname;
    const openKeys: string[] = [];
    
    if (path.includes('/products')) openKeys.push('products');
    if (path.includes('/orders')) openKeys.push('orders');
    if (path.includes('/customers')) openKeys.push('customers');
    if (path.includes('/managers')) openKeys.push('managers');
    
    return openKeys;
  };

  const [openKeys, setOpenKeys] = useState<string[]>(getInitialOpenKeys());

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: 'Products',
      children: [
        {
          key: '/dashboard/products',
          label: 'All Products',
          onClick: () => navigate('/dashboard/products'),
        },
        {
          key: '/dashboard/products/categories',
          label: 'Categories',
          onClick: () => navigate('/dashboard/products/categories'),
        },
        {
          key: '/dashboard/products/brands',
          label: 'Brands',
          onClick: () => navigate('/dashboard/products/brands'),
        },
      ],
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: 'Orders',
      children: [
        {
          key: '/dashboard/orders',
          label: 'All Orders',
          onClick: () => navigate('/dashboard/orders'),
        },
        {
          key: '/dashboard/orders/pending',
          label: 'Pending Orders',
          onClick: () => navigate('/dashboard/orders/pending'),
        },
        {
          key: '/dashboard/orders/completed',
          label: 'Completed Orders',
          onClick: () => navigate('/dashboard/orders/completed'),
        },
      ],
    },
    {
      key: '/dashboard/stores',
      icon: <ShopOutlined />,
      label: 'Stores',
      onClick: () => navigate('/dashboard/stores'),
    },
    {
      key: 'customers',
      icon: <TeamOutlined />,
      label: 'Customers',
      children: [
        {
          key: '/dashboard/customers',
          label: 'All Customers',
          onClick: () => navigate('/dashboard/customers'),
        },
        {
          key: '/dashboard/customers/reviews',
          label: 'Reviews',
          onClick: () => navigate('/dashboard/customers/reviews'),
        },
      ],
    },
    {
      key: '/dashboard/users',
      icon: <UserOutlined />,
      label: 'Users Management',
      onClick: () => navigate('/dashboard/users'),
    },
    {
      key: 'managers',
      icon: <CarOutlined />,
      label: 'Epress Managers',
      children: [
        {
          key: '/dashboard/managers',
          label: 'All Managers',
          onClick: () => navigate('/dashboard/managers'),
        },
        {
          key: '/dashboard/managers/register',
          label: 'Register Manager',
          onClick: () => navigate('/dashboard/managers/register'),
        },
      ],
    },
    {
      key: '/dashboard/vouchers',
      icon: <GiftOutlined />,
      label: 'Voucher Management',
      onClick: () => navigate('/dashboard/vouchers'),
    },
    {
      key: '/dashboard/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
      onClick: () => navigate('/dashboard/analytics'),
    },
    {
      key: '/dashboard/reports',
      icon: <FileTextOutlined />,
      label: 'Reports',
      onClick: () => navigate('/dashboard/reports'),
    },
    {
      key: '/dashboard/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/dashboard/settings'),
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/dashboard/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/dashboard/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: () => navigate('/logout'),
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    // Check for exact match first
    if (menuItems.some(item => item?.key === path)) {
      return [path];
    }
    // Check for nested items
    for (const item of menuItems) {
      if (item && 'children' in item && item.children) {
        const found = item.children.find((child) => child && 'key' in child && child.key === path);
        if (found) {
          return [path];
        }
      }
    }
    return ['/dashboard'];
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <Layout className="admin-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="admin-sider"
        width={250}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
      >
        <div className="logo">
          <ShopOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          {!collapsed && <span className="logo-text">Smart Mall</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKey()}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="trigger-btn"
            />
          </div>
          <div className="header-right">
            <Button
              type="text"
              icon={<BellOutlined />}
              className="header-icon-btn"
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-info">
                <Avatar size="small" icon={<UserOutlined />} />
                {!collapsed && (
                  <div className="user-details">
                    <Text strong className="user-name">
                      {user?.fullName || user?.username}
                    </Text>
                    <Text type="secondary" className="user-role">
                      {user?.roles[0] || 'Admin'}
                    </Text>
                  </div>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
