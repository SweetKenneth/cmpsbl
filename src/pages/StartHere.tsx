/**
 * Start Here — Onboarding Landing Page
 * SPARTA Epoch — Polished with motion and premium styling
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { ArrowRight, Sparkles, Layers, Brain, Code, Zap, BookOpen, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const stagger = (delay: number) => ({
  initial: { opacity: 0, y: 15 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, delay },
});

export default function StartHere() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Start Here | Clockless — Build Self-Improving Software"
        description="New to CMPSBL? Start here. Learn how to build with composable artifacts, persistent memory, and self-improving pipelines — all on the free tier."
        canonical="https://cmpsbl.com/start-here"
        keywords={['CMPSBL getting started', 'start here', 'onboarding', 'composable artifacts', 'persistent memory']}
      />
      <PublicNav />

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 60%)" }}
          animate={{ x: [-30, 30, -30], y: [-15, 15, -15] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <main className="flex-1 relative z-10">
        <div className="container mx-auto px-4 py-20 sm:py-28 max-w-4xl">
          {/* Badge */}
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/5 text-primary gap-1.5 px-4 py-1.5">
              <Sparkles className="w-3 h-3" />
              <span className="text-xs font-semibold">New to Clockless?</span>
            </Badge>
          </motion.div>

          {/* H1 */}
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1]"
            {...stagger(0.1)}
          >
            Start{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Here
            </span>
          </motion.h1>

          {/* Body */}
          <div className="space-y-8">
            <motion.p {...stagger(0.15)} className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              CMPSBL is a composable software substrate for building systems that learn, evolve, and improve while running.
            </motion.p>
            <motion.p {...stagger(0.2)} className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              If you're new, this page helps you get oriented and build something real quickly — no demos, no lockout.
            </motion.p>

            {/* What you can do */}
            <motion.div 
              {...stagger(0.25)}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              <div className="h-1 w-full bg-gradient-to-r from-primary via-violet-500 to-primary" />
              <div className="p-6 sm:p-8 space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">What you can do immediately</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: Sparkles, text: "Browse the Composable Artifacts store" },
                    { icon: Code, text: "Build with real templates and capabilities" },
                    { icon: Brain, text: "Use persistent memory in live systems" },
                    { icon: Zap, text: "Compose and run pipelines" },
                    { icon: BookOpen, text: "Explore documentation and research artifacts" },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.text}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + idx * 0.06 }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm sm:text-base text-foreground/80 font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.p {...stagger(0.35)} className="text-foreground font-semibold text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Free users are first-class builders here.
            </motion.p>

            {/* Next Steps */}
            <motion.div {...stagger(0.4)} className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild size="lg" className="rounded-xl font-bold gap-2 px-8 h-13 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all">
                <Link to="/store">
                  <Sparkles className="w-4 h-4" />
                  Explore the Artifact Store
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl font-semibold gap-2 px-8 h-13">
                <Link to="/pricing">
                  <Layers className="w-4 h-4" />
                  View Pricing & Tiers
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Footer Note */}
          <motion.div 
            {...stagger(0.5)}
            className="mt-16 pt-8 border-t border-border/30"
          >
            <p className="text-sm text-muted-foreground italic">
              Self-improving software works in CMPSBL because of the architecture, not a single feature.
            </p>
          </motion.div>
        </div>
      </main>
      <EnhancedFooter />
    </div>
  );
}
