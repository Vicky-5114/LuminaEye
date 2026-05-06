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
    return <div className="text-center py-20 text-[var(--color-text-secondary)]">Please log in first</div>;
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
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Video Help</h1>

      <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
        <VideoPlayer url="ws://localhost:8081/ws/viewer" />
      </div>

      <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎙</span>
          <span className="text-[var(--color-text)]">Voice command ready</span>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">Say &quot;help me&quot; to your glasses to request assistance</p>
      </div>

      <div className="text-center">
        <div className="text-lg mb-4">
          {displayStatus === 'idle' && <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)]"></span>
            Online, waiting for help
          </span>}
          {displayStatus === 'requesting' && <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-warning)] animate-pulse"></span>
            Searching for volunteer...
          </span>}
          {displayStatus === 'connected' && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)]"></span>
              Connected{acceptedByVolunteer ? ` with ${acceptedByVolunteer}` : ''}
            </span>
          )}
        </div>

        {displayStatus === 'idle' && (
          <button
            onClick={handleRequest}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-lg rounded-lg hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/20 transition-all"
          >
            Request Help Manually
          </button>
        )}
        {displayStatus === 'connected' && (
          <button
            onClick={handleEnd}
            className="w-full py-4 bg-[var(--color-border)] text-[var(--color-text)] font-semibold text-lg rounded-lg hover:bg-[var(--color-text-secondary)]/20 transition-colors"
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

  if (activeCall) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-accent)]">Video Assistance</h1>

        <div className="flex items-center justify-between bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 transition-colors">
          <div>
            <div className="font-semibold text-[var(--color-text)]">Caller: {activeCall.userName} (Blind User)</div>
            <div className="text-sm text-[var(--color-text-secondary)]">Glasses: {activeCall.glassesId}</div>
          </div>
          <div className="text-[var(--color-success)] inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)]"></span> Live
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
          <VideoPlayer url="ws://localhost:8081/ws/viewer" onDisconnect={endCall} />
        </div>

        <div className="flex gap-4">
          <button
            onClick={endCall}
            className="flex-1 py-3 bg-[var(--color-danger)] text-white font-medium rounded-lg hover:bg-[var(--color-danger-hover)] transition-colors"
          >
            🔴 End Assistance
          </button>
          <button className="flex-1 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-bg)] transition-colors">
            🎙 Mute
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-accent)]">Video Assistance</h1>
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="px-3 py-1 text-sm border border-[var(--color-text-secondary)]/30 text-[var(--color-text-secondary)] hover:text-white"
        >
          {showGenerator ? 'Hide' : 'Show'} Test Generator
        </button>
      </div>

      {showGenerator && (
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 transition-colors">
          <p className="text-sm text-[var(--color-text-secondary)] mb-2">Generate a fake help request for solo demo:</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--color-warning)] text-black font-bold text-sm"
          >
            Generate Test Request
          </button>
        </div>
      )}

      {helpRequests.length === 0 ? (
        <div className="text-center py-20 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] transition-colors">
          <div className="text-6xl mb-4">📹</div>
          <p className="text-[var(--color-text-secondary)]">No video assistance tasks</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">Help requests from blind users will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)]">{helpRequests.length} blind user(s) need help</p>
          {helpRequests.map((req) => (
            <div
              key={req.id}
              className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center font-semibold">
                  {req.userName[0]}
                </div>
                <div>
                  <div className="font-medium text-[var(--color-text)]">{req.userName}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">Glasses: {req.glassesId}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
                    <span className="text-xs text-[var(--color-success)] font-medium">LIVE</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => acceptHelpRequest(req.id)}
                  className="px-4 py-2 bg-[var(--color-success)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  Accept
                </button>
                <button
                  onClick={() => ignoreHelpRequest(req.id)}
                  className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm rounded-lg hover:bg-[var(--color-bg)] transition-colors"
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
