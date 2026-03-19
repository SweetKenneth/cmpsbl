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
        <title>Our Pricing Method | CMPSBL®</title>
        <meta name="description" content="How CMPSBL® systematically prices software capabilities using multi-model consensus, CJPI scoring, and market-grounded analysis." />
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
                  <div className="font-semibold text-foreground mb-2">Internal Valuation</div>
                  <p className="text-sm text-muted-foreground">
                    Engineering-derived value based on component analysis, crystallization depth, and system complexity. This anchors pricing to measurable technical metrics.
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
              Multi-Model Consensus Pricing
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Instead of relying on a single AI model's estimate, we query <strong className="text-foreground">four independent models</strong> simultaneously. Each model receives the same structured prompt containing the capability's technical profile, and returns an independent market analysis.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                { name: 'Claude Haiku 4.5', desc: 'Anthropic\'s efficient analyst — strong on nuanced market categorization' },
                { name: 'GPT-4o-mini', desc: 'OpenAI\'s low-cost model — excellent structured reasoning' },
                { name: 'Llama 3.3 70B', desc: 'Groq\'s ultra-fast open model — fast, grounded estimates' },
                { name: 'Qwen3 80B', desc: 'OpenRouter\'s free tier — independent cross-validation' },
              ].map(m => (
                <div key={m.name} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-sm text-foreground">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Why multiple models? A single model can hallucinate prices or anchor on irrelevant comparisons. When three or four models independently agree on a price range, that estimate is far more trustworthy.
            </p>
          </section>

          {/* Outlier rejection */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Outlier Rejection
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Before computing the consensus, we apply <strong className="text-foreground">modified IQR (Interquartile Range) analysis</strong> to detect and exclude outlier estimates. If one model suggests $5 while three others suggest $40–$60, the $5 estimate is flagged and excluded.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This prevents a single unreliable or confused model from skewing the final price. Excluded estimates are still recorded in the pricing evidence — we're transparent about what was included and what wasn't.
            </p>
          </section>

          {/* CJPI */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              What CJPI Contributes
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Apex Discovery Index (CJPI) is our proprietary technical scoring system. It evaluates:
            </p>
            <ul className="space-y-2 mb-4">
              {[
                'Node count and integration depth',
                'Memory crystallization quality',
                'System chain complexity',
                'Export target breadth',
                'Hardware compatibility signals',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="text-sm font-medium text-foreground mb-2">CJPI Premium Multipliers</div>
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
              How Confidence Is Determined
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every price includes a confidence score reflecting how much trust to place in the estimate. Confidence considers:
            </p>
            <div className="space-y-2 mb-4">
              {[
                'Number of successful provider estimates (more = better)',
                'Degree of price agreement between providers',
                'Marketplace recommendation overlap',
                'Strength of internal metadata signals (CJPI, module count, valuation)',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">High</div>
                <div className="text-xs text-muted-foreground">≥70% · 3+ models agree</div>
              </div>
              <div className="text-center p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="text-sm font-bold text-amber-600 dark:text-amber-400">Medium</div>
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
              Indie / Standard / Enterprise Ranges
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every capability receives three pricing tiers derived from the recommended price:
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-sm font-bold text-foreground mb-1">Indie</div>
                  <div className="text-2xl font-bold text-primary">60%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Solo developers, hobbyists, early-stage teams
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/30">
                <CardContent className="pt-6 text-center">
                  <div className="text-sm font-bold text-foreground mb-1">Standard</div>
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Professional teams, commercial use
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-sm font-bold text-foreground mb-1">Enterprise</div>
                  <div className="text-2xl font-bold text-primary">350%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Large organizations, custom licensing, SLA
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Fairness */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-4">Fairness & Consistency</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every capability, agent, engine, and sellable software object on this platform goes through the same pricing methodology. The same inputs always produce the same outputs. There is no manual price manipulation — the formula is deterministic, reproducible, and auditable.
            </p>
            <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-sm text-muted-foreground">
              <strong className="text-foreground">Important:</strong> Prices are systematic estimates based on technical and market signals. They represent our best assessment of fair market value, not guaranteed sale prices. Actual market outcomes depend on demand, distribution, packaging, and timing.
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
