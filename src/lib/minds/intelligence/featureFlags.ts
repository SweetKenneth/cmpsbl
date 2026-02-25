/**
 * Minds Intelligence Layer — Feature Flag Matrix
 * Centralized gating for all intelligence capabilities.
 * All gated features activatable without structural refactor.
 */

export type FeatureGateStatus = 'ACTIVE' | 'INTERNAL_ONLY' | 'DISABLED' | 'OFF';

export interface FeatureFlagEntry {
  key: string;
  status: FeatureGateStatus;
  description: string;
  activatableViaFlag: boolean;
}

/**
 * Canonical feature flag matrix.
 * Phase 1 public features are ACTIVE.
 * Internal features are INTERNAL_ONLY (fully built, not exposed).
 * DISABLED = built but enforcement off.
 * OFF = built but auto-behavior disabled (manual fallback available).
 */
export const FEATURE_FLAG_MATRIX: Record<string, FeatureFlagEntry> = {
  // ─── Phase 1: ACTIVE ───
  scoped_research: {
    key: 'scoped_research',
    status: 'ACTIVE',
    description: 'Domain whitelist enforcement per Mind',
    activatableViaFlag: true,
  },
  tool_chain_composition: {
    key: 'tool_chain_composition',
    status: 'ACTIVE',
    description: 'Deterministic multi-step tool workflows',
    activatableViaFlag: true,
  },
  prompt_scaffolding: {
    key: 'prompt_scaffolding',
    status: 'ACTIVE',
    description: 'Hardened domain-specific system prompts',
    activatableViaFlag: true,
  },
  failure_recovery: {
    key: 'failure_recovery',
    status: 'ACTIVE',
    description: 'Deterministic failure recovery playbooks',
    activatableViaFlag: true,
  },
  context_windowing: {
    key: 'context_windowing',
    status: 'ACTIVE',
    description: 'Relevance-weighted session memory prioritization',
    activatableViaFlag: true,
  },
  confidence_signaling: {
    key: 'confidence_signaling',
    status: 'ACTIVE',
    description: 'Output confidence scoring (rubric hidden)',
    activatableViaFlag: true,
  },

  // ─── Gated: INTERNAL_ONLY ───
  consolidation: {
    key: 'consolidation',
    status: 'INTERNAL_ONLY',
    description: 'Background memory compression and deduplication',
    activatableViaFlag: true,
  },
  quality_scoring: {
    key: 'quality_scoring',
    status: 'INTERNAL_ONLY',
    description: 'Internal output quality rubric evaluation',
    activatableViaFlag: true,
  },
  vocabulary_auto_growth: {
    key: 'vocabulary_auto_growth',
    status: 'INTERNAL_ONLY',
    description: 'Autonomous domain vocabulary expansion via CLM',
    activatableViaFlag: true,
  },

  // ─── Gated: OFF (manual fallback available) ───
  adaptive_tone_auto: {
    key: 'adaptive_tone_auto',
    status: 'OFF',
    description: 'Automatic tone shifting based on learned preferences',
    activatableViaFlag: true,
  },

  // ─── Gated: DISABLED (infrastructure ready) ───
  proficiency_gating: {
    key: 'proficiency_gating',
    status: 'DISABLED',
    description: 'CLM competency-gated capability unlocking',
    activatableViaFlag: true,
  },

  // ─── Explicitly excluded ───
  cross_mind_transfer: {
    key: 'cross_mind_transfer',
    status: 'DISABLED',
    description: 'Cross-Mind knowledge sharing — NOT BUILT (Phase 2)',
    activatableViaFlag: false,
  },
  contradiction_resolution: {
    key: 'contradiction_resolution',
    status: 'DISABLED',
    description: 'Autonomous contradiction resolution — NOT BUILT (Phase 2)',
    activatableViaFlag: false,
  },
};

/** Check if a feature is publicly active */
export function isFeatureActive(key: string): boolean {
  return FEATURE_FLAG_MATRIX[key]?.status === 'ACTIVE';
}

/** Check if a feature is available for internal use */
export function isFeatureAvailable(key: string): boolean {
  const entry = FEATURE_FLAG_MATRIX[key];
  if (!entry) return false;
  return entry.status === 'ACTIVE' || entry.status === 'INTERNAL_ONLY';
}

/** Check if a feature can be activated via flag */
export function isActivatable(key: string): boolean {
  return FEATURE_FLAG_MATRIX[key]?.activatableViaFlag ?? false;
}

/** Activate a gated feature (runtime override) */
const runtimeOverrides = new Map<string, FeatureGateStatus>();

export function overrideFeatureStatus(key: string, status: FeatureGateStatus): boolean {
  const entry = FEATURE_FLAG_MATRIX[key];
  if (!entry || !entry.activatableViaFlag) return false;
  runtimeOverrides.set(key, status);
  return true;
}

/** Get effective status (respects runtime overrides) */
export function getEffectiveStatus(key: string): FeatureGateStatus {
  return runtimeOverrides.get(key) ?? FEATURE_FLAG_MATRIX[key]?.status ?? 'DISABLED';
}

/** Get all flags as a summary */
export function getFeatureFlagSummary(): Record<string, FeatureGateStatus> {
  const summary: Record<string, FeatureGateStatus> = {};
  for (const [key, entry] of Object.entries(FEATURE_FLAG_MATRIX)) {
    summary[key] = getEffectiveStatus(key);
  }
  return summary;
}

/** Get active feature count */
export function getActiveFeatureCount(): number {
  return Object.values(FEATURE_FLAG_MATRIX).filter(f => getEffectiveStatus(f.key) === 'ACTIVE').length;
}

/** Get gated feature count */
export function getGatedFeatureCount(): number {
  return Object.values(FEATURE_FLAG_MATRIX).filter(f => {
    const s = getEffectiveStatus(f.key);
    return s === 'INTERNAL_ONLY' || s === 'OFF' || s === 'DISABLED';
  }).length;
}
