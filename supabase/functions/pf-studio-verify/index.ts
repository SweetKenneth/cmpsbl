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

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { applyId } = await req.json();

    if (!applyId) {
      throw new Error('Apply ID required');
    }

    // Verify apply ownership
    const { data: apply } = await supabaseClient
      .from('studio_applies')
      .select('*, studio_previews!inner(*, studio_scans!inner(*, studio_connections!inner(*)))')
      .eq('id', applyId)
      .single();

    if (!apply || apply.studio_previews.studio_scans.studio_connections.user_id !== user.id) {
      throw new Error('Apply not found or unauthorized');
    }

    // Simulate verification tests
    const lighthouse = {
      performance: 88,
      accessibility: 92,
      best_practices: 85,
      seo: 95
    };

    const vitals = {
      lcp: 2.2,
      lcp_delta: -0.6,
      fid: 85,
      fid_delta: -95,
      cls: 0.08,
      cls_delta: -0.07
    };

    const wcag = {
      level_a: 98,
      level_aa: 94,
      level_aaa: 78,
      violations: 3
    };

    const defense = {
      risk_score: 12,
      threats_detected: 0,
      security_headers: 8
    };

    const overall_score = Math.round(
      (lighthouse.performance + lighthouse.accessibility + lighthouse.seo + wcag.level_aa) / 4
    );

    // Create verification record
    const { data: verification, error: verifyError } = await supabaseClient
      .from('studio_verifications')
      .insert({
        apply_id: applyId,
        lighthouse,
        vitals,
        wcag,
        defense,
        regressions: [],
        overall_score
      })
      .select()
      .single();

    if (verifyError) throw verifyError;

    // Create audit log
    await supabaseClient.from('studio_audit').insert({
      entity: 'verification',
      entity_id: verification.id,
      action: 'complete',
      actor_id: user.id,
      details: { overall_score }
    });

    console.log(`Verification completed: ${verification.id}, score: ${overall_score}`);

    return new Response(
      JSON.stringify({
        success: true,
        verification: {
          id: verification.id,
          lighthouse,
          vitals,
          wcag,
          defense,
          overall_score
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in pf-studio-verify:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
