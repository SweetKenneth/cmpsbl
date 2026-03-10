/**
 * S-Tier 042 — Pattern Extraction Engine
 * CJPI: 93 | Node: DREAM | ID: S-135
 *
 * Extracts recurring patterns from event streams and behavioral data.
 * Surfaces hidden correlations for DREAM's consolidation cycles.
 */

export interface EventRecord {
  id: string;
  type: string;
  module: string;
  timestamp: number;
  tags: string[];
}

export interface DetectedPattern {
  id: string;
  description: string;
  frequency: number;
  confidence: number;
  involvedModules: string[];
  sampleEventIds: string[];
  detectedAt: string;
}

export function extractPatterns(events: EventRecord[], minFrequency = 3): DetectedPattern[] {
  // Group by type+module pairs
  const pairCounts = new Map<string, EventRecord[]>();
  for (const e of events) {
    const key = `${e.type}::${e.module}`;
    if (!pairCounts.has(key)) pairCounts.set(key, []);
    pairCounts.get(key)!.push(e);
  }

  const patterns: DetectedPattern[] = [];
  let seq = 0;

  for (const [key, records] of pairCounts) {
    if (records.length < minFrequency) continue;
    const [type, module] = key.split('::');
    patterns.push({
      id: `pat-${++seq}`,
      description: `Recurring ${type} in ${module.toUpperCase()} (${records.length}×)`,
      frequency: records.length,
      confidence: Math.min(1, records.length / (events.length * 0.1)),
      involvedModules: [module],
      sampleEventIds: records.slice(0, 3).map(r => r.id),
      detectedAt: new Date().toISOString(),
    });
  }

  // Temporal co-occurrence (events within 1s of each other across modules)
  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
  const coOccurrence = new Map<string, number>();
  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = i + 1; j < sorted.length && sorted[j].timestamp - sorted[i].timestamp < 1000; j++) {
      if (sorted[i].module !== sorted[j].module) {
        const coKey = [sorted[i].module, sorted[j].module].sort().join('+');
        coOccurrence.set(coKey, (coOccurrence.get(coKey) ?? 0) + 1);
      }
    }
  }

  for (const [coKey, count] of coOccurrence) {
    if (count < minFrequency) continue;
    const modules = coKey.split('+');
    patterns.push({
      id: `pat-${++seq}`,
      description: `Temporal co-occurrence: ${modules.map(m => m.toUpperCase()).join(' ↔ ')} (${count}×)`,
      frequency: count,
      confidence: Math.min(1, count / 10),
      involvedModules: modules,
      sampleEventIds: [],
      detectedAt: new Date().toISOString(),
    });
  }

  return patterns.sort((a, b) => b.confidence - a.confidence);
}
