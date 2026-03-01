# GTM Strategy — 05 Pricing Architecture

**Classification:** Internal  
**Date:** 2026-03

---

## 1. Core Subscription Pricing

| Tier | Monthly | Annual | Annual Savings |
|------|---------|--------|---------------|
| Free / Builder | $0 | $0 | — |
| Creator | $29/mo | $276/yr | $72 (20%) |
| Architect | $79/mo | $756/yr | $192 (20%) |
| Enterprise | Custom | Custom | Negotiated |

### Stripe Product IDs

| Tier | Interval | Price ID | Product ID |
|------|----------|----------|------------|
| Creator | Monthly | `price_1T5VsXQ7FtTiAL4aj5FIIVCu` | `prod_U3d8z2sorSG4sI` |
| Creator | Annual | `price_1T5VsgQ7FtTiAL4ahx89OgVH` | `prod_U3d84gNyBRQgeu` |
| Architect | Monthly | `price_1T5VsZQ7FtTiAL4aCNAQYuY3` | `prod_U3d8XbUwCGrcfO` |
| Architect | Annual | `price_1T5VshQ7FtTiAL4a2cWVOSVU` | `prod_U3d8M0yNFGpGTw` |

---

## 2. Agent Packs (One-Time)

Priced per template with activation slot management. Pricing TBD per pack based on complexity and module count.

---

## 3. Standalone Clone Pricing

| Component | Model | Indicative Range |
|-----------|-------|-----------------|
| SDK | Free (MIT) | $0 |
| Hosted API | Usage-based | $0.001–$0.05 per call |
| Self-hosted license | Annual | $2,400–$24,000/yr |
| Premium features | Tier-gated | Mirrors substrate tiers |

---

## 4. Upgrade Pressure Design

The depth-cap model creates natural upgrade pressure:

1. **Visible limits** — users see their namespace count, routing priority, and asset caps
2. **Soft walls** — features degrade gracefully (slower routing, not broken routing)
3. **Usage signals** — approaching caps triggers contextual upgrade prompts
4. **Trial depth** — occasional "Architect for a day" promotions show full depth

---

© 2025–2026 PromptFluid®. All rights reserved.
