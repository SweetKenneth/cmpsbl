/**
 * SYSTEM Module Enhancements — v7.5.0 SYNERGY Epoch
 * ResourceProfiler, DependencyGraph, SelfHealOrchestrator, BackupIntegrity
 */

// ═══════════════════════════════════════════════════════════════════════════════
// RESOURCE PROFILER — EMA-based CPU/Memory tracking with recommendations
// ═══════════════════════════════════════════════════════════════════════════════

interface ResourceSnapshot {
  timestamp: number;
  cpu: number;        // 0-100
  memory: number;     // 0-100
  disk: number;       // 0-100
  network: number;    // MB/s
}

interface ResourceProfile {
  currentCpu: number;
  currentMemory: number;
  emaCpu: number;
  emaMemory: number;
  peakCpu: number;
  peakMemory: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  recommendations: string[];
}

export class ResourceProfiler {
  private history: ResourceSnapshot[] = [];
  private emaCpu: number = 0;
  private emaMemory: number = 0;
  private alpha: number = 0.2; // EMA smoothing factor

  /** Record a resource snapshot */
  record(snapshot: Omit<ResourceSnapshot, 'timestamp'>): void {
    const fullSnapshot: ResourceSnapshot = {
      ...snapshot,
      timestamp: Date.now(),
    };

    this.history.push(fullSnapshot);
    if (this.history.length > 1000) {
      this.history.shift();
    }

    // Update EMA
    this.emaCpu = this.alpha * snapshot.cpu + (1 - this.alpha) * this.emaCpu;
    this.emaMemory = this.alpha * snapshot.memory + (1 - this.alpha) * this.emaMemory;
  }

  /** Get current resource profile */
  getProfile(): ResourceProfile {
    const recent = this.history.slice(-100);
    const current = recent[recent.length - 1] || { cpu: 0, memory: 0 };

    // Calculate peaks
    const peakCpu = Math.max(...recent.map(s => s.cpu), 0);
    const peakMemory = Math.max(...recent.map(s => s.memory), 0);

    // Calculate trend
    let trend: ResourceProfile['trend'] = 'stable';
    if (recent.length >= 10) {
      const oldAvg = recent.slice(0, 5).reduce((a, b) => a + b.cpu + b.memory, 0) / 10;
      const newAvg = recent.slice(-5).reduce((a, b) => a + b.cpu + b.memory, 0) / 10;
      if (newAvg > oldAvg * 1.1) trend = 'increasing';
      else if (newAvg < oldAvg * 0.9) trend = 'decreasing';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(current.cpu, current.memory, peakCpu, peakMemory);

    return {
      currentCpu: current.cpu,
      currentMemory: current.memory,
      emaCpu: this.emaCpu,
      emaMemory: this.emaMemory,
      peakCpu,
      peakMemory,
      trend,
      recommendations,
    };
  }

  private generateRecommendations(cpu: number, memory: number, peakCpu: number, peakMemory: number): string[] {
    const recommendations: string[] = [];

    if (cpu > 80) {
      recommendations.push('High CPU: Consider scaling compute resources');
    }
    if (memory > 85) {
      recommendations.push('High memory: Investigate memory leaks or increase RAM');
    }
    if (peakCpu > 95 && cpu < 50) {
      recommendations.push('CPU spikes detected: Implement request queuing');
    }
    if (peakMemory > 95 && memory < 50) {
      recommendations.push('Memory spikes: Consider implementing memory pooling');
    }

    if (recommendations.length === 0) {
      recommendations.push('Resources within normal parameters');
    }

    return recommendations;
  }

  /** Get resource utilization summary */
  getSummary(): { avgCpu: number; avgMemory: number; healthScore: number } {
    const recent = this.history.slice(-100);
    if (recent.length === 0) {
      return { avgCpu: 0, avgMemory: 0, healthScore: 100 };
    }

    const avgCpu = recent.reduce((a, b) => a + b.cpu, 0) / recent.length;
    const avgMemory = recent.reduce((a, b) => a + b.memory, 0) / recent.length;
    
    // Health score decreases with high utilization
    const healthScore = Math.max(0, 100 - (avgCpu * 0.5 + avgMemory * 0.5));

    return { avgCpu, avgMemory, healthScore };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEPENDENCY GRAPH — Single point of failure analysis
// ═══════════════════════════════════════════════════════════════════════════════

interface DependencyNode {
  id: string;
  name: string;
  type: 'service' | 'database' | 'api' | 'cache' | 'queue';
  critical: boolean;
  dependencies: string[];
  dependents: string[];
}

interface SPOFAnalysis {
  spofs: string[];
  riskScore: number;
  recommendations: string[];
  impactMap: Map<string, string[]>;
}

export class DependencyGraph {
  private nodes: Map<string, DependencyNode> = new Map();

  /** Add a node to the graph */
  addNode(id: string, name: string, type: DependencyNode['type'], critical: boolean = false): void {
    this.nodes.set(id, {
      id,
      name,
      type,
      critical,
      dependencies: [],
      dependents: [],
    });
  }

  /** Add a dependency relationship */
  addDependency(fromId: string, toId: string): void {
    const from = this.nodes.get(fromId);
    const to = this.nodes.get(toId);

    if (from && to) {
      if (!from.dependencies.includes(toId)) {
        from.dependencies.push(toId);
      }
      if (!to.dependents.includes(fromId)) {
        to.dependents.push(fromId);
      }
    }
  }

  /** Analyze for single points of failure */
  analyzeSPOF(): SPOFAnalysis {
    const spofs: string[] = [];
    const impactMap = new Map<string, string[]>();

    for (const [id, node] of this.nodes.entries()) {
      // A SPOF has multiple dependents and is either critical or has no redundancy
      const dependentCount = node.dependents.length;
      const isBottleneck = dependentCount >= 3;
      const affectedServices = this.getTransitiveDependents(id);

      if (isBottleneck || node.critical) {
        spofs.push(id);
        impactMap.set(id, affectedServices);
      }
    }

    // Calculate risk score (0-100)
    const criticalSpofs = spofs.filter(id => this.nodes.get(id)?.critical);
    const riskScore = Math.min(100, 
      (spofs.length * 10) + 
      (criticalSpofs.length * 20) +
      (this.hasCircularDependency() ? 20 : 0)
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(spofs, criticalSpofs);

    return {
      spofs,
      riskScore,
      recommendations,
      impactMap,
    };
  }

  /** Get all services that transitively depend on a node */
  private getTransitiveDependents(nodeId: string, visited: Set<string> = new Set()): string[] {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);

    const node = this.nodes.get(nodeId);
    if (!node) return [];

    const result: string[] = [...node.dependents];
    for (const dependentId of node.dependents) {
      result.push(...this.getTransitiveDependents(dependentId, visited));
    }

    return [...new Set(result)];
  }

  /** Check for circular dependencies */
  private hasCircularDependency(): boolean {
    const visited = new Set<string>();
    const stack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (stack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      stack.add(nodeId);

      const node = this.nodes.get(nodeId);
      if (node) {
        for (const depId of node.dependencies) {
          if (dfs(depId)) return true;
        }
      }

      stack.delete(nodeId);
      return false;
    };

    for (const id of this.nodes.keys()) {
      if (dfs(id)) return true;
    }

    return false;
  }

  private generateRecommendations(spofs: string[], criticalSpofs: string[]): string[] {
    const recommendations: string[] = [];

    if (criticalSpofs.length > 0) {
      recommendations.push(`Add redundancy for critical SPOFs: ${criticalSpofs.join(', ')}`);
    }

    if (spofs.length > 3) {
      recommendations.push('Architecture review recommended - too many single points of failure');
    }

    for (const spof of spofs.slice(0, 3)) {
      const node = this.nodes.get(spof);
      if (node?.type === 'database') {
        recommendations.push(`Consider read replicas for ${node.name}`);
      } else if (node?.type === 'api') {
        recommendations.push(`Implement load balancing for ${node.name}`);
      }
    }

    return recommendations;
  }

  /** Get visual representation of the graph */
  visualize(): { nodes: DependencyNode[]; edges: Array<{ from: string; to: string }> } {
    const edges: Array<{ from: string; to: string }> = [];
    
    for (const node of this.nodes.values()) {
      for (const depId of node.dependencies) {
        edges.push({ from: node.id, to: depId });
      }
    }

    return {
      nodes: Array.from(this.nodes.values()),
      edges,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SELF-HEAL ORCHESTRATOR — Automated recovery coordination
// ═══════════════════════════════════════════════════════════════════════════════

interface HealingAction {
  id: string;
  target: string;
  action: 'restart' | 'scale' | 'failover' | 'purge_cache' | 'rollback';
  status: 'pending' | 'executing' | 'completed' | 'failed';
  triggeredBy: string;
  startedAt: number;
  completedAt?: number;
  result?: string;
}

interface HealingRule {
  name: string;
  condition: (metrics: Record<string, number>) => boolean;
  action: HealingAction['action'];
  target: string;
  cooldown: number; // ms between executions
}

export class SelfHealOrchestrator {
  private rules: HealingRule[] = [];
  private actions: HealingAction[] = [];
  private lastExecuted: Map<string, number> = new Map();

  /** Register a healing rule */
  registerRule(rule: HealingRule): void {
    this.rules.push(rule);
  }

  /** Evaluate rules and trigger healing actions */
  evaluate(metrics: Record<string, number>): HealingAction[] {
    const triggeredActions: HealingAction[] = [];
    const now = Date.now();

    for (const rule of this.rules) {
      const lastRun = this.lastExecuted.get(rule.name) || 0;
      if (now - lastRun < rule.cooldown) continue;

      if (rule.condition(metrics)) {
        const action: HealingAction = {
          id: `heal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          target: rule.target,
          action: rule.action,
          status: 'pending',
          triggeredBy: rule.name,
          startedAt: now,
        };

        this.actions.push(action);
        triggeredActions.push(action);
        this.lastExecuted.set(rule.name, now);
      }
    }

    return triggeredActions;
  }

  /** Execute a healing action */
  async execute(actionId: string): Promise<HealingAction | null> {
    const action = this.actions.find(a => a.id === actionId);
    if (!action) return null;

    action.status = 'executing';

    try {
      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      action.status = 'completed';
      action.completedAt = Date.now();
      action.result = `Successfully executed ${action.action} on ${action.target}`;
    } catch (error) {
      action.status = 'failed';
      action.completedAt = Date.now();
      action.result = error instanceof Error ? error.message : 'Unknown error';
    }

    return action;
  }

  /** Get action history */
  getHistory(limit: number = 50): HealingAction[] {
    return this.actions.slice(-limit).reverse();
  }

  /** Get active (pending/executing) actions */
  getActiveActions(): HealingAction[] {
    return this.actions.filter(a => a.status === 'pending' || a.status === 'executing');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACKUP INTEGRITY — Backup verification and management
// ═══════════════════════════════════════════════════════════════════════════════

interface BackupRecord {
  id: string;
  name: string;
  timestamp: number;
  size: number;            // bytes
  checksum: string;
  verified: boolean;
  lastVerified?: number;
  type: 'full' | 'incremental' | 'snapshot';
}

interface IntegrityResult {
  backupId: string;
  valid: boolean;
  checksumMatch: boolean;
  ageHours: number;
  recommendation: string;
}

export class BackupIntegrity {
  private backups: Map<string, BackupRecord> = new Map();
  private maxAge: number = 7 * 24 * 60 * 60 * 1000; // 7 days

  /** Register a backup */
  registerBackup(name: string, size: number, checksum: string, type: BackupRecord['type']): string {
    const id = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.backups.set(id, {
      id,
      name,
      timestamp: Date.now(),
      size,
      checksum,
      verified: false,
      type,
    });

    return id;
  }

  /** Verify a backup's integrity */
  verify(backupId: string, currentChecksum: string): IntegrityResult {
    const backup = this.backups.get(backupId);
    
    if (!backup) {
      return {
        backupId,
        valid: false,
        checksumMatch: false,
        ageHours: 0,
        recommendation: 'Backup not found',
      };
    }

    const ageHours = (Date.now() - backup.timestamp) / 3600000;
    const checksumMatch = backup.checksum === currentChecksum;
    const isRecent = ageHours < this.maxAge / 3600000;
    const valid = checksumMatch && isRecent;

    backup.verified = valid;
    backup.lastVerified = Date.now();

    let recommendation = 'Backup is valid';
    if (!checksumMatch) recommendation = 'CRITICAL: Backup corrupted - create new backup immediately';
    else if (!isRecent) recommendation = 'Backup is stale - create fresh backup';

    return {
      backupId,
      valid,
      checksumMatch,
      ageHours,
      recommendation,
    };
  }

  /** Get backup health summary */
  getHealthSummary(): {
    totalBackups: number;
    verifiedBackups: number;
    staleBackups: number;
    healthScore: number;
    oldestBackupHours: number;
    newestBackupHours: number;
  } {
    const now = Date.now();
    const backupsList = Array.from(this.backups.values());

    if (backupsList.length === 0) {
      return {
        totalBackups: 0,
        verifiedBackups: 0,
        staleBackups: 0,
        healthScore: 0,
        oldestBackupHours: 0,
        newestBackupHours: 0,
      };
    }

    const verified = backupsList.filter(b => b.verified).length;
    const stale = backupsList.filter(b => now - b.timestamp > this.maxAge).length;
    const ages = backupsList.map(b => (now - b.timestamp) / 3600000);

    // Health score based on verified ratio and staleness
    const healthScore = Math.max(0, 
      (verified / backupsList.length) * 50 +
      ((backupsList.length - stale) / backupsList.length) * 50
    );

    return {
      totalBackups: backupsList.length,
      verifiedBackups: verified,
      staleBackups: stale,
      healthScore,
      oldestBackupHours: Math.max(...ages),
      newestBackupHours: Math.min(...ages),
    };
  }

  /** Get recommended backup actions */
  getRecommendations(): string[] {
    const summary = this.getHealthSummary();
    const recommendations: string[] = [];

    if (summary.totalBackups === 0) {
      recommendations.push('CRITICAL: No backups exist - create backup immediately');
    } else {
      if (summary.newestBackupHours > 24) {
        recommendations.push('Create new backup - most recent is over 24 hours old');
      }
      if (summary.staleBackups > 0) {
        recommendations.push(`Remove ${summary.staleBackups} stale backup(s)`);
      }
      if (summary.verifiedBackups < summary.totalBackups) {
        recommendations.push('Verify all unverified backups');
      }
    }

    return recommendations;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const systemEnhancements = {
  ResourceProfiler,
  DependencyGraph,
  SelfHealOrchestrator,
  BackupIntegrity,
};

export type {
  ResourceSnapshot,
  ResourceProfile,
  DependencyNode,
  SPOFAnalysis,
  HealingAction,
  HealingRule,
  BackupRecord,
  IntegrityResult,
};
