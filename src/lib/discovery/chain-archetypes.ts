/**
 * Shared Chain Archetype Map
 * 
 * Maps primitive node combinations to human-readable archetype names.
 * Used by both Memory Stream (discovery display) and Ascension (capability marketplace).
 * 
 * This is a client-side lookup mirror of the authoritative map in the
 * pf-proprietary-evolution edge function. It does NOT need to be exhaustive —
 * it covers the most common 2-3 node combinations for display labeling.
 */

export interface ArchetypeEntry {
  name: string;
  desc: string;
}

/**
 * Canonical archetype map — keys are sorted, '+'-joined node names.
 * Multiple entries per key allow deterministic selection via hash.
 */
const CHAIN_ARCHETYPES: Record<string, ArchetypeEntry[]> = {
  'BRAIN+ORACLE': [{ name: 'Predictive Reasoning', desc: 'Causal inference meets Bayesian forecasting' }],
  'BRAIN+DEFENSE': [{ name: 'Adversarial Intelligence', desc: 'Reasoning-powered threat modeling' }],
  'BRAIN+MEMORY': [{ name: 'Associative Reasoning', desc: 'Inference that remembers and compounds' }],
  'BRAIN+PHANTOM': [{ name: 'Zero-Knowledge Reasoning', desc: 'Privacy-preserving inference' }],
  'BRAIN+EVOLUTION': [{ name: 'Self-Improving Cognition', desc: 'Evolving reasoning strategies' }],
  'BRAIN+DREAM': [{ name: 'Lucid Reasoning', desc: 'Deduction meets generative synthesis' }],
  'BRAIN+CORTEX': [{ name: 'Orchestrated Reasoning', desc: 'Parallelized cognitive pipelines' }],
  'BRAIN+FORGE': [{ name: 'Cognitive Manufacturing', desc: 'Reasoning-driven code generation' }],
  'BRAIN+NERVE': [{ name: 'Signal Consensus', desc: 'Intelligent signal arbitration' }],
  'BRAIN+INTENT': [{ name: 'Intent Comprehension', desc: 'Deep action understanding' }],
  'BRAIN+HARVEST': [{ name: 'Intelligent Extraction', desc: 'Reasoning-guided data acquisition' }],
  'BRAIN+DECODE': [{ name: 'Cognitive Parsing', desc: 'Understanding through inference' }],
  'BRAIN+ENCODE': [{ name: 'Generative Reasoning', desc: 'Inference-driven code output' }],
  'BRAIN+GOVERNANCE': [{ name: 'Policy Reasoning', desc: 'Logic-driven governance' }],
  'BRAIN+AUDIT': [{ name: 'Forensic Reasoning', desc: 'Causal audit intelligence' }],
  'BRAIN+ATLAS': [{ name: 'Capability Intelligence', desc: 'Strategic capability analysis' }],
  'BRAIN+LINGUA': [{ name: 'Multilingual Reasoning', desc: 'Cross-language inference' }],
  'BRAIN+ECHO': [{ name: 'Temporal Reasoning', desc: 'Time-aware inference chains' }],
  'BRAIN+VISION': [{ name: 'Observability Intelligence', desc: 'Narrative-driven telemetry' }],
  'BRAIN+NEXUS': [{ name: 'Adaptive AI Routing', desc: 'Intelligent model selection' }],
  'BRAIN+SANDBOX': [{ name: 'Reasoned Isolation', desc: 'Cognitive sandbox provisioning' }],
  'BRAIN+RIPPLE': [{ name: 'Cascading Inference', desc: 'Compounding intelligence waves' }],
  'ORACLE+DEFENSE': [{ name: 'Predictive Threat Shield', desc: 'Preemptive security' }],
  'ORACLE+EVOLUTION': [{ name: 'Fitness Oracle', desc: 'Predictive mutation scoring' }],
  'ORACLE+HARVEST': [{ name: 'Intelligence Harvester', desc: 'Proactive data gathering' }],
  'ORACLE+DREAM': [{ name: 'Generative Forecast', desc: 'Imagined futures + probability' }],
  'ORACLE+VISION': [{ name: 'Predictive Telemetry', desc: 'Forecasting from metrics' }],
  'ORACLE+ECONOMY': [{ name: 'Revenue Prediction', desc: 'Financial forecasting' }],
  'ORACLE+GOVERNANCE': [{ name: 'Compliance Forecaster', desc: 'Preemptive regulatory alerts' }],
  'ORACLE+INTENT': [{ name: 'Intent Prediction', desc: 'Anticipatory action planning' }],
  'DEFENSE+IMMUNITY': [{ name: 'Autonomous Immune Shield', desc: 'Dual-layer adaptive security' }],
  'DEFENSE+PHANTOM': [{ name: 'Ghost Defense Mesh', desc: 'Invisible security perimeter' }],
  'DEFENSE+GOVERNANCE': [{ name: 'Governed Threat Response', desc: 'Policy-aware security' }],
  'DEFENSE+AUDIT': [{ name: 'Tamper-Evident Ledger', desc: 'Cryptographic forensics' }],
  'CORTEX+FORGE': [{ name: 'Autonomous Build', desc: 'Orchestrated software manufacturing' }],
  'CORTEX+MEMORY': [{ name: 'Context-Aware Orchestration', desc: 'History-enriched workflows' }],
  'CORTEX+EVOLUTION': [{ name: 'Self-Optimizing Orchestration', desc: 'Evolving workflow strategies' }],
  'ENCODE+DECODE': [{ name: 'Full-Spectrum Codec', desc: 'Universal format translation' }],
  'ENCODE+FORGE': [{ name: 'Generative Manufacturing', desc: 'Spec-to-artifact pipeline' }],
  'MEMORY+EVOLUTION': [{ name: 'Adaptive Memory Genome', desc: 'Evolving retention strategies' }],
  'MEMORY+ECHO': [{ name: 'Temporal Memory Replay', desc: 'Retroactive insight discovery' }],
  'MEMORY+DREAM': [{ name: 'Consolidated Memory', desc: 'Dream-state knowledge synthesis' }],
  'HARVEST+LINGUA': [{ name: 'Multilingual Data Harvester', desc: 'Cross-language acquisition' }],
  'HARVEST+DEFENSE': [{ name: 'Threat Intelligence Collector', desc: 'Proactive threat feeds' }],
  'HARVEST+EVOLUTION': [{ name: 'Adaptive Data Forager', desc: 'Self-improving crawlers' }],
  'FORGE+EVOLUTION': [{ name: 'Evolutionary Code Factory', desc: 'Darwinian software' }],
  'FORGE+DEFENSE': [{ name: 'Hardened Artifact Generator', desc: 'Security-baked builds' }],
  'FORGE+LINGUA': [{ name: 'Polyglot Code Generator', desc: 'Multi-language output' }],
  'ECHO+EVOLUTION': [{ name: 'Temporal Fitness Tracker', desc: 'Historical mutation analysis' }],
  'ECHO+SHADOW': [{ name: 'Divergence Replay', desc: 'Shadow behavioral drift detection' }],
  'REFLEX+DEFENSE': [{ name: 'Edge Threat Interceptor', desc: 'Sub-ms attack blocking' }],
  'REFLEX+NERVE': [{ name: 'Reactive Signal Mesh', desc: 'Distributed edge decisions' }],
  'SANDBOX+EVOLUTION': [{ name: 'Isolated Mutation Lab', desc: 'Safe evolutionary experiments' }],
  'SANDBOX+PHANTOM': [{ name: 'Anonymous Execution Vault', desc: 'Traceless computation' }],
  'SHADOW+PHANTOM': [{ name: 'Ghost Verification Mesh', desc: 'Stealth validation' }],
  'SHADOW+ENGINEER': [{ name: 'Performance Shadow Tester', desc: 'Invisible benchmarking' }],
  'CONSCIENCE+GOVERNANCE': [{ name: 'Ethics Policy Engine', desc: 'Automated moral reasoning' }],
  'CONSCIENCE+INCLUSIVE': [{ name: 'Ethical Accessibility Auditor', desc: 'Bias + usability analysis' }],
  'TREATY+SOVEREIGN': [{ name: 'Cross-Border Compliance', desc: 'Multi-jurisdiction governance' }],
  'TREATY+ECONOMY': [{ name: 'SLA Billing Enforcer', desc: 'Contract-driven metering' }],
  'IMMUNITY+EVOLUTION': [{ name: 'Self-Hardening Defense', desc: 'Incident-driven resilience' }],
  'IMMUNITY+MEDIC': [{ name: 'Autonomous Repair System', desc: 'Biological-style self-healing' }],
  'IDENTITY+ACCESS': [{ name: 'Unified Entitlement', desc: 'Identity-driven permissions' }],
  'ECONOMY+GOVERNANCE': [{ name: 'Governed Cost Control', desc: 'Policy-enforced budgets' }],
  'ATLAS+GOVERNANCE': [{ name: 'Capability Policy Controller', desc: 'Registry governance' }],
  'MEDIC+ENGINEER': [{ name: 'Self-Optimizing Health', desc: 'Auto-tuning diagnostics' }],
  'NERVE+RIPPLE': [{ name: 'Consensus Event Network', desc: 'Decentralized agreement' }],
  // 3+ node combinations
  'BRAIN+MEMORY+EVOLUTION': [{ name: 'Self-Evolving Knowledge', desc: 'Compounding intelligence engine' }],
  'BRAIN+ORACLE+DEFENSE': [{ name: 'Cognitive Threat Oracle', desc: 'Thinking, predicting, defending' }],
  'HARVEST+BRAIN+ORACLE': [{ name: 'Predictive Data Intelligence', desc: 'Data to foresight pipeline' }],
  'CORTEX+BRAIN+FORGE+ENCODE': [{ name: 'Autonomous Software Factory', desc: 'End-to-end code manufacturing' }],
  'DEFENSE+IMMUNITY+PHANTOM+SHADOW': [{ name: 'Invisible Fortress', desc: 'Four-layer untouchable security' }],
  'ORACLE+CONSCIENCE+TREATY': [{ name: 'Ethical Forecast Negotiator', desc: 'AI governance that looks ahead' }],
  'MEMORY+ECHO+REFLEX+COMPASS': [{ name: 'Situational Memory Navigator', desc: 'Real-time spatial-temporal awareness' }],
  'EVOLUTION+SHADOW+FORGE': [{ name: 'Shadow Evolution Forge', desc: 'Darwinian shadow manufacturing' }],
};

/** Sort and join nodes into a canonical key */
function canonicalKey(nodes: string[]): string {
  return [...nodes].sort().join('+');
}

/** Simple deterministic hash for stable selection */
function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Resolve an archetype name for a given set of primitive nodes.
 * Returns null if no archetype matches.
 */
export function resolveArchetypeName(moduleChain: string[]): string | null {
  if (!moduleChain || moduleChain.length === 0) return null;

  // Try exact match first
  const key = canonicalKey(moduleChain);
  const exact = CHAIN_ARCHETYPES[key];
  if (exact && exact.length > 0) {
    return exact[simpleHash(key) % exact.length].name;
  }

  // Try all pairs within the chain
  if (moduleChain.length >= 2) {
    for (let i = 0; i < moduleChain.length - 1; i++) {
      for (let j = i + 1; j < moduleChain.length; j++) {
        const pairKey = canonicalKey([moduleChain[i], moduleChain[j]]);
        const pair = CHAIN_ARCHETYPES[pairKey];
        if (pair && pair.length > 0) {
          return pair[simpleHash(pairKey) % pair.length].name;
        }
      }
    }
  }

  return null;
}

/**
 * Get the depth tier label for a chain based on primitive count.
 */
export type DepthTier = 'Short' | 'Medium' | 'Deep';

export function getDepthTier(chainLength: number): DepthTier {
  if (chainLength <= 3) return 'Short';
  if (chainLength <= 6) return 'Medium';
  return 'Deep';
}

/**
 * Get depth tier styling classes
 */
export function getDepthTierStyle(tier: DepthTier): string {
  switch (tier) {
    case 'Short': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    case 'Medium': return 'bg-neon-amber/10 text-neon-amber border-neon-amber/30';
    case 'Deep': return 'bg-primary/10 text-primary border-primary/30';
  }
}
