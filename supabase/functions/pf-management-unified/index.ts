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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check admin role
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { action, ...params } = await req.json();

    let result: any = { action, status: 'success' };

    switch (action) {
      case 'get_settings':
        try {
          const [defenseConfig, accessConfig, systemConfig] = await Promise.all([
            supabase.from('defense_config').select('*').limit(1).maybeSingle(),
            supabase.from('access_config').select('*').limit(1).maybeSingle(),
            supabase.from('system_config').select('*').limit(1).maybeSingle()
          ]);

          result.settings = {
            defense: defenseConfig.data || null,
            access: accessConfig.data || null,
            system: systemConfig.data || null
          };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'update_defense_config':
        try {
          const { data, error } = await supabase
            .from('defense_config')
            .upsert(params.config)
            .select();
          
          if (error) throw error;
          result.data = data;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'list_users':
        try {
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*, user_roles(role)')
            .order('created_at', { ascending: false })
            .limit(params.limit || 50);
          
          if (error) throw error;
          result.users = profiles;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'update_user_role':
        try {
          const { data, error } = await supabase
            .from('user_roles')
            .upsert({
              user_id: params.user_id,
              role: params.role
            })
            .select();
          
          if (error) throw error;
          result.data = data;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'get_api_keys':
        try {
          const { data, error } = await supabase
            .from('website_api_keys')
            .select('*')
            .eq('user_id', user.id);
          
          if (error) throw error;
          result.api_keys = data;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown action: ${action}`;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Management unified error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
