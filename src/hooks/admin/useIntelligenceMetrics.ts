/**
 * Intelligence Metrics Hook — Computes DKD, FNR, RMI, CKP, IIL, MRI
 * from immune_intelligence_events table
 * 
 * FIX: Repair success rate now counts safe_fail events WITH repair_type
 * as failed repair attempts (wrapExecutor emits safe_fail, not repair_failed,
 * when a repair attempt fails then safe-fails).
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  DKDResult, FNRResult, RMIResult, CKPResult, IILResult, MRIResult,
  IntelligenceDashboardData,
} from '@/immune/metrics/intelligenceTypes';

type RawEvent = {
  executor_id: string;
  is_shadow_mesh: boolean;
  mode: string;
  outcome: string;
  repair_type: string | null;
  rule_id: string | null;
  failure_signature_hash: string | null;
  escalation_severity: string | null;
  created_at: string;
};

function computeDKD(events: RawEvent[]): DKDResult {
  const failures = events.filter(e => e.outcome !== 'success' && e.outcome !== 'skipped');
  const covered = failures.filter(e =>
    e.outcome === 'repaired_success' &&
    e.repair_type && ['deterministic', 'shared', 'legacy'].includes(e.repair_type)
  );
  const byType: Record<string, number> = {};
  const perExec: Record<string, { covered: number; total: number }> = {};

  for (const f of failures) {
    const eid = f.executor_id;
    if (!perExec[eid]) perExec[eid] = { covered: 0, total: 0 };
    perExec[eid].total++;
  }
  for (const c of covered) {
    if (c.repair_type) byType[c.repair_type] = (byType[c.repair_type] || 0) + 1;
    const eid = c.executor_id;
    if (!perExec[eid]) perExec[eid] = { covered: 0, total: 0 };
    perExec[eid].covered++;
  }

  const perExecutor: Record<string, number> = {};
  for (const [k, v] of Object.entries(perExec)) {
    perExecutor[k] = v.total > 0 ? v.covered / v.total : 0;
  }

  return {
    global: failures.length > 0 ? covered.length / failures.length : null,
    byRepairType: byType,
    perExecutor,
    coveredFailures: covered.length,
    totalFailures: failures.length,
  };
}

function computeFNR(events: RawEvent[], windowDays = 7): FNRResult {
  const now = Date.now();
  const cutoff = now - windowDays * 86400000;
  const sigEvents = events.filter(e => e.failure_signature_hash);
  const recent = sigEvents.filter(e => new Date(e.created_at).getTime() >= cutoff);
  const prior = sigEvents.filter(e => new Date(e.created_at).getTime() < cutoff);

  const priorSigs = new Set(prior.map(e => e.failure_signature_hash));
  const recentSigs = new Set(recent.map(e => e.failure_signature_hash));
  const novelSigs = [...recentSigs].filter(s => !priorSigs.has(s));

  const perExec: Record<string, { novel: number; total: number }> = {};
  for (const e of recent) {
    const eid = e.executor_id;
    if (!perExec[eid]) perExec[eid] = { novel: 0, total: 0 };
    perExec[eid].total++;
    if (!priorSigs.has(e.failure_signature_hash)) perExec[eid].novel++;
  }

  const perExecutor: Record<string, number> = {};
  for (const [k, v] of Object.entries(perExec)) {
    perExecutor[k] = v.total > 0 ? v.novel / v.total : 0;
  }

  return {
    global: recentSigs.size > 0 ? novelSigs.length / recentSigs.size : null,
    perExecutor,
    novelSignatures: novelSigs.length,
    totalSignatures: recentSigs.size,
  };
}

function computeRMI(events: RawEvent[]): RMIResult {
  const ruleMap: Record<string, { invocations: number; successes: number; executors: Set<string> }> = {};
  for (const e of events) {
    if (!e.rule_id) continue;
    if (!ruleMap[e.rule_id]) ruleMap[e.rule_id] = { invocations: 0, successes: 0, executors: new Set() };
    ruleMap[e.rule_id].invocations++;
    if (e.outcome === 'repaired_success') ruleMap[e.rule_id].successes++;
    ruleMap[e.rule_id].executors.add(e.executor_id);
  }

  const rules = Object.entries(ruleMap).map(([ruleId, d]) => ({
    ruleId,
    invocations: d.invocations,
    successRate: d.invocations > 0 ? d.successes / d.invocations : 0,
    executorCount: d.executors.size,
    isDominant: false,
    isRisky: false,
  }));

  rules.sort((a, b) => b.invocations - a.invocations);
  const dominant = rules.slice(0, 5).map(r => ({ ...r, isDominant: true }));
  const risky = rules.filter(r => r.successRate < 0.6 && r.invocations >= 20).map(r => ({ ...r, isRisky: true }));

  return { dominantRules: dominant, riskyRules: risky };
}

function computeCKP(events: RawEvent[]): CKPResult {
  const ruleExecs: Record<string, Set<string>> = {};
  for (const e of events) {
    if (!e.rule_id) continue;
    if (!ruleExecs[e.rule_id]) ruleExecs[e.rule_id] = new Set();
    ruleExecs[e.rule_id].add(e.executor_id);
  }

  const entries = Object.entries(ruleExecs).map(([ruleId, execs]) => ({
    ruleId,
    executorCount: execs.size,
  }));

  entries.sort((a, b) => b.executorCount - a.executorCount);
  const globalAvg = entries.length > 0
    ? entries.reduce((s, e) => s + e.executorCount, 0) / entries.length
    : null;

  return { globalAvg, topPropagated: entries.slice(0, 5) };
}

function computeIIL(events: RawEvent[]): IILResult {
  const result: IILResult = {
    preflightBlocks: 0,
    postcheckBlocks: 0,
    safeFails: 0,
    repairedSuccess: 0,
    repairFailures: 0,
    escalationsBySeverity: {},
    totalEvents: events.length,
  };

  for (const e of events) {
    switch (e.outcome) {
      case 'safe_fail':
        result.safeFails++;
        // FIX: If a safe_fail has a repair_type, the repair was attempted and failed
        if (e.repair_type) result.repairFailures++;
        break;
      case 'repaired_success': result.repairedSuccess++; break;
      case 'repair_failed': result.repairFailures++; break;
      case 'escalation':
        const sev = e.escalation_severity || 'unknown';
        result.escalationsBySeverity[sev] = (result.escalationsBySeverity[sev] || 0) + 1;
        break;
    }
  }

  for (const e of events) {
    const meta = e as any;
    if (meta.meta?.stage === 'preflight' && e.outcome !== 'success') result.preflightBlocks++;
    if (meta.meta?.stage === 'postcheck' && e.outcome !== 'success') result.postcheckBlocks++;
  }

  return result;
}

function computeMRI(dkd: DKDResult, fnr: FNRResult, iil: IILResult, events: RawEvent[]): MRIResult {
  const total = events.length || 1;
  const escalations = Object.values(iil.escalationsBySeverity).reduce((s, v) => s + v, 0);

  // FIX: Real repair attempts = repaired_success + repair_failed outcomes
  // + safe_fail events that had a repair_type set (repair attempted then safe-failed)
  const repairSuccesses = events.filter(e => e.outcome === 'repaired_success').length;
  const realRepairAttempts = repairSuccesses + iil.repairFailures;

  const escalationRate = escalations / total;
  const repairSuccessRate = realRepairAttempts > 0 ? repairSuccesses / realRepairAttempts : 1;
  const dkdVal = dkd.global ?? 0;
  const fnrVal = fnr.global ?? 0;

  const factors = {
    dkd: dkdVal,
    fnrInverse: 1 - fnrVal,
    escalationRateInverse: 1 - escalationRate,
    repairSuccessRate,
    cascadeRateInverse: 1,
  };

  const score = Math.round(
    (factors.dkd * 35 +
     factors.fnrInverse * 20 +
     factors.escalationRateInverse * 20 +
     factors.repairSuccessRate * 20 +
     factors.cascadeRateInverse * 5)
  );

  const status: MRIResult['status'] =
    score >= 75 ? 'ready' : score >= 50 ? 'caution' : 'not_ready';

  return { score, status, factors };
}

export function useIntelligenceMetrics(windowHours = 24, isShadow: boolean | null = null) {
  return useQuery<IntelligenceDashboardData>({
    queryKey: ['intelligence-metrics', windowHours, isShadow],
    queryFn: async () => {
      const since = new Date(Date.now() - windowHours * 3600000).toISOString();
      let query = supabase
        .from('immune_intelligence_events')
        .select('executor_id, is_shadow_mesh, mode, outcome, repair_type, rule_id, failure_signature_hash, escalation_severity, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(5000);

      if (isShadow !== null) {
        query = query.eq('is_shadow_mesh', isShadow);
      }

      const { data, error } = await query as any;
      if (error) throw error;
      const events: RawEvent[] = data || [];

      const dkd = computeDKD(events);
      const fnr = computeFNR(events);
      const rmi = computeRMI(events);
      const ckp = computeCKP(events);
      const iil = computeIIL(events);
      const mri = computeMRI(dkd, fnr, iil, events);

      return { dkd, fnr, rmi, ckp, iil, mri, totalEvents: events.length, windowHours };
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
