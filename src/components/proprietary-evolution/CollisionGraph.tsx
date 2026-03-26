/**
 * CollisionGraph — Cinematic real-time node-graph animation for Discovery phase
 * Enhanced with particle effects, ripple waves, glow trails, and dynamic energy arcs
 */

import { useEffect, useRef, useMemo } from 'react';

interface CollisionEvent {
  targetNode: string;
  cjpiScore: number;
  tier: string;
  active: boolean;
}

interface CollisionGraphProps {
  candidateNode: string;
  collisions: CollisionEvent[];
  running: boolean;
  currentTarget: string | null;
}

const TIER_COLORS: Record<string, string> = {
  apex: '#f59e0b',
  mythic: '#a855f7',
  relic: '#3b82f6',
  prime: '#22c55e',
  mint: '#6b7280',
};

const TIER_GLOW: Record<string, string> = {
  apex: 'rgba(245, 158, 11, 0.35)',
  mythic: 'rgba(168, 85, 247, 0.3)',
  relic: 'rgba(59, 130, 246, 0.25)',
  prime: 'rgba(34, 197, 94, 0.2)',
  mint: 'rgba(107, 114, 128, 0.1)',
};

// Must match SUBSTRATE_NODES in DiscoveryPhase exactly
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

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
}

interface Ripple {
  x: number; y: number;
  radius: number; maxRadius: number;
  alpha: number; color: string;
}

// Canvas uses a logical size and scales for DPR — CSS sizes it responsively
const SIZE = 400;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RING_R = SIZE * 0.37;

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

export function CollisionGraph({ candidateNode, collisions, running, currentTarget }: CollisionGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const prevTargetRef = useRef<string | null>(null);
  const orbitAngleRef = useRef(0);

  const collisionMap = useMemo(() => {
    const map: Record<string, CollisionEvent> = {};
    for (const c of collisions) {
      if (!map[c.targetNode] || c.cjpiScore > map[c.targetNode].cjpiScore) {
        map[c.targetNode] = c;
      }
    }
    return map;
  }, [collisions]);

  // Spawn particles on new collision — handle both single targets and batch strings
  useEffect(() => {
    // Resolve to first valid node name from potentially multi-node target string
    const resolvedTarget = currentTarget?.split(' · ').find(n => NODE_POSITIONS[n]) || null;
    if (resolvedTarget && resolvedTarget !== prevTargetRef.current && NODE_POSITIONS[resolvedTarget]) {
      const currentTarget = resolvedTarget; // shadow for block scope
      const pos = NODE_POSITIONS[currentTarget];
      const col = collisionMap[currentTarget];
      const color = col ? (TIER_COLORS[col.tier] || '#6b7280') : '#8b5cf6';
      
      // Burst particles
      for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.3;
        const speed = 1.5 + Math.random() * 3;
        particlesRef.current.push({
          x: pos.x, y: pos.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1, maxLife: 0.6 + Math.random() * 0.8,
          color, size: 1.5 + Math.random() * 2.5,
        });
      }

      // Ripple wave
      ripplesRef.current.push({
        x: pos.x, y: pos.y,
        radius: 4, maxRadius: 50 + Math.random() * 30,
        alpha: 0.6, color,
      });

      // Trail particles along the beam
      const dx = pos.x - CX;
      const dy = pos.y - CY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      for (let j = 0; j < 8; j++) {
        const t = (j + Math.random()) / 8;
        particlesRef.current.push({
          x: CX + dx * t + (Math.random() - 0.5) * 6,
          y: CY + dy * t + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          life: 1, maxLife: 0.4 + Math.random() * 0.4,
          color: '#8b5cf6', size: 1 + Math.random(),
        });
      }
    }
    prevTargetRef.current = resolvedTarget;
  }, [currentTarget, collisionMap]);

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
      if (running) orbitAngleRef.current += dt * 0.15;
      
      ctx.clearRect(0, 0, SIZE, SIZE);

      // ═══ BACKGROUND ENERGY RING ═══
      const ringGrad = ctx.createRadialGradient(CX, CY, RING_R - 15, CX, CY, RING_R + 15);
      ringGrad.addColorStop(0, 'rgba(139, 92, 246, 0)');
      ringGrad.addColorStop(0.5, `rgba(139, 92, 246, ${running ? 0.04 + Math.sin(t * 2) * 0.02 : 0.02})`);
      ringGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.beginPath();
      ctx.arc(CX, CY, RING_R, 0, Math.PI * 2);
      ctx.lineWidth = 30;
      ctx.strokeStyle = ringGrad;
      ctx.stroke();

      // Subtle orbit ring line
      ctx.beginPath();
      ctx.arc(CX, CY, RING_R, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(148, 163, 184, ${running ? 0.12 : 0.06})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // ═══ ROTATING ENERGY ARC (when running) ═══
      if (running) {
        const arcLen = Math.PI * 0.4;
        const arcAngle = t * 1.2;
        ctx.beginPath();
        ctx.arc(CX, CY, RING_R, arcAngle, arcAngle + arcLen);
        const arcGrad = ctx.createConicGradient(arcAngle, CX, CY);
        arcGrad.addColorStop(0, 'rgba(139, 92, 246, 0)');
        arcGrad.addColorStop(0.15, 'rgba(139, 92, 246, 0.4)');
        arcGrad.addColorStop(0.3, 'rgba(6, 182, 212, 0.3)');
        arcGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0)');
        ctx.strokeStyle = arcGrad;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Secondary counter-rotating arc
        const arc2 = -t * 0.8 + Math.PI;
        ctx.beginPath();
        ctx.arc(CX, CY, RING_R, arc2, arc2 + arcLen * 0.6);
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 + Math.sin(t * 3) * 0.1})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // ═══ COLLISION CONNECTIONS (completed) ═══
      for (const [nodeName, collision] of Object.entries(collisionMap)) {
        const pos = NODE_POSITIONS[nodeName];
        if (!pos) continue;

        const color = TIER_COLORS[collision.tier] || TIER_COLORS.mint;
        const alpha = Math.min(0.5, collision.cjpiScore / 180);
        const isHighValue = collision.cjpiScore >= 85;

        // Glow underline for high-value
        if (isHighValue) {
          ctx.beginPath();
          ctx.moveTo(CX, CY);
          ctx.lineTo(pos.x, pos.y);
          ctx.strokeStyle = TIER_GLOW[collision.tier] || 'rgba(107,114,128,0.1)';
          ctx.lineWidth = 6;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = isHighValue ? 2 : 1;
        ctx.stroke();
      }

      // ═══ ACTIVE COLLISION BEAM ═══
      // Resolve batch target strings to first valid node
      const resolvedBeamTarget = currentTarget?.split(' · ').find(n => NODE_POSITIONS[n]) || null;
      if (resolvedBeamTarget && NODE_POSITIONS[resolvedBeamTarget]) {
        const pos = NODE_POSITIONS[resolvedBeamTarget];
        const pulse = Math.sin(t * 10) * 0.3 + 0.7;

        // Glow beam
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = `rgba(139, 92, 246, ${pulse * 0.15})`;
        ctx.lineWidth = 10;
        ctx.stroke();

        // Main beam
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = `rgba(139, 92, 246, ${pulse})`;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = -t * 60;
        ctx.stroke();
        ctx.setLineDash([]);

        // Target node scanning ring
        const scanR = 12 + Math.sin(t * 8) * 4;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, scanR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139, 92, 246, ${pulse * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Crosshair lines
        const ch = 6;
        ctx.beginPath();
        ctx.moveTo(pos.x - ch, pos.y); ctx.lineTo(pos.x + ch, pos.y);
        ctx.moveTo(pos.x, pos.y - ch); ctx.lineTo(pos.x, pos.y + ch);
        ctx.strokeStyle = `rgba(139, 92, 246, ${pulse * 0.4})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // ═══ SUBSTRATE NODES ═══
      for (const [nodeName, pos] of Object.entries(NODE_POSITIONS)) {
        const collision = collisionMap[nodeName];
        const isActive = nodeName === currentTarget;
        const baseR = isActive ? 6 : collision ? 4.5 : 3;
        const wobble = running ? Math.sin(t * 3 + pos.angle * 5) * 0.5 : 0;
        const r = baseR + wobble;

        // Outer glow for collided nodes
        if (collision && collision.cjpiScore >= 70) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, r + 6, 0, Math.PI * 2);
          ctx.fillStyle = TIER_GLOW[collision.tier] || 'rgba(107,114,128,0.05)';
          ctx.fill();
        }

        // Node dot
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        if (collision) {
          ctx.fillStyle = TIER_COLORS[collision.tier] || TIER_COLORS.mint;
        } else if (isActive) {
          ctx.fillStyle = '#8b5cf6';
        } else {
          ctx.fillStyle = `rgba(148, 163, 184, ${0.2 + Math.sin(t + pos.angle * 3) * 0.08})`;
        }
        ctx.fill();

        // Inner bright dot
        if (collision || isActive) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, r * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fill();
        }

        // Greek subscript label
        const showLabel = isActive || (collision && collision.cjpiScore >= 60);
        if (showLabel) {
          const greek = GREEK_LABELS[nodeName] || nodeName.slice(0, 3);
          ctx.font = '8px monospace';
          ctx.fillStyle = collision
            ? (TIER_COLORS[collision.tier] || '#94a3b8')
            : (isActive ? '#c4b5fd' : '#94a3b8');
          ctx.textAlign = 'center';
          ctx.globalAlpha = 0.9;
          ctx.fillText(`${greek} ${nodeName.slice(0, 3)}`, pos.x, pos.y - 10);
          ctx.globalAlpha = 1;

          if (collision) {
            ctx.font = 'bold 8px monospace';
            ctx.fillStyle = TIER_COLORS[collision.tier] || '#94a3b8';
            ctx.fillText(String(collision.cjpiScore), pos.x, pos.y + 16);
          }
        }
      }

      // ═══ CENTER NODE (Candidate #41) ═══
      const centerPulse = running ? 12 + Math.sin(t * 3) * 3 : 11;
      
      // Outer glow
      const centerGlow = ctx.createRadialGradient(CX, CY, 0, CX, CY, centerPulse + 15);
      centerGlow.addColorStop(0, `rgba(139, 92, 246, ${running ? 0.25 : 0.15})`);
      centerGlow.addColorStop(0.5, `rgba(6, 182, 212, ${running ? 0.1 : 0.05})`);
      centerGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.beginPath();
      ctx.arc(CX, CY, centerPulse + 15, 0, Math.PI * 2);
      ctx.fillStyle = centerGlow;
      ctx.fill();

      // Main center circle
      ctx.beginPath();
      ctx.arc(CX, CY, centerPulse, 0, Math.PI * 2);
      const cGrad = ctx.createRadialGradient(CX - 3, CY - 3, 0, CX, CY, centerPulse);
      cGrad.addColorStop(0, 'rgba(167, 139, 250, 0.9)');
      cGrad.addColorStop(1, 'rgba(139, 92, 246, 0.6)');
      ctx.fillStyle = cGrad;
      ctx.fill();

      // Center ring
      ctx.beginPath();
      ctx.arc(CX, CY, centerPulse + 1, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(196, 181, 253, ${0.4 + Math.sin(t * 4) * 0.2})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label — show derived node name if short enough, else Ψ₄₁
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#f1f5f9';
      ctx.textAlign = 'center';
      const label41 = candidateNode.length <= 12 ? `Ψ₄₁ ${candidateNode}` : 'Ψ₄₁';
      ctx.fillText(label41, CX, CY + 3);

      // ═══ PARTICLES ═══
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= dt / p.maxLife;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.life * 200).toString(16).padStart(2, '0');
        ctx.fill();
      }

      // ═══ RIPPLES ═══
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.5;
        r.alpha -= 0.012;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color + Math.round(r.alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ═══ AMBIENT FLOATING PARTICLES (when running) ═══
      if (running && Math.random() < 0.3) {
        const angle = Math.random() * Math.PI * 2;
        const dist = RING_R + (Math.random() - 0.5) * 20;
        particlesRef.current.push({
          x: CX + Math.cos(angle) * dist,
          y: CY + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          life: 1, maxLife: 1.5 + Math.random(),
          color: '#6366f1', size: 0.8 + Math.random() * 0.6,
        });
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [collisionMap, running, currentTarget]);

  return (
    <div className="relative border border-border/20 rounded-2xl bg-gradient-to-b from-card/40 to-card/10 p-3 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <canvas
        ref={canvasRef}
        className="w-full max-w-[440px] mx-auto aspect-square relative z-10"
      />

      {/* Status bar */}
      {running && currentTarget && (
        <div className="flex items-center justify-center gap-2 mt-2 mb-1 relative z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono text-primary/80">
            Scanning {GREEK_LABELS[currentTarget] || ''} {currentTarget}
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-2 mb-1 relative z-10">
        {Object.entries(TIER_COLORS).map(([tier, color]) => (
          <div key={tier} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[9px] font-mono text-muted-foreground uppercase">{tier}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
