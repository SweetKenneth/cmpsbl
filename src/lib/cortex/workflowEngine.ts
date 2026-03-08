 /**
  * CORTEX Workflow Engine
  * v7.5.0 — Multi-step cross-module workflow orchestration
  */
 
 import type { SubstrateModule } from '../substrate';
 
 // Workflow definition
 export interface WorkflowDefinition {
   id: string;
   name: string;
   description: string;
   steps: WorkflowStep[];
   triggers: WorkflowTrigger[];
   timeout: number;
   retryPolicy: RetryPolicy;
   createdAt: string;
 }
 
 // Workflow step
 export interface WorkflowStep {
   id: string;
   name: string;
   module: SubstrateModule;
   action: string;
   payload: Record<string, unknown>;
   condition?: string;
   dependsOn?: string[];
   timeout?: number;
   onError?: 'continue' | 'fail' | 'retry';
 }
 
 // Workflow trigger
 export interface WorkflowTrigger {
   type: 'event' | 'schedule' | 'manual' | 'webhook';
   config: Record<string, unknown>;
 }
 
 // Retry policy
 export interface RetryPolicy {
   maxRetries: number;
   backoffMs: number;
   backoffMultiplier: number;
 }
 
 // Workflow execution
 export interface WorkflowExecution {
   id: string;
   workflowId: string;
   status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
   currentStep?: string;
   stepResults: Map<string, StepResult>;
   startedAt: string;
   completedAt?: string;
   error?: string;
 }
 
 // Step result
 export interface StepResult {
   stepId: string;
   status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
   output?: unknown;
   error?: string;
   startedAt?: string;
   completedAt?: string;
   retries: number;
 }
 
// Workflow registry (bounded)
const MAX_WORKFLOWS = 100;
const MAX_EXECUTIONS = 200;
const workflows = new Map<string, WorkflowDefinition>();
const executions = new Map<string, WorkflowExecution>();

function boundMap<K, V>(map: Map<K, V>, max: number): void {
  if (map.size <= max) return;
  const excess = map.size - max;
  const iter = map.keys();
  for (let i = 0; i < excess; i++) {
    const key = iter.next().value;
    if (key !== undefined) map.delete(key);
  }
}
 
 /**
  * Register a workflow definition
  */
 export function registerWorkflow(
   config: Omit<WorkflowDefinition, 'id' | 'createdAt'>
 ): WorkflowDefinition {
   const workflow: WorkflowDefinition = {
     ...config,
     id: `workflow_${Date.now()}`,
     createdAt: new Date().toISOString(),
   };
   
    workflows.set(workflow.id, workflow);
    boundMap(workflows, MAX_WORKFLOWS);
    return workflow;
  }
 
 /**
  * Start a workflow execution
  */
 export async function startWorkflow(
   workflowId: string,
   input?: Record<string, unknown>
 ): Promise<WorkflowExecution> {
   const workflow = workflows.get(workflowId);
   if (!workflow) {
     throw new Error(`Workflow ${workflowId} not found`);
   }
   
   const execution: WorkflowExecution = {
     id: `exec_${Date.now()}`,
     workflowId,
     status: 'running',
     stepResults: new Map(),
     startedAt: new Date().toISOString(),
   };
   
   // Initialize step results
   for (const step of workflow.steps) {
     execution.stepResults.set(step.id, {
       stepId: step.id,
       status: 'pending',
       retries: 0,
     });
   }
   
    executions.set(execution.id, execution);
    boundMap(executions, MAX_EXECUTIONS);
    
    // Execute workflow with timeout (clearable to prevent timer leak)
    const timeoutMs = workflow.timeout > 0 ? workflow.timeout : 300_000; // default 5min
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error(`Workflow timed out after ${timeoutMs}ms`)), timeoutMs);
    });
    Promise.race([
      executeWorkflow(workflow, execution, input),
      timeoutPromise,
    ]).then(() => {
      clearTimeout(timeoutHandle);
    }).catch(error => {
      clearTimeout(timeoutHandle);
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.completedAt = new Date().toISOString();
    });
   
   return execution;
 }
 
 /**
  * Execute workflow steps
  */
 async function executeWorkflow(
   workflow: WorkflowDefinition,
   execution: WorkflowExecution,
   input?: Record<string, unknown>
 ): Promise<void> {
   const context: Record<string, unknown> = { input: input || {} };
   
   // Build execution order respecting dependencies
   const order = buildExecutionOrder(workflow.steps);
   
   for (const stepId of order) {
     if (execution.status === 'cancelled') break;
     
     const step = workflow.steps.find(s => s.id === stepId);
     if (!step) continue;
     
     // Check condition
     if (step.condition && !evaluateCondition(step.condition, context)) {
       const result = execution.stepResults.get(step.id)!;
       result.status = 'skipped';
       result.completedAt = new Date().toISOString();
       continue;
     }
     
     execution.currentStep = step.id;
     
     try {
       const output = await executeStep(step, context, workflow.retryPolicy);
       
       const result = execution.stepResults.get(step.id)!;
       result.status = 'completed';
       result.output = output;
       result.completedAt = new Date().toISOString();
       
       // Add output to context
       context[step.id] = output;
     } catch (error) {
       const result = execution.stepResults.get(step.id)!;
       result.status = 'failed';
       result.error = error instanceof Error ? error.message : String(error);
       result.completedAt = new Date().toISOString();
       
       if (step.onError === 'fail' || step.onError === undefined) {
         throw error;
       }
     }
   }
   
   execution.status = 'completed';
   execution.completedAt = new Date().toISOString();
 }
 
 /**
  * Execute a single step
  */
  async function executeStep(
    step: WorkflowStep,
    context: Record<string, unknown>,
    retryPolicy: RetryPolicy
  ): Promise<unknown> {
    // Resolve payload with context
    const payload = resolvePayload(step.payload, context);
    
    let lastError: Error | undefined;
    // Respect per-step timeout if defined
    const stepTimeoutMs = step.timeout && step.timeout > 0 ? step.timeout : 0;
    
    for (let attempt = 0; attempt <= retryPolicy.maxRetries; attempt++) {
      try {
        const callPromise = simulateModuleCall(step.module, step.action, payload);
        let result: unknown;
        if (stepTimeoutMs > 0) {
          let handle: ReturnType<typeof setTimeout> | undefined;
          const timeout = new Promise<never>((_, rej) => {
            handle = setTimeout(() => rej(new Error(`Step ${step.id} timed out after ${stepTimeoutMs}ms`)), stepTimeoutMs);
          });
          result = await Promise.race([callPromise, timeout]);
          clearTimeout(handle);
        } else {
          result = await callPromise;
        }
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < retryPolicy.maxRetries) {
          const delay = retryPolicy.backoffMs * Math.pow(retryPolicy.backoffMultiplier, attempt);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    
    throw lastError || new Error('Step failed');
  }
 
 /**
  * Build execution order respecting dependencies
  */
  function buildExecutionOrder(steps: WorkflowStep[]): string[] {
    const order: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    // Build a Map for O(1) step lookup by ID
    const stepMap = new Map<string, WorkflowStep>();
    for (const s of steps) stepMap.set(s.id, s);
    
    function visit(step: WorkflowStep): void {
      if (visited.has(step.id)) return;
      if (visiting.has(step.id)) {
        throw new Error(`Circular dependency detected at step ${step.id}`);
      }
      
      visiting.add(step.id);
      
      if (step.dependsOn) {
        for (const depId of step.dependsOn) {
          const dep = stepMap.get(depId);
          if (dep) visit(dep);
        }
      }
      
      visiting.delete(step.id);
      visited.add(step.id);
      order.push(step.id);
    }
    
    for (const step of steps) {
      visit(step);
    }
    
    return order;
  }
 
 /**
  * Evaluate a condition expression
  */
  function evaluateCondition(
    condition: string,
    context: Record<string, unknown>
  ): boolean {
    // Simple condition evaluation
    // Format: "stepId.field operator value"
    const match = condition.match(/(\w+)\.(\w+)\s*(==|!=|>|<)\s*(.+)/);
    if (!match) return true;
    
    const [, stepId, field, operator, value] = match;
    const stepOutput = context[stepId] as Record<string, unknown>;
    
    if (!stepOutput) return false;
    
    const actual = stepOutput[field];
    let expected: unknown;
    try {
      expected = JSON.parse(value);
    } catch {
      // Treat unparseable value as a raw string comparison
      expected = value.trim();
    }
    
    switch (operator) {
      case '==': return actual === expected;
      case '!=': return actual !== expected;
      case '>': return (actual as number) > (expected as number);
      case '<': return (actual as number) < (expected as number);
      default: return true;
    }
  }
 
 /**
  * Resolve payload template with context values
  */
 function resolvePayload(
   payload: Record<string, unknown>,
   context: Record<string, unknown>
 ): Record<string, unknown> {
   const resolved: Record<string, unknown> = {};
   
   for (const [key, value] of Object.entries(payload)) {
     if (typeof value === 'string' && value.startsWith('$')) {
       // Reference to context: $stepId.field
       const path = value.slice(1).split('.');
       let current: unknown = context;
       
       for (const part of path) {
         if (current && typeof current === 'object') {
           current = (current as Record<string, unknown>)[part];
         } else {
           current = undefined;
           break;
         }
       }
       
       resolved[key] = current;
     } else {
       resolved[key] = value;
     }
   }
   
   return resolved;
 }
 
 /**
  * Execute module call via substrate singleton
  */
 async function simulateModuleCall(
   module: SubstrateModule,
   action: string,
   payload: Record<string, unknown>
 ): Promise<unknown> {
   try {
     // Import substrate singleton
     const { substrate } = await import('../substrate');
     
     // Get the module from substrate
     const moduleInstance = substrate[module];
     
     if (!moduleInstance) {
       throw new Error(`Module ${module} not found in substrate`);
     }
     
     // Find the action method
     const actionMethod = (moduleInstance as Record<string, unknown>)[action];
     
     if (typeof actionMethod === 'function') {
       // Execute the action with payload
       const result = await actionMethod.call(moduleInstance, payload);
       
       // Log the execution
       const { supabase } = await import('@/integrations/supabase/client');
       await supabase.from('brain_events').insert({
         module: 'cortex',
         event_type: `workflow.step.${module}.${action}`,
         data: { 
           module, 
           action, 
           payloadKeys: Object.keys(payload),
           success: true 
         } as unknown as Record<string, never>,
         outcome: 'success',
       });
       
       return {
         module,
         action,
         success: true,
         result,
       };
     } else {
       // Fallback: invoke via substrate.invoke if available
       // Try calling via core.invoke pattern
       const substrateAny = substrate as unknown as Record<string, unknown>;
       if (typeof substrateAny.invoke === 'function') {
         const invokeMethod = substrateAny.invoke as (
           mod: string, 
           act: string, 
           pay: Record<string, unknown>
         ) => Promise<unknown>;
         const result = await invokeMethod(module, action, payload);
         return {
           module,
           action,
           success: true,
           result,
         };
       }
       
       throw new Error(`Action ${action} not found on module ${module}`);
     }
   } catch (error) {
     // Log the failure
     try {
       const { supabase } = await import('@/integrations/supabase/client');
       await supabase.from('brain_events').insert({
         module: 'cortex',
         event_type: `workflow.step.${module}.${action}`,
         data: { 
           module, 
           action, 
           error: error instanceof Error ? error.message : String(error),
           success: false 
         } as unknown as Record<string, never>,
         outcome: 'failed',
       });
     } catch {
       // Ignore logging errors
     }
     
     throw error;
   }
 }
 
 /**
  * Get workflow execution status
  */
 export function getExecution(executionId: string): WorkflowExecution | undefined {
   return executions.get(executionId);
 }
 
 /**
  * Cancel a running workflow
  */
 export function cancelWorkflow(executionId: string): boolean {
   const execution = executions.get(executionId);
   if (!execution || execution.status !== 'running') return false;
   
   execution.status = 'cancelled';
   execution.completedAt = new Date().toISOString();
   return true;
 }
 
 /**
  * Get all workflows
  */
 export function getWorkflows(): WorkflowDefinition[] {
   return Array.from(workflows.values());
 }
 
 /**
  * Get workflow by ID
  */
 export function getWorkflow(id: string): WorkflowDefinition | undefined {
   return workflows.get(id);
 }
 
 /**
  * Delete a workflow
  */
 export function deleteWorkflow(id: string): boolean {
   return workflows.delete(id);
 }