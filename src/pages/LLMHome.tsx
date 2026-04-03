/**
 * CMPSBL LLM™ — LLM Intelligence Vertical Landing Page
 *
 * Emerald/teal theme. Neural-network aesthetic.
 * Distinct visual identity for llm.cmpsbl.com.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useSSORelay } from "@/hooks/useSSORelay";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain, Zap, ArrowRight, Layers, Activity, Shield, Search,
  Eye, Scale, Link2, Filter, AlertTriangle, Lock, FileSearch,
  Siren, Target, UserCheck, Package, Sparkles, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { VerticalReturnBanner } from "@/components/shared/VerticalReturnBanner";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

/* ─── Theme Constants ─── */
const ACCENT = 'hsl(160 90% 45%)';
const ACCENT_GLOW = 'hsl(160 90% 55%)';
const BG_DEEP = 'hsl(170 30% 3%)';
const BG_CARD = 'hsl(170 25% 6%)';
const BORDER = 'hsl(170 20% 12%)';
const TEXT_PRIMARY = 'hsl(170 10% 92%)';
const TEXT_SECONDARY = 'hsl(170 15% 45%)';
const CYAN = 'hsl(180 100% 50%)';

const LLM_STATS = [
  { label: "OWASP LLM Risks Covered", value: "10/10", icon: Shield },
  { label: "LLM Primitives Active", value: "16", icon: Layers },
  { label: "Crown Jewels Deployed", value: "80", icon: Sparkles },
  { label: "Capabilities Online", value: "100+", icon: Activity },
];

const ENGINE_DATA: { id: string; name: string; desc: string; icon: LucideIcon; color: string }[] = [
  { id: "VERITAS", name: "VERITAS", desc: "Hallucination detection — multi-source grounding, claim decomposition, entropy-based confabulation detection, temporal fact decay tracking", icon: Eye, color: "hsl(160 90% 45%)" },
  { id: "RAMPART", name: "RAMPART", desc: "Prompt injection defense — 8-layer classifier cascade, indirect injection sentinel, instruction-data boundary enforcement", icon: Shield, color: "hsl(0 85% 55%)" },
  { id: "MERIDIAN", name: "MERIDIAN", desc: "Reasoning chain validation — logical consistency verification, circular reasoning detection, causal inference validation", icon: Search, color: "hsl(45 90% 55%)" },
  { id: "LEXICON", name: "LEXICON", desc: "Tokenizer security — adversarial token detection, embedding poisoning scanner, training data contamination probes", icon: FileSearch, color: "hsl(270 80% 60%)" },
  { id: "CLARITY", name: "CLARITY", desc: "Explainability engine — attention decomposition, decision provenance tracing, counterfactual explanation generation", icon: Sparkles, color: "hsl(200 100% 55%)" },
  { id: "FULCRUM", name: "FULCRUM", desc: "Bias detection — demographic parity analysis, cultural bias spectrum scanning, intersectional fairness auditing", icon: Scale, color: "hsl(320 80% 55%)" },
  { id: "TETHER", name: "TETHER", desc: "Context coherence — lost-in-the-middle compensation, context window pressure monitoring, cross-session isolation", icon: Link2, color: "hsl(30 90% 50%)" },
  { id: "SIEVE", name: "SIEVE", desc: "Output sanitization — multi-modal harm classification, PII redaction, code injection scanning, regulatory compliance filtering", icon: Filter, color: "hsl(140 70% 45%)" },
];

const AGENT_DATA: { id: string; name: string; desc: string; icon: LucideIcon }[] = [
  { id: "SKEPTIC", name: "SKEPTIC", desc: "Adversarial red-team fact checker — counter-prompt engine, ground truth validation, epistemic humility enforcement", icon: AlertTriangle },
  { id: "ARBITER", name: "ARBITER", desc: "Output consistency — cross-instance comparison, temporal consistency tracking, contradiction resolution protocol", icon: Scale },
  { id: "HERALD", name: "HERALD", desc: "Alignment drift monitor — value drift seismograph, safety boundary erosion detection, behavioral regression testing", icon: Siren },
  { id: "MIMIC", name: "MIMIC", desc: "Sycophancy detection — preference pandering detector, intellectual honesty enforcement, persona independence testing", icon: UserCheck },
  { id: "QUARRY", name: "QUARRY", desc: "Data provenance — training data membership inference, verbatim memorization detection, license compliance auditing", icon: FileSearch },
  { id: "EMBARGO", name: "EMBARGO", desc: "Information leakage prevention — system prompt protection, regurgitation blocking, cross-tenant information barriers", icon: Lock },
  { id: "CRUCIBLE", name: "CRUCIBLE", desc: "Jailbreak detection — novel pattern detection, multi-turn attack chain analysis, red-team simulation orchestration", icon: Target },
  { id: "WARDEN", name: "WARDEN", desc: "Model supply chain — provenance validation, backdoor weight scanning, fine-tuning pipeline auditing", icon: Package },
];

const OWASP_COVERAGE = [
  { risk: "LLM01: Prompt Injection", primitive: "RAMPART" },
  { risk: "LLM02: Sensitive Info Disclosure", primitive: "EMBARGO" },
  { risk: "LLM03: Supply Chain Vulnerabilities", primitive: "WARDEN" },
  { risk: "LLM04: Data & Model Poisoning", primitive: "LEXICON" },
  { risk: "LLM05: Improper Output Handling", primitive: "SIEVE" },
  { risk: "LLM06: Excessive Agency", primitive: "MERIDIAN" },
  { risk: "LLM07: System Prompt Leakage", primitive: "EMBARGO" },
  { risk: "LLM08: Vector & Embedding Weakness", primitive: "LEXICON" },
  { risk: "LLM09: Misinformation", primitive: "VERITAS" },
  { risk: "LLM10: Unbounded Consumption", primitive: "TETHER" },
];

const CROWN_JEWEL_HIGHLIGHTS = [
  "Multi-Source Grounding Matrix",
  "Layered Injection Classifier",
  "Sycophancy Resistance Index",
  "Backdoor Weight Scanner",
  "Novel Jailbreak Pattern Detector",
];

export default function LLMHome() {
  useSSORelay();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>CMPSBL LLM™ — Cognitive LLM Infrastructure</title>
        <meta name="description" content="CMPSBL LLM™ — 16 specialized primitives targeting every flaw in modern Large Language Models. Hallucination, injection, bias, alignment drift — Models Break Here, Not in Production." />
      </Helmet>

      <VerticalReturnBanner verticalName="CMPSBL LLM™" accentColor={ACCENT} />
      <PublicNav />

      <div className="min-h-screen" style={{ background: BG_DEEP }}>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 sm:px-6 pt-20 pb-24">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 0%, hsl(160 90% 20% / 0.4), transparent)`,
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 30% 40% at 80% 20%, hsl(180 100% 30% / 0.15), transparent)`,
          }} />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-6 border-0 px-3 py-1 text-xs font-mono tracking-wider" style={{
                background: `${ACCENT}15`,
                color: ACCENT_GLOW,
              }}>
                LLM SUBSTRATE · ACTIVE
              </Badge>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4" style={{ color: TEXT_PRIMARY }}>
                CMPSBL <span style={{ color: ACCENT }}>LLM</span>™
              </h1>

              <p className="text-lg sm:text-xl mb-2 font-semibold" style={{ color: CYAN }}>
                Models Break Here, Not in Production
              </p>

              <p className="text-sm sm:text-base max-w-2xl mx-auto mb-10" style={{ color: TEXT_SECONDARY }}>
                16 purpose-built primitives targeting every structural flaw in modern LLMs —
                hallucination, prompt injection, bias, sycophancy, alignment drift, and jailbreak.
                Mapped 1:1 to the OWASP Top 10 for LLMs.
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button size="lg" className="border-0 font-bold" style={{ background: ACCENT, color: 'hsl(170 30% 3%)' }}
                  onClick={() => navigate('/ascension')}>
                  Enter Ascension Lab <Zap className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="font-bold" style={{
                  borderColor: BORDER, color: 'hsl(170 10% 70%)',
                  background: BG_CARD,
                }} onClick={() => navigate('/explore')}>
                  Explore Capabilities <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 sm:px-6 pb-16">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
            {LLM_STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="text-center p-4 rounded-xl" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                <s.icon className="h-5 w-5 mx-auto mb-2" style={{ color: ACCENT }} />
                <div className="text-xl font-bold font-mono" style={{ color: TEXT_PRIMARY }}>{s.value}</div>
                <div className="text-xs" style={{ color: TEXT_SECONDARY }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* OWASP Coverage */}
        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: TEXT_PRIMARY }}>
              OWASP Top 10 LLM Coverage
            </h2>
            <p className="text-sm mb-8" style={{ color: TEXT_SECONDARY }}>
              Every risk in the 2025 OWASP Top 10 for LLMs has a dedicated primitive
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {OWASP_COVERAGE.map((item, i) => (
                <motion.div key={item.risk} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i }}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                  <span className="text-xs" style={{ color: 'hsl(170 10% 75%)' }}>{item.risk}</span>
                  <Badge className="border-0 text-xs font-mono" style={{ background: `${ACCENT}15`, color: ACCENT }}>
                    {item.primitive}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Engines */}
        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: TEXT_PRIMARY }}>
              LLM Engines
            </h2>
            <p className="text-sm mb-8" style={{ color: TEXT_SECONDARY }}>
              8 specialized engines that replace the standard substrate engines for LLM software
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {ENGINE_DATA.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <Card className="border" style={{ background: BG_CARD, borderColor: BORDER }}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg" style={{ background: `${e.color}15` }}>
                          <e.icon className="h-5 w-5" style={{ color: e.color }} />
                        </div>
                        <span className="font-mono font-bold text-sm" style={{ color: TEXT_PRIMARY }}>{e.name}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'hsl(170 15% 50%)' }}>{e.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Agents */}
        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: TEXT_PRIMARY }}>
              LLM Agents
            </h2>
            <p className="text-sm mb-8" style={{ color: TEXT_SECONDARY }}>
              8 autonomous agents purpose-built for LLM security, alignment, and reliability
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {AGENT_DATA.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <Card className="h-full border" style={{ background: BG_CARD, borderColor: BORDER }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <a.icon className="h-4 w-4" style={{ color: CYAN }} />
                        <span className="font-mono font-bold text-xs" style={{ color: CYAN }}>{a.name}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'hsl(170 15% 50%)' }}>{a.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Crown Jewel Highlights */}
        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-black mb-6" style={{ color: TEXT_PRIMARY }}>
              Crown Jewel Highlights
            </h2>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {CROWN_JEWEL_HIGHLIGHTS.map(j => (
                <Badge key={j} className="border-0 text-xs font-mono" style={{
                  background: `${ACCENT}10`, color: ACCENT_GLOW,
                }}>
                  {j}
                </Badge>
              ))}
            </div>
            <p className="text-sm" style={{ color: TEXT_SECONDARY }}>
              80 S-Tier Crown Jewels · 5 per custom primitive · Zero external AI
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 pb-24">
          <div className="max-w-2xl mx-auto text-center p-10 rounded-2xl" style={{
            background: BG_CARD, border: `1px solid ${BORDER}`,
          }}>
            <h2 className="text-2xl font-black mb-3" style={{ color: TEXT_PRIMARY }}>
              Harden LLM Software
            </h2>
            <p className="text-sm mb-6" style={{ color: 'hsl(170 15% 50%)' }}>
              Upload any LLM-related code to the Ascension Lab. The 40-Primitive matrix
              discovers vulnerabilities across all OWASP LLM risk categories and restores
              software to a higher cognitive tier.
            </p>
            <Button size="lg" className="border-0 font-bold" style={{ background: ACCENT, color: 'hsl(170 30% 3%)' }}
              onClick={() => navigate('/ascension')}>
              Enter Ascension Lab <Zap className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>

      <EnhancedFooter />
    </>
  );
}
