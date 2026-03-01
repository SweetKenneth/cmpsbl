/**
 * S-Tier Crown Jewel #8 — IMMUNITY Self-Healing Orchestrator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 8 | CJPI: 96 | Version: 1.0.0
 * Module: IMMUNITY | Type: Architecture
 * Signature: 1a2e4807
 * Generated: 2026-03-01T00:00:00.000Z
 */

interface RepairStrategy { id: string; failureType: string; actions: string[]; blastRadius: 'node' | 'sector' | 'system'; estimatedDurationMs: number; successRate: number; costScore: number; requiresApproval: boolean; }
interface RepairPlan { id: string; nodeId: string; failureType: string; strategy: RepairStrategy; actions: string[]; estimatedDurationMs: number; rollbackPlan: string[]; createdAt: number; }
interface RepairResult { planId: string; success: boolean; durationMs: number; actionsExecuted: string[]; rolledBack: boolean; error?: string; }

export function createSelfHealingOrchestrator() {
  const strategies: RepairStrategy[] = [];
  const history: RepairResult[] = [];
  const strategyScores = new Map<string, { successes: number; failures: number }>();

  function addRepairStrategy(strategy: RepairStrategy) { strategies.push(strategy); strategyScores.set(strategy.id, { successes: 0, failures: 0 }); }

  function getAdjustedRate(id: string): number {
    const s = strategyScores.get(id);
    if (!s || (s.successes + s.failures) === 0) return strategies.find(st => st.id === id)?.successRate ?? 0.5;
    return s.successes / (s.successes + s.failures);
  }

  function blastScore(r: string): number { return r === 'system' ? 1 : r === 'sector' ? 0.5 : 0.1; }

  function plan(params: { nodeId: string; failureType: string; maxBlastRadius?: string }): RepairPlan | null {
    const candidates = strategies.filter(s => s.failureType === params.failureType).filter(s => {
      if (!params.maxBlastRadius) return true;
      const order = ['node', 'sector', 'system'];
      return order.indexOf(s.blastRadius) <= order.indexOf(params.maxBlastRadius);
    }).sort((a, b) => {
      const sa = getAdjustedRate(a.id) * 0.5 - blastScore(a.blastRadius) * 0.3 - a.costScore * 0.2;
      const sb = getAdjustedRate(b.id) * 0.5 - blastScore(b.blastRadius) * 0.3 - b.costScore * 0.2;
      return sb - sa;
    });
    if (!candidates.length) return null;
    const best = candidates[0];
    return { id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, nodeId: params.nodeId, failureType: params.failureType, strategy: best, actions: best.actions, estimatedDurationMs: best.estimatedDurationMs, rollbackPlan: best.actions.slice().reverse().map(a => `rollback_${a}`), createdAt: Date.now() };
  }

  async function execute(repairPlan: RepairPlan, executor: (action: string, nodeId: string) => Promise<boolean>, onRollback?: (action: string, nodeId: string) => Promise<void>): Promise<RepairResult> {
    const start = Date.now(); const executed: string[] = [];
    try {
      for (const action of repairPlan.actions) { const ok = await executor(action, repairPlan.nodeId); if (!ok) throw new Error(`Action '${action}' failed`); executed.push(action); }
      const result: RepairResult = { planId: repairPlan.id, success: true, durationMs: Date.now() - start, actionsExecuted: executed, rolledBack: false };
      const s = strategyScores.get(repairPlan.strategy.id); if (s) s.successes++;
      history.push(result); return result;
    } catch (err) {
      if (onRollback) for (const a of executed.reverse()) { try { await onRollback(`rollback_${a}`, repairPlan.nodeId); } catch { /* best effort */ } }
      const result: RepairResult = { planId: repairPlan.id, success: false, durationMs: Date.now() - start, actionsExecuted: executed, rolledBack: !!onRollback, error: err instanceof Error ? err.message : String(err) };
      const s = strategyScores.get(repairPlan.strategy.id); if (s) s.failures++;
      history.push(result); return result;
    }
  }

  return { addRepairStrategy, plan, execute, getHistory: () => [...history], getSuccessRate: () => history.length === 0 ? 1 : history.filter(r => r.success).length / history.length };
}
