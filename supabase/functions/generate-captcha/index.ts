/**
 * Generate CAPTCHA Challenge — Ported from aetherion-shield
 * Server-side math challenge generation with token-based verification.
 * Rate-limited to prevent abuse.
 * Target nodes: DEFENSE, SITE-GUARD
 */

import {
  withMiddleware,
  createAdminClient,
  jsonResponse,
  EdgeError,
} from "../_shared/edge-middleware.ts";

// ── Rate limiter (in-memory, per-IP hash) ────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10; // max 10 captcha generations per minute
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
    throw new EdgeError('Rate limit exceeded', 429, 'RATE_LIMITED');
  }

  const supabase = createAdminClient();

  // Generate math challenge
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 20) + 1;
  const operators = ['+', '-', '*'] as const;
  const operator = operators[Math.floor(Math.random() * operators.length)];

  let correctAnswer: string;
  switch (operator) {
    case '+': correctAnswer = (num1 + num2).toString(); break;
    case '-': correctAnswer = (num1 - num2).toString(); break;
    case '*': correctAnswer = (num1 * num2).toString(); break;
  }

  const challenge = `${num1} ${operator} ${num2} = ?`;
  const token = crypto.randomUUID();

  // Store challenge for verification
  const { error: insertError } = await supabase
    .from('captcha_challenges')
    .insert({
      token,
      challenge_text: challenge,
      correct_answer: correctAnswer,
      status: 'pending',
    });

  if (insertError) {
    console.error('[DEFENSE] CAPTCHA storage error:', insertError);
    throw new EdgeError('Failed to generate challenge', 500, 'CAPTCHA_GEN_FAILED');
  }

  console.log('[DEFENSE] CAPTCHA challenge generated:', token);

  return jsonResponse({
    token,
    challenge,
    expires_in: 300,
  });
}));
