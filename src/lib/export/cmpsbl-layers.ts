/**
 * CMPSBL® Layer Catalog
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Selectable capability layers that merge into Layer 2 during Ascension.
 * Each layer provides production-grade infrastructure that auto-wires
 * to the customer's exported functions — Layer 1 stays untouched.
 *
 * U.S. Patent App. No. 64/029,678 · No. 64/031,637
 * © CMPSBL® — All rights reserved.
 */

// ── Layer Definition ────────────────────────────────────────────────────────

export interface CmpsblLayerDefinition {
  /** Unique layer ID (e.g., 'circuit-breaker') */
  id: string;
  /** Display name */
  name: string;
  /** Crown Jewel rank */
  crownJewelRank: number;
  /** CJPI score */
  cjpi: number;
  /** Primitive module this layer belongs to */
  module: string;
  /** Short description */
  description: string;
  /** Price in cents (0 = free) */
  priceCents: number;
  /** TypeScript code to embed in Layer 2 */
  tsCode: string;
  /** Python code to embed in Layer 2 */
  pyCode: string;
  /** Auto-wire spec: how the layer wraps customer functions */
  autoWire: {
    /** The wrapper function name exposed in Layer 2 */
    wrapperName: string;
    /** Description of what auto-wiring does */
    behavior: string;
  };
}

// ── Circuit Breaker Layer ───────────────────────────────────────────────────

const CIRCUIT_BREAKER_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  CMPSBL® LAYER — Circuit Breaker (Crown Jewel #11)                           ║
// ║  Auto-wired cascade failure prevention for all capability executions.         ║
// ║  Three-state FSM: closed → open → half-open with exponential backoff.        ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

type CmpsblCircuitState = 'closed' | 'open' | 'half_open';

interface CmpsblCircuitConfig {
  failureThreshold?: number;
  successThreshold?: number;
  timeout?: number;
  maxTimeout?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
}

interface CmpsblCircuitStats {
  state: CmpsblCircuitState;
  failures: number;
  successes: number;
  totalCalls: number;
  lastFailureAt?: number;
  lastSuccessAt?: number;
  openedAt?: number;
  consecutiveSuccesses: number;
  currentTimeout: number;
}

function cmpsbl_create_circuit_breaker(name: string, config: CmpsblCircuitConfig = {}) {
  const {
    failureThreshold = 5,
    successThreshold = 2,
    timeout = 30_000,
    maxTimeout = 300_000,
    backoffMultiplier = 2,
    jitter = true,
  } = config;

  let state: CmpsblCircuitState = 'closed';
  let failures = 0;
  let successes = 0;
  let consecutiveSuccesses = 0;
  let totalCalls = 0;
  let lastFailureAt: number | undefined;
  let lastSuccessAt: number | undefined;
  let openedAt: number | undefined;
  let currentTimeout = timeout;

  function transition(to: CmpsblCircuitState) {
    if (state === to) return;
    state = to;
    if (to === 'open') { openedAt = Date.now(); consecutiveSuccesses = 0; }
    if (to === 'closed') { failures = 0; currentTimeout = timeout; }
  }

  function shouldAttempt(): boolean {
    if (state === 'closed') return true;
    if (state === 'open') {
      const elapsed = Date.now() - (openedAt ?? 0);
      const jitterMs = jitter ? Math.random() * currentTimeout * 0.1 : 0;
      if (elapsed >= currentTimeout + jitterMs) { transition('half_open'); return true; }
      return false;
    }
    return true;
  }

  function recordSuccess() {
    totalCalls++; successes++; consecutiveSuccesses++; lastSuccessAt = Date.now();
    if (state === 'half_open' && consecutiveSuccesses >= successThreshold) transition('closed');
  }

  function recordFailure() {
    totalCalls++; failures++; consecutiveSuccesses = 0; lastFailureAt = Date.now();
    if (state === 'half_open') {
      currentTimeout = Math.min(currentTimeout * backoffMultiplier, maxTimeout);
      transition('open');
    } else if (state === 'closed' && failures >= failureThreshold) {
      transition('open');
    }
  }

  async function call<T>(fn: () => Promise<T>): Promise<T> {
    if (!shouldAttempt()) throw new Error(\`[CMPSBL:CircuitBreaker:\${name}] Circuit is OPEN — call rejected\`);
    try { const result = await fn(); recordSuccess(); return result; }
    catch (err) { recordFailure(); throw err; }
  }

  function reset() {
    state = 'closed'; failures = 0; successes = 0; consecutiveSuccesses = 0;
    currentTimeout = timeout; openedAt = undefined;
  }

  function getStats(): CmpsblCircuitStats {
    return { state, failures, successes, totalCalls, lastFailureAt, lastSuccessAt, openedAt, consecutiveSuccesses, currentTimeout };
  }

  return { call, shouldAttempt, recordSuccess, recordFailure, reset, getStats, get state() { return state; }, get name() { return name; } };
}

// ── Auto-Wire: Breaker Panel ────────────────────────────────────────────────
// All cmpsbl_execute calls are automatically protected by circuit breakers.
// Each capability gets its own isolated breaker instance.

const _cmpsbl_breaker_panel = new Map<string, ReturnType<typeof cmpsbl_create_circuit_breaker>>();

function cmpsbl_get_breaker(name: string, config?: CmpsblCircuitConfig) {
  let b = _cmpsbl_breaker_panel.get(name);
  if (!b) { b = cmpsbl_create_circuit_breaker(name, config); _cmpsbl_breaker_panel.set(name, b); }
  return b;
}

/** Get circuit breaker stats for all capabilities */
export function cmpsbl_circuit_stats(): Record<string, CmpsblCircuitStats> {
  const out: Record<string, CmpsblCircuitStats> = {};
  for (const [k, v] of _cmpsbl_breaker_panel) out[k] = v.getStats();
  return out;
}

/** Get healthy (closed-circuit) capabilities */
export function cmpsbl_healthy_capabilities(): string[] {
  return [..._cmpsbl_breaker_panel.entries()].filter(([, b]) => b.state === 'closed').map(([k]) => k);
}

/** Get degraded (open/half-open) capabilities */
export function cmpsbl_degraded_capabilities(): string[] {
  return [..._cmpsbl_breaker_panel.entries()].filter(([, b]) => b.state !== 'closed').map(([k]) => k);
}

/** Reset all circuit breakers */
export function cmpsbl_reset_breakers(): void {
  for (const [, b] of _cmpsbl_breaker_panel) b.reset();
}
`;

const CIRCUIT_BREAKER_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  CMPSBL® LAYER — Circuit Breaker (Crown Jewel #11)                           ║
# ║  Auto-wired cascade failure prevention for all capability executions.         ║
# ║  Three-state FSM: closed → open → half-open with exponential backoff.        ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import random

class CmpsblCircuitBreaker:
    """Three-state circuit breaker with exponential backoff and jitter."""
    
    def __init__(self, name: str, failure_threshold: int = 5, success_threshold: int = 2,
                 timeout: float = 30.0, max_timeout: float = 300.0,
                 backoff_multiplier: float = 2.0, jitter: bool = True):
        self.name = name
        self.failure_threshold = failure_threshold
        self.success_threshold = success_threshold
        self.timeout = timeout
        self.max_timeout = max_timeout
        self.backoff_multiplier = backoff_multiplier
        self.jitter = jitter
        self.state = "closed"
        self.failures = 0
        self.successes = 0
        self.consecutive_successes = 0
        self.total_calls = 0
        self.last_failure_at = None
        self.last_success_at = None
        self.opened_at = None
        self.current_timeout = timeout

    def _transition(self, to: str):
        if self.state == to:
            return
        self.state = to
        if to == "open":
            self.opened_at = time.time()
            self.consecutive_successes = 0
        if to == "closed":
            self.failures = 0
            self.current_timeout = self.timeout

    def should_attempt(self) -> bool:
        if self.state == "closed":
            return True
        if self.state == "open":
            elapsed = time.time() - (self.opened_at or 0)
            jitter_s = random.random() * self.current_timeout * 0.1 if self.jitter else 0
            if elapsed >= self.current_timeout + jitter_s:
                self._transition("half_open")
                return True
            return False
        return True

    def record_success(self):
        self.total_calls += 1
        self.successes += 1
        self.consecutive_successes += 1
        self.last_success_at = time.time()
        if self.state == "half_open" and self.consecutive_successes >= self.success_threshold:
            self._transition("closed")

    def record_failure(self):
        self.total_calls += 1
        self.failures += 1
        self.consecutive_successes = 0
        self.last_failure_at = time.time()
        if self.state == "half_open":
            self.current_timeout = min(self.current_timeout * self.backoff_multiplier, self.max_timeout)
            self._transition("open")
        elif self.state == "closed" and self.failures >= self.failure_threshold:
            self._transition("open")

    def call(self, fn, *args, **kwargs):
        if not self.should_attempt():
            raise RuntimeError(f"[CMPSBL:CircuitBreaker:{self.name}] Circuit is OPEN — call rejected")
        try:
            result = fn(*args, **kwargs)
            self.record_success()
            return result
        except Exception as e:
            self.record_failure()
            raise

    def reset(self):
        self.state = "closed"
        self.failures = 0
        self.successes = 0
        self.consecutive_successes = 0
        self.current_timeout = self.timeout
        self.opened_at = None

    def get_stats(self) -> dict:
        return {
            "state": self.state, "failures": self.failures, "successes": self.successes,
            "total_calls": self.total_calls, "last_failure_at": self.last_failure_at,
            "last_success_at": self.last_success_at, "opened_at": self.opened_at,
            "consecutive_successes": self.consecutive_successes, "current_timeout": self.current_timeout,
        }


# ── Auto-Wire: Breaker Panel ────────────────────────────────────────────────
_cmpsbl_breaker_panel: Dict[str, CmpsblCircuitBreaker] = {}

def cmpsbl_get_breaker(name: str) -> CmpsblCircuitBreaker:
    if name not in _cmpsbl_breaker_panel:
        _cmpsbl_breaker_panel[name] = CmpsblCircuitBreaker(name)
    return _cmpsbl_breaker_panel[name]

def cmpsbl_circuit_stats() -> Dict[str, dict]:
    return {k: v.get_stats() for k, v in _cmpsbl_breaker_panel.items()}

def cmpsbl_healthy_capabilities() -> List[str]:
    return [k for k, v in _cmpsbl_breaker_panel.items() if v.state == "closed"]

def cmpsbl_degraded_capabilities() -> List[str]:
    return [k for k, v in _cmpsbl_breaker_panel.items() if v.state != "closed"]

def cmpsbl_reset_breakers():
    for b in _cmpsbl_breaker_panel.values():
        b.reset()
`;

const CIRCUIT_BREAKER_LAYER: CmpsblLayerDefinition = {
  id: 'circuit-breaker',
  name: 'Circuit Breaker',
  crownJewelRank: 11,
  cjpi: 94,
  module: 'IMMUNITY',
  description: 'Three-state circuit breaker (closed → open → half-open) with exponential backoff, jitter, and per-capability isolation. Prevents cascade failures.',
  priceCents: 0, // Free for first test
  tsCode: CIRCUIT_BREAKER_TS,
  pyCode: CIRCUIT_BREAKER_PY,
  autoWire: {
    wrapperName: 'cmpsbl_get_breaker',
    behavior: 'Each capability execution is automatically wrapped in its own circuit breaker. If a capability fails repeatedly, its circuit opens and rejects calls until recovery.',
  },
};

// ── Layer Registry ──────────────────────────────────────────────────────────

const LAYER_CATALOG: CmpsblLayerDefinition[] = [
  CIRCUIT_BREAKER_LAYER,
];

/** Get all available layers */
export function getAvailableLayers(): CmpsblLayerDefinition[] {
  return [...LAYER_CATALOG];
}

/** Get a layer by ID */
export function getLayerById(id: string): CmpsblLayerDefinition | null {
  return LAYER_CATALOG.find(l => l.id === id) ?? null;
}

/** Get layer code for a specific language */
export function getLayerCode(layerId: string, lang: string): string | null {
  const layer = getLayerById(layerId);
  if (!layer) return null;
  if (lang === 'typescript' || lang === 'javascript') return layer.tsCode;
  if (lang === 'python') return layer.pyCode;
  return null;
}

/** Get the auto-wire integration code that modifies cmpsbl_execute to use the layer */
export function getAutoWireTs(layers: CmpsblLayerDefinition[]): string {
  if (layers.length === 0) return '';
  
  // For circuit breaker, we override the execute function to wrap calls
  const hasCircuitBreaker = layers.some(l => l.id === 'circuit-breaker');
  if (!hasCircuitBreaker) return '';

  return `
// ── Layer Auto-Wire ─────────────────────────────────────────────────────────
// Selected layers are automatically applied to all capability executions.
// Your code (Layer 1) is never modified — layers operate in Layer 2 only.

const _cmpsbl_raw_execute = cmpsbl_execute;

/** 
 * Execute with circuit breaker protection (auto-wired).
 * If a capability fails ${5} times, its circuit opens and calls are rejected
 * until the timeout expires and recovery is attempted.
 */
cmpsbl_execute = function cmpsbl_execute_protected(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const breaker = cmpsbl_get_breaker(capabilityName);
  if (!breaker.shouldAttempt()) {
    throw new Error(\`[CMPSBL:CircuitBreaker:\${capabilityName}] Circuit is OPEN — capability degraded. Stats: \${JSON.stringify(breaker.getStats())}\`);
  }
  try {
    const result = _cmpsbl_raw_execute(capabilityName, input);
    breaker.recordSuccess();
    return result;
  } catch (err) {
    breaker.recordFailure();
    throw err;
  }
};
`;
}

/** Get the auto-wire integration code for Python */
export function getAutoWirePy(layers: CmpsblLayerDefinition[]): string {
  if (layers.length === 0) return '';
  
  const hasCircuitBreaker = layers.some(l => l.id === 'circuit-breaker');
  if (!hasCircuitBreaker) return '';

  return `
# ── Layer Auto-Wire ─────────────────────────────────────────────────────────
# Selected layers are automatically applied to all capability executions.
# Your code (Layer 1) is never modified — layers operate in Layer 2 only.

_cmpsbl_raw_execute = cmpsbl_execute

def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with circuit breaker protection (auto-wired)."""
    breaker = cmpsbl_get_breaker(capability_name)
    if not breaker.should_attempt():
        raise RuntimeError(f"[CMPSBL:CircuitBreaker:{capability_name}] Circuit is OPEN — capability degraded. Stats: {breaker.get_stats()}")
    try:
        result = _cmpsbl_raw_execute(capability_name, input_data)
        breaker.record_success()
        return result
    except Exception as e:
        breaker.record_failure()
        raise

# Re-alias for backwards compat
execute = cmpsbl_execute
`;
}

/** Get the layer summary block for the file header */
export function getLayerHeaderBlock(layers: CmpsblLayerDefinition[], commentChar: string = '//'): string {
  if (layers.length === 0) return '';
  const lines = [
    `${commentChar} ╔═══════════════════════════════════════════════════════════════════════════════╗`,
    `${commentChar} ║  CMPSBL® LAYERS (auto-wired)                                                 ║`,
    ...layers.map(l => 
      `${commentChar} ║  ◆ ${l.name.padEnd(20)} — CJ #${String(l.crownJewelRank).padStart(3)} | CJPI ${l.cjpi} | ${l.module.padEnd(10)} ║`
    ),
    `${commentChar} ║  Layers enhance Layer 2 without modifying Layer 1 (your code).               ║`,
    `${commentChar} ╚═══════════════════════════════════════════════════════════════════════════════╝`,
  ];
  return lines.join('\n');
}
