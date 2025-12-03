import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { seed_keyword, niche, intent = 'all' } = await req.json();
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

    console.log(`🔍 Researching keywords for: ${seed_keyword}`);

    const prompt = `Research and provide 20 high-value SEO keywords related to "${seed_keyword}" in the ${niche} niche. 
For each keyword provide:
- Keyword phrase
- Estimated search intent (informational/commercial/transactional)
- Difficulty level (easy/medium/hard)
- Content suggestion

Focus on ${intent === 'all' ? 'all search intents' : intent + ' intent keywords'}.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const keywords = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ success: true, keywords, seed_keyword }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Keyword research error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
