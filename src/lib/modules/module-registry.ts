/**
 * Module Registry — Single source of truth for all 14 substrate modules
 * Used by: hub page, detail pages, mega-menu, footer, SEO
 */

import {
  Cpu, Waves, KeyRound, Brain, Languages,
  Shield, Network, Eye, Moon, Plug,
  Server, Accessibility, Wrench, Workflow,
  Database, Send, FileCheck, Fingerprint, Coins, FlaskConical,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ModuleHighlight {
  title: string;
  description: string;
}

export interface ModuleInfo {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  layer: 'Kernel' | 'Cognitive' | 'Operational' | 'Administrative' | 'Orchestrator' | 'Infrastructure';
  icon: LucideIcon;
  color: string;
  useCaseH1: string;
  heroDescription: string;
  features: string[];
  highlights: ModuleHighlight[];
  codeSnippet: string;
  integrations: string[];
  useCases: string[];
}

export const MODULE_REGISTRY: ModuleInfo[] = [
  // ── Kernel Layer ──
  {
    slug: "core",
    name: "CORE",
    tagline: "Foundation Runtime",
    description: "The boot kernel that initializes all substrate modules, manages lifecycle, and provides the event bus for inter-module communication.",
    layer: "Kernel",
    icon: Cpu,
    color: "blue-500",
    useCaseH1: "Self-Bootstrapping AI Runtime for Autonomous Systems",
    heroDescription: "CORE is the heartbeat of the substrate — a self-initializing runtime that boots 14 modules in dependency order, manages health checks, and provides the event bus that connects everything.",
    features: ["Dependency-ordered boot sequence", "Health monitoring & auto-recovery", "Event bus (pub/sub) for inter-module messaging", "Hot-reload without downtime", "Module lifecycle management"],
    highlights: [
      { title: "Zero-Downtime Hot Reload", description: "Swap module versions in production without dropping a single request. CORE manages graceful handoffs across all 14 modules simultaneously, keeping your AI stack online 24/7." },
      { title: "Self-Healing Boot Sequence", description: "If a module fails during startup, CORE automatically retries with exponential backoff, re-orders dependencies, and boots degraded-mode alternatives — no human intervention required." },
      { title: "Sub-10ms Event Bus", description: "The built-in publish/subscribe event bus delivers inter-module messages in under 10 milliseconds, enabling real-time coordination across memory, security, routing, and orchestration layers." },
    ],
    codeSnippet: `import { useCore } from '@cmpsbl/substrate';\n\nconst { status, modules, reboot } = useCore();\n// status: 'booting' | 'ready' | 'degraded'\n// modules: Map<string, ModuleStatus>`,
    integrations: ["All 14 modules depend on CORE", "Atlas Control Plane", "SEBA Evolution Agent"],
    useCases: ["Enterprise AI platforms needing reliable orchestration", "Multi-agent systems requiring coordinated boot", "Mission-critical deployments with zero-downtime updates"],
  },
  {
    slug: "ripple",
    name: "RIPPLE",
    tagline: "Cascade Event Network",
    description: "Propagates state changes across modules with intelligent fan-out, deduplication, and priority routing.",
    layer: "Kernel",
    icon: Waves,
    color: "cyan-500",
    useCaseH1: "Real-Time Event Propagation for AI Agent Networks",
    heroDescription: "RIPPLE ensures every module stays synchronized. When one module learns something, RIPPLE cascades that knowledge to every dependent system — instantly and reliably.",
    features: ["Intelligent event fan-out", "Priority-based routing", "Deduplication & idempotency", "Backpressure handling", "Cross-module state sync"],
    highlights: [
      { title: "Cascade Intelligence", description: "When BRAIN learns something new, RIPPLE doesn't just broadcast it — it intelligently routes the update only to modules that need it, with priority ordering based on dependency graphs." },
      { title: "Built-In Circuit Breakers", description: "If a subscriber fails, RIPPLE automatically opens a circuit breaker, queues messages for retry, and prevents cascade failures from propagating through the entire substrate." },
      { title: "Publish Latency Under 5ms", description: "Events propagate across the entire module network in under 5 milliseconds, enabling real-time AI agent coordination that feels instantaneous to end users." },
    ],
    codeSnippet: `import { useRipple } from '@cmpsbl/substrate';\n\nconst { emit, subscribe } = useRipple();\nawait emit('brain.learned', { topic: 'security' });\n// All subscribers notified in <5ms`,
    integrations: ["CORE (event bus)", "BRAIN (knowledge propagation)", "DEFENSE (threat alerts)"],
    useCases: ["Multi-agent coordination requiring real-time sync", "Event-driven architectures with complex dependencies", "Distributed AI systems needing consistent state"],
  },
  {
    slug: "access",
    name: "ACCESS",
    tagline: "Identity & Metering Gateway",
    description: "Manages API keys, rate limiting, usage metering, entitlements, and subscription billing for the substrate.",
    layer: "Kernel",
    icon: KeyRound,
    color: "amber-500",
    useCaseH1: "API Key Management & Usage Metering for AI Platforms",
    heroDescription: "ACCESS is the gatekeeper — handling authentication, rate limiting, and usage tracking so you can monetize your AI capabilities with precision.",
    features: ["SHA-256 hashed API keys", "Per-key rate limiting", "Token & cost metering", "Subscription management", "Scope-based access control"],
    highlights: [
      { title: "Granular Scope Hierarchy", description: "Define permissions like brain:read, nexus:*, or system:admin — ACCESS enforces scope-based access control at every API boundary, so each key only accesses what it should." },
      { title: "Real-Time Usage Metering", description: "Track token consumption, compute time, and cost per API key in real-time. Set quotas, receive alerts at thresholds, and generate usage reports for billing or internal chargeback." },
      { title: "Stripe-Native Billing Integration", description: "ACCESS connects directly to Stripe for subscription management, automatic invoicing, and usage-based billing — turning your AI capabilities into a monetizable API product." },
    ],
    codeSnippet: `import { useAccess } from '@cmpsbl/substrate';\n\nconst { createKey, usage, entitlements } = useAccess();\nconst key = await createKey({\n  scopes: ['brain:read', 'nexus:*'],\n  rateLimit: { perMinute: 60 }\n});`,
    integrations: ["Stripe (billing)", "All modules (auth enforcement)", "SYSTEM (audit logs)"],
    useCases: ["SaaS platforms needing API monetization", "Enterprise AI with role-based access", "Multi-tenant deployments with usage quotas"],
  },

  // ── Cognitive Layer ──
  {
    slug: "brain",
    name: "BRAIN",
    tagline: "Adaptive Memory Engine",
    description: "Persistent, contextual memory that learns from every interaction and adapts behavior over time.",
    layer: "Cognitive",
    icon: Brain,
    color: "purple-500",
    useCaseH1: "Persistent Memory for AI Agents That Actually Learn",
    heroDescription: "BRAIN gives your AI agents long-term memory. Not just storage — adaptive, contextual memory that evolves with every interaction, making your agents smarter over time.",
    features: ["Persistent cross-session memory", "Contextual recall with relevance scoring", "Automatic knowledge consolidation", "Memory decay & prioritization", "SDK: withPersistentMemory wrapper"],
    highlights: [
      { title: "Memory That Actually Learns", description: "Unlike simple vector stores, BRAIN uses relevance scoring and automatic consolidation to build a knowledge graph that evolves. Frequently accessed memories strengthen; irrelevant ones gracefully decay." },
      { title: "One-Line Agent Memory", description: "Wrap any AI agent with withPersistentMemory() and it instantly gains cross-session memory. Works with LangChain, OpenAI Assistants, or any custom agent framework — zero architecture changes." },
      { title: "Namespace Isolation", description: "Run thousands of independent memory spaces in a single substrate instance. Each namespace maintains its own knowledge graph, retention policies, and access controls — perfect for multi-tenant SaaS." },
    ],
    codeSnippet: `import { withPersistentMemory } from '@cmpsbl/substrate';\n\nconst agent = withPersistentMemory(myAgent, {\n  namespace: 'support-bot',\n  retentionDays: 90\n});\n// Agent now remembers across sessions`,
    integrations: ["LangChain", "OpenAI Assistants", "Any agent framework"],
    useCases: ["Customer support bots that remember context", "Personal AI assistants with long-term memory", "Research agents that build knowledge over time"],
  },
  {
    slug: "decode",
    name: "DECODE",
    tagline: "Personality & Interpretation Engine",
    description: "Configurable personality layer that shapes how your AI communicates — tone, style, formality, and domain expertise.",
    layer: "Cognitive",
    icon: Languages,
    color: "pink-500",
    useCaseH1: "Configurable AI Personality Engine for Brand-Aligned Responses",
    heroDescription: "DECODE transforms generic AI into your brand voice. Configure tone, formality, expertise level, and communication style — your AI, your personality.",
    features: ["Personality profiles (tone, formality, humor)", "Domain-specific vocabulary", "Multi-language personality adaptation", "A/B testable response styles", "Real-time personality switching"],
    highlights: [
      { title: "Brand Voice as Code", description: "Define your AI's personality in a structured profile — tone, humor level, formality, expertise domain — and DECODE ensures every response aligns with your brand identity across all channels." },
      { title: "A/B Testable Personalities", description: "Run multiple personality variants simultaneously and measure which one drives better engagement, resolution rates, or user satisfaction. Data-driven personality optimization." },
      { title: "Intent-Aware Interpretation", description: "DECODE doesn't just parse text — it classifies intent (memory, query, command, configuration) and routes to the correct handler, turning natural language into structured substrate operations." },
    ],
    codeSnippet: `import { useDecode } from '@cmpsbl/substrate';\n\nconst { setPersonality, interpret } = useDecode();\nsetPersonality({\n  tone: 'professional',\n  humor: 0.3,\n  expertise: 'enterprise-security'\n});`,
    integrations: ["BRAIN (contextual adaptation)", "NEXUS (response routing)", "Any LLM provider"],
    useCases: ["Enterprise chatbots with brand-consistent voice", "Multi-persona AI assistants", "Localized AI with cultural sensitivity"],
  },

  // ── Operational Layer ──
  {
    slug: "defense",
    name: "DEFENSE",
    tagline: "AI Security & Threat Intelligence",
    description: "Real-time threat detection, prompt injection defense, and automated security response for AI systems.",
    layer: "Operational",
    icon: Shield,
    color: "red-500",
    useCaseH1: "AI Security Platform: Prompt Injection Defense & Threat Detection",
    heroDescription: "DEFENSE protects your AI from the threats traditional security can't see — prompt injection, data exfiltration, adversarial inputs, and model manipulation.",
    features: ["Prompt injection detection", "Adversarial input filtering", "Real-time threat scoring", "Automated incident response", "REFLEX monitor for zero-day threats"],
    highlights: [
      { title: "REFLEX Zero-Day Monitor", description: "DEFENSE includes REFLEX — a continuously learning threat monitor that detects novel attack patterns before they're publicly known. It watches every input for anomalies traditional security tools miss." },
      { title: "Multi-Layer Prompt Injection Defense", description: "Three-stage filtering catches direct injection, indirect injection via retrieved context, and sophisticated multi-turn manipulation attempts. Each stage uses different detection strategies for defense-in-depth." },
      { title: "Automated Incident Response", description: "When a threat is detected, DEFENSE doesn't just alert — it automatically quarantines the request, notifies operators via RIPPLE, logs the full attack chain, and updates its threat model in real-time." },
    ],
    codeSnippet: `import { useDefense } from '@cmpsbl/substrate';\n\nconst { scan, threats, reflexStatus } = useDefense();\nconst result = await scan(userInput);\n// result.safe: boolean\n// result.threats: ThreatVector[]`,
    integrations: ["OWASP Top 10 for LLMs", "BRAIN (threat learning)", "SYSTEM (audit trail)"],
    useCases: ["Securing production AI endpoints", "Compliance-regulated AI deployments", "Enterprise AI with strict data governance"],
  },
  {
    slug: "nexus",
    name: "NEXUS",
    tagline: "Intelligent AI Router",
    description: "Routes requests to the optimal AI provider based on task complexity, cost, latency, and capability requirements.",
    layer: "Operational",
    icon: Network,
    color: "green-500",
    useCaseH1: "Intelligent AI Model Routing for Cost-Optimized Performance",
    heroDescription: "NEXUS picks the right AI model for every request. Simple question? Route to a fast, cheap model. Complex reasoning? Escalate to GPT-5. Automatic, intelligent, cost-optimized.",
    features: ["Multi-provider routing (OpenAI, Google, Anthropic)", "Cost-performance optimization", "Automatic fallback chains", "Latency-aware routing", "Task complexity scoring"],
    highlights: [
      { title: "Budget-Aware Routing", description: "Set a per-request budget (e.g., max $0.05) and NEXUS automatically selects the best model that fits your cost constraint while maximizing quality. Stop overpaying for simple tasks." },
      { title: "Automatic Failover Chains", description: "If your primary model provider goes down, NEXUS transparently reroutes to the next best alternative with zero code changes. Your users never notice an outage." },
      { title: "Task Complexity Scoring", description: "NEXUS analyzes each request's complexity before routing — simple lookups go to fast, cheap models; complex reasoning escalates to frontier models. Intelligence-aware, not random." },
    ],
    codeSnippet: `import { useNexus } from '@cmpsbl/substrate';\n\nconst { route, providers } = useNexus();\nconst response = await route({\n  task: 'Analyze this contract',\n  priority: 'accuracy',\n  budget: 0.05 // max $0.05\n});`,
    integrations: ["OpenAI", "Google Gemini", "Anthropic Claude", "Local models"],
    useCases: ["Reducing AI costs with intelligent model routing", "Multi-model architectures", "High-availability AI with automatic failover"],
  },
  {
    slug: "vision",
    name: "VISION",
    tagline: "Unified Observability Dashboard",
    description: "Real-time monitoring, analytics, and visualization for every module in the substrate.",
    layer: "Operational",
    icon: Eye,
    color: "indigo-500",
    useCaseH1: "AI Observability Dashboard: Monitor Every Module in Real-Time",
    heroDescription: "VISION gives you X-ray vision into your AI stack. Every module, every request, every decision — visualized in real-time with actionable insights.",
    features: ["Real-time module health monitoring", "Request tracing across modules", "Cost & performance analytics", "Custom alert rules", "Exportable reports"],
    highlights: [
      { title: "End-to-End Request Tracing", description: "Follow any request from user input through DECODE, NEXUS routing, BRAIN memory lookup, DEFENSE scanning, and back — every module hop is traced with latency and cost attribution." },
      { title: "AI Cost Attribution Dashboard", description: "See exactly where your AI spend goes — broken down by module, provider, model, and even individual API key. Identify cost optimization opportunities you didn't know existed." },
      { title: "Predictive Health Alerts", description: "VISION doesn't wait for failures — it detects degradation trends and alerts you before a module hits critical status, giving you time to intervene proactively." },
    ],
    codeSnippet: `import { useVision } from '@cmpsbl/substrate';\n\nconst { metrics, health, alerts } = useVision();\n// metrics.totalRequests, metrics.avgLatency\n// health: Record<ModuleName, HealthStatus>`,
    integrations: ["All 14 modules", "External APM tools", "Webhook alerts"],
    useCases: ["DevOps teams monitoring AI infrastructure", "Executive dashboards for AI ROI", "Debugging complex multi-module interactions"],
  },
  {
    slug: "dream",
    name: "DREAM",
    tagline: "Autonomous Reflection & Optimization",
    description: "Off-peak autonomous processing that analyzes patterns, consolidates learning, and optimizes system performance — while you sleep.",
    layer: "Operational",
    icon: Moon,
    color: "violet-500",
    useCaseH1: "Autonomous AI Optimization: Systems That Improve While You Sleep",
    heroDescription: "DREAM runs when your users don't — analyzing patterns, consolidating memories, and optimizing performance. Your AI literally gets smarter overnight, at zero compute cost.",
    features: ["Off-peak pattern analysis", "Autonomous memory consolidation", "Performance auto-optimization", "Dream pool for shared insights", "Low-cost off-peak improvement cycles"],
    highlights: [
      { title: "Autonomous Memory Consolidation", description: "During off-peak hours, DREAM reviews the day's interactions — strengthening important memories, pruning noise, and discovering patterns humans missed. Your AI wakes up smarter every morning." },
      { title: "Dream Pool Collective Intelligence", description: "Opt-in shared insight pooling lets multiple substrate instances learn from each other's experiences. A breakthrough in one deployment benefits the entire ecosystem — privacy-preserving federated learning." },
      { title: "Autonomous Performance Tuning", description: "DREAM analyzes routing patterns, cache hit rates, and response quality overnight — then automatically adjusts NEXUS routing weights, BRAIN retention policies, and DEFENSE thresholds for next-day improvement." },
    ],
    codeSnippet: `import { useDream } from '@cmpsbl/substrate';\n\nconst { schedule, insights, lastCycle } = useDream();\n// insights: DreamInsight[]\n// lastCycle.improvements: number`,
    integrations: ["BRAIN (memory consolidation)", "VISION (performance data)", "RIPPLE (insight propagation)"],
    useCases: ["AI systems that continuously self-improve", "Cost-conscious deployments maximizing off-peak hours", "Research platforms needing autonomous analysis"],
  },
  {
    slug: "integration",
    name: "INTEGRATION",
    tagline: "Universal Adapter Bridge",
    description: "Connect the substrate to any external system — CRMs, databases, APIs, webhooks, and third-party services.",
    layer: "Operational",
    icon: Plug,
    color: "orange-500",
    useCaseH1: "Universal AI Integration Layer: Connect Any System in Minutes",
    heroDescription: "INTEGRATION bridges the substrate to your existing stack. Pre-built adapters for popular services, plus a universal connector for anything custom.",
    features: ["Pre-built adapters (Salesforce, HubSpot, Slack)", "Universal REST/GraphQL connector", "Webhook management", "Data transformation pipelines", "Retry & circuit breaker patterns"],
    highlights: [
      { title: "35+ Pre-Built Adapters", description: "Connect to Salesforce, HubSpot, Slack, Jira, PostgreSQL, MongoDB, and dozens more with zero custom code. Each adapter handles authentication, pagination, and error recovery automatically." },
      { title: "Bidirectional Data Sync", description: "INTEGRATION doesn't just read — it writes back. Keep your CRM, database, and AI memory in perfect sync with configurable conflict resolution and change-detection triggers." },
      { title: "Built-In Resilience Patterns", description: "Every adapter includes automatic retry with exponential backoff, circuit breakers to prevent cascade failures, and dead-letter queues for requests that can't be delivered — enterprise-grade reliability out of the box." },
    ],
    codeSnippet: `import { useIntegration } from '@cmpsbl/substrate';\n\nconst { connect, adapters } = useIntegration();\nawait connect('salesforce', {\n  credentials: vault.get('sf_token'),\n  sync: 'bidirectional'\n});`,
    integrations: ["35+ pre-built adapters", "Custom REST/GraphQL", "Webhook endpoints"],
    useCases: ["Enterprise AI needing CRM integration", "Data pipeline orchestration", "Legacy system modernization with AI"],
  },

  // ── Administrative Layer ──
  {
    slug: "system",
    name: "SYSTEM",
    tagline: "Production Operations Control",
    description: "Deployment management, environment configuration, audit logging, and operational controls for production substrate instances.",
    layer: "Administrative",
    icon: Server,
    color: "slate-500",
    useCaseH1: "Production AI Operations: Deploy, Monitor, and Scale with Confidence",
    heroDescription: "SYSTEM handles the operational reality of running AI in production — deployments, rollbacks, environment management, and comprehensive audit logging.",
    features: ["Blue/green deployments", "Environment management", "Comprehensive audit logging", "Configuration management", "Automated rollbacks"],
    highlights: [
      { title: "SOC2-Ready Audit Logging", description: "Every configuration change, deployment, and system event is logged with immutable timestamps, actor identification, and change deltas — ready for compliance audits without additional tooling." },
      { title: "Blue/Green Zero-Risk Deploys", description: "Deploy new substrate versions alongside the current one, validate with health checks, then switch traffic atomically. If anything goes wrong, rollback is a single command." },
      { title: "Multi-Environment Management", description: "Manage dev, staging, and production substrate instances from a single control plane. Promote configurations between environments with diff previews and approval workflows." },
    ],
    codeSnippet: `import { useSystem } from '@cmpsbl/substrate';\n\nconst { deploy, rollback, audit } = useSystem();\nawait deploy({\n  version: '8.5.0',\n  strategy: 'blue-green',\n  healthCheck: true\n});`,
    integrations: ["CI/CD pipelines", "Cloud providers", "Monitoring tools"],
    useCases: ["Enterprise AI requiring SOC2 audit trails", "Multi-environment AI deployments", "Regulated industries needing deployment controls"],
  },
  {
    slug: "inclusive",
    name: "INCLUSIVE",
    tagline: "AI Accessibility & Compliance",
    description: "Automated accessibility scanning, WCAG compliance checking, and AI-powered fixes for web applications.",
    layer: "Administrative",
    icon: Accessibility,
    color: "emerald-500",
    useCaseH1: "AI-Powered Accessibility: WCAG Compliance Scanning & Auto-Fix",
    heroDescription: "INCLUSIVE makes accessibility automatic. Scan any website for WCAG violations, get AI-powered fix suggestions, and ensure your digital products work for everyone.",
    features: ["WCAG 2.2 AA/AAA scanning", "AI-powered fix suggestions", "Continuous monitoring", "Compliance reporting", "One-click remediation"],
    highlights: [
      { title: "AI-Powered Fix Suggestions", description: "INCLUSIVE doesn't just find accessibility violations — it uses AI to generate specific code fixes for each issue, with before/after previews and one-click application." },
      { title: "WCAG 2.2 AA & AAA Coverage", description: "Full coverage of the latest Web Content Accessibility Guidelines including the newest 2.2 criteria. Scan any URL and get a compliance score with actionable violation details." },
      { title: "Continuous Monitoring Mode", description: "Set up automated scans on a schedule and get alerted when new accessibility regressions appear. Catch issues before they reach production users — shift-left accessibility." },
    ],
    codeSnippet: `import { useInclusive } from '@cmpsbl/substrate';\n\nconst { scan, fixes, score } = useInclusive();\nconst report = await scan('https://example.com');\n// report.score: 0-100\n// report.violations: A11yViolation[]`,
    integrations: ["WordPress", "React/Next.js", "Any web framework"],
    useCases: ["Enterprise WCAG compliance programs", "Agency accessibility auditing", "Continuous accessibility monitoring"],
  },
  {
    slug: "modernizer",
    name: "MODERNIZER",
    tagline: "Architecture Evolution Engine",
    description: "Analyzes legacy code and architectures, recommends modernization paths, and generates migration plans.",
    layer: "Administrative",
    icon: Wrench,
    color: "teal-500",
    useCaseH1: "AI-Driven Legacy Modernization: Analyze, Plan, and Migrate",
    heroDescription: "MODERNIZER scans your legacy systems and generates actionable modernization roadmaps — from monolith to microservices, from legacy to cloud-native.",
    features: ["Legacy code analysis", "Architecture recommendations", "Migration plan generation", "Risk assessment", "Incremental migration support"],
    highlights: [
      { title: "AI-Powered Architecture Analysis", description: "MODERNIZER scans your entire codebase and generates architecture diagrams, dependency maps, and technical debt scores — giving you a clear picture of where you are before planning where to go." },
      { title: "Risk-Scored Migration Roadmaps", description: "Every modernization recommendation comes with a risk score, estimated effort, and business impact assessment. Prioritize migrations by ROI, not guesswork." },
      { title: "Incremental Migration Support", description: "Modernize at your own pace with strangler-fig pattern support. MODERNIZER helps you extract services one at a time, validating each step before proceeding to the next." },
    ],
    codeSnippet: `import { useModernizer } from '@cmpsbl/substrate';\n\nconst { analyze, plan } = useModernizer();\nconst assessment = await analyze({\n  repo: 'github.com/org/legacy-app',\n  target: 'cloud-native'\n});`,
    integrations: ["GitHub/GitLab", "Cloud providers", "CI/CD systems"],
    useCases: ["Enterprise legacy modernization", "Technical debt reduction", "Cloud migration planning"],
  },

  // ── Orchestrator Layer ──
  {
    slug: "cortex",
    name: "CORTEX",
    tagline: "Meta-Orchestration Intelligence",
    description: "The orchestrator of orchestrators — CORTEX coordinates all 14 modules, manages synergy pipelines, and optimizes cross-module workflows.",
    layer: "Orchestrator",
    icon: Workflow,
    color: "fuchsia-500",
    useCaseH1: "AI Meta-Orchestration: Coordinate 14 Modules as One Intelligence",
    heroDescription: "CORTEX is the conductor of the substrate symphony. It doesn't just manage modules — it discovers emergent capabilities from their interactions, creating intelligence greater than the sum of its parts.",
    features: ["Cross-module workflow orchestration", "Synergy pipeline discovery", "Emergent capability detection", "Adaptive resource allocation", "147 pre-built synergy pipelines"],
    highlights: [
      { title: "147 Pre-Built Synergy Pipelines", description: "CORTEX ships with 147 tested cross-module workflows — like 'secure-deploy' (DEFENSE → SYSTEM → VISION) or 'learn-and-optimize' (BRAIN → DREAM → NEXUS). Complex orchestration, zero configuration." },
      { title: "Emergent Capability Detection", description: "CORTEX discovers capabilities that no single module possesses alone. When BRAIN's memory combines with NEXUS's routing and DREAM's optimization, new behaviors emerge that weren't explicitly programmed." },
      { title: "Adaptive Resource Allocation", description: "CORTEX dynamically shifts compute resources between modules based on real-time demand. During high-traffic periods, routing gets priority; during off-peak, DREAM gets more cycles for optimization." },
    ],
    codeSnippet: `import { useCortex } from '@cmpsbl/substrate';\n\nconst { orchestrate, synergies } = useCortex();\nconst result = await orchestrate({\n  goal: 'Analyze and secure new deployment',\n  modules: ['defense', 'system', 'vision']\n});`,
    integrations: ["All 14 modules", "SEBA (self-evolution)", "Atlas Control Plane"],
    useCases: ["Complex multi-step AI workflows", "Autonomous AI operations", "Enterprise AI requiring coordinated intelligence"],
  },
];

// Helpers
export const LAYERS = ['Kernel', 'Cognitive', 'Operational', 'Administrative', 'Orchestrator', 'Infrastructure'] as const;

export const LAYER_COLORS: Record<string, string> = {
  Kernel: 'from-blue-500/20 to-cyan-500/20',
  Cognitive: 'from-purple-500/20 to-pink-500/20',
  Operational: 'from-green-500/20 to-orange-500/20',
  Administrative: 'from-slate-500/20 to-teal-500/20',
  Orchestrator: 'from-fuchsia-500/20 to-violet-500/20',
  Infrastructure: 'from-yellow-500/20 to-amber-500/20',
};

export function getModulesByLayer(layer: string): ModuleInfo[] {
  return MODULE_REGISTRY.filter(m => m.layer === layer);
}

export function getModuleBySlug(slug: string): ModuleInfo | undefined {
  return MODULE_REGISTRY.find(m => m.slug === slug);
}
