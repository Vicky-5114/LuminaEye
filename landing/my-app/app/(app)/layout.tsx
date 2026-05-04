'use client';

import { RoleProvider, useRole } from './context/RoleContext';
import { WebSocketProvider, useWebSocketContext } from './context/WebSocketContext';
import Navbar from './components/Navbar';
import HelpNotification from './components/HelpNotification';

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { role, user } = useRole();
  const { connected, helpRequest, clearHelpRequest } = useWebSocketContext();

  const handleAccept = () => {
    clearHelpRequest();
    window.location.href = '/video';
  };

  const blindCount = 15; // Mock stat

  return (
    <div className="min-h-screen bg-[var(--color-void)] text-white pt-16">
      <Navbar />

      {/* Quick status bar */}
      <div className="bg-[var(--color-panel)] border-b border-[var(--color-gray)]/20 px-4 py-2 text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {role === 'blind' ? (
            <span className={connected ? 'text-green-400' : 'text-red-400'}>
              {connected ? '🟢 眼镜在线' : '🔴 眼镜离线'}
            </span>
          ) : (
            <span className="text-[var(--color-cyan)]">{blindCount} 位盲人需要帮助</span>
          )}
          <span className="text-xs text-[var(--color-gray)]">LuminaEye 社区平台</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>

      {role === 'volunteer' && (
        <HelpNotification
          request={helpRequest}
          onAccept={handleAccept}
          onIgnore={clearHelpRequest}
        />
      )}

      {role === 'blind' && (
        <a
          href="/video"
          className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-red-600/30 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-400"
          aria-label="紧急求助"
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
      <WebSocketProvider>
        <LayoutInner>{children}</LayoutInner>
      </WebSocketProvider>
    </RoleProvider>
  );
}
