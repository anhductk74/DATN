'use client';

import React, { createContext, useContext } from 'react';
import { useNotifications, UseNotificationsReturn } from '@/hooks/useNotifications';

const NotificationContext = createContext<UseNotificationsReturn | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notifications = useNotifications();

  return (
    <NotificationContext.Provider value={notifications}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): UseNotificationsReturn => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  
  return context;
};

// Re-export for convenience
export { useNotifications } from '@/hooks/useNotifications';
