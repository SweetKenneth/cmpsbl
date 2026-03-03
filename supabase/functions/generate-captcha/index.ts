/**
 * Generate CAPTCHA Challenge — Ported from aetherion-shield
 * Server-side math challenge generation with token-based verification.
 * Target nodes: DEFENSE, SITE-GUARD
 */

import {
  withMiddleware,
  createAdminClient,
  jsonResponse,
  EdgeError,
} from "../_shared/edge-middleware.ts";

Deno.serve(withMiddleware(async (req: Request) => {
  if (req.method !== 'POST') {
    throw new EdgeError('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
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
    expires_in: 300, // 5 minutes
  });
}));
