'use client';

import React from 'react';
import { Layout, Input, Button, Dropdown, Avatar, Badge, Tag } from 'antd';
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
import { useAuth } from './AuthProvider';
import { UserRole } from '@/types/auth';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Header({ collapsed, setCollapsed }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, getRoleDisplayName } = useAuth();

  const getRoleColor = (role: UserRole) => {
    const colors = {
      [UserRole.ADMIN]: '#ff4d4f',
      [UserRole.PROJECT_MANAGER]: '#1890ff',
      [UserRole.TEAM_LEAD]: '#52c41a',
      [UserRole.TEAM_MEMBER]: '#faad14'
    };
    return colors[role];
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
      danger: true,
      onClick: logout
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
      className={`fixed top-0 z-10 flex items-center justify-between px-2 shadow-sm border-b ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
      style={{ 
        height: '64px', 
        lineHeight: '64px',
        left: collapsed ? '80px' : '240px',
        right: 0,
        width: `calc(100% - ${collapsed ? '80px' : '240px'})`,
        transition: 'all 0.2s'
      }}
    >
      {/* Collapse Button only */}
      <div className="flex items-center">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center"
          style={{ color: isDark ? '#ffffff' : '#374151', marginLeft: '4px' }}
        />
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
        {/* Dark Mode Toggle với smooth animation */}
        <Button
          type="text"
          icon={isDark ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          className={`flex items-center justify-center transition-all duration-300 hover:scale-110 ${
            isDark 
              ? 'hover:bg-yellow-500/10 text-yellow-400' 
              : 'hover:bg-gray-500/10 text-gray-600'
          }`}
          style={{ 
            color: isDark ? '#fbbf24' : '#6b7280',
            transform: 'rotate(0deg)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
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
              src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"} 
            />
            <div className="flex flex-col">
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
                {user?.name || 'Guest User'}
              </span>
              {user?.role && (
                <Tag 
                  color={getRoleColor(user.role)}
                  className="text-xs"
                >
                  {getRoleDisplayName(user.role)}
                </Tag>
              )}
            </div>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
}
