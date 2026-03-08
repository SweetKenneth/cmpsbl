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

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import type { SubstrateModule } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';
import { initializeNeuralSubstrate, shutdownNeuralSubstrate } from '@/lib/substrate/neural';
import { isEditorPreviewEnv } from '@/lib/system/isLovableEditorPreviewEnv';

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
  'ripple', 'access', 'system', 'modernizer', 'integration', 'inclusive',
  'cortex', 'memory', 'relay', 'audit', 'identity', 'economy', 'sandbox',
  'immunity', 'evolution', 'intent', 'governance', 'medic', 'nerve',
  // Expansion Modules (38-Node Architecture)
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

  // Deferred init: when autoInit is false (landing page), skip neural substrate
  // and module polling entirely. These are only relevant for authenticated users
  // in the substrate dashboard and add 40+ API calls that destroy TTI/Speed Index.
  // The SubstrateProvider still provides context defaults so children render fine.
  useEffect(() => {
    if (autoInit) return; // handled by the main effect
    // On landing page: do NOT init neural substrate or poll modules at all.
    // This eliminates brain_*, pf-substrate, and maintenance API calls from
    // the critical rendering path entirely.
    return;
  }, [autoInit]);

  useEffect(() => {
    if (!autoInit) return;
    if (!debugMode.allowModulePolling()) return;
    if (initializedRef.current) return;
    initializedRef.current = true;
    mountedRef.current = true;

    // Initialize Neural Substrate Layer (fully automated maintenance)
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

  // Topology-weighted health aggregation
  const SYSTEM_LAYER: SubstrateModule[] = ['system'];
  const CCR_ZONES: SubstrateModule[] = ['brain', 'memory', 'dream'];
  const OCG_ZONES: SubstrateModule[] = ['ripple', 'access', 'identity', 'relay', 'audit'];
  const EXEC_SURFACES: SubstrateModule[] = ['decode', 'encode', 'vision', 'cortex', 'nexus', 'economy', 'sandbox', 'inclusive', 'integration'];
  const FIELDS: SubstrateModule[] = ['evolution', 'immunity', 'intent'];
  const PLANE: SubstrateModule[] = ['governance'];
  const SHELL: SubstrateModule[] = ['defense'];

  const avgHealth = (keys: SubstrateModule[]) => {
    const vals = keys.map(k => modules[k]?.health ?? 0);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const layers: LayerHealth = {
    core: modules.core?.health ?? 0,
    system: avgHealth(SYSTEM_LAYER),
    ccr: avgHealth(CCR_ZONES),
    ocg: avgHealth(OCG_ZONES),
    surfaces: avgHealth(EXEC_SURFACES),
    fields: avgHealth(FIELDS),
    plane: avgHealth(PLANE),
    shell: avgHealth(SHELL),
  };

  // Weighted health: CORE=20%, SYSTEM=5%, CCR=15%, OCG=20%, Execution=25%, Fields=9%, Plane=3%, Shell=3%
  const overallHealth = Math.min(100, Math.round(
    layers.core * 0.20 +
    layers.system * 0.05 +
    layers.ccr * 0.15 +
    layers.ocg * 0.20 +
    layers.surfaces * 0.25 +
    layers.fields * 0.09 +
    layers.plane * 0.03 +
    layers.shell * 0.03
  ));

  return (
    <SubstrateContext.Provider value={{ initialized, modules, overallHealth, layers, refresh }}>
      {children}
    </SubstrateContext.Provider>
  );
}
