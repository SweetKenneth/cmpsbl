import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Brain, Zap, Globe, Rocket, CheckCircle2, Clock, Cpu, Layers, Beaker, Moon, GitBranch, Database, Activity, Satellite, Heart, DollarSign, Network, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { RelatedCapabilities } from "@/components/RelatedCapabilities";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PHASES = [
  {
    number: 1,
    name: "DISCOVERY",
    tagline: "Pattern Mining & Crystallization",
    status: "Live",
    color: "primary",
    description: "The substrate mines, scores, and crystallizes viable software patterns from the Memory Stream. Real memories — scored, verified, exportable.",
    capabilities: [
      "Crystallization engine with quality floor (68+)",
      "Memory scoring & provenance tracking",
      "40-node topology with 12 sector coverage",
      "Memory packs & slot-based activation",
    ],
    icon: Sparkles,
  },
  {
    number: 2,
    name: "ECONOMY",
    tagline: "Tokenization & Trade",
    status: "In Progress",
    color: "primary",
    description: "Memories become tradeable assets. Creators earn from crystallized work. Consumers purchase proven, governed capabilities on-demand.",
    capabilities: [
      "Memory marketplace with provenance verification",
      "Usage-based pricing & creator royalties",
      "Governed asset exchange with audit trails",
      "Enterprise procurement & bulk licensing",
    ],
    icon: DollarSign,
  },
  {
    number: 3,
    name: "ENGINES",
    tagline: "Sealed Runtime Execution",
    status: "In Progress",
    color: "primary",
    description: "Domain-specific execution engines that run memories at production scale. Sealed, optimized, and governed — not general-purpose containers.",
    capabilities: [
      "20 sealed runtime engines across verticals",
      "Hot-swappable execution zones",
      "Latency-optimized routing via NEXUS",
      "Engine-level telemetry & cost governance",
    ],
    icon: Cpu,
  },
  {
    number: 4,
    name: "DREAMING",
    tagline: "Autonomous Simulation & Synthesis",
    status: "Planned",
    color: "primary",
    description: "The substrate dreams. Off-cycle simulation generates synthetic data, stress-tests memories, and surfaces latent patterns humans never asked for.",
    capabilities: [
      "Dream cycle scheduling & resource allocation",
      "Synthetic data generation for domain nodes",
      "Autonomous memory stress-testing",
      "Emergent pattern surfacing & flagging",
    ],
    icon: Moon,
  },
  {
    number: 5,
    name: "EVOLUTION",
    tagline: "Self-Improving Architecture",
    status: "Research",
    color: "primary",
    description: "Memories that rewrite themselves. Genetic-style mutation, fitness scoring, and governed selection produce increasingly capable systems — autonomously.",
    capabilities: [
      "Architecture mutation with fitness scoring",
      "Governed selection & rollback safety",
      "Cross-memory trait inheritance",
      "Autonomous code modernization & hardening",
    ],
    icon: GitBranch,
  },
];

const DOMAIN_NODES = [
  {
    domain: "Bioinformatics",
    icon: Heart,
    signal: "DNA sequences",
    description: "Genomic pattern recognition, protein folding processes, drug interaction modeling. Crystallize from NCBI, UniProt, and clinical trial feeds.",
    opportunities: ["Precision medicine memories", "Gene therapy target discovery", "Clinical trial optimization"],
  },
  {
    domain: "Finance",
    icon: DollarSign,
    signal: "Financial signals",
    description: "Market microstructure analysis, risk modeling, and regulatory compliance engines. Real-time signal processing at institutional scale.",
    opportunities: ["Algorithmic trading strategies", "Fraud detection meshes", "Regulatory reporting automation"],
  },
  {
    domain: "Astronomy",
    icon: Satellite,
    signal: "Satellite telemetry",
    description: "Deep-sky object classification, exoplanet detection, and gravitational wave analysis. Process petabytes of observatory data into actionable memories.",
    opportunities: ["Exoplanet characterization", "Space debris tracking", "Multi-messenger event correlation"],
  },
  {
    domain: "Robotics",
    icon: Cpu,
    signal: "Sensor fusion",
    description: "Multi-modal perception, path planning, and real-time control loops. Crystallize navigation and manipulation primitives from simulation data.",
    opportunities: ["Autonomous navigation stacks", "Manipulation skill transfer", "Sim-to-real bridges"],
  },
  {
    domain: "Climate",
    icon: Wind,
    signal: "Weather data",
    description: "Atmospheric modeling, carbon tracking, and extreme event prediction. Ingest NOAA, ERA5, and satellite feeds into governed climate memories.",
    opportunities: ["Extreme weather prediction", "Carbon offset verification", "Agricultural yield optimization"],
  },
  {
    domain: "Cybersecurity",
    icon: Shield,
    signal: "Network packets",
    description: "Threat detection, vulnerability assessment, and incident response automation. Real-time packet analysis with governed response memories.",
    opportunities: ["Zero-day detection meshes", "Automated incident response", "Compliance audit automation"],
  },
];

const statusStyle: Record<string, string> = {
  Live: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "In Progress": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Planned: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Research: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Roadmap — 5-Phase Plan to Silicon | CMPSBL"
        description="CMPSBL's five-phase roadmap: Discovery (signal capture), Evolution (self-improvement), Specialization (domain nodes), Federation (multi-substrate), and Silicon (hardware export). What's next."
        canonical="https://cmpsbl.com/roadmap"
        keywords={["CMPSBL roadmap", "cognitive infrastructure", "AI evolution", "domain nodes", "self-improving software"]}
      />
      <PublicNav />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="relative container mx-auto px-4 pt-28 sm:pt-36 pb-16 sm:pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl">
            <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/5 text-primary font-mono text-xs tracking-widest uppercase">
              <Sparkles className="w-3 h-3 mr-2" />
              Discovery → Economy → Engines → Dreaming → Evolution
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground mb-6 leading-[0.95]">
              The Evolution
              <br />
              <span className="text-primary">Roadmap</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
              Five phases. From crystallizing patterns to self-improving architecture.
              Every phase unlocks new revenue, new domains, and new capabilities that compound.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Phase 1 Live</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Phases 2-3 Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Beaker className="w-4 h-4 text-purple-500" />
                <span>6 Domain Verticals</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Phase Timeline ── */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-12">
            Five Phases of Cognitive Evolution
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
                            <div className="flex items-center gap-3">
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
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm sm:text-base font-mono">
            {PHASES.map((phase, i) => (
              <div key={phase.name} className="flex items-center gap-3 sm:gap-4">
                <span className={cn(
                  "px-3 py-1.5 rounded-lg font-bold tracking-wide",
                  phase.status === "Live"
                    ? "bg-primary text-primary-foreground"
                    : phase.status === "In Progress"
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "bg-card text-muted-foreground border border-border"
                )}>
                  {phase.name}
                </span>
                {i < PHASES.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Domain Nodes ── */}
      <section className="container mx-auto px-4 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary font-mono text-xs tracking-widest uppercase">
              Domain-Specific Nodes
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
              Industry Verticals
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Domain nodes are specialized primitives that plug into every phase of the evolution timeline.
              Each vertical brings its own signal types, compliance requirements, and revenue surfaces.
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
      </section>

      {/* ── Revenue Stack ── */}
      <section className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-10 text-center">
              Revenue Compounds at Every Phase
            </h2>

            <div className="grid sm:grid-cols-5 gap-4">
              {[
                { phase: "DISCOVERY", revenue: "Subscriptions", arpu: "$14/mo" },
                { phase: "ECONOMY", revenue: "Marketplace", arpu: "$38/mo" },
                { phase: "ENGINES", revenue: "Compute", arpu: "$85/mo" },
                { phase: "DREAMING", revenue: "Simulation", arpu: "$140/mo" },
                { phase: "EVOLUTION", revenue: "Autonomy", arpu: "$220/mo" },
              ].map((item, i) => (
                <div key={item.phase} className="text-center p-4 rounded-xl bg-card border border-border/60 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="text-xs font-mono text-muted-foreground tracking-wider mb-2">{item.phase}</div>
                  <div className="text-lg font-black font-mono tabular-nums text-foreground">{item.arpu}</div>
                  <div className="text-xs text-primary font-medium mt-1">{item.revenue}</div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Projected ARPU scaling. Each phase layers on top of the previous — revenue compounds, not replaces.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-28 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-6">
            Build on the Evolution
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Start at DISCOVERY. Your memories carry forward through every phase — compounding capability, autonomy, and value.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="min-h-[48px] px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                Start Building
                <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/foundry">
              <Button size="lg" variant="outline" className="min-h-[48px] px-8 font-semibold hover:border-primary/30 transition-all duration-200">
                Explore Memory Stream
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
