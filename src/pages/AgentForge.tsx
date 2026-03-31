/**
 * Agent Forge — /agent-forge
 * Dedicated landing page for the Agent Forge vertical pack.
 * Conversion-optimized: hero → primitives → before/after → CTA → trust signals.
 */

import { Shield, Network, Coins, User, Scale, ArrowRight, Zap, CheckCircle2, ExternalLink } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';
import { cn } from '@/lib/utils';

const PRIMITIVES = [
  {
    name: 'SENTINEL',
    icon: Shield,
    category: 'Defense',
    description: 'Behavioral threat detection, prompt injection defense, and adversarial input hardening.',
    capabilities: ['Input sanitization patterns', 'Prompt injection detection', 'Output validation chains'],
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  {
    name: 'SWARM',
    icon: Network,
    category: 'Coordination',
    description: 'Multi-agent coordination, task delegation, and consensus orchestration.',
    capabilities: ['Task delegation patterns', 'Agent communication protocols', 'Work distribution strategies'],
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    name: 'THRIFT',
    icon: Coins,
    category: 'Optimization',
    description: 'Cost-aware model routing, token budget management, and compute optimization.',
    capabilities: ['Token budget enforcement', 'Model routing optimization', 'Batch consolidation patterns'],
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    name: 'PERSONA',
    icon: User,
    category: 'Identity',
    description: 'Identity persistence, personality continuity across sessions, and behavioral consistency.',
    capabilities: ['Session state persistence', 'Personality vector extraction', 'Identity drift detection'],
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    name: 'ARBITER',
    icon: Scale,
    category: 'Arbitration',
    description: 'Conflict resolution between competing agent goals, priority negotiation, and deadlock prevention.',
    capabilities: ['Goal conflict detection', 'Priority negotiation protocols', 'Decision audit trails'],
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
];

const BEFORE_AFTER = [
  { before: 'Single-purpose agent', after: '5 specialized capabilities discovered' },
  { before: 'No defense layer', after: 'SENTINEL: prompt injection hardening' },
  { before: 'Solo execution only', after: 'SWARM: multi-agent coordination patterns' },
  { before: 'Unoptimized API costs', after: 'THRIFT: cost-aware model routing' },
  { before: 'Stateless between sessions', after: 'PERSONA: identity persistence layer' },
  { before: 'No conflict handling', after: 'ARBITER: goal arbitration protocols' },
];

export default function AgentForge() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const utmSource = searchParams.get('utm_source') || '';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Agent Forge — Discover 5 Capabilities Your Agent Already Has | CMPSBL"
        description="Upload your agent code. The 5-primitive Agent Forge discovers defense, coordination, cost optimization, identity, and arbitration capabilities — zero AI, pure structural discovery."
        canonical="https://cmpsbl.com/agent-forge"
        keywords={['AI agent capabilities', 'agent defense', 'multi-agent coordination', 'prompt injection defense', 'agent cost optimization', 'zero LLM discovery']}
        faq={[
          { question: 'What is Agent Forge?', answer: 'Agent Forge is a specialized 5-primitive discovery pass that finds defense, coordination, optimization, identity, and arbitration capabilities in your existing agent code.' },
          { question: 'Does Agent Forge use AI?', answer: 'No. Agent Forge uses pure structural discovery — deterministic collision between your code and 5 specialized primitives. Zero LLM involvement.' },
          { question: 'How does it work with Ascension?', answer: 'Agent Forge runs after the core 40-Primitive Ascension as an additional vertical pass. Discoveries stack on top of base Ascension results.' },
        ]}
      />

      <PublicNav />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
              Vertical Pack · Architect Tier
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight leading-tight">
            Turn Any Agent Into
            <br />
            <span className="text-primary">5 Production Specialists</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload your agent code. Five specialized primitives discover capabilities
            it already has — defense, coordination, cost optimization, identity persistence,
            and conflict arbitration. Zero AI. Pure structural discovery.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigate('/ascension')}
              className="gap-2 h-12 px-8 rounded-xl shadow-[0_0_20px_hsl(var(--primary)/0.2)] text-sm"
            >
              <Zap className="w-4 h-4" />
              Start Ascension + Agent Forge
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open('https://github.com/pfrodemn/cmpsbl-daily-drop', '_blank')}
              className="gap-2 h-12 px-6 rounded-xl text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Verify on GitHub
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ 5 PRIMITIVES ═══ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              5 Reserve Primitives
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
              Each primitive searches for a specific class of capabilities in your agent code.
              Discoveries stack on top of your base 40-Primitive Ascension results.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRIMITIVES.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.name}
                  className={cn(
                    "p-5 rounded-xl border bg-card/60 backdrop-blur-sm transition-all hover:-translate-y-0.5",
                    p.border,
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", p.bg)}>
                      <Icon className={cn("w-5 h-5", p.color)} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{p.name}</h3>
                      <span className="text-[10px] font-mono uppercase text-muted-foreground">{p.category}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {p.description}
                  </p>
                  <ul className="space-y-1.5">
                    {p.capabilities.map((cap) => (
                      <li key={cap} className="flex items-start gap-1.5 text-[11px] text-foreground/80">
                        <CheckCircle2 className={cn("w-3 h-3 mt-0.5 shrink-0", p.color)} />
                        <span className="break-words">{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            {/* "How it works" card fills the grid */}
            <div className="p-5 rounded-xl border border-border/20 bg-muted/10 flex flex-col justify-center items-center text-center">
              <Zap className="w-8 h-8 text-primary/50 mb-3" />
              <h3 className="font-bold text-sm text-foreground mb-1">Stacked Discovery</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[200px]">
                Agent Forge runs after the core 40-Primitive pass. Discoveries are additive — you get base + vertical capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BEFORE / AFTER ═══ */}
      <section className="py-16 sm:py-20 bg-muted/20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Before & After
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              What changes when you run your agent through Agent Forge
            </p>
          </div>

          <div className="space-y-3">
            {BEFORE_AFTER.map((row, i) => (
              <div
                key={i}
                className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl bg-card/60 border border-border/15"
              >
                <div className="flex-1 text-xs sm:text-sm text-muted-foreground line-through decoration-destructive/40">
                  {row.before}
                </div>
                <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 text-xs sm:text-sm text-foreground font-medium">
                  {row.after}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TRUST SIGNALS ═══ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
            Independently Verifiable
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: 'Zero AI', desc: 'Pure structural collision. No LLM, no generation, no hallucination.' },
              { title: 'Export Everything', desc: 'ZIP with source, runtime, tests, docs. Works if CMPSBL disappears.' },
              { title: 'Verify on GitHub', desc: 'cmpsbl-daily-drop repo — test exports independently.' },
            ].map((signal) => (
              <div
                key={signal.title}
                className="p-4 rounded-xl border border-border/15 bg-card/40"
              >
                <h3 className="font-bold text-sm text-foreground mb-1">{signal.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{signal.desc}</p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="mt-12">
            <Button
              size="lg"
              onClick={() => navigate('/ascension')}
              className="gap-2 h-14 px-10 rounded-xl shadow-[0_0_24px_hsl(var(--primary)/0.2)] text-base"
            >
              <Zap className="w-5 h-5" />
              Try Agent Forge Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Discovery is free on Builder tier. Export requires Architect ($249).
            </p>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
