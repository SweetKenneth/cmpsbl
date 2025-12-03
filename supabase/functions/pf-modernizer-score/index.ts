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

    const { data: job } = await supabase
      .from('modernizer_jobs')
      .select('*, modernizer_outputs(*)')
      .eq('id', job_id)
      .single();

    if (!job) throw new Error('Job not found');

    const htmlContent = job.rebuilt_files?.['index.html'] || '';

    // Calculate accessibility score
    const accessibilityScore = calculateAccessibilityScore(htmlContent);
    
    // Calculate SEO score
    const seoScore = calculateSEOScore(htmlContent);

    // Update job with scores
    await supabase
      .from('modernizer_jobs')
      .update({ 
        accessibility_score: accessibilityScore,
        seo_score: seoScore
      })
      .eq('id', job_id);

    return new Response(JSON.stringify({ 
      success: true, 
      accessibility_score: accessibilityScore,
      seo_score: seoScore
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Score error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function calculateAccessibilityScore(html: string): number {
  let score = 0;
  let checks = 0;
  
  // Semantic HTML structure (40 points)
  if (html.includes('<header')) { score += 10; checks++; }
  if (html.includes('<nav')) { score += 10; checks++; }
  if (html.includes('<main')) { score += 10; checks++; }
  if (html.includes('<footer')) { score += 10; checks++; }
  
  // ARIA and roles (30 points)
  if (html.includes('aria-label')) { score += 10; checks++; }
  if (html.includes('role=')) { score += 10; checks++; }
  if (html.includes('aria-describedby')) { score += 5; checks++; }
  if (html.includes('aria-live')) { score += 5; checks++; }
  
  // Image accessibility (20 points)
  const imgTags = html.match(/<img[^>]*>/g) || [];
  const imgsWithAlt = imgTags.filter(img => img.includes('alt=')).length;
  if (imgTags.length > 0) {
    score += (imgsWithAlt / imgTags.length) * 20;
    checks++;
  } else {
    score += 10; // No images = no accessibility issue
  }
  
  // Form accessibility (10 points)
  if (html.includes('<label')) { score += 5; checks++; }
  if (html.includes('for=')) { score += 5; checks++; }
  
  return Math.min(Math.round(score), 100);
}

function calculateSEOScore(html: string): number {
  let score = 0;
  
  // Essential meta tags (40 points)
  if (html.includes('<meta name="description"')) { score += 15; }
  if (html.includes('<title>') && !html.includes('<title></title>')) { score += 15; }
  if (html.includes('charset=')) { score += 5; }
  if (html.includes('viewport')) { score += 5; }
  
  // OpenGraph and Social (25 points)
  if (html.includes('og:title')) { score += 8; }
  if (html.includes('og:description')) { score += 7; }
  if (html.includes('og:image')) { score += 5; }
  if (html.includes('twitter:card')) { score += 5; }
  
  // Structured data (15 points)
  if (html.includes('application/ld+json')) { score += 15; }
  
  // Heading hierarchy (15 points)
  const h1Count = (html.match(/<h1/g) || []).length;
  if (h1Count === 1) { score += 10; } // Exactly one H1
  else if (h1Count > 1) { score += 5; } // Multiple H1s (less ideal)
  
  if (html.includes('<h2')) { score += 5; }
  
  // Semantic HTML (5 points)
  if (html.includes('<article') || html.includes('<section')) { score += 5; }
  
  return Math.min(Math.round(score), 100);
}
