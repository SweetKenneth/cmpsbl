/**
 * useMaintenanceEngine — React hook for running & viewing maintenance engine results
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { runMaintenanceOrchestrator } from '@/lib/engines/maintenance';
import type { OrchestratorRunResult, TriggerSource } from '@/lib/engines/maintenance/types';
import { toast } from 'sonner';

export function useMaintenanceEngine() {
  const queryClient = useQueryClient();
  const [currentRun, setCurrentRun] = useState<OrchestratorRunResult | null>(null);

  // Fetch recent reports from DB
  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['maintenance-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_reports' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data as any[]) ?? [];
    },
    staleTime: 30_000,
  });

  // Run full maintenance orchestrator
  const runMutation = useMutation({
    mutationFn: async (triggerSource: TriggerSource = 'manual') => {
      const result = await runMaintenanceOrchestrator(triggerSource);
      setCurrentRun(result);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-reports'] });
      if (result.overallStatus === 'passed') {
        toast.success(`Maintenance passed — ${result.engines.length} engines in ${result.totalDurationMs}ms`);
      } else if (result.overallStatus === 'failed') {
        const failedEngines = result.engines.filter(e => e.status === 'failed');
        toast.error(`Maintenance failed — ${failedEngines.length} engine(s) reported errors`);
      } else {
        toast.warning(`Maintenance partial — some warnings detected`);
      }
    },
    onError: (err: any) => {
      toast.error(`Maintenance error: ${err.message}`);
    },
  });

  const runMaintenance = useCallback((triggerSource: TriggerSource = 'manual') => {
    runMutation.mutate(triggerSource);
  }, [runMutation]);

  return {
    runMaintenance,
    isRunning: runMutation.isPending,
    currentRun,
    history,
    historyLoading,
  };
}
