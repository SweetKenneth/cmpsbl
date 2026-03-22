/**
 * useDefense Hook — DEFENSE mesh overlay operations
 * Respects debugMode kill-switch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

// Access defense module from substrate singleton
const defense = substrate.defense;

export interface UseDefenseReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  posture: ReturnType<typeof useQuery>;
  limits: ReturnType<typeof useQuery>;
  rules: ReturnType<typeof useQuery>;
  
  // Actions
  analyze: ReturnType<typeof useMutation>;
  report: ReturnType<typeof useMutation>;
  reputation: ReturnType<typeof useMutation>;
  ipIntel: ReturnType<typeof useMutation>;
  anomaly: ReturnType<typeof useMutation>;
  anomalyProbe: ReturnType<typeof useMutation>;
}

export function useDefense(): UseDefenseReturn {
  const queryClient = useQueryClient();
  
  // Only poll if debug mode allows it
  const pollingEnabled = debugMode.allowModulePolling();
  
  const status = useQuery({
    queryKey: ['substrate', 'defense', 'status'],
    queryFn: () => defense.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const posture = useQuery({
    queryKey: ['substrate', 'defense', 'posture'],
    queryFn: () => defense.posture(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });
  
  const limits = useQuery({
    queryKey: ['substrate', 'defense', 'limits'],
    queryFn: () => defense.limits(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const rules = useQuery({
    queryKey: ['substrate', 'defense', 'rules'],
    queryFn: () => defense.rules(),
    staleTime: 60000,
    enabled: pollingEnabled,
  });
  
  const analyze = useMutation({
    mutationFn: (params: { fingerprint: Record<string, unknown>; ip?: string }) => 
      defense.analyze(params.fingerprint, params.ip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'defense', 'status'] });
    },
  });
  
  const reputation = useMutation({
    mutationFn: (ipAddress: string) => defense.reputation(ipAddress),
  });
  
  const ipIntel = useMutation({
    mutationFn: (params: { ipAddress: string; includeHistory?: boolean }) => 
      defense.ipIntel(params.ipAddress, params.includeHistory),
  });
  
  const anomaly = useMutation({
    mutationFn: (timeWindow?: '1h' | '6h' | '24h') => defense.anomaly(timeWindow),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'defense'] });
    },
  });
  
  const anomalyProbe = useMutation({
    mutationFn: (lookbackHours?: number) => defense.anomalyProbe(lookbackHours),
  });
  
  return {
    status,
    posture,
    limits,
    rules,
    analyze,
    reputation,
    ipIntel,
    anomaly,
    anomalyProbe,
  };
}

export default useDefense;
