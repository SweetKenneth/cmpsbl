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

    // Get job
    const { data: job } = await supabase
      .from('modernizer_jobs')
      .select('source_url, extracted_content')
      .eq('id', job_id)
      .single();

    if (!job) throw new Error('Job not found');

    console.log(`🔍 Detecting additional pages for ${job.source_url}...`);

    // Extract links from original content
    const links = extractInternalLinks(job.extracted_content?.html || '', job.source_url);
    const priorityPages = links.slice(0, 5); // Limit to 5 additional pages
    
    console.log(`📄 Found ${links.length} links, processing top ${priorityPages.length}`);

    const additionalPages = [];

    for (const pageUrl of priorityPages) {
      try {
        // Scrape additional page
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: pageUrl,
            formats: ['markdown', 'html'],
          }),
        });

        if (scrapeResponse.ok) {
          const scrapeData = await scrapeResponse.json();
          additionalPages.push({
            url: pageUrl,
            path: new URL(pageUrl).pathname,
            content: scrapeData.data,
            metadata: scrapeData.data.metadata
          });
          
          console.log(`✅ Scraped: ${pageUrl}`);
        }
      } catch (e) {
        console.error(`Failed to scrape ${pageUrl}:`, e);
      }
    }

    // Store additional pages
    await supabase
      .from('modernizer_jobs')
      .update({ 
        extracted_pages: additionalPages,
        page_count: additionalPages.length + 1
      })
      .eq('id', job_id);

    console.log(`✅ Multi-page detection complete: ${additionalPages.length} additional pages`);

    return new Response(JSON.stringify({ 
      success: true, 
      pages: additionalPages,
      total_pages: additionalPages.length + 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Multi-page detection error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function extractInternalLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const baseHostname = new URL(baseUrl).hostname;
  
  // Simple regex to extract href attributes
  const hrefRegex = /href=["']([^"']+)["']/g;
  let match;
  
  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1];
    
    // Skip anchors, external links, and non-http
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    
    try {
      const fullUrl = new URL(href, baseUrl);
      
      // Only include same-domain links
      if (fullUrl.hostname === baseHostname && !links.includes(fullUrl.href)) {
        links.push(fullUrl.href);
      }
    } catch (e) {
      // Invalid URL, skip
    }
  }
  
  // Prioritize common pages
  return links.sort((a, b) => {
    const priority = (url: string) => {
      if (url.includes('/about')) return 10;
      if (url.includes('/contact')) return 9;
      if (url.includes('/services')) return 8;
      if (url.includes('/products')) return 7;
      return 0;
    };
    return priority(b) - priority(a);
  });
}
