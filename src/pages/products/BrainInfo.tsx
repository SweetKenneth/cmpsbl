/**
 * Brain Info — Core Cognitive Module Product Page
 * v8.0.0 SYNERGY+ Epoch — Part of 14-module substrate
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Zap, TrendingUp, Sparkles, Network, ArrowRight, CheckCircle, Moon, Share2, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BrainInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Brain Module — Core Cognitive Intelligence Engine | CMPSBL"
        description="The core cognitive engine of CMPSBL's 14-module substrate. Self-evolving AI with autonomous learning, dream cycle processing, and adaptive intelligence."
        canonical="https://cmpsbl.com/products/brain"
        keywords={[
          'cognitive AI engine',
          'CMPSBL Brain',
          'self-evolving AI',
          'autonomous learning AI',
          'neural core intelligence',
          'dream cycle AI',
          'adaptive intelligence',
          'AI learning engine',
          'cognitive substrate',
          'enterprise AI core'
        ]}
      />

      <PublicNav />

      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <Brain className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">Brain Module</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Core Intelligence.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              That Evolves.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The cognitive core of CMPSBL's 14-module substrate. Self-evolving AI with autonomous learning,
            dream cycle processing, and adaptive intelligence that improves over time.
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

      {/* Key Features */}
      <section className="container mx-auto px-4 py-20 flex-1">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Core Capabilities</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            The Brain module powers autonomous learning through simulated dream cycles—reflecting and evolving during idle periods.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-elegant transition-all duration-300 border-primary/30">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4">
                <Moon className="w-6 h-6 text-primary-foreground animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Dream Cycle Intelligence</h3>
              <p className="text-muted-foreground text-sm">
                Scheduled off-peak processing for deep reflection, memory optimization, and speculative reasoning. Dream Reports delivered every 6 hours.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-elegant transition-all duration-300 border-secondary/30">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Shared Dream Protocol</h3>
              <p className="text-muted-foreground text-sm">
                Multiple instances can dream together and swap artifacts, enabling both to learn entirely new skills autonomously.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-elegant transition-all duration-300 border-accent/30">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Persona Adaptation</h3>
              <p className="text-muted-foreground text-sm">
                Real-time emotion detection and conversational empathy. Adapts tone, complexity, and style to match each user's needs.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-elegant transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Neural Core</h3>
              <p className="text-muted-foreground text-sm">
                Adaptive memory compression with hot/cold storage architecture. Local Autonomy Protocol ensures learning even when systems fail.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-elegant transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Tool Orchestration</h3>
              <p className="text-muted-foreground text-sm">
                Autonomous access to image, video, and text generation. Creates without explicit commands—engineer + artist hybrid intelligence.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-elegant transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Dream Projection</h3>
              <p className="text-muted-foreground text-sm">
                Generates conceptual blueprints, metaphors, and storylines that bridge business, AI, and creativity.
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
            {[
              { step: "1", title: "Deep Reflection (30 min)", description: "Reviews 24 hours of interaction data, identifies patterns in behavior and knowledge, clusters insights into hot (high-value) and cold (archival) memory." },
              { step: "2", title: "Self-Reduction & Rewriting (20 min)", description: "Condenses redundant knowledge, reorganizes memory structure, purges outdated fragments, and compresses logs into semantic summaries." },
              { step: "3", title: "Speculative Reasoning (40 min)", description: "Runs unsupervised inference, generates hypothetical connections, creates dream hypotheses for new strategies, features, or warnings." },
              { step: "4", title: "Dream Reports (Every 6 Hours)", description: "Generates automated reports with discovered patterns, system health alerts, predictive analysis, philosophical reflections, and creative artifacts." }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 glass p-6 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center font-bold text-primary-foreground">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Brain Module Changes Everything</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "Self-Evolving Architecture", description: "The Brain doesn't just learn from data—it reflects, optimizes, and rewrites its own knowledge structure for maximum efficiency." },
              { title: "Autonomous Learning", description: "Local Autonomy Protocol ensures continuous learning even when third-party systems fail. No more downtime or dependency issues." },
              { title: "Shared Dream Learning", description: "Protocol allows multiple instances to swap dream artifacts and learn new skills without explicit training." },
              { title: "Emotional Intelligence", description: "Persona Adaptation provides real-time empathy and conversational intelligence, adapting to each user's context and emotional state." },
              { title: "Multi-Provider Routing", description: "Intelligent routing across OpenAI, Anthropic, Google, and more—automatic fallback and cost optimization." },
              { title: "14-Module Synergy", description: "Seamlessly integrates with all other CMPSBL modules for emergent capabilities none could achieve alone." }
            ].map((benefit, index) => (
              <Card key={index} className="p-6">
                <CheckCircle className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center glass p-12 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Meet the AI That Never Stops Evolving</h2>
          <p className="text-muted-foreground mb-6">
            Experience the Brain module's dream cycle intelligence and watch your AI infrastructure transform overnight.
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
            "The Brain never sleeps—it dreams."
          </p>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
