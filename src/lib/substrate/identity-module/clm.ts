/**
 * IDENTITY Module CLM — Constant Learning Mode
 * Circuit Breaker + Hot-Swap Aware
 *
 * Round 1 Fix: Error handling wraps entire cycle
 */

import { emit } from '../events';
import { getIdentityState, getIdentityResilience } from './index';
import type { CLMReport } from '../encode-module/clm';

export async function runIdentityCLMCycle(): Promise<CLMReport> {
  const cycleId = `clm-identity-${Date.now()}`;
  try {
    return runCLMCycleInner(cycleId);
  } catch (err) {
    emit({ module: 'identity', event_type: 'clm_cycle', outcome: 'failed', data: { cycleId, error: err instanceof Error ? err.message : String(err) } });
    return {
      module: 'identity',
      cycleId,
      learnings: [`CLM cycle crashed: ${err instanceof Error ? err.message : String(err)}`],
      proposedUpgrades: [],
      risks: ['CRITICAL: CLM cycle failed — identity observability degraded'],
      confidence: 0.1,
      timestamp: new Date().toISOString(),
    };
  }
}

function runCLMCycleInner(cycleId: string): CLMReport {
  const state = getIdentityState();
  const resilience = getIdentityResilience();

  const learnings = [
    `Registered actors: ${state.registeredActors}, signatures issued: ${state.signaturesIssued}`,
    `Passkeys: ${state.passkeyCount}, passwordless enforced: ${state.passwordlessEnforced}`,
    `Circuit: ${resilience.circuit.state} (${resilience.circuit.failures} failures, ${resilience.circuit.totalTrips} trips)`,
    `Engine: ${resilience.engineCount} active, grade: ${resilience.grade}`,
    `Avg trust score: ${state.avgTrustScore}, portable identities: ${state.portableIdentities}`,
  ];
  const proposedUpgrades = [
    '✅ Actor reputation scoring — IMPLEMENTED (trust/reliability/tiers)',
    '✅ Cross-agency identity portability — IMPLEMENTED',
    '✅ FNV-1a signatures — IMPLEMENTED',
    '✅ Composite health scoring — IMPLEMENTED',
    resilience.grade !== 'healthy' ? 'Identity circuit degraded — actor attribution may fail' : null,
  ].filter(Boolean) as string[];

  const risks: string[] = [];
  if (state.registeredActors === 0) risks.push('No actors registered');
  if (state.avgTrustScore < 40) risks.push(`Low average trust score: ${state.avgTrustScore}`);
  if (resilience.circuit.state === 'open') risks.push('CIRCUIT OPEN — identity operations blocked');
  if (state.registeredActors > 900) risks.push(`Actor capacity pressure: ${state.registeredActors}/1000`);

  const confidence = state.initialized
    ? (resilience.grade === 'healthy' ? 0.9 : 0.6)
    : 0.3;

  const report: CLMReport = { module: 'identity', cycleId, learnings, proposedUpgrades, risks, confidence, timestamp: new Date().toISOString() };
  emit({ module: 'identity', event_type: 'clm_cycle', outcome: 'succeeded', data: { cycleId, grade: resilience.grade } });
  return report;
}
