// ================================================
// pf-replay - Event Replay & Time-Travel Debugging
// Record and replay NPC decisions, agent actions
// ================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-developer-id, x-app-id',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...params } = await req.json();
    const developerId = req.headers.get('x-developer-id') || params.developer_id;
    const appId = req.headers.get('x-app-id') || params.app_id;

    let result: any;

    switch (action) {
      case 'pulse':
      case 'status': {
        const { count: sessionCount } = await supabase
          .from('event_replay_sessions')
          .select('*', { count: 'exact', head: true });
        
        const { count: eventCount } = await supabase
          .from('event_replay_events')
          .select('*', { count: 'exact', head: true });
        
        result = {
          active: true,
          module: 'replay',
          version: '1.0.0',
          sessions_count: sessionCount || 0,
          events_count: eventCount || 0,
          entity_types: ['npc', 'user', 'agent', 'world', 'conversation']
        };
        break;
      }

      case 'start_session': {
        const { entity_id, entity_type, session_name } = params;
        
        if (!developerId || !entity_id || !entity_type) {
          throw new Error('developer_id, entity_id, and entity_type are required');
        }

        const { data, error } = await supabase
          .from('event_replay_sessions')
          .insert({
            developer_id: developerId,
            app_id: appId,
            entity_id,
            entity_type,
            session_name: session_name || `Session ${new Date().toISOString()}`,
            start_timestamp: new Date().toISOString(),
            replay_status: 'recording'
          })
          .select()
          .single();

        if (error) throw error;

        result = { 
          session_started: true, 
          session_id: data.id,
          entity_id,
          entity_type
        };
        break;
      }

      case 'record_event': {
        const { 
          session_id, 
          event_type, 
          module, 
          action: eventAction,
          input_payload,
          output_payload,
          decision_context,
          latency_ms
        } = params;
        
        if (!session_id || !event_type || !module || !eventAction) {
          throw new Error('session_id, event_type, module, and action are required');
        }

        // Get current event count for sequence number
        const { count } = await supabase
          .from('event_replay_events')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session_id);

        const { data, error } = await supabase
          .from('event_replay_events')
          .insert({
            session_id,
            sequence_number: (count || 0) + 1,
            event_type,
            module,
            action: eventAction,
            input_payload: input_payload || {},
            output_payload,
            decision_context,
            latency_ms
          })
          .select()
          .single();

        if (error) throw error;

        // Update session event count
        await supabase
          .from('event_replay_sessions')
          .update({ event_count: (count || 0) + 1 })
          .eq('id', session_id);

        result = { 
          recorded: true, 
          event_id: data.id,
          sequence_number: data.sequence_number
        };
        break;
      }

      case 'end_session': {
        const { session_id } = params;
        
        if (!session_id) {
          throw new Error('session_id is required');
        }

        const { data, error } = await supabase
          .from('event_replay_sessions')
          .update({
            end_timestamp: new Date().toISOString(),
            replay_status: 'completed'
          })
          .eq('id', session_id)
          .select()
          .single();

        if (error) throw error;

        result = { 
          session_ended: true, 
          session_id: data.id,
          event_count: data.event_count,
          duration_ms: new Date(data.end_timestamp).getTime() - new Date(data.start_timestamp).getTime()
        };
        break;
      }

      case 'list_sessions': {
        const { entity_id, entity_type, limit = 50 } = params;
        
        if (!developerId) {
          throw new Error('developer_id is required');
        }

        let query = supabase
          .from('event_replay_sessions')
          .select('*')
          .eq('developer_id', developerId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (entity_id) query = query.eq('entity_id', entity_id);
        if (entity_type) query = query.eq('entity_type', entity_type);

        const { data, error } = await query;
        if (error) throw error;

        result = { sessions: data || [] };
        break;
      }

      case 'get_timeline': {
        const { session_id, start_seq, end_seq } = params;
        
        if (!session_id) {
          throw new Error('session_id is required');
        }

        let query = supabase
          .from('event_replay_events')
          .select('*')
          .eq('session_id', session_id)
          .order('sequence_number', { ascending: true });

        if (start_seq) query = query.gte('sequence_number', start_seq);
        if (end_seq) query = query.lte('sequence_number', end_seq);

        const { data, error } = await query;
        if (error) throw error;

        result = { 
          events: data || [],
          total_events: data?.length || 0
        };
        break;
      }

      case 'replay': {
        const { session_id, speed = 1, start_seq = 1 } = params;
        
        if (!session_id) {
          throw new Error('session_id is required');
        }

        // Mark session as replaying
        await supabase
          .from('event_replay_sessions')
          .update({ replay_status: 'replaying' })
          .eq('id', session_id);

        // Get all events
        const { data: events, error } = await supabase
          .from('event_replay_events')
          .select('*')
          .eq('session_id', session_id)
          .gte('sequence_number', start_seq)
          .order('sequence_number', { ascending: true });

        if (error) throw error;

        // Return replay data with timing info
        result = {
          replay_started: true,
          session_id,
          speed,
          events: events?.map((e, i) => ({
            ...e,
            replay_delay_ms: i === 0 ? 0 : Math.round((e.latency_ms || 100) / speed)
          })) || [],
          total_events: events?.length || 0
        };
        break;
      }

      case 'compare': {
        const { session_id_a, session_id_b } = params;
        
        if (!session_id_a || !session_id_b) {
          throw new Error('session_id_a and session_id_b are required');
        }

        const [eventsA, eventsB] = await Promise.all([
          supabase
            .from('event_replay_events')
            .select('*')
            .eq('session_id', session_id_a)
            .order('sequence_number'),
          supabase
            .from('event_replay_events')
            .select('*')
            .eq('session_id', session_id_b)
            .order('sequence_number')
        ]);

        // Simple diff analysis
        const differences: any[] = [];
        const maxLen = Math.max(eventsA.data?.length || 0, eventsB.data?.length || 0);
        
        for (let i = 0; i < maxLen; i++) {
          const a = eventsA.data?.[i];
          const b = eventsB.data?.[i];
          
          if (!a || !b) {
            differences.push({
              sequence: i + 1,
              type: !a ? 'missing_in_a' : 'missing_in_b',
              event: a || b
            });
          } else if (JSON.stringify(a.output_payload) !== JSON.stringify(b.output_payload)) {
            differences.push({
              sequence: i + 1,
              type: 'output_differs',
              event_a: a,
              event_b: b
            });
          }
        }

        result = {
          sessions_compared: 2,
          events_a: eventsA.data?.length || 0,
          events_b: eventsB.data?.length || 0,
          differences,
          similarity_score: 1 - (differences.length / maxLen)
        };
        break;
      }

      case 'archive': {
        const { session_id } = params;
        
        if (!session_id) {
          throw new Error('session_id is required');
        }

        const { data, error } = await supabase
          .from('event_replay_sessions')
          .update({ replay_status: 'archived' })
          .eq('id', session_id)
          .select()
          .single();

        if (error) throw error;

        result = { archived: true, session_id: data.id };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        module: 'replay',
        action,
        latency_ms: Date.now() - startTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
        module: 'replay',
        latency_ms: Date.now() - startTime
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
