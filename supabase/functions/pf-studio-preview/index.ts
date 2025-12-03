import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { project_id, changes } = await req.json();

    console.log(`👁️ Studio: Generating preview for ${project_id}`);

    const preview = {
      project_id,
      preview_url: `https://preview-${project_id}.lovable.app`,
      status: 'building',
      changes_applied: changes?.length || 0,
      estimated_time: '30s',
      created_at: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({ success: true, preview }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Studio preview error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
