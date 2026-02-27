/**
 * Forensics — Historical Truth Engine
 * Reports WHAT HAS CHANGED
 * 
 * Independent of plans. Reads from change_ledger.
 * 
 * NEVER mutates. NEVER depends on plans.
 */

import { changeLedger, type LedgerEntry, type MetricsSnapshot } from './change-ledger';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ForensicsSince = 'last_phase' | 'last_run' | '24h' | '7d' | '30d';

export interface ForensicsResult {
  changes_detected: ForensicsChangeRecord[];
  observed_deltas: ObservedDelta[];
  confidence: 'high' | 'medium' | 'low';
  unknowns: string[];
  query: {
    component?: string;
    since: string;
  };
  timestamp: string;
}

export interface ForensicsChangeRecord {
  id: string;
  timestamp: string;
  component: string;
  change_type: string;
  summary: string;
  source: string;
  artifacts_count: number;
}

export interface ObservedDelta {
  metric: string;
  before: number | string;
  after: number | string;
  delta_display: string; // Uses "→" for observed
}

// ═══════════════════════════════════════════════════════════════
// FORENSICS ENGINE
// ═══════════════════════════════════════════════════════════════

/**
 * Run forensic analysis on a component
 * PURE READ-ONLY — never mutates
 */
export async function runForensics(
  component?: string,
  since: ForensicsSince = '24h'
): Promise<ForensicsResult> {
  const sinceDate = resolveSinceDate(since);
  
  const result: ForensicsResult = {
    changes_detected: [],
    observed_deltas: [],
    confidence: 'high',
    unknowns: [],
    query: {
      component,
      since: sinceDate.toISOString(),
    },
    timestamp: new Date().toISOString(),
  };

  try {
    // Query ledger for changes
    const entries = await changeLedger.query({
      component,
      since: sinceDate,
      limit: 100,
    });

    // Convert to change records
    result.changes_detected = entries.map(entryToChangeRecord);

    // Calculate observed deltas from entries with metrics
    result.observed_deltas = calculateObservedDeltas(entries);

    // Determine confidence based on data quality
    result.confidence = determineConfidence(entries);

    // Track unknowns (entries without complete metrics)
    result.unknowns = findUnknowns(entries);

    return result;
  } catch (error) {
    result.confidence = 'low';
    result.unknowns.push(error instanceof Error ? error.message : 'Query failed');
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function resolveSinceDate(since: ForensicsSince): Date {
  const now = new Date();
  
  switch (since) {
    case 'last_phase':
      // Last 4 hours as approximation
      return new Date(now.getTime() - 4 * 60 * 60 * 1000);
    case 'last_run':
      // Last 12 hours as approximation
      return new Date(now.getTime() - 12 * 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

function entryToChangeRecord(entry: LedgerEntry): ForensicsChangeRecord {
  return {
    id: entry.id,
    timestamp: entry.timestamp,
    component: entry.component,
    change_type: entry.change_type,
    summary: entry.summary,
    source: entry.source,
    artifacts_count: entry.artifacts_touched.length,
  };
}

function calculateObservedDeltas(entries: LedgerEntry[]): ObservedDelta[] {
  const deltas: ObservedDelta[] = [];
  
  // Find entries with both before and after metrics
  const entriesWithMetrics = entries.filter(e => e.metrics_before && e.metrics_after);
  
  if (entriesWithMetrics.length === 0) return deltas;

  // Aggregate deltas across all entries
  const aggregated: Record<string, { before: number; after: number }> = {};
  
  for (const entry of entriesWithMetrics) {
    const before = entry.metrics_before as MetricsSnapshot;
    const after = entry.metrics_after as MetricsSnapshot;
    
    for (const key of Object.keys(after)) {
      if (typeof before[key] === 'number' && typeof after[key] === 'number') {
        if (!aggregated[key]) {
          aggregated[key] = { before: before[key] as number, after: after[key] as number };
        } else {
          // Update to latest after value
          aggregated[key].after = after[key] as number;
        }
      }
    }
  }

  // Convert to ObservedDelta with "→" notation
  for (const [metric, values] of Object.entries(aggregated)) {
    const diff = values.after - values.before;
    const sign = diff >= 0 ? '+' : '';
    deltas.push({
      metric,
      before: values.before,
      after: values.after,
      delta_display: `${values.before} → ${values.after} (${sign}${diff.toFixed(2)})`,
    });
  }

  return deltas;
}

function determineConfidence(entries: LedgerEntry[]): 'high' | 'medium' | 'low' {
  if (entries.length === 0) return 'low';
  
  const entriesWithMetrics = entries.filter(e => e.metrics_before && e.metrics_after);
  const ratio = entriesWithMetrics.length / entries.length;
  
  if (ratio >= 0.8) return 'high';
  if (ratio >= 0.4) return 'medium';
  return 'low';
}

function findUnknowns(entries: LedgerEntry[]): string[] {
  const unknowns: string[] = [];
  
  // Find entries from 'unknown' source
  const unknownSource = entries.filter(e => e.source === 'unknown');
  if (unknownSource.length > 0) {
    unknowns.push(`${unknownSource.length} changes from unknown source`);
  }
  
  // Find entries without metrics
  const noMetrics = entries.filter(e => !e.metrics_before || !e.metrics_after);
  if (noMetrics.length > 0 && noMetrics.length < entries.length) {
    unknowns.push(`${noMetrics.length} changes without complete metrics`);
  }

  return unknowns;
}

// ═══════════════════════════════════════════════════════════════
// FORMATTED OUTPUT
// ═══════════════════════════════════════════════════════════════

export function formatForensics(result: ForensicsResult): string {
  const lines = ['╔══════════════════════════════════════════════════════════════╗'];
  lines.push('║  FORENSICS — HAS CHANGED?                                    ║');
  lines.push('╠══════════════════════════════════════════════════════════════╣');

  const confIcon = result.confidence === 'high' ? '🟢' : result.confidence === 'medium' ? '🟡' : '🔴';
  lines.push(`║  Confidence: ${confIcon} ${result.confidence.toUpperCase().padEnd(45)} ║`);
  
  const scope = result.query.component || 'all components';
  lines.push(`║  Scope:      ${scope.padEnd(47)} ║`);
  lines.push(`║  Changes:    ${String(result.changes_detected.length).padEnd(47)} ║`);

  if (result.changes_detected.length > 0) {
    lines.push('╠══════════════════════════════════════════════════════════════╣');
    lines.push('║  DETECTED CHANGES:                                           ║');
    for (const change of result.changes_detected.slice(0, 5)) {
      const time = new Date(change.timestamp).toLocaleTimeString();
      const desc = `[${change.source}] ${change.summary}`.substring(0, 48);
      lines.push(`║    ${time} ${desc.padEnd(48)} ║`);
    }
    if (result.changes_detected.length > 5) {
      lines.push(`║    ... and ${result.changes_detected.length - 5} more changes                            ║`);
    }
  }

  if (result.observed_deltas.length > 0) {
    lines.push('╠══════════════════════════════════════════════════════════════╣');
    lines.push('║  OBSERVED DELTAS (→):                                        ║');
    for (const delta of result.observed_deltas.slice(0, 5)) {
      const desc = `${delta.metric}: ${delta.delta_display}`.substring(0, 54);
      lines.push(`║    ${desc.padEnd(56)} ║`);
    }
  }

  if (result.unknowns.length > 0) {
    lines.push('╠══════════════════════════════════════════════════════════════╣');
    lines.push('║  UNKNOWNS (no speculation):                                  ║');
    for (const unknown of result.unknowns) {
      lines.push(`║    ⚠️  ${unknown.substring(0, 52).padEnd(52)} ║`);
    }
  }

  lines.push('╚══════════════════════════════════════════════════════════════╝');
  return lines.join('\n');
}
