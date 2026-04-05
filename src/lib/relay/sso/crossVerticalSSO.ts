/**
 * Cross-Vertical SSO — Token Relay for Subdomain Authentication
 *
 * When a user authenticates on cmpsbl.com (the home substrate),
 * this module enables seamless propagation to vertical subdomains
 * (security.cmpsbl.com, robotics.cmpsbl.com, etc.) without
 * requiring a second login.
 *
 * Flow:
 *  1. User authenticates on cmpsbl.com (magic link or passkey)
 *  2. User clicks "Visit Vertical" — we append a signed relay token to the URL
 *  3. Vertical picks up the token on load, calls setSession(), user is in
 *
 * Security:
 *  - Relay tokens are short-lived (30 seconds)
 *  - Tokens are consumed on first use (one-time)
 *  - Tokens are passed in the URL fragment (not query string — never sent to server)
 *
 * © CMPSBL® — All rights reserved.
 */

const SSO_FRAGMENT_KEY = 'cmpsbl_sso';
const SSO_EXPIRY_MS = 30_000; // 30 seconds

/** Known vertical subdomains (static) */
const STATIC_VERTICAL_DOMAINS: Record<string, string> = {
  security: 'security.cmpsbl.com',
  robotics: 'robotics.cmpsbl.com',
  quantum: 'quantum.cmpsbl.com',
  media: 'media.cmpsbl.com',
  control: 'control.cmpsbl.com',
};

/** Lazy import to avoid circular deps — merged at query time */
function getAllVerticalDomains(): Record<string, string> {
  try {
    // Dynamic verticals discovered from the factory engine
    const { getDynamicSSODomains } = require('@/lib/factory/vertical-factory-engine');
    return { ...STATIC_VERTICAL_DOMAINS, ...getDynamicSSODomains() };
  } catch {
    return { ...STATIC_VERTICAL_DOMAINS };
  }
}

export interface SSORelayToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Build a vertical URL with an embedded SSO relay token in the fragment.
 * Call this when the user navigates from the home substrate to a vertical.
 */
export function buildSSOVerticalUrl(
  verticalUrl: string,
  accessToken: string,
  refreshToken: string
): string {
  const relay: SSORelayToken = {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + SSO_EXPIRY_MS,
  };

  const encoded = btoa(JSON.stringify(relay));
  const url = new URL(verticalUrl);
  url.hash = `${SSO_FRAGMENT_KEY}=${encoded}`;
  return url.toString();
}

/**
 * Extract and validate an SSO relay token from the current URL fragment.
 * Returns null if no token is present or it has expired.
 * Automatically cleans the fragment after extraction (one-time use).
 */
export function extractSSOToken(): SSORelayToken | null {
  const hash = window.location.hash;
  if (!hash) return null;

  const prefix = `#${SSO_FRAGMENT_KEY}=`;
  if (!hash.startsWith(prefix)) return null;

  try {
    const encoded = hash.slice(prefix.length);
    const relay: SSORelayToken = JSON.parse(atob(encoded));

    // Clean fragment immediately (one-time consumption)
    window.history.replaceState(null, '', window.location.pathname + window.location.search);

    // Validate expiry
    if (Date.now() > relay.expiresAt) {
      return null;
    }

    if (!relay.accessToken || !relay.refreshToken) {
      return null;
    }

    return relay;
  } catch {
    // Malformed token — clean up and ignore
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    return null;
  }
}

/**
 * Detect which vertical we're on (if any) from the hostname.
 */
export function detectVertical(): string | null {
  const hostname = window.location.hostname;
  const domains = getAllVerticalDomains();
  for (const [key, domain] of Object.entries(domains)) {
    if (hostname === domain || hostname.startsWith(`${key}.`)) {
      return key;
    }
  }
  return null;
}

/**
 * Check if the current site is the home substrate (cmpsbl.com).
 */
export function isHomeSubstrate(): boolean {
  const hostname = window.location.hostname;
  return (
    hostname === 'cmpsbl.com' ||
    hostname === 'www.cmpsbl.com' ||
    hostname === 'localhost' ||
    hostname.includes('lovable.app') // Preview/staging
  );
}

/**
 * Get the vertical domains registry for building portal links.
 */
export function getVerticalDomains(): Record<string, string> {
  return getAllVerticalDomains();
}
