/**
 * CMPSBL QUANTUM™ — Quantum Physics Vertical Landing Page
 *
 * Deep purple/cyan theme. Quantum-physics aesthetic.
 * Distinct visual identity for quantum.cmpsbl.com.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useSSORelay } from "@/hooks/useSSORelay";
import { Helmet } from "react-helmet-async";
import { StructuredData } from "@/components/seo/StructuredData";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Atom, Zap, Waves, Sparkles, ArrowRight, Layers, Activity,
  CircuitBoard, Orbit, Aperture, Flame, Snowflake, Radio,
  Radar, Binary, Sigma, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { VerticalReturnBanner } from "@/components/shared/VerticalReturnBanner";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { useVerticalCounts } from "@/hooks/useDiscoveryCounts";

const ENGINE_DATA = [
  { id: "HADRON", name: "HADRON", desc: "Particle collision simulation — Monte Carlo integration, Feynman diagram evaluation, jet clustering", icon: Atom, color: "hsl(270 90% 60%)" },
  { id: "QUBIT", name: "QUBIT", desc: "Quantum gate orchestration — circuit optimization, noise modeling, error correction codes", icon: Binary, color: "hsl(200 100% 55%)" },
  { id: "PHOTON", name: "PHOTON", desc: "Optical computing — interferometry, beam splitting, squeezed state generation", icon: Sparkles, color: "hsl(50 100% 60%)" },
  { id: "FERMION", name: "FERMION", desc: "Many-body state evolution — Schrödinger solver, density matrices, Hartree-Fock", icon: Sigma, color: "hsl(330 80% 60%)" },
  { id: "ENTANGLE", name: "ENTANGLE", desc: "Entanglement management — Bell states, quantum teleportation, EPR pair distribution", icon: Orbit, color: "hsl(180 100% 50%)" },
  { id: "LATTICE", name: "LATTICE", desc: "Crystal structure simulation — band structure, phonon dispersion, superconductor pairing", icon: Aperture, color: "hsl(140 70% 50%)" },
  { id: "PLASMA", name: "PLASMA", desc: "Plasma dynamics — MHD simulation, tokamak confinement, fusion kinetics", icon: Flame, color: "hsl(15 90% 55%)" },
  { id: "CRYOGEN", name: "CRYOGEN", desc: "Cryogenic modeling — dilution fridge sim, decoherence mitigation, thermal budgets", icon: Snowflake, color: "hsl(200 60% 70%)" },
];

const AGENT_DATA = [
  { id: "MUON", name: "MUON", desc: "Decay chain analysis — lepton tracking, lifetime measurement, flavor tagging" },
  { id: "BOSON", name: "BOSON", desc: "Force carrier simulation — gauge field mapping, Higgs coupling, resonance detection" },
  { id: "NEUTRINO", name: "NEUTRINO", desc: "Weak interaction modeling — flavor oscillation, mass-mixing matrices" },
  { id: "GLUON", name: "GLUON", desc: "Strong force coupling — QCD color charge, asymptotic freedom, parton distributions" },
  { id: "GRAVITON", name: "GRAVITON", desc: "Gravitational wave detection — metric perturbation, geodesic computation, binary merger sim" },
  { id: "TACHYON", name: "TACHYON", desc: "Superluminal signal modeling — causality analysis, Lorentz violation bounds" },
  { id: "MESON", name: "MESON", desc: "Quark confinement — hadronization, fragmentation functions, string breaking" },
  { id: "PRISM", name: "PRISM", desc: "Spectroscopy analysis — emission line ID, Raman spectroscopy, Doppler shift" },
];

const CROWN_JEWEL_HIGHLIGHTS = [
  "Quantum Circuit Transpiler",
  "Particle Decay Reconstructor",
  "Entanglement Fidelity Analyzer",
  "Fusion Plasma Stabilizer",
  "Gravitational Wave Template Matcher",
];

export default function QuantumHome() {
  useSSORelay();
  const navigate = useNavigate();
  const { total, crownJewels } = useVerticalCounts('quantum');
  const Q_STATS = [
    { label: "Quantum Algorithms Loaded", value: "860", icon: Atom },
    { label: "Entanglement Channels", value: "16", icon: Orbit },
    { label: "Custom Primitives", value: "16", icon: CircuitBoard },
    { label: "Capabilities Active", value: String(total || '85+'), icon: Layers },
  ];

  return (
    <>
      <Helmet>
        <title>CMPSBL QUANTUM™ — Cognitive Quantum Infrastructure</title>
        <meta name="description" content="CMPSBL QUANTUM™ — 16 specialized quantum physics primitives for particle simulation, quantum computing, and spectroscopy software. Reality Bends Here." />
        <link rel="canonical" href="https://quantum.cmpsbl.com" />
        <meta property="og:title" content="CMPSBL QUANTUM™ — Cognitive Quantum Infrastructure" />
        <meta property="og:description" content="16 specialized quantum physics primitives for particle simulation, quantum computing, and spectroscopy." />
        <meta property="og:url" content="https://quantum.cmpsbl.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CMPSBL" />
      </Helmet>
      <StructuredData type="webApplication" data={{ name: "CMPSBL QUANTUM™", description: "Cognitive quantum infrastructure — 16 specialized primitives for particle simulation, quantum computing, and spectroscopy software.", url: "https://quantum.cmpsbl.com", features: "Particle Simulation, Quantum Computing, Spectroscopy, Quantum Entanglement, Wave Function Analysis, Quantum Error Correction" }} />

      <VerticalReturnBanner verticalName="CMPSBL QUANTUM™" accentColor="hsl(270 90% 60%)" />
      <PublicNav />

      <div className="min-h-screen" style={{ background: 'hsl(260 30% 4%)' }}>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 sm:px-6 pt-20 pb-24">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, hsl(270 90% 20% / 0.4), transparent)',
          }} />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-6 border-0 px-3 py-1 text-xs font-mono tracking-wider" style={{
                background: 'hsl(270 90% 60% / 0.15)',
                color: 'hsl(270 90% 70%)',
              }}>
                QUANTUM SUBSTRATE · ACTIVE
              </Badge>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4" style={{ color: 'hsl(260 10% 95%)' }}>
                CMPSBL <span style={{ color: 'hsl(270 90% 60%)' }}>QUANTUM</span>™
              </h1>

              <p className="text-lg sm:text-xl mb-2 font-semibold" style={{ color: 'hsl(180 100% 50%)' }}>
                Reality Bends Here
              </p>

              <p className="text-sm sm:text-base max-w-2xl mx-auto mb-10" style={{ color: 'hsl(260 15% 55%)' }}>
                16 purpose-built quantum physics primitives for particle simulation, quantum circuit design,
                entanglement management, and spectroscopy — powered by the 40-Primitive cognitive matrix.
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button size="lg" className="border-0 font-bold" style={{ background: 'hsl(270 90% 60%)', color: 'white' }}
                  onClick={() => navigate('/explore')}>
                  Explore Capabilities <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="font-bold" style={{
                  borderColor: 'hsl(260 20% 20%)', color: 'hsl(260 10% 70%)',
                  background: 'hsl(260 25% 8%)',
                }} onClick={() => navigate('/ascension-v2')}>
                  Ascension Lab
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 sm:px-6 pb-16">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Q_STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="text-center p-4 rounded-xl" style={{ background: 'hsl(260 25% 8%)', border: '1px solid hsl(260 20% 15%)' }}>
                <s.icon className="h-5 w-5 mx-auto mb-2" style={{ color: 'hsl(270 90% 60%)' }} />
                <div className="text-xl font-bold font-mono" style={{ color: 'hsl(260 10% 90%)' }}>{s.value}</div>
                <div className="text-xs" style={{ color: 'hsl(260 15% 45%)' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Engines */}
        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: 'hsl(260 10% 90%)' }}>
              Quantum Engines
            </h2>
            <p className="text-sm mb-8" style={{ color: 'hsl(260 15% 45%)' }}>
              8 specialized engines that replace the standard substrate engines for quantum physics software
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {ENGINE_DATA.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <Card className="border" style={{ background: 'hsl(260 25% 7%)', borderColor: 'hsl(260 20% 15%)' }}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg" style={{ background: `${e.color}15` }}>
                          <e.icon className="h-5 w-5" style={{ color: e.color }} />
                        </div>
                        <span className="font-mono font-bold text-sm" style={{ color: 'hsl(260 10% 90%)' }}>{e.name}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'hsl(260 15% 50%)' }}>{e.desc}</p>
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
            <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: 'hsl(260 10% 90%)' }}>
              Quantum Agents
            </h2>
            <p className="text-sm mb-8" style={{ color: 'hsl(260 15% 45%)' }}>
              8 policy-governed AI workers purpose-built for quantum physics research and simulation
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {AGENT_DATA.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <Card className="h-full border" style={{ background: 'hsl(260 25% 7%)', borderColor: 'hsl(260 20% 15%)' }}>
                    <CardContent className="p-4">
                      <div className="font-mono font-bold text-xs mb-1" style={{ color: 'hsl(180 100% 50%)' }}>{a.name}</div>
                      <p className="text-xs leading-relaxed" style={{ color: 'hsl(260 15% 50%)' }}>{a.desc}</p>
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
            <h2 className="text-2xl font-black mb-6" style={{ color: 'hsl(260 10% 90%)' }}>
              Crown Jewel Highlights
            </h2>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {CROWN_JEWEL_HIGHLIGHTS.map(j => (
                <Badge key={j} className="border-0 text-xs font-mono" style={{
                  background: 'hsl(270 90% 60% / 0.1)', color: 'hsl(270 90% 70%)',
                }}>
                  {j}
                </Badge>
              ))}
            </div>
            <p className="text-sm" style={{ color: 'hsl(260 15% 45%)' }}>
              80 S-Tier Crown Jewels · 5 per custom primitive · Zero external AI
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 pb-24">
          <div className="max-w-2xl mx-auto text-center p-10 rounded-2xl" style={{
            background: 'hsl(260 25% 8%)', border: '1px solid hsl(260 20% 15%)',
          }}>
            <h2 className="text-2xl font-black mb-3" style={{ color: 'hsl(260 10% 90%)' }}>
              Upgrade Quantum Software
            </h2>
            <p className="text-sm mb-6" style={{ color: 'hsl(260 15% 50%)' }}>
              Upload any quantum physics code to the Ascension Lab. The 40-Primitive matrix
              discovers capabilities and restores software to a higher cognitive tier.
            </p>
            <Button size="lg" className="border-0 font-bold" style={{ background: 'hsl(270 90% 60%)', color: 'white' }}
              onClick={() => navigate('/ascension-v2')}>
              Enter Ascension Lab <Zap className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>

      <EnhancedFooter />
    </>
  );
}
