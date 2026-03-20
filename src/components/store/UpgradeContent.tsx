/**
 * UpgradeContent — Extracted inner content from Upgrade page.
 * Embeddable inside Store tabs or standalone Upgrade page.
 */
import { useState, useEffect } from 'react';
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
  Zap, Shield, Brain, Globe,
} from 'lucide-react';
import { PRODUCT_TIERS, type ProductTier, type ArtifactPack } from '@/lib/quarry/types';
import type { EngineSubscriptionTier } from '@/config/engine-stripe-products';
import { PackDetailModal } from '@/components/slots/PackDetailModal';
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
    capacity: { slots: 3, vault: '5 memories', pulls: '3 per day', exportEnabled: false, customSlots: false },
    features: [
      'Full runtime — not a demo',
      'Browse all 24 capability packs',
      'Standard memory (5 recalls)',
      'Usage dashboard with ROI metrics',
      'Member Hub access',
      'Community Discord support',
    ],
  },
  {
    key: 'creator',
    name: 'Creator',
    price: '$29',
    annualPrice: '$23',
    period: '/mo',
    tagline: 'More capacity for builders shipping products.',
    description: 'Expanded memory, executable capabilities, and priority routing.',
    accent: 'from-violet-500 to-purple-500',
    icon: Sparkles,
    stripeTier: 'creator' as EngineSubscriptionTier,
    capacity: { slots: 6, vault: '25 memories', pulls: '6 per day', exportEnabled: true, customSlots: false },
    features: [
      'Run 6 packs simultaneously',
      'Saved Workflows — one-click intent presets',
      'Export traces & audit logs',
      '2× deeper memory recall',
      'Priority queue — 3× faster routing',
      'Usage dashboard with ROI tracking',
      'Referral credits program',
      'Email support',
    ],
  },
  {
    key: 'studio',
    name: 'Studio',
    price: '$49',
    annualPrice: '$39',
    period: '/mo',
    tagline: '9 template packs. Maximum creative output.',
    description: 'Trace exports, high-priority NEXUS routing, custom memory slots.',
    accent: 'from-blue-500 to-indigo-500',
    icon: Layers,
    popular: true,
    stripeTier: 'studio' as EngineSubscriptionTier,
    capacity: { slots: 9, vault: '75 memories', pulls: '9 per day', exportEnabled: true, customSlots: true },
    features: [
      '9 packs running concurrently',
      'Saved Workflows & custom presets',
      'Dedicated memory partitions',
      'Full trace & compliance exports',
      'Export templates (PDF/CSV/JSON)',
      'Memory Stream alerts for pipelines',
      'Trace replay — visual debugging',
      'Custom memory slots you configure',
      'Priority email support',
    ],
  },
  {
    key: 'architect',
    name: 'Architect',
    price: '$79',
    annualPrice: '$63',
    period: '/mo',
    tagline: 'Full control. Maximum capability.',
    description: 'Unlimited vault, dedicated partitions, and full governance authority.',
    accent: 'from-amber-500 to-orange-500',
    icon: Building2,
    stripeTier: 'architect' as EngineSubscriptionTier,
    capacity: { slots: 12, vault: 'Unlimited', pulls: '12 per day', exportEnabled: true, customSlots: true },
    features: [
      '12 packs — maximum throughput',
      'Unlimited vault — never lose context',
      'Private Discovery Pool — isolated memory',
      'Governance snapshots & audit trails',
      'Full export templates (PDF/CSV/JSON)',
      'Organization workspaces for teams',
      'Early access to new nodes & resolvers',
      'Custom memory slots you configure',
      'White-glove onboarding call',
      'Dedicated Slack support channel',
    ],
  },
];
export function UpgradeContent() {
  const { tier: currentTier, startCheckout } = useEngineSubscription();
  const [searchParams, setSearchParams] = useSearchParams();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [pressureModal, setPressureModal] = useState<{ open: boolean; packName?: string }>({ open: false });
  const [detailPack, setDetailPack] = useState<ArtifactPack | null>(null);

  // Checkout recovery — show toast when user returns from canceled checkout
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
      // Clean up URL params
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
            Plans
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Scale Your Platform
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-center">
            Every tier unlocks <strong className="text-foreground">full runtime access</strong>. Upgrade for more memory, faster routing, and deeper capabilities.
          </p>
        </motion.div>

        {/* What You Get — expanded value prop */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-3xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {[
            { icon: Brain, title: 'Memory Stream', desc: 'Daily discoveries scale with your plan — from 3 to 12 pulls per day. Keep the best in your vault.', color: 'text-violet-400' },
            { icon: Zap, title: 'Runtime & Slots', desc: 'More slots mean more capabilities running simultaneously. Architect gets 12 active slots.', color: 'text-amber-400' },
            { icon: Download, title: 'Exports & Artifacts', desc: 'Studio+ can export full capability packs with runtime, documentation, and implementation code.', color: 'text-emerald-400' },
            { icon: Globe, title: 'Priority Routing', desc: 'Higher tiers get priority NEXUS routing, faster execution, and dedicated memory partitions.', color: 'text-sky-400' },
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

        {/* Memory Stream pull breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mt-8 text-center bg-card/50 border border-border/40 rounded-2xl p-6 sm:p-8 space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Daily Memory Stream Pulls</span>
          </div>
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
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            Each pull reveals a discovery you can <strong className="text-foreground">keep</strong> or <strong className="text-foreground">discard</strong>.
            Rare and <strong className="text-foreground">Mythic</strong> discoveries appear occasionally — if your vault is full, you'll be prompted to upgrade.
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
                    ? "border-violet-500/40 ring-1 ring-violet-500/10 hover:shadow-violet-500/10"
                    : "border-border/50 hover:border-primary/20",
                )}
              >
                <div className={cn("h-1.5 bg-gradient-to-r", t.accent)} />

                {isCurrent && (
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px]">Current</Badge>
                )}
                {!isCurrent && t.stripeTier && (
                  <Badge className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px]">7-day free trial</Badge>
                )}
                {t.popular && !isCurrent && !t.stripeTier && (
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
            { q: 'What is the Memory Stream?', a: 'The Memory Stream continuously discovers new capabilities. Each day you can crystallize discoveries depending on your plan — Builder gets 3 pulls, Studio gets 6, Creator gets 9, and Architect gets 12.' },
            { q: 'What is the vault?', a: 'The vault stores memories you choose to keep after crystallization. Each tier has different vault capacity — from 5 (Builder) to unlimited (Architect). Remove old memories to free space.' },
            { q: 'What happens with Mythic discoveries?', a: 'Mythic memories are among the rarest outcomes. If your vault is full when one appears, you will be prompted to upgrade or manage your vault to keep it.' },
            { q: 'Can I export my discoveries?', a: 'Studio and above can export full capability packs including runtime, memory implementation, and documentation. Builder tier can explore and store, but export requires an upgrade.' },
            { q: 'What are custom memory slots?', a: 'Creator and Architect tiers can equip discovered memories directly into runtime slots. Lower tiers can only activate prebuilt capability packs.' },
            { q: 'What does priority routing do?', a: 'Higher tiers get faster NEXUS execution, dedicated memory partitions, and priority queue placement. Architect gets the fastest routing with dedicated infrastructure.' },
            { q: 'Can I start free and upgrade later?', a: 'Yes. Builder is fully functional with 3 slots, 5 vault capacity, and 3 daily pulls. Upgrade when you need more.' },
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
