/**
 * AscensionHero — Cinematic hallmark hero for the Ascension page
 * Full-width gradient, centered text, animated orbital canvas below, CTAs
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload, Zap, Diamond, Package, ArrowRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ═══ ORBITAL CANVAS ═══ */
function OrbitalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const nodes = Array.from({ length: 40 }, (_, i) => ({
      angle: (i / 40) * Math.PI * 2,
      speed: 0.001 + Math.random() * 0.004,
      radius: 0.25 + Math.random() * 0.2,
      size: 1.5 + Math.random() * 2.5,
      hue: [185, 280, 310, 145, 38, 210][i % 6],
    }));

    let time = 0;
    const draw = () => {
      time += 0.016;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.42;

      ctx.clearRect(0, 0, w, h);

      // Orbital rings with gradient colors
      const ringColors = [
        { hue: 185, sat: 100, light: 50 },
        { hue: 280, sat: 80, light: 60 },
        { hue: 310, sat: 90, light: 55 },
      ];
      for (let ring = 0; ring < 3; ring++) {
        const r = baseR * (0.5 + ring * 0.25);
        const alpha = 0.06 + Math.sin(time * 0.4 + ring) * 0.03;
        const c = ringColors[ring];
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${c.hue}, ${c.sat}%, ${c.light}%, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Node particles
      for (const node of nodes) {
        node.angle += node.speed;
        const r = baseR * node.radius;
        const x = cx + r * Math.cos(node.angle);
        const y = cy + r * Math.sin(node.angle);

        // Connection line to center (faint)
        const linePulse = Math.sin(time * 2 + node.angle) * 0.5 + 0.5;
        if (linePulse > 0.65) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(x, y);
          ctx.strokeStyle = `hsla(${node.hue}, 80%, 60%, ${(linePulse - 0.65) * 0.2})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }

        // Node glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, node.size * 4);
        glow.addColorStop(0, `hsla(${node.hue}, 90%, 70%, 0.5)`);
        glow.addColorStop(1, `hsla(${node.hue}, 90%, 70%, 0)`);
        ctx.beginPath();
        ctx.arc(x, y, node.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Node dot
        ctx.beginPath();
        ctx.arc(x, y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${node.hue}, 80%, 70%, 0.9)`;
        ctx.fill();
      }

      // Center node — the candidate (#41) — pulsing bright
      const pulse = Math.sin(time * 2.5) * 4 + 14;
      const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulse * 3);
      outerGlow.addColorStop(0, 'hsla(185, 100%, 60%, 0.6)');
      outerGlow.addColorStop(0.3, 'hsla(280, 80%, 60%, 0.2)');
      outerGlow.addColorStop(1, 'hsla(280, 80%, 60%, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, pulse * 3, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulse);
      innerGlow.addColorStop(0, 'hsla(185, 100%, 70%, 0.8)');
      innerGlow.addColorStop(1, 'hsla(185, 100%, 50%, 0.3)');
      ctx.beginPath();
      ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
      ctx.fillStyle = innerGlow;
      ctx.fill();

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = 'hsla(0, 0%, 100%, 0.9)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('#41', cx, cy);

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
    />
  );
}

/* ═══ LIFECYCLE PIPELINE DIAGRAM ═══ */
const LIFECYCLE_STEPS = [
  { step: '01', title: 'INGEST', desc: 'Software enters the substrate as Candidate Node #41', icon: Upload, color: 'neon-cyan' },
  { step: '02', title: 'ASCENSION', desc: 'Collision cycles against 40 autonomous substrate nodes', icon: Zap, color: 'neon-purple' },
  { step: '03', title: 'CRYSTALLIZE', desc: 'High-value chains locked into deterministic memories', icon: Diamond, color: 'neon-magenta' },
  { step: '04', title: 'EXPORT', desc: 'Portable Ascended Memories delivered to your stack', icon: Package, color: 'neon-amber' },
] as const;

export function AscensionHero() {
  return (
    <section className="relative overflow-hidden">
      {/* ═══ BACKGROUND LAYERS ═══ */}
      {/* Multi-color gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/[0.08] via-background to-neon-purple/[0.06]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_hsl(var(--neon-cyan)/0.12)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,_hsl(var(--neon-purple)/0.1)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,_hsl(var(--neon-magenta)/0.05)_0%,_transparent_60%)]" />
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />

      <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-6 sm:pt-20 sm:pb-10 lg:pt-28 lg:pb-14">
        {/* ═══ CENTERED TEXT BLOCK ═══ */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/[0.06] mb-6 sm:mb-8"
          >
            <Crown className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] sm:text-[11px] font-mono text-primary uppercase tracking-[0.2em]">
              Proprietary Evolution Engine
            </span>
          </motion.div>

          {/* H1 — Big, gradient, bold */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6"
          >
            <span className="bg-gradient-to-r from-primary via-neon-purple to-neon-magenta bg-clip-text text-transparent">
              Ascend Your Software
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-5 leading-relaxed"
          >
            Introduce your code to the cognitive substrate. Watch new capabilities
            emerge — crystallized into portable{' '}
            <span className="text-primary font-semibold">Ascended Memories</span>.
          </motion.p>

          {/* Explanatory paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm sm:text-base text-muted-foreground/70 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed"
          >
            Your code becomes Candidate Node #41 — collided against the full substrate matrix.
            Successful chains are locked into deterministic memories and exported as source code,
            tests, documentation, and the Mini-Runtime™ engine.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2 text-base px-8 h-12 bg-gradient-to-r from-primary to-neon-purple hover:opacity-90 transition-opacity shadow-[0_0_30px_hsl(var(--primary)/0.3)] min-h-[48px]"
              onClick={() => {
                const el = document.getElementById('ascension-phases');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Upload className="w-4 h-4" />
              Upload Code
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto gap-2 text-base px-8 h-12 border-primary/30 hover:bg-primary/5 min-h-[48px]"
              onClick={() => window.open('/pricing', '_self')}
            >
              <Sparkles className="w-4 h-4" />
              Upgrade for More
            </Button>
          </motion.div>
        </div>

        {/* ═══ ORBITAL DIAGRAM — below text, centered ═══ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
          className="relative mx-auto w-full max-w-[320px] sm:max-w-[420px] md:max-w-[480px] aspect-square"
        >
          {/* Outer glow ring */}
          <div className="absolute inset-[-20%] rounded-full bg-[radial-gradient(circle,_hsl(var(--neon-cyan)/0.08)_0%,_transparent_70%)]" />
          <OrbitalCanvas />
          {/* Label */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2">
            <span className="text-[9px] font-mono text-muted-foreground/50 tracking-widest uppercase">
              40-Node Substrate Matrix • Live
            </span>
          </div>
        </motion.div>

        {/* ═══ LIFECYCLE PIPELINE — 4 steps ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          id="ascension-phases"
        >
          {LIFECYCLE_STEPS.map((item, i) => (
            <div key={item.step} className="relative group">
              <div className="rounded-xl border border-border/20 bg-card/30 backdrop-blur-sm p-4 sm:p-5 h-full transition-all hover:border-primary/30 hover:bg-primary/[0.04] hover:shadow-[0_0_20px_hsl(var(--primary)/0.08)]">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[10px] font-mono text-primary/60 font-bold">{item.step}</span>
                  <div className={`w-6 h-6 rounded-md bg-${item.color}/10 flex items-center justify-center`}>
                    <item.icon className={`w-3.5 h-3.5 text-${item.color}`} />
                  </div>
                </div>
                <p className="text-sm sm:text-base font-bold text-foreground mb-1 tracking-tight">{item.title}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
              {i < 3 && (
                <ArrowRight className="hidden sm:block absolute -right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/30 z-10" />
              )}
            </div>
          ))}
        </motion.div>

        {/* ═══ ASCENDED MEMORY CALLOUT ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 sm:mt-10 max-w-2xl mx-auto"
        >
          <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.04] to-neon-purple/[0.04] px-5 py-4">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Ascended Memory</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A crystallized capability chain encoding deterministic behavior that emerges only when
                your code interacts with the substrate's node matrix. Fully exportable as portable artifacts.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
