/**
 * useAgencyTasks — Hook for managing agency tasks with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AgencyTask, AgencyTaskLog, TaskTypeId, TaskStatus } from '@/lib/agency/agencyTasks';

interface UseAgencyTasksOptions {
  agencyId: string;
  autoRefresh?: boolean;
}

interface UseAgencyTasksReturn {
  tasks: AgencyTask[];
  taskLogs: AgencyTaskLog[];
  isLoading: boolean;
  error: string | null;
  createTask: (task: Partial<AgencyTask>) => Promise<AgencyTask | null>;
  updateTask: (taskId: string, updates: Partial<AgencyTask>) => Promise<boolean>;
  addTaskLog: (taskId: string, message: string, logType?: AgencyTaskLog['log_type'], data?: Record<string, any>) => Promise<void>;
  startTask: (taskId: string) => Promise<boolean>;
  completeTask: (taskId: string, output?: Record<string, any>) => Promise<boolean>;
  failTask: (taskId: string, errorMessage: string) => Promise<boolean>;
  refetch: () => Promise<void>;
  getTasksByMember: (memberId: string) => AgencyTask[];
  getTasksByStatus: (status: TaskStatus) => AgencyTask[];
  getRecentLogs: (limit?: number) => AgencyTaskLog[];
}

export function useAgencyTasks({ agencyId, autoRefresh = true }: UseAgencyTasksOptions): UseAgencyTasksReturn {
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

  // Real-time subscription
  useEffect(() => {
    if (!autoRefresh || !agencyId) return;

    const channel = supabase
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
      supabase.removeChannel(channel);
    };
  }, [agencyId, autoRefresh]);

  // Create task
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
      toast.success('Task created');
      return data as AgencyTask;
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error('Failed to create task');
      return null;
    }
  }, [agencyId]);

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

  // Start task
  const startTask = useCallback(async (taskId: string): Promise<boolean> => {
    const success = await updateTask(taskId, {
      status: 'in_progress' as TaskStatus,
      started_at: new Date().toISOString(),
      progress: 5,
    });
    if (success) {
      await addTaskLog(taskId, 'Task started', 'info');
    }
    return success;
  }, [updateTask, addTaskLog]);

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

  return {
    tasks,
    taskLogs,
    isLoading,
    error,
    createTask,
    updateTask,
    addTaskLog,
    startTask,
    completeTask,
    failTask,
    refetch,
    getTasksByMember,
    getTasksByStatus,
    getRecentLogs,
  };
}
