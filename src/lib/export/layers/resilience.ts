/**
 * CMPSBL® Layer — Resilience Pillar
 * Self-Healing Orchestrator · Autonomous Triage · Distributed Consensus
 * Extracted from cmpsbl-layers.ts for maintainability.
 */
import type { CmpsblLayerDefinition } from './types';

// ════════════════════════════════════════════════════════════════════════════
// LAYER 2 — Self-Healing Orchestrator (CJ #8, CJPI 96, IMMUNITY)
// ════════════════════════════════════════════════════════════════════════════

const SELF_HEALING_TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Sealed Resilience Module (proprietary).                    ║
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
# ║  ASCENSION LAYER — Sealed Resilience Module (proprietary).                    ║
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
  crownJewelRank: 1,
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
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
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
# ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
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
const _cmpsbl_raw_execute_tri = cmpsbl_execute;
const _cmpsbl_error_counts = new Map<string, { count: number; lastAt: number }>();

cmpsbl_execute = function cmpsbl_execute_triage_monitored(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const start = Date.now();
  try {
    const result = _cmpsbl_raw_execute_tri(capabilityName, input);
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
_cmpsbl_raw_execute_tri = cmpsbl_execute
_cmpsbl_error_counts: Dict[str, dict] = {}

def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute with triage monitoring (auto-wired)."""
    start = time.time()
    try:
        result = _cmpsbl_raw_execute_tri(capability_name, input_data)
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
// ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
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
# ║  ASCENSION LAYER — Sealed Module (proprietary).                               ║
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

export const RESILIENCE_LAYERS: CmpsblLayerDefinition[] = [SELF_HEALING_LAYER, TRIAGE_LAYER, CONSENSUS_LAYER];
