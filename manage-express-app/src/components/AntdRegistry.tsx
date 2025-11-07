'use client';

import React from 'react';
import { AntdRegistry as AntdReg } from '@ant-design/nextjs-registry';
import { ConfigProvider, App } from 'antd';
import viVN from 'antd/locale/vi_VN';

export default function AntdRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AntdReg>
      <ConfigProvider
        locale={viVN}
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
          },
        }}
      >
        <App>
          {children}
        </App>
      </ConfigProvider>
    </AntdReg>
  );
}
