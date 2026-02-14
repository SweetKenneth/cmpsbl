/**
 * seoMap.ts — Centralized SEO Metadata Registry
 * v9.1.0 ARCHITECT Epoch
 *
 * Single source of truth for every PUBLIC indexed page.
 * Each entry has a UNIQUE primary keyword — no cannibalization.
 */

export interface PageSEO {
  title: string;            // ≤60 chars, primary keyword early
  description: string;      // 140-160 chars, intent-matched
  ogTitle: string;           // social-optimized (can differ from title)
  ogDescription: string;    // social-friendly (can differ from description)
  ogImage: string;
  keywords: string[];        // 6-10 unique per page
  schema: 'home' | 'feature' | 'docs' | 'blog' | 'about' | 'legal' | 'contact' | 'product' | 'article';
  intent: string;
  primaryKeyword: string;
  noindex?: boolean;
}

const OG_BASE = 'https://cmpsbl.com';
const OG_DEFAULT = `${OG_BASE}/og-default.jpg`;
const OG_FEATURE = `${OG_BASE}/og-feature.jpg`;
const OG_DOCS = `${OG_BASE}/og-docs.jpg`;
const OG_BLOG = `${OG_BASE}/og-blog.jpg`;
const OG_ABOUT = `${OG_BASE}/og-about.jpg`;

/**
 * Master SEO map keyed by route path.
 * RULES:
 * - Every primaryKeyword is UNIQUE across the entire map
 * - Every title is UNIQUE
 * - Every description is UNIQUE
 */
export const seoMap: Record<string, PageSEO> = {
  // ═══════════════════════════════════════════════════
  // CORE PUBLIC
  // ═══════════════════════════════════════════════════
  '/': {
    title: 'CMPSBL® — Cognitive Infrastructure for AI',
    description: 'CMPSBL is the cognitive infrastructure layer powering persistent memory, self-learning, and multi-provider routing. 21 modules, 400+ capabilities.',
    ogTitle: 'CMPSBL — Where Machines Learn To Think',
    ogDescription: 'The AI operating system with persistent memory, dream cycles, and 21 integrated modules.',
    ogImage: OG_DEFAULT,
    keywords: ['cognitive infrastructure', 'AI operating system', 'persistent memory AI', 'self-learning AI', 'CMPSBL substrate', 'AI memory layer', 'multi-provider routing'],
    schema: 'home',
    intent: 'Brand/Category',
    primaryKeyword: 'cognitive infrastructure for AI',
  },
  '/os': {
    title: 'Substrate OS v9.1.0 — AI Operating System',
    description: 'Explore the CMPSBL Substrate OS: 21 runtime modules, real-time telemetry, and autonomous orchestration powering cognitive workloads.',
    ogTitle: 'Substrate OS — The Engine Behind Cognitive AI',
    ogDescription: 'Real-time telemetry, module health, and autonomous orchestration inside the AI operating system.',
    ogImage: OG_FEATURE,
    keywords: ['substrate OS', 'AI runtime', 'cognitive orchestration', 'module telemetry', 'AI workload management', 'substrate dashboard'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'AI substrate operating system',
  },
  '/ai-operating-system': {
    title: 'What Is an AI Operating System? — CMPSBL',
    description: 'The definitive guide to AI operating systems: how CMPSBL orchestrates memory, learning, defense, and 400+ capabilities in a unified runtime.',
    ogTitle: 'The AI Operating System — Explained',
    ogDescription: 'How a cognitive runtime orchestrates memory, learning, and multi-provider AI in one unified layer.',
    ogImage: OG_FEATURE,
    keywords: ['AI operating system definition', 'cognitive runtime', 'AI OS architecture', 'what is AI OS', 'unified AI platform', 'AIDO'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'AI operating system',
  },
  '/modules': {
    title: '21 Substrate Modules — AI Architecture | CMPSBL',
    description: 'Browse all 21 core modules across 6 layers: Kernel, Cognitive, Operational, Administrative, Orchestrator, and Infrastructure.',
    ogTitle: '21 Modules Powering the Substrate',
    ogDescription: 'Explore every module from BRAIN to DEFENSE — organized by architectural layer.',
    ogImage: OG_FEATURE,
    keywords: ['substrate modules', 'AI architecture layers', 'BRAIN module', 'DEFENSE module', 'cognitive layer', 'kernel modules', 'AI module catalog'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'AI substrate modules',
  },
  '/store': {
    title: 'Composable Artifacts — Capabilities & Pipelines',
    description: 'Access 400+ tier-scoped capabilities, synergy pipelines, and templates in the CMPSBL artifact marketplace.',
    ogTitle: 'Artifact Marketplace — 400+ AI Capabilities',
    ogDescription: 'Browse and deploy capabilities, templates, and synergy pipelines for your cognitive workloads.',
    ogImage: OG_FEATURE,
    keywords: ['AI capabilities marketplace', 'synergy pipelines', 'composable artifacts', 'AI templates', 'capability depot', 'CMPSBL store'],
    schema: 'product',
    intent: 'Feature/Capability',
    primaryKeyword: 'composable AI artifacts',
  },
  '/composable-cognitives': {
    title: 'Composable Cognitives — Own Your AI Agents',
    description: 'Build, buy, and deploy superpowered cognitive agents you own forever. Download once, run anywhere, no subscriptions.',
    ogTitle: 'Composable Cognitives — AI Agents You Own',
    ogDescription: 'Superpowered agents downloaded once and run anywhere — no lock-in, no subscriptions.',
    ogImage: OG_FEATURE,
    keywords: ['composable cognitives', 'AI agents download', 'own your AI', 'cognitive agents', 'portable AI agents', 'agent marketplace'],
    schema: 'product',
    intent: 'Feature/Capability',
    primaryKeyword: 'composable cognitive agents',
  },
  '/engines': {
    title: 'Engine Marketplace — Canonized Orchestrations',
    description: 'First-party canonized orchestration engines: pre-built AI workflows validated and versioned by CMPSBL engineering.',
    ogTitle: 'Engine Marketplace — OEM Orchestrations',
    ogDescription: 'Pre-validated orchestration engines for enterprise AI workloads.',
    ogImage: OG_FEATURE,
    keywords: ['AI engine marketplace', 'orchestration engines', 'canonized workflows', 'OEM AI engines', 'pre-built AI pipelines'],
    schema: 'product',
    intent: 'Feature/Capability',
    primaryKeyword: 'AI orchestration engines',
  },
  '/persistent-memory': {
    title: 'Persistent Memory for AI Agents — Free Tier',
    description: 'Add persistent memory to any AI agent in under an hour. Free tier available. Works with LangChain, CrewAI, and custom frameworks.',
    ogTitle: 'Persistent Memory — Add Memory to Any Agent',
    ogDescription: 'Give your AI agent a permanent memory in under an hour. Free.',
    ogImage: OG_FEATURE,
    keywords: ['persistent memory AI', 'agent memory', 'AI memory API', 'LangChain memory', 'free AI memory', 'agent state persistence'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'persistent memory for AI agents',
  },
  '/decode': {
    title: 'Decode Engine — Natural Language Terminal',
    description: 'Interact with the CMPSBL substrate through natural language commands. The Decode Engine translates intent into module actions.',
    ogTitle: 'Decode — Talk to Your Substrate',
    ogDescription: 'A natural language terminal that translates intent into substrate operations.',
    ogImage: OG_FEATURE,
    keywords: ['Decode engine', 'natural language terminal', 'AI CLI', 'substrate commands', 'intent-to-action', 'cognitive terminal'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'natural language AI terminal',
  },
  '/feed-dream-eater': {
    title: 'Dream Feeder — Autonomous Learning Cycles',
    description: 'Feed the Dream Eater: CMPSBL\'s autonomous learning system that processes experience data into heuristic improvements during idle cycles.',
    ogTitle: 'Dream Feeder — AI That Learns While Idle',
    ogDescription: 'Autonomous dream cycles that convert experience into intelligence.',
    ogImage: OG_FEATURE,
    keywords: ['dream cycles AI', 'autonomous learning', 'AI dream feeder', 'heuristic improvement', 'idle learning AI', 'self-improving AI'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'AI autonomous dream cycles',
  },
  '/proof': {
    title: 'Proof Mode — Verifiable AI Execution',
    description: 'Cryptographic proof of every AI operation. Proof Mode generates tamper-evident execution records for audit and compliance.',
    ogTitle: 'Proof Mode — Verifiable AI',
    ogDescription: 'Tamper-evident proof of every cognitive operation for enterprise compliance.',
    ogImage: OG_FEATURE,
    keywords: ['AI proof mode', 'verifiable AI', 'execution proof', 'AI audit trail', 'cryptographic AI logging', 'compliance AI'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'verifiable AI execution proof',
  },
  '/demo': {
    title: 'Live Demo — CMPSBL Substrate in Action',
    description: 'See the CMPSBL substrate in action: live module orchestration, dream cycles, and cognitive inference in a guided interactive demo.',
    ogTitle: 'See CMPSBL in Action — Live Demo',
    ogDescription: 'Interactive demo of the AI operating system with live orchestration.',
    ogImage: OG_DEFAULT,
    keywords: ['CMPSBL demo', 'AI demo', 'substrate demo', 'live AI demo', 'cognitive infrastructure demo'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'AI substrate live demo',
  },
  '/demos': {
    title: 'S-Tier Demos — Crown Jewel Showcases | CMPSBL',
    description: 'Experience unprecedented AI capabilities: self-healing architecture, cognitive provenance, sovereign execution, and the living module map.',
    ogTitle: 'S-Tier Demos — Unprecedented AI Capabilities',
    ogDescription: 'Self-healing, provenance chains, sovereign execution — see what no other platform can do.',
    ogImage: OG_DEFAULT,
    keywords: ['AI self-healing demo', 'cognitive provenance', 'sovereign AI execution', 'living architecture', 'S-tier AI showcase'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'S-tier AI capability demos',
  },
  '/lab': {
    title: 'Experimentation Lab — Test AI Hypotheses',
    description: 'A sandboxed environment to test, benchmark, and validate cognitive experiments before deploying to production substrate.',
    ogTitle: 'AI Experimentation Lab',
    ogDescription: 'Sandbox for testing cognitive experiments before production deployment.',
    ogImage: OG_FEATURE,
    keywords: ['AI experimentation lab', 'cognitive sandbox', 'AI benchmarking', 'test AI hypotheses', 'substrate lab'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'AI experimentation lab',
  },
  '/codelab': {
    title: 'CodeLab — Execute & Test in Real-Time',
    description: 'Write, execute, and test substrate operations in a live coding environment with real-time feedback and inline documentation.',
    ogTitle: 'CodeLab — Live AI Coding Environment',
    ogDescription: 'Write and test substrate code with real-time execution and inline docs.',
    ogImage: OG_DOCS,
    keywords: ['AI CodeLab', 'live coding AI', 'substrate code editor', 'real-time AI testing', 'interactive AI IDE'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'AI live coding environment',
  },
  '/forge': {
    title: 'Cognitive Forge — Build Custom AI Agents',
    description: 'Design, train, and deploy custom cognitive agents in the Forge. Drag-and-drop skill composition with automatic competency tracking.',
    ogTitle: 'Cognitive Forge — Build Your AI Agent',
    ogDescription: 'Drag-and-drop agent builder with skill composition and competency tracking.',
    ogImage: OG_FEATURE,
    keywords: ['cognitive forge', 'AI agent builder', 'custom AI agents', 'drag drop AI', 'agent composition tool', 'build AI agents'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'custom AI agent builder',
  },
  '/agency': {
    title: 'Agency Mint — Deploy AI Teams',
    description: 'Mint multi-agent AI teams from templates. Each agency includes coordinated roles, shared memory, and economic tracking.',
    ogTitle: 'Agency Mint — Launch AI Teams',
    ogDescription: 'Deploy coordinated multi-agent teams with shared memory and economics.',
    ogImage: OG_FEATURE,
    keywords: ['AI agency mint', 'multi-agent teams', 'AI team deployment', 'agent coordination', 'shared AI memory teams'],
    schema: 'product',
    intent: 'Feature/Capability',
    primaryKeyword: 'multi-agent AI team deployment',
  },
  '/gaming': {
    title: 'Gaming AI — Cognitive NPC & Game Logic',
    description: 'Power game NPCs with persistent memory, adaptive behavior, and dream-cycle learning. Built for Unreal, Unity, and custom engines.',
    ogTitle: 'Gaming AI — NPCs That Learn',
    ogDescription: 'Cognitive NPC engines with persistent memory and adaptive behavior for games.',
    ogImage: OG_FEATURE,
    keywords: ['gaming AI', 'cognitive NPC', 'AI game logic', 'persistent NPC memory', 'adaptive game AI', 'Unity AI NPC'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'cognitive gaming AI NPCs',
  },
  '/system-feed': {
    title: 'System Intelligence Feed — Real-Time Insights',
    description: 'Live feed of system-wide cognitive events, anomalies, and learning breakthroughs across all active substrate modules.',
    ogTitle: 'System Feed — Live AI Intelligence',
    ogDescription: 'Real-time cognitive events and anomalies from across the substrate.',
    ogImage: OG_FEATURE,
    keywords: ['AI system feed', 'real-time AI events', 'cognitive anomaly detection', 'substrate monitoring', 'AI intelligence feed'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'real-time AI system intelligence feed',
  },

  // ═══════════════════════════════════════════════════
  // DEVELOPER / DOCS
  // ═══════════════════════════════════════════════════
  '/developers': {
    title: 'Developer Hub — SDKs, APIs & Integrations',
    description: 'Everything developers need: SDKs, REST APIs, webhooks, and integration guides for building on the CMPSBL substrate.',
    ogTitle: 'CMPSBL Developer Hub',
    ogDescription: 'SDKs, APIs, webhooks, and integration guides for building on the substrate.',
    ogImage: OG_DOCS,
    keywords: ['CMPSBL developer hub', 'AI SDK', 'substrate API', 'AI integration guide', 'developer portal AI', 'cognitive API'],
    schema: 'docs',
    intent: 'Docs/Developer',
    primaryKeyword: 'CMPSBL developer SDK and API',
  },
  '/documentation': {
    title: 'Documentation — CMPSBL Developer Guide',
    description: 'Complete technical documentation for the CMPSBL substrate: module reference, API specs, configuration, and deployment guides.',
    ogTitle: 'CMPSBL Documentation',
    ogDescription: 'Complete API reference, module docs, and deployment guides for the substrate.',
    ogImage: OG_DOCS,
    keywords: ['CMPSBL documentation', 'substrate docs', 'AI API reference', 'module documentation', 'technical guide AI'],
    schema: 'docs',
    intent: 'Docs/Developer',
    primaryKeyword: 'CMPSBL technical documentation',
  },
  '/docs/persistent-memory': {
    title: 'Persistent Memory Quickstart — Integration Guide',
    description: 'Step-by-step guide to integrating persistent memory into your AI agent. Covers LangChain, CrewAI, and raw SDK approaches.',
    ogTitle: 'Persistent Memory Quickstart',
    ogDescription: 'Add persistent memory to your agent in 15 minutes — step-by-step guide.',
    ogImage: OG_DOCS,
    keywords: ['persistent memory quickstart', 'AI memory integration', 'LangChain memory guide', 'CrewAI memory', 'agent memory tutorial'],
    schema: 'docs',
    intent: 'Docs/Developer',
    primaryKeyword: 'persistent memory integration guide',
  },
  '/docs/substrate/capabilities': {
    title: 'Capabilities Reference — 400+ AI Functions',
    description: 'Complete reference for all 400+ substrate capabilities: parameters, tier availability, synergy compatibility, and usage examples.',
    ogTitle: 'Capability Reference — 400+ Functions',
    ogDescription: 'Browse the full catalog of AI capabilities with parameters and examples.',
    ogImage: OG_DOCS,
    keywords: ['AI capabilities reference', 'substrate functions', 'capability catalog', 'AI function reference', 'API capability docs'],
    schema: 'docs',
    intent: 'Docs/Developer',
    primaryKeyword: 'AI capabilities reference documentation',
  },
  '/academy': {
    title: 'Developer Academy — Interactive AI Tutorials',
    description: 'Learn to build on the substrate with interactive, AI-powered tutorials. From beginner agent builders to advanced orchestration.',
    ogTitle: 'Developer Academy — Learn AI Building',
    ogDescription: 'Interactive tutorials from beginner to advanced substrate development.',
    ogImage: OG_DOCS,
    keywords: ['AI developer academy', 'interactive AI tutorials', 'learn AI building', 'substrate training', 'cognitive development course'],
    schema: 'docs',
    intent: 'Docs/Developer',
    primaryKeyword: 'interactive AI developer tutorials',
  },
  '/devtools': {
    title: 'DevTools — Diagnostics & Developer Utilities',
    description: 'Debug and inspect your substrate in real-time: module state inspector, network tracer, memory explorer, and performance profiler.',
    ogTitle: 'CMPSBL DevTools — Debug Your AI',
    ogDescription: 'Real-time diagnostics and debugging utilities for the substrate.',
    ogImage: OG_DOCS,
    keywords: ['AI DevTools', 'substrate debugger', 'AI diagnostics', 'module inspector', 'cognitive performance profiler'],
    schema: 'docs',
    intent: 'Docs/Developer',
    primaryKeyword: 'AI substrate developer tools',
  },
  '/changelog': {
    title: 'Changelog — Substrate Version History',
    description: 'Track every update to the CMPSBL substrate: new modules, capabilities, patches, and architecture changes from v1.0 to v9.1.0.',
    ogTitle: 'Changelog — What\'s New in CMPSBL',
    ogDescription: 'Complete version history from v1.0 to v9.1.0 ARCHITECT Epoch.',
    ogImage: OG_DOCS,
    keywords: ['CMPSBL changelog', 'substrate updates', 'version history AI', 'AI platform changelog', 'v9.1.0 release notes'],
    schema: 'docs',
    intent: 'Docs/Developer',
    primaryKeyword: 'CMPSBL substrate changelog',
  },

  // ═══════════════════════════════════════════════════
  // ENTERPRISE / PRICING
  // ═══════════════════════════════════════════════════
  '/solutions': {
    title: 'Enterprise AI Solutions — Industry Applications',
    description: 'Enterprise-ready cognitive infrastructure for healthcare, finance, legal, and manufacturing. SOC 2 compliant, on-prem available.',
    ogTitle: 'Enterprise AI Solutions by CMPSBL',
    ogDescription: 'Industry-specific cognitive infrastructure with compliance and on-prem deployment.',
    ogImage: OG_FEATURE,
    keywords: ['enterprise AI solutions', 'industry AI applications', 'SOC 2 AI', 'healthcare AI', 'finance AI platform', 'on-prem AI'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'enterprise AI solutions',
  },
  '/use-cases': {
    title: 'Use Cases — How Teams Deploy CMPSBL',
    description: 'Real-world use cases: autonomous research agencies, code review pipelines, customer support agents, and self-healing infrastructure.',
    ogTitle: 'AI Use Cases — Real Deployments',
    ogDescription: 'See how teams deploy autonomous research, code review, and self-healing AI.',
    ogImage: OG_FEATURE,
    keywords: ['AI use cases', 'autonomous research AI', 'code review AI', 'customer support AI agents', 'self-healing AI infrastructure'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'AI use cases and deployments',
  },
  '/pricing': {
    title: 'Pricing — Free, Builder, Pro & Enterprise Tiers',
    description: 'Transparent pricing for every team size. Free tier with persistent memory, Builder for production, Pro for scale, Enterprise for compliance.',
    ogTitle: 'CMPSBL Pricing — Start Free',
    ogDescription: 'Free tier to Enterprise: transparent pricing for cognitive infrastructure.',
    ogImage: OG_DEFAULT,
    keywords: ['CMPSBL pricing', 'AI platform pricing', 'free AI tier', 'enterprise AI pricing', 'cognitive infrastructure cost'],
    schema: 'product',
    intent: 'Pricing/Plans',
    primaryKeyword: 'CMPSBL pricing plans',
  },
  '/substrate/licensing': {
    title: 'Licensing — Enterprise Agreements & OEM',
    description: 'Enterprise licensing for the CMPSBL substrate: volume agreements, OEM embedding, white-label options, and dedicated support.',
    ogTitle: 'Enterprise Licensing — CMPSBL',
    ogDescription: 'Volume licensing, OEM embedding, and white-label agreements for enterprises.',
    ogImage: OG_FEATURE,
    keywords: ['AI enterprise licensing', 'OEM AI agreement', 'white-label AI', 'substrate licensing', 'volume AI license'],
    schema: 'product',
    intent: 'Pricing/Plans',
    primaryKeyword: 'enterprise AI licensing agreement',
  },
  '/intelligence': {
    title: 'Substrate Intelligence — Technology Proof',
    description: 'Deep-dive into the substrate\'s architectural proof: benchmarks, module interaction graphs, and capability coverage analysis.',
    ogTitle: 'Substrate Intelligence — Proof of Architecture',
    ogDescription: 'Benchmarks, interaction graphs, and capability coverage for the substrate.',
    ogImage: OG_FEATURE,
    keywords: ['substrate intelligence', 'AI architecture proof', 'AI benchmarks', 'capability coverage', 'technology validation AI'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'AI architecture intelligence proof',
  },
  '/investors': {
    title: 'Acquisition Opportunity — CMPSBL® Substrate',
    description: 'CMPSBL represents a generational acquisition opportunity: 17 years of R&D, 21 modules, 400+ capabilities, and defensible IP.',
    ogTitle: 'Investment & Acquisition — CMPSBL',
    ogDescription: '17 years of R&D, 21 modules, 400+ capabilities — a generational acquisition opportunity.',
    ogImage: OG_ABOUT,
    keywords: ['CMPSBL acquisition', 'AI startup investment', 'cognitive infrastructure acquisition', 'AI IP portfolio', 'strategic AI acquisition'],
    schema: 'about',
    intent: 'About/Trust',
    primaryKeyword: 'CMPSBL acquisition opportunity',
  },
  '/marketplace': {
    title: 'Marketplace — AI Templates & Integrations',
    description: 'Browse community and first-party templates, integrations, and pre-built cognitive workflows in the CMPSBL marketplace.',
    ogTitle: 'CMPSBL Marketplace',
    ogDescription: 'Templates, integrations, and pre-built cognitive workflows.',
    ogImage: OG_FEATURE,
    keywords: ['AI marketplace', 'cognitive templates', 'AI integrations marketplace', 'pre-built AI workflows', 'CMPSBL marketplace'],
    schema: 'product',
    intent: 'Feature/Capability',
    primaryKeyword: 'AI templates marketplace',
  },

  // ═══════════════════════════════════════════════════
  // COMPANY / ABOUT / TRUST
  // ═══════════════════════════════════════════════════
  '/about': {
    title: 'About CMPSBL — Founded 2009, Dallas TX',
    description: 'CMPSBL was founded in 2009 by Kenneth E Sweet Jr. From Dallas, TX to a 21-module cognitive infrastructure powering the future of AI.',
    ogTitle: 'About CMPSBL — Our Origin Story',
    ogDescription: 'From 2009 to 21 modules — the story of building cognitive infrastructure for AI.',
    ogImage: OG_ABOUT,
    keywords: ['about CMPSBL', 'Kenneth Sweet', 'CMPSBL founder', 'Dallas AI company', 'cognitive infrastructure story', 'AI startup Texas'],
    schema: 'about',
    intent: 'About/Trust',
    primaryKeyword: 'about CMPSBL founder story',
  },
  '/contact': {
    title: 'Contact CMPSBL — Get in Touch',
    description: 'Reach the CMPSBL team for partnerships, enterprise inquiries, support, or press. Based in Dallas, TX — serving teams worldwide.',
    ogTitle: 'Contact CMPSBL',
    ogDescription: 'Get in touch for partnerships, enterprise inquiries, or press.',
    ogImage: OG_ABOUT,
    keywords: ['contact CMPSBL', 'AI partnership inquiry', 'enterprise AI contact', 'CMPSBL support', 'Dallas AI company contact'],
    schema: 'contact',
    intent: 'Contact',
    primaryKeyword: 'contact CMPSBL team',
  },
  '/support': {
    title: 'Support — Help & Resources | CMPSBL',
    description: 'Get help with the CMPSBL substrate: knowledge base, ticket system, community forums, and direct engineering support for Enterprise tier.',
    ogTitle: 'CMPSBL Support Center',
    ogDescription: 'Knowledge base, tickets, and direct engineering support.',
    ogImage: OG_ABOUT,
    keywords: ['CMPSBL support', 'AI platform help', 'substrate troubleshooting', 'CMPSBL knowledge base', 'AI support tickets'],
    schema: 'contact',
    intent: 'Contact',
    primaryKeyword: 'CMPSBL support center',
  },

  // ═══════════════════════════════════════════════════
  // BLOG / CONTENT
  // ═══════════════════════════════════════════════════
  '/blog': {
    title: 'Blog — AI Infrastructure Research & Insights',
    description: 'Research, deep-dives, and engineering insights on cognitive infrastructure, AI memory, governance, and the ARCHITECT Epoch.',
    ogTitle: 'CMPSBL Blog — AI Research & Insights',
    ogDescription: 'Deep-dives on cognitive infrastructure, AI memory, and substrate engineering.',
    ogImage: OG_BLOG,
    keywords: ['CMPSBL blog', 'AI infrastructure blog', 'cognitive AI research', 'AI memory insights', 'substrate engineering blog'],
    schema: 'blog',
    intent: 'Blog/Changelog/Updates',
    primaryKeyword: 'AI infrastructure research blog',
  },
  '/publication': {
    title: 'Publication — Research Papers & Whitepapers',
    description: 'Peer-reviewed research and whitepapers on cognitive infrastructure, dream-cycle learning, and autonomous system architecture.',
    ogTitle: 'CMPSBL Publications',
    ogDescription: 'Research papers on cognitive infrastructure and autonomous AI systems.',
    ogImage: OG_BLOG,
    keywords: ['AI research papers', 'cognitive infrastructure whitepaper', 'dream cycle research', 'autonomous AI paper', 'CMPSBL publications'],
    schema: 'blog',
    intent: 'Blog/Changelog/Updates',
    primaryKeyword: 'AI cognitive infrastructure research papers',
  },
  '/library': {
    title: 'Library — Documentation & Knowledge Archive',
    description: 'Curated archive of substrate documentation, architectural references, module specifications, and development resources.',
    ogTitle: 'CMPSBL Library',
    ogDescription: 'Curated documentation archive and architectural references.',
    ogImage: OG_DOCS,
    keywords: ['CMPSBL library', 'AI documentation archive', 'substrate knowledge base', 'module specifications', 'AI architecture reference'],
    schema: 'docs',
    intent: 'Docs/Developer',
    primaryKeyword: 'AI documentation knowledge archive',
  },
  '/insights': {
    title: 'Insights — AI Industry Analysis | CMPSBL',
    description: 'Data-driven analysis of AI industry trends, market dynamics, and technological shifts from the CMPSBL intelligence team.',
    ogTitle: 'AI Industry Insights by CMPSBL',
    ogDescription: 'Data-driven analysis of AI trends and market dynamics.',
    ogImage: OG_BLOG,
    keywords: ['AI industry insights', 'AI market analysis', 'cognitive AI trends', 'AI technology shifts', 'CMPSBL intelligence'],
    schema: 'blog',
    intent: 'Blog/Changelog/Updates',
    primaryKeyword: 'AI industry analysis insights',
  },

  // ═══════════════════════════════════════════════════
  // STANDARDS / PROTOCOL
  // ═══════════════════════════════════════════════════
  '/namespace': {
    title: 'Namespace — Unified AI Terminology Standard',
    description: 'The CMPSBL namespace defines the canonical vocabulary for cognitive infrastructure: 600+ terms, standardized across all 21 modules.',
    ogTitle: 'Namespace — AI Terminology Standard',
    ogDescription: 'Canonical vocabulary for cognitive infrastructure with 600+ standardized terms.',
    ogImage: OG_DOCS,
    keywords: ['AI namespace', 'cognitive terminology', 'AI vocabulary standard', 'substrate namespace', 'unified AI terminology'],
    schema: 'docs',
    intent: 'Docs/Developer',
    primaryKeyword: 'unified AI terminology namespace',
  },
  '/foundations': {
    title: 'Foundations — Core Principles & Architecture',
    description: 'The foundational principles behind CMPSBL: composability, persistent state, autonomous evolution, and cognitive coherence.',
    ogTitle: 'CMPSBL Foundations — Core Principles',
    ogDescription: 'The architectural principles behind cognitive infrastructure.',
    ogImage: OG_DOCS,
    keywords: ['CMPSBL foundations', 'AI architecture principles', 'cognitive composability', 'autonomous evolution', 'AI design principles'],
    schema: 'docs',
    intent: 'Docs/Developer',
    primaryKeyword: 'cognitive infrastructure foundations',
  },
  '/roadmap': {
    title: 'Roadmap — What\'s Coming to CMPSBL',
    description: 'See what\'s next for the substrate: upcoming modules, capability expansions, enterprise features, and the path to v10.0.',
    ogTitle: 'CMPSBL Roadmap — What\'s Next',
    ogDescription: 'Upcoming modules, capabilities, and the path to v10.0.',
    ogImage: OG_DOCS,
    keywords: ['CMPSBL roadmap', 'AI platform roadmap', 'substrate future plans', 'upcoming AI features', 'v10 roadmap'],
    schema: 'docs',
    intent: 'Blog/Changelog/Updates',
    primaryKeyword: 'CMPSBL substrate roadmap',
  },
  '/llms-txt': {
    title: 'llms.txt — Machine-Readable AI Context',
    description: 'CMPSBL\'s llms.txt provides structured context for AI crawlers: module catalog, capability index, and API surface for GPTBot and ClaudeBot.',
    ogTitle: 'llms.txt — AI Crawler Context',
    ogDescription: 'Machine-readable context file for GPTBot, ClaudeBot, and AI crawlers.',
    ogImage: OG_DOCS,
    keywords: ['llms.txt', 'AI crawler context', 'GPTBot', 'ClaudeBot', 'machine-readable AI', 'AI discovery optimization'],
    schema: 'docs',
    intent: 'Docs/Developer',
    primaryKeyword: 'llms.txt AI crawler protocol',
  },
  '/humans-txt': {
    title: 'humans.txt — The Team Behind CMPSBL',
    description: 'Meet the humans building cognitive infrastructure. Credits, contributors, and the engineering team behind the substrate.',
    ogTitle: 'humans.txt — Meet the Team',
    ogDescription: 'The humans building cognitive infrastructure for AI.',
    ogImage: OG_ABOUT,
    keywords: ['CMPSBL team', 'humans.txt', 'AI engineering team', 'substrate contributors'],
    schema: 'about',
    intent: 'About/Trust',
    primaryKeyword: 'CMPSBL engineering team credits',
  },

  // ═══════════════════════════════════════════════════
  // CLUSTER / DEEP-DIVE PAGES
  // ═══════════════════════════════════════════════════
  '/cluster/studio-autonomous-site-generator': {
    title: 'STUDIO Module — Autonomous Site Generation',
    description: 'STUDIO generates production-ready web applications autonomously using cognitive pipelines, design intelligence, and real-time deployment.',
    ogTitle: 'STUDIO — Autonomous Site Generator',
    ogDescription: 'AI-powered site generation with design intelligence and instant deployment.',
    ogImage: OG_FEATURE,
    keywords: ['STUDIO module', 'autonomous site generator', 'AI web builder', 'cognitive site generation', 'AI design intelligence'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'autonomous AI site generator module',
  },
  '/cluster/verify-worlds-first-ai-plugin-certification': {
    title: 'VERIFY Module — AI Plugin Certification',
    description: 'The world\'s first AI plugin certification system. VERIFY validates safety, performance, and compatibility before deployment.',
    ogTitle: 'VERIFY — First AI Plugin Certification',
    ogDescription: 'Certify AI plugin safety, performance, and compatibility before deployment.',
    ogImage: OG_FEATURE,
    keywords: ['VERIFY module', 'AI plugin certification', 'AI safety validation', 'plugin compatibility testing', 'AI certification system'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'AI plugin certification system',
  },
  '/cluster/inclusive-module-accessibility': {
    title: 'INCLUSIVE Module — AI Accessibility Engine',
    description: 'INCLUSIVE delivers automated WCAG compliance, real-time accessibility auditing, and AI-powered remediation for any web property.',
    ogTitle: 'INCLUSIVE — AI Accessibility Engine',
    ogDescription: 'Automated WCAG compliance and AI-powered accessibility remediation.',
    ogImage: OG_FEATURE,
    keywords: ['INCLUSIVE module', 'AI accessibility', 'WCAG compliance AI', 'automated accessibility', 'accessibility engine'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'AI-powered accessibility compliance engine',
  },

  // ═══════════════════════════════════════════════════
  // PRODUCT PAGES
  // ═══════════════════════════════════════════════════
  '/products/encode': {
    title: 'ENCODE — The Substrate Code Agent',
    description: 'ENCODE is the substrate\'s code intelligence agent: reads, writes, and refactors code with full system awareness across all 21 modules.',
    ogTitle: 'ENCODE — Code Intelligence Agent',
    ogDescription: 'The substrate\'s code agent with full system awareness across 21 modules.',
    ogImage: OG_FEATURE,
    keywords: ['ENCODE agent', 'AI code agent', 'substrate code intelligence', 'autonomous coding AI', 'system-aware code agent'],
    schema: 'product',
    intent: 'Feature/Capability',
    primaryKeyword: 'ENCODE AI code intelligence agent',
  },
  '/start-here': {
    title: 'Start Here — Get Oriented with CMPSBL',
    description: 'New to CMPSBL? Start here for a guided introduction to the substrate, its modules, and how to build your first cognitive application.',
    ogTitle: 'Start Here — Your CMPSBL Journey',
    ogDescription: 'Guided introduction to the substrate and building your first AI application.',
    ogImage: OG_DEFAULT,
    keywords: ['CMPSBL getting started', 'substrate onboarding', 'first AI app guide', 'beginner AI platform', 'CMPSBL quickstart'],
    schema: 'docs',
    intent: 'Docs/Developer',
    primaryKeyword: 'CMPSBL getting started guide',
  },

  // ═══════════════════════════════════════════════════
  // LEGAL
  // ═══════════════════════════════════════════════════
  '/privacy': {
    title: 'Privacy Policy — CMPSBL®',
    description: 'CMPSBL privacy policy: how we collect, store, and protect your data. GDPR-compliant, transparent data practices.',
    ogTitle: 'Privacy Policy — CMPSBL',
    ogDescription: 'How CMPSBL handles your data — transparent, GDPR-compliant practices.',
    ogImage: OG_DEFAULT,
    keywords: ['CMPSBL privacy policy', 'AI data privacy', 'GDPR compliant AI', 'data protection policy'],
    schema: 'legal',
    intent: 'Legal',
    primaryKeyword: 'CMPSBL privacy policy',
  },
  '/terms': {
    title: 'Terms of Service — CMPSBL®',
    description: 'Terms of service for the CMPSBL substrate platform. Covers usage rights, intellectual property, and service-level commitments.',
    ogTitle: 'Terms of Service — CMPSBL',
    ogDescription: 'Usage terms, IP rights, and SLA commitments for the substrate.',
    ogImage: OG_DEFAULT,
    keywords: ['CMPSBL terms of service', 'AI platform terms', 'substrate usage terms', 'service agreement AI'],
    schema: 'legal',
    intent: 'Legal',
    primaryKeyword: 'CMPSBL terms of service',
  },

  // ═══════════════════════════════════════════════════
  // NOINDEX PAGES (utility, admin, auth)
  // ═══════════════════════════════════════════════════
  '/auth': {
    title: 'Sign In — CMPSBL',
    description: 'Sign in to your CMPSBL account to access the substrate dashboard, cognitive agents, and enterprise tools.',
    ogTitle: 'Sign In — CMPSBL',
    ogDescription: 'Access your substrate dashboard and cognitive tools.',
    ogImage: OG_DEFAULT,
    keywords: ['CMPSBL login', 'sign in AI platform'],
    schema: 'legal',
    intent: 'Auth',
    primaryKeyword: 'CMPSBL sign in',
    noindex: true,
  },
  '/register': {
    title: 'Register — Create Your CMPSBL Account',
    description: 'Create a free CMPSBL account to start building with cognitive infrastructure. Access persistent memory, Decode, and 400+ capabilities.',
    ogTitle: 'Register — Join CMPSBL',
    ogDescription: 'Create your free account and start building with cognitive infrastructure.',
    ogImage: OG_DEFAULT,
    keywords: ['CMPSBL register', 'create AI account', 'free AI platform signup'],
    schema: 'legal',
    intent: 'Auth',
    primaryKeyword: 'CMPSBL register account',
    noindex: true,
  },
  '/clear-cache': {
    title: 'Clear Cache — CMPSBL',
    description: 'Clear local cache and reset substrate state.',
    ogTitle: 'Clear Cache',
    ogDescription: 'Reset local state and cache.',
    ogImage: OG_DEFAULT,
    keywords: ['clear cache'],
    schema: 'legal',
    intent: 'Utility',
    primaryKeyword: 'clear cache utility',
    noindex: true,
  },
  '/substrate': {
    title: 'Substrate Dashboard — Command Center',
    description: 'Your cognitive command center: module health, agent status, dream cycles, and real-time system telemetry.',
    ogTitle: 'Substrate Dashboard',
    ogDescription: 'Your cognitive AI command center.',
    ogImage: OG_FEATURE,
    keywords: ['substrate dashboard', 'AI command center', 'module health dashboard'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'AI substrate command center dashboard',
    noindex: true,
  },
  '/audit': {
    title: 'Audit Trail — Substrate Operations Log',
    description: 'Complete audit trail of all substrate operations with cryptographic integrity verification and compliance filtering.',
    ogTitle: 'Audit Trail — CMPSBL',
    ogDescription: 'Cryptographic audit log for all substrate operations.',
    ogImage: OG_FEATURE,
    keywords: ['AI audit trail', 'substrate operations log', 'cryptographic audit'],
    schema: 'feature',
    intent: 'Feature/Capability',
    primaryKeyword: 'AI substrate audit trail',
    noindex: true,
  },
};

/**
 * Get SEO config for a route. Falls back to defaults for unknown routes.
 */
export function getSEO(path: string): PageSEO {
  // Exact match first
  if (seoMap[path]) return seoMap[path];

  // Check blog posts — return generic blog SEO for unmatched blog routes
  if (path.startsWith('/blog/')) {
    return {
      title: 'CMPSBL Blog',
      description: 'AI infrastructure insights and engineering deep-dives from the CMPSBL team.',
      ogTitle: 'CMPSBL Blog',
      ogDescription: 'AI infrastructure insights from the CMPSBL team.',
      ogImage: OG_BLOG,
      keywords: ['CMPSBL blog', 'AI insights'],
      schema: 'article',
      intent: 'Blog/Changelog/Updates',
      primaryKeyword: 'CMPSBL blog post',
    };
  }

  // Check module detail pages
  if (path.startsWith('/modules/')) {
    return {
      title: 'Module Detail — CMPSBL Substrate',
      description: 'Explore this substrate module: architecture, capabilities, synergies, and integration guides.',
      ogTitle: 'Substrate Module — CMPSBL',
      ogDescription: 'Architecture, capabilities, and integration for this substrate module.',
      ogImage: OG_FEATURE,
      keywords: ['substrate module', 'AI module detail', 'module architecture'],
      schema: 'feature',
      intent: 'Feature/Capability',
      primaryKeyword: 'substrate module detail',
    };
  }

  // Default fallback
  return seoMap['/'];
}
