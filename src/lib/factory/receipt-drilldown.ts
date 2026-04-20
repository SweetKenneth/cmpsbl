/**
 * Receipt Drill-Down — Sprint 1 (Ascension V2 Phase 1)
 *
 * Builds an enriched, phase-by-phase view of an ascension run for the
 * /verify/:fingerprint page. Synthesizes a timeline from whatever the
 * source table records (no schema changes), and surfaces related VAULT
 * promotions matched by capability/category overlap.
 */

import { supabase } from '@/integrations/supabase/client';
import type { UnifiedLookupResult } from './restoration-session';

export type PhaseStatus = 'complete' | 'gated' | 'skipped' | 'unknown';

export interface ReceiptPhase {
  key: 'init' | 'upload' | 'discovery' | 'locking' | 'ascension' | 'complete';
  label: string;
  status: PhaseStatus;
  detail: string;
  at?: string | null;
}

export interface VaultPromotionLite {
  id: string;
  name: string;
  category: string | null;
  tier: string | null;
  cjpi: number | null;
}

export interface ReceiptDetail {
  phases: ReceiptPhase[];
  vaultMatches: VaultPromotionLite[];
  vaultMatchCount: number;
  forensics: { failedCheck: string; remediation: string } | null;
}

/** Build phases + vault matches for any unified lookup result */
export async function buildReceiptDetail(
  result: UnifiedLookupResult,
): Promise<ReceiptDetail> {
  const phases = derivePhases(result);
  const { matches, total } = await fetchVaultMatches(result);
  const forensics = deriveForensics(result, phases);

  return {
    phases,
    vaultMatches: matches,
    vaultMatchCount: total,
    forensics,
  };
}

function derivePhases(result: UnifiedLookupResult): ReceiptPhase[] {
  const created = result.session.createdAt;
  const completed =
    result.source === 'vertical_ascension'
      ? result.session.completedAt
      : created;

  const ok = (label: string, detail: string, at: string | null = created): ReceiptPhase => ({
    key: 'init', label: label as ReceiptPhase['key'], status: 'complete', detail, at,
  });

  // Source-specific phase synthesis (every Ascension run passes the same gates;
  // we mark them complete because the artifact exists)
  if (result.source === 'restoration') {
    const s = result.session;
    return [
      { key: 'init', label: 'Initialize', status: 'complete', detail: 'Run scoped, state machine sealed', at: created },
      { key: 'upload', label: 'Upload + Pre-Gate', status: 'complete', detail: `Source accepted (${s.originalLanguage ?? 'unknown'})`, at: created },
      { key: 'discovery', label: 'Discovery', status: 'complete', detail: `${s.selectedPrimitives.length} primitives bound`, at: created },
      { key: 'locking', label: 'Locking', status: 'complete', detail: `Fingerprint sealed · CJPI ${s.cjpiScore}`, at: created },
      { key: 'ascension', label: 'Ascension', status: 'complete', detail: `Tier ${s.cjpiTier} · serial ${s.serialNumber}`, at: created },
      { key: 'complete', label: 'Complete', status: 'complete', detail: 'Artifact exported', at: created },
    ];
  }

  if (result.source === 'cli_ascension') {
    const s = result.session;
    return [
      { key: 'init', label: 'Initialize', status: 'complete', detail: `CLI run · ${s.fileName}`, at: created },
      { key: 'upload', label: 'Upload + Pre-Gate', status: 'complete', detail: `${s.fileLines} lines · ${s.fileSizeKb} KB`, at: created },
      { key: 'discovery', label: 'Discovery', status: 'complete', detail: `${s.discoveries} discoveries · ${s.collisions}/40 collisions`, at: created },
      { key: 'locking', label: 'Locking', status: 'complete', detail: `Fingerprint sealed`, at: created },
      { key: 'ascension', label: 'Ascension', status: 'complete', detail: `CJPI ${s.cjpiTotal} · Tier ${s.cjpiTier}`, at: created },
      { key: 'complete', label: 'Complete', status: 'complete', detail: s.outputFile ? `Wrote ${s.outputFile}` : 'Artifact exported', at: created },
    ];
  }

  // vertical_ascension
  const s = result.session;
  const status: PhaseStatus = s.status === 'completed' ? 'complete' : s.status === 'failed' ? 'gated' : 'unknown';
  const completePhase: ReceiptPhase = {
    key: 'complete',
    label: 'Complete',
    status,
    detail: status === 'complete' ? `Final CJPI ${s.finalCjpi ?? '—'}` : `Status: ${s.status}`,
    at: completed,
  };
  return [
    { key: 'init', label: 'Initialize', status: 'complete', detail: `Vertical: ${s.verticalName ?? s.verticalId}`, at: created },
    { key: 'upload', label: 'Upload + Pre-Gate', status: 'complete', detail: `Original CJPI ${s.originalCjpi ?? '—'}`, at: created },
    { key: 'discovery', label: 'Discovery', status: 'complete', detail: `${s.primitivesApplied.length} primitives · ${s.capabilitiesAdded.length} capabilities added`, at: created },
    { key: 'locking', label: 'Locking', status: 'complete', detail: `Archetypes: ${s.enhancementArchetypes.join(', ') || '—'}`, at: created },
    { key: 'ascension', label: 'Ascension', status, detail: `${s.capabilitiesAdded.length} new capabilities bound`, at: completed },
    completePhase,
  ];

  // (unused fallback)
  return [ok('Complete', 'Artifact exists')];
}

/**
 * VAULT promotions don't share a fingerprint FK with sessions, so we match by
 * categories the session touched (capabilities for vertical, primitives' first
 * tokens for the others). Returns top 5 by CJPI.
 */
async function fetchVaultMatches(
  result: UnifiedLookupResult,
): Promise<{ matches: VaultPromotionLite[]; total: number }> {
  const categories = extractCategories(result);
  if (categories.length === 0) return { matches: [], total: 0 };

  const { data, error, count } = await supabase
    .from('vault_promotions')
    .select('id, name, category, tier, cjpi', { count: 'exact' })
    .in('category', categories)
    .order('cjpi', { ascending: false })
    .limit(5);

  if (error || !data) return { matches: [], total: 0 };
  return {
    matches: data as VaultPromotionLite[],
    total: count ?? data.length,
  };
}

function extractCategories(result: UnifiedLookupResult): string[] {
  const raw: string[] =
    result.source === 'vertical_ascension'
      ? result.session.capabilitiesAdded
      : result.source === 'restoration'
      ? result.session.selectedPrimitives
      : []; // CLI sessions don't expose category-like fields

  // Normalize to lowercase short tokens (e.g. "Security/Identity" → "security")
  const tokens = new Set<string>();
  for (const r of raw) {
    if (!r) continue;
    const first = r.toLowerCase().split(/[\s/_-]+/)[0];
    if (first) tokens.add(first);
  }
  return Array.from(tokens).slice(0, 8);
}

/**
 * Failed-run forensics. For currently-stored sessions every phase is complete
 * (failures don't reach the table), so we emit forensics only when a vertical
 * session is recorded as failed.
 */
function deriveForensics(
  result: UnifiedLookupResult,
  _phases: ReceiptPhase[],
): { failedCheck: string; remediation: string } | null {
  if (result.source !== 'vertical_ascension') return null;
  const s = result.session;
  if (s.status === 'completed') return null;

  if (s.status === 'failed') {
    return {
      failedCheck: 'Ascension Phase — vertical run did not converge',
      remediation: 'Re-run with a smaller capability set or attach a stabilizing layer (e.g. Circuit Breaker).',
    };
  }
  return {
    failedCheck: `Run status: ${s.status}`,
    remediation: 'Run did not reach completion. Check the vertical orchestrator logs.',
  };
}
