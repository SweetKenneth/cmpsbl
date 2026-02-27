# PromptFluid Clarity v4.1.0 (Universal Supabase Edition)
## Design Roadmap & Architecture Blueprint

**Version:** 4.1.0 (Universal Supabase Edition)  
**Status:** Merged Architecture Update  
**Author:** PromptFluid Engineering  
**Date:** 2025-11-08

---

## Executive Summary

Transform PromptFluid Clarity from WordPress-exclusive plugin to a **universal JavaScript accessibility agent** deployable on any website via a single `<script>` tag. The system will perform autonomous WCAG 2.2/ARIA compliance scanning, AI-powered auto-fixing, and continuous monitoring with full integration into the PromptFluid ecosystem (Brain, Nexus, Vision, Access).

**Core Philosophy:** "Install once, comply forever."

---

## Phase 1: Current State Analysis

### Existing Architecture (v3.0.0)

#### WordPress Plugin Components
1. **Scanner** (`class-scanner.php`)
   - Initiates scans via API endpoint `/pf-clarity-api/scan`
   - Stores scan results in WordPress database
   - Limited to WordPress DOM structure
   - Requires PHP backend

2. **Fixer** (`class-clarity-fixer.php`)
   - Applies fixes through WordPress custom CSS/JS injection
   - Stores active fixes in `wp_options` table
   - Uses Nexus for AI-generated fix code
   - Integrates with Brain for learning

3. **Edge Functions**
   - `pf-clarity-scan` - Basic HTML accessibility checks (6 patterns)
   - `pf-clarity-fix` - Auto-fix for 3 WCAG criteria (1.1.1, 3.1.1, 2.4.6)

4. **Database Schema**
   - `PFCLARITY_TABLE_SCANS` - Scan records
   - `PFCLARITY_TABLE_ISSUES` - Detected violations
   - `PFCLARITY_TABLE_FIXES` - Applied fix log

### Limitations of Current Design
- ❌ WordPress-only (PHP dependency)
- ❌ Manual installation per site
- ❌ Limited scan coverage (6 checks vs 75+ needed)
- ❌ No real-time monitoring
- ❌ Fixes stored in WordPress DB only
- ❌ No platform auto-detection
- ❌ No visual diff/rollback UI

### Reusable Components
- ✅ Nexus AI integration pattern
- ✅ Brain learning pipeline structure
- ✅ Fix generation prompt engineering
- ✅ WCAG criterion mapping logic
- ✅ Issue severity classification

---

## Phase 2: Universal Architecture Blueprint

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        ANY WEBSITE                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │  <script src="clarity.js" data-key="..."></script> │     │
│  └────────────────────────────────────────────────────┘     │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────┐       │
│  │         PromptFluid Clarity Agent (JS)           │       │
│  │  • Environment Detector                          │       │
│  │  • DOM Scanner (75+ checks)                      │       │
│  │  • Fix Injector                                  │       │
│  │  • Rollback Manager                              │       │
│  │  • Sync Engine                                   │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────────┐
         │   PromptFluid Backend Ecosystem      │
         ├──────────────────────────────────────┤
         │  Nexus → AI Fix Generation           │
         │  Brain → Pattern Learning            │
         │  Vision → Analytics Dashboard        │
         │  Access → Licensing & Auth           │
         │  Defense → Bot Protection            │
         └──────────────────────────────────────┘
```

### Core Modules

#### 1. **clarity.js** (Main Agent - ~60KB minified)
**Purpose:** Embeddable script injected into target website

**Capabilities:**
- Auto-detects environment (WP, Shopify, Wix, React, static HTML)
- Authenticates with PromptFluid API via secure token
- Initializes scanner and monitoring loops
- Manages localStorage for backup/rollback
- Handles paywall prompts and upgrade CTAs

**API:**
```javascript
window.PromptFluidClarity = {
  version: "4.1.0",
  scan: () => Promise<ScanResult>,
  fix: (issueId: string) => Promise<FixResult>,
  rollback: (fixId: string) => Promise<void>,
  getStatus: () => AgentStatus,
  configure: (options: ConfigOptions) => void
}
```

#### 2. **agent.js** (Monitoring Daemon - ~15KB)
**Purpose:** Persistent background process for continuous compliance

**Features:**
- Observes DOM mutations (MutationObserver API)
- Throttled periodic scans (default: every 30 min)
- Drift detection (new violations after fixes applied)
- Offline queue for failed sync attempts
- Auto-pause during low battery/slow network

**Sync Protocol:**
```javascript
{
  site_id: "uuid",
  scan_timestamp: "iso8601",
  issues_detected: number,
  issues_fixed: number,
  compliance_score: 0-100,
  delta: { new: [], resolved: [], regressed: [] },
  agent_version: "4.1.0"
}
```

#### 3. **wizard.js** (Setup Assistant - ~20KB)
**Purpose:** Interactive installation flow

**Steps:**
1. **Platform Detection**
   - Check for WP REST API, Shopify Liquid tags, Wix SDK
   - Inspect meta tags, framework signatures
   - Fallback to "Custom/Unknown"

2. **Installation Method**
   - **WordPress:** Generate plugin or snippet
   - **Shopify:** Generate app extension code
   - **Wix:** Provide embed widget instructions
   - **Static/Custom:** Copy-paste `<script>` tag

3. **Initial Scan Preview**
   - Run lightweight scan (10 core checks)
   - Show "Before/After" mockup
   - Display estimated fix count

4. **Paywall Decision Point**
   - Free: See results only
   - Pro ($49/mo): Auto-fix + monitoring
   - Studio ($99/mo): White-label + API access

5. **Activation**
   - Verify script loaded correctly
   - Run full 75+ check scan
   - Register site with PromptFluid Access

#### 4. **dashboard-bridge.js** (Vision Integration - ~10KB)
**Purpose:** Real-time data sync to Vision dashboard

**Metrics Pushed:**
- Compliance score trend (daily/weekly/monthly)
- Issue breakdown by severity (critical/warning/info)
- Fix application rate
- Scan frequency and coverage
- Platform/framework type

**Endpoints:**
- `POST /api/vision/clarity/sync` - Push agent metrics
- `GET /api/vision/clarity/sites` - List monitored sites
- `GET /api/vision/clarity/history/:site_id` - Historical data

---

## Phase 3: Agent Technical Specification

### Scanner Engine (86+ Checks)

**Fix-First Methodology:** PromptFluid Clarity applies all auto-fixable issues immediately, then generates a human review report for remaining semi-fixable and manual-only items. This approach maximizes compliance velocity while maintaining transparency.

#### Auto-Fixable (Machine-Solvable) - 45+ Checks

| WCAG Criterion | Issue | Fix Logic |
|----------------|-------|-----------|
| **1.1.1** | Missing alt text | AI-generate via Nexus image-to-text |
| **1.3.1** | Missing form labels | Wrap input with `<label>` or add `aria-label` |
| **1.4.3** | Low contrast | Adjust color values to meet 4.5:1 ratio |
| **2.1.1** | Non-keyboard elements | Add `tabindex="0"` and `role` |
| **2.4.4** | Ambiguous link text | Append context via `aria-label` |
| **2.4.6** | Multiple H1s | Convert extras to H2 |
| **3.1.1** | Missing lang attribute | Add `<html lang="en">` |
| **3.2.2** | Unexpected context change | Add `aria-live` announcements |
| **3.3.2** | Missing error messages | Inject `aria-describedby` error text |
| **4.1.2** | Invalid ARIA roles | Correct role attributes |

*+ 35 more covering forms, navigation, multimedia, timing, readability*

#### Semi-Fixable (Requires Review) - 20 Checks
- Complex color schemes (need brand approval)
- Video captions (need upload)
- PDF accessibility (need document edit)
- Interactive widget custom roles

#### Manual Only - 10 Checks
- Content clarity and readability
- Logical reading order
- Meaningful sequence
- Cognitive load assessment

### Fix Generation Pipeline

**Auto-Fix-First Process:**

```
1. Issue Detection & Classification
   ↓
2. Separate Issues into Categories
   │  • Auto-fixable (apply immediately)
   │  • Semi-fixable (flag for review)
   │  • Manual-only (report to user)
   ↓
3. Execute Auto-Fixes (Batch Processing)
   │  • Query Nexus with structured prompt
   │  • Include DOM context + WCAG rule
   │  • Receive CSS/JS/HTML patch
   ↓
4. Validate Fixes (Safe Mode)
   │  • Test in isolated iframe
   │  • Verify no layout breaks
   │  • Check for JS errors
   ↓
5. Create Rollback Points
   │  • Snapshot affected DOM nodes
   │  • Store in localStorage as JSON
   ↓
6. Apply All Valid Fixes
   │  • Inject style/script tags
   │  • Mark with data-pf-fix-id attributes
   ↓
7. Re-scan After Fixes
   │  • Confirm issues resolved
   │  • Detect any new regressions
   ↓
8. Generate Human Review Report
   │  • List unresolved semi-fixable items
   │  • Provide context and recommendations
   │  • Include manual-only compliance tasks
   ↓
9. Report to Brain & Vision
   │  • Send success/failure metrics
   │  • Update pattern learning DB
   │  • Sync dashboard analytics
```

### Nexus Integration Pattern

**Prompt Template for Alt Text:**
```
Generate a concise alt text (max 125 characters) for this image context:

Image URL: {img.src}
Surrounding text: {context.text}
Page title: {document.title}
Semantic role: {context.role}

Requirements:
- Describe content and function
- Avoid "image of" redundancy
- Match page context tone
```

**Prompt Template for Contrast Fix:**
```
Adjust these color values to meet WCAG AA contrast ratio (4.5:1 for text, 3:1 for large):

Foreground: {color.fg}
Background: {color.bg}
Current ratio: {ratio.current}
Element: {element.selector}

Constraints:
- Preserve hue if possible
- Minimize visual disruption
- Return HSL values
```

### Rollback System

**Storage Structure (localStorage):**
```json
{
  "pf_clarity_backups": {
    "fix_abc123": {
      "timestamp": "2025-11-08T12:00:00Z",
      "wcag": "1.1.1",
      "selector": "img.hero",
      "original_html": "<img src='...' />",
      "applied_fix": "<img src='...' alt='...' />",
      "dependencies": ["fix_xyz789"]
    }
  }
}
```

**Rollback Procedure:**
1. Retrieve backup by `fix_id`
2. Remove injected style/script tags
3. Restore original DOM structure
4. Update issue status to "open"
5. Clear from active fixes registry
6. Log rollback event to Brain

### Performance & Safety

**Throttling:**
- Max 1 scan per 30 minutes (configurable)
- CPU usage cap: 5% sustained, 15% burst
- Network: Max 500KB/day for sync

**Safe Mode Triggers:**
- 3+ failed fix attempts → pause auto-fix
- JS error detected after fix → auto-rollback
- Compliance score drops >10 points → alert + pause

**Privacy:**
- No screenshots or content scraped
- Only structural data sent (selectors, attributes)
- Anonymize user-generated content in logs
- GDPR-compliant data retention (90 days)

---

## Phase 4: Setup Wizard Flow

### UI/UX Wireframe

```
┌──────────────────────────────────────────────────┐
│  🎯 PromptFluid Clarity Setup Wizard             │
├──────────────────────────────────────────────────┤
│                                                  │
│  Step 1: Detecting your website...              │
│  ✓ Platform: WordPress 6.4                      │
│  ✓ Theme: Astra Pro                             │
│  ✓ Page Builder: Elementor                      │
│                                                  │
│  ┌────────────────────────────────────┐         │
│  │  Choose Installation Method:       │         │
│  │  ◉ Auto-install plugin (recommended) │       │
│  │  ○ Manual snippet injection        │         │
│  └────────────────────────────────────┘         │
│                                                  │
│  [Continue →]                                    │
│                                                  │
├──────────────────────────────────────────────────┤
│  Step 2: Initial Scan Results                   │
│                                                  │
│  🔴 12 Critical Issues                           │
│  🟡 8 Warnings                                   │
│  🔵 3 Recommendations                            │
│                                                  │
│  Top Issues:                                     │
│  • 7 images missing alt text                    │
│  • 3 form inputs without labels                 │
│  • Low contrast on CTA buttons                  │
│                                                  │
│  ┌────────────────────────────────────┐         │
│  │  Preview Auto-Fix (Mock)           │         │
│  │  [Before] | [After]                │         │
│  └────────────────────────────────────┘         │
│                                                  │
│  [← Back] [Start Free Trial →]                  │
│                                                  │
├──────────────────────────────────────────────────┤
│  Step 3: Choose Your Plan                       │
│                                                  │
│  ○ Free - View scans only                       │
│  ◉ Pro ($49/mo) - Auto-fix + monitoring         │
│  ○ Studio ($99/mo) - White-label + API          │
│                                                  │
│  [Activate Clarity →]                            │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Platform Detection Logic

**Detection Matrix:**

| Platform | Detection Method | Confidence |
|----------|------------------|------------|
| **WordPress** | `/wp-json/` endpoint exists | 99% |
| **Shopify** | `window.Shopify` object + `myshopify.com` | 99% |
| **Wix** | `<meta name="generator" content="Wix.com">` | 95% |
| **Squarespace** | `<script src="squarespace...">` | 95% |
| **Webflow** | `<html data-wf-...>` | 95% |
| **React** | `<div id="root">` + `__REACT...` | 80% |
| **Next.js** | `<script id="__NEXT_DATA__">` | 90% |
| **Vue** | `<div id="app">` + `__VUE__` | 80% |
| **Custom** | None of the above | N/A |

**Auto-Injection Methods:**

1. **WordPress:**
   ```php
   // Generated snippet
   add_action('wp_head', function() {
     echo '<script src="https://spobyzaevtmijcwbqzmv.supabase.co/storage/v1/object/public/clarity/clarity.js" data-key="..."></script>';
   });
   ```

2. **Shopify:**
   ```liquid
   <!-- theme.liquid -->
   {% include 'promptfluid-clarity' %}
   ```

3. **Static/Custom:**
   ```html
   <!-- Copy-paste before </body> -->
   <script src="https://spobyzaevtmijcwbqzmv.supabase.co/storage/v1/object/public/clarity/clarity.js" 
           data-key="pk_live_abc123xyz" 
           data-site="yoursite.com"></script>
   ```

---

## Phase 4B: Monetization & Licensing Integration

### Overview

Transform PromptFluid Clarity into a revenue-generating product with a complete four-tier monetization system integrated with Stripe payments and the PromptFluid Access licensing module. This phase establishes the commercial foundation for sustainable growth while maintaining accessibility for free-tier users.

**Business Philosophy:** "Free to discover, paid to deliver, enterprise to scale."

---

### Pricing Structure

#### Tier 1: Free (Discovery Tier)
**Price:** $0/month  
**Target:** Small businesses, bloggers, accessibility curious

**Features:**
- ✅ Single full scan per month
- ✅ Compliance score dashboard (view only)
- ✅ Issue breakdown by severity
- ✅ Demo auto-fix on 2-3 sample issues (fixed examples)
- ✅ Before/after preview mockups
- ✅ Educational tooltips on WCAG rules
- ✅ PDF report (compliance summary only)
- ❌ No auto-fix capabilities
- ❌ No monitoring or re-scanning
- ❌ No rollback system
- ❌ No priority support

**Conversion Strategy:**
- Show "locked" auto-fix buttons with upgrade CTA
- Display estimated time savings with paid plan
- Highlight compliance risk score for unfixed issues
- Offer 7-day trial of Continuous Compliance tier

**Technical Limits:**
```json
{
  "scans_per_month": 1,
  "issues_auto_fixed": 0,
  "demo_fixes_shown": 3,
  "pages_per_scan": 5,
  "sites_allowed": 1,
  "api_access": false,
  "monitoring_enabled": false,
  "retention_days": 30
}
```

---

#### Tier 2: One-Time Fix (Project Tier)
**Price:** $199 flat fee (one-time purchase)  
**Target:** Small-to-medium sites needing immediate compliance, agencies with one-off projects

**Features:**
- ✅ Complete site scan (up to 50 pages)
- ✅ Full auto-fix for all machine-solvable issues (45+ WCAG rules)
- ✅ Visual diff before applying fixes
- ✅ Compliance certificate (PDF + badge embed code)
- ✅ 30-day rollback backup stored locally
- ✅ Export full issue report (CSV, JSON, PDF)
- ✅ Email support (48-hour response)
- ❌ No continuous monitoring (one-time service)
- ❌ No re-scanning after initial fix
- ❌ No multi-site support

**Payment Flow:**
- Stripe one-time payment (`payment_mode: payment`)
- Instant activation post-payment
- License valid for 30 days for rollback access
- After 30 days, fixes remain but no further changes

**Use Cases:**
- Pre-launch compliance sprint
- Audit-driven remediation
- Agency white-label deliverable
- Budget-constrained projects

**Technical Limits:**
```json
{
  "scans_total": 1,
  "pages_per_scan": 50,
  "issues_auto_fixed": "unlimited",
  "rollback_window_days": 30,
  "sites_allowed": 1,
  "api_access": false,
  "monitoring_enabled": false,
  "retention_days": 30
}
```

---

#### Tier 3: Continuous Compliance (SaaS Tier)
**Price:** $69/month or $690/year (17% savings)  
**Target:** Growing businesses, product companies, SaaS platforms

**Features:**
- ✅ Unlimited scans and re-scans
- ✅ Auto-fix for all machine-solvable issues
- ✅ Continuous monitoring with drift detection
- ✅ Automatic re-fixing when new violations appear
- ✅ Monthly compliance reports (email + dashboard)
- ✅ Up to 3 sites/domains
- ✅ 6-month compliance history retention
- ✅ Rollback system (90-day window)
- ✅ Webhook notifications for compliance changes
- ✅ Priority email support (24-hour response)
- ✅ Compliance badge + widget for marketing
- ❌ No white-label reports
- ❌ No API access for custom integrations

**Payment Flow:**
- Stripe subscription (`payment_mode: subscription`)
- Monthly or annual billing cycles
- Auto-renewal with 7-day grace period
- Pause (not cancel) option to retain data

**Monitoring Behavior:**
- Agent scans every 6 hours (configurable)
- Detects content changes, new pages, regressions
- Auto-applies fixes within confidence threshold (>85%)
- Alerts via email/webhook for issues requiring review

**Use Cases:**
- E-commerce sites with frequent updates
- Marketing sites with campaign pages
- SaaS apps with evolving UI
- Compliance-conscious brands

**Technical Limits:**
```json
{
  "scans_per_day": "unlimited",
  "pages_per_scan": 100,
  "sites_allowed": 3,
  "issues_auto_fixed": "unlimited",
  "monitoring_frequency_hours": 6,
  "rollback_window_days": 90,
  "retention_days": 180,
  "api_access": false,
  "webhooks_enabled": true,
  "support_sla_hours": 24
}
```

---

#### Tier 4: Enterprise (White-Glove Tier)
**Price:** $249/month (custom pricing for >25 sites)  
**Target:** Agencies, large enterprises, multi-brand organizations

**Features:**
- ✅ All Continuous Compliance features
- ✅ Unlimited sites/domains
- ✅ White-label reports and branding
- ✅ Full REST API + GraphQL endpoint
- ✅ Custom webhook integrations
- ✅ Dedicated AI model fine-tuning (brand-specific fixes)
- ✅ Advanced analytics (site comparisons, benchmarking)
- ✅ Multi-user team access with role-based permissions
- ✅ Priority support (4-hour response, Slack/Discord direct line)
- ✅ Quarterly compliance audits (manual review by accessibility expert)
- ✅ Custom rule builder (org-specific requirements)
- ✅ 2-year compliance history retention
- ✅ SSO/SAML authentication
- ✅ Custom SLA agreements

**Payment Flow:**
- Stripe subscription (custom pricing via sales team)
- Annual contract minimum
- Volume discounts for >25 sites
- Add-ons: dedicated instance, on-premise deployment

**Advanced Features:**
- **White-Label:**
  - Custom domain hosting (clarity.yourbrand.com)
  - Replace PromptFluid branding with client logo
  - Reseller program with revenue sharing

- **API Access:**
  - RESTful endpoints for scan triggering, results retrieval
  - GraphQL for complex queries
  - Webhooks for real-time events
  - SDK libraries (JavaScript, Python, PHP)

- **Team Management:**
  - Admin, Editor, Viewer roles
  - Site-level permissions
  - Audit logs for all actions

**Use Cases:**
- Digital agencies managing client portfolios
- Franchises with multi-location sites
- Enterprise IT departments
- Compliance-as-a-Service providers

**Technical Limits:**
```json
{
  "scans_per_day": "unlimited",
  "pages_per_scan": "unlimited",
  "sites_allowed": "unlimited",
  "issues_auto_fixed": "unlimited",
  "monitoring_frequency_hours": 1,
  "rollback_window_days": 365,
  "retention_days": 730,
  "api_access": true,
  "webhooks_enabled": true,
  "custom_rules": true,
  "sso_enabled": true,
  "support_sla_hours": 4,
  "dedicated_success_manager": true
}
```

---

### Stripe Integration Architecture

#### Product & Pricing Setup

**Stripe API Calls for Product Creation:**

```javascript
// supabase/functions/pf-clarity-stripe-setup/index.ts

import Stripe from 'https://esm.sh/stripe@14.14.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'), {
  apiVersion: '2023-10-16',
});

// Create Free Tier (no Stripe product needed - managed internally)

// Create One-Time Fix Product
const oneTimeFixProduct = await stripe.products.create({
  name: 'PromptFluid Clarity - One-Time Fix',
  description: 'Complete accessibility remediation for your website (one-time service)',
  metadata: {
    tier: 'one_time_fix',
    plan_code: 'clarity_otf',
    access_level: 'project'
  }
});

const oneTimeFixPrice = await stripe.prices.create({
  product: oneTimeFixProduct.id,
  unit_amount: 19900, // $199.00
  currency: 'usd',
  metadata: {
    tier: 'one_time_fix',
    scans_total: '1',
    pages_per_scan: '50',
    rollback_days: '30'
  }
});

// Create Continuous Compliance Product
const continuousProduct = await stripe.products.create({
  name: 'PromptFluid Clarity - Continuous Compliance',
  description: 'Unlimited scans, auto-fix, and monitoring for up to 3 sites',
  metadata: {
    tier: 'continuous',
    plan_code: 'clarity_cc',
    access_level: 'saas'
  }
});

const continuousMonthlyPrice = await stripe.prices.create({
  product: continuousProduct.id,
  unit_amount: 6900, // $69.00
  currency: 'usd',
  recurring: {
    interval: 'month',
    usage_type: 'licensed'
  },
  metadata: {
    billing_cycle: 'monthly',
    sites_allowed: '3',
    retention_days: '180'
  }
});

const continuousYearlyPrice = await stripe.prices.create({
  product: continuousProduct.id,
  unit_amount: 69000, // $690.00 (17% discount)
  currency: 'usd',
  recurring: {
    interval: 'year',
    usage_type: 'licensed'
  },
  metadata: {
    billing_cycle: 'yearly',
    sites_allowed: '3',
    retention_days: '180',
    discount_percent: '17'
  }
});

// Create Enterprise Product
const enterpriseProduct = await stripe.products.create({
  name: 'PromptFluid Clarity - Enterprise',
  description: 'Unlimited sites, white-label, API access, priority support',
  metadata: {
    tier: 'enterprise',
    plan_code: 'clarity_ent',
    access_level: 'enterprise'
  }
});

const enterprisePrice = await stripe.prices.create({
  product: enterpriseProduct.id,
  unit_amount: 24900, // $249.00
  currency: 'usd',
  recurring: {
    interval: 'month',
    usage_type: 'licensed'
  },
  metadata: {
    sites_allowed: 'unlimited',
    api_access: 'true',
    white_label: 'true',
    sso_enabled: 'true'
  }
});
```

---

#### Checkout Session Creation

**Edge Function: `pf-clarity-checkout`**

```typescript
// supabase/functions/pf-clarity-checkout/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.14.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'), {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    const { 
      price_id, 
      tier, 
      site_url, 
      user_id,
      success_url,
      cancel_url 
    } = await req.json();

    // Validate user and site
    const { data: siteData, error: siteError } = await supabase
      .from('pf_clarity_sites')
      .select('id')
      .eq('site_url', site_url)
      .single();

    if (siteError && siteError.code !== 'PGRST116') {
      throw new Error('Site validation failed');
    }

    const site_id = siteData?.id || crypto.randomUUID();

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: tier === 'one_time_fix' ? 'payment' : 'subscription',
      success_url: success_url || `${Deno.env.get('APP_URL')}/clarity/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${Deno.env.get('APP_URL')}/clarity/pricing`,
      customer_email: undefined, // Will prompt for email
      metadata: {
        user_id,
        site_id,
        site_url,
        tier,
        plan_code: `clarity_${tier}`,
        source: 'promptfluid_clarity',
      },
      subscription_data: tier !== 'one_time_fix' ? {
        metadata: {
          site_id,
          tier,
        },
      } : undefined,
    });

    // Store pending license in Access module
    await supabase
      .from('pf_access_pending_licenses')
      .insert({
        user_id,
        site_id,
        tier,
        stripe_session_id: session.id,
        status: 'pending_payment',
        created_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: session.url,
        session_id: session.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

#### Webhook Handler

**Edge Function: `pf-clarity-stripe-webhook`**

```typescript
// supabase/functions/pf-clarity-stripe-webhook/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.14.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'), {
      apiVersion: '2023-10-16',
    });

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    console.log('Webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { user_id, site_id, tier } = session.metadata;

        console.log('Payment completed:', { user_id, site_id, tier });

        // Activate license in Access module
        const { error: licenseError } = await supabase
          .from('pf_access_licenses')
          .insert({
            user_id,
            site_id,
            tier,
            status: 'active',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription || null,
            activated_at: new Date().toISOString(),
            expires_at: tier === 'one_time_fix' 
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
              : null, // Subscriptions don't expire until canceled
          });

        if (licenseError) {
          console.error('License activation failed:', licenseError);
          throw licenseError;
        }

        // Remove pending license
        await supabase
          .from('pf_access_pending_licenses')
          .delete()
          .eq('stripe_session_id', session.id);

        // Send confirmation email via Resend
        await supabase.functions.invoke('pf-clarity-send-confirmation', {
          body: {
            user_id,
            site_id,
            tier,
            stripe_session_id: session.id,
          },
        });

        // Log to Brain for learning
        await supabase.functions.invoke('pf-brain-learn', {
          body: {
            event: 'clarity_license_activated',
            data: {
              tier,
              site_id,
              payment_amount: session.amount_total / 100,
              currency: session.currency,
            },
          },
        });

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const status = subscription.status;

        // Update license status
        const { error: updateError } = await supabase
          .from('pf_access_licenses')
          .update({
            status: status === 'active' ? 'active' : 'inactive',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('License update failed:', updateError);
        }

        // If canceled, disable monitoring agent
        if (status === 'canceled') {
          await supabase
            .from('pf_clarity_sites')
            .update({ monitoring_enabled: false })
            .eq('id', subscription.metadata.site_id);
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscription_id = invoice.subscription;

        // Grace period: 7 days before disabling
        await supabase
          .from('pf_access_licenses')
          .update({
            status: 'payment_failed',
            grace_period_ends: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription_id);

        // Send payment failure notification
        await supabase.functions.invoke('pf-clarity-send-payment-failed', {
          body: { invoice_id: invoice.id },
        });

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

---

### Access Module Integration

#### License Validation Flow

**Database Schema Addition:**

```sql
-- Pending licenses (checkout initiated but not completed)
CREATE TABLE pf_access_pending_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_id UUID NOT NULL,
  tier TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending_payment',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '1 hour'
);

-- Active licenses
CREATE TABLE pf_access_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_id UUID REFERENCES pf_clarity_sites(id),
  tier TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  activated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  grace_period_ends TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

CREATE INDEX idx_access_licenses_user ON pf_access_licenses(user_id);
CREATE INDEX idx_access_licenses_site ON pf_access_licenses(site_id);
CREATE INDEX idx_access_licenses_stripe_sub ON pf_access_licenses(stripe_subscription_id);

-- RLS Policies
ALTER TABLE pf_access_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_access_pending_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own licenses" ON pf_access_licenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own pending licenses" ON pf_access_pending_licenses
  FOR SELECT USING (auth.uid() = user_id);
```

---

#### License Check Function

**Edge Function: `pf-clarity-check-license`**

```typescript
// supabase/functions/pf-clarity-check-license/index.ts

export async function checkLicense(supabase, user_id: string, site_id: string) {
  const { data: license, error } = await supabase
    .from('pf_access_licenses')
    .select('*')
    .eq('user_id', user_id)
    .eq('site_id', site_id)
    .eq('status', 'active')
    .single();

  if (error || !license) {
    return {
      valid: false,
      tier: 'free',
      features: {
        scans_per_month: 1,
        auto_fix_enabled: false,
        monitoring_enabled: false,
        sites_allowed: 1,
      },
    };
  }

  // Check expiration (One-Time Fix tier only)
  if (license.tier === 'one_time_fix' && license.expires_at) {
    const expired = new Date(license.expires_at) < new Date();
    if (expired) {
      await supabase
        .from('pf_access_licenses')
        .update({ status: 'expired' })
        .eq('id', license.id);

      return {
        valid: false,
        tier: 'expired',
        message: 'One-Time Fix license expired (30 days elapsed)',
      };
    }
  }

  // Check grace period for failed payments
  if (license.status === 'payment_failed' && license.grace_period_ends) {
    const gracePeriodExpired = new Date(license.grace_period_ends) < new Date();
    if (gracePeriodExpired) {
      await supabase
        .from('pf_access_licenses')
        .update({ status: 'suspended' })
        .eq('id', license.id);

      return {
        valid: false,
        tier: 'suspended',
        message: 'License suspended due to payment failure',
      };
    }
  }

  // Return tier-specific features
  const tierFeatures = {
    free: {
      scans_per_month: 1,
      auto_fix_enabled: false,
      monitoring_enabled: false,
      sites_allowed: 1,
    },
    one_time_fix: {
      scans_total: 1,
      pages_per_scan: 50,
      auto_fix_enabled: true,
      monitoring_enabled: false,
      rollback_window_days: 30,
    },
    continuous: {
      scans_per_day: 'unlimited',
      auto_fix_enabled: true,
      monitoring_enabled: true,
      sites_allowed: 3,
      retention_days: 180,
    },
    enterprise: {
      scans_per_day: 'unlimited',
      auto_fix_enabled: true,
      monitoring_enabled: true,
      sites_allowed: 'unlimited',
      api_access: true,
      white_label: true,
    },
  };

  return {
    valid: true,
    tier: license.tier,
    features: tierFeatures[license.tier],
    license_id: license.id,
    activated_at: license.activated_at,
  };
}
```

---

### Onboarding Flow Integration

**Updated Wizard Flow (Post-Checkout):**

```
┌──────────────────────────────────────────────────┐
│  🎯 PromptFluid Clarity Setup Wizard             │
├──────────────────────────────────────────────────┤
│                                                  │
│  Step 1: Platform Detection                      │
│  [Already covered in Phase 4]                    │
│                                                  │
├──────────────────────────────────────────────────┤
│  Step 2: Initial Scan                            │
│  [Scan completes, shows issues]                  │
│                                                  │
├──────────────────────────────────────────────────┤
│  Step 3: Choose Your Plan ⭐ NEW                 │
│                                                  │
│  ┌────────────────────────────────────┐         │
│  │  Free Tier                         │         │
│  │  • View scan results only          │         │
│  │  • 1 scan/month                    │         │
│  │  [Start Free] ────────────────────→ Skip to dashboard
│  └────────────────────────────────────┘         │
│                                                  │
│  ┌────────────────────────────────────┐         │
│  │  One-Time Fix - $199               │         │
│  │  • Full auto-fix (one-time)        │         │
│  │  • Compliance certificate          │         │
│  │  [Buy Now] ───────────────────────→ Stripe Checkout
│  └────────────────────────────────────┘         │
│                                                  │
│  ┌────────────────────────────────────┐         │
│  │  Continuous Compliance - $69/mo    │         │
│  │  • Unlimited scans & monitoring    │         │
│  │  • 3 sites included                │         │
│  │  [Subscribe] ─────────────────────→ Stripe Checkout
│  └────────────────────────────────────┘         │
│                                                  │
│  ┌────────────────────────────────────┐         │
│  │  Enterprise - $249/mo              │         │
│  │  • Unlimited sites + API access    │         │
│  │  [Contact Sales]                   │         │
│  └────────────────────────────────────┘         │
│                                                  │
├──────────────────────────────────────────────────┤
│  Step 4: Payment Complete ✅ (Stripe Redirect)  │
│                                                  │
│  🎉 Welcome to Clarity [Tier Name]!             │
│                                                  │
│  Your license is now active:                     │
│  • Site: example.com                             │
│  • Tier: Continuous Compliance                   │
│  • Activated: 2025-11-08 14:32                   │
│  • Next billing: 2025-12-08                      │
│                                                  │
│  [Go to Dashboard →]                             │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Implementation:**

```typescript
// src/pages/clarity/ClarityWizard.tsx

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ClarityWizard() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [license, setLicense] = useState(null);

  useEffect(() => {
    // Check if returning from Stripe checkout
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      verifyCheckout(sessionId);
    }
  }, [searchParams]);

  async function verifyCheckout(sessionId: string) {
    const { data, error } = await supabase.functions.invoke('pf-clarity-verify-session', {
      body: { session_id: sessionId }
    });

    if (error) {
      toast.error('Payment verification failed. Please contact support.');
      return;
    }

    setLicense(data.license);
    setStep(4); // Skip to activation confirmation
    toast.success(`License activated: ${data.license.tier}`);
  }

  async function handleUpgrade(tier: string, priceId: string) {
    const { data, error } = await supabase.functions.invoke('pf-clarity-checkout', {
      body: {
        price_id: priceId,
        tier,
        site_url: window.location.hostname,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        success_url: `${window.location.origin}/clarity/wizard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/clarity/wizard`,
      }
    });

    if (error) {
      toast.error('Checkout failed. Please try again.');
      return;
    }

    // Redirect to Stripe Checkout
    window.location.href = data.checkout_url;
  }

  // ... rest of wizard component
}
```

---

### Dashboard Gating Logic

**License-Aware Component Wrapper:**

```typescript
// src/components/clarity/LicenseGate.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export function LicenseGate({ 
  children, 
  requiredTier, 
  feature 
}: { 
  children: React.ReactNode; 
  requiredTier: string[];
  feature: string;
}) {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLicense();
  }, []);

  async function checkLicense() {
    const { data } = await supabase.functions.invoke('pf-clarity-check-license', {
      body: {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        site_id: getCurrentSiteId(),
      }
    });

    setLicense(data);
    setLoading(false);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  const hasAccess = license?.valid && requiredTier.includes(license.tier);

  if (!hasAccess) {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center space-y-4">
            <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">Upgrade Required</h3>
            <p className="text-sm text-muted-foreground">
              {feature} is available on {requiredTier.join(' or ')} plan
            </p>
            <Button onClick={() => window.location.href = '/clarity/pricing'}>
              View Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Usage:
<LicenseGate requiredTier={['continuous', 'enterprise']} feature="Auto-fix">
  <AutoFixButton />
</LicenseGate>
```

---

### Environment Variables & Secrets

**Required Stripe Configuration:**

```bash
# Add to Supabase Secrets (already done via Lovable integration)
STRIPE_API_KEY=sk_live_...  # Production key
STRIPE_WEBHOOK_SECRET=whsec_...  # From Stripe webhook setup

# Optional (for development)
STRIPE_TEST_API_KEY=sk_test_...
STRIPE_TEST_WEBHOOK_SECRET=whsec_test_...
```

**Webhook Endpoint Setup (Stripe Dashboard):**

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://[your-supabase-url]/functions/v1/pf-clarity-stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. Copy webhook secret to Supabase secrets

---

### Testing Strategy

#### Test Scenarios

**1. Free Tier:**
- ✅ User can view scan results
- ✅ Auto-fix buttons show "Upgrade Required"
- ✅ Scan limit enforced (1/month)
- ✅ CTA buttons link to pricing page

**2. One-Time Fix:**
- ✅ Stripe checkout flow completes
- ✅ License activates immediately post-payment
- ✅ All issues auto-fixed successfully
- ✅ Rollback available for 30 days
- ✅ License expires after 30 days
- ✅ Post-expiration, fixes remain but no new changes

**3. Continuous Compliance:**
- ✅ Subscription activates monitoring agent
- ✅ Agent scans every 6 hours
- ✅ New issues auto-fixed
- ✅ Drift detection alerts sent
- ✅ Monthly report generated
- ✅ Subscription renewal handled automatically
- ✅ Payment failure triggers grace period

**4. Enterprise:**
- ✅ API access granted
- ✅ White-label branding applied
- ✅ Multiple sites managed under one account
- ✅ Team permissions enforced
- ✅ SSO login works

**Test Mode (Stripe Test Keys):**
- Use Stripe test card: `4242 4242 4242 4242`
- Test webhooks with Stripe CLI: `stripe listen --forward-to localhost:54321/functions/v1/pf-clarity-stripe-webhook`

---

### Metrics & Analytics

**Revenue Tracking:**

```sql
-- Monthly Recurring Revenue (MRR)
SELECT 
  DATE_TRUNC('month', activated_at) AS month,
  tier,
  COUNT(*) AS active_licenses,
  CASE 
    WHEN tier = 'continuous' THEN COUNT(*) * 69
    WHEN tier = 'enterprise' THEN COUNT(*) * 249
    ELSE 0
  END AS mrr
FROM pf_access_licenses
WHERE status = 'active'
  AND tier IN ('continuous', 'enterprise')
GROUP BY month, tier
ORDER BY month DESC;

-- One-Time Revenue
SELECT 
  DATE_TRUNC('month', activated_at) AS month,
  COUNT(*) AS one_time_sales,
  COUNT(*) * 199 AS revenue
FROM pf_access_licenses
WHERE tier = 'one_time_fix'
GROUP BY month
ORDER BY month DESC;

-- Churn Rate
SELECT 
  DATE_TRUNC('month', updated_at) AS month,
  tier,
  COUNT(*) AS churned_licenses
FROM pf_access_licenses
WHERE status = 'canceled'
GROUP BY month, tier
ORDER BY month DESC;
```

**Conversion Funnel:**

```
Free Scan → Upgrade Decision → Checkout Started → Payment Complete → Active User

Metrics:
- Scan-to-Checkout Conversion Rate (target: 15%)
- Checkout-to-Payment Conversion Rate (target: 80%)
- Free-to-Paid Conversion Rate (target: 12%)
- Trial-to-Paid Conversion Rate (Continuous tier 7-day trial: target: 40%)
```

---

### Growth Strategies

**Free Tier Conversion Tactics:**

1. **Time-Limited Discount:**
   - First 100 users: 20% off One-Time Fix
   - Seasonal promotions: Black Friday, Cyber Monday

2. **Referral Program:**
   - Refer 3 users → 1 month free Continuous Compliance
   - Agency partners: 20% revenue share on referrals

3. **Content Marketing:**
   - Case studies: "How [Company] achieved 95% compliance in 24 hours"
   - SEO: Rank for "WCAG compliance tool", "accessibility scanner"

4. **Freemium Hooks:**
   - Email sequence: Day 1 (welcome), Day 3 (compliance risks), Day 7 (upgrade offer)
   - In-app popups: "You have 8 fixable issues. Upgrade to fix them instantly."

**Retention Strategies:**

1. **Continuous Compliance Tier:**
   - Monthly compliance reports (showcase value)
   - Quarterly compliance score improvement tracking
   - Gamification: "95% club" badge for high scores

2. **Enterprise Tier:**
   - Dedicated success manager
   - Quarterly business reviews (QBRs)
   - Custom feature roadmap input

---

### Rollback Plan

**If Monetization Causes Issues:**

1. Disable Stripe checkout flows
2. Set all users to "legacy_free" tier with unlimited access
3. Refund any payments made in last 30 days
4. Re-evaluate pricing and feature gating
5. Communicate transparently with users

**Backup Schema:**

```sql
-- Preserve existing functionality
ALTER TABLE pf_access_licenses 
ADD COLUMN legacy_mode BOOLEAN DEFAULT FALSE;

UPDATE pf_access_licenses 
SET legacy_mode = TRUE 
WHERE activated_at < '2025-11-08'; -- Pre-monetization users
```

---

## Phase 5: WCAG 2.2 Compliance Matrix

### Complete Rule Coverage (86 Success Criteria)

#### Level A (25 Criteria)

| ID | Name | Auto-Fix | Logic |
|----|------|----------|-------|
| 1.1.1 | Non-text Content | ✅ Yes | AI alt text generation |
| 1.2.1 | Audio-only/Video-only | ❌ Manual | Requires transcript upload |
| 1.2.2 | Captions (Prerecorded) | ❌ Manual | Requires caption file |
| 1.2.3 | Audio Description | ❌ Manual | Requires audio track |
| 1.3.1 | Info and Relationships | ✅ Yes | Fix semantic HTML |
| 1.3.2 | Meaningful Sequence | ⚠️ Semi | Suggest tab order |
| 1.3.3 | Sensory Characteristics | ⚠️ Semi | Detect shape/color-only refs |
| 1.4.1 | Use of Color | ⚠️ Semi | Suggest icons + text |
| 1.4.2 | Audio Control | ❌ Manual | Add pause button |
| 2.1.1 | Keyboard | ✅ Yes | Add tabindex + focus styles |
| 2.1.2 | No Keyboard Trap | ✅ Yes | Fix focus management |
| 2.1.4 | Character Key Shortcuts | ⚠️ Semi | Detect conflicts |
| 2.2.1 | Timing Adjustable | ⚠️ Semi | Add timeout warning |
| 2.2.2 | Pause, Stop, Hide | ⚠️ Semi | Add controls |
| 2.3.1 | Three Flashes | ✅ Yes | Detect + remove animation |
| 2.4.1 | Bypass Blocks | ✅ Yes | Add skip links |
| 2.4.2 | Page Titled | ✅ Yes | Generate from H1 |
| 2.4.3 | Focus Order | ✅ Yes | Fix tab sequence |
| 2.4.4 | Link Purpose | ✅ Yes | Add context to links |
| 2.5.1 | Pointer Gestures | ⚠️ Semi | Detect multi-touch |
| 2.5.2 | Pointer Cancellation | ⚠️ Semi | Check event handlers |
| 2.5.3 | Label in Name | ✅ Yes | Match visible text |
| 2.5.4 | Motion Actuation | ⚠️ Semi | Detect shake/tilt |
| 3.1.1 | Language of Page | ✅ Yes | Add lang attribute |
| 3.2.1 | On Focus | ⚠️ Semi | Check focus handlers |
| 3.2.2 | On Input | ⚠️ Semi | Check input handlers |
| 3.3.1 | Error Identification | ✅ Yes | Add error messages |
| 3.3.2 | Labels or Instructions | ✅ Yes | Add form labels |
| 4.1.1 | Parsing | ✅ Yes | Fix HTML validity |
| 4.1.2 | Name, Role, Value | ✅ Yes | Add ARIA attributes |

#### Level AA (20 Criteria)

| ID | Name | Auto-Fix | Logic |
|----|------|----------|-------|
| 1.2.4 | Captions (Live) | ❌ Manual | Requires live service |
| 1.2.5 | Audio Description | ❌ Manual | Requires audio track |
| 1.3.4 | Orientation | ✅ Yes | Remove orientation lock |
| 1.3.5 | Identify Input Purpose | ✅ Yes | Add autocomplete attrs |
| 1.4.3 | Contrast (Minimum) | ✅ Yes | Adjust colors (4.5:1) |
| 1.4.4 | Resize Text | ✅ Yes | Remove fixed sizes |
| 1.4.5 | Images of Text | ⚠️ Semi | Suggest real text |
| 1.4.10 | Reflow | ✅ Yes | Fix responsive CSS |
| 1.4.11 | Non-text Contrast | ✅ Yes | Adjust UI colors (3:1) |
| 1.4.12 | Text Spacing | ✅ Yes | Remove restrictive CSS |
| 1.4.13 | Content on Hover/Focus | ✅ Yes | Add dismissible tooltips |
| 2.4.5 | Multiple Ways | ⚠️ Semi | Suggest sitemap |
| 2.4.6 | Headings and Labels | ✅ Yes | Fix heading hierarchy |
| 2.4.7 | Focus Visible | ✅ Yes | Add focus outlines |
| 2.5.5 | Target Size | ✅ Yes | Increase touch targets |
| 2.5.6 | Concurrent Input | ✅ Yes | Support multi-input |
| 3.1.2 | Language of Parts | ✅ Yes | Add lang to sections |
| 3.2.3 | Consistent Navigation | ⚠️ Semi | Check nav consistency |
| 3.2.4 | Consistent Identification | ⚠️ Semi | Check icon consistency |
| 3.3.3 | Error Suggestion | ⚠️ Semi | Suggest corrections |
| 3.3.4 | Error Prevention | ⚠️ Semi | Add confirmation |
| 4.1.3 | Status Messages | ✅ Yes | Add aria-live regions |

#### Level AAA (41 Criteria)

| ID | Name | Auto-Fix | Logic |
|----|------|----------|-------|
| 1.2.6 | Sign Language | ❌ Manual | Requires video overlay |
| 1.2.7 | Extended Audio Description | ❌ Manual | Requires extended track |
| 1.2.8 | Media Alternative | ❌ Manual | Requires transcript |
| 1.2.9 | Audio-only (Live) | ❌ Manual | Requires live captions |
| 1.4.6 | Contrast (Enhanced) | ✅ Yes | Adjust colors (7:1) |
| 1.4.7 | Low/No Background Audio | ❌ Manual | Audio engineering |
| 1.4.8 | Visual Presentation | ✅ Yes | Text block styling |
| 1.4.9 | Images of Text (No Exception) | ⚠️ Semi | Replace with text |
| 2.1.3 | Keyboard (No Exception) | ✅ Yes | Full keyboard support |
| 2.2.3 | No Timing | ⚠️ Semi | Remove time limits |
| 2.2.4 | Interruptions | ⚠️ Semi | Add postpone option |
| 2.2.5 | Re-authenticating | ⚠️ Semi | Save data on timeout |
| 2.2.6 | Timeouts | ⚠️ Semi | Warn before timeout |
| 2.3.2 | Three Flashes | ✅ Yes | Remove all flashing |
| 2.3.3 | Animation from Interactions | ✅ Yes | Disable motion |
| 2.4.8 | Location | ⚠️ Semi | Add breadcrumbs |
| 2.4.9 | Link Purpose (Link Only) | ✅ Yes | Descriptive link text |
| 2.4.10 | Section Headings | ✅ Yes | Organize with headings |
| 2.5.7 | Dragging Movements | ⚠️ Semi | Add click alternative |
| 2.5.8 | Target Size (Minimum) | ✅ Yes | 24×24px touch targets |
| 3.1.3 | Unusual Words | ❌ Manual | Add glossary |
| 3.1.4 | Abbreviations | ⚠️ Semi | Expand on first use |
| 3.1.5 | Reading Level | ❌ Manual | Simplify text |
| 3.1.6 | Pronunciation | ❌ Manual | Add pronunciation guide |
| 3.2.5 | Change on Request | ⚠️ Semi | User-initiated only |
| 3.3.5 | Help | ⚠️ Semi | Add contextual help |
| 3.3.6 | Error Prevention (All) | ⚠️ Semi | Full confirmation |
| 3.3.7 | Redundant Entry | ✅ Yes | Auto-fill repeated fields |
| 3.3.8 | Accessible Authentication (Minimum) | ⚠️ Semi | No cognitive tests |
| 3.3.9 | Accessible Authentication (Enhanced) | ⚠️ Semi | Object recognition |

*AAA criteria tracked but not prioritized for auto-fix (aspirational compliance)*

### Fix Confidence Scoring

Each fix is assigned a confidence score (0-100):

```javascript
{
  issue_id: "1.1.1_img_hero_001",
  fix_type: "alt_text_generation",
  confidence: 87,
  reasoning: {
    context_clarity: 0.9,  // Surrounding text is descriptive
    image_analysis: 0.85,  // AI vision confidence
    domain_match: 0.95     // Fits site theme
  },
  requires_review: false
}
```

**Thresholds:**
- 90-100: Auto-apply without prompt
- 70-89: Auto-apply with notification
- 50-69: Suggest with preview
- 0-49: Manual review required

---

## Phase 6: Dashboard Integration (Vision)

### Real-Time Metrics

**Primary KPIs:**
1. **Compliance Score** (0-100)
   - Weighted by severity (Critical × 3, Warning × 2, Info × 1)
   - Trend graph (7d / 30d / 90d)

2. **Issue Breakdown**
   - Total detected
   - Auto-fixed count
   - Pending review
   - Unfixable

3. **Fix Velocity**
   - Fixes applied per day
   - Average time to fix
   - Rollback rate

4. **Coverage**
   - Pages scanned
   - Scan frequency
   - Agent uptime %

### Dashboard UI Mockup

```
┌────────────────────────────────────────────────────────────┐
│  PromptFluid Vision → Clarity Overview                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🟢 yoursite.com                  Compliance: 94/100 ↑ 12  │
│  Last scan: 2 minutes ago         Auto-fix: Enabled       │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Compliance Trend (30 days)                         │ │
│  │  100 ┤                                          ╭─  │ │
│  │   75 ┤                              ╭───────╮─╯    │ │
│  │   50 ┤                  ╭───────────╯              │ │
│  │   25 ┤      ╭───────────╯                          │ │
│  │    0 └──────┴──────────────────────────────────    │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Issues by Severity                                        │
│  🔴 2 Critical   🟡 5 Warnings   🔵 12 Info               │
│                                                            │
│  Recent Fixes (Auto-applied)                               │
│  • 1.1.1 - Added alt text to 7 images            3m ago   │
│  • 1.4.3 - Adjusted button contrast              5m ago   │
│  • 2.4.6 - Fixed duplicate H1 headings           8m ago   │
│                                                            │
│  [View Full Report] [Configure Agent] [Export PDF]        │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  🔧 Active Sites (3)                                       │
│  • yoursite.com         94/100   ✅ Auto-fix ON           │
│  • blog.yoursite.com    87/100   ⚠️  Manual review        │
│  • shop.yoursite.com    78/100   🔄 Scanning...           │
└────────────────────────────────────────────────────────────┘
```

### Sync Frequency & Retention

**Sync Schedule:**
- Real-time: Compliance score changes
- Every 5 min: Active fix count
- Every 1 hour: Full scan results
- Daily: Historical rollup

**Data Retention:**
- Raw scan data: 90 days
- Aggregated metrics: 2 years
- Fix logs: 1 year
- Rollback snapshots: 30 days (localStorage only)

**Anonymization:**
- Strip user-generated content from logs
- Hash selectors for common patterns
- No IP addresses stored
- GDPR right-to-delete via API

### Notification Rules

**Alerts Triggered:**
1. Compliance drops >10 points → Email + Dashboard
2. Critical issue detected → Instant notification
3. Auto-fix fails 3x → Pause + alert admin
4. Agent offline >1 hour → Health check email
5. Weekly digest → Summary + recommendations

---

## Phase 7: Backend Infrastructure

### New Database Tables (Supabase)

```sql
-- Site registry
CREATE TABLE pf_clarity_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_url TEXT NOT NULL UNIQUE,
  platform TEXT,  -- 'wordpress', 'shopify', 'custom', etc.
  agent_version TEXT,
  install_token TEXT UNIQUE,
  subscription_tier TEXT,  -- 'free', 'pro', 'studio'
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Scan results (central storage)
CREATE TABLE pf_clarity_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES pf_clarity_sites(id),
  scan_timestamp TIMESTAMPTZ DEFAULT now(),
  compliance_score INTEGER,
  total_issues INTEGER,
  critical_count INTEGER,
  warning_count INTEGER,
  info_count INTEGER,
  pages_scanned INTEGER,
  scan_data JSONB,  -- Full issue list
  agent_version TEXT
);

-- Fix records
CREATE TABLE pf_clarity_fixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES pf_clarity_sites(id),
  issue_id TEXT,
  wcag_criterion TEXT,
  fix_type TEXT,  -- 'auto', 'semi', 'manual'
  fix_code TEXT,  -- CSS/JS/HTML patch
  confidence_score INTEGER,
  applied_at TIMESTAMPTZ DEFAULT now(),
  rolled_back_at TIMESTAMPTZ,
  status TEXT  -- 'active', 'rolled_back', 'failed'
);

-- Drift detection (regressions)
CREATE TABLE pf_clarity_drift_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES pf_clarity_sites(id),
  issue_id TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  previous_status TEXT,
  current_status TEXT,
  delta JSONB  -- { new: [...], resolved: [...], regressed: [...] }
);

-- Agent health
CREATE TABLE pf_clarity_agent_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES pf_clarity_sites(id),
  last_heartbeat TIMESTAMPTZ DEFAULT now(),
  agent_version TEXT,
  cpu_usage FLOAT,
  memory_usage FLOAT,
  scan_duration_ms INTEGER,
  errors_logged INTEGER
);

-- RLS Policies (simplified - expand for multi-tenant)
ALTER TABLE pf_clarity_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_clarity_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_clarity_fixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_clarity_drift_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf_clarity_agent_health ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own sites
CREATE POLICY "Users access own sites" ON pf_clarity_sites
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM pf_access_subscriptions 
      WHERE site_id = pf_clarity_sites.id
    )
  );
```

### Edge Functions (New/Updated)

#### 1. `pf-clarity-universal-scan`
**Purpose:** Universal scanner for any website (not just WP)

**Input:**
```json
{
  "site_url": "https://example.com",
  "scan_type": "full",  // 'full' | 'quick' | 'targeted'
  "wcag_level": "AA",
  "include_fixes": true
}
```

**Output:**
```json
{
  "scan_id": "uuid",
  "compliance_score": 87,
  "issues": [
    {
      "id": "1.1.1_img_001",
      "wcag": "1.1.1",
      "severity": "critical",
      "element": "img.hero-banner",
      "description": "Image missing alt text",
      "auto_fixable": true,
      "fix_confidence": 92,
      "suggested_fix": "<img src='...' alt='Hero banner showing...' />"
    }
  ],
  "pages_scanned": 1,
  "scan_duration_ms": 2340
}
```

#### 2. `pf-clarity-apply-fix`
**Purpose:** Execute batch auto-fixes via Nexus AI (auto-fix-first methodology)

**Input:**
```json
{
  "site_id": "uuid",
  "issue_ids": ["1.1.1_img_001", "1.4.3_btn_002"],
  "batch_mode": true
}
```

**Flow:**
1. Fetch all auto-fixable issue details from DB
2. Generate fix code batch via Nexus
3. Validate each fix (no script injection)
4. Apply all valid fixes to agent
5. Generate human review report for remaining issues
6. Log to Brain for pattern learning

#### 3. `pf-clarity-rollback`
**Purpose:** Revert applied fix

**Input:**
```json
{
  "fix_id": "uuid",
  "site_id": "uuid"
}
```

**Logic:**
1. Mark fix as `rolled_back` in DB
2. Return original DOM snapshot
3. Agent restores on client-side

#### 4. `pf-clarity-sync`
**Purpose:** Agent → Backend sync endpoint

**Input:**
```json
{
  "site_id": "uuid",
  "agent_version": "4.1.0",
  "heartbeat": true,
  "metrics": {
    "compliance_score": 94,
    "issues_detected": 23,
    "issues_fixed": 18,
    "issues_pending_review": 5,
    "cpu_usage": 3.2,
    "uptime_hours": 48
  },
  "delta": {
    "new": ["2.4.6_h1_003"],
    "resolved": ["1.1.1_img_002"],
    "regressed": []
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "next_scan_in": 1800,  // seconds
  "config_update": {
    "scan_frequency": 1800,
    "auto_fix_enabled": true,
    "throttle_cpu": 5.0
  }
}
```

---

## Phase 8: Ecosystem Integration

### Brain Learning Pipeline

**Events Sent to Brain:**
```javascript
// When fix applied successfully
{
  event: "clarity_fix_applied",
  data: {
    wcag_criterion: "1.1.1",
    fix_type: "alt_text_ai",
    confidence: 92,
    context: {
      image_url: "...",
      surrounding_text: "...",
      page_title: "..."
    },
    generated_alt: "...",
    user_accepted: true  // If manually approved
  }
}

// When fix fails
{
  event: "clarity_fix_failed",
  data: {
    wcag_criterion: "1.4.3",
    fix_type: "contrast_adjust",
    reason: "cannot_find_element",
    selector: "button.primary"
  }
}

// When user rolls back fix
{
  event: "clarity_fix_rollback",
  data: {
    fix_id: "uuid",
    wcag_criterion: "2.4.6",
    time_since_apply: 3600,  // seconds
    reason: "layout_broken"  // If provided
  }
}
```

**Brain Learns:**
- Which fix patterns succeed most often
- Context indicators that predict fix quality
- Common rollback reasons → avoid similar fixes
- Domain-specific patterns (e-commerce vs blog)

### Nexus Routing

**Model Selection for Fix Generation:**
- **Alt text:** Groq (llama-3.1-70b-versatile) - fast, cheap
- **Contrast adjustment:** Groq (gemma-9b-it) - logic-only
- **Complex ARIA:** OpenAI (gpt-4o-mini) - reasoning
- **Review suggestions:** Anthropic (claude-sonnet-4) - safety

**Cost Optimization:**
- Cache similar fixes (hash: selector + issue type)
- Batch multiple fixes in single prompt
- Use Groq for 80% of cases (cheapest)

### Access Licensing

**Plan Enforcement:**

| Feature | Free | Pro ($49) | Studio ($99) |
|---------|------|-----------|--------------|
| Scans/month | 1 | Unlimited | Unlimited |
| Auto-fix | ❌ | ✅ | ✅ |
| Monitoring | ❌ | ✅ | ✅ |
| Sites | 1 | 5 | 25 |
| API access | ❌ | ❌ | ✅ |
| White-label | ❌ | ❌ | ✅ |
| Support | Community | Email | Priority |

**Token Usage:**
- Each scan deducts tokens from plan
- Free tier: 100 tokens/month (1 scan = 50 tokens)
- Pro/Studio: Unlimited scans, paid per fix applied
  - Auto-fix: $0.01 per fix (Nexus API cost pass-through)

### Defense Integration

**Bot Protection:**
- Clarity agent must authenticate with valid token
- Rate limit: 10 scans/minute per site
- Block malicious fix injection attempts
- Verify agent signature (signed with private key)

---

## Phase 9: Implementation Roadmap

### Timeline (Estimated)

#### **Sprint 1-2: Foundation (2 weeks)**
- [ ] Create `promptfluid-clarity-web/` repo structure
- [ ] Build `clarity.js` core module (scanner engine)
- [ ] Implement 20 basic WCAG checks (Level A)
- [ ] Set up Supabase tables + RLS
- [ ] Create `pf-clarity-universal-scan` edge function

#### **Sprint 3-4: Fixing Engine (2 weeks)**
- [ ] Build fix generation prompts for Nexus
- [ ] Implement auto-fix-first batch processing pipeline
- [ ] Build rollback system (localStorage)
- [ ] Add 25 more WCAG checks (Level AA)
- [ ] Create `pf-clarity-apply-fix` endpoint
- [ ] Implement human review report generator
- [ ] Test auto-fix on 10 common issues

#### **Sprint 5-6: Agent & Monitoring (2 weeks)**
- [ ] Build `agent.js` background daemon
- [ ] Implement MutationObserver drift detection
- [ ] Create `pf-clarity-sync` endpoint
- [ ] Add throttling and safe-mode
- [ ] Test 48-hour continuous monitoring

#### **Sprint 7-8: Wizard & Onboarding (2 weeks)**
- [ ] Build `wizard.js` setup flow
- [ ] Implement platform auto-detection
- [ ] Create install code generators
- [ ] Design before/after preview UI
- [ ] Integrate with Access paywall

#### **Sprint 9-10: Dashboard Integration (2 weeks)**
- [ ] Build Vision dashboard pages
- [ ] Create real-time metrics sync
- [ ] Implement alert notifications
- [ ] Add export/reporting (PDF, CSV)
- [ ] Build admin site management UI

#### **Sprint 11-12: Polish & Launch (2 weeks)**
- [ ] Expand to 86+ WCAG checks (including 2.2 additions)
- [ ] Refine auto-fix-first workflow with priority queuing
- [ ] Performance optimization (<80KB agent)
- [ ] Security audit (Defense team)
- [ ] Beta testing with 10 pilot users
- [ ] Documentation + marketing site

**Total:** ~12 weeks (3 months)

### Resource Requirements

**Engineering:**
- 2 Full-stack engineers (clarity.js + edge functions)
- 1 Frontend specialist (wizard + dashboard)
- 1 AI/ML engineer (Nexus prompt optimization)
- 1 QA/Accessibility expert

**Infrastructure:**
- Supabase Storage for `clarity.js` hosting (existing)
- Supabase instance (existing)
- Nexus API quota increase (monitoring)

**External:**
- WCAG consultant review (pre-launch)
- Accessibility testing tools (axe, WAVE, Lighthouse)

---

## Phase 10: Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Agent breaks site JS** | High | Medium | Safe-mode sandbox testing, rollback |
| **Fix quality too low** | High | Medium | Confidence thresholds, human review |
| **Performance overhead** | Medium | Medium | Throttling, CPU caps, lazy loading |
| **Cross-origin issues** | Medium | Low | CORS proxy, fallback to manual |
| **Nexus API costs spike** | Medium | Low | Caching, cheaper models (Groq) |

### Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Low adoption** | High | Free trial, viral sharing, SEO |
| **Churn after trial** | Medium | Showcase ROI, compliance reports |
| **Support burden** | Medium | Self-serve docs, community forum |
| **Competitor copy** | Low | Obfuscate agent code, patent core algo |

### Legal/Compliance Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **GDPR violations** | High | Anonymize all data, user consent |
| **Liability for bad fixes** | High | Disclaimer + insurance, rollback |
| **Scraping legal issues** | Low | Only scan user's own sites |

---

## Phase 11: Success Metrics

### Launch Targets (Month 1)

- [ ] 100 active sites monitored
- [ ] 5,000 scans completed
- [ ] 10,000 issues auto-fixed
- [ ] 90% fix success rate (no rollback)
- [ ] <2% agent crash rate
- [ ] 50 paying customers (Pro+)

### Growth Targets (Month 6)

- [ ] 1,000 active sites
- [ ] 50,000 scans/month
- [ ] 100,000 issues auto-fixed
- [ ] 95% fix success rate
- [ ] 500 paying customers
- [ ] $25K MRR

### Platform Metrics

- **Agent Performance:**
  - Load time: <500ms
  - Bundle size: <80KB minified
  - CPU usage: <5% sustained
  - Memory: <20MB

- **Fix Quality:**
  - Confidence >85%: 60% of fixes
  - Rollback rate: <5%
  - False positive: <2%

- **Compliance:**
  - Average score increase: +15 points after 1 month
  - Critical issues resolved: 90%

---

## Phase 12: Future Enhancements (v5.0+)

### Advanced Features (Post-Launch)

1. **Visual Regression Testing**
   - Screenshot before/after fixes
   - Perceptual diff highlighting
   - Client approval workflow

2. **Multi-Language Support**
   - Auto-detect page language
   - Generate fixes in local language
   - ARIA labels in user's locale

3. **Custom Rule Builder**
   - Enterprise customers define org-specific rules
   - Brand compliance checks (color palette, fonts)
   - Legal/regulatory requirements

4. **Competitive Benchmarking**
   - Compare compliance vs industry average
   - Best-in-class examples
   - Public leaderboard (opt-in)

5. **Developer API**
   - Programmatic scan triggers
   - CI/CD integration (GitHub Actions)
   - Webhooks for events

6. **White-Label Reseller Program**
   - Rebrand as "YourCompany Accessibility"
   - Custom domain hosting
   - Revenue sharing model

---

## Appendix A: File Structure

```
promptfluid-clarity-web/
├── src/
│   ├── core/
│   │   ├── scanner.ts          # Main scanning engine
│   │   ├── detector.ts         # Platform detection
│   │   ├── fixer.ts            # Fix application logic
│   │   └── rollback.ts         # Rollback management
│   ├── agent/
│   │   ├── monitor.ts          # Background monitoring
│   │   ├── sync.ts             # Backend sync
│   │   └── throttle.ts         # Performance management
│   ├── wizard/
│   │   ├── setup.ts            # Wizard flow
│   │   ├── platform.ts         # Platform-specific installers
│   │   └── preview.ts          # Before/after preview
│   ├── checks/
│   │   ├── wcag-1.x.ts         # Perceivable checks
│   │   ├── wcag-2.x.ts         # Operable checks
│   │   ├── wcag-3.x.ts         # Understandable checks
│   │   └── wcag-4.x.ts         # Robust checks
│   ├── utils/
│   │   ├── dom.ts              # DOM manipulation helpers
│   │   ├── contrast.ts         # Color contrast calculator
│   │   └── storage.ts          # localStorage wrapper
│   └── clarity.ts              # Main entry point
├── supabase/
│   ├── functions/
│   │   ├── pf-clarity-universal-scan/
│   │   ├── pf-clarity-apply-fix/
│   │   ├── pf-clarity-rollback/
│   │   └── pf-clarity-sync/
│   └── migrations/
│       └── 20250108_clarity_universal_schema.sql
├── docs/
│   ├── installation.md
│   ├── wcag-coverage.md
│   └── api-reference.md
├── tests/
│   ├── scanner.test.ts
│   ├── fixer.test.ts
│   └── e2e/
│       ├── wordpress.spec.ts
│       └── shopify.spec.ts
├── dist/                       # Build output
│   ├── clarity.js              # ~60KB minified
│   ├── clarity.min.js          # ~35KB gzipped
│   └── agent.js                # ~15KB minified
├── package.json
├── tsconfig.json
├── rollup.config.js            # Bundle config
└── README.md
```

---

## Appendix B: Example Prompts for Nexus

### Alt Text Generation
```
You are an accessibility expert. Generate a concise, descriptive alt text for this image.

Context:
- Image URL: ${imageUrl}
- Page title: ${pageTitle}
- Surrounding text: "${surroundingText}"
- Image position: ${position} (hero, inline, decorative, etc.)

Requirements:
- Max 125 characters
- Describe content and function
- Don't start with "Image of" or "Picture of"
- Match tone of surrounding text
- If decorative, return empty string

Output format:
{
  "alt_text": "string",
  "confidence": 0-100,
  "reasoning": "brief explanation"
}
```

### Contrast Fix
```
You are a WCAG color expert. Adjust these colors to meet AA compliance (4.5:1 for normal text, 3:0 for large).

Current state:
- Foreground: ${fgColor} (HSL)
- Background: ${bgColor} (HSL)
- Current ratio: ${currentRatio}
- Text size: ${fontSize}px, weight: ${fontWeight}

Constraints:
- Preserve brand hue if possible (±10° hue shift max)
- Minimize visual disruption
- Prefer darkening foreground over lightening background

Output format:
{
  "new_foreground": "hsl(...)",
  "new_background": "hsl(...)",
  "new_ratio": number,
  "confidence": 0-100,
  "alternative_options": [
    {"fg": "hsl(...)", "bg": "hsl(...)", "ratio": number}
  ]
}
```

### Heading Hierarchy Fix
```
You are an HTML structure expert. Fix the heading hierarchy to follow proper nesting.

Current structure:
${headingTree}

Issues detected:
- ${issueList}

Rules:
- Single H1 per page (main title)
- No skipped levels (H2 → H4 is invalid)
- Preserve semantic meaning of content

Output format:
{
  "changes": [
    {"selector": "h3.intro", "new_tag": "h2", "reason": "..."}
  ],
  "confidence": 0-100
}
```

---

## Appendix C: Licensing & Pricing

### SaaS Tiers (Embedded in Access System)

**Free:**
- 1 site
- 1 scan/month
- View-only results
- Community support

**Pro ($49/mo):**
- 5 sites
- Unlimited scans
- Auto-fix enabled
- Continuous monitoring
- Email support
- API access (read-only)

**Studio ($99/mo):**
- 25 sites
- All Pro features
- White-label option
- Full API access (write)
- Priority support
- Custom rule builder

**Enterprise (Custom):**
- Unlimited sites
- On-premise option
- SSO integration
- SLA guarantees
- Dedicated success manager

### WordPress Plugin Pricing (Legacy)

**Freemium:**
- Basic scanning (25 checks)
- Manual fixes only
- 1 scan/week

**Pro ($19/mo):**
- Full scanning (75 checks)
- Auto-fix for 20 rules
- 1 scan/day
- Email reports

**Agency ($99/mo):**
- 10 client sites
- All Pro features
- White-label reports
- Priority support

---

## Conclusion

This roadmap outlines a complete transformation of PromptFluid Clarity from a WordPress-exclusive plugin to a **universal web accessibility system** deployable on any website with a single script tag.

**Key Innovations:**
1. ✅ Zero-dependency JavaScript agent (<80KB)
2. ✅ AI-powered auto-fixing for 45+ WCAG rules
3. ✅ Continuous monitoring with drift detection
4. ✅ Platform-agnostic setup wizard
5. ✅ Full PromptFluid ecosystem integration
6. ✅ Rollback safety + visual diffing

**Next Steps:**
- ✅ Review and approve this roadmap
- ✅ Allocate engineering resources
- ✅ Begin Sprint 1 (foundation work)
- ✅ Set up project tracking (Linear/Jira)
- ✅ Schedule weekly sync with Kenneth

**Estimated Timeline:** 12 weeks to launch  
**Estimated Cost:** $150K (eng hours) + $10K (infra/tools)  
**Expected ROI:** $300K ARR by Month 12

---

**Status:** ✅ Design Complete — Awaiting Approval for Implementation

---

*Generated by PromptFluid Brain*  
*Document Version: 1.0.0*  
*Last Updated: 2025-11-08*
