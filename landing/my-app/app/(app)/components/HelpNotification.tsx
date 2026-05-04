'use client';

interface HelpRequest {
  id: string;
  userName: string;
  glassesId: string;
}

interface Props {
  request: HelpRequest | null;
  onAccept: (request: HelpRequest) => void;
  onIgnore: () => void;
}

export default function HelpNotification({ request, onAccept, onIgnore }: Props) {
  if (!request) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-[var(--color-panel)] border-2 border-red-500 rounded-lg p-4 shadow-lg shadow-red-500/20">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🆘</div>
        <div className="flex-1">
          <h3 className="font-bold text-white mb-1">新的视频求助</h3>
          <p className="text-sm text-[var(--color-gray)] mb-1">{request.userName}（盲人用户）发起求助</p>
          <p className="text-xs text-[var(--color-gray)] mb-3">眼镜编号：{request.glassesId}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onAccept(request)}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              接听
            </button>
            <button
              onClick={onIgnore}
              className="flex-1 px-3 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              忽略
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
