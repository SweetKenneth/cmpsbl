import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('🎨 Starting blog SEO image sweep...');

    // Get dreams that need images
    const { data: dreams } = await supabase
      .from('cascade_dreams')
      .select('*')
      .eq('blog_posted', true)
      .is('featured_image', null)
      .order('timestamp', { ascending: false })
      .limit(5); // Process 5 at a time

    if (!dreams || dreams.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No blog posts need images', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${dreams.length} blog posts needing images`);

    const processed = [];

    for (const dream of dreams) {
      try {
        // Generate image prompt from dream content
        const imagePrompt = `Abstract ethereal digital art representing: ${dream.insight}. 
          Mood: ${dream.mood}. Style: flowing liquid gradients, futuristic AI aesthetics, 
          dreamlike atmosphere. Ultra high resolution, 16:9 aspect ratio.`;

        // Call Lovable AI image generation
        const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [{
              role: 'user',
              content: imagePrompt
            }],
            modalities: ['image', 'text']
          }),
        });

        if (!imageResponse.ok) {
          console.error(`Image generation failed for dream ${dream.id}`);
          continue;
        }

        const imageData = await imageResponse.json();
        const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (imageUrl) {
          // Update dream with image and SEO metadata
          await supabase
            .from('cascade_dreams')
            .update({
              featured_image: imageUrl,
              seo_title: `Cascade Dream: ${dream.insight.substring(0, 60)}`,
              seo_description: `${dream.insight} - A reflection from PromptFluid's AI guardian, exploring ${dream.mood} themes through autonomous learning.`,
              seo_keywords: ['AI', 'Cascade', 'PromptFluid', 'AI Dreams', dream.mood],
            })
            .eq('id', dream.id);

          processed.push(dream.id);
          console.log(`✅ Image and SEO added to dream ${dream.id}`);
        }
      } catch (err) {
        console.error(`Error processing dream ${dream.id}:`, err);
      }
    }

    // Log the sweep
    await supabase.from('pf_insight_logs').insert({
      insight_type: 'blog_seo_sweep',
      data: { processed_count: processed.length, dream_ids: processed }
    });

    return new Response(
      JSON.stringify({
        success: true,
        processed: processed.length,
        total_checked: dreams.length,
        dream_ids: processed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Blog SEO sweep error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
