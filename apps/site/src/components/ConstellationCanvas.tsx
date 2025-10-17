'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * ConstellationCanvas
 * Persistent animated background for the entire landing page.
 * - Fixed full-screen starfield that remains visible while scrolling.
 * - GPU-friendly rendering capped at devicePixelRatio <= 2.
 * - Fades in smoothly during initial load for a cinematic reveal.
 */
export default function ConstellationCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let fade = 0;

    type Point = { x: number; y: number; r: number; dx: number; dy: number };
    const POINTS = 88;
    const MAX_DIST = 180;
    const STAR_SPREAD = 8;
    const TWINKLE = true;

    const points: Point[] = Array.from({ length: POINTS }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.7 + Math.random() * 1.2,
      dx: (Math.random() - 0.5) * 0.0005,
      dy: (Math.random() - 0.5) * 0.0005,
    }));

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawBackground = () => {
      const g = ctx.createRadialGradient(
        canvas.width / 2 / dpr,
        canvas.height / 3 / dpr,
        0,
        canvas.width / 2 / dpr,
        canvas.height / 2 / dpr,
        Math.max(canvas.width, canvas.height) / dpr / 1.2
      );
      g.addColorStop(0, 'rgba(0,10,20,0.45)');
      g.addColorStop(1, 'rgba(0,0,0,0.9)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    };

    const drawStars = () => {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (const p of points) {
        p.x = (p.x + p.dx + 1) % 1;
        p.y = (p.y + p.dy + 1) % 1;
        const x = p.x * (canvas.width / dpr);
        const y = p.y * (canvas.height / dpr);
        const base = p.r;
        const t = TWINKLE
          ? 0.85 +
            Math.sin((x + y + performance.now() * 0.001) % (2 * Math.PI)) * 0.15
          : 1;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, base * STAR_SPREAD);
        grad.addColorStop(0, `rgba(200,255,255,${0.7 * t})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, base * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const drawLines = () => {
      const coords = points.map((p) => ({
        x: p.x * (canvas.width / dpr),
        y: p.y * (canvas.height / dpr),
      }));

      for (let i = 0; i < coords.length; i++) {
        const a = coords[i];
        const neighbors: { j: number; dist: number }[] = [];
        for (let j = 0; j < coords.length; j++) {
          if (i === j) continue;
          const b = coords[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= MAX_DIST) neighbors.push({ j, dist });
        }
        neighbors.sort((m, n) => m.dist - n.dist);
        const pick = neighbors.slice(0, 3);
        for (const n of pick) {
          const b = coords[n.j];
          const t = 1 - n.dist / MAX_DIST;
          const alpha = 0.35 * (t * t);
          ctx.strokeStyle = `rgba(140,220,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    };

    const tick = () => {
      fade = Math.min(fade + 0.015, 1);
      ctx.globalAlpha = fade;

      drawBackground();
      drawLines();
      drawStars();
      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [ready]);

  return (
    <canvas
      ref={canvasRef}
      className={`${className} fixed inset-0 h-full w-full -z-10 pointer-events-none`}
      width={1920}
      height={1080}
    />
  );
}
