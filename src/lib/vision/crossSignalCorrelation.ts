/**
 * CMPSBL® VISION — Cross-Signal Correlation Engine
 * Correlates metrics, traces, and anomalies to identify root causes.
 */

export interface Signal {
  id: string;
  type: 'metric' | 'trace' | 'anomaly' | 'alert';
  source: string; // module
  timestamp: string;
  severity: number; // 0-100
  tags: Record<string, string>;
  value?: number;
}

export interface CorrelationResult {
  id: string;
  signals: Signal[];
  rootCause: string;
  confidence: number; // 0-1
  impactChain: string[]; // ordered module impact path
  correlationType: 'temporal' | 'causal' | 'statistical';
  detectedAt: string;
}

// Bounded signal window
const MAX_SIGNALS = 2000;
const signalWindow: Signal[] = [];
const correlationHistory: CorrelationResult[] = [];
const MAX_HISTORY = 200;

/**
 * Ingest a signal for correlation analysis
 */
export function ingestSignal(signal: Signal): void {
  signalWindow.push(signal);
  if (signalWindow.length > MAX_SIGNALS) {
    signalWindow.splice(0, Math.floor(MAX_SIGNALS * 0.1));
  }
}

/**
 * Run correlation analysis on recent signals
 */
export function analyzeCorrelations(windowMs: number = 5 * 60 * 1000): CorrelationResult[] {
  const cutoff = Date.now() - windowMs;
  const recent = signalWindow.filter(s => new Date(s.timestamp).getTime() >= cutoff);

  if (recent.length < 2) return [];

  const results: CorrelationResult[] = [];

  // 1. Temporal clustering: group signals within 30s windows
  const clusters = temporalCluster(recent, 30_000);

  for (const cluster of clusters) {
    if (cluster.length < 2) continue;

    const modules = [...new Set(cluster.map(s => s.source))];
    const types = [...new Set(cluster.map(s => s.type))];
    const avgSeverity = cluster.reduce((sum, s) => sum + s.severity, 0) / cluster.length;

    // Root cause inference
    const rootCause = inferRootCause(cluster);
    const impactChain = buildImpactChain(cluster);
    const confidence = calculateConfidence(cluster);

    if (confidence >= 0.4) {
      const result: CorrelationResult = {
        id: `corr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
        signals: cluster,
        rootCause,
        confidence,
        impactChain,
        correlationType: types.length > 1 ? 'causal' : 'temporal',
        detectedAt: new Date().toISOString(),
      };
      results.push(result);
      correlationHistory.push(result);
      if (correlationHistory.length > MAX_HISTORY) correlationHistory.shift();
    }
  }

  return results;
}

/**
 * Temporal clustering: group signals within proximity window
 */
function temporalCluster(signals: Signal[], windowMs: number): Signal[][] {
  const sorted = [...signals].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const clusters: Signal[][] = [];
  let current: Signal[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const gap = new Date(sorted[i].timestamp).getTime() - new Date(sorted[i - 1].timestamp).getTime();
    if (gap <= windowMs) {
      current.push(sorted[i]);
    } else {
      clusters.push(current);
      current = [sorted[i]];
    }
  }
  clusters.push(current);

  return clusters;
}

/**
 * Infer root cause from correlated signals
 */
function inferRootCause(signals: Signal[]): string {
  // Find earliest highest-severity signal
  const sorted = [...signals].sort((a, b) => {
    const timeDiff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    return timeDiff !== 0 ? timeDiff : b.severity - a.severity;
  });

  const root = sorted[0];
  const types = [...new Set(signals.map(s => s.type))];
  const modules = [...new Set(signals.map(s => s.source))];

  if (types.includes('anomaly') && types.includes('metric')) {
    return `${root.source} anomaly triggered cascading metric degradation across ${modules.join(', ')}`;
  }
  if (types.includes('trace') && signals.some(s => s.severity > 80)) {
    return `Critical trace failure in ${root.source} with downstream impact`;
  }
  return `Correlated event cluster originating from ${root.source} (${root.type})`;
}

/**
 * Build ordered impact chain
 */
function buildImpactChain(signals: Signal[]): string[] {
  const sorted = [...signals].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  // Deduplicate while preserving order
  const chain: string[] = [];
  for (const s of sorted) {
    if (!chain.includes(s.source)) chain.push(s.source);
  }
  return chain;
}

/**
 * Calculate correlation confidence
 */
function calculateConfidence(signals: Signal[]): number {
  const moduleCount = new Set(signals.map(s => s.source)).size;
  const typeCount = new Set(signals.map(s => s.type)).size;
  const avgSeverity = signals.reduce((sum, s) => sum + s.severity, 0) / signals.length;

  // More diverse signal types + more modules + higher severity = higher confidence
  let confidence = 0.2;
  confidence += Math.min(0.3, moduleCount * 0.1);
  confidence += Math.min(0.2, typeCount * 0.1);
  confidence += (avgSeverity / 100) * 0.3;

  return Math.min(1, Math.round(confidence * 100) / 100);
}

/**
 * Get correlation history
 */
export function getCorrelationHistory(limit: number = 20): CorrelationResult[] {
  return correlationHistory.slice(-limit);
}

/**
 * Get signal count in window
 */
export function getSignalCount(): number {
  return signalWindow.length;
}
