/**
 * Governance Mode Transition Validator
 * SPARTA Epoch v11.5.2 — Pure evaluation + committed transitions
 * 
 * evaluateTransition() — PURE, no side effects
 * commitTransition() — Records audit + persists history
 * Quorum system via governance_transition_approvals table
 */

import { getActiveAlerts } from '@/lib/system/healthMonitoring';
import { recordAudit } from '@/lib/substrate/audit-trail';
import { log } from '@/lib/system/log';
import { supabase } from '@/integrations/supabase/client';
import type { GovernanceMode } from '@/lib/system/governance';

export interface TransitionValidation {
  allowed: boolean;
  reason: string;
  requiresQuorum: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  blockedReasons?: string[];
}

export interface TransitionRequest {
  id: string;
  fromMode: string;
  toMode: string;
  requestedBy: string;
  requiresQuorum: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  approvalsRequired: number;
  approvals: Array<{ approver: string; at: string }>; // Legacy — prefer voteCount
  expiresAt: string;
  voteCount?: number; // Normalized vote count from governance_transition_votes
}

/** Transitions that are explicitly blocked */
const BLOCKED_TRANSITIONS: Array<{ from: GovernanceMode; to: GovernanceMode; reason: string }> = [
  { from: 'LOCKDOWN', to: 'EVOLVE', reason: 'Cannot jump from LOCKDOWN to EVOLVE — must stabilize through ACTIVE first' },
];

/** Transitions that require multi-approval (quorum) */
const QUORUM_TRANSITIONS: Array<{ from: GovernanceMode; to: GovernanceMode }> = [
  { from: 'ACTIVE', to: 'EVOLVE' },
  { from: 'LOCKDOWN', to: 'ACTIVE' },
];

const RAPID_TRANSITION_WINDOW = 300_000; // 5 minutes
const MAX_TRANSITIONS_IN_WINDOW = 3;
const DEFAULT_QUORUM_APPROVALS = 2;
const QUORUM_EXPIRY_MINUTES = 15;

/**
 * PURE evaluation — no side effects, no audit writes, no state mutation.
 */
export async function evaluateTransition(
  from: GovernanceMode,
  to: GovernanceMode,
  actor: string,
  opts?: { skipRateLimit?: boolean }
): Promise<TransitionValidation> {
  // Same-mode is a no-op
  if (from === to) {
    return { allowed: true, reason: 'No transition needed', requiresQuorum: false, riskLevel: 'low' };
  }

  // Emergency: any → LOCKDOWN is always allowed
  if (to === 'LOCKDOWN') {
    return { allowed: true, reason: 'Emergency lockdown always permitted', requiresQuorum: false, riskLevel: 'critical' };
  }

  // Check blocked transitions
  const blocked = BLOCKED_TRANSITIONS.find(b => b.from === from && b.to === to);
  if (blocked) {
    return {
      allowed: false,
      reason: blocked.reason,
      requiresQuorum: false,
      riskLevel: 'critical',
      blockedReasons: [blocked.reason],
    };
  }

  // DB-backed rate limiting
  if (!opts?.skipRateLimit) {
    try {
      const windowStart = new Date(Date.now() - RAPID_TRANSITION_WINDOW).toISOString();
      const { count } = await supabase
        .from('governance_transition_log')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', windowStart);

      if ((count ?? 0) >= MAX_TRANSITIONS_IN_WINDOW) {
        return {
          allowed: false,
          reason: `Rate limited: ${MAX_TRANSITIONS_IN_WINDOW} transitions in ${RAPID_TRANSITION_WINDOW / 1000}s window exceeded`,
          requiresQuorum: false,
          riskLevel: 'high',
          blockedReasons: ['Rate limit exceeded'],
        };
      }
    } catch {
      log.warn('governance', 'Rate limit check failed — proceeding with transition');
    }
  }

  // EVOLVE requires zero critical alerts
  if (to === 'EVOLVE') {
    const alerts = getActiveAlerts();
    const criticals = alerts.filter(a => a.severity === 'critical' && a.status === 'active');
    if (criticals.length > 0) {
      return {
        allowed: false,
        reason: `Cannot enter EVOLVE with ${criticals.length} active critical alerts`,
        requiresQuorum: false,
        riskLevel: 'high',
        blockedReasons: [`${criticals.length} critical alerts active`],
      };
    }
  }

  // Check quorum requirement
  const needsQuorum = QUORUM_TRANSITIONS.some(q => q.from === from && q.to === to);

  return {
    allowed: true,
    reason: `Transition ${from} → ${to} validated`,
    requiresQuorum: needsQuorum,
    riskLevel: needsQuorum ? 'high' : 'medium',
  };
}

/**
 * Commit a transition — writes audit log + persists to DB.
 * Call ONLY after evaluateTransition() returns allowed: true.
 */
export async function commitTransition(
  from: GovernanceMode,
  to: GovernanceMode,
  actor: string
): Promise<void> {
  // Persist to DB
  try {
    await supabase.from('governance_transition_log').insert({
      from_mode: from,
      to_mode: to,
      actor,
    });
  } catch (err) {
    log.error('governance', `Failed to persist transition log: ${err}`);
  }

  recordAudit(
    actor,
    'governance.transition.committed',
    'governance_mode',
    from,
    from,
    to,
    { actor }
  );
}

/**
 * Get the safe transition path between two modes.
 * PURE — calls evaluateTransition only, never commitTransition.
 */
export async function getTransitionPath(from: GovernanceMode, to: GovernanceMode): Promise<GovernanceMode[]> {
  if (from === to) return [from];

  // Direct transitions
  const direct = await evaluateTransition(from, to, 'path-resolver', { skipRateLimit: true });
  if (direct.allowed) return [from, to];

  // Try via ACTIVE
  const toActive = await evaluateTransition(from, 'ACTIVE', 'path-resolver', { skipRateLimit: true });
  const fromActive = await evaluateTransition('ACTIVE', to, 'path-resolver', { skipRateLimit: true });
  if (toActive.allowed && fromActive.allowed) return [from, 'ACTIVE', to];

  // Try via OBSERVE
  const toObserve = await evaluateTransition(from, 'OBSERVE', 'path-resolver', { skipRateLimit: true });
  const fromObserve = await evaluateTransition('OBSERVE', to, 'path-resolver', { skipRateLimit: true });
  if (toObserve.allowed && fromObserve.allowed) return [from, 'OBSERVE', to];

  return []; // No safe path
}

// ═══ QUORUM SYSTEM ═══

/**
 * Request a transition — if quorum required, creates approval request.
 */
export async function requestTransition(
  from: GovernanceMode,
  to: GovernanceMode,
  actor: string
): Promise<{ requestId: string | null; requiresQuorum: boolean; path: GovernanceMode[]; validation: TransitionValidation }> {
  const validation = await evaluateTransition(from, to, actor);
  const path = await getTransitionPath(from, to);

  if (!validation.allowed) {
    return { requestId: null, requiresQuorum: false, path, validation };
  }

  if (!validation.requiresQuorum) {
    // No quorum needed — commit immediately
    await commitTransition(from, to, actor);
    return { requestId: null, requiresQuorum: false, path, validation };
  }

  // Create quorum request
  const expiresAt = new Date(Date.now() + QUORUM_EXPIRY_MINUTES * 60_000).toISOString();
  const { data, error } = await supabase
    .from('governance_transition_approvals')
    .insert({
      from_mode: from,
      to_mode: to,
      requested_by: actor,
      status: 'pending',
      approvals_required: DEFAULT_QUORUM_APPROVALS,
      approvals: [],
      expires_at: expiresAt,
    })
    .select('id')
    .single();

  if (error || !data) {
    log.error('governance', `Failed to create quorum request: ${error?.message}`);
    return { requestId: null, requiresQuorum: true, path, validation };
  }

  return { requestId: data.id, requiresQuorum: true, path, validation };
}

/**
 * Approve a pending transition request.
 * Uses normalized governance_transition_votes table for concurrency safety.
 * Duplicate votes are blocked by unique constraint (request_id, approver).
 */
export async function approveTransition(
  requestId: string,
  approver: string
): Promise<{ approved: boolean; totalApprovals: number; required: number }> {
  const { data: req, error } = await supabase
    .from('governance_transition_approvals')
    .select('*')
    .eq('id', requestId)
    .single();

  if (error || !req) {
    return { approved: false, totalApprovals: 0, required: 0 };
  }

  if (req.status !== 'pending') {
    // Count existing votes for accurate reporting
    const { count } = await supabase
      .from('governance_transition_votes')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', requestId);
    return { approved: false, totalApprovals: count ?? 0, required: req.approvals_required };
  }

  // Check expiry
  if (new Date(req.expires_at) < new Date()) {
    await supabase.from('governance_transition_approvals').update({ status: 'expired' }).eq('id', requestId);
    return { approved: false, totalApprovals: 0, required: req.approvals_required };
  }

  // Insert vote — unique constraint prevents duplicates
  const { error: voteError } = await supabase
    .from('governance_transition_votes')
    .insert({ request_id: requestId, approver });

  if (voteError) {
    // Duplicate vote or other error
    const { count } = await supabase
      .from('governance_transition_votes')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', requestId);
    return { approved: false, totalApprovals: count ?? 0, required: req.approvals_required };
  }

  // Count total votes
  const { count: totalVotes } = await supabase
    .from('governance_transition_votes')
    .select('*', { count: 'exact', head: true })
    .eq('request_id', requestId);

  const voteCount = totalVotes ?? 0;
  const met = voteCount >= req.approvals_required;

  if (met) {
    await supabase
      .from('governance_transition_approvals')
      .update({ status: 'approved' })
      .eq('id', requestId);
  }

  return { approved: met, totalApprovals: voteCount, required: req.approvals_required };
}

/**
 * Finalize a quorum-approved transition.
 */
export async function finalizeTransition(
  requestId: string
): Promise<{ finalized: boolean; reason: string }> {
  const { data: req, error } = await supabase
    .from('governance_transition_approvals')
    .select('*')
    .eq('id', requestId)
    .single();

  if (error || !req) {
    return { finalized: false, reason: 'Request not found' };
  }

  if (req.status !== 'approved') {
    return { finalized: false, reason: `Request status is ${req.status}, not approved` };
  }

  if (new Date(req.expires_at) < new Date()) {
    await supabase.from('governance_transition_approvals').update({ status: 'expired' }).eq('id', requestId);
    return { finalized: false, reason: 'Request expired' };
  }

  // Re-validate the transition is still safe (rate limit applies here)
  const validation = await evaluateTransition(
    req.from_mode as GovernanceMode,
    req.to_mode as GovernanceMode,
    req.requested_by,
    { skipRateLimit: false }
  );

  if (!validation.allowed) {
    await supabase.from('governance_transition_approvals').update({ status: 'rejected' }).eq('id', requestId);
    return { finalized: false, reason: `Re-validation failed: ${validation.reason}` };
  }

  await commitTransition(
    req.from_mode as GovernanceMode,
    req.to_mode as GovernanceMode,
    req.requested_by
  );

  return { finalized: true, reason: 'Transition committed' };
}

/**
 * Get recent transition log from DB.
 */
export async function getTransitionLog(limit = 20): Promise<Array<{ from_mode: string; to_mode: string; actor: string; created_at: string }>> {
  try {
    const { data } = await supabase
      .from('governance_transition_log')
      .select('from_mode, to_mode, actor, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data as any[]) || [];
  } catch {
    return [];
  }
}

/**
 * Get pending quorum requests with normalized vote counts.
 */
export async function getPendingApprovals(): Promise<TransitionRequest[]> {
  try {
    const { data } = await supabase
      .from('governance_transition_approvals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    const results: TransitionRequest[] = [];
    for (const r of (data as any[]) || []) {
      // Get vote count from normalized table
      const { count } = await supabase
        .from('governance_transition_votes')
        .select('*', { count: 'exact', head: true })
        .eq('request_id', r.id);

      results.push({
        id: r.id,
        fromMode: r.from_mode,
        toMode: r.to_mode,
        requestedBy: r.requested_by,
        requiresQuorum: true,
        status: r.status,
        approvalsRequired: r.approvals_required,
        approvals: [], // Legacy field — use voteCount instead
        expiresAt: r.expires_at,
        voteCount: count ?? 0,
      });
    }
    return results;
  } catch {
    return [];
  }
}

/** Legacy compat — deprecated, use evaluateTransition */
export const validateTransition = evaluateTransition;

/** Legacy compat */
export function resetTransitionHistory(): void {
  // No-op — history is DB-backed now
}
