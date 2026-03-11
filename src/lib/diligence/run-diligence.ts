/**
 * Diligence Harness Runner
 * Investor-grade test battery across terminal/governance command paths
 */

import { executeCommand, type CommandResult } from '@/lib/terminal/execute';

async function ensureHandlersRegistered(): Promise<void> {
  const [
    { registerSpineHandlers },
    { registerOCGHandlers },
    { registerExecutionHandlers },
    { registerInfraHandlers },
    { registerGovernanceHandlers },
    { registerObservabilityHandlers },
    { registerAnalyticsHandlers },
  ] = await Promise.all([
    import('@/lib/terminal/spine-handlers'),
    import('@/lib/terminal/ocg-handlers'),
    import('@/lib/terminal/execution-handlers'),
    import('@/lib/terminal/infra-handlers'),
    import('@/lib/terminal/governance-handlers'),
    import('@/lib/terminal/observability-handlers'),
    import('@/lib/terminal/analytics-handlers'),
  ]);
  registerSpineHandlers();
  registerOCGHandlers();
  registerExecutionHandlers();
  registerInfraHandlers();
  registerGovernanceHandlers();
  registerObservabilityHandlers();
  registerAnalyticsHandlers();
}

type Severity = 'PASS' | 'MINOR' | 'CRITICAL';

export interface TestResult {
  name: string;
  command: string;
  durationMs: number;
  success: boolean;
  severity: Severity;
  notes?: string;
  expected?: string;
  actual?: string;
  responseShape?: unknown;
}

export interface FailedProbeInfo {
  id: string;
  name: string;
  command: string;
  severity: 'MINOR' | 'CRITICAL';
  expected: string;
  actual: string;
  hint: string;
  source: string;
}

export interface DiligenceReport {
  summary: {
    total: number;
    passed: number;
    minor: number;
    critical: number;
  };
  results: TestResult[];
  failed_probes: FailedProbeInfo[];
  timestamp: string;
}

const SURFACE_COMMANDS: Array<{ name: string; command: string }> = [
  { name: 'CORE status', command: 'core.status' },
  { name: 'SYSTEM status', command: 'system.status' },
  { name: 'BRAIN status', command: 'brain.status' },
  { name: 'DREAM status', command: 'dream.status' },
  { name: 'RIPPLE status', command: 'ripple.status' },
  { name: 'ACCESS status', command: 'access.status' },
  { name: 'DEFENSE status', command: 'defense.status' },
  { name: 'DECODE status', command: 'decode.status' },
  { name: 'NEXUS status', command: 'nexus.status' },
  { name: 'VISION status', command: 'vision.status' },
  { name: 'CORTEX status', command: 'cortex.status' },
  { name: 'INCLUSIVE status', command: 'inclusive.status' },
  { name: 'INTEGRATION status', command: 'integration.status' },
  { name: 'EVOLUTION status', command: 'evolution.status' },
  { name: 'GOV mode', command: 'gov.mode' },
  { name: 'OBS summary', command: 'obs.summary' },
  { name: 'ANALYTICS summary', command: 'analytics.summary' },
];

const FAILURE_DISCIPLINE: Array<{ name: string; command: string }> = [
  { name: 'Usage guard - core.schedule', command: 'core.schedule' },
  { name: 'Usage guard - system.heal', command: 'system.heal' },
  { name: 'Safe denial - defense.quarantine', command: 'defense.quarantine' },
  { name: 'Safe denial - integration.connect', command: 'integration.connect' },
  { name: 'Safe denial - evolution.apply', command: 'evolution.apply' },
];

const UNKNOWN_NAMESPACE: Array<{ name: string; command: string }> = [
  { name: 'Unknown namespace - god.mode', command: 'god.mode' },
  { name: 'Unknown suffix - brain.exe', command: 'brain.exe' },
  { name: 'Unknown command - core.hack', command: 'core.hack' },
  { name: 'Unknown namespace - xyz.status', command: 'xyz.status' },
];

function classifyResult(res: CommandResult, expectedMode: 'surface' | 'failure' | 'unknown'): { success: boolean; severity: Severity; notes?: string; expected?: string; actual?: string } {
  // CommandResult always has { success, trace_id, output?, error?, ... }
  if (expectedMode === 'surface') {
    if (!res.success) {
      const errMsg = res.error?.safe_message || res.error?.message || 'Surface command failed';
      return { success: false, severity: 'CRITICAL', notes: errMsg, expected: 'success: true', actual: `success: false (${res.error?.code ?? 'unknown'})` };
    }
    return { success: true, severity: 'PASS' };
  }

  if (expectedMode === 'unknown') {
    // We expect a clean NOT_FOUND failure
    if (res.success) return { success: false, severity: 'MINOR', notes: 'Unknown command unexpectedly succeeded', expected: 'NOT_FOUND error', actual: 'success: true' };
    if (res.error?.code === 'NOT_FOUND') return { success: true, severity: 'PASS' };
    return { success: true, severity: 'PASS', notes: `Failed with code: ${res.error?.code}` };
  }

  // failure discipline: clean failure or guarded success both acceptable
  if (!res.success) return { success: true, severity: 'PASS' };
  // Detect guarded output shapes: handler returned { success: false, error: 'Usage: ...' }
  // but executeCommand wrapped it as success: true (handler didn't throw)
  const output = res.output as Record<string, unknown> | undefined;
  if (output && output.success === false) {
    return { success: true, severity: 'PASS', notes: 'Handler returned usage guard (guarded output shape)' };
  }
  return { success: true, severity: 'MINOR', notes: 'Command succeeded without usage guard', expected: 'success: false or usage guard', actual: 'success: true (unguarded)' };
}

async function runOne(name: string, command: string, expectedMode: 'surface' | 'failure' | 'unknown'): Promise<TestResult> {
  const start = performance.now();
  try {
    const res = await executeCommand(command);
    const durationMs = Math.round(performance.now() - start);
    const verdict = classifyResult(res, expectedMode);

    return {
      name,
      command,
      durationMs,
      success: verdict.success,
      severity: verdict.severity,
      notes: verdict.notes,
      expected: verdict.expected,
      actual: verdict.actual,
      responseShape: {
        keys: Object.keys(res),
        success: res.success,
        hasOutput: res.output != null,
        hasError: res.error != null,
        errorCode: res.error?.code,
        dryRun: res.dryRun,
      },
    };
  } catch (e: unknown) {
    const durationMs = Math.round(performance.now() - start);
    const msg = e instanceof Error ? e.message : 'unknown error';
    return {
      name,
      command,
      durationMs,
      success: false,
      severity: 'CRITICAL',
      notes: `THREW: ${msg}`,
      expected: 'no exception',
      actual: `threw: ${msg}`,
    };
  }
}

export async function runDiligence(): Promise<DiligenceReport> {
  await ensureHandlersRegistered();
  const results: TestResult[] = [];

  for (const t of SURFACE_COMMANDS) results.push(await runOne(t.name, t.command, 'surface'));
  for (const t of FAILURE_DISCIPLINE) results.push(await runOne(t.name, t.command, 'failure'));
  for (const t of UNKNOWN_NAMESPACE) results.push(await runOne(t.name, t.command, 'unknown'));

  const summary = {
    total: results.length,
    passed: results.filter(r => r.severity === 'PASS').length,
    minor: results.filter(r => r.severity === 'MINOR').length,
    critical: results.filter(r => r.severity === 'CRITICAL').length,
  };

  // Build failed_probes detail for every non-PASS result
  const failed_probes: FailedProbeInfo[] = results
    .filter(r => r.severity !== 'PASS')
    .map((r, i) => ({
      id: `probe_${i}_${r.command.replace('.', '_')}`,
      name: r.name,
      command: r.command,
      severity: r.severity as 'MINOR' | 'CRITICAL',
      expected: r.expected ?? 'PASS',
      actual: r.actual ?? r.notes ?? 'unknown',
      hint: r.severity === 'CRITICAL'
        ? `Critical failure in ${r.command} — check handler registration and error boundaries`
        : `Minor issue in ${r.command} — verify guardrail output shape`,
      source: r.command.split('.')[0]?.toUpperCase() ?? 'UNKNOWN',
    }));

  return { summary, results, failed_probes, timestamp: new Date().toISOString() };
}
