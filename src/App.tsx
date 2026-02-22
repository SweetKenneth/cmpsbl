/**
 * CMPSBL® — Cognitive Orchestration Substrate
 * v10.5.4 ARCHITECT Epoch — Streamlined Application Entry
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense, useState } from "react";
import { SEOProvider } from "@/contexts/SEOContext";
import { debugMode } from "@/lib/debug-mode";

// Lazy-load non-critical UI components to reduce initial JS
const MotionConfigWrapper = lazy(() => import("framer-motion").then(m => ({ default: m.MotionConfig })));
const SmartToastRenderer = lazy(() => import("@/components/toast/SmartToastRenderer"));
const SonnerToaster = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
const DecodeFloat = lazy(() => import("@/components/decode/DecodeFloat"));
import { installLastInteractionTracking } from "@/lib/ui/lastInteraction";
import { installSiteGuard } from "@/lib/defense/site-guard";
import { isEditorPreviewEnv } from "@/lib/system/isLovableEditorPreviewEnv";

// Mobile crash diagnostics (opt-in via ?diag=1)
import { installMobileWatchdog } from "@/lib/client/mobile-watchdog";
import { useRenderLoopDetector } from "@/lib/client/render-loop-detector";
import { diagLog, diagEnabled } from "@/lib/client/diag";
import { DiagPanel } from "@/components/system/DiagPanel";
import { DiagErrorBoundary } from "@/components/system/DiagErrorBoundary";
import { MobilePreviewSafeMode } from "@/components/system/MobilePreviewSafeMode";

const SubstrateProvider = lazy(() => import("./components/substrate/SubstrateProvider").then(m => ({ default: m.SubstrateProvider })));
const AuthProvider = lazy(() => import("@/contexts/AuthContext").then(m => ({ default: m.AuthProvider })));
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

// Minimal fallback - no visible loader, just background
const PageLoader = () => (
  <div className="min-h-screen bg-background" />
);

// Core pages - only Explore eager loaded for LCP, rest lazy
import Explore from "./pages/Explore";
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
const Audit = lazy(() => import("./pages/Audit"));
const GamingSubstrate = lazy(() => import("./pages/GamingSubstrate"));
const DeveloperShowcase = lazy(() => import("./pages/DeveloperShowcase"));
const UseCases = lazy(() => import("./pages/UseCases"));
const AgencyPortal = lazy(() => import("./pages/AgencyPortal"));

const Marketplace = lazy(() => import("./pages/Marketplace"));
const MarketplaceSuccess = lazy(() => import("./pages/MarketplaceSuccess"));
const SubstrateIntelligence = lazy(() => import("./pages/SubstrateIntelligence"));
const SubstrateLicensing = lazy(() => import("./pages/SubstrateLicensing"));
const SubstrateLicensingSuccess = lazy(() => import("./pages/SubstrateLicensingSuccess"));
const SubstrateLicensingDownload = lazy(() => import("./pages/SubstrateLicensingDownload"));
const ExperimentationLab = lazy(() => import("./pages/ExperimentationLab"));
const ClocklessWorldEngine = lazy(() => import("./pages/ClocklessWorldEngine"));
const SubstrateCapabilitiesDocs = lazy(() => import("./pages/SubstrateCapabilitiesDocs"));
const CapabilitiesDepot = lazy(() => import("./pages/CapabilitiesDepot"));
const SynergyPipelines = lazy(() => import("./pages/SynergyPipelines"));
const SubstrateStore = lazy(() => import("./pages/SubstrateStore"));
const SystemIntelligenceFeed = lazy(() => import("./pages/SystemIntelligenceFeed"));
const ClearCache = lazy(() => import("./pages/ClearCache"));
const CheckoutRedirect = lazy(() => import("./pages/CheckoutRedirect"));
const EngineMarketplace = lazy(() => import("./pages/EngineMarketplace"));
const PersistentMemoryDocs = lazy(() => import("./pages/docs/PersistentMemoryDocs"));
const PersistentMemoryLanding = lazy(() => import("./pages/PersistentMemoryLanding"));
const AdminPatches = lazy(() => import("./pages/AdminPatches"));
const ShadowMeshPage = lazy(() => import("./pages/admin/ShadowMeshPage"));
const StartHere = lazy(() => import("./pages/StartHere"));
const ComposableCognitives = lazy(() => import("./pages/ComposableCognitives"));
const CognitivesSuccess = lazy(() => import("./pages/CognitivesSuccess"));
const CognitivesDownload = lazy(() => import("./pages/CognitivesDownload"));
const AdminCognitiveUploads = lazy(() => import("./pages/AdminCognitiveUploads"));
const STierDemos = lazy(() => import("./pages/STierDemos"));
const OwnerReports = lazy(() => import("./pages/admin/OwnerReports"));
const Habitat = lazy(() => import("./pages/Habitat"));
const Status = lazy(() => import("./pages/Status"));
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

// ARCHITECT Epoch blog posts
const MachineProtocolStandards = lazy(() => import("./pages/blog/MachineProtocolStandards"));
const AutonomousAIGovernance = lazy(() => import("./pages/blog/AutonomousAIGovernance"));
const AdversarialAIDefense = lazy(() => import("./pages/blog/AdversarialAIDefense"));

// Dynamic AutoBlog post page
const AutoBlogPost = lazy(() => import("./pages/blog/AutoBlogPost"));

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

  // Install mobile watchdog + interaction tracking once on mount
  useEffect(() => {
    const cleanup = installMobileWatchdog();
    const cleanupTracking = installLastInteractionTracking();
    const cleanupSiteGuard = installSiteGuard();

    if (diagEnabled()) {
      diagLog("log", "App mounted", {
        timestamp: new Date().toISOString(),
        url: window.location.href.slice(0, 100),
      });
    }

    return () => {
      cleanup?.();
      cleanupTracking?.();
      cleanupSiteGuard?.();
    };
  }, []);

  // Force debug mode OFF on startup — all systems should run normally
  // Debug mode is only user-controlled via terminal/console after this
  useEffect(() => {
    if (mobilePreviewSafeMode) {
      // Even in safe mode, don't enable debug — just reduce rendering
    } else if (debugMode.isEnabled()) {
      debugMode.disable();
    }
    // Clear any persisted debug state on every mount
    if (debugMode.isEnabled() && !mobilePreviewSafeMode) {
      debugMode.disable();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track render rate of the App root (diag mode only)
  useRenderLoopDetector("App");

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
                  <ScrollToTop />
                  <Routes>
                    <Route path="/*" element={
                     <AuthProvider>
                      <Suspense fallback={null}>
                        <RegisterPasskeyPrompt />
                      </Suspense>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          {/* Core Public Pages */}
                          <Route path="/" element={<Explore />} />
                        <Route path="/decode" element={<Decode />} />
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
                        <Route path="/intent-mesh" element={<IntentMeshPublic />} />
                        <Route path="/changelog" element={<Changelog />} />
                        <Route path="/codelab" element={<CodeLab />} />
                        <Route path="/forge" element={<Navigate to="/" replace />} />
                        <Route path="/forge/catalog" element={<ForgeCatalog />} />
                        <Route path="/agency" element={<Navigate to="/" replace />} />
                        <Route path="/a/:slug" element={<AgencyPortal />} />
                        <Route path="/devtools" element={<DevTools />} />
                        <Route path="/academy" element={<DeveloperAcademy />} />
                        <Route path="/audit" element={<Audit />} />
                        <Route path="/gaming" element={<GamingSubstrate />} />
                        <Route path="/developers" element={<DeveloperShowcase />} />
                        <Route path="/use-cases" element={<UseCases />} />
                        <Route path="/marketplace" element={<SubstrateStore />} />
                        <Route path="/marketplace/success" element={<MarketplaceSuccess />} />
                        <Route path="/intelligence" element={<SubstrateIntelligence />} />
                        <Route path="/substrate/licensing" element={<Navigate to="/licensing" replace />} />
                        <Route path="/licensing" element={<SubstrateLicensingDownload />} />
                        <Route path="/substrate/licensing/success" element={<SubstrateLicensingSuccess />} />
                        <Route path="/lab" element={<ExperimentationLab />} />
                        <Route path="/clockless-world-engine" element={<ClocklessWorldEngine />} />
                        <Route path="/docs/substrate/capabilities" element={<SubstrateCapabilitiesDocs />} />
                        <Route path="/docs/persistent-memory" element={<PersistentMemoryDocs />} />
                        <Route path="/persistent-memory" element={<PersistentMemoryLanding />} />
                        <Route path="/capabilities" element={<SubstrateStore />} />
                        <Route path="/synergies" element={<SubstrateStore />} />
                        <Route path="/store" element={<SubstrateStore />} />
                        <Route path="/artifacts" element={<SubstrateStore />} />
                        <Route path="/engines" element={<EngineMarketplace />} />
                        <Route path="/system-feed" element={<SystemIntelligenceFeed />} />
                        <Route path="/habitat" element={<Habitat />} />
                        <Route path="/status" element={<Status />} />
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
                        <Route path="/register" element={<Register />} />
                        <Route path="/library" element={<Library />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/promptfluid" element={<PromptFluidHome />} />
                        
                        {/* Module pages (de-shrouded SEO) */}
                        <Route path="/modules" element={<ModulesHub />} />
                        <Route path="/modules/:slug" element={<ModuleDetail />} />
                        <Route path="/ai-operating-system" element={<AIOperatingSystem />} />
                        <Route path="/products/encode" element={<EncodeInfo />} />
                        
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
                        
                        {/* ARCHITECT Epoch Posts */}
                        <Route path="/blog/machine-protocol-standards-architect-epoch" element={<MachineProtocolStandards />} />
                        <Route path="/blog/autonomous-ai-governance-runtime-enforcement" element={<AutonomousAIGovernance />} />
                        <Route path="/blog/adversarial-ai-defense-module-response-2026" element={<AdversarialAIDefense />} />
                        {/* Legacy v9 slug redirects */}
                        <Route path="/blog/machine-protocol-standards-v9" element={<Navigate to="/blog/machine-protocol-standards-architect-epoch" replace />} />
                        <Route path="/blog/autonomous-ai-governance-v9" element={<Navigate to="/blog/autonomous-ai-governance-runtime-enforcement" replace />} />
                        <Route path="/blog/adversarial-ai-defense-v9" element={<Navigate to="/blog/adversarial-ai-defense-module-response-2026" replace />} />
                        
                        {/* Dynamic AutoBlog Posts */}
                        <Route path="/blog/auto/:slug" element={<AutoBlogPost />} />
                        
                        {/* ===== ORPHANED PAGE REDIRECTS ===== */}
                        {/* These pages exist but are not accessible via nav/footer/CTAs */}
                        {/* Redirecting to home to prevent outdated content access */}
                        
                        {/* Admin routes */}
                        <Route path="/admin/patches" element={<AdminPatches />} />
                        <Route path="/admin/shadow-mesh" element={<ShadowMeshPage />} />
                        <Route path="/admin/owner-reports" element={<OwnerReports />} />
                        <Route path="/admin/*" element={<Navigate to="/" replace />} />
                        <Route path="/dashboard" element={<Navigate to="/" replace />} />
                        
                        {/* Legacy brain/cascade routes */}
                        <Route path="/brain" element={<Navigate to="/decode" replace />} />
                        <Route path="/brain/*" element={<Navigate to="/decode" replace />} />
                        <Route path="/brain-hub" element={<Navigate to="/" replace />} />
                        <Route path="/brain-analytics" element={<Navigate to="/" replace />} />
                        <Route path="/brain-learning" element={<Navigate to="/" replace />} />
                        <Route path="/brain-ml" element={<Navigate to="/" replace />} />
                        <Route path="/brain-training" element={<Navigate to="/" replace />} />
                        <Route path="/brain-control" element={<Navigate to="/" replace />} />
                        <Route path="/cascade" element={<Navigate to="/decode" replace />} />
                        <Route path="/cascade-mindmap" element={<Navigate to="/" replace />} />
                        
                        {/* Clarity routes - deprecated product */}
                        <Route path="/clarity" element={<Navigate to="/" replace />} />
                        <Route path="/clarity/*" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-dashboard" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-add-site" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-admin" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-api-keys" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-certifications" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-clients" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-fix-review" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-fix-schedule" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-remediation" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-scan-history" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-settings" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-tickets" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-violation" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-learn" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-scan-detail" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-subscriptions" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-pricing" element={<Navigate to="/" replace />} />
                        <Route path="/clarity-checkout" element={<Navigate to="/" replace />} />
                        
                        {/* Defense routes - deprecated */}
                        <Route path="/defense" element={<Navigate to="/" replace />} />
                        <Route path="/defense/*" element={<Navigate to="/" replace />} />
                        <Route path="/defense-dashboard" element={<Navigate to="/" replace />} />
                        <Route path="/defense-add-site" element={<Navigate to="/" replace />} />
                        <Route path="/defense-admin" element={<Navigate to="/" replace />} />
                        <Route path="/defense-api-keys" element={<Navigate to="/" replace />} />
                        <Route path="/defense-audit" element={<Navigate to="/" replace />} />
                        <Route path="/defense-clients" element={<Navigate to="/" replace />} />
                        <Route path="/defense-events" element={<Navigate to="/" replace />} />
                        <Route path="/defense-firewall" element={<Navigate to="/" replace />} />
                        <Route path="/defense-policies" element={<Navigate to="/" replace />} />
                        <Route path="/defense-settings" element={<Navigate to="/" replace />} />
                        <Route path="/defense-sites" element={<Navigate to="/" replace />} />
                        <Route path="/defense-threats" element={<Navigate to="/" replace />} />
                        <Route path="/defense-tickets" element={<Navigate to="/" replace />} />
                        <Route path="/defense-pricing" element={<Navigate to="/" replace />} />
                        <Route path="/defense-checkout" element={<Navigate to="/" replace />} />
                        
                        {/* Ripple routes - deprecated */}
                        <Route path="/ripple/*" element={<Navigate to="/" replace />} />
                        <Route path="/ripple-settings" element={<Navigate to="/" replace />} />
                        <Route path="/ripple-api" element={<Navigate to="/" replace />} />
                        
                        {/* Legacy/unused pages */}
                        <Route path="/index" element={<Navigate to="/" replace />} />
                        <Route path="/pricing" element={<SubstrateLicensing />} />
                        <Route path="/start-here" element={<StartHere />} />
                        <Route path="/checkout" element={<Navigate to="/" replace />} />
                        <Route path="/enterprise" element={<Navigate to="/" replace />} />
                        <Route path="/sandbox" element={<Navigate to="/" replace />} />
                        <Route path="/system" element={<Navigate to="/" replace />} />
                        <Route path="/system-map" element={<Navigate to="/" replace />} />
                        <Route path="/studio" element={<Navigate to="/" replace />} />
                        <Route path="/studio/*" element={<Navigate to="/" replace />} />
                        <Route path="/modernizer" element={<Navigate to="/" replace />} />
                        
                        {/* Demo/test pages */}
                        <Route path="/demo-admin" element={<Navigate to="/" replace />} />
                        <Route path="/demo-admin/*" element={<Navigate to="/" replace />} />
                        
                        {/* Resources pages */}
                        <Route path="/resources/*" element={<Navigate to="/" replace />} />
                        <Route path="/solutions/*" element={<Navigate to="/solutions" replace />} />
                        
                        {/* 404 - catch all remaining */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
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
      <DiagPanel />
    </DiagErrorBoundary>
  );
};

export default App;
