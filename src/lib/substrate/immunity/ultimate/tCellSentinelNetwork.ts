/**
 * IMMUNITY Ultimate — T-Cell Sentinel Network
 * 
 * Distributed sentinel processes patrolling node boundaries, detecting threats
 * that bypass perimeter defenses using Mahalanobis distance anomaly detection.
 * 
 * - Per-node sentinel agents with behavioral baselines
 * - Mahalanobis distance multivariate anomaly detection
 * - Sentinel communication mesh: real-time observation sharing
 * - Auto-escalation: consensus at ≥2 agreeing sentinels triggers response
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface SentinelAgent {
  nodeId: string;
  baseline: BehavioralBaseline;
  status: 'active' | 'learning' | 'alerting' | 'offline';
  alertCount: number;
  lastObservationAt: number;
  deployedAt: number;
}

export interface BehavioralBaseline {
  /** Mean vector for multivariate features */
  mean: number[];
  /** Inverse covariance diagonal (simplified) */
  invCovDiag: number[];
  /** Number of training samples */
  sampleCount: number;
  /** Feature names */
  featureNames: string[];
  /** Anomaly threshold (Mahalanobis distance) */
  threshold: number;
}

export interface SentinelObservation {
  sentinelNodeId: string;
  observedAt: number;
  featureVector: number[];
  mahalanobisDistance: number;
  isAnomaly: boolean;
}

export interface ConsensusAlert {
  id: string;
  agreeSentinels: string[];
  observation: SentinelObservation;
  consensusAt: number;
  escalated: boolean;
}

export interface SentinelNetworkHealth {
  totalSentinels: number;
  activeSentinels: number;
  learningSentinels: number;
  alertingSentinels: number;
  totalObservations: number;
  totalAlerts: number;
  consensusAlerts: number;
  avgMahalanobisDistance: number;
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const DEFAULT_THRESHOLD = 3.0; // Mahalanobis distance threshold
const CONSENSUS_REQUIRED = 2;
const MAX_OBSERVATIONS = 500;
const BASELINE_MIN_SAMPLES = 20;
const EMA_ALPHA = 0.1;

const sentinels = new Map<string, SentinelAgent>();
const observations: SentinelObservation[] = [];
const pendingAlerts = new Map<string, SentinelObservation[]>(); // key → observations from diff sentinels
const consensusAlerts: ConsensusAlert[] = [];
let observationCount = 0;
let avgDistanceEma = 0;

// ═══════════════════════════════════════════════════════════════
// CORE LOGIC
// ═══════════════════════════════════════════════════════════════

/** Deploy a sentinel on a node */
export function deploySentinel(
  nodeId: string,
  featureNames: string[],
  threshold = DEFAULT_THRESHOLD,
): SentinelAgent {
  const agent: SentinelAgent = {
    nodeId,
    baseline: {
      mean: new Array(featureNames.length).fill(0),
      invCovDiag: new Array(featureNames.length).fill(1),
      sampleCount: 0,
      featureNames,
      threshold,
    },
    status: 'learning',
    alertCount: 0,
    lastObservationAt: 0,
    deployedAt: Date.now(),
  };
  sentinels.set(nodeId, agent);
  return agent;
}

/** Feed a training sample to build baseline */
export function trainBaseline(nodeId: string, featureVector: number[]): boolean {
  const sentinel = sentinels.get(nodeId);
  if (!sentinel) return false;

  const bl = sentinel.baseline;
  const n = bl.sampleCount + 1;

  // Online mean update
  for (let i = 0; i < bl.mean.length && i < featureVector.length; i++) {
    bl.mean[i] = bl.mean[i] + (featureVector[i] - bl.mean[i]) / n;
  }

  // Online variance update (simplified diagonal covariance)
  if (n > 1) {
    for (let i = 0; i < bl.invCovDiag.length && i < featureVector.length; i++) {
      const diff = featureVector[i] - bl.mean[i];
      const variance = (diff * diff) / n;
      const avgVariance = ((n - 1) * (1 / bl.invCovDiag[i]) + variance) / n;
      bl.invCovDiag[i] = avgVariance > 0 ? 1 / avgVariance : 1;
    }
  }

  bl.sampleCount = n;

  // Transition to active when enough samples
  if (n >= BASELINE_MIN_SAMPLES && sentinel.status === 'learning') {
    sentinel.status = 'active';
  }

  return true;
}

/** Compute Mahalanobis distance for an observation */
export function computeMahalanobis(baseline: BehavioralBaseline, featureVector: number[]): number {
  let sum = 0;
  for (let i = 0; i < baseline.mean.length && i < featureVector.length; i++) {
    const diff = featureVector[i] - baseline.mean[i];
    sum += diff * diff * baseline.invCovDiag[i];
  }
  return Math.sqrt(sum);
}

/** Submit an observation from a sentinel */
export function observe(nodeId: string, featureVector: number[]): SentinelObservation | null {
  const sentinel = sentinels.get(nodeId);
  if (!sentinel || sentinel.status === 'offline') return null;

  // If still learning, just train
  if (sentinel.status === 'learning') {
    trainBaseline(nodeId, featureVector);
    return null;
  }

  const distance = computeMahalanobis(sentinel.baseline, featureVector);
  const isAnomaly = distance > sentinel.baseline.threshold;
  const now = Date.now();

  // Update EMA distance
  avgDistanceEma = avgDistanceEma === 0
    ? distance
    : EMA_ALPHA * distance + (1 - EMA_ALPHA) * avgDistanceEma;

  const obs: SentinelObservation = {
    sentinelNodeId: nodeId,
    observedAt: now,
    featureVector,
    mahalanobisDistance: Math.round(distance * 1000) / 1000,
    isAnomaly,
  };

  sentinel.lastObservationAt = now;
  observationCount++;

  // Store observation
  observations.push(obs);
  if (observations.length > MAX_OBSERVATIONS) observations.shift();

  // If anomaly, check for consensus
  if (isAnomaly) {
    sentinel.alertCount++;
    sentinel.status = 'alerting';
    checkConsensus(obs);
  } else if (sentinel.status === 'alerting') {
    sentinel.status = 'active';
  }

  return obs;
}

/** Check if multiple sentinels agree on an anomaly (consensus) */
function checkConsensus(obs: SentinelObservation): void {
  const window = 10_000; // 10s consensus window
  const now = obs.observedAt;

  // Find recent anomalies from OTHER sentinels
  const recentAnomalies = observations.filter(o =>
    o.isAnomaly &&
    o.sentinelNodeId !== obs.sentinelNodeId &&
    (now - o.observedAt) < window
  );

  const agreeingNodes = new Set<string>([obs.sentinelNodeId]);
  for (const a of recentAnomalies) agreeingNodes.add(a.sentinelNodeId);

  if (agreeingNodes.size >= CONSENSUS_REQUIRED) {
    const alert: ConsensusAlert = {
      id: `cons_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      agreeSentinels: Array.from(agreeingNodes),
      observation: obs,
      consensusAt: now,
      escalated: true,
    };
    consensusAlerts.push(alert);
    if (consensusAlerts.length > 100) consensusAlerts.shift();
  }
}

/** Get sentinel status for a node */
export function getSentinel(nodeId: string): SentinelAgent | null {
  return sentinels.get(nodeId) ?? null;
}

/** Get all sentinels */
export function getAllSentinels(): SentinelAgent[] {
  return Array.from(sentinels.values());
}

/** Get recent consensus alerts */
export function getConsensusAlerts(limit = 20): ConsensusAlert[] {
  return consensusAlerts.slice(-limit);
}

/** Decommission a sentinel */
export function decommission(nodeId: string): boolean {
  const s = sentinels.get(nodeId);
  if (!s) return false;
  s.status = 'offline';
  return true;
}

/** Get network health */
export function getSentinelNetworkHealth(): SentinelNetworkHealth {
  const all = Array.from(sentinels.values());
  return {
    totalSentinels: all.length,
    activeSentinels: all.filter(s => s.status === 'active').length,
    learningSentinels: all.filter(s => s.status === 'learning').length,
    alertingSentinels: all.filter(s => s.status === 'alerting').length,
    totalObservations: observationCount,
    totalAlerts: all.reduce((s, a) => s + a.alertCount, 0),
    consensusAlerts: consensusAlerts.length,
    avgMahalanobisDistance: Math.round(avgDistanceEma * 1000) / 1000,
  };
}
