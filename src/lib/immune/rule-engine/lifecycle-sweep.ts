/**
 * Immunity Mesh — Batch Lifecycle Sweep
 * Processes all rules and applies status transitions based on thresholds.
 * Guarded by shadow_mesh_enabled flag.
 */

import { isShadowMeshEnabled } from '@/lib/system/flags';
import { fetchRules, updateRuleStatus, fetchPropagation, fetchConflicts } from './db';
import { checkPromotionEligibility, checkCandidateEligibility, shouldDemote, shouldRetire } from './lifecycle';
import type { RuleStatus, ImmunityRule } from './types';

export interface SweepResult {
  processed: number;
  promoted: number;
  candidated: number;
  demoted: number;
  retired: number;
  blocked: number;
  errors: string[];
}

/**
 * Run a full lifecycle sweep across all active rules.
 * Applies: learned→candidate, candidate→promoted, promoted→candidate (demote), *→retired
 * Returns a summary of all transitions applied.
 */
export async function sweepRuleLifecycle(): Promise<SweepResult | null> {
  if (!(await isShadowMeshEnabled())) {
    console.warn('[lifecycle-sweep] Mesh is OFF — skipping sweep');
    return null;
  }

  const result: SweepResult = {
    processed: 0,
    promoted: 0,
    candidated: 0,
    demoted: 0,
    retired: 0,
    blocked: 0,
    errors: [],
  };

  try {
    const rules = await fetchRules(['learned', 'candidate', 'promoted', 'deprecated']);
    const propagations = await fetchPropagation();

    // Check for conflicts in last 24h
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentConflicts = await fetchConflicts(100);
    const conflictRuleIds = new Set<string>();
    for (const c of recentConflicts) {
      if (c.detected_at >= since24h && c.resolution === 'unresolved') {
        conflictRuleIds.add(c.rule_a_id);
        conflictRuleIds.add(c.rule_b_id);
      }
    }

    // Build propagation breadth per rule
    const breadthMap = new Map<string, number>();
    for (const p of propagations) {
      const executors = new Set<string>();
      for (const pp of propagations.filter(x => x.rule_id === p.rule_id)) {
        executors.add(pp.to_executor);
      }
      breadthMap.set(p.rule_id, executors.size);
    }

    for (const rule of rules) {
      result.processed++;

      try {
        // 1. Auto-retire: 0 invocations in 7d
        if (shouldRetire(rule)) {
          await updateRuleStatus(rule.id, 'retired', { retired_at: new Date().toISOString() });
          result.retired++;
          continue;
        }

        // 2. Demote: promoted but poor success
        if (shouldDemote(rule)) {
          await updateRuleStatus(rule.id, 'candidate', { promoted_at: null });
          result.demoted++;
          continue;
        }

        // 3. Block: unresolved conflict
        if (conflictRuleIds.has(rule.id) && rule.status !== 'blocked') {
          await updateRuleStatus(rule.id, 'blocked');
          result.blocked++;
          continue;
        }

        // 4. Promote: candidate → promoted
        if (rule.status === 'candidate') {
          const breadth = breadthMap.get(rule.id) ?? 0;
          const hasConflicts = conflictRuleIds.has(rule.id);
          const check = checkPromotionEligibility(rule, breadth, hasConflicts, 0);
          if (check.eligible) {
            await updateRuleStatus(rule.id, 'promoted', { promoted_at: new Date().toISOString() });
            result.promoted++;
            continue;
          }
        }

        // 5. Candidate: learned → candidate
        if (rule.status === 'learned') {
          const breadth = breadthMap.get(rule.id) ?? 0;
          if (checkCandidateEligibility(rule, breadth)) {
            await updateRuleStatus(rule.id, 'candidate');
            result.candidated++;
            continue;
          }
        }
      } catch (err) {
        result.errors.push(`Rule ${rule.rule_key}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  } catch (err) {
    result.errors.push(`Sweep error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return result;
}
