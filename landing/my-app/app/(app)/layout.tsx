'use client';

import { RoleProvider, useRole } from './context/RoleContext';
import { WebSocketProvider, useWebSocketContext } from './context/WebSocketContext';
import Navbar from './components/Navbar';
import HelpNotification from './components/HelpNotification';

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { role } = useRole();
  const { helpRequest, clearHelpRequest } = useWebSocketContext();

  const handleAccept = () => {
    clearHelpRequest();
    window.location.href = '/video';
  };

  return (
    <div className="min-h-screen bg-[var(--color-void)] text-white pt-16">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      {role === 'volunteer' && (
        <HelpNotification
          request={helpRequest}
          onAccept={handleAccept}
          onIgnore={clearHelpRequest}
        />
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
