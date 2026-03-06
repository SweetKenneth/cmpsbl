/**
 * Support — Evolving AI Support Bot
 * Premium design with glass-edge, gradient accents, card-lift
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SupportBotPanel } from "@/components/substrate/SupportBotPanel";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, Sparkles, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const FEATURES = [
  { icon: Brain, label: "Memory-Backed" },
  { icon: Shield, label: "Governed Responses" },
  { icon: MessageCircle, label: "Escalation-First" },
];

const RESOURCES = [
  { to: "/documentation", title: "Documentation", desc: "Browse the full documentation library", cta: "View Docs →" },
  { to: "/contact", title: "Contact Us", desc: "Reach our team directly", cta: "Get in Touch →" },
  { to: "/changelog", title: "Evolution Log", desc: "See what's changed recently", cta: "View Changelog →" },
];

export default function Support() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Support — Evolving AI Assistant | CMPSBL"
        description="Get help from the CMPSBL evolving AI support system. Memory-backed, governed assistance that learns from verified resolutions."
        canonical="https://cmpsbl.com/support"
        keywords={['CMPSBL support', 'AI support assistant', 'cognitive support']}
      />

      <PublicNav />

      <main className="flex-1 relative">
        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-32 left-1/3 w-[400px] h-[400px] rounded-full animate-hero-orb-2" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 60%)" }} />
        </div>

        {/* Hero */}
        <section className="relative py-12 sm:py-16 overflow-hidden z-10">
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto mb-10"
            >
              <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-xs font-semibold">Evolving Support System</span>
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
                How can we{" "}
                <span style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  help?
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Our AI support assistant learns from verified resolutions while maintaining
                strict governance. When uncertain, it escalates instead of guessing.
              </p>
            </motion.div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/30 text-sm backdrop-blur-sm shimmer-on-hover">
                  <f.icon className="w-4 h-4 text-primary" />
                  <span className="font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Support Bot */}
        <section className="container mx-auto px-4 pb-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            <SupportBotPanel />
          </div>
        </section>

        {/* Additional Resources */}
        <section className="container mx-auto px-4 pb-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-black mb-6 text-center tracking-tight">Additional Resources</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {RESOURCES.map((r, i) => (
                <motion.div
                  key={r.to}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link to={r.to} className="block h-full">
                    <div className="h-full p-5 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm card-lift glass-edge group">
                      <h3 className="font-bold text-foreground mb-1">{r.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{r.desc}</p>
                      <span className="text-primary text-sm font-medium group-hover:underline">{r.cta}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </div>
  );
}
