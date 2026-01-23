// ================================================
// pf-debugger - Live Debugger & Profiler
// Real-time tracing, performance monitoring
// ================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-developer-id, x-app-id, x-session-token',
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
    const sessionToken = req.headers.get('x-session-token') || params.session_token;

    let result: any;

    switch (action) {
      case 'pulse':
      case 'status': {
        const { count: activeSessions } = await supabase
          .from('debugger_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
        
        const { count: totalTraces } = await supabase
          .from('debugger_traces')
          .select('*', { count: 'exact', head: true });
        
        result = {
          active: true,
          module: 'debugger',
          version: '1.0.0',
          active_sessions: activeSessions || 0,
          total_traces: totalTraces || 0,
          features: ['live_tracing', 'performance_profiling', 'flame_graphs', 'trace_correlation']
        };
        break;
      }

      case 'connect': {
        if (!developerId) {
          throw new Error('developer_id is required');
        }

        const token = crypto.randomUUID();
        
        const { data, error } = await supabase
          .from('debugger_sessions')
          .insert({
            developer_id: developerId,
            app_id: appId,
            session_token: token,
            is_active: true,
            filters: params.filters || { modules: ['*'], min_latency_ms: 0 }
          })
          .select()
          .single();

        if (error) throw error;

        result = {
          connected: true,
          session_id: data.id,
          session_token: token,
          filters: data.filters
        };
        break;
      }

      case 'disconnect': {
        if (!sessionToken) {
          throw new Error('session_token is required');
        }

        const { data, error } = await supabase
          .from('debugger_sessions')
          .update({ is_active: false })
          .eq('session_token', sessionToken)
          .select()
          .single();

        if (error) throw error;

        result = { disconnected: true, session_id: data.id };
        break;
      }

      case 'heartbeat': {
        if (!sessionToken) {
          throw new Error('session_token is required');
        }

        const { error } = await supabase
          .from('debugger_sessions')
          .update({ last_heartbeat_at: new Date().toISOString() })
          .eq('session_token', sessionToken)
          .eq('is_active', true);

        if (error) throw error;

        result = { heartbeat: true, timestamp: new Date().toISOString() };
        break;
      }

      case 'trace_start': {
        const { trace_id, parent_trace_id, module, action: traceAction, input_summary } = params;
        
        if (!developerId || !trace_id || !module || !traceAction) {
          throw new Error('developer_id, trace_id, module, and action are required');
        }

        // Find active session for this developer
        const { data: session } = await supabase
          .from('debugger_sessions')
          .select('id')
          .eq('developer_id', developerId)
          .eq('is_active', true)
          .order('connected_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data, error } = await supabase
          .from('debugger_traces')
          .insert({
            session_id: session?.id,
            developer_id: developerId,
            app_id: appId,
            trace_id,
            parent_trace_id,
            module,
            action: traceAction,
            status: 'started',
            input_summary,
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        result = { trace_started: true, id: data.id, trace_id };
        break;
      }

      case 'trace_end': {
        const { trace_id, output_summary, error_message, memory_used_bytes, cpu_time_ms } = params;
        
        if (!trace_id) {
          throw new Error('trace_id is required');
        }

        const { data: existing } = await supabase
          .from('debugger_traces')
          .select('*')
          .eq('trace_id', trace_id)
          .eq('status', 'started')
          .single();

        if (!existing) {
          throw new Error('Trace not found or already completed');
        }

        const completedAt = new Date().toISOString();
        const latencyMs = new Date(completedAt).getTime() - new Date(existing.started_at).getTime();

        const { data, error } = await supabase
          .from('debugger_traces')
          .update({
            status: error_message ? 'failed' : 'completed',
            output_summary,
            error_message,
            latency_ms: latencyMs,
            memory_used_bytes,
            cpu_time_ms,
            completed_at: completedAt
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;

        result = { 
          trace_ended: true, 
          id: data.id, 
          trace_id,
          latency_ms: latencyMs,
          status: data.status
        };
        break;
      }

      case 'get_traces': {
        const { limit = 100, module, status, min_latency_ms } = params;
        
        if (!developerId) {
          throw new Error('developer_id is required');
        }

        let query = supabase
          .from('debugger_traces')
          .select('*')
          .eq('developer_id', developerId)
          .order('started_at', { ascending: false })
          .limit(limit);

        if (module) query = query.eq('module', module);
        if (status) query = query.eq('status', status);
        if (min_latency_ms) query = query.gte('latency_ms', min_latency_ms);

        const { data, error } = await query;
        if (error) throw error;

        result = { traces: data || [] };
        break;
      }

      case 'get_flame_graph': {
        const { root_trace_id } = params;
        
        if (!root_trace_id) {
          throw new Error('root_trace_id is required');
        }

        // Get root trace
        const { data: root } = await supabase
          .from('debugger_traces')
          .select('*')
          .eq('trace_id', root_trace_id)
          .single();

        if (!root) throw new Error('Root trace not found');

        // Get all child traces
        const { data: children } = await supabase
          .from('debugger_traces')
          .select('*')
          .eq('parent_trace_id', root_trace_id)
          .order('started_at');

        // Build flame graph structure
        interface FlameNode { name: string; value: number; status: string; trace_id: string; children: FlameNode[] }
        const buildNode = (trace: any, childTraces: any[] = []): FlameNode => ({
          name: `${trace.module}.${trace.action}`,
          value: trace.latency_ms || 0,
          status: trace.status,
          trace_id: trace.trace_id,
          children: childTraces.map(c => buildNode(c, []))
        });

        result = {
          flame_graph: buildNode(root, children || []),
          total_duration_ms: root.latency_ms,
          trace_count: 1 + (children?.length || 0)
        };
        break;
      }

      case 'get_stats': {
        const { time_range_hours = 24 } = params;
        
        if (!developerId) {
          throw new Error('developer_id is required');
        }

        const since = new Date(Date.now() - time_range_hours * 60 * 60 * 1000).toISOString();

        const { data: traces } = await supabase
          .from('debugger_traces')
          .select('module, action, latency_ms, status, memory_used_bytes')
          .eq('developer_id', developerId)
          .gte('started_at', since)
          .eq('status', 'completed');

        if (!traces || traces.length === 0) {
          result = { 
            stats: {
              total_traces: 0,
              avg_latency_ms: 0,
              p95_latency_ms: 0,
              error_rate: 0,
              by_module: {}
            }
          };
          break;
        }

        // Calculate stats
        const latencies = traces.map(t => t.latency_ms || 0).sort((a, b) => a - b);
        const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        const p95Index = Math.floor(latencies.length * 0.95);
        const p95Latency = latencies[p95Index] || 0;

        // Group by module
        const byModule: Record<string, { count: number; avg_latency: number; errors: number }> = {};
        for (const trace of traces) {
          if (!byModule[trace.module]) {
            byModule[trace.module] = { count: 0, avg_latency: 0, errors: 0 };
          }
          byModule[trace.module].count++;
          byModule[trace.module].avg_latency += (trace.latency_ms || 0);
          if (trace.status === 'failed') byModule[trace.module].errors++;
        }

        // Finalize averages
        for (const mod of Object.keys(byModule)) {
          byModule[mod].avg_latency = Math.round(byModule[mod].avg_latency / byModule[mod].count);
        }

        result = {
          stats: {
            total_traces: traces.length,
            avg_latency_ms: Math.round(avgLatency),
            p95_latency_ms: p95Latency,
            error_rate: traces.filter(t => t.status === 'failed').length / traces.length,
            by_module: byModule
          }
        };
        break;
      }

      case 'set_filters': {
        if (!sessionToken) {
          throw new Error('session_token is required');
        }

        const { filters } = params;
        if (!filters) {
          throw new Error('filters object is required');
        }

        const { data, error } = await supabase
          .from('debugger_sessions')
          .update({ filters })
          .eq('session_token', sessionToken)
          .select()
          .single();

        if (error) throw error;

        result = { filters_updated: true, filters: data.filters };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        module: 'debugger',
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
        module: 'debugger',
        latency_ms: Date.now() - startTime
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
