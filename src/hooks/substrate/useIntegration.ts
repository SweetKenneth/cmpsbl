/**
 * useIntegration Hook — INTEGRATION node operations
 * v11.0.0 "Conduit"
 *
 * Full-featured hook exposing adapter registry, connection pooling,
 * schema mapping, webhook relay, and hardening health.
 *
 * Part of the 40-Node / 12-Sector Architecture (Execution Zone)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { substrate } from '@/lib/substrate';
import { debugMode } from '@/lib/debug-mode';
import * as integrationModule from '@/lib/substrate/integration-module';

const integration = substrate.integration;

export interface UseIntegrationReturn {
  // Status & Health
  status: ReturnType<typeof useQuery>;
  pulse: ReturnType<typeof useQuery>;
  hardeningHealth: ReturnType<typeof useQuery>;

  // Adapter Registry
  adapters: ReturnType<typeof useQuery>;
  connections: ReturnType<typeof useQuery>;
  registryStatus: ReturnType<typeof useQuery>;
  adapterHealth: ReturnType<typeof useQuery>;

  // Discovery
  discovered: (adapterId?: string) => ReturnType<typeof useQuery>;
  mappedCommands: (adapterId?: string) => ReturnType<typeof useQuery>;

  // Connection Pools
  poolMetrics: ReturnType<typeof useQuery>;

  // Schema Mapper
  schemaMappings: (adapterId?: string) => ReturnType<typeof useQuery>;
  mapperStats: ReturnType<typeof useQuery>;

  // Webhook Relay
  webhookEndpoints: (adapterId?: string) => ReturnType<typeof useQuery>;
  webhookStats: ReturnType<typeof useQuery>;
  deadLetterQueue: ReturnType<typeof useQuery>;

  // Governance
  policies: ReturnType<typeof useQuery>;

  // Actions — Adapters
  connect: ReturnType<typeof useMutation>;
  disconnect: ReturnType<typeof useMutation>;
  test: ReturnType<typeof useMutation>;
  discover: ReturnType<typeof useMutation>;
  mapCommand: ReturnType<typeof useMutation>;
  execute: ReturnType<typeof useMutation>;
  setPolicy: ReturnType<typeof useMutation>;

  // Actions — Schema
  createMapping: ReturnType<typeof useMutation>;
  transform: ReturnType<typeof useMutation>;
  batchTransform: ReturnType<typeof useMutation>;

  // Actions — Webhooks
  registerWebhook: ReturnType<typeof useMutation>;
  replayDeadLetter: ReturnType<typeof useMutation>;

  // Actions — Pools
  createPool: ReturnType<typeof useMutation>;
  evaluateScaling: ReturnType<typeof useMutation>;
}

export function useIntegration(): UseIntegrationReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const invalidateIntegration = () => {
    queryClient.invalidateQueries({ queryKey: ['substrate', 'integration'] });
  };

  // ── Status & Health ────────────────────────────────────────────

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
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const hardeningHealth = useQuery({
    queryKey: ['substrate', 'integration', 'hardening'],
    queryFn: () => integrationModule.computeConduitHealth(),
    staleTime: 30000,
    refetchInterval: pollingEnabled ? 60000 : false,
  });

  // ── Adapter Registry ───────────────────────────────────────────

  const adapters = useQuery({
    queryKey: ['substrate', 'integration', 'adapters'],
    queryFn: () => integration.adapters(),
    staleTime: 60000,
  });

  const connections = useQuery({
    queryKey: ['substrate', 'integration', 'connections'],
    queryFn: () => integrationModule.listConnections(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
  });

  const registryStatus = useQuery({
    queryKey: ['substrate', 'integration', 'registryStatus'],
    queryFn: () => integrationModule.getRegistryStatus(),
    staleTime: 30000,
  });

  const adapterHealth = useQuery({
    queryKey: ['substrate', 'integration', 'adapterHealth'],
    queryFn: () => integrationModule.getAdapterHealthSummary(),
    staleTime: 30000,
    refetchInterval: pollingEnabled ? 60000 : false,
  });

  // ── Discovery ──────────────────────────────────────────────────

  const discovered = (adapterId?: string) => useQuery({
    queryKey: ['substrate', 'integration', 'discovered', adapterId],
    queryFn: () => integrationModule.getDiscoveredEndpoints(adapterId),
    staleTime: 30000,
  });

  const mappedCommands = (adapterId?: string) => useQuery({
    queryKey: ['substrate', 'integration', 'mappedCommands', adapterId],
    queryFn: () => integrationModule.getCommandMappings(adapterId),
    staleTime: 30000,
  });

  // ── Connection Pools ───────────────────────────────────────────

  const poolMetrics = useQuery({
    queryKey: ['substrate', 'integration', 'poolMetrics'],
    queryFn: () => integrationModule.getAllPoolMetrics(),
    staleTime: 15000,
    refetchInterval: pollingEnabled ? 30000 : false,
  });

  // ── Schema Mapper ──────────────────────────────────────────────

  const schemaMappings = (adapterId?: string) => useQuery({
    queryKey: ['substrate', 'integration', 'schemaMappings', adapterId],
    queryFn: () => integrationModule.listSchemaMappings(adapterId),
    staleTime: 30000,
  });

  const mapperStats = useQuery({
    queryKey: ['substrate', 'integration', 'mapperStats'],
    queryFn: () => integrationModule.getMapperStats(),
    staleTime: 30000,
  });

  // ── Webhook Relay ──────────────────────────────────────────────

  const webhookEndpoints = (adapterId?: string) => useQuery({
    queryKey: ['substrate', 'integration', 'webhookEndpoints', adapterId],
    queryFn: () => integrationModule.listEndpoints(adapterId),
    staleTime: 30000,
  });

  const webhookStats = useQuery({
    queryKey: ['substrate', 'integration', 'webhookStats'],
    queryFn: () => integrationModule.getWebhookStats(),
    staleTime: 15000,
    refetchInterval: pollingEnabled ? 30000 : false,
  });

  const deadLetterQueue = useQuery({
    queryKey: ['substrate', 'integration', 'dlq'],
    queryFn: () => integrationModule.getDeadLetterQueue(),
    staleTime: 15000,
  });

  // ── Governance ─────────────────────────────────────────────────

  const policies = useQuery({
    queryKey: ['substrate', 'integration', 'policies'],
    queryFn: () => integration.policies(),
    staleTime: 60000,
  });

  // ── Mutations — Adapters ───────────────────────────────────────

  const connect = useMutation({
    mutationFn: (options: {
      adapter_type: string;
      name: string;
      config: Record<string, unknown>;
      credentials?: Record<string, string>;
    }) => integration.connect(options as any),
    onSuccess: invalidateIntegration,
  });

  const disconnect = useMutation({
    mutationFn: (adapterId: string) => integration.disconnect(adapterId),
    onSuccess: invalidateIntegration,
  });

  const test = useMutation({
    mutationFn: (adapterId: string) => integration.test(adapterId),
  });

  const discover = useMutation({
    mutationFn: (options?: { target?: string; depth?: 'shallow' | 'deep'; include_functions?: boolean }) =>
      integration.discover(options),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'integration', 'discovered'] }),
  });

  const mapCommand = useMutation({
    mutationFn: (options: {
      discovered_function: string;
      terminal_command: string;
      description: string;
      parameters?: Array<{ name: string; type: string; required: boolean }>;
    }) => integration.mapCommand(options),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'integration', 'mappedCommands'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'integration', 'policies'] }),
  });

  // ── Mutations — Schema ─────────────────────────────────────────

  const createMapping = useMutation({
    mutationFn: (params: {
      name: string;
      sourceAdapter: string;
      targetAdapter: string;
      steps: integrationModule.TransformStep[];
    }) => Promise.resolve(integrationModule.createSchemaMapping(params)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'integration', 'schemaMappings'] }),
  });

  const transformMutation = useMutation({
    mutationFn: (params: { mappingId: string; data: Record<string, unknown> }) =>
      Promise.resolve(integrationModule.executeTransform(params.mappingId, params.data)),
  });

  const batchTransform = useMutation({
    mutationFn: (params: { mappingId: string; records: Record<string, unknown>[] }) =>
      Promise.resolve(integrationModule.executeBatchTransform(params.mappingId, params.records)),
  });

  // ── Mutations — Webhooks ───────────────────────────────────────

  const registerWebhook = useMutation({
    mutationFn: (params: {
      adapterId: string;
      url: string;
      events: string[];
      secret: string;
      metadata?: Record<string, unknown>;
    }) => Promise.resolve(integrationModule.registerEndpoint(params)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'integration', 'webhookEndpoints'] }),
  });

  const replayDeadLetterMutation = useMutation({
    mutationFn: (deliveryId: string) =>
      Promise.resolve(integrationModule.replayDeadLetter(deliveryId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'integration', 'dlq'] }),
  });

  // ── Mutations — Pools ──────────────────────────────────────────

  const createPoolMutation = useMutation({
    mutationFn: (params: { adapterId: string; config?: Partial<Omit<integrationModule.PoolConfig, 'adapterId'>> }) =>
      Promise.resolve(integrationModule.createPool(params.adapterId, params.config)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'integration', 'poolMetrics'] }),
  });

  const evaluateScaling = useMutation({
    mutationFn: (adapterId: string) =>
      Promise.resolve(integrationModule.evaluatePoolScaling(adapterId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['substrate', 'integration', 'poolMetrics'] }),
  });

  return {
    status,
    pulse,
    hardeningHealth,
    adapters,
    connections,
    registryStatus,
    adapterHealth,
    discovered,
    mappedCommands,
    poolMetrics,
    schemaMappings,
    mapperStats,
    webhookEndpoints,
    webhookStats,
    deadLetterQueue,
    policies,
    connect,
    disconnect,
    test,
    discover,
    mapCommand,
    execute,
    setPolicy,
    createMapping,
    transform: transformMutation,
    batchTransform,
    registerWebhook,
    replayDeadLetter: replayDeadLetterMutation,
    createPool: createPoolMutation,
    evaluateScaling,
  };
}

export default useIntegration;
