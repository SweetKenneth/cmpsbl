/**
 * Upgrade — Artifact Capacity Model
 * Clean posture tiers · artifact slots · no feature-based pricing
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Check, ArrowRight, Brain, Package, Shield, Zap,
  Server, Building2, Lock, Unlock, Layers, Eye,
  MessageSquare, Sparkles
} from 'lucide-react';
import { ARTIFACT_PACKS, PRODUCT_TIERS, type ProductTier, type ArtifactPack } from '@/lib/quarry/types';
import type { EngineSubscriptionTier } from '@/config/engine-stripe-products';
import { motion } from 'framer-motion';

/* ─── Tier definitions (public-facing) ─── */
const TIERS: {
  key: ProductTier;
  name: string;
  price: string;
  annualPrice: string;
  period: string;
  tagline: string;
  description: string;
  accent: string;
  icon: React.ElementType;
  popular?: boolean;
  stripeTier?: EngineSubscriptionTier;
  features: string[];
}[] = [
  {
    key: 'base',
    name: 'Base',
    price: '$0',
    annualPrice: '$0',
    period: '/mo',
    tagline: 'Build real things. Not a trial.',
    description: 'Full runtime access with baseline technology. Activate up to 3 artifact packs.',
    accent: 'from-emerald-500 to-emerald-600',
    icon: Unlock,
    features: [
      '3 Artifact Slots',
      'Full baseline runtime',
      'Standard memory depth',
      'Core templates & engines',
      'Dashboard access',
      'Community support',
    ],
  },
  {
    key: 'professional',
    name: 'Professional',
    price: '$19',
    annualPrice: '$15',
    period: '/mo',
    tagline: 'Deeper capacity for serious builders.',
    description: 'Expanded artifact slots, deeper memory, and advanced governance scope.',
    accent: 'from-violet-500 to-purple-500',
    icon: Sparkles,
    popular: true,
    stripeTier: 'architect' as EngineSubscriptionTier,
    features: [
      '8 Artifact Slots',
      'Expanded memory depth',
      'Priority routing',
      'Workflow automation',
      'Cross-system orchestration',
      'Advanced governance',
      'Priority support',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: '$99',
    annualPrice: '$79',
    period: '/mo',
    tagline: 'Full control. Your infrastructure.',
    description: 'Unlimited artifact capacity, self-hosted deployment, and full governance authority.',
    accent: 'from-amber-500 to-orange-500',
    icon: Building2,
    stripeTier: 'enterprise' as EngineSubscriptionTier,
    features: [
      'Unlimited Artifact Slots',
      'Dedicated memory partitions',
      'Self-hosted deployment (LNCHBL)',
      'Full governance authority',
      'Compliance & audit exports',
      'Organization workspaces',
      'SLA-aware controls',
      'Dedicated support channel',
    ],
  },
];

function getPacksForTier(tier: ProductTier): ArtifactPack[] {
  const tierOrder: Record<ProductTier, number> = { base: 0, professional: 1, enterprise: 2 };
  return ARTIFACT_PACKS.filter(p => tierOrder[p.tier] <= tierOrder[tier]);
}

/* ─── Value Pillars ─── */
const PILLARS = [
  { icon: Brain, title: 'Persistent Memory', description: 'Your agents remember. Every session builds on the last.' },
  { icon: Layers, title: 'Unified Runtime', description: 'Every module runs for every user. No feature gating.' },
  { icon: Package, title: 'Artifact Packs', description: 'Structured bundles that activate new capabilities within your slots.' },
  { icon: Server, title: 'Deployment Flexibility', description: 'Cloud-first or self-hosted. Your infrastructure, your rules.' },
];

export default function Upgrade() {
  const { tier: currentTier, startCheckout } = useEngineSubscription();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');

  // Map current subscription tier to product tier
  const currentProductTier: ProductTier =
    currentTier === 'enterprise' ? 'enterprise' :
    ['architect', 'pro', 'creator', 'builder'].includes(currentTier) ? 'professional' :
    'base';

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing — Clockless"
        description="Unified runtime. Artifact capacity. Choose your depth with structured packs — no feature gating, no inflated counts."
      />
      <PublicNav />

      <main className="pt-28 pb-20">
        {/* ═══ HERO ═══ */}
        <div className="container mx-auto px-4 text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30">
              <Package className="w-3 h-3 mr-1.5 inline" />
              Artifact Capacity Model
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              One Runtime. <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Your Capacity.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Every plan runs the full system. Choose how many artifact packs you activate.
            </p>
          </motion.div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all",
                billingInterval === 'monthly'
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                billingInterval === 'annual'
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Save 20%</Badge>
            </button>
          </div>
        </div>

        {/* ═══ TIER CARDS ═══ */}
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {TIERS.map((t, i) => {
              const isCurrent = currentProductTier === t.key;
              const displayPrice = billingInterval === 'annual' && t.key !== 'base' ? t.annualPrice : t.price;
              const TierIcon = t.icon;
              const tierConfig = PRODUCT_TIERS[t.key];
              const slotLabel = tierConfig.slots === 'unlimited' ? 'Unlimited' : `${tierConfig.slots}`;

              return (
                <motion.div
                  key={t.key}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "relative rounded-2xl border flex flex-col overflow-hidden",
                    isCurrent
                      ? "border-primary ring-2 ring-primary/20"
                      : t.popular
                      ? "border-violet-500/40 ring-1 ring-violet-500/10"
                      : "border-border/50 hover:border-border",
                  )}
                >
                  {/* Gradient accent bar */}
                  <div className={cn("h-1.5 bg-gradient-to-r", t.accent)} />

                  {/* Badges */}
                  {isCurrent && (
                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px]">Current</Badge>
                  )}
                  {t.popular && !isCurrent && (
                    <Badge className="absolute top-4 right-4 bg-violet-500 text-white text-[10px]">Popular</Badge>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center", t.accent)}>
                        <TierIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{t.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">{displayPrice}</span>
                          <span className="text-muted-foreground text-sm">{t.period}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{t.tagline}</p>

                    {/* Artifact Slot Capacity — key differentiator */}
                    <div className="rounded-xl bg-muted/50 border border-border/30 p-4 mb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">Artifact Capacity</span>
                      </div>
                      <div className="text-2xl font-bold text-primary">{slotLabel} Slots</div>
                      <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                    </div>

                    <div className="h-px bg-border/50 mb-5" />

                    {/* Features */}
                    <ul className="space-y-3 flex-1">
                      {t.features.map(f => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="mt-6">
                      {t.key === 'base' ? (
                        <Button variant="outline" className="w-full" asChild>
                          <Link to="/start-here">Get Started Free</Link>
                        </Button>
                      ) : isCurrent ? (
                        <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                      ) : (
                        <Button
                          className={cn("w-full bg-gradient-to-r text-white border-0", t.accent)}
                          onClick={() => t.stripeTier && startCheckout(t.stripeTier, billingInterval)}
                        >
                          Upgrade to {t.name} <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ═══ VALUE PILLARS ═══ */}
        <section className="container mx-auto px-4 mt-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">What Powers Every Plan</h2>
              <p className="text-muted-foreground mt-2">The full runtime runs for every user. Plans differ in capacity, not capability.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PILLARS.map((p, i) => {
                const PIcon = p.icon;
                return (
                  <motion.div
                    key={p.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="h-full border-border/50 hover:border-primary/20 transition-colors">
                      <CardContent className="p-5 space-y-3">
                        <PIcon className="w-8 h-8 text-primary" />
                        <h3 className="font-bold">{p.title}</h3>
                        <p className="text-sm text-muted-foreground">{p.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ ARTIFACT PACKS ═══ */}
        <section className="container mx-auto px-4 mt-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/30">
                <Package className="w-3 h-3 mr-1.5 inline" />
                Structured Packs
              </Badge>
              <h2 className="text-3xl font-bold">Artifact Packs</h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                Each pack is a versioned bundle of composed components. Activate packs within your slot capacity.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ARTIFACT_PACKS.map((pack, i) => {
                const tierLabel = pack.tier === 'base' ? 'Base' : pack.tier === 'professional' ? 'Professional' : 'Enterprise';
                const tierColor = pack.tier === 'base' ? 'bg-emerald-500/10 text-emerald-600' :
                  pack.tier === 'professional' ? 'bg-violet-500/10 text-violet-600' :
                  'bg-amber-500/10 text-amber-600';

                return (
                  <motion.div
                    key={pack.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="h-full border-border/50 hover:border-primary/20 transition-colors">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm">{pack.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] px-1.5">{pack.version}</Badge>
                            <Badge className={cn("text-[10px] px-1.5", tierColor)}>{tierLabel}+</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{pack.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Package className="w-3 h-3" />
                          <span>{pack.slotsRequired} slot{pack.slotsRequired > 1 ? 's' : ''} required</span>
                        </div>
                        <p className="text-xs text-muted-foreground/70 italic">{pack.useCase}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ ENTERPRISE CTA ═══ */}
        <section className="container mx-auto px-4 mt-24">
          <div className="max-w-3xl mx-auto text-center p-10 rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-background">
            <Building2 className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">Enterprise Custom</h3>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Dedicated instances, custom compliance, SOC2 requirements, and white-glove onboarding. Unlimited artifact capacity with custom packs.
            </p>
            <Button variant="outline" className="mt-6" asChild>
              <a href="mailto:Dev@CMPSBL.com">Contact Sales <ArrowRight className="w-4 h-4 ml-1" /></a>
            </Button>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="container mx-auto px-4 mt-24 mb-8">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-center">Common Questions</h2>
            {[
              { q: 'What is the baseline runtime?', a: 'Every plan includes the full system runtime — all engines, pipelines, and core capabilities. There is no module gating. Plans differ in artifact capacity, not in what the system can do.' },
              { q: 'What are artifact slots?', a: 'Artifact slots determine how many structured packs you can activate. Each pack adds composed functionality — like advanced memory, automation, or deployment rights.' },
              { q: 'Can I start free and upgrade later?', a: 'Yes. The Base plan is fully functional. Upgrade when you need more artifact capacity or deeper memory.' },
              { q: 'What happens when my subscription ends?', a: 'Your projects continue working on the baseline runtime. Activated packs beyond your slot capacity are paused until you resubscribe.' },
              { q: 'What is LNCHBL?', a: 'LNCHBL is the self-hosted deployment SDK. Enterprise plans include deployment rights to run the system on your own infrastructure.' },
            ].map(faq => (
              <div key={faq.q} className="space-y-2">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </div>
  );
}
