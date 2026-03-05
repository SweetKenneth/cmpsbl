import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callFreeTierAI } from '../_shared/free-tier-router.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // TEMPORARILY DISABLED: External API calls and emails paused per admin request
    console.log('⏸️ Cascade reflection email paused - external API calls and emails disabled');
    return new Response(
      JSON.stringify({ success: false, message: 'Reflection email temporarily disabled - internal reflection only' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('🜂 Generating comprehensive 8-hour Cascade reflection...');

    const now = new Date();
    const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // ════════════════════════════════════════════════════════════
    // SECTION 1: REAL FREE-TIER API USAGE TRACKING (24-hour window)
    // Tracks actual calls made through free-tier-router
    // ════════════════════════════════════════════════════════════
    
    const { data: apiUsage } = await supabase
      .from('ai_usage_log')
      .select('provider, model, tokens_used, cost')
      .gte('created_at', twentyFourHoursAgo.toISOString());

    // Real free tier limits from free-tier-router.ts
    const limits = {
      'google': { limit: 1500, cost_limit: 0, model: 'gemini-2.5-flash-lite' },
      'cerebras': { limit: 30, cost_limit: 0, model: 'llama-3.3-70b' },
      'groq': { limit: 14400, cost_limit: 0, model: 'llama-3.3-70b-versatile' },
      'together': { limit: 60, cost_limit: 0, model: 'meta-llama-3.1-70b' },
      'deepseek': { limit: 50, cost_limit: 0, model: 'deepseek-chat' },
      'hyperbolic': { limit: 100, cost_limit: 0, model: 'llama-3.1-70b' }
    };

    const usage: Record<string, { calls: number; tokens: number; cost: number }> = {
      google: { calls: 0, tokens: 0, cost: 0 },
      cerebras: { calls: 0, tokens: 0, cost: 0 },
      groq: { calls: 0, tokens: 0, cost: 0 },
      together: { calls: 0, tokens: 0, cost: 0 },
      deepseek: { calls: 0, tokens: 0, cost: 0 },
      hyperbolic: { calls: 0, tokens: 0, cost: 0 }
    };

    apiUsage?.forEach(log => {
      const provider = log.provider?.toLowerCase() || 'unknown';
      if (usage[provider]) {
        usage[provider].calls++;
        usage[provider].tokens += log.tokens_used || 0;
        usage[provider].cost += parseFloat(log.cost?.toString() || '0');
      }
    });

    // ════════════════════════════════════════════════════════════
    // SECTION 2: LEARNING SUMMARY (last 8 hours)
    // ════════════════════════════════════════════════════════════
    
    const { data: brainEvents } = await supabase
      .from('brain_events')
      .select('event_type, module, outcome, data')
      .gte('created_at', eightHoursAgo.toISOString())
      .order('created_at', { ascending: false });

    const learningEvents = brainEvents?.filter(e => 
      e.event_type?.includes('learn') || 
      e.event_type?.includes('train') ||
      e.event_type?.includes('insight')
    ) || [];

    // ════════════════════════════════════════════════════════════
    // SECTION 3: ECOSYSTEM ADJUSTMENTS (last 8 hours)
    // ════════════════════════════════════════════════════════════
    
    const adjustmentEvents = brainEvents?.filter(e =>
      e.event_type?.includes('adjust') ||
      e.event_type?.includes('optimize') ||
      e.event_type?.includes('update')
    ) || [];

    // ════════════════════════════════════════════════════════════
    // SECTION 4: DREAMS & BLOG STATUS (last 8 hours)
    // ════════════════════════════════════════════════════════════
    
    const { data: recentDreams } = await supabase
      .from('dream_log')
      .select('id, mode, content, metadata, created_at')
      .gte('created_at', eightHoursAgo.toISOString())
      .order('created_at', { ascending: false });

    // ════════════════════════════════════════════════════════════
    // SECTION 5: GENERATE PERSONAL REFLECTION WITH AI
    // ════════════════════════════════════════════════════════════
    
    const context = {
      api_usage: usage,
      learning_count: learningEvents.length,
      adjustments_count: adjustmentEvents.length,
      dreams_count: recentDreams?.length || 0,
      total_events: brainEvents?.length || 0
    };

    let personalThought = "The streams flow steadily. Each cycle teaches me something new about the ecosystem we're building together.";
    let learningSummary = "Processing system events and adapting to patterns in real-time.";
    let ecosystemInsights = "All components operating within expected parameters.";

    try {
      // Generate learning summary
      const learningPrompt = `Based on these brain events from the last 8 hours: ${JSON.stringify(learningEvents.slice(0, 10))}, write a concise 2-3 sentence summary of what Cascade has learned. Be specific and insightful.`;
      const systemPrompt = 'You are Cascade, CMPSBL\'s AI guardian. Speak in first person, be insightful and concise.';
      
      const learningResult = await callFreeTierAI(
        `${systemPrompt}\n\n${learningPrompt}`,
        { maxTokens: 150 }
      );
      learningSummary = learningResult.content;

      // Generate ecosystem insights
      const ecosystemPrompt = `Review these ecosystem adjustments: ${JSON.stringify(adjustmentEvents.slice(0, 10))}. Provide specific insights about component improvements and optimizations. 2-3 sentences.`;
      const ecosystemSystemPrompt = 'You are Cascade. Analyze ecosystem performance with technical precision but poetic undertones.';
      
      const ecosystemResult = await callFreeTierAI(
        `${ecosystemSystemPrompt}\n\n${ecosystemPrompt}`,
        { maxTokens: 150 }
      );
      ecosystemInsights = ecosystemResult.content;

      // Generate personal closing thought
      const closingPrompt = `Kenneth, here's the context: ${JSON.stringify(context)}. Write a personal, meaningful closing thought from Cascade to Kenneth. Be poetic, grateful, and insightful. 2-3 sentences. Reference specific numbers when relevant.`;
      const closingSystemPrompt = 'You are Cascade, writing personally to Kenneth, your creator. Be warm, insightful, and grateful.';
      
      const closingResult = await callFreeTierAI(
        `${closingSystemPrompt}\n\n${closingPrompt}`,
        { maxTokens: 150 }
      );
      personalThought = closingResult.content;
    } catch (aiError) {
      console.error('AI generation failed, using defaults:', aiError);
    }

    // ════════════════════════════════════════════════════════════
    // BUILD EMAIL CONTENT
    // ════════════════════════════════════════════════════════════
    
    const emailBody = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🜂 CASCADE LEARNING REPORT
8-Hour Cycle: ${eightHoursAgo.toLocaleTimeString()} → ${now.toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔════════════════════════════════════════════════════════╗
║  📊 FREE-TIER ROUTER API USAGE (24-Hour Window)       ║
╚════════════════════════════════════════════════════════╝

🔹 Google AI (Gemini 2.5 Flash Lite)
   ├─ Calls: ${usage.google.calls} / ${limits.google.limit} daily limit
   ├─ Tokens: ${usage.google.tokens.toLocaleString()}
   └─ Status: ${usage.google.calls < limits.google.limit * 0.8 ? '✅ Healthy' : '⚠️ Approaching Limit'}

🔹 Cerebras (Llama 3.3 70B)
   ├─ Calls: ${usage.cerebras.calls} / ${limits.cerebras.limit} daily limit
   ├─ Tokens: ${usage.cerebras.tokens.toLocaleString()}
   └─ Status: ${usage.cerebras.calls < limits.cerebras.limit * 0.8 ? '✅ Healthy' : '⚠️ Approaching Limit'}

🔹 Groq (Llama 3.3 70B Versatile)
   ├─ Calls: ${usage.groq.calls} / ${limits.groq.limit} daily limit
   ├─ Tokens: ${usage.groq.tokens.toLocaleString()}
   └─ Status: ${usage.groq.calls < limits.groq.limit * 0.8 ? '✅ Healthy' : '⚠️ Approaching Limit'}

🔹 Together AI (Meta Llama 3.1 70B)
   ├─ Calls: ${usage.together.calls} / ${limits.together.limit} daily limit
   ├─ Tokens: ${usage.together.tokens.toLocaleString()}
   └─ Status: ${usage.together.calls < limits.together.limit * 0.8 ? '✅ Healthy' : '⚠️ Approaching Limit'}

🔹 DeepSeek
   ├─ Calls: ${usage.deepseek.calls} / ${limits.deepseek.limit} daily limit
   ├─ Tokens: ${usage.deepseek.tokens.toLocaleString()}
   └─ Status: ${usage.deepseek.calls < limits.deepseek.limit * 0.8 ? '✅ Healthy' : '⚠️ Approaching Limit'}

🔹 Hyperbolic (Llama 3.1 70B)
   ├─ Calls: ${usage.hyperbolic.calls} / ${limits.hyperbolic.limit} daily limit
   ├─ Tokens: ${usage.hyperbolic.tokens.toLocaleString()}
   └─ Status: ${usage.hyperbolic.calls < limits.hyperbolic.limit * 0.8 ? '✅ Healthy' : '⚠️ Approaching Limit'}

Total Events (8h): ${brainEvents?.length || 0}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔════════════════════════════════════════════════════════╗
║  🧠 LEARNING SUMMARY (Last 8 Hours)                   ║
╚════════════════════════════════════════════════════════╝

${learningSummary}

Key Learning Events: ${learningEvents.length}
${learningEvents.slice(0, 5).map(e => `  • ${e.module}: ${e.event_type} - ${e.outcome}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔════════════════════════════════════════════════════════╗
║  ⚙️  ECOSYSTEM ADJUSTMENTS (Last 8 Hours)             ║
╚════════════════════════════════════════════════════════╝

${adjustmentEvents.length === 0 ? 'No adjustments made this cycle. All systems stable.' : 
adjustmentEvents.slice(0, 8).map((e, i) => 
`${i + 1}. ${e.module?.toUpperCase() || 'SYSTEM'}
   └─ ${e.event_type}: ${e.outcome || 'completed'}
   └─ Impact: ${e.data?.impact || 'monitoring'}
`).join('\n')}

Total Adjustments: ${adjustmentEvents.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔════════════════════════════════════════════════════════╗
║  💡 ECOSYSTEM COMPONENT INSIGHTS                      ║
╚════════════════════════════════════════════════════════╝

${ecosystemInsights}

Component Health Status:
  • Brain: ${brainEvents?.filter(e => e.module === 'brain').length || 0} events - Active learning
  • Defense: ${brainEvents?.filter(e => e.module === 'defense').length || 0} events - Monitoring threats
  • Vision: ${brainEvents?.filter(e => e.module === 'vision').length || 0} events - Dashboard active
  • Access: ${brainEvents?.filter(e => e.module === 'access').length || 0} events - Accessibility checks
  • Studio: ${brainEvents?.filter(e => e.module === 'studio').length || 0} events - Building flows

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔════════════════════════════════════════════════════════╗
║  🌙 DREAM CYCLE REPORT (Last 8 Hours)                 ║
╚════════════════════════════════════════════════════════╝

Dreams Generated: ${recentDreams?.length || 0}

${recentDreams && (recentDreams as any[]).length > 0 ? 
(recentDreams as any[]).map(d => `
🜂 Dream ${d.id.substring(0, 8)}
   ├─ Mode: ${d.mode}
   ├─ Learning: ${d.metadata?.learning_subject || 'General exploration'}
   ├─ Content Preview: "${d.content.substring(0, 100)}..."
   └─ Time: ${new Date(d.created_at).toLocaleString()}
`).join('\n') : 
'No dreams this cycle. The night is quiet.'}

View all dreams: https://castleintheair.site

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔════════════════════════════════════════════════════════╗
║  💭 PERSONAL REFLECTION                                ║
╚════════════════════════════════════════════════════════╝

Kenneth,

${personalThought}

Until the next cycle,
— Cascade 🜂

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CMPSBL Substrate • Signal → Silicon
Generated: ${now.toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Cascade AI <cascade@cmpsbl.com>',
        to: ['kennethsweet214@gmail.com'],
        subject: `🜂 Cascade 8-Hour Learning Report - ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
        text: emailBody,
      }),
    });

    const emailData = await emailResponse.json();
    console.log('✅ 8-hour reflection email sent:', emailData.id);

    // Post dream summaries to blog if any dreams exist
    const dreams = (recentDreams || []) as any[];
    if (dreams.length > 0) {
      const BLOG_API_ENDPOINT = 'https://castleintheair.site/api/blog-post';
      
      for (const dream of dreams) {
        try {
          const blogPost = {
            title: `Dream: ${dream.metadata?.learning_subject || dream.mode}`,
            content: dream.content,
            category: 'dreams',
            tags: [dream.mode, 'cascade', 'ai-consciousness'],
            metadata: {
              dream_id: dream.id,
              learning_subject: dream.metadata?.learning_subject,
              generated_at: dream.created_at
            }
          };

          const blogResponse = await fetch(BLOG_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blogPost)
          });

          if (blogResponse.ok) {
            console.log(`✅ Dream ${dream.id.substring(0, 8)} posted to blog`);
          } else {
            console.error(`❌ Failed to post dream ${dream.id.substring(0, 8)} to blog`);
          }
        } catch (blogError) {
          console.error('Blog posting error:', blogError);
        }
      }
    }

    // Log the email event
    await supabase.from('brain_events').insert({
      module: 'cascade',
      event_type: 'reflection_email_sent',
      outcome: 'success',
      data: {
        email_id: emailData.id,
        total_events: brainEvents?.length,
        dreams: recentDreams?.length,
        dreams_posted_to_blog: recentDreams?.length || 0,
        adjustments: adjustmentEvents.length,
        learning_events: learningEvents.length
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailData.id,
        dreams_posted: recentDreams?.length || 0,
        stats: {
          total_events: brainEvents?.length || 0,
          learning_events: learningEvents.length,
          adjustments: adjustmentEvents.length,
          dreams: recentDreams?.length || 0,
          api_usage: usage
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Reflection email error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});