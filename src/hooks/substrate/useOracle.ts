/**
 * useOracle Hook — ORACLE module operations
 * Full capability surface: state, predict, simulate, networks, health, resilience, hardening
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import * as oracleModule from '@/lib/substrate/oracle-module';

export interface UseOracleReturn {
  state: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  resilience: ReturnType<typeof useQuery>;
  hardening: ReturnType<typeof useQuery>;
  predict: ReturnType<typeof useMutation>;
  simulate: ReturnType<typeof useMutation>;
  createNetwork: ReturnType<typeof useMutation>;
  updateBelief: ReturnType<typeof useMutation>;
}

export function useOracle(): UseOracleReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const invalidateOracle = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'oracle'] });
  };

  const state = useQuery({
    queryKey: ['substrate', 'oracle', 'state'],
    queryFn: () => oracleModule.getOracleState(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'oracle', 'health'],
    queryFn: () => Promise.resolve(oracleModule.getOracleHealth()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'oracle', 'resilience'],
    queryFn: () => Promise.resolve(oracleModule.getOracleResilience()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const hardening = useQuery({
    queryKey: ['substrate', 'oracle', 'hardening'],
    queryFn: () => Promise.resolve(oracleModule.getOracleHardening()),
    staleTime: 60000,
    enabled: pollingEnabled,
  });

  const predict = useMutation({
    mutationFn: (params: { target: string; features: Record<string, number>; method?: oracleModule.Prediction['method'] }) =>
      Promise.resolve(oracleModule.predict(params.target, params.features, params.method)),
    onSuccess: invalidateOracle,
  });

  const simulate = useMutation({
    mutationFn: (params: { name: string; samplerFn: () => number; iterations?: number }) =>
      Promise.resolve(oracleModule.runMonteCarlo(params.name, params.samplerFn, params.iterations)),
    onSuccess: invalidateOracle,
  });

  const createNetwork = useMutation({
    mutationFn: (params: { name: string; nodes: Parameters<typeof oracleModule.createNetwork>[1]; edges: Parameters<typeof oracleModule.createNetwork>[2] }) =>
      Promise.resolve(oracleModule.createNetwork(params.name, params.nodes, params.edges)),
    onSuccess: invalidateOracle,
  });

  const updateBelief = useMutation({
    mutationFn: (params: { networkId: string; nodeId: string; observedValue: number }) =>
      Promise.resolve(oracleModule.updateBelief(params.networkId, params.nodeId, params.observedValue)),
    onSuccess: invalidateOracle,
  });

  return { state, health, resilience, hardening, predict, simulate, createNetwork, updateBelief };
}
