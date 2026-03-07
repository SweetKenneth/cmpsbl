/**
 * Chapter 19: Burning It Down — February 2026
 * The SPARTA rebuild.
 */
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/blog/sparta-epoch-rebuild-journey.jpg";

export default function BurningItDown() {
  return (
    <>
      <SEO
        title="Burning It Down — The Complete Substrate Rebuild"
        description="In February 2026, we deleted thousands of lines of code and rebuilt the substrate from scratch. Here's why, and what we learned."
        type="article"
        publishedTime="2026-02-10"
        keywords={['substrate rebuild', 'SPARTA epoch', 'software refactoring', 'architecture rebuild', 'technical debt elimination']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Substrate rebuild from scratch" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Burning It Down</h1>
          <p className="text-muted-foreground mb-8">February 10, 2026 · 20 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">In February 2026, we did something that most startups would never do: we stopped shipping features and spent four weeks rebuilding the entire substrate from the ground up. We called it the SPARTA epoch, and it was the best decision we made.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Why We Had to Rebuild</h2>
            <p>Fourteen months of rapid development had left scars. The codebase had grown organically — each node was built in isolation, with different conventions, different error handling, different logging patterns. Dependencies were tangled. Testing was inconsistent. Deploying one node could break another.</p>

            <p>We could have kept patching. Most teams do. But the technical debt was compounding faster than feature development. Every new capability took twice as long as it should because half the work was fighting the existing architecture.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What We Deleted</h2>
            <p>We deleted more code than we wrote. Duplicate utility functions. Abandoned experiments. Three different logging implementations. Two competing authentication flows. An entire node that had been "temporarily" disabled for six months.</p>

            <p>The substrate went from 40 nodes to 40 nodes — same count, but every single one was rewritten with consistent patterns, shared infrastructure, and proper test coverage.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Layered Architecture</h2>
            <p>The rebuild introduced a formal layer system. Kernel nodes (CORTEX, NEXUS, RIPPLE) at the bottom — these never go down. Cognitive nodes (BRAIN, DREAM, EVOLUTION) in the middle. Operational nodes (DEFENSE, ACCESS, VISION) wrapping everything. Expansion nodes (INCLUSIVE, RELAY, INTEGRATION) at the edges.</p>

            <p>Each layer can only depend on the layers below it. No circular dependencies. No cross-layer shortcuts. This constraint slowed us down initially but made the system dramatically more reliable.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Cost</h2>
            <p>Four weeks of zero feature development. That's terrifying for a startup. Customers waiting for capabilities that got delayed. Competitors shipping while we refactored. It required genuine conviction that the rebuild would pay dividends.</p>

            <p>It did. In the month after SPARTA, we shipped more features than the previous quarter combined. Deployment frequency tripled. Bug reports dropped 60%. The architecture supported growth instead of resisting it.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Lesson</h2>
            <p>Technical debt is real debt, and it accrues interest. Pay it down before it pays you down. SPARTA wasn't a luxury — it was survival.</p>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
