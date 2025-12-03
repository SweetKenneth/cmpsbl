import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { project_name, repository_url, framework = 'react' } = await req.json();

    console.log(`🏗️ Studio: Connecting project ${project_name}`);

    const projectData = {
      name: project_name,
      repository_url,
      framework,
      status: 'connected',
      connected_at: new Date().toISOString(),
    };

    await supabaseClient.from('learning_logs').insert({
      event_type: 'studio_connect',
      project_id: project_name,
      payload: projectData,
      success: true,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        project: projectData,
        message: 'Project connected successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Studio connect error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
