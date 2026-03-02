/**
 * COMPOSABLE ENGINES Catalog
 * Black-boxed Sealed Runtime software — first-class CMPSBL IP.
 * 20 Engines — $199 standalone / $99 bundled with another engine.
 */

import {
  Shield, Ghost, Brain, Eye, Zap, GitBranch, Scale,
  Cog, Sparkles, Radio, Castle, Lock, Globe, Cpu,
  Diamond, Hammer, Network, Fingerprint, Waypoints, FlaskConical,
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
  tier: "APEX" | "ELITE" | "CORE";
  edition: string;
  briefing: string;
  capabilities: string[];
  threatLevel: string;
  clearance: string;
  isSubscription?: boolean;
  subscriptionLabel?: string;
  externalPath?: string;
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
    priceStandalone: 19900, priceBundled: 9900, priceDisplay: "$199", bundleDisplay: "$99",
    priceId: "price_1T6Kz8Q7FtTiAL4aae82w1uD", icon: Shield, color: "0 80% 55%", tier: "APEX",
    edition: "Edition 001 of ∞",
    briefing: "SENTINEL hunts threats before they arrive. Behavioral analysis, IP reputation scoring, prompt injection shielding, and automated incident response — zero configuration.",
    capabilities: ["Behavioral anomaly detection", "Automated incident response", "IP reputation scoring", "Prompt injection shielding", "Real-time threat intelligence", "Zero-config security hardening"],
    threatLevel: "CRITICAL — ACTIVE DEFENSE", clearance: "LEVEL 9 — TOP SECRET",
  },
  {
    slug: "phantom", codename: "PHANTOM", tagline: "Self-Healing Service Mesh",
    priceStandalone: 19900, priceBundled: 9900, priceDisplay: "$199", bundleDisplay: "$99",
    priceId: "price_1T6Kz9Q7FtTiAL4agMtP6pVo", icon: Ghost, color: "280 70% 55%", tier: "APEX",
    edition: "Edition 001 of ∞",
    briefing: "PHANTOM makes downtime impossible. Auto-recovery, circuit breaking, and intelligent failover keep your services alive even when individual nodes fail.",
    capabilities: ["Automatic service recovery", "Circuit breaker orchestration", "Zero-downtime deployments", "Intelligent failover routing", "Health-based load shedding", "Chaos resilience built-in"],
    threatLevel: "HIGH — RESILIENCE OPS", clearance: "LEVEL 8 — CLASSIFIED",
  },
  {
    slug: "nexus", codename: "NEXUS", tagline: "Multi-Model AI Router",
    priceStandalone: 19900, priceBundled: 9900, priceDisplay: "$199", bundleDisplay: "$99",
    priceId: "price_nexus_standalone", icon: Network, color: "160 75% 45%", tier: "APEX",
    edition: "Edition 001 of ∞",
    briefing: "NEXUS routes every AI call to the optimal model in real time. Cost-aware selection, latency-based failover, response quality scoring, and automatic provider rotation — best answer at the best price.",
    capabilities: ["Real-time model selection & routing", "Cost-aware provider optimization", "Latency-based automatic failover", "Response quality scoring & feedback", "Token budget management", "Multi-provider load balancing"],
    threatLevel: "CRITICAL — ROUTING OPS", clearance: "LEVEL 9 — TOP SECRET",
  },
  {
    slug: "prism", codename: "PRISM", tagline: "Knowledge Graph & RAG Pipeline",
    priceStandalone: 19900, priceBundled: 9900, priceDisplay: "$199", bundleDisplay: "$99",
    priceId: "price_prism_standalone", icon: Diamond, color: "270 85% 60%", tier: "APEX",
    edition: "Edition 001 of ∞",
    briefing: "PRISM turns unstructured chaos into structured knowledge. Automatic entity extraction, relationship mapping, and retrieval-augmented generation for grounded, hallucination-resistant answers.",
    capabilities: ["Automatic entity & relationship extraction", "Vector-powered semantic search", "RAG pipeline with source attribution", "Knowledge graph construction & traversal", "Contradiction detection across sources", "Dynamic context window optimization"],
    threatLevel: "HIGH — KNOWLEDGE OPS", clearance: "LEVEL 8 — CLASSIFIED",
  },
  {
    slug: "cortex", codename: "CORTEX", tagline: "Agent Runtime & Orchestration",
    priceStandalone: 19900, priceBundled: 9900, priceDisplay: "$199", bundleDisplay: "$99",
    priceId: "price_1T6KzAQ7FtTiAL4aRuLZ4c6w", icon: Brain, color: "310 70% 55%", tier: "ELITE",
    edition: "Edition 001 of ∞",
    briefing: "CORTEX gives your AI agents a brain. Multi-agent orchestration, task delegation, memory coordination, and cognitive load balancing — agents think together instead of stepping on each other.",
    capabilities: ["Multi-agent task delegation", "Cognitive load balancing", "Shared memory coordination", "Agent competency tracking", "Automatic skill routing", "Collaborative reasoning"],
    threatLevel: "ELEVATED — COGNITIVE OPS", clearance: "LEVEL 7 — RESTRICTED",
  },
  {
    slug: "forge", codename: "FORGE", tagline: "Code Generation & Refactoring",
    priceStandalone: 19900, priceBundled: 9900, priceDisplay: "$199", bundleDisplay: "$99",
    priceId: "price_forge_standalone", icon: Hammer, color: "25 95% 55%", tier: "ELITE",
    edition: "Edition 001 of ∞",
    briefing: "FORGE writes code that ships. Multi-file generation, intelligent refactoring, type-safe transformations, and automated test scaffolding — all inside a sandboxed execution environment with rollback.",
    capabilities: ["Multi-file code generation", "Type-safe AST transformations", "Automated test scaffolding", "Dead code elimination", "Dependency graph analysis", "Sandboxed execution with rollback"],
    threatLevel: "ELEVATED — CODE OPS", clearance: "LEVEL 7 — RESTRICTED",
  },
  {
    slug: "oracle", codename: "ORACLE", tagline: "Real-Time Analytics & Prediction",
    priceStandalone: 19900, priceBundled: 9900, priceDisplay: "$199", bundleDisplay: "$99",
    priceId: "price_1T6KzCQ7FtTiAL4adOEreJQK", icon: Eye, color: "45 90% 50%", tier: "ELITE",
    edition: "Edition 001 of ∞",
    briefing: "ORACLE sees what's coming. Predictive modeling, anomaly detection, and live data intelligence that turns raw signals into actionable foresight. Know before it happens.",
    capabilities: ["Predictive trend modeling", "Real-time anomaly detection", "Live data stream processing", "Automated insight generation", "Pattern recognition at scale", "Forecasting with confidence intervals"],
    threatLevel: "MODERATE — INTELLIGENCE", clearance: "LEVEL 7 — RESTRICTED",
  },
  {
    slug: "vanguard", codename: "VANGUARD", tagline: "Edge Computing & CDN",
    priceStandalone: 19900, priceBundled: 9900, priceDisplay: "$199", bundleDisplay: "$99",
    priceId: "price_1T6KzCQ7FtTiAL4ajzGYKnCm", icon: Zap, color: "185 80% 45%", tier: "ELITE",
    edition: "Edition 001 of ∞",
    briefing: "VANGUARD pushes compute to the edge. Distributed execution, intelligent caching, and sub-millisecond processing at the point of request.",
    capabilities: ["Distributed edge execution", "Intelligent edge caching", "Sub-millisecond processing", "Global request distribution", "Edge-native compute functions", "Automatic geo-routing"],
    threatLevel: "MODERATE — EDGE OPS", clearance: "LEVEL 6 — CONFIDENTIAL",
  },
  {
    slug: "conductor", codename: "CONDUCTOR", tagline: "Data Pipeline Orchestration",
    priceStandalone: 19900, priceBundled: 9900, priceDisplay: "$199", bundleDisplay: "$99",
    priceId: "price_1T6KzEQ7FtTiAL4aK4xjMcxf", icon: GitBranch, color: "145 65% 42%", tier: "ELITE",
    edition: "Edition 001 of ∞",
    briefing: "CONDUCTOR moves data like water. ETL automation, stream processing, and data lineage tracking ensure every byte flows where it needs to go — reliably, traceably, automatically.",
    capabilities: ["Automated ETL pipelines", "Real-time stream processing", "Data lineage tracking", "Schema evolution handling", "Dead letter queue management", "Backpressure-aware processing"],
    threatLevel: "LOW — DATA OPS", clearance: "LEVEL 6 — CONFIDENTIAL",
  },
  {
    slug: "arbiter", codename: "ARBITER", tagline: "API Gateway & Traffic Control",
    priceStandalone: 19900, priceBundled: 9900, priceDisplay: "$199", bundleDisplay: "$99",
    priceId: "price_1T6KzFQ7FtTiAL4aQ6OOL7zm", icon: Scale, color: "210 60% 45%", tier: "ELITE",
    edition: "Edition 001 of ∞",
    briefing: "ARBITER controls the gates. Intelligent request routing, rate limiting, API versioning, and traffic shaping — APIs serve exactly who they should, exactly how fast they should.",
    capabilities: ["Intelligent request routing", "Per-endpoint rate limiting", "API versioning & deprecation", "Traffic shaping & throttling", "Request/response transformation", "Authentication gateway"],
    threatLevel: "MODERATE — ACCESS CONTROL", clearance: "LEVEL 6 — CONFIDENTIAL",
  },
  {
    slug: "automaton", codename: "AUTOMATON", tagline: "Workflow Automation Engine",
    priceStandalone: 19900, priceBundled: 9900, priceDisplay: "$199", bundleDisplay: "$99",
    priceId: "price_1T6KzGQ7FtTiAL4aklAECZFT", icon: Cog, color: "38 90% 50%", tier: "CORE",
    edition: "Edition 001 of ∞",
    briefing: "AUTOMATON turns repetition into reliability. Conditional workflows, scheduled execution, and event-driven automation that handles the boring stuff so your team handles the brilliant stuff.",
    capabilities: ["Visual workflow composition", "Conditional branching logic", "Scheduled task execution", "Event-driven triggers", "Retry & error handling", "Parallel execution paths"],
    threatLevel: "LOW — AUTOMATION", clearance: "LEVEL 5 — STANDARD",
  },
  {
    slug: "catalyst", codename: "CATALYST", tagline: "Event-Driven Architecture",
    priceStandalone: 19900, priceBundled: 9900, priceDisplay: "$199", bundleDisplay: "$99",
    priceId: "price_1T6KzHQ7FtTiAL4aI2vl1Sdn", icon: Sparkles, color: "310 100% 50%", tier: "CORE",
    edition: "Edition 001 of ∞",
    briefing: "CATALYST makes everything reactive. Pub/sub messaging, event sourcing, and CQRS patterns that decouple your services and let them evolve independently.",
    capabilities: ["Pub/sub event messaging", "Event sourcing & replay", "CQRS pattern support", "Service decoupling", "Dead letter handling", "Event schema registry"],
    threatLevel: "LOW — EVENT OPS", clearance: "LEVEL 5 — STANDARD",
  },
  {
    slug: "beacon", codename: "BEACON", tagline: "Observability & Monitoring Stack",
    priceStandalone: 19900, priceBundled: 9900, priceDisplay: "$199", bundleDisplay: "$99",
    priceId: "price_1T6KzIQ7FtTiAL4asDddxKsj", icon: Radio, color: "145 80% 40%", tier: "CORE",
    edition: "Edition 001 of ∞",
    briefing: "BEACON illuminates everything. Metrics, distributed tracing, structured logging, and health monitoring unified into a single pane of glass.",
    capabilities: ["Unified metrics collection", "Distributed request tracing", "Structured log aggregation", "Real-time health dashboards", "Alert & threshold management", "SLA tracking & reporting"],
    threatLevel: "LOW — OBSERVABILITY", clearance: "LEVEL 5 — STANDARD",
  },
  {
    slug: "bastion", codename: "BASTION", tagline: "Intelligent Load Balancing",
    priceStandalone: 19900, priceBundled: 9900, priceDisplay: "$199", bundleDisplay: "$99",
    priceId: "price_1T6KzJQ7FtTiAL4aG3TGxmJP", icon: Castle, color: "200 50% 40%", tier: "CORE",
    edition: "Edition 001 of ∞",
    briefing: "BASTION distributes load like a strategist. Health-aware routing, weighted distribution, and automatic failover that keeps your services responsive under any traffic pattern.",
    capabilities: ["Health-aware traffic routing", "Weighted load distribution", "Automatic failover", "Session affinity support", "Connection pooling", "Capacity-based scaling triggers"],
    threatLevel: "LOW — INFRASTRUCTURE", clearance: "LEVEL 5 — STANDARD",
  },
  {
    slug: "cipher", codename: "CIPHER", tagline: "Distributed Cache System",
    priceStandalone: 19900, priceBundled: 9900, priceDisplay: "$199", bundleDisplay: "$99",
    priceId: "price_1T6KzKQ7FtTiAL4aFM0leS6C", icon: Lock, color: "280 100% 55%", tier: "CORE",
    edition: "Edition 001 of ∞",
    briefing: "CIPHER remembers so your servers don't have to. Distributed caching with intelligent invalidation, cache coherency, and tiered storage that makes every read instant.",
    capabilities: ["Distributed in-memory caching", "Intelligent cache invalidation", "Cache coherency protocols", "Tiered storage (hot/warm/cold)", "TTL & eviction policies", "Cache-aside pattern support"],
    threatLevel: "LOW — PERFORMANCE", clearance: "LEVEL 4 — OPEN",
  },
  {
    slug: "meridian", codename: "MERIDIAN", tagline: "Content Delivery Network",
    priceStandalone: 19900, priceBundled: 9900, priceDisplay: "$199", bundleDisplay: "$99",
    priceId: "price_1T6KzLQ7FtTiAL4aiOAUMvyq", icon: Globe, color: "185 100% 40%", tier: "CORE",
    edition: "Edition 001 of ∞",
    briefing: "MERIDIAN delivers content at the speed of proximity. Global edge distribution, asset optimization, and intelligent routing that puts your content milliseconds from every user.",
    capabilities: ["Global edge distribution", "Automatic asset optimization", "Intelligent geo-routing", "Cache warming & prefetch", "Origin shield protection", "Real-time purge & invalidation"],
    threatLevel: "LOW — DELIVERY", clearance: "LEVEL 4 — OPEN",
  },
];

export const getEngineBySlug = (slug: string): Engine | undefined =>
  ENGINES.find((e) => e.slug === slug);

export const TIER_ORDER = { APEX: 0, ELITE: 1, CORE: 2 } as const;

export const getEnginesByTier = (tier: Engine["tier"]): Engine[] =>
  ENGINES.filter((e) => e.tier === tier);
