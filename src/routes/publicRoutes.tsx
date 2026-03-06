/**
 * Public Routes — Core product and marketing pages
 */
import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { PhaseGateRoute } from "@/components/gates/PhaseGateRoute";
import { PackGate } from "@/components/slots/PackGate";

// Core pages
const DomainAwareHome = lazy(() => import("@/components/routing/DomainAwareHome"));
const FeedDreamEater = lazy(() => import("@/pages/FeedDreamEater"));
const DreamArchaeology = lazy(() => import("@/pages/dream-eater/DreamArchaeology"));
const DreamArtifacts = lazy(() => import("@/pages/dream-eater/DreamArtifacts"));
const Blog = lazy(() => import("@/pages/Blog"));
const InvestorsPublic = lazy(() => import("@/pages/InvestorsPublic"));
const SubstrateDashboard = lazy(() => import("@/pages/SubstrateDashboard"));
const SubstrateOS = lazy(() => import("@/pages/SubstrateOS"));
const SubstrateDemo = lazy(() => import("@/pages/SubstrateDemo"));
const FoundryDemo = lazy(() => import("@/pages/FoundryDemo"));
const Foundry = lazy(() => import("@/pages/Foundry"));
const ProofMode = lazy(() => import("@/pages/ProofMode"));
const STierDemos = lazy(() => import("@/pages/STierDemos"));
const Publication = lazy(() => import("@/pages/Publication"));
const Documentation = lazy(() => import("@/pages/Documentation"));
const IntentMeshPublic = lazy(() => import("@/pages/IntentMeshPublic"));
const Changelog = lazy(() => import("@/pages/Changelog"));
const CodeLab = lazy(() => import("@/pages/CodeLab"));
const AgencyPortal = lazy(() => import("@/pages/AgencyPortal"));
const DevTools = lazy(() => import("@/pages/DevTools"));
const DeveloperAcademy = lazy(() => import("@/pages/DeveloperAcademy"));
const VanillaDeveloperGuide = lazy(() => import("@/pages/VanillaDeveloperGuide"));
const GamingSubstrate = lazy(() => import("@/pages/GamingSubstrate"));
const DeveloperShowcase = lazy(() => import("@/pages/DeveloperShowcase"));
const UseCases = lazy(() => import("@/pages/UseCases"));
const MarketplaceSuccess = lazy(() => import("@/pages/MarketplaceSuccess"));
const SubstrateLicensingSuccess = lazy(() => import("@/pages/SubstrateLicensingSuccess"));
const SubstrateLicensingDownload = lazy(() => import("@/pages/SubstrateLicensingDownload"));
const ExperimentationLab = lazy(() => import("@/pages/ExperimentationLab"));
const ClocklessWorldEngine = lazy(() => import("@/pages/ClocklessWorldEngine"));
const SubstrateCapabilitiesDocs = lazy(() => import("@/pages/SubstrateCapabilitiesDocs"));
const SystemIntelligenceFeed = lazy(() => import("@/pages/SystemIntelligenceFeed"));
const CheckoutRedirect = lazy(() => import("@/pages/CheckoutRedirect"));

const Engines = lazy(() => import("@/pages/Engines"));
const EngineDetail = lazy(() => import("@/pages/EngineDetail"));
const Upgrade = lazy(() => import("@/pages/Upgrade"));
const Packs = lazy(() => import("@/pages/Packs"));
const CapabilityMap = lazy(() => import("@/pages/CapabilityMap"));
const ScanResult = lazy(() => import("@/pages/ScanResult"));
const Scanner = lazy(() => import("@/pages/Scanner"));
const Status = lazy(() => import("@/pages/Status"));
const SystemIntegrity = lazy(() => import("@/pages/SystemIntegrity"));
const ComposableCognitives = lazy(() => import("@/pages/ComposableCognitives"));
const CognitivesSuccess = lazy(() => import("@/pages/CognitivesSuccess"));
const CognitivesDownload = lazy(() => import("@/pages/CognitivesDownload"));
const AdminCognitiveUploads = lazy(() => import("@/pages/AdminCognitiveUploads"));
const PersistentMemoryDocs = lazy(() => import("@/pages/docs/PersistentMemoryDocs"));
const DocsReader = lazy(() => import("@/pages/docs/DocsReader"));
const AcademicV13Docs = lazy(() => import("@/pages/docs/AcademicV13Docs"));
const RuntimeReference = lazy(() => import("@/pages/docs/RuntimeReference"));
const EngineDocsPage = lazy(() => import("@/pages/docs/EngineDocsPage"));
const CapabilityManifest = lazy(() => import("@/pages/docs/CapabilityManifest"));
const RuntimePage = lazy(() => import("@/pages/Runtime"));
const PersistentMemoryLanding = lazy(() => import("@/pages/PersistentMemoryLanding"));
const StartHere = lazy(() => import("@/pages/StartHere"));
const Enterprise = lazy(() => import("@/pages/Enterprise"));
const ApiAccess = lazy(() => import("@/pages/ApiAccess"));
const Careers = lazy(() => import("@/pages/Careers"));
const EvolutionControlCenter = lazy(() => import("@/pages/EvolutionControlCenter"));
const Architecture = lazy(() => import("@/pages/Architecture"));
const ModulesHub = lazy(() => import("@/pages/ModulesHub"));
const ModuleDetail = lazy(() => import("@/pages/ModuleDetail"));
const AIOperatingSystem = lazy(() => import("@/pages/AIOperatingSystem"));

// Marketing / Info
const About = lazy(() => import("@/pages/About"));
const Solutions = lazy(() => import("@/pages/Solutions"));
const Contact = lazy(() => import("@/pages/Contact"));
const CurrentProjects = lazy(() => import("@/pages/CurrentProjects"));
const Roadmap = lazy(() => import("@/pages/Roadmap"));
const LlmsTxt = lazy(() => import("@/pages/LlmsTxt"));
const HumansTxt = lazy(() => import("@/pages/HumansTxt"));
const Foundations = lazy(() => import("@/pages/Foundations"));
const Namespace = lazy(() => import("@/pages/Namespace"));
const Insights = lazy(() => import("@/pages/Insights"));
const SystemOverview = lazy(() => import("@/pages/SystemOverview"));
const Workspace = lazy(() => import("@/pages/Workspace"));

const Support = lazy(() => import("@/pages/Support"));
const PromptFluidHome = lazy(() => import("@/pages/PromptFluidHome"));
const Auth = lazy(() => import("@/pages/Auth"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));

export const publicRoutes = (
  <>
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
    <Route path="/foundry" element={<Foundry />} />
    <Route path="/foundry/demo" element={<FoundryDemo />} />
    <Route path="/proof" element={<ProofMode />} />
    <Route path="/showcase" element={<STierDemos />} />
    <Route path="/publication" element={<Publication />} />
    <Route path="/documentation" element={<Documentation />} />
    <Route path="/intent-mesh" element={<PhaseGateRoute><IntentMeshPublic /></PhaseGateRoute>} />
    <Route path="/changelog" element={<Changelog />} />
    <Route path="/codelab" element={<CodeLab />} />
    <Route path="/workspace" element={<Workspace />} />
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
    <Route path="/developers/guide" element={<VanillaDeveloperGuide />} />
    <Route path="/use-cases" element={<UseCases />} />
    <Route path="/marketplace" element={<Navigate to="/upgrade" replace />} />
    <Route path="/marketplace/success" element={<PhaseGateRoute><MarketplaceSuccess /></PhaseGateRoute>} />
    <Route path="/engine-marketplace" element={<Navigate to="/upgrade" replace />} />
    <Route path="/intelligence" element={<Navigate to="/upgrade" replace />} />
    <Route path="/substrate/licensing" element={<Navigate to="/licensing" replace />} />
    <Route path="/licensing" element={<PhaseGateRoute><PackGate packId="pack-self-hosted"><SubstrateLicensingDownload /></PackGate></PhaseGateRoute>} />
    <Route path="/substrate/licensing/success" element={<PhaseGateRoute><SubstrateLicensingSuccess /></PhaseGateRoute>} />
    <Route path="/lab" element={<PhaseGateRoute><ExperimentationLab /></PhaseGateRoute>} />
    <Route path="/clockless-world-engine" element={<PhaseGateRoute><ClocklessWorldEngine /></PhaseGateRoute>} />
    <Route path="/docs/substrate/capabilities" element={<SubstrateCapabilitiesDocs />} />
    <Route path="/docs/persistent-memory" element={<PersistentMemoryDocs />} />
    <Route path="/docs/runtime" element={<RuntimeReference />} />
    <Route path="/docs/manifest" element={<CapabilityManifest />} />
    <Route path="/docs/system" element={<DocsReader />} />
    <Route path="/docs/academic-v13" element={<AcademicV13Docs />} />
    <Route path="/docs/engines/:slug" element={<EngineDocsPage />} />
    <Route path="/runtime" element={<RuntimePage />} />
    <Route path="/capability-map" element={<CapabilityMap />} />
    <Route path="/persistent-memory" element={<PersistentMemoryLanding />} />
    <Route path="/capabilities" element={<Navigate to="/upgrade" replace />} />
    <Route path="/synergies" element={<Navigate to="/upgrade" replace />} />
    <Route path="/store" element={<Navigate to="/upgrade" replace />} />
    <Route path="/artifacts" element={<Navigate to="/upgrade" replace />} />
    <Route path="/operatives" element={<Navigate to="/engines" replace />} />
    <Route path="/operatives/:slug" element={<Navigate to="/engines" replace />} />
    <Route path="/engines" element={<Engines />} />
    <Route path="/engines/:slug" element={<EngineDetail />} />
    <Route path="/system-feed" element={<PhaseGateRoute><PackGate packId="pack-observability"><SystemIntelligenceFeed /></PackGate></PhaseGateRoute>} />
    <Route path="/scan/results/:id" element={<ScanResult />} />
    <Route path="/scan" element={<Scanner />} />
    <Route path="/scanner" element={<Scanner />} />
    <Route path="/status" element={<Status />} />
    <Route path="/system-integrity" element={<PhaseGateRoute><SystemIntegrity /></PhaseGateRoute>} />
    <Route path="/checkout/redirect" element={<CheckoutRedirect />} />
    <Route path="/cmpsbl-engine" element={<Navigate to="/" replace />} />
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
    <Route path="/overview" element={<SystemOverview />} />
    <Route path="/register" element={<Navigate to="/auth" replace />} />
    <Route path="/library" element={<Navigate to="/" replace />} />
    <Route path="/support" element={<Support />} />
    <Route path="/explore" element={<Navigate to="/" replace />} />
    <Route path="/promptfluid" element={<PromptFluidHome />} />

    {/* System pages */}
    <Route path="/modules" element={<ModulesHub />} />
    <Route path="/modules/:slug" element={<ModuleDetail />} />
    <Route path="/ai-operating-system" element={<AIOperatingSystem />} />
    <Route path="/products/encode" element={<Navigate to="/" replace />} />

    {/* Cluster redirects */}
    <Route path="/cluster/studio-autonomous-site-generator" element={<Navigate to="/" replace />} />
    <Route path="/cluster/verify-worlds-first-ai-plugin-certification" element={<Navigate to="/" replace />} />
    <Route path="/cluster/inclusive-module-accessibility" element={<Navigate to="/" replace />} />
    <Route path="/cluster/clarity-ai-accessibility-and-autofix" element={<Navigate to="/" replace />} />

    {/* Auth & Legal */}
    <Route path="/auth" element={<Auth />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/terms" element={<Terms />} />

    {/* Misc public */}
    <Route path="/evolution" element={<EvolutionControlCenter />} />
    <Route path="/architecture" element={<Architecture />} />
    <Route path="/pricing" element={<Upgrade />} />
    <Route path="/upgrade" element={<Upgrade />} />
    <Route path="/packs" element={<Packs />} />
    <Route path="/start-here" element={<StartHere />} />
    <Route path="/enterprise" element={<Enterprise />} />
    <Route path="/api-access" element={<ApiAccess />} />
    <Route path="/careers" element={<Careers />} />
  </>
);
