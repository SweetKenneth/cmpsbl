/**
 * Chapter 1: The First Line of Code — December 2024
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/promptfluid-market-disruptor.jpg";
import imgEcosystem from "@/assets/blog/promptfluid-ecosystem.jpg";

const SLUG = "the-first-line-of-code";

export default function TheFirstLineOfCode() {
  return (
    <BlogArticleLayout
      slug={SLUG}
      title="The First Line of Code"
      subtitle="Why we started building cognitive infrastructure"
      date="December 15, 2024"
      readTime="12 min read"
      heroImage={heroImg}
      heroAlt="The beginning of the CMPSBL substrate"
      chapter={1}
      showRewrittenNotice={false}
      head={
        <>
          <SEO
            title="The First Line of Code — Why We Started Building"
            description="In December 2024, we wrote the first line of what would become the CMPSBL substrate. This is the honest story of why."
            type="article"
            image={heroImg}
            publishedTime="2024-12-15"
            keywords={["cognitive infrastructure origin", "AI substrate story", "CMPSBL founding", "why build AI infrastructure"]}
            canonical={`https://cmpsbl.com/blog/${SLUG}`}
            topicCluster="substrate-origin"
            relatedTopics={["AI infrastructure", "cognitive computing", "modular architecture"]}
            breadcrumbs={[
              { name: "Home", url: "https://cmpsbl.com" },
              { name: "Blog", url: "https://cmpsbl.com/blog" },
              { name: "The First Line of Code", url: `https://cmpsbl.com/blog/${SLUG}` },
            ]}
          />
          <BlogArticleJsonLd title="The First Line of Code — Why We Started Building" description="In December 2024, we wrote the first line of what would become the CMPSBL substrate." slug={SLUG} datePublished="2024-12-15" imageUrl={heroImg} keywords={["cognitive infrastructure", "AI substrate", "CMPSBL"]} />
        </>
      }
    >
      <p className="text-lg leading-relaxed">In December 2024, we sat in front of a blank editor and asked a question that wouldn't leave us alone: what if AI infrastructure wasn't something you rented by the token, but something you owned — something that could think?</p>

      <p>The AI landscape at the time was clear in its limitations. You could call an API. You could get a response. But the moment the request ended, everything was gone. No memory. No learning. No continuity. Every interaction started from zero. The <a href="https://arxiv.org/abs/2307.03109" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">lost-in-the-middle</a> problem was well-documented — models couldn't even use what was in their context, let alone remember across sessions.</p>

      <p>We'd spent months watching teams duct-tape <a href="https://en.wikipedia.org/wiki/Retrieval-augmented_generation" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">RAG pipelines</a> together that broke under load, and pay escalating costs for models that couldn't remember a conversation from five minutes ago. The tooling was impressive in isolation but architecturally bankrupt.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Problem We Couldn't Ignore</h2>
      <p>The fundamental issue wasn't model quality — the models were extraordinary. The issue was infrastructure. There was no layer between "call an API" and "build everything yourself." No persistent memory. No governance. No way for systems to learn from their own experience.</p>

      <p>Enterprise teams were spending more time on plumbing than on intelligence. Authentication, rate limiting, model routing, audit trails, cost tracking — every team was rebuilding these from scratch. And none of it carried forward.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">What We Decided to Build</h2>
      <p>We decided to build the missing layer. Not another model. Not another wrapper. Infrastructure — cognitive infrastructure that could persist state, route intelligently, secure itself, and learn from every interaction. What would eventually become the <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">NEXUS routing node</Link> started here as a simple failover function.</p>

      <figure className="my-8">
        <img src={imgEcosystem} alt="The emerging CMPSBL substrate ecosystem — nodes working together as composable cognitive infrastructure" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
        <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">The substrate ecosystem as it would eventually look — composable nodes forming cognitive infrastructure.</figcaption>
      </figure>

      <p>That first function was embarrassingly simple. A try/catch that called OpenAI, and if it failed, called Anthropic. No health scoring. No latency-weighted selection. No cost optimization. Just "if this breaks, try that." But it worked. And more importantly, it proved the architectural hypothesis: if you could abstract the model layer, everything above it could be model-agnostic.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Why This Matters</h2>
      <p>The substrate started from a conviction: AI applications need infrastructure, not just APIs. The same way web applications needed databases, caches, load balancers, and CDNs before they could scale — AI applications need memory, routing, governance, and observability before they can be trusted in production.</p>

      <p>Nobody was building that layer. The big model providers wanted you locked into their ecosystem. The framework vendors wanted you locked into their abstractions. We wanted to build the thing that sits underneath — the substrate that everything else grows on.</p>

      <p>This is the honest story of how that happened. Not the marketing version. Not the pitch deck narrative. The real, chronological account of what we built, what broke, what we rebuilt, and what we learned along the way.</p>

      <p>The next chapter picks up ten days later, when that simple failover function met its first real challenge — and we realized we needed something <Link to="/blog/routing-the-unknown" className="text-primary hover:underline">much smarter than try/catch</Link>.</p>
    </BlogArticleLayout>
  );
}
