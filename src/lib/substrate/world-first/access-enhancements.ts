/**
 * ACCESS Module Enhancements — v7.5.0 SYNERGY Epoch
 * EntitlementGraph, QuotaPredictor, AuditTrail
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENTITLEMENT GRAPH — Complex permission relationship management
// ═══════════════════════════════════════════════════════════════════════════════

interface EntitlementNode {
  id: string;
  type: 'role' | 'permission' | 'resource' | 'action';
  name: string;
  metadata?: Record<string, unknown>;
}

interface EntitlementEdge {
  from: string;
  to: string;
  relation: 'has' | 'grants' | 'inherits' | 'requires';
  conditions?: Record<string, unknown>;
}

interface AccessCheckResult {
  allowed: boolean;
  path: string[];
  reason: string;
  conditions: Record<string, unknown>;
}

export class EntitlementGraph {
  private nodes: Map<string, EntitlementNode> = new Map();
  private edges: EntitlementEdge[] = [];

  /** Add a node to the graph */
  addNode(node: EntitlementNode): void {
    this.nodes.set(node.id, node);
  }

  /** Add an edge (relationship) */
  addEdge(edge: EntitlementEdge): void {
    if (this.nodes.has(edge.from) && this.nodes.has(edge.to)) {
      this.edges.push(edge);
    }
  }

  /** Check if entity has access to resource */
  checkAccess(entityId: string, resourceId: string, action: string): AccessCheckResult {
    const visited = new Set<string>();
    const path: string[] = [];

    const result = this.traverse(entityId, resourceId, action, visited, path);
    
    return {
      allowed: result.found,
      path: result.path,
      reason: result.found 
        ? `Access granted via: ${result.path.join(' → ')}`
        : 'No valid access path found',
      conditions: result.conditions,
    };
  }

  private traverse(
    current: string, 
    target: string, 
    action: string,
    visited: Set<string>,
    path: string[]
  ): { found: boolean; path: string[]; conditions: Record<string, unknown> } {
    if (visited.has(current)) {
      return { found: false, path: [], conditions: {} };
    }

    visited.add(current);
    path.push(current);

    // Check if we've reached the target
    if (current === target) {
      return { found: true, path: [...path], conditions: {} };
    }

    // Check action on current node
    const actionEdges = this.edges.filter(e => 
      e.from === current && 
      e.to === action && 
      e.relation === 'grants'
    );
    
    if (actionEdges.length > 0) {
      // Check if action applies to target
      const targetEdges = this.edges.filter(e =>
        (e.from === action || e.from === current) &&
        e.to === target
      );
      
      if (targetEdges.length > 0) {
        path.push(action, target);
        return { 
          found: true, 
          path: [...path], 
          conditions: targetEdges[0].conditions || {} 
        };
      }
    }

    // Follow inheritance and grants edges
    const outEdges = this.edges.filter(e => 
      e.from === current && 
      (e.relation === 'inherits' || e.relation === 'has' || e.relation === 'grants')
    );

    for (const edge of outEdges) {
      const result = this.traverse(edge.to, target, action, visited, [...path]);
      if (result.found) {
        return result;
      }
    }

    return { found: false, path: [], conditions: {} };
  }

  /** Get all permissions for an entity */
  getPermissions(entityId: string): string[] {
    const permissions = new Set<string>();
    const visited = new Set<string>();

    const collect = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = this.nodes.get(nodeId);
      if (node?.type === 'permission') {
        permissions.add(nodeId);
      }

      const outEdges = this.edges.filter(e => 
        e.from === nodeId && 
        (e.relation === 'inherits' || e.relation === 'has' || e.relation === 'grants')
      );

      for (const edge of outEdges) {
        collect(edge.to);
      }
    };

    collect(entityId);
    return Array.from(permissions);
  }

  /** Visualize the graph */
  visualize(): { nodes: EntitlementNode[]; edges: EntitlementEdge[] } {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: [...this.edges],
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUOTA PREDICTOR — Usage forecasting and limit management
// ═══════════════════════════════════════════════════════════════════════════════

interface QuotaConfig {
  resourceId: string;
  limit: number;
  period: 'hour' | 'day' | 'month';
  burstAllowed: number;  // Temporary overage allowed
}

interface UsageRecord {
  resourceId: string;
  amount: number;
  timestamp: number;
}

interface QuotaPrediction {
  resourceId: string;
  currentUsage: number;
  predictedUsage: number;
  limit: number;
  percentUsed: number;
  willExceed: boolean;
  timeToLimit: number;  // minutes
  recommendation: string;
}

export class QuotaPredictor {
  private quotas: Map<string, QuotaConfig> = new Map();
  private usage: UsageRecord[] = [];

  /** Set quota for a resource */
  setQuota(config: QuotaConfig): void {
    this.quotas.set(config.resourceId, config);
  }

  /** Record resource usage */
  recordUsage(resourceId: string, amount: number): void {
    this.usage.push({
      resourceId,
      amount,
      timestamp: Date.now(),
    });

    // Keep last 10000 records
    if (this.usage.length > 10000) {
      this.usage.shift();
    }
  }

  /** Predict quota usage */
  predict(resourceId: string): QuotaPrediction | null {
    const quota = this.quotas.get(resourceId);
    if (!quota) return null;

    const periodMs = this.getPeriodMs(quota.period);
    const now = Date.now();
    const periodStart = now - periodMs;

    // Get current period usage
    const currentUsage = this.usage
      .filter(u => u.resourceId === resourceId && u.timestamp >= periodStart)
      .reduce((sum, u) => sum + u.amount, 0);

    // Calculate usage rate (per minute)
    const usageInWindow = this.usage
      .filter(u => u.resourceId === resourceId && u.timestamp >= now - 3600000); // Last hour
    
    const usageRate = usageInWindow.length > 0
      ? usageInWindow.reduce((sum, u) => sum + u.amount, 0) / 60
      : 0;

    // Predict end-of-period usage
    const remainingMinutes = periodMs / 60000 - (now - periodStart) / 60000;
    const predictedUsage = currentUsage + (usageRate * remainingMinutes);

    // Time to limit
    const remainingQuota = quota.limit - currentUsage;
    const timeToLimit = usageRate > 0 ? remainingQuota / usageRate : Infinity;

    const percentUsed = (currentUsage / quota.limit) * 100;
    const willExceed = predictedUsage > quota.limit;

    return {
      resourceId,
      currentUsage,
      predictedUsage,
      limit: quota.limit,
      percentUsed,
      willExceed,
      timeToLimit,
      recommendation: this.getRecommendation(percentUsed, willExceed, timeToLimit),
    };
  }

  private getPeriodMs(period: QuotaConfig['period']): number {
    switch (period) {
      case 'hour': return 3600000;
      case 'day': return 86400000;
      case 'month': return 30 * 86400000;
    }
  }

  private getRecommendation(percentUsed: number, willExceed: boolean, timeToLimit: number): string {
    if (willExceed && timeToLimit < 60) {
      return 'CRITICAL: Limit will be reached within 1 hour - reduce usage immediately';
    }
    if (willExceed) {
      return 'WARNING: On track to exceed limit - consider usage reduction';
    }
    if (percentUsed > 80) {
      return 'CAUTION: Usage at 80%+ - monitor closely';
    }
    if (percentUsed > 50) {
      return 'Normal usage pattern';
    }
    return 'Healthy usage level';
  }

  /** Check if usage is within quota */
  checkQuota(resourceId: string, requestedAmount: number): { allowed: boolean; reason: string } {
    const prediction = this.predict(resourceId);
    if (!prediction) {
      return { allowed: true, reason: 'No quota configured' };
    }

    const quota = this.quotas.get(resourceId)!;
    const newUsage = prediction.currentUsage + requestedAmount;

    if (newUsage > quota.limit + quota.burstAllowed) {
      return { allowed: false, reason: `Would exceed quota (${newUsage}/${quota.limit})` };
    }

    if (newUsage > quota.limit) {
      return { allowed: true, reason: `Within burst allowance (${newUsage}/${quota.limit + quota.burstAllowed})` };
    }

    return { allowed: true, reason: 'Within quota' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT TRAIL — Immutable action logging with search
// ═══════════════════════════════════════════════════════════════════════════════

interface AuditEntry {
  id: string;
  timestamp: number;
  actor: string;
  action: string;
  resource: string;
  outcome: 'success' | 'failure' | 'denied';
  details?: Record<string, unknown>;
  ip?: string;
  sessionId?: string;
  checksum?: string;
}

interface AuditQuery {
  actor?: string;
  action?: string;
  resource?: string;
  outcome?: AuditEntry['outcome'];
  from?: number;
  to?: number;
  limit?: number;
}

interface AuditStats {
  totalEntries: number;
  byOutcome: Record<string, number>;
  byActor: Record<string, number>;
  recentActivity: number;  // Last hour
}

export class AuditTrail {
  private entries: AuditEntry[] = [];
  private maxEntries: number = 100000;

  /** Log an audit entry */
  log(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'checksum'>): string {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    
    // Calculate checksum of previous entry for chain integrity
    const prevChecksum = this.entries.length > 0 
      ? this.entries[this.entries.length - 1].checksum 
      : 'genesis';

    const fullEntry: AuditEntry = {
      id,
      timestamp,
      ...entry,
      checksum: this.calculateChecksum(id, timestamp, prevChecksum || '', entry),
    };

    this.entries.push(fullEntry);

    // Prune old entries (keeping them for compliance would use external storage)
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    return id;
  }

  private calculateChecksum(
    id: string, 
    timestamp: number, 
    prevChecksum: string,
    entry: Omit<AuditEntry, 'id' | 'timestamp' | 'checksum'>
  ): string {
    // Simple hash for demo - in production use crypto
    const data = `${id}|${timestamp}|${prevChecksum}|${JSON.stringify(entry)}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /** Query audit trail */
  query(query: AuditQuery): AuditEntry[] {
    let results = [...this.entries];

    if (query.actor) {
      results = results.filter(e => e.actor === query.actor);
    }
    if (query.action) {
      results = results.filter(e => e.action === query.action);
    }
    if (query.resource) {
      results = results.filter(e => e.resource === query.resource);
    }
    if (query.outcome) {
      results = results.filter(e => e.outcome === query.outcome);
    }
    if (query.from) {
      results = results.filter(e => e.timestamp >= query.from!);
    }
    if (query.to) {
      results = results.filter(e => e.timestamp <= query.to!);
    }

    // Sort by timestamp descending
    results.sort((a, b) => b.timestamp - a.timestamp);

    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /** Verify chain integrity */
  verifyIntegrity(): { valid: boolean; brokenAt?: string } {
    for (let i = 1; i < this.entries.length; i++) {
      const current = this.entries[i];
      const previous = this.entries[i - 1];
      
      const expectedChecksum = this.calculateChecksum(
        current.id,
        current.timestamp,
        previous.checksum || '',
        {
          actor: current.actor,
          action: current.action,
          resource: current.resource,
          outcome: current.outcome,
          details: current.details,
          ip: current.ip,
          sessionId: current.sessionId,
        }
      );

      if (current.checksum !== expectedChecksum) {
        return { valid: false, brokenAt: current.id };
      }
    }

    return { valid: true };
  }

  /** Get audit statistics */
  getStats(): AuditStats {
    const byOutcome: Record<string, number> = {};
    const byActor: Record<string, number> = {};
    const hourAgo = Date.now() - 3600000;
    let recentActivity = 0;

    for (const entry of this.entries) {
      byOutcome[entry.outcome] = (byOutcome[entry.outcome] || 0) + 1;
      byActor[entry.actor] = (byActor[entry.actor] || 0) + 1;
      if (entry.timestamp >= hourAgo) recentActivity++;
    }

    return {
      totalEntries: this.entries.length,
      byOutcome,
      byActor,
      recentActivity,
    };
  }

  /** Export entries for compliance */
  export(from: number, to: number): AuditEntry[] {
    return this.entries.filter(e => e.timestamp >= from && e.timestamp <= to);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const accessEnhancements = {
  EntitlementGraph,
  QuotaPredictor,
  AuditTrail,
};

export type {
  EntitlementNode,
  EntitlementEdge,
  AccessCheckResult,
  QuotaConfig,
  UsageRecord,
  QuotaPrediction,
  AuditEntry,
  AuditQuery,
  AuditStats,
};
