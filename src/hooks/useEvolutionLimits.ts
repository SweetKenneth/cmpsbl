/**
 * useEvolutionLimits — Tier-gated limits for the Proprietary Evolution Lifecycle
 * Tracks daily usage (uploads, exports) against tier caps.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserLimits } from '@/hooks/useUserLimits';

interface EvolutionUsage {
  uploadsToday: number;
  exportsToday: number;
}

export function useEvolutionLimits() {
  const limits = useUserLimits();
  const [usage, setUsage] = useState<EvolutionUsage>({ uploadsToday: 0, exportsToday: 0 });
  const [loadingUsage, setLoadingUsage] = useState(true);

  const todayKey = new Date().toISOString().slice(0, 10);

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

      // Count today's exports
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count: exportCount } = await (supabase as any)
        .from('audit_logs')
        .select('id', { count: 'exact', head: true })
        .eq('action', 'proprietary_evolution_export')
        .gte('created_at', `${todayKey}T00:00:00Z`);

      setUsage({
        uploadsToday: uploadCount || 0,
        exportsToday: exportCount || 0,
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

  const canExport = useMemo(() =>
    limits.evolutionExportsPerDay > 0 && usage.exportsToday < limits.evolutionExportsPerDay,
    [usage.exportsToday, limits.evolutionExportsPerDay]
  );

  const uploadsRemaining = Math.max(0, limits.evolutionUploadsPerDay - usage.uploadsToday);
  const exportsRemaining = limits.evolutionExportsPerDay > 0
    ? Math.max(0, limits.evolutionExportsPerDay - usage.exportsToday)
    : 0;

  return {
    ...limits,
    usage,
    loadingUsage,
    canUpload,
    canExport,
    uploadsRemaining,
    exportsRemaining,
    refreshUsage: loadUsage,
  };
}
