'use client';

import { useEffect, useRef, useState } from 'react';
import CanvasVideoSimulator from './CanvasVideoSimulator';

interface Props {
  url: string;
  onDisconnect?: () => void;
}

export default function VideoPlayer({ url, onDisconnect }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [useSimulator, setUseSimulator] = useState(false);
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(0);
  const onDisconnectRef = useRef(onDisconnect);
  const intentionallyClosedRef = useRef(false);
  const hasConnectedRef = useRef(false);

  // Keep ref in sync with latest prop without restarting the effect
  onDisconnectRef.current = onDisconnect;

  useEffect(() => {
    intentionallyClosedRef.current = false;
    hasConnectedRef.current = false;
    const ws = new WebSocket(url);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    const timeout = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        setUseSimulator(true);
      }
    }, 3000);

    ws.onopen = () => {
      clearTimeout(timeout);
      setConnected(true);
      setUseSimulator(false);
      hasConnectedRef.current = true;
    };
    ws.onclose = () => {
      setConnected(false);
      setUseSimulator(true);
      if (!intentionallyClosedRef.current && hasConnectedRef.current) {
        onDisconnectRef.current?.();
      }
    };
    ws.onerror = () => {
      setConnected(false);
      setUseSimulator(true);
    };
    ws.onmessage = (event) => {
      if (!(event.data instanceof ArrayBuffer)) return;
      const blob = new Blob([event.data], { type: 'image/jpeg' });
      const objectUrl = URL.createObjectURL(blob);
      if (imgRef.current) {
        imgRef.current.src = objectUrl;
        setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
      }
      frameCount.current++;
      const now = Date.now();
      if (now - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = now;
      }
    };

    return () => {
      clearTimeout(timeout);
      intentionallyClosedRef.current = true;
      ws.close();
    };
  }, [url]);

  if (useSimulator) {
    return <CanvasVideoSimulator onDisconnect={onDisconnect} />;
  }

  return (
    <div className="relative bg-black border border-[var(--color-accent)]/30">
      <img
        ref={imgRef}
        alt="Live video stream"
        className="w-full h-full object-contain min-h-[300px]"
      />
      {!connected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center space-y-2">
            <div className="text-[var(--color-accent)] text-4xl animate-pulse">📡</div>
            <p className="text-[var(--color-text-secondary)]">Waiting for glasses connection...</p>
          </div>
        </div>
      )}
      <div className="absolute top-2 right-2 flex gap-2 text-xs">
        <span className={`px-2 py-0.5 rounded ${connected ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {connected ? 'LIVE' : 'OFFLINE'}
        </span>
        <span className="bg-black/70 text-[var(--color-accent)] px-2 py-0.5 rounded">
          {fps} FPS
        </span>
      </div>
    </div>
  );
}
