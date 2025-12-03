import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createSafeErrorResponse, createValidationErrorResponse } from "../_shared/security-utils.ts";

const AnalyticsRequestSchema = z.object({
  timeframe: z.enum(['24h', '7d', '30d']).default('7d'),
  modules: z.array(z.enum(['defense', 'brain', 'ml', 'system'])).max(10).default(['defense', 'brain', 'ml', 'system'])
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const validationResult = AnalyticsRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createValidationErrorResponse(corsHeaders, 'Invalid analytics request');
    }

    const { timeframe, modules } = validationResult.data;
    
    const cutoffTime = new Date();
    switch (timeframe) {
      case '24h': cutoffTime.setHours(cutoffTime.getHours() - 24); break;
      case '7d': cutoffTime.setDate(cutoffTime.getDate() - 7); break;
      case '30d': cutoffTime.setDate(cutoffTime.getDate() - 30); break;
      default: cutoffTime.setDate(cutoffTime.getDate() - 7);
    }

    const analytics: any = {
      timestamp: new Date().toISOString(),
      timeframe,
      modules: {},
      status: 'partial' // Assumes partial until all succeed
    };

    // Defense Analytics
    if (modules.includes('defense')) {
      try {
        const { data: events, error } = await serviceClient
          .from('defense_events')
          .select('*')
          .gte('created_at', cutoffTime.toISOString());

        if (!error && events) {
          analytics.modules.defense = {
            total_events: events.length,
            blocked: events.filter(e => e.action === 'block').length,
            challenged: events.filter(e => e.action === 'challenge').length,
            avg_risk_score: events.length > 0 
              ? events.reduce((sum, e) => sum + (e.risk_score || 0), 0) / events.length 
              : 0,
            top_ips: [...new Set(events.map(e => e.ip_address))].slice(0, 5),
            status: 'ok'
          };
        } else {
          analytics.modules.defense = { status: 'error', message: 'Failed to fetch defense data' };
        }
      } catch (e) {
        analytics.modules.defense = { status: 'error', message: 'Defense analytics unavailable' };
      }
    }

    // Brain Analytics
    if (modules.includes('brain')) {
      try {
        const [queries, memories, reflections] = await Promise.all([
          serviceClient.from('learning_queries').select('*').gte('created_at', cutoffTime.toISOString()),
          serviceClient.from('brain_memory_hot').select('*').gte('created_at', cutoffTime.toISOString()),
          serviceClient.from('brain_reflection').select('*').gte('created_at', cutoffTime.toISOString())
        ]);

        analytics.modules.brain = {
          learning_queries: queries.data?.length || 0,
          memories_formed: memories.data?.length || 0,
          reflections: reflections.data?.length || 0,
          completed_queries: queries.data?.filter(q => q.status === 'completed').length || 0,
          status: 'ok'
        };
      } catch (e) {
        analytics.modules.brain = { status: 'error', message: 'Brain analytics unavailable' };
      }
    }

    // ML Analytics
    if (modules.includes('ml')) {
      try {
        const { data: predictions, error } = await serviceClient
          .from('ml_predictions')
          .select('*')
          .gte('created_at', cutoffTime.toISOString());

        if (!error && predictions) {
          analytics.modules.ml = {
            total_predictions: predictions.length,
            avg_confidence: predictions.length > 0
              ? predictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / predictions.length
              : 0,
            anomalies_detected: predictions.filter(p => p.is_anomaly).length,
            status: 'ok'
          };
        } else {
          analytics.modules.ml = { status: 'error', message: 'Failed to fetch ML data' };
        }
      } catch (e) {
        analytics.modules.ml = { status: 'error', message: 'ML analytics unavailable' };
      }
    }

    // System Health
    if (modules.includes('system')) {
      try {
        const { data: events, error } = await serviceClient
          .from('brain_events')
          .select('*')
          .gte('created_at', cutoffTime.toISOString())
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && events) {
          const errorEvents = events.filter(e => e.level === 'error');
          analytics.modules.system = {
            total_events: events.length,
            errors: errorEvents.length,
            error_rate: events.length > 0 ? (errorEvents.length / events.length) : 0,
            uptime: events.length > 0 ? ((events.length - errorEvents.length) / events.length) * 100 : 100,
            status: 'ok'
          };
        } else {
          analytics.modules.system = { status: 'error', message: 'Failed to fetch system data' };
        }
      } catch (e) {
        analytics.modules.system = { status: 'error', message: 'System analytics unavailable' };
      }
    }

    // Check if all modules succeeded
    const allSuccess = Object.values(analytics.modules).every((m: any) => m.status === 'ok');
    analytics.status = allSuccess ? 'complete' : 'partial';

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return createSafeErrorResponse(error, corsHeaders, 'Analytics request failed');
  }
});
