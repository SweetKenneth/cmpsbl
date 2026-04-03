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
import { Shield, Cpu, ArrowRight, Globe, Layers, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { buildSSOVerticalUrl } from "@/lib/relay/sso/crossVerticalSSO";

const VERTICALS = [
  {
    id: 'security',
    name: 'CMPSBL CYBER™',
    tagline: 'Cognitive Security Infrastructure — Threats Die Here',
    url: 'https://security.cmpsbl.com',
    icon: Shield,
    accentColor: 'hsl(0 85% 55%)',
    primitiveCount: 16,
    capabilityCount: '130+',
    status: 'Active',
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
    status: 'Active',
  },
];

export default function VerticalPortal() {
  const { session } = useAuth();

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

                    <Button
                      className="w-full border-0 text-sm font-semibold"
                      style={{ background: v.accentColor, color: 'white' }}
                      onClick={() => handleVisitVertical(v.url)}
                    >
                      Visit {v.name.split('™')[0]}™ <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Coming soon */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">More verticals coming soon</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Health', 'Fintech', 'Legal', 'Gaming', 'Education'].map(v => (
                <span key={v} className="px-3 py-1 text-xs font-mono rounded-full border border-border/50 text-muted-foreground/50">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
