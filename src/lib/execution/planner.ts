/**
 * Execution Planner — Re-planning and recovery strategies
 */

import { 
  ActionPrimitive, 
  ActionResult, 
  ExecutionPlan, 
  Actions,
  parseActionIntent,
  validatePlan 
} from './actionGrammar';
import { executeAction } from './webActuator';
import { 
  verifyExecution, 
  calculateCredit, 
  determineRecoveryStrategy,
  storeExecutionTrace,
  updateAgentCompetency,
  VerificationResult 
} from './verifier';

export interface PlannerConfig {
  maxRetries: number;
  escalationThreshold: number;
  fallbackEnabled: boolean;
}

const DEFAULT_PLANNER_CONFIG: PlannerConfig = {
  maxRetries: 3,
  escalationThreshold: 3,
  fallbackEnabled: true,
};

export interface ExecutionContext {
  agentId: string;
  taskId: string;
  agencyId: string;
  previousStats?: { successRate: number; attemptCount: number };
}

export interface ExecutionOutcome {
  plan: ExecutionPlan;
  verification: VerificationResult;
  recovery?: 'retry' | 'fallback' | 'escalate' | 'accept';
  finalStatus: 'success' | 'partial' | 'fail' | 'escalated';
  totalDurationMs: number;
}

/**
 * Create an execution plan from a goal
 */
export function createPlan(
  goal: string,
  context: ExecutionContext,
  customActions?: ActionPrimitive[]
): ExecutionPlan {
  const actions = customActions || parseActionIntent(goal);

  // Always add a verify action at the end
  if (!actions.find(a => a.type === 'verify')) {
    actions.push(Actions.verify(goal, null));
  }

  const plan: ExecutionPlan = {
    id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    agentId: context.agentId,
    taskId: context.taskId,
    goalState: goal,
    actions,
    status: 'pending',
    results: [],
    createdAt: new Date().toISOString(),
  };

  return plan;
}

/**
 * Execute a plan with verification and recovery
 */
export async function executePlan(
  plan: ExecutionPlan,
  context: ExecutionContext,
  config: PlannerConfig = DEFAULT_PLANNER_CONFIG,
  onProgress?: (progress: { completed: number; total: number; currentAction: string }) => void
): Promise<ExecutionOutcome> {
  const startTime = Date.now();
  let attemptCount = 0;
  let currentPlan = { ...plan };
  let verification: VerificationResult | null = null;
  let recovery: ExecutionOutcome['recovery'] = undefined;
  let fallbackUsed = false;

  // Validate plan
  const validation = validatePlan(currentPlan);
  if (!validation.valid) {
    return {
      plan: currentPlan,
      verification: {
        status: 'fail',
        goalState: currentPlan.goalState,
        observedState: 'Plan validation failed',
        matchScore: 0,
        evidence: [],
        discrepancies: validation.errors,
        timestamp: new Date().toISOString(),
      },
      finalStatus: 'fail',
      totalDurationMs: Date.now() - startTime,
    };
  }

  // Execute with retry loop
  while (attemptCount < config.maxRetries) {
    attemptCount++;
    currentPlan.status = 'running';
    currentPlan.results = [];

    // Execute each action
    for (let i = 0; i < currentPlan.actions.length; i++) {
      const action = currentPlan.actions[i];
      
      onProgress?.({
        completed: i,
        total: currentPlan.actions.length,
        currentAction: `${action.type}(${action.target})`,
      });

      const result = await executeAction(action);
      currentPlan.results.push(result);

      // If action failed and has fallback, try it
      if (result.status === 'fail' && action.fallbackAction && config.fallbackEnabled) {
        console.log(`[Planner] Primary action failed, trying fallback`);
        const fallbackResult = await executeAction(action.fallbackAction);
        currentPlan.results.push(fallbackResult);
        fallbackUsed = true;
      }
    }

    // Verify execution
    verification = verifyExecution(currentPlan.goalState, currentPlan.results);

    // Determine recovery strategy
    recovery = determineRecoveryStrategy(verification, attemptCount, config.maxRetries);

    if (recovery === 'accept') {
      break;
    }

    if (recovery === 'escalate') {
      console.log(`[Planner] Escalating to human after ${attemptCount} attempts`);
      break;
    }

    if (recovery === 'fallback') {
      console.log(`[Planner] Attempting fallback strategy`);
      currentPlan = createFallbackPlan(currentPlan, verification);
      fallbackUsed = true;
    }

    // retry continues the loop
    console.log(`[Planner] Retry attempt ${attemptCount + 1}`);
  }

  // Finalize
  currentPlan.status = verification?.status === 'success' ? 'success' : 'fail';
  currentPlan.completedAt = new Date().toISOString();

  // Calculate credit
  const credit = calculateCredit(
    context.agentId,
    context.taskId,
    verification!,
    context.previousStats,
    fallbackUsed
  );

  // Store trace and update agent
  await Promise.all([
    storeExecutionTrace(currentPlan, verification!, credit),
    updateAgentCompetency(credit),
  ]);

  const finalStatus: ExecutionOutcome['finalStatus'] = 
    recovery === 'escalate' ? 'escalated' : verification!.status;

  return {
    plan: currentPlan,
    verification: verification!,
    recovery,
    finalStatus,
    totalDurationMs: Date.now() - startTime,
  };
}

/**
 * Create a fallback plan based on failures
 */
function createFallbackPlan(
  originalPlan: ExecutionPlan,
  verification: VerificationResult
): ExecutionPlan {
  // Analyze failures and create alternative actions
  const failedTypes = verification.discrepancies
    .map(d => d.match(/^(\w+)/)?.[1])
    .filter(Boolean);

  const newActions: ActionPrimitive[] = originalPlan.actions.map(action => {
    // If this action type failed, try alternative approach
    if (failedTypes.includes(action.type)) {
      switch (action.type) {
        case 'find':
          // Try different search source
          return {
            ...action,
            params: { 
              ...action.params, 
              source: action.params.source === 'firecrawl' ? 'wikipedia' : 'firecrawl' 
            },
          };
        case 'extract':
          // Try without schema (raw extraction)
          return {
            ...action,
            params: {},
          };
        default:
          return action;
      }
    }
    return action;
  });

  return {
    ...originalPlan,
    id: `${originalPlan.id}_fallback`,
    actions: newActions,
    results: [],
    status: 'pending',
  };
}

/**
 * Execute a simple task (convenience wrapper)
 */
export async function executeSimpleTask(
  goal: string,
  context: ExecutionContext,
  onProgress?: (progress: { completed: number; total: number; currentAction: string }) => void
): Promise<ExecutionOutcome> {
  const plan = createPlan(goal, context);
  return executePlan(plan, context, DEFAULT_PLANNER_CONFIG, onProgress);
}

/**
 * Check if a task is executable
 */
export function isTaskExecutable(taskDescription: string): boolean {
  const lowerDesc = taskDescription.toLowerCase();
  
  // Keywords that indicate executable tasks
  const executablePatterns = [
    'search', 'find', 'look up', 'research',
    'extract', 'scrape', 'get data',
    'analyze', 'audit', 'check',
    'crawl', 'index',
  ];

  return executablePatterns.some(pattern => lowerDesc.includes(pattern));
}

/**
 * Estimate execution time for a task
 */
export function estimateExecutionTime(actions: ActionPrimitive[]): number {
  const baseTimePerAction: Record<string, number> = {
    find: 15000,
    extract: 20000,
    compute: 5000,
    submit: 10000,
    schedule: 1000,
    notify: 1000,
    write: 2000,
    verify: 3000,
  };

  return actions.reduce((total, action) => {
    return total + (baseTimePerAction[action.type] || 10000);
  }, 0);
}
