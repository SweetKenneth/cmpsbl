/**
 * CMPSBL® DREAM — Dream Metrics Dashboard Feed
 * Aggregates DreamMetrics per the DREAM spec:
 * totalSyntheses, avgConfidence, heuristicCount, driftScore
 */

import { getHeuristicStats } from './heuristicBuilder';
import { getDriftState } from './semanticDrift';
import { getJournalSummary } from './dreamJournal';
import { getLineageStats } from './lineageTracker';
import { getLucidStats } from './lucidDreaming';
import { getQueueStats } from './subconsciousQueue';
import { getCoherenceStats } from './coherenceValidator';

export interface DreamMetrics {
  totalSyntheses: number;
  avgConfidence: number;
  heuristicCount: number;
  driftScore: number;
  successRate: number;
  lineageDepth: number;
  terminalNodes: number;
  flaggedForReview: number;
  qualityTrend: 'improving' | 'stable' | 'declining';
  isDreamPaused: boolean;
}

export interface DreamDashboard {
  metrics: DreamMetrics;
  lucid: {
    activeDirectives: number;
    fulfillmentRate: number;
    topGaps: Array<{ domain: string; gap: string; priority: number }>;
  };
  queue: {
    size: number;
    avgPriority: number;
    topDomains: Array<{ domain: string; count: number }>;
  };
  coherence: {
    passRate: number;
    rejectRate: number;
    avgScore: number;
  };
  health: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
}

/**
 * Get aggregated dream metrics (spec-compliant)
 */
export function getDreamMetrics(): DreamMetrics {
  const heuristicStats = getHeuristicStats();
  const driftState = getDriftState();
  const journalSummary = getJournalSummary();
  const lineageStats = getLineageStats();

  const totalSyntheses = journalSummary.totalHeuristicsCreated + journalSummary.totalHeuristicsFailed;
  const successRate = totalSyntheses > 0
    ? journalSummary.totalHeuristicsCreated / totalSyntheses
    : 1;

  return {
    totalSyntheses,
    avgConfidence: heuristicStats.avgConfidence,
    heuristicCount: heuristicStats.total,
    driftScore: Math.round(driftState.avgDriftScore * 1000) / 1000,
    successRate: Math.round(successRate * 1000) / 1000,
    lineageDepth: lineageStats.avgDepth,
    terminalNodes: lineageStats.terminalCount,
    flaggedForReview: heuristicStats.flaggedForReview,
    qualityTrend: journalSummary.qualityTrend,
    isDreamPaused: driftState.paused,
  };
}

/**
 * Get full dream dashboard data
 */
export function getDreamDashboard(): DreamDashboard {
  const metrics = getDreamMetrics();
  const lucid = getLucidStats();
  const queue = getQueueStats();
  const coherence = getCoherenceStats();

  // Health assessment
  let health: DreamDashboard['health'] = 'healthy';
  if (metrics.isDreamPaused || metrics.driftScore > 0.2 || metrics.successRate < 0.3) {
    health = 'critical';
  } else if (metrics.driftScore > 0.1 || metrics.successRate < 0.6 || metrics.flaggedForReview > 10) {
    health = 'degraded';
  }

  return {
    metrics,
    lucid: {
      activeDirectives: lucid.activeDirectives,
      fulfillmentRate: lucid.fulfillmentRate,
      topGaps: lucid.topGaps,
    },
    queue: {
      size: queue.size,
      avgPriority: queue.avgPriority,
      topDomains: queue.topDomains.map(d => ({ domain: d.domain, count: d.count })),
    },
    coherence: {
      passRate: coherence.passRate,
      rejectRate: coherence.rejectRate,
      avgScore: coherence.avgScore,
    },
    health,
    timestamp: new Date().toISOString(),
  };
}
