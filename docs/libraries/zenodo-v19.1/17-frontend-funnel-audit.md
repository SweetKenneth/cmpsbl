# 17 — Front-Facing Site Audit (Nav, Footer, CTAs, IP Hygiene)

**Classification:** INTERNAL — Strategy
**Goal:** Funnel anonymous visitors → `/ascension-v2` (Run Diagnostic) or `/plans` (Pro upgrade), while protecting IP and removing noise.

---

## 1. Snapshot of Current State

- **Nav (`CmpsblNav.tsx`)**: 4 sections, 18 items, primary CTA `Run Diagnostic → /ascension-v2`. Clean.
- **Footer (`EnhancedFooter.tsx`)**: 4 columns × 6 links + 7 legal links + 4-tier price strip. **Stale — references old 4-tier model and dead routes.**
- **Route registry**: 80+ public routes. Many are internal/legacy and dilute SEO + funnel.

---

## 2. Findings

### 🔴 Footer drift (must fix)
| Issue | Current | Should be |
|---|---|---|
| Tier strip | `Builder · Studio $29 · Creator $49 · Architect $79` | `Free · Pro` (matches new `/plans`) |
| `Junkyard` link | `/junkyard` | **Remove** — internal discovery surface, not a sale |
| `Marketplace` external | `marketplace.cmpsbl.com` | Redirect to `/store` (already done in nav) |
| `Verticals` link | `/verticals` | **Remove** — dual-gated IP, footer exposure leaks intent |
| `Try the Substrate` | `/try` | Replace with **`Run Diagnostic` → /ascension-v2** (the actual funnel) |
| `Status` | `/status` | Redirect (already in registry) — drop from footer |
| `PromptFluid™` | `/promptfluid` | **Remove** — legacy brand, confuses positioning |

### 🟡 Nav noise
- `Software Symbiosis` under Company is a vision page — belongs under Resources or removed (low conversion).
- `Heritage Paper` under Resources is good, but duplicate `Award` icon w/ Investors. Use distinct icon.
- `Use Cases` should live under **Products → Explore**, not Explore solo (it's the proof column for sale pages).

### 🟢 Nav strengths (keep)
- Single primary CTA (`Run Diagnostic`) — strong funnel.
- Products section leads with `Shield (FREE)` — perfect top-of-funnel hook.
- `Plans` correctly tagged "Free or Pro".

### 🛡 IP exposure (block from public surfaces)
Routes that are in the registry as public but should be **internally-linked only** (no nav, no footer):
- `/foundry` — Memory Stream is live IP; keep in nav (it's a proof piece) but **never in footer or sitemap with high priority**. Lower sitemap priority from 0.95 → 0.6.
- `/dream-eater/*` — synthesis outputs. Drop from sitemap entirely.
- `/intent-mesh`, `/clockless-world-engine`, `/lab` — research surfaces. Disallow.
- `/agent-forge`, `/agent-power-up` — gated capability. Disallow until productized.
- `/codelab`, `/devtools` — internal builder tooling. Disallow.

### 🗑 Dead/redirect routes still cluttering registry
`/modules`, `/foundations`, `/capability-map`, `/system-integrity`, `/status`, `/evolution`, `/start-here`, `/scanner`, `/clockless-world-engine`, `/feed-dream-eater`, `/proof` — all marked `redirect:true`. Good. Just confirm none are linked from nav/footer (they're not).

---

## 3. Recommended Funnel Architecture

```
          ┌─────────────────────────────────────────┐
          │         ANONYMOUS VISITOR               │
          └────────────────────┬────────────────────┘
                               ▼
         ┌─────────────────────────────────────────┐
         │  TOP OF FUNNEL (free hooks)             │
         │  /shield · /scan · /ascension-v2        │
         └────────────────────┬────────────────────┘
                              ▼
         ┌─────────────────────────────────────────┐
         │  PROOF (why it works)                   │
         │  /case-studies · /showroom · /use-cases │
         └────────────────────┬────────────────────┘
                              ▼
         ┌─────────────────────────────────────────┐
         │  CONVERT                                │
         │  /plans (Free → Pro)                    │
         │  /assembly (Enterprise service)         │
         └─────────────────────────────────────────┘
```

**Single primary CTA across all surfaces:** `Run Diagnostic → /ascension-v2`
**Single secondary CTA:** `View Plans → /plans`
Everything else is supporting evidence.

---

## 4. Surface-by-Surface Recommendations

### NAV (keep 4 sections, tighten)
- **Products**: Shield · Ascension · Mana · Memory Stream · Assembly *(unchanged — strong)*
- **Explore**: Store · Showroom · Use Cases · **Case Studies** *(promote from Resources — it's proof)*
- **Resources**: User Guides · Blog · Changelog · Heritage Paper *(drop Case Studies, drop Software Symbiosis)*
- **Company**: About · Plans · Investors · Contact *(drop Software Symbiosis — link from About instead)*

### FOOTER (4 columns × 5 links — uniform)
- **Products**: Shield · Ascension · Mana · Store · **Plans** *(highlight)*
- **Resources**: Documentation · Heritage Paper *(highlight)* · API Access · Blog · Changelog
- **Explore**: Showroom · Case Studies · Use Cases · Enterprise · Architecture
- **Company**: About · Investors · Roadmap · Contact · Support

**Tier strip:** `Free · Pro` only.
**Drop:** Junkyard, Marketplace external, Verticals, /try, Status, PromptFluid.

### CTAs
- Header: `Run Diagnostic` (unchanged ✅)
- Homepage hero: `Run Diagnostic` (primary) + `View Plans` (secondary)
- Footer: `View Plans →` (unchanged ✅)
- Every product page bottom: `Run Diagnostic` button

---

## 5. SEO / Sitemap Hygiene
- Drop sitemap priority for `/foundry` (0.95 → 0.6) — it's IP-leaning.
- Disallow: `/dream-eater/*`, `/intent-mesh`, `/clockless-world-engine`, `/lab`, `/agent-forge`, `/agent-power-up`, `/codelab`, `/devtools`, `/restoration-shop`, `/showcase`, `/investor-showcase`.
- Keep high-priority crawl: `/`, `/ai-operating-system`, `/architecture`, `/plans`, `/ascension-v2`, `/shield`, `/mana`, `/store`, `/blog`, `/case-studies`, `/use-cases`, `/about`, `/contact`.

---

## 6. Implementation Order (smallest credit-cost first)
1. **Footer rewrite** (`EnhancedFooter.tsx`) — tier strip + link cleanup. Single file.
2. **Nav reshuffle** (`CmpsblNav.tsx`) — move Case Studies, drop Software Symbiosis. Single file.
3. **Route registry** — flip `disallow:true` on the IP-protected routes. Single file.
4. **Auto-regenerated** at build: `robots.txt` + `sitemap.xml` (handled by `vite-seo-file-generator.ts`).

---

© 2025–2026 CMPSBL®. Internal Use Only.
