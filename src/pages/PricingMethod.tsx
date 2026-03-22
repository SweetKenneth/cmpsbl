/**
 * Our Pricing Method — Transparent methodology page for consensus pricing
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, Scale, Shield, BarChart3, Layers, Zap, Target, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PricingMethod() {
  return (
    <>
      <Helmet>
        <title>Pricing Methodology — How We Price AI Capabilities | CMPSBL®</title>
        <meta name="description" content="How CMPSBL® systematically prices software capabilities using multi-model consensus, quality scoring, and market-grounded analysis. Transparent, auditable methodology." />
        <link rel="canonical" href="https://cmpsbl.com/pricing-method" />
        <meta property="og:title" content="Pricing Methodology | CMPSBL®" />
        <meta property="og:description" content="Transparent, auditable pricing for AI capabilities — multi-model consensus and quality scoring." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cmpsbl.com/pricing-method" />
        <meta property="og:image" content="https://cmpsbl.com/og-memory-stream.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pricing Methodology | CMPSBL®" />
        <meta name="twitter:description" content="Transparent, auditable pricing for AI capabilities — multi-model consensus and quality scoring." />
        <meta name="twitter:image" content="https://cmpsbl.com/og-memory-stream.jpg" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          {/* Back link */}
          <Link to="/foundry" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Foundry
          </Link>

          {/* Hero */}
          <div className="mb-16">
            <Badge variant="outline" className="mb-4">Methodology</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-6">
              How We Price Things
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Every price on this platform is calculated using a transparent, repeatable system — not guesswork. Here's exactly how it works.
            </p>
          </div>

          {/* Why pricing is hard */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              Why Pricing Software Is Tricky
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Software has no material cost. Its value depends on what it does, who needs it, how it's packaged, and what alternatives exist. The same feature might be worth $5 to a hobbyist and $5,000 to an enterprise team. Most pricing methods pick one perspective and hope for the best.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We don't guess. We use <strong className="text-foreground">multiple independent AI models</strong> to evaluate each capability against real market data, then combine those estimates with our own technical analysis to produce a fair, defensible price.
            </p>
          </section>

          {/* The Three Pillars */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              The Three Pricing Pillars
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-1">55%</div>
                  <div className="font-semibold text-foreground mb-2">Market Comparison</div>
                  <p className="text-sm text-muted-foreground">
                    Multiple AI models independently compare the capability to similar products and tools on the market. We take the middle estimate after removing outliers.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-foreground mb-1">25%</div>
                  <div className="font-semibold text-foreground mb-2">Technical Quality Score</div>
                  <p className="text-sm text-muted-foreground">
                    Our internal scoring system measures how sophisticated the capability is — including complexity, integration depth, and how well it works with other features. Higher scores earn a premium.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-foreground mb-1">20%</div>
                  <div className="font-semibold text-foreground mb-2">Engineering Analysis</div>
                  <p className="text-sm text-muted-foreground">
                    Our engineering team's own assessment based on component analysis, build complexity, and system depth. This keeps pricing grounded in measurable technical work.
                  </p>
                </CardContent>
              </Card>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              * Weights adjust dynamically: when fewer external estimates are available, internal signals receive proportionally more weight.
            </p>
          </section>

          {/* Multi-model consensus */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              How Multiple AI Models Agree on a Price
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Instead of trusting a single AI estimate, we ask <strong className="text-foreground">four independent models</strong> the same question. Each model gets the same technical profile and returns its own market analysis independently.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                { name: 'Claude Haiku 4.5', desc: 'Anthropic\'s efficient analyst — strong on nuanced market categorization' },
                { name: 'GPT-4o-mini', desc: 'OpenAI\'s low-cost model — excellent structured reasoning' },
                { name: 'Llama 3.3 70B', desc: 'Groq\'s ultra-fast open model — fast, grounded estimates' },
                { name: 'Qwen3 80B', desc: 'OpenRouter\'s free tier — independent cross-validation' },
              ].map(m => (
                <div key={m.name} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-neon-green mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-sm text-foreground">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Why bother with multiple models? A single AI can hallucinate prices or fixate on the wrong comparison. When three or four models independently land in the same price range, that number is much more trustworthy.
            </p>
          </section>

          {/* Outlier rejection */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Removing Bad Estimates
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Before calculating the final price, we run <strong className="text-foreground">statistical outlier detection</strong> to catch and exclude wild estimates. If one model says $5 while three others say $40–$60, the $5 gets flagged and removed.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This prevents a single confused model from throwing off the price. Excluded estimates are still recorded — we're transparent about what was used and what wasn't.
            </p>
          </section>

          {/* CJPI */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              The Technical Quality Score
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every capability gets a quality score that reflects how sophisticated it is. This score looks at:
            </p>
            <ul className="space-y-2 mb-4">
              {[
                'How many systems are involved',
                'Depth of memory and learning integration',
                'Overall system complexity',
                'Number of supported output formats',
                'Hardware compatibility',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="text-sm font-medium text-foreground mb-2">Quality Score → Price Multiplier</div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                {[
                  { score: '100', mult: '2.5×' },
                  { score: '94–99', mult: '2.0×' },
                  { score: '90–93', mult: '1.6×' },
                  { score: '80–89', mult: '1.3×' },
                  { score: '68–79', mult: '1.0×' },
                  { score: '<68', mult: '0.7×' },
                ].map(r => (
                  <div key={r.score} className="text-center p-1.5 bg-background rounded">
                    <div className="font-bold text-foreground">{r.mult}</div>
                    <div className="text-muted-foreground">{r.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Confidence */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              How We Measure Confidence
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every price comes with a confidence rating so you know how reliable the estimate is. It considers:
            </p>
            <div className="space-y-2 mb-4">
              {[
                'How many AI models returned valid estimates (more = better)',
                'How closely the models agreed with each other',
                'Whether market comparisons overlap',
                'Strength of our own technical signals',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-neon-green/10 border border-neon-green/20 rounded-lg">
                <div className="text-sm font-bold text-neon-green dark:text-neon-green">High</div>
                <div className="text-xs text-muted-foreground">≥70% · 3+ models agree</div>
              </div>
              <div className="text-center p-3 bg-neon-amber/10 border border-neon-amber/20 rounded-lg">
                <div className="text-sm font-bold text-neon-amber dark:text-neon-amber">Medium</div>
                <div className="text-xs text-muted-foreground">40–69% · partial agreement</div>
              </div>
              <div className="text-center p-3 bg-muted/30 border border-border/50 rounded-lg">
                <div className="text-sm font-bold text-muted-foreground">Low</div>
                <div className="text-xs text-muted-foreground">&lt;40% · limited data</div>
              </div>
            </div>
          </section>

          {/* Pricing tiers */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Three Price Tiers for Different Users
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every capability comes with three price points based on who's buying:
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-sm font-bold text-foreground mb-1">Indie</div>
                  <div className="text-2xl font-bold text-primary">60%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Solo developers, hobbyists, side projects
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/30">
                <CardContent className="pt-6 text-center">
                  <div className="text-sm font-bold text-foreground mb-1">Standard</div>
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Professional teams and commercial products
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-sm font-bold text-foreground mb-1">Enterprise</div>
                  <div className="text-2xl font-bold text-primary">350%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Large organizations with SLA requirements
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Fairness */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4">Consistent & Reproducible</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every product on this platform — capabilities, agents, engines — goes through the exact same pricing process. The same inputs always produce the same price. There's no manual price manipulation — the formula is deterministic and auditable.
            </p>
            <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> Prices are systematic estimates based on technical and market signals. They represent our best assessment of fair value, not guaranteed sale prices. Actual outcomes depend on demand, distribution, packaging, and timing.
            </div>
          </section>

          {/* CTA */}
          <div className="text-center pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-4">
              Questions about our pricing methodology?
            </p>
            <Link to="/contact" className="text-primary hover:underline text-sm font-medium">
              Get in touch →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
