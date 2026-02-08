/**
 * Advanced Cognitive Functions — v8.0.0 SYNERGY+ Epoch
 * 14 high-value cognitive enhancement patterns
 */

// ═══════════════════════════════════════════════════════════════
// 1. ASSOCIATIVE MEMORY — Graph-based memory connections
// ═══════════════════════════════════════════════════════════════

export class AssociativeMemory {
  private nodes: Map<string, {
    id: string;
    content: unknown;
    strength: number;
    lastAccessed: number;
    accessCount: number;
  }> = new Map();

  private edges: Map<string, Map<string, number>> = new Map();

  store(id: string, content: unknown, associations: string[] = []): void {
    this.nodes.set(id, {
      id,
      content,
      strength: 1.0,
      lastAccessed: Date.now(),
      accessCount: 1,
    });

    // Create bidirectional associations
    for (const assocId of associations) {
      this.associate(id, assocId, 0.5);
    }
  }

  associate(id1: string, id2: string, weight: number): void {
    if (!this.edges.has(id1)) this.edges.set(id1, new Map());
    if (!this.edges.has(id2)) this.edges.set(id2, new Map());

    const existing1 = this.edges.get(id1)!.get(id2) ?? 0;
    const existing2 = this.edges.get(id2)!.get(id1) ?? 0;

    // Strengthen with Hebbian learning
    this.edges.get(id1)!.set(id2, Math.min(1, existing1 + weight));
    this.edges.get(id2)!.set(id1, Math.min(1, existing2 + weight));
  }

  recall(id: string): unknown | null {
    const node = this.nodes.get(id);
    if (!node) return null;

    // Strengthen on access
    node.lastAccessed = Date.now();
    node.accessCount++;
    node.strength = Math.min(1, node.strength + 0.1);

    return node.content;
  }

  spreadingActivation(
    startId: string,
    depth = 3,
    threshold = 0.1
  ): Array<{ id: string; activation: number; content: unknown }> {
    const activations = new Map<string, number>();
    activations.set(startId, 1.0);

    const result: Array<{ id: string; activation: number; content: unknown }> = [];
    const visited = new Set<string>();

    const spread = (nodeId: string, currentActivation: number, currentDepth: number) => {
      if (currentDepth > depth || currentActivation < threshold || visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = this.nodes.get(nodeId);
      if (node) {
        result.push({ id: nodeId, activation: currentActivation, content: node.content });
      }

      const neighbors = this.edges.get(nodeId);
      if (neighbors) {
        for (const [neighborId, weight] of neighbors) {
          const newActivation = currentActivation * weight * 0.7; // Decay factor
          spread(neighborId, newActivation, currentDepth + 1);
        }
      }
    };

    spread(startId, 1.0, 0);
    return result.sort((a, b) => b.activation - a.activation);
  }

  prune(minStrength = 0.1, maxAge = 86400000): number {
    let pruned = 0;
    const now = Date.now();

    for (const [id, node] of this.nodes) {
      if (node.strength < minStrength && now - node.lastAccessed > maxAge) {
        this.nodes.delete(id);
        this.edges.delete(id);
        pruned++;
      }
    }

    return pruned;
  }
}

// ═══════════════════════════════════════════════════════════════
// 2. CONTEXT WEAVER — Dynamic context assembly
// ═══════════════════════════════════════════════════════════════

export class ContextWeaver {
  private contextFrames: Map<string, {
    id: string;
    layers: Array<{ name: string; data: unknown; weight: number }>;
    createdAt: number;
    maxTokens: number;
  }> = new Map();

  createFrame(id: string, maxTokens = 4000): void {
    this.contextFrames.set(id, {
      id,
      layers: [],
      createdAt: Date.now(),
      maxTokens,
    });
  }

  addLayer(frameId: string, name: string, data: unknown, weight = 1.0): void {
    const frame = this.contextFrames.get(frameId);
    if (!frame) return;

    frame.layers.push({ name, data, weight });
  }

  weave(frameId: string): {
    context: unknown[];
    totalWeight: number;
    layerCount: number;
  } | null {
    const frame = this.contextFrames.get(frameId);
    if (!frame) return null;

    // Sort by weight and assemble
    const sorted = [...frame.layers].sort((a, b) => b.weight - a.weight);
    const context: unknown[] = [];
    let totalWeight = 0;

    for (const layer of sorted) {
      context.push(layer.data);
      totalWeight += layer.weight;
    }

    return {
      context,
      totalWeight,
      layerCount: sorted.length,
    };
  }

  compress(frameId: string, targetLayers: number): void {
    const frame = this.contextFrames.get(frameId);
    if (!frame) return;

    // Keep top N layers by weight
    frame.layers.sort((a, b) => b.weight - a.weight);
    frame.layers = frame.layers.slice(0, targetLayers);
  }
}

// ═══════════════════════════════════════════════════════════════
// 3. INFERENCE ENGINE — Logical reasoning chains
// ═══════════════════════════════════════════════════════════════

export class InferenceEngine {
  private facts: Map<string, { value: unknown; confidence: number; source: string }> = new Map();
  private rules: Array<{
    id: string;
    conditions: string[];
    conclusion: string;
    confidence: number;
  }> = [];

  assertFact(key: string, value: unknown, confidence: number, source: string): void {
    this.facts.set(key, { value, confidence, source });
  }

  addRule(
    id: string,
    conditions: string[],
    conclusion: string,
    confidence: number
  ): void {
    this.rules.push({ id, conditions, conclusion, confidence });
  }

  infer(): Array<{
    fact: string;
    value: unknown;
    confidence: number;
    derivedFrom: string[];
  }> {
    const derived: Array<{
      fact: string;
      value: unknown;
      confidence: number;
      derivedFrom: string[];
    }> = [];

    let changed = true;
    let iterations = 0;
    const maxIterations = 100;

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;

      for (const rule of this.rules) {
        // Check if conclusion already exists
        if (this.facts.has(rule.conclusion)) continue;

        // Check all conditions
        let allConditionsMet = true;
        let minConfidence = rule.confidence;
        const sources: string[] = [];

        for (const condition of rule.conditions) {
          const fact = this.facts.get(condition);
          if (!fact) {
            allConditionsMet = false;
            break;
          }
          minConfidence = Math.min(minConfidence, fact.confidence);
          sources.push(condition);
        }

        if (allConditionsMet) {
          const newFact = {
            value: true,
            confidence: minConfidence * rule.confidence,
            source: `rule:${rule.id}`,
          };
          this.facts.set(rule.conclusion, newFact);
          derived.push({
            fact: rule.conclusion,
            value: true,
            confidence: newFact.confidence,
            derivedFrom: sources,
          });
          changed = true;
        }
      }
    }

    return derived;
  }

  query(factKey: string): { value: unknown; confidence: number } | null {
    const fact = this.facts.get(factKey);
    if (!fact) return null;
    return { value: fact.value, confidence: fact.confidence };
  }
}

// ═══════════════════════════════════════════════════════════════
// 4. PATTERN RECOGNIZER — Sequence pattern detection
// ═══════════════════════════════════════════════════════════════

export class PatternRecognizer {
  private sequences: string[][] = [];
  private patterns: Map<string, { pattern: string[]; frequency: number; confidence: number }> = new Map();

  recordSequence(sequence: string[]): void {
    this.sequences.push(sequence);
    this.extractPatterns(sequence);

    // Keep last 1000 sequences
    if (this.sequences.length > 1000) {
      this.sequences.shift();
    }
  }

  private extractPatterns(sequence: string[]): void {
    // Extract n-grams of various lengths
    for (let n = 2; n <= Math.min(5, sequence.length); n++) {
      for (let i = 0; i <= sequence.length - n; i++) {
        const pattern = sequence.slice(i, i + n);
        const key = pattern.join('→');
        const existing = this.patterns.get(key);

        if (existing) {
          existing.frequency++;
          existing.confidence = Math.min(1, existing.frequency / 10);
        } else {
          this.patterns.set(key, { pattern, frequency: 1, confidence: 0.1 });
        }
      }
    }
  }

  predict(prefix: string[]): Array<{ next: string; confidence: number }> {
    const predictions = new Map<string, number>();
    const prefixKey = prefix.join('→');

    for (const [key, data] of this.patterns) {
      if (key.startsWith(prefixKey + '→')) {
        const next = data.pattern[prefix.length];
        if (next) {
          const existing = predictions.get(next) ?? 0;
          predictions.set(next, existing + data.confidence);
        }
      }
    }

    return Array.from(predictions.entries())
      .map(([next, score]) => ({ next, confidence: Math.min(1, score) }))
      .sort((a, b) => b.confidence - a.confidence);
  }

  getTopPatterns(n = 10): Array<{ pattern: string[]; frequency: number }> {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, n)
      .map(p => ({ pattern: p.pattern, frequency: p.frequency }));
  }
}

// ═══════════════════════════════════════════════════════════════
// 5. WORKING MEMORY — Short-term cognitive buffer
// ═══════════════════════════════════════════════════════════════

export class WorkingMemory {
  private slots: Map<string, { content: unknown; priority: number; expiresAt: number }> = new Map();
  private readonly capacity = 7; // Miller's Law

  store(key: string, content: unknown, priority = 1, ttlMs = 30000): boolean {
    // Evict if at capacity
    if (this.slots.size >= this.capacity && !this.slots.has(key)) {
      this.evictLowest();
    }

    this.slots.set(key, {
      content,
      priority,
      expiresAt: Date.now() + ttlMs,
    });

    return true;
  }

  retrieve(key: string): unknown | null {
    const slot = this.slots.get(key);
    if (!slot) return null;

    if (Date.now() > slot.expiresAt) {
      this.slots.delete(key);
      return null;
    }

    // Boost priority on access
    slot.priority = Math.min(10, slot.priority + 1);
    return slot.content;
  }

  private evictLowest(): void {
    let lowestKey: string | null = null;
    let lowestPriority = Infinity;

    for (const [key, slot] of this.slots) {
      if (slot.priority < lowestPriority) {
        lowestPriority = slot.priority;
        lowestKey = key;
      }
    }

    if (lowestKey) {
      this.slots.delete(lowestKey);
    }
  }

  getActiveCount(): number {
    this.cleanup();
    return this.slots.size;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, slot] of this.slots) {
      if (now > slot.expiresAt) {
        this.slots.delete(key);
      }
    }
  }

  dump(): Array<{ key: string; priority: number; ttlRemaining: number }> {
    this.cleanup();
    const now = Date.now();
    return Array.from(this.slots.entries())
      .map(([key, slot]) => ({
        key,
        priority: slot.priority,
        ttlRemaining: slot.expiresAt - now,
      }))
      .sort((a, b) => b.priority - a.priority);
  }
}

// ═══════════════════════════════════════════════════════════════
// 6. ATTENTION ROUTER — Priority-based focus management
// ═══════════════════════════════════════════════════════════════

export class AttentionRouter {
  private streams: Map<string, {
    id: string;
    priority: number;
    bandwidth: number;
    processor: (input: unknown) => unknown;
  }> = new Map();

  private focusHistory: Array<{ streamId: string; timestamp: number; duration: number }> = [];

  registerStream(
    id: string,
    priority: number,
    bandwidth: number,
    processor: (input: unknown) => unknown
  ): void {
    this.streams.set(id, { id, priority, bandwidth, processor });
  }

  route(input: unknown, availableBandwidth: number): Array<{
    streamId: string;
    output: unknown;
    bandwidthUsed: number;
  }> {
    const results: Array<{ streamId: string; output: unknown; bandwidthUsed: number }> = [];
    let remainingBandwidth = availableBandwidth;

    // Sort by priority
    const sorted = Array.from(this.streams.values())
      .sort((a, b) => b.priority - a.priority);

    for (const stream of sorted) {
      if (remainingBandwidth < stream.bandwidth) continue;

      const startTime = Date.now();
      const output = stream.processor(input);
      const duration = Date.now() - startTime;

      results.push({
        streamId: stream.id,
        output,
        bandwidthUsed: stream.bandwidth,
      });

      this.focusHistory.push({ streamId: stream.id, timestamp: startTime, duration });
      remainingBandwidth -= stream.bandwidth;
    }

    return results;
  }

  adjustPriority(streamId: string, delta: number): void {
    const stream = this.streams.get(streamId);
    if (stream) {
      stream.priority = Math.max(0, Math.min(10, stream.priority + delta));
    }
  }

  getFocusStats(): Map<string, { totalTime: number; accessCount: number }> {
    const stats = new Map<string, { totalTime: number; accessCount: number }>();

    for (const entry of this.focusHistory) {
      const existing = stats.get(entry.streamId) ?? { totalTime: 0, accessCount: 0 };
      existing.totalTime += entry.duration;
      existing.accessCount++;
      stats.set(entry.streamId, existing);
    }

    return stats;
  }
}

// ═══════════════════════════════════════════════════════════════
// 7. CONCEPT LATTICE — Hierarchical concept organization
// ═══════════════════════════════════════════════════════════════

export class ConceptLattice {
  private concepts: Map<string, {
    id: string;
    name: string;
    attributes: Set<string>;
    parents: Set<string>;
    children: Set<string>;
  }> = new Map();

  addConcept(id: string, name: string, attributes: string[]): void {
    this.concepts.set(id, {
      id,
      name,
      attributes: new Set(attributes),
      parents: new Set(),
      children: new Set(),
    });
  }

  setParent(childId: string, parentId: string): void {
    const child = this.concepts.get(childId);
    const parent = this.concepts.get(parentId);
    if (!child || !parent) return;

    child.parents.add(parentId);
    parent.children.add(childId);
  }

  getAncestors(conceptId: string): string[] {
    const ancestors: string[] = [];
    const visited = new Set<string>();

    const traverse = (id: string) => {
      const concept = this.concepts.get(id);
      if (!concept || visited.has(id)) return;
      visited.add(id);

      for (const parentId of concept.parents) {
        ancestors.push(parentId);
        traverse(parentId);
      }
    };

    traverse(conceptId);
    return ancestors;
  }

  getDescendants(conceptId: string): string[] {
    const descendants: string[] = [];
    const visited = new Set<string>();

    const traverse = (id: string) => {
      const concept = this.concepts.get(id);
      if (!concept || visited.has(id)) return;
      visited.add(id);

      for (const childId of concept.children) {
        descendants.push(childId);
        traverse(childId);
      }
    };

    traverse(conceptId);
    return descendants;
  }

  findByAttributes(requiredAttributes: string[]): string[] {
    const matches: string[] = [];

    for (const [id, concept] of this.concepts) {
      const hasAll = requiredAttributes.every(attr => concept.attributes.has(attr));
      if (hasAll) {
        matches.push(id);
      }
    }

    return matches;
  }

  leastCommonAncestor(id1: string, id2: string): string | null {
    const ancestors1 = new Set(this.getAncestors(id1));
    const ancestors2 = this.getAncestors(id2);

    for (const ancestor of ancestors2) {
      if (ancestors1.has(ancestor)) {
        return ancestor;
      }
    }

    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// 8-14: Additional Cognitive Patterns
// ═══════════════════════════════════════════════════════════════

export class EpisodicBuffer {
  private episodes: Array<{
    id: string;
    timestamp: number;
    context: Record<string, unknown>;
    events: unknown[];
    outcome: unknown;
  }> = [];

  record(context: Record<string, unknown>, events: unknown[], outcome: unknown): string {
    const id = `ep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.episodes.push({ id, timestamp: Date.now(), context, events, outcome });
    
    if (this.episodes.length > 500) {
      this.episodes.shift();
    }
    
    return id;
  }

  recallSimilar(context: Record<string, unknown>, limit = 5): typeof this.episodes {
    const contextKeys = Object.keys(context);
    
    return this.episodes
      .map(ep => {
        const overlap = contextKeys.filter(k => ep.context[k] === context[k]).length;
        return { ep, score: overlap / contextKeys.length };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(x => x.ep);
  }
}

export class MetaCognition {
  private confidenceHistory: Array<{ task: string; predicted: number; actual: number; timestamp: number }> = [];

  recordPrediction(task: string, predictedConfidence: number, actualSuccess: boolean): void {
    this.confidenceHistory.push({
      task,
      predicted: predictedConfidence,
      actual: actualSuccess ? 1 : 0,
      timestamp: Date.now(),
    });
  }

  getCalibration(): { overconfident: number; underconfident: number; calibrated: number } {
    if (this.confidenceHistory.length === 0) {
      return { overconfident: 0, underconfident: 0, calibrated: 0 };
    }

    let overconfident = 0;
    let underconfident = 0;
    let calibrated = 0;

    for (const entry of this.confidenceHistory) {
      const diff = entry.predicted - entry.actual;
      if (diff > 0.2) overconfident++;
      else if (diff < -0.2) underconfident++;
      else calibrated++;
    }

    const total = this.confidenceHistory.length;
    return {
      overconfident: overconfident / total,
      underconfident: underconfident / total,
      calibrated: calibrated / total,
    };
  }

  suggestConfidenceAdjustment(taskType: string): number {
    const relevant = this.confidenceHistory.filter(h => h.task === taskType);
    if (relevant.length < 5) return 0;

    const avgDiff = relevant.reduce((sum, h) => sum + (h.predicted - h.actual), 0) / relevant.length;
    return -avgDiff * 0.5; // Suggest adjustment to counter bias
  }
}

export class GoalStack {
  private stack: Array<{
    id: string;
    description: string;
    priority: number;
    subgoals: string[];
    status: 'active' | 'suspended' | 'completed' | 'failed';
  }> = [];

  push(id: string, description: string, priority: number): void {
    this.stack.push({ id, description, priority, subgoals: [], status: 'active' });
    this.stack.sort((a, b) => b.priority - a.priority);
  }

  pop(): typeof this.stack[0] | undefined {
    return this.stack.shift();
  }

  peek(): typeof this.stack[0] | undefined {
    return this.stack[0];
  }

  suspend(id: string): void {
    const goal = this.stack.find(g => g.id === id);
    if (goal) goal.status = 'suspended';
  }

  resume(id: string): void {
    const goal = this.stack.find(g => g.id === id);
    if (goal) goal.status = 'active';
  }

  addSubgoal(parentId: string, subgoalId: string): void {
    const parent = this.stack.find(g => g.id === parentId);
    if (parent) parent.subgoals.push(subgoalId);
  }

  getActiveGoals(): typeof this.stack {
    return this.stack.filter(g => g.status === 'active');
  }
}

export class BeliefRevision {
  private beliefs: Map<string, { value: unknown; confidence: number; sources: string[] }> = new Map();

  assert(key: string, value: unknown, confidence: number, source: string): void {
    const existing = this.beliefs.get(key);

    if (!existing) {
      this.beliefs.set(key, { value, confidence, sources: [source] });
      return;
    }

    // Revise based on new evidence
    if (confidence > existing.confidence) {
      this.beliefs.set(key, { value, confidence, sources: [...existing.sources, source] });
    } else {
      existing.sources.push(source);
    }
  }

  query(key: string): { value: unknown; confidence: number } | null {
    const belief = this.beliefs.get(key);
    if (!belief) return null;
    return { value: belief.value, confidence: belief.confidence };
  }

  contradict(key: string, newValue: unknown, confidence: number, source: string): {
    revised: boolean;
    oldValue: unknown;
  } {
    const existing = this.beliefs.get(key);
    if (!existing) {
      this.beliefs.set(key, { value: newValue, confidence, sources: [source] });
      return { revised: true, oldValue: null };
    }

    if (confidence > existing.confidence) {
      const oldValue = existing.value;
      this.beliefs.set(key, { value: newValue, confidence, sources: [source] });
      return { revised: true, oldValue };
    }

    return { revised: false, oldValue: existing.value };
  }

  getContradictions(): Array<{ key: string; sources: string[] }> {
    // Identify beliefs with multiple conflicting sources
    return Array.from(this.beliefs.entries())
      .filter(([, belief]) => belief.sources.length > 1)
      .map(([key, belief]) => ({ key, sources: belief.sources }));
  }
}

export class AnalogicalReasoner {
  private cases: Map<string, { structure: Record<string, unknown>; solution: unknown }> = new Map();

  storeCase(caseId: string, structure: Record<string, unknown>, solution: unknown): void {
    this.cases.set(caseId, { structure, solution });
  }

  findAnalog(targetStructure: Record<string, unknown>): {
    caseId: string;
    similarity: number;
    suggestedSolution: unknown;
  } | null {
    let bestMatch: { caseId: string; similarity: number; suggestedSolution: unknown } | null = null;
    let bestSimilarity = 0;

    const targetKeys = Object.keys(targetStructure);

    for (const [caseId, caseData] of this.cases) {
      const caseKeys = Object.keys(caseData.structure);
      const commonKeys = targetKeys.filter(k => caseKeys.includes(k));
      
      const structuralSimilarity = commonKeys.length / Math.max(targetKeys.length, caseKeys.length);
      const valueSimilarity = commonKeys.filter(k => 
        targetStructure[k] === caseData.structure[k]
      ).length / Math.max(1, commonKeys.length);

      const similarity = (structuralSimilarity + valueSimilarity) / 2;

      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = { caseId, similarity, suggestedSolution: caseData.solution };
      }
    }

    return bestSimilarity > 0.3 ? bestMatch : null;
  }
}

export class ProceduralMemory {
  private procedures: Map<string, {
    id: string;
    steps: Array<{ action: string; parameters: Record<string, unknown> }>;
    successRate: number;
    executionCount: number;
  }> = new Map();

  store(id: string, steps: Array<{ action: string; parameters: Record<string, unknown> }>): void {
    this.procedures.set(id, { id, steps, successRate: 1.0, executionCount: 0 });
  }

  retrieve(id: string): Array<{ action: string; parameters: Record<string, unknown> }> | null {
    const proc = this.procedures.get(id);
    return proc?.steps ?? null;
  }

  recordOutcome(id: string, success: boolean): void {
    const proc = this.procedures.get(id);
    if (!proc) return;

    proc.executionCount++;
    // Exponential moving average
    proc.successRate = 0.9 * proc.successRate + 0.1 * (success ? 1 : 0);
  }

  getBestProcedure(keyword: string): string | null {
    let best: { id: string; score: number } | null = null;

    for (const [id, proc] of this.procedures) {
      if (!id.includes(keyword)) continue;
      const score = proc.successRate * Math.log(proc.executionCount + 1);
      if (!best || score > best.score) {
        best = { id, score };
      }
    }

    return best?.id ?? null;
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export const cognitiveAdvanced = {
  AssociativeMemory,
  ContextWeaver,
  InferenceEngine,
  PatternRecognizer,
  WorkingMemory,
  AttentionRouter,
  ConceptLattice,
  EpisodicBuffer,
  MetaCognition,
  GoalStack,
  BeliefRevision,
  AnalogicalReasoner,
  ProceduralMemory,
};
