/**
 * MEDIC — Vitals Dashboard Emitter
 * Structured vitals reports (heartbeat, temperature, pressure) for every node.
 * Emitted at configurable intervals, feeding ATLAS health visualization.
 * @module medic/vitalsDashboardEmitter
 * @version 9.0.0 — Surgeon
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface NodeVitals {
  nodeId: string;
  heartbeat: boolean;
  temperature: number;       // 0–100 (load/stress indicator)
  pressure: number;          // 0–100 (queue/backpressure indicator)
  oxygenation: number;       // 0–100 (resource availability)
  consciousness: 'alert' | 'drowsy' | 'unresponsive';
  lastChecked: number;
}

export interface VitalsReport {
  timestamp: number;
  totalNodes: number;
  healthyNodes: number;
  criticalNodes: number;
  unresponsiveNodes: number;
  avgTemperature: number;
  avgPressure: number;
  avgOxygenation: number;
  vitals: NodeVitals[];
}

type VitalsListener = (report: VitalsReport) => void;

// ── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_INTERVAL_MS = 30_000; // 30 seconds
const CRITICAL_TEMP = 80;
const CRITICAL_PRESSURE = 85;
const LOW_OXYGEN = 30;

// ── State ──────────────────────────────────────────────────────────────────

const vitalsMap = new Map<string, NodeVitals>();
const reportHistory: VitalsReport[] = [];
const MAX_HISTORY = 100;
const listeners: VitalsListener[] = [];
let emitterInterval: ReturnType<typeof setInterval> | null = null;

// ── Core ───────────────────────────────────────────────────────────────────

export function updateVitals(nodeId: string, vitals: Partial<Omit<NodeVitals, 'nodeId' | 'lastChecked'>>): NodeVitals {
  const existing = vitalsMap.get(nodeId) ?? {
    nodeId,
    heartbeat: true,
    temperature: 50,
    pressure: 30,
    oxygenation: 90,
    consciousness: 'alert' as const,
    lastChecked: Date.now(),
  };

  const updated: NodeVitals = {
    ...existing,
    ...vitals,
    nodeId,
    lastChecked: Date.now(),
  };

  // Derive consciousness
  if (!updated.heartbeat) {
    updated.consciousness = 'unresponsive';
  } else if (updated.temperature > CRITICAL_TEMP || updated.oxygenation < LOW_OXYGEN) {
    updated.consciousness = 'drowsy';
  } else {
    updated.consciousness = 'alert';
  }

  vitalsMap.set(nodeId, updated);
  return { ...updated };
}

export function generateReport(): VitalsReport {
  const vitals = Array.from(vitalsMap.values()).map(v => ({ ...v }));
  const total = vitals.length;

  const report: VitalsReport = {
    timestamp: Date.now(),
    totalNodes: total,
    healthyNodes: vitals.filter(v => v.consciousness === 'alert').length,
    criticalNodes: vitals.filter(v => v.temperature > CRITICAL_TEMP || v.pressure > CRITICAL_PRESSURE).length,
    unresponsiveNodes: vitals.filter(v => v.consciousness === 'unresponsive').length,
    avgTemperature: total > 0 ? Math.round(vitals.reduce((s, v) => s + v.temperature, 0) / total * 10) / 10 : 0,
    avgPressure: total > 0 ? Math.round(vitals.reduce((s, v) => s + v.pressure, 0) / total * 10) / 10 : 0,
    avgOxygenation: total > 0 ? Math.round(vitals.reduce((s, v) => s + v.oxygenation, 0) / total * 10) / 10 : 0,
    vitals,
  };

  reportHistory.push(report);
  if (reportHistory.length > MAX_HISTORY) reportHistory.splice(0, reportHistory.length - MAX_HISTORY);

  // Notify listeners (non-blocking)
  for (const listener of listeners) {
    try { listener(report); } catch { /* non-blocking */ }
  }

  return report;
}

export function startEmitter(intervalMs = DEFAULT_INTERVAL_MS): void {
  if (emitterInterval) return;
  emitterInterval = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    generateReport();
  }, intervalMs);
}

export function stopEmitter(): void {
  if (emitterInterval) {
    clearInterval(emitterInterval);
    emitterInterval = null;
  }
}

export function subscribeVitals(listener: VitalsListener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function getNodeVitals(nodeId: string): NodeVitals | undefined {
  const v = vitalsMap.get(nodeId);
  return v ? { ...v } : undefined;
}

export function getReportHistory(): VitalsReport[] {
  return [...reportHistory];
}

export function resetVitals(): void {
  vitalsMap.clear();
  reportHistory.length = 0;
  listeners.length = 0;
  stopEmitter();
}
