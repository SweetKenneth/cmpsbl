/**
 * CMPSBL® — Cognitive Orchestration Substrate
 * Streamlined Application Entry
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { installProductionLogGuard } from "@/lib/system/productionLogGuard";

// Install production log guard before anything else logs
installProductionLogGuard();
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense, useState, useRef } from "react";
import { SEOProvider } from "@/contexts/SEOContext";

// Lazy-load non-critical UI components to reduce initial JS
const MotionConfigWrapper = lazy(() => import("framer-motion").then(m => ({ default: m.MotionConfig })));
const SmartToastRenderer = lazy(() => import("@/components/toast/SmartToastRenderer"));
const SonnerToaster = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
const DecodeFloat = lazy(() => import("@/components/decode/DecodeFloat"));

// Defer non-critical CSS (substrate voice, decode orb, clockless river animations)
const loadDeferredCSS = () => import("@/styles/deferred.css");
// Deferred utility imports — loaded dynamically to reduce initial JS
import { isEditorPreviewEnv } from "@/lib/system/isLovableEditorPreviewEnv";

// Mobile crash diagnostics (opt-in via ?diag=1) — lazy loaded
// CRITICAL: DiagErrorBoundary must be EAGERLY loaded so it can catch crashes
// before any lazy/Suspense resolution. Lazy-loading an error boundary defeats its purpose.
import { DiagErrorBoundary } from "@/components/system/DiagErrorBoundary";
const MobilePreviewSafeMode = lazy(() => import("@/components/system/MobilePreviewSafeMode").then(m => ({ default: m.MobilePreviewSafeMode })));
const DiagPanelLazy = lazy(() => import("@/components/system/DiagPanel").then(m => ({ default: m.DiagPanel })));

const SubstrateProvider = lazy(() => import("./components/substrate/SubstrateProvider").then(m => ({ default: m.SubstrateProvider })));
const AuthProvider = lazy(() => import("@/contexts/AuthContext").then(m => ({ default: m.AuthProvider })));
import { AdminRoute } from "@/components/admin/AdminRoute";
import { PhaseGateRoute } from "@/components/gates/PhaseGateRoute";
import { PackGate } from "@/components/slots/PackGate";
const TooltipProvider = lazy(() => import("@/components/ui/tooltip").then(m => ({ default: m.TooltipProvider })));
const RegisterPasskeyPrompt = lazy(() => import("@/components/auth/RegisterPasskey").then(m => ({ default: m.RegisterPasskeyPrompt })));

// Scroll to top on route change - immediate scroll for better UX
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Immediate scroll to top, no smooth behavior for page loads
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  
  return null;
};

// Route transition loader — subtle branded indicator
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center animate-pulse">
        <div className="w-3 h-3 rounded-full bg-primary/60" />
      </div>
    </div>
  </div>
);

// Lazy-load mobile bottom nav, back-to-top, and onboarding
const MobileBottomNav = lazy(() => import("@/components/navigation/MobileBottomNav").then(m => ({ default: m.MobileBottomNav })));
const BackToTop = lazy(() => import("@/components/navigation/BackToTop").then(m => ({ default: m.BackToTop })));
const OnboardingWrapper = lazy(() => import("@/components/onboarding/OnboardingOverlay").then(m => {
  const { useOnboarding, OnboardingOverlay } = m;
  // Wrap in a component that uses the hook
  const Wrapper = () => {
    const { show, dismiss } = useOnboarding();
    if (!show) return null;
    return <OnboardingOverlay onDismiss={dismiss} />;
  };
  return { default: Wrapper };
}));

// Core pages - only Explore eager loaded for LCP, rest lazy
import Explore from "./pages/Explore";
import DomainAwareHome from "./components/routing/DomainAwareHome";
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load all other pages to reduce initial bundle
const Auth = lazy(() => import("./pages/Auth"));
const Decode = lazy(() => import("./pages/Decode"));
const FeedDreamEater = lazy(() => import("./pages/FeedDreamEater"));
const DreamArchaeology = lazy(() => import("./pages/dream-eater/DreamArchaeology"));
const DreamArtifacts = lazy(() => import("./pages/dream-eater/DreamArtifacts"));
const Blog = lazy(() => import("./pages/Blog"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const InvestorsPublic = lazy(() => import("./pages/InvestorsPublic"));
const SubstrateDashboard = lazy(() => import("./pages/SubstrateDashboard"));
const SubstrateOS = lazy(() => import("./pages/SubstrateOS"));
const SubstrateDemo = lazy(() => import("./pages/SubstrateDemo"));
const ProofMode = lazy(() => import("./pages/ProofMode"));
const Documentation = lazy(() => import("./pages/Documentation"));
const IntentMeshPublic = lazy(() => import("./pages/IntentMeshPublic"));
const Publication = lazy(() => import("./pages/Publication"));
const DevPortal = lazy(() => import("./pages/DevPortal"));
const Changelog = lazy(() => import("./pages/Changelog"));
const CodeLab = lazy(() => import("./pages/CodeLab"));
const ForgeCatalog = lazy(() => import("./pages/ForgeCatalog"));
const DevTools = lazy(() => import("./pages/DevTools"));
const DeveloperAcademy = lazy(() => import("./pages/DeveloperAcademy"));

const GamingSubstrate = lazy(() => import("./pages/GamingSubstrate"));
const DeveloperShowcase = lazy(() => import("./pages/DeveloperShowcase"));
const UseCases = lazy(() => import("./pages/UseCases"));
const AgencyPortal = lazy(() => import("./pages/AgencyPortal"));

// Marketplace page superseded by SubstrateStore — retained as dead code marker
const MarketplaceSuccess = lazy(() => import("./pages/MarketplaceSuccess"));
const SubstrateIntelligence = lazy(() => import("./pages/SubstrateIntelligence"));
const SubstrateLicensing = lazy(() => import("./pages/SubstrateLicensing"));
const SubstrateLicensingSuccess = lazy(() => import("./pages/SubstrateLicensingSuccess"));
const SubstrateLicensingDownload = lazy(() => import("./pages/SubstrateLicensingDownload"));
const ExperimentationLab = lazy(() => import("./pages/ExperimentationLab"));
const ClocklessWorldEngine = lazy(() => import("./pages/ClocklessWorldEngine"));
const SubstrateCapabilitiesDocs = lazy(() => import("./pages/SubstrateCapabilitiesDocs"));
// CapabilitiesDepot and SynergyPipelines superseded by SubstrateStore routes
const SubstrateStore = lazy(() => import("./pages/SubstrateStore"));
const SystemIntelligenceFeed = lazy(() => import("./pages/SystemIntelligenceFeed"));
const ClearCache = lazy(() => import("./pages/ClearCache"));
const CheckoutRedirect = lazy(() => import("./pages/CheckoutRedirect"));
const EngineMarketplace = lazy(() => import("./pages/EngineMarketplace"));
const Upgrade = lazy(() => import("./pages/Upgrade"));
const Diligence = lazy(() => import("./pages/Diligence"));
const Templates = lazy(() => import("./pages/Templates"));
const Packs = lazy(() => import("./pages/Packs"));
const CapabilityMap = lazy(() => import("./pages/CapabilityMap"));
const ScanResult = lazy(() => import("./pages/ScanResult"));
const QuarryDashboard = lazy(() => import("./pages/admin/QuarryDashboard"));
const PersistentMemoryDocs = lazy(() => import("./pages/docs/PersistentMemoryDocs"));
const RuntimeReference = lazy(() => import("./pages/docs/RuntimeReference"));
const CapabilityManifest = lazy(() => import("./pages/docs/CapabilityManifest"));
const RuntimePage = lazy(() => import("./pages/Runtime"));
const PersistentMemoryLanding = lazy(() => import("./pages/PersistentMemoryLanding"));
const AdminPatches = lazy(() => import("./pages/AdminPatches"));
const ShadowMeshPage = lazy(() => import("./pages/admin/ShadowMeshPage"));
const ImmunityMeshDashboard = lazy(() => import("./pages/admin/ImmunityMeshDashboard"));
const StartHere = lazy(() => import("./pages/StartHere"));
const ComposableCognitives = lazy(() => import("./pages/ComposableCognitives"));
const Enterprise = lazy(() => import("./pages/Enterprise"));
const ApiAccess = lazy(() => import("./pages/ApiAccess"));
const Careers = lazy(() => import("./pages/Careers"));
const CognitivesSuccess = lazy(() => import("./pages/CognitivesSuccess"));
const CognitivesDownload = lazy(() => import("./pages/CognitivesDownload"));
const AdminCognitiveUploads = lazy(() => import("./pages/AdminCognitiveUploads"));
const STierDemos = lazy(() => import("./pages/STierDemos"));
const OwnerReports = lazy(() => import("./pages/admin/OwnerReports"));
const EvolutionMeshDashboard = lazy(() => import("./pages/admin/EvolutionMeshDashboard"));
const GovernanceControlPlane = lazy(() => import("./pages/admin/GovernanceControlPlane"));
const EvolutionMeshLanding = lazy(() => import("./pages/EvolutionMeshLanding"));
const Architecture = lazy(() => import("./pages/Architecture"));
const IntelPanel = lazy(() => import("./pages/admin/IntelPanel"));

const Status = lazy(() => import("./pages/Status"));
const SystemIntegrity = lazy(() => import("./pages/SystemIntegrity"));
// Module pages (de-shrouded)
const ModulesHub = lazy(() => import("./pages/ModulesHub"));
const ModuleDetail = lazy(() => import("./pages/ModuleDetail"));
const AIOperatingSystem = lazy(() => import("./pages/AIOperatingSystem"));
const EncodeInfo = lazy(() => import("./pages/products/EncodeInfo"));



// PromptFluid portfolio page (accessible via menu + promptfluid.com domain)
const PromptFluidHome = lazy(() => import("./pages/PromptFluidHome"));

// Marketing / Info pages
const About = lazy(() => import("./pages/About"));
const Solutions = lazy(() => import("./pages/Solutions"));
const Contact = lazy(() => import("./pages/Contact"));
const CurrentProjects = lazy(() => import("./pages/CurrentProjects"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const LlmsTxt = lazy(() => import("./pages/LlmsTxt"));
const HumansTxt = lazy(() => import("./pages/HumansTxt"));
const Foundations = lazy(() => import("./pages/Foundations"));
const Namespace = lazy(() => import("./pages/Namespace"));
const Insights = lazy(() => import("./pages/Insights"));
const Register = lazy(() => import("./pages/Register"));
const Library = lazy(() => import("./pages/Library"));
const Support = lazy(() => import("./pages/Support"));
// Explore is now the homepage (eager loaded above)

// Lazy load blog posts
const WordPressBotDefense = lazy(() => import("./pages/blog/WordPressBotDefense"));
const TopSecurityPlugins2025 = lazy(() => import("./pages/blog/TopSecurityPlugins2025"));
const AICybersecurityEvolution2025 = lazy(() => import("./pages/blog/AICybersecurityEvolution2025"));
const AIHackersUnderground2025 = lazy(() => import("./pages/blog/AIHackersUnderground2025"));
const AIProductComparison2025 = lazy(() => import("./pages/blog/AIProductComparison2025"));
const InclusiveModuleMission = lazy(() => import("./pages/blog/InclusiveModuleMission"));
const PromptFluidMarketDisruptor = lazy(() => import("./pages/blog/PromptFluidMarketDisruptor"));
const ProductRoadmap2025 = lazy(() => import("./pages/blog/ProductRoadmap2025"));
const AIAutomationTrends2025 = lazy(() => import("./pages/blog/AIAutomationTrends2025"));
const AIBusinessOperations2025 = lazy(() => import("./pages/blog/AIBusinessOperations2025"));
const HowPromptFluidWorks = lazy(() => import("./pages/blog/how-promptfluid-works-cascade-ai-ecosystem"));
const CascadeAIDeepDive = lazy(() => import("./pages/blog/cascade-ai-adaptive-intelligence-brain"));
const PromptFluidStudioGuide = lazy(() => import("./pages/blog/promptfluid-studio-build-apps-that-think"));
const AITriadExplained = lazy(() => import("./pages/blog/ai-triad-intelligent-routing"));
const PromptFluidBrain = lazy(() => import("./pages/blog/promptfluid-brain-adaptive-learning-core"));
const PromptFluidVision = lazy(() => import("./pages/blog/promptfluid-vision-unified-dashboard"));
const PromptFluidDefense = lazy(() => import("./pages/blog/promptfluid-defense-ai-security"));
const PromptFluidRipple = lazy(() => import("./pages/blog/promptfluid-ripple-network-integration"));
const PromptFluidAccess = lazy(() => import("./pages/blog/promptfluid-access-identity-billing"));
const PromptFluidNexus = lazy(() => import("./pages/blog/promptfluid-nexus-api-gateway"));
const AISystemsThatDreamPressRelease = lazy(() => import("./pages/blog/ai-systems-that-dream-press-release"));
const AccessibilityFreeForAll = lazy(() => import("./pages/blog/accessibility-free-for-all"));
const WordPressAccessibilityGuide = lazy(() => import("./pages/blog/WordPressAccessibilityGuide"));
const WCAG22Changes = lazy(() => import("./pages/blog/WCAG22Changes"));
const AIAccessibilityFixes = lazy(() => import("./pages/blog/AIAccessibilityFixes"));

// Pillar/cluster posts
const EvolvingSoftwareV6Breakthrough = lazy(() => import("./pages/blog/evolving-software-v6-breakthrough"));
const LLMsTxtProtocol = lazy(() => import("./pages/blog/llms-txt-protocol-ai-context"));
const AIGovernanceNamespace = lazy(() => import("./pages/blog/ai-governance-namespace-unified-terminology"));

// Developer adoption blog posts
const RAGWithoutInfrastructure = lazy(() => import("./pages/blog/RAGWithoutInfrastructure"));
const AgentMemoryAntiPatterns = lazy(() => import("./pages/blog/AgentMemoryAntiPatterns"));
const LangChainMemoryIntegration = lazy(() => import("./pages/blog/LangChainMemoryIntegration"));
const WhyAgentsForget = lazy(() => import("./pages/blog/WhyAgentsForget"));
const BuildingAgentsThatLearn = lazy(() => import("./pages/blog/BuildingAgentsThatLearn"));

// Blog posts
const MachineProtocolStandards = lazy(() => import("./pages/blog/MachineProtocolStandards"));
const SpartaEpochRebuild = lazy(() => import("./pages/blog/SpartaEpochRebuild"));
const AutonomousAIGovernance = lazy(() => import("./pages/blog/AutonomousAIGovernance"));
const AdversarialAIDefense = lazy(() => import("./pages/blog/AdversarialAIDefense"));
const ClocklessAccountSetupGuide = lazy(() => import("./pages/blog/ClocklessAccountSetupGuide"));
const ClocklessWhatMakesItDifferent = lazy(() => import("./pages/blog/ClocklessWhatMakesItDifferent"));
const ClocklessModulesDeepDive = lazy(() => import("./pages/blog/ClocklessModulesDeepDive"));

// Dynamic AutoBlog post page
const AutoBlogPost = lazy(() => import("./pages/blog/AutoBlogPost"));

// Lazy conversion + SEO components (Item #4, #6, #14)
const ConversionTracker = lazy(() => import("@/components/conversion/ConversionTracker").then(m => ({ default: m.ConversionTracker })));
const LeadCaptureCTA = lazy(() => import("@/components/conversion/LeadCaptureCTA").then(m => ({ default: m.LeadCaptureCTA })));
const ExitIntentCapture = lazy(() => import("@/components/conversion/ExitIntentCapture").then(m => ({ default: m.ExitIntentCapture })));
const DesktopCommandPalette = lazy(() => import("@/components/navigation/DesktopCommandPalette").then(m => ({ default: m.DesktopCommandPalette })));
const ThemeToggle = lazy(() => import("@/components/theme/ThemeToggle").then(m => ({ default: m.ThemeToggle })));
const KeyboardShortcutsHelp = lazy(() => import("@/components/navigation/KeyboardShortcutsHelp").then(m => ({ default: m.KeyboardShortcutsHelp })));
const RateLimitFeedback = lazy(() => import("@/components/ui/RateLimitFeedback").then(m => ({ default: m.RateLimitFeedback })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

// Note: Route protection is handled by AuthProvider and individual page-level auth checks

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

  // Default: Safe Mode in embedded mobile preview.
  // Override with ?previewFull=1
  const mobilePreviewSafeMode =
    (previewParams.previewSafe || (isPreviewEnv && isMobileDevice)) && !previewParams.previewFull;

  // Always allow substrate init — no gates, all systems operational
  const substrateAutoInit = true;

  // Global safety net for unhandled promise rejections (prevents white-screen crashes)
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("[App] Unhandled rejection:", event.reason);
      event.preventDefault(); // Prevent crash
    };
    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  // Install mobile watchdog + interaction tracking once on mount (dynamic imports)
  const cleanupRef = useRef<(() => void)[]>([]);
  useEffect(() => {
    loadDeferredCSS();

    // Dynamic import all non-critical utilities
    Promise.all([
      import("@/lib/client/mobile-watchdog"),
      import("@/lib/ui/lastInteraction"),
      import("@/lib/defense/site-guard"),
      import("@/lib/analytics/site-tracker"),
      import("@/lib/client/diag"),
      import("@/lib/telemetry/error-telemetry"),
    ]).then(([watchdog, tracking, guard, analytics, diag, telemetry]) => {
      const c1 = watchdog.installMobileWatchdog();
      const c2 = tracking.installLastInteractionTracking();
      const c3 = guard.installSiteGuard();
      analytics.initSiteAnalytics();
      telemetry.installGlobalErrorHandler();
      cleanupRef.current = [c1, c2, c3].filter(Boolean) as (() => void)[];

      if (diag.diagEnabled()) {
        diag.diagLog("log", "App mounted", {
          timestamp: new Date().toISOString(),
          url: window.location.href.slice(0, 100),
        });
      }
    });

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
  // to prevent storage-dependent providers from looping on clear
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
                  <DecodeFloat />
                   <BrowserRouter>
                   <a href="#main-content" data-skip-nav className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none">
                     Skip to content
                   </a>
                   <ScrollToTop />
                  <Routes>
                    <Route path="/*" element={
                     <AuthProvider>
                      <Suspense fallback={null}>
                        <RegisterPasskeyPrompt />
                      </Suspense>
                       <Suspense fallback={<PageLoader />}>
                        <main id="main-content">
                        <Routes>
                          {/* Core Public Pages */}
                          <Route path="/" element={<DomainAwareHome />} />
                        <Route path="/decode" element={<Navigate to="/" replace />} />
                        <Route path="/feed-dream-eater" element={<FeedDreamEater />} />
                        <Route path="/dream-eater/archaeology" element={<DreamArchaeology />} />
                        <Route path="/dream-eater/artifacts" element={<DreamArtifacts />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/investors" element={<InvestorsPublic />} />
                        <Route path="/substrate" element={<SubstrateDashboard />} />
                        <Route path="/os" element={<SubstrateOS />} />
                        <Route path="/demo" element={<SubstrateDemo />} />
                        <Route path="/proof" element={<ProofMode />} />
                        <Route path="/showcase" element={<STierDemos />} />
                        <Route path="/publication" element={<Publication />} />
                        <Route path="/documentation" element={<Documentation />} />
                        <Route path="/intent-mesh" element={<PhaseGateRoute><IntentMeshPublic /></PhaseGateRoute>} />
                        <Route path="/changelog" element={<Changelog />} />
                        <Route path="/codelab" element={<CodeLab />} />
                        <Route path="/templates" element={<Navigate to="/upgrade" replace />} />
                        <Route path="/forge" element={<Navigate to="/" replace />} />
                        <Route path="/forge/catalog" element={<Navigate to="/" replace />} />
                        <Route path="/agency" element={<Navigate to="/" replace />} />
                        <Route path="/a/:slug" element={<AgencyPortal />} />
                        <Route path="/devtools" element={<DevTools />} />
                        <Route path="/academy" element={<DeveloperAcademy />} />
                        <Route path="/audit" element={<Navigate to="/" replace />} />
                        <Route path="/gaming" element={<GamingSubstrate />} />
                        <Route path="/developers" element={<DeveloperShowcase />} />
                        <Route path="/use-cases" element={<UseCases />} />
                        <Route path="/marketplace" element={<Navigate to="/upgrade" replace />} />
                        <Route path="/marketplace/success" element={<PhaseGateRoute><MarketplaceSuccess /></PhaseGateRoute>} />
                        <Route path="/engine-marketplace" element={<Navigate to="/upgrade" replace />} />
                        <Route path="/intelligence" element={<Navigate to="/upgrade" replace />} />
                        <Route path="/substrate/licensing" element={<Navigate to="/licensing" replace />} />
                        <Route path="/licensing" element={<PhaseGateRoute><PackGate packId="pack-self-hosted"><SubstrateLicensingDownload /></PackGate></PhaseGateRoute>} />
                        <Route path="/substrate/licensing/success" element={<PhaseGateRoute><SubstrateLicensingSuccess /></PhaseGateRoute>} />
                        <Route path="/lab" element={<PhaseGateRoute><PackGate packId="pack-deep-research"><ExperimentationLab /></PackGate></PhaseGateRoute>} />
                        <Route path="/clockless-world-engine" element={<PhaseGateRoute><ClocklessWorldEngine /></PhaseGateRoute>} />
                        <Route path="/docs/substrate/capabilities" element={<SubstrateCapabilitiesDocs />} />
                        <Route path="/docs/persistent-memory" element={<PersistentMemoryDocs />} />
                        <Route path="/docs/runtime" element={<RuntimeReference />} />
                        <Route path="/docs/manifest" element={<CapabilityManifest />} />
                        <Route path="/runtime" element={<RuntimePage />} />
                        <Route path="/capability-map" element={<CapabilityMap />} />
                        <Route path="/persistent-memory" element={<PersistentMemoryLanding />} />
                        <Route path="/capabilities" element={<Navigate to="/upgrade" replace />} />
                        <Route path="/synergies" element={<Navigate to="/upgrade" replace />} />
                        <Route path="/store" element={<Navigate to="/upgrade" replace />} />
                        <Route path="/artifacts" element={<Navigate to="/upgrade" replace />} />
                        <Route path="/engines" element={<Navigate to="/upgrade" replace />} />
                        <Route path="/system-feed" element={<PhaseGateRoute><PackGate packId="pack-observability"><SystemIntelligenceFeed /></PackGate></PhaseGateRoute>} />
                         
                         {/* Scan result share page — Item #3 */}
                         <Route path="/scan/results/:id" element={<ScanResult />} />
                         
                         <Route path="/status" element={<Status />} />
                        <Route path="/system-integrity" element={<PhaseGateRoute><SystemIntegrity /></PhaseGateRoute>} />
                        <Route path="/checkout/redirect" element={<CheckoutRedirect />} />
                        <Route path="/composable-cognitives" element={<ComposableCognitives />} />
                        <Route path="/composable-cognitives/success" element={<CognitivesSuccess />} />
                        <Route path="/composable-cognitives/download" element={<CognitivesDownload />} />
                        <Route path="/admin/cognitive-uploads" element={<AdminCognitiveUploads />} />

                        {/* Marketing / Info */}
                        <Route path="/about" element={<About />} />
                        <Route path="/solutions" element={<Solutions />} />
                        <Route path="/projects" element={<CurrentProjects />} />
                        <Route path="/roadmap" element={<Roadmap />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/llms-txt" element={<LlmsTxt />} />
                        <Route path="/humans-txt" element={<HumansTxt />} />
                        <Route path="/foundations" element={<Foundations />} />
                        <Route path="/namespace" element={<Namespace />} />
                        <Route path="/insights" element={<Insights />} />
                        <Route path="/register" element={<Navigate to="/auth" replace />} />
                        <Route path="/library" element={<Library />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/explore" element={<Navigate to="/" replace />} />
                        <Route path="/promptfluid" element={<PromptFluidHome />} />
                        
                        {/* Module pages (de-shrouded SEO) */}
                        <Route path="/modules" element={<ModulesHub />} />
                        <Route path="/modules/:slug" element={<ModuleDetail />} />
                        <Route path="/ai-operating-system" element={<AIOperatingSystem />} />
                        <Route path="/products/encode" element={<Navigate to="/" replace />} />
                        
                        {/* Cluster pages - module deep-dives */}
                        <Route path="/cluster/studio-autonomous-site-generator" element={<Navigate to="/" replace />} />
                        <Route path="/cluster/verify-worlds-first-ai-plugin-certification" element={<Navigate to="/" replace />} />
                        <Route path="/cluster/inclusive-module-accessibility" element={<Navigate to="/" replace />} />
                        <Route path="/cluster/clarity-ai-accessibility-and-autofix" element={<Navigate to="/" replace />} />
                        
                        {/* Auth & Legal */}
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                        
                        {/* Blog Posts */}
                        <Route path="/blog/wordpress-bot-defense" element={<WordPressBotDefense />} />
                        <Route path="/blog/top-security-plugins-2025" element={<TopSecurityPlugins2025 />} />
                        <Route path="/blog/ai-cybersecurity-evolution-2025" element={<AICybersecurityEvolution2025 />} />
                        <Route path="/blog/ai-hackers-underground-2025" element={<AIHackersUnderground2025 />} />
                        <Route path="/blog/ai-product-comparison-2025" element={<AIProductComparison2025 />} />
                        <Route path="/blog/inclusive-module-accessibility-mission" element={<InclusiveModuleMission />} />
                        <Route path="/blog/clarity-accessibility-mission" element={<Navigate to="/blog/inclusive-module-accessibility-mission" replace />} />
                        <Route path="/blog/promptfluid-market-disruptor" element={<PromptFluidMarketDisruptor />} />
                        <Route path="/blog/product-roadmap-2025" element={<ProductRoadmap2025 />} />
                        <Route path="/blog/ai-automation-trends-2025" element={<AIAutomationTrends2025 />} />
                        <Route path="/blog/ai-business-operations-2025" element={<AIBusinessOperations2025 />} />
                        <Route path="/blog/how-promptfluid-works-cascade-ai-ecosystem" element={<HowPromptFluidWorks />} />
                        <Route path="/blog/cascade-ai-adaptive-intelligence-brain" element={<CascadeAIDeepDive />} />
                        <Route path="/blog/promptfluid-studio-build-apps-that-think" element={<PromptFluidStudioGuide />} />
                        <Route path="/blog/ai-triad-intelligent-routing" element={<AITriadExplained />} />
                        <Route path="/blog/promptfluid-brain-adaptive-learning-core" element={<PromptFluidBrain />} />
                        <Route path="/blog/promptfluid-vision-unified-dashboard" element={<PromptFluidVision />} />
                        <Route path="/blog/promptfluid-defense-ai-security" element={<PromptFluidDefense />} />
                        <Route path="/blog/promptfluid-ripple-network-integration" element={<PromptFluidRipple />} />
                        <Route path="/blog/promptfluid-access-identity-billing" element={<PromptFluidAccess />} />
                        <Route path="/blog/promptfluid-nexus-api-gateway" element={<PromptFluidNexus />} />
                        <Route path="/blog/ai-systems-that-dream-press-release" element={<AISystemsThatDreamPressRelease />} />
                        <Route path="/blog/promptfluid-first-ai-dreaming-systems" element={<AISystemsThatDreamPressRelease />} />
                        <Route path="/blog/accessibility-free-for-all" element={<AccessibilityFreeForAll />} />
                        <Route path="/blog/wordpress-accessibility-guide" element={<WordPressAccessibilityGuide />} />
                        <Route path="/blog/wcag-2-2-wordpress-changes" element={<WCAG22Changes />} />
                        <Route path="/blog/automated-accessibility-fixes-wordpress" element={<AIAccessibilityFixes />} />
                        
                        {/* CMPSBL-branded blog redirects (new canonical URLs) */}
                        <Route path="/blog/cmpsbl-defense-ai-security" element={<PromptFluidDefense />} />
                        <Route path="/blog/cmpsbl-brain-adaptive-learning-core" element={<PromptFluidBrain />} />
                        <Route path="/blog/cmpsbl-vision-unified-dashboard" element={<PromptFluidVision />} />
                        <Route path="/blog/cmpsbl-ripple-network-integration" element={<PromptFluidRipple />} />
                        <Route path="/blog/cmpsbl-access-identity-billing" element={<PromptFluidAccess />} />
                        <Route path="/blog/cmpsbl-nexus-api-gateway" element={<PromptFluidNexus />} />
                        <Route path="/blog/cmpsbl-studio-build-apps-that-think" element={<PromptFluidStudioGuide />} />
                        <Route path="/blog/how-cmpsbl-works-substrate-ecosystem" element={<HowPromptFluidWorks />} />
                        
                        {/* v6.x.x Pillar/Cluster Posts */}
                        <Route path="/blog/evolving-software-v6-breakthrough" element={<EvolvingSoftwareV6Breakthrough />} />
                        <Route path="/blog/llms-txt-protocol-ai-context" element={<LLMsTxtProtocol />} />
                        <Route path="/blog/ai-governance-namespace-unified-terminology" element={<AIGovernanceNamespace />} />
                        
                        {/* Developer Adoption Posts */}
                        <Route path="/blog/rag-without-infrastructure" element={<RAGWithoutInfrastructure />} />
                        <Route path="/blog/agent-memory-anti-patterns" element={<AgentMemoryAntiPatterns />} />
                        <Route path="/blog/langchain-memory-integration" element={<LangChainMemoryIntegration />} />
                        <Route path="/blog/why-agents-forget" element={<WhyAgentsForget />} />
                        <Route path="/blog/building-agents-that-learn" element={<BuildingAgentsThatLearn />} />
                        
                        {/* Blog Posts */}
                        <Route path="/blog/machine-protocol-standards-architect-epoch" element={<MachineProtocolStandards />} />
                        <Route path="/blog/autonomous-ai-governance-runtime-enforcement" element={<AutonomousAIGovernance />} />
                        <Route path="/blog/adversarial-ai-defense-module-response-2026" element={<AdversarialAIDefense />} />
                        
                        {/* Additional Posts */}
                        <Route path="/blog/sparta-epoch-rebuild-from-scratch" element={<SpartaEpochRebuild />} />
                        
                        {/* Legacy v9 slug redirects */}
                        <Route path="/blog/machine-protocol-standards-v9" element={<Navigate to="/blog/machine-protocol-standards-architect-epoch" replace />} />
                        <Route path="/blog/autonomous-ai-governance-v9" element={<Navigate to="/blog/autonomous-ai-governance-runtime-enforcement" replace />} />
                        <Route path="/blog/adversarial-ai-defense-v9" element={<Navigate to="/blog/adversarial-ai-defense-module-response-2026" replace />} />
                        
                        {/* Clockless Pillar/Cluster Posts */}
                        <Route path="/blog/clockless-account-setup-artifact-packs" element={<ClocklessAccountSetupGuide />} />
                        <Route path="/blog/clockless-what-makes-it-different" element={<ClocklessWhatMakesItDifferent />} />
                        <Route path="/blog/clockless-modules-deep-dive" element={<ClocklessModulesDeepDive />} />
                        
                        {/* Dynamic AutoBlog Posts */}
                        <Route path="/blog/auto/:slug" element={<AutoBlogPost />} />
                        
                        {/* Dynamic blog catch-all — serves static blog posts by slug */}
                        <Route path="/blog/:slug" element={<AutoBlogPost />} />
                        
                        {/* ===== ORPHANED PAGE REDIRECTS ===== */}
                        {/* These pages exist but are not accessible via nav/footer/CTAs */}
                        {/* Redirecting to home to prevent outdated content access */}
                        
                        {/* Admin routes — Governor-only */}
                        <Route path="/admin/patches" element={<AdminRoute><AdminPatches /></AdminRoute>} />
                        <Route path="/admin/shadow-mesh" element={<AdminRoute><ShadowMeshPage /></AdminRoute>} />
                        <Route path="/admin/immunity-mesh" element={<AdminRoute><ImmunityMeshDashboard /></AdminRoute>} />
                        <Route path="/admin/owner-reports" element={<AdminRoute><OwnerReports /></AdminRoute>} />
                        <Route path="/admin/evolution" element={<AdminRoute><EvolutionMeshDashboard /></AdminRoute>} />
                        <Route path="/admin/governance" element={<AdminRoute><GovernanceControlPlane /></AdminRoute>} />
                        <Route path="/admin/quarry" element={<AdminRoute><QuarryDashboard /></AdminRoute>} />
                        <Route path="/admin/intel" element={<AdminRoute><IntelPanel /></AdminRoute>} />
                        <Route path="/quarry" element={<Navigate to="/admin/quarry" replace />} />
                        <Route path="/admin/*" element={<Navigate to="/" replace />} />
                        <Route path="/dashboard" element={<Navigate to="/" replace />} />
                        <Route path="/evolution-mesh" element={<PhaseGateRoute><EvolutionMeshLanding /></PhaseGateRoute>} />
                        <Route path="/architecture" element={<Architecture />} />
                        
                        {/* Legacy brain/cascade routes — consolidated wildcards */}
                        <Route path="/brain" element={<Navigate to="/decode" replace />} />
                        <Route path="/brain/*" element={<Navigate to="/" replace />} />
                        <Route path="/cascade" element={<Navigate to="/decode" replace />} />
                        <Route path="/cascade-*" element={<Navigate to="/" replace />} />
                        
                        {/* Clarity routes — consolidated wildcard */}
                        <Route path="/clarity" element={<Navigate to="/" replace />} />
                        <Route path="/clarity/*" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-*" element={<Navigate to="/" replace />} />
                        
                        {/* Defense routes — consolidated wildcard */}
                        <Route path="/defense" element={<Navigate to="/" replace />} />
                        <Route path="/defense/*" element={<Navigate to="/" replace />} />
                        <Route path="/defense-*" element={<Navigate to="/" replace />} />
                        
                        {/* Ripple routes — consolidated wildcard */}
                        <Route path="/ripple/*" element={<Navigate to="/" replace />} />
                        <Route path="/ripple-*" element={<Navigate to="/" replace />} />
                        
                        {/* Legacy/unused pages */}
                        <Route path="/index" element={<Navigate to="/" replace />} />
                        <Route path="/pricing" element={<Upgrade />} />
                        <Route path="/upgrade" element={<Upgrade />} />
                        <Route path="/packs" element={<Packs />} />
                        <Route path="/start-here" element={<StartHere />} />
                        <Route path="/checkout" element={<Navigate to="/" replace />} />
                        <Route path="/enterprise" element={<Enterprise />} />
                        <Route path="/api-access" element={<ApiAccess />} />
                        <Route path="/careers" element={<Careers />} />
                        <Route path="/sandbox" element={<Navigate to="/" replace />} />
                        <Route path="/system" element={<Navigate to="/" replace />} />
                        <Route path="/system-*" element={<Navigate to="/" replace />} />
                        <Route path="/studio" element={<Navigate to="/" replace />} />
                        <Route path="/studio/*" element={<Navigate to="/" replace />} />
                        <Route path="/modernizer" element={<Navigate to="/" replace />} />
                        <Route path="/demo-admin" element={<Navigate to="/" replace />} />
                        <Route path="/demo-admin/*" element={<Navigate to="/" replace />} />
                        <Route path="/resources/*" element={<Navigate to="/" replace />} />
                        <Route path="/solutions/*" element={<Navigate to="/solutions" replace />} />
                        
                        {/* Diligence Harness */}
                        <Route path="/diligence" element={<AdminRoute><Diligence /></AdminRoute>} />

                        {/* 404 - catch all remaining */}
                        <Route path="*" element={<NotFound />} />
                       </Routes>
                        </main>
                         <Suspense fallback={null}>
                           <ConversionTracker />
                         </Suspense>
                          {/* ExitIntentCapture disabled — full-screen overlay was blocking page content */}
                          {/* <Suspense fallback={null}><ExitIntentCapture /></Suspense> */}
                          <Suspense fallback={null}>
                            <MobileBottomNav />
                          </Suspense>
                          <Suspense fallback={null}>
                            <BackToTop />
                          </Suspense>
                          {/* OnboardingWrapper disabled — full-screen overlay was blocking page content */}
                          {/* <Suspense fallback={null}><OnboardingWrapper /></Suspense> */}
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
