/**
 * Chapter 13: The Bot Wars — August 2025
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/ai-hackers-underground-2025.jpg";
import imgThreat from "@/assets/blog/ai-threat-intel-adversarial-v9.jpg";

const SLUG = "the-bot-wars";

export default function TheBotWars() {
  return (
    <BlogArticleLayout slug={SLUG} title="The Bot Wars" subtitle="Real attacks, real defense — what five months of daily bot attacks taught us" date="August 5, 2025" readTime="14 min read" heroImage={heroImg} heroAlt="Bot attack defense in action" chapter={13} showRewrittenNotice={false} head={<><SEO title="The Bot Wars — Real Attacks, Real Defense" description="By August 2025, AI-powered bots were attacking our infrastructure daily. This is what we learned fighting them." type="article" image={heroImg} publishedTime="2025-08-05" keywords={["AI bot attacks", "bot defense real world", "automated attack defense", "AI security warfare"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-security" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "The Bot Wars", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="The Bot Wars — Real Attacks, Real Defense" description="What we learned from five months of daily bot attacks." slug={SLUG} datePublished="2025-08-05" imageUrl={heroImg} keywords={["bot wars", "bot defense", "AI attacks"]} /></>}>
      <p className="text-lg leading-relaxed">By August, we'd been running <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link> for five months. In that time, we'd blocked over 2 million automated requests, identified 340 unique bot signatures, and learned more about attack economics than we ever wanted to. What started as a reactive measure had become our most battle-tested node — and every week brought new adversaries.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The New Economics of Attacks</h2>
      <p>Modern bot attacks are a service industry. Attackers don't write their own tools — they rent infrastructure. $50/day gets you a <a href="https://en.wikipedia.org/wiki/Residential_proxy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">residential proxy network</a>, AI-powered CAPTCHA solving, and a dashboard with analytics. The <a href="https://www.europol.europa.eu/publications-events/publications/internet-organised-crime-threat-assessment-iocta-2024" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">barrier to launching</a> a sophisticated attack has collapsed.</p>
      <p>We tracked attack costs by analyzing the infrastructure attackers were using. A credential stuffing campaign using residential proxies costs roughly $200-500 per run. An AI-powered scraping operation that mimics human behavior costs $50-100/day. For comparison, the API credits they were consuming in our system cost us $3,000-5,000 before we could block them. The economics are massively asymmetric — it's cheap to attack and expensive to absorb.</p>

      <figure className="my-8">
        <img src={imgThreat} alt="Threat intelligence visualization showing adversarial attack patterns and bot signatures" className="w-full rounded-xl aspect-video object-cover" loading="lazy" />
        <figcaption className="text-sm text-muted-foreground/70 mt-2 text-center">340 unique bot signatures identified over five months — each one teaching DEFENSE new detection patterns.</figcaption>
      </figure>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Three Waves</h2>
      <p><strong>Wave 1: Volume attacks (March-April).</strong> Straightforward API hammering from cloud IPs. Easy to detect, easy to block. These felt dangerous at the time but were the training wheels.</p>
      <p><strong>Wave 2: Sophisticated mimicry (May-June).</strong> Residential proxies, realistic timing, valid payloads. These bots browsed our documentation before hitting the API — establishing a behavioral baseline that looked human. DEFENSE had to shift from request-level analysis to session-level pattern recognition.</p>
      <p><strong>Wave 3: AI-generated attacks (July-August).</strong> Bots using LLMs to craft unique payloads for every request. No two requests looked the same. Traditional pattern matching was useless. We had to go fully statistical — analyzing the distribution of request features rather than individual request content.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">What We Learned</h2>
      <p><strong>Residential IPs broke everything.</strong> IP reputation databases are useless when bots route through real home connections. We had to go fully behavioral — analyzing mouse movement patterns (on our dashboard), request cadence, and API usage sequences that no human would follow.</p>
      <p><strong>AI bots mimic humans well enough.</strong> Individual request analysis gives you false positives. Detection only works at the session level — analyzing patterns across 10-50 requests. The key signal turned out to be temporal regularity: humans have variable timing, bots have consistent timing with artificial jitter. The jitter itself follows a pattern that DEFENSE learned to detect.</p>
      <p><strong>Cost-based defense works.</strong> Making your system expensive to attack is as effective as making it hard to attack. We introduced computational challenges for suspicious sessions — not CAPTCHAs, but slightly delayed responses and additional verification steps that cost bots time and money. A 500ms delay on each request makes a $50/day attack cost $150/day for the same throughput.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Arms Race</h2>
      <p>We catch about 96% of automated traffic, up from 89% in <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">March</Link>. Perfect detection is a myth we refuse to sell. The remaining 4% is a mix of extremely sophisticated bots and false negatives we haven't figured out yet. Our advantage is that DEFENSE learns from every attack through <Link to="/blog/what-if-software-could-dream" className="text-primary hover:underline">DREAM consolidation</Link> — every failed detection becomes training data for tomorrow's model.</p>
      <p>The most important lesson: the goal isn't to stop every bot. It's to make your system the most expensive target on the attacker's list. The <Link to="/blog/cybersecurity-through-cognition" className="text-primary hover:underline">next chapter</Link> explores how this defensive posture evolved into predictive security — catching attacks before they begin.</p>
    </BlogArticleLayout>
  );
}
