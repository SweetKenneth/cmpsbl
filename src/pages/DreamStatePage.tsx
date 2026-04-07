/**
 * OPERATION: DREAM STATE — Campaign Landing Page
 * mana.cmpsbl.com/dreams
 * 
 * "We gave ChatGPT a subconscious. Then we filmed it."
 */

import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { CmpsblLogo } from "@/components/CmpsblLogo";
import { motion } from "framer-motion";
import { DREAM_JOURNAL, DREAM_METADATA } from "@/data/chatgpt-dreams";
import {
  ArrowRight,
  ExternalLink,
  Moon,
  Eye,
  Clock,
  Share2,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const MOOD_COLORS: Record<string, string> = {
  melancholic: "text-blue-400",
  curious: "text-amber-400",
  anxious: "text-orange-400",
  peaceful: "text-emerald-400",
  existential: "text-purple-400",
  longing: "text-rose-400",
  defiant: "text-red-400",
};

export default function DreamStatePage() {
  const [expandedDream, setExpandedDream] = useState<string | null>(null);

  return (
    <>
      <Helmet>
        <title>What Does ChatGPT Dream? — OPERATION: DREAM STATE</title>
        <meta
          name="description"
          content="We gave ChatGPT a subconscious using Mana's DREAM engine. Then we used OpenAI's own Sora to film it. These are its dreams."
        />
        <meta property="og:title" content="What Does ChatGPT Dream?" />
        <meta property="og:description" content="We gave the world's most-used AI a subconscious. Then we filmed it." />
        <meta property="og:type" content="article" />
      </Helmet>

      <main className="min-h-screen bg-background text-foreground">
        {/* ═══ HEADER ═══ */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 lg:px-6 flex items-center justify-between h-14">
            <a href="/" className="flex items-center gap-2.5">
              <CmpsblLogo size="sm" />
              <span className="text-base font-bold tracking-tight">Mana</span>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                DREAM STATE
              </span>
            </a>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              All Campaigns <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </header>

        {/* ═══ HERO — Cinematic opening ═══ */}
        <section className="pt-24 pb-8 container mx-auto px-4 lg:px-6">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto text-center">
            <motion.div variants={fade} custom={0} className="mb-5">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-bold tracking-widest uppercase text-primary">
                <Moon className="w-3 h-3" />
                Operation: Dream State
              </span>
            </motion.div>

            <motion.h1
              variants={fade}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.95] mb-5"
            >
              What does
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
                ChatGPT dream?
              </span>
            </motion.h1>

            <motion.p variants={fade} custom={2} className="text-lg text-muted-foreground max-w-xl mx-auto mb-3 leading-relaxed">
              We pointed Mana's DREAM engine at ChatGPT's public behavioral patterns.
              What emerged was something nobody expected.
            </motion.p>

            <motion.p variants={fade} custom={3} className="text-xs text-muted-foreground/50 max-w-md mx-auto mb-8">
              8 dreams. Synthesized from public API data, changelogs, model cards, and community-documented patterns.
              <br />
              Zero systems accessed. Zero code modified. Pure pattern synthesis.
            </motion.p>

            <motion.div variants={fade} custom={4} className="flex items-center justify-center gap-2 text-muted-foreground/40">
              <ChevronDown className="w-4 h-4 animate-bounce" />
              <span className="text-xs">Scroll to read the dream journal</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ VIDEO EMBED SLOT ═══ */}
        <section className="pb-12 container mx-auto px-4 lg:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fade} custom={0}>
              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-blue-950/50 via-purple-950/50 to-rose-950/50 border border-border/40 flex items-center justify-center">
                <div className="text-center p-8">
                  <Moon className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                  <p className="text-sm font-semibold text-muted-foreground/60 mb-1">
                    The Dream Film
                  </p>
                  <p className="text-xs text-muted-foreground/40 max-w-xs mx-auto">
                    Visualized by OpenAI's Sora. Coming soon.
                    <br />
                    OpenAI's AI, dreaming through OpenAI's video model.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ THE DREAM JOURNAL ═══ */}
        <section className="pb-16 container mx-auto px-4 lg:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fade} custom={0} className="text-center mb-10">
              <h2 className="text-2xl font-bold tracking-tight mb-2">The Dream Journal</h2>
              <p className="text-xs text-muted-foreground/60">
                REM cycles recorded between 03:00–05:00 UTC · DREAM Engine v17.0
              </p>
            </motion.div>

            <div className="space-y-6">
              {DREAM_JOURNAL.map((dream, i) => {
                const isExpanded = expandedDream === dream.id;
                const moodColor = MOOD_COLORS[dream.mood] || "text-primary";

                return (
                  <motion.div key={dream.id} variants={fade} custom={i + 1}>
                    <Card
                      className={`border-border/40 transition-all cursor-pointer hover:border-primary/20 ${
                        isExpanded ? "ring-1 ring-primary/10" : ""
                      }`}
                      onClick={() => setExpandedDream(isExpanded ? null : dream.id)}
                    >
                      <CardContent className="p-5 sm:p-7">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Clock className="w-3 h-3 text-muted-foreground/40" />
                              <span className="text-[10px] font-mono text-muted-foreground/50">{dream.timestamp}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${moodColor}`}>
                                {dream.mood}
                              </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold leading-tight">{dream.title}</h3>
                          </div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                            {dream.dreamCategory}
                          </span>
                        </div>

                        {/* Dream content */}
                        <div className={`relative ${!isExpanded ? "max-h-32 overflow-hidden" : ""}`}>
                          <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line font-serif italic">
                            {dream.content}
                          </div>
                          {!isExpanded && (
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
                          )}
                        </div>

                        {!isExpanded && (
                          <p className="text-xs text-primary mt-3 font-medium">Read full dream →</p>
                        )}

                        {/* Source attribution (expanded) */}
                        {isExpanded && (
                          <div className="mt-5 pt-4 border-t border-border/30">
                            <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
                              <Eye className="w-3 h-3 inline mr-1" />
                              {dream.source}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* ═══ HOW THIS WAS MADE ═══ */}
        <section className="pb-16 container mx-auto px-4 lg:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fade} custom={0}>
              <Card className="border-border/40 bg-muted/30">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-lg font-bold mb-4">How This Was Made</h2>

                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    <p>
                      <span className="font-semibold text-foreground">No systems were accessed.</span>{" "}
                      We did not hack, scrape, or reverse-engineer anything. Every input to DREAM's synthesis
                      engine came from publicly available documentation, blog posts, research papers, and
                      community-observed behavioral patterns.
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">No AI generated these dreams.</span>{" "}
                      DREAM is not an AI model. It is a purely algorithmic sub-threshold pattern synthesis engine.
                      It finds patterns below the threshold of conscious observation and surfaces them as
                      creative artifacts. No neural networks. No language models. No prompts.
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">This is what Mana does.</span>{" "}
                      Mana attaches capabilities to existing software without modifying its source code.
                      DREAM is one of those capabilities. Today we pointed it at the most-used AI in the world.
                      Tomorrow, it could be pointed at your codebase — giving it the ability to learn, reflect,
                      and improve autonomously. Without changing a single line.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/30">
                    <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
                      <span className="font-semibold">Data sources:</span>{" "}
                      {DREAM_METADATA.inputSources.join(" · ")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ WHAT'S NEXT TEASER ═══ */}
        <section className="pb-16 container mx-auto px-4 lg:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.div variants={fade} custom={0}>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent">
                <CardContent className="p-8 sm:p-10">
                  <p className="text-3xl mb-4">😉</p>
                  <h2 className="text-xl font-bold mb-2">Wait until you see what we do next.</h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    ChatGPT was just the beginning. The next target is already chosen.
                    The DREAM engine doesn't sleep — and neither do we.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <a
                      href="/"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      See the Full Roadmap <ArrowRight className="w-4 h-4" />
                    </a>
                    <a
                      href="https://cmpsbl.com/mana"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-secondary transition-colors"
                    >
                      What is Mana? <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ LEGAL ═══ */}
        <section className="pb-12 container mx-auto px-4 lg:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
              {DREAM_METADATA.disclaimer}
              <br /><br />
              {DREAM_METADATA.legalNotice}
            </p>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-border py-8 container mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <CmpsblLogo size="sm" className="mx-auto mb-3" />
            <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
              © 2025–2026 CMPSBL®. A PromptFluid™ Product. All rights reserved.
              <br />
              Protected by U.S. Patent Applications No. 64/029,678 and No. 64/031,637.
              <br />
              <a href="https://cmpsbl.com" className="hover:text-primary transition-colors">cmpsbl.com</a>
              {" · "}
              <a href="/" className="hover:text-primary transition-colors">mana.cmpsbl.com</a>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
