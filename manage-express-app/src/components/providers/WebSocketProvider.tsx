'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { WebSocketMessage } from '@/services/WebSocketService';

interface WebSocketProviderProps {
  children: React.ReactNode;
  enabled?: boolean; // Chỉ connect khi enabled = true
}

export function WebSocketProvider({ children, enabled = true }: WebSocketProviderProps) {
  const { data: session, status } = useSession();
  const [shouldConnect, setShouldConnect] = useState(false);

  // Chỉ connect khi đã authenticated và có token
  useEffect(() => {
    console.log('🚀 [WebSocketProvider] Session status:', status);
    console.log('🚀 [WebSocketProvider] Has accessToken:', !!session?.accessToken);
    
    if (status === 'authenticated' && session?.accessToken && enabled) {
      console.log('📡 [WebSocketProvider] Enabling WebSocket connection...');
      setShouldConnect(true);
    } else {
      console.log('⏸️ [WebSocketProvider] WebSocket disabled - waiting for authentication');
      setShouldConnect(false);
    }
  }, [status, session, enabled]);

  // Custom handler cho các message (optional)
  const handleMessage = (message: WebSocketMessage) => {
    console.log('📨 [WebSocketProvider] Message received:', message);
  };

  // Connect WebSocket khi shouldConnect = true
  const { isConnected } = useWebSocket(shouldConnect ? handleMessage : undefined);

  useEffect(() => {
    if (isConnected) {
      console.log('✅ [WebSocketProvider] WebSocket connected successfully');
    }
  }, [isConnected]);

  return <>{children}</>;
}
