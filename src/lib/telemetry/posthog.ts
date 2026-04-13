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

  try {
    const POSTHOG_KEY = 'phx_DLkUnFN3bQyZHcggpNxJjyhqNYcZz7hK3ANpFFWL9NYwhzJZ';
    const POSTHOG_HOST = 'https://us.i.posthog.com';

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
      loaded: (ph) => {
        initialized = true;
        // Ensure anonymous users get a stable distinct_id
        if (!ph.get_distinct_id()) {
          ph.reset();
        }
      },
    });

    initialized = true;
  } catch {
    // Silent fail — analytics should never break the app
  }
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
