/**
 * Chapter 36: When the System Writes About Itself — February 2026
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { RewrittenNotice } from "@/components/blog/RewrittenNotice";
import heroImg from "@/assets/blog/cascade-ai-adaptive-brain.jpg";

const SLUG = "when-the-system-writes";

export default function WhenTheSystemWrites() {
  return (
    <>
      <SEO title="When the System Writes About Itself" description="The substrate's auto-blog generates, reviews, and publishes its own content. A meta-chapter about AI that documents its own evolution." type="article" image={heroImg} publishedTime="2026-02-05" keywords={["auto-blog AI", "self-documenting systems", "CLM"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-meta" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "When the System Writes About Itself", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="When the System Writes About Itself" description="AI that documents its own evolution." slug={SLUG} datePublished="2026-02-05" imageUrl={heroImg} keywords={["auto-blog", "CLM", "self-documenting"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="The substrate writing about itself" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">When the System Writes About Itself</h1>
          <p className="text-muted-foreground mb-8">February 5, 2026 · 10 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">You've probably noticed the "AI Generated" posts in the blog feed. Those aren't written by a separate content tool — they're written by the substrate itself, using the same nodes that power everything else.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Constant Learning Mode</h2>
            <p>CLM is the substrate's always-on learning process. It monitors system changes, tracks capability evolution, and identifies topics worth documenting. When it finds something worth writing about, it drafts a post using <Link to="/blog/when-one-model-isnt-enough" className="text-primary hover:underline">CASCADE</Link> for multi-stage writing, <Link to="/blog/trust-but-verify" className="text-primary hover:underline">PROOF</Link> for fact-checking, and <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link> for contextual consistency.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Quality Pipeline</h2>
            <p>Every auto-generated post goes through a quality pipeline: semantic drift detection (is it staying on topic?), contradiction scoring (does it conflict with previous posts?), confidence scoring (how certain is the content?), and split-brain review (two independent evaluations that must agree). Posts below quality threshold don't publish.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Meta Problem</h2>
            <p>There's something genuinely strange about a system that documents its own capabilities. The auto-blog posts are both content and proof of concept. "Here's an article about how our AI writes articles" — and the article itself demonstrates the claim. We're honest about this: the AI-generated posts are clearly labeled, and this chapter explains exactly how they work.</p>

            <p>The auto-blog isn't trying to replace human writing. The 40-chapter Origin Story you're reading was written by the team. The AI-generated posts are supplementary — deeper dives, technical explorations, and updates that the substrate identifies as valuable. Both sources feed the <Link to="/blog/the-memory-stream" className="text-primary hover:underline">Memory Stream</Link>.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
