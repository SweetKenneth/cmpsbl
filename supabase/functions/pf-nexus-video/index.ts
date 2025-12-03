import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VideoRequest {
  prompt: string;
  duration?: number;
  format?: string;
  project_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { prompt, duration = 5, format = 'mp4', project_id }: VideoRequest = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Mock video generation (replace with actual API when configured)
    const mockUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    const usedProvider = 'mock';
    const cost = 2.5;

    // Store in outputs
    const { data: output } = await supabaseClient
      .from('pf_video_outputs')
      .insert({
        project_id,
        api: usedProvider,
        provider: usedProvider,
        prompt,
        duration,
        format,
        cost_cents: Math.round(cost * 100),
        url: mockUrl,
        metadata: { generated_at: new Date().toISOString(), mock: true }
      })
      .select()
      .single();

    // Log cost
    await supabaseClient
      .from('pf_cost_logs')
      .insert({
        operation_type: 'video_generation',
        provider: usedProvider,
        cost_cents: Math.round(cost * 100),
        metadata: { prompt, duration, format }
      });

    return new Response(
      JSON.stringify({
        success: true,
        url: mockUrl,
        provider: usedProvider,
        cost_cents: Math.round(cost * 100),
        output_id: output?.id,
        job_id: output?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Video generation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});