/**
 * Scanner — Evolution Scanner info + usage guide
 * Showcases the 4-phase cognitive scan system and API access.
 */

import { SEO } from '@/components/SEO';
import { CmpsblNav } from '@/components/navigation/CmpsblNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Scan, Shield, Zap, Brain, Terminal, Layers, Eye, 
  Activity, ArrowRight, Code, Database, Lock, Sparkles,
  ChevronRight, Radio, Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SCAN_PHASES = [
  {
    phase: 'Phase A',
    name: 'Edge Analysis',
    icon: Zap,
    description: 'Discovers and audits edge functions, aliases, and deployment topology. Detects missing, risk-flagged, or orphaned infrastructure.',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
  },
  {
    phase: 'Phase B',
    name: 'System State',
    icon: Database,
    description: 'Verifies table accessibility, RLS enforcement, circuit breaker states, and module health across the entire substrate.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    phase: 'Phase C',
    name: 'Health Integrity',
    icon: Activity,
    description: 'Structural integrity checks, module status verification, anomaly detection, and entropy gradient analysis.',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  {
    phase: 'Phase D',
    name: 'LLM Synthesis',
    icon: Brain,
    description: 'AI-powered capability gap analysis, optimization recommendations, and multi-model consensus scoring.',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
  },
];

const SCAN_TIERS = [
  {
    tier: 'Quick',
    speed: '~5s',
    description: 'Fast surface-level health check. Edge + system state only.',
    features: ['Edge function audit', 'Table accessibility', 'Circuit breaker status'],
  },
  {
    tier: 'Standard',
    speed: '~15s',
    description: 'Full 4-phase scan with normalized action plans.',
    features: ['All Quick features', 'Health integrity', 'LLM synthesis', 'Normalized proposals'],
  },
  {
    tier: 'Forensic',
    speed: '~45s',
    description: 'Deep analysis with historical diffing and regression detection.',
    features: ['All Standard features', 'Historical trend analysis', 'Regression detection', 'Cross-module correlation'],
  },
];

const TERMINAL_EXAMPLES = [
  { command: 'scan', description: 'Run a standard cognitive scan' },
  { command: 'scan --depth=forensic', description: 'Deep forensic analysis' },
  { command: 'scan --explain', description: 'Verbose mode with explanations' },
  { command: 'scan --dry_run', description: 'Preview without creating plans' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Scanner() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Evolution Scanner — Cognitive Systems Analysis | CMPSBL"
        description="4-phase cognitive scanner: edge analysis, system state verification, health integrity, and AI-powered synthesis. Scan your substrate from the DECODE terminal."
        canonical="https://cmpsbl.com/scanner"
        keywords={['evolution scanner', 'cognitive scan', 'system analysis', 'CMPSBL scanner', 'substrate health', 'AI diagnostics']}
      />
      <CmpsblNav />

      <main className="pt-24 sm:pt-28 pb-20">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto px-4 text-center mb-16 sm:mb-20"
        >
          <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30 mb-4">
            <Scan className="w-3 h-3 mr-1.5 inline" />
            Evolution Scanner
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-cyan-400 bg-clip-text text-transparent">
              See Everything.
            </span>
            <br />
            <span className="text-foreground">Fix What Matters.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            A 4-phase cognitive scanner that audits your substrate's edge functions, database integrity, 
            module health, and AI capabilities — then synthesizes an actionable evolution plan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/decode">
                <Terminal className="w-4 h-4" />
                Open DECODE Terminal
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/developers">
                <Code className="w-4 h-4" />
                API Documentation
              </Link>
            </Button>
          </div>
        </motion.section>

        {/* 4-Phase Grid */}
        <section className="max-w-5xl mx-auto px-4 mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Four Phases. One Truth.</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Each scan synthesizes signals from four independent analysis phases into a unified, prioritized action plan.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {SCAN_PHASES.map((phase) => (
              <motion.div key={phase.phase} variants={itemVariants}>
                <Card className={`h-full border ${phase.borderColor} ${phase.bgColor} hover:shadow-lg transition-shadow`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${phase.bgColor}`}>
                        <phase.icon className={`w-5 h-5 ${phase.color}`} />
                      </div>
                      <div>
                        <p className={`text-xs font-mono uppercase tracking-wider ${phase.color}`}>{phase.phase}</p>
                        <CardTitle className="text-base">{phase.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{phase.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Flow arrow */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mt-6 text-muted-foreground"
          >
            <Layers className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-wider">Merge → Normalize → Plan</span>
            <ArrowRight className="w-4 h-4" />
            <Sparkles className="w-4 h-4 text-primary" />
          </motion.div>
        </section>

        {/* Scan Tiers */}
        <section className="max-w-5xl mx-auto px-4 mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Scan Depth Tiers</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Trade speed for depth. Choose the tier that fits your workflow.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {SCAN_TIERS.map((tier) => (
              <motion.div key={tier.tier} variants={itemVariants}>
                <Card className="h-full hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{tier.tier}</CardTitle>
                      <Badge variant="secondary" className="font-mono text-xs">{tier.speed}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Terminal Usage */}
        <section className="max-w-5xl mx-auto px-4 mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Run From DECODE</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              The scanner is accessible directly from the DECODE terminal. Type natural language or structured commands.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-card/80 border-border/60 overflow-hidden">
              <div className="bg-muted/40 px-4 py-2.5 border-b border-border/50 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-xs font-mono text-muted-foreground ml-2">DECODE Terminal</span>
              </div>
              <CardContent className="p-0">
                {TERMINAL_EXAMPLES.map((ex, i) => (
                  <div key={i} className="px-4 py-3 border-b border-border/30 last:border-b-0 flex items-start gap-3 hover:bg-muted/20 transition-colors">
                    <span className="text-primary font-mono text-sm shrink-0">$</span>
                    <div className="min-w-0">
                      <code className="text-sm font-mono text-foreground">{ex.command}</code>
                      <p className="text-xs text-muted-foreground mt-0.5">{ex.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex justify-center mt-6">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/decode">
                <Terminal className="w-4 h-4" />
                Try it now
              </Link>
            </Button>
          </div>
        </section>

        {/* What the Scanner Detects */}
        <section className="max-w-5xl mx-auto px-4 mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">What It Detects</h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {[
              { icon: Shield, label: 'Missing RLS Policies', desc: 'Exposed tables without row-level security' },
              { icon: Zap, label: 'Orphaned Edge Functions', desc: 'Deployed but unreferenced infrastructure' },
              { icon: Radio, label: 'Circuit Breaker States', desc: 'Open circuits blocking module execution' },
              { icon: Eye, label: 'Anomaly Patterns', desc: 'Unusual entropy or behavioral drift' },
              { icon: Lock, label: 'Auth Flow Gaps', desc: 'Missing guards or permission leaks' },
              { icon: Cpu, label: 'Capability Gaps', desc: 'AI-suggested improvements and optimizations' },
            ].map((item) => (
              <motion.div key={item.label} variants={itemVariants}>
                <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-muted/10 hover:bg-muted/20 transition-colors">
                  <item.icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto px-4 text-center"
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-8 sm:p-10">
              <Scan className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold mb-3">Ready to scan?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Open the DECODE terminal and type <code className="text-primary font-mono text-sm">scan</code> to run 
                your first cognitive analysis.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/decode">
                    <Terminal className="w-4 h-4" />
                    Launch DECODE
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link to="/documentation">
                    <Code className="w-4 h-4" />
                    Read the Docs
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>

      <EnhancedFooter />
    </div>
  );
}