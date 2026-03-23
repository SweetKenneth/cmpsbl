/**
 * useLingua Hook — LINGUA v9.0.0 "Polyglot" operations
 * Universal Translation & Protocol Bridge Engine
 * Full capability surface: translate, schema, bridges, negotiation, batch, CLM
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  initLingua,
  translate,
  mapSchema,
  getLinguaState,
  getLinguaHealth,
  getLinguaResilience,
  getLinguaHardening,
  upgradeLinguaEngine,
  // Adaptive Fidelity
  getCoercionSafety,
  // Schema Intelligence
  generateSchemaMigration,
  inferSchemaMapping,
  // Protocol Bridge Mesh
  findTransitivePath,
  verifyBridgeRoundTrip,
  hotSwapBridge,
  // Multi-Modal Pipeline
  streamTranslate,
  queueBatchTranslation,
  processBatchQueue,
  partialTranslate,
  // Format Negotiation
  registerNodeFormats,
  negotiateFormat,
  getFallbackChain,
  // Telemetry
  getAnomalyAlerts,
  getBridgeStats,
  getFidelityHeatMap,
  getSchemaStats,
  type Modality,
  type TranslationQuality,
  type FieldMapping,
  type SchemaMapping,
} from '@/lib/substrate/lingua-module';
import { runLinguaCLM } from '@/lib/substrate/lingua/clm';

export function useLingua() {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'lingua'] });

  // ═══ QUERIES ═══

  const state = useQuery({
    queryKey: ['substrate', 'lingua', 'state'],
    queryFn: () => Promise.resolve(getLinguaState()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const health = useQuery({
    queryKey: ['substrate', 'lingua', 'health'],
    queryFn: () => Promise.resolve(getLinguaHealth()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const resilience = useQuery({
    queryKey: ['substrate', 'lingua', 'resilience'],
    queryFn: () => Promise.resolve(getLinguaResilience()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const hardeningQuery = useQuery({
    queryKey: ['substrate', 'lingua', 'hardening'],
    queryFn: () => Promise.resolve(getLinguaHardening()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const bridgeStats = useQuery({
    queryKey: ['substrate', 'lingua', 'bridge-stats'],
    queryFn: () => Promise.resolve(getBridgeStats()),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const fidelityHeatMap = useQuery({
    queryKey: ['substrate', 'lingua', 'fidelity-heatmap'],
    queryFn: () => Promise.resolve(getFidelityHeatMap()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const schemaStats = useQuery({
    queryKey: ['substrate', 'lingua', 'schema-stats'],
    queryFn: () => Promise.resolve(getSchemaStats()),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const anomalies = useQuery({
    queryKey: ['substrate', 'lingua', 'anomalies'],
    queryFn: () => Promise.resolve(getAnomalyAlerts()),
    refetchInterval: pollingEnabled ? 15000 : false,
    staleTime: 5000,
    enabled: pollingEnabled,
  });

  // ═══ LIFECYCLE ═══

  const init = useMutation({
    mutationFn: () => Promise.resolve(initLingua()),
    onSuccess: invalidate,
  });

  const upgradeEngine = useMutation({
    mutationFn: (params: { version: string }) => Promise.resolve(upgradeLinguaEngine(params.version)),
    onSuccess: invalidate,
  });

  const runCLM = useMutation({
    mutationFn: () => {
      const s = getLinguaState();
      return Promise.resolve(runLinguaCLM(s));
    },
  });

  // ═══ CORE OPERATIONS ═══

  const translateMut = useMutation({
    mutationFn: (params: { content: string; from: Modality; to: Modality; quality?: TranslationQuality }) =>
      Promise.resolve(translate(params.content, params.from, params.to, params.quality)),
    onSuccess: invalidate,
  });

  const mapSchemaMut = useMutation({
    mutationFn: (params: { sourceSchema: string; targetSchema: string; fieldMappings: FieldMapping[] }) =>
      Promise.resolve(mapSchema(params.sourceSchema, params.targetSchema, params.fieldMappings)),
    onSuccess: invalidate,
  });

  // ═══ BRIDGE MESH ═══

  const findPath = useMutation({
    mutationFn: (params: { from: Modality; to: Modality }) =>
      Promise.resolve(findTransitivePath(params.from, params.to)),
  });

  const verifyBridge = useMutation({
    mutationFn: (params: { bridgeId: string }) =>
      Promise.resolve(verifyBridgeRoundTrip(params.bridgeId)),
    onSuccess: invalidate,
  });

  const swapBridge = useMutation({
    mutationFn: (params: { bridgeId: string }) =>
      Promise.resolve(hotSwapBridge(params.bridgeId)),
    onSuccess: invalidate,
  });

  // ═══ PIPELINE ═══

  const streamTranslateMut = useMutation({
    mutationFn: (params: { content: string; from: Modality; to: Modality; quality?: TranslationQuality }) =>
      Promise.resolve(streamTranslate(params.content, params.from, params.to, params.quality)),
    onSuccess: invalidate,
  });

  const batchTranslate = useMutation({
    mutationFn: (params: { items: Array<{ content: string; from: Modality; to: Modality }>; priority?: 'low' | 'normal' | 'high' | 'governance' }) =>
      Promise.resolve(queueBatchTranslation(params.items, params.priority)),
    onSuccess: invalidate,
  });

  const processBatches = useMutation({
    mutationFn: () => Promise.resolve(processBatchQueue()),
    onSuccess: invalidate,
  });

  const partialTranslateMut = useMutation({
    mutationFn: (params: { content: string; from: Modality; to: Modality; quality?: TranslationQuality }) =>
      Promise.resolve(partialTranslate(params.content, params.from, params.to, params.quality)),
    onSuccess: invalidate,
  });

  // ═══ SCHEMA INTELLIGENCE ═══

  const inferMapping = useMutation({
    mutationFn: (params: { sourceFields: string[]; targetFields: string[] }) =>
      Promise.resolve(inferSchemaMapping(params.sourceFields, params.targetFields)),
  });

  const migrateSchemaMut = useMutation({
    mutationFn: (params: { oldMapping: SchemaMapping; newFields: FieldMapping[] }) =>
      Promise.resolve(generateSchemaMigration(params.oldMapping, params.newFields)),
    onSuccess: invalidate,
  });

  // ═══ FORMAT NEGOTIATION ═══

  const registerFormats = useMutation({
    mutationFn: (params: { nodeId: string; formats: Modality[]; preferred: Modality; fallbacks: Modality[] }) =>
      Promise.resolve(registerNodeFormats(params.nodeId, params.formats, params.preferred, params.fallbacks)),
    onSuccess: invalidate,
  });

  const negotiate = useMutation({
    mutationFn: (params: { sourceNodeId: string; targetNodeId: string }) =>
      Promise.resolve(negotiateFormat(params.sourceNodeId, params.targetNodeId)),
  });

  return {
    // Queries
    state, health, resilience, hardening: hardeningQuery,
    bridgeStats, fidelityHeatMap, schemaStats, anomalies,
    // Lifecycle
    init, upgradeEngine, runCLM,
    // Core
    translate: translateMut, mapSchema: mapSchemaMut,
    // Bridge Mesh
    findPath, verifyBridge, swapBridge,
    // Pipeline
    streamTranslate: streamTranslateMut, batchTranslate, processBatches, partialTranslate: partialTranslateMut,
    // Schema Intelligence
    inferMapping, migrateSchema: migrateSchemaMut,
    // Format Negotiation
    registerFormats, negotiate,
    // Utility (sync, no mutation needed)
    getCoercionSafety,
    getFallbackChain,
  };
}

export default useLingua;
