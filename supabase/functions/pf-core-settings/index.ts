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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'get': {
        const { key } = params;
        
        // Try user scope first
        let { data: setting } = await supabaseClient
          .from('core_settings')
          .select('*')
          .eq('key', key)
          .eq('scope', `user:${user.id}`)
          .single();

        // Fallback to global
        if (!setting) {
          const { data: globalSetting } = await supabaseClient
            .from('core_settings')
            .select('*')
            .eq('key', key)
            .eq('scope', 'global')
            .single();
          setting = globalSetting;
        }

        return new Response(
          JSON.stringify({ success: true, setting }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'set': {
        const { key, value, scope = `user:${user.id}` } = params;

        // Only admins can set global scope
        if (scope === 'global') {
          const { data: isAdmin } = await supabaseClient.rpc('has_role', {
            _user_id: user.id,
            _role: 'admin'
          });
          if (!isAdmin) throw new Error('Admin required for global settings');
        }

        await supabaseClient
          .from('core_settings')
          .upsert({
            key,
            value,
            scope,
            updated_by: user.id,
          });

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'global': {
        const { data: isAdmin } = await supabaseClient.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });
        if (!isAdmin) throw new Error('Admin access required');

        const { data: settings } = await supabaseClient
          .from('core_settings')
          .select('*')
          .eq('scope', 'global');

        return new Response(
          JSON.stringify({ success: true, settings }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'feature_flags': {
        const { data: isAdmin } = await supabaseClient.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });
        if (!isAdmin) throw new Error('Admin access required');

        const { feature, enabled } = params;

        await supabaseClient
          .from('core_settings')
          .upsert({
            key: `feature_${feature}`,
            value: enabled,
            scope: 'global',
            updated_by: user.id,
          });

        await supabaseClient.from('audit_logs').insert({
          action: 'feature_flag_updated',
          performed_by: user.id,
          details: { feature, enabled }
        });

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in pf-core-settings:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
