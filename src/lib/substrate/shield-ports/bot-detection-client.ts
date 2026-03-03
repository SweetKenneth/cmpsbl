/**
 * Bot Detection Client — Ported from aetherion-shield (Hardened)
 * Client-side data assembly + server-side scoring pipeline
 * Target nodes: DEFENSE, SITE-GUARD
 *
 * HARDENING: Raw fingerprint signals are hashed before network transit.
 * Only hashes + risk metadata cross the wire. Compliance-safe (GDPR/CCPA).
 */

import { supabase } from '@/integrations/supabase/client';
import { fnv1aHash } from '@/lib/system/hardening';

export interface DetectionPayload {
  /** Hashed fingerprint signals — NEVER raw canvas/webgl data */
  fingerprint_hashes?: {
    canvas_hash?: string;
    webgl_hash?: string;
    audio_hash?: string;
    font_hash?: string;
    composite_hash?: string;
  };
  behavioral_data?: {
    mouse_movements?: number;
    keyboard_events?: number;
    scroll_events?: number;
  };
  network_data?: {
    connection_type?: string;
  };
  /** UA is semi-public — kept for bot pattern matching */
  user_agent?: string;
  request_path?: string;
  request_method?: string;
}

export interface DetectionResult {
  allowed: boolean;
  action: 'allowed' | 'logged' | 'challenged' | 'blocked';
  score: number;
  reasons: string[];
  whitelisted: boolean;
  crawler?: string;
}

/**
 * Call the substrate's defense analysis via edge function.
 * Fails open — allows traffic if detection is unavailable.
 */
export async function detectBot(payload: DetectionPayload): Promise<DetectionResult> {
  try {
    const { data, error } = await supabase.functions.invoke('bot-detection', {
      body: payload,
    });

    if (error) {
      console.warn('[DEFENSE] Bot detection unavailable, failing open:', error.message);
      return failOpen('detection_service_unavailable');
    }

    return data as DetectionResult;
  } catch {
    console.warn('[DEFENSE] Bot detection exception, failing open');
    return failOpen('detection_exception');
  }
}

/**
 * Gather client-side fingerprint signals, HASH them, then return.
 * Raw canvas dataURLs and WebGL strings NEVER leave the client.
 */
export async function gatherDetectionData(): Promise<DetectionPayload> {
  const payload: DetectionPayload = {
    user_agent: navigator.userAgent,
    request_path: window.location.pathname,
    request_method: 'GET',
    fingerprint_hashes: {},
    behavioral_data: {},
    network_data: {},
  };

  // Canvas fingerprint → hash only
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('substrate fp', 2, 2);
      const raw = canvas.toDataURL();
      payload.fingerprint_hashes!.canvas_hash = fnv1aHash(raw).toString(16);
    }
  } catch {
    payload.fingerprint_hashes!.canvas_hash = 'blocked';
  }

  // WebGL fingerprint → hash only
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && 'getParameter' in gl) {
      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const raw = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
        payload.fingerprint_hashes!.webgl_hash = fnv1aHash(raw).toString(16);
      }
    }
  } catch {
    payload.fingerprint_hashes!.webgl_hash = 'blocked';
  }

  // Font list → composite hash
  try {
    const fonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
      'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS'];
    payload.fingerprint_hashes!.font_hash = fnv1aHash(fonts.join(',')).toString(16);
  } catch {
    payload.fingerprint_hashes!.font_hash = 'blocked';
  }

  // Composite hash of all signals
  const parts = [
    payload.fingerprint_hashes?.canvas_hash,
    payload.fingerprint_hashes?.webgl_hash,
    payload.fingerprint_hashes?.font_hash,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    String(navigator.hardwareConcurrency),
  ].filter(Boolean).join('|');
  payload.fingerprint_hashes!.composite_hash = fnv1aHash(parts).toString(16);

  return payload;
}

/** Simple behavior counter tracker — returns cleanup fn that yields counts */
export function trackBehavior(): () => DetectionPayload['behavioral_data'] {
  let mouse = 0, keys = 0, scrolls = 0;

  const onMouse = () => mouse++;
  const onKey = () => keys++;
  const onScroll = () => scrolls++;

  window.addEventListener('mousemove', onMouse);
  window.addEventListener('keydown', onKey);
  window.addEventListener('scroll', onScroll);

  return () => {
    window.removeEventListener('mousemove', onMouse);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('scroll', onScroll);
    return { mouse_movements: mouse, keyboard_events: keys, scroll_events: scrolls };
  };
}

function failOpen(reason: string): DetectionResult {
  return { allowed: true, action: 'allowed', score: 0, reasons: [reason], whitelisted: false };
}
