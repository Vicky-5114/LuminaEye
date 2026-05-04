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
    return <div className="text-center py-20 text-[var(--color-gray)]">Please log in first</div>;
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
      <h1 className="text-2xl font-bold text-[var(--color-cyan)]">Video Help</h1>

      <VideoPlayer url="ws://localhost:8081/ws/viewer" />

      <div className="bg-[var(--color-panel)] border border-[var(--color-gray)]/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎙</span>
          <span className="text-white">Voice command ready</span>
        </div>
        <p className="text-sm text-[var(--color-gray)]">Say &quot;help me&quot; to your glasses to request assistance</p>
      </div>

      <div className="text-center">
        <div className="text-lg mb-4">
          {displayStatus === 'idle' && <span className="text-green-400">🟢 Online, waiting for help</span>}
          {displayStatus === 'requesting' && <span className="text-yellow-400 animate-pulse">🟡 Searching for volunteer...</span>}
          {displayStatus === 'connected' && (
            <span className="text-green-400">
              🟢 Connected{acceptedByVolunteer ? ` with ${acceptedByVolunteer}` : ''}
            </span>
          )}
        </div>

        {displayStatus === 'idle' && (
          <button
            onClick={handleRequest}
            className="w-full py-4 bg-red-600 text-white font-bold text-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Request Help Manually
          </button>
        )}
        {displayStatus === 'connected' && (
          <button
            onClick={handleEnd}
            className="w-full py-4 bg-[var(--color-gray)]/30 text-white font-bold text-lg hover:bg-[var(--color-gray)]/50"
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
        <h1 className="text-2xl font-bold text-[var(--color-cyan)]">Video Assistance</h1>

        <div className="flex items-center justify-between bg-[var(--color-panel)] p-4">
          <div>
            <div className="font-bold">Caller: {activeCall.userName} (Blind User)</div>
            <div className="text-sm text-[var(--color-gray)]">Glasses: {activeCall.glassesId}</div>
          </div>
          <div className="text-green-400">🟢 Live Connection</div>
        </div>

        <VideoPlayer url="ws://localhost:8081/ws/viewer" onDisconnect={endCall} />

        <div className="flex gap-4">
          <button
            onClick={endCall}
            className="flex-1 py-3 bg-red-600 text-white font-bold hover:bg-red-700"
          >
            🔴 End Assistance
          </button>
          <button className="flex-1 py-3 bg-[var(--color-gray)]/30 text-white font-bold hover:bg-[var(--color-gray)]/50">
            🎙 Mute
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-cyan)]">Video Assistance</h1>
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="px-3 py-1 text-sm border border-[var(--color-gray)]/30 text-[var(--color-gray)] hover:text-white"
        >
          {showGenerator ? 'Hide' : 'Show'} Test Generator
        </button>
      </div>

      {showGenerator && (
        <div className="bg-[var(--color-panel)] border border-[var(--color-yellow)]/30 p-4">
          <p className="text-sm text-[var(--color-gray)] mb-2">Generate a fake help request for solo demo:</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--color-yellow)] text-black font-bold text-sm"
          >
            Generate Test Request
          </button>
        </div>
      )}

      {helpRequests.length === 0 ? (
        <div className="text-center py-20 bg-[var(--color-panel)] border border-[var(--color-gray)]/30">
          <div className="text-6xl mb-4">📹</div>
          <p className="text-[var(--color-gray)]">No video assistance tasks</p>
          <p className="text-sm text-[var(--color-gray)] mt-2">Help requests from blind users will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[var(--color-gray)]">{helpRequests.length} blind user(s) need help</p>
          {helpRequests.map((req) => (
            <div
              key={req.id}
              className="bg-[var(--color-panel)] border border-[var(--color-gray)]/30 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-lime)]/20 text-[var(--color-lime)] flex items-center justify-center font-bold">
                  {req.userName[0]}
                </div>
                <div>
                  <div className="font-medium">{req.userName}</div>
                  <div className="text-xs text-[var(--color-gray)]">Glasses: {req.glassesId}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-400">LIVE</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => acceptHelpRequest(req.id)}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-bold hover:bg-green-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => ignoreHelpRequest(req.id)}
                  className="px-4 py-2 bg-gray-700 text-white text-sm hover:bg-gray-600"
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
