/**
 * Modules Hub — Complete 40-Primitive Matrix across 4 Categories
 * Neural Cartography view of the full substrate architecture
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { AuthorityLinkBlock } from "@/components/seo/AuthorityLinkBlock";
import { cn } from "@/lib/utils";
import {
  Cpu, Server, Brain, Database, Moon,
  Waves, KeyRound, Fingerprint, Send, FileCheck, Zap,
  Languages, Code2, Eye, Workflow, Network, Coins, FlaskConical, Accessibility, Wrench, Plug,
  Shield, Bug, Target, Scale,
  Crown, Telescope, Heart, ScrollText,
  Compass, Radio, Activity,
  Hammer, Globe2, Wheat,
  Dna, Ghost, EyeOff,
  Map, Cog, Stethoscope,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// 40-PRIMITIVE REGISTRY — Canonical Source
// ═══════════════════════════════════════════════════════════

interface NodeEntry {
  id: string;
  label: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  slug: string;
  weight: number;
}

interface SectorDef {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  totalWeight: string;
  color: string;       // tailwind bg color token
  borderColor: string;
  textColor: string;
  nodes: NodeEntry[];
}

const SECTORS: SectorDef[] = [
  {
    key: 'core',
    label: 'CORE KERNEL',
    shortLabel: 'CORE',
    description: 'Kernel orchestration, 12-stage DAG boot, and event backbone',
    totalWeight: '0.110',
    color: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    textColor: 'text-amber-400',
    nodes: [
      { id: 'core', label: 'CORE', tagline: 'Foundation Runtime', description: 'Boot kernel, lifecycle management, event bus, and health monitoring for all 40 primitives.', icon: Cpu, slug: 'core', weight: 0.110 },
    ],
  },
  {
    key: 'system',
    label: 'SYSTEM LAYER',
    shortLabel: 'SYSTEM',
    description: 'Self-healing core with predictive failure and repair optimization',
    totalWeight: '0.040',
    color: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20',
    textColor: 'text-slate-400',
    nodes: [
      { id: 'system', label: 'SYSTEM', tagline: 'Sentinel', description: 'Predictive failure engine, repair optimizer, config state machine, and lifecycle orchestrator.', icon: Server, slug: 'system', weight: 0.040 },
    ],
  },
  {
    key: 'ccr',
    label: 'CCR — Cognitive Core Reality',
    shortLabel: 'CCR',
    description: 'Reasoning, tiered memory architecture, and dream synthesis',
    totalWeight: '0.120',
    color: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    textColor: 'text-violet-400',
    nodes: [
      { id: 'brain', label: 'BRAIN', tagline: 'Neural Cognition', description: 'BM25 ranking, SDR pattern matching, associative memory graph, and working memory buffer.', icon: Brain, slug: 'brain', weight: 0.040 },
      { id: 'memory', label: 'MEMORY', tagline: 'Tiered Storage', description: '4-tier cognitive architecture (Hot/Warm/Cold/Glacier) with cross-tier semantic index.', icon: Database, slug: 'memory', weight: 0.040 },
      { id: 'dream', label: 'DREAM', tagline: 'Nocturne Synthesis', description: 'Lineage provenance, semantic drift detection, lucid dreaming modes, and consolidation orchestrator.', icon: Moon, slug: 'dream', weight: 0.040 },
    ],
  },
  {
    key: 'ocg',
    label: 'OCG — Operational Compliance Grid',
    shortLabel: 'OCG',
    description: 'Event bus, entitlements, auth, webhooks, ledger, and inter-primitive signaling',
    totalWeight: '0.150',
    color: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    textColor: 'text-emerald-400',
    nodes: [
      { id: 'ripple', label: 'RIPPLE', tagline: 'Cascade Event Network', description: 'Intelligent fan-out, priority routing, deduplication, and backpressure handling.', icon: Waves, slug: 'ripple', weight: 0.025 },
      { id: 'access', label: 'ACCESS', tagline: 'Entitlements Gateway', description: 'SHA-256 API keys, scope hierarchy, rate limiting, and usage metering.', icon: KeyRound, slug: 'access', weight: 0.025 },
      { id: 'identity', label: 'IDENTITY', tagline: 'Actor Attribution', description: 'Human/agent/system identity, persistent signatures, and cross-system provenance.', icon: Fingerprint, slug: 'identity', weight: 0.025 },
      { id: 'relay', label: 'RELAY', tagline: 'Outbound Effects', description: 'Webhook dispatch, notification routing, retry queues, and delivery guarantees.', icon: Send, slug: 'relay', weight: 0.025 },
      { id: 'audit', label: 'AUDIT', tagline: 'Immutable Ledger', description: 'Append-only logging with SHA-256 hash chaining and compliance reporting.', icon: FileCheck, slug: 'audit', weight: 0.025 },
      { id: 'nerve', label: 'NERVE', tagline: 'Neural Signaling', description: 'Inter-primitive consensus repair, signal backbone, and neural pathway management.', icon: Zap, slug: 'nerve', weight: 0.025 },
    ],
  },
  {
    key: 'execution',
    label: 'EXECUTION',
    shortLabel: 'EXEC',
    description: 'The largest group — 10 primitives translating intent into governed outcomes',
    totalWeight: '0.220',
    color: 'bg-sky-500/10',
    borderColor: 'border-sky-500/20',
    textColor: 'text-sky-400',
    nodes: [
      { id: 'decode', label: 'DECODE', tagline: 'Omniscient Interpreter', description: 'Multi-modal input, NLU intent classification, epistemic audit trail, and streaming responses.', icon: Languages, slug: 'decode', weight: 0.023 },
      { id: 'encode', label: 'ENCODE', tagline: 'Architect Engine', description: 'AST-aware patches, DAG-ordered orchestration, immutable rollback ledger, and 71-skill proficiency.', icon: Code2, slug: 'encode', weight: 0.023 },
      { id: 'vision', label: 'VISION', tagline: 'Observability', description: 'Real-time surface health, request tracing, cost attribution, and predictive alerts.', icon: Eye, slug: 'vision', weight: 0.023 },
      { id: 'cortex', label: 'CORTEX', tagline: 'Conductor', description: 'DAG execution engine, cascade failure prediction, adaptive backpressure, and workflow templates.', icon: Workflow, slug: 'cortex', weight: 0.023 },
      { id: 'nexus', label: 'NEXUS', tagline: 'Fleet Admiral', description: '14-provider fleet, health ranking, zero-mock policy, multi-model consensus, and cost ledger.', icon: Network, slug: 'nexus', weight: 0.023 },
      { id: 'economy', label: 'ECONOMY', tagline: 'Cost Engine', description: 'Real-time cost attribution, budget enforcement, token systems, and marketplace pricing.', icon: Coins, slug: 'economy', weight: 0.021 },
      { id: 'sandbox', label: 'SANDBOX', tagline: 'Isolated Execution', description: 'Hermetically sealed environments for speculative runs, evolution testing, and experimentation.', icon: FlaskConical, slug: 'sandbox', weight: 0.021 },
      { id: 'inclusive', label: 'INCLUSIVE', tagline: 'Accessibility', description: 'WCAG 2.2 scanning, AI-powered fixes, continuous monitoring, and compliance reporting.', icon: Accessibility, slug: 'inclusive', weight: 0.021 },
      { id: 'medic', label: 'MEDIC', tagline: 'Diagnostics', description: 'Autonomous health management, self-repair coordination, and diagnostic telemetry.', icon: Stethoscope, slug: 'medic', weight: 0.022 },
      { id: 'integration', label: 'INTEGRATION', tagline: 'Adapter Bridge', description: 'Universal connectors, pre-built adapters, bidirectional sync, and resilience patterns.', icon: Plug, slug: 'integration', weight: 0.020 },
    ],
  },
  {
    key: 'esz',
    label: 'ESZ — Expansion Sovereignty Zone',
    shortLabel: 'ESZ',
    description: 'Data sovereignty, prediction, ethics, and contract enforcement',
    totalWeight: '0.080',
    color: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    textColor: 'text-amber-400',
    nodes: [
      { id: 'sovereign', label: 'SOVEREIGN', tagline: 'Data Sovereignty', description: 'Jurisdictional compliance, data residency enforcement, and sovereignty protocols.', icon: Crown, slug: 'sovereign', weight: 0.020 },
      { id: 'oracle', label: 'ORACLE', tagline: 'Predictive Engine', description: 'Probabilistic reasoning, future-state modeling, and predictive analytics.', icon: Telescope, slug: 'oracle', weight: 0.020 },
      { id: 'conscience', label: 'CONSCIENCE', tagline: 'Ethical Assessment', description: 'Bias detection, ethical scoring, and responsible AI enforcement.', icon: Heart, slug: 'conscience', weight: 0.020 },
      { id: 'treaty', label: 'TREATY', tagline: 'Contract Engine', description: 'SLA enforcement, contract negotiation, and agreement lifecycle management.', icon: ScrollText, slug: 'treaty', weight: 0.020 },
    ],
  },
  {
    key: 'epz',
    label: 'EPZ — Expansion Perception Zone',
    shortLabel: 'EPZ',
    description: 'Geospatial analysis, digital twin simulation, and edge compute',
    totalWeight: '0.060',
    color: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    textColor: 'text-cyan-400',
    nodes: [
      { id: 'compass', label: 'COMPASS', tagline: 'Geospatial', description: 'Location intelligence, coordinate analysis, geofencing, and spatial queries.', icon: Compass, slug: 'compass', weight: 0.020 },
      { id: 'echo', label: 'ECHO', tagline: 'Digital Twin', description: 'Simulation replay, state mirroring, scenario testing, and twin synchronization.', icon: Radio, slug: 'echo', weight: 0.020 },
      { id: 'reflex', label: 'REFLEX', tagline: 'Edge Compute', description: 'Edge orchestration, latency-optimized routing, and distributed processing.', icon: Activity, slug: 'reflex', weight: 0.020 },
    ],
  },
  {
    key: 'emz',
    label: 'EMZ — Expansion Manufacturing Zone',
    shortLabel: 'EMZ',
    description: 'Artifact synthesis, translation, and data acquisition pipelines',
    totalWeight: '0.045',
    color: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    textColor: 'text-orange-400',
    nodes: [
      { id: 'forge', label: 'FORGE', tagline: 'Artifact Synthesis', description: 'Manufacturing pipelines, artifact generation, and production orchestration.', icon: Hammer, slug: 'forge', weight: 0.015 },
      { id: 'lingua', label: 'LINGUA', tagline: 'Translation', description: 'Multi-language translation, localization, and cultural adaptation.', icon: Globe2, slug: 'lingua', weight: 0.015 },
      { id: 'harvest', label: 'HARVEST', tagline: 'Data Acquisition', description: 'ETL pipelines, data ingestion, web crawling, and structured extraction.', icon: Wheat, slug: 'harvest', weight: 0.015 },
    ],
  },
  {
    key: 'csz',
    label: 'CSZ — Covert Systems Zone',
    shortLabel: 'CSZ',
    description: 'Self-evolution, divergence testing, and privacy protection',
    totalWeight: '0.055',
    color: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    textColor: 'text-red-400',
    nodes: [
      { id: 'evolution', label: 'EVOLUTION', tagline: 'Self-Evolution', description: 'Mutation lifecycle, optimization scanning, governed proposals, and shadow testing.', icon: Dna, slug: 'evolution', weight: 0.020 },
      { id: 'shadow', label: 'SHADOW', tagline: 'Divergence Mesh', description: 'Shadow operations, divergence testing, and parallel execution analysis.', icon: EyeOff, slug: 'shadow', weight: 0.018 },
      { id: 'phantom', label: 'PHANTOM', tagline: 'Privacy Engine', description: 'Anonymization, data masking, and privacy-preserving computation.', icon: Ghost, slug: 'phantom', weight: 0.017 },
    ],
  },
  {
    key: 'field',
    label: 'FIELDS — Transformation Fabric',
    shortLabel: 'FIELDS',
    description: 'Cross-cutting fields that permeate all categories',
    totalWeight: '0.060',
    color: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    textColor: 'text-purple-400',
    nodes: [
      { id: 'immunity', label: 'IMMUNITY', tagline: 'Resilience Field', description: 'Adaptive resilience, shadow executors, self-healing patterns, and failure immunization.', icon: Bug, slug: 'immunity', weight: 0.030 },
      { id: 'intent', label: 'INTENT', tagline: 'Discovery Field', description: 'Cross-surface intent resolution, goal decomposition, and capability crystallization.', icon: Target, slug: 'intent-mesh', weight: 0.030 },
    ],
  },
  {
    key: 'plane',
    label: 'PLANE — Supervisory Overlay',
    shortLabel: 'PLANE',
    description: 'Policy enforcement, governance authority, and meta-engine intelligence',
    totalWeight: '0.050',
    color: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-400',
    nodes: [
      { id: 'governance', label: 'GOVERNANCE', tagline: 'Policy Engine', description: 'Ethical constraints, veto authority, coherence enforcement, and policy-as-code.', icon: Scale, slug: 'governance', weight: 0.020 },
      { id: 'atlas', label: 'ATLAS', tagline: 'Control Authority', description: 'Governance authority, system control plane, and cross-category oversight.', icon: Map, slug: 'atlas', weight: 0.015 },
      { id: 'engineer', label: 'ENGINEER', tagline: 'Meta-Engine', description: 'Engine maintenance intelligence, optimization research, and architectural oversight.', icon: Cog, slug: 'engineer', weight: 0.015 },
    ],
  },
  {
    key: 'shell',
    label: 'SHELL — Containment Boundary',
    shortLabel: 'SHELL',
    description: 'Outer threat boundary and terminal security enforcement',
    totalWeight: '0.010',
    color: 'bg-red-600/10',
    borderColor: 'border-red-600/20',
    textColor: 'text-red-500',
    nodes: [
      { id: 'defense', label: 'DEFENSE', tagline: 'Guardian', description: 'Prompt injection defense, threat intelligence, adversarial filtering, and incident response.', icon: Shield, slug: 'defense', weight: 0.010 },
    ],
  },
];

const TOTAL_NODES = SECTORS.reduce((s, sec) => s + sec.nodes.length, 0);

// ═══════════════════════════════════════════════════════════

export default function ModulesHub() {
  return (
    <>
      <SEO
        title="All 40 Primitives — Full Matrix Architecture | CMPSBL"
        description="Explore the complete 40-primitive substrate matrix across 4 categories — Organs, Layers, Engines, and Agents — organized into 12 operational zones."
        image="https://cmpsbl.com/og/systems.jpg"
        keywords={['AI substrate architecture', '40-primitive matrix', 'composable AI', 'cognitive kernel', 'AI operating system']}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'Modules', url: 'https://cmpsbl.com/modules' },
        ]}
      />

      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          
          <div className="container mx-auto max-w-6xl px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4 border border-border rounded-full px-4 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {TOTAL_NODES} Primitives · 12 Zones · Σ(w) = 1.000
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                <span className="text-foreground">Substrate</span>{' '}
                <span className="text-primary">Matrix</span>
              </h1>
              
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                The complete 40-primitive cognitive topology. Each primitive is an autonomous subsystem —
                together they form a field-based architecture that reasons, evolves, and self-heals.
              </p>

              {/* Boot sequence visualization */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-3xl mx-auto">
                {['CORE', 'SYSTEM', 'CCR', 'OCG', 'EXEC', 'INT', 'FIELDS', 'PLANE', 'SHELL'].map((stage, i) => (
                  <div key={stage} className="flex items-center gap-1.5">
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i, duration: 0.3 }}
                      className="text-[10px] font-mono px-2 py-0.5 rounded border border-border bg-muted/50 text-muted-foreground"
                    >
                      {stage}
                    </motion.span>
                    {i < 8 && <span className="text-muted-foreground/30 text-xs">→</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Integrity equation banner */}
        <div className="border-y border-border bg-muted/30">
          <div className="container mx-auto max-w-6xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <code className="text-xs font-mono text-muted-foreground">
              matrixIntegrity = Σ(node.health × node.weight)
            </code>
            <span className="text-xs font-mono text-primary/60">v16.7.0 — IRONCLAD EPOCH</span>
          </div>
        </div>

        {/* All Sectors */}
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="space-y-12">
            {SECTORS.map((sector, sectorIdx) => (
              <motion.section
                key={sector.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: sectorIdx * 0.03 }}
              >
                {/* Sector Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={cn("w-1 h-10 rounded-full shrink-0 mt-0.5", sector.textColor.replace('text-', 'bg-'), "opacity-60")} />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className={cn("text-lg sm:text-xl font-bold", sector.textColor)}>{sector.label}</h2>
                      <span className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">
                        Σ {sector.totalWeight} · {sector.nodes.length} {sector.nodes.length === 1 ? 'node' : 'nodes'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{sector.description}</p>
                  </div>
                </div>

                {/* Node Cards */}
                <div className={cn(
                  "grid gap-3",
                  sector.nodes.length === 1 ? "grid-cols-1 max-w-lg" :
                  sector.nodes.length === 2 ? "grid-cols-1 sm:grid-cols-2" :
                  sector.nodes.length <= 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" :
                  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                )}>
                  {sector.nodes.map((node) => (
                    <Link
                      key={node.id}
                      to={`/modules/${node.slug}`}
                      className={cn(
                        "group relative p-4 rounded-lg border transition-all duration-300",
                        "hover:shadow-lg hover:-translate-y-0.5",
                        sector.color,
                        sector.borderColor,
                        "hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                          "bg-background/50 group-hover:bg-primary/10 transition-colors"
                        )}>
                          <node.icon className={cn("w-4.5 h-4.5 transition-colors", sector.textColor, "group-hover:text-primary")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-sm text-foreground">{node.label}</h3>
                            <span className="text-[9px] font-mono text-muted-foreground opacity-60">{node.weight.toFixed(3)}</span>
                          </div>
                          <p className={cn("text-xs font-medium mb-1", sector.textColor, "opacity-80")}>{node.tagline}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{node.description}</p>
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

        {/* Weight Distribution Table */}
        <section className="border-t border-border bg-muted/20">
          <div className="container mx-auto max-w-4xl px-4 py-12">
            <h2 className="text-xl font-bold mb-6 text-foreground">Weight Distribution</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
              {SECTORS.map((sector) => (
                <div key={sector.key} className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", sector.textColor.replace('text-', 'bg-'))} />
                    <span className="text-sm font-mono text-foreground">{sector.shortLabel}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{sector.nodes.length} nodes</span>
                    <span className="text-sm font-mono text-primary">{sector.totalWeight}</span>
                  </div>
                </div>
              ))}
              <div className="col-span-full flex items-center justify-between py-2 mt-2 border-t border-border">
                <span className="text-sm font-bold text-foreground">TOTAL</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{TOTAL_NODES} nodes</span>
                  <span className="text-sm font-mono font-bold text-primary">1.000</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Zone Shielding */}
        <section className="border-t border-border">
          <div className="container mx-auto max-w-6xl px-4 py-12">
            <h2 className="text-xl font-bold mb-6 text-foreground">Zone Shielding Model</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Expansion zones are zone-shielded — they can degrade independently without affecting core operations.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { code: 'ESZ', purpose: 'Sovereignty & Ethics', impact: 'Reduced governance reach', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
                { code: 'EPZ', purpose: 'Perception & Edge', impact: 'Reduced foresight', color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5' },
                { code: 'EMZ', purpose: 'Manufacturing', impact: 'Reduced production', color: 'text-orange-400 border-orange-500/20 bg-orange-500/5' },
                { code: 'CSZ', purpose: 'Covert Operations', impact: 'Reduced evolution', color: 'text-red-400 border-red-500/20 bg-red-500/5' },
              ].map((zone) => (
                <div key={zone.code} className={cn("rounded-lg border p-4", zone.color)}>
                  <div className="font-mono font-bold text-sm mb-1">{zone.code}</div>
                  <div className="text-xs text-muted-foreground mb-2">{zone.purpose}</div>
                  <div className="text-[10px] font-mono text-muted-foreground/60">Degradation: {zone.impact}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <AuthorityLinkBlock currentPath="/modules" />
      <EnhancedFooter />
    </>
  );
}
