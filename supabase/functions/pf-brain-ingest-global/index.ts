import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🌍 Cascade v5.0.0: Global trend ingestion initiated');

    // Curated RSS/News sources (public, free tier)
    const sources = [
      { url: 'https://news.ycombinator.com/rss', category: 'tech', name: 'HackerNews' },
      { url: 'https://www.reddit.com/r/technology/.rss', category: 'tech', name: 'Reddit Tech' },
    ];

    const signals = [];
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    for (const source of sources) {
      try {
        const response = await fetch(source.url);
        const xmlText = await response.text();
        
        // Parse RSS feed (basic XML parsing)
        const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
        
        for (const item of items.slice(0, 5)) { // Limit to 5 per source
          const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
          const descMatch = item.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/);
          
          const headline = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '') : 'No title';
          const summary = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').slice(0, 500) : '';
          
          // Sanitize PII and sensitive content
          const sanitized = sanitizeContent(headline + ' ' + summary);
          
          // Use Lovable AI for sentiment analysis
          let sentiment = 0;
          let confidence = 0.5;
          
          if (LOVABLE_API_KEY) {
            try {
              const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'google/gemini-2.5-flash',
                  messages: [{
                    role: 'user',
                    content: `Analyze sentiment of this tech news headline. Return ONLY a JSON object with "sentiment" (-1 to 1) and "confidence" (0 to 1): ${headline}`
                  }],
                  max_tokens: 100,
                }),
              });

              if (aiResponse.ok) {
                const aiData = await aiResponse.json();
                const text = aiData.choices[0].message.content;
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  sentiment = parsed.sentiment || 0;
                  confidence = parsed.confidence || 0.5;
                }
              }
            } catch (err) {
              console.error('AI sentiment analysis failed:', err);
            }
          }

          signals.push({
            category: source.category,
            source_name: source.name,
            headline: headline.slice(0, 500),
            summary: summary.slice(0, 1000),
            sentiment_score: sentiment,
            confidence,
          });
        }
      } catch (err) {
        console.error(`Failed to fetch ${source.name}:`, err);
      }
    }

    // Store in database
    if (signals.length > 0) {
      const { data, error } = await supabaseClient
        .from('global_signals')
        .insert(signals);

      if (error) {
        console.error('Failed to store signals:', error);
      } else {
        console.log(`✅ Stored ${signals.length} global signals`);
      }
    }

    // Log learning event
    await supabaseClient.from('learning_logs').insert({
      event_type: 'global_ingestion',
      project_id: 'cascade',
      payload: { signals_count: signals.length },
      success: true,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        signals_ingested: signals.length,
        message: 'Global trend ingestion complete'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Global ingestion error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function sanitizeContent(text: string): string {
  // Remove potential PII patterns
  return text
    .replace(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/g, '[EMAIL]')
    .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
    .replace(/\b\d{9,}\b/g, '[ID]');
}
