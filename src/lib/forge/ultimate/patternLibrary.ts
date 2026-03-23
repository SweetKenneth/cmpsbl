/**
 * FORGE Ultimate #4 — Pattern Library & Template Vault
 * Curated architectural patterns with auto-matching and CJPI scoring.
 * Tracks which patterns produce highest-scoring artifacts.
 */

// ── Types ──

export type ArchitecturalPattern = 'pipeline' | 'saga' | 'cqrs' | 'fan_out' | 'event_driven' | 'request_reply' | 'observer' | 'mediator' | 'circuit_breaker' | 'bulkhead';

export interface PatternTemplate {
  id: string;
  pattern: ArchitecturalPattern;
  name: string;
  description: string;
  moduleHints: string[];         // Modules that work well with this pattern
  resolverHints: string[];
  bestPractices: string[];
  avgCJPI: number;               // EMA-tracked average CJPI of artifacts using this pattern
  usageCount: number;
  successCount: number;
  createdAt: number;
}

export interface PatternMatch {
  patternId: string;
  confidence: number;
  reasoning: string;
}

// ── State ──

const templates = new Map<string, PatternTemplate>();
const EMA_ALPHA = 0.15;

// ── Built-in patterns ──

const BUILTIN_PATTERNS: Omit<PatternTemplate, 'id' | 'avgCJPI' | 'usageCount' | 'successCount' | 'createdAt'>[] = [
  {
    pattern: 'pipeline', name: 'Sequential Pipeline',
    description: 'Linear data transformation through ordered stages',
    moduleHints: ['DECODE', 'ENCODE', 'VISION', 'FORGE'],
    resolverHints: ['decode.classify', 'encode.patch', 'vision.scan'],
    bestPractices: ['Keep stages stateless', 'Allow stage skip on error', 'Track per-stage latency'],
  },
  {
    pattern: 'saga', name: 'Saga Orchestration',
    description: 'Multi-step transaction with compensating actions',
    moduleHints: ['CORTEX', 'NERVE', 'MEMORY', 'AUDIT'],
    resolverHints: ['cortex.orchestrate', 'nerve.signal', 'audit.log'],
    bestPractices: ['Define compensating action for each step', 'Use idempotency keys', 'Set timeout per step'],
  },
  {
    pattern: 'event_driven', name: 'Event-Driven Architecture',
    description: 'Asynchronous event emission and consumption',
    moduleHints: ['RIPPLE', 'NERVE', 'INTENT', 'RELAY'],
    resolverHints: ['ripple.publish', 'nerve.route', 'intent.broadcast'],
    bestPractices: ['Schema-validate all events', 'Use dead letter queues', 'Monitor event velocity'],
  },
  {
    pattern: 'circuit_breaker', name: 'Circuit Breaker',
    description: 'Fail-fast pattern with automatic recovery',
    moduleHints: ['DEFENSE', 'NERVE', 'MEDIC', 'ENGINEER'],
    resolverHints: ['defense.evaluate', 'medic.diagnose', 'nerve.breaker'],
    bestPractices: ['Set appropriate thresholds', 'Use half-open probe', 'Log state transitions'],
  },
  {
    pattern: 'cqrs', name: 'CQRS',
    description: 'Separate read and write models',
    moduleHints: ['MEMORY', 'BRAIN', 'DECODE', 'ENCODE'],
    resolverHints: ['memory.store', 'memory.retrieve', 'brain.reason'],
    bestPractices: ['Keep read models eventually consistent', 'Validate writes strictly', 'Track read/write ratio'],
  },
];

// ── Core ──

let idCounter = 0;

export function initPatternLibrary(): void {
  if (templates.size > 0) return;
  for (const bp of BUILTIN_PATTERNS) {
    const t: PatternTemplate = {
      ...bp, id: `pat-${++idCounter}`,
      avgCJPI: 70, usageCount: 0, successCount: 0, createdAt: Date.now(),
    };
    templates.set(t.id, t);
  }
}

export function addTemplate(pattern: ArchitecturalPattern, name: string, description: string, moduleHints: string[], bestPractices: string[]): PatternTemplate {
  const t: PatternTemplate = {
    id: `pat-${++idCounter}`, pattern, name, description,
    moduleHints, resolverHints: [], bestPractices,
    avgCJPI: 50, usageCount: 0, successCount: 0, createdAt: Date.now(),
  };
  templates.set(t.id, t);
  return t;
}

/** Auto-match: given a set of modules, suggest the best patterns. */
export function matchPatterns(modules: string[]): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const moduleSet = new Set(modules.map(m => m.toUpperCase()));

  for (const t of templates.values()) {
    const overlap = t.moduleHints.filter(h => moduleSet.has(h.toUpperCase())).length;
    if (overlap === 0) continue;
    const confidence = Math.min(1, overlap / Math.max(t.moduleHints.length, 1) * (t.avgCJPI / 100));
    matches.push({
      patternId: t.id,
      confidence: Math.round(confidence * 1000) / 1000,
      reasoning: `${overlap} module overlap with ${t.name} (avg CJPI: ${t.avgCJPI})`,
    });
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}

export function recordPatternUsage(patternId: string, cjpiScore: number): void {
  const t = templates.get(patternId);
  if (!t) return;
  t.usageCount++;
  if (cjpiScore >= 70) t.successCount++;
  t.avgCJPI = Math.round((EMA_ALPHA * cjpiScore + (1 - EMA_ALPHA) * t.avgCJPI) * 10) / 10;
}

export function getPatternLeaderboard(): PatternTemplate[] {
  return Array.from(templates.values()).sort((a, b) => b.avgCJPI - a.avgCJPI);
}

export function getPatternStats(): { total: number; avgCJPI: number; topPattern: string | null } {
  const all = Array.from(templates.values());
  const top = all.sort((a, b) => b.avgCJPI - a.avgCJPI)[0];
  return {
    total: all.length,
    avgCJPI: all.length > 0 ? Math.round(all.reduce((s, t) => s + t.avgCJPI, 0) / all.length) : 0,
    topPattern: top?.name ?? null,
  };
}

export function resetPatternState(): void { templates.clear(); idCounter = 0; }
