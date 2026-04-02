/**
 * useSystem Hook — SYSTEM zone (Administration) operations
 * 
 * Part of the 40-Primitive / 12-Sector Field-Based Topology
 * Fixed: All queries are top-level useQuery calls (no Rules-of-Hooks violations).
 * Fixed: Respects debugMode.allowModulePolling() kill-switch.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

const system = substrate.system;

export interface UseSystemReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  version: ReturnType<typeof useQuery>;
  diagnostics: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  modules: ReturnType<typeof useQuery>;
  backups: ReturnType<typeof useQuery>;
  
  // Actions
  heal: ReturnType<typeof useMutation>;
  restart: ReturnType<typeof useMutation>;
  backup: ReturnType<typeof useMutation>;
  restore: ReturnType<typeof useMutation>;
  
  // Config & Audit — mutations for parameterized access
  fetchConfig: ReturnType<typeof useMutation>;
  fetchAudit: ReturnType<typeof useMutation>;
  fetchModule: ReturnType<typeof useMutation>;
  
  // Upgrade Engine
  upgrade: {
    propose: ReturnType<typeof useMutation>;
    listPlans: ReturnType<typeof useQuery>;
    applyPlan: ReturnType<typeof useMutation>;
    rollbackPlan: ReturnType<typeof useMutation>;
    fetchPlan: ReturnType<typeof useMutation>;
  };
}

export function useSystem(): UseSystemReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  
  const invalidateSystem = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'system'] });
  };
  
  const status = useQuery({
    queryKey: ['substrate', 'system', 'status'],
    queryFn: () => system.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const health = useQuery({
    queryKey: ['substrate', 'system', 'health'],
    queryFn: () => system.health(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const version = useQuery({
    queryKey: ['substrate', 'system', 'version'],
    queryFn: () => system.version(),
    staleTime: 300000,
    enabled: pollingEnabled,
  });
  
  const diagnostics = useQuery({
    queryKey: ['substrate', 'system', 'diagnostics'],
    queryFn: () => system.diagnostics({ full: true }),
    staleTime: 60000,
    enabled: pollingEnabled,
  });
  
  const resilience = useQuery({
    queryKey: ['substrate', 'system', 'resilience'],
    queryFn: () => system.resilience(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });
  
  const modules = useQuery({
    queryKey: ['substrate', 'system', 'modules'],
    queryFn: () => system.modules({ full: true, health: true }),
    staleTime: 60000,
    enabled: pollingEnabled,
  });
  
  const backups = useQuery({
    queryKey: ['substrate', 'system', 'backups'],
    queryFn: () => system.listBackups(),
    staleTime: 60000,
    enabled: pollingEnabled,
  });
  
  // Parameterized queries converted to mutations to avoid Rules-of-Hooks violations
  const fetchConfig = useMutation({
    mutationFn: (key?: string) => system.config(key),
  });
  
  const fetchAudit = useMutation({
    mutationFn: (params?: { since?: string; type?: string }) =>
      system.audit(params?.since, params?.type),
  });
  
  const fetchModule = useMutation({
    mutationFn: (name: string) => system.module(name),
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
    enabled: pollingEnabled,
  });
  
  const fetchPlan = useMutation({
    mutationFn: (planId: string) => system.upgrade.getPlan(planId),
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
    backups,
    fetchConfig,
    fetchAudit,
    fetchModule,
    heal,
    restart,
    backup,
    restore,
    upgrade: {
      propose: upgradePropose,
      listPlans: upgradePlans,
      fetchPlan,
      applyPlan: applyUpgradePlan,
      rollbackPlan: rollbackUpgradePlan,
    },
  };
}

export default useSystem;
