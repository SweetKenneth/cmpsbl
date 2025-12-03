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

    // Get latest detection rules from Brain
    const { data: rules, error: rulesError } = await supabase
      .from('bot_detection_rules')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: false })

    if (rulesError) {
      console.error('Failed to fetch rules:', rulesError)
    }

    // Return current Brain-optimized detection logic
    const detectionRules = {
      version: '1.0.0',
      updated_at: new Date().toISOString(),
      rules: rules || [],
      behavioral_patterns: {
        suspicious_user_agents: [
          'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 
          'python', 'go-http', 'java', 'phantomjs', 'headless'
        ],
        legitimate_bots: [
          'googlebot', 'bingbot', 'slackbot', 'twitterbot', 
          'facebookexternalhit', 'linkedinbot'
        ],
        threat_scoring: {
          missing_user_agent: 40,
          short_user_agent: 30,
          bot_keyword: 30,
          suspicious_method: 20,
          direct_api_access: 15,
          rapid_requests: 25,
          legitimate_bot_reduction: -50
        }
      },
      auto_block_threshold: 70,
      challenge_threshold: 50
    }

    // Log rules pull for Brain learning
    await supabase
      .from('bot_sniper_rule_pulls')
      .insert({
        user_id: keyData.user_id,
        version: detectionRules.version,
        pulled_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify(detectionRules),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Rules fetch error:', error)
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
