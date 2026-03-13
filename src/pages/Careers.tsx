/**
 * Careers — Join the Team
 * Premium design with glass-edge cards, gradient accents, and section-ordinal patterns
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { ArrowRight, Heart, Sparkles, Globe, Zap, Users, Brain, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const values = [
  {
    icon: Brain,
    title: "Think in Systems",
    description: "We build cognitive architecture, not features. Every contribution shapes how machines understand the world.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Heart,
    title: "Care Deeply",
    description: "About the craft, about each other, about the humans who use what we build. Quality is non-negotiable.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: Sparkles,
    title: "Dream Boldly",
    description: "The substrate exists because someone believed machines could learn to dream. We hire people who believe in the impossible.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Globe,
    title: "Work Anywhere",
    description: "Fully remote, async-first. We hire the best minds regardless of geography. Results matter, not hours.",
    gradient: "from-cyan-500 to-blue-600",
  },
];

export default function Careers() {
  return (
    <>
      <SEO
        title="Careers — Join the CMPSBL Collective"
        description="We're hiring engineers, researchers, and system architects to build CMPSBL's 40-node cognitive substrate. Remote-first from Dallas, TX. Shape persistent memory, DREAM cycles, and governed AI."
        canonical="https://cmpsbl.com/careers"
        keywords={['CMPSBL careers', 'AI jobs', 'cognitive infrastructure jobs', 'Dallas AI startup']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background pt-24 pb-16 relative">
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-40 left-1/4 w-[400px] h-[400px] rounded-full animate-hero-orb-2" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 60%)" }} />
          <div className="absolute bottom-40 right-1/4 w-[300px] h-[300px] rounded-full animate-hero-orb-3" style={{ background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.04) 0%, transparent 60%)" }} />
        </div>

        {/* Hero */}
        <section className="container mx-auto max-w-5xl px-4 text-center mb-20 relative z-10">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
              <Hammer className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold tracking-widest uppercase">Careers</span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
              Build What{" "}
              <span style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Matters
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              We're building the cognitive substrate — systems that dream, adapt, evolve, and remember. Join a team where your work shapes the future of AI infrastructure.
            </p>
            <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <Link to="/contact">
                Get in Touch <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </section>

        {/* Values */}
        <section className="container mx-auto max-w-5xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              What Drives Us
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group relative p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden card-lift shimmer-on-hover glass-edge"
              >
                {/* Top accent */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${val.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${val.gradient} flex items-center justify-center mb-4 shadow-md`}>
                  <val.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{val.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{val.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Perks */}
        <section className="container mx-auto max-w-5xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Why CMPSBL</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: "🌍", label: "Fully Remote" },
              { emoji: "⏰", label: "Async-First" },
              { emoji: "🧠", label: "AI Stipend" },
              { emoji: "📚", label: "Learning Budget" },
              { emoji: "🏖️", label: "Unlimited PTO" },
              { emoji: "💰", label: "Equity Options" },
              { emoji: "🛡️", label: "Full Benefits" },
              { emoji: "🚀", label: "Ship Daily" },
            ].map((perk, i) => (
              <motion.div
                key={perk.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="p-4 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm text-center hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 glass-edge"
              >
                <span className="text-2xl mb-2 block">{perk.emoji}</span>
                <span className="text-xs font-semibold text-foreground">{perk.label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Open Roles */}
        <section className="container mx-auto max-w-3xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="relative p-8 rounded-2xl border border-border/40 bg-gradient-to-br from-card/40 via-card/30 to-card/40 backdrop-blur-sm text-center overflow-hidden glass-edge">
            <div className="absolute inset-x-0 top-0 h-[2px] memory-stream-bar opacity-30" />
            <Users className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-black text-foreground mb-3 tracking-tight">Open Positions</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
              We're always looking for exceptional people. Even if you don't see a listed role, reach out — we'd love to hear from you.
            </p>
            <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <Link to="/contact">
                Send Us Your Story <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </section>
      </main>
      <EnhancedFooter />
    </>
  );
}
