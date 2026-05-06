'use client';

import { useRouter, usePathname } from 'next/navigation';
import { RoleProvider, useRole } from './context/RoleContext';
import { WebSocketProvider, useWebSocketContext } from './context/WebSocketContext';
import { DemoChannelProvider } from './context/DemoChannelContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/ToastContainer";
import PageTransition from "./components/PageTransition";
import Navbar from './components/Navbar';
import HelpNotification from './components/HelpNotification';

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { role, user } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const { connected, helpRequests, activeCall, acceptHelpRequest, ignoreHelpRequest } = useWebSocketContext();

  const handleAccept = () => {
    const next = helpRequests[0];
    if (next) {
      acceptHelpRequest(next.id);
      if (pathname !== '/video') {
        router.push('/video');
      }
    }
  };

  const handleIgnore = () => {
    const next = helpRequests[0];
    if (next) ignoreHelpRequest(next.id);
  };

  const nextRequest = helpRequests[0] || null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pt-16 transition-colors duration-300">
      <Navbar />

      {/* Quick status bar */}
      <div className="bg-[var(--color-card)] border-b border-[var(--color-border)] px-4 py-2 text-sm transition-colors duration-300 dark:bg-[#0a0a0f]/60 dark:backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {role === 'blind' ? (
            <span className={connected ? 'text-[var(--color-success)]' : 'text-[var(--color-text-secondary)]'}>
              {connected ? '🟢 Glasses Online' : '⚪ Demo Mode'}
            </span>
          ) : (
            <span className="text-[var(--color-accent)]">{helpRequests.length} blind users need help</span>
          )}
          <span className="text-xs text-[var(--color-text-secondary)]">LuminaEye Community Platform</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <PageTransition>{children}</PageTransition>
      </main>

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
          className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-red-500/30 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-400/50 transition-all duration-200 dark:shadow-[0_0_20px_rgba(255,0,160,0.4)] dark:hover:shadow-[0_0_30px_rgba(255,0,160,0.6)]"
          aria-label="Emergency Help"
        >
          🆘
        </a>
      )}

      <ToastContainer />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <RoleProvider>
          <DemoChannelProvider>
            <WebSocketProvider>
              <LayoutInner>{children}</LayoutInner>
            </WebSocketProvider>
          </DemoChannelProvider>
        </RoleProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
