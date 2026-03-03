/**
 * Consent-Gated Tracking — Ported from aetherion-shield
 * Privacy-compliant behavioral tracking with localStorage consent checks
 * Target nodes: DEFENSE, SITE-GUARD
 */

import { secureGet, secureSet } from '@/lib/system/secureStorage';
import { boundArray } from '@/lib/system/hardening';

const CONSENT_KEY = 'defense_tracking_consent';
const MAX_EVENTS = 100;

// ── Consent management ──────────────────────────────────────────────

export function hasTrackingConsent(): boolean {
  return secureGet<string>(CONSENT_KEY) === 'granted';
}

export function grantTrackingConsent(): void {
  secureSet(CONSENT_KEY, 'granted');
}

export function revokeTrackingConsent(): void {
  secureSet(CONSENT_KEY, 'denied');
  clearConsentTrackingData();
  // Clear persistent fingerprint cache on consent revoke
  import('./fingerprint-cache').then(({ clearPersistentFingerprintCache }) => {
    clearPersistentFingerprintCache();
  }).catch(() => {
    // fingerprint-cache may not be loaded yet — safe to ignore
  });
}

// ── Data stores ──────────────────────────────────────────────────────

interface MouseEntry { x: number; y: number; timestamp: number }
interface KeyEntry { key: string; timestamp: number; type: string }
interface ScrollEntry { scrollY: number; timestamp: number }
interface ClickEntry { x: number; y: number; timestamp: number }
interface FocusEntry { focused: boolean; timestamp: number }

let mouseData: MouseEntry[] = [];
let keyData: KeyEntry[] = [];
let scrollData: ScrollEntry[] = [];
let clickData: ClickEntry[] = [];
let focusData: FocusEntry[] = [];
let active = false;
const cleanups: Array<() => void> = [];

// ── Init / Teardown ──────────────────────────────────────────────────

export function initConsentTracking(): void {
  if (active || !hasTrackingConsent()) return;
  active = true;

  let lastMouse = 0;
  const onMouse = (e: MouseEvent) => {
    const now = Date.now();
    if (now - lastMouse > 50) {
      mouseData = boundArray([...mouseData, { x: e.clientX, y: e.clientY, timestamp: now }], MAX_EVENTS);
      lastMouse = now;
    }
  };

  const onKey = (e: KeyboardEvent) => {
    keyData = boundArray(
      [...keyData, { key: e.key.length === 1 ? '*' : '[special]', timestamp: Date.now(), type: e.type }],
      MAX_EVENTS
    );
  };

  let lastScroll = 0;
  const onScroll = () => {
    const now = Date.now();
    if (now - lastScroll > 100) {
      scrollData = boundArray([...scrollData, { scrollY: window.scrollY, timestamp: now }], MAX_EVENTS);
      lastScroll = now;
    }
  };

  const onClick = (e: MouseEvent) => {
    clickData = boundArray([...clickData, { x: e.clientX, y: e.clientY, timestamp: Date.now() }], MAX_EVENTS);
  };

  const onFocus = () => {
    focusData = boundArray([...focusData, { focused: true, timestamp: Date.now() }], MAX_EVENTS);
  };
  const onBlur = () => {
    focusData = boundArray([...focusData, { focused: false, timestamp: Date.now() }], MAX_EVENTS);
  };

  window.addEventListener('mousemove', onMouse);
  window.addEventListener('keydown', onKey);
  window.addEventListener('scroll', onScroll);
  window.addEventListener('click', onClick);
  window.addEventListener('focus', onFocus);
  window.addEventListener('blur', onBlur);

  cleanups.push(
    () => window.removeEventListener('mousemove', onMouse),
    () => window.removeEventListener('keydown', onKey),
    () => window.removeEventListener('scroll', onScroll),
    () => window.removeEventListener('click', onClick),
    () => window.removeEventListener('focus', onFocus),
    () => window.removeEventListener('blur', onBlur),
  );
}

export function stopConsentTracking(): void {
  active = false;
  cleanups.forEach(fn => fn());
  cleanups.length = 0;
}

export function clearConsentTrackingData(): void {
  mouseData = [];
  keyData = [];
  scrollData = [];
  clickData = [];
  focusData = [];
}

export function getConsentTrackingData() {
  return {
    mouse_movements: mouseData,
    keyboard_events: keyData,
    scroll_events: scrollData,
    click_events: clickData,
    page_focus_times: focusData,
  };
}
