'use client';

import { HelpRequest } from '../context/WebSocketContext';

interface Props {
  request: HelpRequest | null;
  onAccept: (request: HelpRequest) => void;
  onIgnore: () => void;
}

export default function HelpNotification({ request, onAccept, onIgnore }: Props) {
  if (!request) return null;

  return (
    <div role="alert" aria-live="assertive" className="fixed bottom-6 right-6 z-50 w-80 bg-[var(--color-card)] rounded-xl shadow-xl border-t-4 border-[var(--color-danger)] p-4 transition-colors dark:bg-[#111118]/90 dark:backdrop-blur dark:border-t-4 dark:border-[#ff00a0] dark:shadow-[0_0_20px_rgba(255,0,160,0.2)]">
      <div className="flex items-start gap-3">
        <div className="text-2xl" aria-hidden="true">🆘</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--color-text)] mb-1">New Video Help Request</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">{request.userName} (Blind User) needs help</p>
          <p className="text-xs text-[var(--color-text-secondary)] mb-3">Glasses ID: {request.glassesId}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAccept(request)}
              className="flex-1 px-3 py-2 bg-[var(--color-success)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={onIgnore}
              className="flex-1 px-3 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm rounded-lg hover:bg-[var(--color-bg)] transition-colors"
            >
              Ignore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
