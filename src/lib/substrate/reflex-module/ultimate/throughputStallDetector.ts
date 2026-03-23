/**
 * REFLEX Ultimate — System 8: Throughput & Stall Detector
 * 
 * Real-time throughput monitoring with stall detection
 * (<1/sec after 100+ decisions), backpressure signaling,
 * and throughput trend analysis.
 * 
 * @module reflex/ultimate/throughputStallDetector
 */

// ── Types ────────────────────────────────────────────────────────

export type ThroughputStatus = 'healthy' | 'degraded' | 'stalled' | 'recovering';

export interface ThroughputWindow {
  startMs: number;
  endMs: number;
  decisionCount: number;
  throughputPerSec: number;
}

export interface StallEvent {
  id: string;
  detectedAt: number;
  throughputAtDetection: number;
  totalDecisionsAtDetection: number;
  resolvedAt: number | null;
  durationMs: number | null;
  status: 'active' | 'resolved';
}

export interface ThroughputReport {
  currentThroughput: number;
  peakThroughput: number;
  avgThroughput: number;
  status: ThroughputStatus;
  activeStalls: number;
  totalStalls: number;
  windows: ThroughputWindow[];
}

// ── Constants ────────────────────────────────────────────────────

const WINDOW_DURATION_MS = 5_000;   // 5-second windows
const STALL_THRESHOLD = 1;          // <1/sec = stall
const MIN_DECISIONS_FOR_STALL = 100; // Only detect stalls after 100+ decisions
const DEGRADED_THRESHOLD = 5;       // <5/sec = degraded

// ── State ────────────────────────────────────────────────────────

const windows: ThroughputWindow[] = [];
const stallEvents: StallEvent[] = [];
const MAX_WINDOWS = 200;
const MAX_STALLS = 100;

let totalDecisions = 0;
let currentWindowStart = Date.now();
let currentWindowCount = 0;
let peakThroughput = 0;

// ── Core API ────────────────────────────────────────────────────

/** Record a decision for throughput tracking */
export function recordDecision(): void {
  totalDecisions++;
  currentWindowCount++;

  const now = Date.now();
  if (now - currentWindowStart >= WINDOW_DURATION_MS) {
    finalizeWindow(now);
  }
}

function finalizeWindow(now: number): void {
  const elapsed = (now - currentWindowStart) / 1000;
  const throughput = elapsed > 0 ? currentWindowCount / elapsed : 0;

  const window: ThroughputWindow = {
    startMs: currentWindowStart,
    endMs: now,
    decisionCount: currentWindowCount,
    throughputPerSec: Math.round(throughput * 100) / 100,
  };

  windows.push(window);
  if (windows.length > MAX_WINDOWS) windows.splice(0, windows.length - MAX_WINDOWS);

  if (throughput > peakThroughput) peakThroughput = throughput;

  // Check for stalls
  checkForStall(throughput);

  // Reset window
  currentWindowStart = now;
  currentWindowCount = 0;
}

function checkForStall(throughput: number): void {
  if (totalDecisions < MIN_DECISIONS_FOR_STALL) return;

  const activeStall = stallEvents.find(s => s.status === 'active');

  if (throughput < STALL_THRESHOLD) {
    if (!activeStall) {
      const stall: StallEvent = {
        id: `stall-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        detectedAt: Date.now(),
        throughputAtDetection: throughput,
        totalDecisionsAtDetection: totalDecisions,
        resolvedAt: null,
        durationMs: null,
        status: 'active',
      };
      stallEvents.push(stall);
      if (stallEvents.length > MAX_STALLS) stallEvents.splice(0, stallEvents.length - MAX_STALLS);
    }
  } else if (activeStall && throughput >= STALL_THRESHOLD) {
    activeStall.status = 'resolved';
    activeStall.resolvedAt = Date.now();
    activeStall.durationMs = Date.now() - activeStall.detectedAt;
  }
}

/** Get current throughput status */
export function getThroughputStatus(): ThroughputStatus {
  if (windows.length === 0) return 'healthy';

  const recent = windows.slice(-3);
  const avgThroughput = recent.reduce((s, w) => s + w.throughputPerSec, 0) / recent.length;

  const activeStall = stallEvents.find(s => s.status === 'active');
  if (activeStall) return 'stalled';

  // Check if recovering from a recent stall
  const recentStall = stallEvents.filter(s => s.status === 'resolved').slice(-1)[0];
  if (recentStall && Date.now() - (recentStall.resolvedAt || 0) < 30_000) return 'recovering';

  if (avgThroughput < DEGRADED_THRESHOLD && totalDecisions >= MIN_DECISIONS_FOR_STALL) return 'degraded';

  return 'healthy';
}

/** Check if backpressure should be applied */
export function shouldApplyBackpressure(): boolean {
  const status = getThroughputStatus();
  return status === 'stalled' || status === 'degraded';
}

/** Get full throughput report */
export function getThroughputReport(): ThroughputReport {
  const recentWindows = windows.slice(-20);
  const avgThroughput = recentWindows.length > 0
    ? recentWindows.reduce((s, w) => s + w.throughputPerSec, 0) / recentWindows.length
    : 0;

  return {
    currentThroughput: recentWindows.length > 0
      ? recentWindows[recentWindows.length - 1].throughputPerSec
      : 0,
    peakThroughput: Math.round(peakThroughput * 100) / 100,
    avgThroughput: Math.round(avgThroughput * 100) / 100,
    status: getThroughputStatus(),
    activeStalls: stallEvents.filter(s => s.status === 'active').length,
    totalStalls: stallEvents.length,
    windows: recentWindows,
  };
}

export function getStallEvents(): StallEvent[] { return [...stallEvents]; }

export function getThroughputHealth() {
  const report = getThroughputReport();
  const statusScore: Record<ThroughputStatus, number> = { healthy: 100, recovering: 70, degraded: 40, stalled: 10 };

  return {
    totalDecisions,
    currentThroughput: report.currentThroughput,
    peakThroughput: report.peakThroughput,
    status: report.status,
    totalStalls: report.totalStalls,
    healthScore: statusScore[report.status],
  };
}

export function resetThroughputDetector(): void {
  windows.length = 0;
  stallEvents.length = 0;
  totalDecisions = 0;
  currentWindowStart = Date.now();
  currentWindowCount = 0;
  peakThroughput = 0;
}
