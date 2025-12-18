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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Require authentication
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { action, ...params } = await req.json();

    console.log(`[pf-marketing] Action: ${action}`);

    switch (action) {
      case 'campaign': {
        const { data } = await supabase.from('marketing_campaigns').insert({
          name: params.name,
          type: params.type,
          config: params.config
        }).select().single();
        return new Response(JSON.stringify({ success: true, campaign: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'content': {
        return new Response(JSON.stringify({
          success: true,
          content: { headline: 'AI-Generated Headline', body: 'Compelling copy...' }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'research': {
        return new Response(JSON.stringify({
          success: true,
          insights: ['Market trend 1', 'Competitor analysis']
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'strategy': {
        return new Response(JSON.stringify({
          success: true,
          strategy: { channels: ['social', 'email'], budget_allocation: {} }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'performance': {
        const { data } = await supabase.from('marketing_campaigns')
          .select('*')
          .eq('id', params.campaign_id)
          .single();
        return new Response(JSON.stringify({ success: true, metrics: data?.metrics || {} }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'chat': {
        // Return a helpful response for chat - the dedicated pf-marketing-chat function handles AI chat
        return new Response(JSON.stringify({
          success: true,
          reply: 'For AI-powered marketing chat, please use the dedicated marketing chat endpoint.',
          suggestion: 'Use pf-marketing-chat for conversational AI features.'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error: any) {
    console.error('[pf-marketing] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
