/**
 * SubstrateRoadmap — 4-Week Unified Substrate Build Plan
 * Beautiful light-mode document for Governor review.
 * 
 * © CMPSBL® — PromptFluid™ · 2026
 */

import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Target, Layers, Zap, ShoppingCart, Shield, CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MilestoneProps {
  title: string;
  status: 'done' | 'active' | 'upcoming';
  items: { text: string; done?: boolean }[];
  deliverables: string[];
  dependencies?: string[];
}

function Milestone({ title, status, items, deliverables, dependencies }: MilestoneProps) {
  const borderColor = status === 'done' 
    ? 'border-l-emerald-500' 
    : status === 'active' 
    ? 'border-l-primary' 
    : 'border-l-border';

  return (
    <div className={`border-l-4 ${borderColor} pl-5 sm:pl-7 py-1`}>
      <div className="flex items-center gap-2 mb-3">
        {status === 'done' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
        {status === 'active' && <Clock className="w-5 h-5 text-primary shrink-0 animate-pulse" />}
        {status === 'upcoming' && <Circle className="w-5 h-5 text-muted-foreground shrink-0" />}
        <h3 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h3>
      </div>

      <ul className="space-y-2 mb-4">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-[15px] leading-relaxed text-foreground">
            <span className={`mt-0.5 shrink-0 ${item.done ? 'text-emerald-500' : 'text-muted-foreground'}`}>
              {item.done ? '✓' : '○'}
            </span>
            <span className={item.done ? 'text-muted-foreground line-through' : ''}>{item.text}</span>
          </li>
        ))}
      </ul>

      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Deliverables</p>
        <ul className="space-y-1">
          {deliverables.map((d, i) => (
            <li key={i} className="text-sm text-foreground flex gap-2">
              <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>

      {dependencies && dependencies.length > 0 && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Depends on:</span> {dependencies.join(' · ')}
        </p>
      )}
    </div>
  );
}

export default function SubstrateRoadmap() {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>4-Week Build Plan — CMPSBL® Substrate</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
            <Link to="/explore" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-primary">CMPSBL® Internal</p>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">4-Week Substrate Build Plan</h1>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Preamble */}
          <section className="mb-12">
            <div className="bg-card border border-border rounded-xl p-5 sm:p-7">
              <div className="flex items-start gap-3 mb-4">
                <Target className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-base font-semibold text-foreground mb-1">Strategic Objective</h2>
                  <p className="text-[15px] leading-relaxed text-foreground">
                    Unify all substrate output into <strong>one Store, one pipeline, one Ascension flow</strong>. 
                    Vertical substrates become internal discovery engines (gated behind dual-layer access). 
                    COMPILER builds software. MERCHANT curates. ECONOMY prices. Users buy capabilities 
                    as Ascension enhancements — never seeing the internal machinery.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {[
                  { label: 'Verticals', value: '12 engines', icon: Layers },
                  { label: 'Pipeline', value: '1 unified', icon: Zap },
                  { label: 'Store', value: '1 catalog', icon: ShoppingCart },
                  { label: 'Access', value: 'Dual-gate', icon: Shield },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-muted/50 rounded-lg p-3 text-center">
                    <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* What's Already Done */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Already Complete</h2>
            </div>
            <p className="text-[15px] text-muted-foreground mb-6 leading-relaxed">
              Foundation work shipped before this roadmap begins.
            </p>

            <Milestone
              title="Phase 0 — Core Infrastructure"
              status="done"
              items={[
                { text: 'Mana engine core (engine, lex, loader, manifest-consumer, findings-bridge, config, types)', done: true },
                { text: 'Ascension V2 pipeline (Upload → Enhance → Analyze → Results)', done: true },
                { text: 'ManaLab wizard UI (Upload → Merge → Lex → Attach → Export)', done: true },
                { text: 'Shield landing page + Lex Registry backend', done: true },
                { text: 'Lex Registry — lex_registry table, SHA-256 lookups, audit triggers, edge functions', done: true },
                { text: 'Vertical substrates moved behind dual-gate access (URL param + PIN)', done: true },
                { text: 'Prime Vault architecture documented', done: true },
                { text: 'ECONOMY/MERCHANT roles defined in distribution spec', done: true },
              ]}
              deliverables={[
                'Working Ascension pipeline (free tier)',
                'Mana wrapping for SDK-built packages',
                'Lex Registry with public lookup + authenticated registration',
                'Vertical substrates operational but hidden',
              ]}
            />
          </section>

          {/* Week 1 */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Week 1 — Store Catalog & Inventory Pipeline</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Foundation for the unified marketplace</p>

            <div className="space-y-8">
              <Milestone
                title="1A — Store Data Model"
                status="upcoming"
                items={[
                  { text: 'Create store_items table (name, description, category, CJPI score, tier, price_cents, origin_vertical, status)' },
                  { text: 'Create store_purchases table (user_id, item_id, stripe_payment_id, purchased_at)' },
                  { text: 'RLS: public read on active items, authenticated purchase, governor-only management' },
                  { text: 'Store item metadata schema — CJPI breakdown, primitive tags, compatibility matrix' },
                ]}
                deliverables={[
                  'store_items and store_purchases tables with RLS',
                  'Edge function for store catalog queries (filtered, sorted, paginated)',
                ]}
              />

              <Milestone
                title="1B — ECONOMY Pricing Engine"
                status="upcoming"
                items={[
                  { text: 'Implement ECONOMY pricing algorithm — inputs: CJPI score, tier, complexity, primitive count' },
                  { text: 'Price band definitions: Showroom $10-$50, Suites $50-$99, Crown Jewels $129-$249' },
                  { text: 'Auto-price trigger: new store_item INSERT → ECONOMY calculates and sets price_cents' },
                  { text: 'Governor override: manual price adjustment with audit trail' },
                ]}
                deliverables={[
                  'ECONOMY pricing function (database function or edge function)',
                  'Auto-pricing on item creation',
                  'Price audit log for governor review',
                ]}
              />

              <Milestone
                title="1C — MERCHANT Curation Interface"
                status="upcoming"
                items={[
                  { text: 'Governor-only Store management UI — add/edit/archive items' },
                  { text: 'CJPI minimum threshold gate (items below threshold auto-route to Junkyard)' },
                  { text: 'Suite builder — group related capabilities into purchasable bundles' },
                  { text: 'Seed initial catalog with existing Crown Jewels and COMPILER output' },
                ]}
                deliverables={[
                  'MERCHANT curation page (governor-gated)',
                  'Initial catalog of 10-20 items seeded from existing output',
                ]}
              />
            </div>
          </section>

          {/* Week 2 */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Week 2 — COMPILER Pipeline & Prime Vault</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Autonomous production line from discovery to catalog</p>

            <div className="space-y-8">
              <Milestone
                title="2A — COMPILER Build Pipeline"
                status="upcoming"
                items={[
                  { text: 'COMPILER intake — receives Memory Stream discoveries, produces standalone packages' },
                  { text: 'Auto-classification: assigns tier (Crown Jewel / Suite / Showroom / Junkyard) based on CJPI' },
                  { text: 'Build manifest output — package metadata, primitive tags, compatibility, origin vertical' },
                  { text: 'MERCHANT auto-review queue — new COMPILER output lands in "pending curation" status' },
                ]}
                deliverables={[
                  'COMPILER pipeline from Memory Stream → packaged capability',
                  'Auto-tier classification based on CJPI scoring',
                  'Review queue for MERCHANT curation',
                ]}
                dependencies={['Week 1 store_items table']}
              />

              <Milestone
                title="2B — Prime Vault"
                status="upcoming"
                items={[
                  { text: 'Implement merged S-Tier vault that auto-ingests from all 12 vertical vaults + core' },
                  { text: 'Dedup engine — prevent duplicate capabilities across verticals' },
                  { text: 'Origin tagging — every Prime Vault entry tracks which vertical produced it' },
                  { text: 'Governor Prime Vault browser — view all S-Tier artifacts, filter by vertical/tier/primitive' },
                ]}
                deliverables={[
                  'Prime Vault table with auto-ingest triggers',
                  'Governor-only Prime Vault browser UI',
                ]}
              />

              <Milestone
                title="2C — Vertical Discovery Engine Controls"
                status="upcoming"
                items={[
                  { text: 'Per-vertical discovery controls accessible behind dual-gate' },
                  { text: 'Manual "run discovery now" trigger for on-demand capability mining' },
                  { text: 'Vertical Memory Stream viewer — browse discoveries before they enter COMPILER' },
                  { text: 'Prime Vault sync status indicator per vertical' },
                ]}
                deliverables={[
                  'Discovery engine controls on each gated vertical page',
                  'Manual discovery trigger with real-time status',
                ]}
              />
            </div>
          </section>

          {/* Week 3 */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Week 3 — Ascension Step 2 Purchase Flow</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Revenue integration — from catalog to checkout to enhanced code</p>

            <div className="space-y-8">
              <Milestone
                title="3A — Store Browse in Ascension Step 2"
                status="upcoming"
                items={[
                  { text: 'Browsable Store catalog inside Ascension Enhance step' },
                  { text: 'Filter by primitive type, tier, price range, CJPI score' },
                  { text: 'Item detail cards — capability description, CJPI breakdown, what it enhances' },
                  { text: '"Preview Enhancement" — show predicted CJPI impact before purchase' },
                ]}
                deliverables={[
                  'Store browse UI within Ascension V2 Step 2',
                  'Filtering and sorting for catalog items',
                ]}
                dependencies={['Week 1 catalog data', 'Week 2 COMPILER output']}
              />

              <Milestone
                title="3B — Stripe Checkout Integration"
                status="upcoming"
                items={[
                  { text: 'Stripe checkout session for individual Store items' },
                  { text: 'Stripe checkout for Suite bundles (discounted vs individual)' },
                  { text: 'Purchase receipt stored in store_purchases with Stripe payment ID' },
                  { text: 'Webhook handler for payment confirmation → unlock item for Mana attachment' },
                ]}
                deliverables={[
                  'Stripe checkout flow for Store purchases',
                  'Payment webhook handler edge function',
                  'Purchase record with audit trail',
                ]}
              />

              <Milestone
                title="3C — Purchase → Mana Wrap → Re-Ascension"
                status="upcoming"
                items={[
                  { text: 'After purchase confirmation, auto-attach item via Mana wrapping' },
                  { text: 'Re-run Ascension with purchased enhancement merged into user code' },
                  { text: 'Updated results showing capability improvement from purchased add-on' },
                  { text: 'Post-results "Enhance Further" — surface additional relevant items based on gap analysis' },
                ]}
                deliverables={[
                  'End-to-end: browse → purchase → Mana wrap → re-Ascension → enhanced results',
                  'Post-results upsell with gap-based recommendations',
                ]}
                dependencies={['3A Store browse', '3B Stripe integration']}
              />
            </div>
          </section>

          {/* Week 4 */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Week 4 — Polish, Launch Prep & Hardening</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Production-grade quality, security, and observability</p>

            <div className="space-y-8">
              <Milestone
                title="4A — Security & Rate Limiting"
                status="upcoming"
                items={[
                  { text: 'Rate limiting on Store purchase endpoints' },
                  { text: 'Input validation on all Store/COMPILER/ECONOMY edge functions' },
                  { text: 'RLS audit — verify all Store tables have proper access controls' },
                  { text: 'Stripe webhook signature verification hardening' },
                ]}
                deliverables={[
                  'Hardened endpoints with rate limits',
                  'Full RLS audit report',
                ]}
              />

              <Milestone
                title="4B — Governor Dashboard & Observability"
                status="upcoming"
                items={[
                  { text: 'Store revenue dashboard — purchases, revenue, top items, conversion rates' },
                  { text: 'COMPILER output metrics — items built, approval rate, time-to-catalog' },
                  { text: 'ECONOMY pricing analytics — price distribution, demand signals, margin tracking' },
                  { text: 'Prime Vault growth metrics — S-Tier count by vertical, new discoveries/week' },
                ]}
                deliverables={[
                  'Governor-only analytics dashboard for Store + Pipeline health',
                ]}
              />

              <Milestone
                title="4C — SEO, Docs & Launch"
                status="upcoming"
                items={[
                  { text: 'SEO optimization for Store-facing pages (Showroom, capability pages)' },
                  { text: 'Update sitemap.xml, robots.txt, LLMs.txt with new Store routes' },
                  { text: 'Public API documentation for Store catalog queries' },
                  { text: 'Changelog entry for unified Store launch' },
                  { text: 'Final smoke test — full flow: discover → build → curate → price → browse → purchase → enhance' },
                ]}
                deliverables={[
                  'Production-ready unified Store',
                  'Updated SEO assets',
                  'Public changelog announcement',
                ]}
              />
            </div>
          </section>

          {/* Revenue Model */}
          <section className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-5">Revenue Model</h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground border-b border-border">Tier</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground border-b border-border">What They Get</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground border-b border-border">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground border-b border-border">Priced By</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Free Ascension', 'Upload → Analyze → Export (no enhancements)', '$0', '—'],
                    ['SDK Enhance', 'Attach own packages via Mana step', 'Free', '—'],
                    ['Showroom Add-On', 'Single curated capability', '$10–$50', 'ECONOMY'],
                    ['COMPILER Suite', 'Multi-capability bundle', '$50–$99', 'ECONOMY'],
                    ['Crown Jewel', 'Premium substrate algorithm', '$129–$249', 'ECONOMY'],
                    ['Engine Access', 'AUTOMATON / CORTEX / NEXUS / ARCHITECT', '$79–$249', 'Fixed'],
                    ['Agent Access', 'WRAITH / OBSIDIAN / MONOLITH / RAPTOR', '$79–$249', 'Fixed'],
                    ['Architect Bundle', 'Full Ascension + all add-ons', '$249/mo', 'Fixed'],
                  ].map(([tier, desc, price, by], i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground border-b border-border/50 whitespace-nowrap">{tier}</td>
                      <td className="px-4 py-3 text-foreground border-b border-border/50">{desc}</td>
                      <td className="px-4 py-3 text-foreground border-b border-border/50 whitespace-nowrap font-mono text-xs">{price}</td>
                      <td className="px-4 py-3 text-muted-foreground border-b border-border/50">{by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Key Decisions */}
          <section className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-5">Key Decisions to Iron Out</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'COMPILER Autonomy Level',
                  detail: 'Does COMPILER auto-publish to the Store after MERCHANT approval, or does the Governor manually approve every item? Fully autonomous = faster catalog growth. Manual = tighter quality control.',
                },
                {
                  q: 'ECONOMY Price Floor/Ceiling',
                  detail: 'Should ECONOMY have hard floors ($10 minimum) and ceilings ($500 maximum), or can it price freely based on CJPI and demand? Consider: what happens when CJPI scores cluster around similar values?',
                },
                {
                  q: 'Suite Composition Rules',
                  detail: 'How many capabilities per Suite? Fixed (always 3-5) or variable? Can a Crown Jewel appear in a Suite at a discount, or are Crown Jewels always standalone premium?',
                },
                {
                  q: 'Re-Ascension Cost',
                  detail: 'When a user purchases an add-on and re-runs Ascension with the enhancement, is the re-run free or does it count as a new Ascension run? Consider: Architect tier ($249/mo) gets unlimited re-runs.',
                },
                {
                  q: 'Junkyard → Store Promotion',
                  detail: 'Can a Junkyard item be promoted to the Store if it gains traction? What\'s the promotion criteria — CJPI improvement? Community demand? Governor decision only?',
                },
                {
                  q: 'Community SDK Packages in Store',
                  detail: 'Do community-built SDK packages get listed in the Store catalog? If yes, what\'s the revenue split? MERCHANT quality gate applies equally?',
                },
                {
                  q: 'Vertical Discovery Prioritization',
                  detail: 'When running on-demand discovery, can the Governor prioritize specific primitive types (e.g., "focus on DEFENSE capabilities this cycle")? Or does each vertical run its full 40-Primitive sweep?',
                },
                {
                  q: 'Post-Results Recommendation Depth',
                  detail: 'After Ascension results, how many Store items to recommend? Top 3 most relevant? Or a full "capability gap analysis" showing all possible enhancements with predicted CJPI lift?',
                },
              ].map(({ q, detail }, i) => (
                <div key={i} className="border border-border rounded-lg p-4 sm:p-5">
                  <h3 className="text-[15px] font-semibold text-foreground mb-1.5">
                    <span className="text-primary font-mono text-sm mr-2">Q{i + 1}</span>
                    {q}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Architecture Diagram */}
          <section className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-5">Pipeline Architecture</h2>
            <div className="bg-muted/30 border border-border rounded-xl p-4 sm:p-6 overflow-x-auto">
              <pre className="text-xs sm:text-sm font-mono leading-relaxed text-foreground whitespace-pre">{`GENESIS ──► 12 Vertical Engines ──► Memory Streams
                                          │
                                    ┌─────▼─────┐
                                    │  COMPILER  │  Builds packages + suites
                                    └─────┬─────┘
                                          │
                                    ┌─────▼─────┐
                                    │  MERCHANT  │  Curates, quality gates
                                    └─────┬─────┘
                                          │
                                    ┌─────▼─────┐
                                    │  ECONOMY   │  Auto-prices by CJPI
                                    └─────┬─────┘
                                          │
                              ┌───────────▼───────────┐
                              │    UNIFIED STORE       │
                              │  Crown Jewels          │
                              │  COMPILER Suites       │
                              │  Showroom Items        │
                              │  Community Packages    │
                              └───────────┬───────────┘
                                          │
                              ┌───────────▼───────────┐
                              │  ASCENSION V2          │
                              │  Step 1: Upload        │
                              │  Step 2: Enhance ◄─────┤ Store browse + purchase
                              │  Step 3: Analyze       │
                              │  Step 4: Results       │ Post-results upsell
                              └───────────┬───────────┘
                                          │
                                    Enhanced Code
                                          │
                              Demand data ──► Memory Streams
                                          (cycle repeats)`}</pre>
            </div>
          </section>

          {/* Metrics */}
          <section className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-5">Target Metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { metric: 'Store catalog size', w1: '10-20 items', w4: '50+ items' },
                { metric: 'COMPILER output/week', w1: '—', w4: '5-10 capabilities' },
                { metric: 'Ascension runs/day', w1: '10', w4: '100' },
                { metric: 'Store conversion rate', w1: '—', w4: '8-12%' },
                { metric: 'Prime Vault S-Tier count', w1: '—', w4: '200+' },
                { metric: 'Revenue per Ascension run', w1: '$0', w4: '$15-$40 avg' },
              ].map(({ metric, w1, w4 }) => (
                <div key={metric} className="border border-border rounded-lg p-3 sm:p-4 flex justify-between items-center gap-2">
                  <span className="text-sm text-foreground font-medium">{metric}</span>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-muted-foreground">{w1}</span>
                    <span className="text-xs text-muted-foreground mx-1">→</span>
                    <span className="text-sm font-semibold text-primary">{w4}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-8 border-t border-border text-center">
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
