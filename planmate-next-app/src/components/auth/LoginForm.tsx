'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Button, Alert, Select, Divider, Space, Avatar } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '@/components/AuthProvider';
import { mockUsers } from '@/lib/mockAuth';
import { UserRole } from '@/types/auth';

const { Option } = Select;

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [form] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleLogin = async (values: LoginFormData) => {
    try {
      await login(values);
    } catch {
      // Error is already handled in the auth context
    }
  };

  const handleQuickLogin = (email: string, password: string) => {
    form.setFieldsValue({ email, password });
    handleLogin({ email, password });
  };

  const filterUsersByRole = (role: UserRole) => {
    return mockUsers.filter(user => user.role === role);
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      [UserRole.ADMIN]: '#ff4d4f',
      [UserRole.PROJECT_MANAGER]: '#1890ff',
      [UserRole.TEAM_LEAD]: '#52c41a',
      [UserRole.TEAM_MEMBER]: '#faad14'
    };
    return colors[role];
  };

  const getRoleDisplayName = (role: UserRole) => {
    const names = {
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.PROJECT_MANAGER]: 'Project Manager',
      [UserRole.TEAM_LEAD]: 'Team Lead',
      [UserRole.TEAM_MEMBER]: 'Team Member'
    };
    return names[role];
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Login Form */}
        <Card className="shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Login to PlanMate
            </h2>
            <p className="text-gray-600">
              Enter your credentials to access the system
            </p>
          </div>

          {error && (
            <Alert
              message="Login Failed"
              description={error}
              type="error"
              className="mb-4"
              showIcon
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            size="large"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter your password!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
                icon={<LoginOutlined />}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Quick Login Panel */}
        <Card className="shadow-lg">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Quick Login (Demo)
            </h3>
            <p className="text-gray-600">
              Click on any role to test different permission levels
            </p>
          </div>

          <div className="space-y-4">
            <Select
              placeholder="Filter by role"
              allowClear
              style={{ width: '100%' }}
              onChange={setSelectedRole}
            >
              {Object.values(UserRole).map(role => (
                <Option key={role} value={role}>
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: getRoleColor(role) }}
                    />
                    {getRoleDisplayName(role)}
                  </div>
                </Option>
              ))}
            </Select>

            <Divider />

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(selectedRole ? filterUsersByRole(selectedRole) : mockUsers).map(user => (
                <Card
                  key={user.id}
                  size="small"
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    const credential = {
                      'admin@planmate.com': 'admin123',
                      'pm@planmate.com': 'pm123',
                      'lead@planmate.com': 'lead123',
                      'member@planmate.com': 'member123'
                    }[user.email];
                    if (credential) {
                      handleQuickLogin(user.email, credential);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <Space>
                      <Avatar src={user.avatar} size={40} />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div 
                          className="text-xs px-2 py-1 rounded-full text-white inline-block mt-1"
                          style={{ backgroundColor: getRoleColor(user.role) }}
                        >
                          {getRoleDisplayName(user.role)}
                        </div>
                      </div>
                    </Space>
                    <Button 
                      type="link" 
                      size="small"
                      loading={isLoading}
                    >
                      Login
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Divider />
          
          <div className="text-sm text-gray-500">
            <strong>Demo Credentials:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Admin: admin@planmate.com / admin123</li>
              <li>• PM: pm@planmate.com / pm123</li>
              <li>• Lead: lead@planmate.com / lead123</li>
              <li>• Member: member@planmate.com / member123</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};
