/**
 * Vertical Substrate Home — Domain-specific landing page
 * 
 * Rendered when a user hits a vertical subdomain (e.g. security.cmpsbl.com).
 * Shows the vertical's identity, primitives, and entry points
 * (Ascension, Memory Stream, CLM) tuned for that domain.
 */

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Shield, Cpu, Activity, Zap, Lock, Eye, Server, Terminal, ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { resolveSubdomainVertical, type VerticalSubstrateConfig, type VerticalPrimitive } from "@/lib/factory/verticals";

const ENGINE_ICONS: Record<string, React.ElementType> = {
  // Cyber
  WATCHTOWER: Eye,
  SHADE: Shield,
  AEGIS: Shield,
  CIPHER: Lock,
  RECON: Activity,
  VANGUARD: Zap,
  BASTION: Server,
  TEMPEST: Terminal,
  // Robotics
  SERVO: Cpu,
  KINETIC: Zap,
  LIDAR: Eye,
  FABRICATOR: Server,
  FLUX: Activity,
  VECTOR: Layers,
  TENSOR: Cpu,
  CALIBER: Shield,
  GRIPPER: Terminal,
  SWARM: Layers,
  ENVIRON: Eye,
  GUARDIAN: Shield,
  CONDUCTOR: Zap,
  WELDER: Activity,
  INSPECTOR: Eye,
  PIONEER: Cpu,
  // Quantum
  HADRON: Zap,
  QUBIT: Cpu,
  ENTANGLE: Layers,
  SCALAR: Activity,
  PHASE: Eye,
  WAVE: Zap,
  SPIN: Cpu,
  MUON: Terminal,
  GRAVITON: Layers,
  TACHYON: Zap,
  PHOTON: Eye,
  LEPTON: Activity,
  QUARK: Cpu,
  BOSON: Zap,
  NEUTRINO: Shield,
};

interface VerticalSubstrateHomeProps {
  verticalKey: string;
}

export default function VerticalSubstrateHome({ verticalKey }: VerticalSubstrateHomeProps) {
  const navigate = useNavigate();
  const [substrate, setSubstrate] = useState<VerticalSubstrateConfig | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const config = resolveSubdomainVertical(window.location.hostname);
      setSubstrate(config);
    }
  }, [verticalKey]);

  /** Fallback for dev/preview where we aren't on the real subdomain */
  const displayName = substrate?.name ?? `CMPSBL ${verticalKey.toUpperCase()}™`;
  const tagline = substrate?.tagline ?? 'Vertical Cognitive Infrastructure';

  const engines = substrate?.primitives.filter(p => p.role === 'engine') ?? [];
  const agents = substrate?.primitives.filter(p => p.role === 'agent') ?? [];
  const totalCapabilities = substrate?.primitives.reduce((sum, p) => sum + p.capabilities.length, 0) ?? 0;

  return (
    <>
      <Helmet>
        <title>{`${displayName} | Cognitive Security Infrastructure`}</title>
        <meta name="description" content={tagline} />
      </Helmet>
      <StructuredData type="webApplication" data={{ name: displayName, description: tagline, url: `https://cmpsbl.com/vertical/${verticalKey}`, features: "40-Primitive Substrate, Persistent Memory, Governed Cognitive Infrastructure, Autonomous Evolution, Security Hardening" }} />

      <div className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
              VERTICAL SUBSTRATE · {verticalKey.toUpperCase()}
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">
              {displayName}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {tagline}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/ascension')}>
                <Shield className="mr-2 h-5 w-5" />
                Start Ascension
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/showroom')}>
                <Layers className="mr-2 h-5 w-5" />
                Browse Scanners
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
              <StatCard label="Primitives" value="40" />
              <StatCard label="Custom Engines" value={String(engines.length)} />
              <StatCard label="Custom Agents" value={String(agents.length)} />
              <StatCard label="Capabilities" value={String(totalCapabilities)} />
            </div>
          </div>
        </section>

        {/* Engines Grid */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold mb-2">Engines</h2>
          <p className="text-muted-foreground mb-8">
            8 domain-specific engines hot-swapped for {verticalKey} operations
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {engines.map((engine) => (
              <PrimitiveCard key={engine.id} primitive={engine} />
            ))}
          </div>
        </section>

        {/* Agents Grid */}
        <section className="max-w-6xl mx-auto px-4 py-16 border-t border-border">
          <h2 className="text-2xl font-bold mb-2">Agents</h2>
          <p className="text-muted-foreground mb-8">
            8 autonomous agents purpose-built for {verticalKey} intelligence and operations
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map((agent) => (
              <PrimitiveCard key={agent.id} primitive={agent} />
            ))}
          </div>
        </section>

        {/* Architecture Note */}
        <section className="max-w-6xl mx-auto px-4 py-16 border-t border-border">
          <div className="bg-muted/30 rounded-xl p-8 text-center">
            <Cpu className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Same Spine. Different Weapons.</h3>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Every vertical substrate inherits the 24-primitive Organ/Layer spine — 
              CORE, BRAIN, MEMORY, DEFENSE, GOVERNANCE, and the full compliance grid. 
              Only the Engines and Agents are hot-swapped for your domain.
            </p>
            <Button variant="outline" onClick={() => navigate('/explore')}>
              Explore Core Architecture <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
      <EnhancedFooter />
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function PrimitiveCard({ primitive }: { primitive: VerticalPrimitive }) {
  const Icon = ENGINE_ICONS[primitive.id] ?? Cpu;
  return (
    <Card className="bg-card/50 hover:bg-card/80 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">{primitive.name}</CardTitle>
        </div>
        <Badge variant="outline" className="w-fit text-xs capitalize">
          {primitive.classification}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{primitive.description}</p>
        <div className="flex flex-wrap gap-1">
          {primitive.capabilities.slice(0, 3).map((cap) => (
            <Badge key={cap} variant="secondary" className="text-xs">
              {cap.replace(/_/g, ' ')}
            </Badge>
          ))}
          {primitive.capabilities.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{primitive.capabilities.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
