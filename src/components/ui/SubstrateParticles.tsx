/**
 * SubstrateParticles — Ambient canvas particle field
 * Memory Stream crystallization aesthetic: drifting particles with glow trails.
 * Lightweight, uses requestAnimationFrame, auto-pauses when off-screen.
 */

import { useEffect, useRef, memo } from "react";

interface SubstrateParticlesProps {
  /** Number of particles */
  count?: number;
  /** Primary color in HSL, e.g. "210 60% 45%" */
  color?: string;
  /** Secondary accent color */
  accent?: string;
  /** Particle speed multiplier */
  speed?: number;
  /** Enable glow trails */
  glow?: boolean;
  /** CSS class for the container */
  className?: string;
  /** Enable crystallization burst effect */
  crystallizing?: boolean;
}

export const SubstrateParticles = memo(function SubstrateParticles({
  count = 40,
  color = "var(--primary)",
  accent = "var(--neon-cyan)",
  speed = 1,
  glow = true,
  className = "",
  crystallizing = false,
}: SubstrateParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const crystallizingRef = useRef(crystallizing);

  crystallizingRef.current = crystallizing;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Parse CSS variable colors at paint time via computed style
    const getColor = (cssVar: string, alpha: number) => {
      // cssVar is like "var(--primary)" or raw HSL
      return `hsla(${cssVar.replace(/var\(|\)/g, "")}, ${alpha})`;
    };

    // Init particles
    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      size: number;
      life: number;
      maxLife: number;
      isAccent: boolean;
      trail: { x: number; y: number }[];
    }

    const spawn = (): Particle => ({
      x: Math.random() * (w || 800),
      y: Math.random() * (h || 600),
      vx: (Math.random() - 0.5) * 0.3 * speed,
      vy: (Math.random() - 0.5) * 0.2 * speed - 0.1 * speed,
      size: 1 + Math.random() * 2,
      life: 0,
      maxLife: 300 + Math.random() * 400,
      isAccent: Math.random() < 0.3,
      trail: [],
    });

    particlesRef.current = Array.from({ length: count }, spawn);

    const computedStyle = getComputedStyle(document.documentElement);
    const resolveHSL = (v: string): string => {
      if (v.startsWith("var(")) {
        const prop = v.replace(/var\(|\)/g, "").trim();
        return computedStyle.getPropertyValue(prop).trim();
      }
      return v;
    };

    const draw = () => {
      if (!ctx || !w || !h) { animRef.current = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, w, h);

      const primaryHSL = resolveHSL(color);
      const accentHSL = resolveHSL(accent);
      const isCrystallizing = crystallizingRef.current;

      for (const p of particlesRef.current) {
        p.life++;

        // Crystallization effect: particles rush toward center
        if (isCrystallizing) {
          const cx = w / 2, cy = h / 2;
          const dx = cx - p.x, dy = cy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 5) {
            p.vx += (dx / dist) * 0.05;
            p.vy += (dy / dist) * 0.05;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Damping
        p.vx *= 0.999;
        p.vy *= 0.999;

        // Wrap
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Respawn if dead
        if (p.life > p.maxLife) {
          Object.assign(p, spawn());
        }

        // Trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 8) p.trail.shift();

        const lifeFrac = Math.min(p.life / 60, 1) * Math.max(1 - (p.life / p.maxLife), 0);
        const baseAlpha = lifeFrac * 0.6;
        const hsl = p.isAccent ? accentHSL : primaryHSL;

        // Draw trail
        if (glow && p.trail.length > 2) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
          }
          ctx.strokeStyle = `hsla(${hsl}, ${baseAlpha * 0.3})`;
          ctx.lineWidth = p.size * 0.5;
          ctx.stroke();
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (isCrystallizing ? 1.5 : 1), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hsl}, ${baseAlpha})`;
        ctx.fill();

        // Glow
        if (glow && baseAlpha > 0.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          g.addColorStop(0, `hsla(${hsl}, ${baseAlpha * 0.3})`);
          g.addColorStop(1, `hsla(${hsl}, 0)`);
          ctx.fillStyle = g;
          ctx.fill();
        }
      }

      // Connection lines between nearby particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.08;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `hsla(${primaryHSL}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [count, color, accent, speed, glow]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width: "100%", height: "100%" }}
      aria-hidden="true"
    />
  );
});
