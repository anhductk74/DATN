import { useEffect } from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { Spin } from 'antd';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = true }: ProtectedRouteProps) {
  const { isAuthenticated, user, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Show loading while checking authentication
  if (isAuthenticated === false && localStorage.getItem('accessToken')) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // Check if admin role is required
  if (requireAdmin && !user.roles.includes('ADMIN')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
