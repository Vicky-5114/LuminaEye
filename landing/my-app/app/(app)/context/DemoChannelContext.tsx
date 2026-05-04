'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

export interface HelpRequestPayload {
  id: string;
  userName: string;
  glassesId: string;
  timestamp: number;
}

export interface AcceptPayload {
  requestId: string;
  volunteerName: string;
}

export interface EndCallPayload {
  requestId: string;
}

export type DemoMessage =
  | { type: 'help_request'; payload: HelpRequestPayload }
  | { type: 'accept_help'; payload: AcceptPayload }
  | { type: 'end_call'; payload: EndCallPayload };

interface DemoChannelContextType {
  broadcastHelpRequest: (payload: HelpRequestPayload) => void;
  broadcastAccept: (payload: AcceptPayload) => void;
  broadcastEndCall: (payload: EndCallPayload) => void;
  lastMessage: DemoMessage | null;
}

const DemoChannelContext = createContext<DemoChannelContextType | undefined>(undefined);

const CHANNEL_NAME = 'lumina-demo';

export function DemoChannelProvider({ children }: { children: React.ReactNode }) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [lastMessage, setLastMessage] = useState<DemoMessage | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<DemoMessage>) => {
      setLastMessage(event.data);
    };

    return () => channel.close();
  }, []);

  const broadcastHelpRequest = useCallback((payload: HelpRequestPayload) => {
    channelRef.current?.postMessage({ type: 'help_request', payload });
  }, []);

  const broadcastAccept = useCallback((payload: AcceptPayload) => {
    channelRef.current?.postMessage({ type: 'accept_help', payload });
  }, []);

  const broadcastEndCall = useCallback((payload: EndCallPayload) => {
    channelRef.current?.postMessage({ type: 'end_call', payload });
  }, []);

  return (
    <DemoChannelContext.Provider
      value={{ broadcastHelpRequest, broadcastAccept, broadcastEndCall, lastMessage }}
    >
      {children}
    </DemoChannelContext.Provider>
  );
}

export function useDemoChannel() {
  const ctx = useContext(DemoChannelContext);
  if (!ctx) throw new Error('useDemoChannel must be used within DemoChannelProvider');
  return ctx;
}
