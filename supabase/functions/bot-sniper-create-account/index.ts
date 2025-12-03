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

    const { email, site_url, plugin_type } = await req.json()

    if (!email || !site_url) {
      return new Response(
        JSON.stringify({ error: 'Email and site_url are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Creating Bot Sniper account:', { email, site_url, plugin_type })

    // Create or get user
    const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        created_via: 'wordpress_plugin',
        site_url,
        plugin_type: plugin_type || 'bot-sniper-standalone'
      }
    })

    let userId = user?.id

    if (userError) {
      // User might already exist, try to get them
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => u.email === email)
      
      if (!existingUser) {
        throw userError
      }
      
      userId = existingUser.id
    }

    if (!userId) {
      throw new Error('Failed to create or retrieve user')
    }

    // Generate API key
    const apiKey = 'pfbs_' + generateRandomString(48)
    const apiKeyHash = await hashApiKey(apiKey)

    // Store API key
    const { error: keyError } = await supabase
      .from('bot_sniper_api_keys')
      .insert({
        user_id: userId,
        key_name: `WordPress Plugin - ${site_url}`,
        api_key_hash: apiKeyHash,
        is_active: true,
        usage_count: 0
      })

    if (keyError) {
      console.error('Failed to create API key:', keyError)
      throw keyError
    }

    // Create free trial subscription
    const { error: subError } = await supabase
      .from('bot_sniper_subscriptions')
      .insert({
        user_id: userId,
        tier: 'trial',
        status: 'active',
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        monthly_requests: 10000,
        requests_used: 0
      })

    if (subError) {
      console.error('Failed to create subscription:', subError)
    }

    // Log installation to Brain for learning
    const { error: installError } = await supabase
      .from('bot_sniper_installations')
      .insert({
        user_id: userId,
        site_url,
        plugin_type: plugin_type || 'bot-sniper-standalone',
        wordpress_version: null, // Will be updated by plugin
        php_version: null, // Will be updated by plugin
        active: true
      })

    if (installError) {
      console.error('Failed to log installation:', installError)
    }

    // Send welcome email
    try {
      await supabase.functions.invoke('bot-sniper-welcome', {
        body: { email, userId, apiKey }
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the request if email fails
    }

    console.log('Account created successfully:', { userId, email })

    return new Response(
      JSON.stringify({
        api_key: apiKey,
        user_id: userId,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_tier: 'trial',
        monthly_requests: 10000
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Account creation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length]
  }
  return result
}

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(apiKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
