/**
 * Chapter 18: When Software Starts Evolving — January 2026
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import heroImg from "@/assets/blog/evolving-software-v6-breakthrough.jpg";
import imgDiscovery from "@/assets/blog/autonomous-discovery-engine.jpg";

const SLUG = "when-software-starts-evolving";

export default function WhenSoftwareStartsEvolving() {
  return (
    <>
      <SEO title="When Software Starts Evolving — Autonomous Improvement" description="In January 2026, the substrate crossed a threshold: DREAM consolidation cycles started producing improvements we didn't program." type="article" image={heroImg} publishedTime="2026-01-15" keywords={["evolving software", "autonomous improvement", "self-improving AI", "EVOLUTION node"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-cognition" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "When Software Starts Evolving", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="When Software Starts Evolving — Autonomous Improvement" description="DREAM consolidation cycles produce improvements we didn't program." slug={SLUG} datePublished="2026-01-15" imageUrl={heroImg} keywords={["EVOLUTION", "self-improving", "autonomous"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Software evolution breakthrough" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">When Software Starts Evolving</h1>
          <p className="text-muted-foreground mb-8">January 15, 2026 · 18 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">In January 2026, eight months after launching <Link to="/blog/what-if-software-could-dream" className="text-primary hover:underline">DREAM</Link>, something unexpected happened. During a routine review, we found optimization patterns we didn't write. Routing improvements. Memory retrieval heuristics. Cost-reduction strategies. The substrate had discovered them on its own.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What Actually Happened</h2>
            <p>Let's be precise. The substrate didn't "think." What happened was mechanistic: DREAM's <a href="https://en.wikipedia.org/wiki/Pattern_recognition_(psychology)" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">pattern extraction</a>, running nightly for eight months, had accumulated enough heuristic data to produce novel combinations of existing optimization strategies.</p>

            <p>A routing optimization that <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link> had never used before — splitting large requests into parallel chunks across cheaper providers — emerged from the consolidation of thousands of individual routing decisions.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The EVOLUTION Node</h2>
            <p>EVOLUTION tests DREAM's suggestions in a <a href="https://en.wikipedia.org/wiki/Sandbox_(computer_security)" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">sandboxed environment</a>, measures improvement against baseline, and only promotes changes that pass a confidence threshold. Most suggestions are noise — maybe 15% are genuine improvements.</p>

            <figure className="my-8">
              <img src={imgDiscovery} alt="Autonomous discovery engine — DREAM suggests, EVOLUTION tests, the substrate improves" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
              <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">The discovery loop: DREAM extracts patterns, EVOLUTION tests them in sandbox, proven improvements get promoted.</figcaption>
            </figure>

            <h2 className="text-2xl font-bold text-foreground mt-8">Safety Boundaries</h2>
            <p>EVOLUTION can only modify routing weights, memory tier thresholds, and cache parameters. It cannot modify security policies (<Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link>), authentication rules (<Link to="/blog/identity-at-every-layer" className="text-primary hover:underline">ACCESS</Link>), or its own evaluation criteria. These boundaries are enforced at the code level — they can't be changed by the substrate itself.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Results</h2>
            <p>First month: latency dropped 11%, cost per request dropped 8%, memory retrieval accuracy improved 6%. All without human intervention. The improvements are modest but real, and they compound. The <Link to="/blog/agents-that-actually-learn" className="text-primary hover:underline">learning patterns</Link> we'd documented for developers were now being applied by the infrastructure itself.</p>

            <p>We're careful not to overclaim this. It's not AGI. It's a system good at finding patterns in its own operational data. That's enough to be genuinely useful — and it survived the <Link to="/blog/burning-it-down" className="text-primary hover:underline">SPARTA rebuild</Link> intact.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
