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

/** Look up a restoration session by fingerprint */
export async function lookupByFingerprint(fingerprint: string): Promise<RestorationSession | null> {
  const { data, error } = await supabase
    .from('restoration_sessions')
    .select('*')
    .eq('fingerprint', fingerprint)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    fingerprint: data.fingerprint,
    originalCode: data.original_code,
    originalLanguage: data.original_language,
    scanResult: data.scan_result as unknown as ScanResult,
    selectedPrimitives: data.selected_primitives as unknown as string[],
    report: data.report as unknown as RestorationReport,
    cjpiScore: Number(data.cjpi_score),
    cjpiTier: data.cjpi_tier ?? '',
    serialNumber: data.serial_number,
    createdAt: data.created_at,
  };
}

/** Look up a restoration session by serial number */
export async function lookupBySerial(serialNumber: string): Promise<RestorationSession | null> {
  const { data, error } = await supabase
    .from('restoration_sessions')
    .select('*')
    .eq('serial_number', serialNumber)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    fingerprint: data.fingerprint,
    originalCode: data.original_code,
    originalLanguage: data.original_language,
    scanResult: data.scan_result as unknown as ScanResult,
    selectedPrimitives: data.selected_primitives as unknown as string[],
    report: data.report as unknown as RestorationReport,
    cjpiScore: Number(data.cjpi_score),
    cjpiTier: data.cjpi_tier ?? '',
    serialNumber: data.serial_number,
    createdAt: data.created_at,
  };
}
