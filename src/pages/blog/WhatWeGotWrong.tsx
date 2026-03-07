/**
 * Chapter 38: What We Got Wrong — February 2026
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { RewrittenNotice } from "@/components/blog/RewrittenNotice";
import heroImg from "@/assets/blog/sparta-epoch-rebuild-journey.jpg";

const SLUG = "what-we-got-wrong";

export default function WhatWeGotWrong() {
  return (
    <>
      <SEO title="What We Got Wrong" description="Over-engineered nodes, premature abstractions, and architectural decisions we'd reverse if we could." type="article" image={heroImg} publishedTime="2026-02-22" keywords={["engineering mistakes", "technical retrospective", "lessons learned"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-retrospective" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "What We Got Wrong", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="What We Got Wrong" description="Honest retrospective on mistakes and lessons." slug={SLUG} datePublished="2026-02-22" imageUrl={heroImg} keywords={["mistakes", "retrospective", "lessons"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Engineering retrospective" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">What We Got Wrong</h1>
          <p className="text-muted-foreground mb-8">February 22, 2026 · 15 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Forty chapters of building the substrate. This is the one where we're honest about what didn't work. Every origin story has failures — ours is no exception.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Branding Churn</h2>
            <p>We changed our name and brand identity multiple times. PromptFluid, Clockless, CMPSBL — each rebrand cost us recognition, confused early users, and broke documentation links. The content you're reading now was rewritten from posts published under previous names. We should have picked a name and stuck with it. The technical content was always solid; the packaging kept changing.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Over-Engineering Early</h2>
            <p>We built <Link to="/blog/nodes-that-talk" className="text-primary hover:underline">RIPPLE</Link> before we needed an event bus. We built <Link to="/blog/the-governance-question" className="text-primary hover:underline">AUDIT</Link> before we had enterprise customers asking for compliance. Premature abstraction added complexity without users. The <Link to="/blog/burning-it-down" className="text-primary hover:underline">SPARTA rebuild</Link> was partly a correction for building infrastructure nobody was using yet.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Trying to Do Everything</h2>
            <p>Thirty-eight nodes is a lot. Some of them overlap. Some exist because we thought we'd need them, not because users asked for them. The honest truth is that maybe 15-20 nodes carry 95% of the value. The rest are edge cases that could have waited. But they're built now, and removing them would break more than it fixes.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Documentation Gap</h2>
            <p>We wrote code faster than documentation. <Link to="/blog/building-on-the-substrate" className="text-primary hover:underline">Chapter 9</Link> tells the story of fixing that, but the gap existed for months. Developers abandoned the substrate not because it was bad, but because they couldn't figure out how to use it. That's a failure of communication, not engineering.</p>

            <p>These aren't excuses — they're lessons. Every mistake taught us something we couldn't have learned from success. The substrate is better because we made these mistakes early and corrected them before they became permanent.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
