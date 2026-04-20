/**
 * V2GovernanceModePicker — three-card selector for OBSERVE / SOFT / ENFORCE.
 *
 * Tier-aware: Free/Builder is locked to OBSERVE. Studio unlocks SOFT.
 * Creator+ unlocks ENFORCE. Governor sees everything.
 *
 * Marketing-warm copy. Never describes Ascension as "changing" code —
 * always governs / influences / wraps / oversees / protects.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useMemo } from 'react';
import { Lock, Eye, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  GOVERNANCE_MODES,
  isModeAllowed,
  type GovernanceMode,
  type GovernanceModeMeta,
} from '@/lib/ascension-v2/governance-mode';
import { useEngineSubscription, type SubscriptionTier } from '@/hooks/useEngineSubscription';
import { useUserRole } from '@/hooks/useUserRole';

type EffectiveTier = 'builder' | 'pro' | 'enterprise';

function subscriptionToEffectiveTier(sub: SubscriptionTier): EffectiveTier {
  switch (sub) {
    case 'studio':
    case 'creator':
    case 'pro':
    case 'architect':
      return 'pro';
    case 'enterprise':
      return 'enterprise';
    default:
      return 'builder';
  }
}

const MODE_ICONS: Record<GovernanceMode, typeof Eye> = {
  observe: Eye,
  soft: AlertTriangle,
  enforce: ShieldCheck,
};

const ACCENT_CLASSES: Record<GovernanceModeMeta['accent'], { ring: string; icon: string; chip: string }> = {
  emerald: {
    ring: 'ring-emerald-500/60 border-emerald-500/40',
    icon: 'text-emerald-500',
    chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    ring: 'ring-amber-500/60 border-amber-500/40',
    icon: 'text-amber-500',
    chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  rose: {
    ring: 'ring-rose-500/60 border-rose-500/40',
    icon: 'text-rose-500',
    chip: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
};

interface Props {
  selected: GovernanceMode;
  onSelect: (mode: GovernanceMode) => void;
}

export function V2GovernanceModePicker({ selected, onSelect }: Props) {
  const { tier: subscriptionTier } = useEngineSubscription();
  const { isGovernor } = useUserRole();

  const effectiveTier = useMemo<EffectiveTier>(
    () => (isGovernor ? 'enterprise' : subscriptionToEffectiveTier(subscriptionTier)),
    [isGovernor, subscriptionTier],
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-center">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">
          How should Ascension govern your code?
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Pick a default — you can change it anytime via your environment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {GOVERNANCE_MODES.map((mode) => {
          const Icon = MODE_ICONS[mode.id];
          const isSelected = selected === mode.id;
          const allowed = isModeAllowed(mode.id, effectiveTier, isGovernor);
          const accent = ACCENT_CLASSES[mode.accent];

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => allowed && onSelect(mode.id)}
              disabled={!allowed}
              aria-pressed={isSelected}
              className={cn(
                'relative text-left rounded-lg border p-4 transition-all',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                allowed
                  ? 'bg-card hover:bg-accent/40 cursor-pointer'
                  : 'bg-muted/40 cursor-not-allowed opacity-60',
                isSelected && allowed && cn('ring-2 shadow-sm', accent.ring),
                !isSelected && 'border-border',
              )}
            >
              {!allowed && (
                <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  <span>Pro</span>
                </div>
              )}
              {isSelected && allowed && (
                <div className={cn('absolute top-2 right-2 rounded-full p-1', accent.chip)}>
                  <Check className="w-3 h-3" />
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn('w-4 h-4', accent.icon)} />
                <span className="text-sm font-semibold text-foreground">{mode.label}</span>
              </div>

              <p className="text-xs font-medium text-foreground mb-2">{mode.tagline}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{mode.summary}</p>

              <ul className="space-y-1 mb-2">
                {mode.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                    <span className={cn('mt-1 w-1 h-1 rounded-full flex-shrink-0', accent.icon.replace('text-', 'bg-'))} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <p className="text-[10px] italic text-muted-foreground/80 pt-2 border-t border-border/50">
                {mode.footnote}
              </p>
            </button>
          );
        })}
      </div>

      {!isGovernor && effectiveTier === 'builder' && (
        <p className="text-[11px] text-center text-muted-foreground">
          Soft and Enforce modes unlock with a paid plan — Observe protects your code today at no cost.
        </p>
      )}
    </div>
  );
}
