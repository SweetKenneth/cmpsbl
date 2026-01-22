/**
 * useAgencyTasks v4.0 — Robust queue processing with DB-driven fallback
 * Fixes: Queue stalls, proper queueStats return, immediate processing
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AgencyTask, AgencyTaskLog, TaskTypeId, TaskStatus } from '@/lib/agency/agencyTasks';
import { executeTask } from '@/lib/agency/taskExecutor';

// Configuration
const MAX_CONCURRENT_TASKS = 5;
const QUEUE_POLL_INTERVAL = 2000; // Poll more frequently
const STALE_TASK_THRESHOLD = 300000; // 5 minutes - mark stuck tasks as failed

interface UseAgencyTasksOptions {
  agencyId: string;
  autoRefresh?: boolean;
  maxConcurrent?: number;
}

interface QueueStats {
  queued: number;
  inProgress: number;
  available: number;
}

interface UseAgencyTasksReturn {
  tasks: AgencyTask[];
  taskLogs: AgencyTaskLog[];
  isLoading: boolean;
  error: string | null;
  createTask: (task: Partial<AgencyTask>) => Promise<AgencyTask | null>;
  createAndQueueTask: (task: Partial<AgencyTask>) => Promise<AgencyTask | null>;
  updateTask: (taskId: string, updates: Partial<AgencyTask>) => Promise<boolean>;
  addTaskLog: (taskId: string, message: string, logType?: AgencyTaskLog['log_type'], data?: Record<string, any>) => Promise<void>;
  startTask: (taskId: string) => Promise<boolean>;
  completeTask: (taskId: string, output?: Record<string, any>) => Promise<boolean>;
  failTask: (taskId: string, errorMessage: string) => Promise<boolean>;
  cancelTask: (taskId: string) => Promise<boolean>;
  cancelAllTasks: () => Promise<number>;
  retryTask: (taskId: string) => Promise<boolean>;
  retryAllFailed: () => Promise<number>;
  clearCompletedTasks: () => Promise<number>;
  refetch: () => Promise<void>;
  getTasksByMember: (memberId: string) => AgencyTask[];
  getTasksByStatus: (status: TaskStatus) => AgencyTask[];
  getRecentLogs: (limit?: number) => AgencyTaskLog[];
  processQueue: () => Promise<number>;
  queueStats: QueueStats;
}

export function useAgencyTasks({ 
  agencyId, 
  autoRefresh = true, 
  maxConcurrent = MAX_CONCURRENT_TASKS 
}: UseAgencyTasksOptions): UseAgencyTasksReturn {
  const executingTasks = useRef<Set<string>>(new Set());
  const processingQueue = useRef<boolean>(false);
  const lastProcessTime = useRef<number>(0);
  
  const [tasks, setTasks] = useState<AgencyTask[]>([]);
  const [taskLogs, setTaskLogs] = useState<AgencyTaskLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // QUEUE STATS - Computed as a memoized value
  // ============================================
  const queueStats = useMemo((): QueueStats => {
    const queued = tasks.filter(t => t.status === 'queued').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const available = Math.max(0, maxConcurrent - inProgress - executingTasks.current.size);
    return { queued, inProgress, available };
  }, [tasks, maxConcurrent]);

  // Fetch tasks from DB
  const fetchTasks = useCallback(async () => {
    if (!agencyId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('agency_tasks')
        .select('*')
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      const fetchedTasks = (data || []) as AgencyTask[];
      
      // Check for stale in_progress tasks and auto-fail them
      const now = Date.now();
      for (const task of fetchedTasks) {
        if (task.status === 'in_progress' && task.started_at) {
          const startedAt = new Date(task.started_at).getTime();
          if (now - startedAt > STALE_TASK_THRESHOLD) {
            console.warn(`Stale task detected: ${task.id}, marking as failed`);
            await supabase
              .from('agency_tasks')
              .update({ 
                status: 'failed', 
                error_message: 'Task timed out (stale)',
                updated_at: new Date().toISOString(),
              })
              .eq('id', task.id);
          }
        }
      }
      
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    }
  }, [agencyId]);

  // Fetch recent logs
  const fetchLogs = useCallback(async () => {
    if (!agencyId || tasks.length === 0) return;

    try {
      const taskIds = tasks.map(t => t.id);
      const { data, error: fetchError } = await supabase
        .from('agency_task_logs')
        .select('*')
        .in('task_id', taskIds)
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setTaskLogs((data || []) as AgencyTaskLog[]);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  }, [agencyId, tasks]);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchTasks();
      setIsLoading(false);
    };
    load();
  }, [fetchTasks]);

  // Load logs after tasks
  useEffect(() => {
    if (tasks.length > 0) {
      fetchLogs();
    }
  }, [tasks.length, fetchLogs]);

  // Real-time subscription for tasks
  useEffect(() => {
    if (!autoRefresh || !agencyId) return;

    const taskChannel = supabase
      .channel(`agency_tasks_${agencyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agency_tasks',
          filter: `agency_id=eq.${agencyId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as AgencyTask;
            setTasks(prev => {
              // Avoid duplicates
              if (prev.some(t => t.id === newTask.id)) return prev;
              return [newTask, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as AgencyTask;
            // Remove from executing set if task is done
            if (['completed', 'failed', 'cancelled'].includes(updated.status)) {
              executingTasks.current.delete(updated.id);
            }
            setTasks(prev =>
              prev.map(t => (t.id === updated.id ? updated : t))
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(taskChannel);
    };
  }, [agencyId, autoRefresh]);

  // Real-time subscription for task logs
  useEffect(() => {
    if (!autoRefresh || !agencyId || tasks.length === 0) return;

    const taskIds = tasks.map(t => t.id);
    
    const logChannel = supabase
      .channel(`agency_task_logs_${agencyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agency_task_logs',
        },
        (payload) => {
          const newLog = payload.new as AgencyTaskLog;
          if (taskIds.includes(newLog.task_id)) {
            setTaskLogs(prev => {
              if (prev.some(l => l.id === newLog.id)) return prev;
              return [newLog, ...prev].slice(0, 100);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(logChannel);
    };
  }, [agencyId, autoRefresh, tasks]);

  // Create task
  const createTask = useCallback(async (task: Partial<AgencyTask>): Promise<AgencyTask | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('agency_tasks')
        .insert({
          agency_id: agencyId,
          title: task.title || 'New Task',
          description: task.description || null,
          task_type: task.task_type || 'web_research',
          status: 'queued',
          priority: task.priority || 50,
          progress: 0,
          input_data: task.input_data || {},
          output_data: {},
          research_domain: task.research_domain || null,
          assigned_member_id: task.assigned_member_id || null,
          metadata: task.metadata || {},
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data as AgencyTask;
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error('Failed to create task');
      return null;
    }
  }, [agencyId]);

  // Create task and immediately trigger processing
  const createAndQueueTask = useCallback(async (task: Partial<AgencyTask>): Promise<AgencyTask | null> => {
    const newTask = await createTask(task);
    if (newTask) {
      toast.success('Task queued');
      // Trigger immediate processing
      setTimeout(() => processQueueInternal(), 100);
    }
    return newTask;
  }, [createTask]);

  // Update task
  const updateTask = useCallback(async (taskId: string, updates: Partial<AgencyTask>): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('agency_tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      console.error('Error updating task:', err);
      return false;
    }
  }, []);

  // Add task log
  const addTaskLog = useCallback(async (
    taskId: string,
    message: string,
    logType: AgencyTaskLog['log_type'] = 'info',
    data: Record<string, any> = {}
  ): Promise<void> => {
    try {
      await supabase
        .from('agency_task_logs')
        .insert({
          task_id: taskId,
          message,
          log_type: logType,
          data,
        });
    } catch (err) {
      console.error('Error adding log:', err);
    }
  }, []);

  // Start task - executes via edge function
  const startTask = useCallback(async (taskId: string): Promise<boolean> => {
    // Prevent double execution
    if (executingTasks.current.has(taskId)) {
      console.log('Task already executing:', taskId);
      return true;
    }
    
    // Find the task
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return false;
    }
    
    // Skip if not queued
    if (task.status !== 'queued') {
      console.log('Task not in queued status:', taskId, task.status);
      return false;
    }
    
    executingTasks.current.add(taskId);
    
    // Update to in_progress
    const updated = await updateTask(taskId, {
      status: 'in_progress' as TaskStatus,
      started_at: new Date().toISOString(),
      progress: 5,
    });
    
    if (!updated) {
      executingTasks.current.delete(taskId);
      return false;
    }
    
    await addTaskLog(taskId, '🚀 Task started - executing...', 'info');
    toast.info('Task started', { description: 'Agent is now working on this task' });
    
    // Execute via edge function (fire and forget)
    executeTask({
      taskId,
      agencyId,
      taskType: task.task_type as any,
      inputData: (task.input_data as Record<string, any>) || {},
      memberId: task.assigned_member_id || undefined,
      researchDomain: task.research_domain || undefined,
    }).then(result => {
      executingTasks.current.delete(taskId);
      
      if (result.success) {
        toast.success('Task completed', { 
          description: `Finished in ${Math.round((result.executionTimeMs || 0) / 1000)}s` 
        });
      } else {
        toast.error('Task failed', { description: result.error });
      }
    }).catch(err => {
      executingTasks.current.delete(taskId);
      console.error('Task execution error:', err);
      toast.error('Task execution failed');
      
      // Mark as failed in DB
      updateTask(taskId, {
        status: 'failed' as TaskStatus,
        error_message: err.message || 'Execution error',
      });
    });
    
    return true;
  }, [tasks, agencyId, updateTask, addTaskLog]);

  // Complete task
  const completeTask = useCallback(async (taskId: string, output: Record<string, any> = {}): Promise<boolean> => {
    executingTasks.current.delete(taskId);
    const success = await updateTask(taskId, {
      status: 'completed' as TaskStatus,
      completed_at: new Date().toISOString(),
      progress: 100,
      output_data: output,
    });
    if (success) {
      await addTaskLog(taskId, 'Task completed successfully', 'completion', output);
      toast.success('Task completed');
    }
    return success;
  }, [updateTask, addTaskLog]);

  // Fail task
  const failTask = useCallback(async (taskId: string, errorMessage: string): Promise<boolean> => {
    executingTasks.current.delete(taskId);
    const success = await updateTask(taskId, {
      status: 'failed' as TaskStatus,
      error_message: errorMessage,
    });
    if (success) {
      await addTaskLog(taskId, `Task failed: ${errorMessage}`, 'error');
    }
    return success;
  }, [updateTask, addTaskLog]);

  // Cancel single task
  const cancelTask = useCallback(async (taskId: string): Promise<boolean> => {
    executingTasks.current.delete(taskId);

    const success = await updateTask(taskId, {
      status: 'cancelled' as TaskStatus,
      error_message: null,
      progress: 0,
    });
    if (success) {
      await addTaskLog(taskId, '⏹️ Task cancelled by user', 'info');
      toast.message('Task cancelled');
    }
    return success;
  }, [updateTask, addTaskLog]);

  // Cancel all queued + active tasks
  const cancelAllTasks = useCallback(async (): Promise<number> => {
    if (!agencyId) return 0;

    try {
      const affected = tasks.filter(t => t.status === 'queued' || t.status === 'in_progress');
      if (affected.length === 0) return 0;

      // Clear local guards
      for (const t of affected) executingTasks.current.delete(t.id);

      const { error: updateError } = await supabase
        .from('agency_tasks')
        .update({
          status: 'cancelled',
          progress: 0,
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq('agency_id', agencyId)
        .in('status', ['queued', 'in_progress']);

      if (updateError) throw updateError;

      toast.message(`Cancelled ${affected.length} tasks`);
      return affected.length;
    } catch (err) {
      console.error('Error cancelling all tasks:', err);
      toast.error('Failed to cancel tasks');
      return 0;
    }
  }, [agencyId, tasks]);

  // Retry single task
  const retryTask = useCallback(async (taskId: string): Promise<boolean> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || (task.status !== 'failed' && task.status !== 'cancelled')) {
      return false;
    }

    const success = await updateTask(taskId, {
      status: 'queued' as TaskStatus,
      error_message: null,
      progress: 0,
      started_at: null,
      completed_at: null,
    });

    if (success) {
      await addTaskLog(taskId, '🔄 Task queued for retry', 'info');
      toast.info('Task queued for retry');
      // Trigger processing
      setTimeout(() => processQueueInternal(), 100);
    }
    return success;
  }, [tasks, updateTask, addTaskLog]);

  // Retry all failed tasks
  const retryAllFailed = useCallback(async (): Promise<number> => {
    const failedTasks = tasks.filter(t => t.status === 'failed' || t.status === 'cancelled');
    if (failedTasks.length === 0) return 0;

    let retried = 0;
    for (const task of failedTasks) {
      const success = await retryTask(task.id);
      if (success) retried++;
    }

    if (retried > 0) {
      toast.success(`Retrying ${retried} tasks`);
    }
    return retried;
  }, [tasks, retryTask]);

  // Clear completed tasks
  const clearCompletedTasks = useCallback(async (): Promise<number> => {
    if (!agencyId) return 0;

    try {
      const completed = tasks.filter(t => t.status === 'completed');
      if (completed.length === 0) return 0;

      const completedIds = completed.map(t => t.id);

      await supabase.from('agency_task_logs').delete().in('task_id', completedIds);
      const { error: deleteError } = await supabase.from('agency_tasks').delete().in('id', completedIds);

      if (deleteError) throw deleteError;

      toast.message(`Cleared ${completed.length} completed tasks`);
      return completed.length;
    } catch (err) {
      console.error('Error clearing completed tasks:', err);
      toast.error('Failed to clear tasks');
      return 0;
    }
  }, [agencyId, tasks]);

  // Helpers
  const getTasksByMember = useCallback((memberId: string) => 
    tasks.filter(t => t.assigned_member_id === memberId), [tasks]);

  const getTasksByStatus = useCallback((status: TaskStatus) => 
    tasks.filter(t => t.status === status), [tasks]);

  const getRecentLogs = useCallback((limit = 20) => 
    taskLogs.slice(0, limit), [taskLogs]);

  const refetch = useCallback(async () => {
    await fetchTasks();
    await fetchLogs();
  }, [fetchTasks, fetchLogs]);

  // ============================================
  // QUEUE PROCESSOR - Core processing logic
  // ============================================
  const processQueueInternal = useCallback(async (): Promise<number> => {
    // Debounce rapid calls
    const now = Date.now();
    if (now - lastProcessTime.current < 500) return 0;
    lastProcessTime.current = now;

    if (processingQueue.current) return 0;
    processingQueue.current = true;

    try {
      // Calculate current capacity
      const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
      const executingCount = executingTasks.current.size;
      const currentLoad = Math.max(inProgressCount, executingCount);
      const availableSlots = Math.max(0, maxConcurrent - currentLoad);

      if (availableSlots === 0) {
        return 0;
      }

      // Get queued tasks not already being processed
      const queuedTasks = tasks
        .filter(t => t.status === 'queued' && !executingTasks.current.has(t.id))
        .sort((a, b) => {
          // Higher priority first
          if ((b.priority || 0) !== (a.priority || 0)) {
            return (b.priority || 0) - (a.priority || 0);
          }
          // Earlier creation first
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        })
        .slice(0, availableSlots);

      if (queuedTasks.length === 0) {
        return 0;
      }

      console.log(`📊 Queue processor: starting ${queuedTasks.length} tasks (${availableSlots} slots available)`);

      // Start all tasks in parallel
      const results = await Promise.allSettled(
        queuedTasks.map(task => startTask(task.id))
      );

      const started = results.filter(r => r.status === 'fulfilled' && r.value).length;
      
      if (started > 0) {
        console.log(`✅ Queue processor: started ${started} tasks`);
      }

      return started;
    } finally {
      processingQueue.current = false;
    }
  }, [tasks, maxConcurrent, startTask]);

  // Expose processQueue
  const processQueue = useCallback(async (): Promise<number> => {
    return processQueueInternal();
  }, [processQueueInternal]);

  // ============================================
  // AUTO-PROCESSING: Interval-based polling
  // ============================================
  useEffect(() => {
    if (!autoRefresh || !agencyId) return;

    const processInterval = setInterval(() => {
      const queuedCount = tasks.filter(t => t.status === 'queued').length;
      const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
      
      if (queuedCount > 0 && inProgressCount < maxConcurrent) {
        processQueueInternal();
      }
    }, QUEUE_POLL_INTERVAL);

    return () => clearInterval(processInterval);
  }, [autoRefresh, agencyId, tasks, maxConcurrent, processQueueInternal]);

  // ============================================
  // AUTO-PROCESSING: Immediate on new queued tasks
  // ============================================
  useEffect(() => {
    const queuedCount = tasks.filter(t => t.status === 'queued').length;
    const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
    
    if (queuedCount > 0 && inProgressCount < maxConcurrent && !processingQueue.current) {
      const timeout = setTimeout(() => processQueueInternal(), 300);
      return () => clearTimeout(timeout);
    }
  }, [tasks, maxConcurrent, processQueueInternal]);

  return {
    tasks,
    taskLogs,
    isLoading,
    error,
    createTask,
    createAndQueueTask,
    updateTask,
    addTaskLog,
    startTask,
    completeTask,
    failTask,
    cancelTask,
    cancelAllTasks,
    retryTask,
    retryAllFailed,
    clearCompletedTasks,
    refetch,
    getTasksByMember,
    getTasksByStatus,
    getRecentLogs,
    processQueue,
    queueStats, // Now properly returns the object, not a function
  };
}
