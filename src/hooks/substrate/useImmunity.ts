/**
 * useImmunity Hook — IMMUNITY module operations
 * Full capability surface: anomaly detection, quarantine, drift analysis,
 * threat intel, cascade detection, healing, sentinel, behavioral profiling,
 * immune memory, perimeter scanning, audit chain.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';
import {
  // Anomaly signatures
  registerAnomalySignature,
  getAnomalySignatures,
  // Drift
  captureDriftBaseline,
  analyzeDrift,
  getDriftBaselines,
  // Quarantine
  quarantineModule,
  releaseFromQuarantine,
  isQuarantined,
  getQuarantinedModules,
  // Threat intel
  ingestThreatIntel,
  getActiveThreatIntel,
  // Correlation
  correlateAnomalies,
  getCorrelatedAnomalies,
  // Cascade
  detectCascade,
  getCascadeEvents,
  getCascadeRate,
  // Healing
  recordHealingAttempt,
  getHealingStats,
  // Sentinel
  getSentinelStats,
  // Behavioral
  updateBehavioralProfile,
  getBehavioralProfiles,
  // Immune memory
  learnPattern,
  getImmuneMemory,
  getImmuneMemoryEffectiveness,
  // Perimeter
  getPerimeterScanStats,
  // Confidence
  getAggregatedConfidence,
  // Escalation
  getEscalationRate,
  // Attack surface
  getAttackSurfaceMap,
  mapAttackSurface,
  // Audit
  appendAuditEntry,
  verifyAuditChain,
  getAuditTrail,
  // Response time
  getResponseTimeStats,
} from '@/lib/substrate/immunity-hardening';

export interface UseImmunityReturn {
  // Queries
  anomalySignatures: ReturnType<typeof useQuery>;
  driftBaselines: ReturnType<typeof useQuery>;
  quarantinedModules: ReturnType<typeof useQuery>;
  activeThreatIntel: ReturnType<typeof useQuery>;
  correlatedAnomalies: ReturnType<typeof useQuery>;
  cascadeEvents: ReturnType<typeof useQuery>;
  healingStats: ReturnType<typeof useQuery>;
  sentinelStats: ReturnType<typeof useQuery>;
  behavioralProfiles: ReturnType<typeof useQuery>;
  immuneMemory: ReturnType<typeof useQuery>;
  perimeterStats: ReturnType<typeof useQuery>;
  confidence: ReturnType<typeof useQuery>;
  attackSurface: ReturnType<typeof useQuery>;
  auditChainStatus: ReturnType<typeof useQuery>;
  responseTimeStats: ReturnType<typeof useQuery>;
  escalationRate: ReturnType<typeof useQuery>;

  // Mutations
  registerAnomaly: ReturnType<typeof useMutation>;
  analyzeDrift: ReturnType<typeof useMutation>;
  captureDriftBaseline: ReturnType<typeof useMutation>;
  quarantine: ReturnType<typeof useMutation>;
  releaseQuarantine: ReturnType<typeof useMutation>;
  checkQuarantine: ReturnType<typeof useMutation>;
  ingestThreat: ReturnType<typeof useMutation>;
  correlate: ReturnType<typeof useMutation>;
  detectCascade: ReturnType<typeof useMutation>;
  recordHealing: ReturnType<typeof useMutation>;
  updateBehavior: ReturnType<typeof useMutation>;
  learnPattern: ReturnType<typeof useMutation>;
  mapAttackSurface: ReturnType<typeof useMutation>;
  appendAudit: ReturnType<typeof useMutation>;
  verifyAudit: ReturnType<typeof useMutation>;
  fetchAuditTrail: ReturnType<typeof useMutation>;
}

export function useImmunity(): UseImmunityReturn {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['substrate', 'immunity'] });

  // ── Queries ──
  const anomalySignatures_ = useQuery({
    queryKey: ['substrate', 'immunity', 'anomalySignatures'],
    queryFn: () => getAnomalySignatures(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const driftBaselines_ = useQuery({
    queryKey: ['substrate', 'immunity', 'driftBaselines'],
    queryFn: () => getDriftBaselines(),
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const quarantinedModules_ = useQuery({
    queryKey: ['substrate', 'immunity', 'quarantined'],
    queryFn: () => getQuarantinedModules(),
    refetchInterval: pollingEnabled ? 15000 : false,
    staleTime: 5000,
    enabled: pollingEnabled,
  });

  const activeThreatIntel_ = useQuery({
    queryKey: ['substrate', 'immunity', 'threatIntel'],
    queryFn: () => getActiveThreatIntel(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const correlatedAnomalies_ = useQuery({
    queryKey: ['substrate', 'immunity', 'correlations'],
    queryFn: () => getCorrelatedAnomalies(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const cascadeEvents_ = useQuery({
    queryKey: ['substrate', 'immunity', 'cascades'],
    queryFn: () => ({ events: getCascadeEvents(), rate: getCascadeRate() }),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const healingStats_ = useQuery({
    queryKey: ['substrate', 'immunity', 'healing'],
    queryFn: () => getHealingStats(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const sentinelStats_ = useQuery({
    queryKey: ['substrate', 'immunity', 'sentinel'],
    queryFn: () => getSentinelStats(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  const behavioralProfiles_ = useQuery({
    queryKey: ['substrate', 'immunity', 'behavioral'],
    queryFn: () => getBehavioralProfiles(),
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const immuneMemory_ = useQuery({
    queryKey: ['substrate', 'immunity', 'memory'],
    queryFn: () => ({ patterns: getImmuneMemory(), effectiveness: getImmuneMemoryEffectiveness() }),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const perimeterStats_ = useQuery({
    queryKey: ['substrate', 'immunity', 'perimeter'],
    queryFn: () => getPerimeterScanStats(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const confidence_ = useQuery({
    queryKey: ['substrate', 'immunity', 'confidence'],
    queryFn: () => getAggregatedConfidence(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const attackSurface_ = useQuery({
    queryKey: ['substrate', 'immunity', 'attackSurface'],
    queryFn: () => getAttackSurfaceMap(),
    staleTime: 60000,
    enabled: pollingEnabled,
  });

  const auditChainStatus_ = useQuery({
    queryKey: ['substrate', 'immunity', 'auditChain'],
    queryFn: () => verifyAuditChain(),
    refetchInterval: pollingEnabled ? 60000 : false,
    staleTime: 30000,
    enabled: pollingEnabled,
  });

  const responseTimeStats_ = useQuery({
    queryKey: ['substrate', 'immunity', 'responseTimes'],
    queryFn: () => getResponseTimeStats(),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 15000,
    enabled: pollingEnabled,
  });

  const escalationRate_ = useQuery({
    queryKey: ['substrate', 'immunity', 'escalationRate'],
    queryFn: () => ({ rate: getEscalationRate() }),
    refetchInterval: pollingEnabled ? 30000 : false,
    staleTime: 10000,
    enabled: pollingEnabled,
  });

  // ── Mutations ──
  const registerAnomaly = useMutation({
    mutationFn: (params: { pattern: string; severity: 'low' | 'medium' | 'high' | 'critical'; threshold?: number }) =>
      Promise.resolve(registerAnomalySignature(params.pattern, params.severity, params.threshold)),
    onSuccess: invalidate,
  });

  const analyzeDriftMut = useMutation({
    mutationFn: (params: { moduleId: string; currentMetrics: Record<string, number> }) =>
      Promise.resolve(analyzeDrift(params.moduleId, params.currentMetrics)),
  });

  const captureDriftBaselineMut = useMutation({
    mutationFn: (params: { moduleId: string; metrics: Record<string, number> }) =>
      Promise.resolve(captureDriftBaseline(params.moduleId, params.metrics)),
    onSuccess: invalidate,
  });

  const quarantineMut = useMutation({
    mutationFn: (params: { moduleId: string; reason: string; severity?: string; autoRelease?: boolean; releaseAfterMs?: number }) =>
      Promise.resolve(quarantineModule(params.moduleId, params.reason, params.severity, params.autoRelease, params.releaseAfterMs)),
    onSuccess: invalidate,
  });

  const releaseQuarantine = useMutation({
    mutationFn: (params: { moduleId: string }) =>
      Promise.resolve(releaseFromQuarantine(params.moduleId)),
    onSuccess: invalidate,
  });

  const checkQuarantine = useMutation({
    mutationFn: (params: { moduleId: string }) =>
      Promise.resolve({ quarantined: isQuarantined(params.moduleId) }),
  });

  const ingestThreat = useMutation({
    mutationFn: (params: { category: 'injection' | 'escalation' | 'exfiltration' | 'dos' | 'tampering' | 'cascade'; indicator: string; confidence: number }) =>
      Promise.resolve(ingestThreatIntel(params.category, params.indicator, params.confidence)),
    onSuccess: invalidate,
  });

  const correlateMut = useMutation({
    mutationFn: (params: { anomalies: Array<{ module: string; type: string; score: number }> }) =>
      Promise.resolve(correlateAnomalies(params.anomalies)),
    onSuccess: invalidate,
  });

  const detectCascadeMut = useMutation({
    mutationFn: (params: { triggerModule: string; failureChain: string[] }) =>
      Promise.resolve(detectCascade(params.triggerModule, params.failureChain)),
    onSuccess: invalidate,
  });

  const recordHealing = useMutation({
    mutationFn: (params: { moduleId: string; strategy: 'restart' | 'rollback' | 'degrade' | 'isolate' | 'reconfigure'; success: boolean; durationMs: number; note?: string }) =>
      Promise.resolve(recordHealingAttempt(params.moduleId, params.strategy, params.success, params.durationMs, params.note)),
    onSuccess: invalidate,
  });

  const updateBehavior = useMutation({
    mutationFn: (params: { moduleId: string; pattern: string; isDeviation: boolean }) =>
      Promise.resolve(updateBehavioralProfile(params.moduleId, params.pattern, params.isDeviation)),
    onSuccess: invalidate,
  });

  const learnPatternMut = useMutation({
    mutationFn: (params: { signature: string; category: string; effectiveness: number }) =>
      Promise.resolve(learnPattern(params.signature, params.category, params.effectiveness)),
    onSuccess: invalidate,
  });

  const mapAttackSurfaceMut = useMutation({
    mutationFn: (params: { entryPoint: string; exposureLevel: 'low' | 'medium' | 'high'; mitigations: string[] }) =>
      Promise.resolve(mapAttackSurface(params.entryPoint, params.exposureLevel, params.mitigations)),
    onSuccess: invalidate,
  });

  const appendAudit = useMutation({
    mutationFn: (params: { action: string; actor: string }) =>
      Promise.resolve(appendAuditEntry(params.action, params.actor)),
    onSuccess: invalidate,
  });

  const verifyAudit = useMutation({
    mutationFn: () => Promise.resolve(verifyAuditChain()),
  });

  const fetchAuditTrail = useMutation({
    mutationFn: (params?: { limit?: number }) =>
      Promise.resolve(getAuditTrail(params?.limit)),
  });

  return {
    anomalySignatures: anomalySignatures_,
    driftBaselines: driftBaselines_,
    quarantinedModules: quarantinedModules_,
    activeThreatIntel: activeThreatIntel_,
    correlatedAnomalies: correlatedAnomalies_,
    cascadeEvents: cascadeEvents_,
    healingStats: healingStats_,
    sentinelStats: sentinelStats_,
    behavioralProfiles: behavioralProfiles_,
    immuneMemory: immuneMemory_,
    perimeterStats: perimeterStats_,
    confidence: confidence_,
    attackSurface: attackSurface_,
    auditChainStatus: auditChainStatus_,
    responseTimeStats: responseTimeStats_,
    escalationRate: escalationRate_,
    registerAnomaly,
    analyzeDrift: analyzeDriftMut,
    captureDriftBaseline: captureDriftBaselineMut,
    quarantine: quarantineMut,
    releaseQuarantine,
    checkQuarantine,
    ingestThreat,
    correlate: correlateMut,
    detectCascade: detectCascadeMut,
    recordHealing,
    updateBehavior,
    learnPattern: learnPatternMut,
    mapAttackSurface: mapAttackSurfaceMut,
    appendAudit,
    verifyAudit,
    fetchAuditTrail,
  };
}
