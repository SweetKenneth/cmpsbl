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
    
    // Validate API key and get user_id
    const { data: keyData, error: keyError } = await supabase
      .from('bot_sniper_api_keys')
      .select('user_id, is_active')
      .eq('api_key_hash', await hashApiKey(apiKey))
      .single()

    if (keyError || !keyData || !keyData.is_active) {
      return new Response(JSON.stringify({ error: 'Invalid or inactive API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const userId = keyData.user_id

    // Parse request body
    const { ip_address, user_agent, page_url, referer, timestamp, request_method } = await req.json()

    console.log('Bot detection request:', { ip_address, user_agent, page_url })

    // AI-powered bot detection logic
    const threatScore = await analyzeThreat({
      ip_address,
      user_agent,
      page_url,
      referer,
      request_method
    })

    const riskLevel = getRiskLevel(threatScore)
    const actionTaken = threatScore >= 70 ? 'block' : 'allow'

    // Log detection to Brain for learning
    const { error: logError } = await supabase
      .from('bot_sniper_detections')
      .insert({
        user_id: userId,
        ip_address,
        user_agent,
        threat_score: threatScore,
        risk_level: riskLevel,
        action_taken: actionTaken,
        page_url,
        referer,
        request_method,
        detected_at: timestamp || new Date().toISOString()
      })

    if (logError) {
      console.error('Failed to log detection:', logError)
    }

    // Update IP reputation in Brain
    await supabase.rpc('update_ip_reputation', {
      p_ip: ip_address,
      p_action: actionTaken,
      p_risk_score: threatScore
    })

    // Increment API usage counter
    await supabase
      .from('bot_sniper_api_keys')
      .update({ 
        last_used_at: new Date().toISOString()
      })
      .eq('api_key_hash', await hashApiKey(apiKey))

    return new Response(
      JSON.stringify({
        threat_score: threatScore,
        risk_level: riskLevel,
        action_taken: actionTaken,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Bot detection error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function analyzeThreat(data: {
  ip_address: string
  user_agent: string
  page_url?: string
  referer?: string
  request_method?: string
}): Promise<number> {
  let score = 0

  // User-Agent analysis
  if (!data.user_agent || data.user_agent.length < 20) {
    score += 40 // Suspiciously short or missing user agent
  }

  const botKeywords = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'go-http']
  if (botKeywords.some(keyword => data.user_agent?.toLowerCase().includes(keyword))) {
    score += 30
  }

  // Check for common legitimate bots (reduce score)
  const legitimateBots = ['googlebot', 'bingbot', 'slackbot', 'twitterbot']
  if (legitimateBots.some(bot => data.user_agent?.toLowerCase().includes(bot))) {
    score = Math.max(0, score - 50) // Reduce score for known good bots
  }

  // Request method check
  if (data.request_method && !['GET', 'POST', 'HEAD'].includes(data.request_method)) {
    score += 20
  }

  // Referer check (direct access to API endpoints is suspicious)
  if (data.page_url?.includes('/wp-') || data.page_url?.includes('/api/')) {
    if (!data.referer) {
      score += 15
    }
  }

  // Cap score at 100
  return Math.min(100, score)
}

function getRiskLevel(score: number): string {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  if (score >= 40) return 'low'
  return 'human'
}

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(apiKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
