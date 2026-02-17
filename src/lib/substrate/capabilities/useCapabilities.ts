/**
 * React Hook for Substrate Capabilities
 * v10.5.4 ARCHITECT Epoch — Access 400+ cross-module synergy capabilities
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  capabilityEngine,
  type CapabilityId,
  type CapabilityDefinition,
  type CapabilityState,
  type CapabilityExecutionResult,
  type ModuleLayer,
} from './index';

export interface UseCapabilitiesReturn {
  // Data
  capabilities: CapabilityDefinition[];
  summary: ReturnType<typeof capabilityEngine.getSummary>;
  
  // Queries
  getCapability: (id: CapabilityId) => CapabilityDefinition | undefined;
  getState: (id: CapabilityId) => CapabilityState | undefined;
  getByModule: (module: string) => CapabilityDefinition[];
  getByLayer: (layer: ModuleLayer) => CapabilityDefinition[];
  
  // Mutations
  execute: (id: CapabilityId, context?: Record<string, unknown>) => Promise<CapabilityExecutionResult>;
  setEnabled: (id: CapabilityId, enabled: boolean) => void;
  
  // State
  isExecuting: boolean;
  lastResult: CapabilityExecutionResult | null;
}

export function useCapabilities(): UseCapabilitiesReturn {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<CapabilityExecutionResult | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Force refresh to get updated state
  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);
  
  const capabilities = useMemo(() => capabilityEngine.list(), [refreshKey]);
  const summary = useMemo(() => capabilityEngine.getSummary(), [refreshKey]);
  
  const getCapability = useCallback((id: CapabilityId) => {
    return capabilityEngine.get(id);
  }, []);
  
  const getState = useCallback((id: CapabilityId) => {
    return capabilityEngine.getState(id);
  }, [refreshKey]);
  
  const getByModule = useCallback((module: string) => {
    return capabilityEngine.getByModule(module);
  }, []);
  
  const getByLayer = useCallback((layer: ModuleLayer) => {
    return capabilityEngine.getByLayer(layer);
  }, []);
  
  const execute = useCallback(async (id: CapabilityId, context?: Record<string, unknown>) => {
    setIsExecuting(true);
    try {
      const result = await capabilityEngine.execute(id, context);
      setLastResult(result);
      refresh();
      return result;
    } finally {
      setIsExecuting(false);
    }
  }, [refresh]);
  
  const setEnabled = useCallback((id: CapabilityId, enabled: boolean) => {
    capabilityEngine.setEnabled(id, enabled);
    refresh();
  }, [refresh]);
  
  return {
    capabilities,
    summary,
    getCapability,
    getState,
    getByModule,
    getByLayer,
    execute,
    setEnabled,
    isExecuting,
    lastResult,
  };
}

export default useCapabilities;
