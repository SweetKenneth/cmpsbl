/**
 * Device Fingerprint Reputation — Enhanced with Drift Tolerance
 * 5-tier reputation engine with automation scanning, historical tracking,
 * and drift-tolerant scoring for returning devices.
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
  /** Drift evaluation result (from fingerprint-drift-evaluate) */
  drift_result?: {
    drift_score: number;
    is_within_tolerance: boolean;
    recommended_action: string;
  };
  /** Hashed signal data for snapshot storage */
  signal_hashes?: Record<string, string>;
  signal_buckets?: Record<string, string | number>;
  flags?: Record<string, boolean>;
}

interface DeviceReputation {
  fingerprint_hash: string;
  reputation_score: number;
  risk_level: 'trusted' | 'low' | 'medium' | 'high' | 'blocked';
  total_requests: number;
  first_seen: string;
  last_seen: string;
  reasons: string[];
  drift_score?: number;
  drift_action?: string;
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

// ── Rate limiter (per-fingerprint, windowed) ─────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 15; // max 15 requests per minute per fingerprint
const rateBuckets = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || (now - bucket.windowStart) > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(key, { count: 1, windowStart: now });
    return true;
  }

  bucket.count++;
  if (bucket.count > RATE_LIMIT_MAX) {
    return false;
  }
  return true;
}

// Prune stale buckets periodically (max 500 entries)
function pruneRateBuckets(): void {
  if (rateBuckets.size > 500) {
    const now = Date.now();
    for (const [key, bucket] of rateBuckets) {
      if (now - bucket.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
        rateBuckets.delete(key);
      }
    }
  }
}

Deno.serve(withMiddleware(async (req: Request) => {
  if (req.method !== 'POST') {
    throw new EdgeError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
  }

  const body = await parseBody<ReputationRequest>(req);

  if (!body.fingerprint_hash || body.fingerprint_hash.length < 1 || body.fingerprint_hash.length > 128) {
    throw new EdgeError('Invalid fingerprint_hash', 400, 'INVALID_INPUT');
  }

  // ── Rate limit check ──────────────────────────────────────────
  pruneRateBuckets();
  if (!checkRateLimit(body.fingerprint_hash)) {
    // Log rate limit event
    const supabaseLog = createAdminClient();
    await supabaseLog.from('defense_events').insert({
      fingerprint_hash: body.fingerprint_hash,
      action: 'challenge',
      event_type: 'rate_limited',
      metadata: { endpoint: 'device-fingerprint-reputation', reason: 'rate_limit_exceeded' },
    }).catch(() => {});

    throw new EdgeError('Rate limit exceeded', 429, 'RATE_LIMITED');
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
  let isTrusted = false;

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
    } else if (blockRate < 0.1 && totalEvents >= 10) {
      isTrusted = true;
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
  }

  // ── 5. DRIFT TOLERANCE INTEGRATION ────────────────────────────
  let driftScore: number | undefined;
  let driftAction: string | undefined;

  if (body.drift_result) {
    driftScore = body.drift_result.drift_score;
    driftAction = body.drift_result.recommended_action;

    if (body.drift_result.is_within_tolerance && isTrusted) {
      // Trusted device with low drift — reduce risk impact
      riskScore = Math.max(0, riskScore - 15);
      signals.push('DRIFT: Within tolerance (trusted device bonus)');
    } else if (driftScore > 0.6 && !isTrusted) {
      // High drift on untrusted device — increase risk
      riskScore += 20;
      signals.push('DRIFT: High drift on untrusted device');
    } else if (driftScore > 0.35) {
      riskScore += 10;
      signals.push('DRIFT: Moderate drift detected');
    }

    // Hard negatives from drift always override trust
    if (body.drift_result.recommended_action === 'block') {
      riskScore += 30;
      signals.push('DRIFT: Hard negative flags triggered block');
    }
  }

  // ── Build reputation ──────────────────────────────────────────
  const reputation: DeviceReputation = {
    fingerprint_hash: body.fingerprint_hash,
    reputation_score: Math.max(0, 100 - riskScore),
    risk_level: getRiskLevel(riskScore),
    total_requests: events ? events.length : 0,
    first_seen: events && events.length > 0 ? events[events.length - 1].created_at : now,
    last_seen: now,
    reasons: signals.length > 0 ? signals : (events && events.length > 0 ? ['established_device'] : ['new_device']),
    drift_score: driftScore,
    drift_action: driftAction,
  };

  console.log('[DEFENSE] Device reputation:', reputation.risk_level, 'score:', reputation.reputation_score, 'drift:', driftScore ?? 'n/a');

  return jsonResponse(reputation);
}));

function getRiskLevel(score: number): DeviceReputation['risk_level'] {
  if (score >= 80) return 'blocked';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'trusted';
}
