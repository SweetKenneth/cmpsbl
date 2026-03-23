/**
 * REFLEX Ultimate — System 10: Edge Resilience Controller
 * 
 * Circuit breakers per edge node, graceful degradation modes (L0-L4),
 * dead letter queue for failed decisions, and recovery orchestration.
 * 
 * @module reflex/ultimate/edgeResilienceController
 */

// ── Types ────────────────────────────────────────────────────────

export type CircuitState = 'closed' | 'open' | 'half_open';
export type DegradationLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';

export interface NodeCircuitBreaker {
  nodeId: string;
  state: CircuitState;
  failureCount: number;
  successCount: number;
  failureThreshold: number;
  recoveryTimeoutMs: number;
  lastFailureAt: number | null;
  lastStateChangeAt: number;
  tripCount: number;           // How many times it's been tripped
}

export interface DeadLetterEntry {
  id: string;
  trigger: string;
  action: string;
  nodeId: string;
  error: string;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  lastRetryAt: number | null;
  status: 'pending' | 'retrying' | 'exhausted' | 'resolved';
}

export interface DegradationState {
  level: DegradationLevel;
  reason: string;
  activeSince: number;
  restrictions: string[];
}

// ── Constants ────────────────────────────────────────────────────

const DEFAULT_FAILURE_THRESHOLD = 5;
const DEFAULT_RECOVERY_TIMEOUT_MS = 15_000;
const MAX_DEAD_LETTERS = 500;

const DEGRADATION_RULES: Record<DegradationLevel, { maxNodes: number; maxRules: number; cachingRequired: boolean; description: string }> = {
  L0: { maxNodes: 200, maxRules: 500, cachingRequired: false, description: 'Full capacity — all systems operational' },
  L1: { maxNodes: 100, maxRules: 200, cachingRequired: false, description: 'Reduced capacity — non-critical rules disabled' },
  L2: { maxNodes: 50, maxRules: 100, cachingRequired: true, description: 'Cache-only for low-priority decisions' },
  L3: { maxNodes: 10, maxRules: 20, cachingRequired: true, description: 'Critical-only processing' },
  L4: { maxNodes: 1, maxRules: 5, cachingRequired: true, description: 'Emergency mode — minimal decisions only' },
};

// ── State ────────────────────────────────────────────────────────

const breakers: Map<string, NodeCircuitBreaker> = new Map();
const deadLetterQueue: DeadLetterEntry[] = [];
let currentDegradation: DegradationState = {
  level: 'L0',
  reason: 'Normal operation',
  activeSince: Date.now(),
  restrictions: [],
};

// ── Circuit Breaker API ──────────────────────────────────────────

/** Initialize a circuit breaker for a node */
export function initBreaker(nodeId: string, options?: { failureThreshold?: number; recoveryTimeoutMs?: number }): NodeCircuitBreaker {
  const breaker: NodeCircuitBreaker = {
    nodeId,
    state: 'closed',
    failureCount: 0,
    successCount: 0,
    failureThreshold: options?.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD,
    recoveryTimeoutMs: options?.recoveryTimeoutMs ?? DEFAULT_RECOVERY_TIMEOUT_MS,
    lastFailureAt: null,
    lastStateChangeAt: Date.now(),
    tripCount: 0,
  };

  breakers.set(nodeId, breaker);
  return breaker;
}

/** Record a failure on a node's circuit breaker */
export function recordFailure(nodeId: string): NodeCircuitBreaker | null {
  const breaker = breakers.get(nodeId);
  if (!breaker) return null;

  breaker.failureCount++;
  breaker.lastFailureAt = Date.now();

  if (breaker.failureCount >= breaker.failureThreshold && breaker.state === 'closed') {
    breaker.state = 'open';
    breaker.lastStateChangeAt = Date.now();
    breaker.tripCount++;
  }

  return breaker;
}

/** Record a success on a node's circuit breaker */
export function recordSuccess(nodeId: string): NodeCircuitBreaker | null {
  const breaker = breakers.get(nodeId);
  if (!breaker) return null;

  breaker.successCount++;

  if (breaker.state === 'half_open') {
    breaker.state = 'closed';
    breaker.failureCount = 0;
    breaker.lastStateChangeAt = Date.now();
  }

  return breaker;
}

/** Check if a node is available (circuit closed or half-open) */
export function isNodeAvailable(nodeId: string): boolean {
  const breaker = breakers.get(nodeId);
  if (!breaker) return true; // No breaker = available

  if (breaker.state === 'closed') return true;

  if (breaker.state === 'open') {
    // Check if recovery timeout has elapsed
    if (Date.now() - breaker.lastStateChangeAt >= breaker.recoveryTimeoutMs) {
      breaker.state = 'half_open';
      breaker.lastStateChangeAt = Date.now();
      return true; // Allow one probe
    }
    return false;
  }

  return true; // half_open
}

// ── Dead Letter Queue ────────────────────────────────────────────

/** Add a failed decision to the dead letter queue */
export function addDeadLetter(trigger: string, action: string, nodeId: string, error: string, maxRetries: number = 3): DeadLetterEntry {
  const entry: DeadLetterEntry = {
    id: `dl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    trigger, action, nodeId, error,
    retryCount: 0,
    maxRetries,
    createdAt: Date.now(),
    lastRetryAt: null,
    status: 'pending',
  };

  deadLetterQueue.push(entry);
  if (deadLetterQueue.length > MAX_DEAD_LETTERS) deadLetterQueue.splice(0, deadLetterQueue.length - MAX_DEAD_LETTERS);

  return entry;
}

/** Mark a dead letter as retrying */
export function retryDeadLetter(entryId: string): DeadLetterEntry | null {
  const entry = deadLetterQueue.find(e => e.id === entryId);
  if (!entry || entry.status === 'exhausted' || entry.status === 'resolved') return null;

  entry.retryCount++;
  entry.lastRetryAt = Date.now();

  if (entry.retryCount >= entry.maxRetries) {
    entry.status = 'exhausted';
  } else {
    entry.status = 'retrying';
  }

  return entry;
}

/** Resolve a dead letter */
export function resolveDeadLetter(entryId: string): boolean {
  const entry = deadLetterQueue.find(e => e.id === entryId);
  if (!entry) return false;
  entry.status = 'resolved';
  return true;
}

// ── Degradation ──────────────────────────────────────────────────

/** Set degradation level */
export function setDegradationLevel(level: DegradationLevel, reason: string): DegradationState {
  const rules = DEGRADATION_RULES[level];
  currentDegradation = {
    level,
    reason,
    activeSince: Date.now(),
    restrictions: [rules.description],
  };
  return currentDegradation;
}

/** Auto-assess degradation based on breaker state */
export function assessDegradation(): DegradationState {
  const allBreakers = Array.from(breakers.values());
  const openCount = allBreakers.filter(b => b.state === 'open').length;
  const total = allBreakers.length;

  if (total === 0) return currentDegradation;

  const openRatio = openCount / total;

  let newLevel: DegradationLevel;
  if (openRatio >= 0.8) newLevel = 'L4';
  else if (openRatio >= 0.6) newLevel = 'L3';
  else if (openRatio >= 0.4) newLevel = 'L2';
  else if (openRatio >= 0.2) newLevel = 'L1';
  else newLevel = 'L0';

  if (newLevel !== currentDegradation.level) {
    setDegradationLevel(newLevel, `${openCount}/${total} circuit breakers open (${Math.round(openRatio * 100)}%)`);
  }

  return currentDegradation;
}

export function getDegradationState(): DegradationState { return { ...currentDegradation }; }
export function getDegradationRules() { return { ...DEGRADATION_RULES }; }
export function getBreakers(): NodeCircuitBreaker[] { return Array.from(breakers.values()); }
export function getDeadLetterQueue(): DeadLetterEntry[] { return [...deadLetterQueue]; }

export function getResilienceControllerHealth() {
  const allBreakers = Array.from(breakers.values());
  const openBreakers = allBreakers.filter(b => b.state === 'open').length;
  const pendingDL = deadLetterQueue.filter(d => d.status === 'pending' || d.status === 'retrying').length;

  return {
    totalBreakers: allBreakers.length,
    openBreakers,
    closedBreakers: allBreakers.filter(b => b.state === 'closed').length,
    degradationLevel: currentDegradation.level,
    deadLettersPending: pendingDL,
    deadLettersExhausted: deadLetterQueue.filter(d => d.status === 'exhausted').length,
    healthScore: Math.max(0, 100 - openBreakers * 15 - pendingDL * 5),
  };
}

export function resetResilienceController(): void {
  breakers.clear();
  deadLetterQueue.length = 0;
  currentDegradation = { level: 'L0', reason: 'Reset', activeSince: Date.now(), restrictions: [] };
}
