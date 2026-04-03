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

  const { data, error } = await supabase
    .from('restoration_sessions')
    .insert([row] as never[])
    .select('id')
    .single();

  if (error) {
    console.error('Failed to save restoration session:', error.message);
    return null;
  }
  return data?.id ?? null;
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
