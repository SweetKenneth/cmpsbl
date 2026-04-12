/**
 * CMPSBL ULTIMATE™ — Universal Ascension Landing Page
 *
 * Royal purple/violet theme. Every-primitive-is-a-candidate aesthetic.
 * Distinct visual identity for ultimate.cmpsbl.com.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useSSORelay } from "@/hooks/useSSORelay";
import { Helmet } from "react-helmet-async";
import { StructuredData } from "@/components/seo/StructuredData";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Crown, Zap, ArrowRight, Layers, Activity, Sparkles,
  Target, Brain, Shield, Search, Wrench, MessageSquare,
  Eye, Gauge, GitBranch, Server, Radio, Blocks,
  Cpu, Network, Globe, Flame,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { VerticalReturnBanner } from "@/components/shared/VerticalReturnBanner";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { getUniversalPoolSize, getUniversalPoolBreakdown } from "@/lib/factory/universal-pool-scanner";
import { getUltimateSubstrate } from "@/lib/factory/verticals/ultimate";
import { PATENT_NOTICE } from "@/config/domains";

/* ─── Theme Constants ─── */
const ACCENT = 'hsl(270 80% 65%)';
const ACCENT_GLOW = 'hsl(270 90% 75%)';
const ACCENT_DIM = 'hsl(270 60% 45%)';
const BG_DEEP = 'hsl(270 30% 4%)';
const BG_CARD = 'hsl(270 20% 7%)';
const BORDER = 'hsl(270 15% 14%)';
const TEXT_PRIMARY = 'hsl(270 10% 92%)';
const TEXT_SECONDARY = 'hsl(270 15% 45%)';
const GOLD = 'hsl(45 100% 60%)';

const ENGINE_DATA: { id: string; name: string; desc: string; icon: LucideIcon; color: string }[] = [
  { id: "APEX", name: "APEX", desc: "Peak performance — hot path detection, algorithmic bottlenecks, cache optimization, lazy evaluation", icon: Gauge, color: "hsl(0 85% 60%)" },
  { id: "CONDUIT", name: "CONDUIT", desc: "Data pipelines — ETL detection, stream processing, backpressure handling, idempotency patterns", icon: GitBranch, color: "hsl(200 85% 55%)" },
  { id: "PRISM", name: "PRISM", desc: "Multi-paradigm — OOP/FP/reactive/actor model recognition, SOLID scoring, paradigm coherence", icon: Eye, color: "hsl(160 80% 50%)" },
  { id: "GENESIS", name: "GENESIS", desc: "Architecture seeding — boilerplate detection, project maturity, module boundaries, DI patterns", icon: Blocks, color: "hsl(35 90% 55%)" },
  { id: "FLUX", name: "FLUX", desc: "State management — Redux/signals/atoms, event sourcing, CQRS, state machines, side-effect isolation", icon: Radio, color: "hsl(270 80% 60%)" },
  { id: "CRUCIBLE", name: "CRUCIBLE", desc: "Stress analysis — resource exhaustion, connection pools, memory leaks, thread starvation, GC pressure", icon: Flame, color: "hsl(15 90% 55%)" },
  { id: "MERIDIAN", name: "MERIDIAN", desc: "API governance — contract validation, REST maturity, versioning, breaking change detection, pagination", icon: Server, color: "hsl(180 70% 50%)" },
  { id: "DYNAMO", name: "DYNAMO", desc: "Concurrency — async patterns, race conditions, deadlock detection, mutex analysis, worker threads", icon: Cpu, color: "hsl(45 90% 55%)" },
];

const AGENT_DATA: { id: string; name: string; desc: string; icon: LucideIcon }[] = [
  { id: "SENTINEL", name: "SENTINEL", desc: "Input validation — sanitization, type coercion, injection vectors, schema enforcement", icon: Shield },
  { id: "CATALYST", name: "CATALYST", desc: "Dependency optimization — dead code, circular imports, bundle bloat, tree-shaking", icon: Zap },
  { id: "ARBITER", name: "ARBITER", desc: "Error handling — try-catch scoring, recovery strategies, circuit breakers, fault tolerance", icon: Target },
  { id: "HERALD", name: "HERALD", desc: "Observability — logging patterns, metrics, distributed tracing, health checks, alerting", icon: MessageSquare },
  { id: "NOMAD", name: "NOMAD", desc: "Portability — platform coupling, containerization readiness, cross-runtime compatibility", icon: Globe },
  { id: "WELDER", name: "WELDER", desc: "Integration — REST/GraphQL/gRPC/WebSocket/message queue patterns, coupling scoring", icon: Network },
  { id: "ORACLE", name: "ORACLE", desc: "Configuration — feature flags, environment overrides, secrets handling, config drift", icon: Brain },
  { id: "PHOENIX", name: "PHOENIX", desc: "Migration — deprecation detection, upgrade pathways, backward compatibility, schema evolution", icon: Sparkles },
];

const VERTICAL_SOURCES = [
  { name: "Spine (Organs + Layers)", color: "hsl(220 70% 55%)", count: 24 },
  { name: "Cyber", color: "hsl(0 80% 55%)", count: 16 },
  { name: "Robotics", color: "hsl(210 80% 55%)", count: 16 },
  { name: "Quantum", color: "hsl(270 80% 60%)", count: 16 },
  { name: "LLM", color: "hsl(155 80% 50%)", count: 16 },
  { name: "Agency", color: "hsl(35 90% 55%)", count: 16 },
  { name: "Universal", color: ACCENT, count: 16 },
];

export default function UltimateHome() {
  useSSORelay();
  const navigate = useNavigate();
  const [poolSize, setPoolSize] = useState(120);
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});
  const [allPrimitives, setAllPrimitives] = useState<{ name: string; role: string; source: string }[]>([]);

  useEffect(() => {
    setPoolSize(getUniversalPoolSize());
    setBreakdown(getUniversalPoolBreakdown());

    // Build full primitive list grouped by source
    const substrate = getUltimateSubstrate();
    const spine = substrate.primitives.filter(p => p.inherited !== false && (p.role === 'organ' || p.role === 'layer'));
    const rest = substrate.primitives.filter(p => p.inherited === false);

    const tagged: { name: string; role: string; source: string }[] = [];
    for (const p of spine) {
      tagged.push({ name: p.name, role: p.role, source: 'Spine' });
    }
    // Map expansion primitives to their source vertical by ID prefix
    for (const p of rest) {
      let source = 'Universal';
      if (p.id.startsWith('ULT_')) source = 'Universal';
      else if (['WATCHTOWER','SHADE','AEGIS','CIPHER','RECON','VANGUARD','BASTION','TEMPEST','PROWLER','ONYX','SPECTER','BLACKOUT','TRACER','NOCTURNE','IRONCLAD','CITADEL'].includes(p.name)) source = 'Cyber';
      else if (['MARSHAL','DISPATCH','FABRICATOR','KINETIC','SWARMLINK','CALIBRATE','TERRAIN','TETHER','SENTINEL_R','ASSEMBLER','PATHFINDER','GYROSCOPE','TELEMETRIX','HARDPOINT','LOADMASTER','FAILOVER'].includes(p.name)) source = 'Robotics';
      else if (['MANDATE','DELEGATE','RECONN','UPLINK','SCRIBE','INCENTIVE','REASON','TOOLKIT','OPERATOR','OVERSEER','LIAISON','SCHOLAR','ENVOY','WARDEN','ROGUE','ANCHOR'].includes(p.name)) source = 'Agency';
      else source = p.id.includes('Q_') ? 'Quantum' : p.id.includes('LLM_') ? 'LLM' : 'Expansion';
      tagged.push({ name: p.name, role: p.role, source });
    }
    setAllPrimitives(tagged);
  }, []);

  const STATS = [
    { label: "Candidate Primitives", value: `${poolSize}`, icon: Layers },
    { label: "Sources", value: `${Object.keys(breakdown).length || 7}`, icon: Activity },
    { label: "Open Slots", value: "40", icon: Crown },
    { label: "Restrictions", value: "0", icon: Sparkles },
  ];

  return (
    <>
      <Helmet>
        <title>{`CMPSBL ULTIMATE™ — ${poolSize} Candidates · Dynamic Selection · Zero Restrictions`}</title>
        <meta name="description" content={`CMPSBL ULTIMATE™ — The ceiling of Ascension. ${poolSize} candidate primitives from every source compete for selection. No spine lock. No category restrictions. The scanner selects only the primitives your code actually needs — up to 40.`} />
        <link rel="canonical" href="https://ultimate.cmpsbl.com" />
        <meta property="og:title" content="CMPSBL ULTIMATE™ — Universal Ascension" />
        <meta property="og:description" content="Every candidate primitive from every source competes for selection. No spine lock. No restrictions." />
        <meta property="og:url" content="https://ultimate.cmpsbl.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CMPSBL" />
      </Helmet>
      <StructuredData type="webApplication" data={{ name: "CMPSBL ULTIMATE™", description: "Universal Ascension — every candidate primitive from every source competes for selection. No spine lock. No restrictions. The scanner selects only what your code needs.", url: "https://ultimate.cmpsbl.com", features: "Universal Pool Selection, Dynamic Primitive Selection, Cross-Vertical Candidates, Zero Restrictions, Autonomous Scanning, Full Ascension" }} />

      <VerticalReturnBanner verticalName="CMPSBL ULTIMATE™" accentColor={ACCENT} />
      <PublicNav />

      {/* Enterprise-only notice */}
      <div className="w-full border-b" style={{ borderColor: `${ACCENT}30`, background: `${ACCENT}08` }}>
        <div className="max-w-4xl mx-auto px-4 py-3 text-center">
          <p className="text-xs font-mono tracking-wider" style={{ color: GOLD }}>
            FOR ENTERPRISE USE ONLY · {PATENT_NOTICE.status.toUpperCase()}
          </p>
          <p className="text-[10px] mt-1 font-mono" style={{ color: `${ACCENT}90` }}>
            {PATENT_NOTICE.inline}
          </p>
          <p className="text-xs mt-1" style={{ color: TEXT_SECONDARY }}>
            For more info please contact{' '}
            <a href="mailto:ascension@cmpsbl.com" className="underline hover:no-underline" style={{ color: ACCENT }}>
              ascension@cmpsbl.com
            </a>
          </p>
        </div>
      </div>

      <div className="min-h-screen" style={{ background: BG_DEEP }}>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 sm:px-6 pt-20 pb-24">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 0%, hsl(270 60% 25% / 0.5), transparent)`,
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 30% 40% at 20% 30%, hsl(45 100% 30% / 0.1), transparent)`,
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 25% 35% at 80% 20%, hsl(270 80% 40% / 0.15), transparent)`,
          }} />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-6 border-0 px-3 py-1 text-xs font-mono tracking-wider" style={{
                background: `${ACCENT}15`,
                color: GOLD,
              }}>
                <Crown className="inline h-3 w-3 mr-1" />
                ULTIMATE SUBSTRATE · {poolSize} CANDIDATES
              </Badge>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4" style={{ color: TEXT_PRIMARY }}>
                CMPSBL <span style={{ color: ACCENT }}>ULTIMATE</span>™
              </h1>

              <p className="text-lg sm:text-xl mb-2 font-semibold" style={{ color: GOLD }}>
                {poolSize} Candidates. 40 Slots. Zero Restrictions.
              </p>

              <p className="text-sm sm:text-base max-w-2xl mx-auto mb-10" style={{ color: TEXT_SECONDARY }}>
                Every primitive in the CMPSBL ecosystem — Spine, vertical expansions, and
                Universal gap-fillers — competes for all 40 slots. No locked organs. No forced
                layers. The scanner chooses the 40 primitives that produce the maximum
                compounding effect for your specific codebase. No two scans alike.
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button size="lg" className="border-0 font-bold" style={{ background: ACCENT, color: 'hsl(270 20% 4%)' }}
                  onClick={() => navigate('/ascension')}>
                  Enter Ultimate Ascension <Crown className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="font-bold" style={{
                  borderColor: BORDER, color: 'hsl(270 10% 70%)',
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
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="text-center p-4 rounded-xl" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                <s.icon className="h-5 w-5 mx-auto mb-2" style={{ color: ACCENT }} />
                <div className="text-xl font-bold font-mono" style={{ color: TEXT_PRIMARY }}>{s.value}</div>
                <div className="text-xs" style={{ color: TEXT_SECONDARY }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: TEXT_PRIMARY }}>
              How Universal Ascension Works
            </h2>
            <p className="text-sm mb-8" style={{ color: TEXT_SECONDARY }}>
              No spine lock. No category quotas. The scanner selects only what your code needs — no filler
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { step: "01", title: "Full Pool Assembly", desc: `${poolSize} primitives from every source — Spine organs, layers, Cyber, Robotics, Quantum, LLM, Agency expansion primitives, and 16 Universal gap-fillers — all loaded as equal candidates.` },
                { step: "02", title: "Extended Collision", desc: "Multi-pass scoring evaluates every candidate against your code using signal matching, capability overlap, breadth analysis, and cross-primitive compounding potential. Spine primitives receive a structural bonus for their foundational power." },
                { step: "03", title: "Code-Driven Selection", desc: "The scanner selects only the primitives that exceed the compounding threshold for your code — from 8 to 40. No forced fills, no padding. If your code needs 14 primitives, you get 14. If it needs 38, you get 38." },
              ].map((item, i) => (
                <motion.div key={item.step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="p-5 rounded-xl" style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}>
                  <div className="text-2xl font-black font-mono mb-2" style={{ color: ACCENT_DIM }}>{item.step}</div>
                  <div className="text-sm font-bold mb-2" style={{ color: TEXT_PRIMARY }}>{item.title}</div>
                  <p className="text-xs leading-relaxed" style={{ color: TEXT_SECONDARY }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Vertical Sources */}
        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: TEXT_PRIMARY }}>
              {poolSize} Candidates From Every Source
            </h2>
            <p className="text-sm mb-8" style={{ color: TEXT_SECONDARY }}>
              Spine primitives, vertical expansions, and universal gap-fillers — all compete equally for 40 slots
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {VERTICAL_SOURCES.map((v, i) => (
                <motion.div key={v.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }}
                  className="p-4 rounded-xl text-center" style={{
                    background: BG_CARD, border: `1px solid ${BORDER}`,
                  }}>
                  <div className="text-lg font-bold font-mono mb-1" style={{ color: v.color }}>{v.count}</div>
                  <div className="text-xs font-medium" style={{ color: TEXT_SECONDARY }}>{v.name}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Full Ecosystem Pool */}
        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: TEXT_PRIMARY }}>
              Full Ecosystem Pool — {allPrimitives.length} Candidates
            </h2>
            <p className="text-sm mb-8" style={{ color: TEXT_SECONDARY }}>
              Every primitive from every source competes equally. The scanner selects the 40 best for your code.
            </p>

            {/* Group by source */}
            {['Spine', 'Cyber', 'Robotics', 'Quantum', 'LLM', 'Agency', 'Universal', 'Expansion'].map(source => {
              const prims = allPrimitives.filter(p => p.source === source);
              if (prims.length === 0) return null;
              const sourceColor = source === 'Spine' ? 'hsl(220 70% 55%)'
                : source === 'Cyber' ? 'hsl(0 80% 55%)'
                : source === 'Robotics' ? 'hsl(210 80% 55%)'
                : source === 'Quantum' ? 'hsl(270 80% 60%)'
                : source === 'LLM' ? 'hsl(155 80% 50%)'
                : source === 'Agency' ? 'hsl(35 90% 55%)'
                : ACCENT;
              return (
                <div key={source} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: sourceColor }} />
                    <span className="text-sm font-bold font-mono" style={{ color: sourceColor }}>
                      {source} ({prims.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {prims.map(p => (
                      <span key={`${source}-${p.name}`} className="px-2.5 py-1 rounded-md text-xs font-mono font-medium" style={{
                        background: `${sourceColor}12`,
                        color: sourceColor,
                        border: `1px solid ${sourceColor}30`,
                      }}>
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Universal Engines — Spotlight */}
        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: TEXT_PRIMARY }}>
              16 Universal Gap-Fillers
            </h2>
            <p className="text-sm mb-8" style={{ color: TEXT_SECONDARY }}>
              Architecture-agnostic primitives designed to fill gaps no specialized vertical covers
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
                        <Badge className="ml-auto border-0 text-[10px]" style={{ background: `${ACCENT}15`, color: ACCENT_GLOW }}>
                          ENGINE
                        </Badge>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'hsl(270 15% 50%)' }}>{e.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {AGENT_DATA.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <Card className="h-full border" style={{ background: BG_CARD, borderColor: BORDER }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <a.icon className="h-4 w-4" style={{ color: GOLD }} />
                        <span className="font-mono font-bold text-xs" style={{ color: GOLD }}>{a.name}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'hsl(270 15% 50%)' }}>{a.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Promise */}
        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-black mb-6" style={{ color: TEXT_PRIMARY }}>
              The Ultimate Difference
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-8 text-left">
              {[
                { label: "Standard Vertical", desc: "24 locked spine + 16 fixed expansion primitives. Optimized for one domain.", style: "muted" },
                { label: "Ultimate Ascension", desc: `${poolSize} candidates. Dynamic selection. No spine lock. No quotas. The scanner picks only the primitives that compound for your code — from 8 to 40.`, style: "highlight" },
              ].map(item => (
                <div key={item.label} className="p-5 rounded-xl" style={{
                  background: item.style === 'highlight' ? `${ACCENT}08` : BG_CARD,
                  border: `1px solid ${item.style === 'highlight' ? ACCENT_DIM : BORDER}`,
                }}>
                  <div className="text-sm font-bold mb-2" style={{ color: item.style === 'highlight' ? ACCENT : TEXT_PRIMARY }}>
                    {item.label}
                  </div>
                  <p className="text-xs" style={{ color: TEXT_SECONDARY }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 pb-24">
          <div className="max-w-2xl mx-auto text-center p-10 rounded-2xl" style={{
            background: BG_CARD, border: `1px solid ${BORDER}`,
          }}>
            <Crown className="h-8 w-8 mx-auto mb-4" style={{ color: GOLD }} />
            <h2 className="text-2xl font-black mb-3" style={{ color: TEXT_PRIMARY }}>
              Ascend Without Limits
            </h2>
            <p className="text-sm mb-6" style={{ color: 'hsl(270 15% 50%)' }}>
              Upload any codebase. The Universal Scanner evaluates {poolSize} candidates
              across extended collision passes and selects the 40 primitives that produce the
              maximum compounding effect — no locked spine, no category restrictions, no ceiling.
            </p>
            <Button size="lg" className="border-0 font-bold" style={{ background: ACCENT, color: 'hsl(270 20% 4%)' }}
              onClick={() => navigate('/ascension')}>
              Enter Ultimate Ascension <Crown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>

      <EnhancedFooter />
    </>
  );
}
