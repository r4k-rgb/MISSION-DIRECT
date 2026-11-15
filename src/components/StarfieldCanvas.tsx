import React, { useEffect, useRef } from 'react';
import { SceneBackdropId } from '../types/game';

interface StarfieldCanvasProps {
  theme?: SceneBackdropId;
}

const THEME_TINTS: Record<SceneBackdropId, { bg: string; accent: string }> = {
  station_bridge: { bg: '#090814', accent: '#4de8ff' },
  launchpad_dusk: { bg: '#0e0a1e', accent: '#c084fc' },
  leo_storm: { bg: '#071122', accent: '#38bdf8' },
  lunar_crater: { bg: '#090914', accent: '#94a3b8' },
  lagrange_sun: { bg: '#120814', accent: '#fbbf24' },
  mars_canyon: { bg: '#16090c', accent: '#fb923c' },
  asteroid_belt: { bg: '#0b0a18', accent: '#a78bfa' },
  europa_ice: { bg: '#071220', accent: '#6ee7a0' },
  titan_haze: { bg: '#140d07', accent: '#f59e0b' },
  neptune_gate: { bg: '#05091c', accent: '#4de8ff' },
};

export const StarfieldCanvas: React.FC<StarfieldCanvasProps> = ({ theme = 'station_bridge' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 240;
    const H = 135;
    canvas.width = W;
    canvas.height = H;

    const stars = Array.from({ length: 85 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      speed: 0.03 + Math.random() * 0.14,
      phase: Math.random() * Math.PI * 2,
      size: Math.random() > 0.85 ? 2 : 1,
    }));

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;

    const render = (time: number) => {
      const palette = THEME_TINTS[theme] || THEME_TINTS.station_bridge;
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, W, H);

      // Subtle nebula pixel blocks
      ctx.fillStyle = palette.accent + '12';
      ctx.fillRect(20, 20, 64, 34);
      ctx.fillRect(150, 72, 70, 42);

      stars.forEach((s, idx) => {
        if (!reducedMotion) {
          s.x -= s.speed;
          if (s.x < 0) s.x = W;
        }
        const blink = Math.sin(time / 600 + s.phase);
        ctx.fillStyle = blink > 0.65 ? palette.accent : blink < -0.5 ? '#453ea8' : '#e2e8f0';
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
        if (idx % 17 === 0 && blink > 0.85) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
        }
      });

      if (!reducedMotion) {
        rafId = requestAnimationFrame(render);
      }
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none pixelated z-0"
    />
  );
};
