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

    const { action } = await req.json();

    switch (action) {
      case 'get_config': {
        const { data: config } = await supabase
          .from('pf_clarity_whitelabel')
          .select('*')
          .eq('user_id', user.id)
          .single();

        return new Response(JSON.stringify({
          success: true,
          config,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_config': {
        const { brand_name, logo_url, primary_color, secondary_color, custom_domain, email_from_name, email_from_address, report_footer_text } = await req.json();

        const { data: config } = await supabase
          .from('pf_clarity_whitelabel')
          .upsert({
            user_id: user.id,
            brand_name,
            logo_url,
            primary_color,
            secondary_color,
            custom_domain,
            email_from_name,
            email_from_address,
            report_footer_text,
            plan_tier: 'reseller',
          })
          .select()
          .single();

        return new Response(JSON.stringify({
          success: true,
          config,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'manage_clients': {
        const { sub_action, client_data, client_id } = await req.json();

        if (sub_action === 'list') {
          const { data: clients } = await supabase
            .from('pf_clarity_clients')
            .select('*')
            .eq('reseller_id', user.id)
            .order('created_at', { ascending: false });

          return new Response(JSON.stringify({
            success: true,
            clients,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (sub_action === 'create') {
          const { data: client } = await supabase
            .from('pf_clarity_clients')
            .insert({
              reseller_id: user.id,
              ...client_data,
            })
            .select()
            .single();

          return new Response(JSON.stringify({
            success: true,
            client,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (sub_action === 'update') {
          const { error } = await supabase
            .from('pf_clarity_clients')
            .update(client_data)
            .eq('id', client_id)
            .eq('reseller_id', user.id);

          if (error) throw error;

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ error: 'Invalid sub_action' }), {
          status: 400,
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
    console.error('White-label error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
