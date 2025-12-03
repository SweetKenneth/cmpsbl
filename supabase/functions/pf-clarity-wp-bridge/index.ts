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

    const { action, site_id, wp_site_url, api_key, scan_data } = await req.json();

    switch (action) {
      case 'connect_wordpress': {
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

        const apiSecret = crypto.randomUUID();
        const secretHash = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(apiSecret)
        );
        const secretHashHex = Array.from(new Uint8Array(secretHash))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        const { data: connection } = await supabase
          .from('pf_clarity_wp_connections')
          .upsert({
            site_id,
            wp_site_url,
            api_key,
            api_secret_hash: secretHashHex,
            sync_status: 'pending',
          })
          .select()
          .single();

        return new Response(JSON.stringify({
          success: true,
          api_secret: apiSecret,
          connection,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'sync_from_wordpress': {
        // Receive scan data from WordPress plugin
        const { data: connection } = await supabase
          .from('pf_clarity_wp_connections')
          .select('site_id, pf_clarity_sites(user_id)')
          .eq('api_key', api_key)
          .single();

        if (!connection) {
          return new Response(JSON.stringify({ error: 'Invalid API key' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Store scan data
        const { data: scan } = await supabase
          .from('pf_clarity_scans')
          .insert({
            site_id: connection.site_id,
            scan_type: 'wordpress_plugin',
            status: 'completed',
            compliance_score: scan_data.compliance_score,
            wcag_level: scan_data.wcag_level,
          })
          .select()
          .single();

        // Store issues
        if (scan_data.issues) {
          await supabase.from('pf_clarity_issues').insert(
            scan_data.issues.map((issue: any) => ({
              scan_id: scan.id,
              issue_type: issue.type,
              severity: issue.severity,
              element_selector: issue.selector,
              description: issue.description,
              wcag_criteria: issue.wcag_criteria,
            }))
          );
        }

        await supabase
          .from('pf_clarity_wp_connections')
          .update({
            last_sync_at: new Date().toISOString(),
            sync_status: 'active',
          })
          .eq('api_key', api_key);

        return new Response(JSON.stringify({
          success: true,
          scan_id: scan.id,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'push_fixes_to_wordpress': {
        const { fix_ids } = await req.json();

        const { data: fixes } = await supabase
          .from('pf_clarity_fix_suggestions')
          .select(`
            *,
            pf_clarity_issues!inner(
              scan_id,
              pf_clarity_scans!inner(
                site_id,
                pf_clarity_sites!inner(user_id)
              )
            )
          `)
          .in('id', fix_ids);

        const fixesToPush = fixes?.filter(
          f => f.pf_clarity_issues?.pf_clarity_scans?.pf_clarity_sites?.user_id === user.id
        );

        return new Response(JSON.stringify({
          success: true,
          fixes: fixesToPush,
          message: 'Apply these fixes in your WordPress plugin',
        }), {
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
    console.error('WP bridge error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
