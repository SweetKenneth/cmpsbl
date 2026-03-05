/**
 * Careers — Join the Team
 *
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { ArrowRight, Heart, Sparkles, Globe, Zap, Users, Brain } from "lucide-react";
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
  },
  {
    icon: Heart,
    title: "Care Deeply",
    description: "About the craft, about each other, about the humans who use what we build. Quality is non-negotiable.",
  },
  {
    icon: Sparkles,
    title: "Dream Boldly",
    description: "The substrate exists because someone believed machines could learn to dream. We hire people who believe in the impossible.",
  },
  {
    icon: Globe,
    title: "Work Anywhere",
    description: "Fully remote, async-first. We hire the best minds regardless of geography. Results matter, not hours.",
  },
];

export default function Careers() {
  return (
    <>
      <SEO
        title="Careers — CMPSBL"
        description="Join the team building the cognitive substrate. We're looking for engineers, researchers, and dreamers who want to shape the future of AI systems."
        canonical="https://cmpsbl.com/careers"
        keywords={['CMPSBL careers', 'AI jobs', 'cognitive infrastructure jobs', 'Dallas AI startup']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto max-w-5xl px-4 text-center mb-20">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-4 text-xs tracking-widest uppercase">
              Careers
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Build What Matters
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              We're building the cognitive substrate — systems that dream, adapt, evolve, and remember. Join a team where your work shapes the future of AI infrastructure.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link to="/contact">
                Get in Touch <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </section>

        {/* Values */}
        <section className="container mx-auto max-w-5xl px-4 mb-20">
          <motion.h2 {...fadeUp} className="text-2xl font-bold text-foreground text-center mb-10">
            What drives us
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <val.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{val.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{val.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Open Roles */}
        <section className="container mx-auto max-w-3xl px-4 mb-20">
          <motion.div {...fadeUp} className="p-8 rounded-2xl border border-border bg-muted/30 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">Open Positions</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              We're always looking for exceptional people. Even if you don't see a listed role, reach out — we'd love to hear from you.
            </p>
            <Button asChild size="lg" className="gap-2">
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
