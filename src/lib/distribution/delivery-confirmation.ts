/**
 * Brain Sync Delivery Confirmation
 * 
 * Tracks whether pf-brain-sync-dispatch payloads were successfully
 * received and ingested by LNCHBL.
 * 
 * @module distribution/delivery-confirmation
 * @version 1.0.0
 */

import { supabase } from '@/integrations/supabase/client';

export interface DeliveryStatus {
  patch_version: string;
  dispatched_at: string;
  acknowledged: boolean;
  acknowledged_at: string | null;
  items_ingested: number;
  latency_ms: number | null;
}

/**
 * Check delivery status for recent brain sync patches.
 */
export async function checkBrainSyncDelivery(limit = 10): Promise<DeliveryStatus[]> {
  // Get recent brain_sync patches
  const { data: patches } = await supabase
    .from('distribution_patches' as any)
    .select('version, published_at, payload, status')
    .eq('target_distribution', 'LNCHBL')
    .eq('patch_type', 'brain_sync')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (!patches || patches.length === 0) return [];

  // Get LNCHBL acknowledgment state
  const { data: ackState } = await supabase
    .from('distribution_state' as any)
    .select('state_value')
    .eq('distribution_id', 'LNCHBL')
    .eq('state_key', 'brain_sync_ack')
    .maybeSingle();

  const ackMap: Record<string, { acked_at: string; items: number }> =
    (ackState as any)?.state_value?.acknowledged_versions || {};

  return (patches as any[]).map((p) => {
    const ack = ackMap[p.version];
    const dispatchedAt = new Date(p.published_at).getTime();
    const ackedAt = ack ? new Date(ack.acked_at).getTime() : null;

    return {
      patch_version: p.version,
      dispatched_at: p.published_at,
      acknowledged: !!ack,
      acknowledged_at: ack?.acked_at || null,
      items_ingested: ack?.items || 0,
      latency_ms: ackedAt ? ackedAt - dispatchedAt : null,
    };
  });
}

/**
 * Get the overall brain sync health summary.
 */
export async function getBrainSyncHealth(): Promise<{
  total_dispatched: number;
  total_acknowledged: number;
  delivery_rate: number;
  avg_latency_ms: number | null;
  last_dispatch: string | null;
  last_ack: string | null;
}> {
  const statuses = await checkBrainSyncDelivery(50);
  if (statuses.length === 0) {
    return {
      total_dispatched: 0,
      total_acknowledged: 0,
      delivery_rate: 0,
      avg_latency_ms: null,
      last_dispatch: null,
      last_ack: null,
    };
  }

  const acknowledged = statuses.filter(s => s.acknowledged);
  const latencies = acknowledged
    .map(s => s.latency_ms)
    .filter((l): l is number => l !== null);

  return {
    total_dispatched: statuses.length,
    total_acknowledged: acknowledged.length,
    delivery_rate: acknowledged.length / statuses.length,
    avg_latency_ms: latencies.length > 0
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : null,
    last_dispatch: statuses[0]?.dispatched_at || null,
    last_ack: acknowledged[0]?.acknowledged_at || null,
  };
}
