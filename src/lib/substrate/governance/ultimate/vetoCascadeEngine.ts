/**
 * GOVERNANCE Ultimate — System 3: Veto Cascade Engine
 * 
 * Cascading veto propagation across dependent operations,
 * escalation priority scoring, and veto appeal process.
 * 
 * @module governance/ultimate/vetoCascadeEngine
 */

// ── Types ────────────────────────────────────────────────────────

export type VetoCascadeStatus = 'active' | 'appealed' | 'overturned' | 'confirmed';

export interface CascadeVeto {
  id: string;
  operationId: string;
  reason: string;
  vetoedBy: string;
  severity: number;             // 0-1
  affectedModules: string[];
  escalationPriority: number;   // Computed
  cascadedFrom: string | null;  // Parent veto that caused this
  cascadedTo: string[];         // Child operations auto-vetoed
  status: VetoCascadeStatus;
  recurrenceCount: number;
  appealEvidence: string | null;
  createdAt: number;
  resolvedAt: number | null;
}

export interface DependencyEdge {
  from: string;                 // Operation ID
  to: string;                   // Dependent operation ID
  strength: number;             // 0-1 coupling strength
}

export interface VetoCascadeStats {
  totalVetoes: number;
  activeVetoes: number;
  cascadedVetoes: number;
  appealsSubmitted: number;
  appealsOverturned: number;
  avgEscalationPriority: number;
  avgCascadeDepth: number;
}

// ── State ────────────────────────────────────────────────────────

const vetoes: Map<string, CascadeVeto> = new Map();
const dependencies: DependencyEdge[] = [];
const MAX_VETOES = 2000;

function genId(): string { return `veto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

// ── Core API ────────────────────────────────────────────────────

/** Register an operation dependency */
export function registerDependency(from: string, to: string, strength: number = 0.8): void {
  dependencies.push({ from, to, strength: Math.max(0, Math.min(1, strength)) });
}

/** Issue a veto with automatic cascade propagation */
export function issueVeto(
  operationId: string, reason: string, vetoedBy: string,
  severity: number, affectedModules: string[],
): CascadeVeto {
  const recurrence = countRecurrence(operationId);
  const escalationPriority = computeEscalation(severity, affectedModules.length, recurrence);

  const veto: CascadeVeto = {
    id: genId(), operationId, reason, vetoedBy,
    severity: Math.max(0, Math.min(1, severity)),
    affectedModules, escalationPriority,
    cascadedFrom: null, cascadedTo: [],
    status: 'active', recurrenceCount: recurrence,
    appealEvidence: null,
    createdAt: Date.now(), resolvedAt: null,
  };

  vetoes.set(veto.id, veto);

  // Cascade to dependents
  const cascaded = cascadeVeto(veto);
  veto.cascadedTo = cascaded.map(v => v.id);

  if (vetoes.size > MAX_VETOES) evictResolved();
  return veto;
}

/** Cascade veto to dependent operations (BFS) */
function cascadeVeto(parentVeto: CascadeVeto): CascadeVeto[] {
  const cascaded: CascadeVeto[] = [];
  const visited = new Set<string>([parentVeto.operationId]);
  const queue = [parentVeto.operationId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const deps = dependencies.filter(d => d.from === current);

    for (const dep of deps) {
      if (visited.has(dep.to)) continue;
      visited.add(dep.to);

      // Only cascade if coupling strength warrants it
      if (dep.strength < 0.3) continue;

      const childVeto: CascadeVeto = {
        id: genId(),
        operationId: dep.to,
        reason: `Cascaded from veto on "${parentVeto.operationId}": ${parentVeto.reason}`,
        vetoedBy: 'system:cascade',
        severity: parentVeto.severity * dep.strength,
        affectedModules: parentVeto.affectedModules,
        escalationPriority: parentVeto.escalationPriority * dep.strength,
        cascadedFrom: parentVeto.id,
        cascadedTo: [],
        status: 'active',
        recurrenceCount: 0,
        appealEvidence: null,
        createdAt: Date.now(),
        resolvedAt: null,
      };

      vetoes.set(childVeto.id, childVeto);
      cascaded.push(childVeto);
      queue.push(dep.to);
    }
  }

  return cascaded;
}

/** Appeal a veto with evidence */
export function appealVeto(vetoId: string, evidence: string): { success: boolean; error?: string } {
  const veto = vetoes.get(vetoId);
  if (!veto) return { success: false, error: 'veto_not_found' };
  if (veto.status !== 'active') return { success: false, error: 'veto_not_active' };

  veto.status = 'appealed';
  veto.appealEvidence = evidence;
  return { success: true };
}

/** Resolve an appeal */
export function resolveAppeal(vetoId: string, overturn: boolean): boolean {
  const veto = vetoes.get(vetoId);
  if (!veto || veto.status !== 'appealed') return false;

  veto.status = overturn ? 'overturned' : 'confirmed';
  veto.resolvedAt = Date.now();

  // If overturned, also overturn cascaded vetoes
  if (overturn) {
    for (const childId of veto.cascadedTo) {
      const child = vetoes.get(childId);
      if (child && child.status === 'active') {
        child.status = 'overturned';
        child.resolvedAt = Date.now();
      }
    }
  }

  return true;
}

/** Compute escalation priority */
function computeEscalation(severity: number, affectedCount: number, recurrence: number): number {
  return Math.round(
    (severity * 0.5 + Math.min(1, affectedCount / 10) * 0.3 + Math.min(1, recurrence / 5) * 0.2) * 100
  ) / 100;
}

function countRecurrence(operationId: string): number {
  return [...vetoes.values()].filter(v => v.operationId === operationId).length;
}

function evictResolved(): void {
  for (const [id, v] of vetoes) {
    if (v.status === 'overturned' || v.status === 'confirmed') { vetoes.delete(id); return; }
  }
}

// ── Query ────────────────────────────────────────────────────────

export function getVeto(id: string): CascadeVeto | undefined { return vetoes.get(id); }
export function getActiveVetoes(): CascadeVeto[] { return [...vetoes.values()].filter(v => v.status === 'active'); }
export function getVetoesByOperation(opId: string): CascadeVeto[] {
  return [...vetoes.values()].filter(v => v.operationId === opId);
}
export function getDependencies(): DependencyEdge[] { return [...dependencies]; }

export function getVetoCascadeStats(): VetoCascadeStats {
  const all = [...vetoes.values()];
  const cascaded = all.filter(v => v.cascadedFrom !== null);
  const appeals = all.filter(v => v.status === 'appealed' || v.status === 'overturned' || v.status === 'confirmed');

  // Compute avg cascade depth
  let totalDepth = 0;
  for (const v of all) {
    let depth = 0; let current: CascadeVeto | undefined = v;
    while (current?.cascadedFrom) { depth++; current = vetoes.get(current.cascadedFrom); }
    totalDepth += depth;
  }

  return {
    totalVetoes: all.length,
    activeVetoes: all.filter(v => v.status === 'active').length,
    cascadedVetoes: cascaded.length,
    appealsSubmitted: appeals.length,
    appealsOverturned: all.filter(v => v.status === 'overturned').length,
    avgEscalationPriority: all.length > 0
      ? Math.round(all.reduce((s, v) => s + v.escalationPriority, 0) / all.length * 100) / 100
      : 0,
    avgCascadeDepth: all.length > 0 ? Math.round((totalDepth / all.length) * 10) / 10 : 0,
  };
}

export function resetVetoCascade(): void {
  vetoes.clear();
  dependencies.length = 0;
}
