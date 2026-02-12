/**
 * Module Registry — Single source of truth for all 21 substrate modules
 * Used by: hub page, detail pages, mega-menu, footer, SEO
 */

import {
  Cpu, Waves, KeyRound, Brain, Languages,
  Shield, Network, Eye, Moon, Plug,
  Server, Accessibility, Wrench, Workflow,
  Database, Send, FileCheck, Fingerprint, Coins, FlaskConical,
  Code2,
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
    description: "The orchestrator of orchestrators — CORTEX coordinates all modules, manages synergy pipelines, and optimizes cross-module workflows.",
    layer: "Orchestrator",
    icon: Workflow,
    color: "fuchsia-500",
    useCaseH1: "AI Meta-Orchestration: Coordinate 20 Modules as One Intelligence",
    heroDescription: "CORTEX is the conductor of the substrate symphony. It doesn't just manage modules — it discovers emergent capabilities from their interactions, creating intelligence greater than the sum of its parts.",
    features: ["Cross-module workflow orchestration", "Synergy pipeline discovery", "Emergent capability detection", "Adaptive resource allocation", "147 pre-built synergy pipelines"],
    highlights: [
      { title: "147 Pre-Built Synergy Pipelines", description: "CORTEX ships with 147 tested cross-module workflows — like 'secure-deploy' (DEFENSE → SYSTEM → VISION) or 'learn-and-optimize' (BRAIN → DREAM → NEXUS). Complex orchestration, zero configuration." },
      { title: "Emergent Capability Detection", description: "CORTEX discovers capabilities that no single module possesses alone. When BRAIN's memory combines with NEXUS's routing and DREAM's optimization, new behaviors emerge that weren't explicitly programmed." },
      { title: "Adaptive Resource Allocation", description: "CORTEX dynamically shifts compute resources between modules based on real-time demand. During high-traffic periods, routing gets priority; during off-peak, DREAM gets more cycles for optimization." },
    ],
    codeSnippet: `import { useCortex } from '@cmpsbl/substrate';\n\nconst { orchestrate, synergies } = useCortex();\nconst result = await orchestrate({\n  goal: 'Analyze and secure new deployment',\n  modules: ['defense', 'system', 'vision']\n});`,
    integrations: ["All 20 modules", "SEBA (self-evolution)", "Atlas Control Plane"],
    useCases: ["Complex multi-step AI workflows", "Autonomous AI operations", "Enterprise AI requiring coordinated intelligence"],
  },

  // ── Infrastructure Layer ──
  {
    slug: "memory",
    name: "MEMORY",
    tagline: "Vector & RAG Orchestration",
    description: "Dedicated vector embeddings, RAG orchestration, external knowledge ingestion, and long-term semantic recall with full memory lifecycle management.",
    layer: "Infrastructure",
    icon: Database,
    color: "sky-500",
    useCaseH1: "Structured Knowledge Retrieval & RAG Orchestration for AI Agents",
    heroDescription: "MEMORY is the substrate's structured knowledge layer — orchestrating vector embeddings, retrieval-augmented generation, and external knowledge pipelines independent of BRAIN's cognitive memory.",
    features: ["Vector embedding management", "RAG pipeline orchestration", "External knowledge ingestion", "Semantic search & recall", "Memory lifecycle management"],
    highlights: [
      { title: "RAG Pipeline Orchestration", description: "End-to-end retrieval-augmented generation with chunking, embedding, indexing, and retrieval — all governed by the substrate's capability system with automatic quality scoring." },
      { title: "Multi-Source Knowledge Ingestion", description: "Ingest from PDFs, APIs, databases, web crawls, and custom sources. MEMORY normalizes everything into a unified vector space with provenance tracking." },
      { title: "Lifecycle-Managed Embeddings", description: "Embeddings aren't static — MEMORY automatically re-indexes stale vectors, prunes low-relevance entries, and promotes high-value knowledge to hot storage tiers." },
    ],
    codeSnippet: `import { useMemoryModule } from '@cmpsbl/substrate';\n\nconst { ingest, search, lifecycle } = useMemoryModule();\nawait ingest({ source: 'docs/', format: 'pdf' });\nconst results = await search('security policy');`,
    integrations: ["BRAIN (cognitive memory)", "NEXUS (embedding models)", "INTEGRATION (data sources)"],
    useCases: ["Enterprise knowledge bases with RAG", "Document Q&A systems", "Multi-source intelligence aggregation"],
  },
  {
    slug: "relay",
    name: "RELAY",
    tagline: "Outbound Effects Hub",
    description: "Centralized hub for outbound webhooks, notifications, side-effects, retry queues, and delivery guarantees with full audit trails.",
    layer: "Infrastructure",
    icon: Send,
    color: "lime-500",
    useCaseH1: "Reliable Outbound Actions: Webhooks, Notifications & Side-Effects",
    heroDescription: "RELAY centralizes all outbound side-effects — webhooks, emails, notifications, and external API calls — with retry queues, delivery guarantees, and tamper-evident audit trails.",
    features: ["Outbound webhook management", "Notification dispatch", "Retry queues with exponential backoff", "Delivery guarantee tracking", "Side-effect audit trails"],
    highlights: [
      { title: "Delivery Guarantees", description: "Every outbound action is tracked from dispatch to delivery. Failed deliveries enter a retry queue with configurable backoff, dead-letter handling, and operator alerting." },
      { title: "Unified Side-Effect Bus", description: "Stop scattering webhook calls across modules. RELAY provides a single, governed channel for all outbound effects — emails, Slack messages, API calls, and custom integrations." },
      { title: "Tamper-Evident Audit Trails", description: "Every outbound action is logged with cryptographic hash chaining. Prove exactly what was sent, when, and to whom — essential for compliance and debugging." },
    ],
    codeSnippet: `import { useRelay } from '@cmpsbl/substrate';\n\nconst { dispatch, queue, deliveries } = useRelay();\nawait dispatch({\n  target: 'https://api.example.com/webhook',\n  payload: { event: 'task.completed' },\n  retries: 3\n});`,
    integrations: ["All modules (outbound effects)", "AUDIT (delivery logging)", "DEFENSE (payload scanning)"],
    useCases: ["Webhook-driven architectures", "Event notification systems", "Compliance-grade delivery tracking"],
  },
  {
    slug: "audit",
    name: "AUDIT",
    tagline: "Immutable Compliance Ledger",
    description: "Append-only event logging with cryptographic hash chaining, compliance-grade traceability, and cross-module event capture for legal defensibility.",
    layer: "Infrastructure",
    icon: FileCheck,
    color: "stone-500",
    useCaseH1: "Tamper-Evident Audit Logging for Enterprise AI Compliance",
    heroDescription: "AUDIT provides an immutable, cryptographically-chained event ledger that captures every significant action across all 20 modules — built for SOC2, GDPR, and legal defensibility.",
    features: ["Append-only event logging", "Cryptographic hash chaining", "Cross-module event capture", "Compliance reporting", "Legal defensibility layer"],
    highlights: [
      { title: "Cryptographic Hash Chaining", description: "Every audit entry is linked to its predecessor via SHA-256 hashing, creating a tamper-evident chain. Any modification to historical records is instantly detectable." },
      { title: "Cross-Module Event Capture", description: "AUDIT listens to all 20 modules via RIPPLE, automatically capturing governance decisions, security events, evolution proposals, and administrative actions without module-level instrumentation." },
      { title: "Compliance-Ready Reports", description: "Generate SOC2, GDPR, and HIPAA-aligned audit reports with a single command. Filter by time range, actor, module, or action type with full chain-of-custody documentation." },
    ],
    codeSnippet: `import { useAuditModule } from '@cmpsbl/substrate';\n\nconst { log, verify, report } = useAuditModule();\nconst integrity = await verify();\n// integrity.valid: true\nconst compliance = await report({ standard: 'SOC2' });`,
    integrations: ["All 20 modules (event capture)", "RELAY (compliance alerts)", "IDENTITY (actor attribution)"],
    useCases: ["SOC2/GDPR compliance programs", "Enterprise audit trail requirements", "Legal defensibility for AI decisions"],
  },
  {
    slug: "identity",
    name: "IDENTITY",
    tagline: "Universal Actor Attribution",
    description: "Manages human, agent, and system identity with persistent signatures, action attribution, cross-system provenance, and identity continuity across agencies.",
    layer: "Infrastructure",
    icon: Fingerprint,
    color: "rose-500",
    useCaseH1: "Universal Identity & Attribution for Humans, Agents, and Systems",
    heroDescription: "IDENTITY answers the fundamental question: 'Who did this?' — providing persistent actor signatures, cross-system provenance, and identity continuity for humans, AI agents, and system processes.",
    features: ["Human/agent/system identity management", "Persistent agent signatures", "Action attribution", "Cross-system provenance", "Identity continuity across agencies"],
    highlights: [
      { title: "Persistent Agent Signatures", description: "Every AI agent gets a cryptographic identity that persists across sessions, deployments, and even agency transfers — enabling true accountability and action attribution." },
      { title: "Universal Actor Attribution", description: "Every action in the substrate is signed by its actor — whether human user, AI agent, or system process. AUDIT uses IDENTITY to tag every log entry with unforgeable attribution." },
      { title: "Cross-Agency Identity Continuity", description: "When agents move between agencies or deployments, their identity, reputation, and competency history travels with them — enabling trust portability across the ecosystem." },
    ],
    codeSnippet: `import { useIdentity } from '@cmpsbl/substrate';\n\nconst { whoami, sign, verify } = useIdentity();\nconst actor = whoami();\n// actor.type: 'human' | 'agent' | 'system'\n// actor.signature: cryptographic proof`,
    integrations: ["AUDIT (actor attribution)", "ACCESS (authentication)", "CORTEX (agent coordination)"],
    useCases: ["Multi-agent accountability systems", "Regulatory compliance with actor tracking", "Cross-organization AI governance"],
  },
  {
    slug: "economy",
    name: "ECONOMY",
    tagline: "Cost Attribution & Budget Engine",
    description: "Real-time cost attribution, budget enforcement, capability usage accounting, token/credit systems, and marketplace-ready pricing signals.",
    layer: "Infrastructure",
    icon: Coins,
    color: "amber-600",
    useCaseH1: "AI Cost Attribution & Budget Enforcement for Sustainable Operations",
    heroDescription: "ECONOMY tracks every token, every compute cycle, every API call — attributing costs to modules, users, and capabilities with real-time budget enforcement and marketplace pricing signals.",
    features: ["Real-time cost attribution", "Budget enforcement", "Capability usage accounting", "Token/credit systems", "Marketplace pricing signals"],
    highlights: [
      { title: "Per-Module Cost Attribution", description: "Know exactly what each module costs in real-time. ECONOMY tracks token consumption, compute time, and API spend per module, per user, per capability — enabling data-driven optimization." },
      { title: "Budget Enforcement with Alerts", description: "Set spending limits at the module, user, or system level. ECONOMY alerts at configurable thresholds (80%, 90%, 100%) and can automatically throttle or block over-budget operations." },
      { title: "Marketplace Pricing Signals", description: "ECONOMY provides real-time cost data that feeds into the capability marketplace — enabling dynamic pricing, usage-based billing, and accurate margin calculations for capability resellers." },
    ],
    codeSnippet: `import { useEconomy } from '@cmpsbl/substrate';\n\nconst { costs, budget, forecast } = useEconomy();\nconst report = await costs({ period: 'today', groupBy: 'module' });\nconst remaining = budget.remaining();`,
    integrations: ["NEXUS (AI spend tracking)", "ACCESS (billing)", "VISION (cost dashboards)", "All modules (usage metering)"],
    useCases: ["Enterprise AI cost management", "Usage-based billing platforms", "Multi-tenant cost allocation"],
  },
  {
    slug: "sandbox",
    name: "SANDBOX",
    tagline: "Isolated Execution Environments",
    description: "Provides isolated execution environments for speculative runs, untrusted code, evolution testing, and user experimentation with full containment guarantees.",
    layer: "Infrastructure",
    icon: FlaskConical,
    color: "cyan-600",
    useCaseH1: "Safe Execution Environments for AI Experimentation & Evolution",
    heroDescription: "SANDBOX provides hermetically sealed execution environments where untrusted code, speculative evolution proposals, and user experiments run safely — with zero blast radius to production systems.",
    features: ["Isolated execution environments", "Speculative run support", "Untrusted code containment", "Evolution testing zones", "User experimentation sandboxes"],
    highlights: [
      { title: "Zero Blast Radius Isolation", description: "Every sandbox is a hermetically sealed environment. Memory, state, and side-effects are fully contained — a runaway experiment cannot affect production, other sandboxes, or the substrate core." },
      { title: "Evolution Testing Zones", description: "MODERNIZER and SEBA use SANDBOX to test architectural proposals before production application. Run shadow deployments, measure impact, and validate changes with zero production risk." },
      { title: "User Experimentation Containment", description: "Let users experiment with dangerous configurations, custom code, and novel workflows in a safe sandbox. If it breaks, only the sandbox is affected — reset and try again." },
    ],
    codeSnippet: `import { useSandbox } from '@cmpsbl/substrate';\n\nconst { create, execute, teardown } = useSandbox();\nconst env = await create({ ttl: '30m' });\nconst result = await execute(env.id, untrustedCode);\nawait teardown(env.id);`,
    integrations: ["MODERNIZER (evolution testing)", "DREAM (speculative runs)", "DEFENSE (threat containment)"],
    useCases: ["Safe AI evolution testing", "User experimentation platforms", "Untrusted code execution"],
  },

  // ── Orchestrator Layer (continued) ──
  {
    slug: "encode",
    name: "ENCODE",
    tagline: "Code Execution & Generation Intelligence",
    description: "The substrate's code execution engine — receives structured task packets from DECODE, generates governed code artifacts with BRAIN recall/writeback, and learns through CLM.",
    layer: "Orchestrator",
    icon: Code2,
    color: "yellow-500",
    useCaseH1: "AI Code Generation Engine with System-Aware Execution",
    heroDescription: "ENCODE is the substrate's code execution intelligence — receiving structured intent packets from DECODE, recalling context from BRAIN, and producing governed code artifacts with full safety gates.",
    features: ["Structured task packets from DECODE", "BRAIN recall & writeback pipeline", "CLM learning cycles", "Governed proposal output", "Multi-surface code generation (code, UI, docs, DB, edge, tests)"],
    highlights: [
      { title: "DECODE Intent Routing", description: "ENCODE never receives raw user input — DECODE normalizes human intent into structured task packets with context refs, acceptance criteria, and safety constraints. Clean separation of concerns." },
      { title: "BRAIN Bidirectional Pipeline", description: "Before execution, ENCODE recalls prior decisions, code context, and artifacts from BRAIN. After execution, it writes back learnings, summaries, and completion receipts — building institutional memory." },
      { title: "CLM Self-Improvement", description: "ENCODE runs its own Constant Learning Mode cycles — analyzing success rates, failure patterns, and code quality metrics to continuously improve its execution capabilities." },
    ],
    codeSnippet: `import { useEncode } from '@cmpsbl/substrate';\n\nconst { queue, receipts, status } = useEncode();\n// Tasks arrive from DECODE as structured packets\n// ENCODE recalls from BRAIN, executes, writes back`,
    integrations: ["DECODE (intent routing)", "BRAIN (recall/writeback)", "CLM (self-improvement)", "SANDBOX (safe execution)"],
    useCases: ["Autonomous code generation with safety gates", "System-aware code modifications", "Governed AI-powered development"],
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
