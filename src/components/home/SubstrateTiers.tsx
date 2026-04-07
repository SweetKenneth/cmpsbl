/**
 * SubstrateTiers — 5-tier pricing with Layer 2 narrative
 * Free / Studio $29 / Creator $49 / Architect $79 / Enterprise $999
 * Positioned as the gateway to the Universal Software Adhesion Layer
 */

import { cn } from "@/lib/utils";
import { Check, ArrowRight, Shield, Zap, Globe, Building2, Layers, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface TierConfig {
  key: string;
  name: string;
  price: number; // cents, 0 = free
  tagline: string;
  description: string;
  verticals: string;
  icon: React.ElementType;
  features: string[];
  cta: string;
  ctaLink: string;
  accent: string;
  popular?: boolean;
}

const TIERS: TierConfig[] = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    tagline: 'The original substrate',
    description: 'All 40 core primitives. Basic Ascension — hardening, vulnerabilities, and defense. Free forever.',
    verticals: 'Core Substrate',
    icon: Shield,
    features: [
      'All 40 core primitives',
      'Basic Ascension (harden + secure)',
      'DREAM · EVOLUTION · ORACLE',
      'Enterprise-grade DEFENSE Layer',
      'Junkyard access (ranked 1–68)',
      'Showroom browse (curated drops)',
      'Marketplace browse (read-only)',
      'Free Memory Stream software',
    ],
    cta: 'Get Started Free',
    ctaLink: '/auth',
    accent: 'neon-green',
  },
  {
    key: 'studio',
    name: 'Studio',
    price: 2900,
    tagline: 'Business verticals unlocked',
    description: 'Health, Legal, FinTech, Education, Gaming, Media — SSO access to all business verticals.',
    verticals: 'Health · Legal · FinTech · Education · Gaming · Media',
    icon: Zap,
    features: [
      'Everything in Free, plus:',
      '6 Business Vertical substrates',
      'Full specialized Ascension',
      'Marketplace unlocked (shop + buy)',
      'Vertical-specific Showroom drops',
      'Memory Stream software per vertical',
      'SSO across all unlocked verticals',
      'Compounding value over time',
    ],
    cta: 'Subscribe — $29/mo',
    ctaLink: '/plans?tier=studio',
    accent: 'neon-cyan',
  },
  {
    key: 'creator',
    name: 'Creator',
    price: 4900,
    tagline: 'Technical verticals unlocked',
    description: 'Cyber, Robotics, LLM, Quantum, Bio — access to high-order engineering substrates.',
    verticals: 'Cyber · Robotics · LLM · Quantum · Bio',
    icon: Globe,
    features: [
      'Everything in Studio, plus:',
      '5+ Technical Vertical substrates',
      'All Business Verticals included',
      'Priority Ascension queue',
      'Advanced primitive configurations',
      'Trace & audit exports',
      'Cross-vertical synergy chains',
      'All compounding benefits stack',
    ],
    cta: 'Subscribe — $49/mo',
    ctaLink: '/plans?tier=creator',
    accent: 'primary',
    popular: true,
  },
  {
    key: 'architect',
    name: 'Architect',
    price: 7900,
    tagline: 'The Ultimate substrate',
    description: 'Every vertical. Every primitive. The full 143+ primitive matrix for any software type.',
    verticals: 'All Verticals + Ultimate (Any Software)',
    icon: Layers,
    features: [
      'Everything in Creator, plus:',
      'Ultimate Substrate (all types)',
      'All 143+ primitives unlocked',
      'Cross-vertical Memory Stream',
      'Full governance authority',
      'Curated mixed-domain software',
      'Compliance + audit exports',
      'Dedicated support channel',
    ],
    cta: 'Subscribe — $79/mo',
    ctaLink: '/plans?tier=architect',
    accent: 'neon-purple',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 99900,
    tagline: 'Your own Layer 2 deployment',
    description: 'White-label. Custom domain. Custom primitives. Your own infrastructure layer.',
    verticals: 'Custom Substrate · Custom Domain · White-Label',
    icon: Building2,
    features: [
      'Everything in Architect, plus:',
      'White-label deployment',
      'Custom domain',
      'Custom primitives built for you',
      'Dedicated Memory Stream',
      'Bespoke Ascension pipeline',
      'Custom Showroom & Marketplace',
      'SLA-backed support',
    ],
    cta: 'Contact Us',
    ctaLink: '/contact',
    accent: 'neon-amber',
  },
];

function PriceDisplay({ price }: { price: number }) {
  if (price === 0) {
    return (
      <div className="mb-4">
        <span className="text-4xl font-black text-foreground">Free</span>
        <span className="text-sm text-muted-foreground ml-2">forever</span>
      </div>
    );
  }
  return (
    <div className="mb-4">
      <span className="text-4xl font-black text-foreground">${price / 100}</span>
      <span className="text-sm text-muted-foreground">/mo</span>
    </div>
  );
}

export function SubstrateTiers() {
  return (
    <section className="py-20 border-t border-border/30 relative overflow-hidden" id="pricing">
      {/* Subtle Layer 2 background motif */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[hsl(var(--neon-cyan))] opacity-[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header with Layer 2 narrative */}
        <div className="max-w-3xl mx-auto text-center mb-6">
          <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/30">
            <Layers className="w-3 h-3 mr-1.5 inline" />
            Substrate Access Tiers
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            One Layer. Every Language. All Software.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto">
            Like SSL created a universal encryption layer for the internet, CMPSBL creates a universal
            governance layer for all software. Choose the verticals that match your industry —
            the substrate works the same everywhere.
          </p>
        </div>

        {/* Layer 2 differentiator callout */}
        <div className="max-w-2xl mx-auto mb-12 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-sm text-foreground/80">
            <span className="font-semibold text-primary">Layer 2 Technology</span> — wraps any codebase
            without modifying source. 54+ languages. Zero host cooperation required.
            <span className="text-muted-foreground ml-1">Patent Pending.</span>
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const isPopular = tier.popular;
            const isEnterprise = tier.key === 'enterprise';

            return (
              <div
                key={tier.key}
                className={cn(
                  "relative rounded-xl border p-5 transition-all duration-300 hover:scale-[1.01] flex flex-col",
                  isPopular
                    ? "bg-card/40 ring-2 ring-primary/20 border-primary/30"
                    : "bg-card/10 border-border/40",
                  isEnterprise && "border-[hsl(var(--neon-amber)/0.3)]"
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                {/* Tier icon & name */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    tier.accent === 'primary' ? "bg-primary/10" :
                    `bg-[hsl(var(--${tier.accent})/0.1)]`
                  )}>
                    <Icon className={cn(
                      "w-4 h-4",
                      tier.accent === 'primary' ? "text-primary" :
                      `text-[hsl(var(--${tier.accent}))]`
                    )} />
                  </div>
                  <span className="font-bold text-sm">{tier.name}</span>
                </div>

                <PriceDisplay price={tier.price} />

                <p className="text-xs text-muted-foreground mb-2 leading-relaxed font-medium">
                  {tier.tagline}
                </p>

                {/* Vertical access badge */}
                <div className="text-[10px] text-muted-foreground/70 mb-4 leading-relaxed border-t border-border/20 pt-2">
                  {tier.verticals}
                </div>

                {/* Features */}
                <ul className="space-y-1.5 mb-5 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className={cn(
                        "w-3 h-3 mt-0.5 shrink-0",
                        tier.accent === 'primary' ? "text-primary" :
                        `text-[hsl(var(--${tier.accent}))]`
                      )} />
                      <span className="text-[11px] text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  asChild
                  variant={isPopular ? "default" : "outline"}
                  size="sm"
                  className="w-full rounded-lg font-semibold text-xs"
                >
                  <Link to={tier.ctaLink}>
                    {tier.cta}
                    <ArrowRight className="w-3 h-3 ml-1.5" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Compounding value + lock-in messaging */}
        <div className="max-w-4xl mx-auto mt-12 grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border/30 p-4 text-center">
            <Zap className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-sm font-semibold mb-1">Compounding Value</div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              New software drops every 4 hours across all your unlocked verticals. The longer you stay, the more is revealed.
            </p>
          </div>
          <div className="rounded-xl border border-border/30 p-4 text-center">
            <Lock className="w-5 h-5 text-[hsl(var(--neon-amber))] mx-auto mb-2" />
            <div className="text-sm font-semibold mb-1">Your Collection Persists</div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Everything you collect is yours. If you pause, future drops become read-only — but you keep what you earned.
            </p>
          </div>
          <div className="rounded-xl border border-border/30 p-4 text-center">
            <Layers className="w-5 h-5 text-[hsl(var(--neon-cyan))] mx-auto mb-2" />
            <div className="text-sm font-semibold mb-1">One Layer. Universal.</div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The same Layer 2 technology powers every vertical. Build on it. Extend it. Let others build on your layer.
            </p>
          </div>
        </div>

        {/* Developer flywheel */}
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Developers:</span> All{' '}
            <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">@cmpsbl/*</code>{' '}
            npm packages are <span className="font-semibold text-primary">free forever</span>.
            No sign-up needed. Build on the substrate with zero restrictions.
          </p>
        </div>
      </div>
    </section>
  );
}
