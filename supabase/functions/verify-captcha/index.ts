/**
 * Verify CAPTCHA Response — Ported from aetherion-shield
 * Token-based verification with expiry, status tracking, and rate limiting.
 * Target nodes: DEFENSE, SITE-GUARD
 */

import {
  withMiddleware,
  createAdminClient,
  jsonResponse,
  parseBody,
  EdgeError,
} from "../_shared/edge-middleware.ts";

interface VerifyRequest {
  challenge_token: string;
  user_response: string;
  fingerprint_hash?: string;
  ip_address?: string;
}

// ── Rate limiter (in-memory, per-IP hash) ────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20; // max 20 verify attempts per minute
const rateBuckets = new Map<string, { count: number; windowStart: number }>();

function hashIp(ip: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < ip.length; i++) {
    h ^= ip.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16);
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || (now - bucket.windowStart) > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(key, { count: 1, windowStart: now });
    return true;
  }
  bucket.count++;
  return bucket.count <= RATE_LIMIT_MAX;
}

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

  // Rate limit by hashed IP
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const ipHash = hashIp(clientIp);
  pruneRateBuckets();

  if (!checkRateLimit(ipHash)) {
    // Log rate limit event
    const supabaseLog = createAdminClient();
    await supabaseLog.from('defense_events').insert({
      fingerprint_hash: ipHash,
      action: 'challenge',
      event_type: 'rate_limited',
      metadata: { endpoint: 'verify-captcha', reason: 'rate_limit_exceeded' },
    }).catch(() => {});

    throw new EdgeError('Rate limit exceeded', 429, 'RATE_LIMITED');
  }

  const body = await parseBody<VerifyRequest>(req);

  if (!body.challenge_token || !body.user_response) {
    throw new EdgeError('Missing challenge_token or user_response', 400, 'INVALID_INPUT');
  }

  // UUID format check
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(body.challenge_token)) {
    throw new EdgeError('Invalid challenge token format', 400, 'INVALID_TOKEN');
  }

  const supabase = createAdminClient();

  // Fetch the challenge
  const { data: challenge, error: fetchError } = await supabase
    .from('captcha_challenges')
    .select('*')
    .eq('token', body.challenge_token)
    .eq('status', 'pending')
    .single();

  if (fetchError || !challenge) {
    return jsonResponse({ success: false, error: 'Invalid or expired challenge' }, 400);
  }

  // Check 5-minute expiry
  const challengeAge = Date.now() - new Date(challenge.created_at).getTime();
  if (challengeAge > 5 * 60 * 1000) {
    await supabase
      .from('captcha_challenges')
      .update({ status: 'expired' })
      .eq('token', body.challenge_token);

    return jsonResponse({ success: false, error: 'Challenge expired' }, 400);
  }

  // Verify answer
  const isCorrect = body.user_response.trim() === challenge.correct_answer;

  // Update status
  await supabase
    .from('captcha_challenges')
    .update({
      status: isCorrect ? 'solved' : 'failed',
      solved_at: isCorrect ? new Date().toISOString() : null,
    })
    .eq('token', body.challenge_token);

  if (isCorrect) {
    console.log('[DEFENSE] CAPTCHA solved:', body.challenge_token);
    return jsonResponse({ success: true, message: 'Challenge solved successfully' });
  } else {
    return jsonResponse({ success: false, error: 'Incorrect answer' }, 400);
  }
}));
