/**
 * INTEL → NEXUS → CLM Bridge
 * 
 * Connects the Control Plane INTEL layer to the NEXUS router so CLM
 * cycles actually execute through real AI providers. This is the ignition
 * layer — when INTEL boots, it activates CLM via this bridge.
 * 
 * Flow:
 *   INTEL Panel mount → bridge.start() → NEXUS-routed CLM cycles
 *   Each cycle result is fed back to INTEL aggregator as a signal.
 */

import { intelAggregator } from './aggregator';
import { clmTopicPipeline } from '../clm/topic-pipeline';
import { isControlPlaneEnabled } from '../config';
import {
  getCLMStatus,
  enableCLM,
  runCLMCycle,
  isCLMReady,
} from '@/lib/substrate/clm';
import type { LearningJobResult } from '@/lib/substrate/clm/config';

// ═══════════════════════════════════════════════════════════════════════════════
// BRIDGE STATE
// ═══════════════════════════════════════════════════════════════════════════════

interface BridgeState {
  running: boolean;
  intervalId: ReturnType<typeof setInterval> | null;
  cyclesCompleted: number;
  cyclesFailed: number;
  lastCycleAt: string | null;
  startedAt: string | null;
}

const state: BridgeState = {
  running: false,
  intervalId: null,
  cyclesCompleted: 0,
  cyclesFailed: 0,
  lastCycleAt: null,
  startedAt: null,
};

// CLM cycle interval — 6 minutes (aligned with budget governor spacing)
const CLM_CYCLE_INTERVAL_MS = 6 * 60 * 1000;

// ═══════════════════════════════════════════════════════════════════════════════
// BRIDGE LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Start the INTEL → NEXUS → CLM bridge.
 * Called when the INTEL panel mounts or the Control Plane enables.
 */
export function startBridge(): { ok: boolean; reason: string } {
  if (state.running) {
    return { ok: true, reason: 'Bridge already running' };
  }

  if (!isControlPlaneEnabled()) {
    return { ok: false, reason: 'Control Plane is disabled' };
  }

  // Enable CLM if not already enabled
  const clmStatus = getCLMStatus();
  if (!clmStatus.enabled) {
    enableCLM();
    intelAggregator.ingest({
      source: 'NEXUS-CLM-Bridge',
      category: 'stability',
      severity: 'info',
      headline: 'CLM Activated via INTEL Bridge',
      detail: 'Constant Learning Mode enabled through NEXUS router integration.',
      timestamp: new Date().toISOString(),
      data: { trigger: 'intel_bridge_start' },
      fingerprint: 'bridge:clm-activated',
    });
  }

  // Run first cycle immediately, then schedule
  state.running = true;
  state.startedAt = new Date().toISOString();

  // Kick off first cycle (non-blocking)
  executeBridgeCycle();

  // Schedule recurring cycles
  state.intervalId = setInterval(() => {
    executeBridgeCycle();
  }, CLM_CYCLE_INTERVAL_MS);

  intelAggregator.ingest({
    source: 'NEXUS-CLM-Bridge',
    category: 'stability',
    severity: 'info',
    headline: 'INTEL → NEXUS → CLM Bridge Started',
    detail: `Bridge active. CLM cycles will execute every ${CLM_CYCLE_INTERVAL_MS / 60000} minutes via NEXUS router.`,
    timestamp: new Date().toISOString(),
    data: { interval_ms: CLM_CYCLE_INTERVAL_MS },
    fingerprint: 'bridge:started',
  });

  return { ok: true, reason: 'Bridge started — CLM cycles running via NEXUS' };
}

/**
 * Stop the bridge (called on Control Plane disable or unmount).
 */
export function stopBridge(): void {
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  state.running = false;

  intelAggregator.ingest({
    source: 'NEXUS-CLM-Bridge',
    category: 'stability',
    severity: 'info',
    headline: 'INTEL → NEXUS → CLM Bridge Stopped',
    detail: `Bridge stopped after ${state.cyclesCompleted} cycles (${state.cyclesFailed} failed).`,
    timestamp: new Date().toISOString(),
    data: { cycles_completed: state.cyclesCompleted, cycles_failed: state.cyclesFailed },
    fingerprint: 'bridge:stopped',
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CYCLE EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

async function executeBridgeCycle(): Promise<void> {
  if (!state.running) return;

  const ready = isCLMReady();
  if (!ready.ready) {
    console.log(`[INTEL→NEXUS→CLM] Skipping cycle: ${ready.reason}`);
    return;
  }

  try {
    const result = await runCLMCycle();
    state.lastCycleAt = new Date().toISOString();

    if (result) {
      state.cyclesCompleted++;
      feedResultToIntel(result);
      feedResultToTopicPipeline(result);
    }
  } catch (err) {
    state.cyclesFailed++;
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';

    intelAggregator.ingest({
      source: 'NEXUS-CLM-Bridge',
      category: 'reliability',
      severity: 'warn',
      headline: 'CLM Cycle Failed',
      detail: errorMsg,
      timestamp: new Date().toISOString(),
      data: { error: errorMsg, total_failures: state.cyclesFailed },
      fingerprint: `bridge:cycle-error:${errorMsg.slice(0, 30)}`,
    });
  }
}

/**
 * Feed CLM result back to INTEL aggregator as a signal.
 */
function feedResultToIntel(result: LearningJobResult): void {
  const severity = result.success ? 'info' : 'warn';
  
  intelAggregator.ingest({
    source: 'CLM',
    category: 'learning',
    severity,
    headline: result.success
      ? `CLM Learned: ${result.topic}`
      : `CLM Failed: ${result.topic}`,
    detail: result.success
      ? `${result.unitsUsed} units used, ${result.graphNodesCreated} graph nodes, ${result.graphEdgesCreated} edges. Reflection: ${result.reflectionGenerated ? 'yes' : 'no'}.`
      : `Error: ${result.error}`,
    timestamp: result.timestamp,
    data: {
      job_id: result.jobId,
      topic: result.topic,
      units_used: result.unitsUsed,
      duration_ms: result.durationMs,
      graph_nodes: result.graphNodesCreated,
      graph_edges: result.graphEdgesCreated,
      reflection: result.reflectionGenerated,
    },
    fingerprint: `clm:cycle:${result.jobId}`,
    suggested_action: result.success
      ? undefined
      : 'Check NEXUS provider health and CLM budget allocation.',
  });
}

/**
 * Feed CLM result into the Control Plane topic pipeline for mastery tracking.
 */
function feedResultToTopicPipeline(result: LearningJobResult): void {
  if (!result.success) return;

  // Generate a simple output fingerprint from the job
  const fingerprint = `${result.jobId}-${result.topic}-${result.durationMs}`;
  const novelty = result.reflectionGenerated ? 0.8 : 0.5;

  // Find matching topic in pipeline
  const allTopics = clmTopicPipeline.getTopics();
  const matchingTopic = allTopics.find(t =>
    t.title.toLowerCase().includes(result.topic.toLowerCase()) ||
    result.topic.toLowerCase().includes(t.title.toLowerCase())
  );

  if (matchingTopic) {
    clmTopicPipeline.recordTopicCall(matchingTopic.id, fingerprint, novelty);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BRIDGE INTROSPECTION
// ═══════════════════════════════════════════════════════════════════════════════

export function getBridgeState(): BridgeState & { clm_status: ReturnType<typeof getCLMStatus> } {
  return {
    ...state,
    clm_status: getCLMStatus(),
  };
}

export const nexusCLMBridge = {
  start: startBridge,
  stop: stopBridge,
  getState: getBridgeState,
  isRunning: () => state.running,
};
