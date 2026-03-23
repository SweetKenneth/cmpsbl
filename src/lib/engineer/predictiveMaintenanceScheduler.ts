/**
 * ENGINEER — Predictive Maintenance Scheduler
 * Time-series forecasting of component degradation using EMA decay curves.
 * Schedules repairs BEFORE failures occur.
 * @module engineer/predictiveMaintenanceScheduler
 * @version 9.0.0 — Foundry
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface DegradationSample {
  nodeId: string;
  healthScore: number;      // 0–100
  timestamp: number;        // epoch ms
}

export interface DegradationForecast {
  nodeId: string;
  currentHealth: number;
  emaHealth: number;
  decayRate: number;         // health points lost per hour
  estimatedFailureAt: number | null;  // epoch ms or null if stable
  urgency: 'none' | 'low' | 'medium' | 'high' | 'critical';
  scheduledRepairAt: number | null;
}

interface NodeTimeSeries {
  samples: DegradationSample[];
  emaHealth: number;
  lastDecayRate: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const EMA_ALPHA = 0.3;
const MAX_SAMPLES = 200;
const FAILURE_THRESHOLD = 30;      // health below this = failure
const REPAIR_LEAD_TIME_MS = 15 * 60 * 1000; // schedule repair 15 min before predicted failure

// ── State ──────────────────────────────────────────────────────────────────

const seriesMap = new Map<string, NodeTimeSeries>();

// ── Core ───────────────────────────────────────────────────────────────────

function getOrCreateSeries(nodeId: string): NodeTimeSeries {
  if (!seriesMap.has(nodeId)) {
    seriesMap.set(nodeId, { samples: [], emaHealth: 100, lastDecayRate: 0 });
  }
  return seriesMap.get(nodeId)!;
}

export function recordHealthSample(sample: DegradationSample): void {
  const series = getOrCreateSeries(sample.nodeId);
  series.samples.push(sample);
  if (series.samples.length > MAX_SAMPLES) {
    series.samples = series.samples.slice(-MAX_SAMPLES);
  }
  // Update EMA
  series.emaHealth = EMA_ALPHA * sample.healthScore + (1 - EMA_ALPHA) * series.emaHealth;
  // Compute decay rate (health points per hour)
  if (series.samples.length >= 2) {
    const recent = series.samples.slice(-10);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const hoursElapsed = (last.timestamp - first.timestamp) / (3600 * 1000);
    if (hoursElapsed > 0) {
      series.lastDecayRate = (first.healthScore - last.healthScore) / hoursElapsed;
    }
  }
}

export function forecastNode(nodeId: string): DegradationForecast {
  const series = getOrCreateSeries(nodeId);
  const current = series.samples.length > 0
    ? series.samples[series.samples.length - 1].healthScore
    : 100;
  const decay = series.lastDecayRate;
  const now = Date.now();

  let estimatedFailureAt: number | null = null;
  if (decay > 0 && series.emaHealth > FAILURE_THRESHOLD) {
    const hoursToFailure = (series.emaHealth - FAILURE_THRESHOLD) / decay;
    estimatedFailureAt = now + hoursToFailure * 3600 * 1000;
  } else if (series.emaHealth <= FAILURE_THRESHOLD) {
    estimatedFailureAt = now; // already failing
  }

  let urgency: DegradationForecast['urgency'] = 'none';
  if (estimatedFailureAt !== null) {
    const hoursRemaining = (estimatedFailureAt - now) / (3600 * 1000);
    if (hoursRemaining <= 0) urgency = 'critical';
    else if (hoursRemaining < 1) urgency = 'high';
    else if (hoursRemaining < 6) urgency = 'medium';
    else if (hoursRemaining < 24) urgency = 'low';
  }

  const scheduledRepairAt = estimatedFailureAt !== null && estimatedFailureAt > now
    ? estimatedFailureAt - REPAIR_LEAD_TIME_MS
    : estimatedFailureAt;

  return {
    nodeId,
    currentHealth: current,
    emaHealth: Math.round(series.emaHealth * 100) / 100,
    decayRate: Math.round(decay * 1000) / 1000,
    estimatedFailureAt,
    urgency,
    scheduledRepairAt,
  };
}

export function forecastAll(): DegradationForecast[] {
  return Array.from(seriesMap.keys()).map(forecastNode);
}

export function getScheduledRepairs(): DegradationForecast[] {
  return forecastAll()
    .filter(f => f.scheduledRepairAt !== null && f.urgency !== 'none')
    .sort((a, b) => (a.scheduledRepairAt ?? Infinity) - (b.scheduledRepairAt ?? Infinity));
}

export function clearSeries(nodeId?: string): void {
  if (nodeId) seriesMap.delete(nodeId);
  else seriesMap.clear();
}
