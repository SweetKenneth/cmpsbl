/**
 * useSystem Hook — SYSTEM zone (Administration) operations
 * 
 * Part of the 38-Node / 12-Sector Field-Based Topology
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';

// Access system module from substrate singleton
const system = substrate.system;

export interface UseSystemReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  version: ReturnType<typeof useQuery>;
  diagnostics: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  modules: ReturnType<typeof useQuery>;
  
  // Queries
  config: (key?: string) => ReturnType<typeof useQuery>;
  audit: (since?: string, type?: string) => ReturnType<typeof useQuery>;
  module: (name: string) => ReturnType<typeof useQuery>;
  backups: ReturnType<typeof useQuery>;
  
  // Actions
  heal: ReturnType<typeof useMutation>;
  restart: ReturnType<typeof useMutation>;
  backup: ReturnType<typeof useMutation>;
  restore: ReturnType<typeof useMutation>;
  
  // Upgrade Engine
  upgrade: {
    propose: ReturnType<typeof useMutation>;
    listPlans: ReturnType<typeof useQuery>;
    getPlan: (planId: string) => ReturnType<typeof useQuery>;
    applyPlan: ReturnType<typeof useMutation>;
    rollbackPlan: ReturnType<typeof useMutation>;
  };
}

export function useSystem(): UseSystemReturn {
  const queryClient = useQueryClient();
  
  const invalidateSystem = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'system'] });
  };
  
  const status = useQuery({
    queryKey: ['substrate', 'system', 'status'],
    queryFn: () => system.status(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const health = useQuery({
    queryKey: ['substrate', 'system', 'health'],
    queryFn: () => system.health(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const version = useQuery({
    queryKey: ['substrate', 'system', 'version'],
    queryFn: () => system.version(),
    staleTime: 300000, // 5 minutes
  });
  
  const diagnostics = useQuery({
    queryKey: ['substrate', 'system', 'diagnostics'],
    queryFn: () => system.diagnostics({ full: true }),
    staleTime: 60000,
  });
  
  const resilience = useQuery({
    queryKey: ['substrate', 'system', 'resilience'],
    queryFn: () => system.resilience(),
    refetchInterval: 60000,
    staleTime: 30000,
  });
  
  const modules = useQuery({
    queryKey: ['substrate', 'system', 'modules'],
    queryFn: () => system.modules({ full: true, health: true }),
    staleTime: 60000,
  });
  
  const config = (key?: string) => useQuery({
    queryKey: ['substrate', 'system', 'config', key],
    queryFn: () => system.config(key),
    staleTime: 30000,
  });
  
  const audit = (since?: string, type?: string) => useQuery({
    queryKey: ['substrate', 'system', 'audit', since, type],
    queryFn: () => system.audit(since, type),
    staleTime: 30000,
  });
  
  const module = (name: string) => useQuery({
    queryKey: ['substrate', 'system', 'module', name],
    queryFn: () => system.module(name),
    staleTime: 60000,
  });
  
  const backups = useQuery({
    queryKey: ['substrate', 'system', 'backups'],
    queryFn: () => system.listBackups(),
    staleTime: 60000,
  });
  
  const heal = useMutation({
    mutationFn: (params?: { target?: string; force?: boolean }) => 
      system.heal(params?.target, params?.force),
    onSuccess: invalidateSystem,
  });
  
  const restart = useMutation({
    mutationFn: (service?: string) => system.restart(service),
    onSuccess: invalidateSystem,
  });
  
  const backup = useMutation({
    mutationFn: (options?: { include_data?: boolean; tables?: string[] }) => 
      system.backup(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'system', 'backups'] });
    },
  });
  
  const restore = useMutation({
    mutationFn: (params: { backupId: string; validateOnly?: boolean }) => 
      system.restore(params.backupId, params.validateOnly),
    onSuccess: invalidateSystem,
  });
  
  // Upgrade Engine
  const upgradePropose = useMutation({
    mutationFn: (options?: { scope?: string; notes?: string; max_changes?: number }) => 
      system.upgrade.propose(options),
  });
  
  const upgradePlans = useQuery({
    queryKey: ['substrate', 'system', 'upgrade', 'plans'],
    queryFn: () => system.upgrade.listPlans(),
    staleTime: 30000,
  });
  
  const getUpgradePlan = (planId: string) => useQuery({
    queryKey: ['substrate', 'system', 'upgrade', 'plan', planId],
    queryFn: () => system.upgrade.getPlan(planId),
    staleTime: 30000,
    enabled: !!planId,
  });
  
  const applyUpgradePlan = useMutation({
    mutationFn: (planId: string) => system.upgrade.applyPlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'system', 'upgrade'] });
      invalidateSystem();
    },
  });
  
  const rollbackUpgradePlan = useMutation({
    mutationFn: (planId: string) => system.upgrade.rollbackPlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'system', 'upgrade'] });
      invalidateSystem();
    },
  });
  
  return {
    status,
    health,
    version,
    diagnostics,
    resilience,
    modules,
    config,
    audit,
    module,
    backups,
    heal,
    restart,
    backup,
    restore,
    upgrade: {
      propose: upgradePropose,
      listPlans: upgradePlans,
      getPlan: getUpgradePlan,
      applyPlan: applyUpgradePlan,
      rollbackPlan: rollbackUpgradePlan,
    },
  };
}

export default useSystem;
