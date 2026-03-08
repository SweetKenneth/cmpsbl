/**
 * Governance Drift Detector
 * Fixed window init, proper wiring hooks
 * 
 * Monitors runtime behavioral drift from governance intent through:
 * - Mutation rate anomalies (mutations happening in OBSERVE mode)
 * - Signal severity escalation patterns
 * - Veto frequency spikes
 * - Subsystem activation patterns inconsistent with mode
 */

import { log } from '@/lib/system/log';
import { recordAudit } from '@/lib/substrate/audit-trail';
import { emit } from '@/lib/substrate/events';
import type { GovernanceMode } from '@/lib/system/governance';

export interface DriftSignal {
  type: 'mutation_anomaly' | 'escalation_pattern' | 'veto_spike' | 'activation_drift';
  severity: 'low' | 'medium' | 'high';
  message: string;
  metric: number;
  threshold: number;
  detectedAt: string;
}

export interface DriftReport {
  mode: GovernanceMode;
  timestamp: string;
  drifting: boolean;
  driftScore: number; // 0-100, higher = more drift
  signals: DriftSignal[];
}

/** Rolling windows for drift detection */
interface DriftWindow {
  mutations: number[];
  escalations: number[];
  vetoEvents: number[];
  activations: Map<string, number[]>;
}

const driftWindow: DriftWindow = {
  mutations: [0],
  escalations: [0],
  vetoEvents: [0],
  activations: new Map(),
};

const WINDOW_SIZE = 30;
const MAX_TRACKED_SUBSYSTEMS = 50;

/** Record a mutation event (call from mutation hooks) */
export function recordMutation(): void {
  if (driftWindow.mutations.length === 0) driftWindow.mutations.push(0);
  driftWindow.mutations[driftWindow.mutations.length - 1]++;
}

/** Record a signal escalation */
export function recordEscalation(): void {
  if (driftWindow.escalations.length === 0) driftWindow.escalations.push(0);
  driftWindow.escalations[driftWindow.escalations.length - 1]++;
}

/** Record a veto event */
export function recordVetoEvent(): void {
  if (driftWindow.vetoEvents.length === 0) driftWindow.vetoEvents.push(0);
  driftWindow.vetoEvents[driftWindow.vetoEvents.length - 1]++;
}

/** Record a subsystem activation */
export function recordActivation(subsystem: string): void {
  if (!driftWindow.activations.has(subsystem)) {
    // Cap tracked subsystems to prevent unbounded Map growth
    if (driftWindow.activations.size >= MAX_TRACKED_SUBSYSTEMS) return;
    driftWindow.activations.set(subsystem, [0]);
  }
  const arr = driftWindow.activations.get(subsystem)!;
  if (arr.length === 0) arr.push(0);
  arr[arr.length - 1]++;
}

/** Advance the window (call on interval tick) */
export function tickWindow(): void {
  driftWindow.mutations.push(0);
  driftWindow.escalations.push(0);
  driftWindow.vetoEvents.push(0);
  for (const [, arr] of driftWindow.activations) {
    arr.push(0);
  }
  // Trim all to WINDOW_SIZE
  trimArray(driftWindow.mutations);
  trimArray(driftWindow.escalations);
  trimArray(driftWindow.vetoEvents);
  for (const [, arr] of driftWindow.activations) {
    trimArray(arr);
  }
}

function trimArray(arr: number[]): void {
  while (arr.length > WINDOW_SIZE) arr.shift();
}

/**
 * Analyze current drift state against governance mode expectations.
 */
export function analyzeDrift(currentMode: GovernanceMode): DriftReport {
  const signals: DriftSignal[] = [];
  const now = new Date().toISOString();

  // 1. Mutation anomaly in OBSERVE/LOCKDOWN
  if (currentMode === 'OBSERVE' || currentMode === 'LOCKDOWN') {
    const recentMutations = sum(driftWindow.mutations.slice(-5));
    if (recentMutations > 0) {
      signals.push({
        type: 'mutation_anomaly',
        severity: currentMode === 'LOCKDOWN' ? 'high' : 'medium',
        message: `${recentMutations} mutations detected in ${currentMode} mode (expected: 0)`,
        metric: recentMutations,
        threshold: 0,
        detectedAt: now,
      });
    }
  }

  // 2. Escalation frequency spike
  const avgEscalations = avg(driftWindow.escalations);
  const recentEscalations = sum(driftWindow.escalations.slice(-3));
  if (avgEscalations > 0 && recentEscalations > avgEscalations * 3) {
    signals.push({
      type: 'escalation_pattern',
      severity: 'medium',
      message: `Escalation spike: ${recentEscalations} vs avg ${avgEscalations.toFixed(1)} — system may need mode change`,
      metric: recentEscalations,
      threshold: avgEscalations * 3,
      detectedAt: now,
    });
  }

  // 3. Veto frequency spike (stress indicator)
  const recentVetoes = sum(driftWindow.vetoEvents.slice(-3));
  if (recentVetoes > 3 && currentMode === 'ACTIVE') {
    signals.push({
      type: 'veto_spike',
      severity: 'high',
      message: `${recentVetoes} vetoes in ACTIVE mode — governance mode may be insufficient`,
      metric: recentVetoes,
      threshold: 3,
      detectedAt: now,
    });
  }

  // 4. Activation drift: subsystems active when they shouldn't be
  if (currentMode !== 'ACTIVE') {
    const suspectSubsystems = ['clm', 'dream', 'evolution'];
    for (const sub of suspectSubsystems) {
      const activations = driftWindow.activations.get(sub);
      if (activations) {
        const recent = sum(activations.slice(-5));
        if (recent > 0) {
          signals.push({
            type: 'activation_drift',
            severity: 'high',
            message: `${sub.toUpperCase()} had ${recent} activations in ${currentMode} mode`,
            metric: recent,
            threshold: 0,
            detectedAt: now,
          });
        }
      }
    }
  }

  const driftScore = Math.min(100, signals.reduce((s, sig) => {
    return s + (sig.severity === 'high' ? 30 : sig.severity === 'medium' ? 15 : 5);
  }, 0));

  const report: DriftReport = {
    mode: currentMode,
    timestamp: now,
    drifting: driftScore > 25,
    driftScore,
    signals,
  };

  if (report.drifting) {
    log.warn('governance', `Governance drift detected: score ${driftScore}, ${signals.length} signals`);

    recordAudit(
      'governance-drift-detector',
      'governance.drift.detected',
      'governance_mode',
      currentMode,
      currentMode,
      currentMode,
      { driftScore: String(driftScore), signalCount: String(signals.length) }
    );

    emit({
      module: 'GOVERNANCE',
      event_type: 'governance.drift.detected',
      outcome: 'failed',
      data: { mode: currentMode, driftScore, signalCount: signals.length },
    });
  }

  return report;
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
}

/** Reset drift state (for testing) */
export function resetDriftState(): void {
  driftWindow.mutations.length = 0;
  driftWindow.mutations.push(0);
  driftWindow.escalations.length = 0;
  driftWindow.escalations.push(0);
  driftWindow.vetoEvents.length = 0;
  driftWindow.vetoEvents.push(0);
  driftWindow.activations.clear();
}
