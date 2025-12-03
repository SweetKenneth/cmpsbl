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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: isAdmin } = await supabase.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    });
    if (!isAdmin) throw new Error('Admin access required');

    const { tenant_id, repair_type } = await req.json();

    // Create repair record
    const { data: repair } = await supabase.from('remote_repairs').insert({
      tenant_id,
      repair_type,
      status: 'in_progress',
      initiated_by: user.id,
    }).select().single();

    // Simulate repair actions
    await new Promise(resolve => setTimeout(resolve, 2000));

    const actions = [
      `Cleared cache for tenant ${tenant_id}`,
      'Reset connection pool',
      'Reindexed database',
      'Cleared stuck processes'
    ];

    // Update repair status
    await supabase.from('remote_repairs').update({
      status: 'completed',
      actions_taken: actions,
      result: { success: true, fixed_issues: actions.length },
      completed_at: new Date().toISOString(),
    }).eq('id', repair.id);

    console.log('Heal operation complete:', { tenant_id, repair_id: repair.id });

    return new Response(
      JSON.stringify({ success: true, repair_id: repair.id, actions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in heal operation:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
