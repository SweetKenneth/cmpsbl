/**
 * Try It — Developer-first conversion page.
 * Leads with code, proves value with live demo, converts with clear next steps.
 */
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { TryItChat } from "@/components/demo/TryItChat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Copy,
  Check,
  Terminal,
  Package,
  Clock,
  Zap,
  Brain,
  Shield,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

/* ─── Code snippets ─── */
const INSTALL_CMD = "npm install @cmpsbl/sdk";

const CODE_SNIPPET = `import { withPersistentMemory } from '@cmpsbl/sdk';

const agent = withPersistentMemory({
  agentId: 'my-agent',
  scope: 'project',
});

// Your agent now remembers everything
const ctx = await agent.getContext(userMessage);`;

const REACT_SNIPPET = `import { usePersistentAgent } from '@cmpsbl/sdk';

function Chat() {
  const { respond, isLoading } = usePersistentAgent('my-agent');

  const onSend = async (msg: string) => {
    const ctx = await respond(msg);
    // ctx.memories, ctx.confidence — it just works
  };
}`;

/* ─── Copy button component ─── */
function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-md",
        "text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
        className
      )}
      aria-label="Copy to clipboard"
    >
      {copied ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ─── Code block component ─── */
function CodeBlock({
  code,
  label,
  delay = 0,
}: {
  code: string;
  label: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-muted/20">
        <span className="text-[11px] font-mono text-muted-foreground">{label}</span>
        <CopyButton text={code} />
      </div>
      <pre className="p-4 overflow-x-auto text-[12px] sm:text-[13px] leading-relaxed font-mono text-foreground/90">
        <code>{code}</code>
      </pre>
    </motion.div>
  );
}

/* ─── Value props ─── */
const VALUE_PROPS = [
  {
    icon: Clock,
    title: "5 minutes to integrate",
    desc: "npm install, wrap your agent, done. No rewrites.",
  },
  {
    icon: Brain,
    title: "Memory that persists",
    desc: "4-tier automatic lifecycle. Hot → Warm → Cold → Purge.",
  },
  {
    icon: Zap,
    title: "NEXUS routing included",
    desc: "Auto-selects the optimal AI provider per query. No lock-in.",
  },
  {
    icon: Shield,
    title: "Works with everything",
    desc: "Node.js, React, Python, REST. Drop into any stack.",
  },
];

export default function TryIt() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Try CMPSBL — Add Memory to Any AI Agent in 3 Lines"
        description="npm install @cmpsbl/sdk. Wrap your agent. Done. Persistent memory, intelligent routing, zero lock-in. Try the live demo — no signup required."
        keywords={[
          "AI agent memory",
          "persistent memory SDK",
          "CMPSBL SDK",
          "AI memory management",
          "agent orchestration",
        ]}
      />
      <PublicNav />

      <main className="container mx-auto max-w-5xl px-4 pt-28 sm:pt-32 pb-20">
        {/* ─── Hero: Code first ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge
            variant="outline"
            className="mb-4 gap-1.5 border-neon-green/30 bg-neon-green/5 px-4 py-1.5"
          >
            <Package className="w-3 h-3 text-neon-green" />
            <span className="text-xs font-semibold text-neon-green">Live on npm</span>
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3">
            Add memory to any AI agent.
            <br />
            <span className="text-primary">3 lines of code.</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-6">
            Your agents forget everything between sessions. Fix that in 5 minutes.
            <br className="hidden sm:block" />
            No framework. No rewrite. Just memory that works.
          </p>

          {/* Install command — prominent */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-primary/20 bg-primary/5 mb-4"
          >
            <Terminal className="w-4 h-4 text-primary shrink-0" />
            <code className="text-sm sm:text-base font-mono font-bold text-foreground">
              {INSTALL_CMD}
            </code>
            <CopyButton text={INSTALL_CMD} />
          </motion.div>
        </motion.div>

        {/* ─── Code examples side by side ─── */}
        <div className="grid md:grid-cols-2 gap-4 mb-16">
          <CodeBlock code={CODE_SNIPPET} label="Node.js / Bun / Deno" delay={0.2} />
          <CodeBlock code={REACT_SNIPPET} label="React / Next.js / Vite" delay={0.3} />
        </div>

        {/* ─── Value props ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {VALUE_PROPS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-4 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm"
            >
              <Icon className="w-5 h-5 text-primary mb-2" />
              <h3 className="text-sm font-bold mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </motion.div>

        {/* ─── Live demo section ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Don't take our word for it — try it live
            </h2>
            <p className="text-sm text-muted-foreground">
              No signup. No API key. Tell it your name, then ask it to remember.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <TryItChat className="w-full" />
          </div>
        </motion.div>

        {/* ─── Social proof / npm stats ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-16 py-8 border-y border-border/20"
        >
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">11</p>
              <p className="text-xs text-muted-foreground mt-1">npm packages</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">25</p>
              <p className="text-xs text-muted-foreground mt-1">languages supported</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">40</p>
              <p className="text-xs text-muted-foreground mt-1">cognitive primitives</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-primary">0</p>
              <p className="text-xs text-muted-foreground mt-1">external AI calls</p>
            </div>
          </div>
        </motion.div>

        {/* ─── CTA ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="text-center"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Ready to build?</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Start with Persistent Memory — free. Scale to the full substrate when you need it.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="gap-2 min-h-[48px] text-sm">
              <Link to="/documentation">
                Read the Docs <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 min-h-[48px] text-sm">
              <a
                href="https://www.npmjs.com/org/cmpsbl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Package className="w-4 h-4" />
                View on npm
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 min-h-[48px] text-sm">
              <Link to="/store">
                Browse the Store
              </Link>
            </Button>
          </div>
        </motion.div>
      </main>

      <PageSEOBlock
        path="/try"
        title="Try CMPSBL — Persistent Memory for AI Agents"
        faq={[
          {
            question: "How do I add persistent memory to my AI agent?",
            answer:
              "Install @cmpsbl/sdk via npm, wrap your agent with withPersistentMemory(), and your agent automatically remembers context across sessions. Three lines of code, no framework required.",
          },
          {
            question: "Can I try CMPSBL without signing up?",
            answer:
              "Yes. The live demo on this page lets you chat with the substrate and see persistent memory in action — zero signup, zero API key required.",
          },
          {
            question: "What languages does CMPSBL support?",
            answer:
              "CMPSBL supports 25 languages including JavaScript, TypeScript, Python, Rust, Go, Java, and 7 hardware description languages via the Ascension Engine.",
          },
          {
            question: "Does CMPSBL require external AI API calls?",
            answer:
              "No. The substrate's core engines (Ascension, DREAM, Memory Stream) use zero external AI calls. NEXUS routing is optional and routes to your own configured providers.",
          },
        ]}
      />
      <EnhancedFooter />
    </div>
  );
}
