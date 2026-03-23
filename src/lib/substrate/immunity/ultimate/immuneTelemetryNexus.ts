/**
 * IMMUNITY Ultimate — Immune Telemetry Nexus
 * 
 * Unified observability for the entire immune system.
 * - Threat Detection Rate (TDR)
 * - Mean Time to Immunity (MTTI)
 * - Response efficiency
 * - Vaccination coverage
 * - Arms race velocity
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ImmuneTelemetryEvent {
  id: string;
  eventType: 'detection' | 'response' | 'neutralization' | 'vaccination' | 'recovery' | 'autoimmune';
  sourceSystem: string;
  timestamp: number;
  metadata: Record<string, unknown>;
}

export interface ThreatDetectionMetrics {
  threatsDetected: number;
  threatsMissed: number;
  detectionRate: number;         // 0–1
  avgDetectionLatencyMs: number;
}

export interface MeanTimeToImmunity {
  mttiMs: number;                // avg time from first detection to antibody deployed
  samples: number;
  fastest: number;
  slowest: number;
}

export interface ResponseEfficiency {
  totalResponses: number;
  resourcesConsumed: number;     // abstract units
  threatsNeutralized: number;
  efficiencyRatio: number;       // neutralized / resources
}

export interface ImmuneTelemetryHealth {
  version: string;
  totalEvents: number;
  detectionRate: number;
  mttiMs: number;
  responseEfficiency: number;
  vaccinationCoverage: number;
  armsRaceVelocity: number;
  overallImmuneHealth: number;  // 0–100 composite
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const MAX_EVENTS = 1000;
const EMA_ALPHA = 0.2;

const events: ImmuneTelemetryEvent[] = [];

// Detection metrics
let detectedCount = 0;
let missedCount = 0;
let detectionLatencyEma = 0;

// MTTI tracking
const mttiSamples: number[] = [];

// Response efficiency
let totalResponseResources = 0;
let totalNeutralized = 0;

// Vaccination coverage
let vaccinatedNodeCount = 0;
let totalNodeCount = 0;

// Arms race
let armsRaceVelocityEma = 1.0;

// ═══════════════════════════════════════════════════════════════
// CORE LOGIC
// ═══════════════════════════════════════════════════════════════

/** Emit a telemetry event */
export function emit(
  eventType: ImmuneTelemetryEvent['eventType'],
  sourceSystem: string,
  metadata: Record<string, unknown> = {},
): ImmuneTelemetryEvent {
  const event: ImmuneTelemetryEvent = {
    id: `ite_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    eventType,
    sourceSystem,
    timestamp: Date.now(),
    metadata,
  };

  events.push(event);
  if (events.length > MAX_EVENTS) events.shift();
  return event;
}

/** Record a threat detection (or miss) */
export function recordDetection(detected: boolean, latencyMs: number): void {
  if (detected) {
    detectedCount++;
    detectionLatencyEma = detectionLatencyEma === 0
      ? latencyMs
      : EMA_ALPHA * latencyMs + (1 - EMA_ALPHA) * detectionLatencyEma;
  } else {
    missedCount++;
  }
}

/** Record MTTI sample (time from detection to antibody) */
export function recordMTTI(durationMs: number): void {
  mttiSamples.push(durationMs);
  if (mttiSamples.length > 200) mttiSamples.shift();
}

/** Record response resource consumption */
export function recordResponseEfficiency(resourcesUsed: number, neutralized: number): void {
  totalResponseResources += resourcesUsed;
  totalNeutralized += neutralized;
}

/** Update vaccination coverage */
export function updateVaccinationCoverage(vaccinated: number, total: number): void {
  vaccinatedNodeCount = vaccinated;
  totalNodeCount = total;
}

/** Update arms race velocity */
export function updateArmsRaceVelocity(velocity: number): void {
  armsRaceVelocityEma = EMA_ALPHA * velocity + (1 - EMA_ALPHA) * armsRaceVelocityEma;
}

/** Get threat detection metrics */
export function getDetectionMetrics(): ThreatDetectionMetrics {
  const total = detectedCount + missedCount;
  return {
    threatsDetected: detectedCount,
    threatsMissed: missedCount,
    detectionRate: total > 0 ? Math.round((detectedCount / total) * 100) / 100 : 1,
    avgDetectionLatencyMs: Math.round(detectionLatencyEma),
  };
}

/** Get MTTI metrics */
export function getMTTI(): MeanTimeToImmunity {
  if (mttiSamples.length === 0) {
    return { mttiMs: 0, samples: 0, fastest: 0, slowest: 0 };
  }
  const sorted = [...mttiSamples].sort((a, b) => a - b);
  return {
    mttiMs: Math.round(mttiSamples.reduce((a, b) => a + b, 0) / mttiSamples.length),
    samples: mttiSamples.length,
    fastest: sorted[0],
    slowest: sorted[sorted.length - 1],
  };
}

/** Get response efficiency */
export function getResponseEfficiency(): ResponseEfficiency {
  return {
    totalResponses: totalNeutralized,
    resourcesConsumed: totalResponseResources,
    threatsNeutralized: totalNeutralized,
    efficiencyRatio: totalResponseResources > 0
      ? Math.round((totalNeutralized / totalResponseResources) * 100) / 100
      : 0,
  };
}

/** Get recent events */
export function getRecentEvents(limit = 20): ImmuneTelemetryEvent[] {
  return events.slice(-limit);
}

/** Get events by type */
export function getEventsByType(type: ImmuneTelemetryEvent['eventType']): ImmuneTelemetryEvent[] {
  return events.filter(e => e.eventType === type);
}

/** Get comprehensive health */
export function getImmuneTelemetryHealth(): ImmuneTelemetryHealth {
  const detection = getDetectionMetrics();
  const mtti = getMTTI();
  const efficiency = getResponseEfficiency();
  const coverage = totalNodeCount > 0 ? vaccinatedNodeCount / totalNodeCount : 0;

  // Composite health score
  const health = Math.round(
    (detection.detectionRate * 30 +
     Math.min(1, 1 - mtti.mttiMs / 60_000) * 20 +
     Math.min(1, efficiency.efficiencyRatio) * 20 +
     coverage * 15 +
     Math.min(1, armsRaceVelocityEma) * 15) * 100
  ) / 100;

  return {
    version: '9.0.0',
    totalEvents: events.length,
    detectionRate: detection.detectionRate,
    mttiMs: mtti.mttiMs,
    responseEfficiency: efficiency.efficiencyRatio,
    vaccinationCoverage: Math.round(coverage * 100) / 100,
    armsRaceVelocity: Math.round(armsRaceVelocityEma * 100) / 100,
    overallImmuneHealth: Math.max(0, Math.min(100, health)),
  };
}

/** Reset telemetry */
export function resetTelemetry(): void {
  events.length = 0;
  detectedCount = 0;
  missedCount = 0;
  detectionLatencyEma = 0;
  mttiSamples.length = 0;
  totalResponseResources = 0;
  totalNeutralized = 0;
  vaccinatedNodeCount = 0;
  totalNodeCount = 0;
  armsRaceVelocityEma = 1.0;
}
