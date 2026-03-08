/**
 * Discovery Reactor Hook — Admin-only
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { runReactor, type ReactorConfig, type ReactorRunResult } from '@/lib/discovery/reactor';
import { backfillLearningFromExistingRuns, type BackfillResult } from '@/lib/discovery/learning-bridge';
import { toast } from 'sonner';

interface DiscoveryRun {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  total_candidates: number;
  accepted_count: number;
  top_find_name: string | null;
  top_find_cjpi: number | null;
  dry_run: boolean;
  exploratory_mode: boolean;
  scoring_version: string;
}

export function useDiscoveryReactor() {
  const [isRunning, setIsRunning] = useState(false);
  const [latestResult, setLatestResult] = useState<ReactorRunResult | null>(null);
  const [runs, setRuns] = useState<DiscoveryRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);

  const fetchRuns = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('discovery_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20);
    setRuns((data as DiscoveryRun[]) ?? []);
    setLoading(false);
  }, []);

  const executeRun = useCallback(async (config: ReactorConfig) => {
    setIsRunning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Authentication required');
        return null;
      }

      const result = await runReactor(config, user.id);
      setLatestResult(result);

      if (result.status === 'completed') {
        if (result.acceptedCount === 0) {
          toast.info('All known pipelines already discovered and promoted. Add new synthesis templates for fresh discoveries.');
        } else {
          toast.success(`Discovery complete: ${result.acceptedCount} new pipelines found (top: ${result.topFind?.name} @ ${result.topFind?.cjpi} CJPI)`);
        }
      } else {
        toast.error(`Discovery failed: ${result.error}`);
      }

      await fetchRuns();
      return result;
    } catch (err: any) {
      toast.error(`Reactor error: ${err.message}`);
      return null;
    } finally {
      setIsRunning(false);
    }
  }, [fetchRuns]);

  const markEngineCandidate = useCallback(async (discoveryId: string, isCandidate: boolean) => {
    await supabase
      .from('discoveries')
      .update({ engine_candidate: isCandidate })
      .eq('id', discoveryId);
    toast.success(isCandidate ? 'Marked as Engine Candidate' : 'Removed from candidates');
  }, []);

  const fetchDiscoveriesForRun = useCallback(async (runId: string) => {
    const { data } = await supabase
      .from('discoveries')
      .select('*')
      .eq('run_id', runId)
      .order('cjpi', { ascending: false });
    return data ?? [];
  }, []);

  const backfillLearning = useCallback(async (): Promise<BackfillResult | null> => {
    setIsBackfilling(true);
    try {
      toast.info('Backfilling learning from all existing discovery runs...');
      const result = await backfillLearningFromExistingRuns();
      toast.success(
        `Learning backfill complete: ${result.totalDiscoveries} discoveries processed → ${result.aggregate.domainLearnings} domain learnings, ${result.aggregate.rulesContributed} rules, ${result.aggregate.synergyOutcomesRecorded} synergy outcomes`
      );
      return result;
    } catch (err: any) {
      toast.error(`Backfill error: ${err.message}`);
      return null;
    } finally {
      setIsBackfilling(false);
    }
  }, []);

  return {
    isRunning,
    isBackfilling,
    latestResult,
    runs,
    loading,
    fetchRuns,
    executeRun,
    markEngineCandidate,
    fetchDiscoveriesForRun,
    backfillLearning,
  };
}
