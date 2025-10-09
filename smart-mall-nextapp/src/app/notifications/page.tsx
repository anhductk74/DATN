'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  Typography, 
  Button, 
  Tabs, 
  List, 
  Avatar, 
  Badge, 
  Divider,
  Empty,
  message,
  Tag
} from "antd";
import {
  ArrowLeftOutlined,
  BellOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  CheckOutlined
} from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import useAutoLogout from "@/hooks/useAutoLogout";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Notification types
type NotificationType = 'order' | 'promotion' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  imageUrl?: string;
  priority: 'high' | 'medium' | 'low';
}

// Mock notifications data
const mockNotifications: Notification[] = [
  // Order Updates
  {
    id: '1',
    type: 'order',
    title: 'Order Shipped',
    message: 'Your order #ORD001 (iPhone 15 Pro Max) has been shipped and is on the way!',
    timestamp: '2024-01-18T10:30:00Z',
    isRead: false,
    actionUrl: '/orders/ORD001',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=60&h=60&fit=crop&crop=center',
    priority: 'high'
  },
  {
    id: '2',
    type: 'order',
    title: 'Order Delivered',
    message: 'Your order #ORD002 has been successfully delivered. Please rate your experience!',
    timestamp: '2024-01-17T15:45:00Z',
    isRead: true,
    actionUrl: '/orders/ORD002',
    imageUrl: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=60&h=60&fit=crop&crop=center',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'order',
    title: 'Payment Confirmed',
    message: 'Payment for order #ORD003 has been confirmed. Your order is being processed.',
    timestamp: '2024-01-17T09:20:00Z',
    isRead: true,
    actionUrl: '/orders/ORD003',
    priority: 'medium'
  },
  
  // Promotions
  {
    id: '4',
    type: 'promotion',
    title: 'Flash Sale Alert! 🔥',
    message: '50% OFF on Electronics! Limited time offer ending in 2 hours. Shop now!',
    timestamp: '2024-01-18T08:00:00Z',
    isRead: false,
    actionUrl: '/promotions/flash-sale',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=60&h=60&fit=crop&crop=center',
    priority: 'high'
  },
  {
    id: '5',
    type: 'promotion',
    title: 'Exclusive Voucher for You! 🎁',
    message: 'Get $20 OFF on your next purchase. Use code: SAVE20. Valid until tomorrow!',
    timestamp: '2024-01-17T16:30:00Z',
    isRead: false,
    actionUrl: '/vouchers',
    priority: 'medium'
  },
  {
    id: '6',
    type: 'promotion',
    title: 'Weekend Special Deals',
    message: 'Discover amazing weekend deals with up to 70% discount on selected items.',
    timestamp: '2024-01-16T12:00:00Z',
    isRead: true,
    actionUrl: '/deals/weekend',
    priority: 'low'
  },
  
  // System Updates
  {
    id: '7',
    type: 'system',
    title: 'SmartMall App Update Available',
    message: 'New features: Enhanced search, better UI, and improved performance. Update now!',
    timestamp: '2024-01-18T07:00:00Z',
    isRead: false,
    actionUrl: '/app-update',
    priority: 'medium'
  },
  {
    id: '8',
    type: 'system',
    title: 'Privacy Policy Update',
    message: 'We have updated our privacy policy. Please review the changes to stay informed.',
    timestamp: '2024-01-15T14:00:00Z',
    isRead: true,
    actionUrl: '/privacy-policy',
    priority: 'low'
  },
  {
    id: '9',
    type: 'system',
    title: 'New Payment Method Added',
    message: 'You can now pay with Apple Pay and Google Pay for faster checkout experience.',
    timestamp: '2024-01-14T11:30:00Z',
    isRead: true,
    actionUrl: '/payment-methods',
    priority: 'medium'
  }
];

export default function NotificationsPage() {
  const router = useRouter();
  const { session, status } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Auto logout after 30 minutes of inactivity
  useAutoLogout({
    timeout: 30 * 60 * 1000, // 30 minutes
    onLogout: () => {
      router.push("/login");
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const getNotificationIcon = (type: NotificationType, priority: string) => {
    const iconProps = {
      className: `text-xl ${
        priority === 'high' ? 'text-red-500' :
        priority === 'medium' ? 'text-orange-500' :
        'text-blue-500'
      }`
    };

    switch (type) {
      case 'order':
        return <ShoppingCartOutlined {...iconProps} />;
      case 'promotion':
        return <TagOutlined {...iconProps} />;
      case 'system':
        return <InfoCircleOutlined {...iconProps} />;
      default:
        return <BellOutlined {...iconProps} />;
    }
  };

  const getNotificationTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'order':
        return 'blue';
      case 'promotion':
        return 'orange';
      case 'system':
        return 'green';
      default:
        return 'default';
    }
  };

  const getNotificationTypeName = (type: NotificationType) => {
    switch (type) {
      case 'order':
        return 'Order Update';
      case 'promotion':
        return 'Promotion';
      case 'system':
        return 'SmartMall Update';
      default:
        return 'Notification';
    }
  };

  const filterNotifications = (type?: NotificationType) => {
    if (!type || type === 'all' as any) {
      return notifications;
    }
    return notifications.filter(notification => notification.type === type);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    message.success('All notifications marked as read');
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
    message.success('Notification deleted');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const getUnreadCount = (type?: NotificationType) => {
    const filtered = filterNotifications(type);
    return filtered.filter(n => !n.isRead).length;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading notifications...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-6">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/home')}
              className="mb-4 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
            >
              Back to Home
            </Button>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <BellOutlined className="text-white text-xl" />
                </div>
                <div>
                  <Title level={2} className="mb-0">Notifications</Title>
                  <Text type="secondary">Stay updated with your latest activities</Text>
                </div>
              </div>
              
              <Button 
                icon={<CheckOutlined />}
                onClick={markAllAsRead}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:shadow-lg transition-all duration-300"
              >
                Mark All Read
              </Button>
            </div>
          </div>

          {/* Notification Tabs */}
          <Card className="shadow-sm">
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              className="notification-tabs"
            >
              <TabPane 
                tab={
                  <Badge count={getUnreadCount()} size="small">
                    <span className="flex items-center space-x-2">
                      <BellOutlined />
                      <span>All</span>
                    </span>
                  </Badge>
                } 
                key="all"
              >
                <NotificationList 
                  notifications={filterNotifications()}
                  onNotificationClick={handleNotificationClick}
                  onDelete={deleteNotification}
                  formatTimestamp={formatTimestamp}
                  getNotificationIcon={getNotificationIcon}
                  getNotificationTypeColor={getNotificationTypeColor}
                  getNotificationTypeName={getNotificationTypeName}
                />
              </TabPane>
              
              <TabPane 
                tab={
                  <Badge count={getUnreadCount('order')} size="small">
                    <span className="flex items-center space-x-2">
                      <ShoppingCartOutlined />
                      <span>Order Updates</span>
                    </span>
                  </Badge>
                } 
                key="order"
              >
                <NotificationList 
                  notifications={filterNotifications('order')}
                  onNotificationClick={handleNotificationClick}
                  onDelete={deleteNotification}
                  formatTimestamp={formatTimestamp}
                  getNotificationIcon={getNotificationIcon}
                  getNotificationTypeColor={getNotificationTypeColor}
                  getNotificationTypeName={getNotificationTypeName}
                />
              </TabPane>
              
              <TabPane 
                tab={
                  <Badge count={getUnreadCount('promotion')} size="small">
                    <span className="flex items-center space-x-2">
                      <TagOutlined />
                      <span>Promotions</span>
                    </span>
                  </Badge>
                } 
                key="promotion"
              >
                <NotificationList 
                  notifications={filterNotifications('promotion')}
                  onNotificationClick={handleNotificationClick}
                  onDelete={deleteNotification}
                  formatTimestamp={formatTimestamp}
                  getNotificationIcon={getNotificationIcon}
                  getNotificationTypeColor={getNotificationTypeColor}
                  getNotificationTypeName={getNotificationTypeName}
                />
              </TabPane>
              
              <TabPane 
                tab={
                  <Badge count={getUnreadCount('system')} size="small">
                    <span className="flex items-center space-x-2">
                      <InfoCircleOutlined />
                      <span>SmartMall Updates</span>
                    </span>
                  </Badge>
                } 
                key="system"
              >
                <NotificationList 
                  notifications={filterNotifications('system')}
                  onNotificationClick={handleNotificationClick}
                  onDelete={deleteNotification}
                  formatTimestamp={formatTimestamp}
                  getNotificationIcon={getNotificationIcon}
                  getNotificationTypeColor={getNotificationTypeColor}
                  getNotificationTypeName={getNotificationTypeName}
                />
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Notification List Component
interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onDelete: (id: string) => void;
  formatTimestamp: (timestamp: string) => string;
  getNotificationIcon: (type: NotificationType, priority: string) => React.ReactNode;
  getNotificationTypeColor: (type: NotificationType) => string;
  getNotificationTypeName: (type: NotificationType) => string;
}

function NotificationList({ 
  notifications, 
  onNotificationClick, 
  onDelete, 
  formatTimestamp,
  getNotificationIcon,
  getNotificationTypeColor,
  getNotificationTypeName
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <Empty 
        description="No notifications found"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className="py-12"
      >
        <Text type="secondary">You're all caught up! 🎉</Text>
      </Empty>
    );
  }

  return (
    <List
      dataSource={notifications}
      renderItem={(notification) => (
        <List.Item
          className={`cursor-pointer transition-all duration-200 rounded-lg mb-2 ${
            !notification.isRead 
              ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500' 
              : 'hover:bg-gray-50'
          }`}
          onClick={() => onNotificationClick(notification)}
        >
          <div className="flex items-start space-x-4 w-full p-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              {notification.imageUrl ? (
                <Avatar src={notification.imageUrl} size={50} />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  {getNotificationIcon(notification.type, notification.priority)}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Tag color={getNotificationTypeColor(notification.type)} className="text-xs">
                  {getNotificationTypeName(notification.type)}
                </Tag>
                {notification.priority === 'high' && (
                  <Tag color="red" className="text-xs">
                    Urgent
                  </Tag>
                )}
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              
              <h4 className={`text-base mb-1 ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                {notification.title}
              </h4>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {notification.message}
              </p>
              
              <div className="flex items-center justify-between">
                <Text type="secondary" className="text-xs">
                  {formatTimestamp(notification.timestamp)}
                </Text>
                
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>
        </List.Item>
      )}
    />
  );
}