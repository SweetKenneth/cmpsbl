/**
 * Encoded Production Pipeline
 * 
 * Graduates shadow practice wins into governed proposals.
 * Pipeline: Shadow Win → Validate → Propose → Review Gate → Merge
 * 
 * Only high-scoring, guard-passing practice results are eligible.
 * All proposals require human approval before any code is committed.
 */

import { supabase } from '@/integrations/supabase/client';
import { type PracticeResult, type ShadowPracticeState } from './shadow-practice';
import { runEncodedGuard } from './guard';
import { getOverallMastery } from './feedback-loop';
import { secureGet, secureSet } from '@/lib/system/secureStorage';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ProductionProposal {
  id: string;
  source: 'shadow_practice' | 'manual' | 'seba_collaboration';
  file_path: string;
  original_code: string;
  proposed_code: string;
  task_type: string;
  score: number;
  patterns_applied: string[];
  rationale: string;
  predicted_impact: PredictedImpact;
  status: ProposalStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
}

export type ProposalStatus =
  | 'pending_validation'   // Awaiting secondary guard check
  | 'pending_review'       // Passed validation, awaiting human review
  | 'approved'             // Human approved, ready to apply
  | 'applied'              // Code has been committed
  | 'rejected'             // Human rejected
  | 'expired';             // Too old, auto-expired

export interface PredictedImpact {
  type_safety: number;      // -10 to +10
  performance: number;       // -10 to +10
  maintainability: number;   // -10 to +10
  security: number;          // -10 to +10
  net_lines_changed: number;
  confidence: number;        // 0-1
}

export interface PipelineConfig {
  minScoreForPromotion: number;     // Minimum shadow practice score (default: 85)
  minMasteryForProposal: number;    // Minimum mastery level (default: 60)
  maxPendingProposals: number;      // Cap on pending proposals (default: 10)
  proposalTTLHours: number;         // Auto-expire after N hours (default: 72)
  requireDoubleGuard: boolean;      // Run guard twice with stricter settings (default: true)
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'encoded_production_proposals';
const DEFAULT_CONFIG: PipelineConfig = {
  minScoreForPromotion: 85,
  minMasteryForProposal: 60,
  maxPendingProposals: 10,
  proposalTTLHours: 72,
  requireDoubleGuard: true,
};

// ═══════════════════════════════════════════════════════════════
// PIPELINE ENGINE
// ═══════════════════════════════════════════════════════════════

class ProductionPipeline {
  private static instance: ProductionPipeline;
  private proposals: ProductionProposal[] = [];
  private config: PipelineConfig;
  private loaded = false;

  private constructor(config?: Partial<PipelineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(): ProductionPipeline {
    if (!ProductionPipeline.instance) {
      ProductionPipeline.instance = new ProductionPipeline();
    }
    return ProductionPipeline.instance;
  }

  // ─── PROMOTION ──────────────────────────────────────────────

  /**
   * Evaluate a shadow practice result for promotion to production proposal.
   * Returns the proposal if promoted, null if not eligible.
   */
  async promoteFromShadow(result: PracticeResult, generatedCode: string): Promise<ProductionProposal | null> {
    this.ensureLoaded();

    // Gate 1: Score check
    if (result.score < this.config.minScoreForPromotion) {
      return null;
    }

    // Gate 2: Must have passed guard
    if (!result.passed_guard) {
      return null;
    }

    // Gate 3: Mastery check
    const mastery = getOverallMastery();
    if (mastery < this.config.minMasteryForProposal) {
      return null;
    }

    // Gate 4: Pending proposal cap
    const pendingCount = this.proposals.filter(p => 
      p.status === 'pending_review' || p.status === 'pending_validation'
    ).length;
    if (pendingCount >= this.config.maxPendingProposals) {
      return null;
    }

    // Gate 5: Double guard (stricter validation)
    if (this.config.requireDoubleGuard) {
      const secondGuard = runEncodedGuard(
        result.task.original_code,
        generatedCode,
        false,
        result.task.file_path
      );
      if (!secondGuard.ok) {
        return null;
      }
    }

    // All gates passed — create proposal
    const proposal: ProductionProposal = {
      id: `prop-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      source: 'shadow_practice',
      file_path: result.task.file_path,
      original_code: result.task.original_code,
      proposed_code: generatedCode,
      task_type: result.task.task_type,
      score: result.score,
      patterns_applied: result.patterns_applied,
      rationale: this.buildRationale(result),
      predicted_impact: this.predictImpact(result, generatedCode),
      status: 'pending_review',
      created_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null,
      rejection_reason: null,
    };

    this.proposals.push(proposal);
    this.persist();

    // Log to brain_events
    await supabase.from('brain_events').insert([{
      module: 'encoded',
      event_type: 'production_proposal_created',
      data: {
        proposal_id: proposal.id,
        file_path: proposal.file_path,
        task_type: proposal.task_type,
        score: proposal.score,
        predicted_impact: proposal.predicted_impact,
      } as any,
    }]).then(() => {});

    console.log(`[Production Pipeline] 📋 Proposal ${proposal.id} created for ${proposal.file_path}`);
    return proposal;
  }

  // ─── REVIEW ACTIONS ─────────────────────────────────────────

  /**
   * Approve a pending proposal (human action)
   */
  approve(proposalId: string, reviewerName: string = 'Governor'): ProductionProposal | null {
    this.ensureLoaded();
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (!proposal || proposal.status !== 'pending_review') return null;

    proposal.status = 'approved';
    proposal.reviewed_at = new Date().toISOString();
    proposal.reviewed_by = reviewerName;
    this.persist();
    return proposal;
  }

  /**
   * Reject a pending proposal (human action)
   */
  reject(proposalId: string, reason: string, reviewerName: string = 'Governor'): ProductionProposal | null {
    this.ensureLoaded();
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (!proposal || proposal.status !== 'pending_review') return null;

    proposal.status = 'rejected';
    proposal.reviewed_at = new Date().toISOString();
    proposal.reviewed_by = reviewerName;
    proposal.rejection_reason = reason;
    this.persist();
    return proposal;
  }

  /**
   * Mark a proposal as applied (after code is committed)
   */
  markApplied(proposalId: string): ProductionProposal | null {
    this.ensureLoaded();
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (!proposal || proposal.status !== 'approved') return null;

    proposal.status = 'applied';
    this.persist();
    return proposal;
  }

  // ─── QUERIES ────────────────────────────────────────────────

  getPending(): ProductionProposal[] {
    this.ensureLoaded();
    this.expireOldProposals();
    return this.proposals.filter(p => p.status === 'pending_review');
  }

  getApproved(): ProductionProposal[] {
    this.ensureLoaded();
    return this.proposals.filter(p => p.status === 'approved');
  }

  getAll(): ProductionProposal[] {
    this.ensureLoaded();
    return [...this.proposals];
  }

  getProposal(id: string): ProductionProposal | null {
    this.ensureLoaded();
    return this.proposals.find(p => p.id === id) || null;
  }

  getStats(): { total: number; pending: number; approved: number; applied: number; rejected: number; expired: number; avgScore: number } {
    this.ensureLoaded();
    const total = this.proposals.length;
    return {
      total,
      pending: this.proposals.filter(p => p.status === 'pending_review').length,
      approved: this.proposals.filter(p => p.status === 'approved').length,
      applied: this.proposals.filter(p => p.status === 'applied').length,
      rejected: this.proposals.filter(p => p.status === 'rejected').length,
      expired: this.proposals.filter(p => p.status === 'expired').length,
      avgScore: total > 0 ? Math.round(this.proposals.reduce((s, p) => s + p.score, 0) / total) : 0,
    };
  }

  // ─── INTERNALS ──────────────────────────────────────────────

  private buildRationale(result: PracticeResult): string {
    const parts: string[] = [];
    parts.push(`Task: ${result.task.task_type} on ${result.task.file_path}`);
    parts.push(`Score: ${result.score}/100`);
    if (result.patterns_applied.length > 0) {
      parts.push(`Patterns: ${result.patterns_applied.join(', ')}`);
    }
    if (result.lessons_learned.length > 0) {
      parts.push(`Insights: ${result.lessons_learned[0]}`);
    }
    return parts.join(' | ');
  }

  private predictImpact(result: PracticeResult, code: string): PredictedImpact {
    const linesDiff = code.split('\n').length - result.task.original_code.split('\n').length;
    
    return {
      type_safety: result.task.task_type === 'add_types' ? 5 : 1,
      performance: result.task.task_type === 'performance' ? 4 : 0,
      maintainability: result.task.task_type === 'refactor' ? 6 : 2,
      security: result.task.task_type === 'security' ? 7 : 0,
      net_lines_changed: linesDiff,
      confidence: Math.min(1, result.score / 100),
    };
  }

  private expireOldProposals(): void {
    const cutoff = Date.now() - (this.config.proposalTTLHours * 3600_000);
    let changed = false;
    for (const p of this.proposals) {
      if (p.status === 'pending_review' && new Date(p.created_at).getTime() < cutoff) {
        p.status = 'expired';
        changed = true;
      }
    }
    if (changed) this.persist();
  }

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const data = secureGet<typeof this.proposals>(STORAGE_KEY);
      if (data) this.proposals = data.slice(-100); // Cap in-memory too
    } catch { this.proposals = []; }
  }

  private persist(): void {
    try {
      // Keep only last 100 proposals
      const trimmed = this.proposals.slice(-100);
      secureSet(STORAGE_KEY, trimmed);
    } catch { /* Storage pressure — non-critical proposal history */ }
  }
}

export const productionPipeline = ProductionPipeline.getInstance();
