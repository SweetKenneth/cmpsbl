/**
 * PostHog Analytics Provider
 * Industry-standard product analytics replacing unreliable custom telemetry.
 * Key fetched from edge function (runtime secret).
 */

import posthog from 'posthog-js';

let initialized = false;
let initPromise: Promise<void> | null = null;

function isEditorPreview(): boolean {
  const host = window.location.hostname;
  return (
    host.includes('lovableproject.com') ||
    host.startsWith('id-preview--') ||
    new URLSearchParams(window.location.search).has('__lovable_token')
  );
}

export function initPostHog(): void {
  if (initialized || initPromise || isEditorPreview()) return;

  initPromise = (async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) return;

      const res = await fetch(`${supabaseUrl}/functions/v1/posthog-config`);
      if (!res.ok) return;

      const { key, host } = await res.json();
      if (!key) return;

      posthog.init(key, {
        api_host: host || 'https://us.i.posthog.com',
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
        loaded: () => {
          initialized = true;
        },
      });
    } catch {
      // Silent fail — analytics should never break the app
    }
  })();
}

export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  if (!initialized) return;
  posthog.identify(userId, traits);
}

export function trackPostHogEvent(event: string, properties?: Record<string, unknown>): void {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function resetPostHog(): void {
  if (!initialized) return;
  posthog.reset();
}

export { posthog };
