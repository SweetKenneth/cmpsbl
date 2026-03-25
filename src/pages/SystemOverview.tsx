/**
 * System Overview — Unified investor/user/public page
 * 40-primitive cognitive substrate overview
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Zap, Brain, Layers, Shield, Cpu, 
  Sparkles, Code2, CircuitBoard, Eye, Clock, 
  TrendingUp, Users, Check, ChevronRight, Globe
} from 'lucide-react';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

function Hero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 px-6">
      <div className="absolute inset-0 bg-[var(--gradient-mesh)]" />
      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-sm font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
            CMPSBL® — Cognitive Infrastructure
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-6">
            From <span className="text-primary">Memory</span> to{' '}
            <span className="text-primary">Silicon</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
            An autonomous cognitive substrate that captures ideas, crystallizes them into production-grade software, 
            and crosses the silicon boundary into hardware — all governed by a self-evolving 40-primitive intelligence layer.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/foundry/demo" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
              Explore the Memory Stream <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/store?tab=plans" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-secondary transition-colors">
              View Plans
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function WhatIs() {
  return (
    <section className="py-20 px-6 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">What is CMPSBL?</h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
            CMPSBL is a <strong className="text-foreground">cognitive operating substrate</strong> — a 40-primitive intelligence architecture 
            composed of agents, engines, layers, and organs that processes signals, forms memories, and autonomously produces real software. It's not a chatbot. It's not a code generator. 
            It's an always-running system that <em>discovers</em> software the way a research lab discovers compounds.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              { icon: Brain, title: '40 Active Primitives', desc: 'CORE, NEXUS, MEMORY, DEFENSE, DECODE, BRAIN, ATLAS, ENGINEER, and 32 more — each with distinct responsibilities across agents, engines, layers & organs.' },
              { icon: Layers, title: '675+ Capabilities', desc: 'From natural language understanding to threat detection, each capability is runtime-addressable via the unified API.' },
              { icon: Shield, title: 'Self-Governing', desc: 'Governance is built in. NERVE enforces compliance. DEFENSE isolates threats. EVOLUTION adapts safely within policy boundaries.' },
            ].map((item, i) => (
              <motion.div key={item.title} variants={fadeUp} custom={i + 1} className="p-6 rounded-xl border border-border bg-card">
                <item.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MemoryStreamSection() {
  const phases = [
    { icon: Eye, label: 'Signal Capture', desc: 'The substrate observes inputs, conversations, and environmental data continuously.', color: 'text-sky-500' },
    { icon: Brain, label: 'Memory Formation', desc: 'Signals are compressed into persistent memory traces across isolated namespaces.', color: 'text-neon-amber' },
    { icon: Sparkles, label: 'Crystallization', desc: 'The autonomous engine discovers viable software patterns and scores them (CJPI 68–100).', color: 'text-primary' },
    { icon: Code2, label: 'Software Export', desc: 'Crystallized memories export to 20+ languages with the CMPSBL® Mini-Runtime™ Engine and test harness.', color: 'text-neon-green' },
    { icon: CircuitBoard, label: 'Silicon Boundary', desc: 'Apex-tier memories (CJPI ≥ 94) unlock hardware description languages: Verilog, VHDL, SPICE.', color: 'text-neon-purple' },
  ];

  return (
    <section className="py-20 px-6 bg-secondary/30 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">The Memory Stream</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mb-12">
            A continuous substrate of evolving software systems. Every crystallization produces real, scored, exportable code — not mock-ups or templates.
          </p>
        </motion.div>

        <div className="space-y-0">
          {phases.map((phase, i) => (
            <motion.div
              key={phase.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="flex items-start gap-5 py-6 border-b border-border last:border-0"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
                <phase.icon className={`w-5 h-5 ${phase.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">PHASE {i + 1}</span>
                  <h3 className="text-lg font-semibold text-foreground">{phase.label}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{phase.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 p-6 rounded-xl border border-border bg-card">
          <h3 className="text-base font-semibold text-foreground mb-4">Memory Quality Tiers</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { name: 'Mint', range: '68–79', color: 'text-neon-green', desc: 'Production-viable' },
              { name: 'Prime', range: '80–89', color: 'text-sky-500', desc: 'High-quality' },
              { name: 'Relic', range: '90–93', color: 'text-neon-amber', desc: 'Rare find' },
              { name: 'Mythic', range: '94–99', color: 'text-neon-purple', desc: 'Silicon-eligible' },
              { name: 'Apex', range: '100', color: 'text-primary', desc: 'Perfect score' },
            ].map(t => (
              <div key={t.name} className="text-center p-3 rounded-lg border border-border bg-background">
                <p className={`text-lg font-bold ${t.color}`}>{t.name}</p>
                <p className="text-xs font-mono text-muted-foreground">{t.range}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SubstrateCapabilities() {
  const capabilities = [
    { icon: Brain, name: 'DREAM', desc: 'Background optimization cycles that continuously improve system performance and discover new patterns while idle.', tier: 'Studio+' },
    { icon: Zap, name: 'EVOLUTION', desc: 'Safe self-modification with rollback boundaries. The substrate adapts its own architecture within governed constraints.', tier: 'Architect' },
    { icon: Globe, name: 'NEXUS', desc: 'Multi-provider AI routing engine. Dispatches to the optimal model per task — latency, cost, and capability balanced.', tier: 'All tiers' },
    { icon: Shield, name: 'DEFENSE', desc: 'Real-time threat detection, anomaly isolation, and input sanitization across every system boundary.', tier: 'All tiers' },
    { icon: Cpu, name: 'MEMORY', desc: 'Persistent context with auto-tiering. Isolated namespaces keep knowledge separated and retrievable across sessions.', tier: 'All tiers' },
    { icon: Clock, name: 'CLOCKLESS', desc: 'Event-driven execution without polling. Systems activate only when needed — zero idle compute waste.', tier: 'All tiers' },
  ];

  return (
    <section className="py-20 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Novel Systems</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mb-10">
            Beyond crystallization, the substrate ships with capabilities that don't exist anywhere else — each one a standalone innovation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="p-6 rounded-xl border border-border bg-card group hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <cap.icon className="w-6 h-6 text-primary" />
                <span className="text-xs font-mono px-2 py-1 rounded-full bg-secondary text-muted-foreground">{cap.tier}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{cap.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{cap.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExportEcosystem() {
  return (
    <section className="py-20 px-6 bg-secondary/30 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Export Ecosystem</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mb-10">
            Every crystallized memory includes a standalone Micro-Substrate runtime and functional test harness. Export languages are gated by quality score.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { tier: 'Tier 1 · Score 68+', langs: 'PHP, Ruby, Lua, Dart, Swift, Kotlin', desc: 'Broad ecosystem languages for rapid deployment.' },
            { tier: 'Tier 2 · Score 78+', langs: 'TypeScript, Python, Go, Java, C#', desc: 'Production workhorses for enterprise and infrastructure.' },
            { tier: 'Tier 3 · Score 86+', langs: 'Rust, C, C++, Zig, Scala, Haskell, Elixir', desc: 'Systems and high-performance computing.' },
            { tier: 'Tier 4 · Score 94+', langs: 'Verilog, VHDL, SPICE', desc: 'Hardware description languages — the silicon boundary.' },
          ].map((t, i) => (
            <motion.div
              key={t.tier}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="p-6 rounded-xl border border-border bg-card"
            >
              <p className="text-xs font-mono text-primary mb-2">{t.tier}</p>
              <p className="text-base font-semibold text-foreground mb-2">{t.langs}</p>
              <p className="text-sm text-muted-foreground">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const tiers = [
    {
      name: 'Free', price: '$0', interval: 'forever',
      desc: 'Explore the substrate. Full runtime access.',
      features: ['3 memory slots', 'NEXUS routing (standard)', '1 memory namespace', '5 min/day radio access', '12 crystallized assets'],
      cta: 'Get Started', href: '/auth', highlight: false,
    },
    {
      name: 'Studio', price: '$29', interval: '/mo',
      desc: 'Expanded depth for serious builders.',
      features: ['Everything in Free', '3 memory namespaces', 'DREAM background optimization', 'Automation scheduling', '30 crystallized assets', '30 min/day radio access'],
      cta: 'Start Building', href: '/upgrade', highlight: false,
    },
    {
      name: 'Creator', price: '$49', interval: '/mo',
      desc: 'Full operational depth with trace exports.',
      features: ['Everything in Studio', '6 memory namespaces', 'High-priority NEXUS routing', 'Execution trace exports', '45 crystallized assets', '45 min/day radio access'],
      cta: 'Upgrade to Creator', href: '/upgrade', highlight: true,
    },
    {
      name: 'Architect', price: '$79', interval: '/mo',
      desc: 'Maximum depth. Full substrate control.',
      features: ['Everything in Creator', '12 memory namespaces', 'Highest-priority routing', 'EVOLUTION safe self-modification', '60 crystallized assets', '60 min/day radio access'],
      cta: 'Go Architect', href: '/upgrade', highlight: false,
    },
  ];

  return (
    <section className="py-20 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Choose Your Depth</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            The runtime runs for everyone. Plans control how <em>deep</em> your systems operate — not whether they run.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className={`relative p-6 rounded-xl border bg-card flex flex-col ${
                tier.highlight ? 'border-primary ring-1 ring-primary/20' : 'border-border'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-foreground mb-1">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{tier.price}</span>
                <span className="text-sm text-muted-foreground">{tier.interval}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-5">{tier.desc}</p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={tier.href}
                className={`block text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  tier.highlight 
                    ? 'bg-primary text-primary-foreground hover:opacity-90' 
                    : 'border border-border text-foreground hover:bg-secondary'
                }`}
              >
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include 20% savings with annual billing. <Link to="/enterprise" className="text-primary hover:underline">Enterprise pricing available</Link>.
        </p>
      </div>
    </section>
  );
}

function InvestorHighlights() {
  const stats = [
    { label: 'Active Nodes', value: '40', sub: '4-category topology' },
    { label: 'Capabilities', value: '675+', sub: 'Runtime-addressable' },
    { label: 'Export Languages', value: '20+', sub: 'Software + Hardware' },
    { label: 'Quality Floor', value: '68', sub: 'No junk, ever' },
  ];

  return (
    <section className="py-20 px-6 bg-secondary/30 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">For Investors</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Infrastructure, Not an App</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mb-10">
            CMPSBL is a defensible cognitive infrastructure layer. The substrate's 40-primitive architecture, autonomous discovery engine, 
            and silicon export process represent a replacement cost of $18M–$42M in engineering effort.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="text-center p-5 rounded-xl border border-border bg-card"
            >
              <p className="text-3xl md:text-4xl font-bold text-primary">{s.value}</p>
              <p className="text-sm font-medium text-foreground mt-1">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-border bg-card">
            <TrendingUp className="w-6 h-6 text-primary mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Revenue Model</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />Consumer SaaS: $0 / $29 / $49 / $79 per month</li>
              <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />Enterprise licensing: $2,500/mo standalone</li>
              <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />OEM partnerships: $50K–$150K/yr</li>
              <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />Discovery Corpus API: $500/mo</li>
            </ul>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <Users className="w-6 h-6 text-primary mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Defensibility</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />40-primitive architecture is non-trivial to replicate</li>
              <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />Self-evolving system creates compounding advantage</li>
              <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />Growing discovery corpus as a data moat</li>
              <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />Published DOI for academic credibility</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/investors" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
            Full investor materials <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="py-24 px-6 border-t border-border">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            The substrate is running.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Start free. Crystallize your first memory. See real software emerge from the Memory Stream — scored, exportable, and yours.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/auth" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/foundry/demo" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-border text-foreground font-medium hover:bg-secondary transition-colors">
              Watch It Work
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function SystemOverview() {
  return (
    <>
      <Helmet>
        <title>System Overview — 40-Node AI Substrate | CMPSBL®</title>
        <meta name="description" content="From Memory to Silicon. A 40-primitive autonomous cognitive substrate across 4 categories that crystallizes ideas into production software and hardware. For investors, builders, and the curious." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <PublicNav />
        <Hero />
        <WhatIs />
        <div id="memory-stream"><MemoryStreamSection /></div>
        <div id="systems"><SubstrateCapabilities /></div>
        <div id="exports"><ExportEcosystem /></div>
        <div id="pricing"><PricingSection /></div>
        <div id="investors"><InvestorHighlights /></div>
        <ClosingCTA />
        <EnhancedFooter />
      </div>
    </>
  );
}
