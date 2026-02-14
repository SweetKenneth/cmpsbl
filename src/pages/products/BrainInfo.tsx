/**
 * Brain Info — Core Cognitive Module Product Page
 * v9.3.0 ARCHITECT Epoch — Part of 21-module substrate
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Zap, TrendingUp, Sparkles, Network, ArrowRight, CheckCircle, Moon, Share2, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

export default function BrainInfo() {
  const navigate = useNavigate();

  const features = [
    { icon: Moon, title: "Dream Cycle Intelligence", description: "Scheduled off-peak processing for deep reflection, memory optimization, and speculative reasoning. Dream Reports delivered every 6 hours.", border: "border-primary/30" },
    { icon: Share2, title: "Shared Dream Protocol", description: "Multiple instances can dream together and swap artifacts, enabling both to learn entirely new skills autonomously.", border: "border-secondary/30" },
    { icon: Heart, title: "Persona Adaptation", description: "Real-time emotion detection and conversational empathy. Adapts tone, complexity, and style to match each user's needs.", border: "border-accent/30" },
    { icon: Brain, title: "Neural Core", description: "Adaptive memory compression with hot/cold storage architecture. Local Autonomy Protocol ensures learning even when systems fail.", border: "" },
    { icon: Sparkles, title: "Tool Orchestration", description: "Autonomous access to image, video, and text generation. Creates without explicit commands—engineer + artist hybrid intelligence.", border: "" },
    { icon: TrendingUp, title: "Dream Projection", description: "Generates conceptual blueprints, metaphors, and storylines that bridge business, AI, and creativity.", border: "" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Brain Module — Core Cognitive Intelligence Engine | CMPSBL"
        description="The core cognitive engine of CMPSBL's 21-module substrate. Self-evolving AI with autonomous learning, dream cycle processing, and adaptive intelligence."
        canonical="https://cmpsbl.com/products/brain"
        keywords={['cognitive AI engine', 'CMPSBL Brain', 'self-evolving AI', 'autonomous learning AI', 'neural core intelligence', 'dream cycle AI', 'adaptive intelligence', 'AI learning engine', 'cognitive substrate', 'enterprise AI core']}
      />

      <PublicNav />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute top-40 left-1/3 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.07) 0%, transparent 60%)" }}
          animate={{ x: [-50, 50, -50], y: [-25, 25, -25] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.05) 0%, transparent 60%)" }}
          animate={{ x: [30, -30, 30], y: [15, -15, 15] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <Brain className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">Brain Module</span>
          </motion.div>
          <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl md:text-6xl font-bold mb-6">
            Core Intelligence.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              That Evolves.
            </span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The cognitive core of CMPSBL's 21-module substrate. Self-evolving AI with autonomous learning,
            dream cycle processing, and adaptive intelligence that improves over time.
          </motion.p>
          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" onClick={() => navigate('/awake')}>
              View Dream Feed
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
              Schedule Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Key Features */}
      <section className="container mx-auto px-4 py-20 flex-1 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.h2 {...fadeUp} className="text-3xl font-bold text-center mb-4">Core Capabilities</motion.h2>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            The Brain module powers autonomous learning through simulated dream cycles—reflecting and evolving during idle periods.
          </motion.p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} {...stagger(index * 0.08)}>
                <Card className={`p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group h-full ${feature.border}`}>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How Dream Cycles Work */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fadeUp} className="text-3xl font-bold text-center mb-12">How Dream Cycles Work</motion.h2>
          
          <div className="space-y-6">
            {[
              { step: "1", title: "Deep Reflection (30 min)", description: "Reviews 24 hours of interaction data, identifies patterns in behavior and knowledge, clusters insights into hot (high-value) and cold (archival) memory." },
              { step: "2", title: "Self-Reduction & Rewriting (20 min)", description: "Condenses redundant knowledge, reorganizes memory structure, purges outdated fragments, and compresses logs into semantic summaries." },
              { step: "3", title: "Speculative Reasoning (40 min)", description: "Runs unsupervised inference, generates hypothetical connections, creates dream hypotheses for new strategies, features, or warnings." },
              { step: "4", title: "Dream Reports (Every 6 Hours)", description: "Generates automated reports with discovered patterns, system health alerts, predictive analysis, philosophical reflections, and creative artifacts." }
            ].map((item, index) => (
              <motion.div key={index} {...stagger(index * 0.1)} className="flex gap-6 glass p-6 rounded-xl hover:border-primary/20 border border-transparent transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center font-bold text-primary-foreground">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.h2 {...fadeUp} className="text-3xl font-bold text-center mb-12">Why Brain Module Changes Everything</motion.h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Self-Evolving Architecture", description: "The Brain doesn't just learn from data—it reflects, optimizes, and rewrites its own knowledge structure for maximum efficiency." },
              { title: "Autonomous Learning", description: "Local Autonomy Protocol ensures continuous learning even when third-party systems fail. No more downtime or dependency issues." },
              { title: "Shared Dream Learning", description: "Protocol allows multiple instances to swap dream artifacts and learn new skills without explicit training." },
              { title: "Emotional Intelligence", description: "Persona Adaptation provides real-time empathy and conversational intelligence, adapting to each user's context and emotional state." },
              { title: "Multi-Provider Routing", description: "Intelligent routing across OpenAI, Anthropic, Google, and more—automatic fallback and cost optimization." },
              { title: "21-Module Synergy", description: "Seamlessly integrates with all other CMPSBL modules for emergent capabilities none could achieve alone." }
            ].map((benefit, index) => (
              <motion.div key={index} {...stagger(index * 0.08)}>
                <Card className="p-6 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 h-full group">
                  <CheckCircle className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center glass p-12 rounded-2xl border border-primary/10">
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
        </motion.div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
