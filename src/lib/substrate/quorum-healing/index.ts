/**
 * Quorum-Based Healing Engine
 * SPARTA Epoch — Require multiple diagnostic signals to agree before auto-heal
 * 
 * Prevents false-positive healing storms by requiring consensus
 * from multiple diagnostic sources before triggering recovery.
 */

import { emit } from '../events';
import type { SubstrateModuleName } from '@/lib/core';

export type DiagnosticSource = 'circuit_breaker' | 'health_score' | 'predictive' | 'anomaly_correlation' | 'load_shedding';

export interface HealVote {
  source: DiagnosticSource;
  nodeId: SubstrateModuleName;
  shouldHeal: boolean;
  severity: number; // 0-100
  timestamp: number;
  reason: string;
}

export interface QuorumDecision {
  id: string;
  nodeId: SubstrateModuleName;
  votes: HealVote[];
  quorumMet: boolean;
  decision: 'heal' | 'wait' | 'monitor';
  votesFor: number;
  votesAgainst: number;
  requiredVotes: number;
  decidedAt: number;
  healTriggered: boolean;
}

export interface QuorumConfig {
  requiredVotes: number; // minimum votes to trigger heal
  votingWindowMs: number; // votes must arrive within this window
  cooldownMs: number; // minimum time between heals for same node
  severityThreshold: number; // min avg severity to auto-heal
}

const config: QuorumConfig = {
  requiredVotes: 3,
  votingWindowMs: 30_000, // 30 seconds
  cooldownMs: 120_000, // 2 minutes
  severityThreshold: 40,
};

const pendingVotes = new Map<SubstrateModuleName, HealVote[]>();
const decisions: QuorumDecision[] = [];
const lastHealTime = new Map<SubstrateModuleName, number>();

export function submitVote(vote: HealVote): QuorumDecision | null {
  const { nodeId } = vote;

  // Check cooldown
  const lastHeal = lastHealTime.get(nodeId) ?? 0;
  if (Date.now() - lastHeal < config.cooldownMs) return null;

  // Add vote
  if (!pendingVotes.has(nodeId)) pendingVotes.set(nodeId, []);
  const votes = pendingVotes.get(nodeId)!;
  votes.push(vote);

  // Clean old votes outside window
  const cutoff = Date.now() - config.votingWindowMs;
  const validVotes = votes.filter(v => v.timestamp >= cutoff);
  pendingVotes.set(nodeId, validVotes);

  // Check quorum
  const votesFor = validVotes.filter(v => v.shouldHeal).length;
  const votesAgainst = validVotes.filter(v => !v.shouldHeal).length;
  const uniqueSources = new Set(validVotes.filter(v => v.shouldHeal).map(v => v.source));

  if (uniqueSources.size >= config.requiredVotes) {
    const avgSeverity = validVotes.reduce((s, v) => s + v.severity, 0) / validVotes.length;
    const shouldHeal = avgSeverity >= config.severityThreshold;

    const decision: QuorumDecision = {
      id: `quorum-${Date.now()}-${nodeId}`,
      nodeId,
      votes: [...validVotes],
      quorumMet: true,
      decision: shouldHeal ? 'heal' : 'monitor',
      votesFor,
      votesAgainst,
      requiredVotes: config.requiredVotes,
      decidedAt: Date.now(),
      healTriggered: shouldHeal,
    };

    decisions.push(decision);
    pendingVotes.delete(nodeId);

    if (shouldHeal) {
      lastHealTime.set(nodeId, Date.now());
    }

    emit({
      module: 'system',
      event_type: 'quorum_decision',
      outcome: shouldHeal ? 'succeeded' : 'skipped',
      data: { nodeId, decision: decision.decision, votesFor, uniqueSources: Array.from(uniqueSources), avgSeverity },
    });

    if (decisions.length > 200) decisions.splice(0, decisions.length - 100);

    return decision;
  }

  return null; // Quorum not yet met
}

export function configureQuorum(cfg: Partial<QuorumConfig>): QuorumConfig {
  Object.assign(config, cfg);
  return { ...config };
}

export function getQuorumConfig(): QuorumConfig {
  return { ...config };
}

export function getPendingVotes(nodeId?: SubstrateModuleName): HealVote[] {
  if (nodeId) return pendingVotes.get(nodeId) ?? [];
  const all: HealVote[] = [];
  for (const votes of pendingVotes.values()) all.push(...votes);
  return all;
}

export function getDecisions(limit = 20): QuorumDecision[] {
  return decisions.slice(-limit);
}

export function getQuorumSummary() {
  const recent = decisions.slice(-50);
  const healed = recent.filter(d => d.healTriggered);
  const falsePositivesPrevented = recent.filter(d => d.quorumMet && !d.healTriggered);

  return {
    totalDecisions: decisions.length,
    healsTriggered: healed.length,
    falsePositivesPrevented: falsePositivesPrevented.length,
    pendingNodes: pendingVotes.size,
    requiredVotes: config.requiredVotes,
    cooldownMs: config.cooldownMs,
  };
}
