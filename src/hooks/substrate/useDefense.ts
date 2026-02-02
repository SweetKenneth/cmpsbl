/**
 * useDefense Hook
 * v7.0.0 — Dedicated hook for DEFENSE module operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { defense } from '@/lib/substrate';

export interface UseDefenseReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  posture: ReturnType<typeof useQuery>;
  limits: ReturnType<typeof useQuery>;
  rules: ReturnType<typeof useQuery>;
  
  // Actions
  analyze: ReturnType<typeof useMutation>;
  reputation: ReturnType<typeof useMutation>;
  ipIntel: ReturnType<typeof useMutation>;
  anomaly: ReturnType<typeof useMutation>;
  anomalyProbe: ReturnType<typeof useMutation>;
}

export function useDefense(): UseDefenseReturn {
  const queryClient = useQueryClient();
  
  const status = useQuery({
    queryKey: ['substrate', 'defense', 'status'],
    queryFn: () => defense.status(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const posture = useQuery({
    queryKey: ['substrate', 'defense', 'posture'],
    queryFn: () => defense.posture(),
    refetchInterval: 60000,
    staleTime: 30000,
  });
  
  const limits = useQuery({
    queryKey: ['substrate', 'defense', 'limits'],
    queryFn: () => defense.limits(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const rules = useQuery({
    queryKey: ['substrate', 'defense', 'rules'],
    queryFn: () => defense.rules(),
    staleTime: 60000,
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
