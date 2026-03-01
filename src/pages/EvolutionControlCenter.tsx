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
  Cpu, GitBranch, Eye, Layers
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

// ── Animated Evolution Diagram ──────────────────────────────
function EvolutionDiagram() {
  const nodes = [
    { label: 'SCAN', icon: Eye, x: '10%', y: '20%', delay: 0 },
    { label: 'DRY-RUN', icon: FlaskConical, x: '40%', y: '10%', delay: 0.3 },
    { label: 'REVIEW', icon: Shield, x: '70%', y: '20%', delay: 0.6 },
    { label: 'APPLY', icon: Zap, x: '80%', y: '55%', delay: 0.9 },
    { label: 'RECEIPT', icon: Layers, x: '50%', y: '70%', delay: 1.2 },
    { label: 'ROLLBACK', icon: RotateCcw, x: '15%', y: '60%', delay: 1.5 },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none">
        <motion.path
          d="M 15 25 Q 30 10 45 15 Q 60 10 75 25 Q 85 40 85 60 Q 70 80 55 75 Q 35 80 20 65 Q 10 50 15 25"
          stroke="hsl(var(--primary) / 0.2)"
          strokeWidth="0.5"
          strokeDasharray="3 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
        {/* Flowing pulse along the path */}
        <motion.circle
          r="1.5"
          fill="hsl(var(--primary))"
          opacity={0.6}
          initial={{ offsetDistance: '0%' }}
          animate={{ offsetDistance: '100%' }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <animateMotion
            dur="4s"
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
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: node.delay }}
        >
          <motion.div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-card border border-border/50 flex items-center justify-center shadow-sm"
            whileHover={{ scale: 1.1, borderColor: 'hsl(var(--primary))' }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
          >
            <node.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </motion.div>
          <span className="text-[10px] sm:text-xs font-mono text-muted-foreground tracking-wider">
            {node.label}
          </span>
        </motion.div>
      ))}

      {/* Center label */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="text-center">
          <motion.div
            className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full border-2 border-primary/30 bg-primary/5 flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <GitBranch className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </motion.div>
          <span className="text-xs font-bold text-foreground mt-1 block">EVOLVE</span>
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
    <div className="relative py-8 sm:py-16">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <motion.div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/40"
        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
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

  // ── Shared Hero ─────────────────────────────────────────
  const heroSection = (
    <section className="relative overflow-hidden">
      {/* Ambient background mesh */}
      <div className="absolute inset-0 bg-[image:var(--gradient-mesh)] opacity-60" />
      <motion.div 
        className="absolute top-0 right-0 w-48 sm:w-[400px] h-48 sm:h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 60%)" }}
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-5 sm:space-y-6"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="border-primary/40 text-primary px-3 py-1">
                <Zap className="w-3 h-3 mr-1" /> Governed Self-Improvement
              </Badge>
              {user && (
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 px-3 py-1">
                  <Shield className="w-3 h-3 mr-1" /> Authenticated
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              <span className="text-foreground">Your system evolves.</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                You stay in control.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              EVOLUTION connects AI coding agents to your codebase with a governed improvement loop. 
              Every change starts as a dry-run. Every applied change is receipted with an immutable audit trail. 
              And everything is rollback-safe — one click undoes any cycle.
            </p>

            <p className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed max-w-xl">
              No SDKs to install. No config files. Just paste your auth-injected prompt into Cursor, Windsurf, 
              or Cline, say <span className="font-mono text-primary">"Evolve CMPSBL"</span>, and watch your 
              system health climb while technical debt drops — safely, measurably, and on your terms.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {user ? (
                <>
                  <Button size="lg" onClick={scrollToTools} className="gap-2">
                    <Terminal className="w-4 h-4" />
                    Open tools
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }} className="gap-2">
                    How it works
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate('/auth?redirect=/evolution')} className="gap-2">
                    <Lock className="w-4 h-4" />
                    Sign in to evolve
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }} className="gap-2">
                    See how it works
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          {/* Right: Animated diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden sm:block"
          >
            <EvolutionDiagram />
          </motion.div>
        </div>

        {/* Quick stats */}
        <motion.div 
          className="grid grid-cols-3 gap-4 sm:gap-6 mt-10 sm:mt-14 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AnimatedStat label="Avg health lift" value="+28" suffix="pts" />
          <AnimatedStat label="Avg debt reduction" value="−15" suffix="flags" />
          <AnimatedStat label="Avg cycles" value="4" suffix="" />
        </motion.div>
      </div>
    </section>
  );

  // ── Auth gate — show public view ────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SEO {...seoProps} />
        <PublicNav />
        {heroSection}
        <HowItWorks />
        <SectionDivider />
        <CaseStudies />
        <SectionDivider />

        {/* Final CTA */}
        <section className="py-12 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Ready to{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">evolve</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Sign in to connect your AI agent and start your first evolution cycle.</p>
            <Button size="lg" onClick={() => navigate('/auth?redirect=/evolution')} className="gap-2">
              <ArrowRight className="w-4 h-4" />
              Get started
            </Button>
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
        {heroSection}

        {/* Quick command strip */}
        <section className="border-y border-border/30 bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs text-muted-foreground whitespace-nowrap font-medium shrink-0">Quick commands:</span>
              {['"Scan CMPSBL"', '"Evolve CMPSBL"', '"Rollback CMPSBL"', '"Check health"', '"Show history"'].map((cmd) => (
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

        <HowItWorks />
        <SectionDivider />

        {/* Hero image showcase */}
        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4">
            <motion.div
              className="relative rounded-2xl overflow-hidden border border-border/30"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <img 
                src={evolutionHero} 
                alt="EVOLUTION system architecture — governed AI improvement pipeline" 
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-primary/30 text-primary text-xs">
                  <Cpu className="w-3 h-3 mr-1" /> Governed Evolution Pipeline
                </Badge>
              </div>
            </motion.div>
          </div>
        </section>

        <SectionDivider />
        <CaseStudies />
        <SectionDivider />

        {/* Tool tabs — Mission Control */}
        <section ref={toolsRef} className="py-12 sm:py-16" id="tools">
          <div className="max-w-5xl mx-auto px-4 space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                <span className="text-foreground">Mission </span>
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Control</span>
              </h2>
              <p className="text-muted-foreground mt-2">Your evolution toolkit — connect, preview, rollback, and track.</p>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
              {/* Mobile: scrollable tab list; Desktop: grid */}
              <TabsList className="flex sm:grid sm:grid-cols-5 w-full h-auto bg-muted/30 border border-border/30 rounded-xl p-1 overflow-x-auto scrollbar-none gap-1">
                <TabsTrigger value="connect" className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 px-3 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary whitespace-nowrap shrink-0">
                  <Plug className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Agent</span> Connect
                </TabsTrigger>
                <TabsTrigger value="dry-run" className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 px-3 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary whitespace-nowrap shrink-0">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dry-Run</span> Preview
                </TabsTrigger>
                <TabsTrigger value="rollback" className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 px-3 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary whitespace-nowrap shrink-0">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Rollback
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 px-3 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary whitespace-nowrap shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Trends
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 px-3 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary whitespace-nowrap shrink-0">
                  <MessageSquareWarning className="w-3.5 h-3.5" />
                  Feedback
                </TabsTrigger>
              </TabsList>

              <TabsContent value="connect">
                <AgentConnectGuide />
              </TabsContent>
              <TabsContent value="dry-run">
                <DryRunPreview />
              </TabsContent>
              <TabsContent value="rollback">
                <RollbackPanel />
              </TabsContent>
              <TabsContent value="trends">
                <ScanTrendDashboard />
              </TabsContent>
              <TabsContent value="feedback">
                <FalsePositiveFeedback />
              </TabsContent>
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
    <section className="py-12 sm:py-24" id="how-it-works">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div 
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <Sparkles className="w-3 h-3 mr-1" /> 4 steps
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="text-foreground">From copy-paste to </span>
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">evolved</span>
            <span className="text-foreground"> — in minutes</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-3">
            No SDK. No config files. Just paste, speak, and evolve.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full border-border/30 bg-muted/10 hover:bg-muted/20 hover:border-primary/20 transition-all group">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{step.num}</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed break-words">{step.description}</p>
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
    <section className="py-12 sm:py-24 bg-muted/10">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div 
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4 border-emerald-500/30 text-emerald-400">
            <CheckCircle className="w-3 h-3 mr-1" /> Real results
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="text-foreground">Systems that </span>
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">evolved</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-3">
            Teams using EVOLUTION to find what they missed and fix what matters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {CASE_STUDIES.map((cs, i) => (
            <motion.div
              key={cs.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <Card className="h-full border-border/30 hover:border-primary/20 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-base">{cs.name}</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">{cs.industry}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Before</div>
                      <div className="text-xl font-bold text-foreground">{cs.before.health}</div>
                      <div className="text-[10px] text-muted-foreground">health</div>
                      <div className="text-xs text-destructive mt-1">{cs.before.debt} debt flags</div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
                      <div className="text-[10px] text-primary uppercase tracking-wider mb-1">After</div>
                      <div className="text-xl font-bold text-primary">{cs.after.health}</div>
                      <div className="text-[10px] text-muted-foreground">health</div>
                      <div className="text-xs text-emerald-400 mt-1">{cs.after.debt} debt flags</div>
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

                  <blockquote className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3 break-words">
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
