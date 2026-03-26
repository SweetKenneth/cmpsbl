/**
 * Orbital Lock Ring — Ascension Visual Engine
 * 
 * Discoveries orbit a central nucleus. Ascending a discovery triggers
 * a spiral-inward animation, growing the core's brightness.
 * 
 * Uses framer-motion for orbital rotation, lock spirals, and pulse effects.
 * 
 * PERF: Rotation driven by useRef + rAF to avoid 60fps React re-renders.
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getImpactTier, getImpactTierStyle, type ImpactTier } from '@/lib/discovery/chain-archetypes';

export interface OrbitalDiscovery {
  id: string;
  name: string;
  cjpiScore: number;
  tier: string;
  ascended: boolean;
  chainDepth: number;
  impactTier: ImpactTier | null;
}

interface OrbitalLockRingProps {
  discoveries: OrbitalDiscovery[];
  onAscend: (id: string) => void;
  ascending: string | null;
  totalCount: number;
  ascendedCount: number;
}

/** Map CJPI score to orbit radius (higher = closer to core) */
function scoreToRadius(score: number, ringSize: number): number {
  const minR = ringSize * 0.28;
  const maxR = ringSize * 0.44;
  const t = Math.min(1, Math.max(0, (score - 20) / 80));
  return maxR - t * (maxR - minR);
}

/** Distribute items evenly around a circle */
function getOrbitalPosition(index: number, total: number, radius: number, offset: number) {
  const angle = (index / total) * Math.PI * 2 + offset;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    angle,
  };
}

const TIER_GLOW: Record<string, string> = {
  apex: 'shadow-[0_0_12px_rgba(251,191,36,0.4)]',
  mythic: 'shadow-[0_0_10px_rgba(168,85,247,0.35)]',
  relic: 'shadow-[0_0_8px_rgba(59,130,246,0.3)]',
  prime: 'shadow-[0_0_6px_rgba(34,197,94,0.25)]',
  mint: '',
};

export function OrbitalLockRing({
  discoveries,
  onAscend,
  ascending,
  totalCount,
  ascendedCount,
}: OrbitalLockRingProps) {
  // PERF: Rotation stored in ref, only trigger re-render at ~20fps via forceUpdate counter
  const rotationRef = useRef(0);
  const [renderTick, setRenderTick] = useState(0);
  const [lockFlash, setLockFlash] = useState(false);
  const [recentlyLocked, setRecentlyLocked] = useState<string | null>(null);
  const animFrameRef = useRef<number>();

  const unascended = useMemo(
    () => discoveries.filter(d => !d.ascended),
    [discoveries]
  );

  const progress = totalCount > 0 ? ascendedCount / totalCount : 0;
  const ringSize = 280;
  const center = ringSize / 2;

  // Slow continuous rotation — update ref at 60fps but only re-render at ~20fps
  useEffect(() => {
    if (unascended.length === 0) return; // Don't animate when nothing orbits
    let last = performance.now();
    let frameCount = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      rotationRef.current += dt * 0.15;
      frameCount++;
      // Re-render every 3 frames (~20fps) instead of every frame (~60fps)
      if (frameCount % 3 === 0) {
        setRenderTick(prev => prev + 1);
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [unascended.length]);

  const handleAscend = useCallback((id: string) => {
    setRecentlyLocked(id);
    setLockFlash(true);
    onAscend(id);
    setTimeout(() => setLockFlash(false), 600);
    setTimeout(() => setRecentlyLocked(null), 1400);
  }, [onAscend]);

  // Core intensity grows with progress
  const coreScale = 0.6 + progress * 0.5;
  const coreOpacity = 0.3 + progress * 0.6;

  // SVG progress ring
  const ringRadius = ringSize / 2 - 6;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circumference * (1 - progress);

  // Read rotation from ref (triggered by renderTick)
  const rotationOffset = rotationRef.current;
  // Suppress unused var lint
  void renderTick;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* ═══ ORBITAL FIELD ═══ */}
      <div
        className="relative mx-auto"
        style={{ width: ringSize, height: ringSize }}
      >
        {/* Progress ring */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
        >
          <circle
            cx={center}
            cy={center}
            r={ringRadius}
            fill="none"
            stroke="hsl(var(--border) / 0.15)"
            strokeWidth={2}
          />
          <circle
            cx={center}
            cy={center}
            r={ringRadius}
            fill="none"
            stroke="hsl(var(--primary) / 0.5)"
            strokeWidth={2.5}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* ═══ CORE NUCLEUS ═══ */}
        <motion.div
          className="absolute rounded-full"
          style={{
            left: center - 28,
            top: center - 28,
            width: 56,
            height: 56,
          }}
          animate={{
            scale: [coreScale, coreScale * 1.06, coreScale],
            opacity: [coreOpacity, coreOpacity * 1.1, coreOpacity],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div
            className="absolute inset-0 rounded-full bg-primary/20 blur-xl transition-all duration-700"
            style={{ transform: `scale(${1.2 + progress * 0.8})` }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/60 to-primary/30 border border-primary/40" />
          <div className="absolute inset-2 rounded-full bg-primary/80 blur-sm" />
        </motion.div>

        {/* Lock flash burst */}
        <AnimatePresence>
          {lockFlash && (
            <motion.div
              className="absolute rounded-full bg-primary/30"
              style={{
                left: center - 40,
                top: center - 40,
                width: 80,
                height: 80,
              }}
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* ═══ ORBITING CARDS ═══ */}
        <AnimatePresence>
          {unascended.map((d, i) => {
            const radius = scoreToRadius(d.cjpiScore, ringSize);
            const pos = getOrbitalPosition(i, unascended.length, radius, rotationOffset);
            const isLocking = ascending === d.id || recentlyLocked === d.id;

            return (
              <motion.button
                key={d.id}
                className={cn(
                  "absolute flex items-center gap-1 px-2 py-1 rounded-lg",
                  "border bg-card/80 backdrop-blur-sm cursor-pointer",
                  "hover:bg-card hover:border-primary/40 transition-colors",
                  TIER_GLOW[d.tier] || '',
                  d.tier === 'apex' ? 'border-neon-amber/30' :
                  d.tier === 'mythic' ? 'border-neon-purple/20' :
                  'border-border/30'
                )}
                style={{
                  left: center + pos.x - 44,
                  top: center + pos.y - 14,
                  width: 88,
                  zIndex: isLocking ? 20 : 5,
                }}
                onClick={() => !ascending && handleAscend(d.id)}
                disabled={!!ascending}
                animate={isLocking ? {
                  x: -pos.x,
                  y: -pos.y,
                  scale: 0.3,
                  opacity: 0,
                } : {
                  x: 0,
                  y: 0,
                  scale: 1,
                  opacity: 1,
                }}
                exit={{
                  x: -pos.x,
                  y: -pos.y,
                  scale: 0,
                  opacity: 0,
                }}
                transition={isLocking ? {
                  duration: 1.2,
                  ease: [0.4, 0, 0.2, 1],
                } : {
                  duration: 0.3,
                }}
                whileHover={!ascending ? { scale: 1.1 } : undefined}
              >
                <span className={cn(
                  "text-[8px] font-mono font-bold uppercase shrink-0",
                  d.cjpiScore >= 85 ? 'text-neon-amber' :
                  d.cjpiScore >= 60 ? 'text-primary' :
                  'text-muted-foreground'
                )}>
                  {d.cjpiScore}
                </span>
                <span className="text-[8px] text-foreground/80 truncate leading-tight">
                  {d.name.replace(/_/g, ' ').slice(0, 14)}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Core counter */}
        <div
          className="absolute flex flex-col items-center justify-center pointer-events-none"
          style={{
            left: center - 22,
            top: center - 16,
            width: 44,
            height: 32,
          }}
        >
          <span className="text-lg font-bold text-primary font-mono leading-none">
            {ascendedCount}
          </span>
          <span className="text-[7px] font-mono text-muted-foreground uppercase tracking-wider">
            locked
          </span>
        </div>
      </div>

      {/* ═══ RING LEGEND ═══ */}
      <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-muted-foreground">
        <span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1" />
          {ascendedCount}/{totalCount} ascended
        </span>
        <span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mr-1" />
          {unascended.length} orbiting
        </span>
      </div>
    </div>
  );
}
