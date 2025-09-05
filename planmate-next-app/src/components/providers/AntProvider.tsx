'use client';

import React, { useEffect, useState } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme } from 'antd';
import { useTheme } from '../ThemeProvider';

interface AntProviderProps {
  children: React.ReactNode;
}

export function AntProvider({ children }: AntProviderProps) {
  const { isDark } = useTheme();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force re-render khi theme thay đổi với smooth timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceUpdate(prev => prev + 1);
    }, 50); // Smaller delay for quicker response
    
    return () => clearTimeout(timer);
  }, [isDark]);

  return (
    <AntdRegistry>
      <ConfigProvider
        key={`ant-theme-${isDark ? 'dark' : 'light'}-${forceUpdate}`} // Better key cho force update
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#f97316', // Orange color like Asana
            colorSuccess: '#22c55e',
            colorWarning: '#f59e0b',
            colorError: '#ef4444',
            borderRadius: 8,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            // Smooth motion tokens
            motionDurationSlow: '0.4s',
            motionDurationMid: '0.3s',
            motionDurationFast: '0.2s',
            motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            motionEaseOut: 'cubic-bezier(0, 0, 0.2, 1)',
          },
          components: {
            Layout: {
              siderBg: isDark ? '#1f2937' : '#ffffff',
              headerBg: isDark ? '#111827' : '#ffffff',
              bodyBg: isDark ? '#111827' : '#f9fafb',
            },
            Menu: {
              darkItemBg: '#1f2937',
              darkSubMenuItemBg: '#1f2937',
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
