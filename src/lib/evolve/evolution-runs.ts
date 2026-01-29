/**
 * Evolution Runs — Single Source of Truth for Evolution State
 * v0.7.5 — Deterministic, auditable evolution lifecycle
 */

import { supabase } from '@/integrations/supabase/client';
import { emitEvolveEvent } from './telemetry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type EvolutionPhase = 
  | 'planning' 
  | 'shadow_applied' 
  | 'production_applied' 
  | 'verified' 
  | 'aborted' 
  | 'failed';

export type EvolutionInitiator = 'system' | 'human';
export type EvolutionRiskLevel = 'low' | 'medium' | 'high';

export interface EvolutionRun {
  run_id: string;
  plan_id: string;
  phase: EvolutionPhase;
  initiated_by: EvolutionInitiator;
  confidence_score: number | null;
  risk_level: EvolutionRiskLevel;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  receipt_id: string | null;
  metadata: Record<string, unknown>;
}

export interface CreateRunOptions {
  plan_id: string;
  initiated_by?: EvolutionInitiator;
  confidence_score?: number;
  risk_level?: EvolutionRiskLevel;
  metadata?: Record<string, unknown>;
}

// Phase order for validation
const PHASE_ORDER: Record<EvolutionPhase, number> = {
  planning: 1,
  shadow_applied: 2,
  production_applied: 3,
  verified: 4,
  aborted: 99,
  failed: 99,
};

// ═══════════════════════════════════════════════════════════════
// EVOLUTION RUN MANAGER
// ═══════════════════════════════════════════════════════════════

class EvolutionRunManager {
  /**
   * Get the current active evolution run (if any)
   */
  async getActiveRun(): Promise<EvolutionRun | null> {
    const { data, error } = await supabase
      .from('evolution_runs')
      .select('*')
      .not('phase', 'in', '("verified","aborted","failed")')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[Evolution] Failed to get active run:', error);
      return null;
    }

    if (!data) return null;

    return this.mapToEvolutionRun(data as Record<string, unknown>);
  }

  /**
   * Map database row to EvolutionRun
   */
  private mapToEvolutionRun(data: Record<string, unknown>): EvolutionRun {
    return {
      run_id: data.run_id as string,
      plan_id: data.plan_id as string,
      phase: data.phase as EvolutionPhase,
      initiated_by: data.initiated_by as EvolutionInitiator,
      confidence_score: data.confidence_score as number | null,
      risk_level: (data.risk_level || 'medium') as EvolutionRiskLevel,
      created_at: data.created_at as string,
      updated_at: data.updated_at as string,
      completed_at: data.completed_at as string | null,
      receipt_id: data.receipt_id as string | null,
      metadata: (data.metadata || {}) as Record<string, unknown>,
    };
  }

  /**
   * Create a new evolution run
   * Fails if another active run exists
   */
  async createRun(options: CreateRunOptions): Promise<{ success: boolean; run?: EvolutionRun; error?: string }> {
    // Check for existing active run
    const activeRun = await this.getActiveRun();
    if (activeRun) {
      return {
        success: false,
        error: `Active evolution run exists: ${activeRun.run_id} (phase: ${activeRun.phase})`,
      };
    }

    // Use type assertion for insert since types may not be regenerated yet
    const insertData = {
      plan_id: options.plan_id,
      initiated_by: options.initiated_by || 'system',
      confidence_score: options.confidence_score,
      risk_level: options.risk_level || 'medium',
      metadata: options.metadata || {},
      phase: 'planning',
    };

    const { data, error } = await supabase
      .from('evolution_runs')
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      console.error('[Evolution] Failed to create run:', error);
      return { success: false, error: error.message };
    }

    const run = this.mapToEvolutionRun(data as Record<string, unknown>);

    emitEvolveEvent('evolution_run_created', {
      run_id: run.run_id,
      plan_id: run.plan_id,
    });

    return { success: true, run };
  }

  /**
   * Get a specific run by ID
   */
  async getRun(run_id: string): Promise<EvolutionRun | null> {
    const { data, error } = await supabase
      .from('evolution_runs')
      .select('*')
      .eq('run_id', run_id)
      .single();

    if (error) {
      console.error('[Evolution] Failed to get run:', error);
      return null;
    }

    return this.mapToEvolutionRun(data as Record<string, unknown>);
  }

  /**
   * Transition to a new phase with validation
   */
  async transitionPhase(
    run_id: string, 
    newPhase: EvolutionPhase,
    metadata?: Record<string, unknown>
  ): Promise<{ success: boolean; run?: EvolutionRun; error?: string }> {
    const run = await this.getRun(run_id);
    if (!run) {
      return { success: false, error: 'Run not found' };
    }

    // Validate transition
    const validation = this.validateTransition(run.phase, newPhase);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Idempotency: if already in this phase, return success
    if (run.phase === newPhase) {
      return { success: true, run };
    }

    const updateData: Record<string, unknown> = {
      phase: newPhase,
      updated_at: new Date().toISOString(),
    };

    // Mark completion for terminal phases
    if (['verified', 'aborted', 'failed'].includes(newPhase)) {
      updateData.completed_at = new Date().toISOString();
    }

    if (metadata) {
      updateData.metadata = { ...run.metadata, ...metadata };
    }

    const { data, error } = await supabase
      .from('evolution_runs')
      .update(updateData as never)
      .eq('run_id', run_id)
      .select()
      .single();

    if (error) {
      console.error('[Evolution] Failed to transition phase:', error);
      return { success: false, error: error.message };
    }

    const updatedRun = this.mapToEvolutionRun(data as Record<string, unknown>);

    emitEvolveEvent('evolution_phase_changed', {
      run_id,
      from_phase: run.phase,
      to_phase: newPhase,
    });

    return { success: true, run: updatedRun };
  }

  /**
   * Validate phase transition
   */
  validateTransition(from: EvolutionPhase, to: EvolutionPhase): { valid: boolean; error?: string } {
    // Terminal phases can be reached from anywhere
    if (to === 'aborted' || to === 'failed') {
      return { valid: true };
    }

    // Cannot transition from terminal phases
    if (from === 'verified' || from === 'aborted' || from === 'failed') {
      return { valid: false, error: `Cannot transition from terminal phase: ${from}` };
    }

    const fromOrder = PHASE_ORDER[from];
    const toOrder = PHASE_ORDER[to];

    // Cannot go backwards
    if (toOrder < fromOrder) {
      return { valid: false, error: `Cannot go backwards: ${from} → ${to}` };
    }

    // Cannot skip phases
    if (toOrder > fromOrder + 1) {
      return { valid: false, error: `Cannot skip phases: ${from} → ${to}` };
    }

    return { valid: true };
  }

  /**
   * Get all runs (for jobs command)
   */
  async getAllRuns(limit = 20): Promise<EvolutionRun[]> {
    const { data, error } = await supabase
      .from('evolution_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Evolution] Failed to get runs:', error);
      return [];
    }

    return (data || []).map(row => this.mapToEvolutionRun(row as Record<string, unknown>));
  }

  /**
   * Abort a run
   */
  async abortRun(run_id: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    const result = await this.transitionPhase(run_id, 'aborted', { abort_reason: reason });
    if (result.success) {
      emitEvolveEvent('evolution_run_aborted', { run_id, reason });
    }
    return result;
  }

  /**
   * Mark a run as failed
   */
  async failRun(run_id: string, error_message: string): Promise<{ success: boolean; error?: string }> {
    const result = await this.transitionPhase(run_id, 'failed', { error_message });
    if (result.success) {
      emitEvolveEvent('evolution_run_failed', { run_id, error: error_message });
    }
    return result;
  }

  /**
   * Link a receipt to a run
   */
  async linkReceipt(run_id: string, receipt_id: string): Promise<boolean> {
    const { error } = await supabase
      .from('evolution_runs')
      .update({ receipt_id } as never)
      .eq('run_id', run_id);

    if (error) {
      console.error('[Evolution] Failed to link receipt:', error);
      return false;
    }

    return true;
  }
}

export const evolutionRuns = new EvolutionRunManager();
