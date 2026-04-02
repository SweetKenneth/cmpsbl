/**
 * MembershipTiers — Pricing cards for the Restoration Shop membership
 * Builder (free) · Studio $29 · Creator $49 · Architect $79
 */

import { cn } from "@/lib/utils";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MEMBERSHIP_TIERS, formatPrice, type MembershipTier } from "@/lib/factory/restoration-queue";

const TIER_ORDER: MembershipTier[] = ['builder', 'studio', 'creator', 'architect'];

const TIER_FEATURES: Record<MembershipTier, string[]> = {
  builder: [
    'Browse the Showroom',
    'Access the Junkyard (unlimited)',
    'View diagnostics',
    'Limited Ascension cycles',
  ],
  studio: [
    'Full Restoration Shop access',
    'Rate-limited queue (2 concurrent)',
    'Restoration documentation package',
    'DECODE debrief for every restoration',
  ],
  creator: [
    'Everything in Studio',
    'Priority queue (4 concurrent)',
    'More concurrent restorations',
    'Early access to new primitives',
  ],
  architect: [
    'Everything in Creator',
    'Maximum throughput (8 concurrent)',
    'Full primitive catalog access',
    'Collision Engine access',
  ],
};

const TIER_ACCENTS: Record<MembershipTier, { border: string; badge: string }> = {
  builder: { border: 'border-border/40', badge: 'bg-muted text-muted-foreground' },
  studio: { border: 'border-[hsl(var(--neon-cyan)/0.3)]', badge: 'bg-[hsl(var(--neon-cyan)/0.1)] text-[hsl(var(--neon-cyan))]' },
  creator: { border: 'border-primary/30', badge: 'bg-primary/10 text-primary' },
  architect: { border: 'border-[hsl(var(--neon-magenta)/0.3)]', badge: 'bg-[hsl(var(--neon-magenta)/0.1)] text-[hsl(var(--neon-magenta))]' },
};

interface MembershipTiersProps {
  className?: string;
  highlightTier?: MembershipTier;
}

export function MembershipTiers({ className, highlightTier = 'creator' }: MembershipTiersProps) {
  return (
    <div className={cn("grid sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {TIER_ORDER.map((tierKey) => {
        const tier = MEMBERSHIP_TIERS[tierKey];
        const features = TIER_FEATURES[tierKey];
        const accent = TIER_ACCENTS[tierKey];
        const isHighlighted = tierKey === highlightTier;

        return (
          <div
            key={tierKey}
            className={cn(
              "relative rounded-xl border p-5 transition-all duration-300 hover:scale-[1.01]",
              accent.border,
              isHighlighted ? "bg-card/40 ring-2 ring-primary/20" : "bg-card/10",
            )}
          >
            {isHighlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                Most Popular
              </div>
            )}

            <div className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3", accent.badge)}>
              {tier.label}
            </div>

            <div className="mb-4">
              <span className="text-2xl font-black text-foreground">
                {tier.price === 0 ? 'Free' : `$${tier.price / 100}`}
              </span>
              {tier.price > 0 && (
                <span className="text-xs text-muted-foreground">/mo</span>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
              {tier.description}
            </p>

            <ul className="space-y-2 mb-5">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                  <span className="text-[11px] text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              variant={isHighlighted ? "default" : "outline"}
              size="sm"
              className="w-full rounded-lg font-semibold text-xs"
            >
              <Link to={tierKey === 'builder' ? '/auth' : '/auth'}>
                {tierKey === 'builder' ? 'Get Started' : 'Subscribe'}
                <ArrowRight className="w-3 h-3 ml-1.5" />
              </Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
