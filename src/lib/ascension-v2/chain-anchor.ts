/**
 * Ascension V2 Chain Anchor — fires after a successful export to record
 * a fresh head hash in `audit_chain_anchors` (primary + redundant rows
 * remain in sync via `anchorHead`).
 *
 * Runs fire-and-forget. Never blocks the export UI; verifier reads the
 * latest anchor on /verify/:fingerprint to display "Last anchored …".
 *
 * © CMPSBL® — All rights reserved.
 */

import { anchorHead } from '@/lib/audit/anchors';
import { supabase } from '@/integrations/supabase/client';

/**
 * Compute a browser-safe SHA-256 hex digest of the given input.
 */
async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Anchor the current chain head after a V2 export. The new head hash is
 * derived deterministically from the latest artifact registry snapshot
 * combined with the export's fingerprint — that way two artifacts that
 * share a fingerprint also share an anchor lineage.
 *
 * Best-effort: failures are logged but never thrown.
 */
export async function anchorV2ExportHead(params: {
  runId: string;
  fingerprint: string;
}): Promise<void> {
  try {
    // Count only V2-pipeline artifacts so the anchor reflects the V2 chain,
    // not the entire registry (which mixes V1, vertical exports, restorations,
    // and store inventory). Counted *after* the export row is committed so the
    // new artifact is included in the receipt total it gets anchored against.
    const { count } = await supabase
      .from('artifact_registry')
      .select('id', { count: 'exact', head: true })
      .in('category', [
        'proprietary-evolution-v2',
        'proprietary-discovery-v2',
        'proprietary-ascended-v2',
        'proprietary-mana-attachment-v2',
      ]);

    const receiptCount = count ?? 0;
    const headInput = [
      'cmpsbl-v2',
      params.fingerprint,
      params.runId,
      String(receiptCount),
      new Date().toISOString().slice(0, 10), // day-bucket so same day exports cluster
    ].join('|');
    const headHash = await sha256Hex(headInput);
    await anchorHead(headHash, receiptCount);
  } catch (err) {
    console.warn('[v2-anchor] export anchor failed:', err);
  }
}
