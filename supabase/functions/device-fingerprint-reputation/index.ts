/**
 * Device Fingerprint Reputation — Ported from aetherion-shield
 * 5-tier reputation engine with automation property scanning and historical tracking.
 * Target nodes: DEFENSE, SITE-GUARD
 */

import {
  withMiddleware,
  createAdminClient,
  jsonResponse,
  parseBody,
  EdgeError,
} from "../_shared/edge-middleware.ts";

interface ReputationRequest {
  fingerprint_hash: string;
  fingerprint_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

interface DeviceReputation {
  fingerprint_hash: string;
  reputation_score: number;
  risk_level: 'trusted' | 'low' | 'medium' | 'high' | 'blocked';
  total_requests: number;
  first_seen: string;
  last_seen: string;
  reasons: string[];
}

// Known automation global properties
const AUTOMATION_PROPS = [
  'webdriver', '__webdriver_evaluate', '__selenium_evaluate',
  '__webdriver_script_function', '__webdriver_script_func',
  '__driver_evaluate', '__webdriver_unwrapped', '__fxdriver_evaluate',
  '__driver_unwrapped', '__selenium_unwrapped', '_Selenium_IDE_Recorder',
  '_selenium', 'calledSelenium', '$cdc_asdjflasutopfhvcZLmcfl_',
  '$chrome_asyncScriptInfo', '__$webdriverAsyncExecutor', 'webdriver_id',
  '__nightmare', '_phantom', 'phantom', 'callPhantom',
];

Deno.serve(withMiddleware(async (req: Request) => {
  if (req.method !== 'POST') {
    throw new EdgeError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
  }

  const body = await parseBody<ReputationRequest>(req);

  if (!body.fingerprint_hash || body.fingerprint_hash.length < 1 || body.fingerprint_hash.length > 128) {
    throw new EdgeError('Invalid fingerprint_hash', 400, 'INVALID_INPUT');
  }

  const supabase = createAdminClient();
  const fp = body.fingerprint_data || {};
  let riskScore = 0;
  const signals: string[] = [];

  // ── 1. CRITICAL AUTOMATION DETECTION ───────────────────────────
  if (fp.webdriver === true) {
    riskScore += 45;
    signals.push('CRITICAL: Selenium/WebDriver detected');
  }

  if (fp.headless === true) {
    riskScore += 50;
    signals.push('CRITICAL: Headless browser detected');
  }

  if (fp.cdpDetected === true) {
    riskScore += 40;
    signals.push('CRITICAL: Chrome DevTools Protocol leak');
  }

  if (fp.performanceAPITampered === true) {
    riskScore += 30;
    signals.push('HIGH: Performance API tampered');
  }

  // Check for automation global properties
  const foundAutomation = AUTOMATION_PROPS.filter(
    (prop) => fp.properties && fp.properties[prop]
  );
  if (foundAutomation.length > 0) {
    riskScore += 40;
    signals.push(`CRITICAL: Automation properties: ${foundAutomation.join(', ')}`);
  }

  // ── 2. BROWSER INCONSISTENCIES ────────────────────────────────
  if (fp.browserInconsistencies && Array.isArray(fp.browserInconsistencies)) {
    const count = fp.browserInconsistencies.length;
    if (count > 0) {
      riskScore += Math.min(count * 10, 40);
      signals.push(`MEDIUM: ${count} browser inconsistencies detected`);
    }
  }

  if (!fp.plugins || (Array.isArray(fp.plugins) && fp.plugins.length === 0)) {
    riskScore += 15;
    signals.push('MEDIUM: No browser plugins');
  }

  // Platform/UserAgent mismatch
  if (fp.platform && fp.userAgent) {
    const platformMismatch =
      (fp.platform.includes('Win') && !fp.userAgent.includes('Windows')) ||
      (fp.platform.includes('Mac') && !fp.userAgent.includes('Mac')) ||
      (fp.platform.includes('Linux') && !fp.userAgent.includes('Linux'));
    if (platformMismatch) {
      riskScore += 30;
      signals.push('HIGH: Platform/UserAgent mismatch');
    }
  }

  // ── 3. HARDWARE/ENVIRONMENT CHECKS ────────────────────────────
  if (fp.hardwareConcurrency) {
    if (fp.hardwareConcurrency === 1 || fp.hardwareConcurrency > 32) {
      riskScore += 10;
      signals.push('LOW: Unusual CPU core count');
    }
  }

  // WebRTC leak detection
  if (fp.webrtcLeak) {
    riskScore += 15;
    signals.push('MEDIUM: WebRTC IP leak detected');
  }

  // ── 4. HISTORICAL REPUTATION ──────────────────────────────────
  const { data: events } = await supabase
    .from('defense_events')
    .select('action, created_at')
    .eq('fingerprint_hash', body.fingerprint_hash)
    .order('created_at', { ascending: false })
    .limit(100);

  const now = new Date().toISOString();
  let reputation: DeviceReputation;

  if (events && events.length > 0) {
    const totalEvents = events.length;
    const blockedEvents = events.filter((e: any) => e.action === 'block').length;
    const suspiciousEvents = events.filter((e: any) => e.action === 'challenge').length;

    const blockRate = blockedEvents / totalEvents;

    if (blockRate > 0.5) {
      riskScore += 50;
      signals.push('HIGH: Historical block rate >50%');
    } else if (blockRate > 0.3) {
      riskScore += 30;
      signals.push('MEDIUM: Elevated block rate');
    }

    if (suspiciousEvents / totalEvents > 0.4) {
      riskScore += 20;
      signals.push('MEDIUM: High challenge rate');
    }

    // Rapid requests pattern
    if (totalEvents > 50) {
      const firstEvent = new Date(events[events.length - 1].created_at);
      const lastEvent = new Date(events[0].created_at);
      const hoursDiff = (lastEvent.getTime() - firstEvent.getTime()) / (1000 * 60 * 60);
      if (hoursDiff < 1) {
        riskScore += 25;
        signals.push('HIGH: Rapid request pattern');
      }
    }

    reputation = {
      fingerprint_hash: body.fingerprint_hash,
      reputation_score: Math.max(0, 100 - riskScore),
      risk_level: getRiskLevel(riskScore),
      total_requests: totalEvents,
      first_seen: events[events.length - 1].created_at,
      last_seen: now,
      reasons: signals.length > 0 ? signals : ['established_device'],
    };
  } else {
    reputation = {
      fingerprint_hash: body.fingerprint_hash,
      reputation_score: Math.max(0, 100 - riskScore),
      risk_level: getRiskLevel(riskScore),
      total_requests: 0,
      first_seen: now,
      last_seen: now,
      reasons: signals.length > 0 ? signals : ['new_device'],
    };
  }

  console.log('[DEFENSE] Device reputation:', reputation.risk_level, 'score:', reputation.reputation_score);

  return jsonResponse(reputation);
}));

function getRiskLevel(score: number): DeviceReputation['risk_level'] {
  if (score >= 80) return 'blocked';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'trusted';
}
