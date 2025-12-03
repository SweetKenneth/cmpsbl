import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const LogsRequestSchema = z.object({
  limit: z.number().int().min(1).max(1000).optional().default(100),
  types: z.array(z.enum(['all', 'defense', 'learning'])).optional().default(['all'])
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) throw new Error('Unauthorized')

    const { data: isAdmin } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) throw new Error('Forbidden');

    const body = await req.json();
    const validatedData = LogsRequestSchema.parse(body);
    const { limit, types } = validatedData;

    // Fetch logs from multiple sources in parallel
    const [defenseEvents, learningLogs] = await Promise.all([
      // Defense events
      types.includes('all') || types.includes('defense') 
        ? supabaseClient
            .from('defense_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)
        : { data: [] },
      
      // Learning logs
      types.includes('all') || types.includes('learning')
        ? supabaseClient
            .from('learning_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit)
        : { data: [] },
    ])

    // Combine and format all logs
    const combinedLogs = [
      ...(defenseEvents.data || []).map((log: any) => ({
        ...log,
        source: 'defense',
        timestamp: log.created_at,
        level: log.action === 'block' ? 'error' : log.action === 'challenge' ? 'warn' : 'info',
        message: `${log.action} ${log.ip} (score: ${log.risk_score})`,
        details: log.metadata
      })),
      ...(learningLogs.data || []).map((log: any) => ({
        ...log,
        source: 'learning',
        level: log.success ? 'info' : 'error',
        message: `${log.event_type}`,
        details: log.payload
      })),
    ]

    // Sort by timestamp descending
    combinedLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return new Response(
      JSON.stringify({
        logs: combinedLogs.slice(0, limit),
        count: combinedLogs.length,
        sources: {
          defense: defenseEvents.data?.length || 0,
          learning: learningLogs.data?.length || 0,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})