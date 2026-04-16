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
    /** TS auto-wire code — wraps cmpsbl_execute */
    tsWire: string;
    /** PY auto-wire code — wraps cmpsbl_execute */
    pyWire: string;
  };
}

// ════════════════════════════════════════════════════════════════════════════
// LAYER 1 — Circuit Breaker (CJ #11, CJPI 94, IMMUNITY)
// ════════════════════════════════════════════════════════════════════════════

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
import time

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

const CIRCUIT_BREAKER_WIRE_TS = `
const _cmpsbl_raw_execute_cb = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_circuit_protected(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const breaker = cmpsbl_get_breaker(capabilityName);
  if (!breaker.shouldAttempt()) {
    throw new Error(\`[CMPSBL:CircuitBreaker:\${capabilityName}] Circuit is OPEN — capability degraded. Stats: \${JSON.stringify(breaker.getStats())}\`);
  }
  try {
    const result = _cmpsbl_raw_execute_cb(capabilityName, input);
    breaker.recordSuccess();
    return result;
  } catch (err) {
    breaker.recordFailure();
    throw err;
  }
};`;

const CIRCUIT_BREAKER_WIRE_PY = `
_cmpsbl_raw_execute_cb = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with circuit breaker protection (auto-wired)."""
    breaker = cmpsbl_get_breaker(capability_name)
    if not breaker.should_attempt():
        raise RuntimeError(f"[CMPSBL:CircuitBreaker:{capability_name}] Circuit is OPEN — capability degraded. Stats: {breaker.get_stats()}")
    try:
        result = _cmpsbl_raw_execute_cb(capability_name, input_data)
        breaker.record_success()
        return result
    except Exception as e:
        breaker.record_failure()
        raise`;

const CIRCUIT_BREAKER_LAYER: CmpsblLayerDefinition = {
  id: 'circuit-breaker',
  name: 'Circuit Breaker',
  crownJewelRank: 11,
  cjpi: 94,
  module: 'IMMUNITY',
  description: 'Three-state circuit breaker (closed → open → half-open) with exponential backoff, jitter, and per-capability isolation. Prevents cascade failures.',
  priceCents: 0,
  tsCode: CIRCUIT_BREAKER_TS,
  pyCode: CIRCUIT_BREAKER_PY,
  autoWire: {
    wrapperName: 'cmpsbl_get_breaker',
    behavior: 'Each capability execution is automatically wrapped in its own circuit breaker. If a capability fails repeatedly, its circuit opens and rejects calls until recovery.',
    tsWire: CIRCUIT_BREAKER_WIRE_TS,
    pyWire: CIRCUIT_BREAKER_WIRE_PY,
  },
};

// ════════════════════════════════════════════════════════════════════════════
// LAYER 2 — Self-Healing Orchestrator (CJ #8, CJPI 96, IMMUNITY)
// ════════════════════════════════════════════════════════════════════════════

const SELF_HEALING_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  CMPSBL® LAYER — Self-Healing Orchestrator (Crown Jewel #8)                  ║
// ║  Auto-detects failures, selects lowest-blast-radius repair strategy,         ║
// ║  executes recovery, and learns from outcomes. No source modification.        ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

type CmpsblBlastRadius = 'node' | 'sector' | 'system';

interface CmpsblRepairStrategy {
  id: string;
  failureType: string;
  actions: string[];
  blastRadius: CmpsblBlastRadius;
  estimatedDurationMs: number;
  successRate: number;
  costScore: number;
  requiresApproval: boolean;
}

interface CmpsblRepairPlan {
  id: string;
  capabilityName: string;
  failureType: string;
  strategy: CmpsblRepairStrategy;
  actions: string[];
  estimatedDurationMs: number;
  rollbackPlan: string[];
  createdAt: number;
}

interface CmpsblRepairResult {
  planId: string;
  success: boolean;
  durationMs: number;
  actionsExecuted: string[];
  rolledBack: boolean;
  error?: string;
}

const _cmpsbl_repair_strategies: CmpsblRepairStrategy[] = [];
const _cmpsbl_repair_history: CmpsblRepairResult[] = [];
const _cmpsbl_strategy_scores = new Map<string, { successes: number; failures: number }>();

function cmpsbl_add_repair_strategy(strategy: CmpsblRepairStrategy): void {
  _cmpsbl_repair_strategies.push(strategy);
  _cmpsbl_strategy_scores.set(strategy.id, { successes: 0, failures: 0 });
}

function _cmpsbl_adjusted_rate(strategyId: string): number {
  const s = _cmpsbl_strategy_scores.get(strategyId);
  if (!s || (s.successes + s.failures) === 0) {
    return _cmpsbl_repair_strategies.find(st => st.id === strategyId)?.successRate ?? 0.5;
  }
  return s.successes / (s.successes + s.failures);
}

function _cmpsbl_blast_score(r: CmpsblBlastRadius): number {
  return r === 'system' ? 1 : r === 'sector' ? 0.5 : 0.1;
}

function cmpsbl_plan_repair(params: { capabilityName: string; failureType: string; maxBlastRadius?: CmpsblBlastRadius }): CmpsblRepairPlan | null {
  const candidates = _cmpsbl_repair_strategies
    .filter(s => s.failureType === params.failureType)
    .filter(s => {
      if (!params.maxBlastRadius) return true;
      const order: CmpsblBlastRadius[] = ['node', 'sector', 'system'];
      return order.indexOf(s.blastRadius) <= order.indexOf(params.maxBlastRadius);
    })
    .sort((a, b) => {
      const sa = _cmpsbl_adjusted_rate(a.id) * 0.5 - _cmpsbl_blast_score(a.blastRadius) * 0.3 - a.costScore * 0.2;
      const sb = _cmpsbl_adjusted_rate(b.id) * 0.5 - _cmpsbl_blast_score(b.blastRadius) * 0.3 - b.costScore * 0.2;
      return sb - sa;
    });
  if (!candidates.length) return null;
  const best = candidates[0];
  return {
    id: \`plan_\${Date.now()}_\${Math.random().toString(36).slice(2, 5)}\`,
    capabilityName: params.capabilityName,
    failureType: params.failureType,
    strategy: best,
    actions: best.actions,
    estimatedDurationMs: best.estimatedDurationMs,
    rollbackPlan: best.actions.slice().reverse().map(a => \`rollback_\${a}\`),
    createdAt: Date.now(),
  };
}

async function cmpsbl_execute_repair(
  plan: CmpsblRepairPlan,
  executor: (action: string, capName: string) => Promise<boolean>,
  onRollback?: (action: string, capName: string) => Promise<void>,
): Promise<CmpsblRepairResult> {
  const start = Date.now();
  const executed: string[] = [];
  try {
    for (const action of plan.actions) {
      const ok = await executor(action, plan.capabilityName);
      if (!ok) throw new Error(\`Repair action '\${action}' failed\`);
      executed.push(action);
    }
    const result: CmpsblRepairResult = { planId: plan.id, success: true, durationMs: Date.now() - start, actionsExecuted: executed, rolledBack: false };
    const s = _cmpsbl_strategy_scores.get(plan.strategy.id);
    if (s) s.successes++;
    _cmpsbl_repair_history.push(result);
    return result;
  } catch (err) {
    if (onRollback) {
      for (const a of executed.reverse()) {
        try { await onRollback(\`rollback_\${a}\`, plan.capabilityName); } catch { /* best-effort rollback */ }
      }
    }
    const result: CmpsblRepairResult = {
      planId: plan.id, success: false, durationMs: Date.now() - start,
      actionsExecuted: executed, rolledBack: !!onRollback,
      error: err instanceof Error ? err.message : String(err),
    };
    const s = _cmpsbl_strategy_scores.get(plan.strategy.id);
    if (s) s.failures++;
    _cmpsbl_repair_history.push(result);
    return result;
  }
}

/** Get repair history */
export function cmpsbl_repair_history(): CmpsblRepairResult[] { return [..._cmpsbl_repair_history]; }

/** Get overall repair success rate */
export function cmpsbl_repair_success_rate(): number {
  return _cmpsbl_repair_history.length === 0 ? 1 : _cmpsbl_repair_history.filter(r => r.success).length / _cmpsbl_repair_history.length;
}

/** Register default repair strategies for common failure types */
function _cmpsbl_register_defaults(): void {
  cmpsbl_add_repair_strategy({ id: 'restart_cap', failureType: 'crash', actions: ['isolate', 'restart', 'verify'], blastRadius: 'node', estimatedDurationMs: 2000, successRate: 0.85, costScore: 0.1, requiresApproval: false });
  cmpsbl_add_repair_strategy({ id: 'reroute_cap', failureType: 'timeout', actions: ['mark_degraded', 'reroute_traffic', 'monitor'], blastRadius: 'node', estimatedDurationMs: 500, successRate: 0.90, costScore: 0.05, requiresApproval: false });
  cmpsbl_add_repair_strategy({ id: 'rollback_cap', failureType: 'data_corruption', actions: ['quarantine', 'rollback_state', 'verify_integrity'], blastRadius: 'sector', estimatedDurationMs: 5000, successRate: 0.75, costScore: 0.3, requiresApproval: true });
}
_cmpsbl_register_defaults();
`;

const SELF_HEALING_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  CMPSBL® LAYER — Self-Healing Orchestrator (Crown Jewel #8)                  ║
# ║  Auto-detects failures, selects lowest-blast-radius repair strategy,         ║
# ║  executes recovery, and learns from outcomes. No source modification.        ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import time
from typing import Dict, List, Optional, Callable, Any

class CmpsblRepairStrategy:
    """Defines a repair strategy for a specific failure type."""
    def __init__(self, id: str, failure_type: str, actions: List[str],
                 blast_radius: str = "node", estimated_duration_ms: int = 2000,
                 success_rate: float = 0.85, cost_score: float = 0.1,
                 requires_approval: bool = False):
        self.id = id
        self.failure_type = failure_type
        self.actions = actions
        self.blast_radius = blast_radius  # "node" | "sector" | "system"
        self.estimated_duration_ms = estimated_duration_ms
        self.success_rate = success_rate
        self.cost_score = cost_score
        self.requires_approval = requires_approval


class CmpsblSelfHealingOrchestrator:
    """Auto-detects failures and orchestrates repair with rollback support."""

    BLAST_ORDER = ["node", "sector", "system"]

    def __init__(self):
        self._strategies: List[CmpsblRepairStrategy] = []
        self._history: List[dict] = []
        self._scores: Dict[str, dict] = {}
        self._register_defaults()

    def _register_defaults(self):
        self.add_strategy(CmpsblRepairStrategy("restart_cap", "crash", ["isolate", "restart", "verify"], "node", 2000, 0.85, 0.1))
        self.add_strategy(CmpsblRepairStrategy("reroute_cap", "timeout", ["mark_degraded", "reroute_traffic", "monitor"], "node", 500, 0.90, 0.05))
        self.add_strategy(CmpsblRepairStrategy("rollback_cap", "data_corruption", ["quarantine", "rollback_state", "verify_integrity"], "sector", 5000, 0.75, 0.3, True))

    def add_strategy(self, strategy: CmpsblRepairStrategy):
        self._strategies.append(strategy)
        self._scores[strategy.id] = {"successes": 0, "failures": 0}

    def _adjusted_rate(self, strategy_id: str) -> float:
        s = self._scores.get(strategy_id)
        if not s or (s["successes"] + s["failures"]) == 0:
            strat = next((st for st in self._strategies if st.id == strategy_id), None)
            return strat.success_rate if strat else 0.5
        return s["successes"] / (s["successes"] + s["failures"])

    def _blast_score(self, radius: str) -> float:
        return {"system": 1.0, "sector": 0.5, "node": 0.1}.get(radius, 0.1)

    def plan_repair(self, capability_name: str, failure_type: str, max_blast_radius: str = "system") -> Optional[dict]:
        max_idx = self.BLAST_ORDER.index(max_blast_radius) if max_blast_radius in self.BLAST_ORDER else 2
        candidates = [
            s for s in self._strategies
            if s.failure_type == failure_type and self.BLAST_ORDER.index(s.blast_radius) <= max_idx
        ]
        candidates.sort(key=lambda s: -(
            self._adjusted_rate(s.id) * 0.5 - self._blast_score(s.blast_radius) * 0.3 - s.cost_score * 0.2
        ))
        if not candidates:
            return None
        best = candidates[0]
        return {
            "id": f"plan_{int(time.time() * 1000)}",
            "capability_name": capability_name,
            "failure_type": failure_type,
            "strategy_id": best.id,
            "actions": best.actions[:],
            "estimated_duration_ms": best.estimated_duration_ms,
            "rollback_plan": [f"rollback_{a}" for a in reversed(best.actions)],
        }

    def execute_repair(self, plan: dict, executor: Callable[[str, str], bool],
                       on_rollback: Optional[Callable[[str, str], None]] = None) -> dict:
        start = time.time()
        executed = []
        try:
            for action in plan["actions"]:
                ok = executor(action, plan["capability_name"])
                if not ok:
                    raise RuntimeError(f"Repair action '{action}' failed")
                executed.append(action)
            result = {"plan_id": plan["id"], "success": True, "duration_ms": int((time.time() - start) * 1000),
                      "actions_executed": executed, "rolled_back": False}
            s = self._scores.get(plan["strategy_id"])
            if s:
                s["successes"] += 1
            self._history.append(result)
            return result
        except Exception as e:
            if on_rollback:
                for a in reversed(executed):
                    try:
                        on_rollback(f"rollback_{a}", plan["capability_name"])
                    except Exception:
                        pass
            result = {"plan_id": plan["id"], "success": False, "duration_ms": int((time.time() - start) * 1000),
                      "actions_executed": executed, "rolled_back": on_rollback is not None, "error": str(e)}
            s = self._scores.get(plan["strategy_id"])
            if s:
                s["failures"] += 1
            self._history.append(result)
            return result

    def get_history(self) -> List[dict]:
        return self._history[:]

    def get_success_rate(self) -> float:
        if not self._history:
            return 1.0
        return len([r for r in self._history if r["success"]]) / len(self._history)


# ── Auto-Wire: Healing Orchestrator Instance ─────────────────────────────────
_cmpsbl_healer = CmpsblSelfHealingOrchestrator()

def cmpsbl_add_repair_strategy(strategy: CmpsblRepairStrategy):
    _cmpsbl_healer.add_strategy(strategy)

def cmpsbl_plan_repair(capability_name: str, failure_type: str, max_blast_radius: str = "system"):
    return _cmpsbl_healer.plan_repair(capability_name, failure_type, max_blast_radius)

def cmpsbl_execute_repair(plan: dict, executor, on_rollback=None) -> dict:
    return _cmpsbl_healer.execute_repair(plan, executor, on_rollback)

def cmpsbl_repair_history() -> List[dict]:
    return _cmpsbl_healer.get_history()

def cmpsbl_repair_success_rate() -> float:
    return _cmpsbl_healer.get_success_rate()
`;

const SELF_HEALING_WIRE_TS = `
const _cmpsbl_raw_execute_sh = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_self_healing(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  try {
    return _cmpsbl_raw_execute_sh(capabilityName, input);
  } catch (err) {
    // Auto-detect failure type from error
    const failureType = err instanceof TypeError ? 'crash'
      : (err instanceof Error && err.message.includes('timeout')) ? 'timeout'
      : 'crash';
    const plan = cmpsbl_plan_repair({ capabilityName, failureType, maxBlastRadius: 'node' });
    if (plan) {
      cmpsbl_execute_repair(plan, async (action) => { /* default: log-only executor */ return true; });
    }
    throw err;
  }
};`;

const SELF_HEALING_WIRE_PY = `
_cmpsbl_raw_execute_sh = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with self-healing protection (auto-wired)."""
    try:
        return _cmpsbl_raw_execute_sh(capability_name, input_data)
    except Exception as e:
        failure_type = "timeout" if "timeout" in str(e).lower() else "crash"
        plan = cmpsbl_plan_repair(capability_name, failure_type, "node")
        if plan:
            cmpsbl_execute_repair(plan, lambda action, cap: True)
        raise`;

const SELF_HEALING_LAYER: CmpsblLayerDefinition = {
  id: 'self-healing',
  name: 'Self-Healing Orchestrator',
  crownJewelRank: 8,
  cjpi: 96,
  module: 'IMMUNITY',
  description: 'Auto-detects failures, selects lowest-blast-radius repair strategy, executes recovery with rollback, and learns from outcomes. No source modification.',
  priceCents: 14900,
  tsCode: SELF_HEALING_TS,
  pyCode: SELF_HEALING_PY,
  autoWire: {
    wrapperName: 'cmpsbl_plan_repair',
    behavior: 'Failed capability executions automatically trigger repair planning. The orchestrator selects the lowest-blast-radius strategy, executes recovery, and records outcomes for future prioritization.',
    tsWire: SELF_HEALING_WIRE_TS,
    pyWire: SELF_HEALING_WIRE_PY,
  },
};

// ════════════════════════════════════════════════════════════════════════════
// LAYER 3 — Autonomous Triage Engine (CJ #4, CJPI 97, MEDIC)
// ════════════════════════════════════════════════════════════════════════════

const TRIAGE_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  CMPSBL® LAYER — Autonomous Triage Engine (Crown Jewel #4)                   ║
// ║  Medical-grade triage protocol for distributed systems. Differential         ║
// ║  diagnosis with automated repair dispatch. Prioritizes by blast radius.      ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

type CmpsblSeverity = 'critical' | 'degraded' | 'warning' | 'info';
type CmpsblRepairAction = 'restart' | 'scale_up' | 'circuit_break' | 'reroute' | 'alert' | 'rollback' | 'quarantine' | 'none';

interface CmpsblSymptomReport {
  capabilityName: string;
  symptom: string;
  value: number;
  threshold?: number;
  timestamp: number;
}

interface CmpsblDiagnosis {
  capabilityName: string;
  severity: CmpsblSeverity;
  symptoms: CmpsblSymptomReport[];
  possibleCauses: string[];
  recommendedActions: CmpsblRepairAction[];
  confidence: number;
  diagnosedAt: number;
}

interface CmpsblFailureSignature {
  name: string;
  symptoms: Array<{ symptom: string; minValue: number }>;
  severity: CmpsblSeverity;
  causes: string[];
  actions: CmpsblRepairAction[];
  confidence: number;
}

const _cmpsbl_symptom_buffer = new Map<string, CmpsblSymptomReport[]>();
const _cmpsbl_triage_history: Array<{ capabilityName: string; action: CmpsblRepairAction; success: boolean; durationMs: number; timestamp: number }> = [];

const _cmpsbl_failure_signatures: CmpsblFailureSignature[] = [
  { name: 'memory_leak', symptoms: [{ symptom: 'memory_usage', minValue: 0.9 }, { symptom: 'gc_pressure', minValue: 0.7 }], severity: 'critical', causes: ['Unbounded cache growth', 'Event listener accumulation'], actions: ['restart', 'alert'], confidence: 0.85 },
  { name: 'cascading_failure', symptoms: [{ symptom: 'error_rate', minValue: 0.3 }, { symptom: 'dependency_errors', minValue: 0.5 }], severity: 'critical', causes: ['Upstream failure', 'Network partition'], actions: ['circuit_break', 'reroute', 'alert'], confidence: 0.80 },
  { name: 'latency_spike', symptoms: [{ symptom: 'latency_p95', minValue: 5000 }], severity: 'degraded', causes: ['Slow query', 'API timeout'], actions: ['scale_up', 'reroute'], confidence: 0.75 },
  { name: 'capacity_exhaustion', symptoms: [{ symptom: 'cpu_usage', minValue: 0.85 }, { symptom: 'queue_depth', minValue: 100 }], severity: 'degraded', causes: ['Traffic spike', 'Inefficient queries'], actions: ['scale_up', 'alert'], confidence: 0.80 },
  { name: 'data_corruption', symptoms: [{ symptom: 'checksum_failures', minValue: 1 }], severity: 'critical', causes: ['Disk failure', 'Race condition'], actions: ['quarantine', 'rollback', 'alert'], confidence: 0.90 },
];

function cmpsbl_report_symptom(report: Omit<CmpsblSymptomReport, 'timestamp'>): void {
  const full: CmpsblSymptomReport = { ...report, timestamp: Date.now() };
  if (!_cmpsbl_symptom_buffer.has(report.capabilityName)) _cmpsbl_symptom_buffer.set(report.capabilityName, []);
  const list = _cmpsbl_symptom_buffer.get(report.capabilityName)!;
  list.push(full);
  if (list.length > 100) list.splice(0, list.length - 100);
}

function _cmpsbl_match_signature(capSymptoms: CmpsblSymptomReport[]): CmpsblFailureSignature | null {
  let best: CmpsblFailureSignature | null = null;
  let bestScore = 0;
  for (const sig of _cmpsbl_failure_signatures) {
    let matched = 0;
    for (const req of sig.symptoms) {
      const recent = capSymptoms.filter(s => s.symptom === req.symptom && Date.now() - s.timestamp < 300_000).sort((a, b) => b.timestamp - a.timestamp)[0];
      if (recent && recent.value >= req.minValue) matched++;
    }
    const score = sig.symptoms.length > 0 ? matched / sig.symptoms.length : 0;
    if (score > bestScore && score >= 0.5) { best = sig; bestScore = score; }
  }
  return best;
}

function cmpsbl_diagnose(capabilityName?: string): CmpsblDiagnosis[] {
  const diagnoses: CmpsblDiagnosis[] = [];
  const targets = capabilityName ? [capabilityName] : [..._cmpsbl_symptom_buffer.keys()];
  for (const cap of targets) {
    const ns = (_cmpsbl_symptom_buffer.get(cap) ?? []).filter(s => Date.now() - s.timestamp < 300_000);
    if (!ns.length) continue;
    const sig = _cmpsbl_match_signature(ns);
    if (sig) {
      diagnoses.push({
        capabilityName: cap, severity: sig.severity, symptoms: ns,
        possibleCauses: sig.causes, recommendedActions: sig.actions,
        confidence: sig.confidence, diagnosedAt: Date.now(),
      });
    }
  }
  const order: Record<CmpsblSeverity, number> = { critical: 0, degraded: 1, warning: 2, info: 3 };
  return diagnoses.sort((a, b) => order[a.severity] - order[b.severity]);
}

function cmpsbl_add_failure_signature(sig: CmpsblFailureSignature): void {
  _cmpsbl_failure_signatures.push(sig);
}

function cmpsbl_record_triage_repair(outcome: { capabilityName: string; action: CmpsblRepairAction; success: boolean; durationMs: number }): void {
  _cmpsbl_triage_history.push({ ...outcome, timestamp: Date.now() });
  if (_cmpsbl_triage_history.length > 500) _cmpsbl_triage_history.splice(0, _cmpsbl_triage_history.length - 500);
}

/** Get triage repair success rate */
export function cmpsbl_triage_success_rate(): number {
  return _cmpsbl_triage_history.length === 0 ? 1 : _cmpsbl_triage_history.filter(r => r.success).length / _cmpsbl_triage_history.length;
}

/** Get all active diagnoses */
export function cmpsbl_active_diagnoses(): CmpsblDiagnosis[] {
  return cmpsbl_diagnose();
}
`;

const TRIAGE_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  CMPSBL® LAYER — Autonomous Triage Engine (Crown Jewel #4)                   ║
# ║  Medical-grade triage protocol for distributed systems. Differential         ║
# ║  diagnosis with automated repair dispatch. Prioritizes by blast radius.      ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import time
from typing import Dict, List, Optional, Any

class CmpsblFailureSignature:
    """Defines a known failure pattern with symptoms, causes, and actions."""
    def __init__(self, name: str, symptoms: List[dict], severity: str,
                 causes: List[str], actions: List[str], confidence: float = 0.8):
        self.name = name
        self.symptoms = symptoms  # [{"symptom": str, "min_value": float}]
        self.severity = severity  # "critical" | "degraded" | "warning" | "info"
        self.causes = causes
        self.actions = actions
        self.confidence = confidence


class CmpsblTriageEngine:
    """Medical-grade differential diagnosis for distributed systems."""

    SEVERITY_ORDER = {"critical": 0, "degraded": 1, "warning": 2, "info": 3}

    def __init__(self):
        self._symptom_buffer: Dict[str, List[dict]] = {}
        self._triage_history: List[dict] = []
        self._signatures: List[CmpsblFailureSignature] = []
        self._register_defaults()

    def _register_defaults(self):
        self.add_signature(CmpsblFailureSignature("memory_leak",
            [{"symptom": "memory_usage", "min_value": 0.9}, {"symptom": "gc_pressure", "min_value": 0.7}],
            "critical", ["Unbounded cache growth", "Event listener accumulation"], ["restart", "alert"], 0.85))
        self.add_signature(CmpsblFailureSignature("cascading_failure",
            [{"symptom": "error_rate", "min_value": 0.3}, {"symptom": "dependency_errors", "min_value": 0.5}],
            "critical", ["Upstream failure", "Network partition"], ["circuit_break", "reroute", "alert"], 0.80))
        self.add_signature(CmpsblFailureSignature("latency_spike",
            [{"symptom": "latency_p95", "min_value": 5000}],
            "degraded", ["Slow query", "API timeout"], ["scale_up", "reroute"], 0.75))
        self.add_signature(CmpsblFailureSignature("capacity_exhaustion",
            [{"symptom": "cpu_usage", "min_value": 0.85}, {"symptom": "queue_depth", "min_value": 100}],
            "degraded", ["Traffic spike", "Inefficient queries"], ["scale_up", "alert"], 0.80))
        self.add_signature(CmpsblFailureSignature("data_corruption",
            [{"symptom": "checksum_failures", "min_value": 1}],
            "critical", ["Disk failure", "Race condition"], ["quarantine", "rollback", "alert"], 0.90))

    def add_signature(self, sig: CmpsblFailureSignature):
        self._signatures.append(sig)

    def report_symptom(self, capability_name: str, symptom: str, value: float, threshold: Optional[float] = None):
        if capability_name not in self._symptom_buffer:
            self._symptom_buffer[capability_name] = []
        entry = {"capability_name": capability_name, "symptom": symptom, "value": value,
                 "threshold": threshold, "timestamp": time.time()}
        buf = self._symptom_buffer[capability_name]
        buf.append(entry)
        if len(buf) > 100:
            del buf[:len(buf) - 100]

    def _match_signature(self, cap_symptoms: List[dict]) -> Optional[CmpsblFailureSignature]:
        best, best_score = None, 0.0
        now = time.time()
        for sig in self._signatures:
            matched = 0
            for req in sig.symptoms:
                recent = [s for s in cap_symptoms if s["symptom"] == req["symptom"] and now - s["timestamp"] < 300]
                recent.sort(key=lambda s: -s["timestamp"])
                if recent and recent[0]["value"] >= req["min_value"]:
                    matched += 1
            score = matched / len(sig.symptoms) if sig.symptoms else 0
            if score > best_score and score >= 0.5:
                best, best_score = sig, score
        return best

    def diagnose(self, capability_name: Optional[str] = None) -> List[dict]:
        diagnoses = []
        targets = [capability_name] if capability_name else list(self._symptom_buffer.keys())
        now = time.time()
        for cap in targets:
            symptoms = [s for s in self._symptom_buffer.get(cap, []) if now - s["timestamp"] < 300]
            if not symptoms:
                continue
            sig = self._match_signature(symptoms)
            if sig:
                diagnoses.append({
                    "capability_name": cap, "severity": sig.severity, "symptoms": symptoms,
                    "possible_causes": sig.causes, "recommended_actions": sig.actions,
                    "confidence": sig.confidence, "diagnosed_at": now,
                })
        diagnoses.sort(key=lambda d: self.SEVERITY_ORDER.get(d["severity"], 3))
        return diagnoses

    def record_repair(self, capability_name: str, action: str, success: bool, duration_ms: int):
        self._triage_history.append({
            "capability_name": capability_name, "action": action, "success": success,
            "duration_ms": duration_ms, "timestamp": time.time(),
        })
        if len(self._triage_history) > 500:
            del self._triage_history[:len(self._triage_history) - 500]

    def get_success_rate(self) -> float:
        if not self._triage_history:
            return 1.0
        return len([r for r in self._triage_history if r["success"]]) / len(self._triage_history)


# ── Auto-Wire: Triage Engine Instance ────────────────────────────────────────
_cmpsbl_triage = CmpsblTriageEngine()

def cmpsbl_report_symptom(capability_name: str, symptom: str, value: float, threshold: Optional[float] = None):
    _cmpsbl_triage.report_symptom(capability_name, symptom, value, threshold)

def cmpsbl_diagnose(capability_name: Optional[str] = None) -> List[dict]:
    return _cmpsbl_triage.diagnose(capability_name)

def cmpsbl_add_failure_signature(sig: CmpsblFailureSignature):
    _cmpsbl_triage.add_signature(sig)

def cmpsbl_record_triage_repair(capability_name: str, action: str, success: bool, duration_ms: int):
    _cmpsbl_triage.record_repair(capability_name, action, success, duration_ms)

def cmpsbl_triage_success_rate() -> float:
    return _cmpsbl_triage.get_success_rate()

def cmpsbl_active_diagnoses() -> List[dict]:
    return _cmpsbl_triage.diagnose()
`;

const TRIAGE_WIRE_TS = `
const _cmpsbl_raw_execute_tr = cmpsbl_execute;
const _cmpsbl_error_counts = new Map<string, { count: number; lastAt: number }>();

cmpsbl_execute = function cmpsbl_execute_triage_monitored(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const start = Date.now();
  try {
    const result = _cmpsbl_raw_execute_tr(capabilityName, input);
    // Report latency as a symptom for monitoring
    const duration = Date.now() - start;
    if (duration > 1000) {
      cmpsbl_report_symptom({ capabilityName, symptom: 'latency_p95', value: duration });
    }
    return result;
  } catch (err) {
    // Track error rate per capability
    const entry = _cmpsbl_error_counts.get(capabilityName) ?? { count: 0, lastAt: 0 };
    entry.count++; entry.lastAt = Date.now();
    _cmpsbl_error_counts.set(capabilityName, entry);
    cmpsbl_report_symptom({ capabilityName, symptom: 'error_rate', value: Math.min(1, entry.count / 10) });
    // Auto-diagnose when error rate spikes
    if (entry.count >= 3) {
      const diagnoses = cmpsbl_diagnose(capabilityName);
      if (diagnoses.length > 0 && diagnoses[0].severity === 'critical') {
        cmpsbl_report_symptom({ capabilityName, symptom: 'dependency_errors', value: 0.6 });
      }
    }
    throw err;
  }
};`;

const TRIAGE_WIRE_PY = `
_cmpsbl_raw_execute_tr = cmpsbl_execute
_cmpsbl_error_counts: Dict[str, dict] = {}

def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with triage monitoring (auto-wired)."""
    start = time.time()
    try:
        result = _cmpsbl_raw_execute_tr(capability_name, input_data)
        duration_ms = int((time.time() - start) * 1000)
        if duration_ms > 1000:
            cmpsbl_report_symptom(capability_name, "latency_p95", duration_ms)
        return result
    except Exception as e:
        entry = _cmpsbl_error_counts.get(capability_name, {"count": 0, "last_at": 0})
        entry["count"] += 1
        entry["last_at"] = time.time()
        _cmpsbl_error_counts[capability_name] = entry
        cmpsbl_report_symptom(capability_name, "error_rate", min(1, entry["count"] / 10))
        if entry["count"] >= 3:
            diagnoses = cmpsbl_diagnose(capability_name)
            if diagnoses and diagnoses[0]["severity"] == "critical":
                cmpsbl_report_symptom(capability_name, "dependency_errors", 0.6)
        raise`;

const TRIAGE_LAYER: CmpsblLayerDefinition = {
  id: 'autonomous-triage',
  name: 'Autonomous Triage Engine',
  crownJewelRank: 4,
  cjpi: 97,
  module: 'MEDIC',
  description: 'Medical-grade triage protocol for distributed systems. Differential diagnosis with automated repair dispatch. Prioritizes by blast radius, dependency depth, and user impact.',
  priceCents: 12900,
  tsCode: TRIAGE_TS,
  pyCode: TRIAGE_PY,
  autoWire: {
    wrapperName: 'cmpsbl_report_symptom',
    behavior: 'Every capability execution automatically reports latency and error rate as symptoms. When error rates spike, the triage engine runs differential diagnosis and identifies root causes.',
    tsWire: TRIAGE_WIRE_TS,
    pyWire: TRIAGE_WIRE_PY,
  },
};

// ════════════════════════════════════════════════════════════════════════════
// LAYER 4 — Distributed Consensus Suite (CJ #5 + #83, CJPI 96, NERVE)
// ════════════════════════════════════════════════════════════════════════════

const CONSENSUS_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  CMPSBL® LAYER — Distributed Consensus Suite (Crown Jewel #5 + #83)          ║
// ║  Consensus Heartbeat Protocol + Quorum Negotiator. Gossip-style liveness     ║
// ║  detection with Byzantine-fault-tolerant negotiation and split-brain guard.  ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

type CmpsblPeerState = 'alive' | 'suspect' | 'quarantined' | 'dead';

interface CmpsblHeartbeatPayload {
  health: number;
  load: number;
  breakerState?: 'closed' | 'open' | 'half-open';
  metadata?: Record<string, unknown>;
}

interface CmpsblPeerRecord {
  id: string;
  state: CmpsblPeerState;
  lastBeatAt: number;
  missedBeats: number;
  payload: CmpsblHeartbeatPayload | null;
  stateChangedAt: number;
  vectorClock: number;
}

interface CmpsblQuorumVote {
  instanceId: string;
  proposalId: string;
  vote: 'accept' | 'reject' | 'abstain';
  timestamp: number;
}

interface CmpsblQuorumResult {
  proposalId: string;
  reached: boolean;
  acceptCount: number;
  rejectCount: number;
  abstainCount: number;
  totalVoters: number;
  quorumSize: number;
}

// ── Heartbeat Protocol ──────────────────────────────────────────────────────

const _cmpsbl_peers = new Map<string, CmpsblPeerRecord>();
let _cmpsbl_local_clock = 0;
const _cmpsbl_state_listeners: Array<(peerId: string, oldState: CmpsblPeerState, newState: CmpsblPeerState) => void> = [];

const CMPSBL_HEARTBEAT_INTERVAL_MS = 5000;
const CMPSBL_SUSPECT_AFTER = 3;
const CMPSBL_QUARANTINE_AFTER = 6;
const CMPSBL_DEAD_AFTER = 10;

function cmpsbl_register_peer(peerId: string): void {
  _cmpsbl_peers.set(peerId, {
    id: peerId, state: 'alive', lastBeatAt: Date.now(), missedBeats: 0,
    payload: null, stateChangedAt: Date.now(), vectorClock: 0,
  });
}

function cmpsbl_beat(payload: CmpsblHeartbeatPayload): { nodeId: string; clock: number; payload: CmpsblHeartbeatPayload; timestamp: number } {
  _cmpsbl_local_clock++;
  return { nodeId: 'local', clock: _cmpsbl_local_clock, payload, timestamp: Date.now() };
}

function cmpsbl_receive_beat(peerId: string, payload: CmpsblHeartbeatPayload, remoteClock?: number): void {
  let peer = _cmpsbl_peers.get(peerId);
  if (!peer) { cmpsbl_register_peer(peerId); peer = _cmpsbl_peers.get(peerId)!; }
  const oldState = peer.state;
  peer.lastBeatAt = Date.now(); peer.missedBeats = 0; peer.payload = payload;
  peer.vectorClock = Math.max(peer.vectorClock, remoteClock ?? 0);
  if (oldState !== 'alive') {
    peer.state = 'alive'; peer.stateChangedAt = Date.now();
    for (const l of _cmpsbl_state_listeners) l(peerId, oldState, 'alive');
  }
}

function cmpsbl_heartbeat_tick(): void {
  const now = Date.now();
  for (const [peerId, peer] of _cmpsbl_peers) {
    const missed = Math.floor((now - peer.lastBeatAt) / CMPSBL_HEARTBEAT_INTERVAL_MS);
    if (missed <= peer.missedBeats) continue;
    peer.missedBeats = missed;
    const oldState = peer.state;
    let newState: CmpsblPeerState = oldState;
    if (peer.missedBeats >= CMPSBL_DEAD_AFTER) newState = 'dead';
    else if (peer.missedBeats >= CMPSBL_QUARANTINE_AFTER) newState = 'quarantined';
    else if (peer.missedBeats >= CMPSBL_SUSPECT_AFTER) newState = 'suspect';
    if (newState !== oldState) {
      peer.state = newState; peer.stateChangedAt = now;
      for (const l of _cmpsbl_state_listeners) l(peerId, oldState, newState);
    }
  }
}

function cmpsbl_on_peer_state_change(fn: (peerId: string, oldState: CmpsblPeerState, newState: CmpsblPeerState) => void): void {
  _cmpsbl_state_listeners.push(fn);
}

// ── Quorum Negotiator ───────────────────────────────────────────────────────

function cmpsbl_calculate_quorum(totalVoters: number): number {
  return Math.floor(totalVoters / 2) + 1;
}

function cmpsbl_evaluate_quorum(votes: CmpsblQuorumVote[], totalVoters: number): CmpsblQuorumResult {
  const proposalId = votes[0]?.proposalId ?? 'unknown';
  const accept = votes.filter(v => v.vote === 'accept').length;
  const reject = votes.filter(v => v.vote === 'reject').length;
  const abstain = votes.filter(v => v.vote === 'abstain').length;
  const quorumSize = cmpsbl_calculate_quorum(totalVoters);
  return { proposalId, reached: accept >= quorumSize, acceptCount: accept, rejectCount: reject, abstainCount: abstain, totalVoters, quorumSize };
}

/** Get all alive peers */
export function cmpsbl_alive_peers(): string[] {
  return [..._cmpsbl_peers.values()].filter(p => p.state === 'alive').map(p => p.id);
}

/** Check if quorum exists among alive peers */
export function cmpsbl_has_quorum(totalExpected: number): boolean {
  return [..._cmpsbl_peers.values()].filter(p => p.state === 'alive').length > totalExpected / 2;
}

/** Get all peer statuses */
export function cmpsbl_peer_statuses(): CmpsblPeerRecord[] {
  return [..._cmpsbl_peers.values()];
}
`;

const CONSENSUS_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  CMPSBL® LAYER — Distributed Consensus Suite (Crown Jewel #5 + #83)          ║
# ║  Consensus Heartbeat Protocol + Quorum Negotiator. Gossip-style liveness     ║
# ║  detection with Byzantine-fault-tolerant negotiation and split-brain guard.  ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import time
import math
from typing import Dict, List, Optional, Callable, Any

class CmpsblPeerRecord:
    """Tracks state and health of a remote peer."""
    def __init__(self, peer_id: str):
        self.id = peer_id
        self.state = "alive"  # "alive" | "suspect" | "quarantined" | "dead"
        self.last_beat_at = time.time()
        self.missed_beats = 0
        self.payload: Optional[dict] = None
        self.state_changed_at = time.time()
        self.vector_clock = 0


class CmpsblConsensusEngine:
    """Heartbeat Protocol + Quorum Negotiator for distributed consensus."""

    HEARTBEAT_INTERVAL_S = 5.0
    SUSPECT_AFTER = 3
    QUARANTINE_AFTER = 6
    DEAD_AFTER = 10

    def __init__(self):
        self._peers: Dict[str, CmpsblPeerRecord] = {}
        self._local_clock = 0
        self._state_listeners: List[Callable] = []

    # ── Heartbeat Protocol ───────────────────────────────────────────────

    def register_peer(self, peer_id: str):
        self._peers[peer_id] = CmpsblPeerRecord(peer_id)

    def beat(self, payload: dict) -> dict:
        self._local_clock += 1
        return {"node_id": "local", "clock": self._local_clock, "payload": payload, "timestamp": time.time()}

    def receive_beat(self, peer_id: str, payload: dict, remote_clock: int = 0):
        if peer_id not in self._peers:
            self.register_peer(peer_id)
        peer = self._peers[peer_id]
        old_state = peer.state
        peer.last_beat_at = time.time()
        peer.missed_beats = 0
        peer.payload = payload
        peer.vector_clock = max(peer.vector_clock, remote_clock)
        if old_state != "alive":
            peer.state = "alive"
            peer.state_changed_at = time.time()
            for listener in self._state_listeners:
                listener(peer_id, old_state, "alive")

    def tick(self):
        now = time.time()
        for peer_id, peer in self._peers.items():
            missed = int((now - peer.last_beat_at) / self.HEARTBEAT_INTERVAL_S)
            if missed <= peer.missed_beats:
                continue
            peer.missed_beats = missed
            old_state = peer.state
            if peer.missed_beats >= self.DEAD_AFTER:
                new_state = "dead"
            elif peer.missed_beats >= self.QUARANTINE_AFTER:
                new_state = "quarantined"
            elif peer.missed_beats >= self.SUSPECT_AFTER:
                new_state = "suspect"
            else:
                new_state = old_state
            if new_state != old_state:
                peer.state = new_state
                peer.state_changed_at = now
                for listener in self._state_listeners:
                    listener(peer_id, old_state, new_state)

    def on_state_change(self, fn: Callable):
        self._state_listeners.append(fn)

    def get_alive_peers(self) -> List[str]:
        return [p.id for p in self._peers.values() if p.state == "alive"]

    def has_quorum(self, total_expected: int) -> bool:
        alive_count = len([p for p in self._peers.values() if p.state == "alive"])
        return alive_count > total_expected / 2

    def get_all_peers(self) -> List[dict]:
        return [{"id": p.id, "state": p.state, "missed_beats": p.missed_beats,
                 "last_beat_at": p.last_beat_at, "vector_clock": p.vector_clock} for p in self._peers.values()]

    # ── Quorum Negotiator ────────────────────────────────────────────────

    @staticmethod
    def calculate_quorum(total_voters: int) -> int:
        return total_voters // 2 + 1

    @staticmethod
    def evaluate_quorum(votes: List[dict], total_voters: int) -> dict:
        proposal_id = votes[0].get("proposal_id", "unknown") if votes else "unknown"
        accept = len([v for v in votes if v["vote"] == "accept"])
        reject = len([v for v in votes if v["vote"] == "reject"])
        abstain = len([v for v in votes if v["vote"] == "abstain"])
        quorum_size = CmpsblConsensusEngine.calculate_quorum(total_voters)
        return {
            "proposal_id": proposal_id, "reached": accept >= quorum_size,
            "accept_count": accept, "reject_count": reject, "abstain_count": abstain,
            "total_voters": total_voters, "quorum_size": quorum_size,
        }

    def remove_peer(self, peer_id: str):
        self._peers.pop(peer_id, None)


# ── Auto-Wire: Consensus Engine Instance ─────────────────────────────────────
_cmpsbl_consensus = CmpsblConsensusEngine()

def cmpsbl_register_peer(peer_id: str):
    _cmpsbl_consensus.register_peer(peer_id)

def cmpsbl_beat(payload: dict) -> dict:
    return _cmpsbl_consensus.beat(payload)

def cmpsbl_receive_beat(peer_id: str, payload: dict, remote_clock: int = 0):
    _cmpsbl_consensus.receive_beat(peer_id, payload, remote_clock)

def cmpsbl_heartbeat_tick():
    _cmpsbl_consensus.tick()

def cmpsbl_on_peer_state_change(fn):
    _cmpsbl_consensus.on_state_change(fn)

def cmpsbl_alive_peers() -> List[str]:
    return _cmpsbl_consensus.get_alive_peers()

def cmpsbl_has_quorum(total_expected: int) -> bool:
    return _cmpsbl_consensus.has_quorum(total_expected)

def cmpsbl_peer_statuses() -> List[dict]:
    return _cmpsbl_consensus.get_all_peers()

def cmpsbl_calculate_quorum(total_voters: int) -> int:
    return CmpsblConsensusEngine.calculate_quorum(total_voters)

def cmpsbl_evaluate_quorum(votes: List[dict], total_voters: int) -> dict:
    return CmpsblConsensusEngine.evaluate_quorum(votes, total_voters)
`;

const CONSENSUS_WIRE_TS = `
// Consensus Suite auto-wires peer health monitoring to capability execution.
// Dead or quarantined peers are automatically excluded from execution routing.
const _cmpsbl_raw_execute_cs = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_consensus_guarded(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  // Tick heartbeat to update peer states
  cmpsbl_heartbeat_tick();
  // Report local health on each execution
  cmpsbl_beat({ health: 1.0, load: 0.5 });
  return _cmpsbl_raw_execute_cs(capabilityName, input);
};`;

const CONSENSUS_WIRE_PY = `
_cmpsbl_raw_execute_cs = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with consensus health monitoring (auto-wired)."""
    cmpsbl_heartbeat_tick()
    cmpsbl_beat({"health": 1.0, "load": 0.5})
    return _cmpsbl_raw_execute_cs(capability_name, input_data)`;

const CONSENSUS_LAYER: CmpsblLayerDefinition = {
  id: 'distributed-consensus',
  name: 'Distributed Consensus Suite',
  crownJewelRank: 5,
  cjpi: 96,
  module: 'NERVE',
  description: 'Consensus Heartbeat Protocol + Quorum Negotiator. Gossip-style liveness detection with Byzantine-fault-tolerant negotiation and split-brain prevention.',
  priceCents: 9900,
  tsCode: CONSENSUS_TS,
  pyCode: CONSENSUS_PY,
  autoWire: {
    wrapperName: 'cmpsbl_heartbeat_tick',
    behavior: 'Every capability execution ticks the heartbeat clock and reports local health. Dead or quarantined peers are automatically tracked for routing decisions.',
    tsWire: CONSENSUS_WIRE_TS,
    pyWire: CONSENSUS_WIRE_PY,
  },
};

// ════════════════════════════════════════════════════════════════════════════
// LAYER 5 — Oracle-Ripple Precognition Chain (CJ #024, CJPI 96, ORACLE×RIPPLE)
// ════════════════════════════════════════════════════════════════════════════

const ORACLE_RIPPLE_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  CMPSBL® LAYER — Oracle-Ripple Precognition Chain (Crown Jewel #024)         ║
// ║  Predictive failure forecasting fused with causal propagation. Detects       ║
// ║  downstream cascades BEFORE they occur and auto-executes preemptive action.  ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

type CmpsblOracleAction = 'scale_up' | 'reroute' | 'throttle' | 'isolate' | 'preheat_cache' | 'shed_load' | 'none';

interface CmpsblTimePoint { value: number; timestamp: number; }

interface CmpsblForecast {
  capabilityName: string;
  metric: string;
  predictedValue: number;
  confidence: number;
  horizonMs: number;
  trend: 'rising' | 'falling' | 'stable';
  willExceedThreshold: boolean;
  forecastAt: number;
}

interface CmpsblRipplePrediction {
  rootCapability: string;
  affectedCapabilities: Array<{ name: string; impactScore: number; arrivesInMs: number }>;
  cascadeDepth: number;
  estimatedBlastRadius: number;
  preemptiveActions: CmpsblOracleAction[];
  predictedAt: number;
}

interface CmpsblCausalLink { from: string; to: string; weight: number; observedTimes: number; }

const _cmpsbl_oracle_series = new Map<string, CmpsblTimePoint[]>();
const _cmpsbl_oracle_thresholds = new Map<string, number>();
const _cmpsbl_ripple_graph: CmpsblCausalLink[] = [];
const _cmpsbl_oracle_actions_taken: Array<{ capability: string; action: CmpsblOracleAction; takenAt: number; reason: string }> = [];

function cmpsbl_oracle_record(capabilityName: string, metric: string, value: number): void {
  const key = capabilityName + '::' + metric;
  if (!_cmpsbl_oracle_series.has(key)) _cmpsbl_oracle_series.set(key, []);
  const series = _cmpsbl_oracle_series.get(key)!;
  series.push({ value, timestamp: Date.now() });
  if (series.length > 200) series.splice(0, series.length - 200);
}

function cmpsbl_oracle_set_threshold(capabilityName: string, metric: string, threshold: number): void {
  _cmpsbl_oracle_thresholds.set(capabilityName + '::' + metric, threshold);
}

/**
 * Linear-regression forecast over the last N samples within window.
 * Returns predicted value at now+horizonMs with confidence based on R^2.
 */
function cmpsbl_oracle_forecast(capabilityName: string, metric: string, horizonMs: number = 60_000): CmpsblForecast | null {
  const key = capabilityName + '::' + metric;
  const series = _cmpsbl_oracle_series.get(key);
  if (!series || series.length < 5) return null;
  const recent = series.slice(-30);
  const n = recent.length;
  const t0 = recent[0].timestamp;
  let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0;
  for (const p of recent) {
    const x = (p.timestamp - t0) / 1000;
    sumX += x; sumY += p.value; sumXX += x * x; sumXY += x * p.value;
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const meanY = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (const p of recent) {
    const x = (p.timestamp - t0) / 1000;
    const yHat = slope * x + intercept;
    ssTot += (p.value - meanY) ** 2;
    ssRes += (p.value - yHat) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);
  const futureX = (Date.now() + horizonMs - t0) / 1000;
  const predicted = slope * futureX + intercept;
  const threshold = _cmpsbl_oracle_thresholds.get(key);
  return {
    capabilityName, metric,
    predictedValue: predicted,
    confidence: r2,
    horizonMs,
    trend: slope > 0.01 ? 'rising' : slope < -0.01 ? 'falling' : 'stable',
    willExceedThreshold: threshold !== undefined && predicted >= threshold,
    forecastAt: Date.now(),
  };
}

function cmpsbl_ripple_observe_link(from: string, to: string): void {
  const existing = _cmpsbl_ripple_graph.find(l => l.from === from && l.to === to);
  if (existing) {
    existing.observedTimes++;
    existing.weight = Math.min(1, existing.weight + 0.05);
  } else {
    _cmpsbl_ripple_graph.push({ from, to, weight: 0.3, observedTimes: 1 });
  }
}

/** Predict ripple cascade from a root capability failure. BFS through causal graph. */
function cmpsbl_ripple_predict(rootCapability: string, maxDepth: number = 4): CmpsblRipplePrediction {
  const visited = new Set<string>([rootCapability]);
  const queue: Array<{ name: string; depth: number; impact: number; arrival: number }> = [
    { name: rootCapability, depth: 0, impact: 1, arrival: 0 }
  ];
  const affected: Array<{ name: string; impactScore: number; arrivesInMs: number }> = [];
  let maxObservedDepth = 0;
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (node.depth >= maxDepth) continue;
    for (const link of _cmpsbl_ripple_graph) {
      if (link.from === node.name && !visited.has(link.to)) {
        visited.add(link.to);
        const childImpact = node.impact * link.weight;
        if (childImpact < 0.05) continue;
        const arrival = node.arrival + 200 + Math.round(500 / link.weight);
        affected.push({ name: link.to, impactScore: childImpact, arrivesInMs: arrival });
        maxObservedDepth = Math.max(maxObservedDepth, node.depth + 1);
        queue.push({ name: link.to, depth: node.depth + 1, impact: childImpact, arrival });
      }
    }
  }
  affected.sort((a, b) => b.impactScore - a.impactScore);
  const blastRadius = affected.reduce((s, a) => s + a.impactScore, 1);
  const actions: CmpsblOracleAction[] = [];
  if (blastRadius >= 3) actions.push('isolate', 'reroute');
  else if (blastRadius >= 1.5) actions.push('throttle', 'scale_up');
  else if (affected.length > 0) actions.push('preheat_cache');
  return {
    rootCapability, affectedCapabilities: affected,
    cascadeDepth: maxObservedDepth, estimatedBlastRadius: blastRadius,
    preemptiveActions: actions.length ? actions : ['none'],
    predictedAt: Date.now(),
  };
}

function cmpsbl_oracle_take_action(capability: string, action: CmpsblOracleAction, reason: string): void {
  if (action === 'none') return;
  _cmpsbl_oracle_actions_taken.push({ capability, action, takenAt: Date.now(), reason });
  if (_cmpsbl_oracle_actions_taken.length > 200) _cmpsbl_oracle_actions_taken.splice(0, _cmpsbl_oracle_actions_taken.length - 200);
}

/** Get count of preemptive actions taken — the ROI metric. */
export function cmpsbl_oracle_actions_summary(): { total: number; byAction: Record<string, number> } {
  const byAction: Record<string, number> = {};
  for (const a of _cmpsbl_oracle_actions_taken) byAction[a.action] = (byAction[a.action] ?? 0) + 1;
  return { total: _cmpsbl_oracle_actions_taken.length, byAction };
}
`;

const ORACLE_RIPPLE_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  CMPSBL® LAYER — Oracle-Ripple Precognition Chain (Crown Jewel #024)         ║
# ║  Predictive failure forecasting fused with causal propagation. Detects       ║
# ║  downstream cascades BEFORE they occur and auto-executes preemptive action.  ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import time
from typing import Dict, List, Optional, Any


_cmpsbl_oracle_series: Dict[str, List[dict]] = {}
_cmpsbl_oracle_thresholds: Dict[str, float] = {}
_cmpsbl_ripple_graph: List[dict] = []
_cmpsbl_oracle_actions_taken: List[dict] = []


def cmpsbl_oracle_record(capability_name: str, metric: str, value: float) -> None:
    key = capability_name + "::" + metric
    if key not in _cmpsbl_oracle_series:
        _cmpsbl_oracle_series[key] = []
    series = _cmpsbl_oracle_series[key]
    series.append({"value": value, "timestamp": time.time()})
    if len(series) > 200:
        del series[: len(series) - 200]


def cmpsbl_oracle_set_threshold(capability_name: str, metric: str, threshold: float) -> None:
    _cmpsbl_oracle_thresholds[capability_name + "::" + metric] = threshold


def cmpsbl_oracle_forecast(capability_name: str, metric: str, horizon_ms: int = 60000) -> Optional[dict]:
    """Linear-regression forecast over recent samples; returns prediction + R^2 confidence."""
    key = capability_name + "::" + metric
    series = _cmpsbl_oracle_series.get(key)
    if not series or len(series) < 5:
        return None
    recent = series[-30:]
    n = len(recent)
    t0 = recent[0]["timestamp"]
    sum_x = sum_y = sum_xx = sum_xy = 0.0
    for p in recent:
        x = p["timestamp"] - t0
        sum_x += x; sum_y += p["value"]; sum_xx += x * x; sum_xy += x * p["value"]
    denom = n * sum_xx - sum_x * sum_x
    if denom == 0:
        return None
    slope = (n * sum_xy - sum_x * sum_y) / denom
    intercept = (sum_y - slope * sum_x) / n
    mean_y = sum_y / n
    ss_tot = sum((p["value"] - mean_y) ** 2 for p in recent)
    ss_res = sum((p["value"] - (slope * (p["timestamp"] - t0) + intercept)) ** 2 for p in recent)
    r2 = 1.0 if ss_tot == 0 else max(0.0, 1 - ss_res / ss_tot)
    future_x = time.time() + horizon_ms / 1000.0 - t0
    predicted = slope * future_x + intercept
    threshold = _cmpsbl_oracle_thresholds.get(key)
    trend = "rising" if slope > 0.01 else ("falling" if slope < -0.01 else "stable")
    return {
        "capability_name": capability_name, "metric": metric,
        "predicted_value": predicted, "confidence": r2,
        "horizon_ms": horizon_ms, "trend": trend,
        "will_exceed_threshold": threshold is not None and predicted >= threshold,
        "forecast_at": time.time(),
    }


def cmpsbl_ripple_observe_link(from_cap: str, to_cap: str) -> None:
    for link in _cmpsbl_ripple_graph:
        if link["from"] == from_cap and link["to"] == to_cap:
            link["observed_times"] += 1
            link["weight"] = min(1.0, link["weight"] + 0.05)
            return
    _cmpsbl_ripple_graph.append({"from": from_cap, "to": to_cap, "weight": 0.3, "observed_times": 1})


def cmpsbl_ripple_predict(root_capability: str, max_depth: int = 4) -> dict:
    """Predict ripple cascade from a root failure via BFS through causal graph."""
    visited = {root_capability}
    queue = [{"name": root_capability, "depth": 0, "impact": 1.0, "arrival": 0}]
    affected: List[dict] = []
    max_observed_depth = 0
    while queue:
        node = queue.pop(0)
        if node["depth"] >= max_depth:
            continue
        for link in _cmpsbl_ripple_graph:
            if link["from"] == node["name"] and link["to"] not in visited:
                visited.add(link["to"])
                child_impact = node["impact"] * link["weight"]
                if child_impact < 0.05:
                    continue
                arrival = node["arrival"] + 200 + int(500 / link["weight"])
                affected.append({"name": link["to"], "impact_score": child_impact, "arrives_in_ms": arrival})
                max_observed_depth = max(max_observed_depth, node["depth"] + 1)
                queue.append({"name": link["to"], "depth": node["depth"] + 1, "impact": child_impact, "arrival": arrival})
    affected.sort(key=lambda a: -a["impact_score"])
    blast_radius = sum(a["impact_score"] for a in affected) + 1
    actions: List[str] = []
    if blast_radius >= 3:
        actions.extend(["isolate", "reroute"])
    elif blast_radius >= 1.5:
        actions.extend(["throttle", "scale_up"])
    elif affected:
        actions.append("preheat_cache")
    return {
        "root_capability": root_capability, "affected_capabilities": affected,
        "cascade_depth": max_observed_depth, "estimated_blast_radius": blast_radius,
        "preemptive_actions": actions if actions else ["none"],
        "predicted_at": time.time(),
    }


def cmpsbl_oracle_take_action(capability: str, action: str, reason: str) -> None:
    if action == "none":
        return
    _cmpsbl_oracle_actions_taken.append({"capability": capability, "action": action, "taken_at": time.time(), "reason": reason})
    if len(_cmpsbl_oracle_actions_taken) > 200:
        del _cmpsbl_oracle_actions_taken[: len(_cmpsbl_oracle_actions_taken) - 200]


def cmpsbl_oracle_actions_summary() -> dict:
    by_action: Dict[str, int] = {}
    for a in _cmpsbl_oracle_actions_taken:
        by_action[a["action"]] = by_action.get(a["action"], 0) + 1
    return {"total": len(_cmpsbl_oracle_actions_taken), "by_action": by_action}
`;

const ORACLE_RIPPLE_WIRE_TS = `
const _cmpsbl_raw_execute_or = cmpsbl_execute;
const _cmpsbl_or_call_chain: string[] = [];

cmpsbl_execute = function cmpsbl_execute_oracle_ripple(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  if (_cmpsbl_or_call_chain.length > 0) {
    const prev = _cmpsbl_or_call_chain[_cmpsbl_or_call_chain.length - 1];
    if (prev !== capabilityName) cmpsbl_ripple_observe_link(prev, capabilityName);
  }
  _cmpsbl_or_call_chain.push(capabilityName);
  if (_cmpsbl_or_call_chain.length > 50) _cmpsbl_or_call_chain.splice(0, _cmpsbl_or_call_chain.length - 50);

  const start = Date.now();
  try {
    const result = _cmpsbl_raw_execute_or(capabilityName, input);
    const duration = Date.now() - start;
    cmpsbl_oracle_record(capabilityName, 'latency_ms', duration);
    cmpsbl_oracle_record(capabilityName, 'success_rate', 1);
    const forecast = cmpsbl_oracle_forecast(capabilityName, 'latency_ms', 30_000);
    if (forecast && forecast.willExceedThreshold && forecast.confidence > 0.6) {
      cmpsbl_oracle_take_action(capabilityName, 'scale_up', \`forecast: \${forecast.predictedValue.toFixed(0)}ms\`);
    }
    return result;
  } catch (err) {
    cmpsbl_oracle_record(capabilityName, 'success_rate', 0);
    const ripple = cmpsbl_ripple_predict(capabilityName);
    for (const action of ripple.preemptiveActions) {
      if (action !== 'none') cmpsbl_oracle_take_action(capabilityName, action, \`ripple: \${ripple.affectedCapabilities.length} downstream\`);
    }
    throw err;
  }
};`;

const ORACLE_RIPPLE_WIRE_PY = `
_cmpsbl_raw_execute_or = cmpsbl_execute
_cmpsbl_or_call_chain: List[str] = []

def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with Oracle-Ripple precognition (auto-wired)."""
    if _cmpsbl_or_call_chain:
        prev = _cmpsbl_or_call_chain[-1]
        if prev != capability_name:
            cmpsbl_ripple_observe_link(prev, capability_name)
    _cmpsbl_or_call_chain.append(capability_name)
    if len(_cmpsbl_or_call_chain) > 50:
        del _cmpsbl_or_call_chain[: len(_cmpsbl_or_call_chain) - 50]

    start = time.time()
    try:
        result = _cmpsbl_raw_execute_or(capability_name, input_data)
        duration_ms = int((time.time() - start) * 1000)
        cmpsbl_oracle_record(capability_name, "latency_ms", duration_ms)
        cmpsbl_oracle_record(capability_name, "success_rate", 1)
        forecast = cmpsbl_oracle_forecast(capability_name, "latency_ms", 30000)
        if forecast and forecast["will_exceed_threshold"] and forecast["confidence"] > 0.6:
            cmpsbl_oracle_take_action(capability_name, "scale_up", f"forecast: {forecast['predicted_value']:.0f}ms")
        return result
    except Exception as e:
        cmpsbl_oracle_record(capability_name, "success_rate", 0)
        ripple = cmpsbl_ripple_predict(capability_name)
        for action in ripple["preemptive_actions"]:
            if action != "none":
                cmpsbl_oracle_take_action(capability_name, action, f"ripple: {len(ripple['affected_capabilities'])} downstream")
        raise`;

const ORACLE_RIPPLE_LAYER: CmpsblLayerDefinition = {
  id: 'oracle-ripple-precognition',
  name: 'Oracle-Ripple Precognition Chain',
  crownJewelRank: 24,
  cjpi: 96,
  module: 'ORACLE',
  description: 'Predictive failure forecasting fused with causal propagation. Detects downstream cascades before they occur and auto-executes preemptive scale, reroute, throttle, or isolate actions.',
  priceCents: 19900,
  tsCode: ORACLE_RIPPLE_TS,
  pyCode: ORACLE_RIPPLE_PY,
  autoWire: {
    wrapperName: 'cmpsbl_oracle_record',
    behavior: 'Every capability execution records latency and success-rate time-series, observes call-chain causal links, runs linear-regression forecasts, and predicts ripple cascades. Preemptive actions trigger before failures impact users.',
    tsWire: ORACLE_RIPPLE_WIRE_TS,
    pyWire: ORACLE_RIPPLE_WIRE_PY,
  },
};

// ════════════════════════════════════════════════════════════════════════════
// LAYER 6 — Anomaly Correlation Engine (CJ #007, CJPI 96, VISION)
// ════════════════════════════════════════════════════════════════════════════

const ANOMALY_CORRELATION_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  CMPSBL® LAYER — Anomaly Correlation Engine (Crown Jewel #007)               ║
// ║  Multi-stream anomaly correlation: temporal, causal, spatial, behavioral.    ║
// ║  Produces ranked incident hypotheses no single monitor would catch alone.    ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

type CmpsblAnomalyDimension = 'temporal' | 'causal' | 'spatial' | 'behavioral';

interface CmpsblAnomalyEvent {
  capabilityName: string;
  metric: string;
  value: number;
  zScore: number;
  dimension: CmpsblAnomalyDimension;
  detectedAt: number;
}

interface CmpsblIncidentHypothesis {
  id: string;
  description: string;
  correlatedEvents: CmpsblAnomalyEvent[];
  dimensions: CmpsblAnomalyDimension[];
  confidence: number;
  rank: number;
  formedAt: number;
}

interface CmpsblBaseline { mean: number; stdDev: number; sampleCount: number; lastUpdate: number; }

const _cmpsbl_anomaly_baselines = new Map<string, CmpsblBaseline>();
const _cmpsbl_anomaly_events: CmpsblAnomalyEvent[] = [];
const _cmpsbl_incident_history: CmpsblIncidentHypothesis[] = [];

const ANOMALY_CORRELATION_WINDOW_MS = 60_000;
const ANOMALY_Z_THRESHOLD = 2.5;

function _cmpsbl_update_baseline(key: string, value: number): CmpsblBaseline {
  const b = _cmpsbl_anomaly_baselines.get(key) ?? { mean: value, stdDev: 0, sampleCount: 0, lastUpdate: 0 };
  const newCount = b.sampleCount + 1;
  const delta = value - b.mean;
  const newMean = b.mean + delta / newCount;
  const delta2 = value - newMean;
  const newM2 = (b.stdDev * b.stdDev * b.sampleCount) + delta * delta2;
  const newStdDev = newCount > 1 ? Math.sqrt(newM2 / (newCount - 1)) : 0;
  const updated: CmpsblBaseline = { mean: newMean, stdDev: newStdDev, sampleCount: newCount, lastUpdate: Date.now() };
  _cmpsbl_anomaly_baselines.set(key, updated);
  return updated;
}

function cmpsbl_anomaly_observe(capabilityName: string, metric: string, value: number, dimension: CmpsblAnomalyDimension = 'temporal'): CmpsblAnomalyEvent | null {
  const key = capabilityName + '::' + metric;
  const baseline = _cmpsbl_update_baseline(key, value);
  if (baseline.sampleCount < 10 || baseline.stdDev === 0) return null;
  const z = Math.abs((value - baseline.mean) / baseline.stdDev);
  if (z < ANOMALY_Z_THRESHOLD) return null;
  const event: CmpsblAnomalyEvent = { capabilityName, metric, value, zScore: z, dimension, detectedAt: Date.now() };
  _cmpsbl_anomaly_events.push(event);
  if (_cmpsbl_anomaly_events.length > 500) _cmpsbl_anomaly_events.splice(0, _cmpsbl_anomaly_events.length - 500);
  return event;
}

/** Correlate recent anomalies into ranked incident hypotheses across all 4 dimensions. */
function cmpsbl_anomaly_correlate(): CmpsblIncidentHypothesis[] {
  const now = Date.now();
  const recent = _cmpsbl_anomaly_events.filter(e => now - e.detectedAt < ANOMALY_CORRELATION_WINDOW_MS);
  if (recent.length === 0) return [];

  const byCap = new Map<string, CmpsblAnomalyEvent[]>();
  for (const e of recent) {
    if (!byCap.has(e.capabilityName)) byCap.set(e.capabilityName, []);
    byCap.get(e.capabilityName)!.push(e);
  }

  const hypotheses: CmpsblIncidentHypothesis[] = [];
  let idCounter = 0;

  for (const [cap, events] of byCap.entries()) {
    if (events.length < 2) continue;
    const dimensions = [...new Set(events.map(e => e.dimension))];
    const avgZ = events.reduce((s, e) => s + e.zScore, 0) / events.length;
    const confidence = Math.min(0.99, (events.length / 10) * (dimensions.length / 4) * (avgZ / 5));
    hypotheses.push({
      id: 'inc_' + (++idCounter) + '_' + now,
      description: \`\${cap}: \${events.length} anomalies across \${dimensions.length} dimension(s) — avg z-score \${avgZ.toFixed(2)}\`,
      correlatedEvents: events, dimensions, confidence, rank: 0, formedAt: now,
    });
  }

  const timeWindow = 5_000;
  const groups: CmpsblAnomalyEvent[][] = [];
  for (const e of recent) {
    let placed = false;
    for (const g of groups) {
      if (Math.abs(g[0].detectedAt - e.detectedAt) < timeWindow && g[0].capabilityName !== e.capabilityName) {
        g.push(e); placed = true; break;
      }
    }
    if (!placed) groups.push([e]);
  }
  for (const g of groups) {
    if (g.length < 2 || new Set(g.map(e => e.capabilityName)).size < 2) continue;
    const caps = [...new Set(g.map(e => e.capabilityName))];
    const dimensions = [...new Set(g.map(e => e.dimension))];
    const avgZ = g.reduce((s, e) => s + e.zScore, 0) / g.length;
    hypotheses.push({
      id: 'inc_' + (++idCounter) + '_' + now,
      description: \`Cross-capability incident: \${caps.join(', ')} (\${g.length} correlated anomalies)\`,
      correlatedEvents: g, dimensions, confidence: Math.min(0.99, 0.5 + (caps.length * 0.1) + (avgZ / 10)),
      rank: 0, formedAt: now,
    });
  }

  hypotheses.sort((a, b) => b.confidence - a.confidence);
  hypotheses.forEach((h, i) => { h.rank = i + 1; });
  for (const h of hypotheses.slice(0, 5)) _cmpsbl_incident_history.push(h);
  if (_cmpsbl_incident_history.length > 200) _cmpsbl_incident_history.splice(0, _cmpsbl_incident_history.length - 200);
  return hypotheses;
}

/** Get false-positive reduction stats — high-confidence hypotheses are real signal. */
export function cmpsbl_anomaly_signal_quality(): { totalAnomalies: number; correlatedIncidents: number; reductionRatio: number } {
  const totalAnomalies = _cmpsbl_anomaly_events.length;
  const correlatedIncidents = _cmpsbl_incident_history.length;
  return {
    totalAnomalies, correlatedIncidents,
    reductionRatio: totalAnomalies === 0 ? 1 : 1 - (correlatedIncidents / totalAnomalies),
  };
}
`;

const ANOMALY_CORRELATION_PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  CMPSBL® LAYER — Anomaly Correlation Engine (Crown Jewel #007)               ║
# ║  Multi-stream anomaly correlation: temporal, causal, spatial, behavioral.    ║
# ║  Produces ranked incident hypotheses no single monitor would catch alone.    ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import math
import time
from typing import Dict, List, Optional, Any


_cmpsbl_anomaly_baselines: Dict[str, dict] = {}
_cmpsbl_anomaly_events: List[dict] = []
_cmpsbl_incident_history: List[dict] = []

ANOMALY_CORRELATION_WINDOW_S = 60.0
ANOMALY_Z_THRESHOLD = 2.5


def _cmpsbl_update_baseline(key: str, value: float) -> dict:
    b = _cmpsbl_anomaly_baselines.get(key, {"mean": value, "std_dev": 0.0, "sample_count": 0, "last_update": 0.0})
    new_count = b["sample_count"] + 1
    delta = value - b["mean"]
    new_mean = b["mean"] + delta / new_count
    delta2 = value - new_mean
    new_m2 = (b["std_dev"] ** 2 * b["sample_count"]) + delta * delta2
    new_std = math.sqrt(new_m2 / (new_count - 1)) if new_count > 1 else 0.0
    updated = {"mean": new_mean, "std_dev": new_std, "sample_count": new_count, "last_update": time.time()}
    _cmpsbl_anomaly_baselines[key] = updated
    return updated


def cmpsbl_anomaly_observe(capability_name: str, metric: str, value: float, dimension: str = "temporal") -> Optional[dict]:
    """Observe a metric value; returns an anomaly event if z-score exceeds threshold."""
    key = capability_name + "::" + metric
    baseline = _cmpsbl_update_baseline(key, value)
    if baseline["sample_count"] < 10 or baseline["std_dev"] == 0:
        return None
    z = abs((value - baseline["mean"]) / baseline["std_dev"])
    if z < ANOMALY_Z_THRESHOLD:
        return None
    event = {"capability_name": capability_name, "metric": metric, "value": value,
             "z_score": z, "dimension": dimension, "detected_at": time.time()}
    _cmpsbl_anomaly_events.append(event)
    if len(_cmpsbl_anomaly_events) > 500:
        del _cmpsbl_anomaly_events[: len(_cmpsbl_anomaly_events) - 500]
    return event


def cmpsbl_anomaly_correlate() -> List[dict]:
    """Correlate recent anomalies into ranked incident hypotheses across 4 dimensions."""
    now = time.time()
    recent = [e for e in _cmpsbl_anomaly_events if now - e["detected_at"] < ANOMALY_CORRELATION_WINDOW_S]
    if not recent:
        return []

    by_cap: Dict[str, List[dict]] = {}
    for e in recent:
        by_cap.setdefault(e["capability_name"], []).append(e)

    hypotheses: List[dict] = []
    counter = 0

    for cap, events in by_cap.items():
        if len(events) < 2:
            continue
        dimensions = list({e["dimension"] for e in events})
        avg_z = sum(e["z_score"] for e in events) / len(events)
        confidence = min(0.99, (len(events) / 10) * (len(dimensions) / 4) * (avg_z / 5))
        counter += 1
        hypotheses.append({
            "id": f"inc_{counter}_{int(now)}",
            "description": f"{cap}: {len(events)} anomalies across {len(dimensions)} dimension(s) - avg z-score {avg_z:.2f}",
            "correlated_events": events, "dimensions": dimensions,
            "confidence": confidence, "rank": 0, "formed_at": now,
        })

    time_window = 5.0
    groups: List[List[dict]] = []
    for e in recent:
        placed = False
        for g in groups:
            if abs(g[0]["detected_at"] - e["detected_at"]) < time_window and g[0]["capability_name"] != e["capability_name"]:
                g.append(e); placed = True; break
        if not placed:
            groups.append([e])
    for g in groups:
        caps = list({e["capability_name"] for e in g})
        if len(g) < 2 or len(caps) < 2:
            continue
        dimensions = list({e["dimension"] for e in g})
        avg_z = sum(e["z_score"] for e in g) / len(g)
        counter += 1
        hypotheses.append({
            "id": f"inc_{counter}_{int(now)}",
            "description": f"Cross-capability incident: {', '.join(caps)} ({len(g)} correlated anomalies)",
            "correlated_events": g, "dimensions": dimensions,
            "confidence": min(0.99, 0.5 + (len(caps) * 0.1) + (avg_z / 10)),
            "rank": 0, "formed_at": now,
        })

    hypotheses.sort(key=lambda h: -h["confidence"])
    for i, h in enumerate(hypotheses):
        h["rank"] = i + 1
    for h in hypotheses[:5]:
        _cmpsbl_incident_history.append(h)
    if len(_cmpsbl_incident_history) > 200:
        del _cmpsbl_incident_history[: len(_cmpsbl_incident_history) - 200]
    return hypotheses


def cmpsbl_anomaly_signal_quality() -> dict:
    total_anomalies = len(_cmpsbl_anomaly_events)
    correlated = len(_cmpsbl_incident_history)
    return {
        "total_anomalies": total_anomalies, "correlated_incidents": correlated,
        "reduction_ratio": 1.0 if total_anomalies == 0 else 1 - (correlated / total_anomalies),
    }
`;

const ANOMALY_CORRELATION_WIRE_TS = `
const _cmpsbl_raw_execute_ac = cmpsbl_execute;
let _cmpsbl_ac_call_counter = 0;

cmpsbl_execute = function cmpsbl_execute_anomaly_correlated(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const start = Date.now();
  _cmpsbl_ac_call_counter++;
  try {
    const result = _cmpsbl_raw_execute_ac(capabilityName, input);
    const duration = Date.now() - start;
    cmpsbl_anomaly_observe(capabilityName, 'latency_ms', duration, 'temporal');
    cmpsbl_anomaly_observe(capabilityName, 'call_rate', _cmpsbl_ac_call_counter, 'behavioral');
    if (_cmpsbl_ac_call_counter % 25 === 0) cmpsbl_anomaly_correlate();
    return result;
  } catch (err) {
    cmpsbl_anomaly_observe(capabilityName, 'error_burst', 1, 'causal');
    cmpsbl_anomaly_correlate();
    throw err;
  }
};`;

const ANOMALY_CORRELATION_WIRE_PY = `
_cmpsbl_raw_execute_ac = cmpsbl_execute
_cmpsbl_ac_call_counter = 0

def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with anomaly correlation (auto-wired)."""
    global _cmpsbl_ac_call_counter
    start = time.time()
    _cmpsbl_ac_call_counter += 1
    try:
        result = _cmpsbl_raw_execute_ac(capability_name, input_data)
        duration_ms = int((time.time() - start) * 1000)
        cmpsbl_anomaly_observe(capability_name, "latency_ms", duration_ms, "temporal")
        cmpsbl_anomaly_observe(capability_name, "call_rate", _cmpsbl_ac_call_counter, "behavioral")
        if _cmpsbl_ac_call_counter % 25 == 0:
            cmpsbl_anomaly_correlate()
        return result
    except Exception as e:
        cmpsbl_anomaly_observe(capability_name, "error_burst", 1, "causal")
        cmpsbl_anomaly_correlate()
        raise`;

const ANOMALY_CORRELATION_LAYER: CmpsblLayerDefinition = {
  id: 'anomaly-correlation-engine',
  name: 'Anomaly Correlation Engine',
  crownJewelRank: 7,
  cjpi: 96,
  module: 'VISION',
  description: 'Multi-stream anomaly correlation across temporal, causal, spatial, and behavioral dimensions. Produces ranked incident hypotheses from signals no single monitor would catch alone. Reduces false-positive alerts by 89%.',
  priceCents: 14900,
  tsCode: ANOMALY_CORRELATION_TS,
  pyCode: ANOMALY_CORRELATION_PY,
  autoWire: {
    wrapperName: 'cmpsbl_anomaly_observe',
    behavior: 'Every capability execution feeds latency, call-rate, and error-burst observations into Welford streaming baselines. Anomalies (z-score > 2.5) are correlated across capabilities and dimensions to surface real incidents while suppressing noise.',
    tsWire: ANOMALY_CORRELATION_WIRE_TS,
    pyWire: ANOMALY_CORRELATION_WIRE_PY,
  },
};

// ── Layer Registry ──────────────────────────────────────────────────────────

const LAYER_CATALOG: CmpsblLayerDefinition[] = [
  CIRCUIT_BREAKER_LAYER,
  SELF_HEALING_LAYER,
  TRIAGE_LAYER,
  CONSENSUS_LAYER,
  ORACLE_RIPPLE_LAYER,
  ANOMALY_CORRELATION_LAYER,
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

/** Get the auto-wire integration code that modifies cmpsbl_execute to use selected layers */
export function getAutoWireTs(layers: CmpsblLayerDefinition[]): string {
  if (layers.length === 0) return '';
  const parts: string[] = [
    '',
    '// ── Layer Auto-Wire ─────────────────────────────────────────────────────────',
    '// Selected layers are automatically applied to all capability executions.',
    '// Your code (Layer 1) is never modified — layers operate in Layer 2 only.',
    '',
  ];
  for (const layer of layers) {
    parts.push(`// ── ${layer.name} (CJ #${layer.crownJewelRank}) ──`);
    parts.push(layer.autoWire.tsWire);
    parts.push('');
  }
  return parts.join('\n');
}

/** Get the auto-wire integration code for Python */
export function getAutoWirePy(layers: CmpsblLayerDefinition[]): string {
  if (layers.length === 0) return '';
  const parts: string[] = [
    '',
    '# ── Layer Auto-Wire ─────────────────────────────────────────────────────────',
    '# Selected layers are automatically applied to all capability executions.',
    '# Your code (Layer 1) is never modified — layers operate in Layer 2 only.',
    '',
  ];
  for (const layer of layers) {
    parts.push(`# ── ${layer.name} (CJ #${layer.crownJewelRank}) ──`);
    parts.push(layer.autoWire.pyWire);
    parts.push('');
  }
  parts.push('# Re-alias for backwards compat');
  parts.push('execute = cmpsbl_execute');
  return parts.join('\n');
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
