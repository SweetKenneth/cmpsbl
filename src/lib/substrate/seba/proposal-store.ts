/**
 * SEBA Proposal Store
 * Persistent storage for evolution proposals
 * 
 * Ensures all SEBA proposals are stored in evolution_proposals table
 * so Atlas can retrieve and display them for human review/approval.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { ImprovementProposal, GovernanceDecision } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface StoredProposal {
  id: string;
  target_system: string;
  title: string;
  summary: string;
  suggested_change: Json;
  expected_impact: Json;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'applied' | 'rolled_back';
  diffs: Json;
  created_at: string;
  created_by: string;
  reviewer: string | null;
  reviewed_at: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROPOSAL STORE
// ═══════════════════════════════════════════════════════════════════════════════

export class ProposalStore {
  /**
   * Store a proposal to the evolution_proposals table
   */
  static async store(proposal: ImprovementProposal): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('evolution_proposals').insert({
        id: proposal.id,
        target_system: proposal.target_modules.join(', ') || 'SUBSTRATE',
        title: proposal.title,
        summary: `${proposal.description}\n\nRationale: ${proposal.rationale}`,
        suggested_change: {
          category: proposal.category,
          actions: proposal.proposed_actions.map(a => ({
            type: a.type,
            target: a.target,
            current: a.current_value,
            proposed: a.proposed_value,
            reversible: a.reversible,
            risk_factor: a.risk_factor,
          })),
          rollback_strategy: proposal.rollback_strategy,
        } as Json,
        expected_impact: {
          impact_level: proposal.estimated_impact,
          risk_level: proposal.risk_level,
          priority: proposal.priority,
          requires_human_approval: proposal.requires_human_approval,
        } as Json,
        confidence: proposal.confidence_score,
        status: 'pending',
        diffs: {
          proposal_short_id: proposal.short_id,
          source_insight_id: proposal.source_insight_id,
          action_count: proposal.proposed_actions.length,
          reversible_count: proposal.proposed_actions.filter(a => a.reversible).length,
        } as Json,
        created_by: 'SEBA',
      });

      if (error) {
        console.error('[ProposalStore] Failed to store proposal:', error);
        return { success: false, error: error.message };
      }

      console.log(`[ProposalStore] ✅ Stored proposal ${proposal.short_id}`);
      return { success: true };

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[ProposalStore] Exception:', msg);
      return { success: false, error: msg };
    }
  }

  /**
   * Batch store multiple proposals
   */
  static async storeBatch(proposals: ImprovementProposal[]): Promise<{ stored: number; failed: number }> {
    let stored = 0;
    let failed = 0;

    for (const proposal of proposals) {
      const result = await this.store(proposal);
      if (result.success) {
        stored++;
      } else {
        failed++;
      }
    }

    return { stored, failed };
  }

  /**
   * Get pending proposals for Atlas display
   */
  static async getPending(): Promise<StoredProposal[]> {
    const { data, error } = await supabase
      .from('evolution_proposals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[ProposalStore] Failed to fetch pending:', error);
      return [];
    }

    return (data || []) as StoredProposal[];
  }

  /**
   * Get all proposals with optional status filter
   */
  static async getAll(status?: string, limit = 20): Promise<StoredProposal[]> {
    let query = supabase
      .from('evolution_proposals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[ProposalStore] Failed to fetch proposals:', error);
      return [];
    }

    return (data || []) as StoredProposal[];
  }

  /**
   * Get a single proposal by ID
   */
  static async getById(id: string): Promise<StoredProposal | null> {
    const { data, error } = await supabase
      .from('evolution_proposals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[ProposalStore] Failed to fetch proposal:', error);
      return null;
    }

    return data as StoredProposal;
  }

  /**
   * Update proposal status (approve, reject, apply, rollback)
   */
  static async updateStatus(
    id: string, 
    status: StoredProposal['status'],
    reviewer = 'ATLAS_USER'
  ): Promise<{ success: boolean; error?: string }> {
    // Use .select() to verify the update actually affected a row
    const { data, error } = await supabase
      .from('evolution_proposals')
      .update({
        status,
        reviewer,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    // If no row was returned, the update affected 0 rows
    if (!data) {
      console.warn(`[ProposalStore] ⚠ Update to ${status} matched 0 rows for id=${id}`);
      return { success: false, error: `No proposal found with id ${id}` };
    }

    console.log(`[ProposalStore] ✅ Updated proposal ${id} to ${status}`);
    return { success: true };
  }

  /**
   * Mark proposal as applied with governance decision
   */
  static async markApplied(
    id: string, 
    decision: GovernanceDecision
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('evolution_proposals')
      .update({
        status: 'applied',
        reviewer: decision.decided_by,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Mark proposal as rolled back
   */
  static async markRolledBack(
    id: string, 
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('evolution_proposals')
      .update({
        status: 'rolled_back',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    // Also log the rollback reason
    await supabase.from('brain_events').insert({
      module: 'seba',
      event_type: 'proposal_rollback',
      data: { proposal_id: id, reason },
      outcome: 'rolled_back',
    });

    return { success: true };
  }
}
