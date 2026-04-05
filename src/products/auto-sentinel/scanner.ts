/**
 * AUTO-SENTINEL — Scanner Module
 * Pattern: CJ-075 Self-Audit Loop
 *
 * Runs registered scan rules against a codebase snapshot
 * and produces a list of detected issues.
 */

import type {
  ScanRule,
  ScanContext,
  DetectedIssue,
  IssueCategory,
} from './types';

// ── Rule Registry ──────────────────────────────────────────────────────

const rules = new Map<string, ScanRule>();

export function registerRule(rule: ScanRule): void {
  rules.set(rule.id, rule);
}

export function removeRule(id: string): boolean {
  return rules.delete(id);
}

export function getRegisteredRules(): ScanRule[] {
  return [...rules.values()];
}

// ── Scanner Engine ─────────────────────────────────────────────────────

export function runScan(
  context: ScanContext,
  enabledCategories: IssueCategory[],
  maxIssues: number,
): DetectedIssue[] {
  const findings: DetectedIssue[] = [];
  const categorySet = new Set(enabledCategories);

  for (const rule of rules.values()) {
    if (!categorySet.has(rule.category)) continue;
    if (findings.length >= maxIssues) break;

    try {
      const detected = rule.detect(context);
      const remaining = maxIssues - findings.length;
      findings.push(...detected.slice(0, remaining));
    } catch (err) {
      // Rule failure produces a meta-finding rather than crashing the scan
      findings.push({
        id: crypto.randomUUID(),
        ruleId: rule.id,
        category: rule.category,
        severity: 'info',
        filePath: '__scanner__',
        message: `Scan rule "${rule.name}" threw during execution`,
        evidence: err instanceof Error ? err.message : String(err),
        detectedAt: new Date().toISOString(),
      });
    }
  }

  return findings;
}

// ── Built-in Rules ─────────────────────────────────────────────────────

/**
 * Detects files that export symbols not imported anywhere in the index.
 * This is a simplified heuristic — real implementation would use
 * the full import graph from a bundler or TS compiler API.
 */
const unusedExportRule: ScanRule = {
  id: 'sentinel-unused-exports',
  name: 'Unused Exports Detector',
  category: 'unused_export',
  severity: 'low',
  description: 'Finds exported symbols that no other file imports',
  detect: (ctx: ScanContext): DetectedIssue[] => {
    const allImports = new Set<string>();
    for (const file of ctx.fileIndex) {
      if (file.imports) {
        for (const imp of file.imports) allImports.add(imp);
      }
    }

    const issues: DetectedIssue[] = [];
    for (const file of ctx.fileIndex) {
      if (!file.exports) continue;
      for (const exp of file.exports) {
        if (!allImports.has(exp)) {
          issues.push({
            id: crypto.randomUUID(),
            ruleId: 'sentinel-unused-exports',
            category: 'unused_export',
            severity: 'low',
            filePath: file.path,
            message: `Export "${exp}" is not imported by any other file`,
            evidence: `export { ${exp} }`,
            suggestedFix: `Remove unused export "${exp}" or mark as internal`,
            detectedAt: new Date().toISOString(),
          });
        }
      }
    }
    return issues;
  },
};

/**
 * Detects potential circular dependencies by checking if
 * file A imports from file B and B imports from A.
 */
const circularDependencyRule: ScanRule = {
  id: 'sentinel-circular-deps',
  name: 'Circular Dependency Detector',
  category: 'circular_dependency',
  severity: 'medium',
  description: 'Detects files that import each other creating circular references',
  detect: (ctx: ScanContext): DetectedIssue[] => {
    const importMap = new Map<string, Set<string>>();
    for (const file of ctx.fileIndex) {
      if (file.imports) {
        importMap.set(file.path, new Set(file.imports));
      }
    }

    const issues: DetectedIssue[] = [];
    const reported = new Set<string>();

    for (const [fileA, importsA] of importMap) {
      for (const depPath of importsA) {
        const importsB = importMap.get(depPath);
        if (importsB?.has(fileA)) {
          const pairKey = [fileA, depPath].sort().join('↔');
          if (!reported.has(pairKey)) {
            reported.add(pairKey);
            issues.push({
              id: crypto.randomUUID(),
              ruleId: 'sentinel-circular-deps',
              category: 'circular_dependency',
              severity: 'medium',
              filePath: fileA,
              message: `Circular dependency detected: ${fileA} ↔ ${depPath}`,
              evidence: `${fileA} imports ${depPath} and vice versa`,
              suggestedFix: 'Extract shared logic into a third module',
              detectedAt: new Date().toISOString(),
            });
          }
        }
      }
    }
    return issues;
  },
};

/**
 * Flags large files that may indicate code that needs decomposition.
 * A performance anti-pattern heuristic.
 */
const largeBundleRule: ScanRule = {
  id: 'sentinel-large-files',
  name: 'Large File Detector',
  category: 'performance_anti_pattern',
  severity: 'low',
  description: 'Flags files exceeding size thresholds that may need splitting',
  detect: (ctx: ScanContext): DetectedIssue[] => {
    const THRESHOLD_BYTES = 50_000; // 50KB
    return ctx.fileIndex
      .filter(f => f.sizeBytes > THRESHOLD_BYTES)
      .map(f => ({
        id: crypto.randomUUID(),
        ruleId: 'sentinel-large-files',
        category: 'performance_anti_pattern' as const,
        severity: 'low' as const,
        filePath: f.path,
        message: `File is ${Math.round(f.sizeBytes / 1024)}KB — consider splitting`,
        evidence: `${f.sizeBytes} bytes`,
        suggestedFix: 'Decompose into smaller, focused modules',
        detectedAt: new Date().toISOString(),
      }));
  },
};

/**
 * Detects config entries that haven't been modified recently.
 */
const staleConfigRule: ScanRule = {
  id: 'sentinel-stale-config',
  name: 'Stale Configuration Detector',
  category: 'stale_config',
  severity: 'low',
  description: 'Finds configuration files that may be outdated',
  detect: (ctx: ScanContext): DetectedIssue[] => {
    const STALE_DAYS = 90;
    const cutoff = Date.now() - (STALE_DAYS * 24 * 60 * 60 * 1000);

    return ctx.fileIndex
      .filter(f => {
        const isConfig = f.path.includes('config') || f.path.endsWith('.json') || f.path.endsWith('.toml');
        const lastMod = new Date(f.lastModified).getTime();
        return isConfig && lastMod < cutoff;
      })
      .map(f => ({
        id: crypto.randomUUID(),
        ruleId: 'sentinel-stale-config',
        category: 'stale_config' as const,
        severity: 'low' as const,
        filePath: f.path,
        message: `Config file not modified in ${STALE_DAYS}+ days`,
        evidence: `Last modified: ${f.lastModified}`,
        suggestedFix: 'Review for outdated values or deprecated settings',
        detectedAt: new Date().toISOString(),
      }));
  },
};

// ── Register built-in rules on load ────────────────────────────────────

registerRule(unusedExportRule);
registerRule(circularDependencyRule);
registerRule(largeBundleRule);
registerRule(staleConfigRule);
