/**
 * Module Registry — Single source of truth for all 14 substrate modules
 * Used by: hub page, detail pages, mega-menu, footer, SEO
 */

import {
  Cpu, Waves, KeyRound, Brain, Languages,
  Shield, Network, Eye, Moon, Plug,
  Server, Accessibility, Wrench, Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ModuleInfo {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  layer: 'Kernel' | 'Cognitive' | 'Operational' | 'Administrative' | 'Orchestrator';
  icon: LucideIcon;
  color: string; // tailwind color class suffix e.g. "blue-500"
  useCaseH1: string; // SEO: intent-driven H1
  heroDescription: string;
  features: string[];
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
    codeSnippet: `import { useNexus } from '@cmpsbl/substrate';\n\nconst { route, providers } = useNexus();\nconst response = await route({\n  task: 'Analyze this contract',\n  priority: 'accuracy',\n  budget: 0.05 // max $0.05\n});`,
    integrations: ["OpenAI", "Google Gemini", "Anthropic Claude", "Local models"],
    useCases: ["Reducing AI costs by 40-60% with smart routing", "Multi-model architectures", "High-availability AI with automatic failover"],
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
    features: ["Off-peak pattern analysis", "Memory consolidation (SimNap)", "Performance auto-optimization", "Dream pool for shared insights", "Zero-cost improvement cycles"],
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
    codeSnippet: `import { useCortex } from '@cmpsbl/substrate';\n\nconst { orchestrate, synergies } = useCortex();\nconst result = await orchestrate({\n  goal: 'Analyze and secure new deployment',\n  modules: ['defense', 'system', 'vision']\n});`,
    integrations: ["All 14 modules", "SEBA (self-evolution)", "Atlas Control Plane"],
    useCases: ["Complex multi-step AI workflows", "Autonomous AI operations", "Enterprise AI requiring coordinated intelligence"],
  },
];

// Helpers
export const LAYERS = ['Kernel', 'Cognitive', 'Operational', 'Administrative', 'Orchestrator'] as const;

export const LAYER_COLORS: Record<string, string> = {
  Kernel: 'from-blue-500/20 to-cyan-500/20',
  Cognitive: 'from-purple-500/20 to-pink-500/20',
  Operational: 'from-green-500/20 to-orange-500/20',
  Administrative: 'from-slate-500/20 to-teal-500/20',
  Orchestrator: 'from-fuchsia-500/20 to-violet-500/20',
};

export function getModulesByLayer(layer: string): ModuleInfo[] {
  return MODULE_REGISTRY.filter(m => m.layer === layer);
}

export function getModuleBySlug(slug: string): ModuleInfo | undefined {
  return MODULE_REGISTRY.find(m => m.slug === slug);
}
