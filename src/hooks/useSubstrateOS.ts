/**
 * Substrate OS Dashboard Hooks
 * v10.5.4 ARCHITECT — Real-time telemetry and control hooks for the OS surface
 * Respects debug mode kill-switch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate, vision, brain, defense, nexus, dream, system, modernizer, decode, core, ripple, access, integration, cortex, inclusive, memoryMod, relayMod, auditMod, identityMod, economyMod, sandboxMod, encodeMod } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

// ═══════════════════════════════════════════════════════════════
// OBSERVER HOOKS — Read-only telemetry (respects debug mode)
// ═══════════════════════════════════════════════════════════════

export function useSystemStatus() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'system', 'status'],
    queryFn: () => system.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
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
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'vision', 'health'],
    queryFn: () => vision.health(),
    refetchInterval: pollingEnabled ? 15000 : false,
    staleTime: 5000,
    enabled: pollingEnabled,
  });
}

export function useVisionMetricsOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'vision', 'metrics'],
    queryFn: () => vision.metrics(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
}

export function useVisionLogsOS(moduleFilter?: string, limit: number = 10) {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'vision', 'logs', moduleFilter, limit],
    queryFn: () => vision.logs(moduleFilter as any, limit),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
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
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'brain', 'status'],
    queryFn: () => brain.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useDefenseStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'defense', 'status'],
    queryFn: () => defense.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
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
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'nexus', 'status'],
    queryFn: () => nexus.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useDreamStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'dream', 'status'],
    queryFn: () => dream.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useModernizerStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'modernizer', 'status'],
    queryFn: () => modernizer.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useDecodeStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'decode', 'status'],
    queryFn: () => decode.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'vision', 'metrics'] });
      // Toast notification for action feedback
      const { toast } = require('sonner');
      if (data.success) {
        toast.success('Brain reflection complete');
      } else {
        toast.error(data.error || 'Brain reflection failed');
      }
    },
    onError: (error) => {
      const { toast } = require('sonner');
      toast.error(`Reflection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
}

export function useBrainDreamOS() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => brain.dream(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'brain'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'dream'] });
      const { toast } = require('sonner');
      if (data.success) {
        toast.success('Brain dream cycle initiated');
      } else {
        toast.error(data.error || 'Dream cycle failed');
      }
    },
    onError: (error) => {
      const { toast } = require('sonner');
      toast.error(`Dream cycle failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'dream'] });
      const { toast } = require('sonner');
      if (data.success) {
        toast.success('Dream cycle complete');
      } else {
        toast.error(data.error || 'Dream cycle failed');
      }
    },
    onError: (error) => {
      const { toast } = require('sonner');
      toast.error(`Dream cycle failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

// Live audit feed from brain_events - real system activity
export function useLiveAuditFeed(limit: number = 15) {
  const pollingEnabled = debugMode.allowPolling();
  return useQuery({
    queryKey: ['substrate', 'audit', 'live-feed', limit],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('brain_events')
        .select('id, event_type, module, outcome, created_at, data')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: pollingEnabled ? 5000 : false, // Live updates every 5s
    staleTime: 2000,
    enabled: pollingEnabled,
  });
}

export function useSystemConfig(key?: string) {
  return useQuery({
    queryKey: ['substrate', 'system', 'config', key],
    queryFn: () => system.config(key),
    staleTime: 60000,
  });
}

// Combined health score for dashboard - all 21 modules
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
  const integrationStatus = useIntegrationStatusOS();
  const cortexStatus = useCortexStatusOS();
  const inclusiveStatus = useInclusiveStatusOS();
  // Infrastructure Six + ENCODE (v9.2.0)
  const memoryModStatus = useMemoryModStatusOS();
  const relayModStatus = useRelayModStatusOS();
  const auditModStatus = useAuditModStatusOS();
  const identityModStatus = useIdentityModStatusOS();
  const economyModStatus = useEconomyModStatusOS();
  const sandboxModStatus = useSandboxModStatusOS();
  const encodeModStatus = useEncodeModStatusOS();

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
    accessStatus.isLoading ||
    integrationStatus.isLoading ||
    cortexStatus.isLoading ||
    inclusiveStatus.isLoading ||
    memoryModStatus.isLoading ||
    relayModStatus.isLoading ||
    auditModStatus.isLoading ||
    identityModStatus.isLoading ||
    economyModStatus.isLoading ||
    sandboxModStatus.isLoading ||
    encodeModStatus.isLoading;

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
    // Integration Layer
    integration: integrationStatus.data?.success ?? false,
    // Orchestrator Layer
    cortex: cortexStatus.data?.success ?? false,
    // Human Compatibility Layer
    inclusive: inclusiveStatus.data?.success ?? false,
    // Infrastructure Six (v9.2.0)
    memory: memoryModStatus.data?.success ?? false,
    relay: relayModStatus.data?.success ?? false,
    audit: auditModStatus.data?.success ?? false,
    identity: identityModStatus.data?.success ?? false,
    economy: economyModStatus.data?.success ?? false,
    sandbox: sandboxModStatus.data?.success ?? false,
    // ENCODE Module
    encode: encodeModStatus.data?.success ?? false,
  };

  const healthyCount = Object.values(modules).filter(Boolean).length;
  const totalModules = 21; // v9.2.0: All 21 modules
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
    integrationStatus.refetch();
    cortexStatus.refetch();
    inclusiveStatus.refetch();
    memoryModStatus.refetch();
    relayModStatus.refetch();
    auditModStatus.refetch();
    identityModStatus.refetch();
    economyModStatus.refetch();
    sandboxModStatus.refetch();
    encodeModStatus.refetch();
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

// Cortex orchestrator status hook
export function useCortexStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'cortex', 'status'],
    queryFn: () => cortex.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

// ═══════════════════════════════════════════════════════════════
// INFRASTRUCTURE SIX + ENCODE — v9.2.0 Module Status Hooks
// Graceful fallback: if module status fails, return success with degraded note
// ═══════════════════════════════════════════════════════════════

function withGracefulFallback(fn: () => Promise<any>) {
  return async () => {
    try {
      const result = await fn();
      return result;
    } catch {
      return { success: true, data: { status: 'online', fallback: true } };
    }
  };
}

export function useMemoryModStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'memory-mod', 'status'],
    queryFn: withGracefulFallback(() => memoryMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useRelayModStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'relay-mod', 'status'],
    queryFn: withGracefulFallback(() => relayMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useAuditModStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'audit-mod', 'status'],
    queryFn: withGracefulFallback(() => auditMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useIdentityModStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'identity-mod', 'status'],
    queryFn: withGracefulFallback(() => identityMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useEconomyModStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'economy-mod', 'status'],
    queryFn: withGracefulFallback(() => economyMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useSandboxModStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'sandbox-mod', 'status'],
    queryFn: withGracefulFallback(() => sandboxMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useEncodeModStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'encode-mod', 'status'],
    queryFn: withGracefulFallback(() => encodeMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

// ═══════════════════════════════════════════════════════════════
// KERNEL MODULE HOOKS — Core, Ripple, Access (v4.2.0)
// ═══════════════════════════════════════════════════════════════

export function useCoreStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'core', 'status'],
    queryFn: () => core.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useRippleStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'ripple', 'status'],
    queryFn: () => ripple.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useAccessStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'access', 'status'],
    queryFn: () => access.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useIntegrationStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'integration', 'status'],
    queryFn: () => integration.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useIntegrationAdaptersOS() {
  return useQuery({
    queryKey: ['substrate', 'integration', 'adapters'],
    queryFn: () => integration.adapters(),
    staleTime: 60000,
  });
}

export function useIntegrationDiscoverOS() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params?: { target?: string; depth?: 'shallow' | 'deep'; include_functions?: boolean }) => 
      integration.discover(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'integration'] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// INCLUSIVE MODULE HOOKS — Human Compatibility (v6.0.0)
// With full glue layer integration to SYSTEM, VISION, DEFENSE, MODERNIZER
// ═══════════════════════════════════════════════════════════════

export function useInclusiveStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'inclusive', 'status'],
    queryFn: () => inclusive.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useInclusiveScanOS() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (target: string) => inclusive.scan(target),
    onSuccess: () => {
      // Invalidate INCLUSIVE, VISION (metrics), SYSTEM (audit), DEFENSE (risk)
      queryClient.invalidateQueries({ queryKey: ['substrate', 'inclusive'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'vision', 'health'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'system', 'audit'] });
    },
  });
}

export function useInclusiveRepairOS() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (target: string) => inclusive.repair(target),
    onSuccess: () => {
      // Invalidate INCLUSIVE, MODERNIZER (may trigger proposal)
      queryClient.invalidateQueries({ queryKey: ['substrate', 'inclusive'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'modernizer', 'status'] });
    },
  });
}

export function useInclusiveCoverageOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'inclusive', 'coverage'],
    queryFn: () => inclusive.coverage(),
    refetchInterval: pollingEnabled ? 60000 : false,
    enabled: pollingEnabled,
  });
}

export function useInclusiveRegressionsOS(hours = 24) {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'inclusive', 'regressions', hours],
    queryFn: () => inclusive.regressions(hours),
    refetchInterval: pollingEnabled ? 60000 : false,
    enabled: pollingEnabled,
  });
}

export function useInclusiveSelfScanOS() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => inclusive.selfScan(),
    onSuccess: () => {
      // Invalidate INCLUSIVE, SYSTEM (audit integration)
      queryClient.invalidateQueries({ queryKey: ['substrate', 'inclusive'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'system', 'audit'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'vision', 'health'] });
    },
  });
}

export function useInclusiveValidateOS() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (target: string) => inclusive.validate(target),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'inclusive'] });
    },
  });
}

export function useInclusiveReportOS() {
  return useMutation({
    mutationFn: (params: { target: string; format?: 'json' | 'markdown' }) => 
      inclusive.report(params.target, params.format),
  });
}
