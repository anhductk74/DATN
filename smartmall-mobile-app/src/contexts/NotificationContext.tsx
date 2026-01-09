import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService, { Notification } from '../services/notificationService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load user info from AsyncStorage
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userInfo = await AsyncStorage.getItem('userInfo');
        // Try 'token' first, fallback to 'accessToken'
        let authToken = await AsyncStorage.getItem('token');
        if (!authToken) {
          authToken = await AsyncStorage.getItem('accessToken');
        }
        
        console.log('📦 Loading user info from AsyncStorage...');
        console.log('📦 UserInfo exists:', !!userInfo);
        console.log('📦 Token exists:', !!authToken);
        
        if (userInfo && authToken) {
          const user = JSON.parse(userInfo);
          console.log('👤 User ID:', user.id);
          console.log('🔑 Token (first 20 chars):', authToken.substring(0, 20) + '...');
          setUserId(user.id);
          setToken(authToken);
        } else {
          console.warn('⚠️ Missing userInfo or token in AsyncStorage');
        }
      } catch (error) {
        console.error('❌ Error loading user info:', error);
      }
    };

    loadUserInfo();
  }, []);

  // Connect to WebSocket when userId and token are available
  useEffect(() => {
    if (userId && token) {
      console.log('🔌 Connecting to WebSocket...', userId);

      // Set token in service
      notificationService.setToken(token);

      // Handle incoming notification
      const handleNotification = (notification: Notification) => {
        console.log('📩 Received notification:', notification);
        
        // Add to list
        setNotifications((prev) => [notification, ...prev]);
        
        // Update unread count
        if (notification.status === 'UNREAD') {
          setUnreadCount((prev) => prev + 1);
        }
      };

      // Handle connection status
      const handleConnectionStatus = (connected: boolean) => {
        console.log('🔌 Connection status:', connected);
        setIsConnected(connected);
      };

      // Connect
      notificationService.connect(userId, token, handleNotification, handleConnectionStatus);

      // Load initial notifications
      refreshNotifications();

      // Cleanup on unmount
      return () => {
        notificationService.disconnect();
      };
    }
  }, [userId, token]);

  // Refresh notifications from API
  const refreshNotifications = useCallback(async () => {
    if (!token) return;

    try {
      const [notifResponse, count] = await Promise.all([
        notificationService.getNotifications(0, 20),
        notificationService.getUnreadCount(),
      ]);

      if (notifResponse.success) {
        setNotifications(notifResponse.data.content);
      }
      setUnreadCount(count);
    } catch (error) {
      console.error('❌ Error refreshing notifications:', error);
    }
  }, [token]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, status: 'READ' as const } : notif
        )
      );
      
      // Decrease unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, status: 'READ' as const }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  }, []);

  // Delete single notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Remove from local state
      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === notificationId);
        if (notification?.status === 'UNREAD') {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((notif) => notif.id !== notificationId);
      });
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      await notificationService.deleteAllNotifications();
      
      // Clear local state
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Error clearing all notifications:', error);
    }
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

// Custom hook to use notification context
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
