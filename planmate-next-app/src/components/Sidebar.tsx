import React from 'react';
import { Menu, Button } from 'antd';
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
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark } = useTheme();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: 'Projects',
    },
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: 'Calendar',
    },
    {
      key: '/timeline',
      icon: <ClockCircleOutlined />,
      label: 'Timeline',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
    {
      key: 'teams',
      icon: <TeamOutlined />,
      label: 'Teams',
      children: [
        {
          key: '/teams/marketing',
          label: 'Marketing',
        },
        {
          key: '/teams/development',
          label: 'Development',
        },
        {
          key: '/teams/design',
          label: 'Design',
        },
      ],
    },
    {
      key: '/documents',
      icon: <FileTextOutlined />,
      label: 'Documents',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

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
        top: '64px',
        bottom: 0,
        width: collapsed ? 80 : 240,
        zIndex: 1000,
        borderRight: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        transition: 'width 0.2s',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Create Button - Fixed at top */}
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
          height: 'calc(100% - 80px)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={['teams']}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-r-0"
          style={{
            borderRight: 0,
            height: 'auto',
            minHeight: '100%',
          }}
        />
      </div>
    </div>
  );
}
