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

    // Get user's connections
    const { data: connections } = await supabaseClient
      .from('studio_connections')
      .select('id')
      .eq('user_id', user.id);

    const connectionIds = connections?.map(c => c.id) || [];

    // Get scan count
    const { count: scanCount } = await supabaseClient
      .from('studio_scans')
      .select('*', { count: 'exact', head: true })
      .in('connection_id', connectionIds);

    // Get completed applies count
    const { count: applyCount } = await supabaseClient
      .from('studio_applies')
      .select('*, studio_previews!inner(*, studio_scans!inner(*))', { count: 'exact', head: true })
      .in('studio_previews.studio_scans.connection_id', connectionIds)
      .eq('status', 'completed');

    // Get recent verifications for average score
    const { data: verifications } = await supabaseClient
      .from('studio_verifications')
      .select('overall_score, studio_applies!inner(*, studio_previews!inner(*, studio_scans!inner(*)))')
      .in('studio_applies.studio_previews.studio_scans.connection_id', connectionIds)
      .limit(10);

    const avgScore = verifications && verifications.length > 0
      ? Math.round(verifications.reduce((sum, v) => sum + v.overall_score, 0) / verifications.length)
      : 0;

    const stats = {
      total_connections: connectionIds.length || 0,
      total_scans: scanCount || 0,
      completed_applies: applyCount || 0,
      average_score: avgScore
    };

    return new Response(
      JSON.stringify({ success: true, stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in pf-studio-stats:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
