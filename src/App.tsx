/**
 * CMPSBL® — Cognitive Orchestration Substrate
 * Streamlined Application Entry
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { installProductionLogGuard } from "@/lib/system/productionLogGuard";

// Install production log guard before anything else logs
installProductionLogGuard();
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState, lazy, Suspense, useRef } from "react";
import { SEOProvider } from "@/contexts/SEOContext";

// Lazy-load non-critical UI components to reduce initial JS
const MotionConfigWrapper = lazy(() => import("framer-motion").then(m => ({ default: m.MotionConfig })));
const SmartToastRenderer = lazy(() => import("@/components/toast/SmartToastRenderer"));
const SonnerToaster = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
const DecodeFloat = lazy(() => import("@/components/decode/DecodeFloat"));

// Defer non-critical CSS (substrate voice, decode orb, clockless river animations)
const loadDeferredCSS = () => import("@/styles/deferred.css");
// Deferred utility imports — loaded dynamically to reduce initial JS
import { isEditorPreviewEnv } from "@/lib/system/isEditorPreviewEnv";

// CRITICAL: DiagErrorBoundary must be EAGERLY loaded so it can catch crashes
import { DiagErrorBoundary } from "@/components/system/DiagErrorBoundary";
const MobilePreviewSafeMode = lazy(() => import("@/components/system/MobilePreviewSafeMode").then(m => ({ default: m.MobilePreviewSafeMode })));
const DiagPanelLazy = lazy(() => import("@/components/system/DiagPanel").then(m => ({ default: m.DiagPanel })));

// Critical providers — eagerly loaded to prevent app-crashing dynamic import failures
import { SubstrateProvider } from "./components/substrate/SubstrateProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
const RegisterPasskeyPrompt = lazy(() => import("@/components/auth/RegisterPasskey").then(m => ({ default: m.RegisterPasskeyPrompt })));

// Route modules — extracted from monolith (P2 gap analysis)
import { publicRoutes } from "@/routes/publicRoutes";
import { blogRoutes } from "@/routes/blogRoutes";
import { adminRoutes } from "@/routes/adminRoutes";
import { legacyRoutes } from "@/routes/legacyRoutes";

// Lazy conversion + SEO components
const ConversionTracker = lazy(() => import("@/components/conversion/ConversionTracker").then(m => ({ default: m.ConversionTracker })));
const ExitIntentCapture = lazy(() => import("@/components/conversion/ExitIntentCapture").then(m => ({ default: m.ExitIntentCapture })));
const BackToTop = lazy(() => import("@/components/navigation/BackToTop").then(m => ({ default: m.BackToTop })));
const OnboardingWrapper = lazy(() => import("@/components/onboarding/OnboardingOverlay").then(m => {
  const { useOnboarding, OnboardingOverlay } = m;
  const Wrapper = () => {
    const { show, dismiss } = useOnboarding();
    if (!show) return null;
    return <OnboardingOverlay onDismiss={dismiss} />;
  };
  return { default: Wrapper };
}));
const KeyboardShortcutsHelp = lazy(() => import("@/components/navigation/KeyboardShortcutsHelp").then(m => ({ default: m.KeyboardShortcutsHelp })));
const RateLimitFeedback = lazy(() => import("@/components/ui/RateLimitFeedback").then(m => ({ default: m.RateLimitFeedback })));
const ClearCache = lazy(() => import("./pages/ClearCache"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

// Delay-based loader — only renders if chunk takes >400ms to load
const PageLoader = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 400);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        {/* Crystallization spinner */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-lg border-2 border-primary/20 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-1 rounded-md border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1s' }} />
          <div className="absolute inset-2.5 rounded-sm bg-primary/30 animate-pulse" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/60">
          Crystallizing
        </span>
      </div>
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

const App = () => {
  const isPreviewEnv = isEditorPreviewEnv();

  const previewParams = (() => {
    try {
      const url = new URL(window.location.href);
      return {
        previewFull: url.searchParams.get("previewFull") === "1",
        previewSafe: url.searchParams.get("previewSafe") === "1",
      };
    } catch {
      return { previewFull: false, previewSafe: false };
    }
  })();

  const isMobileDevice =
    typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || "");

  const mobilePreviewSafeMode =
    (previewParams.previewSafe || (isPreviewEnv && isMobileDevice)) && !previewParams.previewFull;

  // Defer substrate initialization on landing page to reduce critical request chain
  const isLandingPage = typeof window !== 'undefined' && 
    (window.location.pathname === '/' || window.location.pathname === '');
  const substrateAutoInit = !isLandingPage;

  // Global safety net for unhandled promise rejections
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("[App] Unhandled rejection:", event.reason);
      event.preventDefault();
    };
    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  // Install mobile watchdog + interaction tracking once on mount
  const cleanupRef = useRef<(() => void)[]>([]);
  useEffect(() => {
    loadDeferredCSS();

    // Tier 1: Critical safety (immediate)
    Promise.all([
      import("@/lib/defense/site-guard"),
      import("@/lib/telemetry/error-telemetry"),
    ]).then(([guard, telemetry]) => {
      const c = guard.installSiteGuard();
      telemetry.installGlobalErrorHandler();
      if (c) cleanupRef.current.push(c);
    });

    // Tier 2: UX essentials (after 100ms)
    setTimeout(() => {
      Promise.all([
        import("@/lib/client/mobile-watchdog"),
        import("@/lib/ui/lastInteraction"),
      ]).then(([watchdog, tracking]) => {
        const c1 = watchdog.installMobileWatchdog();
        const c2 = tracking.installLastInteractionTracking();
        cleanupRef.current.push(...[c1, c2].filter(Boolean) as (() => void)[]);
      });
    }, 100);

    // Tier 3: Analytics & diagnostics (after 1s)
    setTimeout(() => {
      Promise.all([
        import("@/lib/analytics/site-tracker"),
        import("@/lib/client/diag"),
      ]).then(([analytics, diag]) => {
        analytics.initSiteAnalytics();
        if (diag.diagEnabled()) {
          diag.diagLog("log", "App mounted", {
            timestamp: new Date().toISOString(),
            url: window.location.href.slice(0, 100),
          });
        }
      });
    }, 1000);

    return () => {
      cleanupRef.current.forEach(fn => fn());
    };
  }, []);

  // Force debug mode OFF on startup
  useEffect(() => {
    import("@/lib/debug-mode").then(({ debugMode }) => {
      if (!mobilePreviewSafeMode && debugMode.isEnabled()) {
        debugMode.disable();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Short-circuit: render ClearCache completely outside all providers
  const isCacheClearRoute = typeof window !== 'undefined' && 
    (window.location.pathname === '/pf-clear-cache' || window.location.pathname === '/clear-cache');

  if (isCacheClearRoute) {
    return (
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a' }} />}>
        <ClearCache />
      </Suspense>
    );
  }

  return (
    <DiagErrorBoundary>
      {mobilePreviewSafeMode ? (
        <MobilePreviewSafeMode />
      ) : (
        <Suspense fallback={null}>
        <MotionConfigWrapper reducedMotion={isPreviewEnv ? "always" : "user"}>
          <QueryClientProvider client={queryClient}>
          <SEOProvider>
            <Suspense fallback={<PageLoader />}>
              <SubstrateProvider autoInit={substrateAutoInit}>
                <TooltipProvider>
                  <SmartToastRenderer />
                  <SonnerToaster />
                   <BrowserRouter>
                    <a href="#main-content" data-skip-nav className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none">
                      Skip to content
                    </a>
                    <ScrollToTop />
                   <Routes>
                    <Route path="/*" element={
                     <AuthProvider>
                      <DecodeFloat />
                       <Suspense fallback={null}>
                         <RegisterPasskeyPrompt />
                       </Suspense>
                        <Suspense fallback={<PageLoader />}>
                        <main id="main-content">
                        <Routes>
                          {publicRoutes}
                          {blogRoutes}
                          {adminRoutes}
                          {legacyRoutes}

                          {/* 404 - catch all remaining */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        </main>
                         <Suspense fallback={null}>
                           <ConversionTracker />
                         </Suspense>
                         <Suspense fallback={null}>
                           <ExitIntentCapture />
                         </Suspense>
                          <Suspense fallback={null}>
                           <BackToTop />
                         </Suspense>
                          <Suspense fallback={null}>
                            <OnboardingWrapper />
                          </Suspense>
                          <Suspense fallback={null}>
                            <KeyboardShortcutsHelp />
                          </Suspense>
                          <Suspense fallback={null}>
                            <RateLimitFeedback />
                          </Suspense>
                    </Suspense>
                  </AuthProvider>
                    } />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </SubstrateProvider>
          </Suspense>
        </SEOProvider>
        </QueryClientProvider>
      </MotionConfigWrapper>
      </Suspense>
      )}

      {/* Diagnostic panel - only renders when ?diag=1 is present */}
      <Suspense fallback={null}>
        <DiagPanelLazy />
      </Suspense>
    </DiagErrorBoundary>
  );
};

export default App;
