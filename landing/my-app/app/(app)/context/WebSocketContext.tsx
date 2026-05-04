'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface HelpRequest {
  id: string;
  userName: string;
  glassesId: string;
}

interface WebSocketContextType {
  connected: boolean;
  helpRequest: HelpRequest | null;
  clearHelpRequest: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { connected, lastMessage } = useWebSocket('ws://localhost:8081/ws_ui');
  const [helpRequest, setHelpRequest] = useState<HelpRequest | null>(null);

  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.type === 'help_request') {
      setHelpRequest(lastMessage.payload as HelpRequest);
    }
  }, [lastMessage]);

  // Mock mode: simulate help requests when backend is not running
  useEffect(() => {
    if (connected) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setHelpRequest({
          id: `mock-${Date.now()}`,
          userName: ['小明', '小红', '小刚'][Math.floor(Math.random() * 3)],
          glassesId: `GL-2025-${String(Math.floor(Math.random() * 10)).padStart(3, '0')}`,
        });
      }
    }, 45000); // 45s interval
    return () => clearInterval(interval);
  }, [connected]);

  const clearHelpRequest = () => setHelpRequest(null);

  return (
    <WebSocketContext.Provider value={{ connected, helpRequest, clearHelpRequest }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocketContext must be used within WebSocketProvider');
  return ctx;
}
