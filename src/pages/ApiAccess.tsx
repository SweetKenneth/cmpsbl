/**
 * API Access — Developer API Key Signup & Documentation
 * Includes inline developer key generation form
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { RelatedCapabilities } from "@/components/RelatedCapabilities";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { ArrowRight, Key, Terminal, Code, Zap, Shield, BookOpen, Hammer, Copy, Check, Rocket, Brain, Network, Eye, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const MODULES = [
  { icon: Brain, name: "BRAIN", desc: "Persistent memory — store, recall, search across sessions" },
  { icon: MessageSquare, name: "DECODE", desc: "Intent extraction and conversational AI" },
  { icon: Network, name: "NEXUS", desc: "Multi-provider AI routing with failover" },
  { icon: Shield, name: "DEFENSE", desc: "Threat detection, anomaly isolation, bot filtering" },
  { icon: Eye, name: "VISION", desc: "Observability — health, metrics, distributed traces" },
  { icon: Zap, name: "DREAM", desc: "Autonomous evolution and self-improvement cycles" },
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
        title="API Access — Free Key & Endpoint Docs | CMPSBL"
        description="Get a free CMPSBL API key for persistent memory, NEXUS routing, DEFENSE scans, and DREAM triggers. One unified REST endpoint, rate limiting, usage dashboard, and full SDK documentation."
        canonical="https://cmpsbl.com/api-access"
      />
      <PublicNav />
      <main className="min-h-screen bg-background pt-24 pb-16 relative">
        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-32 left-1/3 w-[400px] h-[400px] rounded-full animate-hero-orb-2" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 60%)" }} />
        </div>

        {/* Hero */}
        <section className="container mx-auto max-w-5xl px-4 text-center mb-16 relative z-10">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
              <Key className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold tracking-widest uppercase">Free API Access</span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
              One key.{" "}
              <span style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Entire substrate.
              </span>
            </h1>
             <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get instant access to 40 nodes through a single REST endpoint. 
              Persistent memory, smart AI routing, security monitoring, and automatic improvement — free to start, no credit card needed.
            </p>
          </motion.div>
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
                      <div>
                        <Input
                          type="text"
                          placeholder="Your name (optional)"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="bg-background/50"
                        />
                      </div>
                      <div>
                        <Input
                          type="email"
                          placeholder="developer@example.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          className="bg-background/50"
                        />
                      </div>
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
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                      <Check className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-1">Your API key is ready</h2>
                      <p className="text-sm text-destructive font-medium">⚠ Save this now — it will not be shown again.</p>
                    </div>
                    <div className="relative">
                      <pre className="p-4 rounded-xl bg-muted/50 border border-border font-mono text-sm text-foreground break-all whitespace-pre-wrap">
                        {generatedKey}
                      </pre>
                      <button
                        onClick={copyKey}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-background/80 border border-border/50 hover:bg-accent transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-foreground mb-2">Quick start:</p>
                      <pre className="p-4 rounded-xl bg-muted/50 border border-border font-mono text-xs text-muted-foreground overflow-x-auto">
{`const res = await fetch('https://api.cmpsbl.com/v1/substrate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${generatedKey}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'brain.query',
    query: 'hello world',
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

        {/* What You Get */}
        <section className="container mx-auto max-w-5xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-10">
             <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">What your key unlocks</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              One API key gives you access to every node through a single endpoint.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.map((mod, i) => (
              <motion.div
                key={mod.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group p-5 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 shimmer-on-hover card-lift"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                  <mod.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{mod.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{mod.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Code Example */}
        <section className="container mx-auto max-w-3xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden glass-edge">
            <div className="px-4 py-3 border-b border-border/30 bg-muted/20 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary/60" />
              <span className="text-sm font-mono text-muted-foreground">Unified API — One Endpoint</span>
            </div>
            <pre className="p-5 text-sm font-mono text-foreground overflow-x-auto">
{`// Every node through one endpoint
const substrate = (action: string, payload: any) =>
  fetch('https://api.cmpsbl.com/v1/substrate', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer cmpsbl_YOUR_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, ...payload }),
  }).then(r => r.json());

// Store a memory
await substrate('brain.remember', {
  content: 'User prefers dark mode',
  tags: ['preference'],
});

// Route to best AI provider
await substrate('nexus.route', {
  prompt: 'Summarize this document',
  budget: 'economy',
});

// Check system health
await substrate('vision.health', {});`}
            </pre>
          </motion.div>
        </section>

        {/* Free tier details */}
        <section className="container mx-auto max-w-4xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Free tier is generous</h2>
            <p className="text-muted-foreground">No credit card. No time limits. Build real products on the free tier.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "60", label: "Requests / min" },
              { value: "1,000", label: "Requests / day" },
              { value: "40", label: "Nodes accessible" },
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

        {/* CTA */}
        <section className="container mx-auto max-w-3xl px-4 text-center relative z-10">
          <motion.div {...fadeUp} className="relative p-8 rounded-2xl border border-border/40 bg-gradient-to-br from-card/40 via-card/30 to-card/40 backdrop-blur-sm glass-edge overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] memory-stream-bar opacity-30" />
            <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight">Need more?</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Upgrade for higher limits, priority NEXUS routing, and enterprise features.
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
        { question: "How do I get a CMPSBL API key?", answer: "Create a free developer account at cmpsbl.com/api-access. API keys are generated instantly with configurable scopes and rate limits." },
        { question: "What are the API rate limits?", answer: "Free tier includes generous rate limits. Higher tiers unlock increased throughput. Enterprise plans offer custom rate limits and dedicated endpoints." },
      ]} />
      <EnhancedFooter />
    </>
  );
}
