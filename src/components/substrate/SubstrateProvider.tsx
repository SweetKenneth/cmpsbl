/**
 * promptfluid® Substrate Provider
 * v2026.01 — Cognitive Orchestration Substrate
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
    brain: defaultModuleStatus,
    cascade: defaultModuleStatus,
    defense: defaultModuleStatus,
    nexus: defaultModuleStatus,
    vision: defaultModuleStatus,
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
    brain: defaultModuleStatus,
    cascade: defaultModuleStatus,
    defense: defaultModuleStatus,
    nexus: defaultModuleStatus,
    vision: defaultModuleStatus,
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
    const moduleList: SubstrateModule[] = ['brain', 'cascade', 'defense', 'nexus', 'vision'];
    const results = await Promise.all(moduleList.map(checkModule));
    
    const newModules = moduleList.reduce((acc, module, index) => {
      acc[module] = results[index];
      return acc;
    }, {} as Record<SubstrateModule, ModuleStatus>);

    setModules(newModules);
    setInitialized(true);
  };

  useEffect(() => {
    if (autoInit) {
      refresh();
      const interval = setInterval(refresh, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [autoInit]);

  const overallHealth = Object.values(modules).reduce((sum, m) => sum + m.health, 0) / 5;

  return (
    <SubstrateContext.Provider value={{ initialized, modules, overallHealth, refresh }}>
      {children}
    </SubstrateContext.Provider>
  );
}
