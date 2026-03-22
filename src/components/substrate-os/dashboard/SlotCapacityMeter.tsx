/**
 * SlotCapacityMeter — Visual capacity meter for capability slots
 * Shows activeCount / maxSlots with color-coded progress
 */

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

interface SlotCapacityMeterProps {
  activeCount: number;
  capacity: number;
  className?: string;
}

export function SlotCapacityMeter({ activeCount, capacity, className }: SlotCapacityMeterProps) {
  const ratio = capacity > 0 ? activeCount / capacity : 0;
  const percentage = Math.min(100, ratio * 100);
  
  const colorClass = ratio >= 1 ? 'text-destructive' : ratio >= 0.8 ? 'text-neon-amber' : 'text-neon-green';
  const barColor = ratio >= 1 ? 'bg-destructive' : ratio >= 0.8 ? 'bg-neon-amber' : 'bg-neon-green';
  const glowColor = ratio >= 1 ? 'shadow-destructive/20' : ratio >= 0.8 ? 'shadow-neon-amber/20' : 'shadow-neon-green/20';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className={cn('w-4 h-4', colorClass)} />
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Memory Slots</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={cn('text-lg font-bold font-mono', colorClass)}>{activeCount}</span>
          <span className="text-xs text-muted-foreground/50 font-mono">/ {capacity}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 rounded-full bg-muted/30 overflow-hidden">
        <motion.div
          className={cn('absolute inset-y-0 left-0 rounded-full', barColor, 'shadow-lg', glowColor)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Slot indicators */}
      <div className="flex gap-1">
        {Array.from({ length: capacity }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              'flex-1 h-1 rounded-full transition-colors',
              i < activeCount ? barColor : 'bg-muted/20'
            )}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          />
        ))}
      </div>

      {ratio >= 1 && (
        <p className="text-[10px] text-destructive/80 font-mono text-center">
          ALL SLOTS CRYSTALLIZED — Upgrade for more capacity
        </p>
      )}
    </div>
  );
}
