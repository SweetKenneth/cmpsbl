/**
 * AscensionHero — Cinematic hallmark hero for the Ascension page
 * Full-width gradient, centered text, real 40-node orbital canvas with bouncing #41, CTAs
 */

import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload, Zap, Diamond, Package, ArrowRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ═══ REAL 40-NODE REGISTRY — from matrixNodeRegistry.ts ═══ */
const SUBSTRATE_NODES: { id: string; label: string; sector: string; short: string }[] = [
  { id: 'core', label: 'CORE', sector: 'core', short: 'Ω₀' },
  { id: 'system', label: 'SYS', sector: 'system', short: 'Σ₁' },
  { id: 'brain', label: 'BRN', sector: 'ccr', short: 'Ψ₂' },
  { id: 'memory', label: 'MEM', sector: 'ccr', short: 'Ψ₃' },
  { id: 'dream', label: 'DRM', sector: 'ccr', short: 'Ψ₄' },
  { id: 'ripple', label: 'RPL', sector: 'ocg', short: 'Γ₅' },
  { id: 'access', label: 'ACC', sector: 'ocg', short: 'Γ₆' },
  { id: 'identity', label: 'IDN', sector: 'ocg', short: 'Γ₇' },
  { id: 'relay', label: 'RLY', sector: 'ocg', short: 'Γ₈' },
  { id: 'audit', label: 'AUD', sector: 'ocg', short: 'Γ₉' },
  { id: 'nerve', label: 'NRV', sector: 'ocg', short: 'Γ₁₀' },
  { id: 'decode', label: 'DEC', sector: 'execution', short: 'Δ₁₁' },
  { id: 'encode', label: 'ENC', sector: 'execution', short: 'Δ₁₂' },
  { id: 'vision', label: 'VIS', sector: 'execution', short: 'Δ₁₃' },
  { id: 'cortex', label: 'CTX', sector: 'execution', short: 'Δ₁₄' },
  { id: 'nexus', label: 'NXS', sector: 'execution', short: 'Δ₁₅' },
  { id: 'economy', label: 'ECN', sector: 'execution', short: 'Δ₁₆' },
  { id: 'sandbox', label: 'SBX', sector: 'execution', short: 'Δ₁₇' },
  { id: 'inclusive', label: 'INC', sector: 'execution', short: 'Δ₁₈' },
  { id: 'medic', label: 'MDC', sector: 'execution', short: 'Δ₁₉' },
  { id: 'integration', label: 'INT', sector: 'execution', short: 'Δ₂₀' },
  { id: 'sovereign', label: 'SOV', sector: 'esz', short: 'Ξ₂₁' },
  { id: 'oracle', label: 'ORC', sector: 'esz', short: 'Ξ₂₂' },
  { id: 'conscience', label: 'CON', sector: 'esz', short: 'Ξ₂₃' },
  { id: 'treaty', label: 'TRT', sector: 'esz', short: 'Ξ₂₄' },
  { id: 'compass', label: 'CMP', sector: 'epz', short: 'Φ₂₅' },
  { id: 'echo', label: 'ECH', sector: 'epz', short: 'Φ₂₆' },
  { id: 'reflex', label: 'RFX', sector: 'epz', short: 'Φ₂₇' },
  { id: 'forge', label: 'FRG', sector: 'emz', short: 'Λ₂₈' },
  { id: 'lingua', label: 'LNG', sector: 'emz', short: 'Λ₂₉' },
  { id: 'harvest', label: 'HRV', sector: 'emz', short: 'Λ₃₀' },
  { id: 'evolution', label: 'EVO', sector: 'csz', short: 'Θ₃₁' },
  { id: 'shadow', label: 'SHD', sector: 'csz', short: 'Θ₃₂' },
  { id: 'phantom', label: 'PHN', sector: 'csz', short: 'Θ₃₃' },
  { id: 'immunity', label: 'IMM', sector: 'field', short: 'Π₃₄' },
  { id: 'intent', label: 'ITN', sector: 'field', short: 'Π₃₅' },
  { id: 'governance', label: 'GOV', sector: 'plane', short: 'Κ₃₆' },
  { id: 'atlas', label: 'ATL', sector: 'plane', short: 'Κ₃₇' },
  { id: 'engineer', label: 'ENG', sector: 'plane', short: 'Κ₃₈' },
  { id: 'defense', label: 'DEF', sector: 'shell', short: 'Ω₃₉' },
];

const SECTOR_COLORS: Record<string, { h: number; s: number; l: number }> = {
  core: { h: 185, s: 100, l: 55 },
  system: { h: 185, s: 80, l: 50 },
  ccr: { h: 280, s: 80, l: 65 },
  ocg: { h: 210, s: 90, l: 55 },
  execution: { h: 145, s: 80, l: 50 },
  esz: { h: 38, s: 90, l: 55 },
  epz: { h: 310, s: 85, l: 60 },
  emz: { h: 165, s: 75, l: 50 },
  csz: { h: 340, s: 80, l: 55 },
  field: { h: 195, s: 100, l: 55 },
  plane: { h: 260, s: 70, l: 60 },
  shell: { h: 0, s: 70, l: 55 },
};

/* ═══ ORBITAL CANVAS — 40 real nodes + bouncing #41 ═══ */
function OrbitalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    // Determine if mobile-ish
    const isMobile = w < 500;
    const nodeRadius = isMobile ? 16 : 14;
    const fontSize = isMobile ? 7.5 : 7;
    const labelFontSize = isMobile ? 5.5 : 5;

    // Outer ring radius — nodes orbit along this
    const cx = w / 2;
    const cy = h / 2;
    const orbitR = Math.min(w, h) * 0.42;
    const innerR = orbitR * 0.35; // Bounds for #41 bouncing

    // Pre-compute orbital positions for 40 nodes
    const nodePositions: { x: number; y: number; color: { h: number; s: number; l: number }; node: typeof SUBSTRATE_NODES[0] }[] = [];

    const N = SUBSTRATE_NODES.length;
    const time = performance.now() / 1000;

    for (let i = 0; i < N; i++) {
      const node = SUBSTRATE_NODES[i];
      const baseAngle = (i / N) * Math.PI * 2 - Math.PI / 2;
      // Nodes run along the outer circle with slight drift
      const angle = baseAngle + Math.sin(time * 0.3 + i * 0.7) * 0.04;
      const r = orbitR + Math.sin(time * 0.5 + i * 1.3) * (isMobile ? 4 : 3);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      const color = SECTOR_COLORS[node.sector] || { h: 185, s: 80, l: 55 };
      nodePositions.push({ x, y, color, node });
    }

    // Node #41 — bounces inside the inner circle
    const bounce41 = {
      x: cx + Math.sin(time * 1.8) * innerR * 0.7 + Math.cos(time * 2.3) * innerR * 0.3,
      y: cy + Math.cos(time * 1.4) * innerR * 0.6 + Math.sin(time * 2.7) * innerR * 0.4,
    };

    ctx.clearRect(0, 0, w, h);

    // ── Background rings ──
    for (let ring = 0; ring < 3; ring++) {
      const r = orbitR * (0.35 + ring * 0.33);
      const alpha = 0.04 + Math.sin(time * 0.3 + ring * 1.2) * 0.02;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(185, 80%, 55%, ${alpha})`;
      ctx.lineWidth = 0.6;
      ctx.setLineDash([3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ── Connection lines from #41 to every outer node — spastic/electric ──
    for (let i = 0; i < N; i++) {
      const np = nodePositions[i];
      // Each line flashes at different rates
      const pulse = Math.sin(time * 3.5 + i * 0.9) * 0.5 + 0.5;
      const active = pulse > 0.4;
      if (active) {
        const alpha = (pulse - 0.4) * 0.5;
        // Electric jitter on the midpoint
        const jx = (bounce41.x + np.x) / 2 + Math.sin(time * 8 + i) * (isMobile ? 6 : 4);
        const jy = (bounce41.y + np.y) / 2 + Math.cos(time * 9 + i) * (isMobile ? 6 : 4);

        ctx.beginPath();
        ctx.moveTo(bounce41.x, bounce41.y);
        ctx.quadraticCurveTo(jx, jy, np.x, np.y);
        ctx.strokeStyle = `hsla(${np.color.h}, ${np.color.s}%, ${np.color.l}%, ${alpha})`;
        ctx.lineWidth = pulse > 0.75 ? 1.4 : 0.7;
        ctx.stroke();

        // Bright flash on strong connections
        if (pulse > 0.85) {
          ctx.beginPath();
          ctx.moveTo(bounce41.x, bounce41.y);
          ctx.quadraticCurveTo(jx, jy, np.x, np.y);
          ctx.strokeStyle = `hsla(${np.color.h}, 100%, 80%, ${(pulse - 0.85) * 2})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    // ── Draw 40 outer nodes — larger with labels ──
    for (let i = 0; i < N; i++) {
      const { x, y, color, node } = nodePositions[i];
      const pulse = Math.sin(time * 2 + i * 0.5) * 0.15 + 0.85;
      const r = nodeRadius * pulse;

      // Outer glow
      const glow = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2.5);
      glow.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.3)`);
      glow.addColorStop(1, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0)`);
      ctx.beginPath();
      ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Node body — filled circle
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
      grad.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l + 15}%, 0.9)`);
      grad.addColorStop(1, `hsla(${color.h}, ${color.s}%, ${color.l - 10}%, 0.7)`);
      ctx.fillStyle = grad;
      ctx.fill();

      // Border
      ctx.strokeStyle = `hsla(${color.h}, ${color.s}%, ${color.l + 20}%, 0.5)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Scientific label — e.g. "Ψ₂"
      ctx.font = `bold ${fontSize}px monospace`;
      ctx.fillStyle = 'hsla(0, 0%, 100%, 0.95)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.short, x, y - (isMobile ? 1 : 0.5));

      // Node name label below — e.g. "BRN"
      ctx.font = `${labelFontSize}px monospace`;
      ctx.fillStyle = `hsla(${color.h}, ${color.s}%, ${color.l + 20}%, 0.7)`;
      ctx.fillText(node.label, x, y + (isMobile ? 7 : 6));
    }

    // ── Center node #41 — The Candidate — large & bright ──
    const cPulse = Math.sin(time * 2.5) * 0.12 + 1;
    const c41r = (isMobile ? 26 : 22) * cPulse;

    // Massive outer glow
    const outerGlow = ctx.createRadialGradient(bounce41.x, bounce41.y, 0, bounce41.x, bounce41.y, c41r * 4);
    outerGlow.addColorStop(0, 'hsla(185, 100%, 65%, 0.5)');
    outerGlow.addColorStop(0.3, 'hsla(280, 80%, 60%, 0.15)');
    outerGlow.addColorStop(0.6, 'hsla(310, 80%, 55%, 0.05)');
    outerGlow.addColorStop(1, 'hsla(280, 80%, 60%, 0)');
    ctx.beginPath();
    ctx.arc(bounce41.x, bounce41.y, c41r * 4, 0, Math.PI * 2);
    ctx.fillStyle = outerGlow;
    ctx.fill();

    // Core body
    const c41grad = ctx.createRadialGradient(
      bounce41.x - c41r * 0.2, bounce41.y - c41r * 0.2, 0,
      bounce41.x, bounce41.y, c41r
    );
    c41grad.addColorStop(0, 'hsla(185, 100%, 80%, 0.95)');
    c41grad.addColorStop(0.5, 'hsla(200, 100%, 65%, 0.85)');
    c41grad.addColorStop(1, 'hsla(280, 80%, 55%, 0.7)');
    ctx.beginPath();
    ctx.arc(bounce41.x, bounce41.y, c41r, 0, Math.PI * 2);
    ctx.fillStyle = c41grad;
    ctx.fill();

    // Ring
    ctx.strokeStyle = 'hsla(185, 100%, 85%, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    ctx.font = `bold ${isMobile ? 11 : 10}px monospace`;
    ctx.fillStyle = 'hsla(0, 0%, 100%, 1)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('#41', bounce41.x, bounce41.y - 2);

    ctx.font = `${isMobile ? 7 : 6}px monospace`;
    ctx.fillStyle = 'hsla(185, 100%, 90%, 0.8)';
    ctx.fillText('YOUR CODE', bounce41.x, bounce41.y + (isMobile ? 9 : 8));

    frameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
    />
  );
}

/* ═══ LIFECYCLE PIPELINE DIAGRAM ═══ */
const LIFECYCLE_STEPS = [
  { step: '01', title: 'INGEST', desc: 'Your code enters as Candidate Node #41', icon: Upload, color: 'neon-cyan' },
  { step: '02', title: 'ASCENSION', desc: 'Collision cycles against all 40 substrate nodes', icon: Zap, color: 'neon-purple' },
  { step: '03', title: 'CRYSTALLIZE', desc: 'High-scoring chains locked into deterministic memories', icon: Diamond, color: 'neon-magenta' },
  { step: '04', title: 'EXPORT', desc: 'Portable Ascended Memories delivered to your stack', icon: Package, color: 'neon-amber' },
] as const;

export function AscensionHero() {
  return (
    <section className="relative overflow-hidden">
      {/* ═══ BACKGROUND LAYERS ═══ */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/[0.08] via-background to-neon-purple/[0.06]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_hsl(var(--neon-cyan)/0.12)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,_hsl(var(--neon-purple)/0.1)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,_hsl(var(--neon-magenta)/0.05)_0%,_transparent_60%)]" />
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />

      <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-6 sm:pt-16 sm:pb-10 lg:pt-24 lg:pb-14">
        {/* ═══ CENTERED TEXT BLOCK ═══ */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/[0.06] mb-5 sm:mb-7"
          >
            <Crown className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] sm:text-[11px] font-mono text-primary uppercase tracking-[0.2em]">
              Proprietary Evolution Engine
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-5"
          >
            <span className="bg-gradient-to-r from-primary via-neon-purple to-neon-magenta bg-clip-text text-transparent">
              Ascend Your Software
            </span>
          </motion.h1>

          {/* Strong subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground/90 max-w-2xl mx-auto mb-3 sm:mb-4 leading-snug"
          >
            Your code becomes Node #41 — collided against a living{' '}
            <span className="text-primary">40-node cognitive substrate</span>.
          </motion.p>

          {/* Clear explanatory paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed"
          >
            Upload pieces of your stack's code — or code discovered in the Memory Stream — and watch
            new capabilities emerge when it collides with the nodes from the CMPSBL Substrate.
            Successful interaction chains are crystallized into portable{' '}
            <span className="text-primary font-medium">Ascended Memories</span>{' '}
            you can export as source code, tests, and documentation.{' '}
            <span className="text-foreground/80 font-medium">Endless possibilities. Recursive by design.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10"
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

        {/* ═══ ORBITAL DIAGRAM — 3x size on mobile, fills viewport ═══ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
          className="relative mx-auto w-full aspect-square"
          style={{ maxWidth: 'min(90vw, 600px)' }}
        >
          {/* Outer glow ring */}
          <div className="absolute inset-[-15%] rounded-full bg-[radial-gradient(circle,_hsl(var(--neon-cyan)/0.06)_0%,_transparent_65%)]" />
          <OrbitalCanvas />
          {/* Label */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground/50 tracking-widest uppercase">
              40-Node Substrate Matrix • Candidate #41 Active
            </span>
          </div>
        </motion.div>

        {/* ═══ LIFECYCLE PIPELINE — 4 steps ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          id="ascension-phases"
        >
          {LIFECYCLE_STEPS.map((item, i) => (
            <div key={item.step} className="relative group">
              <div className="rounded-xl border border-border/20 bg-card/30 backdrop-blur-sm p-4 sm:p-5 h-full transition-all hover:border-primary/30 hover:bg-primary/[0.04] hover:shadow-[0_0_20px_hsl(var(--primary)/0.08)]">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[10px] font-mono text-primary/60 font-bold">{item.step}</span>
                  <div className={`w-7 h-7 rounded-md bg-${item.color}/10 flex items-center justify-center`}>
                    <item.icon className={`w-4 h-4 text-${item.color}`} />
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
              <p className="text-sm font-semibold text-foreground mb-1">What is an Ascended Memory?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A crystallized capability chain — deterministic behavior that emerges{' '}
                <em>only</em> when your code interacts with the substrate's 40-node matrix.
                Each Memory encodes the exact interaction path and is fully exportable as a
                portable Capability Pack: source code, tests, docs, and the Mini-Runtime™ engine.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
