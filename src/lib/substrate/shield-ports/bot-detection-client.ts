/**
 * Bot Detection Client — Ported from aetherion-shield
 * Client-side data assembly + server-side scoring pipeline
 * Target nodes: DEFENSE, SITE-GUARD
 */

import { supabase } from '@/integrations/supabase/client';

export interface DetectionPayload {
  fingerprint_data?: {
    canvas?: string;
    webgl?: string;
    audio?: string;
    fonts?: string[];
  };
  behavioral_data?: {
    mouse_movements?: number;
    keyboard_events?: number;
    scroll_events?: number;
  };
  network_data?: {
    tls_fingerprint?: string;
    connection_type?: string;
  };
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
  } catch (err) {
    console.warn('[DEFENSE] Bot detection exception, failing open');
    return failOpen('detection_exception');
  }
}

/** Gather client-side fingerprint + behavioral signals */
export async function gatherDetectionData(): Promise<DetectionPayload> {
  const payload: DetectionPayload = {
    user_agent: navigator.userAgent,
    request_path: window.location.pathname,
    request_method: 'GET',
    fingerprint_data: {},
    behavioral_data: {},
    network_data: {},
  };

  // Canvas fingerprint
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('substrate fp', 2, 2);
      payload.fingerprint_data!.canvas = canvas.toDataURL();
    }
  } catch {
    payload.fingerprint_data!.canvas = 'blocked';
  }

  // WebGL fingerprint
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && 'getParameter' in gl) {
      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        payload.fingerprint_data!.webgl = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch {
    payload.fingerprint_data!.webgl = 'blocked';
  }

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
