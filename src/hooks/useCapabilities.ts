/**
 * useCapabilities Hook
 * v7.0.0 — React hook for capability management
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  listCapabilities, 
  getCapability, 
  getManifest,
  runScanAdapt,
  invokeCapability,
  type RegisteredCapability,
  type ScanAdaptResult,
  type CapabilityResult,
} from '@/lib/capabilities';

export function useCapabilities() {
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<ScanAdaptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const capabilities = useMemo(() => listCapabilities(), [lastScan]);
  const activeCapabilities = useMemo(() => listCapabilities({ status: 'active' }), [lastScan]);
  const manifest = useMemo(() => getManifest(), [lastScan]);

  const scanAndAdapt = useCallback(async (options: {
    dryRun?: boolean;
    confirm?: boolean;
    pruneUnused?: boolean;
    verbose?: boolean;
  } = { dryRun: true }) => {
    setScanning(true);
    setError(null);
    
    try {
      const result = runScanAdapt(options);
      setLastScan(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Scan failed';
      setError(message);
      throw err;
    } finally {
      setScanning(false);
    }
  }, []);

  const invoke = useCallback(async <T = unknown>(
    capabilityId: string,
    input: Record<string, unknown>,
    callerModule: string = 'DECODE'
  ): Promise<CapabilityResult<T>> => {
    return invokeCapability<T>({
      capabilityId,
      input,
      callerModule,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const getById = useCallback((id: string): RegisteredCapability | undefined => {
    return getCapability(id);
  }, []);

  return {
    // State
    capabilities,
    activeCapabilities,
    manifest,
    scanning,
    lastScan,
    error,
    
    // Actions
    scanAndAdapt,
    invoke,
    getById,
    
    // Computed
    totalCount: capabilities.length,
    activeCount: activeCapabilities.length,
  };
}

export default useCapabilities;
