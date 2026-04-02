/**
 * Agent Power-Up Landing Page
 * "Stop rebuilding your agent. We'll wrap it."
 * Dark theme, single email capture, first export free.
 */

import { useState, useCallback } from "react";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Zap, 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  Terminal,
  Wrench,
  Brain,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const BENEFITS = [
  {
    icon: Wrench,
    title: "Diagnostic Scan",
    description: "ENCODE + ORACLE + ENGINEER scan your agent for vulnerabilities and untapped capabilities.",
  },
  {
    icon: Brain,
    title: "Up to 20 Primitives",
    description: "We recommend the optimal set. You choose which ones to run. Your agent, your call.",
  },
  {
    icon: Shield,
    title: "Hardened Output",
    description: "Circuit breakers. Defense shielding. Graceful degradation. Production-grade in one pass.",
  },
  {
    icon: Lock,
    title: "Sealed & Protected",
    description: "CJPI certificate. Structural fingerprint. IP obfuscation. Yours forever.",
  },
] as const;

const BEFORE_AFTER = [
  { before: "No error recovery", after: "Circuit breaker + graceful degradation" },
  { before: "Single-point failures", after: "DEFENSE Layer shielding" },
  { before: "No health monitoring", after: "BEACON health signals" },
  { before: "Unprotected IP", after: "Sealed Mini-Runtime™" },
  { before: "Manual testing", after: "@cmpsbl/test-harness auto-generated" },
] as const;

export default function AgentPowerUp() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;

    setSubmitting(true);
    try {
      await supabase.from("analytics_events").insert({
        event_type: "agent_powerup_signup",
        category: "acquisition",
        label: email.trim(),
        page: "/agent-power-up",
      });
      setSubmitted(true);
    } catch {
      // Still show success — the email capture is the priority
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }, [email, submitting]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Agent Power-Up | CMPSBL® — Wrap Your Agent in Production Armor"
        description="Stop rebuilding your agent. Upload it. We scan, harden, and return it with up to 20 cognitive primitives. First export free. Three-day test drive."
        canonical="https://cmpsbl.com/agent-power-up"
        keywords={['agent hardening', 'AI agent', 'code restoration', 'cognitive primitives', 'agent governance']}
      />

      <PublicNav />

      {/* Hero */}
      <section className="relative px-3 sm:px-6 pt-28 sm:pt-36 pb-16 sm:pb-24">
        {/* Dark ambient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div
            className="absolute -top-48 left-1/4 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 50%)" }}
          />
          <div
            className="absolute -bottom-48 right-1/4 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.05) 0%, transparent 50%)" }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-8">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-xs font-bold text-primary tracking-wide">First Export Free</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground mb-5 leading-[1.05]">
            Stop rebuilding{" "}
            <span className="bg-clip-text text-transparent" style={{
              backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
            }}>
              your agent.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-4">
            We'll wrap it.
          </p>
          <p className="text-sm text-muted-foreground/70 max-w-xl mx-auto mb-10 leading-relaxed">
            Upload your agent. Our three-primitive scan team (ENCODE + ORACLE + ENGINEER) finds every vulnerability and untapped capability. Then we run up to 20 primitives against it. Nothing is rewritten. Everything is hardened.
          </p>

          {/* Email capture */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl bg-card/40 border-border/50 text-sm"
              />
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="h-12 px-8 rounded-xl font-bold gap-2"
              >
                {submitting ? "Submitting..." : "Get Early Access"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary/10 border border-primary/20 max-w-md mx-auto">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">
                You're on the list. We'll reach out when it's your turn.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="relative z-10 px-3 sm:px-6 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-center text-foreground mb-12">
            What happens to your agent
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFITS.map((benefit, idx) => {
              const BIcon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="rounded-xl border border-border/40 bg-card/20 p-5 hover:border-primary/30 transition-all duration-300 animate-fade-in opacity-0"
                  style={{ animationDelay: `${idx * 0.08}s`, animationFillMode: "both" }}
                >
                  <BIcon className="w-6 h-6 text-primary mb-3" />
                  <h3 className="text-sm font-bold text-foreground mb-1.5">{benefit.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="relative z-10 px-3 sm:px-6 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-center text-foreground mb-10">
            Before & After
          </h2>
          <div className="space-y-3">
            {BEFORE_AFTER.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-lg border border-border/30 bg-card/20 p-4 animate-fade-in opacity-0"
                style={{ animationDelay: `${idx * 0.06}s`, animationFillMode: "both" }}
              >
                <div className="flex-1 text-right">
                  <span className="text-xs text-destructive/80 line-through font-medium">{item.before}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1">
                  <span className="text-xs text-primary font-semibold">{item.after}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLI teaser */}
      <section className="relative z-10 px-3 sm:px-6 py-16 sm:py-24">
        <div className="max-w-lg mx-auto text-center">
          <Terminal className="w-8 h-8 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4 font-mono">
            npx @cmpsbl/cli scan ./my-agent --diagnose
          </p>
          <p className="text-xs text-muted-foreground/50">
            Free diagnostic. No account required. See what the factory finds.
          </p>
        </div>
      </section>
      <EnhancedFooter />
    </div>
  );
}
