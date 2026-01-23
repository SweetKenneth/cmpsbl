/**
 * Substrate OS Dashboard Hooks
 * Real-time telemetry and control hooks for the OS surface
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate, vision, brain, defense, nexus, dream, system, modernizer, decode, core, ripple, access } from '@/lib/substrate';

// ═══════════════════════════════════════════════════════════════
// OBSERVER HOOKS — Read-only telemetry
// ═══════════════════════════════════════════════════════════════

export function useSystemStatus() {
  return useQuery({
    queryKey: ['substrate', 'system', 'status'],
    queryFn: () => system.status(),
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

export function useSystemVersion() {
  return useQuery({
    queryKey: ['substrate', 'system', 'version'],
    queryFn: () => system.version(),
    staleTime: 60000, // Version rarely changes
  });
}

export function useVisionHealthOS() {
  return useQuery({
    queryKey: ['substrate', 'vision', 'health'],
    queryFn: () => vision.health(),
    refetchInterval: 15000,
    staleTime: 5000,
  });
}

export function useVisionMetricsOS() {
  return useQuery({
    queryKey: ['substrate', 'vision', 'metrics'],
    queryFn: () => vision.metrics(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

export function useVisionLogsOS(moduleFilter?: string, limit: number = 10) {
  return useQuery({
    queryKey: ['substrate', 'vision', 'logs', moduleFilter, limit],
    queryFn: () => vision.logs(moduleFilter as any, limit),
    refetchInterval: 30000,
  });
}

export function useVisionAudit() {
  return useQuery({
    queryKey: ['substrate', 'vision', 'audit'],
    queryFn: () => vision.audit(),
    staleTime: 30000,
  });
}

export function useBrainStatusOS() {
  return useQuery({
    queryKey: ['substrate', 'brain', 'status'],
    queryFn: () => brain.status(),
    refetchInterval: 30000,
  });
}

export function useDefenseStatusOS() {
  return useQuery({
    queryKey: ['substrate', 'defense', 'status'],
    queryFn: () => defense.status(),
    refetchInterval: 30000,
  });
}

export function useDefenseRulesOS() {
  return useQuery({
    queryKey: ['substrate', 'defense', 'rules'],
    queryFn: () => defense.rules(),
    staleTime: 60000,
  });
}

export function useNexusStatusOS() {
  return useQuery({
    queryKey: ['substrate', 'nexus', 'status'],
    queryFn: () => nexus.status(),
    refetchInterval: 30000,
  });
}

export function useDreamStatusOS() {
  return useQuery({
    queryKey: ['substrate', 'dream', 'status'],
    queryFn: () => dream.status(),
    refetchInterval: 30000,
  });
}

export function useModernizerStatusOS() {
  return useQuery({
    queryKey: ['substrate', 'modernizer', 'status'],
    queryFn: () => modernizer.status(),
    refetchInterval: 30000,
  });
}

export function useDecodeStatusOS() {
  return useQuery({
    queryKey: ['substrate', 'decode', 'status'],
    queryFn: () => decode.status(),
    refetchInterval: 30000,
  });
}

export function useBrainForecast() {
  return useQuery({
    queryKey: ['substrate', 'brain', 'forecast'],
    queryFn: () => brain.forecast(),
    staleTime: 60000,
  });
}

export function useBrainSynthesis() {
  return useQuery({
    queryKey: ['substrate', 'brain', 'synthesize'],
    queryFn: () => brain.synthesize(),
    staleTime: 60000,
  });
}

// ═══════════════════════════════════════════════════════════════
// OPERATOR HOOKS — Safe action triggers
// ═══════════════════════════════════════════════════════════════

export function useBrainReflectOS() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => brain.reflect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'vision', 'metrics'] });
    },
  });
}

export function useBrainDreamOS() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => brain.dream(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'dream'] });
    },
  });
}

export function useBrainSynthesizeOS() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => brain.synthesize(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
    },
  });
}

export function useDreamCycleOS() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => dream.cycle(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'dream'] });
    },
  });
}

export function useNexusRouteTest() {
  return useMutation({
    mutationFn: (prompt: string) => nexus.route(prompt),
  });
}

// ═══════════════════════════════════════════════════════════════
// GOVERNOR HOOKS — Admin & safety controls
// ═══════════════════════════════════════════════════════════════

export function useSystemAudit() {
  return useQuery({
    queryKey: ['substrate', 'system', 'audit'],
    queryFn: () => system.audit(),
    staleTime: 30000,
  });
}

export function useSystemConfig(key?: string) {
  return useQuery({
    queryKey: ['substrate', 'system', 'config', key],
    queryFn: () => system.config(key),
    staleTime: 60000,
  });
}

// Combined health score for dashboard - all 11 modules
export function useSubstrateHealthScore() {
  const visionHealth = useVisionHealthOS();
  const brainStatus = useBrainStatusOS();
  const defenseStatus = useDefenseStatusOS();
  const nexusStatus = useNexusStatusOS();
  const dreamStatus = useDreamStatusOS();
  const modernizerStatus = useModernizerStatusOS();
  const decodeStatus = useDecodeStatusOS();
  const systemStatus = useSystemStatus();
  const coreStatus = useCoreStatusOS();
  const rippleStatus = useRippleStatusOS();
  const accessStatus = useAccessStatusOS();

  const isLoading = 
    visionHealth.isLoading || 
    brainStatus.isLoading || 
    defenseStatus.isLoading || 
    nexusStatus.isLoading ||
    dreamStatus.isLoading ||
    modernizerStatus.isLoading ||
    decodeStatus.isLoading ||
    systemStatus.isLoading ||
    coreStatus.isLoading ||
    rippleStatus.isLoading ||
    accessStatus.isLoading;

  const modules = {
    // Kernel Layer
    core: coreStatus.data?.success ?? false,
    ripple: rippleStatus.data?.success ?? false,
    access: accessStatus.data?.success ?? false,
    // Cognitive Layer
    brain: brainStatus.data?.success ?? false,
    decode: decodeStatus.data?.success ?? false,
    nexus: nexusStatus.data?.success ?? false,
    // Operational Layer
    defense: defenseStatus.data?.success ?? false,
    vision: visionHealth.data?.success ?? false,
    dream: dreamStatus.data?.success ?? false,
    // Admin Layer
    system: systemStatus.data?.success ?? false,
    modernizer: modernizerStatus.data?.success ?? false,
  };

  const healthyCount = Object.values(modules).filter(Boolean).length;
  const totalModules = 11;
  const healthScore = Math.round((healthyCount / totalModules) * 100);

  const refetchAll = () => {
    visionHealth.refetch();
    brainStatus.refetch();
    defenseStatus.refetch();
    nexusStatus.refetch();
    dreamStatus.refetch();
    modernizerStatus.refetch();
    decodeStatus.refetch();
    systemStatus.refetch();
    coreStatus.refetch();
    rippleStatus.refetch();
    accessStatus.refetch();
  };

  return {
    isLoading,
    modules,
    healthScore,
    activeCount: healthyCount,
    totalModules,
    isHealthy: healthScore >= 80,
    isDegraded: healthScore >= 40 && healthScore < 80,
    isDown: healthScore < 40,
    refetch: refetchAll,
  };
}

// ═══════════════════════════════════════════════════════════════
// KERNEL MODULE HOOKS — Core, Ripple, Access (v4.0.0)
// ═══════════════════════════════════════════════════════════════

export function useCoreStatusOS() {
  return useQuery({
    queryKey: ['substrate', 'core', 'status'],
    queryFn: () => core.status(),
    refetchInterval: 30000,
  });
}

export function useRippleStatusOS() {
  return useQuery({
    queryKey: ['substrate', 'ripple', 'status'],
    queryFn: () => ripple.status(),
    refetchInterval: 30000,
  });
}

export function useAccessStatusOS() {
  return useQuery({
    queryKey: ['substrate', 'access', 'status'],
    queryFn: () => access.status(),
    refetchInterval: 30000,
  });
}
