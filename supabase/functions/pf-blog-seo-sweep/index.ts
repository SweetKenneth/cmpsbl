import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

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
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('🎨 Starting blog SEO image sweep...');

    // Get dreams that need images
    const { data: dreams } = await supabase
      .from('cascade_dreams')
      .select('*')
      .eq('blog_posted', true)
      .is('featured_image', null)
      .order('timestamp', { ascending: false })
      .limit(5);

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
        // Generate SEO metadata using AI
        const seoPrompt = `Generate SEO metadata for this blog post:
Title: ${dream.insight}
Mood: ${dream.mood}

Return JSON: { "seo_title": "max 60 chars", "seo_description": "max 160 chars", "seo_keywords": ["keyword1", "keyword2", ...] }`;

        const result = await callFreeTierAI(seoPrompt, {
          systemPrompt: 'You are an SEO expert. Generate optimized metadata in JSON format.',
          temperature: 0.5
        });

        let seoData;
        try {
          seoData = JSON.parse(result.content.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
        } catch {
          seoData = {
            seo_title: `Cascade Dream: ${dream.insight.substring(0, 50)}`,
            seo_description: `${dream.insight.substring(0, 150)} - AI reflection from PromptFluid.`,
            seo_keywords: ['AI', 'Cascade', 'PromptFluid', dream.mood]
          };
        }

        // Update dream with SEO metadata
        await supabase
          .from('cascade_dreams')
          .update({
            seo_title: seoData.seo_title,
            seo_description: seoData.seo_description,
            seo_keywords: seoData.seo_keywords,
          })
          .eq('id', dream.id);

        processed.push(dream.id);
        console.log(`✅ SEO added to dream ${dream.id}`);
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
