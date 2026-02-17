/**
 * Public Capability Manifest — Tier-Safe, Outcome-Oriented
 * v10.5.4 ARCHITECT Epoch
 * 
 * RULES:
 * - NO CMPSBL-only Crown Jewels by name or description
 * - NO recursive evolution, self-governance, or meta-engine internals
 * - Outcome language only ("Predict failures") not technical internals
 * - public_safe: true means safe for pricing pages, investor decks
 */

export interface PublicCapability {
  name: string;
  tier: 'creator' | 'architect' | 'enterprise';
  module: string;
  outcome_summary: string;
  category: 'security' | 'intelligence' | 'optimization' | 'compliance' | 'observability';
  public_safe: true;
  is_crown_jewel?: boolean;
}

export const PUBLIC_CAPABILITY_MANIFEST: PublicCapability[] = [
  // ══════════════════════════════════════════════════════
  // CREATOR TIER ($49/mo) — 12 core + 7 new crown jewels = 19
  // ══════════════════════════════════════════════════════
  {
    name: 'Knowledge Gap Detection',
    tier: 'creator',
    module: 'MEMORY',
    outcome_summary: 'Automatically identifies stale or incomplete knowledge before it causes errors',
    category: 'intelligence',
    public_safe: true,
  },
  {
    name: 'Cost Anomaly Detection',
    tier: 'creator',
    module: 'ECONOMY',
    outcome_summary: 'Predict cost spikes and receive anomaly alerts before they hit your budget',
    category: 'optimization',
    public_safe: true,
  },
  {
    name: 'Value Attribution',
    tier: 'creator',
    module: 'ECONOMY',
    outcome_summary: 'Attribute revenue impact to specific capabilities and features',
    category: 'optimization',
    public_safe: true,
  },
  {
    name: 'User Journey Mapping',
    tier: 'creator',
    module: 'VISION',
    outcome_summary: 'Reconstruct complete user journeys to find drop-off points and optimize flows',
    category: 'observability',
    public_safe: true,
  },
  {
    name: 'Cohort Analysis',
    tier: 'creator',
    module: 'VISION',
    outcome_summary: 'Segment users into behavioral cohorts and predict retention patterns',
    category: 'intelligence',
    public_safe: true,
  },
  {
    name: 'Provider Failure Prediction',
    tier: 'creator',
    module: 'NEXUS',
    outcome_summary: 'Forecast AI provider outages and degrade gracefully before impact',
    category: 'optimization',
    public_safe: true,
  },
  {
    name: 'Architecture Drift Detection',
    tier: 'creator',
    module: 'ENCODE',
    outcome_summary: 'Detect when your codebase drifts from intended design patterns',
    category: 'intelligence',
    public_safe: true,
  },
  {
    name: 'Pattern Consolidation',
    tier: 'creator',
    module: 'DREAM',
    outcome_summary: 'Consolidate repeated patterns into reusable, optimized templates',
    category: 'optimization',
    public_safe: true,
  },
  {
    name: 'Channel Optimization',
    tier: 'creator',
    module: 'RELAY',
    outcome_summary: 'Determine the optimal delivery channel for each recipient automatically',
    category: 'optimization',
    public_safe: true,
  },
  {
    name: 'Intent Evolution Tracking',
    tier: 'creator',
    module: 'DECODE',
    outcome_summary: 'Track how user intent evolves over time and predict next actions',
    category: 'intelligence',
    public_safe: true,
  },
  {
    name: 'Event Dedup Intelligence',
    tier: 'creator',
    module: 'RIPPLE',
    outcome_summary: 'Semantically deduplicate events beyond exact matches to reduce noise',
    category: 'optimization',
    public_safe: true,
  },
  {
    name: 'Health Prediction',
    tier: 'creator',
    module: 'INTEGRATION',
    outcome_summary: 'Predict connector failures before they impact your integrations',
    category: 'observability',
    public_safe: true,
  },
  // ── NEW Creator Crown Jewels (one per module not yet covered) ──
  {
    name: 'Hot-Path Auto-Recovery',
    tier: 'creator',
    module: 'CORE',
    outcome_summary: 'Automatically detect and recover from module failures without downtime or manual intervention',
    category: 'optimization',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Smart Rate Shaping',
    tier: 'creator',
    module: 'ACCESS',
    outcome_summary: 'Intelligently shape API traffic to maximize throughput without exceeding quotas',
    category: 'optimization',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Contextual Recall Boost',
    tier: 'creator',
    module: 'BRAIN',
    outcome_summary: 'Automatically surface the most relevant memories based on conversation context and intent',
    category: 'intelligence',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Autonomous A11y Remediation',
    tier: 'creator',
    module: 'INCLUSIVE',
    outcome_summary: 'Auto-fix common accessibility violations with one-click AI-generated code patches',
    category: 'compliance',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Execution Safety Net',
    tier: 'creator',
    module: 'SANDBOX',
    outcome_summary: 'Run untrusted code and experiments in isolated environments with zero production risk',
    category: 'security',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Compliance Snapshot',
    tier: 'creator',
    module: 'AUDIT',
    outcome_summary: 'Generate point-in-time compliance snapshots for any audit period on demand',
    category: 'compliance',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Budget Guardian',
    tier: 'creator',
    module: 'ECONOMY',
    outcome_summary: 'Set spending limits and receive real-time alerts before budgets are exceeded',
    category: 'optimization',
    public_safe: true,
    is_crown_jewel: true,
  },

  // ══════════════════════════════════════════════════════
  // ARCHITECT TIER ($149/mo) — 14 existing + 7 new crown jewels = 21
  // ══════════════════════════════════════════════════════
  {
    name: 'Zero-Day Detection',
    tier: 'architect',
    module: 'DEFENSE',
    outcome_summary: 'Detect unknown attack patterns beyond known vulnerability signatures',
    category: 'security',
    public_safe: true,
  },
  {
    name: 'Attack Correlation',
    tier: 'architect',
    module: 'DEFENSE',
    outcome_summary: 'Link distributed attack campaigns across IPs, sessions, and time',
    category: 'security',
    public_safe: true,
  },
  {
    name: 'Behavioral Fingerprinting',
    tier: 'architect',
    module: 'DEFENSE',
    outcome_summary: 'Create behavioral signatures that persist beyond device fingerprints',
    category: 'security',
    public_safe: true,
  },
  {
    name: 'Identity Graph',
    tier: 'architect',
    module: 'IDENTITY',
    outcome_summary: 'Build cross-session identity graphs for unified user understanding',
    category: 'intelligence',
    public_safe: true,
  },
  {
    name: 'Behavioral Biometrics',
    tier: 'architect',
    module: 'IDENTITY',
    outcome_summary: 'Continuously authenticate users through interaction patterns',
    category: 'security',
    public_safe: true,
  },
  {
    name: 'Incident Prediction',
    tier: 'architect',
    module: 'SYSTEM',
    outcome_summary: 'Predict incidents from health telemetry before they become outages',
    category: 'observability',
    public_safe: true,
  },
  {
    name: 'Capacity Forecasting',
    tier: 'architect',
    module: 'SYSTEM',
    outcome_summary: 'Predict capacity limits and recommend scaling actions proactively',
    category: 'optimization',
    public_safe: true,
  },
  {
    name: 'Forensic Timeline',
    tier: 'architect',
    module: 'AUDIT',
    outcome_summary: 'Automatically reconstruct forensic timelines for compliance investigations',
    category: 'compliance',
    public_safe: true,
  },
  {
    name: 'Regulatory Autopilot',
    tier: 'architect',
    module: 'AUDIT',
    outcome_summary: 'Auto-generate SOC2, GDPR, and HIPAA compliance reports on demand',
    category: 'compliance',
    public_safe: true,
  },
  {
    name: 'Temporal Reasoning',
    tier: 'architect',
    module: 'MEMORY',
    outcome_summary: 'Analyze causal chains across memories to understand temporal relationships',
    category: 'intelligence',
    public_safe: true,
  },
  {
    name: 'Semantic Refactoring',
    tier: 'architect',
    module: 'ENCODE',
    outcome_summary: 'Behavior-preserving code refactoring with formal verification guarantees',
    category: 'intelligence',
    public_safe: true,
  },
  {
    name: 'Dependency Impact Analysis',
    tier: 'architect',
    module: 'CORTEX',
    outcome_summary: 'Map blast radius across dependency graphs before making changes',
    category: 'observability',
    public_safe: true,
  },
  {
    name: 'Model Quality Scoring',
    tier: 'architect',
    module: 'NEXUS',
    outcome_summary: 'Score AI model output quality in real-time and detect hallucinations',
    category: 'intelligence',
    public_safe: true,
  },
  // ── NEW Architect Crown Jewels ──
  {
    name: 'Adaptive Personality Engine',
    tier: 'architect',
    module: 'DECODE',
    outcome_summary: 'Dynamically adjust AI personality and tone based on user sentiment and context in real-time',
    category: 'intelligence',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Dream-State Synthesis',
    tier: 'architect',
    module: 'DREAM',
    outcome_summary: 'Generate novel solutions by combining patterns discovered during autonomous off-peak analysis',
    category: 'intelligence',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Cascade Failure Prevention',
    tier: 'architect',
    module: 'RIPPLE',
    outcome_summary: 'Detect and halt cascading failures across modules before they propagate system-wide',
    category: 'security',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Predictive Connector Health',
    tier: 'architect',
    module: 'INTEGRATION',
    outcome_summary: 'Forecast integration breakdowns days in advance using historical health patterns',
    category: 'observability',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Intelligent Cost Arbitrage',
    tier: 'architect',
    module: 'NEXUS',
    outcome_summary: 'Automatically route requests to the cheapest provider that meets quality thresholds',
    category: 'optimization',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Cross-Module Orchestration',
    tier: 'architect',
    module: 'CORTEX',
    outcome_summary: 'Compose multi-module workflows that discover emergent capabilities beyond individual modules',
    category: 'intelligence',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Architecture Modernization Planner',
    tier: 'architect',
    module: 'MODERNIZER',
    outcome_summary: 'Generate risk-scored migration roadmaps with incremental execution plans for legacy systems',
    category: 'optimization',
    public_safe: true,
    is_crown_jewel: true,
  },

  // ══════════════════════════════════════════════════════
  // ENTERPRISE (Custom) — 3 existing + 7 new crown jewels = 10
  // ══════════════════════════════════════════════════════
  {
    name: 'Source Code Access',
    tier: 'enterprise',
    module: 'SYSTEM',
    outcome_summary: 'Full source access for self-hosted deployment and custom governance',
    category: 'compliance',
    public_safe: true,
  },
  {
    name: 'Air-Gapped Deployment',
    tier: 'enterprise',
    module: 'SYSTEM',
    outcome_summary: 'Run the full substrate in air-gapped environments with zero external calls',
    category: 'security',
    public_safe: true,
  },
  {
    name: 'Custom Governance Rules',
    tier: 'enterprise',
    module: 'CORTEX',
    outcome_summary: 'Define custom governance policies tailored to your regulatory requirements',
    category: 'compliance',
    public_safe: true,
  },
  // ── NEW Enterprise Crown Jewels ──
  {
    name: 'Multi-Tenant Intelligence Isolation',
    tier: 'enterprise',
    module: 'BRAIN',
    outcome_summary: 'Complete memory and intelligence isolation across tenants with zero data leakage guarantees',
    category: 'security',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Sovereign Identity Federation',
    tier: 'enterprise',
    module: 'IDENTITY',
    outcome_summary: 'Federate identity across organizations with cryptographic provenance and trust portability',
    category: 'compliance',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Enterprise Threat Intelligence Network',
    tier: 'enterprise',
    module: 'DEFENSE',
    outcome_summary: 'Share anonymized threat intelligence across deployments for collective defense',
    category: 'security',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Guaranteed Delivery SLA',
    tier: 'enterprise',
    module: 'RELAY',
    outcome_summary: 'Cryptographically-verified delivery guarantees with contractual SLA enforcement',
    category: 'compliance',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Autonomous Cost Governance',
    tier: 'enterprise',
    module: 'ECONOMY',
    outcome_summary: 'Organization-wide budget enforcement with automated chargeback and departmental allocation',
    category: 'optimization',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Cross-Deployment Observability',
    tier: 'enterprise',
    module: 'VISION',
    outcome_summary: 'Unified monitoring across all substrate deployments with centralized dashboards and alerting',
    category: 'observability',
    public_safe: true,
    is_crown_jewel: true,
  },
  {
    name: 'Evolution Sandbox Clusters',
    tier: 'enterprise',
    module: 'SANDBOX',
    outcome_summary: 'Run parallel evolution experiments across sandbox clusters with automated winner selection',
    category: 'optimization',
    public_safe: true,
    is_crown_jewel: true,
  },
];

/** Get capabilities for a specific tier */
export function getCapabilitiesByTier(tier: PublicCapability['tier']): PublicCapability[] {
  return PUBLIC_CAPABILITY_MANIFEST.filter(c => c.tier === tier);
}

/** Get crown jewels for a tier */
export function getCrownJewelsByTier(tier: PublicCapability['tier']): PublicCapability[] {
  return PUBLIC_CAPABILITY_MANIFEST.filter(c => c.tier === tier && c.is_crown_jewel);
}

/** Get capabilities grouped by category */
export function getCapabilitiesByCategory(tier: PublicCapability['tier']): Record<string, PublicCapability[]> {
  const caps = getCapabilitiesByTier(tier);
  return caps.reduce((acc, cap) => {
    if (!acc[cap.category]) acc[cap.category] = [];
    acc[cap.category].push(cap);
    return acc;
  }, {} as Record<string, PublicCapability[]>);
}

/** Outcome-oriented category labels for public display */
export const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  security: { label: 'Threat Protection', icon: '🛡️' },
  intelligence: { label: 'Deep Intelligence', icon: '🧠' },
  optimization: { label: 'Autonomous Optimization', icon: '⚡' },
  compliance: { label: 'Compliance & Governance', icon: '📋' },
  observability: { label: 'Predictive Observability', icon: '👁️' },
};
