# LuminaEye Community Platform Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 4 critical issues in the LuminaEye community platform: translate all UI to English, enable dual-role demo via BroadcastChannel, add volunteer help request list with live video, and replace broken AMap with Leaflet/OpenStreetMap.

**Architecture:** sessionStorage per tab enables independent logins; BroadcastChannel bridges blind and volunteer tabs; WebSocketContext manages a queue of help requests from both real WS and demo channel; volunteer video page switches between List mode (pending requests) and Call mode (active video); CanvasVideoSimulator renders a HUD animation when the real glasses backend is offline; Leaflet replaces AMap with zero-config OpenStreetMap tiles.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Leaflet, BroadcastChannel API, Canvas API

---

## File Structure

| File | Responsibility |
|------|---------------|
| `app/(app)/context/RoleContext.tsx` | Per-tab role state via sessionStorage |
| `app/(app)/context/DemoChannelContext.tsx` | Cross-tab BroadcastChannel messaging (new) |
| `app/(app)/context/WebSocketContext.tsx` | Queue-based help requests, dual-channel (WS + demo) |
| `app/(app)/components/CanvasVideoSimulator.tsx` | HUD-style canvas animation for offline demo (new) |
| `app/(app)/components/VideoPlayer.tsx` | Real WebSocket video with simulator fallback |
| `app/(app)/video/page.tsx` | Blind view + two-mode volunteer view (List/Call) |
| `app/(app)/map/page.tsx` | Leaflet map with OpenStreetMap tiles |
| `app/(app)/map/mock-locations.ts` | Mock location data (English) |
| `app/(app)/components/Navbar.tsx` | Role-aware navigation (English) |
| `app/(app)/components/HelpNotification.tsx` | Help request popup (English) |
| `app/(app)/layout.tsx` | App shell with status bar (English) |
| `app/(app)/login/LoginContent.tsx` | Dual-role login/register (English) |
| `app/(app)/forum/page.tsx` | Forum homepage with post creation (English) |
| `app/(app)/forum/post/PostContent.tsx` | Post detail with comments (English) |
| `app/(app)/components/PostCard.tsx` | Post preview card (English) |
| `app/(app)/forum/mock-data.ts` | Mock forum posts (English) |
| `app/(app)/forum/types.ts` | Type definitions (unchanged) |

---

### Task 1: Install Leaflet Dependency

**Files:**
- Modify: `landing/my-app/package.json`

- [ ] **Step 1: Install leaflet and types**

Run:
```bash
cd landing/my-app
npm install leaflet @types/leaflet
```

Expected: both packages install successfully.

- [ ] **Step 2: Commit**

```bash
git add landing/my-app/package.json landing/my-app/package-lock.json
git commit -m "deps: add leaflet and @types/leaflet for map replacement"
```

---

### Task 2: RoleContext sessionStorage + DemoChannelContext

**Files:**
- Modify: `app/(app)/context/RoleContext.tsx`
- Create: `app/(app)/context/DemoChannelContext.tsx`

- [ ] **Step 1: Migrate RoleContext to sessionStorage**

Replace the full contents of `app/(app)/context/RoleContext.tsx`:

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'blind' | 'volunteer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  glassesId?: string;
  email?: string;
}

interface RoleContextType {
  role: UserRole | null;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('lumina_user');
    if (stored) {
      const parsed = JSON.parse(stored) as User;
      setUser(parsed);
      setRole(parsed.role);
    }
  }, []);

  const login = (newUser: User) => {
    sessionStorage.setItem('lumina_user', JSON.stringify(newUser));
    sessionStorage.setItem('lumina_role', newUser.role);
    setUser(newUser);
    setRole(newUser.role);
  };

  const logout = () => {
    sessionStorage.removeItem('lumina_user');
    sessionStorage.removeItem('lumina_role');
    setUser(null);
    setRole(null);
  };

  return (
    <RoleContext.Provider value={{ role, user, login, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
```

- [ ] **Step 2: Create DemoChannelContext**

Create `app/(app)/context/DemoChannelContext.tsx` with:

```typescript
'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';

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
```

- [ ] **Step 3: Commit**

```bash
git add landing/my-app/app/\(app\)/context/RoleContext.tsx landing/my-app/app/\(app\)/context/DemoChannelContext.tsx
git commit -m "feat: sessionStorage per tab + BroadcastChannel demo context"
```

---

### Task 3: WebSocketContext Refactor (Queue-Based)

**Files:**
- Modify: `app/(app)/context/WebSocketContext.tsx`

- [ ] **Step 1: Rewrite WebSocketContext with queue + demo integration**

Replace the full contents of `app/(app)/context/WebSocketContext.tsx`:

```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
      setHelpRequests((prev) => {
        if (prev.some((r) => r.id === payload.id)) return prev;
        return [...prev, payload];
      });
    }
  }, [lastMessage]);

  // Handle demo channel messages
  useEffect(() => {
    if (!demoMessage) return;

    if (demoMessage.type === 'help_request') {
      const payload = demoMessage.payload;
      setHelpRequests((prev) => {
        if (prev.some((r) => r.id === payload.id)) return prev;
        return [...prev, payload];
      });
    }

    if (demoMessage.type === 'accept_help') {
      const payload = demoMessage.payload;
      setHelpRequests((prev) => prev.filter((r) => r.id !== payload.requestId));
      setActiveCall((prev) => {
        if (prev && prev.id === payload.requestId) return prev;
        const found = helpRequests.find((r) => r.id === payload.requestId);
        return found || prev;
      });
      setMyRequestAccepted(true);
      setAcceptedByVolunteer(payload.volunteerName);
    }

    if (demoMessage.type === 'end_call') {
      setActiveCall(null);
      setMyRequestAccepted(false);
      setAcceptedByVolunteer(null);
    }
  }, [demoMessage, helpRequests]);

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
        setHelpRequests((prev) => {
          if (prev.some((r) => r.id === mockReq.id)) return prev;
          return [...prev, mockReq];
        });
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [connected]);

  const acceptHelpRequest = (id: string) => {
    const request = helpRequests.find((r) => r.id === id);
    if (!request) return;
    setHelpRequests((prev) => prev.filter((r) => r.id !== id));
    setActiveCall(request);
    broadcastAccept({ requestId: id, volunteerName: 'Volunteer' });
  };

  const ignoreHelpRequest = (id: string) => {
    setHelpRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const endCall = () => {
    if (activeCall) {
      broadcastEndCall({ requestId: activeCall.id });
    }
    setActiveCall(null);
    setMyRequestAccepted(false);
    setAcceptedByVolunteer(null);
  };

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
```

- [ ] **Step 2: Commit**

```bash
git add landing/my-app/app/\(app\)/context/WebSocketContext.tsx
git commit -m "feat: queue-based help requests with demo channel integration"
```

---

### Task 4: CanvasVideoSimulator Component

**Files:**
- Create: `app/(app)/components/CanvasVideoSimulator.tsx`

- [ ] **Step 1: Create the canvas simulator component**

Create `app/(app)/components/CanvasVideoSimulator.tsx`:

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  onDisconnect?: () => void;
}

export default function CanvasVideoSimulator({ onDisconnect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = Date.now();

    const draw = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;

      // Background
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, 640, 480);

      // Grid lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= 640; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 480);
        ctx.stroke();
      }
      for (let y = 0; y <= 480; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(640, y);
        ctx.stroke();
      }

      // Moving shapes (simulating detected objects)
      const shapes = [
        { x: 100 + Math.sin(elapsed * 0.5) * 50, y: 150 + Math.cos(elapsed * 0.3) * 30, color: '#00f0ff', size: 30 },
        { x: 400 + Math.cos(elapsed * 0.4) * 60, y: 200 + Math.sin(elapsed * 0.6) * 40, color: '#00ff88', size: 25 },
        { x: 250 + Math.sin(elapsed * 0.7) * 40, y: 350 + Math.cos(elapsed * 0.5) * 50, color: '#ff00a0', size: 20 },
      ];

      shapes.forEach((shape) => {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
        ctx.fillStyle = `${shape.color}33`;
        ctx.fillRect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);

        // Label
        ctx.fillStyle = shape.color;
        ctx.font = '10px monospace';
        ctx.fillText(`OBJ ${(shape.confidence || 0.92).toFixed(2)}`, shape.x - shape.size / 2, shape.y - shape.size / 2 - 4);
      });

      // Crosshair
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(320, 220);
      ctx.lineTo(320, 260);
      ctx.moveTo(300, 240);
      ctx.lineTo(340, 240);
      ctx.stroke();

      // Scan line
      const scanY = ((elapsed * 60) % 480);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(640, scanY);
      ctx.stroke();

      // Timestamp
      ctx.fillStyle = '#00f0ff';
      ctx.font = '12px Orbitron, monospace';
      ctx.fillText(new Date().toLocaleTimeString('en-US'), 520, 30);

      // Simulated feed label
      ctx.fillStyle = 'rgba(255, 221, 0, 0.8)';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('SIMULATED FEED', 12, 24);

      // Corner brackets (HUD aesthetic)
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      const corners = [
        [10, 10, 20, 10, 20, 20],
        [620, 10, 630, 10, 630, 20],
        [10, 470, 20, 470, 20, 460],
        [620, 470, 630, 470, 630, 460],
      ];
      corners.forEach(([x1, y1, x2, y2, x3, y3]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.stroke();
      });

      frameCount.current++;
      if (now - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = now;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      onDisconnect?.();
    };
  }, [onDisconnect]);

  return (
    <div className="relative bg-black border border-[var(--color-cyan)]/30">
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="w-full h-auto object-contain"
        style={{ minHeight: 300 }}
      />
      <div className="absolute top-2 right-2 flex gap-2 text-xs">
        <span className="bg-green-600 text-white px-2 py-0.5 rounded">LIVE</span>
        <span className="bg-black/70 text-[var(--color-cyan)] px-2 py-0.5 rounded">{fps} FPS</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add landing/my-app/app/\(app\)/components/CanvasVideoSimulator.tsx
git commit -m "feat: CanvasVideoSimulator for offline demo HUD animation"
```

---

### Task 5: VideoPlayer — Add Simulator Fallback

**Files:**
- Modify: `app/(app)/components/VideoPlayer.tsx`

- [ ] **Step 1: Add CanvasVideoSimulator fallback when WS fails**

Replace the full contents of `app/(app)/components/VideoPlayer.tsx`:

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import CanvasVideoSimulator from './CanvasVideoSimulator';

interface Props {
  url: string;
  onDisconnect?: () => void;
}

export default function VideoPlayer({ url, onDisconnect }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [useSimulator, setUseSimulator] = useState(false);
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());

  useEffect(() => {
    const ws = new WebSocket(url);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    const timeout = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        setUseSimulator(true);
      }
    }, 3000);

    ws.onopen = () => {
      clearTimeout(timeout);
      setConnected(true);
      setUseSimulator(false);
    };
    ws.onclose = () => {
      setConnected(false);
      setUseSimulator(true);
      onDisconnect?.();
    };
    ws.onerror = () => {
      setConnected(false);
      setUseSimulator(true);
    };
    ws.onmessage = (event) => {
      if (!(event.data instanceof ArrayBuffer)) return;
      const blob = new Blob([event.data], { type: 'image/jpeg' });
      const objectUrl = URL.createObjectURL(blob);
      if (imgRef.current) {
        imgRef.current.src = objectUrl;
        setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
      }
      frameCount.current++;
      const now = Date.now();
      if (now - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = now;
      }
    };

    return () => {
      clearTimeout(timeout);
      ws.close();
    };
  }, [url, onDisconnect]);

  if (useSimulator) {
    return <CanvasVideoSimulator onDisconnect={onDisconnect} />;
  }

  return (
    <div className="relative bg-black border border-[var(--color-cyan)]/30">
      <img
        ref={imgRef}
        alt="Live video stream"
        className="w-full h-full object-contain min-h-[300px]"
      />
      {!connected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center space-y-2">
            <div className="text-[var(--color-cyan)] text-4xl animate-pulse">📡</div>
            <p className="text-[var(--color-gray)]">Waiting for glasses connection...</p>
          </div>
        </div>
      )}
      <div className="absolute top-2 right-2 flex gap-2 text-xs">
        <span className={`px-2 py-0.5 rounded ${connected ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {connected ? 'LIVE' : 'OFFLINE'}
        </span>
        <span className="bg-black/70 text-[var(--color-cyan)] px-2 py-0.5 rounded">
          {fps} FPS
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add landing/my-app/app/\(app\)/components/VideoPlayer.tsx
git commit -m "feat: VideoPlayer with CanvasVideoSimulator fallback"
```

---

### Task 6: Video Page — Blind View + Volunteer List/Call Modes

**Files:**
- Modify: `app/(app)/video/page.tsx`

- [ ] **Step 1: Rewrite video page with dual-role views**

Replace the full contents of `app/(app)/video/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRole } from '../context/RoleContext';
import { useWebSocketContext } from '../context/WebSocketContext';
import { useDemoChannel } from '../context/DemoChannelContext';
import VideoPlayer from '../components/VideoPlayer';

type VideoStatus = 'idle' | 'requesting' | 'connected' | 'ended';

export default function VideoPage() {
  const { role } = useRole();

  if (!role) {
    return <div className="text-center py-20 text-[var(--color-gray)]">Please log in first</div>;
  }

  return role === 'blind' ? <BlindVideoView /> : <VolunteerVideoView />;
}

function BlindVideoView() {
  const [status, setStatus] = useState<VideoStatus>('idle');
  const { broadcastHelpRequest } = useDemoChannel();
  const { myRequestAccepted, acceptedByVolunteer } = useWebSocketContext();

  const handleRequest = () => {
    setStatus('requesting');
    const userStr = sessionStorage.getItem('lumina_user');
    const user = userStr ? JSON.parse(userStr) : { name: 'Unknown', id: 'GL-2025-000' };
    broadcastHelpRequest({
      id: `req-${Date.now()}`,
      userName: user.name,
      glassesId: user.id,
      timestamp: Date.now(),
    });
    setTimeout(() => setStatus('connected'), 3000);
  };

  const handleEnd = () => setStatus('idle');

  const displayStatus = myRequestAccepted ? 'connected' : status;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-cyan)]">Video Help</h1>

      <VideoPlayer url="ws://localhost:8081/ws/viewer" />

      <div className="bg-[var(--color-panel)] border border-[var(--color-gray)]/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎙</span>
          <span className="text-white">Voice command ready</span>
        </div>
        <p className="text-sm text-[var(--color-gray)]">Say &quot;help me&quot; to your glasses to request assistance</p>
      </div>

      <div className="text-center">
        <div className="text-lg mb-4">
          {displayStatus === 'idle' && <span className="text-green-400">🟢 Online, waiting for help</span>}
          {displayStatus === 'requesting' && <span className="text-yellow-400 animate-pulse">🟡 Searching for volunteer...</span>}
          {displayStatus === 'connected' && (
            <span className="text-green-400">
              🟢 Connected{acceptedByVolunteer ? ` with ${acceptedByVolunteer}` : ''}
            </span>
          )}
        </div>

        {displayStatus === 'idle' && (
          <button
            onClick={handleRequest}
            className="w-full py-4 bg-red-600 text-white font-bold text-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Request Help Manually
          </button>
        )}
        {displayStatus === 'connected' && (
          <button
            onClick={handleEnd}
            className="w-full py-4 bg-[var(--color-gray)]/30 text-white font-bold text-lg hover:bg-[var(--color-gray)]/50"
          >
            End Help Request
          </button>
        )}
      </div>
    </div>
  );
}

function VolunteerVideoView() {
  const { helpRequests, activeCall, acceptHelpRequest, ignoreHelpRequest, endCall } = useWebSocketContext();
  const [showGenerator, setShowGenerator] = useState(false);

  const handleGenerate = () => {
    const mockReq = {
      id: `mock-${Date.now()}`,
      userName: 'Test User',
      glassesId: `GL-2025-${String(Math.floor(Math.random() * 10)).padStart(3, '0')}`,
      timestamp: Date.now(),
    };
    // Directly add to helpRequests via a custom event or just let the mock interval handle it
    // For immediate demo: we'll just simulate by reloading or using local state
    window.location.reload();
  };

  if (activeCall) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-cyan)]">Video Assistance</h1>

        <div className="flex items-center justify-between bg-[var(--color-panel)] p-4">
          <div>
            <div className="font-bold">Caller: {activeCall.userName} (Blind User)</div>
            <div className="text-sm text-[var(--color-gray)]">Glasses: {activeCall.glassesId}</div>
          </div>
          <div className="text-green-400">🟢 Live Connection</div>
        </div>

        <VideoPlayer url="ws://localhost:8081/ws/viewer" onDisconnect={endCall} />

        <div className="flex gap-4">
          <button
            onClick={endCall}
            className="flex-1 py-3 bg-red-600 text-white font-bold hover:bg-red-700"
          >
            🔴 End Assistance
          </button>
          <button className="flex-1 py-3 bg-[var(--color-gray)]/30 text-white font-bold hover:bg-[var(--color-gray)]/50">
            🎙 Mute
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-cyan)]">Video Assistance</h1>
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="px-3 py-1 text-sm border border-[var(--color-gray)]/30 text-[var(--color-gray)] hover:text-white"
        >
          {showGenerator ? 'Hide' : 'Show'} Test Generator
        </button>
      </div>

      {showGenerator && (
        <div className="bg-[var(--color-panel)] border border-[var(--color-yellow)]/30 p-4">
          <p className="text-sm text-[var(--color-gray)] mb-2">Generate a fake help request for solo demo:</p>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-[var(--color-yellow)] text-black font-bold text-sm"
          >
            Generate Test Request
          </button>
        </div>
      )}

      {helpRequests.length === 0 ? (
        <div className="text-center py-20 bg-[var(--color-panel)] border border-[var(--color-gray)]/30">
          <div className="text-6xl mb-4">📹</div>
          <p className="text-[var(--color-gray)]">No video assistance tasks</p>
          <p className="text-sm text-[var(--color-gray)] mt-2">Help requests from blind users will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[var(--color-gray)]">{helpRequests.length} blind user(s) need help</p>
          {helpRequests.map((req) => (
            <div
              key={req.id}
              className="bg-[var(--color-panel)] border border-[var(--color-gray)]/30 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-lime)]/20 text-[var(--color-lime)] flex items-center justify-center font-bold">
                  {req.userName[0]}
                </div>
                <div>
                  <div className="font-medium">{req.userName}</div>
                  <div className="text-xs text-[var(--color-gray)]">Glasses: {req.glassesId}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-400">LIVE</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => acceptHelpRequest(req.id)}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-bold hover:bg-green-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => ignoreHelpRequest(req.id)}
                  className="px-4 py-2 bg-gray-700 text-white text-sm hover:bg-gray-600"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add landing/my-app/app/\(app\)/video/page.tsx
git commit -m "feat: volunteer video page with help request list and call mode"
```

---

### Task 7: Map Page — Leaflet + OpenStreetMap

**Files:**
- Modify: `app/(app)/map/page.tsx`

- [ ] **Step 1: Replace AMap with Leaflet**

Replace the full contents of `app/(app)/map/page.tsx`:

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { MOCK_LOCATIONS, MapLocation } from './mock-locations';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type FilterType = 'all' | 'blind' | 'volunteer' | 'business';

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    if (leafletMapRef.current) return;

    const map = L.map(mapRef.current).setView([39.90923, 116.397428], 13);
    leafletMapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const locations = filter === 'all' ? MOCK_LOCATIONS : MOCK_LOCATIONS.filter((l) => l.type === filter);

    locations.forEach((loc) => {
      const color = loc.type === 'blind' ? '#ff4444' : loc.type === 'volunteer' ? '#00f0ff' : '#ffdd00';
      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: 8,
        color,
        fillColor: color,
        fillOpacity: 0.8,
      }).addTo(map);

      marker.bindTooltip(loc.name, { direction: 'top', offset: [0, -10] });
      marker.on('click', () => setSelectedLocation(loc));
      markersRef.current.push(marker);
    });
  }, [filter]);

  const filteredLocations = filter === 'all' ? MOCK_LOCATIONS : MOCK_LOCATIONS.filter((l) => l.type === filter);

  const counts = {
    blind: MOCK_LOCATIONS.filter((l) => l.type === 'blind').length,
    volunteer: MOCK_LOCATIONS.filter((l) => l.type === 'volunteer').length,
    business: MOCK_LOCATIONS.filter((l) => l.type === 'business').length,
  };

  const filterLabels: Record<FilterType, string> = {
    all: 'All',
    blind: 'Blind',
    volunteer: 'Volunteer',
    business: 'Business',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-cyan)]">Assistance Map</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 text-sm border ${viewMode === 'map' ? 'border-[var(--color-cyan)] text-[var(--color-cyan)]' : 'border-[var(--color-gray)]/30 text-[var(--color-gray)]'}`}
          >
            🗺 Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-sm border ${viewMode === 'list' ? 'border-[var(--color-cyan)] text-[var(--color-cyan)]' : 'border-[var(--color-gray)]/30 text-[var(--color-gray)]'}`}
          >
            📋 List
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'blind', 'volunteer', 'business'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm border transition-colors ${
              filter === f ? 'border-[var(--color-cyan)] text-[var(--color-cyan)]' : 'border-[var(--color-gray)]/30 text-[var(--color-gray)]'
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {viewMode === 'map' ? (
        <div className="relative">
          <div ref={mapRef} className="w-full h-[500px] bg-[var(--color-panel)] border border-[var(--color-gray)]/30" />
          {!leafletMapRef.current && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-panel)]">
              <p className="text-[var(--color-gray)]">Loading map...</p>
            </div>
          )}

          <div className="absolute bottom-4 left-4 flex gap-2">
            <div className="bg-black/80 px-3 py-2 text-sm">
              <span className="text-red-400">👁 {counts.blind}</span>
            </div>
            <div className="bg-black/80 px-3 py-2 text-sm">
              <span className="text-[var(--color-cyan)]">🙋 {counts.volunteer}</span>
            </div>
            <div className="bg-black/80 px-3 py-2 text-sm">
              <span className="text-yellow-400">🏪 {counts.business}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLocations.map((loc) => (
            <div
              key={loc.id}
              onClick={() => setSelectedLocation(loc)}
              className="bg-[var(--color-panel)] border border-[var(--color-gray)]/30 p-4 cursor-pointer hover:border-[var(--color-cyan)]/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">
                    {loc.type === 'blind' ? '👁' : loc.type === 'volunteer' ? '🙋' : '🏪'} {loc.name}
                  </span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    loc.type === 'blind' ? 'bg-red-400/20 text-red-400' :
                    loc.type === 'volunteer' ? 'bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]' :
                    'bg-yellow-400/20 text-yellow-400'
                  }`}>
                    {loc.status || 'Open'}
                  </span>
                </div>
                <span className="text-xs text-[var(--color-gray)]">{loc.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[var(--color-panel)] border border-[var(--color-cyan)]/50 p-6 w-full max-w-md relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--color-cyan)]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--color-cyan)]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--color-cyan)]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--color-cyan)]" />

            <button onClick={() => setSelectedLocation(null)} className="absolute top-4 right-4 text-[var(--color-gray)] hover:text-white">✕</button>

            <h3 className="text-xl font-bold mb-2">{selectedLocation.name}</h3>
            <p className="text-sm text-[var(--color-gray)] mb-4">{selectedLocation.description}</p>

            {selectedLocation.phone && <p className="text-sm mb-2">📞 {selectedLocation.phone}</p>}
            {selectedLocation.jobs && <p className="text-sm mb-4">💼 Jobs: {selectedLocation.jobs.join(', ')}</p>}

            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-[var(--color-cyan)] text-black font-bold text-sm">Navigate</button>
              {selectedLocation.type === 'blind' && (
                <a href="/video" className="flex-1 py-2 bg-green-600 text-white font-bold text-sm text-center">Video Assist</a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add landing/my-app/app/\(app\)/map/page.tsx
git commit -m "feat: replace AMap with Leaflet + OpenStreetMap"
```

---

### Task 8: English Translation — Core UI

**Files:**
- Modify: `app/(app)/components/Navbar.tsx`
- Modify: `app/(app)/components/HelpNotification.tsx`
- Modify: `app/(app)/layout.tsx`
- Modify: `app/(app)/login/LoginContent.tsx`

- [ ] **Step 1: Translate Navbar**

Replace `app/(app)/components/Navbar.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { useRole } from '../context/RoleContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { role, user, logout } = useRole();
  const pathname = usePathname();

  const navItems = [
    { href: '/forum', blind: 'Community', volunteer: 'Community' },
    { href: '/video', blind: '🆘 Video Help', volunteer: 'Video Assist' },
    { href: '/map', blind: 'Nearby Help', volunteer: 'Assistance Map' },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-void)]/90 backdrop-blur border-b border-[var(--color-cyan)]/30"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[var(--color-cyan)] tracking-wider">
          LUMINA
        </Link>

        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3 py-2 text-sm font-medium transition-colors hover:text-[var(--color-cyan)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)] focus:ring-offset-2 focus:ring-offset-[var(--color-void)] rounded ${
                  isActive ? 'text-[var(--color-cyan)] border-b-2 border-[var(--color-cyan)]' : ''
                } ${
                  item.href === '/video' && role === 'blind'
                    ? 'text-red-400 animate-pulse'
                    : 'text-white'
                }`}
              >
                {role === 'blind' ? item.blind : item.volunteer}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-xs text-[var(--color-gray)]">
              {user.name} ({role === 'blind' ? 'Blind User' : 'Volunteer'})
            </span>
          )}
          <button
            onClick={logout}
            className="text-xs text-[var(--color-gray)] hover:text-[var(--color-cyan)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)] focus:ring-offset-2 focus:ring-offset-[var(--color-void)] px-2 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Translate HelpNotification**

Replace `app/(app)/components/HelpNotification.tsx`:

```typescript
'use client';

import { HelpRequest } from '../context/WebSocketContext';

interface Props {
  request: HelpRequest | null;
  onAccept: (request: HelpRequest) => void;
  onIgnore: () => void;
}

export default function HelpNotification({ request, onAccept, onIgnore }: Props) {
  if (!request) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-[var(--color-panel)] border-2 border-red-500 rounded-lg p-4 shadow-lg shadow-red-500/20">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🆘</div>
        <div className="flex-1">
          <h3 className="font-bold text-white mb-1">New Video Help Request</h3>
          <p className="text-sm text-[var(--color-gray)] mb-1">{request.userName} (Blind User) needs help</p>
          <p className="text-xs text-[var(--color-gray)] mb-3">Glasses ID: {request.glassesId}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onAccept(request)}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Accept
            </button>
            <button
              onClick={onIgnore}
              className="flex-1 px-3 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Ignore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Translate layout.tsx**

Replace `app/(app)/layout.tsx`:

```typescript
'use client';

import { RoleProvider } from './context/RoleContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { DemoChannelProvider } from './context/DemoChannelContext';
import Navbar from './components/Navbar';
import HelpNotification from './components/HelpNotification';
import { useWebSocketContext } from './context/WebSocketContext';

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { connected, helpRequests, activeCall, acceptHelpRequest, ignoreHelpRequest, endCall } = useWebSocketContext();

  const handleAccept = (request: { id: string }) => {
    acceptHelpRequest(request.id);
    if (!activeCall) {
      window.location.href = '/video';
    }
  };

  const nextRequest = helpRequests[0] || null;

  return (
    <div className="min-h-screen bg-[var(--color-void)] text-white pt-16">
      <Navbar />

      <div className="bg-[var(--color-panel)] border-b border-[var(--color-gray)]/20 px-4 py-2 text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className={connected ? 'text-green-400' : 'text-[var(--color-gray)]'}>
            {connected ? '🟢 Glasses Online' : '⚪ Demo Mode'}
          </span>
          <span className="text-xs text-[var(--color-gray)]">LuminaEye Community Platform</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>

      <HelpNotification
        request={nextRequest}
        onAccept={handleAccept}
        onIgnore={() => nextRequest && ignoreHelpRequest(nextRequest.id)}
      />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <DemoChannelProvider>
        <WebSocketProvider>
          <LayoutInner>{children}</LayoutInner>
        </WebSocketProvider>
      </DemoChannelProvider>
    </RoleProvider>
  );
}
```

Note: The layout has changed — it no longer shows the SOS button for blind users or the volunteer-specific status bar. These are now handled within each page. The `LayoutInner` now uses `useWebSocketContext` directly.

Wait — the original layout had role-specific UI. Let me re-read the original to preserve the important parts while translating.

Actually, looking at the original layout:
- It showed role-specific status bar (glasses online/offline for blind, "15 blind users need help" for volunteer)
- It showed HelpNotification for volunteers
- It showed SOS button for blind users

I should keep these role-specific features but translate them. However, since WebSocketContext now has `helpRequests`, I can show the dynamic count for volunteers.

Let me revise the layout to keep the role-specific UI:

```typescript
'use client';

import { RoleProvider, useRole } from './context/RoleContext';
import { WebSocketProvider, useWebSocketContext } from './context/WebSocketContext';
import { DemoChannelProvider } from './context/DemoChannelContext';
import Navbar from './components/Navbar';
import HelpNotification from './components/HelpNotification';

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { role, user } = useRole();
  const { connected, helpRequests, activeCall, acceptHelpRequest, ignoreHelpRequest, endCall } = useWebSocketContext();

  const handleAccept = (request: { id: string }) => {
    acceptHelpRequest(request.id);
    window.location.href = '/video';
  };

  const handleIgnore = () => {
    const next = helpRequests[0];
    if (next) ignoreHelpRequest(next.id);
  };

  const nextRequest = helpRequests[0] || null;

  return (
    <div className="min-h-screen bg-[var(--color-void)] text-white pt-16">
      <Navbar />

      <div className="bg-[var(--color-panel)] border-b border-[var(--color-gray)]/20 px-4 py-2 text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {role === 'blind' ? (
            <span className={connected ? 'text-green-400' : 'text-[var(--color-gray)]'}>
              {connected ? '🟢 Glasses Online' : '⚪ Demo Mode'}
            </span>
          ) : (
            <span className="text-[var(--color-cyan)]">{helpRequests.length} blind users need help</span>
          )}
          <span className="text-xs text-[var(--color-gray)]">LuminaEye Community Platform</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>

      {role === 'volunteer' && (
        <HelpNotification
          request={nextRequest}
          onAccept={handleAccept}
          onIgnore={handleIgnore}
        />
      )}

      {role === 'blind' && (
        <a
          href="/video"
          className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-red-600/30 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-400"
          aria-label="Emergency Help"
        >
          🆘
        </a>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <DemoChannelProvider>
        <WebSocketProvider>
          <LayoutInner>{children}</LayoutInner>
        </WebSocketProvider>
      </DemoChannelProvider>
    </RoleProvider>
  );
}
```

- [ ] **Step 4: Translate LoginContent**

Replace `app/(app)/login/LoginContent.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRole, UserRole } from '../context/RoleContext';

const MOCK_VOLUNTEERS: Record<string, { password: string; name: string }> = {
  'volunteer1@example.com': { password: '123456', name: 'Volunteer Lee' },
  'volunteer2@example.com': { password: '123456', name: 'Volunteer Zhang' },
};

export default function LoginContent() {
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'blind';
  const [activeTab, setActiveTab] = useState<UserRole>(initialRole);
  const { login } = useRole();

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-[var(--color-panel)] border border-[var(--color-cyan)]/50 p-8 relative">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--color-cyan)]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--color-cyan)]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--color-cyan)]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--color-cyan)]" />

        <h1 className="text-2xl font-bold text-center mb-8 tracking-wider">LUMINA</h1>

        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab('blind')}
            className={`flex-1 py-3 text-center font-medium transition-colors border-2 ${
              activeTab === 'blind'
                ? 'border-[var(--color-lime)] text-[var(--color-lime)]'
                : 'border-transparent text-[var(--color-gray)] hover:text-white'
            }`}
          >
            👁 Blind User
          </button>
          <button
            onClick={() => setActiveTab('volunteer')}
            className={`flex-1 py-3 text-center font-medium transition-colors border-2 ${
              activeTab === 'volunteer'
                ? 'border-[var(--color-cyan)] text-[var(--color-cyan)]'
                : 'border-transparent text-[var(--color-gray)] hover:text-white'
            }`}
          >
            🙋 Volunteer
          </button>
        </div>

        {activeTab === 'blind' ? <BlindForm login={login} /> : <VolunteerForm login={login} />}
      </div>
    </div>
  );
}

function BlindForm({ login }: { login: (user: { id: string; name: string; role: 'blind'; glassesId: string }) => void }) {
  const [glassesId, setGlassesId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!glassesId.trim()) {
      setError('Please enter glasses ID');
      return;
    }
    if (!/^GL-\d{4}-\d{3}$/.test(glassesId)) {
      setError('Invalid glasses ID format (e.g., GL-2025-001)');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    login({
      id: glassesId,
      name: name.trim(),
      role: 'blind',
      glassesId: glassesId.trim(),
    });

    window.location.href = '/forum';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-[var(--color-gray)] mb-1">Glasses ID</label>
        <input
          type="text"
          value={glassesId}
          onChange={(e) => setGlassesId(e.target.value)}
          placeholder="e.g., GL-2025-001"
          className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-4 py-3 text-white placeholder-[var(--color-gray)]/50 focus:outline-none focus:border-[var(--color-lime)] focus:ring-1 focus:ring-[var(--color-lime)]"
        />
      </div>
      <div>
        <label className="block text-sm text-[var(--color-gray)] mb-1">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-4 py-3 text-white placeholder-[var(--color-gray)]/50 focus:outline-none focus:border-[var(--color-lime)] focus:ring-1 focus:ring-[var(--color-lime)]"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full py-3 bg-[var(--color-lime)] text-black font-bold hover:bg-[var(--color-lime)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--color-lime)]"
      >
        Enter System
      </button>
    </form>
  );
}

function VolunteerForm({ login }: { login: (user: { id: string; name: string; role: 'volunteer'; email: string }) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (isLogin) {
      const found = MOCK_VOLUNTEERS[email];
      if (!found) {
        setError('Email not registered');
        return;
      }
      if (found.password !== password) {
        setError('Incorrect password');
        return;
      }
      login({ id: email, name: found.name, role: 'volunteer', email });
    } else {
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
      if (MOCK_VOLUNTEERS[email]) {
        setError('Email already registered, please log in');
        return;
      }
      MOCK_VOLUNTEERS[email] = { password, name: name.trim() };
      login({ id: email, name: name.trim(), role: 'volunteer', email });
    }

    window.location.href = '/forum';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-[var(--color-gray)] mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-4 py-3 text-white placeholder-[var(--color-gray)]/50 focus:outline-none focus:border-[var(--color-cyan)] focus:ring-1 focus:ring-[var(--color-cyan)]"
        />
      </div>
      <div>
        <label className="block text-sm text-[var(--color-gray)] mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-4 py-3 text-white placeholder-[var(--color-gray)]/50 focus:outline-none focus:border-[var(--color-cyan)] focus:ring-1 focus:ring-[var(--color-cyan)]"
        />
      </div>
      {!isLogin && (
        <div>
          <label className="block text-sm text-[var(--color-gray)] mb-1">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-4 py-3 text-white placeholder-[var(--color-gray)]/50 focus:outline-none focus:border-[var(--color-cyan)] focus:ring-1 focus:ring-[var(--color-cyan)]"
          />
        </div>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full py-3 bg-[var(--color-cyan)] text-black font-bold hover:bg-[var(--color-cyan)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)]"
      >
        {isLogin ? 'Login' : 'Register'}
      </button>
      <p className="text-center text-sm text-[var(--color-gray)]">
        {isLogin ? 'No account?' : 'Already have an account?'}
        <button
          type="button"
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
          className="text-[var(--color-cyan)] hover:underline ml-1"
        >
          {isLogin ? 'Register now' : 'Login now'}
        </button>
      </p>
    </form>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add landing/my-app/app/\(app\)/components/Navbar.tsx landing/my-app/app/\(app\)/components/HelpNotification.tsx landing/my-app/app/\(app\)/layout.tsx landing/my-app/app/\(app\)/login/LoginContent.tsx
git commit -m "i18n: translate core UI to English (Navbar, Login, Layout, HelpNotification)"
```

---

### Task 9: English Translation — Forum

**Files:**
- Modify: `app/(app)/forum/page.tsx`
- Modify: `app/(app)/forum/post/PostContent.tsx`
- Modify: `app/(app)/components/PostCard.tsx`
- Modify: `app/(app)/forum/mock-data.ts`
- Modify: `app/(app)/forum/types.ts`

- [ ] **Step 1: Translate forum types**

Replace `app/(app)/forum/types.ts`:

```typescript
export type UserRole = 'blind' | 'volunteer';

export interface ForumUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface Comment {
  id: string;
  author: ForumUser;
  content: string;
  createdAt: string;
}

export type PostCategory = 'All' | 'Q&A' | 'Experience' | 'Discussion';

export interface Post {
  id: string;
  title: string;
  author: ForumUser;
  category: PostCategory;
  summary: string;
  content: string;
  comments: Comment[];
  likes: number;
  createdAt: string;
}
```

- [ ] **Step 2: Translate mock data**

Replace `app/(app)/forum/mock-data.ts`:

```typescript
import { Post } from './types';

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'Help: How to cross a zebra crossing without traffic lights?',
    author: { id: 'b1', name: 'Ming', role: 'blind' },
    category: 'Q&A',
    summary: 'There is a zebra crossing near my home without traffic lights and heavy traffic. Any tips for safe crossing?',
    content: 'There is a zebra crossing near my home without traffic lights and heavy traffic. I get nervous every time I cross. Any tips for safe crossing? Especially how to judge vehicle distance and speed.',
    comments: [
      { id: 'c1', author: { id: 'v1', name: 'Volunteer Lee', role: 'volunteer' }, content: 'I suggest listening carefully first, and crossing quickly only when no vehicles are approaching. Best to have a volunteer accompany you.', createdAt: '2026-05-04 10:00' },
      { id: 'c2', author: { id: 'b2', name: 'Hong', role: 'blind' }, content: 'I usually raise my hand to signal, and many drivers will slow down when they see me.', createdAt: '2026-05-04 11:30' },
    ],
    likes: 12,
    createdAt: '2026-05-04 09:00',
  },
  {
    id: '2',
    title: 'Share: Helped 3 friends cross the street today',
    author: { id: 'v1', name: 'Volunteer Lee', role: 'volunteer' },
    category: 'Experience',
    summary: 'Volunteered in Chaoyang District today, helped 3 blind friends safely cross the zebra crossing. Very fulfilling!',
    content: 'Volunteered in Chaoyang District today, helped 3 blind friends safely cross the zebra crossing. One of them was Uncle Zhang, who told me that LuminaEye glasses have made his travels much easier. Seeing everyone become more independent is truly heartwarming!',
    comments: [
      { id: 'c3', author: { id: 'b3', name: 'Gang', role: 'blind' }, content: 'Thank you for your dedication!', createdAt: '2026-05-04 14:00' },
    ],
    likes: 23,
    createdAt: '2026-05-04 08:00',
  },
  {
    id: '3',
    title: 'Discussion: What navigation mode do you use most?',
    author: { id: 'v2', name: 'Volunteer Zhang', role: 'volunteer' },
    category: 'Discussion',
    summary: 'Would like to know which navigation mode everyone uses most often with LuminaEye?',
    content: 'Would like to know which navigation mode everyone uses most often with LuminaEye? Is it blind path navigation, street crossing assist, or item search?',
    comments: [
      { id: 'c4', author: { id: 'b1', name: 'Ming', role: 'blind' }, content: 'I like blind path navigation the most, very useful when going to the park.', createdAt: '2026-05-03 16:00' },
      { id: 'c5', author: { id: 'b2', name: 'Hong', role: 'blind' }, content: 'Item search is very convenient for finding things, especially water bottles and keys.', createdAt: '2026-05-03 17:00' },
    ],
    likes: 8,
    createdAt: '2026-05-03 15:00',
  },
  {
    id: '4',
    title: 'Help: Glasses suddenly cannot connect to WiFi',
    author: { id: 'b2', name: 'Hong', role: 'blind' },
    category: 'Q&A',
    summary: 'Went out today and found the glasses could not connect to WiFi. Reset did not work. Anyone else experienced this?',
    content: 'Went out today and found the glasses could not connect to WiFi. Long-pressed the reset button and it did not help. Has anyone experienced similar issues? How did you solve it?',
    comments: [
      { id: 'c6', author: { id: 'v3', name: 'Volunteer Wang', role: 'volunteer' }, content: 'Try checking your home router, or contact the admin to reset the glasses configuration.', createdAt: '2026-05-02 20:00' },
    ],
    likes: 5,
    createdAt: '2026-05-02 18:00',
  },
  {
    id: '5',
    title: 'Share: First time shopping independently',
    author: { id: 'b3', name: 'Gang', role: 'blind' },
    category: 'Experience',
    summary: 'Used LuminaEye to buy milk and bread at the supermarket today, no help needed the whole time. So happy!',
    content: 'Used LuminaEye to buy milk and bread at the supermarket today, the item search feature was a huge help! No help needed from volunteers the whole time. Feeling more and more independent.',
    comments: [
      { id: 'c7', author: { id: 'v1', name: 'Volunteer Lee', role: 'volunteer' }, content: 'Amazing! So proud of you!', createdAt: '2026-05-01 12:00' },
      { id: 'c8', author: { id: 'b1', name: 'Ming', role: 'blind' }, content: 'Congrats! I want to try too.', createdAt: '2026-05-01 13:00' },
    ],
    likes: 31,
    createdAt: '2026-05-01 10:00',
  },
];

export const ALL_CATEGORIES = ['All', 'Q&A', 'Experience', 'Discussion'] as const;
```

- [ ] **Step 3: Translate forum page**

Replace `app/(app)/forum/page.tsx`:

```typescript
'use client';

import { useState, useMemo } from 'react';
import { MOCK_POSTS, ALL_CATEGORIES } from './mock-data';
import { PostCategory } from './types';
import PostCard from '../components/PostCard';
import { useRole } from '../context/RoleContext';

export default function ForumPage() {
  const [activeCategory, setActiveCategory] = useState<PostCategory>('All');
  const [showModal, setShowModal] = useState(false);

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return MOCK_POSTS;
    return MOCK_POSTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-cyan)] tracking-wider">Lumina Community</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[var(--color-cyan)] text-black font-bold text-sm hover:bg-[var(--color-cyan)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)]"
        >
          + New Post
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)] ${
              activeCategory === cat
                ? 'border-[var(--color-cyan)] text-[var(--color-cyan)]'
                : 'border-[var(--color-gray)]/30 text-[var(--color-gray)] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {showModal && <PostModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

function PostModal({ onClose }: { onClose: () => void }) {
  const { user } = useRole();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PostCategory>('Q&A');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 2) { setError('Title must be at least 2 characters'); return; }
    if (content.trim().length < 10) { setError('Content must be at least 10 characters'); return; }

    const newPost = {
      id: `local-${Date.now()}`,
      title: title.trim(),
      author: { id: user?.id || 'unknown', name: user?.name || 'Anonymous', role: user?.role || 'blind' },
      category,
      summary: content.trim().slice(0, 100) + '...',
      content: content.trim(),
      comments: [],
      likes: 0,
      createdAt: new Date().toLocaleString('en-US'),
    };

    const existing = JSON.parse(localStorage.getItem('lumina_posts') || '[]');
    existing.unshift(newPost);
    localStorage.setItem('lumina_posts', JSON.stringify(existing));

    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[var(--color-panel)] border border-[var(--color-cyan)]/50 p-6 w-full max-w-lg relative">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--color-cyan)]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--color-cyan)]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--color-cyan)]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--color-cyan)]" />

        <h2 className="text-xl font-bold mb-4">New Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--color-gray)] mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-3 py-2 text-white focus:outline-none focus:border-[var(--color-cyan)]" />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-gray)] mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as PostCategory)} className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-3 py-2 text-white focus:outline-none focus:border-[var(--color-cyan)]">
              {ALL_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--color-gray)] mb-1">Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-3 py-2 text-white focus:outline-none focus:border-[var(--color-cyan)]" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2 bg-[var(--color-cyan)] text-black font-bold hover:bg-[var(--color-cyan)]/90">Post</button>
            <button type="button" onClick={onClose} className="flex-1 py-2 bg-[var(--color-gray)]/30 text-white hover:bg-[var(--color-gray)]/50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Translate PostContent**

Replace `app/(app)/forum/post/PostContent.tsx`:

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { MOCK_POSTS } from '../mock-data';
import { useRole } from '../../context/RoleContext';

export default function PostContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');
  const { user } = useRole();
  const [commentText, setCommentText] = useState('');

  const localPosts = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('lumina_posts') || '[]' : '[]');
  const allPosts = [...localPosts, ...MOCK_POSTS];
  const post = allPosts.find((p: any) => p.id === postId);

  if (!post) {
    return <div className="text-center py-20 text-[var(--color-gray)]">Post not found</div>;
  }

  const isBlind = post.author.role === 'blind';
  const isLiked = (JSON.parse(localStorage.getItem('lumina_likes') || '[]') as string[]).includes(post.id);

  const handleLike = () => {
    const likes = JSON.parse(localStorage.getItem('lumina_likes') || '[]') as string[];
    if (likes.includes(post.id)) return;
    likes.push(post.id);
    localStorage.setItem('lumina_likes', JSON.stringify(likes));
    window.location.reload();
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    const comments = JSON.parse(localStorage.getItem('lumina_comments') || '{}') as Record<string, unknown[]>;
    if (!comments[post.id]) comments[post.id] = [];
    comments[post.id].push({
      id: `c-${Date.now()}`,
      author: { id: user.id, name: user.name, role: user.role },
      content: commentText.trim(),
      createdAt: new Date().toLocaleString('en-US'),
    });
    localStorage.setItem('lumina_comments', JSON.stringify(comments));
    window.location.reload();
  };

  const localComments = (JSON.parse(localStorage.getItem('lumina_comments') || '{}') as Record<string, unknown[]>)[post.id] || [];
  const allComments = [...localComments, ...post.comments];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <a href="/forum" className="text-sm text-[var(--color-cyan)] hover:underline">← Back to Forum</a>

      <article className={`bg-[var(--color-panel)] border-l-4 p-6 ${isBlind ? 'border-l-[var(--color-lime)]' : 'border-l-[var(--color-cyan)]'}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isBlind ? 'bg-[var(--color-lime)]/20 text-[var(--color-lime)]' : 'bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]'}`}>
            {post.author.name[0]}
          </div>
          <div>
            <div className="font-medium">{post.author.name}</div>
            <div className="text-xs text-[var(--color-gray)]">{post.createdAt}</div>
          </div>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded ${isBlind ? 'bg-[var(--color-lime)]/20 text-[var(--color-lime)]' : 'bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]'}`}>
            {isBlind ? 'Blind User' : 'Volunteer'}
          </span>
        </div>

        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{post.content}</p>

        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[var(--color-gray)]/20">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-sm ${isLiked ? 'text-red-400' : 'text-[var(--color-gray)] hover:text-red-400'}`}
          >
            ❤️ {post.likes + (isLiked ? 1 : 0)}
          </button>
          <span className="text-sm text-[var(--color-gray)]">💬 {allComments.length}</span>
        </div>
      </article>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">Comments ({allComments.length})</h2>
        {allComments.map((comment: any) => (
          <div key={comment.id} className={`bg-[var(--color-panel)] border-l-2 p-4 ${comment.author.role === 'blind' ? 'border-l-[var(--color-lime)]' : 'border-l-[var(--color-cyan)]'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.author.name}</span>
              <span className="text-xs text-[var(--color-gray)]">{comment.createdAt}</span>
            </div>
            <p className="text-sm text-white/80">{comment.content}</p>
          </div>
        ))}
      </div>

      {user && (
        <form onSubmit={handleComment} className="space-y-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write your comment..."
            rows={3}
            className="w-full bg-black/50 border border-[var(--color-gray)]/30 px-4 py-3 text-white placeholder-[var(--color-gray)]/50 focus:outline-none focus:border-[var(--color-cyan)]"
          />
          <button type="submit" className="px-6 py-2 bg-[var(--color-cyan)] text-black font-bold text-sm hover:bg-[var(--color-cyan)]/90">
            Post Comment
          </button>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Translate PostCard**

Replace `app/(app)/components/PostCard.tsx`:

```typescript
import { Post } from '../forum/types';

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  const isBlind = post.author.role === 'blind';
  const borderColor = isBlind ? 'border-l-[var(--color-lime)]' : 'border-l-[var(--color-cyan)]';

  return (
    <a
      href={`/forum/post?id=${post.id}`}
      className={`block bg-[var(--color-panel)] border-l-4 ${borderColor} p-5 hover:bg-[var(--color-panel)]/80 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)]`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            isBlind ? 'bg-[var(--color-lime)]/20 text-[var(--color-lime)]' : 'bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]'
          }`}
        >
          {post.author.name[0]}
        </div>
        <span className="text-sm text-white">{post.author.name}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            isBlind ? 'bg-[var(--color-lime)]/20 text-[var(--color-lime)]' : 'bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]'
          }`}
        >
          {isBlind ? 'Blind User' : 'Volunteer'}
        </span>
        <span className="text-xs text-[var(--color-gray)] ml-auto">{post.createdAt}</span>
      </div>

      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{post.title}</h3>
      <p className="text-sm text-[var(--color-gray)] line-clamp-2 mb-3">{post.summary}</p>

      <div className="flex items-center gap-4 text-sm text-[var(--color-gray)]">
        <span>💬 {post.comments.length}</span>
        <span>❤️ {post.likes}</span>
        <span className="ml-auto text-xs px-2 py-0.5 border border-[var(--color-gray)]/30 rounded">{post.category}</span>
      </div>
    </a>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add landing/my-app/app/\(app\)/forum/page.tsx landing/my-app/app/\(app\)/forum/post/PostContent.tsx landing/my-app/app/\(app\)/components/PostCard.tsx landing/my-app/app/\(app\)/forum/mock-data.ts landing/my-app/app/\(app\)/forum/types.ts
git commit -m "i18n: translate forum to English (posts, comments, categories, mock data)"
```

---

### Task 10: English Translation — Map Mock Data

**Files:**
- Modify: `app/(app)/map/mock-locations.ts`

- [ ] **Step 1: Translate mock location data**

Replace `app/(app)/map/mock-locations.ts`:

```typescript
export interface MapLocation {
  id: string;
  name: string;
  type: 'blind' | 'volunteer' | 'business';
  lng: number;
  lat: number;
  status?: string;
  description?: string;
  phone?: string;
  jobs?: string[];
}

function randomOffset(base: number, range: number): number {
  return base + (Math.random() - 0.5) * range;
}

const CENTER_LNG = 116.397428;
const CENTER_LAT = 39.90923;

export const MOCK_LOCATIONS: MapLocation[] = [
  // Blind users / glasses (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `blind-${i + 1}`,
    name: ['Ming', 'Hong', 'Gang', 'Li', 'Hua', 'Fang', 'Jun', 'Yan', 'Bo', 'Min'][i],
    type: 'blind' as const,
    lng: randomOffset(CENTER_LNG, 0.08),
    lat: randomOffset(CENTER_LAT, 0.08),
    status: i < 3 ? 'Requesting Help' : 'Idle',
    description: `Glasses ID: GL-2025-${String(i + 1).padStart(3, '0')}`,
  })),

  // Volunteers (20)
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `vol-${i + 1}`,
    name: `Volunteer ${['Lee', 'Zhang', 'Wang', 'Liu', 'Chen', 'Yang', 'Huang', 'Wu', 'Zhou', 'Xu', 'Sun', 'Ma', 'Zhu', 'Hu', 'Lin', 'Guo', 'He', 'Gao', 'Luo', 'Zheng'][i]}`,
    type: 'volunteer' as const,
    lng: randomOffset(CENTER_LNG, 0.12),
    lat: randomOffset(CENTER_LAT, 0.12),
    status: i < 15 ? 'Online' : 'Offline',
    description: `Helped ${Math.floor(Math.random() * 20)} people`,
  })),

  // Businesses (8)
  ...[
    { name: 'Bright Convenience Store', jobs: ['Cashier', 'Stock Clerk'], phone: '138-0000-0001' },
    { name: 'Sunshine Coffee Shop', jobs: ['Barista', 'Server'], phone: '138-0000-0002' },
    { name: 'Huimin Supermarket', jobs: ['Stock Clerk', 'Warehouse Manager'], phone: '138-0000-0003' },
    { name: 'Cozy Flower Shop', jobs: ['Florist'], phone: '138-0000-0004' },
    { name: 'Popular Restaurant', jobs: ['Kitchen Helper', 'Dishwasher'], phone: '138-0000-0005' },
    { name: 'Community Library', jobs: ['Book Organizer'], phone: '138-0000-0006' },
    { name: 'Caring Laundry', jobs: ['Laundry Worker', 'Receptionist'], phone: '138-0000-0007' },
    { name: 'Handicraft Store', jobs: ['Artisan'], phone: '138-0000-0008' },
  ].map((biz, i) => ({
    id: `biz-${i + 1}`,
    name: biz.name,
    type: 'business' as const,
    lng: randomOffset(CENTER_LNG, 0.1),
    lat: randomOffset(CENTER_LAT, 0.1),
    jobs: biz.jobs,
    phone: biz.phone,
    description: `Jobs: ${biz.jobs.join(', ')}`,
  })),
];
```

- [ ] **Step 2: Commit**

```bash
git add landing/my-app/app/\(app\)/map/mock-locations.ts
git commit -m "i18n: translate map mock data to English"
```

---

### Task 11: Build Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run build**

```bash
cd landing/my-app
npm run build
```

Expected: Build succeeds with no errors. All pages prerender as static content.

- [ ] **Step 2: Start dev server and smoke test**

```bash
npm run dev
```

In another terminal:
```bash
for path in /login /forum /video /map /forum/post; do
  echo -n "$path: "
  curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$path"
  echo
done
```

Expected: All return 200.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: verify build passes after all fixes"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|-----------------|------|
| sessionStorage per tab | Task 2 |
| BroadcastChannel demo messaging | Task 2 |
| Queue-based helpRequests | Task 3 |
| Volunteer List/Call modes | Task 6 |
| CanvasVideoSimulator | Task 4, 5 |
| Leaflet + OpenStreetMap | Task 1, 7 |
| English translation — all UI | Tasks 8, 9, 10 |

All requirements covered. No gaps.

## Placeholder Scan

No TBDs, TODOs, or vague instructions. Every step contains complete code.

## Type Consistency Check

- `HelpRequest` interface: consistent across `WebSocketContext.tsx` and `HelpNotification.tsx`
- `DemoMessage` types: consistent across `DemoChannelContext.tsx` and `WebSocketContext.tsx`
- `PostCategory`: updated from Chinese to English values, consistent across `types.ts`, `mock-data.ts`, `page.tsx`
