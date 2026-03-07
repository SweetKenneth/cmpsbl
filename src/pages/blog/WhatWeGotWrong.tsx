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
          <p className="text-muted-foreground mb-8">February 22, 2026 · 19 min read · Written by the CMPSBL team</p>
          <RewrittenNotice />
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Forty chapters of building the substrate. This is the one where we're honest about what didn't work. Every origin story has failures — ours is no exception.</p>

            <p>We debated whether to include this chapter. Origin stories are supposed to be triumphant arcs — every decision brilliant, every pivot prescient. But if you've been following the series, you've seen the seams. This chapter pulls them into focus. We believe that being honest about failures is more valuable to the reader (and more honest to ourselves) than pretending everything went smoothly.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Branding Churn</h2>
            <p>We changed our name and brand identity multiple times. PromptFluid, Clockless, CMPSBL — each rebrand cost us recognition, confused early users, and broke documentation links. The content you're reading now was rewritten from posts published under previous names. We should have picked a name and stuck with it. The technical content was always solid; the packaging kept changing.</p>

            <p>The cost of branding churn is more than just confusion. Every name change meant updating documentation, redirecting URLs, re-registering social accounts, reprinting materials, and re-educating partners. We estimate each rebrand cost us 3-4 weeks of engineering time on non-product work, plus an unquantifiable amount of trust erosion with early adopters who felt like they were following a company that couldn't make up its mind. The lesson is simple: branding is important, but changing it is expensive. Pick something defensible and commit.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Over-Engineering Early</h2>
            <p>We built <Link to="/blog/nodes-that-talk" className="text-primary hover:underline">RIPPLE</Link> before we needed an event bus. We built <Link to="/blog/the-governance-question" className="text-primary hover:underline">AUDIT</Link> before we had enterprise customers asking for compliance. Premature abstraction added complexity without users. The <Link to="/blog/burning-it-down" className="text-primary hover:underline">SPARTA rebuild</Link> was partly a correction for building infrastructure nobody was using yet.</p>

            <p>The counter-argument is that some infrastructure needs to exist before customers ask for it — you can't retrofit observability into a system that wasn't built for it. That's true. But we built AUDIT to handle regulatory frameworks we hadn't encountered yet, RIPPLE to support event volumes we wouldn't reach for six months, and ATLAS to map dependencies between nodes that didn't exist. The useful abstraction boundary is "build for the next known problem, not the third." We consistently built for the third, and some of that investment was wasted on capabilities we never used in the form we originally designed.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Trying to Do Everything</h2>
            <p>Thirty-eight nodes is a lot. Some of them overlap. Some exist because we thought we'd need them, not because users asked for them. The honest truth is that maybe 15-20 nodes carry 95% of the value. The rest are edge cases that could have waited. But they're built now, and removing them would break more than it fixes.</p>

            <p>We did a usage analysis in January. Five nodes (NEXUS, BRAIN, CASCADE, DECODE, DEFENSE) handle 72% of all substrate traffic. The next five handle 18%. The remaining twenty-eight nodes share the last 10%. Some of those twenty-eight nodes serve critical but infrequent functions — AUDIT fires rarely but is essential when it does. Others are genuinely underused. Three nodes had fewer than 100 invocations in all of January. We're keeping them because the removal cost exceeds the maintenance cost, but we wouldn't build them again.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Documentation Gap</h2>
            <p>We wrote code faster than documentation. <Link to="/blog/building-on-the-substrate" className="text-primary hover:underline">Chapter 9</Link> tells the story of fixing that, but the gap existed for months. Developers abandoned the substrate not because it was bad, but because they couldn't figure out how to use it. That's a failure of communication, not engineering.</p>

            <p>We tracked a metric we now call "time to first value" — how long it takes a new developer to make their first successful API call. In March 2025, it averaged 4.2 hours. After documentation improvements, it dropped to 45 minutes by August. The 4.2-hour figure means we lost developers who gave up after 30 minutes. We'll never know how many customers we lost to bad docs, but based on signup-to-first-call dropout rates, we estimate it was 40-50% of interested developers during the worst period.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Ignoring Developer Experience</h2>
            <p>Related to documentation: we optimized for capability before experience. The substrate was powerful but hostile to newcomers. Error messages were cryptic. API responses included internal debugging information that confused external developers. The SDK was an afterthought. We built the world's most capable cognitive infrastructure and wrapped it in the world's worst developer experience. Fixing this took three dedicated months and should have been prioritized from day one.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Honesty Tax</h2>
            <p>These aren't excuses — they're lessons. Every mistake taught us something we couldn't have learned from success. The substrate is better because we made these mistakes early and corrected them before they became permanent. If you're building something similar, learn from our timeline: brand first, document always, build only what users need now, and never sacrifice developer experience for internal convenience. The "honesty tax" of writing this chapter is paid back in trust from readers who've been through similar journeys.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}