/**
 * TREATY Ultimate — Term Optimizer
 * Historical data-driven contract term optimization.
 * Analyzes past contract performance to suggest optimal thresholds.
 */

export interface TermSuggestion {
  clause: string;
  currentValue: number;
  suggestedValue: number;
  reason: string;
  confidenceScore: number; // 0–1
  basedOnSamples: number;
}

export interface OptimizationReport {
  contractId: string;
  suggestions: TermSuggestion[];
  overallOptimizationScore: number; // 0–100
  generatedAt: number;
}

interface HistoricalPerformance {
  clause: string;
  values: number[];
  breachCount: number;
  compliantCount: number;
}

const MAX_HISTORY = 500;
const history = new Map<string, HistoricalPerformance>();
const reports: OptimizationReport[] = [];

export function recordTermPerformance(clause: string, value: number, breached: boolean): void {
  let perf = history.get(clause);
  if (!perf) {
    if (history.size >= MAX_HISTORY) {
      const firstKey = history.keys().next().value;
      if (firstKey) history.delete(firstKey);
    }
    perf = { clause, values: [], breachCount: 0, compliantCount: 0 };
    history.set(clause, perf);
  }

  if (perf.values.length >= 200) perf.values.shift();
  perf.values.push(value);
  if (breached) perf.breachCount++;
  else perf.compliantCount++;
}

export function optimizeTerms(contractId: string, currentTerms: Array<{ clause: string; value: number }>): OptimizationReport {
  const suggestions: TermSuggestion[] = [];

  for (const term of currentTerms) {
    const perf = history.get(term.clause);
    if (!perf || perf.values.length < 5) continue;

    const sorted = [...perf.values].sort((a, b) => a - b);
    const p25 = sorted[Math.floor(sorted.length * 0.25)];
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p75 = sorted[Math.floor(sorted.length * 0.75)];
    const total = perf.breachCount + perf.compliantCount;
    const breachRate = total > 0 ? perf.breachCount / total : 0;

    let suggestedValue = term.value;
    let reason = '';
    let confidence = 0.5;

    if (breachRate > 0.3) {
      // High breach rate — relax the threshold
      suggestedValue = Math.round(p25 * 1000) / 1000;
      reason = `High breach rate (${Math.round(breachRate * 100)}%). Suggest relaxing to P25 (${suggestedValue}).`;
      confidence = Math.min(0.9, 0.5 + perf.values.length / 100);
    } else if (breachRate < 0.05 && term.value < p50) {
      // Very low breach rate and below median — tighten
      suggestedValue = Math.round(p75 * 1000) / 1000;
      reason = `Low breach rate (${Math.round(breachRate * 100)}%). Can tighten to P75 (${suggestedValue}).`;
      confidence = Math.min(0.85, 0.4 + perf.values.length / 120);
    } else {
      reason = 'Term performing within acceptable range.';
      confidence = 0.3;
    }

    if (Math.abs(suggestedValue - term.value) > 0.001) {
      suggestions.push({
        clause: term.clause,
        currentValue: term.value,
        suggestedValue,
        reason,
        confidenceScore: Math.round(confidence * 1000) / 1000,
        basedOnSamples: perf.values.length,
      });
    }
  }

  const overallScore = suggestions.length > 0
    ? Math.round(suggestions.reduce((s, sg) => s + sg.confidenceScore, 0) / suggestions.length * 100)
    : 100;

  const report: OptimizationReport = {
    contractId,
    suggestions,
    overallOptimizationScore: overallScore,
    generatedAt: Date.now(),
  };

  if (reports.length >= 100) reports.shift();
  reports.push(report);
  return report;
}

export function getOptimizationReports(): OptimizationReport[] { return [...reports]; }
export function getOptimizerStats() {
  return {
    clausesTracked: history.size,
    totalReports: reports.length,
    avgSuggestions: reports.length > 0
      ? Math.round(reports.reduce((s, r) => s + r.suggestions.length, 0) / reports.length * 10) / 10
      : 0,
  };
}
