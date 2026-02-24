/**
 * promptfluid® Substrate Provider
 * SPARTA Epoch — 10-Entity + 5-Mesh + 9-Zone Architecture
 *
 * CORE (standalone) → CCR (Layer 0) → CCL (Layer 1)
 * → 8 Execution Surfaces → 5 Overlays → INTEGRATION
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import type { SubstrateModule } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

interface ModuleStatus {
  active: boolean;
  lastCheck: string;
  health: number;
}

/** Layer-weighted health breakdown */
export interface LayerHealth {
  core: number;
  ccr: number;
  ccl: number;
  surfaces: number;
  overlays: number;
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
  'ripple', 'access', 'system', 'modernizer', 'integration', 'inclusive',
  'cortex', 'memory', 'relay', 'audit', 'identity', 'economy', 'sandbox',
  'immunity', 'evolution', 'intent', 'governance',
];

const defaultModules = ALL_MODULES.reduce((acc, m) => {
  acc[m] = defaultModuleStatus;
  return acc;
}, {} as Record<SubstrateModule, ModuleStatus>);

const DEFAULT_LAYERS: LayerHealth = { core: 0, ccr: 0, ccl: 0, surfaces: 0, overlays: 0 };

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

    // Check 10 public entities + 5 mesh overlays
    const publicEntities: SubstrateModule[] = [
      // CORE
      'core',
      // 9 Modules (INTEGRATION boots last)
      'decode', 'encode', 'vision', 'cortex', 'nexus', 'economy', 'sandbox', 'inclusive', 'integration',
      // 5 Mesh Overlays (DEFENSE outermost → GOVERNANCE innermost)
      'defense', 'immunity', 'evolution', 'intent', 'governance',
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

  useEffect(() => {
    if (!autoInit) return;
    if (!debugMode.allowModulePolling()) return;
    if (initializedRef.current) return;
    initializedRef.current = true;
    mountedRef.current = true;

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

  // 5-layer weighted health aggregation (20% each)
  const CCR_ZONES: SubstrateModule[] = ['system', 'brain', 'memory', 'dream'];
  const CCL_ZONES: SubstrateModule[] = ['ripple', 'access', 'identity', 'relay', 'audit'];
  const EXEC_SURFACES: SubstrateModule[] = ['decode', 'encode', 'vision', 'cortex', 'nexus', 'economy', 'sandbox', 'inclusive', 'integration'];
  const OVERLAYS: SubstrateModule[] = ['defense', 'immunity', 'evolution', 'intent', 'governance'];

  const avgHealth = (keys: SubstrateModule[]) => {
    const vals = keys.map(k => modules[k]?.health ?? 0);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const layers: LayerHealth = {
    core: modules.core?.health ?? 0,
    ccr: avgHealth(CCR_ZONES),
    ccl: avgHealth(CCL_ZONES),
    surfaces: avgHealth(EXEC_SURFACES),
    overlays: avgHealth(OVERLAYS),
  };

  const overallHealth = Math.min(100, Math.round(
    layers.core * 0.20 +
    layers.ccr * 0.20 +
    layers.ccl * 0.20 +
    layers.surfaces * 0.20 +
    layers.overlays * 0.20
  ));

  return (
    <SubstrateContext.Provider value={{ initialized, modules, overallHealth, layers, refresh }}>
      {children}
    </SubstrateContext.Provider>
  );
}
