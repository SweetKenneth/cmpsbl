/**
 * Cross-link registry — maps each page to contextually related pages
 * Used by the RelatedCapabilities component at the bottom of pages.
 */

export interface CrossLink {
  href: string;
  title: string;
  description: string;
  badge?: string;
}

const LINK_DB: Record<string, CrossLink[]> = {
  "/architecture": [
    { href: "/store", title: "Store & Plans", description: "Browse memory packs, agents, and engines in the store", badge: "Store" },
    { href: "/runtime", title: "Runtime Environment", description: "See how nodes execute, scale, and self-heal in production" },
    { href: "/memory-stream", title: "Memory Stream", description: "Watch the system discover and crystallize new capabilities in real time", badge: "Discovery" },
    { href: "/system-overview", title: "System Overview", description: "Full topology of the 40-primitive, 4-category cognitive matrix" },
  ],
  "/engines": [
    { href: "/architecture", title: "Substrate Architecture", description: "Understand how engines fit within the 40-primitive topology" },
    { href: "/store", title: "Store & Plans", description: "Browse and activate memory packs and agents", badge: "Store" },
    { href: "/runtime", title: "Runtime Environment", description: "See how primitives execute and self-heal in production" },
    { href: "/docs", title: "Documentation", description: "Developer reference and integration guides" },
  ],
  "/runtime": [
    { href: "/architecture", title: "Substrate Architecture", description: "The 40-primitive topology that the runtime executes" },
    { href: "/store", title: "Store & Plans", description: "Browse memory packs, agents, and subscription plans", badge: "Store" },
    { href: "/status", title: "System Status", description: "Live health monitoring across all runtime services" },
    { href: "/docs", title: "Documentation", description: "Developer reference, guides, and API documentation" },
  ],
  "/memory-stream": [
    { href: "/foundry", title: "The Foundry", description: "Where memory stream discoveries are explored and scored" },
    { href: "/packs", title: "Capability Packs", description: "Crystallized discoveries packaged for activation", badge: "Packs" },
    { href: "/architecture", title: "Substrate Architecture", description: "The node topology feeding the memory stream" },
    { href: "/store", title: "Store & Plans", description: "Browse engines and agents in the store", badge: "Store" },
  ],
  "/foundry": [
    { href: "/memory-stream", title: "Memory Stream", description: "The discovery substrate the Foundry samples from", badge: "Discovery" },
    { href: "/store", title: "Store & Plans", description: "Browse engines and agents in the store", badge: "Store" },
    { href: "/packs", title: "Capability Packs", description: "How discoveries become activatable capability packs" },
    { href: "/showcase", title: "Cognitive Showcase", description: "See top-tier discoveries and system achievements" },
  ],
  "/packs": [
    { href: "/store", title: "Store & Plans", description: "Browse engines and memory packs in the store", badge: "Store" },
    { href: "/upgrade", title: "Upgrade Plan", description: "Unlock more memory slots and premium capability tiers", badge: "Upgrade" },
    { href: "/foundry", title: "The Foundry", description: "How new packs are discovered through the memory stream" },
    { href: "/start", title: "Start Here", description: "Get your first 3 memory slots free — no credit card required" },
  ],
  "/about": [
    { href: "/architecture", title: "Substrate Architecture", description: "Deep-dive into the 40-primitive cognitive topology" },
    { href: "/investors", title: "Investor Overview", description: "Market position, traction metrics, and growth thesis" },
    { href: "/careers", title: "Join the Team", description: "Open roles building the cognitive operating system" },
    { href: "/roadmap", title: "Product Roadmap", description: "What's shipping next in the CMPSBL substrate" },
  ],
  "/investors": [
    { href: "/about", title: "About CMPSBL", description: "Mission, vision, and the team behind the substrate" },
    { href: "/architecture", title: "Technical Architecture", description: "40-primitive substrate topology and engineering depth" },
    { href: "/use-cases", title: "Use Cases", description: "How enterprises deploy CMPSBL across verticals" },
    { href: "/enterprise", title: "Enterprise", description: "Dedicated infrastructure, SLAs, and custom deployment" },
  ],
  "/enterprise": [
    { href: "/architecture", title: "Substrate Architecture", description: "Full topology of the cognitive operating system" },
    { href: "/use-cases", title: "Use Cases", description: "Real deployments across industries and team sizes" },
    { href: "/investors", title: "Investor Overview", description: "Market thesis and growth trajectory" },
    { href: "/contact", title: "Contact Sales", description: "Talk to the team about custom deployment" },
  ],
  "/use-cases": [
    { href: "/enterprise", title: "Enterprise", description: "Dedicated substrate infrastructure for large teams", badge: "Enterprise" },
    { href: "/store", title: "Store & Plans", description: "Browse the composable engine and agent catalog", badge: "Store" },
    { href: "/solutions", title: "Solutions", description: "Pre-configured substrate deployments by industry" },
    { href: "/try", title: "Try It Live", description: "Experience the substrate with zero signup", badge: "Demo" },
  ],
  "/documentation": [
    { href: "/start", title: "Start Here", description: "Quickstart guide to get running in under 5 minutes" },
    { href: "/api-access", title: "API Access", description: "Authentication, endpoints, and rate limits" },
    { href: "/academy", title: "Developer Academy", description: "Tutorials, patterns, and best practices" },
    { href: "/vanilla-dev-guide", title: "Dev Guide", description: "Plain-language guide to building on CMPSBL" },
  ],
  "/api-access": [
    { href: "/documentation", title: "Documentation Hub", description: "Full reference for the CMPSBL substrate APIs" },
    { href: "/academy", title: "Developer Academy", description: "Hands-on tutorials and integration patterns" },
    { href: "/start", title: "Start Here", description: "Get your API key and first 3 memory slots free" },
    { href: "/architecture", title: "Architecture", description: "Understand the topology your API calls traverse" },
  ],
  "/solutions": [
    { href: "/use-cases", title: "Use Cases", description: "Specific deployment examples across verticals" },
    { href: "/enterprise", title: "Enterprise", description: "Custom deployment and dedicated infrastructure" },
    { href: "/store", title: "Store & Plans", description: "Browse the composable engine and agent catalog", badge: "Store" },
    { href: "/contact", title: "Contact Sales", description: "Discuss a custom solution for your team" },
  ],
  "/try": [
    { href: "/start", title: "Start Building", description: "Create a free account and get 3 memory slots", badge: "Free" },
    { href: "/architecture", title: "How It Works", description: "Explore the 40-primitive substrate topology" },
    { href: "/store", title: "Store & Plans", description: "Browse the full engine and agent catalog", badge: "Store" },
    { href: "/documentation", title: "Documentation", description: "API reference, tutorials, and integration guides" },
  ],
  "/privacy": [
    { href: "/terms", title: "Terms of Service", description: "Usage terms and conditions for the CMPSBL platform" },
    { href: "/about", title: "About CMPSBL", description: "Our mission and the team behind the substrate" },
    { href: "/contact", title: "Contact Us", description: "Questions about data handling or privacy" },
  ],
  "/terms": [
    { href: "/privacy", title: "Privacy Policy", description: "How CMPSBL handles and protects your data" },
    { href: "/about", title: "About CMPSBL", description: "Our mission and the team behind the substrate" },
    { href: "/contact", title: "Contact Us", description: "Questions about terms or licensing" },
  ],
  "/contact": [
    { href: "/support", title: "Support Center", description: "Technical support and troubleshooting resources" },
    { href: "/documentation", title: "Documentation", description: "Self-serve API reference and integration guides" },
    { href: "/enterprise", title: "Enterprise", description: "Custom deployment and dedicated infrastructure" },
  ],
  "/roadmap": [
    { href: "/changelog", title: "Changelog", description: "What shipped recently across the substrate" },
    { href: "/architecture", title: "Architecture", description: "Current 40-primitive topology and system design" },
    { href: "/investors", title: "Investor Overview", description: "Growth thesis and market positioning" },
    { href: "/careers", title: "Join the Team", description: "Help build what's on the roadmap" },
  ],
  "/changelog": [
    { href: "/roadmap", title: "Product Roadmap", description: "What's shipping next in the substrate" },
    { href: "/blog", title: "Blog", description: "Deep-dives on system architecture and releases" },
    { href: "/status", title: "System Status", description: "Live health monitoring for all services" },
  ],
  "/blog": [
    { href: "/publication", title: "Publication", description: "Long-form essays on cognitive infrastructure" },
    { href: "/insights", title: "System Insights", description: "Operational intelligence from the substrate" },
    { href: "/changelog", title: "Changelog", description: "Latest releases and version history" },
  ],
  "/start": [
    { href: "/try", title: "Try It First", description: "Zero-signup interactive demo of the substrate", badge: "Demo" },
    { href: "/documentation", title: "Documentation", description: "API reference and integration quickstart" },
    { href: "/packs", title: "Capability Packs", description: "Choose your first capabilities across 6 domains" },
    { href: "/engines", title: "54 Engines", description: "Browse the full composable engine arsenal" },
  ],
  "/upgrade": [
    { href: "/packs", title: "Capability Packs", description: "See all 24 packs across 6 strategic domains" },
    { href: "/engines", title: "54 Engines", description: "What you unlock with higher-tier plans" },
    { href: "/enterprise", title: "Enterprise", description: "Custom plans with dedicated infrastructure", badge: "Enterprise" },
  ],
  "/status": [
    { href: "/architecture", title: "Architecture", description: "The topology behind these health metrics" },
    { href: "/support", title: "Support Center", description: "Get help if something isn't working" },
    { href: "/changelog", title: "Changelog", description: "Recent changes that may affect status" },
  ],
  "/careers": [
    { href: "/about", title: "About CMPSBL", description: "Our mission and the team you'd join" },
    { href: "/architecture", title: "Technical Architecture", description: "The system you'd help build" },
    { href: "/roadmap", title: "Product Roadmap", description: "What's shipping next" },
  ],
  "/scanner": [
    { href: "/engines", title: "54 Engines", description: "The processing arsenal behind every scan" },
    { href: "/try", title: "Try the Substrate", description: "Interactive demo beyond scanning", badge: "Demo" },
    { href: "/start", title: "Start Building", description: "Get full access with 3 free memory slots" },
  ],
  "/showcase": [
    { href: "/foundry", title: "The Foundry", description: "Where showcased discoveries originate" },
    { href: "/memory-stream", title: "Memory Stream", description: "The discovery substrate feeding the showcase" },
    { href: "/engines", title: "54 Engines", description: "The composable arsenal behind each showcase entry" },
  ],
  "/lab": [
    { href: "/foundry", title: "The Foundry", description: "Explore system-discovered capabilities" },
    { href: "/engines", title: "54 Engines", description: "The engine arsenal available for experiments" },
    { href: "/documentation", title: "Documentation", description: "API reference for lab integrations" },
  ],
  "/academy": [
    { href: "/documentation", title: "Documentation Hub", description: "Full API reference and guides" },
    { href: "/vanilla-dev-guide", title: "Dev Guide", description: "Plain-language building guide" },
    { href: "/api-access", title: "API Access", description: "Get your keys and start integrating" },
    { href: "/start", title: "Start Here", description: "Quickstart with 3 free memory slots" },
  ],
};

/** Get related pages for a given path. Falls back to a generic set. */
export function getCrossLinks(path: string): CrossLink[] {
  // Normalize trailing slashes
  const normalized = path.replace(/\/+$/, "") || "/";
  
  if (LINK_DB[normalized]) return LINK_DB[normalized];
  
  // Fallback: show core pages
  return [
    { href: "/architecture", title: "Substrate Architecture", description: "Explore the 40-primitive cognitive topology" },
    { href: "/engines", title: "54 Composable Engines", description: "Browse the full engine arsenal" },
    { href: "/try", title: "Try It Live", description: "Zero-signup interactive substrate demo", badge: "Demo" },
    { href: "/start", title: "Start Building", description: "Get 3 free memory slots — no credit card", badge: "Free" },
  ];
}
