/**
 * #23 — Cross-Scan Learning Corpus
 * After each scan, distill findings into anonymized heuristics
 * that improve future scans of similar stacks.
 */

export interface LearningCorpus {
  heuristics: ScanHeuristic[];
  stackPatterns: StackPattern[];
  commonFindings: CommonFinding[];
  totalScansProcessed: number;
  lastUpdated: string;
}

export interface ScanHeuristic {
  id: string;
  stack: string;
  pattern: string;
  description: string;
  frequency: number;
  confidence: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  autoDetectable: boolean;
  createdAt: string;
  lastSeen: string;
}

export interface StackPattern {
  stack: string;
  components: string[];
  commonIssues: string[];
  avgSecurityScore: number;
  scanCount: number;
}

export interface CommonFinding {
  pattern: string;
  frequency: number;
  stacks: string[];
  avgSeverity: number;
}

/**
 * Distill scan results into anonymized heuristics
 */
export function distillHeuristics(
  scanResult: {
    fingerprint: { framework: string; orm: string; auth: string; db: string };
    findings: Array<{ type: string; severity: string; category: string; file: string }>;
    scores: { security: number; performance: number; maintainability: number };
  },
  existingCorpus: LearningCorpus | null
): LearningCorpus {
  const corpus = existingCorpus || {
    heuristics: [],
    stackPatterns: [],
    commonFindings: [],
    totalScansProcessed: 0,
    lastUpdated: new Date().toISOString(),
  };

  const stackKey = [
    scanResult.fingerprint.framework,
    scanResult.fingerprint.orm,
    scanResult.fingerprint.auth,
    scanResult.fingerprint.db,
  ].filter(Boolean).join('+') || 'unknown';

  // Update stack patterns
  const existingStack = corpus.stackPatterns.find(s => s.stack === stackKey);
  if (existingStack) {
    existingStack.scanCount++;
    existingStack.avgSecurityScore = (existingStack.avgSecurityScore * (existingStack.scanCount - 1) + scanResult.scores.security) / existingStack.scanCount;
    const newIssues = scanResult.findings.map(f => f.type).filter(t => !existingStack.commonIssues.includes(t));
    existingStack.commonIssues.push(...newIssues);
  } else {
    corpus.stackPatterns.push({
      stack: stackKey,
      components: Object.values(scanResult.fingerprint).filter(Boolean),
      commonIssues: [...new Set(scanResult.findings.map(f => f.type))],
      avgSecurityScore: scanResult.scores.security,
      scanCount: 1,
    });
  }

  // Distill findings into heuristics (anonymized — no file paths)
  for (const finding of scanResult.findings) {
    const existingHeuristic = corpus.heuristics.find(h => h.pattern === finding.type && h.stack === stackKey);
    
    if (existingHeuristic) {
      existingHeuristic.frequency++;
      existingHeuristic.lastSeen = new Date().toISOString();
      existingHeuristic.confidence = Math.min(1, existingHeuristic.confidence + 0.05);
    } else {
      corpus.heuristics.push({
        id: `h-${corpus.heuristics.length}`,
        stack: stackKey,
        pattern: finding.type,
        description: `${finding.category}: ${finding.type} commonly found in ${stackKey} stacks`,
        frequency: 1,
        confidence: 0.5,
        severity: (finding.severity as ScanHeuristic['severity']) || 'medium',
        autoDetectable: true,
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      });
    }
  }

  // Update common findings
  const findingCounts = new Map<string, { count: number; stacks: Set<string>; severities: number[] }>();
  for (const h of corpus.heuristics) {
    const existing = findingCounts.get(h.pattern) || { count: 0, stacks: new Set(), severities: [] };
    existing.count += h.frequency;
    existing.stacks.add(h.stack);
    const sevNum = h.severity === 'critical' ? 4 : h.severity === 'high' ? 3 : h.severity === 'medium' ? 2 : 1;
    existing.severities.push(sevNum);
    findingCounts.set(h.pattern, existing);
  }

  corpus.commonFindings = Array.from(findingCounts.entries())
    .map(([pattern, data]) => ({
      pattern,
      frequency: data.count,
      stacks: [...data.stacks],
      avgSeverity: data.severities.reduce((s, v) => s + v, 0) / data.severities.length,
    }))
    .sort((a, b) => b.frequency - a.frequency);

  corpus.totalScansProcessed++;
  corpus.lastUpdated = new Date().toISOString();

  return corpus;
}

/**
 * Get stack-specific scan hints based on learned heuristics
 */
export function getStackHints(
  corpus: LearningCorpus,
  stackKey: string
): { priorityChecks: string[]; expectedIssues: string[]; confidence: number } {
  const stackPattern = corpus.stackPatterns.find(s => s.stack === stackKey);
  const stackHeuristics = corpus.heuristics
    .filter(h => h.stack === stackKey)
    .sort((a, b) => b.frequency - a.frequency);

  if (!stackPattern) {
    return { priorityChecks: [], expectedIssues: [], confidence: 0 };
  }

  return {
    priorityChecks: stackHeuristics
      .filter(h => h.confidence >= 0.7)
      .map(h => h.pattern),
    expectedIssues: stackPattern.commonIssues,
    confidence: Math.min(1, stackPattern.scanCount / 10),
  };
}
