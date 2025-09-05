import React from 'react';
import { Layout, Input, Button, Dropdown, Avatar, Badge } from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useTheme } from './ThemeProvider';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Header({ collapsed, setCollapsed }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();

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
      danger: true,
    },
  ];

  const notificationMenuItems: MenuProps['items'] = [
    {
      key: '1',
      label: 'New task assigned to you',
    },
    {
      key: '2',
      label: 'Project deadline approaching',
    },
    {
      key: '3',
      label: 'Team meeting in 30 minutes',
    },
    {
      type: 'divider',
    },
    {
      key: 'all',
      label: 'View all notifications',
    },
  ];

  return (
    <AntHeader 
      className={`fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-2 shadow-sm border-b ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
      style={{ height: '64px', lineHeight: '64px' }}
    >
      {/* Left Section - Logo and Collapse Button */}
      <div className="flex items-center space-x-2">
        {/* Collapse Button */}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center"
          style={{ color: isDark ? '#ffffff' : '#374151', marginLeft: '4px' }}
        />
        
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          PlanMate
        </span>
      </div>

      {/* Center Section - Search Bar */}
      <div className="flex-1 max-w-md mx-auto">
        <Input
          placeholder="Search projects, tasks, people..."
          prefix={<SearchOutlined className="text-gray-400" />}
          className="rounded-lg"
          size="large"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <Button
          type="text"
          icon={isDark ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          className="flex items-center justify-center"
          style={{ color: isDark ? '#fbbf24' : '#6b7280' }}
        />

        {/* Notifications */}
        <Dropdown
          menu={{ items: notificationMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button
            type="text"
            icon={
              <Badge count={3} size="small">
                <BellOutlined className="text-lg" />
              </Badge>
            }
            className="flex items-center justify-center"
          />
        </Dropdown>

        {/* User Profile */}
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1">
            <Avatar 
              size="default" 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
            />
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
              John Doe
            </span>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
}
