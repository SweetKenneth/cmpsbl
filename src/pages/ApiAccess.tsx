/**
 * API Access — Developer API Key Signup & Documentation
 * Includes inline developer key generation form with bold key warning
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { RelatedCapabilities } from "@/components/RelatedCapabilities";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import {
  ArrowRight, Key, Terminal, Copy, Check, Rocket, Brain, Network,
  Eye, Shield, Zap, MessageSquare, Lock, Clock, Layers, BarChart3,
  Globe, FileCode, AlertTriangle, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/api-access-hero.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const PRIMITIVES = [
  { icon: Brain, name: "BRAIN", type: "Organ", desc: "Persistent memory — store, recall, and semantic search across sessions" },
  { icon: MessageSquare, name: "DECODE", type: "Agent", desc: "Intent extraction, NLU processing, and conversational context management" },
  { icon: Network, name: "NEXUS", type: "Organ", desc: "Intelligent routing across AI providers with automatic failover" },
  { icon: Shield, name: "DEFENSE", type: "Layer", desc: "Threat detection, input filtering, and bad-actor blocking" },
  { icon: Eye, name: "VISION", type: "Layer", desc: "System observability, metrics collection, and request tracing" },
  { icon: Zap, name: "EVOLUTION", type: "Layer", desc: "Self-improvement cycles that make the system smarter over time" },
];

const FLOW_STEPS = [
  { step: "01", title: "Register", desc: "Enter your email below — no credit card, no account creation." },
  { step: "02", title: "Receive Key", desc: "Your unique API key is generated instantly and shown once on screen." },
  { step: "03", title: "Call the Gateway", desc: "POST to the unified substrate endpoint with your key as a Bearer token." },
  { step: "04", title: "Ship Product", desc: "Access all 40 primitives through one endpoint — memory, routing, security, and more." },
];

const USE_CASES = [
  { icon: Brain, title: "Agent Memory", desc: "Give AI agents persistent, searchable memory that survives across sessions and deployments." },
  { icon: Globe, title: "Smart Routing", desc: "Automatically route prompts to the best AI provider based on cost, latency, and capability." },
  { icon: Lock, title: "Security Scanning", desc: "Run real-time threat analysis on inputs and outputs with built-in compliance checks." },
  { icon: BarChart3, title: "Usage Analytics", desc: "Track every API call with detailed breakdowns by primitive, cost, and latency." },
  { icon: FileCode, title: "Code Generation", desc: "Generate, analyze, and transform code through the ENCODE primitive with multi-language support." },
  { icon: Layers, title: "Orchestration", desc: "Chain multiple primitives into pipelines — memory retrieval → reasoning → response generation." },
];

export default function ApiAccess() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("developer-signup", {
        body: { email, name },
      });
      if (error) throw error;
      if (data?.apiKey) {
        setGeneratedKey(data.apiKey);
        toast.success("API key generated! Save it now.");
      } else if (data?.keyPrefix) {
        toast.info(data.message || "You already have an active key.");
      } else {
        throw new Error(data?.error || "Signup failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    toast.success("Key copied to clipboard");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <>
      <SEO
        title="API Access — Free Developer Key | CMPSBL"
        description="Get a free CMPSBL API key to access 40 primitives through a single REST endpoint. Persistent memory, intelligent routing, security scanning, and more — no credit card required."
        canonical="https://cmpsbl.com/api-access"
      />
      <PublicNav />
      <main className="min-h-screen bg-background pt-24 pb-16 relative">
        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-32 left-1/3 w-[400px] h-[400px] rounded-full animate-hero-orb-2" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 60%)" }} />
        </div>

        {/* Hero */}
        <section className="container mx-auto max-w-5xl px-4 text-center mb-8 relative z-10">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
              <Key className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold tracking-widest uppercase">Free API Access</span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
              One key. <span className="text-primary">Every primitive.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Access 40 primitives through a single REST endpoint —
              persistent memory, intelligent routing, security monitoring, and self-improvement.
              Free to start, no credit card needed.
            </p>
          </motion.div>
        </section>

        {/* Full-bleed hero image */}
        <section className="w-full mb-20 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full overflow-hidden"
          >
            <img
              src={heroImage}
              alt="CMPSBL substrate — data streams flowing across a digital landscape"
              width={1920}
              height={640}
              className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
              fetchPriority="high"
            />
          </motion.div>
        </section>

        {/* How it works */}
        <section className="container mx-auto max-w-5xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">From zero to API call in minutes</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">No infrastructure. No configuration. Just a key and a POST request.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FLOW_STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative p-5 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm"
              >
                <span className="text-4xl font-black text-primary/15 absolute top-3 right-4 select-none">{s.step}</span>
                <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Signup Form */}
        <section className="container mx-auto max-w-xl px-4 mb-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Card className="border-primary/20 bg-card/80 backdrop-blur-sm glass-edge overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[2px] memory-stream-bar opacity-40" />
              <CardContent className="pt-8 pb-8 px-6 sm:px-8">
                {!generatedKey ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Rocket className="w-7 h-7 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground mb-1">Claim your developer key</h2>
                      <p className="text-sm text-muted-foreground">Enter your email and get instant API access. Free tier: 60 req/min, 1,000 req/day.</p>
                    </div>
                    <form onSubmit={handleSignup} className="space-y-4">
                      <Input
                        type="text"
                        placeholder="Your name (optional)"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="bg-background/50"
                      />
                      <Input
                        type="email"
                        placeholder="developer@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="bg-background/50"
                      />
                      <Button type="submit" className="w-full gap-2 h-12 text-base shadow-lg shadow-primary/20" disabled={loading}>
                        {loading ? (
                          <span className="animate-pulse">Generating…</span>
                        ) : (
                          <>
                            <Key className="w-4 h-4" />
                            Generate Free API Key
                          </>
                        )}
                      </Button>
                    </form>
                    <p className="text-[11px] text-muted-foreground/60 text-center mt-4">
                      No account needed. Your key is emailed for safekeeping and shown once on screen.
                    </p>
                  </>
                ) : (
                  <div className="text-center space-y-5">
                    <div className="w-14 h-14 rounded-2xl bg-neon-green/10 flex items-center justify-center mx-auto">
                      <Check className="w-7 h-7 text-neon-green" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">Your API key is ready</h2>
                      {/* Bold key warning */}
                      <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 mb-2">
                        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                        <p className="text-sm font-bold text-destructive">
                          This key will NOT be shown again. Save it in a secure location now.
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <pre className="p-4 rounded-xl bg-muted/50 border border-border font-mono text-sm text-foreground break-all whitespace-pre-wrap">
                        {generatedKey}
                      </pre>
                      <button
                        onClick={copyKey}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-background/80 border border-border/50 hover:bg-accent transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-foreground mb-2">Quick start:</p>
                      <pre className="p-4 rounded-xl bg-muted/50 border border-border font-mono text-xs text-muted-foreground overflow-x-auto">
{`const res = await fetch('https://api.cmpsbl.com/v1/substrate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'brain.remember',
    content: 'User prefers dark mode',
    tags: ['preference'],
  }),
});`}
                      </pre>
                    </div>
                    <div className="flex gap-3">
                      <Button asChild variant="outline" className="flex-1 text-sm">
                        <Link to="/developers/guide">Developer Guide</Link>
                      </Button>
                      <Button asChild className="flex-1 text-sm">
                        <Link to="/documentation">Full Docs</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* What your key unlocks */}
        <section className="container mx-auto max-w-5xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">What your key unlocks</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              One API key gives you access to every primitive through a single endpoint.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRIMITIVES.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group p-5 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 shimmer-on-hover card-lift"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground">{p.name}</h3>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/20 text-primary/70">{p.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Code Example */}
        <section className="container mx-auto max-w-3xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">One endpoint, every capability</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              All primitives share the same REST gateway. Change the <code className="text-primary font-mono text-sm">action</code> field to talk to any primitive.
            </p>
          </motion.div>
          <motion.div {...fadeUp} className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden glass-edge">
            <div className="px-4 py-3 border-b border-border/30 bg-muted/20 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary/60" />
              <span className="text-sm font-mono text-muted-foreground">Unified Substrate Gateway</span>
            </div>
            <pre className="p-5 text-sm font-mono text-foreground overflow-x-auto">
{`// Helper — every primitive through one endpoint
const substrate = (action: string, payload: any) =>
  fetch('https://api.cmpsbl.com/v1/substrate', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer cmpsbl_YOUR_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, ...payload }),
  }).then(r => r.json());

// Store a memory (BRAIN organ)
await substrate('brain.remember', {
  content: 'User prefers dark mode',
  tags: ['preference'],
});

// Route to best AI provider (NEXUS organ)
await substrate('nexus.route', {
  prompt: 'Summarize this document',
  budget: 'economy',
});

// Run a security scan (DEFENSE layer)
await substrate('defense.scan', {
  input: userMessage,
});`}
            </pre>
          </motion.div>
        </section>

        {/* Use cases */}
        <section className="container mx-auto max-w-5xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">What developers are building</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Real production use cases powered by the CMPSBL substrate.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {USE_CASES.map((uc, i) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="p-5 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/10 transition-all"
              >
                <uc.icon className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-bold text-foreground mb-1">{uc.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Free tier */}
        <section className="container mx-auto max-w-4xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Free tier is generous</h2>
            <p className="text-muted-foreground">No credit card. No time limits. Build real products on the free tier.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "60", label: "Requests / min" },
              { value: "1,000", label: "Requests / day" },
              { value: "40", label: "Primitives accessible" },
              { value: "∞", label: "Time limit" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center p-5 rounded-xl border border-border/40 bg-card/50 shimmer-on-hover card-lift"
              >
                <p className="text-2xl md:text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Authentication details */}
        <section className="container mx-auto max-w-3xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 sm:p-8 glass-edge">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Authentication</h2>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Every request requires a <code className="text-primary font-mono">Bearer</code> token in the <code className="text-primary font-mono">Authorization</code> header.
                Keys are prefixed with <code className="text-primary font-mono">cmpsbl_</code> for easy identification.
              </p>
              <div className="rounded-xl bg-muted/30 border border-border/30 p-4 font-mono text-xs">
                <span className="text-muted-foreground/60">Authorization:</span> <span className="text-foreground">Bearer cmpsbl_sk_live_...</span>
              </div>
              <p>
                Rate limit headers are included in every response: <code className="text-primary font-mono">X-RateLimit-Limit</code>,{" "}
                <code className="text-primary font-mono">X-RateLimit-Remaining</code>, and <code className="text-primary font-mono">X-RateLimit-Reset</code>.
                Exceeding limits returns <code className="text-primary font-mono">429 RATE_LIMITED</code>.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Resources links */}
        <section className="container mx-auto max-w-4xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Resources</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: BookOpen, title: "Documentation", desc: "Full API reference, primitives catalog, and architecture guides.", href: "/documentation" },
              { icon: Terminal, title: "Developers Playground", desc: "Execute live API calls and test primitives in the browser.", href: "/codelab" },
              { icon: Clock, title: "System Status", desc: "Real-time uptime, latency, and primitive health dashboard.", href: "/status" },
            ].map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Link
                  to={r.href}
                  className="block p-5 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all group h-full"
                >
                  <r.icon className="w-5 h-5 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{r.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto max-w-3xl px-4 text-center relative z-10">
          <motion.div {...fadeUp} className="relative p-8 rounded-2xl border border-border/40 bg-gradient-to-br from-card/40 via-card/30 to-card/40 backdrop-blur-sm glass-edge overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] memory-stream-bar opacity-30" />
            <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight">Need more?</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Upgrade for higher rate limits, priority AI routing, dedicated support, and enterprise-grade SLAs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/store?tab=plans">
                  View Plans <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/developers/guide">Developer Guide</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>
      <RelatedCapabilities />
      <PageSEOBlock path="/api-access" title="API Access" faq={[
        { question: "How do I get a CMPSBL API key?", answer: "Enter your email at cmpsbl.com/api-access. API keys are generated instantly — no account creation or credit card required." },
        { question: "What are the API rate limits?", answer: "Free tier includes 60 requests per minute and 1,000 per day across all 40 primitives. Higher tiers unlock increased throughput and priority routing." },
        { question: "Is the API key shown again after generation?", answer: "No. The API key is displayed once on screen and emailed for safekeeping. It cannot be retrieved after you leave the page." },
      ]} />
      <EnhancedFooter />
    </>
  );
}
