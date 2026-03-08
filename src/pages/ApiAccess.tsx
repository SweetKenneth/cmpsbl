/**
 * API Access — Developer API Entry Point
 * Premium design with glass-edge cards, code-glow, gradient accents
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { ArrowRight, Key, Terminal, Code, Zap, Shield, BookOpen, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const features = [
  {
    icon: Key,
    title: "API Keys & Authentication",
    description: "Generate scoped API keys with fine-grained permissions. OAuth2, API keys, and passkey authentication supported.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Terminal,
    title: "RESTful & Streaming APIs",
    description: "Full REST endpoints for every substrate module. Real-time streaming for cognitive operations and event feeds.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Code,
    title: "SDKs & Client Libraries",
    description: "Official SDKs for TypeScript, Python, and Go. Community libraries for Rust, Ruby, and more.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Zap,
    title: "Rate Limits & Quotas",
    description: "Generous free tier with transparent rate limits. Scale to millions of requests with predictable pricing.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description: "All API traffic encrypted in transit. SOC 2 compliant infrastructure with audit logging on every call.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: BookOpen,
    title: "Interactive Documentation",
    description: "Try every endpoint directly in the browser. Auto-generated code samples in your preferred language.",
    gradient: "from-blue-500 to-indigo-600",
  },
];

export default function ApiAccess() {
  return (
    <>
      <SEO
        title="API Access — CMPSBL"
        description="Access the CMPSBL substrate programmatically. RESTful APIs, streaming endpoints, SDKs, and developer tools for building on the cognitive substrate."
      />
      <PublicNav />
      <main className="min-h-screen bg-background pt-24 pb-16 relative">
        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-32 left-1/3 w-[400px] h-[400px] rounded-full animate-hero-orb-2" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 60%)" }} />
        </div>

        {/* Hero */}
        <section className="container mx-auto max-w-5xl px-4 text-center mb-20 relative z-10">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
              <Hammer className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold tracking-widest uppercase">API Access</span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
              Build on the{" "}
              <span style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Substrate
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Programmatic access to every cognitive module. Authenticate, call, and orchestrate — all through a unified API surface.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Link to="/documentation">
                  Read the Docs <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="hover:border-primary/30 transition-colors">
                <Link to="/start-here">Get Started</Link>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto max-w-6xl px-4 mb-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm card-lift shimmer-on-hover glass-edge hover:border-primary/20 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-4 shadow-md`}>
                  <feat.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Code Example */}
        <section className="container mx-auto max-w-3xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden glass-edge">
            <div className="px-4 py-3 border-b border-border/30 bg-muted/20 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary/60" />
              <span className="text-sm font-mono text-muted-foreground">Quick Start</span>
            </div>
            <div className="relative">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
              <pre className="p-5 text-sm font-mono text-foreground overflow-x-auto code-glow">
{`// Call the Substrate REST API directly
const res = await fetch('https://api.cmpsbl.com/v1/substrate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'decode.analyze',
    input: 'Your content here',
    modules: ['sentiment', 'intent', 'entities'],
  }),
});

const { insights } = await res.json();
console.log(insights);`}
              </pre>
            </div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="container mx-auto max-w-3xl px-4 text-center relative z-10">
          <motion.div {...fadeUp} className="relative p-8 rounded-2xl border border-border/40 bg-gradient-to-br from-card/40 via-card/30 to-card/40 backdrop-blur-sm glass-edge overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] memory-stream-bar opacity-30" />
            <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight">Start building today</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Free tier includes 10,000 API calls per month. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Link to="/register">
                  Create Account <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="hover:border-primary/30 transition-colors">
                <Link to="/upgrade">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>
      <EnhancedFooter />
    </>
  );
}
