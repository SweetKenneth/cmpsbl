/**
 * Unified Pricing Page — Free / Creator / Architect / Enterprise
 * One subscription unlocks everything in that tier. No add-ons.
 */

import { useState } from "react";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UNIFIED_TIERS, CONTACT_EMAIL, CONTACT_PHONE } from "@/config/licensing-products";
import {
  Brain, Shield, Zap, CheckCircle2, ArrowRight, Mail, Phone,
  Building2, Sparkles, Crown, Layers
} from "lucide-react";

const TIER_META = [
  {
    key: 'free' as const,
    icon: Layers,
    gradient: 'from-slate-500 to-zinc-500',
    cta: 'Get Started Free',
    popular: false,
  },
  {
    key: 'creator' as const,
    icon: Sparkles,
    gradient: 'from-blue-500 to-cyan-500',
    cta: 'Subscribe — $49/mo',
    popular: true,
  },
  {
    key: 'architect' as const,
    icon: Crown,
    gradient: 'from-violet-500 to-purple-500',
    cta: 'Subscribe — $149/mo',
    popular: false,
  },
  {
    key: 'enterprise' as const,
    icon: Building2,
    gradient: 'from-amber-500 to-orange-500',
    cta: 'Contact Sales',
    popular: false,
  },
];

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
        description="Simple, unified pricing. Free to start, Creator at $49/mo, Architect at $149/mo. One subscription unlocks everything — no hidden fees or add-ons."
        keywords={["CMPSBL pricing", "cognitive infrastructure", "AI substrate", "Creator tier", "Architect tier"]}
      />

      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 px-4 py-2 text-sm border-primary/30">
                <Brain className="w-4 h-4 mr-2 inline" />
                Simple, Unified Pricing
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  One Plan. Everything Included.
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-4">
                No separate engine fees. No SDK add-ons. No surprise charges.
              </p>
              <p className="text-lg text-muted-foreground">
                Pick your tier and unlock <strong className="text-foreground">all</strong> substrate capabilities at that level.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {TIER_META.map((meta) => {
                const tier = UNIFIED_TIERS[meta.key];
                const Icon = meta.icon;
                const price = formatPrice(tier.amount);
                const isLoading = checkingOut === meta.key;

                return (
                  <Card
                    key={meta.key}
                    className={`relative overflow-hidden transition-all hover:shadow-lg ${
                      meta.popular ? 'ring-2 ring-primary shadow-lg' : ''
                    }`}
                  >
                    {meta.popular && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
                        Most Popular
                      </div>
                    )}
                    <div className={`h-2 bg-gradient-to-r ${meta.gradient}`} />
                    <CardHeader className="pb-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${meta.gradient} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{tier.name}</CardTitle>
                      <CardDescription className="text-sm min-h-[40px]">
                        {tier.tagline ?? tier.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div>
                        <span className="text-3xl font-bold">{price}</span>
                        {tier.amount !== null && tier.amount > 0 && (
                          <span className="text-muted-foreground text-sm">/mo</span>
                        )}
                        {tier.amount === null && (
                          <span className="text-muted-foreground text-sm block">Contact us</span>
                        )}
                      </div>

                      <ul className="space-y-2.5">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        className="w-full gap-2"
                        variant={meta.popular ? 'default' : 'outline'}
                        onClick={() => handleCta(meta.key)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Redirecting…' : meta.cta}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* No Hidden Fees */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">No Hidden Fees</h2>
              <p className="text-muted-foreground">
                Every tier includes full access to the capabilities at that level. No engine add-ons, no SDK licensing fees, no per-seat surprises.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Zap, title: 'All Engines Included', desc: 'Every engine and meta-engine at your tier level — no separate subscription.' },
                { icon: Shield, title: 'SDK & API Bundled', desc: 'Full API access ships with Creator and above. No developer license required.' },
                { icon: Sparkles, title: 'Templates & Marketplace', desc: 'All marketplace items and templates included at Creator+. No per-item fees.' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <Card key={i} className="bg-card/50">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked</h2>
            <div className="max-w-2xl mx-auto space-y-6">
              {[
                { q: 'Do I need a separate developer license?', a: 'No. SDK and API access are included in Creator and Architect tiers.' },
                { q: 'Are engines billed separately?', a: 'No. All engines at your tier level are included in your subscription.' },
                { q: 'Can I upgrade or downgrade anytime?', a: 'Yes. Changes take effect at the next billing cycle.' },
                { q: 'What\'s the difference between Creator and Architect?', a: 'Creator includes 7 Experience Jewels and single-project scope. Architect adds CLM, cross-project learning, all 28 Jewels, and team seats.' },
                { q: 'Is there a free trial?', a: 'The Free tier is permanently free with full building capabilities. Upgrade when you need advanced features.' },
              ].map((faq, i) => (
                <Card key={i} className="bg-card/50">
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-1">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center space-y-4">
              <h2 className="text-2xl font-bold">Enterprise or Questions?</h2>
              <p className="text-muted-foreground">
                Reach out for custom pricing, strategic partnerships, or research licensing.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <a href={`mailto:${CONTACT_EMAIL}`}>
                    <Mail className="w-4 h-4" />
                    {CONTACT_EMAIL}
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
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
