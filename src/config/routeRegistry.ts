/**
 * Route Registry — Single source of truth for all live public routes.
 * Used to dynamically generate robots.txt, sitemap.xml, and llms.txt content.
 * 
 * RULES:
 * - Only list routes that serve actual content (not redirects)
 * - Keep sorted by section, then priority descending
 * - When adding/removing routes in publicRoutes.tsx, update this registry
 */

export interface RouteEntry {
  path: string;
  label: string;
  section: RouteSection;
  /** 0.0–1.0 sitemap priority */
  priority: number;
  /** sitemap changefreq */
  changefreq: "daily" | "weekly" | "monthly";
  /** If true, blocked from crawlers (admin, auth, etc.) */
  disallow?: boolean;
  /** If true, route is a redirect — excluded from sitemap/llms */
  redirect?: boolean;
  /** Short description for llms.txt */
  description?: string;
}

export type RouteSection =
  | "core"
  | "product"
  | "developer"
  | "docs"
  | "tools"
  | "explore"
  | "company"
  | "standards"
  | "legal"
  | "protected";

const DOMAIN = "https://cmpsbl.com";

// ─── LIVE ROUTES ─────────────────────────────────────────────

export const routeRegistry: RouteEntry[] = [
  // ── Core ──
  { path: "/", label: "Homepage", section: "core", priority: 1.0, changefreq: "weekly", description: "CMPSBL cognitive substrate homepage" },
  { path: "/ai-operating-system", label: "How It Works", section: "core", priority: 0.95, changefreq: "monthly", description: "Architecture & concepts of the AI Operating System" },
  { path: "/modules", label: "All Nodes", section: "core", priority: 0.92, changefreq: "weekly", description: "Browse every substrate node" },
  { path: "/runtime", label: "Runtime", section: "core", priority: 0.85, changefreq: "monthly", description: "Execution environment" },
  { path: "/foundations", label: "Foundations", section: "core", priority: 0, changefreq: "monthly", redirect: true },
  { path: "/os", label: "Substrate OS", section: "core", priority: 0.88, changefreq: "weekly", description: "Authenticated substrate command center" },
  { path: "/capability-map", label: "Capability Map", section: "core", priority: 0, changefreq: "monthly", redirect: true },
  { path: "/system-integrity", label: "System Integrity", section: "core", priority: 0, changefreq: "monthly", redirect: true },
  { path: "/status", label: "System Status", section: "core", priority: 0, changefreq: "monthly", redirect: true },
  { path: "/evolution", label: "Evolution", section: "core", priority: 0, changefreq: "monthly", redirect: true },

  // ── Product ──
  { path: "/store", label: "Store", section: "product", priority: 0.95, changefreq: "weekly", description: "Agents, engines, plans & memories" },
  { path: "/foundry", label: "Memory Stream", section: "product", priority: 0.95, changefreq: "daily", description: "Discover & crystallize memory pipelines" },
  { path: "/persistent-memory", label: "Persistent Memory", section: "product", priority: 0.92, changefreq: "monthly", description: "4-tier memory for any agent" },
  { path: "/packs", label: "Capability Packs", section: "product", priority: 0.88, changefreq: "weekly", description: "Activate substrate capabilities" },
  { path: "/store", label: "Store", section: "product", priority: 0.90, changefreq: "weekly", description: "Agents, engines, plans & memories" },
  { path: "/enterprise", label: "Enterprise", section: "product", priority: 0.85, changefreq: "monthly", description: "Scale with governed orchestration" },
  { path: "/pricing-method", label: "Pricing Methodology", section: "product", priority: 0.65, changefreq: "monthly", description: "Transparent pricing model" },
  { path: "/feed-dream-eater", label: "Dream Feeder", section: "product", priority: 0, changefreq: "monthly", redirect: true },
  { path: "/dream-eater/archaeology", label: "Dream Archaeology", section: "product", priority: 0.65, changefreq: "monthly", description: "Historical dream pattern analysis" },
  { path: "/dream-eater/artifacts", label: "Dream Artifacts", section: "product", priority: 0.65, changefreq: "monthly", description: "Crystallized dream outputs" },
  { path: "/proof", label: "Proof Mode", section: "product", priority: 0, changefreq: "monthly", redirect: true },
  { path: "/gaming", label: "Gaming Substrate", section: "product", priority: 0.78, changefreq: "monthly", description: "AI gaming infrastructure" },
  { path: "/showcase", label: "Showcase", section: "product", priority: 0.82, changefreq: "weekly", description: "S-Tier demonstrations" },
  { path: "/intent-mesh", label: "Intent Mesh", section: "product", priority: 0.78, changefreq: "weekly", description: "Cross-node intent routing visualization" },
  { path: "/clockless-world-engine", label: "Clockless World Engine", section: "product", priority: 0, changefreq: "monthly", redirect: true },
  { path: "/scan", label: "Scanner", section: "product", priority: 0.72, changefreq: "monthly", description: "Accessibility & security scanner" },
  { path: "/scanner", label: "Scanner Tool", section: "product", priority: 0, changefreq: "monthly", redirect: true },
  { path: "/engines/:slug", label: "Engine Detail", section: "product", priority: 0.70, changefreq: "weekly", description: "Individual engine details" },
  { path: "/agents/:slug", label: "Agent Detail", section: "product", priority: 0.70, changefreq: "weekly", description: "Individual agent details" },

  // ── Developer ──
  { path: "/documentation", label: "Documentation", section: "developer", priority: 0.92, changefreq: "weekly", description: "API reference & guides" },
  { path: "/api-access", label: "API Access", section: "developer", priority: 0.88, changefreq: "monthly", description: "Keys, quotas & usage" },
  { path: "/workspace", label: "Builder Workspace", section: "developer", priority: 0.88, changefreq: "weekly", description: "SDK, terminal & build tools" },
  { path: "/codelab", label: "CodeLab", section: "developer", priority: 0.88, changefreq: "weekly", description: "Execute and test in real-time" },
  { path: "/academy", label: "Academy", section: "developer", priority: 0.85, changefreq: "weekly", description: "Tutorials, learning tracks & certification" },
  { path: "/developers", label: "Developer Showcase", section: "developer", priority: 0.85, changefreq: "weekly", description: "Community & integrations" },
  { path: "/developers/guide", label: "Developer Guide", section: "developer", priority: 0.82, changefreq: "monthly", description: "SDK setup & integration" },
  { path: "/devtools", label: "DevTools", section: "developer", priority: 0.75, changefreq: "monthly", description: "Development tools" },
  { path: "/start-here", label: "Start Here", section: "developer", priority: 0, changefreq: "monthly", redirect: true },
  { path: "/changelog", label: "Changelog", section: "developer", priority: 0.78, changefreq: "weekly", description: "Releases & updates" },
  { path: "/use-cases", label: "Use Cases", section: "developer", priority: 0.80, changefreq: "monthly", description: "Real-world applications" },
  { path: "/lab", label: "Lab", section: "developer", priority: 0.72, changefreq: "monthly", description: "Experimentation sandbox" },

  // ── Docs ──
  { path: "/docs/persistent-memory", label: "Persistent Memory Docs", section: "docs", priority: 0.78, changefreq: "monthly", description: "Memory system documentation" },
  { path: "/docs/runtime", label: "Runtime Reference", section: "docs", priority: 0.75, changefreq: "monthly", description: "Runtime API reference" },
  { path: "/docs/manifest", label: "Capability Manifest", section: "docs", priority: 0.72, changefreq: "monthly", description: "Complete capability catalog" },
  { path: "/docs/system", label: "System Docs", section: "docs", priority: 0.72, changefreq: "monthly", description: "System-level documentation" },
  { path: "/docs/substrate/capabilities", label: "Capabilities Reference", section: "docs", priority: 0.75, changefreq: "monthly", description: "Substrate capabilities documentation" },
  { path: "/docs/academic-v13", label: "Academic V13", section: "docs", priority: 0.65, changefreq: "monthly", description: "Academic specification v13" },

  // ── Standards ──
  { path: "/namespace", label: "Namespace (AIGVRN)", section: "standards", priority: 0.85, changefreq: "monthly", description: "AI Governance Reference Namespace" },
  { path: "/llms-txt", label: "LLMs.txt", section: "standards", priority: 0.82, changefreq: "monthly", description: "Machine-readable AI context standard" },
  { path: "/humans-txt", label: "Humans.txt", section: "standards", priority: 0.65, changefreq: "monthly", description: "Human-readable credits" },

  // ── Explore / Company ──
  { path: "/blog", label: "Blog", section: "company", priority: 0.90, changefreq: "daily", description: "Research, updates & origin stories" },
  { path: "/about", label: "About", section: "company", priority: 0.82, changefreq: "monthly", description: "Mission & team" },
  { path: "/solutions", label: "Solutions", section: "company", priority: 0.82, changefreq: "monthly", description: "Industry solutions" },
  { path: "/contact", label: "Contact", section: "company", priority: 0.72, changefreq: "monthly", description: "Get in touch" },
  { path: "/investors", label: "Investors", section: "company", priority: 0.72, changefreq: "monthly", description: "Investor information" },
  { path: "/careers", label: "Careers", section: "company", priority: 0.65, changefreq: "monthly", description: "Open positions" },
  { path: "/projects", label: "Current Projects", section: "company", priority: 0.65, changefreq: "monthly", description: "Active projects" },
  { path: "/roadmap", label: "Roadmap", section: "company", priority: 0.85, changefreq: "weekly", description: "Future plans" },
  { path: "/support", label: "Support", section: "company", priority: 0.65, changefreq: "monthly", description: "Help & FAQ" },
  { path: "/publication", label: "Publication", section: "company", priority: 0.72, changefreq: "monthly", description: "Academic publications" },
  { path: "/heritage-paper", label: "Heritage Paper", section: "company", priority: 0.60, changefreq: "monthly", description: "System heritage & lineage" },
  { path: "/promptfluid", label: "PromptFluid", section: "company", priority: 0.60, changefreq: "monthly", description: "Legacy brand portal" },

  // ── Legal ──
  { path: "/privacy", label: "Privacy Policy", section: "legal", priority: 0.45, changefreq: "monthly", description: "Privacy policy" },
  { path: "/terms", label: "Terms of Service", section: "legal", priority: 0.45, changefreq: "monthly", description: "Terms of service" },

  // ── Protected (disallowed) ──
  { path: "/auth", label: "Auth", section: "protected", priority: 0, changefreq: "monthly", disallow: true },
  { path: "/admin", label: "Admin", section: "protected", priority: 0, changefreq: "monthly", disallow: true },
  { path: "/a/", label: "Agency Portals", section: "protected", priority: 0, changefreq: "monthly", disallow: true },
];

// ─── DERIVED HELPERS ─────────────────────────────────────────

/** All crawlable routes (not disallowed, not dynamic params) */
export const crawlableRoutes = routeRegistry.filter(
  (r) => !r.disallow && !r.redirect && !r.path.includes(":")
);

/** Routes grouped by section */
export function routesBySection() {
  const map = new Map<RouteSection, RouteEntry[]>();
  for (const r of crawlableRoutes) {
    const list = map.get(r.section) || [];
    list.push(r);
    map.set(r.section, list);
  }
  return map;
}

/** Full URL for a path */
export function fullUrl(path: string) {
  return `${DOMAIN}${path}`;
}

export const SITE_DOMAIN = DOMAIN;

// ─── GENERATORS ──────────────────────────────────────────────

const TODAY = new Date().toISOString().slice(0, 10);

/** Generate sitemap.xml content */
export function generateSitemapXml(): string {
  const entries = crawlableRoutes
    .sort((a, b) => b.priority - a.priority)
    .map(
      (r) =>
        `  <url><loc>${fullUrl(r.path)}</loc><lastmod>${TODAY}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority.toFixed(2)}</priority></url>`
    );

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- CMPSBL® Substrate Sitemap — Auto-generated ${TODAY} -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- HOMEPAGE -->
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.00</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${DOMAIN}/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/" />
  </url>

${entries.filter((e) => !e.includes(`${DOMAIN}/</loc>`)).join("\n")}

</urlset>`;
}

/** Generate robots.txt content */
export function generateRobotsTxt(): string {
  const allowPaths = crawlableRoutes
    .filter((r) => r.path !== "/")
    .map((r) => `Allow: ${r.path}${r.path.endsWith("/") ? "*" : ""}`)
    .join("\n");

  const disallowPaths = routeRegistry
    .filter((r) => r.disallow)
    .map((r) => `Disallow: ${r.path}${r.path.endsWith("/") ? "" : "\nDisallow: " + r.path + "/*"}`)
    .join("\n");

  // Common AI crawlers get the same subset
  const aiAllowPaths = crawlableRoutes
    .filter((r) => ["core", "product", "developer", "docs", "standards", "company"].includes(r.section))
    .filter((r) => r.path !== "/")
    .map((r) => `Allow: ${r.path}`)
    .join("\n");

  return `# CMPSBL® Substrate — robots.txt
# ${SITE_DOMAIN}/robots.txt
# Auto-generated: ${TODAY}

# =============================================================
# DEFAULT: Allow all crawlers
# =============================================================
User-agent: *
Allow: /
Crawl-delay: 0.5

# Sitemap locations
Sitemap: ${SITE_DOMAIN}/sitemap.xml

# LLM Context Files
Allow: /llms.txt
Allow: /llms-txt
Allow: /humans.txt
Allow: /humans-txt
Allow: /.well-known/ai-plugin.json
Allow: /.well-known/security.txt

# =============================================================
# PUBLIC PAGES
# =============================================================
${allowPaths}

# =============================================================
# PROTECTED AREAS: Block sensitive routes
# =============================================================
${disallowPaths}
Disallow: /api/
Disallow: /checkout/redirect
Disallow: /composable-cognitives/success
Disallow: /composable-cognitives/download
Disallow: /marketplace/success
Disallow: /substrate/licensing/success
Disallow: /clear-cache
Disallow: /pf-clear-cache
Disallow: /*.json$
Disallow: /*?*preview=
Disallow: /*?*draft=

# =============================================================
# GOOGLE CRAWLERS
# =============================================================
User-agent: Googlebot
Crawl-delay: 0
Allow: /

User-agent: Googlebot-Image
Allow: /assets/
Allow: /images/
Allow: /*.jpg$
Allow: /*.png$
Allow: /*.webp$
Allow: /*.svg$

User-agent: Googlebot-Video
Allow: /

User-agent: Googlebot-News
Allow: /blog/

User-agent: Google-Extended
Crawl-delay: 3
${aiAllowPaths}

User-agent: Google-InspectionTool
Allow: /

# =============================================================
# BING & MICROSOFT CRAWLERS
# =============================================================
User-agent: bingbot
Crawl-delay: 0.5
Allow: /

User-agent: msnbot
Crawl-delay: 1
Allow: /

User-agent: BingPreview
Allow: /

# =============================================================
# AI SEARCH CRAWLERS
# =============================================================

User-agent: GPTBot
Crawl-delay: 5
${aiAllowPaths}
Disallow: /admin
Disallow: /api/

User-agent: ChatGPT-User
Crawl-delay: 5
${aiAllowPaths}

User-agent: anthropic-ai
Crawl-delay: 5
${aiAllowPaths}

User-agent: Claude-Web
Crawl-delay: 5
${aiAllowPaths}

User-agent: ClaudeBot
Crawl-delay: 5
${aiAllowPaths}

User-agent: PerplexityBot
Crawl-delay: 5
${aiAllowPaths}

User-agent: Google-Safety
Allow: /

User-agent: FacebookBot
Crawl-delay: 2
Allow: /

User-agent: meta-externalagent
Crawl-delay: 5
${aiAllowPaths}

User-agent: cohere-ai
Crawl-delay: 5
${aiAllowPaths}

User-agent: CCBot
Crawl-delay: 10
${aiAllowPaths}
Disallow: /admin

User-agent: Amazonbot
Crawl-delay: 5
Allow: /

User-agent: Applebot
Crawl-delay: 1
Allow: /

User-agent: YouBot
Crawl-delay: 5
${aiAllowPaths}

User-agent: BraveBot
Crawl-delay: 2
Allow: /

User-agent: DuckDuckBot
Crawl-delay: 1
Allow: /

# =============================================================
# SOCIAL MEDIA CRAWLERS
# =============================================================
User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: Slackbot
Allow: /

User-agent: Discordbot
Allow: /

User-agent: TelegramBot
Allow: /

User-agent: WhatsApp
Allow: /

# =============================================================
# SEO TOOL CRAWLERS
# =============================================================
User-agent: AhrefsBot
Crawl-delay: 5
Allow: /

User-agent: SemrushBot
Crawl-delay: 5
Allow: /

User-agent: MJ12bot
Crawl-delay: 10
Allow: /

User-agent: DotBot
Crawl-delay: 5
Allow: /

# =============================================================
# BLOCK BAD BOTS
# =============================================================
User-agent: SemaltBot
Disallow: /

User-agent: MegaIndex.ru
Disallow: /

User-agent: BLEXBot
Disallow: /

User-agent: DataForSeoBot
Disallow: /

# =============================================================
# HOST DIRECTIVE
# =============================================================
Host: ${SITE_DOMAIN}`;
}

/** Generate llms.txt key pages section from registry */
export function generateLlmsKeyPages(): string {
  const sectionLabels: Record<string, string> = {
    core: "KEY PAGES",
    product: "PRODUCTS & FEATURES",
    developer: "DEVELOPER RESOURCES",
    docs: "DOCUMENTATION",
    standards: "STANDARDS",
    company: "COMPANY",
    legal: "LEGAL",
  };

  const sections = routesBySection();
  const lines: string[] = [];

  for (const [section, label] of Object.entries(sectionLabels)) {
    const routes = sections.get(section as RouteSection);
    if (!routes?.length) continue;
    lines.push(`## ${label}\n`);
    for (const r of routes) {
      lines.push(`- ${r.label}: ${fullUrl(r.path)}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
