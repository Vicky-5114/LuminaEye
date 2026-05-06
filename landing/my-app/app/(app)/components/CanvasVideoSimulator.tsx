'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  onDisconnect?: () => void;
}

export default function CanvasVideoSimulator({ onDisconnect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startTime = Date.now();
    lastTime.current = startTime;

    const draw = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;

      // Background
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, 640, 480);

      // Grid lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= 640; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 480);
        ctx.stroke();
      }
      for (let y = 0; y <= 480; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(640, y);
        ctx.stroke();
      }

      // Moving shapes (simulating detected objects)
      const shapes = [
        { x: 100 + Math.sin(elapsed * 0.5) * 50, y: 150 + Math.cos(elapsed * 0.3) * 30, color: '#00f0ff', size: 30 },
        { x: 400 + Math.cos(elapsed * 0.4) * 60, y: 200 + Math.sin(elapsed * 0.6) * 40, color: '#00ff88', size: 25 },
        { x: 250 + Math.sin(elapsed * 0.7) * 40, y: 350 + Math.cos(elapsed * 0.5) * 50, color: '#ff00a0', size: 20 },
      ];

      shapes.forEach((shape) => {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
        ctx.fillStyle = `${shape.color}33`;
        ctx.fillRect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);

        // Label
        ctx.fillStyle = shape.color;
        ctx.font = '10px monospace';
        ctx.fillText(`OBJ ${(0.92).toFixed(2)}`, shape.x - shape.size / 2, shape.y - shape.size / 2 - 4);
      });

      // Crosshair
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(320, 220);
      ctx.lineTo(320, 260);
      ctx.moveTo(300, 240);
      ctx.lineTo(340, 240);
      ctx.stroke();

      // Scan line
      const scanY = ((elapsed * 60) % 480);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(640, scanY);
      ctx.stroke();

      // Timestamp
      ctx.fillStyle = '#00f0ff';
      ctx.font = '12px Orbitron, monospace';
      ctx.fillText(new Date().toLocaleTimeString('en-US'), 520, 30);

      // Simulated feed label
      ctx.fillStyle = 'rgba(255, 221, 0, 0.8)';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('SIMULATED FEED', 12, 24);

      // Corner brackets (HUD aesthetic)
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      const corners = [
        [10, 10, 20, 10, 20, 20],
        [620, 10, 630, 10, 630, 20],
        [10, 470, 20, 470, 20, 460],
        [620, 470, 630, 470, 630, 460],
      ];
      corners.forEach(([x1, y1, x2, y2, x3, y3]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.stroke();
      });

      frameCount.current++;
      if (now - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = now;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [onDisconnect]);

  return (
    <div className="relative bg-black border border-[var(--color-accent)]/30">
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="w-full h-auto object-contain"
        style={{ minHeight: 300 }}
      />
      <div className="absolute top-2 right-2 flex gap-2 text-xs">
        <span className="bg-green-600 text-white px-2 py-0.5 rounded">LIVE</span>
        <span className="bg-black/70 text-[var(--color-accent)] px-2 py-0.5 rounded">{fps} FPS</span>
      </div>
    </div>
  );
}
