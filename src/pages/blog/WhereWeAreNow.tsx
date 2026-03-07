/**
 * Chapter 40: Where We Are Now — March 2026
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { RewrittenNotice } from "@/components/blog/RewrittenNotice";
import heroImg from "@/assets/blog/signal-to-silicon-narrative.jpg";

const SLUG = "where-we-are-now";

export default function WhereWeAreNow() {
  return (
    <>
      <SEO title="Where We Are Now — The State of the Substrate" description="Forty chapters later. The current state of the substrate, what's running in production, and what comes next." type="article" image={heroImg} publishedTime="2026-03-07" keywords={["substrate current state", "CMPSBL status", "production AI"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-current" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Where We Are Now", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="Where We Are Now" description="The current state of the substrate." slug={SLUG} datePublished="2026-03-07" imageUrl={heroImg} keywords={["current state", "production", "status"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="The current state of the CMPSBL substrate" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">Where We Are Now</h1>
          <p className="text-muted-foreground mb-8">March 7, 2026 · 16 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Forty chapters. Fifteen months. From <Link to="/blog/the-first-line-of-code" className="text-primary hover:underline">one function</Link> to a cognitive infrastructure platform with thirty-eight nodes, a marketplace, an agency system, and an auto-blog that writes about itself. Here's where things stand.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What's Running</h2>
            <p>The full substrate is live. <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS</Link> routes thousands of requests daily. <Link to="/blog/teaching-machines-to-remember" className="text-primary hover:underline">BRAIN</Link> maintains persistent memory across sessions. <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link> blocks automated attacks in real time. <Link to="/blog/the-memory-stream" className="text-primary hover:underline">Memory Stream</Link> crystallizes cognitive signals into deployable software. The <Link to="/blog/the-marketplace" className="text-primary hover:underline">Store</Link> serves artifacts and <Link to="/blog/packing-intelligence" className="text-primary hover:underline">Packs</Link>.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What Surprised Us</h2>
            <p>Gaming. We built the substrate for enterprise AI workflows. <Link to="/blog/gaming-the-substrate" className="text-primary hover:underline">Game developers</Link> found it and used it for NPC memory and adaptive narratives. The Scanner — our simplest product — brings in more new users than any other feature. And the <Link to="/blog/when-the-system-writes" className="text-primary hover:underline">auto-blog</Link> has generated more content than we could have written manually.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What We'd Do Differently</h2>
            <p><Link to="/blog/what-we-got-wrong" className="text-primary hover:underline">Chapter 38</Link> covers the mistakes in detail. The short version: fewer nodes earlier, better documentation from day one, and one brand name from the start. But you can't learn these lessons without making the mistakes first.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What Comes Next</h2>
            <p>We're not done. The substrate is designed to grow — new nodes, new capabilities, new verticals. But we're past the phase of building everything ourselves. The <Link to="/blog/the-composable-agent" className="text-primary hover:underline">Cognitives</Link> framework means anyone can build on the substrate. The <Link to="/blog/open-standards" className="text-primary hover:underline">open standards</Link> mean other platforms can connect to it.</p>

            <p>This story isn't over. But it's caught up to today. Future chapters will be written as they happen — not rewritten from memory. Thanks for reading.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
