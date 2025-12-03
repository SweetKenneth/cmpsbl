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

    const { session_data, timeframe = 'last_hour' } = await req.json();

    console.log('🗜️ Self-Compression Memory: Summarizing learning session...');

    // Fetch recent learning events if not provided
    let events = session_data;
    if (!events) {
      const timeQuery = timeframe === 'last_hour' 
        ? `created_at > NOW() - INTERVAL '1 hour'`
        : `created_at > NOW() - INTERVAL '1 day'`;
      
      const { data } = await supabase
        .from('brain_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      events = data || [];
    }

    const compressionPrompt = `You are Cascade's Self-Compression Memory module. Summarize this learning session into concise lesson cards.

Session Events: ${JSON.stringify(events)}

Create 3-5 lesson cards with:
1. TITLE: Short memorable title
2. CORE_INSIGHT: One-sentence key learning
3. CONTEXT: When/why this matters
4. APPLICABILITY: What problems this solves
5. TAGS: 3-5 relevant tags for recall

Return JSON: { lesson_cards: [ { title: "", core_insight: "", context: "", applicability: "", tags: [] } ], session_summary: "", key_patterns: [] }`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a memory compression specialist. Create concise, searchable lesson cards from learning sessions.' },
          { role: 'user', content: compressionPrompt }
        ],
      }),
    });

    const data = await response.json();
    let compression;
    
    try {
      const text = data.choices[0].message.content;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      compression = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        lesson_cards: [],
        session_summary: 'Unable to compress session',
        key_patterns: []
      };
    } catch (e) {
      console.error('Compression parsing failed:', e);
      compression = {
        lesson_cards: [],
        session_summary: 'Compression error',
        key_patterns: []
      };
    }

    // Store lesson cards in hot memory
    for (const card of compression.lesson_cards) {
      await supabase.from('brain_memory_hot').insert({
        content: `${card.title}: ${card.core_insight}`,
        context: 'doc', // Use 'doc' for lesson documentation
        goal_ref: 'continuous_learning',
        confidence: 0.8,
        priority: 7,
        tags: card.tags,
      });
    }

    await supabase.from('brain_events').insert({
      module: 'lesson_compression',
      event_type: 'session_compressed',
      data: { timeframe, compression, cards_created: compression.lesson_cards.length },
      outcome: 'compressed',
    });

    console.log(`✅ Compressed ${compression.lesson_cards.length} lesson cards`);

    return new Response(
      JSON.stringify({ success: true, compression }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Lesson compression error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
