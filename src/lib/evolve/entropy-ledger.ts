/**
 * Entropy Ledger — Tracks entropy trend per tenant/app over time
 * Records every evolution and restoration event
 */

import { supabase } from '@/integrations/supabase/client';
import { emitEvolveEvent } from './telemetry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface EntropyEntry {
  id: string;
  tenant_id: string;
  proposal_id: string | null;
  entropy_score: number;
  health_score: number;
  debt_flags_count: number;
  health_delta: number | null;
  entropy_delta: number | null;
  event_type: 'evolution' | 'restoration' | 'scan';
  is_restoration: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface EntropyTrend {
  entries: EntropyEntry[];
  trend_direction: 'improving' | 'degrading' | 'stable';
  avg_entropy: number;
  avg_health: number;
}

// ═══════════════════════════════════════════════════════════════
// ENTROPY LEDGER MANAGER
// ═══════════════════════════════════════════════════════════════

class EntropyLedgerManager {
  /**
   * Record an evolution event in the entropy ledger
   */
  async recordEvolution(params: {
    tenant_id: string;
    proposal_id?: string;
    entropy_score: number;
    health_score: number;
    debt_flags_count: number;
    health_delta?: number;
    entropy_delta?: number;
    metadata?: Record<string, unknown>;
  }): Promise<{ success: boolean; error?: string }> {
    return this.record({ ...params, event_type: 'evolution', is_restoration: false });
  }

  /**
   * Record a restoration event in the entropy ledger
   */
  async recordRestoration(params: {
    tenant_id: string;
    proposal_id?: string;
    entropy_score: number;
    health_score: number;
    debt_flags_count: number;
    health_delta?: number;
    entropy_delta?: number;
    metadata?: Record<string, unknown>;
  }): Promise<{ success: boolean; error?: string }> {
    return this.record({ ...params, event_type: 'restoration', is_restoration: true });
  }

  /**
   * Get entropy trend for a tenant
   */
  async getTrend(tenant_id: string, limit = 50): Promise<EntropyTrend> {
    const { data, error } = await supabase
      .from('evolution_entropy_ledger')
      .select('*')
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return { entries: [], trend_direction: 'stable', avg_entropy: 0, avg_health: 0 };
    }

    const entries = data as unknown as EntropyEntry[];
    const avg_entropy = entries.reduce((s, e) => s + e.entropy_score, 0) / entries.length;
    const avg_health = entries.reduce((s, e) => s + e.health_score, 0) / entries.length;

    // Compute trend from last 5 entries
    const recent = entries.slice(0, Math.min(5, entries.length));
    let trend_direction: EntropyTrend['trend_direction'] = 'stable';

    if (recent.length >= 2) {
      const first_entropy = recent[recent.length - 1].entropy_score;
      const last_entropy = recent[0].entropy_score;
      const diff = last_entropy - first_entropy;
      if (diff < -0.05) trend_direction = 'improving';
      else if (diff > 0.05) trend_direction = 'degrading';
    }

    return { entries, trend_direction, avg_entropy, avg_health };
  }

  /**
   * Internal record method
   */
  private async record(params: {
    tenant_id: string;
    proposal_id?: string;
    entropy_score: number;
    health_score: number;
    debt_flags_count: number;
    health_delta?: number;
    entropy_delta?: number;
    event_type: string;
    is_restoration: boolean;
    metadata?: Record<string, unknown>;
  }): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('evolution_entropy_ledger')
      .insert({
        tenant_id: params.tenant_id,
        proposal_id: params.proposal_id ?? null,
        entropy_score: params.entropy_score,
        health_score: params.health_score,
        debt_flags_count: params.debt_flags_count,
        health_delta: params.health_delta ?? null,
        entropy_delta: params.entropy_delta ?? null,
        event_type: params.event_type,
        is_restoration: params.is_restoration,
        metadata: params.metadata ?? null,
      } as never);

    if (error) {
      console.error('[EntropyLedger] Failed to record:', error);
      return { success: false, error: error.message };
    }

    emitEvolveEvent('entropy_ledger_recorded', {
      tenant_id: params.tenant_id,
      event_type: params.event_type,
      entropy_score: params.entropy_score,
    });

    return { success: true };
  }
}

export const entropyLedger = new EntropyLedgerManager();
