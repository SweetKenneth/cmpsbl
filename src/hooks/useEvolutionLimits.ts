/**
 * useEvolutionLimits — Tier-gated limits for the Proprietary Evolution Lifecycle
 * Tracks daily upload usage against tier caps.
 * Export access follows vault limits (exportEnabled) — same as crystallized memories.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserLimits } from '@/hooks/useUserLimits';
import { getVaultLimits } from '@/lib/substrate/vault-limits';

interface EvolutionUsage {
  uploadsToday: number;
}

export function useEvolutionLimits() {
  const limits = useUserLimits();
  const [usage, setUsage] = useState<EvolutionUsage>({ uploadsToday: 0 });
  const [loadingUsage, setLoadingUsage] = useState(true);

  const todayKey = new Date().toISOString().slice(0, 10);
  const vaultLimits = useMemo(() => getVaultLimits(limits.tier), [limits.tier]);

  const loadUsage = useCallback(async () => {
    try {
      // Count today's uploads (ingest registrations)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count: uploadCount } = await (supabase as any)
        .from('artifact_registry')
        .select('id', { count: 'exact', head: true })
        .eq('category', 'proprietary-evolution')
        .eq('tier', 'candidate')
        .gte('created_at', `${todayKey}T00:00:00Z`);

      setUsage({
        uploadsToday: uploadCount || 0,
      });
    } catch (err) {
      console.error('Failed to load evolution usage:', err);
    } finally {
      setLoadingUsage(false);
    }
  }, [todayKey]);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  const canUpload = useMemo(() =>
    usage.uploadsToday < limits.evolutionUploadsPerDay,
    [usage.uploadsToday, limits.evolutionUploadsPerDay]
  );

  // Export access follows vault limits — same rule as crystallized memories
  const canExport = vaultLimits.exportEnabled;

  const uploadsRemaining = Math.max(0, limits.evolutionUploadsPerDay - usage.uploadsToday);

  return {
    ...limits,
    usage,
    loadingUsage,
    canUpload,
    canExport,
    uploadsRemaining,
    vaultLimits,
    refreshUsage: loadUsage,
  };
}
