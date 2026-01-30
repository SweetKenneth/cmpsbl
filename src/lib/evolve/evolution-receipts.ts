/**
 * Evolution Receipts — Immutable Audit Trail
 * v0.7.5 — Every shadow + production apply generates a receipt
 */

import { supabase } from '@/integrations/supabase/client';
import { type EvolutionPhase } from './evolution-runs';
import { emitEvolveEvent } from './telemetry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface EvolutionReceipt {
  receipt_id: string;
  run_id: string;
  plan_id: string;
  phase: EvolutionPhase;
  changes_applied: ChangeRecord[];
  tests_run: number;
  tests_passed: number;
  health_before: HealthSnapshot | null;
  health_after: HealthSnapshot | null;
  backup_id: string | null;
  timestamp: string;
}

export interface ChangeRecord {
  file_path: string;
  operation: 'create' | 'update' | 'delete';
  diff_summary?: string;
  lines_added?: number;
  lines_removed?: number;
}

export interface HealthSnapshot {
  overall_score: number;
  module_health: Record<string, number>;
  error_count: number;
  warning_count: number;
}

export interface CreateReceiptOptions {
  run_id: string;
  plan_id: string;
  phase: EvolutionPhase;
  changes_applied: ChangeRecord[];
  tests_run?: number;
  tests_passed?: number;
  health_before?: HealthSnapshot;
  health_after?: HealthSnapshot;
  backup_id?: string;
}

// ═══════════════════════════════════════════════════════════════
// RECEIPT MANAGER
// ═══════════════════════════════════════════════════════════════

class EvolutionReceiptManager {
  /**
   * Map database row to EvolutionReceipt
   */
  private mapToReceipt(data: Record<string, unknown>): EvolutionReceipt {
    return {
      receipt_id: data.receipt_id as string,
      run_id: data.run_id as string,
      plan_id: data.plan_id as string,
      phase: data.phase as EvolutionPhase,
      changes_applied: (data.changes_applied || []) as ChangeRecord[],
      tests_run: (data.tests_run || 0) as number,
      tests_passed: (data.tests_passed || 0) as number,
      health_before: data.health_before as HealthSnapshot | null,
      health_after: data.health_after as HealthSnapshot | null,
      backup_id: data.backup_id as string | null,
      timestamp: data.timestamp as string,
    };
  }

  /**
   * Create a new receipt (immutable)
   */
  async createReceipt(options: CreateReceiptOptions): Promise<{ success: boolean; receipt?: EvolutionReceipt; error?: string }> {
    // Use type assertion for insert since types may not be regenerated yet
    const insertData = {
      run_id: options.run_id,
      plan_id: options.plan_id,
      phase: options.phase,
      changes_applied: options.changes_applied,
      tests_run: options.tests_run || 0,
      tests_passed: options.tests_passed || 0,
      health_before: options.health_before || null,
      health_after: options.health_after || null,
      backup_id: options.backup_id || null,
    };

    const { data, error } = await supabase
      .from('evolution_receipts')
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      console.error('[Receipts] Failed to create receipt:', error);
      return { success: false, error: error.message };
    }

    const receipt = this.mapToReceipt(data as Record<string, unknown>);

    emitEvolveEvent('evolution_receipt_created', {
      receipt_id: receipt.receipt_id,
      run_id: options.run_id,
      phase: options.phase,
      changes_count: options.changes_applied.length,
    });

    return { success: true, receipt };
  }

  /**
   * Get a receipt by ID
   */
  async getReceipt(receipt_id: string): Promise<EvolutionReceipt | null> {
    const { data, error } = await supabase
      .from('evolution_receipts')
      .select('*')
      .eq('receipt_id', receipt_id)
      .single();

    if (error) {
      console.error('[Receipts] Failed to get receipt:', error);
      return null;
    }

    return this.mapToReceipt(data as Record<string, unknown>);
  }

  /**
   * Get receipt by run ID
   */
  async getReceiptByRunId(run_id: string): Promise<EvolutionReceipt | null> {
    const { data, error } = await supabase
      .from('evolution_receipts')
      .select('*')
      .eq('run_id', run_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[Receipts] Failed to get receipt by run:', error);
      return null;
    }

    if (!data) return null;

    return this.mapToReceipt(data as Record<string, unknown>);
  }

  /**
   * Get all receipts for a run
   */
  async getReceiptsForRun(run_id: string): Promise<EvolutionReceipt[]> {
    const { data, error } = await supabase
      .from('evolution_receipts')
      .select('*')
      .eq('run_id', run_id)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('[Receipts] Failed to get receipts for run:', error);
      return [];
    }

    return (data || []).map(row => this.mapToReceipt(row as Record<string, unknown>));
  }

  /**
   * Get recent receipts
   */
  async getRecentReceipts(limit = 20): Promise<EvolutionReceipt[]> {
    const { data, error } = await supabase
      .from('evolution_receipts')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Receipts] Failed to get recent receipts:', error);
      return [];
    }

    return (data || []).map(row => this.mapToReceipt(row as Record<string, unknown>));
  }

  /**
   * Format receipt for display
   */
  formatReceipt(receipt: EvolutionReceipt): string {
    const lines = [
      `╔══════════════════════════════════════════════════════════════════════════╗`,
      `║  EVOLUTION RECEIPT 🔥                                                    ║`,
      `╠══════════════════════════════════════════════════════════════════════════╣`,
      `║  Receipt ID: ${receipt.receipt_id}`,
      `║  Run ID:     ${receipt.run_id}`,
      `║  Phase:      ${receipt.phase}`,
      `║  Timestamp:  ${new Date(receipt.timestamp).toISOString()}`,
      `╠══════════════════════════════════════════════════════════════════════════╣`,
      `║  Changes Applied: ${receipt.changes_applied.length}`,
      `║  Tests Run:       ${receipt.tests_run}`,
      `║  Tests Passed:    ${receipt.tests_passed}`,
    ];

    if (receipt.backup_id) {
      lines.push(`║  Backup ID:       ${receipt.backup_id}`);
    }

    if (receipt.health_before && receipt.health_after) {
      lines.push(`╠══════════════════════════════════════════════════════════════════════════╣`);
      lines.push(`║  Health Before: ${receipt.health_before.overall_score.toFixed(2)}`);
      lines.push(`║  Health After:  ${receipt.health_after.overall_score.toFixed(2)}`);
    }

    lines.push(`╚══════════════════════════════════════════════════════════════════════════╝`);

    return lines.join('\n');
  }
}

export const evolutionReceipts = new EvolutionReceiptManager();
