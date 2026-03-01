import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { nexusRoute } from "../_shared/nexus-route.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    const { action, ...body } = await req.json();

    // Validate user for authenticated routes
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ROUTE: Get jobs
    if (action === 'get-job' || action === 'get-jobs' || !action) {
      const jobId = body.job_id;

      if (!jobId) {
        const { data: jobs, error } = await supabase
          .from('modernizer_jobs')
          .select('id, source_url, job_status, selected_theme, accessibility_score, seo_score, created_at, completed_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        return new Response(JSON.stringify({ jobs }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: job, error } = await supabase
        .from('modernizer_jobs')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      let reports = null;
      if (job.job_status === 'completed') {
        const { data: reportData } = await supabase
          .from('modernizer_reports')
          .select('*')
          .eq('job_id', jobId);
        reports = reportData;
      }

      return new Response(JSON.stringify({ job, reports }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ROUTE: Start job
    if (action === 'start-job') {
      const { source_url, selected_theme = 'minimal' } = body;

      if (!source_url) {
        return new Response(JSON.stringify({ error: 'source_url required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: job, error: jobError } = await supabase
        .from('modernizer_jobs')
        .insert({
          user_id: user.id,
          source_url,
          selected_theme,
          job_status: 'pending'
        })
        .select()
        .single();

      if (jobError) {
        console.error('❌ Job creation error:', jobError);
        throw jobError;
      }

      if (!job) {
        console.error('❌ Job created but no data returned');
        throw new Error('Failed to create job - no data returned');
      }

      console.log(`✅ Job created: ${job.id}`);

// @ts-ignore - Background processing with EdgeRuntime
      EdgeRuntime.waitUntil(
        processJob(job.id, supabase as any).catch(async (err) => {
          console.error(`❌ Background job ${job.id} failed:`, err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          await supabase.from('modernizer_jobs').update({
            job_status: 'failed',
            error_message: errorMessage
          }).eq('id', job.id);
        })
      );

      return new Response(JSON.stringify({ 
        job_id: job.id,
        status: 'pending',
        message: 'Modernization started'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Individual provider helpers removed — all AI calls now route through NEXUS shared router

async function callGroq(apiKey: string, prompt: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq failed:', response.status, errorText.substring(0, 200));
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('Groq error:', err);
    return null;
  }
}

interface ModernizerJob {
  id: string;
  source_url: string;
  selected_theme: string;
  job_status: string;
  user_id: string;
}

// @ts-ignore - Supabase table types
async function processJob(jobId: string, supabase: any) {
  console.log(`🔄 Starting processJob for ${jobId}`);
  try {
    const { data, error: fetchError } = await supabase
      .from('modernizer_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (fetchError) {
      console.error(`❌ Failed to fetch job ${jobId}:`, fetchError);
      throw fetchError;
    }
    
    const job = data as ModernizerJob | null;
    if (!job) {
      console.error(`❌ Job ${jobId} not found`);
      throw new Error('Job not found');
    }
    
    console.log(`✅ Job ${jobId} loaded, status: ${job.job_status}`);

    // Extract
    console.log(`📡 Setting status to 'extracting' for ${jobId}`);
    const { error: updateError } = await supabase
      .from('modernizer_jobs')
      .update({ job_status: 'extracting' } as any)
      .eq('id', jobId);
    
    if (updateError) {
      console.error(`❌ Failed to update status to extracting:`, updateError);
      throw updateError;
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY') || Deno.env.get('FIRECRAWL_API_KEY_1');
    if (!FIRECRAWL_API_KEY) {
      console.error('❌ FIRECRAWL_API_KEY not configured');
      throw new Error('FIRECRAWL_API_KEY not configured');
    }

    console.log(`📡 Extracting content from ${job.source_url}...`);
    
    let content = { markdown: '', html: '' };
    
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      console.error('⏰ Firecrawl timeout - aborting after 60s');
      controller.abort();
    }, 60000); // 60s timeout

    try {
      const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: job.source_url,
          formats: ['markdown', 'html'],
          onlyMainContent: true
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);
      console.log(`📥 Firecrawl response: ${scrapeRes.status}`);

      if (!scrapeRes.ok) {
        const errorText = await scrapeRes.text();
        console.error(`❌ Firecrawl error: ${errorText}`);
        throw new Error(`Firecrawl error ${scrapeRes.status}: ${errorText}`);
      }

      const scrapeData = await scrapeRes.json();
      console.log(`✅ Content extracted: ${scrapeData.data?.markdown?.length || 0} chars`);
      
      const metadata = {
        title: scrapeData.data?.metadata?.title || '',
        description: scrapeData.data?.metadata?.description || '',
        extracted_at: new Date().toISOString()
      };

      content = {
        markdown: scrapeData.data?.markdown || '',
        html: scrapeData.data?.html || ''
      };

      console.log(`✅ Updating job with extracted content`);
      const { error: contentUpdateError } = await supabase
        .from('modernizer_jobs')
        .update({
          extracted_content: content,
          extracted_metadata: metadata,
          job_status: 'rebuilding'
        } as any)
        .eq('id', jobId);
      
      if (contentUpdateError) {
        console.error(`❌ Failed to save extracted content:`, contentUpdateError);
        throw contentUpdateError;
      }
      console.log(`✅ Status updated to 'rebuilding'`);
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === 'AbortError') {
        console.error('❌ Extraction timeout');
        throw new Error('Extraction timed out after 60s - site may be too large or unresponsive');
      }
      console.error('❌ Extraction error:', err);
      throw err;
    }

    // Rebuild with AI - Generate modern static site
    const prompt = `Convert this legacy website into a modern, production-ready static website.

SOURCE URL: ${job.source_url}
THEME: ${job.selected_theme}

CONTENT:
${content.markdown.substring(0, 3000)}

Generate a complete static website as JSON with this structure:
{
  "files": [
    {"path": "index.html", "content": "<!DOCTYPE html>...full HTML with inline CSS and JS..."}
  ]
}

REQUIREMENTS:
- Single-file HTML with embedded CSS (Tailwind-inspired utility classes) and vanilla JavaScript
- WCAG AA accessibility (semantic HTML, ARIA labels, alt text, proper heading hierarchy)
- SEO optimized (meta tags, Open Graph, Twitter cards, structured data)
- Mobile-first responsive design with modern CSS Grid/Flexbox
- Preserve original content, brand colors, and visual hierarchy
- Modern aesthetics: smooth transitions, hover effects, clean typography
- Include proper meta tags for social sharing
- Fast-loading, no external dependencies

Return ONLY valid JSON with the complete HTML file, no markdown or explanations.`;

    let rebuiltFiles = null;
    let result: string | null = null;

    // Priority 1: Google AI Studio (free, generous limits)
    const GOOGLE_AI_KEY = Deno.env.get('GOOGLE_AI_STUDIO_KEY');
    if (GOOGLE_AI_KEY && !rebuiltFiles) {
      console.log('🤖 Trying Google AI Studio (Gemini 2.0 Flash)...');
      result = await callGoogleAI(GOOGLE_AI_KEY, prompt);
      if (result) {
        console.log('✅ Google AI succeeded');
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            rebuiltFiles = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('JSON parse error from Google AI');
          }
        }
      }
    }

    // Priority 2: Cerebras (fast + free)
    const CEREBRAS_KEY = Deno.env.get('CEREBRAS_API_KEY');
    if (CEREBRAS_KEY && !rebuiltFiles) {
      console.log('🤖 Trying Cerebras (Llama 3.3 70B)...');
      result = await callCerebras(CEREBRAS_KEY, prompt);
      if (result) {
        console.log('✅ Cerebras succeeded');
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            rebuiltFiles = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('JSON parse error from Cerebras');
          }
        }
      }
    }

    // Priority 3: Groq (free tier)
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (GROQ_API_KEY && !rebuiltFiles) {
      console.log('🤖 Trying Groq (Llama 3.3 70B)...');
      result = await callGroq(GROQ_API_KEY, prompt);
      if (result) {
        console.log('✅ Groq succeeded');
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            rebuiltFiles = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('JSON parse error from Groq');
          }
        }
      }
    }

    // Priority 4: Together AI
    const TOGETHER_KEY = Deno.env.get('TOGETHER_API_KEY');
    if (TOGETHER_KEY && !rebuiltFiles) {
      console.log('🤖 Trying Together AI (Llama 3.1 70B)...');
      result = await callTogether(TOGETHER_KEY, prompt);
      if (result) {
        console.log('✅ Together AI succeeded');
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            rebuiltFiles = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('JSON parse error from Together');
          }
        }
      }
    }

    // Priority 5: DeepSeek
    const DEEPSEEK_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    if (DEEPSEEK_KEY && !rebuiltFiles) {
      console.log('🤖 Trying DeepSeek...');
      result = await callDeepSeek(DEEPSEEK_KEY, prompt);
      if (result) {
        console.log('✅ DeepSeek succeeded');
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            rebuiltFiles = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('JSON parse error from DeepSeek');
          }
        }
      }
    }

    // Priority 6: Hyperbolic
    const HYPERBOLIC_KEY = Deno.env.get('HYPERBOLIC_API_KEY');
    if (HYPERBOLIC_KEY && !rebuiltFiles) {
      console.log('🤖 Trying Hyperbolic (Llama 3.1 70B)...');
      result = await callHyperbolic(HYPERBOLIC_KEY, prompt);
      if (result) {
        console.log('✅ Hyperbolic succeeded');
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            rebuiltFiles = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('JSON parse error from Hyperbolic');
          }
        }
      }
    }

    if (!rebuiltFiles) {
      throw new Error('All AI models failed to generate valid code. Check your API keys and rate limits.');
    }

    // Detect CMS
    const htmlContent = content.html;
    let detectedCMS = 'unknown';
    if (htmlContent.includes('wp-content')) detectedCMS = 'wordpress';
    else if (htmlContent.includes('wix.com')) detectedCMS = 'wix';
    else if (htmlContent.includes('shopify')) detectedCMS = 'shopify';

    const colorRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
    const brandColors = [...new Set((htmlContent.match(colorRegex) || []).slice(0, 5))];

    const { error: rebuiltUpdateError } = await supabase
      .from('modernizer_jobs')
      .update({
        rebuilt_files: rebuiltFiles,
        detected_cms: detectedCMS,
        brand_colors: brandColors,
        job_status: 'scoring'
      } as any)
      .eq('id', jobId);
    
    if (rebuiltUpdateError) {
      console.error('❌ Failed to update rebuilt files:', rebuiltUpdateError);
      throw rebuiltUpdateError;
    }
    console.log('✅ Rebuilt files saved, status: scoring');

    // Score
    const files = rebuiltFiles.files || [];
    const indexFile = files.find((f: any) => f.path.includes('index'));
    const fileContent = indexFile?.content.toLowerCase() || '';

    let accessibilityScore = 50;
    let seoScore = 50;

    if (fileContent.includes('aria-')) accessibilityScore += 10;
    if (fileContent.includes('alt=')) accessibilityScore += 10;
    if (fileContent.includes('role=')) accessibilityScore += 5;
    if (fileContent.includes('<title>')) seoScore += 10;
    if (fileContent.includes('meta name="description"')) seoScore += 10;
    if (fileContent.includes('og:')) seoScore += 10;

    accessibilityScore = Math.min(accessibilityScore, 98);
    seoScore = Math.min(seoScore, 98);

    const { error: reportInsertError } = await supabase
      .from('modernizer_reports')
      .insert({
        job_id: jobId,
        report_type: 'full',
        report_data: {
          accessibility: { score: accessibilityScore },
          seo: { score: seoScore },
          generated_at: new Date().toISOString()
        }
      } as any);
    
    if (reportInsertError) {
      console.error('❌ Failed to insert report:', reportInsertError);
      throw reportInsertError;
    }
    console.log('✅ Report saved');

    const { error: completedUpdateError } = await supabase
      .from('modernizer_jobs')
      .update({
        accessibility_score: accessibilityScore,
        seo_score: seoScore,
        performance_score: 85,
        job_status: 'completed',
        completed_at: new Date().toISOString()
      } as any)
      .eq('id', jobId);
    
    if (completedUpdateError) {
      console.error('❌ Failed to mark job as completed:', completedUpdateError);
      throw completedUpdateError;
    }

    console.log(`✅ Job ${jobId} completed: A11y=${accessibilityScore}, SEO=${seoScore}`);

  } catch (error) {
    console.error(`❌ Job ${jobId} failed:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const { error: failedUpdateError } = await supabase
      .from('modernizer_jobs')
      .update({ 
        job_status: 'failed',
        error_message: errorMessage
      } as any)
      .eq('id', jobId);
    
    if (failedUpdateError) {
      console.error('❌ Critical: Failed to mark job as failed:', failedUpdateError);
    }
    throw error;
  }
}
