/**
 * Windowed Reflection Engine — Ported from SimNap
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Structured synthesis over time windows (4h/daily/weekly)
 * for richer cross-pattern insights and governance review.
 * 
 * Consumers: DREAM, GOVERNANCE, AUDIT, CONSCIENCE, ORACLE
 * Origin: simnapReflection.ts
 */

// ── Types ─────────────────────────────────────────────────────────

export type ReflectionWindow = 'micro' | 'session' | 'daily' | 'weekly';

export interface ReflectionEntry {
  id: string;
  content: string;
  source: string;
  importance: number;
  timestamp: number;
  tags: string[];
  domain?: string;
}

export interface ReflectionSynthesis {
  windowType: ReflectionWindow;
  windowStart: number;
  windowEnd: number;
  entries: ReflectionEntry[];
  patterns: SynthesizedPattern[];
  insights: string[];
  anomalies: string[];
  score: number;       // 0-1 quality score
  synthesizedAt: number;
}

export interface SynthesizedPattern {
  id: string;
  description: string;
  frequency: number;
  sources: string[];
  confidence: number;
  actionable: boolean;
}

export interface ReflectionConfig {
  windows: Record<ReflectionWindow, { durationMs: number; maxEntries: number }>;
  /** Minimum entries required to trigger synthesis */
  minEntriesForSynthesis: number;
  /** Minimum pattern frequency to be considered significant */
  minPatternFrequency: number;
}

// ── Default Config ────────────────────────────────────────────────

export const DEFAULT_REFLECTION_CONFIG: ReflectionConfig = {
  windows: {
    micro:   { durationMs: 4 * 60 * 60 * 1000,     maxEntries: 50 },   // 4 hours
    session: { durationMs: 12 * 60 * 60 * 1000,    maxEntries: 200 },  // 12 hours
    daily:   { durationMs: 24 * 60 * 60 * 1000,    maxEntries: 500 },  // 24 hours
    weekly:  { durationMs: 7 * 24 * 60 * 60 * 1000, maxEntries: 2000 }, // 7 days
  },
  minEntriesForSynthesis: 3,
  minPatternFrequency: 2,
};

// ── Reflection Store ──────────────────────────────────────────────

const reflectionBuffer: ReflectionEntry[] = [];
const synthesisHistory: ReflectionSynthesis[] = [];

/**
 * Add an entry to the reflection buffer
 */
export function addReflectionEntry(entry: Omit<ReflectionEntry, 'id' | 'timestamp'>): ReflectionEntry {
  const full: ReflectionEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  reflectionBuffer.push(full);

  // Keep buffer bounded
  if (reflectionBuffer.length > 5000) {
    reflectionBuffer.splice(0, reflectionBuffer.length - 5000);
  }

  return full;
}

/**
 * Get entries within a time window
 */
export function getWindowEntries(
  windowType: ReflectionWindow,
  config: ReflectionConfig = DEFAULT_REFLECTION_CONFIG
): ReflectionEntry[] {
  const now = Date.now();
  const windowConfig = config.windows[windowType];
  const cutoff = now - windowConfig.durationMs;

  return reflectionBuffer
    .filter(e => e.timestamp >= cutoff)
    .sort((a, b) => b.importance - a.importance)
    .slice(0, windowConfig.maxEntries);
}

/**
 * Detect patterns across entries using tag co-occurrence
 */
function detectPatterns(
  entries: ReflectionEntry[],
  minFrequency: number
): SynthesizedPattern[] {
  // Tag frequency map
  const tagFreq = new Map<string, { count: number; sources: Set<string>; entries: ReflectionEntry[] }>();

  for (const entry of entries) {
    for (const tag of entry.tags) {
      const existing = tagFreq.get(tag) ?? { count: 0, sources: new Set(), entries: [] };
      existing.count++;
      existing.sources.add(entry.source);
      existing.entries.push(entry);
      tagFreq.set(tag, existing);
    }
  }

  // Tag pairs (co-occurrence)
  const pairFreq = new Map<string, { count: number; sources: Set<string> }>();
  for (const entry of entries) {
    const sorted = [...entry.tags].sort();
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const key = `${sorted[i]}+${sorted[j]}`;
        const existing = pairFreq.get(key) ?? { count: 0, sources: new Set() };
        existing.count++;
        existing.sources.add(entry.source);
        pairFreq.set(key, existing);
      }
    }
  }

  const patterns: SynthesizedPattern[] = [];

  // Single-tag patterns
  for (const [tag, data] of tagFreq) {
    if (data.count >= minFrequency) {
      patterns.push({
        id: `pattern_${tag}`,
        description: `Recurring theme: \"${tag}\" across ${data.sources.size} source(s)`,
        frequency: data.count,
        sources: [...data.sources],
        confidence: Math.min(1, data.count / entries.length),
        actionable: data.count >= minFrequency * 2,
      });
    }
  }

  // Co-occurrence patterns
  for (const [pair, data] of pairFreq) {
    if (data.count >= minFrequency) {
      patterns.push({
        id: `copat_${pair}`,
        description: `Co-occurring themes: ${pair.replace('+', ' ↔ ')}`,
        frequency: data.count,
        sources: [...data.sources],
        confidence: Math.min(1, data.count / (entries.length * 0.5)),
        actionable: data.sources.size >= 2,
      });
    }
  }

  return patterns.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Synthesize reflection over a time window
 */
export function synthesizeWindow(
  windowType: ReflectionWindow,
  config: ReflectionConfig = DEFAULT_REFLECTION_CONFIG
): ReflectionSynthesis | null {
  const entries = getWindowEntries(windowType, config);

  if (entries.length < config.minEntriesForSynthesis) {
    return null;
  }

  const now = Date.now();
  const windowConfig = config.windows[windowType];
  const patterns = detectPatterns(entries, config.minPatternFrequency);

  // Generate insights from patterns
  const insights: string[] = [];
  const actionablePatterns = patterns.filter(p => p.actionable);

  if (actionablePatterns.length > 0) {
    insights.push(`${actionablePatterns.length} actionable pattern(s) detected in ${windowType} window`);
  }

  // Cross-source insights
  const multiSourcePatterns = patterns.filter(p => p.sources.length >= 2);
  if (multiSourcePatterns.length > 0) {
    insights.push(`${multiSourcePatterns.length} cross-module pattern(s) spanning multiple sources`);
  }

  // Anomaly detection — entries with unusually high/low importance
  const avgImportance = entries.reduce((s, e) => s + e.importance, 0) / entries.length;
  const anomalies: string[] = [];
  const outliers = entries.filter(e => Math.abs(e.importance - avgImportance) > 0.4);
  if (outliers.length > 0) {
    anomalies.push(`${outliers.length} importance outlier(s) detected (avg: ${avgImportance.toFixed(2)})`);
  }

  // Quality score
  const score = Math.min(1,
    (patterns.length / 10) * 0.4 +
    (insights.length / 5) * 0.3 +
    (entries.length / windowConfig.maxEntries) * 0.3
  );

  const synthesis: ReflectionSynthesis = {
    windowType,
    windowStart: now - windowConfig.durationMs,
    windowEnd: now,
    entries,
    patterns,
    insights,
    anomalies,
    score,
    synthesizedAt: now,
  };

  synthesisHistory.push(synthesis);
  if (synthesisHistory.length > 100) {
    synthesisHistory.splice(0, synthesisHistory.length - 100);
  }

  return synthesis;
}

/**
 * Get synthesis history
 */
export function getSynthesisHistory(limit: number = 20): ReflectionSynthesis[] {
  return synthesisHistory.slice(-limit);
}

/**
 * Clear reflection buffer (for testing or resets)
 */
export function clearReflectionBuffer(): void {
  reflectionBuffer.length = 0;
}
