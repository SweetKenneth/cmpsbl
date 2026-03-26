import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, Shield, Brain, Zap, Globe, Rocket, CheckCircle2, Clock,
  Cpu, Layers, Beaker, Moon, GitBranch, Database, Activity, Satellite, Heart,
  DollarSign, Network, Wind, Eye, Lock, Workflow, Code2, Radio, Map,
  Fingerprint, Crown, Stethoscope, Hammer, Ghost, Telescope, Cog, Bug,
  Languages, Wheat, FlaskConical, Plug, Target, KeyRound, Compass, Scale,
  ScrollText, EyeOff, Accessibility, FileCheck, Waves, Send, Globe2,
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
// ROADMAP PHASES — Full Substrate Progression
// ═══════════════════════════════════════════════════════════

const PHASES = [
  {
    number: 1,
    name: "FOUNDATION",
    tagline: "40-Primitive Architecture & Core Runtime",
    status: "Live",
    description: "The full 40-primitive substrate is operational — 12 Organs, 12 Layers, 8 Engines, 8 Agents. Boot sequence, event bus, health monitoring, and the intent mesh are production-ready.",
    capabilities: [
      "Deterministic 12-stage boot via CORE Organ",
      "NERVE signal backbone with backpressure & circuit breaking",
      "IDENTITY actor attribution & session management",
      "SYSTEM lifecycle management & predictive failure engine",
      "RELAY webhook dispatch with delivery guarantees",
      "AUDIT append-only hash-chained compliance ledger",
    ],
    icon: Cpu,
  },
  {
    number: 2,
    name: "COGNITION",
    tagline: "Memory, Reasoning & Discovery",
    status: "Live",
    description: "The cognitive core is online — 4-tier memory, 12-engine reasoning, pattern discovery, and the Memory Stream crystallization pipeline powering autonomous capability generation.",
    capabilities: [
      "BRAIN 12-engine reasoning (deductive, inductive, abductive, analogical)",
      "MEMORY 4-tier architecture (Hot/Warm/Cold/Glacier)",
      "DREAM synthesis engine with lucid dreaming modes",
      "Memory Stream discovery with CJPI scoring",
      "CLM continuous learning & knowledge distillation",
      "DECODE multi-modal NLU with epistemic audit trail",
    ],
    icon: Brain,
  },
  {
    number: 3,
    name: "SECURITY & GOVERNANCE",
    tagline: "Defense, Compliance & Ethical AI",
    status: "Live",
    description: "Multi-layer security mesh, governance enforcement, and ethical guardrails are fully operational — protecting every action, every request, every output.",
    capabilities: [
      "DEFENSE prompt injection defense & threat intelligence",
      "IMMUNITY adaptive resilience with self-healing patterns",
      "GOVERNANCE 4-mode policy enforcement (autonomous/supervised/manual/lockdown)",
      "ACCESS SHA-256 API keys, scope hierarchy & rate limiting",
      "CONSCIENCE bias detection & ethical scoring",
      "PHANTOM PII masking & privacy-preserving computation",
    ],
    icon: Shield,
  },
  {
    number: 4,
    name: "ORCHESTRATION & ROUTING",
    tagline: "Multi-Agent Coordination & AI Fleet Management",
    status: "Live",
    description: "Intelligent routing, multi-agent orchestration, and cost-optimized AI fleet management — the substrate's operational backbone for production-scale workloads.",
    capabilities: [
      "NEXUS 14-provider fleet with health ranking & failover",
      "CORTEX DAG execution engine & cascade failure prediction",
      "INTENT cross-surface goal decomposition & capability crystallization",
      "ECONOMY real-time cost attribution & budget enforcement",
      "RIPPLE intelligent fan-out with priority routing & deduplication",
      "SANDBOX hermetically sealed execution environments",
    ],
    icon: Network,
  },
  {
    number: 5,
    name: "ECONOMY & MARKETPLACE",
    tagline: "Tokenization, Trade & Creator Royalties",
    status: "In Progress",
    description: "Crystallized memories become tradeable assets. Creators earn royalties, consumers purchase proven capabilities, and the marketplace handles licensing, pricing, and procurement.",
    capabilities: [
      "Memory marketplace with provenance verification",
      "Usage-based pricing & automatic creator royalties",
      "TREATY SLA enforcement & contract lifecycle management",
      "Enterprise procurement & bulk licensing workflows",
      "COMPASS capability discovery & trend analysis",
      "ATLAS governance hub & capability registry",
    ],
    icon: DollarSign,
  },
  {
    number: 6,
    name: "EVOLUTION",
    tagline: "Self-Improving Architecture via SEBA Pipeline",
    status: "In Progress",
    description: "The substrate evolves itself. Genetic-style mutation, shadow testing, fitness scoring, and governed selection produce increasingly capable systems — autonomously and safely.",
    capabilities: [
      "EVOLUTION 7-gate SEBA validation pipeline",
      "SHADOW traffic mirroring & divergence scoring",
      "ENGINEER predictive maintenance & architecture optimization",
      "MEDIC autonomous diagnostics & self-repair coordination",
      "ORACLE probabilistic forecasting & risk prediction",
      "REFLEX sub-millisecond pattern response & auto-remediation",
    ],
    icon: GitBranch,
  },
  {
    number: 7,
    name: "FEDERATION",
    tagline: "Multi-Substrate Networks & Sovereign Deployment",
    status: "Planned",
    description: "Independent substrate instances communicate, share capabilities, and form federated networks — each maintaining full sovereignty over their data and governance policies.",
    capabilities: [
      "SOVEREIGN jurisdictional compliance & data residency enforcement",
      "Federated capability sharing with consent management",
      "ECHO digital twin simulation across substrate boundaries",
      "Cross-substrate TREATY agreements with cryptographic signing",
      "Enterprise on-premise & air-gapped deployment",
      "Multi-region orchestration with COMPASS strategic navigation",
    ],
    icon: Globe,
  },
  {
    number: 8,
    name: "SILICON",
    tagline: "Hardware Export & Edge Intelligence",
    status: "Research",
    description: "Software memories compile to hardware. FPGA, ASIC, and edge device targets transform crystallized capabilities into dedicated silicon — the ultimate form of optimized execution.",
    capabilities: [
      "FORGE multi-target artifact generation (HDL, RTL, firmware)",
      "LINGUA cross-language compilation (25+ target languages)",
      "HARVEST automated training data pipeline for edge models",
      "INTEGRATION universal adapter bridge for IoT & embedded systems",
      "INCLUSIVE accessibility-first edge interfaces",
      "ENCODE AST-aware code generation for embedded targets",
    ],
    icon: Cpu,
  },
];

// ═══════════════════════════════════════════════════════════
// SUBSTRATE AREAS — How primitives map to roadmap
// ═══════════════════════════════════════════════════════════

const SUBSTRATE_AREAS = [
  {
    area: "Cognitive Core",
    primitives: ["BRAIN", "MEMORY", "DREAM", "CLM", "DECODE", "ENCODE"],
    description: "Reasoning, memory, learning, and language processing — the thinking center of the substrate.",
    phase: "Phase 2 — Live",
    icon: Brain,
  },
  {
    area: "Security Mesh",
    primitives: ["DEFENSE", "IMMUNITY", "PHANTOM", "ACCESS", "CONSCIENCE"],
    description: "Multi-layer protection — from prompt injection defense to ethical AI enforcement.",
    phase: "Phase 3 — Live",
    icon: Shield,
  },
  {
    area: "Orchestration Grid",
    primitives: ["CORTEX", "NEXUS", "INTENT", "RIPPLE", "NERVE", "SANDBOX"],
    description: "Request routing, multi-agent coordination, and isolated execution environments.",
    phase: "Phase 4 — Live",
    icon: Workflow,
  },
  {
    area: "Governance & Compliance",
    primitives: ["GOVERNANCE", "AUDIT", "TREATY", "SOVEREIGN", "ATLAS"],
    description: "Policy enforcement, immutable logging, SLA management, and data sovereignty.",
    phase: "Phase 5 — In Progress",
    icon: Scale,
  },
  {
    area: "Observation & Intelligence",
    primitives: ["VISION", "ORACLE", "COMPASS", "SHADOW", "ECHO"],
    description: "Observability, predictions, trend analysis, shadow testing, and digital twin simulation.",
    phase: "Phase 6 — In Progress",
    icon: Eye,
  },
  {
    area: "Infrastructure & Manufacturing",
    primitives: ["ENGINEER", "MEDIC", "FORGE", "HARVEST", "FORGE", "INTEGRATION"],
    description: "Self-tuning, diagnostics, artifact manufacturing, data acquisition, and external connectivity.",
    phase: "Phase 6–7 — In Progress",
    icon: Cog,
  },
  {
    area: "Communication & Translation",
    primitives: ["RELAY", "LINGUA", "INCLUSIVE", "REFLEX", "IDENTITY"],
    description: "Multi-language support, accessibility, rapid response, and actor attribution.",
    phase: "Phase 4–7 — Active",
    icon: Globe2,
  },
  {
    area: "Sovereignty & Federation",
    primitives: ["SOVEREIGN", "TREATY", "ECHO", "COMPASS", "ECONOMY"],
    description: "Data residency, federated sharing, cross-substrate agreements, and marketplace economics.",
    phase: "Phase 7–8 — Planned",
    icon: Crown,
  },
];

const DOMAIN_NODES = [
  {
    domain: "Bioinformatics",
    icon: Heart,
    signal: "DNA sequences",
    description: "Genomic pattern recognition, protein folding, drug interaction modeling. Crystallize from NCBI, UniProt, and clinical trial feeds.",
    opportunities: ["Precision medicine memories", "Gene therapy target discovery", "Clinical trial optimization"],
  },
  {
    domain: "Finance",
    icon: DollarSign,
    signal: "Financial signals",
    description: "Market microstructure analysis, risk modeling, and regulatory compliance engines at institutional scale.",
    opportunities: ["Algorithmic trading strategies", "Fraud detection meshes", "Regulatory reporting automation"],
  },
  {
    domain: "Astronomy",
    icon: Satellite,
    signal: "Satellite telemetry",
    description: "Deep-sky object classification, exoplanet detection, and gravitational wave analysis from observatory data.",
    opportunities: ["Exoplanet characterization", "Space debris tracking", "Multi-messenger event correlation"],
  },
  {
    domain: "Robotics",
    icon: Cpu,
    signal: "Sensor fusion",
    description: "Multi-modal perception, path planning, and real-time control loops crystallized from simulation data.",
    opportunities: ["Autonomous navigation stacks", "Manipulation skill transfer", "Sim-to-real bridges"],
  },
  {
    domain: "Climate",
    icon: Wind,
    signal: "Weather data",
    description: "Atmospheric modeling, carbon tracking, and extreme event prediction from NOAA, ERA5, and satellite feeds.",
    opportunities: ["Extreme weather prediction", "Carbon offset verification", "Agricultural yield optimization"],
  },
  {
    domain: "Cybersecurity",
    icon: Shield,
    signal: "Network packets",
    description: "Threat detection, vulnerability assessment, and incident response automation with governed response memories.",
    opportunities: ["Zero-day detection meshes", "Automated incident response", "Compliance audit automation"],
  },
];

const statusStyle: Record<string, string> = {
  Live: "bg-neon-green/10 text-neon-green dark:text-neon-green border-neon-green/20",
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
        title="Roadmap — 8-Phase Substrate Evolution | CMPSBL"
        description="CMPSBL's eight-phase roadmap from Foundation to Silicon: cognitive runtime, security mesh, orchestration, marketplace, self-evolution, federation, and hardware export. The full substrate progression."
        canonical="https://cmpsbl.com/roadmap"
        keywords={["CMPSBL roadmap", "cognitive infrastructure", "AI evolution", "substrate architecture", "self-improving software", "federated AI"]}
      />

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 gradient-mesh opacity-80" />
        <div
          className="absolute -top-32 left-1/3 w-[600px] h-[600px] rounded-full animate-hero-orb-1"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 55%)" }}
        />
        <div
          className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] rounded-full animate-hero-orb-3"
          style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.04) 0%, transparent 55%)" }}
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
              8-Phase Substrate Evolution
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6 leading-[0.95]">
              The Substrate
              <br />
              <span className="text-primary">Roadmap</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
              Eight phases. From a 40-primitive cognitive runtime to self-improving federated substrates compiled to silicon.
              Every phase unlocks new capabilities that compound on everything before it.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-neon-green" />
                <span>Phases 1–4 Live</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neon-blue" />
                <span>Phases 5–6 Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Beaker className="w-4 h-4 text-neon-purple" />
                <span>Phases 7–8 Research</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Phase Timeline ── */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-12">
            Eight Phases of Substrate Evolution
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
                      phase.status === "Live"
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
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
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
                  phase.status === "Live"
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

      {/* ── Substrate Areas Map ── */}
      <section className="container mx-auto px-4 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary font-mono text-xs tracking-widest uppercase">
              40 Primitives Across 8 Areas
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
              Substrate Area Progression
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Every primitive belongs to a functional area. Each area matures through the roadmap phases —
              building on previous capabilities and unlocking new ones.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SUBSTRATE_AREAS.map((area, i) => (
              <motion.div
                key={area.area}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-30px" }}
                variants={fadeUp}
                className="group p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 card-lift"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <area.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{area.area}</h3>
                    <p className="text-[10px] font-mono text-primary tracking-wider">{area.phase}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{area.description}</p>

                <div className="flex flex-wrap gap-1">
                  {area.primitives.map((p) => (
                    <Link
                      key={p}
                      to={`/modules/${p.toLowerCase()}`}
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border hover:border-primary/30 hover:text-primary transition-colors"
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Domain Nodes ── */}
      <section className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary font-mono text-xs tracking-widest uppercase">
                Domain-Specific Verticals
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
                Industry Verticals
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Domain verticals are specialized configurations that plug into every phase of the evolution timeline.
                Each brings its own signal types, compliance requirements, and revenue surfaces.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {DOMAIN_NODES.map((node, i) => (
                <motion.article
                  key={node.domain}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-30px" }}
                  variants={fadeUp}
                  className="group p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 card-lift"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <node.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{node.domain}</h3>
                      <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{node.signal}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{node.description}</p>

                  <div className="space-y-1.5">
                    {node.opportunities.map((opp) => (
                      <div key={opp} className="flex items-start gap-2 text-xs">
                        <Zap className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{opp}</span>
                      </div>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Revenue Stack ── */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-10 text-center">
              Revenue Compounds at Every Phase
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { phase: "Foundation", revenue: "Subscriptions", arpu: "$14/mo" },
                { phase: "Cognition", revenue: "Memory Packs", arpu: "$29/mo" },
                { phase: "Security", revenue: "Compliance", arpu: "$49/mo" },
                { phase: "Orchestration", revenue: "Compute", arpu: "$79/mo" },
                { phase: "Marketplace", revenue: "Royalties", arpu: "$120/mo" },
                { phase: "Evolution", revenue: "Autonomy", arpu: "$180/mo" },
                { phase: "Federation", revenue: "Enterprise", arpu: "Custom" },
                { phase: "Silicon", revenue: "Hardware", arpu: "License" },
              ].map((item) => (
                <div key={item.phase} className="text-center p-4 rounded-xl bg-card border border-border/60 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="text-[10px] font-mono text-muted-foreground tracking-wider mb-2 uppercase">{item.phase}</div>
                  <div className="text-base sm:text-lg font-black font-mono tabular-nums text-foreground">{item.arpu}</div>
                  <div className="text-[10px] text-primary font-medium mt-1">{item.revenue}</div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Each phase layers on top of the previous — revenue compounds, not replaces.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-28 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-6">
            Build on the Substrate
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Start at Foundation. Every capability compounds through every phase — growing in intelligence, autonomy, and value.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="min-h-[48px] px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                Start Building
                <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/architecture">
              <Button size="lg" variant="outline" className="min-h-[48px] px-8 font-semibold hover:border-primary/30 transition-all duration-200">
                Explore Architecture
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
