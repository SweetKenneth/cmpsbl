/**
 * Chapter 4: When Bots Found Us First — March 2025
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/promptfluid-defense-ai-security.jpg";
import imgDefense from "@/assets/blog/defense-ai-security.jpg";

const SLUG = "when-bots-found-us-first";

export default function WhenBotsFoundUsFirst() {
  return (
    <BlogArticleLayout slug={SLUG} title="When Bots Found Us First" subtitle="How automated attacks forced us to build DEFENSE" date="March 5, 2025" readTime="14 min read" heroImage={heroImg} heroAlt="DEFENSE node security architecture" chapter={4} showRewrittenNotice={false} head={<><SEO title="When Bots Found Us First — Building DEFENSE" description="We didn't plan to build a security node. Then automated attacks found our API endpoints before we'd even launched." type="article" image={heroImg} publishedTime="2025-03-05" keywords={["AI security defense", "DEFENSE node", "bot attack defense", "behavioral fingerprinting"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-security" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "When Bots Found Us First", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="When Bots Found Us First — Building DEFENSE" description="How automated attacks forced us to build DEFENSE before launch." slug={SLUG} datePublished="2025-03-05" imageUrl={heroImg} keywords={["DEFENSE node", "bot defense", "AI security"]} /></>}>
      <p className="text-lg leading-relaxed">We didn't plan to build DEFENSE in March. We had a roadmap. DEFENSE was supposed to come later — maybe Q3, once we had paying customers and actual traffic worth protecting. Then, on a Tuesday morning, we woke up to 47,000 requests from IP addresses we'd never seen. Our API costs for the day had already exceeded the entire previous month.</p>
      <p>The bots found us before our customers did.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Attack</h2>
      <p>Modern bot attacks don't look like attacks. The requests looked legitimate — properly formatted JSON, reasonable token counts, varied timing between requests. They used <a href="https://en.wikipedia.org/wiki/Residential_proxy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">residential proxy networks</a>, rotated user agents on every request, and paused between requests like humans do. From the outside, each individual request was indistinguishable from a real user.</p>
      <p>Our rate limiter caught the volume eventually, but by then the damage was done. Over $4,000 in API costs consumed in eight hours. The attackers weren't trying to break in — they were trying to make us go broke. This attack pattern, sometimes called "wallet draining," targets AI startups specifically because our costs scale directly with request volume. One request to our API might cost us $0.05 in upstream model calls. At 47,000 requests, that's $2,350 in pure model costs, plus storage, compute, and bandwidth.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Behavioral Fingerprinting</h2>
      <p>IP blocking was useless — the bots rotated through thousands of residential IPs. User-agent filtering was useless — they used legitimate browser strings. We needed to detect bots by behavior, not identity.</p>
      <p>We started logging everything: request timing (millisecond precision), payload entropy, session coherence, endpoint access patterns, typing speed on our dashboard, mouse movement trajectories, scroll behavior. Humans are messy and unpredictable. Bots, even sophisticated ones, have <a href="https://en.wikipedia.org/wiki/Device_fingerprint" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">statistical fingerprints</a> that emerge over a sequence of 10-20 requests.</p>
      <figure className="my-8"><img src={imgDefense} alt="DEFENSE behavioral analysis detecting bot patterns through session-level fingerprinting" className="w-full rounded-xl aspect-video object-cover" loading="lazy" /><figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">DEFENSE analyzes behavioral patterns across request sequences to distinguish bots from humans.</figcaption></figure>
      <p>The breakthrough was temporal analysis. Humans have variable inter-request timing that follows a roughly log-normal distribution. Bots add random jitter to look human, but the jitter itself follows a uniform distribution — it's random in the wrong way. This single signal gave us 78% detection accuracy. Adding payload entropy analysis (bots tend to generate payloads with higher or lower entropy than humans) pushed it to 94%. Within a week, we had a behavioral fingerprinting system that could distinguish bot traffic with 94% accuracy. By <Link to="/blog/the-bot-wars" className="text-primary hover:underline">August</Link>, that number would reach 96%.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Prompt Injection</h2>
      <p>The second class of attack was <a href="https://owasp.org/www-project-top-10-for-large-language-model-applications/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">prompt injection</a>. Requests designed to manipulate the AI models behind our API — attempts to extract system prompts, bypass safety filters, or coerce models into generating harmful content. These attacks were clever: payloads encoded in base64, split across multiple parameters, or hidden in seemingly innocuous text.</p>
      <p>We built a prompt safety engine that analyzes inputs before they reach the model — semantic analysis of intent, not just keyword matching. The engine uses a lightweight classifier trained on known injection patterns, combined with structural analysis that detects suspicious encoding patterns. <Link to="/blog/cybersecurity-through-cognition" className="text-primary hover:underline">Later work</Link> would extend this to multi-stage injection detection across conversation turns.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Lesson</h2>
      <p>DEFENSE taught us something important: security can't be an add-on. It can't be a middleware you bolt on after the fact. It has to be woven into every request path, evaluated at every decision point, informed by every other node in the system. Every node in the substrate now routes through DEFENSE before processing. It's not optional. It's structural.</p>
      <p>DEFENSE also taught us about development priorities. We had a roadmap that put security in Q3. Reality put it in March. If you're building AI infrastructure and you don't have security yet, the bots will tell you when it's time. <Link to="/blog/identity-at-every-layer" className="text-primary hover:underline">ACCESS</Link> would later complement DEFENSE with identity and entitlements, turning "is this request safe?" into "is this request safe, authorized, and within quota?"</p>
    </BlogArticleLayout>
  );
}
