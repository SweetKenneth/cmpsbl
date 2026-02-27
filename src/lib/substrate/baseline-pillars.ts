/**
 * Baseline Capability Pillars
 * Public-facing abstraction of internal capabilities into 10 high-level clusters.
 * Internal registry remains unchanged — this is a presentation layer only.
 */

export interface BaselinePillar {
  id: string;
  name: string;
  icon: string; // lucide icon name
  summary: string;
  highlights: string[];
}

export const BASELINE_PILLARS: BaselinePillar[] = [
  {
    id: 'memory',
    name: 'Persistent Memory',
    icon: 'Brain',
    summary: 'Every interaction is retained, tiered, and retrievable. Hot, warm, and cold memory layers with adaptive salience scoring.',
    highlights: [
      'Three-tier memory architecture (hot / warm / cold)',
      'Adaptive salience scoring and confidence decay',
      'Contradiction detection across stored facts',
      'SM-2 spaced repetition for reinforcement',
    ],
  },
  {
    id: 'routing',
    name: 'Intelligent Routing',
    icon: 'Route',
    summary: 'Requests are matched to the best available model, provider, and pipeline — automatically. Cost, latency, and quality are balanced in real time.',
    highlights: [
      'Multi-provider model selection',
      'Cost-optimized request routing',
      'Automatic failover and retry',
      'Response quality feedback loop',
    ],
  },
  {
    id: 'defense',
    name: 'Runtime Defense',
    icon: 'ShieldCheck',
    summary: 'Behavioral threat detection, IP reputation scoring, rate limiting, and prompt injection guards — always active.',
    highlights: [
      'Behavioral anomaly detection',
      'IP reputation scoring',
      'Edge-level rate limiting',
      'Prompt injection shielding',
    ],
  },
  {
    id: 'orchestration',
    name: 'Pipeline Orchestration',
    icon: 'Workflow',
    summary: 'Compose multi-step operations into governed pipelines. Capabilities chain automatically with DAG coordination.',
    highlights: [
      'DAG-based pipeline execution',
      'Cascading and parallel modes',
      'Automatic dependency resolution',
      'Governed invocation wrappers',
    ],
  },
  {
    id: 'observability',
    name: 'System Observability',
    icon: 'Activity',
    summary: 'Health monitoring, anomaly detection, and telemetry across every module — from memory tiers to API calls.',
    highlights: [
      'Real-time health scoring',
      'Module-level telemetry',
      'Anomaly detection alerts',
      'Usage analytics & snapshots',
    ],
  },
  {
    id: 'governance',
    name: 'Governance & Trust',
    icon: 'Scale',
    summary: 'Bounded authority, audit trails, and mode-based governance ensure the system operates within defined limits.',
    highlights: [
      'Role-based access control',
      'Audit logging for all operations',
      'Governance mode management',
      'Capability risk classification',
    ],
  },
  {
    id: 'evolution',
    name: 'Autonomous Evolution',
    icon: 'Dna',
    summary: 'The system proposes, validates, and applies its own improvements — with human oversight at every gate.',
    highlights: [
      'Self-improvement proposals',
      'Shadow → production phased rollout',
      'Regression-aware validation',
      'Governor-approved stamping',
    ],
  },
  {
    id: 'identity',
    name: 'Identity & Access',
    icon: 'Fingerprint',
    summary: 'Authentication, entitlements, API key management, and developer identity — unified across the platform.',
    highlights: [
      'Passkey & credential management',
      'API key lifecycle management',
      'Tier-based entitlements',
      'Developer identity registry',
    ],
  },
  {
    id: 'communication',
    name: 'Event Architecture',
    icon: 'Radio',
    summary: 'Event-driven communication between modules. Webhooks, real-time subscriptions, and cross-system relay.',
    highlights: [
      'Module-to-module event bus',
      'Webhook lifecycle management',
      'Real-time subscription channels',
      'Cross-system relay encryption',
    ],
  },
  {
    id: 'cognition',
    name: 'Cognitive Stack',
    icon: 'Lightbulb',
    summary: 'Intent classification, natural language understanding, creative synthesis, and meta-learning — the thinking layer.',
    highlights: [
      'Intent classification & extraction',
      'Contextual response generation',
      'Creative synthesis (dream cycles)',
      'Meta-learning & self-reflection',
    ],
  },
];

/** Subset for compact display (upgrade page "Every plan includes" section) */
export const BASELINE_HIGHLIGHTS: { label: string; description: string }[] = [
  { label: 'Persistent Memory', description: 'Three-tier memory with adaptive salience' },
  { label: 'Intelligent Routing', description: 'Multi-provider model orchestration' },
  { label: 'Runtime Defense', description: 'Always-on threat detection & rate limiting' },
  { label: 'Pipeline Orchestration', description: 'DAG-based capability chaining' },
  { label: 'System Observability', description: 'Health monitoring & anomaly detection' },
  { label: 'Governance & Trust', description: 'Audit trails & bounded authority' },
  { label: 'Autonomous Evolution', description: 'Self-improvement with human oversight' },
  { label: 'Event Architecture', description: 'Module-to-module event bus & relay' },
];
