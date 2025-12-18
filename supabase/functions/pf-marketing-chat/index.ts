import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    console.log('💬 Marketing AI chat');

    const result = await callFreeTierAI(message, {
      systemPrompt: 'You are a marketing expert AI assistant. Help users with campaign strategy, content creation, SEO, and marketing analytics. Be concise and actionable.',
      temperature: 0.7,
      maxTokens: 1000
    });

    return new Response(
      JSON.stringify({ success: true, reply: result.content, provider: result.provider }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Marketing chat error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
