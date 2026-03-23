/**
 * CMPSBL® MEMORY — Contextual Retrieval Augmentation (CRA)
 * Indexes memories by the *situation* they were formed in, not just content.
 *
 * Situational metadata includes:
 * - Active module context (which nodes were active)
 * - Temporal context (time of day, session phase)
 * - Task context (what was being worked on)
 * - Environmental state (error rate, load level)
 *
 * Enables: "What did we learn last time we were in this situation?"
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SituationalContext {
  activeModules: string[];
  sessionPhase: 'startup' | 'active' | 'idle' | 'recovery' | 'shutdown';
  taskType: string;
  errorRate: number;       // 0-1
  loadLevel: number;       // 0-1
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number;       // 0-6
}

export interface ContextualMemoryEntry {
  memoryId: string;
  content: string;
  situation: SituationalContext;
  storedAt: number;
}

export interface SituationMatch {
  memoryId: string;
  content: string;
  similarity: number;
  matchedDimensions: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_ENTRIES = 3000;

class ContextualRetrievalEngine {
  private entries: ContextualMemoryEntry[] = [];
  private moduleIndex = new Map<string, Set<number>>(); // module → entry indices

  /**
   * Store a memory with its situational context.
   */
  store(memoryId: string, content: string, situation: SituationalContext): void {
    const idx = this.entries.length;
    this.entries.push({ memoryId, content, situation, storedAt: Date.now() });

    // Index by active modules for fast lookup
    for (const mod of situation.activeModules) {
      if (!this.moduleIndex.has(mod)) this.moduleIndex.set(mod, new Set());
      this.moduleIndex.get(mod)!.add(idx);
    }

    this.enforceCapacity();
  }

  /**
   * Retrieve memories formed in a similar situation.
   * Matches across all situational dimensions with weighted scoring.
   */
  retrieveBySituation(currentSituation: SituationalContext, limit: number = 10): SituationMatch[] {
    const candidates: SituationMatch[] = [];

    // Pre-filter: only consider entries sharing at least one active module
    const candidateIndices = new Set<number>();
    for (const mod of currentSituation.activeModules) {
      const indices = this.moduleIndex.get(mod);
      if (indices) {
        for (const idx of indices) candidateIndices.add(idx);
      }
    }

    // If no module overlap, fall back to full scan (limited)
    const indicesToCheck = candidateIndices.size > 0
      ? [...candidateIndices]
      : this.entries.map((_, i) => i).slice(-100);

    for (const idx of indicesToCheck) {
      const entry = this.entries[idx];
      if (!entry) continue;

      const { similarity, dimensions } = this.situationSimilarity(currentSituation, entry.situation);
      if (similarity >= 0.3) {
        candidates.push({
          memoryId: entry.memoryId,
          content: entry.content,
          similarity,
          matchedDimensions: dimensions,
        });
      }
    }

    candidates.sort((a, b) => b.similarity - a.similarity);
    return candidates.slice(0, limit);
  }

  /**
   * Compute weighted situational similarity across dimensions.
   */
  private situationSimilarity(a: SituationalContext, b: SituationalContext): { similarity: number; dimensions: string[] } {
    let score = 0;
    let maxScore = 0;
    const dimensions: string[] = [];

    // Module overlap (weight: 0.30)
    const aModules = new Set(a.activeModules);
    const bModules = new Set(b.activeModules);
    let modOverlap = 0;
    for (const m of aModules) if (bModules.has(m)) modOverlap++;
    const modUnion = new Set([...aModules, ...bModules]).size;
    const modSim = modUnion > 0 ? modOverlap / modUnion : 0;
    score += modSim * 0.30;
    maxScore += 0.30;
    if (modSim > 0.3) dimensions.push('modules');

    // Session phase (weight: 0.15)
    if (a.sessionPhase === b.sessionPhase) { score += 0.15; dimensions.push('phase'); }
    maxScore += 0.15;

    // Task type (weight: 0.25)
    if (a.taskType === b.taskType) { score += 0.25; dimensions.push('task'); }
    maxScore += 0.25;

    // Error rate proximity (weight: 0.10)
    const errorDiff = Math.abs(a.errorRate - b.errorRate);
    const errorSim = 1 - errorDiff;
    score += errorSim * 0.10;
    maxScore += 0.10;
    if (errorSim > 0.7) dimensions.push('errorRate');

    // Load level proximity (weight: 0.10)
    const loadDiff = Math.abs(a.loadLevel - b.loadLevel);
    const loadSim = 1 - loadDiff;
    score += loadSim * 0.10;
    maxScore += 0.10;
    if (loadSim > 0.7) dimensions.push('load');

    // Time of day (weight: 0.05)
    if (a.timeOfDay === b.timeOfDay) { score += 0.05; dimensions.push('time'); }
    maxScore += 0.05;

    // Day of week (weight: 0.05)
    if (a.dayOfWeek === b.dayOfWeek) { score += 0.05; dimensions.push('day'); }
    maxScore += 0.05;

    return { similarity: maxScore > 0 ? score / maxScore : 0, dimensions };
  }

  /**
   * Build current situational context from system state.
   */
  static buildContext(activeModules: string[], taskType: string, errorRate: number = 0, loadLevel: number = 0.5): SituationalContext {
    const hour = new Date().getHours();
    const timeOfDay: SituationalContext['timeOfDay'] =
      hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 22 ? 'evening' : 'night';

    return {
      activeModules,
      sessionPhase: 'active',
      taskType,
      errorRate: Math.max(0, Math.min(1, errorRate)),
      loadLevel: Math.max(0, Math.min(1, loadLevel)),
      timeOfDay,
      dayOfWeek: new Date().getDay(),
    };
  }

  getStats() {
    return {
      totalEntries: this.entries.length,
      indexedModules: this.moduleIndex.size,
      avgModulesPerEntry: this.entries.length > 0
        ? this.entries.reduce((s, e) => s + e.situation.activeModules.length, 0) / this.entries.length
        : 0,
    };
  }

  private enforceCapacity(): void {
    if (this.entries.length <= MAX_ENTRIES) return;
    const excess = this.entries.length - MAX_ENTRIES;
    this.entries.splice(0, excess);
    // Rebuild module index
    this.moduleIndex.clear();
    for (let i = 0; i < this.entries.length; i++) {
      for (const mod of this.entries[i].situation.activeModules) {
        if (!this.moduleIndex.has(mod)) this.moduleIndex.set(mod, new Set());
        this.moduleIndex.get(mod)!.add(i);
      }
    }
  }

  clear(): void {
    this.entries = [];
    this.moduleIndex.clear();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _engine: ContextualRetrievalEngine | null = null;

export function getContextualRetrieval(): ContextualRetrievalEngine {
  if (!_engine) _engine = new ContextualRetrievalEngine();
  return _engine;
}

export function resetContextualRetrieval(): void {
  _engine = null;
}
