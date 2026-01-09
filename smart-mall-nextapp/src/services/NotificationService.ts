import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { API_BASE_URL } from '@/config/config';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  status: 'UNREAD' | 'READ';
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, any>;
  imageUrl?: string;
  deepLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotifications {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

type NotificationCallback = (notification: Notification) => void;

/**
 * Notification Service - WebSocket Client
 * Manages WebSocket connection to backend notification system
 */
class NotificationService {
  private stompClient: Client | null = null;
  private callbacks: NotificationCallback[] = [];
  private userId: string | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isConnecting = false;

  /**
   * Connect to WebSocket server
   */
  async connect(userId: string, token: string): Promise<void> {
    if (this.stompClient?.active) {
      console.log('⚠️ Already connected to notification service');
      return;
    }

    if (this.isConnecting) {
      console.log('⚠️ Connection already in progress');
      return;
    }

    this.isConnecting = true;
    this.userId = userId;
    this.token = token;

    return new Promise((resolve, reject) => {
      try {
        const socketUrl = `${API_BASE_URL}/ws/notifications?token=${encodeURIComponent(token)}`;
        const socket = new SockJS(socketUrl);

        this.stompClient = new Client({
          webSocketFactory: () => socket as any,
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,

          onConnect: () => {
            console.log('✅ Connected to notification service');
            this.isConnecting = false;
            this.reconnectAttempts = 0;

            // Subscribe to user-specific notifications
            if (this.stompClient && this.userId) {
              this.stompClient.subscribe(
                `/user/${this.userId}/queue/notifications`,
                (message: IMessage) => {
                  try {
                    const notification: Notification = JSON.parse(message.body);
                    this.handleNotification(notification);
                  } catch (error) {
                    console.error('Error parsing notification:', error);
                  }
                }
              );
            }

            resolve();
          },

          onStompError: (frame) => {
            console.error('❌ STOMP Error:', frame.headers['message']);
            this.isConnecting = false;
            reject(new Error(frame.headers['message'] || 'STOMP connection error'));
          },

          onWebSocketClose: () => {
            console.log('🔌 WebSocket connection closed');
            this.isConnecting = false;
            this.handleReconnect();
          },

          onWebSocketError: (error) => {
            console.error('❌ WebSocket Error:', error);
            this.isConnecting = false;
          },
        });

        this.stompClient.activate();
      } catch (error) {
        this.isConnecting = false;
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (this.userId && this.token && !this.stompClient?.active && !this.isConnecting) {
        this.connect(this.userId, this.token).catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.callbacks = [];
      this.userId = null;
      this.token = null;
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      console.log('👋 Disconnected from notification service');
    }
  }

  /**
   * Subscribe to notifications
   */
  subscribe(callback: NotificationCallback): () => void {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Handle incoming notification
   */
  private handleNotification(notification: Notification): void {
    // Notify all subscribers
    this.callbacks.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });

    // Show browser notification if permitted
    this.showBrowserNotification(notification);
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: Notification): void {
    if (typeof window === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: notification.imageUrl || '/logo.png',
        badge: '/logo.png',
        tag: notification.id,
        requireInteraction: false,
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.deepLink) {
          window.location.href = notification.deepLink;
        }
        browserNotification.close();
      };
    } catch (error) {
      console.error('Failed to show browser notification:', error);
    }
  }

  /**
   * Request browser notification permission
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.stompClient?.active || false;
  }

  // ==================== REST API Methods ====================

  private async fetchAPI(endpoint: string, options: RequestInit = {}): Promise<any> {
    // Try to get token from multiple sources
    const token = this.token || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token') || 
                  sessionStorage.getItem('token');
    
    // API_BASE_URL is already without /api (stripped in config.ts)
    // So we need to add /api/v1 prefix
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const fullUrl = `${apiUrl}/v1${endpoint}`;

    console.log('🔍 Fetching:', fullUrl);
    console.log('🔑 Token available:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('✅ API Response:', responseData);
    
    // Backend wraps response in { data: {...}, success: true, message: "..." }
    // Return the data object directly
    return responseData.data || responseData;
  }

  /**
   * Get all notifications (paginated)
   */
  async getNotifications(page = 0, size = 20): Promise<PaginatedNotifications> {
    return this.fetchAPI(`/notifications?page=${page}&size=${size}`);
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(page = 0, size = 20): Promise<PaginatedNotifications> {
    return this.fetchAPI(`/notifications/unread?page=${page}&size=${size}`);
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const response = await this.fetchAPI('/notifications/unread/count');
    // Response structure: { count: 12 } or wrapped in data
    return response.count || 0;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await this.fetchAPI(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ updatedCount: number }> {
    return this.fetchAPI('/notifications/read-all', {
      method: 'PUT',
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await this.fetchAPI(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(): Promise<void> {
    await this.fetchAPI('/notifications/all', {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;
