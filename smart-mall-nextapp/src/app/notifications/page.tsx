'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Typography, 
  Button, 
  Tabs, 
  List, 
  Empty,
  Spin,
  Tag
} from "antd";
import Card from "antd/es/card";
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  DeleteOutlined,
  CheckOutlined
} from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import useAutoLogout from "@/hooks/useAutoLogout";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const { Title, Text } = Typography;

export default function NotificationsPage() {
  const router = useRouter();
  const { session, status } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('all');
  
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
  
  useAutoLogout();

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      ORDER_CREATED: '🛍️',
      ORDER_CONFIRMED: '✅',
      ORDER_SHIPPED: '🚚',
      ORDER_DELIVERED: '📦',
      ORDER_CANCELLED: '❌',
      ORDER_COMPLETED: '🎉',
      PAYMENT_SUCCESS: '💰',
      PAYMENT_FAILED: '⚠️',
      VOUCHER_RECEIVED: '🎫',
      SYSTEM_ANNOUNCEMENT: '📢',
    };
    return iconMap[type] || '🔔';
  };

  const getNotificationTypeColor = (type: string) => {
    if (type.startsWith('ORDER_')) return 'blue';
    if (type.startsWith('PAYMENT_')) return 'green';
    if (type.startsWith('VOUCHER_')) return 'orange';
    if (type.startsWith('SYSTEM_')) return 'purple';
    return 'default';
  };

  const getNotificationCategory = (type: string): 'order' | 'promotion' | 'system' => {
    if (type.startsWith('ORDER_') || type.startsWith('PAYMENT_')) return 'order';
    if (type.startsWith('VOUCHER_') || type.startsWith('PRODUCT_PRICE')) return 'promotion';
    return 'system';
  };

  const filterNotifications = (category?: string) => {
    if (!category || category === 'all') {
      return notifications;
    }
    return notifications.filter(n => getNotificationCategory(n.type) === category);
  };

  const handleNotificationClick = async (notification: any) => {
    if (notification.status === 'UNREAD') {
      await markAsRead(notification.id);
    }
    if (notification.deepLink) {
      router.push(notification.deepLink);
    }
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
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

  const getUnreadCount = (category?: string) => {
    const filtered = filterNotifications(category);
    return filtered.filter(n => n.status === 'UNREAD').length;
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push('/login');
    return null;
  }

  const filteredNotifications = filterNotifications(activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/')}
            className="mb-4"
          >
            Quay lại
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Title level={2} className="!mb-0">Thông báo</Title>
              {isConnected ? (
                <Tag color="green">● Online</Tag>
              ) : (
                <Tag color="default">● Offline</Tag>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => loadNotifications(0, 20)}
                loading={isLoading}
              >
                Làm mới
              </Button>
              {unreadCount > 0 && (
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={markAllAsRead}
                >
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Card>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={[
              {
                key: 'all',
                label: (
                  <span>
                    Tất cả
                    {getUnreadCount('all') > 0 && (
                      <Tag color="red" className="ml-2">
                        {getUnreadCount('all')}
                      </Tag>
                    )}
                  </span>
                ),
              },
              {
                key: 'order',
                label: (
                  <span>
                    Đơn hàng
                    {getUnreadCount('order') > 0 && (
                      <Tag color="red" className="ml-2">
                        {getUnreadCount('order')}
                      </Tag>
                    )}
                  </span>
                ),
              },
              {
                key: 'promotion',
                label: (
                  <span>
                    Khuyến mãi
                    {getUnreadCount('promotion') > 0 && (
                      <Tag color="red" className="ml-2">
                        {getUnreadCount('promotion')}
                      </Tag>
                    )}
                  </span>
                ),
              },
              {
                key: 'system',
                label: (
                  <span>
                    Hệ thống
                    {getUnreadCount('system') > 0 && (
                      <Tag color="red" className="ml-2">
                        {getUnreadCount('system')}
                      </Tag>
                    )}
                  </span>
                ),
              },
            ]}
          />

          {/* Notifications List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Empty
              description="Không có thông báo"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="py-12"
            />
          ) : (
            <List
              dataSource={filteredNotifications}
              renderItem={(notification) => (
                <List.Item
                  key={notification.id}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                    notification.status === 'UNREAD' ? 'bg-blue-50' : ''
                  }`}
                  actions={[
                    <Button
                      key="delete"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                    >
                      Xóa
                    </Button>,
                  ]}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <List.Item.Meta
                    avatar={
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                    }
                    title={
                      <div className="flex items-center gap-2">
                        <span className={notification.status === 'UNREAD' ? 'font-bold' : ''}>
                          {notification.title}
                        </span>
                        <Tag color={getNotificationTypeColor(notification.type)} className="text-xs">
                          {notification.type}
                        </Tag>
                        {notification.status === 'UNREAD' && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <Text className="block mb-1">{notification.message}</Text>
                        <Text type="secondary" className="text-xs">
                          {formatTime(notification.createdAt)}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>

      <Footer />
    </div>
  );
}
