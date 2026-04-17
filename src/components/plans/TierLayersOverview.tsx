/**
 * TierLayersOverview — surfaces which Ascension layers unlock at each tier.
 * Lives on /plans below the pricing grid. Mirrors the order shown on
 * /ascension-v2 so the two pages tell the same story.
 */

import { Link } from 'react-router-dom';
import { Check, Lock, ArrowRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  TIER_META,
  TIER_ORDER,
  TIER_LAYERS,
  ALWAYS_ON,
  type LayerTier,
} from '@/lib/ascension-v2/tier-layers';

function priceSuffix(tier: LayerTier) {
  if (tier === 'builder') return '';
  if (tier === 'enterprise') return '/mo +';
  return '/mo';
}

export function TierLayersOverview() {
  return (
    <section
      id="ascension-layers"
      className="container mx-auto px-4 mt-16 scroll-mt-24"
    >
      <div className="text-center mb-8">
        <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-primary mb-2">
          The substrate's true Crown Jewels
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          The 20 Ascension Layers
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
          Each plan unlocks a step-change in capability — governance, survival, intelligence,
          then full dominance. Every Layer attaches via Mana with zero source modification.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {TIER_ORDER.map((key) => {
          const tier = TIER_META[key];
          const layers = key === 'enterprise' ? [] : TIER_LAYERS[key];
          const isFull = key === 'architect';
          const isCustom = key === 'enterprise';

          return (
            <div
              key={key}
              className={cn(
                'rounded-2xl border p-5 backdrop-blur-sm flex flex-col',
                tier.accent,
                isFull && 'ring-2 ring-primary/20',
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{tier.glyph}</span>
                    <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                    {isFull && (
                      <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                        ALL 20
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {tier.tagline}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className="text-xl font-black text-foreground tabular-nums">
                    {tier.priceLabel}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {priceSuffix(key)}
                  </div>
                </div>
              </div>

              {/* Always-on (Builder only — communicates the floor) */}
              {key === 'builder' && (
                <div className="rounded-md border border-border/40 bg-background/40 px-2.5 py-1.5 mb-3 flex items-start gap-2">
                  <Crown className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                  <div className="text-[10px] leading-snug">
                    <span className="font-semibold text-foreground">{ALWAYS_ON.name}</span>
                    <span className="text-muted-foreground"> · always on</span>
                  </div>
                </div>
              )}

              {/* Layer list */}
              {!isCustom ? (
                <ul className="space-y-1.5 mb-4 flex-1">
                  {layers.map((l) => (
                    <li key={l.rank} className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-foreground leading-tight">
                          {l.name}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          {l.tag}
                        </div>
                      </div>
                    </li>
                  ))}
                  {key !== 'builder' && (
                    <li className="text-[10px] text-muted-foreground/80 italic pt-1">
                      + everything in lower tiers
                    </li>
                  )}
                </ul>
              ) : (
                <ul className="space-y-1.5 mb-4 flex-1">
                  {[
                    'Custom layer composition',
                    'Dedicated vertical primitives',
                    'Private Memory Stream',
                    'Full infrastructure control',
                  ].map((s) => (
                    <li key={s} className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                      <span className="text-[12px] text-foreground leading-tight">{s}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Outcome */}
              <blockquote className="border-l-2 border-primary/40 pl-2.5 italic text-[11px] text-foreground/80 mb-4">
                "{tier.outcome}"
              </blockquote>

              {/* CTA */}
              <Button
                asChild
                variant={isFull ? 'default' : 'outline'}
                size="sm"
                className="w-full rounded-lg font-semibold text-xs"
              >
                <Link to={key === 'builder' ? '/auth' : '/plans#pricing'}>
                  {key === 'builder' ? 'Start free' : isCustom ? 'Contact sales' : `Upgrade to ${tier.name}`}
                  <ArrowRight className="w-3 h-3 ml-1.5" />
                </Link>
              </Button>
            </div>
          );
        })}

        {/* Governor card — Kenneth's all-access tile */}
        <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5 backdrop-blur-sm flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Governor</h3>
                <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                  ALL ACCESS
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Substrate authority — every layer, every primitive, every vertical.
              </p>
            </div>
            <div className="text-right shrink-0 ml-2">
              <div className="text-xl font-black text-foreground">∞</div>
              <div className="text-[10px] text-muted-foreground">root</div>
            </div>
          </div>

          <ul className="space-y-1.5 mb-4 flex-1">
            <li className="flex items-start gap-2">
              <Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />
              <span className="text-[12px] text-foreground leading-tight">All 20 launch layers unlocked</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />
              <span className="text-[12px] text-foreground leading-tight">Master Power Center · kill switches</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />
              <span className="text-[12px] text-foreground leading-tight">Full vertical Crown Jewel access</span>
            </li>
            <li className="flex items-start gap-2">
              <Lock className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-[10px] text-muted-foreground italic">Restricted to substrate operator</span>
            </li>
          </ul>

          <blockquote className="border-l-2 border-primary/40 pl-2.5 italic text-[11px] text-foreground/80 mb-4">
            "Total authority over the substrate."
          </blockquote>
        </div>
      </div>
    </section>
  );
}
