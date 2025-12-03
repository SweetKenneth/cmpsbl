import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageRequest {
  prompt: string;
  style?: string;
  resolution?: string;
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

    const { prompt, style, resolution = '1024x1024', project_id }: ImageRequest = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Generate cache hash
    const hashData = `${prompt}:${style || 'default'}:${resolution}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(hashData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check cache first
    const { data: cached } = await supabaseClient
      .from('pf_media_cache')
      .select('*')
      .eq('hash', hash)
      .gt('ttl_expiration', new Date().toISOString())
      .maybeSingle();

    if (cached) {
      await supabaseClient
        .from('pf_media_cache')
        .update({ hit_count: cached.hit_count + 1 })
        .eq('id', cached.id);

      return new Response(
        JSON.stringify({
          success: true,
          cached: true,
          url: cached.url,
          metadata: cached.metadata
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mock generation (replace with actual API calls when keys are configured)
    const mockUrl = `https://picsum.photos/seed/${hash}/1024/1024`;
    const usedProvider = 'mock';
    const cost = 0.5;

    // Store in outputs
    const { data: output } = await supabaseClient
      .from('pf_image_outputs')
      .insert({
        project_id,
        api: usedProvider,
        provider: usedProvider,
        prompt,
        style: style || 'default',
        resolution,
        cost_cents: Math.round(cost * 100),
        url: mockUrl,
        metadata: { generated_at: new Date().toISOString(), mock: true }
      })
      .select()
      .single();

    // Cache for reuse
    await supabaseClient
      .from('pf_media_cache')
      .insert({
        hash,
        type: 'image',
        url: mockUrl,
        metadata: { provider: usedProvider, resolution, style },
        ttl_expiration: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        project_ref: project_id,
        hit_count: 1
      });

    // Log cost
    await supabaseClient
      .from('pf_cost_logs')
      .insert({
        operation_type: 'image_generation',
        provider: usedProvider,
        cost_cents: Math.round(cost * 100),
        metadata: { prompt, resolution, style }
      });

    return new Response(
      JSON.stringify({
        success: true,
        cached: false,
        url: mockUrl,
        provider: usedProvider,
        cost_cents: Math.round(cost * 100),
        output_id: output?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Image generation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});