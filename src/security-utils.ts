/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  CMPSBL Security Utilities                                 ║
 * ║  Client-Side React — XSS Prevention & Input Hardening      ║
 * ║  Version: 1.0.0                                            ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Usage:
 * import { sanitizeHTML, SafeHTML, validateInput } from './security-utils';
 */

import DOMPurify from 'dompurify';
import validator from 'validator';
import React, { useMemo } from 'react';

// ══════════════════════════════════════════════════════════════════
// HTML SANITIZATION
// ══════════════════════════════════════════════════════════════════

/**
 * DOMPurify config — strict by default.
 * Only allow safe tags, strip all event handlers and scripts.
 */
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
    'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'img', 'figure', 'figcaption', 'hr', 'sub', 'sup', 'mark',
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'alt', 'src', 'class', 'id', 'target', 'rel',
    'width', 'height', 'colspan', 'rowspan',
  ],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
};

/**
 * Sanitize HTML string — safe for dangerouslySetInnerHTML.
 */
export function sanitizeHTML(dirty: string, customConfig: Record<string, unknown> = {}): string {
  if (typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, { ...PURIFY_CONFIG, ...customConfig }) as string;
}

/**
 * Sanitize and return object for dangerouslySetInnerHTML.
 */
export function createSafeMarkup(dirty: string): { __html: string } {
  return { __html: sanitizeHTML(dirty) };
}

/**
 * React component that safely renders HTML.
 * Drop-in replacement for dangerouslySetInnerHTML.
 *
 * Usage:
 *   <SafeHTML html={apiResponse.content} />
 *   <SafeHTML html={apiResponse.content} tag="article" className="prose" />
 */
interface SafeHTMLProps {
  html: string;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  [key: string]: unknown;
}

export function SafeHTML({ html, tag = 'div', className = '', ...props }: SafeHTMLProps) {
  const clean = useMemo(() => sanitizeHTML(html), [html]);
  return React.createElement(tag, {
    ...props,
    className,
    dangerouslySetInnerHTML: { __html: clean },
  });
}

// ══════════════════════════════════════════════════════════════════
// INPUT VALIDATION
// ══════════════════════════════════════════════════════════════════

interface ValidationResult {
  valid: boolean;
  value: string | number;
  error?: string;
}

/**
 * Validate and sanitize common input types.
 */
export const validateInput = {
  email(input: string): ValidationResult {
    const trimmed = (input || '').trim();
    if (!validator.isEmail(trimmed)) {
      return { valid: false, value: trimmed, error: 'Invalid email address' };
    }
    return { valid: true, value: validator.normalizeEmail(trimmed) || trimmed };
  },

  url(input: string): ValidationResult {
    const trimmed = (input || '').trim();
    if (!validator.isURL(trimmed, { protocols: ['http', 'https'], require_protocol: true })) {
      return { valid: false, value: trimmed, error: 'Invalid URL' };
    }
    return { valid: true, value: trimmed };
  },

  alphanumeric(input: string, options: { min?: number; max?: number } = {}): ValidationResult {
    const trimmed = (input || '').trim();
    const { min = 1, max = 255 } = options;
    if (!validator.isAlphanumeric(trimmed)) {
      return { valid: false, value: trimmed, error: 'Only letters and numbers allowed' };
    }
    if (!validator.isLength(trimmed, { min, max })) {
      return { valid: false, value: trimmed, error: `Must be ${min}-${max} characters` };
    }
    return { valid: true, value: trimmed };
  },

  text(input: string, options: { min?: number; max?: number } = {}): ValidationResult {
    const trimmed = (input || '').trim();
    const { min = 0, max = 10000 } = options;
    const cleaned = trimmed.replace(/[\x00\u200B\u200C\u200D\uFEFF]/g, '');
    if (!validator.isLength(cleaned, { min, max })) {
      return { valid: false, value: cleaned, error: `Must be ${min}-${max} characters` };
    }
    return { valid: true, value: validator.escape(cleaned) };
  },

  integer(input: string | number, options: { min?: number; max?: number } = {}): ValidationResult {
    const { min = -Infinity, max = Infinity } = options;
    if (!validator.isInt(String(input), { min, max })) {
      return { valid: false, value: input, error: `Must be integer between ${min} and ${max}` };
    }
    return { valid: true, value: parseInt(String(input), 10) };
  },

  uuid(input: string): ValidationResult {
    const trimmed = (input || '').trim();
    if (!validator.isUUID(trimmed)) {
      return { valid: false, value: trimmed, error: 'Invalid UUID' };
    }
    return { valid: true, value: trimmed };
  },

  /** Sanitize search/query params to prevent injection */
  searchQuery(input: string): ValidationResult {
    const trimmed = (input || '').trim();
    const cleaned = trimmed
      .replace(/['"`\\;]/g, '')
      .replace(/--/g, '')
      .replace(/(DROP|DELETE|INSERT|UPDATE|SELECT|UNION|ALTER|EXEC)\s/gi, '')
      .slice(0, 200);
    return { valid: true, value: cleaned };
  },
};

// ══════════════════════════════════════════════════════════════════
// URL SAFETY
// ══════════════════════════════════════════════════════════════════

/**
 * Validate a URL before using in href or redirect.
 * Blocks javascript:, data:, vbscript: protocols.
 */
export function isSafeURL(url: string): boolean {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();

  const blocked = ['javascript:', 'data:', 'vbscript:', 'blob:'];
  if (blocked.some((proto) => trimmed.startsWith(proto))) return false;

  if (trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('?')) return true;

  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Safe external link props — prevents tabnapping.
 * Usage: <a href={url} {...safeExternalLink}>Click</a>
 */
export const safeExternalLink = {
  target: '_blank' as const,
  rel: 'noopener noreferrer',
};

/**
 * Safe redirect — validates URL before navigation.
 */
export function safeRedirect(url: string, allowedDomains: string[] = ['cmpsbl.com']): boolean {
  if (!isSafeURL(url)) return false;

  if (url.startsWith('http')) {
    try {
      const parsed = new URL(url);
      const isAllowed = allowedDomains.some(
        (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
      );
      if (!isAllowed) return false;
    } catch {
      return false;
    }
  }

  window.location.href = url;
  return true;
}

// ══════════════════════════════════════════════════════════════════
// AUTH TOKEN HANDLING
// ══════════════════════════════════════════════════════════════════

const TOKEN_KEY = 'cmpsbl_auth';

/**
 * Store auth token securely.
 * Uses sessionStorage (cleared on tab close) by default.
 * For persistent auth, use httpOnly cookies on your API instead.
 */
export const authToken = {
  set(token: string, persistent = false) {
    const storage = persistent ? localStorage : sessionStorage;
    try {
      storage.setItem(TOKEN_KEY, token);
    } catch {
      // Storage full or unavailable
    }
  },

  get(): string | null {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  },

  remove() {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  isExpired(): boolean {
    const token = this.get();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },
};

// ══════════════════════════════════════════════════════════════════
// FETCH WRAPPER WITH SECURITY DEFAULTS
// ══════════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || '';

interface SecureFetchOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown>;
  timeout?: number;
  includeAuth?: boolean;
}

/**
 * Secure fetch wrapper with auto auth headers, timeout, and response validation.
 */
export async function secureFetch(path: string, options: SecureFetchOptions = {}): Promise<Response> {
  const {
    method = 'GET',
    body,
    timeout = 30000,
    includeAuth = true,
    ...rest
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string>),
  };

  if (includeAuth) {
    const token = authToken.get();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
      signal: controller.signal,
      ...rest,
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      authToken.remove();
      window.dispatchEvent(new CustomEvent('cmpsbl:auth:expired'));
    }

    return response;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}

// ══════════════════════════════════════════════════════════════════
// REACT HOOKS
// ══════════════════════════════════════════════════════════════════

/**
 * Hook to sanitize any value before rendering.
 * Usage: const clean = useSanitized(apiData.htmlContent);
 */
export function useSanitized(dirty: string): string {
  return useMemo(() => sanitizeHTML(dirty), [dirty]);
}

/**
 * Hook for validated form field.
 * Usage:
 *   const email = useValidatedField('email');
 *   <input value={email.value} onChange={e => email.set(e.target.value)} />
 *   {email.error && <span>{email.error}</span>}
 */
export function useValidatedField(type: keyof typeof validateInput, initialValue = '') {
  const [value, setValue] = React.useState(initialValue);
  const [error, setError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);

  const validate = React.useCallback(
    (val: string) => {
      if (!validateInput[type]) return { valid: true, value: val };
      return validateInput[type](val);
    },
    [type]
  );

  const set = React.useCallback(
    (val: string) => {
      setValue(val);
      setTouched(true);
      const result = validate(val);
      setError(result.valid ? null : result.error || null);
    },
    [validate]
  );

  return { value, error, touched, set, isValid: !error && touched };
}

// ══════════════════════════════════════════════════════════════════
// CSP VIOLATION REPORTER
// ══════════════════════════════════════════════════════════════════

/**
 * Listen for CSP violations and log them.
 * Call once in your App root.
 */
export function initCSPReporter(reportEndpoint: string | null = null) {
  document.addEventListener('securitypolicyviolation', (e) => {
    const violation = {
      directive: e.violatedDirective,
      blockedURI: e.blockedURI,
      source: e.sourceFile,
      line: e.lineNumber,
      timestamp: new Date().toISOString(),
    };

    if (reportEndpoint) {
      navigator.sendBeacon?.(reportEndpoint, JSON.stringify(violation));
    }
  });
}
