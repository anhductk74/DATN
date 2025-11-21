'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Button } from 'antd';
import type { MenuProps } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  HomeOutlined,
  DollarOutlined,
  BarChartOutlined,
  LogoutOutlined,
  SettingOutlined,
  CarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  onMenuSelect?: (menuKey: string) => void;
  activeMenu?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export default function Sidebar({ collapsed, onCollapse, onMenuSelect, activeMenu = 'dashboard', user }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'shipments',
      icon: <ShoppingOutlined />,
      label: 'Quản lý vận đơn',
      children: [
        {
          key: 'shipments/order-list',
          icon: <CarOutlined />,
          label: 'Order List',
        },
        {
          key: 'shipments/shipment-order',
          icon: <ShoppingOutlined />,
          label: 'Shipment Order',
        },
      ],
    },
    {
      key: 'shippers',
      icon: <UserOutlined />,
      label: 'Quản lý Shipper',
    },
    {
      key: 'warehouses',
      icon: <HomeOutlined />,
      label: 'Quản lý Kho',
    },
    {
      key: 'finance',
      icon: <DollarOutlined />,
      label: 'Quản lý Tài chính',
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo & Thống kê',
    }
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
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
      danger: true,
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (onMenuSelect) {
      onMenuSelect(e.key);
    }
  };

  const handleUserMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'logout') {
      // Handle logout logic
      router.push('/');
    } else if (e.key === 'profile') {
      router.push('/profile');
    } else if (e.key === 'settings') {
      router.push('/settings');
    }
  };

  // Get current selected key based on activeMenu
  const getSelectedKey = () => {
    if (activeMenu?.includes('/')) {
      return [activeMenu];
    }
    return [activeMenu || 'dashboard'];
  };

  // Initialize open keys based on activeMenu
  useEffect(() => {
    if (activeMenu?.includes('shipments/')) {
      setOpenKeys(['shipments']);
    }
  }, [activeMenu]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={280}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <CarOutlined className="text-white text-lg" />
            </div>
            <div>
              <Text strong className="text-lg">Express Hub</Text>
            </div>
          </div>
        )}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          style={{
            fontSize: '16px',
            width: 32,
            height: 32,
          }}
        />
      </div>



      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={getSelectedKey()}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          height: 'calc(100vh - 64px - 60px)',
          borderRight: 0,
          background: '#fff',
        }}
      />

      {/* Footer */}
      {!collapsed && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            padding: '16px',
            borderTop: '1px solid #f0f0f0',
            background: '#fafafa',
          }}
        >
          <Text type="secondary" className="text-xs">
            © 2025 Express Management System
          </Text>
        </div>
      )}
    </Sider>
  );
}