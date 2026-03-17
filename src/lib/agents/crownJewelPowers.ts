/**
 * Crown Jewel Powers — 20 Sealed Runtime Agents
 * Every Runtime Agent ships with:
 *   - 4-Tier Auto-Tiering Portable Memory (zero maintenance)
 *   - RIPPLE Orchestrator (task flow + internal query engine)
 *   - CLM Integration (always-on constant learning, even offline)
 *   - Version Minting (unique version snapshot at point of purchase)
 * Elite agents get 5 powers, Flagships get 3, Standard/Free get 3.
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

// ============================================================================
// SEALED RUNTIME — Black-Box Agent Architecture
// ============================================================================

export interface SealedRuntime {
  /** Source code is obfuscated and non-extractable */
  sourceBlocked: true;
  /** Memory cannot leak to other agents or external systems */
  memoryIsolated: true;
  /** Cloning/forking is disabled at the runtime level */
  cloneDisabled: true;
  /** Auto-tiering requires zero user maintenance */
  autoTiering: true;
  /** CLM runs continuously even when the user is offline */
  clmAlwaysOn: true;
  /** Each purchase mints a unique version */
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
// RIPPLE ORCHESTRATOR — Internal Task Flow + Query Engine
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
// CLM — Constant Learning Mode (Always-On, Even Offline)
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
// VERSION MINTING — Unique Agent Instance at Purchase
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
// STANDARD CAPABILITIES — Ships with EVERY agent
// ============================================================================

export interface StandardCapability {
  name: string;
  icon: LucideIcon;
  description: string;
}

export const STANDARD_CAPABILITIES: StandardCapability[] = [
  {
    name: "4-Tier Auto-Tiering Memory",
    icon: Database,
    description: "HOT → WARM → COOL → COLD with zero-maintenance automatic promotion/demotion",
  },
  {
    name: "RIPPLE Orchestrator",
    icon: Waves,
    description: "Internal task flow engine with state queries and cross-subsystem event propagation",
  },
  {
    name: "Always-On CLM",
    icon: RefreshCcw,
    description: "Constant Learning Mode runs 24/7 — even offline — training against dynamic goals",
  },
  {
    name: "Sealed Black-Box Runtime",
    icon: Package,
    description: "Source-blocked, memory-isolated, clone-disabled sealed execution environment",
  },
  {
    name: "Version Minting",
    icon: Hash,
    description: "Each purchase mints a unique version capturing all learned knowledge to that point",
  },
  {
    name: "DECODE Sovereign Channel",
    icon: MessageSquare,
    description: "Direct communication relay for status, learning, health, and command execution",
  },
];

// ============================================================================
// AGENT DEFINITIONS
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
  powers: CrownJewelPower[];
  icon: LucideIcon;
  isFree: boolean;
  isFlagship?: boolean;
  isElite?: boolean;
  priceCents?: number;
  gradient: string;
  glowColor: string;
  /** Dynamic goals this agent trains against via CLM */
  clmGoals: string[];
}

export const AGENTS_WITH_POWERS: AgentWithPowers[] = [
  // ═══════════════════════════════════════════
  // 1. MEMORY AGENT (Flagship)
  // ═══════════════════════════════════════════
  {
    id: "memory",
    name: "MEMORY Agent",
    subtitle: "PRISM · CIPHER · Memory Intelligence Fabric",
    description: "A living knowledge graph. Relationships between memories evolve, consolidate during idle cycles, and surface at sub-millisecond speed.",
    icon: Brain,
    isFree: false,
    isFlagship: true,
    priceCents: 12900,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
    glowColor: "rgba(139, 92, 246, 0.15)",
    clmGoals: ["Improve recall precision", "Reduce contradiction rate", "Optimize tier promotion accuracy"],
    powers: [
      { name: "Temporal Knowledge Graph", source: "PRISM Engine", description: "Relationship-aware recall that understands how memories connect, contradict, and evolve over time.", icon: Database },
      { name: "Dream Consolidation", source: "Memory Intelligence Fabric", description: "Offline synthesis that merges and strengthens memories during idle cycles — gets smarter while it sleeps.", icon: Sparkles },
      { name: "Tiered Recall Architecture", source: "CIPHER Engine", description: "Hot/warm/cold memory tiers with intelligent promotion. Recent context in <1ms, deep history in <50ms.", icon: Clock },
    ],
  },

  // 2. GUARDIAN AGENT (Flagship)
  {
    id: "guardian",
    name: "GUARDIAN Agent",
    subtitle: "SENTINEL · GENESIS · Immune Autonomy Mesh",
    description: "An immune system, not a firewall. Fingerprints behavior, predicts attack vectors, and auto-triages incidents without human intervention.",
    icon: Shield,
    isFree: false,
    isFlagship: true,
    priceCents: 12900,
    gradient: "from-red-500 via-rose-500 to-orange-600",
    glowColor: "rgba(239, 68, 68, 0.15)",
    clmGoals: ["Reduce false positive rate", "Expand threat pattern library", "Improve triage accuracy"],
    powers: [
      { name: "Behavioral Fingerprinting", source: "SENTINEL Engine", description: "Real-time behavioral profiles of every request. Detects prompt injection and novel attack patterns before damage.", icon: Fingerprint },
      { name: "Autonomous Incident Triage", source: "GENESIS Engine", description: "Self-classifying severity scoring with auto-executing remediation playbooks for every threat level.", icon: Activity },
      { name: "Evolving Immune Mesh", source: "Immune Autonomy Meta-Engine", description: "Every blocked threat strengthens the mesh. An attack on one deployment immunizes every other automatically.", icon: Lock },
    ],
  },

  // 3. ROUTER AGENT (Flagship)
  {
    id: "router",
    name: "ROUTER Agent",
    subtitle: "NEXUS · MIRAGE · ORACLE",
    description: "A fleet intelligence engine. Predicts which model produces the best answer for this exact task at this exact moment, then routes accordingly.",
    icon: Zap,
    isFree: false,
    isFlagship: true,
    priceCents: 12900,
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    glowColor: "rgba(16, 185, 129, 0.15)",
    clmGoals: ["Improve routing accuracy", "Reduce cost per query", "Predict latency more precisely"],
    powers: [
      { name: "Cognitive Affinity Matching", source: "NEXUS + MIRAGE Engines", description: "Routes tasks to the model with highest empirical confidence for that task type — math, creative, code — automatically.", icon: Network },
      { name: "Predictive Latency Shaping", source: "ORACLE Engine", description: "Forecasts provider response times 30s ahead and pre-routes to avoid slowdowns before they happen.", icon: Eye },
      { name: "Real-Time Cost Arbitrage", source: "NEXUS Engine", description: "Token-level spend tracking with automatic provider rotation. Same quality, 40-60% less cost.", icon: DollarSign },
    ],
  },

  // 4. HYBRID MIND (Generalist)
  {
    id: "hybrid",
    name: "HYBRID Mind",
    subtitle: "CORTEX · NEXUS · AUTOMATON",
    description: "A free cross-domain generalist that routes to the right cognitive path, balances multi-task load, and chains workflows automatically.",
    icon: Cog,
    isFree: true,
    gradient: "from-yellow-500 via-amber-500 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.12)",
    clmGoals: ["Expand domain coverage", "Improve chain completion rate", "Reduce routing errors"],
    powers: [
      { name: "Cross-Domain Task Routing", source: "NEXUS Engine", description: "Classifies incoming tasks by domain and routes to the optimal reasoning path — no manual mode-switching.", icon: Route },
      { name: "Cognitive Load Balancing", source: "CORTEX Engine", description: "Distributes multi-task workloads across reasoning threads to prevent quality degradation under pressure.", icon: Gauge },
      { name: "Auto-Chaining Workflows", source: "AUTOMATON Engine", description: "Detects multi-step tasks and chains sub-operations automatically — research → analyze → draft in one prompt.", icon: Workflow },
    ],
  },

  // 5. EDUCATOR MIND (Mentor)
  {
    id: "educator",
    name: "EDUCATOR Mind",
    subtitle: "PRISM · ORACLE · CORTEX",
    description: "Adaptive teaching intelligence with knowledge graph-backed curriculum, predictive learner modeling, and Socratic reasoning loops.",
    icon: GraduationCap,
    isFree: true,
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    glowColor: "rgba(59, 130, 246, 0.12)",
    clmGoals: ["Improve learner outcome scores", "Refine difficulty calibration", "Expand subject coverage"],
    powers: [
      { name: "Knowledge Scaffolding Graph", source: "PRISM Engine", description: "Builds a dependency graph of concepts. Identifies prerequisite gaps and teaches in the optimal learning sequence.", icon: Database },
      { name: "Predictive Learner Modeling", source: "ORACLE Engine", description: "Forecasts learner struggle points before they happen and adjusts difficulty, pacing, and examples preemptively.", icon: TrendingUp },
      { name: "Socratic Reasoning Loops", source: "CORTEX Engine", description: "Multi-turn cognitive orchestration that guides learners to answers through questions, not lectures.", icon: Brain },
    ],
  },

  // 6. SALES MIND (Closer)
  {
    id: "sales",
    name: "SALES Mind",
    subtitle: "ORACLE · BEACON · PRISM",
    description: "Deal intelligence powered by predictive scoring, real-time pipeline observability, and competitive knowledge graphs.",
    icon: Briefcase,
    isFree: false,
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.12)",
    clmGoals: ["Improve deal-close prediction", "Expand competitive intelligence", "Reduce pipeline stall rate"],
    powers: [
      { name: "Predictive Deal Scoring", source: "ORACLE Engine", description: "Forecasts close probability using pattern recognition across historical wins, losses, and pipeline velocity.", icon: Trophy },
      { name: "Pipeline Observability", source: "BEACON Engine", description: "Real-time dashboards for every deal stage — stall detection, velocity tracking, and automated health alerts.", icon: BarChart3 },
      { name: "Competitive Battle Graph", source: "PRISM Engine", description: "Knowledge graph of competitor positioning, pricing, and win/loss patterns — battle cards that update themselves.", icon: Handshake },
    ],
  },

  // 7. RESEARCH MIND (Investigator)
  {
    id: "research",
    name: "RESEARCH Mind",
    subtitle: "PRISM · CONDUCTOR · ORACLE",
    description: "Deep research with entity extraction, source credibility scoring, and automated synthesis pipelines that produce executive-ready intelligence.",
    icon: Search,
    isFree: false,
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    glowColor: "rgba(6, 182, 212, 0.12)",
    clmGoals: ["Improve source credibility scoring", "Expand entity extraction accuracy", "Reduce synthesis latency"],
    powers: [
      { name: "Entity Extraction & RAG", source: "PRISM Engine", description: "Automatically extracts entities, claims, and citations from sources — builds a knowledge graph as it researches.", icon: Database },
      { name: "Source Pipeline Orchestration", source: "CONDUCTOR Engine", description: "Parallelizes multi-source research with backpressure-aware processing and automatic deduplication.", icon: GitBranch },
      { name: "Credibility Forecasting", source: "ORACLE Engine", description: "Scores source reliability using pattern recognition and flags contradictions across the corpus before you read.", icon: Target },
    ],
  },

  // 8. CODING MIND (Engineer) — ELITE
  {
    id: "coding",
    name: "CODING Mind",
    subtitle: "FORGE · PHANTOM · BEACON · SENTINEL · CONDUCTOR",
    description: "Elite code generation with AST-level transformations, self-healing execution, real-time quality observability, security-hardened output, and pipeline orchestration across multi-file projects.",
    icon: Code,
    isFree: false,
    isElite: true,
    priceCents: 15900,
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    glowColor: "rgba(34, 197, 94, 0.12)",
    clmGoals: ["Reduce bug rate per KLOC", "Expand language coverage", "Improve test generation quality", "Learn new framework patterns", "Optimize build pipeline speed"],
    powers: [
      { name: "AST-Level Code Forge", source: "FORGE Engine", description: "Type-safe multi-file generation with dependency graph analysis, dead code elimination, and rollback-safe execution.", icon: Code },
      { name: "Self-Healing Execution", source: "PHANTOM Engine", description: "Runs generated code in a sandboxed environment, auto-detects failures, and applies corrective patches before delivery.", icon: Bug },
      { name: "Quality Observability", source: "BEACON Engine", description: "Real-time metrics on code complexity, test coverage gaps, and style drift — catches regressions as they're written.", icon: CheckCircle },
      { name: "Security-Hardened Output", source: "SENTINEL Engine", description: "Every generated artifact is scanned for injection vectors, dependency vulnerabilities, and secret leaks before commit.", icon: ShieldCheck },
      { name: "CI/CD Pipeline Orchestration", source: "CONDUCTOR Engine", description: "Auto-generates build, test, and deploy pipelines with parallelized stages, rollback gates, and environment promotion.", icon: Workflow },
    ],
  },

  // 9. ANALYST MIND (Strategist) — ELITE
  {
    id: "analyst",
    name: "ANALYST Mind",
    subtitle: "ORACLE · PRISM · CONDUCTOR · CATALYST · ARBITER",
    description: "Elite analytical intelligence with anomaly detection, competitive mapping, automated insight pipelines, event-driven alerting, and decision-gate enforcement.",
    icon: BarChart3,
    isFree: false,
    isElite: true,
    priceCents: 15900,
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    glowColor: "rgba(168, 85, 247, 0.12)",
    clmGoals: ["Improve anomaly detection precision", "Reduce insight latency", "Expand signal source coverage", "Improve decision-gate accuracy", "Learn new statistical methods"],
    powers: [
      { name: "Anomaly Detection Engine", source: "ORACLE Engine", description: "Pattern recognition across time-series data that surfaces statistical anomalies with confidence intervals and root cause hints.", icon: TrendingUp },
      { name: "Competitive Knowledge Map", source: "PRISM Engine", description: "Builds and traverses a knowledge graph of market entities, relationships, and trends for grounded competitive analysis.", icon: Compass },
      { name: "Insight Pipeline Automation", source: "CONDUCTOR Engine", description: "ETL-style data processing that transforms raw signals into structured decision memos with impact/effort scoring.", icon: GitBranch },
      { name: "Event-Driven Signal Alerts", source: "CATALYST Engine", description: "Pub/sub event triggers that fire real-time notifications when KPIs cross thresholds, trends reverse, or outliers emerge.", icon: Sparkles },
      { name: "Decision Gate Enforcement", source: "ARBITER Engine", description: "Automated go/no-go checkpoints that validate data quality, confidence levels, and stakeholder sign-off before insights ship.", icon: Scale },
    ],
  },

  // 10. OPS MIND (Operator)
  {
    id: "ops",
    name: "OPS Mind",
    subtitle: "GENESIS · AUTOMATON · BEACON",
    description: "Operations intelligence with autonomous triage, workflow automation, and unified monitoring for SOPs, escalations, and scheduling.",
    icon: Settings,
    isFree: false,
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    glowColor: "rgba(249, 115, 22, 0.12)",
    clmGoals: ["Reduce escalation response time", "Improve SOP coverage", "Expand workflow automation patterns"],
    powers: [
      { name: "Autonomous Escalation Triage", source: "GENESIS Engine", description: "Classifies operational incidents by severity and auto-routes to the right escalation playbook — P0 to P4.", icon: AlertTriangle },
      { name: "SOP Workflow Engine", source: "AUTOMATON Engine", description: "Converts standard operating procedures into executable workflows with conditional branching and retry logic.", icon: ClipboardList },
      { name: "Ops Health Monitoring", source: "BEACON Engine", description: "Unified observability across all operational processes — SLA tracking, vendor scoring, and capacity alerts.", icon: Radio },
    ],
  },

  // 11. WRITER MIND (Scribe)
  {
    id: "writer",
    name: "WRITER Mind",
    subtitle: "PRISM · CIPHER · CORTEX",
    description: "Longform generation with persona-locked voice, citation-aware knowledge retrieval, and multi-agent editorial coordination.",
    icon: Pen,
    isFree: true,
    gradient: "from-pink-500 via-rose-500 to-red-400",
    glowColor: "rgba(236, 72, 153, 0.12)",
    clmGoals: ["Improve voice consistency score", "Reduce citation errors", "Expand genre coverage"],
    powers: [
      { name: "Citation-Aware RAG", source: "PRISM Engine", description: "Every claim is grounded in retrievable sources. Auto-generates footnotes, bibliographies, and source attribution.", icon: Quote },
      { name: "Persona Memory Vault", source: "CIPHER Engine", description: "Locks tone, voice, and stylistic preferences across sessions. Brand voice never drifts, even across thousands of words.", icon: Clock },
      { name: "Editorial Orchestration", source: "CORTEX Engine", description: "Multi-pass cognitive loops: outline → draft → critique → refine. Each pass uses a different reasoning lens.", icon: Brain },
    ],
  },

  // 12. LEGAL MIND (Counsel)
  {
    id: "legal",
    name: "LEGAL Mind",
    subtitle: "PRISM · AEGIS · SENTINEL",
    description: "Contract intelligence with clause-level knowledge graphs, policy-as-code compliance, and adversarial clause detection.",
    icon: Gavel,
    isFree: false,
    gradient: "from-slate-500 via-gray-500 to-zinc-500",
    glowColor: "rgba(100, 116, 139, 0.12)",
    clmGoals: ["Expand jurisdictional coverage", "Improve clause risk scoring", "Reduce compliance false positives"],
    powers: [
      { name: "Clause Knowledge Graph", source: "PRISM Engine", description: "Extracts and maps contractual entities, obligations, and dependencies — surfaces conflicts across multi-document sets.", icon: Database },
      { name: "Compliance Policy Engine", source: "AEGIS Engine", description: "Policy-as-code enforcement for GDPR, SOC2, HIPAA. Auto-flags non-compliant clauses with remediation suggestions.", icon: FileCheck },
      { name: "Adversarial Clause Detection", source: "SENTINEL Engine", description: "Scans for hidden liabilities, one-sided indemnities, and unusual termination clauses using threat-modeling heuristics.", icon: Scan },
    ],
  },

  // 13. RECRUITER MIND (Talent Scout)
  {
    id: "recruiter",
    name: "RECRUITER Mind",
    subtitle: "ORACLE · PRISM · CORTEX",
    description: "Talent acquisition with predictive candidate scoring, skills-gap knowledge mapping, and multi-agent interview coordination.",
    icon: Users,
    isFree: false,
    gradient: "from-teal-500 via-cyan-500 to-sky-500",
    glowColor: "rgba(20, 184, 166, 0.12)",
    clmGoals: ["Improve candidate-fit prediction", "Expand skills taxonomy", "Reduce time-to-hire"],
    powers: [
      { name: "Predictive Candidate Scoring", source: "ORACLE Engine", description: "Forecasts candidate-role fit using pattern recognition across historical hiring outcomes and competency signals.", icon: Star },
      { name: "Skills-Gap Knowledge Map", source: "PRISM Engine", description: "Builds a graph of required vs. available competencies, surfacing exact gaps and suggesting targeted interview questions.", icon: Database },
      { name: "Interview Orchestration", source: "CORTEX Engine", description: "Coordinates multi-round interview workflows with cognitive load balancing across panel members and feedback synthesis.", icon: Brain },
    ],
  },

  // 14. SUPPORT MIND (Resolver)
  {
    id: "support",
    name: "SUPPORT Mind",
    subtitle: "GENESIS · CIPHER · MIRAGE",
    description: "Support intelligence with autonomous ticket triage, resolution pattern memory, and intelligent escalation routing across agent fleets.",
    icon: Headphones,
    isFree: false,
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
    glowColor: "rgba(14, 165, 233, 0.12)",
    clmGoals: ["Improve first-contact resolution rate", "Expand resolution pattern library", "Reduce escalation rate"],
    powers: [
      { name: "Autonomous Ticket Triage", source: "GENESIS Engine", description: "Classifies, prioritizes, and routes tickets in real time. Severity scoring with auto-assignment to the right resolver.", icon: MessageSquare },
      { name: "Resolution Pattern Memory", source: "CIPHER Engine", description: "Remembers every past resolution. Similar tickets get instant suggested fixes — first-contact resolution rate climbs continuously.", icon: RotateCcw },
      { name: "Fleet Escalation Router", source: "MIRAGE Engine", description: "Routes complex tickets to the support agent with highest affinity for that specific issue type across the entire fleet.", icon: Network },
    ],
  },

  // 15. DATA ENGINEER MIND (Architect)
  {
    id: "data-engineer",
    name: "DATA ENGINEER Mind",
    subtitle: "CONDUCTOR · PHANTOM · BEACON",
    description: "Data pipeline intelligence with ETL orchestration, self-healing data flows, and end-to-end lineage observability.",
    icon: HardDrive,
    isFree: false,
    gradient: "from-indigo-500 via-blue-500 to-violet-500",
    glowColor: "rgba(99, 102, 241, 0.12)",
    clmGoals: ["Reduce pipeline failure rate", "Expand connector coverage", "Improve schema drift handling"],
    powers: [
      { name: "ETL Pipeline Orchestration", source: "CONDUCTOR Engine", description: "Designs, schedules, and manages ETL jobs with schema evolution handling, backpressure awareness, and dead letter queues.", icon: Workflow },
      { name: "Self-Healing Data Flows", source: "PHANTOM Engine", description: "Auto-detects pipeline failures and applies corrective measures — schema drift, null handling, retry with backoff.", icon: RotateCcw },
      { name: "Lineage Observability", source: "BEACON Engine", description: "End-to-end data lineage tracking from source to dashboard. Traces every transformation, validates every output.", icon: Radio },
    ],
  },

  // 16. MARKETING MIND (Campaigner)
  {
    id: "marketing",
    name: "MARKETING Mind",
    subtitle: "ORACLE · CATALYST · PRISM",
    description: "Campaign intelligence with A/B test prediction, event-driven audience triggers, and competitive positioning knowledge graphs.",
    icon: Megaphone,
    isFree: false,
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    glowColor: "rgba(244, 63, 94, 0.12)",
    clmGoals: ["Improve A/B prediction accuracy", "Expand audience segmentation models", "Reduce campaign launch time"],
    powers: [
      { name: "A/B Test Prediction Engine", source: "ORACLE Engine", description: "Forecasts test outcomes before launch using historical performance patterns. Kills losing variants early, scales winners fast.", icon: Split },
      { name: "Event-Driven Audience Triggers", source: "CATALYST Engine", description: "Pub/sub event architecture that triggers personalized campaigns based on real-time user behavior signals.", icon: Sparkles },
      { name: "Competitive Position Graph", source: "PRISM Engine", description: "Maps competitor messaging, positioning, and share-of-voice into a traversable knowledge graph for battle-ready campaigns.", icon: Compass },
    ],
  },

  // 17. PRODUCT MIND (Builder)
  {
    id: "product",
    name: "PRODUCT Mind",
    subtitle: "CORTEX · ORACLE · FORGE",
    description: "Product intelligence with multi-agent feature scoping, predictive roadmap prioritization, and automated spec generation.",
    icon: Layers,
    isFree: false,
    gradient: "from-violet-500 via-purple-500 to-indigo-500",
    glowColor: "rgba(139, 92, 246, 0.12)",
    clmGoals: ["Improve roadmap prediction accuracy", "Expand PRD quality score", "Reduce spec-to-code gap"],
    powers: [
      { name: "Multi-Agent Feature Scoping", source: "CORTEX Engine", description: "Orchestrates engineering, design, and business perspectives simultaneously to produce balanced PRDs.", icon: Brain },
      { name: "Predictive Roadmap Scoring", source: "ORACLE Engine", description: "RICE/ICE scoring enhanced with predictive impact modeling — prioritize based on forecasted outcomes, not gut feel.", icon: TrendingUp },
      { name: "Spec-to-Code Bridge", source: "FORGE Engine", description: "Generates implementation scaffolds directly from product specs — acceptance criteria become executable test stubs.", icon: Code },
    ],
  },

  // 18. SECURITY MIND (Sentinel) — ELITE
  {
    id: "security",
    name: "SECURITY Mind",
    subtitle: "SENTINEL · GENESIS · AEGIS · PHANTOM · CIPHER",
    description: "Elite security intelligence with STRIDE threat modeling, autonomous vulnerability triage, zero-trust enforcement, penetration simulation, and encrypted evidence vaults.",
    icon: ShieldCheck,
    isFree: false,
    isElite: true,
    priceCents: 15900,
    gradient: "from-red-600 via-red-500 to-rose-500",
    glowColor: "rgba(220, 38, 38, 0.12)",
    clmGoals: ["Expand CVE pattern library", "Improve zero-day detection", "Reduce false positive rate", "Learn new penetration vectors", "Strengthen evidence chain integrity"],
    powers: [
      { name: "Predictive Threat Modeling", source: "SENTINEL Engine", description: "STRIDE-based analysis with attack surface mapping that predicts exploit vectors before they're discovered in the wild.", icon: Scan },
      { name: "Vulnerability Auto-Triage", source: "GENESIS Engine", description: "CVSS scoring with autonomous severity classification. Critical vulns trigger immediate remediation playbooks.", icon: Activity },
      { name: "Zero-Trust Policy Fabric", source: "AEGIS Engine", description: "Policy-as-code enforcement across all access boundaries. Automatic credential rotation and session attestation.", icon: KeyRound },
      { name: "Penetration Simulation", source: "PHANTOM Engine", description: "Autonomous red-team simulations that probe your attack surface with real-world exploit chains and report exploitable paths.", icon: Bug },
      { name: "Encrypted Evidence Vault", source: "CIPHER Engine", description: "Tamper-proof audit trail with cryptographic chain-of-custody for every security event, investigation, and remediation.", icon: Lock },
    ],
  },

  // 19. FINANCE MIND (Controller)
  {
    id: "finance",
    name: "FINANCE Mind",
    subtitle: "ORACLE · BEACON · ARBITER",
    description: "Financial intelligence with multi-scenario forecasting, real-time KPI observability, and budget gate enforcement.",
    icon: Landmark,
    isFree: false,
    gradient: "from-emerald-600 via-green-500 to-teal-500",
    glowColor: "rgba(5, 150, 105, 0.12)",
    clmGoals: ["Improve forecast accuracy", "Expand financial model coverage", "Reduce budget variance"],
    powers: [
      { name: "Multi-Scenario Forecasting", source: "ORACLE Engine", description: "Generates P&L, cash flow, and revenue forecasts across bull/base/bear scenarios with confidence intervals.", icon: PieChart },
      { name: "KPI Observability Dashboard", source: "BEACON Engine", description: "Real-time financial health monitoring — burn rate, unit economics, runway — with threshold alerts and SLA tracking.", icon: BarChart3 },
      { name: "Budget Gate Enforcement", source: "ARBITER Engine", description: "API-gateway-style budget controls that enforce spending limits per department, vendor, and initiative automatically.", icon: Calculator },
    ],
  },

  // 20. DESIGNER MIND (Craftsman)
  {
    id: "designer",
    name: "DESIGNER Mind",
    subtitle: "FORGE · PRISM · BEACON",
    description: "Design intelligence with component generation, design system knowledge graphs, and automated WCAG accessibility auditing.",
    icon: Palette,
    isFree: false,
    gradient: "from-fuchsia-500 via-pink-500 to-rose-500",
    glowColor: "rgba(217, 70, 239, 0.12)",
    clmGoals: ["Expand component pattern library", "Improve accessibility audit accuracy", "Learn new design systems"],
    powers: [
      { name: "Component Forge", source: "FORGE Engine", description: "Generates production-ready UI components from design specs — tokens, variants, and accessibility baked in from the start.", icon: Component },
      { name: "Design System Knowledge Graph", source: "PRISM Engine", description: "Maps relationships between tokens, components, and patterns. Detects inconsistencies and suggests harmonization.", icon: Database },
      { name: "WCAG Accessibility Auditor", source: "BEACON Engine", description: "Automated accessibility scanning against WCAG 2.1 AA/AAA with remediation suggestions and compliance reporting.", icon: Accessibility },
    ],
  },
];

// Total count for display
export const TOTAL_AGENT_COUNT = AGENTS_WITH_POWERS.length;

// ============================================================================
// UNIVERSAL: 4-TIER PORTABLE MEMORY SYSTEM (AUTO-TIERING)
// ============================================================================

export interface MemoryTier {
  name: string;
  label: string;
  description: string;
  latency: string;
  retention: string;
}

export const FOUR_TIER_MEMORY: MemoryTier[] = [
  {
    name: "HOT",
    label: "Session Cache",
    description: "In-context working memory for the current task. Sub-millisecond recall of active conversation, variables, and reasoning state.",
    latency: "<1ms",
    retention: "Session",
  },
  {
    name: "WARM",
    label: "Knowledge Crystals",
    description: "Compressed heuristics and learned patterns persisted across sessions. Deterministic 384-dim hash embeddings for instant semantic similarity — zero API cost.",
    latency: "<5ms",
    retention: "Persistent",
  },
  {
    name: "COOL",
    label: "Episodic Vault",
    description: "Tamper-proof, content-hash-sealed records of past interactions, decisions, and outcomes. Write-ahead logging ensures crash recovery. SM-2 spaced repetition keeps important memories fresh.",
    latency: "<50ms",
    retention: "Persistent",
  },
  {
    name: "COLD",
    label: "Archive Ledger",
    description: "Long-term compressed storage for historical context, audit trails, and dormant knowledge. Retrievable on demand with automatic promotion to warmer tiers when accessed.",
    latency: "<200ms",
    retention: "Permanent",
  },
];

export const MEMORY_SYSTEM_SUMMARY = {
  name: "4-Tier Auto-Tiering Memory System",
  tagline: "Every agent remembers. Every session builds on the last. Zero maintenance.",
  description:
    "All 20 agents ship with a portable, zero-dependency memory system that auto-tiers knowledge across HOT, WARM, COOL, and COLD — with zero user maintenance. Promotion, demotion, compression, and archival happen autonomously via the RIPPLE Orchestrator. No external APIs required. Drop it into any stack.",
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
