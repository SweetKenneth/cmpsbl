/**
 * DEP-GUARDIAN — Scanner Module
 * Pattern: CJ-067 Technical Debt Quantifier (dependency category)
 *
 * Scans the dependency tree for vulnerabilities, staleness,
 * license violations, deprecations, and bloat.
 * Extension point: registerRule() for custom detection rules.
 */

import type {
  DepScanRule,
  DependencyContext,
  DetectedDepIssue,
  DepCategory,
} from './types';

// ── Rule Registry ──────────────────────────────────────────────────────

const rules = new Map<string, DepScanRule>();

export function registerRule(rule: DepScanRule): void {
  rules.set(rule.id, rule);
}

export function removeRule(id: string): boolean {
  return rules.delete(id);
}

export function getRegisteredRules(): DepScanRule[] {
  return [...rules.values()];
}

// ── Built-in Rules ─────────────────────────────────────────────────────

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function semverMajor(v: string): number {
  const match = v.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/** DEFENSE: detect known vulnerability patterns by version staleness */
registerRule({
  id: 'staleness-check',
  name: 'Stale Dependency Detector',
  category: 'staleness',
  severity: 'medium',
  description: 'Flags dependencies not updated in 180+ days',
  detect(context: DependencyContext): DetectedDepIssue[] {
    return context.dependencies
      .filter(dep => daysSince(dep.lastUpdated) > 180)
      .map(dep => ({
        id: crypto.randomUUID(),
        ruleId: 'staleness-check',
        category: 'staleness' as const,
        severity: daysSince(dep.lastUpdated) > 365 ? 'high' as const : 'medium' as const,
        depName: dep.name,
        message: `${dep.name}@${dep.currentVersion} last updated ${daysSince(dep.lastUpdated)} days ago`,
        detectedAt: new Date().toISOString(),
        metadata: { daysStaleness: daysSince(dep.lastUpdated) },
      }));
  },
});

/** SOVEREIGN: license compliance scanning */
registerRule({
  id: 'license-compliance',
  name: 'License Compliance Scanner',
  category: 'license_violation',
  severity: 'high',
  description: 'Flags dependencies with blocked or incompatible licenses',
  detect(context: DependencyContext): DetectedDepIssue[] {
    return context.dependencies
      .filter(dep =>
        context.blockedLicenses.includes(dep.license) ||
        dep.licenseRisk === 'proprietary' ||
        dep.licenseRisk === 'unknown'
      )
      .map(dep => ({
        id: crypto.randomUUID(),
        ruleId: 'license-compliance',
        category: 'license_violation' as const,
        severity: dep.licenseRisk === 'unknown' ? 'medium' as const : 'high' as const,
        depName: dep.name,
        message: `${dep.name} uses ${dep.license} license (risk: ${dep.licenseRisk})`,
        detectedAt: new Date().toISOString(),
        metadata: { license: dep.license, risk: dep.licenseRisk },
      }));
  },
});

/** EVOLUTION: detect major version gaps indicating breaking changes */
registerRule({
  id: 'breaking-change-detector',
  name: 'Breaking Change Detector',
  category: 'breaking_change',
  severity: 'high',
  description: 'Flags dependencies with major version gaps',
  detect(context: DependencyContext): DetectedDepIssue[] {
    return context.dependencies
      .filter(dep => {
        const currentMajor = semverMajor(dep.currentVersion);
        const latestMajor = semverMajor(dep.latestVersion);
        return latestMajor > currentMajor;
      })
      .map(dep => ({
        id: crypto.randomUUID(),
        ruleId: 'breaking-change-detector',
        category: 'breaking_change' as const,
        severity: 'high' as const,
        depName: dep.name,
        message: `${dep.name} has major upgrade: ${dep.currentVersion} → ${dep.latestVersion}`,
        detectedAt: new Date().toISOString(),
        metadata: {
          currentVersion: dep.currentVersion,
          latestVersion: dep.latestVersion,
          majorGap: semverMajor(dep.latestVersion) - semverMajor(dep.currentVersion),
        },
      }));
  },
});

/** DEFENSE: detect duplicate packages (same name, different versions in tree) */
registerRule({
  id: 'duplicate-detector',
  name: 'Duplicate Dependency Detector',
  category: 'duplicate',
  severity: 'low',
  description: 'Flags duplicate packages that bloat the dependency tree',
  detect(context: DependencyContext): DetectedDepIssue[] {
    const seen = new Map<string, DependencyContext['dependencies'][0]>();
    const dupes: DetectedDepIssue[] = [];

    for (const dep of context.dependencies) {
      const existing = seen.get(dep.name);
      if (existing && existing.currentVersion !== dep.currentVersion) {
        dupes.push({
          id: crypto.randomUUID(),
          ruleId: 'duplicate-detector',
          category: 'duplicate',
          severity: 'low',
          depName: dep.name,
          message: `${dep.name} has multiple versions: ${existing.currentVersion}, ${dep.currentVersion}`,
          detectedAt: new Date().toISOString(),
          metadata: { versions: [existing.currentVersion, dep.currentVersion] },
        });
      }
      seen.set(dep.name, dep);
    }

    return dupes;
  },
});

/** Size bloat detection */
registerRule({
  id: 'size-bloat',
  name: 'Size Bloat Detector',
  category: 'size_bloat',
  severity: 'low',
  description: 'Flags oversized dependencies (>5MB)',
  detect(context: DependencyContext): DetectedDepIssue[] {
    const SIZE_THRESHOLD = 5 * 1024 * 1024;
    return context.dependencies
      .filter(dep => dep.sizeBytes > SIZE_THRESHOLD)
      .map(dep => ({
        id: crypto.randomUUID(),
        ruleId: 'size-bloat',
        category: 'size_bloat' as const,
        severity: dep.sizeBytes > 20 * 1024 * 1024 ? 'medium' as const : 'low' as const,
        depName: dep.name,
        message: `${dep.name} is ${(dep.sizeBytes / 1024 / 1024).toFixed(1)}MB`,
        detectedAt: new Date().toISOString(),
        metadata: { sizeBytes: dep.sizeBytes },
      }));
  },
});

// ── Scan Executor ──────────────────────────────────────────────────────

export function runScan(
  context: DependencyContext,
  enabledCategories: DepCategory[],
  maxIssues: number,
): DetectedDepIssue[] {
  const issues: DetectedDepIssue[] = [];

  for (const rule of rules.values()) {
    if (!enabledCategories.includes(rule.category)) continue;
    try {
      const detected = rule.detect(context);
      issues.push(...detected);
    } catch {
      // Graceful degradation: skip failed rules, do not crash the scan
    }
    if (issues.length >= maxIssues) break;
  }

  return issues.slice(0, maxIssues);
}
