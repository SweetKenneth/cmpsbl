import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createSafeErrorResponse } from '../_shared/security-utils.ts';

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

    // Authentication check - require admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user has admin role
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🧠 Cascade Learning Cycle: Analyzing ecosystem memory...');

    // Fetch recent high-impact events from all systems
    const { data: memories, error: memError } = await supabaseClient
      .from('ecosystem_memory')
      .select('*')
      .gte('impact_score', 0.5)
      .order('created_at', { ascending: false })
      .limit(100);

    if (memError) throw memError;

    console.log(`📊 Analyzed ${memories?.length || 0} high-impact events`);

    // Analyze patterns and generate proposals
    const systemPatterns: Record<string, any[]> = {};
    for (const mem of memories || []) {
      if (!systemPatterns[mem.source_system]) {
        systemPatterns[mem.source_system] = [];
      }
      systemPatterns[mem.source_system].push(mem);
    }

    const proposals = [];

    // Generate optimization proposals based on patterns
    for (const [system, events] of Object.entries(systemPatterns)) {
      if (events.length < 3) continue;

      const avgImpact = events.reduce((sum, e) => sum + e.impact_score, 0) / events.length;
      
      if (avgImpact > 0.7) {
        // High-impact pattern detected
        proposals.push({
          target_system: system,
          title: `Optimize ${system} based on recent high-impact events`,
          summary: `Detected ${events.length} high-impact events (avg score: ${avgImpact.toFixed(2)}). Suggesting configuration optimization.`,
          suggested_change: {
            type: 'threshold_adjustment',
            rationale: `Recent events show ${system} could benefit from parameter tuning`,
            events_analyzed: events.length,
            sample_events: events.slice(0, 3).map(e => ({
              type: e.event_type,
              impact: e.impact_score,
              timestamp: e.created_at
            }))
          },
          expected_impact: {
            efficiency_gain: `${(avgImpact * 15).toFixed(1)}%`,
            risk_reduction: `${(avgImpact * 10).toFixed(1)}%`,
            confidence_basis: 'Pattern frequency and impact correlation'
          },
          confidence: Math.min(avgImpact, 0.95)
        });
      }
    }

    // Store proposals (NEVER auto-apply)
    if (proposals.length > 0) {
      const { data: stored, error: propError } = await supabaseClient
        .from('evolution_proposals')
        .insert(proposals)
        .select();

      if (propError) throw propError;

      console.log(`✅ Generated ${stored?.length || 0} proposals (awaiting manual review)`);

      // Log learning event
      await supabaseClient.from('brain_events').insert({
        module: 'cascade',
        event_type: 'learning_cycle_completed',
        data: {
          memories_analyzed: memories?.length || 0,
          proposals_generated: stored?.length || 0,
          systems_analyzed: Object.keys(systemPatterns).length
        },
        outcome: 'success'
      });

      return new Response(
        JSON.stringify({
          success: true,
          learning_summary: {
            memories_analyzed: memories?.length || 0,
            proposals_generated: stored?.length || 0,
            awaiting_review: stored?.length || 0
          },
          proposals: stored
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('ℹ️ No actionable patterns detected');

    return new Response(
      JSON.stringify({
        success: true,
        learning_summary: {
          memories_analyzed: memories?.length || 0,
          proposals_generated: 0,
          message: 'No significant patterns requiring proposals'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Learning cycle error:', error);
    return createSafeErrorResponse(error, corsHeaders, 'Failed to complete learning cycle');
  }
});