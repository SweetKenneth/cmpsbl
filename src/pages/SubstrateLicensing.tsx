/**
 * Unified Pricing Page — Mobile-First, Benefits-First Layout
 * v10.5.4 ARCHITECT Epoch
 * 
 * Structure:
 *   1. Hero — Value proposition
 *   2. Benefits Showcase — Capabilities, Pipelines, Templates per tier (horizontal scroll mobile)
 *   3. Pricing Cards — Horizontal scroll on mobile
 *   4. FAQ + Contact
 */

import { useState, useRef } from "react";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UNIFIED_TIERS, CONTACT_EMAIL, CONTACT_PHONE } from "@/config/licensing-products";
import {
  getCapabilitiesByTier,
  getCrownJewelsByTier,
  type PublicCapability,
} from "@/lib/capabilities/public-capability-manifest";
import {
  Brain, Shield, Zap, CheckCircle2, ArrowRight, Mail, Phone,
  Building2, Sparkles, Crown, Layers, Star, Workflow, FileText,
  ChevronLeft, ChevronRight, Lock, Gem,
} from "lucide-react";

// ── Tier visual config ──
const TIERS = [
  {
    key: 'free' as const,
    icon: Layers,
    gradient: 'from-slate-500 to-zinc-500',
    bgGlow: 'bg-slate-500/5',
    cta: 'Get Started Free',
    popular: false,
    headline: 'Build Real Systems — Zero Cost',
    benefitSummary: 'Full building capabilities with persistent memory, composition engine, and access to the Artifact Store.',
    pipelineCount: 0,
    templateExamples: ['Basic agent templates', 'Starter project scaffolds'],
    capabilityHighlights: [
      'Persistent memory (bounded)',
      'Composition engine',
      'All executors & runners',
      'Artifact Store access',
    ],
  },
  {
    key: 'creator' as const,
    icon: Sparkles,
    gradient: 'from-blue-500 to-cyan-500',
    bgGlow: 'bg-blue-500/5',
    cta: 'Subscribe — $49/mo',
    popular: true,
    headline: 'Everything in Free + Autonomous Intelligence',
    benefitSummary: 'All 76 engines, 8 meta-engines, 7 Crown Jewels, full SDK/API access, and self-improving capabilities that predict, protect, and optimize.',
    pipelineCount: 20,
    templateExamples: ['Multi-agent workflows', 'RAG pipeline templates', 'Security scan templates', 'Cost optimization playbooks'],
    capabilityHighlights: [
      'All 76 base engines (up from 30 in Free)',
      '8 meta-engines for compound orchestration',
      'Auto-recover from module failures',
      'Predict cost spikes before they hit',
      'Smart rate shaping for API traffic',
      'AI-powered accessibility auto-fix',
      'Isolated sandbox experimentation',
      'On-demand compliance snapshots',
    ],
  },
  {
    key: 'architect' as const,
    icon: Crown,
    gradient: 'from-violet-500 to-purple-500',
    bgGlow: 'bg-violet-500/5',
    cta: 'Subscribe — $149/mo',
    popular: false,
    headline: 'Everything in Creator + Compound Intelligence',
    benefitSummary: 'All Creator capabilities plus 16 meta-engines (up from 8), all 28 Crown Jewels, cross-project learning, forensic timelines, and cascade failure prevention.',
    pipelineCount: 40,
    templateExamples: ['Cross-project learning pipelines', 'Compliance audit generators', 'Threat intelligence workflows', 'Architecture migration plans'],
    capabilityHighlights: [
      '16 meta-engines (up from 8 in Creator)',
      'All 28 Crown Jewels (up from 7)',
      'Zero-day attack detection',
      'Cross-module orchestration',
      'Dream-state creative synthesis',
      'Cascade failure prevention',
      'Intelligent cost arbitrage',
      'Auto-generate compliance reports',
    ],
  },
  {
    key: 'enterprise' as const,
    icon: Building2,
    gradient: 'from-amber-500 to-orange-500',
    bgGlow: 'bg-amber-500/5',
    cta: 'Contact Sales',
    popular: false,
    headline: 'Everything in Architect + Full Sovereignty',
    benefitSummary: 'All Architect capabilities plus all 24 meta-engines, source code access, air-gapped deployment, and SLA guarantees.',
    pipelineCount: 60,
    templateExamples: ['Air-gapped deployment configs', 'Multi-tenant isolation templates', 'Federated identity workflows', 'Enterprise governance policies'],
    capabilityHighlights: [
      'All 24 meta-engines (up from 16 in Architect)',
      'All 200+ templates across every tier',
      'Multi-tenant memory isolation',
      'Sovereign identity federation',
      'Enterprise threat intel network',
      'SLA-backed delivery guarantees',
      'Org-wide cost governance',
      'Cross-deployment observability',
    ],
  },
];

// ── Horizontal Scroll Container (mobile-optimized) ──
function HorizontalScroll({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.85;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative group">
      <button
        onClick={() => scroll('left')}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <div
        ref={scrollRef}
        className={`flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-1 ${className}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      <button
        onClick={() => scroll('right')}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
}

// ── Tier Benefit Card (mobile-first) ──
function TierBenefitCard({ tier }: { tier: typeof TIERS[number] }) {
  const capabilities = getCapabilitiesByTier(tier.key === 'free' ? 'creator' : tier.key as 'creator' | 'architect' | 'enterprise');
  const crownJewels = tier.key === 'free' ? [] : getCrownJewelsByTier(tier.key as 'creator' | 'architect' | 'enterprise');
  const Icon = tier.icon;

  return (
    <div className="min-w-[280px] w-[85vw] max-w-[340px] sm:min-w-[320px] sm:max-w-none lg:min-w-0 snap-center flex-shrink-0 lg:flex-shrink lg:w-full">
      <Card className={`h-full relative overflow-hidden ${tier.bgGlow} border-border/50`}>
        <div className={`h-1.5 bg-gradient-to-r ${tier.gradient}`} />
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r ${tier.gradient} flex items-center justify-center shrink-0`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg truncate">{UNIFIED_TIERS[tier.key]?.name ?? tier.key}</h3>
              {tier.popular && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0">Most Popular</Badge>
              )}
            </div>
          </div>

          <h4 className="font-semibold text-sm sm:text-base text-foreground leading-tight">{tier.headline}</h4>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{tier.benefitSummary}</p>

          {/* Key Capabilities */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
              Key Capabilities
            </div>
            <ul className="space-y-1 sm:space-y-1.5">
              {tier.capabilityHighlights.map((cap, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{cap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Crown Jewels */}
          {crownJewels.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Gem className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
                Crown Jewels ({crownJewels.length})
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {crownJewels.map((cj) => (
                  <Badge key={cj.name} variant="outline" className="text-[9px] sm:text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400">
                    {cj.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Pipelines */}
          {tier.pipelineCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Workflow className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-violet-500" />
                Crystallized Pipelines
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {tier.pipelineCount}+ pre-built, proven cross-module workflows ready to deploy
              </p>
            </div>
          )}

          {/* Templates */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-500" />
              Templates Included
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {tier.templateExamples.map((t, i) => (
                <Badge key={i} variant="secondary" className="text-[9px] sm:text-[10px]">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubstrateLicensing() {
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const handleCheckout = async (tier: 'creator' | 'architect') => {
    setCheckingOut(tier);
    try {
      const { data, error } = await supabase.functions.invoke('tier-checkout', {
        body: { tier },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');
      window.location.assign(data.url);
    } catch (err) {
      toast.error('Checkout failed', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
      setCheckingOut(null);
    }
  };

  const handleCta = (key: string) => {
    if (key === 'free') {
      window.location.href = '/start-here';
    } else if (key === 'creator' || key === 'architect') {
      handleCheckout(key);
    } else {
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=Enterprise%20Inquiry`;
    }
  };

  const formatPrice = (amount: number | null) => {
    if (amount === null) return 'Custom';
    if (amount === 0) return '$0';
    return `$${amount / 100}`;
  };

  return (
    <>
      <SEO
        title="Pricing | CMPSBL — Cognitive Infrastructure"
        description="Autonomous capabilities that predict, protect, and optimize. Free to start, Creator at $49/mo, Architect at $149/mo. See what you unlock at each tier."
        keywords={["CMPSBL pricing", "cognitive infrastructure", "AI substrate", "Creator tier", "Architect tier", "Crown Jewels"]}
      />

      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* ═══ Hero ═══ */}
        <section className="relative py-12 sm:py-16 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-primary/30">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 inline text-amber-500" />
                50+ Capabilities · 60 Pipelines · 200+ Templates
              </Badge>

              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Intelligence That Works While You Don't
                </span>
              </h1>

              <p className="text-base sm:text-xl text-muted-foreground mb-2 sm:mb-3">
                Autonomous capabilities that predict failures, prevent attacks, and optimize costs — <strong className="text-foreground">before you even ask</strong>.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground">
                See what you unlock at each tier, then choose your plan below.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ Benefits Showcase — What You Unlock ═══ */}
        <section className="py-10 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">What You Unlock at Each Tier</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Capabilities, crystallized pipelines, and templates — all included with your subscription.
              </p>
            </div>

            {/* Desktop: Grid, Mobile: Horizontal Scroll */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {TIERS.map((tier) => (
                <TierBenefitCard key={tier.key} tier={tier} />
              ))}
            </div>
            <div className="lg:hidden">
              <HorizontalScroll>
                {TIERS.map((tier) => (
                  <TierBenefitCard key={tier.key} tier={tier} />
                ))}
              </HorizontalScroll>
            </div>

            {/* Scarcity hint */}
            <p className="text-center text-[10px] sm:text-xs text-muted-foreground/60 mt-6 sm:mt-8 italic">
              Not all Crown Jewels are released to the public. Some capabilities remain internal to preserve system integrity.
            </p>
          </div>
        </section>

        {/* ═══ Stats Bar ═══ */}
        <section className="py-6 sm:py-8 border-y border-border/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 md:gap-16 text-center max-w-2xl sm:max-w-none mx-auto">
              {[
                { value: '50+', label: 'Capabilities' },
                { value: '60', label: 'Crystallized Pipelines' },
                { value: '21', label: 'Modules' },
                { value: '21', label: 'Crown Jewels' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Pricing Cards — Horizontal scroll on mobile ═══ */}
        <section className="py-10 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Simple, Unified Pricing</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                One subscription. Everything at that tier included. No engine add-ons, no SDK fees.
              </p>
            </div>

            {/* Desktop: Grid, Mobile: Horizontal Scroll */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {TIERS.map((meta) => (
                <PricingCard
                  key={meta.key}
                  meta={meta}
                  checkingOut={checkingOut}
                  onCta={handleCta}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
            <div className="lg:hidden">
              <HorizontalScroll>
                {TIERS.map((meta) => (
                  <PricingCard
                    key={meta.key}
                    meta={meta}
                    checkingOut={checkingOut}
                    onCta={handleCta}
                    formatPrice={formatPrice}
                  />
                ))}
              </HorizontalScroll>
            </div>
          </div>
        </section>

        {/* ═══ No Hidden Fees ═══ */}
        <section className="py-10 sm:py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">No Hidden Fees</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Every tier includes full access to capabilities, pipelines, and templates at that level.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {[
                { icon: Zap, title: 'Tiered Engine Access', desc: 'Free gets 30 core engines. Creator unlocks all 76 engines + 8 meta-engines. Architect adds 16 meta-engines. Enterprise gets all 24. Each tier includes everything from the tier below.' },
                { icon: Shield, title: 'SDK & API Bundled', desc: 'Full API access ships with Creator and above. No developer license required.' },
                { icon: Sparkles, title: 'Pipelines & Templates', desc: 'All crystallized pipelines and templates at your tier level. No per-item fees.' },
              ].map((item, i) => {
                const ItemIcon = item.icon;
                return (
                  <Card key={i} className="bg-card/50">
                    <CardContent className="p-4 sm:p-6 text-center">
                      <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                        <ItemIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="py-10 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Frequently Asked</h2>
            <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
              {[
                { q: 'What are Crown Jewels?', a: 'Crown Jewels are our highest-value capabilities — each one represents a breakthrough in autonomous intelligence that no competitor offers.' },
                { q: 'Are all engines available at every tier?', a: 'Free includes 30 core engines. Creator unlocks all 76 base engines plus 8 meta-engines. Architect includes everything in Creator plus 16 meta-engines. Enterprise includes everything in Architect plus all 24 meta-engines. The 9 recursive self-improvement meta-engines are CMPSBL-internal only.' },
                { q: 'What are crystallized pipelines?', a: 'Pipelines discovered by the Intent Mesh that proved valuable and were permanently saved as reusable cross-module workflows.' },
                { q: 'Do I need a separate developer license?', a: 'No. SDK and API access are included in Creator and Architect tiers.' },
                { q: 'Can I upgrade or downgrade anytime?', a: 'Yes. Changes take effect at the next billing cycle.' },
                { q: 'Is there a free trial?', a: 'The Free tier is permanently free with full building capabilities. Upgrade when you need autonomous intelligence.' },
              ].map((faq, i) => (
                <Card key={i} className="bg-card/50">
                  <CardContent className="p-4 sm:p-5">
                    <h3 className="font-semibold text-sm sm:text-base mb-1">{faq.q}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Contact ═══ */}
        <section className="py-10 sm:py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">Enterprise or Questions?</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Reach out for custom pricing, strategic partnerships, or research licensing.
              </p>
              <div className="flex flex-col gap-3 justify-center">
                <Button asChild size="lg" className="gap-2 w-full sm:w-auto sm:mx-auto">
                  <a href={`mailto:${CONTACT_EMAIL}`}>
                    <Mail className="w-4 h-4" />
                    {CONTACT_EMAIL}
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2 w-full sm:w-auto sm:mx-auto">
                  <a href={`tel:${CONTACT_PHONE.replace(/[^+\d]/g, '')}`}>
                    <Phone className="w-4 h-4" />
                    {CONTACT_PHONE}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </>
  );
}

// ── Pricing Card Component (mobile-first) ──
function PricingCard({
  meta,
  checkingOut,
  onCta,
  formatPrice,
}: {
  meta: typeof TIERS[number];
  checkingOut: string | null;
  onCta: (key: string) => void;
  formatPrice: (amount: number | null) => string;
}) {
  const tier = UNIFIED_TIERS[meta.key];
  const Icon = meta.icon;
  const price = formatPrice(tier.amount);
  const isLoading = checkingOut === meta.key;

  return (
    <div className="min-w-[260px] w-[80vw] max-w-[320px] sm:min-w-[300px] sm:max-w-none lg:min-w-0 snap-center flex-shrink-0 lg:flex-shrink lg:w-full">
      <Card className={`relative overflow-hidden transition-all hover:shadow-lg h-full ${
        meta.popular ? 'ring-2 ring-primary shadow-lg' : ''
      }`}>
        {meta.popular && (
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-bl-lg font-medium">
            Most Popular
          </div>
        )}
        <div className={`h-1.5 sm:h-2 bg-gradient-to-r ${meta.gradient}`} />
        <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r ${meta.gradient} flex items-center justify-center mb-3 sm:mb-4`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <CardTitle className="text-lg sm:text-xl">{tier.name}</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground min-h-[32px] sm:min-h-[40px]">
            {tier.tagline ?? tier.description}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-6 pt-0">
          <div>
            <span className="text-2xl sm:text-3xl font-bold">{price}</span>
            {tier.amount !== null && tier.amount > 0 && (
              <span className="text-muted-foreground text-xs sm:text-sm">/mo</span>
            )}
            {tier.amount === null && (
              <span className="text-muted-foreground text-xs sm:text-sm block">Contact us</span>
            )}
          </div>

          <ul className="space-y-1.5 sm:space-y-2">
            {tier.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-0.5 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            className="w-full gap-2 text-sm"
            variant={meta.popular ? 'default' : 'outline'}
            onClick={() => onCta(meta.key)}
            disabled={isLoading}
          >
            {isLoading ? 'Redirecting…' : meta.cta}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
