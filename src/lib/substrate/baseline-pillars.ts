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
    summary: 'Every interaction is retained, tiered, and retrievable. Four memory tiers with adaptive salience scoring powered by the MEMORY Organ.',
    highlights: [
      'Four-tier memory architecture (hot / warm / cold / glacier)',
      'Adaptive salience scoring and confidence decay',
      'Contradiction detection across stored facts',
      'SM-2 spaced repetition for reinforcement',
    ],
  },
  {
    id: 'routing',
    name: 'Intelligent Routing',
    icon: 'Route',
    summary: 'Requests are matched to the best available model, provider, and memory chain — automatically. The NEXUS Organ balances cost, latency, and quality in real time.',
    highlights: [
      'Multi-provider model selection via NEXUS Organ',
      'Cost-optimized request routing',
      'Automatic failover and retry',
      'Response quality feedback loop',
    ],
  },
  {
    id: 'defense',
    name: 'Runtime Defense',
    icon: 'ShieldCheck',
    summary: 'The DEFENSE Layer runs behavioral threat detection, IP reputation scoring, rate limiting, and prompt injection guards — always active.',
    highlights: [
      'Behavioral anomaly detection',
      'IP reputation scoring',
      'Ironclad rate limiting',
      'Prompt injection shielding',
    ],
  },
  {
    id: 'orchestration',
    name: 'Memory Chain Orchestration',
    icon: 'Workflow',
    summary: 'Compose multi-step operations into governed memory chains. The CORTEX Agent coordinates primitives automatically with DAG orchestration.',
    highlights: [
      'DAG-based memory chain execution',
      'Cascading and parallel modes',
      'Automatic dependency resolution',
      'Governed invocation wrappers',
    ],
  },
  {
    id: 'observability',
    name: 'System Observability',
    icon: 'Activity',
    summary: 'Health monitoring, anomaly detection, and telemetry across every primitive — from memory tiers to API calls. Powered by the VISION Layer and MEDIC Organ.',
    highlights: [
      'Real-time weighted health scoring (Σ = 1.000)',
      'Per-primitive telemetry',
      'Anomaly detection alerts via REFLEX Layer',
      'Usage analytics & snapshots',
    ],
  },
  {
    id: 'governance',
    name: 'Governance & Trust',
    icon: 'Scale',
    summary: 'The GOVERNANCE Layer enforces bounded authority, audit trails, and 4-mode governance to ensure the substrate operates within defined limits.',
    highlights: [
      'Role-based access control via ACCESS Layer',
      'Tamper-evident audit logging (AUDIT Agent)',
      '4-mode governance: Active, Observe, Lockdown, Evolve',
      'Crown Jewel risk classification',
    ],
  },
  {
    id: 'evolution',
    name: 'Autonomous Evolution',
    icon: 'Dna',
    summary: 'The EVOLUTION Layer proposes, validates, and applies improvements through the 7-gate SEBA pipeline — with human oversight at every gate.',
    highlights: [
      'SEBA 7-gate evolution pipeline',
      'Shadow → production phased rollout',
      'TSAC truth-preservation validation',
      'Governor-approved stamping',
    ],
  },
  {
    id: 'identity',
    name: 'Identity & Access',
    icon: 'Fingerprint',
    summary: 'The IDENTITY Organ handles authentication, sessions, and fingerprinting. The ACCESS Layer manages API keys, entitlements, and quota enforcement.',
    highlights: [
      'Session management & fingerprinting',
      'API key lifecycle management',
      'Tier-based entitlements',
      'Developer identity registry',
    ],
  },
  {
    id: 'communication',
    name: 'Event Architecture',
    icon: 'Radio',
    summary: 'Event-driven communication between primitives. The NERVE Organ handles 4-gate signal emission; the RELAY Organ delivers webhooks and cross-system relay.',
    highlights: [
      'NERVE 4-gate signal bus',
      'RELAY webhook lifecycle management',
      'Real-time subscription channels',
      'RIPPLE Engine cascade & backpressure handling',
    ],
  },
  {
    id: 'cognition',
    name: 'Cognitive Stack',
    icon: 'Lightbulb',
    summary: 'Intent classification, natural language understanding, creative synthesis, and meta-learning — the thinking layer powered by BRAIN, DECODE, and DREAM.',
    highlights: [
      'DECODE Agent intent classification & extraction',
      'BRAIN Organ reasoning & pattern recognition',
      'DREAM Engine heuristic synthesis',
      'CONSCIENCE Organ ethical assessment',
    ],
  },
];

/** Subset for compact display (upgrade page "Every plan includes" section) */
export const BASELINE_HIGHLIGHTS: { label: string; description: string }[] = [
  { label: 'Persistent Memory', description: 'Four-tier memory with adaptive salience' },
  { label: 'Intelligent Routing', description: 'Multi-provider model orchestration via NEXUS' },
  { label: 'Runtime Defense', description: 'Always-on threat detection & Ironclad rate limiting' },
  { label: 'Memory Chain Orchestration', description: 'DAG-based primitive chaining' },
  { label: 'System Observability', description: 'Weighted health scoring & anomaly detection' },
  { label: 'Governance & Trust', description: 'Audit trails & 4-mode governance' },
  { label: 'Autonomous Evolution', description: 'SEBA 7-gate self-improvement' },
  { label: 'Event Architecture', description: 'NERVE signal bus & RELAY delivery' },
];
