/**
 * Evolution Mesh — Product Landing Page
 * Standalone product page for the Evolution Mesh SDK.
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Shield, Zap, Brain, GitCompare, Lock, Activity, ArrowRight, Check, Terminal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const FEATURES = [
  {
    icon: Shield,
    title: 'Immune Wrapping',
    description: 'Wrap any async function. Inputs validated, sanitized, and repaired automatically before execution.',
  },
  {
    icon: Zap,
    title: '29+ Repair Strategies',
    description: 'Deterministic, non-AI repairs: XSS stripping, SQL sanitization, type coercion, prototype pollution guard, and more.',
  },
  {
    icon: Brain,
    title: 'Self-Learning Rules',
    description: 'Successful repairs become rules that propagate across functions. Your system learns from every failure.',
  },
  {
    icon: GitCompare,
    title: 'Shadow Mode',
    description: 'Test changes against real traffic without risk. Compare baseline vs candidate. Promote only what passes.',
  },
  {
    icon: Lock,
    title: 'Archetype Classification',
    description: 'Inputs classified as injection attempts, empty shells, type mismatches — each handled differently.',
  },
  {
    icon: Activity,
    title: 'SaaS Dashboard',
    description: 'Real-time health, repair analytics, learning curves, and alert feeds. See your system evolve.',
  },
];

const TIERS = [
  {
    name: 'Open Source',
    price: '$0',
    period: 'forever',
    features: ['5 wrapped functions', 'Local telemetry only', 'CLI dashboard', 'Community support'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: ['50 wrapped functions', '30-day telemetry retention', 'Full SaaS dashboard', 'Email support', 'Cross-function learning'],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$99',
    period: '/month',
    features: ['250 wrapped functions', '90-day retention', 'SSO + team access', 'Priority support', 'Custom repair strategies'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function EvolutionMeshLanding() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlist = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    setSubmitting(true);
    try {
      // Store in brain_events as a lightweight waitlist tracker
      const { error } = await supabase.from('brain_events').insert({
        event_type: 'evolution_mesh_waitlist',
        source_operation: 'waitlist_signup',
        module: 'evolution-mesh',
        data: { email },
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("You're on the list!");
    } catch {
      toast.error('Failed to join waitlist. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Evolution Mesh — Self-Learning Immune System for Your Software</title>
        <meta name="description" content="Drop-in resilience layer that wraps your functions with immune defense, auto-repair, shadow testing, and self-learning rules. Framework-agnostic SDK for any JS/TS project." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-32 sm:pb-24">
            <div className="text-center space-y-6">
              <Badge variant="outline" className="text-xs tracking-wider border-primary/30 text-primary">
                FRAMEWORK-AGNOSTIC SDK
              </Badge>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                Your code's<br />
                <span className="text-primary">immune system.</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Drop it in. Wrap your functions. Your software evolves its own defenses.
                29+ repair strategies. Self-learning rules. Zero AI dependency.
              </p>

              {/* Code snippet */}
              <div className="max-w-lg mx-auto">
                <Card className="bg-foreground/[0.03] border-border/50 p-4 text-left font-mono text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>npm install @cmpsbl/evolution-mesh</span>
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p><span className="text-primary">import</span> {'{ wrap, defineSchema }'} <span className="text-primary">from</span> <span className="text-muted-foreground">'@cmpsbl/evolution-mesh'</span>;</p>
                    <p className="text-muted-foreground/60 mt-2">// One line. Every function protected.</p>
                    <p><span className="text-primary">const</span> safe = <span className="text-accent-foreground">wrap</span>(myHandler, {'{'}</p>
                    <p className="pl-4">schema: <span className="text-accent-foreground">defineSchema</span>({'{'} email: {'{'} type: <span className="text-muted-foreground">'string'</span>, required: <span className="text-primary">true</span> {'}'} {'}'})</p>
                    <p>{'}'});</p>
                  </div>
                </Card>
              </div>

              {/* Waitlist */}
              {!submitted ? (
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleWaitlist()}
                  />
                  <Button onClick={handleWaitlist} disabled={submitting} className="gap-2">
                    {submitting ? 'Joining...' : 'Join Waitlist'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-primary pt-4">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">You're on the list. We'll be in touch.</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">What it does</h2>
            <p className="text-muted-foreground mt-2">
              One package. Complete resilience.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-6 space-y-3 border-border/50 hover:border-primary/30 transition-colors">
                <f.icon className="w-8 h-8 text-primary" />
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-muted/30 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Wrap', desc: 'Wrap any async function with a single call. Define optional schemas.' },
                { step: '02', title: 'Protect', desc: 'Inputs validated, classified, and repaired automatically. Garbage rejected safely.' },
                { step: '03', title: 'Learn', desc: 'Successful repairs become rules. Rules propagate across functions.' },
                { step: '04', title: 'Evolve', desc: 'Shadow test changes. Promote only what passes. Your system gets smarter.' },
              ].map((s) => (
                <div key={s.step} className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center mx-auto">
                    {s.step}
                  </div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={`p-6 space-y-4 ${tier.highlighted ? 'border-primary ring-1 ring-primary/20' : 'border-border/50'}`}
              >
                {tier.highlighted && (
                  <Badge className="text-xs">Most Popular</Badge>
                )}
                <div>
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-black">{tier.price}</span>
                    <span className="text-muted-foreground text-sm">{tier.period}</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.highlighted ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => {
                    if (!submitted) {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  {tier.cta}
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="bg-primary/5 py-16">
          <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
            <h2 className="text-2xl font-bold">Software that defends itself.</h2>
            <p className="text-muted-foreground">
              Stop bolting resilience on after things break. Start with an immune system.
            </p>
            <Button
              size="lg"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Join the Waitlist
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
