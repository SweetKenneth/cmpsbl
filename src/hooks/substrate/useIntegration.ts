/**
 * useIntegration Hook
 * SPARTA Epoch — Dedicated hook for INTEGRATION surface operations
 * 
 * Respects debug mode kill-switch for connection polling.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';

// Access integration module from substrate singleton
const integration = substrate.integration;

export interface UseIntegrationReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  pulse: ReturnType<typeof useQuery>;
  
  // Adapters
  adapters: ReturnType<typeof useQuery>;
  connections: ReturnType<typeof useQuery>;
  
  // Discovery
  discovered: (adapterId?: string) => ReturnType<typeof useQuery>;
  mappedCommands: (adapterId?: string) => ReturnType<typeof useQuery>;
  
  // Governance
  policies: ReturnType<typeof useQuery>;
  
  // Actions
  connect: ReturnType<typeof useMutation>;
  disconnect: ReturnType<typeof useMutation>;
  test: ReturnType<typeof useMutation>;
  discover: ReturnType<typeof useMutation>;
  mapCommand: ReturnType<typeof useMutation>;
  execute: ReturnType<typeof useMutation>;
  setPolicy: ReturnType<typeof useMutation>;
}

export function useIntegration(): UseIntegrationReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  
  const status = useQuery({
    queryKey: ['substrate', 'integration', 'status'],
    queryFn: () => integration.status(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const pulse = useQuery({
    queryKey: ['substrate', 'integration', 'pulse'],
    queryFn: () => integration.pulse(),
    refetchInterval: pollingEnabled ? 10000 : false,
    staleTime: 5000,
    enabled: pollingEnabled,
  });
  
  const adapters = useQuery({
    queryKey: ['substrate', 'integration', 'adapters'],
    queryFn: () => integration.adapters(),
    staleTime: 60000,
  });
  
  const connections = useQuery({
    queryKey: ['substrate', 'integration', 'connections'],
    queryFn: () => integration.connections(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });
  
  const discovered = (adapterId?: string) => useQuery({
    queryKey: ['substrate', 'integration', 'discovered', adapterId],
    queryFn: () => integration.discovered(adapterId),
    staleTime: 30000,
  });
  
  const mappedCommands = (adapterId?: string) => useQuery({
    queryKey: ['substrate', 'integration', 'mapped_commands', adapterId],
    queryFn: () => integration.mappedCommands(adapterId),
    staleTime: 30000,
  });
  
  const policies = useQuery({
    queryKey: ['substrate', 'integration', 'policies'],
    queryFn: () => integration.policies(),
    staleTime: 60000,
  });
  
  const connect = useMutation({
    mutationFn: (options: {
      adapter_type: string;
      name: string;
      config: Record<string, unknown>;
      credentials?: Record<string, string>;
    }) => integration.connect(options as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'integration', 'connections'] });
    },
  });
  
  const disconnect = useMutation({
    mutationFn: (adapterId: string) => integration.disconnect(adapterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'integration', 'connections'] });
    },
  });
  
  const test = useMutation({
    mutationFn: (adapterId: string) => integration.test(adapterId),
  });
  
  const discover = useMutation({
    mutationFn: (options?: { target?: string; depth?: 'shallow' | 'deep'; include_functions?: boolean }) => 
      integration.discover(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'integration', 'discovered'] });
    },
  });
  
  const mapCommand = useMutation({
    mutationFn: (options: {
      discovered_function: string;
      terminal_command: string;
      description: string;
      parameters?: Array<{ name: string; type: string; required: boolean }>;
    }) => integration.mapCommand(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'integration', 'mapped_commands'] });
    },
  });
  
  const execute = useMutation({
    mutationFn: (options: {
      adapter_id: string;
      action: string;
      parameters: Record<string, unknown>;
      governance?: {
        require_approval?: boolean;
        audit_level?: 'none' | 'basic' | 'full';
        timeout_ms?: number;
        max_retries?: number;
      };
    }) => integration.execute(options),
  });
  
  const setPolicy = useMutation({
    mutationFn: (options: {
      adapter_id?: string;
      action_pattern?: string;
      policy: {
        require_approval?: boolean;
        allowed_actions?: string[];
        blocked_actions?: string[];
        rate_limit_per_hour?: number;
        audit_retention_days?: number;
      };
    }) => integration.setPolicy(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'integration', 'policies'] });
    },
  });
  
  return {
    status,
    pulse,
    adapters,
    connections,
    discovered,
    mappedCommands,
    policies,
    connect,
    disconnect,
    test,
    discover,
    mapCommand,
    execute,
    setPolicy,
  };
}

export default useIntegration;
