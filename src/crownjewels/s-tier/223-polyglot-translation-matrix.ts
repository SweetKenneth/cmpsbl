/**
 * S-Tier 223 — Polyglot Translation Matrix
 * CJPI: 90 | Module: LINGUA | ID: S-LNG01
 *
 * Multi-directional term translation with fuzzy matching,
 * chain translation (A→B→C), usage analytics, and batch
 * operations. Zero dependencies. Pure TypeScript.
 */

export interface TranslationEntry {
  fromLang: string;
  toLang: string;
  term: string;
  translation: string;
  confidence: number;
  usageCount: number;
}

export interface TranslationResult {
  translation: string;
  confidence: number;
  isDirect: boolean;
  chain?: string[];
}

export interface MatrixStats {
  totalEntries: number;
  languages: string[];
  avgConfidence: number;
  topTerms: { term: string; lookups: number }[];
}

export function createPolyglotMatrix() {
  const entries: TranslationEntry[] = [];
  const lookupLog: { term: string; from: string; to: string; timestamp: number }[] = [];

  function register(fromLang: string, toLang: string, term: string, translation: string, confidence: number = 1): void {
    const existing = entries.find(e => e.fromLang === fromLang && e.toLang === toLang && e.term === term);
    if (existing) { existing.translation = translation; existing.confidence = confidence; return; }
    entries.push({ fromLang, toLang, term, translation, confidence, usageCount: 0 });
  }

  function translate(term: string, fromLang: string, toLang: string): TranslationResult {
    lookupLog.push({ term, from: fromLang, to: toLang, timestamp: Date.now() });
    const direct = entries.find(e => e.fromLang === fromLang && e.toLang === toLang && e.term === term);
    if (direct) {
      direct.usageCount++;
      return { translation: direct.translation, confidence: direct.confidence, isDirect: true };
    }
    // Chain translation: try A→X→B
    for (const pivot of entries.filter(e => e.fromLang === fromLang && e.term === term)) {
      const second = entries.find(e => e.fromLang === pivot.toLang && e.toLang === toLang && e.term === pivot.translation);
      if (second) {
        pivot.usageCount++;
        second.usageCount++;
        return {
          translation: second.translation,
          confidence: pivot.confidence * second.confidence * 0.85,
          isDirect: false,
          chain: [fromLang, pivot.toLang, toLang],
        };
      }
    }
    return { translation: term, confidence: 0, isDirect: false };
  }

  function translateBatch(terms: string[], fromLang: string, toLang: string): TranslationResult[] {
    return terms.map(t => translate(t, fromLang, toLang));
  }

  function fuzzyLookup(term: string, fromLang: string, toLang: string, threshold: number = 0.7): TranslationResult[] {
    const results: TranslationResult[] = [];
    for (const e of entries) {
      if (e.fromLang !== fromLang || e.toLang !== toLang) continue;
      const similarity = computeSimilarity(term.toLowerCase(), e.term.toLowerCase());
      if (similarity >= threshold) {
        results.push({ translation: e.translation, confidence: e.confidence * similarity, isDirect: true });
      }
    }
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  function computeSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    let matches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) matches++;
    }
    return matches / maxLen;
  }

  function getStats(): MatrixStats {
    const langs = new Set<string>();
    for (const e of entries) { langs.add(e.fromLang); langs.add(e.toLang); }
    const termCounts = new Map<string, number>();
    for (const l of lookupLog) termCounts.set(l.term, (termCounts.get(l.term) ?? 0) + 1);
    return {
      totalEntries: entries.length,
      languages: [...langs].sort(),
      avgConfidence: entries.length > 0 ? entries.reduce((s, e) => s + e.confidence, 0) / entries.length : 0,
      topTerms: [...termCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([term, lookups]) => ({ term, lookups })),
    };
  }

  function reset(): void { entries.length = 0; lookupLog.length = 0; }

  return { register, translate, translateBatch, fuzzyLookup, getStats, reset };
}
