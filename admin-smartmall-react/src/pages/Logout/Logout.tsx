import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Spin, App } from 'antd';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/auth.service';

export default function Logout() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { clearAuth } = useAuthStore();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await authService.logout();
        clearAuth();
        message.success('Logged out successfully');
      } catch (error) {
        console.error('Logout error:', error);
        clearAuth();
      } finally {
        navigate('/', { replace: true });
      }
    };

    handleLogout();
  }, [clearAuth, message, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <Spin size="large" tip="Logging out..." />
    </div>
  );
}
