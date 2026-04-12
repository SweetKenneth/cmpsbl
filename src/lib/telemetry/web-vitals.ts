/**
 * Web Vitals Reporter
 * Measures Core Web Vitals (CLS, LCP, FCP, TTFB, INP) and reports to PostHog.
 */

import { onCLS, onLCP, onFCP, onTTFB, onINP, type Metric } from 'web-vitals';
import { trackPostHogEvent } from './posthog';

function reportMetric(metric: Metric): void {
  trackPostHogEvent('web_vital', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
  });
}

export function initWebVitals(): void {
  // Only measure in production
  if (import.meta.env.DEV) return;

  onCLS(reportMetric);
  onLCP(reportMetric);
  onFCP(reportMetric);
  onTTFB(reportMetric);
  onINP(reportMetric);
}
