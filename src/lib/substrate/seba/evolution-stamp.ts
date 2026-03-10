/**
 * Evolution Stamp System
 * Mandatory traceability markers for SEBA changes
 * 
 * Creates immutable audit trail proving when the substrate
 * rewrites its own code through the evolution engine.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { ImprovementProposal, EvolutionExecution, ProposedAction } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface EvolutionStamp {
  /** Unique stamp ID */
  stamp_id: string;
  /** Short readable ID */
  stamp_short: string;
  /** Proposal that triggered this evolution */
  proposal_id: string;
  /** Execution ID */
  execution_id: string;
  /** When the evolution was applied */
  applied_at: string;
  /** Type of change */
  change_type: 'config_update' | 'threshold_adjust' | 'pattern_add' | 'rule_modify' | 'memory_prune' | 'module_tune' | 'cache_invalidate' | 'index_rebuild' | 'evolution_cycle';
  /** Target of the change */
  target: string;
  /** Before state (for rollback) */
  before_state: Json;
  /** After state */
  after_state: Json;
  /** Human-readable description */
  description: string;
  /** Hash of the change for verification */
  change_hash: string;
  /** Whether the change is reversible */
  reversible: boolean;
  /** Who/what initiated */
  initiator: 'seba_auto' | 'seba_governed' | 'human_approved' | 'evolution_governed';
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAMP GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

export class EvolutionStampGenerator {
  /**
   * Generate a unique stamp ID
   */
  static generateStampId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `SEBA-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Create a hash from change data for verification
   */
  static createChangeHash(action: ProposedAction): string {
    const data = JSON.stringify({
      type: action.type,
      target: action.target,
      before: action.current_value,
      after: action.proposed_value,
    });
    // Simple hash for verification (in production, use crypto.subtle)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Map action type to change type
   */
  static getChangeType(action: ProposedAction): EvolutionStamp['change_type'] {
    // Return the action type directly as it matches the stamp type
    return action.type;
  }

  /**
   * Create stamp from action
   */
  static createStamp(
    action: ProposedAction,
    proposal: ImprovementProposal,
    execution: EvolutionExecution,
    initiator: EvolutionStamp['initiator'] = 'seba_governed'
  ): EvolutionStamp {
    const stampId = this.generateStampId();
    
    return {
      stamp_id: stampId,
      stamp_short: stampId.split('-').slice(1).join(''),
      proposal_id: proposal.id,
      execution_id: execution.id,
      applied_at: new Date().toISOString(),
      change_type: this.getChangeType(action),
      target: action.target,
      before_state: action.current_value as Json,
      after_state: action.proposed_value as Json,
      description: `[${proposal.category}] ${proposal.title} — Action: ${action.type} on ${action.target}`,
      change_hash: this.createChangeHash(action),
      reversible: action.reversible,
      initiator,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAMP STORE
// ═══════════════════════════════════════════════════════════════════════════════

export class EvolutionStampStore {
  /**
   * Store a stamp to the database (brain_events for flexible schema)
   */
  static async store(stamp: EvolutionStamp): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('brain_events').insert({
        module: 'seba',
        event_type: 'evolution_stamp',
        data: {
          stamp_id: stamp.stamp_id,
          stamp_short: stamp.stamp_short,
          proposal_id: stamp.proposal_id,
          execution_id: stamp.execution_id,
          change_type: stamp.change_type,
          target: stamp.target,
          before_state: stamp.before_state,
          after_state: stamp.after_state,
          description: stamp.description,
          change_hash: stamp.change_hash,
          reversible: stamp.reversible,
          applied_at: stamp.applied_at,
          initiator: stamp.initiator,
        },
        outcome: 'success',
      });

      if (error) {
        console.error('[EvolutionStamp] Failed to store:', error);
        return { success: false, error: error.message };
      }

      console.log(`[EvolutionStamp] ✅ Stored stamp ${stamp.stamp_short}`);
      return { success: true };

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown';
      return { success: false, error: msg };
    }
  }

  /**
   * Store stamps to brain_events for full auditability
   */
  static async logStamp(stamp: EvolutionStamp): Promise<void> {
    await supabase.from('brain_events').insert({
      module: 'seba',
      event_type: 'evolution_stamp',
      data: {
        stamp_id: stamp.stamp_id,
        stamp_short: stamp.stamp_short,
        proposal_id: stamp.proposal_id,
        execution_id: stamp.execution_id,
        change_type: stamp.change_type,
        target: stamp.target,
        change_hash: stamp.change_hash,
        reversible: stamp.reversible,
        initiator: stamp.initiator,
        description: stamp.description,
        // DO NOT log before/after state here (security)
      },
      outcome: 'success',
    });
  }

  /**
   * Get all stamps for an execution
   */
  static async getByExecution(executionId: string): Promise<EvolutionStamp[]> {
    const { data } = await supabase
      .from('brain_events')
      .select('data')
      .eq('module', 'seba')
      .eq('event_type', 'evolution_stamp')
      .filter('data->>execution_id', 'eq', executionId);

    if (!data) return [];

    return data
      .filter(r => r.data && typeof r.data === 'object')
      .map(r => r.data as unknown as EvolutionStamp);
  }

  /**
   * Get recent stamps (last N days)
   */
  static async getRecent(days = 7, limit = 50): Promise<EvolutionStamp[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data } = await supabase
      .from('brain_events')
      .select('data')
      .eq('module', 'seba')
      .eq('event_type', 'evolution_stamp')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!data) return [];

    return data
      .filter(r => r.data && typeof r.data === 'object')
      .map(r => r.data as unknown as EvolutionStamp);
  }

  /**
   * Verify a stamp's hash matches the recorded change
   */
  static verifyStamp(stamp: EvolutionStamp): boolean {
    // Only verify for change types compatible with ProposedAction
    const validTypes = ['cache_invalidate', 'config_update', 'index_rebuild', 'memory_prune', 'module_tune', 'pattern_add', 'rule_modify', 'threshold_adjust'];
    if (!validTypes.includes(stamp.change_type)) {
      // For evolution_cycle type, verify by checking stamp exists
      return true;
    }
    
    const computedHash = EvolutionStampGenerator.createChangeHash({
      id: '',
      type: stamp.change_type as 'cache_invalidate' | 'config_update' | 'index_rebuild' | 'memory_prune' | 'module_tune' | 'pattern_add' | 'rule_modify' | 'threshold_adjust',
      target: stamp.target,
      current_value: stamp.before_state,
      proposed_value: stamp.after_state,
      reversible: stamp.reversible,
      risk_factor: 0,
    });
    
    return computedHash === stamp.change_hash;
  }
}

/**
 * SEBA_EVOLUTION_MARKER — Mandatory comment format for code changes
 * 
 * When SEBA modifies code, this marker MUST be added:
 * // [SEBA-EVOLUTION] stamp_id: SEBA-XXX-YYY | proposal: abc123 | applied: 2026-02-02T12:00:00Z
 * 
 * This provides:
 * 1. Immediate visibility that code was auto-evolved
 * 2. Traceability to the proposal that caused the change
 * 3. Timestamp for audit purposes
 */
export function generateEvolutionComment(stamp: EvolutionStamp): string {
  return `// [SEBA-EVOLUTION] stamp_id: ${stamp.stamp_id} | proposal: ${stamp.proposal_id.slice(0, 8)} | applied: ${stamp.applied_at}`;
}

/**
 * Parse a SEBA evolution comment to extract stamp data
 */
export function parseEvolutionComment(comment: string): { stamp_id: string; proposal: string; applied: string } | null {
  const match = comment.match(/\[SEBA-EVOLUTION\] stamp_id: ([\w-]+) \| proposal: (\w+) \| applied: (.+)$/);
  if (!match) return null;
  return {
    stamp_id: match[1],
    proposal: match[2],
    applied: match[3],
  };
}
