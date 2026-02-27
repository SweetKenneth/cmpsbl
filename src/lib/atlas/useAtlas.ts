/**
 * Atlas React Hook
 * React integration for Atlas Control Plane
 */

import { useState, useCallback, useEffect } from 'react';
import { atlas, type AtlasState, type AtlasMode, type CapabilityId, type ActionCard } from './index';

export interface UseAtlasReturn {
  state: AtlasState;
  loading: boolean;
  
  // Mode management
  mode: AtlasMode;
  setMode: (mode: AtlasMode) => Promise<void>;
  
  // Capability management
  isEnabled: (id: CapabilityId) => boolean;
  toggleCapability: (id: CapabilityId, enabled: boolean) => Promise<void>;
  
  // Action cards
  pendingActions: ActionCard[];
  approveAction: (cardId: string) => Promise<boolean>;
  rejectAction: (cardId: string, reason: string) => Promise<boolean>;
  
  // Dry run
  dryRun: (action: string, module: string, payload: Record<string, unknown>) => Promise<{
    success: boolean;
    preview: string;
    affectedModules: string[];
    risks: string[];
  }>;
  
  // Refresh
  refresh: () => Promise<void>;
}

export function useAtlas(): UseAtlasReturn {
  const [state, setState] = useState<AtlasState>(atlas.getState());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await atlas.syncFromDatabase();
      setState(atlas.getState());
    } finally {
      setLoading(false);
    }
  }, []);

  const setMode = useCallback(async (mode: AtlasMode) => {
    setLoading(true);
    try {
      await atlas.setMode(mode, 'user');
      setState(atlas.getState());
    } finally {
      setLoading(false);
    }
  }, []);

  const isEnabled = useCallback((id: CapabilityId) => {
    return atlas.isCapabilityEnabled(id);
  }, []);

  const toggleCapability = useCallback(async (id: CapabilityId, enabled: boolean) => {
    setLoading(true);
    try {
      await atlas.toggleCapability(id, enabled, 'user');
      await atlas.persistToDatabase();
      setState(atlas.getState());
    } finally {
      setLoading(false);
    }
  }, []);

  const approveAction = useCallback(async (cardId: string): Promise<boolean> => {
    const result = await atlas.approveActionCard(cardId, 'user');
    setState(atlas.getState());
    return result.success;
  }, []);

  const rejectAction = useCallback(async (cardId: string, reason: string): Promise<boolean> => {
    const result = await atlas.rejectActionCard(cardId, reason);
    setState(atlas.getState());
    return result.success;
  }, []);

  const dryRun = useCallback(async (action: string, module: string, payload: Record<string, unknown>) => {
    return atlas.dryRun(action, module, payload);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    state,
    loading,
    mode: state.mode,
    setMode,
    isEnabled,
    toggleCapability,
    pendingActions: atlas.getPendingActions(),
    approveAction,
    rejectAction,
    dryRun,
    refresh,
  };
}
