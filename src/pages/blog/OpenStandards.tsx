/**
 * Chapter 37: Open Standards — February 2026
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/ai-governance-namespace-unified.jpg";

const SLUG = "open-standards";

export default function OpenStandards() {
  return (
    <BlogArticleLayout slug={SLUG} title="Open Standards" subtitle="Building standards, not moats" date="February 15, 2026" readTime="14 min read" heroImage={heroImg} heroAlt="Open standards for AI governance" chapter={37} head={<><SEO title="Open Standards — Building Standards, Not Moats" description="We registered governance domains, published protocol specs, and open-sourced our terminology." type="article" image={heroImg} publishedTime="2026-02-15" keywords={["open standards AI", "AI governance standards", "protocol specifications"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-governance" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Open Standards", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="Open Standards" description="Building standards, not moats." slug={SLUG} datePublished="2026-02-15" imageUrl={heroImg} keywords={["open standards", "governance", "protocols"]} /></>}>
      <p className="text-sm sm:text-base leading-relaxed">We could have kept everything proprietary. Node names, protocol specs, governance terminology — all locked behind our brand. Instead, we published it as open standards. Here's why.</p>
      <p>The pragmatic argument is straightforward: closed ecosystems limit growth. If the substrate only connects to substrate-native components, our ceiling is whatever we can build internally. If it connects to anything that speaks our protocols, the ceiling is the entire AI ecosystem. We chose growth over control. But the ethical argument mattered too — AI governance is too important to be proprietary. If our approach to audit trails, validation chains, and trust scoring is genuinely good, the industry should benefit, not just our customers.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Governance Namespace</h2>
      <p>We registered domain names for <a href="https://en.wikipedia.org/wiki/AI_alignment" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AI governance concepts</a> and published canonical definitions. Not because we own these ideas — but because the industry needs shared vocabulary. When we say "audit trail" and a competitor says "compliance log," we're describing the same concept with different words. Standards fix that.</p>
      <p>The namespace currently defines 127 terms across six domains: trust and validation, memory and persistence, orchestration and routing, governance and compliance, observation and monitoring, and agent architecture. Each term has a canonical definition, usage examples, and relationship mappings to related terms. The namespace is versioned — we're on v3 as of February — and changes go through a review process that includes external contributors. Six companies have adopted the namespace for their own documentation, which is the clearest validation that standardization was the right call.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Foundations Page</h2>
      <p>Our <Link to="/foundations" className="text-primary hover:underline">Foundations page</Link> documents the principles we built on. Not marketing copy — actual engineering principles with rationale. Composability over monoliths. Observable by default. Learning from experience. Governance as runtime, not policy. These aren't just our standards — they're patterns that work, and anyone should use them.</p>
      <p>Each principle includes a "why" section that explains the failure mode it prevents, a "how" section with implementation guidance, and a "tradeoffs" section that honestly acknowledges what the principle costs. "Observable by default" means every operation has logging overhead. We quantify that overhead (about 3% of compute budget) and explain why it's worth paying. Principles without cost transparency are marketing, not engineering.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">LLMs.txt and Machine Protocols</h2>
      <p>Building on our <Link to="/blog/protocols-for-machines" className="text-primary hover:underline">earlier protocol work</Link>, we published complete machine-readable specifications for every substrate capability. AI agents from any platform can discover and interact with the substrate using standardized protocols. Interoperability isn't a feature — it's a requirement for an ecosystem.</p>
      <p>Our LLMs.txt implementation goes beyond basic capability listing. It includes semantic capability descriptions (so AI agents can understand what a node does, not just what endpoints it exposes), authentication requirements, rate limits, cost estimates, and quality expectations. An external AI agent can read our LLMs.txt, determine whether the substrate can help with its current task, authenticate, execute the operation, and evaluate the result — all without human intervention. We've verified this with three external agent frameworks, and it works end-to-end.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Open Source Calculation</h2>
      <p>We haven't open-sourced the substrate itself — the code is proprietary. But we've open-sourced everything around it: the governance namespace, the protocol specifications, the validation schemas, and the agent interoperability layer. This draws a clear line: the standards are free, the implementation is our product. Companies can build their own cognitive infrastructure using our standards. If they build it better than us, everyone benefits. If our implementation wins on merit, we've earned the business. That competitive pressure makes us better.</p>
      <p>Open standards are a bet. We're betting that a larger, standardized ecosystem benefits everyone more than a smaller, proprietary one. The early returns are positive — adoption of our namespace and protocols has grown 40% month-over-month since publication, and every adopter is a potential integration partner rather than a competitor who had to reinvent the wheel.</p>
    </BlogArticleLayout>
  );
}
