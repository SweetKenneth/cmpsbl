/**
 * Confidence → Evolution Feedback Bridge
 * 
 * Feeds capability confidence scores into the evolution pipeline
 * so degraded capabilities get prioritized for healing/replacement.
 * Without this, confidence data is recorded but never consumed.
 *
 * CAPABILITY SYSTEM → confidence tracker → [THIS BRIDGE] → evolution gates + CLM
 */

import { getLowConfidenceCapabilities, getConfidenceSummary } from '@/lib/capabilities/confidence';

interface ConfidenceRecord {
  capabilityId: string;
  scores: number[];
  errors: string[];
  lastUpdated: string;
  avgConfidence: number;
}
import { emit } from '@/lib/substrate/events';
import { log } from '@/lib/system/log';

export interface EvolutionSignal {
  capabilityId: string;
  avgConfidence: number;
  recentErrors: string[];
  recommendation: 'heal' | 'retire' | 'replace' | 'monitor';
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
}

/** Classify a confidence record into an evolution recommendation */
function classifyCapability(record: ConfidenceRecord): EvolutionSignal {
  const { capabilityId, avgConfidence, errors } = record;
  
  let recommendation: EvolutionSignal['recommendation'];
  let priority: EvolutionSignal['priority'];

  if (avgConfidence < 0.2) {
    recommendation = 'retire';
    priority = 'critical';
  } else if (avgConfidence < 0.4) {
    recommendation = 'replace';
    priority = 'high';
  } else if (avgConfidence < 0.6) {
    recommendation = 'heal';
    priority = 'medium';
  } else {
    recommendation = 'monitor';
    priority = 'low';
  }

  return {
    capabilityId,
    avgConfidence,
    recentErrors: errors.slice(-3),
    recommendation,
    priority,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate evolution signals from current confidence data.
 * Returns actionable signals sorted by priority.
 */
export function generateEvolutionSignals(threshold = 0.6): EvolutionSignal[] {
  const degraded = getLowConfidenceCapabilities(threshold);
  return degraded
    .map(classifyCapability)
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

/**
 * Run the confidence→evolution bridge cycle.
 * Call this periodically or after significant capability invocations.
 */
export function runConfidenceEvolutionBridge(): {
  signals: EvolutionSignal[];
  summary: ReturnType<typeof getConfidenceSummary>;
} {
  const summary = getConfidenceSummary();
  const signals = generateEvolutionSignals();

  if (signals.length > 0) {
    const criticalCount = signals.filter(s => s.priority === 'critical').length;
    const highCount = signals.filter(s => s.priority === 'high').length;

    log.info('evolution', `Confidence bridge: ${signals.length} signals (${criticalCount} critical, ${highCount} high)`);

    emit({
      module: 'EVOLUTION',
      event_type: 'confidence.bridge_cycle',
      outcome: 'succeeded',
      data: {
        signalCount: signals.length,
        criticalCount,
        highCount,
        summaryReliable: summary.reliable,
        summaryDegraded: summary.degraded,
        summaryFailing: summary.failing,
      },
    });
  }

  return { signals, summary };
}

/**
 * Get the top-N capabilities that need evolution attention.
 */
export function getEvolutionPriorities(topN = 5): EvolutionSignal[] {
  return generateEvolutionSignals().slice(0, topN);
}
