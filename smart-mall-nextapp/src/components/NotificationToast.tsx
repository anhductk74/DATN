'use client';

import React, { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNotificationContext } from '@/contexts/NotificationContext';
import type { Notification } from '@/services/NotificationService';
import { useRouter } from 'next/navigation';
import { getCloudinaryUrl } from '@/config/config';

/**
 * Notification Toast Component
 * Displays real-time toast notifications
 */
export const NotificationToast: React.FC = () => {
  const { notifications } = useNotificationContext();
  const router = useRouter();
  const [lastNotificationId, setLastNotificationId] = React.useState<string | null>(null);

  const showNotificationToast = (notification: Notification) => {
    const getIcon = (type: string) => {
      const iconMap: Record<string, string> = {
        ORDER_CREATED: '🛍️',
        ORDER_CONFIRMED: '✅',
        ORDER_SHIPPED: '🚚',
        ORDER_DELIVERED: '📦',
        ORDER_CANCELLED: '❌',
        ORDER_COMPLETED: '🎉',
        PAYMENT_SUCCESS: '💰',
        PAYMENT_FAILED: '⚠️',
        PAYMENT_REFUNDED: '💸',
        PRODUCT_APPROVED: '✅',
        PRODUCT_REJECTED: '❌',
        PRODUCT_OUT_OF_STOCK: '📉',
        PRODUCT_BACK_IN_STOCK: '📈',
        PRODUCT_PRICE_DROP: '💸',
        REVIEW_RECEIVED: '⭐',
        REVIEW_REPLY_RECEIVED: '💬',
        VOUCHER_RECEIVED: '🎫',
        VOUCHER_EXPIRING_SOON: '⏰',
        VOUCHER_USED: '✅',
        SHOP_APPROVED: '🏪',
        SHOP_REJECTED: '❌',
        SYSTEM_ANNOUNCEMENT: '📢',
        ACCOUNT_VERIFIED: '✅',
        SECURITY_ALERT: '🔒',
        ADMIN_ALERT: '⚡',
      };
      return iconMap[type] || '🔔';
    };

    toast.custom(
      (t: { id: string; visible: boolean }) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div
            className="flex-1 w-0 p-4 cursor-pointer"
            onClick={() => {
              if (notification.deepLink) {
                router.push(notification.deepLink);
              }
              toast.dismiss(t.id);
            }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                {notification.imageUrl ? (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={getCloudinaryUrl(notification.imageUrl)}
                    alt=""
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                    {getIcon(notification.type)}
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
            >
              ✕
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: 'top-right',
      }
    );
  };

  useEffect(() => {
    // Show toast for new notification
    if (notifications.length > 0) {
      const latestNotification = notifications[0];

      // Only show if it's a new notification
      if (latestNotification.id !== lastNotificationId) {
        setLastNotificationId(latestNotification.id);
        showNotificationToast(latestNotification);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, lastNotificationId]);

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: '',
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }}
    />
  );
};

export default NotificationToast;
