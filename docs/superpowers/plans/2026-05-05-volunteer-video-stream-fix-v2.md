# Volunteer Video Stream Fix v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent `VideoPlayer` and `CanvasVideoSimulator` from accidentally ending the active call when a WebSocket fails to connect or when the simulator unmounts.

**Architecture:** Add `hasConnectedRef` guard to `VideoPlayer` so `onDisconnect` is only called after a successful connection. Remove `onDisconnect` from `CanvasVideoSimulator` cleanup.

**Tech Stack:** React 19, TypeScript

---

### Task 1: Guard onDisconnect in VideoPlayer

**Files:**
- Modify: `landing/my-app/app/(app)/components/VideoPlayer.tsx`

**Change:**
1. Add `const hasConnectedRef = useRef(false);`
2. In `ws.onopen`, set `hasConnectedRef.current = true;`
3. In `ws.onclose`, change the condition to `if (!intentionallyClosedRef.current && hasConnectedRef.current)`

```tsx
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    intentionallyClosedRef.current = false;
    hasConnectedRef.current = false;
    const ws = new WebSocket(url);
    ...
    ws.onopen = () => {
      clearTimeout(timeout);
      setConnected(true);
      setUseSimulator(false);
      hasConnectedRef.current = true;
    };
    ws.onclose = () => {
      setConnected(false);
      setUseSimulator(true);
      if (!intentionallyClosedRef.current && hasConnectedRef.current) {
        onDisconnectRef.current?.();
      }
    };
```

- [ ] **Step 1: Apply the changes above**
- [ ] **Step 2: Commit**

```bash
git add landing/my-app/app/\(app\)/components/VideoPlayer.tsx
git commit -m "fix: only call onDisconnect after a successful WebSocket connection"
```

---

### Task 2: Remove onDisconnect from CanvasVideoSimulator cleanup

**Files:**
- Modify: `landing/my-app/app/(app)/components/CanvasVideoSimulator.tsx`

**Change:**
Remove `onDisconnect?.()` from the effect cleanup return function.

**Current:**
```tsx
    return () => {
      cancelAnimationFrame(rafRef.current);
      onDisconnect?.();
    };
```

**Change to:**
```tsx
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
```

- [ ] **Step 1: Apply the change above**
- [ ] **Step 2: Commit**

```bash
git add landing/my-app/app/\(app\)/components/CanvasVideoSimulator.tsx
git commit -m "fix: remove onDisconnect from CanvasVideoSimulator cleanup"
```

---

### Verification

**Manual test steps:**
1. Start the dev server (`npm run dev` in `landing/my-app`)
2. Open two browser tabs, log in as blind user (001) and volunteer (zsh)
3. Blind user clicks **Request Help Manually**
4. Volunteer clicks **Accept** in the popup
5. **Expected:** Volunteer page stays on the active-call view. If backend is running, live video displays. If backend is not running, simulated feed displays. The page does NOT flash back to "No video assistance tasks".
6. Click **End Assistance** → page returns to request list

**Build check:**
```bash
cd landing/my-app
npm run build
```
Expected: build completes with 0 errors.
