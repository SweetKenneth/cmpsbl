/**
 * LINGUA CLM — Continuous Learning Module
 * Monitors translation quality, bridge health, schema mapping confidence,
 * and capacity utilization for autonomous self-healing.
 */

export interface LinguaCLMDiagnostic {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
  message: string;
  metric?: number;
  threshold?: number;
  timestamp: number;
}

export interface LinguaCLMReport {
  diagnostics: LinguaCLMDiagnostic[];
  score: number; // 0–100
  timestamp: number;
}

const THRESHOLDS = {
  /** Average fidelity below this triggers a warning */
  LOW_FIDELITY: 0.7,
  /** Bridge with zero translations after init is stale */
  STALE_BRIDGE_TRANSLATIONS: 0,
  /** Schema mapping confidence below this is suspect */
  LOW_SCHEMA_CONFIDENCE: 0.5,
  /** Translation capacity nearing limit */
  CAPACITY_WARN: 450,
  CAPACITY_MAX: 500,
  /** Schema capacity nearing limit */
  SCHEMA_CAPACITY_WARN: 80,
  SCHEMA_CAPACITY_MAX: 100,
  /** Latency spike threshold (ms) */
  HIGH_LATENCY_MS: 50,
  /** Minimum recent translations for meaningful fidelity signal */
  MIN_SAMPLE_SIZE: 5,
};

interface LinguaStateShape {
  initialized: boolean;
  translations: Array<{ fidelityScore: number; latencyMs: number; quality: string }>;
  bridges: Array<{ id: string; from: string; to: string; enabled: boolean; avgFidelity: number; totalTranslations: number }>;
  schemaMappings: Array<{ id: string; confidence: number; validated: boolean }>;
  totalTranslations: number;
  avgFidelity: number;
}

export function runLinguaCLM(state: LinguaStateShape): LinguaCLMReport {
  const diagnostics: LinguaCLMDiagnostic[] = [];
  let deductions = 0;

  if (!state.initialized) {
    diagnostics.push({ id: 'lingua-not-init', severity: 'critical', category: 'lifecycle', message: 'LINGUA module not initialized', timestamp: Date.now() });
    return { diagnostics, score: 0, timestamp: Date.now() };
  }

  // 1. Fidelity check
  const recent = state.translations.slice(-50);
  if (recent.length >= THRESHOLDS.MIN_SAMPLE_SIZE) {
    const avgFid = recent.reduce((s, t) => s + t.fidelityScore, 0) / recent.length;
    if (avgFid < THRESHOLDS.LOW_FIDELITY) {
      diagnostics.push({ id: 'lingua-low-fidelity', severity: 'warning', category: 'quality', message: `Average fidelity ${(avgFid * 100).toFixed(1)}% below ${THRESHOLDS.LOW_FIDELITY * 100}% threshold`, metric: avgFid, threshold: THRESHOLDS.LOW_FIDELITY, timestamp: Date.now() });
      deductions += 15;
    }
  }

  // 2. Latency spikes
  if (recent.length >= THRESHOLDS.MIN_SAMPLE_SIZE) {
    const highLatency = recent.filter(t => t.latencyMs > THRESHOLDS.HIGH_LATENCY_MS);
    const spikeRate = highLatency.length / recent.length;
    if (spikeRate > 0.2) {
      diagnostics.push({ id: 'lingua-latency-spikes', severity: 'warning', category: 'performance', message: `${(spikeRate * 100).toFixed(0)}% of recent translations exceed ${THRESHOLDS.HIGH_LATENCY_MS}ms`, metric: spikeRate, threshold: 0.2, timestamp: Date.now() });
      deductions += 10;
    }
  }

  // 3. Disabled bridges
  const disabledBridges = state.bridges.filter(b => !b.enabled);
  if (disabledBridges.length > 0) {
    diagnostics.push({ id: 'lingua-disabled-bridges', severity: 'warning', category: 'connectivity', message: `${disabledBridges.length} modality bridge(s) disabled`, metric: disabledBridges.length, timestamp: Date.now() });
    deductions += Math.min(disabledBridges.length * 3, 20);
  }

  // 4. Low-confidence schema mappings
  const lowConfSchemas = state.schemaMappings.filter(s => s.confidence < THRESHOLDS.LOW_SCHEMA_CONFIDENCE);
  if (lowConfSchemas.length > 0) {
    diagnostics.push({ id: 'lingua-low-schema-conf', severity: 'info', category: 'schema', message: `${lowConfSchemas.length} schema mapping(s) below ${THRESHOLDS.LOW_SCHEMA_CONFIDENCE * 100}% confidence`, metric: lowConfSchemas.length, threshold: THRESHOLDS.LOW_SCHEMA_CONFIDENCE, timestamp: Date.now() });
    deductions += Math.min(lowConfSchemas.length * 2, 10);
  }

  // 5. Translation capacity
  if (state.translations.length >= THRESHOLDS.CAPACITY_WARN) {
    const severity = state.translations.length >= THRESHOLDS.CAPACITY_MAX ? 'critical' : 'warning';
    diagnostics.push({ id: 'lingua-capacity', severity, category: 'capacity', message: `Translation store at ${state.translations.length}/${THRESHOLDS.CAPACITY_MAX}`, metric: state.translations.length, threshold: THRESHOLDS.CAPACITY_MAX, timestamp: Date.now() });
    deductions += severity === 'critical' ? 15 : 5;
  }

  // 6. Schema capacity
  if (state.schemaMappings.length >= THRESHOLDS.SCHEMA_CAPACITY_WARN) {
    diagnostics.push({ id: 'lingua-schema-capacity', severity: 'warning', category: 'capacity', message: `Schema store at ${state.schemaMappings.length}/${THRESHOLDS.SCHEMA_CAPACITY_MAX}`, metric: state.schemaMappings.length, threshold: THRESHOLDS.SCHEMA_CAPACITY_MAX, timestamp: Date.now() });
    deductions += 5;
  }

  const score = Math.max(0, Math.min(100, 100 - deductions));
  return { diagnostics, score, timestamp: Date.now() };
}
