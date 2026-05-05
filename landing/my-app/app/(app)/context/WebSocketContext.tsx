'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useDemoChannel } from './DemoChannelContext';

export interface HelpRequest {
  id: string;
  userName: string;
  glassesId: string;
  timestamp: number;
}

interface WebSocketContextType {
  connected: boolean;
  helpRequests: HelpRequest[];
  activeCall: HelpRequest | null;
  acceptHelpRequest: (id: string) => void;
  ignoreHelpRequest: (id: string) => void;
  endCall: () => void;
  myRequestAccepted: boolean;
  acceptedByVolunteer: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { connected, lastMessage } = useWebSocket('ws://localhost:8081/ws_ui');
  const { lastMessage: demoMessage, broadcastAccept, broadcastEndCall } = useDemoChannel();
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [activeCall, setActiveCall] = useState<HelpRequest | null>(null);
  const [myRequestAccepted, setMyRequestAccepted] = useState(false);
  const [acceptedByVolunteer, setAcceptedByVolunteer] = useState<string | null>(null);

  // Handle real WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.type === 'help_request') {
      const payload = lastMessage.payload as HelpRequest;
      queueMicrotask(() => {
        setHelpRequests((prev) => {
          if (prev.some((r) => r.id === payload.id)) return prev;
          return [...prev, payload];
        });
      });
    }
  }, [lastMessage]);

  // Handle demo channel messages
  useEffect(() => {
    if (!demoMessage) return;

    if (demoMessage.type === 'help_request') {
      const payload = demoMessage.payload;
      queueMicrotask(() => {
        setHelpRequests((prev) => {
          if (prev.some((r) => r.id === payload.id)) return prev;
          return [...prev, payload];
        });
      });
    }

    if (demoMessage.type === 'accept_help') {
      const payload = demoMessage.payload;
      queueMicrotask(() => {
        setHelpRequests((prev) => prev.filter((r) => r.id !== payload.requestId));
        setActiveCall((prev) => {
          if (prev && prev.id === payload.requestId) return prev;
          return prev;
        });
        setMyRequestAccepted(true);
        setAcceptedByVolunteer(payload.volunteerName);
      });
    }

    if (demoMessage.type === 'end_call') {
      queueMicrotask(() => {
        setActiveCall(null);
        setMyRequestAccepted(false);
        setAcceptedByVolunteer(null);
      });
    }
  }, [demoMessage]);

  // Mock mode: simulate help requests when backend is not running
  useEffect(() => {
    if (connected) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const mockReq: HelpRequest = {
          id: `mock-${Date.now()}`,
          userName: ['Ming', 'Hong', 'Gang'][Math.floor(Math.random() * 3)],
          glassesId: `GL-2025-${String(Math.floor(Math.random() * 10)).padStart(3, '0')}`,
          timestamp: Date.now(),
        };
        queueMicrotask(() => {
          setHelpRequests((prev) => {
            if (prev.some((r) => r.id === mockReq.id)) return prev;
            return [...prev, mockReq];
          });
        });
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [connected]);

  const acceptHelpRequest = useCallback((id: string) => {
    const request = helpRequests.find((r) => r.id === id);
    if (!request) return;
    setHelpRequests((prev) => prev.filter((r) => r.id !== id));
    setActiveCall(request);
    broadcastAccept({ requestId: id, volunteerName: 'Volunteer' });
  }, [helpRequests, broadcastAccept]);

  const ignoreHelpRequest = useCallback((id: string) => {
    setHelpRequests((prev) => prev.filter((r) => r.id !== id));
    setActiveCall((prev) => (prev && prev.id === id ? null : prev));
  }, []);

  const endCall = useCallback(() => {
    if (activeCall) {
      broadcastEndCall({ requestId: activeCall.id });
    }
    setActiveCall(null);
    setMyRequestAccepted(false);
    setAcceptedByVolunteer(null);
    setHelpRequests((prev) => prev.filter((r) => r.id !== activeCall?.id));
  }, [activeCall, broadcastEndCall]);

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        helpRequests,
        activeCall,
        acceptHelpRequest,
        ignoreHelpRequest,
        endCall,
        myRequestAccepted,
        acceptedByVolunteer,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocketContext must be used within WebSocketProvider');
  return ctx;
}
