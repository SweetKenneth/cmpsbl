/**
 * Vertical Portal — Navigate Between CMPSBL® Vertical Substrates
 * 
 * Displayed at cmpsbl.com/verticals — lists all active verticals
 * with links to their homepages.
 *
 * © CMPSBL® — All rights reserved.
 */

import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Shield, Cpu, ArrowRight, Globe, Layers, ExternalLink, Heart, Scale, Gamepad2, GraduationCap, Banknote, Lock, Atom, Brain, Users, Crown, Clapperboard, Hexagon, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { isVerticalAccessible } from "@/components/gates/VerticalAccessGate";
import { buildSSOVerticalUrl } from "@/lib/relay/sso/crossVerticalSSO";
import { getDynamicPortalEntries, type VerticalPortalEntry } from "@/lib/factory/vertical-factory-engine";

/** Map icon names to Lucide components */
const ICON_MAP: Record<string, LucideIcon> = {
  Shield, Cpu, Heart, Scale, Gamepad2, GraduationCap, Banknote, Globe, Lock, Atom, Brain, Users, Crown, Clapperboard,
};

const STATIC_VERTICALS = [
  {
    id: 'prime',
    name: 'CMPSBL PRIME™',
    tagline: 'The Core 40 — Free Cognitive Infrastructure for Everyone',
    url: 'https://cmpsbl.com',
    icon: Hexagon,
    accentColor: 'hsl(210 15% 50%)',
    primitiveCount: 40,
    capabilityCount: '200+',
    status: 'Active' as const,
  },
  {
    id: 'security',
    name: 'CMPSBL CYBER™',
    tagline: 'Cognitive Security Infrastructure — Threats Die Here',
    url: 'https://security.cmpsbl.com',
    icon: Shield,
    accentColor: 'hsl(0 85% 55%)',
    primitiveCount: 16,
    capabilityCount: '130+',
    status: 'Active' as const,
  },
  {
    id: 'robotics',
    name: 'CMPSBL ROBOTICS™',
    tagline: 'Cognitive Robotics Infrastructure — Machines Think Here',
    url: 'https://robotics.cmpsbl.com',
    icon: Cpu,
    accentColor: 'hsl(200 100% 55%)',
    primitiveCount: 16,
    capabilityCount: '130+',
    status: 'Active' as const,
  },
  {
    id: 'quantum',
    name: 'CMPSBL QUANTUM™',
    tagline: 'Cognitive Quantum Infrastructure — Reality Bends Here',
    url: 'https://quantum.cmpsbl.com',
    icon: Atom,
    accentColor: 'hsl(270 90% 60%)',
    primitiveCount: 16,
    capabilityCount: '85+',
    status: 'Active' as const,
  },
  {
    id: 'llm',
    name: 'CMPSBL LLM™',
    tagline: 'Cognitive LLM Infrastructure — Models Break Here, Not in Production',
    url: 'https://llm.cmpsbl.com',
    icon: Brain,
    accentColor: 'hsl(160 90% 45%)',
    primitiveCount: 16,
    capabilityCount: '100+',
    status: 'Active' as const,
  },
  {
    id: 'agency',
    name: 'CMPSBL AGENCY™',
    tagline: 'Governed Autonomous Agent Infrastructure — Agents That Learn, Collaborate, and Ship',
    url: 'https://agency.cmpsbl.com',
    icon: Users,
    accentColor: 'hsl(35 90% 55%)',
    primitiveCount: 16,
    capabilityCount: '100+',
    status: 'Active' as const,
  },
  {
    id: 'media',
    name: 'CMPSBL MEDIA™',
    tagline: 'Cognitive Media Infrastructure — Content Creates Itself',
    url: 'https://media.cmpsbl.com',
    icon: Clapperboard,
    accentColor: 'hsl(330 85% 60%)',
    primitiveCount: 16,
    capabilityCount: '110+',
    status: 'Active' as const,
  },
  {
    id: 'fintech',
    name: 'CMPSBL FINTECH™',
    tagline: 'Cognitive Financial Infrastructure — Money Moves Smarter',
    url: 'https://fintech.cmpsbl.com',
    icon: Banknote,
    accentColor: 'hsl(152 80% 40%)',
    primitiveCount: 16,
    capabilityCount: '130+',
    status: 'Active' as const,
  },
  {
    id: 'healthcare',
    name: 'CMPSBL HEALTH™',
    tagline: 'Cognitive Healthcare Infrastructure — Patients First, Always',
    url: 'https://healthcare.cmpsbl.com',
    icon: Heart,
    accentColor: 'hsl(340 75% 55%)',
    primitiveCount: 16,
    capabilityCount: '100+',
    status: 'Coming Soon' as const,
  },
  {
    id: 'legal',
    name: 'CMPSBL LEGAL™',
    tagline: 'Cognitive Legal Infrastructure — Contracts Govern Themselves',
    url: 'https://legal.cmpsbl.com',
    icon: Scale,
    accentColor: 'hsl(220 60% 50%)',
    primitiveCount: 16,
    capabilityCount: '95+',
    status: 'Coming Soon' as const,
  },
  {
    id: 'gaming',
    name: 'CMPSBL GAMING™',
    tagline: 'Cognitive Gaming Infrastructure — Worlds Build Themselves',
    url: 'https://gaming.cmpsbl.com',
    icon: Gamepad2,
    accentColor: 'hsl(280 80% 55%)',
    primitiveCount: 16,
    capabilityCount: '100+',
    status: 'Coming Soon' as const,
  },
  {
    id: 'education',
    name: 'CMPSBL EDU™',
    tagline: 'Cognitive Education Infrastructure — Knowledge Compounds Here',
    url: 'https://education.cmpsbl.com',
    icon: GraduationCap,
    accentColor: 'hsl(45 90% 50%)',
    primitiveCount: 16,
    capabilityCount: '90+',
    status: 'Coming Soon' as const,
  },
  {
    id: 'ultimate',
    name: 'CMPSBL ULTIMATE™',
    tagline: '143-Primitive Pool · Dynamic Selection · No Spine Lock · Maximum Compounding',
    url: 'https://ultimate.cmpsbl.com',
    icon: Crown,
    accentColor: 'hsl(270 70% 50%)',
    primitiveCount: 40,
    capabilityCount: '143 pool',
    status: 'Active' as const,
  },
];

/** Merge static + dynamic verticals */
function useAllVerticals() {
  const dynamicEntries = getDynamicPortalEntries();
  const dynamicMapped = dynamicEntries.map(d => ({
    id: d.id,
    name: d.name,
    tagline: d.tagline,
    url: d.url,
    icon: ICON_MAP[d.iconName] ?? Globe,
    accentColor: d.accentColor,
    primitiveCount: d.primitiveCount,
    capabilityCount: d.capabilityCount,
    status: d.status,
  }));
  return [...STATIC_VERTICALS, ...dynamicMapped];
}

export default function VerticalPortal() {
  const { session } = useAuth();
  const { role, isGovernor } = useUserRole();
  const VERTICALS = useAllVerticals();

  const handleVisitVertical = (url: string) => {
    if (session?.access_token && session?.refresh_token) {
      const ssoUrl = buildSSOVerticalUrl(url, session.access_token, session.refresh_token);
      window.open(ssoUrl, '_blank');
    } else {
      window.open(url, '_blank');
    }
  };
  return (
    <>
      <Helmet>
        <title>Vertical Substrates — CMPSBL®</title>
        <meta name="description" content="Explore CMPSBL® vertical substrates — domain-specific cognitive infrastructure for cybersecurity, robotics, and more." />
      </Helmet>

      <PublicNav />

      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-muted/30 mb-6">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-mono tracking-wider text-muted-foreground">VERTICAL SUBSTRATES</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-foreground">
              Industry-Specific Intelligence
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Each vertical inherits the 24-primitive spine and hot-swaps 16 domain-specific
              Engines and Agents. Same architecture. Different capabilities.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            {VERTICALS.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl" style={{ background: `${v.accentColor}15` }}>
                        <v.icon className="h-6 w-6" style={{ color: v.accentColor }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{v.name}</h3>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{
                          background: `${v.accentColor}15`,
                          color: v.accentColor,
                        }}>
                          {v.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-6">{v.tagline}</p>
                    
                    <div className="flex gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-xl font-bold font-mono text-foreground">{v.primitiveCount}</div>
                        <div className="text-xs text-muted-foreground">Primitives</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold font-mono text-foreground">{v.capabilityCount}</div>
                        <div className="text-xs text-muted-foreground">Capabilities</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold font-mono text-foreground">80</div>
                        <div className="text-xs text-muted-foreground">Crown Jewels</div>
                      </div>
                    </div>

                    {v.status === 'Coming Soon' ? (
                      <Button
                        className="w-full text-sm font-semibold opacity-60 cursor-not-allowed"
                        variant="outline"
                        disabled
                      >
                        Coming Soon
                      </Button>
                    ) : (
                      <Button
                        className="w-full border-0 text-sm font-semibold"
                        style={{ background: v.accentColor, color: 'white' }}
                        onClick={() => handleVisitVertical(v.url)}
                      >
                        Visit {v.name.split('™')[0]}™ <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* All verticals are now listed above */}
        </div>
      </div>
      <EnhancedFooter />
    </>
  );
}
