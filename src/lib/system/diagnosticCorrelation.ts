/**
 * Diagnostic Correlation Engine — SYSTEM v9.0.0
 * Cross-correlates metrics from all 40 nodes to identify
 * root causes rather than symptoms.
 */

// --- Types ---

export interface DiagnosticSignal {
  nodeId: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface CorrelationCluster {
  id: string;
  signals: DiagnosticSignal[];
  rootCause: string;
  confidence: number;
  affectedNodes: string[];
  recommendation: string;
  timestamp: number;
}

export interface IncidentReport {
  id: string;
  clusters: CorrelationCluster[];
  overallSeverity: 'info' | 'warning' | 'error' | 'critical';
  summary: string;
  timestamp: number;
}

// --- Constants ---

const CORRELATION_WINDOW_MS = 30_000; // 30s
const MAX_SIGNALS = 1000;
const MAX_REPORTS = 100;

const KNOWN_CORRELATIONS: Array<{
  pattern: { metric: string; direction: 'above' | 'below' }[];
  rootCause: string;
  recommendation: string;
}> = [
  {
    pattern: [
      { metric: 'memory_pressure', direction: 'above' },
      { metric: 'response_latency', direction: 'above' },
    ],
    rootCause: 'Memory pressure causing latency spikes',
    recommendation: 'Trigger garbage collection and review memory-intensive operations',
  },
  {
    pattern: [
      { metric: 'dlq_depth', direction: 'above' },
      { metric: 'event_throughput', direction: 'below' },
    ],
    rootCause: 'Event processing backlog causing DLQ overflow',
    recommendation: 'Drain event buffers and increase processing capacity',
  },
  {
    pattern: [
      { metric: 'error_rate', direction: 'above' },
      { metric: 'circuit_breaker_trips', direction: 'above' },
    ],
    rootCause: 'Cascading failures triggering circuit breakers',
    recommendation: 'Isolate failing subsystem and reset healthy breakers',
  },
  {
    pattern: [
      { metric: 'telemetry_lag', direction: 'above' },
      { metric: 'cpu_utilization', direction: 'above' },
    ],
    rootCause: 'CPU saturation delaying telemetry processing',
    recommendation: 'Reduce sampling rate and shed low-priority telemetry',
  },
];

// --- State ---

const signalBuffer: DiagnosticSignal[] = [];
const reports: IncidentReport[] = [];

// --- Core ---

export function ingestSignal(signal: DiagnosticSignal): void {
  signalBuffer.push(signal);
  if (signalBuffer.length > MAX_SIGNALS) {
    signalBuffer.splice(0, signalBuffer.length - MAX_SIGNALS);
  }
}

export function correlateSignals(): CorrelationCluster[] {
  const now = Date.now();
  const recentSignals = signalBuffer.filter(s => now - s.timestamp < CORRELATION_WINDOW_MS);

  if (recentSignals.length < 2) return [];

  const clusters: CorrelationCluster[] = [];

  for (const known of KNOWN_CORRELATIONS) {
    const matchedSignals: DiagnosticSignal[] = [];

    for (const patternItem of known.pattern) {
      const matching = recentSignals.filter(s => {
        if (s.metric !== patternItem.metric) return false;
        if (patternItem.direction === 'above') return s.value > s.threshold;
        return s.value < s.threshold;
      });
      matchedSignals.push(...matching);
    }

    if (matchedSignals.length >= known.pattern.length) {
      const affectedNodes = [...new Set(matchedSignals.map(s => s.nodeId))];
      const confidence = Math.min(1, matchedSignals.length / (known.pattern.length * 2));

      clusters.push({
        id: `cluster_${now}_${clusters.length}`,
        signals: matchedSignals,
        rootCause: known.rootCause,
        confidence: Math.round(confidence * 100) / 100,
        affectedNodes,
        recommendation: known.recommendation,
        timestamp: now,
      });
    }
  }

  // Temporal clustering for unknown patterns
  const ungrouped = recentSignals.filter(
    s => !clusters.some(c => c.signals.includes(s))
  );

  if (ungrouped.length >= 3) {
    const nodeGroups = new Map<string, DiagnosticSignal[]>();
    for (const s of ungrouped) {
      const arr = nodeGroups.get(s.nodeId) || [];
      arr.push(s);
      nodeGroups.set(s.nodeId, arr);
    }

    for (const [nodeId, signals] of nodeGroups) {
      if (signals.length >= 2) {
        clusters.push({
          id: `cluster_unknown_${now}_${nodeId}`,
          signals,
          rootCause: `Multiple anomalies on ${nodeId}`,
          confidence: 0.4,
          affectedNodes: [nodeId],
          recommendation: 'Investigate node health and recent changes',
          timestamp: now,
        });
      }
    }
  }

  return clusters;
}

export function generateIncidentReport(): IncidentReport | null {
  const clusters = correlateSignals();
  if (clusters.length === 0) return null;

  const severities = clusters.flatMap(c => c.signals.map(s => s.severity));
  const overallSeverity = severities.includes('critical') ? 'critical'
    : severities.includes('error') ? 'error'
    : severities.includes('warning') ? 'warning'
    : 'info';

  const report: IncidentReport = {
    id: `incident_${Date.now()}`,
    clusters,
    overallSeverity,
    summary: clusters.map(c => c.rootCause).join('; '),
    timestamp: Date.now(),
  };

  reports.push(report);
  if (reports.length > MAX_REPORTS) reports.splice(0, reports.length - MAX_REPORTS);

  return report;
}

export function getRecentReports(count: number = 10): IncidentReport[] {
  return reports.slice(-count);
}

export function getSignalCount(): number {
  return signalBuffer.length;
}

export function clearCorrelationState(): void {
  signalBuffer.length = 0;
  reports.length = 0;
}
