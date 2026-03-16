/**
 * AscensionHero — Cinematic hero section for the Ascension page
 * Animated node collision visualization with orbital ring
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Upload, Zap, Diamond, Package } from 'lucide-react';

const LIFECYCLE_STEPS = [
  { step: '01', title: 'Ingest', desc: 'Your software enters the substrate as a candidate node.', icon: Upload },
  { step: '02', title: 'Ascension', desc: 'Discovery engine runs collision cycles against 40 nodes.', icon: Zap },
  { step: '03', title: 'Crystallize', desc: 'High-value capability chains are locked into memories.', icon: Diamond },
  { step: '04', title: 'Ascended Memory', desc: 'Export portable artifacts back to your stack.', icon: Package },
];

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
      speed: 0.002 + Math.random() * 0.003,
      radius: 0.32 + Math.random() * 0.12,
      size: 1.5 + Math.random() * 2,
      hue: [260, 200, 170, 45, 320][i % 5],
    }));

    let time = 0;
    const draw = () => {
      time += 0.016;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.38;

      ctx.clearRect(0, 0, w, h);

      // Orbital rings
      for (let ring = 0; ring < 3; ring++) {
        const r = baseR * (0.6 + ring * 0.22);
        const alpha = 0.04 + Math.sin(time * 0.5 + ring) * 0.02;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(260, 60%, 60%, ${alpha})`;
        ctx.lineWidth = 0.5;
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
        if (linePulse > 0.7) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(x, y);
          ctx.strokeStyle = `hsla(${node.hue}, 70%, 60%, ${(linePulse - 0.7) * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // Node glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, node.size * 3);
        glow.addColorStop(0, `hsla(${node.hue}, 80%, 70%, 0.4)`);
        glow.addColorStop(1, `hsla(${node.hue}, 80%, 70%, 0)`);
        ctx.beginPath();
        ctx.arc(x, y, node.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Node dot
        ctx.beginPath();
        ctx.arc(x, y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${node.hue}, 70%, 65%, 0.8)`;
        ctx.fill();
      }

      // Center node (#41)
      const pulse = Math.sin(time * 3) * 3 + 12;
      const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulse * 2.5);
      centerGlow.addColorStop(0, 'hsla(260, 80%, 70%, 0.5)');
      centerGlow.addColorStop(0.5, 'hsla(260, 80%, 60%, 0.15)');
      centerGlow.addColorStop(1, 'hsla(260, 80%, 60%, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, pulse * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = centerGlow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(260, 70%, 60%, ${0.6 + Math.sin(time * 4) * 0.2})`;
      ctx.fill();

      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = 'hsla(220, 20%, 90%, 0.9)';
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
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.7 }}
    />
  );
}

export function AscensionHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/10">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsla(260,60%,50%,0.08)_0%,_transparent_70%)]" />

      <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-10 sm:pt-16 sm:pb-14 lg:pt-20 lg:pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left — Text content */}
          <div className="order-2 lg:order-1">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 mb-4 sm:mb-6"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
                CMPSBL Cognitive Substrate
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-3 sm:mb-4"
            >
              Ascension
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-lg text-muted-foreground max-w-lg mb-4 sm:mb-6 leading-relaxed"
            >
              Bring your software into the substrate. New capabilities emerge from interaction — crystallized into portable,{' '}
              <span className="text-primary/80 font-medium">Ascended Memories</span>.
            </motion.p>

            {/* Explanatory paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-muted-foreground/80 max-w-lg leading-relaxed mb-6 sm:mb-8"
            >
              During an Ascension cycle, your code is introduced as a candidate node and collided against 40 substrate nodes.
              Successful chains are locked into deterministic memories — fully exportable as source code, tests, documentation,
              and the embedded Mini-Runtime™ engine.
            </motion.p>

            {/* Ascended Memory callout */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-start gap-3 rounded-lg border border-primary/15 bg-primary/[0.03] px-4 py-3 max-w-lg"
            >
              <Sparkles className="w-4 h-4 text-primary/60 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-primary/80 font-semibold">Ascended Memory</span> — A crystallized capability chain that
                encodes deterministic behavior emerging only when your code interacts with the substrate's node matrix.
              </p>
            </motion.div>
          </div>

          {/* Right — Animated orbital diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="order-1 lg:order-2 relative aspect-square max-w-[340px] sm:max-w-[400px] mx-auto w-full"
          >
            <OrbitalCanvas />
          </motion.div>
        </div>

        {/* Lifecycle Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {LIFECYCLE_STEPS.map((item, i) => (
            <div key={item.step} className="relative group">
              <div className="rounded-xl border border-border/20 bg-card/20 p-3 sm:p-4 h-full transition-colors hover:border-primary/20 hover:bg-primary/[0.02]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono text-primary/60">{item.step}</span>
                  <item.icon className="w-3.5 h-3.5 text-primary/70" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-foreground mb-1">{item.title}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
              {i < 3 && (
                <ArrowRight className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/30 z-10" />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
