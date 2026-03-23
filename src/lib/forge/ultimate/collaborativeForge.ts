/**
 * FORGE Ultimate #7 — Collaborative Forge (Multi-Agent Smithing)
 * Multiple agents contribute to a single blueprint.
 * Contribution tracking, conflict resolution, merge strategies.
 */

// ── Types ──

export type MergeStrategy = 'last_write_wins' | 'priority_based' | 'consensus';

export interface ForgeContribution {
  id: string;
  sessionId: string;
  agentId: string;
  component: string;         // Which section was modified
  changeType: 'add' | 'modify' | 'remove';
  content: string;
  priority: number;          // Higher = more authoritative
  timestamp: number;
}

export interface ForgeSession {
  id: string;
  blueprintId: string;
  agents: string[];
  contributions: ForgeContribution[];
  mergeStrategy: MergeStrategy;
  conflicts: ForgeConflict[];
  status: 'active' | 'merging' | 'completed' | 'abandoned';
  createdAt: number;
  completedAt: number | null;
}

export interface ForgeConflict {
  component: string;
  contributionA: string;
  contributionB: string;
  resolution: 'auto_resolved' | 'pending' | 'manual';
  resolvedBy?: string;
}

// ── State ──

const sessions = new Map<string, ForgeSession>();
let idCounter = 0;
let contribCounter = 0;
let totalConflicts = 0;
let totalResolved = 0;

// ── Core ──

export function createSession(blueprintId: string, mergeStrategy: MergeStrategy = 'priority_based'): ForgeSession {
  const session: ForgeSession = {
    id: `fsess-${++idCounter}`,
    blueprintId,
    agents: [],
    contributions: [],
    mergeStrategy,
    conflicts: [],
    status: 'active',
    createdAt: Date.now(),
    completedAt: null,
  };
  sessions.set(session.id, session);
  return session;
}

export function joinSession(sessionId: string, agentId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session || session.status !== 'active') return false;
  if (!session.agents.includes(agentId)) session.agents.push(agentId);
  return true;
}

export function contribute(sessionId: string, agentId: string, component: string, changeType: ForgeContribution['changeType'], content: string, priority: number = 50): ForgeContribution | null {
  const session = sessions.get(sessionId);
  if (!session || session.status !== 'active') return null;
  if (!session.agents.includes(agentId)) return null;

  const contrib: ForgeContribution = {
    id: `fc-${++contribCounter}`,
    sessionId, agentId, component, changeType, content, priority,
    timestamp: Date.now(),
  };

  // Check for conflicts (same component modified by different agents)
  const existing = session.contributions.filter(c => c.component === component && c.agentId !== agentId);
  if (existing.length > 0) {
    const conflict: ForgeConflict = {
      component,
      contributionA: existing[existing.length - 1].id,
      contributionB: contrib.id,
      resolution: 'pending',
    };

    // Auto-resolve based on merge strategy
    if (session.mergeStrategy === 'last_write_wins') {
      conflict.resolution = 'auto_resolved';
      conflict.resolvedBy = 'system:last_write_wins';
    } else if (session.mergeStrategy === 'priority_based' && contrib.priority !== existing[existing.length - 1].priority) {
      conflict.resolution = 'auto_resolved';
      conflict.resolvedBy = 'system:priority_based';
    }

    session.conflicts.push(conflict);
    totalConflicts++;
    if (conflict.resolution === 'auto_resolved') totalResolved++;
  }

  session.contributions.push(contrib);
  return contrib;
}

export function resolveConflict(sessionId: string, component: string, winnerId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;
  const conflict = session.conflicts.find(c => c.component === component && c.resolution === 'pending');
  if (!conflict) return false;
  conflict.resolution = 'manual';
  conflict.resolvedBy = winnerId;
  totalResolved++;
  return true;
}

export function completeSession(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session || session.status !== 'active') return false;
  const pendingConflicts = session.conflicts.filter(c => c.resolution === 'pending');
  if (pendingConflicts.length > 0) return false; // Must resolve all conflicts
  session.status = 'completed';
  session.completedAt = Date.now();
  return true;
}

export function getSession(id: string): ForgeSession | undefined { return sessions.get(id); }

export function getCollaborationStats(): {
  totalSessions: number; activeSessions: number; totalContributions: number;
  totalConflicts: number; conflictResolutionRate: number; avgAgentsPerSession: number;
} {
  const all = Array.from(sessions.values());
  const totalContribs = all.reduce((s, sess) => s + sess.contributions.length, 0);
  return {
    totalSessions: all.length,
    activeSessions: all.filter(s => s.status === 'active').length,
    totalContributions: totalContribs,
    totalConflicts,
    conflictResolutionRate: totalConflicts > 0 ? Math.round(totalResolved / totalConflicts * 1000) / 1000 : 1,
    avgAgentsPerSession: all.length > 0 ? Math.round(all.reduce((s, sess) => s + sess.agents.length, 0) / all.length * 10) / 10 : 0,
  };
}

export function resetCollaborationState(): void { sessions.clear(); idCounter = 0; contribCounter = 0; totalConflicts = 0; totalResolved = 0; }
