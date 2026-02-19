/**
 * Webhook Signature Verification Utility
 * Shared across all edge functions that receive webhook callbacks.
 *
 * Supports:
 *  - Stripe (stripe-signature header, HMAC-SHA256)
 *  - Generic HMAC-SHA256 (x-signature header)
 *
 * Usage:
 *   import { verifyStripeWebhook, verifyHmacSignature } from '../_shared/webhook-verify.ts';
 */

// ═══ Stripe Webhook Verification ═════════════════════════════════

export async function verifyStripeWebhook(
  payload: string,
  signatureHeader: string | null,
  secret: string
): Promise<{ valid: boolean; error?: string }> {
  if (!signatureHeader) {
    return { valid: false, error: 'Missing stripe-signature header' };
  }

  try {
    const parts = signatureHeader.split(',').reduce((acc, part) => {
      const [key, value] = part.split('=');
      if (key && value) acc[key.trim()] = value.trim();
      return acc;
    }, {} as Record<string, string>);

    const timestamp = parts['t'];
    const signature = parts['v1'];

    if (!timestamp || !signature) {
      return { valid: false, error: 'Invalid stripe-signature format' };
    }

    // Check timestamp tolerance (5 minutes)
    const tsNum = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - tsNum) > 300) {
      return { valid: false, error: 'Webhook timestamp outside tolerance (>5 min)' };
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
    const expectedSig = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSig !== signature) {
      return { valid: false, error: 'Signature mismatch' };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: `Verification error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ═══ Generic HMAC-SHA256 Verification ════════════════════════════

export async function verifyHmacSignature(
  payload: string,
  signatureHex: string | null,
  secret: string,
  headerName = 'x-signature'
): Promise<{ valid: boolean; error?: string }> {
  if (!signatureHex) {
    return { valid: false, error: `Missing ${headerName} header` };
  }

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const expectedHex = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedHex !== signatureHex.replace(/^sha256=/, '')) {
      return { valid: false, error: 'HMAC signature mismatch' };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: `HMAC error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ═══ Timing-Safe Comparison ══════════════════════════════════════

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
