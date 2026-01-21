/**
 * Agency Scheduling — Hook for managing recurring tasks
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TaskTypeId } from './agencyTasks';

export interface ScheduledTask {
  id: string;
  agency_id: string;
  member_id: string | null;
  task_type: TaskTypeId;
  title: string;
  input_data: Record<string, any>;
  schedule_type: 'once' | 'daily' | 'weekly' | 'monthly';
  schedule_time: string;
  schedule_day_of_week?: number;
  schedule_day_of_month?: number;
  next_run_at: string;
  last_run_at: string | null;
  last_task_id: string | null;
  is_active: boolean;
  run_count: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduleInput {
  agency_id: string;
  member_id?: string;
  task_type: TaskTypeId;
  title: string;
  input_data?: Record<string, any>;
  schedule_type: 'once' | 'daily' | 'weekly' | 'monthly';
  schedule_time?: string;
  schedule_day_of_week?: number;
  schedule_day_of_month?: number;
}

function calculateNextRun(
  scheduleType: string,
  scheduleTime: string = '09:00:00',
  dayOfWeek?: number,
  dayOfMonth?: number
): Date {
  const now = new Date();
  const [hours, minutes] = scheduleTime.split(':').map(Number);
  
  switch (scheduleType) {
    case 'daily': {
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      return next;
    }
    case 'weekly': {
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      const targetDay = dayOfWeek ?? 1;
      const daysUntil = (targetDay - next.getDay() + 7) % 7 || 7;
      next.setDate(next.getDate() + daysUntil);
      return next;
    }
    case 'monthly': {
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      const targetDate = dayOfMonth ?? 1;
      next.setDate(targetDate);
      if (next <= now) next.setMonth(next.getMonth() + 1);
      return next;
    }
    case 'once':
    default: {
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      return next;
    }
  }
}

export function useAgencyScheduling() {
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<ScheduledTask[]>([]);

  const fetchSchedules = useCallback(async (agencyId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agency_scheduled_tasks')
        .select('*')
        .eq('agency_id', agencyId)
        .order('next_run_at', { ascending: true });

      if (error) throw error;
      setSchedules((data || []) as ScheduledTask[]);
      return data as ScheduledTask[];
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
      toast.error('Failed to load scheduled tasks');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createSchedule = useCallback(async (input: CreateScheduleInput): Promise<ScheduledTask | null> => {
    setLoading(true);
    try {
      const nextRun = calculateNextRun(
        input.schedule_type,
        input.schedule_time,
        input.schedule_day_of_week,
        input.schedule_day_of_month
      );

      const { data, error } = await supabase
        .from('agency_scheduled_tasks')
        .insert({
          agency_id: input.agency_id,
          member_id: input.member_id,
          task_type: input.task_type,
          title: input.title,
          input_data: input.input_data || {},
          schedule_type: input.schedule_type,
          schedule_time: input.schedule_time || '09:00:00',
          schedule_day_of_week: input.schedule_day_of_week,
          schedule_day_of_month: input.schedule_day_of_month,
          next_run_at: nextRun.toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Schedule created successfully');
      setSchedules(prev => [...prev, data as ScheduledTask]);
      return data as ScheduledTask;
    } catch (err) {
      console.error('Failed to create schedule:', err);
      toast.error('Failed to create schedule');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleSchedule = useCallback(async (scheduleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('agency_scheduled_tasks')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', scheduleId);

      if (error) throw error;
      
      setSchedules(prev => prev.map(s => 
        s.id === scheduleId ? { ...s, is_active: isActive } : s
      ));
      toast.success(isActive ? 'Schedule activated' : 'Schedule paused');
    } catch (err) {
      console.error('Failed to toggle schedule:', err);
      toast.error('Failed to update schedule');
    }
  }, []);

  const deleteSchedule = useCallback(async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('agency_scheduled_tasks')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;
      
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      toast.success('Schedule deleted');
    } catch (err) {
      console.error('Failed to delete schedule:', err);
      toast.error('Failed to delete schedule');
    }
  }, []);

  const runScheduleNow = useCallback(async (schedule: ScheduledTask) => {
    try {
      // Create a task instance
      const { data: task, error: taskError } = await supabase
        .from('agency_tasks')
        .insert({
          agency_id: schedule.agency_id,
          assigned_member_id: schedule.member_id,
          task_type: schedule.task_type,
          title: `[Manual] ${schedule.title}`,
          description: `Manual run of scheduled task: ${schedule.title}`,
          input_data: schedule.input_data,
          status: 'queued',
          priority: 70,
          progress: 0,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Execute the task
      await supabase.functions.invoke('pf-agency-execute-task', {
        body: {
          taskId: task.id,
          agencyId: schedule.agency_id,
          taskType: schedule.task_type,
          inputData: schedule.input_data,
          memberId: schedule.member_id,
        },
      });

      toast.success('Task started');
      return task;
    } catch (err) {
      console.error('Failed to run schedule now:', err);
      toast.error('Failed to start task');
      return null;
    }
  }, []);

  return {
    loading,
    schedules,
    fetchSchedules,
    createSchedule,
    toggleSchedule,
    deleteSchedule,
    runScheduleNow,
  };
}
