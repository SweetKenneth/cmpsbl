/**
 * INTENT Ultimate — System 4: Intent Memory & Pattern Recognition
 * 
 * Remembers past intent resolutions, learns which resolver chains worked,
 * and builds predictive models. Hebbian learning on intent→outcome edges.
 * 
 * @module intent/ultimate/intentMemory
 */

// ── Types ────────────────────────────────────────────────────────

export interface IntentMemoryEntry {
  id: string;
  intentType: string;
  rawInput: string;
  resolverChain: string[];
  targetNodes: string[];
  success: boolean;
  durationMs: number;
  confidence: number;
  timestamp: string;
}

export interface IntentEdge {
  from: string; // intentType or input pattern
  to: string;   // resolver chain key
  weight: number; // Hebbian weight (0-1)
  successes: number;
  failures: number;
  avgDurationMs: number;
  lastUsed: string;
}

export interface IntentPrediction {
  intentType: string;
  predictedChain: string[];
  confidence: number;
  basedOnEdges: number;
  expectedDurationMs: number;
}

// ── State ────────────────────────────────────────────────────────

const memories: IntentMemoryEntry[] = [];
const edges: Map<string, IntentEdge> = new Map();
const MAX_MEMORIES = 1000;
const HEBBIAN_STRENGTHEN = 0.1;
const HEBBIAN_WEAKEN = 0.05;
const DECAY_RATE = 0.001;

// ── Hebbian Learning ─────────────────────────────────────────────

function edgeKey(from: string, to: string): string {
  return `${from}→${to}`;
}

function strengthenEdge(from: string, to: string, durationMs: number): void {
  const key = edgeKey(from, to);
  const existing = edges.get(key);
  if (existing) {
    existing.weight = Math.min(1, existing.weight + HEBBIAN_STRENGTHEN * (1 - existing.weight));
    existing.successes++;
    existing.avgDurationMs = existing.avgDurationMs * 0.8 + durationMs * 0.2;
    existing.lastUsed = new Date().toISOString();
  } else {
    edges.set(key, {
      from, to,
      weight: 0.5,
      successes: 1,
      failures: 0,
      avgDurationMs: durationMs,
      lastUsed: new Date().toISOString(),
    });
  }
}

function weakenEdge(from: string, to: string): void {
  const key = edgeKey(from, to);
  const existing = edges.get(key);
  if (existing) {
    existing.weight = Math.max(0.01, existing.weight - HEBBIAN_WEAKEN);
    existing.failures++;
    existing.lastUsed = new Date().toISOString();
  }
}

function applyDecay(): void {
  for (const edge of edges.values()) {
    const age = Date.now() - new Date(edge.lastUsed).getTime();
    const decayFactor = Math.exp(-DECAY_RATE * (age / 3_600_000)); // Decay per hour
    edge.weight *= decayFactor;
    if (edge.weight < 0.01 && edge.successes + edge.failures < 3) {
      edges.delete(edgeKey(edge.from, edge.to));
    }
  }
}

// ── Core API ────────────────────────────────────────────────────

/** Record an intent resolution outcome */
export function recordResolution(entry: Omit<IntentMemoryEntry, 'id' | 'timestamp'>): IntentMemoryEntry {
  const memory: IntentMemoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  memories.push(memory);
  if (memories.length > MAX_MEMORIES) memories.splice(0, memories.length - MAX_MEMORIES);

  // Hebbian learning
  const chainKey = entry.resolverChain.join('→');
  if (entry.success) {
    strengthenEdge(entry.intentType, chainKey, entry.durationMs);
  } else {
    weakenEdge(entry.intentType, chainKey);
  }

  return memory;
}

/** Predict best resolver chain for an intent type */
export function predictChain(intentType: string): IntentPrediction | null {
  applyDecay();

  // Find all edges from this intent type
  const candidates: IntentEdge[] = [];
  for (const edge of edges.values()) {
    if (edge.from === intentType) {
      candidates.push(edge);
    }
  }

  if (candidates.length === 0) return null;

  // Sort by weight (Hebbian strength)
  candidates.sort((a, b) => b.weight - a.weight);
  const best = candidates[0];

  return {
    intentType,
    predictedChain: best.to.split('→'),
    confidence: best.weight,
    basedOnEdges: candidates.length,
    expectedDurationMs: Math.round(best.avgDurationMs),
  };
}

/** Get memory entries for an intent type */
export function getMemories(intentType?: string): IntentMemoryEntry[] {
  if (!intentType) return [...memories];
  return memories.filter(m => m.intentType === intentType);
}

/** Get all edges (associative graph) */
export function getAssociativeGraph(): IntentEdge[] {
  return Array.from(edges.values())
    .sort((a, b) => b.weight - a.weight);
}

/** Get intent memory health */
export function getIntentMemoryHealth() {
  const totalMemories = memories.length;
  const successRate = totalMemories > 0
    ? Math.round((memories.filter(m => m.success).length / totalMemories) * 100)
    : 100;
  const strongEdges = Array.from(edges.values()).filter(e => e.weight > 0.7).length;

  return {
    totalMemories,
    totalEdges: edges.size,
    strongEdges,
    successRate,
    avgConfidence: totalMemories > 0
      ? Math.round((memories.reduce((s, m) => s + m.confidence, 0) / totalMemories) * 1000) / 1000
      : 0,
  };
}

/** Reset */
export function resetIntentMemory(): void {
  memories.length = 0;
  edges.clear();
}
