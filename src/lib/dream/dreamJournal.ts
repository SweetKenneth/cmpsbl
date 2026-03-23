/**
 * CMPSBL® DREAM — Dream Journal
 * Persistent record of what was synthesized, what failed, and why.
 * Enables meta-learning about dream quality over time.
 */

export interface DreamJournalEntry {
  id: string;
  cycleId: string;
  cycleType: string;
  timestamp: string;
  candidatesEvaluated: number;
  heuristicsCreated: number;
  heuristicsFailed: number;
  driftDetected: boolean;
  insights: string[];
  durationMs: number;
  qualityScore: number; // computed from success rate + novelty
}

export interface JournalSummary {
  totalEntries: number;
  totalHeuristicsCreated: number;
  totalHeuristicsFailed: number;
  avgQualityScore: number;
  qualityTrend: 'improving' | 'stable' | 'declining';
  driftIncidents: number;
  avgDurationMs: number;
}

// Bounded journal
const MAX_JOURNAL_ENTRIES = 1000;
const journal: DreamJournalEntry[] = [];

/**
 * Record an entry in the dream journal
 */
export function recordInJournal(entry: {
  cycleId: string;
  cycleType: string;
  candidatesEvaluated: number;
  heuristicsCreated: number;
  heuristicsFailed: number;
  driftDetected: boolean;
  insights: string[];
  durationMs: number;
}): DreamJournalEntry {
  const total = entry.heuristicsCreated + entry.heuristicsFailed;
  const successRate = total > 0 ? entry.heuristicsCreated / total : 0;
  const noveltyBonus = entry.insights.length > 0 ? Math.min(0.3, entry.insights.length * 0.05) : 0;
  const qualityScore = Math.round((successRate * 0.7 + noveltyBonus + (entry.driftDetected ? -0.2 : 0.1)) * 100) / 100;

  const journalEntry: DreamJournalEntry = {
    id: `journal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    cycleId: entry.cycleId,
    cycleType: entry.cycleType,
    timestamp: new Date().toISOString(),
    candidatesEvaluated: entry.candidatesEvaluated,
    heuristicsCreated: entry.heuristicsCreated,
    heuristicsFailed: entry.heuristicsFailed,
    driftDetected: entry.driftDetected,
    insights: entry.insights,
    durationMs: entry.durationMs,
    qualityScore: Math.max(0, Math.min(1, qualityScore)),
  };

  journal.push(journalEntry);
  if (journal.length > MAX_JOURNAL_ENTRIES) journal.shift();

  return journalEntry;
}

/**
 * Get recent journal entries
 */
export function getJournalEntries(limit: number = 20): DreamJournalEntry[] {
  return journal.slice(-limit);
}

/**
 * Get journal summary with trend analysis
 */
export function getJournalSummary(): JournalSummary {
  if (journal.length === 0) {
    return {
      totalEntries: 0,
      totalHeuristicsCreated: 0,
      totalHeuristicsFailed: 0,
      avgQualityScore: 0,
      qualityTrend: 'stable',
      driftIncidents: 0,
      avgDurationMs: 0,
    };
  }

  const totalCreated = journal.reduce((sum, e) => sum + e.heuristicsCreated, 0);
  const totalFailed = journal.reduce((sum, e) => sum + e.heuristicsFailed, 0);
  const avgQuality = journal.reduce((sum, e) => sum + e.qualityScore, 0) / journal.length;
  const driftIncidents = journal.filter(e => e.driftDetected).length;
  const avgDuration = journal.reduce((sum, e) => sum + e.durationMs, 0) / journal.length;

  // Trend: compare first half vs second half quality
  let trend: JournalSummary['qualityTrend'] = 'stable';
  if (journal.length >= 6) {
    const mid = Math.floor(journal.length / 2);
    const firstHalf = journal.slice(0, mid);
    const secondHalf = journal.slice(mid);
    const firstAvg = firstHalf.reduce((sum, e) => sum + e.qualityScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, e) => sum + e.qualityScore, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 0.05) trend = 'improving';
    else if (secondAvg < firstAvg - 0.05) trend = 'declining';
  }

  return {
    totalEntries: journal.length,
    totalHeuristicsCreated: totalCreated,
    totalHeuristicsFailed: totalFailed,
    avgQualityScore: Math.round(avgQuality * 1000) / 1000,
    qualityTrend: trend,
    driftIncidents,
    avgDurationMs: Math.round(avgDuration),
  };
}
