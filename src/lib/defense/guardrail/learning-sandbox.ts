/**
 * DEFENSE Guardrail — Immunity Learning Sandbox (Phase 5)
 * 
 * Isolated memory for proposed rule adjustments that must learn
 * in isolation before any promotion. Guarantees:
 *   - No write access to live defense config
 *   - Stale proposals auto-expire
 *   - Total proposals capped to prevent memory growth
 *   - All proposals auditable via read-only snapshots
 * 
 * The learning loop feeds INTO the sandbox. Only the shadow validator
 * (Phase 4) + promotion gate (Phase 1) can move approved proposals out.
 */

import { guardrailLog } from './logger';

// ── Configuration ──────────────────────────────────────────────

export interface SandboxConfig {
  /** Max proposals held in sandbox */
  maxEntries: number;
  /** Auto-expire entries older than this (ms) */
  ttlMs: number;
  /** Max learning iterations per entry before forced expiry */
  maxIterations: number;
  /** Cleanup interval (ms) */
  cleanupIntervalMs: number;
}

const DEFAULT_CONFIG: SandboxConfig = {
  maxEntries: 100,
  ttlMs: 60 * 60 * 1000,           // 1 hour
  maxIterations: 50,
  cleanupIntervalMs: 5 * 60 * 1000, // 5 minutes
};

let config: SandboxConfig = { ...DEFAULT_CONFIG };

// ── Types ──────────────────────────────────────────────────────

export interface SandboxEntry {
  id: string;
  proposalId: string;
  target: string;
  /** The learning hypothesis — what the system thinks should change */
  hypothesis: Record<string, unknown>;
  /** Accumulated evidence supporting or refuting the hypothesis */
  evidence: SandboxEvidence[];
  /** Number of learning iterations performed */
  iterations: number;
  /** Confidence score 0–1, updated by learning loop */
  confidence: number;
  /** Whether the entry has been promoted out of sandbox */
  promoted: boolean;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
}

export interface SandboxEvidence {
  timestamp: number;
  type: 'supporting' | 'contradicting' | 'neutral';
  weight: number;
  detail: string;
}

// ── Store (fully isolated — no references to live config) ──────

const sandbox = new Map<string, SandboxEntry>();
let lastCleanup = Date.now();

// ── Helpers ────────────────────────────────────────────────────

function generateSandboxId(): string {
  return `sbx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function runCleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < config.cleanupIntervalMs) return;
  lastCleanup = now;

  let expiredCount = 0;
  for (const [id, entry] of sandbox) {
    if (now > entry.expiresAt || entry.iterations >= config.maxIterations) {
      sandbox.delete(id);
      expiredCount++;
    }
  }

  if (expiredCount > 0) {
    guardrailLog('sandbox_cleanup', {
      reason: `Expired ${expiredCount} stale sandbox entries`,
      metadata: { remaining: sandbox.size, maxEntries: config.maxEntries },
    });
  }
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Submit a learning hypothesis to the sandbox.
 * Returns the sandbox entry ID. Does NOT touch live config.
 */
export function submitToSandbox(params: {
  proposalId: string;
  target: string;
  hypothesis: Record<string, unknown>;
  initialConfidence: number;
}): string | null {
  runCleanup();

  // Deduplicate — if same proposal already in sandbox, update it
  for (const [, entry] of sandbox) {
    if (entry.proposalId === params.proposalId && !entry.promoted) {
      entry.hypothesis = structuredClone(params.hypothesis);
      entry.confidence = Math.max(0, Math.min(1, params.initialConfidence));
      entry.updatedAt = Date.now();
      return entry.id;
    }
  }

  // Enforce capacity
  if (sandbox.size >= config.maxEntries) {
    // Evict lowest-confidence entry
    let lowestId: string | null = null;
    let lowestConf = Infinity;
    for (const [id, entry] of sandbox) {
      if (entry.confidence < lowestConf && !entry.promoted) {
        lowestConf = entry.confidence;
        lowestId = id;
      }
    }
    if (lowestId) {
      sandbox.delete(lowestId);
      guardrailLog('sandbox_evicted', {
        reason: `Evicted lowest-confidence entry to make room`,
        metadata: { evictedId: lowestId, confidence: lowestConf },
      });
    } else {
      return null; // all promoted, can't evict
    }
  }

  const now = Date.now();
  const id = generateSandboxId();
  const entry: SandboxEntry = {
    id,
    proposalId: params.proposalId,
    target: params.target,
    hypothesis: structuredClone(params.hypothesis),
    evidence: [],
    iterations: 0,
    confidence: Math.max(0, Math.min(1, params.initialConfidence)),
    promoted: false,
    createdAt: now,
    updatedAt: now,
    expiresAt: now + config.ttlMs,
  };

  sandbox.set(id, entry);

  guardrailLog('sandbox_entry_created', {
    proposal_id: params.proposalId,
    reason: `Learning hypothesis submitted for "${params.target}"`,
    metadata: { sandboxId: id, confidence: entry.confidence },
  });

  return id;
}

/**
 * Record evidence for a sandbox entry (learning iteration).
 * Cannot exceed maxIterations. Does NOT mutate live config.
 */
export function recordEvidence(
  sandboxId: string,
  evidence: Omit<SandboxEvidence, 'timestamp'>
): boolean {
  const entry = sandbox.get(sandboxId);
  if (!entry || entry.promoted) return false;

  // Check iteration cap
  if (entry.iterations >= config.maxIterations) {
    guardrailLog('sandbox_iteration_capped', {
      proposal_id: entry.proposalId,
      reason: `Max iterations (${config.maxIterations}) reached — entry frozen`,
      metadata: { sandboxId },
    });
    return false;
  }

  // Bound evidence array
  const MAX_EVIDENCE = 200;
  if (entry.evidence.length >= MAX_EVIDENCE) {
    entry.evidence.shift(); // drop oldest
  }

  entry.evidence.push({
    ...evidence,
    weight: Math.max(0, Math.min(1, evidence.weight)),
    detail: (evidence.detail || '').substring(0, 512),
    timestamp: Date.now(),
  });

  entry.iterations++;
  entry.updatedAt = Date.now();

  // Recalculate confidence from evidence
  const supporting = entry.evidence.filter(e => e.type === 'supporting');
  const contradicting = entry.evidence.filter(e => e.type === 'contradicting');
  const supWeight = supporting.reduce((s, e) => s + e.weight, 0);
  const conWeight = contradicting.reduce((s, e) => s + e.weight, 0);
  const totalWeight = supWeight + conWeight;

  if (totalWeight > 0) {
    entry.confidence = Math.max(0, Math.min(1, supWeight / totalWeight));
  }

  return true;
}

/**
 * Mark a sandbox entry as promoted (it passed shadow validation).
 * This does NOT apply any config — the caller is responsible for
 * using the approved proposal through the threshold clamping system.
 */
export function markPromoted(sandboxId: string): boolean {
  const entry = sandbox.get(sandboxId);
  if (!entry || entry.promoted) return false;

  entry.promoted = true;
  entry.updatedAt = Date.now();

  guardrailLog('sandbox_promoted', {
    proposal_id: entry.proposalId,
    reason: `Sandbox entry promoted after validation`,
    metadata: {
      sandboxId,
      confidence: entry.confidence,
      iterations: entry.iterations,
      evidenceCount: entry.evidence.length,
    },
  });

  return true;
}

/**
 * Read-only snapshot of a sandbox entry.
 */
export function getSandboxEntry(sandboxId: string): SandboxEntry | null {
  runCleanup();
  const entry = sandbox.get(sandboxId);
  return entry ? { ...entry, evidence: [...entry.evidence], hypothesis: structuredClone(entry.hypothesis) } : null;
}

/**
 * List all sandbox entries (read-only snapshots).
 */
export function listSandboxEntries(filter?: {
  promoted?: boolean;
  minConfidence?: number;
}): SandboxEntry[] {
  runCleanup();
  const results: SandboxEntry[] = [];
  for (const entry of sandbox.values()) {
    if (filter?.promoted !== undefined && entry.promoted !== filter.promoted) continue;
    if (filter?.minConfidence !== undefined && entry.confidence < filter.minConfidence) continue;
    results.push({ ...entry, evidence: [...entry.evidence], hypothesis: structuredClone(entry.hypothesis) });
  }
  return results.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get sandbox statistics.
 */
export function getSandboxStats() {
  runCleanup();
  const entries = [...sandbox.values()];
  return {
    total: entries.length,
    active: entries.filter(e => !e.promoted).length,
    promoted: entries.filter(e => e.promoted).length,
    avgConfidence: entries.length > 0
      ? Number((entries.reduce((s, e) => s + e.confidence, 0) / entries.length).toFixed(3))
      : 0,
    totalIterations: entries.reduce((s, e) => s + e.iterations, 0),
    maxCapacity: config.maxEntries,
    ttlMs: config.ttlMs,
  };
}

/**
 * Configure sandbox settings.
 */
export function configureSandbox(partial: Partial<SandboxConfig>): void {
  config = {
    ...config,
    maxEntries: Math.max(10, Math.min(500, partial.maxEntries ?? config.maxEntries)),
    ttlMs: Math.max(60_000, Math.min(24 * 60 * 60 * 1000, partial.ttlMs ?? config.ttlMs)),
    maxIterations: Math.max(5, Math.min(500, partial.maxIterations ?? config.maxIterations)),
    cleanupIntervalMs: Math.max(10_000, Math.min(30 * 60 * 1000, partial.cleanupIntervalMs ?? config.cleanupIntervalMs)),
  };
}

/**
 * Clear sandbox (testing only).
 */
export function clearSandbox(): void {
  sandbox.clear();
  config = { ...DEFAULT_CONFIG };
  lastCleanup = Date.now();
}
