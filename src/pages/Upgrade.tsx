/**
 * Upgrade — Memory Stream Capacity + Vault System
 * Builder (3/5) · Studio (6/25) · Creator (9/75) · Architect (12/∞)
 * Packs grouped by Strategic Domain with horizontal card scrolling
 */
import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BASELINE_HIGHLIGHTS } from '@/lib/substrate/baseline-pillars';
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
  Sparkles, Compass, ChevronLeft, ChevronRight,
  Archive, Download, X,
} from 'lucide-react';
import { ARTIFACT_PACKS, PRODUCT_TIERS, STRATEGIC_DOMAINS, type ProductTier, type ArtifactPack } from '@/lib/quarry/types';
import type { EngineSubscriptionTier } from '@/config/engine-stripe-products';
import { PackDetailModal } from '@/components/slots/PackDetailModal';
import { VAULT_TIER_LIMITS } from '@/lib/substrate/vault-limits';
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
  capacity: {
    slots: number;
    vault: string;
    pulls: string;
    exportEnabled: boolean;
    customSlots: boolean;
  };
}[] = [
  {
    key: 'builder',
    name: 'Builder',
    price: '$0',
    annualPrice: '$0',
    period: '/mo',
    tagline: 'Build real things. Not a trial.',
    description: 'Full runtime access with baseline technology.',
    accent: 'from-emerald-500 to-emerald-600',
    icon: Unlock,
    capacity: { slots: 3, vault: '5 pipelines', pulls: '3 per day', exportEnabled: false, customSlots: false },
    features: [
      'Full baseline runtime',
      'All 24 packs visible',
      'Standard memory depth',
      'Community support',
    ],
  },
  {
    key: 'operator',
    name: 'Studio',
    price: '$29',
    annualPrice: '$23',
    period: '/mo',
    tagline: 'More capacity for builders shipping products.',
    description: 'Expanded memory, executable capabilities, and priority routing.',
    accent: 'from-violet-500 to-purple-500',
    icon: Sparkles,
    stripeTier: 'creator' as EngineSubscriptionTier,
    capacity: { slots: 6, vault: '25 pipelines', pulls: '6 per day', exportEnabled: true, customSlots: false },
    features: [
      'Expanded memory depth',
      'All 24 packs visible',
      'Executable capabilities',
      'Priority routing',
      'Email support',
    ],
  },
  {
    key: 'studio',
    name: 'Creator',
    price: '$49',
    annualPrice: '$39',
    period: '/mo',
    tagline: '9 template packs. Maximum creative output.',
    description: 'Trace exports, high-priority NEXUS routing, custom memory slots.',
    accent: 'from-blue-500 to-indigo-500',
    icon: Layers,
    popular: true,
    stripeTier: 'studio' as EngineSubscriptionTier,
    capacity: { slots: 9, vault: '75 pipelines', pulls: '9 per day', exportEnabled: true, customSlots: true },
    features: [
      '9 template packs included',
      'Expanded memory partitions',
      'Trace & audit exports',
      'High-priority NEXUS routing',
      'Custom pipeline slots',
      'Priority email support',
    ],
  },
  {
    key: 'architect',
    name: 'Architect',
    price: '$79',
    annualPrice: '$63',
    period: '/mo',
    tagline: 'Full control. Your infrastructure.',
    description: 'Self-hosted deployment and full governance authority.',
    accent: 'from-amber-500 to-orange-500',
    icon: Building2,
    stripeTier: 'architect' as EngineSubscriptionTier,
    capacity: { slots: 12, vault: 'Unlimited', pulls: '12 per day', exportEnabled: true, customSlots: true },
    features: [
      'Dedicated memory partitions',
      'Self-hosted deployment (LNCHBL)',
      'Full governance authority',
      'Compliance & audit exports',
      'Organization workspaces',
      'Custom pipeline slots',
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

/* ─── Domain icons & accent colors ─── */
const DOMAIN_ICONS: Record<string, React.ElementType> = {
  'domain-memory': Brain,
  'domain-coordination': Zap,
  'domain-intelligence': Compass,
  'domain-resilience': Shield,
  'domain-sovereignty': Server,
  'domain-perception': Eye,
};

const DOMAIN_ACCENTS: Record<string, { gradient: string; text: string; border: string; bg: string }> = {
  'domain-memory': { gradient: 'from-cyan-500/20 to-cyan-500/5', text: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/10' },
  'domain-coordination': { gradient: 'from-violet-500/20 to-violet-500/5', text: 'text-violet-400', border: 'border-violet-500/20', bg: 'bg-violet-500/10' },
  'domain-intelligence': { gradient: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10' },
  'domain-resilience': { gradient: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
  'domain-sovereignty': { gradient: 'from-orange-500/20 to-orange-500/5', text: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/10' },
  'domain-perception': { gradient: 'from-pink-500/20 to-pink-500/5', text: 'text-pink-400', border: 'border-pink-500/20', bg: 'bg-pink-500/10' },
};

/* ─── Horizontal Scroll Row ─── */
function DomainPackRow({
  domain,
  packs,
  slotState,
  onSlotPressure,
  onViewDetails,
}: {
  domain: typeof STRATEGIC_DOMAINS[0];
  packs: typeof ARTIFACT_PACKS;
  slotState: ReturnType<typeof useArtifactSlots>;
  onSlotPressure: (packName: string) => void;
  onViewDetails: (pack: ArtifactPack) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const DIcon = DOMAIN_ICONS[domain.id] || Package;
  const accent = DOMAIN_ACCENTS[domain.id] || DOMAIN_ACCENTS['domain-memory'];

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -360 : 360,
      behavior: 'smooth',
    });
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="container mx-auto px-4 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", accent.bg)}>
              <DIcon className={cn("w-5 h-5", accent.text)} />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">{domain.name}</h3>
              <p className="text-xs text-muted-foreground max-w-md line-clamp-1">{domain.thesis}</p>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono ml-2 hidden sm:inline-flex">
              {packs.length} packs
            </Badge>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 px-4 lg:px-[max(1rem,calc((100vw-80rem)/2+1rem))] no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {packs.map((pack) => (
          <div key={pack.id} className="min-w-[300px] max-w-[340px] snap-start shrink-0">
            <PackActivationCard
              pack={pack}
              slotState={slotState}
              onActivate={async (id) => { await slotState.activate.mutateAsync(id); }}
              onDeactivate={async (id) => { await slotState.deactivate.mutateAsync(id); }}
              onSlotPressure={onSlotPressure}
              onViewDetails={onViewDetails}
            />
          </div>
        ))}
        <div className="shrink-0 w-4 lg:w-1" aria-hidden />
      </div>
    </motion.section>
  );
}

export default function Upgrade() {
  const { tier: currentTier, startCheckout } = useEngineSubscription();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [pressureModal, setPressureModal] = useState<{ open: boolean; packName?: string }>({ open: false });
  const [detailPack, setDetailPack] = useState<ArtifactPack | null>(null);

  const currentProductTier: ProductTier =
    currentTier === 'enterprise' ? 'architect' :
    currentTier === 'studio' ? 'studio' :
    ['architect', 'pro'].includes(currentTier) ? 'architect' :
    ['creator', 'builder'].includes(currentTier) ? 'operator' :
    'builder';

  const slotState = useArtifactSlots(currentTier);

  const handleSlotPressure = (packName: string) => {
    setPressureModal({ open: true, packName });
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-40 left-1/4 w-[500px] h-[500px] rounded-full animate-hero-orb-1" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 60%)" }} />
        <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] rounded-full animate-hero-orb-3" style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.03) 0%, transparent 60%)" }} />
      </div>
      <SEO
        title="Pricing — CMPSBL"
        description="Memory Stream capacity plans. Daily pulls, vault storage, and artifact slots. Builder (free), Studio ($29/mo), Creator ($49/mo), or Architect ($79/mo)."
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
              <Sparkles className="w-3 h-3 mr-1.5 inline" />
              Memory Stream
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Memory Stream
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-center">
              The system <strong className="text-foreground">discovers memories</strong>. Your plan controls <strong className="text-foreground">how many</strong> you can pull.
            </p>
          </motion.div>

          {/* Memory Stream Explainer */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mt-8 text-center sm:text-left bg-card/50 border border-border/40 rounded-2xl p-6 sm:p-8 space-y-4"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              The <strong className="text-foreground">Memory Stream</strong> continuously forms new memories.
              Each day you can <strong className="text-foreground">crystallize</strong> a limited number of discoveries depending on your plan.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { tier: 'Builder', pulls: '3', color: 'text-emerald-400' },
                { tier: 'Studio', pulls: '6', color: 'text-violet-400' },
                { tier: 'Creator', pulls: '9', color: 'text-sky-400' },
                { tier: 'Architect', pulls: '12', color: 'text-amber-400' },
              ].map(t => (
                <div key={t.tier} className="text-center p-2 rounded-lg bg-muted/30">
                  <div className={`text-lg font-mono font-bold ${t.color}`}>{t.pulls}</div>
                  <div className="text-[10px] text-muted-foreground">{t.tier}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each crystallization reveals a memory you may choose to <strong className="text-foreground">keep in your vault</strong> or <strong className="text-foreground">discard</strong>.{' '}
              <strong className="text-foreground">Rare discoveries</strong> occasionally appear. If a <strong className="text-foreground">Mythic memory</strong> is discovered and your vault is full,
              you will be prompted to upgrade immediately so the discovery is not lost.
            </p>
            <p className="text-xs text-muted-foreground/70">
              <strong className="text-foreground">Slots</strong> control how many memories run simultaneously.{' '}
              <strong className="text-foreground">Vault capacity</strong> controls how many discoveries you can store.
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
        <div className="relative">
          <div className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 px-4 lg:px-0 lg:overflow-visible lg:justify-center lg:flex-wrap no-scrollbar max-w-5xl mx-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {TIERS.map((t, i) => {
              const isCurrent = currentProductTier === t.key;
              const displayPrice = billingInterval === 'annual' && t.key !== 'builder' ? t.annualPrice : t.price;
              const TierIcon = t.icon;

              return (
                <motion.div
                  key={t.key}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "relative rounded-2xl border flex flex-col overflow-hidden snap-center shrink-0 group",
                    "min-w-[280px] max-w-[320px] sm:min-w-[300px] sm:max-w-[340px] lg:min-w-0 lg:max-w-none lg:flex-1",
                    "hover:shadow-xl transition-all duration-300 card-lift",
                    isCurrent
                      ? "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                      : t.popular
                      ? "border-violet-500/40 ring-1 ring-violet-500/10 hover:shadow-violet-500/10"
                      : "border-border/50 hover:border-primary/20",
                  )}
                >
                  <div className={cn("h-1.5 bg-gradient-to-r", t.accent)} />

                  {isCurrent && (
                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px]">Current</Badge>
                  )}
                  {t.popular && !isCurrent && (
                    <Badge className="absolute top-4 right-4 bg-violet-500 text-white text-[10px]">Popular</Badge>
                  )}

                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center", t.accent)}>
                        <TierIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold">{t.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-bold tabular-nums">{displayPrice}</span>
                          <span className="text-muted-foreground text-sm">{t.period}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{t.tagline}</p>

                    {/* Capacity metrics */}
                    <div className="rounded-xl bg-muted/50 border border-border/30 p-3 sm:p-4 mb-4 sm:mb-5 group-hover:border-primary/20 transition-colors duration-300 space-y-2.5 sm:space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="text-xs sm:text-sm font-semibold">Capacity</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        <div className="text-center p-1.5 rounded-lg bg-background/50">
                          <div className="text-lg sm:text-xl font-bold text-primary font-mono tabular-nums">{t.capacity.slots}</div>
                          <div className="text-[9px] sm:text-[10px] text-muted-foreground font-mono uppercase">Slots</div>
                        </div>
                        <div className="text-center p-1.5 rounded-lg bg-background/50">
                          <div className="text-lg sm:text-xl font-bold text-foreground font-mono tabular-nums">
                            {t.capacity.vault === 'Unlimited' ? '∞' : t.capacity.vault.split(' ')[0]}
                          </div>
                          <div className="text-[9px] sm:text-[10px] text-muted-foreground font-mono uppercase">Vault</div>
                        </div>
                        <div className="text-center p-1.5 rounded-lg bg-background/50">
                          <div className="text-lg sm:text-xl font-bold text-foreground font-mono tabular-nums">{t.capacity.pulls.split(' ')[0]}</div>
                          <div className="text-[9px] sm:text-[10px] text-muted-foreground font-mono uppercase">Pulls/day</div>
                        </div>
                      </div>
                      {/* Export + custom slots badges */}
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/20">
                        <span className={`text-[9px] sm:text-[10px] font-mono px-2 py-1 rounded-full border inline-flex items-center gap-1 ${
                          t.capacity.exportEnabled
                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                            : 'border-border/30 text-muted-foreground/50'
                        }`}>
                          {t.capacity.exportEnabled ? (
                            <><Download className="w-2.5 h-2.5" />Export</>
                          ) : (
                            <><X className="w-2.5 h-2.5" />No Export</>
                          )}
                        </span>
                        {t.capacity.customSlots && (
                          <span className="text-[9px] sm:text-[10px] font-mono px-2 py-1 rounded-full border border-primary/30 text-primary bg-primary/10 inline-flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />Custom Slots
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-border/50 mb-4 sm:mb-5" />

                    <ul className="space-y-2.5 sm:space-y-3 flex-1">
                      {t.features.map(f => (
                        <li key={f} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm">
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 sm:mt-6">
                      {t.key === 'builder' ? (
                        <Button variant="outline" className="w-full min-h-[44px]" asChild>
                          <Link to="/auth">Get Started Free</Link>
                        </Button>
                      ) : isCurrent ? (
                        <Button variant="outline" className="w-full min-h-[44px]" disabled>Current Plan</Button>
                      ) : (
                        <Button
                          className={cn("w-full min-h-[44px] bg-gradient-to-r text-white border-0 shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200", t.accent)}
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

        {/* Section divider */}
        <div className="section-divider max-w-4xl mx-auto mt-24 mb-0" />

        {/* ═══ EVERY PLAN INCLUDES ═══ */}
        <section className="container mx-auto px-4 mt-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/30">
                <Lock className="w-3 h-3 mr-1.5 inline" />
                Always Active
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Every Plan Includes</h2>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">The full runtime runs for every user. Plans scale capacity, not capability.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {BASELINE_HIGHLIGHTS.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border/40 bg-card/50 p-4 space-y-1.5 shimmer-on-hover card-lift"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <h4 className="text-sm font-semibold">{item.label}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button variant="link" asChild className="text-primary text-sm">
                <Link to="/runtime">See full runtime overview →</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ═══ VALUE PILLARS ═══ */}
        <section className="container mx-auto px-4 mt-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">What Powers Every Plan</h2>
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
                    <Card className="h-full border-border/50 hover:border-primary/20 transition-all duration-300 card-lift shimmer-on-hover">
                      <CardContent className="p-5 space-y-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                          <PIcon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-bold">{p.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ ARTIFACT PACKS BY DOMAIN ═══ */}
        <section className="mt-24">
          <div className="container mx-auto px-4 text-center mb-12">
            <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/30">
              <Package className="w-3 h-3 mr-1.5 inline" />
              All 24 Packs
            </Badge>
            <h2 className="text-3xl font-bold">Artifact Packs by Domain</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Every pack = 1 slot. All visible to all plans. Scroll each category to explore.
            </p>
            <div className="flex justify-center mt-6">
              <SlotCapacityIndicator slotState={slotState} variant="full" className="max-w-sm w-full" />
            </div>
          </div>

          <div className="space-y-12">
            {STRATEGIC_DOMAINS.map((domain) => {
              const domainPacks = ARTIFACT_PACKS.filter(p => domain.packIds.includes(p.id));
              if (domainPacks.length === 0) return null;
              return (
                <DomainPackRow
                  key={domain.id}
                  domain={domain}
                  packs={domainPacks}
                  slotState={slotState}
                  onSlotPressure={handleSlotPressure}
                  onViewDetails={(pack) => setDetailPack(pack)}
                />
              );
            })}
          </div>
        </section>

        {/* Slot Pressure Modal */}
        <SlotPressureModal
          open={pressureModal.open}
          onOpenChange={(open) => setPressureModal({ ...pressureModal, open })}
          currentTier={currentProductTier}
          packName={pressureModal.packName}
        />

        {/* Pack Detail Modal */}
        <PackDetailModal
          pack={detailPack}
          open={!!detailPack}
          onOpenChange={(open) => { if (!open) setDetailPack(null); }}
          slotState={slotState}
          onActivate={async (id) => { await slotState.activate.mutateAsync(id); }}
          onDeactivate={async (id) => { await slotState.deactivate.mutateAsync(id); }}
          onSlotPressure={handleSlotPressure}
        />

        {/* ═══ ENTERPRISE CTA ═══ */}
        <section className="container mx-auto px-4 mt-24">
          <div className="max-w-3xl mx-auto text-center p-10 rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-background shadow-xl shadow-primary/[0.03] shimmer-on-hover hover:border-amber-500/20 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
              <Building2 className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Architect Custom</h3>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto leading-relaxed">
              Dedicated instances, custom compliance, SOC2 requirements, and white-glove onboarding. Custom slot capacity beyond 12 with dedicated support.
            </p>
            <Button variant="outline" className="mt-6 gap-2 hover:border-amber-500/30 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" asChild>
              <a href="mailto:Dev@CMPSBL.com">Contact Sales <ArrowRight className="w-4 h-4" /></a>
            </Button>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="container mx-auto px-4 mt-24 mb-8">
          <div className="section-divider max-w-2xl mx-auto mb-16" />
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-center tracking-tight">Common Questions</h2>
            {[
              { q: 'What is the Memory Stream?', a: 'The Memory Stream continuously generates new pipelines. Each day you can crystallize discoveries depending on your plan — Builder gets 3 pulls, Studio gets 6, Creator gets 9, and Architect gets 12.' },
              { q: 'What is the vault?', a: 'The vault stores pipelines you choose to keep after crystallization. Each tier has different vault capacity — from 5 (Builder) to unlimited (Architect). Remove old pipelines to free space.' },
              { q: 'What happens with Mythic discoveries?', a: 'Mythic pipelines are among the rarest outcomes. If your vault is full when one appears, you will be prompted to upgrade or manage your vault to keep it.' },
              { q: 'Can I export my discoveries?', a: 'Studio and above can export full artifact packs including runtime, pipeline implementation, and documentation. Builder tier can explore and store, but export requires an upgrade.' },
              { q: 'What are custom pipeline slots?', a: 'Creator and Architect tiers can equip discovered pipelines directly into runtime slots. Lower tiers can only activate prebuilt artifact packs.' },
              { q: 'Can I start free and upgrade later?', a: 'Yes. Builder is fully functional with 3 slots, 5 vault capacity, and 3 daily pulls. Upgrade when you need more.' },
              { q: 'What is LNCHBL?', a: 'LNCHBL is the self-hosted deployment SDK. Architect plans include deployment rights to run the system on your own infrastructure.' },
            ].map(faq => (
              <div key={faq.q} className="space-y-2 p-4 rounded-xl hover:bg-muted/30 border border-transparent hover:border-border/30 transition-all duration-300">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </div>
  );
}
