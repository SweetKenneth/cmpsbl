/**
 * Memory Tier Move Receipt Logger — DB-backed
 * Persists tier transition receipts to memory_tier_receipts table
 */

import type { TierMoveReceipt } from './tiering';
import { supabase } from '@/integrations/supabase/client';

/** Shared mapper: DB row → TierMoveReceipt */
function mapRow(r: any): TierMoveReceipt {
  return {
    memory_id: r.memory_id,
    reason_code: r.reason_code,
    before_tier: r.before_tier,
    after_tier: r.after_tier,
    before_confidence: r.before_confidence ?? 0,
    after_confidence: r.after_confidence ?? 0,
    rps_score: r.rps_score ?? 0,
    actor: r.actor,
    evidence: r.evidence ?? {},
    timestamp: r.created_at,
  };
}

const RECEIPT_SELECT = 'memory_id, reason_code, before_tier, after_tier, before_confidence, after_confidence, rps_score, actor, evidence, created_at';

/** Record a tier move receipt to DB */
export async function recordReceipt(receipt: TierMoveReceipt): Promise<void> {
  try {
    const { error } = await supabase.from('memory_tier_receipts').insert({
      memory_id: receipt.memory_id,
      before_tier: receipt.before_tier,
      after_tier: receipt.after_tier,
      reason_code: receipt.reason_code,
      rps_score: receipt.rps_score,
      actor: receipt.actor,
      before_confidence: receipt.before_confidence,
      after_confidence: receipt.after_confidence,
      evidence: receipt.evidence as any,
    });
    if (error) {
      console.warn(`[Memory] Receipt insert failed: ${error.message}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Memory] Receipt record error: ${msg}`);
  }
}

/** Batch-record multiple receipts in one insert */
export async function recordReceipts(receipts: TierMoveReceipt[]): Promise<void> {
  if (receipts.length === 0) return;
  try {
    const rows = receipts.map(r => ({
      memory_id: r.memory_id,
      before_tier: r.before_tier,
      after_tier: r.after_tier,
      reason_code: r.reason_code,
      rps_score: r.rps_score,
      actor: r.actor,
      before_confidence: r.before_confidence,
      after_confidence: r.after_confidence,
      evidence: r.evidence as any,
    }));
    await supabase.from('memory_tier_receipts').insert(rows);
  } catch {
    // Silent
  }
}

/** Get recent receipts from DB */
export async function getReceipts(limit = 50): Promise<TierMoveReceipt[]> {
  try {
    const { data, error } = await supabase
      .from('memory_tier_receipts')
      .select(RECEIPT_SELECT)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map(mapRow);
  } catch {
    return [];
  }
}

/** Get receipts for a specific memory from DB */
export async function getReceiptsForMemory(memoryId: string): Promise<TierMoveReceipt[]> {
  try {
    const { data, error } = await supabase
      .from('memory_tier_receipts')
      .select(RECEIPT_SELECT)
      .eq('memory_id', memoryId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) return [];
    return data.map(mapRow);
  } catch {
    return [];
  }
}

const TIER_RANK: Record<string, number> = { hot: 3, warm: 2, cold: 1, glacier: 0 };

/** Get receipt statistics from DB — uses count queries to avoid fetching all rows */
export async function getReceiptStats(): Promise<{
  total: number;
  by_reason: Record<string, number>;
  by_direction: { promotions: number; demotions: number };
}> {
  try {
    const { data, error } = await supabase
      .from('memory_tier_receipts')
      .select('reason_code, before_tier, after_tier')
      .limit(1000);

    if (error || !data) return { total: 0, by_reason: {}, by_direction: { promotions: 0, demotions: 0 } };

    const by_reason: Record<string, number> = {};
    let promotions = 0;
    let demotions = 0;

    for (const r of data) {
      by_reason[r.reason_code] = (by_reason[r.reason_code] ?? 0) + 1;
      if ((TIER_RANK[r.after_tier] ?? 0) > (TIER_RANK[r.before_tier] ?? 0)) promotions++;
      else demotions++;
    }

    return { total: data.length, by_reason, by_direction: { promotions, demotions } };
  } catch {
    return { total: 0, by_reason: {}, by_direction: { promotions: 0, demotions: 0 } };
  }
}

/** Clear all receipts */
export async function clearReceipts(): Promise<void> {
  try {
    await supabase
      .from('memory_tier_receipts')
      .delete()
      .gte('created_at', '1970-01-01T00:00:00Z');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Memory] Clear receipts failed: ${msg}`);
  }
}