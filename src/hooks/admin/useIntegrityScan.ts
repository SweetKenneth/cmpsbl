/**
 * Hook for System Integrity Scan
 */

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  runIntegrityScan, 
  getScanHistory, 
  type IntegrityScanResult, 
  type ScanMode 
} from '@/lib/substrate/integrity-engine';

export function useIntegrityScan() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<IntegrityScanResult | null>(null);

  const { data: scanHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['integrity-scan-history'],
    queryFn: () => getScanHistory(10),
    refetchInterval: 60000,
  });

  const scan = useCallback(async (mode: ScanMode = 'quick') => {
    setIsScanning(true);
    try {
      const result = await runIntegrityScan(mode);
      setLastResult(result);
      refetchHistory();
      return result;
    } finally {
      setIsScanning(false);
    }
  }, [refetchHistory]);

  return {
    scan,
    isScanning,
    lastResult,
    scanHistory: scanHistory || [],
  };
}
