/**
 * Architecture — CMPSBL® Substrate Taxonomy
 * 4-Category Classification: HIDDEN · LAYER · ENGINE · AGENT
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { AuthorityLinkBlock } from "@/components/seo/AuthorityLinkBlock";
import { cn } from "@/lib/utils";
import {
  Cpu, Server, Zap, Waves, Send, Fingerprint, KeyRound, Network, FileCheck, Plug,
  Shield, Bug, Scale, Target, Dna, Accessibility, Heart, ScrollText,
  Brain, Database, Moon, Workflow, Telescope, Hammer, Compass, Map, Coins, FlaskConical, Stethoscope, Activity,
  Code2, Languages, Eye, Ghost, Globe2, Radio, Wheat, Crown, Cog, EyeOff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TAXONOMY TYPES
// ═══════════════════════════════════════════════════════════

interface TaxonomyEntry {
  id: string;
  label: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  slug: string;
}

interface TaxonomyCategory {
  key: 'hidden' | 'layer' | 'engine' | 'agent';
  label: string;
  subtitle: string;
  description: string;
  philosophy: string;
  color: string;
  borderColor: string;
  textColor: string;
  badgeColor: string;
  entries: TaxonomyEntry[];
}

// ═══════════════════════════════════════════════════════════
// 40-NODE TAXONOMY — 4 Categories
// ═══════════════════════════════════════════════════════════

const TAXONOMY: TaxonomyCategory[] = [
  {
    key: 'hidden',
    label: 'ORGANS',
    subtitle: 'Hidden Infrastructure',
    description: 'The invisible OS layer — plumbing that keeps everything alive. Users never see these, but nothing works without them.',
    philosophy: 'Like organs in a body: you don\'t think about your heart until it stops.',
    color: 'bg-muted/40',
    borderColor: 'border-border',
    textColor: 'text-muted-foreground',
    badgeColor: 'bg-muted text-muted-foreground border-border',
    entries: [
      { id: 'core', label: 'CORE', tagline: 'Boot Kernel', description: 'Deterministic 12-stage boot, lifecycle management, event bus, and health monitoring for all 40 components.', icon: Cpu, slug: 'core' },
      { id: 'system', label: 'SYSTEM', tagline: 'Sentinel', description: 'Predictive failure engine, repair optimizer, config state machine, and resource budgets.', icon: Server, slug: 'system' },
      { id: 'brain', label: 'BRAIN', tagline: 'Neural Cognition', description: '12-engine reasoning core — deductive, inductive, abductive, analogical — with attention spotlight and metacognition.', icon: Brain, slug: 'brain' },
      { id: 'memory', label: 'MEMORY', tagline: 'Tiered Storage', description: '4-tier cognitive architecture (Hot/Warm/Cold/Glacier) with cross-tier semantic index.', icon: Database, slug: 'memory' },
      { id: 'nerve', label: 'NERVE', tagline: 'Signal Backbone', description: 'Inter-component consensus repair, neural signaling, backpressure, and circuit breaking.', icon: Zap, slug: 'nerve' },
      { id: 'nexus', label: 'NEXUS', tagline: 'Fleet Router', description: '14-provider fleet, health ranking, zero-mock policy, multi-model consensus, and cost ledger.', icon: Network, slug: 'nexus' },
      { id: 'identity', label: 'IDENTITY', tagline: 'Actor Attribution', description: 'Human/agent/system identity, persistent signatures, and cross-system provenance.', icon: Fingerprint, slug: 'identity' },
      { id: 'sovereign', label: 'SOVEREIGN', tagline: 'Data Authority', description: 'Jurisdictional compliance, data residency enforcement, sovereignty protocols, and consent management.', icon: Crown, slug: 'sovereign' },
      { id: 'atlas', label: 'ATLAS', tagline: 'Control Authority', description: 'System cartography, capability mapping, governance hub, and cross-sector oversight.', icon: Map, slug: 'atlas' },
      { id: 'medic', label: 'MEDIC', tagline: 'Diagnostics', description: 'Autonomous health management, self-repair coordination, and diagnostic telemetry.', icon: Stethoscope, slug: 'medic' },
      { id: 'relay', label: 'RELAY', tagline: 'Outbound Effects', description: 'Webhook dispatch, notification routing, retry queues, and delivery guarantees.', icon: Send, slug: 'relay' },
      { id: 'conscience', label: 'CONSCIENCE', tagline: 'Ethical Compass', description: 'Bias detection, ethical scoring, and responsible AI enforcement.', icon: Heart, slug: 'conscience' },
    ],
  },
  {
    key: 'layer',
    label: 'LAYERS',
    subtitle: 'Ambient Overlays',
    description: 'Always-on systems that permeate the entire substrate. They don\'t wait to be called — they watch, protect, and enforce continuously.',
    philosophy: 'Like gravity: invisible, constant, and everything depends on it.',
    color: 'bg-emerald-500/5',
    borderColor: 'border-emerald-500/20',
    textColor: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    entries: [
      { id: 'defense', label: 'DEFENSE', tagline: 'Guardian', description: 'Prompt injection defense, threat intelligence, adversarial filtering, and incident response.', icon: Shield, slug: 'defense' },
      { id: 'immunity', label: 'IMMUNITY', tagline: 'Resilience Field', description: 'Adaptive resilience, shadow executors, self-healing patterns, and failure immunization.', icon: Bug, slug: 'immunity' },
      { id: 'governance', label: 'GOVERNANCE', tagline: 'Policy Engine', description: 'Ethical constraints, veto authority, coherence enforcement, and policy-as-code.', icon: Scale, slug: 'governance' },
      { id: 'treaty', label: 'TREATY', tagline: 'Contract Engine', description: 'SLA enforcement, contract negotiation, and agreement lifecycle management.', icon: ScrollText, slug: 'treaty' },
      { id: 'evolution', label: 'EVOLUTION', tagline: 'Self-Evolution', description: 'Mutation lifecycle, optimization scanning, governed proposals, and shadow testing.', icon: Dna, slug: 'evolution' },
      { id: 'reflex', label: 'REFLEX', tagline: 'Rapid Response', description: 'Edge orchestration, reflexive auto-remediation, and latency-optimized routing.', icon: Activity, slug: 'reflex' },
      { id: 'compass', label: 'COMPASS', tagline: 'Navigation', description: 'Capability discovery, wayfinding, context-aware routing, and spatial queries.', icon: Compass, slug: 'compass' },
      { id: 'integration', label: 'INTEGRATION', tagline: 'Adapter Bridge', description: 'Universal connectors, pre-built adapters, bidirectional sync, and resilience patterns.', icon: Plug, slug: 'integration' },
      { id: 'intent', label: 'INTENT', tagline: 'Discovery Field', description: 'Cross-surface intent resolution, goal decomposition, and capability crystallization.', icon: Target, slug: 'intent-mesh' },
      { id: 'access', label: 'ACCESS', tagline: 'API Gateway', description: 'SHA-256 API keys, scope hierarchy, rate limiting, and usage metering.', icon: KeyRound, slug: 'access' },
      { id: 'vision', label: 'VISION', tagline: 'Observability Suite', description: 'Real-time surface health, behavioral anomaly scoring, session journey reconstruction, and predictive alerts.', icon: Eye, slug: 'vision' },
      { id: 'shadow', label: 'SHADOW', tagline: 'Parallel Reality', description: 'Isolated execution chamber, traffic replay, shadow verification, and divergence scoring.', icon: EyeOff, slug: 'shadow' },
    ],
  },
  {
    key: 'engine',
    label: 'ENGINES',
    subtitle: 'Processing Powerhouses',
    description: 'The heavy-lifting machinery of the substrate. Engines are invoked when work needs doing — they process, transform, compute, and produce.',
    philosophy: 'Like a V12 under the hood: you turn the key, it delivers power.',
    color: 'bg-sky-500/5',
    borderColor: 'border-sky-500/20',
    textColor: 'text-sky-400',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    entries: [
      { id: 'dream', label: 'DREAM', tagline: 'Synthesis Engine', description: 'Lineage provenance, semantic drift detection, lucid dreaming modes, and consolidation orchestrator.', icon: Moon, slug: 'dream' },
      { id: 'harvest', label: 'HARVEST', tagline: 'Collector', description: 'ETL memories, data ingestion, web crawling, and structured extraction.', icon: Wheat, slug: 'harvest' },
      { id: 'forge', label: 'FORGE', tagline: 'Artifact Synthesis', description: 'Manufacturing memories, artifact generation, hash-chain sealing, and IP protection.', icon: Hammer, slug: 'forge' },
      { id: 'lingua', label: 'LINGUA', tagline: 'Polyglot', description: 'Multi-language translation, localization, cultural adaptation, and text normalization.', icon: Globe2, slug: 'lingua' },
      { id: 'echo', label: 'ECHO', tagline: 'Broadcaster', description: 'Multi-channel communication, voice translation, protocol bridging, and broadcast orchestration.', icon: Radio, slug: 'echo' },
      { id: 'phantom', label: 'PHANTOM', tagline: 'Ghost Operator', description: 'Anonymization, stealth execution, data masking, and privacy-preserving computation.', icon: Ghost, slug: 'phantom' },
      { id: 'sandbox', label: 'SANDBOX', tagline: 'Isolation Chamber', description: 'Hermetically sealed environments for speculative runs, evolution testing, and experimentation.', icon: FlaskConical, slug: 'sandbox' },
      { id: 'ripple', label: 'RIPPLE', tagline: 'Event Cascade', description: 'Intelligent fan-out, priority routing, deduplication, and backpressure handling.', icon: Waves, slug: 'ripple' },
    ],
  },
  {
    key: 'agent',
    label: 'AGENTS',
    subtitle: 'Autonomous Actors',
    description: 'Self-directed components that decide, act, and adapt on their own. Each Agent has goals, can plan multi-step operations, and learns from outcomes.',
    philosophy: 'Like specialists on a team: you give them a mission, they figure out the how.',
    color: 'bg-violet-500/5',
    borderColor: 'border-violet-500/20',
    textColor: 'text-violet-400',
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    entries: [
      { id: 'encode', label: 'ENCODE', tagline: 'Code Architect', description: 'AST-aware patches, DAG-ordered orchestration, immutable rollback ledger, and 71-skill proficiency.', icon: Code2, slug: 'encode' },
      { id: 'decode', label: 'DECODE', tagline: 'Interpreter', description: 'Multi-modal input, NLU intent classification, epistemic audit trail, and streaming responses.', icon: Languages, slug: 'decode' },
      { id: 'ripple', label: 'RIPPLE', tagline: 'Event Cascade', description: 'Intelligent fan-out, priority routing, deduplication, and backpressure handling.', icon: Waves, slug: 'ripple' },
      { id: 'audit', label: 'AUDIT', tagline: 'Immutable Ledger', description: 'Append-only logging with SHA-256 hash chaining and compliance reporting.', icon: FileCheck, slug: 'audit' },
      { id: 'economy', label: 'ECONOMY', tagline: 'Cost Engine', description: 'Real-time cost attribution, budget enforcement, token systems, and marketplace pricing.', icon: Coins, slug: 'economy' },
      { id: 'inclusive', label: 'INCLUSIVE', tagline: 'Accessibility', description: 'WCAG 2.2 scanning, AI-powered fixes, continuous monitoring, and compliance reporting.', icon: Accessibility, slug: 'inclusive' },
      { id: 'cortex', label: 'CORTEX', tagline: 'Conductor', description: 'DAG execution engine, cascade failure prediction, adaptive backpressure, and workflow templates.', icon: Workflow, slug: 'cortex' },
      { id: 'oracle', label: 'ORACLE', tagline: 'Predictive Engine', description: 'Probabilistic reasoning, future-state modeling, Bayesian networks, and predictive analytics.', icon: Telescope, slug: 'oracle' },
      { id: 'engineer', label: 'ENGINEER', tagline: 'Mechanic', description: 'Diagnostics, self-tuning, predictive maintenance, and architectural optimization.', icon: Cog, slug: 'engineer' },
    ],
  },
];

const TOTAL = TAXONOMY.reduce((s, c) => s + c.entries.length, 0);

// ═══════════════════════════════════════════════════════════
// ASCII DIAGRAM
// ═══════════════════════════════════════════════════════════

const ASCII_DIAGRAM = `
┌──────────────────────────────────────────────────────────────────┐
│                    CMPSBL® SUBSTRATE v9.0.0                     │
│                   40-Primitive Architecture                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─── LAYERS (12 — Ambient Overlays) ──────────────────────────┐  │
│  │  DEFENSE   IMMUNITY    GOVERNANCE  TREATY                   │  │
│  │  EVOLUTION REFLEX      COMPASS     INTEGRATION              │  │
│  │  INTENT    ACCESS      VISION      SHADOW                   │  │
│  │  "Always on, always watching, always enforcing"            │  │
│  │                                                              │  │
│  │  ┌─── AGENTS (9 — Autonomous Actors) ────────────────────┐  │  │
│  │  │  ENCODE  DECODE  RIPPLE  AUDIT  ECONOMY               │  │  │
│  │  │  INCLUSIVE  CORTEX  ORACLE  ENGINEER                   │  │  │
│  │  │  "They decide, act, and learn on their own"            │  │  │
│  │  │                                                        │  │  │
│  │  │  ┌─── ENGINES (7 — Processing Power) ───────────────┐  │  │  │
│  │  │  │  DREAM  HARVEST  FORGE  LINGUA                   │  │  │  │
│  │  │  │  ECHO   PHANTOM  SANDBOX                         │  │  │  │
│  │  │  │  "Turn the key, they deliver power"              │  │  │  │
│  │  │  │                                                   │  │  │  │
│  │  │  │  ┌─── ORGANS (12 — Vital Core) ───────────────┐  │  │  │  │
│  │  │  │  │  CORE  SYSTEM  BRAIN  MEMORY  NERVE        │  │  │  │  │
│  │  │  │  │  NEXUS IDENTITY SOVEREIGN ATLAS            │  │  │  │  │
│  │  │  │  │  MEDIC RELAY  CONSCIENCE                   │  │  │  │  │
│  │  │  │  │  "The heartbeat — nothing works without"   │  │  │  │  │
│  │  │  │  └────────────────────────────────────────────┘  │  │  │  │
│  │  │  └──────────────────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  FLOW:  User ─→ Layer validates ─→ Agent decides ─→ Engine      │
│         processes ─→ Organ routes ─→ Result ─→ Dream consolidates│
└──────────────────────────────────────────────────────────────────┘`;

// ═══════════════════════════════════════════════════════════

export default function ArchitecturePage() {
  return (
    <>
      <SEO
        title="Architecture — Agents, Engines, Layers & Organs | CMPSBL"
        description="Explore the complete 40-component substrate architecture organized into 4 categories: Agents that decide, Engines that process, Layers that protect, and Organs that power everything."
        image="https://cmpsbl.com/og/systems.jpg"
        keywords={['AI substrate architecture', 'cognitive agents', 'AI engines', 'composable AI', 'AI operating system']}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'Architecture', url: 'https://cmpsbl.com/architecture' },
        ]}
      />

      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

          <div className="container mx-auto max-w-5xl px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4 border border-border rounded-full px-4 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {TOTAL} Components · 4 Categories
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                <span className="text-foreground">Substrate</span>{' '}
                <span className="text-primary">Architecture</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                {TOTAL} autonomous components organized into four categories:
                Agents that <em>decide</em>, Engines that <em>process</em>,
                Layers that <em>protect</em>, and Organs that <em>power everything</em>.
              </p>

              {/* Category pills */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {TAXONOMY.map((cat, i) => (
                  <motion.a
                    key={cat.key}
                    href={`#${cat.key}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.3 }}
                    className={cn(
                      "text-xs font-mono px-3 py-1.5 rounded-full border transition-colors hover:bg-primary/10 hover:border-primary/30",
                      cat.badgeColor
                    )}
                  >
                    {cat.entries.length} {cat.label}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ASCII Diagram */}
        <section className="border-y border-border bg-muted/20">
          <div className="container mx-auto max-w-4xl px-4 py-8">
            <h2 className="text-sm font-mono font-bold text-muted-foreground mb-4 uppercase tracking-widest">System Topology</h2>
            <div className="overflow-x-auto">
              <pre className="text-[10px] sm:text-xs font-mono text-foreground/80 leading-relaxed whitespace-pre">
                {ASCII_DIAGRAM}
              </pre>
            </div>
          </div>
        </section>

        {/* All Categories */}
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="space-y-16">
            {TAXONOMY.map((cat, catIdx) => (
              <motion.section
                key={cat.key}
                id={cat.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: catIdx * 0.05 }}
              >
                {/* Category Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      "text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-widest",
                      cat.badgeColor
                    )}>
                      {cat.key}
                    </span>
                    <h2 className={cn("text-2xl sm:text-3xl font-bold", cat.textColor === 'text-muted-foreground' ? 'text-foreground' : cat.textColor)}>
                      {cat.label}
                    </h2>
                    <span className="text-xs font-mono text-muted-foreground">
                      {cat.entries.length} components
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{cat.subtitle} — {cat.description}</p>
                  <p className="text-xs text-muted-foreground/60 italic">{cat.philosophy}</p>
                </div>

                {/* Entry Cards */}
                <div className={cn(
                  "grid gap-3",
                  cat.entries.length <= 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
                  cat.entries.length <= 8 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" :
                  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                )}>
                  {cat.entries.map((entry) => (
                    <Link
                      key={entry.id}
                      to={`/modules/${entry.slug}`}
                      className={cn(
                        "group relative p-4 rounded-lg border transition-all duration-300",
                        "hover:shadow-lg hover:-translate-y-0.5",
                        cat.color,
                        cat.borderColor,
                        "hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                          "bg-background/50 group-hover:bg-primary/10 transition-colors"
                        )}>
                          <entry.icon className={cn(
                            "w-4 h-4 transition-colors",
                            cat.textColor === 'text-muted-foreground' ? 'text-foreground/60' : cat.textColor,
                            "group-hover:text-primary"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-foreground mb-0.5">{entry.label}</h3>
                          <p className={cn(
                            "text-xs font-medium mb-1 opacity-80",
                            cat.textColor === 'text-muted-foreground' ? 'text-foreground/60' : cat.textColor,
                          )}>{entry.tagline}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{entry.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="absolute top-4 right-3 w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        </div>

        {/* Summary */}
        <section className="border-t border-border bg-muted/20">
          <div className="container mx-auto max-w-4xl px-4 py-12">
            <h2 className="text-xl font-bold mb-6 text-foreground">Category Summary</h2>
            <div className="space-y-2">
              {TAXONOMY.map((cat) => (
                <div key={cat.key} className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase",
                      cat.badgeColor
                    )}>
                      {cat.key}
                    </span>
                    <span className="text-sm font-medium text-foreground">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{cat.subtitle}</span>
                    <span className="text-sm font-mono text-primary font-bold">{cat.entries.length}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between py-3 mt-2 border-t border-border">
                <span className="text-sm font-bold text-foreground">TOTAL</span>
                <span className="text-sm font-mono font-bold text-primary">{TOTAL}</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Flows */}
        <section className="border-t border-border">
          <div className="container mx-auto max-w-4xl px-4 py-12">
            <h2 className="text-xl font-bold mb-6 text-foreground">How It All Connects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { step: '01', title: 'User sends a request', desc: 'An Agent (DECODE) interprets the intent and plans the execution.' },
                { step: '02', title: 'Agents invoke Engines', desc: 'BRAIN reasons, CORTEX orchestrates, MEMORY retrieves — Engines do the heavy processing.' },
                { step: '03', title: 'Layers validate everything', desc: 'DEFENSE checks for threats, GOVERNANCE enforces policy, IMMUNITY ensures resilience.' },
                { step: '04', title: 'Organs route & persist', desc: 'CORE orchestrates lifecycle, NERVE signals, AUDIT logs, RELAY dispatches — all invisible.' },
              ].map((item) => (
                <div key={item.step} className="p-4 rounded-lg border border-border bg-muted/20">
                  <div className="text-xs font-mono text-primary font-bold mb-1">STEP {item.step}</div>
                  <h3 className="font-bold text-sm text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <AuthorityLinkBlock currentPath="/architecture" />
      <EnhancedFooter />
    </>
  );
}
