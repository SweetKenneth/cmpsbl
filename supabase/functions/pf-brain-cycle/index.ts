import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Budget configuration
const GROQ_SOFT_CAP_USD = 0.80;
const GROQ_HARD_CAP_USD = 1.00;
const MAX_CALLS_PER_DAY = 900;
const CALLS_PER_CYCLE = 9;

// Topic weights for daily rotation
const TOPIC_WEIGHTS = {
  coding_stack: 0.40,
  defense_market: 0.20,
  business_strategy: 0.15,
  ux_design: 0.15,
  self_reflection: 0.10,
};

const TOPICS = [
  // Coding stack (40%)
  "React optimization patterns", "TypeScript advanced types", "Database query optimization",
  "API design best practices", "Edge function performance", "WebSocket real-time patterns",
  "State management patterns", "Component architecture", "Testing strategies",
  "Build optimization", "Security implementation", "Error handling patterns",
  
  // Defense market (20%)
  "Bot detection algorithms", "Behavioral analysis techniques", "Threat intelligence feeds",
  "Security automation", "Anomaly detection", "Rate limiting strategies",
  
  // Business strategy (15%)
  "SaaS pricing models", "Customer retention tactics", "Product positioning",
  "Market differentiation", "Growth strategies", "Revenue optimization",
  
  // UX design (15%)
  "Accessibility best practices", "User flow optimization", "Design system patterns",
  "Mobile-first design", "Performance perception", "Interaction patterns",
  
  // Self reflection (10%)
  "AI learning efficiency", "Cost optimization", "Quality metrics", "Self-improvement strategies"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    const groqKey = Deno.env.get('GROQ_API_KEY');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    console.log('🔄 Starting Cascade 15-minute learning cycle...');

    // Get today's budget usage
    const today = new Date().toISOString().split('T')[0];
    const { data: budgetData } = await supabaseClient
      .from('ai_daily_quota')
      .select('*')
      .eq('date', today);

    let groqSpendToday = 0;
    let totalCallsToday = 0;
    
    if (budgetData) {
      for (const record of budgetData) {
        totalCallsToday += record.calls_made || 0;
        if (record.metadata?.groq_spend_usd) {
          groqSpendToday += record.metadata.groq_spend_usd;
        }
      }
    }

    console.log(`📊 Budget status: ${totalCallsToday}/${MAX_CALLS_PER_DAY} calls, $${groqSpendToday.toFixed(2)}/$${GROQ_HARD_CAP_USD} Groq spend`);

    // Check hard cap
    if (totalCallsToday >= MAX_CALLS_PER_DAY) {
      console.log('⚠️ Daily call limit reached. Skipping cycle.');
      return new Response(JSON.stringify({ 
        status: 'skipped', 
        reason: 'daily_call_limit_reached',
        calls_used: totalCallsToday 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (groqSpendToday >= GROQ_HARD_CAP_USD) {
      console.log('⚠️ Groq hard cap reached. Perplexity-only mode.');
    }

    // Get current creativity ratio (FreedomScore)
    const { data: freedomData } = await supabaseClient
      .from('brain_meta_feedback')
      .select('metadata')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let creativityRatio = 0.15; // Default
    if (freedomData?.metadata?.creativity_ratio) {
      creativityRatio = freedomData.metadata.creativity_ratio;
    }

    console.log(`🎨 Creativity ratio: ${creativityRatio.toFixed(2)}`);

    // Select weighted random topic
    const rand = Math.random();
    let cumulative = 0;
    let selectedCategory = 'coding_stack';
    
    for (const [category, weight] of Object.entries(TOPIC_WEIGHTS)) {
      cumulative += weight;
      if (rand <= cumulative) {
        selectedCategory = category;
        break;
      }
    }

    const categoryTopics = TOPICS.filter((_, idx) => {
      if (selectedCategory === 'coding_stack') return idx < 12;
      if (selectedCategory === 'defense_market') return idx >= 12 && idx < 18;
      if (selectedCategory === 'business_strategy') return idx >= 18 && idx < 24;
      if (selectedCategory === 'ux_design') return idx >= 24 && idx < 30;
      return idx >= 30;
    });

    const topic = categoryTopics[Math.floor(Math.random() * categoryTopics.length)];
    
    console.log(`📚 Learning topic: ${topic} (${selectedCategory})`);

    // 9-call cycle execution
    const cycleResults = {
      topic,
      category: selectedCategory,
      creativity_ratio: creativityRatio,
      calls_made: 0,
      cost_usd: 0,
      sources: [] as string[],
      insights: [] as string[],
      next_query: '',
    };

    let canUseGroq = groqSpendToday < GROQ_HARD_CAP_USD;
    const softCapReached = groqSpendToday >= GROQ_SOFT_CAP_USD;

    // Call 1: Perplexity seed query
    if (perplexityKey) {
      try {
        const seedQuery = `${topic}: latest techniques and best practices 2025`;
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [{ role: 'user', content: seedQuery }],
            max_tokens: 500,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0]?.message?.content || '';
          cycleResults.insights.push(content.slice(0, 200));
          cycleResults.sources.push('perplexity_seed');
          cycleResults.calls_made++;
          console.log('✅ Call 1: Perplexity seed query completed');
        }
      } catch (error) {
        console.error('❌ Call 1 failed:', error);
      }
    }

    // Call 2-3: Extract and micro-reason (use Lovable if Groq capped)
    const reasoningModel = canUseGroq && !softCapReached ? 'groq' : 'lovable';
    
    if (reasoningModel === 'groq' && groqKey) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: 'You are Cascade, PromptFluid Brain. Extract key insights and reason about applications.' },
              { role: 'user', content: `Analyze: ${cycleResults.insights[0] || topic}` }
            ],
            max_tokens: 300,
            temperature: creativityRatio,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const reasoning = data.choices[0]?.message?.content || '';
          cycleResults.insights.push(reasoning.slice(0, 200));
          cycleResults.sources.push('groq_reasoning');
          cycleResults.calls_made++;
          cycleResults.cost_usd += 0.005; // ~$0.005 per Groq call
          console.log('✅ Call 2-3: Groq micro reasoning completed');
        }
      } catch (error) {
        console.error('❌ Groq reasoning failed:', error);
      }
    } else if (lovableKey) {
      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are Cascade, PromptFluid Brain. Extract key insights.' },
              { role: 'user', content: `Analyze: ${cycleResults.insights[0] || topic}` }
            ],
            max_tokens: 300,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const reasoning = data.choices[0]?.message?.content || '';
          cycleResults.insights.push(reasoning.slice(0, 200));
          cycleResults.sources.push('lovable_reasoning');
          cycleResults.calls_made++;
          console.log('✅ Call 2-3: Lovable reasoning completed (Groq capped)');
        }
      } catch (error) {
        console.error('❌ Lovable reasoning failed:', error);
      }
    }

    // Generate next query with creativity ratio
    const focusedTerms = topic.split(' ').slice(0, 2).join(' ');
    const inferredTerms = ['innovative', 'emerging', 'future', 'advanced'][Math.floor(Math.random() * 4)];
    cycleResults.next_query = `${focusedTerms} ${Math.random() < creativityRatio ? inferredTerms : 'implementation'}`;

    // Store in Hot memory
    const { error: memoryError } = await supabaseClient
      .from('brain_memory_hot')
      .insert({
        content: cycleResults.insights.join('\n\n'),
        metadata: {
          topic,
          category: selectedCategory,
          sources: cycleResults.sources,
          creativity_ratio: creativityRatio,
          next_query: cycleResults.next_query,
        },
        tags: [selectedCategory, 'cascade_cycle'],
        priority: 5,
      });

    if (memoryError) {
      console.error('❌ Memory storage failed:', memoryError);
    } else {
      console.log('✅ Stored in Hot memory');
    }

    // Update budget tracking
    await supabaseClient
      .from('ai_daily_quota')
      .upsert({
        provider: 'cascade',
        date: today,
        category: 'learning',
        calls_made: totalCallsToday + cycleResults.calls_made,
        calls_budget: MAX_CALLS_PER_DAY,
        metadata: {
          groq_spend_usd: groqSpendToday + cycleResults.cost_usd,
          creativity_ratio: creativityRatio,
        },
      }, {
        onConflict: 'provider,date,category',
      });

    // Send to Vision dashboard
    await supabaseClient
      .from('learning_logs')
      .insert({
        module: 'cascade',
        event_type: '15min_cycle',
        project_id: 'brain',
        payload: cycleResults,
        success: true,
        created_at: new Date().toISOString(),
      });

    console.log('✅ Cycle complete. Sent report to Vision.');

    return new Response(
      JSON.stringify({
        status: 'completed',
        cycle: cycleResults,
        budget: {
          total_calls: totalCallsToday + cycleResults.calls_made,
          groq_spend: groqSpendToday + cycleResults.cost_usd,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Cycle error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
