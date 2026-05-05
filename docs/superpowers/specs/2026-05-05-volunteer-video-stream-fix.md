# Volunteer Video Stream Fix

## Problem

When a blind user initiates a help request and a volunteer clicks **Accept**, the volunteer page immediately jumps back to the "No video assistance tasks" empty state instead of showing the live video stream. The blind user page correctly displays the real-time glasses video feed.

## Root Cause

The `VideoPlayer` component's `useEffect` declares `[url, onDisconnect]` as dependencies. In the volunteer view, `onDisconnect` is `endCall` from `WebSocketContext`. `endCall` is not wrapped with `useCallback`, so every time `WebSocketProvider` re-renders (e.g., when a `/ws_ui` status message arrives), `endCall` becomes a new function reference.

This triggers `VideoPlayer`'s effect cleanup:
1. `useEffect` cleanup runs → `ws.close()`
2. `ws.onclose` fires → calls the *old* `endCall`
3. Old `endCall` sets `activeCall` to `null`
4. `VolunteerVideoView` exits the active-call branch and returns to the empty request-list state

## Design

### Approach: Two-layer defense (recommended)

**Layer 1 — Stabilise function references in `WebSocketContext.tsx`**
Wrap `acceptHelpRequest`, `ignoreHelpRequest`, and `endCall` with `useCallback` so their references do not change on every provider re-render.

**Layer 2 — Isolate `onDisconnect` from `VideoPlayer`'s effect lifecycle in `VideoPlayer.tsx`**
Store `onDisconnect` in a `useRef`. The ref is updated on every render, but it is **not** part of the `useEffect` dependency array. This guarantees the WebSocket connection is never torn down and rebuilt just because the parent passed a new callback reference.

Additionally, distinguish *intentional* closes (effect cleanup) from *unexpected* closes (network/server error) so that `onDisconnect` is only invoked for unexpected disconnections, preventing the cleanup logic itself from accidentally ending the call.

## Files Changed

- `landing/my-app/app/(app)/context/WebSocketContext.tsx`
- `landing/my-app/app/(app)/components/VideoPlayer.tsx`

## Expected Behaviour After Fix

1. Blind user clicks **Request Help Manually** → help request appears on the volunteer page
2. Volunteer clicks **Accept** → page switches to the active-call view
3. `VideoPlayer` connects to `ws://localhost:8081/ws/viewer` and **stays connected**
4. Volunteer sees the **exact same real-time video stream** as the blind user page
5. Volunteer clicks **End Assistance** → call ends and page returns to the request list
