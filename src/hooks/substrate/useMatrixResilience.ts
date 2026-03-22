/**
 * useMatrixResilience — Unified hook for all resilience features
 * Canary, Priority Queue, Kill Switch, Redundant Nodes,
 * Chaos Testing, Cross-Sector Correlation, Heatmap, Forecasting,
 * Quorum Healing, and Immutable Incident Reports
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debugMode } from '@/lib/debug-mode';

// Node Canary
import {
  createNodeCanary, advanceCanary, rollbackCanary as rollbackNodeCanary,
  getActiveCanaries, getAllCanaries, getCanaryStages, updateCanaryHealth,
  type NodeCanary,
} from '@/lib/substrate/node-canary';

// Priority Queue
import {
  enqueue, dequeue, complete as completeTask, getQueueState, clearQueue,
  setMaxConcurrent, getCompletedTasks,
} from '@/lib/substrate/priority-queue';

// Sector Kill Switch
import {
  killSector, reviveSector, getAllKillStates, getKilledSectors,
  killAllNonEssential, reviveAll, isSectorKilled,
  type KillSwitchState,
} from '@/lib/substrate/sector-killswitch';

// Redundant Nodes
import {
  activateStandby, deactivateStandby, getAllPairs, getActivePairs,
  getCriticalNodes, type RedundantPair,
} from '@/lib/substrate/redundant-nodes';

// Chaos Testing
import {
  injectChaos, rollbackChaos, configureChaos, getChaosSchedule,
  getChaosStats, getExperiments, type ChaosExperiment, type ChaosAction,
} from '@/lib/substrate/chaos-testing';

// Cross-Sector Correlation
import {
  detectCascadePatterns, getPatterns, getAlerts, getCorrelationSummary,
  acknowledgeAlert, recordSectorHealth, checkForPreemptiveAction,
} from '@/lib/substrate/cross-sector-correlation';

// Health Heatmap
import {
  getHeatmapData, getHeatmapSummary, startHeatmapCapture, stopHeatmapCapture,
} from '@/lib/substrate/health-heatmap';

// Anomaly Forecasting
import {
  generateForecasts, getActiveForecasts, getAllForecasts,
  getForecastSummary, configureForecast, recordFailureEvent,
} from '@/lib/substrate/anomaly-forecasting';

// Quorum Healing
import {
  submitVote, getQuorumConfig, configureQuorum, getPendingVotes,
  getDecisions, getQuorumSummary, type HealVote,
} from '@/lib/substrate/quorum-healing';

// Immutable Incidents
import {
  createIncidentReport, getIncidentReports, getOpenIncidents,
  getIncidentSummary, addResolution,
} from '@/lib/substrate/immutable-incidents';

import type { MatrixSector } from '@/lib/core/matrixNodeRegistry';
import type { SubstrateModuleName } from '@/lib/core';

export function useMatrixResilience() {
  const queryClient = useQueryClient();
  const pollingEnabled = debugMode.allowModulePolling();

  const invalidateResilience = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['matrix', 'resilience'] });
  }, [queryClient]);

  // ═══ Node Canary ═══
  const canaryDeploy = useMutation({
    mutationFn: ({ nodeId, baselineHealth }: { nodeId: SubstrateModuleName; baselineHealth: number }) =>
      Promise.resolve(createNodeCanary(nodeId, baselineHealth)),
    onSuccess: invalidateResilience,
  });

  const canaryAdvance = useMutation({
    mutationFn: (canaryId: string) => Promise.resolve(advanceCanary(canaryId)),
    onSuccess: invalidateResilience,
  });

  const canaryRollback = useMutation({
    mutationFn: ({ canaryId, reason }: { canaryId: string; reason: string }) =>
      Promise.resolve(rollbackNodeCanary(canaryId, reason)),
    onSuccess: invalidateResilience,
  });

  // ═══ Sector Kill Switch ═══
  const sectorKill = useMutation({
    mutationFn: ({ sector, reason }: { sector: MatrixSector; reason: string }) =>
      Promise.resolve(killSector(sector, reason)),
    onSuccess: invalidateResilience,
  });

  const sectorRevive = useMutation({
    mutationFn: (sector: MatrixSector) => Promise.resolve(reviveSector(sector)),
    onSuccess: invalidateResilience,
  });

  const emergencyKill = useMutation({
    mutationFn: (reason: string) => Promise.resolve(killAllNonEssential(reason)),
    onSuccess: invalidateResilience,
  });

  // ═══ Redundant Nodes ═══
  const standbyActivate = useMutation({
    mutationFn: (primaryId: SubstrateModuleName) => Promise.resolve(activateStandby(primaryId)),
    onSuccess: invalidateResilience,
  });

  const standbyDeactivate = useMutation({
    mutationFn: (primaryId: SubstrateModuleName) => Promise.resolve(deactivateStandby(primaryId)),
    onSuccess: invalidateResilience,
  });

  // ═══ Chaos Testing ═══
  const chaosInject = useMutation({
    mutationFn: ({ action, target }: { action: ChaosAction; target: string }) =>
      Promise.resolve(injectChaos(action, target)),
    onSuccess: invalidateResilience,
  });

  const chaosRollback = useMutation({
    mutationFn: (experimentId: string) => Promise.resolve(rollbackChaos(experimentId)),
    onSuccess: invalidateResilience,
  });

  const chaosConfigure = useMutation({
    mutationFn: (cfg: Parameters<typeof configureChaos>[0]) =>
      Promise.resolve(configureChaos(cfg)),
    onSuccess: invalidateResilience,
  });

  // ═══ Quorum Healing ═══
  const quorumVote = useMutation({
    mutationFn: (vote: HealVote) => Promise.resolve(submitVote(vote)),
    onSuccess: invalidateResilience,
  });

  // ═══ Incident Reports ═══
  const createReport = useMutation({
    mutationFn: (params: Parameters<typeof createIncidentReport>) =>
      createIncidentReport(...params),
    onSuccess: invalidateResilience,
  });

  const resolveIncident = useMutation({
    mutationFn: ({ correlationId, resolution }: { correlationId: string; resolution: string }) =>
      Promise.resolve(addResolution(correlationId, resolution)),
    onSuccess: invalidateResilience,
  });

  // ═══ Read-Only Queries ═══
  const killStates = useQuery({
    queryKey: ['matrix', 'resilience', 'killStates'],
    queryFn: () => getAllKillStates(),
    refetchInterval: pollingEnabled ? 10_000 : false,
    enabled: pollingEnabled,
  });

  const redundantPairs = useQuery({
    queryKey: ['matrix', 'resilience', 'redundantPairs'],
    queryFn: () => getAllPairs(),
    refetchInterval: pollingEnabled ? 15_000 : false,
    enabled: pollingEnabled,
  });

  const chaosStats = useQuery({
    queryKey: ['matrix', 'resilience', 'chaosStats'],
    queryFn: () => getChaosStats(),
    refetchInterval: pollingEnabled ? 30_000 : false,
    enabled: pollingEnabled,
  });

  const forecasts = useQuery({
    queryKey: ['matrix', 'resilience', 'forecasts'],
    queryFn: () => ({ active: getActiveForecasts(), summary: getForecastSummary() }),
    refetchInterval: pollingEnabled ? 30_000 : false,
    enabled: pollingEnabled,
  });

  const quorumState = useQuery({
    queryKey: ['matrix', 'resilience', 'quorum'],
    queryFn: () => getQuorumSummary(),
    refetchInterval: pollingEnabled ? 15_000 : false,
    enabled: pollingEnabled,
  });

  const incidents = useQuery({
    queryKey: ['matrix', 'resilience', 'incidents'],
    queryFn: () => ({ open: getOpenIncidents(), summary: getIncidentSummary() }),
    refetchInterval: pollingEnabled ? 15_000 : false,
    enabled: pollingEnabled,
  });

  const correlationState = useQuery({
    queryKey: ['matrix', 'resilience', 'correlation'],
    queryFn: () => getCorrelationSummary(),
    refetchInterval: pollingEnabled ? 30_000 : false,
    enabled: pollingEnabled,
  });

  const heatmapSummary = useQuery({
    queryKey: ['matrix', 'resilience', 'heatmap'],
    queryFn: () => getHeatmapSummary(),
    refetchInterval: pollingEnabled ? 60_000 : false,
    enabled: pollingEnabled,
  });

  return {
    // Canary
    canary: { deploy: canaryDeploy, advance: canaryAdvance, rollback: canaryRollback, getActive: getActiveCanaries, getAll: getAllCanaries, stages: getCanaryStages() },
    // Priority Queue
    queue: { enqueue, dequeue, complete: completeTask, state: getQueueState, clear: clearQueue, setMaxConcurrent, history: getCompletedTasks },
    // Kill Switch
    killSwitch: { kill: sectorKill, revive: sectorRevive, emergency: emergencyKill, reviveAll, states: killStates, isKilled: isSectorKilled, getKilled: getKilledSectors },
    // Redundant Nodes
    redundant: { activate: standbyActivate, deactivate: standbyDeactivate, pairs: redundantPairs, getActive: getActivePairs, criticalNodes: getCriticalNodes() },
    // Chaos Testing
    chaos: { inject: chaosInject, rollback: chaosRollback, configure: chaosConfigure, stats: chaosStats, schedule: getChaosSchedule, experiments: getExperiments },
    // Cross-Sector Correlation
    correlation: { detect: detectCascadePatterns, patterns: getPatterns, alerts: getAlerts, acknowledge: acknowledgeAlert, summary: correlationState, recordHealth: recordSectorHealth, checkPreemptive: checkForPreemptiveAction },
    // Heatmap
    heatmap: { data: getHeatmapData, summary: heatmapSummary, start: startHeatmapCapture, stop: stopHeatmapCapture },
    // Anomaly Forecasting
    forecast: { generate: generateForecasts, active: forecasts, all: getAllForecasts, summary: getForecastSummary, configure: configureForecast, recordFailure: recordFailureEvent },
    // Quorum Healing
    quorum: { vote: quorumVote, config: getQuorumConfig, configure: configureQuorum, pending: getPendingVotes, decisions: getDecisions, summary: quorumState },
    // Immutable Incidents
    incidents: { create: createReport, resolve: resolveIncident, reports: getIncidentReports, open: incidents, summary: getIncidentSummary },
  };
}

export type UseMatrixResilienceReturn = ReturnType<typeof useMatrixResilience>;
