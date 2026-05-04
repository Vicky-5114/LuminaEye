# LuminaEye Community Platform Fixes — Design Spec

> **Date:** 2026-05-04  
> **Goal:** Fix 4 critical issues in the LuminaEye community platform: English translation, dual-role demo capability, volunteer help request list, and broken map API.

---

## Issues Summary

| # | Issue | Root Cause |
|---|-------|------------|
| 1 | All UI text is Chinese | Project built with Chinese strings hardcoded |
| 2 | Cannot demo both roles simultaneously | `localStorage` shares login state across all tabs |
| 3 | Volunteer video page shows empty state instead of help list | `WebSocketContext` stores only 1 request; volunteer page has no list view |
| 4 | Map page is blank | AMap API key is `'YOUR_AMAP_KEY'` placeholder; no valid key configured |

---

## Architecture

### State & Communication Stack

```
┌─────────────────────────────────────────────────────────────┐
│  Browser Tab 1 (Blind User)                                 │
│  ┌─────────────┐  ┌─────────────────┐                       │
│  │ RoleContext │  │ DemoChannelCtx  │──┐                    │
│  │ (sessionStorage)│  │ (BroadcastChannel)│  │                    │
│  └─────────────┘  └─────────────────┘  │                    │
│         │                        │     │                    │
│         ▼                        ▼     │                    │
│  ┌──────────────────────────────────┐  │                    │
│  │ WebSocketContext                  │  │                    │
│  │  ├─ Real WS: ws://localhost:8081  │  │                    │
│  │  └─ Demo: BroadcastChannel        │◄─┘                    │
│  └──────────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                              │ BroadcastChannel('lumina-demo')
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Browser Tab 2 (Volunteer)                                  │
│  ┌─────────────┐  ┌─────────────────┐                       │
│  │ RoleContext │  │ DemoChannelCtx  │──┐                    │
│  │ (sessionStorage)│  │ (BroadcastChannel)│  │                    │
│  └─────────────┘  └─────────────────┘  │                    │
│         │                        │     │                    │
│         ▼                        ▼     │                    │
│  ┌──────────────────────────────────┐  │                    │
│  │ WebSocketContext                  │◄─┘                    │
│  │  helpRequests[] (queue)           │                       │
│  │  activeCall: HelpRequest | null   │                       │
│  └──────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Design Decisions

### 1. English Translation (No i18n Library)

**Decision:** Direct string replacement in source files. No `next-intl`, no dictionary files.

**Rationale:**
- This is a research/demo project, not a production multi-language app
- Adding an i18n framework increases bundle size and complexity for zero benefit
- The Chinese text is already scattered; replacing it in-place is the simplest correct action

**Scope:** Every user-visible string in `landing/my-app/app/(app)/` including:
- Navigation labels, button text, form labels, placeholders
- Status messages, error messages, empty states
- Mock data (forum posts, user names, locations)
- Role labels (`盲人用户` → `Blind User`, `志愿者` → `Volunteer`)

### 2. Dual-Role Demo via sessionStorage + BroadcastChannel

**Decision:** Migrate `RoleContext` from `localStorage` to `sessionStorage`. Add `DemoChannelContext` using `BroadcastChannel('lumina-demo')`.

**Rationale:**
- `localStorage` is shared across all tabs of the same origin → only one login possible
- `sessionStorage` is scoped per tab → each tab can have independent login state
- `BroadcastChannel` is supported in all modern browsers and allows same-origin cross-tab messaging without a server

**Message Protocol:**

```typescript
type DemoMessage =
  | { type: 'help_request'; payload: { id: string; userName: string; glassesId: string; timestamp: number } }
  | { type: 'accept_help'; payload: { requestId: string; volunteerName: string } }
  | { type: 'end_call'; payload: { requestId: string } };
```

**Flow:**
1. Blind tab clicks "Request Help" → `demoChannel.postMessage({ type: 'help_request', ... })`
2. All volunteer tabs receive the message → `helpRequests` queue updates
3. Volunteer clicks "Accept" on a specific request → `demoChannel.postMessage({ type: 'accept_help', ... })`
4. The blind tab that sent the original request receives accept → status changes to "Connected"
5. Either side clicks "End" → `demoChannel.postMessage({ type: 'end_call', ... })` → both sides return to idle

### 3. Volunteer Video Page — List + Call Modes

**Decision:** Refactor `video/page.tsx` volunteer view into two distinct modes controlled by `activeCall` state.

**List Mode (default):**
- Displays `helpRequests` from `WebSocketContext` as a scrollable card list
- Each card shows: blind user name, glasses ID, green "LIVE" pulse, Accept/Decline buttons
- If queue is empty: show "No active requests" + "Generate Test Request" button for solo demo
- Status bar dynamically shows count from `helpRequests.length`

**Call Mode:**
- Triggered when `activeCall` is set (via Accept)
- Shows top info bar with caller details + connection status
- Full-width video player (real WebSocket stream or Canvas simulator)
- "End Call" (red) + "Mute" buttons
- Auto-returns to List Mode when call ends

### 4. Canvas Video Simulator

**Decision:** New `CanvasVideoSimulator` component that renders a HUD-style animation on `<canvas>` when the real glasses WebSocket is unreachable.

**Rationale:**
- The glasses backend (`ws://localhost:8081`) won't be running during most demos
- A blank/black video box looks broken; a moving HUD animation looks intentional
- Both blind and volunteer tabs should see the *same* feed to reinforce the "shared connection" illusion

**Visual Design:**
- Canvas resolution: 640×480, scaled via CSS `width: 100%`
- Background: `#0a0a0f` (matches `--color-void`)
- Elements drawn each frame:
  - 3-4 moving geometric shapes (circles, rectangles) in cyan/lime/magenta
  - Center crosshair (horizontal + vertical lines)
  - Scan-line sweep (horizontal line moving top to bottom)
  - Timestamp in Orbitron font
  - "SIMULATED FEED" label in top-left corner
  - Corner brackets (HUD aesthetic)
- FPS: 30fps via `requestAnimationFrame`
- React state exposes `fps` counter (updated every second)

### 5. Map Replacement — Leaflet + OpenStreetMap

**Decision:** Replace AMap entirely with Leaflet (`leaflet` npm package) using OpenStreetMap tiles.

**Rationale:**
- AMap requires a valid API key; the current code has `'YOUR_AMAP_KEY'`
- OpenStreetMap is completely free, no key, no registration, no usage limits
- Leaflet is the industry-standard open-source map library, well-documented, lightweight
- OSM tiles are accessible from mainland China (may be slower than domestic services but functional)

**Implementation:**
- Install: `npm install leaflet @types/leaflet`
- Import CSS: `import 'leaflet/dist/leaflet.css'`
- Initialize: `L.map(ref).setView([39.90923, 116.397428], 13)`
- Tile layer: `L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' })`
- Markers: `L.circleMarker([lat, lng], { radius: 8, color, fillColor, fillOpacity: 0.8 })`
- Keep all existing UI: filter buttons, Map/List toggle, detail modal, bottom-left counters

---

## File Impact

| File | Action | Description |
|------|--------|-------------|
| `context/RoleContext.tsx` | Modify | Switch `localStorage` → `sessionStorage` |
| `context/WebSocketContext.tsx` | Modify | Queue-based helpRequests, add accept/end methods |
| `context/DemoChannelContext.tsx` | **Create** | BroadcastChannel wrapper for cross-tab demo messaging |
| `video/page.tsx` | Modify | Two-mode volunteer view (List + Call) |
| `components/CanvasVideoSimulator.tsx` | **Create** | HUD-style canvas animation for offline demo |
| `components/VideoPlayer.tsx` | Modify | Add simulator fallback when WS unreachable |
| `map/page.tsx` | Modify | Replace AMap with Leaflet + OpenStreetMap |
| `map/mock-locations.ts` | Modify | Translate status/description strings |
| `components/Navbar.tsx` | Modify | Translate all nav labels |
| `components/HelpNotification.tsx` | Modify | Translate notification text |
| `layout.tsx` | Modify | Translate status bar, integrate DemoChannel |
| `login/LoginContent.tsx` | Modify | Translate all form labels, buttons, errors |
| `forum/page.tsx` | Modify | Translate category names, modal, buttons |
| `forum/post/PostContent.tsx` | Modify | Translate post detail UI |
| `forum/mock-data.ts` | Modify | Translate all mock posts to English |
| `forum/types.ts` | No change | Type definitions are language-agnostic |
| `components/PostCard.tsx` | Modify | Translate role badges |

**No changes to:** Root Python backend (`app_main.py`, `navigation_master.py`, etc.), landing page sections (`app/sections/*`), ESP32 firmware.

---

## Demo Flow (Teacher Presentation)

1. **Open Tab 1** → Navigate to `/login?role=blind`
2. **Login as Blind User** → Enter glasses ID `GL-2025-001`, name `Alex`
3. **Open Tab 2** → Navigate to `/login?role=volunteer`
4. **Login as Volunteer** → Use existing mock credentials
5. **Tab 1 (Blind):** Click "Request Help" → status shows "Searching for volunteer..."
6. **Tab 2 (Volunteer):** Help request appears in list instantly → shows `Alex (GL-2025-001)` with Accept button
7. **Tab 2 (Volunteer):** Click "Accept" → switches to Call Mode → shows live video feed (Canvas simulator)
8. **Tab 1 (Blind):** Status changes to "Connected with [Volunteer Name]" → shows same video feed
9. Either tab clicks "End Call" → both return to idle state

---

## Dependencies

**New:**
- `leaflet` + `@types/leaflet` — Map rendering

**No new dependencies for:**
- Translation (direct string replacement)
- Cross-tab communication (`BroadcastChannel` is native Web API)
- Canvas animation (native `<canvas>` + `requestAnimationFrame`)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| BroadcastChannel not supported (old browsers) | Fallback: none needed — demo targets modern Chrome/Edge for teacher presentation |
| OpenStreetMap tiles slow in China | Mitigation: OSM tiles are accessible; if performance issues arise, can switch to CartoDB tiles or self-hosted alternative |
| Canvas simulator too CPU-heavy | Mitigation: Use `requestAnimationFrame` with early return when tab is hidden (`document.hidden`) |
| sessionStorage lost on tab close | Mitigation: expected behavior — user re-logs in, which is acceptable for a demo |
