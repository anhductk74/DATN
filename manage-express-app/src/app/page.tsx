'use client';

import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAntdApp } from '@/hooks/useAntdApp';

interface LoginForm {
  username: string;
  password: string;
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { message } = useAntdApp();

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        username: values.username,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        message.error('Invalid username or password, or you do not have MANAGER role!');
      } else if (result?.ok) {
        message.success('Login successful! Welcome to Express Management System');
        router.push('/home');
      }
    } catch (error) {
      message.error('An error occurred. Please try again!');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card 
        className="w-full max-w-md shadow-2xl"
        variant="borderless"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Express Management
          </h1>
          <p className="text-gray-500">Login to management system</p>
          <p className="text-sm text-blue-600 mt-2">Manager access only</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Please enter your username!' },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Username"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your password!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={loading}
              size="large"
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center text-gray-500 text-sm">
          <p>© 2025 Express Management System</p>
        </div>
      </Card>
    </div>
  );
}
