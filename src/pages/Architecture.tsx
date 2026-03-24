/**
 * Architecture — Public SEO page for CMPSBL 40-primitive substrate topology
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
import { RelatedCapabilities } from "@/components/RelatedCapabilities";
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

/* ─── Full 40-primitive topology, grouped by the 4 canonical categories ─── */

interface PrimitiveDef {
  name: string;
  icon: React.ElementType;
  desc: string;
}

interface CategoryDef {
  label: string;
  tag: string;
  color: string;
  primitives: PrimitiveDef[];
}

const CATEGORIES: CategoryDef[] = [
  {
    label: "Organs",
    tag: "Vital Infrastructure",
    color: "border-neon-amber/30 bg-neon-amber/5",
    primitives: [
      { name: "CORE", icon: Cpu, desc: "Kernel boot authority — initializes all primitives, owns the weighted registry (Σ = 1.000)." },
      { name: "SYSTEM", icon: Settings, desc: "Lifecycle management, configuration state, diagnostics aggregation, and self-repair loop." },
      { name: "BRAIN", icon: Brain, desc: "Reasoning organ — reflection cycles, pattern recognition, 384-dim hash-embed learning." },
      { name: "MEMORY", icon: Brain, desc: "Tiered persistent storage — hot/warm/cold/glacier recall with vector retrieval and SM-2 spaced repetition." },
      { name: "NERVE", icon: Activity, desc: "Operational signaling — 4-gate consensus repair, inter-primitive coordination." },
      { name: "NEXUS", icon: Zap, desc: "AI provider routing gateway — model selection, fallback chains, cost tracking." },
      { name: "IDENTITY", icon: Fingerprint, desc: "Session management, role resolution, entity binding." },
      { name: "SOVEREIGN", icon: Globe, desc: "Data sovereignty — jurisdictional compliance, consent management." },
      { name: "ATLAS", icon: Map, desc: "System map & capability registry — the global view of what exists." },
      { name: "MEDIC", icon: Stethoscope, desc: "Autonomous diagnostics — self-repair probes, real-state health assessment." },
      { name: "RELAY", icon: Send, desc: "Webhook dispatch, cross-primitive message routing." },
      { name: "CONSCIENCE", icon: Scale, desc: "Ethical assessment — 5-type bias detection, decision boundaries." },
    ],
  },
  {
    label: "Layers",
    tag: "Ambient Overlays",
    color: "border-neon-cyan/30 bg-neon-cyan/5",
    primitives: [
      { name: "DEFENSE", icon: Shield, desc: "Terminal boundary enforcement — outermost containment shell, threat filtering." },
      { name: "IMMUNITY", icon: HeartPulse, desc: "Adaptive resilience — anomaly signatures, 3-sigma drift baselines, cascade detection." },
      { name: "GOVERNANCE", icon: Scale, desc: "Policy enforcement overlay — action legitimacy supervision, veto authority." },
      { name: "TREATY", icon: Gavel, desc: "Contract negotiation & SLA enforcement." },
      { name: "EVOLUTION", icon: Dna, desc: "Mutation lifecycle — SEBA 7-gate process, fitness scoring, shadow A/B testing." },
      { name: "REFLEX", icon: Zap, desc: "Edge computing orchestration & low-latency response." },
      { name: "COMPASS", icon: Compass, desc: "Geospatial analysis & location-aware processing." },
      { name: "INTEGRATION", icon: Plug, desc: "Dependency resolver — cross-surface binding, boots last in sequence." },
      { name: "INTENT", icon: Target, desc: "Purpose alignment — DAG-based action planning, goal lifecycle management." },
      { name: "ACCESS", icon: Key, desc: "API entitlements, rate limiting, billing integration." },
      { name: "VISION", icon: Eye, desc: "Observability & telemetry — health aggregation, metric visualization." },
      { name: "SHADOW", icon: Ghost, desc: "Divergence testing — TSAC verification, shadow mesh operations." },
    ],
  },
  {
    label: "Engines",
    tag: "Invoked Processors",
    color: "border-neon-green/30 bg-neon-green/5",
    primitives: [
      { name: "DREAM", icon: Moon, desc: "Synthesis engine — creative combination, heuristic generation, SimNap offline cycles." },
      { name: "HARVEST", icon: Network, desc: "Data acquisition — SHA-256 bloom-filter deduplication, ETL processes." },
      { name: "FORGE", icon: Pickaxe, desc: "Artifact synthesis & manufacturing engine." },
      { name: "LINGUA", icon: Languages, desc: "Translation & multi-language processing engine." },
      { name: "ECHO", icon: Copy, desc: "Digital twin simulation & scenario replay engine." },
      { name: "PHANTOM", icon: Ghost, desc: "Privacy protection — 3-hop proxy anonymization engine." },
      { name: "SANDBOX", icon: FlaskConical, desc: "Isolated execution environment — safe experimentation, staged deployments." },
      { name: "RIPPLE", icon: Radio, desc: "Event-driven signal bus — inter-primitive communication, cascade orchestration." },
    ],
  },
  {
    label: "Agents",
    tag: "Autonomous Actors",
    color: "border-neon-purple/30 bg-neon-purple/5",
    primitives: [
      { name: "ENCODE", icon: Code2, desc: "Code generation agent — 7-stage execution chain, output formatting." },
      { name: "DECODE", icon: Brain, desc: "Epistemic interpreter — prompt parsing, intent extraction, 25-feature hardening." },
      { name: "AUDIT", icon: FileCheck, desc: "Immutable receipt chain — tamper-evident logging, chain-of-custody." },
      { name: "ECONOMY", icon: Coins, desc: "Value & cost tracking — ROI calculation, usage metering." },
      { name: "INCLUSIVE", icon: Accessibility, desc: "Accessibility agent — WCAG scanning, compliance reporting." },
      { name: "CORTEX", icon: Wand2, desc: "Autonomous orchestrator — multi-surface coordination, task routing." },
      { name: "ORACLE", icon: Compass, desc: "Predictive modeling — Bayesian networks, 10K Monte Carlo iterations." },
      { name: "ENGINEER", icon: Wrench, desc: "Infrastructure automation — P95 latency tracking, deployment orchestration." },
    ],
  },
];

const BOOT_SEQUENCE = `CORE Organ (Kernel Boot Authority)
  → SYSTEM Organ (Lifecycle & Config)
  → BRAIN Organ + MEMORY Organ + NERVE Organ
  → NEXUS Organ + IDENTITY Organ + SOVEREIGN Organ
  → ATLAS Organ + MEDIC Organ + RELAY Organ + CONSCIENCE Organ
  → Engines: DREAM, HARVEST, FORGE, LINGUA,
             ECHO, PHANTOM, SANDBOX, RIPPLE
  → Agents: ENCODE, DECODE, AUDIT, ECONOMY,
            INCLUSIVE, CORTEX, ORACLE, ENGINEER
  ← Layers permeate: IMMUNITY, INTENT, EVOLUTION,
                      REFLEX, COMPASS, INTEGRATION,
                      ACCESS, VISION, SHADOW, TREATY
  ← GOVERNANCE Layer (policy overlay)
  ← DEFENSE Layer (outermost shell)`;

const KEY_PROPERTIES = [
  { title: "Weight Invariant", desc: "Every primitive carries a governance weight. The sum across all 40 primitives is exactly 1.000 — no single primitive can dominate decisions." },
  { title: "Clockless Coordination", desc: "Primitives share no global clock. Coordination occurs through event-driven signal propagation, weighted integrity scoring, and deterministic boot order." },
  { title: "Safety Switch Isolation", desc: "Every primitive has independent failure tracking with automatic safety switches. Degradation never cascades across categories." },
  { title: "Shadow-First Mutation", desc: "All self-modifications run through a shadow process before promotion. EVOLUTION Layer proposes, SHADOW Layer validates, GOVERNANCE Layer approves." },
  { title: "Tamper-Evident Audit", desc: "Every mutation is recorded in a hash-chained receipt ledger. The chain is verifiable at any point — no operation goes unlogged." },
  { title: "Graceful Degradation", desc: "When individual primitives fail, the system continues at reduced capability. The readiness index pre-assesses fitness before execution." },
];

export default function Architecture() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Architecture — Agents · Engines · Layers · Organs | CMPSBL"
        description="Explore CMPSBL's substrate architecture: 40 primitives organized as agents, engines, layers, and organs. Weighted matrix boot, clockless coordination, and cross-category mesh overlays."
        image="https://cmpsbl.com/og/architecture.jpg"
        keywords={['AI orchestration architecture', 'CMPSBL architecture', 'composable AI primitives', 'cognitive substrate', 'AI infrastructure layers']}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'Architecture', url: 'https://cmpsbl.com/architecture' },
        ]}
        faq={[
          { question: 'How is CMPSBL structured?', answer: 'CMPSBL is a 40-primitive substrate organized into a symmetric 12·12·8·8 matrix across 4 categories: Organs, Layers, Engines, and Agents. CORE boots all primitives in a deterministic sequence and maintains a weighted registry where all weights sum to exactly 1.000.' },
          { question: 'What are the 4 categories?', answer: 'Organs (vital infrastructure: CORE, SYSTEM, BRAIN, MEMORY, NERVE, NEXUS, IDENTITY, SOVEREIGN, ATLAS, MEDIC, RELAY, CONSCIENCE), Layers (ambient overlays: DEFENSE, IMMUNITY, GOVERNANCE, TREATY, EVOLUTION, REFLEX, COMPASS, INTEGRATION, INTENT, ACCESS, VISION, SHADOW), Engines (invoked processors: DREAM, HARVEST, FORGE, LINGUA, ECHO, PHANTOM, SANDBOX, RIPPLE), and Agents (autonomous actors: ENCODE, DECODE, AUDIT, ECONOMY, INCLUSIVE, CORTEX, ORACLE, ENGINEER).' },
          { question: 'How does the system evolve?', answer: 'Through the shadow-first mutation process: EVOLUTION Layer proposes changes, SHADOW Layer validates them in isolation, and GOVERNANCE Layer approves or vetoes before promotion to production.' },
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
                  12 Organs · 12 Layers · 8 Engines · 8 Agents
                </Badge>
                 <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-6 leading-[1.05]">
                   How CMPSBL Works
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
                  A layered{" "}
                  <a href="https://en.wikipedia.org/wiki/Event-driven_architecture" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">orchestration architecture</a>{" "}
                  that boots deterministically, coordinates without a shared clock,
                  heals autonomously, and evolves through a shadow-first mutation process — all governed by a{" "}
                  <a href="https://en.wikipedia.org/wiki/Merkle_tree" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">tamper-evident audit chain</a>.
                </p>
                <p className="text-sm text-muted-foreground/70 leading-relaxed mb-6">
                  40 primitives across 4 categories — a symmetric 12·12·8·8 matrix.{" "}
                  Every primitive carries a governance weight (Σ&nbsp;=&nbsp;1.000).
                  No single primitive can dominate system-level decisions without proportional representation.{" "}
                  <Link to="/enterprise" className="text-primary hover:underline font-medium">Deploy on your own infrastructure</Link>{" "}
                  or use our hosted substrate.
                </p>
                <p className="text-xs text-muted-foreground/40 font-mono flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
                  Click any primitive in the diagram to inspect
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
                CORE initializes all primitives in a fixed order. Fields permeate the spine,
                the Plane overlay supervises, <Link to="/architecture" className="text-primary hover:underline font-medium">ATLAS</Link> indexes, and{" "}
                <Link to="/use-cases" className="text-primary hover:underline font-medium">DEFENSE</Link> seals the boundary.{" "}
                Learn more in our <Link to="/documentation" className="text-primary hover:underline font-medium">technical documentation</Link>.
              </p>
              <Card className="bg-card">
                <CardContent className="p-6">
                  <pre className="text-sm font-mono text-muted-foreground leading-relaxed overflow-x-auto whitespace-pre">{BOOT_SEQUENCE}</pre>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* ── All Categories ── */}
        {CATEGORIES.map((cat, sIdx) => (
          <section
            key={cat.tag}
            className={`border-t border-border ${sIdx % 2 === 0 ? 'bg-muted/20' : ''}`}
          >
            <div className="container mx-auto max-w-5xl px-4 py-14">
              <motion.div {...fadeUp}>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold">{cat.label}</h2>
                  <Badge variant="outline" className="text-xs font-mono">{cat.tag}</Badge>
                  <Badge variant="secondary" className="text-xs">{cat.primitives.length} primitives</Badge>
                </div>
                <div className={`grid gap-3 ${cat.primitives.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-3' : cat.primitives.length >= 2 ? 'sm:grid-cols-2' : ''}`}>
                  {cat.primitives.map((prim) => (
                    <Card key={prim.name} className={`hover:border-primary/30 transition-all duration-300 card-lift border ${cat.color}`}>
                      <CardContent className="p-5 flex items-start gap-3">
                        <prim.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold font-mono text-sm">{prim.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground/50 ml-2">{cat.label.slice(0, -1)}</span>
                          <p className="text-xs text-muted-foreground mt-1">{prim.desc}</p>
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
              Dive deeper into individual primitives, live infrastructure, and technical documentation.{" "}
               See real-world <Link to="/use-cases" className="text-primary hover:underline font-medium">deployment examples</Link>{" "}
               or <Link to="/auth" className="text-primary hover:underline font-medium">start building for free</Link>.
             </p>
             <div className="flex flex-wrap gap-4 justify-center">
               <Link to="/store">
                 <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                   Explore Engines <ArrowRight className="w-4 h-4" />
                 </Button>
               </Link>
              <Link to="/documentation">
                <Button variant="outline" className="hover:border-primary/30 transition-colors">Documentation</Button>
              </Link>
              <Link to="/os">
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
