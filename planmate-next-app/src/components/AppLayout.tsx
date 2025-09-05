'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useTheme } from './ThemeProvider';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen">
      <Header collapsed={collapsed} setCollapsed={setCollapsed} />
      <Sidebar collapsed={collapsed} />
      <div
        style={{
          marginLeft: collapsed ? 80 : 240,
          marginTop: 64,
          transition: 'margin-left 0.2s',
        }}
      >
        <div
          className={`p-6 ${
            isDark 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-50 text-gray-900'
          }`}
          style={{
            minHeight: '100vh',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
