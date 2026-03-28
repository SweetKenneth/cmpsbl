/**
 * TREATY Ultimate Form — v9.0.0 "Pact Sovereign"
 * Unified export and lifecycle API for all 8 Ultimate Form systems.
 *
 * Systems:
 *  1. Dispute Resolution Engine — automated arbitration with evidence weighting
 *  2. SLA Forecaster — predictive compliance with EMA trend analysis
 *  3. Penalty Calculus Engine — compound penalties with grace periods & caps
 *  4. Contract Negotiation Engine — counter-offers with convergence detection
 *  5. Treaty Audit Chain — hash-chained immutable event trail
 *  6. Compliance Prover — cryptographic compliance proofs
 *  7. Multi-Party Arbitration — N-party weighted voting
 *  8. Term Optimizer — historical data-driven threshold optimization
 *
 * Telemetry nexus provides unified observability across all subsystems.
 */

// ── Sub-module exports ──
export * from './disputeResolution';
export * from './slaForecaster';
export * from './penaltyCalculus';
export * from './contractNegotiation';
export * from './treatyAuditChain';
export * from './complianceProver';
export * from './multiPartyArbitration';
export * from './termOptimizer';
export { getTreatyTelemetry, type TreatyUltimateTelemetry } from './treatyTelemetry';

// ── Lifecycle ──

let initialized = false;

export function initTreatyUltimate(): void {
  if (initialized) return;
  initialized = true;
  console.log('[TREATY] Ultimate Form v9.0.0 "Pact Sovereign" initialized — 8 systems online');
}

export function isTreatyUltimateInitialized(): boolean {
  return initialized;
}
