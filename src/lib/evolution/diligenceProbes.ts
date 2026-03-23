/**
 * Diligence Probe Runner — EVOLUTION v9.0.0
 * Pre-promotion validation probes as hard gates.
 */

// --- Types ---

export type ProbeId =
  | 'type_safety'
  | 'import_integrity'
  | 'circular_deps'
  | 'performance_regression'
  | 'naming_conventions'
  | 'dead_code'
  | 'config_drift'
  | 'boundary_contracts';

export interface ProbeConfig {
  id: ProbeId;
  enabled: boolean;
  blocking: boolean; // hard gate if true
  timeout: number;
}

export interface ProbeResult {
  probeId: ProbeId;
  passed: boolean;
  blocking: boolean;
  findings: string[];
  score: number; // 0-100
  durationMs: number;
  timestamp: number;
}

export interface ProbeRunResult {
  proposalId: string;
  probes: ProbeResult[];
  allPassed: boolean;
  hardGateFailed: boolean;
  failedBlockers: ProbeId[];
  overallScore: number;
  timestamp: number;
}

type ProbeFn = (context: ProbeContext) => ProbeResult;

export interface ProbeContext {
  proposalId: string;
  changedFiles: string[];
  changedModules: string[];
  metadata: Record<string, unknown>;
}

// --- Constants ---

const DEFAULT_PROBES: ProbeConfig[] = [
  { id: 'type_safety', enabled: true, blocking: true, timeout: 5000 },
  { id: 'import_integrity', enabled: true, blocking: true, timeout: 3000 },
  { id: 'circular_deps', enabled: true, blocking: true, timeout: 3000 },
  { id: 'performance_regression', enabled: true, blocking: false, timeout: 5000 },
  { id: 'naming_conventions', enabled: true, blocking: false, timeout: 2000 },
  { id: 'dead_code', enabled: true, blocking: false, timeout: 3000 },
  { id: 'config_drift', enabled: true, blocking: true, timeout: 2000 },
  { id: 'boundary_contracts', enabled: true, blocking: true, timeout: 3000 },
];

const MAX_RESULTS = 200;

// --- State ---

let probeConfigs = DEFAULT_PROBES.map(p => ({ ...p }));
const runResults: ProbeRunResult[] = [];
const customProbes: Map<ProbeId, ProbeFn> = new Map();

// --- Built-in Probes ---

function defaultProbe(config: ProbeConfig, _context: ProbeContext): ProbeResult {
  const start = Date.now();
  return {
    probeId: config.id,
    passed: true,
    blocking: config.blocking,
    findings: [],
    score: 100,
    durationMs: Date.now() - start,
    timestamp: Date.now(),
  };
}

// --- Core ---

export function registerProbe(probeId: ProbeId, fn: ProbeFn): void {
  customProbes.set(probeId, fn);
}

export function setProbeConfig(probeId: ProbeId, updates: Partial<Pick<ProbeConfig, 'enabled' | 'blocking' | 'timeout'>>): void {
  const config = probeConfigs.find(p => p.id === probeId);
  if (config) Object.assign(config, updates);
}

export function runProbes(context: ProbeContext): ProbeRunResult {
  const enabledProbes = probeConfigs.filter(p => p.enabled);
  const probes: ProbeResult[] = [];
  const failedBlockers: ProbeId[] = [];

  for (const config of enabledProbes) {
    const customFn = customProbes.get(config.id);
    const result = customFn ? customFn(context) : defaultProbe(config, context);
    probes.push(result);

    if (!result.passed && result.blocking) {
      failedBlockers.push(config.id);
    }
  }

  const overallScore = probes.length > 0
    ? Math.round(probes.reduce((sum, p) => sum + p.score, 0) / probes.length)
    : 100;

  const runResult: ProbeRunResult = {
    proposalId: context.proposalId,
    probes,
    allPassed: probes.every(p => p.passed),
    hardGateFailed: failedBlockers.length > 0,
    failedBlockers,
    overallScore,
    timestamp: Date.now(),
  };

  runResults.push(runResult);
  if (runResults.length > MAX_RESULTS) runResults.splice(0, runResults.length - MAX_RESULTS);

  return runResult;
}

export function getProbeConfigs(): ProbeConfig[] {
  return probeConfigs.map(p => ({ ...p }));
}

export function getRunResults(count: number = 50): ProbeRunResult[] {
  return runResults.slice(-count);
}

export function getProbePassRate(probeId: ProbeId): number {
  const relevant = runResults.flatMap(r => r.probes).filter(p => p.probeId === probeId);
  if (relevant.length === 0) return 0;
  return Math.round((relevant.filter(p => p.passed).length / relevant.length) * 100) / 100;
}

export function resetProbeConfigs(): void {
  probeConfigs = DEFAULT_PROBES.map(p => ({ ...p }));
}

export function clearProbeState(): void {
  runResults.length = 0;
  customProbes.clear();
  resetProbeConfigs();
}
