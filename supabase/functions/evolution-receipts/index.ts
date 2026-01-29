import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Public Evolution Receipts Endpoint
 * v0.7.6 — Read-only, sanitized evolution audit trail
 * 
 * GET /evolution-receipts
 * Query params: page, page_size, run_id
 * 
 * Returns: Public receipt data (no internals, no code, no payloads)
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(url.searchParams.get('page_size') || '20'), 100);
    const runId = url.searchParams.get('run_id');

    // Single receipt lookup
    if (runId) {
      const { data, error } = await supabase
        .from('evolution_receipts')
        .select(`
          receipt_id,
          run_id,
          phase,
          tests_run,
          tests_passed,
          health_before,
          health_after,
          timestamp
        `)
        .eq('run_id', runId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Receipt not found' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get run details
      const { data: runData } = await supabase
        .from('evolution_runs')
        .select('confidence_score, risk_level, initiated_by')
        .eq('run_id', runId)
        .single();

      const publicReceipt = {
        run_id: data.run_id,
        phase: data.phase,
        confidence_score: runData?.confidence_score || 0,
        risk_level: runData?.risk_level || 'unknown',
        tests_run: data.tests_run || 0,
        tests_passed: data.tests_passed || 0,
        health_before: extractHealthScore(data.health_before),
        health_after: extractHealthScore(data.health_after),
        timestamp: data.timestamp,
        initiated_by: runData?.initiated_by || 'unknown',
      };

      return new Response(JSON.stringify({ 
        success: true, 
        receipt: publicReceipt 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Paginated list
    const offset = (page - 1) * pageSize;

    const { count } = await supabase
      .from('evolution_receipts')
      .select('*', { count: 'exact', head: true });

    const { data: receipts, error } = await supabase
      .from('evolution_receipts')
      .select(`
        receipt_id,
        run_id,
        phase,
        tests_run,
        tests_passed,
        health_before,
        health_after,
        timestamp
      `)
      .order('timestamp', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw error;
    }

    // Get run details for all receipts
    const runIds = [...new Set(receipts?.map(r => r.run_id) || [])];
    const { data: runs } = await supabase
      .from('evolution_runs')
      .select('run_id, confidence_score, risk_level, initiated_by')
      .in('run_id', runIds);

    const runsMap = new Map(runs?.map(r => [r.run_id, r]) || []);

    const publicReceipts = (receipts || []).map((r: any) => {
      const runData = runsMap.get(r.run_id);
      return {
        run_id: r.run_id,
        phase: r.phase,
        confidence_score: runData?.confidence_score || 0,
        risk_level: runData?.risk_level || 'unknown',
        tests_run: r.tests_run || 0,
        tests_passed: r.tests_passed || 0,
        health_before: extractHealthScore(r.health_before),
        health_after: extractHealthScore(r.health_after),
        timestamp: r.timestamp,
        initiated_by: runData?.initiated_by || 'unknown',
      };
    });

    return new Response(JSON.stringify({
      success: true,
      receipts: publicReceipts,
      total: count || 0,
      page,
      page_size: pageSize,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in evolution-receipts:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractHealthScore(health: any): number | null {
  if (!health) return null;
  if (typeof health === 'number') return health;
  if (typeof health === 'object' && 'score' in health) {
    return Number(health.score) || null;
  }
  return null;
}
