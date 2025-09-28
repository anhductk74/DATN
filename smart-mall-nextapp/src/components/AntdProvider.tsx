"use client";

import { ConfigProvider, App } from "antd";
import { ReactNode } from "react";

interface AntdProviderProps {
  children: ReactNode;
}

export default function AntdProvider({ children }: AntdProviderProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token - màu chủ đạo
          colorPrimary: '#6366f1', // indigo-500
          borderRadius: 12,
          
          // Alias Token - màu phụ trợ
          colorBgContainer: '#ffffff',
          colorBorder: '#e5e7eb',
          colorText: '#374151',
        },
        components: {
          Button: {
            borderRadius: 16,
            controlHeight: 44,
          },
          Input: {
            borderRadius: 16,
            controlHeight: 44,
          },
          Message: {
            borderRadius: 12,
          },
        },
      }}
      // Disable deprecated warnings để tránh warnings với React 18
      warning={{
        strict: false,
      }}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
}