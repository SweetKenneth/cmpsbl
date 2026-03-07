/**
 * Chapter 17: Protocols for Machines — December 2025
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/ai-protocol-standards-v9.jpg";
import imgLlms from "@/assets/blog/llms-txt-protocol-standard.jpg";

const SLUG = "protocols-for-machines";

export default function ProtocolsForMachines() {
  return (
    <BlogArticleLayout slug={SLUG} title="Protocols for Machines" subtitle="How AI systems should talk to each other" date="December 5, 2025" readTime="14 min read" heroImage={heroImg} heroAlt="AI protocol standards" chapter={17} showRewrittenNotice={false} head={<><SEO title="Protocols for Machines — How AI Systems Should Talk" description="We adopted LLMs.txt, built machine-readable documentation, and established protocol standards for autonomous agent communication." type="article" image={heroImg} publishedTime="2025-12-05" keywords={["AI protocol standards", "LLMs.txt protocol", "machine-to-machine communication", "RELAY node"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-protocols" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Protocols for Machines", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="Protocols for Machines — How AI Systems Should Talk" description="Protocol standards for autonomous agent communication." slug={SLUG} datePublished="2025-12-05" imageUrl={heroImg} keywords={["LLMs.txt", "protocols", "RELAY"]} /></>}>
      <p className="text-lg leading-relaxed">In December 2025, the substrate was being consumed by AI agents as often as human developers. We needed protocols designed for machines.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">LLMs.txt Adoption</h2>
      <p>The <a href="https://llmstxt.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">llmstxt.org</a> protocol gave us a framework. A structured file that tells AI systems what your service does and how to interact with it. AI agents that consumed our LLMs.txt file made 40% fewer malformed requests. This built on the <Link to="/blog/building-on-the-substrate" className="text-primary hover:underline">developer experience</Link> work from May.</p>

      <figure className="my-8">
        <img src={imgLlms} alt="LLMs.txt protocol standard — machine-readable service descriptions for autonomous agent consumption" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
        <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">The LLMs.txt standard: structured, machine-readable documentation that AI agents consume natively.</figcaption>
      </figure>

      <h2 className="text-2xl font-bold text-foreground mt-8">RELAY: Outbound Communication</h2>
      <p>The RELAY node emerged from the protocol work. Every outbound message flows through RELAY — consistent <a href="https://en.wikipedia.org/wiki/Exponential_backoff" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">retry logic</a>, dead-letter queuing, delivery confirmation. An evolution of <Link to="/blog/nodes-that-talk" className="text-primary hover:underline">RIPPLE's webhook handling</Link> into a dedicated outbound node.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Protocol Contracts</h2>
      <p>Three guarantees for machine-to-machine communication: every message has a verified sender (<Link to="/blog/the-governance-question" className="text-primary hover:underline">IDENTITY</Link>), every delivery is confirmed or escalated (RELAY), and every interaction is logged with cryptographic integrity (<Link to="/blog/the-governance-question" className="text-primary hover:underline">AUDIT</Link>).</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">AI Governance Namespace</h2>
      <p>We registered governance-related domain names to establish canonical vocabulary for <a href="https://en.wikipedia.org/wiki/AI_alignment" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AI governance concepts</a>. Published as open standards, not proprietary terminology. See our <Link to="/foundations" className="text-primary hover:underline">Foundations</Link> page for the full standard.</p>
    </BlogArticleLayout>
  );
}
