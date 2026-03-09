/**
 * VaultUsageIndicator — Shows current vault usage vs capacity
 */
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
  const percentage = isUnlimited ? 0 : Math.min((currentCount / limits.vaultCapacity) * 100, 100);

  return (
    <div className={`flex items-center gap-2 text-xs font-mono ${className}`}>
      <Archive className={`w-3.5 h-3.5 ${isFull ? 'text-amber-400' : 'text-muted-foreground'}`} />
      <span className={isFull ? 'text-amber-400' : 'text-muted-foreground'}>
        Vault: {currentCount} / {formatVaultCapacity(subscriptionTier)}
      </span>
      {!isUnlimited && (
        <div className="w-16 h-1.5 rounded-full bg-muted/50 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isFull ? 'bg-amber-400' : percentage > 75 ? 'bg-amber-400/70' : 'bg-primary/60'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
