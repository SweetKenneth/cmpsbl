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
    const { job_id } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get job with scores and metadata
    const { data: job } = await supabase
      .from('modernizer_jobs')
      .select('*, modernizer_extractions(*)')
      .eq('id', job_id)
      .single();

    if (!job) throw new Error('Job not found');

    // Extract learning insights
    const insights = {
      job_id,
      source_url: job.source_url,
      theme: job.selected_theme,
      accessibility_score: job.accessibility_score,
      seo_score: job.seo_score,
      content_type: detectContentType(job.extracted_metadata),
      patterns_found: extractPatterns(job.extracted_content),
      improvements_made: calculateImprovements(job),
      timestamp: new Date().toISOString()
    };

    // Store in brain learning table
    await supabase.from('pf_brain_observations').insert({
      domain: 'modernizer',
      event_type: 'modernization_complete',
      observation_data: insights,
      confidence_score: calculateConfidence(job),
      impact_score: (job.accessibility_score + job.seo_score) / 2
    });

    console.log(`🧠 Brain learned from job ${job_id}: A11y=${job.accessibility_score}, SEO=${job.seo_score}`);

    return new Response(JSON.stringify({ success: true, insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Brain learning error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function detectContentType(metadata: any): string {
  const title = (metadata?.title || '').toLowerCase();
  const desc = (metadata?.description || '').toLowerCase();
  
  if (title.includes('blog') || title.includes('article')) return 'blog';
  if (title.includes('shop') || title.includes('store') || desc.includes('buy')) return 'ecommerce';
  if (title.includes('portfolio') || desc.includes('work')) return 'portfolio';
  if (title.includes('corporate') || desc.includes('company')) return 'corporate';
  
  return 'general';
}

function extractPatterns(content: any): string[] {
  const patterns: string[] = [];
  const html = content?.html || '';
  
  if (html.includes('nav') || html.includes('menu')) patterns.push('navigation');
  if (html.includes('form')) patterns.push('forms');
  if (html.includes('img')) patterns.push('images');
  if (html.includes('video')) patterns.push('media');
  if (html.includes('table')) patterns.push('tables');
  
  return patterns;
}

function calculateImprovements(job: any): string[] {
  const improvements: string[] = [];
  
  if (job.accessibility_score > 90) improvements.push('excellent_accessibility');
  if (job.seo_score > 90) improvements.push('excellent_seo');
  if (job.accessibility_score > 80 && job.seo_score > 80) improvements.push('balanced_quality');
  
  return improvements;
}

function calculateConfidence(job: any): number {
  // Higher confidence if both scores are good
  const avgScore = (job.accessibility_score + job.seo_score) / 2;
  return Math.min(avgScore / 100, 1);
}
