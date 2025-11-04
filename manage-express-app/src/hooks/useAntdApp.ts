"use client";

import { App } from "antd";

// Hook để sử dụng Ant Design message, notification, modal
export const useAntdApp = () => {
  const { message, notification, modal } = App.useApp();
  return { message, notification, modal };
};