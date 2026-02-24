/**
 * promptfluid® Substrate Provider
 * CCL Epoch — Cognitive Orchestration Substrate (12-Module Architecture)
 * 
 * CCR (Layer 0) absorbs CORE+SYSTEM+BRAIN+MEMORY+DREAM as hidden meta-engine.
 * CCL (Layer 1) absorbs RIPPLE+ACCESS+IDENTITY+RELAY as infrastructure convergence.
 * Performance: Lazy-loads substrate module, uses requestIdleCallback.
 * Stability: Single initialization, no polling loops during idle, 
 *            proper cleanup on unmount.
 * Wraps the application with substrate context and auto-initialization
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import type { SubstrateModule } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

interface ModuleStatus {
  active: boolean;
  lastCheck: string;
  health: number;
}

interface SubstrateContextType {
  initialized: boolean;
  modules: Record<SubstrateModule, ModuleStatus>;
  overallHealth: number;
  refresh: () => Promise<void>;
}

const defaultModuleStatus: ModuleStatus = {
  active: false,
  lastCheck: '',
  health: 0,
};

const SubstrateContext = createContext<SubstrateContextType>({
  initialized: false,
  modules: {
    core: defaultModuleStatus,
    brain: defaultModuleStatus,
    decode: defaultModuleStatus,
    defense: defaultModuleStatus,
    nexus: defaultModuleStatus,
    vision: defaultModuleStatus,
    dream: defaultModuleStatus,
    ripple: defaultModuleStatus,
    access: defaultModuleStatus,
    system: defaultModuleStatus,
    modernizer: defaultModuleStatus,
    integration: defaultModuleStatus,
    inclusive: defaultModuleStatus,
    cortex: defaultModuleStatus,
    encode: defaultModuleStatus,
    memory: defaultModuleStatus,
    relay: defaultModuleStatus,
    audit: defaultModuleStatus,
    identity: defaultModuleStatus,
    economy: defaultModuleStatus,
    sandbox: defaultModuleStatus,
  },
  overallHealth: 0,
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
  const [modules, setModules] = useState<Record<SubstrateModule, ModuleStatus>>({
    core: defaultModuleStatus,
    brain: defaultModuleStatus,
    decode: defaultModuleStatus,
    defense: defaultModuleStatus,
    nexus: defaultModuleStatus,
    vision: defaultModuleStatus,
    dream: defaultModuleStatus,
    ripple: defaultModuleStatus,
    access: defaultModuleStatus,
    system: defaultModuleStatus,
    modernizer: defaultModuleStatus,
    integration: defaultModuleStatus,
    inclusive: defaultModuleStatus,
    cortex: defaultModuleStatus,
    encode: defaultModuleStatus,
    memory: defaultModuleStatus,
    relay: defaultModuleStatus,
    audit: defaultModuleStatus,
    identity: defaultModuleStatus,
    economy: defaultModuleStatus,
    sandbox: defaultModuleStatus,
  });
  
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
    // Respect debug mode kill-switch
    if (!debugMode.allowModulePolling()) return;

    // Don't refresh if unmounted
    if (!mountedRef.current) return;

    // Check 16 public modules (CCR facades handled internally)
    const moduleList: SubstrateModule[] = ['decode', 'encode', 'defense', 'nexus', 'vision', 'ripple', 'access', 'modernizer', 'integration', 'inclusive', 'cortex', 'relay', 'audit', 'economy', 'sandbox', 'cortex'];
    const results = await Promise.all(moduleList.map(checkModule));

    const newModules = moduleList.reduce((acc, module, index) => {
      acc[module] = results[index];
      return acc;
    }, {} as Record<SubstrateModule, ModuleStatus>);

    // Only update state if still mounted
    if (mountedRef.current) {
      setModules(prev => ({ ...prev, ...newModules }));
      setInitialized(true);
    }
  }, [checkModule]);

  useEffect(() => {
    if (!autoInit) return;

    // Respect debug mode kill-switch
    if (!debugMode.allowModulePolling()) return;

    // Prevent double-initialization in strict mode
    if (initializedRef.current) return;
    initializedRef.current = true;
    mountedRef.current = true;

    // Defer initialization to avoid blocking main thread during initial render
    // Increased interval to 5 minutes to reduce polling overhead and improve stability
    const startRefreshInterval = () => {
      if (!mountedRef.current) return;
      if (!debugMode.allowModulePolling()) return;

      refresh();
      // Only set up interval if tab is visible
      if (document.visibilityState === 'visible') {
        intervalRef.current = setInterval(() => {
          if (!debugMode.allowModulePolling()) return;
          // Skip refresh if tab is hidden
          if (document.visibilityState !== 'visible') return;
          refresh();
        }, 300000); // Refresh every 5 minutes
      }
    };
    
    // Use requestIdleCallback if available, otherwise use setTimeout
    // Wait for page load first to minimize main-thread work during critical render
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
    
    // Wait for document to be fully loaded before scheduling
    if (document.readyState === 'complete') {
      return scheduleInit();
    } else {
      const cleanup = { fn: () => {} };
      const onLoad = () => {
        cleanup.fn = scheduleInit() || (() => {});
      };
      window.addEventListener('load', onLoad, { once: true });
      return () => {
        window.removeEventListener('load', onLoad);
        cleanup.fn();
      };
    }
    
    // Cleanup function
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoInit, refresh]);

  // Calculate overall health from all initialized modules — clamped to 0-100
  const activeModules = Object.values(modules).filter(m => m.health > 0);
  const overallHealth = Math.min(100, activeModules.length > 0
    ? activeModules.reduce((sum, m) => sum + m.health, 0) / activeModules.length
    : 0);

  return (
    <SubstrateContext.Provider value={{ initialized, modules, overallHealth, refresh }}>
      {children}
    </SubstrateContext.Provider>
  );
}
