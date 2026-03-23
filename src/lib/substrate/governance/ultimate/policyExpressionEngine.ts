/**
 * GOVERNANCE Ultimate — System 1: Policy Expression Engine
 * 
 * Composable rule DSL with deny/require/limit/scope_match operators,
 * boolean combinators (AND/OR/NOT), versioned hot-reloadable policies.
 * 
 * @module governance/ultimate/policyExpressionEngine
 */

// ── Types ────────────────────────────────────────────────────────

export type PolicyOperator = 'deny' | 'require' | 'limit' | 'scope_match';
export type PolicyCombinator = 'AND' | 'OR' | 'NOT';
export type PolicyStatus = 'active' | 'draft' | 'deprecated' | 'expired';

export interface PolicyExpression {
  operator: PolicyOperator;
  field: string;
  value: string | number | string[];
  combinator?: PolicyCombinator;
  children?: PolicyExpression[];
}

export interface PolicyDefinition {
  id: string;
  name: string;
  version: number;
  framework: string;          // e.g. "ethical_ai", "data_protection"
  expressions: PolicyExpression[];
  status: PolicyStatus;
  priority: number;           // Higher = evaluated first
  createdAt: number;
  updatedAt: number;
  parentId: string | null;    // For version lineage
  metadata: Record<string, unknown>;
}

export interface PolicyEvalContext {
  action: string;
  module: string;
  actor: string;
  resource?: string;
  tier?: string;
  scopes?: string[];
  metadata?: Record<string, unknown>;
}

export interface PolicyEvalResult {
  policyId: string;
  policyName: string;
  decision: 'allow' | 'deny' | 'warn';
  matchedExpressions: PolicyExpression[];
  reason: string;
}

export interface PolicyEngineStats {
  totalPolicies: number;
  activePolicies: number;
  totalEvaluations: number;
  denyCount: number;
  allowCount: number;
  warnCount: number;
  avgEvalTimeMs: number;
  frameworks: string[];
}

// ── State ────────────────────────────────────────────────────────

const policies: Map<string, PolicyDefinition> = new Map();
const MAX_POLICIES = 1000;
let totalEvaluations = 0;
let denyCount = 0;
let allowCount = 0;
let warnCount = 0;
let totalEvalTimeMs = 0;

// ── Helpers ──────────────────────────────────────────────────────

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ── Core API ────────────────────────────────────────────────────

/** Register a new policy */
export function registerPolicy(
  name: string,
  framework: string,
  expressions: PolicyExpression[],
  priority: number = 100,
  metadata: Record<string, unknown> = {},
): PolicyDefinition {
  const policy: PolicyDefinition = {
    id: genId('pol'),
    name, version: 1, framework, expressions,
    status: 'active', priority,
    createdAt: Date.now(), updatedAt: Date.now(),
    parentId: null, metadata,
  };

  policies.set(policy.id, policy);
  if (policies.size > MAX_POLICIES) evictDeprecated();
  return policy;
}

/** Hot-reload a policy (creates new version, deprecates old) */
export function updatePolicy(
  policyId: string,
  updates: { expressions?: PolicyExpression[]; priority?: number; metadata?: Record<string, unknown> },
): PolicyDefinition | null {
  const old = policies.get(policyId);
  if (!old) return null;

  old.status = 'deprecated';
  old.updatedAt = Date.now();

  const newPolicy: PolicyDefinition = {
    ...old,
    id: genId('pol'),
    version: old.version + 1,
    expressions: updates.expressions ?? old.expressions,
    priority: updates.priority ?? old.priority,
    metadata: { ...old.metadata, ...updates.metadata },
    status: 'active',
    parentId: policyId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  policies.set(newPolicy.id, newPolicy);
  return newPolicy;
}

/** Evaluate all active policies against a context */
export function evaluatePolicies(context: PolicyEvalContext): PolicyEvalResult[] {
  const start = performance.now();
  totalEvaluations++;

  const activePolicies = [...policies.values()]
    .filter(p => p.status === 'active')
    .sort((a, b) => b.priority - a.priority);

  const results: PolicyEvalResult[] = [];

  for (const policy of activePolicies) {
    const matched: PolicyExpression[] = [];
    let decision: 'allow' | 'deny' | 'warn' = 'allow';

    for (const expr of policy.expressions) {
      const evalResult = evaluateExpression(expr, context);
      if (evalResult) {
        matched.push(expr);
        if (expr.operator === 'deny') decision = 'deny';
        else if (expr.operator === 'limit' && decision !== 'deny') decision = 'warn';
      }
    }

    if (matched.length > 0) {
      results.push({
        policyId: policy.id,
        policyName: policy.name,
        decision,
        matchedExpressions: matched,
        reason: `${matched.length} expression(s) matched in policy "${policy.name}"`,
      });

      if (decision === 'deny') denyCount++;
      else if (decision === 'warn') warnCount++;
      else allowCount++;
    }
  }

  if (results.length === 0) allowCount++;

  totalEvalTimeMs += performance.now() - start;
  return results;
}

/** Evaluate a single expression */
function evaluateExpression(expr: PolicyExpression, ctx: PolicyEvalContext): boolean {
  const contextValue = getContextValue(expr.field, ctx);

  let result = false;
  switch (expr.operator) {
    case 'deny':
      result = matchesValue(contextValue, expr.value);
      break;
    case 'require':
      result = !matchesValue(contextValue, expr.value);
      break;
    case 'limit':
      if (typeof expr.value === 'number' && typeof contextValue === 'number') {
        result = contextValue > expr.value;
      }
      break;
    case 'scope_match':
      if (Array.isArray(expr.value) && Array.isArray(ctx.scopes)) {
        result = expr.value.some(v => ctx.scopes?.includes(v));
      }
      break;
  }

  // Handle combinators with children
  if (expr.children && expr.children.length > 0) {
    const childResults = expr.children.map(c => evaluateExpression(c, ctx));
    switch (expr.combinator) {
      case 'AND': result = result && childResults.every(Boolean); break;
      case 'OR': result = result || childResults.some(Boolean); break;
      case 'NOT': result = !childResults[0]; break;
    }
  }

  return result;
}

function getContextValue(field: string, ctx: PolicyEvalContext): unknown {
  const map: Record<string, unknown> = {
    'action': ctx.action, 'module': ctx.module, 'actor': ctx.actor,
    'resource': ctx.resource, 'tier': ctx.tier, 'scopes': ctx.scopes,
    ...ctx.metadata,
  };
  return map[field];
}

function matchesValue(actual: unknown, expected: string | number | string[]): boolean {
  if (Array.isArray(expected)) return expected.includes(String(actual));
  if (typeof expected === 'string' && expected.includes('*')) {
    const prefix = expected.replace('*', '');
    return String(actual).startsWith(prefix);
  }
  return actual === expected;
}

function evictDeprecated(): void {
  for (const [id, p] of policies) {
    if (p.status === 'deprecated') { policies.delete(id); return; }
  }
}

// ── Query ────────────────────────────────────────────────────────

export function getPolicy(id: string): PolicyDefinition | undefined { return policies.get(id); }
export function getActivePolicies(framework?: string): PolicyDefinition[] {
  const active = [...policies.values()].filter(p => p.status === 'active');
  return framework ? active.filter(p => p.framework === framework) : active;
}
export function getPolicyLineage(id: string): PolicyDefinition[] {
  const chain: PolicyDefinition[] = [];
  let current = policies.get(id);
  while (current) {
    chain.unshift(current);
    current = current.parentId ? policies.get(current.parentId) : undefined;
  }
  return chain;
}

export function getPolicyEngineStats(): PolicyEngineStats {
  const all = [...policies.values()];
  const frameworks = [...new Set(all.map(p => p.framework))];
  return {
    totalPolicies: all.length,
    activePolicies: all.filter(p => p.status === 'active').length,
    totalEvaluations, denyCount, allowCount, warnCount,
    avgEvalTimeMs: totalEvaluations > 0 ? Math.round((totalEvalTimeMs / totalEvaluations) * 1000) / 1000 : 0,
    frameworks,
  };
}

export function resetPolicyEngine(): void {
  policies.clear();
  totalEvaluations = 0; denyCount = 0; allowCount = 0; warnCount = 0; totalEvalTimeMs = 0;
}
