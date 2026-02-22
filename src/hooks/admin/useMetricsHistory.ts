/**
 * Hook for Longitudinal Telemetry
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getMetricsHistory, 
  getLatestMetrics, 
  exportMetricsJSON, 
  exportMetricsCSV,
  type TimeWindow 
} from '@/lib/substrate/metrics-history';

export function useMetricsHistory() {
  const [window, setWindow] = useState<TimeWindow>('7d');

  const { data: history, isLoading } = useQuery({
    queryKey: ['metrics-history', window],
    queryFn: () => getMetricsHistory(window),
    refetchInterval: 300000, // 5 min
  });

  const { data: latest } = useQuery({
    queryKey: ['metrics-latest'],
    queryFn: getLatestMetrics,
    refetchInterval: 60000,
  });

  const exportJSON = async () => {
    const json = await exportMetricsJSON(window);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics-${window}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = async () => {
    const csv = await exportMetricsCSV(window);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics-${window}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    history: history || [],
    latest,
    isLoading,
    window,
    setWindow,
    exportJSON,
    exportCSV,
  };
}
