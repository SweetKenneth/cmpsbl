/**
 * VaultUsageIndicator — Shows current vault usage vs capacity
 * Mobile-first: compact layout, touch-friendly, responsive bar width
 * Uses semantic design tokens (neon-amber) from design system
 */
import { motion } from 'framer-motion';
import { Archive } from 'lucide-react';
import { formatVaultCapacity, getVaultLimits } from '@/lib/substrate/vault-limits';

interface Props {
  currentCount: number;
  subscriptionTier?: string;
  className?: string;
}

export function VaultUsageIndicator({ currentCount, subscriptionTier, className = '' }: Props) {
  const limits = getVaultLimits(subscriptionTier);
  const isUnlimited = limits.vaultCapacity === -1;
  const isFull = !isUnlimited && currentCount >= limits.vaultCapacity;
  const isNearFull = !isUnlimited && !isFull && currentCount >= limits.vaultCapacity * 0.8;
  const percentage = isUnlimited ? 0 : Math.min((currentCount / limits.vaultCapacity) * 100, 100);

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`flex items-center gap-1.5 text-xs font-mono tabular-nums ${
        isFull ? 'text-neon-amber' : isNearFull ? 'text-neon-amber/70' : 'text-muted-foreground'
      }`}>
        <Archive className="w-3.5 h-3.5 shrink-0" />
        <span className="whitespace-nowrap">
          {currentCount} / {formatVaultCapacity(subscriptionTier)}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-14 sm:w-20 h-1.5 rounded-full bg-muted/40 overflow-hidden shrink-0">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isFull ? 'bg-neon-amber' : isNearFull ? 'bg-neon-amber/70' : 'bg-primary/60'
            }`}
          />
        </div>
      )}
      {isUnlimited && (
        <span className="text-[10px] font-mono text-muted-foreground/50">∞</span>
      )}
    </div>
  );
}
