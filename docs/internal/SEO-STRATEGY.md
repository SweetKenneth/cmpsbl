# CMPSBL SEO Strategy — v9.1.0 ARCHITECT

**Date:** 2026-02-13  
**Status:** Active  
**Classification:** INTERNAL

---

## Canonical Strategy

All pages self-canonical to `https://cmpsbl.com/{path}`.

- **No page** should canonical to promptfluid.com, evolv.onl, or any other domain
- The `<SEO />` component auto-generates canonicals from `window.location.pathname` when no explicit canonical is passed
- Explicit canonicals should only be used when the URL slug differs from the route path

### Rules
1. Every route gets exactly ONE `<link rel="canonical">` pointing to `https://cmpsbl.com/...`
2. Every route gets exactly ONE `<script type="application/ld+json">` WebPage schema — no duplicates
3. All `@id` and `url` fields in JSON-LD must reference `cmpsbl.com`

---

## Page Intent Map

| Route | Primary Intent | Title (≤65 chars) | H1 |
|-------|---------------|-------------------|-----|
| `/` | AI Operating System overview | CMPSBL® — Cognitive Infrastructure for AI | CMPSBL — Where Machines Learn To Think |
| `/os` | Technical substrate detail | Substrate OS v9.1.0 — AI Operating System | The AI Operating System |
| `/library` | Capability exploration | Capability Library — 400+ AI Functions | Explore 400+ Capabilities |
| `/intelligence` | Platform intelligence | Intelligence Dashboard — Real-Time AI Insights | Intelligence |
| `/about` | Company/founder info | About CMPSBL — Founded 2009, Dallas TX | About CMPSBL |
| `/blog` | Content hub | Blog — AI Infrastructure Insights | CMPSBL Blog |
| `/modules` | Module architecture | 21 Modules — AI Operating System Architecture | 21 Integrated Modules |
| `/investors` | Acquisition opportunity | Acquisition Opportunity — CMPSBL® | Investment & Acquisition |
| `/documentation` | Developer docs | Documentation — CMPSBL Developer Guide | Documentation |

---

## Schema Usage Rules

| Schema Type | Where Used | Max Per Page |
|-------------|-----------|-------------|
| Organization | Global (via SEO component) | 1 (site-wide) |
| WebSite | Global (via SEO component) | 1 (site-wide) |
| WebPage | Every page (via SEO component) | 1 |
| SoftwareApplication | Global (via SEO component) | 1 (site-wide) |
| FAQPage | `/`, `/os`, module pages | 1 per page |
| Article | Blog posts only | 1 per post |
| BreadcrumbList | All pages with breadcrumbs | 1 |
| Product | Product pages only | 1 per product |

---

## Crawl Files

| File | Domain | Status |
|------|--------|--------|
| `/robots.txt` | cmpsbl.com | ✅ Clean |
| `/sitemap.xml` | cmpsbl.com | ✅ Clean |
| `/sitemap-blog.xml` | cmpsbl.com | ✅ Migrated from promptfluid.com |
| `/sitemap-products.xml` | cmpsbl.com | ✅ Migrated from promptfluid.com |
| `/sitemap-index.xml` | cmpsbl.com | ✅ Clean |
| `/llms.txt` | cmpsbl.com | ✅ Migrated from promptfluid.com refs |

---

## Module Count Sync

All public-facing references must use:
- **21 modules** (not 14)
- **400+ capabilities** (not 325)
- **200 synergy pipelines** (not 147)
- **360+ terminal commands** (not 310)

---

## Changelog

### 2026-02-13 — SEO Canonical Repair Patch
- Migrated all canonical URLs from promptfluid.com → cmpsbl.com
- Added route-aware canonical auto-generation to SEO component
- Updated all sitemap files to cmpsbl.com domain
- Fixed llms.txt API base URL and module counts
- Updated schema references across page components
- Synced Breadcrumbs component to cmpsbl.com
- Updated page titles to use CMPSBL branding
