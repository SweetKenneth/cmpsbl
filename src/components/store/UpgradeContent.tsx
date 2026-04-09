/**
 * UpgradeContent — Substrate-tier pricing aligned with vertical access model.
 * Free: Prime only · Studio $29: 3 substrates · Creator $49: 6 substrates
 * Architect $79: All + Ultimate · Enterprise $999+: White-label + custom
 */
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { toast } from 'sonner';
import { useArtifactSlots } from '@/hooks/useArtifactSlots';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SlotPressureModal } from '@/components/slots/SlotPressureModal';
import { cn } from '@/lib/utils';
import {
  Check, ArrowRight, Package,
  Building2, Unlock, Layers,
  Sparkles, Download, X,
  Zap, Shield, Brain, Globe, Diamond,
  Radio, Crown, Users, Headphones,
} from 'lucide-react';
import { PRODUCT_TIERS, type ProductTier, type ArtifactPack } from '@/lib/quarry/types';
import type { EngineSubscriptionTier } from '@/config/engine-stripe-products';
import { PackDetailModal } from '@/components/slots/PackDetailModal';
import { motion } from 'framer-motion';
import { CrownJewelTierBreakdown } from '@/components/pricing/CrownJewelTierBreakdown';

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
  crownJewelLine: string;
  features: string[];
  capacity: {
    substrates: string;
    vault: string;
    pulls: string;
    radio: string;
    exportEnabled: boolean;
    marketplace: boolean;
  };
}[] = [
  {
    key: 'builder',
    name: 'Free',
    price: 'Free',
    annualPrice: 'Free',
    period: '',
    tagline: 'Full Prime access. Zero cost. Forever.',
    description: 'CMPSBL PRIME™ substrate with Memory Stream, Ascension exports, and Crown Jewel npm access.',
    accent: 'from-neon-green to-neon-green',
    icon: Unlock,
    capacity: { substrates: 'Prime Only', vault: '5 memories', pulls: '3 per day', radio: '15 min/day', exportEnabled: true, marketplace: false },
    crownJewelLine: 'Crown Jewels included — free via npm for all',
    features: [
      'CMPSBL PRIME™ — full 40-primitive substrate',
      'Memory Stream with daily discoveries',
      'Ascension scanning & software exports',
      'Crown Jewel npm access (free for all)',
      'Marketplace browse (read-only)',
      'Composable Radio — 15 min/day',
      'Community support',
    ],
  },
  {
    key: 'studio',
    name: 'Studio',
    price: '$29',
    annualPrice: '$23',
    period: '/mo',
    tagline: 'Choose 3 industry substrates.',
    description: 'Unlock 3 vertical substrates of your choice plus full Marketplace access.',
    accent: 'from-neon-purple to-neon-purple',
    icon: Sparkles,
    stripeTier: 'studio' as EngineSubscriptionTier,
    capacity: { substrates: '3 Verticals', vault: '25 memories', pulls: '6 per day', radio: '30 min/day', exportEnabled: true, marketplace: true },
    crownJewelLine: '28 Crown Jewel capabilities (8 Free + 20 Studio)',
    features: [
      'Choose any 3 industry substrates',
      'Full Marketplace access — buy & daily free downloads',
      'Persistent memory across substrates',
      'Composable Radio — 30 min/day',
      '2× deeper memory recall',
      'Priority queue — 3× faster routing',
      'Email support',
    ],
  },
  {
    key: 'creator',
    name: 'Creator',
    price: '$49',
    annualPrice: '$39',
    period: '/mo',
    tagline: 'Choose 6 industry substrates.',
    description: 'Unlock 6 vertical substrates, priority routing, and full trace exports.',
    accent: 'from-neon-blue to-primary',
    icon: Layers,
    popular: true,
    stripeTier: 'creator' as EngineSubscriptionTier,
    capacity: { substrates: '6 Verticals', vault: '75 memories', pulls: '9 per day', radio: '45 min/day', exportEnabled: true, marketplace: true },
    crownJewelLine: '68 Crown Jewel capabilities (Free + Studio + 40 Creator)',
    features: [
      'Choose any 6 industry substrates',
      'Full Marketplace with priority downloads',
      'Dedicated memory partitions',
      'Full trace & compliance exports',
      'Composable Radio — 45 min/day',
      'Memory Stream alerts for chains',
      'Custom memory slots',
      'Priority email support',
    ],
  },
  {
    key: 'architect',
    name: 'Architect',
    price: '$79',
    annualPrice: '$63',
    period: '/mo',
    tagline: 'Every substrate. Including ULTIMATE.',
    description: 'All industry verticals plus CMPSBL ULTIMATE™ with 143+ primitives. Maximum capability.',
    accent: 'from-neon-amber to-neon-amber',
    icon: Crown,
    stripeTier: 'architect' as EngineSubscriptionTier,
    capacity: { substrates: 'All + ULTIMATE', vault: 'Unlimited', pulls: '12 per day', radio: '60 min/day', exportEnabled: true, marketplace: true },
    crownJewelLine: 'All Crown Jewel capabilities unlocked',
    features: [
      'Every industry substrate unlocked',
      'CMPSBL ULTIMATE™ — 143+ primitives',
      'Cross-vertical Memory Stream',
      'Unlimited vault — never lose context',
      'Composable Radio — 60 min/day',
      'Governance snapshots & audit trails',
      'Private Discovery Pool',
      'Early access to new primitives',
      'Dedicated Slack support',
    ],
  },
];

export function UpgradeContent() {
  const { tier: currentTier, startCheckout } = useEngineSubscription();
  const [searchParams, setSearchParams] = useSearchParams();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [pressureModal, setPressureModal] = useState<{ open: boolean; packName?: string }>({ open: false });
  const [detailPack, setDetailPack] = useState<ArtifactPack | null>(null);

  // Checkout recovery
  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      const tier = searchParams.get('tier') || 'a plan';
      toast.info(`Still thinking about ${tier}?`, {
        description: 'Your 7-day free trial is waiting — no charge until day 8.',
        duration: 10000,
        action: {
          label: 'Start trial',
          onClick: () => {
            const matchedTier = TIERS.find(t => t.name.toLowerCase() === tier.toLowerCase());
            if (matchedTier?.stripeTier) startCheckout(matchedTier.stripeTier, billingInterval);
          },
        },
      });
      searchParams.delete('canceled');
      searchParams.delete('tier');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const currentProductTier: ProductTier =
    currentTier === 'enterprise' ? 'architect' :
    ['architect', 'pro'].includes(currentTier) ? 'architect' :
    currentTier === 'creator' ? 'creator' :
    ['studio', 'operator'].includes(currentTier) ? 'studio' :
    'builder';

  const slotState = useArtifactSlots(currentTier);

  const handleSlotPressure = (packName: string) => {
    setPressureModal({ open: true, packName });
  };

  return (
    <>
      {/* ═══ HERO ═══ */}
      <div className="container mx-auto px-4 text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30">
            <Sparkles className="w-3 h-3 mr-1.5 inline" />
            Substrate Access Plans
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Choose Your Substrates.
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-center">
            Everyone gets <strong className="text-foreground">CMPSBL PRIME™</strong> free — including Memory Stream, Ascension, and Crown Jewel npm access.
            Paid plans unlock <strong className="text-foreground">industry verticals</strong> and the <strong className="text-foreground">Marketplace</strong>.
          </p>
        </motion.div>

        {/* What You Get */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-3xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {[
            { icon: Brain, title: 'Memory Stream', desc: 'Autonomous 8-hour discovery cycles that crystallize into exportable software. Free on Prime — compounding value on paid plans.', color: 'text-neon-purple' },
            { icon: Zap, title: 'Ascension & Exports', desc: 'Scan code, diagnose weaknesses, and export hardened software. Free for all — deeper scanning on higher tiers.', color: 'text-neon-amber' },
            { icon: Globe, title: 'Industry Substrates', desc: 'Fintech, Cyber, Robotics, Media, Quantum, LLM, Agency — each a specialized 40-primitive environment. Unlock 3, 6, or all.', color: 'text-neon-green' },
            { icon: Diamond, title: 'Crown Jewels via npm', desc: 'All Crown Jewel capabilities ship free via npm. Register only if you need persistent memory across sessions.', color: 'text-neon-amber' },
            { icon: Shield, title: 'Marketplace', desc: 'Browse free for everyone. Buy artifacts, claim daily free downloads, and access the full catalog on paid plans.', color: 'text-primary' },
            { icon: Headphones, title: 'Composable Radio', desc: 'Rex Binary\'s unhinged AI radio — 15 to 60 minutes per day by tier. Unlimited for Enterprise.', color: 'text-sky-400' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 text-left p-4 rounded-xl bg-card/50 border border-border/40 hover:border-primary/20 transition-colors">
              <item.icon className={cn("w-5 h-5 shrink-0 mt-0.5", item.color)} />
              <div>
                <div className="text-sm font-semibold">{item.title}</div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Substrate Access Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mt-8 text-center bg-card/50 border border-border/40 rounded-2xl p-6 sm:p-8 space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Substrate Access by Tier</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { tier: 'Free', count: 'Prime', color: 'text-neon-green' },
              { tier: 'Studio', count: '3', color: 'text-neon-purple' },
              { tier: 'Creator', count: '6', color: 'text-sky-400' },
              { tier: 'Architect', count: 'All', color: 'text-neon-amber' },
            ].map(t => (
              <div key={t.tier} className="text-center p-2 rounded-lg bg-muted/30">
                <div className={`text-lg font-mono font-bold ${t.color}`}>{t.count}</div>
                <div className="text-[10px] text-muted-foreground">{t.tier}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            <strong className="text-foreground">Free</strong> includes CMPSBL PRIME™ with full Memory Stream and Ascension.
            <strong className="text-foreground"> Paid plans</strong> unlock industry verticals and Marketplace purchasing.
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
                key={`${t.key}-${t.name}`}
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
                    ? "border-neon-purple/40 ring-1 ring-neon-purple/10 hover:shadow-neon-purple/10"
                    : "border-border/50 hover:border-primary/20",
                )}
              >
                <div className={cn("h-1.5 bg-gradient-to-r", t.accent)} />

                {isCurrent && (
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px]">Current</Badge>
                )}
                {!isCurrent && t.stripeTier && (
                  <Badge className="absolute top-4 right-4 bg-neon-green text-white text-[10px]">7-day free trial</Badge>
                )}
                {t.popular && !isCurrent && (
                  <Badge className="absolute top-4 right-4 bg-neon-purple text-white text-[10px]">Popular</Badge>
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
                        <div className="text-sm sm:text-base font-bold text-primary font-mono tabular-nums leading-tight">
                          {t.capacity.substrates.includes('All') ? '∞' : t.capacity.substrates.includes('Prime') ? '1' : t.capacity.substrates.split(' ')[0]}
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-muted-foreground font-mono uppercase">Substrates</div>
                      </div>
                      <div className="text-center p-1.5 rounded-lg bg-background/50">
                        <div className="text-sm sm:text-base font-bold text-foreground font-mono tabular-nums leading-tight">
                          {t.capacity.vault === 'Unlimited' ? '∞' : t.capacity.vault.split(' ')[0]}
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-muted-foreground font-mono uppercase">Vault</div>
                      </div>
                      <div className="text-center p-1.5 rounded-lg bg-background/50">
                        <div className="text-sm sm:text-base font-bold text-foreground font-mono tabular-nums leading-tight">{t.capacity.radio.split(' ')[0]}</div>
                        <div className="text-[9px] sm:text-[10px] text-muted-foreground font-mono uppercase">Radio</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/20">
                      <span className={`text-[9px] sm:text-[10px] font-mono px-2 py-1 rounded-full border inline-flex items-center gap-1 ${
                        t.capacity.marketplace
                          ? 'border-neon-green/30 text-neon-green bg-neon-green/10'
                          : 'border-border/30 text-muted-foreground/50'
                      }`}>
                        {t.capacity.marketplace ? (
                          <><Download className="w-2.5 h-2.5" />Marketplace</>
                        ) : (
                          <><X className="w-2.5 h-2.5" />Browse Only</>
                        )}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono px-2 py-1 rounded-full border border-neon-green/30 text-neon-green bg-neon-green/10 inline-flex items-center gap-1">
                        <Download className="w-2.5 h-2.5" />Ascension
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-border/50 mb-4 sm:mb-5" />

                  {/* Crown Jewel link */}
                  <a
                    href="#crown-jewel-breakdown"
                    className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm mb-3 group/cj cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('crown-jewel-breakdown')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Diamond className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neon-amber shrink-0 mt-0.5" />
                    <span className="text-neon-amber underline underline-offset-2 decoration-neon-amber/40 group-hover/cj:decoration-neon-amber transition-colors">
                      {t.crownJewelLine}
                    </span>
                  </a>

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
                        Start 7-day free trial <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ═══ CROWN JEWEL BREAKDOWN ═══ */}
      <CrownJewelTierBreakdown />

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
        <div className="max-w-3xl mx-auto text-center p-10 rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-background shadow-xl shadow-primary/[0.03] shimmer-on-hover hover:border-neon-amber/20 transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-neon-amber/10 border border-neon-amber/20 flex items-center justify-center mx-auto mb-5">
            <Building2 className="w-7 h-7 text-neon-amber" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Enterprise — $999+/mo</h3>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto leading-relaxed">
            Custom white-label branded substrate with your own theme and subdomain.
            Personal account Memory Stream and Ascension — both with compounding value.
            Domain forwarding with masking for a personal touch. Up to 10 accounts included.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 max-w-md mx-auto text-left">
            {[
              'Custom themed substrate',
              'White-label branding',
              'Free subdomain with domain masking',
              'Personal Memory Stream',
              'Personal Ascension pipeline',
              'Compounding value on both',
              'Up to 10 accounts for $999',
              'Unlimited Composable Radio',
              'Additional accounts — contact us',
              'Dedicated support channel',
            ].map(f => (
              <div key={f} className="flex items-start gap-2 text-xs">
                <Check className="w-3.5 h-3.5 text-neon-amber shrink-0 mt-0.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-6 gap-2 hover:border-neon-amber/30 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" asChild>
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
            { q: 'Do I need to pay to use CMPSBL?', a: 'No. CMPSBL PRIME™ is free forever — including Memory Stream, Ascension, Crown Jewel npm access, and software exports. Paid plans unlock industry vertical substrates and Marketplace purchasing.' },
            { q: 'What are industry vertical substrates?', a: 'Specialized 40-primitive environments for specific industries — Fintech, Cyber, Robotics, Media, Quantum, LLM, Agency, and more. Each features domain-specific primitives, discoveries, and Crown Jewels.' },
            { q: 'What is CMPSBL ULTIMATE™?', a: 'The universal tier with all 143+ primitives across every industry vertical. Available on the Architect plan ($79/mo). It combines all expansion primitives into a single substrate.' },
            { q: 'How does the Marketplace work?', a: 'Everyone can browse the Marketplace. Paid accounts can purchase artifacts and claim daily free downloads. Free members can view but not transact.' },
            { q: 'What about the Crown Jewel npm?', a: 'Crown Jewel capabilities are distributed free via npm for all users. No account required for the npm package. Registration is only needed for persistent memory across sessions.' },
            { q: 'What is Composable Radio?', a: 'Rex Binary\'s AI-powered radio station with music, DJ interjections, and commercials. Listening time scales with your plan: 15 min (Free), 30 min (Studio), 45 min (Creator), 60 min (Architect), unlimited (Enterprise).' },
            { q: 'How does Enterprise white-labeling work?', a: 'Enterprise ($999+/mo) includes a custom-themed substrate with your branding, a free subdomain with domain forwarding and masking, personal Memory Stream and Ascension with compounding value, and up to 10 accounts. Need more? Contact us.' },
            { q: 'Can I access substrate dashboards?', a: 'Substrate dashboards are Governor-only. All other accounts access substrates through the front-end interface, SSO, and SDK. After login you\'re redirected to the homepage experience.' },
          ].map(faq => (
            <div key={faq.q} className="space-y-2 p-4 rounded-xl hover:bg-muted/30 border border-transparent hover:border-border/30 transition-all duration-300">
              <h3 className="font-semibold">{faq.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
