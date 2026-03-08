 /**
  * CORTEX Pipeline Scheduler v7.5.0
  * Intelligent pipeline scheduling with dependencies and priority queuing
  */
 
 export type PipelineStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
 export type PipelinePriority = 'low' | 'normal' | 'high' | 'critical';
 
 export interface ScheduledPipeline {
   id: string;
   name: string;
   synergy_id?: string;
   priority: PipelinePriority;
   status: PipelineStatus;
   dependencies: string[];
   scheduled_at: string;
   started_at: string | null;
   completed_at: string | null;
   estimated_duration_ms: number;
   actual_duration_ms: number | null;
   retries: number;
   max_retries: number;
   error?: string;
   metadata: Record<string, unknown>;
 }
 
 export interface SchedulerConfig {
   max_concurrent: number;
   retry_delay_ms: number;
   priority_weights: Record<PipelinePriority, number>;
   dependency_timeout_ms: number;
 }
 
 export interface SchedulerStats {
   queued: number;
   running: number;
   completed_today: number;
   failed_today: number;
   avg_wait_time_ms: number;
   avg_execution_time_ms: number;
 }
 
 // Configuration
 let config: SchedulerConfig = {
   max_concurrent: 5,
   retry_delay_ms: 5000,
   priority_weights: { critical: 100, high: 50, normal: 10, low: 1 },
   dependency_timeout_ms: 300000, // 5 minutes
 };
 
  // Pipeline queue and state (bounded)
  const MAX_QUEUE_SIZE = 200;
  const MAX_COMPLETED = 100;
  const pipelineQueue: ScheduledPipeline[] = [];
  const runningPipelines = new Map<string, ScheduledPipeline>();
  const completedPipelines: ScheduledPipeline[] = [];
  // Fast lookup set for completed pipeline IDs (avoids O(n) scans)
  const completedIdSet = new Set<string>();
 
 /**
  * Generate pipeline ID
  */
 function generatePipelineId(): string {
   return `pipe_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
 }
 
 /**
  * Schedule a new pipeline
  */
 export function schedulePipeline(params: {
   name: string;
   synergy_id?: string;
   priority?: PipelinePriority;
   dependencies?: string[];
   estimated_duration_ms?: number;
   max_retries?: number;
   metadata?: Record<string, unknown>;
 }): ScheduledPipeline {
   const pipeline: ScheduledPipeline = {
     id: generatePipelineId(),
     name: params.name,
     synergy_id: params.synergy_id,
     priority: params.priority ?? 'normal',
     status: 'pending',
     dependencies: params.dependencies ?? [],
     scheduled_at: new Date().toISOString(),
     started_at: null,
     completed_at: null,
     estimated_duration_ms: params.estimated_duration_ms ?? 5000,
     actual_duration_ms: null,
     retries: 0,
     max_retries: params.max_retries ?? 3,
     metadata: params.metadata ?? {},
   };
 
    // Reject if queue is full
    if (pipelineQueue.length >= MAX_QUEUE_SIZE) {
      pipeline.status = 'cancelled';
      pipeline.error = `Queue full (max ${MAX_QUEUE_SIZE})`;
      return pipeline;
    }

    // Add to queue with priority ordering
    insertByPriority(pipeline);
  
    return pipeline;
 }
 
 /**
  * Insert pipeline into queue by priority
  */
 function insertByPriority(pipeline: ScheduledPipeline): void {
   const weight = config.priority_weights[pipeline.priority];
   let insertIdx = pipelineQueue.length;
 
   for (let i = 0; i < pipelineQueue.length; i++) {
     const existing = pipelineQueue[i];
     const existingWeight = config.priority_weights[existing.priority];
     if (weight > existingWeight) {
       insertIdx = i;
       break;
     }
   }
 
   pipelineQueue.splice(insertIdx, 0, { ...pipeline, status: 'queued' });
 }
 
 /**
  * Check if all dependencies are satisfied
  */
  function areDependenciesSatisfied(pipeline: ScheduledPipeline): boolean {
    for (const depId of pipeline.dependencies) {
      if (!completedIdSet.has(depId)) return false;
    }
    return true;
  }
 
 /**
  * Process the queue - start next eligible pipelines
  */
 export function processQueue(): { started: string[]; skipped: string[] } {
   const started: string[] = [];
   const skipped: string[] = [];
 
   // Check how many more we can run
   const available = config.max_concurrent - runningPipelines.size;
   if (available <= 0) return { started, skipped };
 
   let count = 0;
   const toRemove: number[] = [];
 
   for (let i = 0; i < pipelineQueue.length && count < available; i++) {
     const pipeline = pipelineQueue[i];
 
     if (!areDependenciesSatisfied(pipeline)) {
       skipped.push(pipeline.id);
       continue;
     }
 
     // Start the pipeline
     pipeline.status = 'running';
     pipeline.started_at = new Date().toISOString();
     runningPipelines.set(pipeline.id, pipeline);
     toRemove.push(i);
     started.push(pipeline.id);
     count++;
   }
 
   // Remove started pipelines from queue (reverse order to maintain indices)
   for (let i = toRemove.length - 1; i >= 0; i--) {
     pipelineQueue.splice(toRemove[i], 1);
   }
 
   return { started, skipped };
 }
 
 /**
  * Complete a running pipeline
  */
 export function completePipeline(
   pipelineId: string,
   success: boolean,
   error?: string
 ): ScheduledPipeline | null {
   const pipeline = runningPipelines.get(pipelineId);
   if (!pipeline) return null;
 
   const now = new Date();
   pipeline.status = success ? 'completed' : 'failed';
   pipeline.completed_at = now.toISOString();
   pipeline.actual_duration_ms = pipeline.started_at
     ? now.getTime() - new Date(pipeline.started_at).getTime()
     : 0;
 
   if (!success && error) {
     pipeline.error = error;
   }
 
   runningPipelines.delete(pipelineId);
 
   // Handle failure with retries
   if (!success && pipeline.retries < pipeline.max_retries) {
     pipeline.retries++;
     pipeline.status = 'pending';
     pipeline.started_at = null;
     pipeline.completed_at = null;
     setTimeout(() => insertByPriority(pipeline), config.retry_delay_ms);
    } else {
      completedPipelines.push(pipeline);
      if (pipeline.status === 'completed') completedIdSet.add(pipeline.id);
      // Keep only last MAX_COMPLETED — batch trim to avoid frequent splices
      if (completedPipelines.length > MAX_COMPLETED * 1.5) {
        const removed = completedPipelines.splice(0, completedPipelines.length - MAX_COMPLETED);
        for (const r of removed) completedIdSet.delete(r.id);
      }
    }
 
   return pipeline;
 }
 
 /**
  * Cancel a pipeline
  */
 export function cancelPipeline(pipelineId: string): boolean {
   // Check queue
   const queueIdx = pipelineQueue.findIndex(p => p.id === pipelineId);
   if (queueIdx >= 0) {
     const [cancelled] = pipelineQueue.splice(queueIdx, 1);
    cancelled.status = 'cancelled';
      completedPipelines.push(cancelled);
      // cancelled pipelines don't go into completedIdSet (they didn't succeed)
     return true;
   }
 
   // Check running
   const running = runningPipelines.get(pipelineId);
   if (running) {
    running.status = 'cancelled';
      running.completed_at = new Date().toISOString();
      runningPipelines.delete(pipelineId);
      completedPipelines.push(running);
      // cancelled pipelines don't go into completedIdSet
     return true;
   }
 
   return false;
 }
 
 /**
  * Get queue state
  */
 export function getQueueState(): {
   queued: ScheduledPipeline[];
   running: ScheduledPipeline[];
   recent_completed: ScheduledPipeline[];
 } {
   return {
     queued: [...pipelineQueue],
     running: Array.from(runningPipelines.values()),
     recent_completed: completedPipelines.slice(-20),
   };
 }
 
 /**
  * Get pipeline by ID
  */
 export function getPipeline(pipelineId: string): ScheduledPipeline | undefined {
   return (
     pipelineQueue.find(p => p.id === pipelineId) ??
     runningPipelines.get(pipelineId) ??
     completedPipelines.find(p => p.id === pipelineId)
   );
 }
 
 /**
  * Get scheduler statistics
  */
 export function getSchedulerStats(): SchedulerStats {
   const today = new Date().toISOString().split('T')[0];
   const todayCompleted = completedPipelines.filter(
     p => p.completed_at?.startsWith(today)
   );
 
   const completed = todayCompleted.filter(p => p.status === 'completed');
   const failed = todayCompleted.filter(p => p.status === 'failed');
 
   const avgWaitTime = completed.length > 0
     ? completed.reduce((sum, p) => {
         const wait = p.started_at && p.scheduled_at
           ? new Date(p.started_at).getTime() - new Date(p.scheduled_at).getTime()
           : 0;
         return sum + wait;
       }, 0) / completed.length
     : 0;
 
   const avgExecTime = completed.length > 0
     ? completed.reduce((sum, p) => sum + (p.actual_duration_ms ?? 0), 0) / completed.length
     : 0;
 
   return {
     queued: pipelineQueue.length,
     running: runningPipelines.size,
     completed_today: completed.length,
     failed_today: failed.length,
     avg_wait_time_ms: Math.round(avgWaitTime),
     avg_execution_time_ms: Math.round(avgExecTime),
   };
 }
 
 /**
  * Update scheduler configuration
  */
 export function updateSchedulerConfig(updates: Partial<SchedulerConfig>): SchedulerConfig {
   config = { ...config, ...updates };
   return { ...config };
 }
 
 /**
  * Get scheduler configuration
  */
 export function getSchedulerConfig(): SchedulerConfig {
   return { ...config };
 }
 
 /**
  * Clear all queued pipelines
  */
 export function clearQueue(): number {
   const count = pipelineQueue.length;
   pipelineQueue.length = 0;
   return count;
 }