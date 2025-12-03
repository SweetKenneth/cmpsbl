import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export function useAdminAnalytics() {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  const trackPageView = (page: string) => {
    console.log("📊 Admin Analytics - Page View:", page);
    // Integration point for analytics service (e.g., Plausible, PostHog)
  };

  const trackEvent = ({ action, category, label, value }: AnalyticsEvent) => {
    console.log("📊 Admin Analytics - Event:", { action, category, label, value });
    // Integration point for analytics service
  };

  const trackError = (error: Error, context?: string) => {
    console.error("📊 Admin Analytics - Error:", error, context);
    // Integration point for error tracking (e.g., Sentry)
  };

  const trackUserAction = (action: string, metadata?: Record<string, any>) => {
    trackEvent({
      action,
      category: "user_interaction",
      label: JSON.stringify(metadata),
    });
  };

  return {
    trackPageView,
    trackEvent,
    trackError,
    trackUserAction,
  };
}
