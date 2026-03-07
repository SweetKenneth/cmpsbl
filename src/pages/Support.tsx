/**
 * Support — Redesigned with bot as centerpiece, searchable FAQs, and human escalation
 */

import { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SupportBotPanel } from "@/components/substrate/SupportBotPanel";
import { StructuredData } from "@/components/seo/StructuredData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Brain,
  Shield,
  Sparkles,
  MessageCircle,
  Search,
  Mail,
  Clock,
  ArrowUpCircle,
  HelpCircle,
  Zap,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// ── FAQ Data (sourced from canonical docs) ──────────────────────
const FAQ_ITEMS = [
  {
    category: "General",
    question: "What is CMPSBL?",
    answer:
      "CMPSBL® (Composable) is a cognitive infrastructure layer for AI applications. It provides memory, learning, multi-provider AI routing, security, and self-evolution capabilities — the operating system for AI.",
  },
  {
    category: "General",
    question: "How is this different from OpenAI or Anthropic?",
    answer:
      "We don't compete with AI model providers — we make them more valuable. CMPSBL sits between your application and AI providers, adding memory, learning, security, and routing. You can use any AI provider (or multiple) through CMPSBL.",
  },
  {
    category: "General",
    question: "Do I need to use a specific AI provider?",
    answer:
      "No. CMPSBL is model-agnostic and provider-agnostic. You can use OpenAI, Anthropic, Google AI, Mistral, open-source models, or any combination.",
  },
  {
    category: "General",
    question: "Can the system really improve itself?",
    answer:
      "Yes. The MODERNIZER module proposes code improvements, which go through confidence gating and (for significant changes) human approval before being applied.",
  },
  {
    category: "Technical",
    question: "What technology stack does CMPSBL use?",
    answer:
      "Frontend: React + TypeScript + Vite + Tailwind. Backend: PostgreSQL + Edge Functions. AI: Model-agnostic, connects to any provider. Infrastructure: Runs on any cloud or on-premise.",
  },
  {
    category: "Technical",
    question: "How does memory work?",
    answer:
      "Memory is stored in a four-tier system: Hot (127 records, 7 days), Warm (2,000 records, 30 days), Cold (200 records, forever), Legacy (unlimited, forever). The system automatically demotes, compresses, and optimizes memory over time. Protected memory types are locked at 1.0 value with zero decay.",
  },
  {
    category: "Business",
    question: "How much does it cost?",
    answer:
      "Free ($0) — Artifact Store, Persistent Memory, Composition. Creator ($9/mo) — Expanded store, executable capabilities, synergy pipelines. Architect ($19/mo) — Cross-module orchestration, larger memory. Enterprise ($99/mo) — Organization workspaces, governance, SLA. Plus standalone: Composable Cognitives ($39 each), Template Generator ($29 one-time).",
  },
  {
    category: "Comparison",
    question: "How is this different from LangChain?",
    answer:
      "LangChain is a library — you build memory, security, and orchestration yourself. CMPSBL is infrastructure with built-in multi-tier memory, autonomous learning, built-in security, and self-improving evolution out of the box.",
  },
  {
    category: "Security",
    question: "Is CMPSBL secure for enterprise use?",
    answer:
      "Yes. Security is built into the core: rate limiting, bot detection, input sanitization, passwordless WebAuthn authentication, complete audit logging, and compliance-ready patterns (SOC 2, GDPR).",
  },
];

const FAQ_CATEGORIES = [...new Set(FAQ_ITEMS.map((i) => i.category))];

const QUICK_LINKS = [
  { to: "/documentation", icon: BookOpen, label: "Documentation", desc: "Browse the full docs library" },
  { to: "/changelog", icon: Sparkles, label: "Evolution Log", desc: "Recent changes & updates" },
  { to: "/contact", icon: Mail, label: "Contact", desc: "Reach our team directly" },
];

export default function Support() {
  const [faqSearch, setFaqSearch] = useState("");

  const filteredFaqs = useMemo(() => {
    if (!faqSearch.trim()) return FAQ_ITEMS;
    const q = faqSearch.toLowerCase();
    return FAQ_ITEMS.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [faqSearch]);

  const groupedFaqs = useMemo(() => {
    const groups: Record<string, typeof FAQ_ITEMS> = {};
    for (const faq of filteredFaqs) {
      if (!groups[faq.category]) groups[faq.category] = [];
      groups[faq.category].push(faq);
    }
    return groups;
  }, [filteredFaqs]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Support — AI Assistant & FAQ | CMPSBL"
        description="Get help from the CMPSBL evolving AI support system or browse our FAQ. Memory-backed, governed assistance that escalates to humans when needed."
        canonical="https://cmpsbl.com/support"
        keywords={["CMPSBL support", "AI support assistant", "cognitive support", "FAQ"]}
      />
      <StructuredData
        type="faq"
        data={{ items: FAQ_ITEMS.map((f) => ({ question: f.question, answer: f.answer })) }}
      />

      <PublicNav />

      <main className="flex-1 relative">
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute top-32 left-1/3 w-[400px] h-[400px] rounded-full animate-hero-orb-2"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 60%)",
            }}
          />
          <div
            className="absolute bottom-20 right-1/4 w-[300px] h-[300px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.04) 0%, transparent 60%)",
            }}
          />
        </div>

        {/* ── Hero ── */}
        <section className="relative py-10 sm:py-14 overflow-hidden z-10">
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto mb-8"
            >
              <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-xs font-semibold">Evolving Support System</span>
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
                How can we{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  help?
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Start with our AI support bot below — it learns from verified resolutions and
                escalates to a human when it can't help. You can also search our FAQ or reach us directly.
              </p>
            </motion.div>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {[
                { icon: Brain, label: "Memory-Backed" },
                { icon: Shield, label: "Governed Responses" },
                { icon: MessageCircle, label: "Escalation-First" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/30 text-sm backdrop-blur-sm shimmer-on-hover"
                >
                  <f.icon className="w-4 h-4 text-primary" />
                  <span className="font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Support Bot (Centerpiece) ── */}
        <section className="container mx-auto px-4 pb-10 relative z-10">
          <div className="max-w-4xl mx-auto">
            <SupportBotPanel />
          </div>
        </section>

        {/* ── Human Escalation Banner ── */}
        <section className="container mx-auto px-4 pb-10 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 sm:p-8 glass-edge"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ArrowUpCircle className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-black tracking-tight mb-1">Need a Human?</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    If the support bot can't resolve your issue, choose{" "}
                    <span className="font-semibold text-foreground">"Escalate to Human"</span>{" "}
                    in the chat — or email us directly. We'll get back to you within{" "}
                    <span className="font-semibold text-foreground">48 hours</span>.
                  </p>
                </div>
                <a
                  href="mailto:support@cmpsbl.com"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  <Mail className="w-4 h-4" />
                  support@cmpsbl.com
                </a>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Average response time: under 48 hours · All escalations are reviewed by our team
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Searchable FAQ ── */}
        <section className="container mx-auto px-4 pb-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Frequently Asked Questions</h2>
                  <p className="text-sm text-muted-foreground">Search or browse common questions about CMPSBL</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Search FAQs — e.g. 'memory', 'pricing', 'security'..."
                  className="pl-10 bg-card/50 border-border/40 backdrop-blur-sm"
                />
              </div>

              {/* FAQ Accordion grouped by category */}
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No matching questions found</p>
                  <p className="text-sm mt-1">Try a different search term or ask the support bot above</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedFaqs).map(([category, items]) => (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs font-semibold border-primary/20 text-primary">
                          {category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{items.length} question{items.length !== 1 ? "s" : ""}</span>
                      </div>
                      <Accordion type="single" collapsible className="w-full">
                        {items.map((faq, idx) => (
                          <AccordionItem
                            key={`${category}-${idx}`}
                            value={`${category}-${idx}`}
                            className="border-border/30"
                          >
                            <AccordionTrigger className="text-left text-sm sm:text-base font-semibold hover:text-primary transition-colors py-4">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-4">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── Quick Links ── */}
        <section className="container mx-auto px-4 pb-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Separator className="mb-10 border-border/30" />
            <div className="grid sm:grid-cols-3 gap-4">
              {QUICK_LINKS.map((r, i) => (
                <motion.div
                  key={r.to}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link to={r.to} className="block h-full">
                    <div className="h-full p-5 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm card-lift glass-edge group">
                      <r.icon className="w-5 h-5 text-primary mb-3" />
                      <h3 className="font-bold text-foreground mb-1">{r.label}</h3>
                      <p className="text-sm text-muted-foreground">{r.desc}</p>
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
