/**
 * Upgrade — Simplified tier-based presentation
 * Driven dynamically by Quarry asset assignments
 */
import { useMemo, useState } from 'react';
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { usePublicQuarryAssets } from '@/hooks/useQuarryAssets';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, ArrowRight, Brain, Cpu, Bot, Layers, Shield, Zap, Workflow, Package } from 'lucide-react';
import { ASSET_TYPE_LABELS, type QuarryTier, type QuarryAssetType } from '@/lib/quarry/types';
import type { EngineSubscriptionTier } from '@/config/engine-stripe-products';
import { motion } from 'framer-motion';

const TIERS: { key: QuarryTier; name: string; price: string; period: string; description: string; accent: string; stripeTier?: EngineSubscriptionTier }[] = [
  { key: 'free', name: 'Free', price: '$0', period: '/mo', description: 'Build real things. Not a trial.', accent: 'from-emerald-500 to-emerald-600' },
  { key: 'creator', name: 'Creator', price: '$9', period: '/mo', description: 'More depth for shipping builders.', accent: 'from-blue-500 to-blue-600', stripeTier: 'creator' as EngineSubscriptionTier },
  { key: 'architect', name: 'Architect', price: '$19', period: '/mo', description: 'Advanced orchestration & deployment.', accent: 'from-violet-500 to-violet-600', stripeTier: 'architect' as EngineSubscriptionTier },
  { key: 'enterprise', name: 'Enterprise', price: '$99', period: '/mo', description: 'Governance, compliance, full control.', accent: 'from-amber-500 to-amber-600', stripeTier: 'enterprise' as EngineSubscriptionTier },
];

const TYPE_ICONS: Record<QuarryAssetType, React.ElementType> = {
  capability: Zap,
  engine: Cpu,
  meta_engine: Layers,
  pipeline: Workflow,
  template: Package,
  agent: Bot,
  deployment_right: Shield,
  governance_tool: Shield,
};

const CORE_FEATURES: Record<QuarryTier, string[]> = {
  free: ['Persistent Memory (Basic)', 'Core Templates', 'Community Support', 'Dashboard Access'],
  creator: ['Expanded Memory Depth', 'Multi-module Synergy', 'Scheduled Automations', 'Email Support'],
  architect: ['Cross-module Orchestration', 'Self-hosted Deployment (LNCHBL)', 'Audit Views', 'Priority Support'],
  enterprise: ['Organization Workspaces', 'Compliance Exports', 'Dedicated Memory Partitions', 'Dedicated Support Channel'],
  internal: [],
};

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
      <SEO title="Upgrade — Clockless" description="Choose your depth. Persistent memory, composable agents, structured system depth, deployment flexibility." />
      <PublicNav />

      <main className="pt-28 pb-20">
        {/* Hero */}
        <div className="container mx-auto px-4 text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight"
          >
            Choose Your <span className="gradient-text">Depth</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Persistent memory. Composable agents. Structured system depth. Deployment flexibility.
          </motion.p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={cn("px-4 py-2 rounded-lg text-sm transition-all", billingInterval === 'monthly' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >Monthly</button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={cn("px-4 py-2 rounded-lg text-sm transition-all", billingInterval === 'annual' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >Annual <Badge variant="outline" className="ml-1 text-[10px]">Save 20%</Badge></button>
          </div>
        </div>

        {/* Tier Cards */}
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {TIERS.map((t, i) => {
              const isCurrent = currentTier === t.key;
              const tierAssets = assetsByTier[t.key] ?? {};
              const hasAssets = Object.keys(tierAssets).length > 0;

              return (
                <motion.div
                  key={t.key}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "relative rounded-2xl border p-6 flex flex-col",
                    isCurrent ? "border-primary ring-2 ring-primary/20" : "border-border/50 hover:border-border",
                    t.key === 'architect' && "bg-gradient-to-b from-violet-500/5 to-transparent"
                  )}
                >
                  {isCurrent && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">Current Plan</Badge>
                  )}
                  {t.key === 'architect' && !isCurrent && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white">Popular</Badge>
                  )}

                  <h3 className="text-xl font-bold">{t.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{billingInterval === 'annual' && t.key !== 'free' ? `$${Math.round(parseInt(t.price.replace('$', '')) * 0.8)}` : t.price}</span>
                    <span className="text-muted-foreground">{t.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{t.description}</p>

                  <div className="my-6 h-px bg-border/50" />

                  {/* Core features */}
                  <ul className="space-y-2.5 flex-1">
                    {CORE_FEATURES[t.key].map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Dynamic Quarry assets */}
                  {hasAssets && (
                    <div className="mt-4 pt-4 border-t border-border/30 space-y-1.5">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Included Assets</span>
                      {Object.entries(tierAssets).map(([type, count]) => {
                        const Icon = TYPE_ICONS[type as QuarryAssetType] ?? Package;
                        return (
                          <div key={type} className="flex items-center gap-2 text-sm">
                            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{count} {ASSET_TYPE_LABELS[type as QuarryAssetType]}{count > 1 ? 's' : ''}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-6">
                    {t.key === 'free' ? (
                      <Button variant="outline" className="w-full" asChild>
                        <a href="/start-here">Get Started Free</a>
                      </Button>
                    ) : isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                    ) : (
                      <Button
                        className={cn("w-full bg-gradient-to-r text-white", t.accent)}
                        onClick={() => t.stripeTier && startCheckout(t.stripeTier, billingInterval)}
                      >
                        Upgrade to {t.name} <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="container mx-auto px-4 mt-16">
          <div className="max-w-2xl mx-auto text-center p-8 rounded-2xl border border-border/50 bg-card/50">
            <h3 className="text-xl font-bold">Enterprise Custom</h3>
            <p className="text-muted-foreground mt-2">Dedicated instances, custom compliance, SOC2 requirements.</p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="mailto:Dev@CMPSBL.com">Contact Sales <ArrowRight className="w-4 h-4 ml-1" /></a>
            </Button>
          </div>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
