import React from 'react';
import { Menu, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  TeamOutlined,
  SettingOutlined,
  FileTextOutlined,
  PlusOutlined,
  ExperimentOutlined,
  UserOutlined,
  SecurityScanOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthProvider';
import { UserRole } from '@/types/auth';
import { SidebarUserInfo } from './SidebarUserInfo';

interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  show: boolean;
  children?: MenuItem[];
}

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, hasPermission } = useAuth();

  // Base menu items available to all users
  const baseMenuItems: MenuItem[] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      show: true, // Always show dashboard
    },
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: 'Calendar',
      show: hasPermission('calendar', 'read'),
    },
  ];

  // Admin specific menu items
  const adminMenuItems: MenuItem[] = [
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'User Management',
      show: hasPermission('users', 'read'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'System Settings',
      show: hasPermission('settings', 'read'),
    },
    {
      key: '/security',
      icon: <SecurityScanOutlined />,
      label: 'Security',
      show: user?.role === UserRole.ADMIN,
    },
  ];

  // Project Manager & Team Lead menu items
  const managementMenuItems: MenuItem[] = [
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: 'Projects',
      show: hasPermission('projects', 'read'),
    },
    {
      key: '/timeline',
      icon: <ClockCircleOutlined />,
      label: 'Timeline',
      show: hasPermission('projects', 'read'),
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
      show: hasPermission('reports', 'read'),
    },
    {
      key: 'teams',
      icon: <TeamOutlined />,
      label: 'Teams',
      show: hasPermission('users', 'read'),
      children: [
        {
          key: '/teams/marketing',
          label: 'Marketing',
          show: hasPermission('users', 'read'),
        },
        {
          key: '/teams/development',
          label: 'Development',
          show: hasPermission('users', 'read'),
        },
        {
          key: '/teams/design',
          label: 'Design',
          show: hasPermission('users', 'read'),
        },
      ],
    },
  ];


  // Additional items for all roles
  const commonMenuItems: MenuItem[] = [
    {
      key: '/documents',
      icon: <FileTextOutlined />,
      label: 'Documents',
      show: true, // Available to all
    },
    {
      key: '/billing',
      icon: <BankOutlined />,
      label: 'Billing',
      show: user?.role === UserRole.ADMIN || user?.role === UserRole.PROJECT_MANAGER,
    },
  ];

  // Test/Development items
  const devMenuItems: MenuItem[] = [
    {
      key: '/role-test',
      icon: <ExperimentOutlined />,
      label: 'Role Test',
      show: true, // Show for all during development
    },
  ];

  // Combine all menu items based on user role
  const getAllMenuItems = () => {
    let allItems = [...baseMenuItems];

    // Add management items for PM and above
    if (user?.role === UserRole.ADMIN || 
        user?.role === UserRole.PROJECT_MANAGER || 
        user?.role === UserRole.TEAM_LEAD) {
      allItems = [...allItems, ...managementMenuItems];
    }

    // Add admin items for admin only
    if (user?.role === UserRole.ADMIN) {
      allItems = [...allItems, ...adminMenuItems];
    }

    // Add common items
    allItems = [...allItems, ...commonMenuItems];

    // Add dev items (remove in production)
    allItems = [...allItems, ...devMenuItems];

    // Filter items based on show property and process children
    return allItems
      .filter(item => item.show)
      .map(item => {
        if (item.children) {
          const filteredChildren = item.children.filter(child => child.show);
          return filteredChildren.length > 0 ? {
            ...item,
            children: filteredChildren
          } : null;
        }
        return item;
      })
      .filter(Boolean);
  };

  const menuItems = getAllMenuItems();

  // Convert MenuItem to Ant Design menu format
  const convertToAntMenuItem = (item: MenuItem): NonNullable<MenuProps['items']>[number] => {
    const baseItem = {
      key: item.key,
      icon: item.icon,
      label: item.label,
    };

    if (item.children && item.children.length > 0) {
      return {
        ...baseItem,
        children: item.children.map(convertToAntMenuItem),
      };
    }

    return baseItem;
  };

  const antMenuItems = menuItems
    .filter((item): item is MenuItem => Boolean(item))
    .map(convertToAntMenuItem);

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) {
      router.push(key);
    }
  };

  return (
    <div
      className={`${isDark ? 'bg-gray-800' : 'bg-white'}`}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: collapsed ? 80 : 240,
        zIndex: 1000,
        borderRight: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        transition: 'width 0.2s',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      {/* Logo at top - aligned with header height */}
      <div 
        className="flex items-center justify-center border-b border-gray-200 dark:border-gray-700"
        style={{ height: '64px' }}
      >
        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">P</span>
        </div>
        {!collapsed && (
          <span className={`ml-3 text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            PlanMate
          </span>
        )}
      </div>

      {/* Create Button - Fixed below logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="w-full rounded-lg"
          size="large"
        >
          {!collapsed && 'Create'}
        </Button>
      </div>

      {/* Scrollable Menu Container */}
      <div
        className="flex-1"
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={['teams']}
          items={antMenuItems}
          onClick={handleMenuClick}
          className="border-r-0"
          style={{
            borderRight: 0,
            height: 'auto',
            minHeight: '100%',
          }}
        />
      </div>

      {/* User Info at Bottom */}
      {!collapsed && <SidebarUserInfo />}
    </div>
  );
}
