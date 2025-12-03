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

    const { action, update_id } = await req.json();

    switch (action) {
      case 'check_updates':
        const { data: pendingUpdates } = await supabase
          .from('system_updates')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        return new Response(JSON.stringify({ 
          success: true,
          updates: pendingUpdates || [],
          count: pendingUpdates?.length || 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'apply_update':
        if (!update_id) throw new Error('update_id required');

        await supabase
          .from('system_updates')
          .update({ 
            status: 'deployed',
            deployed_at: new Date().toISOString()
          })
          .eq('id', update_id);

        await supabase.from('update_deployment_logs').insert({
          update_id,
          action: 'deploy',
          target: 'system',
          status: 'success',
          details: { deployed_by: user.id }
        });

        console.log('Update applied:', { update_id });

        return new Response(JSON.stringify({ 
          success: true,
          message: 'Update applied successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'rollback':
        if (!update_id) throw new Error('update_id required');

        await supabase
          .from('system_updates')
          .update({ status: 'rolled_back' })
          .eq('id', update_id);

        await supabase.from('update_deployment_logs').insert({
          update_id,
          action: 'rollback',
          target: 'system',
          status: 'success',
          details: { rolled_back_by: user.id }
        });

        console.log('Update rolled back:', { update_id });

        return new Response(JSON.stringify({ 
          success: true,
          message: 'Update rolled back successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error('Invalid action');
    }

  } catch (error: any) {
    console.error('Error in update checker:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
