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
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, extension_id, version, browser, url, scan_type, scan_data, screenshot_url } = await req.json();

    switch (action) {
      case 'register_extension': {
        const { data: install, error } = await supabase
          .from('pf_clarity_extension_installs')
          .upsert({
            user_id: user.id,
            extension_id,
            version,
            browser,
            last_active: new Date().toISOString(),
          }, {
            onConflict: 'user_id,extension_id',
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, install }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'quick_scan': {
        const { data: scan, error } = await supabase
          .from('pf_clarity_quick_scans')
          .insert({
            user_id: user.id,
            url,
            scan_type,
            scan_data,
            screenshot_url,
            compliance_score: scan_data?.compliance_score || 0,
            issue_count: scan_data?.issue_count || 0,
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, scan }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_sites': {
        const { data: sites, error } = await supabase
          .from('pf_clarity_sites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, sites }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_quick_scans': {
        const { data: scans, error } = await supabase
          .from('pf_clarity_quick_scans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, scans }), {
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
    console.error('Extension sync error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
