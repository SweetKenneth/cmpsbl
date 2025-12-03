import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get API key from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const apiKey = authHeader.replace('Bearer ', '')
    
    // Validate API key
    const apiKeyHash = await hashApiKey(apiKey)
    const { data: keyData, error: keyError } = await supabase
      .from('bot_sniper_api_keys')
      .select('user_id, is_active')
      .eq('api_key_hash', apiKeyHash)
      .single()

    if (keyError || !keyData || !keyData.is_active) {
      return new Response(JSON.stringify({ error: 'Invalid or inactive API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get user's subscription tier
    const { data: subscription } = await supabase
      .from('bot_sniper_subscriptions')
      .select('*')
      .eq('user_id', keyData.user_id)
      .eq('status', 'active')
      .single()

    // Return plugin configuration from Brain
    const config = {
      version: '1.0.0',
      plugin_mode: 'cloud_powered',
      endpoints: {
        detection: `${Deno.env.get('SUPABASE_URL')}/functions/v1/pf-bot-detection`,
        rules: `${Deno.env.get('SUPABASE_URL')}/functions/v1/pf-bot-sniper-rules`,
        stats: `${Deno.env.get('SUPABASE_URL')}/functions/v1/bot-sniper-stats`,
        report: `${Deno.env.get('SUPABASE_URL')}/functions/v1/pf-bot-report`
      },
      features: {
        detection_enabled: true,
        auto_block: subscription?.tier !== 'trial',
        challenge_page: subscription?.tier !== 'trial',
        analytics: true,
        real_time_updates: subscription?.tier === 'pro' || subscription?.tier === 'enterprise'
      },
      subscription: {
        tier: subscription?.tier || 'trial',
        monthly_requests: subscription?.monthly_requests || 10000,
        requests_used: subscription?.requests_used || 0,
        trial_ends_at: subscription?.trial_ends_at || null
      },
      brain_sync: {
        pull_rules_interval: 3600, // Pull new rules every hour
        report_stats_interval: 300, // Report stats every 5 minutes
        version_check_interval: 86400 // Check for updates daily
      }
    }

    return new Response(
      JSON.stringify(config),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Config fetch error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(apiKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
