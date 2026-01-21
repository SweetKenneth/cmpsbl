/**
 * pf-agency-scheduler v1.0.0
 * 
 * Runs scheduled agency tasks:
 * - Checks for due scheduled tasks
 * - Creates task instances
 * - Updates next run time
 * - Called by cron job or manually
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function calculateNextRun(
  scheduleType: string,
  scheduleTime: string,
  dayOfWeek?: number,
  dayOfMonth?: number
): Date {
  const now = new Date();
  const [hours, minutes] = (scheduleTime || '09:00:00').split(':').map(Number);
  
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
      const targetDay = dayOfWeek ?? 1; // Default Monday
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
    default:
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // Far future for "once"
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date().toISOString();
    
    // Find due scheduled tasks
    const { data: dueTasks, error: fetchError } = await supabase
      .from('agency_scheduled_tasks')
      .select(`
        *,
        agency:agencies(id, name, owner_id),
        member:agency_members(id, specialization, role)
      `)
      .eq('is_active', true)
      .lte('next_run_at', now)
      .order('next_run_at', { ascending: true })
      .limit(20);

    if (fetchError) throw fetchError;

    console.log(`⏰ Found ${dueTasks?.length || 0} due scheduled tasks`);

    const results = [];

    for (const scheduled of dueTasks || []) {
      try {
        // Create the task instance
        const { data: newTask, error: createError } = await supabase
          .from('agency_tasks')
          .insert({
            agency_id: scheduled.agency_id,
            assigned_member_id: scheduled.member_id,
            task_type: scheduled.task_type,
            title: `[Scheduled] ${scheduled.title}`,
            description: `Automated task from schedule: ${scheduled.title}`,
            input_data: {
              ...scheduled.input_data,
              isScheduled: true,
              scheduleId: scheduled.id,
            },
            status: 'queued',
            priority: 60, // Higher priority for scheduled tasks
            progress: 0,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Calculate next run time
        const nextRun = calculateNextRun(
          scheduled.schedule_type,
          scheduled.schedule_time,
          scheduled.schedule_day_of_week,
          scheduled.schedule_day_of_month
        );

        // Update the schedule
        await supabase
          .from('agency_scheduled_tasks')
          .update({
            last_run_at: now,
            last_task_id: newTask.id,
            next_run_at: scheduled.schedule_type === 'once' ? null : nextRun.toISOString(),
            is_active: scheduled.schedule_type !== 'once',
            run_count: (scheduled.run_count || 0) + 1,
          })
          .eq('id', scheduled.id);

        // Trigger task execution
        await supabase.functions.invoke('pf-agency-execute-task', {
          body: {
            taskId: newTask.id,
            agencyId: scheduled.agency_id,
            taskType: scheduled.task_type,
            inputData: newTask.input_data,
            memberId: scheduled.member_id,
          },
        });

        results.push({
          scheduleId: scheduled.id,
          taskId: newTask.id,
          title: scheduled.title,
          success: true,
        });

        console.log(`✅ Executed scheduled task: ${scheduled.title}`);

      } catch (err) {
        console.error(`❌ Failed scheduled task ${scheduled.id}:`, err);
        results.push({
          scheduleId: scheduled.id,
          title: scheduled.title,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      results,
      timestamp: now,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Scheduler error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
