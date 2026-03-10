/**
 * DEFENSE Guardrail — Proposed Defense Adjustments Store
 * 
 * In-memory bounded store for proposed rule/threshold adjustments.
 * No proposal may directly mutate live defense config.
 * All mutations flow: anomaly → proposal → shadow → approval → apply.
 */

import type { ProposedAdjustment, ProposalStatus, ProposalCategory, PromotionGateResult } from './types';
import { guardrailLog } from './logger';

// ── Bounds ──────────────────────────────────────────────────────
const MAX_PROPOSALS = 200;
const DEFAULT_EVALUATION_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const DEFAULT_MIN_CONFIRMATIONS = 3;
const DEFAULT_MIN_SAMPLE_SIZE = 20;

// ── Store ───────────────────────────────────────────────────────
const proposals = new Map<string, ProposedAdjustment>();

let evaluationWindowMs = DEFAULT_EVALUATION_WINDOW_MS;

// ── Helpers ─────────────────────────────────────────────────────
function generateId(): string {
  return `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function evictOldest(): void {
  if (proposals.size <= MAX_PROPOSALS) return;
  // Evict oldest expired first, then oldest proposed
  const sorted = [...proposals.values()].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const toRemove = sorted.slice(0, proposals.size - MAX_PROPOSALS + 1);
  for (const p of toRemove) {
    proposals.delete(p.id);
  }
}

function expireStale(): void {
  const now = Date.now();
  for (const [id, p] of proposals) {
    if (
      (p.status === 'proposed' || p.status === 'shadow_testing') &&
      new Date(p.expires_at).getTime() < now
    ) {
      p.status = 'expired';
      p.updated_at = new Date().toISOString();
      guardrailLog('proposal_expired', {
        proposal_id: id,
        reason: 'Evaluation window elapsed',
        previous_value: p.previous_value,
        proposed_value: p.proposed_value,
      });
    }
  }
}

// ── Public API ──────────────────────────────────────────────────

/**
 * Create a new proposed adjustment.
 * Returns the proposal ID. Does NOT mutate any live config.
 */
export function createProposal(params: {
  category: ProposalCategory;
  target: string;
  previous_value: unknown;
  proposed_value: unknown;
  reason: string;
  confidence: number;
  sample_size: number;
  source_signal_ids: string[];
  min_confirmations?: number;
  min_sample_size?: number;
}): string {
  expireStale();
  evictOldest();

  // Validate inputs
  const confidence = Math.max(0, Math.min(1, params.confidence));
  const sampleSize = Math.max(0, Math.min(100000, params.sample_size));

  // Check for existing proposal on same target — increment confirmation instead of duplicating
  for (const existing of proposals.values()) {
    if (
      existing.target === params.target &&
      existing.category === params.category &&
      (existing.status === 'proposed' || existing.status === 'shadow_testing')
    ) {
      existing.confirmation_count += 1;
      existing.sample_size = Math.max(existing.sample_size, sampleSize);
      existing.confidence = Math.max(existing.confidence, confidence);
      existing.updated_at = new Date().toISOString();
      existing.source_signal_ids = [
        ...new Set([...existing.source_signal_ids, ...params.source_signal_ids]),
      ].slice(0, 50); // bound signal refs

      guardrailLog('proposal_confirmed', {
        proposal_id: existing.id,
        reason: `Confirmation ${existing.confirmation_count}/${existing.min_confirmations}`,
        proposed_value: params.proposed_value,
        metadata: { confidence, sample_size: sampleSize },
      });
      return existing.id;
    }
  }

  const now = new Date();
  const id = generateId();
  const proposal: ProposedAdjustment = {
    id,
    category: params.category,
    status: 'proposed',
    target: params.target,
    previous_value: params.previous_value,
    proposed_value: params.proposed_value,
    reason: (params.reason || '').substring(0, 1024),
    confidence,
    confirmation_count: 1,
    min_confirmations: params.min_confirmations ?? DEFAULT_MIN_CONFIRMATIONS,
    sample_size: sampleSize,
    min_sample_size: params.min_sample_size ?? DEFAULT_MIN_SAMPLE_SIZE,
    created_at: now.toISOString(),
    expires_at: new Date(now.getTime() + evaluationWindowMs).toISOString(),
    updated_at: now.toISOString(),
    source_signal_ids: params.source_signal_ids.slice(0, 50),
  };

  proposals.set(id, proposal);

  guardrailLog('proposal_created', {
    proposal_id: id,
    previous_value: params.previous_value,
    proposed_value: params.proposed_value,
    reason: proposal.reason,
    metadata: { category: params.category, target: params.target, confidence },
  });

  return id;
}

/**
 * Promotion gate — checks whether a proposal meets all requirements to advance.
 * Does NOT mutate live config even if gate passes.
 */
export function checkPromotionGate(proposalId: string): PromotionGateResult {
  expireStale();

  const p = proposals.get(proposalId);
  if (!p) return { can_promote: false, reasons: ['Proposal not found'] };

  const reasons: string[] = [];

  if (p.status === 'expired') reasons.push('Proposal has expired');
  if (p.status === 'rejected') reasons.push('Proposal was rejected');
  if (p.status === 'approved') reasons.push('Already approved');

  if (p.status !== 'proposed' && p.status !== 'shadow_testing') {
    return { can_promote: false, reasons };
  }

  if (p.confirmation_count < p.min_confirmations) {
    reasons.push(
      `Insufficient confirmations: ${p.confirmation_count}/${p.min_confirmations}`
    );
  }

  if (p.sample_size < p.min_sample_size) {
    reasons.push(
      `Insufficient sample size: ${p.sample_size}/${p.min_sample_size}`
    );
  }

  // Spike check — imported at Phase 3, stub for now
  if (isSpikeActive()) {
    reasons.push('Traffic spike active — promotions frozen');
  }

  return {
    can_promote: reasons.length === 0,
    reasons,
  };
}

/**
 * Transition proposal status (with validation).
 */
export function transitionProposal(
  proposalId: string,
  newStatus: ProposalStatus,
  resolvedBy?: string
): boolean {
  const p = proposals.get(proposalId);
  if (!p) return false;

  // Valid transitions
  const validTransitions: Record<ProposalStatus, ProposalStatus[]> = {
    proposed: ['shadow_testing', 'rejected', 'expired'],
    shadow_testing: ['approved', 'rejected', 'expired'],
    approved: [], // terminal
    rejected: [], // terminal
    expired: [],  // terminal
  };

  if (!validTransitions[p.status]?.includes(newStatus)) {
    guardrailLog('proposal_transition_blocked', {
      proposal_id: proposalId,
      reason: `Invalid transition: ${p.status} → ${newStatus}`,
      previous_value: p.status,
      proposed_value: newStatus,
    });
    return false;
  }

  const oldStatus = p.status;
  p.status = newStatus;
  p.updated_at = new Date().toISOString();

  if (newStatus === 'approved' || newStatus === 'rejected') {
    p.resolved_by = resolvedBy ?? 'system';
    p.resolved_at = new Date().toISOString();
  }

  guardrailLog(
    newStatus === 'approved' ? 'proposal_promoted' :
    newStatus === 'rejected' ? 'proposal_rejected' :
    `proposal_status_change`,
    {
      proposal_id: proposalId,
      previous_value: oldStatus,
      final_value: newStatus,
      reason: resolvedBy ? `Resolved by ${resolvedBy}` : 'System transition',
    }
  );

  return true;
}

/**
 * Get all proposals, optionally filtered.
 */
export function getProposals(filter?: {
  status?: ProposalStatus;
  category?: ProposalCategory;
}): ProposedAdjustment[] {
  expireStale();
  const results: ProposedAdjustment[] = [];
  for (const p of proposals.values()) {
    if (filter?.status && p.status !== filter.status) continue;
    if (filter?.category && p.category !== filter.category) continue;
    results.push({ ...p });
  }
  return results.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Get a single proposal by ID.
 */
export function getProposal(id: string): ProposedAdjustment | null {
  expireStale();
  const p = proposals.get(id);
  return p ? { ...p } : null;
}

/**
 * Configure evaluation window duration.
 */
export function setEvaluationWindow(ms: number): void {
  evaluationWindowMs = Math.max(60_000, Math.min(24 * 60 * 60 * 1000, ms)); // 1min – 24h
}

/**
 * Get store stats.
 */
export function getProposalStats() {
  expireStale();
  const all = [...proposals.values()];
  return {
    total: all.length,
    proposed: all.filter(p => p.status === 'proposed').length,
    shadow_testing: all.filter(p => p.status === 'shadow_testing').length,
    approved: all.filter(p => p.status === 'approved').length,
    rejected: all.filter(p => p.status === 'rejected').length,
    expired: all.filter(p => p.status === 'expired').length,
    max_capacity: MAX_PROPOSALS,
    evaluation_window_ms: evaluationWindowMs,
  };
}

/**
 * Clear all proposals (admin/testing only).
 */
export function clearProposals(): void {
  proposals.clear();
}

// ── Spike detection — rate-based traffic analysis ─────────────────
const SPIKE_WINDOW_MS = 60_000; // 1 minute sliding window
const SPIKE_THRESHOLD = 50;     // requests per window to trigger spike
const requestTimestamps: number[] = [];

export function recordRequest(): void {
  const now = Date.now();
  requestTimestamps.push(now);
  // Evict entries outside the window
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - SPIKE_WINDOW_MS) {
    requestTimestamps.shift();
  }
}

export function setSpikeActive(active: boolean): void {
  // Manual override — force spike state for governance freeze
  _spikeOverride = active;
}

let _spikeOverride: boolean | null = null;

export function isSpikeActive(): boolean {
  if (_spikeOverride !== null) return _spikeOverride;
  const now = Date.now();
  const recentCount = requestTimestamps.filter(t => t >= now - SPIKE_WINDOW_MS).length;
  return recentCount >= SPIKE_THRESHOLD;
}

export function resetSpikeOverride(): void {
  _spikeOverride = null;
}

export function getSpikeStats() {
  const now = Date.now();
  const recentCount = requestTimestamps.filter(t => t >= now - SPIKE_WINDOW_MS).length;
  return {
    requestsInWindow: recentCount,
    threshold: SPIKE_THRESHOLD,
    windowMs: SPIKE_WINDOW_MS,
    isSpike: isSpikeActive(),
    hasOverride: _spikeOverride !== null,
  };
}
