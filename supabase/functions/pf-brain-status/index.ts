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

    console.log('🧠 Fetching Brain system status...');

    // Check recent brain events (last 24 hours) - PRIMARY health indicator
    const { data: recentEvents, error: eventsError } = await supabaseClient
      .from('brain_events')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    // Check hot memory
    const { data: hotMemoryStats, error: memoryError } = await supabaseClient
      .from('brain_memory_hot')
      .select('content, context', { count: 'exact', head: false })
      .limit(100);

    // Check learning data (AI usage)
    const { data: learningData, error: learningError } = await supabaseClient
      .from('ai_learning_data')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    // Check action queue
    const { data: queuedActions, error: queueError } = await supabaseClient
      .from('brain_actions_queue')
      .select('action_type, status')
      .in('status', ['pending', 'processing'])
      .limit(10);

    const totalEvents = recentEvents?.length || 0;
    const totalMemories = hotMemoryStats?.length || 0;
    const totalLearning = learningData?.length || 0;
    const activeActions = queuedActions?.length || 0;

    // Brain is HEALTHY if:
    // 1. Has recent events (shows activity)
    // 2. Has memories stored
    // 3. Learning system is active
    const isHealthy = totalEvents > 0 && totalMemories > 0 && !eventsError;
    const isLearning = totalLearning > 0;

    // Get event type breakdown
    const eventBreakdown = recentEvents?.reduce((acc, e) => {
      const type = e.event_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Log orchestrator event to show brain is active
    await supabaseClient.from('brain_events').insert({
      event_type: 'status_check',
      module: 'brain_core',
      data: {
        health: isHealthy ? 'healthy' : 'degraded',
        events_24h: totalEvents,
        memories: totalMemories,
        learning_active: isLearning
      },
      outcome: 'success'
    });

    const status = {
      healthy: isHealthy,
      learning: isLearning,
      timestamp: new Date().toISOString(),
      metrics: {
        events_24h: totalEvents,
        hot_memories: totalMemories,
        learning_cycles_24h: totalLearning,
        queued_actions: activeActions,
      },
      event_breakdown: eventBreakdown,
      recent_activity: recentEvents?.slice(0, 5).map(event => ({
        type: event.event_type,
        module: event.module,
        outcome: event.outcome,
        timestamp: event.created_at,
      })) || [],
      system_info: {
        uptime_status: isHealthy ? 'operational' : 'degraded',
        last_activity: recentEvents?.[0]?.created_at || null,
        orchestration: totalEvents > 5 ? 'active' : 'limited',
        learning_engine: isLearning ? 'active' : 'idle',
      }
    };

    console.log(`✅ Brain status: ${isHealthy ? 'HEALTHY' : 'DEGRADED'} (${totalEvents} events, ${totalMemories} memories, ${totalLearning} learning cycles)`);

    return new Response(
      JSON.stringify({ success: true, status }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in brain-status:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
