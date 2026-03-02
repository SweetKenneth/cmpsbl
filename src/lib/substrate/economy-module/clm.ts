/**
 * ECONOMY Module CLM — Constant Learning Mode
 * Circuit Breaker + Hot-Swap Aware
 */

import { emit } from '../events';
import { getEconomyState, getEconomyResilience, forecastCosts, getCapabilityBreakdown } from './index';
import type { CLMReport } from '../encode-module/clm';

export async function runEconomyCLMCycle(): Promise<CLMReport> {
  const state = getEconomyState();
  const resilience = getEconomyResilience();
  const cycleId = `clm-economy-${Date.now()}`;

  // Run forecast (CLM upgrade)
  const forecast = forecastCosts(7);
  const topCapabilities = getCapabilityBreakdown().slice(0, 3);

  const learnings = [
    `Total spend: ${state.totalSpendMillicents / 100}¢, today: ${state.todaySpendMillicents / 100}¢`,
    `Budget configs: ${state.budgets.length}, alerts fired: ${state.alertsFired}`,
    `Circuit: ${resilience.circuit.state} (${resilience.circuit.failures} failures, ${resilience.circuit.totalTrips} trips)`,
    `Engine: ${resilience.engineCount} active, grade: ${resilience.grade}`,
    `Forecast: ${forecast.trend} trend, projected ${forecast.projectedMonthly / 100}¢/month`,
    `Top capabilities: ${topCapabilities.map(c => `${c.capability}(${c.percentOfTotal}%)`).join(', ') || 'none tracked'}`,
  ];
  const proposedUpgrades = [
    '✅ Predictive cost forecasting — IMPLEMENTED (linear regression + confidence intervals)',
    '✅ Per-capability cost attribution — IMPLEMENTED',
    ...forecast.warnings,
    resilience.grade !== 'healthy' ? 'Economy circuit degraded — cost tracking may be incomplete' : null,
  ].filter(Boolean) as string[];
  const risks: string[] = [];
  if (state.alertsFired > 5) risks.push('Multiple budget alerts fired');
  if (forecast.trend === 'increasing') risks.push(`Cost trend increasing — projected ${forecast.predictedSpendMillicents / 100}¢ in 7 days`);
  if (resilience.circuit.state === 'open') risks.push('CIRCUIT OPEN — cost recording blocked');

  const report: CLMReport = { module: 'economy', cycleId, learnings, proposedUpgrades, risks, confidence: state.initialized ? 0.85 : 0.3, timestamp: new Date().toISOString() };
  emit({ module: 'economy', event_type: 'clm_cycle', outcome: 'succeeded', data: { cycleId, grade: resilience.grade } });
  return report;
}
