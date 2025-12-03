import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Type definitions
interface ApiKeyData {
  id: string;
  user_id: string;
  is_active: boolean;
}

interface SubscriptionData {
  requests_limit: number;
  requests_used: number;
  status: string;
}

interface IpReputation {
  ip_address: string;
  reputation_score: number;
  total_requests: number;
  blocked_count: number;
  last_seen: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate API key
    const { data: keyData, error: keyError } = await supabase
      .from('bot_sniper_api_keys')
      .select('id, user_id, is_active')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .maybeSingle();

    const apiKeyData = keyData as ApiKeyData | null;

    if (keyError || !apiKeyData) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check subscription limits
    const { data: subData } = await supabase
      .from('bot_sniper_subscriptions')
      .select('requests_limit, requests_used, status')
      .eq('user_id', apiKeyData.user_id)
      .maybeSingle();

    const subscription = subData as SubscriptionData | null;

    if (subscription && subscription.status === 'active') {
      if (subscription.requests_used >= subscription.requests_limit) {
        return new Response(JSON.stringify({ error: 'Request limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    const { ip, user_agent } = await req.json();

    // Bot detection logic
    const botResult = detectBot(ip, user_agent);
    
    // Update IP reputation
    await updateIPReputation(supabase, ip, botResult.is_bot);

    // Log request
    await supabase.from('bot_sniper_requests').insert({
      user_id: apiKeyData.user_id,
      api_key_id: apiKeyData.id,
      ip_address: ip,
      user_agent: user_agent,
      threat_score: botResult.threat_score,
      is_bot: botResult.is_bot,
      threat_type: botResult.threat_type,
      confidence: botResult.confidence,
      details: botResult.details
    } as Record<string, unknown>);

    // Update API key last used
    await supabase
      .from('bot_sniper_api_keys')
      .update({ last_used_at: new Date().toISOString() } as Record<string, unknown>)
      .eq('id', apiKeyData.id);

    // Increment usage counter
    if (subscription) {
      await supabase
        .from('bot_sniper_subscriptions')
        .update({ requests_used: subscription.requests_used + 1 } as Record<string, unknown>)
        .eq('user_id', apiKeyData.user_id);
    }

    return new Response(JSON.stringify(botResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function detectBot(ip: string, userAgent: string) {
  let threatScore = 0;
  const details: Record<string, unknown> = {};
  let threatType = 'unknown';

  // User agent analysis
  const botSignatures = [
    'bot', 'crawl', 'spider', 'scrape', 'curl', 'wget', 'python',
    'java', 'perl', 'ruby', 'scrapy', 'httpclient', 'okhttp',
    'axios', 'fetch', 'phantom', 'headless', 'selenium', 'puppeteer'
  ];

  const ua = userAgent?.toLowerCase() || '';
  
  if (!userAgent || userAgent.length === 0) {
    threatScore += 80;
    threatType = 'empty_user_agent';
    details.user_agent_issue = 'Empty user agent';
  } else {
    for (const sig of botSignatures) {
      if (ua.includes(sig)) {
        threatScore += 70;
        threatType = 'bot_signature';
        details.detected_signature = sig;
        break;
      }
    }

    if (userAgent.length < 20 || userAgent.length > 500) {
      threatScore += 30;
      details.user_agent_length = userAgent.length;
    }
  }

  // Headless browser detection
  const headlessPatterns = ['HeadlessChrome', 'PhantomJS', 'SlimerJS'];
  for (const pattern of headlessPatterns) {
    if (userAgent?.includes(pattern)) {
      threatScore += 85;
      threatType = 'headless_browser';
      details.headless_pattern = pattern;
      break;
    }
  }

  const isBot = threatScore >= 50;
  const confidence = Math.min(threatScore / 100, 0.99);

  return {
    is_bot: isBot,
    threat_score: Math.min(threatScore, 100),
    threat_type: threatType,
    confidence: parseFloat(confidence.toFixed(2)),
    details,
    action: threatScore >= 70 ? 'block' : threatScore >= 40 ? 'challenge' : 'allow'
  };
}

async function updateIPReputation(supabase: SupabaseClient, ip: string, isBot: boolean) {
  const { data: existingData } = await supabase
    .from('bot_sniper_ip_reputation')
    .select('*')
    .eq('ip_address', ip)
    .maybeSingle();

  const existing = existingData as IpReputation | null;

  if (existing) {
    const newScore = isBot 
      ? Math.max(0, existing.reputation_score - 10)
      : Math.min(100, existing.reputation_score + 2);
    
    await supabase
      .from('bot_sniper_ip_reputation')
      .update({
        reputation_score: newScore,
        total_requests: existing.total_requests + 1,
        blocked_count: existing.blocked_count + (isBot ? 1 : 0),
        last_seen: new Date().toISOString()
      } as Record<string, unknown>)
      .eq('ip_address', ip);
  } else {
    await supabase.from('bot_sniper_ip_reputation').insert({
      ip_address: ip,
      reputation_score: isBot ? 40 : 50,
      total_requests: 1,
      blocked_count: isBot ? 1 : 0,
      last_seen: new Date().toISOString()
    } as Record<string, unknown>);
  }
}
