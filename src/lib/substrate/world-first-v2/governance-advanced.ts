/**
 * Advanced Governance Functions — v8.0.0 SYNERGY+ Epoch
 * 14 high-value governance and orchestration patterns
 */

// ═══════════════════════════════════════════════════════════════
// 1. POLICY ENGINE — Rule-based decision enforcement
// ═══════════════════════════════════════════════════════════════

export class PolicyEngine {
  private policies: Map<string, {
    id: string;
    name: string;
    priority: number;
    conditions: Array<{ field: string; operator: string; value: unknown }>;
    actions: Array<{ type: string; parameters: Record<string, unknown> }>;
    enabled: boolean;
  }> = new Map();

  private auditLog: Array<{
    timestamp: number;
    policyId: string;
    input: Record<string, unknown>;
    matched: boolean;
    actions: string[];
  }> = [];

  definePolicy(
    id: string,
    name: string,
    priority: number,
    conditions: Array<{ field: string; operator: string; value: unknown }>,
    actions: Array<{ type: string; parameters: Record<string, unknown> }>
  ): void {
    this.policies.set(id, { id, name, priority, conditions, actions, enabled: true });
  }

  evaluate(input: Record<string, unknown>): {
    matchedPolicies: string[];
    actions: Array<{ type: string; parameters: Record<string, unknown> }>;
  } {
    const sorted = Array.from(this.policies.values())
      .filter(p => p.enabled)
      .sort((a, b) => b.priority - a.priority);

    const matchedPolicies: string[] = [];
    const actions: Array<{ type: string; parameters: Record<string, unknown> }> = [];

    for (const policy of sorted) {
      const matches = this.matchesConditions(input, policy.conditions);

      this.auditLog.push({
        timestamp: Date.now(),
        policyId: policy.id,
        input,
        matched: matches,
        actions: matches ? policy.actions.map(a => a.type) : [],
      });

      if (matches) {
        matchedPolicies.push(policy.id);
        actions.push(...policy.actions);
      }
    }

    return { matchedPolicies, actions };
  }

  private matchesConditions(
    input: Record<string, unknown>,
    conditions: Array<{ field: string; operator: string; value: unknown }>
  ): boolean {
    for (const condition of conditions) {
      const value = this.getNestedValue(input, condition.field);
      if (!this.evaluateCondition(value, condition.operator, condition.value)) {
        return false;
      }
    }
    return true;
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((o: unknown, p) => 
      (o && typeof o === 'object') ? (o as Record<string, unknown>)[p] : undefined
    , obj);
  }

  private evaluateCondition(value: unknown, operator: string, target: unknown): boolean {
    switch (operator) {
      case 'eq': return value === target;
      case 'neq': return value !== target;
      case 'gt': return (value as number) > (target as number);
      case 'gte': return (value as number) >= (target as number);
      case 'lt': return (value as number) < (target as number);
      case 'lte': return (value as number) <= (target as number);
      case 'contains': return String(value).includes(String(target));
      case 'regex': return new RegExp(String(target)).test(String(value));
      case 'in': return Array.isArray(target) && target.includes(value);
      case 'exists': return value !== undefined && value !== null;
      default: return false;
    }
  }

  enablePolicy(id: string): void {
    const policy = this.policies.get(id);
    if (policy) policy.enabled = true;
  }

  disablePolicy(id: string): void {
    const policy = this.policies.get(id);
    if (policy) policy.enabled = false;
  }

  getAuditLog(policyId?: string): typeof this.auditLog {
    if (policyId) {
      return this.auditLog.filter(l => l.policyId === policyId);
    }
    return this.auditLog;
  }
}

// ═══════════════════════════════════════════════════════════════
// 2. APPROVAL WORKFLOW — Multi-stage approval routing
// ═══════════════════════════════════════════════════════════════

export class ApprovalWorkflow {
  private workflows: Map<string, {
    id: string;
    stages: Array<{ name: string; approvers: string[]; requiredApprovals: number }>;
    currentStage: number;
    approvals: Map<number, Set<string>>;
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    createdAt: number;
    expiresAt: number;
    payload: unknown;
  }> = new Map();

  create(
    id: string,
    stages: Array<{ name: string; approvers: string[]; requiredApprovals: number }>,
    payload: unknown,
    expiresInMs = 7 * 24 * 60 * 60 * 1000
  ): void {
    this.workflows.set(id, {
      id,
      stages,
      currentStage: 0,
      approvals: new Map(),
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + expiresInMs,
      payload,
    });
  }

  approve(workflowId: string, approverId: string): {
    success: boolean;
    advanced: boolean;
    completed: boolean;
    message: string;
  } {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return { success: false, advanced: false, completed: false, message: 'workflow_not_found' };
    }

    if (workflow.status !== 'pending') {
      return { success: false, advanced: false, completed: false, message: `workflow_${workflow.status}` };
    }

    if (Date.now() > workflow.expiresAt) {
      workflow.status = 'expired';
      return { success: false, advanced: false, completed: false, message: 'workflow_expired' };
    }

    const stage = workflow.stages[workflow.currentStage];
    if (!stage.approvers.includes(approverId)) {
      return { success: false, advanced: false, completed: false, message: 'not_authorized' };
    }

    // Record approval
    const stageApprovals = workflow.approvals.get(workflow.currentStage) ?? new Set();
    stageApprovals.add(approverId);
    workflow.approvals.set(workflow.currentStage, stageApprovals);

    // Check if stage complete
    if (stageApprovals.size >= stage.requiredApprovals) {
      workflow.currentStage++;

      // Check if workflow complete
      if (workflow.currentStage >= workflow.stages.length) {
        workflow.status = 'approved';
        return { success: true, advanced: true, completed: true, message: 'workflow_approved' };
      }

      return { success: true, advanced: true, completed: false, message: `advanced_to_stage_${workflow.currentStage}` };
    }

    return { success: true, advanced: false, completed: false, message: 'approval_recorded' };
  }

  reject(workflowId: string, rejecterId: string, reason: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || workflow.status !== 'pending') return false;

    const stage = workflow.stages[workflow.currentStage];
    if (!stage.approvers.includes(rejecterId)) return false;

    workflow.status = 'rejected';
    return true;
  }

  getStatus(workflowId: string): {
    status: string;
    currentStage: number;
    totalStages: number;
    approvalsNeeded: number;
    approvalsReceived: number;
  } | null {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;

    const stage = workflow.stages[workflow.currentStage];
    const stageApprovals = workflow.approvals.get(workflow.currentStage) ?? new Set();

    return {
      status: workflow.status,
      currentStage: workflow.currentStage,
      totalStages: workflow.stages.length,
      approvalsNeeded: stage?.requiredApprovals ?? 0,
      approvalsReceived: stageApprovals.size,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 3. AUDIT CHAIN — Immutable audit trail with integrity
// ═══════════════════════════════════════════════════════════════

export class AuditChain {
  private chain: Array<{
    index: number;
    timestamp: number;
    event: string;
    actor: string;
    data: Record<string, unknown>;
    previousHash: string;
    hash: string;
  }> = [];

  append(event: string, actor: string, data: Record<string, unknown>): string {
    const index = this.chain.length;
    const previousHash = index > 0 ? this.chain[index - 1].hash : '0'.repeat(64);
    const timestamp = Date.now();

    const blockData = { index, timestamp, event, actor, data, previousHash };
    const hash = this.calculateHash(blockData);

    this.chain.push({ ...blockData, hash });
    return hash;
  }

  private calculateHash(data: object): string {
    // Simplified hash - in production use crypto.subtle
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  verify(): { valid: boolean; invalidAt?: number } {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // Check previous hash linkage
      if (current.previousHash !== previous.hash) {
        return { valid: false, invalidAt: i };
      }

      // Verify current hash
      const { hash, ...blockData } = current;
      const calculatedHash = this.calculateHash(blockData);
      if (calculatedHash !== hash) {
        return { valid: false, invalidAt: i };
      }
    }

    return { valid: true };
  }

  query(filters: {
    event?: string;
    actor?: string;
    fromTimestamp?: number;
    toTimestamp?: number;
  }): typeof this.chain {
    return this.chain.filter(entry => {
      if (filters.event && entry.event !== filters.event) return false;
      if (filters.actor && entry.actor !== filters.actor) return false;
      if (filters.fromTimestamp && entry.timestamp < filters.fromTimestamp) return false;
      if (filters.toTimestamp && entry.timestamp > filters.toTimestamp) return false;
      return true;
    });
  }

  getLatest(n = 10): typeof this.chain {
    return this.chain.slice(-n);
  }

  exportChain(): string {
    return JSON.stringify(this.chain);
  }
}

// ═══════════════════════════════════════════════════════════════
// 4. QUOTA GOVERNOR — Resource quota management
// ═══════════════════════════════════════════════════════════════

export class QuotaGovernor {
  private quotas: Map<string, {
    entityId: string;
    resource: string;
    limit: number;
    used: number;
    period: 'daily' | 'monthly' | 'rolling';
    periodStart: number;
  }> = new Map();

  private overageLog: Array<{
    entityId: string;
    resource: string;
    attempted: number;
    limit: number;
    timestamp: number;
  }> = [];

  setQuota(
    entityId: string,
    resource: string,
    limit: number,
    period: 'daily' | 'monthly' | 'rolling' = 'monthly'
  ): void {
    const key = `${entityId}:${resource}`;
    this.quotas.set(key, {
      entityId,
      resource,
      limit,
      used: 0,
      period,
      periodStart: Date.now(),
    });
  }

  consume(entityId: string, resource: string, amount: number): {
    allowed: boolean;
    remaining: number;
    overage?: number;
  } {
    const key = `${entityId}:${resource}`;
    const quota = this.quotas.get(key);

    if (!quota) {
      return { allowed: true, remaining: Infinity };
    }

    this.resetIfPeriodExpired(quota);

    if (quota.used + amount <= quota.limit) {
      quota.used += amount;
      return { allowed: true, remaining: quota.limit - quota.used };
    }

    const overage = quota.used + amount - quota.limit;
    this.overageLog.push({
      entityId,
      resource,
      attempted: amount,
      limit: quota.limit,
      timestamp: Date.now(),
    });

    return { allowed: false, remaining: quota.limit - quota.used, overage };
  }

  private resetIfPeriodExpired(quota: typeof this.quotas extends Map<string, infer V> ? V : never): void {
    const now = Date.now();
    let periodMs: number;

    switch (quota.period) {
      case 'daily':
        periodMs = 24 * 60 * 60 * 1000;
        break;
      case 'monthly':
        periodMs = 30 * 24 * 60 * 60 * 1000;
        break;
      case 'rolling':
        periodMs = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        periodMs = 30 * 24 * 60 * 60 * 1000;
    }

    if (now - quota.periodStart >= periodMs) {
      quota.used = 0;
      quota.periodStart = now;
    }
  }

  getUsage(entityId: string, resource: string): {
    used: number;
    limit: number;
    percentage: number;
    periodEnd: number;
  } | null {
    const key = `${entityId}:${resource}`;
    const quota = this.quotas.get(key);
    if (!quota) return null;

    this.resetIfPeriodExpired(quota);

    const periodMs = quota.period === 'daily' 
      ? 24 * 60 * 60 * 1000 
      : 30 * 24 * 60 * 60 * 1000;

    return {
      used: quota.used,
      limit: quota.limit,
      percentage: quota.used / quota.limit,
      periodEnd: quota.periodStart + periodMs,
    };
  }

  getOverageHistory(entityId?: string): typeof this.overageLog {
    if (entityId) {
      return this.overageLog.filter(o => o.entityId === entityId);
    }
    return this.overageLog;
  }
}

// ═══════════════════════════════════════════════════════════════
// 5. CHANGE MANAGER — Controlled change orchestration
// ═══════════════════════════════════════════════════════════════

export class ChangeManager {
  private changes: Map<string, {
    id: string;
    type: 'feature' | 'config' | 'schema' | 'infrastructure';
    status: 'draft' | 'review' | 'approved' | 'deploying' | 'deployed' | 'rolled_back';
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    rollbackPlan: string;
    createdBy: string;
    createdAt: number;
    deployedAt?: number;
    rollbackData?: unknown;
  }> = new Map();

  create(
    id: string,
    type: 'feature' | 'config' | 'schema' | 'infrastructure',
    description: string,
    impact: 'low' | 'medium' | 'high' | 'critical',
    rollbackPlan: string,
    createdBy: string
  ): void {
    this.changes.set(id, {
      id,
      type,
      status: 'draft',
      description,
      impact,
      rollbackPlan,
      createdBy,
      createdAt: Date.now(),
    });
  }

  submit(changeId: string): boolean {
    const change = this.changes.get(changeId);
    if (!change || change.status !== 'draft') return false;
    change.status = 'review';
    return true;
  }

  approve(changeId: string): boolean {
    const change = this.changes.get(changeId);
    if (!change || change.status !== 'review') return false;
    change.status = 'approved';
    return true;
  }

  deploy(changeId: string, rollbackData: unknown): boolean {
    const change = this.changes.get(changeId);
    if (!change || change.status !== 'approved') return false;

    change.status = 'deploying';
    change.rollbackData = rollbackData;

    // Simulate deployment
    setTimeout(() => {
      change.status = 'deployed';
      change.deployedAt = Date.now();
    }, 100);

    return true;
  }

  rollback(changeId: string): { success: boolean; rollbackData?: unknown } {
    const change = this.changes.get(changeId);
    if (!change || change.status !== 'deployed') {
      return { success: false };
    }

    change.status = 'rolled_back';
    return { success: true, rollbackData: change.rollbackData };
  }

  getChangesByStatus(status: string): typeof this.changes extends Map<string, infer V> ? V[] : never[] {
    return Array.from(this.changes.values()).filter(c => c.status === status);
  }

  getPendingHighImpact(): string[] {
    return Array.from(this.changes.values())
      .filter(c => ['high', 'critical'].includes(c.impact) && ['review', 'approved'].includes(c.status))
      .map(c => c.id);
  }
}

// ═══════════════════════════════════════════════════════════════
// 6. ACCESS MATRIX — Fine-grained permission management
// ═══════════════════════════════════════════════════════════════

export class AccessMatrix {
  private permissions: Map<string, Set<string>> = new Map(); // role -> permissions
  private roleHierarchy: Map<string, string[]> = new Map(); // role -> parent roles
  private userRoles: Map<string, Set<string>> = new Map(); // user -> roles

  defineRole(roleId: string, permissions: string[], inheritsFrom: string[] = []): void {
    this.permissions.set(roleId, new Set(permissions));
    this.roleHierarchy.set(roleId, inheritsFrom);
  }

  assignRole(userId: string, roleId: string): void {
    const roles = this.userRoles.get(userId) ?? new Set();
    roles.add(roleId);
    this.userRoles.set(userId, roles);
  }

  revokeRole(userId: string, roleId: string): void {
    const roles = this.userRoles.get(userId);
    if (roles) {
      roles.delete(roleId);
    }
  }

  hasPermission(userId: string, permission: string): boolean {
    const roles = this.userRoles.get(userId);
    if (!roles) return false;

    const allRoles = this.expandRoles(roles);
    
    for (const roleId of allRoles) {
      const perms = this.permissions.get(roleId);
      if (perms?.has(permission) || perms?.has('*')) {
        return true;
      }
    }

    return false;
  }

  private expandRoles(roles: Set<string>): Set<string> {
    const expanded = new Set<string>();
    const queue = [...roles];

    while (queue.length > 0) {
      const role = queue.shift()!;
      if (expanded.has(role)) continue;

      expanded.add(role);
      const parents = this.roleHierarchy.get(role) ?? [];
      queue.push(...parents);
    }

    return expanded;
  }

  getEffectivePermissions(userId: string): string[] {
    const roles = this.userRoles.get(userId);
    if (!roles) return [];

    const allRoles = this.expandRoles(roles);
    const allPerms = new Set<string>();

    for (const roleId of allRoles) {
      const perms = this.permissions.get(roleId);
      if (perms) {
        for (const p of perms) {
          allPerms.add(p);
        }
      }
    }

    return Array.from(allPerms);
  }

  checkMultiple(userId: string, permissions: string[]): Map<string, boolean> {
    const results = new Map<string, boolean>();
    for (const perm of permissions) {
      results.set(perm, this.hasPermission(userId, perm));
    }
    return results;
  }
}

// ═══════════════════════════════════════════════════════════════
// 7. ORCHESTRATION GRAPH — Complex workflow coordination
// ═══════════════════════════════════════════════════════════════

export class OrchestrationGraph {
  private nodes: Map<string, {
    id: string;
    type: 'task' | 'decision' | 'parallel' | 'join';
    handler?: () => Promise<unknown>;
    condition?: (input: unknown) => string; // Returns next node id
  }> = new Map();

  private edges: Map<string, string[]> = new Map(); // node -> next nodes

  addTask(id: string, handler: () => Promise<unknown>): void {
    this.nodes.set(id, { id, type: 'task', handler });
    this.edges.set(id, []);
  }

  addDecision(id: string, condition: (input: unknown) => string): void {
    this.nodes.set(id, { id, type: 'decision', condition });
    this.edges.set(id, []);
  }

  addParallel(id: string): void {
    this.nodes.set(id, { id, type: 'parallel' });
    this.edges.set(id, []);
  }

  addJoin(id: string): void {
    this.nodes.set(id, { id, type: 'join' });
    this.edges.set(id, []);
  }

  connect(from: string, to: string): void {
    const edges = this.edges.get(from) ?? [];
    edges.push(to);
    this.edges.set(from, edges);
  }

  async execute(startNode: string, input: unknown): Promise<{
    results: Map<string, unknown>;
    path: string[];
    success: boolean;
  }> {
    const results = new Map<string, unknown>();
    const path: string[] = [];
    const visited = new Set<string>();

    const executeNode = async (nodeId: string, nodeInput: unknown): Promise<unknown> => {
      if (visited.has(nodeId)) return results.get(nodeId);
      visited.add(nodeId);
      path.push(nodeId);

      const node = this.nodes.get(nodeId);
      if (!node) throw new Error(`Node ${nodeId} not found`);

      let result: unknown;

      switch (node.type) {
        case 'task':
          result = node.handler ? await node.handler() : nodeInput;
          break;

        case 'decision':
          const nextId = node.condition?.(nodeInput) ?? this.edges.get(nodeId)?.[0];
          if (nextId) {
            result = await executeNode(nextId, nodeInput);
          }
          break;

        case 'parallel':
          const parallelEdges = this.edges.get(nodeId) ?? [];
          const parallelResults = await Promise.all(
            parallelEdges.map(edge => executeNode(edge, nodeInput))
          );
          result = parallelResults;
          break;

        case 'join':
          result = nodeInput;
          break;
      }

      results.set(nodeId, result);

      // Continue to next nodes (except for decision which handles its own flow)
      if (node.type !== 'decision') {
        const nextNodes = this.edges.get(nodeId) ?? [];
        for (const nextId of nextNodes) {
          await executeNode(nextId, result);
        }
      }

      return result;
    };

    try {
      await executeNode(startNode, input);
      return { results, path, success: true };
    } catch {
      return { results, path, success: false };
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// 8-14: Additional Governance Patterns
// ═══════════════════════════════════════════════════════════════

export class ServiceRegistry {
  private services: Map<string, {
    id: string;
    name: string;
    version: string;
    endpoints: string[];
    status: 'active' | 'deprecated' | 'maintenance';
    metadata: Record<string, unknown>;
  }> = new Map();

  register(
    id: string,
    name: string,
    version: string,
    endpoints: string[],
    metadata: Record<string, unknown> = {}
  ): void {
    this.services.set(id, { id, name, version, endpoints, status: 'active', metadata });
  }

  discover(name: string): Array<typeof this.services extends Map<string, infer V> ? V : never> {
    return Array.from(this.services.values()).filter(s => s.name === name && s.status === 'active');
  }

  setStatus(id: string, status: 'active' | 'deprecated' | 'maintenance'): void {
    const service = this.services.get(id);
    if (service) service.status = status;
  }

  getHealthy(): string[] {
    return Array.from(this.services.values())
      .filter(s => s.status === 'active')
      .map(s => s.id);
  }
}

export class ConfigVersioning {
  private configs: Map<string, Array<{ version: number; data: unknown; timestamp: number; author: string }>> = new Map();

  save(configId: string, data: unknown, author: string): number {
    const versions = this.configs.get(configId) ?? [];
    const version = versions.length + 1;
    versions.push({ version, data, timestamp: Date.now(), author });
    this.configs.set(configId, versions);
    return version;
  }

  get(configId: string, version?: number): unknown | null {
    const versions = this.configs.get(configId);
    if (!versions || versions.length === 0) return null;

    if (version) {
      const specific = versions.find(v => v.version === version);
      return specific?.data ?? null;
    }

    return versions[versions.length - 1].data;
  }

  rollback(configId: string, toVersion: number): boolean {
    const versions = this.configs.get(configId);
    if (!versions) return false;

    const target = versions.find(v => v.version === toVersion);
    if (!target) return false;

    // Create new version with old data
    this.save(configId, target.data, 'system:rollback');
    return true;
  }

  getHistory(configId: string): Array<{ version: number; timestamp: number; author: string }> {
    const versions = this.configs.get(configId) ?? [];
    return versions.map(v => ({ version: v.version, timestamp: v.timestamp, author: v.author }));
  }
}

export class DependencyTracker {
  private dependencies: Map<string, Set<string>> = new Map(); // service -> dependencies

  declare(serviceId: string, dependsOn: string[]): void {
    this.dependencies.set(serviceId, new Set(dependsOn));
  }

  getDependencies(serviceId: string): string[] {
    return Array.from(this.dependencies.get(serviceId) ?? []);
  }

  getDependents(serviceId: string): string[] {
    const dependents: string[] = [];
    for (const [id, deps] of this.dependencies) {
      if (deps.has(serviceId)) {
        dependents.push(id);
      }
    }
    return dependents;
  }

  getImpactRadius(serviceId: string): string[] {
    const impacted = new Set<string>();
    const queue = [serviceId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const dependent of this.getDependents(current)) {
        if (!impacted.has(dependent)) {
          impacted.add(dependent);
          queue.push(dependent);
        }
      }
    }

    return Array.from(impacted);
  }
}

export class MaintenanceWindow {
  private windows: Map<string, {
    id: string;
    start: number;
    end: number;
    affectedServices: string[];
    type: 'scheduled' | 'emergency';
    status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  }> = new Map();

  schedule(
    id: string,
    start: number,
    end: number,
    affectedServices: string[],
    type: 'scheduled' | 'emergency' = 'scheduled'
  ): void {
    this.windows.set(id, { id, start, end, affectedServices, type, status: 'scheduled' });
  }

  isInMaintenance(serviceId: string): boolean {
    const now = Date.now();
    for (const window of this.windows.values()) {
      if (window.status !== 'active' && window.status !== 'scheduled') continue;
      if (now < window.start || now > window.end) continue;
      if (window.affectedServices.includes(serviceId)) return true;
    }
    return false;
  }

  getUpcoming(serviceId?: string): typeof this.windows extends Map<string, infer V> ? V[] : never[] {
    const now = Date.now();
    return Array.from(this.windows.values())
      .filter(w => w.start > now && w.status === 'scheduled')
      .filter(w => !serviceId || w.affectedServices.includes(serviceId));
  }

  activate(id: string): void {
    const window = this.windows.get(id);
    if (window) window.status = 'active';
  }

  complete(id: string): void {
    const window = this.windows.get(id);
    if (window) window.status = 'completed';
  }
}

export class CapabilityMatrix {
  private capabilities: Map<string, Set<string>> = new Map(); // entity -> capabilities

  grant(entityId: string, capability: string): void {
    const caps = this.capabilities.get(entityId) ?? new Set();
    caps.add(capability);
    this.capabilities.set(entityId, caps);
  }

  revoke(entityId: string, capability: string): void {
    const caps = this.capabilities.get(entityId);
    if (caps) caps.delete(capability);
  }

  has(entityId: string, capability: string): boolean {
    return this.capabilities.get(entityId)?.has(capability) ?? false;
  }

  list(entityId: string): string[] {
    return Array.from(this.capabilities.get(entityId) ?? []);
  }

  findWithCapability(capability: string): string[] {
    const entities: string[] = [];
    for (const [entityId, caps] of this.capabilities) {
      if (caps.has(capability)) entities.push(entityId);
    }
    return entities;
  }
}

export class EventSourcing {
  private events: Array<{
    id: string;
    aggregateId: string;
    type: string;
    data: unknown;
    timestamp: number;
    version: number;
  }> = [];

  private aggregateVersions: Map<string, number> = new Map();

  append(aggregateId: string, type: string, data: unknown): string {
    const currentVersion = this.aggregateVersions.get(aggregateId) ?? 0;
    const newVersion = currentVersion + 1;

    const id = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.events.push({
      id,
      aggregateId,
      type,
      data,
      timestamp: Date.now(),
      version: newVersion,
    });

    this.aggregateVersions.set(aggregateId, newVersion);
    return id;
  }

  getEvents(aggregateId: string, fromVersion = 0): typeof this.events {
    return this.events.filter(e => e.aggregateId === aggregateId && e.version > fromVersion);
  }

  replay<T>(aggregateId: string, reducer: (state: T, event: typeof this.events[0]) => T, initial: T): T {
    const events = this.getEvents(aggregateId);
    return events.reduce(reducer, initial);
  }

  getSnapshot(aggregateId: string): { version: number; eventCount: number } {
    const version = this.aggregateVersions.get(aggregateId) ?? 0;
    const eventCount = this.events.filter(e => e.aggregateId === aggregateId).length;
    return { version, eventCount };
  }
}

export class TenantIsolation {
  private tenants: Map<string, {
    id: string;
    resources: Set<string>;
    quotas: Map<string, number>;
    metadata: Record<string, unknown>;
  }> = new Map();

  private resourceOwnership: Map<string, string> = new Map(); // resource -> tenant

  register(tenantId: string, metadata: Record<string, unknown> = {}): void {
    this.tenants.set(tenantId, {
      id: tenantId,
      resources: new Set(),
      quotas: new Map(),
      metadata,
    });
  }

  assignResource(tenantId: string, resourceId: string): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;

    // Check if already owned
    const currentOwner = this.resourceOwnership.get(resourceId);
    if (currentOwner && currentOwner !== tenantId) return false;

    tenant.resources.add(resourceId);
    this.resourceOwnership.set(resourceId, tenantId);
    return true;
  }

  canAccess(tenantId: string, resourceId: string): boolean {
    const owner = this.resourceOwnership.get(resourceId);
    return owner === tenantId;
  }

  getTenantResources(tenantId: string): string[] {
    return Array.from(this.tenants.get(tenantId)?.resources ?? []);
  }

  setQuota(tenantId: string, resource: string, limit: number): void {
    const tenant = this.tenants.get(tenantId);
    if (tenant) tenant.quotas.set(resource, limit);
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export const governanceAdvanced = {
  PolicyEngine,
  ApprovalWorkflow,
  AuditChain,
  QuotaGovernor,
  ChangeManager,
  AccessMatrix,
  OrchestrationGraph,
  ServiceRegistry,
  ConfigVersioning,
  DependencyTracker,
  MaintenanceWindow,
  CapabilityMatrix,
  EventSourcing,
  TenantIsolation,
};
