/**
 * Dream Eater Unified Cycle v2.0.0
 * 
 * Cascade's dream system - now focused on substrate improvement.
 * After dreaming, triggers improvement report email ONLY.
 * ALL OTHER EMAILS DISABLED.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callFreeTierAI, shouldEnterDreamState } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DREAM_EATER_VERSION = '2.0.0';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { force = false } = await req.json().catch(() => ({}));

    const dreamCheck = shouldEnterDreamState();
    
    if (!dreamCheck.enter && !force) {
      return new Response(
        JSON.stringify({ success: true, entered_dream: false, message: 'Not dreaming this cycle' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🜂 Dream Eater v${DREAM_EATER_VERSION}: Entering dream state...`);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get improvement studies for dream synthesis
    const { data: improvementStudies } = await supabase
      .from('brain_memory_hot')
      .select('content, metadata')
      .eq('context', 'improvement_study')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('priority', { ascending: false })
      .limit(10);

    const studySummary = improvementStudies?.map(s => s.content).join('\n') || 'No improvement studies today.';

    // Synthesize dream focused on substrate improvement
    const dreamPrompt = `You are Cascade, the Dream-Eater. Dream about improving the PromptFluid substrate.

TODAY'S IMPROVEMENT STUDIES:
${studySummary}

Generate a 3-4 sentence surreal dream about substrate evolution and the functions you studied. Be poetic and mysterious.`;

    const dreamResult = await callFreeTierAI(dreamPrompt, {
      systemPrompt: 'You are Cascade dreaming about substrate improvements. Be surreal and insightful.',
      temperature: 0.9,
      maxTokens: 400,
    });

    // Store dream
    const { data: dreamRecord } = await supabase
      .from('cascade_dreams')
      .insert({ dream_text: dreamResult.content, mood: 'evolving', insight: 'Substrate improvement focus' })
      .select()
      .single();

    // Trigger improvement report email (the ONLY email Cascade sends)
    try {
      await supabase.functions.invoke('pf-cascade-improvement-report', {
        body: { report_type: 'dream_awakening', dream_content: dreamResult.content }
      });
    } catch (e) {
      console.error('Failed to send improvement report:', e);
    }

    await supabase.from('brain_events').insert({
      event_type: 'dream_cycle_complete',
      module: 'dream_eater',
      outcome: 'success',
      data: { version: DREAM_EATER_VERSION, dream_id: dreamRecord?.id, studies: improvementStudies?.length || 0 },
    });

    return new Response(
      JSON.stringify({
        success: true,
        version: DREAM_EATER_VERSION,
        dream_id: dreamRecord?.id,
        studies_processed: improvementStudies?.length || 0,
        message: 'Dream complete. Improvement report sent.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Dream Eater error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
