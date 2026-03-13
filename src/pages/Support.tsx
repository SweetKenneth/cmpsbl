/**
 * Support — Professional FAQ help center with DECODE integration
 * No standalone chatbot — "Chat with Support" opens DECODE in support mode
 */

import { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { StructuredData } from "@/components/seo/StructuredData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Mail,
  Clock,
  ArrowUpCircle,
  HelpCircle,
  BookOpen,
  Sparkles,
  MessageCircle,
  Rocket,
  Layers,
  Package,
  Monitor,
  KeyRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useDecodeStore } from "@/stores/decodeStore";

// ── Expanded FAQ Data ──────────────────────────────────────────
const FAQ_ITEMS = [
  // Getting Started
  {
    category: "Getting Started",
    question: "What is CMPSBL?",
    answer: "CMPSBL® (Composable) is a cognitive infrastructure layer for AI applications. It provides persistent memory, autonomous learning, multi-provider AI routing through NEXUS, security via the DEFENSE system, and self-evolution — the operating system for AI.",
  },
  {
    category: "Getting Started",
    question: "How do I get started?",
    answer: "Sign up for a free Builder account. From the dashboard, you can explore the systems, create your first Memory Pack, and connect your AI provider keys through the NEXUS router. DECODE — our conversational interface — is available on every page to guide you.",
  },
  {
    category: "Getting Started",
    question: "Do I need to use a specific AI provider?",
    answer: "No. CMPSBL is model-agnostic and provider-agnostic. The NEXUS router supports OpenAI, Anthropic, Google AI, Mistral, open-source models, or any combination — with automatic failover and cost optimization.",
  },
  {
    category: "Getting Started",
    question: "What is DECODE?",
    answer: "DECODE is the unified conversational interface for CMPSBL. It handles support, system guidance, builder assistance, and governance — all through natural language. You can reach DECODE from anywhere in the platform by clicking the chat icon.",
  },

  // Memories & Foundry
  {
    category: "Memories & Foundry",
    question: "What are Memory Packs?",
    answer: "Memory Packs are composable execution bundles — 24 total, managed through a slot activation system. Each pack contains pre-configured capability chains that connect substrate systems for specific workflows like content generation, data enrichment, or monitoring.",
  },
  {
    category: "Memories & Foundry",
    question: "What is the Foundry?",
    answer: "The Foundry is where you explore the Memory Stream — the substrate's continuous discovery output. It surfaces the highest-scoring crystallized memories and lets you store and export them.",
  },
  {
    category: "Memories & Foundry",
    question: "How does the Memory Stream work?",
    answer: "The Memory Stream continuously forms scored memories. Each day you can crystallize a limited number of discoveries depending on your plan: Builder (3), Studio (6), Creator (9), Architect (12). After crystallization, you choose to Keep (store in vault) or Discard each memory. Vault capacity is tier-based: Builder (5), Studio (25), Creator (75), Architect (unlimited). Rare discoveries (Relic, Mythic, Apex) trigger special messaging, and Mythic discoveries prompt vault upgrade if full.",
  },
  {
    category: "Memories & Foundry",
    question: "What is CLM (Constant Learning Mode)?",
    answer: "CLM is the autonomous background learning engine that runs on 30-minute cycles. It uses a 70/30 weighting between global topics (system stability) and node-specific topics, achieving up to 14,400 AI calls per day for continuous knowledge acquisition.",
  },

  // Capability Packs
  {
    category: "Capability Packs",
    question: "What are Composable Cognitives?",
    answer: "Composable Cognitives are self-contained AI agents ($39 standalone) delivered as sealed runtimes. Each comes with 3–5 Apex Discovery powers, universal DREAM synthesis for autonomous improvement, and portable 4-tier memory. They can be deployed independently or within agencies.",
  },
  {
    category: "Capability Packs",
    question: "What are Engines?",
    answer: "Engines are the 20 specialized processing nodes in the substrate — each handling specific domains like content generation, data analysis, or security scanning. They run as sealed runtimes with built-in capability gating and tier-based access.",
  },
  {
    category: "Capability Packs",
    question: "Can I create custom capability packs?",
    answer: "Yes. The Capability Store allows you to compose custom memory packs, configure capability chains, and define execution templates. All packs are namespaced to your account with hard isolation from other users.",
  },

  // Exports
  {
    category: "Exports",
    question: "Can I export my work as software?",
    answer: "Yes. Memory Packs and configured capabilities can be exported as standalone execution bundles. The distribution system includes export filters that protect proprietary orchestration logic while delivering functional sealed runtimes.",
  },
  {
    category: "Exports",
    question: "Is there hardware export support?",
    answer: "Hardware export is on the roadmap. Currently, all substrate capabilities run in cloud infrastructure. Contact us at support@cmpsbl.com for enterprise deployment requirements including on-premise options.",
  },

  // Account & Access
  {
    category: "Account & Access",
    question: "What subscription tiers are available?",
    answer: "Builder (Free) — Full runtime, 3 memory slots, persistent memory. Studio ($29/mo) — 6 slots, expanded vault, priority routing. Creator ($49/mo) — 9 slots, export capabilities, advanced memory. Architect ($79/mo) — 12 slots, unlimited vault, custom memories, SLA.",
  },
  {
    category: "Account & Access",
    question: "How do I upgrade my account?",
    answer: "Navigate to your Dashboard → Settings → Subscription. You can upgrade, downgrade, or manage your plan at any time. Changes take effect immediately with prorated billing.",
  },
  {
    category: "Account & Access",
    question: "Is CMPSBL secure for enterprise use?",
    answer: "Yes. Security is built into the core via the DEFENSE system: rate limiting, bot detection, device fingerprinting, input sanitization, WebAuthn authentication, complete audit logging, and compliance-ready patterns (SOC 2, GDPR). All fingerprint signals are hashed client-side.",
  },
  {
    category: "Account & Access",
    question: "How do I contact human support?",
    answer: "You can ask DECODE to escalate your issue, or email support@cmpsbl.com directly. Average response time is under 48 hours. All escalations are reviewed by our team.",
  },
];

const CATEGORY_ICONS: Record<string, typeof Rocket> = {
  "Getting Started": Rocket,
  "Memories & Foundry": Layers,
  "Capability Packs": Package,
  "Exports": Monitor,
  "Account & Access": KeyRound,
};

const QUICK_LINKS = [
  { to: "/documentation", icon: BookOpen, label: "Documentation", desc: "Browse the full docs library" },
  { to: "/changelog", icon: Sparkles, label: "Evolution Log", desc: "Recent changes & updates" },
  { to: "/contact", icon: Mail, label: "Contact", desc: "Reach our team directly" },
];

export default function Support() {
  const [faqSearch, setFaqSearch] = useState("");
  const { open } = useDecodeStore();

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

  const handleChatWithSupport = () => {
    open('support');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Support — FAQ, Docs & Live AI Chat | CMPSBL"
        description="Get help with CMPSBL: searchable FAQ, full substrate documentation, and live chat with DECODE — the cognitive interface. Troubleshoot memory, routing, DREAM cycles, and API issues instantly."
        canonical="https://cmpsbl.com/support"
        keywords={["CMPSBL support", "help center", "FAQ", "DECODE support"]}
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
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 60%)" }}
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
                <HelpCircle className="w-3 h-3 text-primary" />
                <span className="text-xs font-semibold">Help Center</span>
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
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-6">
                Browse our FAQ below or chat directly with DECODE — the cognitive interface that can answer questions, troubleshoot issues, and escalate to our team when needed.
              </p>

              {/* Chat with Support CTA */}
              <Button
                onClick={handleChatWithSupport}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold px-8 py-6 text-base rounded-xl shadow-glow hover:scale-105 transition-transform"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat with Support
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ── Searchable FAQ ── */}
        <section className="container mx-auto px-4 pb-10 relative z-10">
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
                  placeholder="Search FAQs — e.g. 'memory', 'pricing', 'packs'..."
                  className="pl-10 bg-card/50 border-border/40 backdrop-blur-sm"
                />
              </div>

              {/* FAQ Accordion grouped by category */}
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-7 h-7 opacity-40" />
                  </div>
                  <p className="font-semibold text-foreground mb-1">No matching questions found</p>
                  <p className="text-sm">
                    Try a different search term or{" "}
                    <button onClick={handleChatWithSupport} className="text-primary hover:underline font-semibold">
                      ask DECODE
                    </button>
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedFaqs).map(([category, items]) => {
                    const CategoryIcon = CATEGORY_ICONS[category] || HelpCircle;
                    return (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-3">
                          <CategoryIcon className="w-4 h-4 text-primary" />
                          <Badge variant="outline" className="text-xs font-semibold border-primary/20 text-primary">
                            {category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {items.length} question{items.length !== 1 ? "s" : ""}
                          </span>
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
                    );
                  })}
                </div>
              )}
            </motion.div>
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
                    DECODE can handle most questions, but if you need a human — just ask DECODE to escalate, or email us directly. We respond within{" "}
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
                  Average response time: under 48 hours · All escalations reviewed by our team
                </span>
              </div>
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
