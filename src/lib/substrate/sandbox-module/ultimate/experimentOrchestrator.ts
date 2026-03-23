/**
 * Experiment Orchestrator
 * 
 * Manages controlled experiments (A/B tests, mutation trials, chaos tests)
 * within isolated sandbox environments.
 * 
 * @module sandbox/ultimate/experimentOrchestrator
 * @version 9.0.0 — Terrarium
 */

// ── Types ──────────────────────────────────────────────────────

export type ExperimentPhase = 'DESIGN' | 'PROVISION' | 'EXECUTE' | 'OBSERVE' | 'CONCLUDE';

export interface Experiment {
  id: string;
  name: string;
  phase: ExperimentPhase;
  variants: ExperimentVariant[];
  hypothesis: string;
  startedAt: number | null;
  concludedAt: number | null;
  result: 'pending' | 'significant' | 'inconclusive' | 'rejected';
  promotedVariant: string | null;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  sandboxId: string;
  isControl: boolean;
  trafficPct: number;
  metrics: Record<string, number>;
  sampleSize: number;
}

export interface SignificanceResult {
  experimentId: string;
  significant: boolean;
  pValue: number;
  winningVariant: string | null;
  confidenceLevel: number;
}

// ── State ──────────────────────────────────────────────────────

const experiments = new Map<string, Experiment>();
const MAX_VARIANTS = 4;

// ── Core ───────────────────────────────────────────────────────

/** Create a new experiment */
export function createExperiment(
  id: string,
  name: string,
  hypothesis: string,
  variants: Array<{ id: string; name: string; sandboxId: string; isControl: boolean; trafficPct: number }>,
): Experiment {
  if (variants.length > MAX_VARIANTS) {
    throw new Error(`Max ${MAX_VARIANTS} variants allowed`);
  }
  const totalTraffic = variants.reduce((s, v) => s + v.trafficPct, 0);
  if (Math.abs(totalTraffic - 100) > 0.01) {
    throw new Error(`Traffic must sum to 100%, got ${totalTraffic}%`);
  }

  const experiment: Experiment = {
    id, name, hypothesis, phase: 'DESIGN',
    variants: variants.map(v => ({ ...v, metrics: {}, sampleSize: 0 })),
    startedAt: null, concludedAt: null,
    result: 'pending', promotedVariant: null,
  };
  experiments.set(id, experiment);
  return experiment;
}

/** Advance experiment phase */
export function advancePhase(experimentId: string): ExperimentPhase | null {
  const exp = experiments.get(experimentId);
  if (!exp) return null;

  const order: ExperimentPhase[] = ['DESIGN', 'PROVISION', 'EXECUTE', 'OBSERVE', 'CONCLUDE'];
  const idx = order.indexOf(exp.phase);
  if (idx < order.length - 1) {
    exp.phase = order[idx + 1];
    if (exp.phase === 'EXECUTE' && !exp.startedAt) exp.startedAt = Date.now();
    if (exp.phase === 'CONCLUDE') exp.concludedAt = Date.now();
  }
  return exp.phase;
}

/** Record metric observation for a variant */
export function recordMetric(experimentId: string, variantId: string, metricName: string, value: number): void {
  const exp = experiments.get(experimentId);
  if (!exp) return;
  const variant = exp.variants.find(v => v.id === variantId);
  if (!variant) return;

  // Running average
  const prev = variant.metrics[metricName] ?? 0;
  variant.sampleSize++;
  variant.metrics[metricName] = prev + (value - prev) / variant.sampleSize;
}

/** Calculate statistical significance (simplified z-test) */
export function checkSignificance(experimentId: string, metricName: string): SignificanceResult | null {
  const exp = experiments.get(experimentId);
  if (!exp || exp.variants.length < 2) return null;

  const control = exp.variants.find(v => v.isControl);
  const treatments = exp.variants.filter(v => !v.isControl);
  if (!control || treatments.length === 0) return null;

  const controlVal = control.metrics[metricName] ?? 0;
  let bestTreatment = treatments[0];
  let maxDiff = 0;

  for (const t of treatments) {
    const diff = Math.abs((t.metrics[metricName] ?? 0) - controlVal);
    if (diff > maxDiff) { maxDiff = diff; bestTreatment = t; }
  }

  // Simplified significance: need 30+ samples and >5% difference
  const minSamples = Math.min(control.sampleSize, bestTreatment.sampleSize);
  const pctDiff = controlVal !== 0 ? maxDiff / Math.abs(controlVal) : 0;
  const significant = minSamples >= 30 && pctDiff >= 0.05;
  const pValue = significant ? 0.03 : 0.5; // Simplified

  return {
    experimentId, significant, pValue,
    winningVariant: significant ? bestTreatment.id : null,
    confidenceLevel: significant ? 0.95 : 0.5,
  };
}

/** Promote a winning variant */
export function promoteVariant(experimentId: string, variantId: string): boolean {
  const exp = experiments.get(experimentId);
  if (!exp) return false;
  exp.promotedVariant = variantId;
  exp.result = 'significant';
  exp.phase = 'CONCLUDE';
  exp.concludedAt = Date.now();
  return true;
}

export function getExperiment(id: string): Experiment | undefined { return experiments.get(id); }
export function getAllExperiments(): Experiment[] { return Array.from(experiments.values()); }

export function getExperimentHealth() {
  const all = Array.from(experiments.values());
  return {
    totalExperiments: all.length,
    active: all.filter(e => e.phase === 'EXECUTE' || e.phase === 'OBSERVE').length,
    concluded: all.filter(e => e.phase === 'CONCLUDE').length,
    significantResults: all.filter(e => e.result === 'significant').length,
  };
}

export function resetExperiments(): void {
  experiments.clear();
}
