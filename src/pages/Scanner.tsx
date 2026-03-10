/**
 * Scanner — Evolution Scanner: Kill Technical Debt. Evolve Your System.
 * Coming Soon — currently in active development.
 */

import { SEO } from '@/components/SEO';
import { CmpsblNav } from '@/components/navigation/CmpsblNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { AuthorityLinkBlock } from '@/components/seo/AuthorityLinkBlock';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Scan, Zap, Brain, Terminal, Layers, Activity,
  ArrowRight, Code, Database, Sparkles, Dna,
  GitBranch, Bug, Gauge, Flame, Rocket, Construction,
  ChevronRight, Radio, Cpu, Shield, Eye, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const EVOLUTION_PHASES = [
  {
    phase: '01',
    name: 'Detect',
    icon: Bug,
    tagline: 'Find the rot before it spreads',
    description: 'Scans edge functions, database schema, module wiring, and dependency graphs. Surfaces orphaned code, missing guards, and architectural drift you didn\'t know existed.',
    color: 'from-red-500/20 to-orange-500/10',
    accent: 'text-red-400',
    border: 'border-red-500/20',
  },
  {
    phase: '02',
    name: 'Diagnose',
    icon: Activity,
    tagline: 'Understand why, not just what',
    description: 'Cross-correlates findings across nodes using VISION telemetry, MEMORY decay patterns, and DEFENSE threat scoring. Grades each issue A→F by impact.',
    color: 'from-amber-500/20 to-yellow-500/10',
    accent: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  {
    phase: '03',
    name: 'Prescribe',
    icon: Brain,
    tagline: 'AI-synthesized action plans',
    description: 'Multi-model LLM consensus generates prioritized evolution proposals — concrete diffs, migration scripts, and config patches. Not suggestions. Plans.',
    color: 'from-violet-500/20 to-purple-500/10',
    accent: 'text-violet-400',
    border: 'border-violet-500/20',
  },
  {
    phase: '04',
    name: 'Evolve',
    icon: Dna,
    tagline: 'Apply, stamp, verify, repeat',
    description: 'Cryptographically stamped evolution receipts. Pre/post metric deltas. Automatic rollback on regression. Your system doesn\'t just change — it provably improves.',
    color: 'from-emerald-500/20 to-cyan-500/10',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
];

const DEBT_TYPES = [
  { icon: GitBranch, label: 'Dead code & orphaned functions', desc: 'Infrastructure deployed but never called' },
  { icon: Shield, label: 'Missing security policies', desc: 'Tables without RLS, exposed endpoints' },
  { icon: Radio, label: 'Broken circuit breakers', desc: 'Open circuits silently blocking execution' },
  { icon: Gauge, label: 'Performance regression', desc: 'Latency creep, memory leaks, bloated bundles' },
  { icon: Lock, label: 'Auth flow gaps', desc: 'Permission leaks, missing guards, stale tokens' },
  { icon: Layers, label: 'Architectural drift', desc: 'Nodes diverging from intended design patterns' },
  { icon: Eye, label: 'Entropy anomalies', desc: 'Behavioral drift and unusual system patterns' },
  { icon: Cpu, label: 'Capability gaps', desc: 'Missing features your system should already have' },
  { icon: Flame, label: 'Dependency vulnerabilities', desc: 'Outdated packages with known CVEs' },
];

const TERMINAL_EXAMPLES = [
  { command: 'scan', description: 'Run a standard evolution scan' },
  { command: 'scan --depth=forensic', description: 'Deep forensic analysis with historical diffing' },
  { command: 'scan --explain', description: 'Verbose mode — see the reasoning behind every finding' },
  { command: 'evolve --apply-plan <id>', description: 'Apply an evolution plan with cryptographic stamp' },
];

export default function Scanner() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Evolution Scanner — Kill Technical Debt | CMPSBL"
        description="Detect technical debt. Diagnose root causes. Generate evolution plans. Apply with cryptographic proof. The scanner that makes your system provably better."
        canonical="https://cmpsbl.com/scanner"
        keywords={['technical debt', 'evolution scanner', 'code quality', 'system evolution', 'AI diagnostics', 'vibe coding']}
      />
      <CmpsblNav />

      <main className="pt-24 sm:pt-28 pb-20 overflow-hidden">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto px-4 text-center mb-20 sm:mb-24 relative"
        >
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-primary/4 rounded-full blur-[120px] pointer-events-none" />

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <Badge variant="outline" className="px-4 py-1.5 text-[11px] border-primary/30 mb-6 gap-2">
              <Construction className="w-3.5 h-3.5" />
              Coming Soon — In Active Development
            </Badge>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[0.95]">
            <span className="text-foreground">Your code has</span>
            <br />
            <span className="bg-gradient-to-r from-red-400 via-primary to-emerald-400 bg-clip-text text-transparent">
              technical debt.
            </span>
            <br />
            <span className="text-foreground text-3xl sm:text-4xl md:text-5xl opacity-70">
              Let's evolve past it.
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            The Evolution Scanner doesn't just find problems — it generates cryptographically stamped evolution plans 
            that make your system <span className="text-foreground font-medium">provably better</span>. 
            Detect → Diagnose → Prescribe → Evolve. Closed-loop. Verifiable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2 relative overflow-hidden group h-12">
              <Link to="/decode">
                <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Terminal className="w-4 h-4" />
                Try in DECODE Terminal
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 h-12">
              <Link to="/documentation">
                <Code className="w-4 h-4" />
                Read the Docs
              </Link>
            </Button>
          </div>
        </motion.section>

        {/* The Problem Statement */}
        <section className="max-w-5xl mx-auto px-4 mb-20 sm:mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <Badge variant="secondary" className="mb-4 text-[11px]">THE PROBLEM</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
              Vibe coding is fast.<br />
              <span className="text-muted-foreground">Technical debt is faster.</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              You ship at the speed of thought. But every shortcut, every "fix it later," every copy-pasted snippet 
              compounds into a system that fights you. The scanner sees what you can't.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3"
          >
            {DEBT_TYPES.map((item) => (
              <motion.div key={item.label} variants={itemVariants}>
                <div className="flex items-start gap-3 p-4 rounded-xl border border-border/30 bg-card/40 hover:bg-card/70 hover:border-primary/15 transition-all duration-300 group">
                  <div className="p-1.5 rounded-lg bg-destructive/8 group-hover:bg-primary/8 transition-colors shrink-0">
                    <item.icon className="w-4 h-4 text-destructive/60 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-snug">{item.label}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Evolution Phases */}
        <section className="max-w-5xl mx-auto px-4 mb-20 sm:mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <Badge variant="secondary" className="mb-4 text-[11px]">THE SOLUTION</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
              Four phases. One evolution.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Not a linter. Not a dashboard. A closed-loop evolution engine that makes your system 
              measurably better with every scan.
            </p>
          </motion.div>

          <div className="space-y-3 sm:space-y-4">
            {EVOLUTION_PHASES.map((phase, i) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <Card className={`border ${phase.border} overflow-hidden group hover:shadow-md hover:shadow-primary/[0.04] transition-all duration-300`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row items-stretch">
                      {/* Phase number + icon */}
                      <div className={`bg-gradient-to-br ${phase.color} p-5 sm:p-8 sm:w-44 flex flex-row sm:flex-col items-center sm:items-start justify-start gap-3 sm:gap-2.5 shrink-0`}>
                        <span className={`text-2xl sm:text-3xl font-black font-mono ${phase.accent} opacity-50`}>{phase.phase}</span>
                        <div className="flex items-center gap-2">
                          <phase.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${phase.accent}`} />
                          <span className={`text-base sm:text-lg font-bold ${phase.accent}`}>{phase.name}</span>
                        </div>
                      </div>
                      {/* Content */}
                      <div className="p-5 sm:p-8 flex-1">
                        <p className="text-[11px] sm:text-xs font-mono text-primary/70 uppercase tracking-wider mb-2">{phase.tagline}</p>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{phase.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Flow arrow */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2.5 sm:gap-3 mt-8 text-muted-foreground/70"
          >
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider">Detect</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider">Diagnose</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider">Prescribe</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-primary font-bold">Evolve</span>
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </motion.div>
        </section>

        {/* Terminal Usage */}
        <section className="max-w-5xl mx-auto px-4 mb-20 sm:mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <Badge variant="secondary" className="mb-4 text-xs">USAGE</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Run from the DECODE terminal</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Natural language or structured commands. Type what you mean, get what you need.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-card/80 border-border/60 overflow-hidden shadow-lg shadow-primary/[0.03]">
              <div className="bg-muted/40 px-4 py-2.5 border-b border-border/50 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-xs font-mono text-muted-foreground ml-2">DECODE Terminal</span>
                <Badge variant="outline" className="ml-auto text-[10px] border-primary/30">PREVIEW</Badge>
              </div>
              <CardContent className="p-0">
                {TERMINAL_EXAMPLES.map((ex, i) => (
                  <div key={i} className="px-4 py-3 border-b border-border/30 last:border-b-0 flex items-start gap-3 hover:bg-muted/20 transition-colors group">
                    <span className="text-primary font-mono text-sm shrink-0 group-hover:text-emerald-400 transition-colors">$</span>
                    <div className="min-w-0">
                      <code className="text-sm font-mono text-foreground group-hover:text-primary transition-colors">{ex.command}</code>
                      <p className="text-xs text-muted-foreground mt-0.5">{ex.description}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-all ml-auto mt-1 shrink-0" />
                  </div>
                ))}
                {/* Blinking cursor line */}
                <div className="px-4 py-3 flex items-center gap-3">
                  <span className="text-primary font-mono text-sm">$</span>
                  <span className="w-2 h-4 bg-primary/70 animate-pulse rounded-sm" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Why Evolution > Fixing */}
        <section className="max-w-5xl mx-auto px-4 mb-20 sm:mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
              <CardContent className="p-8 sm:p-12 relative">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">
                      Fixing bugs is maintenance.<br />
                      <span className="text-primary">Evolution is growth.</span>
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      Every scan creates a cryptographic receipt. Pre and post metrics. Verifiable deltas. 
                      If an evolution degrades your system, it rolls back automatically.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Your system doesn't just get fixed — it <span className="text-foreground font-medium">compounds improvements</span> over time, 
                      with a provable audit trail that satisfies compliance and builds trust.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Merkle-chain receipts', desc: 'Every evolution is hash-linked and tamper-proof' },
                      { label: 'Pre/post metric deltas', desc: 'Quantified improvement or instant rollback' },
                      { label: 'Entropy trend tracking', desc: 'System health scored across every scan' },
                      { label: 'Regression gating', desc: 'Declining health scores block promotions' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                        <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto px-4 text-center mb-16"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-emerald-500/8 rounded-2xl blur-xl" />
            <Card className="border-primary/15 relative">
              <CardContent className="p-8 sm:p-10">
                <Badge variant="outline" className="mb-4 text-[11px] border-amber-500/30 text-amber-400 gap-1.5">
                  <Construction className="w-3 h-3" />
                  Coming Soon
                </Badge>
                <Rocket className="w-7 h-7 text-primary mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-3">We're building something different.</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                  The Evolution Scanner is in active development. Preview what's coming in the DECODE terminal 
                  with <code className="text-primary font-mono text-sm">scan</code> — and watch this space.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild size="lg" className="gap-2 h-12">
                    <Link to="/evolution">
                      <Zap className="w-4 h-4" />
                      Open EVOLUTION
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="gap-2 h-12">
                    <Link to="/decode">
                      <Terminal className="w-4 h-4" />
                      Preview in DECODE
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>
      </main>

      <AuthorityLinkBlock currentPath="/scanner" />
      <EnhancedFooter />
    </div>
  );
}
