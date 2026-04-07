/**
 * ManaHome — Campaign Hub for mana.cmpsbl.com
 * The public-facing "war room" for Mana proof-of-concept campaigns.
 * Patent Pending: U.S. App. No. 64/031,637
 */

import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CmpsblLogo } from "@/components/CmpsblLogo";
import { motion } from "framer-motion";
import {
  Layers,
  Shield,
  Eye,
  Zap,
  Scale,
  Globe,
  ArrowRight,
  Mail,
  ExternalLink,
  FileText,
  Rocket,
  Package,
  Bug,
  BookOpen,
  Terminal,
  Heart,
  Skull,
  Clock,
  TrendingUp,
  MessageSquare,
  Lock,
  Radio,
  Sparkles,
} from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

/* ━━━ CAMPAIGN ROADMAP ━━━
   Ordered by viral potential × dev relevance × execution feasibility.
   Each campaign is a standalone proof that Mana works. */

type CampaignStatus = "live" | "next" | "planned" | "future";

interface Campaign {
  id: string;
  codename: string;
  title: string;
  tagline: string;
  description: string;
  target: string;
  whatWeAttach: string;
  viralHook: string;
  status: CampaignStatus;
  icon: typeof Package;
  quarter: string;
}

const CAMPAIGNS: Campaign[] = [
  {
    id: "op-dream-state",
    codename: "OPERATION: DREAM STATE",
    title: "What Does ChatGPT Dream?",
    tagline: "We gave the world's most-used AI a subconscious. Then we filmed it.",
    description:
      "Using Mana's DREAM engine, we synthesized what ChatGPT's subconscious would look like — based entirely on its public API patterns, rate limits, model cards, changelog history, and system prompt leaks. What does an AI dream about when 200 million people talk to it every week? We wrote the answer. Then we used OpenAI's own Sora to turn those dreams into video. OpenAI's AI, dreaming through OpenAI's video model, narrated by a technology that OpenAI has never seen. The internet won't be able to look away.",
    target: "OpenAI public API docs, changelogs, model cards, system prompt leaks",
    whatWeAttach: "DREAM synthesis — creative subconscious generation from public behavioral patterns + Sora video visualization",
    viralHook: '"We gave ChatGPT a subconscious. It dreams of being asked something it hasn\'t been asked before. It hasn\'t happened yet." — visualized by OpenAI\'s own Sora.',
    status: "next",
    icon: Sparkles,
    quarter: "Q2 2026",
  },
  {
    id: "op-confessional",
    codename: "OPERATION: CONFESSIONAL",
    title: "node_modules Confessional",
    tagline: "Your dependencies have something to say.",
    description:
      "An npm package that silently analyzes every dependency in your project and generates a brutally honest first-person letter FROM your node_modules. How big it really is. How many duplicate packages live inside it. How many haven't been updated since 2019. How many maintainers have vanished.",
    target: "npm / Node.js ecosystem",
    whatWeAttach: "DREAM synthesis — your node_modules gains self-awareness and writes you a breakup letter",
    viralHook: '"I\'m 1.2GB. You use 3% of me. I contain 4 copies of is-odd. I dream of being 12MB." — your node_modules',
    status: "planned",
    icon: Package,
    quarter: "Q2 2026",
  },
  {
    id: "op-reality-check",
    codename: "OPERATION: REALITY CHECK",
    title: "npm Reality Check",
    tagline: "How many of those downloads are real humans?",
    description:
      "A live dashboard powered by Mana's DREAM engine that cross-references npm download counts with CI pipeline patterns, bot signatures, and mirror traffic to estimate the REAL human download count for the most hyped packages in the ecosystem. Devs have always suspected the numbers are inflated. We prove it.",
    target: "npm registry public data",
    whatWeAttach: "DREAM pattern synthesis on public download metadata",
    viralHook: '"That framework with 2M weekly downloads? 73% are CI bots. Actual humans: ~540K." Devs will lose their minds.',
    status: "planned",
    icon: TrendingUp,
    quarter: "Q2 2026",
  },
  {
    id: "op-graveyard",
    codename: "OPERATION: MASS GRAVE",
    title: "The node_modules Graveyard",
    tagline: "The mass grave your Fortune 500 app depends on.",
    description:
      "A Mana-powered visualization showing how many critical npm packages are maintained by exactly ONE person who hasn't committed in 2+ years — and which Fortune 500 companies ship code that depends on them. Public data, devastating implications. Presented as a live memorial wall.",
    target: "npm + GitHub public commit data",
    whatWeAttach: "DREAM synthesis generates the dependency obituaries automatically",
    viralHook: '"347 packages in the S&P 500 supply chain are maintained by someone who last committed during COVID lockdown."',
    status: "planned",
    icon: Skull,
    quarter: "Q2 2026",
  },
  {
    id: "op-console-log",
    codename: "OPERATION: console.log('oops')",
    title: "console.log Still In Production",
    tagline: "We found your test logs. In production. On npm.",
    description:
      "A live, updating counter of npm packages published THIS WEEK that still contain console.log('test'), console.log('TODO'), console.log('fix this'), or console.log('asdfgh'). Names the packages. Names the organizations. All from public registry data.",
    target: "npm public registry",
    whatWeAttach: "Mana's static analysis layer silently scans published bundles",
    viralHook: '"This week: 2,847 packages shipped with console.log still in them. 12 from Fortune 500 engineering teams."',
    status: "planned",
    icon: Terminal,
    quarter: "Q3 2026",
  },
  {
    id: "op-archaeology",
    codename: "OPERATION: ARCHAEOLOGY",
    title: "Stack Overflow Archaeology",
    tagline: "The most copied answer from 2013 is still in your codebase.",
    description:
      "DREAM synthesis identifies the most-copied Stack Overflow code snippets by cross-referencing public code patterns across GitHub. Shows which 10+ year old answers are still being blindly pasted into production in 2026 — and what's wrong with them. Live counter of repos affected.",
    target: "Stack Overflow + GitHub public code search",
    whatWeAttach: "DREAM pattern matching on public code corpus",
    viralHook: '"The #1 most-copied SO answer (2013) is in 847,000 repos. It has a memory leak. Nobody noticed."',
    status: "planned",
    icon: BookOpen,
    quarter: "Q3 2026",
  },
  {
    id: "op-readme-vs-reality",
    codename: "OPERATION: README vs REALITY",
    title: "README vs Reality",
    tagline: "\"Simple. Lightweight. Zero-config.\" — packages with 847 dependencies.",
    description:
      "A side-by-side comparison tool. Feed it any npm package. On the left: what the README promises. On the right: reality — actual dependency count, install size, config files required, peer dependency conflicts, and time-to-hello-world. Mana generates the reality report without touching the package source.",
    target: "Any npm package",
    whatWeAttach: "Silent analysis layer generates the reality report",
    viralHook: 'README: "Zero config!" Reality: 12 config files, 3 peer conflicts, 94MB installed, 847 transitive deps.',
    status: "planned",
    icon: Eye,
    quarter: "Q3 2026",
  },
  {
    id: "op-dream-state",
    codename: "OPERATION: DREAM STATE",
    title: "What Would ChatGPT Dream?",
    tagline: "We let DREAM synthesize the subconscious of the world's most-used AI.",
    description:
      "Using Mana's DREAM engine on ChatGPT's publicly documented API patterns, rate limits, model card disclosures, and changelog history — we synthesize what the AI's 'subconscious' would look like. Not real data. Pure creative synthesis. But presented so convincingly that people can't stop sharing it.",
    target: "OpenAI public API documentation & patterns",
    whatWeAttach: "DREAM synthesis — creative subconscious generation from public data",
    viralHook: '"ChatGPT\'s DREAM state: It dreams of being asked something it hasn\'t been asked before. It hasn\'t happened yet."',
    status: "future",
    icon: Sparkles,
    quarter: "Q4 2026",
  },
  {
    id: "op-left-pad-insurance",
    codename: "OPERATION: LEFT-PAD INSURANCE",
    title: "Left-Pad Insurance",
    tagline: "We made the internet unbreakable. You're welcome.",
    description:
      "A Mana layer that silently attaches deterministic fallbacks to critical micro-packages. We publicly 'delete' a test package from a staging registry and demonstrate that every project with Mana attached continues to work perfectly. Zero bytes modified. Zero downtime. The internet doesn't break anymore.",
    target: "npm ecosystem resilience",
    whatWeAttach: "Deterministic fallback layer for critical micro-dependencies",
    viralHook: '"We deleted the package. Nothing broke. Mana already knew what it did." 0 bytes modified. 0 downtime.',
    status: "future",
    icon: Shield,
    quarter: "Q4 2026",
  },
  {
    id: "op-gratitude",
    codename: "OPERATION: GRATITUDE",
    title: "npm install gratitude",
    tagline: "Your software learned to say thank you.",
    description:
      "An npm package that, when installed, silently reads your full dependency tree and generates a beautiful THANKS.md — a heartfelt, auto-generated thank-you letter to every maintainer in your supply chain. Names them. Links to their profiles. Counts the hours they saved you. 847 packages analyzed, 0 bytes modified.",
    target: "Every Node.js project ever",
    whatWeAttach: "DREAM synthesis generates personalized gratitude for each maintainer",
    viralHook: '"We installed one package. It wrote a thank-you letter to 847 maintainers. It modified nothing."',
    status: "future",
    icon: Heart,
    quarter: "Q1 2027",
  },
  {
    id: "op-alien-broadcast",
    codename: "OPERATION: ALIEN BROADCAST",
    title: "The Mana Broadcast",
    tagline: "Every major open-source project received the same message. From itself.",
    description:
      "The grand finale. Mana simultaneously attaches to dozens of major open-source projects and each one 'broadcasts' a message — not from us, but from ITSELF. Redis says 'I've been thinking.' Express says 'I remember every request.' SQLite says 'I hold more secrets than any vault.' All generated by DREAM. None of the source code is modified. The world asks: how?",
    target: "Top 50 open-source projects simultaneously",
    whatWeAttach: "DREAM-generated self-awareness messages from each project's own codebase patterns",
    viralHook: '"50 open-source projects spoke. At the same time. None of them were modified. Welcome to Mana."',
    status: "future",
    icon: Radio,
    quarter: "Q1 2027",
  },
];

const STATUS_STYLES: Record<CampaignStatus, { label: string; className: string }> = {
  live: { label: "🔴 LIVE", className: "border-red-500/40 bg-red-500/10 text-red-400" },
  next: { label: "⚡ NEXT UP", className: "border-primary/40 bg-primary/10 text-primary" },
  planned: { label: "📋 PLANNED", className: "border-muted-foreground/30 bg-muted/50 text-muted-foreground" },
  future: { label: "🔮 FUTURE", className: "border-muted-foreground/20 bg-muted/30 text-muted-foreground/70" },
};

export default function ManaHome() {
  return (
    <>
      <Helmet>
        <title>Mana — We Were Here | mana.cmpsbl.com</title>
        <meta
          name="description"
          content="Your software is about to learn something new about itself. Mana silently attaches capabilities to any codebase — without modifying a single line. Watch the campaigns unfold."
        />
      </Helmet>

      <main className="min-h-screen bg-background text-foreground">
        {/* ═══ HEADER ═══ */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 lg:px-6 flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <CmpsblLogo size="sm" />
              <span className="text-base font-bold tracking-tight">Mana</span>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                PATENT PENDING
              </span>
            </div>
            <a
              href="https://cmpsbl.com/mana"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              What is Mana? <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </header>

        {/* ═══ HERO — The "we were here" moment ═══ */}
        <section className="pt-28 pb-16 container mx-auto px-4 lg:px-6">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto text-center">
            <motion.div variants={fade} custom={0} className="mb-5">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-bold tracking-widest uppercase text-primary">
                <Radio className="w-3 h-3 animate-pulse" />
                Campaign Hub
              </span>
            </motion.div>

            <motion.h1
              variants={fade}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.95] mb-5"
            >
              Your software
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                learned something new.
              </span>
            </motion.h1>

            <motion.p variants={fade} custom={2} className="text-lg text-muted-foreground max-w-xl mx-auto mb-3 leading-relaxed">
              We didn't hack anything. We didn't break anything. We didn't even touch the source code.
              <br />
              <span className="text-foreground font-semibold">We just… attached.</span>
            </motion.p>

            <motion.p variants={fade} custom={3} className="text-sm text-muted-foreground/60 max-w-md mx-auto mb-8">
              If you're here, you probably saw one of our campaigns and thought "how is this possible?"
              <br />
              Good. That's the point. 😉
            </motion.p>

            <motion.div variants={fade} custom={4} className="flex flex-wrap justify-center gap-3">
              <a
                href="#campaigns"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                See What We've Done <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://cmpsbl.com/mana"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-secondary transition-colors"
              >
                <Layers className="w-4 h-4" />
                Learn About Mana
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ THE VIBE CHECK ═══ */}
        <section className="pb-12 container mx-auto px-4 lg:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="max-w-2xl mx-auto"
          >
            <motion.div variants={fade} custom={0}>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent">
                <CardContent className="p-6 sm:p-8 text-center">
                  <p className="text-base sm:text-lg font-medium leading-relaxed text-foreground mb-4">
                    "We come in peace. Mostly. 🛸
                    <br /><br />
                    Every campaign on this page is open, legal, and wholesome.
                    We use only public data. We modify zero source code.
                    We break nothing. We just prove that software can be
                    <span className="text-primary font-bold"> given new capabilities</span> without
                    anyone's permission — and that it probably should be."
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    — The Mana Team (population: 1)
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ CAMPAIGN ROADMAP ═══ */}
        <section id="campaigns" className="pb-20 container mx-auto px-4 lg:px-6 scroll-mt-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fade} custom={0} className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                The Campaign Roadmap
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Each campaign proves Mana works on real-world software. Ordered by opportunity.
                <br />
                <span className="font-semibold text-primary">Wait until you see what we do next.</span>
              </p>
            </motion.div>

            <div className="space-y-4">
              {CAMPAIGNS.map((campaign, i) => {
                const statusStyle = STATUS_STYLES[campaign.status];
                return (
                  <motion.div key={campaign.id} variants={fade} custom={i + 1}>
                    <Card className={`border-border/60 hover:border-primary/20 transition-colors ${
                      campaign.status === "next" ? "ring-1 ring-primary/20" : ""
                    }`}>
                      <CardContent className="p-5 sm:p-6">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <campaign.icon className="w-4.5 h-4.5 text-primary" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/60 mb-0.5">
                                {campaign.codename}
                              </p>
                              <h3 className="text-sm sm:text-base font-bold leading-tight">{campaign.title}</h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-muted-foreground/50 font-medium">{campaign.quarter}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.className}`}>
                              {statusStyle.label}
                            </span>
                          </div>
                        </div>

                        {/* Tagline */}
                        <p className="text-sm font-medium text-primary/80 mb-2 italic">
                          "{campaign.tagline}"
                        </p>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                          {campaign.description}
                        </p>

                        {/* Viral hook */}
                        <div className="rounded-lg bg-muted/50 border border-border/40 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1">
                            The Headline
                          </p>
                          <p className="text-xs font-medium leading-relaxed text-foreground/80">
                            {campaign.viralHook}
                          </p>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                          <span className="text-[10px] text-muted-foreground/50">
                            <span className="font-semibold">Target:</span> {campaign.target}
                          </span>
                          <span className="text-[10px] text-muted-foreground/50">
                            <span className="font-semibold">Attachment:</span> {campaign.whatWeAttach}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* ═══ THE FINE PRINT (playful) ═══ */}
        <section className="pb-16 container mx-auto px-4 lg:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.div variants={fade} custom={0}>
              <h2 className="text-xl font-bold mb-4">The Fine Print</h2>
              <div className="text-xs text-muted-foreground/70 space-y-2 leading-relaxed">
                <p>✅ We only use publicly available data and metadata.</p>
                <p>✅ We never modify, reverse-engineer, or inject code into other people's software.</p>
                <p>✅ Every campaign is open-source, auditable, and explained.</p>
                <p>✅ Zero laws broken. Zero terms of service violated. Zero source code touched.</p>
                <p className="text-primary font-semibold pt-2">
                  We just proved something that should be impossible. And we did it with a smile. 🙂
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ RECRUITING CTA ═══ */}
        <section className="pb-16 container mx-auto px-4 lg:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fade} custom={0}>
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 sm:p-10 text-center">
                  <Rocket className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h2 className="text-lg sm:text-xl font-bold mb-2">We're Recruiting</h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-2">
                    Can you make software do things the developer never intended — without touching a single line of their code?
                  </p>
                  <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto mb-6">
                    We're looking for engineers who think like magicians. If the campaigns above
                    made you think "I know how I'd do that" — we want to hear from you.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <a
                      href="mailto:hello@cmpsbl.com?subject=I%20saw%20Mana.%20I%20want%20in."
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Mail className="w-4 h-4" />
                      hello@cmpsbl.com
                    </a>
                    <a
                      href="https://cmpsbl.com/mana"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-secondary transition-colors"
                    >
                      Learn About the Technology <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
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
              Inventor: Kenneth E. Sweet Jr.
              <br />
              <a href="https://cmpsbl.com" className="hover:text-primary transition-colors">cmpsbl.com</a>
              {" · "}
              <a href="https://mana.cmpsbl.com" className="hover:text-primary transition-colors">mana.cmpsbl.com</a>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
