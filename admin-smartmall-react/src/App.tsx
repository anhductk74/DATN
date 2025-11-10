import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { App as AntApp, ConfigProvider } from 'antd';
import { router } from './router';
import { useAuthStore } from './stores/authStore';

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <AntApp>
        <RouterProvider router={router} />
      </AntApp>
    </ConfigProvider>
  );
}
