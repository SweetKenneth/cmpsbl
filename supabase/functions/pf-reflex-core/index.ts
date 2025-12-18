import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-reflex-key',
};

// Bot detection signatures
const BOT_SIGNATURES = [
  'bot', 'crawl', 'spider', 'scrape', 'curl', 'wget', 'python', 'java', 'perl',
  'ruby', 'scrapy', 'httpclient', 'okhttp', 'axios', 'fetch', 'phantom',
  'headless', 'selenium', 'puppeteer', 'playwright', 'webdriver', 'chrome-lighthouse'
];

const HEADLESS_PATTERNS = ['HeadlessChrome', 'PhantomJS', 'SlimerJS', 'Nightmare'];

const SUSPICIOUS_PATTERNS = [
  /^Mozilla\/4\.0/, // Very old browser
  /MSIE [1-6]\./, // Ancient IE
  /Windows NT [1-5]\./, // Ancient Windows
];

interface DetectionResult {
  is_bot: boolean;
  threat_score: number;
  threat_type: string;
  confidence: number;
  action: 'allow' | 'challenge' | 'block';
  indicators: string[];
  fingerprint_hash?: string;
}

interface RequestAnalysis {
  ip: string;
  user_agent: string;
  path?: string;
  method?: string;
  headers?: Record<string, string>;
  fingerprint?: Record<string, unknown>;
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
    const { action, ...params } = await req.json();
    console.log(`[pf-reflex-core] Action: ${action}`);

    switch (action) {
      // ============ REAL-TIME BOT DETECTION ============
      case 'detect': {
        const analysis = params as RequestAnalysis;
        const result = await detectBot(supabase, analysis);
        
        // Log to security events
        await supabase.from('pf_security_events').insert({
          event_type: result.threat_type || 'bot_check',
          ip_address: analysis.ip,
          user_agent: analysis.user_agent,
          threat_score: result.threat_score,
          action_taken: result.action,
          metadata: { indicators: result.indicators, fingerprint: analysis.fingerprint },
          detected_at: new Date().toISOString()
        });

        // Update IP reputation
        await updateIpReputation(supabase, analysis.ip, result);

        return jsonResponse({ success: true, ...result });
      }

      // ============ BEHAVIORAL ANALYSIS ============
      case 'analyze_behavior': {
        const { ip, session_id, events } = params;
        const behaviorScore = analyzeBehavior(events);
        
        await supabase.from('pf_security_events').insert({
          event_type: 'behavior_analysis',
          ip_address: ip,
          threat_score: behaviorScore.risk_score,
          action_taken: behaviorScore.recommendation,
          metadata: { session_id, patterns: behaviorScore.patterns }
        });

        return jsonResponse({ success: true, analysis: behaviorScore });
      }

      // ============ IP REPUTATION ============
      case 'ip_reputation': {
        const { ip } = params;
        const { data: reputation } = await supabase
          .from('ip_reputation')
          .select('*')
          .eq('ip', ip)
          .single();

        if (!reputation) {
          return jsonResponse({ 
            success: true, 
            reputation: { ip, score: 50, status: 'unknown', total_requests: 0 } 
          });
        }

        return jsonResponse({ 
          success: true, 
          reputation: {
            ip,
            score: reputation.score,
            status: reputation.score >= 70 ? 'trusted' : reputation.score >= 30 ? 'suspicious' : 'blocked',
            total_requests: reputation.total_requests,
            blocked_count: reputation.blocked_count,
            last_seen: reputation.last_seen
          }
        });
      }

      // ============ THREAT FEED ============
      case 'threat_feed': {
        const { limit = 50, severity } = params;
        let query = supabase
          .from('pf_security_events')
          .select('*')
          .order('detected_at', { ascending: false })
          .limit(limit);

        if (severity === 'high') {
          query = query.gte('threat_score', 70);
        } else if (severity === 'medium') {
          query = query.gte('threat_score', 40).lt('threat_score', 70);
        }

        const { data: events } = await query;
        return jsonResponse({ success: true, events: events || [] });
      }

      // ============ REAL-TIME STATS ============
      case 'stats': {
        const today = new Date().toISOString().split('T')[0];
        
        const [eventsResult, blockedResult, rulesResult, ipStatsResult] = await Promise.all([
          supabase.from('pf_security_events').select('*', { count: 'exact', head: true }).gte('detected_at', today),
          supabase.from('pf_security_events').select('*', { count: 'exact', head: true }).gte('detected_at', today).eq('action_taken', 'block'),
          supabase.from('defense_rules').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('ip_reputation').select('score')
        ]);

        const ipStats = ipStatsResult.data || [];
        const trusted = ipStats.filter(ip => ip.score >= 70).length;
        const suspicious = ipStats.filter(ip => ip.score >= 30 && ip.score < 70).length;
        const blocked = ipStats.filter(ip => ip.score < 30).length;

        // Determine threat level
        const eventsToday = eventsResult.count || 0;
        const blockedToday = blockedResult.count || 0;
        let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (blockedToday > 100) threatLevel = 'critical';
        else if (blockedToday > 50) threatLevel = 'high';
        else if (blockedToday > 20) threatLevel = 'medium';

        return jsonResponse({
          success: true,
          stats: {
            events_today: eventsToday,
            blocked_today: blockedToday,
            active_rules: rulesResult.count || 0,
            threat_level: threatLevel,
            ip_reputation: { trusted, suspicious, blocked }
          }
        });
      }

      // ============ MANAGE RULES ============
      case 'get_rules': {
        const { data: rules } = await supabase
          .from('defense_rules')
          .select('*')
          .order('priority', { ascending: true });
        return jsonResponse({ success: true, rules: rules || [] });
      }

      case 'create_rule': {
        const { rule_name, pattern, action: ruleAction, threshold, priority } = params;
        const { data: newRule, error } = await supabase
          .from('defense_rules')
          .insert({
            rule_name,
            pattern,
            action: ruleAction || 'monitor',
            threshold: threshold || 50,
            priority: priority || 5,
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;
        
        // Log to brain events
        await supabase.from('brain_events').insert({
          module: 'defense',
          event_type: 'rule_created',
          data: { rule: newRule },
          outcome: 'success'
        });

        return jsonResponse({ success: true, rule: newRule });
      }

      case 'toggle_rule': {
        const { rule_id, is_active } = params;
        const { data, error } = await supabase
          .from('defense_rules')
          .update({ is_active, updated_at: new Date().toISOString() })
          .eq('id', rule_id)
          .select()
          .single();

        if (error) throw error;
        return jsonResponse({ success: true, rule: data });
      }

      // ============ BLOCK/UNBLOCK IP ============
      case 'block_ip': {
        const { ip, reason } = params;
        await supabase.from('ip_reputation').upsert({
          ip,
          score: 0,
          blocked_count: 1,
          last_seen: new Date().toISOString(),
          metadata: { blocked_reason: reason, blocked_at: new Date().toISOString() }
        }, { onConflict: 'ip' });

        await supabase.from('pf_security_events').insert({
          event_type: 'manual_block',
          ip_address: ip,
          threat_score: 100,
          action_taken: 'block',
          metadata: { reason }
        });

        return jsonResponse({ success: true, message: `IP ${ip} blocked` });
      }

      case 'unblock_ip': {
        const { ip } = params;
        await supabase.from('ip_reputation').update({
          score: 50,
          metadata: { unblocked_at: new Date().toISOString() }
        }).eq('ip', ip);

        return jsonResponse({ success: true, message: `IP ${ip} unblocked` });
      }

      // ============ RECENT EVENTS ============
      case 'recent_events': {
        const { limit = 20 } = params;
        const { data: events } = await supabase
          .from('pf_security_events')
          .select('*')
          .order('detected_at', { ascending: false })
          .limit(limit);

        return jsonResponse({
          success: true,
          events: (events || []).map(e => ({
            id: e.id,
            type: e.event_type,
            ip: e.ip_address,
            timestamp: e.detected_at,
            action: e.action_taken,
            threat_score: e.threat_score
          }))
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('[pf-reflex-core] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============ HELPER FUNCTIONS ============

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function detectBot(supabase: any, analysis: RequestAnalysis): Promise<DetectionResult> {
  let threatScore = 0;
  const indicators: string[] = [];
  let threatType = 'clean';

  const ua = (analysis.user_agent || '').toLowerCase();

  // Empty user agent
  if (!analysis.user_agent || analysis.user_agent.length === 0) {
    threatScore += 80;
    indicators.push('empty_user_agent');
    threatType = 'empty_user_agent';
  } else {
    // Check bot signatures
    for (const sig of BOT_SIGNATURES) {
      if (ua.includes(sig)) {
        threatScore += 70;
        indicators.push(`bot_signature:${sig}`);
        threatType = 'known_bot';
        break;
      }
    }

    // Check headless browsers
    for (const pattern of HEADLESS_PATTERNS) {
      if (analysis.user_agent.includes(pattern)) {
        threatScore += 85;
        indicators.push(`headless:${pattern}`);
        threatType = 'headless_browser';
        break;
      }
    }

    // Check suspicious patterns
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(analysis.user_agent)) {
        threatScore += 30;
        indicators.push('suspicious_ua_pattern');
        break;
      }
    }

    // Abnormal user agent length
    if (analysis.user_agent.length < 20) {
      threatScore += 25;
      indicators.push('short_user_agent');
    } else if (analysis.user_agent.length > 500) {
      threatScore += 20;
      indicators.push('long_user_agent');
    }
  }

  // Check IP reputation
  const { data: ipRep } = await supabase
    .from('ip_reputation')
    .select('score, blocked_count')
    .eq('ip', analysis.ip)
    .single();

  if (ipRep) {
    if (ipRep.score < 30) {
      threatScore += 40;
      indicators.push('low_ip_reputation');
    }
    if (ipRep.blocked_count > 5) {
      threatScore += 30;
      indicators.push('repeated_blocks');
    }
  }

  // Fingerprint analysis
  if (analysis.fingerprint) {
    const fp = analysis.fingerprint;
    if (fp.webdriver === true) {
      threatScore += 60;
      indicators.push('webdriver_detected');
      threatType = 'automation';
    }
    if (fp.plugins === 0 || fp.plugins_length === 0) {
      threatScore += 25;
      indicators.push('no_plugins');
    }
    if (fp.languages_length === 0) {
      threatScore += 20;
      indicators.push('no_languages');
    }
  }

  // Cap threat score
  threatScore = Math.min(threatScore, 100);

  // Determine action
  let action: 'allow' | 'challenge' | 'block' = 'allow';
  if (threatScore >= 75) action = 'block';
  else if (threatScore >= 45) action = 'challenge';

  return {
    is_bot: threatScore >= 50,
    threat_score: threatScore,
    threat_type: threatType,
    confidence: Math.min(threatScore / 100, 0.99),
    action,
    indicators
  };
}

function analyzeBehavior(events: Array<{ type: string; timestamp: number; data?: unknown }>) {
  const patterns: string[] = [];
  let riskScore = 0;

  if (!events || events.length === 0) {
    return { risk_score: 0, patterns: ['no_data'], recommendation: 'allow' };
  }

  // Analyze timing patterns
  const timestamps = events.map(e => e.timestamp).sort();
  const intervals: number[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }

  // Check for robotic timing (perfectly regular intervals)
  if (intervals.length > 5) {
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
    
    if (variance < 10) { // Very consistent timing
      riskScore += 50;
      patterns.push('robotic_timing');
    }
  }

  // Check for rapid fire requests
  const rapidRequests = intervals.filter(i => i < 100).length;
  if (rapidRequests > intervals.length * 0.5) {
    riskScore += 40;
    patterns.push('rapid_requests');
  }

  // Check for unusual event sequences
  const eventTypes = events.map(e => e.type);
  const uniqueTypes = new Set(eventTypes);
  if (uniqueTypes.size === 1 && events.length > 10) {
    riskScore += 30;
    patterns.push('repetitive_actions');
  }

  riskScore = Math.min(riskScore, 100);

  return {
    risk_score: riskScore,
    patterns,
    recommendation: riskScore >= 70 ? 'block' : riskScore >= 40 ? 'challenge' : 'allow',
    event_count: events.length,
    unique_actions: uniqueTypes.size
  };
}

async function updateIpReputation(
  supabase: any,
  ip: string,
  result: DetectionResult
) {
  const { data: existing } = await supabase
    .from('ip_reputation')
    .select('*')
    .eq('ip', ip)
    .single();

  if (existing) {
    const newScore = result.is_bot
      ? Math.max(0, existing.score - 15)
      : Math.min(100, existing.score + 3);

    await supabase.from('ip_reputation').update({
      score: newScore,
      total_requests: existing.total_requests + 1,
      blocked_count: existing.blocked_count + (result.action === 'block' ? 1 : 0),
      last_seen: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('ip', ip);
  } else {
    await supabase.from('ip_reputation').insert({
      ip,
      score: result.is_bot ? 35 : 50,
      total_requests: 1,
      blocked_count: result.action === 'block' ? 1 : 0,
      last_seen: new Date().toISOString()
    });
  }
}
