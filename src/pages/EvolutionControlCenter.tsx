/**
 * EVOLUTION Control Center — First-class mission control for system evolution
 * Immersive hero, case studies, guided agent connection, and governance tools
 */

import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FlaskConical, RotateCcw, TrendingUp, MessageSquareWarning, 
  Plug, Lock, ArrowRight, Zap, Shield, Terminal, 
  CheckCircle, Sparkles, ChevronDown, Copy, Check, Activity
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
      <div className="text-3xl sm:text-4xl font-bold text-foreground">
        {value}<span className="text-primary">{suffix}</span>
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
}

// ── Section divider ─────────────────────────────────────────
function SectionDivider() {
  return (
    <div className="relative py-10 sm:py-16">
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

  // ── Auth gate ───────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNav />
        
        {/* Hero even for unauthenticated — sell the concept */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img src={evolutionHero} alt="" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 py-24 sm:py-32 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Badge variant="outline" className="mb-6 border-primary/40 text-primary px-4 py-1.5">
                <Zap className="w-3 h-3 mr-1.5" /> Governed Self-Improvement
              </Badge>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-6">
                Your system evolves.<br />
                <span className="text-primary">You stay in control.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                EVOLUTION scans your codebase, previews improvements with dry-runs, 
                and applies changes only when you say go. Every cycle is receipted. Every action is rollback-safe.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              </div>
            </motion.div>
          </div>
        </section>

        {/* How it works — visible to everyone */}
        <HowItWorks />
        <SectionDivider />
        <CaseStudies />
        <SectionDivider />

        {/* Final CTA */}
        <section className="py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Ready to evolve?</h2>
            <p className="text-muted-foreground mb-8">Sign in to connect your AI agent and start your first evolution cycle.</p>
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
      <Helmet>
        <title>EVOLUTION Control Center — CMPSBL Substrate</title>
        <meta name="description" content="Mission control for governed system evolution. Connect your AI agent, preview improvements, and evolve your codebase safely." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <PublicNav />

        {/* Hero — authenticated version */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img src={evolutionHero} alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
          </div>

          {/* Ambient glow */}
          <motion.div 
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 60%)" }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-12 sm:pt-24 sm:pb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="border-primary/40 text-primary px-3 py-1">
                  <Zap className="w-3 h-3 mr-1" /> EVOLUTION
                </Badge>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 px-3 py-1">
                  <Shield className="w-3 h-3 mr-1" /> Authenticated
                </Badge>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
                EVOLUTION <span className="text-primary">Control Center</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
                Connect your AI agent, preview impacts before they happen, and watch your system improve — safely, measurably, and on your terms.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button onClick={scrollToTools} className="gap-2">
                  <Terminal className="w-4 h-4" />
                  Open tools
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={() => navigate('/admin/evolution')} className="gap-2">
                  <Activity className="w-4 h-4" />
                  Evolution Dashboard
                </Button>
              </div>
            </motion.div>

            {/* Quick stats */}
            <motion.div 
              className="grid grid-cols-3 gap-6 mt-12 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <AnimatedStat label="Avg health lift" value="+28" suffix="pts" />
              <AnimatedStat label="Avg debt reduction" value="−15" suffix="flags" />
              <AnimatedStat label="Avg cycles" value="4" suffix="" />
            </motion.div>
          </div>
        </section>

        {/* Quick command strip */}
        <section className="border-y border-border/30 bg-muted/20">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">Quick commands:</span>
              {[
                '"Scan CMPSBL"',
                '"Evolve CMPSBL"',
                '"Rollback CMPSBL"',
                '"Check health"',
                '"Show history"',
              ].map((cmd) => (
                <Badge 
                  key={cmd} 
                  variant="secondary" 
                  className="whitespace-nowrap font-mono text-xs px-3 py-1 bg-muted/50 hover:bg-primary/10 transition-colors cursor-default"
                >
                  {cmd}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <HowItWorks />
        <SectionDivider />
        <CaseStudies />
        <SectionDivider />

        {/* Tool tabs */}
        <section ref={toolsRef} className="py-12 sm:py-16" id="tools">
          <div className="max-w-5xl mx-auto px-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Mission Control</h2>
              <p className="text-muted-foreground">Your evolution toolkit — connect, preview, rollback, and track.</p>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 h-auto bg-muted/30 border border-border/30 rounded-xl p-1">
                <TabsTrigger value="connect" className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Plug className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Agent</span> Connect
                </TabsTrigger>
                <TabsTrigger value="dry-run" className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dry-Run</span> Preview
                </TabsTrigger>
                <TabsTrigger value="rollback" className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Rollback
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Trends
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
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
    <section className="py-16 sm:py-24" id="how-it-works">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <Sparkles className="w-3 h-3 mr-1" /> 4 steps
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            From copy-paste to evolved — in minutes
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            No SDK. No config files. Just paste, speak, and evolve.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
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
    <section className="py-16 sm:py-24 bg-muted/10">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4 border-emerald-500/30 text-emerald-400">
            <CheckCircle className="w-3 h-3 mr-1" /> Real results
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Systems that evolved
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Teams using EVOLUTION to find what they missed and fix what matters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{cs.name}</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">{cs.industry}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Before → After metrics */}
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

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] border-primary/20">
                      <Zap className="w-2.5 h-2.5 mr-1" />
                      {cs.cycles} cycles
                    </Badge>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-400">
                      +{cs.after.health - cs.before.health} health
                    </Badge>
                  </div>

                  <blockquote className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">
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
