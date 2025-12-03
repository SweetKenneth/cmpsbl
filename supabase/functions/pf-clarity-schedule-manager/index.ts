import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, ...body } = await req.json();

    switch (action) {
      case 'create_schedule': {
        const { site_id, frequency, schedule_time, schedule_day, schedule_date, notification_enabled } = body;

        // Verify site ownership
        const { data: site } = await supabase
          .from('pf_clarity_sites')
          .select('user_id')
          .eq('id', site_id)
          .single();

        if (!site || site.user_id !== user.id) {
          return new Response(JSON.stringify({ error: 'Site not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Calculate next run time
        const { data: nextRun } = await supabase.rpc('calculate_next_scan_run', {
          p_frequency: frequency,
          p_schedule_time: schedule_time,
          p_schedule_day: schedule_day,
          p_schedule_date: schedule_date,
        });

        const { data, error } = await supabase
          .from('pf_clarity_scheduled_scans')
          .insert({
            site_id,
            frequency,
            schedule_time,
            schedule_day,
            schedule_date,
            notification_enabled: notification_enabled ?? true,
            next_run_at: nextRun,
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, schedule: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_schedule': {
        const { schedule_id, ...updates } = body;

        const { data: schedule } = await supabase
          .from('pf_clarity_scheduled_scans')
          .select('site_id, pf_clarity_sites(user_id)')
          .eq('id', schedule_id)
          .single();

        if (!schedule || schedule.pf_clarity_sites?.user_id !== user.id) {
          return new Response(JSON.stringify({ error: 'Schedule not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Recalculate next run if schedule changed
        if (updates.frequency || updates.schedule_time || updates.schedule_day || updates.schedule_date) {
          const current = await supabase
            .from('pf_clarity_scheduled_scans')
            .select('*')
            .eq('id', schedule_id)
            .single();

          const { data: nextRun } = await supabase.rpc('calculate_next_scan_run', {
            p_frequency: updates.frequency || current.data.frequency,
            p_schedule_time: updates.schedule_time || current.data.schedule_time,
            p_schedule_day: updates.schedule_day || current.data.schedule_day,
            p_schedule_date: updates.schedule_date || current.data.schedule_date,
          });

          updates.next_run_at = nextRun;
        }

        const { error } = await supabase
          .from('pf_clarity_scheduled_scans')
          .update(updates)
          .eq('id', schedule_id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete_schedule': {
        const { schedule_id } = body;

        const { data: schedule } = await supabase
          .from('pf_clarity_scheduled_scans')
          .select('site_id, pf_clarity_sites(user_id)')
          .eq('id', schedule_id)
          .single();

        if (!schedule || schedule.pf_clarity_sites?.user_id !== user.id) {
          return new Response(JSON.stringify({ error: 'Schedule not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error } = await supabase
          .from('pf_clarity_scheduled_scans')
          .delete()
          .eq('id', schedule_id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'process_queue': {
        // Get pending scans
        const { data: pending } = await supabase
          .from('pf_clarity_scan_queue')
          .select('*')
          .eq('status', 'pending')
          .lte('scheduled_for', new Date().toISOString())
          .order('priority', { ascending: true })
          .order('scheduled_for', { ascending: true })
          .limit(10);

        if (!pending || pending.length === 0) {
          return new Response(JSON.stringify({ success: true, processed: 0 }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Process each scan (would trigger actual scan via another function)
        for (const job of pending) {
          await supabase
            .from('pf_clarity_scan_queue')
            .update({ status: 'running', started_at: new Date().toISOString() })
            .eq('id', job.id);

          // TODO: Trigger actual scan via pf-clarity-wordpress-bridge
          console.log(`Processing scan for site ${job.site_id}`);
        }

        return new Response(JSON.stringify({ success: true, processed: pending.length }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Schedule manager error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
