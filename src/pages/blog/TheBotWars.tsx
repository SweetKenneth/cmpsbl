/**
 * Chapter 13: The Bot Wars — August 2025
 * Real attacks, real defense, real lessons.
 */
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/blog/ai-hackers-underground-2025.jpg";

export default function TheBotWars() {
  return (
    <>
      <SEO
        title="The Bot Wars — Real Attacks, Real Defense"
        description="By August 2025, AI-powered bots were attacking our infrastructure daily. This is what we learned fighting them."
        type="article"
        publishedTime="2025-08-05"
        keywords={['AI bot attacks', 'bot defense real world', 'automated attack defense', 'bot-as-a-service', 'AI security warfare']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background">
        <article className="container max-w-3xl mx-auto px-4 py-16">
          <img src={heroImg} alt="Bot attack defense in action" className="w-full rounded-xl mb-8 aspect-video object-cover" />
          <h1 className="text-4xl font-black mb-4">The Bot Wars</h1>
          <p className="text-muted-foreground mb-8">August 5, 2025 · 14 min read · Written by the CMPSBL team</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">By August, we'd been running DEFENSE for five months. In that time, we'd blocked over 2 million automated requests, identified 340 unique bot signatures, and learned more about attack economics than we ever wanted to.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The New Economics of Attacks</h2>
            <p>Modern bot attacks are a service industry. Attackers don't write their own tools — they rent infrastructure. $50/day gets you a residential proxy network, AI-powered CAPTCHA solving, and a dashboard with analytics. The barrier to launching a sophisticated attack has collapsed.</p>

            <p>This changes the threat model fundamentally. You're not defending against a skilled hacker — you're defending against anyone with a credit card and an hour of free time.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">What We Learned</h2>
            <p><strong>Bots are getting faster than defenses.</strong> The gap between a new bot technique and a defense update used to be weeks. Now it's hours. Automated attack tools update faster than security teams can respond. Defense has to be automated too.</p>

            <p><strong>Residential IPs broke everything.</strong> IP reputation databases are useless when bots route through real home internet connections. We had to abandon IP-based detection entirely and go fully behavioral.</p>

            <p><strong>AI bots mimic humans well enough.</strong> Individual requests from AI-powered bots are indistinguishable from human requests. Detection only works at the session level — analyzing patterns across 10-50 requests to find statistical signatures.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Arms Race</h2>
            <p>We publish our detection rates honestly. We catch about 96% of automated traffic. The remaining 4% either evades detection or is sophisticated enough to be genuinely indistinguishable from human behavior. That number has improved from 89% in March, but perfect detection is a myth we refuse to sell.</p>

            <p>The attackers read our blog posts too. That's fine. Security through obscurity was never the strategy. Our advantage is that DEFENSE learns from every attack through DREAM consolidation, and each failed attack makes the next one harder.</p>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
