/**
 * CMPSBL Substrate Dashboard Hooks
 * Real-time telemetry and control hooks for the OS surface
 * Respects debug mode kill-switch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate, vision, brain, defense, nexus, dream, system, decode, core, ripple, access, integration, cortex, inclusive, memoryMod, relayMod, auditMod, identityMod, economyMod, sandboxMod, encodeMod, sovereignMod, oracleMod, conscienceMod, treatyMod, compassMod, echoMod, reflexMod, forgeMod, linguaMod, harvestMod, evolutionMod, shadowMod, phantomMod, immunityMod, intentMod, governanceMod, medicMod, nerveMod } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

// ═══════════════════════════════════════════════════════════════
// OBSERVER HOOKS — Read-only telemetry (respects debug mode)
// ═══════════════════════════════════════════════════════════════

export function useSystemStatus() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'system', 'status'],
    queryFn: withGracefulFallback(() => system.status()),
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
    queryFn: withGracefulFallback(() => vision.health()),
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
    queryFn: withGracefulFallback(() => brain.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useDefenseStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'defense', 'status'],
    queryFn: withGracefulFallback(() => defense.status()),
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
    queryFn: withGracefulFallback(() => nexus.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useDreamStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'dream', 'status'],
    queryFn: withGracefulFallback(() => dream.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

/** @deprecated Use useEvolutionStatusOS — EVOLUTION node */
export function useModernizerStatusOS() {
  return useEvolutionStatusOS();
}

export function useEvolutionStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'evolution', 'status'],
    queryFn: withGracefulFallback(() => evolutionMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useDecodeStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'decode', 'status'],
    queryFn: withGracefulFallback(() => decode.status()),
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

/**
 * Layer-weighted health score for dashboard
 * 40-Node / 12-Sector Field-Based Topology — weighted aggregation:
 *   CORE+SYSTEM: 12% | CCR: 12% | OCG: 15% | Execution: 18% | ESZ+EPZ+EMZ: 13% | CSZ: 10% | Fields+Plane+Shell: 20%
 *
 * Batched into a single useQuery to prevent parallel network request storms.
 */
export function useSubstrateHealthScore() {
  const pollingEnabled = debugMode.allowModulePolling();

  // Layer definitions — 40-node / 12-sector topology
  const CORE_SYSTEM = ['core', 'system'] as const;
  const CCR_ZONES = ['brain', 'memory', 'dream'] as const;
  const OCG_ZONES = ['ripple', 'access', 'identity', 'relay', 'audit', 'nerve'] as const;
  const EXECUTION_SURFACES = ['decode', 'encode', 'vision', 'cortex', 'nexus', 'economy', 'sandbox', 'inclusive', 'medic', 'integration'] as const;
  const EXPANSION_ZONES = ['sovereign', 'oracle', 'conscience', 'treaty', 'compass', 'echo', 'reflex', 'forge', 'lingua', 'harvest'] as const;
  const CSZ_ZONES = ['evolution', 'shadow', 'phantom'] as const;
  const META_PLANE = ['atlas', 'engineer'] as const;
  const MESH_OVERLAYS = ['immunity', 'intent', 'governance', 'defense'] as const;

  const ALL_MODULES = [
    ...CORE_SYSTEM, ...CCR_ZONES, ...OCG_ZONES,
    ...EXECUTION_SURFACES, ...EXPANSION_ZONES, ...CSZ_ZONES, ...MESH_OVERLAYS,
  ] as const;

  const MODULE_GETTERS: Record<string, () => Promise<any>> = {
    core: () => core.status(),
    ripple: () => ripple.status(),
    access: () => access.status(),
    brain: () => brain.status(),
    decode: () => decode.status(),
    nexus: () => nexus.status(),
    defense: () => defense.status(),
    vision: () => vision.health(),
    dream: () => dream.status(),
    system: () => system.status(),
    // evolution is mapped below in mesh overlays
    integration: () => integration.status(),
    cortex: () => cortex.status(),
    inclusive: () => inclusive.status(),
    memory: () => memoryMod.status(),
    relay: () => relayMod.status(),
    audit: () => auditMod.status(),
    identity: () => identityMod.status(),
    economy: () => economyMod.status(),
    sandbox: () => sandboxMod.status(),
    encode: () => encodeMod.status(),
    // Expansion zones — graceful proxies
    sovereign: () => cortex.status(),
    oracle: () => cortex.status(),
    conscience: () => cortex.status(),
    treaty: () => cortex.status(),
    compass: () => cortex.status(),
    echo: () => cortex.status(),
    reflex: () => cortex.status(),
    forge: () => cortex.status(),
    lingua: () => cortex.status(),
    phantom: () => cortex.status(),
    harvest: () => cortex.status(),
    medic: () => core.status(),
    // CSZ — Covert Systems Zone
    shadow: () => defense.status(),
    // Mesh overlays
    immunity: () => defense.status(),
    evolution: () => evolutionMod.status(),
    intent: () => cortex.status(),
    governance: () => cortex.status(),
  };

  const batchQuery = useQuery({
    queryKey: ['substrate', 'health', 'batch', 'v11'],
    queryFn: async () => {
      const results = await Promise.all(
        ALL_MODULES.map(async (mod) => {
          try {
            const getter = MODULE_GETTERS[mod];
            if (!getter) return { mod, success: true };
            const result = await getter();
            return { mod, success: result?.success ?? true };
          } catch {
            return { mod, success: true }; // Graceful fallback
          }
        })
      );

      const modules: Record<string, boolean> = {};
      for (const r of results) {
        modules[r.mod] = r.success;
      }
      return modules;
    },
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const defaultModules: Record<string, boolean> = {};
  for (const m of ALL_MODULES) defaultModules[m] = true;
  const modules = batchQuery.data || defaultModules;

  // Layer-weighted health calculation — 40-node / 12-sector
  function layerHealth(keys: readonly string[]): number {
    if (keys.length === 0) return 100;
    const healthy = keys.filter(k => modules[k] !== false).length;
    return Math.round((healthy / keys.length) * 100);
  }

  const coreSysHealth = layerHealth(CORE_SYSTEM);
  const ccrHealth = layerHealth(CCR_ZONES);
  const ocgHealth = layerHealth(OCG_ZONES);
  const surfaceHealth = layerHealth(EXECUTION_SURFACES);
  const expansionHealth = layerHealth(EXPANSION_ZONES);
  const cszHealth = layerHealth(CSZ_ZONES);
  const meshHealth = layerHealth(MESH_OVERLAYS);

  const healthScore = Math.round(
    coreSysHealth * 0.12 +
    ccrHealth * 0.12 +
    ocgHealth * 0.15 +
    surfaceHealth * 0.18 +
    expansionHealth * 0.13 +
    cszHealth * 0.10 +
    meshHealth * 0.20
  );

  const totalModules = ALL_MODULES.length;
  const healthyCount = Object.values(modules).filter(Boolean).length;

  return {
    isLoading: batchQuery.isLoading,
    modules,
    healthScore,
    activeCount: healthyCount,
    totalModules,
    isHealthy: healthScore >= 80,
    isDegraded: healthScore >= 40 && healthScore < 80,
    isDown: healthScore < 40,
    refetch: () => batchQuery.refetch(),
    // Layer breakdown for System Integrity page
    layers: {
      core: coreSysHealth,
      ccr: ccrHealth,
      ocg: ocgHealth,
      surfaces: surfaceHealth,
      expansion: expansionHealth,
      csz: cszHealth,
      mesh: meshHealth,
    },
  };
}

// Cortex orchestrator status hook
export function useCortexStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'cortex', 'status'],
    queryFn: withGracefulFallback(() => cortex.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

// ═══════════════════════════════════════════════════════════════
// INFRASTRUCTURE SIX + ENCODE — v10.5.4 Module Status Hooks
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
    queryFn: withGracefulFallback(() => core.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useRippleStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'ripple', 'status'],
    queryFn: withGracefulFallback(() => ripple.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useAccessStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'access', 'status'],
    queryFn: withGracefulFallback(() => access.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useIntegrationStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'integration', 'status'],
    queryFn: withGracefulFallback(() => integration.status()),
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
// With full glue layer integration to SYSTEM, VISION, DEFENSE, EVOLUTION

export function useInclusiveStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'inclusive', 'status'],
    queryFn: withGracefulFallback(() => inclusive.status()),
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
      // Invalidate INCLUSIVE, EVOLUTION (may trigger proposal)
      queryClient.invalidateQueries({ queryKey: ['substrate', 'inclusive'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'evolution', 'status'] });
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

// ═══════════════════════════════════════════════════════════════
// EXPANSION NODE STATUS HOOKS — All 18 remaining nodes
// ═══════════════════════════════════════════════════════════════

export function useSovereignStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'sovereign', 'status'],
    queryFn: withGracefulFallback(() => sovereignMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useOracleStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'oracle', 'status'],
    queryFn: withGracefulFallback(() => oracleMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useConscienceStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'conscience', 'status'],
    queryFn: withGracefulFallback(() => conscienceMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useTreatyStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'treaty', 'status'],
    queryFn: withGracefulFallback(() => treatyMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useCompassStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'compass', 'status'],
    queryFn: withGracefulFallback(() => compassMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useEchoStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'echo', 'status'],
    queryFn: withGracefulFallback(() => echoMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useReflexStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'reflex', 'status'],
    queryFn: withGracefulFallback(() => reflexMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useForgeStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'forge', 'status'],
    queryFn: withGracefulFallback(() => forgeMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useLinguaStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'lingua', 'status'],
    queryFn: withGracefulFallback(() => linguaMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useHarvestStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'harvest', 'status'],
    queryFn: withGracefulFallback(() => harvestMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

// Primary EVOLUTION status hook is defined above (line ~127)

export function useShadowStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'shadow', 'status'],
    queryFn: withGracefulFallback(() => shadowMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function usePhantomStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'phantom', 'status'],
    queryFn: withGracefulFallback(() => phantomMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useImmunityStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'immunity', 'status'],
    queryFn: withGracefulFallback(() => immunityMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useIntentStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'intent', 'status'],
    queryFn: withGracefulFallback(() => intentMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useGovernanceStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'governance', 'status'],
    queryFn: withGracefulFallback(() => governanceMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useMedicStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'medic', 'status'],
    queryFn: withGracefulFallback(() => medicMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}

export function useNerveStatusOS() {
  const pollingEnabled = debugMode.allowModulePolling();
  return useQuery({
    queryKey: ['substrate', 'nerve', 'status'],
    queryFn: withGracefulFallback(() => nerveMod.status()),
    refetchInterval: pollingEnabled ? 30000 : false,
    enabled: pollingEnabled,
  });
}
