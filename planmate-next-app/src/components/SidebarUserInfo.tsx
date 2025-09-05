'use client';

import React from 'react';
import { Avatar, Tag, Typography } from 'antd';
import { useAuth } from '@/components/AuthProvider';
import { UserRole } from '@/types/auth';

const { Text } = Typography;

export const SidebarUserInfo: React.FC = () => {
  const { user, getRoleDisplayName } = useAuth();

  if (!user) return null;

  const getRoleColor = (role: UserRole) => {
    const colors = {
      [UserRole.ADMIN]: '#ff4d4f',
      [UserRole.PROJECT_MANAGER]: '#1890ff', 
      [UserRole.TEAM_LEAD]: '#52c41a',
      [UserRole.TEAM_MEMBER]: '#faad14'
    };
    return colors[role];
  };

  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <Avatar src={user.avatar} size={32} />
        <div className="flex-1 min-w-0">
          <Text className="text-sm font-medium truncate block">
            {user.name}
          </Text>
          <Tag 
            color={getRoleColor(user.role)}
            className="text-xs mt-1"
          >
            {getRoleDisplayName(user.role)}
          </Tag>
        </div>
      </div>
    </div>
  );
};
