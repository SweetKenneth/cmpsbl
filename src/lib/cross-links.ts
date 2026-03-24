/**
 * Cross-link registry — maps each page to contextually related pages
 * Used by the RelatedCapabilities component at the bottom of pages.
 * ALL links verified against nav menu and footer — no broken routes.
 */

export interface CrossLink {
  href: string;
  title: string;
  description: string;
  badge?: string;
}

const LINK_DB: Record<string, CrossLink[]> = {
  "/architecture": [
    { href: "/runtime", title: "Runtime Environment", description: "See how primitives execute, scale, and self-heal in production" },
    { href: "/store", title: "Store & Plans", description: "Browse memory packs, agents, and engines", badge: "Store" },
    { href: "/foundry", title: "Memory Stream", description: "Watch the system discover and crystallize new capabilities", badge: "Discovery" },
    { href: "/ai-operating-system", title: "How it Works", description: "Learn the core concepts behind the substrate" },
  ],
  "/runtime": [
    { href: "/architecture", title: "Substrate Architecture", description: "The 40-primitive topology that the runtime executes" },
    { href: "/store", title: "Store & Plans", description: "Browse memory packs, agents, and subscription plans", badge: "Store" },
    { href: "/status", title: "System Status", description: "Live health monitoring across all runtime services" },
    { href: "/docs", title: "Documentation", description: "Developer reference, guides, and API documentation" },
  ],
  "/ai-operating-system": [
    { href: "/architecture", title: "Substrate Architecture", description: "Deep-dive into the 40-primitive cognitive topology" },
    { href: "/runtime", title: "Runtime Environment", description: "See how the substrate executes in production" },
    { href: "/enterprise", title: "Enterprise", description: "Scale with governance, compliance, and dedicated support" },
    { href: "/persistent-memory", title: "Persistent Memory", description: "Give agents 4-tier cognitive recall" },
  ],
  "/enterprise": [
    { href: "/architecture", title: "Substrate Architecture", description: "Full topology of the cognitive operating system" },
    { href: "/solutions", title: "Solutions", description: "Pre-configured deployments by industry" },
    { href: "/contact", title: "Contact Sales", description: "Talk to the team about custom deployment" },
    { href: "/store?tab=plans", title: "Plans & Pricing", description: "Compare plans and subscription tiers", badge: "Plans" },
  ],
  "/persistent-memory": [
    { href: "/architecture", title: "Substrate Architecture", description: "See where the MEMORY Organ fits in the topology" },
    { href: "/docs", title: "Documentation", description: "Developer reference and integration guides" },
    { href: "/store", title: "Store & Plans", description: "Browse memory packs and agents", badge: "Store" },
    { href: "/runtime", title: "Runtime Environment", description: "How the substrate executes and self-heals" },
  ],
  "/foundry": [
    { href: "/architecture", title: "Substrate Architecture", description: "The topology feeding the Memory Stream" },
    { href: "/store", title: "Store & Plans", description: "Browse engines and agents in the store", badge: "Store" },
    { href: "/showcase", title: "Showcase", description: "See top-tier discoveries and what developers built" },
    { href: "/blog", title: "Blog", description: "Articles and research on cognitive infrastructure" },
  ],
  "/store": [
    { href: "/architecture", title: "Substrate Architecture", description: "Understand the 40-primitive topology" },
    { href: "/persistent-memory", title: "Persistent Memory", description: "4-tier cognitive recall for every agent" },
    { href: "/docs", title: "Documentation", description: "Developer reference and SDK guides" },
    { href: "/foundry", title: "Memory Stream", description: "Discover capabilities in real time", badge: "Discovery" },
  ],
  "/about": [
    { href: "/architecture", title: "Substrate Architecture", description: "Deep-dive into the 40-primitive topology" },
    { href: "/investors", title: "Investor Overview", description: "Market position, traction, and growth thesis" },
    { href: "/careers", title: "Join the Team", description: "Open roles building the cognitive substrate" },
    { href: "/blog", title: "Blog", description: "Articles and research from the team" },
  ],
  "/investors": [
    { href: "/about", title: "About CMPSBL", description: "Mission, vision, and the team behind the substrate" },
    { href: "/architecture", title: "Technical Architecture", description: "40-primitive substrate topology and engineering depth" },
    { href: "/enterprise", title: "Enterprise", description: "Dedicated infrastructure, SLAs, and custom deployment" },
    { href: "/solutions", title: "Solutions", description: "How enterprises deploy CMPSBL across verticals" },
  ],
  "/solutions": [
    { href: "/enterprise", title: "Enterprise", description: "Custom deployment and dedicated infrastructure" },
    { href: "/store", title: "Store & Plans", description: "Browse the engine and agent catalog", badge: "Store" },
    { href: "/contact", title: "Contact Sales", description: "Discuss a custom solution for your team" },
    { href: "/architecture", title: "Substrate Architecture", description: "The topology powering every solution" },
  ],
  "/docs": [
    { href: "/api-access", title: "API Access", description: "Authentication, endpoints, and rate limits" },
    { href: "/academy", title: "Academy", description: "Tutorials, patterns, and best practices" },
    { href: "/codelab", title: "Developers Playground", description: "Test and run code live in the browser" },
    { href: "/architecture", title: "Architecture", description: "Understand the topology your API calls traverse" },
  ],
  "/documentation": [
    { href: "/docs", title: "Docs", description: "Public guides and reference documentation" },
    { href: "/api-access", title: "API Access", description: "Keys, quotas, and usage tracking" },
    { href: "/academy", title: "Academy", description: "Tutorials and integration patterns" },
    { href: "/codelab", title: "Developers Playground", description: "Test and run code live" },
  ],
  "/api-access": [
    { href: "/docs", title: "Documentation", description: "Full reference for the substrate APIs" },
    { href: "/academy", title: "Academy", description: "Hands-on tutorials and integration patterns" },
    { href: "/codelab", title: "Developers Playground", description: "Test and run code live in the browser" },
    { href: "/architecture", title: "Architecture", description: "Understand the topology your API calls traverse" },
  ],
  "/blog": [
    { href: "/publication", title: "Publication", description: "Long-form essays on cognitive infrastructure" },
    { href: "/changelog", title: "Changelog", description: "Latest releases and version history" },
    { href: "/about", title: "About CMPSBL", description: "Our mission and the team behind the substrate" },
    { href: "/foundry", title: "Memory Stream", description: "Discover capabilities in real time", badge: "Discovery" },
  ],
  "/changelog": [
    { href: "/blog", title: "Blog", description: "Deep-dives on system architecture and releases" },
    { href: "/status", title: "System Status", description: "Live health monitoring for all services" },
    { href: "/architecture", title: "Architecture", description: "Current 40-primitive topology and system design" },
    { href: "/store", title: "Store & Plans", description: "Browse the latest agents and engines", badge: "Store" },
  ],
  "/showcase": [
    { href: "/foundry", title: "Memory Stream", description: "Where showcased discoveries originate", badge: "Discovery" },
    { href: "/store", title: "Store & Plans", description: "Browse the engine and agent catalog", badge: "Store" },
    { href: "/developers", title: "Developers", description: "Community and resources for builders" },
    { href: "/academy", title: "Academy", description: "Learn to build on the substrate" },
  ],
  "/codelab": [
    { href: "/docs", title: "Documentation", description: "Full API reference and guides" },
    { href: "/api-access", title: "API Access", description: "Keys, quotas, and usage tracking" },
    { href: "/devtools", title: "DevTools", description: "SDKs, packages, and playground" },
    { href: "/academy", title: "Academy", description: "Tutorials and integration patterns" },
  ],
  "/academy": [
    { href: "/docs", title: "Documentation", description: "Full API reference and guides" },
    { href: "/codelab", title: "Developers Playground", description: "Test and run code live in the browser" },
    { href: "/api-access", title: "API Access", description: "Keys and integration quickstart" },
    { href: "/developers", title: "Developers", description: "Community and resources for builders" },
  ],
  "/scanner": [
    { href: "/store", title: "Store & Plans", description: "Browse engines and agents", badge: "Store" },
    { href: "/architecture", title: "Architecture", description: "The topology behind every scan" },
    { href: "/docs", title: "Documentation", description: "Developer reference and guides" },
    { href: "/enterprise", title: "Enterprise", description: "Dedicated deployment and compliance" },
  ],
  "/lab": [
    { href: "/foundry", title: "Memory Stream", description: "Explore system-discovered capabilities", badge: "Discovery" },
    { href: "/docs", title: "Documentation", description: "API reference for lab integrations" },
    { href: "/store", title: "Store & Plans", description: "Browse engines and agents", badge: "Store" },
    { href: "/codelab", title: "Developers Playground", description: "Test and run code live" },
  ],
  "/developers": [
    { href: "/docs", title: "Documentation", description: "Full API reference and guides" },
    { href: "/codelab", title: "Developers Playground", description: "Test and run code live in the browser" },
    { href: "/academy", title: "Academy", description: "Tutorials, patterns, and courses" },
    { href: "/showcase", title: "Showcase", description: "See what developers built" },
  ],
  "/contact": [
    { href: "/support", title: "Support", description: "Technical support and troubleshooting" },
    { href: "/docs", title: "Documentation", description: "Self-serve API reference and guides" },
    { href: "/enterprise", title: "Enterprise", description: "Custom deployment and dedicated infrastructure" },
    { href: "/about", title: "About CMPSBL", description: "Our mission and team" },
  ],
  "/careers": [
    { href: "/about", title: "About CMPSBL", description: "Our mission and the team you'd join" },
    { href: "/architecture", title: "Technical Architecture", description: "The system you'd help build" },
    { href: "/blog", title: "Blog", description: "Articles and research from the team" },
    { href: "/changelog", title: "Changelog", description: "What's shipping and what shipped recently" },
  ],
  "/privacy": [
    { href: "/terms", title: "Terms of Service", description: "Usage terms and conditions" },
    { href: "/about", title: "About CMPSBL", description: "Our mission and the team" },
    { href: "/contact", title: "Contact Us", description: "Questions about data handling or privacy" },
    { href: "/support", title: "Support", description: "Technical support and troubleshooting" },
  ],
  "/terms": [
    { href: "/privacy", title: "Privacy Policy", description: "How CMPSBL handles and protects your data" },
    { href: "/about", title: "About CMPSBL", description: "Our mission and the team" },
    { href: "/contact", title: "Contact Us", description: "Questions about terms or licensing" },
    { href: "/support", title: "Support", description: "Technical support and troubleshooting" },
  ],
  "/status": [
    { href: "/architecture", title: "Architecture", description: "The topology behind these health metrics" },
    { href: "/support", title: "Support", description: "Get help if something isn't working" },
    { href: "/changelog", title: "Changelog", description: "Recent changes that may affect status" },
    { href: "/runtime", title: "Runtime", description: "How the substrate executes and self-heals" },
  ],
  "/publication": [
    { href: "/blog", title: "Blog", description: "Articles and research from the team" },
    { href: "/about", title: "About CMPSBL", description: "Our mission and team" },
    { href: "/heritage-paper", title: "Heritage Paper", description: "The foundational document" },
    { href: "/changelog", title: "Changelog", description: "Latest releases and version history" },
  ],
};

/** Get related pages for a given path. Falls back to a generic set. */
export function getCrossLinks(path: string): CrossLink[] {
  const normalized = path.replace(/\/+$/, "") || "/";
  
  if (LINK_DB[normalized]) return LINK_DB[normalized];
  
  // Fallback: show core pages — all verified working routes
  return [
    { href: "/architecture", title: "Substrate Architecture", description: "Explore the 40-primitive cognitive topology" },
    { href: "/store", title: "Store & Plans", description: "Browse agents, engines, and memory packs", badge: "Store" },
    { href: "/docs", title: "Documentation", description: "Developer reference, guides, and API documentation" },
    { href: "/runtime", title: "Runtime Environment", description: "See how the substrate executes and self-heals" },
  ];
}
