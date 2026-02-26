/**
 * Upgrade — The single pricing & tier page
 * Dynamic Quarry-driven content + static core features
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { usePublicQuarryAssets } from '@/hooks/useQuarryAssets';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Check, ArrowRight, Brain, Cpu, Bot, Layers, Shield, Zap,
  Workflow, Package, Crown, Sparkles, Building2, Lock, Unlock,
  MessageSquare, Eye, Server
} from 'lucide-react';
import { ASSET_TYPE_LABELS, type QuarryTier, type QuarryAssetType } from '@/lib/quarry/types';
import {
  PUBLIC_CAPABILITY_MANIFEST,
  getCapabilitiesByTier,
  CATEGORY_LABELS,
} from '@/lib/capabilities/public-capability-manifest';
import type { EngineSubscriptionTier } from '@/config/engine-stripe-products';
import { motion } from 'framer-motion';
import { TierUnlockSection } from '@/components/pricing/TierUnlockSection';

/* ─── Tier definitions ─── */
const TIERS: {
  key: QuarryTier;
  name: string;
  price: string;
  annualPrice: string;
  period: string;
  description: string;
  accent: string;
  icon: React.ElementType;
  popular?: boolean;
  stripeTier?: EngineSubscriptionTier;
}[] = [
  {
    key: 'free', name: 'Free', price: '$0', annualPrice: '$0', period: '/mo',
    description: 'Build real things. Not a trial.',
    accent: 'from-emerald-500 to-emerald-600', icon: Unlock,
  },
  {
    key: 'creator', name: 'Creator', price: '$9', annualPrice: '$7', period: '/mo',
    description: 'Expanded depth for builders shipping products.',
    accent: 'from-blue-500 to-cyan-500', icon: Sparkles,
    stripeTier: 'creator' as EngineSubscriptionTier,
  },
  {
    key: 'architect', name: 'Architect', price: '$19', annualPrice: '$15', period: '/mo',
    description: 'Cross-module orchestration & self-hosted deployment.',
    accent: 'from-violet-500 to-purple-500', icon: Crown, popular: true,
    stripeTier: 'architect' as EngineSubscriptionTier,
  },
  {
    key: 'enterprise', name: 'Enterprise', price: '$99', annualPrice: '$79', period: '/mo',
    description: 'Governance, compliance, SLA-aware controls for teams.',
    accent: 'from-amber-500 to-orange-500', icon: Building2,
    stripeTier: 'enterprise' as EngineSubscriptionTier,
  },
];

const TYPE_ICONS: Record<QuarryAssetType, React.ElementType> = {
  capability: Zap,
  engine: Cpu,
  meta_engine: Layers,
  pipeline: Workflow,
  template: Package,
  agent: Bot,
  deployment_right: Server,
  governance_tool: Shield,
};

const CORE_FEATURES: Record<QuarryTier, { text: string; icon: React.ElementType }[]> = {
  free: [
    { text: 'Persistent Memory (Basic)', icon: Brain },
    { text: 'Core Templates', icon: Package },
    { text: 'Dashboard Access', icon: Eye },
    { text: 'Community Support', icon: MessageSquare },
  ],
  creator: [
    { text: 'Expanded Memory Depth', icon: Brain },
    { text: 'Multi-module Synergy Pipelines', icon: Workflow },
    { text: 'Scheduled Automations', icon: Zap },
    { text: 'Higher Nexus Quotas', icon: Cpu },
    { text: 'Email Support', icon: MessageSquare },
  ],
  architect: [
    { text: 'Cross-module Orchestration', icon: Layers },
    { text: 'Self-hosted Deployment (LNCHBL)', icon: Server },
    { text: 'Audit Views & Change Summaries', icon: Eye },
    { text: 'Batch Execution', icon: Workflow },
    { text: 'Priority Nexus Routing', icon: Zap },
    { text: 'Priority Support', icon: MessageSquare },
  ],
  enterprise: [
    { text: 'Organization Workspaces & Roles', icon: Building2 },
    { text: 'Compliance & Audit Exports', icon: Shield },
    { text: 'Dedicated Memory Partitions', icon: Brain },
    { text: 'SLA-aware Nexus Controls', icon: Cpu },
    { text: 'Provider Budget Pinning', icon: Zap },
    { text: 'Dedicated Support Channel', icon: MessageSquare },
  ],
  internal: [],
};

/* ─── Messaging pillars ─── */
const PILLARS = [
  { icon: Brain, title: 'Persistent Memory', description: 'Your agents remember. Every session builds on the last.' },
  { icon: Bot, title: 'Composable Agents', description: 'Assemble specialized minds. Own them. Run them anywhere.' },
  { icon: Layers, title: 'Structured System Depth', description: '10 modules, 5 mesh overlays, 9 zones working in concert.' },
  { icon: Server, title: 'Deployment Flexibility', description: 'Cloud-first or self-hosted via LNCHBL. Your infrastructure, your rules.' },
];

export default function Upgrade() {
  const { data: allAssets = [], isLoading } = usePublicQuarryAssets();
  const { tier: currentTier, startCheckout } = useEngineSubscription();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');

  const assetsByTier = useMemo(() => {
    const map: Record<QuarryTier, Record<QuarryAssetType, number>> = {
      free: {} as any, creator: {} as any, architect: {} as any, enterprise: {} as any, internal: {} as any,
    };
    allAssets.forEach(a => {
      if (!map[a.tier]) return;
      map[a.tier][a.asset_type] = (map[a.tier][a.asset_type] ?? 0) + 1;
    });
    return map;
  }, [allAssets]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing — Clockless"
        description="Choose your depth. Persistent memory, composable agents, structured system depth, deployment flexibility. Plans from free to enterprise."
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
              <Lock className="w-3 h-3 mr-1.5 inline" />
              Tiered Intelligence
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Choose Your <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Depth</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Every tier adds capabilities that work behind the scenes — predicting, protecting, and optimizing.
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {TIERS.map((t, i) => {
              const isCurrent = currentTier === t.key;
              const tierAssets = assetsByTier[t.key] ?? {};
              const hasAssets = Object.keys(tierAssets).length > 0;
              const displayPrice = billingInterval === 'annual' && t.key !== 'free' ? t.annualPrice : t.price;
              const TierIcon = t.icon;

              return (
                <motion.div
                  key={t.key}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
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

                    <p className="text-sm text-muted-foreground mb-6">{t.description}</p>

                    <div className="h-px bg-border/50 mb-5" />

                    {/* Core features */}
                    <ul className="space-y-3 flex-1">
                      {CORE_FEATURES[t.key].map(f => {
                        const FIcon = f.icon;
                        return (
                          <li key={f.text} className="flex items-start gap-2.5 text-sm">
                            <FIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>{f.text}</span>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Dynamic Quarry assets */}
                    {hasAssets && (
                      <div className="mt-5 pt-4 border-t border-border/30 space-y-2">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Quarry Assets</span>
                        {Object.entries(tierAssets).map(([type, count]) => {
                          const Icon = TYPE_ICONS[type as QuarryAssetType] ?? Package;
                          const c = count as number;
                          return (
                            <div key={type} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Icon className="w-3.5 h-3.5" />
                              <span>{c} {ASSET_TYPE_LABELS[type as QuarryAssetType]}{c > 1 ? 's' : ''}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="mt-6">
                      {t.key === 'free' ? (
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
              <h2 className="text-3xl font-bold">What Powers Every Tier</h2>
              <p className="text-muted-foreground mt-2">The substrate runs behind the scenes — you experience the outcomes.</p>
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

        {/* ═══ TIERED CAPABILITIES (existing component) ═══ */}
        <TierUnlockSection />

        {/* ═══ ENTERPRISE CTA ═══ */}
        <section className="container mx-auto px-4 mt-8">
          <div className="max-w-3xl mx-auto text-center p-10 rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-background">
            <Building2 className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">Enterprise Custom</h3>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Dedicated instances, custom compliance, SOC2 requirements, and white-glove onboarding.
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
              { q: 'Is the free tier really free?', a: 'Yes. Build projects, run capabilities, use templates, save outputs. No credit card required.' },
              { q: 'Can I start free and upgrade later?', a: 'Absolutely. Upgrade when you need more power. Your projects and data carry over.' },
              { q: 'What happens when my subscription ends?', a: 'Your projects continue working. You lose access to paid-tier capabilities until you resubscribe.' },
              { q: 'What is LNCHBL?', a: 'LNCHBL is our self-hosted deployment SDK. Architect and above tiers include deployment rights to run the substrate on your own infrastructure.' },
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
