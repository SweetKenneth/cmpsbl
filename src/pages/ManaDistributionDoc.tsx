/**
 * ManaDistributionDoc — Beautiful HTML rendering of the Mana Distribution Channel Architecture
 * Matches site light-mode theme, mobile-friendly with proper wrapping.
 * 
 * © CMPSBL® — PromptFluid™ · 2026
 */

import { Helmet } from 'react-helmet-async';
import { ArrowLeft, GitBranch, ShoppingCart, Cpu, BarChart3, Shield, Eye, EyeOff, Lock, Layers, ArrowRight, Package, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

function SectionHeader({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mt-14 mb-5 pt-6 border-t border-border/50 first:border-t-0 first:pt-0 first:mt-0">
      {children}
    </h2>
  );
}

function SubHeader({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-8 mb-4">{children}</h3>;
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] sm:text-base text-foreground leading-[1.8] mb-4">{children}</p>;
}

function CodeDiagram({ children }: { children: string }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl bg-muted/50 border border-border">
      <pre className="p-4 sm:p-5 text-xs sm:text-sm font-mono leading-relaxed text-foreground whitespace-pre">{children}</pre>
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-muted/60">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground border-b border-border">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-muted/30 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 text-[14px] border-b border-border/50 leading-relaxed ${j === 0 ? 'font-medium text-foreground whitespace-nowrap' : 'text-foreground'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mb-5 pl-1">
      {items.map((item, i) => (
        <li key={i} className="text-[15px] sm:text-base text-foreground leading-[1.7] flex gap-2">
          <span className="text-primary/60 mt-[2px] shrink-0">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: typeof Cpu; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-xl p-4 sm:p-5 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary shrink-0" />
        <h4 className="text-[15px] font-semibold text-foreground">{title}</h4>
      </div>
      <div className="text-sm text-foreground leading-relaxed">{children}</div>
    </div>
  );
}

export default function ManaDistributionDoc() {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Mana Distribution Channel Architecture — CMPSBL®</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
            <Link to="/explore" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-primary">Internal Architecture Spec</p>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Mana as Distribution Channel</h1>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Classification Banner */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-8">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">Internal — Strategic Architecture</span>
            <span>v1.0.0</span>
            <span>·</span>
            <span>April 15, 2026</span>
          </div>
          <div className="text-xs text-muted-foreground mb-10 space-y-0.5">
            <p>U.S. App. No. 64/029,678 (Ascension) · U.S. App. No. 64/031,637 (Mana)</p>
          </div>

          {/* Executive Summary */}
          <section>
            <SectionHeader>Executive Summary</SectionHeader>
            <div className="bg-card border border-border rounded-xl p-5 sm:p-7 mb-6">
              <Paragraph>
                Mana becomes the <strong>distribution channel</strong> for all substrate-produced software.
                Instead of selling standalone products that lack context, every item in the
                Showroom, Store, and Crown Jewel vault can be <strong>attached to user code</strong> during
                the Ascension pipeline — giving substrate-produced software a concrete use case
                as capability add-ons.
              </Paragraph>
            </div>
          </section>

          {/* Pipeline Flow */}
          <section>
            <SectionHeader>Pipeline Flow</SectionHeader>
            <CodeDiagram>{`┌─────────────────────────────────────────────────────────┐
│                ASCENSION V2 PIPELINE                    │
│                                                         │
│  Step 1: UPLOAD                                         │
│  ├─ User drops source files / pastes code               │
│  ├─ Fingerprint computed (FNV-1a structural hash)       │
│  └─ Candidate registered in artifact_registry           │
│                                                         │
│  Step 2: ENHANCE (Optional — Skippable)                 │
│  ├─ Mode A: SDK-Built Software                          │
│  │   └─ Developer uploads their own @cmpsbl/sdk-built   │
│  │      package that integrates via Mana (no API)       │
│  ├─ Mode B: Substrate Store Add-Ons (Future)            │
│  │   └─ Browse purchasable capabilities from:           │
│  │      • Crown Jewels (50+ substrate-native algorithms)│
│  │      • Memory Stream discoveries (COMPILER-built)    │
│  │      • Showroom products (curated substrate output)  │
│  │   └─ Selected items are Mana-wrapped and merged      │
│  │      with user code BEFORE Ascension collision       │
│  └─ Skip → proceeds with raw user code only             │
│                                                         │
│  Step 3: ANALYZE (Automated)                            │
│  ├─ 40-Primitive collision matrix runs against:         │
│  │   USER CODE + any Mana-attached enhancements         │
│  ├─ Dedup engine collapses to top 4-7 unique caps       │
│  ├─ Auto-lock (no manual step)                          │
│  └─ Audit chain records all operations                  │
│                                                         │
│  Step 4: RESULTS                                        │
│  ├─ Single wrapped cmpsbl.ts export                     │
│  ├─ Audit chain integrity badge (SHA-256)               │
│  ├─ Capability summary                                  │
│  └─ Post-Results Upsell: "Enhance Further"              │
│     └─ Surface purchasable Store items relevant to      │
│        the discovered capabilities (future)             │
└─────────────────────────────────────────────────────────┘`}</CodeDiagram>
          </section>

          {/* Why Step 2 */}
          <section>
            <SectionHeader>Why Step 2 (Before Ascension)</SectionHeader>
            <Paragraph>
              Mana-attached software is merged with user code <strong>before</strong> the 40-Primitive
              collision. This means the Ascension engine processes everything together:
            </Paragraph>
            <BulletList items={[
              'User\'s legacy code',
              'Mana-attached SDK packages',
              'Substrate Store add-ons',
            ]} />
            <Paragraph>
              The primitives collide against the <strong>combined</strong> codebase, producing richer
              and more accurate capability discovery. An add-on that provides, say,
              DEFENSE capabilities will surface as a capability in the user's ascended
              output — not as a separate download.
            </Paragraph>
          </section>

          {/* Why Post-Results Upsell */}
          <section>
            <SectionHeader>Why Post-Results Upsell (After Ascension)</SectionHeader>
            <Paragraph>
              After free Ascension completes, users see what capabilities their code
              has. This is the ideal moment to surface: <em>"Your code scored 72 on DEFENSE.
              Want to enhance it?"</em> — linking directly to a Store item that can be
              purchased and attached in a re-run.
            </Paragraph>
          </section>

          {/* Two Modes */}
          <section>
            <SectionHeader>Two Modes of Mana Attachment</SectionHeader>

            <SubHeader>Mode A: SDK-Built Software (Available Now)</SubHeader>
            <Paragraph>
              Developers build software using <code className="px-1.5 py-0.5 rounded-md text-[13px] font-mono bg-primary/10 text-primary border border-primary/10">@cmpsbl/sdk</code> and want it to integrate
              with other users' software without requiring an API. The Mana wrapping
              enables silent function-boundary attachment:
            </Paragraph>
            <CodeDiagram>{`Developer builds package → Uploads to Enhance step →
Mana wraps at function boundaries → Merged with host code →
Ascension processes combined codebase → Single output file`}</CodeDiagram>
            <Paragraph>
              This is analogous to Stripe's payment SDK: developers build a custom
              integration that plugs into the broader ecosystem. The difference is
              Mana operates at the code level, not the API level.
            </Paragraph>

            <SubHeader>Mode B: Substrate Store Add-Ons (Future — Docs Only)</SubHeader>
            <Paragraph>
              Software produced by the substrate itself becomes purchasable enhancement capability:
            </Paragraph>
            <DataTable
              headers={['Source', 'Description', 'Example']}
              rows={[
                ['Crown Jewels', '50+ highest-CJPI substrate algorithms', 'DEFENSE-class encryption primitive'],
                ['Memory Stream', 'COMPILER-built from autonomous discovery', 'Auto-generated caching optimizer'],
                ['COMPILER Suites', 'Full multi-capability packages built by COMPILER', 'Enterprise Security Suite (DEFENSE+GOVERNANCE+AUDIT)'],
                ['Showroom', 'MERCHANT-curated substrate output', 'Enterprise audit logger'],
                ['Junkyard', 'Lower-tier but functional items', 'Simple rate limiter'],
                ['SDK-Built (Community)', 'Developer-built packages using @cmpsbl/sdk', 'Custom domain-specific enhancer'],
              ]}
            />

            <Paragraph>
              <strong>Purchase flow (future):</strong>
            </Paragraph>
            <CodeDiagram>{`User sees results → "Enhance with DEFENSE Shield" →
Purchase ($29-$249 depending on tier) →
Item Mana-wrapped → Re-run Ascension with enhancement →
New ascended output includes purchased capability`}</CodeDiagram>
          </section>

          {/* Primitive Roles */}
          <section>
            <SectionHeader>Primitive Roles in the Supply Chain</SectionHeader>

            <InfoCard icon={BarChart3} title="ECONOMY — Automatic Pricing Engine">
              <p className="mb-2">ECONOMY sets prices for all Store add-ons automatically based on:</p>
              <BulletList items={[
                'CJPI score — higher-scoring capabilities command higher prices',
                'Tier classification — Crown Jewels > COMPILER Suites > Showroom > Junkyard',
                'Demand signals — purchase frequency, Ascension gap analysis data',
                'Complexity — chain depth, number of primitives involved',
                'Competitive positioning — no manual price-setting required',
              ]} />
              <p>ECONOMY ensures the marketplace self-regulates. When COMPILER produces a new capability, ECONOMY prices it immediately based on its CJPI score and tier.</p>
            </InfoCard>

            <InfoCard icon={ShoppingCart} title="MERCHANT — Curation & Catalog Governance">
              <BulletList items={[
                'Curates COMPILER output — not everything COMPILER builds is Store-worthy',
                'Quality gate — minimum CJPI threshold for Store listing',
                'Suite composition — groups related capabilities into purchasable bundles',
                'Seasonal drops — manages Showroom rotation and featured items',
                'Gap analysis — identifies missing capabilities and requests COMPILER builds',
              ]} />
              <p>MERCHANT + ECONOMY work together: MERCHANT decides <em>what</em> sells, ECONOMY decides <em>at what price</em>.</p>
            </InfoCard>

            <InfoCard icon={Zap} title="SDK + DREAM + EVOLUTION — Developer Capability Loop">
              <p className="mb-2">Developers using <code className="px-1.5 py-0.5 rounded-md text-[13px] font-mono bg-primary/10 text-primary border border-primary/10">@cmpsbl/sdk</code> have access to substrate primitives:</p>
              <DataTable
                headers={['Primitive', 'SDK Developer Use']}
                rows={[
                  ['DREAM', 'Sub-threshold synthesis — suggests capability combinations the developer hasn\'t considered'],
                  ['EVOLUTION', 'Self-improvement — SDK packages can evolve their own algorithms over time'],
                  ['CORTEX', 'Runtime orchestration — manages execution context for complex multi-capability packages'],
                  ['DEFENSE', 'Security hardening — automatic vulnerability shielding in SDK-built packages'],
                  ['ARCHITECT', 'Structural analysis — validates that SDK packages are architecturally sound'],
                ]}
              />
              <p>SDK-built packages that flow into Step 2 aren't just raw code — they're substrate-enhanced code built with the same primitives that Ascension uses to analyze them.</p>
            </InfoCard>

            <InfoCard icon={Cpu} title="COMPILER — Autonomous Software Factory">
              <CodeDiagram>{`Memory Stream discovers capability pattern
    → COMPILER builds standalone package
    → MERCHANT curates into Store catalog
    → ECONOMY prices automatically
    → User purchases in Ascension Step 2
    → Mana wraps and attaches
    → Ascension processes combined codebase
    → User gets enhanced output`}</CodeDiagram>
              <p className="mb-2">COMPILER doesn't just build individual capabilities. It builds <strong>Software Suites</strong> — coherent bundles of related capabilities:</p>
              <BulletList items={[
                'Security Suite (DEFENSE + GOVERNANCE + AUDIT + SIEVE)',
                'Intelligence Suite (BRAIN + MEMORY + CORTEX + ORACLE)',
                'Resilience Suite (FAILSAFE + BEACON + BASTION + WATCHTOWER)',
              ]} />
              <p>These suites are the premium tier of Store add-ons.</p>
            </InfoCard>
          </section>

          {/* Complete Ecosystem Flow */}
          <section>
            <SectionHeader>Complete Ecosystem Flow</SectionHeader>
            <CodeDiagram>{`┌─────────────────────────────────────────────────────────┐
│               SUBSTRATE SUPPLY CHAIN                    │
│                                                         │
│  Memory Stream (8hr autonomous)                         │
│       │                                                 │
│       ▼                                                 │
│  COMPILER (builds packages + suites)                    │
│       │                                                 │
│       ▼                                                 │
│  MERCHANT (curates catalog, quality gates)               │
│       │                                                 │
│       ▼                                                 │
│  ECONOMY (auto-prices by CJPI + tier + demand)          │
│       │                                                 │
│       ▼                                                 │
│  ┌─────────────────────────┐                            │
│  │     STORE CATALOG       │                            │
│  │  Crown Jewels           │                            │
│  │  COMPILER Suites        │◄── SDK Devs (DREAM+EVOL)  │
│  │  Showroom Items         │                            │
│  │  Community Packages     │                            │
│  └───────────┬─────────────┘                            │
│              │                                          │
│              ▼                                          │
│  ASCENSION Step 2 (Enhance)                             │
│       │                                                 │
│       ▼                                                 │
│  MANA WRAP → ASCENSION COLLISION → RESULTS              │
│       │                                                 │
│       ▼                                                 │
│  Richer output → More demand → More discoveries         │
│       │                                                 │
│       └──────────► Memory Stream (cycle repeats)        │
└─────────────────────────────────────────────────────────┘`}</CodeDiagram>
          </section>

          {/* Data Architecture */}
          <section>
            <SectionHeader>Data Architecture</SectionHeader>

            <SubHeader>Step 2 Storage</SubHeader>
            <Paragraph>
              Mana-attached files are stored alongside the candidate in <code className="px-1.5 py-0.5 rounded-md text-[13px] font-mono bg-primary/10 text-primary border border-primary/10">artifact_registry</code>:
            </Paragraph>
            <CodeDiagram>{`-- SDK-built attachment
category: 'proprietary-mana-attachment-v2'
tier: 'enhancement'
metadata: {
  attachment_type: 'sdk-built',
  source_package: '@user/their-package',
  mana_wrapped: true,
  pipeline_version: 'v2'
}

-- Store add-on (future)
category: 'proprietary-mana-attachment-v2'
tier: 'store-addon'
metadata: {
  attachment_type: 'store-addon',
  store_item_id: '<uuid>',
  store_item_name: 'DEFENSE Shield',
  purchase_id: '<uuid>',
  mana_wrapped: true,
  pipeline_version: 'v2'
}`}</CodeDiagram>

            <SubHeader>Data Isolation</SubHeader>
            <Paragraph>All V2 data uses distinct category prefixes:</Paragraph>
            <BulletList items={[
              'proprietary-evolution-v2 — uploaded candidate',
              'proprietary-mana-attachment-v2 — Mana enhancements',
              'proprietary-discovery-v2 — raw discoveries',
              'proprietary-ascended-v2 — final locked capabilities',
            ]} />
            <Paragraph>Zero collision with V1 categories.</Paragraph>
          </section>

          {/* Revenue Model */}
          <section>
            <SectionHeader>Revenue Model Integration</SectionHeader>
            <DataTable
              headers={['Tier', 'What They Get', 'Price']}
              rows={[
                ['Free Ascension', 'Upload → Analyze → Export (no enhancements)', '$0'],
                ['SDK Enhance', 'Attach own packages via Mana step', 'Free (SDK cost)'],
                ['Store Add-On', 'Single capability from Store', '$29–$79'],
                ['Crown Jewel Add-On', 'Premium substrate algorithm', '$129–$249'],
                ['ECONOMY-Priced', 'Auto-priced by CJPI/tier/demand', 'ECONOMY sets'],
                ['COMPILER Suite', 'Multi-capability bundle', '$149–$499'],
                ['Architect Bundle', 'Full Ascension + all available add-ons', '$249/mo'],
              ]}
            />
          </section>

          {/* Implementation Phases */}
          <section>
            <SectionHeader>Implementation Phases</SectionHeader>

            <SubHeader>Phase 1: Now (This Build)</SubHeader>
            <ul className="space-y-2 mb-5 pl-1">
              {[
                'Skippable Step 2 UI with SDK upload mode',
                'Mana wrapping of uploaded enhancement files',
                'Merge enhancement with host code before Analyze step',
                'Post-results placeholder for future Store add-ons',
              ].map((item, i) => (
                <li key={i} className="text-[15px] text-foreground leading-[1.7] flex gap-2">
                  <span className="text-neon-green mt-[2px] shrink-0">✓</span>
                  <span className="text-muted-foreground line-through">{item}</span>
                </li>
              ))}
            </ul>

            <SubHeader>Phase 2: Store Catalog (When COMPILER Has Built Enough)</SubHeader>
            <ul className="space-y-2 mb-5 pl-1">
              {[
                'Browse Store items in Step 2',
                'Purchase flow (Stripe integration)',
                'Mana-wrap purchased items automatically',
                'Re-run Ascension with purchased enhancement',
              ].map((item, i) => (
                <li key={i} className="text-[15px] text-foreground leading-[1.7] flex gap-2">
                  <span className="text-muted-foreground mt-[2px] shrink-0">○</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <SubHeader>Phase 3: Smart Recommendations (Post-Launch)</SubHeader>
            <ul className="space-y-2 mb-5 pl-1">
              {[
                'After Ascension, recommend specific Store items based on capability gaps',
                '"Your code + this add-on = X% improvement" predictions',
                'Subscription model for ongoing enhancements',
              ].map((item, i) => (
                <li key={i} className="text-[15px] text-foreground leading-[1.7] flex gap-2">
                  <span className="text-muted-foreground mt-[2px] shrink-0">○</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Vertical Substrates */}
          <section>
            <SectionHeader id="verticals">Vertical Substrates — Internal Engines, Not Products</SectionHeader>

            <div className="bg-card border border-border rounded-xl p-5 sm:p-7 mb-6">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Decision — April 15, 2026</p>
                  <Paragraph>
                    The 12 vertical substrates (Cyber, Fintech, Robotics, Healthcare, etc.)
                    are <strong>internal discovery engines</strong>, not user-facing products. They do not
                    get their own subdomains, SSO configurations, stores, or showrooms.
                  </Paragraph>
                </div>
              </div>
            </div>

            <SubHeader>What Was (Retired)</SubHeader>
            <CodeDiagram>{`12 verticals x (subdomain + SSO + Store + Showroom + Memory Stream)
= 48+ user-facing surfaces
= confusing, unsellable, no clear value proposition`}</CodeDiagram>

            <SubHeader>What Is Now</SubHeader>
            <CodeDiagram>{`12 verticals = 12 internal capability factories
Each runs its own Memory Stream internally
GENESIS spins up new verticals on demand
All output flows into ONE Store → ONE Ascension pipeline`}</CodeDiagram>

            <SubHeader>How Verticals Feed the Pipeline</SubHeader>
            <CodeDiagram>{`┌─────────────────────────────────────────────────────────┐
│          INTERNAL VERTICAL ENGINES                      │
│                                                         │
│  +------+ +------+ +------+ +------+ +------+ +------+ │
│  |Cyber | |Fin-  | |Robot-| |Health| |  AI  | |  ... | │
│  |      | |tech  | |ics   | |care  | |      | |      | │
│  +--+---+ +--+---+ +--+---+ +--+---+ +--+---+ +--+---+│
│     |        |        |        |        |        |      │
│     +--------+--------+---+----+--------+--------+      │
│                            |                            │
│                    +-------v--------+                   │
│                    | Memory Streams | (per-vertical)    │
│                    +-------+--------+                   │
│                            |                            │
│                    +-------v--------+                   │
│                    |   COMPILER     |                   │
│                    +-------+--------+                   │
│                            |                            │
│                    +-------v--------+                   │
│                    |   MERCHANT     |                   │
│                    +-------+--------+                   │
│                            |                            │
│                    +-------v--------+                   │
│                    |   ECONOMY      |                   │
│                    +-------+--------+                   │
└────────────────────────────+────────────────────────────┘
                             |
                    +--------v--------+
                    |  ONE STORE      | Tagged by origin
                    |  One catalog    | User never sees
                    |  One pipeline   | "Cyber" — just caps
                    +--------+--------+
                             |
                    +--------v--------+
                    | ASCENSION Step 2| Browse / Purchase
                    +-----------------+`}</CodeDiagram>

            <SubHeader>GENESIS — On-Demand Vertical Factory</SubHeader>
            <Paragraph>GENESIS remains fully operational as an internal engine:</Paragraph>
            <BulletList items={[
              'Spin up a new vertical (e.g., "Quantum Computing") at any time',
              'New vertical immediately starts its own Memory Stream',
              'COMPILER begins building domain-specific capabilities',
              'MERCHANT curates them into the Store catalog',
              'ECONOMY prices them automatically',
              'Users see "Quantum-class capabilities" appear in Ascension Step 2',
            ]} />
            <Paragraph>
              <strong>No new subdomain. No new SSO. No new store.</strong> Just new capabilities in the existing pipeline.
            </Paragraph>

            <SubHeader>What Users See</SubHeader>
            <DataTable
              headers={['In Ascension Step 2', 'What It Really Is']}
              rows={[
                ['"DEFENSE Shield — CJPI 98"', 'Cyber vertical Crown Jewel'],
                ['"Transaction Validator — CJPI 87"', 'Fintech vertical COMPILER output'],
                ['"Sensor Fusion Engine — CJPI 92"', 'Robotics vertical Memory Stream discovery'],
                ['"Compliance Auditor — CJPI 85"', 'Healthcare vertical Showroom item'],
              ]}
            />
            <Paragraph>The vertical origin is metadata (useful for internal tracking and MERCHANT curation) but invisible to the end user.</Paragraph>

            <SubHeader>What Gets Removed</SubHeader>
            <DataTable
              headers={['Removed', 'Reason']}
              rows={[
                ['12 vertical subdomains', 'No user-facing vertical products'],
                ['12 SSO configurations', 'Single auth through cmpsbl.com'],
                ['12 separate Stores', 'One unified Store catalog'],
                ['12 separate Showrooms', 'One Showroom, tagged by vertical'],
                ['12 separate Memory Stream UIs', 'Memory Streams run internally'],
                ['GENESIS as user-facing feature', 'GENESIS is governor-only internal tooling'],
              ]}
            />

            <SubHeader>What Stays</SubHeader>
            <DataTable
              headers={['Kept', 'Why']}
              rows={[
                ['GENESIS engine code', 'Spin up new verticals on demand'],
                ['Vertical Memory Streams', 'Internal discovery engines'],
                ['Vertical-specific 40-Primitive matrices', 'Domain-specialized collision'],
                ['Per-vertical CJPI scoring', 'Domain context improves accuracy'],
                ['Vertical metadata on Store items', 'MERCHANT uses it for curation'],
              ]}
            />
          </section>

          {/* Prime Vault */}
          <section>
            <SectionHeader>Unified S-Tier Vault — Prime Vault Architecture</SectionHeader>
            <Paragraph>
              All vertical discovery engines feed into <strong>one merged S-Tier vault</strong> (the
              "Prime Vault"). This is the single canonical registry of all Crown Jewels
              and S-Tier artifacts across every vertical and the core substrate.
            </Paragraph>

            <SubHeader>Auto-Population Flow</SubHeader>
            <CodeDiagram>{`  ┌────────────┐  ┌────────────┐  ┌────────────┐
  │  Cyber     │  │  Fintech   │  │  Robotics  │  ... x12
  │  Engine    │  │  Engine    │  │  Engine    │
  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
                        v
              ┌──────────────────┐
              │   PRIME VAULT    │
              │  (Merged S-Tier) │
              │                  │
              │  Auto-ingests    │
              │  from all        │
              │  vertical vaults │
              │  + core vault    │
              └────────┬─────────┘
                       │
                       v
              ┌──────────────────┐
              │ MERCHANT curates │
              │ ECONOMY prices   │
              │ Store surfaces   │
              └──────────────────┘`}</CodeDiagram>
          </section>

          {/* Dual-Gate Access */}
          <section>
            <SectionHeader>Vertical Substrate Access — Hidden Dual-Gate</SectionHeader>
            <Paragraph>
              Each vertical substrate remains fully operational but is <strong>invisible to the public</strong>. Access requires two layers:
            </Paragraph>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Layer 1: Secret URL Param</p>
                </div>
                <p className="text-sm text-muted-foreground"><code className="px-1.5 py-0.5 rounded-md text-[13px] font-mono bg-primary/10 text-primary border border-primary/10">?1952=cmpsbl</code> — without this, page renders blank. No error, no hint, no 404.</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Layer 2: 6-Digit PIN</p>
                </div>
                <p className="text-sm text-muted-foreground">After URL gate passes, PIN entry screen appears before content renders.</p>
              </div>
            </div>

            <BulletList items={[
              'All vertical routes are noindex, nofollow via meta robots',
              'All vertical paths are Disallow in robots.txt',
              'Session-scoped unlock (clears on tab close)',
              'Debug bypass key available for automated tooling',
            ]} />

            <SubHeader>Governor Access Pattern</SubHeader>
            <CodeDiagram>{`Kenneth visits: /gaming?1952=cmpsbl
→ Blank page transforms to PIN entry
→ Enters 6-digit PIN
→ Full vertical substrate loads with:
   - Independent Memory Stream
   - Discovery engine controls
   - Vertical-specific primitive matrix
   - S-Tier vault (auto-syncs to Prime Vault)`}</CodeDiagram>

            <SubHeader>Value of Keeping Full Copies</SubHeader>
            <Paragraph>Each vertical substrate maintains its own:</Paragraph>
            <BulletList items={[
              '40-Primitive matrix (domain-specialized)',
              'Discovery engine (can be manually triggered for on-demand discovery)',
              'Memory Stream (domain-scoped, feeds into global stream)',
              'S-Tier vault (local copy, auto-merges to Prime Vault)',
            ]} />
            <Paragraph>This allows the Governor to manually run discovery against high-demand capabilities, spin up intensive scans on specific verticals, review vertical-specific Memory Streams separately, and operate the entire substrate without public exposure.</Paragraph>
          </section>

          {/* Complete Pipeline */}
          <section>
            <SectionHeader>Complete Pipeline Diagram</SectionHeader>
            <CodeDiagram>{`┌──────────────────────────────────────────────────────────┐
│                SUBSTRATE (Internal)                      │
│                                                          │
│  GENESIS ──► Verticals ──► Memory Streams ──► COMPILER   │
│                                                 │        │
│                                         MERCHANT (curate)│
│                                                 │        │
│                                         ECONOMY (price)  │
│                                                 │        │
│                                         +-------v------+ │
│                                         | STORE CATALOG| │
│                                         +-------+------+ │
└─────────────────────────────────────────────────+────────┘
                                                  │
              ┌───────────────────────────────────┘
              │       ASCENSION V2 PIPELINE
              │
              │  Step 1: UPLOAD (user code)
              │         │
              │  Step 2: ENHANCE (skippable)
              │         +── SDK-built packages
              │         +── Store add-ons ◄──────── purchase
              │         │
              │  Step 3: ANALYZE
              │         │ 40-Primitive collision
              │         │ Dedup + Auto-lock
              │         │
              │  Step 4: RESULTS
              │         │ Single wrapped file
              │         +── Post-results upsell
              └───────────────────────────────────┘
                        │
                  Enhanced Code
                        │
              Demand data ──► Memory Streams (cycle repeats)`}</CodeDiagram>
          </section>

          {/* Key Insight */}
          <section>
            <SectionHeader>Key Insight</SectionHeader>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 sm:p-7">
              <Paragraph>
                Every product the substrate has ever built or will build now has a
                <strong> concrete use case</strong>: enhancing someone's ascended code. The Memory
                Stream's autonomous discoveries, the Crown Jewels, the COMPILER's
                output — all of it can flow through Mana into Ascension as purchasable
                capabilities. ECONOMY prices it, MERCHANT curates it, COMPILER builds
                it, and the SDK lets developers contribute to it using the same
                primitives (DREAM, EVOLUTION) that power the pipeline itself.
              </Paragraph>
              <Paragraph>
                The 12 vertical substrates stop being confusing standalone products
                and become what they always should have been: <strong>internal engines</strong> that feed domain-specific capabilities into one unified pipeline.
                GENESIS stays as the governor's tool to spin up new capability
                lines whenever the market demands them.
              </Paragraph>
              <p className="text-[15px] sm:text-base text-foreground leading-[1.8]">
                This transforms inventory into revenue and creates a self-reinforcing
                loop: better inputs → richer Ascension output → more demand →
                more discoveries → more products → better inputs.
              </p>
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-10 mt-12 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              © 2025–2026 CMPSBL® — PromptFluid™ · All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              U.S. Patent App. No. 64/029,678 · U.S. Patent App. No. 64/031,637
            </p>
            <p className="text-xs text-muted-foreground mt-3 italic">
              Internal document — not for public distribution
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
