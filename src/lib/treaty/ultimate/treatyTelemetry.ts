/**
 * TREATY Ultimate — Treaty Telemetry Nexus
 * Unified observability across all treaty subsystems.
 */

import { getDisputeStats } from './disputeResolution';
import { getForecastStats } from './slaForecaster';
import { getPenaltyStats } from './penaltyCalculus';
import { getNegotiationStats } from './contractNegotiation';
import { getAuditStats } from './treatyAuditChain';
import { getProverStats } from './complianceProver';
import { getArbitrationStats } from './multiPartyArbitration';
import { getOptimizerStats } from './termOptimizer';

export interface TreatyUltimateTelemetry {
  version: string;
  codename: string;
  subsystems: {
    disputes: ReturnType<typeof getDisputeStats>;
    forecasts: ReturnType<typeof getForecastStats>;
    penalties: ReturnType<typeof getPenaltyStats>;
    negotiations: ReturnType<typeof getNegotiationStats>;
    auditChain: ReturnType<typeof getAuditStats>;
    complianceProofs: ReturnType<typeof getProverStats>;
    arbitration: ReturnType<typeof getArbitrationStats>;
    optimizer: ReturnType<typeof getOptimizerStats>;
  };
  compositeHealth: number;
  timestamp: number;
}

export function getTreatyTelemetry(): TreatyUltimateTelemetry {
  const disputes = getDisputeStats();
  const forecasts = getForecastStats();
  const penalties = getPenaltyStats();
  const negotiations = getNegotiationStats();
  const auditChain = getAuditStats();
  const complianceProofs = getProverStats();
  const arbitration = getArbitrationStats();
  const optimizer = getOptimizerStats();

  // Composite health: weighted average of subsystem indicators
  let health = 100;

  // Disputes: pending disputes reduce health
  if (disputes.pending > 5) health -= 15;
  else if (disputes.pending > 2) health -= 5;

  // Forecasts: at-risk SLAs reduce health
  if (forecasts.atRisk > 3) health -= 20;
  else if (forecasts.atRisk > 0) health -= 10;

  // Penalties: high accrual is bad
  if (penalties.activeEntries > 10) health -= 15;
  else if (penalties.activeEntries > 5) health -= 5;

  // Negotiations: deadlocked negotiations reduce health
  if (negotiations.deadlocked > 2) health -= 10;

  // Audit chain integrity
  if (!auditChain.chainIntegrity) health -= 25;

  // Compliance: low compliance rate
  if (complianceProofs.complianceRate < 0.7) health -= 15;
  else if (complianceProofs.complianceRate < 0.9) health -= 5;

  // Arbitration: failed cases
  if (arbitration.failed > 2) health -= 10;

  return {
    version: '9.0.0',
    codename: 'Pact Sovereign',
    subsystems: {
      disputes,
      forecasts,
      penalties,
      negotiations,
      auditChain,
      complianceProofs,
      arbitration,
      optimizer,
    },
    compositeHealth: Math.max(0, Math.min(100, health)),
    timestamp: Date.now(),
  };
}
