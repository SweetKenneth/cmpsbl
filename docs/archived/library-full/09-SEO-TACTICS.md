# CMPSBL® SEO Tactics & Installed Features

**Epoch:** CONTRACT (V13)  
**Classification:** Internal  
**Date:** 2026-02  

---

## 1. SEO Architecture

### 1.1 Centralized SEO Map

All SEO metadata is managed through a single registry: `src/lib/seo/seoMap.ts`

**Rules enforced:**
- Title ≤ 60 characters with primary keyword front-loaded
- Meta description 140–160 characters with clear value proposition
- Unique primary keyword per page (zero cannibalization)
- No version numbers, module counts, or changing metrics in any SEO field
- No "world first," "coming soon," or roadmap claims
- Unique OG image per section

### 1.2 SEO Map Structure

```typescript
interface PageSEO {
  title: string;           // ≤60 chars, keyword first
  description: string;     // 140-160 chars
  ogTitle: string;         // Open Graph title
  ogDescription: string;   // Open Graph description
  ogImage: string;         // Section-specific OG image URL
  keywords: string[];      // 6-8 longtail keywords including 2026 terms
  schema: 'home' | 'feature' | 'docs' | 'blog' | 'about' | 'legal' | 'contact' | 'product' | 'article';
  intent: string;          // Search intent classification
  primaryKeyword: string;  // Unique per page
  noindex?: boolean;       // Admin/internal pages
}
```

### 1.3 Hook Integration

```typescript
import { usePageSEO } from '@/hooks/usePageSEO';

// Auto-resolves SEO from current route
const { helmetProps } = usePageSEO();

// Usage with SEO component
<SEO {...helmetProps} />
```

---

## 2. Indexed Pages & Keywords

### 2.1 Core Public Pages

| Route | Title | Primary Keyword |
|-------|-------|----------------|
| `/` | Composable AI Infrastructure \| CMPSBL | composable AI infrastructure |
| `/os` | AI Substrate Runtime \| CMPSBL | AI substrate runtime |
| `/ai-operating-system` | AI Operating System \| CMPSBL | AI operating system |
| `/modules` | Substrate Modules — AI Architecture | modular AI substrate architecture |
| `/store` | AI Artifact Store — Capabilities | composable AI artifacts store |
| `/composable-cognitives` | Composable Cognitives — AI Agents | composable cognitive agents |
| `/engines` | AI Orchestration Engines | AI orchestration engines |
| `/persistent-memory` | Persistent Memory for AI Agents | persistent memory for AI agents |

### 2.2 Feature Pages

| Route | Title | Primary Keyword |
|-------|-------|----------------|
| `/decode` | DECODE — Natural Language AI Terminal | natural language AI terminal |
| `/feed-dream-eater` | Dream Feeder — Autonomous Learning | autonomous AI dream learning cycles |
| `/proof` | Proof Mode — Verifiable AI Execution | verifiable AI execution proof |
| `/demo` | Live Demo — CMPSBL Substrate in Action | AI substrate live demo |
| `/demos` | Advanced Demos — Cognitive Architecture | advanced cognitive architecture demos |

### 2.3 Business Pages

| Route | Title | Primary Keyword |
|-------|-------|----------------|
| `/upgrade` | Pricing & Plans | AI substrate pricing plans |
| `/developers` | Developer Documentation | AI substrate developer docs |
| `/about` | About CMPSBL | about CMPSBL PromptFluid |
| `/investors` | Investor Relations | CMPSBL investor relations |

### 2.4 Noindexed Pages (Admin/Internal)

All admin routes (`/admin/*`), internal tools (`/forge`, `/codelab`, `/devtools`), and utility pages are marked with `noindex: true`.

---

## 3. Structured Data (JSON-LD)

### 3.1 Schema Types by Page Category

| Schema Type | Used On | Purpose |
|------------|---------|---------|
| `home` | `/` | Organization + WebSite schema |
| `feature` | Module pages, feature pages | SoftwareApplication schema |
| `product` | Store, cognitives, engines | Product schema |
| `docs` | Documentation pages | TechArticle schema |
| `blog` | Blog posts | BlogPosting schema |
| `article` | Long-form content | Article schema |
| `about` | About page | Organization schema |
| `legal` | Terms, privacy | WebPage schema |
| `contact` | Contact page | ContactPage schema |

### 3.2 Implementation

JSON-LD is injected via React Helmet based on the `schema` field from the SEO map. Each page type gets appropriate structured data without manual configuration.

---

## 4. Technical SEO Features

### 4.1 Installed & Active

| Feature | Implementation | Status |
|---------|---------------|--------|
| **Meta Title/Description** | Centralized seoMap + usePageSEO hook | ✅ Active |
| **Open Graph Tags** | Per-section OG images + titles | ✅ Active |
| **Semantic HTML** | Single H1 per page, proper heading hierarchy | ✅ Active |
| **Alt Text** | Required on all images via component props | ✅ Active |
| **Lazy Loading** | Images use `loading="lazy"` | ✅ Active |
| **Responsive Viewport** | `<meta name="viewport">` on all pages | ✅ Active |
| **Canonical Tags** | Via React Helmet | ✅ Active |
| **PWA Support** | vite-plugin-pwa installed | ✅ Active |
| **No Keyword Cannibalization** | Unique `primaryKeyword` per page | ✅ Active |
| **Noindex on Admin** | `noindex: true` for internal routes | ✅ Active |
| **Keyword Strategy** | 2026 longtail + agentic AI terms | ✅ Active |
| **Intent Classification** | Each page tagged with search intent | ✅ Active |

### 4.2 OG Image Strategy

Section-specific OG images prevent social sharing with generic images:

```
/og/home.jpg              — Homepage
/og/substrate-os.jpg      — Substrate/OS pages
/og/store.jpg             — Store/marketplace
/og/developers.jpg        — Developer docs
/og/pricing.jpg           — Pricing pages
/og/blog.jpg              — Blog posts
/og/about.jpg             — About/company
/og/documentation.jpg     — Documentation
/og/modules.jpg           — Module/feature pages
/og/solutions.jpg         — Solutions/use cases
/og/investors.jpg         — Investor pages
/og/academy.jpg           — Academy/learning
/og/cognitives.jpg        — Composable Cognitives
/og/engines.jpg           — Orchestration engines
/og/persistent-memory.jpg — Memory feature
/og/decode.jpg            — DECODE terminal
/og/dream-feeder.jpg      — Dream system
/og/proof.jpg             — Proof mode
/og/gaming.jpg            — Gaming integration
/og/architecture.jpg      — Architecture pages
/og/evolution-mesh.jpg    — Evolution mesh
/og/intent-mesh.jpg       — Intent mesh
```

---

## 5. Keyword Strategy

### 5.1 Primary Categories

| Category | Example Keywords |
|----------|-----------------|
| **Brand** | CMPSBL, composable AI, PromptFluid |
| **Product** | AI substrate, cognitive infrastructure, AI operating system |
| **Feature** | persistent memory AI, AI dream cycles, verifiable AI |
| **Technical** | agentic AI platform, context engineering, multi-agent orchestration |
| **Market** | AI governance, AI compliance, regulated AI |

### 5.2 Longtail Keywords (2026 Focus)

- "composable AI infrastructure for enterprise"
- "persistent memory for AI agents API"
- "governed self-evolving AI system"
- "AI substrate with compliance audit trail"
- "agentic AI with ethical constraints"
- "AI agent memory that persists between sessions"
- "context engineering platform"
- "self-improving AI with governance gates"

### 5.3 Anti-Patterns (Avoided)

- ❌ No version numbers in titles or descriptions
- ❌ No module/capability counts (they change)
- ❌ No "world first" or superlative claims
- ❌ No "coming soon" or roadmap language
- ❌ No duplicate primary keywords across pages
- ❌ No generic titles ("Home", "Features", "About Us")

---

## 6. Performance SEO

### 6.1 Build Optimizations

| Optimization | Tool | Impact |
|-------------|------|--------|
| Code splitting | Vite dynamic imports | Reduced initial bundle |
| Tree shaking | Vite/Rollup | Dead code elimination |
| Asset optimization | Vite built-in | Image/font compression |
| CSS purging | Tailwind JIT | Minimal CSS output |
| Deferred init | Triple-deferred substrate boot | Zero main-thread blocking |

### 6.2 Loading Strategy

```
Critical Path:  HTML → CSS → React Shell → Route Component
Deferred:       Substrate Init → Module Boot → Persistence Rehydration
Lazy:           3D scenes → charts → admin panels
```

---

## 7. SEO Functions Reference

```typescript
// Get SEO for any route
import { getSEO } from '@/lib/seo/seoMap';
const seo: PageSEO = getSEO('/persistent-memory');

// Hook for React components
import { usePageSEO } from '@/hooks/usePageSEO';
const { entry, helmetProps } = usePageSEO();

// Access individual OG images
const ogImage = seo.ogImage;  // Section-specific URL

// Check if page should be indexed
const shouldIndex = !seo.noindex;

// Get search intent
const intent = seo.intent;  // 'Brand/Category', 'Feature/Capability', etc.
```

---

## 8. Monitoring & Iteration

### 8.1 SEO Health Checks

- Run `getSEO()` for every public route — verify no missing entries
- Verify all titles ≤ 60 characters
- Verify all descriptions 140–160 characters
- Verify no duplicate `primaryKeyword` values across the map
- Verify OG images resolve (no 404s)

### 8.2 Future Improvements

- Sitemap.xml auto-generation from seoMap keys
- robots.txt dynamic generation
- Canonical URL auto-injection per route
- Hreflang tags for internationalization
- Rich snippet testing integration

---

© 2025–2026 PromptFluid®. All rights reserved.
