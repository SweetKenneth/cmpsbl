import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, Shield, Brain, Zap, Globe, Rocket, CheckCircle2, Clock,
  Cpu, Layers, Beaker, GitBranch, Database, Activity, DollarSign, Network,
  Eye, Lock, Workflow, Code2, Wrench, Puzzle, Package, Store,
  Crown, Stethoscope, Hammer, Target, Scale, Send, CreditCard, Users,
  FileSearch, Scan, BarChart3, ShoppingCart, Globe2, Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { RelatedCapabilities } from "@/components/RelatedCapabilities";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// ROADMAP — What we shipped, what's active, what's next
// ═══════════════════════════════════════════════════════════

const PHASES = [
  {
    number: 1,
    name: "SUBSTRATE",
    tagline: "40-Primitive Cognitive Infrastructure",
    status: "Shipped",
    description: "The full 40-primitive substrate is live — 12 Organs, 12 Layers, 8 Engines, 8 Agents. Boot sequence, event bus, health monitoring, circuit breakers, and the intent mesh are production-ready.",
    capabilities: [
      "12-stage deterministic boot via CORE Organ",
      "NERVE signal backbone with backpressure & circuit breaking",
      "DEFENSE multi-layer security mesh & bot protection",
      "GOVERNANCE 4-mode policy enforcement",
      "NEXUS 14-provider AI fleet routing",
      "AUDIT append-only hash-chained compliance ledger",
    ],
    icon: Cpu,
  },
  {
    number: 2,
    name: "DISCOVERY",
    tagline: "Memory Stream & Autonomous Scanning",
    status: "Shipped",
    description: "Memory Stream runs autonomous 8-hour discovery cycles — ingesting, classifying, scoring, and surfacing capabilities without human intervention. DREAM synthesis produces pre-conscious pattern emergence with zero AI inside.",
    capabilities: [
      "Memory Stream autonomous discovery pipeline",
      "DREAM algorithmic synthesis (no AI — Patent Pending, U.S. App. No. 64/029,678)",
      "CJPI scoring with graduated pricing tiers",
      "Foundry open archive for raw discoveries (CJPI < 68)",
      "CLM continuous learning with serialized snapshots",
      "DECODE diagnostic team (ENCODE + ORACLE + ENGINEER)",
    ],
    icon: Brain,
  },
  {
    number: 3,
    name: "REFURBISHMENT",
    tagline: "Ascension Pipeline & Code Assembly",
    status: "Shipped",
    description: "The Software Refurbishment Center is live. Users upload code, receive a full diagnostic, select primitives for hardening, and receive a Convex Core™ artifact with an HTML refurbishment report — all without replacing their original codebase.",
    capabilities: [
      "5-step Ascension pipeline (Upload → Diagnostic → Select → Queue → Debrief)",
      "Adaptive Limited Rates Engine for queue management",
      "Code Assembly service — reconstruction from fragments",
      "Code Splicing — substrate components injected into customer code",
      "25-language export including 7 hardware description languages",
      "IP protection via hex-encoded CJPI weights",
    ],
    icon: Wrench,
  },
  {
    number: 4,
    name: "COMMERCE",
    tagline: "Showroom, Plans & Stripe Integration",
    status: "Shipped",
    description: "The commercial model is live. Tiered subscriptions (Builder → Studio → Creator → Architect), Showroom artifact sales with CJPI-based pricing, Stripe checkout, and the npm package ecosystem are all operational.",
    capabilities: [
      "4-tier subscription model with 7-day free trials",
      "Showroom marketplace with 100-item static collections",
      "Graduated CJPI economy (Mint → Prime → Relic → Mythic → Apex)",
      "Stripe integration for subscriptions and one-off purchases",
      "@cmpsbl/cli and @cmpsbl/sdk published on npm",
      "Persistent Memory SDK for developer integration",
    ],
    icon: ShoppingCart,
  },
  {
    number: 5,
    name: "SITE & SEO",
    tagline: "Public Presence, Content & Developer Docs",
    status: "Shipped",
    description: "Full public-facing site with the Software Refurbishment Center branding, automated blog pipeline, developer documentation, scanner tools, and SEO infrastructure — all live under the REVIVAL epoch (v18.0.0).",
    capabilities: [
      "Software Refurbishment Center branding across all surfaces",
      "Automated blog pipeline with confidence scoring",
      "Scanner diagnostic tool for public-facing code analysis",
      "Full developer documentation with runtime reference",
      "DEFENSE WordPress plugin for bot protection",
      "Agency system for multi-agent task orchestration",
    ],
    icon: Globe,
  },
  {
    number: 6,
    name: "ACTIVATION",
    tagline: "User Onboarding, Conversion & Retention",
    status: "In Progress",
    description: "Converting visitors into paying members. Tightening the funnel from Scanner → Showroom → Code Assembly → Subscription. Building trust signals, case studies, and guided onboarding flows.",
    capabilities: [
      "Guided first-run experience from scan to subscription",
      "Code Assembly intake form with file upload",
      "Member dashboard with restoration history",
      "Email notifications for completed restorations",
      "Referral program for member-to-member growth",
      "Public case studies showing before/after restorations",
    ],
    icon: Users,
  },
  {
    number: 7,
    name: "SCALE",
    tagline: "Enterprise, API Access & Volume Operations",
    status: "Planned",
    description: "Moving from individual users to teams and enterprises. API access for programmatic restorations, bulk licensing, SLA guarantees, and white-label deployment options.",
    capabilities: [
      "REST API for programmatic code submission and retrieval",
      "Enterprise team accounts with role-based access",
      "Bulk restoration pricing for agencies and studios",
      "SLA-backed turnaround guarantees (TREATY enforcement)",
      "White-label deployment for partners",
      "Priority queue with dedicated compute allocation",
    ],
    icon: Network,
  },
  {
    number: 8,
    name: "FEDERATION",
    tagline: "Multi-Substrate Networks & Sovereign Deployment",
    status: "Research",
    description: "Independent substrate instances communicating, sharing discoveries, and forming federated networks — each maintaining full sovereignty over data and governance policies.",
    capabilities: [
      "SOVEREIGN jurisdictional compliance & data residency",
      "Federated capability sharing with consent management",
      "Cross-substrate TREATY agreements with cryptographic signing",
      "On-premise and air-gapped deployment",
      "Multi-region orchestration with COMPASS navigation",
      "Hardware export targets (FPGA, ASIC, edge devices)",
    ],
    icon: Globe2,
  },
];

// ═══════════════════════════════════════════════════════════
// What's next — concrete upcoming milestones
// ═══════════════════════════════════════════════════════════

const NEXT_STEPS = [
  {
    title: "Code Assembly File Upload",
    description: "Let users upload ZIP archives, Git repos, or individual files directly through the Assembly page for restoration.",
    target: "Q3 2026",
    icon: Package,
    priority: "high" as const,
  },
  {
    title: "Restoration Status Tracker",
    description: "Real-time progress view showing which primitives are analyzing your code and estimated completion.",
    target: "Q3 2026",
    icon: Activity,
    priority: "high" as const,
  },
  {
    title: "Member Dashboard",
    description: "Centralized view of your restorations, subscriptions, purchased artifacts, and diagnostic history.",
    target: "Q3 2026",
    icon: BarChart3,
    priority: "high" as const,
  },
  {
    title: "Before/After Case Studies",
    description: "Public examples showing real code restorations — what came in broken, what went out working.",
    target: "Q3 2026",
    icon: FileSearch,
    priority: "medium" as const,
  },
  {
    title: "Email Delivery Pipeline",
    description: "Automated email delivery of completed restorations, refurbishment reports, and diagnostic summaries.",
    target: "Q4 2026",
    icon: Send,
    priority: "medium" as const,
  },
  {
    title: "REST API for Restorations",
    description: "Programmatic access to submit code, check status, and retrieve results — for agencies and power users.",
    target: "Q4 2026",
    icon: Code2,
    priority: "medium" as const,
  },
];

const statusStyle: Record<string, string> = {
  Shipped: "bg-neon-green/10 text-neon-green dark:text-neon-green border-neon-green/20",
  "In Progress": "bg-neon-blue/10 text-neon-blue dark:text-neon-blue border-neon-blue/20",
  Planned: "bg-neon-amber/10 text-neon-amber dark:text-neon-amber border-neon-amber/20",
  Research: "bg-neon-purple/10 text-neon-purple dark:text-neon-purple border-neon-purple/20",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-background relative">
      <SEO
        title="Roadmap — What We Shipped & What's Next | CMPSBL"
        description="See what CMPSBL has shipped: the 40-primitive substrate, Memory Stream discovery, Ascension refurbishment pipeline, Showroom marketplace, and Code Assembly service. Plus what's coming next."
        canonical="https://cmpsbl.com/roadmap"
        keywords={["CMPSBL roadmap", "software refurbishment", "code restoration", "substrate architecture", "shipped features", "product roadmap"]}
      />

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 gradient-mesh opacity-80" />
        <div
          className="absolute -top-32 left-1/3 w-[600px] h-[600px] rounded-full animate-hero-orb-1"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 55%)" }}
        />
      </div>

      <PublicNav />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

        <div className="relative container mx-auto px-4 pt-28 sm:pt-36 pb-16 sm:pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl">
            <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/5 text-primary font-mono text-xs tracking-widest uppercase">
              <Sparkles className="w-3 h-3 mr-2" />
              v18.0.0 · Epoch: REVIVAL
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6 leading-[0.95]">
              What We Built.
              <br />
              <span className="text-primary">What's Next.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
              No vaporware. Five phases shipped, one in progress, two on the horizon. 
              Here's exactly where we are and where we're going.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-neon-green" />
                <span>5 Phases Shipped</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neon-blue" />
                <span>1 In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <Beaker className="w-4 h-4 text-neon-purple" />
                <span>2 On the Horizon</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Phase Timeline ── */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-12">
            The Full Timeline
          </h2>

          <div className="relative">
            {/* Vertical line with glow */}
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px hidden sm:block overflow-hidden">
              <div className="absolute inset-0 bg-border" />
              <motion.div
                className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-primary/50 to-transparent"
                initial={{ height: '0%' }}
                whileInView={{ height: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
            </div>

            <div className="space-y-8 sm:space-y-12">
              {PHASES.map((phase, i) => (
                <motion.div
                  key={phase.name}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  className="relative"
                >
                  {/* Phase number dot */}
                  <div className="hidden sm:flex absolute left-0 top-0 w-12 sm:w-16 h-12 sm:h-16 items-center justify-center">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border-2 z-10",
                      phase.status === "Shipped"
                        ? "bg-primary text-primary-foreground border-primary"
                        : phase.status === "In Progress"
                          ? "bg-primary/20 text-primary border-primary/50"
                          : "bg-card text-foreground border-border"
                    )}>
                      {phase.number}
                    </div>
                  </div>

                  {/* Card */}
                  <div className="sm:ml-24 group">
                    <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 card-lift">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3">
                          <div className="sm:hidden w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-black text-sm text-primary">
                            {phase.number}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">{phase.name}</h3>
                              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider", statusStyle[phase.status])}>
                                {phase.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium mt-0.5">{phase.tagline}</p>
                          </div>
                        </div>
                        <phase.icon className="hidden sm:block w-8 h-8 text-muted-foreground/30 group-hover:text-primary/40 transition-colors shrink-0" />
                      </div>

                      <p className="text-muted-foreground leading-relaxed mb-6">{phase.description}</p>

                      <div className="grid sm:grid-cols-2 gap-2">
                        {phase.capabilities.map((cap) => (
                          <div key={cap} className="flex items-start gap-2 text-sm">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                              phase.status === "Shipped" ? "bg-neon-green" : "bg-primary"
                            )} />
                            <span className="text-muted-foreground">{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Phase Flow Strip ── */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono">
            {PHASES.map((phase, i) => (
              <div key={phase.name} className="flex items-center gap-2 sm:gap-3">
                <span className={cn(
                  "px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold tracking-wide",
                  phase.status === "Shipped"
                    ? "bg-primary text-primary-foreground"
                    : phase.status === "In Progress"
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "bg-card text-muted-foreground border border-border"
                )}>
                  {phase.name}
                </span>
                {i < PHASES.length - 1 && (
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's Next — Concrete Milestones ── */}
      <section className="container mx-auto px-4 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary font-mono text-xs tracking-widest uppercase">
              Upcoming Milestones
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
              What's Coming Next
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Concrete features on the build list — no vaporware, no "someday." These are the next things you'll see go live.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {NEXT_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                variants={fadeUp}
                className="group p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 card-lift"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    step.priority === "high"
                      ? "bg-primary/15 group-hover:bg-primary/20"
                      : "bg-muted group-hover:bg-muted/80"
                  )}>
                    <step.icon className={cn(
                      "w-5 h-5",
                      step.priority === "high" ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-foreground mb-0.5">{step.title}</h3>
                    <span className="text-[10px] font-mono text-muted-foreground tracking-wider">{step.target}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Revenue Stack ── */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-4 text-center">
              Revenue Grows at Every Phase
            </h2>
            <p className="text-center text-sm text-muted-foreground mb-10 max-w-lg mx-auto">
              Each phase layers new revenue on top of the previous — compounding, not replacing.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { phase: "Substrate", revenue: "npm Installs", status: "shipped" },
                { phase: "Discovery", revenue: "Memory Packs", status: "shipped" },
                { phase: "Refurbishment", revenue: "Restoration Fees", status: "shipped" },
                { phase: "Commerce", revenue: "Subscriptions + Sales", status: "shipped" },
                { phase: "Site & SEO", revenue: "Organic Traffic", status: "shipped" },
                { phase: "Activation", revenue: "Conversion + Retention", status: "active" },
                { phase: "Scale", revenue: "Enterprise + API", status: "planned" },
                { phase: "Federation", revenue: "Licensing + Hardware", status: "planned" },
              ].map((item) => (
                <div key={item.phase} className={cn(
                  "text-center p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5",
                  item.status === "shipped"
                    ? "bg-card border-neon-green/20"
                    : item.status === "active"
                      ? "bg-card border-primary/30"
                      : "bg-card border-border/60"
                )}>
                  <div className="text-[10px] font-mono text-muted-foreground tracking-wider mb-2 uppercase">{item.phase}</div>
                  <div className={cn(
                    "text-xs font-bold",
                    item.status === "shipped" ? "text-neon-green" : item.status === "active" ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.status === "shipped" ? "✓ Live" : item.status === "active" ? "Building" : "Planned"}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{item.revenue}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-28 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-6">
            See It in Action
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Five phases shipped. Working software. Browse the Showroom, run a diagnostic, or bring us your broken code — we'll restore it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/assembly">
              <Button size="lg" className="min-h-[48px] px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                <Wrench className="w-5 h-5 mr-2" />
                Code Assembly
              </Button>
            </Link>
            <Link to="/showroom">
              <Button size="lg" variant="outline" className="min-h-[48px] px-8 font-semibold hover:border-primary/30 transition-all duration-200">
                Explore Showroom
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <RelatedCapabilities />
      <PageSEOBlock path="/roadmap" title="Product Roadmap" />
      <EnhancedFooter />
    </div>
  );
}
