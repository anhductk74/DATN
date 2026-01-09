import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/v1/notifications`;
const WS_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}/ws/notifications`;

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  status: 'UNREAD' | 'READ';
  referenceId?: string;
  referenceType?: string;
  metadata?: string;
  imageUrl?: string;
  deepLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  data: {
    content: Notification[];
    hasNext: boolean;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    hasPrevious: boolean;
    currentPage: number;
  };
  success: boolean;
  message: string;
}

class NotificationService {
  private stompClient: Client | null = null;
  private userId: string | null = null;
  private token: string | null = null;
  private messageHandler: ((notification: Notification) => void) | null = null;
  private connectionStatusHandler: ((connected: boolean) => void) | null = null;

  /**
   * Connect WebSocket to receive real-time notifications
   */
  connect(
    userId: string,
    token: string,
    onMessage: (notification: Notification) => void,
    onConnectionStatus?: (connected: boolean) => void
  ) {
    if (this.stompClient && this.stompClient.connected) {
      console.log('⚠️ WebSocket already connected');
      return;
    }

    this.userId = userId;
    this.token = token;
    this.messageHandler = onMessage;
    this.connectionStatusHandler = onConnectionStatus || null;

    console.log('🔌 Connecting to WebSocket with token:', token.substring(0, 20) + '...');

    // Tạo SockJS connection with token in query params
    const wsUrlWithToken = `${WS_URL}?token=${token}`;
    const socket = new SockJS(wsUrlWithToken);

    // Tạo STOMP client
    this.stompClient = new Client({
      webSocketFactory: () => socket as any,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('🔌 STOMP:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('✅ WebSocket connected');
        this.connectionStatusHandler?.(true);

        // Subscribe to user-specific notification queue
        this.stompClient?.subscribe(
          `/user/${userId}/queue/notifications`,
          (message: IMessage) => {
            try {
              const notification = JSON.parse(message.body) as Notification;
              console.log('📩 New notification:', notification);
              this.messageHandler?.(notification);
            } catch (error) {
              console.error('❌ Error parsing notification:', error);
            }
          }
        );
      },

      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
        this.connectionStatusHandler?.(false);
      },

      onWebSocketClose: () => {
        console.log('🔌 WebSocket connection closed');
        this.connectionStatusHandler?.(false);
      },

      onWebSocketError: (error) => {
        console.error('❌ WebSocket error:', error);
        this.connectionStatusHandler?.(false);
      },
    });

    // Activate connection
    this.stompClient.activate();
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.userId = null;
      this.token = null;
      this.messageHandler = null;
      this.connectionStatusHandler = null;
      console.log('🔌 WebSocket disconnected');
    }
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.stompClient?.connected || false;
  }

  /**
   * Set new token (used when login or refresh token)
   */
  setToken(token: string) {
    console.log('🔑 Setting new token:', token.substring(0, 20) + '...');
    this.token = token;
  }

  // ============== REST API Methods ==============

  /**
   * Get notifications list with pagination
   */
  async getNotifications(page: number = 0, size: number = 20): Promise<NotificationResponse> {
    try {
      console.log('📡 Fetching notifications with token:', this.token?.substring(0, 20) + '...');
      const response = await axios.get(`${API_BASE_URL}?page=${page}&size=${size}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      console.log('📬 Notifications response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching notifications:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get unread notifications list
   */
  async getUnreadNotifications(page: number = 0, size: number = 20): Promise<NotificationResponse> {
    const response = await axios.get(`${API_BASE_URL}/unread?page=${page}&size=${size}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.data;
  }

  /**
   * Count unread notifications
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await axios.get(`${API_BASE_URL}/unread/count`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      console.log('📊 Unread count response:', response.data);
      // API có thể trả về: { count: 5 } hoặc { data: { count: 5 } }
      return response.data.count !== undefined ? response.data.count : (response.data.data?.count || 0);
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await axios.put(
      `${API_BASE_URL}/${notificationId}/read`,
      {},
      {
        headers: { Authorization: `Bearer ${this.token}` },
      }
    );
    return response.data;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await axios.put(
      `${API_BASE_URL}/read-all`,
      {},
      {
        headers: { Authorization: `Bearer ${this.token}` },
      }
    );
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/${notificationId}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(): Promise<void> {
    await axios.delete(`${API_BASE_URL}/all`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }
}

export default new NotificationService();
