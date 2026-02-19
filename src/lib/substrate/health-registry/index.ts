/**
 * Central Health Registry (CHR) + Truth Boundary Protocol
 * v10.5.4 ARCHITECT — SYSTEM_TRUTH_BOUNDARY + HEALTH_ATTRIBUTION_ENGINE
 *
 * Single source of truth for all module/subsystem health state.
 * Every health mutation routes through updateHealthRegistry().
 * Direct UI mutation of health state is disallowed.
 *
 * Truth Modes:
 *  - VERIFIED:  Backed by real telemetry (circuit breakers, rate limits, latency)
 *  - INFERRED:  Derived from heuristic signals, no direct measurement
 *  - NARRATIVE: Projected by cognitive/narrative layers (DECODE, personality, etc.)
 */

import { emit } from '../events';

// ═══ Truth Mode Protocol ═══════════════════════════════════════

export const SYSTEM_TRUTH_MODE = {
  VERIFIED: 'verified_telemetry' as const,
  INFERRED: 'inferred_context' as const,
  NARRATIVE: 'narrative_projection' as const,
};

export type TruthMode = typeof SYSTEM_TRUTH_MODE[keyof typeof SYSTEM_TRUTH_MODE];

// ═══ Health Causes ══════════════════════════════════════════════

export type HealthCause =
  | 'rate_limit'
  | 'mesh_load'
  | 'circuit_breaker'
  | 'manual_override'
  | 'provider_latency'
  | 'shadow_event'
  | 'auto_recovery'
  | 'boot'
  | 'unknown';

export type HealthSource =
  | 'telemetry'
  | 'synthetic_test'
  | 'synthetic_shadow_event'
  | 'narrative_layer'
  | 'manual';

export type HealthEntryStatus =
  | 'healthy'
  | 'degraded'
  | 'rerouting'
  | 'shadow_event'
  | 'critical'
  | 'offline';

// ═══ Registry Entry ═════════════════════════════════════════════

export interface HealthRegistryEntry {
  module_id: string;
  status: HealthEntryStatus;
  cause: HealthCause;
  source: HealthSource;
  truth_mode: TruthMode;
  timestamp: string;
  recovery_action: string | null;
  score: number;                    // 0-100, deterministic from breaker state
  breaker_state: 'closed' | 'half_open' | 'open' | 'unknown';
  detail: string;
}

// ═══ Attribution Result ═════════════════════════════════════════

export interface AttributionResult {
  primary_cause: HealthCause;
  confidence: number;        // 0–1
  secondary: HealthCause | null;
  factors: AttributionFactor[];
}

export interface AttributionFactor {
  cause: HealthCause;
  weight: number;    // 0–1
  evidence: string;
}

// ═══ Shadow Mesh Isolation ══════════════════════════════════════

export interface ShadowMeshState {
  active: boolean;
  load_index: number;       // 0–100
  bleed_into_health: boolean;
}

let shadowMeshState: ShadowMeshState = {
  active: false,
  load_index: 0,
  bleed_into_health: false,
};

export function getShadowMeshState(): ShadowMeshState {
  return { ...shadowMeshState };
}

export function updateShadowMeshState(updates: Partial<ShadowMeshState>): void {
  shadowMeshState = { ...shadowMeshState, ...updates };
}

// ═══ Registry State ═════════════════════════════════════════════

const registry = new Map<string, HealthRegistryEntry>();
const changeLog: Array<{ entry: HealthRegistryEntry; previous: HealthRegistryEntry | null }> = [];

// Breaker-to-score deterministic mapping (Section 6)
function breakerToScore(state: string): number {
  switch (state) {
    case 'closed': return 100;
    case 'half_open': return 80;  // Capped controlled degradation
    case 'open': return 60;       // Hard degrade
    default: return 85;           // Rerouting stabilizes at 85
  }
}

function breakerToStatus(state: string): HealthEntryStatus {
  switch (state) {
    case 'closed': return 'healthy';
    case 'half_open': return 'degraded';
    case 'open': return 'critical';
    default: return 'degraded';
  }
}

// ═══ Core Mutation ══════════════════════════════════════════════

export function updateHealthRegistry(
  module_id: string,
  status: HealthEntryStatus,
  cause: HealthCause,
  source: HealthSource,
  opts: {
    recovery_action?: string | null;
    breaker_state?: 'closed' | 'half_open' | 'open' | 'unknown';
    detail?: string;
    score_override?: number;
  } = {}
): HealthRegistryEntry {
  const breakerState = opts.breaker_state ?? 'unknown';

  // Shadow mesh isolation: if bleed is disabled, shadow events cannot lower health
  if (source === 'synthetic_shadow_event' && !shadowMeshState.bleed_into_health) {
    // Register the event but keep score at module's current level
    const existing = registry.get(module_id);
    const entry: HealthRegistryEntry = {
      module_id,
      status: 'shadow_event',
      cause,
      source: 'synthetic_shadow_event',
      truth_mode: SYSTEM_TRUTH_MODE.NARRATIVE,
      timestamp: new Date().toISOString(),
      recovery_action: opts.recovery_action ?? null,
      score: existing?.score ?? 100,       // Don't lower
      breaker_state: existing?.breaker_state ?? breakerState,
      detail: opts.detail ?? 'Shadow event (isolated — no health bleed)',
    };
    const prev = registry.get(module_id) ?? null;
    registry.set(module_id, entry);
    changeLog.push({ entry, previous: prev });
    return entry;
  }

  // Determine truth mode from source
  const truth_mode: TruthMode =
    source === 'telemetry' ? SYSTEM_TRUTH_MODE.VERIFIED :
    source === 'narrative_layer' ? SYSTEM_TRUTH_MODE.NARRATIVE :
    SYSTEM_TRUTH_MODE.INFERRED;

  // Deterministic score from breaker state (Section 6)
  const baseScore = breakerState !== 'unknown'
    ? breakerToScore(breakerState)
    : (opts.score_override ?? 100);

  // If breaker state is known, derive status deterministically
  const derivedStatus = breakerState !== 'unknown'
    ? breakerToStatus(breakerState)
    : status;

  const entry: HealthRegistryEntry = {
    module_id,
    status: derivedStatus,
    cause,
    source,
    truth_mode,
    timestamp: new Date().toISOString(),
    recovery_action: opts.recovery_action ?? null,
    score: Math.max(0, Math.min(100, baseScore)),
    breaker_state: breakerState,
    detail: opts.detail ?? '',
  };

  const prev = registry.get(module_id) ?? null;
  registry.set(module_id, entry);
  changeLog.push({ entry, previous: prev });

  // Emit for activity feed (Section 7)
  emit({
    module: 'system',
    event_type: 'health_registry_update',
    outcome: 'succeeded',
    data: {
      module_id,
      status: entry.status,
      cause,
      source,
      truth_mode,
      score: entry.score,
      breaker_state: breakerState,
    },
  });

  return entry;
}

// ═══ Recovery Logging (Section 7) ═══════════════════════════════

export function logRecovery(
  module_id: string,
  trigger: HealthCause,
  duration_ms: number,
  rerouted_to?: string
): void {
  emit({
    module: 'system',
    event_type: 'auto_recovery',
    outcome: 'succeeded',
    data: {
      event: 'auto_recovery',
      module_id,
      trigger,
      duration_ms,
      rerouted_to: rerouted_to ?? null,
    },
  });

  // Update registry to reflect recovery
  updateHealthRegistry(module_id, 'healthy', 'auto_recovery', 'telemetry', {
    breaker_state: 'closed',
    detail: `Auto-recovered from ${trigger} in ${duration_ms}ms${rerouted_to ? ` (rerouted to ${rerouted_to})` : ''}`,
    recovery_action: `auto_recovery → ${rerouted_to ?? 'self'}`,
  });
}

// ═══ Queries ════════════════════════════════════════════════════

export function getRegistryEntry(module_id: string): HealthRegistryEntry | null {
  return registry.get(module_id) ?? null;
}

export function getAllRegistryEntries(): HealthRegistryEntry[] {
  return Array.from(registry.values());
}

export function getRegistryChangeLog() {
  return [...changeLog];
}

/** Integrity check: returns modules whose reported dashboard score diverges from registry */
export function checkRegistryIntegrity(
  dashboardScores: Record<string, number>
): Array<{ module_id: string; registry_score: number; dashboard_score: number }> {
  const mismatches: Array<{ module_id: string; registry_score: number; dashboard_score: number }> = [];
  for (const [id, entry] of registry) {
    const dScore = dashboardScores[id];
    if (dScore !== undefined && Math.abs(dScore - entry.score) > 5) {
      mismatches.push({ module_id: id, registry_score: entry.score, dashboard_score: dScore });
    }
  }
  return mismatches;
}

// ═══ Health Attribution Engine (HAE) — Section 3 ════════════════

export function attributeHealthDrop(module_id: string): AttributionResult {
  const factors: AttributionFactor[] = [];

  // Factor 1: Circuit breaker state
  const entry = registry.get(module_id);
  if (entry) {
    if (entry.breaker_state === 'open') {
      factors.push({ cause: 'circuit_breaker', weight: 0.9, evidence: `Breaker OPEN for ${module_id}` });
    } else if (entry.breaker_state === 'half_open') {
      factors.push({ cause: 'circuit_breaker', weight: 0.5, evidence: `Breaker HALF_OPEN for ${module_id}` });
    }
  }

  // Factor 2: Shadow mesh load
  if (shadowMeshState.active && shadowMeshState.load_index > 50) {
    const weight = Math.min(0.8, shadowMeshState.load_index / 100);
    factors.push({ cause: 'mesh_load', weight, evidence: `Shadow mesh load index: ${shadowMeshState.load_index}` });
  }

  // Factor 3: Rate limiting (check registry for rate_limit cause entries)
  const rateLimitEntries = Array.from(registry.values()).filter(
    e => e.cause === 'rate_limit' && Date.now() - new Date(e.timestamp).getTime() < 60_000
  );
  if (rateLimitEntries.length > 0) {
    factors.push({ cause: 'rate_limit', weight: 0.6, evidence: `${rateLimitEntries.length} rate limit events in last 60s` });
  }

  // Factor 4: Provider latency
  const latencyEntries = Array.from(registry.values()).filter(
    e => e.cause === 'provider_latency' && Date.now() - new Date(e.timestamp).getTime() < 120_000
  );
  if (latencyEntries.length > 0) {
    factors.push({ cause: 'provider_latency', weight: 0.55, evidence: `${latencyEntries.length} provider latency events` });
  }

  // Factor 5: Shadow event bleed
  if (shadowMeshState.bleed_into_health && shadowMeshState.active) {
    factors.push({ cause: 'shadow_event', weight: 0.3, evidence: 'Shadow mesh bleed-into-health is active' });
  }

  // Sort by weight descending
  factors.sort((a, b) => b.weight - a.weight);

  const primary = factors[0] ?? { cause: 'unknown' as HealthCause, weight: 0 };
  const secondary = factors[1] ?? null;

  // Confidence = primary weight normalized
  const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
  const confidence = totalWeight > 0 ? Math.min(0.99, primary.weight / Math.max(1, totalWeight) + 0.3) : 0;

  return {
    primary_cause: primary.cause,
    confidence: Math.round(confidence * 100) / 100,
    secondary: secondary?.cause ?? null,
    factors,
  };
}

/** Get attribution summary string for dashboard display */
export function getAttributionSummary(module_id: string): string {
  const result = attributeHealthDrop(module_id);
  if (result.confidence === 0) return 'No degradation detected';

  const causeLabel = result.primary_cause.replace(/_/g, ' ');
  const pct = Math.round(result.confidence * 100);
  let summary = `Degradation attributed to: ${causeLabel} (${pct}% confidence)`;
  if (result.secondary) {
    summary += ` | Secondary: ${result.secondary.replace(/_/g, ' ')}`;
  }
  return summary;
}

// ═══ DECODE Truth Boundary (Section 1) ══════════════════════════

const INFRA_KEYWORDS = [
  'health', 'degradation', 'degraded', 'rate limit', 'latency',
  'routing', 'rerouting', 'shadow mesh', 'circuit breaker', 'breaker',
  'nexus', 'fleet', 'provider', 'module', 'offline', 'critical',
];

/** Check if a DECODE response references infrastructure topics */
export function referencesInfrastructure(text: string): boolean {
  const lower = text.toLowerCase();
  return INFRA_KEYWORDS.some(kw => lower.includes(kw));
}

/** Attach truth boundary metadata to a DECODE response */
export function attachTruthBoundary(
  responseText: string,
  moduleId?: string
): {
  text: string;
  truth_mode: TruthMode;
  attribution: AttributionResult | null;
  source_entry: HealthRegistryEntry | null;
} {
  if (!referencesInfrastructure(responseText)) {
    return {
      text: responseText,
      truth_mode: SYSTEM_TRUTH_MODE.NARRATIVE,
      attribution: null,
      source_entry: null,
    };
  }

  // Pull from registry
  const entry = moduleId ? registry.get(moduleId) : null;

  if (entry) {
    // Registry-backed — verified
    const attribution = attributeHealthDrop(moduleId!);
    return {
      text: responseText,
      truth_mode: entry.truth_mode,
      attribution,
      source_entry: entry,
    };
  }

  // No registry match — force INFERRED, add qualifier
  const qualifiedText = responseText.replace(
    /^/,
    '' // Don't mutate the text — the qualifier is communicated via truth_mode
  );

  return {
    text: qualifiedText,
    truth_mode: SYSTEM_TRUTH_MODE.INFERRED,
    attribution: null,
    source_entry: null,
  };
}

/** Get the qualifier prefix DECODE should prepend when truth_mode is INFERRED */
export function getInferredQualifier(): string {
  return 'Based on current signals...';
}

// ═══ Reset ══════════════════════════════════════════════════════

export function resetRegistry(): void {
  registry.clear();
  changeLog.length = 0;
}
