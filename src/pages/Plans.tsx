/**
 * Plans — Free + Pro. Clean two-tier pricing.
 * v19.1: collapsed from 4-tier; Crown Jewel section removed (now silent CLI/SDK bonus).
 */
import { SEO } from '@/components/SEO';
import { StructuredData } from '@/components/seo/StructuredData';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { PageSEOBlock } from '@/components/seo/PageSEOBlock';
import { PublicBreadcrumb } from '@/components/navigation/PublicBreadcrumb';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    tagline: 'Everything you need to start.',
    cta: { label: 'Get Started', href: '/auth' },
    highlighted: false,
    features: [
      'Ascension v2 — 5 runs/day',
      'Polyglot export — 2 languages (JS + Python)',
      '1 Mana layer per export',
      '@cmpsbl/cli — full developer terminal',
      '@cmpsbl/sdk — build your own layers (soon)',
      'DECODE unified interface',
      'Crown Jewel system bonuses (bundled)',
      'CMPSBL Radio — usage-capped',
      'Verify any fingerprint at /verify',
      'Audit chain — last 10 receipts',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    cadence: 'per month',
    tagline: 'Unlimited Ascension. All 9 languages. DREAM unlocked.',
    cta: { label: 'Upgrade to Pro', href: '/auth?plan=pro' },
    highlighted: true,
    features: [
      'Everything in Free, no rate limits',
      'Ascension v2 — unlimited runs',
      'Polyglot export — all 9 languages (TS · Py · Go · Rust · Java · C# · Ruby · PHP · Swift)',
      'Unlimited Mana layer attachment per export',
      'DREAM synthesis — sub-threshold pattern surfacing',
      'Priority restoration queue',
      'Unlimited /verify API calls',
      'Full Merkle audit chain export',
      'Monthly Store credit toward Layers / Meta Engines',
      'CMPSBL Radio — unlimited',
      'Founder-direct email support',
    ],
  },
] as const;

export default function Plans() {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 gradient-mesh opacity-60" />
        <div className="absolute top-40 left-1/4 w-[500px] h-[500px] rounded-full animate-hero-orb-1" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 60%)" }} />
        <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] rounded-full animate-hero-orb-3" style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.03) 0%, transparent 60%)" }} />
      </div>

      <SEO
        title="Plans — Free or Pro | CMPSBL"
        description="Two plans. Free forever with Ascension v2, CLI, SDK and DECODE. Pro at $29/mo unlocks unlimited Ascension, DREAM synthesis, priority queue and Store credits."
        canonical="https://cmpsbl.com/plans"
        image="https://cmpsbl.com/og/plans.jpg"
      />
      <StructuredData
        type="product"
        data={{
          name: "CMPSBL Subscription Plans",
          description: "Free and Pro plans for Ascension v2, the CMPSBL CLI, and SDK.",
          url: "https://cmpsbl.com/plans",
          price: "0",
          category: "Software",
        }}
      />
      <StructuredData
        type="breadcrumb"
        data={{ items: [
          { name: "Home", url: "https://cmpsbl.com" },
          { name: "Plans", url: "https://cmpsbl.com/plans" },
        ]}}
      />

      <PublicNav />

      <main className="pt-28 sm:pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-4 mb-6">
          <PublicBreadcrumb />
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Zap className="w-3.5 h-3.5" />
            Plans
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3">
            Start free.
            <br />
            <span className="bg-gradient-to-r from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-purple))] bg-clip-text text-transparent">
              Go Pro when you're ready.
            </span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
            One product: Ascension v2. Two ways to use it.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid sm:grid-cols-2 gap-6">
            {PLANS.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: plan.id === 'pro' ? 0.1 : 0 }}
                className={cn(
                  "relative rounded-2xl border p-6 sm:p-8 transition-all duration-300",
                  plan.highlighted
                    ? "border-primary/40 bg-gradient-to-b from-card to-card/60 ring-2 ring-primary/20 shadow-xl shadow-primary/10"
                    : "border-border/40 bg-card/40"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    Recommended
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                </div>

                <div className="mb-6 flex items-baseline gap-1.5">
                  <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.cadence}</span>
                </div>

                <ul className="space-y-3 mb-7">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className={cn(
                        "w-4 h-4 mt-0.5 shrink-0",
                        plan.highlighted ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className="text-sm text-foreground/90 leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={plan.highlighted ? "default" : "outline"}
                  size="lg"
                  className="w-full rounded-xl font-semibold"
                >
                  <Link to={plan.cta.href}>
                    {plan.cta.label}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Enterprise — quiet footer link */}
          <div className="mt-10 text-center">
            <p className="text-xs text-muted-foreground">
              Need custom infrastructure or a private deployment?{' '}
              <Link to="/contact" className="text-primary hover:underline font-medium">
                Contact us about Enterprise →
              </Link>
            </p>
          </div>
        </div>
      </main>

      <PageSEOBlock path="/plans" title="Plans & Pricing" faq={[
        { question: "Is there a free tier for CMPSBL?", answer: "Yes. The Free plan is forever and includes Ascension v2 (rate-limited), the @cmpsbl/cli, the upcoming @cmpsbl/sdk, DECODE, and Crown Jewel system bonuses." },
        { question: "What does Pro unlock?", answer: "Pro is $29/mo and unlocks unlimited Ascension v2, full 9-language export, SDK layer attachment, DREAM synthesis, priority queue, and Store credits." },
        { question: "Where do I buy add-on layers?", answer: "All add-on Layers, Meta Engines, and Meta Agents are sold in /store. Layers attach to Ascension v2 in Step 2 (Enhance)." },
        { question: "Is enterprise available?", answer: "Yes — by contract. Reach out via /contact to discuss custom deployments, white-label, and private infrastructure." },
      ]} />

      <EnhancedFooter />
    </div>
  );
}
