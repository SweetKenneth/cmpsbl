/**
 * API Access — Developer API Entry Point
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { ArrowRight, Key, Terminal, Code, Zap, Shield, BookOpen } from "lucide-react";
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
  },
  {
    icon: Terminal,
    title: "RESTful & Streaming APIs",
    description: "Full REST endpoints for every substrate module. Real-time streaming for cognitive operations and event feeds.",
  },
  {
    icon: Code,
    title: "SDKs & Client Libraries",
    description: "Official SDKs for TypeScript, Python, and Go. Community libraries for Rust, Ruby, and more.",
  },
  {
    icon: Zap,
    title: "Rate Limits & Quotas",
    description: "Generous free tier with transparent rate limits. Scale to millions of requests with predictable pricing.",
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description: "All API traffic encrypted in transit. SOC 2 compliant infrastructure with audit logging on every call.",
  },
  {
    icon: BookOpen,
    title: "Interactive Documentation",
    description: "Try every endpoint directly in the browser. Auto-generated code samples in your preferred language.",
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
      <main className="min-h-screen bg-background pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto max-w-5xl px-4 text-center mb-20">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-4 text-xs tracking-widest uppercase">
              API Access
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Build on the Substrate
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Programmatic access to every cognitive module. Authenticate, call, and orchestrate — all through a unified API surface.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/documentation">
                  Read the Docs <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/start-here">Get Started</Link>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto max-w-6xl px-4 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feat.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Code Example */}
        <section className="container mx-auto max-w-3xl px-4 mb-20">
          <motion.div {...fadeUp} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-mono text-muted-foreground">Quick Start</span>
            </div>
            <pre className="p-4 text-sm font-mono text-foreground overflow-x-auto">
{`// Install the SDK
npm install @cmpsbl/sdk

// Initialize and call
import { Substrate } from '@cmpsbl/sdk';

const substrate = new Substrate({ apiKey: 'your-key' });
const result = await substrate.decode.analyze({
  input: 'Your content here',
  modules: ['sentiment', 'intent', 'entities']
});

console.log(result.insights);`}
            </pre>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="container mx-auto max-w-3xl px-4 text-center">
          <motion.div {...fadeUp} className="p-8 rounded-2xl border border-border bg-muted/30">
            <h2 className="text-2xl font-bold text-foreground mb-3">Start building today</h2>
            <p className="text-muted-foreground mb-6">
              Free tier includes 10,000 API calls per month. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/register">
                  Create Account <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
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
