import { SEO } from "@/components/SEO";
import { AuthorBio } from "@/components/AuthorBio";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import heroImage from "@/assets/blog/sparta-epoch-rebuild-journey.jpg";

const SpartaEpochRebuild = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Full Substrate Rebuild Story"
        description="How we refactored and rebuilt the entire CMPSBL cognitive substrate — deleting dead code, unifying architecture, and emerging production-grade."
        type="article"
        publishedTime="2026-02-24"
        keywords={['CMPSBL refactor', 'cognitive substrate rebuild', 'AI architecture', 'software consolidation', 'technical debt']}
      />

      <PublicNav />

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-20 md:pt-32 pb-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Research
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
            Burning It Down to Build It Right: The SPARTA Epoch Rebuild
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            How we refactored, consolidated, and rebuilt the entire CMPSBL cognitive substrate from the ground up — deleting thousands of lines of dead code, unifying fragmented architectures, and emerging with a production-grade layered kernel.
          </p>

          <AuthorBio publishDate="2026-02-24" readTime="22 min read" />
        </div>
      </section>

      {/* Hero Image */}
      <section className="relative w-full h-[50vh] overflow-hidden">
        <img 
          src={heroImage} 
          alt="Architectural blueprint showing old structures crumbling and new layered architecture rising"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </section>

      {/* Content */}
      <article className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto prose prose-invert prose-lg">
          
          {/* --- The Problem --- */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">The Problem: When Growth Becomes Debt</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              CMPSBL didn't start as a layered cognitive kernel. It started as most ambitious projects do — with a single idea, iterated relentlessly. Over the course of a year, we shipped modules, dashboards, APIs, admin panels, and experimental features at a pace that would make any startup proud.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              But speed has a cost. By early 2026, the codebase had metastasized into something none of us were proud of:
            </p>
            <ul className="space-y-3 text-muted-foreground mb-6">
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> Multiple duplicate layout components doing the same thing differently</li>
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> Legacy page files that hadn't been touched in months — dead code that still shipped in the bundle</li>
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> A flat architecture that treated every module as a peer, when in reality some were infrastructure and others were public surfaces</li>
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> Inconsistent naming: "Modernizer" and "Evolution" referred to the same thing in different places</li>
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> SEO metadata riddled with hardcoded version numbers that broke every time we cut a release</li>
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> Admin routes that had accumulated like geological layers — each epoch adding new ones without cleaning the old</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              The site still worked. But "working" and "correct" aren't the same thing. We were shipping a codebase that lied about its own architecture — public pages said one thing, internal dashboards showed another, and documentation described a third. For a system that markets itself as a cognitive substrate with full observability, that was unacceptable.
            </p>
          </section>

          {/* --- The Decision --- */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">The Decision: Refactor Is Not a Dirty Word</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We could have kept patching. Most teams do. You rename a label here, redirect a route there, and gradually the system converges. But "gradually" is a lie you tell yourself. In practice, partial migrations create permanent inconsistency.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              So we made the call: <strong className="text-foreground">full architectural realignment</strong>. Not a rewrite — that's equally dangerous. A disciplined, systematic consolidation that would touch every layer of the system but break nothing.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 my-8">
              <h3 className="font-bold text-foreground mb-2">The Ground Rules</h3>
              <ol className="space-y-2 text-muted-foreground text-sm">
                <li><strong className="text-foreground">1.</strong> No feature regressions. Every page that worked before must work after.</li>
                <li><strong className="text-foreground">2.</strong> All legacy routes must redirect. No broken bookmarks.</li>
                <li><strong className="text-foreground">3.</strong> One source of truth for the entity hierarchy. The architecture docs define reality; everything else conforms.</li>
                <li><strong className="text-foreground">4.</strong> No version numbers in SEO or public metadata. The substrate evolves; marketing shouldn't be brittle.</li>
                <li><strong className="text-foreground">5.</strong> Ship incrementally. Each phase must be deployable independently.</li>
              </ol>
            </div>
          </section>

          {/* --- Phase 1 --- */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Phase 1: Layout Unification</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The admin system had two layout components: a basic <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-sm">AdminLayout.tsx</code> and an enhanced version with error boundaries, analytics, and keyboard shortcuts. Both were in production. Different pages imported different ones.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Resolution was straightforward: delete the basic version, rename the enhanced version to <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-sm">AdminLayout.tsx</code>, and update all imports across the admin pages. One layout. One source of truth.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This alone touched every admin page in the system — but the change was mechanical and safe.
            </p>
          </section>

          {/* --- Phase 2 --- */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Phase 2: The Great Purge — Deleting Dead Code</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              This was the cathartic phase. We identified and deleted over <strong className="text-foreground">40 legacy page files</strong> and removed approximately <strong className="text-foreground">8,000 lines of dead code</strong> from the codebase.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These weren't trivial files. They were full page components — NexusBrain, BrainMemory, and other remnants from earlier architectural experiments where individual module dashboards existed as standalone pages. They'd been superseded by the unified substrate dashboard but never cleaned up.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Alongside the page deletions, we cleaned up:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-6">
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> Unused lazy imports in App.tsx</li>
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> Duplicate route definitions</li>
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> Orphaned component files with zero references</li>
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> Legacy edge functions that predated the current substrate architecture</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              We preserved backward compatibility by adding redirect rules for all deleted routes — ensuring that anyone with a bookmarked URL would land on the correct modern equivalent.
            </p>
          </section>

          {/* --- Phase 3 --- */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Phase 3: The Architectural Realignment</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              This was the intellectual core of the rebuild. The old architecture described CMPSBL as a flat collection of modules — all peers, no hierarchy. But that wasn't true. CORE has no upstream dependencies. CCR and CCL provide hidden infrastructure. INTEGRATION boots last because it depends on everything else. The modules aren't peers — they're a layered system with strict boot ordering and dependency resolution.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The new architecture makes this explicit:
            </p>

            <div className="bg-card border border-border rounded-lg p-6 my-8 font-mono text-sm text-muted-foreground">
              <div className="text-primary mb-2">// Boot Sequence — SPARTA Epoch</div>
              <div>CORE (Standalone Kernel)</div>
              <div className="ml-4">→ CCR (Layer 0): SYSTEM + BRAIN + MEMORY + DREAM</div>
              <div className="ml-4">→ CCL (Layer 1): RIPPLE + ACCESS + IDENTITY + RELAY + AUDIT</div>
              <div className="ml-4">→ Execution Surfaces: DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE</div>
              <div className="ml-4">→ INTEGRATION (boots last — dependency resolver)</div>
              <div className="ml-4">← Mesh Overlays: DEFENSE → IMMUNITY → EVOLUTION → INTENT → GOVERNANCE</div>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-4">
              We propagated this hierarchy through every public-facing surface:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-6">
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> <strong className="text-foreground">Status page:</strong> Reorganized from flat module list to five-layer grouping (Kernel, CCR Zone, CCL Zone, Surface, Overlay)</li>
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> <strong className="text-foreground">LLMs.txt page:</strong> Complete rewrite of the architectural overview for AI consumption</li>
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> <strong className="text-foreground">Investor pages:</strong> Entity counts and capability metrics updated</li>
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> <strong className="text-foreground">Observability HUD:</strong> Layer categorizations updated from legacy names to Zone/Surface/Overlay</li>
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> <strong className="text-foreground">Explorer cards, marketplace hero, tech showcase:</strong> "Modernizer" renamed to EVOLUTION everywhere</li>
            </ul>
          </section>

          {/* --- Phase 4 --- */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Phase 4: The Terminology Purge</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              "Modernizer" was the legacy name for what is now the EVOLUTION mesh overlay. It appeared in dashboards, tab labels, terminal boot sequences, FAQ answers, and component documentation. Every instance had to be found and replaced — not with a blind find-and-replace, but with contextual understanding of what each reference actually meant.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Similarly, references to the old flat module count had to be systematically identified and updated. Some were in SEO descriptions. Some were in simulated terminal output. Some were in investor-facing copy.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We built a tracking system to ensure every file was audited. The final count: over 30 files touched across the terminology purge alone.
            </p>
          </section>

          {/* --- Phase 5 --- */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Phase 5: SEO Hygiene — Removing the Brittle Numbers</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              This was the final pass. We audited every <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-sm">&lt;SEO /&gt;</code> component across the site and stripped out hardcoded counts, version numbers, and pricing strings from titles and descriptions.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The reasoning is simple: SEO metadata should be evergreen. When your architecture evolves from "21 modules" to a layered hierarchy, you don't want to chase down every meta description that says "21." So we moved to descriptive language:
            </p>
            <div className="bg-card border border-border rounded-lg p-6 my-8">
              <div className="text-sm mb-3">
                <span className="text-red-400 line-through">❌ "Real-time monitoring for 21 modules with 500+ capabilities"</span>
              </div>
              <div className="text-sm">
                <span className="text-green-400">✅ "Real-time monitoring for execution surfaces, mesh overlays, and convergence zones"</span>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              This ensures that future architectural evolution won't require another SEO scrub. The descriptions are accurate regardless of whether we have nine modules or ninety.
            </p>
          </section>

          {/* --- Documentation --- */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Phase 6: Documentation as Architecture</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We wrote comprehensive architectural documentation from scratch — not as an afterthought, but as the canonical source of truth. The docs define the architecture. The code implements it. If they disagree, the code is wrong.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The documentation suite now includes:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-6">
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> <strong className="text-foreground">Architecture Overview</strong> — The full layered hierarchy with boot sequence and health model</li>
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> <strong className="text-foreground">Kernel & Zones</strong> — CORE, CCR, and CCL deep dives with circuit breaker specifications</li>
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> <strong className="text-foreground">Execution Surfaces</strong> — All nine public modules with hot-swap procedures</li>
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> <strong className="text-foreground">Overlays & Evolution</strong> — Mesh hierarchy, SEBA lifecycle, shadow training loops</li>
              <li className="flex gap-3"><span className="text-primary font-bold">→</span> <strong className="text-foreground">Integrity & Governance</strong> — GOAL telemetry, deterministic health caps, audit trails</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Legacy documentation from the earlier architecture was archived with clear deprecation notices pointing to the current docs. Nothing was deleted — historical context matters — but the signal-to-noise ratio improved dramatically.
            </p>
          </section>

          {/* --- What We Learned --- */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">What We Learned</h2>
            
            <div className="space-y-8">
              <div className="border-l-4 border-primary pl-6">
                <h3 className="font-bold text-foreground mb-2">1. Dead code is technical debt with compound interest</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Every dead file increases cognitive load for anyone reading the codebase. It creates false positives in searches. It makes people hesitate to delete things because "maybe it's still used somewhere." The longer you wait, the harder the purge becomes.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-6">
                <h3 className="font-bold text-foreground mb-2">2. Naming is architecture</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  When "Modernizer" and "Evolution" coexist in the same codebase referring to the same thing, it's not a cosmetic issue. It means your team doesn't have shared vocabulary. That's an architectural failure masquerading as a naming preference.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-6">
                <h3 className="font-bold text-foreground mb-2">3. SEO metadata should never contain architecture specifics</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Module counts, version numbers, and pricing all change. If they're baked into meta descriptions, you create a maintenance burden that scales with the size of your site. Use descriptive, capability-focused language instead.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-6">
                <h3 className="font-bold text-foreground mb-2">4. Redirects are non-negotiable</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We added redirect rules for every route we deleted. This isn't optional. Users have bookmarks. Search engines have indexes. Broken URLs are broken trust.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-6">
                <h3 className="font-bold text-foreground mb-2">5. Incremental deployment beats big-bang launches</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Each phase was deployed independently and validated before moving to the next. This gave us confidence that the system was stable at every step — and made rollback trivial if something went wrong.
                </p>
              </div>
            </div>
          </section>

          {/* --- By the Numbers --- */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">By the Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Dead pages deleted", value: "40+" },
                { label: "Lines of code removed", value: "~8,000" },
                { label: "Files touched in SEO scrub", value: "30+" },
                { label: "Legacy redirects added", value: "84" },
                { label: "Layout components unified", value: "2 → 1" },
                { label: "Architecture docs written", value: "5 deep-dives" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* --- The Result --- */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">The Result: A Substrate That Tells the Truth</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The SPARTA Epoch isn't just a version bump. It's the moment the CMPSBL substrate became honest about what it is: a layered cognitive kernel with strict boot ordering, independent circuit breaker isolation, autonomous evolution, and five protective mesh overlays.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every public page, every SEO description, every status dashboard, every terminal simulation, every investor deck — they all tell the same story now. Not because we wrote marketing copy and hoped the engineering would catch up, but because we did the engineering first and let the public surfaces reflect the truth.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The codebase is leaner, the architecture is clearer, and the documentation is authoritative. New contributors can read the architecture docs and understand exactly how the system boots, how health is calculated, and how entities relate to each other.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Most importantly: the next evolution — whatever it is — won't require another full-site purge. The abstractions are right. The naming is right. The metadata is evergreen. We can grow from here.
            </p>
          </section>

          {/* --- Closing --- */}
          <section className="mb-16">
            <div className="bg-gradient-to-br from-primary/10 via-background to-accent/5 border border-primary/20 rounded-lg p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">The Takeaway</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If your system's public face doesn't match its engineering reality, fix it. Not later. Now. The longer the divergence persists, the more it compounds — in developer confusion, in user mistrust, in SEO inconsistency, in onboarding friction.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Refactoring isn't the absence of progress. It's the precondition for it.
              </p>
            </div>
          </section>

        </div>
      </article>

      <EnhancedFooter />
    </div>
  );
};

export default SpartaEpochRebuild;
