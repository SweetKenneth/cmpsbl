/**
 * CMPSBL Substrate Dashboard Hooks
 * Real-time telemetry and control hooks for the OS surface
 * Respects debug mode kill-switch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate, vision, brain, defense, nexus, dream, system, decode, core, ripple, access, integration, cortex, inclusive, memoryMod, relayMod, auditMod, identityMod, economyMod, sandboxMod, encodeMod, sovereignMod, oracleMod, conscienceMod, treatyMod, compassMod, echoMod, reflexMod, forgeMod, linguaMod, harvestMod, evolutionMod, shadowMod, phantomMod, immunityMod, intentMod, governanceMod, medicMod, nerveMod, atlasMod, engineerMod } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';
import * as healthEngine from '@/lib/substrate/health-engine';
import { toast } from 'sonner';

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

// Deprecated useModernizerStatusOS removed — use useEvolutionStatusOS

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
// HEAL ALL — Full system heal with health engine reset
// ═══════════════════════════════════════════════════════════════

export function useSystemHealAll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options?: { target?: string; force?: boolean }) => {
      // Phase 1: Call system.heal on the edge function
      const result = await system.heal(options?.target, options?.force ?? true) as any;

      // Phase 2: Reset all health engine circuit breakers
      const allBreakers = healthEngine.getBreakers();
      for (const [id] of allBreakers) {
        healthEngine.resetBreaker(id);
      }

      // Phase 3: Clear the auto-heal queue
      healthEngine.clearHealQueue();

      // Phase 4: Reset all primitives to 100 in health engine
      for (const prim of healthEngine.ALL_PRIMITIVES) {
        healthEngine.updatePrimitiveHealth(prim.id, 100);
      }
      for (const sub of healthEngine.SUBSYSTEMS) {
        healthEngine.updatePrimitiveHealth(sub.id, 100);
      }

      // Phase 5: Reset core circuit breaker registry
      try {
        const { forceReset, getAllBreakers } = await import('@/core/resilience/circuitBreakerRegistry');
        for (const b of getAllBreakers()) {
          forceReset(b.moduleId);
        }
      } catch { /* registry may not be active */ }

      // Phase 6: Reset autoblog circuit
      try {
        const { resetAutoblogCircuit } = await import('@/lib/autoblog/circuit');
        await resetAutoblogCircuit();
      } catch { /* autoblog may not be active */ }

      // Phase 7: Reset discovery engine breaker
      try {
        const { healDiscoveryEngine } = await import('@/lib/substrate/intent-mesh/discovery-engine');
        healDiscoveryEngine(true);
      } catch { /* discovery engine may not be active */ }

      return result;
    },
    onSuccess: (data) => {
      // Invalidate everything so the dashboard refreshes with healed state
      queryClient.invalidateQueries();
      const { toast } = require('sonner');
      toast.success('System heal complete', {
        description: `All circuit breakers reset, ${data?.healed_modules?.length ?? 'all'} modules restored to 100%`,
      });
    },
    onError: (error) => {
      const { toast } = require('sonner');
      toast.error(`Heal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
}


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
    refetchInterval: pollingEnabled ? 15000 : false, // 15s — reduced from 5s to cut query pressure 66%
    staleTime: 10000,
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
 * 40-Primitive / 12-Category Field-Based Topology — weighted aggregation:
 *   CORE+SYSTEM: 12% | CCR: 12% | OCG: 15% | Execution: 18% | ESZ+EPZ+EMZ: 13% | CSZ: 10% | Fields+Plane+Shell: 20%
 *
 * Batched into a single useQuery to prevent parallel network request storms.
 */
export function useSubstrateHealthScore() {
  const pollingEnabled = debugMode.allowModulePolling();

  // Module status getters — all 40 primitives
  const MODULE_GETTERS: Record<string, () => Promise<any>> = {
    core: () => core.status(),
    system: () => system.status(),
    brain: () => brain.status(),
    memory: () => memoryMod.status(),
    nerve: () => nerveMod.status(),
    nexus: () => nexus.status(),
    identity: () => identityMod.status(),
    sovereign: () => sovereignMod.status(),
    atlas: () => atlasMod.status(),
    medic: () => medicMod.status(),
    relay: () => relayMod.status(),
    conscience: () => conscienceMod.status(),
    defense: () => defense.status(),
    immunity: () => immunityMod.status(),
    governance: () => governanceMod.status(),
    treaty: () => treatyMod.status(),
    evolution: () => evolutionMod.status(),
    reflex: () => reflexMod.status(),
    compass: () => compassMod.status(),
    integration: () => integration.status(),
    intent: () => intentMod.status(),
    access: () => access.status(),
    vision: () => vision.health(),
    shadow: () => shadowMod.status(),
    dream: () => dream.status(),
    harvest: () => harvestMod.status(),
    forge: () => forgeMod.status(),
    lingua: () => linguaMod.status(),
    echo: () => echoMod.status(),
    phantom: () => phantomMod.status(),
    sandbox: () => sandboxMod.status(),
    ripple: () => ripple.status(),
    encode: () => encodeMod.status(),
    decode: () => decode.status(),
    audit: () => auditMod.status(),
    economy: () => economyMod.status(),
    inclusive: () => inclusive.status(),
    cortex: () => cortex.status(),
    oracle: () => oracleMod.status(),
    engineer: () => engineerMod.status(),
  };

  // Subsystem probes
  const SUBSYSTEM_PROBES: Record<string, () => Promise<number>> = {
    clm: async () => {
      const { getCLMStatus } = await import('@/lib/substrate/clm');
      const s = getCLMStatus();
      if (s.kill_switch) return 30;
      if (!s.enabled) return 60;
      return s.running ? 100 : 80;
    },
    cdm: async () => {
      try {
        const { getDiscoveryHealth } = await import('@/lib/substrate/intent-mesh/discovery-engine');
        const health = getDiscoveryHealth();
        return typeof health.score === 'number' ? health.score : 80;
      } catch { return 70; }
    },
    seba: async () => {
      try {
        const { getSEBAStatus } = await import('@/lib/os/atlas/adapters/seba');
        const s = await getSEBAStatus();
        return s.health ?? (s.enabled ? 90 : 60);
      } catch { return 50; }
    },
    autoblog: async () => {
      try {
        const { getAutoblogStatus } = await import('@/lib/autoblog');
        const s = await getAutoblogStatus();
        return s.circuit.canProceed ? (s.ok ? 100 : 70) : 30;
      } catch { return 50; }
    },
    agency: async () => {
      try {
        const { data } = await (await import('@/integrations/supabase/client')).supabase
          .from('agencies').select('id', { count: 'exact', head: true });
        return 90;
      } catch { return 50; }
    },
    edge: async () => {
      // Edge functions health = substrate ping
      try {
        const result = await core.status() as any;
        return result?.health ?? (result?.success ? 100 : 50);
      } catch { return 30; }
    },
    database: async () => {
      try {
        const start = Date.now();
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.from('analytics_events').select('id').limit(1);
        const latency = Date.now() - start;
        return latency < 500 ? 100 : latency < 2000 ? 85 : latency < 5000 ? 60 : 30;
      } catch { return 20; }
    },
    auth: async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase.auth.getSession();
        return 100; // Auth endpoint is reachable
      } catch { return 40; }
    },
    storage: async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.storage.listBuckets();
        return 100;
      } catch { return 50; }
    },
    email: async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { count } = await supabase.from('email_send_log' as any)
          .select('id', { count: 'exact', head: true })
          .eq('status', 'dlq')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        return (count ?? 0) > 5 ? 60 : 100;
      } catch { return 80; } // Table may not exist — not critical
    },
    scheduler: async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { count } = await supabase.from('agency_scheduled_tasks')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true);
        return 90;
      } catch { return 70; }
    },
  };

  const batchQuery = useQuery({
    queryKey: ['substrate', 'health', 'engine', 'v2'],
    queryFn: async () => {
      // Phase 1: Probe all 40 primitives in parallel
      const primitiveResults = await Promise.all(
        healthEngine.ALL_PRIMITIVES.map(async (prim) => {
          if (!healthEngine.shouldProbe(prim.id, prim.tier)) {
            return { id: prim.id, health: healthEngine.getPrimitiveHealth(prim.id) };
          }
          try {
            const getter = MODULE_GETTERS[prim.id];
            if (!getter) return { id: prim.id, health: 100 };
            const result = await getter();
            const h = healthEngine.extractHealth(result);
            return { id: prim.id, health: h };
          } catch {
            return { id: prim.id, health: 50 };
          }
        })
      );

      // Phase 2: Probe subsystems in parallel
      const subsystemResults = await Promise.all(
        healthEngine.SUBSYSTEMS.map(async (sub) => {
          try {
            const probe = SUBSYSTEM_PROBES[sub.id];
            const h = probe ? await probe() : 80;
            return { id: sub.id, health: h };
          } catch {
            return { id: sub.id, health: 50 };
          }
        })
      );

      // Update health engine with all scores
      for (const r of [...primitiveResults, ...subsystemResults]) {
        healthEngine.updatePrimitiveHealth(r.id, r.health);
      }

      // Compute composite
      const composite = healthEngine.computeCompositeHealth();

      // Build module map for backward compatibility
      const modules: Record<string, number> = {};
      for (const r of primitiveResults) modules[r.id] = r.health;
      for (const r of subsystemResults) modules[r.id] = r.health;

      return { modules, composite };
    },
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const fallbackComposite: healthEngine.CompositeHealthResult = {
    compositeScore: 100,
    degradationLevel: 'L0_NOMINAL',
    weakestLink: 'core',
    weakestScore: 100,
    weakestCategory: 'organ',
    tiers: {
      1: { score: 100, count: 7, healthy: 7 },
      2: { score: 100, count: 8, healthy: 8 },
      3: { score: 100, count: 14, healthy: 14 },
      4: { score: 100, count: 22, healthy: 22 },
    },
    categories: {
      organ: { score: 100, count: 12 },
      layer: { score: 100, count: 12 },
      engine: { score: 100, count: 8 },
      agent: { score: 100, count: 8 },
    },
    subsystemScore: 100,
    totalTracked: 51,
    healthyCount: 51,
    openBreakers: [],
    pendingHeals: 0,
  };

  const data = batchQuery.data;
  const modules = data?.modules ?? {};
  const composite = data?.composite ?? fallbackComposite;

  return {
    isLoading: batchQuery.isLoading,
    modules,
    healthScore: composite.compositeScore,
    activeCount: composite.healthyCount,
    totalModules: composite.totalTracked,
    isHealthy: composite.compositeScore >= 80,
    isDegraded: composite.compositeScore >= 40 && composite.compositeScore < 80,
    isDown: composite.compositeScore < 40,
    refetch: () => batchQuery.refetch(),
    // New v2 fields
    composite,
    weakestLink: composite.weakestLink,
    weakestScore: composite.weakestScore,
    weakestCategory: composite.weakestCategory,
    degradationLevel: composite.degradationLevel,
    categories: composite.categories,
    tiers: composite.tiers,
    subsystemScore: composite.subsystemScore,
    openBreakers: composite.openBreakers,
    pendingHeals: composite.pendingHeals,
    // Layer breakdown for backward compatibility
    layers: {
      core: composite.tiers[1].score,
      ccr: composite.categories.organ.score,
      ocg: composite.categories.layer.score,
      surfaces: composite.categories.agent.score,
      expansion: composite.tiers[4].score,
      csz: composite.categories.engine.score,
      mesh: composite.tiers[2].score,
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
      return { success: false, health: 50, data: { status: 'degraded', fallback: true } };
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
