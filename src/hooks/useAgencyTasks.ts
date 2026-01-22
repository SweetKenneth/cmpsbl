/**
 * useAgencyTasks — Hook for managing agency tasks with real-time updates
 * v3.0 — Queue processor + parallel agent execution
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AgencyTask, AgencyTaskLog, TaskTypeId, TaskStatus } from '@/lib/agency/agencyTasks';
import { executeTask } from '@/lib/agency/taskExecutor';

// Maximum concurrent tasks per agency
const MAX_CONCURRENT_TASKS = 5;
// Queue processing interval (ms)
const QUEUE_PROCESS_INTERVAL = 3000;

interface UseAgencyTasksOptions {
  agencyId: string;
  autoRefresh?: boolean;
  maxConcurrent?: number;
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
  queueStats: { queued: number; inProgress: number; available: number };
}

export function useAgencyTasks({ agencyId, autoRefresh = true, maxConcurrent = MAX_CONCURRENT_TASKS }: UseAgencyTasksOptions): UseAgencyTasksReturn {
  const executingTasks = useRef<Set<string>>(new Set());
  const processingQueue = useRef<boolean>(false);
  const [tasks, setTasks] = useState<AgencyTask[]>([]);
  const [taskLogs, setTaskLogs] = useState<AgencyTaskLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!agencyId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('agency_tasks')
        .select('*')
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTasks((data || []) as AgencyTask[]);
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
            setTasks(prev => [payload.new as AgencyTask, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev =>
              prev.map(t => (t.id === payload.new.id ? (payload.new as AgencyTask) : t))
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
          // Only add if it belongs to one of our tasks
          if (taskIds.includes(newLog.task_id)) {
            setTaskLogs(prev => {
              // Avoid duplicates
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

  // Get queue statistics
  const queueStats = useCallback(() => {
    const queued = tasks.filter(t => t.status === 'queued').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const available = Math.max(0, maxConcurrent - inProgress);
    return { queued, inProgress, available };
  }, [tasks, maxConcurrent]);

  // Create task (just creates, doesn't start)
  const createTask = useCallback(async (task: Partial<AgencyTask>): Promise<AgencyTask | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('agency_tasks')
        .insert({
          agency_id: agencyId,
          title: task.title || 'New Task',
          description: task.description || null,
          task_type: task.task_type || 'research',
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

  // Create task and add to queue (will be auto-processed)
  const createAndQueueTask = useCallback(async (task: Partial<AgencyTask>): Promise<AgencyTask | null> => {
    const newTask = await createTask(task);
    if (newTask) {
      toast.success('Task queued');
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
      const { error: insertError } = await supabase
        .from('agency_task_logs')
        .insert({
          task_id: taskId,
          message,
          log_type: logType,
          data,
        });

      if (insertError) throw insertError;
      
      // Optimistically add to local state
      const newLog: AgencyTaskLog = {
        id: crypto.randomUUID(),
        task_id: taskId,
        member_id: null,
        message,
        log_type: logType,
        data,
        created_at: new Date().toISOString(),
      };
      setTaskLogs(prev => [newLog, ...prev]);
    } catch (err) {
      console.error('Error adding log:', err);
    }
  }, []);

  // Start task - NOW ACTUALLY EXECUTES VIA EDGE FUNCTION
  const startTask = useCallback(async (taskId: string): Promise<boolean> => {
    // Prevent double execution
    if (executingTasks.current.has(taskId)) {
      console.log('Task already executing:', taskId);
      return true;
    }
    
    // Find the task to get its details
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return false;
    }
    
    executingTasks.current.add(taskId);
    
    // First update to show task is starting
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
    
    // Execute the task via edge function (fire and forget for UI responsiveness)
    // The edge function will update progress and status directly in the database
    // Real-time subscription will pick up the changes
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
      toast.error('Task execution failed', { description: err.message });
    });
    
    return true;
  }, [tasks, agencyId, updateTask, addTaskLog]);

  // Complete task
  const completeTask = useCallback(async (taskId: string, output: Record<string, any> = {}): Promise<boolean> => {
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
    // allow cancel regardless of client-side executing set
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

  // Cancel all queued + active tasks for this agency
  const cancelAllTasks = useCallback(async (): Promise<number> => {
    if (!agencyId) return 0;

    try {
      // Find affected tasks first (for logging)
      const affected = tasks.filter(t => t.status === 'queued' || t.status === 'in_progress');
      if (affected.length === 0) return 0;

      // Clear local execution guards
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

      // Log a lightweight cancel marker for each affected task (small batches are OK)
      await supabase.from('agency_task_logs').insert(
        affected.map(t => ({
          task_id: t.id,
          message: '⏹️ Task cancelled by user (bulk cancel)',
          log_type: 'info',
          data: { bulk: true },
        }))
      );

      toast.message(`Cancelled ${affected.length} tasks`);
      return affected.length;
    } catch (err) {
      console.error('Error cancelling all tasks:', err);
      toast.error('Failed to cancel tasks');
      return 0;
    }
  }, [agencyId, tasks]);

  // Retry single task (requeue and restart)
  const retryTask = useCallback(async (taskId: string): Promise<boolean> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || (task.status !== 'failed' && task.status !== 'cancelled')) {
      return false;
    }

    // Reset task to queued
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
      // Immediately start it
      await startTask(taskId);
    }
    return success;
  }, [tasks, updateTask, addTaskLog, startTask]);

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

  // Clear completed tasks (delete from DB)
  const clearCompletedTasks = useCallback(async (): Promise<number> => {
    if (!agencyId) return 0;

    try {
      const completed = tasks.filter(t => t.status === 'completed');
      if (completed.length === 0) return 0;

      const completedIds = completed.map(t => t.id);

      // Delete logs first
      await supabase
        .from('agency_task_logs')
        .delete()
        .in('task_id', completedIds);

      // Delete tasks
      const { error: deleteError } = await supabase
        .from('agency_tasks')
        .delete()
        .in('id', completedIds);

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
  // QUEUE PROCESSOR - Automatically starts queued tasks
  // ============================================
  const processQueue = useCallback(async (): Promise<number> => {
    if (processingQueue.current) return 0;
    processingQueue.current = true;

    try {
      const stats = queueStats();
      if (stats.queued === 0 || stats.available === 0) {
        return 0;
      }

      // Get queued tasks ordered by priority (high first) and creation time
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
        .slice(0, stats.available);

      let started = 0;
      
      // Start tasks in parallel
      const startPromises = queuedTasks.map(async (task) => {
        const success = await startTask(task.id);
        if (success) started++;
        return success;
      });

      await Promise.all(startPromises);

      if (started > 0) {
        console.log(`📊 Queue processor: started ${started} tasks`);
      }

      return started;
    } finally {
      processingQueue.current = false;
    }
  }, [tasks, queueStats, startTask]);

  // Auto-process queue when tasks change
  useEffect(() => {
    if (!autoRefresh || !agencyId) return;

    const processInterval = setInterval(() => {
      const stats = queueStats();
      if (stats.queued > 0 && stats.available > 0) {
        processQueue();
      }
    }, QUEUE_PROCESS_INTERVAL);

    return () => clearInterval(processInterval);
  }, [autoRefresh, agencyId, processQueue, queueStats]);

  // Process queue immediately when new queued tasks appear
  useEffect(() => {
    const stats = queueStats();
    if (stats.queued > 0 && stats.available > 0 && !processingQueue.current) {
      // Slight delay to batch multiple task creations
      const timeout = setTimeout(() => processQueue(), 500);
      return () => clearTimeout(timeout);
    }
  }, [tasks.length, queueStats, processQueue]);

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
    queueStats: queueStats(),
  };
}
