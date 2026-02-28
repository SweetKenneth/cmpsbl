/**
 * Scan Persistence Hook — Item #3
 * Save scan results to DB for shareable URLs.
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ScanResult {
  domain: string;
  score?: number;
  scanType: string;
  findings?: unknown[];
  metadata?: Record<string, unknown>;
}

export function useScanPersistence() {
  const saveScan = useCallback(async (result: ScanResult): Promise<string | null> => {
    try {
      const insertData: Record<string, unknown> = {
        domain: result.domain,
        score: result.score ?? null,
        metadata: {
          scan_type: result.scanType,
          findings: result.findings ?? [],
          ...result.metadata,
          saved_at: new Date().toISOString(),
        },
      };
      
      const { data, error } = await supabase.from('access_scans').insert(insertData as any).select('id').single();

      if (error) throw error;
      return data?.id ?? null;
    } catch {
      return null;
    }
  }, []);

  const loadScan = useCallback(async (scanId: string) => {
    try {
      const { data, error } = await supabase
        .from('access_scans')
        .select('*')
        .eq('id', scanId)
        .single();

      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  }, []);

  return { saveScan, loadScan };
}
