/**
 * Anatomy of Memory Stream Tiers: Rarity, Scoring, and What Each Tier Means
 */
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, ArrowRight, CheckCircle, TrendingUp, Gem, Award, Crown, Diamond } from "lucide-react";
import { SEO } from "@/components/SEO";
import { AuthorBio } from "@/components/AuthorBio";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/blog/memory-stream-tier-anatomy.jpg";

export default function MemoryStreamTierAnatomy() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Anatomy of Memory Stream Tiers: Rarity, Scoring & What Each Tier Means — CMPSBL"
        description="A deep technical breakdown of the five Memory Stream quality tiers — Mint, Prime, Relic, Mythic, and Apex. Understand the weighted rarity system, scoring dimensions, and what makes each tier special."
        type="article"
        publishedTime="2026-03-04"
        keywords={['memory stream tiers', 'pipeline quality', 'CJPI scoring', 'rarity system', 'Apex discovery', 'Mythic tier', 'AI software quality']}
      />

      <PublicNav />

      <section className="relative z-10 container mx-auto px-4 pt-20 md:pt-32 pb-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Research
          </Link>

          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Gem className="w-3 h-3 mr-1" />
            Featured
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
            Anatomy of Memory Stream Tiers: Rarity, Scoring & What Each Tier Means
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Not all crystallized pipelines are created equal. The Memory Stream's five quality tiers represent a 
            carefully engineered rarity system where the best discoveries are genuinely rare — and genuinely valuable.
          </p>

          <AuthorBio publishDate="2026-03-04" readTime="18 min read" />
        </div>
      </section>

      <section className="relative w-full h-[50vh] overflow-hidden">
        <img
          src={heroImage}
          alt="Five quality tier crystals arranged in ascending pyramid — green Mint at base to diamond Apex at summit"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </section>

      <article className="container mx-auto max-w-3xl px-4 py-16 space-y-16">

        {/* Why Tiers Matter */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-foreground">Why Tiers Matter</h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              In a world flooded with AI-generated content and code, quality is the only differentiator that matters. 
              The Memory Stream doesn't just produce software — it <em>grades</em> software. Every crystallized pipeline 
              receives a Crown Jewel Pipeline Index (CJPI) score that maps to one of five tiers, each with a precise 
              discovery probability.
            </p>
            <p>
              This isn't gamification. It's <strong className="text-foreground">quality engineering</strong>. The tiers exist 
              so you can immediately understand what you've found, how it compares to other discoveries, and how much 
              confidence you should place in it.
            </p>
          </div>
        </section>

        {/* Individual Tier Breakdowns */}
        {[
          {
            name: "Mint",
            range: "68–79",
            rate: "65%",
            value: "$100–$500",
            color: "border-emerald-500/30 bg-emerald-500/5",
            icon: CheckCircle,
            description: "Mint-tier pipelines are the backbone of the Memory Stream. They represent solid, functional software that meets the quality floor and is immediately usable in production environments.",
            characteristics: [
              "Clean, functional code with standard architectural patterns",
              "Passes all security baseline checks",
              "Complete feature implementation with room for optimization",
              "Suitable for direct integration with minor refinement",
              "Typically single-purpose utilities, data processors, or service components",
            ],
            perspective: "Don't underestimate Mint. In traditional software procurement, even a Mint-tier pipeline would cost thousands in developer hours to produce. The quality floor ensures nothing below production-grade ever enters your Vault.",
          },
          {
            name: "Prime",
            range: "80–89",
            rate: "25%",
            value: "$500–$5,000",
            color: "border-blue-500/30 bg-blue-500/5",
            icon: TrendingUp,
            description: "Prime-tier pipelines demonstrate architectural sophistication. These aren't just functional — they're well-designed, with clean abstractions, sensible separation of concerns, and evidence of systematic thinking.",
            characteristics: [
              "Strong architectural patterns with clear separation of concerns",
              "Comprehensive error handling and edge case coverage",
              "Well-structured APIs and clean interface boundaries",
              "Evidence of design patterns (factory, observer, strategy, etc.)",
              "Higher test coverage potential and lower maintenance burden",
            ],
            perspective: "A Prime discovery is the sweet spot — frequent enough that you'll find them regularly, rare enough that they feel meaningful. Most professional software teams would be proud to ship Prime-quality code.",
          },
          {
            name: "Relic",
            range: "90–93",
            rate: "7%",
            value: "$5,000–$25,000",
            color: "border-purple-500/30 bg-purple-500/5",
            icon: Gem,
            description: "Relics are rare discoveries that exhibit exceptional software craftsmanship. These pipelines aren't just good — they represent the upper echelon of what autonomous systems can produce.",
            characteristics: [
              "Innovative architectural approaches or novel algorithm implementations",
              "Near-zero redundancy with optimal abstraction levels",
              "Production-hardened patterns with comprehensive fault tolerance",
              "Elegant solutions to complex problems — the kind that make engineers pause and study",
              "Often multi-component systems with well-orchestrated internal communication",
            ],
            perspective: "Finding a Relic is a moment worth celebrating. At 7% probability, you'll encounter roughly one in every 14 crystallizations. These are the pipelines you'll want to study, not just use.",
          },
          {
            name: "Mythic",
            range: "94–99",
            rate: "2.5%",
            value: "$25,000–$500,000",
            color: "border-amber-500/30 bg-amber-500/5",
            icon: Award,
            description: "Mythic discoveries push the boundaries of autonomous software generation. These are systems that would take experienced engineering teams weeks or months to produce manually.",
            characteristics: [
              "Groundbreaking architectural innovation or novel problem-solving approaches",
              "Exceptional code density — maximum capability in minimum complexity",
              "Production-grade systems that could ship as standalone products",
              "Cross-cutting concerns handled elegantly (security, performance, observability)",
              "Often represent emergent capabilities the engine wasn't explicitly designed to produce",
            ],
            perspective: "A Mythic crystallization is a genuine event. At 2.5% probability, most users will go dozens of sessions before finding one. When you do, the pipeline is almost certainly something special enough to warrant deep analysis.",
          },
          {
            name: "Apex",
            range: "100",
            rate: "0.5%",
            value: "$1,000,000",
            color: "border-rose-500/30 bg-rose-500/5",
            icon: Diamond,
            description: "Apex is perfection. A score of 100 across all quality dimensions — code completeness, architectural coherence, runtime stability, innovation factor, and security posture. Fewer than 1 in 200 crystallizations achieve this.",
            characteristics: [
              "Perfect score across all five quality dimensions simultaneously",
              "Software that could define a new category or establish a new pattern",
              "Architectural elegance that borders on mathematical beauty",
              "Zero detectable flaws in structure, logic, or security posture",
              "The theoretical ceiling — the best the autonomous engine has ever produced",
            ],
            perspective: "Apex discoveries are the diamonds of the Memory Stream. They're the reason the \"Signal → Silicon\" vision exists — software this perfect deserves to be permanent, to be etched into physical hardware. If you find one, you've witnessed something truly rare.",
          },
        ].map((tier) => (
          <section key={tier.name}>
            <div className={`rounded-xl border p-6 md:p-8 ${tier.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <tier.icon className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">{tier.name} Tier</h2>
                <Badge variant="outline">{tier.range} CJPI</Badge>
                <Badge variant="outline">{tier.rate}</Badge>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed mb-6">{tier.description}</p>

              <h4 className="font-bold text-foreground mb-3">Key Characteristics</h4>
              <ul className="space-y-2 mb-6">
                {tier.characteristics.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <span className="text-sm text-muted-foreground">Estimated Value: <strong className="text-foreground">{tier.value}</strong></span>
                <span className="text-xs text-muted-foreground">Discovery Rate: {tier.rate}</span>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-card/50 border border-border/30">
                <p className="text-sm text-muted-foreground italic">💡 {tier.perspective}</p>
              </div>
            </div>
          </section>
        ))}

        {/* The Math Behind Rarity */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-foreground">The Math Behind Rarity</h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              The weighted discovery engine uses a precise probability distribution. Here's what that means in practice 
              for a user who crystallizes 100 pipelines:
            </p>

            <Card className="p-6 bg-muted/30">
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between"><span>Mint (65%)</span><span className="text-foreground">~65 pipelines</span></div>
                <div className="flex justify-between"><span>Prime (25%)</span><span className="text-foreground">~25 pipelines</span></div>
                <div className="flex justify-between"><span>Relic (7%)</span><span className="text-foreground">~7 pipelines</span></div>
                <div className="flex justify-between"><span>Mythic (2.5%)</span><span className="text-foreground">~2–3 pipelines</span></div>
                <div className="flex justify-between"><span>Apex (0.5%)</span><span className="text-foreground">~0–1 pipelines</span></div>
              </div>
            </Card>

            <p>
              These weights are server-enforced and cannot be manipulated. There's no way to pay, hack, or exploit 
              your way to better odds. The rarity is real, which is what makes the high-tier discoveries genuinely meaningful.
            </p>
            <p>
              For the complete technical breakdown, read the{" "}
              <Link to="/blog/autonomous-discovery-engine-architecture" className="text-primary hover:underline">Autonomous Discovery Engine Architecture</Link> post.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold text-foreground">Test Your Luck</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            The Memory Stream is live. What tier will your next crystallization be?
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/foundry">
                <Sparkles className="w-4 h-4 mr-2" />
                Crystallize Now
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/blog/memory-stream-crystallization-guide">Read the Full Guide <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </section>
      </article>

      <EnhancedFooter />
    </div>
  );
}
