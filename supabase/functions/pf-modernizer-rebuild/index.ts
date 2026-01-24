import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Direct Groq call - no free-tier-router fallback chain
async function callGroqDirect(systemPrompt: string, userPrompt: string): Promise<string> {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  console.log('Calling Groq directly for modernization...');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 12000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { job_id } = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get job and extraction
    const { data: job } = await supabase
      .from('modernizer_jobs')
      .select('*, modernizer_extractions(*)')
      .eq('id', job_id)
      .single();

    if (!job) throw new Error('Job not found');

    await supabase
      .from('modernizer_jobs')
      .update({ job_status: 'rebuilding' })
      .eq('id', job_id);

    const extractedContent = job.extracted_content?.markdown || job.extracted_content?.html || '';
    const metadata = job.extracted_metadata || {};
    const improveContent = job.improve_content !== false;

    // Enhanced AI rebuild prompt
    const systemPrompt = `You are an elite web modernization architect. Transform legacy websites into production-grade modern experiences.

${improveContent ? `CONTENT IMPROVEMENT MODE: Active
- Rewrite unclear or poorly written copy for better clarity and impact
- Generate descriptive alt text for all images (never leave empty)
- Optimize headings and text for SEO keywords naturally
- Maintain the original brand voice and tone
- Fix grammar, spelling, and awkward phrasing
` : ''}
Your modernization standards:
- Complete, valid HTML5 with semantic structure (<header>, <nav>, <main>, <article>, <section>, <footer>)
- Beautiful, responsive CSS using modern flexbox/grid (NO frameworks, pure CSS only)
- WCAG 2.1 AA compliance (proper contrast ratios, ARIA labels, keyboard navigation, alt text)
- SEO excellence (OpenGraph tags, Twitter Cards, semantic HTML, structured data)
- Mobile-first responsive design (breakpoints: 640px, 768px, 1024px, 1280px)
- Modern design aesthetic: clean typography, proper spacing, subtle animations
- Performance optimized: inline critical CSS, no external dependencies`;

    const prompt = `Modernize this ${job.selected_theme || 'modern'} website:

ORIGINAL CONTENT:
${extractedContent.substring(0, 15000)}

METADATA: ${JSON.stringify(metadata)}

CRITICAL REQUIREMENTS:
1. Start with <!DOCTYPE html>
2. Include complete <head> with meta tags, title, OpenGraph
3. Inline ALL CSS in <style> tag
4. Use semantic HTML5 elements
5. Add proper ARIA labels and alt text
6. Ensure mobile responsiveness
7. Match the "${job.selected_theme}" theme aesthetic:
   - minimal: Clean, white space, subtle colors, sans-serif
   - creative: Bold gradients, dynamic layouts, playful fonts
   - pro: Corporate, trustworthy, blue tones, structured

8. Return ONLY the HTML - no explanations, no markdown blocks, just pure HTML starting with <!DOCTYPE html>`;

    // Call Groq directly - stable and reliable
    let htmlContent = await callGroqDirect(systemPrompt, prompt);
    console.log(`AI generation complete using groq/llama-3.3-70b`);

    // Clean up markdown code blocks if present
    htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

    // Convert external links to internal
    const sourceDomain = new URL(job.source_url).hostname;
    htmlContent = htmlContent.replace(
      new RegExp(`https?://${sourceDomain.replace(/\./g, '\\.')}(/[^"'\\s]*)`, 'g'),
      '$1'
    );
    htmlContent = htmlContent.replace(
      new RegExp(`https?://(?:www\\.)?${sourceDomain.replace(/\./g, '\\.')}(/[^"'\\s]*)`, 'g'),
      '$1'
    );

    // Save output
    const { data: output } = await supabase
      .from('modernizer_outputs')
      .insert({
        job_id,
        html_content: htmlContent,
        build_type: 'static',
        metadata: { theme: job.selected_theme }
      })
      .select()
      .single();

    await supabase
      .from('modernizer_jobs')
      .update({ 
        job_status: 'completed',
        output_id: output.id,
        rebuilt_files: { 
          files: [
            { path: 'index.html', content: htmlContent }
          ]
        },
        completed_at: new Date().toISOString()
      })
      .eq('id', job_id);

    // Log costs (Groq free tier = $0)
    await supabase.from('cost_logs').insert({
      job_id,
      user_id: job.user_id,
      api_name: 'groq-direct',
      cost_amount: 0,
      tokens_used: 0
    });

    return new Response(JSON.stringify({ success: true, output_id: output.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Rebuild error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});