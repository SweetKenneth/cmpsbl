/**
 * Change Ledger — Append-Only Effect Recording
 * Records EFFECTS of changes (not plans)
 * 
 * Part of Omega Observer Engine
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ChangeType = 'fix' | 'feature' | 'enhancement' | 'config';
export type ChangeSource = 'evolution' | 'cloud' | 'manual' | 'unknown';
export type ChangePhase = 'planning' | 'apply' | 'verify' | 'post_apply' | 'idle';

export interface LedgerEntry {
  id: string;
  timestamp: string;
  component: string;
  change_type: ChangeType;
  summary: string;
  artifacts_touched: string[];
  metrics_before?: MetricsSnapshot;
  metrics_after?: MetricsSnapshot;
  source: ChangeSource;
  phase: ChangePhase;
  evolution_id?: string;
  metadata?: Record<string, unknown>;
}

export interface MetricsSnapshot {
  health_score?: number;
  error_count?: number;
  warning_count?: number;
  test_pass_rate?: number;
  [key: string]: unknown;
}

export interface LedgerWriteOptions {
  component: string;
  change_type: ChangeType;
  summary: string;
  artifacts_touched?: string[];
  metrics_before?: MetricsSnapshot;
  metrics_after?: MetricsSnapshot;
  source?: ChangeSource;
  phase?: ChangePhase;
  evolution_id?: string;
  metadata?: Record<string, unknown>;
}

export interface LedgerQueryOptions {
  component?: string;
  since?: Date | string;
  source?: ChangeSource;
  limit?: number;
}

// ═══════════════════════════════════════════════════════════════
// LEDGER CLIENT
// ═══════════════════════════════════════════════════════════════

class ChangeLedgerClient {
  /**
   * Write an entry to the ledger (append-only)
   */
  async write(options: LedgerWriteOptions): Promise<{ success: boolean; entry_id?: string; error?: string }> {
    try {
      const insertData = {
        component: options.component,
        change_type: options.change_type,
        summary: options.summary,
        artifacts_touched: options.artifacts_touched || [],
        metrics_before: options.metrics_before || null,
        metrics_after: options.metrics_after || null,
        source: options.source || 'unknown',
        phase: options.phase || 'idle',
        evolution_id: options.evolution_id || null,
        metadata: options.metadata || {},
      };

      const { data, error } = await supabase
        .from('change_ledger')
        .insert(insertData as never)
        .select('id')
        .single();

      if (error) {
        console.error('[ChangeLedger] Write failed:', error);
        return { success: false, error: error.message };
      }

      return { success: true, entry_id: (data as { id: string }).id };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return { success: false, error: msg };
    }
  }

  /**
   * Query ledger entries
   */
  async query(options: LedgerQueryOptions = {}): Promise<LedgerEntry[]> {
    try {
      let query = supabase
        .from('change_ledger')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(options.limit || 50);

      if (options.component) {
        query = query.eq('component', options.component);
      }

      if (options.source) {
        query = query.eq('source', options.source);
      }

      if (options.since) {
        const sinceDate = typeof options.since === 'string' 
          ? options.since 
          : options.since.toISOString();
        query = query.gte('timestamp', sinceDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[ChangeLedger] Query failed:', error);
        return [];
      }

      return (data || []).map(this.mapEntry);
    } catch {
      return [];
    }
  }

  /**
   * Get recent entries for a component
   */
  async getComponentHistory(component: string, limit = 20): Promise<LedgerEntry[]> {
    return this.query({ component, limit });
  }

  /**
   * Get entries since a specific time
   */
  async getSince(since: Date | string): Promise<LedgerEntry[]> {
    return this.query({ since });
  }

  /**
   * Get entries by evolution ID
   */
  async getByEvolution(evolution_id: string): Promise<LedgerEntry[]> {
    try {
      const { data, error } = await supabase
        .from('change_ledger')
        .select('*')
        .eq('evolution_id', evolution_id)
        .order('timestamp', { ascending: true });

      if (error) return [];
      return (data || []).map(this.mapEntry);
    } catch {
      return [];
    }
  }

  /**
   * Calculate deltas from metrics
   */
  calculateDeltas(before?: MetricsSnapshot, after?: MetricsSnapshot): Record<string, string> {
    const deltas: Record<string, string> = {};
    
    if (!before || !after) return deltas;

    for (const key of Object.keys(after)) {
      const beforeVal = before[key];
      const afterVal = after[key];
      
      if (typeof beforeVal === 'number' && typeof afterVal === 'number') {
        const diff = afterVal - beforeVal;
        const arrow = diff >= 0 ? '↑' : '↓';
        const sign = diff >= 0 ? '+' : '';
        deltas[key] = `${beforeVal} → ${afterVal} (${arrow}${sign}${diff.toFixed(2)})`;
      }
    }

    return deltas;
  }

  /**
   * Map database row to LedgerEntry
   */
  private mapEntry(row: Record<string, unknown>): LedgerEntry {
    return {
      id: row.id as string,
      timestamp: row.timestamp as string,
      component: row.component as string,
      change_type: row.change_type as ChangeType,
      summary: row.summary as string,
      artifacts_touched: (row.artifacts_touched || []) as string[],
      metrics_before: row.metrics_before as MetricsSnapshot | undefined,
      metrics_after: row.metrics_after as MetricsSnapshot | undefined,
      source: row.source as ChangeSource,
      phase: row.phase as ChangePhase,
      evolution_id: row.evolution_id as string | undefined,
      metadata: row.metadata as Record<string, unknown> | undefined,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

export const changeLedger = new ChangeLedgerClient();
