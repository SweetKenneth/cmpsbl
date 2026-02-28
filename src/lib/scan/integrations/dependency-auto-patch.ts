/**
 * Dependency Vulnerability Auto-Patching (#15)
 * Extends the dependency graph with automated patch generation
 * for known vulnerable packages.
 */

import type { DependencyGraph } from '../discovery/dependency-graph';

export interface VulnerableDependency {
  name: string;
  currentVersion: string;
  vulnerabilities: Array<{
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    patchedVersion: string | null;
    cveId?: string;
  }>;
  patchAvailable: boolean;
  patchVersion: string | null;
  breakingChange: boolean;
  dependents: string[]; // packages that depend on this
}

export interface PatchPlan {
  patches: Array<{
    packageName: string;
    fromVersion: string;
    toVersion: string;
    severity: string;
    breakingChange: boolean;
    affectedDependents: string[];
    confidence: number;
  }>;
  totalPatches: number;
  breakingCount: number;
  safePatches: Array<{ packageName: string; toVersion: string }>;
  riskyPatches: Array<{ packageName: string; toVersion: string; reason: string }>;
  estimatedEffort: 'trivial' | 'minor' | 'major';
  generatedAt: string;
}

/**
 * Analyze dependency graph for vulnerabilities and generate patch plan
 */
export function generatePatchPlan(
  graph: DependencyGraph,
  knownVulnerabilities: Array<{
    packageName: string;
    affectedVersions: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    patchedVersion: string | null;
    cveId?: string;
    title: string;
  }>,
): PatchPlan {
  const vulnerableDeps = new Map<string, VulnerableDependency>();

  // Match vulnerabilities against dependency graph
  for (const vuln of knownVulnerabilities) {
    const dep = graph.direct?.find(d => d.name === vuln.packageName) ??
                graph.devDependencies?.find(d => d.name === vuln.packageName);

    if (!dep) continue;

    if (!vulnerableDeps.has(vuln.packageName)) {
      vulnerableDeps.set(vuln.packageName, {
        name: vuln.packageName,
        currentVersion: dep.version ?? 'unknown',
        vulnerabilities: [],
        patchAvailable: false,
        patchVersion: null,
        breakingChange: false,
        dependents: [],
      });
    }

    const entry = vulnerableDeps.get(vuln.packageName)!;
    entry.vulnerabilities.push({
      id: vuln.cveId ?? `vuln_${Date.now()}`,
      severity: vuln.severity,
      title: vuln.title,
      patchedVersion: vuln.patchedVersion,
      cveId: vuln.cveId,
    });

    if (vuln.patchedVersion) {
      entry.patchAvailable = true;
      entry.patchVersion = vuln.patchedVersion;
      // Simple heuristic: major version bump = breaking change
      const currentMajor = parseInt(entry.currentVersion.split('.')[0] ?? '0');
      const patchMajor = parseInt(vuln.patchedVersion.split('.')[0] ?? '0');
      if (patchMajor > currentMajor) entry.breakingChange = true;
    }
  }

  // Build patch plan
  const patches: PatchPlan['patches'] = [];
  const safePatches: PatchPlan['safePatches'] = [];
  const riskyPatches: PatchPlan['riskyPatches'] = [];

  for (const [, dep] of vulnerableDeps) {
    if (!dep.patchAvailable || !dep.patchVersion) continue;

    const maxSeverity = dep.vulnerabilities.reduce((max, v) => {
      const rank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      return (rank[v.severity] ?? 0) > (rank[max] ?? 0) ? v.severity : max;
    }, 'low');

    const patch = {
      packageName: dep.name,
      fromVersion: dep.currentVersion,
      toVersion: dep.patchVersion,
      severity: maxSeverity,
      breakingChange: dep.breakingChange,
      affectedDependents: dep.dependents,
      confidence: dep.breakingChange ? 0.5 : 0.9,
    };

    patches.push(patch);

    if (!dep.breakingChange && dep.dependents.length <= 2) {
      safePatches.push({ packageName: dep.name, toVersion: dep.patchVersion });
    } else {
      riskyPatches.push({
        packageName: dep.name,
        toVersion: dep.patchVersion,
        reason: dep.breakingChange
          ? 'Major version bump — potential breaking changes'
          : `${dep.dependents.length} dependent packages affected`,
      });
    }
  }

  // Sort: critical patches first
  patches.sort((a, b) => {
    const rank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return (rank[b.severity] ?? 0) - (rank[a.severity] ?? 0);
  });

  const breakingCount = patches.filter(p => p.breakingChange).length;
  const estimatedEffort: PatchPlan['estimatedEffort'] =
    breakingCount > 2 ? 'major' :
    breakingCount > 0 ? 'minor' : 'trivial';

  return {
    patches,
    totalPatches: patches.length,
    breakingCount,
    safePatches,
    riskyPatches,
    estimatedEffort,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate package.json patch commands
 */
export function generatePatchCommands(plan: PatchPlan): string[] {
  return plan.safePatches.map(p =>
    `bun add ${p.packageName}@${p.toVersion}`
  );
}
