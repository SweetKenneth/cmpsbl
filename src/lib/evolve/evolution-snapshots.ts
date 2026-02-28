/**
 * Evolution Snapshots — Tenant-scoped snapshot registry
 * Manages pre-metrics persistence, snapshot creation, and restore tracking
 */

import { supabase } from '@/integrations/supabase/client';
import { type EvolutionMetrics } from './evolution-delta';
import { emitEvolveEvent } from './telemetry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface EvolutionSnapshot {
  id: string;
  snapshot_id: string;
  tenant_id: string;
  proposal_id: string | null;
  pre_metrics: EvolutionMetrics | null;
  state_hash: string | null;
  restorable: boolean;
  restored_at: string | null;
  restored_by: string | null;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════
// SNAPSHOT MANAGER
// ═══════════════════════════════════════════════════════════════

class EvolutionSnapshotManager {
  /**
   * Create a snapshot with pre-metrics
   */
  async createSnapshot(
    snapshot_id: string,
    tenant_id: string,
    pre_metrics: EvolutionMetrics,
    proposal_id?: string
  ): Promise<{ success: boolean; error?: string }> {
    const state_hash = this.computeStateHash(pre_metrics, snapshot_id);

    const { error } = await supabase
      .from('evolution_snapshots')
      .insert({
        snapshot_id,
        tenant_id,
        proposal_id: proposal_id ?? null,
        pre_metrics: pre_metrics as never,
        state_hash,
        restorable: true,
      } as never);

    if (error) {
      console.error('[Snapshots] Failed to create snapshot:', error);
      return { success: false, error: error.message };
    }

    emitEvolveEvent('snapshot_created', { snapshot_id, tenant_id });
    return { success: true };
  }

  /**
   * Persist pre-metrics for a snapshot
   */
  async persistPreMetrics(
    snapshot_id: string,
    metrics: EvolutionMetrics,
    proposal_id?: string,
    tenant_id?: string
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('evolution_pre_metrics')
      .insert({
        snapshot_id,
        proposal_id: proposal_id ?? null,
        tenant_id: tenant_id ?? null,
        health_score: metrics.health_score,
        audit_percent: metrics.audit_percent,
        debt_flags_count: metrics.debt_flags_count,
        open_circuit_count: metrics.open_circuit_count,
        memory_total_vectors: metrics.memory_total_vectors,
        entropy_score: metrics.entropy_score,
      } as never);

    if (error) {
      console.error('[Snapshots] Failed to persist pre-metrics:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Get snapshot by ID, validated against tenant
   */
  async getSnapshot(snapshot_id: string, tenant_id: string): Promise<EvolutionSnapshot | null> {
    const { data, error } = await supabase
      .from('evolution_snapshots')
      .select('*')
      .eq('snapshot_id', snapshot_id)
      .eq('tenant_id', tenant_id)
      .maybeSingle();

    if (error || !data) return null;
    return data as unknown as EvolutionSnapshot;
  }

  /**
   * Get pre-metrics for a snapshot
   */
  async getPreMetrics(snapshot_id: string): Promise<EvolutionMetrics | null> {
    const { data, error } = await supabase
      .from('evolution_pre_metrics')
      .select('*')
      .eq('snapshot_id', snapshot_id)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as Record<string, unknown>;
    return {
      health_score: row.health_score as number,
      audit_percent: row.audit_percent as number,
      debt_flags_count: row.debt_flags_count as number,
      open_circuit_count: row.open_circuit_count as number,
      memory_total_vectors: row.memory_total_vectors as number,
      entropy_score: row.entropy_score as number,
    };
  }

  /**
   * List snapshots for a tenant
   */
  async listSnapshots(tenant_id: string, limit = 20): Promise<EvolutionSnapshot[]> {
    const { data, error } = await supabase
      .from('evolution_snapshots')
      .select('*')
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []) as unknown as EvolutionSnapshot[];
  }

  /**
   * Mark snapshot as restored
   */
  async markRestored(snapshot_id: string, restored_by: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('evolution_snapshots')
      .update({
        restored_at: new Date().toISOString(),
        restored_by,
      } as never)
      .eq('snapshot_id', snapshot_id);

    if (error) return { success: false, error: error.message };

    emitEvolveEvent('snapshot_restored', { snapshot_id, restored_by });
    return { success: true };
  }

  /**
   * Compute a deterministic state hash
   */
  private computeStateHash(metrics: EvolutionMetrics, snapshot_id: string): string {
    const input = `${snapshot_id}:${metrics.health_score}:${metrics.entropy_score}:${metrics.debt_flags_count}`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}

export const evolutionSnapshots = new EvolutionSnapshotManager();
