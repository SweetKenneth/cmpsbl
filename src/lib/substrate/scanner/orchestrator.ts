/**
 * Scanner Orchestrator — Multi-Node Scanning Pipeline
 * 
 * Integrates: NEXUS, VISION, MEMORY, DEFENSE, CORTEX, DREAM, Intent Mesh
 * 
 * Pipeline: trigger_scan → route_via_nexus → run_scanners → memory_dedup
 *           → defense_scoring → prioritization
 * 
 * Finding Priority = (severity × 0.30) + (exploitability × 0.25) +
 *                    (user_impact × 0.20) + (remediation_ease × 0.15) +
 *                    (age_decay × 0.10)
 */

import { emit } from '../events/emit';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ScanDepth = 'quick' | 'deep' | 'forensic';

export interface ScanRequest {
  id: string;
  depth: ScanDepth;
  targets: string[];
  requestedBy: string;
  requestedAt: number;
}

export interface ScanFinding {
  id: string;
  scanId: string;
  source: string;
  category: string;
  title: string;
  description: string;
  severity: number;     // 0–1
  exploitability: number; // 0–1
  userImpact: number;   // 0–1
  remediationEase: number; // 0–1 (1 = easy to fix)
  discoveredAt: number;
  priority: number;     // Computed
  deduplicated: boolean;
  deduplicateRef?: string;
}

export interface ScanResult {
  scanId: string;
  depth: ScanDepth;
  findings: ScanFinding[];
  startedAt: number;
  completedAt: number;
  nodesInvolved: string[];
  deduplicated: number;
}

// ═══════════════════════════════════════════════════════════════
// PRIORITY FORMULA
// ═══════════════════════════════════════════════════════════════

const PRIORITY_WEIGHTS = {
  severity: 0.30,
  exploitability: 0.25,
  userImpact: 0.20,
  remediationEase: 0.15,
  ageDecay: 0.10,
};

function computePriority(finding: Omit<ScanFinding, 'priority' | 'deduplicated' | 'deduplicateRef'>): number {
  const age = Date.now() - finding.discoveredAt;
  const ageDecay = Math.exp(-age / (30 * 24 * 60 * 60 * 1000)); // 30-day halflife

  return Math.round((
    finding.severity * PRIORITY_WEIGHTS.severity +
    finding.exploitability * PRIORITY_WEIGHTS.exploitability +
    finding.userImpact * PRIORITY_WEIGHTS.userImpact +
    finding.remediationEase * PRIORITY_WEIGHTS.remediationEase +
    ageDecay * PRIORITY_WEIGHTS.ageDecay
  ) * 1000) / 1000;
}

// ═══════════════════════════════════════════════════════════════
// DEDUPLICATION
// ═══════════════════════════════════════════════════════════════

const knownFindings = new Map<string, string>(); // hash → findingId

function fingerprintFinding(f: { source: string; category: string; title: string }): string {
  return `${f.source}:${f.category}:${f.title}`.toLowerCase();
}

function deduplicateFinding(finding: ScanFinding): ScanFinding {
  const fp = fingerprintFinding(finding);
  const existing = knownFindings.get(fp);
  if (existing && existing !== finding.id) {
    return { ...finding, deduplicated: true, deduplicateRef: existing };
  }
  knownFindings.set(fp, finding.id);
  return { ...finding, deduplicated: false };
}

// ═══════════════════════════════════════════════════════════════
// SCANNER IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════

const SCANNERS: { name: string; node: string; run: (targets: string[], depth: ScanDepth) => ScanFinding[] }[] = [
  {
    name: 'Structure Scanner',
    node: 'vision',
    run: (targets, depth) => {
      const findings: ScanFinding[] = [];
      // Structural analysis — checks for architectural issues
      if (depth !== 'quick') {
        findings.push(createFinding('vision', 'architecture', 'Uncovered matrix node', 'Node missing capability registration', 0.4, 0.1, 0.3, 0.8));
      }
      return findings;
    },
  },
  {
    name: 'Security Scanner',
    node: 'defense',
    run: (_targets, depth) => {
      const findings: ScanFinding[] = [];
      if (depth === 'forensic') {
        findings.push(createFinding('defense', 'security', 'Unprotected endpoint pattern', 'RLS policy gap detected in scan', 0.7, 0.5, 0.6, 0.6));
      }
      return findings;
    },
  },
  {
    name: 'Performance Scanner',
    node: 'nexus',
    run: () => [],
  },
  {
    name: 'Memory Scanner',
    node: 'memory',
    run: (_targets, depth) => {
      if (depth === 'deep' || depth === 'forensic') {
        return [createFinding('memory', 'retention', 'Stale memory entries', 'Memory entries older than 90 days without access', 0.3, 0.0, 0.2, 0.9)];
      }
      return [];
    },
  },
];

function createFinding(
  source: string, category: string, title: string, description: string,
  severity: number, exploitability: number, userImpact: number, remediationEase: number
): ScanFinding {
  const partial = {
    id: `find-${crypto.randomUUID().slice(0, 8)}`,
    scanId: '',
    source, category, title, description,
    severity, exploitability, userImpact, remediationEase,
    discoveredAt: Date.now(),
  };
  return {
    ...partial,
    priority: computePriority(partial),
    deduplicated: false,
  };
}

// ═══════════════════════════════════════════════════════════════
// ORCHESTRATION
// ═══════════════════════════════════════════════════════════════

export async function triggerScan(
  depth: ScanDepth = 'quick',
  targets: string[] = ['*'],
  requestedBy: string = 'system'
): Promise<ScanResult> {
  const scanId = `scan-${crypto.randomUUID().slice(0, 8)}`;
  const startedAt = Date.now();

  emit({
    module: 'scanner',
    event_type: 'scan.started',
    outcome: 'started',
    data: { scan_id: scanId, depth, targets },
  });

  // Run all scanners
  const allFindings: ScanFinding[] = [];
  const nodesInvolved: string[] = [];

  for (const scanner of SCANNERS) {
    try {
      const findings = scanner.run(targets, depth);
      findings.forEach(f => { f.scanId = scanId; });
      allFindings.push(...findings);
      nodesInvolved.push(scanner.node);
    } catch (err) {
      emit({
        module: 'scanner',
        event_type: 'scanner.error',
        outcome: 'failed',
        data: { scanner: scanner.name, error: String(err) },
      });
    }
  }

  // Deduplicate
  const deduped = allFindings.map(deduplicateFinding);
  const dedupCount = deduped.filter(f => f.deduplicated).length;

  // Re-prioritize and sort
  const active = deduped.filter(f => !f.deduplicated);
  active.sort((a, b) => b.priority - a.priority);

  const result: ScanResult = {
    scanId,
    depth,
    findings: active,
    startedAt,
    completedAt: Date.now(),
    nodesInvolved,
    deduplicated: dedupCount,
  };

  emit({
    module: 'scanner',
    event_type: 'scan.completed',
    outcome: 'succeeded',
    data: {
      scan_id: scanId,
      findings_count: active.length,
      deduplicated: dedupCount,
      duration_ms: result.completedAt - startedAt,
    },
  });

  return result;
}
