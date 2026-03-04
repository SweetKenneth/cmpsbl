/**
 * FoundryTierLegend — Visual breakdown of the 5 public tiers
 */
import { PUBLIC_TIERS, getTierBadgeClass } from '@/lib/foundry/public-tiers';

export function FoundryTierLegend() {
  return (
    <div className="bg-card/20 border border-border/10 rounded-lg p-5">
      <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
        Pipeline Tiers
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {PUBLIC_TIERS.map(tier => (
          <div key={tier.id} className="text-center">
            <span className={`inline-block text-xs font-mono px-3 py-1 rounded border ${getTierBadgeClass(tier.id)} uppercase tracking-wider mb-2`}>
              {tier.id}
            </span>
            <div className="text-[10px] text-muted-foreground/60">
              {tier.min}–{tier.max}
            </div>
            <div className="text-[9px] text-muted-foreground/40 mt-0.5">
              {tier.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
