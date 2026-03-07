/**
 * Unified Pricing Page — Adoptable Pricing, Benefits-First Layout
 * 
 * Structure:
 *   1. Hero — Value proposition
 *   2. Benefits Showcase — What you get at each tier
 *   3. Pricing Cards — Horizontal scroll on mobile
 *   4. Black-Box Notice
 *   5. FAQ + Contact
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
  Brain, Shield, Zap, CheckCircle2, ArrowRight, Mail, Phone,
  Building2, Sparkles, Crown, Layers, Star, Workflow, FileText,
  ChevronLeft, ChevronRight, Lock, Gem, XCircle, Bell,
} from "lucide-react";

// ── Tier visual config ──
// ── Memory Stream daily crystallization limits per tier ──
const MEMORY_STREAM_LIMITS: Record<string, string> = {
  free: '3 crystallizations / day',
  studio: '6 crystallizations / day',
  creator: '9 crystallizations / day',
  architect: '12 crystallizations / day',
};

const TIERS = [
  {
    key: 'free' as const,
    icon: Layers,
    gradient: 'from-slate-500 to-zinc-500',
    bgGlow: 'bg-slate-500/5',
    cta: 'Get Started Free',
    popular: false,
    headline: 'Build Real Things — Zero Cost',
    benefitSummary: 'Core templates, starter artifacts, bounded persistent memory, and shared runtime. Not a trial — a permanent tier for learning and prototyping.',
    capabilityHighlights: [
      'Artifact Store access (Free catalog)',
      'Core templates (starter pack)',
      'Basic capabilities (read + compose)',
      'Limited persistent memory',
      'Basic pipelines & missions',
      'Dashboard + Terminal (Free mode)',
      'Composable orchestration pipelines',
    ],
    doesNotInclude: [
      'High-power automation',
      'Advanced orchestration',
      'Self-improvement loops',
    ],
  },
  {
    key: 'creator' as const,
    icon: Sparkles,
    gradient: 'from-blue-500 to-cyan-500',
    bgGlow: 'bg-blue-500/5',
    cta: 'Join Waitlist',
    popular: true,
    headline: 'Everything in Free + Real Power',
    benefitSummary: 'Expanded catalog, executable capabilities, private memory, multi-module synergy, and light automation. A real upgrade you can feel.',
    capabilityHighlights: [
      'Expanded Artifact Store (Creator catalog)',
      'Higher-quality templates',
      'Executable capabilities',
      'Multi-module synergy pipelines',
      '28 crystallized Crown Jewel pipelines',
      'Stronger persistent memory',
      'Higher Nexus quotas + better routing',
      'Scheduled tasks + simple automations',
    ],
    doesNotInclude: [
      'Black-Box Crown Jewels',
      'Full recursive self-improvement',
      'Direct module invocation',
    ],
  },
  {
    key: 'architect' as const,
    icon: Crown,
    gradient: 'from-violet-500 to-purple-500',
    bgGlow: 'bg-violet-500/5',
    cta: 'Join Waitlist',
    popular: false,
    headline: 'Everything in Creator + Depth',
    benefitSummary: 'Premium artifacts, cross-module orchestration, larger memory domains, batch execution, audit views, reasoning summaries, and priority routing.',
    capabilityHighlights: [
      'Premium Artifact Store (Architect catalog)',
      'Cross-module orchestration',
      'Larger memory + project domains',
      '64 crystallized Crown Jewel pipelines',
      'Higher automation + batch execution',
      'Audit views + change summaries',
      'Reasoning summaries',
      'Priority Nexus routing + fallback',
    ],
    doesNotInclude: [
      'Crown Jewels that expose the moat',
      'Internal module execution access',
    ],
  },
  {
    key: 'enterprise' as const,
    icon: Building2,
    gradient: 'from-amber-500 to-orange-500',
    bgGlow: 'bg-amber-500/5',
    cta: 'Join Waitlist',
    popular: false,
    headline: 'Everything in Architect + Governance',
    benefitSummary: 'Organization workspaces, compliance exports, advanced governance policies, dedicated memory partitions, and SLA-aware routing controls.',
    capabilityHighlights: [
      'Org workspaces + roles',
      'Higher execution ceilings',
      'Compliance + audit exports',
      'Advanced governance policies',
      'Dedicated memory partitions',
      '80 crystallized Crown Jewel pipelines',
      'SLA-aware Nexus controls',
      'Provider budget pinning',
      'Dedicated support channel',
    ],
    doesNotInclude: [
      'CMPSBL-internal Crown Jewels',
      'Recursive improvement internals',
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
  const Icon = tier.icon;

  return (
    <div className="min-w-[280px] w-[85vw] max-w-[340px] sm:min-w-[320px] sm:max-w-none lg:min-w-0 snap-center flex-shrink-0 lg:flex-shrink lg:w-full">
      <Card className={`h-full relative overflow-hidden ${tier.bgGlow} border-border/50`}>
        <div className={`h-1.5 bg-gradient-to-r ${tier.gradient}`} />
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Memory Stream limit */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
            <Workflow className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold text-primary">{MEMORY_STREAM_LIMITS[tier.key]}</span>
          </div>
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

          {/* What You Get */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
              What You Get
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

          {/* What's Not Included */}
          {tier.doesNotInclude && tier.doesNotInclude.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/60" />
                Not Included
              </div>
              <ul className="space-y-1">
                {tier.doesNotInclude.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                    <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground/60">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubstrateLicensing() {
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistTier, setWaitlistTier] = useState<string | null>(null);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState<Set<string>>(new Set());

  // Handle tier subscription
  const handleWaitlist = async (tier: string) => {
    if (!waitlistEmail) {
      setWaitlistTier(tier);
      return;
    }
    
    setCheckingOut(tier);
    try {
      await supabase.from('brain_events').insert({
        event_type: 'tier_waitlist',
        module: 'pricing',
        data: { email: waitlistEmail, tier },
        source_operation: 'pricing_waitlist',
      });
      setWaitlistSubmitted(prev => new Set(prev).add(tier));
      toast.success(`You're on the ${tier} waitlist!`, {
        description: 'We\'ll notify you when subscriptions launch.',
      });
      setWaitlistTier(null);
      setWaitlistEmail('');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setCheckingOut(null);
    }
  };

  const handleCta = (key: string) => {
    if (key === 'free') {
      window.location.href = '/start-here';
    } else {
      handleWaitlist(key);
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
        description="AI products and platform tiers available now. Composable Cognitives, Persistent Memory, and more — powered by the CMPSBL Substrate."
        keywords={["CMPSBL pricing", "cognitive infrastructure", "AI agents", "composable cognitives", "persistent memory"]}
        faq={[
          { question: 'What can I buy today?', answer: 'Composable Cognitives (downloadable AI agents) and Persistent Memory (free SDK) are available now. Platform subscription tiers launch soon.' },
          { question: 'Is the free tier actually useful?', answer: 'Yes. Free users can build projects, run capabilities, use templates, and save outputs. It\'s not a trial — it\'s a permanent tier.' },
          { question: 'When do platform subscriptions launch?', answer: 'Soon. Join the waitlist on any tier to be notified the moment we go live.' },
          { question: 'What are Crown Jewels?', answer: 'Our highest-value sealed capabilities. Some will be available at paid tiers. Others remain internal to preserve system integrity.' },
        ]}
        product={{
          name: 'Composable Cognitives',
          price: '39',
          currency: 'USD',
          availability: 'InStock',
        }}
      />

      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* ═══ Hero ═══ */}
        <section className="relative py-12 sm:py-16 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-primary/30">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 inline text-primary" />
                Standalone Products & Platform Tiers Available Now
              </Badge>

              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Look What We Built.
                </span>
                <br />
                <span className="text-muted-foreground text-2xl sm:text-3xl md:text-4xl">
                  Then Imagine Building With It.
                </span>
              </h1>

              <p className="text-base sm:text-xl text-muted-foreground mb-2 sm:mb-3">
                Standalone products and platform tiers powered by the CMPSBL Substrate.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground">
                Start free. Explore what's possible. Upgrade when you're ready.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ Available Now — Standalone Products ═══ */}
        <section className="py-10 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Available Now</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Standalone products powered by the CMPSBL Substrate. Buy once, own forever.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {[
                { 
                  title: 'Composable Cognitives',
                  desc: 'Download superpowered AI agents. Own them. Run them anywhere.',
                  price: 'From $39',
                  href: '/composable-cognitives',
                  icon: Zap,
                  badge: 'SHIPPING',
                },
                {
                  title: 'Persistent Memory',
                  desc: 'Add memory to any agent in under an hour. Free SDK.',
                  price: 'Free',
                  href: '/persistent-memory',
                  icon: Brain,
                  badge: 'FREE',
                },
                {
                  title: 'Cognitive Showcase',
                  desc: 'Live proof-of-capability demonstrations. See the substrate in action.',
                  price: 'Free',
                  href: '/showcase',
                  icon: Sparkles,
                  badge: 'LIVE',
                },
              ].map((product, i) => {
                const ProductIcon = product.icon;
                return (
                  <Card key={i} className="bg-card hover:shadow-lg transition-shadow">
                    <CardContent className="p-5 sm:p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ProductIcon className="w-5 h-5 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-[10px]">{product.badge}</Badge>
                      </div>
                      <h3 className="font-bold text-base">{product.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{product.desc}</p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-semibold text-sm">{product.price}</span>
                        <Button asChild size="sm" variant="outline" className="gap-1.5">
                          <a href={product.href}>
                            Explore <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ Platform Tiers ═══ */}
        <section className="py-10 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-10">
              <Badge variant="outline" className="mb-4 text-xs border-primary/20">
                <Sparkles className="w-3 h-3 mr-1.5 inline" />
                Platform Tiers
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Platform Tiers</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Build ON the substrate. Free tier is permanent — not a trial. Paid tiers unlock depth, not basics.
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

            {/* Crown Jewels notice */}
            <p className="text-center text-[10px] sm:text-xs text-muted-foreground/60 mt-6 sm:mt-8 italic">
              Not all Crown Jewels are released to the public. Some capabilities remain internal to preserve system integrity.
            </p>
          </div>
        </section>

        {/* ═══ Pricing Cards — Horizontal scroll on mobile ═══ */}
        <section className="py-10 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Simple, Fair Pricing</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                One subscription. Everything at that tier included. No surprise fees.
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

        {/* ═══ Builder Isolation ═══ */}
        <section className="py-10 sm:py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Builder Isolation</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                You compose intelligence. You don't control the engine.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {[
                { icon: Shield, title: 'Capability-Scoped Tokens', desc: 'Every run is scoped to your tier, project, and capability. No cross-project bleed.' },
                { icon: Lock, title: 'Per-Project Namespaces', desc: 'Hard isolation between projects. No memory leaks across boundaries.' },
                { icon: Zap, title: 'Governor-Enforced Boundaries', desc: 'All runs pass policy checks. Internal modules are never directly invocable.' },
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
                { q: 'Is the free tier actually useful?', a: 'Yes. Free users can build projects, run capabilities, use templates, and save outputs. It\'s not a trial — it\'s a permanent tier for learning and prototyping.' },
                { q: 'What are Crown Jewels?', a: 'Our highest-value sealed capabilities. Some are available at paid tiers. Others remain internal to preserve system integrity. You experience the power — you don\'t see the blueprint.' },
                { q: 'What\'s the difference between Creator and Architect?', a: 'Creator ($29/mo) adds executable capabilities, private memory, and light automation. Architect ($79/mo) adds cross-module orchestration, batch execution, audit views, and priority routing. Most serious builders land at Architect.' },
                { q: 'Can I upgrade or downgrade anytime?', a: 'Yes. Changes take effect at the next billing cycle.' },
                { q: 'What does "Builder Isolation" mean?', a: 'Your projects run ON the Substrate through templates, capabilities, and pipelines. You never have direct access to internal systems like CLM, CORTEX, or GOVERNOR. This protects both you and the platform.' },
                { q: 'Is there a custom Enterprise option?', a: 'Yes. For dedicated instances, custom compliance, or SOC2 requirements, contact Dev@CMPSBL.com for custom pricing.' },
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
              <h2 className="text-xl sm:text-2xl font-bold">Custom Enterprise or Questions?</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Reach out for dedicated instances, strategic partnerships, or custom compliance.
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
          {/* Memory Stream limit badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
            <Workflow className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold text-primary">{MEMORY_STREAM_LIMITS[meta.key]}</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold">{price}</span>
            {tier.amount !== null && tier.amount > 0 && (
              <span className="text-muted-foreground text-xs sm:text-sm">/mo</span>
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
            variant={meta.key === 'free' ? 'default' : 'outline'}
            onClick={() => onCta(meta.key)}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting…' : meta.cta}
            {meta.key === 'free' ? <ArrowRight className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
