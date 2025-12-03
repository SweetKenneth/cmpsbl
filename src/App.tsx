import SystemAudit from "./pages/SystemAudit";
import System from "./pages/System";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SEOProvider } from "@/contexts/SEOContext";
import { installDefenseSystem } from "./utils/defenseInit";
import { CascadeChat } from "./components/CascadeChat";
import { initializeBrainSystem } from "./lib/initializeBrain";

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Eager load critical public pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Solutions from "./pages/Solutions";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Roadmap from "./pages/Roadmap";
import CurrentProjects from "./pages/CurrentProjects";
import DefenseProduct from "./pages/DefenseProduct";
import StudioProduct from "./pages/StudioProduct";
import BrainProduct from "./pages/BrainProduct";
import RippleProduct from "./pages/RippleProduct";
import AccessProduct from "./pages/AccessProduct";
import ClarityProduct from "./pages/ClarityProduct";
import ClarityDownload from "./pages/ClarityDownload";
import Awake from "./pages/Awake";
import Analytics from "./pages/Analytics";
import BrainControl from "./pages/BrainControl";
import CascadeControl from "./pages/CascadeControl";
import CascadeCoder from "./pages/CascadeCoder";
import BotSniper from "./pages/BotSniper";
import BotSniperAnalytics from "./pages/BotSniperAnalytics";
import BotSniperSettings from "./pages/BotSniperSettings";
import BotSniperPricing from './pages/BotSniperPricing';
import BotSniperHome from './pages/BotSniperHome';
import Modernizer from "./pages/Modernizer";
import Clarity from "./pages/Clarity";
import Scan from "./pages/Scan";
import ClarityDashboard from "./pages/ClarityDashboard";
import ClarityAddSite from "./pages/ClarityAddSite";
import ClarityScanDetails from "./pages/ClarityScanDetails";
import ClaritySiteSettings from "./pages/ClaritySiteSettings";
import ClaritySubscription from "./pages/ClaritySubscription";
import ClarityNotificationSettings from "./pages/ClarityNotificationSettings";
import ClarityApiKeys from "./pages/ClarityApiKeys";
import ClarityWebhooks from "./pages/ClarityWebhooks";
import ClarityTeams from "./pages/ClarityTeams";
import ClarityAdmin from "./pages/ClarityAdmin";
import ClaritySchedules from "./pages/ClaritySchedules";
import ClarityTrends from "./pages/ClarityTrends";
import ClarityReports from "./pages/ClarityReports";
import ClarityFixSuggestions from "./pages/ClarityFixSuggestions";
import ClarityPortfolio from "./pages/ClarityPortfolio";
import ClarityWhitelabel from "./pages/ClarityWhitelabel";
import ClarityClients from "./pages/ClarityClients";
import ClarityWidget from "./pages/ClarityWidget";
import ClarityCertifications from "./pages/ClarityCertifications";
import ClarityExtension from "./pages/ClarityExtension";
import WordPressAccessibilityGuide from "./pages/blog/WordPressAccessibilityGuide";
import WCAG22Changes from "./pages/blog/WCAG22Changes";
import AIAccessibilityFixes from "./pages/blog/AIAccessibilityFixes";

// Pillar and Cluster pages
import TheFirsts from "./pages/pillars/TheFirsts";
import VerifyCluster from "./pages/cluster/Verify";
import ClarityCluster from "./pages/cluster/Clarity";
import StudioCluster from "./pages/cluster/Studio";

// Eager load admin pages to avoid lazy load errors
import OverviewDashboard from "./pages/admin/OverviewDashboard";
import VisionControlDashboard from "./pages/admin/VisionControlDashboard";
import DefenseControlDashboard from "./pages/admin/DefenseControlDashboard";
import ProjectsControlDashboard from "./pages/admin/ProjectsControlDashboard";
import ClarityControlDashboard from "./pages/admin/ClarityControlDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ApiKeysManagement from "./pages/admin/ApiKeysManagement";
import BillingManagement from "./pages/admin/BillingManagement";
import DeploymentManager from "./pages/admin/DeploymentManager";
import DiagnosticsConsole from "./pages/admin/DiagnosticsConsole";
import SystemSettings from "./pages/admin/SystemSettings";
import AccessControlManagement from "./pages/admin/AccessControlManagement";

// Legacy pages removed - all functionality moved to /admin/* routes
const FreeAIResources = lazy(() => import("./pages/resources/FreeAIResources"));


// Lazy load blog pages
const WordPressBotDefense = lazy(() => import("./pages/blog/WordPressBotDefense"));
const TopSecurityPlugins2025 = lazy(() => import("./pages/blog/TopSecurityPlugins2025"));
const AICybersecurityEvolution2025 = lazy(() => import("./pages/blog/AICybersecurityEvolution2025"));
const AIHackersUnderground2025 = lazy(() => import("./pages/blog/AIHackersUnderground2025"));
const AIProductComparison2025 = lazy(() => import("./pages/blog/AIProductComparison2025"));
const CMPTBLMission = lazy(() => import("./pages/blog/CMPTBLMission"));
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

// Lazy load product info pages
const VisionInfo = lazy(() => import("./pages/products/VisionInfo"));
const DefenseInfo = lazy(() => import("./pages/products/DefenseInfo"));
const BrainInfo = lazy(() => import("./pages/products/BrainInfo"));
const StudioInfo = lazy(() => import("./pages/products/StudioInfo"));
const RippleInfo = lazy(() => import("./pages/products/RippleInfo"));
const AccessInfo = lazy(() => import("./pages/products/AccessInfo"));

// Lazy load additional pages
const BrainTraining = lazy(() => import("./pages/BrainTraining"));
const CreativeGeneration = lazy(() => import("./pages/CreativeGeneration"));
const PromptMerger = lazy(() => import("./pages/PromptMerger"));
const BrainLearning = lazy(() => import("./pages/BrainLearning"));
const LearningIntelligence = lazy(() => import("./pages/LearningIntelligence"));
const MarketingStudio = lazy(() => import("./pages/MarketingStudio"));
const ThreatFeed = lazy(() => import("./pages/ThreatFeed"));
const BrainML = lazy(() => import("./pages/BrainML"));
const ReflexKeys = lazy(() => import("./pages/ReflexKeys"));
import InvestorPackets from "./pages/InvestorPackets";
import BrainAnalytics from "./pages/BrainAnalytics";
import CascadeMindmap from "./pages/CascadeMindmap";
import SentienceHub from "./pages/SentienceHub";
import SystemHealth from "./pages/SystemHealth";
import CreativeStudio from "./pages/CreativeStudio";
import NexusAdmin from "./pages/NexusAdmin";
import SystemMap from "./pages/SystemMap";
import Billing from "./pages/Billing";
import Subscriptions from "./pages/Subscriptions";
import AccessControl from "./pages/AccessControl";
import RippleNetwork from "./pages/RippleNetwork";
import Documentation from "./pages/Documentation";
import Audit from "./pages/Audit";
import Investors from "./pages/Investors";
import Partnerships from "./pages/Partnerships";
import Marketing from "./pages/Marketing";
import SystemInitializer from "./pages/SystemInitializer";
import CascadeStatus from "./pages/CascadeStatus";
import CascadeDreams from "./pages/CascadeDreams";
import CascadeGovernance from "./pages/CascadeGovernance";
import BrainHub from "./pages/BrainHub";
import InvestorsPublic from "./pages/InvestorsPublic";
import Blog from "./pages/Blog";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    installDefenseSystem();
    initializeBrainSystem();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <SEOProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
          <CascadeChat />
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/projects" element={<CurrentProjects />} />
            <Route path="/projects/defense" element={<DefenseProduct />} />
            <Route path="/projects/studio" element={<StudioProduct />} />
            <Route path="/projects/brain" element={<BrainProduct />} />
            <Route path="/projects/ripple" element={<RippleProduct />} />
          <Route path="/projects/access" element={<AccessProduct />} />
          <Route path="/projects/clarity" element={<ClarityProduct />} />
          <Route path="/downloads/clarity" element={<ClarityDownload />} />
          <Route path="/awake" element={<Awake />} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/brain" element={<BrainControl />} />
          <Route path="/cascade" element={<CascadeControl />} />
          <Route path="/cascade/coder" element={<CascadeCoder />} />
          
          {/* Bot Sniper Standalone Product */}
          <Route path="/bot-sniper-home" element={<BotSniperHome />} />
          <Route path="/bot-sniper" element={<BotSniper />} />
          <Route path="/bot-sniper/analytics" element={<BotSniperAnalytics />} />
          <Route path="/bot-sniper/settings" element={<BotSniperSettings />} />
          <Route path="/bot-sniper/pricing" element={<BotSniperPricing />} />
          
          {/* Modernizer Product */}
          <Route path="/modernizer" element={<ProtectedRoute><AppLayout><Modernizer /></AppLayout></ProtectedRoute>} />
          
          {/* Clarity Product */}
          <Route path="/clarity" element={<Clarity />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/clarity/dashboard" element={<ProtectedRoute><ClarityDashboard /></ProtectedRoute>} />
          <Route path="/clarity/add-site" element={<ProtectedRoute><ClarityAddSite /></ProtectedRoute>} />
          <Route path="/clarity/scan/:scanId" element={<ProtectedRoute><ClarityScanDetails /></ProtectedRoute>} />
          <Route path="/clarity/site/:siteId/settings" element={<ProtectedRoute><ClaritySiteSettings /></ProtectedRoute>} />
          <Route path="/clarity/subscription" element={<ProtectedRoute><ClaritySubscription /></ProtectedRoute>} />
          <Route path="/clarity/notifications" element={<ProtectedRoute><ClarityNotificationSettings /></ProtectedRoute>} />
          <Route path="/clarity/api-keys" element={<ProtectedRoute><ClarityApiKeys /></ProtectedRoute>} />
          <Route path="/clarity/webhooks" element={<ProtectedRoute><ClarityWebhooks /></ProtectedRoute>} />
          <Route path="/clarity/teams" element={<ProtectedRoute><ClarityTeams /></ProtectedRoute>} />
          <Route path="/clarity/admin" element={<ProtectedRoute><ClarityAdmin /></ProtectedRoute>} />
          <Route path="/clarity/schedules" element={<ProtectedRoute><ClaritySchedules /></ProtectedRoute>} />
          <Route path="/clarity/trends" element={<ProtectedRoute><ClarityTrends /></ProtectedRoute>} />
          <Route path="/clarity/reports" element={<ProtectedRoute><ClarityReports /></ProtectedRoute>} />
          <Route path="/clarity/scan/:scanId/fixes" element={<ProtectedRoute><ClarityFixSuggestions /></ProtectedRoute>} />
          <Route path="/clarity/portfolio" element={<ProtectedRoute><ClarityPortfolio /></ProtectedRoute>} />
          <Route path="/clarity/whitelabel" element={<ProtectedRoute><ClarityWhitelabel /></ProtectedRoute>} />
          <Route path="/clarity/clients" element={<ProtectedRoute><ClarityClients /></ProtectedRoute>} />
          <Route path="/clarity/widget" element={<ProtectedRoute><ClarityWidget /></ProtectedRoute>} />
          <Route path="/clarity/certifications" element={<ProtectedRoute><ClarityCertifications /></ProtectedRoute>} />
          <Route path="/clarity/extension" element={<ProtectedRoute><ClarityExtension /></ProtectedRoute>} />
          
          <Route path="/blog/wordpress-accessibility-guide" element={<WordPressAccessibilityGuide />} />
          <Route path="/blog/wcag-2-2-wordpress-changes" element={<WCAG22Changes />} />
          <Route path="/blog/automated-accessibility-fixes-wordpress" element={<AIAccessibilityFixes />} />
          <Route path="/resources/free-ai" element={<Suspense fallback={<PageLoader />}><FreeAIResources /></Suspense>} />
          
          {/* Pillar and Cluster Routes */}
          <Route path="/pillars/promptfluid-the-firsts" element={<TheFirsts />} />
          <Route path="/cluster/verify-worlds-first-ai-plugin-certification" element={<VerifyCluster />} />
          <Route path="/cluster/clarity-ai-accessibility-and-autofix" element={<ClarityCluster />} />
          <Route path="/cluster/studio-autonomous-site-generator" element={<StudioCluster />} />
          
            <Route path="/auth" element={<Auth />} />
            
            {/* New Admin System Routes (2026) - Eager loaded */}
            <Route path="/admin/dashboard" element={<ProtectedRoute><OverviewDashboard /></ProtectedRoute>} />
            <Route path="/admin/vision" element={<ProtectedRoute><VisionControlDashboard /></ProtectedRoute>} />
            <Route path="/admin/defense" element={<ProtectedRoute><DefenseControlDashboard /></ProtectedRoute>} />
            <Route path="/admin/projects" element={<ProtectedRoute><ProjectsControlDashboard /></ProtectedRoute>} />
            <Route path="/admin/clarity" element={<ProtectedRoute><ClarityControlDashboard /></ProtectedRoute>} />
            
            {/* Admin Management Routes (2026) - Eager loaded */}
            <Route path="/admin/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/api-keys" element={<ProtectedRoute><ApiKeysManagement /></ProtectedRoute>} />
            <Route path="/admin/access-control" element={<ProtectedRoute><AccessControlManagement /></ProtectedRoute>} />
            <Route path="/admin/billing" element={<ProtectedRoute><BillingManagement /></ProtectedRoute>} />
            <Route path="/admin/deployment" element={<ProtectedRoute><DeploymentManager /></ProtectedRoute>} />
            <Route path="/admin/diagnostics" element={<ProtectedRoute><DiagnosticsConsole /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
            
            {/* System Control Route */}
            <Route path="/system" element={<System />} />
            
            {/* Legacy Routes - All redirect to new admin system */}
            <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/detections" element={<Navigate to="/admin/defense" replace />} />
            <Route path="/bot-detection" element={<Navigate to="/admin/defense" replace />} />
            <Route path="/behavior-analysis" element={<Navigate to="/admin/defense" replace />} />
            <Route path="/captcha" element={<Navigate to="/admin/defense" replace />} />
            <Route path="/device-fingerprint" element={<Navigate to="/admin/defense" replace />} />
            <Route path="/threat-intelligence" element={<Navigate to="/admin/defense" replace />} />
            <Route path="/threat-feed" element={<Navigate to="/admin/defense" replace />} />
            <Route path="/brain-ml" element={<Navigate to="/admin/vision" replace />} />
            <Route path="/rules" element={<Navigate to="/admin/settings" replace />} />
          <Route path="/red-team" element={<Navigate to="/admin/defense" replace />} />
          <Route path="/seo" element={<Navigate to="/admin/projects" replace />} />
          <Route path="/accessibility" element={<Navigate to="/admin/clarity" replace />} />
          <Route path="/integrations" element={<Navigate to="/admin/settings" replace />} />
          <Route path="/customers" element={<Navigate to="/admin/users" replace />} />
          <Route path="/logs" element={<Navigate to="/admin/diagnostics" replace />} />
          <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
          <Route path="/defense" element={<Navigate to="/admin/defense" replace />} />
          <Route path="/nexus-brain" element={<Navigate to="/admin/vision" replace />} />
          <Route path="/brain-memory" element={<Navigate to="/admin/vision" replace />} />
          <Route path="/brain-reports" element={<Navigate to="/admin/vision" replace />} />
          <Route path="/strategic-radar" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/persona-analytics" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/domain-reach" element={<Navigate to="/admin/projects" replace />} />
          <Route path="/access-console" element={<Navigate to="/admin/clarity" replace />} />
          <Route path="/ripple-studio" element={<Navigate to="/admin/projects" replace />} />
          <Route path="/studio" element={<Navigate to="/admin/projects" replace />} />
          <Route path="/defense-dashboard" element={<Navigate to="/admin/defense" replace />} />
          <Route path="/vision-dashboard" element={<Navigate to="/admin/vision" replace />} />
          <Route path="/vision" element={<Navigate to="/admin/vision" replace />} />
          <Route path="/projects-dashboard" element={<Navigate to="/admin/projects" replace />} />
          <Route path="/clarity-dashboard" element={<Navigate to="/admin/clarity" replace />} />
          <Route path="/cascade-admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/evolv-backoffice" element={<Navigate to="/admin/projects" replace />} />
          <Route path="/core/users" element={<Navigate to="/admin/users" replace />} />
          <Route path="/core/subscriptions" element={<Navigate to="/admin/billing" replace />} />
          <Route path="/core/usage" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/brain" element={<Navigate to="/admin/vision" replace />} />
          <Route path="/health" element={<Navigate to="/admin/diagnostics" replace />} />
          <Route path="/diagnostics" element={<Navigate to="/admin/diagnostics" replace />} />
          <Route path="/repair" element={<Navigate to="/admin/diagnostics" replace />} />
          <Route path="/updates" element={<Navigate to="/admin/deployment" replace />} />
          <Route path="/deployment" element={<Navigate to="/admin/deployment" replace />} />
          <Route path="/apis" element={<Navigate to="/admin/api-keys" replace />} />
          <Route path="/market-portal" element={<Navigate to="/admin/projects" replace />} />
          <Route path="/sites" element={<Navigate to="/admin/projects" replace />} />
          
          {/* Product Info Pages - Public */}
          <Route path="/products/vision" element={<VisionInfo />} />
          <Route path="/products/defense" element={<DefenseInfo />} />
          <Route path="/products/brain" element={<BrainInfo />} />
          <Route path="/products/studio" element={<StudioInfo />} />
          <Route path="/products/ripple" element={<RippleInfo />} />
          <Route path="/products/access" element={<AccessInfo />} />
          
          {/* Brain Training Console */}
          <Route path="/brain/training" element={<ProtectedRoute><AppLayout><BrainTraining /></AppLayout></ProtectedRoute>} />
          
          {/* Brain Hub Portal */}
          <Route path="/brain-hub" element={<BrainHub />} />
          
          {/* Creative Generation */}
          <Route path="/creative-generation" element={<ProtectedRoute><AppLayout><CreativeGeneration /></AppLayout></ProtectedRoute>} />
          
          {/* Prompt Merger */}
          <Route path="/prompt-merger" element={<ProtectedRoute><AppLayout><PromptMerger /></AppLayout></ProtectedRoute>} />
          
          {/* Brain Learning */}
          <Route path="/brain-learning" element={<ProtectedRoute><AppLayout><BrainLearning /></AppLayout></ProtectedRoute>} />
          
          {/* Cascade Mindmap */}
          <Route path="/cascade-mindmap" element={<ProtectedRoute><AppLayout><CascadeMindmap /></AppLayout></ProtectedRoute>} />
          
          {/* Sentience Hub v4.0 */}
          <Route path="/sentience-hub" element={<ProtectedRoute><AppLayout><SentienceHub /></AppLayout></ProtectedRoute>} />
          
          {/* Learning Intelligence */}
          <Route path="/learning-intelligence" element={<ProtectedRoute><AppLayout><LearningIntelligence /></AppLayout></ProtectedRoute>} />
          
          {/* Marketing Studio */}
          <Route path="/marketing-studio" element={<ProtectedRoute><AppLayout><MarketingStudio /></AppLayout></ProtectedRoute>} />
          
          {/* Reflex Admin Keys */}
          <Route path="/admin/reflex-keys" element={<ProtectedRoute><AppLayout><ReflexKeys /></AppLayout></ProtectedRoute>} />
          
          {/* Public Investors Page */}
          <Route path="/investors" element={<InvestorsPublic />} />
          
          {/* Protected Business Pages - Admin Only */}
          <Route path="/investor-packets" element={<ProtectedRoute><AppLayout><InvestorPackets /></AppLayout></ProtectedRoute>} />
          <Route path="/partnerships" element={<ProtectedRoute><AppLayout><Partnerships /></AppLayout></ProtectedRoute>} />
          <Route path="/marketing" element={<ProtectedRoute><AppLayout><Marketing /></AppLayout></ProtectedRoute>} />
          
          {/* Brain Analytics */}
          <Route path="/brain-analytics" element={<ProtectedRoute><AppLayout><BrainAnalytics /></AppLayout></ProtectedRoute>} />
          
          {/* Admin System Pages - Moved to /admin */}
          <Route path="/admin/system-health" element={<ProtectedRoute><AppLayout><SystemHealth /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/system-map" element={<ProtectedRoute><AppLayout><SystemMap /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/system-initializer" element={<ProtectedRoute><AppLayout><SystemInitializer /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/cascade-status" element={<ProtectedRoute><AppLayout><CascadeStatus /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/cascade-dreams" element={<ProtectedRoute><AppLayout><CascadeDreams /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/cascade-governance" element={<ProtectedRoute><AppLayout><CascadeGovernance /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute><AppLayout><Audit /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/creative-studio" element={<ProtectedRoute><AppLayout><CreativeStudio /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/nexus" element={<ProtectedRoute><AppLayout><NexusAdmin /></AppLayout></ProtectedRoute>} />
          
          {/* Legacy system route redirects */}
          <Route path="/system-health" element={<Navigate to="/admin/system-health" replace />} />
          <Route path="/system-map" element={<Navigate to="/admin/system-map" replace />} />
          <Route path="/system-initializer" element={<Navigate to="/admin/system-initializer" replace />} />
          <Route path="/cascade-status" element={<Navigate to="/admin/cascade-status" replace />} />
          <Route path="/cascade-dreams" element={<Navigate to="/admin/cascade-dreams" replace />} />
          <Route path="/cascade-governance" element={<Navigate to="/admin/cascade-governance" replace />} />
          <Route path="/audit" element={<Navigate to="/admin/audit" replace />} />
          
          {/* Billing & Subscriptions - Moved to Admin */}
          <Route path="/admin/billing-management" element={<ProtectedRoute><AppLayout><Billing /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/subscriptions" element={<ProtectedRoute><AppLayout><Subscriptions /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/access-control-legacy" element={<ProtectedRoute><AppLayout><AccessControl /></AppLayout></ProtectedRoute>} />
          
          {/* Legacy billing redirects */}
          <Route path="/billing" element={<Navigate to="/admin/billing-management" replace />} />
          <Route path="/subscriptions" element={<Navigate to="/admin/subscriptions" replace />} />
          <Route path="/access-control" element={<Navigate to="/admin/access-control" replace />} />
          
          {/* Public Documentation & Network Pages */}
          <Route path="/ripple-network" element={<ProtectedRoute><AppLayout><RippleNetwork /></AppLayout></ProtectedRoute>} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/threat-feed" element={<ProtectedRoute><AppLayout><ThreatFeed /></AppLayout></ProtectedRoute>} />
          
          {/* Blog Posts */}
          <Route path="/blog/wordpress-bot-defense" element={<WordPressBotDefense />} />
          <Route path="/blog/top-security-plugins-2025" element={<TopSecurityPlugins2025 />} />
          <Route path="/blog/ai-cybersecurity-evolution-2025" element={<AICybersecurityEvolution2025 />} />
          <Route path="/blog/ai-hackers-underground-2025" element={<AIHackersUnderground2025 />} />
          <Route path="/blog/ai-product-comparison-2025" element={<AIProductComparison2025 />} />
          <Route path="/blog/cmptbl-mission" element={<CMPTBLMission />} />
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
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </SEOProvider>
  </QueryClientProvider>
  );
};

export default App;
