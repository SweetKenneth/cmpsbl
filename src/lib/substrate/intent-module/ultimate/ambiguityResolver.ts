/**
 * INTENT Ultimate — System 3: Ambiguity Resolution Protocol
 * 
 * When classification confidence < threshold, surfaces what is ambiguous and why,
 * with ranked disambiguation options. Tracks patterns over time to learn.
 * 
 * @module intent/ultimate/ambiguityResolver
 */

// ── Types ────────────────────────────────────────────────────────

export interface AmbiguityReport {
  id: string;
  originalInput: string;
  ambiguityType: 'semantic' | 'referential' | 'structural' | 'contextual';
  confidence: number;
  reason: string;
  options: DisambiguationOption[];
  resolvedOption?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface DisambiguationOption {
  id: string;
  intentType: string;
  label: string;
  description: string;
  confidence: number;
  evidence: string[];
}

export interface AmbiguityPattern {
  pattern: string;
  occurrences: number;
  preferredResolution: string;
  successRate: number;
  lastSeen: string;
}

// ── State ────────────────────────────────────────────────────────

const CONFIDENCE_THRESHOLD = 0.7;
const reports: AmbiguityReport[] = [];
const learnedPatterns: Map<string, AmbiguityPattern> = new Map();
const MAX_REPORTS = 300;
const MAX_PATTERNS = 200;

// ── Pattern Learning ─────────────────────────────────────────────

function normalizeInput(input: string): string {
  return input.toLowerCase().replace(/[^\w\s]/g, '').trim();
}

function findPattern(input: string): AmbiguityPattern | undefined {
  const normalized = normalizeInput(input);
  // Check for exact and prefix matches
  for (const [key, pattern] of learnedPatterns) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return pattern;
    }
  }
  return undefined;
}

// ── Core API ────────────────────────────────────────────────────

/** Check if an input is ambiguous and generate disambiguation report */
export function detectAmbiguity(
  input: string,
  topConfidence: number,
  alternatives: Array<{ type: string; confidence: number }>,
): AmbiguityReport | null {
  if (topConfidence >= CONFIDENCE_THRESHOLD && alternatives.length < 2) return null;

  // Check learned patterns first
  const learned = findPattern(input);
  if (learned && learned.successRate > 0.8 && learned.occurrences > 3) {
    return null; // We've learned this one — auto-resolve
  }

  // Determine ambiguity type
  let ambiguityType: AmbiguityReport['ambiguityType'] = 'semantic';
  const lower = input.toLowerCase();
  if (lower.includes('it') || lower.includes('that') || lower.includes('this')) {
    ambiguityType = 'referential';
  } else if (alternatives.length > 2) {
    ambiguityType = 'structural';
  } else if (topConfidence < 0.4) {
    ambiguityType = 'contextual';
  }

  const options: DisambiguationOption[] = alternatives.slice(0, 4).map((alt, i) => ({
    id: `opt_${i}`,
    intentType: alt.type,
    label: `Interpret as "${alt.type}"`,
    description: `Confidence: ${Math.round(alt.confidence * 100)}%`,
    confidence: alt.confidence,
    evidence: [],
  }));

  const report: AmbiguityReport = {
    id: crypto.randomUUID(),
    originalInput: input,
    ambiguityType,
    confidence: topConfidence,
    reason: `Classification confidence ${Math.round(topConfidence * 100)}% is below threshold of ${CONFIDENCE_THRESHOLD * 100}%. ${alternatives.length} competing interpretations detected.`,
    options,
    createdAt: new Date().toISOString(),
  };

  reports.push(report);
  if (reports.length > MAX_REPORTS) reports.splice(0, reports.length - MAX_REPORTS);

  return report;
}

/** Resolve an ambiguity by selecting an option */
export function resolveAmbiguity(reportId: string, selectedOptionId: string): boolean {
  const report = reports.find(r => r.id === reportId);
  if (!report) return false;

  const option = report.options.find(o => o.id === selectedOptionId);
  if (!option) return false;

  report.resolvedOption = option.intentType;
  report.resolvedAt = new Date().toISOString();

  // Learn from resolution
  const key = normalizeInput(report.originalInput).slice(0, 50);
  const existing = learnedPatterns.get(key);
  if (existing) {
    existing.occurrences++;
    existing.lastSeen = new Date().toISOString();
    if (existing.preferredResolution === option.intentType) {
      existing.successRate = existing.successRate * 0.9 + 0.1; // EMA toward 1
    } else {
      existing.successRate = existing.successRate * 0.9; // EMA toward 0
      if (existing.successRate < 0.3) {
        existing.preferredResolution = option.intentType;
        existing.successRate = 0.5;
      }
    }
  } else {
    learnedPatterns.set(key, {
      pattern: key,
      occurrences: 1,
      preferredResolution: option.intentType,
      successRate: 0.5,
      lastSeen: new Date().toISOString(),
    });
    if (learnedPatterns.size > MAX_PATTERNS) {
      const oldest = learnedPatterns.keys().next().value;
      if (oldest) learnedPatterns.delete(oldest);
    }
  }

  return true;
}

/** Auto-resolve ambiguity from learned patterns */
export function autoResolve(input: string): string | null {
  const pattern = findPattern(input);
  if (pattern && pattern.successRate > 0.8 && pattern.occurrences > 3) {
    pattern.occurrences++;
    pattern.lastSeen = new Date().toISOString();
    return pattern.preferredResolution;
  }
  return null;
}

/** Get unresolved reports */
export function getUnresolvedReports(): AmbiguityReport[] {
  return reports.filter(r => !r.resolvedOption);
}

/** Get learned patterns */
export function getLearnedPatterns(): AmbiguityPattern[] {
  return Array.from(learnedPatterns.values())
    .sort((a, b) => b.occurrences - a.occurrences);
}

/** Get resolver health */
export function getAmbiguityHealth() {
  const resolved = reports.filter(r => r.resolvedOption).length;
  return {
    totalReports: reports.length,
    resolvedReports: resolved,
    resolutionRate: reports.length > 0 ? Math.round((resolved / reports.length) * 100) : 100,
    learnedPatterns: learnedPatterns.size,
    autoResolvable: Array.from(learnedPatterns.values()).filter(p => p.successRate > 0.8 && p.occurrences > 3).length,
  };
}

/** Reset */
export function resetAmbiguityResolver(): void {
  reports.length = 0;
  learnedPatterns.clear();
}
