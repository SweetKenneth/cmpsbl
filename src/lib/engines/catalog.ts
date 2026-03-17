/**
 * COMPOSABLE ENGINES Catalog
 * Black-boxed Sealed Runtime software — first-class CMPSBL IP.
 * Tiered pricing: APEX $599 | ELITE $399 | CORE $199 | Free $0
 * Bundle discount: 40% off when bundled with an agent.
 * ARCHITECT uses annual subscription at $999/yr.
 */

import {
  Shield, Ghost, Brain, Eye, Zap, GitBranch, Scale,
  Cog, Sparkles, Radio, Castle, Lock, Globe, Cpu,
  Diamond, Hammer, Network, Fingerprint, Waypoints, FlaskConical,
  Flame, Swords, Skull, BookOpen, ShieldAlert, Landmark, Bird, Router, Clock, Bot,
  Atom, Battery, ShieldHalf, Cable, FlaskRound, IterationCw, Merge, Database, Heart, Blocks,
  Crown, Layers, Orbit, Gem,
} from "lucide-react";

export interface Engine {
  slug: string;
  codename: string;
  tagline: string;
  priceStandalone: number;
  priceBundled: number;
  priceDisplay: string;
  bundleDisplay: string;
  priceId: string;
  icon: React.ElementType;
  color: string;
  tier: "APEX" | "ELITE" | "CORE" | "META";
  edition: string;
  briefing: string;
  capabilities: string[];
  threatLevel: string;
  clearance: string;
  isSubscription?: boolean;
  subscriptionLabel?: string;
  externalPath?: string;
  /** True if engine is free (no checkout required) */
  isFree?: boolean;
  /** True if engine should be featured prominently */
  isFeatured?: boolean;
  /** True if engine is free for subscribers (Creator+ tier) */
  freeForSubscribers?: boolean;
  /** Extended description for the detail page */
  longDescription?: string;
}

export const ENGINES: Engine[] = [
  {
    slug: "architect", codename: "ARCHITECT", tagline: "The Unified Mega-Engine",
    priceStandalone: 99900, priceBundled: 99900, priceDisplay: "$999/yr", bundleDisplay: "$999/yr",
    priceId: "price_1T6KAuQ7FtTiAL4aA6ziEyyh", icon: Cpu, color: "210 100% 60%", tier: "APEX",
    edition: "Edition APEX — Unlimited",
    briefing: "ARCHITECT orchestrates all 8 core pipelines into a single sealed runtime. Parse, Route, Execute, Heal, Defend, Learn, Observe, Audit — in one import.",
    capabilities: ["Unified 8-stage cognitive pipeline", "Self-healing with automatic recovery", "Built-in security and anomaly defense", "Real-time observability and audit trail", "Intelligent multi-path routing", "Continuous learning from every execution"],
    threatLevel: "CLASSIFIED — APEX TIER", clearance: "LEVEL 10 — UNRESTRICTED",
    isSubscription: true, subscriptionLabel: "Annual License", externalPath: "/cmpsbl-engine",
  },
  {
    slug: "sentinel", codename: "SENTINEL", tagline: "AI Security Operations",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T6OBJQ7FtTiAL4ar4khmX2R", icon: Shield, color: "0 80% 55%", tier: "APEX",
    edition: "Edition 001 of ∞",
    briefing: "SENTINEL hunts threats before they arrive. Behavioral analysis, IP reputation scoring, prompt injection shielding, and automated incident response — zero configuration.",
    capabilities: ["Behavioral anomaly detection", "Automated incident response", "IP reputation scoring", "Prompt injection shielding", "Real-time threat intelligence", "Zero-config security hardening"],
    threatLevel: "CRITICAL — ACTIVE DEFENSE", clearance: "LEVEL 9 — TOP SECRET",
  },
  {
    slug: "phantom", codename: "PHANTOM", tagline: "Self-Healing Service Mesh",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T6OBJQ7FtTiAL4ar4khmX2R", icon: Ghost, color: "280 70% 55%", tier: "APEX",
    edition: "Edition 001 of ∞",
    briefing: "PHANTOM makes downtime impossible. Auto-recovery, circuit breaking, and intelligent failover keep your services alive even when individual nodes fail.",
    capabilities: ["Automatic service recovery", "Circuit breaker orchestration", "Zero-downtime deployments", "Intelligent failover routing", "Health-based load shedding", "Chaos resilience built-in"],
    threatLevel: "HIGH — RESILIENCE OPS", clearance: "LEVEL 8 — CLASSIFIED",
  },
  {
    slug: "nexus", codename: "NEXUS", tagline: "Multi-Model AI Router",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T6OBJQ7FtTiAL4ar4khmX2R", icon: Network, color: "160 75% 45%", tier: "APEX",
    edition: "Edition 001 of ∞",
    briefing: "NEXUS routes every AI call to the optimal model in real time. Cost-aware selection, latency-based failover, response quality scoring, and automatic provider rotation — best answer at the best price.",
    capabilities: ["Real-time model selection & routing", "Cost-aware provider optimization", "Latency-based automatic failover", "Response quality scoring & feedback", "Token budget management", "Multi-provider load balancing"],
    threatLevel: "CRITICAL — ROUTING OPS", clearance: "LEVEL 9 — TOP SECRET",
  },
  {
    slug: "prism", codename: "PRISM", tagline: "Knowledge Graph & RAG Pipeline",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T6OBJQ7FtTiAL4ar4khmX2R", icon: Diamond, color: "270 85% 60%", tier: "APEX",
    edition: "Edition 001 of ∞",
    briefing: "PRISM turns unstructured chaos into structured knowledge. Automatic entity extraction, relationship mapping, and retrieval-augmented generation for grounded, hallucination-resistant answers.",
    capabilities: ["Automatic entity & relationship extraction", "Vector-powered semantic search", "RAG pipeline with source attribution", "Knowledge graph construction & traversal", "Contradiction detection across sources", "Dynamic context window optimization"],
    threatLevel: "HIGH — KNOWLEDGE OPS", clearance: "LEVEL 8 — CLASSIFIED",
  },
  {
    slug: "cortex", codename: "CORTEX", tagline: "Agent Runtime & Orchestration",
    priceStandalone: 39900, priceBundled: 23900, priceDisplay: "$399", bundleDisplay: "$239",
    priceId: "price_1T6OBKQ7FtTiAL4aZpSs8MYy", icon: Brain, color: "310 70% 55%", tier: "ELITE",
    edition: "Edition 001 of ∞",
    briefing: "CORTEX gives your AI agents a brain. Multi-agent orchestration, task delegation, memory coordination, and cognitive load balancing — agents think together instead of stepping on each other.",
    capabilities: ["Multi-agent task delegation", "Cognitive load balancing", "Shared memory coordination", "Agent competency tracking", "Automatic skill routing", "Collaborative reasoning"],
    threatLevel: "ELEVATED — COGNITIVE OPS", clearance: "LEVEL 7 — RESTRICTED",
  },
  {
    slug: "forge", codename: "FORGE", tagline: "Code Generation & Refactoring",
    priceStandalone: 39900, priceBundled: 23900, priceDisplay: "$399", bundleDisplay: "$239",
    priceId: "price_1T6OBKQ7FtTiAL4aZpSs8MYy", icon: Hammer, color: "25 95% 55%", tier: "ELITE",
    edition: "Edition 001 of ∞",
    briefing: "FORGE writes code that ships. Multi-file generation, intelligent refactoring, type-safe transformations, and automated test scaffolding — all inside a sandboxed execution environment with rollback.",
    capabilities: ["Multi-file code generation", "Type-safe AST transformations", "Automated test scaffolding", "Dead code elimination", "Dependency graph analysis", "Sandboxed execution with rollback"],
    threatLevel: "ELEVATED — CODE OPS", clearance: "LEVEL 7 — RESTRICTED",
  },
  {
    slug: "oracle", codename: "ORACLE", tagline: "Real-Time Analytics & Prediction",
    priceStandalone: 39900, priceBundled: 23900, priceDisplay: "$399", bundleDisplay: "$239",
    priceId: "price_1T6OBKQ7FtTiAL4aZpSs8MYy", icon: Eye, color: "45 90% 50%", tier: "ELITE",
    edition: "Edition 001 of ∞",
    briefing: "ORACLE sees what's coming. Predictive modeling, anomaly detection, and live data intelligence that turns raw signals into actionable foresight. Know before it happens.",
    capabilities: ["Predictive trend modeling", "Real-time anomaly detection", "Live data stream processing", "Automated insight generation", "Pattern recognition at scale", "Forecasting with confidence intervals"],
    threatLevel: "MODERATE — INTELLIGENCE", clearance: "LEVEL 7 — RESTRICTED",
  },
  {
    slug: "vanguard", codename: "VANGUARD", tagline: "Edge Computing & CDN",
    priceStandalone: 39900, priceBundled: 23900, priceDisplay: "$399", bundleDisplay: "$239",
    priceId: "price_1T6OBKQ7FtTiAL4aZpSs8MYy", icon: Zap, color: "185 80% 45%", tier: "ELITE",
    edition: "Edition 001 of ∞",
    briefing: "VANGUARD pushes compute to the edge. Distributed execution, intelligent caching, and sub-millisecond processing at the point of request.",
    capabilities: ["Distributed edge execution", "Intelligent edge caching", "Sub-millisecond processing", "Global request distribution", "Edge-native compute functions", "Automatic geo-routing"],
    threatLevel: "MODERATE — EDGE OPS", clearance: "LEVEL 6 — CONFIDENTIAL",
  },
  {
    slug: "conductor", codename: "CONDUCTOR", tagline: "Data Pipeline Orchestration",
    priceStandalone: 39900, priceBundled: 23900, priceDisplay: "$399", bundleDisplay: "$239",
    priceId: "price_1T6OBKQ7FtTiAL4aZpSs8MYy", icon: GitBranch, color: "145 65% 42%", tier: "ELITE",
    edition: "Edition 001 of ∞",
    briefing: "CONDUCTOR moves data like water. ETL automation, stream processing, and data lineage tracking ensure every byte flows where it needs to go — reliably, traceably, automatically.",
    capabilities: ["Automated ETL pipelines", "Real-time stream processing", "Data lineage tracking", "Schema evolution handling", "Dead letter queue management", "Backpressure-aware processing"],
    threatLevel: "LOW — DATA OPS", clearance: "LEVEL 6 — CONFIDENTIAL",
  },
  {
    slug: "arbiter", codename: "ARBITER", tagline: "API Gateway & Traffic Control",
    priceStandalone: 39900, priceBundled: 23900, priceDisplay: "$399", bundleDisplay: "$239",
    priceId: "price_1T6OBKQ7FtTiAL4aZpSs8MYy", icon: Scale, color: "210 60% 45%", tier: "ELITE",
    edition: "Edition 001 of ∞",
    briefing: "ARBITER controls the gates. Intelligent request routing, rate limiting, API versioning, and traffic shaping — APIs serve exactly who they should, exactly how fast they should.",
    capabilities: ["Intelligent request routing", "Per-endpoint rate limiting", "API versioning & deprecation", "Traffic shaping & throttling", "Request/response transformation", "Authentication gateway"],
    threatLevel: "MODERATE — ACCESS CONTROL", clearance: "LEVEL 6 — CONFIDENTIAL",
  },
  {
    slug: "automaton", codename: "AUTOMATON", tagline: "Workflow Automation Engine",
    priceStandalone: 19900, priceBundled: 11900, priceDisplay: "$199", bundleDisplay: "$119",
    priceId: "price_1T6MgjQ7FtTiAL4aO0YcTEEh", icon: Cog, color: "38 90% 50%", tier: "CORE",
    edition: "Edition 001 of ∞",
    briefing: "AUTOMATON turns repetition into reliability. Conditional workflows, scheduled execution, and event-driven automation that handles the boring stuff so your team handles the brilliant stuff.",
    capabilities: ["Visual workflow composition", "Conditional branching logic", "Scheduled task execution", "Event-driven triggers", "Retry & error handling", "Parallel execution paths"],
    threatLevel: "LOW — AUTOMATION", clearance: "LEVEL 5 — STANDARD",
  },
  {
    slug: "catalyst", codename: "CATALYST", tagline: "Event-Driven Architecture",
    priceStandalone: 19900, priceBundled: 11900, priceDisplay: "$199", bundleDisplay: "$119",
    priceId: "price_1T6MgkQ7FtTiAL4a80YXxyvP", icon: Sparkles, color: "310 100% 50%", tier: "CORE",
    edition: "Edition 001 of ∞",
    briefing: "CATALYST makes everything reactive. Pub/sub messaging, event sourcing, and CQRS patterns that decouple your services and let them evolve independently.",
    capabilities: ["Pub/sub event messaging", "Event sourcing & replay", "CQRS pattern support", "Service decoupling", "Dead letter handling", "Event schema registry"],
    threatLevel: "LOW — EVENT OPS", clearance: "LEVEL 5 — STANDARD",
  },
  {
    slug: "beacon", codename: "BEACON", tagline: "Observability & Monitoring Stack",
    priceStandalone: 0, priceBundled: 0, priceDisplay: "FREE", bundleDisplay: "FREE",
    priceId: "price_1T6MgmQ7FtTiAL4alod5LfHD", icon: Radio, color: "145 80% 40%", tier: "CORE",
    edition: "Edition 001 of ∞ — Free",
    isFree: true,
    briefing: "BEACON illuminates everything. Metrics, distributed tracing, structured logging, and health monitoring unified into a single pane of glass.",
    capabilities: ["Unified metrics collection", "Distributed request tracing", "Structured log aggregation", "Real-time health dashboards", "Alert & threshold management", "SLA tracking & reporting"],
    threatLevel: "LOW — OBSERVABILITY", clearance: "LEVEL 5 — STANDARD",
  },
  {
    slug: "bastion", codename: "BASTION", tagline: "Intelligent Load Balancing",
    priceStandalone: 0, priceBundled: 0, priceDisplay: "FREE", bundleDisplay: "FREE",
    priceId: "price_1T6MgnQ7FtTiAL4awLLlqw6v", icon: Castle, color: "200 50% 40%", tier: "CORE",
    edition: "Edition 001 of ∞ — Free",
    isFree: true,
    briefing: "BASTION distributes load like a strategist. Health-aware routing, weighted distribution, and automatic failover that keeps your services responsive under any traffic pattern.",
    capabilities: ["Health-aware traffic routing", "Weighted load distribution", "Automatic failover", "Session affinity support", "Connection pooling", "Capacity-based scaling triggers"],
    threatLevel: "LOW — INFRASTRUCTURE", clearance: "LEVEL 5 — STANDARD",
  },
  {
    slug: "cipher", codename: "CIPHER", tagline: "Distributed Cache System",
    priceStandalone: 0, priceBundled: 0, priceDisplay: "FREE", bundleDisplay: "FREE",
    priceId: "price_1T6MgoQ7FtTiAL4a6gr1sH7E", icon: Lock, color: "280 100% 55%", tier: "CORE",
    edition: "Edition 001 of ∞ — Free",
    isFree: true,
    briefing: "CIPHER remembers so your servers don't have to. Distributed caching with intelligent invalidation, cache coherency, and tiered storage that makes every read instant.",
    capabilities: ["Distributed in-memory caching", "Intelligent cache invalidation", "Cache coherency protocols", "Tiered storage (hot/warm/cold)", "TTL & eviction policies", "Cache-aside pattern support"],
    threatLevel: "LOW — PERFORMANCE", clearance: "LEVEL 4 — OPEN",
  },
  {
    slug: "meridian", codename: "MERIDIAN", tagline: "Content Delivery Network",
    priceStandalone: 19900, priceBundled: 11900, priceDisplay: "$199", bundleDisplay: "$119",
    priceId: "price_1T6MgpQ7FtTiAL4a1Yr5YhrH", icon: Globe, color: "185 100% 40%", tier: "CORE",
    edition: "Edition 001 of ∞",
    briefing: "MERIDIAN delivers content at the speed of proximity. Global edge distribution, asset optimization, and intelligent routing that puts your content milliseconds from every user.",
    capabilities: ["Global edge distribution", "Automatic asset optimization", "Intelligent geo-routing", "Cache warming & prefetch", "Origin shield protection", "Real-time purge & invalidation"],
    threatLevel: "LOW — DELIVERY", clearance: "LEVEL 4 — OPEN",
  },
  {
    slug: "genesis", codename: "GENESIS", tagline: "Autonomous Triage & Recovery",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T6OBJQ7FtTiAL4ar4khmX2R", icon: FlaskConical, color: "340 80% 55%", tier: "APEX",
    edition: "Edition 001 of ∞",
    briefing: "GENESIS is the Crown Jewel of autonomous triage. It intercepts failures before they cascade, classifies severity in real time, assigns remediation strategies, and executes recovery — all without human intervention.",
    capabilities: ["Real-time failure classification", "Autonomous severity scoring", "Cascading failure prevention", "Self-executing remediation playbooks", "Post-incident learning loops", "Cross-service impact analysis"],
    threatLevel: "CRITICAL — TRIAGE OPS", clearance: "LEVEL 9 — TOP SECRET",
  },
  {
    slug: "mirage", codename: "MIRAGE", tagline: "Fleet Intelligence Router",
    priceStandalone: 39900, priceBundled: 23900, priceDisplay: "$399", bundleDisplay: "$239",
    priceId: "price_1T6OBKQ7FtTiAL4aZpSs8MYy", icon: Waypoints, color: "200 90% 50%", tier: "ELITE",
    edition: "Edition 001 of ∞",
    briefing: "MIRAGE routes intelligence across distributed agent fleets with zero contention. Load-aware task distribution, cognitive affinity matching, and real-time fleet telemetry derived from the substrate's Fleet Intelligence Crown Jewel.",
    capabilities: ["Cognitive affinity-based routing", "Fleet-wide telemetry aggregation", "Zero-contention task distribution", "Agent capability matching", "Dynamic fleet scaling signals", "Cross-fleet knowledge sharing"],
    threatLevel: "ELEVATED — FLEET OPS", clearance: "LEVEL 7 — RESTRICTED",
  },
  {
    slug: "aegis", codename: "AEGIS", tagline: "Identity & Access Governance",
    priceStandalone: 19900, priceBundled: 11900, priceDisplay: "$199", bundleDisplay: "$119",
    priceId: "price_1T6MgRQ7FtTiAL4af82LmdJR", icon: Fingerprint, color: "15 85% 50%", tier: "CORE",
    edition: "Edition 001 of ∞",
    briefing: "AEGIS governs who — and what — can touch your systems. Fine-grained RBAC, policy-as-code enforcement, credential rotation, and session attestation. Born from the substrate's Governance Crown Jewels.",
    capabilities: ["Policy-as-code access control", "Fine-grained RBAC engine", "Automatic credential rotation", "Session attestation & revocation", "Audit-grade access logging", "Zero-trust perimeter enforcement"],
    threatLevel: "MODERATE — GOVERNANCE", clearance: "LEVEL 5 — STANDARD",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // S-TIER ENGINES — 10 Supreme Sealed Runtimes ($999 each, $599 bundled)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "sovereign", codename: "SOVEREIGN", tagline: "Autonomous Governance Kernel",
    priceStandalone: 99900, priceBundled: 59900, priceDisplay: "$999", bundleDisplay: "$599",
    priceId: "price_1T9hKAQ7FtTiAL4alDEWJ33m", icon: Shield, color: "350 85% 50%", tier: "APEX",
    edition: "S-TIER Edition — Governance Supremacy",
    briefing: "SOVEREIGN fuses the Intelligence Governance Kernel, Policy-Aware Intelligence Gate, Audit-Grade Decision Ledger, Regulatory Mode Switcher, Capability Impact Forecaster, and Entitlement Resolution into an autonomous governance supercomplex. Every decision is policy-gated, audit-logged, and regulation-aware — zero human oversight required.",
    capabilities: ["Intelligence Governance Kernel — meta-governance over all cognitive subsystems", "Policy-Aware Intelligence Gate — blocks non-compliant reasoning paths", "Audit-Grade Decision Ledger — immutable hash-chain decision trail", "Regulatory Mode Switcher — auto-adapts to GDPR/HIPAA/SOC2 contexts", "Capability Impact Forecaster — predicts downstream effects before execution", "Entitlement Resolution — resolves cascading access rights in real time"],
    threatLevel: "SUPREME — GOVERNANCE KERNEL", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "colossus", codename: "COLOSSUS", tagline: "Fleet Supremacy Engine",
    priceStandalone: 99900, priceBundled: 59900, priceDisplay: "$999", bundleDisplay: "$599",
    priceId: "price_1T9hKBQ7FtTiAL4acMRKaevN", icon: Network, color: "200 90% 45%", tier: "APEX",
    edition: "S-TIER Edition — Fleet Dominance",
    briefing: "COLOSSUS merges Fleet Intelligence Orchestrator, Self-Scaling Intelligence Fabric, Cross-Pipeline Arbitration Engine, Cost-Aware Routing Engine, and Autonomous Ops Steward into a fleet-scale command layer. Thousands of agents, zero contention, autonomous cost optimization.",
    capabilities: ["Fleet Intelligence Orchestrator — cognitive-affinity task routing across fleets", "Self-Scaling Intelligence Fabric — auto-scales compute topology under load", "Cross-Pipeline Arbitration Engine — resolves inter-pipeline resource conflicts", "Cost-Aware Routing Engine — real-time cost/quality optimization per request", "Autonomous Ops Steward — self-managing operations with zero human input"],
    threatLevel: "SUPREME — FLEET OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "harbinger", codename: "HARBINGER", tagline: "Predictive Threat Neutralizer",
    priceStandalone: 99900, priceBundled: 59900, priceDisplay: "$999", bundleDisplay: "$599",
    priceId: "price_1T9hKCQ7FtTiAL4ayFJF9hFf", icon: Eye, color: "0 90% 45%", tier: "APEX",
    edition: "S-TIER Edition — Threat Supremacy",
    briefing: "HARBINGER weaves Emergent Threat Anticipator, Behavioral Trust Scoring, Intelligence Containment Engine, Anomaly Correlation Engine, and Cascade Prevention into a predictive defense mesh. Threats are detected, scored, contained, and neutralized before they materialize.",
    capabilities: ["Emergent Threat Anticipator — predicts novel attack vectors via pattern extrapolation", "Behavioral Trust Scoring — continuous entity trust assessment", "Intelligence Containment Engine — isolates compromised reasoning chains", "Anomaly Correlation Engine — cross-signal anomaly fusion", "Cascade Prevention — halts failure propagation at the origin"],
    threatLevel: "SUPREME — THREAT INTEL", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "prometheus", codename: "PROMETHEUS", tagline: "Self-Evolution Reactor",
    priceStandalone: 99900, priceBundled: 59900, priceDisplay: "$999", bundleDisplay: "$599",
    priceId: "price_1T9hKDQ7FtTiAL4aHCOIjgFV", icon: FlaskConical, color: "25 95% 50%", tier: "APEX",
    edition: "S-TIER Edition — Evolution Supremacy",
    briefing: "PROMETHEUS combines the Recursive Self-Improvement Pipeline, Mutation Proposal Engine, SEBA Engine (7-gate), Shadow Run Environment, and Mutation Rehearsal into a self-evolving reactor. The system proposes mutations, rehearses them in shadow, validates through SEBA gates, and applies — autonomously improving itself.",
    capabilities: ["Recursive Self-Improvement Pipeline — multi-pass evolutionary refinement", "Mutation Proposal Engine — generates typed architecture mutations", "SEBA Engine — 7-gate safety-bounded evolution assessment", "Shadow Run Environment — risk-free mutation testing", "Mutation Rehearsal — dry-run mutations with rollback guarantees"],
    threatLevel: "SUPREME — EVOLUTION OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "omniscient", codename: "OMNISCIENT", tagline: "Full-Spectrum Oracle",
    priceStandalone: 99900, priceBundled: 59900, priceDisplay: "$999", bundleDisplay: "$599",
    priceId: "price_1T9hKEQ7FtTiAL4a86g6KJ3l", icon: Eye, color: "270 80% 55%", tier: "APEX",
    edition: "S-TIER Edition — Prediction Supremacy",
    briefing: "OMNISCIENT fuses Multi-Horizon Prediction, Predictive Oracle Engine, Counterfactual Scenario Engine, Confidence Calibration, Oracle Ripple Precognition, and Predictive Trend Crystallizer into a total-spectrum prediction system. See every future, score every probability, and act on the highest-confidence path.",
    capabilities: ["Multi-Horizon Prediction — short/medium/long-range forecasting", "Predictive Oracle Engine — Bayesian network with 10K Monte Carlo iterations", "Counterfactual Scenario Engine — what-if analysis across decision trees", "Confidence Calibration — continuous probability recalibration", "Oracle Ripple Precognition — second-order effect prediction", "Predictive Trend Crystallizer — transforms weak signals into actionable trends"],
    threatLevel: "SUPREME — ORACLE OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "leviathan", codename: "LEVIATHAN", tagline: "Deep Memory Architect",
    priceStandalone: 99900, priceBundled: 59900, priceDisplay: "$999", bundleDisplay: "$599",
    priceId: "price_1T9hKFQ7FtTiAL4aZXdi4Vht", icon: Brain, color: "180 75% 40%", tier: "APEX",
    edition: "S-TIER Edition — Memory Supremacy",
    briefing: "LEVIATHAN merges Context Threading, Immune Memory Persistence, Predictive State Modeling, Gossip Protocol Engine, and State Synchronization into a distributed deep-memory fabric. Perfect recall, cross-node memory coherence, and predictive state pre-loading across entire clusters.",
    capabilities: ["Context Threading — maintains conversation coherence across sessions", "Immune Memory Persistence — remembers and adapts to past threats", "Predictive State Modeling — pre-loads state before it's needed", "Gossip Protocol Engine — epidemic memory propagation across nodes", "State Synchronization — conflict-free replicated state across clusters"],
    threatLevel: "SUPREME — MEMORY OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "chimera", codename: "CHIMERA", tagline: "Adaptive Intelligence Mesh",
    priceStandalone: 99900, priceBundled: 59900, priceDisplay: "$999", bundleDisplay: "$599",
    priceId: "price_1T9hKGQ7FtTiAL4as5wD8Wc4", icon: Sparkles, color: "310 90% 55%", tier: "APEX",
    edition: "S-TIER Edition — Adaptation Supremacy",
    briefing: "CHIMERA fuses Adaptive Product Brain, Intent Drift Tracker, Friction Auto-Removal Engine, Intent Disambiguation, and Personality Adaptation into a self-reshaping intelligence mesh. The system reads user intent, removes friction before users notice it, and adapts its entire personality and interface in real time.",
    capabilities: ["Adaptive Product Brain — learns product usage patterns autonomously", "Intent Drift Tracker — detects when user goals shift mid-session", "Friction Auto-Removal Engine — eliminates UX friction preemptively", "Intent Disambiguation — resolves ambiguous requests with context", "Personality Adaptation — morphs communication style per user preference"],
    threatLevel: "SUPREME — ADAPTATION OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "titan", codename: "TITAN", tagline: "Infrastructure Supremacy Engine",
    priceStandalone: 99900, priceBundled: 59900, priceDisplay: "$999", bundleDisplay: "$599",
    priceId: "price_1T9hKHQ7FtTiAL4aAVewzBn8", icon: Castle, color: "220 70% 45%", tier: "APEX",
    edition: "S-TIER Edition — Infrastructure Supremacy",
    briefing: "TITAN fuses Circuit Breaker, Consensus Heartbeat Protocol, Distributed Consensus Mesh, Quorum Negotiator, Homeostatic Regulator, and Mesh Topology Optimizer into an indestructible infrastructure kernel. Byzantine fault tolerance, self-healing consensus, and automatic topology optimization under any conditions.",
    capabilities: ["Circuit Breaker — cascading failure isolation at sub-millisecond speed", "Consensus Heartbeat Protocol — distributed liveness detection", "Distributed Consensus Mesh — multi-node agreement without single point of failure", "Quorum Negotiator — dynamic quorum sizing under partition", "Homeostatic Regulator — maintains system equilibrium autonomously", "Mesh Topology Optimizer — self-optimizing network topology"],
    threatLevel: "SUPREME — INFRASTRUCTURE", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "wraith", codename: "WRAITH", tagline: "Shadow Operations Command",
    priceStandalone: 99900, priceBundled: 59900, priceDisplay: "$999", bundleDisplay: "$599",
    priceId: "price_1T9hKIQ7FtTiAL4a0cEFeE0z", icon: Ghost, color: "260 70% 45%", tier: "APEX",
    edition: "S-TIER Edition — Shadow Supremacy",
    briefing: "WRAITH merges Shadow Evolution Testing, Topology Mutation, Evolution A/B, Evolution Rollback, and Evolution Sandbox into a covert operations platform. Test anything in shadow, mutate topologies without risk, A/B test evolutionary paths, and rollback instantly if reality diverges from prediction.",
    capabilities: ["Shadow Evolution Testing — TSAC-verified shadow execution", "Topology Mutation — reshape system architecture at runtime", "Evolution A/B — split-test evolutionary strategies against live traffic", "Evolution Rollback — instant rollback with state preservation", "Evolution Sandbox — isolated mutation testing environment"],
    threatLevel: "SUPREME — SHADOW OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "apex-one", codename: "APEX ONE", tagline: "Crown Intelligence Convergence",
    priceStandalone: 99900, priceBundled: 59900, priceDisplay: "$999", bundleDisplay: "$599",
    priceId: "price_1T9hKJQ7FtTiAL4aVQ6tTM0e", icon: Diamond, color: "45 100% 50%", tier: "APEX",
    edition: "S-TIER Edition — Crown Convergence",
    briefing: "APEX ONE is the convergence of Strategic Foresight Engine, Decision Confidence Governor, Explainable Intelligence Compiler, Value-Weighted Reasoning Router, and Waste Detection Intelligence. The crown jewel of decision-making — every reasoning path is explainable, every decision confidence-scored, every resource optimally allocated.",
    capabilities: ["Strategic Foresight Engine — long-horizon strategic planning", "Decision Confidence Governor — gates decisions below confidence threshold", "Explainable Intelligence Compiler — transforms opaque reasoning into auditable chains", "Value-Weighted Reasoning Router — routes queries by expected value, not just speed", "Waste Detection Intelligence — identifies and eliminates computational waste"],
    threatLevel: "SUPREME — CROWN INTELLIGENCE", clearance: "LEVEL 10 — S-TIER",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // S-TIER ENGINES WAVE 2 — 10 More Supreme Sealed Runtimes ($599 each, $359 bundled)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "pandora", codename: "PANDORA", tagline: "Cognitive Depth Reactor",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pJJQ7FtTiAL4a2P5ElTqA", icon: Flame, color: "340 90% 55%", tier: "APEX",
    edition: "S-TIER Edition — Cognitive Supremacy",
    briefing: "PANDORA unlocks recursive cognitive depth. Metacognition Engine monitors its own reasoning, Recursive Planning decomposes infinite-depth goals, Generative Hypothesis proposes novel solutions, Attention Allocation focuses compute on high-value targets, and Recursive Cognitive Bootstrapping bootstraps new reasoning capabilities from existing ones.",
    capabilities: ["Metacognition Engine — monitors and optimizes its own reasoning processes", "Recursive Planning — infinite-depth goal decomposition and execution", "Generative Hypothesis — proposes and tests novel solution pathways", "Attention Allocation — dynamically focuses compute on highest-value targets", "Recursive Cognitive Bootstrapping — bootstraps new cognitive capabilities from existing primitives"],
    threatLevel: "SUPREME — COGNITIVE DEPTH", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "hydra", codename: "HYDRA", tagline: "Resilience Supercluster",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pJKQ7FtTiAL4aOX2OTNf4", icon: Swords, color: "145 70% 40%", tier: "APEX",
    edition: "S-TIER Edition — Resilience Supremacy",
    briefing: "HYDRA is unkillable infrastructure. Self-Healing Orchestrator auto-repairs failures, Cascading Failure Isolator quarantines blast radius, Fallback Chain Architect constructs multi-level fallback strategies, Graceful Shutdown ensures zero data loss, and Self-Repair Engine regenerates damaged subsystems autonomously.",
    capabilities: ["Self-Healing Orchestrator — autonomous repair of failing subsystems", "Cascading Failure Isolator — quarantines blast radius in sub-millisecond", "Fallback Chain Architect — multi-level fallback strategy construction", "Graceful Shutdown — zero-data-loss shutdown orchestration", "Self-Repair Engine — regenerates damaged subsystems from blueprints"],
    threatLevel: "SUPREME — RESILIENCE OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "specter", codename: "SPECTER", tagline: "Stealth Intelligence Grid",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pJNQ7FtTiAL4aSdufCEAw", icon: Skull, color: "260 80% 40%", tier: "APEX",
    edition: "S-TIER Edition — Stealth Supremacy",
    briefing: "SPECTER operates in the shadows. Stealth Operations Controller runs covert intelligence gathering, Honeypot Intelligence deploys adaptive traps, Attribution Laundering Detector unmasks disguised attacks, Zero-Trust Verification validates every entity continuously, and Behavioral Biometrics creates unforgeable identity fingerprints.",
    capabilities: ["Stealth Operations Controller — covert intelligence gathering operations", "Honeypot Intelligence — deploys and manages adaptive trap systems", "Attribution Laundering Detector — unmasks disguised attack origins", "Zero-Trust Verification — continuous entity validation at every boundary", "Behavioral Biometrics — unforgeable identity fingerprinting from usage patterns"],
    threatLevel: "SUPREME — STEALTH OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "atlas-engine", codename: "ATLAS", tagline: "Universal Context Weaver",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pJOQ7FtTiAL4a92Iskknt", icon: BookOpen, color: "200 75% 50%", tier: "APEX",
    edition: "S-TIER Edition — Knowledge Supremacy",
    briefing: "ATLAS weaves all knowledge into a unified context fabric. Semantic Knowledge Graph maps entity relationships, Embedding Store provides vector-powered retrieval, Cross-Lingual Intelligence operates across 50+ languages, Semantic Compression minimizes context without losing meaning, and Domain Terminology Forge creates specialized vocabularies on-the-fly.",
    capabilities: ["Semantic Knowledge Graph — automatic entity-relationship mapping", "Embedding Store — vector-powered semantic search and retrieval", "Cross-Lingual Intelligence — operates fluently across 50+ languages", "Semantic Compression — minimizes context window usage without information loss", "Domain Terminology Forge — creates specialized vocabularies from domain data"],
    threatLevel: "SUPREME — KNOWLEDGE OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "cerberus", codename: "CERBERUS", tagline: "Multi-Gate Defense Matrix",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pJQQ7FtTiAL4aGlT27WMR", icon: ShieldAlert, color: "0 85% 45%", tier: "APEX",
    edition: "S-TIER Edition — Defense Supremacy",
    briefing: "CERBERUS guards every gate. Prompt Injection Shield blocks adversarial prompts, Input Sanitization Gateway cleanses all inputs, Hallucination Guard validates output truthfulness, Veto Authority Engine provides executive override on dangerous actions, and Veto Cascade Protocol propagates vetoes across the entire system.",
    capabilities: ["Prompt Injection Shield — blocks adversarial prompt manipulation", "Input Sanitization Gateway — deep-cleanses all input vectors", "Hallucination Guard — validates output truthfulness against knowledge base", "Veto Authority Engine — executive override on dangerous or non-compliant actions", "Veto Cascade Protocol — propagates safety vetoes across all subsystems"],
    threatLevel: "SUPREME — DEFENSE MATRIX", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "obelisk", codename: "OBELISK", tagline: "Immutable Audit Fortress",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pJSQ7FtTiAL4azzcKbzJD", icon: Landmark, color: "30 80% 45%", tier: "APEX",
    edition: "S-TIER Edition — Audit Supremacy",
    briefing: "OBELISK makes every action permanent and provable. Tamper-Evident Chain creates immutable hash-linked audit trails, Self-Audit Loop continuously verifies system integrity, Compliance Attestation generates regulatory-grade compliance reports, Forensic Replay recreates any past system state, and Content Hash Deduplicator ensures zero duplicate data.",
    capabilities: ["Tamper-Evident Chain — immutable hash-linked audit trails", "Self-Audit Loop — continuous self-verification of system integrity", "Compliance Attestation — regulatory-grade compliance report generation", "Forensic Replay — recreates any historical system state for investigation", "Content Hash Deduplicator — eliminates duplicate data across the entire system"],
    threatLevel: "SUPREME — AUDIT OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "phoenix", codename: "PHOENIX", tagline: "Autonomous Recovery Matrix",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pJTQ7FtTiAL4acUqX4DpU", icon: Bird, color: "25 95% 50%", tier: "APEX",
    edition: "S-TIER Edition — Recovery Supremacy",
    briefing: "PHOENIX rises from any failure. Autonomous Triage Engine classifies and prioritizes failures in real time, Organ Transplant swaps failing subsystems with healthy replacements, Root Cause Analysis traces failures to their origin, Health Aggregation provides unified system health scoring, and Predictive Failure Forecaster predicts failures before they happen.",
    capabilities: ["Autonomous Triage Engine — real-time failure classification and prioritization", "Organ Transplant — hot-swaps failing subsystems with healthy replacements", "Root Cause Analysis — traces failures to their origin across service boundaries", "Health Aggregation — unified health scoring across all subsystems", "Predictive Failure Forecaster — predicts failures 30-60 minutes before they occur"],
    threatLevel: "SUPREME — RECOVERY OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "nexus-prime", codename: "NEXUS PRIME", tagline: "Routing Supremacy Core",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pJVQ7FtTiAL4aKAkLF5Hd", icon: Router, color: "160 80% 45%", tier: "APEX",
    edition: "S-TIER Edition — Routing Supremacy",
    briefing: "NEXUS PRIME is the ultimate routing intelligence. Multi-Model Consensus aggregates responses from multiple AI models into a single high-confidence answer, Value-Weighted Reasoning Router routes by expected value not just speed, Priority-Aware Relay ensures critical requests bypass queues, Token Optimization minimizes token spend, and Adaptive Load Balancer distributes load based on real-time capacity.",
    capabilities: ["Multi-Model Consensus — aggregates multiple model responses into optimal answer", "Value-Weighted Reasoning Router — routes queries by expected value, not latency", "Priority-Aware Relay — critical requests bypass all queues", "Token Optimization — minimizes token spend without quality loss", "Adaptive Load Balancer — distributes load based on real-time node capacity"],
    threatLevel: "SUPREME — ROUTING CORE", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "chronos", codename: "CHRONOS", tagline: "Temporal Intelligence Core",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pJXQ7FtTiAL4aOrmIKGiO", icon: Clock, color: "270 75% 50%", tier: "APEX",
    edition: "S-TIER Edition — Temporal Supremacy",
    briefing: "CHRONOS masters time itself. Temporal Reasoning understands cause and effect across time dimensions, Temporal Ripple Analyzer traces second-order effects of past decisions, Temporal Regression Sandbox simulates alternate timelines, Episodic Replay reconstructs past decision sequences, and Predictive Reflex Arc pre-computes responses before triggers arrive.",
    capabilities: ["Temporal Reasoning — understands causality across time dimensions", "Temporal Ripple Analyzer — traces second-order effects of past decisions", "Temporal Regression Sandbox — simulates alternate timelines for what-if analysis", "Episodic Replay — reconstructs and learns from past decision sequences", "Predictive Reflex Arc — pre-computes responses before triggers arrive"],
    threatLevel: "SUPREME — TEMPORAL OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "golem", codename: "GOLEM", tagline: "Autonomous Workflow Titan",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pJZQ7FtTiAL4amRr9MTaO", icon: Bot, color: "38 90% 45%", tier: "APEX",
    edition: "S-TIER Edition — Workflow Supremacy",
    briefing: "GOLEM automates everything. Autonomous Workflow Composer designs workflows from natural language, Task Dependency Resolver handles complex DAG execution, Goal Decomposition breaks high-level goals into executable steps, Goal Tracking monitors progress across all active objectives, Pipeline Composition Engine chains pipelines dynamically, and Scheduler Engine optimizes execution timing.",
    capabilities: ["Autonomous Workflow Composer — designs workflows from natural language", "Task Dependency Resolver — handles complex DAG execution with cycle detection", "Goal Decomposition — breaks high-level goals into executable atomic steps", "Goal Tracking — monitors progress across all active objectives in real time", "Pipeline Composition Engine — chains pipelines dynamically based on context", "Scheduler Engine — optimizes execution timing across all active workflows"],
    threatLevel: "SUPREME — WORKFLOW OPS", clearance: "LEVEL 10 — S-TIER",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // S-TIER ENGINES WAVE 3 — 10 Meta-Engine Feedstock ($599 each, $359 bundled)
  // Designed for chaining into commercial meta-engines
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "axiom", codename: "AXIOM", tagline: "Logical Inference Core",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pfxQ7FtTiAL4asMjMPQyZ", icon: Atom, color: "210 85% 55%", tier: "APEX",
    edition: "S-TIER Edition — Inference Supremacy",
    briefing: "AXIOM is pure logic. Formal Theorem Prover validates complex logical chains, Constraint Satisfaction Solver resolves multi-variable systems, Deductive Reasoning Engine applies first-principles analysis, Syllogistic Validator ensures argument soundness, and Abductive Inference generates best-explanation hypotheses from incomplete data.",
    capabilities: ["Formal Theorem Prover — validates complex logical chains with formal verification", "Constraint Satisfaction Solver — resolves multi-variable optimization problems", "Deductive Reasoning Engine — first-principles logical analysis", "Syllogistic Validator — ensures argument soundness and logical consistency", "Abductive Inference — generates best-explanation hypotheses from incomplete data"],
    threatLevel: "SUPREME — INFERENCE OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "dynamo", codename: "DYNAMO", tagline: "Resource Optimization Core",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pfyQ7FtTiAL4aD66RUINW", icon: Battery, color: "45 90% 48%", tier: "APEX",
    edition: "S-TIER Edition — Optimization Supremacy",
    briefing: "DYNAMO squeezes maximum value from every resource. FinOps Optimizer tracks and minimizes cloud spend in real time, Compute Budget Controller enforces hard resource ceilings, Token Economics Engine optimizes LLM token allocation, Resource Arbitrage identifies cost asymmetries across providers, and Waste Detection Intelligence eliminates redundant computation.",
    capabilities: ["FinOps Optimizer — real-time cloud cost tracking and minimization", "Compute Budget Controller — enforces hard resource ceilings per workload", "Token Economics Engine — optimizes LLM token allocation across models", "Resource Arbitrage — exploits cost asymmetries across infrastructure providers", "Waste Detection Intelligence — identifies and eliminates redundant computation"],
    threatLevel: "SUPREME — RESOURCE OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "warden", codename: "WARDEN", tagline: "Policy Enforcement Core",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pg1Q7FtTiAL4aptWtuKbb", icon: ShieldHalf, color: "15 80% 48%", tier: "APEX",
    edition: "S-TIER Edition — Enforcement Supremacy",
    briefing: "WARDEN enforces every policy. Graduated Autonomy Controller calibrates system independence per context, Sandbox Isolation Engine runs untrusted code in sealed environments, Compliance Gate blocks non-compliant operations at the boundary, Policy Cascade Propagator pushes policy changes across all subsystems, and Access Arbitration resolves competing access claims in real time.",
    capabilities: ["Graduated Autonomy Controller — calibrates system independence per context", "Sandbox Isolation Engine — sealed execution for untrusted operations", "Compliance Gate — blocks non-compliant operations at the boundary", "Policy Cascade Propagator — pushes policy changes across all subsystems instantly", "Access Arbitration — resolves competing access claims in real time"],
    threatLevel: "SUPREME — ENFORCEMENT OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "synapse", codename: "SYNAPSE", tagline: "Neural Bridge Engine",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pg2Q7FtTiAL4aCQUugB6R", icon: Cable, color: "280 75% 55%", tier: "APEX",
    edition: "S-TIER Edition — Bridge Supremacy",
    briefing: "SYNAPSE bridges every cognitive gap. Cross-Engine Signal Relay pipes outputs between engines with zero latency, Cognitive Bridge fuses reasoning chains from disparate engines, Context Threading maintains coherent state across multi-hop pipelines, Inter-Agent Messaging enables agents to coordinate at cognitive level, and Attention Routing focuses inter-engine bandwidth on highest-priority signals.",
    capabilities: ["Cross-Engine Signal Relay — zero-latency output piping between engines", "Cognitive Bridge — fuses reasoning chains from disparate engine outputs", "Context Threading — maintains coherent state across multi-hop pipelines", "Inter-Agent Messaging — cognitive-level coordination between autonomous agents", "Attention Routing — focuses inter-engine bandwidth on highest-priority signals"],
    threatLevel: "SUPREME — BRIDGE OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "crucible", codename: "CRUCIBLE", tagline: "Stress Testing Reactor",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pg3Q7FtTiAL4aEfrpVOBp", icon: FlaskRound, color: "0 75% 50%", tier: "APEX",
    edition: "S-TIER Edition — Testing Supremacy",
    briefing: "CRUCIBLE breaks everything on purpose. Chaos Engineering Controller injects precise failures into production-like environments, Mutation Testing Engine verifies test suite effectiveness, Adversarial Simulation generates worst-case attack scenarios, Load Stress Analyzer finds breaking points under extreme load, and Failure Injection Orchestrator coordinates multi-fault scenarios.",
    capabilities: ["Chaos Engineering Controller — precise failure injection into production-like environments", "Mutation Testing Engine — verifies test suite effectiveness by mutating code", "Adversarial Simulation — generates worst-case attack and failure scenarios", "Load Stress Analyzer — finds system breaking points under extreme load", "Failure Injection Orchestrator — coordinates multi-fault failure scenarios"],
    threatLevel: "SUPREME — STRESS OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "echo", codename: "ECHO", tagline: "Feedback Loop Engine",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pg4Q7FtTiAL4aHcRgDqUp", icon: IterationCw, color: "160 70% 45%", tier: "APEX",
    edition: "S-TIER Edition — Feedback Supremacy",
    briefing: "ECHO closes every loop. Outcome Tracker records and scores every decision outcome, Reinforcement Learning Loop adjusts strategies based on reward signals, Performance Calibration auto-tunes system parameters, Drift Correction Engine detects and reverses performance degradation, and Confidence Recalibration adjusts prediction confidence based on historical accuracy.",
    capabilities: ["Outcome Tracker — records and scores every decision outcome", "Reinforcement Learning Loop — adjusts strategies based on reward signals", "Performance Calibration — auto-tunes system parameters from feedback data", "Drift Correction Engine — detects and reverses performance degradation", "Confidence Recalibration — adjusts prediction confidence from historical accuracy"],
    threatLevel: "SUPREME — FEEDBACK OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "vortex", codename: "VORTEX", tagline: "Data Fusion Core",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pg6Q7FtTiAL4aYGXjxjV0", icon: Merge, color: "310 80% 50%", tier: "APEX",
    edition: "S-TIER Edition — Fusion Supremacy",
    briefing: "VORTEX fuses every signal. Multi-Source Intelligence Aggregator combines data from heterogeneous sources, Signal Correlation Engine finds hidden relationships across data streams, Cross-Domain Synthesizer merges insights from unrelated domains, Intelligence Denoiser filters noise from high-value signals, and Semantic Fusion compresses multi-modal data into unified representations.",
    capabilities: ["Multi-Source Intelligence Aggregator — combines heterogeneous data sources", "Signal Correlation Engine — finds hidden relationships across data streams", "Cross-Domain Synthesizer — merges insights from unrelated domains", "Intelligence Denoiser — filters noise from high-value intelligence signals", "Semantic Fusion — compresses multi-modal data into unified representations"],
    threatLevel: "SUPREME — FUSION OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "monolith", codename: "MONOLITH", tagline: "State Management Fortress",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pg7Q7FtTiAL4aKtOXPqwo", icon: Database, color: "220 65% 45%", tier: "APEX",
    edition: "S-TIER Edition — State Supremacy",
    briefing: "MONOLITH manages all state. CRDT-Based Consistency ensures conflict-free distributed state, Checkpoint/Restore captures and restores system snapshots instantly, State Migration moves state between nodes without downtime, Snapshot Isolation provides transaction-safe reads, and State Compaction minimizes storage while preserving full history.",
    capabilities: ["CRDT-Based Consistency — conflict-free replicated data types for distributed state", "Checkpoint/Restore — instant system snapshot capture and restoration", "State Migration — zero-downtime state transfer between nodes", "Snapshot Isolation — transaction-safe reads without locking", "State Compaction — minimizes storage while preserving full history"],
    threatLevel: "SUPREME — STATE OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "seraph", codename: "SERAPH", tagline: "Ethical Reasoning Core",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pg9Q7FtTiAL4aRQET40Yo", icon: Heart, color: "340 70% 55%", tier: "APEX",
    edition: "S-TIER Edition — Ethics Supremacy",
    briefing: "SERAPH ensures every action is ethical. Ethical Constraint Reasoner evaluates actions against moral frameworks, Bias Detection Scanner identifies and flags systematic biases, Fairness Auditor ensures equitable outcomes across populations, Harm Prevention Gate blocks actions with predicted negative externalities, and Value Alignment Engine continuously calibrates system behavior to human values.",
    capabilities: ["Ethical Constraint Reasoner — evaluates actions against moral frameworks", "Bias Detection Scanner — identifies and flags systematic biases in outputs", "Fairness Auditor — ensures equitable outcomes across all populations", "Harm Prevention Gate — blocks actions with predicted negative externalities", "Value Alignment Engine — continuously calibrates behavior to human values"],
    threatLevel: "SUPREME — ETHICS OPS", clearance: "LEVEL 10 — S-TIER",
  },
  {
    slug: "progenitor", codename: "PROGENITOR", tagline: "Capability Genesis Engine",
    priceStandalone: 59900, priceBundled: 35900, priceDisplay: "$599", bundleDisplay: "$359",
    priceId: "price_1T9pgAQ7FtTiAL4a9MJczerR", icon: Blocks, color: "145 75% 40%", tier: "APEX",
    edition: "S-TIER Edition — Genesis Supremacy",
    briefing: "PROGENITOR creates new capabilities from existing ones. Capability Genesis Reactor synthesizes novel primitives from component building blocks, Blueprint Evolution Compiler evolves blueprints through iterative refinement, Artifact Hardening Foundry hardens raw capabilities into production-grade artifacts, Capability Genealogy Tracker maps the lineage of every generated capability, and Capability Forge Engine orchestrates end-to-end capability creation pipelines.",
    capabilities: ["Capability Genesis Reactor — synthesizes novel primitives from building blocks", "Blueprint Evolution Compiler — evolves blueprints through iterative refinement", "Artifact Hardening Foundry — hardens raw capabilities into production-grade artifacts", "Capability Genealogy Tracker — maps lineage of every generated capability", "Capability Forge Engine — orchestrates end-to-end capability creation pipelines"],
    threatLevel: "SUPREME — GENESIS OPS", clearance: "LEVEL 10 — S-TIER",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // META-ENGINES — 4 Commercial Superpipelines ($1,999 each, $1,199 bundled)
  // Each chains 4 S-tier engines into a compound execution pipeline
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "godmind", codename: "GODMIND", tagline: "Cognitive Superpipeline",
    priceStandalone: 199900, priceBundled: 119900, priceDisplay: "$1,999", bundleDisplay: "$1,199",
    priceId: "price_1T9pgGQ7FtTiAL4a58HQ3Dvw", icon: Crown, color: "45 100% 55%", tier: "META",
    edition: "META-ENGINE — Cognitive Singularity",
    briefing: "GODMIND chains PANDORA → AXIOM → SYNAPSE → ECHO into a recursive cognitive superpipeline. PANDORA generates hypotheses via metacognition, AXIOM validates them through formal logic, SYNAPSE bridges the reasoning chains across engines, and ECHO closes the loop with reinforcement learning — creating a self-improving cognitive system that gets smarter with every execution.",
    capabilities: ["PANDORA stage — metacognitive hypothesis generation and recursive planning", "AXIOM stage — formal logical validation and constraint satisfaction", "SYNAPSE stage — cross-engine reasoning chain bridging and context threading", "ECHO stage — reinforcement learning feedback and confidence recalibration", "Compound synergy: 4 engines × 5 primitives = 20 primitives orchestrated", "Self-improving: every execution cycle makes the next one more accurate"],
    threatLevel: "TRANSCENDENT — META-COGNITIVE", clearance: "LEVEL 11 — META-TIER",
  },
  {
    slug: "fortress", codename: "FORTRESS", tagline: "Defense Superpipeline",
    priceStandalone: 199900, priceBundled: 119900, priceDisplay: "$1,999", bundleDisplay: "$1,199",
    priceId: "price_1T9pgHQ7FtTiAL4aEuknUub0", icon: Layers, color: "0 80% 48%", tier: "META",
    edition: "META-ENGINE — Defense Singularity",
    briefing: "FORTRESS chains CERBERUS → WARDEN → CRUCIBLE → HYDRA into an impenetrable defense superpipeline. CERBERUS blocks attacks at every gate, WARDEN enforces policies across the perimeter, CRUCIBLE stress-tests for unknown vulnerabilities, and HYDRA self-heals any damage that gets through — creating a defense system that is simultaneously proactive, reactive, and regenerative.",
    capabilities: ["CERBERUS stage — multi-gate attack blocking and prompt injection shielding", "WARDEN stage — policy enforcement and graduated autonomy control", "CRUCIBLE stage — chaos engineering and adversarial vulnerability discovery", "HYDRA stage — self-healing repair and cascading failure isolation", "Compound synergy: 4 engines × 5 primitives = 20 primitives orchestrated", "Regenerative: damage triggers automatic hardening of attack surface"],
    threatLevel: "TRANSCENDENT — META-DEFENSE", clearance: "LEVEL 11 — META-TIER",
  },
  {
    slug: "singularity", codename: "SINGULARITY", tagline: "Intelligence Superpipeline",
    priceStandalone: 199900, priceBundled: 119900, priceDisplay: "$1,999", bundleDisplay: "$1,199",
    priceId: "price_1T9pgJQ7FtTiAL4aBNJOYxud", icon: Orbit, color: "270 85% 55%", tier: "META",
    edition: "META-ENGINE — Intelligence Singularity",
    briefing: "SINGULARITY chains OMNISCIENT → VORTEX → DYNAMO → PROGENITOR into a total intelligence superpipeline. OMNISCIENT predicts across all time horizons, VORTEX fuses multi-source intelligence into unified signals, DYNAMO optimizes resource allocation for maximum insight per dollar, and PROGENITOR creates new analytical capabilities on-the-fly — an intelligence system that invents its own tools.",
    capabilities: ["OMNISCIENT stage — multi-horizon prediction and counterfactual analysis", "VORTEX stage — multi-source data fusion and signal correlation", "DYNAMO stage — resource optimization and cost-aware intelligence routing", "PROGENITOR stage — on-the-fly capability synthesis for novel analytical needs", "Compound synergy: 4 engines × 5-6 primitives = 21 primitives orchestrated", "Self-tooling: creates new analytical primitives when existing ones are insufficient"],
    threatLevel: "TRANSCENDENT — META-INTELLIGENCE", clearance: "LEVEL 11 — META-TIER",
  },
  {
    slug: "eternus", codename: "ETERNUS", tagline: "Governance Superpipeline",
    priceStandalone: 199900, priceBundled: 119900, priceDisplay: "$1,999", bundleDisplay: "$1,199",
    priceId: "price_1T9pgKQ7FtTiAL4aJfC6B3ev", icon: Gem, color: "180 70% 45%", tier: "META",
    edition: "META-ENGINE — Governance Singularity",
    briefing: "ETERNUS chains SOVEREIGN → SERAPH → MONOLITH → GOLEM into an autonomous governance superpipeline. SOVEREIGN provides policy-gated governance, SERAPH ensures every action meets ethical standards, MONOLITH maintains immutable state for full auditability, and GOLEM automates workflow execution — creating an autonomous system that governs itself ethically, transparently, and indefinitely.",
    capabilities: ["SOVEREIGN stage — policy-gated governance with regulatory compliance", "SERAPH stage — ethical constraint reasoning and value alignment", "MONOLITH stage — immutable state management for full audit trail", "GOLEM stage — autonomous workflow execution and goal tracking", "Compound synergy: 4 engines × 5-6 primitives = 22 primitives orchestrated", "Self-governing: operates indefinitely without human oversight while maintaining ethical alignment"],
    threatLevel: "TRANSCENDENT — META-GOVERNANCE", clearance: "LEVEL 11 — META-TIER",
  },
  // ─── FEATURED ──────────────────────────────────────────
  {
    slug: "failsafe", codename: "FAILSAFE", tagline: "Disaster Recovery & Platform Migration Engine",
    priceStandalone: 3900, priceBundled: 3900, priceDisplay: "$39", bundleDisplay: "$39",
    priceId: "price_1TAFfAQ7FtTiAL4acetUfMuY", icon: Database, color: "150 70% 45%", tier: "CORE",
    edition: "Edition 001 — Sealed Runtime",
    briefing: "One-click disaster recovery for your website, app, or AI system. FAILSAFE generates a complete, portable ZIP backup of your source code, configurations, migrations, and database state — with an AI-readable restore guide so any developer or agent can reconstruct your environment from scratch. Perfect for migrating off Lovable Cloud, Supabase, or any hosted platform to your own infrastructure.",
    capabilities: [
      "One-click full system backup to portable ZIP",
      "Platform migration — transfer off Lovable Cloud to self-hosted",
      "Memory-efficient streaming compression for large codebases",
      "Sequential table export with adaptive retry logic",
      "AI-ready RESTORE.md for automated agent-driven reconstruction",
      "Permanent metadata recording with backup audit trail",
    ],
    threatLevel: "CRITICAL — CONTINUITY OPS", clearance: "LEVEL 7 — RESTRICTED",
    isFeatured: true,
    freeForSubscribers: true,
    longDescription: "FAILSAFE is your insurance policy against catastrophic data loss and provider lock-in. With a single click, it generates a complete, portable ZIP archive of your entire system — all source code, database configurations, migration history, and a full snapshot of your active data tables. The archive includes a detailed INSTALL.md guide written for both humans and AI agents, so reconstruction is as simple as handing the ZIP to your agent and saying 'set this up.' Use it to transfer your project off Lovable Cloud to your own Supabase instance, migrate between hosting providers, create disaster recovery checkpoints, or archive a production state. You're never locked in and never caught without a restore point. Free for all Creator ($29/mo) and above subscribers. $39 one-time for everyone else.",
  },
];

export const getEngineBySlug = (slug: string): Engine | undefined =>
  ENGINES.find((e) => e.slug === slug);

export const TIER_ORDER = { APEX: 0, ELITE: 1, CORE: 2, META: -1 } as const;

export const getEnginesByTier = (tier: Engine["tier"]): Engine[] =>
  ENGINES.filter((e) => e.tier === tier);
