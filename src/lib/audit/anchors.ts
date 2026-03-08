/**
 * Multi-Anchor Head Storage — DB-backed redundant chain head persistence
 * 
 * Round 4 Fixes:
 * ✅ Parallel DB writes instead of sequential
 * ✅ Error handling — failures logged and surfaced
 * ✅ Delete-then-insert pattern to prevent infinite row growth
 * ✅ Anchor count uses proper count query
 */

import { supabase } from '@/integrations/supabase/client';

export interface ChainAnchor {
  anchor_id: string;
  head_hash: string;
  receipt_count: number;
  anchored_at: string;
  store: 'primary' | 'redundant';
}

/** Store a chain head in both primary and redundant anchors (DB-backed) */
export async function anchorHead(headHash: string, receiptCount: number): Promise<ChainAnchor[]> {
  const now = new Date().toISOString();

  const primary: ChainAnchor = {
    anchor_id: crypto.randomUUID(),
    head_hash: headHash,
    receipt_count: receiptCount,
    anchored_at: now,
    store: 'primary',
  };
  const redundant: ChainAnchor = {
    anchor_id: crypto.randomUUID(),
    head_hash: headHash,
    receipt_count: receiptCount,
    anchored_at: now,
    store: 'redundant',
  };

  // Delete old anchors and insert new ones in parallel
  // This prevents infinite row growth from the previous upsert-with-new-UUID approach
  const [primaryResult, redundantResult] = await Promise.all([
    supabase.from('audit_chain_anchors')
      .delete().eq('store', 'primary')
      .then(() =>
        supabase.from('audit_chain_anchors').insert({
          id: primary.anchor_id,
          head_hash: headHash,
          receipt_count: receiptCount,
          anchored_at: now,
          store: 'primary',
        })
      ),
    supabase.from('audit_chain_anchors')
      .delete().eq('store', 'redundant')
      .then(() =>
        supabase.from('audit_chain_anchors').insert({
          id: redundant.anchor_id,
          head_hash: headHash,
          receipt_count: receiptCount,
          anchored_at: now,
          store: 'redundant',
        })
      ),
  ]);

  // Surface errors but don't throw — anchoring is best-effort
  if (primaryResult.error) {
    console.warn('[audit-anchors] Primary anchor write failed:', primaryResult.error.message);
  }
  if (redundantResult.error) {
    console.warn('[audit-anchors] Redundant anchor write failed:', redundantResult.error.message);
  }

  return [primary, redundant];
}

/** Verify anchor consistency from DB */
export async function verifyAnchors(): Promise<{ consistent: boolean; primary: ChainAnchor | null; redundant: ChainAnchor | null }> {
  // Parallel fetch both stores
  const [{ data: primaryData, error: pErr }, { data: redundantData, error: rErr }] = await Promise.all([
    supabase
      .from('audit_chain_anchors')
      .select('*')
      .eq('store', 'primary')
      .order('anchored_at', { ascending: false })
      .limit(1),
    supabase
      .from('audit_chain_anchors')
      .select('*')
      .eq('store', 'redundant')
      .order('anchored_at', { ascending: false })
      .limit(1),
  ]);

  if (pErr || rErr) {
    console.warn('[audit-anchors] Anchor verification DB error:', pErr?.message ?? rErr?.message);
    return { consistent: false, primary: null, redundant: null };
  }

  const primary = primaryData?.[0] ? {
    anchor_id: primaryData[0].id,
    head_hash: primaryData[0].head_hash,
    receipt_count: primaryData[0].receipt_count,
    anchored_at: primaryData[0].anchored_at,
    store: 'primary' as const,
  } : null;

  const redundant = redundantData?.[0] ? {
    anchor_id: redundantData[0].id,
    head_hash: redundantData[0].head_hash,
    receipt_count: redundantData[0].receipt_count,
    anchored_at: redundantData[0].anchored_at,
    store: 'redundant' as const,
  } : null;

  if (!primary || !redundant) {
    return { consistent: primary === null && redundant === null, primary, redundant };
  }

  return {
    consistent: primary.head_hash === redundant.head_hash && primary.receipt_count === redundant.receipt_count,
    primary,
    redundant,
  };
}

/** Get current head hash from DB */
export async function getHeadHash(): Promise<string | null> {
  const { data, error } = await supabase
    .from('audit_chain_anchors')
    .select('head_hash')
    .eq('store', 'primary')
    .order('anchored_at', { ascending: false })
    .limit(1);

  if (error) {
    console.warn('[audit-anchors] getHeadHash failed:', error.message);
    return null;
  }

  return data?.[0]?.head_hash ?? null;
}

/** Get anchor count from DB */
export async function getAnchorCount(): Promise<number> {
  const { count, error } = await supabase
    .from('audit_chain_anchors')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.warn('[audit-anchors] getAnchorCount failed:', error.message);
    return 0;
  }

  return count ?? 0;
}
