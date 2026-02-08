/**
 * Capability State Management
 * v8.0.0 — SYNERGY+ Epoch Enable/Disable State for Governed Capabilities
 * 
 * Controls runtime availability of 269 capabilities without code changes.
 * Disabled capabilities remain registered but are inert (cannot be invoked).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CapabilityState {
  id: string;
  enabled: boolean;
  lastToggled: string;
  toggledBy?: string;
}

interface CapabilityStateStore {
  // State
  capabilities: Map<string, CapabilityState>;
  
  // Actions
  setEnabled: (id: string, enabled: boolean, toggledBy?: string) => void;
  isEnabled: (id: string) => boolean;
  getState: (id: string) => CapabilityState | undefined;
  getAllStates: () => CapabilityState[];
  enableAll: () => void;
  disableAll: () => void;
  reset: () => void;
}

// Store as object for JSON serialization
interface PersistedState {
  capabilities: Record<string, CapabilityState>;
}

const useCapabilityStateStore = create<CapabilityStateStore>()(
  persist(
    (set, get) => ({
      capabilities: new Map<string, CapabilityState>(),
      
      setEnabled: (id: string, enabled: boolean, toggledBy?: string) => {
        set((state) => {
          const newMap = new Map(state.capabilities);
          newMap.set(id, {
            id,
            enabled,
            lastToggled: new Date().toISOString(),
            toggledBy,
          });
          return { capabilities: newMap };
        });
        console.log(`[CapabilityState] ${id} ${enabled ? 'ENABLED' : 'DISABLED'}${toggledBy ? ` by ${toggledBy}` : ''}`);
      },
      
      isEnabled: (id: string) => {
        const state = get().capabilities.get(id);
        // Default to enabled if not explicitly disabled
        return state?.enabled ?? true;
      },
      
      getState: (id: string) => {
        return get().capabilities.get(id);
      },
      
      getAllStates: () => {
        return Array.from(get().capabilities.values());
      },
      
      enableAll: () => {
        set((state) => {
          const newMap = new Map(state.capabilities);
          const now = new Date().toISOString();
          for (const [id, cap] of newMap) {
            newMap.set(id, { ...cap, enabled: true, lastToggled: now });
          }
          return { capabilities: newMap };
        });
        console.log('[CapabilityState] All capabilities ENABLED');
      },
      
      disableAll: () => {
        set((state) => {
          const newMap = new Map(state.capabilities);
          const now = new Date().toISOString();
          for (const [id, cap] of newMap) {
            newMap.set(id, { ...cap, enabled: false, lastToggled: now });
          }
          return { capabilities: newMap };
        });
        console.log('[CapabilityState] All capabilities DISABLED');
      },
      
      reset: () => {
        set({ capabilities: new Map() });
        console.log('[CapabilityState] State reset to defaults');
      },
    }),
    {
      name: 'capability-state-v8',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          
          const parsed = JSON.parse(str) as { state: PersistedState };
          return {
            state: {
              capabilities: new Map(Object.entries(parsed.state.capabilities || {})),
            },
          };
        },
        setItem: (name, value) => {
          const obj = {
            state: {
              capabilities: Object.fromEntries(value.state.capabilities),
            },
          };
          localStorage.setItem(name, JSON.stringify(obj));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

// Export individual functions for easier imports
export const setCapabilityEnabled = (id: string, enabled: boolean, toggledBy?: string) =>
  useCapabilityStateStore.getState().setEnabled(id, enabled, toggledBy);

export const isCapabilityEnabled = (id: string) =>
  useCapabilityStateStore.getState().isEnabled(id);

export const getCapabilityState = (id: string) =>
  useCapabilityStateStore.getState().getState(id);

export const getAllCapabilityStates = () =>
  useCapabilityStateStore.getState().getAllStates();

export const enableAllCapabilities = () =>
  useCapabilityStateStore.getState().enableAll();

export const disableAllCapabilities = () =>
  useCapabilityStateStore.getState().disableAll();

export const resetCapabilityState = () =>
  useCapabilityStateStore.getState().reset();

// Hook for React components
export const useCapabilityState = useCapabilityStateStore;

export default useCapabilityStateStore;
