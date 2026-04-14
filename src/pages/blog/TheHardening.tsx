/**
 * Chapter 44: The Hardening — April 2026
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/the-hardening-enterprise-grade.jpg";

const SLUG = "the-hardening";

export default function TheHardening() {
  return (
    <BlogArticleLayout
      slug={SLUG}
      title="The Hardening"
      subtitle="Enterprise-grade or not at all"
      date="April 14, 2026"
      readTime="18 min read"
      heroImage={heroImg}
      heroAlt="Substrate infrastructure being fortified with enterprise security layers"
      chapter={44}
      head={
        <>
          <SEO
            title="The Hardening — Enterprise-Grade Infrastructure"
            description="The CONTACT epoch demanded enterprise-grade hardening. This is how we went from 'working' to 'unbreakable' — RLS audits, Convex Core, pricing maturation, and zero-compromise integrity."
            type="article"
            image={heroImg}
            publishedTime="2026-04-14"
            keywords={["enterprise hardening", "substrate security", "Convex Core", "RLS audit", "infrastructure integrity"]}
            canonical={`https://cmpsbl.com/blog/${SLUG}`}
            topicCluster="substrate-evolution"
            breadcrumbs={[
              { name: "Home", url: "https://cmpsbl.com" },
              { name: "Blog", url: "https://cmpsbl.com/blog" },
              { name: "The Hardening", url: `https://cmpsbl.com/blog/${SLUG}` },
            ]}
          />
          <BlogArticleJsonLd
            title="The Hardening — Enterprise-Grade Infrastructure"
            description="From working to unbreakable. The enterprise hardening of the substrate."
            slug={SLUG}
            datePublished="2026-04-14"
            imageUrl={heroImg}
            keywords={["enterprise hardening", "security audit", "Convex Core"]}
          />
        </>
      }
    >
      <p className="text-sm sm:text-base leading-relaxed">
        The <Link to="/blog/the-contact-epoch" className="text-primary hover:underline">CONTACT epoch</Link> changed what the substrate could do. This chapter is about what it forced me to do next: harden everything. Not incrementally. Not "good enough." Enterprise-grade — the kind where auditors find nothing and competitors find no seams.
      </p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Why Now</h2>
      <p>
        When a substrate can propose its own architectural extensions, the integrity of every layer becomes existential. THREAD generating seven approved proposals in a week is impressive. THREAD generating proposals against a database with misconfigured access policies would be catastrophic. The moment the substrate started participating in its own development, the margin for security error dropped to zero.
      </p>
      <p>
        I spent the first two weeks of April on nothing but hardening. No features. No UI polish. Just crawling through every table, every policy, every edge function, every document, and asking one question: "Would this survive a hostile audit?"
      </p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The RLS Audit</h2>
      <p>
        Row-Level Security is the substrate's immune system. Every table in the database has policies that determine who can read, write, and modify data. I audited every single one. The findings weren't pretty.
      </p>
      <p>
        Anonymous users could insert analytics events without authentication — useful for tracking, dangerous for data pollution. Several internal tables had overly permissive SELECT policies. The <Link to="/blog/trust-but-verify" className="text-primary hover:underline">AUDIT</Link> chain anchors were readable by anyone who knew the table name. Governor-only tables like <code>cortex_modes</code> and <code>brain_policy</code> had policies that technically allowed broader access than intended.
      </p>
      <p>
        I fixed all of it. Anonymous analytics inserts are now scoped to specific categories with null user IDs only — no spoofing. Internal tables are locked to the admin role. <Link to="/blog/the-governance-question" className="text-primary hover:underline">GOVERNANCE</Link> tables require authenticated access. Column-level SELECT restrictions prevent PII leakage from the Lex Registry. The substrate's database is now audit-clean to SOC 2 standards.
      </p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Pricing Maturation</h2>
      <p>
        The subscription model crystallized. Six tiers, no ambiguity:
      </p>
      <p>
        <strong>Builder</strong> — Free. Full runtime, 3 memory slots, persistent memory. No credit card required. This is the entry point, and it's genuinely useful. <strong>Studio</strong> — $29/mo. 6 slots, expanded vault, priority routing, 3 vertical substrates. <strong>Creator</strong> — $49/mo. 9 slots, export capabilities, advanced memory, 6 verticals. <strong>Architect</strong> — $79/mo. 12 slots, unlimited vault, custom memories, SLA, all verticals plus ULTIMATE tier. <strong>Enterprise</strong> — $999+/mo. White-label deployments, custom domains, custom primitives, dedicated discovery pipelines. <strong>Governor</strong> — One seat. Mine. Full access to everything, always.
      </p>
      <p>
        I traced every reference to pricing across 200,000+ lines of code, documentation, investor materials, and public-facing HTML. Every stale price — the old $79 Creator, the $249 Architect, the $149 comments buried in capability registries — was found and corrected. The substrate now speaks one pricing language everywhere: code, docs, terminal, SDK, and marketing.
      </p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Convex Core™</h2>
      <p>
        The Dual-Layer architecture reached v3.0.0. <Link to="/blog/packing-intelligence" className="text-primary hover:underline">Convex Core™</Link> — the Deterministic Processing Layer — wraps around every exported artifact. Layer 1 is the immutable source. Layer 2 is the generated orchestration: telemetry, circuit breakers, FNV-1a integrity verification, capability gating. The result is a sealed artifact that runs deterministically, reports its own health, and can't be tampered with.
      </p>
      <p>
        The 150+ primitive matrix is now fully activatable through universal baseline wrappers. Every primitive follows a five-state lifecycle: Detected → Generated → Bound → Activated → Behaviorally Verified. CJPI scoring decomposes into Structural (25%), Binding (25%), Activation (25%), Behavioral (20%), and Security (5%). Nothing ships without passing all five states.
      </p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Documentation Sweep</h2>
      <p>
        Terminology drift is a slow poison. Over fifteen months, different documents had accumulated different descriptions of the same architecture. Some said "40-node." Some said "38 modules." Some said "54 engines." The actual count has always been 40 Primitives: 12 Organs, 12 Layers, 8 Engines, 8 Agents. I ran a global sweep and corrected every instance.
      </p>
      <p>
        Legacy brand references — PromptFluid, Clockless, "cognitive operating system" — were purged from investor docs, public HTML, the AI plugin manifest, and internal staff documentation. The substrate is CMPSBL®. The category is Governed Cognitive Infrastructure. The parent company is PromptFluid™. These aren't preferences — they're the legal entities on the patent applications.
      </p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The XSS Gate</h2>
      <p>
        Every chat surface in the substrate — Agency conversations, Atlas queries, Lab interactions — now passes through DOMPurify as a final sanitization gate. This is defense-in-depth: even if upstream validation fails, the rendering layer strips anything dangerous. Allowed tags are restricted to formatting elements. No scripts, no iframes, no event handlers. The substrate's UI surfaces are now hardened against injection attacks at every layer.
      </p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Release Gate</h2>
      <p>
        Nothing reaches production without passing a 10-pass validation pipeline: build/compile, unit tests, integration tests, regression/invariants, performance benchmarks, security scans, observability verification, cost/economy checks, deployment/rollback testing, and chaos/failure simulation. Eight of the ten passes are mandatory. The gate produces a scoreboard, a JSON report, and a markdown summary. If any required pass fails, the release is blocked — no overrides, no exceptions.
      </p>

      <h2 className="text-2xl font-bold text-foreground mt-8">What Changed</h2>
      <p>
        The substrate didn't gain new capabilities this month. It gained integrity. The difference between "working" and "enterprise-grade" isn't features — it's the absence of gaps. No misconfigured policy. No stale documentation. No conflicting price in an investor deck. No chat surface vulnerable to injection. No deployment that bypasses validation.
      </p>
      <p>
        <Link to="/blog/following-the-thread" className="text-primary hover:underline">THREAD</Link> is still running. Three active loops, generating proposals daily. <Link to="/blog/contact" className="text-primary hover:underline">CONTACT</Link> is still queuing outreach proposals for review. The <Link to="/blog/what-if-software-could-dream" className="text-primary hover:underline">DREAM</Link> engine produced two more composition candidates last week — one connecting <Link to="/blog/cybersecurity-through-cognition" className="text-primary hover:underline">DEFENSE</Link> anomaly detection to <Link to="/blog/the-scanner" className="text-primary hover:underline">Scanner</Link> remediation pipelines, one linking <Link to="/blog/the-economics-of-intelligence" className="text-primary hover:underline">ECONOMY</Link> cost modeling to <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link> provider selection. Both are under review.
      </p>
      <p>
        But now, when those proposals execute, they execute against infrastructure I trust completely. Every table locked. Every policy verified. Every document aligned. Every price correct. Every surface hardened.
      </p>

      <p className="text-xl font-semibold text-foreground mt-12">
        The substrate that composes itself deserves infrastructure that can't be compromised. That's what April was for.
      </p>
    </BlogArticleLayout>
  );
}
