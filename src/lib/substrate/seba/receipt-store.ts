/**
 * SEBA Receipt Store
 * Persistent storage for evolution receipts
 */

import { supabase } from '@/integrations/supabase/client';

export interface SEBAReceipt {
  id: string;
  cycle_id: string;
  timestamp: string;
  phase: 'complete' | 'partial' | 'failed';
  insights_found: number;
  proposals_generated: number;
  proposals_auto_approved: number;
  proposals_pending_review: number;
  duration_ms: number;
  next_cycle_at: string;
}

export interface SEBAProposalSummary {
  id: string;
  short_id: string;
  title: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'applied' | 'rolled_back';
  confidence: number;
  risk_level: string;
  predicted_impact: Record<string, string>;
  created_at: string;
  reviewed_at: string | null;
  reviewer: string | null;
  actions: Array<{ description: string; order: number }>;
}

export class SEBAReceiptStore {
  static async getReceipts(limit = 10): Promise<SEBAReceipt[]> {
    const { data } = await supabase
      .from('brain_events')
      .select('*')
      .eq('module', 'seba')
      .eq('event_type', 'scheduler_cycle_complete')
      .order('created_at', { ascending: false })
      .limit(limit);

    return (data || []).map(event => {
      const d = event.data as Record<string, unknown>;
      return {
        id: event.id,
        cycle_id: (d.cycle_id as string) || '',
        timestamp: event.created_at,
        phase: 'complete' as const,
        insights_found: (d.insights_found as number) || 0,
        proposals_generated: (d.proposals_generated as number) || 0,
        proposals_auto_approved: (d.proposals_auto_approved as number) || 0,
        proposals_pending_review: (d.proposals_pending_review as number) || 0,
        duration_ms: (d.duration_ms as number) || 0,
        next_cycle_at: (d.next_cycle_at as string) || '',
      };
    });
  }

  static async getProposalsForReview(status?: string, limit = 20): Promise<SEBAProposalSummary[]> {
    let query = supabase
      .from('evolution_proposals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) query = query.eq('status', status);

    const { data } = await query;

    return (data || []).map(p => {
      const sc = p.suggested_change as Record<string, unknown>;
      const ei = p.expected_impact as Record<string, unknown>;
      const diffs = p.diffs as Record<string, unknown>;

      return {
        id: p.id,
        short_id: (diffs?.short_id as string) || p.id.substring(0, 8),
        title: p.title,
        category: (sc?.category as string) || p.target_system,
        status: p.status as SEBAProposalSummary['status'],
        confidence: p.confidence || 0,
        risk_level: (ei?.risk_level as string) || 'low',
        predicted_impact: (sc?.predicted_impact as Record<string, string>) || {},
        created_at: p.created_at,
        reviewed_at: p.reviewed_at,
        reviewer: p.reviewer,
        actions: ((sc?.actions as Array<{description: string; order: number}>) || []),
      };
    });
  }

  static async getPendingCount(): Promise<number> {
    const { count } = await supabase
      .from('evolution_proposals')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    return count || 0;
  }

  static async getSchedulerStatus(): Promise<{
    enabled: boolean;
    last_cycle_at: string | null;
    next_cycle_at: string | null;
    cycles_today: number;
    proposals_pending: number;
  }> {
    const { data: lastCycle } = await supabase
      .from('brain_events')
      .select('data, created_at')
      .eq('module', 'seba')
      .eq('event_type', 'scheduler_cycle_complete')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const today = new Date().toISOString().split('T')[0];
    const { count: cyclesToday } = await supabase
      .from('brain_events')
      .select('id', { count: 'exact', head: true })
      .eq('module', 'seba')
      .eq('event_type', 'scheduler_cycle_complete')
      .gte('created_at', `${today}T00:00:00Z`);

    const { count: pending } = await supabase
      .from('evolution_proposals')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    const lastCycleData = lastCycle?.data as Record<string, unknown>;

    return {
      enabled: true, // Default enabled
      last_cycle_at: lastCycle?.created_at ?? null,
      next_cycle_at: (lastCycleData?.next_cycle_at as string) ?? null,
      cycles_today: cyclesToday || 0,
      proposals_pending: pending || 0,
    };
  }

  static formatProposalForTerminal(p: SEBAProposalSummary): string {
    const lines = [
      `┌─ ${p.short_id} ─────────────────────────────`,
      `│  ${p.title}`,
      `│  Category: ${p.category} | Confidence: ${Math.round(p.confidence * 100)}% | Risk: ${p.risk_level.toUpperCase()}`,
    ];
    if (Object.keys(p.predicted_impact).length > 0) {
      lines.push(`│  PREDICTED: ${Object.entries(p.predicted_impact).map(([k,v]) => `${k}: ${v}`).join(', ')}`);
    }
    lines.push(`└─────────────────────────────────────────`);
    return lines.join('\n');
  }
}
