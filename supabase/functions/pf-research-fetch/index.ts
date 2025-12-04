import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { query_id } = await req.json();

    // Get the query
    const { data: query, error: queryError } = await supabase
      .from('learning_queries')
      .select('*')
      .eq('id', query_id)
      .single();

    if (queryError) throw queryError;

    console.log('Executing research query:', query.query_text);

    const results = [];
    const category = query.metadata?.category || 'learn';

    // Check daily budgets for cost control
    const today = new Date().toISOString().split('T')[0];
    
    // Lovable AI budget: 85% of $1/month = ~$0.027/day (conservative for 24/7 learning)
    const { data: lovableBudget } = await supabase
      .from('ai_daily_quota')
      .select('calls_made, calls_budget')
      .eq('provider', 'lovable')
      .eq('category', category)
      .eq('date', today)
      .maybeSingle();
    
    // Groq fallback budget: $1/day max
    const { data: groqBudget } = await supabase
      .from('ai_daily_quota')
      .select('calls_made, calls_budget, tokens_used')
      .eq('provider', 'groq')
      .eq('category', category)
      .eq('date', today)
      .maybeSingle();

    const lovableWithinBudget = lovableBudget ? lovableBudget.calls_made < lovableBudget.calls_budget : true;
    const groqCostToday = (groqBudget?.tokens_used || 0) * 0.00000059; // Groq avg cost
    const groqWithinBudget = groqCostToday < 1.0; // $1/day cap

    // Try Lovable AI first (free tier - conservative 850 calls/day for 24/7 learning)
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (lovableKey && lovableWithinBudget) {
      try {
        console.log(`Using Lovable AI (Gemini 2.5 Flash) - ${lovableBudget?.calls_made || 0}/${lovableBudget?.calls_budget || 850} calls today`);
        const lovableResult = await fetchLovableAI(query.query_text, lovableKey);
        
        // Update Lovable AI quota
        await supabase
          .from('ai_daily_quota')
          .upsert({
            provider: 'lovable',
            category,
            date: today,
            calls_made: (lovableBudget?.calls_made || 0) + 1,
            calls_budget: 850, // 85% of ~1000 safe daily calls
            tokens_used: 0
          }, {
            onConflict: 'provider,category,date',
            ignoreDuplicates: false
          });

        const insights = extractInsights(lovableResult.content);
        const relevance = calculateRelevance(lovableResult, query.query_text);
        
        results.push({
          query_id,
          source_api: 'lovable',
          raw_data: lovableResult,
          extracted_insights: insights,
          relevance_score: relevance,
          metadata: { 
            provider: 'lovable-gemini-2.5-flash', 
            model: 'google/gemini-2.5-flash',
            cost: 'free-tier',
            daily_usage: `${(lovableBudget?.calls_made || 0) + 1}/850`,
            query_topic: query.metadata?.topic || 'general',
            query_priority: query.priority,
            content_length: lovableResult.content.length,
            insights_count: insights.length,
            timestamp: new Date().toISOString()
          }
        });

        // Enhanced logging for analytics
        await supabase.from('ai_usage_log').insert({
          provider: 'lovable',
          category,
          query_text: query.query_text,
          query_id: query_id,
          success: true,
          response_length: lovableResult.content.length,
          insights_extracted: insights.length,
          relevance_score: relevance,
          metadata: {
            topic: query.metadata?.topic,
            priority: query.priority,
            daily_usage: `${(lovableBudget?.calls_made || 0) + 1}/850`
          }
        });

        console.log(`✅ Lovable AI [${(lovableBudget?.calls_made || 0) + 1}/850] | Topic: ${query.metadata?.topic || 'general'} | Relevance: ${relevance.toFixed(2)} | Insights: ${insights.length}`);

      } catch (err) {
        console.error('Lovable AI error:', err);
        
        // Log failure
        await supabase.from('ai_usage_log').insert({
          provider: 'lovable',
          category,
          query_text: query.query_text,
          success: false,
          error_message: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }
    
    // Fallback to Groq if Lovable AI failed or budget exhausted (capped at $1/day)
    if (results.length === 0 && groqWithinBudget) {
      const groqKey = Deno.env.get('GROQ_API_KEY');
      if (groqKey) {
        try {
          const reason = lovableWithinBudget ? 'lovable_error' : 'lovable_budget_exhausted';
          console.log(`Using Groq fallback (${reason}) - $${groqCostToday.toFixed(4)}/$1.00 spent today`);
          
          const groqResult = await fetchGroqFallback(query.query_text, groqKey);
          
          // Estimate tokens (rough: 500 input + 1000 output avg)
          const tokensUsed = 1500;
          const costIncrement = tokensUsed * 0.00000059;
          
          // Update Groq quota with cost tracking
          await supabase
            .from('ai_daily_quota')
            .upsert({
              provider: 'groq',
              category,
              date: today,
              calls_made: (groqBudget?.calls_made || 0) + 1,
              calls_budget: 999999, // No call limit, just cost cap
              tokens_used: (groqBudget?.tokens_used || 0) + tokensUsed
            }, {
              onConflict: 'provider,category,date',
              ignoreDuplicates: false
            });
          
          const insights = extractInsights(groqResult.content);
          const relevance = calculateRelevance(groqResult, query.query_text);
          
          results.push({
            query_id,
            source_api: 'groq',
            raw_data: groqResult,
            extracted_insights: insights,
            relevance_score: relevance,
            metadata: { 
              provider: 'groq',
              model: 'llama-3.3-70b-versatile',
              fallback_reason: reason,
              cost_today: `$${(groqCostToday + costIncrement).toFixed(4)}/$1.00`,
              tokens_used: tokensUsed,
              cost_increment: costIncrement.toFixed(6),
              query_topic: query.metadata?.topic || 'general',
              query_priority: query.priority,
              content_length: groqResult.content.length,
              insights_count: insights.length,
              timestamp: new Date().toISOString()
            }
          });

          // Enhanced logging for analytics
          await supabase.from('ai_usage_log').insert({
            provider: 'groq',
            category,
            query_text: query.query_text,
            query_id: query_id,
            success: true,
            response_length: groqResult.content.length,
            insights_extracted: insights.length,
            relevance_score: relevance,
            tokens_used: tokensUsed,
            estimated_cost: costIncrement,
            metadata: {
              topic: query.metadata?.topic,
              priority: query.priority,
              fallback_reason: reason,
              cost_today: `$${(groqCostToday + costIncrement).toFixed(4)}/$1.00`
            }
          });
          
          console.log(`💰 Groq Fallback [$${(groqCostToday + costIncrement).toFixed(4)}/$1.00] | Reason: ${reason} | Topic: ${query.metadata?.topic || 'general'} | Relevance: ${relevance.toFixed(2)} | Insights: ${insights.length} | Tokens: ${tokensUsed}`);
        } catch (err) {
          console.error('Groq fallback error:', err);
        }
      }
    } else if (results.length === 0 && !groqWithinBudget) {
      console.error(`All providers exhausted: Lovable (${lovableBudget?.calls_made || 0}/850), Groq ($${groqCostToday.toFixed(2)}/$1.00)`);
    }

    // Execute Firecrawl search if available
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (firecrawlKey && query.metadata?.urls) {
      try {
        const firecrawlResult = await fetchFirecrawl(query.metadata.urls, firecrawlKey);
        results.push({
          query_id,
          source_api: 'firecrawl',
          raw_data: firecrawlResult,
          extracted_insights: extractInsights(firecrawlResult.content),
          relevance_score: calculateRelevance(firecrawlResult, query.query_text),
          metadata: { url: firecrawlResult.url }
        });
      } catch (err) {
        console.error('Firecrawl API error:', err);
      }
    }

    // Store results
    if (results.length > 0) {
      const { error: insertError } = await supabase
        .from('learning_results')
        .insert(results);

      if (insertError) throw insertError;

      // Create confidence records
      for (const result of results) {
        await supabase.from('learning_confidence').insert({
          result_id: result.query_id,
          confidence_score: result.relevance_score,
          sources_count: 1,
          cross_verified: false
        });
      }

      // Update query status
      await supabase
        .from('learning_queries')
        .update({ status: 'completed', executed_at: new Date().toISOString() })
        .eq('id', query_id);
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Research fetch error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchPerplexity(query: string, apiKey: string, category: string = 'learn') {
  const startTime = Date.now();
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: 'You are a research assistant. Provide detailed, factual information with proper citations.' },
        { role: 'user', content: query }
      ]
    }),
  });

  const responseTime = Date.now() - startTime;

  // Extract rate limit info from headers
  const quotaRemaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '50', 10);
  const quotaLimit = parseInt(response.headers.get('X-RateLimit-Limit') || '50', 10);
  const quotaReset = response.headers.get('X-RateLimit-Reset');

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Perplexity API error details:', response.status, errorBody);
    throw new Error(`Perplexity API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  
  return {
    content: data.choices[0].message.content,
    sources: data.search_results || [],
    quota: {
      remaining: quotaRemaining,
      limit: quotaLimit,
      resetAt: quotaReset ? new Date(parseInt(quotaReset) * 1000).toISOString() : null
    },
    responseTime
  };
}

async function fetchFirecrawl(urls: string[], apiKey: string) {
  const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: urls[0],
      formats: ['markdown', 'html']
    }),
  });

  if (!response.ok) {
    throw new Error(`Firecrawl API error: ${response.status}`);
  }

  return await response.json();
}

function extractInsights(content: string): string[] {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences.slice(0, 5).map(s => s.trim());
}

function calculateRelevance(result: any, query: string): number {
  const content = result.content || result.markdown || '';
  const queryTerms = query.toLowerCase().split(' ').filter(t => t.length > 3);
  
  let matches = 0;
  for (const term of queryTerms) {
    if (content.toLowerCase().includes(term)) matches++;
  }
  
  return Math.min(matches / queryTerms.length, 1.0);
}

async function fetchLovableAI(query: string, apiKey: string) {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You are a research assistant. Provide detailed, factual information.' },
        { role: 'user', content: query }
      ],
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lovable AI error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    citations: []
  };
}

async function fetchGroqFallback(query: string, apiKey: string) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a research assistant. Provide detailed, factual information.' },
        { role: 'user', content: query }
      ],
      temperature: 0.2,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    citations: []
  };
}
