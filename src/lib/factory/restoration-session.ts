/**
 * Restoration Session — Persist and retrieve refurbishment sessions
 * Uses fingerprint ID for return-visit support via DECODE
 */

import { supabase } from '@/integrations/supabase/client';
import type { ScanResult } from './scan-team';
import type { RestorationReport } from './restoration-docs';

export interface RestorationSession {
  id: string;
  fingerprint: string;
  originalCode: string;
  originalLanguage: string | null;
  scanResult: ScanResult;
  selectedPrimitives: string[];
  report: RestorationReport;
  cjpiScore: number;
  cjpiTier: string;
  serialNumber: string;
  createdAt: string;
}

/** Save a restoration session to the database */
export async function saveRestorationSession(params: {
  fingerprint: string;
  originalCode: string;
  originalLanguage?: string;
  scanResult: ScanResult;
  selectedPrimitives: string[];
  report: RestorationReport;
}): Promise<string | null> {
  const row = {
    fingerprint: params.fingerprint,
    original_code: params.originalCode,
    original_language: params.originalLanguage ?? null,
    scan_result: params.scanResult as unknown as Record<string, unknown>,
    selected_primitives: params.selectedPrimitives as unknown as Record<string, unknown>,
    report: params.report as unknown as Record<string, unknown>,
    cjpi_score: params.report.cjpiCertificate.score,
    cjpi_tier: params.report.cjpiCertificate.tier,
    serial_number: params.report.id,
  };

  // Insert without .select() — the SELECT RLS policy is restrictive
  // (mediated via RPC for lookups), so chaining .select() after insert
  // would fail and could roll back the entire operation.
  const { error } = await supabase
    .from('restoration_sessions')
    .insert([row] as never[]);

  if (error) {
    console.error('[Ascension] Failed to persist session:', error.message);
    return null;
  }
  return params.fingerprint;
}

/** Look up a restoration session by fingerprint (via security definer RPC) */
export async function lookupByFingerprint(fingerprint: string): Promise<RestorationSession | null> {
  const { data, error } = await supabase
    .rpc('lookup_restoration_by_fingerprint', { p_fingerprint: fingerprint });

  const row = (data as unknown as Record<string, unknown>[] | null)?.[0];
  if (error || !row) return null;

  return mapRow(row);
}

/** Look up a restoration session by serial number (via security definer RPC) */
export async function lookupBySerial(serialNumber: string): Promise<RestorationSession | null> {
  const { data, error } = await supabase
    .rpc('lookup_restoration_by_serial', { p_serial: serialNumber });

  const row = (data as unknown as Record<string, unknown>[] | null)?.[0];
  if (error || !row) return null;

  return mapRow(row);
}

/** Vertical ascension session shape (different table, different schema) */
export interface VerticalAscensionSession {
  id: string;
  fingerprintId: string;
  verticalId: string;
  verticalName: string | null;
  primitivesApplied: string[];
  capabilitiesAdded: string[];
  enhancementArchetypes: string[];
  originalCjpi: number | null;
  finalCjpi: number | null;
  status: string;
  createdAt: string;
  completedAt: string | null;
  metadata: Record<string, unknown> | null;
}

/**
 * Look up a vertical ascension session by fingerprint.
 * This searches the vertical_ascension_sessions table — separate from restoration_sessions.
 * Enables cross-table "shared mesh memory" so DECODE can verify any fingerprint
 * regardless of which substrate it originated from.
 */
export async function lookupVerticalAscensionByFingerprint(
  fingerprint: string,
): Promise<VerticalAscensionSession | null> {
  const { data, error } = await supabase
    .rpc('lookup_vertical_ascension_by_fingerprint', { p_fingerprint: fingerprint });

  const row = (data as unknown as Record<string, unknown>[] | null)?.[0];
  if (error || !row) return null;

  // Resolve vertical name from vertical_id
  let verticalName: string | null = null;
  const verticalId = row.vertical_id as string;
  if (verticalId) {
    const { data: vData } = await supabase
      .from('vertical_substrates')
      .select('name')
      .eq('vertical_id', verticalId)
      .single();
    verticalName = (vData as { name: string } | null)?.name ?? verticalId;
  }

  return {
    id: row.id as string,
    fingerprintId: row.fingerprint_id as string,
    verticalId,
    verticalName,
    primitivesApplied: (row.primitives_applied as string[]) ?? [],
    capabilitiesAdded: (row.capabilities_added as string[]) ?? [],
    enhancementArchetypes: (row.enhancement_archetypes as string[]) ?? [],
    originalCjpi: row.original_cjpi as number | null,
    finalCjpi: row.final_cjpi as number | null,
    status: row.status as string,
    createdAt: row.created_at as string,
    completedAt: (row.completed_at as string) ?? null,
    metadata: row.metadata as Record<string, unknown> | null,
  };
}

/**
 * Universal fingerprint lookup — checks BOTH tables.
 * Returns whichever record matches, with a discriminator field.
 */
export type UnifiedLookupResult =
  | { source: 'restoration'; session: RestorationSession }
  | { source: 'vertical_ascension'; session: VerticalAscensionSession };

export async function lookupAnyFingerprint(fingerprint: string): Promise<UnifiedLookupResult | null> {
  // Try restoration_sessions first (most common)
  const restoration = await lookupByFingerprint(fingerprint);
  if (restoration) return { source: 'restoration', session: restoration };

  // Fallback: check vertical_ascension_sessions
  const ascension = await lookupVerticalAscensionByFingerprint(fingerprint);
  if (ascension) return { source: 'vertical_ascension', session: ascension };

  return null;
}

function mapRow(row: Record<string, unknown>): RestorationSession {
  return {
    id: row.id as string,
    fingerprint: row.fingerprint as string,
    originalCode: row.original_code as string,
    originalLanguage: (row.original_language as string) ?? null,
    scanResult: row.scan_result as unknown as ScanResult,
    selectedPrimitives: row.selected_primitives as unknown as string[],
    report: row.report as unknown as RestorationReport,
    cjpiScore: Number(row.cjpi_score),
    cjpiTier: (row.cjpi_tier as string) ?? '',
    serialNumber: row.serial_number as string,
    createdAt: row.created_at as string,
  };
}
