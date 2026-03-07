/**
 * Chapter 4: When Bots Found Us First — March 2025
 */
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import heroImg from "@/assets/blog/promptfluid-defense-ai-security.jpg";

const SLUG = "when-bots-found-us-first";

export default function WhenBotsFoundUsFirst() {
  return (
    <>
      <SEO title="When Bots Found Us First — Building DEFENSE" description="We didn't plan to build a security node. Then automated attacks found our API endpoints before we'd even launched." type="article" publishedTime="2025-03-05" keywords={["AI security defense", "DEFENSE node", "bot attack defense", "behavioral fingerprinting"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-security" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "When Bots Found Us First", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
      <BlogArticleJsonLd title="When Bots Found Us First — Building DEFENSE" description="How automated attacks forced us to build DEFENSE before launch." slug={SLUG} datePublished="2025-03-05" imageUrl={heroImg} keywords={["DEFENSE node", "bot defense", "AI security"]} />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="DEFENSE node security architecture" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">When Bots Found Us First</h1>
          <p className="text-muted-foreground mb-8">March 5, 2025 · 14 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">We didn't plan to build DEFENSE in March. We had a roadmap. DEFENSE was supposed to come later — maybe Q3. Then, on a Tuesday morning, we woke up to 47,000 requests from IP addresses we'd never seen. Our API costs for the day had already exceeded the entire previous month.</p>

            <p>The bots found us before our customers did.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Attack</h2>
            <p>Modern bot attacks don't look like attacks. The requests looked legitimate — properly formatted, reasonable payloads, varied timing. They used <a href="https://en.wikipedia.org/wiki/Residential_proxy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">residential proxy networks</a>, rotated user agents, and paused between requests like humans do.</p>

            <p>Our rate limiter caught the volume eventually, but by then the damage was done. The attackers weren't trying to break in — they were trying to make us go broke.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Behavioral Fingerprinting</h2>
            <p>IP blocking was useless. We needed to detect bots by behavior, not identity. We started logging everything: request timing, payload entropy, session coherence, interaction patterns. Humans are messy. Bots, even sophisticated ones, have <a href="https://en.wikipedia.org/wiki/Device_fingerprint" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">statistical fingerprints</a> that emerge over a sequence of requests.</p>

            <p>Within a week, we had a behavioral fingerprinting system that could distinguish bot traffic with 94% accuracy. By <Link to="/blog/the-bot-wars" className="text-primary hover:underline">August</Link>, that number would reach 96%.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Prompt Injection</h2>
            <p>The second class of attack was <a href="https://owasp.org/www-project-top-10-for-large-language-model-applications/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">prompt injection</a>. Requests designed to manipulate the AI models behind our API. We built a prompt safety engine that analyzes inputs before they reach the model — semantic analysis of intent, not just keyword matching. <Link to="/blog/cybersecurity-through-cognition" className="text-primary hover:underline">Later work</Link> would extend this to multi-stage injection detection.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Lesson</h2>
            <p>DEFENSE taught us something important: security can't be an add-on. It has to be woven into every request path. Every node in the substrate now routes through DEFENSE before processing. It's not optional. It's structural. <Link to="/blog/identity-at-every-layer" className="text-primary hover:underline">ACCESS</Link> would later complement DEFENSE with identity and entitlements.</p>
          </div>
          <BlogPostNav slug={SLUG} />
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
