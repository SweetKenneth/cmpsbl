import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SEED_KNOWLEDGE = [
  { content: 'PromptFluid is an AI ecosystem with Brain, Defense, Marketing, Access, Studio, and Nexus modules', type: 'system', confidence: 1.0 },
  { content: 'Brain module handles adaptive learning and memory management', type: 'system', confidence: 1.0 },
  { content: 'Defense module provides bot detection and security', type: 'system', confidence: 1.0 },
  { content: 'Nexus orchestrates AI providers: Groq, OpenAI, Anthropic, Perplexity', type: 'system', confidence: 1.0 },
  { content: 'High confidence memories (>0.8) are prioritized in decision making', type: 'learning', confidence: 0.9 },
  { content: 'Memory decay occurs when confidence drops below 0.3', type: 'learning', confidence: 0.9 },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🌱 Seeding brain with foundational knowledge...');

    const memories = SEED_KNOWLEDGE.map(item => ({
      content: item.content,
      memory_type: item.type,
      source: 'seed',
      confidence: item.confidence,
      metadata: { seeded_at: new Date().toISOString() },
    }));

    const { data: inserted, error } = await supabaseClient
      .from('brain_memories')
      .insert(memories)
      .select();

    if (error) throw error;

    console.log(`✅ Seeded ${inserted?.length} foundational memories`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        seeded: inserted?.length,
        memories: inserted,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error seeding knowledge:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
