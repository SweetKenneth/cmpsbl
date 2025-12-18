import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DAILY_CALL_LIMIT = 900;
const QUOTA_THRESHOLD = 0.05;

async function checkQuotaRemaining(sb: any): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const { data: cycles } = await sb
    .from('learning_cycles')
    .select('total_calls')
    .gte('started_at', today)
    .lte('started_at', `${today}T23:59:59`);
  
  const totalToday = cycles?.reduce((sum: number, c: any) => sum + (c.total_calls || 0), 0) || 0;
  return Math.max(0, DAILY_CALL_LIMIT - totalToday);
}

async function generateFollowUpQuery(sb: any, originalQuery: any, result: string, confidence: number): Promise<void> {
  const remaining = await checkQuotaRemaining(sb);
  const quotaPercent = remaining / DAILY_CALL_LIMIT;
  
  if (quotaPercent < QUOTA_THRESHOLD) {
    console.log(`⚠️ Quota too low (${quotaPercent * 100}%), skipping auto-query generation`);
    return;
  }

  try {
    const aiResult = await callFreeTierAI(
      `Original query: "${originalQuery.query}"\n\nResult confidence: ${confidence}\n\nGenerate a follow-up question to deepen understanding.`,
      {
        systemPrompt: 'Generate ONE focused follow-up research question based on the original query and result. Return only the question, no explanation.',
        temperature: 0.5
      }
    );

    const followUpQuery = aiResult.content.trim();
    
    if (followUpQuery) {
      await sb.from('learning_queries').insert({
        source: 'auto',
        topic: originalQuery.topic,
        query: followUpQuery,
        weight: 0.8,
        status: 'queued',
        parent_id: originalQuery.id,
        context: {
          origin: 'auto_generated',
          parent_topic: originalQuery.topic,
          parent_confidence: confidence,
          generated_at: new Date().toISOString()
        }
      });
      console.log(`✨ Generated follow-up query for ${originalQuery.topic}`);
    }
  } catch (error) {
    console.error('Failed to generate follow-up:', error);
  }
}

async function queueRestudyIfNeeded(sb: any, query: any, confidence: number): Promise<void> {
  if (confidence < 0.4) {
    console.log(`🔄 Low confidence (${confidence}) - queuing restudy for ${query.topic}`);
    await sb.from('learning_queries').insert({
      source: 'auto',
      topic: `[RESTUDY] ${query.topic}`,
      query: `Re-research with deeper focus: ${query.query}`,
      weight: 1.2,
      status: 'queued',
      parent_id: query.id,
      context: {
        origin: 'restudy',
        reason: 'low_confidence',
        original_confidence: confidence,
        scheduled_at: new Date().toISOString()
      }
    });
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    console.log('🔄 Starting Cascade Brain Scheduler (v3.2.0 - Cognitive)...');

    // Check quota first
    const remaining = await checkQuotaRemaining(sb);
    console.log(`📊 Daily quota remaining: ${remaining}/${DAILY_CALL_LIMIT} calls`);

    if (remaining < 10) {
      console.log('⚠️ Daily quota nearly exhausted, skipping cycle');
      return new Response(
        JSON.stringify({ ok: true, message: 'Quota exhausted', remaining }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new cycle
    const { data: cycle, error: cycleError } = await sb
      .from('learning_cycles')
      .insert({})
      .select('*')
      .single();

    if (cycleError) {
      console.error('❌ Failed to create cycle:', cycleError);
      throw cycleError;
    }

    console.log(`✅ Created cycle #${cycle.cycle_no}`);

    // Select next batch with context awareness
    const limit = Math.min(40, remaining);
    
    const { data: predictiveQueries } = await sb
      .from('learning_queries')
      .select('*')
      .eq('source', 'predictive')
      .eq('status', 'queued');

    const { data: userQueries } = await sb
      .from('learning_queries')
      .select('*')
      .eq('status', 'queued')
      .eq('source', 'user')
      .order('scheduled_for', { ascending: true })
      .limit(limit);

    // Boost weight if synergy detected
    for (const uq of userQueries || []) {
      const matchingPredictive = predictiveQueries?.find(pq => 
        pq.topic?.toLowerCase().includes(uq.topic?.toLowerCase() || '') ||
        uq.topic?.toLowerCase().includes(pq.topic?.toLowerCase() || '')
      );
      if (matchingPredictive) {
        console.log(`🎯 Synergy detected: ${uq.topic} matches prediction`);
        await sb
          .from('learning_queries')
          .update({ weight: 2.0 })
          .eq('id', uq.id);
        uq.weight = 2.0;
      }
    }

    const userCount = userQueries?.length ?? 0;
    const remainingSlots = Math.max(0, limit - userCount);

    const { data: systemQueries } = await sb
      .from('learning_queries')
      .select('*')
      .eq('status', 'queued')
      .in('source', ['system', 'predictive'])
      .order('weight', { ascending: false })
      .order('scheduled_for', { ascending: true })
      .limit(remainingSlots);

    const batch = [...(userQueries || []), ...(systemQueries || [])];

    if (batch.length === 0) {
      console.log('⚠️ No queries in queue');
      return new Response(
        JSON.stringify({ ok: true, cycle: cycle.cycle_no, queued: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const queryIds = batch.map(q => q.id);
    await sb.from('learning_queries').update({ status: 'running' }).in('id', queryIds);

    console.log(`🚀 Processing ${batch.length} queries (${userCount} user, ${batch.length - userCount} system)`);

    let processedCount = 0;
    let autoQueriesGenerated = 0;
    let lowConfidenceCount = 0;
    const confidences: number[] = [];

    for (const query of batch) {
      try {
        const mockConfidence = 0.5 + Math.random() * 0.5;
        confidences.push(mockConfidence);
        
        await sb.from('learning_queries')
          .update({ confidence: mockConfidence })
          .eq('id', query.id);

        if (mockConfidence >= 0.4) {
          await generateFollowUpQuery(sb, query, 'mock result', mockConfidence);
          autoQueriesGenerated++;
        } else {
          lowConfidenceCount++;
          await queueRestudyIfNeeded(sb, query, mockConfidence);
        }
        
        processedCount++;
      } catch (error) {
        console.error(`❌ Failed to process query ${query.id}:`, error);
      }
    }

    await sb.from('learning_queries').update({ status: 'done' }).in('id', queryIds);

    const avgConfidence = confidences.length > 0 
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
      : 0;

    await sb.from('learning_cycles').update({
      completed_at: new Date().toISOString(),
      total_calls: processedCount,
      user_calls: userCount,
      system_calls: batch.length - userCount,
      avg_confidence: avgConfidence,
      low_confidence_count: lowConfidenceCount,
      auto_queries_generated: autoQueriesGenerated,
      notes: `Cognitive v3.2.0: ${autoQueriesGenerated} auto-queries, ${lowConfidenceCount} low-conf restudies`
    }).eq('id', cycle.id);

    console.log(`✅ Cycle #${cycle.cycle_no} complete: ${processedCount} processed, avg confidence ${avgConfidence.toFixed(2)}`);

    return new Response(
      JSON.stringify({
        ok: true,
        cycle: cycle.cycle_no,
        processed: processedCount,
        avg_confidence: avgConfidence,
        auto_queries_generated: autoQueriesGenerated,
        low_confidence_count: lowConfidenceCount,
        quota_remaining: remaining - processedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Scheduler error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
