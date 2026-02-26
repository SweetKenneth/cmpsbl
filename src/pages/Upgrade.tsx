/**
 * Upgrade — Equal-Slot Artifact Capacity Model
 * Builder (3) · Operator (6) · Architect (12)
 * All 24 packs visible. Capacity controls activation only.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { useArtifactSlots } from '@/hooks/useArtifactSlots';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SlotCapacityIndicator } from '@/components/slots/SlotCapacityIndicator';
import { SlotPressureModal } from '@/components/slots/SlotPressureModal';
import { PackActivationCard } from '@/components/slots/PackActivationCard';
import { cn } from '@/lib/utils';
import {
  Check, ArrowRight, Brain, Package, Shield, Zap,
  Server, Building2, Lock, Unlock, Layers, Eye,
  Sparkles, Compass
} from 'lucide-react';
import { ARTIFACT_PACKS, PRODUCT_TIERS, STRATEGIC_DOMAINS, type ProductTier } from '@/lib/quarry/types';
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
    key: 'builder',
    name: 'Builder',
    price: '$0',
    annualPrice: '$0',
    period: '/mo',
    tagline: 'Build real things. Not a trial.',
    description: 'Full runtime access with baseline technology. Activate any 3 artifact packs.',
    accent: 'from-emerald-500 to-emerald-600',
    icon: Unlock,
    features: [
      '3 Artifact Slots',
      'Full baseline runtime',
      'All 24 packs visible',
      'Standard memory depth',
      'Core templates & engines',
      'Community support',
    ],
  },
  {
    key: 'operator',
    name: 'Operator',
    price: '$19',
    annualPrice: '$15',
    period: '/mo',
    tagline: 'Deeper capacity for serious operators.',
    description: 'Expanded slot capacity, deeper memory, and advanced governance scope.',
    accent: 'from-violet-500 to-purple-500',
    icon: Sparkles,
    popular: true,
    stripeTier: 'architect' as EngineSubscriptionTier,
    features: [
      '6 Artifact Slots',
      'Expanded memory depth',
      'All 24 packs visible',
      'Advanced governance',
      'Priority routing',
      'Priority support',
    ],
  },
  {
    key: 'architect',
    name: 'Architect',
    price: '$99',
    annualPrice: '$79',
    period: '/mo',
    tagline: 'Full control. Your infrastructure.',
    description: '12 artifact slots, self-hosted deployment, and full governance authority.',
    accent: 'from-amber-500 to-orange-500',
    icon: Building2,
    stripeTier: 'enterprise' as EngineSubscriptionTier,
    features: [
      '12 Artifact Slots',
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

/* ─── Value Pillars ─── */
const PILLARS = [
  { icon: Brain, title: 'Persistent Memory', description: 'Your agents remember. Every session builds on the last.' },
  { icon: Layers, title: 'Unified Runtime', description: 'Every module runs for every user. No feature gating.' },
  { icon: Package, title: 'Equal-Slot Packs', description: 'Every pack = 1 slot. Choose any combination that fits your work.' },
  { icon: Server, title: 'Deployment Sovereignty', description: 'Cloud-first or self-hosted. Your infrastructure, your rules.' },
];

/* ─── Domain icons ─── */
const DOMAIN_ICONS: Record<string, React.ElementType> = {
  'domain-memory': Brain,
  'domain-coordination': Zap,
  'domain-intelligence': Compass,
  'domain-resilience': Shield,
  'domain-sovereignty': Server,
  'domain-perception': Eye,
};

export default function Upgrade() {
  const { tier: currentTier, startCheckout } = useEngineSubscription();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  const currentProductTier: ProductTier =
    currentTier === 'enterprise' ? 'architect' :
    ['architect', 'pro', 'creator', 'builder'].includes(currentTier) ? 'operator' :
    'builder';

  const filteredPacks = activeDomain
    ? ARTIFACT_PACKS.filter(p => {
        const domain = STRATEGIC_DOMAINS.find(d => d.id === activeDomain);
        return domain?.packIds.includes(p.id);
      })
    : ARTIFACT_PACKS;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing — Clockless"
        description="Unified runtime. Equal-slot artifact packs. Choose your capacity — 3, 6, or 12 active packs from 24 available."
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
              24 artifact packs. Every pack = 1 slot. Choose 3, 6, or 12.
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
              const displayPrice = billingInterval === 'annual' && t.key !== 'builder' ? t.annualPrice : t.price;
              const TierIcon = t.icon;
              const tierConfig = PRODUCT_TIERS[t.key];

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
                  <div className={cn("h-1.5 bg-gradient-to-r", t.accent)} />

                  {isCurrent && (
                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px]">Current</Badge>
                  )}
                  {t.popular && !isCurrent && (
                    <Badge className="absolute top-4 right-4 bg-violet-500 text-white text-[10px]">Popular</Badge>
                  )}

                  <div className="p-6 flex flex-col flex-1">
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

                    <div className="rounded-xl bg-muted/50 border border-border/30 p-4 mb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">Artifact Capacity</span>
                      </div>
                      <div className="text-2xl font-bold text-primary">{tierConfig.slots} Slots</div>
                      <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                    </div>

                    <div className="h-px bg-border/50 mb-5" />

                    <ul className="space-y-3 flex-1">
                      {t.features.map(f => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6">
                      {t.key === 'builder' ? (
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

        {/* ═══ STRATEGIC DOMAINS ═══ */}
        <section className="container mx-auto px-4 mt-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/30">
                <Compass className="w-3 h-3 mr-1.5 inline" />
                Strategic Domains
              </Badge>
              <h2 className="text-3xl font-bold">Why the Substrate Is Category-Defining</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Not features assembled from APIs. Properties of a system that runs as one thing.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {STRATEGIC_DOMAINS.map((domain, i) => {
                const DIcon = DOMAIN_ICONS[domain.id] || Package;
                const isActive = activeDomain === domain.id;
                return (
                  <motion.div
                    key={domain.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card
                      className={cn(
                        "h-full cursor-pointer transition-all",
                        isActive
                          ? "border-primary ring-1 ring-primary/20"
                          : "border-border/50 hover:border-primary/20"
                      )}
                      onClick={() => setActiveDomain(isActive ? null : domain.id)}
                    >
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center gap-2">
                          <DIcon className="w-5 h-5 text-primary" />
                          <h3 className="font-bold text-sm">{domain.name}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{domain.thesis}</p>
                        <div className="text-[10px] text-muted-foreground/60">
                          {domain.packIds.length} packs
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ ARTIFACT PACKS ═══ */}
        <section className="container mx-auto px-4 mt-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/30">
                <Package className="w-3 h-3 mr-1.5 inline" />
                {activeDomain
                  ? STRATEGIC_DOMAINS.find(d => d.id === activeDomain)?.name
                  : 'All 24 Packs'}
              </Badge>
              <h2 className="text-3xl font-bold">Artifact Packs</h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                Every pack = 1 slot. All visible to all plans. Capacity controls activation.
              </p>
              {activeDomain && (
                <button
                  onClick={() => setActiveDomain(null)}
                  className="mt-3 text-xs text-primary hover:underline"
                >
                  Show all 24 packs
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPacks.map((pack, i) => (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="h-full border-border/50 hover:border-primary/20 transition-colors">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm">{pack.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] px-1.5">{pack.version}</Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 text-primary border-primary/30">1 slot</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{pack.description}</p>
                      <p className="text-xs text-muted-foreground/70 italic">{pack.useCase}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ ENTERPRISE CTA ═══ */}
        <section className="container mx-auto px-4 mt-24">
          <div className="max-w-3xl mx-auto text-center p-10 rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-background">
            <Building2 className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">Architect Custom</h3>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Dedicated instances, custom compliance, SOC2 requirements, and white-glove onboarding. Custom slot capacity beyond 12 with dedicated support.
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
              { q: 'Why does every pack cost 1 slot?', a: 'Simplicity enables clarity. Every artifact pack is a composed capability of equal strategic weight. Choose any combination — no pack is locked behind a specific tier.' },
              { q: 'Can I change my active packs?', a: 'Yes. You can activate and deactivate packs at any time within your slot capacity. No migration, no waiting.' },
              { q: 'Can I start free and upgrade later?', a: 'Yes. The Builder plan is fully functional with 3 slots. Upgrade to Operator (6) or Architect (12) when you need more capacity.' },
              { q: 'What happens when my subscription ends?', a: 'Your projects continue on the baseline runtime. Activated packs beyond your slot capacity are paused until you resubscribe.' },
              { q: 'What is LNCHBL?', a: 'LNCHBL is the self-hosted deployment SDK. Architect plans include deployment rights to run the system on your own infrastructure.' },
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
