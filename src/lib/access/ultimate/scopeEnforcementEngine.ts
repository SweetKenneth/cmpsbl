/**
 * ACCESS Ultimate — System 3: Scope Enforcement Engine
 * 
 * Hierarchical scope tree, scope intersection validation,
 * dynamic escalation requests, and scope audit trail.
 * 
 * @module access/ultimate/scopeEnforcementEngine
 */

// ── Types ────────────────────────────────────────────────────────

export interface ScopeNode {
  path: string;                // e.g. "brain:read"
  parent: string | null;       // e.g. "brain:*"
  children: string[];
  description: string;
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
}

export interface ScopeCheckResult {
  granted: boolean;
  matchedScope: string | null;
  reason: string;
}

export interface ScopeEscalation {
  id: string;
  keyId: string;
  requestedScopes: string[];
  currentScopes: string[];
  status: 'pending' | 'approved' | 'denied';
  requestedAt: number;
  resolvedAt: number | null;
  resolvedBy: string | null;
}

export interface ScopeAuditEntry {
  id: string;
  keyId: string;
  action: 'grant' | 'revoke' | 'escalation_request' | 'escalation_resolve';
  scopes: string[];
  performedBy: string;
  timestamp: number;
}

export interface ScopeEngineStats {
  totalScopes: number;
  totalChecks: number;
  grantedChecks: number;
  deniedChecks: number;
  escalationsPending: number;
  escalationsApproved: number;
  escalationsDenied: number;
  auditEntries: number;
}

// ── State ────────────────────────────────────────────────────────

const scopeTree: Map<string, ScopeNode> = new Map();
const escalations: ScopeEscalation[] = [];
const auditTrail: ScopeAuditEntry[] = [];
const MAX_AUDIT = 3000;
const MAX_ESCALATIONS = 500;
let totalChecks = 0;
let grantedChecks = 0;
let deniedChecks = 0;

// ── Initialize Default Scope Tree ───────────────────────────────

function initDefaultTree(): void {
  if (scopeTree.size > 0) return;

  const nodes: Array<[string, string | null, string, ScopeNode['tier']]> = [
    ['*:*', null, 'Full access', 'enterprise'],
    ['brain:*', '*:*', 'All brain operations', 'pro'],
    ['brain:read', 'brain:*', 'Read brain data', 'free'],
    ['brain:write', 'brain:*', 'Write brain data', 'starter'],
    ['brain:query', 'brain:*', 'Query brain', 'free'],
    ['memory:*', '*:*', 'All memory operations', 'pro'],
    ['memory:read', 'memory:*', 'Read memory', 'free'],
    ['memory:write', 'memory:*', 'Write memory', 'starter'],
    ['memory:store', 'memory:*', 'Store to memory', 'starter'],
    ['decode:*', '*:*', 'All decode operations', 'pro'],
    ['decode:chat', 'decode:*', 'Chat interface', 'free'],
    ['decode:analyze', 'decode:*', 'Analysis operations', 'starter'],
    ['system:*', '*:*', 'All system operations', 'enterprise'],
    ['system:read', 'system:*', 'Read system state', 'pro'],
    ['system:admin', 'system:*', 'Admin operations', 'enterprise'],
    ['evolution:*', '*:*', 'All evolution operations', 'enterprise'],
    ['evolution:apply', 'evolution:*', 'Apply mutations', 'enterprise'],
    ['evolution:propose', 'evolution:*', 'Propose mutations', 'pro'],
    ['encode:*', '*:*', 'All encode operations', 'pro'],
    ['encode:code_analysis', 'encode:*', 'Code analysis', 'starter'],
    ['encode:mutation', 'encode:*', 'Code mutation', 'pro'],
  ];

  for (const [path, parent, description, tier] of nodes) {
    scopeTree.set(path, { path, parent, description, tier, children: [] });
  }

  // Wire children
  for (const node of scopeTree.values()) {
    if (node.parent) {
      const parentNode = scopeTree.get(node.parent);
      if (parentNode) parentNode.children.push(node.path);
    }
  }
}

// ── Core API ────────────────────────────────────────────────────

/** Check if granted scopes allow a requested scope */
export function checkScope(grantedScopes: string[], requestedScope: string): ScopeCheckResult {
  initDefaultTree();
  totalChecks++;

  // Direct match
  if (grantedScopes.includes(requestedScope)) {
    grantedChecks++;
    return { granted: true, matchedScope: requestedScope, reason: 'direct_match' };
  }

  // Wildcard match — check if any granted scope is a parent
  for (const granted of grantedScopes) {
    if (granted === '*:*') {
      grantedChecks++;
      return { granted: true, matchedScope: granted, reason: 'full_access' };
    }

    if (granted.endsWith(':*')) {
      const prefix = granted.slice(0, -1); // "brain:" from "brain:*"
      if (requestedScope.startsWith(prefix)) {
        grantedChecks++;
        return { granted: true, matchedScope: granted, reason: 'wildcard_match' };
      }
    }
  }

  deniedChecks++;
  return { granted: false, matchedScope: null, reason: 'no_matching_scope' };
}

/** Compute intersection of two scope sets */
export function intersectScopes(scopesA: string[], scopesB: string[]): string[] {
  initDefaultTree();
  const result: string[] = [];

  for (const a of scopesA) {
    for (const b of scopesB) {
      if (a === b) {
        if (!result.includes(a)) result.push(a);
      } else if (isParentScope(a, b)) {
        if (!result.includes(b)) result.push(b);
      } else if (isParentScope(b, a)) {
        if (!result.includes(a)) result.push(a);
      }
    }
  }

  return result;
}

/** Check if scope A is a parent of scope B */
function isParentScope(parent: string, child: string): boolean {
  if (parent === '*:*') return true;
  if (parent.endsWith(':*')) {
    const prefix = parent.slice(0, -1);
    return child.startsWith(prefix);
  }
  return false;
}

/** Request scope escalation */
export function requestEscalation(
  keyId: string,
  currentScopes: string[],
  requestedScopes: string[],
): ScopeEscalation {
  const escalation: ScopeEscalation = {
    id: `esc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    keyId,
    requestedScopes,
    currentScopes,
    status: 'pending',
    requestedAt: Date.now(),
    resolvedAt: null,
    resolvedBy: null,
  };

  escalations.push(escalation);
  if (escalations.length > MAX_ESCALATIONS) escalations.splice(0, escalations.length - MAX_ESCALATIONS);

  recordAudit(keyId, 'escalation_request', requestedScopes, 'system');
  return escalation;
}

/** Resolve an escalation */
export function resolveEscalation(
  escalationId: string,
  approved: boolean,
  resolvedBy: string,
): boolean {
  const esc = escalations.find(e => e.id === escalationId);
  if (!esc || esc.status !== 'pending') return false;

  esc.status = approved ? 'approved' : 'denied';
  esc.resolvedAt = Date.now();
  esc.resolvedBy = resolvedBy;

  recordAudit(esc.keyId, 'escalation_resolve', esc.requestedScopes, resolvedBy);
  return true;
}

/** Record a scope audit entry */
export function recordAudit(
  keyId: string,
  action: ScopeAuditEntry['action'],
  scopes: string[],
  performedBy: string,
): void {
  auditTrail.push({
    id: `sa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    keyId, action, scopes, performedBy,
    timestamp: Date.now(),
  });
  if (auditTrail.length > MAX_AUDIT) auditTrail.splice(0, auditTrail.length - MAX_AUDIT);
}

/** Register a custom scope */
export function registerScope(path: string, parent: string | null, description: string, tier: ScopeNode['tier'] = 'pro'): void {
  initDefaultTree();
  scopeTree.set(path, { path, parent, description, tier, children: [] });
  if (parent) {
    const parentNode = scopeTree.get(parent);
    if (parentNode) parentNode.children.push(path);
  }
}

// ── Query ────────────────────────────────────────────────────────

export function getScopeTree(): ScopeNode[] { initDefaultTree(); return [...scopeTree.values()]; }
export function getEscalations(status?: ScopeEscalation['status']): ScopeEscalation[] {
  return status ? escalations.filter(e => e.status === status) : [...escalations];
}
export function getAuditTrail(keyId?: string, count?: number): ScopeAuditEntry[] {
  let filtered = keyId ? auditTrail.filter(a => a.keyId === keyId) : auditTrail;
  if (count) filtered = filtered.slice(-count);
  return filtered;
}

export function getScopeEngineStats(): ScopeEngineStats {
  return {
    totalScopes: scopeTree.size,
    totalChecks,
    grantedChecks,
    deniedChecks,
    escalationsPending: escalations.filter(e => e.status === 'pending').length,
    escalationsApproved: escalations.filter(e => e.status === 'approved').length,
    escalationsDenied: escalations.filter(e => e.status === 'denied').length,
    auditEntries: auditTrail.length,
  };
}

export function resetScopeEngine(): void {
  scopeTree.clear();
  escalations.length = 0;
  auditTrail.length = 0;
  totalChecks = 0;
  grantedChecks = 0;
  deniedChecks = 0;
}
