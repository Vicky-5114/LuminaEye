'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  url: string;
  onDisconnect?: () => void;
}

export default function VideoPlayer({ url, onDisconnect }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());

  useEffect(() => {
    const ws = new WebSocket(url);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => { setConnected(false); onDisconnect?.(); };
    ws.onerror = () => setConnected(false);
    ws.onmessage = (event) => {
      if (!(event.data instanceof ArrayBuffer)) return;
      const blob = new Blob([event.data], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      if (imgRef.current) {
        imgRef.current.src = url;
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
      frameCount.current++;
      const now = Date.now();
      if (now - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = now;
      }
    };

    return () => ws.close();
  }, [url, onDisconnect]);

  return (
    <div className="relative bg-black border border-[var(--color-cyan)]/30">
      <img
        ref={imgRef}
        alt="实时视频流"
        className="w-full h-full object-contain min-h-[300px]"
      />
      {!connected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center space-y-2">
            <div className="text-[var(--color-cyan)] text-4xl animate-pulse">📡</div>
            <p className="text-[var(--color-gray)]">等待眼镜连接...</p>
          </div>
        </div>
      )}
      <div className="absolute top-2 right-2 flex gap-2 text-xs">
        <span className={`px-2 py-0.5 rounded ${connected ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {connected ? '实时' : '离线'}
        </span>
        <span className="bg-black/70 text-[var(--color-cyan)] px-2 py-0.5 rounded">
          {fps} FPS
        </span>
      </div>
    </div>
  );
}
