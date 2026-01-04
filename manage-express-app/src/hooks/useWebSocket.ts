import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { webSocketService, type WebSocketMessage } from '@/services/WebSocketService';

/**
 * Hook để kết nối và lắng nghe WebSocket
 * Tự động connect khi component mount và disconnect khi unmount
 */
export function useWebSocket(callback?: (message: WebSocketMessage) => void) {
  const { data: session } = useSession();
  const callbackRef = useRef(callback);

  // Update callback ref without triggering effect
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    console.log('🔌 [useWebSocket] Hook mounted, has callback:', !!callback);
    console.log('🔌 [useWebSocket] Has session token:', !!session?.accessToken);
    
    // Chỉ connect khi có callback và có token
    if (!callback || !session?.accessToken) {
      console.log('⏸️ [useWebSocket] Missing callback or token, skipping connection');
      return;
    }

    console.log('📞 [useWebSocket] Calling webSocketService.connect() with token...');
    webSocketService.connect(session.accessToken);

    // Register listener
    console.log('👂 [useWebSocket] Registering listener...');
    const removeListener = webSocketService.addListener((message) => {
      callbackRef.current?.(message);
    });

    // Cleanup khi unmount
    return () => {
      console.log('🧹 [useWebSocket] Cleanup - disconnecting...');
      removeListener();
      webSocketService.disconnect();
    };
  }, [!!callback, session?.accessToken]); // Phụ thuộc vào callback và token

  return {
    isConnected: webSocketService.isConnected(),
    disconnect: () => webSocketService.disconnect(),
    reconnect: () => webSocketService.connect(),
  };
}

/**
 * Hook để chỉ lắng nghe WebSocket mà không tự động connect
 * Useful khi bạn muốn control connection manually
 */
export function useWebSocketListener(callback: (message: WebSocketMessage) => void) {
  useEffect(() => {
    const removeListener = webSocketService.addListener(callback);
    return removeListener;
  }, [callback]);
}
