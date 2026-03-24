/**
 * CMPSBL® Substrate Provider
 * Field-Based Topology
 *
 * Spine: CORE → SYSTEM → CCR → Modules → INTEGRATION
 * Grid: OCG (Operational Compliance Grid)
 * Fields: EVOLUTION / IMMUNITY / INTENT
 * Plane: GOVERNANCE
 * Shell: DEFENSE
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef, useMemo } from 'react';
import type { SubstrateModule } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';
import { initializeNeuralSubstrate, shutdownNeuralSubstrate } from '@/lib/substrate/neural';

interface ModuleStatus {
  active: boolean;
  lastCheck: string;
  health: number;
}

/** Topology-weighted health breakdown */
export interface LayerHealth {
  core: number;
  system: number;
  ccr: number;
  ocg: number;
  surfaces: number;
  fields: number;
  plane: number;
  shell: number;
}

interface SubstrateContextType {
  initialized: boolean;
  modules: Record<SubstrateModule, ModuleStatus>;
  overallHealth: number;
  layers: LayerHealth;
  refresh: () => Promise<void>;
}

const defaultModuleStatus: ModuleStatus = {
  active: false,
  lastCheck: '',
  health: 0,
};

// All entries including facades for backward compat
const ALL_MODULES: SubstrateModule[] = [
  'core', 'brain', 'decode', 'encode', 'defense', 'nexus', 'vision', 'dream',
  'ripple', 'access', 'system', 'evolution', 'integration', 'inclusive',
  'cortex', 'memory', 'relay', 'audit', 'identity', 'economy', 'sandbox',
  'immunity', 'evolution', 'intent', 'governance', 'medic', 'nerve',
  // Expansion Modules (40-Node Architecture)
  'sovereign', 'oracle', 'conscience', 'phantom', 'forge',
  'lingua', 'compass', 'echo', 'treaty', 'harvest', 'reflex', 'shadow',
];

const defaultModules = ALL_MODULES.reduce((acc, m) => {
  acc[m] = defaultModuleStatus;
  return acc;
}, {} as Record<SubstrateModule, ModuleStatus>);

const DEFAULT_LAYERS: LayerHealth = { core: 0, system: 0, ccr: 0, ocg: 0, surfaces: 0, fields: 0, plane: 0, shell: 0 };

const SubstrateContext = createContext<SubstrateContextType>({
  initialized: false,
  modules: defaultModules,
  overallHealth: 0,
  layers: DEFAULT_LAYERS,
  refresh: async () => {},
});

export function useSubstrateContext() {
  return useContext(SubstrateContext);
}

interface SubstrateProviderProps {
  children: ReactNode;
  autoInit?: boolean;
}

export function SubstrateProvider({ children, autoInit = true }: SubstrateProviderProps) {
  const [initialized, setInitialized] = useState(false);
  const [modules, setModules] = useState<Record<SubstrateModule, ModuleStatus>>(defaultModules);
  
  const substrateRef = useRef<typeof import('@/lib/substrate').substrate | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const getSubstrate = useCallback(async () => {
    if (!substrateRef.current) {
      const mod = await import('@/lib/substrate');
      substrateRef.current = mod.substrate;
    }
    return substrateRef.current;
  }, []);

  const checkModule = useCallback(async (module: SubstrateModule): Promise<ModuleStatus> => {
    try {
      const substrate = await getSubstrate();
      const response = await substrate.invoke({ module, action: 'status' });
      return {
        active: response.success,
        lastCheck: new Date().toISOString(),
        health: response.success ? 100 : 0,
      };
    } catch {
      return {
        active: false,
        lastCheck: new Date().toISOString(),
        health: 0,
      };
    }
  }, [getSubstrate]);

  const refresh = useCallback(async () => {
    if (!debugMode.allowModulePolling()) return;
    if (!mountedRef.current) return;

    const publicEntities: SubstrateModule[] = [
      // CORE
      'core',
      // 9 Matrix Nodes (INTEGRATION boots last)
      'decode', 'encode', 'vision', 'cortex', 'nexus', 'economy', 'sandbox', 'inclusive', 'integration',
      // Fields
      'evolution', 'immunity', 'intent',
      // Plane
      'governance',
      // Shell
      'defense',
    ];
    const results = await Promise.all(publicEntities.map(checkModule));

    const newModules = publicEntities.reduce((acc, module, index) => {
      acc[module] = results[index];
      return acc;
    }, {} as Record<SubstrateModule, ModuleStatus>);

    if (mountedRef.current) {
      setModules(prev => ({ ...prev, ...newModules }));
      setInitialized(true);
    }
  }, [checkModule]);

  // Deferred init path removed — substrate always boots.
  // Neural substrate init is lightweight (in-memory only, no API calls).
  // Module polling is gated by debugMode.allowModulePolling() internally.

  useEffect(() => {
    if (!autoInit) return;
    if (initializedRef.current) return;
    initializedRef.current = true;
    mountedRef.current = true;

    // Initialize Neural Substrate Layer — always boots (in-memory, no API calls)
    initializeNeuralSubstrate().catch(err => 
      console.warn('[SubstrateProvider] Neural substrate init deferred:', err)
    );

    const startRefreshInterval = () => {
      if (!mountedRef.current) return;
      if (!debugMode.allowModulePolling()) return;

      refresh();
      if (document.visibilityState === 'visible') {
        intervalRef.current = setInterval(() => {
          if (!debugMode.allowModulePolling()) return;
          if (document.visibilityState !== 'visible') return;
          refresh();
        }, 300000);
      }
    };
    
    const scheduleInit = () => {
      if ('requestIdleCallback' in window) {
        const handle = (window as Window & { requestIdleCallback: (cb: () => void, options?: { timeout: number }) => number }).requestIdleCallback(startRefreshInterval, { timeout: 5000 });
        return () => {
          if ('cancelIdleCallback' in window) {
            (window as Window & { cancelIdleCallback: (handle: number) => void }).cancelIdleCallback(handle);
          }
          if (intervalRef.current) clearInterval(intervalRef.current);
        };
      } else {
        const timeout = setTimeout(startRefreshInterval, 2000);
        return () => {
          clearTimeout(timeout);
          if (intervalRef.current) clearInterval(intervalRef.current);
        };
      }
    };
    
    const cleanupMount = () => {
      mountedRef.current = false;
      shutdownNeuralSubstrate();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (document.readyState === 'complete') {
      const cleanupSchedule = scheduleInit();
      return () => {
        cleanupMount();
        cleanupSchedule?.();
      };
    } else {
      const cleanup = { fn: () => {} };
      const onLoad = () => {
        cleanup.fn = scheduleInit() || (() => {});
      };
      window.addEventListener('load', onLoad, { once: true });
      return () => {
        cleanupMount();
        window.removeEventListener('load', onLoad);
        cleanup.fn();
      };
    }
  }, [autoInit, refresh]);

  // Topology-weighted health aggregation — memoized to prevent re-render cascades
  const { layers, overallHealth } = useMemo(() => {
    const avgHealth = (keys: SubstrateModule[]) => {
      const vals = keys.map(k => modules[k]?.health ?? 0);
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    };

    const l: LayerHealth = {
      core: modules.core?.health ?? 0,
      system: avgHealth(['system']),
      ccr: avgHealth(['brain', 'memory', 'dream']),
      ocg: avgHealth(['ripple', 'access', 'identity', 'relay', 'audit']),
      surfaces: avgHealth(['decode', 'encode', 'vision', 'cortex', 'nexus', 'economy', 'sandbox', 'inclusive', 'integration']),
      fields: avgHealth(['evolution', 'immunity', 'intent']),
      plane: avgHealth(['governance']),
      shell: avgHealth(['defense']),
    };

    const h = Math.min(100, Math.round(
      l.core * 0.20 + l.system * 0.05 + l.ccr * 0.15 + l.ocg * 0.20 +
      l.surfaces * 0.25 + l.fields * 0.09 + l.plane * 0.03 + l.shell * 0.03
    ));

    return { layers: l, overallHealth: h };
  }, [modules]);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
    initialized, modules, overallHealth, layers, refresh
  }), [initialized, modules, overallHealth, layers, refresh]);

  return (
    <SubstrateContext.Provider value={contextValue}>
      {children}
    </SubstrateContext.Provider>
  );
}
