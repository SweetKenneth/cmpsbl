/**
 * Architecture — Shared data extracted from ArchitecturePage
 * Used by both mobile and desktop layout components
 */

import {
  Cpu, Server, Zap, Waves, Send, Fingerprint, KeyRound, Network, FileCheck, Plug,
  Shield, Bug, Scale, Target, Dna, Accessibility, Heart, ScrollText,
  Brain, Database, Moon, Workflow, Telescope, Hammer, Compass, Map, Coins, FlaskConical, Stethoscope, Activity,
  Code2, Languages, Eye, Ghost, Globe2, Radio, Wheat, Crown, Cog, EyeOff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TaxonomyEntry {
  id: string;
  label: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  slug: string;
}

export interface TaxonomyCategory {
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

export const TAXONOMY: TaxonomyCategory[] = [
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
      { id: 'audit', label: 'AUDIT', tagline: 'Immutable Ledger', description: 'Append-only logging with SHA-256 hash chaining and compliance reporting.', icon: FileCheck, slug: 'audit' },
      { id: 'economy', label: 'ECONOMY', tagline: 'Cost Engine', description: 'Real-time cost attribution, budget enforcement, token systems, and marketplace pricing.', icon: Coins, slug: 'economy' },
      { id: 'inclusive', label: 'INCLUSIVE', tagline: 'Accessibility', description: 'WCAG 2.2 scanning, AI-powered fixes, continuous monitoring, and compliance reporting.', icon: Accessibility, slug: 'inclusive' },
      { id: 'cortex', label: 'CORTEX', tagline: 'Conductor', description: 'DAG execution engine, cascade failure prediction, adaptive backpressure, and workflow templates.', icon: Workflow, slug: 'cortex' },
      { id: 'oracle', label: 'ORACLE', tagline: 'Predictive Engine', description: 'Probabilistic reasoning, future-state modeling, Bayesian networks, and predictive analytics.', icon: Telescope, slug: 'oracle' },
      { id: 'engineer', label: 'ENGINEER', tagline: 'Mechanic', description: 'Diagnostics, self-tuning, predictive maintenance, and architectural optimization.', icon: Cog, slug: 'engineer' },
    ],
  },
];

export const TOTAL = TAXONOMY.reduce((s, c) => s + c.entries.length, 0);

export const ASCII_DIAGRAM = `
┌──────────────────────────────────────────────────────────────────┐
│                    CMPSBL® SUBSTRATE v9.0.0                     │
│                   40-Primitive Architecture                      │
│                      12 · 12 · 8 · 8                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─── LAYERS (12 — Ambient Overlays) ──────────────────────────┐  │
│  │  DEFENSE   IMMUNITY    GOVERNANCE  TREATY                   │  │
│  │  EVOLUTION REFLEX      COMPASS     INTEGRATION              │  │
│  │  INTENT    ACCESS      VISION      SHADOW                   │  │
│  │  "Always on, always watching, always enforcing"            │  │
│  │                                                              │  │
│  │  ┌─── AGENTS (8 — Autonomous Actors) ────────────────────┐  │  │
│  │  │  ENCODE  DECODE  AUDIT  ECONOMY                       │  │  │
│  │  │  INCLUSIVE  CORTEX  ORACLE  ENGINEER                   │  │  │
│  │  │  "They decide, act, and learn on their own"            │  │  │
│  │  │                                                        │  │  │
│  │  │  ┌─── ENGINES (8 — Processing Power) ───────────────┐  │  │  │
│  │  │  │  DREAM  HARVEST  FORGE  LINGUA                   │  │  │  │
│  │  │  │  ECHO   PHANTOM  SANDBOX  RIPPLE                 │  │  │  │
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
