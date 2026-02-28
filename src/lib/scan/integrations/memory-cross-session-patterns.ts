/**
 * MEMORY — Cross-Session Pattern Matching (#32)
 * Detects recurring debt patterns across scan sessions to identify
 * systemic issues that individual scans miss.
 */

export interface RecurringPattern {
  patternId: string;
  category: string;
  description: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  sessionIds: string[];
  trend: 'growing' | 'stable' | 'shrinking';
  systemic: boolean; // true if appears in >50% of sessions
  suggestedRootCause: string;
}

export interface PatternAnalysis {
  patterns: RecurringPattern[];
  systemicCount: number;
  growingCount: number;
  avgRecurrence: number;
  recommendedFocus: string[];
  analyzedSessions: number;
  generatedAt: string;
}

interface SessionFindings {
  sessionId: string;
  timestamp: string;
  findings: Array<{
    id: string;
    category: string;
    description: string;
    filePath?: string;
  }>;
}

/**
 * Analyze multiple scan sessions for recurring patterns
 */
export function detectRecurringPatterns(
  sessions: SessionFindings[],
  minOccurrences = 2,
): PatternAnalysis {
  const patternMap = new Map<string, {
    category: string;
    description: string;
    sessions: Array<{ id: string; timestamp: string }>;
  }>();

  for (const session of sessions) {
    for (const finding of session.findings) {
      // Create a fingerprint: category + normalized description tokens
      const key = `${finding.category}::${finding.description.toLowerCase().split(/\W+/).sort().slice(0, 5).join('_')}`;

      if (!patternMap.has(key)) {
        patternMap.set(key, {
          category: finding.category,
          description: finding.description,
          sessions: [],
        });
      }
      const entry = patternMap.get(key)!;
      if (!entry.sessions.find(s => s.id === session.sessionId)) {
        entry.sessions.push({ id: session.sessionId, timestamp: session.timestamp });
      }
    }
  }

  const patterns: RecurringPattern[] = [];
  for (const [, data] of patternMap) {
    if (data.sessions.length < minOccurrences) continue;

    const sorted = data.sessions.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2)).length;
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2)).length;
    const trend: RecurringPattern['trend'] =
      secondHalf > firstHalf ? 'growing' :
      secondHalf < firstHalf ? 'shrinking' : 'stable';

    patterns.push({
      patternId: `pat_${patterns.length + 1}`,
      category: data.category,
      description: data.description,
      occurrences: data.sessions.length,
      firstSeen: sorted[0].timestamp,
      lastSeen: sorted[sorted.length - 1].timestamp,
      sessionIds: data.sessions.map(s => s.id),
      trend,
      systemic: data.sessions.length > sessions.length * 0.5,
      suggestedRootCause: inferRootCause(data.category, data.sessions.length, sessions.length),
    });
  }

  patterns.sort((a, b) => b.occurrences - a.occurrences);
  const systemicCount = patterns.filter(p => p.systemic).length;
  const growingCount = patterns.filter(p => p.trend === 'growing').length;

  return {
    patterns,
    systemicCount,
    growingCount,
    avgRecurrence: patterns.length > 0 ? patterns.reduce((s, p) => s + p.occurrences, 0) / patterns.length : 0,
    recommendedFocus: patterns.filter(p => p.systemic || p.trend === 'growing').slice(0, 5).map(p => p.description),
    analyzedSessions: sessions.length,
    generatedAt: new Date().toISOString(),
  };
}

function inferRootCause(category: string, occurrences: number, totalSessions: number): string {
  const ratio = occurrences / totalSessions;
  if (ratio > 0.8) return `Architectural issue — ${category} debt is baked into the codebase structure`;
  if (ratio > 0.5) return `Process gap — ${category} issues reintroduced by development workflow`;
  return `Localized — ${category} debt concentrated in specific modules`;
}
