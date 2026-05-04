'use client';

import { useState } from 'react';
import { useRole } from '../context/RoleContext';
import VideoPlayer from '../components/VideoPlayer';

type VideoStatus = 'idle' | 'requesting' | 'connected' | 'ended';

export default function VideoPage() {
  const { role } = useRole();

  if (!role) {
    return <div className="text-center py-20 text-[var(--color-gray)]">请先登录</div>;
  }

  return role === 'blind' ? <BlindVideoView /> : <VolunteerVideoView />;
}

function BlindVideoView() {
  const [status, setStatus] = useState<VideoStatus>('idle');

  const handleRequest = () => {
    setStatus('requesting');
    setTimeout(() => setStatus('connected'), 3000);
  };

  const handleEnd = () => setStatus('idle');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-cyan)]">视频求助</h1>

      <VideoPlayer url="ws://localhost:8081/ws/viewer" />

      <div className="bg-[var(--color-panel)] border border-[var(--color-gray)]/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎙</span>
          <span className="text-white">语音指令已就绪</span>
        </div>
        <p className="text-sm text-[var(--color-gray)]">对眼镜说"帮我找人"即可发起求助</p>
      </div>

      <div className="text-center">
        <div className="text-lg mb-4">
          {status === 'idle' && <span className="text-green-400">🟢 在线，等待求助中</span>}
          {status === 'requesting' && <span className="text-yellow-400 animate-pulse">🟡 正在寻找志愿者...</span>}
          {status === 'connected' && <span className="text-green-400">🟢 已连接志愿者</span>}
        </div>

        {status === 'idle' && (
          <button
            onClick={handleRequest}
            className="w-full py-4 bg-red-600 text-white font-bold text-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            手动发起求助
          </button>
        )}
        {status === 'connected' && (
          <button
            onClick={handleEnd}
            className="w-full py-4 bg-[var(--color-gray)]/30 text-white font-bold text-lg hover:bg-[var(--color-gray)]/50"
          >
            结束求助
          </button>
        )}
      </div>
    </div>
  );
}

function VolunteerVideoView() {
  const [activeCall, setActiveCall] = useState<{ userName: string; glassesId: string } | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-cyan)]">视频协助</h1>

      {activeCall ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[var(--color-panel)] p-4">
            <div>
              <div className="font-bold">求助者：{activeCall.userName}（盲人用户）</div>
              <div className="text-sm text-[var(--color-gray)]">眼镜：{activeCall.glassesId}</div>
            </div>
            <div className="text-green-400">🟢 实时连接中</div>
          </div>

          <VideoPlayer url="ws://localhost:8081/ws/viewer" />

          <div className="flex gap-4">
            <button
              onClick={() => setActiveCall(null)}
              className="flex-1 py-3 bg-red-600 text-white font-bold hover:bg-red-700"
            >
              🔴 结束协助
            </button>
            <button className="flex-1 py-3 bg-[var(--color-gray)]/30 text-white font-bold hover:bg-[var(--color-gray)]/50">
              🎙 语音开关
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-[var(--color-panel)] border border-[var(--color-gray)]/30">
          <div className="text-6xl mb-4">📹</div>
          <p className="text-[var(--color-gray)]">暂无视频协助任务</p>
          <p className="text-sm text-[var(--color-gray)] mt-2">当盲人发起求助时，此处将显示视频画面</p>
        </div>
      )}
    </div>
  );
}
