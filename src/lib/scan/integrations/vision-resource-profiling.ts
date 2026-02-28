/**
 * VISION — Resource Profiling (#41)
 * Profiles CPU, memory, and network waste caused by technical debt,
 * translating abstract findings into concrete resource costs.
 */

export interface ResourceProfile {
  findingId: string;
  category: string;
  cpuImpactMs: number;
  memoryImpactMb: number;
  networkWasteKb: number;
  estimatedMonthlyCost: number; // cents
  wasteGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    description: string;
    resourceType: 'cpu' | 'memory' | 'network' | 'storage';
    amount: number;
    unit: string;
  }[];
}

export interface ResourceProfilingReport {
  profiles: ResourceProfile[];
  totalCpuWasteMs: number;
  totalMemoryWasteMb: number;
  totalNetworkWasteKb: number;
  estimatedMonthlySavings: number; // cents
  worstOffenders: string[]; // findingIds
  gradeDistribution: Record<ResourceProfile['wasteGrade'], number>;
  generatedAt: string;
}

interface Finding {
  id: string;
  category: string;
  severity: number;
  description: string;
  filePath?: string;
}

interface VisionMetrics {
  avgCpuMs?: number;
  peakMemoryMb?: number;
  avgPayloadKb?: number;
  requestsPerDay?: number;
}

/**
 * Profile resource waste for scanner findings using VISION metrics
 */
export function profileResourceWaste(
  findings: Finding[],
  metrics: VisionMetrics = {},
): ResourceProfilingReport {
  const profiles: ResourceProfile[] = findings.map(f => {
    const impact = estimateResourceImpact(f, metrics);
    const monthlyCost = estimateMonthlyCost(impact, metrics.requestsPerDay ?? 1000);
    const grade = gradeWaste(monthlyCost);

    return {
      findingId: f.id,
      category: f.category,
      cpuImpactMs: impact.cpu,
      memoryImpactMb: impact.memory,
      networkWasteKb: impact.network,
      estimatedMonthlyCost: monthlyCost,
      wasteGrade: grade,
      breakdown: impact.breakdown,
    };
  });

  profiles.sort((a, b) => b.estimatedMonthlyCost - a.estimatedMonthlyCost);

  const gradeDist: Record<ResourceProfile['wasteGrade'], number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  for (const p of profiles) gradeDist[p.wasteGrade]++;

  return {
    profiles,
    totalCpuWasteMs: profiles.reduce((s, p) => s + p.cpuImpactMs, 0),
    totalMemoryWasteMb: Math.round(profiles.reduce((s, p) => s + p.memoryImpactMb, 0) * 10) / 10,
    totalNetworkWasteKb: profiles.reduce((s, p) => s + p.networkWasteKb, 0),
    estimatedMonthlySavings: profiles.reduce((s, p) => s + p.estimatedMonthlyCost, 0),
    worstOffenders: profiles.slice(0, 5).map(p => p.findingId),
    gradeDistribution: gradeDist,
    generatedAt: new Date().toISOString(),
  };
}

function estimateResourceImpact(
  finding: Finding,
  metrics: VisionMetrics,
): { cpu: number; memory: number; network: number; breakdown: ResourceProfile['breakdown'] } {
  const breakdown: ResourceProfile['breakdown'] = [];

  // Category-based resource waste estimation
  const categoryImpact: Record<string, { cpu: number; memory: number; network: number }> = {
    performance: { cpu: 50, memory: 10, network: 20 },
    complexity: { cpu: 30, memory: 5, network: 0 },
    dead_code: { cpu: 5, memory: 15, network: 10 },
    migration: { cpu: 10, memory: 2, network: 0 },
    accessibility: { cpu: 2, memory: 1, network: 5 },
    security: { cpu: 0, memory: 0, network: 0 }, // security debt != resource waste
    config_drift: { cpu: 5, memory: 3, network: 5 },
  };

  const base = categoryImpact[finding.category] ?? { cpu: 10, memory: 3, network: 5 };
  const severityMultiplier = finding.severity / 5;

  const cpu = Math.round(base.cpu * severityMultiplier);
  const memory = Math.round(base.memory * severityMultiplier * 10) / 10;
  const network = Math.round(base.network * severityMultiplier);

  if (cpu > 0) breakdown.push({ description: `CPU overhead from ${finding.category}`, resourceType: 'cpu', amount: cpu, unit: 'ms/request' });
  if (memory > 0) breakdown.push({ description: `Memory bloat from ${finding.category}`, resourceType: 'memory', amount: memory, unit: 'MB' });
  if (network > 0) breakdown.push({ description: `Network waste from ${finding.category}`, resourceType: 'network', amount: network, unit: 'KB/request' });

  return { cpu, memory, network, breakdown };
}

function estimateMonthlyCost(
  impact: { cpu: number; memory: number; network: number },
  requestsPerDay: number,
): number {
  const monthlyRequests = requestsPerDay * 30;
  // Rough cloud cost estimation in cents
  const cpuCost = (impact.cpu / 1000) * monthlyRequests * 0.00004 * 100; // compute-seconds
  const memoryCost = impact.memory * 0.01 * 100; // MB-months
  const networkCost = (impact.network / 1024) * monthlyRequests * 0.01 * 100; // GB transferred
  return Math.round(cpuCost + memoryCost + networkCost);
}

function gradeWaste(monthlyCostCents: number): ResourceProfile['wasteGrade'] {
  if (monthlyCostCents <= 10) return 'A';
  if (monthlyCostCents <= 50) return 'B';
  if (monthlyCostCents <= 200) return 'C';
  if (monthlyCostCents <= 500) return 'D';
  return 'F';
}
