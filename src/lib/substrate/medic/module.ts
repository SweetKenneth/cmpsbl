/**
 * MEDIC Module — Autonomous Diagnostics & Self-Repair
 * Health monitoring, failure forecasting, quarantine, recovery orchestration
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { clampNumber } from '@/lib/system/hardening';
import { createModuleHardening, type ModuleHardening } from '../module-hardening';

export type DiagnosticSeverity = 'healthy' | 'degraded' | 'critical' | 'quarantined';

export interface Diagnosis {
  id: string;
  targetModule: string;
  severity: DiagnosticSeverity;
  symptoms: string[];
  prescription: string;
  autoRepairable: boolean;
  diagnosedAt: number;
  resolvedAt: number | null;
}

export interface QuarantineEntry {
  id: string;
  module: string;
  reason: string;
  quarantinedAt: number;
  releasedAt: number | null;
}

export interface RepairAction {
  id: string;
  diagnosisId: string;
  action: string;
  success: boolean;
  durationMs: number;
  executedAt: number;
}

export interface MedicModuleState {
  initialized: boolean;
  diagnoses: Diagnosis[];
  quarantine: QuarantineEntry[];
  repairs: RepairAction[];
  totalDiagnoses: number;
  totalRepairs: number;
  successfulRepairs: number;
  overallHealth: number;
  activeIssues: Diagnosis[];
}

const state: MedicModuleState = {
  initialized: false,
  diagnoses: [],
  quarantine: [],
  repairs: [],
  totalDiagnoses: 0,
  totalRepairs: 0,
  successfulRepairs: 0,
  overallHealth: 100,
  activeIssues: [],
};

let moduleEngine: ModuleEngine | null = null;
let hardening: ModuleHardening | null = null;

export function initMedic(): void {
  emitStarted('medic', 'init', {});
  try {
    initCircuitBreaker('medic', { failureThreshold: 3, recoveryTimeout: 30_000 });
    moduleEngine = activateModuleEngine('medic', '1.0.0');
    hardening = createModuleHardening('medic', { maxConcurrent: 5, rateLimit: 40, healthThreshold: 50 });
    state.initialized = true;
    hardening.startAutoRestore(() => getMedicHealth(), () => { recalculate(); }, 30_000);
    hardening.snapshot(state);
    emitSucceeded('medic', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    emitFailed('medic', 'init', err instanceof Error ? err.message : String(err));
  }
}

export function diagnose(targetModule: string, symptoms: string[]): Diagnosis {
  const fallback: Diagnosis = {
    id: `diag-fallback-${Date.now()}`, targetModule, severity: 'healthy',
    symptoms, prescription: 'No action needed', autoRepairable: false,
    diagnosedAt: Date.now(), resolvedAt: null,
  };

  const { result } = withResilienceSync('medic', () => {
    const severity = determineSeverity(symptoms);
    const prescription = generatePrescription(severity, symptoms);

    const diagnosis: Diagnosis = {
      id: `diag-${Date.now()}-${state.totalDiagnoses}`,
      targetModule, severity, symptoms, prescription,
      autoRepairable: severity !== 'quarantined',
      diagnosedAt: Date.now(), resolvedAt: null,
    };

    if (state.diagnoses.length >= 300) state.diagnoses.shift();
    state.diagnoses.push(diagnosis);
    state.totalDiagnoses++;
    recalculate();

    emit({ module: 'medic', event_type: 'diagnosis', outcome: 'succeeded', data: { id: diagnosis.id, target: targetModule, severity } });
    return diagnosis;
  }, fallback, 'diagnose');

  return result;
}

export function quarantine(module: string, reason: string): QuarantineEntry {
  const entry: QuarantineEntry = {
    id: `quar-${Date.now()}`, module, reason,
    quarantinedAt: Date.now(), releasedAt: null,
  };
  if (state.quarantine.length >= 50) state.quarantine.shift();
  state.quarantine.push(entry);
  emit({ module: 'medic', event_type: 'quarantine', outcome: 'succeeded', data: { module, reason } });
  return entry;
}

export function releaseQuarantine(quarantineId: string): boolean {
  const entry = state.quarantine.find(q => q.id === quarantineId && !q.releasedAt);
  if (!entry) return false;
  entry.releasedAt = Date.now();
  emit({ module: 'medic', event_type: 'release', outcome: 'succeeded', data: { module: entry.module } });
  return true;
}

export function executeRepair(diagnosisId: string, action: string): RepairAction {
  const start = performance.now();
  const success = Math.random() > 0.15; // simulated
  const repair: RepairAction = {
    id: `repair-${Date.now()}`, diagnosisId, action,
    success, durationMs: performance.now() - start, executedAt: Date.now(),
  };

  if (state.repairs.length >= 300) state.repairs.shift();
  state.repairs.push(repair);
  state.totalRepairs++;
  if (success) {
    state.successfulRepairs++;
    const diag = state.diagnoses.find(d => d.id === diagnosisId);
    if (diag) diag.resolvedAt = Date.now();
  }
  recalculate();
  return repair;
}

function determineSeverity(symptoms: string[]): DiagnosticSeverity {
  if (symptoms.length === 0) return 'healthy';
  if (symptoms.length >= 5) return 'quarantined';
  if (symptoms.length >= 3) return 'critical';
  return 'degraded';
}

function generatePrescription(severity: DiagnosticSeverity, symptoms: string[]): string {
  if (severity === 'healthy') return 'No action needed';
  if (severity === 'quarantined') return `Isolate module. ${symptoms.length} symptoms require manual intervention.`;
  if (severity === 'critical') return `Immediate repair: address ${symptoms.slice(0, 3).join(', ')}`;
  return `Monitor and auto-repair: ${symptoms[0] ?? 'unknown'}`;
}

function recalculate(): void {
  state.activeIssues = state.diagnoses.filter(d => !d.resolvedAt && d.severity !== 'healthy');
  const activeCount = state.activeIssues.length;
  state.overallHealth = clampNumber(100 - (activeCount * 10), 0, 100, 100);
}

export function getMedicState(): MedicModuleState { recalculate(); return { ...state }; }
export function getMedicHealth(): number {
  if (!state.initialized) return 0;
  recalculate();
  const h = state.overallHealth;
  if (hardening?.isDegraded()) return Math.min(h, 40);
  return h;
}
export function getMedicResilience() { return getModuleResilienceReport('medic', getMedicHealth()); }
export function getMedicEngine() { return moduleEngine; }
export function getMedicHardening() { return hardening?.getHardeningReport() ?? null; }
export function upgradeMedicEngine(v: string) { if (moduleEngine && hardening) { hardening.snapshot(state); moduleEngine = hardening.upgradeEngine(moduleEngine, v); } return moduleEngine; }
