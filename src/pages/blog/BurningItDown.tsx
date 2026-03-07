/**
 * Chapter 19: Burning It Down — February 2026
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/sparta-epoch-rebuild-journey.jpg";
import imgModules from "@/assets/blog/clockless-modules-deep-dive.jpg";

const SLUG = "burning-it-down";

export default function BurningItDown() {
  return (
    <BlogArticleLayout slug={SLUG} title="Burning It Down" subtitle="The complete substrate rebuild — the SPARTA epoch" date="February 10, 2026" readTime="20 min read" heroImage={heroImg} heroAlt="Substrate rebuild from scratch" chapter={19} showRewrittenNotice={false} head={<><SEO title="Burning It Down — The Complete Substrate Rebuild" description="In February 2026, we deleted thousands of lines of code and rebuilt the substrate from scratch. Here's why, and what we learned." type="article" image={heroImg} publishedTime="2026-02-10" keywords={["substrate rebuild", "SPARTA epoch", "software refactoring", "technical debt elimination"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-origin" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Burning It Down", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="Burning It Down — The Complete Substrate Rebuild" description="Why we rebuilt the entire substrate from scratch in February 2026." slug={SLUG} datePublished="2026-02-10" imageUrl={heroImg} keywords={["SPARTA", "rebuild", "technical debt"]} /></>}>
      <p className="text-lg leading-relaxed">In February 2026, we did something that most startups would never do: we stopped shipping features and spent four weeks rebuilding the entire substrate from the ground up. We called it the SPARTA epoch, and it was the best decision we made.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Why We Had to Rebuild</h2>
      <p>Fourteen months of rapid development since <Link to="/blog/the-first-line-of-code" className="text-primary hover:underline">the first line of code</Link> had left scars. Each node was built in isolation, with different conventions. Dependencies were tangled. <a href="https://martinfowler.com/bliki/TechnicalDebt.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Technical debt</a> was compounding faster than feature development.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">What We Deleted</h2>
      <p>Duplicate utility functions. Three different logging implementations. Two competing authentication flows. An entire node that had been "temporarily" disabled for six months. The substrate went from 40 nodes to 40 nodes — same count, but every one rewritten with consistent patterns.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Layered Architecture</h2>
      <figure className="my-8">
        <img src={imgModules} alt="Post-SPARTA layered architecture — kernel, cognitive, operational, and expansion layers" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
        <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">The post-SPARTA architecture: four layers with strict dependency rules — kernel → cognitive → operational → expansion.</figcaption>
      </figure>
      <p>The rebuild introduced a formal <a href="https://en.wikipedia.org/wiki/Multitier_architecture" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">layer system</a>. Kernel nodes (CORTEX, <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link>, <Link to="/blog/nodes-that-talk" className="text-primary hover:underline">RIPPLE</Link>) at the bottom — these never go down. Cognitive nodes (<Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link>, <Link to="/blog/what-if-software-could-dream" className="text-primary hover:underline">DREAM</Link>, <Link to="/blog/when-software-starts-evolving" className="text-primary hover:underline">EVOLUTION</Link>) in the middle. Operational nodes (<Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link>, <Link to="/blog/identity-at-every-layer" className="text-primary hover:underline">ACCESS</Link>, <Link to="/blog/seeing-everything-at-once" className="text-primary hover:underline">VISION</Link>) wrapping everything. Expansion nodes (<Link to="/blog/accessibility-is-infrastructure" className="text-primary hover:underline">INCLUSIVE</Link>, <Link to="/blog/protocols-for-machines" className="text-primary hover:underline">RELAY</Link>) at the edges.</p>
      <p>Each layer can only depend on the layers below it. No circular dependencies. No cross-layer shortcuts.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Cost</h2>
      <p>Four weeks of zero feature development. Terrifying for a startup. But in the month after SPARTA, we shipped more features than the previous quarter. Deployment frequency tripled. Bug reports dropped 60%.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Lesson</h2>
      <p>Technical debt is real debt. Pay it down before it pays you down. SPARTA wasn't a luxury — it was survival. The <Link to="/blog/signal-to-silicon" className="text-primary hover:underline">complete pipeline</Link> that followed would not have been possible without it.</p>
    </BlogArticleLayout>
  );
}
