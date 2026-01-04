import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.202:8080';

// ===============================
// DTO WebSocket
// ===============================

export interface DeliveryMessage {
  type: 'ASSIGNED' | 'STATUS_UPDATE';
  subShipmentId: string;
  shipmentOrderId: string;
  shipperId: string;
  status: string;
  message: string;
}

type MessageCallback = (message: DeliveryMessage) => void;

// ===============================
// SERVICE
// ===============================

class WebSocketService {
  private client: Client | null = null;
  private shipperId: string | null = null;
  private listeners: MessageCallback[] = [];
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;

  /**
   * Lấy token từ AsyncStorage
   */
  private async getToken(): Promise<string | null> {
    let token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      token = await AsyncStorage.getItem("@smartmall_access_token");
    }
    return token;
  }

  /**
   * Lấy thông tin user và shipperId từ AsyncStorage
   */
  private async getShipperId(): Promise<string | null> {
    const userInfoStr = await AsyncStorage.getItem('@smartmall_user_info');
    if (!userInfoStr) return null;
    
    try {
      const userInfo = JSON.parse(userInfoStr);
      return userInfo?.shipper?.id || userInfo?.shipper?.shipperId || null;
    } catch (error) {
      console.error('Failed to parse user info:', error);
      return null;
    }
  }

  /**
   * Kết nối WebSocket
   */
  async connect(): Promise<void> {
    if (this.client?.connected || this.isConnecting) {
      return;
    }

    try {
      this.isConnecting = true;
      
      // Lấy token và shipperId
      const token = await this.getToken();
      const shipperId = await this.getShipperId();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!shipperId) {
        throw new Error('No shipper ID found');
      }

      this.shipperId = shipperId;

      // Tạo WebSocket URL - SockJS cần HTTP URL, không phải WS!
      const wsUrl = API_BASE_URL + '/ws';
      
      this.client = new Client({
        webSocketFactory: () => new SockJS(wsUrl) as any,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.subscribeToShipperQueue();
        },
        onStompError: (frame) => {
          console.error('WebSocket STOMP error:', frame.headers['message']);
          this.isConnecting = false;
        },
        onWebSocketClose: (event) => {
          this.isConnecting = false;
          this.handleReconnect();
        },
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
        },
      });

      this.client.activate();
    } catch (error) {
      console.error('❌ Failed to connect WebSocket:', error);
      this.isConnecting = false;
      throw error;
    }
  }

  /**
   * Đăng ký lắng nghe queue của shipper
   */
  private subscribeToShipperQueue(): void {
    if (!this.client || !this.shipperId) {
      return;
    }

    const queueDestination = `/queue/shipper/${this.shipperId}`;
    
    this.client.subscribe(queueDestination, (message: IMessage) => {
      try {
        const deliveryMessage: DeliveryMessage = JSON.parse(message.body);
        this.notifyListeners(deliveryMessage);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });
  }

  /**
   * Thông báo cho tất cả listeners
   */
  private notifyListeners(message: DeliveryMessage): void {
    this.listeners.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in WebSocket listener:', error);
      }
    });
  }

  /**
   * Đăng ký listener để nhận message
   */
  addListener(callback: MessageCallback): () => void {
    this.listeners.push(callback);
    
    // Trả về function để remove listener
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Xử lý reconnect
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('Reconnect failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  /**
   * Ngắt kết nối WebSocket
   */
  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.shipperId = null;
      this.listeners = [];
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  /**
   * Gửi message (nếu cần)
   */
  sendMessage(destination: string, body: any): void {
    if (this.client?.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.error('Cannot send message: WebSocket not connected');
    }
  }
}

export const websocketService = new WebSocketService();
