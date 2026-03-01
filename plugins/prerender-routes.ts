/**
 * prerender-routes.ts — Build-time route extraction from seoMap
 * 
 * This file imports seoMap data and converts it to the format
 * needed by the seo-prerender Vite plugin. It runs at build time only.
 * 
 * Kept separate from the runtime seoMap to avoid pulling React
 * dependencies into the Vite config.
 */

// We duplicate the essential route data here rather than importing
// from src/ to avoid pulling in the full app dependency tree at build time.
// This is synced from src/lib/seo/seoMap.ts — keep in sync.

const OG_BASE = 'https://cmpsbl.com';

interface PrerenderRoute {
  path: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  keywords: string[];
  noindex?: boolean;
}

/**
 * All public routes that should get static HTML shells.
 * Only include indexable routes (noindex: false or undefined).
 */
export const prerenderRoutes: PrerenderRoute[] = [
  // ── Core Public ──
  { path: '/', title: 'Composable AI Infrastructure | CMPSBL', description: 'Governed cognitive infrastructure where intelligence persists, adapts, and compounds. Modular AI substrate for agentic systems that learn.', ogTitle: 'CMPSBL — Composable AI Infrastructure', ogDescription: 'Governed cognitive architecture where intelligence persists and compounds.', ogImage: `${OG_BASE}/og/home.jpg`, keywords: ['composable AI', 'cognitive infrastructure', 'AI substrate', 'agentic AI platform'] },
  { path: '/os', title: 'AI Substrate Runtime | CMPSBL', description: 'Real-time telemetry, autonomous orchestration, and modular cognitive workload management.', ogTitle: 'AI Substrate Runtime — CMPSBL', ogDescription: 'Real-time telemetry and autonomous orchestration for cognitive workloads.', ogImage: `${OG_BASE}/og/substrate-os.jpg`, keywords: ['AI substrate runtime', 'cognitive orchestration'] },
  { path: '/ai-operating-system', title: 'AI Operating System | CMPSBL', description: 'How an AI operating system unifies memory, routing, security, and orchestration into one cognitive runtime.', ogTitle: 'The AI Operating System — CMPSBL', ogDescription: 'Unified memory, routing, security, and orchestration in one runtime.', ogImage: `${OG_BASE}/og/substrate-os.jpg`, keywords: ['AI operating system', 'cognitive runtime'] },
  { path: '/modules', title: 'Substrate Modules — AI Architecture | CMPSBL', description: 'Browse core modules across kernel, cognitive, operational, and infrastructure layers.', ogTitle: 'Substrate Modules — CMPSBL', ogDescription: 'Explore every module from BRAIN to DEFENSE — organized by layer.', ogImage: `${OG_BASE}/og/modules.jpg`, keywords: ['substrate modules', 'modular AI architecture'] },
  { path: '/store', title: 'AI Artifact Store — Capabilities | CMPSBL', description: 'Access tier-scoped capabilities, synergy pipelines, and templates.', ogTitle: 'Composable Artifact Store — CMPSBL', ogDescription: 'Browse and deploy capabilities, templates, and synergy pipelines.', ogImage: `${OG_BASE}/og/store.jpg`, keywords: ['composable AI artifacts', 'AI capabilities store'] },
  { path: '/composable-cognitives', title: 'Composable Cognitives — AI Agents | CMPSBL', description: 'Build, buy, and deploy cognitive agents you own permanently.', ogTitle: 'Composable Cognitives — Own Your AI', ogDescription: 'Portable cognitive agents you download once and run anywhere.', ogImage: `${OG_BASE}/og/cognitives.jpg`, keywords: ['composable cognitives', 'AI agents'] },
  { path: '/engines', title: 'AI Orchestration Engines | CMPSBL', description: 'Pre-validated orchestration engines for enterprise AI workloads.', ogTitle: 'AI Orchestration Engines — CMPSBL', ogDescription: 'Pre-validated orchestration engines for enterprise cognitive workloads.', ogImage: `${OG_BASE}/og/engines.jpg`, keywords: ['AI orchestration engines'] },
  { path: '/persistent-memory', title: 'Persistent Memory for AI Agents | CMPSBL', description: 'Add persistent memory to any AI agent in under an hour. Free tier available.', ogTitle: 'Persistent Memory — Any AI Agent', ogDescription: 'Give your AI agent permanent memory in under an hour.', ogImage: `${OG_BASE}/og/persistent-memory.jpg`, keywords: ['persistent memory AI', 'agent memory API'] },
  { path: '/decode', title: 'DECODE — Natural Language AI Terminal', description: 'Interact with the cognitive substrate through natural language.', ogTitle: 'DECODE — Talk to Your Substrate', ogDescription: 'A natural language terminal that translates intent into operations.', ogImage: `${OG_BASE}/og/decode.jpg`, keywords: ['DECODE engine', 'natural language terminal'] },
  { path: '/feed-dream-eater', title: 'Dream Feeder — Autonomous Learning | CMPSBL', description: 'Autonomous learning system that processes experience into heuristic improvements during idle cycles.', ogTitle: 'Dream Feeder — AI That Learns While Idle', ogDescription: 'Autonomous dream cycles converting experience into intelligence.', ogImage: `${OG_BASE}/og/dream-feeder.jpg`, keywords: ['autonomous AI learning', 'AI dream cycles'] },
  { path: '/proof', title: 'Proof Mode — Verifiable AI Execution', description: 'Cryptographic proof of every AI operation. Tamper-evident execution records.', ogTitle: 'Proof Mode — Verifiable AI', ogDescription: 'Tamper-evident proof of every cognitive operation for compliance.', ogImage: `${OG_BASE}/og/proof.jpg`, keywords: ['verifiable AI', 'AI proof mode'] },
  { path: '/demo', title: 'Live Demo — CMPSBL Substrate in Action', description: 'See the cognitive substrate live: module orchestration, dream cycles, and adaptive inference.', ogTitle: 'See CMPSBL in Action — Live Demo', ogDescription: 'Interactive demo of modular cognitive orchestration.', ogImage: `${OG_BASE}/og/home.jpg`, keywords: ['CMPSBL demo', 'AI substrate demo'] },
  { path: '/gaming', title: 'Gaming AI — Cognitive NPCs | CMPSBL', description: 'Power game NPCs with persistent memory, adaptive behavior, and dream-cycle learning.', ogTitle: 'Gaming AI — NPCs That Learn', ogDescription: 'Cognitive NPC engines with persistent memory and adaptive behavior.', ogImage: `${OG_BASE}/og/gaming.jpg`, keywords: ['gaming AI', 'cognitive NPC'] },
  { path: '/evolution', title: 'EVOLUTION Control Center — Governed AI Improvement | CMPSBL', description: 'Connect your AI agent and evolve your codebase safely. Dry-run previews, one-click rollback, receipted changes, and governed self-improvement.', ogTitle: 'EVOLUTION — Governed Self-Improvement for Your Codebase', ogDescription: 'Connect an AI agent. Preview changes. Evolve safely. Every cycle is receipted and rollback-safe.', ogImage: `${OG_BASE}/og/evolution.jpg`, keywords: ['AI code evolution', 'governed self-improvement', 'codebase evolution'] },

  // ── Developer / Docs ──
  { path: '/developers', title: 'Developer Hub — SDKs & APIs | CMPSBL', description: 'Everything developers need: SDKs, REST APIs, webhooks, and integration guides.', ogTitle: 'CMPSBL Developer Hub', ogDescription: 'SDKs, APIs, webhooks, and integration guides for the substrate.', ogImage: `${OG_BASE}/og/developers.jpg`, keywords: ['AI developer hub', 'AI SDK'] },
  { path: '/documentation', title: 'Documentation — Developer Guide | CMPSBL', description: 'Complete technical documentation: module reference, API specs, configuration guides.', ogTitle: 'CMPSBL Documentation', ogDescription: 'Complete API reference, module docs, and deployment guides.', ogImage: `${OG_BASE}/og/documentation.jpg`, keywords: ['CMPSBL documentation'] },
  { path: '/academy', title: 'Developer Academy — AI Tutorials | CMPSBL', description: 'Learn to build on the substrate with interactive tutorials.', ogTitle: 'Developer Academy — CMPSBL', ogDescription: 'Interactive tutorials from beginner to advanced substrate development.', ogImage: `${OG_BASE}/og/academy.jpg`, keywords: ['AI developer academy'] },
  { path: '/changelog', title: 'Changelog — Update History | CMPSBL', description: 'Track every update to the CMPSBL substrate.', ogTitle: 'Changelog — What\'s New in CMPSBL', ogDescription: 'Complete update history for the cognitive substrate.', ogImage: `${OG_BASE}/og/documentation.jpg`, keywords: ['CMPSBL changelog'] },

  // ── Enterprise / Pricing ──
  { path: '/solutions', title: 'Enterprise AI Solutions | CMPSBL', description: 'Enterprise-ready cognitive infrastructure for healthcare, finance, legal, and manufacturing.', ogTitle: 'Enterprise AI Solutions — CMPSBL', ogDescription: 'Industry-specific cognitive infrastructure with compliance and on-prem.', ogImage: `${OG_BASE}/og/solutions.jpg`, keywords: ['enterprise AI solutions'] },
  { path: '/pricing', title: 'Pricing — Free Through Enterprise | CMPSBL', description: 'Transparent pricing for every team size. Free tier with persistent memory.', ogTitle: 'CMPSBL Pricing — Start Free', ogDescription: 'Transparent pricing for cognitive infrastructure at every scale.', ogImage: `${OG_BASE}/og/pricing.jpg`, keywords: ['CMPSBL pricing'] },
  { path: '/investors', title: 'Acquisition Opportunity | CMPSBL®', description: 'CMPSBL represents a generational acquisition: deep R&D, defensible IP, and composable cognitive infrastructure.', ogTitle: 'Investment & Acquisition — CMPSBL', ogDescription: 'Deep R&D, defensible IP, and cognitive infrastructure.', ogImage: `${OG_BASE}/og/investors.jpg`, keywords: ['CMPSBL acquisition'] },
  { path: '/marketplace', title: 'AI Marketplace — Templates | CMPSBL', description: 'Browse community and first-party templates, integrations, and pre-built cognitive workflows.', ogTitle: 'CMPSBL Marketplace', ogDescription: 'Templates, integrations, and pre-built cognitive workflows.', ogImage: `${OG_BASE}/og/store.jpg`, keywords: ['AI marketplace'] },

  // ── Company / About ──
  { path: '/about', title: 'About CMPSBL — Founded 2009, Dallas TX', description: 'CMPSBL was founded in 2009 by Kenneth E Sweet Jr — building governed, composable AI infrastructure.', ogTitle: 'About CMPSBL — Our Origin Story', ogDescription: 'From 2009 — building cognitive infrastructure for AI applications.', ogImage: `${OG_BASE}/og/about.jpg`, keywords: ['about CMPSBL', 'Kenneth Sweet'] },
  { path: '/contact', title: 'Contact CMPSBL — Get in Touch', description: 'Reach the CMPSBL team for partnerships, enterprise inquiries, support, or press.', ogTitle: 'Contact CMPSBL', ogDescription: 'Get in touch for partnerships, enterprise inquiries, or press.', ogImage: `${OG_BASE}/og/about.jpg`, keywords: ['contact CMPSBL'] },
  { path: '/blog', title: 'Blog — AI Research & Insights | CMPSBL', description: 'Research, deep-dives, and engineering insights on cognitive architecture, AI memory systems, and agentic AI.', ogTitle: 'CMPSBL Blog — AI Research', ogDescription: 'Deep-dives on cognitive architecture, AI memory, and substrate engineering.', ogImage: `${OG_BASE}/og/blog.jpg`, keywords: ['AI infrastructure blog'] },

  // ── Legal ──
  { path: '/privacy', title: 'Privacy Policy | CMPSBL', description: 'How CMPSBL handles your data, cookie usage, and privacy rights under GDPR and CCPA.', ogTitle: 'Privacy Policy — CMPSBL', ogDescription: 'Data handling, cookie usage, and privacy rights.', ogImage: `${OG_BASE}/og/about.jpg`, keywords: ['CMPSBL privacy policy'] },
  { path: '/terms', title: 'Terms of Service | CMPSBL', description: 'Legal terms governing use of the CMPSBL platform, APIs, and cognitive infrastructure services.', ogTitle: 'Terms of Service — CMPSBL', ogDescription: 'Terms governing CMPSBL platform usage.', ogImage: `${OG_BASE}/og/about.jpg`, keywords: ['CMPSBL terms of service'] },

  // ── Standards ──
  { path: '/namespace', title: 'Namespace — AI Terminology Standard | CMPSBL', description: 'The AIGVRN namespace: a standardized vocabulary for AI governance, operations, and module classification.', ogTitle: 'AI Governance Namespace — CMPSBL', ogDescription: 'Standardized vocabulary for AI systems.', ogImage: `${OG_BASE}/og/architecture.jpg`, keywords: ['AI namespace', 'AIGVRN'] },
  { path: '/architecture', title: 'Architecture — Five-Layer Design | CMPSBL', description: 'Deep dive into the five-layer substrate architecture: Kernel, Cognitive, Operational, Admin, and Orchestrator.', ogTitle: 'Substrate Architecture — CMPSBL', ogDescription: 'Five-layer cognitive architecture deep dive.', ogImage: `${OG_BASE}/og/architecture.jpg`, keywords: ['AI architecture', 'five-layer design'] },
];
