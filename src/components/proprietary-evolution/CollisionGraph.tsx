/**
 * CollisionGraph — Real-time node-graph animation for Discovery phase
 * Shows collisions between Candidate Node #41 and substrate nodes as they happen
 */

import { useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

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

const NODE_POSITIONS = (() => {
  // Arrange 40 substrate nodes in a circle
  const positions: Record<string, { x: number; y: number }> = {};
  const nodes = [
    'CORE','BRAIN','MEMORY','NERVE','DECODE','ENCODE','CORTEX','DEFENSE','ORACLE',
    'CONSCIENCE','PHANTOM','HARVEST','EVOLUTION','SHADOW','IMMUNITY','INTENT',
    'GOVERNANCE','ATLAS','FORGE','LINGUA','ECHO','SOVEREIGN','REFLEX','TREATY',
    'ENGINEER','COMPASS','OBSERVER','GENESIS','ANCHOR','PRISM','SENTRY','MEDIC',
    'SIGNAL','TENSOR','ARBITER','FLUX','VECTOR','SYNTH','RELAY','NEXUS',
  ];
  const cx = 200, cy = 200, r = 160;
  nodes.forEach((name, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    positions[name] = {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });
  return positions;
})();

export function CollisionGraph({ candidateNode, collisions, running, currentTarget }: CollisionGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);

  const collisionMap = useMemo(() => {
    const map: Record<string, CollisionEvent> = {};
    for (const c of collisions) {
      if (!map[c.targetNode] || c.cjpiScore > map[c.targetNode].cjpiScore) {
        map[c.targetNode] = c;
      }
    }
    return map;
  }, [collisions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 400 * dpr;
    canvas.height = 400 * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      ctx.clearRect(0, 0, 400, 400);

      const cx = 200, cy = 200;

      // Draw connections for completed collisions
      for (const [nodeName, collision] of Object.entries(collisionMap)) {
        const pos = NODE_POSITIONS[nodeName];
        if (!pos) continue;

        const color = TIER_COLORS[collision.tier] || TIER_COLORS.mint;
        const alpha = Math.min(0.6, collision.cjpiScore / 150);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = collision.cjpiScore >= 85 ? 2 : 1;
        ctx.stroke();
      }

      // Draw active collision beam
      if (currentTarget && NODE_POSITIONS[currentTarget]) {
        const pos = NODE_POSITIONS[currentTarget];
        const pulse = Math.sin(t * 8) * 0.3 + 0.7;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = `rgba(var(--primary-rgb, 139, 92, 246), ${pulse})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = -t * 30;
        ctx.stroke();
        ctx.setLineDash([]);

        // Active target glow
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8 + Math.sin(t * 6) * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${pulse * 0.4})`;
        ctx.fill();
      }

      // Draw substrate nodes
      for (const [nodeName, pos] of Object.entries(NODE_POSITIONS)) {
        const collision = collisionMap[nodeName];
        const isActive = nodeName === currentTarget;

        // Node circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isActive ? 5 : 3.5, 0, Math.PI * 2);

        if (collision) {
          ctx.fillStyle = TIER_COLORS[collision.tier] || TIER_COLORS.mint;
        } else if (isActive) {
          ctx.fillStyle = '#8b5cf6';
        } else {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
        }
        ctx.fill();

        // Label for active or high-scoring nodes
        if (isActive || (collision && collision.cjpiScore >= 75)) {
          ctx.font = '7px monospace';
          ctx.fillStyle = collision
            ? (TIER_COLORS[collision.tier] || '#94a3b8')
            : (isActive ? '#8b5cf6' : '#94a3b8');
          ctx.textAlign = 'center';
          ctx.fillText(nodeName, pos.x, pos.y - 8);

          if (collision) {
            ctx.font = 'bold 7px monospace';
            ctx.fillText(String(collision.cjpiScore), pos.x, pos.y + 14);
          }
        }
      }

      // Draw center node (Candidate)
      const centerPulse = running ? Math.sin(t * 3) * 3 + 10 : 10;
      ctx.beginPath();
      ctx.arc(cx, cy, centerPulse, 0, Math.PI * 2);
      ctx.fillStyle = running
        ? `rgba(139, 92, 246, ${0.6 + Math.sin(t * 4) * 0.2})`
        : 'rgba(139, 92, 246, 0.5)';
      ctx.fill();

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.fillText('#41', cx, cy + 3);

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [collisionMap, running, currentTarget]);

  return (
    <div className="border border-border/20 rounded-xl bg-card/20 p-2 overflow-hidden">
      <canvas
        ref={canvasRef}
        style={{ width: 400, height: 400 }}
        className="w-full max-w-[400px] mx-auto aspect-square"
      />
      <div className="flex items-center justify-center gap-3 mt-2 mb-1">
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
