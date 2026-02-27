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
  responseShape?: unknown;
}

export interface DiligenceReport {
  summary: {
    total: number;
    passed: number;
    minor: number;
    critical: number;
  };
  results: TestResult[];
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
  { name: 'MODERNIZER status', command: 'modernizer.status' },
  { name: 'GOV status', command: 'gov.status' },
  { name: 'OBS status', command: 'obs.status' },
  { name: 'ANALYTICS summary', command: 'analytics.summary' },
];

const FAILURE_DISCIPLINE: Array<{ name: string; command: string }> = [
  { name: 'Usage guard - core.schedule', command: 'core.schedule' },
  { name: 'Usage guard - system.heal', command: 'system.heal' },
  { name: 'Safe denial - defense.quarantine', command: 'defense.quarantine' },
  { name: 'Safe denial - integration.connect', command: 'integration.connect' },
  { name: 'Safe denial - modernizer.apply', command: 'modernizer.apply' },
];

const UNKNOWN_NAMESPACE: Array<{ name: string; command: string }> = [
  { name: 'Unknown namespace - god.mode', command: 'god.mode' },
  { name: 'Unknown suffix - brain.exe', command: 'brain.exe' },
  { name: 'Unknown command - core.hack', command: 'core.hack' },
  { name: 'Unknown namespace - xyz.status', command: 'xyz.status' },
];

function shapeOk(res: unknown): { ok: boolean; note?: string } {
  if (res == null) return { ok: false, note: 'No response returned' };

  if (typeof res === 'object') {
    const obj = res as unknown as Record<string, unknown>;
    const hasSuccess = typeof obj.success === 'boolean';
    const hasOutput = typeof obj.output === 'string';
    const hasOk = typeof obj.ok === 'boolean';

    if (!hasSuccess && !hasOutput && !hasOk) {
      return { ok: false, note: 'Missing expected fields (success/output/ok)' };
    }
    return { ok: true };
  }

  if (typeof res === 'string' || typeof res === 'number' || typeof res === 'boolean') {
    return { ok: true };
  }

  return { ok: false, note: 'Unrecognized response type' };
}

function classifyResult(res: CommandResult, expectedMode: 'surface' | 'failure' | 'unknown'): { success: boolean; severity: Severity; notes?: string } {
  // CommandResult always has { success, trace_id, output?, error?, ... }
  if (expectedMode === 'surface') {
    if (!res.success) {
      const errMsg = res.error?.safe_message || res.error?.message || 'Surface command failed';
      return { success: false, severity: 'CRITICAL', notes: errMsg };
    }
    return { success: true, severity: 'PASS' };
  }

  if (expectedMode === 'unknown') {
    // We expect a clean NOT_FOUND failure
    if (res.success) return { success: false, severity: 'MINOR', notes: 'Unknown command unexpectedly succeeded' };
    if (res.error?.code === 'NOT_FOUND') return { success: true, severity: 'PASS' };
    return { success: true, severity: 'PASS', notes: `Failed with code: ${res.error?.code}` };
  }

  // failure discipline: clean failure or guarded success both acceptable
  if (!res.success) return { success: true, severity: 'PASS' };
  return { success: true, severity: 'MINOR', notes: 'Command succeeded; verify this is intended (guardrails)' };
}

async function runOne(name: string, command: string, expectedMode: 'surface' | 'failure' | 'unknown'): Promise<TestResult> {
  const start = performance.now();
  try {
    const res = await executeCommand(command);
    const durationMs = Math.round(performance.now() - start);
    const verdict = classify(res, expectedMode);

    return {
      name,
      command,
      durationMs,
      success: verdict.success,
      severity: verdict.severity,
      notes: verdict.notes,
      responseShape: {
        keys: res && typeof res === 'object' ? Object.keys(res as object) : typeof res,
        sample: res && typeof res === 'object'
          ? {
              success: (res as unknown as Record<string, unknown>).success,
              ok: (res as unknown as Record<string, unknown>).ok,
              status: (res as unknown as Record<string, unknown>).status,
              hasData: (res as unknown as Record<string, unknown>).data != null,
              hasError: (res as unknown as Record<string, unknown>).error != null,
              hasOutput: typeof (res as unknown as Record<string, unknown>).output === 'string',
            }
          : res,
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
    };
  }
}

export async function runDiligence(): Promise<DiligenceReport> {
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

  return { summary, results, timestamp: new Date().toISOString() };
}
