/**
 * CMPSBL CYBER™ — Security Vertical Landing Page
 * 
 * Completely custom 2035-era enterprise cybersecurity theme.
 * Distinct visual identity from the main cmpsbl.com substrate.
 * 
 * © CMPSBL® — All rights reserved.
 */

import { useEffect, useRef, useState } from "react";
import { useSSORelay } from "@/hooks/useSSORelay";
import { Helmet } from "react-helmet-async";
import { StructuredData } from "@/components/seo/StructuredData";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield, Lock, Eye, Radar, Fingerprint, ScanLine, ShieldCheck,
  Terminal, Server, Activity, Zap, AlertTriangle, Network, Cpu,
  ArrowRight, ExternalLink, ChevronDown, Layers, Bug, Binary,
  Globe, FileWarning, KeyRound, Scan,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerticalReturnBanner } from "@/components/shared/VerticalReturnBanner";
import { Card, CardContent } from "@/components/ui/card";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import {
  resolveSubdomainVertical,
  type VerticalSubstrateConfig,
  type VerticalPrimitive,
} from "@/lib/factory/verticals";
import { useVerticalCounts } from "@/hooks/useDiscoveryCounts";

const ENGINE_DATA = [
  { id: "SENTINEL", name: "SENTINEL", desc: "Real-time threat detection & IOC correlation with behavioral heuristics and MITRE ATT&CK mapping", icon: Eye, color: "hsl(0 85% 60%)" },
  { id: "PHANTOM", name: "PHANTOM", desc: "Stealth operations for covert reconnaissance, silent data exfiltration detection, and lateral movement tracking", icon: ScanLine, color: "hsl(280 100% 65%)" },
  { id: "AEGIS", name: "AEGIS", desc: "Shield orchestration — DDoS mitigation, adaptive rate limiting, geo-blocking, and bot detection", icon: Shield, color: "hsl(185 100% 50%)" },
  { id: "CIPHER", name: "CIPHER", desc: "Cryptographic operations — key rotation, certificate management, PKI orchestration, quantum-resistant prep", icon: Lock, color: "hsl(145 80% 50%)" },
  { id: "RECON", name: "RECON", desc: "Attack surface mapping — port enumeration, service fingerprinting, vulnerability scanning, exposure scoring", icon: Radar, color: "hsl(38 100% 55%)" },
  { id: "VANGUARD", name: "VANGUARD", desc: "Incident response & digital forensics — containment, evidence preservation, root cause analysis, playbook execution", icon: Fingerprint, color: "hsl(210 100% 60%)" },
  { id: "BASTION", name: "BASTION", desc: "Zero-trust perimeter enforcement — micro-segmentation, least-privilege access, continuous verification", icon: Server, color: "hsl(310 100% 60%)" },
  { id: "TEMPEST", name: "TEMPEST", desc: "Chaos engineering & pen testing — attack scenario simulation, resilience validation, red team automation", icon: Zap, color: "hsl(45 100% 55%)" },
];

const AGENT_DATA = [
  { id: "WRAITH", name: "WRAITH", desc: "Silent threat hunter — autonomous APT detection across network segments with behavioral profiling" },
  { id: "OBSIDIAN", name: "OBSIDIAN", desc: "Deep analysis — correlates disparate security events into unified attack narratives with kill chain mapping" },
  { id: "SPECTER", name: "SPECTER", desc: "Deception agent — deploys honeypots, canary tokens, and decoy infrastructure to lure and profile attackers" },
  { id: "BLACKOUT", name: "BLACKOUT", desc: "Emergency isolation — kill-switch protocols for active breach containment and connection severing" },
  { id: "TRACER", name: "TRACER", desc: "Attack chain reconstruction — traces lateral movement paths, privilege escalation, and credential abuse" },
  { id: "NOCTURNE", name: "NOCTURNE", desc: "Dark web intelligence & OSINT — monitors underground forums, credential leaks, and threat actor comms" },
  { id: "IRONCLAD", name: "IRONCLAD", desc: "Compliance enforcement — continuous validation against SOC2, ISO 27001, NIST, and CIS benchmarks" },
  { id: "BULWARK", name: "BULWARK", desc: "Supply chain security — dependency auditing, SBOM generation, compromised package and typosquat detection" },
];

const CAPABILITIES_PREVIEW = [
  "IOC Correlation", "Behavioral Anomaly Detection", "MITRE ATT&CK Mapping",
  "Stealth Network Scanning", "DDoS Mitigation", "Zero-Trust Policy Enforcement",
  "Key Rotation & PKI", "Attack Surface Mapping", "Forensic Timeline Reconstruction",
  "APT Detection", "Kill Chain Mapping", "Honeypot Orchestration",
  "Emergency Breach Containment", "Dark Web Monitoring", "SOC2/NIST Validation",
  "Supply Chain Auditing", "Credential Leak Detection", "Red Team Automation",
];

/* ═══════════════════════════════════════════════════════════════ */
/* COMPONENT                                                     */
/* ═══════════════════════════════════════════════════════════════ */

export default function CyberSecurityHome() {
  useSSORelay();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { total, crownJewels } = useVerticalCounts('cyber');
  const THREAT_STATS = [
    { label: "Zero-Day Patterns Tracked", value: "2,847", icon: Bug },
    { label: "Threat Vectors Monitored", value: "16", icon: Radar },
    { label: "Custom Primitives", value: "16", icon: Cpu },
    { label: "Capabilities Loaded", value: String(total || '130+'), icon: Layers },
  ];
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <>
      <Helmet>
        <title>CMPSBL CYBER™ — Enterprise Cognitive Security Infrastructure</title>
        <meta name="description" content="16 purpose-built security primitives. 130+ capabilities. Zero-trust cognitive infrastructure for enterprise threat detection, forensics, and autonomous defense. Powered by CMPSBL®." />
        <meta name="keywords" content="cybersecurity, threat detection, zero-trust, CMPSBL, cognitive security, enterprise security, autonomous defense, security primitives" />
        <link rel="canonical" href="https://security.cmpsbl.com" />
        <meta property="og:title" content="CMPSBL CYBER™ — Cognitive Security Infrastructure" />
        <meta property="og:description" content="16 purpose-built security primitives. 130+ capabilities. Enterprise-grade autonomous defense powered by CMPSBL®." />
        <meta property="og:url" content="https://security.cmpsbl.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CMPSBL CYBER™" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CMPSBL CYBER™ — Cognitive Security Infrastructure" />
        <meta name="twitter:description" content="Enterprise cognitive security. 16 custom primitives. Autonomous threat detection." />
        {/* Parent attribution */}
        <meta name="author" content="CMPSBL® · PromptFluid™" />
        <link rel="dns-prefetch" href="https://cmpsbl.com" />
      </Helmet>
      <StructuredData
        type="webApplication"
        data={{
          name: "CMPSBL CYBER™",
          description: "Enterprise cognitive security infrastructure — 16 purpose-built security primitives, autonomous threat detection, and zero-trust defense.",
          url: "https://security.cmpsbl.com",
          features: "Threat Detection, Digital Forensics, Zero-Trust Architecture, Autonomous Defense, Security Primitives, Vulnerability Assessment",
        }}
      />


        {/* Return Banner */}
        <VerticalReturnBanner verticalName="CMPSBL CYBER™" accentColor="hsl(0 85% 60%)" />

        {/* ── NAV ── */}
        <PublicNav />

        {/* ── HERO ── */}
        <motion.section
          ref={heroRef}
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative overflow-hidden"
        >
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `
              linear-gradient(hsl(185 100% 50% / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(185 100% 50% / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }} />
          
          {/* Radial threat glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20" style={{
            background: "radial-gradient(circle, hsl(0 85% 50% / 0.15), hsl(280 100% 50% / 0.08), transparent 70%)",
          }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20 sm:pt-36 sm:pb-28">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              {/* Threat level indicator */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8" style={{
                borderColor: "hsl(0 85% 50% / 0.4)",
                background: "hsl(0 85% 50% / 0.08)",
              }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "hsl(0 85% 60%)" }} />
                <span className="text-xs font-mono tracking-wider uppercase" style={{ color: "hsl(0 85% 70%)" }}>
                  THREAT LEVEL: ADAPTIVE · 16 PRIMITIVES ACTIVE
                </span>
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-6" style={{
                background: "linear-gradient(135deg, hsl(185 100% 60%), hsl(0 0% 100%), hsl(0 85% 60%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.05,
              }}>
                CMPSBL CYBER<span style={{ WebkitTextFillColor: "hsl(0 85% 60%)" }}>™</span>
              </h1>

              <p className="text-lg sm:text-xl max-w-3xl mx-auto mb-4 font-light" style={{ color: "hsl(220 15% 65%)" }}>
                Enterprise cognitive security infrastructure. 16 purpose-built primitives.
                Autonomous threat detection, forensics, and zero-trust enforcement.
              </p>
              <p className="text-sm max-w-2xl mx-auto mb-10" style={{ color: "hsl(220 15% 45%)" }}>
                A vertical substrate of <a href="https://cmpsbl.com" className="underline hover:no-underline" style={{ color: "hsl(185 100% 50%)" }}>CMPSBL®</a> — 
                Governed Cognitive Infrastructure by PromptFluid™
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/ascension')}
                  className="h-12 px-8 text-sm font-semibold tracking-wide border-0"
                  style={{
                    background: "linear-gradient(135deg, hsl(0 85% 50%), hsl(0 70% 40%))",
                    color: "white",
                  }}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  START SECURITY AUDIT
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/showroom')}
                  className="h-12 px-8 text-sm font-semibold tracking-wide"
                  style={{
                    borderColor: "hsl(185 100% 50% / 0.3)",
                    color: "hsl(185 100% 60%)",
                    background: "hsl(185 100% 50% / 0.05)",
                  }}
                >
                  <Scan className="mr-2 h-4 w-4" />
                  BROWSE SCANNERS
                </Button>
              </div>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto"
            >
              {THREAT_STATS.map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-lg border" style={{
                  borderColor: "hsl(220 20% 15%)",
                  background: "hsl(220 25% 6%)",
                }}>
                  <stat.icon className="h-5 w-5 mx-auto mb-2" style={{ color: "hsl(185 100% 50%)" }} />
                  <div className="text-2xl font-bold font-mono" style={{ color: "hsl(0 0% 95%)" }}>{stat.value}</div>
                  <div className="text-xs mt-1" style={{ color: "hsl(220 15% 45%)" }}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom scan line */}
          <div className="h-px w-full" style={{
            background: "linear-gradient(90deg, transparent, hsl(0 85% 50% / 0.5), hsl(185 100% 50% / 0.5), transparent)",
          }} />
        </motion.section>

        {/* ── ENGINES GRID ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="text-center mb-12">
            <Badge className="mb-4 text-xs font-mono tracking-widest border" style={{
              borderColor: "hsl(0 85% 50% / 0.3)",
              background: "hsl(0 85% 50% / 0.08)",
              color: "hsl(0 85% 70%)",
            }}>
              8 SECURITY ENGINES
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Hot-Swapped for <span style={{ color: "hsl(0 85% 60%)" }}>Threat Operations</span>
            </h2>
            <p className="text-sm mt-3 max-w-xl mx-auto" style={{ color: "hsl(220 15% 50%)" }}>
              Each engine replaces a general-purpose CMPSBL primitive with domain-specific
              cybersecurity logic while maintaining the 24-primitive spine.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ENGINE_DATA.map((engine, i) => (
              <motion.div
                key={engine.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <Card className="h-full border transition-all duration-300 hover:scale-[1.02]" style={{
                  borderColor: "hsl(220 20% 14%)",
                  background: "hsl(220 25% 6%)",
                }}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg" style={{ background: `${engine.color}15` }}>
                        <engine.icon className="h-5 w-5" style={{ color: engine.color }} />
                      </div>
                      <div>
                        <div className="font-bold text-sm font-mono tracking-wide" style={{ color: "hsl(0 0% 92%)" }}>{engine.name}</div>
                        <div className="text-xs font-mono" style={{ color: "hsl(220 15% 40%)" }}>ENGINE</div>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "hsl(220 15% 55%)" }}>{engine.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── AGENTS GRID ── */}
        <section className="border-t border-b" style={{ borderColor: "hsl(220 20% 10%)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <div className="text-center mb-12">
              <Badge className="mb-4 text-xs font-mono tracking-widest border" style={{
                borderColor: "hsl(185 100% 50% / 0.3)",
                background: "hsl(185 100% 50% / 0.08)",
                color: "hsl(185 100% 60%)",
              }}>
                8 AUTONOMOUS AGENTS
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Autonomous <span style={{ color: "hsl(185 100% 55%)" }}>Defense Operations</span>
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {AGENT_DATA.map((agent, i) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="p-5 rounded-xl border" style={{
                    borderColor: "hsl(220 20% 12%)",
                    background: "hsl(220 25% 5%)",
                  }}
                >
                  <div className="font-bold text-sm font-mono tracking-wide mb-1" style={{ color: "hsl(0 0% 90%)" }}>
                    {agent.name}
                  </div>
                  <div className="text-xs font-mono mb-2" style={{ color: "hsl(185 100% 50% / 0.6)" }}>AGENT</div>
                  <p className="text-xs" style={{ color: "hsl(220 15% 50%)" }}>{agent.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CAPABILITIES PREVIEW ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              130+ Security <span style={{ color: "hsl(145 80% 55%)" }}>Capabilities</span>
            </h2>
            <p className="text-sm max-w-lg mx-auto" style={{ color: "hsl(220 15% 50%)" }}>
              Every capability is a discrete, testable security function — auto-discovered, 
              CJPI-scored, and deployable as a Convex Core™ artifact.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto">
            {CAPABILITIES_PREVIEW.map((cap) => (
              <span key={cap} className="px-3 py-1.5 rounded-md text-xs font-mono border" style={{
                borderColor: "hsl(220 20% 14%)",
                background: "hsl(220 25% 7%)",
                color: "hsl(220 15% 60%)",
              }}>
                {cap}
              </span>
            ))}
            <span className="px-3 py-1.5 rounded-md text-xs font-mono border" style={{
              borderColor: "hsl(185 100% 50% / 0.3)",
              background: "hsl(185 100% 50% / 0.08)",
              color: "hsl(185 100% 55%)",
            }}>
              +112 more
            </span>
          </div>
        </section>

        {/* ── ARCHITECTURE ── */}
        <section className="border-t" style={{ borderColor: "hsl(220 20% 10%)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
            <div className="p-8 sm:p-12 rounded-2xl border" style={{
              borderColor: "hsl(220 20% 12%)",
              background: "linear-gradient(135deg, hsl(220 25% 6%), hsl(220 30% 4%))",
            }}>
              <Network className="h-10 w-10 mx-auto mb-6" style={{ color: "hsl(185 100% 50%)" }} />
              <h3 className="text-2xl font-bold mb-3">Same Spine. Different Weapons.</h3>
              <p className="text-sm max-w-xl mx-auto mb-8" style={{ color: "hsl(220 15% 50%)" }}>
                CMPSBL CYBER™ inherits the 24-primitive Organ/Layer spine — CORE, BRAIN, MEMORY, 
                DEFENSE, GOVERNANCE, and the full compliance matrix. Only the Engines and Agents 
                are hot-swapped for cybersecurity operations.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://cmpsbl.com', '_blank')}
                  className="text-xs"
                  style={{
                    borderColor: "hsl(220 20% 20%)",
                    color: "hsl(220 15% 60%)",
                  }}
                >
                  Explore Core Architecture <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/ascension')}
                  className="text-xs"
                  style={{
                    borderColor: "hsl(0 85% 50% / 0.3)",
                    color: "hsl(0 85% 65%)",
                  }}
                >
                  Run Security Diagnostic <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <EnhancedFooter />

        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "CMPSBL CYBER™",
          "url": "https://security.cmpsbl.com",
          "description": "Enterprise cognitive security infrastructure by CMPSBL®",
          "publisher": {
            "@type": "Organization",
            "name": "CMPSBL®",
            "url": "https://cmpsbl.com",
            "parentOrganization": {
              "@type": "Organization",
              "name": "PromptFluid™",
              "url": "https://promptfluid.com",
            },
          },
          "isPartOf": {
            "@type": "WebSite",
            "name": "CMPSBL®",
            "url": "https://cmpsbl.com",
          },
        })}} />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* CYBER NAV                                                      */
/* ═══════════════════════════════════════════════════════════════ */

