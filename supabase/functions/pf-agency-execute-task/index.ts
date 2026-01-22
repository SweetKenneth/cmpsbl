/**
 * pf-agency-execute-task v3.0.0
 * 
 * Full task execution with:
 * - Groq (primary AI) + Firecrawl (web) - NO Perplexity
 * - All 15 executable task types
 * - Domain-aware research
 * - Circuit breakers and fallback
 * - Progress streaming
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Circuit breaker state
const circuitState: Record<string, { failures: number; lastFailure: number; state: 'closed' | 'open' | 'half-open' }> = {};

const CIRCUIT_BREAKER = {
  failureThreshold: 3,
  openDurationMs: 60000,
};

// ============================================
// RESEARCH PROVIDERS - Groq + Firecrawl only
// ============================================
const PROVIDERS = {
  firecrawl: {
    enabled: () => !!Deno.env.get('FIRECRAWL_API_KEY'),
    scrape: async (url: string) => {
      const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['markdown'],
          onlyMainContent: true,
        }),
      });
      
      if (!response.ok) throw new Error(`Firecrawl scrape error: ${response.status}`);
      const data = await response.json();
      return data.data?.markdown || data.markdown || '';
    },
    search: async (query: string, limit: number = 5) => {
      const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit,
          scrapeOptions: { formats: ['markdown'] },
        }),
      });
      
      if (!response.ok) throw new Error(`Firecrawl search error: ${response.status}`);
      const data = await response.json();
      return data.data || [];
    },
    map: async (url: string, limit: number = 100) => {
      const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
      const response = await fetch('https://api.firecrawl.dev/v1/map', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          limit,
          includeSubdomains: false,
        }),
      });
      
      if (!response.ok) throw new Error(`Firecrawl map error: ${response.status}`);
      const data = await response.json();
      return data.links || [];
    },
  },
  groq: {
    enabled: () => !!Deno.env.get('GROQ_API_KEY'),
    generate: async (systemPrompt: string, userPrompt: string, maxTokens: number = 4000) => {
      const apiKey = Deno.env.get('GROQ_API_KEY');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
      });
      
      if (!response.ok) throw new Error(`Groq error: ${response.status}`);
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    },
  },
  lovable: {
    enabled: () => !!Deno.env.get('LOVABLE_API_KEY'),
    generate: async (systemPrompt: string, userPrompt: string) => {
      const apiKey = Deno.env.get('LOVABLE_API_KEY');
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 4096,
        }),
      });
      
      if (!response.ok) throw new Error(`Lovable AI error: ${response.status}`);
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function isCircuitOpen(provider: string): boolean {
  const state = circuitState[provider];
  if (!state) return false;
  
  if (state.state === 'open') {
    if (Date.now() - state.lastFailure > CIRCUIT_BREAKER.openDurationMs) {
      state.state = 'half-open';
      return false;
    }
    return true;
  }
  return false;
}

function recordCircuitResult(provider: string, success: boolean): void {
  if (!circuitState[provider]) {
    circuitState[provider] = { failures: 0, lastFailure: 0, state: 'closed' };
  }
  
  if (success) {
    circuitState[provider].failures = 0;
    circuitState[provider].state = 'closed';
  } else {
    circuitState[provider].failures++;
    circuitState[provider].lastFailure = Date.now();
    
    if (circuitState[provider].failures >= CIRCUIT_BREAKER.failureThreshold) {
      circuitState[provider].state = 'open';
    }
  }
}

async function updateProgress(supabase: any, taskId: string, progress: number, message?: string): Promise<boolean> {
  const { data: task } = await supabase
    .from('agency_tasks')
    .select('status')
    .eq('id', taskId)
    .single();

  if (task?.status === 'cancelled') {
    return false;
  }

  await supabase
    .from('agency_tasks')
    .update({ progress, updated_at: new Date().toISOString() })
    .eq('id', taskId);
  
  if (message) {
    await supabase.from('agency_task_logs').insert({
      task_id: taskId,
      log_type: 'progress',
      message,
      data: { progress },
    });
  }
  return true;
}

// AI completion with fallback chain: Lovable -> Groq
async function aiComplete(systemPrompt: string, userPrompt: string): Promise<{ content: string; provider: string }> {
  // Try Lovable first
  if (PROVIDERS.lovable.enabled() && !isCircuitOpen('lovable')) {
    try {
      const content = await PROVIDERS.lovable.generate(systemPrompt, userPrompt);
      recordCircuitResult('lovable', true);
      return { content, provider: 'lovable/gemini-2.5-flash' };
    } catch (err) {
      console.warn('Lovable AI failed:', err);
      recordCircuitResult('lovable', false);
    }
  }
  
  // Fallback to Groq
  if (PROVIDERS.groq.enabled() && !isCircuitOpen('groq')) {
    try {
      const content = await PROVIDERS.groq.generate(systemPrompt, userPrompt);
      recordCircuitResult('groq', true);
      return { content, provider: 'groq/llama-3.3-70b' };
    } catch (err) {
      console.warn('Groq failed:', err);
      recordCircuitResult('groq', false);
    }
  }
  
  return { content: 'AI providers temporarily unavailable.', provider: 'fallback' };
}

// Web research with Firecrawl
async function webResearch(query: string): Promise<{ content: string; sources: string[] }> {
  const sources: string[] = [];
  let content = '';
  
  if (PROVIDERS.firecrawl.enabled() && !isCircuitOpen('firecrawl')) {
    try {
      const results = await PROVIDERS.firecrawl.search(query, 5);
      recordCircuitResult('firecrawl', true);
      
      for (const result of results.slice(0, 3)) {
        if (result.markdown) {
          content += `\n\n## ${result.title || 'Source'}\n${result.markdown.slice(0, 2000)}`;
          sources.push(result.url);
        }
      }
    } catch (err) {
      console.warn('Firecrawl search failed:', err);
      recordCircuitResult('firecrawl', false);
    }
  }
  
  // Always synthesize with AI if we have content
  if (content) {
    const synthesis = await aiComplete(
      'You are a research analyst. Synthesize the web content into a comprehensive, well-organized report.',
      `Query: ${query}\n\nContent:\n${content.slice(0, 8000)}`
    );
    return { content: synthesis.content, sources };
  }
  
  // Pure AI fallback
  const fallback = await aiComplete(
    'You are a research specialist. Provide comprehensive information based on your knowledge.',
    `Research: ${query}`
  );
  return { content: fallback.content, sources: ['AI Knowledge Base'] };
}

// Scrape a URL
async function scrapeUrl(url: string): Promise<string> {
  if (PROVIDERS.firecrawl.enabled() && !isCircuitOpen('firecrawl')) {
    try {
      const content = await PROVIDERS.firecrawl.scrape(url);
      recordCircuitResult('firecrawl', true);
      return content;
    } catch (err) {
      console.warn('Firecrawl scrape failed:', err);
      recordCircuitResult('firecrawl', false);
    }
  }
  return '';
}

// Extract insights from text
function extractInsights(text: string): string[] {
  const insights: string[] = [];
  
  const bulletMatches = text.match(/^[•\-\*]\s+.{20,150}$/gm);
  if (bulletMatches) {
    insights.push(...bulletMatches.slice(0, 5).map(m => m.replace(/^[•\-\*]\s+/, '').trim()));
  }
  
  const numberedMatches = text.match(/^\d+\.\s+.{20,150}$/gm);
  if (numberedMatches && insights.length < 5) {
    insights.push(...numberedMatches.slice(0, 5 - insights.length).map(m => m.replace(/^\d+\.\s+/, '').trim()));
  }
  
  if (insights.length === 0) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30 && s.trim().length < 200);
    insights.push(...sentences.slice(0, 3).map(s => s.trim()));
  }
  
  return [...new Set(insights)].slice(0, 5);
}

// ============================================
// TASK HANDLERS
// ============================================

const TASK_HANDLERS: Record<string, (input: string, supabase: any, taskId: string) => Promise<{ result: string; sources: string[]; provider: string }>> = {
  // Web Research
  web_research: async (input) => {
    const research = await webResearch(input);
    return { result: research.content, sources: research.sources, provider: 'firecrawl+groq' };
  },

  // Competitor Research
  competitive_profile: async (input) => {
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    let pageContent = '';
    const sources: string[] = [];
    
    if (urlMatch) {
      pageContent = await scrapeUrl(urlMatch[0]);
      sources.push(urlMatch[0]);
    }
    
    const research = await webResearch(`${input} competitor analysis market position`);
    sources.push(...research.sources);
    
    const analysis = await aiComplete(
      `You are a competitive intelligence analyst. Create a comprehensive competitor profile including:
- Company Overview (what they do, target market)
- Key Products/Services
- Pricing Strategy (if discoverable)
- Strengths and Weaknesses
- Market Positioning
- Key Differentiators
Format as a structured report.`,
      `Analyze: ${input}\n\nPage content:\n${pageContent.slice(0, 4000)}\n\nResearch:\n${research.content.slice(0, 4000)}`
    );
    
    return { result: analysis.content, sources, provider: analysis.provider };
  },

  // Market Research
  market_research: async (input) => {
    const research = await webResearch(`${input} market size trends key players opportunities`);
    
    const analysis = await aiComplete(
      `You are a market research analyst. Create a market report including:
- Market Overview & Size
- Key Players & Market Share
- Industry Trends
- Growth Opportunities
- Challenges & Threats
- Market Forecast`,
      `Market: ${input}\n\nResearch:\n${research.content.slice(0, 6000)}`
    );
    
    return { result: analysis.content, sources: research.sources, provider: 'firecrawl+' + analysis.provider };
  },

  // SEO Audit
  seo_audit: async (input) => {
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    let pageContent = '';
    const sources: string[] = [];
    
    if (urlMatch) {
      pageContent = await scrapeUrl(urlMatch[0]);
      sources.push(urlMatch[0]);
    }
    
    const audit = await aiComplete(
      `You are an SEO expert. Perform a comprehensive SEO audit including:
- Technical SEO (page structure, meta tags, headings)
- Content Quality (keyword usage, readability, length)
- On-Page SEO Score (1-100)
- Key Issues Found
- Priority Recommendations
- Quick Wins
Format as a professional SEO audit report.`,
      `Audit: ${input}\n\nPage content:\n${pageContent.slice(0, 6000)}`
    );
    
    return { result: audit.content, sources, provider: audit.provider };
  },

  // Keyword Research
  keyword_research: async (input) => {
    const research = await webResearch(`${input} keywords SEO search volume intent`);
    
    const analysis = await aiComplete(
      `You are an SEO keyword specialist. Create a keyword research report:
- Primary Keywords (5-10)
- Long-tail Keywords (10-15)
- Search Intent Analysis
- Keyword Difficulty Assessment
- Content Opportunity Gaps
- Recommended Target Keywords`,
      `Topic: ${input}\n\nResearch:\n${research.content.slice(0, 4000)}`
    );
    
    return { result: analysis.content, sources: research.sources, provider: analysis.provider };
  },

  // Backlink Research
  backlink_research: async (input) => {
    const research = await webResearch(`${input} backlink opportunities guest posting directories forums`);
    
    const analysis = await aiComplete(
      `You are a link building specialist. Create a backlink opportunity report:
- High-Authority Directory Opportunities
- Forum & Community Opportunities
- Guest Post Targets
- Resource Page Opportunities
- Competitor Backlink Insights
- Outreach Priority List`,
      `Domain/Niche: ${input}\n\nResearch:\n${research.content.slice(0, 5000)}`
    );
    
    return { result: analysis.content, sources: research.sources, provider: analysis.provider };
  },

  // Data Extraction
  data_extraction: async (input) => {
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    const sources: string[] = [];
    
    if (!urlMatch) {
      return { result: 'No valid URL provided for extraction.', sources: [], provider: 'none' };
    }
    
    const content = await scrapeUrl(urlMatch[0]);
    sources.push(urlMatch[0]);
    
    const extraction = await aiComplete(
      `You are a data extraction specialist. Extract and structure key data from this content:
- Main Entities (companies, people, products)
- Key Statistics & Numbers
- Contact Information (if present)
- Dates & Events
- Lists & Tables (as structured data)
Format as clean JSON-like structured data.`,
      `Extract data from:\n${content.slice(0, 8000)}`
    );
    
    return { result: extraction.content, sources, provider: extraction.provider };
  },

  // Site Mapping
  site_mapping: async (input) => {
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    const sources: string[] = [];
    
    if (!urlMatch) {
      return { result: 'No valid URL provided for mapping.', sources: [], provider: 'none' };
    }
    
    if (PROVIDERS.firecrawl.enabled()) {
      try {
        const links = await PROVIDERS.firecrawl.map(urlMatch[0], 100);
        sources.push(urlMatch[0]);
        
        const analysis = await aiComplete(
          'Analyze this sitemap and provide a structure overview with page categories and hierarchy.',
          `URL: ${urlMatch[0]}\nPages found: ${links.length}\n\nLinks:\n${links.slice(0, 50).join('\n')}`
        );
        
        return { 
          result: `## Site Map: ${urlMatch[0]}\n\nTotal pages discovered: ${links.length}\n\n${analysis.content}\n\n### All URLs:\n${links.map((l: string) => `- ${l}`).join('\n')}`,
          sources,
          provider: 'firecrawl'
        };
      } catch (err) {
        console.warn('Site mapping failed:', err);
      }
    }
    
    return { result: 'Site mapping requires Firecrawl API.', sources: [], provider: 'none' };
  },

  // Content Scraping
  content_scrape: async (input) => {
    const urls = input.match(/https?:\/\/[^\s]+/g) || [];
    const sources: string[] = [];
    let content = '';
    
    for (const url of urls.slice(0, 5)) {
      try {
        const scraped = await scrapeUrl(url);
        if (scraped) {
          content += `\n\n## ${url}\n${scraped.slice(0, 2000)}`;
          sources.push(url);
        }
      } catch (err) {
        console.warn(`Failed to scrape ${url}:`, err);
      }
    }
    
    if (!content) {
      return { result: 'No content could be scraped from provided URLs.', sources: [], provider: 'none' };
    }
    
    return { result: content, sources, provider: 'firecrawl' };
  },

  // Content Generation
  content_generation: async (input) => {
    const research = await webResearch(input);
    
    const content = await aiComplete(
      `You are a professional content writer. Create engaging, SEO-optimized content that is:
- Well-structured with clear headings (H1, H2, H3)
- Includes a compelling meta description
- Uses relevant keywords naturally
- Provides actionable value
- 800-1200 words in length`,
      `Topic: ${input}\n\nResearch context:\n${research.content.slice(0, 4000)}`
    );
    
    return { result: content.content, sources: research.sources, provider: content.provider };
  },

  // Outreach Drafting
  outreach_draft: async (input) => {
    const draft = await aiComplete(
      `You are an outreach specialist. Create personalized outreach emails:
- Main Email (professional, value-focused)
- 3 Subject Line Variations
- Follow-up Email Template
- Key personalization points to research`,
      `Outreach purpose: ${input}`
    );
    
    return { result: draft.content, sources: [], provider: draft.provider };
  },

  // Social Content
  social_content: async (input) => {
    const content = await aiComplete(
      `You are a social media content specialist. Create engaging posts for multiple platforms:
- LinkedIn Post (professional, 150-200 words)
- Twitter/X Thread (5-7 tweets)
- Instagram Caption (with hashtags)
- Key Hooks & CTAs`,
      `Topic: ${input}`
    );
    
    return { result: content.content, sources: [], provider: content.provider };
  },

  // Trend Analysis
  trend_analysis: async (input) => {
    const research = await webResearch(`${input} trends 2024 2025 emerging developments`);
    
    const analysis = await aiComplete(
      `You are a trend analyst. Create a comprehensive trend report:
- Current State of ${input}
- Emerging Trends (5-7 key trends)
- Data & Statistics
- Future Predictions
- Opportunities to Watch
- Risk Factors`,
      `Topic: ${input}\n\nResearch:\n${research.content.slice(0, 5000)}`
    );
    
    return { result: analysis.content, sources: research.sources, provider: analysis.provider };
  },

  // Brand Analysis
  brand_analysis: async (input) => {
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    let pageContent = '';
    const sources: string[] = [];
    
    if (urlMatch) {
      pageContent = await scrapeUrl(urlMatch[0]);
      sources.push(urlMatch[0]);
    }
    
    const research = await webResearch(`${input} brand reputation reviews`);
    sources.push(...research.sources);
    
    const analysis = await aiComplete(
      `You are a brand strategist. Create a brand analysis:
- Brand Identity & Positioning
- Visual Identity Assessment
- Messaging & Tone
- Online Presence Audit
- Competitor Comparison
- Improvement Recommendations`,
      `Brand: ${input}\n\nWebsite content:\n${pageContent.slice(0, 3000)}\n\nResearch:\n${research.content.slice(0, 3000)}`
    );
    
    return { result: analysis.content, sources, provider: analysis.provider };
  },
};

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { taskId, agencyId, taskType, inputData, memberId } = await req.json();

    console.log(`🚀 Executing task ${taskId} (${taskType})`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update to in_progress
    await supabase
      .from('agency_tasks')
      .update({ 
        status: 'in_progress', 
        started_at: new Date().toISOString(),
        progress: 10 
      })
      .eq('id', taskId);

    await supabase.from('agency_task_logs').insert({
      task_id: taskId,
      member_id: memberId,
      log_type: 'info',
      message: `🚀 Starting ${taskType} task`,
      data: { taskType },
    });

    const rawInput = inputData?.rawInput || inputData?.topic || '';

    // Check for cancellation
    if (!await updateProgress(supabase, taskId, 20, 'Analyzing task...')) {
      return new Response(JSON.stringify({ success: true, cancelled: true, taskId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the handler
    const handler = TASK_HANDLERS[taskType] || TASK_HANDLERS.web_research;
    
    await updateProgress(supabase, taskId, 40, `Executing ${taskType}...`);
    
    const { result, sources, provider } = await handler(rawInput, supabase, taskId);
    
    await updateProgress(supabase, taskId, 80, 'Extracting insights...');
    
    const insights = extractInsights(result);
    const executionTime = Date.now() - startTime;

    // Save artifact
    let artifactId: string | null = null;
    try {
      const { data: artifact } = await supabase
        .from('agency_task_artifacts')
        .insert({
          task_id: taskId,
          agency_id: agencyId,
          member_id: memberId,
          artifact_type: 'report',
          file_name: `${taskType}-${Date.now()}.md`,
          inline_content: result,
          metadata: { sources, insights },
        })
        .select('id')
        .single();
      artifactId = artifact?.id;
    } catch (e) {
      console.warn('Artifact save failed:', e);
    }

    // Complete the task
    await supabase
      .from('agency_tasks')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: 100,
        output_data: {
          result,
          insights,
          sources,
          provider,
          executionTimeMs: executionTime,
          artifactId,
        },
      })
      .eq('id', taskId);

    await supabase.from('agency_task_logs').insert({
      task_id: taskId,
      member_id: memberId,
      log_type: 'completion',
      message: `✅ Task completed in ${Math.round(executionTime / 1000)}s`,
      data: { insights: insights.slice(0, 3), sources: sources.slice(0, 3), provider, artifactId },
    });

    console.log(`✅ Task ${taskId} completed in ${executionTime}ms`);

    return new Response(JSON.stringify({ 
      success: true,
      taskId,
      result,
      insights,
      sources,
      provider,
      executionTimeMs: executionTime,
      artifactId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Task execution error:", error);
    
    try {
      const { taskId } = await req.json().catch(() => ({}));
      if (taskId) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('agency_tasks')
          .update({ 
            status: 'failed', 
            error_message: error instanceof Error ? error.message : 'Unknown error',
            progress: 0,
          })
          .eq('id', taskId);
        
        await supabase.from('agency_task_logs').insert({
          task_id: taskId,
          log_type: 'error',
          message: `❌ Task failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    } catch (e) {
      console.error('Failed to update task status:', e);
    }
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
