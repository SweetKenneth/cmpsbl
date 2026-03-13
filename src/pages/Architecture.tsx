/**
 * Architecture — Public SEO page for CMPSBL 40-node substrate topology
 * /architecture
 */

import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import {
  Layers, Cpu, Shield, Brain, Zap, Eye, Moon, ArrowRight, Network,
  Settings, Plug, Accessibility, Code2, Wand2, Target, Scale,
  HeartPulse, Dna, Radio, Key, Fingerprint, Send, FileCheck, Coins,
  FlaskConical, Compass, Copy, Ghost, Pickaxe, Languages, Globe,
  Gavel, Stethoscope, Map, Wrench, Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { AuthorityLinkBlock } from "@/components/seo/AuthorityLinkBlock";
// SEO handled via <SEO> component — find it in the return JSX
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubstrateGraph } from "@/components/architecture/SubstrateGraph";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

/* ─── Full 40-node topology, grouped by the 12 canonical sectors ─── */

interface NodeDef {
  name: string;
  icon: React.ElementType;
  desc: string;
}

interface SectorDef {
  label: string;
  tag: string;
  nodes: NodeDef[];
}

const SECTORS: SectorDef[] = [
  {
    label: "Kernel",
    tag: "SPINE",
    nodes: [
      { name: "CORE", icon: Cpu, desc: "Boot authority — initializes all sectors, owns the weighted node registry (Σ = 1.000)." },
      { name: "SYSTEM", icon: Settings, desc: "Lifecycle management, configuration state, diagnostics aggregation, and self-repair loop." },
    ],
  },
  {
    label: "Cognitive Core Reality",
    tag: "CCR",
    nodes: [
      { name: "BRAIN", icon: Brain, desc: "Reasoning engine — reflection cycles, pattern recognition, 384-dim hash-embed learning." },
      { name: "MEMORY", icon: Brain, desc: "Tiered persistent storage — hot/warm/cold recall with SM-2 spaced repetition." },
      { name: "DREAM", icon: Moon, desc: "Synthesis zone — creative combination, heuristic generation, SimNap offline cycles." },
    ],
  },
  {
    label: "Operational Compliance Grid",
    tag: "OCG",
    nodes: [
      { name: "RIPPLE", icon: Radio, desc: "Signal & event bus — inter-sector communication, cascade detection." },
      { name: "ACCESS", icon: Key, desc: "API entitlements, rate limiting, billing integration." },
      { name: "IDENTITY", icon: Fingerprint, desc: "Session management, role resolution, entity binding." },
      { name: "RELAY", icon: Send, desc: "Webhook dispatch, cross-node message routing." },
      { name: "AUDIT", icon: FileCheck, desc: "Immutable receipt chain — tamper-evident logging, chain-of-custody." },
      { name: "NERVE", icon: Activity, desc: "Operational signaling — 4-gate consensus repair, inter-node coordination." },
    ],
  },
  {
    label: "Execution",
    tag: "EXE",
    nodes: [
      { name: "DECODE", icon: Brain, desc: "Epistemic interpreter — prompt parsing, intent extraction, 25-feature hardening." },
      { name: "ENCODE", icon: Code2, desc: "Code generation engine — 7-stage execution chain, output formatting." },
      { name: "VISION", icon: Eye, desc: "Observability & telemetry — health aggregation, metric visualization." },
      { name: "CORTEX", icon: Wand2, desc: "Autonomous orchestrator — multi-surface coordination, task routing." },
      { name: "NEXUS", icon: Zap, desc: "AI provider routing gateway — model selection, fallback chains, cost tracking." },
      { name: "ECONOMY", icon: Coins, desc: "Value & cost tracking — ROI calculation, usage metering." },
      { name: "SANDBOX", icon: FlaskConical, desc: "Isolated execution environment — safe experimentation, staged deployments." },
      { name: "INCLUSIVE", icon: Accessibility, desc: "Accessibility engine — WCAG scanning, compliance reporting." },
      { name: "MEDIC", icon: Stethoscope, desc: "Autonomous diagnostics — self-repair engine, real-state probes." },
      { name: "INTEGRATION", icon: Plug, desc: "Dependency resolver — cross-surface binding, boots last in sequence." },
    ],
  },
  {
    label: "Expansion Sovereignty Zone",
    tag: "ESZ",
    nodes: [
      { name: "SOVEREIGN", icon: Globe, desc: "Data sovereignty — jurisdictional compliance, consent management." },
      { name: "ORACLE", icon: Compass, desc: "Predictive modeling — Bayesian networks, 10K Monte Carlo iterations." },
      { name: "CONSCIENCE", icon: Scale, desc: "Ethical assessment — 5-type bias detection, decision boundaries." },
      { name: "TREATY", icon: Gavel, desc: "Contract negotiation & SLA enforcement." },
    ],
  },
  {
    label: "Expansion Perception Zone",
    tag: "EPZ",
    nodes: [
      { name: "COMPASS", icon: Compass, desc: "Geospatial analysis & location-aware processing." },
      { name: "ECHO", icon: Copy, desc: "Digital twin simulation & scenario replay." },
      { name: "REFLEX", icon: Zap, desc: "Edge computing orchestration & low-latency response." },
    ],
  },
  {
    label: "Expansion Manufacturing Zone",
    tag: "EMZ",
    nodes: [
      { name: "FORGE", icon: Pickaxe, desc: "Artifact synthesis & manufacturing processes." },
      { name: "LINGUA", icon: Languages, desc: "Translation & multi-language processing." },
      { name: "HARVEST", icon: Network, desc: "Data acquisition — SHA-256 bloom-filter deduplication, ETL processes." },
    ],
  },
  {
    label: "Covert Sovereignty Zone",
    tag: "CSZ",
    nodes: [
      { name: "EVOLUTION", icon: Dna, desc: "Mutation lifecycle — SEBA 7-gate process, fitness scoring, shadow A/B." },
      { name: "SHADOW", icon: Shield, desc: "Divergence testing — TSAC verification, shadow mesh operations." },
      { name: "PHANTOM", icon: Ghost, desc: "Privacy protection — 3-hop proxy anonymization." },
    ],
  },
  {
    label: "Fields",
    tag: "FIELD",
    nodes: [
      { name: "IMMUNITY", icon: HeartPulse, desc: "Adaptive resilience — anomaly signatures, 3-sigma drift baselines, cascade detection." },
      { name: "INTENT", icon: Target, desc: "Purpose alignment — DAG-based action planning, goal lifecycle management." },
    ],
  },
  {
    label: "Plane",
    tag: "PLANE",
    nodes: [
      { name: "GOVERNANCE", icon: Scale, desc: "Policy enforcement overlay — action legitimacy supervision, veto authority." },
      { name: "ENGINEER", icon: Wrench, desc: "Infrastructure automation — P95 latency tracking, deployment orchestration." },
    ],
  },
  {
    label: "Atlas",
    tag: "ATLAS",
    nodes: [
      { name: "ATLAS", icon: Map, desc: "System map & capability registry — 80-capability index, the global view of what exists." },
    ],
  },
  {
    label: "Shell",
    tag: "SHELL",
    nodes: [
      { name: "DEFENSE", icon: Shield, desc: "Terminal boundary enforcement — outermost containment shell, threat filtering." },
    ],
  },
];

const BOOT_SEQUENCE = `CORE (Kernel Boot Authority)
  → SYSTEM (Spine — Lifecycle & Config)
  → CCR: BRAIN + MEMORY + DREAM
  → OCG: RIPPLE + ACCESS + IDENTITY + RELAY + AUDIT + NERVE
  → Execution: DECODE, ENCODE, VISION, CORTEX, NEXUS,
               ECONOMY, SANDBOX, INCLUSIVE, MEDIC
  → INTEGRATION (boots last — dependency resolver)
  → ESZ: SOVEREIGN + ORACLE + CONSCIENCE + TREATY
  → EPZ: COMPASS + ECHO + REFLEX
  → EMZ: FORGE + LINGUA + HARVEST
  → CSZ: EVOLUTION + SHADOW + PHANTOM
  ← Fields permeate: IMMUNITY + INTENT
  ← Plane overlay: GOVERNANCE + ENGINEER
  ← Atlas maps: ATLAS
  ← Shell wraps: DEFENSE (outermost)`;

const KEY_PROPERTIES = [
  { title: "Weight Invariant", desc: "Every node carries a governance weight. The sum across all 40 nodes is exactly 1.000 — no single node can dominate decisions." },
  { title: "Clockless Coordination", desc: "Nodes share no global clock. Coordination occurs through event-driven signal propagation, weighted integrity scoring, and deterministic boot order." },
  { title: "Safety Switch Isolation", desc: "Every node has independent failure tracking with automatic safety switches. Degradation never cascades across sectors." },
  { title: "Shadow-First Mutation", desc: "All self-modifications run through a shadow process before promotion. EVOLUTION proposes, SHADOW validates, GOVERNANCE approves." },
  { title: "Tamper-Evident Audit", desc: "Every mutation is recorded in a hash-chained receipt ledger. The chain is verifiable at any point — no operation goes unlogged." },
  { title: "Graceful Degradation", desc: "When individual nodes fail, the system continues at reduced capability. The readiness index pre-assesses fitness before execution." },
];

export default function Architecture() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Architecture — 12-Sector Node Topology | CMPSBL"
        description="Explore CMPSBL's substrate architecture: 40 nodes organized into 12 sectors from CORE kernel to DEFENSE shell. Weighted matrix boot, clockless coordination, and cross-sector mesh overlays."
        image="https://cmpsbl.com/og/architecture.jpg"
        keywords={['AI orchestration architecture', 'CMPSBL architecture', 'composable AI nodes', 'cognitive substrate', 'AI infrastructure layers']}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'Architecture', url: 'https://cmpsbl.com/architecture' },
        ]}
        faq={[
          { question: 'How is CMPSBL structured?', answer: 'CMPSBL is a 40-node substrate organized into 12 sectors. CORE boots all sectors in a deterministic sequence and maintains a weighted node registry where all weights sum to exactly 1.000.' },
          { question: 'What are the 12 sectors?', answer: 'Kernel (SPINE), CCR, OCG, Execution, ESZ, EPZ, EMZ, CSZ, Fields, Plane, Atlas, and Shell. Each sector groups related nodes with distinct operational responsibilities.' },
          { question: 'How does the system evolve?', answer: 'Through the shadow-first mutation process: EVOLUTION proposes changes, SHADOW validates them in isolation, and GOVERNANCE approves or vetoes before promotion to production.' },
        ]}
      />

      <PublicNav />

      <main>
        {/* ── Hero + Interactive Graph ── */}
        <section className="relative py-16 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.04] pointer-events-none"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 60%)' }}
          />
          <div className="container mx-auto max-w-6xl px-4 relative">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
              <motion.div {...fadeUp} className="max-w-xl">
                <Badge variant="outline" className="mb-5 border-primary/30 text-primary gap-1.5">
                  <Layers className="w-3 h-3" />
                  40 Nodes · 12 Sectors
                </Badge>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.05]">
                  How CMPSBL Works
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
                  A layered orchestration architecture that boots deterministically, coordinates without a shared clock,
                  heals autonomously, and evolves through a shadow-first mutation process — all governed by a tamper-evident audit chain.
                </p>
                <p className="text-sm text-muted-foreground/70 leading-relaxed mb-6">
                  40 nodes across 12 sectors. Every node carries a governance weight (Σ&nbsp;=&nbsp;1.000).
                  No single node can dominate system-level decisions without proportional representation.
                </p>
                <p className="text-xs text-muted-foreground/40 font-mono flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
                  Click any node in the diagram to inspect
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <SubstrateGraph />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Boot Sequence ── */}
        <section className="border-y border-border bg-muted/30">
          <div className="container mx-auto max-w-5xl px-4 py-16">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl font-bold mb-2">Deterministic Boot Sequence</h2>
              <p className="text-muted-foreground mb-6">
                CORE initializes all sectors in a fixed order. Fields permeate the spine,
                the Plane overlay supervises, ATLAS indexes, and DEFENSE seals the boundary.
              </p>
              <Card className="bg-card">
                <CardContent className="p-6">
                  <pre className="text-sm font-mono text-muted-foreground leading-relaxed overflow-x-auto whitespace-pre">{BOOT_SEQUENCE}</pre>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* ── All 12 Sectors ── */}
        {SECTORS.map((sector, sIdx) => (
          <section
            key={sector.tag}
            className={`border-t border-border ${sIdx % 2 === 0 ? 'bg-muted/20' : ''}`}
          >
            <div className="container mx-auto max-w-5xl px-4 py-14">
              <motion.div {...fadeUp}>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold">{sector.label}</h2>
                  <Badge variant="outline" className="text-xs font-mono">{sector.tag}</Badge>
                  <Badge variant="secondary" className="text-xs">{sector.nodes.length} {sector.nodes.length === 1 ? 'node' : 'nodes'}</Badge>
                </div>
                <div className={`grid gap-3 ${sector.nodes.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-3' : sector.nodes.length >= 2 ? 'sm:grid-cols-2' : ''}`}>
                  {sector.nodes.map((node) => (
                    <Card key={node.name} className="hover:border-primary/30 transition-all duration-300 card-lift">
                      <CardContent className="p-5 flex items-start gap-3">
                        <node.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold font-mono text-sm">{node.name}</span>
                          <p className="text-xs text-muted-foreground mt-1">{node.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        ))}

        {/* ── Key Properties ── */}
        <section className="border-t border-border">
          <div className="container mx-auto max-w-5xl px-4 py-16">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl font-bold mb-8">Architectural Properties</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {KEY_PROPERTIES.map((prop) => (
                  <Card key={prop.title} className="hover:border-primary/20 transition-all duration-300 card-lift">
                    <CardContent className="p-5">
                      <h3 className="font-semibold mb-1">{prop.title}</h3>
                      <p className="text-sm text-muted-foreground">{prop.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border-t border-border bg-muted/30">
          <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Explore the Substrate</h2>
            <p className="text-muted-foreground mb-8">
              Dive deeper into individual nodes, live infrastructure, and technical documentation.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/modules">
                <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  All 40 Nodes <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/documentation">
                <Button variant="outline" className="hover:border-primary/30 transition-colors">Documentation</Button>
              </Link>
              <Link to="/substrate">
                <Button variant="outline" className="hover:border-primary/30 transition-colors">Live Dashboard</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <RelatedCapabilities />
      <AuthorityLinkBlock currentPath="/architecture" />
      <EnhancedFooter />
    </div>
  );
}
