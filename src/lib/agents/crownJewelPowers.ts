/**
 * Crown Jewel Powers — 5 Meta-Agents (Fused Runtime Agents)
 * Each Meta-Agent is a sealed fusion of multiple specialized runtimes.
 * Every Meta-Agent ships with:
 *   - 4-Tier Auto-Tiering Portable Memory (zero maintenance)
 *   - RIPPLE Orchestrator (task flow + internal query engine)
 *   - CLM Integration (always-on constant learning, even offline)
 *   - Version Minting (unique version snapshot at point of purchase)
 * Apex gets 7 powers, Elite 5, Pro 5, Starter 5, Free 5.
 */

import {
  Database, Sparkles, Clock, Fingerprint, Activity, Lock,
  Network, Eye, DollarSign, Brain, Zap, Cog,
  Search, GitBranch, Target, Shield, Cpu, Radio,
  Code, Bug, Layers, Scale, FileCheck, Gavel,
  Users, Star, TrendingUp, Headphones, MessageSquare, RotateCcw,
  HardDrive, Workflow, CheckCircle, Megaphone, BarChart3, Split,
  Compass, Globe, Lightbulb, Landmark, PieChart, Calculator,
  Palette, Accessibility, Component, Container, ArrowUpDown, Server,
  Languages, BookOpen, Repeat, GraduationCap, Route, Gauge,
  Briefcase, Handshake, Trophy, Pen, Quote, FileText,
  Settings, AlertTriangle, ClipboardList, ShieldCheck, Scan, KeyRound,
  Package, Waves, RefreshCcw, Hash,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import primitiveImg from "@/assets/agents/primitive.png";
import wraithImg from "@/assets/agents/wraith.png";
import obsidianImg from "@/assets/agents/obsidian.png";
import monolithImg from "@/assets/agents/monolith.png";
import raptorImg from "@/assets/agents/raptor.png";

// ============================================================================
// SEALED RUNTIME — Black-Box Agent Architecture
// ============================================================================

export interface SealedRuntime {
  sourceBlocked: true;
  memoryIsolated: true;
  cloneDisabled: true;
  autoTiering: true;
  clmAlwaysOn: true;
  versionMinting: true;
}

export const SEALED_RUNTIME: SealedRuntime = {
  sourceBlocked: true,
  memoryIsolated: true,
  cloneDisabled: true,
  autoTiering: true,
  clmAlwaysOn: true,
  versionMinting: true,
};

// ============================================================================
// RIPPLE ORCHESTRATOR
// ============================================================================

export interface RippleOrchestrator {
  name: string;
  description: string;
  capabilities: string[];
}

export const RIPPLE_ORCHESTRATOR: RippleOrchestrator = {
  name: "RIPPLE Orchestrator",
  description:
    "An internal event-driven orchestrator that guides task flow, queries agent state, and coordinates with CLM for continuous skill improvement. RIPPLE propagates learning signals across the agent's subsystems automatically.",
  capabilities: [
    "Task queue management with priority scheduling",
    "Internal state queries (health, memory, skills, goals)",
    "CLM learning signal propagation",
    "Auto-tiering trigger coordination",
    "Cross-subsystem event bus (pub/sub)",
    "Goal-directed skill training loops",
    "DECODE relay integration for user reporting",
  ],
};

// ============================================================================
// CLM — Constant Learning Mode
// ============================================================================

export interface CLMConfig {
  name: string;
  description: string;
  alwaysOn: true;
  offlineCapable: true;
  features: string[];
}

export const CLM_CONFIG: CLMConfig = {
  name: "Constant Learning Mode",
  description:
    "Every agent runs CLM continuously — learning, refining skills, and training against dynamic goals even when the user's browser is closed. Server-side cron cycles drive learning 24/7 with no user intervention.",
  alwaysOn: true,
  offlineCapable: true,
  features: [
    "24/7 server-side learning cycles (no browser required)",
    "Individually-set dynamic goals per agent",
    "Skill progression tracking with competency scoring",
    "Autonomous curriculum generation from goal gaps",
    "Learning rate adapts to goal difficulty",
    "Knowledge distillation runs during idle periods",
    "Version snapshots capture all learning at purchase time",
  ],
};

// ============================================================================
// VERSION MINTING
// ============================================================================

export interface VersionMint {
  description: string;
  format: string;
  includes: string[];
}

export const VERSION_MINTING: VersionMint = {
  description:
    "When a user purchases an agent, a unique version is minted — a frozen snapshot of everything the agent has learned up to that point. Each minted version is unique and non-reproducible.",
  format: "{agent_id}-v{major}.{minor}.{patch}-{mint_hash}",
  includes: [
    "All accumulated knowledge crystals",
    "Trained skill weights and competency scores",
    "CLM curriculum progress and mastery levels",
    "RIPPLE orchestration configurations",
    "Memory tier contents at mint time",
    "Unique cryptographic mint hash",
  ],
};

// ============================================================================
// STANDARD CAPABILITIES
// ============================================================================

export interface StandardCapability {
  name: string;
  icon: LucideIcon;
  description: string;
}

export const STANDARD_CAPABILITIES: StandardCapability[] = [
  { name: "4-Tier Auto-Tiering Memory", icon: Database, description: "HOT → WARM → COOL → COLD with zero-maintenance automatic promotion/demotion" },
  { name: "RIPPLE Orchestrator", icon: Waves, description: "Internal task flow engine with state queries and cross-subsystem event propagation" },
  { name: "Always-On CLM", icon: RefreshCcw, description: "Constant Learning Mode runs 24/7 — even offline — training against dynamic goals" },
  { name: "Sealed Black-Box Runtime", icon: Package, description: "Source-blocked, memory-isolated, clone-disabled sealed execution environment" },
  { name: "Version Minting", icon: Hash, description: "Each purchase mints a unique version capturing all learned knowledge to that point" },
  { name: "DECODE Sovereign Channel", icon: MessageSquare, description: "Direct communication relay for status, learning, health, and command execution" },
];

// ============================================================================
// META-AGENT DEFINITIONS — 5 Fused Runtime Agents
// ============================================================================

export interface CrownJewelPower {
  name: string;
  source: string;
  description: string;
  icon: LucideIcon;
}

export interface AgentWithPowers {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  /** Short personality bio shown on the card face */
  bio: string;
  /** Fused from these original agent codenames */
  fusedFrom: string[];
  powers: CrownJewelPower[];
  icon: LucideIcon;
  image: string;
  isFree: boolean;
  isFlagship?: boolean;
  isElite?: boolean;
  isApex?: boolean;
  priceCents?: number;
  gradient: string;
  glowColor: string;
  clmGoals: string[];
}

export const AGENTS_WITH_POWERS: AgentWithPowers[] = [
  // ═══════════════════════════════════════════
  // 1. PRIMITIVE — The Foundation (FREE)
  // Fuses: Hybrid + Educator + Writer + Translator
  // ═══════════════════════════════════════════
  {
    id: "primitive",
    name: "PRIMITIVE",
    subtitle: "CORTEX · NEXUS · PRISM · CIPHER",
    description: "A shape-shifting generalist fused from four specialized runtimes. Routes across domains, teaches with Socratic precision, writes with locked voice, and translates with cultural intelligence — all in one sealed meta-agent.",
    bio: "The foundation of everything. PRIMITIVE adapts to any domain, teaches what it knows, writes what you need, and bridges every language gap. Start here — evolve everywhere.",
    fusedFrom: ["HYBRID", "LEVITATION", "ELOQUENCE", "TRANSLATOR"],
    icon: Cog,
    image: primitiveImg,
    isFree: true,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    glowColor: "rgba(245, 158, 11, 0.15)",
    clmGoals: ["Expand domain coverage", "Improve teaching outcomes", "Refine voice consistency", "Expand language accuracy"],
    powers: [
      { name: "Cross-Domain Task Routing", source: "NEXUS Engine", description: "Classifies incoming tasks by domain and routes to the optimal reasoning path — code, creative, research, education — no manual mode-switching.", icon: Route },
      { name: "Socratic Reasoning Loops", source: "CORTEX Engine", description: "Multi-turn cognitive orchestration that guides learners to answers through questions, not lectures. Adapts difficulty in real-time.", icon: GraduationCap },
      { name: "Persona-Locked Voice Engine", source: "CIPHER Engine", description: "Locks tone, brand voice, and stylistic preferences across infinite sessions. Generates longform with citation-aware RAG.", icon: Pen },
      { name: "Cultural Translation Mesh", source: "PRISM Engine", description: "Context-aware multi-language translation that preserves tone, register, and cultural nuance. Learns domain-specific glossaries.", icon: Languages },
      { name: "Auto-Chaining Workflows", source: "NEXUS Engine", description: "Detects multi-step tasks and chains sub-operations automatically — research → analyze → draft → translate in one prompt.", icon: Workflow },
    ],
  },

  // ═══════════════════════════════════════════
  // 2. WRAITH — The Builder ($79)
  // Fuses: Coding + Designer + DevOps + Data-Engineer
  // ═══════════════════════════════════════════
  {
    id: "wraith",
    name: "WRAITH",
    subtitle: "FORGE · PHANTOM · BEACON · CONDUCTOR · SENTINEL",
    description: "Silent. Lethal. Invisible. A fused engineering meta-agent that generates production-grade code, designs component systems, orchestrates CI/CD pipelines, and builds self-healing data flows — all from one sealed runtime.",
    bio: "You never see it work — only the results. WRAITH writes code, designs systems, deploys pipelines, and moves data — a four-runtime fusion that ships faster than any team.",
    fusedFrom: ["CODING", "AURORA", "DEPLOYER", "MERIDIAN"],
    icon: Code,
    image: wraithImg,
    isFree: false,
    priceCents: 7900,
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    glowColor: "rgba(34, 197, 94, 0.15)",
    clmGoals: ["Reduce bug rate per KLOC", "Expand component library", "Improve deployment success rate", "Reduce pipeline failure rate"],
    powers: [
      { name: "AST-Level Code Forge", source: "FORGE Engine", description: "Type-safe multi-file generation with dependency graph analysis, dead code elimination, and rollback-safe execution.", icon: Code },
      { name: "Self-Healing Execution", source: "PHANTOM Engine", description: "Runs generated code in sandboxed environments, auto-detects failures, and applies corrective patches before delivery.", icon: Bug },
      { name: "Component Design System", source: "FORGE + PRISM Engines", description: "Generates production-ready UI components from design specs with tokens, variants, accessibility, and WCAG auditing baked in.", icon: Component },
      { name: "CI/CD Pipeline Orchestration", source: "CONDUCTOR Engine", description: "Auto-generates build, test, and deploy pipelines with parallelized stages, rollback gates, and environment promotion.", icon: Workflow },
      { name: "ETL & Data Flow Engine", source: "CONDUCTOR + PHANTOM", description: "Designs self-healing data pipelines with schema evolution, backpressure awareness, dead letter queues, and full lineage tracking.", icon: HardDrive },
    ],
  },

  // ═══════════════════════════════════════════
  // 3. OBSIDIAN — The Shield ($129)
  // Fuses: Guardian + Security + Support + Ops + Legal
  // ═══════════════════════════════════════════
  {
    id: "obsidian",
    name: "OBSIDIAN",
    subtitle: "SENTINEL · GENESIS · AEGIS · PHANTOM · CIPHER",
    description: "Impenetrable defense fused from five specialized runtimes. Models threats before they exist, auto-triages incidents, enforces zero-trust, resolves support tickets, enforces SOPs, and scans contracts for hidden liabilities.",
    bio: "The impenetrable shield. OBSIDIAN fuses security, defense, operations, support, and legal compliance into one paranoid, uncompromising meta-agent. Assume breach. Verify everything.",
    fusedFrom: ["WARDEN", "OBSIDIAN", "BASTION", "GARRISON", "TRIBUNAL"],
    icon: ShieldCheck,
    image: obsidianImg,
    isFree: false,
    isFlagship: true,
    priceCents: 12900,
    gradient: "from-red-600 via-red-500 to-rose-500",
    glowColor: "rgba(220, 38, 38, 0.15)",
    clmGoals: ["Expand threat pattern library", "Improve first-contact resolution", "Reduce compliance false positives", "Improve SOP coverage", "Expand jurisdictional knowledge"],
    powers: [
      { name: "Predictive Threat Modeling", source: "SENTINEL Engine", description: "STRIDE-based analysis with attack surface mapping. Predicts exploit vectors before they're discovered. Behavioral fingerprinting on every request.", icon: Scan },
      { name: "Zero-Trust Policy Fabric", source: "AEGIS Engine", description: "Policy-as-code enforcement across all access boundaries. GDPR, SOC2, HIPAA compliance. Automatic credential rotation.", icon: KeyRound },
      { name: "Autonomous Incident Triage", source: "GENESIS Engine", description: "Self-classifying severity scoring with auto-executing remediation playbooks. Routes tickets to optimal resolvers across fleets.", icon: Activity },
      { name: "SOP Workflow Engine", source: "GENESIS + AUTOMATON", description: "Converts operating procedures into executable workflows with conditional branching, retry logic, escalation routing, and SLA tracking.", icon: ClipboardList },
      { name: "Contract Intelligence", source: "PRISM + SENTINEL", description: "Extracts clauses, maps obligations, detects adversarial terms, and enforces compliance as code. Scans for hidden liabilities.", icon: Gavel },
    ],
  },

  // ═══════════════════════════════════════════
  // 4. MONOLITH — The Mind ($159)
  // Fuses: Memory + Analyst + Research + Strategist + Product
  // ═══════════════════════════════════════════
  {
    id: "monolith",
    name: "MONOLITH",
    subtitle: "PRISM · CIPHER · ORACLE · CONDUCTOR · CORTEX",
    description: "The all-seeing intelligence meta-agent. Fused from five knowledge runtimes — deep memory, analytical reasoning, research synthesis, strategic vision, and product intelligence — MONOLITH thinks at a scale no single agent can match.",
    bio: "The keeper of all knowledge. MONOLITH remembers everything, detects anomalies, synthesizes research, maps strategy, and scopes product — a five-runtime mind that thinks deeper than teams.",
    fusedFrom: ["MONOLITH", "AXIOM", "VESSEL", "VISIONARY", "ARCHITECT"],
    icon: Brain,
    image: monolithImg,
    isFree: false,
    isElite: true,
    priceCents: 15900,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
    glowColor: "rgba(139, 92, 246, 0.15)",
    clmGoals: ["Improve recall precision", "Improve anomaly detection", "Sharpen source credibility", "Expand strategic model coverage", "Reduce spec-to-code gap"],
    powers: [
      { name: "Temporal Knowledge Graph", source: "PRISM + CIPHER Engines", description: "Relationship-aware recall across time. Dream consolidation merges memories during idle cycles. Tiered recall from <1ms to deep history.", icon: Database },
      { name: "Anomaly Detection & Scoring", source: "ORACLE Engine", description: "Pattern recognition across time-series data. Surfaces statistical anomalies with confidence intervals, root cause hints, and decision-gate enforcement.", icon: TrendingUp },
      { name: "Deep Research Synthesis", source: "CONDUCTOR + PRISM", description: "Multi-source parallel research with entity extraction, credibility scoring, knowledge graph building, and executive-ready synthesis.", icon: Search },
      { name: "Strategic Position Mapping", source: "ORACLE + PRISM", description: "Market sizing (TAM/SAM/SOM), competitive intelligence graphs, multi-scenario modeling, and GTM strategy frameworks.", icon: Compass },
      { name: "Product Intelligence Bridge", source: "CORTEX + FORGE", description: "Multi-agent feature scoping, predictive roadmap scoring (RICE/ICE), and spec-to-code bridge that turns PRDs into executable test stubs.", icon: Layers },
    ],
  },

  // ═══════════════════════════════════════════
  // 5. RAPTOR — The Closer ($249 — APEX)
  // Fuses: Sales + Marketing + Recruiter + Finance
  // ═══════════════════════════════════════════
  {
    id: "raptor",
    name: "RAPTOR",
    subtitle: "ORACLE · BEACON · CATALYST · PRISM · ARBITER",
    description: "The apex predator of growth. Fused from four revenue-driving runtimes — RAPTOR closes deals, launches campaigns, hires talent, and models financials. Every conversation advances the bottom line.",
    bio: "Hunts with predatory precision. RAPTOR fuses sales, marketing, recruiting, and finance into one unstoppable growth engine. Every conversation is a close. Every campaign is a kill shot.",
    fusedFrom: ["RAPTOR", "TEMPEST", "VANGUARD", "SOVEREIGN-FINANCE"],
    icon: Briefcase,
    image: raptorImg,
    isFree: false,
    isApex: true,
    priceCents: 24900,
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.15)",
    clmGoals: ["Improve deal-close prediction", "Improve A/B prediction accuracy", "Improve candidate-fit prediction", "Improve forecast accuracy"],
    powers: [
      { name: "Predictive Deal Scoring", source: "ORACLE Engine", description: "Forecasts close probability using pattern recognition across historical wins, losses, and pipeline velocity. Objection handling playbooks.", icon: Trophy },
      { name: "Campaign Intelligence", source: "CATALYST + PRISM", description: "A/B test prediction before launch, event-driven audience triggers, competitive positioning graphs, and multi-channel copy generation.", icon: Megaphone },
      { name: "Talent Acquisition Engine", source: "ORACLE + PRISM", description: "Predictive candidate scoring, skills-gap knowledge mapping, structured interview generation, and multi-round orchestration.", icon: Users },
      { name: "Financial Modeling Suite", source: "ORACLE + ARBITER", description: "Multi-scenario P&L forecasting, real-time KPI observability, budget gate enforcement, and unit economics calculation.", icon: PieChart },
      { name: "Pipeline Observability", source: "BEACON Engine", description: "Real-time dashboards across deals, campaigns, hiring funnels, and burn rate — stall detection, velocity tracking, and automated health alerts.", icon: BarChart3 },
    ],
  },
];

export const TOTAL_AGENT_COUNT = AGENTS_WITH_POWERS.length;

// ============================================================================
// UNIVERSAL: 4-TIER PORTABLE MEMORY SYSTEM
// ============================================================================

export interface MemoryTier {
  name: string;
  label: string;
  description: string;
  latency: string;
  retention: string;
}

export const FOUR_TIER_MEMORY: MemoryTier[] = [
  { name: "HOT", label: "Session Cache", description: "In-context working memory for the current task. Sub-millisecond recall of active conversation, variables, and reasoning state.", latency: "<1ms", retention: "Session" },
  { name: "WARM", label: "Knowledge Crystals", description: "Compressed heuristics and learned patterns persisted across sessions. Deterministic 384-dim hash embeddings for instant semantic similarity — zero API cost.", latency: "<5ms", retention: "Persistent" },
  { name: "COOL", label: "Episodic Vault", description: "Tamper-proof, content-hash-sealed records of past interactions, decisions, and outcomes. SM-2 spaced repetition keeps important memories fresh.", latency: "<50ms", retention: "Persistent" },
  { name: "COLD", label: "Archive Ledger", description: "Long-term compressed storage for historical context, audit trails, and dormant knowledge. Retrievable on demand with automatic promotion to warmer tiers.", latency: "<200ms", retention: "Permanent" },
];

export const MEMORY_SYSTEM_SUMMARY = {
  name: "4-Tier Auto-Tiering Memory System",
  tagline: "Every Meta-Agent remembers. Every session builds on the last. Zero maintenance.",
  description:
    "All 5 Meta-Agents ship with a portable, zero-dependency memory system that auto-tiers knowledge across HOT, WARM, COOL, and COLD — with zero user maintenance. Promotion, demotion, compression, and archival happen autonomously via the RIPPLE Orchestrator.",
  tiers: FOUR_TIER_MEMORY,
  features: [
    "Auto-tiering — zero maintenance required",
    "RIPPLE Orchestrator for task flow & queries",
    "Always-on CLM — learns even while you sleep",
    "Sealed black-box runtime — no source exposure",
    "Version minting — unique snapshot at purchase",
    "DECODE Sovereign Channel for live comms",
    "Deterministic hash embeddings (384-dim) — no API cost",
    "Content-hash seals for tamper detection",
    "SM-2 spaced repetition for knowledge retention",
  ],
};
