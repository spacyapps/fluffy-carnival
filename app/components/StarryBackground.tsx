'use client';

import { useEffect, useRef } from 'react';

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ONLY occasional shooting stars (no static dots)
      if (Math.random() < 0.018) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height * 0.6);

        // Main shooting star
        ctx.strokeStyle = 'rgba(220, 240, 255, 0.95)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 150, y + 55);
        ctx.stroke();

        // Glow
        ctx.strokeStyle = 'rgba(180, 220, 255, 0.4)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 120, y + 45);
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[-8] pointer-events-none" />;
}
