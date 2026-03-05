/**
 * Multi-Anchor Head Storage — DB-backed redundant chain head persistence
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

  // Upsert both anchors by store type
  await supabase.from('audit_chain_anchors').upsert(
    { id: primary.anchor_id, head_hash: headHash, receipt_count: receiptCount, anchored_at: now, store: 'primary' }
  );
  await supabase.from('audit_chain_anchors').upsert(
    { id: redundant.anchor_id, head_hash: headHash, receipt_count: receiptCount, anchored_at: now, store: 'redundant' }
  );

  return [primary, redundant];
}

/** Verify anchor consistency from DB */
export async function verifyAnchors(): Promise<{ consistent: boolean; primary: ChainAnchor | null; redundant: ChainAnchor | null }> {
  const { data: primaryData } = await supabase
    .from('audit_chain_anchors')
    .select('*')
    .eq('store', 'primary')
    .order('anchored_at', { ascending: false })
    .limit(1);

  const { data: redundantData } = await supabase
    .from('audit_chain_anchors')
    .select('*')
    .eq('store', 'redundant')
    .order('anchored_at', { ascending: false })
    .limit(1);

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
  const { data } = await supabase
    .from('audit_chain_anchors')
    .select('head_hash')
    .eq('store', 'primary')
    .order('anchored_at', { ascending: false })
    .limit(1);

  return data?.[0]?.head_hash ?? null;
}

/** Get anchor count from DB */
export async function getAnchorCount(): Promise<number> {
  const { count } = await supabase
    .from('audit_chain_anchors')
    .select('*', { count: 'exact', head: true });

  return count ?? 0;
}
