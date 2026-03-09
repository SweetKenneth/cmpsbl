/**
 * ACCESS ABAC Engine
 * Attribute-Based Access Control with dynamic policy evaluation
 */

// ============ Types ============

export type PolicyEffect = 'allow' | 'deny';
export type CombiningAlgorithm = 'deny_overrides' | 'permit_overrides' | 'first_applicable';

export interface SubjectAttributes {
  user_id: string;
  roles: string[];
  tier: string;
  department?: string;
  clearance_level?: number;
  mfa_verified?: boolean;
  session_risk_score?: number;
  account_age_days?: number;
  [key: string]: unknown;
}

export interface ResourceAttributes {
  resource_type: string;
  resource_id: string;
  owner_id?: string;
  sensitivity_level?: number;
  classification?: string;
  region?: string;
  [key: string]: unknown;
}

export interface EnvironmentAttributes {
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  request_method?: string;
  api_version?: string;
  time_of_day?: 'business_hours' | 'after_hours' | 'weekend';
  [key: string]: unknown;
}

export interface ActionAttributes {
  action: string;
  sub_action?: string;
  requires_audit?: boolean;
  is_destructive?: boolean;
  [key: string]: unknown;
}

export interface PolicyCondition {
  attribute: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'matches' | 'exists';
  value: unknown;
  source: 'subject' | 'resource' | 'environment' | 'action';
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  effect: PolicyEffect;
  priority: number;
  enabled: boolean;
  target: {
    subjects?: PolicyCondition[];
    resources?: PolicyCondition[];
    actions?: PolicyCondition[];
    environments?: PolicyCondition[];
  };
  conditions: PolicyCondition[];
  obligations?: PolicyObligation[];
  advice?: string[];
  created_at: string;
  updated_at: string;
}

export interface PolicyObligation {
  type: 'audit_log' | 'notify' | 'mfa_challenge' | 'rate_limit' | 'encrypt' | 'redact';
  parameters?: Record<string, unknown>;
  on_permit?: boolean;
  on_deny?: boolean;
}

export interface PolicyDecision {
  effect: PolicyEffect;
  applicable_policies: string[];
  obligations: PolicyObligation[];
  advice: string[];
  evaluation_time_ms: number;
  decision_reason: string;
}

export interface EvaluationContext {
  subject: SubjectAttributes;
  resource: ResourceAttributes;
  action: ActionAttributes;
  environment: EnvironmentAttributes;
}

// ============ Policy Store ============

const policyStore = new Map<string, Policy>();
let combiningAlgorithm: CombiningAlgorithm = 'deny_overrides';

// ============ Built-in Policies ============

const BUILT_IN_POLICIES: Policy[] = [
  {
    id: 'deny_suspended_users',
    name: 'Deny Suspended Users',
    description: 'Block all access for suspended accounts',
    effect: 'deny',
    priority: 1000,
    enabled: true,
    target: {
      subjects: [{ attribute: 'status', operator: 'eq', value: 'suspended', source: 'subject' }],
    },
    conditions: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'require_mfa_admin',
    name: 'Require MFA for Admin Actions',
    description: 'Admin operations require MFA verification',
    effect: 'deny',
    priority: 900,
    enabled: true,
    target: {
      actions: [{ attribute: 'action', operator: 'in', value: ['delete', 'admin', 'configure'], source: 'action' }],
    },
    conditions: [
      { attribute: 'mfa_verified', operator: 'ne', value: true, source: 'subject' },
    ],
    obligations: [
      { type: 'mfa_challenge', on_deny: true },
    ],
    advice: ['MFA verification required for this operation'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'business_hours_only_sensitive',
    name: 'Business Hours for Sensitive Data',
    description: 'Sensitive resources only accessible during business hours',
    effect: 'deny',
    priority: 800,
    enabled: true,
    target: {
      resources: [{ attribute: 'sensitivity_level', operator: 'gte', value: 3, source: 'resource' }],
    },
    conditions: [
      { attribute: 'time_of_day', operator: 'ne', value: 'business_hours', source: 'environment' },
    ],
    advice: ['Sensitive data access restricted to business hours'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'owner_full_access',
    name: 'Resource Owner Full Access',
    description: 'Resource owners have full access to their resources',
    effect: 'allow',
    priority: 700,
    enabled: true,
    target: {},
    conditions: [
      { attribute: 'user_id', operator: 'eq', value: '$resource.owner_id', source: 'subject' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'admin_override',
    name: 'Admin Override',
    description: 'Admins can access all resources',
    effect: 'allow',
    priority: 600,
    enabled: true,
    target: {
      subjects: [{ attribute: 'roles', operator: 'contains', value: 'admin', source: 'subject' }],
    },
    conditions: [],
    obligations: [
      { type: 'audit_log', on_permit: true, parameters: { level: 'admin_access' } },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rate_limit_free_tier',
    name: 'Rate Limit Free Tier',
    description: 'Apply rate limiting for free tier users',
    effect: 'allow',
    priority: 500,
    enabled: true,
    target: {
      subjects: [{ attribute: 'tier', operator: 'eq', value: 'free', source: 'subject' }],
    },
    conditions: [],
    obligations: [
      { type: 'rate_limit', on_permit: true, parameters: { calls_per_minute: 10 } },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'high_risk_session_block',
    name: 'Block High Risk Sessions',
    description: 'Block requests from high-risk sessions',
    effect: 'deny',
    priority: 950,
    enabled: true,
    target: {},
    conditions: [
      { attribute: 'session_risk_score', operator: 'gt', value: 80, source: 'subject' },
    ],
    advice: ['Session flagged as high risk. Please re-authenticate.'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Initialize built-in policies
BUILT_IN_POLICIES.forEach(p => policyStore.set(p.id, p));

// ============ Policy Management ============

/**
 * Register a new policy
 */
export function registerPolicy(policy: Omit<Policy, 'created_at' | 'updated_at'>): Policy {
  const fullPolicy: Policy = {
    ...policy,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  policyStore.set(policy.id, fullPolicy);
  return fullPolicy;
}

/**
 * Update an existing policy
 */
export function updatePolicy(policyId: string, updates: Partial<Policy>): Policy | null {
  const existing = policyStore.get(policyId);
  if (!existing) return null;
  
  const updated: Policy = {
    ...existing,
    ...updates,
    id: policyId, // Prevent ID change
    updated_at: new Date().toISOString(),
  };
  policyStore.set(policyId, updated);
  return updated;
}

/**
 * Delete a policy
 */
export function deletePolicy(policyId: string): boolean {
  return policyStore.delete(policyId);
}

/**
 * Get all policies
 */
export function getPolicies(): Policy[] {
  return Array.from(policyStore.values()).sort((a, b) => b.priority - a.priority);
}

/**
 * Get a specific policy
 */
export function getPolicy(policyId: string): Policy | undefined {
  return policyStore.get(policyId);
}

/**
 * Set combining algorithm
 */
export function setCombiningAlgorithm(algorithm: CombiningAlgorithm): void {
  combiningAlgorithm = algorithm;
}

// ============ Policy Evaluation ============

/**
 * Evaluate access request against all policies
 */
export function evaluateAccess(context: EvaluationContext): PolicyDecision {
  const startTime = performance.now();
  
  const enabledPolicies = Array.from(policyStore.values())
    .filter(p => p.enabled)
    .sort((a, b) => b.priority - a.priority);
  
  const applicablePolicies: string[] = [];
  const allObligations: PolicyObligation[] = [];
  const allAdvice: string[] = [];
  
  let finalEffect: PolicyEffect = 'deny'; // Default deny
  let decisionReason = 'No applicable policy found';
  
  for (const policy of enabledPolicies) {
    // Check if policy target matches
    if (!matchesTarget(policy.target, context)) {
      continue;
    }
    
    // Check conditions
    if (!evaluateConditions(policy.conditions, context)) {
      continue;
    }
    
    applicablePolicies.push(policy.id);
    
    // Collect advice
    if (policy.advice) {
      allAdvice.push(...policy.advice);
    }
    
    // Apply combining algorithm
    if (combiningAlgorithm === 'deny_overrides') {
      if (policy.effect === 'deny') {
        finalEffect = 'deny';
        decisionReason = `Denied by policy: ${policy.name}`;
        collectObligations(policy, finalEffect, allObligations);
        break;
      } else {
        finalEffect = 'allow';
        decisionReason = `Allowed by policy: ${policy.name}`;
        collectObligations(policy, finalEffect, allObligations);
      }
    } else if (combiningAlgorithm === 'permit_overrides') {
      if (policy.effect === 'allow') {
        finalEffect = 'allow';
        decisionReason = `Allowed by policy: ${policy.name}`;
        collectObligations(policy, finalEffect, allObligations);
        break;
      } else {
        finalEffect = 'deny';
        decisionReason = `Denied by policy: ${policy.name}`;
        collectObligations(policy, finalEffect, allObligations);
      }
    } else { // first_applicable
      finalEffect = policy.effect;
      decisionReason = `${policy.effect === 'allow' ? 'Allowed' : 'Denied'} by policy: ${policy.name}`;
      collectObligations(policy, finalEffect, allObligations);
      break;
    }
  }
  
  const evaluationTime = performance.now() - startTime;
  
  return {
    effect: finalEffect,
    applicable_policies: applicablePolicies,
    obligations: allObligations,
    advice: allAdvice,
    evaluation_time_ms: Math.round(evaluationTime * 100) / 100,
    decision_reason: decisionReason,
  };
}

function matchesTarget(
  target: Policy['target'],
  context: EvaluationContext
): boolean {
  // Check subject conditions
  if (target.subjects?.length) {
    if (!target.subjects.some(c => evaluateCondition(c, context))) {
      return false;
    }
  }
  
  // Check resource conditions
  if (target.resources?.length) {
    if (!target.resources.some(c => evaluateCondition(c, context))) {
      return false;
    }
  }
  
  // Check action conditions
  if (target.actions?.length) {
    if (!target.actions.some(c => evaluateCondition(c, context))) {
      return false;
    }
  }
  
  // Check environment conditions
  if (target.environments?.length) {
    if (!target.environments.some(c => evaluateCondition(c, context))) {
      return false;
    }
  }
  
  return true;
}

function evaluateConditions(
  conditions: PolicyCondition[],
  context: EvaluationContext
): boolean {
  return conditions.every(c => evaluateCondition(c, context));
}

function evaluateCondition(
  condition: PolicyCondition,
  context: EvaluationContext
): boolean {
  // Get attribute value from context
  let sourceObj: Record<string, unknown>;
  switch (condition.source) {
    case 'subject':
      sourceObj = context.subject;
      break;
    case 'resource':
      sourceObj = context.resource;
      break;
    case 'action':
      sourceObj = context.action;
      break;
    case 'environment':
      sourceObj = context.environment;
      break;
    default:
      return false;
  }
  
  const actualValue = sourceObj[condition.attribute];
  let expectedValue = condition.value;
  
  // Handle variable references (e.g., $resource.owner_id)
  if (typeof expectedValue === 'string' && expectedValue.startsWith('$')) {
    const [source, attr] = expectedValue.slice(1).split('.');
    const refObj = source === 'subject' ? context.subject :
                   source === 'resource' ? context.resource :
                   source === 'action' ? context.action :
                   context.environment;
    expectedValue = refObj[attr];
  }
  
  // Evaluate operator
  switch (condition.operator) {
    case 'eq':
      return actualValue === expectedValue;
    case 'ne':
      return actualValue !== expectedValue;
    case 'gt':
      return typeof actualValue === 'number' && actualValue > (expectedValue as number);
    case 'gte':
      return typeof actualValue === 'number' && actualValue >= (expectedValue as number);
    case 'lt':
      return typeof actualValue === 'number' && actualValue < (expectedValue as number);
    case 'lte':
      return typeof actualValue === 'number' && actualValue <= (expectedValue as number);
    case 'in':
      return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
    case 'contains':
      return Array.isArray(actualValue) && actualValue.includes(expectedValue);
    case 'matches':
      return typeof actualValue === 'string' && 
             typeof expectedValue === 'string' && 
             new RegExp(expectedValue).test(actualValue);
    case 'exists':
      return actualValue !== undefined && actualValue !== null;
    default:
      return false;
  }
}

function collectObligations(
  policy: Policy,
  effect: PolicyEffect,
  obligations: PolicyObligation[]
): void {
  if (!policy.obligations) return;
  
  for (const obligation of policy.obligations) {
    if ((effect === 'allow' && obligation.on_permit) ||
        (effect === 'deny' && obligation.on_deny)) {
      obligations.push(obligation);
    }
  }
}

// ============ Environment Helpers ============

/**
 * Create environment attributes from current context
 */
export function createEnvironmentAttributes(
  ip?: string,
  userAgent?: string
): EnvironmentAttributes {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  
  let timeOfDay: EnvironmentAttributes['time_of_day'];
  if (day === 0 || day === 6) {
    timeOfDay = 'weekend';
  } else if (hour >= 9 && hour < 18) {
    timeOfDay = 'business_hours';
  } else {
    timeOfDay = 'after_hours';
  }
  
  return {
    timestamp: now.toISOString(),
    ip_address: ip,
    user_agent: userAgent,
    time_of_day: timeOfDay,
  };
}

/**
 * Create action attributes
 */
export function createActionAttributes(
  action: string,
  options?: { sub_action?: string; is_destructive?: boolean }
): ActionAttributes {
  const destructiveActions = ['delete', 'destroy', 'purge', 'revoke', 'terminate'];
  
  return {
    action,
    sub_action: options?.sub_action,
    is_destructive: options?.is_destructive ?? destructiveActions.includes(action.toLowerCase()),
    requires_audit: destructiveActions.includes(action.toLowerCase()),
  };
}

// ============ Policy Statistics ============

/**
 * Get policy evaluation statistics
 */
export function getPolicyStats(): {
  total_policies: number;
  enabled_policies: number;
  by_effect: Record<PolicyEffect, number>;
  avg_conditions: number;
} {
  const policies = Array.from(policyStore.values());
  const enabled = policies.filter(p => p.enabled);
  
  const byEffect: Record<PolicyEffect, number> = { allow: 0, deny: 0 };
  let totalConditions = 0;
  
  for (const p of policies) {
    byEffect[p.effect]++;
    totalConditions += p.conditions.length;
  }
  
  return {
    total_policies: policies.length,
    enabled_policies: enabled.length,
    by_effect: byEffect,
    avg_conditions: policies.length > 0 ? totalConditions / policies.length : 0,
  };
}
