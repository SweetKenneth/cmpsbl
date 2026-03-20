/**
 * useCortex Hook — CORTEX (Orchestrator) module operations
 * Respects debug mode kill-switch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

// Access cortex module from substrate singleton
const cortex = substrate.cortex;

export interface UseCortexReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  health: ReturnType<typeof useQuery>;
  pulse: ReturnType<typeof useQuery>;
  diagnostics: ReturnType<typeof useQuery>;
  world: ReturnType<typeof useQuery>;
  inventory: ReturnType<typeof useQuery>;
  
  // Mode Management
  mode: ReturnType<typeof useMutation>;
  
  // Actions
  restart: ReturnType<typeof useMutation>;
  panic: ReturnType<typeof useMutation>;
  dispatch: ReturnType<typeof useMutation>;
  observe: ReturnType<typeof useMutation>;
  
  // Governance
  propose: ReturnType<typeof useMutation>;
  evaluate: ReturnType<typeof useMutation>;
  apply: ReturnType<typeof useMutation>;
  
  // Sequence Operations
  plan: ReturnType<typeof useMutation>;
  run: ReturnType<typeof useMutation>;
}

export function useCortex(): UseCortexReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  
  const invalidateCortex = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'cortex'] });
  };
  
  const status = useQuery({
    queryKey: ['substrate', 'cortex', 'status'],
    queryFn: () => cortex.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const health = useQuery({
    queryKey: ['substrate', 'cortex', 'health'],
    queryFn: () => cortex.health(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const pulse = useQuery({
    queryKey: ['substrate', 'cortex', 'pulse'],
    queryFn: () => cortex.pulse(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const diagnostics = useQuery({
    queryKey: ['substrate', 'cortex', 'diagnostics'],
    queryFn: () => cortex.diagnostics(),
    staleTime: 60000,
  });
  
  const world = useQuery({
    queryKey: ['substrate', 'cortex', 'world'],
    queryFn: () => cortex.world({ dag: true, roles: true }),
    staleTime: 120000,
  });
  
  const inventory = useQuery({
    queryKey: ['substrate', 'cortex', 'inventory'],
    queryFn: () => cortex.inventory(),
    staleTime: 60000,
  });
  
  const mode = useMutation({
    mutationFn: (newMode?: 'manual' | 'shadow' | 'auto') => cortex.mode(newMode),
    onSuccess: invalidateCortex,
  });
  
  const restart = useMutation({
    mutationFn: () => cortex.restart(),
    onSuccess: invalidateCortex,
  });
  
  const panic = useMutation({
    mutationFn: (params: { action: 'freeze' | 'resume' | 'status'; reason?: string }) => 
      cortex.panic(params.action, params.reason),
    onSuccess: invalidateCortex,
  });
  
  const dispatch = useMutation({
    mutationFn: (params: { targetModule: string; targetAction: string; args?: Record<string, unknown> }) => 
      cortex.dispatch(params.targetModule, params.targetAction, params.args),
    onSuccess: invalidateCortex,
  });
  
  const observe = useMutation({
    mutationFn: (params?: { module?: string; eventTypes?: string[] }) => 
      cortex.observe(params?.module, params?.eventTypes),
  });
  
  const propose = useMutation({
    mutationFn: (params: { goal: string; context?: string }) => 
      cortex.propose(params.goal, params.context),
  });
  
  const evaluate = useMutation({
    mutationFn: (params?: { proposalId?: string; criteria?: Record<string, unknown> }) => 
      cortex.evaluate(params?.proposalId, params?.criteria),
  });
  
  const apply = useMutation({
    mutationFn: (params: { proposalId: string; targetModule?: string }) => 
      cortex.apply(params.proposalId, params.targetModule),
    onSuccess: invalidateCortex,
  });
  
  const plan = useMutation({
    mutationFn: (sequenceId: string) => cortex.plan(sequenceId),
  });
  
  const run = useMutation({
    mutationFn: (params: { sequenceId: string; mode?: 'shadow' | 'production' }) => 
      cortex.run(params.sequenceId, params.mode),
    onSuccess: invalidateCortex,
  });
  
  return {
    status,
    health,
    pulse,
    diagnostics,
    world,
    inventory,
    mode,
    restart,
    panic,
    dispatch,
    observe,
    propose,
    evaluate,
    apply,
    plan,
    run,
  };
}

export default useCortex;
