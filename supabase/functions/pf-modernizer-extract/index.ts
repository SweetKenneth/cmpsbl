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
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('modernizer_jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      throw new Error('Job not found');
    }

    // Update status
    await supabase
      .from('modernizer_jobs')
      .update({ job_status: 'extracting' })
      .eq('id', job_id);

    // Extract with Firecrawl
    const crawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: job.source_url,
        formats: ['markdown', 'html'],
        onlyMainContent: true
      })
    });

    if (!crawlResponse.ok) {
      throw new Error('Failed to extract website');
    }

    const crawlData = await crawlResponse.json();
    const html = crawlData.data?.html || '';
    
    // CMS Detection
    const detectedCMS = detectCMS(html, crawlData.data?.metadata);
    console.log(`🔍 Detected CMS: ${detectedCMS || 'None'}`);
    
    // Save extraction
    const { data: extraction, error: extractionError } = await supabase
      .from('modernizer_extractions')
      .insert({
        job_id,
        original_html: html,
        original_css: '',
        original_metadata: crawlData.data?.metadata || {}
      })
      .select()
      .single();

    if (extractionError) {
      throw extractionError;
    }

    // Update job with extraction_id and detected CMS
    await supabase
      .from('modernizer_jobs')
      .update({ 
        job_status: 'extracted',
        extraction_id: extraction.id,
        extracted_content: crawlData.data,
        detected_cms: detectedCMS
      })
      .eq('id', job_id);

    // Log costs
    await supabase.from('cost_logs').insert({
      job_id,
      user_id: job.user_id,
      api_name: 'firecrawl',
      cost_amount: 0.001,
      tokens_used: 0
    });

    return new Response(JSON.stringify({ success: true, extraction_id: extraction.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Extract error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// CMS Detection Logic
function detectCMS(html: string, metadata: any): string | null {
  const htmlLower = html.toLowerCase();
  
  // WordPress
  if (htmlLower.includes('wp-content') || 
      htmlLower.includes('wordpress') || 
      htmlLower.includes('wp-includes') ||
      metadata?.generator?.includes('WordPress')) {
    return 'WordPress';
  }
  
  // Wix
  if (htmlLower.includes('wix.com') || 
      htmlLower.includes('_wix') || 
      htmlLower.includes('wixstatic')) {
    return 'Wix';
  }
  
  // Squarespace
  if (htmlLower.includes('squarespace') || 
      htmlLower.includes('sqsp')) {
    return 'Squarespace';
  }
  
  // Webflow
  if (htmlLower.includes('webflow') || 
      htmlLower.includes('w-') ||
      metadata?.generator?.includes('Webflow')) {
    return 'Webflow';
  }
  
  // Shopify
  if (htmlLower.includes('shopify') || 
      htmlLower.includes('cdn.shopify')) {
    return 'Shopify';
  }
  
  // Drupal
  if (htmlLower.includes('drupal') || 
      metadata?.generator?.includes('Drupal')) {
    return 'Drupal';
  }
  
  // Joomla
  if (htmlLower.includes('joomla') || 
      metadata?.generator?.includes('Joomla')) {
    return 'Joomla';
  }
  
  return null;
}
