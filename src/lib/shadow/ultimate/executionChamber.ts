/**
 * SHADOW Ultimate — Shadow Execution Chamber
 * Fully isolated execution environment that mirrors production state.
 * Supports concurrent shadow sessions with resource budgets.
 */

export interface ShadowSession {
  id: string;
  proposalId: string;
  status: 'initializing' | 'running' | 'completed' | 'aborted' | 'leaked';
  isolationLevel: 'strict' | 'relaxed';
  resourceBudget: { maxMemoryMB: number; maxCpuMs: number; maxDurationMs: number };
  resourceUsed: { memoryMB: number; cpuMs: number; durationMs: number };
  inputCount: number;
  outputCount: number;
  startedAt: number;
  completedAt?: number;
  abortReason?: string;
}

export interface ChamberStats {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  abortedSessions: number;
  leakedSessions: number;
  avgDuration: number;
}

const MAX_SESSIONS = 500;
const MAX_CONCURRENT = 5;
const DEFAULT_BUDGET = { maxMemoryMB: 256, maxCpuMs: 30_000, maxDurationMs: 60_000 };

const sessions = new Map<string, ShadowSession>();

export function createSession(
  proposalId: string,
  isolationLevel: ShadowSession['isolationLevel'] = 'strict',
  budget?: Partial<ShadowSession['resourceBudget']>
): ShadowSession | null {
  const active = [...sessions.values()].filter(s => s.status === 'running');
  if (active.length >= MAX_CONCURRENT) return null;

  const session: ShadowSession = {
    id: `ss-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    proposalId, status: 'initializing', isolationLevel,
    resourceBudget: { ...DEFAULT_BUDGET, ...budget },
    resourceUsed: { memoryMB: 0, cpuMs: 0, durationMs: 0 },
    inputCount: 0, outputCount: 0, startedAt: Date.now(),
  };

  if (sessions.size >= MAX_SESSIONS) {
    const oldest = [...sessions.values()]
      .filter(s => s.status !== 'running')
      .sort((a, b) => a.startedAt - b.startedAt)[0];
    if (oldest) sessions.delete(oldest.id);
  }

  sessions.set(session.id, session);
  return session;
}

export function startSession(sessionId: string): boolean {
  const s = sessions.get(sessionId);
  if (!s || s.status !== 'initializing') return false;
  s.status = 'running';
  return true;
}

export function recordExecution(sessionId: string, memMB: number, cpuMs: number, inputs: number, outputs: number): boolean {
  const s = sessions.get(sessionId);
  if (!s || s.status !== 'running') return false;

  s.resourceUsed.memoryMB += memMB;
  s.resourceUsed.cpuMs += cpuMs;
  s.resourceUsed.durationMs = Date.now() - s.startedAt;
  s.inputCount += inputs;
  s.outputCount += outputs;

  // Budget enforcement
  if (s.resourceUsed.memoryMB > s.resourceBudget.maxMemoryMB ||
      s.resourceUsed.cpuMs > s.resourceBudget.maxCpuMs ||
      s.resourceUsed.durationMs > s.resourceBudget.maxDurationMs) {
    s.status = 'aborted';
    s.abortReason = 'resource_budget_exceeded';
    s.completedAt = Date.now();
    return false;
  }
  return true;
}

export function completeSession(sessionId: string): ShadowSession | null {
  const s = sessions.get(sessionId);
  if (!s || s.status !== 'running') return null;
  s.status = 'completed';
  s.completedAt = Date.now();
  s.resourceUsed.durationMs = s.completedAt - s.startedAt;
  return s;
}

export function abortSession(sessionId: string, reason: string): void {
  const s = sessions.get(sessionId);
  if (!s || s.status !== 'running') return;
  s.status = 'aborted';
  s.abortReason = reason;
  s.completedAt = Date.now();
}

export function markLeaked(sessionId: string): void {
  const s = sessions.get(sessionId);
  if (s) { s.status = 'leaked'; s.completedAt = Date.now(); }
}

export function getSession(sessionId: string): ShadowSession | null {
  return sessions.get(sessionId) ?? null;
}

export function getChamberStats(): ChamberStats {
  const all = [...sessions.values()];
  const completed = all.filter(s => s.status === 'completed');
  return {
    totalSessions: all.length,
    activeSessions: all.filter(s => s.status === 'running').length,
    completedSessions: completed.length,
    abortedSessions: all.filter(s => s.status === 'aborted').length,
    leakedSessions: all.filter(s => s.status === 'leaked').length,
    avgDuration: completed.length > 0 ? completed.reduce((s, c) => s + c.resourceUsed.durationMs, 0) / completed.length : 0,
  };
}

export function resetChamberState(): void { sessions.clear(); }
