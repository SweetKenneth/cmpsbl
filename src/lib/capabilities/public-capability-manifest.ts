/**
 * Public Capability Manifest — Tier-Safe, Outcome-Oriented
 * v10.5.3 ARCHITECT Epoch
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
}

export const PUBLIC_CAPABILITY_MANIFEST: PublicCapability[] = [
  // ══════════════════════════════════════════════════════
  // CREATOR TIER ($49/mo)
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

  // ══════════════════════════════════════════════════════
  // ARCHITECT TIER ($149/mo)
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

  // ══════════════════════════════════════════════════════
  // ENTERPRISE (Custom)
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
];

/** Get capabilities for a specific tier */
export function getCapabilitiesByTier(tier: PublicCapability['tier']): PublicCapability[] {
  return PUBLIC_CAPABILITY_MANIFEST.filter(c => c.tier === tier);
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
