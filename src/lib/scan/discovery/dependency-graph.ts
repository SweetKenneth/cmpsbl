/**
 * #3 — Dependency Graph Builder
 * Parse manifests to map the full dependency tree and cross-reference against CVE databases.
 */

export interface DependencyGraph {
  direct: DependencyNode[];
  devDependencies: DependencyNode[];
  totalDirect: number;
  totalTransitive: number;
  vulnerabilities: VulnerabilityReport[];
  outdatedCount: number;
  licenseRisks: LicenseRisk[];
  duplicates: DuplicatePackage[];
  heaviestPackages: Array<{ name: string; estimatedSizeKB: number }>;
  scanTimestamp: string;
}

export interface DependencyNode {
  name: string;
  version: string;
  isDev: boolean;
  isDirectDependency: boolean;
  lastPublished: string | null;
  license: string | null;
  deprecated: boolean;
  hasTypes: boolean;
  maintainerCount: number | null;
  weeklyDownloads: number | null;
  children: DependencyNode[];
}

export interface VulnerabilityReport {
  packageName: string;
  installedVersion: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  cveId: string | null;
  fixedIn: string | null;
  url: string | null;
  patchAvailable: boolean;
}

export interface LicenseRisk {
  packageName: string;
  license: string;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  reason: string;
}

export interface DuplicatePackage {
  name: string;
  versions: string[];
  sizeImpactKB: number;
}

// Known risky/copyleft licenses
const LICENSE_RISKS: Record<string, { level: 'low' | 'medium' | 'high'; reason: string }> = {
  'GPL-2.0': { level: 'high', reason: 'Copyleft — requires derivative works to be open-sourced' },
  'GPL-3.0': { level: 'high', reason: 'Strong copyleft — requires derivative works to be open-sourced' },
  'AGPL-3.0': { level: 'high', reason: 'Network copyleft — even SaaS use triggers disclosure' },
  'LGPL-2.1': { level: 'medium', reason: 'Weak copyleft — linking restrictions apply' },
  'LGPL-3.0': { level: 'medium', reason: 'Weak copyleft — linking restrictions apply' },
  'MPL-2.0': { level: 'low', reason: 'File-level copyleft — modified files must be shared' },
  'SSPL-1.0': { level: 'high', reason: 'Server-side copyleft — may restrict cloud deployments' },
  'BSL-1.1': { level: 'medium', reason: 'Business Source License — commercial use restrictions may apply' },
  'UNLICENSED': { level: 'high', reason: 'No license — legally cannot be used' },
};

// Common heavy packages (approximate bundle sizes in KB)
const KNOWN_HEAVY_PACKAGES: Record<string, number> = {
  'moment': 290,
  'lodash': 530,
  'three': 600,
  '@mui/material': 300,
  'antd': 800,
  'chart.js': 200,
  'recharts': 400,
  'd3': 270,
  'aws-sdk': 3000,
  'firebase': 500,
  'rxjs': 200,
  'highlight.js': 900,
  'monaco-editor': 5000,
  'pdf-lib': 400,
  'xlsx': 600,
};

/**
 * Parse a package.json manifest into a dependency graph
 */
export function parseDependencyManifest(
  packageJson: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  }
): DependencyGraph {
  const direct: DependencyNode[] = Object.entries(packageJson.dependencies || {}).map(([name, version]) => ({
    name,
    version: cleanVersion(version),
    isDev: false,
    isDirectDependency: true,
    lastPublished: null,
    license: null,
    deprecated: false,
    hasTypes: name.startsWith('@types/') || false,
    maintainerCount: null,
    weeklyDownloads: null,
    children: [],
  }));

  const devDependencies: DependencyNode[] = Object.entries(packageJson.devDependencies || {}).map(([name, version]) => ({
    name,
    version: cleanVersion(version),
    isDev: true,
    isDirectDependency: true,
    lastPublished: null,
    license: null,
    deprecated: false,
    hasTypes: name.startsWith('@types/') || false,
    maintainerCount: null,
    weeklyDownloads: null,
    children: [],
  }));

  // Detect heavy packages
  const heaviestPackages = [...direct, ...devDependencies]
    .filter(d => KNOWN_HEAVY_PACKAGES[d.name])
    .map(d => ({ name: d.name, estimatedSizeKB: KNOWN_HEAVY_PACKAGES[d.name] }))
    .sort((a, b) => b.estimatedSizeKB - a.estimatedSizeKB);

  return {
    direct,
    devDependencies,
    totalDirect: direct.length,
    totalTransitive: 0,
    vulnerabilities: [],
    outdatedCount: 0,
    licenseRisks: [],
    duplicates: [],
    heaviestPackages,
    scanTimestamp: new Date().toISOString(),
  };
}

/**
 * Enrich dependency nodes with vulnerability data from a CVE source
 */
export function enrichWithVulnerabilities(
  graph: DependencyGraph,
  advisories: Array<{
    packageName: string;
    severity: string;
    title: string;
    cveId?: string;
    fixedIn?: string;
    url?: string;
  }>
): DependencyGraph {
  const vulns: VulnerabilityReport[] = [];

  for (const advisory of advisories) {
    const pkg = [...graph.direct, ...graph.devDependencies].find(d => d.name === advisory.packageName);
    if (pkg) {
      vulns.push({
        packageName: advisory.packageName,
        installedVersion: pkg.version,
        severity: (advisory.severity as VulnerabilityReport['severity']) || 'moderate',
        title: advisory.title,
        cveId: advisory.cveId || null,
        fixedIn: advisory.fixedIn || null,
        url: advisory.url || null,
        patchAvailable: !!advisory.fixedIn,
      });
    }
  }

  return { ...graph, vulnerabilities: vulns };
}

/**
 * Check for license risks across all dependencies
 */
export function checkLicenseRisks(graph: DependencyGraph): LicenseRisk[] {
  const risks: LicenseRisk[] = [];

  for (const dep of [...graph.direct, ...graph.devDependencies]) {
    if (dep.license && LICENSE_RISKS[dep.license]) {
      const risk = LICENSE_RISKS[dep.license];
      risks.push({
        packageName: dep.name,
        license: dep.license,
        riskLevel: risk.level,
        reason: risk.reason,
      });
    }
  }

  return risks;
}

/**
 * Detect duplicate packages with different versions
 */
export function detectDuplicates(
  allDeps: Array<{ name: string; version: string }>
): DuplicatePackage[] {
  const versionMap = new Map<string, string[]>();

  for (const dep of allDeps) {
    const versions = versionMap.get(dep.name) || [];
    if (!versions.includes(dep.version)) {
      versions.push(dep.version);
    }
    versionMap.set(dep.name, versions);
  }

  return Array.from(versionMap.entries())
    .filter(([, versions]) => versions.length > 1)
    .map(([name, versions]) => ({
      name,
      versions,
      sizeImpactKB: KNOWN_HEAVY_PACKAGES[name] ? KNOWN_HEAVY_PACKAGES[name] * (versions.length - 1) : 0,
    }));
}

function cleanVersion(version: string): string {
  return version.replace(/^[\^~>=<]+/, '').trim();
}
