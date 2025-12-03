import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UsageSchema = z.object({
  action: z.enum(['report', 'record']),
  module: z.string().max(100).optional(),
  feature: z.string().max(100).optional(),
  period: z.string().optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const body = await req.json();
    const result = UsageSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: result.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { action, module, feature, period } = result.data;

    if (action === 'report') {
      // Get usage report
      const startDate = period ? new Date(period) : new Date(new Date().setDate(1));
      
      const { data: usage } = await supabaseClient
        .from('core_usage')
        .select('*')
        .eq('user_id', user.id)
        .gte('period', startDate.toISOString().split('T')[0]);

      // Aggregate by module
      const byModule = usage?.reduce((acc: any, row: any) => {
        if (!acc[row.module]) {
          acc[row.module] = { calls: 0, cost_cents: 0 };
        }
        acc[row.module].calls += row.calls;
        acc[row.module].cost_cents += row.cost_cents;
        return acc;
      }, {});

      // Get quota from subscription
      const { data: subscription } = await supabaseClient
        .from('core_subscriptions')
        .select('*, core_plans(*)')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .single();

      const quota = subscription?.core_plans?.api_quota || 1000;
      const totalCalls = usage?.reduce((sum: number, row: any) => sum + row.calls, 0) || 0;

      return new Response(
        JSON.stringify({
          success: true,
          usage: {
            by_module: byModule,
            total_calls: totalCalls,
            quota,
            remaining: Math.max(0, quota - totalCalls),
            period: startDate.toISOString().split('T')[0]
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'record' && module && feature) {
      // Record usage
      await supabaseClient.from('core_usage').insert({
        user_id: user.id,
        module,
        feature,
        calls: 1,
        cost_cents: 0
      });

      console.log(`Usage recorded: ${user.id} - ${module}:${feature}`);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in pf-core-usage:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
