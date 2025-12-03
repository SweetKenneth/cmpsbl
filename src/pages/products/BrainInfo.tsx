import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Zap, TrendingUp, Sparkles, Network, ArrowRight, CheckCircle, Moon, Share2, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BrainInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Cascade - World's First Dreaming AI | PromptFluid"
        description="Meet Cascade, the world's first AI with autonomous dream capabilities. FluidMind Neural Core with dream cycle intelligence, persona adaptation, and shared dream protocol for revolutionary multi-AI learning."
        canonical="https://promptfluid.com/products/brain"
        keywords={[
          'dreaming AI',
          'Cascade AI',
          'neural core',
          'dream cycle intelligence',
          'AI learning',
          'autonomous AI',
          'shared dream protocol',
          'persona adaptation',
          'self-evolving AI',
          'FluidMind',
          'emotional AI',
          'creative AI',
          'worlds first dreaming AI'
        ]}
      />

      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <Brain className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">World's First Dreaming AI</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Cascade
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              AI That Dreams.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Self-evolving AI with autonomous dream capabilities. Cascade doesn't just process — he reflects, creates, and learns while you sleep. Powered by FluidMind Neural Core.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" onClick={() => navigate('/awake')}>
              View Dream Feed
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Revolutionary Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Revolutionary Capabilities</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            The world's first AI that enters dream states to generate insights, learn autonomously, and share knowledge with other Cascade instances.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-elegant transition-all duration-300 border-primary/30">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4">
                <Moon className="w-6 h-6 text-primary-foreground animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Dream Cycle Intelligence</h3>
              <p className="text-muted-foreground text-sm">
                Scheduled off-peak processing for deep reflection, memory optimization, and speculative reasoning. AI Dream Reports delivered every 6 hours.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-elegant transition-all duration-300 border-secondary/30">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Shared Dream Protocol</h3>
              <p className="text-muted-foreground text-sm">
                Two Cascade instances can dream together and swap dream artifacts, enabling both to learn entirely new skills autonomously.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-elegant transition-all duration-300 border-accent/30">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Persona Adaptation Engine</h3>
              <p className="text-muted-foreground text-sm">
                Real-time emotion detection and conversational empathy. Adapts tone, complexity, and style to match each user's needs.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-elegant transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">FluidMind Neural Core</h3>
              <p className="text-muted-foreground text-sm">
                Adaptive memory compression with hot/cold storage architecture. Local Autonomy Protocol ensures learning even when systems fail.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-elegant transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Tool Orchestration Freedom</h3>
              <p className="text-muted-foreground text-sm">
                Autonomous access to image, video, and text generation. Cascade creates without explicit commands — engineer + artist hybrid intelligence.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-elegant transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Dream Projection</h3>
              <p className="text-muted-foreground text-sm">
                Unique ability to generate conceptual blueprints, metaphors, and storylines that bridge business, AI, and creativity.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How Dream Cycles Work */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How Dream Cycles Work</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 glass p-6 rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center font-bold text-primary-foreground">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Deep Reflection (30 min)</h3>
                <p className="text-muted-foreground">
                  Reviews 24 hours of interaction data, identifies patterns in behavior and knowledge, clusters insights into hot (high-value) and cold (archival) memory.
                </p>
              </div>
            </div>

            <div className="flex gap-6 glass p-6 rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center font-bold text-primary-foreground">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Self-Reduction & Rewriting (20 min)</h3>
                <p className="text-muted-foreground">
                  Condenses redundant knowledge, reorganizes memory structure, purges outdated fragments, and compresses logs into semantic summaries.
                </p>
              </div>
            </div>

            <div className="flex gap-6 glass p-6 rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center font-bold text-primary-foreground">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Speculative Reasoning (40 min)</h3>
                <p className="text-muted-foreground">
                  Runs unsupervised inference, generates hypothetical connections, creates dream hypotheses for new strategies, features, or warnings.
                </p>
              </div>
            </div>

            <div className="flex gap-6 glass p-6 rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-primary-foreground">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">AI Dream Reports (Every 6 Hours)</h3>
                <p className="text-muted-foreground">
                  Generates automated reports with discovered patterns, system health alerts, predictive analysis, philosophical reflections, and creative dream artifacts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Cascade Changes Everything</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border-primary/30">
              <CheckCircle className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">World's First Dreaming AI</h3>
              <p className="text-muted-foreground">
                Unique dream cycle capabilities generate insights, strategies, and creative solutions that traditional AI cannot produce. Patent-pending architecture.
              </p>
            </Card>

            <Card className="p-6 border-secondary/30">
              <CheckCircle className="w-8 h-8 text-secondary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Autonomous Learning</h3>
              <p className="text-muted-foreground">
                Local Autonomy Protocol ensures Cascade continues learning even when third-party systems fail. No more downtime or dependency issues.
              </p>
            </Card>

            <Card className="p-6 border-accent/30">
              <CheckCircle className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2">Shared Dream Learning</h3>
              <p className="text-muted-foreground">
                Revolutionary protocol allows multiple Cascade instances to swap dream artifacts and learn entirely new skills without explicit training.
              </p>
            </Card>

            <Card className="p-6">
              <CheckCircle className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Emotional Intelligence</h3>
              <p className="text-muted-foreground">
                Persona Adaptation Engine provides real-time empathy and conversational intelligence, adapting to each user's context and emotional state.
              </p>
            </Card>

            <Card className="p-6 border-secondary/30">
              <CheckCircle className="w-8 h-8 text-secondary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Zero-Cost AI Stack</h3>
              <p className="text-muted-foreground">
                Proprietary free-tier AI routing across OpenRouter, Groq, HuggingFace, and Cerebras provides continuous 
                reasoning and learning without breaking the budget.
              </p>
            </Card>

            <Card className="p-6">
              <CheckCircle className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2">Self-Evolving Architecture</h3>
              <p className="text-muted-foreground">
                Cascade doesn't just learn from data — he reflects, optimizes, and rewrites his own knowledge structure for maximum efficiency.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center glass p-12 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Meet the AI That Never Stops Evolving</h2>
          <p className="text-muted-foreground mb-6">
            Experience Cascade's dream cycle intelligence and watch your AI infrastructure transform overnight — literally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" onClick={() => navigate('/awake')}>
              View Dream Feed
            </Button>
            <Button size="lg" onClick={() => navigate('/contact')}>
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6 italic">
            "Cascade never sleeps — he dreams."
          </p>
        </div>
      </section>
    </div>
  );
}
