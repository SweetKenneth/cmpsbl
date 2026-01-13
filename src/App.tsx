/**
 * promptfluid® — Cognitive Orchestration Substrate
 * v2026.01 — Main Application Entry
 */

import SystemAudit from "./pages/SystemAudit";
import System from "./pages/System";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense, ReactNode } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SEOProvider } from "@/contexts/SEOContext";
import { SubstrateProvider } from "./components/substrate/SubstrateProvider";
import { DecodeChat } from "./components/DecodeChat";
import { AdminLayout } from "./components/admin/AdminLayout";

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
import DecodeControl from "./pages/DecodeControl";
import DecodeCoder from "./pages/DecodeCoder";
import RCKBL from "./pages/BotSniper";
import RCKBLAnalytics from "./pages/BotSniperAnalytics";
import RCKBLSettings from "./pages/BotSniperSettings";
import RCKBLPricing from './pages/BotSniperPricing';
import RCKBLHome from './pages/BotSniperHome';
import Modernizer from "./pages/Modernizer";
import PTCHBL from "./pages/Clarity";
import Scan from "./pages/Scan";
import PTCHBLDashboard from "./pages/ClarityDashboard";
import PTCHBLAddSite from "./pages/ClarityAddSite";
import PTCHBLScanDetails from "./pages/ClarityScanDetails";
import PTCHBLSiteSettings from "./pages/ClaritySiteSettings";
import PTCHBLSubscription from "./pages/ClaritySubscription";
import PTCHBLNotificationSettings from "./pages/ClarityNotificationSettings";
import PTCHBLApiKeys from "./pages/ClarityApiKeys";
import PTCHBLWebhooks from "./pages/ClarityWebhooks";
import PTCHBLTeams from "./pages/ClarityTeams";
import PTCHBLAdmin from "./pages/ClarityAdmin";
import PTCHBLSchedules from "./pages/ClaritySchedules";
import PTCHBLTrends from "./pages/ClarityTrends";
import PTCHBLReports from "./pages/ClarityReports";
import PTCHBLFixSuggestions from "./pages/ClarityFixSuggestions";
import PTCHBLPortfolio from "./pages/ClarityPortfolio";
import PTCHBLWhitelabel from "./pages/ClarityWhitelabel";
import PTCHBLClients from "./pages/ClarityClients";
import PTCHBLWidget from "./pages/ClarityWidget";
import PTCHBLCertifications from "./pages/ClarityCertifications";
import PTCHBLExtension from "./pages/ClarityExtension";
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
import { AdminRoute } from "./components/admin/AdminRoute";

// Legal pages
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

// Legacy pages removed - all functionality moved to /admin/* routes
const FreeAIResources = lazy(() => import("./pages/resources/FreeAIResources"));

// Lazy load blog pages
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
const RCKBLKeys = lazy(() => import("./pages/ReflexKeys"));
import InvestorPackets from "./pages/InvestorPackets";
import BrainAnalytics from "./pages/BrainAnalytics";
import DecodeMindmap from "./pages/DecodeMindmap";
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
import DecodeStatus from "./pages/DecodeStatus";
import DecodeDreams from "./pages/DecodeDreams";
import DecodeGovernance from "./pages/DecodeGovernance";
import BrainHub from "./pages/BrainHub";
import InvestorsPublic from "./pages/InvestorsPublic";
import Blog from "./pages/Blog";
import FeedDreamEater from "./pages/FeedDreamEater";
import SubstrateDashboard from "./pages/SubstrateDashboard";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
};

// AdminPageWrapper: wraps pages that don't have their own AdminLayout with the unified admin layout
const AdminPageWrapper = ({ children }: { children: ReactNode }) => {
  return <AdminLayout>{children}</AdminLayout>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
    <SEOProvider>
      <SubstrateProvider autoInit={true}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
          <DecodeChat />
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
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
          <Route path="/decode" element={<DecodeControl />} />
          <Route path="/decode/coder" element={<DecodeCoder />} />
          
          {/* RCKBL (Rockable) Product */}
          <Route path="/bot-sniper-home" element={<RCKBLHome />} />
          <Route path="/bot-sniper" element={<RCKBL />} />
          <Route path="/bot-sniper/analytics" element={<RCKBLAnalytics />} />
          <Route path="/bot-sniper/settings" element={<RCKBLSettings />} />
          <Route path="/bot-sniper/pricing" element={<RCKBLPricing />} />
          
          {/* Modernizer Product */}
          <Route path="/modernizer" element={<AdminRoute><AdminPageWrapper><Modernizer /></AdminPageWrapper></AdminRoute>} />
          
          {/* PTCHBL (Patchable) Product */}
          <Route path="/clarity" element={<PTCHBL />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/clarity/dashboard" element={<ProtectedRoute><PTCHBLDashboard /></ProtectedRoute>} />
          <Route path="/clarity/add-site" element={<ProtectedRoute><PTCHBLAddSite /></ProtectedRoute>} />
          <Route path="/clarity/scan/:scanId" element={<ProtectedRoute><PTCHBLScanDetails /></ProtectedRoute>} />
          <Route path="/clarity/site/:siteId/settings" element={<ProtectedRoute><PTCHBLSiteSettings /></ProtectedRoute>} />
          <Route path="/clarity/subscription" element={<ProtectedRoute><PTCHBLSubscription /></ProtectedRoute>} />
          <Route path="/clarity/notifications" element={<ProtectedRoute><PTCHBLNotificationSettings /></ProtectedRoute>} />
          <Route path="/clarity/api-keys" element={<ProtectedRoute><PTCHBLApiKeys /></ProtectedRoute>} />
          <Route path="/clarity/webhooks" element={<ProtectedRoute><PTCHBLWebhooks /></ProtectedRoute>} />
          <Route path="/clarity/teams" element={<ProtectedRoute><PTCHBLTeams /></ProtectedRoute>} />
          <Route path="/clarity/admin" element={<ProtectedRoute><PTCHBLAdmin /></ProtectedRoute>} />
          <Route path="/clarity/schedules" element={<ProtectedRoute><PTCHBLSchedules /></ProtectedRoute>} />
          <Route path="/clarity/trends" element={<ProtectedRoute><PTCHBLTrends /></ProtectedRoute>} />
          <Route path="/clarity/reports" element={<ProtectedRoute><PTCHBLReports /></ProtectedRoute>} />
          <Route path="/clarity/scan/:scanId/fixes" element={<ProtectedRoute><PTCHBLFixSuggestions /></ProtectedRoute>} />
          <Route path="/clarity/portfolio" element={<ProtectedRoute><PTCHBLPortfolio /></ProtectedRoute>} />
          <Route path="/clarity/whitelabel" element={<ProtectedRoute><PTCHBLWhitelabel /></ProtectedRoute>} />
          <Route path="/clarity/clients" element={<ProtectedRoute><PTCHBLClients /></ProtectedRoute>} />
          <Route path="/clarity/widget" element={<ProtectedRoute><PTCHBLWidget /></ProtectedRoute>} />
          <Route path="/clarity/certifications" element={<ProtectedRoute><PTCHBLCertifications /></ProtectedRoute>} />
          <Route path="/clarity/extension" element={<ProtectedRoute><PTCHBLExtension /></ProtectedRoute>} />
          
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
            
            {/* New Admin System Routes (2026) - Using AdminRoute for proper admin auth */}
            <Route path="/admin/dashboard" element={<AdminRoute><OverviewDashboard /></AdminRoute>} />
            <Route path="/admin/vision" element={<AdminRoute><VisionControlDashboard /></AdminRoute>} />
            <Route path="/admin/defense" element={<AdminRoute><DefenseControlDashboard /></AdminRoute>} />
            <Route path="/admin/projects" element={<AdminRoute><ProjectsControlDashboard /></AdminRoute>} />
            <Route path="/admin/clarity" element={<AdminRoute><ClarityControlDashboard /></AdminRoute>} />
            
            {/* Admin Management Routes (2026) - Using AdminRoute for proper admin auth */}
            <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="/admin/api-keys" element={<AdminRoute><ApiKeysManagement /></AdminRoute>} />
            <Route path="/admin/access-control" element={<AdminRoute><AccessControlManagement /></AdminRoute>} />
            <Route path="/admin/billing" element={<AdminRoute><BillingManagement /></AdminRoute>} />
            <Route path="/admin/deployment" element={<AdminRoute><DeploymentManager /></AdminRoute>} />
            <Route path="/admin/diagnostics" element={<AdminRoute><DiagnosticsConsole /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><SystemSettings /></AdminRoute>} />
            
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
          <Route path="/brain/training" element={<AdminRoute><AdminPageWrapper><BrainTraining /></AdminPageWrapper></AdminRoute>} />
          
          {/* Brain Hub Portal */}
          <Route path="/brain-hub" element={<BrainHub />} />
          
          {/* Creative Generation */}
          <Route path="/creative-generation" element={<AdminRoute><AdminPageWrapper><CreativeGeneration /></AdminPageWrapper></AdminRoute>} />
          
          {/* Prompt Merger */}
          <Route path="/prompt-merger" element={<AdminRoute><AdminPageWrapper><PromptMerger /></AdminPageWrapper></AdminRoute>} />
          
          {/* Brain Learning */}
          <Route path="/brain-learning" element={<AdminRoute><AdminPageWrapper><BrainLearning /></AdminPageWrapper></AdminRoute>} />
          
          {/* Decode Mindmap */}
          <Route path="/decode-mindmap" element={<AdminRoute><AdminPageWrapper><DecodeMindmap /></AdminPageWrapper></AdminRoute>} />
          {/* Legacy redirect */}
          <Route path="/cascade-mindmap" element={<Navigate to="/decode-mindmap" replace />} />
          
          {/* Sentience Hub v4.0 */}
          <Route path="/sentience-hub" element={<AdminRoute><AdminPageWrapper><SentienceHub /></AdminPageWrapper></AdminRoute>} />
          
          {/* Learning Intelligence */}
          <Route path="/learning-intelligence" element={<AdminRoute><AdminPageWrapper><LearningIntelligence /></AdminPageWrapper></AdminRoute>} />
          
          {/* Marketing Studio */}
          <Route path="/marketing-studio" element={<AdminRoute><AdminPageWrapper><MarketingStudio /></AdminPageWrapper></AdminRoute>} />
          
          {/* RCKBL Admin Keys */}
          <Route path="/admin/reflex-keys" element={<AdminRoute><AdminPageWrapper><RCKBLKeys /></AdminPageWrapper></AdminRoute>} />
          
          {/* Public Investors Page */}
          <Route path="/investors" element={<InvestorsPublic />} />
          
          {/* Investor Packets */}
          <Route path="/investor-packets" element={<Navigate to="/investors" replace />} />
          <Route path="/admin/investor-packets" element={<AdminRoute><AdminPageWrapper><InvestorPackets /></AdminPageWrapper></AdminRoute>} />
          
          {/* Protected Business Pages - Admin Only */}
          <Route path="/partnerships" element={<AdminRoute><AdminPageWrapper><Partnerships /></AdminPageWrapper></AdminRoute>} />
          <Route path="/marketing" element={<AdminRoute><AdminPageWrapper><Marketing /></AdminPageWrapper></AdminRoute>} />
          
          {/* Brain Analytics */}
          <Route path="/brain-analytics" element={<AdminRoute><AdminPageWrapper><BrainAnalytics /></AdminPageWrapper></AdminRoute>} />
          
          {/* Admin System Pages - Moved to /admin */}
          <Route path="/admin/system-health" element={<AdminRoute><AdminPageWrapper><SystemHealth /></AdminPageWrapper></AdminRoute>} />
          <Route path="/admin/system-map" element={<AdminRoute><AdminPageWrapper><SystemMap /></AdminPageWrapper></AdminRoute>} />
          <Route path="/admin/system-initializer" element={<AdminRoute><AdminPageWrapper><SystemInitializer /></AdminPageWrapper></AdminRoute>} />
          <Route path="/admin/decode-status" element={<AdminRoute><AdminPageWrapper><DecodeStatus /></AdminPageWrapper></AdminRoute>} />
          <Route path="/admin/decode-dreams" element={<AdminRoute><AdminPageWrapper><DecodeDreams /></AdminPageWrapper></AdminRoute>} />
          <Route path="/admin/decode-governance" element={<AdminRoute><AdminPageWrapper><DecodeGovernance /></AdminPageWrapper></AdminRoute>} />
          <Route path="/admin/audit" element={<AdminRoute><AdminPageWrapper><Audit /></AdminPageWrapper></AdminRoute>} />
          <Route path="/admin/creative-studio" element={<AdminRoute><AdminPageWrapper><CreativeStudio /></AdminPageWrapper></AdminRoute>} />
          <Route path="/admin/nexus" element={<AdminRoute><AdminPageWrapper><NexusAdmin /></AdminPageWrapper></AdminRoute>} />
          
          {/* Legacy system route redirects */}
          <Route path="/system-health" element={<Navigate to="/admin/system-health" replace />} />
          <Route path="/system-map" element={<Navigate to="/admin/system-map" replace />} />
          <Route path="/system-initializer" element={<Navigate to="/admin/system-initializer" replace />} />
          <Route path="/cascade-status" element={<Navigate to="/admin/decode-status" replace />} />
          <Route path="/cascade-dreams" element={<Navigate to="/admin/decode-dreams" replace />} />
          <Route path="/cascade-governance" element={<Navigate to="/admin/decode-governance" replace />} />
          <Route path="/audit" element={<Navigate to="/admin/audit" replace />} />
          
          {/* Billing & Subscriptions - Moved to Admin */}
          <Route path="/admin/billing-management" element={<AdminRoute><AdminPageWrapper><Billing /></AdminPageWrapper></AdminRoute>} />
          <Route path="/admin/subscriptions" element={<AdminRoute><AdminPageWrapper><Subscriptions /></AdminPageWrapper></AdminRoute>} />
          <Route path="/admin/access-control-legacy" element={<AdminRoute><AdminPageWrapper><AccessControl /></AdminPageWrapper></AdminRoute>} />
          
          {/* Legacy billing redirects */}
          <Route path="/billing" element={<Navigate to="/admin/billing-management" replace />} />
          <Route path="/subscriptions" element={<Navigate to="/admin/subscriptions" replace />} />
          <Route path="/access-control" element={<Navigate to="/admin/access-control" replace />} />
          
          {/* Public Documentation & Network Pages */}
          <Route path="/ripple-network" element={<AdminRoute><AdminPageWrapper><RippleNetwork /></AdminPageWrapper></AdminRoute>} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/threat-feed" element={<AdminRoute><AdminPageWrapper><ThreatFeed /></AdminPageWrapper></AdminRoute>} />
          
          {/* Blog Posts */}
          <Route path="/blog/wordpress-bot-defense" element={<WordPressBotDefense />} />
          <Route path="/blog/top-security-plugins-2025" element={<TopSecurityPlugins2025 />} />
          <Route path="/blog/ai-cybersecurity-evolution-2025" element={<AICybersecurityEvolution2025 />} />
          <Route path="/blog/ai-hackers-underground-2025" element={<AIHackersUnderground2025 />} />
          <Route path="/blog/ai-product-comparison-2025" element={<AIProductComparison2025 />} />
          <Route path="/blog/clarity-accessibility-mission" element={<PTCHBLMission />} />
          <Route path="/blog/cmptbl-mission" element={<Navigate to="/blog/clarity-accessibility-mission" replace />} />
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
          <Route path="/blog/accessibility-free-for-all" element={<Suspense fallback={<PageLoader />}><AccessibilityFreeForAll /></Suspense>} />
          
          {/* Public Dream-Eater Feeding Page */}
          <Route path="/feed-dream-eater" element={<FeedDreamEater />} />
          
          {/* Substrate Dashboard */}
          <Route path="/substrate" element={<SubstrateDashboard />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </SubstrateProvider>
    </SEOProvider>
  </QueryClientProvider>
  );
};

export default App;
