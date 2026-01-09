import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import notificationService from '@/services/NotificationService';
import type { Notification } from '@/services/NotificationService';

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  loadNotifications: (page?: number, size?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAll: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

/**
 * Custom hook to manage notifications
 */
export const useNotifications = (): UseNotificationsReturn => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  /**
   * Handle new notification from WebSocket
   */
  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      // Avoid duplicates
      if (prev.some((n) => n.id === notification.id)) {
        return prev;
      }
      return [notification, ...prev];
    });

    if (notification.status === 'UNREAD') {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  /**
   * Load notifications from API
   */
  const loadNotifications = useCallback(
    async (page = 0, size = 20) => {
      if (!session?.user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await notificationService.getNotifications(page, size);
        
        // Validate response structure
        if (!result || !Array.isArray(result.content)) {
          console.error('Invalid API response:', result);
          setError('Invalid response from server');
          return;
        }
        
        if (page === 0) {
          setNotifications(result.content);
        } else {
          setNotifications((prev) => [...prev, ...result.content]);
        }

        setCurrentPage(page);
        setHasMore(page < (result.totalPages || 0) - 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
        console.error('Error loading notifications:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [session?.user?.id]
  );

  /**
   * Load more notifications (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await loadNotifications(currentPage + 1);
  }, [currentPage, hasMore, isLoading, loadNotifications]);

  /**
   * Refresh unread count
   */
  const refreshUnreadCount = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [session?.user?.id]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await notificationService.markAsRead(notificationId);

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, status: 'READ' as const } : n
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Error marking notification as read:', err);
        throw err;
      }
    },
    []
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: 'READ' as const }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      throw err;
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await notificationService.deleteNotification(notificationId);

        setNotifications((prev) => {
          const notification = prev.find((n) => n.id === notificationId);
          const filtered = prev.filter((n) => n.id !== notificationId);

          if (notification?.status === 'UNREAD') {
            setUnreadCount((count) => Math.max(0, count - 1));
          }

          return filtered;
        });
      } catch (err) {
        console.error('Error deleting notification:', err);
        throw err;
      }
    },
    []
  );

  /**
   * Delete all notifications
   */
  const deleteAll = useCallback(async () => {
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      throw err;
    }
  }, []);

  /**
   * Connect to WebSocket and load initial data
   */
  useEffect(() => {
    if (!session?.user?.id || !session?.accessToken) {
      console.warn('⚠️ No user ID or access token in session');
      return;
    }

    // Get token directly from NextAuth session
    const token = session.accessToken;
    const userId = session.user.id;
    
    console.log('🔑 Using token from session:', token.substring(0, 30) + '...');
    console.log('👤 User ID:', userId);

    // Request browser notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          console.log('Browser notification permission:', permission);
        });
      }
    }

    // Connect to WebSocket
    notificationService
      .connect(userId, token)
      .then(() => {
        setIsConnected(true);
        console.log('✅ Notification service connected');

        // Subscribe to new notifications
        unsubscribeRef.current = notificationService.subscribe(handleNewNotification);

        // Load initial notifications
        loadNotifications(0, 20);
        refreshUnreadCount();
      })
      .catch((err) => {
        console.error('Failed to connect to notification service:', err);
        setError(err.message);
        setIsConnected(false);
      });

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      notificationService.disconnect();
      setIsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, session?.accessToken]);

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    loadNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
    refreshUnreadCount,
  };
};

/**
 * Hook to get only unread count (lightweight)
 */
export const useNotificationCount = () => {
  const { data: session } = useSession();
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const unreadCount = await notificationService.getUnreadCount();
      setCount(unreadCount);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    refresh();

    // Subscribe to new notifications to update count
    const unsubscribe = notificationService.subscribe((notification) => {
      if (notification.status === 'UNREAD') {
        setCount((prev) => prev + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [refresh]);

  return { count, isLoading, refresh };
};
