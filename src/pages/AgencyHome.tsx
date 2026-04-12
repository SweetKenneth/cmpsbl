/**
 * CMPSBL AGENCY™ — Autonomous Agent Infrastructure Landing Page
 *
 * Warm amber/gold theme. Mission-control aesthetic.
 * Distinct visual identity for agency.cmpsbl.com.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useSSORelay } from "@/hooks/useSSORelay";
import { Helmet } from "react-helmet-async";
import { StructuredData } from "@/components/seo/StructuredData";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users, Zap, ArrowRight, Layers, Activity, Shield, Search,
  Brain, Target, Wrench, MessageSquare, GraduationCap,
  HeartPulse, Sparkles, Swords, Anchor, Award, Megaphone,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { VerticalReturnBanner } from "@/components/shared/VerticalReturnBanner";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { useVerticalCounts } from "@/hooks/useDiscoveryCounts";

/* ─── Theme Constants ─── */
const ACCENT = 'hsl(35 90% 55%)';
const ACCENT_GLOW = 'hsl(35 100% 65%)';
const BG_DEEP = 'hsl(30 20% 4%)';
const BG_CARD = 'hsl(30 15% 7%)';
const BORDER = 'hsl(30 15% 14%)';
const TEXT_PRIMARY = 'hsl(35 10% 92%)';
const TEXT_SECONDARY = 'hsl(30 15% 45%)';
const WARM = 'hsl(40 100% 55%)';

const ENGINE_DATA: { id: string; name: string; desc: string; icon: LucideIcon; color: string }[] = [
  { id: "MANDATE", name: "MANDATE", desc: "Mission decomposition — recursive goal breakdown, dependency graphing, priority scoring, deadline-aware scheduling, autonomous replanning", icon: Target, color: "hsl(35 90% 55%)" },
  { id: "DELEGATE", name: "DELEGATE", desc: "Task routing — competency-based matching, workload balancing, escalation routing, parallel dispatch, bottleneck detection", icon: Users, color: "hsl(200 85% 55%)" },
  { id: "RECONN", name: "RECONN", desc: "Deep research — web crawling, knowledge synthesis, source verification, citation tracking, competitive intelligence", icon: Search, color: "hsl(160 80% 50%)" },
  { id: "UPLINK", name: "UPLINK", desc: "Inter-agent comms — structured messaging, context handoff, knowledge broadcast, collaborative reasoning, shared memory sync", icon: MessageSquare, color: "hsl(270 80% 60%)" },
  { id: "SCRIBE", name: "SCRIBE", desc: "Writing engine — professional drafting, tone calibration, multi-format output, style adaptation, content structuring", icon: Megaphone, color: "hsl(320 80% 55%)" },
  { id: "INCENTIVE", name: "INCENTIVE", desc: "Reward programs — skill progression tracking, performance incentives, gamified learning, achievement milestones, feedback loops", icon: Award, color: "hsl(45 95% 55%)" },
  { id: "REASON", name: "REASON", desc: "Decision engine — chain-of-thought validation, fallacy detection, hypothesis testing, multi-criteria analysis, counterfactual reasoning", icon: Brain, color: "hsl(0 85% 55%)" },
  { id: "TOOLKIT", name: "TOOLKIT", desc: "Tool orchestration — API chaining, function calling, parameter validation, output parsing, tool discovery, retry with backoff", icon: Wrench, color: "hsl(140 70% 45%)" },
];

const AGENT_DATA: { id: string; name: string; desc: string; icon: LucideIcon }[] = [
  { id: "OPERATOR", name: "OPERATOR", desc: "Autonomous mission executor — zero-direction completion, self-monitoring, strategy adaptation, error recovery", icon: Zap },
  { id: "SENTINEL", name: "SENTINEL", desc: "Fleet health monitor — self-healing protocols, graceful degradation, circuit breakers, failure prediction", icon: HeartPulse },
  { id: "DIPLOMAT", name: "DIPLOMAT", desc: "Teamwork coordinator — conflict resolution, consensus building, team formation, role negotiation", icon: Users },
  { id: "SCHOLAR", name: "SCHOLAR", desc: "Skill acquisition agent — knowledge distillation, pattern learning, curriculum generation, competency assessment", icon: GraduationCap },
  { id: "ENVOY", name: "ENVOY", desc: "Communication agent — progress reporting, result translation, expectation management, notification delivery", icon: Megaphone },
  { id: "WARDEN", name: "WARDEN", desc: "Governance enforcer — boundary enforcement, permission validation, ethical constraints, action auditing", icon: Shield },
  { id: "ROGUE", name: "ROGUE", desc: "Creative solver — lateral thinking, unconventional approaches, novel strategies, assumption challenging", icon: Swords },
  { id: "ANCHOR", name: "ANCHOR", desc: "Context persistence — session continuity, long-term memory, knowledge indexing, cross-session pattern tracking", icon: Anchor },
];

const CORE_COMPETENCIES = [
  { skill: "Autonomous Execution", primitive: "OPERATOR + MANDATE" },
  { skill: "Research & Synthesis", primitive: "RECONN + REASON" },
  { skill: "Team Collaboration", primitive: "DIPLOMAT + UPLINK" },
  { skill: "Tool Mastery", primitive: "TOOLKIT + DELEGATE" },
  { skill: "Professional Writing", primitive: "SCRIBE + ENVOY" },
  { skill: "Continuous Learning", primitive: "SCHOLAR + INCENTIVE" },
  { skill: "Self-Healing & Resilience", primitive: "SENTINEL + DEFENSE" },
  { skill: "Governed Autonomy", primitive: "WARDEN + GOVERNANCE" },
];

const CROWN_JEWEL_HIGHLIGHTS = [
  "Zero-Direction Mission Executor",
  "Multi-Agent Swarm Intelligence",
  "Skill Progression Ladder",
  "Collaborative Reasoning Bus",
  "Fleet Circuit Breaker Mesh",
];

export default function AgencyHome() {
  useSSORelay();
  const navigate = useNavigate();
  const { total, crownJewels } = useVerticalCounts('agency');
  const AGENCY_STATS = [
    { label: "Agent Capabilities Active", value: String(total || '100+'), icon: Activity },
    { label: "Agency Primitives", value: "16", icon: Layers },
    { label: "Crown Jewels Deployed", value: String(crownJewels || '80'), icon: Sparkles },
    { label: "Core Competencies", value: "8", icon: Target },
  ];

  return (
    <>
      <Helmet>
        <title>CMPSBL AGENCY™ — Governed Autonomous Agent Infrastructure</title>
        <meta name="description" content="CMPSBL AGENCY™ — 16 specialized primitives empowering autonomous AI agents with research, collaboration, tool mastery, self-healing, and governed autonomy. Agents That Learn, Collaborate, and Ship." />
      </Helmet>
      <StructuredData type="webApplication" data={{ name: "CMPSBL AGENCY™", description: "Governed autonomous agent infrastructure — 16 specialized primitives for research, collaboration, tool mastery, and self-healing AI agents.", url: "https://agency.cmpsbl.com", features: "Autonomous Research, Agent Collaboration, Tool Mastery, Self-Healing, Governed Autonomy, Task Orchestration" }} />

      <VerticalReturnBanner verticalName="CMPSBL AGENCY™" accentColor={ACCENT} />
      <PublicNav />

      <div className="min-h-screen" style={{ background: BG_DEEP }}>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 sm:px-6 pt-20 pb-24">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 0%, hsl(35 80% 20% / 0.4), transparent)`,
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 30% 40% at 80% 20%, hsl(45 100% 30% / 0.15), transparent)`,
          }} />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-6 border-0 px-3 py-1 text-xs font-mono tracking-wider" style={{
                background: `${ACCENT}15`,
                color: ACCENT_GLOW,
              }}>
                AGENCY SUBSTRATE · ACTIVE
              </Badge>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4" style={{ color: TEXT_PRIMARY }}>
                CMPSBL <span style={{ color: ACCENT }}>AGENCY</span>™
              </h1>

              <p className="text-lg sm:text-xl mb-2 font-semibold" style={{ color: WARM }}>
                Agents That Learn, Collaborate, and Ship
              </p>

              <p className="text-sm sm:text-base max-w-2xl mx-auto mb-10" style={{ color: TEXT_SECONDARY }}>
                16 purpose-built primitives granting AI agents autonomous execution, deep research,
                team collaboration, professional writing, tool mastery, and governed self-healing —
                all with minimal human direction.
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button size="lg" className="border-0 font-bold" style={{ background: ACCENT, color: 'hsl(30 20% 4%)' }}
                  onClick={() => navigate('/ascension')}>
                  Enter Ascension Lab <Zap className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="font-bold" style={{
                  borderColor: BORDER, color: 'hsl(35 10% 70%)',
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
            {AGENCY_STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="text-center p-4 rounded-xl" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                <s.icon className="h-5 w-5 mx-auto mb-2" style={{ color: ACCENT }} />
                <div className="text-xl font-bold font-mono" style={{ color: TEXT_PRIMARY }}>{s.value}</div>
                <div className="text-xs" style={{ color: TEXT_SECONDARY }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Core Competencies */}
        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: TEXT_PRIMARY }}>
              Core Agent Competencies
            </h2>
            <p className="text-sm mb-8" style={{ color: TEXT_SECONDARY }}>
              Every essential agent skill mapped to dedicated primitives
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {CORE_COMPETENCIES.map((item, i) => (
                <motion.div key={item.skill} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i }}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                  <span className="text-xs font-medium" style={{ color: 'hsl(35 10% 75%)' }}>{item.skill}</span>
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
              Agency Engines
            </h2>
            <p className="text-sm mb-8" style={{ color: TEXT_SECONDARY }}>
              8 specialized engines hot-swapped for autonomous agent operations
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
                      <p className="text-xs leading-relaxed" style={{ color: 'hsl(30 15% 50%)' }}>{e.desc}</p>
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
              Agency Agents
            </h2>
            <p className="text-sm mb-8" style={{ color: TEXT_SECONDARY }}>
              8 autonomous agents purpose-built for agent fleet excellence
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {AGENT_DATA.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <Card className="h-full border" style={{ background: BG_CARD, borderColor: BORDER }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <a.icon className="h-4 w-4" style={{ color: WARM }} />
                        <span className="font-mono font-bold text-xs" style={{ color: WARM }}>{a.name}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'hsl(30 15% 50%)' }}>{a.desc}</p>
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
              Power Up Your Agents
            </h2>
            <p className="text-sm mb-6" style={{ color: 'hsl(30 15% 50%)' }}>
              Upload any agent code to the Ascension Lab. The 40-Primitive matrix discovers
              capability gaps across all agent competencies and restores software to a higher
              cognitive tier — teaching your agents new skills, communication patterns, and resilience.
            </p>
            <Button size="lg" className="border-0 font-bold" style={{ background: ACCENT, color: 'hsl(30 20% 4%)' }}
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
