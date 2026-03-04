/**
 * Blog Routes — All blog post routes and redirects
 */
import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";

// Memory Stream series
const MemoryStreamCrystallizationGuide = lazy(() => import("@/pages/blog/MemoryStreamCrystallizationGuide"));
const SignalToSiliconNarrative = lazy(() => import("@/pages/blog/SignalToSiliconNarrative"));
const MemoryStreamTierAnatomy = lazy(() => import("@/pages/blog/MemoryStreamTierAnatomy"));
const MemoryStreamVaultMastery = lazy(() => import("@/pages/blog/MemoryStreamVaultMastery"));
const AutonomousDiscoveryEngine = lazy(() => import("@/pages/blog/AutonomousDiscoveryEngine"));

const WordPressBotDefense = lazy(() => import("@/pages/blog/WordPressBotDefense"));
const TopSecurityPlugins2025 = lazy(() => import("@/pages/blog/TopSecurityPlugins2025"));
const AICybersecurityEvolution2025 = lazy(() => import("@/pages/blog/AICybersecurityEvolution2025"));
const AIHackersUnderground2025 = lazy(() => import("@/pages/blog/AIHackersUnderground2025"));
const AIProductComparison2025 = lazy(() => import("@/pages/blog/AIProductComparison2025"));
const InclusiveModuleMission = lazy(() => import("@/pages/blog/InclusiveModuleMission"));
const PromptFluidMarketDisruptor = lazy(() => import("@/pages/blog/PromptFluidMarketDisruptor"));
const ProductRoadmap2025 = lazy(() => import("@/pages/blog/ProductRoadmap2025"));
const AIAutomationTrends2025 = lazy(() => import("@/pages/blog/AIAutomationTrends2025"));
const AIBusinessOperations2025 = lazy(() => import("@/pages/blog/AIBusinessOperations2025"));
const HowPromptFluidWorks = lazy(() => import("@/pages/blog/how-promptfluid-works-cascade-ai-ecosystem"));
const CascadeAIDeepDive = lazy(() => import("@/pages/blog/cascade-ai-adaptive-intelligence-brain"));
const PromptFluidStudioGuide = lazy(() => import("@/pages/blog/promptfluid-studio-build-apps-that-think"));
const AITriadExplained = lazy(() => import("@/pages/blog/ai-triad-intelligent-routing"));
const PromptFluidBrain = lazy(() => import("@/pages/blog/promptfluid-brain-adaptive-learning-core"));
const PromptFluidVision = lazy(() => import("@/pages/blog/promptfluid-vision-unified-dashboard"));
const PromptFluidDefense = lazy(() => import("@/pages/blog/promptfluid-defense-ai-security"));
const PromptFluidRipple = lazy(() => import("@/pages/blog/promptfluid-ripple-network-integration"));
const PromptFluidAccess = lazy(() => import("@/pages/blog/promptfluid-access-identity-billing"));
const PromptFluidNexus = lazy(() => import("@/pages/blog/promptfluid-nexus-api-gateway"));
const AISystemsThatDreamPressRelease = lazy(() => import("@/pages/blog/ai-systems-that-dream-press-release"));
const AccessibilityFreeForAll = lazy(() => import("@/pages/blog/accessibility-free-for-all"));
const WordPressAccessibilityGuide = lazy(() => import("@/pages/blog/WordPressAccessibilityGuide"));
const WCAG22Changes = lazy(() => import("@/pages/blog/WCAG22Changes"));
const AIAccessibilityFixes = lazy(() => import("@/pages/blog/AIAccessibilityFixes"));
const EvolvingSoftwareV6Breakthrough = lazy(() => import("@/pages/blog/evolving-software-v6-breakthrough"));
const LLMsTxtProtocol = lazy(() => import("@/pages/blog/llms-txt-protocol-ai-context"));
const AIGovernanceNamespace = lazy(() => import("@/pages/blog/ai-governance-namespace-unified-terminology"));
const RAGWithoutInfrastructure = lazy(() => import("@/pages/blog/RAGWithoutInfrastructure"));
const AgentMemoryAntiPatterns = lazy(() => import("@/pages/blog/AgentMemoryAntiPatterns"));
const LangChainMemoryIntegration = lazy(() => import("@/pages/blog/LangChainMemoryIntegration"));
const WhyAgentsForget = lazy(() => import("@/pages/blog/WhyAgentsForget"));
const BuildingAgentsThatLearn = lazy(() => import("@/pages/blog/BuildingAgentsThatLearn"));
const MachineProtocolStandards = lazy(() => import("@/pages/blog/MachineProtocolStandards"));
const SpartaEpochRebuild = lazy(() => import("@/pages/blog/SpartaEpochRebuild"));
const AutonomousAIGovernance = lazy(() => import("@/pages/blog/AutonomousAIGovernance"));
const AdversarialAIDefense = lazy(() => import("@/pages/blog/AdversarialAIDefense"));
const ClocklessAccountSetupGuide = lazy(() => import("@/pages/blog/ClocklessAccountSetupGuide"));
const ClocklessWhatMakesItDifferent = lazy(() => import("@/pages/blog/ClocklessWhatMakesItDifferent"));
const ClocklessModulesDeepDive = lazy(() => import("@/pages/blog/ClocklessModulesDeepDive"));
const AutoBlogPost = lazy(() => import("@/pages/blog/AutoBlogPost"));

export const blogRoutes = (
  <>
    {/* Memory Stream Series */}
    <Route path="/blog/memory-stream-crystallization-guide" element={<MemoryStreamCrystallizationGuide />} />
    <Route path="/blog/signal-to-silicon-narrative" element={<SignalToSiliconNarrative />} />
    <Route path="/blog/memory-stream-tier-anatomy-rarity" element={<MemoryStreamTierAnatomy />} />
    <Route path="/blog/memory-stream-vault-mastery" element={<MemoryStreamVaultMastery />} />
    <Route path="/blog/autonomous-discovery-engine-architecture" element={<AutonomousDiscoveryEngine />} />

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

    {/* CMPSBL-branded redirects */}
    <Route path="/blog/cmpsbl-defense-ai-security" element={<PromptFluidDefense />} />
    <Route path="/blog/cmpsbl-brain-adaptive-learning-core" element={<PromptFluidBrain />} />
    <Route path="/blog/cmpsbl-vision-unified-dashboard" element={<PromptFluidVision />} />
    <Route path="/blog/cmpsbl-ripple-network-integration" element={<PromptFluidRipple />} />
    <Route path="/blog/cmpsbl-access-identity-billing" element={<PromptFluidAccess />} />
    <Route path="/blog/cmpsbl-nexus-api-gateway" element={<PromptFluidNexus />} />
    <Route path="/blog/cmpsbl-studio-build-apps-that-think" element={<PromptFluidStudioGuide />} />
    <Route path="/blog/how-cmpsbl-works-substrate-ecosystem" element={<HowPromptFluidWorks />} />

    {/* Pillar/Cluster Posts */}
    <Route path="/blog/evolving-software-v6-breakthrough" element={<EvolvingSoftwareV6Breakthrough />} />
    <Route path="/blog/llms-txt-protocol-ai-context" element={<LLMsTxtProtocol />} />
    <Route path="/blog/ai-governance-namespace-unified-terminology" element={<AIGovernanceNamespace />} />

    {/* Developer Adoption */}
    <Route path="/blog/rag-without-infrastructure" element={<RAGWithoutInfrastructure />} />
    <Route path="/blog/agent-memory-anti-patterns" element={<AgentMemoryAntiPatterns />} />
    <Route path="/blog/langchain-memory-integration" element={<LangChainMemoryIntegration />} />
    <Route path="/blog/why-agents-forget" element={<WhyAgentsForget />} />
    <Route path="/blog/building-agents-that-learn" element={<BuildingAgentsThatLearn />} />

    {/* Technical Posts */}
    <Route path="/blog/machine-protocol-standards-architect-epoch" element={<MachineProtocolStandards />} />
    <Route path="/blog/autonomous-ai-governance-runtime-enforcement" element={<AutonomousAIGovernance />} />
    <Route path="/blog/adversarial-ai-defense-module-response-2026" element={<AdversarialAIDefense />} />
    <Route path="/blog/sparta-epoch-rebuild-from-scratch" element={<SpartaEpochRebuild />} />

    {/* Legacy slug redirects */}
    <Route path="/blog/machine-protocol-standards-v9" element={<Navigate to="/blog/machine-protocol-standards-architect-epoch" replace />} />
    <Route path="/blog/autonomous-ai-governance-v9" element={<Navigate to="/blog/autonomous-ai-governance-runtime-enforcement" replace />} />
    <Route path="/blog/adversarial-ai-defense-v9" element={<Navigate to="/blog/adversarial-ai-defense-module-response-2026" replace />} />

    {/* Clockless Posts */}
    <Route path="/blog/clockless-account-setup-artifact-packs" element={<ClocklessAccountSetupGuide />} />
    <Route path="/blog/clockless-what-makes-it-different" element={<ClocklessWhatMakesItDifferent />} />
    <Route path="/blog/clockless-modules-deep-dive" element={<ClocklessModulesDeepDive />} />

    {/* Dynamic AutoBlog */}
    <Route path="/blog/auto/:slug" element={<AutoBlogPost />} />
    <Route path="/blog/:slug" element={<AutoBlogPost />} />
  </>
);
