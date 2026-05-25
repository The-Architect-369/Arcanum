'use client';

import { useEffect, useRef } from 'react';

type Star = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  hue: number;
};

const STAR_COUNT = 44;
const LINK_DISTANCE = 92;
const COLORS = [44, 202, 260, 282];

export default function ConstellationField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let raf = 0;
    let stars: Star[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      stars = Array.from({ length: STAR_COUNT }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: 0.8 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        hue: COLORS[index % COLORS.length],
      }));
    };

    const draw = () => {
      frame += 1;
      context.clearRect(0, 0, width, height);

      const gradient = context.createRadialGradient(width / 2, height * 0.2, 0, width / 2, height / 2, Math.max(width, height));
      gradient.addColorStop(0, 'rgba(30, 58, 138, 0.10)');
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.04)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.26)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      for (const star of stars) {
        if (!reducedMotion) {
          star.x += star.vx;
          star.y += star.vy;
          star.phase += 0.012;
          star.hue += Math.sin((frame + star.phase) * 0.006) * 0.08;
        }

        if (star.x < -8) star.x = width + 8;
        if (star.x > width + 8) star.x = -8;
        if (star.y < -8) star.y = height + 8;
        if (star.y > height + 8) star.y = -8;
      }

      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const a = stars[i];
          const b = stars[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);
          if (distance > LINK_DISTANCE) continue;

          const strength = 1 - distance / LINK_DISTANCE;
          const hue = (a.hue + b.hue) / 2;
          context.strokeStyle = `hsla(${hue}, 95%, 72%, ${0.18 * strength})`;
          context.lineWidth = 0.7;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }

      for (const star of stars) {
        const pulse = 0.64 + Math.sin(star.phase) * 0.28;
        context.fillStyle = `hsla(${star.hue}, 95%, 75%, ${0.55 + pulse * 0.35})`;
        context.shadowColor = `hsla(${star.hue}, 95%, 72%, 0.7)`;
        context.shadowBlur = 8 + pulse * 10;
        context.beginPath();
        context.arc(star.x, star.y, star.r + pulse * 0.35, 0, Math.PI * 2);
        context.fill();
      }

      context.shadowBlur = 0;
      if (!reducedMotion) raf = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 opacity-80" aria-hidden="true" />;
}
