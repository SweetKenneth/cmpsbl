/**
 * CORTEX Module Enhancements
 * PipelineScheduler, MultiAgentCoordinator, GoalDecomposer, DecisionGovernor
 */

// ═══════════════════════════════════════════════════════════════════════════════
// PIPELINE SCHEDULER — Autonomous synergy execution scheduling
// ═══════════════════════════════════════════════════════════════════════════════

interface ScheduledPipeline {
  id: string;
  name: string;
  cron: string;            // Cron expression
  lastRun?: number;
  nextRun: number;
  enabled: boolean;
  priority: number;
  config: Record<string, unknown>;
}

interface SchedulerStats {
  totalScheduled: number;
  pending: number;
  completed: number;
  failed: number;
  avgExecutionTime: number;
}

export class PipelineScheduler {
  private pipelines: Map<string, ScheduledPipeline> = new Map();
  private executionHistory: Array<{ id: string; success: boolean; duration: number; timestamp: number }> = [];

  /** Schedule a pipeline */
  schedule(name: string, cron: string, priority: number = 1, config: Record<string, unknown> = {}): string {
    const id = `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.pipelines.set(id, {
      id,
      name,
      cron,
      nextRun: this.calculateNextRun(cron),
      enabled: true,
      priority,
      config,
    });

    return id;
  }

  /** Get pipelines due for execution */
  getDuePipelines(): ScheduledPipeline[] {
    const now = Date.now();
    
    return Array.from(this.pipelines.values())
      .filter(p => p.enabled && p.nextRun <= now)
      .sort((a, b) => b.priority - a.priority);
  }

  /** Mark pipeline as executed */
  markExecuted(id: string, success: boolean, duration: number): void {
    const pipeline = this.pipelines.get(id);
    if (!pipeline) return;

    pipeline.lastRun = Date.now();
    pipeline.nextRun = this.calculateNextRun(pipeline.cron);

    this.executionHistory.push({
      id,
      success,
      duration,
      timestamp: Date.now(),
    });

    if (this.executionHistory.length > 1000) {
      this.executionHistory.shift();
    }
  }

  /** Enable/disable a pipeline */
  setEnabled(id: string, enabled: boolean): void {
    const pipeline = this.pipelines.get(id);
    if (pipeline) {
      pipeline.enabled = enabled;
      if (enabled) {
        pipeline.nextRun = this.calculateNextRun(pipeline.cron);
      }
    }
  }

  /** Get scheduler statistics */
  getStats(): SchedulerStats {
    const history = this.executionHistory.slice(-100);
    const successful = history.filter(e => e.success);
    
    return {
      totalScheduled: this.pipelines.size,
      pending: this.getDuePipelines().length,
      completed: successful.length,
      failed: history.length - successful.length,
      avgExecutionTime: history.length > 0 
        ? history.reduce((a, b) => a + b.duration, 0) / history.length 
        : 0,
    };
  }

  private calculateNextRun(cron: string): number {
    // Simplified cron parsing - in production use a proper cron library
    const parts = cron.split(' ');
    const now = new Date();
    
    // Default: run every hour
    if (parts[0] === '0' && parts[1] === '*') {
      const next = new Date(now);
      next.setMinutes(0, 0, 0);
      next.setHours(next.getHours() + 1);
      return next.getTime();
    }
    
    // Run every day at midnight
    if (parts[0] === '0' && parts[1] === '0') {
      const next = new Date(now);
      next.setHours(0, 0, 0, 0);
      next.setDate(next.getDate() + 1);
      return next.getTime();
    }

    // Default: 1 hour from now
    return now.getTime() + 3600000;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MULTI-AGENT COORDINATOR — Goal decomposition and parallel routing
// ═══════════════════════════════════════════════════════════════════════════════

interface AgentCapability {
  agentId: string;
  skills: string[];
  maxConcurrent: number;
  currentLoad: number;
  latency: number;        // avg ms
  successRate: number;    // 0-1
}

interface Task {
  id: string;
  skill: string;
  priority: number;
  payload: unknown;
  assignedAgent?: string;
  status: 'pending' | 'assigned' | 'executing' | 'completed' | 'failed';
}

interface CoordinationResult {
  taskId: string;
  assignedAgent: string;
  estimatedCompletion: number;
  confidence: number;
}

export class MultiAgentCoordinator {
  private agents: Map<string, AgentCapability> = new Map();
  private tasks: Map<string, Task> = new Map();

  /** Register an agent with capabilities */
  registerAgent(agentId: string, skills: string[], maxConcurrent: number = 5): void {
    this.agents.set(agentId, {
      agentId,
      skills,
      maxConcurrent,
      currentLoad: 0,
      latency: 100,
      successRate: 1.0,
    });
  }

  /** Update agent metrics */
  updateAgentMetrics(agentId: string, latency: number, success: boolean): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    // EMA for latency
    agent.latency = agent.latency * 0.7 + latency * 0.3;
    
    // Update success rate
    agent.successRate = success 
      ? Math.min(1, agent.successRate + 0.01)
      : Math.max(0, agent.successRate - 0.1);
  }

  /** Submit a task for coordination */
  submitTask(skill: string, priority: number, payload: unknown): CoordinationResult | null {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: Task = {
      id,
      skill,
      priority,
      payload,
      status: 'pending',
    };
    
    this.tasks.set(id, task);

    // Find best agent
    const agent = this.findBestAgent(skill);
    if (!agent) {
      return null;
    }

    task.assignedAgent = agent.agentId;
    task.status = 'assigned';
    agent.currentLoad++;

    return {
      taskId: id,
      assignedAgent: agent.agentId,
      estimatedCompletion: agent.latency * 1.5,
      confidence: agent.successRate,
    };
  }

  /** Find best agent for a skill */
  private findBestAgent(skill: string): AgentCapability | null {
    const capable = Array.from(this.agents.values())
      .filter(a => a.skills.includes(skill) && a.currentLoad < a.maxConcurrent);

    if (capable.length === 0) return null;

    // Score: lower load + lower latency + higher success rate
    return capable.sort((a, b) => {
      const scoreA = (1 - a.currentLoad / a.maxConcurrent) * a.successRate / a.latency;
      const scoreB = (1 - b.currentLoad / b.maxConcurrent) * b.successRate / b.latency;
      return scoreB - scoreA;
    })[0];
  }

  /** Mark task as completed */
  completeTask(taskId: string, success: boolean, duration: number): void {
    const task = this.tasks.get(taskId);
    if (!task || !task.assignedAgent) return;

    task.status = success ? 'completed' : 'failed';
    
    const agent = this.agents.get(task.assignedAgent);
    if (agent) {
      agent.currentLoad = Math.max(0, agent.currentLoad - 1);
      this.updateAgentMetrics(agent.agentId, duration, success);
    }
  }

  /** Get coordination overview */
  getOverview(): {
    agents: number;
    pendingTasks: number;
    executingTasks: number;
    totalCapacity: number;
    utilization: number;
  } {
    const agents = Array.from(this.agents.values());
    const totalCapacity = agents.reduce((a, b) => a + b.maxConcurrent, 0);
    const currentLoad = agents.reduce((a, b) => a + b.currentLoad, 0);

    return {
      agents: agents.length,
      pendingTasks: Array.from(this.tasks.values()).filter(t => t.status === 'pending').length,
      executingTasks: currentLoad,
      totalCapacity,
      utilization: totalCapacity > 0 ? currentLoad / totalCapacity : 0,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOAL DECOMPOSER — Hierarchical goal breakdown
// ═══════════════════════════════════════════════════════════════════════════════

interface Goal {
  id: string;
  description: string;
  priority: number;
  deadline?: number;
  status: 'pending' | 'active' | 'completed' | 'blocked';
  subgoals: string[];
  parentId?: string;
  dependencies: string[];
  requiredSkills: string[];
}

interface DecompositionResult {
  originalGoal: string;
  subgoals: Goal[];
  estimatedEffort: number;
  parallelizable: boolean;
  criticalPath: string[];
}

export class GoalDecomposer {
  private goals: Map<string, Goal> = new Map();

  /** Create a new goal */
  createGoal(description: string, priority: number, deadline?: number, requiredSkills: string[] = []): string {
    const id = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.goals.set(id, {
      id,
      description,
      priority,
      deadline,
      status: 'pending',
      subgoals: [],
      dependencies: [],
      requiredSkills,
    });

    return id;
  }

  /** Decompose a goal into subgoals */
  decompose(goalId: string, subgoalDescriptions: Array<{
    description: string;
    priority?: number;
    dependencies?: string[];
    requiredSkills?: string[];
  }>): DecompositionResult | null {
    const goal = this.goals.get(goalId);
    if (!goal) return null;

    const subgoals: Goal[] = [];

    for (const sg of subgoalDescriptions) {
      const subId = this.createGoal(
        sg.description,
        sg.priority || goal.priority,
        goal.deadline,
        sg.requiredSkills || []
      );
      
      const subgoal = this.goals.get(subId)!;
      subgoal.parentId = goalId;
      subgoal.dependencies = sg.dependencies || [];
      
      goal.subgoals.push(subId);
      subgoals.push(subgoal);
    }

    // Calculate parallelizability
    const hasSequentialDeps = subgoals.some(sg => sg.dependencies.length > 0);
    
    // Find critical path (longest dependency chain)
    const criticalPath = this.findCriticalPath(subgoals);

    return {
      originalGoal: goalId,
      subgoals,
      estimatedEffort: subgoals.length * 100, // Simplified estimate
      parallelizable: !hasSequentialDeps,
      criticalPath: criticalPath.map(g => g.id),
    };
  }

  /** Get next actionable goals */
  getActionableGoals(): Goal[] {
    return Array.from(this.goals.values())
      .filter(g => {
        if (g.status !== 'pending' && g.status !== 'active') return false;
        if (g.subgoals.length > 0) return false; // Has subgoals, not directly actionable
        
        // Check dependencies are complete
        return g.dependencies.every(depId => {
          const dep = this.goals.get(depId);
          return dep?.status === 'completed';
        });
      })
      .sort((a, b) => b.priority - a.priority);
  }

  /** Mark goal complete */
  completeGoal(goalId: string): void {
    const goal = this.goals.get(goalId);
    if (!goal) return;

    goal.status = 'completed';

    // Check if parent can be completed
    if (goal.parentId) {
      const parent = this.goals.get(goal.parentId);
      if (parent) {
        const allComplete = parent.subgoals.every(sgId => 
          this.goals.get(sgId)?.status === 'completed'
        );
        if (allComplete) {
          parent.status = 'completed';
        }
      }
    }
  }

  private findCriticalPath(goals: Goal[]): Goal[] {
    // Simple BFS to find longest path
    const path: Goal[] = [];
    const noDepGoals = goals.filter(g => g.dependencies.length === 0);
    
    if (noDepGoals.length > 0) {
      path.push(noDepGoals[0]);
    }

    // Follow dependency chain
    let current = path[0];
    while (current) {
      const dependents = goals.filter(g => g.dependencies.includes(current.id));
      if (dependents.length > 0) {
        path.push(dependents[0]);
        current = dependents[0];
      } else {
        break;
      }
    }

    return path;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DECISION GOVERNOR — Confidence-based auto-approval
// ═══════════════════════════════════════════════════════════════════════════════

interface Decision {
  id: string;
  type: string;
  description: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  impact: string[];
  status: 'pending' | 'auto_approved' | 'approved' | 'rejected' | 'escalated';
  decidedAt?: number;
  decidedBy?: string;
}

interface GovernancePolicy {
  type: string;
  autoApproveThreshold: number;
  requireHumanAbove: 'medium' | 'high' | 'critical';
  maxAutoApprovalsPerHour: number;
}

export class DecisionGovernor {
  private decisions: Map<string, Decision> = new Map();
  private policies: Map<string, GovernancePolicy> = new Map();
  private autoApprovalCounts: Map<string, number[]> = new Map();

  /** Register a governance policy */
  registerPolicy(policy: GovernancePolicy): void {
    this.policies.set(policy.type, policy);
  }

  /** Submit a decision for governance */
  submit(type: string, description: string, confidence: number, riskLevel: Decision['riskLevel'], impact: string[]): Decision {
    const id = `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const decision: Decision = {
      id,
      type,
      description,
      confidence,
      riskLevel,
      impact,
      status: 'pending',
    };

    this.decisions.set(id, decision);

    // Auto-evaluate
    this.evaluate(decision);

    return decision;
  }

  /** Evaluate a decision against policies */
  private evaluate(decision: Decision): void {
    const policy = this.policies.get(decision.type);
    
    if (!policy) {
      decision.status = 'escalated';
      return;
    }

    const riskLevels: Decision['riskLevel'][] = ['low', 'medium', 'high', 'critical'];
    const decisionRiskIdx = riskLevels.indexOf(decision.riskLevel);
    const thresholdRiskIdx = riskLevels.indexOf(policy.requireHumanAbove);

    // Check if risk level requires human approval
    if (decisionRiskIdx >= thresholdRiskIdx) {
      decision.status = 'escalated';
      return;
    }

    // Check confidence threshold
    if (decision.confidence < policy.autoApproveThreshold) {
      decision.status = 'pending';
      return;
    }

    // Check rate limit
    if (!this.checkRateLimit(decision.type, policy.maxAutoApprovalsPerHour)) {
      decision.status = 'pending';
      return;
    }

    // Auto-approve
    decision.status = 'auto_approved';
    decision.decidedAt = Date.now();
    decision.decidedBy = 'system';
    this.recordAutoApproval(decision.type);
  }

  private checkRateLimit(type: string, limit: number): boolean {
    const now = Date.now();
    const hourAgo = now - 3600000;
    const counts = this.autoApprovalCounts.get(type) || [];
    const recentCounts = counts.filter(t => t > hourAgo);
    return recentCounts.length < limit;
  }

  private recordAutoApproval(type: string): void {
    const counts = this.autoApprovalCounts.get(type) || [];
    counts.push(Date.now());
    this.autoApprovalCounts.set(type, counts.slice(-100));
  }

  /** Manually approve/reject a decision */
  decide(decisionId: string, approved: boolean, decidedBy: string): void {
    const decision = this.decisions.get(decisionId);
    if (!decision) return;

    decision.status = approved ? 'approved' : 'rejected';
    decision.decidedAt = Date.now();
    decision.decidedBy = decidedBy;
  }

  /** Get pending decisions requiring human review */
  getPendingDecisions(): Decision[] {
    return Array.from(this.decisions.values())
      .filter(d => d.status === 'pending' || d.status === 'escalated')
      .sort((a, b) => {
        const riskOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      });
  }

  /** Get governance statistics */
  getStats(): {
    total: number;
    autoApproved: number;
    humanApproved: number;
    rejected: number;
    pending: number;
    autoApprovalRate: number;
  } {
    const decisions = Array.from(this.decisions.values());
    const autoApproved = decisions.filter(d => d.status === 'auto_approved').length;
    const humanApproved = decisions.filter(d => d.status === 'approved').length;
    const rejected = decisions.filter(d => d.status === 'rejected').length;
    const pending = decisions.filter(d => d.status === 'pending' || d.status === 'escalated').length;
    const total = decisions.length;

    return {
      total,
      autoApproved,
      humanApproved,
      rejected,
      pending,
      autoApprovalRate: total > 0 ? autoApproved / total : 0,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const cortexEnhancements = {
  PipelineScheduler,
  MultiAgentCoordinator,
  GoalDecomposer,
  DecisionGovernor,
};

export type {
  ScheduledPipeline,
  SchedulerStats,
  AgentCapability,
  Task,
  CoordinationResult,
  Goal,
  DecompositionResult,
  Decision,
  GovernancePolicy,
};
