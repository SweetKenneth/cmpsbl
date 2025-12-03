import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitRequest {
  identifier: string; // IP address or user ID
  action: string; // e.g., 'api_call', 'login_attempt', 'bot_detection'
  limit?: number; // requests allowed per window
  window_seconds?: number; // time window in seconds
}

interface RateLimitResult {
  allowed: boolean;
  current_count: number;
  limit: number;
  reset_at: string;
  retry_after_seconds?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input with Zod
    const { z } = await import('https://deno.land/x/zod@v3.22.4/mod.ts');
    const RateLimitSchema = z.object({
      identifier: z.string().min(1).max(255),
      action: z.string().min(1).max(100),
      limit: z.number().int().min(1).max(10000).optional().default(100),
      window_seconds: z.number().int().min(1).max(86400).optional().default(3600)
    });
    
    const body = await req.json();
    const validation = RateLimitSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { identifier, action, limit, window_seconds } = validation.data;

    console.log('Rate limit check:', { identifier, action, limit, window_seconds });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const windowStart = new Date(now.getTime() - window_seconds * 1000);

    // Count requests in the current window
    const { data: events, error } = await supabase
      .from('defense_events')
      .select('id')
      .eq('ip', identifier)
      .gte('created_at', windowStart.toISOString());

    if (error) throw error;

    const currentCount = events?.length || 0;
    const resetAt = new Date(now.getTime() + window_seconds * 1000);

    // Check if limit exceeded
    if (currentCount >= limit) {
      const retryAfter = Math.ceil((resetAt.getTime() - now.getTime()) / 1000);
      
      const result: RateLimitResult = {
        allowed: false,
        current_count: currentCount,
        limit,
        reset_at: resetAt.toISOString(),
        retry_after_seconds: retryAfter,
      };

      // Log rate limit violation
      await supabase.from('defense_events').insert({
        ip: identifier,
        user_agent: 'rate-limit-check',
        endpoint: `rate-limit/${action}`,
        risk_score: 80,
        action: 'monitor',
        reason: `Rate limit exceeded for ${action}`,
        metadata: {
          identifier,
          action,
          current_count: currentCount,
          limit,
          window_seconds,
        },
      });

      return new Response(JSON.stringify(result), {
        status: 429,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetAt.toISOString(),
          'Retry-After': retryAfter.toString(),
        },
      });
    }

    const result: RateLimitResult = {
      allowed: true,
      current_count: currentCount,
      limit,
      reset_at: resetAt.toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': (limit - currentCount).toString(),
        'X-RateLimit-Reset': resetAt.toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Error in rate limit check:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});