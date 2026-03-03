/**
 * Verify CAPTCHA Response — Ported from aetherion-shield
 * Token-based verification with expiry and status tracking.
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

Deno.serve(withMiddleware(async (req: Request) => {
  if (req.method !== 'POST') {
    throw new EdgeError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
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
