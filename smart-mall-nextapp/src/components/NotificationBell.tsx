'use client';

import React, { useState } from 'react';
import { Badge, Dropdown, Empty, Spin, Button } from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNotificationContext } from '@/contexts/NotificationContext';
import type { Notification } from '@/services/NotificationService';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getCloudinaryUrl } from '@/config/config';

interface NotificationBellProps {
  className?: string;
}

/**
 * Notification Bell Component
 * Displays notification icon with badge and dropdown panel
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadNotifications,
  } = useNotificationContext();

  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (notification.status === 'UNREAD') {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    // Navigate to deep link if available
    if (notification.deepLink) {
      router.push(notification.deepLink);
      setOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleRefresh = () => {
    loadNotifications(0, 20);
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return '';
    }
  };

  const getNotificationIcon = (type: string) => {
    // Map notification types to icons
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

  const dropdownContent = (
    <div className="bg-white rounded-lg shadow-lg w-96 max-h-[500px] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Thông báo</h3>
          {/* {isConnected ? (
            <span className="text-xs text-green-500">● Online</span>
          ) : (
            <span className="text-xs text-gray-400">● Offline</span>
          )} */}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={isLoading}
          />
          {unreadCount > 0 && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
            >
              Đánh dấu đã đọc
            </Button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto flex-1">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            description="Không có thông báo"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="py-8"
          />
        ) : (
          <div>
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  notification.status === 'UNREAD' ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  {/* Icon/Image */}
                  <div className="flex-shrink-0">
                    {notification.imageUrl ? (
                      <img
                        src={getCloudinaryUrl(notification.imageUrl)}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {notification.status === 'UNREAD' && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e: React.MouseEvent) => handleDelete(e, notification.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t text-center">
          <Button
            type="link"
            onClick={() => {
              router.push('/notifications');
              setOpen(false);
            }}
          >
            Xem tất cả thông báo
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
    >
      <button
        className={`relative p-2 hover:bg-gray-100 rounded-full transition-colors ${className}`}
        aria-label="Notifications"
      >
        <Badge count={unreadCount} overflowCount={99} offset={[-5, 5]}>
          <BellOutlined
            className={`text-xl ${isConnected ? 'text-blue-500' : 'text-gray-400'}`}
          />
        </Badge>
      </button>
    </Dropdown>
  );
};

export default NotificationBell;
