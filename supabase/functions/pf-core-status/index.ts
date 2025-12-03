import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get system settings
    const { data: settings } = await supabaseClient
      .from('core_settings')
      .select('*')
      .eq('scope', 'global');

    const settingsMap = settings?.reduce((acc: any, s: any) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    // Get total users count
    const { count: usersCount } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active subscriptions count
    const { count: activeSubscriptions } = await supabaseClient
      .from('core_subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trialing']);

    // Get total API calls today
    const today = new Date().toISOString().split('T')[0];
    const { data: todayUsage } = await supabaseClient
      .from('core_usage')
      .select('calls')
      .eq('period', today);

    const totalCallsToday = todayUsage?.reduce((sum: number, row: any) => sum + row.calls, 0) || 0;

    const status = {
      system: {
        name: settingsMap?.system_name || 'PromptFluid',
        version: settingsMap?.system_version || '1.0.0',
        maintenance_mode: settingsMap?.maintenance_mode || false,
        uptime: 99.9
      },
      stats: {
        total_users: usersCount || 0,
        active_subscriptions: activeSubscriptions || 0,
        total_calls_today: totalCallsToday
      },
      limits: {
        max_api_calls_per_minute: settingsMap?.max_api_calls_per_minute || 60,
        trial_days: settingsMap?.trial_days || 3
      }
    };

    return new Response(
      JSON.stringify({ success: true, status }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in pf-core-status:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
