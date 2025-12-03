import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReputationRequest {
  ip_address: string;
}

interface ReputationResult {
  ip_address: string;
  reputation_score: number;
  is_vpn: boolean;
  is_proxy: boolean;
  is_datacenter: boolean;
  is_tor: boolean;
  country_code: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input with Zod
    const { z } = await import('https://deno.land/x/zod@v3.22.4/mod.ts');
    const ReputationSchema = z.object({
      ip_address: z.string().ip()
    });
    
    const body = await req.json();
    const validation = ReputationSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { ip_address } = validation.data;
    
    console.log('Checking IP reputation for:', ip_address);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if we have cached reputation data (within last 24 hours)
    const { data: cached } = await supabase
      .from('ip_reputation')
      .select('*')
      .eq('ip', ip_address)
      .gte('last_seen', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (cached) {
      console.log('Returning cached reputation data');
      return new Response(JSON.stringify({
        ip_address,
        reputation_score: cached.score,
        is_vpn: cached.metadata?.is_vpn || false,
        is_proxy: cached.metadata?.is_proxy || false,
        is_datacenter: cached.metadata?.is_datacenter || false,
        is_tor: cached.metadata?.is_tor || false,
        country_code: cached.metadata?.country_code || 'US',
        risk_level: cached.score < 30 ? 'critical' : cached.score < 50 ? 'high' : cached.score < 70 ? 'medium' : 'low',
        reasons: cached.metadata?.reasons || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Perform IP reputation checks
    const result: ReputationResult = {
      ip_address,
      reputation_score: 100,
      is_vpn: false,
      is_proxy: false,
      is_datacenter: false,
      is_tor: false,
      country_code: 'US',
      risk_level: 'low',
      reasons: [],
    };

    // Check if IP is in known datacenter ranges
    const datacenterRanges = [
      { prefix: '18.', provider: 'AWS' },
      { prefix: '3.', provider: 'AWS' },
      { prefix: '52.', provider: 'AWS' },
      { prefix: '54.', provider: 'AWS' },
      { prefix: '104.', provider: 'Azure' },
      { prefix: '13.', provider: 'Azure' },
      { prefix: '40.', provider: 'Azure' },
      { prefix: '35.', provider: 'GCP' },
      { prefix: '34.', provider: 'GCP' },
      { prefix: '172.', provider: 'DigitalOcean' },
    ];

    for (const range of datacenterRanges) {
      if (ip_address.startsWith(range.prefix)) {
        result.is_datacenter = true;
        result.reputation_score -= 30;
        result.reasons.push(`datacenter_ip_${range.provider.toLowerCase()}`);
        break;
      }
    }

    // Check for proxy/VPN indicators
    if (ip_address.includes('proxy') || ip_address.includes('vpn')) {
      result.is_proxy = true;
      result.reputation_score -= 40;
      result.reasons.push('proxy_indicator_in_hostname');
    }

    // Tor exit node check (sample ranges)
    const torRanges = ['185.220.', '199.249.', '176.10.'];
    for (const torRange of torRanges) {
      if (ip_address.startsWith(torRange)) {
        result.is_tor = true;
        result.reputation_score -= 50;
        result.reasons.push('tor_exit_node');
        break;
      }
    }

    // Calculate risk level based on score
    if (result.reputation_score <= 30) {
      result.risk_level = 'critical';
    } else if (result.reputation_score <= 50) {
      result.risk_level = 'high';
    } else if (result.reputation_score <= 70) {
      result.risk_level = 'medium';
    } else {
      result.risk_level = 'low';
    }

    // Update IP reputation in database
    await supabase.rpc('update_ip_reputation', {
      p_ip: ip_address,
      p_action: result.risk_level === 'critical' || result.risk_level === 'high' ? 'block' : 'allow',
      p_risk_score: 100 - result.reputation_score
    });

    console.log('IP reputation result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error checking IP reputation:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});