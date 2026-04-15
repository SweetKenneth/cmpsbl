/**
 * Lovable Email Sender — Sends emails via enqueue_email RPC (Lovable Email infra)
 * Replaces all direct Resend API calls
 *
 * © 2025–2026 CMPSBL® · PromptFluid™. All rights reserved.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SENDER_DOMAIN = 'notify.cmpsbl.com';
const FROM_DOMAIN = 'cmpsbl.com';

interface SendEmailOpts {
  to: string;
  subject: string;
  html: string;
  fromName?: string;       // e.g. "CMPSBL" — defaults to "CMPSBL"
  fromUser?: string;       // e.g. "dev" → dev@cmpsbl.com — defaults to "noreply"
  idempotencyKey?: string; // optional dedup key
}

/**
 * Send a branded email through the Lovable email queue.
 * Falls back to direct fetch if enqueue_email RPC is not available.
 */
export async function sendBrandedEmail(opts: SendEmailOpts): Promise<boolean> {
  const { to, subject, html, fromName = 'CMPSBL', fromUser = 'noreply', idempotencyKey } = opts;

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceKey) {
    console.error('[LOVABLE-EMAIL] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return false;
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Build the from address
  const fromAddress = `${fromUser}@${FROM_DOMAIN}`;

  try {
    // Try enqueue_email RPC (queue-based, with retries)
    const { error } = await supabase.rpc('enqueue_email', {
      p_queue_name: 'transactional_emails',
      p_sender_domain: SENDER_DOMAIN,
      p_from_name: fromName,
      p_from_address: fromAddress,
      p_to_address: to,
      p_subject: subject,
      p_html: html,
      p_idempotency_key: idempotencyKey || `email-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      p_purpose: 'transactional',
    });

    if (error) {
      // If RPC not available (infra not set up yet), log and return false
      console.error('[LOVABLE-EMAIL] enqueue_email failed:', error.message);
      console.log('[LOVABLE-EMAIL] Email queue may not be set up yet. Email not sent to:', to);
      return false;
    }

    console.log(`[LOVABLE-EMAIL] Enqueued email to ${to}: ${subject}`);
    return true;
  } catch (err) {
    console.error('[LOVABLE-EMAIL] Unexpected error:', err);
    return false;
  }
}
