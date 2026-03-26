/**
 * ConstellationForge — Discovery phase visual engine
 * 
 * A dark star field where the 40 substrate primitives sit as dormant stars.
 * Your Ψ₄₁ node glows at center. As collisions fire, target stars ignite
 * with a dramatic ~0.5s buildup, then a luminous tier-colored line draws
 * from center to node. The accumulated lines form a unique constellation —
 * the user's capability map.
 * 
 * PERF: Pure Canvas — no framer-motion, single rAF loop.
 */

import { useEffect, useRef, useMemo } from 'react';

interface CollisionEvent {
  targetNode: string;
  cjpiScore: number;
  tier: string;
  active: boolean;
}

interface ConstellationForgeProps {
  candidateNode: string;
  collisions: CollisionEvent[];
  running: boolean;
  currentTarget: string | null;
}

const TIER_COLORS: Record<string, [number, number, number]> = {
  apex:   [245, 158, 11],
  mythic: [168, 85, 247],
  relic:  [59, 130, 246],
  prime:  [34, 197, 94],
  mint:   [107, 114, 128],
};

const NODE_LIST = [
  'CORE','SYSTEM','BRAIN','MEMORY','DREAM',
  'RIPPLE','ACCESS','IDENTITY','RELAY','AUDIT','NERVE',
  'DECODE','ENCODE','VISION','CORTEX','NEXUS','ECONOMY','SANDBOX','INCLUSIVE','MEDIC','INTEGRATION',
  'SOVEREIGN','ORACLE','CONSCIENCE','TREATY',
  'COMPASS','ECHO','REFLEX',
  'FORGE','LINGUA','HARVEST',
  'EVOLUTION','SHADOW','PHANTOM',
  'IMMUNITY','INTENT',
  'GOVERNANCE','ATLAS','ENGINEER',
  'DEFENSE',
];

const GREEK_LABELS: Record<string, string> = {
  CORE:'Ω₁',SYSTEM:'Σ₂',BRAIN:'Ψ₃',MEMORY:'Μ₄',DREAM:'Δ₅',
  RIPPLE:'Ρ₆',ACCESS:'Α₇',IDENTITY:'Ι₈',RELAY:'Ρ₉',AUDIT:'Α₁₀',NERVE:'Ν₁₁',
  DECODE:'Δ₁₂',ENCODE:'Ε₁₃',VISION:'Β₁₄',CORTEX:'Κ₁₅',NEXUS:'Ν₁₆',ECONOMY:'Ε₁₇',
  SANDBOX:'Σ₁₈',INCLUSIVE:'Ι₁₉',MEDIC:'Μ₂₀',INTEGRATION:'Ι₂₁',
  SOVEREIGN:'Σ₂₂',ORACLE:'Φ₂₃',CONSCIENCE:'Χ₂₄',TREATY:'Τ₂₅',
  COMPASS:'Κ₂₆',ECHO:'Ε₂₇',REFLEX:'Ρ₂₈',
  FORGE:'Ζ₂₉',LINGUA:'Λ₃₀',HARVEST:'Η₃₁',
  EVOLUTION:'Ξ₃₂',SHADOW:'Σ₃₃',PHANTOM:'Π₃₄',
  IMMUNITY:'Ι₃₅',INTENT:'Λ₃₆',
  GOVERNANCE:'Γ₃₇',ATLAS:'Α₃₈',ENGINEER:'Ε₃₉',
  DEFENSE:'Θ₄₀',
};

const SIZE = 400;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RING_R = SIZE * 0.38;

const NODE_POSITIONS = (() => {
  const positions: Record<string, { x: number; y: number; angle: number }> = {};
  NODE_LIST.forEach((name, i) => {
    const angle = (i / NODE_LIST.length) * Math.PI * 2 - Math.PI / 2;
    positions[name] = {
      x: CX + RING_R * Math.cos(angle),
      y: CY + RING_R * Math.sin(angle),
      angle,
    };
  });
  return positions;
})();

// ═══ Animation state per node ═══
interface StarState {
  phase: 'dormant' | 'building' | 'revealed' | 'idle';
  buildStart: number;     // timestamp when buildup began
  revealStart: number;    // timestamp when line draw began
  tier: string;
  cjpiScore: number;
}

// ═══ Ambient star particles ═══
interface BackgroundStar {
  x: number; y: number;
  size: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

// ═══ Burst particles on reveal ═══
interface BurstParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: [number, number, number];
  size: number;
}

const BUILD_DURATION = 1.0;   // seconds — dramatic glow buildup (slow cinematic)
const LINE_DRAW_DURATION = 0.7; // seconds — line animates from center to node
const BURST_COUNT = 18;

function generateBackgroundStars(count: number): BackgroundStar[] {
  const stars: BackgroundStar[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * SIZE,
      y: Math.random() * SIZE,
      size: 0.3 + Math.random() * 1.2,
      twinkleSpeed: 0.5 + Math.random() * 2,
      twinkleOffset: Math.random() * Math.PI * 2,
    });
  }
  return stars;
}

export function ConstellationForge({ candidateNode, collisions, running, currentTarget }: ConstellationForgeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const starsRef = useRef<StarState>(null as any); // per-node state map
  const starMapRef = useRef<Record<string, StarState>>({});
  const bgStarsRef = useRef<BackgroundStar[]>(generateBackgroundStars(80));
  const burstRef = useRef<BurstParticle[]>([]);
  const prevTargetRef = useRef<string | null>(null);

  const collisionMap = useMemo(() => {
    const map: Record<string, CollisionEvent> = {};
    for (const c of collisions) {
      if (!map[c.targetNode] || c.cjpiScore > map[c.targetNode].cjpiScore) {
        map[c.targetNode] = c;
      }
    }
    return map;
  }, [collisions]);

  // ═══ Trigger dramatic reveal on new collision ═══
  useEffect(() => {
    const resolved = currentTarget?.split(' · ').find(n => NODE_POSITIONS[n]) || null;
    if (resolved && resolved !== prevTargetRef.current && NODE_POSITIONS[resolved]) {
      const now = timeRef.current;
      const existing = starMapRef.current[resolved];
      if (!existing || existing.phase === 'dormant' || existing.phase === 'idle') {
        starMapRef.current[resolved] = {
          phase: 'building',
          buildStart: now,
          revealStart: 0,
          tier: 'mint',
          cjpiScore: 0,
        };
      }
    }
    prevTargetRef.current = resolved;
  }, [currentTarget]);

  // ═══ Update collision results into star state ═══
  useEffect(() => {
    for (const [nodeName, col] of Object.entries(collisionMap)) {
      const state = starMapRef.current[nodeName];
      if (state) {
        state.tier = col.tier;
        state.cjpiScore = col.cjpiScore;
        // If still building, trigger reveal transition
        if (state.phase === 'building' && timeRef.current - state.buildStart >= BUILD_DURATION * 0.8) {
          state.phase = 'revealed';
          state.revealStart = timeRef.current;
          // Spawn burst particles
          const pos = NODE_POSITIONS[nodeName];
          if (pos) {
            const rgb = TIER_COLORS[col.tier] || TIER_COLORS.mint;
            for (let i = 0; i < BURST_COUNT; i++) {
              const angle = (i / BURST_COUNT) * Math.PI * 2 + Math.random() * 0.4;
              const speed = 1.2 + Math.random() * 2.5;
              burstRef.current.push({
                x: pos.x, y: pos.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1, maxLife: 0.5 + Math.random() * 0.6,
                color: rgb, size: 1 + Math.random() * 2,
              });
            }
          }
        }
      } else {
        // Node collided without a buildup phase (e.g., loaded from DB)
        starMapRef.current[nodeName] = {
          phase: 'idle',
          buildStart: 0,
          revealStart: 0,
          tier: col.tier,
          cjpiScore: col.cjpiScore,
        };
      }
    }
  }, [collisionMap]);

  // ═══ Main render loop ═══
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      const dt = 0.016;
      timeRef.current += dt;
      const t = timeRef.current;

      ctx.clearRect(0, 0, SIZE, SIZE);

      // ═══ BACKGROUND — Deep space ═══
      const bgGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, SIZE * 0.6);
      bgGrad.addColorStop(0, 'rgba(15, 10, 30, 0.4)');
      bgGrad.addColorStop(1, 'rgba(5, 3, 15, 0.2)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, SIZE, SIZE);

      // ═══ BACKGROUND STARS — Twinkling ═══
      const bgStars = bgStarsRef.current;
      for (const star of bgStars) {
        const twinkle = 0.2 + 0.8 * ((Math.sin(t * star.twinkleSpeed + star.twinkleOffset) + 1) / 2);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 190, 220, ${0.15 + twinkle * 0.35})`;
        ctx.fill();
      }

      // ═══ SUBTLE ORBIT RING — Faint guide ═══
      ctx.beginPath();
      ctx.arc(CX, CY, RING_R, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(120, 130, 160, ${running ? 0.08 : 0.04})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      const starMap = starMapRef.current;

      // ═══ CONSTELLATION LINES — Revealed connections ═══
      for (const [nodeName, state] of Object.entries(starMap)) {
        if (state.phase !== 'revealed' && state.phase !== 'idle') continue;
        const pos = NODE_POSITIONS[nodeName];
        if (!pos) continue;

        const rgb = TIER_COLORS[state.tier] || TIER_COLORS.mint;
        const lineAlpha = Math.min(0.7, state.cjpiScore / 140);
        const lineWidth = state.cjpiScore >= 85 ? 2.5 : state.cjpiScore >= 60 ? 1.5 : 0.8;

        // Animated line draw for newly revealed
        let drawProgress = 1;
        if (state.phase === 'revealed' && state.revealStart > 0) {
          drawProgress = Math.min(1, (t - state.revealStart) / LINE_DRAW_DURATION);
          if (drawProgress >= 1) state.phase = 'idle';
        }

        const endX = CX + (pos.x - CX) * drawProgress;
        const endY = CY + (pos.y - CY) * drawProgress;

        // Glow underlay for high-value
        if (state.cjpiScore >= 75) {
          ctx.beginPath();
          ctx.moveTo(CX, CY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${lineAlpha * 0.15})`;
          ctx.lineWidth = lineWidth + 6;
          ctx.stroke();
        }

        // Main constellation line
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${lineAlpha})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // Gentle pulse on completed lines
        if (state.phase === 'idle' && state.cjpiScore >= 80) {
          const pulse = 0.03 * Math.sin(t * 1.5 + pos.angle * 2);
          ctx.beginPath();
          ctx.moveTo(CX, CY);
          ctx.lineTo(pos.x, pos.y);
          ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${pulse + 0.05})`;
          ctx.lineWidth = lineWidth + 2;
          ctx.stroke();
        }
      }

      // ═══ SUBSTRATE NODES — Stars ═══
      for (const [nodeName, pos] of Object.entries(NODE_POSITIONS)) {
        const state = starMap[nodeName];
        const isCurrentTarget = currentTarget?.split(' · ').includes(nodeName);

        if (!state || state.phase === 'dormant') {
          // Dormant star — barely visible
          const dimFlicker = 0.1 + 0.05 * Math.sin(t * 0.7 + pos.angle * 5);
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(100, 110, 140, ${dimFlicker})`;
          ctx.fill();
          continue;
        }

        const rgb = TIER_COLORS[state.tier] || TIER_COLORS.mint;

        if (state.phase === 'building') {
          // ═══ DRAMATIC BUILDUP — Expanding glow ═══
          const buildProgress = Math.min(1, (t - state.buildStart) / BUILD_DURATION);
          const eased = buildProgress * buildProgress; // ease-in

          // Expanding glow ring
          const glowR = 3 + eased * 18;
          const glowGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowR);
          glowGrad.addColorStop(0, `rgba(180, 160, 255, ${0.3 * eased})`);
          glowGrad.addColorStop(0.6, `rgba(139, 92, 246, ${0.15 * eased})`);
          glowGrad.addColorStop(1, `rgba(139, 92, 246, 0)`);
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();

          // Pulsing core dot
          const coreR = 2 + eased * 3;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, coreR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 180, 255, ${0.5 + eased * 0.5})`;
          ctx.fill();

          // Transition to revealed when buildup completes
          if (buildProgress >= 1) {
            // Check if we have collision data
            const col = collisionMap[nodeName];
            if (col) {
              state.phase = 'revealed';
              state.revealStart = t;
              state.tier = col.tier;
              state.cjpiScore = col.cjpiScore;
              // Spawn burst
              const burstRgb = TIER_COLORS[col.tier] || TIER_COLORS.mint;
              for (let i = 0; i < BURST_COUNT; i++) {
                const angle = (i / BURST_COUNT) * Math.PI * 2 + Math.random() * 0.3;
                const speed = 1.5 + Math.random() * 2.5;
                burstRef.current.push({
                  x: pos.x, y: pos.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  life: 1, maxLife: 0.5 + Math.random() * 0.5,
                  color: burstRgb, size: 1.2 + Math.random() * 1.8,
                });
              }
            }
            // If no collision data yet, stay in building (will transition via effect)
          }

          continue;
        }

        // ═══ REVEALED / IDLE — Lit star ═══
        const starR = state.cjpiScore >= 85 ? 5 :
                      state.cjpiScore >= 60 ? 4 : 3;

        // Outer glow
        if (state.cjpiScore >= 60) {
          const glowGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, starR + 10);
          glowGrad.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.25)`);
          glowGrad.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`);
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, starR + 10, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();
        }

        // Star body
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, starR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.9)`;
        ctx.fill();

        // Inner bright core
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, starR * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();

        // Greek label + score
        const greek = GREEK_LABELS[nodeName] || nodeName.slice(0, 3);
        ctx.font = '7px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.8)`;
        ctx.fillText(greek, pos.x, pos.y - starR - 4);

        if (state.cjpiScore > 0) {
          ctx.font = 'bold 7px monospace';
          ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.9)`;
          ctx.fillText(String(state.cjpiScore), pos.x, pos.y + starR + 10);
        }
      }

      // ═══ SCAN BEAM — When targeting ═══
      const resolvedTarget = currentTarget?.split(' · ').find(n => NODE_POSITIONS[n]) || null;
      if (resolvedTarget && NODE_POSITIONS[resolvedTarget]) {
        const tPos = NODE_POSITIONS[resolvedTarget];
        const pulse = 0.5 + 0.5 * Math.sin(t * 8);

        // Faint scan beam
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.lineTo(tPos.x, tPos.y);
        ctx.strokeStyle = `rgba(139, 92, 246, ${pulse * 0.2})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -t * 40;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ═══ CENTER NODE — Ψ₄₁ ═══
      const centerPulse = running ? 13 + Math.sin(t * 2) * 2 : 12;

      // Outer corona
      const coronaGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, centerPulse + 20);
      coronaGrad.addColorStop(0, `rgba(139, 92, 246, ${running ? 0.2 : 0.12})`);
      coronaGrad.addColorStop(0.5, `rgba(6, 182, 212, ${running ? 0.08 : 0.04})`);
      coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(CX, CY, centerPulse + 20, 0, Math.PI * 2);
      ctx.fillStyle = coronaGrad;
      ctx.fill();

      // Core circle
      ctx.beginPath();
      ctx.arc(CX, CY, centerPulse, 0, Math.PI * 2);
      const cGrad = ctx.createRadialGradient(CX - 3, CY - 3, 0, CX, CY, centerPulse);
      cGrad.addColorStop(0, 'rgba(180, 160, 255, 0.95)');
      cGrad.addColorStop(1, 'rgba(139, 92, 246, 0.65)');
      ctx.fillStyle = cGrad;
      ctx.fill();

      // Core ring
      ctx.beginPath();
      ctx.arc(CX, CY, centerPulse + 1, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200, 185, 255, ${0.4 + Math.sin(t * 3) * 0.15})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#f1f5f9';
      ctx.textAlign = 'center';
      const label41 = candidateNode.length <= 12 ? `Ψ₄₁ ${candidateNode}` : 'Ψ₄₁';
      ctx.fillText(label41, CX, CY + 3);

      // ═══ BURST PARTICLES ═══
      const bursts = burstRef.current;
      for (let i = bursts.length - 1; i >= 0; i--) {
        const p = bursts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life -= dt / p.maxLife;

        if (p.life <= 0) {
          bursts.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.life * 0.8})`;
        ctx.fill();
      }

      // ═══ AMBIENT DUST (when running) ═══
      if (running && Math.random() < 0.15) {
        const angle = Math.random() * Math.PI * 2;
        const dist = RING_R * (0.5 + Math.random() * 0.6);
        burstRef.current.push({
          x: CX + Math.cos(angle) * dist,
          y: CY + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          life: 1, maxLife: 2 + Math.random(),
          color: [120, 110, 180], size: 0.5 + Math.random() * 0.5,
        });
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [collisionMap, running, currentTarget, candidateNode]);

  return (
    <div className="relative border border-border/20 rounded-2xl bg-gradient-to-b from-[rgba(8,5,20,0.6)] to-card/10 p-3 sm:p-4 overflow-hidden canvas-container-glow">
      {/* Deep space ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/[0.04] blur-3xl" />
        <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-neon-purple/[0.03] blur-2xl" />
      </div>

      <canvas
        ref={canvasRef}
        className="w-full max-w-[480px] mx-auto aspect-square relative z-10"
      />

      {/* Scan status */}
      {running && currentTarget && (
        <div className="flex items-center justify-center gap-2 mt-3 mb-1 relative z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono text-primary/80 tracking-wide">
            Scanning {GREEK_LABELS[currentTarget] || ''} {currentTarget}
          </span>
        </div>
      )}

      {/* Tier legend */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 mb-1 relative z-10">
        {Object.entries(TIER_COLORS).map(([tier, rgb]) => (
          <div key={tier} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
                boxShadow: `0 0 6px rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.4)`,
              }}
            />
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">{tier}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
