/**
 * promptfluid® Substrate Provider
 * v6.0.0 — Cognitive Orchestration Substrate (14-Module Architecture)
 * 
 * Performance: Lazy-loads substrate module, uses requestIdleCallback
 * Full-system audit completed: 2026-01-27
 * Wraps the application with substrate context and auto-initialization
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import type { SubstrateModule } from '@/lib/substrate';

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
  });
  
  const substrateRef = useRef<typeof import('@/lib/substrate').substrate | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    // Check all 14 substrate modules (13 core + cortex orchestrator)
    const moduleList: SubstrateModule[] = ['core', 'ripple', 'access', 'brain', 'decode', 'system', 'inclusive', 'defense', 'nexus', 'vision', 'dream', 'modernizer', 'integration', 'cortex'];
    const results = await Promise.all(moduleList.map(checkModule));
    
    const newModules = moduleList.reduce((acc, module, index) => {
      acc[module] = results[index];
      return acc;
    }, {} as Record<SubstrateModule, ModuleStatus>);

    setModules(prev => ({ ...prev, ...newModules }));
    setInitialized(true);
  }, [checkModule]);

  useEffect(() => {
    if (!autoInit) return;
    
    // Defer initialization to avoid blocking main thread during initial render
    // Increased interval to 5 minutes to reduce polling overhead and improve stability
    const startRefreshInterval = () => {
      refresh();
      intervalRef.current = setInterval(refresh, 300000); // Refresh every 5 minutes
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
  }, [autoInit, refresh]);

  // Calculate overall health from all initialized modules
  const activeModules = Object.values(modules).filter(m => m.health > 0);
  const overallHealth = activeModules.length > 0 
    ? activeModules.reduce((sum, m) => sum + m.health, 0) / activeModules.length 
    : 0;

  return (
    <SubstrateContext.Provider value={{ initialized, modules, overallHealth, refresh }}>
      {children}
    </SubstrateContext.Provider>
  );
}
