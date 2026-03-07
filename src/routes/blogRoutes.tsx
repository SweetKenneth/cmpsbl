/**
 * Blog Routes — Canonical routes + legacy redirects
 */
import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";

// ─── Canonical Posts (chronological substrate story) ───
const TheFirstLineOfCode = lazy(() => import("@/pages/blog/TheFirstLineOfCode"));
const RoutingTheUnknown = lazy(() => import("@/pages/blog/RoutingTheUnknown"));
const TeachingMachinesToRemember = lazy(() => import("@/pages/blog/TeachingMachinesToRemember"));
const WhenBotsFoundUsFirst = lazy(() => import("@/pages/blog/WhenBotsFoundUsFirst"));
const SeeingEverythingAtOnce = lazy(() => import("@/pages/blog/SeeingEverythingAtOnce"));
const NodesThatTalk = lazy(() => import("@/pages/blog/NodesThatTalk"));
const IdentityAtEveryLayer = lazy(() => import("@/pages/blog/IdentityAtEveryLayer"));
const WhatIfSoftwareCouldDream = lazy(() => import("@/pages/blog/WhatIfSoftwareCouldDream"));
const BuildingOnTheSubstrate = lazy(() => import("@/pages/blog/BuildingOnTheSubstrate"));
const WhyAgentsForget = lazy(() => import("@/pages/blog/WhyAgentsForgetRewrite"));
const HowWeCompare = lazy(() => import("@/pages/blog/HowWeCompare"));
const AgentsThatActuallyLearn = lazy(() => import("@/pages/blog/AgentsThatActuallyLearn"));
const TheBotWars = lazy(() => import("@/pages/blog/TheBotWars"));
const CybersecurityThroughCognition = lazy(() => import("@/pages/blog/CybersecurityThroughCognition"));
const AccessibilityIsInfrastructure = lazy(() => import("@/pages/blog/AccessibilityIsInfrastructure"));
const TheGovernanceQuestion = lazy(() => import("@/pages/blog/TheGovernanceQuestion"));
const ProtocolsForMachines = lazy(() => import("@/pages/blog/ProtocolsForMachines"));
const WhenSoftwareStartsEvolving = lazy(() => import("@/pages/blog/WhenSoftwareStartsEvolving"));
const BurningItDown = lazy(() => import("@/pages/blog/BurningItDown"));
const SignalToSilicon = lazy(() => import("@/pages/blog/SignalToSilicon"));
const AutoBlogPost = lazy(() => import("@/pages/blog/AutoBlogPost"));

export const blogRoutes = (
  <>
    {/* ═══ CANONICAL ROUTES ═══ */}
    <Route path="/blog/the-first-line-of-code" element={<TheFirstLineOfCode />} />
    <Route path="/blog/routing-the-unknown" element={<RoutingTheUnknown />} />
    <Route path="/blog/teaching-machines-to-remember" element={<TeachingMachinesToRemember />} />
    <Route path="/blog/when-bots-found-us-first" element={<WhenBotsFoundUsFirst />} />
    <Route path="/blog/seeing-everything-at-once" element={<SeeingEverythingAtOnce />} />
    <Route path="/blog/nodes-that-talk" element={<NodesThatTalk />} />
    <Route path="/blog/identity-at-every-layer" element={<IdentityAtEveryLayer />} />
    <Route path="/blog/what-if-software-could-dream" element={<WhatIfSoftwareCouldDream />} />
    <Route path="/blog/building-on-the-substrate" element={<BuildingOnTheSubstrate />} />
    <Route path="/blog/why-agents-forget" element={<WhyAgentsForget />} />
    <Route path="/blog/how-we-compare" element={<HowWeCompare />} />
    <Route path="/blog/agents-that-actually-learn" element={<AgentsThatActuallyLearn />} />
    <Route path="/blog/the-bot-wars" element={<TheBotWars />} />
    <Route path="/blog/cybersecurity-through-cognition" element={<CybersecurityThroughCognition />} />
    <Route path="/blog/accessibility-is-infrastructure" element={<AccessibilityIsInfrastructure />} />
    <Route path="/blog/the-governance-question" element={<TheGovernanceQuestion />} />
    <Route path="/blog/protocols-for-machines" element={<ProtocolsForMachines />} />
    <Route path="/blog/when-software-starts-evolving" element={<WhenSoftwareStartsEvolving />} />
    <Route path="/blog/burning-it-down" element={<BurningItDown />} />
    <Route path="/blog/signal-to-silicon" element={<SignalToSilicon />} />

    {/* ═══ LEGACY SLUG REDIRECTS ═══ */}
    {/* Memory Stream / Signal series */}
    <Route path="/blog/memory-stream-crystallization-guide" element={<Navigate to="/blog/signal-to-silicon" replace />} />
    <Route path="/blog/signal-to-silicon-narrative" element={<Navigate to="/blog/signal-to-silicon" replace />} />
    <Route path="/blog/memory-stream-tier-anatomy-rarity" element={<Navigate to="/blog/signal-to-silicon" replace />} />
    <Route path="/blog/memory-stream-vault-mastery" element={<Navigate to="/blog/signal-to-silicon" replace />} />
    <Route path="/blog/autonomous-discovery-engine-architecture" element={<Navigate to="/blog/when-software-starts-evolving" replace />} />

    {/* Security / Bot defense */}
    <Route path="/blog/wordpress-bot-defense" element={<Navigate to="/blog/when-bots-found-us-first" replace />} />
    <Route path="/blog/top-security-plugins-2025" element={<Navigate to="/blog/cybersecurity-through-cognition" replace />} />
    <Route path="/blog/ai-cybersecurity-evolution-2025" element={<Navigate to="/blog/cybersecurity-through-cognition" replace />} />
    <Route path="/blog/ai-hackers-underground-2025" element={<Navigate to="/blog/the-bot-wars" replace />} />
    <Route path="/blog/adversarial-ai-defense-module-response-2026" element={<Navigate to="/blog/cybersecurity-through-cognition" replace />} />
    <Route path="/blog/adversarial-ai-defense-v9" element={<Navigate to="/blog/cybersecurity-through-cognition" replace />} />

    {/* Platform / How it works */}
    <Route path="/blog/promptfluid-market-disruptor" element={<Navigate to="/blog/the-first-line-of-code" replace />} />
    <Route path="/blog/how-promptfluid-works-cascade-ai-ecosystem" element={<Navigate to="/blog/the-first-line-of-code" replace />} />
    <Route path="/blog/how-cmpsbl-works-substrate-ecosystem" element={<Navigate to="/blog/the-first-line-of-code" replace />} />
    <Route path="/blog/product-roadmap-2025" element={<Navigate to="/blog/when-software-starts-evolving" replace />} />
    <Route path="/blog/ai-product-comparison-2025" element={<Navigate to="/blog/how-we-compare" replace />} />
    <Route path="/blog/ai-automation-trends-2025" element={<Navigate to="/blog/building-on-the-substrate" replace />} />
    <Route path="/blog/ai-business-operations-2025" element={<Navigate to="/blog/building-on-the-substrate" replace />} />
    <Route path="/blog/evolving-software-v6-breakthrough" element={<Navigate to="/blog/when-software-starts-evolving" replace />} />

    {/* Node-specific legacy */}
    <Route path="/blog/cascade-ai-adaptive-intelligence-brain" element={<Navigate to="/blog/what-if-software-could-dream" replace />} />
    <Route path="/blog/ai-triad-intelligent-routing" element={<Navigate to="/blog/routing-the-unknown" replace />} />
    <Route path="/blog/promptfluid-brain-adaptive-learning-core" element={<Navigate to="/blog/teaching-machines-to-remember" replace />} />
    <Route path="/blog/cmpsbl-brain-adaptive-learning-core" element={<Navigate to="/blog/teaching-machines-to-remember" replace />} />
    <Route path="/blog/promptfluid-vision-unified-dashboard" element={<Navigate to="/blog/seeing-everything-at-once" replace />} />
    <Route path="/blog/cmpsbl-vision-unified-dashboard" element={<Navigate to="/blog/seeing-everything-at-once" replace />} />
    <Route path="/blog/promptfluid-defense-ai-security" element={<Navigate to="/blog/when-bots-found-us-first" replace />} />
    <Route path="/blog/cmpsbl-defense-ai-security" element={<Navigate to="/blog/when-bots-found-us-first" replace />} />
    <Route path="/blog/promptfluid-ripple-network-integration" element={<Navigate to="/blog/nodes-that-talk" replace />} />
    <Route path="/blog/cmpsbl-ripple-network-integration" element={<Navigate to="/blog/nodes-that-talk" replace />} />
    <Route path="/blog/promptfluid-access-identity-billing" element={<Navigate to="/blog/identity-at-every-layer" replace />} />
    <Route path="/blog/cmpsbl-access-identity-billing" element={<Navigate to="/blog/identity-at-every-layer" replace />} />
    <Route path="/blog/promptfluid-nexus-api-gateway" element={<Navigate to="/blog/routing-the-unknown" replace />} />
    <Route path="/blog/cmpsbl-nexus-api-gateway" element={<Navigate to="/blog/routing-the-unknown" replace />} />
    <Route path="/blog/promptfluid-studio-build-apps-that-think" element={<Navigate to="/blog/building-on-the-substrate" replace />} />
    <Route path="/blog/cmpsbl-studio-build-apps-that-think" element={<Navigate to="/blog/building-on-the-substrate" replace />} />

    {/* Dream / Press */}
    <Route path="/blog/ai-systems-that-dream-press-release" element={<Navigate to="/blog/what-if-software-could-dream" replace />} />
    <Route path="/blog/promptfluid-first-ai-dreaming-systems" element={<Navigate to="/blog/what-if-software-could-dream" replace />} />

    {/* Accessibility */}
    <Route path="/blog/inclusive-module-accessibility-mission" element={<Navigate to="/blog/accessibility-is-infrastructure" replace />} />
    <Route path="/blog/clarity-accessibility-mission" element={<Navigate to="/blog/accessibility-is-infrastructure" replace />} />
    <Route path="/blog/accessibility-free-for-all" element={<Navigate to="/blog/accessibility-is-infrastructure" replace />} />
    <Route path="/blog/wordpress-accessibility-guide" element={<Navigate to="/blog/accessibility-is-infrastructure" replace />} />
    <Route path="/blog/wcag-2-2-wordpress-changes" element={<Navigate to="/blog/accessibility-is-infrastructure" replace />} />
    <Route path="/blog/automated-accessibility-fixes-wordpress" element={<Navigate to="/blog/accessibility-is-infrastructure" replace />} />

    {/* Governance / Protocol */}
    <Route path="/blog/autonomous-ai-governance-runtime-enforcement" element={<Navigate to="/blog/the-governance-question" replace />} />
    <Route path="/blog/autonomous-ai-governance-v9" element={<Navigate to="/blog/the-governance-question" replace />} />
    <Route path="/blog/ai-governance-namespace-unified-terminology" element={<Navigate to="/blog/the-governance-question" replace />} />
    <Route path="/blog/machine-protocol-standards-architect-epoch" element={<Navigate to="/blog/protocols-for-machines" replace />} />
    <Route path="/blog/machine-protocol-standards-v9" element={<Navigate to="/blog/protocols-for-machines" replace />} />
    <Route path="/blog/llms-txt-protocol-ai-context" element={<Navigate to="/blog/protocols-for-machines" replace />} />

    {/* Developer / Memory */}
    <Route path="/blog/rag-without-infrastructure" element={<Navigate to="/blog/teaching-machines-to-remember" replace />} />
    <Route path="/blog/agent-memory-anti-patterns" element={<Navigate to="/blog/why-agents-forget" replace />} />
    <Route path="/blog/langchain-memory-integration" element={<Navigate to="/blog/agents-that-actually-learn" replace />} />
    <Route path="/blog/building-agents-that-learn" element={<Navigate to="/blog/agents-that-actually-learn" replace />} />
    <Route path="/blog/sparta-epoch-rebuild-from-scratch" element={<Navigate to="/blog/burning-it-down" replace />} />

    {/* Clockless */}
    <Route path="/blog/clockless-account-setup-artifact-packs" element={<Navigate to="/blog/the-first-line-of-code" replace />} />
    <Route path="/blog/clockless-what-makes-it-different" element={<Navigate to="/blog/the-first-line-of-code" replace />} />
    <Route path="/blog/clockless-modules-deep-dive" element={<Navigate to="/blog/routing-the-unknown" replace />} />

    {/* Dynamic AutoBlog */}
    <Route path="/blog/auto/:slug" element={<AutoBlogPost />} />
    <Route path="/blog/:slug" element={<AutoBlogPost />} />
  </>
);
