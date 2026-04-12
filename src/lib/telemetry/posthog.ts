/**
 * PostHog Analytics Provider
 * Replaces unreliable custom analytics with industry-standard product analytics.
 * PostHog API key is publishable (client-side safe).
 */

import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

let initialized = false;

export function initPostHog(): void {
  if (initialized || !POSTHOG_KEY) return;

  // Skip in editor/preview environments
  const host = window.location.hostname;
  if (
    host.includes('lovableproject.com') ||
    host.startsWith('id-preview--') ||
    new URLSearchParams(window.location.search).has('__lovable_token')
  ) {
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    loaded: () => {
      initialized = true;
    },
  });
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
