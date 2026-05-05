# Volunteer Video Stream Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the volunteer video stream so that after clicking Accept, the volunteer sees the same live glasses feed as the blind user page.

**Architecture:** Two-layer defense — (1) stabilise callback references in WebSocketContext with `useCallback`, and (2) isolate the `onDisconnect` prop from VideoPlayer's effect lifecycle with `useRef` plus an intentional-close flag.

**Tech Stack:** React 19, TypeScript, Next.js 16

---

### Task 1: Stabilise callbacks in WebSocketContext

**Files:**
- Modify: `landing/my-app/app/(app)/context/WebSocketContext.tsx`

**Context:**
`acceptHelpRequest`, `ignoreHelpRequest`, and `endCall` are plain inline functions. Every time `WebSocketProvider` re-renders (e.g. when a `/ws_ui` JSON message arrives), these functions get new references. This breaks any child component that includes them in a `useEffect` dependency array — specifically `VideoPlayer`.

**Change:**
Import `useCallback` from React and wrap the three functions. The dependency arrays are chosen so the callbacks are recreated only when their actual dependencies change.

- `acceptHelpRequest` depends on `helpRequests` and `broadcastAccept`
- `ignoreHelpRequest` has no dependencies
- `endCall` depends on `activeCall` and `broadcastEndCall`

```tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
```

```tsx
  const acceptHelpRequest = useCallback((id: string) => {
    const request = helpRequests.find((r) => r.id === id);
    if (!request) return;
    setHelpRequests((prev) => prev.filter((r) => r.id !== id));
    setActiveCall(request);
    broadcastAccept({ requestId: id, volunteerName: 'Volunteer' });
  }, [helpRequests, broadcastAccept]);

  const ignoreHelpRequest = useCallback((id: string) => {
    setHelpRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const endCall = useCallback(() => {
    if (activeCall) {
      broadcastEndCall({ requestId: activeCall.id });
    }
    setActiveCall(null);
    setMyRequestAccepted(false);
    setAcceptedByVolunteer(null);
  }, [activeCall, broadcastEndCall]);
```

- [ ] **Step 1: Apply the changes above**
- [ ] **Step 2: Commit**

```bash
git add landing/my-app/app/\(app\)/context/WebSocketContext.tsx
git commit -m "fix: stabilise WebSocketContext callbacks with useCallback"
```

---

### Task 2: Isolate onDisconnect from VideoPlayer effect lifecycle

**Files:**
- Modify: `landing/my-app/app/(app)/components/VideoPlayer.tsx`

**Context:**
`VideoPlayer` currently lists `onDisconnect` in its `useEffect` dependency array (`[url, onDisconnect]`). Even after Task 1, any legitimate change to `onDisconnect` would tear down the WebSocket and rebuild it. Worse, the cleanup path (`ws.close()`) triggers `ws.onclose`, which currently calls `onDisconnect`, so an intentional effect restart can accidentally end the active call.

**Change:**
1. Store `onDisconnect` in a ref so the latest callback is always reachable without being an effect dependency.
2. Add `intentionallyClosedRef` set to `true` inside the cleanup function. The `onclose` handler only calls `onDisconnectRef.current` when the close was *not* intentional.
3. Remove `onDisconnect` from the `useEffect` dependency array (keep only `[url]`).

```tsx
export default function VideoPlayer({ url, onDisconnect }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [useSimulator, setUseSimulator] = useState(false);
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(0);
  const onDisconnectRef = useRef(onDisconnect);
  const intentionallyClosedRef = useRef(false);

  // Keep ref in sync with latest prop without restarting the effect
  onDisconnectRef.current = onDisconnect;

  useEffect(() => {
    intentionallyClosedRef.current = false;
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
      if (!intentionallyClosedRef.current) {
        onDisconnectRef.current?.();
      }
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
      intentionallyClosedRef.current = true;
      ws.close();
    };
  }, [url]);
```

- [ ] **Step 1: Apply the changes above**
- [ ] **Step 2: Commit**

```bash
git add landing/my-app/app/\(app\)/components/VideoPlayer.tsx
git commit -m "fix: isolate onDisconnect from VideoPlayer effect to prevent accidental reconnects"
```

---

### Verification

**Manual test steps:**
1. Start the backend (`python app_main.py`)
2. Open two browser tabs, log in as blind user (001) in one and volunteer (zsh) in the other
3. On the blind user page, click **Request Help Manually**
4. On the volunteer page, click **Accept** in the popup
5. **Expected:** Volunteer page shows the active-call view with `VideoPlayer` displaying the same live feed as the blind user page (LIVE badge + FPS counter updating)
6. Click **End Assistance** on the volunteer page
7. **Expected:** Page returns to the "No video assistance tasks" empty state

**Build check:**
```bash
cd landing/my-app
npm run build
```
Expected: build completes with 0 errors.
