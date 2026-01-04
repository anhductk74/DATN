import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ===============================
// DTO WebSocket
// ===============================

export interface ShipmentStatusMessage {
  type: 'SHIPMENT_STATUS_UPDATE';
  shipmentOrderId: string;
  status: string;
  message: string;
  timestamp?: string;
}

export interface SubShipmentStatusMessage {
  type: 'SUB_STATUS_UPDATE';
  subShipmentId: string;
  shipmentOrderId: string;
  shipperId?: string;
  status: string;
  message: string;
  timestamp?: string;
}

export interface GeneralStatusMessage {
  type: 'STATUS_UPDATE';
  entityId: string;
  entityType: 'SHIPMENT' | 'SUB_SHIPMENT' | 'ORDER';
  status: string;
  message: string;
  timestamp?: string;
}

export type WebSocketMessage = 
  | ShipmentStatusMessage 
  | SubShipmentStatusMessage 
  | GeneralStatusMessage;

type MessageCallback = (message: WebSocketMessage) => void;

// ===============================
// SERVICE
// ===============================

class WebSocketService {
  private client: Client | null = null;
  private listeners: MessageCallback[] = [];
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;

  /**
   * Lấy token từ localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
  }

  /**
   * Kết nối WebSocket
   */
  connect(token?: string): void {
    if (this.client?.connected || this.isConnecting) {
      console.log('🔄 [WS] Already connected or connecting');
      return;
    }

    try {
      this.isConnecting = true;

      // Ưu tiên token từ parameter, sau đó mới lấy từ localStorage
      const authToken = token || this.getToken();
      console.log('🔐 [WS] Token:', authToken ? `${authToken.substring(0, 20)}...` : 'null');
      
      if (!authToken) {
        console.error('❌ [WS] No authentication token found');
        this.isConnecting = false;
        return;
      }

      const wsUrl = API_BASE_URL + '/ws';
      console.log('🌐 [WS] Connecting to:', wsUrl);

      console.log('🔧 [WS] Creating STOMP client...');

      this.client = new Client({
        webSocketFactory: () => {
          console.log('🏭 [WS] Creating SockJS connection...');
          return new SockJS(wsUrl) as any;
        },
        connectHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
        debug: (str) => {
          console.log('🔍 STOMP Debug:', str);
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        beforeConnect: () => {
          console.log('⏳ [WS] About to connect...');
        },
        onConnect: () => {
          console.log('✅ [WS] Connected successfully!');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.subscribeToManagerTopics();
          toast.success('WebSocket connected', { 
            position: 'bottom-right',
            duration: 2000 
          });
        },
        onStompError: (frame) => {
          console.error('❌ [WS] STOMP error:', frame.headers['message']);
          console.error('📋 [WS] Error body:', frame.body);
          console.error('📋 [WS] Error headers:', JSON.stringify(frame.headers));
          this.isConnecting = false;
        },
        onWebSocketClose: (event) => {
          console.log('🔌 [WS] Connection closed. Code:', event.code, 'Reason:', event.reason);
          this.isConnecting = false;
          this.handleReconnect();
        },
        onWebSocketError: (error) => {
          console.error('❌ [WS] WebSocket error:', error);
          this.isConnecting = false;
        },
        onDisconnect: () => {
          console.log('🔴 [WS] Disconnected from server');
        },
      });

      console.log('▶️ [WS] Activating STOMP client...');
      this.client.activate();
      console.log('✅ [WS] STOMP client activated, waiting for connection...');
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.isConnecting = false;
    }
  }

  /**
   * Đăng ký lắng nghe các topic cho manager
   */
  private subscribeToManagerTopics(): void {
    if (!this.client) {
      console.error('❌ [WS] Cannot subscribe: client is null');
      return;
    }

    console.log('📡 [WS] Subscribing to manager topics...');

    // Subscribe to shipment status updates topic
    const sub1 = this.client.subscribe('/topic/subshipment-status', (message: IMessage) => {
      console.log('📨 [WS] Message from /topic/subshipment-status');
      this.handleMessage(message);
    });
    console.log('✅ [WS] Subscribed to /topic/subshipment-status, ID:', sub1.id);

    // Subscribe to general status updates
    const sub2 = this.client.subscribe('/topic/status-updates', (message: IMessage) => {
      console.log('📨 [WS] Message from /topic/status-updates');
      this.handleMessage(message);
    });
    console.log('✅ [WS] Subscribed to /topic/status-updates, ID:', sub2.id);
    console.log('👂 [WS] Waiting for messages from backend...');
  }

  /**
   * Xử lý message nhận được
   */
  private handleMessage(message: IMessage): void {
    console.log('\n🎉 ========== MESSAGE RECEIVED ========== 🎉');
    console.log('📨 [WS] Raw message body:', message.body);
    console.log('📨 [WS] Message headers:', JSON.stringify(message.headers));
    
    try {
      const data: WebSocketMessage = JSON.parse(message.body);
      console.log('✅ [WS] Parsed message:');
      console.log('   - Type:', data.type);
      console.log('   - Message:', data.message);
      console.log('   - Data:', JSON.stringify(data, null, 2));
      
      // Hiển thị toast notification
      this.showNotification(data);
      
      // Notify listeners
      console.log('📢 [WS] Notifying', this.listeners.length, 'listener(s)');
      this.notifyListeners(data);
      console.log('========================================\n');
    } catch (error) {
      console.error('❌ [WS] Failed to parse message:', error);
      console.error('Raw body was:', message.body);
    }
  }

  /**
   * Hiển thị notification ở góc dưới phải
   */
  private showNotification(data: WebSocketMessage): void {
    const toastOptions = {
      position: 'bottom-right' as const,
      duration: 5000,
    };

    switch (data.type) {
      case 'SHIPMENT_STATUS_UPDATE':
        toast.success(
          `📦 ${data.message || `Shipment ${data.shipmentOrderId} - Status: ${data.status}`}`,
          toastOptions
        );
        break;

      case 'SUB_STATUS_UPDATE':
        toast(
          `🚚 ${data.message || `Sub-Shipment ${data.subShipmentId} - Status: ${data.status}`}`,
          {
            ...toastOptions,
            icon: '🚚',
            style: {
              background: '#3b82f6',
              color: '#fff',
            },
          }
        );
        break;

      case 'STATUS_UPDATE':
        const icon = data.entityType === 'SHIPMENT' ? '📦' : 
                     data.entityType === 'SUB_SHIPMENT' ? '🚚' : '📋';
        toast(
          `${icon} ${data.message || `${data.entityType} ${data.entityId} - Status: ${data.status}`}`,
          toastOptions
        );
        break;
    }
  }

  /**
   * Thông báo cho tất cả listeners
   */
  private notifyListeners(message: WebSocketMessage): void {
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
      console.log(`🔄 [WS] Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ [WS] Max reconnect attempts reached');
      toast.error('WebSocket connection failed', {
        position: 'bottom-right',
        duration: 5000,
      });
    }
  }

  /**
   * Ngắt kết nối WebSocket
   */
  disconnect(): void {
    if (this.client) {
      console.log('🔌 [WS] Disconnecting WebSocket...');
      this.client.deactivate();
      this.client = null;
      this.listeners = [];
      this.reconnectAttempts = 0;
      console.log('✅ [WS] WebSocket disconnected');
    }
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}

export const webSocketService = new WebSocketService();
