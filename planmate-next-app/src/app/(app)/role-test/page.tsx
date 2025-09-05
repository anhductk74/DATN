'use client';

import React from 'react';
import { Card, Row, Col, Badge, Tag, Table, Button, Space, Alert } from 'antd';
import { 
  UserOutlined, 
  CrownOutlined, 
  TeamOutlined, 
  ToolOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '@/components/AuthProvider';
import { UserRole, ROLE_PERMISSIONS } from '@/types/auth';

export default function RoleTestPage() {
  const { user, hasPermission, getRoleDisplayName } = useAuth();

  const getRoleColor = (role: UserRole) => {
    const colors = {
      [UserRole.ADMIN]: '#ff4d4f',
      [UserRole.PROJECT_MANAGER]: '#1890ff',
      [UserRole.TEAM_LEAD]: '#52c41a',
      [UserRole.TEAM_MEMBER]: '#faad14'
    };
    return colors[role];
  };

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      [UserRole.ADMIN]: <CrownOutlined />,
      [UserRole.PROJECT_MANAGER]: <ToolOutlined />,
      [UserRole.TEAM_LEAD]: <TeamOutlined />,
      [UserRole.TEAM_MEMBER]: <UserOutlined />
    };
    return icons[role];
  };

  const allResources = ['users', 'projects', 'tasks', 'reports', 'settings', 'calendar'];
  const allActions = ['create', 'read', 'update', 'delete', 'export'];

  const permissionColumns = [
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource: string) => (
        <Tag color="blue">{resource}</Tag>
      )
    },
    ...allActions.map(action => ({
      title: action.charAt(0).toUpperCase() + action.slice(1),
      dataIndex: action,
      key: action,
      align: 'center' as const,
      render: (hasAccess: boolean) => (
        hasAccess ? (
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
        )
      )
    }))
  ];

  const permissionData = allResources.map(resource => {
    const row: Record<string, boolean | string> = { resource, key: resource };
    allActions.forEach(action => {
      row[action] = hasPermission(resource, action);
    });
    return row;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Role & Permission Testing
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Test different user roles and their permissions in the system
        </p>
      </div>

      {/* Current User Info */}
      <Card title="Current User Information">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space size="large">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user && getRoleIcon(user.role)}
                  <span className="text-lg font-semibold">{user?.name}</span>
                </div>
                <Tag color={user ? getRoleColor(user.role) : 'default'}>
                  {user ? getRoleDisplayName(user.role) : 'No Role'}
                </Tag>
              </div>
              <div>
                <Badge status="success" text={`Active since ${user?.joinedAt.toLocaleDateString()}`} />
              </div>
            </Space>
          </Col>
          <Col span={24}>
            <Alert
              message={`Department: ${user?.department || 'Not assigned'}`}
              description={`Email: ${user?.email || 'Not available'}`}
              type="info"
              showIcon
            />
          </Col>
        </Row>
      </Card>

      {/* Permission Matrix */}
      <Card 
        title="Permission Matrix" 
        extra={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>Allowed</span>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            <span>Denied</span>
          </Space>
        }
      >
        <Table
          columns={permissionColumns}
          dataSource={permissionData}
          pagination={false}
          size="small"
          bordered
        />
      </Card>

      {/* All Roles Overview */}
      <Card title="All System Roles">
        <Row gutter={[16, 16]}>
          {Object.values(UserRole).map(role => {
            const rolePermissions = ROLE_PERMISSIONS[role];
            const totalPermissions = rolePermissions.reduce((acc, perm) => acc + perm.actions.length, 0);
            
            return (
              <Col xs={24} sm={12} lg={6} key={role}>
                <Card 
                  size="small"
                  className={`border-2 ${user?.role === role ? 'border-blue-500' : ''}`}
                >
                  <div className="text-center space-y-2">
                    <div className="text-2xl">
                      {getRoleIcon(role)}
                    </div>
                    <Tag color={getRoleColor(role)}>
                      {getRoleDisplayName(role)}
                    </Tag>
                    <div className="text-sm text-gray-500">
                      {totalPermissions} permissions
                    </div>
                    <div className="text-xs">
                      {rolePermissions.map(perm => perm.resource).join(', ')}
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* Action Buttons */}
      <Card title="Test Actions">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space wrap>
              <Button 
                type={hasPermission('users', 'create') ? 'primary' : 'default'}
                disabled={!hasPermission('users', 'create')}
              >
                Create User
              </Button>
              <Button 
                type={hasPermission('projects', 'create') ? 'primary' : 'default'}
                disabled={!hasPermission('projects', 'create')}
              >
                Create Project
              </Button>
              <Button 
                type={hasPermission('tasks', 'delete') ? 'primary' : 'default'}
                disabled={!hasPermission('tasks', 'delete')}
              >
                Delete Task
              </Button>
              <Button 
                type={hasPermission('reports', 'export') ? 'primary' : 'default'}
                disabled={!hasPermission('reports', 'export')}
              >
                Export Reports
              </Button>
              <Button 
                type={hasPermission('settings', 'update') ? 'primary' : 'default'}
                disabled={!hasPermission('settings', 'update')}
              >
                Update Settings
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
