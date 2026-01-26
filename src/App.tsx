/**
 * promptfluid® — Cognitive Orchestration Substrate
 * v2026.01 — Streamlined Application Entry
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense, useState } from "react";
import { SEOProvider } from "@/contexts/SEOContext";
import ToasterComponents from "@/components/app/ToasterComponents";

const SubstrateProvider = lazy(() => import("./components/substrate/SubstrateProvider").then(m => ({ default: m.SubstrateProvider })));
const AuthProvider = lazy(() => import("@/contexts/AuthContext").then(m => ({ default: m.AuthProvider })));
const TooltipProvider = lazy(() => import("@/components/ui/tooltip").then(m => ({ default: m.TooltipProvider })));

// Scroll to top on route change - immediate scroll for better UX
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Immediate scroll to top, no smooth behavior for page loads
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  
  return null;
};

// Minimal fallback - no visible loader, just background
const PageLoader = () => (
  <div className="min-h-screen bg-background" />
);

// Core pages - only Explore eager loaded for LCP, rest lazy
import Explore from "./pages/Explore";
import NotFound from "./pages/NotFound";

// Lazy load all other pages to reduce initial bundle
const Auth = lazy(() => import("./pages/Auth"));
const Decode = lazy(() => import("./pages/Decode"));
const FeedDreamEater = lazy(() => import("./pages/FeedDreamEater"));
const Blog = lazy(() => import("./pages/Blog"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const InvestorsPublic = lazy(() => import("./pages/InvestorsPublic"));
const SubstrateDashboard = lazy(() => import("./pages/SubstrateDashboard"));
const SubstrateOS = lazy(() => import("./pages/SubstrateOS"));
const SubstrateDemo = lazy(() => import("./pages/SubstrateDemo"));
const ProofMode = lazy(() => import("./pages/ProofMode"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Publication = lazy(() => import("./pages/Publication"));
const DevPortal = lazy(() => import("./pages/DevPortal"));
const Changelog = lazy(() => import("./pages/Changelog"));
// CodeLab removed - templates now in /marketplace only
const CognitiveForge = lazy(() => import("./pages/CognitiveForge"));
const ForgeCatalog = lazy(() => import("./pages/ForgeCatalog"));
const AgencyMint = lazy(() => import("./pages/AgencyMint"));
const DevTools = lazy(() => import("./pages/DevTools"));
const GamingSubstrate = lazy(() => import("./pages/GamingSubstrate"));
const DeveloperShowcase = lazy(() => import("./pages/DeveloperShowcase"));
const UseCases = lazy(() => import("./pages/UseCases"));
const AgencyPortal = lazy(() => import("./pages/AgencyPortal"));
const Modernizer = lazy(() => import("./pages/Modernizer"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const MarketplaceSuccess = lazy(() => import("./pages/MarketplaceSuccess"));

// Marketing / Info pages
const About = lazy(() => import("./pages/About"));
const Solutions = lazy(() => import("./pages/Solutions"));
const Contact = lazy(() => import("./pages/Contact"));
const CurrentProjects = lazy(() => import("./pages/CurrentProjects"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const LlmsTxt = lazy(() => import("./pages/LlmsTxt"));
const HumansTxt = lazy(() => import("./pages/HumansTxt"));
// Explore is now the homepage (eager loaded above)

// Lazy load blog posts
const WordPressBotDefense = lazy(() => import("./pages/blog/WordPressBotDefense"));
const TopSecurityPlugins2025 = lazy(() => import("./pages/blog/TopSecurityPlugins2025"));
const AICybersecurityEvolution2025 = lazy(() => import("./pages/blog/AICybersecurityEvolution2025"));
const AIHackersUnderground2025 = lazy(() => import("./pages/blog/AIHackersUnderground2025"));
const AIProductComparison2025 = lazy(() => import("./pages/blog/AIProductComparison2025"));
const PTCHBLMission = lazy(() => import("./pages/blog/ClarityMission"));
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

// Protected route helper - inline to avoid importing useAuth at top level
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Dynamically import useAuth only when needed
  const [auth, setAuth] = useState<{ user: any; loading: boolean } | null>(null);
  
  useEffect(() => {
    import("@/contexts/AuthContext").then(({ useAuth }) => {
      // This is a workaround - we need a component that can use the hook
    });
  }, []);
  
  // For protected routes, defer to the lazy-loaded Auth check inside AuthProvider
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SEOProvider>
        <Suspense fallback={<PageLoader />}>
          <SubstrateProvider autoInit={true}>
            <TooltipProvider>
              <ToasterComponents />
              <BrowserRouter>
                <ScrollToTop />
                <AuthProvider>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Core Public Pages */}
                      <Route path="/" element={<Explore />} />
                      <Route path="/decode" element={<Decode />} />
                      <Route path="/feed-dream-eater" element={<FeedDreamEater />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/investors" element={<InvestorsPublic />} />
                      <Route path="/substrate" element={<SubstrateDashboard />} />
                      <Route path="/os" element={<SubstrateOS />} />
                      <Route path="/demo" element={<SubstrateDemo />} />
                      <Route path="/proof" element={<ProofMode />} />
                      <Route path="/publication" element={<Publication />} />
                      <Route path="/documentation" element={<Documentation />} />
                      <Route path="/changelog" element={<Changelog />} />
                      <Route path="/codelab" element={<Navigate to="/marketplace" replace />} />
                      <Route path="/forge" element={<CognitiveForge />} />
                      <Route path="/forge/catalog" element={<ForgeCatalog />} />
                      <Route path="/agency" element={<AgencyMint />} />
                      <Route path="/a/:slug" element={<AgencyPortal />} />
                      <Route path="/devtools" element={<DevTools />} />
                      <Route path="/gaming" element={<GamingSubstrate />} />
                      <Route path="/developers" element={<DeveloperShowcase />} />
                      <Route path="/use-cases" element={<UseCases />} />
                      <Route path="/dev-portal" element={<DevPortal />} />
                      <Route path="/marketplace" element={<Marketplace />} />
                      <Route path="/marketplace/success" element={<MarketplaceSuccess />} />

                      {/* Marketing / Info */}
                      <Route path="/about" element={<About />} />
                      <Route path="/solutions" element={<Solutions />} />
                      <Route path="/projects" element={<CurrentProjects />} />
                      <Route path="/roadmap" element={<Roadmap />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/llms-txt" element={<LlmsTxt />} />
                      <Route path="/humans-txt" element={<HumansTxt />} />
                      <Route path="/explore" element={<Explore />} />
                      
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
                      <Route path="/blog/clarity-accessibility-mission" element={<PTCHBLMission />} />
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
                      
                      {/* ===== ORPHANED PAGE REDIRECTS ===== */}
                      {/* These pages exist but are not accessible via nav/footer/CTAs */}
                      {/* Redirecting to home to prevent outdated content access */}
                      
                      {/* Admin routes */}
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
                      <Route path="/clarity-download" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-extension" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-fix-suggestions" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-notification-settings" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-portfolio" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-reports" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-scan-details" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-scan-details/*" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-schedules" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-site-settings" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-site-settings/*" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-subscription" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-teams" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-trends" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-webhooks" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-whitelabel" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-widget" element={<Navigate to="/" replace />} />
                      
                      {/* BotSniper/RCKBL routes - deprecated product */}
                      <Route path="/bot-sniper" element={<Navigate to="/" replace />} />
                      <Route path="/bot-sniper/*" element={<Navigate to="/" replace />} />
                      <Route path="/bot-sniper-analytics" element={<Navigate to="/" replace />} />
                      <Route path="/bot-sniper-home" element={<Navigate to="/" replace />} />
                      <Route path="/bot-sniper-pricing" element={<Navigate to="/" replace />} />
                      <Route path="/bot-sniper-settings" element={<Navigate to="/" replace />} />
                      <Route path="/reflex-keys" element={<Navigate to="/" replace />} />
                      
                      {/* Decode sub-pages - not in current nav */}
                      <Route path="/decode-coder" element={<Navigate to="/decode" replace />} />
                      <Route path="/decode-control" element={<Navigate to="/decode" replace />} />
                      <Route path="/decode-dreams" element={<Navigate to="/decode" replace />} />
                      <Route path="/decode-governance" element={<Navigate to="/decode" replace />} />
                      <Route path="/decode-mindmap" element={<Navigate to="/decode" replace />} />
                      <Route path="/decode-status" element={<Navigate to="/decode" replace />} />
                      
                      {/* System/Admin pages */}
                      <Route path="/system" element={<Navigate to="/" replace />} />
                      <Route path="/system/*" element={<Navigate to="/" replace />} />
                      <Route path="/system-audit" element={<Navigate to="/" replace />} />
                      <Route path="/system-health" element={<Navigate to="/" replace />} />
                      <Route path="/system-initializer" element={<Navigate to="/" replace />} />
                      <Route path="/system-map" element={<Navigate to="/" replace />} />
                      <Route path="/system-verify" element={<Navigate to="/" replace />} />
                      <Route path="/audit" element={<Navigate to="/" replace />} />
                      <Route path="/analytics" element={<Navigate to="/" replace />} />
                      <Route path="/access-control" element={<Navigate to="/" replace />} />
                      
                      {/* Product info pages - cluster */}
                      <Route path="/cluster/*" element={<Navigate to="/" replace />} />
                      <Route path="/products/*" element={<Navigate to="/" replace />} />
                      <Route path="/pillars/*" element={<Navigate to="/" replace />} />
                      
                      {/* Business/Finance pages */}
                      <Route path="/billing" element={<Navigate to="/" replace />} />
                      <Route path="/subscriptions" element={<Navigate to="/" replace />} />
                      <Route path="/investor-packets" element={<Navigate to="/" replace />} />
                      <Route path="/partnerships" element={<Navigate to="/" replace />} />
                      
                      {/* Marketing/Creative pages */}
                      <Route path="/marketing" element={<Navigate to="/" replace />} />
                      <Route path="/marketing-studio" element={<Navigate to="/" replace />} />
                      <Route path="/creative-studio" element={<Navigate to="/" replace />} />
                      <Route path="/creative-generation" element={<Navigate to="/" replace />} />
                      <Route path="/prompt-merger" element={<Navigate to="/" replace />} />
                      
                      {/* Network/Infrastructure pages */}
                      <Route path="/ripple-network" element={<Navigate to="/" replace />} />
                      <Route path="/nexus-admin" element={<Navigate to="/" replace />} />
                      <Route path="/threat-feed" element={<Navigate to="/" replace />} />
                      
                      {/* Legacy product pages */}
                      <Route path="/modernizer" element={<Modernizer />} />
                      <Route path="/awake" element={<Navigate to="/" replace />} />
                      <Route path="/scan" element={<Navigate to="/" replace />} />
                      <Route path="/sentience-hub" element={<Navigate to="/" replace />} />
                      <Route path="/learning-intelligence" element={<Navigate to="/" replace />} />
                      
                      {/* Product-specific routes */}
                      <Route path="/access-product" element={<Navigate to="/" replace />} />
                      <Route path="/brain-product" element={<Navigate to="/" replace />} />
                      <Route path="/clarity-product" element={<Navigate to="/" replace />} />
                      <Route path="/defense-product" element={<Navigate to="/" replace />} />
                      <Route path="/ripple-product" element={<Navigate to="/" replace />} />
                      <Route path="/studio-product" element={<Navigate to="/" replace />} />
                      
                      {/* Resources pages */}
                      <Route path="/resources/*" element={<Navigate to="/" replace />} />
                      <Route path="/solutions/*" element={<Navigate to="/solutions" replace />} />
                      
                      {/* 404 - catch all remaining */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </AuthProvider>
              </BrowserRouter>
            </TooltipProvider>
          </SubstrateProvider>
        </Suspense>
      </SEOProvider>
    </QueryClientProvider>
  );
};

export default App;
