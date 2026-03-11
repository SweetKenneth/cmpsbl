/**
 * SlotCapacityIndicator — Persistent UI showing memory slot usage
 * Dynamic color shift at 80% capacity. Tooltip explains model.
 */
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PRODUCT_TIER_LABELS } from '@/lib/quarry/types';
import type { SlotState } from '@/hooks/useArtifactSlots';
import { PIPELINE_SLOTS_LABEL, PIPELINE_SLOT_TOOLTIP } from '@/lib/branding/memory-stream';

interface SlotCapacityIndicatorProps {
  slotState: SlotState;
  variant?: 'compact' | 'full';
  className?: string;
}

export function SlotCapacityIndicator({
  slotState,
  variant = 'compact',
  className,
}: SlotCapacityIndicatorProps) {
  const { activeCount, capacity, tier, atCapacity, nearCapacity } = slotState;
  const percentage = capacity > 0 ? (activeCount / capacity) * 100 : 0;
  const remaining = capacity - activeCount;

  const colorClass = atCapacity
    ? 'text-destructive'
    : nearCapacity
    ? 'text-yellow-400'
    : 'text-primary';

  const barColor = atCapacity
    ? 'bg-destructive'
    : nearCapacity
    ? 'bg-yellow-400'
    : 'bg-primary';

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-muted/30 cursor-default transition-colors',
                atCapacity && 'border-destructive/30 bg-destructive/5',
                nearCapacity && !atCapacity && 'border-yellow-500/30 bg-yellow-500/5',
                className,
              )}
            >
              <Package className={cn('w-4 h-4', colorClass)} />
              <span className={cn('text-sm font-mono font-medium', colorClass)}>
                {activeCount}/{capacity}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="font-semibold mb-1">{PIPELINE_SLOTS_LABEL} — {PRODUCT_TIER_LABELS[tier]}</p>
            <p className="text-xs text-muted-foreground">
              {PIPELINE_SLOT_TOOLTIP(activeCount, capacity, remaining, atCapacity)}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full variant — with progress bar
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className={cn('w-4 h-4', colorClass)} />
          <span className="text-sm font-medium">{PIPELINE_SLOTS_LABEL}</span>
        </div>
        <span className={cn('text-sm font-mono font-bold', colorClass)}>
          {activeCount} / {capacity}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {PRODUCT_TIER_LABELS[tier]} plan · {remaining} slot{remaining !== 1 ? 's' : ''} remaining
      </p>
    </div>
  );
}
