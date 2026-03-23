/**
 * CMPSBL® MEMORY — Memory Interference Detection
 * Detects proactive and retroactive interference between memories.
 *
 * Proactive: old memories impair recall of new similar content
 * Retroactive: new memories degrade recall of older similar content
 *
 * When interference is detected, applies corrective measures:
 * - Distinctiveness boosting (make similar memories more different)
 * - Spacing adjustment (increase retrieval intervals)
 * - Context enrichment (add disambiguating context)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface InterferenceEvent {
  id: string;
  type: 'proactive' | 'retroactive';
  interferingMemoryId: string;
  affectedMemoryId: string;
  similarity: number;
  severityScore: number;   // 0-1
  detectedAt: number;
  mitigationApplied: string | null;
}

export interface InterferenceReport {
  totalDetected: number;
  proactiveCount: number;
  retroactiveCount: number;
  avgSeverity: number;
  mostAffectedMemory: string | null;
  mitigationsSuggested: MitigationSuggestion[];
}

export interface MitigationSuggestion {
  affectedMemoryId: string;
  strategy: 'distinctiveness' | 'spacing' | 'context-enrichment';
  description: string;
  priority: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Similarity threshold above which interference is likely */
const INTERFERENCE_THRESHOLD = 0.5;
/** Maximum events to retain */
const MAX_EVENTS = 500;

let eventCounter = 0;

class InterferenceDetector {
  private events: InterferenceEvent[] = [];
  private recallFailures = new Map<string, number>(); // memoryId → failure count

  /**
   * Check for interference when a new memory is stored.
   * Compare against existing memories to detect potential interference.
   */
  checkOnStore(
    newMemoryId: string,
    newContent: string,
    existingMemories: Array<{ id: string; content: string; createdAt: number }>,
    similarityFn: (a: string, b: string) => number
  ): InterferenceEvent[] {
    const detected: InterferenceEvent[] = [];

    for (const existing of existingMemories) {
      const similarity = similarityFn(newContent, existing.content);
      if (similarity < INTERFERENCE_THRESHOLD) continue;

      // New memory may cause retroactive interference on old memory
      const severity = this.calculateSeverity(similarity, existing.createdAt);
      if (severity > 0.3) {
        const event: InterferenceEvent = {
          id: `interference-${++eventCounter}`,
          type: 'retroactive',
          interferingMemoryId: newMemoryId,
          affectedMemoryId: existing.id,
          similarity,
          severityScore: severity,
          detectedAt: Date.now(),
          mitigationApplied: null,
        };
        detected.push(event);
        this.events.push(event);
      }
    }

    this.enforceCapacity();
    return detected;
  }

  /**
   * Check for proactive interference on recall attempt.
   * Called when a memory is recalled but other similar memories may interfere.
   */
  checkOnRecall(
    targetMemoryId: string,
    targetContent: string,
    competingMemories: Array<{ id: string; content: string; accessCount: number }>,
    similarityFn: (a: string, b: string) => number
  ): InterferenceEvent[] {
    const detected: InterferenceEvent[] = [];

    for (const competitor of competingMemories) {
      if (competitor.id === targetMemoryId) continue;

      const similarity = similarityFn(targetContent, competitor.content);
      if (similarity < INTERFERENCE_THRESHOLD) continue;

      // Competitor with higher access count may proactively interfere
      if (competitor.accessCount > 3) {
        const severity = similarity * Math.min(1, competitor.accessCount / 10);
        if (severity > 0.3) {
          const event: InterferenceEvent = {
            id: `interference-${++eventCounter}`,
            type: 'proactive',
            interferingMemoryId: competitor.id,
            affectedMemoryId: targetMemoryId,
            similarity,
            severityScore: severity,
            detectedAt: Date.now(),
            mitigationApplied: null,
          };
          detected.push(event);
          this.events.push(event);
        }
      }
    }

    this.enforceCapacity();
    return detected;
  }

  /**
   * Record a recall failure — helps identify chronic interference.
   */
  recordRecallFailure(memoryId: string): void {
    this.recallFailures.set(memoryId, (this.recallFailures.get(memoryId) || 0) + 1);
  }

  /**
   * Generate mitigation suggestions for detected interference.
   */
  getMitigations(limit: number = 10): MitigationSuggestion[] {
    const affectedCounts = new Map<string, { total: number; maxSeverity: number; events: InterferenceEvent[] }>();

    for (const event of this.events) {
      if (event.mitigationApplied) continue;
      const existing = affectedCounts.get(event.affectedMemoryId) || { total: 0, maxSeverity: 0, events: [] };
      existing.total++;
      existing.maxSeverity = Math.max(existing.maxSeverity, event.severityScore);
      existing.events.push(event);
      affectedCounts.set(event.affectedMemoryId, existing);
    }

    const suggestions: MitigationSuggestion[] = [];

    for (const [memId, info] of affectedCounts) {
      const failCount = this.recallFailures.get(memId) || 0;
      const priority = info.maxSeverity * 0.5 + Math.min(1, info.total / 5) * 0.3 + Math.min(1, failCount / 3) * 0.2;

      if (info.maxSeverity > 0.7) {
        suggestions.push({
          affectedMemoryId: memId,
          strategy: 'distinctiveness',
          description: `High-similarity interference (${(info.maxSeverity * 100).toFixed(0)}%). Add distinguishing keywords or context.`,
          priority,
        });
      } else if (info.total > 2) {
        suggestions.push({
          affectedMemoryId: memId,
          strategy: 'spacing',
          description: `Multiple interference events (${info.total}). Increase retrieval spacing intervals.`,
          priority,
        });
      } else {
        suggestions.push({
          affectedMemoryId: memId,
          strategy: 'context-enrichment',
          description: `Moderate interference. Enrich with situational context for disambiguation.`,
          priority,
        });
      }
    }

    return suggestions.sort((a, b) => b.priority - a.priority).slice(0, limit);
  }

  /**
   * Mark a mitigation as applied.
   */
  applyMitigation(affectedMemoryId: string, strategy: string): number {
    let applied = 0;
    for (const event of this.events) {
      if (event.affectedMemoryId === affectedMemoryId && !event.mitigationApplied) {
        event.mitigationApplied = strategy;
        applied++;
      }
    }
    return applied;
  }

  /**
   * Get interference report.
   */
  getReport(): InterferenceReport {
    const proactive = this.events.filter(e => e.type === 'proactive');
    const retroactive = this.events.filter(e => e.type === 'retroactive');
    const avgSeverity = this.events.length > 0
      ? this.events.reduce((s, e) => s + e.severityScore, 0) / this.events.length : 0;

    // Find most affected memory
    const affectedCounts = new Map<string, number>();
    for (const e of this.events) affectedCounts.set(e.affectedMemoryId, (affectedCounts.get(e.affectedMemoryId) || 0) + 1);
    let mostAffected: string | null = null;
    let maxCount = 0;
    for (const [id, count] of affectedCounts) {
      if (count > maxCount) { mostAffected = id; maxCount = count; }
    }

    return {
      totalDetected: this.events.length,
      proactiveCount: proactive.length,
      retroactiveCount: retroactive.length,
      avgSeverity,
      mostAffectedMemory: mostAffected,
      mitigationsSuggested: this.getMitigations(),
    };
  }

  private calculateSeverity(similarity: number, createdAt: number): number {
    const ageHours = (Date.now() - createdAt) / 3600000;
    // Older memories are more vulnerable to retroactive interference
    const ageFactor = Math.min(1, ageHours / 168); // peaks at 1 week
    return similarity * 0.6 + ageFactor * 0.4;
  }

  private enforceCapacity(): void {
    if (this.events.length > MAX_EVENTS) {
      this.events = this.events.slice(-MAX_EVENTS);
    }
  }

  clear(): void {
    this.events = [];
    this.recallFailures.clear();
    eventCounter = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _detector: InterferenceDetector | null = null;

export function getInterferenceDetector(): InterferenceDetector {
  if (!_detector) _detector = new InterferenceDetector();
  return _detector;
}

export function resetInterferenceDetector(): void {
  _detector = null;
}
