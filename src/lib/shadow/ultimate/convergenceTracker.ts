/**
 * SHADOW Ultimate — Convergence Tracker
 * Monitors shadow runs to determine when a proposed change has converged.
 * Requires ≥10 cycles, confidence ≥0.95 for 3 consecutive, zero regressions.
 */

export interface ConvergenceCycle {
  cycleNumber: number;
  divergenceScore: number;
  confidence: number;
  gatesPassed: number;
  gatesTotal: number;
  timestamp: number;
}

export interface ConvergenceTrack {
  id: string;
  proposalId: string;
  cycles: ConvergenceCycle[];
  status: 'tracking' | 'converged' | 'diverging' | 'insufficient';
  consecutiveHighConfidence: number;
  requiredCycles: number;
  requiredConfidence: number;
  requiredConsecutive: number;
  startedAt: number;
  convergedAt?: number;
}

export interface ConvergenceStats {
  totalTracks: number;
  convergedTracks: number;
  divergingTracks: number;
  avgCyclesToConverge: number;
  avgConfidence: number;
}

const MIN_CYCLES = 10;
const MIN_CONFIDENCE = 0.95;
const CONSECUTIVE_REQUIRED = 3;
const MAX_TRACKS = 200;

const tracks = new Map<string, ConvergenceTrack>();

export function startTracking(proposalId: string): ConvergenceTrack {
  const track: ConvergenceTrack = {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    proposalId, cycles: [], status: 'tracking',
    consecutiveHighConfidence: 0,
    requiredCycles: MIN_CYCLES,
    requiredConfidence: MIN_CONFIDENCE,
    requiredConsecutive: CONSECUTIVE_REQUIRED,
    startedAt: Date.now(),
  };
  if (tracks.size >= MAX_TRACKS) {
    const oldest = [...tracks.values()]
      .filter(t => t.status !== 'tracking')
      .sort((a, b) => a.startedAt - b.startedAt)[0];
    if (oldest) tracks.delete(oldest.id);
  }
  tracks.set(track.id, track);
  return track;
}

export function recordCycle(
  trackId: string, divergenceScore: number, confidence: number,
  gatesPassed: number, gatesTotal: number
): ConvergenceTrack | null {
  const track = tracks.get(trackId);
  if (!track || track.status === 'converged') return null;

  const cycle: ConvergenceCycle = {
    cycleNumber: track.cycles.length + 1,
    divergenceScore, confidence, gatesPassed, gatesTotal,
    timestamp: Date.now(),
  };
  track.cycles.push(cycle);

  // Check consecutive high confidence
  if (confidence >= track.requiredConfidence && gatesPassed === gatesTotal) {
    track.consecutiveHighConfidence++;
  } else {
    track.consecutiveHighConfidence = 0;
  }

  // Check for regression (divergence increasing over last 3 cycles)
  if (track.cycles.length >= 3) {
    const last3 = track.cycles.slice(-3);
    const increasing = last3[1].divergenceScore > last3[0].divergenceScore &&
                       last3[2].divergenceScore > last3[1].divergenceScore;
    if (increasing && last3[2].divergenceScore > 0.15) {
      track.status = 'diverging';
    }
  }

  // Check convergence
  if (track.cycles.length >= track.requiredCycles &&
      track.consecutiveHighConfidence >= track.requiredConsecutive) {
    track.status = 'converged';
    track.convergedAt = Date.now();
  }

  if (track.cycles.length < track.requiredCycles && track.status === 'tracking') {
    track.status = 'tracking';
  }

  return track;
}

export function getConvergenceStats(): ConvergenceStats {
  const all = [...tracks.values()];
  const converged = all.filter(t => t.status === 'converged');
  const allCycles = all.flatMap(t => t.cycles);

  return {
    totalTracks: all.length,
    convergedTracks: converged.length,
    divergingTracks: all.filter(t => t.status === 'diverging').length,
    avgCyclesToConverge: converged.length > 0 ? converged.reduce((s, t) => s + t.cycles.length, 0) / converged.length : 0,
    avgConfidence: allCycles.length > 0 ? allCycles.reduce((s, c) => s + c.confidence, 0) / allCycles.length : 0,
  };
}

export function resetConvergenceState(): void { tracks.clear(); }
