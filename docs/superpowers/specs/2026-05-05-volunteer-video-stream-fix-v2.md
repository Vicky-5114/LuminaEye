# Volunteer Video Stream Fix v2

## Problem

After applying the initial fix (useCallback + useRef + layout.tsx router fix), clicking Accept on the volunteer page still fails to show the video stream. The user observes:
- A "Waiting for glasses connection..." overlay flashes briefly
- The video player then immediately disappears
- The page returns to the "No video assistance tasks" empty state

## Root Cause

Two components incorrectly invoke `endCall` (which resets `activeCall` to null) during normal lifecycle events:

1. **`VideoPlayer.tsx`**: `ws.onclose` calls `onDisconnectRef.current?.()` whenever the WebSocket closes, regardless of whether the connection was ever successfully established. If the backend is not running or the connection is refused, `ws.onclose` fires immediately after mounting, triggering `endCall` and destroying the active call state.

2. **`CanvasVideoSimulator.tsx`**: The effect cleanup function calls `onDisconnect?.()` when the simulator component unmounts. This means switching from the simulator back to a real feed (or unmounting the player for any reason) accidentally ends the call.

## Design

### Approach: Guard disconnection callbacks (recommended)

**In `VideoPlayer.tsx`:**
Add a `hasConnectedRef` flag. Set it to `true` in `ws.onopen`. In `ws.onclose`, only invoke `onDisconnectRef.current` if:
- The close was not intentional (`!intentionallyClosedRef.current`), AND
- The connection had previously succeeded (`hasConnectedRef.current`)

This prevents a failed initial connection from immediately ending the call.

**In `CanvasVideoSimulator.tsx`:**
Remove `onDisconnect?.()` from the effect cleanup. The simulator unmounting is a component lifecycle event, not a signal that the call should end.

## Files Changed

- `landing/my-app/app/(app)/components/VideoPlayer.tsx`
- `landing/my-app/app/(app)/components/CanvasVideoSimulator.tsx`

## Expected Behaviour After Fix

1. Volunteer clicks Accept → `VideoPlayer` mounts and attempts WebSocket connection
2. If backend is running → connection succeeds, live video feed displays
3. If backend is not running → connection fails gracefully, `CanvasVideoSimulator` displays without ending the call
4. Volunteer clicks End Assistance → call ends and page returns to request list
5. Call remains stable regardless of WebSocket reconnection events
