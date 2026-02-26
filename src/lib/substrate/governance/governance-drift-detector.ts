/**
 * Governance Drift Detector
 * SPARTA Epoch — Detects behavioral drift from governance intent
 * 
 * GAP: No mechanism existed to detect if the system's runtime behavior
 * has silently drifted from what the governance mode prescribes.
 * Unlike the compliance auditor (which checks flags), this detects
 * actual runtime behavioral drift through signal analysis.
 * 
 * Monitors:
 * - Mutation rate anomalies (mutations happening in OBSERVE mode)
 * - Signal severity escalation patterns
 * - Veto frequency spikes (system under stress but mode hasn't changed)
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
  mutations: number[];     // mutation counts per interval
  escalations: number[];   // signal escalation counts
  vetoEvents: number[];    // veto submissions per interval
  activations: Map<string, number[]>; // subsystem activation counts
}

const window: DriftWindow = {
  mutations: [],
  escalations: [],
  vetoEvents: [],
  activations: new Map(),
};

const WINDOW_SIZE = 30; // 30 intervals

/** Record a mutation event (call from mutation hooks) */
export function recordMutation(): void {
  ensureWindowEntry(window.mutations);
  window.mutations[window.mutations.length - 1]++;
}

/** Record a signal escalation */
export function recordEscalation(): void {
  ensureWindowEntry(window.escalations);
  window.escalations[window.escalations.length - 1]++;
}

/** Record a veto event */
export function recordVetoEvent(): void {
  ensureWindowEntry(window.vetoEvents);
  window.vetoEvents[window.vetoEvents.length - 1]++;
}

/** Record a subsystem activation */
export function recordActivation(subsystem: string): void {
  if (!window.activations.has(subsystem)) {
    window.activations.set(subsystem, []);
  }
  const arr = window.activations.get(subsystem)!;
  ensureWindowEntry(arr);
  arr[arr.length - 1]++;
}

function ensureWindowEntry(arr: number[]): void {
  if (arr.length === 0 || arr.length < WINDOW_SIZE) {
    arr.push(0);
  }
  while (arr.length > WINDOW_SIZE) arr.shift();
}

/** Advance the window (call on interval tick) */
export function tickWindow(): void {
  window.mutations.push(0);
  window.escalations.push(0);
  window.vetoEvents.push(0);
  for (const [, arr] of window.activations) {
    arr.push(0);
  }
  // Trim
  while (window.mutations.length > WINDOW_SIZE) window.mutations.shift();
  while (window.escalations.length > WINDOW_SIZE) window.escalations.shift();
  while (window.vetoEvents.length > WINDOW_SIZE) window.vetoEvents.shift();
  for (const [, arr] of window.activations) {
    while (arr.length > WINDOW_SIZE) arr.shift();
  }
}

/**
 * Analyze current drift state against governance mode expectations.
 */
export function analyzeDrift(currentMode: GovernanceMode): DriftReport {
  const signals: DriftSignal[] = [];
  const now = new Date().toISOString();

  // 1. Mutation anomaly in OBSERVE/LOCKDOWN
  if (currentMode === 'OBSERVE' || currentMode === 'LOCKDOWN') {
    const recentMutations = sum(window.mutations.slice(-5));
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
  const avgEscalations = avg(window.escalations);
  const recentEscalations = sum(window.escalations.slice(-3));
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
  const avgVetoes = avg(window.vetoEvents);
  const recentVetoes = sum(window.vetoEvents.slice(-3));
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
      const activations = window.activations.get(sub);
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
  window.mutations.length = 0;
  window.escalations.length = 0;
  window.vetoEvents.length = 0;
  window.activations.clear();
}
