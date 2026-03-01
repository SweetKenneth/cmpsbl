/**
 * EVOLUTION Control Center — First-class mission control for system evolution
 * Mobile-first, design-system-aligned, with animated hero diagram
 */

import { useState, useRef } from 'react';
import { SEO } from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FlaskConical, RotateCcw, TrendingUp, MessageSquareWarning, 
  Plug, Lock, ArrowRight, Zap, Shield, Terminal, 
  CheckCircle, Sparkles, ChevronDown, Copy, Activity,
  Cpu, GitBranch, Eye, Layers, ArrowDown, Gauge,
  FileCheck, AlertTriangle, Brain, Code
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import evolutionHero from '@/assets/evolution-hero.jpg';

// Lazy-load the tool panels
import { DryRunPreview } from '@/components/evolution/DryRunPreview';
import { RollbackPanel } from '@/components/evolution/RollbackPanel';
import { ScanTrendDashboard } from '@/components/evolution/ScanTrendDashboard';
import { FalsePositiveFeedback } from '@/components/evolution/FalsePositiveFeedback';
import { AgentConnectGuide } from '@/components/evolution/AgentConnectGuide';

// ── Case studies ────────────────────────────────────────────
const CASE_STUDIES = [
  {
    name: "FinOps Dashboard",
    industry: "Fintech",
    before: { health: 62, debt: 18 },
    after: { health: 91, debt: 3 },
    cycles: 4,
    quote: "Three evolution cycles found issues we'd missed for months. The fourth cycle got us to 91 health.",
  },
  {
    name: "Healthcare Portal",
    industry: "HealthTech",
    before: { health: 55, debt: 24 },
    after: { health: 87, debt: 5 },
    cycles: 6,
    quote: "EVOLUTION caught a critical RLS gap on patient data — something manual reviews never flagged.",
  },
  {
    name: "SaaS Analytics",
    industry: "B2B Software",
    before: { health: 71, debt: 11 },
    after: { health: 94, debt: 1 },
    cycles: 3,
    quote: "We went from 71 to 94 health in a single afternoon. The dry-run preview made it safe to move fast.",
  },
];

// ── How it works steps ──────────────────────────────────────
const STEPS = [
  { 
    num: "01", 
    title: "Copy the prompt", 
    description: "One click copies your auth-injected EVOLUTION prompt with your personal JWT baked in.",
    icon: Copy 
  },
  { 
    num: "02", 
    title: "Paste into your agent", 
    description: "Drop it into Cursor, Windsurf, Cline, or any AI coding agent. It connects instantly.",
    icon: Terminal 
  },
  { 
    num: "03", 
    title: 'Say "Evolve CMPSBL"', 
    description: "Your agent scans, previews improvements with a dry-run, and asks before applying anything.",
    icon: Zap 
  },
  { 
    num: "04", 
    title: "Watch your system improve", 
    description: "Health goes up. Debt goes down. Every change is receipted and rollback-safe.",
    icon: TrendingUp 
  },
];

// ── Value props ─────────────────────────────────────────────
const VALUE_PROPS = [
  {
    icon: FlaskConical,
    title: "Dry-Run First",
    description: "Every proposed change starts as a simulation. You see the impact — diffs, health delta, risk flags — before a single line is touched.",
  },
  {
    icon: FileCheck,
    title: "Receipted Changes",
    description: "Each applied change is logged with a Merkle-chain audit receipt. Full traceability from scan to commit — no black boxes.",
  },
  {
    icon: RotateCcw,
    title: "One-Click Rollback",
    description: "If something doesn't feel right, undo any cycle instantly. Your system returns to its exact pre-evolution state.",
  },
  {
    icon: Shield,
    title: "Governed by Policy",
    description: "Evolution respects your governance rules. Critical paths require approval. High-risk changes are flagged before they're even previewed.",
  },
];

// ── Animated Evolution Diagram ──────────────────────────────
function EvolutionDiagram() {
  const nodes = [
    { label: 'SCAN', icon: Eye, x: '10%', y: '20%', delay: 0 },
    { label: 'DRY-RUN', icon: FlaskConical, x: '40%', y: '10%', delay: 0.25 },
    { label: 'REVIEW', icon: Shield, x: '70%', y: '20%', delay: 0.5 },
    { label: 'APPLY', icon: Zap, x: '80%', y: '55%', delay: 0.75 },
    { label: 'RECEIPT', icon: Layers, x: '50%', y: '70%', delay: 1.0 },
    { label: 'ROLLBACK', icon: RotateCcw, x: '15%', y: '60%', delay: 1.25 },
  ];

  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-square">
      {/* Connection path */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none">
        <motion.path
          d="M 15 25 Q 30 10 45 15 Q 60 10 75 25 Q 85 40 85 60 Q 70 80 55 75 Q 35 80 20 65 Q 10 50 15 25"
          stroke="hsl(var(--primary) / 0.2)"
          strokeWidth="0.4"
          strokeDasharray="2.5 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
        <motion.circle
          r="1.2"
          fill="hsl(var(--primary))"
          opacity={0.5}
        >
          <animateMotion
            dur="5s"
            repeatCount="indefinite"
            path="M 15 25 Q 30 10 45 15 Q 60 10 75 25 Q 85 40 85 60 Q 70 80 55 75 Q 35 80 20 65 Q 10 50 15 25"
          />
        </motion.circle>
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.label}
          className="absolute flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2"
          style={{ left: node.x, top: node.y }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: node.delay }}
        >
          <motion.div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-card border border-border/40 flex items-center justify-center shadow-sm hover:border-primary/30 transition-colors"
            animate={{ y: [0, -2.5, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
          >
            <node.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </motion.div>
          <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground/70 tracking-wider">
            {node.label}
          </span>
        </motion.div>
      ))}

      {/* Center label */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <div className="text-center">
          <motion.div
            className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full border border-primary/25 bg-primary/5 flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <GitBranch className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </motion.div>
          <span className="text-[10px] sm:text-xs font-bold text-foreground mt-1.5 block tracking-wide">EVOLVE</span>
        </div>
      </motion.div>
    </div>
  );
}

// ── Animated stat counter ───────────────────────────────────
function AnimatedStat({ label, value, suffix = "" }: { label: string; value: string; suffix?: string }) {
  return (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
        {value}<span className="text-primary">{suffix}</span>
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
}

// ── Section divider ─────────────────────────────────────────
function SectionDivider() {
  return (
    <div className="relative py-8 sm:py-12">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
    </div>
  );
}

export default function EvolutionControlCenter() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("connect");
  const toolsRef = useRef<HTMLDivElement>(null);

  const scrollToTools = () => {
    toolsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── SEO data ────────────────────────────────────────────
  const seoProps = {
    title: "EVOLUTION — Governed AI Code Improvement | CMPSBL",
    description: "Connect your AI agent and evolve your codebase safely. Dry-run previews, one-click rollback, receipted changes, and governed self-improvement.",
    image: "https://cmpsbl.com/og/evolution.jpg",
    canonical: "https://cmpsbl.com/evolution",
    keywords: ['AI code evolution', 'governed self-improvement', 'codebase evolution', 'AI agent code improvement', 'dry-run preview', 'rollback safe'] as string[],
    faq: [
      { question: 'What is EVOLUTION?', answer: 'EVOLUTION is a governed self-improvement system that connects AI coding agents to your codebase for safe, receipted, rollback-safe code evolution.' },
      { question: 'Is it safe?', answer: 'Yes. All changes start as dry-runs. Every applied change is receipted with a Merkle-chain audit trail and can be rolled back with one click.' },
      { question: 'Which AI agents work with EVOLUTION?', answer: 'Any AI coding agent that accepts system prompts — Cursor, Windsurf, Cline, and others.' },
    ],
    breadcrumbs: [
      { name: 'Home', url: 'https://cmpsbl.com' },
      { name: 'EVOLUTION', url: 'https://cmpsbl.com/evolution' },
    ],
  };

  // ── Loading ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="text-muted-foreground text-sm"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Initializing EVOLUTION…
        </motion.div>
      </div>
    );
  }

  // ── Hero Section ────────────────────────────────────────
  const heroSection = (
    <section className="relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[image:var(--gradient-mesh)] opacity-50" />
      <motion.div 
        className="absolute top-0 right-0 w-48 sm:w-[400px] h-48 sm:h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 55%)" }}
        animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-24 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-5 sm:space-y-6"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="border-primary/30 text-primary text-[10px] sm:text-[11px] px-2.5 py-0.5">
                <Zap className="w-3 h-3 mr-1" /> Governed Self-Improvement
              </Badge>
              {user && (
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] sm:text-[11px] px-2.5 py-0.5">
                  <Shield className="w-3 h-3 mr-1" /> Authenticated
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              <span className="text-foreground">Your system evolves.</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                You stay in control.
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl break-words">
              EVOLUTION is a governed self-improvement engine for your codebase. It connects any AI coding agent — Cursor, Windsurf, Cline — to a safe, auditable improvement loop where every change is previewed, receipted, and rollback-safe.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              {user ? (
                <>
                  <Button size="lg" onClick={scrollToTools} className="gap-2 h-12">
                    <Terminal className="w-4 h-4" />
                    Open Mission Control
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }} className="gap-2 h-12">
                    How it works
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate('/auth?redirect=/evolution')} className="gap-2 h-12">
                    <Lock className="w-4 h-4" />
                    Sign in to evolve
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }} className="gap-2 h-12">
                    See how it works
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button size="lg" variant="ghost" onClick={() => navigate('/developers/guide')} className="gap-2 text-muted-foreground hover:text-foreground text-sm">
                <Code className="w-4 h-4" />
                Not a vibe coder? Use SDK →
              </Button>
            </div>
          </motion.div>

          {/* Right: Animated diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <EvolutionDiagram />
          </motion.div>
        </div>

        {/* Quick stats */}
        <motion.div 
          className="grid grid-cols-3 gap-4 sm:gap-8 mt-10 sm:mt-14 max-w-lg mx-auto lg:mx-0"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <AnimatedStat label="Avg health lift" value="+28" suffix="pts" />
          <AnimatedStat label="Avg debt reduction" value="−15" suffix="flags" />
          <AnimatedStat label="Avg cycles" value="4" suffix="" />
        </motion.div>
      </div>
    </section>
  );

  // ── What is EVOLUTION — explainer ───────────────────────
  const explainerSection = (
    <section className="py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 space-y-8 sm:space-y-12">
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="border-primary/30 text-primary text-[11px]">
            <Brain className="w-3 h-3 mr-1" /> What is EVOLUTION?
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            <span className="text-foreground">AI agents are powerful. </span>
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Ungoverned AI is dangerous.
            </span>
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl break-words">
            <p>
              Most teams use AI coding agents as one-shot tools — paste a task, get a diff, hope for the best. 
              There's no audit trail. No way to preview impact. No undo button. And if something breaks in production, 
              you're digging through git blame trying to figure out what the AI touched.
            </p>
            <p>
              <strong className="text-foreground">EVOLUTION changes that.</strong> It wraps your AI agent in a governed improvement loop: 
              scan your system, preview every proposed change as a dry-run with clear health and debt impact scores, 
              then apply only what you approve. Every change is cryptographically receipted. Every cycle is rollback-safe. 
              And your governance policies control which changes are auto-approved versus flagged for human review.
            </p>
            <p>
              The result: your codebase gets measurably healthier over time — without the risk of ungoverned AI changes 
              breaking what already works. Health goes up. Technical debt goes down. And you have a complete audit trail of every improvement.
            </p>
          </div>
        </motion.div>

        {/* Value props grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {VALUE_PROPS.map((prop, i) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full border-border/30 bg-card/50 hover:border-primary/20 transition-colors group">
                <CardContent className="pt-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <prop.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">{prop.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                    {prop.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  // ── Shared content blocks ──────────────────────────────
  const sharedContent = (
    <>
      {heroSection}

      {/* Quick command strip — only for authenticated users */}
      {user && (
        <section className="border-y border-border/30 bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] text-muted-foreground whitespace-nowrap font-medium shrink-0">Quick commands:</span>
              {['"Scan CMPSBL"', '"Evolve CMPSBL"', '"Rollback CMPSBL"', '"Check health"'].map((cmd) => (
                <Badge 
                  key={cmd} 
                  variant="secondary" 
                  className="whitespace-nowrap font-mono text-[10px] sm:text-xs px-2 sm:px-3 py-1 bg-muted/50 hover:bg-primary/10 transition-colors cursor-default shrink-0"
                >
                  {cmd}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {explainerSection}

      <SectionDivider />

      <HowItWorks />

      <SectionDivider />

      {/* Architecture showcase image */}
      <section className="py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            className="text-center mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              The{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                governed pipeline
              </span>
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
              From scan to commit — every step is auditable, reversible, and policy-controlled.
            </p>
          </motion.div>
          <motion.div
            className="relative rounded-2xl overflow-hidden border border-border/30 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <img 
              src={evolutionHero} 
              alt="EVOLUTION system architecture — governed AI improvement pipeline showing scan, dry-run, apply, and rollback stages" 
              className="w-full h-auto object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-primary/30 text-primary text-[10px] sm:text-xs">
                <Cpu className="w-3 h-3 mr-1" /> Governed Evolution Pipeline
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      <CaseStudies />
    </>
  );

  // ── Auth gate — show public view ────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SEO {...seoProps} />
        <PublicNav />
        {sharedContent}
        <SectionDivider />

        {/* Final CTA */}
        <section className="py-12 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Ready to{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">evolve</span>?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
                Sign in to connect your AI agent and start your first governed evolution cycle. No SDK required.
              </p>
              <div className="pt-2">
                <Button size="lg" onClick={() => navigate('/auth?redirect=/evolution')} className="gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Get started free
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <EnhancedFooter />
      </div>
    );
  }

  // ── Authenticated view ──────────────────────────────────
  return (
    <>
      <SEO
        {...seoProps}
        howTo={{
          name: 'How to evolve your codebase with CMPSBL EVOLUTION',
          description: 'Connect your AI coding agent and start governed evolution in 4 steps.',
          steps: [
            { name: 'Copy the prompt', text: 'Click the copy button to get your auth-injected EVOLUTION prompt with your personal JWT.' },
            { name: 'Paste into your agent', text: 'Drop it into Cursor, Windsurf, Cline, or any AI coding agent.' },
            { name: 'Say "Evolve CMPSBL"', text: 'Your agent scans, previews improvements with a dry-run, and asks before applying.' },
            { name: 'Watch your system improve', text: 'Health goes up, debt goes down. Every change is receipted and rollback-safe.' },
          ],
          totalTime: 'PT5M',
        }}
      />

      <div className="min-h-screen bg-background">
        <PublicNav />
        {sharedContent}
        <SectionDivider />

        {/* Tool tabs — Mission Control */}
        <section ref={toolsRef} className="py-12 sm:py-16" id="tools">
          <div className="max-w-5xl mx-auto px-4 space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-2"
            >
              <Badge variant="outline" className="border-primary/30 text-primary text-[11px] mb-2">
                <Activity className="w-3 h-3 mr-1" /> Authenticated tools
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                <span className="text-foreground">Mission </span>
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Control</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                Your evolution toolkit — connect your agent, preview dry-runs, rollback changes, and track system health trends.
              </p>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
              <TabsList className="flex w-full h-auto bg-muted/30 border border-border/30 rounded-xl p-1 overflow-x-auto scrollbar-none gap-1">
                <TabsTrigger value="connect" className="flex items-center gap-1.5 text-[11px] sm:text-sm py-2.5 px-2.5 sm:px-3 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary whitespace-nowrap shrink-0 min-w-0">
                  <Plug className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Connect</span>
                </TabsTrigger>
                <TabsTrigger value="dry-run" className="flex items-center gap-1.5 text-[11px] sm:text-sm py-2.5 px-2.5 sm:px-3 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary whitespace-nowrap shrink-0 min-w-0">
                  <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Dry-Run</span>
                </TabsTrigger>
                <TabsTrigger value="rollback" className="flex items-center gap-1.5 text-[11px] sm:text-sm py-2.5 px-2.5 sm:px-3 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary whitespace-nowrap shrink-0 min-w-0">
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Rollback</span>
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-1.5 text-[11px] sm:text-sm py-2.5 px-2.5 sm:px-3 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary whitespace-nowrap shrink-0 min-w-0">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Trends</span>
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center gap-1.5 text-[11px] sm:text-sm py-2.5 px-2.5 sm:px-3 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary whitespace-nowrap shrink-0 min-w-0">
                  <MessageSquareWarning className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Feedback</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="connect"><AgentConnectGuide /></TabsContent>
              <TabsContent value="dry-run"><DryRunPreview /></TabsContent>
              <TabsContent value="rollback"><RollbackPanel /></TabsContent>
              <TabsContent value="trends"><ScanTrendDashboard /></TabsContent>
              <TabsContent value="feedback"><FalsePositiveFeedback /></TabsContent>
            </Tabs>
          </div>
        </section>

        <EnhancedFooter />
      </div>
    </>
  );
}

// ── How It Works ────────────────────────────────────────────
function HowItWorks() {
  return (
    <section className="py-12 sm:py-20" id="how-it-works">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-3 border-primary/30 text-primary text-[11px]">
            <Sparkles className="w-3 h-3 mr-1" /> 4 steps
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="text-foreground">From copy-paste to </span>
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">evolved</span>
            <span className="text-foreground"> — in minutes</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mt-3 break-words">
            No SDK. No config files. Just paste your auth-injected prompt, speak a command, and evolve.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full border-border/30 bg-card/50 hover:bg-card hover:border-primary/20 transition-all group">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground/60 tracking-widest">{step.num}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Case Studies ────────────────────────────────────────────
function CaseStudies() {
  return (
    <section className="py-12 sm:py-20 bg-muted/5">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400 text-[11px]">
            <CheckCircle className="w-3 h-3 mr-1" /> Real results
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="text-foreground">Systems that </span>
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">evolved</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mt-3">
            Teams using EVOLUTION to find what they missed and fix what matters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {CASE_STUDIES.map((cs, i) => (
            <motion.div
              key={cs.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <Card className="h-full border-border/30 hover:border-primary/20 transition-all bg-card/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-sm sm:text-base">{cs.name}</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">{cs.industry}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Before</div>
                      <div className="text-lg sm:text-xl font-bold text-foreground">{cs.before.health}</div>
                      <div className="text-[10px] text-muted-foreground">health</div>
                      <div className="text-[10px] sm:text-xs text-destructive mt-1">{cs.before.debt} debt flags</div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
                      <div className="text-[10px] text-primary uppercase tracking-wider mb-1">After</div>
                      <div className="text-lg sm:text-xl font-bold text-primary">{cs.after.health}</div>
                      <div className="text-[10px] text-muted-foreground">health</div>
                      <div className="text-[10px] sm:text-xs text-emerald-400 mt-1">{cs.after.debt} debt flags</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] border-primary/20">
                      <Zap className="w-2.5 h-2.5 mr-1" />
                      {cs.cycles} cycles
                    </Badge>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-400">
                      +{cs.after.health - cs.before.health} health
                    </Badge>
                  </div>

                  <blockquote className="text-[11px] sm:text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3 break-words leading-relaxed">
                    "{cs.quote}"
                  </blockquote>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
