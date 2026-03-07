/**
 * Chapter 4: When Bots Found Us First — March 2025
 * Building DEFENSE out of necessity.
 */
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/blog/promptfluid-defense-ai-security.jpg";

export default function WhenBotsFoundUsFirst() {
  return (
    <>
      <SEO
        title="When Bots Found Us First — Building DEFENSE"
        description="We didn't plan to build a security node. Then automated attacks found our API endpoints before we'd even launched. This is how DEFENSE was born."
        type="article"
        publishedTime="2025-03-05"
        keywords={['AI security defense', 'DEFENSE node', 'bot attack defense', 'behavioral fingerprinting', 'prompt injection defense']}
      />
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
            <p>Modern bot attacks don't look like attacks. There was no brute force. No obvious flood. The requests looked legitimate — properly formatted, reasonable payloads, varied timing. They used residential IP addresses, rotated user agents, and paused between requests like humans do.</p>

            <p>Our rate limiter caught the volume eventually, but by then the damage was done. Thousands of AI inference calls billed to our account. The attackers weren't trying to break in — they were trying to make us go broke.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Behavioral Fingerprinting</h2>
            <p>IP blocking was useless. The IPs changed every few requests. User agent filtering was useless. They rotated through hundreds. We needed to detect bots by behavior, not identity.</p>

            <p>We started logging everything: request timing, payload entropy, session coherence, interaction patterns. Humans are messy. They pause unpredictably. Their requests have natural variation. Bots, even sophisticated ones, have statistical patterns that emerge over a sequence of requests.</p>

            <p>Within a week, we had a behavioral fingerprinting system that could distinguish bot traffic with 94% accuracy — not from any single request, but from the pattern of requests over a session.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Prompt Injection</h2>
            <p>The second class of attack was prompt injection. Requests designed to manipulate the AI models behind our API — extracting system prompts, bypassing safety filters, or redirecting output. These weren't theoretical attacks. They were happening daily.</p>

            <p>We built a prompt safety engine that analyzes inputs before they reach the model. Not just keyword matching — semantic analysis of intent. It catches most injection attempts, but we're honest about the arms race: new techniques emerge weekly, and perfect detection is impossible.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8">The Lesson</h2>
            <p>DEFENSE taught us something important: security can't be an add-on. It has to be woven into every request path. Every node in the substrate now routes through DEFENSE before processing. It's not optional. It's not configurable. It's structural.</p>

            <p>The bots still come. But now they pay for the privilege of being detected.</p>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
