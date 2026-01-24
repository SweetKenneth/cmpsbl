/**
 * promptfluid® Substrate Provider
 * v4.2.0 — Cognitive Orchestration Substrate (12-Module Architecture)
 * 
 * Wraps the application with substrate context and auto-initialization
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { substrate, SubstrateModule } from '@/lib/substrate';

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
  });

  const checkModule = async (module: SubstrateModule): Promise<ModuleStatus> => {
    try {
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
  };

  const refresh = async () => {
    // Check all 12 substrate modules (v4.2.0 full kernel architecture)
    const moduleList: SubstrateModule[] = ['core', 'ripple', 'access', 'brain', 'decode', 'defense', 'nexus', 'vision', 'dream', 'system', 'modernizer', 'integration'];
    const results = await Promise.all(moduleList.map(checkModule));
    
    const newModules = moduleList.reduce((acc, module, index) => {
      acc[module] = results[index];
      return acc;
    }, {} as Record<SubstrateModule, ModuleStatus>);

    setModules(prev => ({ ...prev, ...newModules }));
    setInitialized(true);
  };

  useEffect(() => {
    if (autoInit) {
      // Defer initialization to avoid blocking main thread during initial render
      const deferredInit = () => {
        refresh();
        const interval = setInterval(refresh, 60000); // Refresh every minute
        return () => clearInterval(interval);
      };
      
      // Use requestIdleCallback if available, otherwise use setTimeout
      if ('requestIdleCallback' in window) {
        const handle = (window as Window & { requestIdleCallback: (cb: () => void, options?: { timeout: number }) => number }).requestIdleCallback(deferredInit, { timeout: 3000 });
        return () => {
          if ('cancelIdleCallback' in window) {
            (window as Window & { cancelIdleCallback: (handle: number) => void }).cancelIdleCallback(handle);
          }
        };
      } else {
        const timeout = setTimeout(deferredInit, 1000);
        return () => clearTimeout(timeout);
      }
    }
  }, [autoInit]);

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
