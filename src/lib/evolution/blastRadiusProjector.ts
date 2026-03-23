/**
 * Blast Radius Projector — EVOLUTION v9.0.0
 * Quantifies impact surface of proposed mutations.
 */

// --- Types ---

export interface BlastRadiusInput {
  proposalId: string;
  changedModules: string[];
  moduleGraph: Record<string, string[]>; // module → downstream consumers
  criticalModules: string[];
  estimatedLinesChanged: number;
  newCodePaths: number;
}

export interface BlastRadiusReport {
  proposalId: string;
  directImpact: string[];
  transitiveImpact: string[];
  totalAffectedModules: number;
  criticalModulesAffected: string[];
  radiusScore: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedRecoveryMs: number;
  timestamp: number;
}

// --- Constants ---

const MAX_REPORTS = 200;
const RECOVERY_BASE_MS = 5_000;
const RECOVERY_PER_MODULE_MS = 2_000;
const RECOVERY_CRITICAL_MULTIPLIER = 3;

// --- State ---

const reports: BlastRadiusReport[] = [];

// --- Core ---

export function projectBlastRadius(input: BlastRadiusInput): BlastRadiusReport {
  const directImpact = [...input.changedModules];

  // BFS to find transitive impact
  const visited = new Set(directImpact);
  const queue = [...directImpact];
  const transitiveImpact: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const downstream = input.moduleGraph[current] || [];
    for (const dep of downstream) {
      if (!visited.has(dep)) {
        visited.add(dep);
        transitiveImpact.push(dep);
        queue.push(dep);
      }
    }
  }

  const totalAffected = visited.size;
  const allModules = new Set(Object.keys(input.moduleGraph));
  for (const vals of Object.values(input.moduleGraph)) {
    for (const v of vals) allModules.add(v);
  }

  const totalModules = Math.max(allModules.size, 1);
  const criticalAffected = [...visited].filter(m => input.criticalModules.includes(m));

  // Score: ratio of affected modules, weighted by criticality and code change size
  const coverageRatio = totalAffected / totalModules;
  const criticalPenalty = criticalAffected.length > 0 ? 0.2 * criticalAffected.length : 0;
  const sizeFactor = Math.min(input.estimatedLinesChanged / 1000, 0.3);
  const pathFactor = Math.min(input.newCodePaths / 20, 0.2);

  const radiusScore = Math.min(1, coverageRatio + criticalPenalty + sizeFactor + pathFactor);

  const riskLevel: BlastRadiusReport['riskLevel'] =
    radiusScore >= 0.7 ? 'critical' :
    radiusScore >= 0.4 ? 'high' :
    radiusScore >= 0.2 ? 'medium' : 'low';

  const estimatedRecoveryMs = RECOVERY_BASE_MS
    + totalAffected * RECOVERY_PER_MODULE_MS
    + criticalAffected.length * RECOVERY_CRITICAL_MULTIPLIER * RECOVERY_PER_MODULE_MS;

  const report: BlastRadiusReport = {
    proposalId: input.proposalId,
    directImpact,
    transitiveImpact,
    totalAffectedModules: totalAffected,
    criticalModulesAffected: criticalAffected,
    radiusScore: Math.round(radiusScore * 100) / 100,
    riskLevel,
    estimatedRecoveryMs,
    timestamp: Date.now(),
  };

  reports.push(report);
  if (reports.length > MAX_REPORTS) reports.splice(0, reports.length - MAX_REPORTS);

  return report;
}

export function getReports(count: number = 50): BlastRadiusReport[] {
  return reports.slice(-count);
}

export function getReportForProposal(proposalId: string): BlastRadiusReport | null {
  return reports.find(r => r.proposalId === proposalId) ?? null;
}

export function clearBlastRadiusState(): void {
  reports.length = 0;
}
