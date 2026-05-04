'use client';

import { RoleProvider, useRole } from './context/RoleContext';
import { WebSocketProvider, useWebSocketContext } from './context/WebSocketContext';
import { DemoChannelProvider } from './context/DemoChannelContext';
import Navbar from './components/Navbar';
import HelpNotification from './components/HelpNotification';

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { role, user } = useRole();
  const { connected, helpRequests, activeCall, acceptHelpRequest, ignoreHelpRequest } = useWebSocketContext();

  const handleAccept = () => {
    const next = helpRequests[0];
    if (next) {
      acceptHelpRequest(next.id);
      if (!activeCall) {
        window.location.href = '/video';
      }
    }
  };

  const handleIgnore = () => {
    const next = helpRequests[0];
    if (next) ignoreHelpRequest(next.id);
  };

  const nextRequest = helpRequests[0] || null;

  return (
    <div className="min-h-screen bg-[var(--color-void)] text-white pt-16">
      <Navbar />

      {/* Quick status bar */}
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
