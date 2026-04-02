/**
 * Checkout Redirect Utilities
 * Opens a first-party redirect page that creates a Stripe Checkout session, then redirects.
 * This avoids the "about:blank" tab pattern that can get stuck blank on some browsers.
 */

export type CheckoutFunctionName =
  | 'marketplace-checkout'
  | 'capability-checkout'
  | 'licensing-checkout'
  | 'showroom-checkout';

const base64UrlEncode = (input: string): string => {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const base64UrlDecode = (input: string): string => {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '==='.slice((b64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};

export const encodeCheckoutBody = (body: unknown): string => {
  return base64UrlEncode(JSON.stringify(body ?? {}));
};

export const decodeCheckoutBody = <T = unknown>(encoded: string): T => {
  return JSON.parse(base64UrlDecode(encoded)) as T;
};

export const buildCheckoutRedirectUrl = (fn: CheckoutFunctionName, body: unknown): string => {
  const params = new URLSearchParams();
  params.set('fn', fn);
  params.set('body', encodeCheckoutBody(body));
  return `/checkout/redirect?${params.toString()}`;
};

export const openCheckoutRedirect = (opts: { fn: CheckoutFunctionName; body: unknown }) => {
  const url = buildCheckoutRedirectUrl(opts.fn, opts.body);

  // Synchronous attempt to open a new tab (best UX).
  // If popups are blocked, fall back to same-tab navigation (still works reliably).
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (!w) {
    window.location.assign(url);
  }
};
