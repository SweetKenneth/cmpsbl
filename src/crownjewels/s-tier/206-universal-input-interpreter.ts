/**
 * S-Tier 206 — Universal Input Interpreter
 * CJPI: 91 | Module: INCLUSIVE | ID: S-INC02
 *
 * Multi-modal input interpretation with pluggable parsers,
 * confidence scoring, fallback chains, and ambiguity resolution.
 * Zero dependencies. Pure TypeScript.
 */

export interface InputModality {
  name: string;
  parser: (input: string) => { intent: string; confidence: number; entities?: Record<string, string> };
  priority: number;
}

export interface InterpretationResult {
  intent: string;
  confidence: number;
  modality: string;
  entities: Record<string, string>;
  alternatives: { intent: string; confidence: number; modality: string }[];
  ambiguous: boolean;
}

export interface InterpreterStats {
  modalitiesRegistered: number;
  totalInterpretations: number;
  avgConfidence: number;
  ambiguityRate: number;
}

export function createUniversalInputInterpreter() {
  const modalities = new Map<string, InputModality>();
  let totalInterpretations = 0;
  let ambiguousCount = 0;
  let confidenceSum = 0;

  function registerModality(name: string, parser: InputModality['parser'], priority: number = 0): void {
    modalities.set(name, { name, parser, priority });
  }

  function interpret(input: string, preferredModality?: string): InterpretationResult {
    totalInterpretations++;
    const results: { intent: string; confidence: number; modality: string; entities: Record<string, string> }[] = [];

    // Try preferred first
    if (preferredModality && modalities.has(preferredModality)) {
      const mod = modalities.get(preferredModality)!;
      const r = mod.parser(input);
      results.push({ intent: r.intent, confidence: r.confidence, modality: mod.name, entities: r.entities ?? {} });
    }

    // Try all others sorted by priority
    const sorted = [...modalities.values()]
      .filter(m => m.name !== preferredModality)
      .sort((a, b) => b.priority - a.priority);

    for (const mod of sorted) {
      try {
        const r = mod.parser(input);
        if (r.confidence > 0.1) {
          results.push({ intent: r.intent, confidence: r.confidence, modality: mod.name, entities: r.entities ?? {} });
        }
      } catch { /* parser failure — skip */ }
    }

    if (results.length === 0) {
      return { intent: 'unknown', confidence: 0, modality: 'none', entities: {}, alternatives: [], ambiguous: false };
    }

    results.sort((a, b) => b.confidence - a.confidence);
    const best = results[0];
    const ambiguous = results.length > 1 && results[1].confidence > best.confidence * 0.8;

    if (ambiguous) ambiguousCount++;
    confidenceSum += best.confidence;

    return {
      intent: best.intent, confidence: best.confidence,
      modality: best.modality, entities: best.entities,
      alternatives: results.slice(1, 4),
      ambiguous,
    };
  }

  function getSupportedModalities(): string[] { return [...modalities.keys()]; }

  function getStats(): InterpreterStats {
    return {
      modalitiesRegistered: modalities.size,
      totalInterpretations,
      avgConfidence: totalInterpretations > 0 ? confidenceSum / totalInterpretations : 0,
      ambiguityRate: totalInterpretations > 0 ? ambiguousCount / totalInterpretations : 0,
    };
  }

  function reset(): void {
    modalities.clear(); totalInterpretations = 0; ambiguousCount = 0; confidenceSum = 0;
  }

  return { registerModality, interpret, getSupportedModalities, getStats, reset };
}
