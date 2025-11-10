import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Form, Input, Button, Card, Typography, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../stores/authStore';
import type { LoginRequest } from '../../types/auth.types';
import './Login.css';

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { setUser, setTokens, isAuthenticated, user } = useAuthStore();
  const [form] = Form.useForm();

  useEffect(() => {
    // Redirect if already logged in as admin
    if (isAuthenticated && user?.roles.includes('ADMIN')) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onFinish = async (values: LoginRequest) => {
    try {
      const response = await authService.login(values);
      
      const { accessToken, refreshToken, userInfo } = response.data;

      // Check if user has ADMIN role
      if (!userInfo.roles.includes('ADMIN')) {
        message.error('Access denied. Only administrators can log in.');
        return;
      }

      // Store tokens and user info
      setTokens(accessToken, refreshToken);
      setUser(userInfo);

      message.success('Login successful!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      message.error(errorMessage);
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <Title level={2}>Admin Login</Title>
          <Text type="secondary">Sign in to access the admin dashboard</Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Please input your username!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <Text type="secondary">
            Default credentials: admin / admin
          </Text>
        </div>
      </Card>
    </div>
  );
}
