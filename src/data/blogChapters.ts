/**
 * Canonical blog chapter data — used for cross-linking, JSON-LD, and navigation.
 */
export interface BlogChapter {
  chapter: number;
  slug: string;
  title: string;
  description: string;
  date: string;       // ISO date
  readTime: string;
  keywords: string[];
  relatedSlugs: string[];  // 2-4 related chapters for cross-linking
}

export const BLOG_CHAPTERS: BlogChapter[] = [
  {
    chapter: 1,
    slug: "the-first-line-of-code",
    title: "The First Line of Code",
    description: "In December 2024, we wrote the first line of what would become the CMPSBL substrate. This is the honest story of why.",
    date: "2024-12-15",
    readTime: "12 min",
    keywords: ["cognitive infrastructure origin", "AI substrate story", "CMPSBL founding", "why build AI infrastructure"],
    relatedSlugs: ["routing-the-unknown", "building-on-the-substrate", "burning-it-down"],
  },
  {
    chapter: 2,
    slug: "routing-the-unknown",
    title: "Routing the Unknown",
    description: "How the NEXUS node evolved from a simple failover function into an intelligent AI routing gateway with cost arbitrage and health-weighted selection.",
    date: "2025-01-10",
    readTime: "14 min",
    keywords: ["AI routing gateway", "NEXUS node", "multi-provider AI", "intelligent model selection", "cost arbitrage AI"],
    relatedSlugs: ["the-first-line-of-code", "nodes-that-talk", "how-we-compare"],
  },
  {
    chapter: 3,
    slug: "teaching-machines-to-remember",
    title: "Teaching Machines to Remember",
    description: "How we built a three-tier memory architecture that gives AI agents persistent recall across sessions, conversations, and deployments.",
    date: "2025-02-08",
    readTime: "15 min",
    keywords: ["AI persistent memory", "BRAIN node", "three-tier memory", "agent memory architecture", "cognitive recall"],
    relatedSlugs: ["why-agents-forget", "what-if-software-could-dream", "agents-that-actually-learn"],
  },
  {
    chapter: 4,
    slug: "when-bots-found-us-first",
    title: "When Bots Found Us First",
    description: "We didn't plan to build a security node. Then automated attacks found our API endpoints before we'd even launched. This is how DEFENSE was born.",
    date: "2025-03-05",
    readTime: "14 min",
    keywords: ["AI security defense", "DEFENSE node", "bot attack defense", "behavioral fingerprinting", "prompt injection defense"],
    relatedSlugs: ["the-bot-wars", "cybersecurity-through-cognition", "identity-at-every-layer"],
  },
  {
    chapter: 5,
    slug: "seeing-everything-at-once",
    title: "Seeing Everything at Once",
    description: "When we couldn't debug our own system, we built VISION — real-time observability across every node, every request, every cost.",
    date: "2025-03-20",
    readTime: "11 min",
    keywords: ["AI observability", "VISION node", "real-time monitoring", "substrate telemetry", "cost tracking AI"],
    relatedSlugs: ["nodes-that-talk", "when-bots-found-us-first", "the-governance-question"],
  },
  {
    chapter: 6,
    slug: "nodes-that-talk",
    title: "Nodes That Talk",
    description: "When five nodes needed to coordinate, point-to-point calls broke down. RIPPLE introduced pub/sub event propagation across the substrate.",
    date: "2025-04-02",
    readTime: "12 min",
    keywords: ["event-driven AI", "RIPPLE node", "pub/sub architecture", "inter-node communication", "event sourcing AI"],
    relatedSlugs: ["routing-the-unknown", "seeing-everything-at-once", "protocols-for-machines"],
  },
  {
    chapter: 7,
    slug: "identity-at-every-layer",
    title: "Identity at Every Layer",
    description: "Authentication, API keys, rate limits, and tier-based entitlements. How ACCESS made the substrate safe to open to the world.",
    date: "2025-04-15",
    readTime: "10 min",
    keywords: ["API identity management", "ACCESS node", "tier-based entitlements", "API key lifecycle", "rate limiting AI"],
    relatedSlugs: ["when-bots-found-us-first", "the-governance-question", "building-on-the-substrate"],
  },
  {
    chapter: 8,
    slug: "what-if-software-could-dream",
    title: "What If Software Could Dream",
    description: "During off-peak hours, the substrate processes its own experiences. We call it dreaming. It's the closest thing to autonomous learning we've built.",
    date: "2025-05-10",
    readTime: "13 min",
    keywords: ["autonomous AI learning", "DREAM node", "idle-cycle processing", "self-improving AI", "experience consolidation"],
    relatedSlugs: ["teaching-machines-to-remember", "when-software-starts-evolving", "agents-that-actually-learn"],
  },
  {
    chapter: 9,
    slug: "building-on-the-substrate",
    title: "Building on the Substrate",
    description: "We had eight nodes and no developer documentation. Making the substrate usable meant rethinking how developers interact with cognitive infrastructure.",
    date: "2025-05-25",
    readTime: "11 min",
    keywords: ["AI developer experience", "substrate SDK", "ENCODE node", "cognitive infrastructure API", "developer onboarding"],
    relatedSlugs: ["the-first-line-of-code", "how-we-compare", "protocols-for-machines"],
  },
  {
    chapter: 10,
    slug: "why-agents-forget",
    title: "Why Agents Forget",
    description: "Context loss is the silent killer of AI agents. Here's why it happens, what the industry gets wrong about it, and what we've learned building persistent memory.",
    date: "2025-06-08",
    readTime: "11 min",
    keywords: ["agent memory loss", "AI context degradation", "why agents forget", "persistent memory challenges", "memory architecture problems"],
    relatedSlugs: ["teaching-machines-to-remember", "agents-that-actually-learn", "what-if-software-could-dream"],
  },
  {
    chapter: 11,
    slug: "how-we-compare",
    title: "How We Compare",
    description: "An honest comparison of CMPSBL against OpenAI, Anthropic, LangChain, and other AI platforms. What we do better. What they do better.",
    date: "2025-06-20",
    readTime: "16 min",
    keywords: ["AI platform comparison", "CMPSBL vs OpenAI", "cognitive infrastructure comparison", "AI infrastructure landscape"],
    relatedSlugs: ["routing-the-unknown", "building-on-the-substrate", "the-first-line-of-code"],
  },
  {
    chapter: 12,
    slug: "agents-that-actually-learn",
    title: "Agents That Actually Learn",
    description: "After months of building learning agents, these are the architectural patterns that actually improve agent performance over time.",
    date: "2025-07-12",
    readTime: "15 min",
    keywords: ["learning AI agents", "agent improvement patterns", "AI architecture patterns", "experience-based learning", "agent competency"],
    relatedSlugs: ["teaching-machines-to-remember", "why-agents-forget", "what-if-software-could-dream"],
  },
  {
    chapter: 13,
    slug: "the-bot-wars",
    title: "The Bot Wars",
    description: "By August 2025, AI-powered bots were attacking our infrastructure daily. This is what we learned fighting them.",
    date: "2025-08-05",
    readTime: "14 min",
    keywords: ["AI bot attacks", "bot defense real world", "automated attack defense", "bot-as-a-service", "AI security warfare"],
    relatedSlugs: ["when-bots-found-us-first", "cybersecurity-through-cognition", "identity-at-every-layer"],
  },
  {
    chapter: 14,
    slug: "cybersecurity-through-cognition",
    title: "Cybersecurity Through Cognition",
    description: "Traditional security reacts to known threats. DEFENSE predicts unknown ones. How cognitive security fundamentally changes threat detection.",
    date: "2025-09-08",
    readTime: "12 min",
    keywords: ["cognitive cybersecurity", "predictive threat detection", "behavioral AI security", "beyond traditional firewalls", "AI-native security"],
    relatedSlugs: ["when-bots-found-us-first", "the-bot-wars", "the-governance-question"],
  },
  {
    chapter: 15,
    slug: "accessibility-is-infrastructure",
    title: "Accessibility Is Infrastructure",
    description: "We built INCLUSIVE because accessibility shouldn't require a dedicated team. AI-powered scanning and remediation, available to every application on the substrate.",
    date: "2025-10-15",
    readTime: "10 min",
    keywords: ["AI accessibility", "INCLUSIVE node", "automated WCAG compliance", "accessibility remediation", "inclusive design AI"],
    relatedSlugs: ["building-on-the-substrate", "the-governance-question", "signal-to-silicon"],
  },
  {
    chapter: 16,
    slug: "the-governance-question",
    title: "The Governance Question",
    description: "AI governance has been a whitepaper exercise. With AUDIT and IDENTITY, we made it a runtime property — cryptographic proof that guardrails were active.",
    date: "2025-11-10",
    readTime: "13 min",
    keywords: ["AI governance runtime", "compliance logging", "cryptographic audit trail", "actor attribution", "AUDIT node"],
    relatedSlugs: ["identity-at-every-layer", "protocols-for-machines", "cybersecurity-through-cognition"],
  },
  {
    chapter: 17,
    slug: "protocols-for-machines",
    title: "Protocols for Machines",
    description: "We adopted LLMs.txt, built machine-readable documentation, and established protocol standards for autonomous agent communication across the substrate.",
    date: "2025-12-05",
    readTime: "14 min",
    keywords: ["AI protocol standards", "LLMs.txt protocol", "machine-to-machine communication", "agent communication protocol", "RELAY node"],
    relatedSlugs: ["nodes-that-talk", "the-governance-question", "building-on-the-substrate"],
  },
  {
    chapter: 18,
    slug: "when-software-starts-evolving",
    title: "When Software Starts Evolving",
    description: "In January 2026, the substrate crossed a threshold: DREAM consolidation cycles started producing improvements we didn't program. Here's what happened.",
    date: "2026-01-15",
    readTime: "18 min",
    keywords: ["evolving software", "autonomous improvement", "self-improving AI", "EVOLUTION node", "recursive self-improvement"],
    relatedSlugs: ["what-if-software-could-dream", "burning-it-down", "signal-to-silicon"],
  },
  {
    chapter: 19,
    slug: "burning-it-down",
    title: "Burning It Down",
    description: "In February 2026, we deleted thousands of lines of code and rebuilt the substrate from scratch. Here's why, and what we learned.",
    date: "2026-02-10",
    readTime: "20 min",
    keywords: ["substrate rebuild", "SPARTA epoch", "software refactoring", "architecture rebuild", "technical debt elimination"],
    relatedSlugs: ["the-first-line-of-code", "when-software-starts-evolving", "signal-to-silicon"],
  },
  {
    chapter: 20,
    slug: "signal-to-silicon",
    title: "Signal to Silicon",
    description: "From behavioral signals through 40-node cognitive processing to deployable software. The substrate's complete signal-to-silicon pipeline explained.",
    date: "2026-03-04",
    readTime: "22 min",
    keywords: ["signal to silicon", "cognitive pipeline", "autonomous software discovery", "deployable AI pipeline", "substrate architecture"],
    relatedSlugs: ["the-first-line-of-code", "when-software-starts-evolving", "burning-it-down"],
  },
];

export function getChapter(slug: string): BlogChapter | undefined {
  return BLOG_CHAPTERS.find(c => c.slug === slug);
}

export function getAdjacentChapters(slug: string) {
  const idx = BLOG_CHAPTERS.findIndex(c => c.slug === slug);
  return {
    prev: idx > 0 ? BLOG_CHAPTERS[idx - 1] : null,
    next: idx < BLOG_CHAPTERS.length - 1 ? BLOG_CHAPTERS[idx + 1] : null,
  };
}

export function getRelatedChapters(slug: string): BlogChapter[] {
  const chapter = getChapter(slug);
  if (!chapter) return [];
  return chapter.relatedSlugs
    .map(s => BLOG_CHAPTERS.find(c => c.slug === s))
    .filter(Boolean) as BlogChapter[];
}
