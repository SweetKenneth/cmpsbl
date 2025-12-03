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

    const { action, site_id, certification_type } = await req.json();

    switch (action) {
      case 'request_certification': {
        const { data: site } = await supabase
          .from('pf_clarity_sites')
          .select('*, pf_clarity_scans!inner(*)')
          .eq('id', site_id)
          .eq('user_id', user.id)
          .order('created_at', { foreignTable: 'pf_clarity_scans', ascending: false })
          .limit(1, { foreignTable: 'pf_clarity_scans' })
          .single();

        if (!site) {
          return new Response(JSON.stringify({ error: 'Site not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const latestScan = site.pf_clarity_scans?.[0];
        const score = latestScan?.compliance_score || 0;

        const minScores = {
          wcag_a: 70,
          wcag_aa: 85,
          wcag_aaa: 95,
        };

        if (score < minScores[certification_type as keyof typeof minScores]) {
          return new Response(JSON.stringify({
            success: false,
            error: `Score ${score}% does not meet minimum requirement of ${minScores[certification_type as keyof typeof minScores]}%`,
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const badgeCode = `<div class="pf-clarity-badge" data-cert-type="${certification_type}">
  <a href="https://clarity.promptfluid.com/verify/${site_id}" target="_blank">
    <img src="https://clarity.promptfluid.com/badges/${certification_type}.svg" alt="WCAG ${certification_type.replace('wcag_', '').toUpperCase()} Certified" />
  </a>
</div>`;

        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        const { data: cert } = await supabase
          .from('pf_clarity_certifications')
          .insert({
            site_id,
            certification_type,
            status: 'active',
            score_at_certification: score,
            badge_code: badgeCode,
            expires_at: expiresAt.toISOString(),
            audit_trail: JSON.stringify([{
              action: 'issued',
              timestamp: new Date().toISOString(),
              score,
              scan_id: latestScan.id,
            }]),
          })
          .select()
          .single();

        return new Response(JSON.stringify({
          success: true,
          certification: cert,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_certifications': {
        const { data: certs } = await supabase
          .from('pf_clarity_certifications')
          .select('*, pf_clarity_sites!inner(user_id, site_url)')
          .eq('pf_clarity_sites.user_id', user.id)
          .order('issued_at', { ascending: false });

        return new Response(JSON.stringify({
          success: true,
          certifications: certs,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'verify_certification': {
        const { cert_id } = await req.json();

        const { data: cert } = await supabase
          .from('pf_clarity_certifications')
          .select('*, pf_clarity_sites(site_url)')
          .eq('id', cert_id)
          .single();

        if (!cert) {
          return new Response(JSON.stringify({ error: 'Certification not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const isValid = cert.status === 'active' && new Date(cert.expires_at) > new Date();

        return new Response(JSON.stringify({
          success: true,
          valid: isValid,
          certification: cert,
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
    console.error('Certification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
