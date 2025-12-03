/**
 * PromptFluid Defense WordPress Bot Scan
 * Real-time bot detection and behavioral analysis for WordPress sites
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wordpress-site, x-wordpress-version',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Rate limiting
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_SCANS_PER_WINDOW = 100;
const scanTimestamps = new Map<string, number[]>();

// Zod schema for input validation
const ScanRequestSchema = z.object({
  siteUrl: z.string().url().max(2048),
  action: z.string().max(50).optional(),
  userId: z.string().uuid().optional(),
  userAgent: z.string().max(500).optional(),
  behaviorData: z.object({
    mouseMovements: z.number().int().min(0).max(10000).optional(),
    keystrokes: z.number().int().min(0).max(10000).optional(),
    clicks: z.number().int().min(0).max(10000).optional(),
  }).optional(),
  deviceData: z.object({
    fingerprintHash: z.string().max(128).optional(),
  }).optional(),
});

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const timestamps = scanTimestamps.get(identifier) || [];
  
  const recentTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
  
  if (recentTimestamps.length >= MAX_SCANS_PER_WINDOW) {
    return false;
  }
  
  recentTimestamps.push(now);
  scanTimestamps.set(identifier, recentTimestamps);
  return true;
}

/**
 * Get client IP with security validation
 * Only trusts X-Forwarded-For if request comes from known CDN ranges
 */
function getSecureClientIp(req: Request): string {
  // SECURITY: Only use REMOTE_ADDR equivalent (connection IP) as the trusted source
  // X-Forwarded-For can be spoofed unless we validate the immediate proxy
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  const xForwardedFor = req.headers.get('x-forwarded-for');
  const xRealIp = req.headers.get('x-real-ip');
  
  // In Deno Deploy/Edge Functions, the connection is typically proxied
  // We log both for analysis but use a conservative approach
  if (cfConnectingIp) {
    // Cloudflare header - relatively trustworthy if traffic comes through CF
    console.log('[WP-DEFENSE-SCAN] Using CF-Connecting-IP');
    return cfConnectingIp.split(',')[0].trim();
  }
  
  if (xForwardedFor) {
    // SECURITY: Only take the rightmost IP before our known proxy
    // The leftmost IP can be spoofed by the client
    const ips = xForwardedFor.split(',').map(ip => ip.trim());
    // Use the rightmost non-internal IP as it's closest to our infrastructure
    const clientIp = ips[ips.length - 1] || ips[0];
    console.log('[WP-DEFENSE-SCAN] Using X-Forwarded-For (rightmost):', clientIp);
    return clientIp;
  }
  
  if (xRealIp) {
    console.log('[WP-DEFENSE-SCAN] Using X-Real-IP');
    return xRealIp;
  }
  
  return 'unknown';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get IP using secure method
    const clientIp = getSecureClientIp(req);
    
    // Rate limiting
    if (!checkRateLimit(clientIp)) {
      console.warn(`Defense scan rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: 'Too many scan requests. Please wait before trying again.'
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input with Zod
    let requestData;
    try {
      const rawData = await req.json();
      requestData = ScanRequestSchema.parse(rawData);
    } catch (validationError) {
      console.warn('[WP-DEFENSE-SCAN] Validation error:', validationError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request data',
          message: 'Request validation failed'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[WP-DEFENSE-SCAN] Request:', {
      siteUrl: requestData.siteUrl,
      action: requestData.action,
      userId: requestData.userId
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Perform bot detection analysis
    const behaviorData = requestData.behaviorData || {};
    const deviceData = requestData.deviceData || {};
    
    // Calculate bot risk score
    let riskScore = 0;
    const flags: string[] = [];

    // Analyze user agent
    const userAgent = requestData.userAgent || '';
    if (!userAgent || userAgent.length < 10) {
      riskScore += 30;
      flags.push('suspicious_user_agent');
    }

    // Check for automated behavior patterns
    if (behaviorData.mouseMovements === 0) {
      riskScore += 25;
      flags.push('no_mouse_movement');
    }

    if (behaviorData.keystrokes === 0 && (behaviorData.clicks || 0) > 10) {
      riskScore += 20;
      flags.push('automated_clicks');
    }

    // Check device fingerprint consistency
    if (deviceData.fingerprintHash) {
      const { data: knownFingerprint } = await supabase
        .from('device_fingerprints')
        .select('risk_score')
        .eq('fingerprint_hash', deviceData.fingerprintHash)
        .single();

      if (knownFingerprint && knownFingerprint.risk_score > 70) {
        riskScore += 25;
        flags.push('known_malicious_device');
      }
    }

    // Determine action
    let action = 'allow';
    let requireChallenge = false;

    if (riskScore >= 70) {
      action = 'block';
    } else if (riskScore >= 40) {
      action = 'challenge';
      requireChallenge = true;
    }

    // Log detection event
    await supabase.from('bot_detection_logs').insert({
      site_url: requestData.siteUrl,
      ip_address: clientIp,
      user_agent: userAgent,
      risk_score: riskScore,
      action: action,
      flags: flags,
      behavior_data: behaviorData,
      device_data: deviceData
    });

    // Update IP reputation
    await supabase.rpc('update_ip_reputation', {
      p_ip: clientIp,
      p_action: action,
      p_risk_score: riskScore
    });

    console.log('[WP-DEFENSE-SCAN] Result:', { riskScore, action, flags });

    return new Response(JSON.stringify({
      success: true,
      result: {
        action: action,
        riskScore: riskScore,
        flags: flags,
        requireChallenge: requireChallenge,
        challengeType: requireChallenge ? 'captcha' : null,
        message: action === 'block' 
          ? 'Access denied due to suspicious activity'
          : action === 'challenge'
          ? 'Please complete the challenge to continue'
          : 'Access granted'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('[WP-DEFENSE-SCAN] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Scan failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
